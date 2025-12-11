import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  SimpleGrid,
  Card,
  CardHeader,
  CardBody,
  Button,
  Input,
  InputGroup,
  InputLeftElement,
  VStack,
  HStack,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Checkbox,
  Badge,
  Progress,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Flex,
  Spacer,
  IconButton,
  useToast,
  ButtonGroup,
  Collapse,
  Divider,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Tooltip,
  List,
  ListItem,
  ListIcon,
  OrderedList,
  UnorderedList
} from '@chakra-ui/react';
import { SearchIcon, InfoIcon, WarningIcon, AttachmentIcon, ViewIcon, ViewOffIcon, CheckCircleIcon, TimeIcon } from '@chakra-ui/icons';

const GuidesForm = () => {
  const [activeSection, setActiveSection] = useState('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [completedSteps, setCompletedSteps] = useState({});
  const [informationLevel, setInformationLevel] = useState('normal'); // whisper, normal, shout
  const [showCompletedSteps, setShowCompletedSteps] = useState(true);
  const [contextualHelp, setContextualHelp] = useState({});
  const [showQuickHelp, setShowQuickHelp] = useState(false);
  const [learningMode, setLearningMode] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [modalContent, setModalContent] = useState({ title: '', content: '' });
  const toast = useToast();

  // Information density levels (same as QA Tool)
  const infoLevels = {
    whisper: {
      name: 'Whisper',
      description: 'Minimal info',
      color: 'gray'
    },
    normal: {
      name: 'Normal', 
      description: 'Balanced view',
      color: 'blue'
    },
    shout: {
      name: 'Shout',
      description: 'Full details',
      color: 'purple'
    }
  };

  // Main guide categories
  const guideCategories = [
    {
      id: 'plan-review',
      title: 'Plan Review',
      description: 'Comprehensive treatment plan review and approval workflow',
      shortDesc: 'Plan Review',
      estimatedTime: '30-45 min',
      complexity: 'intermediate',
      role: 'Resident/Attending',
      icon: '',
      color: 'blue'
    },
    {
      id: 'tbi-simulation',
      title: 'TBI Simulation',
      description: 'Total Body Irradiation simulation setup and planning procedures',
      shortDesc: 'TBI Sim',
      estimatedTime: '60-90 min',
      complexity: 'advanced',
      role: 'Resident/Therapist',
      icon: '',
      color: 'red'
    },
    {
      id: 'fusion',
      title: 'Image Fusion',
      description: 'Multi-modality image registration and fusion workflows',
      shortDesc: 'Fusion',
      estimatedTime: '20-30 min',
      complexity: 'intermediate',
      role: 'Resident/Dosimetrist',
      icon: '',
      color: 'purple'
    },
    {
      id: 'sbrt-planning',
      title: 'SBRT Planning',
      description: 'Stereotactic body radiation therapy planning procedures',
      shortDesc: 'SBRT Planning',
      estimatedTime: '45-60 min',
      complexity: 'advanced',
      role: 'Resident/Dosimetrist',
      icon: '',
      color: 'orange'
    },
    {
      id: 'brachytherapy',
      title: 'Brachytherapy',
      description: 'Brachytherapy procedures and safety protocols',
      shortDesc: 'Brachy',
      estimatedTime: '30-120 min',
      complexity: 'advanced',
      role: 'Attending/Resident',
      icon: '',
      color: 'green'
    },
    {
      id: 'emergency',
      title: 'Emergency Procedures',
      description: 'Emergency response protocols and troubleshooting',
      shortDesc: 'Emergency',
      estimatedTime: 'Variable',
      complexity: 'critical',
      role: 'All Staff',
      icon: '',
      color: 'red'
    }
  ];

  // Contextual help data - organized by when you need it
  const contextualHelpData = {
    systemAccess: {
      title: "System Access & Login",
      type: "technical",
      urgency: "immediate",
      content: `**ARIA/Eclipse Access:**
• VPN connection required for remote access
• Use hospital credentials (not personal)
• Two-factor authentication may be required

**Workstation Setup:**
1. Log into Windows with hospital ID
2. Launch ARIA/Eclipse from desktop
3. Select appropriate database (Clinical vs Training)
4. Verify user permissions and role

**Security Best Practices:**
• Never share login credentials
• Lock workstation when away (Windows + L)
• Log out completely at end of session
• Report any access issues to IT immediately`
    },
    
    clinicalWorkflow: {
      title: "Clinical Workflow Basics",
      type: "clinical",
      urgency: "foundational",
      content: `**Patient Flow Overview:**
1. **Consultation** → Treatment decision made
2. **Simulation** → Patient setup and imaging
3. **Planning** → Dosimetry and plan creation
4. **Plan Review** → Physics and physician approval
5. **Treatment** → Daily delivery and verification
6. **Follow-up** → Assessment and monitoring

**Who Does What:**
• **Attending:** Final approval, clinical decisions
• **Resident:** Plan review, clinical oversight
• **Physicist:** Dose calculations, safety checks
• **Dosimetrist:** Plan optimization, technical planning
• **Therapists:** Patient setup, daily treatments

**Documentation Requirements:**
• All changes must be documented
• Approval signatures required at key steps
• Quality assurance checks mandatory`
    },

    emergencyProcedures: {
      title: "Emergency Response",
      type: "safety",
      urgency: "critical",
      content: `**IMMEDIATE ACTIONS:**
• **Medical Emergency:** Call Code Blue (ext. 911)
• **Radiation Emergency:** Evacuate area, contact RSO
• **Equipment Failure:** Stop treatment, secure area
• **Fire:** Activate alarm, evacuate per protocol

**Radiation Safety:**
• Never override safety interlocks
• Report unusual readings immediately
• Know location of survey meters
• Emergency contact: RSO (ext. 2345)

**Emergency Contacts:**
• Security: ext. 911
• Nursing Supervisor: ext. 2222
• Physics On-Call: (555) 123-4567
• RSO Emergency: (555) 987-6543

**Post-Emergency:**
• Complete incident report
• Notify attending physician
• Document all actions taken`
    },

    qualityAssurance: {
      title: "Quality Assurance",
      type: "quality",
      urgency: "always",
      content: `**QA Mindset:**
• Question everything that seems unusual
• Double-check critical parameters
• Verify patient identity at every step
• When in doubt, ask for help

**Common QA Checks:**
• Patient demographics and diagnosis
• Treatment site and technique
• Dose and fractionation scheme
• Critical organ constraints
• Setup reproducibility

**Stop Treatment If:**
• Patient identity unclear
• Setup significantly different
• Equipment malfunction
• Unusual readings or alarms
• Patient medical emergency

**Documentation:**
• Record all QA checks performed
• Note any deviations or concerns
• Ensure proper approval signatures`
    }
  };

  // Function to show contextual help panel
  const showContextualHelp = (helpKeys) => {
    const helpContent = helpKeys.map(key => contextualHelpData[key]).filter(Boolean);
    setModalContent({
      title: "Contextual Help",
      content: helpContent.map(help => `**${help.title}**\n\n${help.content}`).join('\n\n---\n\n')
    });
    onOpen();
  };

  // Helper functions
  const handleStepToggle = (stepId) => {
    setCompletedSteps(prev => ({
      ...prev,
      [stepId]: !prev[stepId]
    }));
  };

  const getComplexityColor = (complexity) => {
    switch (complexity) {
      case 'basic': return 'green';
      case 'intermediate': return 'blue';
      case 'advanced': return 'orange';
      case 'critical': return 'red';
      default: return 'gray';
    }
  };

  // Show modal content
  const showModal = (contentKey) => {
    if (modalContentData[contentKey]) {
      setModalContent(modalContentData[contentKey]);
      onOpen();
    }
  };

  // Information controls (same pattern as QA Tool)
  const renderInformationControls = () => (
    <Box mb={6} p={4} bg="gray.800" borderRadius="lg" border="1px" borderColor="gray.600">
      <Flex justify="space-between" align="center" flexWrap="wrap" gap={4}>
        <Box>
          <Text fontWeight="bold" mb={2} color="white">Information Level</Text>
          <ButtonGroup size="sm" isAttached variant="outline">
            {Object.entries(infoLevels).map(([level, config]) => (
              <Button
                key={level}
                colorScheme={config.color}
                variant={informationLevel === level ? 'solid' : 'outline'}
                onClick={() => setInformationLevel(level)}
                color={informationLevel === level ? 'white' : `${config.color}.300`}
                borderColor={`${config.color}.600`}
                _hover={{
                  bg: informationLevel === level ? `${config.color}.600` : `${config.color}.800`,
                  borderColor: `${config.color}.400`
                }}
              >
                {config.name}
              </Button>
            ))}
          </ButtonGroup>
        </Box>
        
        <Box>
          <Text fontWeight="bold" mb={2} color="white">View Options</Text>
          <HStack spacing={2}>
            <Button
              size="sm"
              leftIcon={showCompletedSteps ? <ViewIcon /> : <ViewOffIcon />}
              onClick={() => setShowCompletedSteps(!showCompletedSteps)}
              variant="outline"
              color="gray.300"
              borderColor="gray.600"
              _hover={{ bg: "gray.700", borderColor: "gray.500" }}
            >
              {showCompletedSteps ? 'Hide' : 'Show'} Completed
            </Button>
            <Button
              size="sm"
              leftIcon={<InfoIcon />}
              onClick={() => setLearningMode(!learningMode)}
              variant={learningMode ? "solid" : "outline"}
              colorScheme="green"
              color={learningMode ? 'white' : 'green.300'}
              borderColor="green.600"
              _hover={{
                bg: learningMode ? "green.600" : "green.800",
                borderColor: "green.400"
              }}
            >
              Learning
            </Button>
            <Button
              size="sm"
              leftIcon={<InfoIcon />}
              onClick={() => setShowQuickHelp(!showQuickHelp)}
              variant={showQuickHelp ? "solid" : "outline"}
              colorScheme="purple"
              color={showQuickHelp ? 'white' : 'purple.300'}
              borderColor="purple.600"
              _hover={{
                bg: showQuickHelp ? "purple.600" : "purple.800",
                borderColor: "purple.400"
              }}
            >
              Quick Help
            </Button>
          </HStack>
        </Box>

        {/* Learning Mode Panel */}
        {learningMode && (
          <Box w="100%" mt={4} p={4} bg="green.900" borderRadius="md" border="1px" borderColor="green.700">
            <Text fontWeight="bold" mb={3} color="green.200">Learning Mode Active</Text>
            <Text fontSize="sm" color="green.300" mb={3}>
              Additional educational context, clinical rationale, and "why" explanations will be shown throughout procedures.
            </Text>
            <Alert status="info" size="sm" bg="green.800" borderColor="green.600">
              <AlertIcon color="green.300" />
              <Text color="green.200">Look for Learn badges for educational content about clinical significance and best practices.</Text>
            </Alert>
          </Box>
        )}

        {/* Quick Help Panel */}
        {showQuickHelp && (
          <Box w="100%" mt={4} p={4} bg="purple.900" borderRadius="md" border="1px" borderColor="purple.700">
            <Text fontWeight="bold" mb={3} color="purple.200">Quick Access Help</Text>
            <HStack spacing={2} flexWrap="wrap">
              <Button
                size="xs"
                colorScheme="blue"
                variant="outline"
                onClick={() => showContextualHelp(['systemAccess'])}
                color="blue.300"
                borderColor="blue.600"
                _hover={{ bg: "blue.800", borderColor: "blue.400" }}
              >
                System Access
              </Button>
              <Button
                size="xs"
                colorScheme="green"
                variant="outline"
                onClick={() => showContextualHelp(['clinicalWorkflow'])}
                color="green.300"
                borderColor="green.600"
                _hover={{ bg: "green.800", borderColor: "green.400" }}
              >
                Clinical Workflow
              </Button>
              <Button
                size="xs"
                colorScheme="red"
                variant="outline"
                onClick={() => showContextualHelp(['emergencyProcedures'])}
                color="red.300"
                borderColor="red.600"
                _hover={{ bg: "red.800", borderColor: "red.400" }}
              >
                Emergency
              </Button>
              <Button
                size="xs"
                colorScheme="orange"
                variant="outline"
                onClick={() => showContextualHelp(['qualityAssurance'])}
                color="orange.300"
                borderColor="orange.600"
                _hover={{ bg: "orange.800", borderColor: "orange.400" }}
              >
                Quality Assurance
              </Button>
            </HStack>
          </Box>
        )}
      </Flex>
    </Box>
  );

  // Home page rendering
  const renderHome = () => (
    <VStack spacing={6} align="stretch">
      {informationLevel !== 'whisper' && (
        <Alert status="info" mb={4} bg="teal.900" borderColor="teal.700" color="teal.200">
          <AlertIcon color="teal.300" />
          <Box>
            <AlertTitle color="teal.200">Clinical Procedures & How-To Guides</AlertTitle>
            <AlertDescription color="teal.300">
              Select a procedure category below for step-by-step guidance. Each guide includes contextual help, troubleshooting, and educational content.
            </AlertDescription>
          </Box>
        </Alert>
      )}

      {renderInformationControls()}

      {/* Guide Categories Grid */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: informationLevel === 'whisper' ? 6 : 3 }} spacing={informationLevel === 'whisper' ? 3 : 6}>
        {guideCategories.map((category) => (
          <Card 
            key={category.id}
            cursor="pointer"
            _hover={{ transform: "translateY(-2px)", boxShadow: "xl" }}
            transition="all 0.2s"
            onClick={() => setActiveSection(category.id)}
            bg={category.complexity === 'critical' ? 'red.900' : category.complexity === 'advanced' ? 'orange.900' : 'gray.800'}
            borderColor={category.complexity === 'critical' ? 'red.600' : category.complexity === 'advanced' ? 'orange.600' : 'gray.600'}
            border="1px"
            size={informationLevel === 'whisper' ? 'sm' : 'md'}
          >
            <CardHeader pb={informationLevel === 'whisper' ? 2 : 4}>
              <HStack spacing={3}>
                <Text fontSize={informationLevel === 'whisper' ? 'lg' : '2xl'}>{category.icon}</Text>
                <Box>
                  <Heading size={informationLevel === 'whisper' ? 'sm' : 'md'} color="white">
                    {informationLevel === 'whisper' ? category.shortDesc : category.title}
                  </Heading>
                  {informationLevel !== 'whisper' && (
                    <Badge colorScheme={getComplexityColor(category.complexity)} mt={1}>
                      {category.role}
                    </Badge>
                  )}
                </Box>
              </HStack>
            </CardHeader>
            
            {informationLevel !== 'whisper' && (
              <CardBody pt={0}>
                <Text fontSize={informationLevel === 'shout' ? 'md' : 'sm'} mb={3} color="gray.300">
                  {category.description}
                </Text>
                
                {informationLevel === 'shout' && (
                  <VStack spacing={2} align="stretch">
                    <HStack justify="space-between">
                      <Text fontSize="sm" color="gray.400">
                        {category.estimatedTime}
                      </Text>
                      <Badge colorScheme={getComplexityColor(category.complexity)} size="sm">
                        {category.complexity}
                      </Badge>
                    </HStack>
                  </VStack>
                )}
              </CardBody>
            )}
          </Card>
        ))}
      </SimpleGrid>
    </VStack>
  );

  // Detailed procedure workflows (simplified placeholders)
  const procedureWorkflows = {
    'plan-review': {
      name: 'Treatment Plan Review',
      estimatedTime: '30-45 min',
      prerequisites: ['Patient chart review', 'Simulation completed', 'Initial plan created'],
      steps: [
        {
          id: 'pr-1',
          category: 'Setup',
          title: 'System Access & Patient Selection',
          shortTitle: 'Login & Patient',
          estimatedTime: '5 min',
          priority: 'high',
          description: 'Access ARIA/Eclipse and locate patient plan for review',
          contextualHelp: ['systemAccess'],
          details: 'detailsPlaceholder'
        },
        {
          id: 'pr-2',
          category: 'Demographics',
          title: 'Patient Demographics & Diagnosis Verification',
          shortTitle: 'Demographics',
          estimatedTime: '5 min',
          priority: 'high',
          description: 'Verify all patient information and clinical details',
          contextualHelp: ['qualityAssurance'],
          details: 'detailsPlaceholder'
        },
        {
          id: 'pr-3',
          category: 'Clinical',
          title: 'Treatment Prescription & Clinical Review',
          shortTitle: 'Prescription',
          estimatedTime: '10 min',
          priority: 'high',
          description: 'Review prescription details and clinical appropriateness',
          contextualHelp: ['clinicalWorkflow'],
          details: 'detailsPlaceholder'
        }
      ]
    }
  };

  // Simplified modal content for procedures
  const modalContentData = {
    detailsPlaceholder: {
      title: "Procedure Details",
      content: `**Under Development**

This detailed procedure guide is being developed and will include:

**Step-by-Step Instructions**
• Detailed procedural steps
• Safety considerations and checkpoints
• Quality assurance requirements
• Troubleshooting guides

**Learning Content**
• Clinical significance and rationale
• Best practice recommendations
• Common pitfalls and how to avoid them
• Regulatory and compliance requirements

**Additional Resources**
• Reference materials and protocols
• Contact information for support
• Related procedures and workflows

**Coming Soon**
Complete content will be added from Google Drive resources.`
    }
  };

  // Render detailed procedure (Plan Review example)
  const renderProcedureDetails = (procedureId) => {
    const procedure = procedureWorkflows[procedureId];
    if (!procedure) return null;

    const visibleSteps = showCompletedSteps ? procedure.steps : procedure.steps.filter(step => !completedSteps[step.id]);
    
    return (
      <VStack spacing={6} align="stretch">
        <Breadcrumb color="gray.300">
          <BreadcrumbItem>
            <BreadcrumbLink onClick={() => setActiveSection('home')} color="gray.300" _hover={{ color: "white" }}>Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbItem isCurrentPage>
            <BreadcrumbLink color="white">{procedure.name}</BreadcrumbLink>
          </BreadcrumbItem>
        </Breadcrumb>

        {renderInformationControls()}

        {/* Procedure Overview */}
        {informationLevel !== 'whisper' && (
          <Box p={6} bg="teal.900" borderRadius="lg" border="1px" borderColor="teal.700">
            <Heading size="lg" color="teal.200" mb={3}>
              {procedure.name}
            </Heading>
            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4} mb={4}>
              <Stat>
                <StatLabel color="teal.300">Estimated Time</StatLabel>
                <StatNumber color="teal.200">{procedure.estimatedTime}</StatNumber>
              </Stat>
              <Stat>
                <StatLabel color="teal.300">Progress</StatLabel>
                <StatNumber color="teal.200">{Math.round((procedure.steps.filter(step => completedSteps[step.id]).length / procedure.steps.length) * 100)}%</StatNumber>
                <StatHelpText color="teal.400">{procedure.steps.filter(step => completedSteps[step.id]).length}/{procedure.steps.length} completed</StatHelpText>
              </Stat>
              <Stat>
                <StatLabel color="teal.300">Priority</StatLabel>
                <StatNumber color="red.300">High</StatNumber>
                <StatHelpText color="teal.400">Patient safety critical</StatHelpText>
              </Stat>
            </SimpleGrid>
            
            {informationLevel === 'shout' && (
              <Box>
                <Text fontWeight="bold" mb={2} color="teal.200">Prerequisites:</Text>
                <HStack spacing={2} flexWrap="wrap">
                  {procedure.prerequisites.map((prereq, index) => (
                    <Badge key={index} colorScheme="blue" variant="subtle">
                      {prereq}
                    </Badge>
                  ))}
                </HStack>
              </Box>
            )}
          </Box>
        )}

        {/* Progress Bar */}
        <Progress 
          value={(procedure.steps.filter(step => completedSteps[step.id]).length / procedure.steps.length) * 100}
          colorScheme="teal" 
          size="lg" 
          borderRadius="md"
          bg="gray.700"
        />

        {/* Procedure Steps */}
        <VStack spacing={4} align="stretch">
          {visibleSteps.map((step, index) => (
            <Box 
              key={step.id}
              p={informationLevel === 'whisper' ? 3 : 5} 
              bg={completedSteps[step.id] ? "green.900" : "gray.800"}
              border="1px" 
              borderColor={completedSteps[step.id] ? 'green.600' : 'gray.600'}
              borderLeft="4px"
              borderLeftColor={completedSteps[step.id] ? 'green.400' : 'teal.400'}
              borderRadius="md"
              _hover={{ 
                transform: "translateX(2px)",
                boxShadow: "lg",
                bg: completedSteps[step.id] ? "green.800" : "gray.700"
              }}
              transition="all 0.2s"
            >
              <Flex justify="space-between" align="flex-start" mb={3}>
                <HStack flex={1} spacing={4} align="flex-start">
                  <Checkbox 
                    isChecked={completedSteps[step.id] || false}
                    onChange={() => handleStepToggle(step.id)}
                    size="lg"
                    colorScheme="teal"
                    mt={1}
                  />
                  <Box flex={1}>
                    <HStack mb={2}>
                      <Badge colorScheme="gray" variant="subtle">
                        {step.category}
                      </Badge>
                      <Badge colorScheme="blue" variant="subtle">
                        {step.estimatedTime}
                      </Badge>
                      {step.priority === 'high' && (
                        <Badge colorScheme="red" variant="solid">
                          High Priority
                        </Badge>
                      )}
                    </HStack>
                    
                    <Heading 
                      size={informationLevel === 'whisper' ? 'sm' : 'md'} 
                      color={completedSteps[step.id] ? "gray.400" : "white"}
                      textDecoration={completedSteps[step.id] ? "line-through" : "none"}
                      mb={2}
                    >
                      {informationLevel === 'whisper' ? step.shortTitle : step.title}
                    </Heading>
                    
                    {informationLevel !== 'whisper' && (
                      <Text color="gray.300" mb={3}>
                        {step.description}
                      </Text>
                    )}

                    {/* Learning Mode Educational Content */}
                    {learningMode && informationLevel !== 'whisper' && (
                              <Box mt={3} p={3} bg="green.900" borderRadius="md" borderLeft="3px" borderLeftColor="green.400" border="1px" borderColor="green.700">
                                <Text fontSize="sm" fontWeight="semibold" color="green.200" mb={1}>
                                  Clinical Significance (Learning Mode)
                                </Text>
                        <Text fontSize="sm" color="green.300">
                          {step.category === 'Setup' && 
                            "Proper system access and patient identification are the foundation of patient safety. Any errors here can propagate through the entire treatment process."
                          }
                          {step.category === 'Demographics' && 
                            "Patient identity verification is a critical safety barrier. Wrong patient treatment is a never event that must be prevented at all costs."
                          }
                          {step.category === 'Clinical' && 
                            "Prescription review ensures the planned treatment matches physician intent and is clinically appropriate for the diagnosis and patient condition."
                          }
                        </Text>
                      </Box>
                    )}
                  </Box>
                </HStack>
                
                {informationLevel !== 'whisper' && (
                  <HStack spacing={2}>
                    {learningMode && (
                      <Tooltip label="Educational content about clinical significance" placement="top">
                        <Badge 
                          colorScheme="green"
                          variant="solid"
                          fontSize="xs"
                          cursor="pointer"
                          onClick={() => showContextualHelp(['clinicalWorkflow'])}
                        >
                          Learn
                        </Badge>
                      </Tooltip>
                    )}
                    
                    <Button 
                      size="sm" 
                      colorScheme="purple" 
                      variant="ghost"
                      onClick={() => showModal(step.details)}
                      color="purple.300"
                      _hover={{ bg: "purple.800" }}
                    >
                      Details
                    </Button>
                  </HStack>
                )}
              </Flex>
            </Box>
          ))}
        </VStack>
      </VStack>
    );
  };

  // Main content renderer
  const renderContent = () => {
    switch (activeSection) {
      case 'plan-review':
        return renderProcedureDetails(activeSection);
      case 'tbi-simulation':
      case 'fusion':
      case 'sbrt-planning':
      case 'brachytherapy':
      case 'emergency':
        return (
          <VStack spacing={6} align="stretch">
            <Breadcrumb color="gray.300">
              <BreadcrumbItem>
                <BreadcrumbLink onClick={() => setActiveSection('home')} color="gray.300" _hover={{ color: "white" }}>Home</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbItem isCurrentPage>
                <BreadcrumbLink color="white">
                  {guideCategories.find(cat => cat.id === activeSection)?.title}
                </BreadcrumbLink>
              </BreadcrumbItem>
            </Breadcrumb>
            
            {renderInformationControls()}
            
            <Alert status="info" bg="teal.900" borderColor="teal.700" color="teal.200">
              <AlertIcon color="teal.300" />
              <Box>
                <AlertTitle color="teal.200">Procedure Under Development</AlertTitle>
                <AlertDescription color="teal.300">
                  Detailed step-by-step guidance for this procedure is being created. Check back soon!
                </AlertDescription>
              </Box>
            </Alert>
          </VStack>
        );
      default:
        return renderHome();
    }
  };

  return (
    <Box bg="gray.900" minH="100vh">
      {/* Header */}
      <Box bg="teal.900" color="white" p={6} mb={6} borderRadius="lg" border="1px" borderColor="teal.700">
        <Flex justify="space-between" align="center" flexWrap="wrap" gap={4}>
          <Box>
            <Heading size="md" mb={2}>Clinical Procedures & How-To Guides</Heading>
            <Text opacity={0.9}>Step-by-step guidance for radiation therapy procedures</Text>
            {informationLevel === 'shout' && (
              <Badge mt={2} colorScheme="purple">
                Current Mode: {infoLevels[informationLevel].name} - {infoLevels[informationLevel].description}
              </Badge>
            )}
          </Box>
          <InputGroup maxW="300px">
            <InputLeftElement pointerEvents="none">
              <SearchIcon color="gray.300" />
            </InputLeftElement>
            <Input 
              placeholder="Search procedures..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              bg="whiteAlpha.200"
              border="none"
              _placeholder={{ color: "whiteAlpha.700" }}
            />
          </InputGroup>
        </Flex>
      </Box>

      {/* Main Content */}
      <Box px={6}>
        {renderContent()}
      </Box>

      {/* Modal System */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent bg="gray.800" color="white" borderColor="gray.600">
          <ModalHeader bg="teal.900" color="white" borderTopRadius="md">
            {modalContent.title}
          </ModalHeader>
          <ModalCloseButton color="white" />
          <ModalBody>
            <Box whiteSpace="pre-line" color="gray.200">
              {modalContent.content}
            </Box>
          </ModalBody>
          <ModalFooter bg="gray.700" borderBottomRadius="md">
            <Button colorScheme="teal" onClick={onClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default GuidesForm; 