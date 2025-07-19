import axiosInstance from './axios.service';


class AdminService {
  async testAdminAccess() {
    try {
      console.log('🧪 Testing admin access...');
      const response = await axiosInstance.get('/api/admin/stats/dashboard');
      console.log('✅ Admin access test successful');
      return { success: true, data: response };
    } catch (error) {
      console.error('❌ Admin access test failed:', error);
      return { 
        success: false, 
        error: error.message,
        status: error.status,
        details: {
          url: error.url,
          method: 'GET',
          headers: error.config?.headers
        }
      };
    }
  }

  // Dashboard Statistics
  async getDashboardStats() {
    try {
      const response = await axiosInstance.get('/api/admin/stats/dashboard');
      return response; // axiosInstance already returns response.data
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw error;
    }
  }

  // Food Statistics
  async getFoodStats(params = {}) {
    try {
      const response = await axiosInstance.get(
        '/api/admin/stats/food',
        { params }
      );
      return response;
    } catch (error) {
      console.error('Error fetching food stats:', error);
      throw error;
    }
  }

  // Revenue Statistics
  async getRevenueStats(params = {}) {
    try {
      const response = await axiosInstance.get(
        '/api/admin/stats/revenue',
        { params }
      );
      return response;
    } catch (error) {
      console.error('Error fetching revenue stats:', error);
      throw error;
    }
  }

  // Reservation Statistics
  async getReservationStats(params = {}) {
    try {
      const response = await axiosInstance.get(
        '/api/admin/stats/reservations',
        { params }
      );
      return response;
    } catch (error) {
      console.error('Error fetching reservation stats:', error);
      throw error;
    }
  }

  // Table Order Statistics
  async getTableOrderStats(params = {}) {
    try {
      const response = await axiosInstance.get(
        '/api/admin/stats/table-orders',
        { params }
      );
      return response;
    } catch (error) {
      console.error('Error fetching table order stats:', error);
      throw error;
    }
  }

  // Customer Analytics
  async getCustomerStats(params = {}) {
    try {
      const response = await axiosInstance.get(
        '/api/admin/stats/customers',
        { params }
      );
      return response;
    } catch (error) {
      console.error('Error fetching customer stats:', error);
      throw error;
    }
  }

  // Staff Statistics
  async getStaffStats(params = {}) {
    try {
      const response = await axiosInstance.get(
        '/api/admin/stats/staff',
        { params }
      );
      return response;
    } catch (error) {
      console.error('Error fetching staff stats:', error);
      throw error;
    }
  }

  // Staff Management - Create
  async createStaff(staffData) {
    try {
      const response = await axiosInstance.post('/api/admin/staff', staffData);
      return response;
    } catch (error) {
      console.error('Error creating staff:', error);
      throw error;
    }
  }

  // Staff Management - Update
  async updateStaff(userId, staffData) {
    try {
      const response = await axiosInstance.put(`/api/admin/staff/${userId}`, staffData);
      return response;
    } catch (error) {
      console.error('Error updating staff:', error);
      throw error;
    }
  }

  // Staff Management - Get By ID
  async getStaffById(userId) {
    try {
      const response = await axiosInstance.get(`/api/admin/staff/${userId}`);
      return response;
    } catch (error) {
      console.error('Error fetching staff by ID:', error);
      throw error;
    }
  }

  // Staff Management - Deactivate
  async deactivateStaff(userId) {
    try {
      const response = await axiosInstance.patch(`/api/admin/staff/${userId}/deactivate`);
      return response;
    } catch (error) {
      console.error('Error deactivating staff:', error);
      throw error;
    }
  }

  // Staff Management - Activate
  async activateStaff(userId) {
    try {
      const response = await axiosInstance.patch(`/api/admin/staff/${userId}/activate`);
      return response;
    } catch (error) {
      console.error('Error activating staff:', error);
      throw error;
    }
  }

  // Staff Management - Reset Password
  async resetStaffPassword(userId, passwordData) {
    try {
      const response = await axiosInstance.patch(`/api/admin/staff/${userId}/reset-password`);
      return response;
    } catch (error) {
      console.error('Error resetting staff password:', error);
      throw error;
    }
  }
}

const adminService = new AdminService();
export default adminService; 