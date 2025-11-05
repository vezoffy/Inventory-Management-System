import React, { useState, useContext, useEffect, useRef } from 'react';
import { Container, Paper, Box, Typography, TextField, Button, CircularProgress, Snackbar, Alert } from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';
import Header from '../components/Header';
import deploymentService from '../services/deploymentService';
import customerService from '../services/customerService';
import { AuthContext } from '../context/AuthContext';

const DeactivateCustomer = () => {
  const { user } = useContext(AuthContext);
  const [options, setOptions] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [selected, setSelected] = useState(null);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [snack, setSnack] = useState({ open: false, message: '', severity: 'info' });
  const debounceRef = useRef(null);

  useEffect(() => {
    // initial no-op
    return () => clearTimeout(debounceRef.current);
  }, []);

  const fetchOptions = async (q) => {
    setSearching(true);
    try {
      // Use customerService.searchCustomers with name or query param to get suggestions
      const params = q ? { name: q } : {};
      const list = await customerService.searchCustomers(params);
      const opts = (list || []).map(c => ({ id: c.id, label: `${c.id} — ${c.name}`, name: c.name }));
      setOptions(opts);
    } catch (e) {
      // show nothing on error
      setOptions([]);
    } finally {
      setSearching(false);
    }
  };

  useEffect(() => {
    // debounce search
    clearTimeout(debounceRef.current);
    if (!inputValue) {
      setOptions([]);
      return;
    }
    debounceRef.current = setTimeout(() => fetchOptions(inputValue), 300);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputValue]);

  const handleSubmit = async () => {
    if (!selected || !selected.id) return setSnack({ open: true, message: 'Please select a customer', severity: 'warning' });
    if (!reason) return setSnack({ open: true, message: 'Please provide a reason', severity: 'warning' });
    setLoading(true);
    try {
      await deploymentService.deactivateCustomer(selected.id, { reason });
      setSnack({ open: true, message: 'Deactivation Done', severity: 'success' });
      setSelected(null);
      setInputValue('');
      setReason('');
    } catch (e) {
      setSnack({ open: true, message: e?.response?.data?.message || 'Failed to start deactivation', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  if (!user || !(user.roles?.includes('ROLE_ADMIN') || user.roles?.includes('ROLE_SUPPORT_AGENT'))) {
    return (
      <>
        <Header />
        <Container sx={{ pt: 12 }}>
          <Typography variant="h6">Access denied. ADMIN or SUPPORT_AGENT required.</Typography>
        </Container>
      </>
    );
  }

  return (
    <>
      <Header />
      <Container sx={{ pt: 12, pb: 6 }}>
        <Paper sx={{ p: 3, maxWidth: 800, margin: '0 auto' }}>
          <Typography variant="h5" sx={{ mb: 2 }}>Deactivate Customer</Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Autocomplete
              options={options}
              getOptionLabel={(o) => o.label || ''}
              value={selected}
              onChange={(e, v) => setSelected(v)}
              inputValue={inputValue}
              onInputChange={(e, v) => setInputValue(v)}
              renderInput={(params) => (
                <TextField {...params} label="Customer (type id or name)" InputProps={{ ...params.InputProps, endAdornment: (
                  <>
                    {searching ? <CircularProgress color="inherit" size={20} /> : null}
                    {params.InputProps.endAdornment}
                  </>
                ) }} />
              )}
              freeSolo={false}
              fullWidth
            />

            <TextField label="Reason" multiline minRows={3} value={reason} onChange={(e) => setReason(e.target.value)} fullWidth />

            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button variant="outlined" onClick={() => { setSelected(null); setInputValue(''); setReason(''); }}>Reset</Button>
              <Button variant="contained" color="error" onClick={handleSubmit} disabled={loading}>{loading ? <CircularProgress size={20} /> : 'Deactivate'}</Button>
            </Box>
          </Box>

          <Snackbar open={snack.open} autoHideDuration={6000} onClose={() => setSnack(s => ({ ...s, open: false }))}>
            <Alert severity={snack.severity} onClose={() => setSnack(s => ({ ...s, open: false }))}>{snack.message}</Alert>
          </Snackbar>
        </Paper>
      </Container>
    </>
  );
};

export default DeactivateCustomer;
