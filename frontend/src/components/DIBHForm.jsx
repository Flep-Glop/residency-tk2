import React, { useState, useEffect, useContext } from 'react';
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
  Checkbox,
  Card,
  CardBody,
  HStack,
  VStack,
} from '@chakra-ui/react';
import { getTreatmentSites, getImmobilizationDevices, getFractionationSchemes, generateDIBHWriteup } from '../services/dibhService';
import { ClinicProfileContext } from '../pages/_app';
import WriteupPanel from './WriteupPanel';

const DIBHForm = () => {
  const router = useRouter();
  const { activeProfile } = useContext(ClinicProfileContext);
  const [treatmentSites, setTreatmentSites] = useState([]);
  const [immobilizationDevices, setImmobilizationDevices] = useState([]);
  const [fractionationSchemes, setFractionationSchemes] = useState({});
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [writeup, setWriteup] = useState('');
  const toast = useToast();
  const physicians = activeProfile?.physicians || [];
  const physicists = activeProfile?.physicists || [];
  const dibhFacilityDefaults = activeProfile?.facility_defaults?.dibh || {};
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
        scanning_system: dibhFacilityDefaults.scanning_system || 'C-RAD',
        gating_device: dibhFacilityDefaults.gating_device || 'C-RAD CatalystHD',
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
  
  useEffect(() => {
    const defaults = activeProfile?.facility_defaults?.dibh || {};
    setValue('dibh_data.scanning_system', defaults.scanning_system || 'C-RAD');
    setValue('dibh_data.gating_device', defaults.gating_device || 'C-RAD CatalystHD');
  }, [activeProfile, setValue]);

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

  // Rx presets from profile or fallback defaults
  const rxPresetsList = activeProfile?.module_presets?.dibh?.rx_presets || [
    { dose: 50, fractions: 25 },
    { dose: 40, fractions: 15 }
  ];
  const rxPresetsMap = Object.fromEntries(
    rxPresetsList.map(p => [`${p.dose}gy${p.fractions}fx`, p])
  );

  // Handler for selecting Rx preset
  const selectRxPreset = (presetKey) => {
    setSelectedRxPreset(presetKey);
    
    if (rxPresetsMap[presetKey]) {
      setValue('dibh_data.dose', rxPresetsMap[presetKey].dose, { shouldValidate: true });
      setValue('dibh_data.fractions', rxPresetsMap[presetKey].fractions, { shouldValidate: true });
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

  // Boost presets from profile or fallback defaults
  const boostPresetsList = activeProfile?.module_presets?.dibh?.boost_presets || [
    { dose: 10, fractions: 5 },
    { dose: 16, fractions: 8 }
  ];
  const boostPresetsMap = Object.fromEntries(
    boostPresetsList.map(p => [`${p.dose}gy${p.fractions}fx`, p])
  );

  // Handler for selecting boost preset
  const selectBoostPreset = (presetKey) => {
    setSelectedBoostPreset(presetKey);
    
    if (boostPresetsMap[presetKey]) {
      setValue('dibh_data.boost_dose', boostPresetsMap[presetKey].dose, { shouldValidate: true });
      setValue('dibh_data.boost_fractions', boostPresetsMap[presetKey].fractions, { shouldValidate: true });
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
                        {physicists.map(name => (
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
                        {physicians.map(name => (
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
                      {(activeProfile?.module_presets?.dibh?.treatment_sites || ['left breast', 'right breast', 'diaphragm', 'chest wall']).map(site => (
                        <Button
                          key={site}
                          size="sm"
                          onClick={() => {
                            setValue('dibh_data.treatment_site', site);
                            setIsCustomTreatmentSite(false);
                            setValue('dibh_data.custom_treatment_site', '');
                          }}
                          colorScheme={watch('dibh_data.treatment_site') === site && !isCustomTreatmentSite ? 'green' : 'gray'}
                          variant={watch('dibh_data.treatment_site') === site && !isCustomTreatmentSite ? 'solid' : 'outline'}
                          color={watch('dibh_data.treatment_site') === site && !isCustomTreatmentSite ? 'white' : 'gray.300'}
                          borderColor="gray.600"
                          _hover={{ bg: watch('dibh_data.treatment_site') === site && !isCustomTreatmentSite ? 'green.600' : 'gray.700' }}
                        >
                          {site.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                        </Button>
                      ))}
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
                      {rxPresetsList.map(p => {
                        const key = `${p.dose}gy${p.fractions}fx`;
                        return (
                          <Button
                            key={key}
                            size="sm"
                            onClick={() => selectRxPreset(key)}
                            colorScheme={selectedRxPreset === key ? 'green' : 'gray'}
                            variant={selectedRxPreset === key ? 'solid' : 'outline'}
                            color={selectedRxPreset === key ? 'white' : 'gray.300'}
                            borderColor="gray.600"
                            _hover={{ bg: selectedRxPreset === key ? 'green.600' : 'gray.700' }}
                          >
                            {p.dose}/{p.fractions}
                          </Button>
                        );
                      })}
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
                      {boostPresetsList.map(p => {
                        const key = `${p.dose}gy${p.fractions}fx`;
                        return (
                          <Button
                            key={key}
                            size="sm"
                            onClick={() => {
                              selectBoostPreset(key);
                              setValue('dibh_data.has_boost', true);
                            }}
                            colorScheme={selectedBoostPreset === key && watchHasBoost ? 'green' : 'gray'}
                            variant={selectedBoostPreset === key && watchHasBoost ? 'solid' : 'outline'}
                            color={selectedBoostPreset === key && watchHasBoost ? 'white' : 'gray.300'}
                            borderColor="gray.600"
                            _hover={{ bg: selectedBoostPreset === key && watchHasBoost ? 'green.600' : 'gray.700' }}
                          >
                            {p.dose}/{p.fractions}
                          </Button>
                        );
                      })}
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
          <WriteupPanel writeup={writeup} minH="300px" />
        </Box>
      </Box>
    </Box>
  );
};

export default DIBHForm; 