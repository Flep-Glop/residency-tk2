import React from 'react';
import { 
  Box, 
  Container, 
  Heading, 
  Text, 
  SimpleGrid, 
  Card, 
  CardHeader, 
  CardBody, 
  CardFooter,
  Button,
  Center
} from '@chakra-ui/react';
import { useRouter } from 'next/router';

const HomePage = () => {
  const router = useRouter();

  const modules = [
    {
      title: 'Fusion',
      description: 'Generate write-ups for multimodality image fusions',
      path: '/fusion',
      isAvailable: true
    },
    {
      title: 'DIBH',
      description: 'Document deep inspiration breath hold procedures',
      path: '/dibh',
      isAvailable: true
    },
    {
      title: 'SBRT',
      description: 'Create stereotactic body radiation therapy documentation',
      path: '/sbrt',
      isAvailable: true
    },
    {
      title: 'Prior Dose',
      description: 'Calculate and document prior radiation exposures',
      path: '/prior-dose',
      isAvailable: false
    },
    {
      title: 'Pacemaker',
      description: 'Document pacemaker and ICD assessments',
      path: '/pacemaker',
      isAvailable: false
    }
  ];

  return (
    <Container maxW="container.xl" py={8}>
      <Box textAlign="center" mb={10}>
        <Heading as="h1" size="2xl" mb={4}>
          Medical Physics Toolkit
        </Heading>
        <Text fontSize="xl" maxW="container.md" mx="auto">
          Streamlining documentation for radiation oncology workflows
        </Text>
      </Box>

      <Box mb={12}>
        <Heading as="h2" size="lg" mb={6}>
          Available Tools
        </Heading>
        
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
          {modules.map((module) => (
            <Card key={module.title} height="100%">
              <CardHeader>
                <Heading size="md">{module.title}</Heading>
              </CardHeader>
              <CardBody>
                <Text>{module.description}</Text>
              </CardBody>
              <CardFooter>
                <Button 
                  colorScheme="blue" 
                  onClick={() => router.push(module.path)}
                  isDisabled={!module.isAvailable}
                  width="100%"
                >
                  {module.isAvailable ? 'Launch' : 'Coming Soon'}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </SimpleGrid>
      </Box>

      <Box bg="gray.50" p={6} borderRadius="md">
        <Heading as="h3" size="md" mb={4}>
          About Medical Physics Toolkit
        </Heading>
        <Text mb={4}>
          The Medical Physics Toolkit is designed to help radiation oncology residents and 
          physicists create standardized documentation quickly and accurately, improving clinical 
          workflow efficiency.
        </Text>
        <Text fontStyle="italic">
          Version 1.0 - Migrated from Streamlit to React/FastAPI
        </Text>
      </Box>
    </Container>
  );
};

export default HomePage; 