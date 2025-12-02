import React, { useState, useEffect, useRef } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
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
  IconButton,
  HStack,
  VStack,
  List,
  ListItem,
  Checkbox,
  Alert,
  AlertIcon,
  Badge,
  Flex,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
} from '@chakra-ui/react';
import { AddIcon, DeleteIcon, CopyIcon } from '@chakra-ui/icons';
import { getTreatmentSites, getDoseCalcMethods, generatePriorDoseWriteup } from '../../services/priorDoseService';

const PriorDoseForm = () => {
  const router = useRouter();
  const [treatmentSites, setTreatmentSites] = useState([]);
  const [doseCalcMethods, setDoseCalcMethods] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [writeup, setWriteup] = useState('');
  const [expandedIndices, setExpandedIndices] = useState([0]);
  const toast = useToast();
  
  // Hard-coded lists following fusion pattern
  const [physicians, setPhysicians] = useState(['Dalwadi', 'Galvan', 'Ha', 'Kluwe', 'Le', 'Lewis', 'Tuli']);
  const [physicists, setPhysicists] = useState(['Bassiri', 'Kirby', 'Papanikolaou', 'Paschal', 'Rasmussen']);
  
  // Form setup
  const { register, handleSubmit, formState: { errors }, watch, setValue, getValues, control } = useForm({
    defaultValues: {
      common_info: {
        physician: { name: '' },
        physicist: { name: '' },
      },
      prior_dose_data: {
        current_site: '',
        current_dose: '',
        current_fractions: '',
        current_month: new Date().toLocaleDateString('en-US', { month: 'long' }),
        current_year: new Date().getFullYear(),
        spine_location: '',
        prior_treatments: [
          {
            site: '',
            dose: '',
            fractions: '',
            month: 'January',
            year: '',
            spine_location: '',
            has_overlap: false
          }
        ],
        dose_calc_method: 'EQD2 (Equivalent Dose in 2 Gy fractions)',
        critical_structures: [],
        composite_dose_computed: false,
        dose_statistics: []
      }
    }
  });
  
  // Field array for prior treatments
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'prior_dose_data.prior_treatments'
  });
  
  // Field array for dose statistics
  const { fields: doseStatFields, append: appendDoseStat, remove: removeDoseStat } = useFieldArray({
    control,
    name: 'prior_dose_data.dose_statistics'
  });
  
  // Watch prior treatments for preview and overlap detection
  const watchPriorTreatments = watch('prior_dose_data.prior_treatments');
  const watchCurrentSite = watch('prior_dose_data.current_site');
  
  // Check if any treatment has overlap
  const hasAnyOverlap = watchPriorTreatments?.some(t => t?.has_overlap) || false;

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [sitesData, methodsData] = await Promise.all([
          getTreatmentSites(),
          getDoseCalcMethods()
        ]);
        
        setTreatmentSites(sitesData);
        setDoseCalcMethods(methodsData);
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
    
    loadInitialData();
  }, [toast]);
  
  // Add prior treatment
  const addPriorTreatment = () => {
    const newIndex = fields.length;
    append({
      site: '',
      dose: '',
      fractions: '',
      month: 'January',
      year: '',
      spine_location: '',
      has_overlap: false
    });
    // Expand the newly added treatment
    setExpandedIndices(prev => [...prev, newIndex]);
  };

  // Copy writeup to clipboard
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(writeup);
      toast({
        title: 'Copied!',
        description: 'Write-up copied to clipboard',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    } catch (err) {
      toast({
        title: 'Copy failed',
        description: 'Could not copy to clipboard',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };
  
  // Submit form
  const onSubmit = async (data) => {
    setLoading(true);
    try {
      console.log('Submitting Prior Dose data:', data);
      
      const result = await generatePriorDoseWriteup(data);
      setWriteup(result.writeup);
      
      toast({
        title: 'Write-up generated successfully!',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error generating write-up:', error);
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
  
  if (initialLoading) {
    return (
      <Box bg="gray.900" minH="100vh" textAlign="center" p={5}>
        <Text fontSize="lg" mb={2} color="white">Loading Prior Dose form data...</Text>
        <Text fontSize="sm" color="gray.400">Please wait while we initialize the form</Text>
      </Box>
    );
  }

  const formBg = "gray.800";
  const borderColor = "gray.600";

  return (
    <Box bg="gray.900" minH="100vh">
      {/* Header */}
      <Box bg="green.900" color="white" p={6} mb={6} borderRadius="lg" border="1px" borderColor="green.700">
        <Flex justify="space-between" align="center" flexWrap="wrap" gap={4}>
          <Box>
            <Heading size="xl" mb={2}>
              Prior Dose Write-up Generator
            </Heading>
            <Text opacity={0.9}>
              Generate standardized write-up for prior dose consultation
            </Text>
          </Box>
        </Flex>
      </Box>

      {/* Main Content */}
      <Box px={6}>
        <Box maxW="1200px" mx="auto">
          <form onSubmit={handleSubmit(onSubmit)}>
            {/* Three Column Layout - Responsive */}
            <Grid 
              templateColumns={{
                base: "1fr",
                md: "repeat(2, 1fr)",
                lg: "repeat(3, 1fr)"
              }} 
              gap={4} 
              mb={6}
            >
            {/* Staff & Patient Column */}
            <GridItem
              as={Box}
              p={4} 
              borderWidth="1px" 
              borderRadius="md" 
              bg={formBg}
              borderColor={borderColor}
              boxShadow="sm"
            >
              <Heading size="sm" mb={3} textAlign="center" color="white">Staff & Patient</Heading>
              
              <Box mb={6}>
                <Heading size="xs" mb={3} color="gray.300">Staff Information</Heading>
                
                <FormControl isInvalid={errors.common_info?.physician?.name} mb={3}>
                  <FormLabel fontSize="sm" color="gray.300">Physician Name</FormLabel>
                  <Select 
                    size="sm"
                    {...register('common_info.physician.name', { required: 'Physician is required' })}
                    aria-label="Select physician"
                    bg="gray.700"
                    borderColor="gray.600"
                    color="white"
                    _hover={{ borderColor: "gray.500" }}
                    data-theme="dark"
                    sx={{
                      '& option': {
                        backgroundColor: 'gray.700',
                        color: 'white',
                      }
                    }}
                  >
                    <option value="" style={{ backgroundColor: '#2D3748', color: 'white' }}>Select a physician</option>
                    {physicians.map(physician => (
                      <option key={physician} value={physician} style={{ backgroundColor: '#2D3748', color: 'white' }}>{physician}</option>
                    ))}
                  </Select>
                  <FormErrorMessage>{errors.common_info?.physician?.name?.message}</FormErrorMessage>
                </FormControl>

                <FormControl isInvalid={errors.common_info?.physicist?.name} mb={3}>
                  <FormLabel fontSize="sm" color="gray.300">Physicist Name</FormLabel>
                  <Select 
                    size="sm"
                    {...register('common_info.physicist.name', { required: 'Physicist is required' })}
                    aria-label="Select physicist"
                    bg="gray.700"
                    borderColor="gray.600"
                    color="white"
                    _hover={{ borderColor: "gray.500" }}
                    data-theme="dark"
                    sx={{
                      '& option': {
                        backgroundColor: 'gray.700',
                        color: 'white',
                      }
                    }}
                  >
                    <option value="" style={{ backgroundColor: '#2D3748', color: 'white' }}>Select a physicist</option>
                    {physicists.map(physicist => (
                      <option key={physicist} value={physicist} style={{ backgroundColor: '#2D3748', color: 'white' }}>{physicist}</option>
                    ))}
                  </Select>
                  <FormErrorMessage>{errors.common_info?.physicist?.name?.message}</FormErrorMessage>
                </FormControl>
              </Box>

            </GridItem>

            {/* Treatment Info Column */}
            <GridItem
              as={Box}
              p={4} 
              borderWidth="1px" 
              borderRadius="md" 
              bg={formBg}
              borderColor={borderColor}
              boxShadow="sm"
            >
              <Heading size="sm" mb={3} textAlign="center" color="white">Treatment Info</Heading>
              
              <FormControl isInvalid={errors.prior_dose_data?.current_site} mb={3}>
                <FormLabel fontSize="sm" color="gray.300">Current Treatment Site</FormLabel>
                <Select 
                  size="sm"
                  {...register('prior_dose_data.current_site', { required: 'Current treatment site is required' })}
                  aria-label="Current treatment site"
                  bg="gray.700"
                  borderColor="gray.600"
                  color="white"
                  _hover={{ borderColor: "gray.500" }}
                  data-theme="dark"
                  sx={{
                    '& option': {
                      backgroundColor: 'gray.700',
                      color: 'white',
                    }
                  }}
                >
                  <option value="" style={{ backgroundColor: '#2D3748', color: 'white' }}>Select treatment site</option>
                  {treatmentSites.map(site => (
                    <option key={site} value={site} style={{ backgroundColor: '#2D3748', color: 'white' }}>{site}</option>
                  ))}
                </Select>
                <FormErrorMessage>{errors.prior_dose_data?.current_site?.message}</FormErrorMessage>
              </FormControl>
              
              <FormControl isInvalid={errors.prior_dose_data?.current_dose} mb={3}>
                <FormLabel fontSize="sm" color="gray.300">Current Dose (Gy)</FormLabel>
                <Input 
                  size="sm"
                  type="number"
                  step="0.1"
                  {...register('prior_dose_data.current_dose', { 
                    required: 'Current dose is required',
                    min: { value: 0.1, message: 'Dose must be positive' }
                  })}
                  placeholder="Enter dose in Gy"
                  bg="gray.700"
                  borderColor="gray.600"
                  color="white"
                  _hover={{ borderColor: "gray.500" }}
                  _placeholder={{ color: "gray.400" }}
                />
                <FormErrorMessage>{errors.prior_dose_data?.current_dose?.message}</FormErrorMessage>
              </FormControl>
              
              <FormControl isInvalid={errors.prior_dose_data?.current_fractions} mb={3}>
                <FormLabel fontSize="sm" color="gray.300">Current Fractions</FormLabel>
                <Input 
                  size="sm"
                  type="number"
                  {...register('prior_dose_data.current_fractions', { 
                    required: 'Current fractions is required',
                    min: { value: 1, message: 'Fractions must be at least 1' }
                  })}
                  placeholder="Enter number of fractions"
                  bg="gray.700"
                  borderColor="gray.600"
                  color="white"
                  _hover={{ borderColor: "gray.500" }}
                  _placeholder={{ color: "gray.400" }}
                />
                <FormErrorMessage>{errors.prior_dose_data?.current_fractions?.message}</FormErrorMessage>
              </FormControl>

              <FormControl mb={3}>
                <FormLabel fontSize="sm" color="gray.300">Dose Calculation Method</FormLabel>
                <Select 
                  size="sm"
                  {...register('prior_dose_data.dose_calc_method')}
                  aria-label="Dose calculation method"
                  bg="gray.700"
                  borderColor="gray.600"
                  color="white"
                  _hover={{ borderColor: "gray.500" }}
                  data-theme="dark"
                  sx={{
                    '& option': {
                      backgroundColor: 'gray.700',
                      color: 'white',
                    }
                  }}
                >
                  {doseCalcMethods.map(method => (
                    <option key={method} value={method} style={{ backgroundColor: '#2D3748', color: 'white' }}>{method}</option>
                  ))}
                </Select>
              </FormControl>

              <FormControl>
                <Checkbox
                  {...register('prior_dose_data.composite_dose_computed')}
                  colorScheme="blue"
                  size="md"
                >
                  <Text color="gray.300" fontSize="sm" fontWeight="medium">
                    3D composite dose computed in Velocity
                  </Text>
                </Checkbox>
              </FormControl>
            </GridItem>

            {/* Prior Dose Preview Column */}
            <GridItem
              as={Box}
              p={4} 
              borderWidth="1px" 
              borderRadius="md" 
              bg={formBg}
              borderColor={borderColor}
              boxShadow="sm"
            >
              <Heading size="sm" mb={3} textAlign="center" color="white">Prior Dose Preview</Heading>
              
              <VStack align="start" spacing={3} mb={4}>
                <Box>
                  <Text fontSize="xs" color="gray.400" mb={1}>Number of Prior Treatments:</Text>
                  <Text fontSize="sm" color="white" fontWeight="bold">
                    {watchPriorTreatments?.length || 0} treatment{watchPriorTreatments?.length !== 1 ? 's' : ''}
                  </Text>
                </Box>

                <Box>
                  <Text fontSize="xs" color="gray.400" mb={1}>Treatments with Overlap:</Text>
                  <Text fontSize="sm" color="white" fontWeight="bold">
                    {watchPriorTreatments?.filter(t => t?.has_overlap).length || 0} of {watchPriorTreatments?.length || 0}
                  </Text>
                </Box>
              </VStack>

              <Box>
                <Heading size="xs" mb={2} color="gray.300">What will be written up:</Heading>
                <List spacing={1} fontSize="sm">
                  <ListItem color="gray.300">
                    <HStack>
                      <Badge colorScheme="green" size="sm">✓</Badge>
                      <Text fontSize="xs">Prior dose consultation request</Text>
                    </HStack>
                  </ListItem>
                  <ListItem color="gray.300">
                    <HStack>
                      <Badge colorScheme="green" size="sm">✓</Badge>
                      <Text fontSize="xs">Patient details and current treatment</Text>
                    </HStack>
                  </ListItem>
                  <ListItem color="gray.300">
                    <HStack>
                      <Badge colorScheme="green" size="sm">✓</Badge>
                      <Text fontSize="xs">Prior treatment history analysis</Text>
                    </HStack>
                  </ListItem>
                  <ListItem color="gray.300">
                    <HStack>
                      <Badge colorScheme="green" size="sm">✓</Badge>
                      <Text fontSize="xs">Overlap assessment and recommendations</Text>
                    </HStack>
                  </ListItem>
                  <ListItem color="gray.300">
                    <HStack>
                      <Badge colorScheme="green" size="sm">✓</Badge>
                      <Text fontSize="xs">Final approval by physician and physicist</Text>
                    </HStack>
                  </ListItem>
                </List>
              </Box>

              <Box mt={4} p={3} bg="blue.900" borderRadius="md" border="1px solid" borderColor="blue.700">
                <Text color="blue.200" fontSize="xs" fontWeight="bold" mb={2}>Expected Write-up Structure:</Text>
                <List spacing={1} fontSize="xs" color="blue.300">
                  <ListItem>• Prior dose consultation introduction</ListItem>
                  <ListItem>• Patient demographics and current plan</ListItem>
                  <ListItem>• Prior radiation treatment history</ListItem>
                  <ListItem>• Overlap assessment methodology</ListItem>
                  <ListItem>• Critical structure dose evaluation</ListItem>
                  <ListItem>• Treatment recommendation and approval</ListItem>
                </List>
              </Box>
            </GridItem>
          </Grid>

          {/* Prior Treatments Section - Full Width Accordion */}
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
                Prior Treatments ({fields.length})
              </Heading>
              <Button
                leftIcon={<AddIcon />}
                colorScheme="green"
                size="sm"
                onClick={addPriorTreatment}
              >
                Add Treatment
              </Button>
            </Flex>

            <Accordion allowMultiple index={expandedIndices} onChange={setExpandedIndices}>
              {fields.map((field, index) => (
                <AccordionItem key={field.id} border="1px" borderColor="gray.600" borderRadius="md" mb={4}>
                  <AccordionButton bg="gray.700" _hover={{ bg: 'gray.650' }}>
                    <Box flex="1" textAlign="left">
                      <Text color="white" fontWeight="bold">
                        Prior Treatment {index + 1}
                        {watchPriorTreatments?.[index]?.site && (
                          <Badge ml={2} colorScheme="purple">
                            {watchPriorTreatments[index].site}
                          </Badge>
                        )}
                        {watchPriorTreatments?.[index]?.dose && (
                          <Badge ml={2} colorScheme="blue">
                            {watchPriorTreatments[index].dose} Gy / {watchPriorTreatments[index].fractions} fx
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
                        <FormControl isInvalid={errors.prior_dose_data?.prior_treatments?.[index]?.site} mb={3}>
                          <FormLabel fontSize="sm" color="gray.300">Treatment Site</FormLabel>
                          <Select
                            size="sm"
                            {...register(`prior_dose_data.prior_treatments.${index}.site`, { required: 'Site is required' })}
                            placeholder="Select treatment site"
                            bg="gray.700"
                            borderColor="gray.600"
                            color="white"
                            _hover={{ borderColor: 'gray.500' }}
                            data-theme="dark"
                            aria-label="Treatment site"
                            sx={{ '& option': { backgroundColor: 'gray.700', color: 'white' }}}
                          >
                            {treatmentSites.map((site) => (
                              <option key={site} value={site} style={{ backgroundColor: '#2D3748', color: 'white' }}>
                                {site}
                              </option>
                            ))}
                          </Select>
                          <FormErrorMessage fontSize="xs">
                            {errors.prior_dose_data?.prior_treatments?.[index]?.site?.message}
                          </FormErrorMessage>
                        </FormControl>

                        <FormControl mb={3}>
                          <FormLabel fontSize="sm" color="gray.300">Dose (Gy)</FormLabel>
                          <Input
                            size="sm"
                            type="number"
                            step="0.1"
                            {...register(`prior_dose_data.prior_treatments.${index}.dose`, {
                              required: 'Dose is required',
                              min: { value: 0.1, message: 'Dose must be positive' }
                            })}
                            placeholder="Enter dose in Gy"
                            bg="gray.700"
                            borderColor="gray.600"
                            color="white"
                            _hover={{ borderColor: 'gray.500' }}
                            _placeholder={{ color: 'gray.400' }}
                          />
                        </FormControl>

                        <FormControl mb={3}>
                          <FormLabel fontSize="sm" color="gray.300">Number of Fractions</FormLabel>
                          <Input
                            size="sm"
                            type="number"
                            {...register(`prior_dose_data.prior_treatments.${index}.fractions`, {
                              required: 'Fractions is required',
                              min: { value: 1, message: 'Fractions must be at least 1' }
                            })}
                            placeholder="Enter number of fractions"
                            bg="gray.700"
                            borderColor="gray.600"
                            color="white"
                            _hover={{ borderColor: 'gray.500' }}
                            _placeholder={{ color: 'gray.400' }}
                          />
                        </FormControl>
                      </Box>

                      {/* Right Column */}
                      <Box>
                        <FormControl mb={3}>
                          <FormLabel fontSize="sm" color="gray.300">Treatment Month</FormLabel>
                          <Select
                            size="sm"
                            {...register(`prior_dose_data.prior_treatments.${index}.month`)}
                            bg="gray.700"
                            borderColor="gray.600"
                            color="white"
                            _hover={{ borderColor: 'gray.500' }}
                            data-theme="dark"
                            aria-label="Treatment month"
                            sx={{ '& option': { backgroundColor: 'gray.700', color: 'white' }}}
                          >
                            {['January', 'February', 'March', 'April', 'May', 'June', 
                              'July', 'August', 'September', 'October', 'November', 'December'].map((month) => (
                              <option key={month} value={month} style={{ backgroundColor: '#2D3748', color: 'white' }}>
                                {month}
                              </option>
                            ))}
                          </Select>
                        </FormControl>

                        <FormControl mb={3}>
                          <FormLabel fontSize="sm" color="gray.300">Treatment Year</FormLabel>
                          <Input
                            size="sm"
                            type="number"
                            {...register(`prior_dose_data.prior_treatments.${index}.year`, {
                              min: { value: 1900, message: 'Year must be valid' },
                              max: { value: new Date().getFullYear(), message: 'Year cannot be in the future' }
                            })}
                            placeholder="Enter treatment year"
                            bg="gray.700"
                            borderColor="gray.600"
                            color="white"
                            _hover={{ borderColor: 'gray.500' }}
                            _placeholder={{ color: 'gray.400' }}
                          />
                        </FormControl>

                        <FormControl>
                          <Checkbox
                            {...register(`prior_dose_data.prior_treatments.${index}.has_overlap`)}
                            colorScheme="orange"
                            size="md"
                          >
                            <Text color="gray.300" fontSize="sm" fontWeight="medium">
                              Has overlap with current treatment
                            </Text>
                          </Checkbox>
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
                          Delete Treatment
                        </Button>
                      </Flex>
                    )}
                  </AccordionPanel>
                </AccordionItem>
              ))}
            </Accordion>
          </Box>

          {/* Dose Statistics Section - Shows only when overlap exists */}
          {hasAnyOverlap && (
            <Box
              p={4}
              borderWidth="1px"
              borderRadius="md"
              bg="blue.900"
              borderColor="blue.700"
              boxShadow="sm"
              mb={6}
            >
              <Flex justify="space-between" align="center" mb={4}>
                <Box>
                  <Heading size="sm" color="white" mb={1}>
                    Dose Constraint Statistics
                  </Heading>
                  <Text fontSize="xs" color="blue.200">
                    Enter the measured dose values for each constraint below
                  </Text>
                </Box>
                <Button
                  leftIcon={<AddIcon />}
                  colorScheme="blue"
                  size="sm"
                  onClick={() => appendDoseStat({ structure: '', constraint_type: '', value: '', source: '' })}
                >
                  Add Statistic
                </Button>
              </Flex>

              {doseStatFields.length === 0 ? (
                <Text color="blue.200" fontSize="sm" textAlign="center" py={4}>
                  Click "Add Statistic" to enter dose constraint values
                </Text>
              ) : (
                <VStack spacing={4} align="stretch">
                  {doseStatFields.map((field, index) => (
                    <Box key={field.id} p={4} bg="gray.800" borderRadius="md" border="1px" borderColor="gray.600">
                      <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }} gap={3}>
                        <FormControl>
                          <FormLabel fontSize="sm" color="gray.300">Structure</FormLabel>
                          <Input
                            size="sm"
                            {...register(`prior_dose_data.dose_statistics.${index}.structure`)}
                            placeholder="e.g., Spinal Cord"
                            bg="gray.700"
                            borderColor="gray.600"
                            color="white"
                            _hover={{ borderColor: 'gray.500' }}
                            _placeholder={{ color: 'gray.400' }}
                          />
                        </FormControl>

                        <FormControl>
                          <FormLabel fontSize="sm" color="gray.300">Constraint Type</FormLabel>
                          <Input
                            size="sm"
                            {...register(`prior_dose_data.dose_statistics.${index}.constraint_type`)}
                            placeholder="e.g., Max dose (0.03cc)"
                            bg="gray.700"
                            borderColor="gray.600"
                            color="white"
                            _hover={{ borderColor: 'gray.500' }}
                            _placeholder={{ color: 'gray.400' }}
                          />
                        </FormControl>

                        <FormControl>
                          <FormLabel fontSize="sm" color="gray.300">Measured Value</FormLabel>
                          <Input
                            size="sm"
                            {...register(`prior_dose_data.dose_statistics.${index}.value`)}
                            placeholder="e.g., 14.2 Gy"
                            bg="gray.700"
                            borderColor="gray.600"
                            color="white"
                            _hover={{ borderColor: 'gray.500' }}
                            _placeholder={{ color: 'gray.400' }}
                          />
                        </FormControl>

                        <FormControl>
                          <FormLabel fontSize="sm" color="gray.300">Source</FormLabel>
                          <Select
                            size="sm"
                            {...register(`prior_dose_data.dose_statistics.${index}.source`)}
                            bg="gray.700"
                            borderColor="gray.600"
                            color="white"
                            _hover={{ borderColor: 'gray.500' }}
                            data-theme="dark"
                            aria-label="Constraint source"
                            sx={{ '& option': { backgroundColor: 'gray.700', color: 'white' }}}
                          >
                            <option value="" style={{ backgroundColor: '#2D3748', color: 'white' }}>Select source</option>
                            <option value="QUANTEC" style={{ backgroundColor: '#2D3748', color: 'white' }}>QUANTEC</option>
                            <option value="Timmerman" style={{ backgroundColor: '#2D3748', color: 'white' }}>Timmerman</option>
                            <option value="TG-101" style={{ backgroundColor: '#2D3748', color: 'white' }}>TG-101</option>
                            <option value="Institutional" style={{ backgroundColor: '#2D3748', color: 'white' }}>Institutional</option>
                          </Select>
                        </FormControl>
                      </Grid>

                      <Flex justify="flex-end" mt={3}>
                        <Button
                          leftIcon={<DeleteIcon />}
                          colorScheme="red"
                          size="xs"
                          variant="outline"
                          onClick={() => removeDoseStat(index)}
                        >
                          Remove
                        </Button>
                      </Flex>
                    </Box>
                  ))}
                </VStack>
              )}
            </Box>
          )}

          {/* Action Buttons */}
          <Flex gap={4} mb={6}>
            <Button 
              type="submit" 
              colorScheme="green" 
              isLoading={loading}
              loadingText="Generating..."
              isDisabled={fields.length === 0}
              width="100%"
              size="md"
              shadow="md"
            >
              Generate Write-up
            </Button>
            <Button 
              variant="outline" 
              colorScheme="red" 
              onClick={() => {
                window.location.reload();
              }}
              width="auto"
              size="md"
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
            <Heading size="md" mb={3} color="white">Generated Write-up</Heading>
            <Box
              p={4}
              borderWidth={1}
              borderRadius="md"
              bg="gray.800"
              borderColor={borderColor}
              boxShadow="md"
            >
              <Textarea
                value={writeup}
                height="300px"
                isReadOnly
                fontFamily="mono"
                fontSize="sm"
                resize="vertical"
                aria-label="Generated write-up"
                bg="gray.700"
                borderColor="gray.600"
                color="white"
                _focus={{ borderColor: "green.500" }}
              />
              <Button 
                mt={3} 
                colorScheme="green"
                leftIcon={<CopyIcon />}
                onClick={copyToClipboard}
                aria-label="Copy to clipboard"
              >
                Copy to Clipboard
              </Button>
            </Box>
          </Box>
        )}
        </Box>
      </Box>
    </Box>
  );
};

export default PriorDoseForm;