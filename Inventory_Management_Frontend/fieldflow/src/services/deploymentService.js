import api from '../api/axiosInstance';

const deploymentService = {
  createTask: async (body) => {
    const resp = await api.post('/api/deployments/tasks', body);
    return resp;
  }
  ,
  getTasks: async (techId) => {
    const params = {};
    if (techId) params.techId = techId;
    const resp = await api.get('/api/deployments/tasks/technician', { params });
    return resp.data;
  },
  completeTask: async (id, body) => {
    const resp = await api.patch(`/api/deployments/tasks/${id}/complete`, body);
    return resp.data;
  }
  ,
  getTechnicians: async (region) => {
    const params = {};
    if (region) params.region = region;
    const resp = await api.get('/api/deployments/technicians', { params });
    return resp.data;
  }
  ,
  getAuditLogs: async (params) => {
    // params: { userId, actionType, startTime, endTime }
    const resp = await api.get('/api/deployments/audit/logs', { params });
    return resp.data;
  }
  ,
  deactivateCustomer: async (customerId, body) => {
    const resp = await api.post(`/api/deployments/workflow/deactivate/${customerId}`, body);
    return resp.data;
  }
};

export default deploymentService;
