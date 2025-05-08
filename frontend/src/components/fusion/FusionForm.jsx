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
  useColorModeValue,
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
  
  const formBg = useColorModeValue('white', 'gray.700');
  const writeupBg = useColorModeValue('gray.50', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

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
        registrations: []
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
    // Validate that we have at least one registration
    if (data.fusion_data.registrations.length === 0) {
      toast({
        title: 'Validation Error',
        description: 'At least one registration is required',
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
    // If the backend already generates the final format, just return it
    // Otherwise, format it here
    
    const physician = formData.common_info.physician.name;
    const physicist = formData.common_info.physicist.name;
    const patientAge = formData.common_info.patient.age;
    const patientSex = formData.common_info.patient.sex;
    const lesion = isCustomLesion ? formData.fusion_data.custom_lesion : formData.fusion_data.lesion;
    const anatomicalRegion = formData.fusion_data.anatomical_region;
    
    // Group registrations by modality
    const mriRegistrations = formData.fusion_data.registrations.filter(reg => reg.secondary.includes('MRI'));
    const petCtRegistrations = formData.fusion_data.registrations.filter(reg => reg.secondary.includes('PET'));
    
    // Convert numbers to words for counts
    const numberToWord = (num) => {
      const words = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];
      return words[num] || num.toString();
    };
    
    const mriCount = numberToWord(mriRegistrations.length);
    const petCtCount = numberToWord(petCtRegistrations.length);
    
    // Create paragraphs in the new format
    const intro = `Dr. ${physician} requested a medical physics consultation for --- to perform a multimodality image fusion. The patient is a ${patientAge}-year-old ${patientSex} with a ${lesion} lesion. The patient was scanned in our CT simulator in the treatment position. The CT study was then exported to the Velocity imaging registration software.`;
    
    // Only include modalities that are actually present
    let importText = 'Multiple image studies including ';
    const modalitiesList = [];
    
    if (mriRegistrations.length > 0) {
      modalitiesList.push(`${mriCount} MRI${mriRegistrations.length > 1 ? 's' : ''}`);
    }
    
    if (petCtRegistrations.length > 0) {
      modalitiesList.push(`${petCtCount} PET/CT${petCtRegistrations.length > 1 ? 's' : ''}`);
    }
    
    if (modalitiesList.length === 0) {
      importText = 'Image studies were imported into the Velocity software. Fusion studies were created between the planning CT and each of the other modality image sets.';
    } else if (modalitiesList.length === 1) {
      importText += `${modalitiesList[0]} was imported into the Velocity software. Fusion studies were created between the planning CT and the other modality image set.`;
    } else {
      importText += `${modalitiesList.join(' and ')} were imported into the Velocity software. Fusion studies were created between the planning CT and each of the other modality image sets.`;
    }
    
    // MRI paragraph with "refined manually" - only include if MRI registrations exist
    const mriParagraph = mriRegistrations.length > 0 ? 
      `The CT and MRI image sets were initially aligned using a rigid registration algorithm based on the ${anatomicalRegion} anatomy, then refined manually. The resulting fusion was verified for accuracy using anatomical landmarks such as the ${anatomicalRegion}.` : '';
    
    // PET/CT paragraph with deformable registration - only include if PET registrations exist
    const petCtParagraph = petCtRegistrations.length > 0 ? 
      `The CT and PET/CT image sets were aligned using a rigid registration algorithm followed by deformable image registration to enhance the results. The accuracy of this fusion was validated using anatomical structures such as the ${anatomicalRegion}. The fused images were subsequently used to improve the identification of critical structures and targets and to accurately contour them for treatment planning.` : '';
    
    const conclusion = `The fusion of all image sets was reviewed and approved by both the prescribing radiation oncologist, Dr. ${physician}, and the medical physicist, Dr. ${physicist}.`;
    
    // Combine all paragraphs with appropriate spacing
    const paragraphs = [intro, importText, mriParagraph, petCtParagraph, conclusion].filter(p => p !== '');
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
        registrations: []
      }
    });
    setWriteup('');
    setIsCustomLesion(false);
    
    toast({
      title: 'Form reset',
      status: 'info',
      duration: 2000,
      isClosable: true,
    });
  };

  if (initialLoading) {
    return (
      <Box textAlign="center" p={5}>
        <Text>Loading form data...</Text>
      </Box>
    );
  }

  return (
    <Box>
      <Heading size="md" mb={4}>Fusion Write-up Generator</Heading>
      
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
              <Heading size="sm" mb={3} textAlign="center">Staff & Patient</Heading>
              
              <Box>
                <Heading size="xs" mb={2}>Staff Information</Heading>
                
                <FormControl isInvalid={errors.common_info?.physician?.name} mb={3}>
                  <FormLabel fontSize="sm">Physician Name</FormLabel>
                  <Select 
                    size="sm"
                    {...register("common_info.physician.name", { 
                      required: "Physician name is required" 
                    })}
                    aria-label="Select physician"
                  >
                    <option value="">Select a physician</option>
                    {physicians.map(physician => (
                      <option key={physician} value={physician}>{physician}</option>
                    ))}
                  </Select>
                  <FormErrorMessage>
                    {errors.common_info?.physician?.name?.message}
                  </FormErrorMessage>
                </FormControl>
                
                <FormControl isInvalid={errors.common_info?.physicist?.name} mb={3}>
                  <FormLabel fontSize="sm">Physicist Name</FormLabel>
                  <Select 
                    size="sm"
                    {...register("common_info.physicist.name", { 
                      required: "Physicist name is required" 
                    })}
                    aria-label="Select physicist"
                  >
                    <option value="">Select a physicist</option>
                    {physicists.map(physicist => (
                      <option key={physicist} value={physicist}>{physicist}</option>
                    ))}
                  </Select>
                  <FormErrorMessage>
                    {errors.common_info?.physicist?.name?.message}
                  </FormErrorMessage>
                </FormControl>
              </Box>
              
              <Box mt={4}>
                <Heading size="xs" mb={2}>Patient Information</Heading>
                
                <FormControl isInvalid={errors.common_info?.patient?.age} mb={3}>
                  <FormLabel fontSize="sm">Patient Age</FormLabel>
                  <Input 
                    size="sm"
                    type="number"
                    {...register("common_info.patient.age", { 
                      required: "Age is required",
                      min: { value: 1, message: "Age must be at least 1" },
                      max: { value: 120, message: "Age must be less than 120" }
                    })}
                    aria-label="Patient age"
                  />
                  <FormErrorMessage>
                    {errors.common_info?.patient?.age?.message}
                  </FormErrorMessage>
                </FormControl>
                
                <FormControl isInvalid={errors.common_info?.patient?.sex} mb={3}>
                  <FormLabel fontSize="sm">Patient Sex</FormLabel>
                  <Select 
                    size="sm"
                    {...register("common_info.patient.sex", { 
                      required: "Sex is required" 
                    })}
                    aria-label="Patient sex"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
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
              <Heading size="sm" mb={3} textAlign="center">Lesion Info</Heading>
              
              <Box mb={2}>
                <Checkbox 
                  size="sm" 
                  isChecked={isCustomLesion} 
                  onChange={handleCustomLesionChange}
                  colorScheme="blue"
                >
                  Custom Lesion?
                </Checkbox>
              </Box>
              
              {!isCustomLesion ? (
                <FormControl isInvalid={errors.fusion_data?.lesion} mb={3}>
                  <FormLabel fontSize="sm">Lesion</FormLabel>
                  <Select 
                    size="sm"
                    {...register("fusion_data.lesion", { 
                      required: !isCustomLesion ? "Lesion is required" : false
                    })}
                    isDisabled={isCustomLesion}
                    aria-label="Select lesion"
                  >
                    <option value="">Select a lesion</option>
                    {Object.keys(lesionRegions).sort().map(lesion => (
                      <option key={lesion} value={lesion}>{lesion}</option>
                    ))}
                  </Select>
                  <FormErrorMessage>
                    {errors.fusion_data?.lesion?.message}
                  </FormErrorMessage>
                </FormControl>
              ) : (
                <>
                  <FormControl isInvalid={errors.fusion_data?.custom_lesion} mb={3}>
                    <FormLabel fontSize="sm">Custom Lesion Name</FormLabel>
                    <Input 
                      size="sm"
                      {...register("fusion_data.custom_lesion", { 
                        required: isCustomLesion ? "Custom lesion name is required" : false
                      })}
                      aria-label="Custom lesion name"
                    />
                    <FormErrorMessage>
                      {errors.fusion_data?.custom_lesion?.message}
                    </FormErrorMessage>
                  </FormControl>
                  
                  <FormControl isInvalid={errors.fusion_data?.anatomical_region} mb={3}>
                    <FormLabel fontSize="sm">Anatomical Region</FormLabel>
                    <Select 
                      size="sm"
                      {...register("fusion_data.anatomical_region", { 
                        required: isCustomLesion ? "Anatomical region is required" : false
                      })}
                      aria-label="Anatomical region"
                    >
                      <option value="">Select a region</option>
                      <option value="head and neck">Head and Neck</option>
                      <option value="brain">Brain</option>
                      <option value="thoracic">Thoracic</option>
                      <option value="abdominal">Abdominal</option>
                      <option value="pelvic">Pelvic</option>
                      <option value="spinal">Spinal</option>
                    </Select>
                    <FormErrorMessage>
                      {errors.fusion_data?.anatomical_region?.message}
                    </FormErrorMessage>
                  </FormControl>
                </>
              )}
            </GridItem>
            
            {/* Registrations Section */}
            <GridItem 
              as={Box} 
              p={4} 
              borderWidth="1px" 
              borderRadius="md" 
              bg={formBg}
              borderColor={borderColor}
              boxShadow="sm"
            >
              <Heading size="sm" mb={3} textAlign="center">Registrations</Heading>
              
              {!hasMriRegistration && !hasPetRegistration && (
                <Alert status="info" mb={3} size="sm" borderRadius="md">
                  <AlertIcon />
                  <Text fontSize="xs">At least one registration is required</Text>
                </Alert>
              )}
              
              <Box mb={3}>
                <Heading size="xs" mb={1}>Current Registrations</Heading>
                
                {fields.length === 0 ? (
                  <Text fontSize="sm" mb={3} color="gray.500">No registrations configured.</Text>
                ) : (
                  <List spacing={2} mb={3}>
                    {fields.map((field, index) => (
                      <ListItem key={field.id}>
                        <Card size="sm" variant="outline" borderColor={borderColor}>
                          <CardBody p={2}>
                            <HStack justify="space-between">
                              <Box>
                                <Text fontSize="xs"><strong>Primary:</strong> CT</Text>
                                <Text fontSize="xs">
                                  <strong>Secondary:</strong> {watch(`fusion_data.registrations.${index}.secondary`)}
                                  {watch(`fusion_data.registrations.${index}.secondary`) === 'MRI' && (
                                    <Badge ml={1} colorScheme="blue" fontSize="0.6em">Rigid Only</Badge>
                                  )}
                                </Text>
                                <Text fontSize="xs">
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
                
                <Heading size="xs" mb={1}>Add New Registration</Heading>
                
                <Grid templateColumns="repeat(2, 1fr)" gap={1} mb={3}>
                  <GridItem>
                    <FormControl>
                      <FormLabel fontSize="sm">Secondary Modality</FormLabel>
                      <Select 
                        id="new-secondary" 
                        size="sm"
                        onChange={handleSecondaryModalityChange}
                        defaultValue={modalities.length > 0 ? modalities[0] : ''}
                        aria-label="Secondary modality"
                      >
                        {modalities.map(modality => (
                          <option key={modality} value={modality}>{modality}</option>
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
                          <FormLabel fontSize="sm">
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
                          >
                            {registrationMethods.map(method => (
                              <option key={method} value={method}>{method}</option>
                            ))}
                          </Select>
                        </Box>
                      </Tooltip>
                    </FormControl>
                  </GridItem>
                </Grid>
                
                <Button 
                  colorScheme="blue" 
                  size="sm" 
                  onClick={addRegistration} 
                  width="100%"
                  aria-label="Add registration"
                >
                  Add Registration
                </Button>
              </Box>
            </GridItem>
          </Grid>
          
          <Flex gap={4} mb={6}>
            <Button
              colorScheme="blue"
              isLoading={loading}
              type="submit"
              isDisabled={fields.length === 0}
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
            >
              Reset Form
            </Button>
          </Flex>
        </form>
        
        {writeup && (
          <Box mt={6}>
            <Heading size="md" mb={3}>Generated Write-up</Heading>
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
              />
              <Button 
                mt={3} 
                colorScheme="blue"
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
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Remove Registration
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure you want to remove this registration?
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={() => setIsDeleteAlertOpen(false)}>
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
  );
};

export default FusionForm; 