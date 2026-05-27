import React, { useState, useEffect, useContext, useCallback, useRef } from 'react';
import { 
  Box, Container, Heading, Text, SimpleGrid,
  Card, CardHeader, CardBody, CardFooter,
  Button, HStack, VStack, Checkbox, IconButton,
  Tabs, TabList, TabPanels, Tab, TabPanel,
  Table, Thead, Tbody, Tr, Th, Td,
  Input, Flex, Tag, TagLabel, TagCloseButton, Wrap, WrapItem,
  useToast, Switch, FormControl, FormLabel, Center,
} from '@chakra-ui/react';
import { AddIcon, MinusIcon, DeleteIcon, EditIcon, LockIcon } from '@chakra-ui/icons';
import { useRouter } from 'next/router';
import UpdateNotification from '../components/UpdateNotification';
import SettingsEditor from '../components/SettingsEditor';
import { ClinicProfileContext } from './_app';
import {
  listProfiles,
  createProfile,
  verifyEditCode,
  updateProfile,
  activateProfile,
  deleteProfile,
} from '../services/settingsService';

const DEFAULT_VISIBLE_MODULES = {
  fusion: true, prior_dose: true, pacemaker: true,
  sbrt: true, srs: true, tbi: true, hdr: true, dibh: true
};

const DEFAULT_FACILITY_DEFAULTS = {
  srs: {
    planning_system: "BrainLAB Elements",
    accelerator: "Versa HD",
    tracking_system: "ExacTrac",
    immobilization_device: "rigid aquaplast head mask",
    mri_sequence: "T1-weighted, post Gd contrast",
    ct_slice_thickness: 1.25
  },
  tbi: {
    energy: "6 MV",
    dose_rate_range: "10 - 15 cGy/min",
    machine_dose_rate: "200 MU/min"
  },
  sbrt: {
    planning_system: "Pinnacle",
    accelerator: "VersaHD",
    imaging_system: "kV-CBCT",
    gating_system: "C-RAD CatalystHD"
  },
  hdr: {
    afterloader: "ELEKTA Ir-192 remote afterloader",
    planning_system: "Oncentra",
    ct_slice_thickness: 3.0
  },
  dibh: {
    scanning_system: "C-RAD",
    gating_device: "C-RAD CatalystHD"
  }
};

const DEFAULT_MODULE_PRESETS = {
  sbrt: {
    treatment_sites: [
      { id: "liver", label: "Liver" },
      { id: "lung", label: "Lung" },
      { id: "prostate", label: "Prostate" },
      { id: "breast", label: "Breast" },
      { id: "kidney", label: "Kidney" },
      { id: "pancreas", label: "Pancreas" }
    ],
    breathing_techniques: [
      { value: "freebreathe", label: "FB" },
      { value: "4DCT", label: "4DCT" },
      { value: "DIBH", label: "DIBH" }
    ]
  },
  srs: {
    srs_dose_presets: [14, 16, 18, 20, 22],
    srt_dose_presets: [
      { dose: 18, fractions: 3 },
      { dose: 25, fractions: 5 },
      { dose: 30, fractions: 5 }
    ]
  },
  tbi: {
    regimens: {
      "2gy1fx": { dose: 2.0, fractions: 1, lung_blocks: "none" },
      "4gy1fx": { dose: 4.0, fractions: 1, lung_blocks: "none" },
      "12gy6fx": { dose: 12.0, fractions: 6, lung_blocks: null },
      "13.2gy8fx": { dose: 13.2, fractions: 8, lung_blocks: null }
    },
    setup_options: ["AP/PA", "Lateral"],
    hvl_options: ["1 HVL", "2 HVL", "3 HVL"]
  },
  dibh: {
    treatment_sites: ["left breast", "right breast", "diaphragm", "chest wall"],
    rx_presets: [
      { dose: 50, fractions: 25 },
      { dose: 40, fractions: 15 }
    ],
    boost_presets: [
      { dose: 10, fractions: 5 },
      { dose: 16, fractions: 8 }
    ]
  },
  hdr: {
    applicators: [
      { type: "VC", site: "gynecological", channels: 1 },
      { type: "T&O", site: "gynecological", channels: 3 },
      { type: "Hybrid T&O", site: "gynecological", channels: null },
      { type: "SYED-Gyn", site: "gynecological", channels: null },
      { type: "SYED-Prostate", site: "prostate", channels: null }
    ]
  },
  fusion: {
    anatomical_regions: [
      { value: "brain", label: "Brain" },
      { value: "head and neck", label: "Head & Neck" },
      { value: "thoracic", label: "Thoracic" },
      { value: "abdominal", label: "Abdominal" },
      { value: "pelvic", label: "Pelvic" },
      { value: "spinal", label: "Spinal" }
    ]
  },
  prior_dose: {
    region_order: [
      "CNS", "Optics & Hearing", "Head & Neck", "Thorax",
      "Abdomen", "Pelvis", "Extremity", "Custom", "Other"
    ],
    region_colors: {
      "CNS": "purple",
      "Optics & Hearing": "cyan",
      "Head & Neck": "teal",
      "Thorax": "orange",
      "Abdomen": "yellow",
      "Pelvis": "pink",
      "Extremity": "green",
      "Custom": "blue",
      "Other": "gray"
    }
  }
};

