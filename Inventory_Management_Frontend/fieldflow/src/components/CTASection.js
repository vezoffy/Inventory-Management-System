import React from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import { useTheme } from '@mui/material/styles';
import { Link as RouterLink } from 'react-router-dom';

const CTASection = () => {
  const theme = useTheme();
  const isLight = theme.palette.mode === 'light';

  // Modern tech palette: deep teal -> vibrant cyan, with electric blue glow
  const CTA_DEEP_TEAL = '#033d3a'; // deep teal
  const CTA_VIBRANT_CYAN = '#06b6d4'; // vibrant cyan
  const CTA_ELECTRIC_BLUE = '#00bfff'; // electric blue for glow/highlights

  // Slightly adjust for dark mode to keep contrast
  const bg = isLight
    ? `linear-gradient(90deg, ${CTA_DEEP_TEAL} 0%, ${CTA_VIBRANT_CYAN} 100%)`
    : `linear-gradient(90deg, ${CTA_DEEP_TEAL} 10%, ${CTA_VIBRANT_CYAN} 90%)`;

  return (
    <Box sx={{ py: { xs: 8, md: 12 } }}>
      <Container maxWidth="lg">
        <Box sx={{
          background: bg,
          color: theme.palette.primary.contrastText,
          p: { xs: 4, sm: 8, md: 10 },
          borderRadius: 4,
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: isLight ? '0 20px 40px -10px rgba(0,0,0,0.12)' : '0 10px 30px -10px rgba(2,6,23,0.6)'
        }}>
        {/* Decorative background element */}
        <Box
          component="svg"
          viewBox="0 0 1024 1024"
          sx={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            width: '64rem',
            height: '64rem',
            transform: 'translate(-50%, -50%)',
            maskImage: 'radial-gradient(closest-side, white, transparent)',
            zIndex: 0,
            opacity: isLight ? 0.65 : 0.45,
          }}
          aria-hidden="true"
        >
          <circle cx="512" cy="512" r="512" fill="url(#cta-gradient)" fillOpacity="0.9" />
          <defs>
            <radialGradient id="cta-gradient">
              <stop stopColor={CTA_VIBRANT_CYAN} />
              <stop offset="1" stopColor={CTA_ELECTRIC_BLUE} />
            </radialGradient>
          </defs>
        </Box>
        
        {/* Content */}
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Typography
            variant="h3"
            component="h2"
            sx={{ fontWeight: 700 }}
          >
            Ready to streamline your network?
          </Typography>
          <Typography variant="h6" sx={{ mt: 3, maxWidth: '600px', mx: 'auto', fontWeight: 400, color: theme.palette.primary.contrastText, opacity: 0.95 }}>
            See FieldFlow in action. Stop managing your network and start mastering it.
          </Typography>
          <Stack 
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2} 
            justifyContent="center" 
            sx={{ mt: 5 }}
          >
            
            <Button
              variant="contained"
              component={RouterLink}
              to="/login"
              size="large"
              sx={{
                background: CTA_ELECTRIC_BLUE,
                color: '#ffffff',
                fontWeight: 700,
                px: 4,
                boxShadow: `0 6px 30px -10px ${CTA_ELECTRIC_BLUE}66, 0 2px 8px -2px ${CTA_VIBRANT_CYAN}44`,
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: `0 10px 40px -10px ${CTA_ELECTRIC_BLUE}88, 0 4px 12px -4px ${CTA_VIBRANT_CYAN}55`,
                  background: CTA_ELECTRIC_BLUE,
                },
              }}
            >
              Login
            </Button>
          </Stack>
        </Box>
      </Box>
    </Container>
  </Box>
  );
};

export default CTASection;
