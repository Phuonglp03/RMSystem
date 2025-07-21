import axios from './axios.service';


class AuthService {
  // Đăng ký tài khoản mới
  async register(userData) {
    try {
      const response = await axios.post(`/api/users/register`, userData);
      return response;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }

  // Đăng nhập
  async login(email, password) {
    try {
      const response = await axios.post(`/api/users/login`, {
        email,
        password
      });
      console.log('Raw axios response:', response); // Debug log
      // axios interceptor đã trả về response.data rồi, không cần .data nữa
      return response;
    } catch (error) {
      console.error('Auth service login error:', error); // Debug log
      throw error.response?.data || error.message;
    }
  }

  // Đăng xuất
  async logout() {
    try {
      const response = await axios.post(`/api/users/logout`);
      return response;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }

  // Refresh token
  async refreshToken() {
    try {
      const response = await axios.post(`/api/users/refresh-token`);
      return response;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }

  // Lấy thông tin profile
  async getProfile() {
    try {
      const response = await axios.get(`/api/users/profile`);
      return response;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }

  // Lấy tất cả users (admin only)
  async getAllUsers(params = {}) {
    try {
      const response = await axios.get(`/api/users/all`, { params });
      return response;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }

  // Lấy danh sách staff (admin, chef, servant)
  async getStaffUsers() {
    try {
      const response = await axios.get(`/api/users/staff`);
      return response;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }

  // Kiểm tra trạng thái đăng nhập
  async checkAuthStatus() {
    try {
      const profile = await this.getProfile();
      return { isAuthenticated: true, user: profile.user };
    } catch (error) {
      return { isAuthenticated: false, user: null };
    }
  }

  // Validation helpers
  validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  validatePassword(password) {
    return password && password.length >= 6;
  }

  validateRegisterData(data) {
    const errors = {};

    if (!data.username || data.username.trim().length < 3) {
      errors.username = 'Username phải có ít nhất 3 ký tự';
    }

    if (!data.email || !this.validateEmail(data.email)) {
      errors.email = 'Email không hợp lệ';
    }

    if (!data.password || !this.validatePassword(data.password)) {
      errors.password = 'Password phải có ít nhất 6 ký tự';
    }

    if (data.phone && !/^[0-9]{10,11}$/.test(data.phone)) {
      errors.phone = 'Số điện thoại không hợp lệ';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }
}

const authService = new AuthService();
export default authService; 