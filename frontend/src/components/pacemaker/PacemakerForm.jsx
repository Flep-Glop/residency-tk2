import React, { useState, useEffect } from 'react';
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
  RadioGroup,
  Radio,
  Stack,
  VStack,
  HStack,
  Container,
  Spinner,
  Center,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText
} from '@chakra-ui/react';
import { WarningIcon, CheckIcon } from '@chakra-ui/icons';
import { 
  getTreatmentSites, 
  getDeviceInfo, 
  getTreatmentSiteInfo, 
  calculateRiskAssessment, 
  generatePacemakerWriteup 
} from '../../services/pacemakerService';

const PacemakerForm = () => {
  // State variables
  const [treatmentSites, setTreatmentSites] = useState([]);
  const [deviceInfo, setDeviceInfo] = useState({ vendors: [], models_by_vendor: {} });
  const [distanceOptions, setDistanceOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [writeup, setWriteup] = useState('');
  const [riskAssessment, setRiskAssessment] = useState(null);
  const [selectedVendor, setSelectedVendor] = useState('');
  const toast = useToast();
  
  // Default staff lists (can be moved to a service later)
  const [physicians] = useState(['Dalwadi', 'Galvan', 'Ha', 'Kluwe', 'Le', 'Lewis', 'Newman']);
  const [physicists] = useState(['Bassiri', 'Kirby', 'Papanikolaou', 'Paschal', 'Rasmussen']);
  
  // Fixed dark theme colors for consistency
  const formBg = 'gray.800';
  const writeupBg = 'gray.800';
  const borderColor = 'gray.600';

  // Form setup with react-hook-form
  const { register, handleSubmit, watch, formState: { errors }, setValue, reset } = useForm({
    defaultValues: {
      common_info: {
        physician: { name: '', role: 'physician' },
        physicist: { name: '', role: 'physicist' },
        patient: { age: '', sex: 'male' }
      },
      pacemaker_data: {
        treatment_site: '',
        dose: 45.0,
        fractions: 15,
        field_distance: '',
        neutron_producing: 'No',
        device_vendor: '',
        device_model: '',
        device_serial: '',
        pacing_dependent: 'No',
        tps_max_dose: 0.5,
        tps_mean_dose: 0.2,
        osld_mean_dose: 0.0,
        risk_level: null
      }
    }
  });

  // Watch form values for real-time updates
  const watchedValues = watch();
  const pacemakerData = watchedValues.pacemaker_data || {};

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setInitialLoading(true);
        
        const [sitesData, deviceData, siteInfoData] = await Promise.all([
          getTreatmentSites(),
          getDeviceInfo(),
          getTreatmentSiteInfo()
        ]);

        setTreatmentSites(sitesData);
        setDeviceInfo(deviceData);
        setDistanceOptions(siteInfoData.distance_options);

      } catch (error) {
        console.error('Error loading initial data:', error);
        toast({
          title: 'Error loading form data',
          description: error.message,
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setInitialLoading(false);
      }
    };

    loadInitialData();
  }, [toast]);

  // Handle vendor selection to update available models
  const handleVendorChange = (vendor) => {
    setSelectedVendor(vendor);
    setValue('pacemaker_data.device_vendor', vendor);
    setValue('pacemaker_data.device_model', ''); // Reset model when vendor changes
  };

  // Calculate risk assessment when relevant fields change
  useEffect(() => {
    const calculateRisk = async () => {
      const { pacing_dependent, field_distance, neutron_producing, tps_max_dose } = pacemakerData;
      
      if (pacing_dependent && field_distance && neutron_producing && tps_max_dose !== undefined) {
        try {
          const assessmentData = {
            pacing_dependent,
            field_distance,
            neutron_producing,
            tps_max_dose
          };
          
          const result = await calculateRiskAssessment(assessmentData);
          setRiskAssessment(result);
          setValue('pacemaker_data.risk_level', result.risk_level);
        } catch (error) {
          console.error('Error calculating risk assessment:', error);
        }
      }
    };

    calculateRisk();
  }, [pacemakerData.pacing_dependent, pacemakerData.field_distance, pacemakerData.neutron_producing, pacemakerData.tps_max_dose, setValue]);

  // Form submission handler
  const onSubmit = async (data) => {
    try {
      setLoading(true);
      setWriteup('');

      // Validate required fields
      const { common_info, pacemaker_data } = data;
      
      if (!common_info.physician.name || !common_info.physicist.name) {
        throw new Error('Please select both physician and physicist');
      }

      if (!pacemaker_data.treatment_site || !pacemaker_data.device_vendor || !pacemaker_data.field_distance) {
        throw new Error('Please fill in all required fields');
      }

      // Check for high risk warning
      if (riskAssessment?.risk_level === 'High') {
        throw new Error('This is a HIGH RISK case. Please consult with a cardiologist and radiation oncologist before proceeding.');
      }

      const response = await generatePacemakerWriteup(data);
      setWriteup(response.writeup);

      toast({
        title: 'Write-up generated successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

    } catch (error) {
      console.error('Error generating write-up:', error);
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

  // Copy write-up to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(writeup);
    toast({
      title: 'Write-up copied to clipboard',
      status: 'success',
      duration: 2000,
      isClosable: true,
    });
  };

  if (initialLoading) {
    return (
      <Box bg="gray.900" minH="100vh" textAlign="center" p={5}>
        <Text fontSize="lg" mb={2} color="white">Loading pacemaker form data...</Text>
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
            <Heading size="xl" mb={2}>🔋 Pacemaker / CIED Documentation</Heading>
            <Text opacity={0.9}>Cardiac Implantable Electronic Device (CIED) management for radiation therapy</Text>
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
              gap={6}
            >
              {/* Column 1: Staff & Patient */}
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
                      {...register('common_info.physician.name', { required: 'Physician is required' })}
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
                    <FormErrorMessage>{errors.common_info?.physician?.name?.message}</FormErrorMessage>
                  </FormControl>

                  <FormControl isInvalid={errors.common_info?.physicist?.name} mb={3}>
                    <FormLabel fontSize="sm" color="gray.300">Physicist Name</FormLabel>
                    <Select 
                      size="sm"
                      {...register('common_info.physicist.name', { required: 'Physicist is required' })}
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
                    <FormErrorMessage>{errors.common_info?.physicist?.name?.message}</FormErrorMessage>
                  </FormControl>
                </Box>
                
                <Box mt={4}>
                  <Heading size="xs" mb={2} color="gray.300">Patient Information</Heading>
                  
                  <FormControl isInvalid={errors.common_info?.patient?.age} mb={3}>
                    <FormLabel fontSize="sm" color="gray.300">Patient Age</FormLabel>
                    <Input 
                      size="sm"
                      type="number"
                      {...register('common_info.patient.age', { 
                        pattern: {
                          value: /^[0-9]+$/,
                          message: "Age must be a whole number"
                        }
                      })}
                      placeholder="Enter patient age"
                      bg="gray.700"
                      borderColor="gray.600"
                      color="white"
                      _hover={{ borderColor: "gray.500" }}
                      _placeholder={{ color: "gray.400" }}
                    />
                    <FormErrorMessage>{errors.common_info?.patient?.age?.message}</FormErrorMessage>
                  </FormControl>

                  <FormControl isInvalid={errors.common_info?.patient?.sex} mb={3}>
                    <FormLabel fontSize="sm" color="gray.300">Patient Sex</FormLabel>
                    <Select 
                      size="sm"
                      {...register('common_info.patient.sex')}
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
                      <option value="other" style={{ backgroundColor: '#2D3748', color: 'white' }}>Other</option>
                    </Select>
                    <FormErrorMessage>{errors.common_info?.patient?.sex?.message}</FormErrorMessage>
                  </FormControl>
                </Box>
              </GridItem>

              {/* Column 2: Treatment & Device Information */}
              <GridItem 
                as={Box} 
                p={4} 
                borderWidth="1px" 
                borderRadius="md" 
                bg={formBg}
                borderColor={borderColor}
                boxShadow="sm"
              >
                <Heading size="sm" mb={3} textAlign="center" color="white">Treatment & Device Information</Heading>
                
                <Box>
                  <Heading size="xs" mb={2} color="gray.300">Treatment Information</Heading>
                  
                  <FormControl isInvalid={errors.pacemaker_data?.treatment_site} mb={3}>
                    <FormLabel fontSize="sm" color="gray.300">Treatment Site</FormLabel>
                    <Select 
                      size="sm"
                      {...register('pacemaker_data.treatment_site', { required: 'Treatment site is required' })}
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
                    <FormErrorMessage>{errors.pacemaker_data?.treatment_site?.message}</FormErrorMessage>
                  </FormControl>

                  <FormControl isInvalid={errors.pacemaker_data?.field_distance} mb={3}>
                    <FormLabel fontSize="sm" color="gray.300">Distance from Treatment Field to CIED</FormLabel>
                    <Select 
                      size="sm"
                      {...register('pacemaker_data.field_distance', { required: 'Field distance is required' })}
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
                      <option value="" style={{ backgroundColor: '#2D3748', color: 'white' }}>Select distance...</option>
                      {distanceOptions.map(option => (
                        <option key={option} value={option} style={{ backgroundColor: '#2D3748', color: 'white' }}>{option}</option>
                      ))}
                    </Select>
                    <FormErrorMessage>{errors.pacemaker_data?.field_distance?.message}</FormErrorMessage>
                  </FormControl>

                  <Grid templateColumns="1fr 1fr" gap={2} mb={3}>
                    <FormControl>
                      <FormLabel fontSize="sm" color="gray.300">Prescription Dose (Gy)</FormLabel>
                      <Input 
                        size="sm"
                        type="number"
                        step="0.1"
                        {...register('pacemaker_data.dose', { 
                          required: 'Dose is required',
                          min: { value: 0.1, message: 'Dose must be positive' }
                        })}
                        bg="gray.700"
                        borderColor="gray.600"
                        color="white"
                        _hover={{ borderColor: "gray.500" }}
                        _placeholder={{ color: "gray.400" }}
                      />
                    </FormControl>

                    <FormControl>
                      <FormLabel fontSize="sm" color="gray.300">Number of Fractions</FormLabel>
                      <Input 
                        size="sm"
                        type="number"
                        {...register('pacemaker_data.fractions', { 
                          required: 'Fractions is required',
                          min: { value: 1, message: 'Fractions must be at least 1' }
                        })}
                        bg="gray.700"
                        borderColor="gray.600"
                        color="white"
                        _hover={{ borderColor: "gray.500" }}
                        _placeholder={{ color: "gray.400" }}
                      />
                    </FormControl>
                  </Grid>

                  <FormControl mb={3}>
                    <FormLabel fontSize="sm" color="gray.300">Neutron-Producing Therapy? (Photons &gt;10MV, Protons, etc.)</FormLabel>
                    <RadioGroup value={pacemakerData.neutron_producing || 'No'}>
                      <Stack direction="row" spacing={4}>
                        <Radio 
                          size="sm"
                          value="No" 
                          {...register('pacemaker_data.neutron_producing')}
                          colorScheme="green"
                        >
                          <Text fontSize="sm" color="gray.300">No</Text>
                        </Radio>
                        <Radio 
                          size="sm"
                          value="Yes" 
                          {...register('pacemaker_data.neutron_producing')}
                          colorScheme="green"
                        >
                          <Text fontSize="sm" color="gray.300">Yes</Text>
                        </Radio>
                      </Stack>
                    </RadioGroup>
                  </FormControl>
                </Box>
                
                <Box mt={4}>
                  <Heading size="xs" mb={2} color="gray.300">Device Information</Heading>
                  
                  <Grid templateColumns="1fr 1fr" gap={2} mb={3}>
                    <FormControl isInvalid={errors.pacemaker_data?.device_vendor}>
                      <FormLabel fontSize="sm" color="gray.300">Device Vendor</FormLabel>
                      <Select 
                        size="sm"
                        value={selectedVendor}
                        onChange={(e) => handleVendorChange(e.target.value)}
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
                        <option value="" style={{ backgroundColor: '#2D3748', color: 'white' }}>Select vendor...</option>
                        {deviceInfo.vendors.map(vendor => (
                          <option key={vendor} value={vendor} style={{ backgroundColor: '#2D3748', color: 'white' }}>{vendor}</option>
                        ))}
                      </Select>
                      <FormErrorMessage>{errors.pacemaker_data?.device_vendor?.message}</FormErrorMessage>
                    </FormControl>

                    <FormControl>
                      <FormLabel fontSize="sm" color="gray.300">Device Model</FormLabel>
                      <Select 
                        size="sm"
                        {...register('pacemaker_data.device_model')} 
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
                        <option value="" style={{ backgroundColor: '#2D3748', color: 'white' }}>Select model...</option>
                        {selectedVendor && deviceInfo.models_by_vendor[selectedVendor]?.map(model => (
                          <option key={model} value={model} style={{ backgroundColor: '#2D3748', color: 'white' }}>{model}</option>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  <FormControl mb={3}>
                    <FormLabel fontSize="sm" color="gray.300">Device Serial Number</FormLabel>
                    <Input 
                      size="sm"
                      {...register('pacemaker_data.device_serial')}
                      placeholder="Enter serial number"
                      bg="gray.700"
                      borderColor="gray.600"
                      color="white"
                      _hover={{ borderColor: "gray.500" }}
                      _placeholder={{ color: "gray.400" }}
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel fontSize="sm" color="gray.300">Pacing Dependent?</FormLabel>
                    <RadioGroup value={pacemakerData.pacing_dependent || 'No'}>
                      <Stack direction="row" spacing={3}>
                        <Radio 
                          size="sm"
                          value="Yes" 
                          {...register('pacemaker_data.pacing_dependent')}
                          colorScheme="green"
                        >
                          <Text fontSize="sm" color="gray.300">Yes</Text>
                        </Radio>
                        <Radio 
                          size="sm"
                          value="No" 
                          {...register('pacemaker_data.pacing_dependent')}
                          colorScheme="green"
                        >
                          <Text fontSize="sm" color="gray.300">No</Text>
                        </Radio>
                        <Radio 
                          size="sm"
                          value="Unknown" 
                          {...register('pacemaker_data.pacing_dependent')}
                          colorScheme="green"
                        >
                          <Text fontSize="sm" color="gray.300">Unknown</Text>
                        </Radio>
                      </Stack>
                    </RadioGroup>
                  </FormControl>
                </Box>
              </GridItem>

              {/* Column 3: Dosimetry & Risk Assessment */}
              <GridItem 
                as={Box} 
                p={4} 
                borderWidth="1px" 
                borderRadius="md" 
                bg={formBg}
                borderColor={borderColor}
                boxShadow="sm"
              >
                <Heading size="sm" mb={3} textAlign="center" color="white">Dosimetry & Risk Assessment</Heading>
                
                <Box>
                  <Heading size="xs" mb={2} color="gray.300">Dosimetry Information</Heading>
                  
                  <FormControl mb={3}>
                    <FormLabel fontSize="sm" color="gray.300">TPS Maximum Dose to Device (Gy)</FormLabel>
                    <Input 
                      size="sm"
                      type="number"
                      step="0.01"
                      {...register('pacemaker_data.tps_max_dose')}
                      bg="gray.700"
                      borderColor="gray.600"
                      color="white"
                      _hover={{ borderColor: "gray.500" }}
                      _placeholder={{ color: "gray.400" }}
                    />
                  </FormControl>

                  <FormControl mb={3}>
                    <FormLabel fontSize="sm" color="gray.300">TPS Mean Dose to Device (Gy)</FormLabel>
                    <Input 
                      size="sm"
                      type="number"
                      step="0.01"
                      {...register('pacemaker_data.tps_mean_dose')}
                      bg="gray.700"
                      borderColor="gray.600"
                      color="white"
                      _hover={{ borderColor: "gray.500" }}
                      _placeholder={{ color: "gray.400" }}
                    />
                  </FormControl>

                  <FormControl mb={3}>
                    <FormLabel fontSize="sm" color="gray.300">Diode Measured Mean Dose (Gy)</FormLabel>
                    <Input 
                      size="sm"
                      type="number"
                      step="0.01"
                      {...register('pacemaker_data.osld_mean_dose')}
                      placeholder="0.0 (optional)"
                      bg="gray.700"
                      borderColor="gray.600"
                      color="white"
                      _hover={{ borderColor: "gray.500" }}
                      _placeholder={{ color: "gray.400" }}
                    />
                  </FormControl>
                </Box>

                {/* Risk Assessment Display */}
                {riskAssessment && (
                  <Box mt={4}>
                    <Heading size="xs" mb={2} color="gray.300">Risk Assessment (TG-203)</Heading>
                    
                    <Grid templateColumns="1fr 1fr" gap={2} mb={3}>
                      <Box>
                        <Text fontSize="xs" color="gray.400">Dose Category</Text>
                        <Text fontSize="sm" color="white" fontWeight="bold">{riskAssessment.dose_category}</Text>
                      </Box>
                      <Box>
                        <Text fontSize="xs" color="gray.400">Risk Level</Text>
                        <Badge 
                          colorScheme={
                            riskAssessment.risk_level === 'High' ? 'red' :
                            riskAssessment.risk_level === 'Medium' ? 'yellow' : 'green'
                          }
                          fontSize="sm"
                        >
                          {riskAssessment.risk_level}
                        </Badge>
                      </Box>
                    </Grid>

                    <Box mb={3}>
                      <Text fontSize="xs" color="gray.400" mb={1}>Recommendations:</Text>
                      <VStack align="start" spacing={0}>
                        {riskAssessment.recommendations.map((rec, index) => (
                          <Text key={index} fontSize="xs" color="gray.300">• {rec}</Text>
                        ))}
                      </VStack>
                    </Box>

                    {riskAssessment.is_high_risk_warning && (
                      <Alert status="error" size="sm" mb={3}>
                        <AlertIcon />
                        <Text fontSize="xs" fontWeight="bold">
                          HIGH RISK: Consult cardiologist before proceeding!
                        </Text>
                      </Alert>
                    )}
                  </Box>
                )}
              </GridItem>
            </Grid>

            <Flex gap={4} mb={6} mt={4}>
              <Button
                colorScheme="green"
                isLoading={loading}
                loadingText="Generating write-up..."
                type="submit"
                isDisabled={riskAssessment?.is_high_risk_warning}
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
                onClick={() => {
                  reset();
                  setWriteup('');
                  setRiskAssessment(null);
                  setSelectedVendor('');
                  toast({
                    title: 'Form reset',
                    status: 'info',
                    duration: 2000,
                    isClosable: true,
                  });
                }}
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

          {/* Write-up Section */}
          {writeup && (
            <Box mt={8} bg={writeupBg} p={6} borderRadius="lg" border="1px" borderColor={borderColor}>
              <Flex justify="space-between" align="center" mb={4}>
                <Heading size="md" color="white">Generated Write-Up</Heading>
                <Button size="sm" onClick={copyToClipboard} colorScheme="green">
                  Copy to Clipboard
                </Button>
              </Flex>
              <Textarea
                value={writeup}
                readOnly
                rows={15}
                resize="vertical"
                bg="gray.900"
                color="white"
                border="1px solid"
                borderColor={borderColor}
              />
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default PacemakerForm;