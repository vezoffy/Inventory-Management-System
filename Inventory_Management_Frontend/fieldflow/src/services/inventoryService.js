import api from '../api/axiosInstance';

const getAssets = async (params = {}) => {
  // params: { type, status, location }
  const resp = await api.get('/api/inventory/assets', { params });
  return resp.data;
};

const createAsset = async (body) => {
  const resp = await api.post('/api/inventory/assets', body);
  return resp.data;
};

const getAsset = async (serialNumber) => {
  const resp = await api.get(`/api/inventory/assets/${encodeURIComponent(serialNumber)}`);
  return resp.data;
};

const updateStatus = async (id, newStatus) => {
  const resp = await api.patch(`/api/inventory/assets/${id}/status`, { newStatus });
  return resp.data;
};

const getHistory = async (id) => {
  const resp = await api.get(`/api/inventory/assets/${id}/history`);
  return resp.data;
};

// Headend / CoreSwitch / FDH / Splitter endpoints
const getHeadend = async (id) => {
  const resp = await api.get(`/api/inventory/headends/${id}`);
  return resp.data;
};

const getCoreSwitch = async (id) => {
  const resp = await api.get(`/api/inventory/core-switches/${id}`);
  return resp.data;
};

const getFdh = async (id) => {
  const resp = await api.get(`/api/inventory/fdhs/${id}`);
  return resp.data;
};

const getSplitter = async (id) => {
  const resp = await api.get(`/api/inventory/splitters/${id}`);
  return resp.data;
};

// Fiber drop lines (customer-facing fiber rolls)
const getFiberDropLines = async () => {
  const resp = await api.get('/api/customers/fiber-drop-lines');
  return resp.data;
};

const getFiberDropLinesBySplitter = async (splitterId) => {
  const resp = await api.get(`/api/customers/fiber-drop-lines/splitter/${splitterId}`);
  return resp.data;
};

const inventoryService = {
  getAssets,
  createAsset,
  getAsset,
  updateStatus,
  getHistory,
  getHeadend,
  getCoreSwitch,
  getFdh,
  getSplitter,
  getFiberDropLines,
  getFiberDropLinesBySplitter,
  updateAsset: async (id, body) => {
    const resp = await api.put(`/api/inventory/assets/${id}`, body);
    return resp.data;
  },
  deleteAsset: async (id) => {
    // Updated endpoint: delete by id via /by-id/{id}
    const resp = await api.delete(`/api/inventory/assets/by-id/${id}`);
    return resp;
  },
};

export default inventoryService;
