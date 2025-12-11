import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
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
  Spinner,
  Center,
  IconButton,
  Card,
  CardBody,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Divider
} from '@chakra-ui/react';
import { AddIcon, DeleteIcon } from '@chakra-ui/icons';
import srsService from '../../services/srsService';

const SRSForm = () => {
  // State variables
  const [brainRegions, setBrainRegions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
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
      srs_data: {
        lesions: [
          {
            site: '',
            volume: 1.5,
            treatment_type: 'SRS',
            dose: 18.0,
            fractions: 1,
            prescription_isodose: 80.0,
            ptv_coverage: 98.0,
            conformity_index: 1.2,
            gradient_index: 3.0,
            max_dose: 125
          }
        ],
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

  // Helper function to format numbers cleanly
  const formatNumber = (value, decimals = 1) => {
    if (value === null || value === undefined || value === '') return '---';
    const num = parseFloat(value);
    if (isNaN(num)) return '---';
    
    let formatted = num.toFixed(decimals).replace(/\.?0+$/, '');
    return formatted;
  };

  // Watch lesions for preview
  const watchLesions = watch('srs_data.lesions');
  const watchPhysicianName = watch('common_info.physician.name');
  const watchBreathingTechnique = watch('srs_data.breathing_technique');
  
  // Load initial data
  useEffect(() => {
    const fetchInitialData = async () => {
      setInitialLoading(true);
      try {
        const regionsData = await srsService.getBrainRegions();
        setBrainRegions(regionsData);
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
      const response = await srsService.generateWriteup({
        common_info: data.common_info,
        srs_data: data.srs_data
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

  // Add new lesion
  const addLesion = () => {
    append({
      site: brainRegions[0] || '',
      volume: 1.5,
      treatment_type: 'SRS',
      dose: 18.0,
      fractions: 1,
      prescription_isodose: 80.0,
      ptv_coverage: 98.0,
      conformity_index: 1.2,
      gradient_index: 3.0,
      max_dose: 125
    });
  };

  // Quick preset buttons for dose selection
  const srsPresets = [
    { dose: 16.0, fractions: 1, label: '16 Gy × 1' },
    { dose: 18.0, fractions: 1, label: '18 Gy × 1' },
    { dose: 20.0, fractions: 1, label: '20 Gy × 1' },
    { dose: 21.0, fractions: 1, label: '21 Gy × 1' }
  ];

  const srtPresets = [
    { dose: 25.0, fractions: 5, label: '25 Gy / 5 fx' },
    { dose: 27.0, fractions: 3, label: '27 Gy / 3 fx' },
    { dose: 30.0, fractions: 5, label: '30 Gy / 5 fx' },
    { dose: 35.0, fractions: 5, label: '35 Gy / 5 fx' }
  ];

  const applyPreset = (index, preset) => {
    setValue(`srs_data.lesions.${index}.dose`, preset.dose);
    setValue(`srs_data.lesions.${index}.fractions`, preset.fractions);
    setValue(`srs_data.lesions.${index}.treatment_type`, preset.fractions === 1 ? 'SRS' : 'SRT');
  };

  if (initialLoading) {
    return (
      <Box bg="gray.900" minH="100vh" textAlign="center" p={5}>
        <Text fontSize="lg" mb={2} color="white">Loading SRS/SRT form data...</Text>
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
            <Heading size="md" mb={2}>SRS/SRT Write-up Generator</Heading>
          </Box>
        </Flex>
      </Box>

      {/* Main Content */}
      <Box px={6}>
        <Box maxW="1200px" mx="auto">
          <form onSubmit={handleSubmit(onSubmit)}>
            {/* First Row: Three Columns */}
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
                <Box>

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

              {/* Treatment Summary */}
              <GridItem
                p={4}
                borderWidth="1px"
                borderRadius="md"
                bg={formBg}
                borderColor={borderColor}
                boxShadow="sm"
              >
                <Heading size="sm" mb={3} textAlign="center" color="white">Treatment Summary</Heading>

                <VStack align="start" spacing={2}>
                  <Box>
                    <Text fontSize="xs" color="gray.400" mb={1}>Number of Lesions:</Text>
                    <Text fontSize="sm" color="white" fontWeight="bold">
                      {watchLesions?.length || 0} lesion{watchLesions?.length !== 1 ? 's' : ''}
                    </Text>
                  </Box>

                  <Box>
                    <Text fontSize="xs" color="gray.400" mb={1}>Treatment Type:</Text>
                    <Text fontSize="sm" color="white" fontWeight="bold">
                      {watchLesions?.every(l => l.treatment_type === 'SRS') ? 'SRS (Single Fraction)' :
                       watchLesions?.every(l => l.treatment_type === 'SRT') ? 'SRT (Multiple Fractions)' :
                       watchLesions?.length > 0 ? 'Mixed SRS/SRT' : 'Not configured'}
                    </Text>
                  </Box>

                  <Box>
                    <Text fontSize="xs" color="gray.400" mb={1}>Planning System:</Text>
                    <Text fontSize="sm" color="white">BrainLAB Elements</Text>
                  </Box>

                  <Box>
                    <Text fontSize="xs" color="gray.400" mb={1}>Equipment:</Text>
                    <Text fontSize="sm" color="white">Versa HD + ExacTrac</Text>
                  </Box>
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
                <Heading size="xs" mb={2} color="gray.300">What will be written up:</Heading>

                <Card size="sm" variant="outline" borderColor="green.400" bg="gray.700">
                  <CardBody p={3}>
                    <VStack align="start" spacing={2}>
                      <HStack>
                        <Badge colorScheme="green" size="sm">✓</Badge>
                        <Text fontSize="xs" color="gray.200">
                          <strong>Technique:</strong> SRS/SRT with ExacTrac
                        </Text>
                      </HStack>
                      <HStack>
                        <Badge colorScheme="green" size="sm">✓</Badge>
                        <Text fontSize="xs" color="gray.200">
                          <strong>Lesions:</strong> {watchLesions?.length || 0} brain lesion{watchLesions?.length !== 1 ? 's' : ''}
                        </Text>
                      </HStack>
                      <HStack>
                        <Badge colorScheme="green" size="sm">✓</Badge>
                        <Text fontSize="xs" color="gray.200">
                          <strong>Fractionation:</strong> {watchLesions?.every(l => l.treatment_type === 'SRS') ? 'Single fraction' :
                           watchLesions?.every(l => l.treatment_type === 'SRT') ? 'Multi-fraction' : 'Mixed'}
                        </Text>
                      </HStack>
                    </VStack>
                  </CardBody>
                </Card>

                <Box mt={3} p={3} bg="blue.900" borderRadius="md" border="1px" borderColor="blue.600">
                  <Text fontSize="xs" color="blue.200" fontWeight="bold" mb={1}>
                    Expected Write-up Structure:
                  </Text>
                  <Text fontSize="xs" color="blue.100" lineHeight="1.3">
                    • Medical physics consultation request<br/>
                    • Patient demographics and lesion details<br/>
                    • MRI fusion and rigid body registration<br/>
                    • Immobilization and CT simulation<br/>
                    • Treatment plan optimization and metrics<br/>
                    • Physician and physicist approval
                  </Text>
                </Box>
              </GridItem>
            </Grid>

            {/* Lesions Section - Full Width */}
            <Box
              p={4}
              borderWidth="1px"
              borderRadius="md"
              bg={formBg}
              borderColor={borderColor}
              boxShadow="sm"
              mb={6}
            >
              <Flex justify="space-between" align="center" mb={4}>
                <Heading size="sm" color="white">
                  Lesion Details ({fields.length})
                </Heading>
              <Button
                leftIcon={<AddIcon />}
                colorScheme="green"
                size="sm"
                onClick={addLesion}
              >
                Add Lesion
              </Button>
            </Flex>

            <Accordion allowMultiple defaultIndex={[0]}>
              {fields.map((field, index) => (
                <AccordionItem key={field.id} border="1px" borderColor="gray.600" borderRadius="md" mb={4}>
                  <AccordionButton bg="gray.700" _hover={{ bg: 'gray.650' }}>
                    <Box flex="1" textAlign="left">
                      <Text color="white" fontWeight="bold">
                        Lesion {index + 1}
                        {watchLesions[index]?.site && (
                          <Badge ml={2} colorScheme="blue">
                            {watchLesions[index].site}
                          </Badge>
                        )}
                        {watchLesions[index]?.treatment_type && (
                          <Badge ml={2} colorScheme={watchLesions[index].treatment_type === 'SRS' ? 'green' : 'purple'}>
                            {watchLesions[index].treatment_type}
                          </Badge>
                        )}
                      </Text>
                    </Box>
                    <AccordionIcon color="white" />
                  </AccordionButton>

                  <AccordionPanel pb={4} bg="gray.750">
                    <Grid templateColumns={{ base: '1fr', md: '1fr 1fr' }} gap={4}>
                      {/* Left Column */}
                      <Box>
                        <FormControl isInvalid={errors.srs_data?.lesions?.[index]?.site} mb={3}>
                          <FormLabel fontSize="sm" color="gray.300">Brain Region</FormLabel>
                          <Select
                            size="sm"
                            {...register(`srs_data.lesions.${index}.site`, { required: 'Site is required' })}
                            placeholder="Select brain region"
                            bg="gray.700"
                            borderColor="gray.600"
                            color="white"
                            _hover={{ borderColor: 'gray.500' }}
                            data-theme="dark"
                            aria-label="Brain region"
                            sx={{ '& option': { backgroundColor: 'gray.700', color: 'white' }}}
                          >
                            {brainRegions.map((region) => (
                              <option key={region} value={region} style={{ backgroundColor: '#2D3748', color: 'white' }}>
                                {region}
                              </option>
                            ))}
                          </Select>
                          <FormErrorMessage fontSize="xs">
                            {errors.srs_data?.lesions?.[index]?.site?.message}
                          </FormErrorMessage>
                        </FormControl>

                        <FormControl mb={3}>
                          <FormLabel fontSize="sm" color="gray.300">Treatment Type</FormLabel>
                          <Select
                            size="sm"
                            {...register(`srs_data.lesions.${index}.treatment_type`)}
                            bg="gray.700"
                            borderColor="gray.600"
                            color="white"
                            _hover={{ borderColor: 'gray.500' }}
                            data-theme="dark"
                            aria-label="Treatment type"
                            sx={{ '& option': { backgroundColor: 'gray.700', color: 'white' }}}
                            onChange={(e) => {
                              // Auto-adjust fractions based on treatment type
                              if (e.target.value === 'SRS') {
                                setValue(`srs_data.lesions.${index}.fractions`, 1);
                              } else if (watchLesions[index].fractions === 1) {
                                setValue(`srs_data.lesions.${index}.fractions`, 5);
                              }
                            }}
                          >
                            <option value="SRS" style={{ backgroundColor: '#2D3748', color: 'white' }}>SRS (Single Fraction)</option>
                            <option value="SRT" style={{ backgroundColor: '#2D3748', color: 'white' }}>SRT (Multiple Fractions)</option>
                          </Select>
                        </FormControl>

                        <FormControl mb={3}>
                          <FormLabel fontSize="sm" color="gray.300">Target Volume (cc)</FormLabel>
                          <Input
                            size="sm"
                            type="number"
                            step="0.1"
                            {...register(`srs_data.lesions.${index}.volume`, {
                              required: 'Volume is required',
                              min: { value: 0.01, message: 'Volume must be positive' }
                            })}
                            bg="gray.700"
                            borderColor="gray.600"
                            color="white"
                            _hover={{ borderColor: 'gray.500' }}
                            _placeholder={{ color: 'gray.400' }}
                          />
                        </FormControl>

                        <FormControl mb={3}>
                          <FormLabel fontSize="sm" color="gray.300">Prescription Dose (Gy)</FormLabel>
                          <Input
                            size="sm"
                            type="number"
                            step="0.5"
                            {...register(`srs_data.lesions.${index}.dose`, {
                              required: 'Dose is required',
                              min: { value: 1, message: 'Dose must be positive' }
                            })}
                            bg="gray.700"
                            borderColor="gray.600"
                            color="white"
                            _hover={{ borderColor: 'gray.500' }}
                            _placeholder={{ color: 'gray.400' }}
                          />
                        </FormControl>

                        {watchLesions[index]?.treatment_type === 'SRT' && (
                          <FormControl mb={3}>
                            <FormLabel fontSize="sm" color="gray.300">Number of Fractions</FormLabel>
                            <Input
                              size="sm"
                              type="number"
                              {...register(`srs_data.lesions.${index}.fractions`, {
                                required: 'Fractions is required',
                                min: { value: 2, message: 'SRT requires at least 2 fractions' }
                              })}
                              bg="gray.700"
                              borderColor="gray.600"
                              color="white"
                              _hover={{ borderColor: 'gray.500' }}
                              _placeholder={{ color: 'gray.400' }}
                            />
                          </FormControl>
                        )}

                        {/* Quick Presets */}
                        <Box mb={3}>
                          <Text color="gray.300" fontSize="xs" mb={2} fontWeight="bold">Quick Presets</Text>
                          <VStack spacing={2} align="stretch">
                            <Text color="gray.400" fontSize="2xs" fontWeight="bold">SRS (Single Fraction)</Text>
                            <Flex gap={2} flexWrap="wrap">
                              {srsPresets.map((preset) => (
                                <Button
                                  key={preset.label}
                                  size="xs"
                                  colorScheme="green"
                                  variant="outline"
                                  onClick={() => applyPreset(index, preset)}
                                >
                                  {preset.label}
                                </Button>
                              ))}
                            </Flex>
                            <Text color="gray.400" fontSize="2xs" fontWeight="bold" mt={2}>SRT (Multiple Fractions)</Text>
                            <Flex gap={2} flexWrap="wrap">
                              {srtPresets.map((preset) => (
                                <Button
                                  key={preset.label}
                                  size="xs"
                                  colorScheme="purple"
                                  variant="outline"
                                  onClick={() => applyPreset(index, preset)}
                                >
                                  {preset.label}
                                </Button>
                              ))}
                            </Flex>
                          </VStack>
                        </Box>
                      </Box>

                      {/* Right Column - Plan Metrics */}
                      <Box>
                        <Text color="gray.300" fontSize="xs" fontWeight="bold" mb={3}>Plan Metrics</Text>

                        <FormControl mb={3}>
                          <FormLabel fontSize="sm" color="gray.300">Prescription Isodose (%)</FormLabel>
                          <Input
                            size="sm"
                            type="number"
                            step="0.1"
                            {...register(`srs_data.lesions.${index}.prescription_isodose`)}
                            bg="gray.700"
                            borderColor="gray.600"
                            color="white"
                            _hover={{ borderColor: 'gray.500' }}
                            _placeholder={{ color: 'gray.400' }}
                          />
                        </FormControl>

                        <FormControl mb={3}>
                          <FormLabel fontSize="sm" color="gray.300">PTV Coverage (%)</FormLabel>
                          <Input
                            size="sm"
                            type="number"
                            step="0.1"
                            {...register(`srs_data.lesions.${index}.ptv_coverage`)}
                            bg="gray.700"
                            borderColor="gray.600"
                            color="white"
                            _hover={{ borderColor: 'gray.500' }}
                            _placeholder={{ color: 'gray.400' }}
                          />
                        </FormControl>

                        <FormControl mb={3}>
                          <FormLabel fontSize="sm" color="gray.300">Conformity Index</FormLabel>
                          <Input
                            size="sm"
                            type="number"
                            step="0.01"
                            {...register(`srs_data.lesions.${index}.conformity_index`)}
                            bg="gray.700"
                            borderColor="gray.600"
                            color="white"
                            _hover={{ borderColor: 'gray.500' }}
                            _placeholder={{ color: 'gray.400' }}
                          />
                        </FormControl>

                        <FormControl mb={3}>
                          <FormLabel fontSize="sm" color="gray.300">Gradient Index</FormLabel>
                          <Input
                            size="sm"
                            type="number"
                            step="0.1"
                            {...register(`srs_data.lesions.${index}.gradient_index`)}
                            bg="gray.700"
                            borderColor="gray.600"
                            color="white"
                            _hover={{ borderColor: 'gray.500' }}
                            _placeholder={{ color: 'gray.400' }}
                          />
                        </FormControl>

                        <FormControl mb={3}>
                          <FormLabel fontSize="sm" color="gray.300">Maximum Dose (%)</FormLabel>
                          <Input
                            size="sm"
                            type="number"
                            {...register(`srs_data.lesions.${index}.max_dose`)}
                            bg="gray.700"
                            borderColor="gray.600"
                            color="white"
                            _hover={{ borderColor: 'gray.500' }}
                            _placeholder={{ color: 'gray.400' }}
                          />
                        </FormControl>
                      </Box>
                    </Grid>

                    {/* Delete button */}
                    {fields.length > 1 && (
                      <Flex justify="flex-end" mt={4}>
                        <Button
                          leftIcon={<DeleteIcon />}
                          colorScheme="red"
                          size="sm"
                          variant="outline"
                          onClick={() => remove(index)}
                        >
                          Delete Lesion
                        </Button>
                      </Flex>
                    )}
                  </AccordionPanel>
                </AccordionItem>
              ))}
            </Accordion>
          </Box>

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
                size="md"
                width="auto"
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
                boxShadow="sm"
              >
                <Flex justify="space-between" align="center" mb={4}>
                  <Heading size="sm" color="white">
                    Generated Write-up
                  </Heading>
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
                  minH="400px"
                  bg="gray.700"
                  borderColor="gray.600"
                  color="white"
                  fontSize="sm"
                  whiteSpace="pre-wrap"
                  _focus={{ borderColor: 'blue.400' }}
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

export default SRSForm;

