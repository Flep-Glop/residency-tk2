import React, { useState, useEffect, useRef } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
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
  Card,
  CardBody,
  HStack,
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
  Radio,
  RadioGroup,
  SimpleGrid,
} from '@chakra-ui/react';
import { getModalities, getRegistrationMethods, generateFusionWriteup } from '../../services/fusionService';

// Anatomical regions for fusion registration
const ANATOMICAL_REGIONS = [
  { value: 'brain', label: 'Brain' },
  { value: 'head and neck', label: 'Head & Neck' },
  { value: 'thoracic', label: 'Thoracic' },
  { value: 'abdominal', label: 'Abdominal' },
  { value: 'pelvic', label: 'Pelvic' },
  { value: 'spinal', label: 'Spinal' },
];

const FusionForm = () => {
  const router = useRouter();
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
  const [isCustomRegion, setIsCustomRegion] = useState(false);
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
          
          // Check for bladder filling study first (overrides all other modes)
          if (config.ct?.bladderStatus) {
            setFusionMode('bladder-filling');
            return;
          }
          
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
          } else if (mriCount === 0 && (petRigidCount > 0 || petDeformableCount > 0) && (ctRigidCount > 0 || ctDeformableCount > 0) && 
                     totalFusions === (petRigidCount + petDeformableCount + ctRigidCount + ctDeformableCount)) {
            // Mixed PET + CT combinations (no MRI)
            const totalPetCount = petRigidCount + petDeformableCount;
            const totalCtCount = ctRigidCount + ctDeformableCount;
            
            if (totalPetCount === 1 && totalCtCount === 1) {
              // 1 PET + 1 CT
              if (petRigidCount === 1 && ctRigidCount === 1) {
                setFusionMode('pet-ct-single-rigid-rigid');
              } else if (petRigidCount === 1 && ctDeformableCount === 1) {
                setFusionMode('pet-ct-single-rigid-deformable');
              } else if (petDeformableCount === 1 && ctRigidCount === 1) {
                setFusionMode('pet-ct-single-deformable-rigid');
              } else {
                setFusionMode('pet-ct-single-deformable-deformable');
              }
            } else {
              // Multiple PET and/or CT combinations
              setFusionMode('pet-ct-multiple');
            }
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
            // MRI + CT + PET combinations (3 modality types)
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
  const isBladderFillingMode = fusionMode === 'bladder-filling';
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
  
  // Mixed PET+CT mode helpers (no MRI)
  const isPetCtSingleRigidRigidMode = fusionMode === 'pet-ct-single-rigid-rigid';
  const isPetCtSingleRigidDeformableMode = fusionMode === 'pet-ct-single-rigid-deformable';
  const isPetCtSingleDeformableRigidMode = fusionMode === 'pet-ct-single-deformable-rigid';
  const isPetCtSingleDeformableDeformableMode = fusionMode === 'pet-ct-single-deformable-deformable';
  const isPetCtMultipleMode = fusionMode === 'pet-ct-multiple';
  
  // Combined PET+CT helper for conditional checks
  const isPetCtMode = isPetCtSingleRigidRigidMode || isPetCtSingleRigidDeformableMode || 
    isPetCtSingleDeformableRigidMode || isPetCtSingleDeformableDeformableMode || isPetCtMultipleMode;
  
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
  
  // MRI+CT+PET mode helpers
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
  
  // Combined MRI+CT+PET helper for conditional checks
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
        anatomical_region: '',
        custom_anatomical_region: '',
        registrations: [],
      }
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'fusion_data.registrations'
  });

  const watchedAnatomicalRegion = watch('fusion_data.anatomical_region');
  const watchedRegistrations = watch('fusion_data.registrations');
  const hasMriRegistration = watchedRegistrations?.some(reg => reg.secondary === 'MRI');
  const hasPetRegistration = watchedRegistrations?.some(reg => reg.secondary === 'PET/CT');

  // Load initial data
  useEffect(() => {
    const fetchInitialData = async () => {
      setInitialLoading(true);
      try {
        const [modalitiesData, methodsData] = await Promise.all([
          getModalities(),
          getRegistrationMethods()
        ]);
        
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
      } else if (isPetCtMode) {
        // Auto-populate mixed PET + CT combinations (no MRI) based on config and mode
        if (parsedConfig) {
          const registrations = [];
          const petRigidCount = parsedConfig.pet?.rigid || 0;
          const petDeformableCount = parsedConfig.pet?.deformable || 0;
          const ctRigidCount = parsedConfig.ct?.rigid || 0;
          const ctDeformableCount = parsedConfig.ct?.deformable || 0;
          
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
          
          setValue('fusion_data.registrations', registrations);
        }
      } else if (isMriCtPetMode) {
        // Auto-populate MRI + CT + PET combinations based on config and mode
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
  }, [fusionMode, registrationMethods, setValue, isPetCtMode, isMriPetMode, isMriCtMode, isMriCtPetMode, parsedConfig]);

  const onSubmit = async (data) => {
    // Validate that we have at least one registration (unless it's single, multiple, or bladder filling mode)
    if (!isBladderFillingMode && !isSingleMriMode && !isMultipleMriMode && !isSinglePetMode && !isSingleCtMode && 
        !isMultiplePetRigidMode && !isMultiplePetDeformableMode && !isMultiplePetRigidDeformableMode &&
        !isMultipleCtRigidMode && !isMultipleCtDeformableMode && !isMultipleCtRigidDeformableMode &&
        !isPetCtMode && !isMriPetMode && !isMriCtMode && !isMriCtPetMode && data.fusion_data.registrations.length === 0) {
      toast({
        title: 'Validation Error',
        description: 'At least one registration is required for multimodality fusion',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    // Set bladder filling study flag if in bladder mode
    if (isBladderFillingMode) {
      data.fusion_data.is_bladder_filling_study = true;
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
    const anatomicalRegion = isCustomRegion ? formData.fusion_data.custom_anatomical_region : formData.fusion_data.anatomical_region;
    
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

  const handleCustomRegionChange = (e) => {
    setIsCustomRegion(e.target.checked);
    if (e.target.checked) {
      setValue('fusion_data.anatomical_region', '');
    } else {
      setValue('fusion_data.custom_anatomical_region', '');
    }
  };


  const handleResetForm = () => {
    reset({
      common_info: {
        physician: { name: '', role: 'physician' },
        physicist: { name: '', role: 'physicist' },
      },
      fusion_data: {
        anatomical_region: '',
        custom_anatomical_region: '',
        registrations: [],
      }
    });
    setWriteup('');
    setIsCustomRegion(false);
    
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
            <Heading size="md" mb={2}>
              {fusionMode === 'bladder-filling' ? 'Full/Empty Bladder Comparison Write-up'
               : fusionMode === 'single-mri' ? 'MRI/CT Fusion Write-up' 
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
               : isPetCtSingleRigidRigidMode ? 'PET/CT + CT/CT Rigid Fusion Write-up'
               : isPetCtSingleRigidDeformableMode ? 'PET/CT Rigid + CT/CT Deformable Fusion Write-up'
               : isPetCtSingleDeformableRigidMode ? 'PET/CT Deformable + CT/CT Rigid Fusion Write-up'
               : isPetCtSingleDeformableDeformableMode ? 'PET/CT + CT/CT Deformable Fusion Write-up'
               : isPetCtMultipleMode ? 'Multiple PET/CT + CT/CT Fusion Write-up'
               : isMriPetSingleRigidMode ? 'MRI/CT + PET/CT Rigid Fusion Write-up'
               : isMriPetSingleDeformableMode ? 'MRI/CT + PET/CT Deformable Fusion Write-up'
               : isMriPetMode ? 'Mixed MRI/CT + PET/CT Fusion Write-up'
               : isMriCtSingleRigidMode ? 'MRI/CT + CT/CT Rigid Fusion Write-up'
               : isMriCtSingleDeformableMode ? 'MRI/CT + CT/CT Deformable Fusion Write-up'
               : isMriCtMode ? 'Mixed MRI/CT + CT/CT Fusion Write-up'
               : isMriCtPetSingleRigidRigidMode ? 'MRI + CT (Rigid) + PET (Rigid) Fusion Write-up'
               : isMriCtPetSingleRigidDeformableMode ? 'MRI + CT (Rigid) + PET (Deformable) Fusion Write-up'
               : isMriCtPetSingleDeformableRigidMode ? 'MRI + CT (Deformable) + PET (Rigid) Fusion Write-up'
               : isMriCtPetSingleDeformableDeformableMode ? 'MRI + CT (Deformable) + PET (Deformable) Fusion Write-up'
               : isMriCtPetMode ? 'MRI + CT + PET Fusion Write-up'
               : 'Fusion Write-up Generator'}
            </Heading>
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
                  
                  <FormControl isInvalid={errors.common_info?.physicist?.name} mb={3}>
                    <FormLabel fontSize="sm" color="gray.300" mb={2}>Physicist</FormLabel>
                    <Controller
                      name="common_info.physicist.name"
                      control={control}
                      rules={{ required: 'Physicist is required' }}
                      render={({ field }) => (
                        <Grid templateColumns="1fr 1fr" gap={2}>
                          <GridItem colSpan={2}>
                            <Button
                              size="sm"
                              width="100%"
                              variant={field.value === 'Papanikolaou' ? 'solid' : 'outline'}
                              colorScheme={field.value === 'Papanikolaou' ? 'blue' : 'gray'}
                              color={field.value === 'Papanikolaou' ? 'white' : 'gray.300'}
                              borderColor="gray.600"
                              onClick={() => field.onChange('Papanikolaou')}
                              _hover={{ bg: field.value === 'Papanikolaou' ? 'blue.600' : 'gray.700' }}
                            >
                              Papanikolaou
                            </Button>
                          </GridItem>
                          <Button
                            size="sm"
                            variant={field.value === 'Bassiri' ? 'solid' : 'outline'}
                            colorScheme={field.value === 'Bassiri' ? 'blue' : 'gray'}
                            color={field.value === 'Bassiri' ? 'white' : 'gray.300'}
                            borderColor="gray.600"
                            onClick={() => field.onChange('Bassiri')}
                            _hover={{ bg: field.value === 'Bassiri' ? 'blue.600' : 'gray.700' }}
                          >
                            Bassiri
                          </Button>
                          <Button
                            size="sm"
                            variant={field.value === 'Kirby' ? 'solid' : 'outline'}
                            colorScheme={field.value === 'Kirby' ? 'blue' : 'gray'}
                            color={field.value === 'Kirby' ? 'white' : 'gray.300'}
                            borderColor="gray.600"
                            onClick={() => field.onChange('Kirby')}
                            _hover={{ bg: field.value === 'Kirby' ? 'blue.600' : 'gray.700' }}
                          >
                            Kirby
                          </Button>
                          <Button
                            size="sm"
                            variant={field.value === 'Paschal' ? 'solid' : 'outline'}
                            colorScheme={field.value === 'Paschal' ? 'blue' : 'gray'}
                            color={field.value === 'Paschal' ? 'white' : 'gray.300'}
                            borderColor="gray.600"
                            onClick={() => field.onChange('Paschal')}
                            _hover={{ bg: field.value === 'Paschal' ? 'blue.600' : 'gray.700' }}
                          >
                            Paschal
                          </Button>
                          <Button
                            size="sm"
                            variant={field.value === 'Rasmussen' ? 'solid' : 'outline'}
                            colorScheme={field.value === 'Rasmussen' ? 'blue' : 'gray'}
                            color={field.value === 'Rasmussen' ? 'white' : 'gray.300'}
                            borderColor="gray.600"
                            onClick={() => field.onChange('Rasmussen')}
                            _hover={{ bg: field.value === 'Rasmussen' ? 'blue.600' : 'gray.700' }}
                          >
                            Rasmussen
                          </Button>
                        </Grid>
                      )}
                    />
                    <FormErrorMessage sx={{ color: 'red.300' }}>
                      {errors.common_info?.physicist?.name?.message}
                    </FormErrorMessage>
                  </FormControl>
                  
                  <FormControl isInvalid={errors.common_info?.physician?.name} mb={3}>
                    <FormLabel fontSize="sm" color="gray.300" mb={2}>Physician</FormLabel>
                    <Controller
                      name="common_info.physician.name"
                      control={control}
                      rules={{ required: 'Physician is required' }}
                      render={({ field }) => (
                        <Grid templateColumns="1fr 1fr" gap={2}>
                          <GridItem colSpan={2}>
                            <Button
                              size="sm"
                              width="100%"
                              variant={field.value === 'Tuli' ? 'solid' : 'outline'}
                              colorScheme={field.value === 'Tuli' ? 'blue' : 'gray'}
                              color={field.value === 'Tuli' ? 'white' : 'gray.300'}
                              borderColor="gray.600"
                              onClick={() => field.onChange('Tuli')}
                              _hover={{ bg: field.value === 'Tuli' ? 'blue.600' : 'gray.700' }}
                            >
                              Tuli
                            </Button>
                          </GridItem>
                          <Button
                            size="sm"
                            variant={field.value === 'Dalwadi' ? 'solid' : 'outline'}
                            colorScheme={field.value === 'Dalwadi' ? 'blue' : 'gray'}
                            color={field.value === 'Dalwadi' ? 'white' : 'gray.300'}
                            borderColor="gray.600"
                            onClick={() => field.onChange('Dalwadi')}
                            _hover={{ bg: field.value === 'Dalwadi' ? 'blue.600' : 'gray.700' }}
                          >
                            Dalwadi
                          </Button>
                          <Button
                            size="sm"
                            variant={field.value === 'Galvan' ? 'solid' : 'outline'}
                            colorScheme={field.value === 'Galvan' ? 'blue' : 'gray'}
                            color={field.value === 'Galvan' ? 'white' : 'gray.300'}
                            borderColor="gray.600"
                            onClick={() => field.onChange('Galvan')}
                            _hover={{ bg: field.value === 'Galvan' ? 'blue.600' : 'gray.700' }}
                          >
                            Galvan
                          </Button>
                          <Button
                            size="sm"
                            variant={field.value === 'Ha' ? 'solid' : 'outline'}
                            colorScheme={field.value === 'Ha' ? 'blue' : 'gray'}
                            color={field.value === 'Ha' ? 'white' : 'gray.300'}
                            borderColor="gray.600"
                            onClick={() => field.onChange('Ha')}
                            _hover={{ bg: field.value === 'Ha' ? 'blue.600' : 'gray.700' }}
                          >
                            Ha
                          </Button>
                          <Button
                            size="sm"
                            variant={field.value === 'Kluwe' ? 'solid' : 'outline'}
                            colorScheme={field.value === 'Kluwe' ? 'blue' : 'gray'}
                            color={field.value === 'Kluwe' ? 'white' : 'gray.300'}
                            borderColor="gray.600"
                            onClick={() => field.onChange('Kluwe')}
                            _hover={{ bg: field.value === 'Kluwe' ? 'blue.600' : 'gray.700' }}
                          >
                            Kluwe
                          </Button>
                          <Button
                            size="sm"
                            variant={field.value === 'Le' ? 'solid' : 'outline'}
                            colorScheme={field.value === 'Le' ? 'blue' : 'gray'}
                            color={field.value === 'Le' ? 'white' : 'gray.300'}
                            borderColor="gray.600"
                            onClick={() => field.onChange('Le')}
                            _hover={{ bg: field.value === 'Le' ? 'blue.600' : 'gray.700' }}
                          >
                            Le
                          </Button>
                          <Button
                            size="sm"
                            variant={field.value === 'Lewis' ? 'solid' : 'outline'}
                            colorScheme={field.value === 'Lewis' ? 'blue' : 'gray'}
                            color={field.value === 'Lewis' ? 'white' : 'gray.300'}
                            borderColor="gray.600"
                            onClick={() => field.onChange('Lewis')}
                            _hover={{ bg: field.value === 'Lewis' ? 'blue.600' : 'gray.700' }}
                          >
                            Lewis
                          </Button>
                        </Grid>
                      )}
                    />
                    <FormErrorMessage sx={{ color: 'red.300' }}>
                      {errors.common_info?.physician?.name?.message}
                    </FormErrorMessage>
                  </FormControl>
                </Box>
              </GridItem>
              
              {/* Anatomical Region Section - hidden for complex and bladder filling modes */}
              <GridItem 
                p={4} 
                borderWidth="0"
                borderRadius="md" 
                bg="transparent"
              >
                {!isBladderFillingMode && (isSingleMriMode || isMultipleMriMode || isSinglePetMode || isSingleCtMode || 
                  isMultiplePetRigidMode || isMultiplePetDeformableMode || isMultiplePetRigidDeformableMode ||
                  isMultipleCtRigidMode || isMultipleCtDeformableMode || isMultipleCtRigidDeformableMode ||
                  isPetCtMode || isMriPetMode || isMriCtMode || isMriCtPetMode) ? (
                  <Box
                    p={4}
                    borderWidth="1px"
                    borderRadius="md"
                    bg={formBg}
                    borderColor={borderColor}
                    boxShadow="sm"
                  >
                    <Heading size="sm" mb={3} textAlign="center" color="white">Anatomical Region</Heading>
                    
                    {!isCustomRegion ? (
                  <FormControl isInvalid={errors.fusion_data?.anatomical_region} mb={3}>
                    <FormLabel fontSize="sm" color="gray.300" fontWeight="bold">Select Region</FormLabel>
                    <Input
                      type="hidden"
                      {...register("fusion_data.anatomical_region", {
                        required: !isCustomRegion ? "Anatomical region is required" : false
                      })}
                    />
                    <RadioGroup
                      value={watchedAnatomicalRegion}
                      onChange={(value) => setValue('fusion_data.anatomical_region', value)}
                    >
                      <SimpleGrid columns={2} spacing={2}>
                        {ANATOMICAL_REGIONS.map((region) => (
                          <Button
                            key={region.value}
                            size="sm"
                            variant={watchedAnatomicalRegion === region.value ? 'solid' : 'outline'}
                            colorScheme={watchedAnatomicalRegion === region.value ? 'blue' : 'gray'}
                            color={watchedAnatomicalRegion === region.value ? 'white' : 'gray.300'}
                            onClick={() => setValue('fusion_data.anatomical_region', region.value)}
                            borderColor="gray.600"
                            _hover={{ 
                              bg: watchedAnatomicalRegion === region.value ? 'blue.600' : 'gray.600',
                              borderColor: 'gray.500'
                            }}
                          >
                            <Radio value={region.value} display="none" />
                            {region.label}
                          </Button>
                        ))}
                      </SimpleGrid>
                    </RadioGroup>
                    <FormErrorMessage sx={{ color: 'red.300' }}>
                      {errors.fusion_data?.anatomical_region?.message}
                    </FormErrorMessage>
                  </FormControl>
                ) : (
                  <FormControl isInvalid={errors.fusion_data?.custom_anatomical_region} mb={3}>
                    <FormLabel fontSize="sm" color="gray.300">Custom Anatomical Region</FormLabel>
                    <Input 
                      size="sm"
                      placeholder="e.g., shoulder, foot, sacrum"
                      {...register("fusion_data.custom_anatomical_region", { 
                        required: isCustomRegion ? "Custom anatomical region is required" : false
                      })}
                      aria-label="Custom anatomical region"
                      bg="gray.700"
                      borderColor="gray.600"
                      color="white"
                      _hover={{ borderColor: "gray.500" }}
                      _placeholder={{ color: "gray.400" }}
                    />
                    <FormErrorMessage sx={{ color: 'red.300' }}>
                      {errors.fusion_data?.custom_anatomical_region?.message}
                    </FormErrorMessage>
                  </FormControl>
                )}
                
                <Checkbox 
                  size="sm" 
                  isChecked={isCustomRegion} 
                  onChange={handleCustomRegionChange}
                  colorScheme="blue"
                  color="gray.300"
                >
                  <Text fontSize="sm" color="gray.300">Custom Region?</Text>
                </Checkbox>
                  </Box>
                ) : (
                  // Empty for complex mode - column kept for layout
                  null
                )}
              </GridItem>
              
              {/* Third Column - Fusion Configuration Summary */}
              <GridItem 
                  p={4} 
                  borderWidth="0"
                  borderRadius="md" 
                  bg="transparent"
                >
                {(isBladderFillingMode || isSingleMriMode || isMultipleMriMode || isSinglePetMode || isSingleCtMode || 
                  isMultiplePetRigidMode || isMultiplePetDeformableMode || isMultiplePetRigidDeformableMode ||
                  isMultipleCtRigidMode || isMultipleCtDeformableMode || isMultipleCtRigidDeformableMode ||
                  isPetCtMode || isMriPetMode || isMriCtMode || isMriCtPetMode) ? (
                  // Empty for pre-configured fusion modes and bladder filling - column kept for layout
                  null
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
                isDisabled={!isBladderFillingMode && !isSingleMriMode && !isMultipleMriMode && !isSinglePetMode && !isSingleCtMode && 
                           !isMultiplePetRigidMode && !isMultiplePetDeformableMode && !isMultiplePetRigidDeformableMode &&
                           !isMultipleCtRigidMode && !isMultipleCtDeformableMode && !isMultipleCtRigidDeformableMode &&
                           !isPetCtMode && !isMriPetMode && !isMriCtMode && !isMriCtPetMode && fields.length === 0}
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
              <Box
                p={4}
                borderWidth={1}
                borderRadius="md"
                bg={writeupBg}
                borderColor={borderColor}
                boxShadow="md"
              >
                <Flex justify="space-between" align="center" mb={3}>
                  <Heading size="sm" color="white">Generated Write-up</Heading>
                  <Button
                    size="sm"
                    colorScheme="green"
                    onClick={() => {
                      navigator.clipboard.writeText(writeup);
                      toast({
                        title: "Copied to clipboard",
                        status: "success",
                        duration: 2000,
                      });
                    }}
                  >
                    Copy to Clipboard
                  </Button>
                </Flex>
                <Textarea
                  value={writeup}
                  height="300px"
                  isReadOnly
                  fontSize="sm"
                  lineHeight="1"
                  resize="vertical"
                  aria-label="Generated write-up"
                  bg="gray.700"
                  borderColor="gray.600"
                  color="white"
                  _focus={{ borderColor: "green.500" }}
                  sx={{ fontFamily: '"Aseprite", monospace !important' }}
                />
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