import React, { useEffect, useState, useContext } from 'react';
import { Container, Paper, Box, Typography, Table, TableHead, TableRow, TableCell, TableBody, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, CircularProgress, Snackbar, Alert } from '@mui/material';
import Header from '../components/Header';
import Autocomplete from '@mui/material/Autocomplete';
import deploymentService from '../services/deploymentService';
import customerService from '../services/customerService';
import { AuthContext } from '../context/AuthContext';

const DeploymentTasks = () => {
  const { user } = useContext(AuthContext);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [customersMap, setCustomersMap] = useState({});
  const [technicians, setTechnicians] = useState([]);
  const [selectedTech, setSelectedTech] = useState(null);
  const [techLoading, setTechLoading] = useState(false);
  const [completeDialogOpen, setCompleteDialogOpen] = useState(false);
  const [completeTarget, setCompleteTarget] = useState(null);
  const [notes, setNotes] = useState('');
  const [snack, setSnack] = useState({ open: false, message: '', severity: 'info' });

  useEffect(() => {
    loadCustomers();
    if (user?.roles?.includes('ROLE_ADMIN')) loadTechnicians();
    loadTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  useEffect(() => {
    // reload tasks when selected technician changes
    if (user?.roles?.includes('ROLE_ADMIN')) {
      loadTasks();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTech]);

  const loadCustomers = async () => {
    try {
      const list = await customerService.getAllCustomers();
      const map = {};
      (list || []).forEach(c => { map[c.id] = c.name || `${c.id}`; });
      setCustomersMap(map);
    } catch (e) {
      // ignore mapping failures; we'll show id fallback
    }
  };

  const loadTasks = async () => {
    setLoading(true);
    try {
      // Determine techId from selectedTech (admin may filter). If technician user, backend will scope by token.
      const isAdmin = user?.roles?.includes('ROLE_ADMIN');
      const techId = isAdmin ? (selectedTech ? selectedTech.id : undefined) : undefined;
      const list = await deploymentService.getTasks(techId);
      setTasks(list || []);
    } catch (e) {
      setSnack({ open: true, message: e?.response?.data?.message || 'Failed to load tasks', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const loadTechnicians = async () => {
    setTechLoading(true);
    try {
      const list = await deploymentService.getTechnicians();
      const opts = (list || []).map(t => ({ id: t.id, label: `${t.id} — ${t.name}`, name: t.name }));
      setTechnicians(opts);
    } catch (e) {
      setSnack({ open: true, message: 'Failed to load technicians', severity: 'warning' });
    } finally {
      setTechLoading(false);
    }
  };

  const openComplete = (task) => {
    setCompleteTarget(task);
    setNotes('');
    setCompleteDialogOpen(true);
  };

  const doComplete = async () => {
    if (!completeTarget) return;
    try {
      await deploymentService.completeTask(completeTarget.id, { notes });
      setSnack({ open: true, message: 'Task marked complete', severity: 'success' });
      setCompleteDialogOpen(false);
      setCompleteTarget(null);
      await loadTasks();
    } catch (e) {
      setSnack({ open: true, message: e?.response?.data?.message || 'Failed to complete task', severity: 'error' });
    }
  };

  return (
    <>
      <Header />
      <Container sx={{ pt: 12, pb: 6 }}>
        <Paper sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h5">Deployment Tasks</Typography>
            {/* admin: technician filter */}
            {user?.roles?.includes('ROLE_ADMIN') && (
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <Autocomplete
                  options={technicians}
                  getOptionLabel={(o) => o.label || ''}
                  value={selectedTech}
                  onChange={(e, v) => { setSelectedTech(v); }}
                  renderInput={(params) => <TextField {...params} label="Filter by technician" variant="outlined" size="small" />}
                  sx={{ minWidth: 240 }}
                  clearOnEscape
                />
                <Button onClick={() => { setSelectedTech(null); loadTasks(); }}>Refresh</Button>
              </Box>
            )}
          </Box>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>
          ) : (
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Customer</TableCell>
                  <TableCell>Technician ID</TableCell>
                  <TableCell>Scheduled Date</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Notes</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {tasks.map(t => (
                  <TableRow key={t.id}>
                    <TableCell>{t.id}</TableCell>
                    <TableCell>{customersMap[t.customerId] || t.customerId}</TableCell>
                    <TableCell>{t.technicianId || '-'}</TableCell>
                    <TableCell>{t.scheduledDate || '-'}</TableCell>
                    <TableCell>{t.status}</TableCell>
                    <TableCell>{t.notes || '-'}</TableCell>
                    <TableCell align="right">
                      {(t.status !== 'COMPLETED') && (user?.roles?.includes('ROLE_TECHNICIAN') || user?.roles?.includes('ROLE_ADMIN')) && (
                        <Button variant="contained" size="small" onClick={() => openComplete(t)}>Complete</Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          <Dialog open={completeDialogOpen} onClose={() => setCompleteDialogOpen(false)} maxWidth="sm" fullWidth>
            <DialogTitle>Complete Task</DialogTitle>
            <DialogContent>
              <Typography sx={{ mb: 2 }}>Task ID: {completeTarget?.id}</Typography>
              <TextField label="Notes" value={notes} onChange={(e) => setNotes(e.target.value)} multiline rows={4} fullWidth />
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setCompleteDialogOpen(false)}>Cancel</Button>
              <Button variant="contained" onClick={doComplete}>Complete</Button>
            </DialogActions>
          </Dialog>

          <Snackbar open={snack.open} autoHideDuration={6000} onClose={() => setSnack(s => ({ ...s, open: false }))}>
            <Alert severity={snack.severity} onClose={() => setSnack(s => ({ ...s, open: false }))}>{snack.message}</Alert>
          </Snackbar>
        </Paper>
      </Container>
    </>
  );
};

export default DeploymentTasks;
