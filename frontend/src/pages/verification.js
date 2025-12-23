import React from 'react';
import { 
  Box, 
  Container, 
  Heading, 
  Text, 
  VStack, 
  Card, 
  CardHeader, 
  CardBody,
  Button,
  Badge,
  Divider,
  SimpleGrid,
  HStack
} from '@chakra-ui/react';
import { useRouter } from 'next/router';
import { ArrowBackIcon } from '@chakra-ui/icons';

const VerificationPage = () => {
  const router = useRouter();
  const { type, config } = router.query;
  
  // Parse the config from query string
  let parsedConfig = {};
  try {
    if (config) {
      parsedConfig = JSON.parse(decodeURIComponent(config));
    }
  } catch (error) {
    console.error('Error parsing config:', error);
  }

  // Helper function to determine fusion type and format based on workflow logic
  const analyzeFusionConfig = (fusionConfig) => {
    const analysis = {
      totalFusions: 0,
      fusionTypes: [],
      workflowFormat: '',
      isSingle: true,
      isComplex: false
    };

    // Count all fusions
    const mriCount = fusionConfig.mri?.rigid || 0;
    const petRigidCount = fusionConfig.pet?.rigid || 0;
    const petDeformableCount = fusionConfig.pet?.deformable || 0;
    const ctRigidCount = fusionConfig.ct?.rigid || 0;
    const ctDeformableCount = fusionConfig.ct?.deformable || 0;
    const isBladderscan = fusionConfig.ct?.bladderStatus || false;

    analysis.totalFusions = mriCount + petRigidCount + petDeformableCount + ctRigidCount + ctDeformableCount;

    // Handle bladder scan special case
    if (isBladderscan) {
      analysis.fusionTypes.push('CT/CT Full/Empty Bladder');
      analysis.workflowFormat = 'Full/Empty - Bladder Status';
      analysis.isSingle = true;
      return analysis;
    }

    // Determine if single or multiple
    analysis.isSingle = analysis.totalFusions === 1;

    // Build fusion type descriptions
    if (mriCount > 0) {
      if (mriCount === 1) {
        analysis.fusionTypes.push('MRI/CT (Rigid)');
        if (analysis.isSingle) {
          analysis.workflowFormat = 'r - Rigid';
        } else {
          // Single MRI in a complex combination still uses n_m format
          analysis.workflowFormat += analysis.workflowFormat ? ` + n_m` : 'n_m';
        }
      } else {
        analysis.fusionTypes.push(`${mriCount} MRI/CT (Rigid)`);
        analysis.workflowFormat += analysis.workflowFormat ? ` + n_m` : 'n_m - Multiple MRI';
      }
    }

    if (petRigidCount > 0 || petDeformableCount > 0) {
      const petTotal = petRigidCount + petDeformableCount;
      let petDesc = '';
      let petFormat = '';
      
      if (petTotal === 1) {
        if (petRigidCount > 0 && petDeformableCount > 0) {
          petDesc = 'PET/CT (Rigid+Deformable)';
          petFormat = 'r+d - Rigid+Deformable';
        } else if (petRigidCount > 0) {
          petDesc = 'PET/CT (Rigid)';
          petFormat = 'r - Rigid';
        } else {
          petDesc = 'PET/CT (Deformable)';
          petFormat = 'd - Deformable';
        }
        
        if (analysis.isSingle) analysis.workflowFormat = petFormat;
      } else {
        // Multiple PET/CT
        if (petRigidCount > 0 && petDeformableCount > 0) {
          petDesc = `${petTotal} PET/CT (${petRigidCount} Rigid, ${petDeformableCount} Deformable)`;
          petFormat = 'n_p,(r+d) - Both types';
        } else if (petRigidCount > 0) {
          petDesc = `${petRigidCount} PET/CT (Rigid)`;
          petFormat = 'n_p,r - Rigid only';
        } else {
          petDesc = `${petDeformableCount} PET/CT (Deformable)`;
          petFormat = 'n_p,d - Deformable only';
        }
        
        analysis.workflowFormat += analysis.workflowFormat ? ` + ${petFormat}` : petFormat;
      }
      
      analysis.fusionTypes.push(petDesc);
    }

    if (ctRigidCount > 0 || ctDeformableCount > 0) {
      const ctTotal = ctRigidCount + ctDeformableCount;
      let ctDesc = '';
      let ctFormat = '';
      
      if (ctTotal === 1) {
        if (ctRigidCount > 0 && ctDeformableCount > 0) {
          ctDesc = 'CT/CT (Rigid+Deformable)';
          ctFormat = 'r+d - Rigid+Deformable';
        } else if (ctRigidCount > 0) {
          ctDesc = 'CT/CT (Rigid)';
          ctFormat = 'r - Rigid';
        } else {
          ctDesc = 'CT/CT (Deformable)';
          ctFormat = 'd - Deformable';
        }
        
        if (analysis.isSingle) analysis.workflowFormat = ctFormat;
      } else {
        // Multiple CT/CT
        if (ctRigidCount > 0 && ctDeformableCount > 0) {
          ctDesc = `${ctTotal} CT/CT (${ctRigidCount} Rigid, ${ctDeformableCount} Deformable)`;
          ctFormat = 'n_c,(r+d) - Both types';
        } else if (ctRigidCount > 0) {
          ctDesc = `${ctRigidCount} CT/CT (Rigid)`;
          ctFormat = 'n_c,r - Rigid only';
        } else {
          ctDesc = `${ctDeformableCount} CT/CT (Deformable)`;
          ctFormat = 'n_c,d - Deformable only';
        }
        
        analysis.workflowFormat += analysis.workflowFormat ? ` + ${ctFormat}` : ctFormat;
      }
      
      analysis.fusionTypes.push(ctDesc);
    }

    // Determine if this is a complex combination scenario
    const modalityCount = (mriCount > 0 ? 1 : 0) + (petRigidCount + petDeformableCount > 0 ? 1 : 0) + (ctRigidCount + ctDeformableCount > 0 ? 1 : 0);
    analysis.isComplex = modalityCount > 1 || analysis.totalFusions > 1;

    return analysis;
  };

  // Helper function to analyze MPC config
  const analyzeMpcConfig = (mpcConfig) => {
    const analysis = {
      selectedItems: [],
      treatmentType: '3D/IMRT', // Default if no special treatments
      isDibhEligible: false,
      workflowPath: []
    };

    // Prior treatment analysis
    if (mpcConfig.prior) {
      analysis.selectedItems.push('Prior Treatment');
      analysis.workflowPath.push('Prior → Assess Overlap Per Treatment');
    }

    // Pacemaker analysis
    if (mpcConfig.pacemaker?.enabled) {
      if (mpcConfig.pacemaker.low) {
        analysis.selectedItems.push('Pacemaker/ICD (Low Risk)');
        analysis.workflowPath.push('Pacemaker → Low Risk → Proceed');
      } else if (mpcConfig.pacemaker.medium) {
        analysis.selectedItems.push('Pacemaker/ICD (Medium Risk)');
        analysis.workflowPath.push('Pacemaker → Medium Risk → Proceed');
      } else if (mpcConfig.pacemaker.high) {
        analysis.selectedItems.push('Pacemaker/ICD (High Risk - BLOCKS TREATMENT)');
        analysis.workflowPath.push('Pacemaker → High Risk → Cannot Proceed');
      } else {
        analysis.selectedItems.push('Pacemaker/ICD (Incomplete - missing risk level)');
      }
    }

    // Special treatment types
    const specialTypes = mpcConfig.specialTreatmentTypes || {};
    if (specialTypes.sbrt) {
      analysis.treatmentType = 'SBRT';
      analysis.selectedItems.push('SBRT (Stereotactic Body Radiation Therapy)');
      analysis.workflowPath.push('Treatment Type → Add SBRT');
      analysis.isDibhEligible = true;
    } else if (specialTypes.srs) {
      analysis.treatmentType = 'SRS/SRT';
      analysis.selectedItems.push('SRS/SRT (Stereotactic Radiosurgery)');
      analysis.workflowPath.push('Treatment Type → Add SRS/SRT');
      analysis.isDibhEligible = false;
    } else if (specialTypes.tbi) {
      analysis.treatmentType = 'TBI';
      analysis.selectedItems.push('TBI (Total Body Irradiation)');
      analysis.workflowPath.push('Treatment Type → Add TBI');
      analysis.isDibhEligible = false;
    } else if (specialTypes.hdr) {
      analysis.treatmentType = 'HDR';
      analysis.selectedItems.push('HDR (High Dose Rate Brachytherapy)');
      analysis.workflowPath.push('Treatment Type → Add HDR');
      analysis.isDibhEligible = false;
    } else {
      // No special treatment selected - defaults to 3D/IMRT
      analysis.isDibhEligible = true;
    }

    // DIBH analysis
    if (mpcConfig.dibh) {
      if (analysis.isDibhEligible) {
        analysis.selectedItems.push('DIBH (Deep Inspiration Breath Hold)');
        analysis.workflowPath.push('DIBH → Add DIBH');
      } else {
        analysis.selectedItems.push('DIBH selected but incompatible with treatment type');
      }
    }

    return analysis;
  };

  const goBack = () => {
    router.push('/');
  };

  if (!type) {
    return (
      <Box bg="gray.900" minH="100vh">
        <Container maxW="container.lg" py={8}>
          <Card bg="gray.800" borderColor="gray.600">
            <CardBody>
              <Text color="gray.300">No verification data available.</Text>
              <Button mt={4} onClick={goBack} leftIcon={<ArrowBackIcon />}>
                Return Home
              </Button>
            </CardBody>
          </Card>
        </Container>
      </Box>
    );
  }

  return (
    <Box bg="gray.900" minH="100vh">
      <Container maxW="container.lg" py={8}>
        
        {/* Header */}
        <Box mb={6}>
          <Button 
            leftIcon={<ArrowBackIcon />} 
            onClick={goBack}
            variant="ghost"
            color="gray.300"
            mb={4}
          >
            Back to Home
          </Button>
          
          <Heading as="h1" size="xl" color="white" mb={2}>
            Configuration Verification
          </Heading>
          <Text color="gray.400">
            Review what the software interpreted from your selections
          </Text>
        </Box>

        {/* Main Content */}
        {type === 'fusion' && (
          <Card bg="gray.800" borderTop="4px" borderTopColor="blue.400" borderColor="gray.600">
            <CardHeader>
              <Heading size="lg" color="blue.200">
                Fusion Configuration Analysis
              </Heading>
            </CardHeader>
            <CardBody>
              <VStack spacing={6} align="stretch">
                
                {/* Raw Config Display */}
                <Box>
                  <Text color="gray.300" fontWeight="bold" mb={2}>Raw Input Data:</Text>
                  <Box bg="gray.700" p={4} borderRadius="md" borderLeft="4px" borderColor="blue.400">
                    <Text fontFamily="mono" fontSize="sm" color="gray.200">
                      {JSON.stringify(parsedConfig, null, 2)}
                    </Text>
                  </Box>
                </Box>

                <Divider borderColor="gray.600" />

                {/* Analysis Results */}
                {(() => {
                  const analysis = analyzeFusionConfig(parsedConfig);
                  return (
                    <>
                      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                        <Box>
                          <Text color="blue.200" fontWeight="bold" mb={2}>Workflow Classification:</Text>
                          <Badge colorScheme={analysis.isSingle ? "green" : "purple"} size="lg">
                            {analysis.isSingle ? "Single Fusion" : "Multiple Fusions"}
                          </Badge>
                          {analysis.isComplex && (
                            <Badge colorScheme="orange" size="lg" ml={2}>
                              Complex Combination
                            </Badge>
                          )}
                        </Box>
                        
                        <Box>
                          <Text color="blue.200" fontWeight="bold" mb={2}>Total Fusions:</Text>
                          <Text fontSize="2xl" fontWeight="bold" color="blue.300">
                            {analysis.totalFusions}
                          </Text>
                        </Box>
                      </SimpleGrid>

                      <Box>
                        <Text color="blue.200" fontWeight="bold" mb={2}>Fusion Types Detected:</Text>
                        <VStack align="stretch" spacing={2}>
                          {analysis.fusionTypes.map((type, index) => (
                            <Box key={index} bg="gray.700" p={3} borderRadius="md">
                              <Text color="gray.200">{type}</Text>
                            </Box>
                          ))}
                        </VStack>
                      </Box>

                      <Box>
                        <Text color="blue.200" fontWeight="bold" mb={2}>Workflow Format Output:</Text>
                        <Box bg="yellow.900" p={4} borderRadius="md" border="2px" borderColor="yellow.600">
                          <Text fontWeight="bold" color="yellow.200" fontSize="lg">
                            {analysis.workflowFormat || "No valid configuration"}
                          </Text>
                          <Text color="yellow.300" fontSize="sm" mt={2} fontStyle="italic">
                            This matches the workflow diagram notation from docs/fusion-quickwrite-flow.mermaid
                          </Text>
                        </Box>
                      </Box>

                      {/* Example Test Case Display */}
                      <Box bg="blue.900" p={4} borderRadius="md" border="1px" borderColor="blue.600">
                        <Text color="blue.200" fontWeight="bold" mb={2}>Example Test Case:</Text>
                        <Text color="blue.300" fontSize="sm" mb={2}>
                          Try: 4 MRI/CT + 2 PET/CT (Deformable) → Expected: "n_m + n_p,d"
                        </Text>
                        <Text color="blue.300" fontSize="sm">
                          Complex combinations automatically detected when multiple modalities or counts &gt; 1
                        </Text>
                      </Box>
                    </>
                  );
                })()}
                
              </VStack>
            </CardBody>
          </Card>
        )}

        {type === 'mpc' && (
          <Card bg="gray.800" borderTop="4px" borderTopColor="purple.400" borderColor="gray.600">
            <CardHeader>
              <Heading size="lg" color="purple.200">
                General MPC Configuration Analysis
              </Heading>
            </CardHeader>
            <CardBody>
              <VStack spacing={6} align="stretch">
                
                {/* Raw Config Display */}
                <Box>
                  <Text color="gray.300" fontWeight="bold" mb={2}>Raw Input Data:</Text>
                  <Box bg="gray.700" p={4} borderRadius="md" borderLeft="4px" borderColor="purple.400">
                    <Text fontFamily="mono" fontSize="sm" color="gray.200">
                      {JSON.stringify(parsedConfig, null, 2)}
                    </Text>
                  </Box>
                </Box>

                <Divider borderColor="gray.600" />

                {/* Analysis Results */}
                {(() => {
                  const analysis = analyzeMpcConfig(parsedConfig);
                  return (
                    <>
                      <Box>
                        <Text color="purple.200" fontWeight="bold" mb={2}>Treatment Type (Implied):</Text>
                        <Badge colorScheme="purple" size="lg">
                          {analysis.treatmentType}
                        </Badge>
                        {analysis.treatmentType === '3D/IMRT' && (
                          <Text color="gray.400" fontSize="sm" mt={1}>
                            * Default when no special treatments selected
                          </Text>
                        )}
                      </Box>

                      <Box>
                        <Text color="purple.200" fontWeight="bold" mb={2}>Selected Components:</Text>
                        <VStack align="stretch" spacing={2}>
                          {analysis.selectedItems.length > 0 ? (
                            analysis.selectedItems.map((item, index) => (
                              <Box key={index} bg="gray.700" p={3} borderRadius="md">
                                <Text color="gray.200">{item}</Text>
                              </Box>
                            ))
                          ) : (
                            <Box bg="gray.700" p={3} borderRadius="md">
                              <Text color="gray.400" fontStyle="italic">No components selected</Text>
                            </Box>
                          )}
                        </VStack>
                      </Box>

                      <Box>
                        <Text color="purple.200" fontWeight="bold" mb={2}>DIBH Eligibility:</Text>
                        <HStack>
                          <Badge colorScheme={analysis.isDibhEligible ? "green" : "red"}>
                            {analysis.isDibhEligible ? "ELIGIBLE" : "NOT ELIGIBLE"}
                          </Badge>
                          <Text color="gray.400" fontSize="sm">
                            (Based on treatment type: {analysis.treatmentType})
                          </Text>
                        </HStack>
                      </Box>

                      {analysis.workflowPath.length > 0 && (
                        <Box>
                          <Text color="purple.200" fontWeight="bold" mb={2}>Workflow Path:</Text>
                          <Box bg="yellow.900" p={4} borderRadius="md" border="1px" borderColor="yellow.600">
                            <VStack align="stretch" spacing={1}>
                              {analysis.workflowPath.map((path, index) => (
                                <Text key={index} color="yellow.200" fontSize="sm">
                                  • {path}
                                </Text>
                              ))}
                            </VStack>
                          </Box>
                        </Box>
                      )}
                    </>
                  );
                })()}
                
              </VStack>
            </CardBody>
          </Card>
        )}

        {/* Next Steps */}
        <Card bg="gray.800" borderColor="gray.600" mt={6}>
          <CardBody>
            <Heading size="md" color="white" mb={3}>Next Steps:</Heading>
            {type === 'fusion' && (() => {
              const analysis = analyzeFusionConfig(parsedConfig);
              const isSingleMriCt = analysis.totalFusions === 1 && parsedConfig.mri?.rigid === 1;
              const isMultipleMriCt = (parsedConfig.mri?.rigid || 0) > 1 && analysis.totalFusions === (parsedConfig.mri?.rigid || 0);
              const isSinglePetCt = analysis.totalFusions === 1 && 
                ((parsedConfig.pet?.rigid === 1 && !parsedConfig.pet?.deformable) || 
                 (parsedConfig.pet?.deformable === 1 && !parsedConfig.pet?.rigid));
              const isSingleCtCt = analysis.totalFusions === 1 && 
                ((parsedConfig.ct?.rigid === 1 && !parsedConfig.ct?.deformable) || 
                 (parsedConfig.ct?.deformable === 1 && !parsedConfig.ct?.rigid));
              
              // Multiple-only PET/CT modes
              const isMultiplePetRigid = (parsedConfig.pet?.rigid || 0) > 1 && 
                analysis.totalFusions === (parsedConfig.pet?.rigid || 0);
              const isMultiplePetDeformable = (parsedConfig.pet?.deformable || 0) > 1 && 
                analysis.totalFusions === (parsedConfig.pet?.deformable || 0);
              const isMultiplePetRigidAndDeformable = (parsedConfig.pet?.rigid || 0) > 0 && 
                (parsedConfig.pet?.deformable || 0) > 0 && 
                ((parsedConfig.pet?.rigid || 0) + (parsedConfig.pet?.deformable || 0)) > 1 &&
                analysis.totalFusions === ((parsedConfig.pet?.rigid || 0) + (parsedConfig.pet?.deformable || 0));
              
              // Multiple-only CT/CT modes
              const isMultipleCtRigid = (parsedConfig.ct?.rigid || 0) > 1 && 
                analysis.totalFusions === (parsedConfig.ct?.rigid || 0);
              const isMultipleCtDeformable = (parsedConfig.ct?.deformable || 0) > 1 && 
                analysis.totalFusions === (parsedConfig.ct?.deformable || 0);
              const isMultipleCtRigidAndDeformable = (parsedConfig.ct?.rigid || 0) > 0 && 
                (parsedConfig.ct?.deformable || 0) > 0 && 
                ((parsedConfig.ct?.rigid || 0) + (parsedConfig.ct?.deformable || 0)) > 1 &&
                analysis.totalFusions === ((parsedConfig.ct?.rigid || 0) + (parsedConfig.ct?.deformable || 0));
              
              // Mixed MRI + PET combinations
              const mriCount = parsedConfig.mri?.rigid || 0;
              const petRigidCount = parsedConfig.pet?.rigid || 0;
              const petDeformableCount = parsedConfig.pet?.deformable || 0;
              const totalPetCount = petRigidCount + petDeformableCount;
              
              // MRI + PET combination detection
              const isMriPetSingle = mriCount === 1 && totalPetCount === 1 && analysis.totalFusions === 2;
              const isMriPetMultiple = mriCount > 0 && totalPetCount > 0 && (mriCount > 1 || totalPetCount > 1) && analysis.totalFusions === (mriCount + totalPetCount);
              
              // Specific MRI+PET subcombinations for detailed detection
              const isMriSinglePetSingle = mriCount === 1 && totalPetCount === 1;
              const isMultipleMriSinglePet = mriCount > 1 && totalPetCount === 1;
              const isSingleMriMultiplePet = mriCount === 1 && totalPetCount > 1;
              
              // Mixed MRI + CT combinations
              const ctRigidCount = parsedConfig.ct?.rigid || 0;
              const ctDeformableCount = parsedConfig.ct?.deformable || 0;
              const totalCtCount = ctRigidCount + ctDeformableCount;
              
              // MRI + CT combination detection
              const isMriCtSingle = mriCount === 1 && totalCtCount === 1 && analysis.totalFusions === 2;
              const isMriCtMultiple = mriCount > 0 && totalCtCount > 0 && (mriCount > 1 || totalCtCount > 1) && analysis.totalFusions === (mriCount + totalCtCount);
              
              // Specific MRI+CT subcombinations for detailed detection
              const isMriSingleCtSingle = mriCount === 1 && totalCtCount === 1;
              const isMultipleMriSingleCt = mriCount > 1 && totalCtCount === 1;
              const isSingleMriMultipleCt = mriCount === 1 && totalCtCount > 1;
              
              // MRI + CT + PET combinations (3 modality types)
              const isMriCtPetSingle = mriCount === 1 && totalCtCount === 1 && totalPetCount === 1 && analysis.totalFusions === 3;
              const isMriCtPetMultiple = mriCount > 0 && totalCtCount > 0 && totalPetCount > 0 && 
                (mriCount > 1 || totalCtCount > 1 || totalPetCount > 1) && 
                analysis.totalFusions === (mriCount + totalCtCount + totalPetCount);
              
              // Three-modality combination takes precedence over dual combinations
              if (isMriCtPetSingle) {
                // Simple case: 1 MRI + 1 CT + 1 PET
                const ctMethod = ctRigidCount > 0 ? 'Rigid' : 'Deformable';
                const petMethod = petRigidCount > 0 ? 'Rigid' : 'Deformable';
                return (
                  <>
                    <Text color="gray.300" mb={4}>
                      Three-modality fusion combination detected (1 MRI + 1 CT {ctMethod} + 1 PET {petMethod})! This is a comprehensive fusion workflow.
                    </Text>
                    <HStack spacing={3}>
                      <Button 
                        colorScheme="green" 
                        onClick={() => router.push(`/fusion?config=${encodeURIComponent(JSON.stringify(parsedConfig))}`)}
                        size="lg"
                      >
                        Proceed to Fusion Form
                      </Button>
                      <Button colorScheme="blue" variant="outline" onClick={goBack}>
                        Make Changes
                      </Button>
                    </HStack>
                  </>
                );
              } else if (isMriCtPetMultiple) {
                // Complex cases: Multiple combinations of all three modalities
                let description = '';
                if (mriCount === 1 && totalCtCount === 1) {
                  // 1 MRI + 1 CT + Multiple PET
                  const ctMethod = ctRigidCount > 0 ? 'Rigid' : 'Deformable';
                  let petDesc = '';
                  if (petRigidCount > 0 && petDeformableCount > 0) {
                    petDesc = `${petRigidCount} Rigid, ${petDeformableCount} Deformable`;
                  } else if (petRigidCount > 0) {
                    petDesc = `${petRigidCount} Rigid`;
                  } else {
                    petDesc = `${petDeformableCount} Deformable`;
                  }
                  description = `1 MRI + 1 CT (${ctMethod}) + ${totalPetCount} PET/CT (${petDesc})`;
                } else if (mriCount === 1 && totalPetCount === 1) {
                  // 1 MRI + Multiple CT + 1 PET
                  const petMethod = petRigidCount > 0 ? 'Rigid' : 'Deformable';
                  let ctDesc = '';
                  if (ctRigidCount > 0 && ctDeformableCount > 0) {
                    ctDesc = `${ctRigidCount} Rigid, ${ctDeformableCount} Deformable`;
                  } else if (ctRigidCount > 0) {
                    ctDesc = `${ctRigidCount} Rigid`;
                  } else {
                    ctDesc = `${ctDeformableCount} Deformable`;
                  }
                  description = `1 MRI + ${totalCtCount} CT (${ctDesc}) + 1 PET/CT (${petMethod})`;
                } else if (totalCtCount === 1 && totalPetCount === 1) {
                  // Multiple MRI + 1 CT + 1 PET
                  const ctMethod = ctRigidCount > 0 ? 'Rigid' : 'Deformable';
                  const petMethod = petRigidCount > 0 ? 'Rigid' : 'Deformable';
                  description = `${mriCount} MRI + 1 CT (${ctMethod}) + 1 PET/CT (${petMethod})`;
                } else {
                  // Very complex: Multiple of multiple modalities
                  let ctDesc = '';
                  if (ctRigidCount > 0 && ctDeformableCount > 0) {
                    ctDesc = `${ctRigidCount} Rigid, ${ctDeformableCount} Deformable`;
                  } else if (ctRigidCount > 0) {
                    ctDesc = `${ctRigidCount} Rigid`;
                  } else {
                    ctDesc = `${ctDeformableCount} Deformable`;
                  }
                  
                  let petDesc = '';
                  if (petRigidCount > 0 && petDeformableCount > 0) {
                    petDesc = `${petRigidCount} Rigid, ${petDeformableCount} Deformable`;
                  } else if (petRigidCount > 0) {
                    petDesc = `${petRigidCount} Rigid`;
                  } else {
                    petDesc = `${petDeformableCount} Deformable`;
                  }
                  
                  description = `${mriCount} MRI + ${totalCtCount} CT (${ctDesc}) + ${totalPetCount} PET/CT (${petDesc})`;
                }
                
                return (
                  <>
                    <Text color="gray.300" mb={4}>
                      Three-modality fusion combination detected ({description})! This represents a comprehensive multi-modality fusion workflow.
                    </Text>
                    <Text color="yellow.300" mb={4} fontSize="sm">
                      This complex combination involves {analysis.totalFusions} total fusions across 3 different imaging modalities.
                    </Text>
                    <HStack spacing={3}>
                      <Button 
                        colorScheme="green" 
                        onClick={() => router.push(`/fusion?config=${encodeURIComponent(JSON.stringify(parsedConfig))}`)}
                        size="lg"
                      >
                        Proceed to Fusion Form
                      </Button>
                      <Button colorScheme="blue" variant="outline" onClick={goBack}>
                        Make Changes
                      </Button>
                    </HStack>
                  </>
                );
              } else if (isSingleMriCt) {
                return (
                  <>
                    <Text color="gray.300" mb={4}>
                      Single MRI/CT fusion detected! You can proceed to create your write-up using the existing fusion form.
                    </Text>
                    <HStack spacing={3}>
                      <Button 
                        colorScheme="green" 
                        onClick={() => router.push(`/fusion?config=${encodeURIComponent(JSON.stringify(parsedConfig))}`)}
                        size="lg"
                      >
                        Proceed to Fusion Form
                      </Button>
                      <Button colorScheme="blue" variant="outline" onClick={goBack}>
                        Make Changes
                      </Button>
                    </HStack>
                  </>
                );
              } else if (isMultipleMriCt) {
                const mriCount = parsedConfig.mri?.rigid || 0;
                return (
                  <>
                    <Text color="gray.300" mb={4}>
                      Multiple MRI/CT fusions detected ({mriCount} MRIs)! You can proceed to create your write-up using the fusion form.
                    </Text>
                    <HStack spacing={3}>
                      <Button 
                        colorScheme="green" 
                        onClick={() => router.push(`/fusion?config=${encodeURIComponent(JSON.stringify(parsedConfig))}`)}
                        size="lg"
                      >
                        Proceed to Fusion Form
                      </Button>
                      <Button colorScheme="blue" variant="outline" onClick={goBack}>
                        Make Changes
                      </Button>
                    </HStack>
                  </>
                );
              } else if (isSinglePetCt) {
                const petType = parsedConfig.pet?.rigid === 1 ? 'Rigid' : 'Deformable';
                return (
                  <>
                    <Text color="gray.300" mb={4}>
                      Single PET/CT ({petType}) fusion detected! You can proceed to create your write-up using the existing fusion form.
                    </Text>
                    <HStack spacing={3}>
                      <Button 
                        colorScheme="green" 
                        onClick={() => router.push(`/fusion?config=${encodeURIComponent(JSON.stringify(parsedConfig))}`)}
                        size="lg"
                      >
                        Proceed to Fusion Form
                      </Button>
                      <Button colorScheme="blue" variant="outline" onClick={goBack}>
                        Make Changes
                      </Button>
                    </HStack>
                  </>
                );
              } else if (isSingleCtCt) {
                const ctType = parsedConfig.ct?.rigid === 1 ? 'Rigid' : 'Deformable';
                return (
                  <>
                    <Text color="gray.300" mb={4}>
                      Single CT/CT ({ctType}) fusion detected! You can proceed to create your write-up using the existing fusion form.
                    </Text>
                    <HStack spacing={3}>
                      <Button 
                        colorScheme="green" 
                        onClick={() => router.push(`/fusion?config=${encodeURIComponent(JSON.stringify(parsedConfig))}`)}
                        size="lg"
                      >
                        Proceed to Fusion Form
                      </Button>
                      <Button colorScheme="blue" variant="outline" onClick={goBack}>
                        Make Changes
                      </Button>
                    </HStack>
                  </>
                );
              } else if (isMultiplePetRigid) {
                const petCount = parsedConfig.pet?.rigid || 0;
                return (
                  <>
                    <Text color="gray.300" mb={4}>
                      Multiple PET/CT rigid fusions detected ({petCount} scans)! You can proceed to create your write-up using the fusion form.
                    </Text>
                    <HStack spacing={3}>
                      <Button 
                        colorScheme="green" 
                        onClick={() => router.push(`/fusion?config=${encodeURIComponent(JSON.stringify(parsedConfig))}`)}
                        size="lg"
                      >
                        Proceed to Fusion Form
                      </Button>
                      <Button colorScheme="blue" variant="outline" onClick={goBack}>
                        Make Changes
                      </Button>
                    </HStack>
                  </>
                );
              } else if (isMultiplePetDeformable) {
                const petCount = parsedConfig.pet?.deformable || 0;
                return (
                  <>
                    <Text color="gray.300" mb={4}>
                      Multiple PET/CT deformable fusions detected ({petCount} scans)! You can proceed to create your write-up using the fusion form.
                    </Text>
                    <HStack spacing={3}>
                      <Button 
                        colorScheme="green" 
                        onClick={() => router.push(`/fusion?config=${encodeURIComponent(JSON.stringify(parsedConfig))}`)}
                        size="lg"
                      >
                        Proceed to Fusion Form
                      </Button>
                      <Button colorScheme="blue" variant="outline" onClick={goBack}>
                        Make Changes
                      </Button>
                    </HStack>
                  </>
                );
              } else if (isMultiplePetRigidAndDeformable) {
                const rigidCount = parsedConfig.pet?.rigid || 0;
                const deformableCount = parsedConfig.pet?.deformable || 0;
                const totalCount = rigidCount + deformableCount;
                return (
                  <>
                    <Text color="gray.300" mb={4}>
                      Multiple PET/CT rigid+deformable fusions detected ({totalCount} scans: {rigidCount} rigid, {deformableCount} deformable)! You can proceed to create your write-up using the fusion form.
                    </Text>
                    <HStack spacing={3}>
                      <Button 
                        colorScheme="green" 
                        onClick={() => router.push(`/fusion?config=${encodeURIComponent(JSON.stringify(parsedConfig))}`)}
                        size="lg"
                      >
                        Proceed to Fusion Form
                      </Button>
                      <Button colorScheme="blue" variant="outline" onClick={goBack}>
                        Make Changes
                      </Button>
                    </HStack>
                  </>
                );
              } else if (isMultipleCtRigid) {
                const ctCount = parsedConfig.ct?.rigid || 0;
                return (
                  <>
                    <Text color="gray.300" mb={4}>
                      Multiple CT/CT rigid fusions detected ({ctCount} scans)! You can proceed to create your write-up using the fusion form.
                    </Text>
                    <HStack spacing={3}>
                      <Button 
                        colorScheme="green" 
                        onClick={() => router.push(`/fusion?config=${encodeURIComponent(JSON.stringify(parsedConfig))}`)}
                        size="lg"
                      >
                        Proceed to Fusion Form
                      </Button>
                      <Button colorScheme="blue" variant="outline" onClick={goBack}>
                        Make Changes
                      </Button>
                    </HStack>
                  </>
                );
              } else if (isMultipleCtDeformable) {
                const ctCount = parsedConfig.ct?.deformable || 0;
                return (
                  <>
                    <Text color="gray.300" mb={4}>
                      Multiple CT/CT deformable fusions detected ({ctCount} scans)! You can proceed to create your write-up using the fusion form.
                    </Text>
                    <HStack spacing={3}>
                      <Button 
                        colorScheme="green" 
                        onClick={() => router.push(`/fusion?config=${encodeURIComponent(JSON.stringify(parsedConfig))}`)}
                        size="lg"
                      >
                        Proceed to Fusion Form
                      </Button>
                      <Button colorScheme="blue" variant="outline" onClick={goBack}>
                        Make Changes
                      </Button>
                    </HStack>
                  </>
                );
              } else if (isMultipleCtRigidAndDeformable) {
                const rigidCount = parsedConfig.ct?.rigid || 0;
                const deformableCount = parsedConfig.ct?.deformable || 0;
                const totalCount = rigidCount + deformableCount;
                return (
                  <>
                    <Text color="gray.300" mb={4}>
                      Multiple CT/CT rigid+deformable fusions detected ({totalCount} scans: {rigidCount} rigid, {deformableCount} deformable)! You can proceed to create your write-up using the fusion form.
                    </Text>
                    <HStack spacing={3}>
                      <Button 
                        colorScheme="green" 
                        onClick={() => router.push(`/fusion?config=${encodeURIComponent(JSON.stringify(parsedConfig))}`)}
                        size="lg"
                      >
                        Proceed to Fusion Form
                      </Button>
                      <Button colorScheme="blue" variant="outline" onClick={goBack}>
                        Make Changes
                      </Button>
                    </HStack>
                  </>
                );
              } else if (isMriPetSingle) {
                // Single MRI + Single PET combination
                const petMethod = petRigidCount > 0 ? 'Rigid' : 'Deformable';
                return (
                  <>
                    <Text color="gray.300" mb={4}>
                      MRI/CT + PET/CT fusion combination detected (1 MRI + 1 PET {petMethod})! You can proceed to create your write-up using the fusion form.
                    </Text>
                    <HStack spacing={3}>
                      <Button 
                        colorScheme="green" 
                        onClick={() => router.push(`/fusion?config=${encodeURIComponent(JSON.stringify(parsedConfig))}`)}
                        size="lg"
                      >
                        Proceed to Fusion Form
                      </Button>
                      <Button colorScheme="blue" variant="outline" onClick={goBack}>
                        Make Changes
                      </Button>
                    </HStack>
                  </>
                );
              } else if (isMriPetMultiple) {
                // Multiple MRI + PET combinations (2+ MRI, 2+ PET, or 1 MRI + 2+ PET, etc.)
                let description = '';
                if (isMultipleMriSinglePet) {
                  const petMethod = petRigidCount > 0 ? 'Rigid' : 'Deformable';
                  description = `${mriCount} MRI/CT + 1 PET/CT (${petMethod})`;
                } else if (isSingleMriMultiplePet) {
                  let petDesc = '';
                  if (petRigidCount > 0 && petDeformableCount > 0) {
                    petDesc = `${petRigidCount} Rigid, ${petDeformableCount} Deformable`;
                  } else if (petRigidCount > 0) {
                    petDesc = `${petRigidCount} Rigid`;
                  } else {
                    petDesc = `${petDeformableCount} Deformable`;
                  }
                  description = `1 MRI/CT + ${totalPetCount} PET/CT (${petDesc})`;
                } else {
                  // Multiple MRI + Multiple PET
                  let petDesc = '';
                  if (petRigidCount > 0 && petDeformableCount > 0) {
                    petDesc = `${petRigidCount} Rigid, ${petDeformableCount} Deformable`;
                  } else if (petRigidCount > 0) {
                    petDesc = `${petRigidCount} Rigid`;
                  } else {
                    petDesc = `${petDeformableCount} Deformable`;
                  }
                  description = `${mriCount} MRI/CT + ${totalPetCount} PET/CT (${petDesc})`;
                }
                
                return (
                  <>
                    <Text color="gray.300" mb={4}>
                      Mixed MRI/CT + PET/CT fusion combination detected ({description})! You can proceed to create your write-up using the fusion form.
                    </Text>
                    <HStack spacing={3}>
                      <Button 
                        colorScheme="green" 
                        onClick={() => router.push(`/fusion?config=${encodeURIComponent(JSON.stringify(parsedConfig))}`)}
                        size="lg"
                      >
                        Proceed to Fusion Form
                      </Button>
                      <Button colorScheme="blue" variant="outline" onClick={goBack}>
                        Make Changes
                      </Button>
                    </HStack>
                  </>
                );
              } else if (isMriCtSingle) {
                // Single MRI + Single CT combination
                const ctMethod = ctRigidCount > 0 ? 'Rigid' : 'Deformable';
                return (
                  <>
                    <Text color="gray.300" mb={4}>
                      MRI/CT + CT/CT fusion combination detected (1 MRI + 1 CT {ctMethod})! You can proceed to create your write-up using the fusion form.
                    </Text>
                    <HStack spacing={3}>
                      <Button 
                        colorScheme="green" 
                        onClick={() => router.push(`/fusion?config=${encodeURIComponent(JSON.stringify(parsedConfig))}`)}
                        size="lg"
                      >
                        Proceed to Fusion Form
                      </Button>
                      <Button colorScheme="blue" variant="outline" onClick={goBack}>
                        Make Changes
                      </Button>
                    </HStack>
                  </>
                );
              } else if (isMriCtMultiple) {
                // Multiple MRI + CT combinations (2+ MRI, 2+ CT, or 1 MRI + 2+ CT, etc.)
                let description = '';
                if (isMultipleMriSingleCt) {
                  const ctMethod = ctRigidCount > 0 ? 'Rigid' : 'Deformable';
                  description = `${mriCount} MRI/CT + 1 CT/CT (${ctMethod})`;
                } else if (isSingleMriMultipleCt) {
                  let ctDesc = '';
                  if (ctRigidCount > 0 && ctDeformableCount > 0) {
                    ctDesc = `${ctRigidCount} Rigid, ${ctDeformableCount} Deformable`;
                  } else if (ctRigidCount > 0) {
                    ctDesc = `${ctRigidCount} Rigid`;
                  } else {
                    ctDesc = `${ctDeformableCount} Deformable`;
                  }
                  description = `1 MRI/CT + ${totalCtCount} CT/CT (${ctDesc})`;
                } else {
                  // Multiple MRI + Multiple CT
                  let ctDesc = '';
                  if (ctRigidCount > 0 && ctDeformableCount > 0) {
                    ctDesc = `${ctRigidCount} Rigid, ${ctDeformableCount} Deformable`;
                  } else if (ctRigidCount > 0) {
                    ctDesc = `${ctRigidCount} Rigid`;
                  } else {
                    ctDesc = `${ctDeformableCount} Deformable`;
                  }
                  description = `${mriCount} MRI/CT + ${totalCtCount} CT/CT (${ctDesc})`;
                }
                
                return (
                  <>
                    <Text color="gray.300" mb={4}>
                      Mixed MRI/CT + CT/CT fusion combination detected ({description})! You can proceed to create your write-up using the fusion form.
                    </Text>
                    <HStack spacing={3}>
                      <Button 
                        colorScheme="green" 
                        onClick={() => router.push(`/fusion?config=${encodeURIComponent(JSON.stringify(parsedConfig))}`)}
                        size="lg"
                      >
                        Proceed to Fusion Form
                      </Button>
                      <Button colorScheme="blue" variant="outline" onClick={goBack}>
                        Make Changes
                      </Button>
                    </HStack>
                  </>
                );
              } else {
                return (
                  <>
                    <Text color="gray.300" mb={4}>
                      This verification shows how the software interprets your selections. For complex fusion configurations, 
                      input forms are still under development.
                    </Text>
                    <Button colorScheme="blue" onClick={goBack}>
                      Make Changes
                    </Button>
                  </>
                );
              }
            })()}
            {type === 'mpc' && (() => {
              // Prior Dose detection logic
              const isPriorDose = parsedConfig.prior;

              // If Prior Dose is selected, show proceed button
              if (isPriorDose) {
                return (
                  <>
                    <Text color="gray.300" mb={4}>
                      Prior Dose consultation detected! You can proceed to the detailed form.
                    </Text>
                    <HStack spacing={3}>
                      <Button 
                        colorScheme="green" 
                        onClick={() => router.push(`/prior-dose?config=${encodeURIComponent(JSON.stringify(parsedConfig))}`)}
                        size="lg"
                      >
                        Proceed to Prior Dose Form
                      </Button>
                      <Button colorScheme="blue" variant="outline" onClick={goBack}>
                        Make Changes
                      </Button>
                    </HStack>
                  </>
                );
              }
              
              // Pacemaker detection logic (check before treatment types)
              const isPacemakerWithLow = parsedConfig.pacemaker?.enabled && parsedConfig.pacemaker.low;
              const isPacemakerWithMedium = parsedConfig.pacemaker?.enabled && parsedConfig.pacemaker.medium;
              const isPacemakerWithHigh = parsedConfig.pacemaker?.enabled && parsedConfig.pacemaker.high;
              const isPacemakerIncomplete = parsedConfig.pacemaker?.enabled && !parsedConfig.pacemaker.low && !parsedConfig.pacemaker.medium && !parsedConfig.pacemaker.high;

              if (isPacemakerWithLow || isPacemakerWithMedium) {
                const riskLevel = isPacemakerWithLow ? 'Low' : 'Medium';
                return (
                  <>
                    <Text color="gray.300" mb={4}>
                      Pacemaker/CIED ({riskLevel} Risk) consultation detected! You can proceed to the detailed form.
                    </Text>
                    <HStack spacing={3}>
                      <Button 
                        colorScheme="green" 
                        onClick={() => router.push(`/pacemaker?config=${encodeURIComponent(JSON.stringify(parsedConfig))}`)}
                        size="lg"
                      >
                        Proceed to Pacemaker Form
                      </Button>
                      <Button colorScheme="blue" variant="outline" onClick={goBack}>
                        Make Changes
                      </Button>
                    </HStack>
                  </>
                );
              } else if (isPacemakerWithHigh) {
                return (
                  <>
                    <Text color="red.300" mb={4}>
                      HIGH RISK pacemaker case detected. This requires additional consultation with cardiology before proceeding with treatment. The form is still available for documentation purposes.
                    </Text>
                    <HStack spacing={3}>
                      <Button 
                        colorScheme="orange" 
                        onClick={() => router.push(`/pacemaker?config=${encodeURIComponent(JSON.stringify(parsedConfig))}`)}
                        size="lg"
                      >
                        Proceed to Pacemaker Form (High Risk)
                      </Button>
                      <Button colorScheme="blue" variant="outline" onClick={goBack}>
                        Make Changes
                      </Button>
                    </HStack>
                  </>
                );
              } else if (isPacemakerIncomplete) {
                return (
                  <>
                    <Text color="red.300" mb={4}>
                      Pacemaker/CIED is enabled but incomplete. Please select a risk level (Low, Medium, or High) to proceed.
                    </Text>
                    <Button colorScheme="blue" onClick={goBack}>
                      Make Changes
                    </Button>
                  </>
                );
              }
              
              // SBRT detection logic (check first since it's a treatment type)
              const analysis = analyzeMpcConfig(parsedConfig);
              const isSbrtSelected = parsedConfig.specialTreatmentTypes?.sbrt;
              
              if (isSbrtSelected) {
                return (
                  <>
                    <Text color="gray.300" mb={4}>
                      SBRT (Stereotactic Body Radiation Therapy) consultation detected! You can proceed to the detailed form.
                    </Text>
                    <HStack spacing={3}>
                      <Button 
                        colorScheme="green" 
                        onClick={() => router.push(`/sbrt?config=${encodeURIComponent(JSON.stringify(parsedConfig))}`)}
                        size="lg"
                      >
                        Proceed to SBRT Form
                      </Button>
                      <Button colorScheme="blue" variant="outline" onClick={goBack}>
                        Make Changes
                      </Button>
                    </HStack>
                  </>
                );
              }
              
              // SRS/SRT detection logic
              const isSrsSelected = parsedConfig.specialTreatmentTypes?.srs;
              
              if (isSrsSelected) {
                return (
                  <>
                    <Text color="gray.300" mb={4}>
                      SRS/SRT (Stereotactic Radiosurgery) consultation detected! You can proceed to the detailed form.
                    </Text>
                    <HStack spacing={3}>
                      <Button 
                        colorScheme="green" 
                        onClick={() => router.push(`/srs?config=${encodeURIComponent(JSON.stringify(parsedConfig))}`)}
                        size="lg"
                      >
                        Proceed to SRS/SRT Form
                      </Button>
                      <Button colorScheme="blue" variant="outline" onClick={goBack}>
                        Make Changes
                      </Button>
                    </HStack>
                  </>
                );
              }
              
              // TBI detection logic
              const isTbiSelected = parsedConfig.specialTreatmentTypes?.tbi;
              
              if (isTbiSelected) {
                return (
                  <>
                    <Text color="gray.300" mb={4}>
                      TBI (Total Body Irradiation) consultation detected! You can proceed to the detailed form.
                    </Text>
                    <HStack spacing={3}>
                      <Button 
                        colorScheme="green" 
                        onClick={() => router.push(`/tbi?config=${encodeURIComponent(JSON.stringify(parsedConfig))}`)}
                        size="lg"
                      >
                        Proceed to TBI Form
                      </Button>
                      <Button colorScheme="blue" variant="outline" onClick={goBack}>
                        Make Changes
                      </Button>
                    </HStack>
                  </>
                );
              }
              
              // HDR detection logic
              const isHdrSelected = parsedConfig.specialTreatmentTypes?.hdr;
              
              if (isHdrSelected) {
                return (
                  <>
                    <Text color="gray.300" mb={4}>
                      HDR (High Dose Rate Brachytherapy) consultation detected! You can proceed to the detailed form.
                    </Text>
                    <HStack spacing={3}>
                      <Button 
                        colorScheme="green" 
                        onClick={() => router.push(`/hdr?config=${encodeURIComponent(JSON.stringify(parsedConfig))}`)}
                        size="lg"
                      >
                        Proceed to HDR Form
                      </Button>
                      <Button colorScheme="blue" variant="outline" onClick={goBack}>
                        Make Changes
                      </Button>
                    </HStack>
                  </>
                );
              }
              
              // DIBH detection logic
              const isDibhSelected = parsedConfig.dibh;
              
              if (isDibhSelected && analysis.isDibhEligible) {
                return (
                  <>
                    <Text color="gray.300" mb={4}>
                      DIBH (Deep Inspiration Breath Hold) consultation detected! You can proceed to the detailed form.
                    </Text>
                    <HStack spacing={3}>
                      <Button 
                        colorScheme="green" 
                        onClick={() => router.push(`/dibh?config=${encodeURIComponent(JSON.stringify(parsedConfig))}`)}
                        size="lg"
                      >
                        Proceed to DIBH Form
                      </Button>
                      <Button colorScheme="blue" variant="outline" onClick={goBack}>
                        Make Changes
                      </Button>
                    </HStack>
                  </>
                );
              } else if (isDibhSelected && !analysis.isDibhEligible) {
                return (
                  <>
                    <Text color="red.300" mb={4}>
                      DIBH is selected but is not compatible with the treatment type ({analysis.treatmentType}). Please adjust your selections.
                    </Text>
                    <Button colorScheme="blue" onClick={goBack}>
                      Make Changes
                    </Button>
                  </>
                );
              } else {
                return (
                  <>
                    <Text color="gray.300" mb={4}>
                      This verification shows how the software interprets your MPC selections. 
                      Configure Prior Dose, DIBH, or SBRT options to proceed to a form.
                    </Text>
                    <Button colorScheme="blue" onClick={goBack}>
                      Make Changes
                    </Button>
                  </>
                );
              }
            })()}
          </CardBody>
        </Card>

      </Container>
    </Box>
  );
};

export default VerificationPage;