import React from 'react';
import { Box, Button } from '@chakra-ui/react';
import { useRouter } from 'next/router';
import { HDRForm } from '../components/hdr';

const HDRPage = () => {
  const router = useRouter();

  return (
    <Box bg="gray.900" minH="100vh">
      <Box position="absolute" top={4} left={4} zIndex={10}>
        <Button
          size="sm"
          variant="outline"
          colorScheme="gray"
          onClick={() => router.push('/')}
        >
          ← Home
        </Button>
      </Box>
      <HDRForm />
    </Box>
  );
};

export default HDRPage;

