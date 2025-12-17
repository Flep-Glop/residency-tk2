import React, { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/router';
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
  Stat,
  StatLabel,
  StatNumber,
  Checkbox,
  Card,
  CardBody,
  HStack,
  VStack,
  List,
  ListItem,
} from '@chakra-ui/react';
import { getTreatmentSites, getImmobilizationDevices, getFractionationSchemes, generateDIBHWriteup } from '../../services/dibhService';

const DIBHForm = () => {
  const router = useRouter();
  const [treatmentSites, setTreatmentSites] = useState([]);
  const [immobilizationDevices, setImmobilizationDevices] = useState([]);
  const [fractionationSchemes, setFractionationSchemes] = useState({});
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [writeup, setWriteup] = useState('');
  const toast = useToast();
  const [physicians, setPhysicians] = useState(['Dalwadi', 'Galvan', 'Ha', 'Kluwe', 'Le', 'Lewis', 'Tuli']);
  const [physicists, setPhysicists] = useState(['Bassiri', 'Kirby', 'Papanikolaou', 'Paschal', 'Rasmussen']);
  const [isCustomTreatmentSite, setIsCustomTreatmentSite] = useState(false);
  
  // Fixed dark theme colors for consistency
  const formBg = 'gray.800';
  const writeupBg = 'gray.800';
  const borderColor = 'gray.600';

  const { register, handleSubmit, watch, formState: { errors }, setValue, reset } = useForm({
    defaultValues: {
      common_info: {
        physician: { name: '', role: 'physician' },
        physicist: { name: '', role: 'physicist' },
      },
      dibh_data: {
        treatment_site: '',
        custom_treatment_site: '',
        immobilization_device: '',
        dose: '',
        fractions: '',
        has_boost: false,
        boost_dose: '',
        boost_fractions: ''
      }
    }
  });

  const watchDose = watch('dibh_data.dose');
  const watchFractions = watch('dibh_data.fractions');
  const watchTreatmentSite = watch('dibh_data.treatment_site');
  const watchHasBoost = watch('dibh_data.has_boost');
  const watchBoostDose = watch('dibh_data.boost_dose');
  const watchBoostFractions = watch('dibh_data.boost_fractions');
  
  // Calculate dose per fraction for primary and boost
  const primaryDosePerFraction = watchDose && watchFractions ? (watchDose / watchFractions) : 0;
  const boostDosePerFraction = watchBoostDose && watchBoostFractions ? (watchBoostDose / watchBoostFractions) : 0;
  const totalDose = watchDose + (watchHasBoost ? watchBoostDose : 0);
  const totalFractions = watchFractions + (watchHasBoost ? watchBoostFractions : 0);
  
  // Check if treatment site is breast (for auto-setting immobilization device)
  const actualTreatmentSite = isCustomTreatmentSite ? watch('dibh_data.custom_treatment_site') : watchTreatmentSite;
  const isBreastSite = actualTreatmentSite === 'left breast' || actualTreatmentSite === 'right breast';
  
  // Auto-set immobilization device based on treatment site
  useEffect(() => {
    if (isBreastSite) {
      setValue('dibh_data.immobilization_device', 'breast board');
    } else if (actualTreatmentSite && actualTreatmentSite !== '') {
      setValue('dibh_data.immobilization_device', 'wing board');
    }
  }, [isBreastSite, actualTreatmentSite, setValue]);

  // Add handler for custom treatment site
  const handleCustomTreatmentSiteChange = (e) => {
    setIsCustomTreatmentSite(e.target.checked);
    if (e.target.checked) {
      // Clear the standard treatment site
      setValue('dibh_data.treatment_site', '');
    } else {
      // Clear the custom treatment site
      setValue('dibh_data.custom_treatment_site', '');
    }
  };

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

    fetchInitialData();
  }, [toast]);

  // Note: Auto-population removed per user request - users manually enter dose/fractions

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      // Add calculated dose per fraction to data
      data.dibh_data.dose_per_fraction = primaryDosePerFraction;
      
      // Clean up boost fields - convert empty strings to null when has_boost is false
      if (!data.dibh_data.has_boost) {
        data.dibh_data.boost_dose = null;
        data.dibh_data.boost_fractions = null;
      } else {
        // Convert string values to numbers when has_boost is true
        data.dibh_data.boost_dose = parseFloat(data.dibh_data.boost_dose);
        data.dibh_data.boost_fractions = parseInt(data.dibh_data.boost_fractions);
      }
      
      // Convert main dose/fractions to numbers
      data.dibh_data.dose = parseFloat(data.dibh_data.dose);
      data.dibh_data.fractions = parseInt(data.dibh_data.fractions);
      
      const result = await generateDIBHWriteup(data);
      
      // Use the backend-generated writeup directly
      setWriteup(result.writeup);
      
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


  const handleResetForm = () => {
    reset({
      common_info: {
        physician: { name: '', role: 'physician' },
        physicist: { name: '', role: 'physicist' },
      },
      dibh_data: {
        treatment_site: '',
        custom_treatment_site: '',
        immobilization_device: '', // Auto-assigned based on treatment site
        dose: '',
        fractions: '',
        has_boost: false,
        boost_dose: '',
        boost_fractions: ''
      }
    });
    setWriteup('');
    setIsCustomTreatmentSite(false);
    
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
            <Heading size="md" mb={2}>DIBH Write-up Generator</Heading>
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
              {/* Staff Info Section */}
              <GridItem 
                p={4} 
                borderWidth="1px" 
                borderRadius="md" 
                bg={formBg}
                borderColor={borderColor}
                boxShadow="sm"
              >
                <Heading size="sm" mb={3} textAlign="center" color="white">Staff Info</Heading>
                <Box>
                  
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
                      <option value=""></option>
                      {physicians.map(physician => (
                        <option key={physician} value={physician} style={{ backgroundColor: '#2D3748', color: 'white' }}>{physician}</option>
                      ))}
                    </Select>
                    <FormErrorMessage sx={{ color: 'red.300' }}>
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
                      <option value=""></option>
                      {physicists.map(physicist => (
                        <option key={physicist} value={physicist} style={{ backgroundColor: '#2D3748', color: 'white' }}>{physicist}</option>
                      ))}
                    </Select>
                    <FormErrorMessage sx={{ color: 'red.300' }}>
                      {errors.common_info?.physicist?.name?.message}
                    </FormErrorMessage>
                  </FormControl>
                </Box>
              </GridItem>
              
              {/* Treatment Information */}
              <GridItem 
                p={4} 
                borderWidth="1px" 
                borderRadius="md" 
                bg={formBg}
                borderColor={borderColor}
                boxShadow="sm"
              >
                <Heading size="sm" mb={3} textAlign="center" color="white">Treatment Info</Heading>
                {!isCustomTreatmentSite ? (
                  <FormControl isInvalid={errors.dibh_data?.treatment_site} mb={3}>
                    <FormLabel fontSize="sm" color="gray.300">Treatment Site</FormLabel>
                    <Select 
                      size="sm"
                      {...register("dibh_data.treatment_site", { 
                        required: !isCustomTreatmentSite ? "Treatment site is required" : false
                      })}
                      aria-label="Select treatment site"
                      bg="gray.700"
                      borderColor="gray.600"
                      color="white"
                      _hover={{ borderColor: "gray.500" }}
                      isDisabled={isCustomTreatmentSite}
                      data-theme="dark"
                      sx={{
                        '& option': {
                          backgroundColor: 'gray.700',
                          color: 'white',
                        }
                      }}
                    >
                      <option value=""></option>
                      {treatmentSites.map(site => (
                        <option key={site} value={site} style={{ backgroundColor: '#2D3748', color: 'white' }}>{site}</option>
                      ))}
                    </Select>
                    <FormErrorMessage sx={{ color: 'red.300' }}>
                      {errors.dibh_data?.treatment_site?.message}
                    </FormErrorMessage>
                  </FormControl>
                ) : (
                  <FormControl isInvalid={errors.dibh_data?.custom_treatment_site} mb={3}>
                    <FormLabel fontSize="sm" color="gray.300">Custom Treatment Site Name</FormLabel>
                    <Input
                      size="sm"
                      {...register("dibh_data.custom_treatment_site", {
                        required: isCustomTreatmentSite ? "Custom treatment site name is required" : false
                      })}
                      aria-label="Custom treatment site name"
                      placeholder="Enter custom treatment site"
                      bg="gray.700"
                      borderColor="gray.600"
                      color="white"
                      _hover={{ borderColor: "gray.500" }}
                      _placeholder={{ color: "gray.400" }}
                    />
                    <FormErrorMessage sx={{ color: 'red.300' }}>
                      {errors.dibh_data?.custom_treatment_site?.message}
                    </FormErrorMessage>
                  </FormControl>
                )}
                
                <Checkbox
                  isChecked={isCustomTreatmentSite}
                  onChange={handleCustomTreatmentSiteChange}
                  mb={3}
                  colorScheme="blue"
                >
                  <Text fontSize="sm" color="gray.300">Custom Treatment Site?</Text>
                </Checkbox>
              </GridItem>
              
              {/* Dose Information & Preview */}
              <GridItem 
                p={4} 
                borderWidth="1px" 
                borderRadius="md" 
                bg={formBg}
                borderColor={borderColor}
                boxShadow="sm"
              >
                <Heading size="sm" mb={3} textAlign="center" color="white">Dose Information</Heading>
                
                <Grid templateColumns="repeat(2, 1fr)" gap={2} mb={3}>
                  <FormControl isInvalid={errors.dibh_data?.dose}>
                    <FormLabel fontSize="sm" color="gray.300">Rx Dose (Gy)</FormLabel>
                    <Input
                      size="sm"
                      type="number"
                      step="0.1"
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
                    <FormErrorMessage sx={{ color: 'red.300' }}>
                      {errors.dibh_data?.dose?.message}
                    </FormErrorMessage>
                  </FormControl>
                  
                  <FormControl isInvalid={errors.dibh_data?.fractions}>
                    <FormLabel fontSize="sm" color="gray.300">Number of Fx</FormLabel>
                    <Input
                      size="sm"
                      type="number"
                      step="1"
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
                    <FormErrorMessage sx={{ color: 'red.300' }}>
                      {errors.dibh_data?.fractions?.message}
                    </FormErrorMessage>
                  </FormControl>
                </Grid>
                
                <FormControl mb={3}>
                  <Checkbox 
                    size="sm" 
                    isChecked={watchHasBoost} 
                    {...register("dibh_data.has_boost")}
                    onChange={(e) => setValue('dibh_data.has_boost', e.target.checked)}
                    colorScheme="green"
                    color="gray.300"
                  >
                    Has Boost
                  </Checkbox>
                </FormControl>
                
                {watchHasBoost && (
                  <>
                    <Grid templateColumns="repeat(2, 1fr)" gap={2} mb={3}>
                      <FormControl isInvalid={errors.dibh_data?.boost_dose}>
                        <FormLabel fontSize="sm" color="gray.300">Boost Rx (Gy)</FormLabel>
                        <Input
                          size="sm"
                          type="number"
                          step="0.1"
                          {...register("dibh_data.boost_dose", { 
                            required: watchHasBoost ? "Boost dose is required" : false,
                            min: { value: 0.1, message: "Boost dose must be greater than 0" }
                          })}
                          bg="gray.700"
                          borderColor="gray.600"
                          color="white"
                          _hover={{ borderColor: "gray.500" }}
                          _focus={{ borderColor: "green.500" }}
                        />
                        <FormErrorMessage sx={{ color: 'red.300' }}>
                          {errors.dibh_data?.boost_dose?.message}
                        </FormErrorMessage>
                      </FormControl>
                      
                      <FormControl isInvalid={errors.dibh_data?.boost_fractions}>
                        <FormLabel fontSize="sm" color="gray.300">Boost Fx</FormLabel>
                        <Input
                          size="sm"
                          type="number"
                          step="1"
                          {...register("dibh_data.boost_fractions", { 
                            required: watchHasBoost ? "Boost fractions is required" : false,
                            min: { value: 1, message: "Minimum 1 boost fraction" }
                          })}
                          bg="gray.700"
                          borderColor="gray.600"
                          color="white"
                          _hover={{ borderColor: "gray.500" }}
                          _focus={{ borderColor: "green.500" }}
                        />
                        <FormErrorMessage sx={{ color: 'red.300' }}>
                          {errors.dibh_data?.boost_fractions?.message}
                        </FormErrorMessage>
                      </FormControl>
                    </Grid>
                  </>
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
          
          {/* Generated Write-up Section - Below Form */}
          {writeup && (
            <Box mt={6}>
              <Box
                p={4}
                borderWidth={1}
                borderRadius="md"
                bg={writeupBg}
                borderColor={borderColor}
                boxShadow="md"
              >
                <Flex justify="space-between" align="center" mb={3}>
                  <Heading size="sm" color="white">Generated Write-up</Heading>
                  <Button
                    size="sm"
                    colorScheme="green"
                    onClick={() => {
                      navigator.clipboard.writeText(writeup);
                      toast({
                        title: "Copied to clipboard",
                        status: "success",
                        duration: 2000,
                      });
                    }}
                  >
                    Copy to Clipboard
                  </Button>
                </Flex>
                <Textarea
                  value={writeup}
                  height="300px"
                  isReadOnly
                  fontSize="sm"
                  lineHeight="1"
                  resize="vertical"
                  aria-label="Generated write-up"
                  bg="gray.700"
                  borderColor="gray.600"
                  color="white"
                  _focus={{ borderColor: "green.500" }}
                  sx={{ fontFamily: '"Aseprite", monospace !important' }}
                />
              </Box>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default DIBHForm; 