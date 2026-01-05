import React from 'react';
import { Box, Container, Heading, Button, HStack } from '@chakra-ui/react';
import { useRouter } from 'next/router';
import { DIBHForm } from '../components/dibh';

const DIBHPage = () => {
  const router = useRouter();

  return (
    <Box bg="gray.900" minH="100vh">
      {/* Home button positioned absolutely, aligned with header */}
      <Box position="absolute" top={8} right={6} zIndex={10}>
        <Button 
          size="lg"
          variant="outline"
          colorScheme="green"
          color="green.300"
          borderColor="green.600"
          _hover={{ bg: "green.800", borderColor: "green.400" }}
          onClick={() => router.push('/')}
        >
          ← Home
        </Button>
      </Box>
      
      <DIBHForm />
    </Box>
  );
};

export default DIBHPage; 