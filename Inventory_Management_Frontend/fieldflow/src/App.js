import React from 'react';
import { CssBaseline } from '@mui/material';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import InventoryDashboard from './pages/InventoryDashboard';
import NetworkTopology from './pages/NetworkTopology';
import TopologyEditor from './pages/TopologyEditor';
import CustomerDashboard from './pages/CustomerDashboard';
import DeploymentTaskCreator from './pages/DeploymentTaskCreator';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import UserManagement from './pages/UserManagement';
import DeploymentTasks from './pages/DeploymentTasks';
import DeactivateCustomer from './pages/DeactivateCustomer';
import AuditLogs from './pages/AuditLogs';
import { AuthProvider } from './context/AuthContext';
import ColorModeProvider from './context/ColorModeContext';

function App() {
  return (
    <ColorModeProvider>
      <CssBaseline />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/inventory" element={<InventoryDashboard />} />
            <Route path="/topology" element={<NetworkTopology />} />
            <Route path="/topology-editor" element={<TopologyEditor />} />
            <Route path="/customers" element={<CustomerDashboard />} />
            <Route path="/deployments/new" element={<DeploymentTaskCreator />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/admin/users" element={<UserManagement />} />
            <Route path="/tasks" element={<DeploymentTasks />} />
            <Route path="/deactivate-customer" element={<DeactivateCustomer />} />
            <Route path="/admin/audit-logs" element={<AuditLogs />} />
            <Route path="/" element={<LandingPage />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ColorModeProvider>
  );
}

export default App;