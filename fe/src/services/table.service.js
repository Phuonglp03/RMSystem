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
  }
};

export default tableService; 