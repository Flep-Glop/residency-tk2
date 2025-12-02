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
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Grid,
  GridItem,
  Text,
  Textarea,
  useToast,
  Card,
  CardBody,
  IconButton,
  HStack,
  VStack,
  List,
  ListItem,
  Checkbox,
  Alert,
  AlertIcon,
  Badge,
  Tooltip,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Flex,
} from '@chakra-ui/react';
import { getLesionRegions, getModalities, getRegistrationMethods, generateFusionWriteup } from '../../services/fusionService';

const FusionForm = () => {
  const router = useRouter();
  const [lesionRegions, setLesionRegions] = useState({});
  const [modalities, setModalities] = useState([]);
  const [registrationMethods, setRegistrationMethods] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [writeup, setWriteup] = useState('');
  const toast = useToast();
  const [physicians, setPhysicians] = useState(['Dalwadi', 'Galvan', 'Ha', 'Kluwe', 'Le', 'Lewis', 'Tuli']);
  const [physicists, setPhysicists] = useState(['Bassiri', 'Kirby', 'Papanikolaou', 'Paschal', 'Rasmussen']);
  const [selectedSecondaryModality, setSelectedSecondaryModality] = useState('');
  const initialLoadRef = useRef(true);
  const [isCustomLesion, setIsCustomLesion] = useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [indexToRemove, setIndexToRemove] = useState(null);
  const cancelRef = useRef();
  
  // Parse configuration from router query
  const [parsedConfig, setParsedConfig] = useState(null);
  const [fusionMode, setFusionMode] = useState(null); // 'single-mri', 'single-pet-rigid', 'single-pet-deformable', or 'complex'
  
  useEffect(() => {
    if (router.isReady) {
      if (router.query.config) {
        try {
          const config = JSON.parse(decodeURIComponent(router.query.config));
          setParsedConfig(config);
          
          // Determine fusion mode based on config
          const mriCount = config.mri?.rigid || 0;
          const petRigidCount = config.pet?.rigid || 0;
          const petDeformableCount = config.pet?.deformable || 0;
          const ctRigidCount = config.ct?.rigid || 0;
          const ctDeformableCount = config.ct?.deformable || 0;
          const totalFusions = mriCount + petRigidCount + petDeformableCount + ctRigidCount + ctDeformableCount;
          
          if (totalFusions === 1) {
            if (mriCount === 1) {
              setFusionMode('single-mri');
            } else if (petRigidCount === 1 && petDeformableCount === 0) {
              setFusionMode('single-pet-rigid');
            } else if (petDeformableCount === 1 && petRigidCount === 0) {
              setFusionMode('single-pet-deformable');
            } else if (ctRigidCount === 1 && ctDeformableCount === 0) {
              setFusionMode('single-ct-rigid');
            } else if (ctDeformableCount === 1 && ctRigidCount === 0) {
              setFusionMode('single-ct-deformable');
            } else {
              setFusionMode('complex');
            }
          } else if (mriCount > 1 && totalFusions === mriCount) {
            // Multiple MRI registrations only
            setFusionMode('multiple-mri');
          } else if (petRigidCount > 1 && totalFusions === petRigidCount) {
            // Multiple PET/CT rigid registrations only
            setFusionMode('multiple-pet-rigid');
          } else if (petDeformableCount > 1 && totalFusions === petDeformableCount) {
            // Multiple PET/CT deformable registrations only
            setFusionMode('multiple-pet-deformable');
          } else if (petRigidCount > 0 && petDeformableCount > 0 && (petRigidCount + petDeformableCount) > 1 && totalFusions === (petRigidCount + petDeformableCount)) {
            // Multiple PET/CT rigid and deformable registrations (any combination)
            setFusionMode('multiple-pet-rigid-deformable');
          } else if (ctRigidCount > 1 && totalFusions === ctRigidCount) {
            // Multiple CT/CT rigid registrations only
            setFusionMode('multiple-ct-rigid');
          } else if (ctDeformableCount > 1 && totalFusions === ctDeformableCount) {
            // Multiple CT/CT deformable registrations only
            setFusionMode('multiple-ct-deformable');
          } else if (ctRigidCount > 0 && ctDeformableCount > 0 && (ctRigidCount + ctDeformableCount) > 1 && totalFusions === (ctRigidCount + ctDeformableCount)) {
            // Multiple CT/CT rigid and deformable registrations (any combination)
            setFusionMode('multiple-ct-rigid-deformable');
          } else if (mriCount > 0 && (petRigidCount > 0 || petDeformableCount > 0) && totalFusions === (mriCount + petRigidCount + petDeformableCount)) {
            // Mixed MRI + PET combinations
            if (mriCount === 1 && petRigidCount === 1 && petDeformableCount === 0) {
              setFusionMode('mri-pet-single-rigid');
            } else if (mriCount === 1 && petDeformableCount === 1 && petRigidCount === 0) {
              setFusionMode('mri-pet-single-deformable');
            } else if (mriCount > 1 && petRigidCount === 1 && petDeformableCount === 0) {
              setFusionMode('mri-pet-multiple-mri-single-rigid');
            } else if (mriCount > 1 && petDeformableCount === 1 && petRigidCount === 0) {
              setFusionMode('mri-pet-multiple-mri-single-deformable');
            } else if (mriCount === 1 && (petRigidCount + petDeformableCount) > 1) {
              if (petRigidCount > 0 && petDeformableCount > 0) {
                setFusionMode('mri-pet-single-mri-multiple-mixed');
              } else if (petRigidCount > 1) {
                setFusionMode('mri-pet-single-mri-multiple-rigid');
              } else {
                setFusionMode('mri-pet-single-mri-multiple-deformable');
              }
            } else {
              // Multiple MRI + Multiple PET
              setFusionMode('mri-pet-multiple-both');
            }
          } else if (mriCount > 0 && (ctRigidCount > 0 || ctDeformableCount > 0) && totalFusions === (mriCount + ctRigidCount + ctDeformableCount)) {
            // Mixed MRI + CT combinations
            if (mriCount === 1 && ctRigidCount === 1 && ctDeformableCount === 0) {
              setFusionMode('mri-ct-single-rigid');
            } else if (mriCount === 1 && ctDeformableCount === 1 && ctRigidCount === 0) {
              setFusionMode('mri-ct-single-deformable');
            } else if (mriCount > 1 && ctRigidCount === 1 && ctDeformableCount === 0) {
              setFusionMode('mri-ct-multiple-mri-single-rigid');
            } else if (mriCount > 1 && ctDeformableCount === 1 && ctRigidCount === 0) {
              setFusionMode('mri-ct-multiple-mri-single-deformable');
            } else if (mriCount === 1 && (ctRigidCount + ctDeformableCount) > 1) {
              if (ctRigidCount > 0 && ctDeformableCount > 0) {
                setFusionMode('mri-ct-single-mri-multiple-mixed');
              } else if (ctRigidCount > 1) {
                setFusionMode('mri-ct-single-mri-multiple-rigid');
              } else {
                setFusionMode('mri-ct-single-mri-multiple-deformable');
              }
            } else {
              // Multiple MRI + Multiple CT
              setFusionMode('mri-ct-multiple-both');
            }
          } else if (mriCount > 0 && (ctRigidCount > 0 || ctDeformableCount > 0) && (petRigidCount > 0 || petDeformableCount > 0) && 
                     totalFusions === (mriCount + ctRigidCount + ctDeformableCount + petRigidCount + petDeformableCount)) {
            // Ultimate MRI + CT + PET combinations (3 modality types)
            const totalCtCount = ctRigidCount + ctDeformableCount;
            const totalPetCount = petRigidCount + petDeformableCount;
            
            if (mriCount === 1 && totalCtCount === 1 && totalPetCount === 1) {
              // Simple case: 1 MRI + 1 CT + 1 PET
              if (ctRigidCount === 1 && petRigidCount === 1) {
                setFusionMode('mri-ct-pet-single-rigid-rigid');
              } else if (ctRigidCount === 1 && petDeformableCount === 1) {
                setFusionMode('mri-ct-pet-single-rigid-deformable');
              } else if (ctDeformableCount === 1 && petRigidCount === 1) {
                setFusionMode('mri-ct-pet-single-deformable-rigid');
              } else {
                setFusionMode('mri-ct-pet-single-deformable-deformable');
              }
            } else if (mriCount === 1 && totalCtCount === 1 && totalPetCount > 1) {
              // 1 MRI + 1 CT + Multiple PET
              if (ctRigidCount === 1) {
                if (petRigidCount > 0 && petDeformableCount > 0) {
                  setFusionMode('mri-ct-pet-single-mri-single-ct-rigid-multiple-pet-mixed');
                } else if (petRigidCount > 1) {
                  setFusionMode('mri-ct-pet-single-mri-single-ct-rigid-multiple-pet-rigid');
                } else {
                  setFusionMode('mri-ct-pet-single-mri-single-ct-rigid-multiple-pet-deformable');
                }
              } else {
                if (petRigidCount > 0 && petDeformableCount > 0) {
                  setFusionMode('mri-ct-pet-single-mri-single-ct-deformable-multiple-pet-mixed');
                } else if (petRigidCount > 1) {
                  setFusionMode('mri-ct-pet-single-mri-single-ct-deformable-multiple-pet-rigid');
                } else {
                  setFusionMode('mri-ct-pet-single-mri-single-ct-deformable-multiple-pet-deformable');
                }
              }
            } else if (mriCount === 1 && totalCtCount > 1 && totalPetCount === 1) {
              // 1 MRI + Multiple CT + 1 PET
              if (petRigidCount === 1) {
                if (ctRigidCount > 0 && ctDeformableCount > 0) {
                  setFusionMode('mri-ct-pet-single-mri-multiple-ct-mixed-single-pet-rigid');
                } else if (ctRigidCount > 1) {
                  setFusionMode('mri-ct-pet-single-mri-multiple-ct-rigid-single-pet-rigid');
                } else {
                  setFusionMode('mri-ct-pet-single-mri-multiple-ct-deformable-single-pet-rigid');
                }
              } else {
                if (ctRigidCount > 0 && ctDeformableCount > 0) {
                  setFusionMode('mri-ct-pet-single-mri-multiple-ct-mixed-single-pet-deformable');
                } else if (ctRigidCount > 1) {
                  setFusionMode('mri-ct-pet-single-mri-multiple-ct-rigid-single-pet-deformable');
                } else {
                  setFusionMode('mri-ct-pet-single-mri-multiple-ct-deformable-single-pet-deformable');
                }
              }
            } else if (mriCount > 1 && totalCtCount === 1 && totalPetCount === 1) {
              // Multiple MRI + 1 CT + 1 PET
              if (ctRigidCount === 1 && petRigidCount === 1) {
                setFusionMode('mri-ct-pet-multiple-mri-single-ct-rigid-single-pet-rigid');
              } else if (ctRigidCount === 1 && petDeformableCount === 1) {
                setFusionMode('mri-ct-pet-multiple-mri-single-ct-rigid-single-pet-deformable');
              } else if (ctDeformableCount === 1 && petRigidCount === 1) {
                setFusionMode('mri-ct-pet-multiple-mri-single-ct-deformable-single-pet-rigid');
              } else {
                setFusionMode('mri-ct-pet-multiple-mri-single-ct-deformable-single-pet-deformable');
              }
            } else {
              // Very complex: Multiple of multiple modalities
              setFusionMode('mri-ct-pet-ultimate-complex');
            }
          } else {
            setFusionMode('complex');
          }
        } catch (error) {
          console.error('Error parsing fusion config:', error);
          setFusionMode('complex');
        }
      } else {
        // No config means legacy single MRI mode
        setFusionMode('single-mri');
      }
    }
  }, [router.isReady, router.query.config]);
  
  // For backward compatibility
  const isSingleMriMode = fusionMode === 'single-mri';
  const isMultipleMriMode = fusionMode === 'multiple-mri';
  const isSinglePetMode = fusionMode === 'single-pet-rigid' || fusionMode === 'single-pet-deformable';
  const isSingleCtMode = fusionMode === 'single-ct-rigid' || fusionMode === 'single-ct-deformable';
  const isMultiplePetRigidMode = fusionMode === 'multiple-pet-rigid';
  const isMultiplePetDeformableMode = fusionMode === 'multiple-pet-deformable';
  const isMultiplePetRigidDeformableMode = fusionMode === 'multiple-pet-rigid-deformable';
  const isMultipleCtRigidMode = fusionMode === 'multiple-ct-rigid';
  const isMultipleCtDeformableMode = fusionMode === 'multiple-ct-deformable';
  const isMultipleCtRigidDeformableMode = fusionMode === 'multiple-ct-rigid-deformable';
  
  // Mixed MRI+PET mode helpers
  const isMriPetSingleRigidMode = fusionMode === 'mri-pet-single-rigid';
  const isMriPetSingleDeformableMode = fusionMode === 'mri-pet-single-deformable';
  const isMriPetMultipleMriSingleRigidMode = fusionMode === 'mri-pet-multiple-mri-single-rigid';
  const isMriPetMultipleMriSingleDeformableMode = fusionMode === 'mri-pet-multiple-mri-single-deformable';
  const isMriPetSingleMriMultipleRigidMode = fusionMode === 'mri-pet-single-mri-multiple-rigid';
  const isMriPetSingleMriMultipleDeformableMode = fusionMode === 'mri-pet-single-mri-multiple-deformable';
  const isMriPetSingleMriMultipleMixedMode = fusionMode === 'mri-pet-single-mri-multiple-mixed';
  const isMriPetMultipleBothMode = fusionMode === 'mri-pet-multiple-both';
  
  // Combined MRI+PET helper for conditional checks
  const isMriPetMode = isMriPetSingleRigidMode || isMriPetSingleDeformableMode || 
    isMriPetMultipleMriSingleRigidMode || isMriPetMultipleMriSingleDeformableMode ||
    isMriPetSingleMriMultipleRigidMode || isMriPetSingleMriMultipleDeformableMode ||
    isMriPetSingleMriMultipleMixedMode || isMriPetMultipleBothMode;
  
  // Mixed MRI+CT mode helpers
  const isMriCtSingleRigidMode = fusionMode === 'mri-ct-single-rigid';
  const isMriCtSingleDeformableMode = fusionMode === 'mri-ct-single-deformable';
  const isMriCtMultipleMriSingleRigidMode = fusionMode === 'mri-ct-multiple-mri-single-rigid';
  const isMriCtMultipleMriSingleDeformableMode = fusionMode === 'mri-ct-multiple-mri-single-deformable';
  const isMriCtSingleMriMultipleRigidMode = fusionMode === 'mri-ct-single-mri-multiple-rigid';
  const isMriCtSingleMriMultipleDeformableMode = fusionMode === 'mri-ct-single-mri-multiple-deformable';
  const isMriCtSingleMriMultipleMixedMode = fusionMode === 'mri-ct-single-mri-multiple-mixed';
  const isMriCtMultipleBothMode = fusionMode === 'mri-ct-multiple-both';
  
  // Combined MRI+CT helper for conditional checks
  const isMriCtMode = isMriCtSingleRigidMode || isMriCtSingleDeformableMode || 
    isMriCtMultipleMriSingleRigidMode || isMriCtMultipleMriSingleDeformableMode ||
    isMriCtSingleMriMultipleRigidMode || isMriCtSingleMriMultipleDeformableMode ||
    isMriCtSingleMriMultipleMixedMode || isMriCtMultipleBothMode;
  
  // Ultimate MRI+CT+PET mode helpers
  const isMriCtPetSingleRigidRigidMode = fusionMode === 'mri-ct-pet-single-rigid-rigid';
  const isMriCtPetSingleRigidDeformableMode = fusionMode === 'mri-ct-pet-single-rigid-deformable';
  const isMriCtPetSingleDeformableRigidMode = fusionMode === 'mri-ct-pet-single-deformable-rigid';
  const isMriCtPetSingleDeformableDeformableMode = fusionMode === 'mri-ct-pet-single-deformable-deformable';
  const isMriCtPetSingleMriSingleCtRigidMultiplePetMixedMode = fusionMode === 'mri-ct-pet-single-mri-single-ct-rigid-multiple-pet-mixed';
  const isMriCtPetSingleMriSingleCtRigidMultiplePetRigidMode = fusionMode === 'mri-ct-pet-single-mri-single-ct-rigid-multiple-pet-rigid';
  const isMriCtPetSingleMriSingleCtRigidMultiplePetDeformableMode = fusionMode === 'mri-ct-pet-single-mri-single-ct-rigid-multiple-pet-deformable';
  const isMriCtPetSingleMriSingleCtDeformableMultiplePetMixedMode = fusionMode === 'mri-ct-pet-single-mri-single-ct-deformable-multiple-pet-mixed';
  const isMriCtPetSingleMriSingleCtDeformableMultiplePetRigidMode = fusionMode === 'mri-ct-pet-single-mri-single-ct-deformable-multiple-pet-rigid';
  const isMriCtPetSingleMriSingleCtDeformableMultiplePetDeformableMode = fusionMode === 'mri-ct-pet-single-mri-single-ct-deformable-multiple-pet-deformable';
  const isMriCtPetSingleMriMultipleCtMixedSinglePetRigidMode = fusionMode === 'mri-ct-pet-single-mri-multiple-ct-mixed-single-pet-rigid';
  const isMriCtPetSingleMriMultipleCtRigidSinglePetRigidMode = fusionMode === 'mri-ct-pet-single-mri-multiple-ct-rigid-single-pet-rigid';
  const isMriCtPetSingleMriMultipleCtDeformableSinglePetRigidMode = fusionMode === 'mri-ct-pet-single-mri-multiple-ct-deformable-single-pet-rigid';
  const isMriCtPetSingleMriMultipleCtMixedSinglePetDeformableMode = fusionMode === 'mri-ct-pet-single-mri-multiple-ct-mixed-single-pet-deformable';
  const isMriCtPetSingleMriMultipleCtRigidSinglePetDeformableMode = fusionMode === 'mri-ct-pet-single-mri-multiple-ct-rigid-single-pet-deformable';
  const isMriCtPetSingleMriMultipleCtDeformableSinglePetDeformableMode = fusionMode === 'mri-ct-pet-single-mri-multiple-ct-deformable-single-pet-deformable';
  const isMriCtPetMultipleMriSingleCtRigidSinglePetRigidMode = fusionMode === 'mri-ct-pet-multiple-mri-single-ct-rigid-single-pet-rigid';
  const isMriCtPetMultipleMriSingleCtRigidSinglePetDeformableMode = fusionMode === 'mri-ct-pet-multiple-mri-single-ct-rigid-single-pet-deformable';
  const isMriCtPetMultipleMriSingleCtDeformableSinglePetRigidMode = fusionMode === 'mri-ct-pet-multiple-mri-single-ct-deformable-single-pet-rigid';
  const isMriCtPetMultipleMriSingleCtDeformableSinglePetDeformableMode = fusionMode === 'mri-ct-pet-multiple-mri-single-ct-deformable-single-pet-deformable';
  const isMriCtPetUltimateComplexMode = fusionMode === 'mri-ct-pet-ultimate-complex';
  
  // Combined ultimate MRI+CT+PET helper for conditional checks
  const isMriCtPetMode = isMriCtPetSingleRigidRigidMode || isMriCtPetSingleRigidDeformableMode || 
    isMriCtPetSingleDeformableRigidMode || isMriCtPetSingleDeformableDeformableMode ||
    isMriCtPetSingleMriSingleCtRigidMultiplePetMixedMode || isMriCtPetSingleMriSingleCtRigidMultiplePetRigidMode ||
    isMriCtPetSingleMriSingleCtRigidMultiplePetDeformableMode || isMriCtPetSingleMriSingleCtDeformableMultiplePetMixedMode ||
    isMriCtPetSingleMriSingleCtDeformableMultiplePetRigidMode || isMriCtPetSingleMriSingleCtDeformableMultiplePetDeformableMode ||
    isMriCtPetSingleMriMultipleCtMixedSinglePetRigidMode || isMriCtPetSingleMriMultipleCtRigidSinglePetRigidMode ||
    isMriCtPetSingleMriMultipleCtDeformableSinglePetRigidMode || isMriCtPetSingleMriMultipleCtMixedSinglePetDeformableMode ||
    isMriCtPetSingleMriMultipleCtRigidSinglePetDeformableMode || isMriCtPetSingleMriMultipleCtDeformableSinglePetDeformableMode ||
    isMriCtPetMultipleMriSingleCtRigidSinglePetRigidMode || isMriCtPetMultipleMriSingleCtRigidSinglePetDeformableMode ||
    isMriCtPetMultipleMriSingleCtDeformableSinglePetRigidMode || isMriCtPetMultipleMriSingleCtDeformableSinglePetDeformableMode ||
    isMriCtPetUltimateComplexMode;
  
  // Fixed dark theme colors for consistency
  const formBg = 'gray.800';
  const writeupBg = 'gray.800';
  const borderColor = 'gray.600';

  const { register, handleSubmit, control, watch, formState: { errors }, setValue, reset } = useForm({
    defaultValues: {
      common_info: {
        physician: { name: '', role: 'physician' },
        physicist: { name: '', role: 'physicist' },
      },
      fusion_data: {
        lesion: '',
        custom_lesion: '',
        anatomical_region: '',
        registrations: [],
      }
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'fusion_data.registrations'
  });

  const selectedLesion = watch('fusion_data.lesion');
  const watchedRegistrations = watch('fusion_data.registrations');
  const hasMriRegistration = watchedRegistrations?.some(reg => reg.secondary === 'MRI');
  const hasPetRegistration = watchedRegistrations?.some(reg => reg.secondary === 'PET/CT');

  // Load initial data
  useEffect(() => {
    const fetchInitialData = async () => {
      setInitialLoading(true);
      try {
        const [lesionRegionsData, modalitiesData, methodsData] = await Promise.all([
          getLesionRegions(),
          getModalities(),
          getRegistrationMethods()
        ]);
        
        setLesionRegions(lesionRegionsData);
        setModalities(modalitiesData);
        setRegistrationMethods(methodsData);
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

    fetchInitialData();
  }, [toast]);

  // Set initial secondary modality after modalities are loaded
  useEffect(() => {
    if (modalities.length > 0 && initialLoadRef.current) {
      initialLoadRef.current = false;
      setSelectedSecondaryModality(modalities[0]);
    }
  }, [modalities]);

  // Update anatomical region when lesion changes
  useEffect(() => {
    if (selectedLesion && !isCustomLesion && lesionRegions[selectedLesion]) {
      setValue('fusion_data.anatomical_region', lesionRegions[selectedLesion]);
    }
  }, [selectedLesion, lesionRegions, setValue, isCustomLesion]);

  // Auto-populate form based on fusion mode
  useEffect(() => {
    if (registrationMethods.length > 0 && fusionMode) {
      if (fusionMode === 'single-mri') {
        // Auto-add single MRI/CT rigid registration
        setValue('fusion_data.registrations', [{
          primary: 'CT',
          secondary: 'MRI', 
          method: 'rigid'
        }]);
      } else if (fusionMode === 'single-pet-rigid') {
        // Auto-add single PET/CT rigid registration
        setValue('fusion_data.registrations', [{
          primary: 'CT',
          secondary: 'PET/CT', 
          method: 'rigid'
        }]);
      } else if (fusionMode === 'single-pet-deformable') {
        // Auto-add single PET/CT deformable registration
        setValue('fusion_data.registrations', [{
          primary: 'CT',
          secondary: 'PET/CT', 
          method: 'deformable'
        }]);
      } else if (fusionMode === 'single-ct-rigid') {
        // Auto-add single CT/CT rigid registration
        setValue('fusion_data.registrations', [{
          primary: 'CT',
          secondary: 'CT', 
          method: 'rigid'
        }]);
      } else if (fusionMode === 'single-ct-deformable') {
        // Auto-add single CT/CT deformable registration
        setValue('fusion_data.registrations', [{
          primary: 'CT',
          secondary: 'CT', 
          method: 'deformable'
        }]);
      } else if (fusionMode === 'multiple-mri') {
        // Auto-populate multiple MRI registrations based on config
        if (parsedConfig && parsedConfig.mri?.rigid) {
          const mriCount = parsedConfig.mri.rigid;
          const registrations = [];
          for (let i = 0; i < mriCount; i++) {
            registrations.push({
              primary: 'CT',
              secondary: 'MRI', 
              method: 'rigid'
            });
          }
          setValue('fusion_data.registrations', registrations);
        }
      } else if (fusionMode === 'multiple-pet-rigid') {
        // Auto-populate multiple PET/CT rigid registrations based on config
        if (parsedConfig && parsedConfig.pet?.rigid) {
          const petCount = parsedConfig.pet.rigid;
          const registrations = [];
          for (let i = 0; i < petCount; i++) {
            registrations.push({
              primary: 'CT',
              secondary: 'PET/CT', 
              method: 'rigid'
            });
          }
          setValue('fusion_data.registrations', registrations);
        }
      } else if (fusionMode === 'multiple-pet-deformable') {
        // Auto-populate multiple PET/CT deformable registrations based on config
        if (parsedConfig && parsedConfig.pet?.deformable) {
          const petCount = parsedConfig.pet.deformable;
          const registrations = [];
          for (let i = 0; i < petCount; i++) {
            registrations.push({
              primary: 'CT',
              secondary: 'PET/CT', 
              method: 'deformable'
            });
          }
          setValue('fusion_data.registrations', registrations);
        }
      } else if (fusionMode === 'multiple-pet-rigid-deformable') {
        // Auto-populate multiple PET/CT rigid and deformable registrations based on config
        if (parsedConfig && parsedConfig.pet?.rigid && parsedConfig.pet?.deformable) {
          const rigidCount = parsedConfig.pet.rigid;
          const deformableCount = parsedConfig.pet.deformable;
          const registrations = [];
          
          // Add rigid registrations
          for (let i = 0; i < rigidCount; i++) {
            registrations.push({
              primary: 'CT',
              secondary: 'PET/CT', 
              method: 'rigid'
            });
          }
          
          // Add deformable registrations
          for (let i = 0; i < deformableCount; i++) {
            registrations.push({
              primary: 'CT',
              secondary: 'PET/CT', 
              method: 'deformable'
            });
          }
          
          setValue('fusion_data.registrations', registrations);
        }
      } else if (fusionMode === 'multiple-ct-rigid') {
        // Auto-populate multiple CT/CT rigid registrations based on config
        if (parsedConfig && parsedConfig.ct?.rigid) {
          const ctCount = parsedConfig.ct.rigid;
          const registrations = [];
          for (let i = 0; i < ctCount; i++) {
            registrations.push({
              primary: 'CT',
              secondary: 'CT', 
              method: 'rigid'
            });
          }
          setValue('fusion_data.registrations', registrations);
        }
      } else if (fusionMode === 'multiple-ct-deformable') {
        // Auto-populate multiple CT/CT deformable registrations based on config
        if (parsedConfig && parsedConfig.ct?.deformable) {
          const ctCount = parsedConfig.ct.deformable;
          const registrations = [];
          for (let i = 0; i < ctCount; i++) {
            registrations.push({
              primary: 'CT',
              secondary: 'CT', 
              method: 'deformable'
            });
          }
          setValue('fusion_data.registrations', registrations);
        }
      } else if (fusionMode === 'multiple-ct-rigid-deformable') {
        // Auto-populate multiple CT/CT rigid and deformable registrations based on config
        if (parsedConfig && parsedConfig.ct?.rigid && parsedConfig.ct?.deformable) {
          const rigidCount = parsedConfig.ct.rigid;
          const deformableCount = parsedConfig.ct.deformable;
          const registrations = [];
          
          // Add rigid registrations
          for (let i = 0; i < rigidCount; i++) {
            registrations.push({
              primary: 'CT',
              secondary: 'CT', 
              method: 'rigid'
            });
          }
          
          // Add deformable registrations
          for (let i = 0; i < deformableCount; i++) {
            registrations.push({
              primary: 'CT',
              secondary: 'CT', 
              method: 'deformable'
            });
          }
          
          setValue('fusion_data.registrations', registrations);
        }
      } else if (isMriPetMode) {
        // Auto-populate mixed MRI + PET combinations based on config and mode
        if (parsedConfig) {
          const registrations = [];
          const mriCount = parsedConfig.mri?.rigid || 0;
          const petRigidCount = parsedConfig.pet?.rigid || 0;
          const petDeformableCount = parsedConfig.pet?.deformable || 0;
          
          // Add MRI registrations (always rigid for MRI/CT)
          for (let i = 0; i < mriCount; i++) {
            registrations.push({
              primary: 'CT',
              secondary: 'MRI',
              method: 'rigid'
            });
          }
          
          // Add PET rigid registrations
          for (let i = 0; i < petRigidCount; i++) {
            registrations.push({
              primary: 'CT',
              secondary: 'PET/CT',
              method: 'rigid'
            });
          }
          
          // Add PET deformable registrations
          for (let i = 0; i < petDeformableCount; i++) {
            registrations.push({
              primary: 'CT',
              secondary: 'PET/CT',
              method: 'deformable'
            });
          }
          
          setValue('fusion_data.registrations', registrations);
        }
      } else if (isMriCtMode) {
        // Auto-populate mixed MRI + CT combinations based on config and mode
        if (parsedConfig) {
          const registrations = [];
          const mriCount = parsedConfig.mri?.rigid || 0;
          const ctRigidCount = parsedConfig.ct?.rigid || 0;
          const ctDeformableCount = parsedConfig.ct?.deformable || 0;
          
          // Add MRI registrations (always rigid for MRI/CT)
          for (let i = 0; i < mriCount; i++) {
            registrations.push({
              primary: 'CT',
              secondary: 'MRI',
              method: 'rigid'
            });
          }
          
          // Add CT rigid registrations
          for (let i = 0; i < ctRigidCount; i++) {
            registrations.push({
              primary: 'CT',
              secondary: 'CT',
              method: 'rigid'
            });
          }
          
          // Add CT deformable registrations
          for (let i = 0; i < ctDeformableCount; i++) {
            registrations.push({
              primary: 'CT',
              secondary: 'CT',
              method: 'deformable'
            });
          }
          
          setValue('fusion_data.registrations', registrations);
        }
      } else if (isMriCtPetMode) {
        // Auto-populate ultimate MRI + CT + PET combinations based on config and mode
        if (parsedConfig) {
          const registrations = [];
          const mriCount = parsedConfig.mri?.rigid || 0;
          const ctRigidCount = parsedConfig.ct?.rigid || 0;
          const ctDeformableCount = parsedConfig.ct?.deformable || 0;
          const petRigidCount = parsedConfig.pet?.rigid || 0;
          const petDeformableCount = parsedConfig.pet?.deformable || 0;
          
          // Add MRI registrations (always rigid for MRI/CT)
          for (let i = 0; i < mriCount; i++) {
            registrations.push({
              primary: 'CT',
              secondary: 'MRI',
              method: 'rigid'
            });
          }
          
          // Add CT registrations (rigid first, then deformable)
          for (let i = 0; i < ctRigidCount; i++) {
            registrations.push({
              primary: 'CT',
              secondary: 'CT',
              method: 'rigid'
            });
          }
          for (let i = 0; i < ctDeformableCount; i++) {
            registrations.push({
              primary: 'CT',
              secondary: 'CT',
              method: 'deformable'
            });
          }
          
          // Add PET registrations (rigid first, then deformable)
          for (let i = 0; i < petRigidCount; i++) {
            registrations.push({
              primary: 'CT',
              secondary: 'PET/CT',
              method: 'rigid'
            });
          }
          for (let i = 0; i < petDeformableCount; i++) {
            registrations.push({
              primary: 'CT',
              secondary: 'PET/CT',
              method: 'deformable'
            });
          }
          
          setValue('fusion_data.registrations', registrations);
        }
      }
    }
  }, [fusionMode, registrationMethods, setValue, isMriPetMode, isMriCtMode, isMriCtPetMode, parsedConfig]);

  const onSubmit = async (data) => {
    // Validate that we have at least one registration (unless it's single or multiple mode)
    if (!isSingleMriMode && !isMultipleMriMode && !isSinglePetMode && !isSingleCtMode && 
        !isMultiplePetRigidMode && !isMultiplePetDeformableMode && !isMultiplePetRigidDeformableMode &&
        !isMultipleCtRigidMode && !isMultipleCtDeformableMode && !isMultipleCtRigidDeformableMode &&
        !isMriPetMode && !isMriCtMode && !isMriCtPetMode && data.fusion_data.registrations.length === 0) {
      toast({
        title: 'Validation Error',
        description: 'At least one registration is required for multimodality fusion',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    setLoading(true);
    try {
      const result = await generateFusionWriteup(data);
      
      // Format the writeup in the approved style if needed
      const formattedWriteup = formatWriteup(result.writeup, data);
      setWriteup(formattedWriteup);
      
      toast({
        title: 'Write-up generated successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
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

  // Format the writeup in the approved style
  const formatWriteup = (originalWriteup, formData) => {
    // Use the backend-generated writeup directly - it now handles all formatting
    return originalWriteup;
    
    const physician = formData.common_info.physician.name;
    const physicist = formData.common_info.physicist.name;
    const lesion = isCustomLesion ? formData.fusion_data.custom_lesion : formData.fusion_data.lesion;
    const anatomicalRegion = formData.fusion_data.anatomical_region;
    
    // Group registrations by modality
    const mriRegistrations = formData.fusion_data.registrations.filter(reg => reg.secondary.includes('MRI'));
    const petCtRegistrations = formData.fusion_data.registrations.filter(reg => reg.secondary.includes('PET'));
    const ctRegistrations = formData.fusion_data.registrations.filter(reg => reg.secondary === 'CT');
    
    // Calculate total registrations early for use throughout the function
    const totalRegistrations = mriRegistrations.length + petCtRegistrations.length + ctRegistrations.length;
    
    // Convert numbers to words for counts
    const numberToWord = (num) => {
      const words = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];
      return words[num] || num.toString();
    };
    
    const mriCount = numberToWord(mriRegistrations.length);
    const petCtCount = numberToWord(petCtRegistrations.length);
    const ctCount = numberToWord(ctRegistrations.length);
    
    // Create paragraphs in the new format
    const intro = `Dr. ${physician} requested a medical physics consultation for --- to perform a multimodality image fusion. The patient was scanned in our CT simulator in the treatment position. The CT study was then exported to the Velocity imaging registration software.`;
    
    // Only include modalities that are actually present
    let importText = '';
    const modalitiesList = [];
    
    if (mriRegistrations.length > 0) {
      modalitiesList.push(`${mriCount} MRI${mriRegistrations.length > 1 ? 's' : ''}`);
    }
    
    if (petCtRegistrations.length > 0) {
      modalitiesList.push(`${petCtCount} PET/CT${petCtRegistrations.length > 1 ? 's' : ''}`);
    }
    
    if (ctRegistrations.length > 0) {
      modalitiesList.push(`${ctCount} CT${ctRegistrations.length > 1 ? 's' : ''}`);
    }
    
    if (modalitiesList.length === 0) {
      importText = 'Image studies were imported into the Velocity software. Fusion studies were created between the planning CT and each of the other modality image sets.';
    } else if (modalitiesList.length === 1) {
      const singleModality = modalitiesList[0];
      const isPlural = singleModality.includes('MRIs') || singleModality.includes('PET/CTs') || singleModality.includes('CTs');
      
      if (isPlural) {
        // Handle plural case with better flow (e.g., "two MRIs", "three PET/CTs", "two CTs")
        let modalityType;
        if (singleModality.includes('MRI')) {
          modalityType = 'MRI studies';
        } else if (singleModality.includes('PET/CT')) {
          modalityType = 'PET/CT studies';
        } else if (singleModality.includes('CT')) {
          modalityType = 'CT studies';
        }
        const count = singleModality.split(' ')[0]; // Extract "two", "three", etc.
        importText = `${count.charAt(0).toUpperCase() + count.slice(1)} ${modalityType} were imported into the Velocity software. Fusion studies were created between the planning CT and the imported image sets.`;
      } else {
        // Handle singular case with better flow
        let modalityType;
        if (singleModality.includes('MRI')) {
          modalityType = 'MRI study';
        } else if (singleModality.includes('PET/CT')) {
          modalityType = 'PET/CT study';
        } else if (singleModality.includes('CT')) {
          modalityType = 'CT study';
        }
        const article = modalityType.startsWith('MRI') ? 'An' : 'A';
        importText = `${article} ${modalityType} was imported into the Velocity software. A fusion study was created between the planning CT and the imported image set.`;
      }
    } else {
      // Handle multiple different modality types
      const formattedModalities = modalitiesList.map(modality => {
        if (modality.includes('MRI')) {
          if (modality.startsWith('one')) {
            return modality.replace(/one MRIs?/, 'one MRI study');
          } else {
            return modality.replace(/MRIs?/, 'MRI studies').replace('MRI studies studies', 'MRI studies');
          }
        } else if (modality.includes('PET/CT')) {
          if (modality.startsWith('one')) {
            return modality.replace(/one PET\/CTs?/, 'one PET/CT study');
          } else {
            return modality.replace(/PET\/CTs?/, 'PET/CT studies').replace('PET/CT studies studies', 'PET/CT studies');
          }
        } else if (modality.includes('CT')) {
          if (modality.startsWith('one')) {
            return modality.replace(/one CTs?/, 'one CT study');
          } else {
            return modality.replace(/CTs?/, 'CT studies').replace('CT studies studies', 'CT studies');
          }
        }
        return modality;
      });
      importText = `Multiple image studies including ${formattedModalities.join(' and ')} were imported into the Velocity software. Fusion studies were created between the planning CT and each of the imported image sets.`;
    }
    
    // MRI paragraph with "refined manually" - only include if MRI registrations exist
    const mriParagraph = mriRegistrations.length > 0 ? 
      `The CT and MRI image sets were initially aligned using a rigid registration algorithm based on the ${anatomicalRegion} anatomy, then refined manually. The resulting ${mriRegistrations.length === 1 ? 'fusion was' : 'fusions were'} verified for accuracy using anatomical landmarks such as the ${lesion}.` : '';
    
    // PET/CT paragraph with registration method based on actual data - only include if PET registrations exist
    const petCtParagraph = petCtRegistrations.length > 0 ? (() => {
      // Check if any PET/CT registrations use deformable method
      const hasDeformablePet = petCtRegistrations.some(reg => reg.method && reg.method.toLowerCase() !== 'rigid');
      
      let petText;
      if (hasDeformablePet) {
        petText = `The CT and PET/CT image sets were aligned using a rigid registration algorithm followed by deformable image registration to enhance the results.`;
      } else {
        petText = `The CT and PET/CT image sets were initially aligned using a rigid registration algorithm based on the ${anatomicalRegion} anatomy, then refined manually.`;
      }
      
      petText += ` The accuracy of ${totalRegistrations === 1 ? 'this fusion was' : 'these fusions were'} validated using anatomical structures such as the ${lesion}.`;
      
      if (hasDeformablePet) {
        petText += ` The fused images were subsequently used to improve the identification of critical structures and targets and to accurately contour them for treatment planning.`;
      }
      
      return petText;
    })() : '';
    
    // CT paragraph with registration method based on actual data - only include if CT registrations exist
    const ctParagraph = ctRegistrations.length > 0 ? (() => {
      // Check if any CT registrations use deformable method
      const hasDeformableCt = ctRegistrations.some(reg => reg.method && reg.method.toLowerCase() !== 'rigid');
      
      let ctText;
      if (hasDeformableCt) {
        ctText = `The planning CT and imported CT image sets were aligned using a rigid registration algorithm followed by deformable image registration to enhance the results.`;
      } else {
        ctText = `The planning CT and imported CT image sets were initially aligned using a rigid registration algorithm based on the ${anatomicalRegion} anatomy, then refined manually.`;
      }
      
      ctText += ` The accuracy of ${totalRegistrations === 1 ? 'this fusion was' : 'these fusions were'} validated using anatomical structures such as the ${lesion}.`;
      
      if (hasDeformableCt) {
        ctText += ` The fused images were subsequently used to improve the identification of critical structures and targets and to accurately contour them for treatment planning.`;
      }
      
      return ctText;
    })() : '';
    
    // Adjust conclusion text based on number of registrations
    const conclusionText = totalRegistrations === 1 ? 
      `The fusion for the image sets was reviewed and approved by both the prescribing radiation oncologist, Dr. ${physician}, and the medical physicist, Dr. ${physicist}.` :
      `The fusions for all image sets were reviewed and approved by both the prescribing radiation oncologist, Dr. ${physician}, and the medical physicist, Dr. ${physicist}.`;
    
    // Combine all paragraphs with appropriate spacing
    const paragraphs = [intro, importText, mriParagraph, petCtParagraph, ctParagraph, conclusionText].filter(p => p !== '');
    return paragraphs.join('\n\n');
  };

  const addRegistration = () => {
    const secondary = document.getElementById('new-secondary').value;
    // Auto-set method to 'rigid' if secondary is MRI
    let method;
    if (secondary === 'MRI') {
      method = 'rigid';
    } else {
      const methodSelect = document.getElementById('new-method');
      method = methodSelect ? methodSelect.value : registrationMethods[0];
      // Ensure method is never empty
      if (!method && registrationMethods.length > 0) {
        method = registrationMethods[0];
      }
    }
    
    if (!method) {
      toast({
        title: 'Error',
        description: 'Unable to determine registration method',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    append({ primary: 'CT', secondary, method });
    
    toast({
      title: 'Registration added',
      description: `CT to ${secondary} using ${method} registration`,
      status: 'success',
      duration: 2000,
      isClosable: true,
    });
  };

  const confirmRemoveRegistration = (index) => {
    setIndexToRemove(index);
    setIsDeleteAlertOpen(true);
  };

  const handleRemoveRegistration = () => {
    remove(indexToRemove);
    setIsDeleteAlertOpen(false);
    
    toast({
      title: 'Registration removed',
      status: 'info',
      duration: 2000,
      isClosable: true,
    });
  };

  const handleSecondaryModalityChange = (e) => {
    const selectedValue = e.target.value;
    setSelectedSecondaryModality(selectedValue);
    
    // Auto-set method to 'rigid' if MRI is selected
    const methodSelect = document.getElementById('new-method');
    if (selectedValue === 'MRI') {
      if (methodSelect) {
        methodSelect.value = 'rigid';
      }
    } else if (methodSelect && registrationMethods.length > 0) {
      // Ensure a method is always selected for non-MRI modalities
      methodSelect.value = methodSelect.value || registrationMethods[0];
    }
  };

  const handleCustomLesionChange = (e) => {
    setIsCustomLesion(e.target.checked);
    if (e.target.checked) {
      setValue('fusion_data.lesion', '');
      setValue('fusion_data.anatomical_region', '');
    } else {
      setValue('fusion_data.custom_lesion', '');
    }
  };


  const handleResetForm = () => {
    reset({
      common_info: {
        physician: { name: '', role: 'physician' },
        physicist: { name: '', role: 'physicist' },
      },
      fusion_data: {
        lesion: '',
        custom_lesion: '',
        anatomical_region: '',
        registrations: [],
      }
    });
    setWriteup('');
    setIsCustomLesion(false);
    setIsBladderFillingStudy(false);
    
    toast({
      title: 'Form reset',
      status: 'info',
      duration: 2000,
      isClosable: true,
    });
  };

  if (initialLoading) {
    return (
      <Box bg="gray.900" minH="100vh" textAlign="center" p={5}>
        <Text fontSize="lg" mb={2} color="white">Loading fusion form data...</Text>
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
            <Heading size="xl" mb={2}>
              {fusionMode === 'single-mri' ? 'MRI/CT Fusion Write-up' 
               : fusionMode === 'multiple-mri' ? 'Multiple MRI/CT Fusion Write-up'
               : fusionMode === 'single-pet-rigid' ? 'PET/CT Rigid Fusion Write-up'
               : fusionMode === 'single-pet-deformable' ? 'PET/CT Deformable Fusion Write-up'
               : fusionMode === 'multiple-pet-rigid' ? 'Multiple PET/CT Rigid Fusion Write-up'
               : fusionMode === 'multiple-pet-deformable' ? 'Multiple PET/CT Deformable Fusion Write-up'
               : fusionMode === 'multiple-pet-rigid-deformable' ? 'Multiple PET/CT Rigid+Deformable Fusion Write-up'
               : fusionMode === 'single-ct-rigid' ? 'CT/CT Rigid Fusion Write-up'
               : fusionMode === 'single-ct-deformable' ? 'CT/CT Deformable Fusion Write-up'
               : fusionMode === 'multiple-ct-rigid' ? 'Multiple CT/CT Rigid Fusion Write-up'
               : fusionMode === 'multiple-ct-deformable' ? 'Multiple CT/CT Deformable Fusion Write-up'
               : fusionMode === 'multiple-ct-rigid-deformable' ? 'Multiple CT/CT Rigid+Deformable Fusion Write-up'
               : isMriPetSingleRigidMode ? 'MRI/CT + PET/CT Rigid Fusion Write-up'
               : isMriPetSingleDeformableMode ? 'MRI/CT + PET/CT Deformable Fusion Write-up'
               : isMriPetMode ? 'Mixed MRI/CT + PET/CT Fusion Write-up'
               : isMriCtSingleRigidMode ? 'MRI/CT + CT/CT Rigid Fusion Write-up'
               : isMriCtSingleDeformableMode ? 'MRI/CT + CT/CT Deformable Fusion Write-up'
               : isMriCtMode ? 'Mixed MRI/CT + CT/CT Fusion Write-up'
               : isMriCtPetSingleRigidRigidMode ? 'Ultimate MRI + CT (Rigid) + PET (Rigid) Fusion Write-up'
               : isMriCtPetSingleRigidDeformableMode ? 'Ultimate MRI + CT (Rigid) + PET (Deformable) Fusion Write-up'
               : isMriCtPetSingleDeformableRigidMode ? 'Ultimate MRI + CT (Deformable) + PET (Rigid) Fusion Write-up'
               : isMriCtPetSingleDeformableDeformableMode ? 'Ultimate MRI + CT (Deformable) + PET (Deformable) Fusion Write-up'
               : isMriCtPetMode ? 'Ultimate MRI + CT + PET Fusion Write-up'
               : 'Fusion Write-up Generator'}
            </Heading>
            <Text opacity={0.9}>
              {fusionMode === 'single-mri' ? 'Generate standardized write-up for single MRI/CT fusion'
               : fusionMode === 'multiple-mri' ? 'Generate standardized write-up for multiple MRI/CT fusions'
               : fusionMode === 'single-pet-rigid' ? 'Generate standardized write-up for single PET/CT rigid fusion'
               : fusionMode === 'single-pet-deformable' ? 'Generate standardized write-up for single PET/CT deformable fusion'
               : fusionMode === 'multiple-pet-rigid' ? 'Generate standardized write-up for multiple PET/CT rigid fusions'
               : fusionMode === 'multiple-pet-deformable' ? 'Generate standardized write-up for multiple PET/CT deformable fusions'
               : fusionMode === 'multiple-pet-rigid-deformable' ? 'Generate standardized write-up for multiple PET/CT rigid and deformable fusions'
               : fusionMode === 'single-ct-rigid' ? 'Generate standardized write-up for single CT/CT rigid fusion'
               : fusionMode === 'single-ct-deformable' ? 'Generate standardized write-up for single CT/CT deformable fusion'
               : fusionMode === 'multiple-ct-rigid' ? 'Generate standardized write-up for multiple CT/CT rigid fusions'
               : fusionMode === 'multiple-ct-deformable' ? 'Generate standardized write-up for multiple CT/CT deformable fusions'
               : fusionMode === 'multiple-ct-rigid-deformable' ? 'Generate standardized write-up for multiple CT/CT rigid and deformable fusions'
               : isMriPetSingleRigidMode ? 'Generate standardized write-up for MRI/CT + PET/CT rigid fusion combination'
               : isMriPetSingleDeformableMode ? 'Generate standardized write-up for MRI/CT + PET/CT deformable fusion combination'
               : isMriPetMode ? 'Generate standardized write-up for mixed MRI/CT + PET/CT fusion combinations'
               : isMriCtSingleRigidMode ? 'Generate standardized write-up for MRI/CT + CT/CT rigid fusion combination'
               : isMriCtSingleDeformableMode ? 'Generate standardized write-up for MRI/CT + CT/CT deformable fusion combination'
               : isMriCtMode ? 'Generate standardized write-up for mixed MRI/CT + CT/CT fusion combinations'
               : isMriCtPetSingleRigidRigidMode ? 'Generate the ultimate fusion write-up: MRI + CT (Rigid) + PET (Rigid) - the most comprehensive combination'
               : isMriCtPetSingleRigidDeformableMode ? 'Generate the ultimate fusion write-up: MRI + CT (Rigid) + PET (Deformable) - advanced multi-modality'
               : isMriCtPetSingleDeformableRigidMode ? 'Generate the ultimate fusion write-up: MRI + CT (Deformable) + PET (Rigid) - sophisticated registration'
               : isMriCtPetSingleDeformableDeformableMode ? 'Generate the ultimate fusion write-up: MRI + CT (Deformable) + PET (Deformable) - maximum flexibility'
               : isMriCtPetMode ? 'Generate the ultimate fusion write-up: Complex MRI + CT + PET combinations - pinnacle of fusion technology'
               : 'Generate standardized write-ups for multimodality image fusions and bladder filling studies'
              }
            </Text>
          </Box>
        </Flex>
      </Box>

      {/* Main Content */}
      <Box px={6}>
        <Box maxW="1200px" mx="auto">
          <form onSubmit={handleSubmit(onSubmit)}>
            <Grid 
              templateColumns={{
                base: "1fr",
                md: "repeat(2, 1fr)",
                lg: "repeat(3, 1fr)"
              }} 
              gap={4} 
              mb={6}
            >
              {/* Staff & Patient Section */}
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
                
                <Box>
                  <Heading size="xs" mb={2} color="gray.300">Staff Information</Heading>
                  
                  <FormControl isInvalid={errors.common_info?.physician?.name} mb={3}>
                    <FormLabel fontSize="sm" color="gray.300">Physician Name</FormLabel>
                    <Select 
                      size="sm"
                      {...register("common_info.physician.name", { 
                        required: "Physician name is required" 
                      })}
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
                    <FormErrorMessage>
                      {errors.common_info?.physician?.name?.message}
                    </FormErrorMessage>
                  </FormControl>
                  
                  <FormControl isInvalid={errors.common_info?.physicist?.name} mb={3}>
                    <FormLabel fontSize="sm" color="gray.300">Physicist Name</FormLabel>
                    <Select 
                      size="sm"
                      {...register("common_info.physicist.name", { 
                        required: "Physicist name is required" 
                      })}
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
                    <FormErrorMessage>
                      {errors.common_info?.physicist?.name?.message}
                    </FormErrorMessage>
                  </FormControl>
                </Box>
              </GridItem>
              
              {/* Lesion Info Section */}
              <GridItem 
                as={Box} 
                p={4} 
                borderWidth="1px" 
                borderRadius="md" 
                bg={formBg}
                borderColor={borderColor}
                boxShadow="sm"
              >
                <Heading size="sm" mb={3} textAlign="center" color="white">Lesion Info</Heading>
                
                <Box mb={4}>
                  <Box mb={3}>
                    <Checkbox 
                      size="sm" 
                      isChecked={isCustomLesion} 
                      onChange={handleCustomLesionChange}
                      colorScheme="green"
                      color="gray.300"
                    >
                      Custom Lesion?
                    </Checkbox>
                  </Box>
                </Box>
                
                {!isCustomLesion ? (
                  <FormControl isInvalid={errors.fusion_data?.lesion} mb={3}>
                    <FormLabel fontSize="sm" color="gray.300">Lesion</FormLabel>
                    <Select 
                      size="sm"
                      {...register("fusion_data.lesion", { 
                        required: !isCustomLesion ? "Lesion is required" : false
                      })}
                      isDisabled={isCustomLesion}
                      aria-label="Select lesion"
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
                      <option value="" style={{ backgroundColor: '#2D3748', color: 'white' }}>Select a lesion</option>
                      {Object.keys(lesionRegions).sort().map(lesion => (
                        <option key={lesion} value={lesion} style={{ backgroundColor: '#2D3748', color: 'white' }}>{lesion}</option>
                      ))}
                    </Select>
                    <FormErrorMessage>
                      {errors.fusion_data?.lesion?.message}
                    </FormErrorMessage>
                  </FormControl>
                ) : (
                  <>
                    <FormControl isInvalid={errors.fusion_data?.custom_lesion} mb={3}>
                      <FormLabel fontSize="sm" color="gray.300">Custom Lesion Name</FormLabel>
                      <Input 
                        size="sm"
                        {...register("fusion_data.custom_lesion", { 
                          required: isCustomLesion ? "Custom lesion name is required" : false
                        })}
                        aria-label="Custom lesion name"
                        bg="gray.700"
                        borderColor="gray.600"
                        color="white"
                        _hover={{ borderColor: "gray.500" }}
                        _placeholder={{ color: "gray.400" }}
                      />
                      <FormErrorMessage>
                        {errors.fusion_data?.custom_lesion?.message}
                      </FormErrorMessage>
                    </FormControl>
                    
                    <FormControl isInvalid={errors.fusion_data?.anatomical_region} mb={3}>
                      <FormLabel fontSize="sm" color="gray.300">Anatomical Region</FormLabel>
                      <Select 
                        size="sm"
                        {...register("fusion_data.anatomical_region", { 
                          required: isCustomLesion ? "Anatomical region is required" : false
                        })}
                        aria-label="Anatomical region"
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
                        <option value="" style={{ backgroundColor: '#2D3748', color: 'white' }}>Select a region</option>
                        <option value="head and neck" style={{ backgroundColor: '#2D3748', color: 'white' }}>Head and Neck</option>
                        <option value="brain" style={{ backgroundColor: '#2D3748', color: 'white' }}>Brain</option>
                        <option value="thoracic" style={{ backgroundColor: '#2D3748', color: 'white' }}>Thoracic</option>
                        <option value="abdominal" style={{ backgroundColor: '#2D3748', color: 'white' }}>Abdominal</option>
                        <option value="pelvic" style={{ backgroundColor: '#2D3748', color: 'white' }}>Pelvic</option>
                        <option value="spinal" style={{ backgroundColor: '#2D3748', color: 'white' }}>Spinal</option>
                        <option value="extremity" style={{ backgroundColor: '#2D3748', color: 'white' }}>Extremity</option>
                      </Select>
                      <FormErrorMessage>
                        {errors.fusion_data?.anatomical_region?.message}
                      </FormErrorMessage>
                    </FormControl>
                  </>
                )}
              </GridItem>
              
              {/* Third Column - Preview for Single MRI or Registrations for Complex */}
              <GridItem 
                  as={Box} 
                  p={4} 
                  borderWidth="1px" 
                  borderRadius="md" 
                  bg={formBg}
                  borderColor={borderColor}
                  boxShadow="sm"
                >
                {(isSingleMriMode || isMultipleMriMode || isSinglePetMode || isSingleCtMode || 
                  isMultiplePetRigidMode || isMultiplePetDeformableMode || isMultiplePetRigidDeformableMode ||
                  isMultipleCtRigidMode || isMultipleCtDeformableMode || isMultipleCtRigidDeformableMode ||
                  isMriPetMode || isMriCtMode || isMriCtPetMode) ? (
                  // Preview section for single fusion mode
                  <>
                    <Heading size="sm" mb={3} textAlign="center" color="white">Fusion Preview</Heading>
                    
                    <Alert status="success" mb={3} size="sm" borderRadius="md" bg="green.900" borderColor="green.700">
                      <AlertIcon color="green.300" />
                      <Text fontSize="xs" color="green.200">
                        {fusionMode === 'single-mri' ? 'Single MRI/CT fusion configured'
                         : fusionMode === 'multiple-mri' ? `Multiple MRI/CT fusions configured (${parsedConfig?.mri?.rigid || 0} MRIs)`
                         : fusionMode === 'single-pet-rigid' ? 'Single PET/CT (Rigid) fusion configured'
                         : fusionMode === 'single-pet-deformable' ? 'Single PET/CT (Deformable) fusion configured'
                         : fusionMode === 'multiple-pet-rigid' ? `Multiple PET/CT rigid fusions configured (${parsedConfig?.pet?.rigid || 0} scans)`
                         : fusionMode === 'multiple-pet-deformable' ? `Multiple PET/CT deformable fusions configured (${parsedConfig?.pet?.deformable || 0} scans)`
                         : fusionMode === 'multiple-pet-rigid-deformable' ? `Multiple PET/CT rigid+deformable fusions configured (${(parsedConfig?.pet?.rigid || 0) + (parsedConfig?.pet?.deformable || 0)} scans)`
                         : fusionMode === 'single-ct-rigid' ? 'Single CT/CT (Rigid) fusion configured'
                         : fusionMode === 'single-ct-deformable' ? 'Single CT/CT (Deformable) fusion configured'
                         : fusionMode === 'multiple-ct-rigid' ? `Multiple CT/CT rigid fusions configured (${parsedConfig?.ct?.rigid || 0} scans)`
                         : fusionMode === 'multiple-ct-deformable' ? `Multiple CT/CT deformable fusions configured (${parsedConfig?.ct?.deformable || 0} scans)`
                         : fusionMode === 'multiple-ct-rigid-deformable' ? `Multiple CT/CT rigid+deformable fusions configured (${(parsedConfig?.ct?.rigid || 0) + (parsedConfig?.ct?.deformable || 0)} scans)`
                         : isMriPetSingleRigidMode ? 'MRI/CT + PET/CT (Rigid) fusion configured'
                         : isMriPetSingleDeformableMode ? 'MRI/CT + PET/CT (Deformable) fusion configured'
                         : isMriPetMode ? `Mixed MRI/CT + PET/CT fusions configured (${parsedConfig?.mri?.rigid || 0} MRI + ${(parsedConfig?.pet?.rigid || 0) + (parsedConfig?.pet?.deformable || 0)} PET)`
                         : isMriCtSingleRigidMode ? 'MRI/CT + CT/CT (Rigid) fusion configured'
                         : isMriCtSingleDeformableMode ? 'MRI/CT + CT/CT (Deformable) fusion configured'
                         : isMriCtMode ? `Mixed MRI/CT + CT/CT fusions configured (${parsedConfig?.mri?.rigid || 0} MRI + ${(parsedConfig?.ct?.rigid || 0) + (parsedConfig?.ct?.deformable || 0)} CT)`
                         : isMriCtPetSingleRigidRigidMode ? 'Ultimate fusion: 1 MRI + 1 CT (Rigid) + 1 PET (Rigid)'
                         : isMriCtPetSingleRigidDeformableMode ? 'Ultimate fusion: 1 MRI + 1 CT (Rigid) + 1 PET (Deformable)'
                         : isMriCtPetSingleDeformableRigidMode ? 'Ultimate fusion: 1 MRI + 1 CT (Deformable) + 1 PET (Rigid)'
                         : isMriCtPetSingleDeformableDeformableMode ? 'Ultimate fusion: 1 MRI + 1 CT (Deformable) + 1 PET (Deformable)'
                         : isMriCtPetMode ? `Ultimate fusion: ${parsedConfig?.mri?.rigid || 0} MRI + ${(parsedConfig?.ct?.rigid || 0) + (parsedConfig?.ct?.deformable || 0)} CT + ${(parsedConfig?.pet?.rigid || 0) + (parsedConfig?.pet?.deformable || 0)} PET`
                         : 'Single fusion configured'}
                      </Text>
                    </Alert>
                    
                    <Box mb={3}>
                      <Heading size="xs" mb={2} color="gray.300">What will be written up:</Heading>
                      
                      <Card size="sm" variant="outline" borderColor="green.400" bg="gray.700">
                        <CardBody p={3}>
                          <VStack align="start" spacing={2}>
                            <HStack>
                              <Badge colorScheme="green" size="sm">✓</Badge>
                              <Text fontSize="xs" color="gray.200">
                                <strong>Primary:</strong> Planning CT
                              </Text>
                            </HStack>
                            <HStack>
                              <Badge colorScheme="green" size="sm">✓</Badge>
                              <Text fontSize="xs" color="gray.200">
                                <strong>Secondary:</strong> {fusionMode === 'single-mri' ? 'MRI Study'
                                  : fusionMode === 'multiple-mri' ? `${parsedConfig?.mri?.rigid || 0} MRI Studies`
                                  : (fusionMode === 'single-pet-rigid' || fusionMode === 'single-pet-deformable') ? 'PET/CT Study'
                                  : fusionMode === 'multiple-pet-rigid' ? `${parsedConfig?.pet?.rigid || 0} PET/CT Studies`
                                  : fusionMode === 'multiple-pet-deformable' ? `${parsedConfig?.pet?.deformable || 0} PET/CT Studies`
                                  : fusionMode === 'multiple-pet-rigid-deformable' ? `${(parsedConfig?.pet?.rigid || 0) + (parsedConfig?.pet?.deformable || 0)} PET/CT Studies`
                                  : (fusionMode === 'single-ct-rigid' || fusionMode === 'single-ct-deformable') ? 'CT Study'
                                  : fusionMode === 'multiple-ct-rigid' ? `${parsedConfig?.ct?.rigid || 0} CT Studies`
                                  : fusionMode === 'multiple-ct-deformable' ? `${parsedConfig?.ct?.deformable || 0} CT Studies`
                                  : fusionMode === 'multiple-ct-rigid-deformable' ? `${(parsedConfig?.ct?.rigid || 0) + (parsedConfig?.ct?.deformable || 0)} CT Studies`
                                  : isMriCtMode ? `${parsedConfig?.mri?.rigid || 0} MRI + ${(parsedConfig?.ct?.rigid || 0) + (parsedConfig?.ct?.deformable || 0)} CT Studies`
                                  : isMriPetMode ? `${parsedConfig?.mri?.rigid || 0} MRI + ${(parsedConfig?.pet?.rigid || 0) + (parsedConfig?.pet?.deformable || 0)} PET Studies`
                                  : isMriCtPetMode ? `${parsedConfig?.mri?.rigid || 0} MRI + ${(parsedConfig?.ct?.rigid || 0) + (parsedConfig?.ct?.deformable || 0)} CT + ${(parsedConfig?.pet?.rigid || 0) + (parsedConfig?.pet?.deformable || 0)} PET Studies`
                                  : 'CT Study'}
                              </Text>
                            </HStack>
                            <HStack>
                              <Badge 
                                colorScheme={
                                  (fusionMode === 'single-pet-deformable' || fusionMode === 'single-ct-deformable' || fusionMode === 'multiple-pet-deformable' || fusionMode === 'multiple-ct-deformable' || isMriCtSingleDeformableMode) ? "purple"
                                  : (fusionMode === 'multiple-pet-rigid-deformable' || fusionMode === 'multiple-ct-rigid-deformable' || isMriCtSingleMriMultipleMixedMode || (isMriCtMode && parsedConfig?.ct?.rigid > 0 && parsedConfig?.ct?.deformable > 0)) ? "orange"
                                  : isMriCtPetMode ? "red"  // Ultimate combinations get red badge
                                  : "blue"
                                } 
                                size="sm"
                              >
                                {(fusionMode === 'single-pet-deformable' || fusionMode === 'single-ct-deformable' || fusionMode === 'multiple-pet-deformable' || fusionMode === 'multiple-ct-deformable' || isMriCtSingleDeformableMode) ? 'Deformable'
                                 : (fusionMode === 'multiple-pet-rigid-deformable' || fusionMode === 'multiple-ct-rigid-deformable' || isMriCtSingleMriMultipleMixedMode || (isMriCtMode && parsedConfig?.ct?.rigid > 0 && parsedConfig?.ct?.deformable > 0)) ? 'Mixed'
                                 : isMriCtPetMode ? 'Ultimate'
                                 : 'Rigid'}
                              </Badge>
                              <Text fontSize="xs" color="gray.200">
                                <strong>Method:</strong> {
                                  (fusionMode === 'single-pet-deformable' || fusionMode === 'single-ct-deformable' || fusionMode === 'multiple-pet-deformable' || fusionMode === 'multiple-ct-deformable' || isMriCtSingleDeformableMode) ? 'Deformable Registration'
                                  : (fusionMode === 'multiple-pet-rigid-deformable' || fusionMode === 'multiple-ct-rigid-deformable' || isMriCtSingleMriMultipleMixedMode || (isMriCtMode && parsedConfig?.ct?.rigid > 0 && parsedConfig?.ct?.deformable > 0)) ? 'Mixed (Rigid + Deformable) Registration'
                                  : isMriCtPetMode ? 'Ultimate Multi-Modality Registration (MRI + CT + PET)'
                                  : 'Rigid Registration'
                                }
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
                          • Introduction with physician consultation request<br/>
                          • Patient details and lesion information<br/>
                          • {fusionMode === 'single-mri' ? 'MRI'
                            : fusionMode === 'multiple-mri' ? 'Multiple MRI'
                            : (fusionMode === 'single-pet-rigid' || fusionMode === 'single-pet-deformable' || fusionMode === 'multiple-pet-rigid' || fusionMode === 'multiple-pet-deformable' || fusionMode === 'multiple-pet-rigid-deformable') ? 'PET/CT'
                            : isMriCtPetMode ? 'Multiple MRI + CT + PET/CT studies'
                            : 'CT'} {(fusionMode === 'multiple-mri' || fusionMode === 'multiple-pet-rigid' || fusionMode === 'multiple-pet-deformable' || fusionMode === 'multiple-pet-rigid-deformable' || fusionMode === 'multiple-ct-rigid' || fusionMode === 'multiple-ct-deformable' || fusionMode === 'multiple-ct-rigid-deformable' || isMriCtPetMode) ? 'studies' : 'study'} import into Velocity software<br/>
                          • {(fusionMode === 'single-pet-deformable' || fusionMode === 'single-ct-deformable' || fusionMode === 'multiple-pet-deformable' || fusionMode === 'multiple-ct-deformable') ? 'Rigid + deformable'
                            : (fusionMode === 'multiple-pet-rigid-deformable' || fusionMode === 'multiple-ct-rigid-deformable') ? 'Mixed rigid and deformable'
                            : isMriCtPetMode ? 'Comprehensive multi-modality (MRI rigid + CT rigid/deformable + PET rigid/deformable)'
                            : 'Rigid'} registration process description<br/>
                          • {fusionMode === 'single-mri' || fusionMode === 'multiple-mri' || fusionMode === 'multiple-pet-rigid' || fusionMode === 'multiple-ct-rigid' ? 'Manual refinement and accuracy verification'
                            : (fusionMode === 'single-pet-deformable' || fusionMode === 'single-ct-deformable' || fusionMode === 'multiple-pet-deformable' || fusionMode === 'multiple-ct-deformable' || fusionMode === 'multiple-pet-rigid-deformable' || fusionMode === 'multiple-ct-rigid-deformable') ? 'Deformable registration and validation'
                            : 'Manual refinement and accuracy verification'}<br/>
                          • Final approval by physician and physicist
                        </Text>
                      </Box>
                    </Box>
                  </>
                ) : (
                  // Original registration input for complex cases
                  <>
                    <Heading size="sm" mb={3} textAlign="center" color="white">Registrations</Heading>
                    
                    {!hasMriRegistration && !hasPetRegistration && (
                      <Alert status="info" mb={3} size="sm" borderRadius="md" bg="blue.900" borderColor="blue.700">
                        <AlertIcon color="blue.300" />
                        <Text fontSize="xs" color="blue.200">At least one registration is required</Text>
                      </Alert>
                    )}
                    
                    <Box mb={3}>
                      <Heading size="xs" mb={1} color="gray.300">Current Registrations</Heading>
                      
                      {fields.length === 0 ? (
                        <Text fontSize="sm" mb={3} color="gray.400">No registrations configured.</Text>
                      ) : (
                        <List spacing={2} mb={3}>
                          {fields.map((field, index) => (
                            <ListItem key={field.id}>
                              <Card size="sm" variant="outline" borderColor={borderColor} bg="gray.700">
                                <CardBody p={2}>
                                  <HStack justify="space-between">
                                    <Box>
                                      <Text fontSize="xs" color="gray.300"><strong>Primary:</strong> CT</Text>
                                      <Text fontSize="xs" color="gray.300">
                                        <strong>Secondary:</strong> {watch(`fusion_data.registrations.${index}.secondary`)}
                                        {watch(`fusion_data.registrations.${index}.secondary`) === 'MRI' && (
                                          <Badge ml={1} colorScheme="blue" fontSize="0.6em">Rigid Only</Badge>
                                        )}
                                      </Text>
                                      <Text fontSize="xs" color="gray.300">
                                        <strong>Method:</strong> {watch(`fusion_data.registrations.${index}.method`)}
                                      </Text>
                                    </Box>
                                    <Button 
                                      colorScheme="red" 
                                      size="xs" 
                                      onClick={() => confirmRemoveRegistration(index)}
                                      aria-label="Remove registration"
                                    >
                                      X
                                    </Button>
                                  </HStack>
                                </CardBody>
                              </Card>
                            </ListItem>
                          ))}
                        </List>
                      )}
                      
                      <Heading size="xs" mb={1} color="gray.300">Add New Registration</Heading>
                      
                      <Grid templateColumns="repeat(2, 1fr)" gap={1} mb={3}>
                        <GridItem>
                          <FormControl>
                            <FormLabel fontSize="sm" color="gray.300">Secondary Modality</FormLabel>
                            <Select 
                              id="new-secondary" 
                              size="sm"
                              onChange={handleSecondaryModalityChange}
                              defaultValue={modalities.length > 0 ? modalities[0] : ''}
                              aria-label="Secondary modality"
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
                              {modalities.map(modality => (
                                <option key={modality} value={modality} style={{ backgroundColor: '#2D3748', color: 'white' }}>{modality}</option>
                              ))}
                            </Select>
                          </FormControl>
                        </GridItem>
                        
                        <GridItem>
                          <FormControl>
                            <Tooltip 
                              label={selectedSecondaryModality === 'MRI' ? "MRI registrations require rigid method" : ""}
                              isDisabled={selectedSecondaryModality !== 'MRI'}
                            >
                              <Box>
                                <FormLabel fontSize="sm" color="gray.300">
                                  Registration Method
                                  {selectedSecondaryModality === 'MRI' && (
                                    <Badge ml={1} colorScheme="blue" fontSize="0.6em">Rigid Only</Badge>
                                  )}
                                </FormLabel>
                                <Select 
                                  id="new-method" 
                                  size="sm"
                                  isDisabled={selectedSecondaryModality === 'MRI'}
                                  defaultValue={registrationMethods.length > 0 ? registrationMethods[0] : ''}
                                  aria-label="Registration method"
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
                                  {registrationMethods.map(method => (
                                    <option key={method} value={method} style={{ backgroundColor: '#2D3748', color: 'white' }}>{method}</option>
                                  ))}
                                </Select>
                              </Box>
                            </Tooltip>
                          </FormControl>
                        </GridItem>
                      </Grid>
                      
                      <Button 
                        colorScheme="green" 
                        size="sm" 
                        onClick={addRegistration} 
                        width="100%"
                        aria-label="Add registration"
                      >
                        Add Registration
                      </Button>
                    </Box>
                  </>
                )}
              </GridItem>
            </Grid>
            
            <Flex gap={4} mb={6}>
              <Button
                colorScheme="green"
                isLoading={loading}
                type="submit"
                isDisabled={!isSingleMriMode && !isMultipleMriMode && !isSinglePetMode && !isSingleCtMode && 
                           !isMultiplePetRigidMode && !isMultiplePetDeformableMode && !isMultiplePetRigidDeformableMode &&
                           !isMultipleCtRigidMode && !isMultipleCtDeformableMode && !isMultipleCtRigidDeformableMode &&
                           !isMriPetMode && !isMriCtMode && !isMriCtPetMode && fields.length === 0}
                width="100%"
                size="md"
                aria-label="Generate write-up"
                shadow="md"
              >
                Generate Write-up
              </Button>
              
              <Button
                variant="outline"
                colorScheme="red"
                onClick={handleResetForm}
                width="auto"
                size="md"
                aria-label="Reset form"
                color="red.300"
                borderColor="red.600"
                _hover={{ bg: "red.800", borderColor: "red.400" }}
              >
                Reset Form
              </Button>
            </Flex>
          </form>
          
          {writeup && (
            <Box mt={6}>
              <Heading size="md" mb={3} color="white">Generated Write-up</Heading>
              <Box
                p={4}
                borderWidth={1}
                borderRadius="md"
                bg={writeupBg}
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
                  onClick={() => {
                    navigator.clipboard.writeText(writeup);
                    toast({
                      title: "Copied to clipboard",
                      status: "success",
                      duration: 2000,
                    });
                  }}
                  aria-label="Copy to clipboard"
                >
                  Copy to Clipboard
                </Button>
              </Box>
            </Box>
          )}
        </Box>
        
        {/* Delete confirmation dialog */}
        <AlertDialog
          isOpen={isDeleteAlertOpen}
          leastDestructiveRef={cancelRef}
          onClose={() => setIsDeleteAlertOpen(false)}
        >
          <AlertDialogOverlay>
            <AlertDialogContent bg="gray.800" color="white" borderColor="gray.600">
              <AlertDialogHeader fontSize="lg" fontWeight="bold" color="white">
                Remove Registration
              </AlertDialogHeader>

              <AlertDialogBody color="gray.300">
                Are you sure you want to remove this registration?
              </AlertDialogBody>

              <AlertDialogFooter bg="gray.700">
                <Button ref={cancelRef} onClick={() => setIsDeleteAlertOpen(false)} variant="outline" color="gray.300" borderColor="gray.600" _hover={{ bg: "gray.600" }}>
                  Cancel
                </Button>
                <Button colorScheme="red" onClick={handleRemoveRegistration} ml={3}>
                  Delete
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialogOverlay>
        </AlertDialog>
      </Box>
    </Box>
  );
};

export default FusionForm; 