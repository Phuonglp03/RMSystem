import axiosClient from './axios.service';

const userService = {
  // Get all staff (admin, chef, servant, customer)
  getAllStaff: async (params = {}) => {
    try {
      const response = await axiosClient.get('/api/admin/staff', { params });
      return response; // axios.service.js interceptor already returns response.data
    } catch (error) {
      console.error('Error fetching staff:', error);
      throw error;
    }
  },

  // Create staff account
  createStaffAccount: async (userData) => {
    try {
      const response = await axiosClient.post('/api/admin/staff', userData);
      return response;
    } catch (error) {
      console.error('Error creating staff account:', error);
      throw error;
    }
  },

  // Update staff account
  updateStaffAccount: async (userId, userData) => {
    try {
      const response = await axiosClient.put(`/api/admin/staff/${userId}`, userData);
      return response;
    } catch (error) {
      console.error('Error updating staff account:', error);
      throw error;
    }
  },

  // Deactivate staff account
  deactivateStaffAccount: async (userId) => {
    try {
      const response = await axiosClient.patch(`/api/admin/staff/${userId}/deactivate`);
      return response;
    } catch (error) {
      console.error('Error deactivating staff account:', error);
      throw error;
    }
  },

  // Activate staff account
  activateStaffAccount: async (userId) => {
    try {
      const response = await axiosClient.patch(`/api/admin/staff/${userId}/activate`);
      return response;
    } catch (error) {
      console.error('Error activating staff account:', error);
      throw error;
    }
  },

  // Reset staff password
  resetStaffPassword: async (userId, newPassword) => {
    try {
      const response = await axiosClient.patch(`/api/admin/staff/${userId}/reset-password`, {
        newPassword
      });
      return response;
    } catch (error) {
      console.error('Error resetting staff password:', error);
      throw error;
    }
  },

  // Get staff by ID
  getStaffById: async (userId) => {
    try {
      const response = await axiosClient.get(`/api/admin/staff/${userId}`);
      return response;
    } catch (error) {
      console.error('Error fetching staff by ID:', error);
      throw error;
    }
  },

  // Get staff statistics
  getStaffStats: async () => {
    try {
      const response = await axiosClient.get('/api/admin/staff/stats');
      return response;
    } catch (error) {
      console.error('Error fetching staff stats:', error);
      throw error;
    }
  }
};

export default userService; 