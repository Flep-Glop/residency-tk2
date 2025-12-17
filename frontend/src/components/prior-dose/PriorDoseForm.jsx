import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
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
  IconButton,
  HStack,
  VStack,
  Checkbox,
  Badge,
  Flex,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Alert,
  AlertIcon,
  AlertDescription,
} from '@chakra-ui/react';
import { AddIcon, DeleteIcon } from '@chakra-ui/icons';
import { getTreatmentSites, getDoseCalcMethods, generatePriorDoseWriteup, getSuggestedConstraints } from '../../services/priorDoseService';

const PriorDoseForm = () => {
  const router = useRouter();
  const [treatmentSites, setTreatmentSites] = useState([]);
  const [doseCalcMethods, setDoseCalcMethods] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [writeup, setWriteup] = useState('');
  const [expandedIndices, setExpandedIndices] = useState([0]);
  const [isCustomCurrentSite, setIsCustomCurrentSite] = useState(false);
  const toast = useToast();
  
  // Hard-coded lists following fusion pattern
  const [physicians, setPhysicians] = useState(['Dalwadi', 'Galvan', 'Ha', 'Kluwe', 'Le', 'Lewis', 'Tuli']);
  const [physicists, setPhysicists] = useState(['Bassiri', 'Kirby', 'Papanikolaou', 'Paschal', 'Rasmussen']);
  
  // Form setup
  const { register, handleSubmit, formState: { errors }, watch, setValue, getValues, control } = useForm({
    defaultValues: {
      common_info: {
        physician: { name: '' },
        physicist: { name: '' },
      },
      prior_dose_data: {
        current_site: '',
        custom_current_site: '',
        current_dose: '',
        current_fractions: '',
        current_month: new Date().toLocaleDateString('en-US', { month: 'long' }),
        current_year: new Date().getFullYear(),
        spine_location: '',
        prior_treatments: [
          {
            site: '',
            custom_site: '',
            dose: '',
            fractions: '',
            month: '',
            year: '',
            spine_location: '',
            has_overlap: false,
            dicoms_unavailable: false
          }
        ],
        dose_calc_method: '',
        critical_structures: [],
        dose_statistics: []
      }
    }
  });
  
  // Field array for prior treatments
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'prior_dose_data.prior_treatments'
  });
  
  // Field array for dose statistics
  const { fields: doseStatFields, append: appendDoseStat, remove: removeDoseStat } = useFieldArray({
    control,
    name: 'prior_dose_data.dose_statistics'
  });
  
  // Watch prior treatments for preview and overlap detection
  const watchPriorTreatments = watch('prior_dose_data.prior_treatments');
  const watchCurrentSite = watch('prior_dose_data.current_site');
  const watchCustomCurrentSite = watch('prior_dose_data.custom_current_site');
  const watchCurrentDose = watch('prior_dose_data.current_dose');
  const watchCurrentFractions = watch('prior_dose_data.current_fractions');
  const watchDoseCalcMethod = watch('prior_dose_data.dose_calc_method');
  
  // Stringify prior treatments to detect nested property changes
  // React's shallow comparison doesn't catch changes to .site within array items
  const priorTreatmentsString = JSON.stringify(watchPriorTreatments);
  
  // Check if any treatment has overlap
  const hasAnyOverlap = watchPriorTreatments?.some(t => t?.has_overlap) || false;
  
  /**
   * Detect fractionation regime based on dose and fractions.
   * This matches the backend logic in prior_dose.py
   * 
   * Regimes:
   * - SRS: Single fraction (any dose)
   * - SBRT_3fx: ≥5 Gy/fx with ≤3 fractions
   * - SBRT_5fx: ≥5 Gy/fx with 4-8 fractions
   * - MODERATE_HYPOFX: 2.5-5 Gy/fx
   * - CONVENTIONAL: <2.5 Gy/fx
   * 
   * For SBRT/SRS, the constraint tables are organized by NUMBER OF FRACTIONS,
   * not dose per fraction. So 22 Gy/1fx and 30 Gy/1fx are both SRS and use
   * the same constraint table.
   */
  const detectFractionationRegime = (dose, fractions) => {
    if (fractions <= 0) return 'CONVENTIONAL';
    
    const dosePerFraction = dose / fractions;
    
    // Single fraction - SRS
    if (fractions === 1) return 'SRS';
    
    // SBRT (≥5 Gy per fraction with ≤8 fractions)
    if (dosePerFraction >= 5 && fractions <= 8) {
      if (fractions <= 3) return 'SBRT_3fx';
      return 'SBRT_5fx';
    }
    
    // Moderate hypofractionation (2.5-5 Gy/fx)
    if (dosePerFraction >= 2.5 && dosePerFraction < 5) return 'MODERATE_HYPOFX';
    
    // Conventional fractionation (<2.5 Gy/fx)
    return 'CONVENTIONAL';
  };
  
  /**
   * Get human-readable label for a regime
   */
  const getRegimeLabel = (regime) => {
    const labels = {
      'SRS': 'SRS (1fx)',
      'SBRT_3fx': 'SBRT (3fx)',
      'SBRT_5fx': 'SBRT (5fx)',
      'MODERATE_HYPOFX': 'Moderate Hypofx',
      'CONVENTIONAL': 'Conventional (~2 Gy/fx)'
    };
    return labels[regime] || regime;
  };
  
  // Detect if fractionation regimes differ between treatments
  // For SBRT/SRS, what matters is matching the fraction count to the same constraint table
  // For conventional, dose per fraction matters (~2 Gy/fx for QUANTEC constraints)
  const fractionationMismatch = useMemo(() => {
    const currentDose = parseFloat(watchCurrentDose);
    const currentFx = parseInt(watchCurrentFractions);
    
    // Need valid current treatment values
    if (!currentDose || !currentFx || currentFx <= 0) return null;
    
    const currentRegime = detectFractionationRegime(currentDose, currentFx);
    const currentDpf = currentDose / currentFx;
    const treatments = [{ 
      label: 'Current', 
      regime: currentRegime,
      dpf: currentDpf,
      fractions: currentFx
    }];
    
    // Check all prior treatments with overlap
    (watchPriorTreatments || []).forEach((treatment, index) => {
      if (!treatment?.has_overlap) return; // Only check overlapping treatments
      
      const priorDose = parseFloat(treatment?.dose);
      const priorFx = parseInt(treatment?.fractions);
      if (priorDose && priorFx && priorFx > 0) {
        const priorRegime = detectFractionationRegime(priorDose, priorFx);
        treatments.push({
          label: `Prior ${index + 1}`,
          regime: priorRegime,
          dpf: priorDose / priorFx,
          fractions: priorFx
        });
      }
    });
    
    // Need at least 2 treatments to compare
    if (treatments.length < 2) return null;
    
    const firstRegime = treatments[0].regime;
    const hasMismatch = treatments.some(t => t.regime !== firstRegime);
    
    if (!hasMismatch) return null;
    
    return {
      treatments: treatments,
      message: 'Different fractionation regimes detected. Raw dose constraints are specific to each regime. Select EQD2 to enable constraint suggestions across different fractionation schemes.'
    };
  }, [watchCurrentDose, watchCurrentFractions, priorTreatmentsString]);
  
  // Compute a sites key that changes when any relevant site changes
  // This ensures the useEffect triggers when sites are modified
  // Also includes dose/fractions/method so constraints update when fractionation changes
  const sitesKey = useMemo(() => {
    const currentSite = isCustomCurrentSite ? watchCustomCurrentSite : watchCurrentSite;
    const priorSites = (watchPriorTreatments || [])
      .filter(t => t?.has_overlap)
      .map(t => t.custom_site || t.site)
      .filter(Boolean);
    
    return JSON.stringify([
      currentSite, 
      ...priorSites.sort(),
      watchCurrentDose,
      watchCurrentFractions,
      watchDoseCalcMethod
    ]);
  }, [watchCurrentSite, watchCustomCurrentSite, isCustomCurrentSite, priorTreatmentsString, watchCurrentDose, watchCurrentFractions, watchDoseCalcMethod]);

  // Auto-populate dose statistics when overlap is detected or sites change
  // Collects all sites (current + prior with overlap) and fetches deduplicated constraints
  // Preserves user-entered values when updating
  // Uses sitesKey dependency to properly detect nested site changes
  // NOTE: When fractionation differs and Raw Dose is selected, constraints are not suggested
  //       because raw dose addition across different fractionation schemes is not clinically valid
  useEffect(() => {
    const loadSuggestedConstraints = async () => {
      if (!hasAnyOverlap) {
        // Clear dose statistics when no overlap
        setValue('prior_dose_data.dose_statistics', []);
        return;
      }
      
      // When fractionation differs and Raw Dose is selected, we still allow constraints
      // but the warning banner is shown to inform the user about the mismatch
      // Previously this cleared dose_statistics which "tripped out" the system
      // when users added multiple prior treatments with different fractionation
      
      // Get current site (custom or standard)
      const currentSite = isCustomCurrentSite 
        ? watchCustomCurrentSite
        : watchCurrentSite;
      
      if (!currentSite) return;
      
      // Find overlapping treatments
      const overlappingTreatments = watchPriorTreatments?.filter(t => t?.has_overlap) || [];
      if (overlappingTreatments.length === 0) return;
      
      // Collect all unique sites (current + all overlapping prior sites)
      const allSites = new Set([currentSite]);
      for (const treatment of overlappingTreatments) {
        const priorSite = treatment.custom_site || treatment.site;
        if (priorSite) {
          allSites.add(priorSite);
        }
      }
      
      try {
        // Get current fractionation info for regime detection
        const currentDose = getValues('prior_dose_data.current_dose');
        const currentFractions = getValues('prior_dose_data.current_fractions');
        const doseCalcMethod = getValues('prior_dose_data.dose_calc_method');
        
        // Single API call with all sites - backend handles deduplication
        // Pass fractionation info for regime-appropriate constraint selection:
        // - EQD2 selected → QUANTEC constraints
        // - Raw Dose + SBRT fractionation → Timmerman constraints  
        // - Raw Dose + conventional → QUANTEC constraints
        const constraints = await getSuggestedConstraints(Array.from(allSites), {
          doseCalcMethod,
          currentDose: currentDose ? parseFloat(currentDose) : undefined,
          currentFractions: currentFractions ? parseInt(currentFractions) : undefined
        });
        
        // Get current stats to preserve user-entered values
        const currentStats = getValues('prior_dose_data.dose_statistics') || [];
        
        // Create a map of existing values keyed by structure+constraint
        const existingValues = new Map();
        for (const stat of currentStats) {
          const key = `${stat.structure}_${stat.constraint_type}`;
          if (stat.value && stat.value.trim() !== '') {
            existingValues.set(key, stat.value);
          }
        }
        
        // Convert API response to form format, preserving existing values
        const formattedConstraints = constraints.map(constraint => {
          const key = `${constraint.structure}_${constraint.constraint}`;
          return {
            structure: constraint.structure,
            constraint_type: constraint.constraint,
            value: existingValues.get(key) || '',  // Preserve existing value or empty
            source: constraint.source,
            unit: constraint.unit || '',
            limit: constraint.limit || '',
            region: constraint.region || 'Other'
          };
        });
        
        if (formattedConstraints.length > 0) {
          setValue('prior_dose_data.dose_statistics', formattedConstraints);
        }
      } catch (error) {
        console.log('Could not fetch constraints for sites:', Array.from(allSites));
      }
    };
    
    loadSuggestedConstraints();
  }, [sitesKey, hasAnyOverlap, setValue, getValues, watchCurrentSite, watchCustomCurrentSite, isCustomCurrentSite, priorTreatmentsString, fractionationMismatch, watchDoseCalcMethod]);

  // Handler for custom current site checkbox
  const handleCustomCurrentSiteChange = (e) => {
    setIsCustomCurrentSite(e.target.checked);
    if (e.target.checked) {
      setValue('prior_dose_data.current_site', '');
    } else {
      setValue('prior_dose_data.custom_current_site', '');
    }
  };

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [sitesData, methodsData] = await Promise.all([
          getTreatmentSites(),
          getDoseCalcMethods()
        ]);
        
        setTreatmentSites(sitesData);
        setDoseCalcMethods(methodsData);
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
    
    loadInitialData();
  }, [toast]);
  
  // Add prior treatment
  const addPriorTreatment = () => {
    const newIndex = fields.length;
    append({
      site: '',
      custom_site: '',
      dose: '',
      fractions: '',
      month: 'January',
      year: '',
      spine_location: '',
      has_overlap: false,
      dicoms_unavailable: false
    });
    // Expand the newly added treatment
    setExpandedIndices(prev => [...prev, newIndex]);
  };

  // Copy writeup to clipboard
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(writeup);
      toast({
        title: 'Copied!',
        description: 'Write-up copied to clipboard',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    } catch (err) {
      toast({
        title: 'Copy failed',
        description: 'Could not copy to clipboard',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };
  
  // Submit form
  const onSubmit = async (data) => {
    // Check if overlap exists and at least one dose statistic has a value
    const anyOverlap = data.prior_dose_data.prior_treatments?.some(t => t.has_overlap);
    const filledStats = (data.prior_dose_data.dose_statistics || []).filter(
      stat => stat.value && stat.value.trim() !== ''
    );
    
    if (anyOverlap && filledStats.length === 0) {
      toast({
        title: 'Dose statistics required',
        description: 'When overlap exists, at least one dose statistic must have a value filled in.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }
    
    setLoading(true);
    try {
      // Automatically extract critical structures from filled dose statistics
      // This avoids redundant user input - structures are derived from what they entered
      const criticalStructures = [...new Set(
        filledStats.map(stat => stat.structure).filter(s => s && s.length > 0)
      )];
      
      // Filter out dose statistics that don't have a value filled in
      const filteredData = {
        ...data,
        prior_dose_data: {
          ...data.prior_dose_data,
          critical_structures: criticalStructures,
          dose_statistics: filledStats
        }
      };
      
      console.log('Submitting Prior Dose data:', filteredData);
      
      const result = await generatePriorDoseWriteup(filteredData);
      setWriteup(result.writeup);
      
      toast({
        title: 'Write-up generated successfully!',
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
  
  if (initialLoading) {
    return (
      <Box bg="gray.900" minH="100vh" textAlign="center" p={5}>
        <Text fontSize="lg" mb={2} color="white">Loading Prior Dose form data...</Text>
        <Text fontSize="sm" color="gray.400">Please wait while we initialize the form</Text>
      </Box>
    );
  }

  const formBg = "gray.800";
  const borderColor = "gray.600";

  return (
    <Box bg="gray.900" minH="100vh">
      {/* Header */}
      <Box bg="green.900" color="white" p={6} mb={6} borderRadius="lg" border="1px" borderColor="green.700">
        <Flex justify="space-between" align="center" flexWrap="wrap" gap={4}>
          <Box>
            <Heading size="md" mb={2}>
              Prior Dose Write-up Generator
            </Heading>
          </Box>
        </Flex>
      </Box>

      {/* Main Content */}
      <Box px={6}>
        <Box maxW="1200px" mx="auto">
          <form onSubmit={handleSubmit(onSubmit)}>
            {/* Three Column Layout - Responsive */}
            <Grid 
              templateColumns={{
                base: "1fr",
                md: "repeat(2, 1fr)",
                lg: "repeat(3, 1fr)"
              }} 
              gap={4} 
              mb={6}
            >
            {/* Staff Info Column */}
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
              <Box mb={6}>
                
                <FormControl isInvalid={errors.common_info?.physician?.name} mb={3}>
                  <FormLabel fontSize="sm" color="gray.300">Physician Name</FormLabel>
                  <Select 
                    size="sm"
                    {...register('common_info.physician.name', { required: 'Physician is required' })}
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
                    <option value="" style={{ backgroundColor: '#2D3748', color: '#A0AEC0' }}></option>
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
                    {...register('common_info.physicist.name', { required: 'Physicist is required' })}
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
                    <option value="" style={{ backgroundColor: '#2D3748', color: '#A0AEC0' }}></option>
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

            {/* Treatment Info Column */}
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
              {!isCustomCurrentSite ? (
                <FormControl isInvalid={errors.prior_dose_data?.current_site} mb={3}>
                  <FormLabel fontSize="sm" color="gray.300" fontWeight="bold">Current Treatment Site</FormLabel>
                  <Select 
                    size="sm"
                    {...register('prior_dose_data.current_site', { 
                      required: !isCustomCurrentSite ? 'Current treatment site is required' : false 
                    })}
                    aria-label="Current treatment site"
                    bg="gray.700"
                    borderColor="gray.600"
                    color="white"
                    _hover={{ borderColor: "gray.500" }}
                    isDisabled={isCustomCurrentSite}
                    data-theme="dark"
                    sx={{
                      '& option': {
                        backgroundColor: 'gray.700',
                        color: 'white',
                      }
                    }}
                  >
                    <option value="" style={{ backgroundColor: '#2D3748', color: '#A0AEC0' }}></option>
                    {treatmentSites.map(site => (
                      <option key={site} value={site} style={{ backgroundColor: '#2D3748', color: 'white' }}>{site}</option>
                    ))}
                  </Select>
                  <FormErrorMessage sx={{ color: 'red.300' }}>
                    {errors.prior_dose_data?.current_site?.message}
                  </FormErrorMessage>
                </FormControl>
              ) : (
                <FormControl isInvalid={errors.prior_dose_data?.custom_current_site} mb={3}>
                  <FormLabel fontSize="sm" color="gray.300" fontWeight="bold">Custom Treatment Site Name</FormLabel>
                  <Input
                    size="sm"
                    {...register('prior_dose_data.custom_current_site', {
                      required: isCustomCurrentSite ? 'Custom treatment site name is required' : false
                    })}
                    aria-label="Custom treatment site name"
                    placeholder="Enter custom site"
                    bg="gray.700"
                    borderColor="gray.600"
                    color="white"
                    _hover={{ borderColor: "gray.500" }}
                    _placeholder={{ color: "gray.400" }}
                  />
                  <FormErrorMessage sx={{ color: 'red.300' }}>
                    {errors.prior_dose_data?.custom_current_site?.message}
                  </FormErrorMessage>
                </FormControl>
              )}
              
              <Checkbox
                isChecked={isCustomCurrentSite}
                onChange={handleCustomCurrentSiteChange}
                mb={3}
                colorScheme="blue"
              >
                <Text fontSize="sm" color="gray.300">Custom Treatment Site?</Text>
              </Checkbox>
              
              <Grid templateColumns="repeat(2, 1fr)" gap={2} mb={3}>
                <FormControl isInvalid={errors.prior_dose_data?.current_dose}>
                  <FormLabel fontSize="sm" color="gray.300">Current Dose (Gy)</FormLabel>
                  <Input 
                    size="sm"
                    type="number"
                    step="0.1"
                    {...register('prior_dose_data.current_dose', { 
                      required: 'Current dose is required',
                      min: { value: 0.1, message: 'Dose must be positive' }
                    })}
                    placeholder="Enter dose"
                    bg="gray.700"
                    borderColor="gray.600"
                    color="white"
                    _hover={{ borderColor: "gray.500" }}
                    _placeholder={{ color: "gray.400" }}
                  />
                  <FormErrorMessage sx={{ color: 'red.300' }}>
                    {errors.prior_dose_data?.current_dose?.message}
                  </FormErrorMessage>
                </FormControl>
                
                <FormControl isInvalid={errors.prior_dose_data?.current_fractions}>
                  <FormLabel fontSize="sm" color="gray.300">Current Fractions</FormLabel>
                  <Input 
                    size="sm"
                    type="number"
                    {...register('prior_dose_data.current_fractions', { 
                      required: 'Current fractions is required',
                      min: { value: 1, message: 'Fractions must be at least 1' }
                    })}
                    placeholder="Enter fractions"
                    bg="gray.700"
                    borderColor="gray.600"
                    color="white"
                    _hover={{ borderColor: "gray.500" }}
                    _placeholder={{ color: "gray.400" }}
                  />
                  <FormErrorMessage sx={{ color: 'red.300' }}>
                    {errors.prior_dose_data?.current_fractions?.message}
                  </FormErrorMessage>
                </FormControl>
              </Grid>
            </GridItem>

            {/* Dose Analysis Column */}
            <GridItem
              as={Box}
              p={4} 
              borderWidth="1px" 
              borderRadius="md" 
              bg={formBg}
              borderColor={borderColor}
              boxShadow="sm"
            >
              <Heading size="sm" mb={3} textAlign="center" color="white">Dose Analysis</Heading>

              <FormControl isInvalid={errors.prior_dose_data?.dose_calc_method} mb={3}>
                <FormLabel fontSize="sm" color="gray.300">Dose Calculation Method</FormLabel>
                <Controller
                  name="prior_dose_data.dose_calc_method"
                  control={control}
                  rules={{ required: 'Dose calculation method is required' }}
                  render={({ field }) => (
                    <HStack spacing={2}>
                      <Button
                        size="sm"
                        width="50%"
                        variant={field.value === 'Raw Dose' ? 'solid' : 'outline'}
                        colorScheme={field.value === 'Raw Dose' ? 'blue' : 'gray'}
                        color={field.value === 'Raw Dose' ? 'white' : 'gray.300'}
                        onClick={() => field.onChange('Raw Dose')}
                        _hover={{
                          bg: field.value === 'Raw Dose' ? 'blue.600' : 'gray.700',
                          borderColor: field.value === 'Raw Dose' ? 'blue.300' : 'gray.500'
                        }}
                      >
                        Raw Dose
                      </Button>
                      <Button
                        size="sm"
                        width="50%"
                        variant={field.value === 'EQD2 (Equivalent Dose in 2 Gy fractions)' ? 'solid' : 'outline'}
                        colorScheme={field.value === 'EQD2 (Equivalent Dose in 2 Gy fractions)' ? 'blue' : 'gray'}
                        color={field.value === 'EQD2 (Equivalent Dose in 2 Gy fractions)' ? 'white' : 'gray.300'}
                        onClick={() => field.onChange('EQD2 (Equivalent Dose in 2 Gy fractions)')}
                        _hover={{
                          bg: field.value === 'EQD2 (Equivalent Dose in 2 Gy fractions)' ? 'blue.600' : 'gray.700',
                          borderColor: field.value === 'EQD2 (Equivalent Dose in 2 Gy fractions)' ? 'blue.300' : 'gray.500'
                        }}
                      >
                        EQD2
                      </Button>
                    </HStack>
                  )}
                />
                <FormErrorMessage sx={{ color: 'red.300' }}>
                  {errors.prior_dose_data?.dose_calc_method?.message}
                </FormErrorMessage>
              </FormControl>

              {/* EQD2 Recommendation Alert - Shows when fractionation regimes differ between treatments */}
              {fractionationMismatch && watchDoseCalcMethod === 'Raw Dose' && (
                <Alert 
                  status="warning" 
                  variant="left-accent" 
                  bg="orange.900" 
                  borderColor="orange.400"
                  borderRadius="md"
                  py={2}
                  px={3}
                >
                  <AlertIcon color="orange.300" boxSize={4} />
                  <Box>
                    <Text fontWeight="bold" color="orange.200" fontSize="xs" mb={1}>
                      Different Fractionation Regimes
                    </Text>
                    <AlertDescription color="gray.300" fontSize="xs">
                      Raw dose constraints are regime-specific. Select EQD2 to enable constraint suggestions.
                      <Text mt={1} fontSize="2xs" color="gray.400">
                        {fractionationMismatch.treatments.map(t => 
                          `${t.label}: ${getRegimeLabel(t.regime)}`
                        ).join(' · ')}
                      </Text>
                    </AlertDescription>
                  </Box>
                </Alert>
              )}
            </GridItem>
          </Grid>

          {/* Prior Treatments Section - Full Width Accordion */}
          <Box
            p={4}
            borderWidth="1px"
            borderRadius="md"
            bg={formBg}
            borderColor={borderColor}
            boxShadow="sm"
            mb={6}
          >
            <Flex justify="space-between" align="center" mb={4}>
              <Heading size="sm" color="white">
                Prior Treatments ({fields.length})
              </Heading>
              <Button
                leftIcon={<AddIcon />}
                colorScheme="green"
                size="sm"
                onClick={addPriorTreatment}
              >
                Add Treatment
              </Button>
            </Flex>

            <Accordion allowMultiple index={expandedIndices} onChange={setExpandedIndices}>
              {fields.map((field, index) => (
                <AccordionItem key={field.id} border="1px" borderColor="gray.600" borderRadius="md" mb={4}>
                  <AccordionButton bg="gray.700" _hover={{ bg: 'gray.650' }}>
                    <Box flex="1" textAlign="left">
                      <Text color="white" fontWeight="bold">
                        Prior Treatment {index + 1}
                        {watchPriorTreatments?.[index]?.site && (
                          <Badge ml={2} colorScheme="purple">
                            {watchPriorTreatments[index].site}
                          </Badge>
                        )}
                        {watchPriorTreatments?.[index]?.dose && (
                          <Badge ml={2} colorScheme="blue">
                            {watchPriorTreatments[index].dose} Gy / {watchPriorTreatments[index].fractions} fx
                          </Badge>
                        )}
                      </Text>
                    </Box>
                    <AccordionIcon color="white" />
                  </AccordionButton>

                  <AccordionPanel pb={4} bg="gray.750">
                    <Grid templateColumns={{ base: '1fr', md: '1fr 1fr' }} gap={4}>
                      {/* Left Column */}
                      <Box>
                        {!watchPriorTreatments?.[index]?.custom_site ? (
                          <FormControl isInvalid={errors.prior_dose_data?.prior_treatments?.[index]?.site} mb={3}>
                            <FormLabel fontSize="sm" color="gray.300">Treatment Site</FormLabel>
                            <Select
                              size="sm"
                              {...register(`prior_dose_data.prior_treatments.${index}.site`, { 
                                required: !watchPriorTreatments?.[index]?.custom_site ? 'Site is required' : false 
                              })}
                              bg="gray.700"
                              borderColor="gray.600"
                              color="white"
                              _hover={{ borderColor: 'gray.500' }}
                              data-theme="dark"
                              aria-label="Treatment site"
                              sx={{ '& option': { backgroundColor: 'gray.700', color: 'white' }}}
                            >
                              <option value="" style={{ backgroundColor: '#2D3748', color: '#A0AEC0' }}></option>
                              {treatmentSites.map((site) => (
                                <option key={site} value={site} style={{ backgroundColor: '#2D3748', color: 'white' }}>
                                  {site}
                                </option>
                              ))}
                            </Select>
                            <FormErrorMessage fontSize="xs" sx={{ color: 'red.300' }}>
                              {errors.prior_dose_data?.prior_treatments?.[index]?.site?.message}
                            </FormErrorMessage>
                          </FormControl>
                        ) : (
                          <FormControl isInvalid={errors.prior_dose_data?.prior_treatments?.[index]?.custom_site} mb={3}>
                            <FormLabel fontSize="sm" color="gray.300">Custom Treatment Site Name</FormLabel>
                            <Input
                              size="sm"
                              {...register(`prior_dose_data.prior_treatments.${index}.custom_site`, {
                                required: watchPriorTreatments?.[index]?.custom_site ? 'Custom site name is required' : false
                              })}
                              placeholder="Enter custom site"
                              bg="gray.700"
                              borderColor="gray.600"
                              color="white"
                              _hover={{ borderColor: 'gray.500' }}
                              _placeholder={{ color: 'gray.400' }}
                            />
                            <FormErrorMessage fontSize="xs" sx={{ color: 'red.300' }}>
                              {errors.prior_dose_data?.prior_treatments?.[index]?.custom_site?.message}
                            </FormErrorMessage>
                          </FormControl>
                        )}
                        
                        <Checkbox
                          {...register(`prior_dose_data.prior_treatments.${index}.custom_site`)}
                          isChecked={!!watchPriorTreatments?.[index]?.custom_site}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setValue(`prior_dose_data.prior_treatments.${index}.custom_site`, 'custom');
                              setValue(`prior_dose_data.prior_treatments.${index}.site`, '');
                            } else {
                              setValue(`prior_dose_data.prior_treatments.${index}.custom_site`, '');
                            }
                          }}
                          mb={3}
                          colorScheme="blue"
                        >
                          <Text fontSize="sm" color="gray.300">Custom Site?</Text>
                        </Checkbox>

                        <FormControl mb={3}>
                          <Checkbox
                            {...register(`prior_dose_data.prior_treatments.${index}.has_overlap`)}
                            colorScheme="orange"
                            size="md"
                          >
                            <Text color="gray.300" fontSize="sm" fontWeight="medium">
                              Overlap with current?
                            </Text>
                          </Checkbox>
                        </FormControl>

                        <FormControl>
                          <Checkbox
                            {...register(`prior_dose_data.prior_treatments.${index}.dicoms_unavailable`)}
                            colorScheme="red"
                            size="md"
                          >
                            <Text color="gray.300" fontSize="sm" fontWeight="medium">
                              Dicoms unavailable?
                            </Text>
                          </Checkbox>
                        </FormControl>
                      </Box>

                      {/* Right Column */}
                      <Box>
                        <Grid templateColumns="repeat(2, 1fr)" gap={2} mb={3}>
                          <FormControl isInvalid={errors.prior_dose_data?.prior_treatments?.[index]?.dose}>
                            <FormLabel fontSize="sm" color="gray.300">Dose (Gy)</FormLabel>
                            <Input
                              size="sm"
                              type="number"
                              step="0.1"
                              {...register(`prior_dose_data.prior_treatments.${index}.dose`, {
                                required: 'Dose is required',
                                min: { value: 0.1, message: 'Dose must be positive' }
                              })}
                              placeholder="Enter dose"
                              bg="gray.700"
                              borderColor="gray.600"
                              color="white"
                              _hover={{ borderColor: 'gray.500' }}
                              _placeholder={{ color: 'gray.400' }}
                            />
                            <FormErrorMessage fontSize="xs" sx={{ color: 'red.300' }}>
                              {errors.prior_dose_data?.prior_treatments?.[index]?.dose?.message}
                            </FormErrorMessage>
                          </FormControl>

                          <FormControl isInvalid={errors.prior_dose_data?.prior_treatments?.[index]?.fractions}>
                            <FormLabel fontSize="sm" color="gray.300">Fractions</FormLabel>
                            <Input
                              size="sm"
                              type="number"
                              {...register(`prior_dose_data.prior_treatments.${index}.fractions`, {
                                required: 'Fractions is required',
                                min: { value: 1, message: 'Fractions must be at least 1' }
                              })}
                              placeholder="Enter fractions"
                              bg="gray.700"
                              borderColor="gray.600"
                              color="white"
                              _hover={{ borderColor: 'gray.500' }}
                              _placeholder={{ color: 'gray.400' }}
                            />
                            <FormErrorMessage fontSize="xs" sx={{ color: 'red.300' }}>
                              {errors.prior_dose_data?.prior_treatments?.[index]?.fractions?.message}
                            </FormErrorMessage>
                          </FormControl>
                        </Grid>

                        <Grid templateColumns="repeat(2, 1fr)" gap={2} mb={3}>
                          <FormControl>
                            <FormLabel fontSize="sm" color="gray.300">Treatment Month</FormLabel>
                            <Select
                              size="sm"
                              {...register(`prior_dose_data.prior_treatments.${index}.month`, {
                                required: 'Treatment month is required'
                              })}
                              bg="gray.700"
                              borderColor="gray.600"
                              color="white"
                              _hover={{ borderColor: 'gray.500' }}
                              data-theme="dark"
                              aria-label="Treatment month"
                              sx={{ '& option': { backgroundColor: 'gray.700', color: 'white' }}}
                            >
                              <option value=""></option>
                              {['January', 'February', 'March', 'April', 'May', 'June', 
                                'July', 'August', 'September', 'October', 'November', 'December'].map((month) => (
                                <option key={month} value={month} style={{ backgroundColor: '#2D3748', color: 'white' }}>
                                  {month}
                                </option>
                              ))}
                            </Select>
                          </FormControl>

                          <FormControl isInvalid={errors.prior_dose_data?.prior_treatments?.[index]?.year}>
                            <FormLabel fontSize="sm" color="gray.300">Treatment Year</FormLabel>
                            <Input
                              size="sm"
                              type="number"
                              {...register(`prior_dose_data.prior_treatments.${index}.year`, {
                                required: 'Treatment year is required',
                                min: { value: 1900, message: 'Year must be valid' },
                                max: { value: new Date().getFullYear(), message: 'Year cannot be in the future' }
                              })}
                              placeholder="Enter year"
                              bg="gray.700"
                              borderColor="gray.600"
                              color="white"
                              _hover={{ borderColor: 'gray.500' }}
                              _placeholder={{ color: 'gray.400' }}
                            />
                            <FormErrorMessage fontSize="xs" sx={{ color: 'red.300' }}>
                              {errors.prior_dose_data?.prior_treatments?.[index]?.year?.message}
                            </FormErrorMessage>
                          </FormControl>
                        </Grid>
                      </Box>
                    </Grid>

                    {/* Delete button */}
                    {fields.length > 1 && (
                      <Flex justify="flex-end" mt={4}>
                        <Button
                          leftIcon={<DeleteIcon />}
                          colorScheme="red"
                          size="sm"
                          variant="outline"
                          onClick={() => remove(index)}
                        >
                          Delete Treatment
                        </Button>
                      </Flex>
                    )}
                  </AccordionPanel>
                </AccordionItem>
              ))}
            </Accordion>
          </Box>

          {/* Dose Statistics Section - Shows only when overlap exists */}
          {/* Critical structures are automatically extracted from filled dose statistics */}
          {/* Constraints are grouped by anatomical region (Brain, Spine, Thorax, etc.) */}
          {hasAnyOverlap && (
            <Box
              p={4}
              borderWidth="1px"
              borderRadius="md"
              bg={formBg}
              borderColor={borderColor}
              boxShadow="sm"
              mb={6}
            >
              <Flex justify="space-between" align="center" mb={3}>
                <Heading size="sm" color="white">Dose Statistics <Text as="span" color="red.300" fontSize="sm">(at least one required)</Text></Heading>
                <IconButton
                  icon={<AddIcon />}
                  aria-label="Add custom constraint"
                  size="sm"
                  colorScheme="green"
                  variant="ghost"
                  onClick={() => appendDoseStat({ 
                    structure: '', 
                    constraint_type: '', 
                    value: '', 
                    source: 'Custom', 
                    unit: 'Gy', 
                    limit: '', 
                    region: 'Custom' 
                  })}
                />
              </Flex>

              {doseStatFields.length === 0 ? (
                <Text color="red.300" fontSize="sm" textAlign="center" py={2}>
                  No constraints added - click + to add (at least one value required)
                </Text>
              ) : (
                (() => {
                  // Group constraints by region
                  const constraintsByRegion = {};
                  doseStatFields.forEach((field, index) => {
                    const watchedStat = watch(`prior_dose_data.dose_statistics.${index}`);
                    const region = watchedStat?.region || 'Other';
                    if (!constraintsByRegion[region]) {
                      constraintsByRegion[region] = [];
                    }
                    constraintsByRegion[region].push({ field, index, watchedStat });
                  });
                  
                  // Define region order and colors
                  const regionOrder = ['CNS', 'Optics & Hearing', 'Head & Neck', 'Thorax', 'Abdomen', 'Pelvis', 'Extremity', 'Custom', 'Other'];
                  const regionColors = {
                    'CNS': 'purple',
                    'Optics & Hearing': 'cyan',
                    'Head & Neck': 'teal',
                    'Thorax': 'orange',
                    'Abdomen': 'yellow',
                    'Pelvis': 'pink',
                    'Extremity': 'green',
                    'Custom': 'blue',
                    'Other': 'gray'
                  };
                  
                  // Common criteria options for custom constraints
                  const criteriaOptions = [
                    { value: 'Dmax', unit: 'Gy' },
                    { value: 'Dmean', unit: 'Gy' },
                    { value: 'D0.03cc', unit: 'Gy' },
                    { value: 'D0.5cc', unit: 'Gy' },
                    { value: 'D1cc', unit: 'Gy' },
                    { value: 'D2cc', unit: 'Gy' },
                    { value: 'V5', unit: '%' },
                    { value: 'V10', unit: '%' },
                    { value: 'V12', unit: 'cc' },
                    { value: 'V15', unit: '%' },
                    { value: 'V20', unit: '%' },
                    { value: 'V25', unit: '%' },
                    { value: 'V30', unit: '%' },
                    { value: 'V40', unit: '%' },
                    { value: 'V50', unit: '%' },
                    { value: 'V60', unit: '%' },
                    { value: 'V70', unit: '%' },
                  ];
                  
                  // Helper to derive unit from criteria
                  const getUnitFromCriteria = (criteria) => {
                    if (!criteria) return 'Gy';
                    const found = criteriaOptions.find(c => c.value === criteria);
                    if (found) return found.unit;
                    // Derive from pattern
                    if (criteria.startsWith('D') && criteria.includes('cc')) return 'Gy';
                    if (criteria.startsWith('D')) return 'Gy';
                    if (criteria.startsWith('V') && criteria.includes('cc')) return 'cc';
                    if (criteria.startsWith('V')) return '%';
                    return 'Gy';
                  };
                  
                  // Get regions that have constraints, in order
                  const activeRegions = regionOrder.filter(r => constraintsByRegion[r] && constraintsByRegion[r].length > 0);
                  
                  return (
                    <Grid 
                      templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }} 
                      gap={4}
                    >
                      {activeRegions.map((region) => (
                        <Box
                          key={region}
                          borderWidth="1px"
                          borderRadius="md"
                          borderColor="gray.600"
                          overflow="hidden"
                        >
                          {/* Region Header */}
                          <Box 
                            bg={`${regionColors[region]}.800`} 
                            px={3} 
                            py={2}
                          >
                            <Text color="white" fontWeight="bold" fontSize="sm">
                              {region}
                              <Badge ml={2} colorScheme={regionColors[region]} variant="subtle">
                                {constraintsByRegion[region].length}
                              </Badge>
                            </Text>
                          </Box>
                          
                          {/* Constraints List */}
                          <VStack spacing={2} p={2} bg="gray.750" align="stretch">
                            {constraintsByRegion[region].map(({ field, index, watchedStat }) => {
                              const limit = watchedStat?.limit || '';
                              const unit = watchedStat?.unit || '';
                              const constraintType = watchedStat?.constraint_type || '';
                              const isCustom = watchedStat?.source === 'Custom';
                              
                              return (
                                <Box 
                                  key={field.id} 
                                  p={2}
                                  bg="gray.700"
                                  borderRadius="md"
                                  borderWidth="1px"
                                  borderColor={isCustom ? "blue.500" : "gray.600"}
                                >
                                  {isCustom ? (
                                    // Custom constraint - editable structure and criteria
                                    <>
                                      <Grid templateColumns="1fr 1fr" gap={1} mb={2}>
                                        <Input
                                          size="xs"
                                          {...register(`prior_dose_data.dose_statistics.${index}.structure`)}
                                          placeholder="Structure/OAR"
                                          bg="gray.600"
                                          borderColor="gray.500"
                                          color="white"
                                          _hover={{ borderColor: 'gray.400' }}
                                          _placeholder={{ color: 'gray.400' }}
                                        />
                                        <Select
                                          size="xs"
                                          {...register(`prior_dose_data.dose_statistics.${index}.constraint_type`)}
                                          bg="gray.600"
                                          borderColor="gray.500"
                                          color="white"
                                          _hover={{ borderColor: 'gray.400' }}
                                          onChange={(e) => {
                                            const newUnit = getUnitFromCriteria(e.target.value);
                                            setValue(`prior_dose_data.dose_statistics.${index}.unit`, newUnit);
                                          }}
                                        >
                                          <option value="" style={{ backgroundColor: '#2D3748', color: '#A0AEC0' }}>Criteria</option>
                                          {criteriaOptions.map(opt => (
                                            <option key={opt.value} value={opt.value} style={{ backgroundColor: '#2D3748', color: 'white' }}>
                                              {opt.value}
                                            </option>
                                          ))}
                                        </Select>
                                      </Grid>
                                      <HStack spacing={1}>
                                        <Input
                                          size="xs"
                                          type="number"
                                          step="any"
                                          {...register(`prior_dose_data.dose_statistics.${index}.value`)}
                                          placeholder="Value"
                                          bg="gray.600"
                                          borderColor="gray.500"
                                          color="white"
                                          _hover={{ borderColor: 'gray.400' }}
                                          _placeholder={{ color: 'gray.400' }}
                                          flex="1"
                                        />
                                        <Text color="gray.400" fontSize="xs" w="24px" textAlign="center">
                                          {watchedStat?.unit || 'Gy'}
                                        </Text>
                                      </HStack>
                                    </>
                                  ) : (
                                    // Standard constraint - read-only structure and criteria
                                    <>
                                      <Text color="gray.300" fontSize="xs" mb={1} noOfLines={1}>
                                        {watchedStat?.structure || 'Structure'}{constraintType ? ` ${constraintType}` : ''}
                                      </Text>
                                      <HStack spacing={1}>
                                        <Input
                                          size="xs"
                                          {...register(`prior_dose_data.dose_statistics.${index}.value`)}
                                          placeholder={limit || 'Value'}
                                          bg="gray.600"
                                          borderColor="gray.500"
                                          color="white"
                                          _hover={{ borderColor: 'gray.400' }}
                                          _placeholder={{ color: 'gray.400' }}
                                          flex="1"
                                        />
                                        <Text color="gray.400" fontSize="xs" w="24px" textAlign="center">
                                          {unit}
                                        </Text>
                                      </HStack>
                                    </>
                                  )}
                                  {/* Hidden fields for non-editable data */}
                                  {!isCustom && <input type="hidden" {...register(`prior_dose_data.dose_statistics.${index}.structure`)} />}
                                  {!isCustom && <input type="hidden" {...register(`prior_dose_data.dose_statistics.${index}.constraint_type`)} />}
                                  <input type="hidden" {...register(`prior_dose_data.dose_statistics.${index}.source`)} />
                                  <input type="hidden" {...register(`prior_dose_data.dose_statistics.${index}.unit`)} />
                                  <input type="hidden" {...register(`prior_dose_data.dose_statistics.${index}.limit`)} />
                                  <input type="hidden" {...register(`prior_dose_data.dose_statistics.${index}.region`)} />
                                </Box>
                              );
                            })}
                          </VStack>
                        </Box>
                      ))}
                    </Grid>
                  );
                })()
              )}
            </Box>
          )}

          {/* Action Buttons */}
          <Flex gap={4} mb={6}>
            <Button 
              type="submit" 
              colorScheme="green" 
              isLoading={loading}
              loadingText="Generating..."
              isDisabled={fields.length === 0}
              width="100%"
              size="md"
              shadow="md"
            >
              Generate Write-up
            </Button>
            <Button 
              size="md"
              variant="outline" 
              colorScheme="red"
              color="red.300"
              borderColor="red.600"
              _hover={{ bg: "red.800", borderColor: "red.400" }}
              onClick={() => {
                window.location.reload();
              }}
              width="auto"
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
              bg="gray.800"
              borderColor={borderColor}
              boxShadow="md"
            >
              <Flex justify="space-between" align="center" mb={3}>
                <Heading size="sm" color="white">Generated Write-up</Heading>
                <Button
                  size="sm"
                  colorScheme="green"
                  onClick={copyToClipboard}
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

export default PriorDoseForm;