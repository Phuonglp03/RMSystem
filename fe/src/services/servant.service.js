import axiosInstance from './axios.service';

const servantService = {
  confirmCashPayment: async (orderId) => {
    try {
      const res = await axiosInstance.patch(`/api/table-orders/${orderId}/confirm-cash`);
      return res;
    } catch (error) {
      throw error.response ? error.response.data : new Error('Error confirming cash payment');
    }
  },
  // Quản lý reservation
  getAllReservations: async (params = {}) => {
    try {
      const res = await axiosInstance.get('/api/servant/reservations', { params });
      return res.reservations || [];
    } catch (error) {
      throw error.response ? error.response.data : new Error('Error fetching reservations');
    }
  },
  getReservationDetail: async (id) => {
    try {
      const res = await axiosInstance.get(`/api/servant/reservations/${id}`);
      return res.reservation;
    } catch (error) {
      throw error.response ? error.response.data : new Error('Error fetching reservation detail');
    }
  },
  updateReservationStatus: async (id, status) => {
    try {
      const res = await axiosInstance.put(`/api/servant/reservations/${id}/status`, { status });
      return res.reservation;
    } catch (error) {
      throw error.response ? error.response.data : new Error('Error updating reservation status');
    }
  },
  updateReservation: async (id, data) => {
    try {
      const res = await axiosInstance.put(`/api/servant/reservations/${id}`, data);
      return res.reservation;
    } catch (error) {
      throw error.response ? error.response.data : new Error('Error updating reservation');
    }
  },
  getAllTablesWithStatus: async () => {
    try {
      const res = await axiosInstance.get('/api/servant/tables/all-with-status');
      return res.tables || [];
    } catch (error) {
      throw error.response ? error.response.data : new Error('Error fetching tables with status');
    }
  },
  quickCreateReservation: async (data) => {
    try {
      const res = await axiosInstance.post('/api/servant/reservations/quick-create', data);
      return res.reservation;
    } catch (error) {
      throw error.response ? error.response.data : new Error('Error creating quick reservation');
    }
  },
};

export default servantService; 