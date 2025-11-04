
import { createTheme } from '@mui/material/styles';

// Base tokens shared between light and dark
const base = {
  palette: {
    primary: {
      main: '#0891b2', // FieldFlow cyan
    },
    secondary: {
      main: '#0ea5e9',
    },
  },
  typography: {
    fontFamily: '"Inter", "Helvetica", "Arial", sans-serif',
    h1: { fontWeight: 800 },
    h2: { fontWeight: 700 },
    h3: { fontWeight: 700 },
    h4: { fontWeight: 700 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 600,
          padding: '10px 20px',
        },
        contained: {
          boxShadow: '0 4px 14px 0 rgba(8, 145, 178, 0.3)',
          '&:hover': {
            boxShadow: '0 6px 20px 0 rgba(8, 145, 178, 0.4)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
  },
};

export function getTheme(mode = 'light') {
  const isLight = mode === 'light';

  const palette = {
    mode,
    primary: base.palette.primary,
    secondary: base.palette.secondary,
    background: isLight
      ? { default: '#f8fafc', paper: '#ffffff' }
      : { default: '#0f1720', paper: '#0b1220' },
    text: isLight ? { primary: '#0f1720' } : { primary: '#e6eef6' },
  };

  return createTheme({
    ...base,
    palette,
  });
}

// For backward compatibility export a default light theme
export const fieldFlowTheme = getTheme('light');
