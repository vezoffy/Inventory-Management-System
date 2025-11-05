import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Paper, Box, Typography, TextField, Button, Alert, CircularProgress } from '@mui/material';
import Logo from '../components/Logo';
import api from '../api/axiosInstance';

const ForgotPassword = () => {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const navigate = useNavigate();

  const handleRequest = async (e) => {
    e.preventDefault();
    setError('');
    setInfo('');
    if (!username) {
      setError('Please enter your username.');
      return;
    }
    setLoading(true);
    try {
      const resp = await api.post('/api/auth/forgot-password', { username });
      const token = resp?.data?.resetToken;
      // If backend returns token (dev mode), navigate to Reset page with token filled.
      if (token) {
        navigate('/reset-password', { state: { token } });
      } else {
        // Production-like behaviour: token emailed. Still navigate to reset so user can paste token if they have it.
        setInfo('If an account with that username exists, a reset token has been generated. Check email for the token (or paste it on the next screen).');
        // wait brief moment to show info, then navigate without token
        setTimeout(() => navigate('/reset-password'), 1000);
      }
    } catch (err) {
      // do not reveal existence of usernames; show generic message and navigate to reset page
      setInfo('If an account with that username exists, a reset token has been generated. Check email for the token (or paste it on the next screen).');
      setTimeout(() => navigate('/reset-password'), 800);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'background.default' }}>
      <Container maxWidth="xs">
        <Paper sx={{ p: 4 }} elevation={6}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Logo height={56} />
            <Typography variant="h6" sx={{ mt: 1, mb: 2 }}>Forgot Password</Typography>
            {error && <Alert severity="error" sx={{ width: '100%', mb: 2 }}>{error}</Alert>}
            {info && <Alert severity="info" sx={{ width: '100%', mb: 2 }}>{info}</Alert>}
            <Box component="form" onSubmit={handleRequest} sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField label="Username" value={username} onChange={(e) => setUsername(e.target.value)} fullWidth />
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button type="submit" variant="contained" disabled={loading} fullWidth>
                  {loading ? <CircularProgress size={20} /> : 'Request Reset Token'}
                </Button>
                <Button variant="outlined" onClick={() => navigate('/login')} disabled={loading}>Back</Button>
              </Box>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default ForgotPassword;
