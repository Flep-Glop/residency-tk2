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
  Tooltip
} from '@chakra-ui/react';
import { SearchIcon, InfoIcon, WarningIcon, AttachmentIcon, ViewIcon, ViewOffIcon } from '@chakra-ui/icons';

const QAToolForm = () => {
  const [activeSection, setActiveSection] = useState('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [checkedItems, setCheckedItems] = useState({});
  const [informationLevel, setInformationLevel] = useState('normal'); // whisper, normal, shout
  const [showCompletedItems, setShowCompletedItems] = useState(true);
  const [contextualHelp, setContextualHelp] = useState({});
  const [showQuickHelp, setShowQuickHelp] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [modalContent, setModalContent] = useState({ title: '', content: '' });
  const toast = useToast();

  // Information density levels
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

  // Main QA areas - focused on actual facility setup
  const qaAreas = [
    {
      id: 'vault1',
      title: 'Vault 1',
      description: 'Monthly QA for Vault 1 (Legacy Varian) - Basic mechanical and dosimetry tests',
      shortDesc: 'Vault 1 (Legacy)',
      totalProcedures: 8,
      estimatedTime: '60 min',
      machineType: 'Legacy Varian'
    },
    {
      id: 'vault2',
      title: 'Vault 2', 
      description: 'Monthly QA for Vault 2 (VersaHD) - Full test suite including CRAD',
      shortDesc: 'Vault 2 (VersaHD)',
      totalProcedures: 18,
      estimatedTime: '120 min',
      machineType: 'VersaHD + CRAD'
    },
    {
      id: 'vault4',
      title: 'Vault 4',
      description: 'Monthly QA for Vault 4 (VersaHD) - Full suite plus ExacTrac and Winston Lutz',
      shortDesc: 'Vault 4 (VersaHD + SRS)',
      totalProcedures: 22,
      estimatedTime: '150 min',
      machineType: 'VersaHD + ExacTrac + SRS'
    },
    {
      id: 'vault6',
      title: 'Vault 6',
      description: 'Monthly QA for Vault 6 (VersaHD) - Full test suite including CRAD',
      shortDesc: 'Vault 6 (VersaHD)',
      totalProcedures: 18,
      estimatedTime: '120 min',
      machineType: 'VersaHD + CRAD'
    },
    {
      id: 'ct',
      title: 'CT Scanner',
      description: 'CT scanner quality assurance and imaging protocols',
      shortDesc: 'CT QA',
      totalProcedures: 0,
      estimatedTime: 'TBD',
      machineType: 'CT Scanner'
    }
  ];

  // Monthly QA workflows by action groups - how residents actually work
  const qaWorkflows = {
    // Initial setup and safety (always first)
    setup: {
      name: 'Setup & Safety',
      icon: '',
      color: 'red',
      estimatedTime: '10 min',
      procedures: [
        {
          id: 'setup-1',
          label: 'Initial setup - Monitors on, gantry/collimator at 90°, safety checks',
          shortLabel: 'Initial setup & safety',
          estimatedTime: '10 minutes',
          priority: 'high',
          details: 'detailsInitialSetup',
          vaults: ['vault1', 'vault2', 'vault4', 'vault6'],
          expandable: true,
          subProcedures: [
            'Verify in-room monitors are on',
            'Position gantry and collimator at 90°',
            'Check radiation warning lights',
            'Verify door interlocks and emergency stops'
          ]
        }
      ]
    },

    // Mechanical tests (resident responsibility)
    mechanical: {
      name: 'Mechanical Tests',
      icon: '',
      color: 'blue',
      estimatedTime: '75 min',
      procedures: [
        {
          id: 'mech-basic',
          label: 'Basic mechanical checks - ODI, angles, lasers',
          shortLabel: 'Basic mechanical',
          estimatedTime: '30 minutes',
          priority: 'high',
          details: 'detailsBasicMechanical',
          vaults: ['vault1', 'vault2', 'vault4', 'vault6'],
          expandable: true,
          subProcedures: [
            'Tray latch functions (VersaHD only)',
            'ODI accuracy check (±2mm)',
            'Collimator angle check (±0.5°)',
            'Laser alignment check (2mm tolerance)',
            'Gantry angle check (±0.5°)'
          ]
        },
        {
          id: 'mech-positioning',
          label: 'Positioning and field tests - Couch, jaws, field coincidence',
          shortLabel: 'Positioning & fields',
          estimatedTime: '45 minutes',
          priority: 'high',
          details: 'detailsPositioningFields',
          vaults: ['vault1', 'vault2', 'vault4', 'vault6'],
          expandable: true,
          subProcedures: [
            'Cross-hair centering check (1mm)',
            'Couch ISO center and readout (±1°)',
            'Treatment couch positioning (10±1mm)',
            'Jaw position check (±1mm)',
            'Light/radiation field coincidence (±2mm)',
            'Graticle alignment (VersaHD only)'
          ]
        }
      ]
    },

    // Dosimetry - separated by who does what
    dosimetry: {
      name: 'Dosimetry Tests',
      icon: '',
      color: 'orange',
      estimatedTime: '115 min',
      procedures: [
        {
          id: 'dose-faculty',
          label: 'Faculty outputs - All energies, constancy, dose rates, wedges',
          shortLabel: 'Faculty: Outputs (D1-D5)',
          estimatedTime: '90 minutes',
          priority: 'high',
          details: 'detailsFacultyOutputs',
          vaults: ['vault1', 'vault2', 'vault4', 'vault6'],
          expandable: true,
          subProcedures: [
            'D1. Output constancy - All energies (±2%)',
            'D2. Energy check - Ratio measurements (±2%)',
            'D3. Daily QA constancy check (VersaHD only)',
            'D4. Dose rate constancy (±2%)',
            'D5. Wedge factors (VersaHD only, ±2%)'
          ],
          note: 'Faculty completes independently - coordinate timing'
        },
        {
          id: 'dose-resident',
          label: 'Resident Starcheck - Profile constancy for photons and electrons',
          shortLabel: 'Resident: Starcheck (D6)',
          estimatedTime: '25 minutes',
          priority: 'high',
          details: 'detailsStarcheck',
          vaults: ['vault2', 'vault4', 'vault6'],
          expandable: true,
          subProcedures: [
            'Setup Starcheck - 20x20 FS, 100cm SSD (photons)',
            'Setup Starcheck - 20x20 applicator, 105cm SSD (electrons)',
            'Deliver 200 MU for each energy',
            'Analyze TGFlat, TGSym, LRFlat, LRSym',
            'Document results (±2% tolerance)'
          ]
        }
      ]
    },

    // Imaging (VersaHD only)
    imaging: {
      name: 'Imaging Tests',
      icon: '',
      color: 'green',
      estimatedTime: '50 min',
      procedures: [
        {
          id: 'img-all',
          label: 'Imaging QA - Hexapod, isocenter, kV/MV planar checks',
          shortLabel: 'Imaging QA',
          estimatedTime: '50 minutes',
          priority: 'high',
          details: 'detailsImagingQA',
          vaults: ['vault2', 'vault4', 'vault6'],
          expandable: true,
          subProcedures: [
            'Hexapod laser check',
            'Isocenter accuracy - Phantom within 1mm',
            'kV planar - Phantom within 1mm of center',
            'MV planar - Phantom within 1mm of 2x2 square'
          ]
        }
      ]
    },

    // MLC (VersaHD only)
    mlc: {
      name: 'MLC Tests',
      icon: '',
      color: 'purple',
      estimatedTime: '25 min',
      procedures: [
        {
          id: 'mlc-all',
          label: 'MLC speed and repeatability - Follow MPzzz protocol',
          shortLabel: 'MLC speed/repeatability',
          estimatedTime: '25 minutes',
          priority: 'high',
          details: 'detailsMLCTests',
          vaults: ['vault2', 'vault4', 'vault6'],
          expandable: true,
          subProcedures: [
            'Refer to MPzzz protocol',
            'Test 180/0 configuration',
            'Test 90/270 configuration',
            'Results appended to document'
          ]
        }
      ]
    },

    // CRAD (Vault 2 and 6 only)
    crad: {
      name: 'CRAD Testing',
      icon: '',
      color: 'teal',
      estimatedTime: '50 min',
      procedures: [
        {
          id: 'crad-all',
          label: 'CRAD phantom - Setup, imaging, and analysis',
          shortLabel: 'CRAD complete',
          estimatedTime: '50 minutes',
          priority: 'high',
          details: 'detailsCRADComplete',
          vaults: ['vault2', 'vault6'],
          expandable: true,
          subProcedures: [
            'CRAD phantom setup per protocol',
            'Acquire prescribed imaging sequences',
            'Verify positioning accuracy (±1mm)',
            'Perform analysis and documentation'
          ]
        }
      ]
    },

    // Stereotactic (Vault 4 only)
    stereotactic: {
      name: 'Stereotactic QA',
      icon: '',
      color: 'pink',
      estimatedTime: '75 min',
      procedures: [
        {
          id: 'stereo-all',
          label: 'Stereotactic tests - ExacTrac, Winston Lutz, SRS alignment',
          shortLabel: 'Stereotactic QA',
          estimatedTime: '75 minutes',
          priority: 'high',
          details: 'detailsStereotacticQA',
          vaults: ['vault4'],
          expandable: true,
          subProcedures: [
            'ExacTrac system calibration (±0.5mm, ±0.5°)',
            'Winston Lutz - Gantry angles (≤1mm each)',
            'Winston Lutz - Couch rotations (≤1mm each)',
            'SRS cone alignment verification (±0.5mm)'
          ]
        }
      ]
    }
  };

  // Updated modal content for workflow-based approach
  const modalContentData = {
    detailsInitialSetup: {
      title: "Setup & Safety Check",
      content: `**Purpose**
Establish safe working conditions and proper starting configuration for monthly QA.

**Setup Protocol**
1. **Power & Monitors:** Verify in-room monitors are on and displaying properly
2. **Positioning:** Set gantry to 90°, collimator to 90° using digital indicators
3. **Safety Systems:** Test radiation warning lights - should illuminate during prep mode
4. **Interlocks:** Verify door interlocks and emergency stops function properly
5. **Environment:** Check adequate lighting and gather QA equipment
6. **Documentation:** Note any initial observations or concerns

**Acceptance Criteria**
• All safety systems functional before proceeding
• Proper gantry and collimator positioning achieved
• All necessary equipment available and operational

**Safety Note**
Never proceed with QA if any safety system fails. Contact supervisor immediately.`
    },
    detailsBasicMechanical: {
      title: "Basic Mechanical Tests",
      content: `**Purpose**
Verify fundamental mechanical accuracy and positioning systems.

**Test Sequence**
**Tray Functions (VersaHD only):**
• Rotate gantry to 90° or 270°, collimator pointing down
• Test tray latch engagement and security

**ODI Accuracy:**
• Set ODI to 100cm, use mechanical pointer as reference
• Tolerance: ±2mm

**Collimator Angles:**
• Use spirit level at 0°, 90°, 270°
• Tolerance: ±0.5°

**Laser Alignment:**
• Patient L/R, ceiling, and sagittal lasers at 100cm SSD
• Tolerance: 2mm from crosshairs

**Gantry Angles:**
• Spirit level at 0°, 90°, 180°, 270°
• Tolerance: ±0.5°

**Documentation**
Record actual vs expected readings for all measurements. Note any trends from previous months.`
    },
    detailsPositioningFields: {
      title: "Positioning & Field Definition Tests",
      content: `**Purpose**
Verify treatment positioning accuracy and radiation field definition.

**Test Sequence**
**Cross-Hair Centering:**
• Graph paper on table, open rectangular field
• Rotate collimator full range, check crosshair stability
• Tolerance: 1mm

**Couch ISO & Readout:**
• Test couch angles 0°, 90°, 270° with graph paper alignment
• Compare digital readout to actual position
• Tolerance: ±1°

**Couch Positioning:**
• 10cm movements in all 6 directions (up/down/in/out/left/right)
• Record initial and final digital readouts
• Tolerance: 10±1mm

**Jaw Positioning:**
• Multiple field sizes (2x2, 5x5, 10x10, etc.)
• Measure light field vs digital settings
• Tolerance: ±1mm each jaw

**Light/Rad Coincidence:**
• EBT3 film, outline 10x10 light field, irradiate 400 MU
• Tolerance: ±2mm alignment

**Critical Points**
Document any systematic offsets. Jaw positioning affects all treatments.`
    },
    detailsFacultyOutputs: {
      title: "Faculty Output Measurements (D1-D5)",
      content: `**Purpose**
Faculty-performed dosimetry measurements for beam output and energy constancy.

**Faculty Responsibilities**
**D1. Output Constancy:**
• PTW 31013/31003 chambers, 10x10 FS, 105cm SSD
• All energies: 6X, 10X, 18X, 6XFFF, 6e, 9e, 12e, 15e
• 100 MU each, compare to baseline (±2%)

**D2. Energy Check:**
• Tissue-phantom ratios at multiple depths
• Calculate %dd(10) differences and PDI shifts
• Tolerance: ±2%

**D3. Daily QA Constancy (VersaHD):**
• Verify daily QA functions within 2%

**D4. Dose Rate Constancy:**
• Multiple energies at various dose rates
• Tolerance: ±2%

**D5. Wedge Factors (VersaHD):**
• Maximum dose rate measurements
• Tolerance: ±2%

**Coordination**
Schedule with faculty in advance. No specific handoff required - can be done independently.`
    },
    detailsStarcheck: {
      title: "Resident Starcheck Measurements (D6)",
      content: `**Purpose**
Profile constancy verification using Starcheck device - resident responsibility.

**Setup & Procedure**
**Photons:**
• 20x20 FS, 100cm SSD to top of Starcheck
• Deliver 200 MU per energy

**Electrons:**
• 20x20 applicator, 105cm SSD to top of Starcheck  
• Deliver 200 MU per energy
• Note: Some energies pending engineer tuning

**Analysis:**
• TGFlat - Crossplane flatness
• TGSym - Crossplane symmetry  
• LRFlat - Inplane flatness
• LRSym - Inplane symmetry

**Acceptance Criteria**
• Tolerance: ±2% for all parameters
• Compare to baseline measurements from annual calibration
• Document Pass/Fail for each energy and parameter

**Tips**
• Setup is straightforward - just position and irradiate
• Analysis software handles calculations
• Most common issues are setup positioning errors`
    },
    detailsImagingQA: {
      title: "Imaging Quality Assurance",
      content: `**Purpose**
Verify imaging system accuracy for patient positioning (VersaHD only).

**Test Sequence**
**Hexapod Laser Check:**
• Verify laser system alignment and positioning
• Check for any drift or misalignment

**Isocenter Accuracy:**
• Position phantom aligned to lasers
• Verify within 1mm tolerance
• Critical for IGRT accuracy

**kV Planar Imaging:**
• Phantom positioning check
• Verify within 1mm of kV imaging center
• Test image quality and geometric accuracy

**MV Planar Imaging:**
• Position phantom for MV imaging
• Verify within 1mm of 2x2 square reference
• Check portal imaging system accuracy

**Documentation**
Record all measurements and any systematic offsets. Imaging accuracy directly affects treatment delivery precision.

**Troubleshooting**
Most issues relate to phantom setup. Double-check laser alignment before imaging.`
    },
    detailsCRADComplete: {
      title: "CRAD Testing Complete Procedure",
      content: `**Purpose**
Comprehensive Radiation Audit and Documentation (Vault 2 & 6 only).

**Complete Workflow**
**Setup Phase:**
• Position CRAD phantom per protocol specifications
• Verify alignment accuracy (±1mm positioning tolerance)
• Document initial setup parameters

**Imaging Phase:**
• Acquire prescribed imaging sequences (kV and MV)
• Follow specified techniques and parameters
• Verify image quality suitable for analysis

**Analysis Phase:**
• Process acquired images per CRAD protocol
• Document quantitative measurements
• Compare to baseline and tolerance limits

**Documentation:**
• Complete CRAD analysis forms
• Prepare images for submission
• File results in appropriate database

**Acceptance Criteria**
• Phantom setup: ±1mm tolerance
• Complete image set per protocol requirements
• Analysis results within specified limits

**Time Management**
This is typically the longest single procedure. Plan accordingly and ensure uninterrupted time.`
    },
    detailsStereotacticQA: {
      title: "Stereotactic QA Complete (Vault 4 Only)",
      content: `**Purpose**
Comprehensive stereotactic system verification for high-precision treatments.

**Complete Workflow**
**ExacTrac Calibration:**
• Power on and warm-up ExacTrac system
• Position calibration phantom on couch
• Verify 6D positioning accuracy (±0.5mm, ±0.5°)
• Test automatic positioning corrections

**Winston Lutz - Gantry:**
• Setup WL phantom with BB at isocenter
• Small MLC aperture around BB
• Images at 0°, 90°, 180°, 270° gantry angles
• Analyze BB position vs radiation center (≤1mm each)

**Winston Lutz - Couch:**
• Same phantom setup
• Test couch rotations with gantry fixed
• Verify isocenter stability (≤1mm each angle)

**SRS Cone Alignment:**
• Mount SRS cones to treatment head
• Verify mechanical alignment (±0.5mm from isocenter)
• Check output constancy (±2% from baseline)

**Critical Tolerances**
• Overall isocenter diameter: ≤2mm
• Systematic offset: ≤0.5mm any direction
• All individual measurements must pass

**Clinical Impact**
Stereotactic treatments require submillimeter accuracy. Any failures require immediate attention.`
    }
  };

  // New contextual help data - organized by when you need it
  const contextualHelpData = {
    // Equipment operation basics
    linacOperation: {
      title: "Linac Operation Basics",
      type: "equipment",
      urgency: "immediate",
      content: `**EMERGENCY STOPS**
• Red mushroom buttons on console and room walls
• Interrupt key on console
• Door opening during beam

**Powering ON (Morning startup):**
1. Main power switch (usually green, on machine cabinet)
2. Wait for cooling system startup (listen for fans)
3. Console power on
4. Login to system
5. Wait for warm-up cycle completion (~10-15 min)

**Powering OFF (End of day):**
1. Log out of treatment system
2. Gantry to 0°, Collimator to 0°
3. Console power off
4. Main power switch off (machine will coast down)`
    },
    
    whyThisTest: {
      title: "Why Do We Do This Test?",
      type: "educational",
      urgency: "nice-to-know",
      content: `**Purpose of Monthly QA:**

**Safety First:** Monthly QA catches problems before they affect patients
**Regulatory:** Required by licensing agencies (State, NRC)
**Clinical:** Ensures treatment accuracy and consistency
**Trend Detection:** Monthly data shows equipment degradation over time

**What We're Really Testing:**
• Mechanical accuracy → Patient positioning precision
• Dosimetric constancy → Treatment dose accuracy
• Safety systems → Radiation protection
• Imaging quality → Treatment verification capability`
    },

    troubleshooting: {
      title: "Quick Troubleshooting",
      type: "support",
      urgency: "when-stuck",
      content: `**Common Issues & Quick Fixes:**

**Setup won't complete:**
• Check door interlocks (fully closed?)
• Verify beam-off conditions
• Look for error messages on console

**Measurements seem off:**
• Double-check phantom positioning
• Verify SSD/distance settings
• Check chamber orientation
• Recalibrate equipment if needed

**Can't proceed with test:**
• Review previous step completion
• Check required equipment setup
• Verify beam readiness

**When to Ask for Help:**
• Any safety system failure
• Measurements outside tolerance
• Equipment error messages
• Unsure about procedure interpretation`
    }
  };

  // Enhanced modal content with contextual help integration
  const enhancedModalContent = {
    ...modalContentData,
    // Add quick access to contextual help within procedures
    detailsInitialSetup: {
      title: "Setup & Safety Check",
      contextualHelp: ['linacOperation', 'troubleshooting'],
      content: `**Purpose**
Establish safe working conditions and proper starting configuration for monthly QA.

**Setup Protocol**
1. **Power & Monitors:** Verify in-room monitors are on and displaying properly
2. **Positioning:** Set gantry to 90°, collimator to 90° using digital indicators
3. **Safety Systems:** Test radiation warning lights - should illuminate during prep mode
4. **Interlocks:** Verify door interlocks and emergency stops function properly
5. **Environment:** Check adequate lighting and gather QA equipment
6. **Documentation:** Note any initial observations or concerns

**Acceptance Criteria**
• All safety systems functional before proceeding
• Proper gantry and collimator positioning achieved
• All necessary equipment available and operational

**Safety Note**
Never proceed with QA if any safety system fails. Contact supervisor immediately.

**Need Help?**
• How to turn on linac → Click "Linac Operation" below
• Troubleshooting → Click "Quick Help" below`
    },
    detailsBasicMechanical: {
      title: "Basic Mechanical Tests",
      contextualHelp: ['whyThisTest', 'troubleshooting'],
      content: modalContentData.detailsBasicMechanical.content
    },
    detailsPositioningFields: {
      title: "Positioning & Field Definition Tests",
      contextualHelp: ['whyThisTest', 'troubleshooting'],
      content: modalContentData.detailsPositioningFields.content
    },
    detailsFacultyOutputs: {
      title: "Faculty Output Measurements (D1-D5)",
      contextualHelp: ['whyThisTest'],
      content: modalContentData.detailsFacultyOutputs.content
    },
    detailsStarcheck: {
      title: "Resident Starcheck Measurements (D6)",
      contextualHelp: ['whyThisTest', 'troubleshooting'],
      content: modalContentData.detailsStarcheck.content
    },
    detailsImagingQA: {
      title: "Imaging Quality Assurance",
      contextualHelp: ['whyThisTest', 'troubleshooting'],
      content: modalContentData.detailsImagingQA.content
    },
    detailsCRADComplete: {
      title: "CRAD Testing Complete Procedure",
      contextualHelp: ['whyThisTest', 'troubleshooting'],
      content: modalContentData.detailsCRADComplete.content
    },
    detailsStereotacticQA: {
      title: "Stereotactic QA Complete (Vault 4 Only)",
      contextualHelp: ['whyThisTest', 'troubleshooting'],
      content: modalContentData.detailsStereotacticQA.content
    }
    // ... add contextualHelp arrays to other detailed procedures too
  };

  // Add learning mode context
  const [learningMode, setLearningMode] = useState(false);

  const handleCheckboxChange = (itemId) => {
    setCheckedItems(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  const getVaultWorkflows = (vaultId) => {
    const relevantWorkflows = {};
    Object.entries(qaWorkflows).forEach(([workflowId, workflow]) => {
      const workflowProcedures = workflow.procedures.filter(proc => 
        proc.vaults.includes(vaultId)
      );
      if (workflowProcedures.length > 0) {
        relevantWorkflows[workflowId] = {
          ...workflow,
          procedures: workflowProcedures
        };
      }
    });
    return relevantWorkflows;
  };

  const getAllVaultProcedures = (vaultId) => {
    let allProcedures = [];
    Object.values(qaWorkflows).forEach(workflow => {
      const vaultProcedures = workflow.procedures.filter(proc => 
        proc.vaults.includes(vaultId)
      );
      allProcedures.push(...vaultProcedures);
    });
    return allProcedures;
  };

  const calculateProgress = (procedures) => {
    if (procedures.length === 0) return 0;
    const checkedCount = procedures.filter(item => checkedItems[item.id]).length;
    return (checkedCount / procedures.length) * 100;
  };

  const showModal = (contentKey) => {
    if (enhancedModalContent[contentKey]) {
      setModalContent(enhancedModalContent[contentKey]);
      onOpen();
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'red';
      case 'medium': return 'yellow';
      case 'low': return 'blue';
      default: return 'gray';
    }
  };

  const getCompletedProcedures = (procedures) => {
    return procedures.filter(item => checkedItems[item.id]).length;
  };

  const filterProcedures = (procedures) => {
    if (showCompletedItems) return procedures;
    return procedures.filter(item => !checkedItems[item.id]);
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
              leftIcon={showCompletedItems ? <ViewIcon /> : <ViewOffIcon />}
              onClick={() => setShowCompletedItems(!showCompletedItems)}
              variant="outline"
              color="gray.300"
              borderColor="gray.600"
              _hover={{ bg: "gray.700", borderColor: "gray.500" }}
            >
              {showCompletedItems ? 'Hide' : 'Show'} Completed
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
              Additional educational context and "why" explanations will be shown throughout the interface.
            </Text>
            <Alert status="info" size="sm" bg="green.800" borderColor="green.600">
              <AlertIcon color="green.300" />
              <Text color="green.200">Look for Learn badges next to procedures for educational content about clinical significance and physics principles.</Text>
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
                colorScheme="red"
                variant="outline"
                onClick={() => showContextualHelp(['linacOperation'])}
                color="red.300"
                borderColor="red.600"
                _hover={{ bg: "red.800", borderColor: "red.400" }}
              >
                Linac On/Off
              </Button>
              <Button
                size="xs"
                colorScheme="blue"
                variant="outline"
                onClick={() => showContextualHelp(['whyThisTest'])}
                color="blue.300"
                borderColor="blue.600"
                _hover={{ bg: "blue.800", borderColor: "blue.400" }}
              >
                Why This Test?
              </Button>
              <Button
                size="xs"
                colorScheme="orange"
                variant="outline"
                onClick={() => showContextualHelp(['troubleshooting'])}
                color="orange.300"
                borderColor="orange.600"
                _hover={{ bg: "orange.800", borderColor: "orange.400" }}
              >
                Troubleshoot
              </Button>
              <Button
                size="xs"
                colorScheme="green"
                variant="outline"
                onClick={() => showContextualHelp(['linacOperation', 'troubleshooting', 'whyThisTest'])}
                color="green.300"
                borderColor="green.600"
                _hover={{ bg: "green.800", borderColor: "green.400" }}
              >
                All Help
              </Button>
            </HStack>
          </Box>
        )}
      </Flex>
    </Box>
  );

  const renderHome = () => (
    <VStack spacing={6} align="stretch">
      {informationLevel !== 'whisper' && (
        <Alert status="info" mb={4} bg="blue.900" borderColor="blue.700" color="blue.200">
          <AlertIcon color="blue.300" />
          <Box>
            <AlertTitle color="blue.200">Monthly QA Documentation System</AlertTitle>
            <AlertDescription color="blue.300">
              Select a vault below to begin monthly quality assurance procedures. Each vault has specialized test requirements based on equipment capabilities.
            </AlertDescription>
          </Box>
        </Alert>
      )}

      {renderInformationControls()}

      {/* QA Areas Grid */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: informationLevel === 'whisper' ? 5 : 3 }} spacing={informationLevel === 'whisper' ? 3 : 6}>
        {qaAreas.map((area) => {
          const vaultProcedures = getAllVaultProcedures(area.id);
          const completedProcedures = getCompletedProcedures(vaultProcedures);
          
          return (
            <Card 
              key={area.id}
              cursor="pointer"
              _hover={{ transform: "translateY(-2px)", boxShadow: "xl" }}
              transition="all 0.2s"
              onClick={() => setActiveSection(area.id)}
              bg={area.id === 'vault4' ? 'purple.900' : area.id === 'vault1' ? 'yellow.900' : 'gray.800'}
              borderColor={area.id === 'vault4' ? 'purple.600' : area.id === 'vault1' ? 'yellow.600' : 'gray.600'}
              border="1px"
              size={informationLevel === 'whisper' ? 'sm' : 'md'}
            >
              <CardHeader pb={informationLevel === 'whisper' ? 2 : 4}>
                <Heading size={informationLevel === 'whisper' ? 'sm' : 'md'} color="white">
                  {informationLevel === 'whisper' ? area.shortDesc : area.title}
                </Heading>
                {informationLevel !== 'whisper' && (
                  <Badge colorScheme={area.id === 'vault4' ? 'purple' : area.id === 'vault1' ? 'yellow' : 'blue'} mt={1}>
                    {area.machineType}
                  </Badge>
                )}
              </CardHeader>
              
              {informationLevel !== 'whisper' && (
                <CardBody pt={0}>
                  <Text fontSize={informationLevel === 'shout' ? 'md' : 'sm'} mb={3} color="gray.300">
                    {area.description}
                  </Text>
                  
                  {informationLevel === 'shout' && (
                    <VStack spacing={2} align="stretch">
                      <HStack justify="space-between">
                        <Text fontSize="sm" color="gray.400">
                          {area.totalProcedures} procedures
                        </Text>
                        <Text fontSize="sm" color="gray.400">
                          ~{area.estimatedTime}
                        </Text>
                      </HStack>
                      
                      {area.totalProcedures > 0 && (
                        <Box>
                          <Progress 
                            value={(completedProcedures / area.totalProcedures) * 100}
                            size="sm" 
                            colorScheme="green" 
                            borderRadius="md"
                            bg="gray.700"
                          />
                          <Text fontSize="xs" color="gray.400" mt={1}>
                            {completedProcedures}/{area.totalProcedures} completed
                          </Text>
                        </Box>
                      )}
                    </VStack>
                  )}
                </CardBody>
              )}
              
              {informationLevel === 'whisper' && area.totalProcedures > 0 && (
                <Box px={3} pb={3}>
                  <Text fontSize="xs" color="gray.400">
                    {completedProcedures}/{area.totalProcedures}
                  </Text>
                </Box>
              )}
            </Card>
          );
        })}
      </SimpleGrid>
    </VStack>
  );

  const renderVaultQA = (vaultId, vaultName) => {
    const vaultProcedures = getAllVaultProcedures(vaultId);
    const vaultWorkflows = getVaultWorkflows(vaultId);
    const visibleProcedures = filterProcedures(vaultProcedures);
    
    return (
      <VStack spacing={6} align="stretch">
        <Breadcrumb color="gray.300">
          <BreadcrumbItem>
            <BreadcrumbLink onClick={() => setActiveSection('home')} color="gray.300" _hover={{ color: "white" }}>Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbItem isCurrentPage>
            <BreadcrumbLink color="white">{vaultName}</BreadcrumbLink>
          </BreadcrumbItem>
        </Breadcrumb>

        {renderInformationControls()}

        {/* Progress Overview */}
        {informationLevel !== 'whisper' && (
          <SimpleGrid columns={{ base: 1, md: informationLevel === 'shout' ? 4 : 2 }} spacing={4}>
            <Stat bg="gray.800" p={4} borderRadius="md" border="1px" borderColor="gray.600">
              <StatLabel color="gray.300">Progress</StatLabel>
              <StatNumber color="white">{Math.round(calculateProgress(vaultProcedures))}%</StatNumber>
              <StatHelpText color="gray.400">
                {getCompletedProcedures(vaultProcedures)}/{vaultProcedures.length} completed
              </StatHelpText>
            </Stat>
            
            <Stat bg="blue.900" p={4} borderRadius="md" border="1px" borderColor="blue.700">
              <StatLabel color="blue.300">Estimated Time</StatLabel>
              <StatNumber color="blue.200">
                {vaultProcedures.reduce((total, proc) => total + parseInt(proc.estimatedTime), 0)} min
              </StatNumber>
              <StatHelpText color="blue.400">Total for all procedures</StatHelpText>
            </Stat>

            {informationLevel === 'shout' && (
              <>
                <Stat bg="red.900" p={4} borderRadius="md" border="1px" borderColor="red.700">
                  <StatLabel color="red.300">High Priority</StatLabel>
                  <StatNumber color="red.200">
                    {vaultProcedures.filter(p => p.priority === 'high').length}
                  </StatNumber>
                  <StatHelpText color="red.400">Critical procedures</StatHelpText>
                </Stat>
                
                <Stat bg="green.900" p={4} borderRadius="md" border="1px" borderColor="green.700">
                  <StatLabel color="green.300">Workflow Groups</StatLabel>
                  <StatNumber color="green.200">
                    {Object.keys(vaultWorkflows).length}
                  </StatNumber>
                  <StatHelpText color="green.400">QA workflow types</StatHelpText>
                </Stat>
              </>
            )}
          </SimpleGrid>
        )}

        <Progress 
          value={calculateProgress(vaultProcedures)} 
          colorScheme="green" 
          size="lg" 
          borderRadius="md"
          bg="gray.700"
        />

        {/* Quick Actions Bar */}
        {informationLevel !== 'whisper' && (
          <HStack spacing={3} flexWrap="wrap">
            <Button 
              size="sm" 
              colorScheme="blue" 
              variant="outline"
              leftIcon={<Box w={2} h={2} bg="red.400" borderRadius="full" />}
              onClick={() => {
                const highPriorityIncomplete = vaultProcedures.filter(p => 
                  p.priority === 'high' && !checkedItems[p.id]
                ).length;
                toast({
                  title: `${highPriorityIncomplete} high priority items remaining`,
                  status: "info",
                  duration: 2000,
                });
              }}
              color="blue.300"
              borderColor="blue.600"
              _hover={{ bg: "blue.800", borderColor: "blue.400" }}
            >
              High Priority ({vaultProcedures.filter(p => p.priority === 'high' && !checkedItems[p.id]).length})
            </Button>
            <Button 
              size="sm" 
              colorScheme="green" 
              variant="outline"
              onClick={() => {
                const nextIncomplete = vaultProcedures.find(p => !checkedItems[p.id]);
                if (nextIncomplete) {
                  toast({
                    title: "Next task",
                    description: nextIncomplete.label,
                    status: "info",
                    duration: 3000,
                  });
                }
              }}
              color="green.300"
              borderColor="green.600"
              _hover={{ bg: "green.800", borderColor: "green.400" }}
            >
              Next Task
            </Button>
            <Button 
              size="sm" 
              colorScheme="purple" 
              variant="outline"
              onClick={() => {
                const totalTime = vaultProcedures
                  .filter(p => !checkedItems[p.id])
                  .reduce((total, proc) => total + parseInt(proc.estimatedTime), 0);
                toast({
                  title: `${totalTime} minutes remaining`,
                  description: `${vaultProcedures.filter(p => !checkedItems[p.id]).length} tasks left`,
                  status: "info",
                  duration: 3000,
                });
              }}
              color="purple.300"
              borderColor="purple.600"
              _hover={{ bg: "purple.800", borderColor: "purple.400" }}
            >
              Time Remaining
            </Button>
          </HStack>
        )}

        {/* Flattened Workflow List */}
        <VStack spacing={2} align="stretch">
          {Object.entries(vaultWorkflows).map(([workflowId, workflow]) => {
            const workflowProcedures = filterProcedures(workflow.procedures);
            const workflowProgress = calculateProgress(workflow.procedures);
            const isWorkflowComplete = workflowProgress === 100;
            
            return (
              <Box key={workflowId}>
                {/* Workflow Group Header */}
                {informationLevel !== 'whisper' && (
                  <Box 
                    bg={`${workflow.color}.900`}
                    borderLeft="4px"
                    borderLeftColor={`${workflow.color}.400`}
                    p={3}
                    mb={2}
                    borderRadius="md"
                    border="1px"
                    borderColor={`${workflow.color}.700`}
                  >
                    <HStack justify="space-between" align="center">
                      <HStack>
                        <Text fontSize="lg">{workflow.icon}</Text>
                        <Heading size="sm" color={`${workflow.color}.200`}>
                          {workflow.name}
                        </Heading>
                        {informationLevel === 'shout' && (
                          <Badge colorScheme={workflow.color}>
                            {workflow.estimatedTime}
                          </Badge>
                        )}
                      </HStack>
                      <HStack>
                        {informationLevel === 'shout' && (
                          <Text fontSize="sm" color={`${workflow.color}.300`}>
                            {Math.round(workflowProgress)}% complete
                          </Text>
                        )}
                        <Box w={12}>
                          <Progress 
                            value={workflowProgress}
                            colorScheme={workflow.color}
                            size="sm"
                            borderRadius="md"
                            bg="gray.700"
                          />
                        </Box>
                      </HStack>
                    </HStack>
                  </Box>
                )}

                {/* Workflow Procedures */}
                <VStack spacing={2} align="stretch" pl={informationLevel === 'whisper' ? 0 : 4}>
                  {workflowProcedures.map((procedure, index) => (
                    <Box 
                      key={procedure.id}
                      p={informationLevel === 'whisper' ? 3 : 4} 
                      bg={checkedItems[procedure.id] ? "green.900" : "gray.800"}
                      border="1px" 
                      borderColor={checkedItems[procedure.id] ? 'green.600' : 'gray.600'}
                      borderLeft="4px"
                      borderLeftColor={
                        checkedItems[procedure.id] 
                          ? 'green.400' 
                          : procedure.priority === 'high' 
                            ? 'red.400' 
                            : `${workflow.color}.400`
                      }
                      borderRadius="md"
                      _hover={{ 
                        transform: "translateX(2px)",
                        boxShadow: "lg",
                        bg: checkedItems[procedure.id] ? "green.800" : "gray.700"
                      }}
                      transition="all 0.2s"
                      position="relative"
                    >
                      {/* Priority indicator dot */}
                      {procedure.priority === 'high' && !checkedItems[procedure.id] && (
                        <Box
                          position="absolute"
                          top={2}
                          right={2}
                          w={2}
                          h={2}
                          bg="red.400"
                          borderRadius="full"
                        />
                      )}

                      <Flex justify="space-between" align="center" mb={informationLevel === 'whisper' ? 0 : 2}>
                        <HStack flex={1} spacing={3}>
                          <Checkbox 
                            isChecked={checkedItems[procedure.id] || false}
                            onChange={() => handleCheckboxChange(procedure.id)}
                            size={informationLevel === 'whisper' ? 'md' : 'lg'}
                            colorScheme={workflow.color}
                          />
                          <Box flex={1}>
                            <Text 
                              fontSize={informationLevel === 'whisper' ? 'sm' : 'lg'} 
                              textDecoration={checkedItems[procedure.id] ? "line-through" : "none"}
                              color={checkedItems[procedure.id] ? "gray.400" : "white"}
                              fontWeight={procedure.priority === 'high' ? 'semibold' : 'normal'}
                            >
                              {informationLevel === 'whisper' ? procedure.shortLabel : procedure.label}
                            </Text>
                            {informationLevel === 'shout' && procedure.note && (
                              <Text fontSize="sm" color="blue.300" fontStyle="italic" mt={1}>
                                {procedure.note}
                              </Text>
                            )}
                            {informationLevel !== 'whisper' && (
                              <Box mt={2} pl={4} borderLeft="2px" borderLeftColor="gray.600">
                                {procedure.subProcedures?.map((subProc, subIndex) => (
                                  <Text key={subIndex} fontSize="sm" color="gray.300" mb={1}>
                                    • {subProc}
                                  </Text>
                                ))}
                              </Box>
                            )}
                            {/* Learning Mode - Educational Context */}
                            {learningMode && informationLevel !== 'whisper' && (
                              <Box mt={3} p={3} bg="green.900" borderRadius="md" borderLeft="3px" borderLeftColor="green.400" border="1px" borderColor="green.700">
                                <Text fontSize="sm" fontWeight="semibold" color="green.200" mb={1}>
                                  Why This Matters (Learning Mode)
                                </Text>
                                <Text fontSize="sm" color="green.300">
                                  {procedure.id.includes('setup') && 
                                    "Setup procedures establish baseline safety and positioning. Any errors here propagate through all subsequent measurements."
                                  }
                                  {procedure.id.includes('mech') && 
                                    "Mechanical accuracy directly affects patient positioning precision. ±2mm tolerance ensures treatment delivery accuracy."
                                  }
                                  {procedure.id.includes('dose') && 
                                    "Dosimetric constancy ensures consistent radiation dose delivery. Monthly monitoring detects equipment drift before it affects patients."
                                  }
                                  {procedure.id.includes('img') && 
                                    "Imaging accuracy is critical for IGRT. Patient positioning relies on these systems being calibrated within ±1mm."
                                  }
                                  {procedure.id.includes('mlc') && 
                                    "MLC precision enables complex treatment techniques like IMRT and VMAT. Leaf positioning accuracy affects dose distribution."
                                  }
                                  {procedure.id.includes('stereo') && 
                                    "Stereotactic procedures require submillimeter accuracy. Any systematic errors can result in geographical miss of small targets."
                                  }
                                </Text>
                              </Box>
                            )}
                          </Box>
                        </HStack>
                        
                        {informationLevel !== 'whisper' && (
                          <HStack spacing={2}>
                            <Badge 
                              colorScheme={getPriorityColor(procedure.priority)}
                              variant="subtle"
                              fontSize="xs"
                            >
                              {procedure.estimatedTime}
                            </Badge>
                            {/* Learning mode educational badge */}
                            {learningMode && (
                              <Tooltip 
                                label="Click for educational content about clinical significance" 
                                placement="top"
                              >
                                <Badge 
                                  colorScheme="green"
                                  variant="solid"
                                  fontSize="xs"
                                  cursor="pointer"
                                  onClick={() => showContextualHelp(['whyThisTest'])}
                                >
                                  Learn
                                </Badge>
                              </Tooltip>
                            )}
                            <Button 
                              size="sm" 
                              colorScheme="purple" 
                              variant="ghost"
                              onClick={() => showModal(procedure.details)}
                            >
                              Details
                            </Button>
                            {/* Smart contextual help - appears when likely needed */}
                            {(procedure.id.includes('setup') || procedure.id.includes('mech') || !checkedItems[procedure.id]) && (
                              <Tooltip label="Quick help for this step" placement="top">
                                <Button 
                                  size="sm" 
                                  colorScheme="blue"
                                  variant="ghost"
                                  onClick={() => {
                                    // Smart help suggestions based on procedure type
                                    let helpKeys = [];
                                    if (procedure.id.includes('setup')) {
                                      helpKeys = ['linacOperation', 'troubleshooting'];
                                    } else if (procedure.id.includes('dose')) {
                                      helpKeys = ['whyThisTest', 'troubleshooting'];
                                    } else {
                                      helpKeys = ['troubleshooting'];
                                    }
                                    showContextualHelp(helpKeys);
                                  }}
                                >
                                  Help
                                </Button>
                              </Tooltip>
                            )}
                            <Button 
                              size="sm" 
                              colorScheme="green"
                              variant="ghost"
                              onClick={() => toast({
                                title: "Photo Upload",
                                description: "Photo upload functionality coming soon!",
                                status: "info",
                                duration: 2000,
                                isClosable: true,
                              })}
                            >
                              Photo
                            </Button>
                          </HStack>
                        )}
                      </Flex>
                    </Box>
                  ))}
                </VStack>
              </Box>
            );
          })}
        </VStack>

        {/* Completion Celebration */}
        {calculateProgress(vaultProcedures) === 100 && (
          <Box 
            bg="gradient-to-r" 
            bgGradient="linear(to-r, green.400, blue.500)"
            color="white" 
            p={6} 
            borderRadius="lg" 
            textAlign="center"
            boxShadow="xl"
          >
            <Heading size="lg" mb={2}>{vaultName} Monthly QA Complete!</Heading>
            <Text mb={4} opacity={0.9}>
              Excellent work! All {vaultProcedures.length} procedures completed successfully.
            </Text>
            <HStack justify="center" spacing={4}>
              <Button 
                colorScheme="white" 
                variant="solid"
                color="green.600"
                onClick={() => toast({
                  title: "Monthly QA Complete!",
                  description: `${vaultName} documentation ready for review.`,
                  status: "success",
                  duration: 5000,
                  isClosable: true,
                })}
              >
                Generate Report
              </Button>
              <Button 
                colorScheme="whiteAlpha" 
                variant="outline"
                color="white"
                onClick={() => setActiveSection('home')}
              >
                Back to Home
              </Button>
            </HStack>
          </Box>
        )}
      </VStack>
    );
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'vault1':
        return renderVaultQA('vault1', 'Vault 1');
      case 'vault2':
        return renderVaultQA('vault2', 'Vault 2');
      case 'vault4':
        return renderVaultQA('vault4', 'Vault 4');
      case 'vault6':
        return renderVaultQA('vault6', 'Vault 6');
      case 'ct':
        return (
          <VStack spacing={6} align="stretch">
            <Breadcrumb color="gray.300">
              <BreadcrumbItem>
                <BreadcrumbLink onClick={() => setActiveSection('home')} color="gray.300" _hover={{ color: "white" }}>Home</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbItem isCurrentPage>
                <BreadcrumbLink color="white">CT Scanner</BreadcrumbLink>
              </BreadcrumbItem>
            </Breadcrumb>
            {renderInformationControls()}
            <Alert status="info" bg="blue.900" borderColor="blue.700" color="blue.200">
              <AlertIcon color="blue.300" />
              <Box>
                <AlertTitle color="blue.200">CT Scanner QA</AlertTitle>
                <AlertDescription color="blue.300">
                  CT scanner quality assurance procedures are being developed. Please check back soon.
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
      <Box bg="purple.900" color="white" p={6} mb={6} borderRadius="lg" border="1px" borderColor="purple.700">
        <Flex justify="space-between" align="center" flexWrap="wrap" gap={4}>
          <Box>
            <Heading size="md" mb={2}>Monthly QA Documentation System</Heading>
            <Text opacity={0.9}>Comprehensive quality assurance procedures for radiation therapy equipment</Text>
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

      {/* Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent bg="gray.800" color="white" borderColor="gray.600">
          <ModalHeader bg="purple.900" color="white" borderTopRadius="md">
            {modalContent.title}
          </ModalHeader>
          <ModalCloseButton color="white" />
          <ModalBody>
            <Box whiteSpace="pre-line" color="gray.200">
              {modalContent.content}
            </Box>
            {/* Add contextual help buttons in modal footer */}
            {modalContent.contextualHelp && (
              <Box mt={6} p={4} bg="gray.700" borderRadius="md" border="1px" borderColor="gray.600">
                <Text fontWeight="bold" mb={3} color="white">Related Help Topics</Text>
                <HStack spacing={2} flexWrap="wrap">
                  {modalContent.contextualHelp.map(helpKey => {
                    const helpData = contextualHelpData[helpKey];
                    if (!helpData) return null;
                    return (
                      <Button
                        key={helpKey}
                        size="sm"
                        variant="outline"
                        colorScheme="blue"
                        onClick={() => showContextualHelp([helpKey])}
                        color="blue.300"
                        borderColor="blue.600"
                        _hover={{ bg: "blue.800", borderColor: "blue.400" }}
                      >
                        {helpData.title}
                      </Button>
                    );
                  })}
                </HStack>
              </Box>
            )}
          </ModalBody>
          <ModalFooter bg="gray.700" borderBottomRadius="md">
            <Button colorScheme="purple" onClick={onClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default QAToolForm; 