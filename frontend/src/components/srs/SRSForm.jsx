import React, { useState } from 'react';
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
  Badge,
  Flex,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
} from '@chakra-ui/react';
import srsService from '../../services/srsService';

const SRSForm = () => {
  // State variables
  const [loading, setLoading] = useState(false);
  const [writeup, setWriteup] = useState('');
  const [expandedIndices, setExpandedIndices] = useState([]);
  const [pendingLesionType, setPendingLesionType] = useState(null); // null, 'SRS', or 'SRT'
  const [editingPrescriptionIndex, setEditingPrescriptionIndex] = useState(null); // index of lesion being edited
  const toast = useToast();
  const [physicians, setPhysicians] = useState(['Dalwadi', 'Galvan', 'Ha', 'Kluwe', 'Le', 'Lewis', 'Tuli']);
  const [physicists, setPhysicists] = useState(['Bassiri', 'Kirby', 'Papanikolaou', 'Paschal', 'Rasmussen']);
  
  // Preset options for quick selection
  const srsPresets = [14, 16, 18, 20, 22]; // Gy (single fraction)
  const srtPresets = [
    { dose: 18, fractions: 3, label: '18/3' },
    { dose: 25, fractions: 5, label: '25/5' },
    { dose: 30, fractions: 5, label: '30/5' },
  ];
  
  // Add lesion with preset values
  const addLesionWithPreset = (type, dose, fractions) => {
    const newIndex = fields.length;
    append({
      site: '',
      volume: '',
      treatment_type: type,
      dose: dose,
      fractions: fractions,
      ptv_coverage: '',
      conformity_index: '',
      gradient_index: '',
      max_dose: ''
    });
    setExpandedIndices(prev => [...prev, newIndex]);
    setPendingLesionType(null);
  };
  
  // Update existing lesion prescription
  const updateLesionPrescription = (index, dose, fractions) => {
    setValue(`srs_data.lesions.${index}.dose`, dose);
    setValue(`srs_data.lesions.${index}.fractions`, fractions);
    setEditingPrescriptionIndex(null);
  };
  
  // Format prescription display
  const formatPrescription = (lesion) => {
    if (!lesion?.dose) return null;
    if (lesion.treatment_type === 'SRS') {
      return `${lesion.dose} Gy`;
    } else {
      return `${lesion.dose}/${lesion.fractions}`;
    }
  };
  
  // Calculate CI deviation based on volume thresholds
  const calculateCIDeviation = (ci, volume) => {
    if (!ci || !volume) return null;
    const ciVal = parseFloat(ci);
    const volVal = parseFloat(volume);
    
    if (volVal < 3) {
      if (ciVal < 2) return 'none';
      if (ciVal < 2.5) return 'minor';
      return 'major';
    } else if (volVal <= 30) {
      if (ciVal < 1.5) return 'none';
      if (ciVal < 1.8) return 'minor';
      return 'major';
    } else {
      if (ciVal < 1.2) return 'none';
      if (ciVal < 1.5) return 'minor';
      return 'major';
    }
  };
  
  // Calculate GI deviation based on volume thresholds
  const calculateGIDeviation = (gi, volume) => {
    if (!gi || !volume) return null;
    const giVal = parseFloat(gi);
    const volVal = parseFloat(volume);
    
    if (volVal < 2) {
      if (giVal < 5) return 'none';
      if (giVal < 7) return 'minor';
      return 'major';
    } else if (volVal <= 10) {
      if (giVal < 3.5) return 'none';
      if (giVal < 5) return 'minor';
      return 'major';
    } else {
      if (giVal < 3) return 'none';
      if (giVal < 4) return 'minor';
      return 'major';
    }
  };
  
  // Get CI/GI threshold hints based on volume
  const getThresholdHints = (volume) => {
    const volVal = parseFloat(volume);
    if (!volVal) return { ci: 'Enter volume', gi: 'Enter volume' };
    
    if (volVal < 3) {
      return { 
        ci: '<2 (none), <2.5 (minor)', 
        gi: volVal < 2 ? '<5 (none), <7 (minor)' : '<3.5 (none), <5 (minor)'
      };
    } else if (volVal <= 30) {
      return { 
        ci: '<1.5 (none), <1.8 (minor)', 
        gi: volVal <= 10 ? '<3.5 (none), <5 (minor)' : '<3 (none), <4 (minor)'
      };
    } else {
      return { ci: '<1.2 (none), <1.5 (minor)', gi: '<3 (none), <4 (minor)' };
    }
  };
  
  // Get deviation badge color
  const getDeviationColor = (deviation) => {
    if (deviation === 'none') return 'green';
    if (deviation === 'minor') return 'yellow';
    if (deviation === 'major') return 'red';
    return 'gray';
  };
  
  // Validate max dose (reasonable range is 100-200%)
  const validateMaxDose = (maxDose) => {
    const val = parseFloat(maxDose);
    if (!val) return null;
    if (val < 100) return { valid: false, message: 'Max dose should be ≥100%' };
    if (val > 200) return { valid: false, message: 'Max dose >200% is unreasonable' };
    if (val > 150) return { valid: true, warning: 'Max dose >150% is high' };
    return { valid: true };
  };
  
  // Fixed dark theme colors for consistency
  const formBg = 'gray.800';
  const borderColor = 'gray.600';

  // Form setup with react-hook-form
  const { register, handleSubmit, watch, formState: { errors }, setValue, reset, control } = useForm({
    defaultValues: {
      common_info: {
        physician: { name: '', role: 'physician' },
        physicist: { name: '', role: 'physicist' },
      },
      srs_data: {
        lesions: [],
        mri_sequence: 'T1-weighted, post Gd contrast',
        planning_system: 'BrainLAB Elements',
        accelerator: 'Versa HD',
        tracking_system: 'ExacTrac',
        immobilization_device: 'rigid aquaplast head mask',
        ct_slice_thickness: 1.25,
        ct_localization: true
      }
    }
  });
  
  // Field array for lesions
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'srs_data.lesions'
  });

  // Watch lesions for preview
  const watchLesions = watch('srs_data.lesions');
  
  
  // Handle form submission
  const onSubmit = async (data) => {
    // Pre-submission validation
    if (data.srs_data.lesions.length === 0) {
      toast({
        title: 'No lesions added',
        description: 'Please add at least one lesion before generating',
        status: 'error',
        duration: 4000,
      });
      return;
    }
    
    // Validate max dose for all lesions
    const maxDoseErrors = data.srs_data.lesions
      .map((lesion, index) => {
        const validation = validateMaxDose(lesion.max_dose);
        if (validation?.valid === false) {
          return `${lesion.site || `Lesion ${index + 1}`}: ${validation.message}`;
        }
        return null;
      })
      .filter(Boolean);
    
    if (maxDoseErrors.length > 0) {
      toast({
        title: 'Invalid max dose values',
        description: maxDoseErrors.join('; '),
        status: 'error',
        duration: 5000,
      });
      return;
    }
    
    // Check for major deviations and warn (but allow submission)
    const majorDeviations = data.srs_data.lesions
      .map((lesion, index) => {
        const ciDev = calculateCIDeviation(lesion.conformity_index, lesion.volume);
        const giDev = calculateGIDeviation(lesion.gradient_index, lesion.volume);
        const issues = [];
        if (ciDev === 'major') issues.push('CI');
        if (giDev === 'major') issues.push('GI');
        if (issues.length > 0) {
          return `${lesion.site || `Lesion ${index + 1}`}: Major ${issues.join(' and ')} deviation`;
        }
        return null;
      })
      .filter(Boolean);
    
    if (majorDeviations.length > 0) {
      toast({
        title: 'Major deviations detected',
        description: majorDeviations.join('; ') + '. These will be noted in the writeup.',
        status: 'warning',
        duration: 5000,
      });
    }
    
    setLoading(true);
    
    try {
      // Auto-set fractions to 1 for SRS treatment type and provide defaults for empty fields
      const processedData = {
        ...data,
        srs_data: {
          ...data.srs_data,
          lesions: data.srs_data.lesions.map((lesion, index) => ({
            ...lesion,
            site: lesion.site || `Lesion ${index + 1}`,
            fractions: lesion.treatment_type === 'SRS' ? 1 : (parseInt(lesion.fractions) || 5),
            volume: parseFloat(lesion.volume) || 1.0,
            dose: parseFloat(lesion.dose) || 18.0,
            prescription_isodose: 80, // Default value, not shown in UI
            ptv_coverage: parseFloat(lesion.ptv_coverage) || 98.0,
            conformity_index: parseFloat(lesion.conformity_index) || 1.2,
            gradient_index: parseFloat(lesion.gradient_index) || 3.0,
            max_dose: parseFloat(lesion.max_dose) || 125.0
          }))
        }
      };
      
      const response = await srsService.generateWriteup({
        common_info: processedData.common_info,
        srs_data: processedData.srs_data
      });
      
      setWriteup(response.writeup);
      
      toast({
        title: 'Write-up generated successfully',
        status: 'success',
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: 'Error generating write-up',
        description: error.message,
        status: 'error',
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle form reset
  const handleReset = () => {
    window.location.reload();
  };

  // Copy write-up to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(writeup);
    toast({
      title: 'Copied to clipboard',
      status: 'success',
      duration: 2000,
    });
  };


  return (
    <Box bg="gray.900" minH="100vh">
      {/* Header */}
      <Box bg="green.900" color="white" p={6} mb={6} borderRadius="lg" border="1px" borderColor="green.700">
        <Flex justify="space-between" align="center" flexWrap="wrap" gap={4}>
          <Box>
            <Heading size="md" mb={2}>SRS/SRT Write-up Generator</Heading>
          </Box>
        </Flex>
      </Box>

      {/* Main Content */}
      <Box px={6}>
        <Box maxW="1200px" mx="auto">
          <form onSubmit={handleSubmit(onSubmit)}>
            {/* Three Column Layout - Staff, Lesion Selection, and Empty */}
            <Grid
              templateColumns={{
                base: '1fr',
                md: 'repeat(2, 1fr)',
                lg: 'repeat(3, 1fr)'
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

              {/* Lesion Grid - SRS/SRT selection matrix - spans 2 columns on large screens */}
              <GridItem
                colSpan={{ base: 1, lg: 2 }}
                p={4}
                borderWidth="1px"
                borderRadius="md"
                bg={formBg}
                borderColor={borderColor}
                boxShadow="sm"
              >
                <Heading size="sm" mb={3} textAlign="center" color="white">Lesion Selection</Heading>

                {/* Grid Header */}
                <Grid templateColumns="1fr 1fr" gap={2} mb={2}>
                  <Box 
                    bg="green.700" 
                    p={2} 
                    borderRadius="md" 
                    textAlign="center"
                  >
                    <Text fontSize="sm" color="white" fontWeight="bold">SRS</Text>
                  </Box>
                  <Box 
                    bg="purple.700" 
                    p={2} 
                    borderRadius="md" 
                    textAlign="center"
                  >
                    <Text fontSize="sm" color="white" fontWeight="bold">SRT</Text>
                  </Box>
                </Grid>

                {/* Lesion Rows */}
                {fields.map((field, index) => (
                  <Grid key={field.id} templateColumns="1fr 1fr" gap={2} mb={2}>
                    {/* SRS Cell */}
                    <Box
                      bg={watchLesions[index]?.treatment_type === 'SRS' ? 'green.800' : 'gray.700'}
                      p={2}
                      borderRadius="md"
                      borderWidth="2px"
                      borderColor={watchLesions[index]?.treatment_type === 'SRS' ? 'green.500' : 'transparent'}
                      cursor={watchLesions[index]?.treatment_type === 'SRS' ? 'default' : 'pointer'}
                      onClick={() => {
                        if (watchLesions[index]?.treatment_type !== 'SRS') {
                          setValue(`srs_data.lesions.${index}.treatment_type`, 'SRS');
                          setValue(`srs_data.lesions.${index}.fractions`, 1);
                          setEditingPrescriptionIndex(index);
                        }
                      }}
                      _hover={watchLesions[index]?.treatment_type !== 'SRS' ? { borderColor: 'green.400' } : {}}
                      transition="all 0.2s"
                    >
                      {watchLesions[index]?.treatment_type === 'SRS' ? (
                        editingPrescriptionIndex === index ? (
                          <Flex wrap="wrap" gap={1} justify="center">
                            {srsPresets.map(dose => (
                              <Button
                                key={dose}
                                size="xs"
                                colorScheme="green"
                                variant={watchLesions[index]?.dose == dose ? 'solid' : 'outline'}
                                onClick={(e) => { e.stopPropagation(); updateLesionPrescription(index, dose, 1); }}
                              >
                                {dose} Gy
                              </Button>
                            ))}
                            <Button
                              size="xs"
                              variant="ghost"
                              color="gray.400"
                              onClick={(e) => { e.stopPropagation(); setEditingPrescriptionIndex(null); }}
                            >
                              X
                            </Button>
                          </Flex>
                        ) : (
                          <Flex direction="column" gap={1}>
                            {formatPrescription(watchLesions[index]) && (
                              <Badge 
                                colorScheme="green" 
                                cursor="pointer"
                                onClick={(e) => { e.stopPropagation(); setEditingPrescriptionIndex(index); }}
                                _hover={{ opacity: 0.8 }}
                                alignSelf="center"
                              >
                                {formatPrescription(watchLesions[index])}
                              </Badge>
                            )}
                            <Input
                              size="sm"
                              placeholder="e.g., Left Cerebellum"
                              value={watchLesions[index]?.site || ''}
                              onChange={(e) => setValue(`srs_data.lesions.${index}.site`, e.target.value)}
                              onClick={(e) => e.stopPropagation()}
                              autoFocus={!watchLesions[index]?.site}
                              bg="gray.700"
                              borderColor="gray.600"
                              color="white"
                              textAlign="center"
                              _placeholder={{ color: 'gray.400' }}
                              _hover={{ borderColor: 'gray.500' }}
                              _focus={{ borderColor: 'gray.500', boxShadow: 'none' }}
                            />
                          </Flex>
                        )
                      ) : (
                        <Text fontSize="xs" color="gray.500" textAlign="center">Click to select</Text>
                      )}
                    </Box>
                    
                    {/* SRT Cell */}
                    <Box
                      bg={watchLesions[index]?.treatment_type === 'SRT' ? 'purple.800' : 'gray.700'}
                      p={2}
                      borderRadius="md"
                      borderWidth="2px"
                      borderColor={watchLesions[index]?.treatment_type === 'SRT' ? 'purple.500' : 'transparent'}
                      cursor={watchLesions[index]?.treatment_type === 'SRT' ? 'default' : 'pointer'}
                      onClick={() => {
                        if (watchLesions[index]?.treatment_type !== 'SRT') {
                          setValue(`srs_data.lesions.${index}.treatment_type`, 'SRT');
                          setValue(`srs_data.lesions.${index}.fractions`, 5);
                          setEditingPrescriptionIndex(index);
                        }
                      }}
                      _hover={watchLesions[index]?.treatment_type !== 'SRT' ? { borderColor: 'purple.400' } : {}}
                      transition="all 0.2s"
                    >
                      {watchLesions[index]?.treatment_type === 'SRT' ? (
                        editingPrescriptionIndex === index ? (
                          <Flex wrap="wrap" gap={1} justify="center">
                            {srtPresets.map(preset => (
                              <Button
                                key={preset.label}
                                size="xs"
                                colorScheme="purple"
                                variant={watchLesions[index]?.dose == preset.dose && watchLesions[index]?.fractions == preset.fractions ? 'solid' : 'outline'}
                                onClick={(e) => { e.stopPropagation(); updateLesionPrescription(index, preset.dose, preset.fractions); }}
                              >
                                {preset.label}
                              </Button>
                            ))}
                            <Button
                              size="xs"
                              variant="ghost"
                              color="gray.400"
                              onClick={(e) => { e.stopPropagation(); setEditingPrescriptionIndex(null); }}
                            >
                              X
                            </Button>
                          </Flex>
                        ) : (
                          <Flex direction="column" gap={1}>
                            {formatPrescription(watchLesions[index]) && (
                              <Badge 
                                colorScheme="purple" 
                                cursor="pointer"
                                onClick={(e) => { e.stopPropagation(); setEditingPrescriptionIndex(index); }}
                                _hover={{ opacity: 0.8 }}
                                alignSelf="center"
                              >
                                {formatPrescription(watchLesions[index])}
                              </Badge>
                            )}
                            <Input
                              size="sm"
                              placeholder="e.g., Right Parietal"
                              value={watchLesions[index]?.site || ''}
                              onChange={(e) => setValue(`srs_data.lesions.${index}.site`, e.target.value)}
                              onClick={(e) => e.stopPropagation()}
                              autoFocus={!watchLesions[index]?.site}
                              bg="gray.700"
                              borderColor="gray.600"
                              color="white"
                              textAlign="center"
                              _placeholder={{ color: 'gray.400' }}
                              _hover={{ borderColor: 'gray.500' }}
                              _focus={{ borderColor: 'gray.500', boxShadow: 'none' }}
                            />
                          </Flex>
                        )
                      ) : (
                        <Text fontSize="xs" color="gray.500" textAlign="center">Click to select</Text>
                      )}
                    </Box>
                  </Grid>
                ))}

                {/* Add Lesion Row */}
                <Grid templateColumns="1fr 1fr" gap={2}>
                  {/* SRS Column */}
                  <Box 
                    bg={pendingLesionType === 'SRS' ? 'green.800' : 'gray.700'} 
                    p={2} 
                    borderRadius="md" 
                    borderWidth="2px"
                    borderColor={pendingLesionType === 'SRS' ? 'green.500' : 'gray.600'}
                    borderStyle={pendingLesionType === 'SRS' ? 'solid' : 'dashed'}
                    cursor={pendingLesionType ? 'default' : 'pointer'}
                    _hover={!pendingLesionType ? { borderColor: 'green.400', bg: 'green.900' } : {}}
                    transition="all 0.2s"
                    onClick={() => !pendingLesionType && setPendingLesionType('SRS')}
                  >
                    {pendingLesionType === 'SRS' ? (
                      <Flex wrap="wrap" gap={1} justify="center">
                        {srsPresets.map(dose => (
                          <Button
                            key={dose}
                            size="xs"
                            colorScheme="green"
                            variant="solid"
                            onClick={(e) => { e.stopPropagation(); addLesionWithPreset('SRS', dose, 1); }}
                          >
                            {dose} Gy
                          </Button>
                        ))}
                        <Button
                          size="xs"
                          variant="ghost"
                          color="gray.400"
                          onClick={(e) => { e.stopPropagation(); setPendingLesionType(null); }}
                        >
                          X
                        </Button>
                      </Flex>
                    ) : (
                      <Text fontSize="xs" color="gray.400" textAlign="center">+ New SRS</Text>
                    )}
                  </Box>
                  
                  {/* SRT Column */}
                  <Box 
                    bg={pendingLesionType === 'SRT' ? 'purple.800' : 'gray.700'} 
                    p={2} 
                    borderRadius="md" 
                    borderWidth="2px"
                    borderColor={pendingLesionType === 'SRT' ? 'purple.500' : 'gray.600'}
                    borderStyle={pendingLesionType === 'SRT' ? 'solid' : 'dashed'}
                    cursor={pendingLesionType ? 'default' : 'pointer'}
                    _hover={!pendingLesionType ? { borderColor: 'purple.400', bg: 'purple.900' } : {}}
                    transition="all 0.2s"
                    onClick={() => !pendingLesionType && setPendingLesionType('SRT')}
                  >
                    {pendingLesionType === 'SRT' ? (
                      <Flex wrap="wrap" gap={1} justify="center">
                        {srtPresets.map(preset => (
                          <Button
                            key={preset.label}
                            size="xs"
                            colorScheme="purple"
                            variant="solid"
                            onClick={(e) => { e.stopPropagation(); addLesionWithPreset('SRT', preset.dose, preset.fractions); }}
                          >
                            {preset.label}
                          </Button>
                        ))}
                        <Button
                          size="xs"
                          variant="ghost"
                          color="gray.400"
                          onClick={(e) => { e.stopPropagation(); setPendingLesionType(null); }}
                        >
                          X
                        </Button>
                      </Flex>
                    ) : (
                      <Text fontSize="xs" color="gray.400" textAlign="center">+ New SRT</Text>
                    )}
                  </Box>
                </Grid>

                {fields.length === 0 && (
                  <Text fontSize="xs" color="gray.500" mt={2} textAlign="center">
                    Click a cell above to add a lesion
                  </Text>
                )}
              </GridItem>

            </Grid>

            {/* Lesions Section - Full Width - Only show if lesions exist */}
            {fields.length > 0 && (
            <Box
              p={4}
              borderWidth="1px"
              borderRadius="md"
              bg={formBg}
              borderColor={borderColor}
              boxShadow="sm"
              mb={6}
            >
                <Heading size="sm" color="white" mb={4}>
                  Lesions ({fields.length})
                </Heading>

              <Accordion allowMultiple index={expandedIndices} onChange={setExpandedIndices}>
                {fields.map((field, index) => (
                  <AccordionItem key={field.id} border="1px" borderColor="gray.600" borderRadius="md" mb={4}>
                    <AccordionButton bg="gray.700" _hover={{ bg: 'gray.650' }}>
                      <Box flex="1" textAlign="left">
                        <Text color="white" fontWeight="bold">
                          {watchLesions[index]?.site || `Lesion ${index + 1}`}
                        </Text>
                      </Box>
                      <Button
                        size="xs"
                        variant="outline"
                        colorScheme="red"
                        color="red.300"
                        borderColor="red.600"
                        _hover={{ bg: "red.800", borderColor: "red.400" }}
                        onClick={(e) => { e.stopPropagation(); remove(index); }}
                        mr={2}
                      >
                        Delete
                      </Button>
                      <AccordionIcon color="white" />
                    </AccordionButton>

                    <AccordionPanel pb={4} bg="gray.750">
                      {/* Hidden inputs to maintain form data */}
                      <input type="hidden" {...register(`srs_data.lesions.${index}.site`)} />
                      <input type="hidden" {...register(`srs_data.lesions.${index}.treatment_type`)} />
                      <input type="hidden" {...register(`srs_data.lesions.${index}.dose`)} />
                      <input type="hidden" {...register(`srs_data.lesions.${index}.fractions`)} />

                      {/* Plan Metrics - Horizontal Layout */}
                      <Grid 
                        templateColumns={{ base: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)', lg: 'repeat(5, 1fr)' }} 
                        gap={3}
                      >
                        <FormControl>
                          <FormLabel fontSize="xs" color="gray.400">Volume (cc)</FormLabel>
                          <Input
                            size="sm"
                            type="number"
                            step="any"
                            {...register(`srs_data.lesions.${index}.volume`, {
                              required: 'Volume is required',
                              min: { value: 0.01, message: 'Volume must be positive' }
                            })}
                            placeholder="cc"
                            bg="gray.700"
                            borderColor="gray.600"
                            color="white"
                            _hover={{ borderColor: 'gray.500' }}
                            _placeholder={{ color: 'gray.400' }}
                          />
                          {watchLesions[index]?.volume && (
                            <Text fontSize="2xs" color="gray.500" mt={1}>
                              Thresholds adjust based on volume
                            </Text>
                          )}
                        </FormControl>

                        <FormControl>
                          <FormLabel fontSize="xs" color="gray.400">Coverage (%)</FormLabel>
                          <Input
                            size="sm"
                            type="number"
                            {...register(`srs_data.lesions.${index}.ptv_coverage`)}
                            placeholder="98"
                            bg="gray.700"
                            borderColor="gray.600"
                            color="white"
                            _hover={{ borderColor: 'gray.500' }}
                            _placeholder={{ color: 'gray.500' }}
                          />
                        </FormControl>

                        <FormControl>
                          <Flex align="center" gap={1}>
                            <FormLabel fontSize="xs" color="gray.400" mb={0}>CI</FormLabel>
                            {watchLesions[index]?.conformity_index && watchLesions[index]?.volume && (
                              <Badge 
                                size="sm" 
                                colorScheme={getDeviationColor(calculateCIDeviation(watchLesions[index].conformity_index, watchLesions[index].volume))}
                                fontSize="2xs"
                              >
                                {calculateCIDeviation(watchLesions[index].conformity_index, watchLesions[index].volume)}
                              </Badge>
                            )}
                          </Flex>
                          <Input
                            size="sm"
                            type="number"
                            step="any"
                            {...register(`srs_data.lesions.${index}.conformity_index`)}
                            placeholder="1.2"
                            bg="gray.700"
                            borderColor={
                              watchLesions[index]?.conformity_index && watchLesions[index]?.volume
                                ? calculateCIDeviation(watchLesions[index].conformity_index, watchLesions[index].volume) === 'major'
                                  ? 'red.500'
                                  : calculateCIDeviation(watchLesions[index].conformity_index, watchLesions[index].volume) === 'minor'
                                    ? 'yellow.500'
                                    : 'gray.600'
                                : 'gray.600'
                            }
                            color="white"
                            _hover={{ borderColor: 'gray.500' }}
                            _placeholder={{ color: 'gray.500' }}
                          />
                          {watchLesions[index]?.volume && (
                            <Text fontSize="2xs" color="gray.500" mt={1}>
                              {getThresholdHints(watchLesions[index].volume).ci}
                            </Text>
                          )}
                        </FormControl>

                        <FormControl>
                          <Flex align="center" gap={1}>
                            <FormLabel fontSize="xs" color="gray.400" mb={0}>GI</FormLabel>
                            {watchLesions[index]?.gradient_index && watchLesions[index]?.volume && (
                              <Badge 
                                size="sm" 
                                colorScheme={getDeviationColor(calculateGIDeviation(watchLesions[index].gradient_index, watchLesions[index].volume))}
                                fontSize="2xs"
                              >
                                {calculateGIDeviation(watchLesions[index].gradient_index, watchLesions[index].volume)}
                              </Badge>
                            )}
                          </Flex>
                          <Input
                            size="sm"
                            type="number"
                            step="any"
                            {...register(`srs_data.lesions.${index}.gradient_index`)}
                            placeholder="3.0"
                            bg="gray.700"
                            borderColor={
                              watchLesions[index]?.gradient_index && watchLesions[index]?.volume
                                ? calculateGIDeviation(watchLesions[index].gradient_index, watchLesions[index].volume) === 'major'
                                  ? 'red.500'
                                  : calculateGIDeviation(watchLesions[index].gradient_index, watchLesions[index].volume) === 'minor'
                                    ? 'yellow.500'
                                    : 'gray.600'
                                : 'gray.600'
                            }
                            color="white"
                            _hover={{ borderColor: 'gray.500' }}
                            _placeholder={{ color: 'gray.500' }}
                          />
                          {watchLesions[index]?.volume && (
                            <Text fontSize="2xs" color="gray.500" mt={1}>
                              {getThresholdHints(watchLesions[index].volume).gi}
                            </Text>
                          )}
                        </FormControl>

                        <FormControl isInvalid={validateMaxDose(watchLesions[index]?.max_dose)?.valid === false}>
                          <FormLabel fontSize="xs" color="gray.400">Max Dose (%)</FormLabel>
                          <Input
                            size="sm"
                            type="number"
                            {...register(`srs_data.lesions.${index}.max_dose`)}
                            placeholder="125"
                            bg="gray.700"
                            borderColor={
                              validateMaxDose(watchLesions[index]?.max_dose)?.valid === false
                                ? 'red.500'
                                : validateMaxDose(watchLesions[index]?.max_dose)?.warning
                                  ? 'yellow.500'
                                  : 'gray.600'
                            }
                            color="white"
                            _hover={{ borderColor: 'gray.500' }}
                            _placeholder={{ color: 'gray.500' }}
                          />
                          {validateMaxDose(watchLesions[index]?.max_dose)?.message && (
                            <FormErrorMessage fontSize="2xs">
                              {validateMaxDose(watchLesions[index]?.max_dose)?.message}
                            </FormErrorMessage>
                          )}
                          {validateMaxDose(watchLesions[index]?.max_dose)?.warning && (
                            <Text fontSize="2xs" color="yellow.400" mt={1}>
                              {validateMaxDose(watchLesions[index]?.max_dose)?.warning}
                            </Text>
                          )}
                        </FormControl>
                      </Grid>
                    </AccordionPanel>
                  </AccordionItem>
                ))}
              </Accordion>
            </Box>
            )}

            {/* Action Buttons */}
            <Flex gap={4} mb={6}>
              <Button
                type="submit"
                colorScheme="green"
                size="md"
                width="100%"
                isLoading={loading}
                loadingText="Generating..."
                shadow="md"
              >
                Generate Write-up
              </Button>
              <Button
                type="button"
                variant="outline"
                colorScheme="red"
                color="red.300"
                borderColor="red.600"
                _hover={{ bg: "red.800", borderColor: "red.400" }}
                size="md"
                width="auto"
                onClick={handleReset}
              >
                Reset Form
              </Button>
            </Flex>

          </form>

          {/* Write-up Display Section - Outside form */}
          {writeup && (
            <Box
              mt={6}
              p={4}
              borderWidth="1px"
              borderRadius="md"
              bg={formBg}
              borderColor={borderColor}
              boxShadow="sm"
            >
              <Flex justify="space-between" align="center" mb={3}>
                <Heading size="sm" color="white">
                  Generated Write-up
                </Heading>
                <Button
                  colorScheme="green"
                  size="sm"
                  onClick={copyToClipboard}
                >
                  Copy to Clipboard
                </Button>
              </Flex>

              <Textarea
                value={writeup}
                readOnly
                minH="400px"
                bg="gray.700"
                borderColor="gray.600"
                color="white"
                fontSize="sm"
                lineHeight="1"
                whiteSpace="pre-wrap"
                _focus={{ borderColor: 'green.500' }}
                sx={{ fontFamily: '"Aseprite", monospace !important' }}
              />
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default SRSForm;
