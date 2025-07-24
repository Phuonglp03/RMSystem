import axiosInstance from "./axios.service";

const tableAPI = {
  getAllTables: () => {
    return axiosInstance.get('/api/tables/all');
  },

  getAvailableTableForCreateReservation: (data) => {
    return axiosInstance.post('/api/tables/available', data)
  },

  getAllTableOrders: (url) => {
    return axiosInstance.get(url)
  },

  getTableOrderById: (id) => {
    return axiosInstance.get(`/api/table-orders/${id}`);
  },

  updateFoodItemStatusInTableOrder: (orderId, foodId) => {
    return axiosInstance.patch(`/api/table-orders/update-item/${orderId}/${foodId}`);
  },

  deleteFoodItemFromTableOrder: (orderId, foodId) => {
    return axiosInstance.patch(`/api/table-orders/delete-item/${orderId}/${foodId}`);
  },

  getTableOrderStats: (type, from, to) => {
    // type: 'day' | 'week' | 'month' | 'year'
    // from, to: ISO date string (yyyy-mm-dd)
    let url = `/api/table-orders/servant/stats?type=${type}`;
    if (from) url += `&from=${from}`;
    if (to) url += `&to=${to}`;
    return axiosInstance.get(url);
  }
};

const createPayosPayment = async (orderId) => {
  try {
    // response đã là .data do interceptor, nên chỉ cần return luôn
    return await axiosInstance.post('/api/table-orders/payos/create-payment', { orderId });
  } catch (error) {
    throw error.response ? error.response.data : new Error('Error creating PayOS payment');
  }
};

const checkPayosPaymentStatus = async (transactionCode) => {
  try {
    const response = await axiosInstance.get(`/api/table-orders/payos/check-status/${transactionCode}`);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error('Error checking PayOS payment status');
  }
};

// --- PAYOS RESERVATION PAYMENT ---
const createPayosReservationPayment = async (reservationCode) => {
  try {
    return await axiosInstance.post('/api/payos-reservation/create-payment', { reservationCode });
  } catch (error) {
    throw error.response ? error.response.data : new Error('Error creating PayOS reservation payment');
  }
};

const checkPayosReservationPaymentStatus = async (transactionCode) => {
  try {
    const response = await axiosInstance.get(`/api/payos-reservation/check-status/${transactionCode}`);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error('Error checking PayOS reservation payment status');
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

  getOrdersByReservationId: async (reservationId) => {
    try {
      const response = await axiosInstance.get(`/api/table-orders/reservation/${reservationId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching orders by reservationId:", error);
      throw error.response ? error.response.data : new Error('Error fetching orders by reservationId');
    }
  },

  getTableOrderById: async (id) => {
    try {
      const response = await tableAPI.getTableOrderById(id);
      console.log('getTableOrderById response: ', response);
      return response;
    } catch (error) {
      console.error("Error fetching table order by ID:", error);
      throw error.response ? error.response.data : new Error('Error fetching table order by ID');
    }
  },

  getOrdersByUserId: async (userId) => {
    try {
      const response = await axiosInstance.get(`/api/table-orders/user/${userId}`);
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

  createPayosPayment,
  checkPayosPaymentStatus,
  createPayosReservationPayment,
  checkPayosReservationPaymentStatus,

  getTableOrderStats: async (type, from, to) => {
    try {
      const response = await tableAPI.getTableOrderStats(type, from, to);
      console.log('getTableOrderStats response: ', response);
      return response;
    } catch (error) {
      console.error("Error fetching table order stats:", error);
      throw error.response ? error.response.data : new Error('Error fetching table order stats');
    }
  },

  createTableOrder: async (orderData) => {
    try {
      const response = await axiosInstance.post('/api/table-orders', orderData);
      return response.data;
    } catch (error) {
      console.error("Error creating table order:", error);
      throw error.response ? error.response.data : new Error('Error creating table order');
    }
  },
  // --- ADD THESE METHODS FOR ADMIN TABLE MANAGE ---
  createTable: async (data) => {
    try {
      const response = await axiosInstance.post('/api/tables', data);
      return response.data;
    } catch (error) {
      console.error("Error creating table:", error);
      throw error.response ? error.response.data : new Error('Error creating table');
    }
  },
  updateTable: async (id, data) => {
    try {
      const response = await axiosInstance.put(`/api/tables/${id}`, data);
      return response.data;
    } catch (error) {
      console.error("Error updating table:", error);
      throw error.response ? error.response.data : new Error('Error updating table');
    }
  },
  deleteTable: async (id) => {
    try {
      const response = await axiosInstance.delete(`/api/tables/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error deleting table:", error);
      throw error.response ? error.response.data : new Error('Error deleting table');
    }
  },
  getReservationByCode: async (code) => {
    try {
      const response = await axiosInstance.get(`/api/table-orders/reservation/by-code/${code}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching reservation by code:', error);
      throw error.response ? error.response.data : new Error('Error fetching reservation by code');
    }
  },
  updateReservationStatus: async (reservationCode, data) => {
    try {
      const response = await axiosInstance.put(`/api/reservations/${reservationCode}/status`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating reservation status:', error);
      throw error.response ? error.response.data : new Error('Error updating reservation status');
    }
  },
};

export default tableService; 