import React from 'react';
import { Box, Button, Container } from '@chakra-ui/react';
import { useRouter } from 'next/router';
import { SRSForm } from '../components/srs';

const SRSPage = () => {
  const router = useRouter();

  return (
    <Box bg="gray.900" minH="100vh">
      <Container maxW="100%" p={0}>
        <Box p={4} bg="gray.800" borderBottom="1px" borderColor="gray.700">
          <Button
            colorScheme="blue"
            variant="ghost"
            onClick={() => router.push('/')}
            size="sm"
          >
            ← Home
          </Button>
        </Box>
        <SRSForm />
      </Container>
    </Box>
  );
};

export default SRSPage;

