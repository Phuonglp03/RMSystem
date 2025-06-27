import axiosClient from "./axios.service";

const tableAPI = {
  getAllTables: () => {
    return axiosClient.get('/api/tables/all');
  },

  getAvailableTableForCreateReservation: (data) => {
    return axiosClient.post('/api/tables/available', data)
  },

  getAssignedTableByServant: () => {
    return axiosClient.get('/api/tables/servant/assigned')
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
  },

  getAvailableTableForCreateReservation: async (data) => {
    try {
      const response = tableAPI.getAvailableTableForCreateReservation(data)
      console.log('response: ', response)
      return response
    } catch (error) {
      console.error("Error fetching available tables:", error);
      throw error.response ? error.response.data : new Error('Error fetching available tables');
    }
  },

  getAssignedTableByServant: async () => {
    try {
      const res = tableAPI.getAssignedTableByServant()
      console.log('getAssignedTable: ', res)
      return res
    } catch (error) {
      console.error("Error fetching assigned tables:", error);
      throw error.response ? error.response.data : new Error('Error fetching assigned tables');
    }
  }
};

export default tableService; 