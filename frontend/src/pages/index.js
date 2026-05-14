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
  HStack,
  VStack,
  Checkbox,
  IconButton,
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
} from '@chakra-ui/react';
import { AddIcon, MinusIcon } from '@chakra-ui/icons';
import { useRouter } from 'next/router';
import UpdateNotification from '../components/UpdateNotification';

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
  
  const [mpcChecklist, setMpcChecklist] = useState({
    prior: false,
    pacemaker: { enabled: false },
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
    const clearedState = {
      prior: false,
      pacemaker: { enabled: false },
      specialTreatmentTypes: { sbrt: false, srs: false, tbi: false, hdr: false },
      dibh: false
    };
    
    if (section === 'dibh') {
      setMpcChecklist(prev => prev.dibh ? clearedState : { ...clearedState, dibh: true });
    } else if (section === 'prior') {
      setMpcChecklist(prev => prev.prior ? clearedState : { ...clearedState, prior: true });
    } else if (section === 'specialTreatmentTypes') {
      setMpcChecklist(prev => {
        const wasSelected = prev.specialTreatmentTypes[item];
        if (wasSelected) return clearedState;
        return { ...clearedState, specialTreatmentTypes: { ...clearedState.specialTreatmentTypes, [item]: true } };
      });
    } else if (section === 'pacemaker' && item === 'enabled') {
      setMpcChecklist(prev => prev.pacemaker.enabled ? clearedState : { ...clearedState, pacemaker: { enabled: true } });
    }
  };

  const isMpcValid = () => {
    return mpcChecklist.prior || mpcChecklist.pacemaker.enabled || 
           Object.values(mpcChecklist.specialTreatmentTypes).some(Boolean) || mpcChecklist.dibh;
  };

  const getMpcRoute = (mpcConfig) => {
    if (mpcConfig.prior) return '/prior-dose';
    if (mpcConfig.pacemaker.enabled) return '/pacemaker';
    const specialTypes = mpcConfig.specialTreatmentTypes;
    if (specialTypes.sbrt) return '/sbrt';
    if (specialTypes.srs) return '/srs';
    if (specialTypes.tbi) return '/tbi';
    if (specialTypes.hdr) return '/hdr';
    if (mpcConfig.dibh) return '/dibh';
    return '/';
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
                _selected={{ bg: "purple.500", color: "white" }}
                _hover={{ bg: "gray.700" }}
                color="gray.300"
              >
                Settings
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
                bg={fusionConfig.ct.bladderStatus ? "yellow.900" : "gray.700"} 
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

            {/* Settings Tab */}
            <TabPanel p={0}>
              <Box bg="gray.800" p={6} borderRadius="lg" border="1px" borderColor="gray.600">
                <VStack spacing={6} align="start">
                  <Heading as="h2" size="lg" mb={2} color="purple.200">
                    Settings
                  </Heading>
                  <Text fontSize="lg" color="gray.300">
                    Settings coming soon.
                  </Text>
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