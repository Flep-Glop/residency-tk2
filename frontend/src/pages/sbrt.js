import React from 'react';
import { Box, Container, Heading, Button, HStack } from '@chakra-ui/react';
import { useRouter } from 'next/router';
import SBRTForm from '../components/sbrt/SBRTForm';

const SBRTPage = () => {
  const router = useRouter();

  return (
    <Container maxW="container.xl" py={6}>
      <HStack justifyContent="space-between" mb={4}>
        <Heading as="h1" size="xl">SBRT Write-up Generator</Heading>
        <Button onClick={() => router.push('/')}>← Home</Button>
      </HStack>
      
      <Box 
        p={4} 
        borderWidth="1px" 
        borderRadius="lg" 
        boxShadow="md"
        bg="white"
      >
        <SBRTForm />
      </Box>
    </Container>
  );
};

export default SBRTPage; 