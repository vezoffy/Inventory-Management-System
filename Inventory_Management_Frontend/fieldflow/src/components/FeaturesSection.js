import React from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Avatar from '@mui/material/Avatar';
import DnsIcon from '@mui/icons-material/Dns'; // Icon for Inventory
import AccountTreeIcon from '@mui/icons-material/AccountTree'; // Icon for Topology
import ChecklistIcon from '@mui/icons-material/Checklist'; // Icon for Workflows

const FeaturesSection = () => (
  <Box id="features" sx={{ py: { xs: 8, md: 12 } }}>
    <Container maxWidth="lg">
      <Box sx={{ maxWidth: '700px', mx: 'auto', textAlign: 'center', mb: 8 }}>
        <Typography variant="h6" color="primary.main" sx={{ fontWeight: 600 }}>
          Total Control
        </Typography>
        <Typography 
          variant="h3" 
          component="h2" 
          sx={{ mt: 1, color: 'text.primary' }}
        >
          Everything you need to run your network
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
          Stop juggling spreadsheets and disconnected tools. FieldFlow unifies your entire operation, from the warehouse shelf to the customer's living room.
        </Typography>
      </Box>

      <Grid container spacing={4}>
        
        {/* Feature 1 */}
        <Grid item xs={12} md={4}>
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56 }}>
                <DnsIcon fontSize="large" />
              </Avatar>
              <Typography variant="h5" component="dt">
                Total Inventory Control
              </Typography>
            </Box>
            <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
              Track every asset's lifecycle (ONTs, routers, splitters, FDHs) from 'Available' to 'Assigned' or 'Faulty'. Know exactly what you have and where it is.
            </Typography>
          </Box>
        </Grid>
        
        {/* Feature 2 */}
        <Grid item xs={12} md={4}>
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56 }}>
                <AccountTreeIcon fontSize="large" />
              </Avatar>
              <Typography variant="h5" component="dt">
                Instant Topology Visualization
              </Typography>
            </Box>
            <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
              Instantly see any customer's full network path: from the Headend, through the FDH and Splitter, right to their ONT. Diagnose issues in seconds.
            </Typography>
          </Box>
        </Grid>

        {/* Feature 3 */}
        <Grid item xs={12} md={4}>
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56 }}>
                <ChecklistIcon fontSize="large" />
              </Avatar>
              <Typography variant="h5" component="dt">
                Streamlined Deployment Workflows
              </Typography>
            </Box>
            <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
              Connect your planners and field technicians. Onboard a customer, assign assets, and automatically generate a trackable deployment task for your field team.
            </Typography>
          </Box>
        </Grid>

      </Grid>
    </Container>
  </Box>
);

export default FeaturesSection;
