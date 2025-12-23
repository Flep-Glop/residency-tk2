import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  FormErrorMessage,
  Heading,
  Grid,
  GridItem,
  Text,
  Textarea,
  useToast,
  Alert,
  AlertIcon,
  Flex,
  VStack,
  HStack,
  Spinner,
  Center,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
} from '@chakra-ui/react';
import { generateSBRTWriteup } from '../../services/sbrtService';

const SBRTForm = () => {
  // State variables
  const [loading, setLoading] = useState(false);
  const [writeup, setWriteup] = useState('');
  const [isSIB, setIsSIB] = useState(null); // null = not selected, false = Standard, true = SIB
  const [calculatedMetrics, setCalculatedMetrics] = useState(null);
  const [selectedSite, setSelectedSite] = useState(null); // null, 'liver', 'prostate', etc.
  const [editingTechnique, setEditingTechnique] = useState(false); // Whether technique picker is open
  const [editingTreatmentType, setEditingTreatmentType] = useState(false); // Whether treatment type picker is open
  const toast = useToast();
  
  // Fixed dark theme colors for consistency
  const formBg = 'gray.800';
  const writeupBg = 'gray.800';
  const borderColor = 'gray.600';

  // Treatment site options
  const treatmentSites = [
    { id: 'liver', label: 'Liver' },
    { id: 'prostate', label: 'Prostate' },
    { id: 'breast', label: 'Breast' },
    { id: 'kidney', label: 'Kidney' },
    { id: 'pancreas', label: 'Pancreas' },
    { id: 'bone_spine', label: 'Bone/Spine' },
  ];

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
  const { register, handleSubmit, watch, formState: { errors }, setValue, reset, control } = useForm({
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
  const watchBreathingTechnique = watch('sbrt_data.breathing_technique');
  const watchTargetName = watch('sbrt_data.target_name');
  const watchPTVVolume = watch('sbrt_data.ptv_volume');
  const watchVolPTVReceivingRx = watch('sbrt_data.vol_ptv_receiving_rx');
  const watchVol100RxIsodose = watch('sbrt_data.vol_100_rx_isodose');
  const watchVol50RxIsodose = watch('sbrt_data.vol_50_rx_isodose');
  const watchMaxDose2cmRing = watch('sbrt_data.max_dose_2cm_ring');
  const watchMaxDoseInTarget = watch('sbrt_data.max_dose_in_target');
  
  // Handle site selection
  const handleSiteSelect = (siteId) => {
    if (selectedSite === siteId) {
      // Clicking same site deselects it
      setSelectedSite(null);
      setValue('sbrt_data.treatment_site', '');
      setValue('sbrt_data.custom_treatment_site', '');
      setValue('sbrt_data.anatomical_clarification', '');
    } else {
      setSelectedSite(siteId);
      if (siteId === 'other') {
        setValue('sbrt_data.treatment_site', '');
      } else if (siteId === 'bone_spine') {
        setValue('sbrt_data.treatment_site', 'spine');
      } else {
        setValue('sbrt_data.treatment_site', siteId);
      }
      setValue('sbrt_data.custom_treatment_site', '');
      setValue('sbrt_data.anatomical_clarification', '');
    }
  };
  
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
        coverage: coverage,
        conformityIndex: conformityIndex,
        r50: r50,
        gradientMeasure: gradientMeasure,
        maxDose2cmRingPercent: maxDose2cmRingPercent,
        homogeneityIndex: homogeneityIndex,
        conformityDeviation,
        r50Deviation,
        maxDose2cmDeviation,
        toleranceRow
      });
    };

    calculateMetrics();
  }, [watchPTVVolume, watchDose, watchVolPTVReceivingRx, watchVol100RxIsodose, 
      watchVol50RxIsodose, watchMaxDose2cmRing, watchMaxDoseInTarget, isSIB]);
  
  const onSubmit = async (data) => {
    // Validate site is selected
    if (!selectedSite) {
        toast({
        title: 'Please select a treatment site',
          status: 'error',
        duration: 3000,
      });
      return;
    }
    
    // Validate breathing technique
    if (!data.sbrt_data.breathing_technique) {
      toast({
        title: 'Please select a technique',
        status: 'error',
        duration: 3000,
      });
      return;
    }
    
    // Validate treatment type
    if (isSIB === null) {
      toast({
        title: 'Please select a treatment type (Standard or SIB)',
        status: 'error',
        duration: 3000,
      });
      return;
    }
    
    // Validate volume relationships (clinical physics constraints)
    const vol50 = parseFloat(data.sbrt_data.vol_50_rx_isodose);
    const vol100 = parseFloat(data.sbrt_data.vol_100_rx_isodose);
    const ptvVol = parseFloat(data.sbrt_data.ptv_volume);
    
    if (vol50 <= vol100) {
      toast({
        title: 'Invalid isodose volumes',
        description: '50% isodose volume must be greater than 100% isodose volume',
        status: 'error',
        duration: 5000,
      });
      return;
    }
    
    if (vol100 < ptvVol) {
      toast({
        title: 'Invalid prescription isodose volume',
        description: '100% isodose volume should be ≥ PTV volume for adequate coverage',
        status: 'warning',
        duration: 5000,
      });
      // Don't return - this is a warning, not a hard error
    }
      
    setLoading(true);
    try {
      // Add calculated metrics to the form data
      const dataWithMetrics = {
        ...data,
        sbrt_data: {
          ...data.sbrt_data,
          calculated_metrics: calculatedMetrics,
          is_sib: isSIB
        }
      };
      
      const response = await generateSBRTWriteup(dataWithMetrics);
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
    setCalculatedMetrics(null);
    setIsSIB(null);
    setSelectedSite(null);
    setEditingTechnique(false);
    setEditingTreatmentType(false);
  };

  const getDeviationColor = (deviation) => {
    if (deviation === 'N/A (SIB)') return 'gray.400';
    if (deviation === 'None') return 'green.300';
    if (deviation === 'Minor') return 'yellow.300';
    if (deviation === 'Major') return 'red.300';
    return 'white';
  };

  // Get the color scheme for the selected site (all use green)
  const getSelectedSiteColor = () => {
    return 'green';
  };

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
            {/* Three Column Layout */}
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
                          {['Bassiri', 'Kirby', 'Paschal', 'Rasmussen'].map(name => (
                            <Button
                              key={name}
                              size="sm"
                              variant={field.value === name ? 'solid' : 'outline'}
                              colorScheme={field.value === name ? 'blue' : 'gray'}
                              color={field.value === name ? 'white' : 'gray.300'}
                              borderColor="gray.600"
                              onClick={() => field.onChange(name)}
                              _hover={{ bg: field.value === name ? 'blue.600' : 'gray.700' }}
                            >
                              {name}
                            </Button>
                          ))}
                          </Grid>
                        )}
                      />
                      <FormErrorMessage sx={{ color: 'red.300' }}>
                        {errors.common_info?.physicist?.name?.message}
                      </FormErrorMessage>
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
                          {['Dalwadi', 'Galvan', 'Ha', 'Kluwe', 'Le', 'Lewis'].map(name => (
                            <Button
                              key={name}
                              size="sm"
                              variant={field.value === name ? 'solid' : 'outline'}
                              colorScheme={field.value === name ? 'blue' : 'gray'}
                              color={field.value === name ? 'white' : 'gray.300'}
                              borderColor="gray.600"
                              onClick={() => field.onChange(name)}
                              _hover={{ bg: field.value === name ? 'blue.600' : 'gray.700' }}
                            >
                              {name}
                            </Button>
                          ))}
                          </Grid>
                        )}
                      />
                      <FormErrorMessage sx={{ color: 'red.300' }}>
                        {errors.common_info?.physician?.name?.message}
                      </FormErrorMessage>
                    </FormControl>
                </VStack>
              </GridItem>

              {/* Treatment Selection - Spans 2 columns on large screens */}
              <GridItem 
                colSpan={{ base: 1, lg: 2 }}
                as={Box} 
                p={4} 
                borderWidth="1px" 
                borderRadius="md" 
                bg={formBg}
                borderColor={borderColor}
                boxShadow="sm"
              >
                <Heading size="sm" mb={3} textAlign="center" color="white">Treatment Selection</Heading>
                
                {/* Site Grid - Each site with attached expansion */}
                <Grid templateColumns="repeat(3, 1fr)" gap={2} mb={3}>
                  {treatmentSites.map((site) => (
                    <VStack key={site.id} spacing={0} align="stretch">
                      <Button
                        size="sm"
                        width="100%"
                        variant={selectedSite === site.id ? 'solid' : 'outline'}
                        colorScheme={selectedSite === site.id ? 'green' : 'gray'}
                        color={selectedSite === site.id ? 'white' : 'gray.300'}
                        borderColor={selectedSite === site.id ? 'green.500' : 'gray.600'}
                        onClick={() => handleSiteSelect(site.id)}
                        _hover={{ 
                          bg: selectedSite === site.id ? 'green.600' : 'gray.700',
                          borderColor: 'green.400'
                        }}
                        borderBottomRadius={selectedSite === site.id ? 0 : 'md'}
                      >
                        {site.label}
                      </Button>
                      
                      {/* Inline expansion attached to THIS button - contains ALL fields */}
                      {selectedSite === site.id && (
                        <Box
                          bg="green.900"
                          borderBottomRadius="md"
                          borderLeft="2px"
                          borderRight="2px"
                          borderBottom="2px"
                          borderColor="green.500"
                          p={2}
                        >
                          {/* Bone/Spine location input */}
                          {site.id === 'bone_spine' && (
                            <Input
                              size="xs"
                              placeholder="e.g., T11-L1"
                              {...register('sbrt_data.anatomical_clarification')}
                              bg="gray.700"
                              borderColor="gray.600"
                              color="white"
                              mb={2}
                              _placeholder={{ color: 'gray.400' }}
                            />
                          )}
                          
                          {/* Technique selection - inline buttons */}
                          <HStack spacing={1} mb={2} justify="center">
                            {[
                              { value: 'freebreathe', label: 'FB' },
                              { value: '4DCT', label: '4DCT' },
                              { value: 'DIBH', label: 'DIBH' }
                            ].map(technique => (
                              <Button
                                key={technique.value}
                                size="xs"
                                colorScheme={watchBreathingTechnique === technique.value ? 'blue' : 'gray'}
                                variant={watchBreathingTechnique === technique.value ? 'solid' : 'outline'}
                                onClick={() => setValue('sbrt_data.breathing_technique', technique.value)}
                              >
                                {technique.label}
                              </Button>
                            ))}
                          </HStack>
                          
                          {/* Treatment Type - inline buttons */}
                          <HStack spacing={1} mb={2} justify="center">
                            <Button
                              size="xs"
                              colorScheme={isSIB === false ? 'green' : 'gray'}
                              variant={isSIB === false ? 'solid' : 'outline'}
                              onClick={() => setIsSIB(false)}
                            >
                              Std
                            </Button>
                            <Button
                              size="xs"
                              colorScheme={isSIB === true ? 'orange' : 'gray'}
                              variant={isSIB === true ? 'solid' : 'outline'}
                              onClick={() => setIsSIB(true)}
                            >
                              SIB
                            </Button>
                          </HStack>
                          
                          {/* SIB Comment (conditional) */}
                          {isSIB && (
                            <Input
                              size="xs"
                              placeholder="SIB comment (e.g., 40/45)"
                              {...register('sbrt_data.sib_comment')}
                              bg="gray.700"
                              borderColor="gray.600"
                              color="white"
                              mb={2}
                              _placeholder={{ color: 'gray.400' }}
                            />
                          )}
                          
                          {/* PTV Name */}
                          <Input
                            size="xs"
                            placeholder="PTV Name (e.g., PTV_50)"
                            {...register('sbrt_data.target_name', { required: 'PTV name is required' })}
                            bg="gray.700"
                            borderColor="gray.600"
                            color="white"
                            mb={2}
                            _placeholder={{ color: 'gray.400' }}
                          />
                          
                          {/* Dose / Fractions */}
                          <HStack spacing={2}>
                            <Input
                              size="xs"
                              type="number"
                              step="any"
                              placeholder="Dose (Gy)"
                              {...register('sbrt_data.dose', { 
                                required: 'Dose is required',
                                min: { value: 0.1, message: 'Dose must be > 0' }
                              })}
                              bg="gray.700"
                              borderColor="gray.600"
                              color="white"
                              _placeholder={{ color: 'gray.400' }}
                            />
                            <Input
                              size="xs"
                              type="number"
                              step="1"
                              placeholder="Fx"
                              {...register('sbrt_data.fractions', { 
                                required: 'Fractions required',
                                min: { value: 1, message: 'At least 1' },
                                max: { value: 10, message: 'Max 10' }
                              })}
                              bg="gray.700"
                              borderColor="gray.600"
                              color="white"
                              _placeholder={{ color: 'gray.400' }}
                              w="80px"
                            />
                          </HStack>
                        </Box>
                      )}
                    </VStack>
                  ))}
                </Grid>
                
                {/* + Other button with attached expansion */}
                <VStack spacing={0} align="stretch" mb={3}>
                  <Button
                    size="sm"
                    width="100%"
                    variant={selectedSite === 'other' ? 'solid' : 'outline'}
                    colorScheme={selectedSite === 'other' ? 'gray' : 'gray'}
                    color={selectedSite === 'other' ? 'white' : 'gray.400'}
                    borderColor={selectedSite === 'other' ? 'gray.500' : 'gray.600'}
                    borderStyle={selectedSite === 'other' ? 'solid' : 'dashed'}
                    onClick={() => handleSiteSelect('other')}
                    _hover={{ bg: 'gray.700', borderColor: 'gray.500' }}
                    borderBottomRadius={selectedSite === 'other' ? 0 : 'md'}
                  >
                    + Other...
                  </Button>
                  
                  {/* Inline expansion for Other - contains ALL fields */}
                  {selectedSite === 'other' && (
                    <Box
                      bg="gray.800"
                      borderBottomRadius="md"
                      borderLeft="2px"
                      borderRight="2px"
                      borderBottom="2px"
                      borderColor="gray.500"
                      p={2}
                    >
                      {/* Custom site name */}
                      <Input
                        size="xs"
                        placeholder="Site name (e.g., Adrenal)"
                        {...register('sbrt_data.custom_treatment_site', {
                          required: selectedSite === 'other' ? 'Site name is required' : false
                        })}
                        bg="gray.700"
                        borderColor="gray.600"
                        color="white"
                        mb={2}
                        _placeholder={{ color: 'gray.400' }}
                      />
                      
                      {/* Technique selection - inline buttons */}
                      <HStack spacing={1} mb={2} justify="center">
                        {[
                          { value: 'freebreathe', label: 'FB' },
                          { value: '4DCT', label: '4DCT' },
                          { value: 'DIBH', label: 'DIBH' }
                        ].map(technique => (
                          <Button
                            key={technique.value}
                            size="xs"
                            colorScheme={watchBreathingTechnique === technique.value ? 'blue' : 'gray'}
                            variant={watchBreathingTechnique === technique.value ? 'solid' : 'outline'}
                            onClick={() => setValue('sbrt_data.breathing_technique', technique.value)}
                          >
                            {technique.label}
                          </Button>
                        ))}
                      </HStack>
                      
                      {/* Treatment Type - inline buttons */}
                      <HStack spacing={1} mb={2} justify="center">
                        <Button
                          size="xs"
                          colorScheme={isSIB === false ? 'green' : 'gray'}
                          variant={isSIB === false ? 'solid' : 'outline'}
                          onClick={() => setIsSIB(false)}
                        >
                          Std
                        </Button>
                        <Button
                          size="xs"
                          colorScheme={isSIB === true ? 'orange' : 'gray'}
                          variant={isSIB === true ? 'solid' : 'outline'}
                          onClick={() => setIsSIB(true)}
                        >
                          SIB
                        </Button>
                      </HStack>
                      
                      {/* SIB Comment (conditional) */}
                      {isSIB && (
                        <Input
                          size="xs"
                          placeholder="SIB comment (e.g., 40/45)"
                          {...register('sbrt_data.sib_comment')}
                          bg="gray.700"
                          borderColor="gray.600"
                          color="white"
                          mb={2}
                          _placeholder={{ color: 'gray.400' }}
                        />
                      )}
                      
                      {/* PTV Name */}
                      <Input
                        size="xs"
                        placeholder="PTV Name (e.g., PTV_50)"
                        {...register('sbrt_data.target_name', { required: 'PTV name is required' })}
                        bg="gray.700"
                        borderColor="gray.600"
                        color="white"
                        mb={2}
                        _placeholder={{ color: 'gray.400' }}
                      />
                      
                      {/* Dose / Fractions */}
                      <HStack spacing={2}>
                        <Input
                          size="xs"
                          type="number"
                          step="any"
                          placeholder="Dose (Gy)"
                          {...register('sbrt_data.dose', { 
                            required: 'Dose is required',
                            min: { value: 0.1, message: 'Dose must be > 0' }
                          })}
                          bg="gray.700"
                          borderColor="gray.600"
                          color="white"
                          _placeholder={{ color: 'gray.400' }}
                        />
                        <Input
                          size="xs"
                          type="number"
                          step="1"
                          placeholder="Fx"
                          {...register('sbrt_data.fractions', { 
                            required: 'Fractions required',
                            min: { value: 1, message: 'At least 1' },
                            max: { value: 10, message: 'Max 10' }
                          })}
                          bg="gray.700"
                          borderColor="gray.600"
                          color="white"
                          _placeholder={{ color: 'gray.400' }}
                          w="80px"
                        />
                      </HStack>
                    </Box>
                  )}
                </VStack>

                {/* Hint when no site selected */}
                {!selectedSite && (
                  <Text fontSize="xs" color="gray.500" textAlign="center" mt={2}>
                    Click a site above to configure treatment
                  </Text>
                )}
              </GridItem>
            </Grid>

            {/* Plan Metrics Section - Full Width Below */}
            {selectedSite && (
              <Box 
                p={4} 
                borderWidth="1px" 
                borderRadius="md" 
                bg={formBg}
                borderColor={borderColor}
                boxShadow="sm"
                mb={6}
              >
                <Heading size="sm" mb={3} textAlign="center" color="white">Plan Metrics</Heading>
                
                <Grid templateColumns={{ base: "repeat(2, 1fr)", md: "repeat(3, 1fr)", lg: "repeat(6, 1fr)" }} gap={3}>
                    <FormControl isInvalid={errors.sbrt_data?.ptv_volume}>
                    <FormLabel fontSize="xs" color="gray.400">PTV Vol (cc)</FormLabel>
                      <Input
                        size="sm"
                        type="number"
                        step="any"
                      placeholder="25"
                        {...register('sbrt_data.ptv_volume', { 
                        required: 'Required',
                        min: { value: 0.01, message: '> 0' }
                        })}
                        bg="gray.700"
                        borderColor="gray.600"
                        color="white"
                        _hover={{ borderColor: "gray.500" }}
                        _placeholder={{ color: 'gray.400' }}
                      />
                    </FormControl>

                    <FormControl isInvalid={errors.sbrt_data?.vol_ptv_receiving_rx}>
                    <FormLabel fontSize="xs" color="gray.400">Vol at Rx (cc)</FormLabel>
                      <Input
                        size="sm"
                        type="number"
                        step="any"
                        placeholder="24.5"
                      {...register('sbrt_data.vol_ptv_receiving_rx', { 
                        required: 'Required',
                        min: { value: 0.01, message: '> 0' }
                      })}
                        bg="gray.700"
                        borderColor="gray.600"
                        color="white"
                        _hover={{ borderColor: "gray.500" }}
                        _placeholder={{ color: 'gray.400' }}
                      />
                    </FormControl>

                    <FormControl isInvalid={errors.sbrt_data?.vol_100_rx_isodose}>
                    <FormLabel fontSize="xs" color="gray.400">100% Vol (cc)</FormLabel>
                      <Input
                        size="sm"
                        type="number"
                        step="any"
                        placeholder="28"
                      {...register('sbrt_data.vol_100_rx_isodose', { 
                        required: 'Required',
                        min: { value: 0.01, message: '> 0' }
                      })}
                        bg="gray.700"
                        borderColor="gray.600"
                        color="white"
                        _hover={{ borderColor: "gray.500" }}
                        _placeholder={{ color: 'gray.400' }}
                      />
                    </FormControl>

                    <FormControl isInvalid={errors.sbrt_data?.vol_50_rx_isodose}>
                    <FormLabel fontSize="xs" color="gray.400">50% Vol (cc)</FormLabel>
                      <Input
                        size="sm"
                        type="number"
                        step="any"
                        placeholder="90"
                      {...register('sbrt_data.vol_50_rx_isodose', { 
                        required: 'Required',
                        min: { value: 0.01, message: '> 0' }
                      })}
                        bg="gray.700"
                        borderColor="gray.600"
                        color="white"
                        _hover={{ borderColor: "gray.500" }}
                        _placeholder={{ color: 'gray.400' }}
                      />
                    </FormControl>

                    <FormControl isInvalid={errors.sbrt_data?.max_dose_2cm_ring}>
                    <FormLabel fontSize="xs" color="gray.400">Dmax 2cm (Gy)</FormLabel>
                      <Input
                        size="sm"
                        type="number"
                        step="any"
                        placeholder="25"
                      {...register('sbrt_data.max_dose_2cm_ring', { 
                        required: 'Required',
                        min: { value: 0.01, message: '> 0' }
                      })}
                        bg="gray.700"
                        borderColor="gray.600"
                        color="white"
                        _hover={{ borderColor: "gray.500" }}
                        _placeholder={{ color: 'gray.400' }}
                      />
                    </FormControl>

                    <FormControl isInvalid={errors.sbrt_data?.max_dose_in_target}>
                    <FormLabel fontSize="xs" color="gray.400">Dmax Target (Gy)</FormLabel>
                      <Input
                        size="sm"
                        type="number"
                        step="any"
                        placeholder="60"
                      {...register('sbrt_data.max_dose_in_target', { 
                        required: 'Required',
                        min: { value: 0.01, message: '> 0' }
                      })}
                        bg="gray.700"
                        borderColor="gray.600"
                        color="white"
                        _hover={{ borderColor: "gray.500" }}
                        _placeholder={{ color: 'gray.400' }}
                      />
                    </FormControl>
                  </Grid>
              </Box>
            )}

            {/* Calculated Results Table */}
            {selectedSite && (
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
            )}
            
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
