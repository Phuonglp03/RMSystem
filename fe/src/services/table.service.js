import axiosClient from "./axios.service";

const tableAPI = {
  getAllTables: () => {
    return axiosClient.get('/api/tables/all');
  }
};

const tableService = {
  getAllTables: async () => {
    try {
      const response = await tableAPI.getAllTables();
      return response;
    } catch (error) {
      console.error("Error fetching all tables:", error);
      throw error.response ? error.response.data : new Error('Error fetching all tables');
    }
  },
  getOrdersByReservationId: async (reservationId) => {
    try {
      const response = await axiosClient.get(`/api/table-orders/reservation/${reservationId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching orders by reservationId:", error);
      throw error.response ? error.response.data : new Error('Error fetching orders by reservationId');
    }
  },
  getOrdersByUserId: async (userId) => {
    try {
      const response = await axiosClient.get(`/api/table-orders/user/${userId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching orders by userId:", error);
      throw error.response ? error.response.data : new Error('Error fetching orders by userId');
    }
  }
};

export default tableService; 