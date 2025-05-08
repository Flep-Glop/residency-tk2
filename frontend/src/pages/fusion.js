import React from 'react';
import { Box, Container, Heading, Button, HStack } from '@chakra-ui/react';
import { useRouter } from 'next/router';
import FusionForm from '../components/fusion/FusionForm';

const FusionPage = () => {
  const router = useRouter();

  return (
    <Container maxW="container.xl" py={6}>
      <HStack justifyContent="space-between" mb={4}>
        <Heading as="h1" size="xl">Fusion Write-up Generator</Heading>
        <Button onClick={() => router.push('/')}>← Home</Button>
      </HStack>
      
      <Box 
        p={4} 
        borderWidth="1px" 
        borderRadius="lg" 
        boxShadow="md"
        bg="white"
      >
        <FusionForm />
      </Box>
    </Container>
  );
};

export default FusionPage; 