import React, { createContext, useMemo, useState, useEffect } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { GlobalStyles } from '@mui/material';
import { getTheme } from '../theme/theme';

export const ColorModeContext = createContext({ mode: 'light', toggleColorMode: () => {} });

export const ColorModeProvider = ({ children }) => {
  const [mode, setMode] = useState(() => {
    try {
      return localStorage.getItem('color-mode') || 'light';
    } catch (e) {
      return 'light';
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('color-mode', mode);
    } catch (e) {
      // ignore
    }
  }, [mode]);

  const colorMode = useMemo(
    () => ({
      mode,
      toggleColorMode: () => setMode((m) => (m === 'light' ? 'dark' : 'light')),
    }),
    [mode]
  );

  const theme = useMemo(() => getTheme(mode), [mode]);

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <GlobalStyles
          styles={{
            'body, #root': {
              transition: 'background-color 300ms ease, color 300ms ease',
            },
            '.MuiPaper-root, .MuiAppBar-root, .MuiBox-root, .MuiContainer-root, .MuiToolbar-root': {
              transition: 'background-color 300ms ease, color 300ms ease, box-shadow 300ms ease',
            },
            '.MuiTypography-root, .MuiButton-root, .MuiMenuItem-root': {
              transition: 'color 300ms ease',
            },
            'img, svg': {
              transition: 'filter 300ms ease, opacity 300ms ease',
            },
          }}
        />
        {children}
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
};

export default ColorModeProvider;
