import React, { useState, useEffect } from 'react';
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
  Badge,
  Flex,
  NumberInput,
  NumberInputField,
  VStack,
  HStack,
  Card,
  CardBody,
  Checkbox,
  Tag
} from '@chakra-ui/react';
import hdrService from '../../services/hdrService';

const HDRForm = () => {
  // State variables
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [writeup, setWriteup] = useState('');
  const [applicators, setApplicators] = useState([]);
  const toast = useToast();
  const [physicians, setPhysicians] = useState(['Dalwadi', 'Galvan', 'Ha', 'Kluwe', 'Le', 'Lewis', 'Newman']);
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
        treatment_site: 'gynecological',
        patient_position: 'supine',
        implant_date: '',
        ct_slice_thickness: 2.5,
        number_of_channels: 1,
        afterloader: 'ELEKTA Ir-192 remote afterloader',
        source_type: 'Ir-192',
        planning_system: 'Oncentra',
        critical_structures: ['bladder', 'rectum', 'intestines', 'sigmoid'],
        survey_reading: '0.2'
      }
    }
  });

  // Watch values for preview and auto-updates
  const watchApplicator = watch('hdr_data.applicator_type');
  const watchPosition = watch('hdr_data.patient_position');
  const watchChannels = watch('hdr_data.number_of_channels');
  const watchTreatmentSite = watch('hdr_data.treatment_site');
  
  // Load initial data
  useEffect(() => {
    const fetchInitialData = async () => {
      setInitialLoading(true);
      try {
        const applicatorsData = await hdrService.getApplicators();
        setApplicators(applicatorsData);
      } catch (error) {
        toast({
          title: 'Error loading data',
          description: error.message,
          status: 'error',
          duration: 5000,
        });
      } finally {
        setInitialLoading(false);
      }
    };

    fetchInitialData();
  }, []);
  
  // Update position and channels when applicator changes
  useEffect(() => {
    const updateApplicatorDefaults = async () => {
      if (watchApplicator) {
        try {
          const info = await hdrService.getApplicatorInfo(watchApplicator);
          setValue('hdr_data.patient_position', info.position || 'supine');
          setValue('hdr_data.number_of_channels', info.channels || 1);
        } catch (error) {
          console.error('Error fetching applicator info:', error);
        }
      }
    };

    updateApplicatorDefaults();
  }, [watchApplicator, setValue]);
  
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

  // Helper function to format numbers cleanly
  const formatNumber = (value, decimals = 1) => {
    if (value === null || value === undefined || value === '') return '---';
    const num = parseFloat(value);
    if (isNaN(num)) return '---';
    
    let formatted = num.toFixed(decimals).replace(/\.?0+$/, '');
    return formatted;
  };

  if (initialLoading) {
    return (
      <Box bg="gray.900" minH="100vh" textAlign="center" p={5}>
        <Text fontSize="lg" mb={2} color="white">Loading HDR form data...</Text>
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
            <Heading size="xl" mb={2}>HDR Write-up Generator</Heading>
            <Text opacity={0.9}>Generate standardized write-up for HDR brachytherapy</Text>
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
              {/* Staff & Patient Section */}
              <GridItem
                p={4}
                borderWidth="1px"
                borderRadius="md"
                bg={formBg}
                borderColor={borderColor}
                boxShadow="sm"
              >
                <Heading size="sm" mb={3} textAlign="center" color="white">Staff & Patient</Heading>

                <Box>
                  <Heading size="xs" mb={2} color="gray.300">Staff Information</Heading>

                  <FormControl isInvalid={errors.common_info?.physician?.name} mb={3}>
                    <FormLabel fontSize="sm" color="gray.300">Physician Name</FormLabel>
                    <Select
                      size="sm"
                      {...register('common_info.physician.name', { required: 'Physician is required' })}
                      placeholder="Select physician"
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
                          Dr. {physician}
                        </option>
                      ))}
                    </Select>
                    <FormErrorMessage fontSize="xs">
                      {errors.common_info?.physician?.name?.message}
                    </FormErrorMessage>
                  </FormControl>

                  <FormControl isInvalid={errors.common_info?.physicist?.name} mb={3}>
                    <FormLabel fontSize="sm" color="gray.300">Physicist Name</FormLabel>
                    <Select
                      size="sm"
                      {...register('common_info.physicist.name', { required: 'Physicist is required' })}
                      placeholder="Select physicist"
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
                          Dr. {physicist}
                        </option>
                      ))}
                    </Select>
                    <FormErrorMessage fontSize="xs">
                      {errors.common_info?.physicist?.name?.message}
                    </FormErrorMessage>
                  </FormControl>
                </Box>
              </GridItem>

              {/* Treatment Details Section */}
              <GridItem
                p={4}
                borderWidth="1px"
                borderRadius="md"
                bg={formBg}
                borderColor={borderColor}
                boxShadow="sm"
              >
                <Heading size="sm" mb={3} textAlign="center" color="white">Treatment Details</Heading>

                <VStack spacing={3} align="stretch">
                  <FormControl isInvalid={errors.hdr_data?.applicator_type}>
                    <FormLabel fontSize="sm" color="gray.300">Applicator Type</FormLabel>
                    <Select
                      size="sm"
                      {...register('hdr_data.applicator_type', { required: 'Applicator is required' })}
                      placeholder="Select applicator"
                      aria-label="Applicator type"
                      bg="gray.700"
                      borderColor="gray.600"
                      color="white"
                      _hover={{ borderColor: 'gray.500' }}
                      data-theme="dark"
                      sx={{ '& option': { backgroundColor: 'gray.700', color: 'white' }}}
                    >
                      {applicators.map((applicator) => (
                        <option key={applicator} value={applicator} style={{ backgroundColor: '#2D3748', color: 'white' }}>
                          {applicator}
                        </option>
                      ))}
                    </Select>
                    <FormErrorMessage fontSize="xs">
                      {errors.hdr_data?.applicator_type?.message}
                    </FormErrorMessage>
                  </FormControl>

                  <FormControl isInvalid={errors.hdr_data?.treatment_site}>
                    <FormLabel fontSize="sm" color="gray.300">Treatment Site</FormLabel>
                    <Select
                      size="sm"
                      {...register('hdr_data.treatment_site', { required: 'Treatment site is required' })}
                      bg="gray.700"
                      borderColor="gray.600"
                      color="white"
                      _hover={{ borderColor: 'gray.500' }}
                      data-theme="dark"
                      aria-label="Treatment site"
                      sx={{ '& option': { backgroundColor: 'gray.700', color: 'white' }}}
                    >
                      <option value="gynecological" style={{ backgroundColor: '#2D3748', color: 'white' }}>Gynecological</option>
                      <option value="prostate" style={{ backgroundColor: '#2D3748', color: 'white' }}>Prostate</option>
                    </Select>
                    <FormErrorMessage fontSize="xs">
                      {errors.hdr_data?.treatment_site?.message}
                    </FormErrorMessage>
                  </FormControl>

                  <FormControl isInvalid={errors.hdr_data?.implant_date}>
                    <FormLabel fontSize="sm" color="gray.300">Implant Date</FormLabel>
                    <Input
                      size="sm"
                      {...register('hdr_data.implant_date', { required: 'Implant date is required' })}
                      placeholder="e.g., October 17 or XXXX"
                      bg="gray.700"
                      borderColor="gray.600"
                      color="white"
                      _hover={{ borderColor: 'gray.500' }}
                      _placeholder={{ color: 'gray.400' }}
                    />
                    <FormErrorMessage fontSize="xs">
                      {errors.hdr_data?.implant_date?.message}
                    </FormErrorMessage>
                  </FormControl>

                  <FormControl isInvalid={errors.hdr_data?.patient_position}>
                    <FormLabel fontSize="sm" color="gray.300">Patient Position</FormLabel>
                    <Select
                      size="sm"
                      {...register('hdr_data.patient_position', { required: 'Position is required' })}
                      bg="gray.700"
                      borderColor="gray.600"
                      color="white"
                      _hover={{ borderColor: 'gray.500' }}
                      data-theme="dark"
                      aria-label="Patient position"
                      sx={{ '& option': { backgroundColor: 'gray.700', color: 'white' }}}
                    >
                      <option value="supine" style={{ backgroundColor: '#2D3748', color: 'white' }}>Supine</option>
                      <option value="lithotomy" style={{ backgroundColor: '#2D3748', color: 'white' }}>Lithotomy</option>
                    </Select>
                    <FormErrorMessage fontSize="xs">
                      {errors.hdr_data?.patient_position?.message}
                    </FormErrorMessage>
                  </FormControl>

                  <FormControl isInvalid={errors.hdr_data?.number_of_channels}>
                    <FormLabel fontSize="sm" color="gray.300">Number of Channels</FormLabel>
                    <NumberInput size="sm" min={1} max={30}>
                      <NumberInputField
                        {...register('hdr_data.number_of_channels', {
                          required: 'Number of channels is required',
                          min: { value: 1, message: 'Must be at least 1' },
                          max: { value: 30, message: 'Must be 30 or less' }
                        })}
                        placeholder="Enter channels"
                        bg="gray.700"
                        borderColor="gray.600"
                        color="white"
                        _hover={{ borderColor: 'gray.500' }}
                        _placeholder={{ color: 'gray.400' }}
                      />
                    </NumberInput>
                    <FormErrorMessage fontSize="xs">
                      {errors.hdr_data?.number_of_channels?.message}
                    </FormErrorMessage>
                  </FormControl>

                  <FormControl isInvalid={errors.hdr_data?.ct_slice_thickness}>
                    <FormLabel fontSize="sm" color="gray.300">CT Slice Thickness (mm)</FormLabel>
                    <NumberInput size="sm" min={0.5} max={10} step={0.5}>
                      <NumberInputField
                        {...register('hdr_data.ct_slice_thickness', {
                          required: 'CT slice thickness is required',
                          min: { value: 0.5, message: 'Must be at least 0.5 mm' }
                        })}
                        placeholder="Enter thickness"
                        bg="gray.700"
                        borderColor="gray.600"
                        color="white"
                        _hover={{ borderColor: 'gray.500' }}
                        _placeholder={{ color: 'gray.400' }}
                      />
                    </NumberInput>
                    <FormErrorMessage fontSize="xs">
                      {errors.hdr_data?.ct_slice_thickness?.message}
                    </FormErrorMessage>
                  </FormControl>
                </VStack>
              </GridItem>

              {/* Preview Section */}
              <GridItem
                p={4}
                borderWidth="1px"
                borderRadius="md"
                bg={formBg}
                borderColor={borderColor}
                boxShadow="sm"
              >
                <Heading size="sm" mb={3} textAlign="center" color="white">Preview</Heading>

                <Card bg="green.800" borderColor="green.600" mb={3}>
                  <CardBody>
                    <VStack align="start" spacing={2}>
                      <HStack>
                        <Text fontSize="sm" color="gray.300" fontWeight="bold">Applicator:</Text>
                        <Badge colorScheme="blue" fontSize="xs">
                          {watchApplicator || 'Not selected'}
                        </Badge>
                      </HStack>
                      
                      <HStack>
                        <Text fontSize="sm" color="gray.300" fontWeight="bold">Site:</Text>
                        <Badge colorScheme="purple" fontSize="xs">
                          {watchTreatmentSite || '---'}
                        </Badge>
                      </HStack>
                      
                      <HStack>
                        <Text fontSize="sm" color="gray.300" fontWeight="bold">Position:</Text>
                        <Badge colorScheme="orange" fontSize="xs">
                          {watchPosition || '---'}
                        </Badge>
                      </HStack>
                      
                      <HStack>
                        <Text fontSize="sm" color="gray.300" fontWeight="bold">Channels:</Text>
                        <Badge colorScheme="teal" fontSize="xs">
                          {formatNumber(watchChannels, 0)}
                        </Badge>
                      </HStack>
                    </VStack>
                  </CardBody>
                </Card>

                <Box
                  p={3}
                  bg="blue.900"
                  borderRadius="md"
                  borderWidth="1px"
                  borderColor="blue.700"
                >
                  <Text fontSize="sm" color="white" fontStyle="italic">
                    Write-up will include implant procedure, CT imaging, contouring, planning with customized dwell weightings, 
                    independent calculation verification, treatment delivery, and radiation surveys.
                  </Text>
                </Box>
              </GridItem>
            </Grid>

            {/* Equipment & Settings Section */}
            <Box
              p={4}
              borderWidth="1px"
              borderRadius="md"
              bg={formBg}
              borderColor={borderColor}
              boxShadow="sm"
              mb={6}
            >
              <Heading size="sm" mb={3} textAlign="center" color="white">Equipment & Settings</Heading>

              <Grid
                templateColumns={{
                  base: '1fr',
                  md: 'repeat(2, 1fr)',
                  lg: 'repeat(3, 1fr)'
                }}
                gap={4}
              >
                <FormControl>
                  <FormLabel fontSize="sm" color="gray.300">Afterloader</FormLabel>
                  <Input
                    size="sm"
                    {...register('hdr_data.afterloader')}
                    bg="gray.700"
                    borderColor="gray.600"
                    color="white"
                    _hover={{ borderColor: 'gray.500' }}
                    _placeholder={{ color: 'gray.400' }}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel fontSize="sm" color="gray.300">Planning System</FormLabel>
                  <Select
                    size="sm"
                    {...register('hdr_data.planning_system')}
                    bg="gray.700"
                    borderColor="gray.600"
                    color="white"
                    _hover={{ borderColor: 'gray.500' }}
                    data-theme="dark"
                    aria-label="Planning system"
                    sx={{ '& option': { backgroundColor: 'gray.700', color: 'white' }}}
                  >
                    <option value="Oncentra" style={{ backgroundColor: '#2D3748', color: 'white' }}>Oncentra</option>
                    <option value="Oncentra Brachy" style={{ backgroundColor: '#2D3748', color: 'white' }}>Oncentra Brachy</option>
                    <option value="BrachyVision" style={{ backgroundColor: '#2D3748', color: 'white' }}>BrachyVision</option>
                    <option value="Sagiplan" style={{ backgroundColor: '#2D3748', color: 'white' }}>Sagiplan</option>
                  </Select>
                </FormControl>

                <FormControl>
                  <FormLabel fontSize="sm" color="gray.300">Survey Reading (mR/hr)</FormLabel>
                  <Input
                    size="sm"
                    {...register('hdr_data.survey_reading')}
                    bg="gray.700"
                    borderColor="gray.600"
                    color="white"
                    _hover={{ borderColor: 'gray.500' }}
                    _placeholder={{ color: 'gray.400' }}
                  />
                </FormControl>
              </Grid>
            </Box>

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
                  colorScheme="blue"
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
                fontFamily="monospace"
                fontSize="sm"
                lineHeight="1.6"
              />
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default HDRForm;

