import axiosInstance from './axios.service';

const API_ENDPOINTS = {
  FOOD_CATEGORIES: '/api/food-categories'
};

export const foodCategoryService = {
  // Lấy tất cả danh mục món ăn
  getAllFoodCategories: async () => {
    try {
      const response = await axiosInstance.get(API_ENDPOINTS.FOOD_CATEGORIES);
      console.log('Food categories response:', response); // Debug log
      // response đã được processed bởi axios interceptor, nên nó có format: {message, data}
      // Ta cần lấy response.data để có array categories
      return response?.data || [];
    } catch (error) {
      console.error('Error fetching food categories:', error);
      throw error;
    }
  },

  // Lấy danh mục theo ID
  getFoodCategoryById: async (id) => {
    try {
      const response = await axiosInstance.get(`${API_ENDPOINTS.FOOD_CATEGORIES}/${id}`);
      return response?.data || response;
    } catch (error) {
      console.error('Error fetching food category by id:', error);
      throw error;
    }
  },

  // Tạo danh mục mới
  createFoodCategory: async (data) => {
    try {
      const response = await axiosInstance.post(`${API_ENDPOINTS.FOOD_CATEGORIES}/create`, data);
      return response?.data || response;
    } catch (error) {
      console.error('Error creating food category:', error);
      throw error;
    }
  },

  // Cập nhật danh mục
  updateFoodCategory: async (id, data) => {
    try {
      const response = await axiosInstance.put(`${API_ENDPOINTS.FOOD_CATEGORIES}/${id}`, data);
      return response?.data || response;
    } catch (error) {
      console.error('Error updating food category:', error);
      throw error;
    }
  },

  // Xóa danh mục
  deleteFoodCategory: async (id) => {
    try {
      await axiosInstance.delete(`${API_ENDPOINTS.FOOD_CATEGORIES}/${id}`);
      return true;
    } catch (error) {
      console.error('Error deleting food category:', error);
      throw error;
    }
  }
};

export default foodCategoryService; 