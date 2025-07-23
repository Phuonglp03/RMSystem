import axiosInstance from "./axios.service";

const reservationAPI = {
  getAvailableTables: (formattedDate, formattedTime) => {
    return axiosInstance.get(`/api/reservations/tables/available?date=${formattedDate}&time=${formattedTime}`);
  },

  create: (formattedData) => {
    return axiosInstance.post('/api/reservations', formattedData);
  },

  getByCode: (code) => {
    return axiosInstance.get(`/api/reservations/${code}`);
  },

  updateStatus: (code, status) => {
    return axiosInstance.put(`/api/reservations/${code}/status`, { status });
  },

  getReservationsFromToday: (date) => {
    return axiosInstance.get(`/api/reservations/from?date=${date}`);
  },

  getUserReservations: () => {
    return axiosInstance.get('/api/reservations/user/history');
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

  getUserReservations: async () => {
    try {
      const response = await reservationAPI.getUserReservations();
      return response;
    } catch (error) {
      console.error("Error fetching user reservations:", error);
      throw error.response ? error.response.data : new Error('Error fetching user reservations');
    }
  }
};

export default reservationService;