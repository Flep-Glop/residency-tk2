import React from 'react';
import { Box, Heading, Button, Alert, AlertIcon, AlertTitle, AlertDescription, Text } from '@chakra-ui/react';
import { useRouter } from 'next/router';

const GuidesPage = () => {
  const router = useRouter();

  return (
    <Box bg="gray.900" minH="100vh">
      {/* Home button positioned absolutely */}
      <Box position="absolute" top={4} right={4} zIndex={10}>
        <Button 
          onClick={() => router.push('/')} 
          colorScheme="teal" 
          variant="outline"
          color="teal.300"
          borderColor="teal.600"
          _hover={{ bg: "teal.800", borderColor: "teal.400" }}
        >
          ← Home
        </Button>
      </Box>
      
      {/* Header */}
      <Box bg="teal.900" color="white" p={6} mb={6} borderRadius="lg" border="1px" borderColor="teal.700">
        <Box>
          <Heading size="xl" mb={2}>📚 Clinical Procedures & How-To Guides</Heading>
          <Text opacity={0.9}>Step-by-step guidance for radiation therapy procedures</Text>
        </Box>
      </Box>

      {/* Main Content */}
      <Box px={6}>
        <Alert status="info" bg="blue.900" borderColor="blue.700" color="blue.200">
          <AlertIcon color="blue.300" />
          <Box>
            <AlertTitle color="blue.200">🚧 Clinical Procedure Guides Under Development</AlertTitle>
            <AlertDescription color="blue.300">
              Comprehensive step-by-step guides for plan review, TBI simulation, image fusion workflows, SBRT planning, brachytherapy procedures, and emergency protocols are being developed. Check back soon!
            </AlertDescription>
          </Box>
        </Alert>
      </Box>
    </Box>
  );
};

export default GuidesPage; 