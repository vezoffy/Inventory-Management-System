import api from '../api/axiosInstance';

const userService = {
  getAllUsers: async () => {
    const resp = await api.get('/api/auth/users');
    return resp.data;
  },
  registerUser: async (payload) => {
    // payload: { username, password, role }
    const resp = await api.post('/api/auth/register', payload);
    return resp.data;
  },
  createTechnician: async (payload) => {
    // payload: { name, username, password, contact, region }
    const resp = await api.post('/api/deployments/technicians', payload);
    return resp.data;
  },
  updateUser: async (id, payload) => {
    const resp = await api.put(`/api/auth/users/${id}`, payload);
    return resp.data;
  },
  deleteUser: async (id) => {
    const resp = await api.delete(`/api/auth/users/${id}`);
    return resp.data;
  }
};

export default userService;
