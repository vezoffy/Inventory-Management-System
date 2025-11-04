import React from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

const Footer = () => (
  <Box component="footer" sx={{ bgcolor: 'background.default', py: 6 }}>
    <Container 
      maxWidth="lg" 
      sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center' 
      }}
    >
      <img 
        src="https://placehold.co/120x30/f1f5f9/0891b2?text=FieldFlow&font=inter" 
        alt="FieldFlow Logo" 
        style={{ height: '30px', width: 'auto' }} 
      />
      <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
        &copy; {new Date().getFullYear()} FieldFlow. All rights reserved.
      </Typography>
    </Container>
  </Box>
);

export default Footer;
