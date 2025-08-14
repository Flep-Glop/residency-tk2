import React from 'react';
import { Box, Container, Heading, Button, Text } from '@chakra-ui/react';
import { useRouter } from 'next/router';
import SBRTForm from '../components/sbrt/SBRTForm';

const SBRTPage = () => {
  const router = useRouter();

  return (
    <Box bg="gray.900" minH="100vh">
      {/* Home button positioned absolutely */}
      <Box position="absolute" top={4} right={4} zIndex={10}>
        <Button 
          onClick={() => router.push('/')} 
          colorScheme="green" 
          variant="outline"
          color="green.300"
          borderColor="green.600"
          _hover={{ bg: "green.800", borderColor: "green.400" }}
        >
          ← Home
        </Button>
      </Box>
      
      {/* Header */}
      <Box bg="green.900" color="white" p={6} mb={6} borderRadius="lg" border="1px" borderColor="green.700">
        <Box>
          <Heading size="xl" mb={2}>📝 SBRT Write-up Generator</Heading>
          <Text opacity={0.9}>Create stereotactic body radiation therapy documentation</Text>
        </Box>
      </Box>

      {/* Main Content */}
      <Container maxW="7xl" px={6}>
        <SBRTForm />
      </Container>
    </Box>
  );
};

export default SBRTPage; 