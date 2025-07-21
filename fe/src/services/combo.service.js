import axiosInstance from './axios.service';

class ComboService {
  // Get all combos
  getAllCombos = async () => {
    try {
      const response = await axiosInstance.get('/api/combos');
      return response.data || response;
    } catch (error) {
      console.error('Error fetching combos:', error);
      throw error;
    }
  };

  // Get combo by ID
  getComboById = async (id) => {
    try {
      const response = await axiosInstance.get(`/api/combos/${id}`);
      return response.data || response;
    } catch (error) {
      console.error('Error fetching combo by ID:', error);
      throw error;
    }
  };

  // Create new combo
  createCombo = async (comboData) => {
    try {
      const response = await axiosInstance.post('/api/combos', comboData);
      return response.data || response;
    } catch (error) {
      console.error('Error creating combo:', error);
      throw error;
    }
  };

  // Update combo
  updateCombo = async (id, comboData) => {
    try {
      const response = await axiosInstance.put(`/api/combos/${id}`, comboData);
      return response.data || response;
    } catch (error) {
      console.error('Error updating combo:', error);
      throw error;
    }
  };

  // Delete combo
  deleteCombo = async (id) => {
    try {
      const response = await axiosInstance.delete(`/api/combos/${id}`);
      return response.data || response;
    } catch (error) {
      console.error('Error deleting combo:', error);
      throw error;
    }
  };

  // Add item to combo
  addItemToCombo = async (comboId, itemData) => {
    try {
      const response = await axiosInstance.post(`/api/combos/${comboId}/items`, itemData);
      return response.data || response;
    } catch (error) {
      console.error('Error adding item to combo:', error);
      throw error;
    }
  };

  // Remove item from combo
  removeItemFromCombo = async (comboId, itemId) => {
    try {
      const response = await axiosInstance.delete(`/api/combos/${comboId}/items/${itemId}`);
      return response.data || response;
    } catch (error) {
      console.error('Error removing item from combo:', error);
      throw error;
    }
  };

  // Update combo item
  updateComboItem = async (comboId, itemId, itemData) => {
    try {
      const response = await axiosInstance.put(`/api/combos/${comboId}/items/${itemId}`, itemData);
      return response.data || response;
    } catch (error) {
      console.error('Error updating combo item:', error);
      throw error;
    }
  };

  // Toggle combo availability
  toggleAvailability = async (id) => {
    try {
      const response = await axiosInstance.patch(`/api/combos/${id}/toggle-availability`);
      return response.data || response;
    } catch (error) {
      console.error('Error toggling combo availability:', error);
      throw error;
    }
  };
}

const comboService = new ComboService();
export default comboService; 