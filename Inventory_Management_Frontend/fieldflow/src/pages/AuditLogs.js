import React, { useEffect, useState, useContext } from 'react';
import Header from '../components/Header';
import { AuthContext } from '../context/AuthContext';
import deploymentService from '../services/deploymentService';
import userService from '../services/userService';
import {
  Container, Paper, Box, Typography, TextField, Button, Table, TableHead, TableRow, TableCell, TableBody,
  CircularProgress, Snackbar, Alert
} from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';

const AuditLogs = () => {
  const { user } = useContext(AuthContext);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  // selectedUser: object from users list or free text string
  const [selectedUser, setSelectedUser] = useState(null);
  const [userInputValue, setUserInputValue] = useState('');
  const [filters, setFilters] = useState({ actionType: '', startTime: '', endTime: '' });
  const [snack, setSnack] = useState({ open: false, message: '', severity: 'info' });

  useEffect(() => {
    if (!user || !user.roles?.includes('ROLE_ADMIN')) return;
    loadUsers();
    // initial load
    fetchLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const loadUsers = async () => {
    try {
      const list = await userService.getAllUsers();
      setUsers(list || []);
    } catch (e) {
      // ignore
    }
  };

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = {};
      // resolve userId from selectedUser or typed input: send username (not numeric id)
      if (selectedUser) {
        if (typeof selectedUser === 'string') params.userId = selectedUser;
        else if (selectedUser.username) params.userId = selectedUser.username;
      } else if (userInputValue) {
        params.userId = userInputValue;
      }
      if (filters.actionType) params.actionType = filters.actionType;
      if (filters.startTime) params.startTime = new Date(filters.startTime).toISOString();
      if (filters.endTime) params.endTime = new Date(filters.endTime).toISOString();
      const list = await deploymentService.getAuditLogs(params);
      setLogs(list || []);
    } catch (e) {
      setSnack({ open: true, message: e?.response?.data?.message || 'Failed to load audit logs', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  if (!user || !user.roles?.includes('ROLE_ADMIN')) {
    return (
      <>
        <Header />
        <Container sx={{ pt: 12 }}>
          <Typography variant="h6">Access denied. Administrator role required.</Typography>
        </Container>
      </>
    );
  }

  return (
    <>
      <Header />
      <Container sx={{ pt: 12, pb: 6 }}>
        <Paper sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h5">Audit Logs</Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="outlined"
                onClick={() => {
                  setFilters({ actionType: '', startTime: '', endTime: '' });
                  setSelectedUser(null);
                  setUserInputValue('');
                  fetchLogs();
                }}
              >Clear</Button>
              <Button variant="contained" onClick={fetchLogs}>Search</Button>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
            <Autocomplete
              freeSolo
              options={users}
              getOptionLabel={(option) => (typeof option === 'string' ? option : `${option.id} — ${option.username}`)}
              value={selectedUser}
              onChange={(e, newVal) => setSelectedUser(newVal)}
              inputValue={userInputValue}
              onInputChange={(e, newInput) => setUserInputValue(newInput)}
              sx={{ minWidth: 240 }}
              renderInput={(params) => (
                <TextField {...params} label="User" />
              )}
            />

            <TextField
              label="Action Type"
              value={filters.actionType}
              onChange={(e) => setFilters(f => ({ ...f, actionType: e.target.value }))}
              sx={{ minWidth: 240 }}
            />

            <TextField
              label="Start Time"
              type="datetime-local"
              InputLabelProps={{ shrink: true }}
              value={filters.startTime}
              onChange={(e) => setFilters(f => ({ ...f, startTime: e.target.value }))}
            />

            <TextField
              label="End Time"
              type="datetime-local"
              InputLabelProps={{ shrink: true }}
              value={filters.endTime}
              onChange={(e) => setFilters(f => ({ ...f, endTime: e.target.value }))}
            />
          </Box>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>
          ) : (
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Action Type</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>User</TableCell>
                  <TableCell>Timestamp</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {logs.map(l => (
                  <TableRow key={l.id}>
                    <TableCell>{l.id}</TableCell>
                    <TableCell>{l.actionType}</TableCell>
                    <TableCell>{l.description}</TableCell>
                    <TableCell>{l.userId}</TableCell>
                    <TableCell>{l.timestamp}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          <Snackbar open={snack.open} autoHideDuration={6000} onClose={() => setSnack(s => ({ ...s, open: false }))}>
            <Alert severity={snack.severity} onClose={() => setSnack(s => ({ ...s, open: false }))}>{snack.message}</Alert>
          </Snackbar>
        </Paper>
      </Container>
    </>
  );
};

export default AuditLogs;
