import React, { useState, useEffect, useContext } from 'react';
import { useForm, Controller } from 'react-hook-form';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Select,
  FormErrorMessage,
  Heading,
  Grid,
  GridItem,
  Text,
  Textarea,
  useToast,
  Flex,
  VStack,
  HStack,
  Checkbox,
  Input
} from '@chakra-ui/react';
import { generateTBIWriteup } from '../services/tbiService';
import { ClinicProfileContext } from '../pages/_app';
import WriteupPanel from './WriteupPanel';

const TBIForm = () => {
  const { activeProfile } = useContext(ClinicProfileContext);
  const [loading, setLoading] = useState(false);
  const [writeup, setWriteup] = useState('');
  const toast = useToast();
  const physicians = activeProfile?.physicians || [];
  const physicists = activeProfile?.physicists || [];
  
  // Fixed dark theme colors for consistency
  const formBg = 'gray.800';
  const writeupBg = 'gray.800';
  const borderColor = 'gray.600';

  const facilityDefaults = activeProfile?.facility_defaults?.tbi || {};

  // Form setup with react-hook-form
  const { register, handleSubmit, watch, formState: { errors }, setValue, reset, control } = useForm({
    defaultValues: {
      common_info: {
        physician: { name: '', role: 'physician' },
        physicist: { name: '', role: 'physicist' },
      },
      tbi_data: {
        regimen: '',
        prescription_dose: '',
        fractions: '',
        setup: '',
        lung_blocks: '',
        energy: facilityDefaults.energy || '6 MV',
        dose_rate_range: facilityDefaults.dose_rate_range || '10 - 15 cGy/min',
        machine_dose_rate: facilityDefaults.machine_dose_rate || '200 MU/min'
      }
    }
  });

  // Sync facility defaults when active profile loads/changes
  useEffect(() => {
    const defaults = activeProfile?.facility_defaults?.tbi || {};
    setValue('tbi_data.energy', defaults.energy || '6 MV');
    setValue('tbi_data.dose_rate_range', defaults.dose_rate_range || '10 - 15 cGy/min');
    setValue('tbi_data.machine_dose_rate', defaults.machine_dose_rate || '200 MU/min');
  }, [activeProfile, setValue]);

  // Watch values for button styling
  const watchSetup = watch('tbi_data.setup');
  const watchRegimen = watch('tbi_data.regimen');
  const watchFractions = watch('tbi_data.fractions');
  
  // State for showing HVL selection for multi-fraction regimens
  const [showHVLSelection, setShowHVLSelection] = useState(false);
  
  // State for custom Rx mode
  const [isCustomRx, setIsCustomRx] = useState(false);
  
  // Handle form submission
  const onSubmit = async (data) => {
    setLoading(true);
    
    try {
      const response = await generateTBIWriteup({
        common_info: data.common_info,
        tbi_data: data.tbi_data
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
    reset();
    setWriteup('');
    setIsCustomRx(false);
    setShowHVLSelection(false);
    toast({
      title: 'Form reset',
      status: 'info',
      duration: 2000,
    });
  };


  // Regimen presets from profile or fallback defaults
  const regimenPresets = activeProfile?.module_presets?.tbi?.regimens || {
    '2gy1fx': { dose: 2.0, fractions: 1, lung_blocks: 'none' },
    '4gy1fx': { dose: 4.0, fractions: 1, lung_blocks: 'none' },
    '12gy6fx': { dose: 12.0, fractions: 6, lung_blocks: null },
    '13.2gy8fx': { dose: 13.2, fractions: 8, lung_blocks: null }
  };

  // Handle regimen selection and set dose/fractions
  const selectRegimen = (regimenKey) => {
    setValue('tbi_data.regimen', regimenKey, { shouldValidate: true });
    
    const regimen = regimenPresets[regimenKey];
    
    if (regimen) {
      setValue('tbi_data.prescription_dose', regimen.dose, { shouldValidate: true });
      setValue('tbi_data.fractions', regimen.fractions, { shouldValidate: true });
      
      if (regimen.fractions === 1) {
        setValue('tbi_data.lung_blocks', regimen.lung_blocks || 'none', { shouldValidate: true });
        setShowHVLSelection(false);
      } else {
        setShowHVLSelection(true);
      }
    }
  };
  
  // Handle HVL selection for multi-fraction regimens
  const selectHVL = (hvlValue) => {
    setValue('tbi_data.lung_blocks', hvlValue, { shouldValidate: true });
  };

  // Handler for custom Rx checkbox
  const handleCustomRxChange = (e) => {
    setIsCustomRx(e.target.checked);
    if (e.target.checked) {
      // Clear preset selection
      setValue('tbi_data.regimen', 'custom', { shouldValidate: true });
      setValue('tbi_data.prescription_dose', '');
      setValue('tbi_data.fractions', '');
      setValue('tbi_data.lung_blocks', 'none');
      setShowHVLSelection(false);
    } else {
      // Clear custom values
      setValue('tbi_data.regimen', '');
      setValue('tbi_data.prescription_dose', '');
      setValue('tbi_data.fractions', '');
      setValue('tbi_data.lung_blocks', '');
    }
  };

  return (
    <Box bg="gray.900" minH="100vh">
      {/* Header */}
      <Box bg="green.900" color="white" p={6} mb={6} borderRadius="lg" border="1px" borderColor="green.700">
        <Flex justify="space-between" align="center" flexWrap="wrap" gap={4}>
          <Box>
            <Heading size="md" mb={2}>TBI Write-up Generator</Heading>
          </Box>
        </Flex>
      </Box>

      {/* Main Content */}
      <Box px={6}>
        <Box maxW="1200px" mx="auto">
          <form onSubmit={handleSubmit(onSubmit)}>
            {/* Three Columns */}
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
                <VStack spacing={3} align="stretch">
                  <FormControl isInvalid={errors.common_info?.physicist?.name}>
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
                    <FormErrorMessage fontSize="xs" sx={{ color: 'red.300' }}>
                      {errors.common_info?.physicist?.name?.message}
                    </FormErrorMessage>
                  </FormControl>

                  <FormControl isInvalid={errors.common_info?.physician?.name}>
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
                    <FormErrorMessage fontSize="xs" sx={{ color: 'red.300' }}>
                      {errors.common_info?.physician?.name?.message}
                    </FormErrorMessage>
                  </FormControl>
                </VStack>

              </GridItem>

              {/* Treatment Parameters Section */}
              <GridItem
                p={4}
                borderWidth="1px"
                borderRadius="md"
                bg={formBg}
                borderColor={borderColor}
                boxShadow="sm"
              >
                <Heading size="sm" mb={3} textAlign="center" color="white">Treatment Parameters</Heading>

                <VStack spacing={3} align="stretch">
                  <FormControl isInvalid={errors.tbi_data?.regimen}>
                    <FormLabel fontSize="sm" color="gray.300" mb={2}>Rx (Gy/fx)</FormLabel>
                    
                    {!isCustomRx && (
                      <Grid templateColumns="repeat(2, 1fr)" gap={2} mb={3}>
                        {/* Single Fraction Column */}
                        <VStack spacing={2}>
                          {Object.entries(regimenPresets).filter(([, r]) => r.fractions === 1).map(([key, r]) => (
                            <Button
                              key={key}
                              size="sm"
                              width="100%"
                              colorScheme={watchRegimen === key ? 'blue' : 'gray'}
                              variant={watchRegimen === key ? 'solid' : 'outline'}
                              onClick={() => selectRegimen(key)}
                              color={watchRegimen === key ? 'white' : 'gray.300'}
                              borderColor={watchRegimen === key ? 'blue.500' : 'gray.600'}
                              _hover={{ borderColor: watchRegimen === key ? 'blue.400' : 'gray.500' }}
                            >
                              {r.dose}/{r.fractions}
                            </Button>
                          ))}
                        </VStack>
                        
                        {/* Fractionated Column */}
                        <VStack spacing={2}>
                          {Object.entries(regimenPresets).filter(([, r]) => r.fractions > 1).map(([key, r]) => (
                            <VStack key={key} spacing={0} width="100%">
                              <Button
                                size="sm"
                                width="100%"
                                colorScheme={watchRegimen === key ? 'blue' : 'gray'}
                                variant={watchRegimen === key ? 'solid' : 'outline'}
                                onClick={() => selectRegimen(key)}
                                color={watchRegimen === key ? 'white' : 'gray.300'}
                                borderColor={watchRegimen === key ? 'blue.500' : 'gray.600'}
                                _hover={{ borderColor: watchRegimen === key ? 'blue.400' : 'gray.500' }}
                                borderBottomRadius={watchRegimen === key && showHVLSelection ? 0 : 'md'}
                              >
                                {r.dose}/{r.fractions}
                              </Button>
                              
                              {watchRegimen === key && showHVLSelection && (
                                <Box
                                  width="100%"
                                  bg="blue.900"
                                  borderBottomRadius="md"
                                  borderLeft="1px"
                                  borderRight="1px"
                                  borderBottom="1px"
                                  borderColor="blue.500"
                                  p={2}
                                >
                                  <HStack spacing={1}>
                                    {(activeProfile?.module_presets?.tbi?.hvl_options || ['1 HVL', '2 HVL', '3 HVL']).map((hvl) => (
                                      <Button
                                        key={hvl}
                                        size="xs"
                                        flex={1}
                                        onClick={() => selectHVL(hvl)}
                                        colorScheme={watch('tbi_data.lung_blocks') === hvl ? 'green' : 'gray'}
                                        variant={watch('tbi_data.lung_blocks') === hvl ? 'solid' : 'outline'}
                                        color={watch('tbi_data.lung_blocks') === hvl ? 'white' : 'gray.300'}
                                        borderColor="gray.600"
                                        _hover={{ bg: watch('tbi_data.lung_blocks') === hvl ? 'green.600' : 'gray.700' }}
                                      >
                                        {hvl}
                                      </Button>
                                    ))}
                                  </HStack>
                                </Box>
                              )}
                            </VStack>
                          ))}
                        </VStack>
                      </Grid>
                    )}
                    
                    {isCustomRx && (
                      <Grid templateColumns="repeat(2, 1fr)" gap={2} mb={3}>
                        <Input
                          size="sm"
                          type="number"
                          step="any"
                          {...register("tbi_data.prescription_dose", { 
                            required: "Dose is required",
                            min: { value: 0.1, message: "Dose must be greater than 0" }
                          })}
                          placeholder="Rx (Gy)"
                          bg="gray.700"
                          borderColor="gray.600"
                          color="white"
                          _hover={{ borderColor: "gray.500" }}
                          _focus={{ borderColor: "blue.500" }}
                          _placeholder={{ color: "gray.400" }}
                        />
                        <Input
                          size="sm"
                          type="number"
                          step="1"
                          {...register("tbi_data.fractions", { 
                            required: "Fractions is required",
                            min: { value: 1, message: "Minimum 1 fraction" }
                          })}
                          placeholder="Fx"
                          bg="gray.700"
                          borderColor="gray.600"
                          color="white"
                          _hover={{ borderColor: "gray.500" }}
                          _focus={{ borderColor: "blue.500" }}
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
                    
                    <FormErrorMessage fontSize="xs" sx={{ color: 'red.300' }}>
                      {errors.tbi_data?.regimen?.message}
                    </FormErrorMessage>
                  </FormControl>

                  <FormControl isInvalid={errors.tbi_data?.setup}>
                    <FormLabel fontSize="sm" color="gray.300">Beam Setup</FormLabel>
                    <HStack spacing={2}>
                      {(activeProfile?.module_presets?.tbi?.setup_options || ['AP/PA', 'Lateral']).map(option => (
                        <Button
                          key={option}
                          size="sm"
                          flex="1"
                          colorScheme={watchSetup === option ? 'blue' : 'gray'}
                          variant={watchSetup === option ? 'solid' : 'outline'}
                          onClick={() => setValue('tbi_data.setup', option, { shouldValidate: true })}
                          color={watchSetup === option ? 'white' : 'gray.300'}
                          borderColor={watchSetup === option ? 'blue.500' : 'gray.600'}
                          _hover={{ borderColor: watchSetup === option ? 'blue.400' : 'gray.500' }}
                        >
                          {option}
                        </Button>
                      ))}
                    </HStack>
                    <FormErrorMessage fontSize="xs" sx={{ color: 'red.300' }}>
                      {errors.tbi_data?.setup?.message}
                    </FormErrorMessage>
                  </FormControl>

                </VStack>
              </GridItem>

              {/* Third Column - Hidden (kept for layout consistency) */}
              <GridItem
                p={4}
                borderWidth="0"
                borderRadius="md"
                bg="transparent"
              >
                {/* Empty - lung blocks now inline with fractionation selection */}
              </GridItem>
            </Grid>

            {/* Hidden inputs for all button-selected values */}
            <input type="hidden" {...register('tbi_data.regimen', { required: 'Please select a fractionation regimen' })} />
            <input type="hidden" {...register('tbi_data.setup', { required: 'Setup is required' })} />
            <input type="hidden" {...register('tbi_data.lung_blocks', { required: 'Please select lung block option' })} />
            <input type="hidden" {...register('tbi_data.prescription_dose', { required: true })} />
            <input type="hidden" {...register('tbi_data.fractions', { required: true })} />

            {/* Action Buttons */}
            <Flex gap={4} mb={6}>
              <Button
                type="submit"
                colorScheme="green"
                width="100%"
                size="md"
                shadow="md"
                isLoading={loading}
                loadingText="Generating..."
              >
                Generate Write-up
              </Button>
              <Button
                type="button"
                variant="outline"
                colorScheme="red"
                width="auto"
                size="md"
                color="red.300"
                borderColor="red.600"
                _hover={{ bg: "red.800", borderColor: "red.400" }}
                onClick={handleReset}
              >
                Reset Form
              </Button>
            </Flex>

            <WriteupPanel writeup={writeup} />
          </form>
        </Box>
      </Box>
    </Box>
  );
};

export default TBIForm;

