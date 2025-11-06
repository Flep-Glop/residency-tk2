import React, { useState } from 'react';
import { 
  Box, 
  Container, 
  Heading, 
  Text, 
  SimpleGrid, 
  Card, 
  CardHeader, 
  CardBody, 
  CardFooter,
  Button,
  Center,
  Badge,
  HStack,
  VStack,
  Checkbox,
  IconButton,
  Flex,
  Select,
  Divider,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  ButtonGroup
} from '@chakra-ui/react';
import { AddIcon, MinusIcon } from '@chakra-ui/icons';
import { useRouter } from 'next/router';
import UpdateNotification from '../components/UpdateNotification';
import { VERSION_INFO } from '../constants/version';

const HomePage = () => {
  const router = useRouter();
  
  // State for detailed fusion configuration
  const [fusionConfig, setFusionConfig] = useState({
    mri: {
      rigid: 0 // MRI/CT only has rigid option
    },
    pet: {
      rigid: 0,
      deformable: 0
    },
    ct: {
      rigid: 0,
      deformable: 0,
      bladderStatus: false // CT/CT full/empty bladder option
    }
  });
  
  // State for general MPC checklist (following workflow order)
  const [mpcChecklist, setMpcChecklist] = useState({
    prior: false,
    pacemaker: {
      enabled: false,
      low: false,
      medium: false,
      high: false
    },
    specialTreatmentTypes: {
      sbrt: false,
      srs: false,
      tbi: false,
      hdr: false
    },
    dibh: false
  });

  // Handler functions for fusion configuration
  const updateFusionCount = (modality, registrationType, increment) => {
    setFusionConfig(prev => ({
      ...prev,
      [modality]: {
        ...prev[modality],
        [registrationType]: Math.max(0, prev[modality][registrationType] + (increment ? 1 : -1))
      }
    }));
  };

  const toggleBladderStatus = () => {
    setFusionConfig(prev => {
      const newBladderStatus = !prev.ct.bladderStatus;
      
      // If bladder status is checked, set CT rigid to 1 and all others to 0
      if (newBladderStatus) {
        return {
          mri: { rigid: 0 },
          pet: { rigid: 0, deformable: 0 },
          ct: {
            rigid: 1,
            deformable: 0,
            bladderStatus: true
          }
        };
      } else {
        // If unchecked, just toggle the bladder status
        return {
          ...prev,
          ct: {
            ...prev.ct,
            bladderStatus: false
          }
        };
      }
    });
  };
  
  const toggleMpcItem = (section, item) => {
    if (section === 'dibh') {
      // DIBH is a simple boolean
      setMpcChecklist(prev => ({
        ...prev,
        dibh: !prev.dibh
      }));
    } else if (section === 'prior') {
      // Prior is now a simple boolean
      setMpcChecklist(prev => ({
        ...prev,
        prior: !prev.prior
      }));
    } else if (section === 'specialTreatmentTypes') {
      // Special treatment types have mutual exclusion
      setMpcChecklist(prev => {
        const currentValue = prev.specialTreatmentTypes[item];
        
        if (currentValue) {
          // If currently selected, just unselect it
          return {
            ...prev,
            specialTreatmentTypes: {
              ...prev.specialTreatmentTypes,
              [item]: false
            },
            // Re-enable DIBH if no blocking treatments are selected
            dibh: (item === 'srs' || item === 'tbi' || item === 'hdr') ? prev.dibh : prev.dibh
          };
        } else {
          // If not selected, select it and unselect all others
          const newSpecialTypes = {
            sbrt: false,
            srs: false,
            tbi: false,
            hdr: false,
            [item]: true
          };
          
          // Disable DIBH if selecting SRS, TBI, or HDR
          const shouldDisableDibh = item === 'srs' || item === 'tbi' || item === 'hdr';
          
          return {
            ...prev,
            specialTreatmentTypes: newSpecialTypes,
            dibh: shouldDisableDibh ? false : prev.dibh
          };
        }
      });
    } else if (section === 'pacemaker') {
      // Pacemaker has sub-items
      if (item === 'enabled') {
        // Toggle main checkbox and reset sub-items if disabling
        setMpcChecklist(prev => ({
          ...prev,
          pacemaker: {
            ...prev.pacemaker,
            enabled: !prev.pacemaker.enabled,
            // Reset sub-items if disabling main item
            ...(prev.pacemaker.enabled ? 
              { low: false, medium: false, high: false } : 
              {}
            )
          }
        }));
      } else {
        // Toggle sub-item (mutually exclusive within section)
        setMpcChecklist(prev => ({
          ...prev,
          pacemaker: {
            ...prev.pacemaker,
            low: item === 'low',
            medium: item === 'medium',
            high: item === 'high'
          }
        }));
      }
    }
  };

  // Helper function to determine if DIBH should be disabled
  const isDibhDisabled = () => {
    return mpcChecklist.specialTreatmentTypes.srs || 
           mpcChecklist.specialTreatmentTypes.tbi || 
           mpcChecklist.specialTreatmentTypes.hdr;
  };

  // Helper function to check if MPC checklist is valid
  const isMpcValid = () => {
    // Check if anything is selected at all
    const hasPriorSelection = mpcChecklist.prior;
    const hasPacemakerSelection = mpcChecklist.pacemaker.enabled;
    const hasSpecialTreatment = Object.values(mpcChecklist.specialTreatmentTypes).some(Boolean);
    const hasDibhSelection = mpcChecklist.dibh;
    
    // Must have at least one main category selected
    return hasPriorSelection || hasPacemakerSelection || hasSpecialTreatment || hasDibhSelection;
  };

  // Helper function to determine which MPC module to route to
  const getMpcRoute = (mpcConfig) => {
    // Priority order: Prior Dose → Pacemaker → Treatment Types (SBRT/SRS/TBI/HDR) → DIBH
    
    if (mpcConfig.prior) {
      return '/prior-dose';
    }
    
    if (mpcConfig.pacemaker.enabled) {
      return '/pacemaker';
    }
    
    const specialTypes = mpcConfig.specialTreatmentTypes;
    if (specialTypes.sbrt) {
      return '/sbrt';
    }
    if (specialTypes.srs) {
      return '/srs';
    }
    if (specialTypes.tbi) {
      return '/tbi';
    }
    if (specialTypes.hdr) {
      return '/hdr';
    }
    
    if (mpcConfig.dibh) {
      return '/dibh';
    }
    
    // Fallback (should never reach here due to button validation)
    return '/';
  };

  // Helper to calculate total fusions
  const getTotalFusions = () => {
    return fusionConfig.mri.rigid + 
           fusionConfig.pet.rigid + 
           fusionConfig.pet.deformable + 
           fusionConfig.ct.rigid + 
           fusionConfig.ct.deformable;
  };

  // Helper to get selected treatment type
  const getSelectedTreatmentType = () => {
    const types = mpcChecklist.specialTreatmentTypes;
    if (types.sbrt) return 'SBRT';
    if (types.srs) return 'SRS/SRT';
    if (types.tbi) return 'TBI';
    if (types.hdr) return 'HDR';
    return null;
  };

  // Counter control component for compact display
  const CounterControl = ({ value, onIncrement, onDecrement, isDisabled }) => (
    <HStack spacing={1} justify="center">
      <IconButton
        icon={<MinusIcon />}
        onClick={onDecrement}
        colorScheme="red"
        variant="ghost"
        size="xs"
        isDisabled={isDisabled || value <= 0}
        color="red.400"
        _hover={{ bg: "red.900", color: "red.300" }}
        _disabled={{ color: "gray.600" }}
      />
      <Box 
        bg={isDisabled ? "gray.600" : "gray.700"}
        px={2} 
        py={1} 
        borderRadius="md" 
        border="1px" 
        borderColor="blue.400"
        minW="30px"
        textAlign="center"
      >
        <Text fontSize="sm" fontWeight="bold" color={isDisabled ? "gray.500" : "blue.200"}>
          {value}
        </Text>
      </Box>
      <IconButton
        icon={<AddIcon />}
        onClick={onIncrement}
        colorScheme="green"
        variant="ghost"
        size="xs"
        isDisabled={isDisabled}
        color="green.400"
        _hover={{ bg: "green.900", color: "green.300" }}
        _disabled={{ color: "gray.600" }}
      />
    </HStack>
  );

  return (
    <Box bg="gray.900" minH="100vh">
      {/* Update Notification Component */}
      <UpdateNotification />
      
      <Container maxW="container.xl" py={8}>
        <Box textAlign="center" mb={10}>
          <Heading as="h1" size="2xl" mb={4} color="white">
            Medical Physics Toolkit
          </Heading>
          <Text fontSize="xl" maxW="container.md" mx="auto" color="gray.300">
            Streamlining documentation and procedures for radiation oncology workflows
          </Text>
        </Box>

        {/* Tabbed Interface */}
        <Tabs 
          variant="soft-rounded" 
          colorScheme="blue" 
          size="lg"
          defaultIndex={0}
        >
          <TabList mb={8} justifyContent="center" bg="gray.800" p={2} borderRadius="lg">
            <Tab 
              _selected={{ bg: "blue.500", color: "white" }}
              _hover={{ bg: "gray.700" }}
              color="gray.300"
              fontWeight="semibold"
            >
              QuickWrite
            </Tab>
            <Tab 
              _selected={{ bg: "teal.500", color: "white" }}
              _hover={{ bg: "gray.700" }}
              color="gray.300"
              fontWeight="semibold"
            >
              Other Tools
            </Tab>
            <Tab 
              _selected={{ bg: "purple.500", color: "white" }}
              _hover={{ bg: "gray.700" }}
              color="gray.300"
              fontWeight="semibold"
            >
              About
            </Tab>
          </TabList>

          <TabPanels>
            {/* QuickWrite Tab */}
            <TabPanel p={0}>
              <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={8}>
          
          {/* Column 1: Fusions */}
          <Card 
            bg="gray.800" 
            borderTop="4px" 
            borderTopColor="blue.400"
            borderColor="gray.600"
            height="fit-content"
          >
            <CardHeader>
              <Heading size="lg" color="blue.200">
                Fusions
              </Heading>
              <Text color="gray.300" mt={2}>
                Configure and launch fusion write-ups
              </Text>
            </CardHeader>
            
            <CardBody>
              {/* Summary Badge */}
              <HStack mb={4} justify="space-between" align="center">
                <Badge colorScheme="blue" fontSize="sm" px={3} py={1}>
                  {getTotalFusions()} fusion{getTotalFusions() !== 1 ? 's' : ''} configured
                </Badge>
                {fusionConfig.ct.bladderStatus && (
                  <Badge colorScheme="yellow" fontSize="xs">
                    Bladder Comparison Active
                  </Badge>
                )}
              </HStack>

              {/* Compact Table Layout */}
              <Box overflowX="auto" mb={4}>
                <Table size="sm" variant="simple">
                  <Thead>
                    <Tr>
                      <Th color="gray.400" borderColor="gray.600">Fusion Type</Th>
                      <Th color="gray.400" borderColor="gray.600" textAlign="center">Rigid</Th>
                      <Th color="gray.400" borderColor="gray.600" textAlign="center">Deformable</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {/* MRI/CT Row */}
                    <Tr>
                      <Td color="gray.300" borderColor="gray.600" fontWeight="medium">MRI/CT</Td>
                      <Td borderColor="gray.600">
                        <CounterControl
                          value={fusionConfig.mri.rigid}
                          onIncrement={() => updateFusionCount('mri', 'rigid', true)}
                          onDecrement={() => updateFusionCount('mri', 'rigid', false)}
                          isDisabled={fusionConfig.ct.bladderStatus}
                        />
                      </Td>
                      <Td borderColor="gray.600" textAlign="center">
                        <Text color="gray.600" fontSize="sm">—</Text>
                      </Td>
                    </Tr>

                    {/* PET/CT Row */}
                    <Tr>
                      <Td color="gray.300" borderColor="gray.600" fontWeight="medium">PET/CT</Td>
                      <Td borderColor="gray.600">
                        <CounterControl
                          value={fusionConfig.pet.rigid}
                          onIncrement={() => updateFusionCount('pet', 'rigid', true)}
                          onDecrement={() => updateFusionCount('pet', 'rigid', false)}
                          isDisabled={fusionConfig.ct.bladderStatus}
                        />
                      </Td>
                      <Td borderColor="gray.600">
                        <CounterControl
                          value={fusionConfig.pet.deformable}
                          onIncrement={() => updateFusionCount('pet', 'deformable', true)}
                          onDecrement={() => updateFusionCount('pet', 'deformable', false)}
                          isDisabled={fusionConfig.ct.bladderStatus}
                        />
                      </Td>
                    </Tr>

                    {/* CT/CT Row */}
                    <Tr>
                      <Td color="gray.300" borderColor="gray.600" fontWeight="medium">CT/CT</Td>
                      <Td borderColor="gray.600">
                        <CounterControl
                          value={fusionConfig.ct.rigid}
                          onIncrement={() => updateFusionCount('ct', 'rigid', true)}
                          onDecrement={() => updateFusionCount('ct', 'rigid', false)}
                          isDisabled={fusionConfig.ct.bladderStatus}
                        />
                      </Td>
                      <Td borderColor="gray.600">
                        <CounterControl
                          value={fusionConfig.ct.deformable}
                          onIncrement={() => updateFusionCount('ct', 'deformable', true)}
                          onDecrement={() => updateFusionCount('ct', 'deformable', false)}
                          isDisabled={fusionConfig.ct.bladderStatus}
                        />
                      </Td>
                    </Tr>
                  </Tbody>
                </Table>
              </Box>

              {/* Bladder Comparison Callout */}
              <Box 
                p={3} 
                bg={fusionConfig.ct.bladderStatus ? "yellow.900" : "gray.750"} 
                borderRadius="md" 
                borderLeft="4px" 
                borderColor={fusionConfig.ct.bladderStatus ? "yellow.400" : "gray.600"}
              >
                <Checkbox
                  isChecked={fusionConfig.ct.bladderStatus}
                  onChange={toggleBladderStatus}
                  colorScheme="yellow"
                  size="md"
                >
                  <VStack align="start" spacing={0} ml={2}>
                    <Text 
                      color={fusionConfig.ct.bladderStatus ? "yellow.200" : "gray.300"} 
                      fontWeight="medium"
                      fontSize="sm"
                    >
                      Full/Empty Bladder Comparison
                    </Text>
                    {fusionConfig.ct.bladderStatus && (
                      <Text color="yellow.300" fontSize="xs" fontStyle="italic">
                        Overrides all other fusion settings
                      </Text>
                    )}
                  </VStack>
                </Checkbox>
              </Box>
            </CardBody>
            
            <CardFooter>
              <Button 
                colorScheme="blue"
                width="100%"
                size="lg"
                onClick={() => {
                  const configString = encodeURIComponent(JSON.stringify(fusionConfig));
                  router.push(`/fusion?config=${configString}`);
                }}
                isDisabled={fusionConfig.mri.rigid === 0 && fusionConfig.pet.rigid === 0 && fusionConfig.pet.deformable === 0 && fusionConfig.ct.rigid === 0 && fusionConfig.ct.deformable === 0}
              >
                Launch Fusion Setup
              </Button>
            </CardFooter>
          </Card>

          {/* Column 2: General MPCs */}
          <Card 
            bg="gray.800" 
            borderTop="4px" 
            borderTopColor="purple.400"
            borderColor="gray.600"
            height="fit-content"
          >
            <CardHeader>
              <Heading size="lg" color="purple.200">
                General MPCs
              </Heading>
              <Text color="gray.300" mt={2}>
                Select consultation types to include
              </Text>
            </CardHeader>
            
            <CardBody>
              <SimpleGrid columns={2} spacing={3}>
                
                {/* Prior Dose */}
                <Button
                  size="md"
                  variant={mpcChecklist.prior ? "solid" : "outline"}
                  colorScheme={mpcChecklist.prior ? "purple" : "gray"}
                  onClick={() => toggleMpcItem('prior')}
                  borderColor="gray.600"
                  color={mpcChecklist.prior ? "white" : "gray.300"}
                  _hover={{ 
                    bg: mpcChecklist.prior ? "purple.600" : "gray.700",
                    borderColor: mpcChecklist.prior ? "purple.300" : "gray.500"
                  }}
                >
                  Prior Dose
                </Button>

                {/* Pacemaker/ICD */}
                <Button
                  size="md"
                  variant={mpcChecklist.pacemaker.enabled ? "solid" : "outline"}
                  colorScheme={mpcChecklist.pacemaker.enabled ? "purple" : "gray"}
                  onClick={() => toggleMpcItem('pacemaker', 'enabled')}
                  borderColor="gray.600"
                  color={mpcChecklist.pacemaker.enabled ? "white" : "gray.300"}
                  _hover={{ 
                    bg: mpcChecklist.pacemaker.enabled ? "purple.600" : "gray.700",
                    borderColor: mpcChecklist.pacemaker.enabled ? "purple.300" : "gray.500"
                  }}
                >
                  Pacemaker
                </Button>

                {/* SBRT */}
                <Button
                  size="md"
                  variant={mpcChecklist.specialTreatmentTypes.sbrt ? "solid" : "outline"}
                  colorScheme={mpcChecklist.specialTreatmentTypes.sbrt ? "orange" : "gray"}
                  onClick={() => toggleMpcItem('specialTreatmentTypes', 'sbrt')}
                  borderColor="gray.600"
                  color={mpcChecklist.specialTreatmentTypes.sbrt ? "white" : "gray.300"}
                  _hover={{ 
                    bg: mpcChecklist.specialTreatmentTypes.sbrt ? "orange.600" : "gray.700",
                    borderColor: mpcChecklist.specialTreatmentTypes.sbrt ? "orange.300" : "gray.500"
                  }}
                >
                  SBRT
                </Button>

                {/* SRS/SRT */}
                <Button
                  size="md"
                  variant={mpcChecklist.specialTreatmentTypes.srs ? "solid" : "outline"}
                  colorScheme={mpcChecklist.specialTreatmentTypes.srs ? "orange" : "gray"}
                  onClick={() => toggleMpcItem('specialTreatmentTypes', 'srs')}
                  borderColor="gray.600"
                  color={mpcChecklist.specialTreatmentTypes.srs ? "white" : "gray.300"}
                  _hover={{ 
                    bg: mpcChecklist.specialTreatmentTypes.srs ? "orange.600" : "gray.700",
                    borderColor: mpcChecklist.specialTreatmentTypes.srs ? "orange.300" : "gray.500"
                  }}
                >
                  SRS/SRT
                </Button>

                {/* TBI */}
                <Button
                  size="md"
                  variant={mpcChecklist.specialTreatmentTypes.tbi ? "solid" : "outline"}
                  colorScheme={mpcChecklist.specialTreatmentTypes.tbi ? "orange" : "gray"}
                  onClick={() => toggleMpcItem('specialTreatmentTypes', 'tbi')}
                  borderColor="gray.600"
                  color={mpcChecklist.specialTreatmentTypes.tbi ? "white" : "gray.300"}
                  _hover={{ 
                    bg: mpcChecklist.specialTreatmentTypes.tbi ? "orange.600" : "gray.700",
                    borderColor: mpcChecklist.specialTreatmentTypes.tbi ? "orange.300" : "gray.500"
                  }}
                >
                  TBI
                </Button>

                {/* HDR */}
                <Button
                  size="md"
                  variant={mpcChecklist.specialTreatmentTypes.hdr ? "solid" : "outline"}
                  colorScheme={mpcChecklist.specialTreatmentTypes.hdr ? "orange" : "gray"}
                  onClick={() => toggleMpcItem('specialTreatmentTypes', 'hdr')}
                  borderColor="gray.600"
                  color={mpcChecklist.specialTreatmentTypes.hdr ? "white" : "gray.300"}
                  _hover={{ 
                    bg: mpcChecklist.specialTreatmentTypes.hdr ? "orange.600" : "gray.700",
                    borderColor: mpcChecklist.specialTreatmentTypes.hdr ? "orange.300" : "gray.500"
                  }}
                >
                  HDR
                </Button>

                {/* DIBH */}
                <Button
                  size="md"
                  variant={mpcChecklist.dibh ? "solid" : "outline"}
                  colorScheme={mpcChecklist.dibh ? "teal" : "gray"}
                  onClick={() => toggleMpcItem('dibh')}
                  isDisabled={isDibhDisabled()}
                  borderColor="gray.600"
                  color={mpcChecklist.dibh ? "white" : isDibhDisabled() ? "gray.600" : "gray.300"}
                  _hover={{ 
                    bg: mpcChecklist.dibh ? "teal.600" : isDibhDisabled() ? undefined : "gray.700",
                    borderColor: mpcChecklist.dibh ? "teal.300" : isDibhDisabled() ? undefined : "gray.500"
                  }}
                >
                  DIBH
                </Button>
                
              </SimpleGrid>
            </CardBody>
            
            <CardFooter>
              <Button 
                colorScheme="purple"
                width="100%"
                size="lg"
                onClick={() => {
                  const route = getMpcRoute(mpcChecklist);
                  const configString = encodeURIComponent(JSON.stringify(mpcChecklist));
                  router.push(`${route}?config=${configString}`);
                }}
                isDisabled={!isMpcValid()}
              >
                Launch MPC Setup
              </Button>
            </CardFooter>
          </Card>
          
              </SimpleGrid>
            </TabPanel>

            {/* Other Tools Tab */}
            <TabPanel p={0}>
              <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
            <Card 
              bg="gray.800"
              borderTop="4px"
              borderTopColor="teal.400"
              borderColor="gray.600"
              _hover={{ 
                transform: "translateY(-2px)", 
                boxShadow: "xl",
                borderTopColor: "teal.300",
                bg: "gray.750"
              }}
              transition="all 0.2s"
            >
              <CardHeader>
                <Heading size="md" color="teal.200">
                  QA Documentation System
                  <Badge ml={2} colorScheme="gray" variant="subtle">
                    Coming Soon
                  </Badge>
                </Heading>
              </CardHeader>
              <CardBody>
                <Text color="gray.300">Advanced quality assurance platform for medical professionals</Text>
              </CardBody>
              <CardFooter>
                <Button 
                  colorScheme="teal"
                  width="100%"
                  variant="outline"
                  isDisabled={true}
                >
                  Coming Soon
                </Button>
              </CardFooter>
            </Card>
            
            <Card 
              bg="gray.800"
              borderTop="4px"
              borderTopColor="teal.400"
              borderColor="gray.600"
              _hover={{ 
                transform: "translateY(-2px)", 
                boxShadow: "xl",
                borderTopColor: "teal.300",
                bg: "gray.750"
              }}
              transition="all 0.2s"
            >
              <CardHeader>
                <Heading size="md" color="teal.200">
                  Clinical Procedure Guides
                  <Badge ml={2} colorScheme="gray" variant="subtle">
                    Coming Soon
                  </Badge>
                </Heading>
              </CardHeader>
              <CardBody>
                <Text color="gray.300">Step-by-step guides for plan review, TBI simulation, and more</Text>
              </CardBody>
              <CardFooter>
                <Button 
                  colorScheme="teal"
                  width="100%"
                  variant="outline"
                  isDisabled={true}
                >
                  Coming Soon
                </Button>
              </CardFooter>
            </Card>
              </SimpleGrid>
            </TabPanel>

            {/* About Tab */}
            <TabPanel p={0}>
              <Box bg="gray.800" p={6} borderRadius="md" border="1px" borderColor="gray.600">
                <Heading as="h3" size="md" mb={4} color="white">
                  About Medical Physics Toolkit
                </Heading>
                <Text mb={4} color="gray.300">
                  The Medical Physics Toolkit is designed to help radiation oncology residents and 
                  physicists create standardized documentation quickly and accurately, improving clinical 
                  workflow efficiency.
                </Text>
                
                <Box mb={4} p={4} bg="green.900" borderRadius="md" border="1px" borderColor="green.700">
                  <Heading as="h4" size="sm" mb={3} color="green.200">
                    🎉 What's New in Version {VERSION_INFO.current}
                  </Heading>
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={2}>
                    {VERSION_INFO.updates[0].changes.map((change, index) => (
                      <Text key={index} fontSize="sm" color="green.300">
                        • {change}
                      </Text>
                    ))}
                  </SimpleGrid>
                </Box>
                
                <Text fontStyle="italic" color="gray.400">
                  Version {VERSION_INFO.current} - Major update with complete pacemaker module and enhanced workflows
                </Text>
              </Box>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Container>
    </Box>
  );
};

export default HomePage; 