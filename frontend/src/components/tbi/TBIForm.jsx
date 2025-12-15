import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
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
  HStack
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
  const { register, handleSubmit, watch, formState: { errors }, setValue, reset } = useForm({
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
  const watchLungBlocks = watch('tbi_data.lung_blocks');
  
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
      '2gy1fx': { dose: 2.0, fractions: 1 },
      '4gy1fx': { dose: 4.0, fractions: 1 },
      '12gy6fx': { dose: 12.0, fractions: 6 },
      '13.2gy8fx': { dose: 13.2, fractions: 8 }
    };
    
    if (regimens[regimenKey]) {
      setValue('tbi_data.prescription_dose', regimens[regimenKey].dose, { shouldValidate: true });
      setValue('tbi_data.fractions', regimens[regimenKey].fractions, { shouldValidate: true });
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
                <VStack spacing={3} align="stretch">
                  <FormControl isInvalid={errors.common_info?.physician?.name}>
                    <FormLabel fontSize="sm" color="gray.300">Physician Name</FormLabel>
                    <Select
                      size="sm"
                      {...register('common_info.physician.name', { required: 'Physician is required' })}
                      placeholder=""
                      aria-label="Select physician"
                      bg="gray.700"
                      borderColor="gray.600"
                      color="white"
                      _hover={{ borderColor: 'gray.500' }}
                      data-theme="dark"
                      sx={{ '& option': { backgroundColor: 'gray.700', color: 'white' }}}
                    >
                      {physicians.map((physician) => (
                        <option key={physician} value={physician} style={{ backgroundColor: '#2D3748', color: 'white' }}>
                          {physician}
                        </option>
                      ))}
                    </Select>
                    <FormErrorMessage fontSize="xs" sx={{ color: 'red.300' }}>
                      {errors.common_info?.physician?.name?.message}
                    </FormErrorMessage>
                  </FormControl>

                  <FormControl isInvalid={errors.common_info?.physicist?.name}>
                    <FormLabel fontSize="sm" color="gray.300">Physicist Name</FormLabel>
                    <Select
                      size="sm"
                      {...register('common_info.physicist.name', { required: 'Physicist is required' })}
                      placeholder=""
                      aria-label="Select physicist"
                      bg="gray.700"
                      borderColor="gray.600"
                      color="white"
                      _hover={{ borderColor: 'gray.500' }}
                      data-theme="dark"
                      sx={{ '& option': { backgroundColor: 'gray.700', color: 'white' }}}
                    >
                      {physicists.map((physicist) => (
                        <option key={physicist} value={physicist} style={{ backgroundColor: '#2D3748', color: 'white' }}>
                          {physicist}
                        </option>
                      ))}
                    </Select>
                    <FormErrorMessage fontSize="xs" sx={{ color: 'red.300' }}>
                      {errors.common_info?.physicist?.name?.message}
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
                    <FormLabel fontSize="sm" color="gray.300" mb={2}>Fractionation Regimen</FormLabel>
                    <Grid templateColumns="repeat(2, 1fr)" gap={2}>
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
                          2 Gy / 1 fx
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
                          4 Gy / 1 fx
                        </Button>
                      </VStack>
                      
                      {/* Fractionated Column */}
                      <VStack spacing={2}>
                        <Button
                          size="sm"
                          width="100%"
                          colorScheme={watchRegimen === '12gy6fx' ? 'blue' : 'gray'}
                          variant={watchRegimen === '12gy6fx' ? 'solid' : 'outline'}
                          onClick={() => selectRegimen('12gy6fx')}
                          color={watchRegimen === '12gy6fx' ? 'white' : 'gray.300'}
                          borderColor={watchRegimen === '12gy6fx' ? 'blue.500' : 'gray.600'}
                          _hover={{ borderColor: watchRegimen === '12gy6fx' ? 'blue.400' : 'gray.500' }}
                        >
                          12 Gy / 6 fx
                        </Button>
                        <Button
                          size="sm"
                          width="100%"
                          colorScheme={watchRegimen === '13.2gy8fx' ? 'blue' : 'gray'}
                          variant={watchRegimen === '13.2gy8fx' ? 'solid' : 'outline'}
                          onClick={() => selectRegimen('13.2gy8fx')}
                          color={watchRegimen === '13.2gy8fx' ? 'white' : 'gray.300'}
                          borderColor={watchRegimen === '13.2gy8fx' ? 'blue.500' : 'gray.600'}
                          _hover={{ borderColor: watchRegimen === '13.2gy8fx' ? 'blue.400' : 'gray.500' }}
                        >
                          13.2 Gy / 8 fx
                        </Button>
                      </VStack>
                    </Grid>
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

              {/* Lung Blocks Section */}
              <GridItem
                p={4}
                borderWidth="1px"
                borderRadius="md"
                bg={formBg}
                borderColor={borderColor}
                boxShadow="sm"
              >
                <Heading size="sm" mb={3} textAlign="center" color="white">Lung Blocks</Heading>

                <VStack spacing={3} align="stretch">
                  <FormControl isInvalid={errors.tbi_data?.lung_blocks}>
                    <FormLabel fontSize="sm" color="gray.300" mb={2}>Select Lung Block Thickness</FormLabel>
                    <Grid templateColumns="repeat(2, 1fr)" gap={2}>
                      <Button
                        size="sm"
                        width="100%"
                        colorScheme={watchLungBlocks === 'none' ? 'blue' : 'gray'}
                        variant={watchLungBlocks === 'none' ? 'solid' : 'outline'}
                        onClick={() => setValue('tbi_data.lung_blocks', 'none', { shouldValidate: true })}
                        color={watchLungBlocks === 'none' ? 'white' : 'gray.300'}
                        borderColor={watchLungBlocks === 'none' ? 'blue.500' : 'gray.600'}
                        _hover={{ borderColor: watchLungBlocks === 'none' ? 'blue.400' : 'gray.500' }}
                      >
                        None
                      </Button>
                      <Button
                        size="sm"
                        width="100%"
                        colorScheme={watchLungBlocks === '1 HVL' ? 'blue' : 'gray'}
                        variant={watchLungBlocks === '1 HVL' ? 'solid' : 'outline'}
                        onClick={() => setValue('tbi_data.lung_blocks', '1 HVL', { shouldValidate: true })}
                        color={watchLungBlocks === '1 HVL' ? 'white' : 'gray.300'}
                        borderColor={watchLungBlocks === '1 HVL' ? 'blue.500' : 'gray.600'}
                        _hover={{ borderColor: watchLungBlocks === '1 HVL' ? 'blue.400' : 'gray.500' }}
                      >
                        1 HVL
                      </Button>
                      <Button
                        size="sm"
                        width="100%"
                        colorScheme={watchLungBlocks === '2 HVL' ? 'blue' : 'gray'}
                        variant={watchLungBlocks === '2 HVL' ? 'solid' : 'outline'}
                        onClick={() => setValue('tbi_data.lung_blocks', '2 HVL', { shouldValidate: true })}
                        color={watchLungBlocks === '2 HVL' ? 'white' : 'gray.300'}
                        borderColor={watchLungBlocks === '2 HVL' ? 'blue.500' : 'gray.600'}
                        _hover={{ borderColor: watchLungBlocks === '2 HVL' ? 'blue.400' : 'gray.500' }}
                      >
                        2 HVL
                      </Button>
                      <Button
                        size="sm"
                        width="100%"
                        colorScheme={watchLungBlocks === '3 HVL' ? 'blue' : 'gray'}
                        variant={watchLungBlocks === '3 HVL' ? 'solid' : 'outline'}
                        onClick={() => setValue('tbi_data.lung_blocks', '3 HVL', { shouldValidate: true })}
                        color={watchLungBlocks === '3 HVL' ? 'white' : 'gray.300'}
                        borderColor={watchLungBlocks === '3 HVL' ? 'blue.500' : 'gray.600'}
                        _hover={{ borderColor: watchLungBlocks === '3 HVL' ? 'blue.400' : 'gray.500' }}
                      >
                        3 HVL
                      </Button>
                    </Grid>
                    <FormErrorMessage fontSize="xs" sx={{ color: 'red.300' }}>
                      {errors.tbi_data?.lung_blocks?.message}
                    </FormErrorMessage>
                  </FormControl>
                </VStack>
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

