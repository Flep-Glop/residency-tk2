import React, { useState, useEffect, useRef } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Select,
  FormErrorMessage,
  Heading,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Grid,
  GridItem,
  Text,
  Textarea,
  useToast,
  Card,
  CardBody,
  IconButton,
  HStack,
  List,
  ListItem,
  Checkbox,
  Alert,
  AlertIcon,
  Badge,
  Tooltip,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Flex,
} from '@chakra-ui/react';
import { getLesionRegions, getModalities, getRegistrationMethods, generateFusionWriteup } from '../../services/fusionService';

const FusionForm = () => {
  const [lesionRegions, setLesionRegions] = useState({});
  const [modalities, setModalities] = useState([]);
  const [registrationMethods, setRegistrationMethods] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [writeup, setWriteup] = useState('');
  const toast = useToast();
  const [physicians, setPhysicians] = useState(['Dalwadi', 'Galvan', 'Ha', 'Kluwe', 'Le', 'Lewis', 'Newman']);
  const [physicists, setPhysicists] = useState(['Bassiri', 'Kirby', 'Papanikolaou', 'Paschal', 'Rasmussen']);
  const [selectedSecondaryModality, setSelectedSecondaryModality] = useState('');
  const initialLoadRef = useRef(true);
  const [isCustomLesion, setIsCustomLesion] = useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [indexToRemove, setIndexToRemove] = useState(null);
  const cancelRef = useRef();
  const [isBladderFillingStudy, setIsBladderFillingStudy] = useState(false);
  
  // Fixed dark theme colors for consistency
  const formBg = 'gray.800';
  const writeupBg = 'gray.800';
  const borderColor = 'gray.600';

  const { register, handleSubmit, control, watch, formState: { errors }, setValue, reset } = useForm({
    defaultValues: {
      common_info: {
        physician: { name: '', role: 'physician' },
        physicist: { name: '', role: 'physicist' },
        patient: { age: '', sex: 'male' }
      },
      fusion_data: {
        lesion: '',
        custom_lesion: '',
        anatomical_region: '',
        registrations: [],
        is_bladder_filling_study: false
      }
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'fusion_data.registrations'
  });

  const selectedLesion = watch('fusion_data.lesion');
  const watchedRegistrations = watch('fusion_data.registrations');
  const hasMriRegistration = watchedRegistrations?.some(reg => reg.secondary === 'MRI');
  const hasPetRegistration = watchedRegistrations?.some(reg => reg.secondary === 'PET/CT');

  // Load initial data
  useEffect(() => {
    const fetchInitialData = async () => {
      setInitialLoading(true);
      try {
        const [lesionRegionsData, modalitiesData, methodsData] = await Promise.all([
          getLesionRegions(),
          getModalities(),
          getRegistrationMethods()
        ]);
        
        setLesionRegions(lesionRegionsData);
        setModalities(modalitiesData);
        setRegistrationMethods(methodsData);
      } catch (error) {
        toast({
          title: 'Error loading data',
          description: error.message,
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setInitialLoading(false);
      }
    };

    fetchInitialData();
  }, [toast]);

  // Set initial secondary modality after modalities are loaded
  useEffect(() => {
    if (modalities.length > 0 && initialLoadRef.current) {
      initialLoadRef.current = false;
      setSelectedSecondaryModality(modalities[0]);
    }
  }, [modalities]);

  // Update anatomical region when lesion changes
  useEffect(() => {
    if (selectedLesion && !isCustomLesion && lesionRegions[selectedLesion]) {
      setValue('fusion_data.anatomical_region', lesionRegions[selectedLesion]);
    }
  }, [selectedLesion, lesionRegions, setValue, isCustomLesion]);

  const onSubmit = async (data) => {
    // Validate that we have at least one registration (unless it's a bladder filling study)
    if (!data.fusion_data.is_bladder_filling_study && data.fusion_data.registrations.length === 0) {
      toast({
        title: 'Validation Error',
        description: 'At least one registration is required for multimodality fusion',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    setLoading(true);
    try {
      const result = await generateFusionWriteup(data);
      
      // Format the writeup in the approved style if needed
      const formattedWriteup = formatWriteup(result.writeup, data);
      setWriteup(formattedWriteup);
      
      toast({
        title: 'Write-up generated successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error generating write-up',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  // Format the writeup in the approved style
  const formatWriteup = (originalWriteup, formData) => {
    // If this is a bladder filling study, return the backend writeup unchanged
    if (formData.fusion_data.is_bladder_filling_study) {
      return originalWriteup;
    }
    
    // For regular multimodality fusion, format it here
    
    const physician = formData.common_info.physician.name;
    const physicist = formData.common_info.physicist.name;
    const patientAge = formData.common_info.patient.age;
    const patientSex = formData.common_info.patient.sex;
    const lesion = isCustomLesion ? formData.fusion_data.custom_lesion : formData.fusion_data.lesion;
    const anatomicalRegion = formData.fusion_data.anatomical_region;
    
    // Group registrations by modality
    const mriRegistrations = formData.fusion_data.registrations.filter(reg => reg.secondary.includes('MRI'));
    const petCtRegistrations = formData.fusion_data.registrations.filter(reg => reg.secondary.includes('PET'));
    const ctRegistrations = formData.fusion_data.registrations.filter(reg => reg.secondary === 'CT');
    
    // Calculate total registrations early for use throughout the function
    const totalRegistrations = mriRegistrations.length + petCtRegistrations.length + ctRegistrations.length;
    
    // Convert numbers to words for counts
    const numberToWord = (num) => {
      const words = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];
      return words[num] || num.toString();
    };
    
    const mriCount = numberToWord(mriRegistrations.length);
    const petCtCount = numberToWord(petCtRegistrations.length);
    const ctCount = numberToWord(ctRegistrations.length);
    
    // Create paragraphs in the new format
    const intro = `Dr. ${physician} requested a medical physics consultation for --- to perform a multimodality image fusion. The patient is a ${patientAge}-year-old ${patientSex} with a ${lesion} lesion. The patient was scanned in our CT simulator in the treatment position. The CT study was then exported to the Velocity imaging registration software.`;
    
    // Only include modalities that are actually present
    let importText = '';
    const modalitiesList = [];
    
    if (mriRegistrations.length > 0) {
      modalitiesList.push(`${mriCount} MRI${mriRegistrations.length > 1 ? 's' : ''}`);
    }
    
    if (petCtRegistrations.length > 0) {
      modalitiesList.push(`${petCtCount} PET/CT${petCtRegistrations.length > 1 ? 's' : ''}`);
    }
    
    if (ctRegistrations.length > 0) {
      modalitiesList.push(`${ctCount} CT${ctRegistrations.length > 1 ? 's' : ''}`);
    }
    
    if (modalitiesList.length === 0) {
      importText = 'Image studies were imported into the Velocity software. Fusion studies were created between the planning CT and each of the other modality image sets.';
    } else if (modalitiesList.length === 1) {
      const singleModality = modalitiesList[0];
      const isPlural = singleModality.includes('MRIs') || singleModality.includes('PET/CTs') || singleModality.includes('CTs');
      
      if (isPlural) {
        // Handle plural case with better flow (e.g., "two MRIs", "three PET/CTs", "two CTs")
        let modalityType;
        if (singleModality.includes('MRI')) {
          modalityType = 'MRI studies';
        } else if (singleModality.includes('PET/CT')) {
          modalityType = 'PET/CT studies';
        } else if (singleModality.includes('CT')) {
          modalityType = 'CT studies';
        }
        const count = singleModality.split(' ')[0]; // Extract "two", "three", etc.
        importText = `${count.charAt(0).toUpperCase() + count.slice(1)} ${modalityType} were imported into the Velocity software. Fusion studies were created between the planning CT and the imported image sets.`;
      } else {
        // Handle singular case with better flow
        let modalityType;
        if (singleModality.includes('MRI')) {
          modalityType = 'MRI study';
        } else if (singleModality.includes('PET/CT')) {
          modalityType = 'PET/CT study';
        } else if (singleModality.includes('CT')) {
          modalityType = 'CT study';
        }
        const article = modalityType.startsWith('MRI') ? 'An' : 'A';
        importText = `${article} ${modalityType} was imported into the Velocity software. A fusion study was created between the planning CT and the imported image set.`;
      }
    } else {
      // Handle multiple different modality types
      const formattedModalities = modalitiesList.map(modality => {
        if (modality.includes('MRI')) {
          if (modality.startsWith('one')) {
            return modality.replace(/one MRIs?/, 'one MRI study');
          } else {
            return modality.replace(/MRIs?/, 'MRI studies').replace('MRI studies studies', 'MRI studies');
          }
        } else if (modality.includes('PET/CT')) {
          if (modality.startsWith('one')) {
            return modality.replace(/one PET\/CTs?/, 'one PET/CT study');
          } else {
            return modality.replace(/PET\/CTs?/, 'PET/CT studies').replace('PET/CT studies studies', 'PET/CT studies');
          }
        } else if (modality.includes('CT')) {
          if (modality.startsWith('one')) {
            return modality.replace(/one CTs?/, 'one CT study');
          } else {
            return modality.replace(/CTs?/, 'CT studies').replace('CT studies studies', 'CT studies');
          }
        }
        return modality;
      });
      importText = `Multiple image studies including ${formattedModalities.join(' and ')} were imported into the Velocity software. Fusion studies were created between the planning CT and each of the imported image sets.`;
    }
    
    // MRI paragraph with "refined manually" - only include if MRI registrations exist
    const mriParagraph = mriRegistrations.length > 0 ? 
      `The CT and MRI image sets were initially aligned using a rigid registration algorithm based on the ${anatomicalRegion} anatomy, then refined manually. The resulting ${mriRegistrations.length === 1 ? 'fusion was' : 'fusions were'} verified for accuracy using anatomical landmarks such as the ${lesion}.` : '';
    
    // PET/CT paragraph with registration method based on actual data - only include if PET registrations exist
    const petCtParagraph = petCtRegistrations.length > 0 ? (() => {
      // Check if any PET/CT registrations use deformable method
      const hasDeformablePet = petCtRegistrations.some(reg => reg.method && reg.method.toLowerCase() !== 'rigid');
      
      let petText;
      if (hasDeformablePet) {
        petText = `The CT and PET/CT image sets were aligned using a rigid registration algorithm followed by deformable image registration to enhance the results.`;
      } else {
        petText = `The CT and PET/CT image sets were initially aligned using a rigid registration algorithm based on the ${anatomicalRegion} anatomy, then refined manually.`;
      }
      
      petText += ` The accuracy of ${totalRegistrations === 1 ? 'this fusion was' : 'these fusions were'} validated using anatomical structures such as the ${lesion}.`;
      
      if (hasDeformablePet) {
        petText += ` The fused images were subsequently used to improve the identification of critical structures and targets and to accurately contour them for treatment planning.`;
      }
      
      return petText;
    })() : '';
    
    // CT paragraph with registration method based on actual data - only include if CT registrations exist
    const ctParagraph = ctRegistrations.length > 0 ? (() => {
      // Check if any CT registrations use deformable method
      const hasDeformableCt = ctRegistrations.some(reg => reg.method && reg.method.toLowerCase() !== 'rigid');
      
      let ctText;
      if (hasDeformableCt) {
        ctText = `The planning CT and imported CT image sets were aligned using a rigid registration algorithm followed by deformable image registration to enhance the results.`;
      } else {
        ctText = `The planning CT and imported CT image sets were initially aligned using a rigid registration algorithm based on the ${anatomicalRegion} anatomy, then refined manually.`;
      }
      
      ctText += ` The accuracy of ${totalRegistrations === 1 ? 'this fusion was' : 'these fusions were'} validated using anatomical structures such as the ${lesion}.`;
      
      if (hasDeformableCt) {
        ctText += ` The fused images were subsequently used to improve the identification of critical structures and targets and to accurately contour them for treatment planning.`;
      }
      
      return ctText;
    })() : '';
    
    // Adjust conclusion text based on number of registrations
    const conclusionText = totalRegistrations === 1 ? 
      `The fusion for the image sets was reviewed and approved by both the prescribing radiation oncologist, Dr. ${physician}, and the medical physicist, Dr. ${physicist}.` :
      `The fusions for all image sets were reviewed and approved by both the prescribing radiation oncologist, Dr. ${physician}, and the medical physicist, Dr. ${physicist}.`;
    
    // Combine all paragraphs with appropriate spacing
    const paragraphs = [intro, importText, mriParagraph, petCtParagraph, ctParagraph, conclusionText].filter(p => p !== '');
    return paragraphs.join('\n\n');
  };

  const addRegistration = () => {
    const secondary = document.getElementById('new-secondary').value;
    // Auto-set method to 'rigid' if secondary is MRI
    let method;
    if (secondary === 'MRI') {
      method = 'rigid';
    } else {
      const methodSelect = document.getElementById('new-method');
      method = methodSelect ? methodSelect.value : registrationMethods[0];
      // Ensure method is never empty
      if (!method && registrationMethods.length > 0) {
        method = registrationMethods[0];
      }
    }
    
    if (!method) {
      toast({
        title: 'Error',
        description: 'Unable to determine registration method',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    append({ primary: 'CT', secondary, method });
    
    toast({
      title: 'Registration added',
      description: `CT to ${secondary} using ${method} registration`,
      status: 'success',
      duration: 2000,
      isClosable: true,
    });
  };

  const confirmRemoveRegistration = (index) => {
    setIndexToRemove(index);
    setIsDeleteAlertOpen(true);
  };

  const handleRemoveRegistration = () => {
    remove(indexToRemove);
    setIsDeleteAlertOpen(false);
    
    toast({
      title: 'Registration removed',
      status: 'info',
      duration: 2000,
      isClosable: true,
    });
  };

  const handleSecondaryModalityChange = (e) => {
    const selectedValue = e.target.value;
    setSelectedSecondaryModality(selectedValue);
    
    // Auto-set method to 'rigid' if MRI is selected
    const methodSelect = document.getElementById('new-method');
    if (selectedValue === 'MRI') {
      if (methodSelect) {
        methodSelect.value = 'rigid';
      }
    } else if (methodSelect && registrationMethods.length > 0) {
      // Ensure a method is always selected for non-MRI modalities
      methodSelect.value = methodSelect.value || registrationMethods[0];
    }
  };

  const handleCustomLesionChange = (e) => {
    setIsCustomLesion(e.target.checked);
    if (e.target.checked) {
      setValue('fusion_data.lesion', '');
      setValue('fusion_data.anatomical_region', '');
    } else {
      setValue('fusion_data.custom_lesion', '');
    }
  };

  const handleBladderFillingToggle = (e) => {
    const isChecked = e.target.checked;
    setIsBladderFillingStudy(isChecked);
    setValue('fusion_data.is_bladder_filling_study', isChecked);
    
    if (isChecked) {
      // Pre-fill with defaults for bladder filling studies
      setValue('fusion_data.anatomical_region', 'pelvic');
      // Clear registrations since bladder filling doesn't use the registration system
      setValue('fusion_data.registrations', []);
    }
  };

  const handleResetForm = () => {
    reset({
      common_info: {
        physician: { name: '', role: 'physician' },
        physicist: { name: '', role: 'physicist' },
        patient: { age: '', sex: 'male' }
      },
      fusion_data: {
        lesion: '',
        custom_lesion: '',
        anatomical_region: '',
        registrations: [],
        is_bladder_filling_study: false
      }
    });
    setWriteup('');
    setIsCustomLesion(false);
    setIsBladderFillingStudy(false);
    
    toast({
      title: 'Form reset',
      status: 'info',
      duration: 2000,
      isClosable: true,
    });
  };

  if (initialLoading) {
    return (
      <Box bg="gray.900" minH="100vh" textAlign="center" p={5}>
        <Text fontSize="lg" mb={2} color="white">Loading fusion form data...</Text>
        <Text fontSize="sm" color="gray.400">Please wait while we initialize the form</Text>
      </Box>
    );
  }

  return (
    <Box bg="gray.900" minH="100vh">
      {/* Header */}
      <Box bg="green.900" color="white" p={6} mb={6} borderRadius="lg" border="1px" borderColor="green.700">
        <Flex justify="space-between" align="center" flexWrap="wrap" gap={4}>
          <Box>
            <Heading size="xl" mb={2}>📝 Fusion Write-up Generator</Heading>
            <Text opacity={0.9}>Generate standardized write-ups for multimodality image fusions and bladder filling studies</Text>
          </Box>
        </Flex>
      </Box>

      {/* Main Content */}
      <Box px={6}>
        <Box maxW="1200px" mx="auto">
          <form onSubmit={handleSubmit(onSubmit)}>
            <Grid 
              templateColumns={{
                base: "1fr",
                md: "repeat(2, 1fr)",
                lg: "repeat(3, 1fr)"
              }} 
              gap={4} 
              mb={6}
            >
              {/* Staff & Patient Section */}
              <GridItem 
                as={Box} 
                p={4} 
                borderWidth="1px" 
                borderRadius="md" 
                bg={formBg}
                borderColor={borderColor}
                boxShadow="sm"
              >
                <Heading size="sm" mb={3} textAlign="center" color="white">Staff & Patient</Heading>
                
                <Box>
                  <Heading size="xs" mb={2} color="gray.300">Staff Information</Heading>
                  
                  <FormControl isInvalid={errors.common_info?.physician?.name} mb={3}>
                    <FormLabel fontSize="sm" color="gray.300">Physician Name</FormLabel>
                    <Select 
                      size="sm"
                      {...register("common_info.physician.name", { 
                        required: "Physician name is required" 
                      })}
                      aria-label="Select physician"
                      bg="gray.700"
                      borderColor="gray.600"
                      color="white"
                      _hover={{ borderColor: "gray.500" }}
                      data-theme="dark"
                      sx={{
                        '& option': {
                          backgroundColor: 'gray.700',
                          color: 'white',
                        }
                      }}
                    >
                      <option value="" style={{ backgroundColor: '#2D3748', color: 'white' }}>Select a physician</option>
                      {physicians.map(physician => (
                        <option key={physician} value={physician} style={{ backgroundColor: '#2D3748', color: 'white' }}>{physician}</option>
                      ))}
                    </Select>
                    <FormErrorMessage>
                      {errors.common_info?.physician?.name?.message}
                    </FormErrorMessage>
                  </FormControl>
                  
                  <FormControl isInvalid={errors.common_info?.physicist?.name} mb={3}>
                    <FormLabel fontSize="sm" color="gray.300">Physicist Name</FormLabel>
                    <Select 
                      size="sm"
                      {...register("common_info.physicist.name", { 
                        required: "Physicist name is required" 
                      })}
                      aria-label="Select physicist"
                      bg="gray.700"
                      borderColor="gray.600"
                      color="white"
                      _hover={{ borderColor: "gray.500" }}
                      data-theme="dark"
                      sx={{
                        '& option': {
                          backgroundColor: 'gray.700',
                          color: 'white',
                        }
                      }}
                    >
                      <option value="" style={{ backgroundColor: '#2D3748', color: 'white' }}>Select a physicist</option>
                      {physicists.map(physicist => (
                        <option key={physicist} value={physicist} style={{ backgroundColor: '#2D3748', color: 'white' }}>{physicist}</option>
                      ))}
                    </Select>
                    <FormErrorMessage>
                      {errors.common_info?.physicist?.name?.message}
                    </FormErrorMessage>
                  </FormControl>
                </Box>
                
                <Box mt={4}>
                  <Heading size="xs" mb={2} color="gray.300">Patient Information</Heading>
                  
                  <FormControl isInvalid={errors.common_info?.patient?.age} mb={3}>
                    <FormLabel fontSize="sm" color="gray.300">Patient Age</FormLabel>
                    <Input 
                      size="sm"
                      type="number"
                      {...register("common_info.patient.age", { 
                        required: "Age is required",
                        min: { value: 1, message: "Age must be at least 1" },
                        max: { value: 120, message: "Age must be less than 120" },
                        pattern: {
                          value: /^[0-9]+$/,
                          message: "Age must be a whole number"
                        }
                      })}
                      aria-label="Patient age"
                      placeholder="Enter patient age"
                      bg="gray.700"
                      borderColor="gray.600"
                      color="white"
                      _hover={{ borderColor: "gray.500" }}
                      _placeholder={{ color: "gray.400" }}
                    />
                    <FormErrorMessage>
                      {errors.common_info?.patient?.age?.message}
                    </FormErrorMessage>
                  </FormControl>
                  
                  <FormControl isInvalid={errors.common_info?.patient?.sex} mb={3}>
                    <FormLabel fontSize="sm" color="gray.300">Patient Sex</FormLabel>
                    <Select 
                      size="sm"
                      {...register("common_info.patient.sex", { 
                        required: "Sex is required" 
                      })}
                      aria-label="Patient sex"
                      bg="gray.700"
                      borderColor="gray.600"
                      color="white"
                      _hover={{ borderColor: "gray.500" }}
                      data-theme="dark"
                      sx={{
                        '& option': {
                          backgroundColor: 'gray.700',
                          color: 'white',
                        }
                      }}
                    >
                      <option value="male" style={{ backgroundColor: '#2D3748', color: 'white' }}>Male</option>
                      <option value="female" style={{ backgroundColor: '#2D3748', color: 'white' }}>Female</option>
                    </Select>
                    <FormErrorMessage>
                      {errors.common_info?.patient?.sex?.message}
                    </FormErrorMessage>
                  </FormControl>
                </Box>
              </GridItem>
              
              {/* Lesion Info Section */}
              <GridItem 
                as={Box} 
                p={4} 
                borderWidth="1px" 
                borderRadius="md" 
                bg={formBg}
                borderColor={borderColor}
                boxShadow="sm"
              >
                <Heading size="sm" mb={3} textAlign="center" color="white">Lesion Info</Heading>
                
                <Box mb={4}>
                  <Box mb={3}>
                    <Checkbox 
                      size="sm" 
                      {...register("fusion_data.is_bladder_filling_study")}
                      isChecked={isBladderFillingStudy} 
                      onChange={handleBladderFillingToggle}
                      colorScheme="blue"
                      color="gray.300"
                    >
                      Full/Empty?
                    </Checkbox>
                  </Box>
                  
                  {!isBladderFillingStudy && (
                    <Box>
                      <Checkbox 
                        size="sm" 
                        isChecked={isCustomLesion} 
                        onChange={handleCustomLesionChange}
                        colorScheme="green"
                        color="gray.300"
                      >
                        Custom Lesion?
                      </Checkbox>
                    </Box>
                  )}
                </Box>
                
                {isBladderFillingStudy ? (
                  <FormControl isInvalid={errors.fusion_data?.lesion} mb={3}>
                    <FormLabel fontSize="sm" color="gray.300">Lesion/Treatment Site</FormLabel>
                    <Select 
                      size="sm"
                      {...register("fusion_data.lesion", { 
                        required: isBladderFillingStudy ? "Lesion/treatment site is required" : false
                      })}
                      aria-label="Lesion or treatment site"
                      bg="gray.700"
                      borderColor="gray.600"
                      color="white"
                      _hover={{ borderColor: "gray.500" }}
                      data-theme="dark"
                      sx={{
                        '& option': {
                          backgroundColor: 'gray.700',
                          color: 'white',
                        }
                      }}
                    >
                      <option value="" style={{ backgroundColor: '#2D3748', color: 'white' }}>Select a treatment site</option>
                      <option value="prostate" style={{ backgroundColor: '#2D3748', color: 'white' }}>Prostate</option>
                      <option value="bladder" style={{ backgroundColor: '#2D3748', color: 'white' }}>Bladder</option>
                      <option value="cervix" style={{ backgroundColor: '#2D3748', color: 'white' }}>Cervix</option>
                      <option value="endometrium" style={{ backgroundColor: '#2D3748', color: 'white' }}>Endometrium</option>
                      <option value="rectum" style={{ backgroundColor: '#2D3748', color: 'white' }}>Rectum</option>
                      <option value="vagina" style={{ backgroundColor: '#2D3748', color: 'white' }}>Vagina</option>
                      <option value="pelvis" style={{ backgroundColor: '#2D3748', color: 'white' }}>Pelvis</option>
                    </Select>
                    <FormErrorMessage>
                      {errors.fusion_data?.lesion?.message}
                    </FormErrorMessage>
                  </FormControl>
                ) : !isCustomLesion ? (
                  <FormControl isInvalid={errors.fusion_data?.lesion} mb={3}>
                    <FormLabel fontSize="sm" color="gray.300">Lesion</FormLabel>
                    <Select 
                      size="sm"
                      {...register("fusion_data.lesion", { 
                        required: !isCustomLesion && !isBladderFillingStudy ? "Lesion is required" : false
                      })}
                      isDisabled={isCustomLesion}
                      aria-label="Select lesion"
                      bg="gray.700"
                      borderColor="gray.600"
                      color="white"
                      _hover={{ borderColor: "gray.500" }}
                      data-theme="dark"
                      sx={{
                        '& option': {
                          backgroundColor: 'gray.700',
                          color: 'white',
                        }
                      }}
                    >
                      <option value="" style={{ backgroundColor: '#2D3748', color: 'white' }}>Select a lesion</option>
                      {Object.keys(lesionRegions).sort().map(lesion => (
                        <option key={lesion} value={lesion} style={{ backgroundColor: '#2D3748', color: 'white' }}>{lesion}</option>
                      ))}
                    </Select>
                    <FormErrorMessage>
                      {errors.fusion_data?.lesion?.message}
                    </FormErrorMessage>
                  </FormControl>
                ) : (
                  <>
                    <FormControl isInvalid={errors.fusion_data?.custom_lesion} mb={3}>
                      <FormLabel fontSize="sm" color="gray.300">Custom Lesion Name</FormLabel>
                      <Input 
                        size="sm"
                        {...register("fusion_data.custom_lesion", { 
                          required: isCustomLesion ? "Custom lesion name is required" : false
                        })}
                        aria-label="Custom lesion name"
                        bg="gray.700"
                        borderColor="gray.600"
                        color="white"
                        _hover={{ borderColor: "gray.500" }}
                        _placeholder={{ color: "gray.400" }}
                      />
                      <FormErrorMessage>
                        {errors.fusion_data?.custom_lesion?.message}
                      </FormErrorMessage>
                    </FormControl>
                    
                    <FormControl isInvalid={errors.fusion_data?.anatomical_region} mb={3}>
                      <FormLabel fontSize="sm" color="gray.300">Anatomical Region</FormLabel>
                      <Select 
                        size="sm"
                        {...register("fusion_data.anatomical_region", { 
                          required: isCustomLesion ? "Anatomical region is required" : false
                        })}
                        aria-label="Anatomical region"
                        bg="gray.700"
                        borderColor="gray.600"
                        color="white"
                        _hover={{ borderColor: "gray.500" }}
                        data-theme="dark"
                        sx={{
                          '& option': {
                            backgroundColor: 'gray.700',
                            color: 'white',
                          }
                        }}
                      >
                        <option value="" style={{ backgroundColor: '#2D3748', color: 'white' }}>Select a region</option>
                        <option value="head and neck" style={{ backgroundColor: '#2D3748', color: 'white' }}>Head and Neck</option>
                        <option value="brain" style={{ backgroundColor: '#2D3748', color: 'white' }}>Brain</option>
                        <option value="thoracic" style={{ backgroundColor: '#2D3748', color: 'white' }}>Thoracic</option>
                        <option value="abdominal" style={{ backgroundColor: '#2D3748', color: 'white' }}>Abdominal</option>
                        <option value="pelvic" style={{ backgroundColor: '#2D3748', color: 'white' }}>Pelvic</option>
                        <option value="spinal" style={{ backgroundColor: '#2D3748', color: 'white' }}>Spinal</option>
                        <option value="extremity" style={{ backgroundColor: '#2D3748', color: 'white' }}>Extremity</option>
                      </Select>
                      <FormErrorMessage>
                        {errors.fusion_data?.anatomical_region?.message}
                      </FormErrorMessage>
                    </FormControl>
                  </>
                )}
              </GridItem>
              
              {/* Registrations Section - Only show for multimodality fusion */}
              {!isBladderFillingStudy && (
                <GridItem 
                  as={Box} 
                  p={4} 
                  borderWidth="1px" 
                  borderRadius="md" 
                  bg={formBg}
                  borderColor={borderColor}
                  boxShadow="sm"
                >
                <Heading size="sm" mb={3} textAlign="center" color="white">Registrations</Heading>
                
                {!hasMriRegistration && !hasPetRegistration && (
                  <Alert status="info" mb={3} size="sm" borderRadius="md" bg="blue.900" borderColor="blue.700">
                    <AlertIcon color="blue.300" />
                    <Text fontSize="xs" color="blue.200">At least one registration is required</Text>
                  </Alert>
                )}
                
                <Box mb={3}>
                  <Heading size="xs" mb={1} color="gray.300">Current Registrations</Heading>
                  
                  {fields.length === 0 ? (
                    <Text fontSize="sm" mb={3} color="gray.400">No registrations configured.</Text>
                  ) : (
                    <List spacing={2} mb={3}>
                      {fields.map((field, index) => (
                        <ListItem key={field.id}>
                          <Card size="sm" variant="outline" borderColor={borderColor} bg="gray.700">
                            <CardBody p={2}>
                              <HStack justify="space-between">
                                <Box>
                                  <Text fontSize="xs" color="gray.300"><strong>Primary:</strong> CT</Text>
                                  <Text fontSize="xs" color="gray.300">
                                    <strong>Secondary:</strong> {watch(`fusion_data.registrations.${index}.secondary`)}
                                    {watch(`fusion_data.registrations.${index}.secondary`) === 'MRI' && (
                                      <Badge ml={1} colorScheme="blue" fontSize="0.6em">Rigid Only</Badge>
                                    )}
                                  </Text>
                                  <Text fontSize="xs" color="gray.300">
                                    <strong>Method:</strong> {watch(`fusion_data.registrations.${index}.method`)}
                                  </Text>
                                </Box>
                                <Button 
                                  colorScheme="red" 
                                  size="xs" 
                                  onClick={() => confirmRemoveRegistration(index)}
                                  aria-label="Remove registration"
                                >
                                  X
                                </Button>
                              </HStack>
                            </CardBody>
                          </Card>
                        </ListItem>
                      ))}
                    </List>
                  )}
                  
                  <Heading size="xs" mb={1} color="gray.300">Add New Registration</Heading>
                  
                  <Grid templateColumns="repeat(2, 1fr)" gap={1} mb={3}>
                    <GridItem>
                      <FormControl>
                        <FormLabel fontSize="sm" color="gray.300">Secondary Modality</FormLabel>
                        <Select 
                          id="new-secondary" 
                          size="sm"
                          onChange={handleSecondaryModalityChange}
                          defaultValue={modalities.length > 0 ? modalities[0] : ''}
                          aria-label="Secondary modality"
                          bg="gray.700"
                          borderColor="gray.600"
                          color="white"
                          _hover={{ borderColor: "gray.500" }}
                          data-theme="dark"
                          sx={{
                            '& option': {
                              backgroundColor: 'gray.700',
                              color: 'white',
                            }
                          }}
                        >
                          {modalities.map(modality => (
                            <option key={modality} value={modality} style={{ backgroundColor: '#2D3748', color: 'white' }}>{modality}</option>
                          ))}
                        </Select>
                      </FormControl>
                    </GridItem>
                    
                    <GridItem>
                      <FormControl>
                        <Tooltip 
                          label={selectedSecondaryModality === 'MRI' ? "MRI registrations require rigid method" : ""}
                          isDisabled={selectedSecondaryModality !== 'MRI'}
                        >
                          <Box>
                            <FormLabel fontSize="sm" color="gray.300">
                              Registration Method
                              {selectedSecondaryModality === 'MRI' && (
                                <Badge ml={1} colorScheme="blue" fontSize="0.6em">Rigid Only</Badge>
                              )}
                            </FormLabel>
                            <Select 
                              id="new-method" 
                              size="sm"
                              isDisabled={selectedSecondaryModality === 'MRI'}
                              defaultValue={registrationMethods.length > 0 ? registrationMethods[0] : ''}
                              aria-label="Registration method"
                              bg="gray.700"
                              borderColor="gray.600"
                              color="white"
                              _hover={{ borderColor: "gray.500" }}
                              data-theme="dark"
                              sx={{
                                '& option': {
                                  backgroundColor: 'gray.700',
                                  color: 'white',
                                }
                              }}
                            >
                              {registrationMethods.map(method => (
                                <option key={method} value={method} style={{ backgroundColor: '#2D3748', color: 'white' }}>{method}</option>
                              ))}
                            </Select>
                          </Box>
                        </Tooltip>
                      </FormControl>
                    </GridItem>
                  </Grid>
                  
                  <Button 
                    colorScheme="green" 
                    size="sm" 
                    onClick={addRegistration} 
                    width="100%"
                    aria-label="Add registration"
                  >
                    Add Registration
                  </Button>
                </Box>
              </GridItem>
              )}
            </Grid>
            
            <Flex gap={4} mb={6}>
              <Button
                colorScheme="green"
                isLoading={loading}
                type="submit"
                isDisabled={!isBladderFillingStudy && fields.length === 0}
                width="100%"
                size="md"
                aria-label="Generate write-up"
                shadow="md"
              >
                Generate Write-up
              </Button>
              
              <Button
                variant="outline"
                colorScheme="red"
                onClick={handleResetForm}
                width="auto"
                size="md"
                aria-label="Reset form"
                color="red.300"
                borderColor="red.600"
                _hover={{ bg: "red.800", borderColor: "red.400" }}
              >
                Reset Form
              </Button>
            </Flex>
          </form>
          
          {writeup && (
            <Box mt={6}>
              <Heading size="md" mb={3} color="white">Generated Write-up</Heading>
              <Box
                p={4}
                borderWidth={1}
                borderRadius="md"
                bg={writeupBg}
                borderColor={borderColor}
                boxShadow="md"
              >
                <Textarea
                  value={writeup}
                  height="300px"
                  isReadOnly
                  fontFamily="mono"
                  fontSize="sm"
                  resize="vertical"
                  aria-label="Generated write-up"
                  bg="gray.700"
                  borderColor="gray.600"
                  color="white"
                  _focus={{ borderColor: "green.500" }}
                />
                <Button 
                  mt={3} 
                  colorScheme="green"
                  leftIcon={<span>📋</span>}
                  onClick={() => {
                    navigator.clipboard.writeText(writeup);
                    toast({
                      title: "Copied to clipboard",
                      status: "success",
                      duration: 2000,
                    });
                  }}
                  aria-label="Copy to clipboard"
                >
                  Copy to Clipboard
                </Button>
              </Box>
            </Box>
          )}
        </Box>
        
        {/* Delete confirmation dialog */}
        <AlertDialog
          isOpen={isDeleteAlertOpen}
          leastDestructiveRef={cancelRef}
          onClose={() => setIsDeleteAlertOpen(false)}
        >
          <AlertDialogOverlay>
            <AlertDialogContent bg="gray.800" color="white" borderColor="gray.600">
              <AlertDialogHeader fontSize="lg" fontWeight="bold" color="white">
                Remove Registration
              </AlertDialogHeader>

              <AlertDialogBody color="gray.300">
                Are you sure you want to remove this registration?
              </AlertDialogBody>

              <AlertDialogFooter bg="gray.700">
                <Button ref={cancelRef} onClick={() => setIsDeleteAlertOpen(false)} variant="outline" color="gray.300" borderColor="gray.600" _hover={{ bg: "gray.600" }}>
                  Cancel
                </Button>
                <Button colorScheme="red" onClick={handleRemoveRegistration} ml={3}>
                  Delete
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialogOverlay>
        </AlertDialog>
      </Box>
    </Box>
  );
};

export default FusionForm; 