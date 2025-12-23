import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
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
  RadioGroup,
  VStack,
  HStack,
  Container,
  Spinner,
  Center,
  Checkbox
} from '@chakra-ui/react';
import { WarningIcon, CheckIcon } from '@chakra-ui/icons';
import { 
  getTreatmentSites, 
  getDeviceInfo, 
  getTreatmentSiteInfo, 
  calculateRiskAssessment, 
  generateNeurostimulatorWriteup 
} from '../../services/neurostimulatorService';

const NeurostimulatorForm = () => {
  // State variables
  const [treatmentSites, setTreatmentSites] = useState([]);
  const [deviceInfo, setDeviceInfo] = useState({ vendors: [], models_by_vendor: {}, device_types: [] });
  const [distanceOptions, setDistanceOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [writeup, setWriteup] = useState('');
  const [riskAssessment, setRiskAssessment] = useState(null);
  const [selectedVendor, setSelectedVendor] = useState('');
  const [isCustomDevice, setIsCustomDevice] = useState(false);
  const toast = useToast();
  
  // Default staff lists
  const [physicians] = useState(['Dalwadi', 'Galvan', 'Ha', 'Kluwe', 'Le', 'Lewis', 'Tuli']);
  const [physicists] = useState(['Bassiri', 'Kirby', 'Papanikolaou', 'Paschal', 'Rasmussen']);
  
  // Fixed dark theme colors for consistency
  const formBg = 'gray.800';
  const writeupBg = 'gray.800';
  const borderColor = 'gray.600';

  // Form setup with react-hook-form
  const { register, handleSubmit, watch, formState: { errors }, setValue, reset, control } = useForm({
    defaultValues: {
      common_info: {
        physician: { name: '', role: 'physician' },
        physicist: { name: '', role: 'physicist' },
      },
      neurostimulator_data: {
        treatment_site: '',
        dose: '',
        fractions: '',
        field_distance: '',
        neutron_producing: 'No',
        device_vendor: '',
        device_model: '',
        device_type: '',
        custom_device_vendor: '',
        custom_device_model: '',
        device_serial: '',
        tps_max_dose: '',
        osld_mean_dose: 0.0,
        risk_level: null
      }
    }
  });

  // Watch form values for real-time updates
  const watchedValues = watch();
  const neurostimulatorData = watchedValues.neurostimulator_data || {};

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
    setValue('neurostimulator_data.device_vendor', vendor);
    setValue('neurostimulator_data.device_model', ''); // Reset model when vendor changes
  };

  // Handle custom device checkbox
  const handleCustomDeviceChange = (e) => {
    setIsCustomDevice(e.target.checked);
    if (e.target.checked) {
      setValue('neurostimulator_data.device_vendor', '');
      setValue('neurostimulator_data.device_model', '');
      setSelectedVendor('');
    } else {
      setValue('neurostimulator_data.custom_device_vendor', '');
      setValue('neurostimulator_data.custom_device_model', '');
    }
  };

  // Calculate risk assessment when relevant fields change
  useEffect(() => {
    const calculateRisk = async () => {
      const { field_distance, neutron_producing, tps_max_dose } = neurostimulatorData;
      
      if (field_distance && neutron_producing && tps_max_dose !== undefined) {
        try {
          const assessmentData = {
            field_distance,
            neutron_producing,
            tps_max_dose
          };
          
          const result = await calculateRiskAssessment(assessmentData);
          setRiskAssessment(result);
          setValue('neurostimulator_data.risk_level', result.risk_level);
        } catch (error) {
          console.error('Error calculating risk assessment:', error);
        }
      }
    };

    calculateRisk();
  }, [neurostimulatorData.field_distance, neurostimulatorData.neutron_producing, neurostimulatorData.tps_max_dose, setValue]);

  // Form submission handler
  const onSubmit = async (data) => {
    try {
      setLoading(true);
      setWriteup('');

      // Validate required fields
      const { common_info, neurostimulator_data } = data;
      
      if (!common_info.physician.name || !common_info.physicist.name) {
        throw new Error('Please select both physician and physicist');
      }

      const hasVendor = isCustomDevice ? neurostimulator_data.custom_device_vendor : neurostimulator_data.device_vendor;
      if (!neurostimulator_data.treatment_site || !hasVendor || !neurostimulator_data.field_distance || !neurostimulator_data.device_type) {
        throw new Error('Please fill in all required fields');
      }
      
      // If custom device, copy custom values to main fields for backend
      if (isCustomDevice) {
        data.neurostimulator_data.device_vendor = neurostimulator_data.custom_device_vendor;
        data.neurostimulator_data.device_model = neurostimulator_data.custom_device_model || '';
      }

      // Check for high risk warning
      if (riskAssessment?.risk_level === 'High') {
        throw new Error('This is a HIGH RISK case. Please consult with neurology and the device manufacturer before proceeding.');
      }

      const response = await generateNeurostimulatorWriteup(data);
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
        <Text fontSize="lg" mb={2} color="white">Loading neurostimulator form data...</Text>
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
            <Heading size="md">Neurostimulator Documentation</Heading>
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
              {/* Column 1: Staff Info */}
              <GridItem 
                as={Box} 
                p={4} 
                borderWidth="1px" 
                borderRadius="md" 
                bg={formBg}
                borderColor={borderColor}
                boxShadow="sm"
              >
                <Heading size="sm" mb={3} textAlign="center" color="white">Staff Info</Heading>
                <Box>
                  
                  <FormControl isInvalid={errors.common_info?.physicist?.name} mb={3}>
                    <FormLabel fontSize="sm" color="gray.300" mb={2}>Physicist</FormLabel>
                    <Controller
                      name="common_info.physicist.name"
                      control={control}
                      rules={{ required: 'Physicist is required' }}
                      render={({ field }) => (
                        <Grid templateColumns="1fr 1fr" gap={2}>
                          <GridItem colSpan={2}>
                            <Button
                              size="sm"
                              width="100%"
                              variant={field.value === 'Papanikolaou' ? 'solid' : 'outline'}
                              colorScheme={field.value === 'Papanikolaou' ? 'blue' : 'gray'}
                              color={field.value === 'Papanikolaou' ? 'white' : 'gray.300'}
                              borderColor="gray.600"
                              onClick={() => field.onChange('Papanikolaou')}
                              _hover={{ bg: field.value === 'Papanikolaou' ? 'blue.600' : 'gray.700' }}
                            >
                              Papanikolaou
                            </Button>
                          </GridItem>
                          <Button
                            size="sm"
                            variant={field.value === 'Bassiri' ? 'solid' : 'outline'}
                            colorScheme={field.value === 'Bassiri' ? 'blue' : 'gray'}
                            color={field.value === 'Bassiri' ? 'white' : 'gray.300'}
                            borderColor="gray.600"
                            onClick={() => field.onChange('Bassiri')}
                            _hover={{ bg: field.value === 'Bassiri' ? 'blue.600' : 'gray.700' }}
                          >
                            Bassiri
                          </Button>
                          <Button
                            size="sm"
                            variant={field.value === 'Kirby' ? 'solid' : 'outline'}
                            colorScheme={field.value === 'Kirby' ? 'blue' : 'gray'}
                            color={field.value === 'Kirby' ? 'white' : 'gray.300'}
                            borderColor="gray.600"
                            onClick={() => field.onChange('Kirby')}
                            _hover={{ bg: field.value === 'Kirby' ? 'blue.600' : 'gray.700' }}
                          >
                            Kirby
                          </Button>
                          <Button
                            size="sm"
                            variant={field.value === 'Paschal' ? 'solid' : 'outline'}
                            colorScheme={field.value === 'Paschal' ? 'blue' : 'gray'}
                            color={field.value === 'Paschal' ? 'white' : 'gray.300'}
                            borderColor="gray.600"
                            onClick={() => field.onChange('Paschal')}
                            _hover={{ bg: field.value === 'Paschal' ? 'blue.600' : 'gray.700' }}
                          >
                            Paschal
                          </Button>
                          <Button
                            size="sm"
                            variant={field.value === 'Rasmussen' ? 'solid' : 'outline'}
                            colorScheme={field.value === 'Rasmussen' ? 'blue' : 'gray'}
                            color={field.value === 'Rasmussen' ? 'white' : 'gray.300'}
                            borderColor="gray.600"
                            onClick={() => field.onChange('Rasmussen')}
                            _hover={{ bg: field.value === 'Rasmussen' ? 'blue.600' : 'gray.700' }}
                          >
                            Rasmussen
                          </Button>
                        </Grid>
                      )}
                    />
                    <FormErrorMessage sx={{ color: 'red.300' }}>{errors.common_info?.physicist?.name?.message}</FormErrorMessage>
                  </FormControl>

                  <FormControl isInvalid={errors.common_info?.physician?.name} mb={3}>
                    <FormLabel fontSize="sm" color="gray.300" mb={2}>Physician</FormLabel>
                    <Controller
                      name="common_info.physician.name"
                      control={control}
                      rules={{ required: 'Physician is required' }}
                      render={({ field }) => (
                        <Grid templateColumns="1fr 1fr" gap={2}>
                          <GridItem colSpan={2}>
                            <Button
                              size="sm"
                              width="100%"
                              variant={field.value === 'Tuli' ? 'solid' : 'outline'}
                              colorScheme={field.value === 'Tuli' ? 'blue' : 'gray'}
                              color={field.value === 'Tuli' ? 'white' : 'gray.300'}
                              borderColor="gray.600"
                              onClick={() => field.onChange('Tuli')}
                              _hover={{ bg: field.value === 'Tuli' ? 'blue.600' : 'gray.700' }}
                            >
                              Tuli
                            </Button>
                          </GridItem>
                          <Button
                            size="sm"
                            variant={field.value === 'Dalwadi' ? 'solid' : 'outline'}
                            colorScheme={field.value === 'Dalwadi' ? 'blue' : 'gray'}
                            color={field.value === 'Dalwadi' ? 'white' : 'gray.300'}
                            borderColor="gray.600"
                            onClick={() => field.onChange('Dalwadi')}
                            _hover={{ bg: field.value === 'Dalwadi' ? 'blue.600' : 'gray.700' }}
                          >
                            Dalwadi
                          </Button>
                          <Button
                            size="sm"
                            variant={field.value === 'Galvan' ? 'solid' : 'outline'}
                            colorScheme={field.value === 'Galvan' ? 'blue' : 'gray'}
                            color={field.value === 'Galvan' ? 'white' : 'gray.300'}
                            borderColor="gray.600"
                            onClick={() => field.onChange('Galvan')}
                            _hover={{ bg: field.value === 'Galvan' ? 'blue.600' : 'gray.700' }}
                          >
                            Galvan
                          </Button>
                          <Button
                            size="sm"
                            variant={field.value === 'Ha' ? 'solid' : 'outline'}
                            colorScheme={field.value === 'Ha' ? 'blue' : 'gray'}
                            color={field.value === 'Ha' ? 'white' : 'gray.300'}
                            borderColor="gray.600"
                            onClick={() => field.onChange('Ha')}
                            _hover={{ bg: field.value === 'Ha' ? 'blue.600' : 'gray.700' }}
                          >
                            Ha
                          </Button>
                          <Button
                            size="sm"
                            variant={field.value === 'Kluwe' ? 'solid' : 'outline'}
                            colorScheme={field.value === 'Kluwe' ? 'blue' : 'gray'}
                            color={field.value === 'Kluwe' ? 'white' : 'gray.300'}
                            borderColor="gray.600"
                            onClick={() => field.onChange('Kluwe')}
                            _hover={{ bg: field.value === 'Kluwe' ? 'blue.600' : 'gray.700' }}
                          >
                            Kluwe
                          </Button>
                          <Button
                            size="sm"
                            variant={field.value === 'Le' ? 'solid' : 'outline'}
                            colorScheme={field.value === 'Le' ? 'blue' : 'gray'}
                            color={field.value === 'Le' ? 'white' : 'gray.300'}
                            borderColor="gray.600"
                            onClick={() => field.onChange('Le')}
                            _hover={{ bg: field.value === 'Le' ? 'blue.600' : 'gray.700' }}
                          >
                            Le
                          </Button>
                          <Button
                            size="sm"
                            variant={field.value === 'Lewis' ? 'solid' : 'outline'}
                            colorScheme={field.value === 'Lewis' ? 'blue' : 'gray'}
                            color={field.value === 'Lewis' ? 'white' : 'gray.300'}
                            borderColor="gray.600"
                            onClick={() => field.onChange('Lewis')}
                            _hover={{ bg: field.value === 'Lewis' ? 'blue.600' : 'gray.700' }}
                          >
                            Lewis
                          </Button>
                        </Grid>
                      )}
                    />
                    <FormErrorMessage sx={{ color: 'red.300' }}>{errors.common_info?.physician?.name?.message}</FormErrorMessage>
                  </FormControl>
                </Box>
              </GridItem>

              {/* Column 2: Treatment Information */}
              <GridItem 
                as={Box} 
                p={4} 
                borderWidth="1px" 
                borderRadius="md" 
                bg={formBg}
                borderColor={borderColor}
                boxShadow="sm"
              >
                <Heading size="sm" mb={3} textAlign="center" color="white">Treatment Info</Heading>
                <Box>
                  
                  <FormControl isInvalid={errors.neurostimulator_data?.treatment_site} mb={3}>
                    <FormLabel fontSize="sm" color="gray.300">Treatment Site</FormLabel>
                    <Select 
                      size="sm"
                      {...register('neurostimulator_data.treatment_site', { required: 'Treatment site is required' })}
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
                      <option value="" style={{ backgroundColor: '#2D3748', color: 'white' }}></option>
                      {treatmentSites.map(site => (
                        <option key={site} value={site} style={{ backgroundColor: '#2D3748', color: 'white' }}>{site}</option>
                      ))}
                    </Select>
                    <FormErrorMessage sx={{ color: 'red.300' }}>{errors.neurostimulator_data?.treatment_site?.message}</FormErrorMessage>
                  </FormControl>
                </Box>

                <Box mt={4}>
                  <FormControl isInvalid={errors.neurostimulator_data?.field_distance} mb={3}>
                    <FormLabel fontSize="sm" color="gray.300">Distance from Field to Device</FormLabel>
                    <Grid templateColumns="repeat(4, 1fr)" gap={2}>
                      <Button
                        size="sm"
                        onClick={() => setValue('neurostimulator_data.field_distance', 'More than 10 cm from treatment field edge')}
                        colorScheme={neurostimulatorData.field_distance === 'More than 10 cm from treatment field edge' ? 'cyan' : 'gray'}
                        variant={neurostimulatorData.field_distance === 'More than 10 cm from treatment field edge' ? 'solid' : 'outline'}
                        color={neurostimulatorData.field_distance === 'More than 10 cm from treatment field edge' ? 'white' : 'gray.300'}
                        whiteSpace="normal"
                        height="auto"
                        py={2}
                      >
                        &gt; 10 cm
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => setValue('neurostimulator_data.field_distance', 'Less than 10 cm from field edge but not in direct field')}
                        colorScheme={neurostimulatorData.field_distance === 'Less than 10 cm from field edge but not in direct field' ? 'cyan' : 'gray'}
                        variant={neurostimulatorData.field_distance === 'Less than 10 cm from field edge but not in direct field' ? 'solid' : 'outline'}
                        color={neurostimulatorData.field_distance === 'Less than 10 cm from field edge but not in direct field' ? 'white' : 'gray.300'}
                        whiteSpace="normal"
                        height="auto"
                        py={2}
                      >
                        3-10 cm
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => setValue('neurostimulator_data.field_distance', 'Within 3 cm of field edge')}
                        colorScheme={neurostimulatorData.field_distance === 'Within 3 cm of field edge' ? 'cyan' : 'gray'}
                        variant={neurostimulatorData.field_distance === 'Within 3 cm of field edge' ? 'solid' : 'outline'}
                        color={neurostimulatorData.field_distance === 'Within 3 cm of field edge' ? 'white' : 'gray.300'}
                        whiteSpace="normal"
                        height="auto"
                        py={2}
                      >
                        &lt; 3 cm
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => setValue('neurostimulator_data.field_distance', 'Neurostimulator in direct beam')}
                        colorScheme={neurostimulatorData.field_distance === 'Neurostimulator in direct beam' ? 'cyan' : 'gray'}
                        variant={neurostimulatorData.field_distance === 'Neurostimulator in direct beam' ? 'solid' : 'outline'}
                        color={neurostimulatorData.field_distance === 'Neurostimulator in direct beam' ? 'white' : 'gray.300'}
                        whiteSpace="normal"
                        height="auto"
                        py={2}
                      >
                        Direct Beam
                      </Button>
                    </Grid>
                    <FormErrorMessage sx={{ color: 'red.300' }}>{errors.neurostimulator_data?.field_distance?.message}</FormErrorMessage>
                  </FormControl>
                </Box>

                <Box mt={4}>
                  <FormControl isInvalid={errors.neurostimulator_data?.device_type}>
                    <FormLabel fontSize="sm" color="gray.300">Device Type</FormLabel>
                    <Select 
                      size="sm"
                      {...register('neurostimulator_data.device_type', { required: 'Device type is required' })}
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
                      <option value="" style={{ backgroundColor: '#2D3748', color: 'white' }}></option>
                      {deviceInfo.device_types?.map(type => (
                        <option key={type} value={type} style={{ backgroundColor: '#2D3748', color: 'white' }}>{type}</option>
                      ))}
                    </Select>
                    <FormErrorMessage sx={{ color: 'red.300' }}>{errors.neurostimulator_data?.device_type?.message}</FormErrorMessage>
                  </FormControl>
                </Box>
              </GridItem>

              {/* Column 3: Treatment & Risk Assessment */}
              <GridItem 
                as={Box} 
                p={4} 
                borderWidth="1px" 
                borderRadius="md" 
                bg={formBg}
                borderColor={borderColor}
                boxShadow="sm"
              >
                <Heading size="sm" mb={3} textAlign="center" color="white">Treatment & Risk Assessment</Heading>
                
                <Box>
                  <Grid templateColumns="repeat(2, 1fr)" gap={2} mb={3}>
                    <FormControl isInvalid={errors.neurostimulator_data?.dose}>
                      <FormLabel fontSize="sm" color="gray.300">Dose (Gy)</FormLabel>
                      <Input 
                        size="sm"
                        type="number"
                        step="any"
                        {...register('neurostimulator_data.dose', { 
                          required: 'Dose is required',
                          min: { value: 0.1, message: 'Dose must be positive' }
                        })}
                        placeholder="50"
                        bg="gray.700"
                        borderColor="gray.600"
                        color="white"
                        _hover={{ borderColor: "gray.500" }}
                        _placeholder={{ color: "gray.400" }}
                      />
                      <FormErrorMessage sx={{ color: 'red.300' }}>{errors.neurostimulator_data?.dose?.message}</FormErrorMessage>
                    </FormControl>

                    <FormControl isInvalid={errors.neurostimulator_data?.fractions}>
                      <FormLabel fontSize="sm" color="gray.300">Fx</FormLabel>
                      <Input 
                        size="sm"
                        type="number"
                        {...register('neurostimulator_data.fractions', { 
                          required: 'Fractions is required',
                          min: { value: 1, message: 'Fractions must be at least 1' }
                        })}
                        placeholder="25"
                        bg="gray.700"
                        borderColor="gray.600"
                        color="white"
                        _hover={{ borderColor: "gray.500" }}
                        _placeholder={{ color: "gray.400" }}
                      />
                      <FormErrorMessage sx={{ color: 'red.300' }}>{errors.neurostimulator_data?.fractions?.message}</FormErrorMessage>
                    </FormControl>
                  </Grid>
                </Box>

                <Box mt={4}>
                  <FormControl mb={3}>
                    <FormLabel fontSize="sm" color="gray.300">TPS Max Dose (Gy)</FormLabel>
                    <Input 
                      size="sm"
                      type="number"
                      step="any"
                      {...register('neurostimulator_data.tps_max_dose')}
                      placeholder="0.5"
                      bg="gray.700"
                      borderColor="gray.600"
                      color="white"
                      _hover={{ borderColor: "gray.500" }}
                      _placeholder={{ color: "gray.400" }}
                    />
                  </FormControl>
                </Box>

                <Box mt={4}>
                  <Grid templateColumns="1fr 1fr" gap={2} mb={3}>
                    {!isCustomDevice ? (
                      <>
                        <FormControl isInvalid={errors.neurostimulator_data?.device_vendor}>
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
                            <option value="" style={{ backgroundColor: '#2D3748', color: 'white' }}></option>
                            {deviceInfo.vendors.map(vendor => (
                              <option key={vendor} value={vendor} style={{ backgroundColor: '#2D3748', color: 'white' }}>{vendor}</option>
                            ))}
                          </Select>
                          <FormErrorMessage sx={{ color: 'red.300' }}>{errors.neurostimulator_data?.device_vendor?.message}</FormErrorMessage>
                        </FormControl>

                        <FormControl>
                          <FormLabel fontSize="sm" color="gray.300">Device Model</FormLabel>
                          <Select 
                            size="sm"
                            {...register('neurostimulator_data.device_model')} 
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
                            <option value="" style={{ backgroundColor: '#2D3748', color: 'white' }}></option>
                            {selectedVendor && deviceInfo.models_by_vendor[selectedVendor]?.map(model => (
                              <option key={model} value={model} style={{ backgroundColor: '#2D3748', color: 'white' }}>{model}</option>
                            ))}
                          </Select>
                        </FormControl>
                      </>
                    ) : (
                      <>
                        <FormControl isInvalid={errors.neurostimulator_data?.custom_device_vendor}>
                          <FormLabel fontSize="sm" color="gray.300">Device Vendor</FormLabel>
                          <Input 
                            size="sm"
                            placeholder="e.g., Medtronic"
                            {...register('neurostimulator_data.custom_device_vendor', {
                              required: isCustomDevice ? 'Vendor is required' : false
                            })}
                            bg="gray.700"
                            borderColor="gray.600"
                            color="white"
                            _hover={{ borderColor: "gray.500" }}
                            _placeholder={{ color: "gray.400" }}
                          />
                          <FormErrorMessage sx={{ color: 'red.300' }}>{errors.neurostimulator_data?.custom_device_vendor?.message}</FormErrorMessage>
                        </FormControl>

                        <FormControl>
                          <FormLabel fontSize="sm" color="gray.300">Device Model</FormLabel>
                          <Input 
                            size="sm"
                            placeholder="e.g., Intellis"
                            {...register('neurostimulator_data.custom_device_model')}
                            bg="gray.700"
                            borderColor="gray.600"
                            color="white"
                            _hover={{ borderColor: "gray.500" }}
                            _placeholder={{ color: "gray.400" }}
                          />
                        </FormControl>
                      </>
                    )}
                  </Grid>
                  <Checkbox 
                    size="sm" 
                    isChecked={isCustomDevice} 
                    onChange={handleCustomDeviceChange}
                    colorScheme="green"
                    color="gray.300"
                  >
                    <Text fontSize="sm" color="gray.300">Custom Device?</Text>
                  </Checkbox>
                </Box>

                {/* Risk Assessment Display */}
                {riskAssessment && (
                  <Box mt={4}>
                    <Heading size="xs" mb={2} color="gray.300">Risk Assessment</Heading>
                    
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

                    {riskAssessment.is_high_risk_warning && (
                      <Alert status="error" size="sm" mb={3}>
                        <AlertIcon />
                        <Text fontSize="xs" fontWeight="bold">
                          HIGH RISK: Consult neurology and device manufacturer!
                        </Text>
                      </Alert>
                    )}
                  </Box>
                )}

              </GridItem>
            </Grid>

            <Flex gap={4} mb={6} mt={4}>
              <Button
                colorScheme="cyan"
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
                onClick={() => {
                  reset();
                  setWriteup('');
                  setRiskAssessment(null);
                  setSelectedVendor('');
                  setIsCustomDevice(false);
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
              <Flex justify="space-between" align="center" mb={3}>
                <Heading size="sm" color="white">Generated Write-up</Heading>
                <Button size="sm" colorScheme="cyan" onClick={copyToClipboard}>
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
                fontSize="sm"
                lineHeight="1"
                sx={{ fontFamily: '"Aseprite", monospace !important' }}
              />
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default NeurostimulatorForm;

