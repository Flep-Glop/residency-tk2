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
  Radio,
  Stack,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  VStack,
  HStack,
  Container,
  Spinner,
  Center,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Switch,
  Checkbox,
  Card,
  CardBody
} from '@chakra-ui/react';
import { getTreatmentSites, getDoseConstraints, getFractionationSchemes, generateSBRTWriteup, validateDoseFractionation } from '../../services/sbrtService';

const SBRTForm = () => {
  // State variables
  const [treatmentSites, setTreatmentSites] = useState([]);
  const [doseConstraints, setDoseConstraints] = useState({});
  const [fractionationSchemes, setFractionationSchemes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [writeup, setWriteup] = useState('');
  const [validationMessage, setValidationMessage] = useState(null);
  const [isSIB, setIsSIB] = useState(false);
  const [calculatedMetrics, setCalculatedMetrics] = useState(null);
  const toast = useToast();
  const [physicians, setPhysicians] = useState(['Dalwadi', 'Galvan', 'Ha', 'Kluwe', 'Le', 'Lewis', 'Tuli']);
  const [physicists, setPhysicists] = useState(['Bassiri', 'Kirby', 'Papanikolaou', 'Paschal', 'Rasmussen']);
  const [isCustomTreatmentSite, setIsCustomTreatmentSite] = useState(false);
  
  // Fixed dark theme colors for consistency
  const formBg = 'gray.800';
  const writeupBg = 'gray.800';
  const borderColor = 'gray.600';

  // Tolerance table data based on your clinical standards
  const toleranceTable = [
    { ptvVol: 1.8, conformityNone: 1.2, conformityMinor: 1.5, r50None: 5.9, r50Minor: 7.5, maxDose2cmNone: 50.0, maxDose2cmMinor: 57.0 },
    { ptvVol: 3.8, conformityNone: 1.2, conformityMinor: 1.5, r50None: 5.5, r50Minor: 6.5, maxDose2cmNone: 50.0, maxDose2cmMinor: 57.0 },
    { ptvVol: 7.4, conformityNone: 1.2, conformityMinor: 1.5, r50None: 5.1, r50Minor: 6.0, maxDose2cmNone: 50.0, maxDose2cmMinor: 58.0 },
    { ptvVol: 13.2, conformityNone: 1.2, conformityMinor: 1.5, r50None: 4.7, r50Minor: 5.8, maxDose2cmNone: 50.0, maxDose2cmMinor: 58.0 },
    { ptvVol: 22.0, conformityNone: 1.2, conformityMinor: 1.5, r50None: 4.5, r50Minor: 5.5, maxDose2cmNone: 54.0, maxDose2cmMinor: 63.0 },
    { ptvVol: 34.0, conformityNone: 1.2, conformityMinor: 1.5, r50None: 4.3, r50Minor: 5.3, maxDose2cmNone: 58.0, maxDose2cmMinor: 68.0 },
    { ptvVol: 50.0, conformityNone: 1.2, conformityMinor: 1.5, r50None: 4.0, r50Minor: 5.0, maxDose2cmNone: 62.0, maxDose2cmMinor: 77.0 },
    { ptvVol: 70.0, conformityNone: 1.2, conformityMinor: 1.5, r50None: 3.5, r50Minor: 4.8, maxDose2cmNone: 66.0, maxDose2cmMinor: 86.0 },
    { ptvVol: 95.0, conformityNone: 1.2, conformityMinor: 1.5, r50None: 3.3, r50Minor: 4.4, maxDose2cmNone: 70.0, maxDose2cmMinor: 89.0 },
    { ptvVol: 126.0, conformityNone: 1.2, conformityMinor: 1.5, r50None: 3.1, r50Minor: 4.0, maxDose2cmNone: 73.0, maxDose2cmMinor: 91.0 },
    { ptvVol: 163.0, conformityNone: 1.2, conformityMinor: 1.5, r50None: 2.9, r50Minor: 3.7, maxDose2cmNone: 77.0, maxDose2cmMinor: 94.0 }
  ];

  // Form setup with react-hook-form
  const { register, handleSubmit, watch, formState: { errors }, setValue, reset } = useForm({
    defaultValues: {
      common_info: {
        physician: { name: '', role: 'physician' },
        physicist: { name: '', role: 'physicist' },
      },
      sbrt_data: {
        treatment_site: '',
        custom_treatment_site: '',
        anatomical_clarification: '',
        dose: '',
        fractions: '',
        breathing_technique: '',
        oligomet_location: '',
        target_name: '',
        ptv_volume: '',
        vol_ptv_receiving_rx: '',
        vol_100_rx_isodose: '',
        vol_50_rx_isodose: '',
        max_dose_2cm_ring: '',
        max_dose_in_target: '',
        sib_comment: ''
      }
    }
  });
  
  // Helper function to format numbers cleanly (remove unnecessary zeros)
  const formatNumber = (value, decimals = 2) => {
    if (value === null || value === undefined || value === '') return '---';
    const num = parseFloat(value);
    if (isNaN(num)) return '---';
    
    // Format with specified decimals, then remove trailing zeros
    let formatted = num.toFixed(decimals).replace(/\.?0+$/, '');
    return formatted;
  };

  // Watch key form fields for reactive updates
  const watchDose = watch('sbrt_data.dose');
  const watchFractions = watch('sbrt_data.fractions');
  const watchTreatmentSite = watch('sbrt_data.treatment_site');
  const watchCustomTreatmentSite = watch('sbrt_data.custom_treatment_site');
  const watchBreathingTechnique = watch('sbrt_data.breathing_technique');
  const watchTargetName = watch('sbrt_data.target_name');
  const watchPTVVolume = watch('sbrt_data.ptv_volume');
  const watchVolPTVReceivingRx = watch('sbrt_data.vol_ptv_receiving_rx');
  const watchVol100RxIsodose = watch('sbrt_data.vol_100_rx_isodose');
  const watchVol50RxIsodose = watch('sbrt_data.vol_50_rx_isodose');
  const watchMaxDose2cmRing = watch('sbrt_data.max_dose_2cm_ring');
  const watchMaxDoseInTarget = watch('sbrt_data.max_dose_in_target');
  
  // Get actual treatment site (custom or dropdown)
  const actualTreatmentSite = isCustomTreatmentSite ? watchCustomTreatmentSite : watchTreatmentSite;
  
  // Calculate derived values and tolerance check
  useEffect(() => {
    const calculateMetrics = () => {
      if (!watchPTVVolume || !watchDose || !watchVolPTVReceivingRx || 
          !watchVol100RxIsodose || !watchVol50RxIsodose || !watchMaxDose2cmRing || !watchMaxDoseInTarget) {
        setCalculatedMetrics(null);
        return;
      }

      // Calculate metrics
      const coverage = (watchVolPTVReceivingRx / watchPTVVolume) * 100;
      const conformityIndex = watchVol100RxIsodose / watchPTVVolume;
      const r50 = watchVol50RxIsodose / watchPTVVolume;
      const gradientMeasure = Math.pow((3 * watchVol50RxIsodose) / (4 * Math.PI), 1/3) - 
                             Math.pow((3 * watchVol100RxIsodose) / (4 * Math.PI), 1/3);
      const maxDose2cmRingPercent = (watchMaxDose2cmRing / watchDose) * 100;
      const homogeneityIndex = watchMaxDoseInTarget / watchDose;

      // Find tolerance values (use next higher volume)
      const toleranceRow = toleranceTable.find(row => watchPTVVolume <= row.ptvVol) || 
                          toleranceTable[toleranceTable.length - 1];

      // Determine deviations (only if not SIB)
      const getDeviation = (value, noneLimit, minorLimit) => {
        if (isSIB) return 'N/A (SIB)';
        if (value <= noneLimit) return 'None';
        if (value <= minorLimit) return 'Minor';
        return 'Major';
      };

      const conformityDeviation = getDeviation(conformityIndex, toleranceRow.conformityNone, toleranceRow.conformityMinor);
      const r50Deviation = getDeviation(r50, toleranceRow.r50None, toleranceRow.r50Minor);
      const maxDose2cmDeviation = getDeviation(maxDose2cmRingPercent, toleranceRow.maxDose2cmNone, toleranceRow.maxDose2cmMinor);

      setCalculatedMetrics({
        coverage: coverage.toFixed(1),
        conformityIndex: conformityIndex.toFixed(2),
        r50: r50.toFixed(2),
        gradientMeasure: gradientMeasure.toFixed(2),
        maxDose2cmRingPercent: maxDose2cmRingPercent.toFixed(1),
        homogeneityIndex: homogeneityIndex.toFixed(2),
        conformityDeviation,
        r50Deviation,
        maxDose2cmDeviation,
        toleranceRow
      });
    };

    calculateMetrics();
  }, [watchPTVVolume, watchDose, watchVolPTVReceivingRx, watchVol100RxIsodose, 
      watchVol50RxIsodose, watchMaxDose2cmRing, watchMaxDoseInTarget, isSIB]);
  
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
        
        // Fallback data if API fails
        setTreatmentSites([
          "bone", "kidney", "liver", "lung", "prostate", "spine"
        ]);
      } finally {
        setInitialLoading(false);
      }
    };

    fetchInitialData();
  }, [toast]);

  // Handler for custom treatment site checkbox
  const handleCustomTreatmentSiteChange = (e) => {
    setIsCustomTreatmentSite(e.target.checked);
    if (e.target.checked) {
      setValue('sbrt_data.treatment_site', '');
    } else {
      setValue('sbrt_data.custom_treatment_site', '');
    }
  };

  // Update constraints and schemes when treatment site changes
  useEffect(() => {
    const fetchSiteSpecificData = async () => {
      if (!watchTreatmentSite) return;
      
      try {
        const [constraintsData, schemesData] = await Promise.all([
          getDoseConstraints(watchTreatmentSite),
          getFractionationSchemes(watchTreatmentSite)
        ]);
        
        setDoseConstraints(constraintsData);
        setFractionationSchemes(schemesData);
      } catch (error) {
        console.error('Error fetching site-specific data:', error);
      }
    };

    fetchSiteSpecificData();
  }, [watchTreatmentSite]);

  // Validate dose/fractionation when values change
  useEffect(() => {
    const validateData = async () => {
      if (!watchTreatmentSite || !watchDose || !watchFractions) {
        setValidationMessage(null);
        return;
      }
      
      try {
        const validation = await validateDoseFractionation(watchTreatmentSite, watchDose, watchFractions);
        setValidationMessage(validation);
      } catch (error) {
        console.error('Validation error:', error);
      }
    };

    const timeoutId = setTimeout(validateData, 500); // Debounce validation
    return () => clearTimeout(timeoutId);
  }, [watchTreatmentSite, watchDose, watchFractions]);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      // Add calculated metrics to the form data (like fusion system - simple and clean)
      const dataWithMetrics = {
        ...data,
        sbrt_data: {
          ...data.sbrt_data,
          calculated_metrics: calculatedMetrics,
          is_sib: isSIB
        }
      };

      console.log('Sending data to backend:', dataWithMetrics);
      
      const response = await generateSBRTWriteup(dataWithMetrics);
      console.log('Backend response received:', response);
      console.log('Response writeup first 200 chars:', response.writeup.substring(0, 200));
      setWriteup(response.writeup);
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
    reset();
    setWriteup('');
    setValidationMessage(null);
    setDoseConstraints({});
    setFractionationSchemes([]);
    setCalculatedMetrics(null);
    setIsSIB(false);
    setIsCustomTreatmentSite(false);
  };

  const getDeviationColor = (deviation) => {
    if (deviation === 'N/A (SIB)') return 'gray.400';
    if (deviation === 'None') return 'green.300';
    if (deviation === 'Minor') return 'yellow.300';
    if (deviation === 'Major') return 'red.300';
    return 'white';
  };

  if (initialLoading) {
    return (
      <Center h="200px">
        <VStack spacing={4}>
          <Spinner size="xl" color="green.500" />
          <Text color="white">Loading SBRT form data...</Text>
        </VStack>
      </Center>
    );
  }

  return (
    <Box bg="gray.900" minH="100vh">
      {/* Header */}
      <Box bg="green.900" color="white" p={6} mb={6} borderRadius="lg" border="1px" borderColor="green.700">
        <Flex justify="space-between" align="center" flexWrap="wrap" gap={4}>
          <Box>
            <Heading size="md" mb={2}>SBRT Write-up Generator</Heading>
          </Box>
        </Flex>
      </Box>

      {/* Main Content */}
      <Box px={6}>
        <Box maxW="1200px" mx="auto">
          <form onSubmit={handleSubmit(onSubmit)}>
            {/* First Row: Three Columns */}
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
                as={Box} 
                p={4} 
                borderWidth="1px" 
                borderRadius="md" 
                bg={formBg}
                borderColor={borderColor}
                boxShadow="sm"
              >
                <Heading size="sm" mb={3} textAlign="center" color="white">Staff Info</Heading>
                <VStack spacing={3} align="stretch">
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
                        <option value="" style={{ backgroundColor: '#2D3748', color: 'white' }}></option>
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
                        <option value="" style={{ backgroundColor: '#2D3748', color: 'white' }}></option>
                        {physicists.map(physicist => (
                          <option key={physicist} value={physicist} style={{ backgroundColor: '#2D3748', color: 'white' }}>{physicist}</option>
                        ))}
                      </Select>
                      <FormErrorMessage sx={{ color: 'red.300' }}>
                        {errors.common_info?.physicist?.name?.message}
                      </FormErrorMessage>
                    </FormControl>
                  </Box>
                </VStack>
              </GridItem>

              {/* Treatment Details Section */}
              <GridItem 
                as={Box} 
                p={4} 
                borderWidth="1px" 
                borderRadius="md" 
                bg={formBg}
                borderColor={borderColor}
                boxShadow="sm"
              >
                <Heading size="sm" mb={3} textAlign="center" color="white">Treatment Details</Heading>
                
                <VStack spacing={3} align="stretch">
                  <Box>
                    {!isCustomTreatmentSite ? (
                      <FormControl isInvalid={errors.sbrt_data?.treatment_site} mb={3}>
                        <FormLabel fontSize="sm" color="gray.300" fontWeight="bold">Treatment Site</FormLabel>
                        <Select
                          size="sm"
                          placeholder=""
                          {...register('sbrt_data.treatment_site', { 
                            required: !isCustomTreatmentSite ? 'Treatment site is required' : false 
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
                          {treatmentSites.map((site) => (
                            <option key={site} value={site} style={{ backgroundColor: '#2D3748', color: 'white' }}>
                              {site.charAt(0).toUpperCase() + site.slice(1)}
                            </option>
                          ))}
                        </Select>
                        <FormErrorMessage sx={{ color: 'red.300' }}>
                          {errors.sbrt_data?.treatment_site?.message}
                        </FormErrorMessage>
                      </FormControl>
                    ) : (
                      <FormControl isInvalid={errors.sbrt_data?.custom_treatment_site} mb={3}>
                        <FormLabel fontSize="sm" color="gray.300">Custom Treatment Site Name</FormLabel>
                        <Input
                          size="sm"
                          {...register('sbrt_data.custom_treatment_site', {
                            required: isCustomTreatmentSite ? 'Custom treatment site name is required' : false
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
                          {errors.sbrt_data?.custom_treatment_site?.message}
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

                    {/* Anatomical clarification for spine/bone */}
                    {(watchTreatmentSite === 'spine' || watchTreatmentSite === 'bone') && (
                      <FormControl mb={3}>
                        <FormLabel fontSize="sm" color="gray.300">
                          Anatomical Clarification {watchTreatmentSite === 'spine' ? '(e.g., T11-L1, C5-C7)' : '(e.g., Humerus, Femur, Rib)'}
                        </FormLabel>
                        <Input
                          size="sm"
                          placeholder={watchTreatmentSite === 'spine' ? 'e.g., T11-L1, L4-L5, C5-C7' : 'e.g., Humerus, Femur, Rib'}
                          {...register('sbrt_data.anatomical_clarification')}
                          bg="gray.700"
                          borderColor="gray.600"
                          color="white"
                          _hover={{ borderColor: "gray.500" }}
                          _placeholder={{ color: 'gray.400' }}
                        />
                      </FormControl>
                    )}
                  </Box>

                  <Box>
                    <Grid templateColumns="repeat(2, 1fr)" gap={2} mb={3}>
                      <FormControl isInvalid={errors.sbrt_data?.dose}>
                        <FormLabel fontSize="sm" color="gray.300">Rx Dose (Gy)</FormLabel>
                        <Input
                          size="sm"
                          type="number"
                          step="0.1"
                          {...register('sbrt_data.dose', { 
                            required: 'Dose is required',
                            min: { value: 0.1, message: 'Dose must be greater than 0' }
                          })}
                          bg="gray.700"
                          borderColor="gray.600"
                          color="white"
                          _hover={{ borderColor: "gray.500" }}
                          _placeholder={{ color: "gray.400" }}
                        />
                        <FormErrorMessage sx={{ color: 'red.300' }}>
                          {errors.sbrt_data?.dose?.message}
                        </FormErrorMessage>
                      </FormControl>

                      <FormControl isInvalid={errors.sbrt_data?.fractions}>
                        <FormLabel fontSize="sm" color="gray.300">Fractions</FormLabel>
                        <Input
                          size="sm"
                          type="number"
                          step="1"
                          {...register('sbrt_data.fractions', { 
                            required: 'Fractions is required',
                            min: { value: 1, message: 'Must be at least 1 fraction' },
                            max: { value: 10, message: 'SBRT typically uses ≤10 fractions' }
                          })}
                          bg="gray.700"
                          borderColor="gray.600"
                          color="white"
                          _hover={{ borderColor: "gray.500" }}
                          _placeholder={{ color: "gray.400" }}
                        />
                        <FormErrorMessage sx={{ color: 'red.300' }}>
                          {errors.sbrt_data?.fractions?.message}
                        </FormErrorMessage>
                      </FormControl>
                    </Grid>

                    <FormControl isInvalid={errors.sbrt_data?.breathing_technique} mb={3}>
                      <FormLabel fontSize="sm" color="gray.300">Technique</FormLabel>
                      <RadioGroup
                        value={watchBreathingTechnique}
                        onChange={(value) => setValue('sbrt_data.breathing_technique', value)}
                      >
                        <HStack spacing={2}>
                          <Box
                            as="label"
                            flex="1"
                            cursor="pointer"
                          >
                            <Radio value="freebreathe" display="none" {...register('sbrt_data.breathing_technique', { required: 'Breathing technique is required' })} />
                            <Button
                              size="sm"
                              width="100%"
                              colorScheme={watchBreathingTechnique === 'freebreathe' ? 'blue' : 'gray'}
                              variant={watchBreathingTechnique === 'freebreathe' ? 'solid' : 'outline'}
                              onClick={() => setValue('sbrt_data.breathing_technique', 'freebreathe')}
                              color={watchBreathingTechnique === 'freebreathe' ? 'white' : 'gray.300'}
                              borderColor={watchBreathingTechnique === 'freebreathe' ? 'blue.500' : 'gray.600'}
                              _hover={{ borderColor: watchBreathingTechnique === 'freebreathe' ? 'blue.400' : 'gray.500' }}
                            >
                              Free Breathing
                            </Button>
                          </Box>
                          <Box
                            as="label"
                            flex="1"
                            cursor="pointer"
                          >
                            <Radio value="4DCT" display="none" />
                            <Button
                              size="sm"
                              width="100%"
                              colorScheme={watchBreathingTechnique === '4DCT' ? 'blue' : 'gray'}
                              variant={watchBreathingTechnique === '4DCT' ? 'solid' : 'outline'}
                              onClick={() => setValue('sbrt_data.breathing_technique', '4DCT')}
                              color={watchBreathingTechnique === '4DCT' ? 'white' : 'gray.300'}
                              borderColor={watchBreathingTechnique === '4DCT' ? 'blue.500' : 'gray.600'}
                              _hover={{ borderColor: watchBreathingTechnique === '4DCT' ? 'blue.400' : 'gray.500' }}
                            >
                              4DCT
                            </Button>
                          </Box>
                          <Box
                            as="label"
                            flex="1"
                            cursor="pointer"
                          >
                            <Radio value="DIBH" display="none" />
                            <Button
                              size="sm"
                              width="100%"
                              colorScheme={watchBreathingTechnique === 'DIBH' ? 'blue' : 'gray'}
                              variant={watchBreathingTechnique === 'DIBH' ? 'solid' : 'outline'}
                              onClick={() => setValue('sbrt_data.breathing_technique', 'DIBH')}
                              color={watchBreathingTechnique === 'DIBH' ? 'white' : 'gray.300'}
                              borderColor={watchBreathingTechnique === 'DIBH' ? 'blue.500' : 'gray.600'}
                              _hover={{ borderColor: watchBreathingTechnique === 'DIBH' ? 'blue.400' : 'gray.500' }}
                            >
                              DIBH
                            </Button>
                          </Box>
                        </HStack>
                      </RadioGroup>
                      <FormErrorMessage sx={{ color: 'red.300' }}>
                        {errors.sbrt_data?.breathing_technique?.message}
                      </FormErrorMessage>
                    </FormControl>
                  </Box>



                  {/* SIB Toggle */}
                  <Box>
                    <FormControl display="flex" alignItems="center" mb={2}>
                      <FormLabel fontSize="sm" color="gray.300" mb="0">
                        SIB Case?
                      </FormLabel>
                      <Switch
                        colorScheme="green"
                        isChecked={isSIB}
                        onChange={(e) => setIsSIB(e.target.checked)}
                      />
                    </FormControl>

                    {isSIB && (
                      <FormControl>
                        <FormLabel fontSize="sm" color="gray.300">SIB Comment</FormLabel>
                        <Input
                          size="sm"
                          placeholder="e.g., SIB 40/45"
                          {...register('sbrt_data.sib_comment')}
                          bg="gray.700"
                          borderColor="gray.600"
                          color="white"
                          _hover={{ borderColor: "gray.500" }}
                          _placeholder={{ color: 'gray.400' }}
                        />
                      </FormControl>
                    )}
                  </Box>
                </VStack>
              </GridItem>

              {/* Plan Metrics Input Section */}
              <GridItem 
                as={Box} 
                p={4} 
                borderWidth="1px" 
                borderRadius="md" 
                bg={formBg}
                borderColor={borderColor}
                boxShadow="sm"
              >
                <Heading size="sm" mb={3} textAlign="center" color="white">Plan Metrics Input</Heading>
                
                <VStack spacing={3} align="stretch">
                  {/* Target Name - Full Width */}
                  <FormControl isInvalid={errors.sbrt_data?.target_name}>
                    <FormLabel fontSize="sm" color="gray.300">Target/Lesion Name</FormLabel>
                    <Input
                      size="sm"
                      placeholder="e.g., PTV_50"
                      {...register('sbrt_data.target_name', { required: 'Target name is required' })}
                      bg="gray.700"
                      borderColor="gray.600"
                      color="white"
                      _hover={{ borderColor: "gray.500" }}
                      _placeholder={{ color: 'gray.400' }}
                    />
                    <FormErrorMessage sx={{ color: 'red.300' }}>
                      {errors.sbrt_data?.target_name?.message}
                    </FormErrorMessage>
                  </FormControl>

                  {/* Row 1: PTV Volume and Vol PTV receiving Rx */}
                  <Grid templateColumns="1fr 1fr" gap={3}>
                    <FormControl isInvalid={errors.sbrt_data?.ptv_volume}>
                      <FormLabel fontSize="sm" color="gray.300">PTV Volume (cc)</FormLabel>
                      <Input
                        size="sm"
                        type="number"
                        step="0.1"
                        {...register('sbrt_data.ptv_volume', { 
                          required: 'PTV volume is required',
                          min: { value: 0.01, message: 'PTV volume must be greater than 0' }
                        })}
                        bg="gray.700"
                        borderColor="gray.600"
                        color="white"
                        _hover={{ borderColor: "gray.500" }}
                        _placeholder={{ color: 'gray.400' }}
                      />
                      <FormErrorMessage sx={{ color: 'red.300' }}>
                        {errors.sbrt_data?.ptv_volume?.message}
                      </FormErrorMessage>
                    </FormControl>

                    <FormControl isInvalid={errors.sbrt_data?.vol_ptv_receiving_rx}>
                      <FormLabel fontSize="sm" color="gray.300">Vol at Rx (cc)</FormLabel>
                      <Input
                        size="sm"
                        type="number"
                        step="0.1"
                        {...register('sbrt_data.vol_ptv_receiving_rx', { 
                          required: 'Volume of PTV receiving Rx is required',
                          min: { value: 0, message: 'Volume must be ≥ 0' }
                        })}
                        bg="gray.700"
                        borderColor="gray.600"
                        color="white"
                        _hover={{ borderColor: "gray.500" }}
                        _placeholder={{ color: 'gray.400' }}
                      />
                      <FormErrorMessage sx={{ color: 'red.300' }}>
                        {errors.sbrt_data?.vol_ptv_receiving_rx?.message}
                      </FormErrorMessage>
                    </FormControl>
                  </Grid>

                  {/* Row 2: 100% Rx Isodose Vol and 50% Rx Isodose Vol */}
                  <Grid templateColumns="1fr 1fr" gap={3}>
                    <FormControl isInvalid={errors.sbrt_data?.vol_100_rx_isodose}>
                      <FormLabel fontSize="sm" color="gray.300">100% Vol (cc)</FormLabel>
                      <Input
                        size="sm"
                        type="number"
                        step="0.1"
                        {...register('sbrt_data.vol_100_rx_isodose', { 
                          required: '100% Rx isodose volume is required',
                          min: { value: 0, message: 'Volume must be ≥ 0' }
                        })}
                        bg="gray.700"
                        borderColor="gray.600"
                        color="white"
                        _hover={{ borderColor: "gray.500" }}
                        _placeholder={{ color: 'gray.400' }}
                      />
                      <FormErrorMessage sx={{ color: 'red.300' }}>
                        {errors.sbrt_data?.vol_100_rx_isodose?.message}
                      </FormErrorMessage>
                    </FormControl>

                    <FormControl isInvalid={errors.sbrt_data?.vol_50_rx_isodose}>
                      <FormLabel fontSize="sm" color="gray.300">50% Vol (cc)</FormLabel>
                      <Input
                        size="sm"
                        type="number"
                        step="0.1"
                        {...register('sbrt_data.vol_50_rx_isodose', { 
                          required: '50% Rx isodose volume is required',
                          min: { value: 0, message: 'Volume must be ≥ 0' }
                        })}
                        bg="gray.700"
                        borderColor="gray.600"
                        color="white"
                        _hover={{ borderColor: "gray.500" }}
                        _placeholder={{ color: 'gray.400' }}
                      />
                      <FormErrorMessage sx={{ color: 'red.300' }}>
                        {errors.sbrt_data?.vol_50_rx_isodose?.message}
                      </FormErrorMessage>
                    </FormControl>
                  </Grid>

                  {/* Row 3: Max Dose 2cm ring and Max Dose in target */}
                  <Grid templateColumns="1fr 1fr" gap={3}>
                    <FormControl isInvalid={errors.sbrt_data?.max_dose_2cm_ring}>
                      <FormLabel fontSize="sm" color="gray.300">Dmax 2cm (Gy)</FormLabel>
                      <Input
                        size="sm"
                        type="number"
                        step="0.1"
                        {...register('sbrt_data.max_dose_2cm_ring', { 
                          required: 'Max dose in 2cm ring is required',
                          min: { value: 0, message: 'Dose must be ≥ 0' }
                        })}
                        bg="gray.700"
                        borderColor="gray.600"
                        color="white"
                        _hover={{ borderColor: "gray.500" }}
                        _placeholder={{ color: 'gray.400' }}
                      />
                      <FormErrorMessage sx={{ color: 'red.300' }}>
                        {errors.sbrt_data?.max_dose_2cm_ring?.message}
                      </FormErrorMessage>
                    </FormControl>

                    <FormControl isInvalid={errors.sbrt_data?.max_dose_in_target}>
                      <FormLabel fontSize="sm" color="gray.300">Dmax Target (Gy)</FormLabel>
                      <Input
                        size="sm"
                        type="number"
                        step="0.1"
                        {...register('sbrt_data.max_dose_in_target', { 
                          required: 'Max dose in target is required',
                          min: { value: 0, message: 'Dose must be ≥ 0' }
                        })}
                        bg="gray.700"
                        borderColor="gray.600"
                        color="white"
                        _hover={{ borderColor: "gray.500" }}
                        _placeholder={{ color: 'gray.400' }}
                      />
                      <FormErrorMessage sx={{ color: 'red.300' }}>
                        {errors.sbrt_data?.max_dose_in_target?.message}
                      </FormErrorMessage>
                    </FormControl>
                  </Grid>

                </VStack>
              </GridItem>
            </Grid>

            {/* Second Row: Calculated Results Table */}
            <Box 
              p={4} 
              borderWidth="1px" 
              borderRadius="md" 
              bg={formBg}
              borderColor={borderColor}
              boxShadow="sm"
              mb={6}
            >
              <Heading size="sm" mb={3} textAlign="center" color="white">Calculated Plan Metrics</Heading>
              
              <Box overflowX="auto">
                <Table size="sm" variant="simple" sx={{ 
                  'th, td': { borderColor: 'gray.600', whiteSpace: 'nowrap', px: 2 }
                }}>
                  <Thead>
                    <Tr>
                      <Th color="gray.300" fontSize="xs" textTransform="uppercase">Name</Th>
                      <Th color="gray.300" fontSize="xs" textTransform="uppercase">PTV Vol<br/>(cc)</Th>
                      <Th color="gray.300" fontSize="xs" textTransform="uppercase">Prescription<br/>(Gy)</Th>
                      <Th color="gray.300" fontSize="xs" textTransform="uppercase">Coverage<br/>(%)</Th>
                      <Th color="gray.300" fontSize="xs" textTransform="uppercase">Conformity<br/>Index</Th>
                      <Th color="gray.300" fontSize="xs" textTransform="uppercase">R50</Th>
                      <Th color="gray.300" fontSize="xs" textTransform="uppercase">Gradient<br/>Measure</Th>
                      <Th color="gray.300" fontSize="xs" textTransform="uppercase">Dmax 2cm<br/>(%)</Th>
                      <Th color="gray.300" fontSize="xs" textTransform="uppercase">Homogeneity<br/>Index</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    <Tr>
                      <Td color={watchTargetName ? "white" : "gray.500"} fontSize="xs">{watchTargetName || '---'}</Td>
                      <Td color={watchPTVVolume ? "white" : "gray.500"} fontSize="xs">{formatNumber(watchPTVVolume, 2)}</Td>
                      <Td color={watchDose ? "white" : "gray.500"} fontSize="xs">{formatNumber(watchDose, 1)}</Td>
                      <Td color={calculatedMetrics?.coverage ? "white" : "gray.500"} fontSize="xs">{formatNumber(calculatedMetrics?.coverage, 1)}</Td>
                      <Td color={calculatedMetrics ? getDeviationColor(calculatedMetrics.conformityDeviation) : "gray.500"} fontSize="xs">
                        {formatNumber(calculatedMetrics?.conformityIndex, 2)}
                        {calculatedMetrics && <Text as="span" fontSize="xs" ml={1}>({calculatedMetrics.conformityDeviation})</Text>}
                      </Td>
                      <Td color={calculatedMetrics ? getDeviationColor(calculatedMetrics.r50Deviation) : "gray.500"} fontSize="xs">
                        {formatNumber(calculatedMetrics?.r50, 2)}
                        {calculatedMetrics && <Text as="span" fontSize="xs" ml={1}>({calculatedMetrics.r50Deviation})</Text>}
                      </Td>
                      <Td color={calculatedMetrics?.gradientMeasure ? "white" : "gray.500"} fontSize="xs">{formatNumber(calculatedMetrics?.gradientMeasure, 2)}</Td>
                      <Td color={calculatedMetrics ? getDeviationColor(calculatedMetrics.maxDose2cmDeviation) : "gray.500"} fontSize="xs">
                        {formatNumber(calculatedMetrics?.maxDose2cmRingPercent, 1)}
                        {calculatedMetrics && <Text as="span" fontSize="xs" ml={1}>({calculatedMetrics.maxDose2cmDeviation})</Text>}
                      </Td>
                      <Td color={calculatedMetrics?.homogeneityIndex ? "white" : "gray.500"} fontSize="xs">{formatNumber(calculatedMetrics?.homogeneityIndex, 2)}</Td>
                    </Tr>
                  </Tbody>
                </Table>
              </Box>

              {isSIB && calculatedMetrics && (
                <Alert status="info" size="sm" mt={3}>
                  <AlertIcon />
                  <Text fontSize="sm">
                    Deviations not recorded for SIB cases. {watch('sbrt_data.sib_comment') && `Comment: ${watch('sbrt_data.sib_comment')}`}
                  </Text>
                </Alert>
              )}
            </Box>
            
            <Flex gap={4} mb={6}>
              <Button
                colorScheme="green"
                isLoading={loading}
                type="submit"
                width="100%"
                size="md"
                shadow="md"
              >
                Generate SBRT Write-up
              </Button>
              
              <Button
                variant="outline"
                colorScheme="red"
                onClick={handleResetForm}
                width="auto"
                size="md"
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
              <Heading size="md" mb={3} color="white">Generated Write-up</Heading>
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
                        title: 'Copied to clipboard',
                        status: 'success',
                        duration: 2000,
                        isClosable: true,
                      });
                    }}
                  >
                    Copy to Clipboard
                  </Button>
                </Flex>
                <Textarea
                  value={writeup}
                  height="400px"
                  isReadOnly
                  fontSize="sm"
                  lineHeight="1"
                  resize="vertical"
                  aria-label="Generated write-up"
                  bg="gray.700"
                  borderColor="gray.600"
                  color="white"
                  _hover={{ borderColor: "gray.500" }}
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

export default SBRTForm;