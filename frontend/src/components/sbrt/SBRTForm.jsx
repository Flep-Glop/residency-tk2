import React, { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Select,
  FormErrorMessage,
  Heading,
  Grid,
  GridItem,
  Text,
  Textarea,
  useToast,
  Alert,
  AlertIcon,
  Badge,
  Flex,
  useColorModeValue,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  RadioGroup,
  Radio,
  Stack,
} from '@chakra-ui/react';
import { getTreatmentSites, getDoseConstraints, getFractionationSchemes, generateSBRTWriteup, validateDoseFractionation } from '../../services/sbrtService';

const SBRTForm = () => {
  // State variables
  const [treatmentSites, setTreatmentSites] = useState([]);
  const [doseConstraints, setDoseConstraints] = useState({});
  const [fractionationSchemes, setFractionationSchemes] = useState({});
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [writeup, setWriteup] = useState('');
  const [validationMessage, setValidationMessage] = useState(null);
  const toast = useToast();
  const [physicians, setPhysicians] = useState(['Dalwadi', 'Galvan', 'Ha', 'Kluwe', 'Le', 'Lewis', 'Newman']);
  const [physicists, setPhysicists] = useState(['Bassiri', 'Kirby', 'Papanikolaou', 'Paschal', 'Rasmussen']);
  
  const formBg = useColorModeValue('white', 'gray.700');
  const writeupBg = useColorModeValue('gray.50', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  // Form setup with react-hook-form
  const { register, handleSubmit, watch, formState: { errors }, setValue, reset } = useForm({
    defaultValues: {
      common_info: {
        physician: { name: '', role: 'physician' },
        physicist: { name: '', role: 'physicist' },
        patient: { age: '', sex: 'male' }
      },
      sbrt_data: {
        treatment_site: '',
        dose: 50,
        fractions: 5,
        is_4dct: 'Yes',
        target_volume: 3.5,
        ptv_coverage: 95,
        pitv: 1.0,
        r50: 3.5
      }
    }
  });
  
  // Watch key form fields for reactive updates
  const watchDose = watch('sbrt_data.dose');
  const watchFractions = watch('sbrt_data.fractions');
  const watchTreatmentSite = watch('sbrt_data.treatment_site');
  const watchTarget = watch('sbrt_data.target_volume');
  
  // Calculate derived values
  const dosePerFraction = watchDose && watchFractions ? (watchDose / watchFractions) : 0;
  
  // Load initial data
  useEffect(() => {
    const fetchInitialData = async () => {
      setInitialLoading(true);
      try {
        const sitesData = await getTreatmentSites();
        setTreatmentSites(sitesData);
      } catch (error) {
        toast({
          title: 'Error loading data',
          description: error.message,
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
        
        // For development, use hardcoded values if API is not yet implemented
        setTreatmentSites([
          "lung", "liver", "spine", "adrenal", "pancreas", 
          "kidney", "prostate", "lymph node", "bone", "oligometastasis"
        ]);
      } finally {
        setInitialLoading(false);
      }
    };

    fetchInitialData();
  }, [toast]);

  // Update constraints when treatment site changes
  useEffect(() => {
    const fetchSiteSpecificData = async () => {
      if (!watchTreatmentSite) return;
      
      try {
        // Get dose constraints for selected site
        const constraints = await getDoseConstraints(watchTreatmentSite);
        setDoseConstraints(constraints);
        
        // Get fractionation schemes for selected site
        const schemes = await getFractionationSchemes(watchTreatmentSite);
        setFractionationSchemes(schemes);
        
        // If schemes are available, set the first one as default
        if (schemes && schemes.length > 0) {
          setValue('sbrt_data.dose', schemes[0].dose);
          setValue('sbrt_data.fractions', schemes[0].fractions);
        }
      } catch (error) {
        toast({
          title: 'Error loading site-specific data',
          description: error.message,
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        
        // Mock data for development
        if (watchTreatmentSite === 'lung') {
          setDoseConstraints({
            "Spinal Cord": "Dmax < 18 Gy",
            "Esophagus": "Dmax < 27 Gy",
            "Brachial Plexus": "Dmax < 24 Gy",
            "Heart": "Dmax < 30 Gy"
          });
          
          setFractionationSchemes([
            { dose: 50, fractions: 5, description: "Standard" },
            { dose: 48, fractions: 4, description: "Alternative" }
          ]);
        } else if (watchTreatmentSite === 'liver') {
          setDoseConstraints({
            "Liver (normal)": "V15 < 700 cc",
            "Spinal Cord": "Dmax < 18 Gy",
            "Stomach": "Dmax < 30 Gy"
          });
          
          setFractionationSchemes([
            { dose: 45, fractions: 3, description: "Standard" },
            { dose: 60, fractions: 5, description: "Alternative" }
          ]);
        }
      }
    };
    
    fetchSiteSpecificData();
  }, [watchTreatmentSite, setValue, toast]);

  // Validate dose/fractionation when either changes
  useEffect(() => {
    const validateDoseAndFractions = async () => {
      if (!watchTreatmentSite || !watchDose || !watchFractions) return;
      
      try {
        const validation = await validateDoseFractionation(
          watchTreatmentSite, 
          watchDose, 
          watchFractions
        );
        
        if (validation.is_valid) {
          setValidationMessage(null);
        } else {
          setValidationMessage({
            type: validation.warning ? 'warning' : 'error',
            message: validation.message
          });
        }
      } catch (error) {
        // For development, basic validation logic
        if (dosePerFraction > 10) {
          setValidationMessage({
            type: 'error',
            message: 'Dose per fraction exceeds 10 Gy, which is unusually high for SBRT.'
          });
        } else if (dosePerFraction > 8) {
          setValidationMessage({
            type: 'warning',
            message: 'Dose per fraction exceeds 8 Gy. Please verify this is appropriate.'
          });
        } else {
          setValidationMessage(null);
        }
      }
    };
    
    validateDoseAndFractions();
  }, [watchTreatmentSite, watchDose, watchFractions, dosePerFraction]);

  // Form submission handler
  const onSubmit = async (data) => {
    setLoading(true);
    try {
      // Add calculated dose per fraction to data
      data.sbrt_data.dose_per_fraction = dosePerFraction;
      
      const result = await generateSBRTWriteup(data);
      
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

  // Format the writeup or use the backend-generated one
  const formatWriteup = (originalWriteup, formData) => {
    // If the API is implemented, return the original writeup
    if (originalWriteup) return originalWriteup;
    
    // Otherwise, generate one client-side using the template from the old module
    const physician = formData.common_info.physician.name;
    const physicist = formData.common_info.physicist.name;
    const patient_details = `a ${formData.common_info.patient.age}-year-old ${formData.common_info.patient.sex} with a ${formData.sbrt_data.treatment_site} lesion`;
    const dose = formData.sbrt_data.dose;
    const fractions = formData.sbrt_data.fractions;
    const target_volume = formData.sbrt_data.target_volume;
    const ptv_coverage = formData.sbrt_data.ptv_coverage;
    const pitv = formData.sbrt_data.pitv;
    const r50 = formData.sbrt_data.r50;
    const is_4dct = formData.sbrt_data.is_4dct;
    
    // Format motion management text based on 4DCT selection
    let motion_text;
    if (is_4dct === "Yes") {
      motion_text = "The patient was scanned in our CT simulator in the treatment position. ";
      motion_text += "A 4D kVCT simulation scan was performed with the patient immobilized to assess respiratory motion. ";
      motion_text += "Using the 4D dataset, a Maximum Intensity Projection (MIP) CT image set was reconstructed to generate an ITV ";
      motion_text += "that encompasses the motion envelope of the target.";
    } else {
      motion_text = "The patient was scanned in our CT simulator in the treatment position. ";
      motion_text += "The patient was immobilized using a customized immobilization device to limit motion during treatment and aid in inter-fractional repositioning.";
    }
    
    // Standard image guidance text
    const imaging_text = "Patient positioning verification will be performed before each treatment fraction using " +
      "kilovoltage cone-beam CT to ensure accurate target localization and patient positioning.";
    
    // Standard QA text
    const qa_text = "A quality assurance plan was developed and delivered to verify " +
      "the accuracy of the radiation treatment plan. Measurements within the phantom were obtained " +
      "and compared against the calculated plan, showing good agreement between the plan and measurements.";
    
    // Generate the write-up
    let write_up = `Dr. ${physician} requested a medical physics consultation for --- for a 4D CT simulation study and SBRT delivery. `;
    write_up += `The patient is ${patient_details}. Dr. ${physician} has elected to treat with a `;
    write_up += "stereotactic body radiotherapy (SBRT) technique by means of the Pinnacle treatment planning ";
    write_up += "system in conjunction with the linear accelerator equipped with the ";
    write_up += "kV-CBCT system.\n\n";
    
    // Motion management section
    write_up += `${motion_text} Both the prescribing radiation oncologist and radiation oncology physicist `;
    write_up += "evaluated and approved the patient setup. ";
    write_up += `Dr. ${physician} segmented and approved both the PTVs and OARs.\n\n`;
    
    // Treatment planning section
    write_up += "In the treatment planning system, a VMAT treatment plan was developed to ";
    write_up += `conformally deliver a prescribed dose of ${dose} Gy in ${fractions} fractions to the planning target volume. `;
    write_up += "The treatment plan was inversely optimized such that the prescription isodose volume exactly matched ";
    write_up += `the target volume of ${target_volume} cc in all three spatial dimensions and that the dose fell sharply away from the target volume. `;
    write_up += `The treatment plan covered ${ptv_coverage}% of the PTV with the prescribed isodose volume. `;
    write_up += `The PITV (Vpres iso / VPTV) was ${pitv} and the R50 (Vol50% pres iso / VolPTV) was ${r50}. `;
    write_up += "Normal tissue dose constraints for critical organs associated with the treatment site were reviewed.\n\n";
    
    // Image guidance section
    write_up += `${imaging_text}\n\n`;
    
    // QA section
    write_up += `${qa_text} Calculations and data analysis were reviewed and approved by both the `;
    write_up += `prescribing radiation oncologist, Dr. ${physician}, and the radiation oncology physicist, Dr. ${physicist}.`;
    
    return write_up;
  };

  // Reset form handler
  const handleResetForm = () => {
    reset({
      common_info: {
        physician: { name: '', role: 'physician' },
        physicist: { name: '', role: 'physicist' },
        patient: { age: '', sex: 'male' }
      },
      sbrt_data: {
        treatment_site: '',
        dose: 50,
        fractions: 5,
        is_4dct: 'Yes',
        target_volume: 3.5,
        ptv_coverage: 95,
        pitv: 1.0,
        r50: 3.5
      }
    });
    setWriteup('');
    setValidationMessage(null);
    
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
      <Heading size="md" mb={4}>SBRT Write-up Generator</Heading>
      
      <Box maxW="1200px" mx="auto">
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid 
            templateColumns={{
              base: "1fr",          // 1 column on small screens
              md: "repeat(2, 1fr)", // 2 columns on medium screens
              lg: "repeat(3, 1fr)"  // 3 columns on large screens
            }} 
            gap={6} // Increased gap for better separation
            mb={6}
          >
            {/* Column 1: Patient & Staff Information */}
            <GridItem 
              as={Box} 
              p={4} 
              borderWidth="1px" 
              borderRadius="md" 
              bg={formBg}
              borderColor={borderColor}
              boxShadow="sm"
            >
              <Heading size="sm" mb={4} textAlign="center">Patient & Staff</Heading> {/* Combined heading */}
              
              {/* Staff Section (Nested) */}
              <Box mb={4}> {/* Added margin bottom for spacing */}
                <Heading size="xs" mb={3} >Staff Information</Heading>
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

              {/* Patient Section (Nested) */}
              <Box>
                <Heading size="xs" mb={3}>Patient Information</Heading>
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
            
            {/* Column 2: Treatment Details */}
            <GridItem 
              as={Box} 
              p={4} 
              borderWidth="1px" 
              borderRadius="md" 
              bg={formBg}
              borderColor={borderColor}
              boxShadow="sm"
            >
              <Heading size="sm" mb={4} textAlign="center">Treatment Details</Heading> {/* Combined heading */}

              {/* Treatment Site & Motion Management (Nested) */}
              <Box mb={4}> {/* Added margin bottom for spacing */}
                <Heading size="xs" mb={3}>Treatment Site & Motion</Heading>
                <FormControl isInvalid={errors.sbrt_data?.treatment_site} mb={4}>
                  <FormLabel fontSize="sm" color="gray.300">Treatment Site</FormLabel>
                  <Select 
                    size="sm"
                    {...register("sbrt_data.treatment_site", { 
                      required: "Treatment site is required" 
                    })}
                    aria-label="Select treatment site"
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
                    {treatmentSites.map(site => (
                      <option key={site} value={site} style={{ backgroundColor: '#2D3748', color: 'white' }}>{site}</option>
                    ))}
                  </Select>
                  <FormErrorMessage>
                    {errors.sbrt_data?.treatment_site?.message}
                  </FormErrorMessage>
                </FormControl>
                
                <FormControl mb={4}>
                  <FormLabel fontSize="sm">Motion Management</FormLabel>
                  <RadioGroup 
                    defaultValue="Yes" 
                    onChange={value => setValue('sbrt_data.is_4dct', value)}
                    value={watch('sbrt_data.is_4dct')}
                  >
                    <Stack direction="row">
                      <Radio 
                        value="Yes" 
                        {...register("sbrt_data.is_4dct")}
                      >
                        4D CT
                      </Radio>
                      <Radio 
                        value="No" 
                        {...register("sbrt_data.is_4dct")}
                      >
                        Standard CT
                      </Radio>
                    </Stack>
                  </RadioGroup>
                </FormControl>
                
                <FormControl isInvalid={errors.sbrt_data?.target_volume} mb={3}>
                  <FormLabel fontSize="sm">Target Volume (cc)</FormLabel>
                  <NumberInput
                    size="sm"
                    min={0.01}
                    step={0.1}
                    defaultValue={3.5}
                    onChange={(value) => setValue('sbrt_data.target_volume', parseFloat(value))}
                    value={watchTarget}
                  >
                    <NumberInputField 
                      {...register("sbrt_data.target_volume", { 
                        required: "Target volume is required",
                        min: { value: 0.01, message: "Volume must be greater than 0" }
                      })}
                    />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                  <FormErrorMessage>
                    {errors.sbrt_data?.target_volume?.message}
                  </FormErrorMessage>
                </FormControl>
              </Box>
              
              {/* Dose & Fractionation Section (Nested) */}
              <Box>
                <Heading size="xs" mb={3}>Dose Information</Heading>
                {watchTreatmentSite && fractionationSchemes && fractionationSchemes.length > 0 && (
                  <Box mb={3}>
                    <Text fontSize="sm" fontWeight="medium" mb={1}>Available Fractionation Schemes:</Text>
                    <Grid templateColumns="repeat(2, 1fr)" gap={2}>
                      {fractionationSchemes.map((scheme, index) => (
                        <Button
                          key={index}
                          size="xs"
                          variant={
                            watchDose === scheme.dose && watchFractions === scheme.fractions 
                              ? "solid" 
                              : "outline"
                          }
                          colorScheme="blue"
                          onClick={() => {
                            setValue('sbrt_data.dose', scheme.dose);
                            setValue('sbrt_data.fractions', scheme.fractions);
                          }}
                        >
                          {scheme.dose}Gy / {scheme.fractions}fx
                          {scheme.description && (
                            <Badge ml={1} fontSize="0.6em" colorScheme="green">
                              {scheme.description}
                            </Badge>
                          )}
                        </Button>
                      ))}
                    </Grid>
                  </Box>
                )}
                
                <Grid templateColumns="repeat(2, 1fr)" gap={2}>
                  <FormControl isInvalid={errors.sbrt_data?.dose} mb={3}>
                    <FormLabel fontSize="sm">Dose (Gy)</FormLabel>
                    <NumberInput
                      size="sm"
                      min={0.1}
                      step={0.1}
                      defaultValue={50}
                      onChange={(value) => setValue('sbrt_data.dose', parseFloat(value))}
                      value={watchDose}
                    >
                      <NumberInputField 
                        {...register("sbrt_data.dose", { 
                          required: "Dose is required",
                          min: { value: 0.1, message: "Dose must be greater than 0" }
                        })}
                      />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                    <FormErrorMessage>
                      {errors.sbrt_data?.dose?.message}
                    </FormErrorMessage>
                  </FormControl>
                  
                  <FormControl isInvalid={errors.sbrt_data?.fractions} mb={3}>
                    <FormLabel fontSize="sm">Fractions</FormLabel>
                    <NumberInput
                      size="sm"
                      min={1}
                      max={10}
                      step={1}
                      defaultValue={5}
                      onChange={(value) => setValue('sbrt_data.fractions', parseInt(value))}
                      value={watchFractions}
                    >
                      <NumberInputField 
                        {...register("sbrt_data.fractions", { 
                          required: "Fractions is required",
                          min: { value: 1, message: "Min 1 fraction" },
                          max: { value: 10, message: "Max 10 fractions for SBRT" }
                        })}
                      />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                    <FormErrorMessage>
                      {errors.sbrt_data?.fractions?.message}
                    </FormErrorMessage>
                  </FormControl>
                </Grid>
                
                {watchDose > 0 && watchFractions > 0 && (
                  <Stat mt={2} borderWidth="1px" borderRadius="md" p={2} bg={writeupBg}>
                    <StatLabel fontSize="xs">Dose per Fraction</StatLabel>
                    <StatNumber fontSize="lg">{dosePerFraction.toFixed(2)} Gy</StatNumber>
                    {validationMessage && (
                      <Alert status={validationMessage.type} size="sm" mt={1}>
                        <AlertIcon />
                        <Text fontSize="xs">{validationMessage.message}</Text>
                      </Alert>
                    )}
                  </Stat>
                )}
              </Box>
            </GridItem>
            
            {/* Column 3: Plan Metrics */}
            <GridItem 
              as={Box} 
              p={4} 
              borderWidth="1px" 
              borderRadius="md" 
              bg={formBg}
              borderColor={borderColor}
              boxShadow="sm"
            >
              <Heading size="sm" mb={4} textAlign="center">Plan Metrics & Constraints</Heading> {/* Combined heading */}

              {/* Plan Quality Metrics (Nested) */}
              <Box mb={4}>  {/* Added margin bottom for spacing */}
                <Heading size="xs" mb={3}>Plan Quality Metrics</Heading>
                <FormControl isInvalid={errors.sbrt_data?.ptv_coverage} mb={3}>
                  <FormLabel fontSize="sm">PTV Coverage (%)</FormLabel>
                  <NumberInput
                    size="sm"
                    min={80}
                    max={100}
                    step={1}
                    defaultValue={95}
                    onChange={(value) => setValue('sbrt_data.ptv_coverage', parseInt(value))}
                    value={watch('sbrt_data.ptv_coverage')}
                  >
                    <NumberInputField 
                      {...register("sbrt_data.ptv_coverage", { 
                        required: "PTV coverage is required",
                        min: { value: 80, message: "Min 80%" },
                        max: { value: 100, message: "Max 100%" }
                      })}
                    />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                  <FormErrorMessage>
                    {errors.sbrt_data?.ptv_coverage?.message}
                  </FormErrorMessage>
                </FormControl>
                
                <Grid templateColumns="repeat(2, 1fr)" gap={2}>
                  <FormControl isInvalid={errors.sbrt_data?.pitv} mb={3}>
                    <FormLabel fontSize="sm">PITV Ratio</FormLabel>
                    <NumberInput
                      size="sm"
                      min={0.5}
                      max={2.0}
                      step={0.01}
                      defaultValue={1.0}
                      onChange={(value) => setValue('sbrt_data.pitv', parseFloat(value))}
                      value={watch('sbrt_data.pitv')}
                    >
                      <NumberInputField 
                        {...register("sbrt_data.pitv", { 
                          required: "PITV is required",
                          min: { value: 0.5, message: "Min 0.5" },
                          max: { value: 2.0, message: "Max 2.0" }
                        })}
                      />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                    <FormErrorMessage>
                      {errors.sbrt_data?.pitv?.message}
                    </FormErrorMessage>
                  </FormControl>
                  
                  <FormControl isInvalid={errors.sbrt_data?.r50} mb={3}>
                    <FormLabel fontSize="sm">R50 Ratio</FormLabel>
                    <NumberInput
                      size="sm"
                      min={1.0}
                      max={10.0}
                      step={0.1}
                      defaultValue={3.5}
                      onChange={(value) => setValue('sbrt_data.r50', parseFloat(value))}
                      value={watch('sbrt_data.r50')}
                    >
                      <NumberInputField 
                        {...register("sbrt_data.r50", { 
                          required: "R50 is required",
                          min: { value: 1.0, message: "Min 1.0" },
                          max: { value: 10.0, message: "Max 10.0" }
                        })}
                      />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                    <FormErrorMessage>
                      {errors.sbrt_data?.r50?.message}
                    </FormErrorMessage>
                  </FormControl>
                </Grid>
              </Box>
              
              {/* Dose Constraints (Nested) */}
              <Box>
                <Heading size="xs" mb={3}>Dose Constraints</Heading>
                {!watchTreatmentSite ? (
                  <Alert status="info" mb={3} size="sm">
                    <AlertIcon />
                    <Text fontSize="sm">Select a treatment site to view dose constraints</Text>
                  </Alert>
                ) : Object.keys(doseConstraints).length === 0 ? (
                  <Alert status="warning" mb={3} size="sm">
                    <AlertIcon />
                    <Text fontSize="sm">No specific constraints available for this site</Text>
                  </Alert>
                ) : (
                  <Table size="sm" variant="simple">
                    <Thead>
                      <Tr>
                        <Th>Organ at Risk</Th>
                        <Th>Constraint</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {Object.entries(doseConstraints).map(([organ, constraint]) => (
                        <Tr key={organ}>
                          <Td>{organ}</Td>
                          <Td>{constraint}</Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                )}
              </Box>
            </GridItem>
          </Grid> {/* End of Main Grid */}
          
          <Flex gap={4} mb={6}>
            <Button
              colorScheme="blue"
              isLoading={loading}
              type="submit"
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
    </Box>
  );
};

export default SBRTForm;