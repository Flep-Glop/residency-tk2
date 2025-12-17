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
  const [isCustomDevice, setIsCustomDevice] = useState(false);
  const toast = useToast();
  
  // Default staff lists (can be moved to a service later)
  const [physicians] = useState(['Dalwadi', 'Galvan', 'Ha', 'Kluwe', 'Le', 'Lewis', 'Tuli']);
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
      },
      pacemaker_data: {
        treatment_site: '',
        dose: '',
        fractions: '',
        field_distance: '',
        neutron_producing: 'No',
        device_vendor: '',
        device_model: '',
        custom_device_vendor: '',
        custom_device_model: '',
        device_serial: '',
        pacing_dependent: '',
        tps_max_dose: '',
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

  // Handle custom device checkbox
  const handleCustomDeviceChange = (e) => {
    setIsCustomDevice(e.target.checked);
    if (e.target.checked) {
      setValue('pacemaker_data.device_vendor', '');
      setValue('pacemaker_data.device_model', '');
      setSelectedVendor('');
    } else {
      setValue('pacemaker_data.custom_device_vendor', '');
      setValue('pacemaker_data.custom_device_model', '');
    }
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

      const hasVendor = isCustomDevice ? pacemaker_data.custom_device_vendor : pacemaker_data.device_vendor;
      if (!pacemaker_data.treatment_site || !hasVendor || !pacemaker_data.field_distance) {
        throw new Error('Please fill in all required fields');
      }
      
      // If custom device, copy custom values to main fields for backend
      if (isCustomDevice) {
        data.pacemaker_data.device_vendor = pacemaker_data.custom_device_vendor;
        data.pacemaker_data.device_model = pacemaker_data.custom_device_model || '';
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
            <Heading size="md">Pacemaker / CIED Documentation</Heading>
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
                      <option value="" style={{ backgroundColor: '#2D3748', color: 'white' }}></option>
                      {physicians.map(physician => (
                        <option key={physician} value={physician} style={{ backgroundColor: '#2D3748', color: 'white' }}>{physician}</option>
                      ))}
                    </Select>
                    <FormErrorMessage sx={{ color: 'red.300' }}>{errors.common_info?.physician?.name?.message}</FormErrorMessage>
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
                      <option value="" style={{ backgroundColor: '#2D3748', color: 'white' }}></option>
                      {physicists.map(physicist => (
                        <option key={physicist} value={physicist} style={{ backgroundColor: '#2D3748', color: 'white' }}>{physicist}</option>
                      ))}
                    </Select>
                    <FormErrorMessage sx={{ color: 'red.300' }}>{errors.common_info?.physicist?.name?.message}</FormErrorMessage>
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
                      <option value="" style={{ backgroundColor: '#2D3748', color: 'white' }}></option>
                      {treatmentSites.map(site => (
                        <option key={site} value={site} style={{ backgroundColor: '#2D3748', color: 'white' }}>{site}</option>
                      ))}
                    </Select>
                    <FormErrorMessage sx={{ color: 'red.300' }}>{errors.pacemaker_data?.treatment_site?.message}</FormErrorMessage>
                  </FormControl>
                </Box>

                <Box mt={4}>
                  <FormControl isInvalid={errors.pacemaker_data?.field_distance} mb={3}>
                    <FormLabel fontSize="sm" color="gray.300">Distance from Field to CIED</FormLabel>
                    <Grid templateColumns="repeat(4, 1fr)" gap={2}>
                      <Button
                        size="sm"
                        onClick={() => setValue('pacemaker_data.field_distance', 'More than 10 cm from treatment field edge')}
                        colorScheme={pacemakerData.field_distance === 'More than 10 cm from treatment field edge' ? 'blue' : 'gray'}
                        variant={pacemakerData.field_distance === 'More than 10 cm from treatment field edge' ? 'solid' : 'outline'}
                        color={pacemakerData.field_distance === 'More than 10 cm from treatment field edge' ? 'white' : 'gray.300'}
                        whiteSpace="normal"
                        height="auto"
                        py={2}
                      >
                        &gt; 10 cm
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => setValue('pacemaker_data.field_distance', 'Less than 10 cm from field edge but not in direct field')}
                        colorScheme={pacemakerData.field_distance === 'Less than 10 cm from field edge but not in direct field' ? 'blue' : 'gray'}
                        variant={pacemakerData.field_distance === 'Less than 10 cm from field edge but not in direct field' ? 'solid' : 'outline'}
                        color={pacemakerData.field_distance === 'Less than 10 cm from field edge but not in direct field' ? 'white' : 'gray.300'}
                        whiteSpace="normal"
                        height="auto"
                        py={2}
                      >
                        3-10 cm
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => setValue('pacemaker_data.field_distance', 'Within 3 cm of field edge')}
                        colorScheme={pacemakerData.field_distance === 'Within 3 cm of field edge' ? 'blue' : 'gray'}
                        variant={pacemakerData.field_distance === 'Within 3 cm of field edge' ? 'solid' : 'outline'}
                        color={pacemakerData.field_distance === 'Within 3 cm of field edge' ? 'white' : 'gray.300'}
                        whiteSpace="normal"
                        height="auto"
                        py={2}
                      >
                        &lt; 3 cm
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => setValue('pacemaker_data.field_distance', 'CIED in direct beam')}
                        colorScheme={pacemakerData.field_distance === 'CIED in direct beam' ? 'blue' : 'gray'}
                        variant={pacemakerData.field_distance === 'CIED in direct beam' ? 'solid' : 'outline'}
                        color={pacemakerData.field_distance === 'CIED in direct beam' ? 'white' : 'gray.300'}
                        whiteSpace="normal"
                        height="auto"
                        py={2}
                      >
                        Direct Beam
                      </Button>
                    </Grid>
                    <FormErrorMessage sx={{ color: 'red.300' }}>{errors.pacemaker_data?.field_distance?.message}</FormErrorMessage>
                  </FormControl>
                </Box>

                <Box mt={4}>
                  <FormControl>
                    <FormLabel fontSize="sm" color="gray.300">Pacing Dependency</FormLabel>
                    <RadioGroup 
                      value={pacemakerData.pacing_dependent || ''} 
                      onChange={(value) => setValue('pacemaker_data.pacing_dependent', value)}
                    >
                      <HStack spacing={2}>
                        <Button
                          size="sm"
                          onClick={() => setValue('pacemaker_data.pacing_dependent', 'Yes')}
                          colorScheme={pacemakerData.pacing_dependent === 'Yes' ? 'blue' : 'gray'}
                          variant={pacemakerData.pacing_dependent === 'Yes' ? 'solid' : 'outline'}
                          color={pacemakerData.pacing_dependent === 'Yes' ? 'white' : 'gray.300'}
                          flex={1}
                        >
                          Dependent
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => setValue('pacemaker_data.pacing_dependent', 'No')}
                          colorScheme={pacemakerData.pacing_dependent === 'No' ? 'blue' : 'gray'}
                          variant={pacemakerData.pacing_dependent === 'No' ? 'solid' : 'outline'}
                          color={pacemakerData.pacing_dependent === 'No' ? 'white' : 'gray.300'}
                          flex={1}
                        >
                          Independent
                        </Button>
                      </HStack>
                    </RadioGroup>
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
                    <FormControl isInvalid={errors.pacemaker_data?.dose}>
                      <FormLabel fontSize="sm" color="gray.300">Dose (Gy)</FormLabel>
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
                      <FormErrorMessage sx={{ color: 'red.300' }}>{errors.pacemaker_data?.dose?.message}</FormErrorMessage>
                    </FormControl>

                    <FormControl isInvalid={errors.pacemaker_data?.fractions}>
                      <FormLabel fontSize="sm" color="gray.300">Fractions</FormLabel>
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
                      <FormErrorMessage sx={{ color: 'red.300' }}>{errors.pacemaker_data?.fractions?.message}</FormErrorMessage>
                    </FormControl>
                  </Grid>
                </Box>

                <Box mt={4}>
                  <FormControl mb={3}>
                    <FormLabel fontSize="sm" color="gray.300">TPS Max Dose (Gy)</FormLabel>
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
                </Box>

                <Box mt={4}>
                  <Grid templateColumns="1fr 1fr" gap={2} mb={3}>
                    {!isCustomDevice ? (
                      <>
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
                            <option value="" style={{ backgroundColor: '#2D3748', color: 'white' }}></option>
                            {deviceInfo.vendors.map(vendor => (
                              <option key={vendor} value={vendor} style={{ backgroundColor: '#2D3748', color: 'white' }}>{vendor}</option>
                            ))}
                          </Select>
                          <FormErrorMessage sx={{ color: 'red.300' }}>{errors.pacemaker_data?.device_vendor?.message}</FormErrorMessage>
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
                            <option value="" style={{ backgroundColor: '#2D3748', color: 'white' }}></option>
                            {selectedVendor && deviceInfo.models_by_vendor[selectedVendor]?.map(model => (
                              <option key={model} value={model} style={{ backgroundColor: '#2D3748', color: 'white' }}>{model}</option>
                            ))}
                          </Select>
                        </FormControl>
                      </>
                    ) : (
                      <>
                        <FormControl isInvalid={errors.pacemaker_data?.custom_device_vendor}>
                          <FormLabel fontSize="sm" color="gray.300">Device Vendor</FormLabel>
                          <Input 
                            size="sm"
                            placeholder="e.g., Medtronic"
                            {...register('pacemaker_data.custom_device_vendor', {
                              required: isCustomDevice ? 'Vendor is required' : false
                            })}
                            bg="gray.700"
                            borderColor="gray.600"
                            color="white"
                            _hover={{ borderColor: "gray.500" }}
                            _placeholder={{ color: "gray.400" }}
                          />
                          <FormErrorMessage sx={{ color: 'red.300' }}>{errors.pacemaker_data?.custom_device_vendor?.message}</FormErrorMessage>
                        </FormControl>

                        <FormControl>
                          <FormLabel fontSize="sm" color="gray.300">Device Model</FormLabel>
                          <Input 
                            size="sm"
                            placeholder="e.g., Evera MRI"
                            {...register('pacemaker_data.custom_device_model')}
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
                    colorScheme="blue"
                    color="gray.300"
                  >
                    <Text fontSize="sm" color="gray.300">Custom Device?</Text>
                  </Checkbox>
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
                <Button size="sm" colorScheme="green" onClick={copyToClipboard}>
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

export default PacemakerForm;