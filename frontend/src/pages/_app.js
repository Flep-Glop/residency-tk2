import { ChakraProvider, extendTheme } from '@chakra-ui/react';

// Extend the theme to include custom colors, fonts, etc
const theme = extendTheme({
  colors: {
    brand: {
      50: '#f5f8fa',
      100: '#e1eaef',
      200: '#c7d9e3',
      300: '#a9c7d6',
      400: '#8db3c9',
      500: '#6d99b0',  // Primary color - soft blue
      600: '#5c899f',
      700: '#4d7689',
      800: '#3e6372',
      900: '#2f4f5c',
    },
    gray: {
      50: '#f7f9fa',
      100: '#edf1f5',
      200: '#e2e8ed',
      300: '#d0dae3',
      400: '#b8c8d4',
      500: '#94a9b8',
      600: '#7b919f',
      700: '#657886',
      800: '#4a5a68',
      900: '#384551',
    },
  },
  fonts: {
    heading: 'Inter, system-ui, sans-serif',
    body: 'Inter, system-ui, sans-serif',
  },
  config: {
    initialColorMode: 'light',
    useSystemColorMode: false,
  },
  styles: {
    global: {
      body: {
        bg: 'gray.50',
        color: 'gray.800',
      },
      // Fix dropdown option visibility in dark theme
      'select option': {
        backgroundColor: '#2D3748 !important', // gray.700
        color: 'white !important',
        padding: '8px !important',
      },
      // Ensure select elements maintain dark styling
      'select[data-theme="dark"]': {
        backgroundColor: '#2D3748 !important',
        color: 'white !important',
        borderColor: '#4A5568 !important',
      },
      'select[data-theme="dark"] option': {
        backgroundColor: '#2D3748 !important',
        color: 'white !important',
      },
      // Alternative approach for better browser compatibility
      '.chakra-select__wrapper select option': {
        backgroundColor: '#2D3748 !important',
        color: 'white !important',
      },
    },
  },
});

function MyApp({ Component, pageProps }) {
  return (
    <ChakraProvider theme={theme}>
      <Component {...pageProps} />
    </ChakraProvider>
  );
}

export default MyApp; 