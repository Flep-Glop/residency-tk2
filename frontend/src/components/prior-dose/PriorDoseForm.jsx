import React, { useState, useEffect, useMemo } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
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
  Alert,
  AlertIcon,
  AlertDescription,
} from '@chakra-ui/react';
import { AddIcon, DeleteIcon } from '@chakra-ui/icons';
import { getTreatmentSites, getDoseCalcMethods, generatePriorDoseWriteup, getSuggestedConstraints } from '../../services/priorDoseService';

const PriorDoseForm = () => {
  const [treatmentSites, setTreatmentSites] = useState([]);
  const [doseCalcMethods, setDoseCalcMethods] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [writeup, setWriteup] = useState('');
  const [isCustomCurrentSite, setIsCustomCurrentSite] = useState(false);
  const [showConstraintError, setShowConstraintError] = useState(false);
  const toast = useToast();
  
  // SRS-style state for grid interaction
  const [pendingPriorOverlap, setPendingPriorOverlap] = useState(null); // null, true, or false
  const [editingDicomIndex, setEditingDicomIndex] = useState(null); // index of prior being edited for DICOM status
  
  // Hard-coded lists following fusion pattern
  const [physicians] = useState(['Dalwadi', 'Galvan', 'Ha', 'Kluwe', 'Le', 'Lewis', 'Tuli']);
  const [physicists] = useState(['Bassiri', 'Kirby', 'Papanikolaou', 'Paschal', 'Rasmussen']);
  
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
        prior_treatments: [],
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
  const { fields: doseStatFields, append: appendDoseStat } = useFieldArray({
    control,
    name: 'prior_dose_data.dose_statistics'
  });
  
  // Watch values
  const watchPriorTreatments = watch('prior_dose_data.prior_treatments');
  const watchCurrentSite = watch('prior_dose_data.current_site');
  const watchCustomCurrentSite = watch('prior_dose_data.custom_current_site');
  const watchCurrentDose = watch('prior_dose_data.current_dose');
  const watchCurrentFractions = watch('prior_dose_data.current_fractions');
  const watchDoseCalcMethod = watch('prior_dose_data.dose_calc_method');
  
  const priorTreatmentsString = JSON.stringify(watchPriorTreatments);
  const hasAnyOverlap = watchPriorTreatments?.some(t => t?.has_overlap) || false;

  // Add prior treatment with preset overlap status
  const addPriorWithOverlap = (hasOverlap, dicomsUnavailable) => {
    append({
      site: '',
      custom_site: '',
      dose: '',
      fractions: '',
      month: '',
      year: '',
      spine_location: '',
      has_overlap: hasOverlap,
      dicoms_unavailable: dicomsUnavailable
    });
    setPendingPriorOverlap(null);
  };

  // Update existing prior's overlap status
  const updatePriorOverlap = (index, hasOverlap) => {
    setValue(`prior_dose_data.prior_treatments.${index}.has_overlap`, hasOverlap);
  };

  // Update existing prior's DICOM status
  const updatePriorDicom = (index, dicomsUnavailable) => {
    setValue(`prior_dose_data.prior_treatments.${index}.dicoms_unavailable`, dicomsUnavailable);
    setEditingDicomIndex(null);
  };

  // Format prior treatment display
  const formatPriorDisplay = (prior) => {
    if (!prior?.dose) return null;
    return `${prior.dose}/${prior.fractions}`;
  };

  // Get DICOM badge info
  const getDicomBadge = (prior) => {
    if (prior?.dicoms_unavailable) {
      return { label: 'No DICOMs', color: 'red' };
    }
    return { label: 'DICOMs ✓', color: 'green' };
  };

  /**
   * Detect fractionation regime based on dose and fractions.
   */
  const detectFractionationRegime = (dose, fractions) => {
    if (fractions <= 0) return 'CONVENTIONAL';
    const dosePerFraction = dose / fractions;
    if (fractions === 1) return 'SRS';
    if (dosePerFraction >= 5 && fractions <= 8) {
      if (fractions <= 3) return 'SBRT_3fx';
      return 'SBRT_5fx';
    }
    if (dosePerFraction >= 2.5 && dosePerFraction < 5) return 'MODERATE_HYPOFX';
    return 'CONVENTIONAL';
  };
  
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
  
  const fractionationMismatch = useMemo(() => {
    const currentDose = parseFloat(watchCurrentDose);
    const currentFx = parseInt(watchCurrentFractions);
    if (!currentDose || !currentFx || currentFx <= 0) return null;
    
    const currentRegime = detectFractionationRegime(currentDose, currentFx);
    const currentDpf = currentDose / currentFx;
    const treatments = [{ 
      label: 'Current', 
      regime: currentRegime,
      dpf: currentDpf,
      fractions: currentFx
    }];
    
    (watchPriorTreatments || []).forEach((treatment, index) => {
      if (!treatment?.has_overlap) return;
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
    
    if (treatments.length < 2) return null;
    const firstRegime = treatments[0].regime;
    const hasMismatch = treatments.some(t => t.regime !== firstRegime);
    if (!hasMismatch) return null;
    
    return {
      treatments: treatments,
      message: 'Different fractionation regimes detected.'
    };
  }, [watchCurrentDose, watchCurrentFractions, priorTreatmentsString]);
  
  // Constraints depend only on current site (not prior sites) since we're evaluating
  // OARs in the current treatment region. Prior treatment info is used for dose summation,
  // but constraints are site-specific to where we're treating now.
  const sitesKey = useMemo(() => {
    const currentSite = isCustomCurrentSite ? watchCustomCurrentSite : watchCurrentSite;
    
    return JSON.stringify([
      currentSite, 
      watchCurrentDose,
      watchCurrentFractions,
      watchDoseCalcMethod
    ]);
  }, [watchCurrentSite, watchCustomCurrentSite, isCustomCurrentSite, watchCurrentDose, watchCurrentFractions, watchDoseCalcMethod]);

  // Auto-populate dose statistics when overlap is detected
  // Constraints are based ONLY on current treatment site - we're evaluating OARs
  // in the current treatment region. Prior sites don't affect constraint selection.
  useEffect(() => {
    const loadSuggestedConstraints = async () => {
      if (!hasAnyOverlap) {
        setValue('prior_dose_data.dose_statistics', []);
        return;
      }
      
      const currentSite = isCustomCurrentSite 
        ? watchCustomCurrentSite
        : watchCurrentSite;
      
      if (!currentSite) return;
      
      try {
        const currentDose = getValues('prior_dose_data.current_dose');
        const currentFractions = getValues('prior_dose_data.current_fractions');
        const doseCalcMethod = getValues('prior_dose_data.dose_calc_method');
        
        // Only fetch constraints for current site - OARs at risk are determined
        // by where we're treating now, not where prior treatments were
        const constraints = await getSuggestedConstraints([currentSite], {
          doseCalcMethod,
          currentDose: currentDose ? parseFloat(currentDose) : undefined,
          currentFractions: currentFractions ? parseInt(currentFractions) : undefined
        });
        
        const currentStats = getValues('prior_dose_data.dose_statistics') || [];
        const existingValues = new Map();
        for (const stat of currentStats) {
          const key = `${stat.structure}_${stat.constraint_type}`;
          if (stat.value && stat.value.trim() !== '') {
            existingValues.set(key, stat.value);
          }
        }
        
        const formattedConstraints = constraints.map(constraint => {
          const key = `${constraint.structure}_${constraint.constraint}`;
          return {
            structure: constraint.structure,
            constraint_type: constraint.constraint,
            value: existingValues.get(key) || '',
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
        console.log('Could not fetch constraints for site:', currentSite);
      }
    };
    
    loadSuggestedConstraints();
  }, [sitesKey, hasAnyOverlap, setValue, getValues, watchCurrentSite, watchCustomCurrentSite, isCustomCurrentSite, watchDoseCalcMethod]);

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
  
  const onSubmit = async (data) => {
    const anyOverlap = data.prior_dose_data.prior_treatments?.some(t => t.has_overlap);
    const filledStats = (data.prior_dose_data.dose_statistics || []).filter(
      stat => stat.value && stat.value.trim() !== ''
    );
    
    if (anyOverlap && filledStats.length === 0) {
      setShowConstraintError(true);
      toast({
        title: 'Dose statistics required',
        description: 'When overlap exists, at least one dose statistic must have a value filled in.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }
    
    // Clear error if validation passes
    setShowConstraintError(false);
    
    setLoading(true);
    try {
      const criticalStructures = [...new Set(
        filledStats.map(stat => stat.structure).filter(s => s && s.length > 0)
      )];
      
      const filteredData = {
        ...data,
        prior_dose_data: {
          ...data.prior_dose_data,
          critical_structures: criticalStructures,
          dose_statistics: filledStats
        }
      };
      
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

  // Months for dropdown
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 
    'July', 'August', 'September', 'October', 'November', 'December'];

  // Criteria options for custom constraints
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

  const getUnitFromCriteria = (criteria) => {
    if (!criteria) return 'Gy';
    const found = criteriaOptions.find(c => c.value === criteria);
    if (found) return found.unit;
    if (criteria.startsWith('D') && criteria.includes('cc')) return 'Gy';
    if (criteria.startsWith('D')) return 'Gy';
    if (criteria.startsWith('V') && criteria.includes('cc')) return 'cc';
    if (criteria.startsWith('V')) return '%';
    return 'Gy';
  };

  return (
    <Box bg="gray.900" minH="100vh">
      {/* Header */}
      <Box bg="blue.900" color="white" p={6} mb={6} borderRadius="lg" border="1px" borderColor="blue.700">
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
            {/* Three Column Layout - Staff Info (1 col) + Treatment Selection (2 cols) */}
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
                
                <FormControl isInvalid={errors.common_info?.physicist?.name}>
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
                  <FormErrorMessage sx={{ color: 'red.300' }}>
                    {errors.common_info?.physician?.name?.message}
                  </FormErrorMessage>
                </FormControl>
              </GridItem>

              {/* Treatment Selection - Spans 2 columns */}
              <GridItem
                colSpan={{ base: 1, lg: 2 }}
                p={4}
                borderWidth="1px"
                borderRadius="md"
                bg={formBg}
                borderColor={borderColor}
                boxShadow="sm"
              >
                <Heading size="sm" mb={3} textAlign="center" color="white">Treatment Selection</Heading>

                {/* Current Treatment - Full Width Row */}
                <Box
                  bg="gray.750"
                  p={3}
                  borderRadius="md"
                  borderWidth="2px"
                  borderColor="gray.600"
                  mb={3}
                >
                  <Flex justify="space-between" align="center" mb={2}>
                    <Text fontSize="sm" fontWeight="bold" color="gray.200">CURRENT TREATMENT</Text>
                    <Checkbox
                      isChecked={isCustomCurrentSite}
                      onChange={handleCustomCurrentSiteChange}
                      colorScheme="blue"
                      size="sm"
                    >
                      <Text fontSize="xs" color="gray.300">Custom Site</Text>
                    </Checkbox>
                  </Flex>
                  
                  <Grid templateColumns={{ base: "1fr", md: "2fr 1fr 1fr 2fr" }} gap={2} alignItems="end">
                    {/* Site */}
                    {!isCustomCurrentSite ? (
                      <FormControl isInvalid={errors.prior_dose_data?.current_site}>
                        <FormLabel fontSize="xs" color="gray.300" mb={1}>Site</FormLabel>
                        <Select 
                          size="sm"
                          {...register('prior_dose_data.current_site', { 
                            required: !isCustomCurrentSite ? 'Site required' : false 
                          })}
                          bg="gray.700"
                          borderColor="gray.600"
                          color="white"
                          _hover={{ borderColor: "gray.500" }}
                          sx={{ '& option': { backgroundColor: 'gray.700', color: 'white' }}}
                        >
                          <option value="" style={{ backgroundColor: '#2D3748', color: '#A0AEC0' }}></option>
                          {treatmentSites.map(site => (
                            <option key={site} value={site} style={{ backgroundColor: '#2D3748', color: 'white' }}>{site}</option>
                          ))}
                        </Select>
                      </FormControl>
                    ) : (
                      <FormControl isInvalid={errors.prior_dose_data?.custom_current_site}>
                        <FormLabel fontSize="xs" color="gray.300" mb={1}>Custom Site</FormLabel>
                        <Input
                          size="sm"
                          {...register('prior_dose_data.custom_current_site', {
                            required: isCustomCurrentSite ? 'Site required' : false
                          })}
                          placeholder="e.g., Left Lung"
                          bg="gray.700"
                          borderColor="gray.600"
                          color="white"
                          _hover={{ borderColor: "gray.500" }}
                          _placeholder={{ color: "gray.400" }}
                        />
                      </FormControl>
                    )}
                    
                    {/* Dose */}
                    <FormControl isInvalid={errors.prior_dose_data?.current_dose}>
                      <FormLabel fontSize="xs" color="gray.300" mb={1}>Dose (Gy)</FormLabel>
                      <Input 
                        size="sm"
                        type="number"
                        step="any"
                        {...register('prior_dose_data.current_dose', { 
                          required: 'Required',
                          min: { value: 0.1, message: 'Must be positive' }
                        })}
                        placeholder="50"
                        bg="gray.700"
                        borderColor="gray.600"
                        color="white"
                        _hover={{ borderColor: "gray.500" }}
                        _placeholder={{ color: "gray.400" }}
                      />
                    </FormControl>
                    
                    {/* Fractions */}
                    <FormControl isInvalid={errors.prior_dose_data?.current_fractions}>
                      <FormLabel fontSize="xs" color="gray.300" mb={1}>Fx</FormLabel>
                      <Input 
                        size="sm"
                        type="number"
                        {...register('prior_dose_data.current_fractions', { 
                          required: 'Required',
                          min: { value: 1, message: 'Min 1' }
                        })}
                        placeholder="25"
                        bg="gray.700"
                        borderColor="gray.600"
                        color="white"
                        _hover={{ borderColor: "gray.500" }}
                        _placeholder={{ color: "gray.400" }}
                      />
                    </FormControl>

                    {/* Dose Calc Method */}
                    <FormControl isInvalid={errors.prior_dose_data?.dose_calc_method}>
                      <FormLabel fontSize="xs" color="gray.300" mb={1}>Dose Calc</FormLabel>
                      <Controller
                        name="prior_dose_data.dose_calc_method"
                        control={control}
                        rules={{ required: 'Required' }}
                        render={({ field }) => (
                          <HStack spacing={1}>
                            <Button
                              size="sm"
                              flex="1"
                              variant={field.value === 'Raw Dose' ? 'solid' : 'outline'}
                              colorScheme={field.value === 'Raw Dose' ? 'blue' : 'gray'}
                              color={field.value === 'Raw Dose' ? 'white' : 'gray.300'}
                              borderColor="gray.600"
                              onClick={() => field.onChange('Raw Dose')}
                              _hover={{ bg: field.value === 'Raw Dose' ? 'blue.600' : 'gray.700' }}
                            >
                              Raw
                            </Button>
                            <Button
                              size="sm"
                              flex="1"
                              variant={field.value === 'EQD2 (Equivalent Dose in 2 Gy fractions)' ? 'solid' : 'outline'}
                              colorScheme={field.value === 'EQD2 (Equivalent Dose in 2 Gy fractions)' ? 'blue' : 'gray'}
                              color={field.value === 'EQD2 (Equivalent Dose in 2 Gy fractions)' ? 'white' : 'gray.300'}
                              borderColor="gray.600"
                              onClick={() => field.onChange('EQD2 (Equivalent Dose in 2 Gy fractions)')}
                              _hover={{ bg: field.value === 'EQD2 (Equivalent Dose in 2 Gy fractions)' ? 'blue.600' : 'gray.700' }}
                            >
                              EQD2
                            </Button>
                          </HStack>
                        )}
                      />
                    </FormControl>
                  </Grid>

                  {/* Fractionation Warning */}
                  {fractionationMismatch && watchDoseCalcMethod === 'Raw Dose' && (
                    <Alert 
                      status="warning" 
                      variant="left-accent" 
                      bg="gray.700" 
                      borderColor="yellow.600"
                      borderRadius="md"
                      py={1}
                      px={2}
                      mt={2}
                    >
                      <AlertIcon color="yellow.400" boxSize={3} />
                      <AlertDescription color="gray.300" fontSize="xs">
                        Different regimes detected. Use EQD2 for cross-regime constraints.
                      </AlertDescription>
                    </Alert>
                  )}
                </Box>

                {/* Prior Treatments Grid - Two Columns */}
                <Grid templateColumns="1fr 1fr" gap={2} mb={2}>
                  <Box 
                    bg="gray.700" 
                    p={2} 
                    borderRadius="md" 
                    textAlign="center"
                  >
                    <Text fontSize="sm" color="white" fontWeight="bold">OVERLAP</Text>
                  </Box>
                  <Box 
                    bg="gray.700" 
                    p={2} 
                    borderRadius="md" 
                    textAlign="center"
                  >
                    <Text fontSize="sm" color="white" fontWeight="bold">NO OVERLAP</Text>
                  </Box>
                </Grid>

                {/* Prior Treatment Rows */}
                {fields.map((field, index) => (
                  <Grid key={field.id} templateColumns="1fr 1fr" gap={2} mb={2}>
                    {/* OVERLAP Cell */}
                    <Box
                      bg={watchPriorTreatments[index]?.has_overlap ? 'gray.750' : 'gray.800'}
                      p={2}
                      borderRadius="md"
                      borderWidth="2px"
                      borderColor={watchPriorTreatments[index]?.has_overlap ? 'blue.500' : 'transparent'}
                      cursor={watchPriorTreatments[index]?.has_overlap ? 'default' : 'pointer'}
                      onClick={() => {
                        if (!watchPriorTreatments[index]?.has_overlap) {
                          updatePriorOverlap(index, true);
                        }
                      }}
                      _hover={!watchPriorTreatments[index]?.has_overlap ? { borderColor: 'blue.400' } : {}}
                      transition="all 0.2s"
                      minH="100px"
                    >
                      {watchPriorTreatments[index]?.has_overlap ? (
                        <Flex direction="column" gap={1}>
                          {/* Header Row - DICOM Badge, Rx Badge, Delete */}
                          {editingDicomIndex === index ? (
                            <Flex wrap="wrap" gap={1} justify="center">
                              <Button
                                size="xs"
                                colorScheme="green"
                                variant={!watchPriorTreatments[index]?.dicoms_unavailable ? 'solid' : 'outline'}
                                onClick={(e) => { e.stopPropagation(); updatePriorDicom(index, false); }}
                              >
                                DICOMs ✓
                              </Button>
                              <Button
                                size="xs"
                                colorScheme="red"
                                variant={watchPriorTreatments[index]?.dicoms_unavailable ? 'solid' : 'outline'}
                                onClick={(e) => { e.stopPropagation(); updatePriorDicom(index, true); }}
                              >
                                No DICOMs
                              </Button>
                              <Button
                                size="xs"
                                variant="ghost"
                                color="gray.400"
                                onClick={(e) => { e.stopPropagation(); setEditingDicomIndex(null); }}
                              >
                                ✕
                              </Button>
                            </Flex>
                          ) : (
                            <Flex justify="space-between" align="center">
                              <Badge 
                                colorScheme={getDicomBadge(watchPriorTreatments[index]).color}
                                cursor="pointer"
                                onClick={(e) => { e.stopPropagation(); setEditingDicomIndex(index); }}
                                _hover={{ opacity: 0.8 }}
                                fontSize="2xs"
                              >
                                {getDicomBadge(watchPriorTreatments[index]).label}
                              </Badge>
                              {formatPriorDisplay(watchPriorTreatments[index]) && (
                                <Badge colorScheme="blue" fontSize="2xs">
                                  {formatPriorDisplay(watchPriorTreatments[index])}
                                </Badge>
                              )}
                              <IconButton
                                icon={<DeleteIcon />}
                                size="xs"
                                colorScheme="red"
                                variant="ghost"
                                onClick={(e) => { e.stopPropagation(); remove(index); }}
                                aria-label="Delete"
                              />
                            </Flex>
                          )}
                          
                          {/* Site + Dose/Fx Row */}
                          <Grid templateColumns="1fr 1fr" gap={1}>
                            <Input
                              size="xs"
                              {...register(`prior_dose_data.prior_treatments.${index}.site`)}
                              placeholder="e.g., Brain"
                              bg="gray.700"
                              borderColor="gray.600"
                              color="white"
                              onClick={(e) => e.stopPropagation()}
                              _hover={{ borderColor: 'gray.500' }}
                              _placeholder={{ color: 'gray.400' }}
                            />
                            <Flex gap={1}>
                              <Input
                                size="xs"
                                type="number"
                                {...register(`prior_dose_data.prior_treatments.${index}.dose`)}
                                placeholder="Gy"
                                bg="gray.700"
                                borderColor="gray.600"
                                color="white"
                                onClick={(e) => e.stopPropagation()}
                                _placeholder={{ color: 'gray.400' }}
                                w="50%"
                              />
                              <Input
                                size="xs"
                                type="number"
                                {...register(`prior_dose_data.prior_treatments.${index}.fractions`)}
                                placeholder="Fx"
                                bg="gray.700"
                                borderColor="gray.600"
                                color="white"
                                onClick={(e) => e.stopPropagation()}
                                _placeholder={{ color: 'gray.400' }}
                                w="50%"
                              />
                            </Flex>
                          </Grid>
                          
                          {/* Month/Year Row */}
                          <Grid templateColumns="1fr 1fr" gap={1}>
                            <Controller
                              name={`prior_dose_data.prior_treatments.${index}.month`}
                              control={control}
                              render={({ field }) => (
                                <HStack spacing={0.5}>
                                  <Button
                              size="xs"
                                    flex="1"
                                    variant={field.value === 'early' ? 'solid' : 'outline'}
                                    colorScheme={field.value === 'early' ? 'blue' : 'gray'}
                                    color={field.value === 'early' ? 'white' : 'gray.300'}
                              borderColor="gray.600"
                                    onClick={(e) => { e.stopPropagation(); field.onChange('early'); }}
                                    _hover={{ bg: field.value === 'early' ? 'blue.600' : 'gray.600' }}
                                  >
                                    early
                                  </Button>
                                  <Button
                                    size="xs"
                                    flex="1"
                                    variant={field.value === 'mid' ? 'solid' : 'outline'}
                                    colorScheme={field.value === 'mid' ? 'blue' : 'gray'}
                                    color={field.value === 'mid' ? 'white' : 'gray.300'}
                                    borderColor="gray.600"
                                    onClick={(e) => { e.stopPropagation(); field.onChange('mid'); }}
                                    _hover={{ bg: field.value === 'mid' ? 'blue.600' : 'gray.600' }}
                                  >
                                    mid
                                  </Button>
                                  <Button
                                    size="xs"
                                    flex="1"
                                    variant={field.value === 'late' ? 'solid' : 'outline'}
                                    colorScheme={field.value === 'late' ? 'blue' : 'gray'}
                                    color={field.value === 'late' ? 'white' : 'gray.300'}
                                    borderColor="gray.600"
                                    onClick={(e) => { e.stopPropagation(); field.onChange('late'); }}
                                    _hover={{ bg: field.value === 'late' ? 'blue.600' : 'gray.600' }}
                                  >
                                    late
                                  </Button>
                                </HStack>
                              )}
                            />
                            <Input
                              size="xs"
                              type="number"
                              {...register(`prior_dose_data.prior_treatments.${index}.year`)}
                              placeholder="Year"
                              bg="gray.700"
                              borderColor="gray.600"
                              color="white"
                              onClick={(e) => e.stopPropagation()}
                              _placeholder={{ color: 'gray.400' }}
                            />
                          </Grid>
                        </Flex>
                      ) : (
                        <Flex h="100%" align="center" justify="center">
                          <Text fontSize="xs" color="gray.500" textAlign="center">Click to set overlap</Text>
                        </Flex>
                      )}
                    </Box>
                    
                    {/* NO OVERLAP Cell */}
                    <Box
                      bg={!watchPriorTreatments[index]?.has_overlap ? 'gray.750' : 'gray.800'}
                      p={2}
                      borderRadius="md"
                      borderWidth="2px"
                      borderColor={!watchPriorTreatments[index]?.has_overlap ? 'gray.500' : 'transparent'}
                      cursor={!watchPriorTreatments[index]?.has_overlap ? 'default' : 'pointer'}
                      onClick={() => {
                        if (watchPriorTreatments[index]?.has_overlap) {
                          updatePriorOverlap(index, false);
                        }
                      }}
                      _hover={watchPriorTreatments[index]?.has_overlap ? { borderColor: 'gray.500' } : {}}
                      transition="all 0.2s"
                      minH="100px"
                    >
                      {!watchPriorTreatments[index]?.has_overlap ? (
                        <Flex direction="column" gap={1}>
                          {/* Header Row */}
                          {editingDicomIndex === index ? (
                            <Flex wrap="wrap" gap={1} justify="center">
                              <Button
                                size="xs"
                                colorScheme="green"
                                variant={!watchPriorTreatments[index]?.dicoms_unavailable ? 'solid' : 'outline'}
                                onClick={(e) => { e.stopPropagation(); updatePriorDicom(index, false); }}
                              >
                                DICOMs ✓
                              </Button>
                              <Button
                                size="xs"
                                colorScheme="red"
                                variant={watchPriorTreatments[index]?.dicoms_unavailable ? 'solid' : 'outline'}
                                onClick={(e) => { e.stopPropagation(); updatePriorDicom(index, true); }}
                              >
                                No DICOMs
                              </Button>
                              <Button
                                size="xs"
                                variant="ghost"
                                color="gray.400"
                                onClick={(e) => { e.stopPropagation(); setEditingDicomIndex(null); }}
                              >
                                ✕
                              </Button>
                            </Flex>
                          ) : (
                            <Flex justify="space-between" align="center">
                              <Badge 
                                colorScheme={getDicomBadge(watchPriorTreatments[index]).color}
                                cursor="pointer"
                                onClick={(e) => { e.stopPropagation(); setEditingDicomIndex(index); }}
                                _hover={{ opacity: 0.8 }}
                                fontSize="2xs"
                              >
                                {getDicomBadge(watchPriorTreatments[index]).label}
                              </Badge>
                              {formatPriorDisplay(watchPriorTreatments[index]) && (
                                <Badge colorScheme="gray" fontSize="2xs">
                                  {formatPriorDisplay(watchPriorTreatments[index])}
                                </Badge>
                              )}
                              <IconButton
                                icon={<DeleteIcon />}
                                size="xs"
                                colorScheme="red"
                                variant="ghost"
                                onClick={(e) => { e.stopPropagation(); remove(index); }}
                                aria-label="Delete"
                              />
                            </Flex>
                          )}
                          
                          {/* Site + Dose/Fx Row */}
                          <Grid templateColumns="1fr 1fr" gap={1}>
                            <Input
                              size="xs"
                              {...register(`prior_dose_data.prior_treatments.${index}.site`)}
                              placeholder="e.g., Prostate"
                              bg="gray.600"
                              borderColor="gray.500"
                              color="white"
                              onClick={(e) => e.stopPropagation()}
                              _hover={{ borderColor: 'gray.400' }}
                              _placeholder={{ color: 'gray.400' }}
                            />
                            <Flex gap={1}>
                              <Input
                                size="xs"
                                type="number"
                                {...register(`prior_dose_data.prior_treatments.${index}.dose`)}
                                placeholder="Gy"
                                bg="gray.600"
                                borderColor="gray.500"
                                color="white"
                                onClick={(e) => e.stopPropagation()}
                                _placeholder={{ color: 'gray.400' }}
                                w="50%"
                              />
                              <Input
                                size="xs"
                                type="number"
                                {...register(`prior_dose_data.prior_treatments.${index}.fractions`)}
                                placeholder="Fx"
                                bg="gray.600"
                                borderColor="gray.500"
                                color="white"
                                onClick={(e) => e.stopPropagation()}
                                _placeholder={{ color: 'gray.400' }}
                                w="50%"
                              />
                            </Flex>
                          </Grid>
                          
                          {/* Month/Year Row */}
                          <Grid templateColumns="1fr 1fr" gap={1}>
                            <Controller
                              name={`prior_dose_data.prior_treatments.${index}.month`}
                              control={control}
                              render={({ field }) => (
                                <HStack spacing={0.5}>
                                  <Button
                              size="xs"
                                    flex="1"
                                    variant={field.value === 'early' ? 'solid' : 'outline'}
                                    colorScheme={field.value === 'early' ? 'blue' : 'gray'}
                                    color={field.value === 'early' ? 'white' : 'gray.300'}
                              borderColor="gray.500"
                                    onClick={(e) => { e.stopPropagation(); field.onChange('early'); }}
                                    _hover={{ bg: field.value === 'early' ? 'blue.600' : 'gray.500' }}
                                  >
                                    early
                                  </Button>
                                  <Button
                                    size="xs"
                                    flex="1"
                                    variant={field.value === 'mid' ? 'solid' : 'outline'}
                                    colorScheme={field.value === 'mid' ? 'blue' : 'gray'}
                                    color={field.value === 'mid' ? 'white' : 'gray.300'}
                                    borderColor="gray.500"
                                    onClick={(e) => { e.stopPropagation(); field.onChange('mid'); }}
                                    _hover={{ bg: field.value === 'mid' ? 'blue.600' : 'gray.500' }}
                                  >
                                    mid
                                  </Button>
                                  <Button
                                    size="xs"
                                    flex="1"
                                    variant={field.value === 'late' ? 'solid' : 'outline'}
                                    colorScheme={field.value === 'late' ? 'blue' : 'gray'}
                                    color={field.value === 'late' ? 'white' : 'gray.300'}
                                    borderColor="gray.500"
                                    onClick={(e) => { e.stopPropagation(); field.onChange('late'); }}
                                    _hover={{ bg: field.value === 'late' ? 'blue.600' : 'gray.500' }}
                                  >
                                    late
                                  </Button>
                                </HStack>
                              )}
                            />
                            <Input
                              size="xs"
                              type="number"
                              {...register(`prior_dose_data.prior_treatments.${index}.year`)}
                              placeholder="Year"
                              bg="gray.600"
                              borderColor="gray.500"
                              color="white"
                              onClick={(e) => e.stopPropagation()}
                              _placeholder={{ color: 'gray.400' }}
                            />
                          </Grid>
                        </Flex>
                      ) : (
                        <Flex h="100%" align="center" justify="center">
                          <Text fontSize="xs" color="gray.500" textAlign="center">Click to remove overlap</Text>
                        </Flex>
                      )}
                    </Box>
                  </Grid>
                ))}

                {/* Add Prior Row */}
                <Grid templateColumns="1fr 1fr" gap={2}>
                  {/* Add with OVERLAP */}
                  <Box 
                    bg={pendingPriorOverlap === true ? 'gray.750' : 'gray.800'} 
                    p={2} 
                    borderRadius="md" 
                    borderWidth="2px"
                    borderColor={pendingPriorOverlap === true ? 'blue.500' : 'gray.600'}
                    borderStyle={pendingPriorOverlap === true ? 'solid' : 'dashed'}
                    cursor={pendingPriorOverlap !== null ? 'default' : 'pointer'}
                    _hover={pendingPriorOverlap === null ? { borderColor: 'blue.400', bg: 'gray.700' } : {}}
                    transition="all 0.2s"
                    onClick={() => pendingPriorOverlap === null && setPendingPriorOverlap(true)}
                  >
                    {pendingPriorOverlap === true ? (
                      <Flex wrap="wrap" gap={1} justify="center">
                        <Button
                          size="xs"
                          colorScheme="green"
                          variant="solid"
                          onClick={(e) => { e.stopPropagation(); addPriorWithOverlap(true, false); }}
                        >
                          DICOMs ✓
                        </Button>
                        <Button
                          size="xs"
                          colorScheme="red"
                          variant="solid"
                          onClick={(e) => { e.stopPropagation(); addPriorWithOverlap(true, true); }}
                        >
                          No DICOMs
                        </Button>
                        <Button
                          size="xs"
                          variant="ghost"
                          color="gray.400"
                          onClick={(e) => { e.stopPropagation(); setPendingPriorOverlap(null); }}
                        >
                          ✕
                        </Button>
                      </Flex>
                    ) : (
                      <Text fontSize="xs" color="gray.400" textAlign="center">+ New with Overlap</Text>
                    )}
                  </Box>
                  
                  {/* Add without OVERLAP */}
                  <Box 
                    bg={pendingPriorOverlap === false ? 'gray.750' : 'gray.800'} 
                    p={2} 
                    borderRadius="md" 
                    borderWidth="2px"
                    borderColor={pendingPriorOverlap === false ? 'gray.500' : 'gray.600'}
                    borderStyle={pendingPriorOverlap === false ? 'solid' : 'dashed'}
                    cursor={pendingPriorOverlap !== null ? 'default' : 'pointer'}
                    _hover={pendingPriorOverlap === null ? { borderColor: 'gray.500', bg: 'gray.700' } : {}}
                    transition="all 0.2s"
                    onClick={() => pendingPriorOverlap === null && setPendingPriorOverlap(false)}
                  >
                    {pendingPriorOverlap === false ? (
                      <Flex wrap="wrap" gap={1} justify="center">
                        <Button
                          size="xs"
                          colorScheme="green"
                          variant="solid"
                          onClick={(e) => { e.stopPropagation(); addPriorWithOverlap(false, false); }}
                        >
                          DICOMs ✓
                        </Button>
                        <Button
                          size="xs"
                          colorScheme="red"
                          variant="solid"
                          onClick={(e) => { e.stopPropagation(); addPriorWithOverlap(false, true); }}
                        >
                          No DICOMs
                        </Button>
                        <Button
                          size="xs"
                          variant="ghost"
                          color="gray.400"
                          onClick={(e) => { e.stopPropagation(); setPendingPriorOverlap(null); }}
                        >
                          ✕
                        </Button>
                      </Flex>
                    ) : (
                      <Text fontSize="xs" color="gray.400" textAlign="center">+ New without Overlap</Text>
                    )}
                  </Box>
                </Grid>

                {fields.length === 0 && (
                  <Text fontSize="xs" color="gray.500" mt={2} textAlign="center">
                    Click above to add a prior treatment
                  </Text>
                )}
              </GridItem>
            </Grid>

            {/* Dose Statistics Section - Shows only when overlap exists */}
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
                <Flex justify="space-between" align="center" mb={2}>
                  <Heading size="sm" color="white">Dose Statistics</Heading>
                  <IconButton
                    icon={<AddIcon />}
                    aria-label="Add custom constraint"
                    size="sm"
                    colorScheme="blue"
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
                
                {showConstraintError && (
                  <Text color="red.300" fontSize="sm" mb={3}>
                    At least one dose statistic value is required when overlap exists
                  </Text>
                )}

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
                colorScheme="blue" 
                isLoading={loading}
                loadingText="Generating..."
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
          
          {/* Generated Write-up Section */}
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
                    colorScheme="blue"
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
                  _focus={{ borderColor: "blue.500" }}
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