const HomePage = () => {
  const router = useRouter();
  const toast = useToast();
  const { activeProfile, refreshProfile } = useContext(ClinicProfileContext);

  // Profile management state
  const [profiles, setProfiles] = useState([]);
  const [selectedProfileId, setSelectedProfileId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editPhysicians, setEditPhysicians] = useState([]);
  const [editPhysicists, setEditPhysicists] = useState([]);
  const [newPhysician, setNewPhysician] = useState('');
  const [newPhysicist, setNewPhysicist] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editIcon, setEditIcon] = useState(null);
  const iconInputRef = useRef(null);
  const [editVisibleModules, setEditVisibleModules] = useState({ ...DEFAULT_VISIBLE_MODULES });
  const [editFacilityDefaults, setEditFacilityDefaults] = useState(JSON.parse(JSON.stringify(DEFAULT_FACILITY_DEFAULTS)));
  const [editModulePresets, setEditModulePresets] = useState(JSON.parse(JSON.stringify(DEFAULT_MODULE_PRESETS)));
  const [editCode, setEditCode] = useState('');
  const [editCodeForCreate, setEditCodeForCreate] = useState('');
  const [editCodeUnlocked, setEditCodeUnlocked] = useState(false);
  const [editCodePromptId, setEditCodePromptId] = useState(null);
  const [editCodeInput, setEditCodeInput] = useState('');
  const [editCodeError, setEditCodeError] = useState('');

  const fetchProfiles = useCallback(async () => {
    try {
      const data = await listProfiles();
      setProfiles(data);
    } catch {
      // profiles stay empty
    }
  }, []);

  useEffect(() => { fetchProfiles(); }, [fetchProfiles]);

  const deepMerge = (defaults, override) => {
    if (!override || typeof override !== 'object') return JSON.parse(JSON.stringify(defaults));
    const result = JSON.parse(JSON.stringify(defaults));
    for (const key of Object.keys(override)) {
      if (override[key] && typeof override[key] === 'object' && !Array.isArray(override[key]) && result[key] && typeof result[key] === 'object' && !Array.isArray(result[key])) {
        result[key] = deepMerge(result[key], override[key]);
      } else {
        result[key] = JSON.parse(JSON.stringify(override[key]));
      }
    }
    return result;
  };

  const selectProfile = (profile) => {
    setSelectedProfileId(profile.id);
    setEditName(profile.name);
    setEditPhysicians([...profile.physicians]);
    setEditPhysicists([...profile.physicists]);
    setEditVisibleModules({ ...DEFAULT_VISIBLE_MODULES, ...(profile.visible_modules || {}) });
    setEditFacilityDefaults(deepMerge(DEFAULT_FACILITY_DEFAULTS, profile.facility_defaults));
    setEditModulePresets(deepMerge(DEFAULT_MODULE_PRESETS, profile.module_presets));
    setEditIcon(profile.icon || null);
    setEditCode('');
    setEditCodeUnlocked(false);
    setEditCodeError('');
    setIsCreating(false);
  };

  const startNewProfile = () => {
    setSelectedProfileId(null);
    setEditName('');
    setEditPhysicians([]);
    setEditPhysicists([]);
    setEditVisibleModules({ ...DEFAULT_VISIBLE_MODULES });
    setEditFacilityDefaults(JSON.parse(JSON.stringify(DEFAULT_FACILITY_DEFAULTS)));
    setEditModulePresets(JSON.parse(JSON.stringify(DEFAULT_MODULE_PRESETS)));
    setEditIcon(null);
    setEditCodeForCreate('');
    setEditCode('');
    setEditCodeUnlocked(false);
    setEditCodeError('');
    setIsCreating(true);
  };

  const handleSave = async () => {
    if (!editName.trim()) {
      toast({ title: 'Profile name is required', status: 'warning', duration: 2000 });
      return;
    }
    if (isCreating && !editCodeForCreate.trim()) {
      toast({ title: 'Edit code is required', description: 'Set a code so only you can edit this profile.', status: 'warning', duration: 3000 });
      return;
    }
    setSaving(true);
    try {
      let savedProfile;
      if (isCreating) {
        const payload = {
          name: editName.trim(),
          edit_code: editCodeForCreate.trim(),
          physicians: editPhysicians,
          physicists: editPhysicists,
          visible_modules: editVisibleModules,
          facility_defaults: editFacilityDefaults,
          module_presets: editModulePresets,
          icon: editIcon,
        };
        savedProfile = await createProfile(payload);
        setIsCreating(false);
        toast({ title: 'Profile created', status: 'success', duration: 2000 });
      } else {
        const payload = {
          edit_code: editCode,
          name: editName.trim(),
          physicians: editPhysicians,
          physicists: editPhysicists,
          visible_modules: editVisibleModules,
          facility_defaults: editFacilityDefaults,
          module_presets: editModulePresets,
          icon: editIcon,
        };
        savedProfile = await updateProfile(selectedProfileId, payload);
        toast({ title: 'Profile saved', status: 'success', duration: 2000 });
      }
      await fetchProfiles();
      await refreshProfile();
      selectProfile(savedProfile);
    } catch (err) {
      const detail = err.response?.data?.detail || err.message;
      if (err.response?.status === 403) {
        toast({ title: 'Incorrect edit code', status: 'error', duration: 3000 });
        setEditCodeUnlocked(false);
        setEditCode('');
      } else {
        toast({ title: 'Error saving profile', description: detail, status: 'error', duration: 3000 });
      }
    } finally {
      setSaving(false);
    }
  };

  const handleActivate = async (id) => {
    setProfiles(prev => prev.map(p => ({ ...p, is_active: p.id === id })));
    try {
      await activateProfile(id);
      await fetchProfiles();
      await refreshProfile();
      toast({ title: 'Profile activated', status: 'success', duration: 2000 });
    } catch (err) {
      await fetchProfiles();
      toast({ title: 'Error activating profile', description: err.message, status: 'error', duration: 3000 });
    }
  };

  const handleDeleteRequest = (id) => {
    const profile = profiles.find(p => p.id === id);
    if (profile?.has_edit_code) {
      setEditCodePromptId(id);
      setEditCodeInput('');
      setEditCodeError('');
    } else {
      performDelete(id, '');
    }
  };

  const performDelete = async (id, code) => {
    if (!window.confirm('Are you sure you want to delete this profile?')) return;
    try {
      await deleteProfile(id, code);
      setEditCodePromptId(null);
      if (selectedProfileId === id) {
        setSelectedProfileId(null);
        setEditName('');
        setEditPhysicians([]);
        setEditPhysicists([]);
        setEditVisibleModules({ ...DEFAULT_VISIBLE_MODULES });
        setEditFacilityDefaults(JSON.parse(JSON.stringify(DEFAULT_FACILITY_DEFAULTS)));
        setEditModulePresets(JSON.parse(JSON.stringify(DEFAULT_MODULE_PRESETS)));
        setEditIcon(null);
      }
      await fetchProfiles();
      await refreshProfile();
      toast({ title: 'Profile deleted', status: 'info', duration: 2000 });
    } catch (err) {
      if (err.response?.status === 403) {
        setEditCodeError('Incorrect edit code');
      } else {
        toast({ title: 'Error deleting profile', description: err.response?.data?.detail || err.message, status: 'error', duration: 3000 });
      }
    }
  };

  const handleUnlockProfile = async () => {
    if (!editCode.trim()) return;
    try {
      await verifyEditCode(selectedProfileId, editCode.trim());
      setEditCodeUnlocked(true);
      setEditCodeError('');
    } catch (err) {
      if (err.response?.status === 403) {
        setEditCodeError('Incorrect edit code');
      } else {
        setEditCodeError('Error verifying code');
      }
      setEditCodeUnlocked(false);
    }
  };

  const addName = (list, setList, value, setValue) => {
    const trimmed = value.trim();
    if (trimmed && !list.includes(trimmed)) {
      setList([...list, trimmed].sort());
      setValue('');
    }
  };

  const removeName = (list, setList, name) => {
    setList(list.filter(n => n !== name));
  };

  const handleIconSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new window.Image();
      img.onload = () => {
        const MAX = 200;
        let w = img.width, h = img.height;
        if (w > MAX || h > MAX) {
          const scale = MAX / Math.max(w, h);
          w = Math.round(w * scale);
          h = Math.round(h * scale);
        }
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        canvas.getContext('2d').drawImage(img, 0, 0, w, h);
        setEditIcon(canvas.toDataURL('image/png'));
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

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
          {(activeProfile?.visible_modules?.fusion !== false) && (
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
          )}

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
                {[
                  { label: 'Prior Dose', color: 'purple', visKey: 'prior_dose', section: 'prior', isActive: () => mpcChecklist.prior, onClick: () => toggleMpcItem('prior') },
                  { label: 'Pacemaker', color: 'purple', visKey: 'pacemaker', section: 'pacemaker', isActive: () => mpcChecklist.pacemaker.enabled, onClick: () => toggleMpcItem('pacemaker', 'enabled') },
                  { label: 'SBRT', color: 'orange', visKey: 'sbrt', isActive: () => mpcChecklist.specialTreatmentTypes.sbrt, onClick: () => toggleMpcItem('specialTreatmentTypes', 'sbrt') },
                  { label: 'SRS/SRT', color: 'orange', visKey: 'srs', isActive: () => mpcChecklist.specialTreatmentTypes.srs, onClick: () => toggleMpcItem('specialTreatmentTypes', 'srs') },
                  { label: 'TBI', color: 'orange', visKey: 'tbi', isActive: () => mpcChecklist.specialTreatmentTypes.tbi, onClick: () => toggleMpcItem('specialTreatmentTypes', 'tbi') },
                  { label: 'HDR', color: 'orange', visKey: 'hdr', isActive: () => mpcChecklist.specialTreatmentTypes.hdr, onClick: () => toggleMpcItem('specialTreatmentTypes', 'hdr') },
                  { label: 'DIBH', color: 'teal', visKey: 'dibh', isActive: () => mpcChecklist.dibh, onClick: () => toggleMpcItem('dibh') },
                ].map(({ label, color, visKey, isActive, onClick }) => {
                  if (activeProfile?.visible_modules?.[visKey] === false) return null;
                  const active = isActive();
                  return (
                    <Button
                      key={visKey}
                      size="md"
                      variant={active ? "solid" : "outline"}
                      colorScheme={active ? color : "gray"}
                      onClick={onClick}
                      borderColor="gray.600"
                      color={active ? "white" : "gray.300"}
                      _hover={{
                        bg: active ? `${color}.600` : "gray.700",
                        borderColor: active ? `${color}.300` : "gray.500"
                      }}
                    >
                      {label}
                    </Button>
                  );
                })}
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
              <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={8}>

                {/* Left: Profile List */}
                <Card bg="gray.800" borderTop="4px" borderTopColor="purple.400" borderColor="gray.600">
                  <CardHeader>
                    <Heading size="lg" color="purple.200" textAlign="center">
                      Clinic Profiles
                    </Heading>
                  </CardHeader>
                  <CardBody>
                    {profiles.length === 0 && !isCreating && (
                      <Text color="gray.400" textAlign="center" fontSize="sm" mb={4}>
                        No profiles yet. Create one to get started.
                      </Text>
                    )}
                    <SimpleGrid columns={{ base: 2, lg: 3 }} spacing={4}>
                      {profiles.map(p => (
                        <VStack
                          key={p.id}
                          p={4}
                          bg={selectedProfileId === p.id ? 'purple.600' : 'gray.700'}
                          borderRadius="lg"
                          border="2px"
                          borderColor={p.is_active ? 'green.400' : selectedProfileId === p.id ? 'purple.400' : 'gray.600'}
                          cursor="pointer"
                          onClick={() => selectProfile(p)}
                          spacing={2}
                          minH="160px"
                          justify="center"
                          position="relative"
                          transition="all 0.15s"
                          _hover={{
                            bg: selectedProfileId === p.id ? 'purple.600' : 'gray.600',
                            borderColor: selectedProfileId === p.id ? 'purple.400' : 'gray.500',
                            transform: 'translateY(-2px)',
                            boxShadow: 'lg',
                          }}
                        >
                          {p.icon ? (
                            <Box
                              w="64px"
                              h="64px"
                              borderRadius="md"
                              overflow="hidden"
                              flexShrink={0}
                            >
                              <img
                                src={p.icon}
                                alt={p.name}
                                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                              />
                            </Box>
                          ) : (
                            <Center
                              w="64px"
                              h="64px"
                              borderRadius="md"
                              bg={p.is_active ? 'green.500' : 'purple.500'}
                              color="white"
                              fontSize="xl"
                              fontWeight="bold"
                              flexShrink={0}
                            >
                              {p.name?.charAt(0)?.toUpperCase() || '?'}
                            </Center>
                          )}
                          <Text color="white" fontSize="sm" fontWeight="semibold" textAlign="center" noOfLines={2}>
                            {p.name}
                          </Text>
                          <HStack spacing={1} mt="auto">
                            {p.is_active ? (
                              <Tag size="sm" colorScheme="green" variant="solid">
                                <TagLabel>Active</TagLabel>
                              </Tag>
                            ) : (
                              <Button
                                size="xs"
                                variant="outline"
                                color="gray.300"
                                borderColor="gray.500"
                                _hover={{ bg: 'gray.600' }}
                                onClick={(e) => { e.stopPropagation(); handleActivate(p.id); }}
                              >
                                Activate
                              </Button>
                            )}
                            {!p.is_system && (
                              <IconButton
                                icon={<DeleteIcon />}
                                size="xs"
                                colorScheme="red"
                                variant="ghost"
                                color="red.300"
                                _hover={{ bg: 'red.900' }}
                                onClick={(e) => { e.stopPropagation(); handleDeleteRequest(p.id); }}
                                aria-label="Delete profile"
                              />
                            )}
                          </HStack>
                        </VStack>
                      ))}
                      {/* New Profile tile */}
                      <VStack
                        p={4}
                        bg="transparent"
                        borderRadius="lg"
                        border="2px dashed"
                        borderColor="purple.500"
                        cursor="pointer"
                        onClick={startNewProfile}
                        spacing={2}
                        minH="160px"
                        justify="center"
                        transition="all 0.15s"
                        _hover={{
                          bg: 'purple.900',
                          borderColor: 'purple.300',
                          transform: 'translateY(-2px)',
                          boxShadow: 'lg',
                        }}
                      >
                        <Center
                          w="64px"
                          h="64px"
                          borderRadius="full"
                          bg="purple.500"
                          color="white"
                        >
                          <AddIcon boxSize={5} />
                        </Center>
                        <Text color="purple.300" fontSize="sm" fontWeight="semibold">
                          New Profile
                        </Text>
                      </VStack>
                    </SimpleGrid>
                  </CardBody>
                </Card>

                {/* Delete edit code prompt */}
                {editCodePromptId && (
                  <Card bg="gray.800" borderTop="4px" borderTopColor="red.400" borderColor="gray.600">
                    <CardHeader>
                      <Heading size="lg" color="red.200" textAlign="center">Enter Edit Code to Delete</Heading>
                    </CardHeader>
                    <CardBody>
                      <VStack spacing={4}>
                        <Input
                          type="password"
                          value={editCodeInput}
                          onChange={(e) => { setEditCodeInput(e.target.value); setEditCodeError(''); }}
                          placeholder="Enter edit code"
                          bg="gray.700" borderColor="gray.600" color="white" size="sm"
                          _placeholder={{ color: 'gray.500' }}
                          onKeyDown={(e) => { if (e.key === 'Enter') performDelete(editCodePromptId, editCodeInput.trim()); }}
                        />
                        {editCodeError && <Text color="red.300" fontSize="xs">{editCodeError}</Text>}
                        <HStack w="100%">
                          <Button flex={1} variant="outline" color="gray.300" borderColor="gray.500" onClick={() => setEditCodePromptId(null)}>Cancel</Button>
                          <Button flex={1} colorScheme="red" onClick={() => performDelete(editCodePromptId, editCodeInput.trim())}>Delete</Button>
                        </HStack>
                      </VStack>
                    </CardBody>
                  </Card>
                )}

                {/* Right: Profile Editor */}
                {(selectedProfileId || isCreating) && (() => {
                  const selectedProfile = !isCreating && profiles.find(p => p.id === selectedProfileId);
                  const selectedIsSystem = selectedProfile?.is_system;
                  const needsUnlock = !isCreating && !selectedIsSystem && selectedProfile?.has_edit_code && !editCodeUnlocked;
                  return (
                  <Card bg="gray.800" borderTop="4px" borderTopColor="blue.400" borderColor="gray.600">
                    <CardHeader>
                      <Heading size="lg" color="blue.200" textAlign="center">
                        {isCreating ? 'New Profile' : selectedIsSystem ? 'View Profile' : needsUnlock ? 'Locked Profile' : 'Edit Profile'}
                      </Heading>
                      {selectedIsSystem && (
                        <Text color="gray.400" fontSize="xs" textAlign="center" mt={2}>
                          System profiles are read-only. Create a new profile to customize settings.
                        </Text>
                      )}
                    </CardHeader>
                    {needsUnlock ? (
                      <CardBody>
                        <VStack spacing={4} py={8}>
                          <LockIcon boxSize={8} color="blue.300" />
                          <Text color="gray.300" fontSize="sm" textAlign="center">
                            Enter the edit code to modify this profile.
                          </Text>
                          <Box w="100%" maxW="300px">
                            <Input
                              type="password"
                              value={editCode}
                              onChange={(e) => { setEditCode(e.target.value); setEditCodeError(''); }}
                              placeholder="Edit code"
                              bg="gray.700" borderColor="gray.600" color="white" size="sm"
                              _placeholder={{ color: 'gray.500' }}
                              onKeyDown={(e) => { if (e.key === 'Enter') handleUnlockProfile(); }}
                            />
                            {editCodeError && <Text color="red.300" fontSize="xs" mt={1}>{editCodeError}</Text>}
                          </Box>
                          <Button colorScheme="blue" size="md" onClick={handleUnlockProfile} isDisabled={!editCode.trim()}>
                            Unlock
                          </Button>
                        </VStack>
                      </CardBody>
                    ) : (
                    <>
                    <CardBody>
                      <VStack spacing={5} align="stretch">
                        {/* Profile Icon */}
                        <Center>
                          <input
                            type="file"
                            accept="image/*"
                            ref={iconInputRef}
                            onChange={handleIconSelect}
                            style={{ display: 'none' }}
                          />
                          <Box
                            position="relative"
                            cursor={selectedIsSystem ? 'default' : 'pointer'}
                            onClick={() => !selectedIsSystem && iconInputRef.current?.click()}
                            role="group"
                          >
                            {editIcon ? (
                              <Box
                                w="96px"
                                h="96px"
                                borderRadius="lg"
                                overflow="hidden"
                                border="2px solid"
                                borderColor="gray.600"
                                _groupHover={selectedIsSystem ? {} : { borderColor: 'blue.400' }}
                              >
                                <img
                                  src={editIcon}
                                  alt="Profile icon"
                                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                                />
                              </Box>
                            ) : (
                              <Center
                                w="96px"
                                h="96px"
                                borderRadius="lg"
                                bg="purple.500"
                                color="white"
                                fontSize="3xl"
                                fontWeight="bold"
                                border="2px solid"
                                borderColor="gray.600"
                                _groupHover={selectedIsSystem ? {} : { borderColor: 'blue.400' }}
                              >
                                {editName?.charAt(0)?.toUpperCase() || '?'}
                              </Center>
                            )}
                            {!selectedIsSystem && (
                              <Center
                                position="absolute"
                                bottom={-1}
                                right={-1}
                                w="28px"
                                h="28px"
                                borderRadius="full"
                                bg="blue.500"
                                border="2px solid"
                                borderColor="gray.800"
                                _groupHover={{ bg: 'blue.400' }}
                              >
                                <EditIcon boxSize={3} color="white" />
                              </Center>
                            )}
                          </Box>
                        </Center>
                        {editIcon && !selectedIsSystem && (
                          <Center>
                            <Button
                              size="xs"
                              variant="ghost"
                              colorScheme="red"
                              onClick={() => setEditIcon(null)}
                            >
                              Remove Icon
                            </Button>
                          </Center>
                        )}
                        {/* Profile Name */}
                        <Box>
                          <Text color="gray.300" fontSize="sm" mb={2}>Profile Name</Text>
                          <Input
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            placeholder="e.g. My Clinic"
                            bg="gray.700"
                            borderColor="gray.600"
                            color="white"
                            size="sm"
                            isReadOnly={selectedIsSystem}
                            _placeholder={{ color: 'gray.500' }}
                            _hover={{ borderColor: 'gray.500' }}
                          />
                        </Box>

                        {isCreating && (
                          <Box>
                            <Text color="gray.300" fontSize="sm" mb={1}>Edit Code</Text>
                            <Text color="gray.500" fontSize="xs" mb={2}>
                              Choose a word or phrase to protect this profile from edits.
                            </Text>
                            <Input
                              type="password"
                              value={editCodeForCreate}
                              onChange={(e) => setEditCodeForCreate(e.target.value)}
                              placeholder="e.g. coffee, mypass, 1234"
                              bg="gray.700"
                              borderColor="gray.600"
                              color="white"
                              size="sm"
                              _placeholder={{ color: 'gray.500' }}
                              _hover={{ borderColor: 'gray.500' }}
                            />
                          </Box>
                        )}

                        {/* Module Visibility */}
                        <Box
                          p={4}
                          bg="gray.700"
                          borderRadius="md"
                          border="1px"
                          borderColor="green.600"
                        >
                          <Text color="green.200" fontSize="sm" mb={3}>Enabled Modules</Text>
                          <SimpleGrid columns={2} spacing={3}>
                            {[
                              { key: 'fusion', label: 'Fusion' },
                              { key: 'prior_dose', label: 'Prior Dose' },
                              { key: 'pacemaker', label: 'Pacemaker' },
                              { key: 'sbrt', label: 'SBRT' },
                              { key: 'srs', label: 'SRS/SRT' },
                              { key: 'tbi', label: 'TBI' },
                              { key: 'hdr', label: 'HDR' },
                              { key: 'dibh', label: 'DIBH' },
                            ].map(mod => (
                              <FormControl key={mod.key} display="flex" alignItems="center" justifyContent="space-between">
                                <FormLabel htmlFor={`vis-${mod.key}`} mb="0" color="gray.300" fontSize="xs">{mod.label}</FormLabel>
                                <Switch
                                  id={`vis-${mod.key}`}
                                  colorScheme="green"
                                  size="md"
                                  isChecked={editVisibleModules[mod.key] !== false}
                                  isDisabled={selectedIsSystem}
                                  onChange={(e) => setEditVisibleModules(prev => ({ ...prev, [mod.key]: e.target.checked }))}
                                />
                              </FormControl>
                            ))}
                          </SimpleGrid>
                        </Box>

                        <SettingsEditor
                          editVisibleModules={editVisibleModules}
                          editFacilityDefaults={editFacilityDefaults}
                          setEditFacilityDefaults={setEditFacilityDefaults}
                          editModulePresets={editModulePresets}
                          setEditModulePresets={setEditModulePresets}
                          editPhysicians={editPhysicians}
                          setEditPhysicians={setEditPhysicians}
                          editPhysicists={editPhysicists}
                          setEditPhysicists={setEditPhysicists}
                          newPhysician={newPhysician}
                          setNewPhysician={setNewPhysician}
                          newPhysicist={newPhysicist}
                          setNewPhysicist={setNewPhysicist}
                          addName={addName}
                          removeName={removeName}
                          readOnly={!!selectedIsSystem}
                        />
                      </VStack>
                    </CardBody>
                    {!selectedIsSystem && (
                      <CardFooter>
                        <Button
                          colorScheme="green"
                          width="100%"
                          size="md"
                          onClick={handleSave}
                          isLoading={saving}
                          loadingText="Saving..."
                        >
                          {isCreating ? 'Create Profile' : 'Save Changes'}
                        </Button>
                      </CardFooter>
                    )}
                    </>
                    )}
                  </Card>
                  );
                })()}

              </SimpleGrid>
            </TabPanel>
          </TabPanels>
        </Container>
      </Tabs>
    </Box>
  );
};

export default HomePage; 