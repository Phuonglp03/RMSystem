import axiosInstance from './axios.service';

const API_ENDPOINTS = {
  FOODS: '/api/foods',
  FOOD_CATEGORIES: '/api/food-categories'
};

export const foodService = {
  // Lấy tất cả món ăn
  getAllFoods: async () => {
    try {
      const response = await axiosInstance.get(API_ENDPOINTS.FOODS);
      return response.data || [];
    } catch (error) {
      console.error('Error fetching foods:', error);
      throw error;
    }
  },

  // Lấy món ăn theo ID
  getFoodById: async (id) => {
    try {
      const response = await axiosInstance.get(`${API_ENDPOINTS.FOODS}/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching food by id:', error);
      throw error;
    }
  },

  // Tạo món ăn mới
  createFood: async (formData) => {
    try {
      const response = await axiosInstance.post(API_ENDPOINTS.FOODS, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error creating food:', error);
      throw error;
    }
  },

  // Cập nhật món ăn
  updateFood: async (id, formData) => {
    try {
      const response = await axiosInstance.put(`${API_ENDPOINTS.FOODS}/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error updating food:', error);
      throw error;
    }
  },

  // Xóa món ăn
  deleteFood: async (id) => {
    try {
      await axiosInstance.delete(`${API_ENDPOINTS.FOODS}/${id}`);
      return true;
    } catch (error) {
      console.error('Error deleting food:', error);
      throw error;
    }
  },

  // Lấy tất cả danh mục món ăn
  getAllFoodCategories: async () => {
    try {
      const response = await axiosInstance.get(API_ENDPOINTS.FOOD_CATEGORIES);
      return response.data || [];
    } catch (error) {
      console.error('Error fetching food categories:', error);
      throw error;
    }
  }
};

export default foodService; 