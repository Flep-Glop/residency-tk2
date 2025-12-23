import React from 'react';
import { Box, Button } from '@chakra-ui/react';
import { useRouter } from 'next/router';
import { NeurostimulatorForm } from '../components/neurostimulator';

const NeurostimulatorPage = () => {
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
      
      <NeurostimulatorForm />
    </Box>
  );
};

export default NeurostimulatorPage;
