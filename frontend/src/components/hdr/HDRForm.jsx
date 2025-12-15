import React, { useState } from 'react';
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
  Flex,
  VStack
} from '@chakra-ui/react';
import hdrService from '../../services/hdrService';

const HDRForm = () => {
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
      hdr_data: {
        applicator_type: '',
        treatment_site: '',
        number_of_channels: ''
      }
    }
  });

  // Watch values
  const watchApplicator = watch('hdr_data.applicator_type');
  
  // Handle form submission
  const onSubmit = async (data) => {
    setLoading(true);
    
    try {
      const response = await hdrService.generateWriteup({
        common_info: data.common_info,
        hdr_data: data.hdr_data
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

  return (
    <Box bg="gray.900" minH="100vh">
      {/* Header */}
      <Box bg="green.900" color="white" p={6} mb={6} borderRadius="lg" border="1px" borderColor="green.700">
        <Flex justify="space-between" align="center" flexWrap="wrap" gap={4}>
          <Box>
            <Heading size="md" mb={2}>HDR Write-up Generator</Heading>
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

                  <FormControl isInvalid={errors.common_info?.physician?.name} mb={3}>
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

                  <FormControl isInvalid={errors.common_info?.physicist?.name} mb={3}>
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

              {/* Applicator Selection Section */}
              <GridItem
                p={4}
                borderWidth="1px"
                borderRadius="md"
                bg={formBg}
                borderColor={borderColor}
                boxShadow="sm"
              >
                <Heading size="sm" mb={3} textAlign="center" color="white">Applicator Selection</Heading>

                <VStack spacing={3} align="stretch">
                  <FormControl isInvalid={errors.hdr_data?.applicator_type}>
                    <FormLabel fontSize="sm" color="gray.300">Select Applicator & Site</FormLabel>
                    <Grid templateColumns="repeat(2, 1fr)" gap={2}>
                      {/* First Row */}
                      <Button
                        size="sm"
                        variant={watchApplicator === 'VC' ? 'solid' : 'outline'}
                        colorScheme={watchApplicator === 'VC' ? 'blue' : 'gray'}
                        onClick={() => {
                          setValue('hdr_data.applicator_type', 'VC', { shouldValidate: true });
                          setValue('hdr_data.treatment_site', 'gynecological');
                          setValue('hdr_data.number_of_channels', 1, { shouldValidate: true });
                        }}
                        color={watchApplicator === 'VC' ? 'white' : 'gray.300'}
                        borderColor="gray.600"
                        _hover={{
                          bg: watchApplicator === 'VC' ? 'blue.600' : 'gray.700',
                          borderColor: watchApplicator === 'VC' ? 'blue.300' : 'gray.500'
                        }}
                      >
                        VC
                      </Button>
                      <Button
                        size="sm"
                        variant={watchApplicator === 'T&O' ? 'solid' : 'outline'}
                        colorScheme={watchApplicator === 'T&O' ? 'blue' : 'gray'}
                        onClick={() => {
                          setValue('hdr_data.applicator_type', 'T&O', { shouldValidate: true });
                          setValue('hdr_data.treatment_site', 'gynecological');
                          setValue('hdr_data.number_of_channels', 3, { shouldValidate: true });
                        }}
                        color={watchApplicator === 'T&O' ? 'white' : 'gray.300'}
                        borderColor="gray.600"
                        _hover={{
                          bg: watchApplicator === 'T&O' ? 'blue.600' : 'gray.700',
                          borderColor: watchApplicator === 'T&O' ? 'blue.300' : 'gray.500'
                        }}
                      >
                        T&O
                      </Button>

                      {/* Second Row */}
                      <Button
                        size="sm"
                        variant={watchApplicator === 'Utrecht' ? 'solid' : 'outline'}
                        colorScheme={watchApplicator === 'Utrecht' ? 'blue' : 'gray'}
                        onClick={() => {
                          setValue('hdr_data.applicator_type', 'Utrecht', { shouldValidate: true });
                          setValue('hdr_data.treatment_site', 'gynecological');
                          setValue('hdr_data.number_of_channels', '', { shouldValidate: false });
                        }}
                        color={watchApplicator === 'Utrecht' ? 'white' : 'gray.300'}
                        borderColor="gray.600"
                        _hover={{
                          bg: watchApplicator === 'Utrecht' ? 'blue.600' : 'gray.700',
                          borderColor: watchApplicator === 'Utrecht' ? 'blue.300' : 'gray.500'
                        }}
                      >
                        Utrecht
                      </Button>
                      <Button
                        size="sm"
                        variant={watchApplicator === 'GENEVA' ? 'solid' : 'outline'}
                        colorScheme={watchApplicator === 'GENEVA' ? 'blue' : 'gray'}
                        onClick={() => {
                          setValue('hdr_data.applicator_type', 'GENEVA', { shouldValidate: true });
                          setValue('hdr_data.treatment_site', 'gynecological');
                          setValue('hdr_data.number_of_channels', '', { shouldValidate: false });
                        }}
                        color={watchApplicator === 'GENEVA' ? 'white' : 'gray.300'}
                        borderColor="gray.600"
                        _hover={{
                          bg: watchApplicator === 'GENEVA' ? 'blue.600' : 'gray.700',
                          borderColor: watchApplicator === 'GENEVA' ? 'blue.300' : 'gray.500'
                        }}
                      >
                        GENEVA
                      </Button>

                      {/* Third Row - SYED options */}
                      <Button
                        size="sm"
                        variant={watchApplicator === 'SYED-Gyn' ? 'solid' : 'outline'}
                        colorScheme={watchApplicator === 'SYED-Gyn' ? 'blue' : 'gray'}
                        onClick={() => {
                          setValue('hdr_data.applicator_type', 'SYED-Gyn', { shouldValidate: true });
                          setValue('hdr_data.treatment_site', 'gynecological');
                          setValue('hdr_data.number_of_channels', '', { shouldValidate: false });
                        }}
                        color={watchApplicator === 'SYED-Gyn' ? 'white' : 'gray.300'}
                        borderColor="gray.600"
                        _hover={{
                          bg: watchApplicator === 'SYED-Gyn' ? 'blue.600' : 'gray.700',
                          borderColor: watchApplicator === 'SYED-Gyn' ? 'blue.300' : 'gray.500'
                        }}
                      >
                        SYED Gyn
                      </Button>
                      <Button
                        size="sm"
                        variant={watchApplicator === 'SYED-Prostate' ? 'solid' : 'outline'}
                        colorScheme={watchApplicator === 'SYED-Prostate' ? 'blue' : 'gray'}
                        onClick={() => {
                          setValue('hdr_data.applicator_type', 'SYED-Prostate', { shouldValidate: true });
                          setValue('hdr_data.treatment_site', 'prostate');
                          setValue('hdr_data.number_of_channels', '', { shouldValidate: false });
                        }}
                        color={watchApplicator === 'SYED-Prostate' ? 'white' : 'gray.300'}
                        borderColor="gray.600"
                        _hover={{
                          bg: watchApplicator === 'SYED-Prostate' ? 'blue.600' : 'gray.700',
                          borderColor: watchApplicator === 'SYED-Prostate' ? 'blue.300' : 'gray.500'
                        }}
                      >
                        SYED Prostate
                      </Button>
                    </Grid>
                    <FormErrorMessage fontSize="xs" sx={{ color: 'red.300' }}>
                      {errors.hdr_data?.applicator_type?.message}
                    </FormErrorMessage>
                  </FormControl>
                </VStack>
              </GridItem>

              {/* Third Column - Treatment Parameters */}
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
                  <FormControl isInvalid={errors.hdr_data?.number_of_channels}>
                    <FormLabel fontSize="sm" color="gray.300">Number of Channels</FormLabel>
                    <Input
                      type="number"
                      size="sm"
                      {...register('hdr_data.number_of_channels', {
                        required: 'Number of channels is required',
                        min: { value: 1, message: 'Must be at least 1' },
                        max: { value: 30, message: 'Must be 30 or less' }
                      })}
                      placeholder={!watchApplicator ? 'Select applicator first' : ''}
                      isDisabled={!watchApplicator}
                      readOnly={watchApplicator === 'VC' || watchApplicator === 'T&O'}
                      bg={!watchApplicator ? 'gray.800' : 'gray.700'}
                      borderColor="gray.600"
                      color={!watchApplicator || watchApplicator === 'VC' || watchApplicator === 'T&O' ? 'gray.400' : 'white'}
                      _hover={{ borderColor: watchApplicator ? 'gray.500' : 'gray.600' }}
                      _placeholder={{ color: 'gray.500' }}
                      _disabled={{ bg: 'gray.800', cursor: 'not-allowed', opacity: 0.6 }}
                      cursor={!watchApplicator || watchApplicator === 'VC' || watchApplicator === 'T&O' ? 'not-allowed' : 'text'}
                    />
                    <FormErrorMessage fontSize="xs" sx={{ color: 'red.300' }}>
                      {errors.hdr_data?.number_of_channels?.message}
                    </FormErrorMessage>
                  </FormControl>
                </VStack>
              </GridItem>
            </Grid>

            {/* Hidden input for applicator type validation */}
            <input type="hidden" {...register('hdr_data.applicator_type', { required: 'Applicator is required' })} />

            {/* Buttons */}
            <Flex gap={4} mb={6}>
              <Button
                type="submit"
                colorScheme="green"
                width="100%"
                size="md"
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
                width="auto"
                size="md"
                onClick={handleReset}
                color="red.300"
                borderColor="red.600"
                _hover={{ bg: "red.900", borderColor: "red.500" }}
              >
                Reset Form
              </Button>
            </Flex>
          </form>

          {/* Write-up Section */}
          {writeup && (
            <Box
              p={6}
              borderWidth="1px"
              borderRadius="md"
              bg={writeupBg}
              borderColor={borderColor}
              boxShadow="md"
            >
              <Flex justify="space-between" align="center" mb={4}>
                <Heading size="md" color="white">Generated Write-up</Heading>
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
                minH="300px"
                bg="gray.700"
                color="white"
                borderColor="gray.600"
                fontSize="sm"
                lineHeight="1"
                sx={{ fontFamily: '"Aseprite", monospace !important' }}
              />
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default HDRForm;

