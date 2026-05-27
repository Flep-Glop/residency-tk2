import React from 'react';
import { Box, Flex, Heading, Button, Textarea, useToast } from '@chakra-ui/react';

const WriteupPanel = ({ writeup, minH = '400px' }) => {
  const toast = useToast();

  const copyToClipboard = () => {
    navigator.clipboard.writeText(writeup);
    toast({
      title: 'Copied to clipboard',
      status: 'success',
      duration: 2000,
      isClosable: true,
    });
  };

  if (!writeup) return null;

  return (
    <Box p={4} borderWidth={1} borderRadius="md" bg="gray.800" borderColor="gray.600" boxShadow="md">
      <Flex justify="space-between" align="center" mb={3}>
        <Heading size="sm" color="white">Generated Write-up</Heading>
        <Button size="sm" colorScheme="green" onClick={copyToClipboard}>
          Copy to Clipboard
        </Button>
      </Flex>
      <Textarea
        value={writeup}
        readOnly
        minH={minH}
        resize="vertical"
        bg="gray.700"
        color="white"
        borderColor="gray.600"
        fontSize="sm"
        lineHeight="1"
        _hover={{ borderColor: 'gray.500' }}
        sx={{ fontFamily: '"Aseprite", monospace !important' }}
      />
    </Box>
  );
};

export default WriteupPanel;
