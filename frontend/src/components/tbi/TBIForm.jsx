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
  Switch
} from '@chakra-ui/react';
import tbiService from '../../services/tbiService';

const TBIForm = () => {
  // State variables
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [writeup, setWriteup] = useState('');
  const [fractionationSchemes, setFractionationSchemes] = useState([]);
  const [setupOptions, setSetupOptions] = useState([]);
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
      tbi_data: {
        diagnosis: '',
        indication: 'preparation for allogeneic stem cell transplant',
        prescription_dose: 12.0,
        fractions: 6,
        setup: 'AP/PA',
        lung_blocks: false,
        energy: '6 MV',
        dose_rate_range: '10 - 15 cGy/min',
        machine_dose_rate: '200 MU/min'
      }
    }
  });

  // Watch values for preview
  const watchPrescriptionDose = watch('tbi_data.prescription_dose');
  const watchFractions = watch('tbi_data.fractions');
  const watchSetup = watch('tbi_data.setup');
  const watchLungBlocks = watch('tbi_data.lung_blocks');
  
  // Load initial data
  useEffect(() => {
    const fetchInitialData = async () => {
      setInitialLoading(true);
      try {
        const [schemesData, setupData] = await Promise.all([
          tbiService.getFramentationSchemes(),
          tbiService.getSetupOptions()
        ]);
        setFractionationSchemes(schemesData);
        setSetupOptions(setupData);
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

  // Quick preset buttons for fractionation
  const applyPreset = (preset) => {
    setValue('tbi_data.prescription_dose', preset.dose);
    setValue('tbi_data.fractions', preset.fractions);
    toast({
      title: 'Preset applied',
      description: preset.description,
      status: 'info',
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
        <Text fontSize="lg" mb={2} color="white">Loading TBI form data...</Text>
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
            <Heading size="xl" mb={2}>TBI Write-up Generator</Heading>
            <Text opacity={0.9}>Generate standardized write-up for total body irradiation</Text>
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
                  <FormControl isInvalid={errors.tbi_data?.diagnosis}>
                    <FormLabel fontSize="sm" color="gray.300">Diagnosis</FormLabel>
                    <Input
                      size="sm"
                      {...register('tbi_data.diagnosis', { required: 'Diagnosis is required' })}
                      placeholder="e.g., acute lymphoblastic leukemia"
                      bg="gray.700"
                      borderColor="gray.600"
                      color="white"
                      _hover={{ borderColor: 'gray.500' }}
                      _placeholder={{ color: 'gray.400' }}
                    />
                    <FormErrorMessage fontSize="xs">
                      {errors.tbi_data?.diagnosis?.message}
                    </FormErrorMessage>
                  </FormControl>

                  <FormControl isInvalid={errors.tbi_data?.indication}>
                    <FormLabel fontSize="sm" color="gray.300">Indication</FormLabel>
                    <Select
                      size="sm"
                      {...register('tbi_data.indication', { required: 'Indication is required' })}
                      bg="gray.700"
                      borderColor="gray.600"
                      color="white"
                      _hover={{ borderColor: 'gray.500' }}
                      data-theme="dark"
                      aria-label="Treatment indication"
                      sx={{ '& option': { backgroundColor: 'gray.700', color: 'white' }}}
                    >
                      <option value="preparation for allogeneic stem cell transplant" style={{ backgroundColor: '#2D3748', color: 'white' }}>
                        Preparation for allogeneic stem cell transplant
                      </option>
                      <option value="preparation for autologous stem cell transplant" style={{ backgroundColor: '#2D3748', color: 'white' }}>
                        Preparation for autologous stem cell transplant
                      </option>
                      <option value="conditioning regimen" style={{ backgroundColor: '#2D3748', color: 'white' }}>
                        Conditioning regimen
                      </option>
                    </Select>
                    <FormErrorMessage fontSize="xs">
                      {errors.tbi_data?.indication?.message}
                    </FormErrorMessage>
                  </FormControl>

                  <Box>
                    <FormLabel fontSize="sm" color="gray.300" mb={2}>Quick Presets</FormLabel>
                    <Flex gap={2} flexWrap="wrap">
                      {fractionationSchemes.map((scheme, idx) => (
                        <Button
                          key={idx}
                          size="xs"
                          colorScheme="blue"
                          variant="outline"
                          onClick={() => applyPreset(scheme)}
                        >
                          {scheme.description}
                        </Button>
                      ))}
                    </Flex>
                  </Box>

                  <FormControl isInvalid={errors.tbi_data?.prescription_dose}>
                    <FormLabel fontSize="sm" color="gray.300">Prescription Dose (Gy)</FormLabel>
                    <NumberInput size="sm" min={0} max={20} step={0.5}>
                      <NumberInputField
                        {...register('tbi_data.prescription_dose', {
                          required: 'Prescription dose is required',
                          min: { value: 0.1, message: 'Dose must be positive' }
                        })}
                        bg="gray.700"
                        borderColor="gray.600"
                        color="white"
                        _hover={{ borderColor: 'gray.500' }}
                        _placeholder={{ color: 'gray.400' }}
                      />
                    </NumberInput>
                    <FormErrorMessage fontSize="xs">
                      {errors.tbi_data?.prescription_dose?.message}
                    </FormErrorMessage>
                  </FormControl>

                  <FormControl isInvalid={errors.tbi_data?.fractions}>
                    <FormLabel fontSize="sm" color="gray.300">Number of Fractions</FormLabel>
                    <NumberInput size="sm" min={1} max={20}>
                      <NumberInputField
                        {...register('tbi_data.fractions', {
                          required: 'Number of fractions is required',
                          min: { value: 1, message: 'Must be at least 1 fraction' }
                        })}
                        bg="gray.700"
                        borderColor="gray.600"
                        color="white"
                        _hover={{ borderColor: 'gray.500' }}
                        _placeholder={{ color: 'gray.400' }}
                      />
                    </NumberInput>
                    <FormErrorMessage fontSize="xs">
                      {errors.tbi_data?.fractions?.message}
                    </FormErrorMessage>
                  </FormControl>

                  <FormControl isInvalid={errors.tbi_data?.setup}>
                    <FormLabel fontSize="sm" color="gray.300">Setup</FormLabel>
                    <Select
                      size="sm"
                      {...register('tbi_data.setup', { required: 'Setup is required' })}
                      bg="gray.700"
                      borderColor="gray.600"
                      color="white"
                      _hover={{ borderColor: 'gray.500' }}
                      data-theme="dark"
                      aria-label="Beam setup"
                      sx={{ '& option': { backgroundColor: 'gray.700', color: 'white' }}}
                    >
                      {setupOptions.map((option) => (
                        <option key={option} value={option} style={{ backgroundColor: '#2D3748', color: 'white' }}>
                          {option}
                        </option>
                      ))}
                    </Select>
                    <FormErrorMessage fontSize="xs">
                      {errors.tbi_data?.setup?.message}
                    </FormErrorMessage>
                  </FormControl>

                  <FormControl display="flex" alignItems="center">
                    <FormLabel fontSize="sm" color="gray.300" mb={0}>
                      Lung Blocks
                    </FormLabel>
                    <Switch
                      {...register('tbi_data.lung_blocks')}
                      colorScheme="green"
                      size="sm"
                    />
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

                <Card bg="green.800" borderColor="green.600" borderWidth="1px" mb={4}>
                  <CardBody>
                    <VStack align="start" spacing={3}>
                      <Box>
                        <Badge colorScheme="green" mb={2}>Treatment Regimen</Badge>
                        <Text fontSize="sm" color="white" fontWeight="bold">
                          {formatNumber(watchPrescriptionDose)} Gy in {watchFractions} fraction{watchFractions !== 1 ? 's' : ''}
                        </Text>
                        {watchFractions > 0 && (
                          <Text fontSize="2xs" color="gray.300">
                            ({formatNumber(watchPrescriptionDose / watchFractions)} Gy per fraction)
                          </Text>
                        )}
                      </Box>

                      <Box>
                        <Badge colorScheme="blue" mb={2}>Setup</Badge>
                        <Text fontSize="sm" color="white">
                          {watchSetup || '---'}
                        </Text>
                      </Box>

                      <Box>
                        <Badge colorScheme="purple" mb={2}>Lung Blocks</Badge>
                        <Text fontSize="sm" color="white">
                          {watchLungBlocks ? 'Yes' : 'No'}
                        </Text>
                      </Box>

                      <Box>
                        <Badge colorScheme="orange" mb={2}>Equipment</Badge>
                        <Text fontSize="sm" color="white">
                          6 MV beams
                        </Text>
                        <Text fontSize="2xs" color="gray.300">
                          Dose rate: 10-15 cGy/min
                        </Text>
                        <Text fontSize="2xs" color="gray.300">
                          Machine rate: 200 MU/min
                        </Text>
                      </Box>
                    </VStack>
                  </CardBody>
                </Card>

                <Box bg="blue.900" p={3} borderRadius="md" borderWidth="1px" borderColor="blue.700">
                  <Text fontSize="xs" color="blue.200" fontWeight="bold" mb={2}>
                    What will be included:
                  </Text>
                  <VStack align="start" spacing={1}>
                    <Text fontSize="2xs" color="blue.100">• Consultation request</Text>
                    <Text fontSize="2xs" color="blue.100">• Patient demographics</Text>
                    <Text fontSize="2xs" color="blue.100">• Treatment technique ({watchSetup})</Text>
                    <Text fontSize="2xs" color="blue.100">• Simulation measurements</Text>
                    <Text fontSize="2xs" color="blue.100">• Compensating aluminum filters</Text>
                    {watchLungBlocks && (
                      <Text fontSize="2xs" color="blue.100">• Lung block fabrication</Text>
                    )}
                    <Text fontSize="2xs" color="blue.100">• In-vivo diode dosimetry</Text>
                    <Text fontSize="2xs" color="blue.100">• Review and approval</Text>
                  </VStack>
                </Box>
              </GridItem>
            </Grid>

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
                    colorScheme="blue"
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
                  fontFamily="monospace"
                  fontSize="sm"
                  _hover={{ borderColor: 'gray.500' }}
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

