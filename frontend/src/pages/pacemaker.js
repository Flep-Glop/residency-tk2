import { Box, Button } from '@chakra-ui/react';
import { useRouter } from 'next/router';
import { PacemakerForm } from '../components/pacemaker';

export default function PacemakerPage() {
  const router = useRouter();

  return (
    <Box bg="gray.900" minH="100vh" position="relative">
      <Button
        position="fixed"
        top={4}
        right={4}
        variant="outline"
        onClick={() => router.push('/')}
        size="sm"
        color="green.300"
        borderColor="green.600"
        _hover={{ bg: "green.800", borderColor: "green.400" }}
        zIndex={1000}
      >
        ← Home
      </Button>
      <PacemakerForm />
    </Box>
  );
}