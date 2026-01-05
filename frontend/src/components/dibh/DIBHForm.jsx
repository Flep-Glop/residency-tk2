import React, { useState, useEffect, useRef } from 'react';
import { useForm, Controller } from 'react-hook-form';
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
  const [isCustomRx, setIsCustomRx] = useState(false);
  const [isCustomBoostRx, setIsCustomBoostRx] = useState(false);
  const [selectedRxPreset, setSelectedRxPreset] = useState('');
  const [selectedBoostPreset, setSelectedBoostPreset] = useState('none');
  
  // Fixed dark theme colors for consistency
  const formBg = 'gray.800';
  const writeupBg = 'gray.800';
  const borderColor = 'gray.600';

  const { register, handleSubmit, watch, formState: { errors }, setValue, reset, control } = useForm({
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

  // Handler for selecting Rx preset (like TBI's selectRegimen)
  const selectRxPreset = (presetKey) => {
    setSelectedRxPreset(presetKey);
    
    const presets = {
      '50gy25fx': { dose: 50, fractions: 25 },
      '40gy15fx': { dose: 40, fractions: 15 }
    };
    
    if (presets[presetKey]) {
      setValue('dibh_data.dose', presets[presetKey].dose, { shouldValidate: true });
      setValue('dibh_data.fractions', presets[presetKey].fractions, { shouldValidate: true });
    }
  };

  // Handler for custom Rx checkbox
  const handleCustomRxChange = (e) => {
    setIsCustomRx(e.target.checked);
    if (e.target.checked) {
      // Clear preset selection
      setSelectedRxPreset('');
    } else {
      // Clear custom dose/fractions
      setValue('dibh_data.dose', '');
      setValue('dibh_data.fractions', '');
    }
  };

  // Handler for selecting boost preset
  const selectBoostPreset = (presetKey) => {
    setSelectedBoostPreset(presetKey);
    
    const presets = {
      '10gy5fx': { dose: 10, fractions: 5 },
      '16gy8fx': { dose: 16, fractions: 8 }
    };
    
    if (presets[presetKey]) {
      setValue('dibh_data.boost_dose', presets[presetKey].dose, { shouldValidate: true });
      setValue('dibh_data.boost_fractions', presets[presetKey].fractions, { shouldValidate: true });
    }
  };

  // Handler for custom boost Rx checkbox
  const handleCustomBoostRxChange = (e) => {
    setIsCustomBoostRx(e.target.checked);
    if (e.target.checked) {
      // Clear preset selection
      setSelectedBoostPreset('');
    } else {
      // Clear custom boost dose/fractions
      setValue('dibh_data.boost_dose', '');
      setValue('dibh_data.boost_fractions', '');
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
    setIsCustomRx(false);
    setIsCustomBoostRx(false);
    setSelectedRxPreset('');
    setSelectedBoostPreset('none');
    
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
                <Heading size="sm" mb={3} textAlign="center" color="white">Tx Sites</Heading>
                <FormControl isInvalid={errors.dibh_data?.treatment_site || errors.dibh_data?.custom_treatment_site} mb={3}>
                  <FormLabel fontSize="sm" color="gray.300" mb={2}>Site</FormLabel>
                  
                  {!isCustomTreatmentSite && (
                    <Grid templateColumns="repeat(2, 1fr)" gap={2} mb={3}>
                      <Button
                        size="sm"
                        onClick={() => {
                          setValue('dibh_data.treatment_site', 'left breast');
                          setIsCustomTreatmentSite(false);
                          setValue('dibh_data.custom_treatment_site', '');
                        }}
                        colorScheme={watch('dibh_data.treatment_site') === 'left breast' && !isCustomTreatmentSite ? 'green' : 'gray'}
                        variant={watch('dibh_data.treatment_site') === 'left breast' && !isCustomTreatmentSite ? 'solid' : 'outline'}
                        color={watch('dibh_data.treatment_site') === 'left breast' && !isCustomTreatmentSite ? 'white' : 'gray.300'}
                        borderColor="gray.600"
                        _hover={{ bg: watch('dibh_data.treatment_site') === 'left breast' && !isCustomTreatmentSite ? 'green.600' : 'gray.700' }}
                      >
                        Left Breast
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => {
                          setValue('dibh_data.treatment_site', 'right breast');
                          setIsCustomTreatmentSite(false);
                          setValue('dibh_data.custom_treatment_site', '');
                        }}
                        colorScheme={watch('dibh_data.treatment_site') === 'right breast' && !isCustomTreatmentSite ? 'green' : 'gray'}
                        variant={watch('dibh_data.treatment_site') === 'right breast' && !isCustomTreatmentSite ? 'solid' : 'outline'}
                        color={watch('dibh_data.treatment_site') === 'right breast' && !isCustomTreatmentSite ? 'white' : 'gray.300'}
                        borderColor="gray.600"
                        _hover={{ bg: watch('dibh_data.treatment_site') === 'right breast' && !isCustomTreatmentSite ? 'green.600' : 'gray.700' }}
                      >
                        Right Breast
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => {
                          setValue('dibh_data.treatment_site', 'diaphragm');
                          setIsCustomTreatmentSite(false);
                          setValue('dibh_data.custom_treatment_site', '');
                        }}
                        colorScheme={watch('dibh_data.treatment_site') === 'diaphragm' && !isCustomTreatmentSite ? 'green' : 'gray'}
                        variant={watch('dibh_data.treatment_site') === 'diaphragm' && !isCustomTreatmentSite ? 'solid' : 'outline'}
                        color={watch('dibh_data.treatment_site') === 'diaphragm' && !isCustomTreatmentSite ? 'white' : 'gray.300'}
                        borderColor="gray.600"
                        _hover={{ bg: watch('dibh_data.treatment_site') === 'diaphragm' && !isCustomTreatmentSite ? 'green.600' : 'gray.700' }}
                      >
                        Diaphragm
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => {
                          setValue('dibh_data.treatment_site', 'chest wall');
                          setIsCustomTreatmentSite(false);
                          setValue('dibh_data.custom_treatment_site', '');
                        }}
                        colorScheme={watch('dibh_data.treatment_site') === 'chest wall' && !isCustomTreatmentSite ? 'green' : 'gray'}
                        variant={watch('dibh_data.treatment_site') === 'chest wall' && !isCustomTreatmentSite ? 'solid' : 'outline'}
                        color={watch('dibh_data.treatment_site') === 'chest wall' && !isCustomTreatmentSite ? 'white' : 'gray.300'}
                        borderColor="gray.600"
                        _hover={{ bg: watch('dibh_data.treatment_site') === 'chest wall' && !isCustomTreatmentSite ? 'green.600' : 'gray.700' }}
                      >
                        Chest Wall
                      </Button>
                    </Grid>
                  )}
                  
                  {isCustomTreatmentSite && (
                    <Input
                      size="sm"
                      {...register("dibh_data.custom_treatment_site", {
                        required: isCustomTreatmentSite ? "Custom treatment site name is required" : false
                      })}
                      placeholder="e.g., Custom Site"
                      bg="gray.700"
                      borderColor="gray.600"
                      color="white"
                      _hover={{ borderColor: "gray.500" }}
                      _placeholder={{ color: "gray.400" }}
                      mb={2}
                    />
                  )}
                  
                  <Checkbox
                    size="sm"
                    isChecked={isCustomTreatmentSite}
                    onChange={handleCustomTreatmentSiteChange}
                    colorScheme="blue"
                  >
                    <Text fontSize="sm" color="gray.300">Custom Site?</Text>
                  </Checkbox>
                  
                  <FormErrorMessage sx={{ color: 'red.300' }}>
                    {errors.dibh_data?.treatment_site?.message || errors.dibh_data?.custom_treatment_site?.message}
                  </FormErrorMessage>
                </FormControl>
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
                
                {/* Primary Rx Section */}
                <FormControl isInvalid={errors.dibh_data?.dose || errors.dibh_data?.fractions} mb={3}>
                  <FormLabel fontSize="sm" color="gray.300" mb={2}>Rx (Gy/fx)</FormLabel>
                  
                  {!isCustomRx && (
                    <Grid templateColumns="repeat(2, 1fr)" gap={2} mb={3}>
                      <Button
                        size="sm"
                        onClick={() => selectRxPreset('50gy25fx')}
                        colorScheme={selectedRxPreset === '50gy25fx' ? 'green' : 'gray'}
                        variant={selectedRxPreset === '50gy25fx' ? 'solid' : 'outline'}
                        color={selectedRxPreset === '50gy25fx' ? 'white' : 'gray.300'}
                        borderColor="gray.600"
                        _hover={{ bg: selectedRxPreset === '50gy25fx' ? 'green.600' : 'gray.700' }}
                      >
                        50/25
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => selectRxPreset('40gy15fx')}
                        colorScheme={selectedRxPreset === '40gy15fx' ? 'green' : 'gray'}
                        variant={selectedRxPreset === '40gy15fx' ? 'solid' : 'outline'}
                        color={selectedRxPreset === '40gy15fx' ? 'white' : 'gray.300'}
                        borderColor="gray.600"
                        _hover={{ bg: selectedRxPreset === '40gy15fx' ? 'green.600' : 'gray.700' }}
                      >
                        40/15
                      </Button>
                    </Grid>
                  )}
                  
                  {isCustomRx && (
                    <Grid templateColumns="repeat(2, 1fr)" gap={2} mb={3}>
                      <Input
                        size="sm"
                        type="number"
                        step="any"
                        {...register("dibh_data.dose", { 
                          required: "Dose is required",
                          min: { value: 0.1, message: "Dose must be greater than 0" }
                        })}
                        placeholder="Rx (Gy)"
                        bg="gray.700"
                        borderColor="gray.600"
                        color="white"
                        _hover={{ borderColor: "gray.500" }}
                        _focus={{ borderColor: "green.500" }}
                        _placeholder={{ color: "gray.400" }}
                      />
                      <Input
                        size="sm"
                        type="number"
                        step="1"
                        {...register("dibh_data.fractions", { 
                          required: "Fractions is required",
                          min: { value: 1, message: "Minimum 1 fraction" }
                        })}
                        placeholder="Fx"
                        bg="gray.700"
                        borderColor="gray.600"
                        color="white"
                        _hover={{ borderColor: "gray.500" }}
                        _focus={{ borderColor: "green.500" }}
                        _placeholder={{ color: "gray.400" }}
                      />
                    </Grid>
                  )}
                  
                  <Checkbox
                    size="sm"
                    isChecked={isCustomRx}
                    onChange={handleCustomRxChange}
                    colorScheme="blue"
                  >
                    <Text fontSize="sm" color="gray.300">Custom Rx?</Text>
                  </Checkbox>
                </FormControl>
                
                {/* Boost Rx Section - Always visible */}
                <FormControl isInvalid={errors.dibh_data?.boost_dose || errors.dibh_data?.boost_fractions}>
                  <FormLabel fontSize="sm" color="gray.300" mb={2}>Boost (Gy/fx)</FormLabel>
                  
                  {!isCustomBoostRx && (
                    <Grid templateColumns="repeat(2, 1fr)" gap={2} mb={3}>
                      <GridItem colSpan={2}>
                        <Button
                          size="sm"
                          width="100%"
                          onClick={() => {
                            setSelectedBoostPreset('none');
                            setValue('dibh_data.has_boost', false);
                            setValue('dibh_data.boost_dose', '');
                            setValue('dibh_data.boost_fractions', '');
                          }}
                          colorScheme={selectedBoostPreset === 'none' || !watchHasBoost ? 'green' : 'gray'}
                          variant={selectedBoostPreset === 'none' || !watchHasBoost ? 'solid' : 'outline'}
                          color={selectedBoostPreset === 'none' || !watchHasBoost ? 'white' : 'gray.300'}
                          borderColor="gray.600"
                          _hover={{ bg: selectedBoostPreset === 'none' || !watchHasBoost ? 'green.600' : 'gray.700' }}
                        >
                          None
                        </Button>
                      </GridItem>
                      <Button
                        size="sm"
                        onClick={() => {
                          selectBoostPreset('10gy5fx');
                          setValue('dibh_data.has_boost', true);
                        }}
                        colorScheme={selectedBoostPreset === '10gy5fx' && watchHasBoost ? 'green' : 'gray'}
                        variant={selectedBoostPreset === '10gy5fx' && watchHasBoost ? 'solid' : 'outline'}
                        color={selectedBoostPreset === '10gy5fx' && watchHasBoost ? 'white' : 'gray.300'}
                        borderColor="gray.600"
                        _hover={{ bg: selectedBoostPreset === '10gy5fx' && watchHasBoost ? 'green.600' : 'gray.700' }}
                      >
                        10/5
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => {
                          selectBoostPreset('16gy8fx');
                          setValue('dibh_data.has_boost', true);
                        }}
                        colorScheme={selectedBoostPreset === '16gy8fx' && watchHasBoost ? 'green' : 'gray'}
                        variant={selectedBoostPreset === '16gy8fx' && watchHasBoost ? 'solid' : 'outline'}
                        color={selectedBoostPreset === '16gy8fx' && watchHasBoost ? 'white' : 'gray.300'}
                        borderColor="gray.600"
                        _hover={{ bg: selectedBoostPreset === '16gy8fx' && watchHasBoost ? 'green.600' : 'gray.700' }}
                      >
                        16/8
                      </Button>
                    </Grid>
                  )}
                  
                  {isCustomBoostRx && (
                    <Grid templateColumns="repeat(2, 1fr)" gap={2} mb={3}>
                      <Input
                        size="sm"
                        type="number"
                        step="any"
                        {...register("dibh_data.boost_dose", { 
                          required: isCustomBoostRx ? "Boost dose is required" : false,
                          min: { value: 0.1, message: "Boost dose must be greater than 0" }
                        })}
                        placeholder="Boost (Gy)"
                        bg="gray.700"
                        borderColor="gray.600"
                        color="white"
                        _hover={{ borderColor: "gray.500" }}
                        _focus={{ borderColor: "green.500" }}
                        _placeholder={{ color: "gray.400" }}
                        onChange={(e) => {
                          setValue('dibh_data.boost_dose', e.target.value);
                          if (e.target.value) {
                            setValue('dibh_data.has_boost', true);
                          }
                        }}
                      />
                      <Input
                        size="sm"
                        type="number"
                        step="1"
                        {...register("dibh_data.boost_fractions", { 
                          required: isCustomBoostRx ? "Boost fractions is required" : false,
                          min: { value: 1, message: "Minimum 1 boost fraction" }
                        })}
                        placeholder="Boost Fx"
                        bg="gray.700"
                        borderColor="gray.600"
                        color="white"
                        _hover={{ borderColor: "gray.500" }}
                        _focus={{ borderColor: "green.500" }}
                        _placeholder={{ color: "gray.400" }}
                        onChange={(e) => {
                          setValue('dibh_data.boost_fractions', e.target.value);
                          if (e.target.value) {
                            setValue('dibh_data.has_boost', true);
                          }
                        }}
                      />
                    </Grid>
                  )}
                  
                  <Checkbox
                    size="sm"
                    isChecked={isCustomBoostRx}
                    onChange={(e) => {
                      handleCustomBoostRxChange(e);
                      if (e.target.checked) {
                        setValue('dibh_data.has_boost', true);
                      }
                    }}
                    colorScheme="blue"
                  >
                    <Text fontSize="sm" color="gray.300">Custom Boost?</Text>
                  </Checkbox>
                </FormControl>
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