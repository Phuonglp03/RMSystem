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
  },

  getAllTableOrders: (url) => {
    return axiosClient.get(url)
  },

  servantGetAllTableOrders: (url) => {
    return axiosClient.get(url)
  },

  servantConfirmTableOrder: (orderId) => {
    return axiosClient.post('/api/table-orders/servant/confirm/' + orderId);
  },

  getTableOrderFromCustomerByReservationCode: (reservationCode) => {
    return axiosClient.post('/api/table-orders/servant', { reservationCode });
  },

  servantCreateTableOrderForCustomer: (reservationCode, orders) => {
    return axiosClient.post('/api/table-orders/servant/create', { reservationCode, orders });
  },

  servantUpdateTableOrder: (orderId, updateData) => {
    return axiosClient.put(`/api/table-orders/servant/update?orderId=${orderId}`, updateData);
  },

  servantSendTableOrderToChef: (orderId) => {
    return axiosClient.post(`/api/table-orders/servant/send?orderId=${orderId}`);
  },

  servantDeleteTableOrder: (orderId) => {
    return axiosClient.delete(`/api/table-orders/servant/delete?orderId=${orderId}`);
  },

  updateFoodItemStatusInTableOrder: (orderId, foodId) => {
    return axiosClient.patch(`/api/table-orders/update-item/${orderId}/${foodId}`);
  },

  deleteFoodItemFromTableOrder: (orderId, foodId) => {
    return axiosClient.patch(`/api/table-orders/delete-item/${orderId}/${foodId}`);
  },

  servantTransferTableOrderToCustomer: (orderId, newTableId) => {
    return axiosClient.post(`/api/table-orders/change-table/${orderId}`, { newTableId });
  },

  getTableOrderStats: (type, from, to) => {
    // type: 'day' | 'week' | 'month' | 'year'
    // from, to: ISO date string (yyyy-mm-dd)
    let url = `/api/table-orders/stats?type=${type}`;
    if (from) url += `&from=${from}`;
    if (to) url += `&to=${to}`;
    return axiosClient.get(url);
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

  getAllTableOrders: async ({ page = 1, limit = 10, status } = {}) => {
    try {
      let url = `/api/table-orders?page=${page}&limit=${limit}`;
      if (status) url += `&status=${status}`;
      const response = await tableAPI.getAllTableOrders(url)
      console.log('getAllTableOrders response: ', response)
      console.log('getAllTableOrders url: ', url);

      return response
    } catch (error) {
      console.error("Error fetching all table orders:", error);
      throw error.response ? error.response.data : new Error('Error fetching all table orders');
    }
  },

  servantGetAllTableOrders: async ({ page = 1, limit = 10, status } = {}) => {
    try {
      let url = `/api/table-orders/servant?page=${page}&limit=${limit}`;
      if (status) url += `&status=${status}`;
      const response = await tableAPI.servantGetAllTableOrders(url)
      console.log('servantGetAllTableOrders response: ', response)
      // console.log('getAllTableOrders url: ', url);
      // if (!response || !response.data) {
      //   throw new Error('No data returned from servantGetAllTableOrders');
      // }
      return response
    } catch (error) {
      console.error("Error fetching all table orders:", error);
      throw error.response ? error.response.data : new Error('Error fetching all table orders');
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
      console.log('getAssignedTableByServant: ', res)
      return res
    } catch (error) {
      console.error("Error fetching assigned tables:", error);
      throw error.response ? error.response.data : new Error('Error fetching assigned tables');
    }
  },

  getTableOrderFromCustomerByReservationCode: async (reservationCode) => {
    try {
      const response = await tableAPI.getTableOrderFromCustomerByReservationCode(reservationCode);
      return response.data;
    } catch (error) {
      console.error("Error getting table orders by reservationCode:", error);
      throw error.response ? error.response.data : new Error('Error getting table orders by reservationCode');
    }
  },

  servantConfirmTableOrder: async (orderId) => {
    try {
      const response = await tableAPI.servantConfirmTableOrder(orderId);
      return response.data;
    } catch (error) {
      console.error("Error confirming table order:", error);
      throw error.response ? error.response.data : new Error('Error confirming table order');
    }
  },

  servantCreateTableOrderForCustomer: async (reservationCode, orders) => {
    try {
      const response = await tableAPI.servantCreateTableOrderForCustomer(reservationCode, orders);
      console.log('response.data: ', response)
      return response;
    } catch (error) {
      console.error("Error creating table order for customer:", error);
      throw error.response ? error.response.data : new Error('Error creating table order for customer');
    }
  },

  servantUpdateTableOrder: async (orderId, updateData) => {
    try {
      const response = await tableAPI.servantUpdateTableOrder(orderId, updateData);
      return response.data;
    } catch (error) {
      console.error("Error updating table order:", error);
      throw error.response ? error.response.data : new Error('Error updating table order');
    }
  },

  servantSendTableOrderToChef: async (orderId) => {
    try {
      const response = await tableAPI.servantSendTableOrderToChef(orderId);
      return response.data;
    } catch (error) {
      console.error("Error sending table order to chef:", error);
      throw error.response ? error.response.data : new Error('Error sending table order to chef');
    }
  },

  servantDeleteTableOrder: async (orderId) => {
    try {
      const response = await tableAPI.servantDeleteTableOrder(orderId);
      return response.data;
    } catch (error) {
      console.error("Error deleting table order:", error);
      throw error.response ? error.response.data : new Error('Error deleting table order');
    }
  },

  updateFoodItemStatusInTableOrder: async (orderId, foodId) => {
    try {
      const response = await tableAPI.updateFoodItemStatusInTableOrder(orderId, foodId);
      return response.data;
    } catch (error) {
      console.error("Error adding food to table order:", error);
      throw error.response ? error.response.data : new Error('Error adding food to table order');
    }
  },

  deleteFoodItemFromTableOrder: async (orderId, foodId) => {
    try {
      const response = await tableAPI.deleteFoodItemFromTableOrder(orderId, foodId);
      return response.data;
    } catch (error) {
      console.error("Error deleting food item from table order:", error);
      throw error.response ? error.response.data : new Error('Error deleting food item from table order');
    }
  },

  servantTransferTableOrderToCustomer: async (orderId, newTableId) => {
    try {
      const response = await tableAPI.servantTransferTableOrderToCustomer(orderId, newTableId);
      return response.data;
    } catch (error) {
      console.error("Error changing table for table order:", error);
      throw error.response ? error.response.data : new Error('Error changing table for table order');
    }
  },

  servantSendTableOrderToChef: async (orderId) => {
    try {
      const response = await axiosClient.post(`/api/table-orders/servant/send?orderId=${orderId}`);
      return response.data;
    } catch (error) {
      console.error("Error sending table order to chef:", error);
      throw error.response ? error.response.data : new Error('Error sending table order to chef');
    }
  },

  updateFoodItemStatusInTableOrder: async (orderId, foodId, status) => {
    try {
      const response = await axiosClient.patch(`/api/table-orders/update-item/${orderId}/${foodId}`, { status });
      return response.data;
    } catch (error) {
      console.error("Error updating food item status:", error);
      throw error.response ? error.response.data : new Error('Error updating food item status');
    }
  },

  deleteFoodItemFromTableOrder: async (orderId, foodId) => {
    try {
      const response = await axiosClient.patch(`/api/table-orders/delete-item/${orderId}/${foodId}`);
      return response.data;
    } catch (error) {
      console.error("Error deleting food item from table order:", error);
      throw error.response ? error.response.data : new Error('Error deleting food item');
    }
  },

  servantTransferTableOrderToCustomer: async (orderId) => {
    try {
      const response = await axiosClient.post(`/api/table-orders/change-table/${orderId}`);
      return response.data;
    } catch (error) {
      console.error("Error transferring table order to customer:", error);
      throw error.response ? error.response.data : new Error('Error transferring table order to customer');
    }
  },


  getTableOrderStats: async (type, from, to) => {
    try {
      const response = await tableAPI.getTableOrderStats(type, from, to);
      console.log('getTableOrderStats response: ', response);
      return response.data;
    } catch (error) {
      console.error("Error fetching table order stats:", error);
      throw error.response ? error.response.data : new Error('Error fetching table order stats');
    }
  },
};

export default tableService; 