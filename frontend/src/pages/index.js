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
  Center,
  Badge
} from '@chakra-ui/react';
import { useRouter } from 'next/router';

const HomePage = () => {
  const router = useRouter();

  // Organized modules by category with dark mode color coding
  const moduleCategories = {
    quickwrites: {
      title: '📝 Quick Documentation Tools',
      description: 'Generate standardized write-ups and documentation',
      color: 'green',
      modules: [
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
          isAvailable: false
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
      ]
    },
    qa: {
      title: '🔧 Quality Assurance Tools',
      description: 'Comprehensive QA workflows and checklists',
      color: 'purple',
      modules: [
        {
          title: 'QA Documentation System',
          description: 'Advanced quality assurance platform for medical professionals',
          path: '/qa-tool',
          isAvailable: false
        }
      ]
    },
    guides: {
      title: '📚 How-To Guides & Procedures',
      description: 'Step-by-step clinical procedure guidance',
      color: 'teal',
      modules: [
        {
          title: 'Clinical Procedure Guides',
          description: 'Comprehensive guides for plan review, TBI simulation, and more',
          path: '/guides',
          isAvailable: false
        }
      ]
    }
  };

  const renderModuleSection = (categoryKey, category) => (
    <Box key={categoryKey} mb={12}>
      <Box mb={6} p={4} bg={`${category.color}.900`} borderRadius="lg" border="1px" borderColor={`${category.color}.700`}>
        <Heading as="h2" size="lg" color={`${category.color}.200`} mb={2}>
          {category.title}
        </Heading>
        <Text color={`${category.color}.300`}>
          {category.description}
        </Text>
      </Box>
      
      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
        {category.modules.map((module) => (
          <Card 
            key={module.title} 
            height="100%"
            bg="gray.800"
            borderTop="4px"
            borderTopColor={`${category.color}.400`}
            borderColor="gray.600"
            _hover={{ 
              transform: "translateY(-2px)", 
              boxShadow: "xl",
              borderTopColor: `${category.color}.300`,
              bg: "gray.750"
            }}
            transition="all 0.2s"
          >
            <CardHeader>
              <Heading size="md" color={`${category.color}.200`}>
                {module.title}
                {!module.isAvailable && (
                  <Badge ml={2} colorScheme="gray" variant="subtle">
                    Coming Soon
                  </Badge>
                )}
              </Heading>
            </CardHeader>
            <CardBody>
              <Text color="gray.300">{module.description}</Text>
            </CardBody>
            <CardFooter>
              <Button 
                colorScheme={category.color}
                onClick={() => router.push(module.path)}
                isDisabled={!module.isAvailable}
                width="100%"
                variant={module.isAvailable ? "solid" : "outline"}
                _hover={module.isAvailable ? { 
                  bg: `${category.color}.600`,
                  transform: "translateY(-1px)"
                } : {}}
              >
                {module.isAvailable ? 'Launch' : 'Coming Soon'}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </SimpleGrid>
    </Box>
  );

  return (
    <Box bg="gray.900" minH="100vh">
      <Container maxW="container.xl" py={8}>
        <Box textAlign="center" mb={10}>
          <Heading as="h1" size="2xl" mb={4} color="white">
            Medical Physics Toolkit
          </Heading>
          <Text fontSize="xl" maxW="container.md" mx="auto" color="gray.300">
            Streamlining documentation and procedures for radiation oncology workflows
          </Text>
        </Box>

        {/* Render each category section */}
        {Object.entries(moduleCategories).map(([categoryKey, category]) => 
          renderModuleSection(categoryKey, category)
        )}

        <Box bg="gray.800" p={6} borderRadius="md" mt={12} border="1px" borderColor="gray.600">
          <Heading as="h3" size="md" mb={4} color="white">
            About Medical Physics Toolkit
          </Heading>
          <Text mb={4} color="gray.300">
            The Medical Physics Toolkit is designed to help radiation oncology residents and 
            physicists create standardized documentation quickly and accurately, improving clinical 
            workflow efficiency.
          </Text>
          <Text fontStyle="italic" color="gray.400">
            Version 1.0 - Migrated from Streamlit to React/FastAPI
          </Text>
        </Box>
      </Container>
    </Box>
  );
};

export default HomePage; 