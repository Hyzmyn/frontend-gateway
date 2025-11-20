import api from './api';

// Base service for interacting with microservices through gateway
const microserviceService = {
  // Generic GET request
  get: async (serviceName, endpoint, params = {}) => {
    try {
      const response = await api.get(`/${serviceName}${endpoint}`, { params });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Generic POST request
  post: async (serviceName, endpoint, data) => {
    try {
      const response = await api.post(`/${serviceName}${endpoint}`, data);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Generic PUT request
  put: async (serviceName, endpoint, data) => {
    try {
      const response = await api.put(`/${serviceName}${endpoint}`, data);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Generic DELETE request
  delete: async (serviceName, endpoint) => {
    try {
      const response = await api.delete(`/${serviceName}${endpoint}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Generic PATCH request
  patch: async (serviceName, endpoint, data) => {
    try {
      const response = await api.patch(`/${serviceName}${endpoint}`, data);
      return response;
    } catch (error) {
      throw error;
    }
  },
};

export default microserviceService;
