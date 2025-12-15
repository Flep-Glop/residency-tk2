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
  ButtonGroup,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  ModalCloseButton
} from '@chakra-ui/react';
import { AddIcon, MinusIcon } from '@chakra-ui/icons';
import { useRouter } from 'next/router';
import Image from 'next/image';
import UpdateNotification from '../components/UpdateNotification';
import { VERSION_INFO } from '../constants/version';
import observatory1 from '../images/observatory1.png';
import observatory2 from '../images/observatory2.png';

const HomePage = () => {
  const router = useRouter();
  
  // State for enlarged observatory image
  const [enlargedImage, setEnlargedImage] = useState(null);
  
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
      // DIBH is a simple boolean - TEMPORARY: mutually exclusive with SBRT
      setMpcChecklist(prev => {
        // If DIBH is already selected, just deselect it
        if (prev.dibh) {
          return {
            ...prev,
            dibh: false
          };
        }
        // If DIBH is not selected, select it and clear SBRT
        return {
          ...prev,
          dibh: true,
          specialTreatmentTypes: {
            ...prev.specialTreatmentTypes,
            sbrt: false
          }
        };
      });
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
          
          // TEMPORARY: Disable DIBH if selecting SBRT (and switch from DIBH if it was active)
          const shouldDisableDibh = item === 'sbrt' || item === 'srs' || item === 'tbi' || item === 'hdr';
          
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
    // TEMPORARY: SBRT also disables DIBH (mutually exclusive)
    return mpcChecklist.specialTreatmentTypes.sbrt ||
           mpcChecklist.specialTreatmentTypes.srs || 
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
        <Text fontSize="sm" color={isDisabled ? "gray.500" : "blue.200"}>
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
      
      {/* Tabbed Interface */}
      <Tabs 
        variant="soft-rounded" 
        colorScheme="blue" 
        size="lg"
        defaultIndex={0}
      >
        {/* Top Navigation Bar */}
        <Box bg="gray.800" py={3} px={4} position="sticky" top={0} zIndex={100}>
          <Container maxW="container.xl">
            <TabList justifyContent="center">
              <Tab 
                _selected={{ bg: "blue.500", color: "white" }}
                _hover={{ bg: "gray.700" }}
                color="gray.300"
              >
                QuickWrite
              </Tab>
              <Tab 
                _selected={{ bg: "cyan.500", color: "white" }}
                _hover={{ bg: "gray.700" }}
                color="gray.300"
              >
                The Observatory
              </Tab>
              <Tab 
                _selected={{ bg: "purple.500", color: "white" }}
                _hover={{ bg: "gray.700" }}
                color="gray.300"
              >
                About
              </Tab>
            </TabList>
          </Container>
        </Box>

        {/* Tab Content */}
        <Container maxW="container.xl" py={8}>
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
              <Heading size="lg" color="blue.200" textAlign="center">
                Fusion MPCs
              </Heading>
            </CardHeader>
            
            <CardBody>
              {/* Compact Table Layout */}
              <Box overflowX="auto" mb={4}>
                <Table size="sm" variant="simple" sx={{ '& td, & th': { py: 2, lineHeight: '1' } }}>
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
                      <Td color="gray.300" borderColor="gray.600">MRI/CT</Td>
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
                      <Td color="gray.300" borderColor="gray.600">PET/CT</Td>
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
                      <Td color="gray.300" borderColor="gray.600">CT/CT</Td>
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
                isDisabled={!fusionConfig.ct.bladderStatus && fusionConfig.mri.rigid === 0 && fusionConfig.pet.rigid === 0 && fusionConfig.pet.deformable === 0 && fusionConfig.ct.rigid === 0 && fusionConfig.ct.deformable === 0}
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
              <Heading size="lg" color="purple.200" textAlign="center">
                General MPCs
              </Heading>
            </CardHeader>
            
            <CardBody>
              <SimpleGrid columns={2} spacing={3}>
                
                {/* PRODUCTION NOTE: SRS/SRT module hidden - pending comprehensive QA */}
                {/* Prior Dose - Phase 1 UI polish complete, available for review */}
                
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

                {/* SBRT - TEMPORARY: Mutually exclusive with DIBH */}
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

                {/* SRS/SRT - HIDDEN */}
                {/* <Button
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
                </Button> */}

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

                {/* DIBH - TEMPORARY: Mutually exclusive with SBRT */}
                <Button
                  size="md"
                  variant={mpcChecklist.dibh ? "solid" : "outline"}
                  colorScheme={mpcChecklist.dibh ? "teal" : "gray"}
                  onClick={() => toggleMpcItem('dibh')}
                  borderColor="gray.600"
                  color={mpcChecklist.dibh ? "white" : "gray.300"}
                  _hover={{ 
                    bg: mpcChecklist.dibh ? "teal.600" : "gray.700",
                    borderColor: mpcChecklist.dibh ? "teal.300" : "gray.500"
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

            {/* The Observatory Tab */}
            <TabPanel p={0}>
              <Box maxW="container.lg" mx="auto">
              <Box bg="gray.800" p={8} borderRadius="lg" border="1px" borderColor="gray.600">
                <Flex 
                  direction={{ base: "column", md: "row" }} 
                  gap={8} 
                  align="flex-start"
                >
                  {/* Text Content - Left Side */}
                  <VStack spacing={0} align="flex-start" flex="1" minW={{ base: "100%", md: "280px" }}>
                    <Heading size="lg" color="teal.300" textAlign="left" lineHeight="1" mb={0}>
                      Enjoying to Learn,
                    </Heading>
                    <Heading size="lg" color="teal.300" textAlign="left" lineHeight="1" mb={4}>
                      Learning to Enjoy
                    </Heading>
                    <Text fontSize="lg" color="gray.300" textAlign="left">
                      The Observatory is a medical physics educational game that teaches clinical concepts through creative and 
                      interactive experiences. Spurred by a passion for video games, pixel art, and teaching,
                      The Observatory is a passion project led by Luke Lussier and assisted by Zachariah Appelbaum. 
                      The project is currently in development by Luke and Zach's game design studio: Questrium.
                    </Text>
                  </VStack>
                  
                  {/* Game Screenshots - Right Side */}
                  <VStack spacing={4} flex="1" maxW={{ base: "100%", md: "520px" }}>
                    <Box 
                      borderRadius="lg" 
                      overflow="hidden"
                      cursor="pointer"
                      onClick={() => setEnlargedImage(observatory1)}
                      _hover={{ transform: "scale(1.02)", opacity: 0.9 }}
                      transition="all 0.2s"
                    >
                      <Image
                        src={observatory1}
                        alt="The Observatory - Screenshot 1"
                        style={{ width: '100%', height: 'auto' }}
                        placeholder="blur"
                      />
                    </Box>
                    <Box 
                      borderRadius="lg" 
                      overflow="hidden"
                      cursor="pointer"
                      onClick={() => setEnlargedImage(observatory2)}
                      _hover={{ transform: "scale(1.02)", opacity: 0.9 }}
                      transition="all 0.2s"
                    >
                      <Image
                        src={observatory2}
                        alt="The Observatory - Screenshot 2"
                        style={{ width: '100%', height: 'auto' }}
                        placeholder="blur"
                      />
                    </Box>
                  </VStack>
                </Flex>
              </Box>
              
              {/* Enlarged Image Modal */}
              <Modal isOpen={enlargedImage !== null} onClose={() => setEnlargedImage(null)} size="6xl" isCentered>
                <ModalOverlay bg="blackAlpha.800" />
                <ModalContent bg="transparent" boxShadow="none" maxW="90vw">
                  <ModalCloseButton color="white" size="lg" top={-10} right={-10} />
                  <ModalBody p={0}>
                    {enlargedImage && (
                      <Image
                        src={enlargedImage}
                        alt="The Observatory - Enlarged"
                        style={{ width: '100%', height: 'auto', borderRadius: '8px' }}
                        placeholder="blur"
                      />
                    )}
                  </ModalBody>
                </ModalContent>
              </Modal>
              </Box>
            </TabPanel>

            {/* About Tab */}
            <TabPanel p={0}>
              <Box bg="gray.800" p={6} borderRadius="lg" border="1px" borderColor="gray.600">
                <VStack spacing={6} align="start">
                  {/* Studio Header */}
                  <Box>
                    <Heading as="h2" size="lg" mb={2} color="purple.200">
                      Questrium
                    </Heading>
                    <Text fontSize="lg" color="gray.300">
                      A small software studio founded by Luke Lussier and Zachariah Appelbaum dedicated to advancing medical physics through innovative tools and applications.
                      The studio is currently focused on the development of Quickwrite, a clinical documentation tool, and The Observatory, a medical physics educational game.
                      Questrium is known for its unique pixel art style and tight UI/UX design.
                      The studio is located in the greater San Antonio area, USA.
                    </Text>
                  </Box>
                </VStack>
              </Box>
            </TabPanel>
          </TabPanels>
        </Container>
      </Tabs>
    </Box>
  );
};

export default HomePage; 