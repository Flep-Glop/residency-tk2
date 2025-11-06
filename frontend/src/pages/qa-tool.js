import React from 'react';
import { Box, Container, Heading, Button, HStack, Alert, AlertIcon, AlertTitle, AlertDescription, Text } from '@chakra-ui/react';
import { useRouter } from 'next/router';

const QAToolPage = () => {
  const router = useRouter();

  return (
    <Box bg="gray.900" minH="100vh">
      {/* Home button positioned absolutely */}
      <Box position="absolute" top={4} right={4} zIndex={10}>
        <Button 
          onClick={() => router.push('/')} 
          colorScheme="purple" 
          variant="outline"
          color="purple.300"
          borderColor="purple.600"
          _hover={{ bg: "purple.800", borderColor: "purple.400" }}
        >
          ← Home
        </Button>
      </Box>
      
      {/* Header */}
      <Box bg="purple.900" color="white" p={6} mb={6} borderRadius="lg" border="1px" borderColor="purple.700">
        <Box>
          <Heading size="xl" mb={2}>Advanced QA Documentation System</Heading>
          <Text opacity={0.9}>Comprehensive quality assurance procedures for radiation therapy equipment</Text>
        </Box>
      </Box>

      {/* Main Content */}
      <Box px={6}>
        <Alert status="info" bg="blue.900" borderColor="blue.700" color="blue.200">
          <AlertIcon color="blue.300" />
          <Box>
            <AlertTitle color="blue.200">QA Documentation System Under Development</AlertTitle>
            <AlertDescription color="blue.300">
              The comprehensive QA documentation system with monthly equipment checks, workflow management, and educational content is being developed. Check back soon for advanced quality assurance tools!
            </AlertDescription>
          </Box>
        </Alert>
      </Box>
    </Box>
  );
};

export default QAToolPage; 