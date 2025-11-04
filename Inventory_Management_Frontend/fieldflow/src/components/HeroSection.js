import React from 'react';
import { styled, darken, alpha } from '@mui/material/styles';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';

// --- Styled Components ---
// Theme-aware gradient background for the hero
const HeroBackground = styled(Box)(({ theme }) => {
  const isLight = theme.palette.mode === 'light';
  const lightBg = 'linear-gradient(120deg, #f0f9ff 0%, #e0f2fe 100%)';
  // Dark gradient uses primary dark tones blended with background
  const darkBg = `linear-gradient(120deg, rgba(2,6,23,0.6) 0%, rgba(4,10,20,0.8) 100%)`;

  return {
    background: isLight ? lightBg : darkBg,
    position: 'relative',
    overflow: 'hidden',
    padding: '60px 0',
    [theme.breakpoints.up('sm')]: {
      padding: '120px 0',
    },
    [theme.breakpoints.up('md')]: {
      padding: '160px 0',
    },
  };
});

// Decorative blur element — adapt its color/opacity to the theme
const HeroBlur = styled('div')(({ theme }) => {
  const isLight = theme.palette.mode === 'light';
  const primary = theme.palette.primary.main;
  const blurColorStart = isLight ? alpha(theme.palette.secondary.main, 0.25) : alpha(darken(primary, 0.4), 0.18);
  const blurColorEnd = isLight ? alpha(theme.palette.primary.main, 0.25) : alpha(darken(primary, 0.6), 0.14);

  return ({
    position: 'absolute',
    insetX: 0,
    top: '-40rem',
    zIndex: 0,
    transform: 'translateZ(0)',
    overflow: 'hidden',
    filter: 'blur(100px)',
    '&::before': {
      content: '""',
      position: 'relative',
      display: 'block',
      left: 'calc(50% - 11rem)',
      aspectRatio: '1155 / 678',
      width: '36.125rem',
      transform: 'translateX(-50%) rotate(30deg)',
      background: `linear-gradient(to top right, ${blurColorStart}, ${blurColorEnd})`,
      opacity: isLight ? 0.2 : 0.28,
      [theme.breakpoints.up('sm')]: {
        left: 'calc(50% - 30rem)',
        width: '72.1875rem',
      },
    },
  });
});

const HeroSection = () => (
  <HeroBackground>
    <HeroBlur aria-hidden="true" />
    <Container 
      maxWidth="md" 
      sx={{ 
        position: 'relative', 
        zIndex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center'
      }}
    >
      <Typography 
        variant="h2" 
        component="h1" 
        sx={{ 
          fontSize: { xs: '2.5rem', sm: '3.75rem' },
          fontWeight: 800,
          color: 'text.primary'
        }}
      >
        From Core to Customer
      </Typography>
      <Typography 
        variant="h2"
        component="h2" 
        color="primary"
        sx={{ 
          fontSize: { xs: '2.5rem', sm: '3.75rem' },
          fontWeight: 800,
          mt: 1
        }}
      >
        Master Your Fiber Network
      </Typography>
      <Typography 
        variant="h6" 
        color="text.secondary" 
        sx={{ mt: 3, maxWidth: '600px', fontWeight: 400 }}
      >
        FieldFlow is the all-in-one platform for broadband providers to manage inventory, visualize topology, and streamline field deployments—all in real time.
      </Typography>
      <Stack 
        direction={{ xs: 'column', sm: 'row' }} 
        spacing={2} 
        justifyContent="center" 
        sx={{ mt: 5 }}
      >
        
        <Button variant="text" size="large" href="#features">
          Learn more &rarr;
        </Button>
      </Stack>
    </Container>
  </HeroBackground>
);

export default HeroSection;
