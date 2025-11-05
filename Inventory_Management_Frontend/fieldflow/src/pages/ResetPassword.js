import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Container, Paper, Box, Typography, TextField, Button, Alert, CircularProgress, InputAdornment, IconButton } from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import Logo from '../components/Logo';
import api from '../api/axiosInstance';

const ResetPassword = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  useEffect(() => {
    // token may be passed via navigation state
    const st = location.state;
    if (st && st.token) setToken(st.token);
    // If token also provided via query param, consider reading it (optional)
    const params = new URLSearchParams(location.search);
    const qtoken = params.get('token');
    if (!token && qtoken) setToken(qtoken);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location]);

  const handleReset = async (e) => {
    e.preventDefault();
    setError('');
    setInfo('');
    if (!token) {
      setError('Please provide the reset token.');
      return;
    }
    if (!newPassword || !confirmPassword) {
      setError('Please enter and confirm your new password.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      const resp = await api.post('/api/auth/reset-password', { token, newPassword });
      setInfo(resp?.data?.message || 'Password has been reset successfully!');
      setTimeout(() => navigate('/login'), 1200);
    } catch (err) {
      const status = err?.response?.status;
      const msg = err?.response?.data?.message || err.message || 'Failed to reset password.';
      if (status === 400) setError(msg || 'Reset token has expired.');
      else if (status === 404) setError('Invalid reset token');
      else setError(msg);
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
            <Typography variant="h6" sx={{ mt: 1, mb: 2 }}>Reset Password</Typography>
            {error && <Alert severity="error" sx={{ width: '100%', mb: 2 }}>{error}</Alert>}
            {info && <Alert severity="info" sx={{ width: '100%', mb: 2 }}>{info}</Alert>}
            <Box component="form" onSubmit={handleReset} sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField label="Reset Token" value={token} onChange={(e) => setToken(e.target.value)} fullWidth />
              <TextField
                label="New password"
                type={showPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                fullWidth
              />
              <TextField label="Confirm password" type={showPassword ? 'text' : 'password'} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} fullWidth />
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button variant="contained" type="submit" disabled={loading} fullWidth>
                  {loading ? <CircularProgress size={20} /> : 'Reset Password'}
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

export default ResetPassword;
