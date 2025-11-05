import React, { useEffect, useState, useContext } from 'react';
import { Container, Paper, Box, Typography, Table, TableHead, TableRow, TableCell, TableBody, IconButton, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, Snackbar, Alert, CircularProgress } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import userService from '../services/userService';
import { AuthContext } from '../context/AuthContext';
import Header from '../components/Header';

const roles = [
  { value: 'ADMIN', label: 'Admin' },
  { value: 'PLANNER', label: 'Planner' },
  { value: 'SUPPORT_AGENT', label: 'Support Agent' },
  { value: 'TECHNICIAN', label: 'Technician' }
];

const UserManagement = () => {
  const { user } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null); // user object when editing
  const [form, setForm] = useState({ username: '', password: '', role: 'PLANNER', name: '', contact: '', region: '' });
  const [snack, setSnack] = useState({ open: false, message: '', severity: 'info' });
  const [deleting, setDeleting] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    if (!user || !user.roles?.includes('ROLE_ADMIN')) return;
    loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const list = await userService.getAllUsers();
      setUsers(list);
    } catch (e) {
      setSnack({ open: true, message: e?.response?.data?.message || 'Failed to load users', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditing(null);
    setForm({ username: '', password: '', role: 'PLANNER', name: '', contact: '', region: '' });
    setDialogOpen(true);
  };

  const openEdit = (u) => {
    setEditing(u);
    setForm({ username: u.username || '', password: '', role: (u.roles && u.roles[0]) ? u.roles[0].replace(/^ROLE_/, '') : 'PLANNER', name: '', contact: '', region: '' });
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    // Validation
    if (!form.username) return setSnack({ open: true, message: 'Username is required', severity: 'warning' });
    if (!editing && !form.password) return setSnack({ open: true, message: 'Password is required for new users', severity: 'warning' });

    try {
      if (!editing) {
        // create
        if (form.role === 'TECHNICIAN') {
          // create via deployments service
          const payload = { name: form.name || form.username, username: form.username, password: form.password, contact: form.contact, region: form.region };
          const resp = await userService.createTechnician(payload);
          setSnack({ open: true, message: `Technician ${resp.username} created`, severity: 'success' });
        } else {
          const payload = { username: form.username, password: form.password, role: form.role };
          await userService.registerUser(payload);
          setSnack({ open: true, message: 'User registered successfully', severity: 'success' });
        }
      } else {
        // update auth user
        const payload = { username: form.username, password: form.password || '', role: form.role };
        await userService.updateUser(editing.id, payload);
        setSnack({ open: true, message: 'User updated successfully', severity: 'success' });
      }
      setDialogOpen(false);
      await loadUsers();
    } catch (e) {
      const msg = e?.response?.data?.message || e?.message || 'Operation failed';
      setSnack({ open: true, message: msg, severity: 'error' });
    }
  };

  const openDeleteDialog = (id, username) => {
    setDeleteTarget({ id, username });
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const id = deleteTarget.id;
    setDeleting(id);
    try {
      await userService.deleteUser(id);
      setSnack({ open: true, message: 'User deleted', severity: 'success' });
      setDeleteDialogOpen(false);
      setDeleteTarget(null);
      await loadUsers();
    } catch (e) {
      setSnack({ open: true, message: e?.response?.data?.message || 'Failed to delete user', severity: 'error' });
    } finally {
      setDeleting(null);
    }
  };

  if (!user || !user.roles?.includes('ROLE_ADMIN')) {
    return (
      <Container sx={{ pt: 12 }}>
        <Typography variant="h6">Access denied. Administrator role required.</Typography>
      </Container>
    );
  }

  return (
    <>
      <Header />
      <Container sx={{ pt: 12, pb: 6 }}>
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5">User Management</Typography>
          <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>Create User</Button>
        </Box>

        {loading ? <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box> : (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Username</TableCell>
                <TableCell>Roles</TableCell>
                <TableCell>Last Login</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map(u => (
                <TableRow key={u.id}>
                  <TableCell>{u.id}</TableCell>
                  <TableCell>{u.username}</TableCell>
                  <TableCell>{(u.roles || []).join(', ')}</TableCell>
                  <TableCell>{u.lastLogin || '-'}</TableCell>
                  <TableCell align="right">
                    <IconButton size="small" onClick={() => openEdit(u)}><EditIcon /></IconButton>
                      <IconButton size="small" onClick={() => openDeleteDialog(u.id, u.username)} disabled={deleting === u.id}><DeleteIcon /></IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        {/* Create / Edit Dialog */}
        <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>{editing ? 'Edit User' : 'Create User'}</DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              <TextField label="Username" value={form.username} onChange={(e) => setForm(f => ({ ...f, username: e.target.value }))} fullWidth />
              {!editing && <TextField label="Password" type="password" value={form.password} onChange={(e) => setForm(f => ({ ...f, password: e.target.value }))} fullWidth />}
              <TextField select label="Role" value={form.role} onChange={(e) => setForm(f => ({ ...f, role: e.target.value }))} fullWidth>
                {roles.map(r => <MenuItem key={r.value} value={r.value}>{r.label}</MenuItem>)}
              </TextField>

              {/* Technician-only fields shown when creating a technician */}
              {form.role === 'TECHNICIAN' && (
                <>
                  <TextField label="Full name" value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} fullWidth />
                  <TextField label="Contact" value={form.contact} onChange={(e) => setForm(f => ({ ...f, contact: e.target.value }))} fullWidth />
                  <TextField label="Region" value={form.region} onChange={(e) => setForm(f => ({ ...f, region: e.target.value }))} fullWidth />
                </>
              )}
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button variant="contained" onClick={handleSubmit}>{editing ? 'Save' : 'Create'}</Button>
          </DialogActions>
        </Dialog>

        {/* Delete confirmation dialog */}
        <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
          <DialogTitle>Confirm Delete</DialogTitle>
          <DialogContent>
            Are you sure you want to permanently delete the user "{deleteTarget?.username}"? This cannot be undone.
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
            <Button color="error" variant="contained" onClick={handleDelete} disabled={Boolean(deleting)}>{deleting ? <CircularProgress size={18} /> : 'Delete'}</Button>
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

export default UserManagement;
