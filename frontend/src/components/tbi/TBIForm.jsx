import React, { useState, useEffect } from 'react';
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
import tbiService from '../../services/tbiService';

const TBIForm = () => {
  // State variables
  const [loading, setLoading] = useState(false);
  const [writeup, setWriteup] = useState('');
  const toast = useToast();
  const [physicians, setPhysicians] = useState(['Dalwadi', 'Galvan', 'Ha', 'Kluwe', 'Le', 'Lewis', 'Tuli']);
  const [physicists, setPhysicists] = useState(['Bassiri', 'Kirby', 'Papanikolaou', 'Paschal', 'Rasmussen']);
  
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
      tbi_data: {
        regimen: '',
        prescription_dose: '',
        fractions: '',
        setup: '',
        lung_blocks: '',
        energy: '6 MV',
        dose_rate_range: '10 - 15 cGy/min',
        machine_dose_rate: '200 MU/min'
      }
    }
  });

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
      const response = await tbiService.generateWriteup({
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

  // Copy write-up to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(writeup);
    toast({
      title: 'Write-up copied to clipboard',
      status: 'success',
      duration: 2000,
    });
  };

  // Handle regimen selection and set dose/fractions
  const selectRegimen = (regimenKey) => {
    setValue('tbi_data.regimen', regimenKey, { shouldValidate: true });
    
    // Set dose and fractions based on regimen
    const regimens = {
      '2gy1fx': { dose: 2.0, fractions: 1, lungBlocks: 'none' },
      '4gy1fx': { dose: 4.0, fractions: 1, lungBlocks: 'none' },
      '12gy6fx': { dose: 12.0, fractions: 6, lungBlocks: null },
      '13.2gy8fx': { dose: 13.2, fractions: 8, lungBlocks: null }
    };
    
    if (regimens[regimenKey]) {
      setValue('tbi_data.prescription_dose', regimens[regimenKey].dose, { shouldValidate: true });
      setValue('tbi_data.fractions', regimens[regimenKey].fractions, { shouldValidate: true });
      
      // For single fraction: auto-set no lung blocks
      if (regimens[regimenKey].fractions === 1) {
        setValue('tbi_data.lung_blocks', 'none', { shouldValidate: true });
        setShowHVLSelection(false);
      } else {
        // For multi-fraction: show HVL selection
        setShowHVLSelection(true);
        // Don't auto-set lung_blocks, wait for user selection
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
                          <Button
                            size="sm"
                            width="100%"
                            colorScheme={watchRegimen === '2gy1fx' ? 'blue' : 'gray'}
                            variant={watchRegimen === '2gy1fx' ? 'solid' : 'outline'}
                            onClick={() => selectRegimen('2gy1fx')}
                            color={watchRegimen === '2gy1fx' ? 'white' : 'gray.300'}
                            borderColor={watchRegimen === '2gy1fx' ? 'blue.500' : 'gray.600'}
                            _hover={{ borderColor: watchRegimen === '2gy1fx' ? 'blue.400' : 'gray.500' }}
                          >
                            2/1
                          </Button>
                          <Button
                            size="sm"
                            width="100%"
                            colorScheme={watchRegimen === '4gy1fx' ? 'blue' : 'gray'}
                            variant={watchRegimen === '4gy1fx' ? 'solid' : 'outline'}
                            onClick={() => selectRegimen('4gy1fx')}
                            color={watchRegimen === '4gy1fx' ? 'white' : 'gray.300'}
                            borderColor={watchRegimen === '4gy1fx' ? 'blue.500' : 'gray.600'}
                            _hover={{ borderColor: watchRegimen === '4gy1fx' ? 'blue.400' : 'gray.500' }}
                          >
                            4/1
                          </Button>
                        </VStack>
                        
                        {/* Fractionated Column */}
                        <VStack spacing={2}>
                          <VStack spacing={0} width="100%">
                            <Button
                              size="sm"
                              width="100%"
                              colorScheme={watchRegimen === '12gy6fx' ? 'blue' : 'gray'}
                              variant={watchRegimen === '12gy6fx' ? 'solid' : 'outline'}
                              onClick={() => selectRegimen('12gy6fx')}
                              color={watchRegimen === '12gy6fx' ? 'white' : 'gray.300'}
                              borderColor={watchRegimen === '12gy6fx' ? 'blue.500' : 'gray.600'}
                              _hover={{ borderColor: watchRegimen === '12gy6fx' ? 'blue.400' : 'gray.500' }}
                              borderBottomRadius={watchRegimen === '12gy6fx' && showHVLSelection ? 0 : 'md'}
                            >
                              12/6
                            </Button>
                            
                            {/* HVL Selection for 6fx */}
                            {watchRegimen === '12gy6fx' && showHVLSelection && (
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
                                  {['1 HVL', '2 HVL', '3 HVL'].map((hvl) => (
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
                          
                          <VStack spacing={0} width="100%">
                            <Button
                              size="sm"
                              width="100%"
                              colorScheme={watchRegimen === '13.2gy8fx' ? 'blue' : 'gray'}
                              variant={watchRegimen === '13.2gy8fx' ? 'solid' : 'outline'}
                              onClick={() => selectRegimen('13.2gy8fx')}
                              color={watchRegimen === '13.2gy8fx' ? 'white' : 'gray.300'}
                              borderColor={watchRegimen === '13.2gy8fx' ? 'blue.500' : 'gray.600'}
                              _hover={{ borderColor: watchRegimen === '13.2gy8fx' ? 'blue.400' : 'gray.500' }}
                              borderBottomRadius={watchRegimen === '13.2gy8fx' && showHVLSelection ? 0 : 'md'}
                            >
                              13.2/8
                            </Button>
                            
                            {/* HVL Selection for 8fx */}
                            {watchRegimen === '13.2gy8fx' && showHVLSelection && (
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
                                  {['1 HVL', '2 HVL', '3 HVL'].map((hvl) => (
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
                      <Button
                        size="sm"
                        flex="1"
                        colorScheme={watchSetup === 'AP/PA' ? 'blue' : 'gray'}
                        variant={watchSetup === 'AP/PA' ? 'solid' : 'outline'}
                        onClick={() => setValue('tbi_data.setup', 'AP/PA', { shouldValidate: true })}
                        color={watchSetup === 'AP/PA' ? 'white' : 'gray.300'}
                        borderColor={watchSetup === 'AP/PA' ? 'blue.500' : 'gray.600'}
                        _hover={{ borderColor: watchSetup === 'AP/PA' ? 'blue.400' : 'gray.500' }}
                      >
                        AP/PA
                      </Button>
                      <Button
                        size="sm"
                        flex="1"
                        colorScheme={watchSetup === 'Lateral' ? 'blue' : 'gray'}
                        variant={watchSetup === 'Lateral' ? 'solid' : 'outline'}
                        onClick={() => setValue('tbi_data.setup', 'Lateral', { shouldValidate: true })}
                        color={watchSetup === 'Lateral' ? 'white' : 'gray.300'}
                        borderColor={watchSetup === 'Lateral' ? 'blue.500' : 'gray.600'}
                        _hover={{ borderColor: watchSetup === 'Lateral' ? 'blue.400' : 'gray.500' }}
                      >
                        Lateral
                      </Button>
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

            {/* Write-up Display Section */}
            {writeup && (
              <Box
                p={4}
                borderWidth="1px"
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
                  color="white"
                  borderColor="gray.600"
                  fontSize="sm"
                  lineHeight="1"
                  _hover={{ borderColor: 'gray.500' }}
                  sx={{ fontFamily: '"Aseprite", monospace !important' }}
                />
              </Box>
            )}
          </form>
        </Box>
      </Box>
    </Box>
  );
};

export default TBIForm;

