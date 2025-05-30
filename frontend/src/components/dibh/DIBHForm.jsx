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
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
} from '@chakra-ui/react';
import { getTreatmentSites, getImmobilizationDevices, getFractionationSchemes, generateDIBHWriteup } from '../../services/dibhService';

const DIBHForm = () => {
  const [treatmentSites, setTreatmentSites] = useState([]);
  const [immobilizationDevices, setImmobilizationDevices] = useState([]);
  const [fractionationSchemes, setFractionationSchemes] = useState({});
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [writeup, setWriteup] = useState('');
  const toast = useToast();
  const [physicians, setPhysicians] = useState(['Dalwadi', 'Galvan', 'Ha', 'Kluwe', 'Le', 'Lewis', 'Newman']);
  const [physicists, setPhysicists] = useState(['Bassiri', 'Kirby', 'Papanikolaou', 'Paschal', 'Rasmussen']);
  
  // Fixed dark theme colors for consistency
  const formBg = 'gray.800';
  const writeupBg = 'gray.800';
  const borderColor = 'gray.600';

  const { register, handleSubmit, watch, formState: { errors }, setValue, reset } = useForm({
    defaultValues: {
      common_info: {
        physician: { name: '', role: 'physician' },
        physicist: { name: '', role: 'physicist' },
        patient: { age: '', sex: 'male' }
      },
      dibh_data: {
        treatment_site: '',
        immobilization_device: '',
        dose: 40,
        fractions: 15
      }
    }
  });

  const watchDose = watch('dibh_data.dose');
  const watchFractions = watch('dibh_data.fractions');
  const watchTreatmentSite = watch('dibh_data.treatment_site');
  
  // Calculate dose per fraction
  const dosePerFraction = watchDose && watchFractions ? (watchDose / watchFractions) : 0;
  const fractionationDescription = dosePerFraction <= 2.0 ? 'conventional fractionation' : 'hypofractionated';

  // Load initial data
  useEffect(() => {
    const fetchInitialData = async () => {
      setInitialLoading(true);
      try {
        const [sitesData, devicesData, schemesData] = await Promise.all([
          getTreatmentSites(),
          getImmobilizationDevices(),
          getFractionationSchemes()
        ]);
        
        setTreatmentSites(sitesData);
        setImmobilizationDevices(devicesData);
        setFractionationSchemes(schemesData);
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

    // For development, use hardcoded values if API is not yet implemented
    const useMockData = true;
    
    if (useMockData) {
      setTreatmentSites(['left breast', 'right breast', 'diaphragm', 'chest wall']);
      setImmobilizationDevices(['breast board', 'wing board']);
      setFractionationSchemes({
        'left breast': [
          { dose: 40, fractions: 15, description: 'Hypofractionated' },
          { dose: 50, fractions: 25, description: 'Conventional' }
        ],
        'right breast': [
          { dose: 40, fractions: 15, description: 'Hypofractionated' },
          { dose: 50, fractions: 25, description: 'Conventional' }
        ],
        'diaphragm': [
          { dose: 45, fractions: 15, description: 'Standard' }
        ],
        'chest wall': [
          { dose: 40, fractions: 15, description: 'Hypofractionated' },
          { dose: 50, fractions: 25, description: 'Conventional' }
        ]
      });
      setInitialLoading(false);
    } else {
      fetchInitialData();
    }
  }, [toast]);

  // Update dose and fractions when treatment site changes
  useEffect(() => {
    if (watchTreatmentSite && fractionationSchemes[watchTreatmentSite]?.length > 0) {
      const defaultScheme = fractionationSchemes[watchTreatmentSite][0];
      setValue('dibh_data.dose', defaultScheme.dose);
      setValue('dibh_data.fractions', defaultScheme.fractions);
    }
  }, [watchTreatmentSite, fractionationSchemes, setValue]);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      // Add calculated dose per fraction to data
      data.dibh_data.dose_per_fraction = dosePerFraction;
      
      const result = await generateDIBHWriteup(data);
      
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
    if (originalWriteup && originalWriteup.trim()) {
      return originalWriteup;
    }
    
    // Otherwise, generate one client-side using the template from the old module
    const physician = formData.common_info?.physician?.name || 'Unknown';
    const physicist = formData.common_info?.physicist?.name || 'Unknown';
    const patientAge = formData.common_info?.patient?.age || 'Unknown';
    const patientSex = formData.common_info?.patient?.sex || 'Unknown';
    const treatmentSite = formData.dibh_data?.treatment_site || 'Unknown';
    const dose = formData.dibh_data?.dose || 0;
    const fractions = formData.dibh_data?.fractions || 1;
    const immobilizationDevice = formData.dibh_data?.immobilization_device || 'Unknown';
    
    // Calculate dose per fraction with safety check
    const dose_per_fraction = fractions > 0 ? dose / fractions : 0;
    
    // Determine fractionation description
    const fractionation_description = dose_per_fraction > 2.0 ? "hypofractionation" : "conventional fractionation";
    
    // Add specific details based on treatment site
    let site_specific_text;
    if (treatmentSite === "left breast") {
      site_specific_text = "left breast using a DIBH technique to significantly reduce cardiac dose";
    } else if (treatmentSite === "right breast") {
      site_specific_text = "right breast using a DIBH technique to minimize breathing motion during radiation delivery";
    } else {
      site_specific_text = `${treatmentSite} using a DIBH technique to minimize breathing motion during radiation delivery`;
    }
    
    // Default values for fixed parameters
    const machine = "linear accelerator";
    const scanning_system = "C-RAD";
    
    let writeup = `Dr. ${physician} requested a medical physics consultation for --- for a gated, DIBH treatment. `;
    writeup += `The patient is a ${patientAge}-year-old ${patientSex} with a ${treatmentSite} lesion. `;
    writeup += `Dr. ${physician} has elected to treat the ${site_specific_text} `;
    writeup += `with the C-RAD positioning and gating system in conjunction with the ${machine}.\n\n`;
    
    writeup += `Days before the initial radiation delivery, the patient was simulated in the treatment `;
    writeup += `position using a ${immobilizationDevice} to aid in immobilization `;
    writeup += `and localization. Instructions were provided and the patient was coached to reproducibly `;
    writeup += `hold their breath. Using the ${scanning_system} surface scanning system, a free breathing `;
    writeup += `and breath hold signal trace was established. After reproducing the `;
    writeup += `breath hold pattern and establishing a consistent `;
    writeup += `breathing pattern, a gating baseline and gating window was created. Subsequently, a `;
    writeup += `DIBH CT simulation scan was acquired and approved `;
    writeup += `by the Radiation Oncologist, Dr. ${physician}.\n\n`;
    
    writeup += `A radiation treatment plan was developed on the DIBH CT simulation to deliver a `;
    writeup += `prescribed dose of ${dose} Gy in ${fractions} fractions (${dose_per_fraction.toFixed(2)} Gy per fraction) `;
    writeup += `to the ${treatmentSite} using ${fractionation_description}. `;
    writeup += `The delivery of the DIBH gating technique on the linear accelerator will be performed `;
    writeup += `using the C-RAD CatalystHD. The CatalystHD will be used to position the patient, `;
    writeup += `monitor intra-fraction motion, and gate the beam delivery. Verification of the patient `;
    writeup += `position will be validated with a DIBH kV-CBCT. Treatment plan calculations and delivery `;
    writeup += `procedures were reviewed and approved by the prescribing radiation oncologist, Dr. ${physician}, `;
    writeup += `and the radiation oncology physicist, Dr. ${physicist}.`;
    
    return writeup;
  };

  const handleResetForm = () => {
    reset({
      common_info: {
        physician: { name: '', role: 'physician' },
        physicist: { name: '', role: 'physicist' },
        patient: { age: '', sex: 'male' }
      },
      dibh_data: {
        treatment_site: '',
        immobilization_device: '',
        dose: 40,
        fractions: 15
      }
    });
    setWriteup('');
    
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
        <Text fontSize="lg" mb={2} color="white">Loading DIBH form data...</Text>
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
            <Heading size="xl" mb={2}>📝 DIBH Write-up Generator</Heading>
            <Text opacity={0.9}>Document deep inspiration breath hold procedures</Text>
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
              
              {/* Treatment Information */}
              <GridItem 
                as={Box} 
                p={4} 
                borderWidth="1px" 
                borderRadius="md" 
                bg={formBg}
                borderColor={borderColor}
                boxShadow="sm"
              >
                <Heading size="sm" mb={3} textAlign="center" color="white">Treatment Information</Heading>
                
                <FormControl isInvalid={errors.dibh_data?.treatment_site} mb={3}>
                  <FormLabel fontSize="sm" color="gray.300">Treatment Site</FormLabel>
                  <Select 
                    size="sm"
                    {...register("dibh_data.treatment_site", { 
                      required: "Treatment site is required" 
                    })}
                    aria-label="Select treatment site"
                    bg="gray.700"
                    borderColor="gray.600"
                    color="white"
                    _hover={{ borderColor: "gray.500" }}
                  >
                    <option value="">Select a treatment site</option>
                    {treatmentSites.map(site => (
                      <option key={site} value={site}>{site}</option>
                    ))}
                  </Select>
                  <FormErrorMessage>
                    {errors.dibh_data?.treatment_site?.message}
                  </FormErrorMessage>
                </FormControl>
                
                <FormControl isInvalid={errors.dibh_data?.immobilization_device} mb={3}>
                  <FormLabel fontSize="sm" color="gray.300">Immobilization Device</FormLabel>
                  <Select 
                    size="sm"
                    {...register("dibh_data.immobilization_device", { 
                      required: "Immobilization device is required" 
                    })}
                    aria-label="Select immobilization device"
                    bg="gray.700"
                    borderColor="gray.600"
                    color="white"
                    _hover={{ borderColor: "gray.500" }}
                  >
                    <option value="">Select a device</option>
                    {immobilizationDevices.map(device => (
                      <option key={device} value={device}>{device}</option>
                    ))}
                  </Select>
                  <FormErrorMessage>
                    {errors.dibh_data?.immobilization_device?.message}
                  </FormErrorMessage>
                </FormControl>
                
                {watchTreatmentSite && fractionationSchemes[watchTreatmentSite] && (
                  <Box mb={3}>
                    <Text fontSize="sm" fontWeight="medium" mb={1} color="gray.300">Available Fractionation Schemes:</Text>
                    <Grid templateColumns="repeat(2, 1fr)" gap={2}>
                      {fractionationSchemes[watchTreatmentSite].map((scheme, index) => (
                        <Button
                          key={index}
                          size="xs"
                          variant={
                            watchDose === scheme.dose && watchFractions === scheme.fractions 
                              ? "solid" 
                              : "outline"
                          }
                          colorScheme="green"
                          onClick={() => {
                            setValue('dibh_data.dose', scheme.dose);
                            setValue('dibh_data.fractions', scheme.fractions);
                          }}
                          color={
                            watchDose === scheme.dose && watchFractions === scheme.fractions 
                              ? "white" 
                              : "green.300"
                          }
                          borderColor="green.600"
                          _hover={{
                            bg: watchDose === scheme.dose && watchFractions === scheme.fractions 
                              ? "green.600" 
                              : "green.800",
                            borderColor: "green.400"
                          }}
                        >
                          {scheme.dose}Gy / {scheme.fractions}fx
                          {scheme.description && (
                            <Badge ml={1} fontSize="0.6em" colorScheme="blue">
                              {scheme.description}
                            </Badge>
                          )}
                        </Button>
                      ))}
                    </Grid>
                  </Box>
                )}
              </GridItem>
              
              {/* Dose Information */}
              <GridItem 
                as={Box} 
                p={4} 
                borderWidth="1px" 
                borderRadius="md" 
                bg={formBg}
                borderColor={borderColor}
                boxShadow="sm"
              >
                <Heading size="sm" mb={3} textAlign="center" color="white">Dose Information</Heading>
                
                <FormControl isInvalid={errors.dibh_data?.dose} mb={3}>
                  <FormLabel fontSize="sm" color="gray.300">Prescription Dose (Gy)</FormLabel>
                  <NumberInput
                    size="sm"
                    min={0}
                    step={0.1}
                    defaultValue={40}
                    onChange={(value) => setValue('dibh_data.dose', parseFloat(value))}
                    value={watchDose}
                  >
                    <NumberInputField 
                      {...register("dibh_data.dose", { 
                        required: "Dose is required",
                        min: { value: 0.1, message: "Dose must be greater than 0" }
                      })}
                      bg="gray.700"
                      borderColor="gray.600"
                      color="white"
                      _hover={{ borderColor: "gray.500" }}
                      _focus={{ borderColor: "green.500" }}
                    />
                    <NumberInputStepper>
                      <NumberIncrementStepper color="gray.300" _hover={{ bg: "gray.600" }} />
                      <NumberDecrementStepper color="gray.300" _hover={{ bg: "gray.600" }} />
                    </NumberInputStepper>
                  </NumberInput>
                  <FormErrorMessage>
                    {errors.dibh_data?.dose?.message}
                  </FormErrorMessage>
                </FormControl>
                
                <FormControl isInvalid={errors.dibh_data?.fractions} mb={3}>
                  <FormLabel fontSize="sm" color="gray.300">Number of Fractions</FormLabel>
                  <NumberInput
                    size="sm"
                    min={1}
                    step={1}
                    defaultValue={15}
                    onChange={(value) => setValue('dibh_data.fractions', parseInt(value))}
                    value={watchFractions}
                  >
                    <NumberInputField 
                      {...register("dibh_data.fractions", { 
                        required: "Fractions is required",
                        min: { value: 1, message: "Minimum 1 fraction" }
                      })}
                      bg="gray.700"
                      borderColor="gray.600"
                      color="white"
                      _hover={{ borderColor: "gray.500" }}
                      _focus={{ borderColor: "green.500" }}
                    />
                    <NumberInputStepper>
                      <NumberIncrementStepper color="gray.300" _hover={{ bg: "gray.600" }} />
                      <NumberDecrementStepper color="gray.300" _hover={{ bg: "gray.600" }} />
                    </NumberInputStepper>
                  </NumberInput>
                  <FormErrorMessage>
                    {errors.dibh_data?.fractions?.message}
                  </FormErrorMessage>
                </FormControl>
                
                {/* Show dose per fraction calculation */}
                {watchDose > 0 && watchFractions > 0 && (
                  <Stat mt={4} borderWidth="1px" borderRadius="md" p={2} bg={writeupBg} borderColor={borderColor}>
                    <StatLabel fontSize="xs" color="gray.300">Dose per Fraction</StatLabel>
                    <StatNumber fontSize="lg" color="white">{dosePerFraction.toFixed(2)} Gy</StatNumber>
                    <StatHelpText fontSize="xs">
                      <Badge colorScheme={dosePerFraction <= 2.0 ? "green" : "orange"}>
                        {fractionationDescription}
                      </Badge>
                    </StatHelpText>
                  </Stat>
                )}
              </GridItem>
            </Grid>
            
            <Flex gap={4} mb={6}>
              <Button
                colorScheme="green"
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
      </Box>
    </Box>
  );
};

export default DIBHForm; 