import axiosClient from "./axios.service";

const reservationAPI = {
  getAvailableTables: (formattedDate, formattedTime) => {
    return axiosClient.get(`/api/reservations/tables/available?date=${formattedDate}&time=${formattedTime}`);
  },

  create: (formattedData) => {
    return axiosClient.post('/api/reservations', formattedData);
  },

  getByCode: (code) => {
    return axiosClient.get(`/api/reservations/${code}`);
  },

  updateStatus: (code, status) => {
    return axiosClient.put(`/api/reservations/${code}/status`, { status });
  },

  getReservationsFromToday: (date) => {
    return axiosClient.get(`/api/reservations/from?date=${date}`);
  },

  getUnAssignedReservations: () => {
    return axiosClient.get('/api/reservations/servant/unassigned');
  },

  getCustomerReservationByServant: () => {
    return axiosClient.get('/api/reservations/servant/customer')
  },

  servantCreateReservation: () => {
    return axiosClient.post('/api/reservations/servant/create')
  },

  servantUpdateReservation: (resvId, updateData) => {
    return axiosClient.put(`/api/reservations/servant/update/${resvId}`, updateData);
  },

  getReservationDetailById: (resvId) => {
    return axiosClient.get(`/api/reservations/servant/view/${resvId}`);
  },

  servantDeleteReservation: (resvId) => {
    return axiosClient.delete(`/api/reservations/servant/delete/${resvId}`);
  },

  confirmOrRejectReservation: (resvId, action) => {
    return axiosClient.post(`/api/reservations/servant/confirm-reject/${resvId}`, { action });
  },

  getDailyStatistics: (queryParams) => {
    return axiosClient.get(`/api/reservations/servant/daily-statistics${queryParams}`);
  },

  confirmCustomerArrival: (reservationCode) => {
    return axiosClient.post(`/api/reservations/servant/confirm-arrival`, { reservationCode });
  }
};

const reservationService = {
  getAvailableTables: async (date, time) => {
    try {
      const formattedDate = date.format('YYYY-MM-DD');
      const formattedTime = time.format('HH:mm');
      const response = await reservationAPI.getAvailableTables(formattedDate, formattedTime);
      return response;
    } catch (error) {
      throw error.response ? error.response.data : new Error('Error fetching available tables');
    }
  },

  createReservation: async (bookingData) => {
    try {
      const tableIds = Array.isArray(bookingData.tables) ? bookingData.tables : [bookingData.tables];

      const formattedData = {
        tables: tableIds,
        date: bookingData.date,
        time: bookingData.time,
        name: bookingData.name,
        phone: bookingData.phone,
        email: bookingData.email || '',
        note: bookingData.note || '',
        guests: bookingData.guests
      };

      console.log("Sending reservation data:", formattedData);
      const response = await reservationAPI.create(formattedData);
      return response;
    } catch (error) {
      console.error("Full error creating reservation:", error);

      if (error.response) {
        console.error("Error response data:", error.response);
        throw error.response;
      } else if (error.request) {
        console.error("Error request:", error.request);
        throw new Error('Request made but no response received');
      } else {
        console.error("Error message:", error.message);
        throw new Error(`Error creating reservation: ${error.message}`);
      }
    }
  },

  getReservation: async (code) => {
    try {
      const response = await reservationAPI.getByCode(code);
      return response;
    } catch (error) {
      throw error.response ? error.response.data : new Error('Error fetching reservation');
    }
  },

  updateReservationStatus: async (code, status) => {
    try {
      const response = await reservationAPI.updateStatus(code, status);
      return response;
    } catch (error) {
      throw error.response ? error.response.data : new Error('Error updating reservation status');
    }
  },

  getReservationsFromToday: async (selectedDate) => {
    try {
      const formattedDate = selectedDate ? selectedDate.format('YYYY-MM-DD') : null;
      const response = await reservationAPI.getReservationsFromToday(formattedDate);
      return response;
    } catch (error) {
      throw error.response ? error.response.data : new Error('Error fetching reservations from today');
    }
  },

  getUnAssignedReservations: async () => {
    try {
      const response = await reservationAPI.getUnAssignedReservations()
      console.log('response: ', response);
      return response
    } catch (error) {
      throw error.response ? error.response.data : new Error('Error fetching unassigned reservations');
    }
  },

  getCustomerReservationByServant: async () => {
    try {
      const response = await reservationAPI.getCustomerReservationByServant();
      console.log('response: ', response);
      return response;
    } catch (error) {
      throw error.response ? error.response.data : new Error('Error fetching customer reservations by servant');
    }
  },

  servantCreateReservation: async () => {
    try {

    } catch (error) {
      throw error.response ? error.response.data : new Error('Error creating reservation for customer by servant');
    }
  },

  servantUpdateReservation: async (resvId, updateData) => {
    try {
      const response = await reservationAPI.servantUpdateReservation(resvId, updateData);
      return response;
    } catch (error) {
      throw error.response ? error.response.data : new Error('Error updating reservation by servant');
    }
  },

  getReservationDetailById: async (resvId) => {
    try {
      const response = await reservationAPI.getReservationDetailById(resvId);
      console.log('response: ', response)
      return response;
    } catch (error) {
      throw error.response ? error.response.data : new Error('Error fetching reservation detail');
    }
  },

  servantDeleteReservation: async (resvId) => {
    try {
      const response = await reservationAPI.servantDeleteReservation(resvId);
      return response;
    } catch (error) {
      throw error.response ? error.response.data : new Error('Error deleting reservation by servant');
    }
  },

  confirmOrRejectReservation: async (resvId, action) => {
    try {
      const response = await reservationAPI.confirmOrRejectReservation(resvId, action);
      return response;
    } catch (error) {
      throw error.response ? error.response.data : new Error('Error confirming or rejecting reservation');
    }
  },

  getDailyStatistics: async ({ period, startDate, endDate }) => {
    try {
      let queryParams = '';
      if (period) {
        queryParams = `?period=${period}`;
      } else if (startDate && endDate) {
        queryParams = `?startDate=${startDate}&endDate=${endDate}`;
      }

      const response = await reservationAPI.getDailyStatistics(queryParams);
      return response;
    } catch (error) {
      throw error.response ? error.response.data : new Error('Error fetching daily statistics');
    }
  },

  confirmCustomerArrival: async (reservationCode) => {
    try {
      const response = await reservationAPI.confirmCustomerArrival(reservationCode);
      return response;
    } catch (error) {
      console.error("Error confirming customer arrival:", error);
      throw error.response ? error.response.data : new Error('Error confirming customer arrival');
    }
  },
};

export default reservationService;