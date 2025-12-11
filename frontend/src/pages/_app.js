import { ChakraProvider, extendTheme } from '@chakra-ui/react';

// Custom color palette - all colors from provided palette
const theme = extendTheme({
  colors: {
    brand: {
      50: '#a4dddb',
      100: '#73bed3',
      200: '#4f8fba',
      300: '#3c5e8b',
      400: '#253a5e',
      500: '#172038',  // Primary color - dark blue
      600: '#172038',
      700: '#10141f',
      800: '#090a14',
      900: '#090a14',
    },
    gray: {
      50: '#ebede9',
      100: '#c7cfcc',
      200: '#a8b5b2',
      300: '#819796',
      400: '#577277',
      500: '#394a50',
      600: '#202e37',
      700: '#151d28',
      800: '#10141f',
      900: '#090a14',
    },
    blue: {
      50: '#a4dddb',
      100: '#73bed3',
      200: '#4f8fba',
      300: '#3c5e8b',
      400: '#253a5e',
      500: '#172038',
      600: '#172038',
      700: '#151d28',
      800: '#10141f',
      900: '#090a14',
    },
    purple: {
      50: '#df84a5',
      100: '#c65197',
      200: '#a23e8c',
      300: '#7a367b',
      400: '#402751',
      500: '#1e1d39',
      600: '#1e1d39',
      700: '#151d28',
      800: '#10141f',
      900: '#090a14',
    },
    green: {
      50: '#d0da91',
      100: '#a8ca58',
      200: '#75a743',
      300: '#468232',
      400: '#25562e',
      500: '#19332d',
      600: '#19332d',
      700: '#151d28',
      800: '#10141f',
      900: '#090a14',
    },
    red: {
      50: '#da863e',
      100: '#cf573c',
      200: '#a53030',
      300: '#752438',
      400: '#411d31',
      500: '#411d31',
      600: '#241527',
      700: '#151d28',
      800: '#10141f',
      900: '#090a14',
    },
    yellow: {
      50: '#e8c170',
      100: '#de9e41',
      200: '#be772b',
      300: '#884b2b',
      400: '#602c2c',
      500: '#341c27',
      600: '#341c27',
      700: '#151d28',
      800: '#10141f',
      900: '#090a14',
    },
    orange: {
      50: '#f7cfb0',
      100: '#edaf84',
      200: '#e69867',
      300: '#c97038',
      400: '#9c4d2c',
      500: '#62291a',
      600: '#62291a',
      700: '#151d28',
      800: '#10141f',
      900: '#090a14',
    },
  },
  fonts: {
    heading: '"Aseprite", monospace',
    body: '"Aseprite", monospace',
  },
  fontSizes: {
    xs: '24px',
    sm: '28px',
    md: '32px',
    lg: '40px',
    xl: '48px',
    '2xl': '56px',
    '3xl': '72px',
    '4xl': '96px',
    '5xl': '120px',
    '6xl': '160px',
  },
  config: {
    initialColorMode: 'dark',
    useSystemColorMode: false,
  },
  styles: {
    global: {
      // Load the Aseprite pixel font
      '@font-face': {
        fontFamily: 'Aseprite',
        src: 'url("/fonts/AsepriteFont.ttf") format("truetype")',
        fontWeight: 'normal',
        fontStyle: 'normal',
        fontDisplay: 'swap',
      },
      body: {
        bg: '#090a14',
        color: '#ebede9',
        fontFamily: '"Aseprite", monospace',
        fontSize: '32px',
        lineHeight: '1.0',
      },
      // Custom scrollbar styling
      '*::-webkit-scrollbar': {
        width: '0px',
        height: '0px',
      },
      '*::-webkit-scrollbar-track': {
        background: 'transparent',
      },
      '*::-webkit-scrollbar-thumb': {
        background: 'transparent',
      },
      // Universal font override
      '*, *::before, *::after': {
        scrollbarWidth: 'none', // Firefox
        msOverflowStyle: 'none', // IE and Edge
        fontWeight: 'normal !important', // Pixel font looks better uniform
        fontFamily: '"Aseprite", monospace !important',
      },
      // HTML and root elements
      'html, body': {
        fontFamily: '"Aseprite", monospace !important',
      },
      // Fix dropdown option visibility in dark theme
      'select': {
        backgroundColor: '#151d28 !important',
        color: '#ebede9 !important',
        fontFamily: '"Aseprite", monospace !important',
        fontSize: '24px !important',
      },
      'select option, option': {
        backgroundColor: '#151d28 !important',
        color: '#ebede9 !important',
        padding: '8px 12px !important',
        fontSize: '20px !important',
      },
      // Ensure select elements maintain dark styling
      'select[data-theme="dark"]': {
        backgroundColor: '#151d28 !important',
        color: '#ebede9 !important',
        borderColor: '#394a50 !important',
        fontFamily: '"Aseprite", monospace !important',
        fontSize: '24px !important',
      },
      'select[data-theme="dark"] option': {
        backgroundColor: '#151d28 !important',
        color: '#ebede9 !important',
        fontFamily: '"Aseprite", monospace !important',
        fontSize: '20px !important',
      },
      // Alternative approach for better browser compatibility
      '.chakra-select__wrapper select, .chakra-select__wrapper select option': {
        backgroundColor: '#151d28 !important',
        color: '#ebede9 !important',
        fontFamily: '"Aseprite", monospace !important',
        fontSize: '24px !important',
      },
      // Chakra Select component overrides
      '.chakra-select': {
        fontSize: '24px !important',
        fontFamily: '"Aseprite", monospace !important',
      },
      // Ensure textarea and output areas use Aseprite font
      'textarea, pre, code, .chakra-textarea, .chakra-textarea__wrapper textarea': {
        fontFamily: '"Aseprite", monospace !important',
        fontSize: '24px !important',
      },
      // Input elements
      'input, button, select, textarea': {
        fontFamily: '"Aseprite", monospace !important',
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