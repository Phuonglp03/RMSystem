import axiosInstance from './axios.service';

const userService = {
  // Get all staff (admin, chef, servant, customer)
  getAllStaff: async (params = {}) => {
    try {
      const response = await axiosInstance.get('/api/admin/staff', { params });
      return response; // axios.service.js interceptor already returns response.data
    } catch (error) {
      console.error('Error fetching staff:', error);
      throw error;
    }
  },

  // Create staff account
  createStaffAccount: async (userData) => {
    try {
      const response = await axiosInstance.post('/api/admin/staff', userData);
      return response;
    } catch (error) {
      console.error('Error creating staff account:', error);
      throw error;
    }
  },

  // Update staff account
  updateStaffAccount: async (userId, userData) => {
    try {
      const response = await axiosInstance.put(`/api/admin/staff/${userId}`, userData);
      return response;
    } catch (error) {
      console.error('Error updating staff account:', error);
      throw error;
    }
  },

  // Deactivate staff account
  deactivateStaffAccount: async (userId) => {
    try {
      const response = await axiosInstance.patch(`/api/admin/staff/${userId}/deactivate`);
      return response;
    } catch (error) {
      console.error('Error deactivating staff account:', error);
      throw error;
    }
  },

  // Activate staff account
  activateStaffAccount: async (userId) => {
    try {
      const response = await axiosInstance.patch(`/api/admin/staff/${userId}/activate`);
      return response;
    } catch (error) {
      console.error('Error activating staff account:', error);
      throw error;
    }
  },

  // Reset staff password
  resetStaffPassword: async (userId, newPassword) => {
    try {
      const response = await axiosInstance.patch(`/api/admin/staff/${userId}/reset-password`, {
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
      const response = await axiosInstance.get(`/api/admin/staff/${userId}`);
      return response;
    } catch (error) {
      console.error('Error fetching staff by ID:', error);
      throw error;
    }
  },

  // Get staff statistics
  getStaffStats: async () => {
    try {
      const response = await axiosInstance.get('/api/admin/staff/stats');
      return response;
    } catch (error) {
      console.error('Error fetching staff stats:', error);
      throw error;
    }
  },

  // === USER PROFILE METHODS ===

  // Get user profile by ID
  getUserProfile: async (userId) => {
    try {
      const response = await axiosInstance.get(`/api/users/${userId}/profile`);
      return response;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
  },

  // Update user profile
  updateUserProfile: async (userId, profileData) => {
    try {
      const response = await axiosInstance.put(`/api/users/${userId}/profile`, profileData);
      return response;
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  },

  // Get user loyalty information
  getUserLoyalty: async (userId) => {
    try {
      const response = await axiosInstance.get(`/api/users/${userId}/loyalty`);
      return response;
    } catch (error) {
      console.error('Error fetching user loyalty:', error);
      throw error;
    }
  },

  // Get user coupons
  getUserCoupons: async (userId) => {
    try {
      const response = await axiosInstance.get(`/api/users/${userId}/coupons`);
      return response;
    } catch (error) {
      console.error('Error fetching user coupons:', error);
      throw error;
    }
  }
};

export default userService; 