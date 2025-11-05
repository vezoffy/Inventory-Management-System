import api from '../api/axiosInstance';

const customerService = {
  createCustomer: async (payload) => {
    const resp = await api.post('/api/customers', payload);
    return resp.data;
  },
  getAllCustomers: async () => {
    const resp = await api.get('/api/customers/all');
    return resp.data;
  },
  searchCustomers: async (params) => {
    const resp = await api.get('/api/customers', { params });
    return resp.data;
  },
  getCustomer: async (id) => {
    const resp = await api.get(`/api/customers/${id}`);
    return resp.data;
  },
  updateCustomer: async (id, payload) => {
    const resp = await api.put(`/api/customers/${id}`, payload);
    return resp.data;
  },
  deleteCustomer: async (id) => {
    const resp = await api.delete(`/api/customers/${id}`);
    return resp;
  },
  assignAsset: async (id, assetSerial) => {
    const resp = await api.post(`/api/customers/${id}/assign-asset`, { assetSerialNumber: assetSerial });
    return resp.data;
  },
  assignPort: async (id, body) => {
    const resp = await api.patch(`/api/customers/${id}/assign-port`, body);
    return resp.data;
  },
  reassignPort: async (id, body) => {
    const resp = await api.patch(`/api/customers/${id}/reassign-port`, body);
    return resp.data;
  },
  getCustomersBySplitter: async (splitterId) => {
    const resp = await api.get(`/api/customers/splitter/${splitterId}`);
    return resp.data;
  }
};

export default customerService;
