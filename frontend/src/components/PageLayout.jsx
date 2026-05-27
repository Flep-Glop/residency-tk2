import React from 'react';
import { Box, Button } from '@chakra-ui/react';
import { useRouter } from 'next/router';

const PageLayout = ({ children }) => {
  const router = useRouter();

  return (
    <Box bg="gray.900" minH="100vh" position="relative">
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
      {children}
    </Box>
  );
};

export default PageLayout;
