import axios from 'axios';

const DASHBOARD_API_URL = 'https://dashboard-service-dc80.onrender.com';

// Admin Dashboard service
const adminDashboardService = {
  // Get KPIs
  getKPIs: async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${DASHBOARD_API_URL}/admin/kpis`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get Audit Log
  getAuditLog: async (skip = 0, take = 100) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${DASHBOARD_API_URL}/admin/audit-log?skip=${skip}&take=${take}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get Examiner Progress
  getExaminerProgress: async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${DASHBOARD_API_URL}/admin/examiner-progress`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Export Report
  exportReport: async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${DASHBOARD_API_URL}/admin/audit-log/export`, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        responseType: 'blob'
      });
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `audit-log-${new Date().toISOString().split('T')[0]}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      return true;
    } catch (error) {
      throw error;
    }
  },

  // Get Grading Conflicts
  getGradingConflicts: async (threshold = 2) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${DASHBOARD_API_URL}/admin/grading-conflicts?threshold=${threshold}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get Appeals
  getAppeals: async (status = 'Pending') => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${DASHBOARD_API_URL}/admin/appeals?status=${status}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default adminDashboardService;
