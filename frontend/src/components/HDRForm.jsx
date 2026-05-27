import React, { useState, useEffect, useContext } from 'react';
import { useForm, Controller } from 'react-hook-form';
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
import { generateHDRWriteup } from '../services/hdrService';
import { ClinicProfileContext } from '../pages/_app';
import WriteupPanel from './WriteupPanel';

const HDRForm = () => {
  const { activeProfile } = useContext(ClinicProfileContext);
  const [loading, setLoading] = useState(false);
  const [writeup, setWriteup] = useState('');
  const toast = useToast();
  const physicians = activeProfile?.physicians || [];
  const physicists = activeProfile?.physicists || [];
  const hdrFacilityDefaults = activeProfile?.facility_defaults?.hdr || {};
  
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
      hdr_data: {
        applicator_type: '',
        treatment_site: '',
        number_of_channels: '',
        afterloader: hdrFacilityDefaults.afterloader || 'ELEKTA Ir-192 remote afterloader',
        planning_system: hdrFacilityDefaults.planning_system || 'Oncentra',
        ct_slice_thickness: hdrFacilityDefaults.ct_slice_thickness || 3.0,
      }
    }
  });

  useEffect(() => {
    const defaults = activeProfile?.facility_defaults?.hdr || {};
    setValue('hdr_data.afterloader', defaults.afterloader || 'ELEKTA Ir-192 remote afterloader');
    setValue('hdr_data.planning_system', defaults.planning_system || 'Oncentra');
    setValue('hdr_data.ct_slice_thickness', defaults.ct_slice_thickness || 3.0);
  }, [activeProfile, setValue]);

  // Watch values
  const watchApplicator = watch('hdr_data.applicator_type');
  
  // Applicator presets from profile or fallback defaults
  const applicatorPresets = activeProfile?.module_presets?.hdr?.applicators || [
    { type: "VC", site: "gynecological", channels: 1 },
    { type: "T&O", site: "gynecological", channels: 3 },
    { type: "Hybrid T&O", site: "gynecological", channels: null },
    { type: "SYED-Gyn", site: "gynecological", channels: null },
    { type: "SYED-Prostate", site: "prostate", channels: null }
  ];

  // Get max channels based on applicator type
  const getMaxChannels = (applicatorType) => {
    switch(applicatorType) {
      case 'SYED-Prostate':
        return 19;
      case 'SYED-Gyn':
        return 55;
      case 'Hybrid T&O':
        return 13;
      default:
        return 30;
    }
  };
  
  // Handle form submission
  const onSubmit = async (data) => {
    setLoading(true);
    
    try {
      const response = await generateHDRWriteup({
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
                    <FormErrorMessage fontSize="xs" sx={{ color: 'red.300' }}>
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
                    <FormErrorMessage fontSize="xs" sx={{ color: 'red.300' }}>
                      {errors.common_info?.physician?.name?.message}
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
                      {applicatorPresets.map((app, idx) => (
                        <GridItem key={idx} colSpan={idx === 0 ? 2 : 1}>
                          <Button
                            size="sm"
                            width="100%"
                            variant={watchApplicator === app.type ? 'solid' : 'outline'}
                            colorScheme={watchApplicator === app.type ? 'blue' : 'gray'}
                            onClick={() => {
                              setValue('hdr_data.applicator_type', app.type, { shouldValidate: true });
                              setValue('hdr_data.treatment_site', app.site);
                              setValue('hdr_data.number_of_channels', app.channels || '', { shouldValidate: !!app.channels });
                            }}
                            color={watchApplicator === app.type ? 'white' : 'gray.300'}
                            borderColor="gray.600"
                            _hover={{
                              bg: watchApplicator === app.type ? 'blue.600' : 'gray.700',
                              borderColor: watchApplicator === app.type ? 'blue.300' : 'gray.500'
                            }}
                          >
                            {app.type}
                          </Button>
                        </GridItem>
                      ))}
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
                        max: { 
                          value: getMaxChannels(watchApplicator), 
                          message: `Must be ${getMaxChannels(watchApplicator)} or less` 
                        }
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

          <WriteupPanel writeup={writeup} minH="300px" />
        </Box>
      </Box>
    </Box>
  );
};

export default HDRForm;

