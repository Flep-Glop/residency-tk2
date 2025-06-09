import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardHeader,
  CardBody,
  Heading,
  Text,
  VStack,
  HStack,
  IconButton,
  Collapse,
  Badge,
  Divider,
  useDisclosure,
} from '@chakra-ui/react';
import { VERSION_INFO, hasNewUpdates } from '../constants/version';

const UpdateNotification = () => {
  const { isOpen, onToggle } = useDisclosure();
  const [isNewUpdate, setIsNewUpdate] = useState(false);

  // Check if user has seen this version
  useEffect(() => {
    const lastSeenVersion = localStorage.getItem('lastSeenVersion');
    setIsNewUpdate(hasNewUpdates(lastSeenVersion));
  }, []);

  const handleMarkAsSeen = () => {
    localStorage.setItem('lastSeenVersion', VERSION_INFO.current);
    setIsNewUpdate(false);
  };

  const latestUpdate = VERSION_INFO.updates[0];

  return (
    <Box 
      position="fixed" 
      top={4} 
      right={4} 
      zIndex={1000}
      maxW="400px"
    >
      {/* Notification Toggle Button */}
      <HStack justify="flex-end" mb={2}>
        <Button
          size="sm"
          onClick={onToggle}
          colorScheme="blue"
          variant={isNewUpdate ? "solid" : "outline"}
          position="relative"
          bg={isNewUpdate ? "blue.500" : "gray.700"}
          borderColor="blue.400"
          color="white"
          _hover={{ 
            bg: isNewUpdate ? "blue.600" : "gray.600",
            borderColor: "blue.300"
          }}
        >
          📢 v{VERSION_INFO.current}
          {isNewUpdate && (
            <Box
              position="absolute"
              top="-2px"
              right="-2px"
              w="8px"
              h="8px"
              bg="red.500"
              borderRadius="full"
              animation="pulse 2s infinite"
            />
          )}
        </Button>
      </HStack>

      {/* Collapsible Update Panel */}
      <Collapse in={isOpen} animateOpacity>
        <Card
          bg="gray.800"
          borderColor="blue.500"
          borderWidth="1px"
          boxShadow="xl"
          maxH="500px"
          overflowY="auto"
        >
          <CardHeader pb={2}>
            <HStack justify="space-between" align="center">
              <VStack align="start" spacing={1}>
                <Heading size="sm" color="blue.200">
                  What's New
                </Heading>
                <Text fontSize="xs" color="gray.400">
                  Released {VERSION_INFO.releaseDate}
                </Text>
              </VStack>
              <IconButton
                size="xs"
                onClick={onToggle}
                icon={<Text>✕</Text>}
                variant="ghost"
                color="gray.400"
                _hover={{ color: "white", bg: "gray.700" }}
                aria-label="Close updates"
              />
            </HStack>
          </CardHeader>

          <CardBody pt={0}>
            <VStack align="stretch" spacing={4}>
              {/* Latest Update */}
              <Box>
                <HStack mb={2}>
                  <Badge colorScheme="blue" size="sm">
                    v{latestUpdate.version}
                  </Badge>
                  {isNewUpdate && (
                    <Badge colorScheme="red" size="sm">
                      NEW
                    </Badge>
                  )}
                </HStack>
                
                <VStack align="start" spacing={1}>
                  {latestUpdate.changes.map((change, index) => (
                    <Text key={index} fontSize="sm" color="gray.300">
                      {change}
                    </Text>
                  ))}
                </VStack>
              </Box>

              {/* Previous Updates */}
              {VERSION_INFO.updates.slice(1).map((update) => (
                <Box key={update.version}>
                  <Divider borderColor="gray.600" mb={2} />
                  <HStack mb={2}>
                    <Badge colorScheme="gray" size="sm">
                      v{update.version}
                    </Badge>
                    <Text fontSize="xs" color="gray.500">
                      {update.date}
                    </Text>
                  </HStack>
                  
                  <VStack align="start" spacing={1}>
                    {update.changes.map((change, index) => (
                      <Text key={index} fontSize="sm" color="gray.400">
                        {change}
                      </Text>
                    ))}
                  </VStack>
                </Box>
              ))}

              {/* Mark as Seen Button */}
              {isNewUpdate && (
                <Button
                  size="sm"
                  colorScheme="blue"
                  variant="outline"
                  onClick={handleMarkAsSeen}
                  w="full"
                  mt={2}
                >
                  Mark as Seen
                </Button>
              )}
            </VStack>
          </CardBody>
        </Card>
      </Collapse>
    </Box>
  );
};

export default UpdateNotification; 