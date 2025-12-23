import { Box, Button } from '@chakra-ui/react';
import { useRouter } from 'next/router';
import { PacemakerForm } from '../components/pacemaker';

export default function PacemakerPage() {
  const router = useRouter();

  return (
    <Box bg="gray.900" minH="100vh" position="relative">
      <Box position="absolute" top={4} right={4} zIndex={10}>
        <Button
          size="sm"
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
      <PacemakerForm />
    </Box>
  );
}