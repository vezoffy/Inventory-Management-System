import api from '../api/axiosInstance';

const login = async ({ username, password }) => {
  // returns response.data or throws
  // Note: backend login endpoint is /api/auth/login (not /signin) — call the working path
  const resp = await api.post('/api/auth/login', { username, password });
  return resp.data;
};

const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

const authService = {
  login,
  logout,
};

export default authService;
