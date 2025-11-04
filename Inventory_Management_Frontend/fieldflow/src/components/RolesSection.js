import React from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';

const RolesSection = () => (
  <Box sx={{ py: { xs: 8, md: 12 }, bgcolor: 'background.default' }}>
    <Container maxWidth="lg">
      <Box sx={{ maxWidth: '700px', mx: 'auto', textAlign: 'center', mb: 8 }}>
        <Typography variant="h6" color="primary.main" sx={{ fontWeight: 600 }}>
          Built for Your Team
        </Typography>
        <Typography 
          variant="h3" 
          component="h2" 
          sx={{ mt: 1, color: 'text.primary' }}
        >
          A single platform for every role
        </Typography>
      </Box>
      <Grid container spacing={3}>
        {[
          { title: "Network Planners", desc: "Assign new customers, manage splitter capacity, and view regional topology to plan network expansion." },
          { title: "Field Technicians", desc: "Receive deployment tasks, view installation details, update asset status, and log notes—all from the field." },
          { title: "Inventory Managers", desc: "Add new hardware, track device lifecycles, and manage stock levels across all warehouse locations." },
          { title: "Support & Admins", desc: "Quickly find customer network paths for troubleshooting and manage user roles and audit logs for full traceability." }
        ].map((role) => (
          <Grid item xs={12} sm={6} md={3} key={role.title}>
            <Paper elevation={2} sx={{ p: 3, height: '100%', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
              <Typography variant="h6" component="h3">{role.title}</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {role.desc}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Container>
  </Box>
);

export default RolesSection;
