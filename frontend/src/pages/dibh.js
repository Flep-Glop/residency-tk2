import React from 'react';
import { Box, Container, Heading, Button, HStack } from '@chakra-ui/react';
import { useRouter } from 'next/router';
import { DIBHForm } from '../components/dibh';

const DIBHPage = () => {
  const router = useRouter();

  return (
    <Container maxW="container.xl" py={6}>
      <HStack justifyContent="space-between" mb={4}>
        <Heading as="h1" size="xl">DIBH Write-up Generator</Heading>
        <Button onClick={() => router.push('/')}>← Home</Button>
      </HStack>
      
      <Box 
        p={4} 
        borderWidth="1px" 
        borderRadius="lg" 
        boxShadow="md"
        bg="white"
      >
        <DIBHForm />
      </Box>
    </Container>
  );
};

export default DIBHPage; 