import authorizedAxios from '../utils/authorizedAxios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:9999/api';

class AdminService {
  // Dashboard Statistics
  async getDashboardStats() {
    try {
      const response = await authorizedAxios.get(`${API_BASE_URL}/admin/stats/dashboard`);
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw error;
    }
  }

  // Revenue Statistics
  async getRevenueStats(params = {}) {
    try {
      const queryParams = new URLSearchParams();
      if (params.period) queryParams.append('period', params.period);
      if (params.startDate) queryParams.append('startDate', params.startDate);
      if (params.endDate) queryParams.append('endDate', params.endDate);

      const response = await authorizedAxios.get(
        `${API_BASE_URL}/admin/stats/revenue?${queryParams.toString()}`
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching revenue stats:', error);
      throw error;
    }
  }

  // Reservation Statistics
  async getReservationStats(params = {}) {
    try {
      const queryParams = new URLSearchParams();
      if (params.period) queryParams.append('period', params.period);
      if (params.startDate) queryParams.append('startDate', params.startDate);
      if (params.endDate) queryParams.append('endDate', params.endDate);

      const response = await authorizedAxios.get(
        `${API_BASE_URL}/admin/stats/reservations?${queryParams.toString()}`
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching reservation stats:', error);
      throw error;
    }
  }

  // Staff Performance Statistics
  async getStaffStats(params = {}) {
    try {
      const queryParams = new URLSearchParams();
      if (params.period) queryParams.append('period', params.period);
      if (params.startDate) queryParams.append('startDate', params.startDate);
      if (params.endDate) queryParams.append('endDate', params.endDate);

      const response = await authorizedAxios.get(
        `${API_BASE_URL}/admin/stats/staff?${queryParams.toString()}`
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching staff stats:', error);
      throw error;
    }
  }

  // Customer Analytics
  async getCustomerStats(params = {}) {
    try {
      const queryParams = new URLSearchParams();
      if (params.period) queryParams.append('period', params.period);
      if (params.startDate) queryParams.append('startDate', params.startDate);
      if (params.endDate) queryParams.append('endDate', params.endDate);

      const response = await authorizedAxios.get(
        `${API_BASE_URL}/admin/stats/customers?${queryParams.toString()}`
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching customer stats:', error);
      throw error;
    }
  }

  // Staff Management APIs
  async getAllStaff(params = {}) {
    try {
      const queryParams = new URLSearchParams();
      if (params.role) queryParams.append('role', params.role);
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);
      if (params.search) queryParams.append('search', params.search);

      const response = await authorizedAxios.get(
        `${API_BASE_URL}/admin/staff?${queryParams.toString()}`
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching staff:', error);
      throw error;
    }
  }

  async createStaffAccount(staffData) {
    try {
      const response = await authorizedAxios.post(`${API_BASE_URL}/admin/staff`, staffData);
      return response.data;
    } catch (error) {
      console.error('Error creating staff account:', error);
      throw error;
    }
  }

  async updateStaffAccount(userId, staffData) {
    try {
      const response = await authorizedAxios.put(`${API_BASE_URL}/admin/staff/${userId}`, staffData);
      return response.data;
    } catch (error) {
      console.error('Error updating staff account:', error);
      throw error;
    }
  }

  async getStaffById(userId) {
    try {
      const response = await authorizedAxios.get(`${API_BASE_URL}/admin/staff/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching staff by ID:', error);
      throw error;
    }
  }

  async deactivateStaffAccount(userId) {
    try {
      const response = await authorizedAxios.patch(`${API_BASE_URL}/admin/staff/${userId}/deactivate`);
      return response.data;
    } catch (error) {
      console.error('Error deactivating staff account:', error);
      throw error;
    }
  }

  async activateStaffAccount(userId) {
    try {
      const response = await authorizedAxios.patch(`${API_BASE_URL}/admin/staff/${userId}/activate`);
      return response.data;
    } catch (error) {
      console.error('Error activating staff account:', error);
      throw error;
    }
  }

  async resetStaffPassword(userId) {
    try {
      const response = await authorizedAxios.patch(`${API_BASE_URL}/admin/staff/${userId}/reset-password`);
      return response.data;
    } catch (error) {
      console.error('Error resetting staff password:', error);
      throw error;
    }
  }
}

const adminService = new AdminService();
export default adminService; 