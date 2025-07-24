import axiosInstance from './axios.service';

const chefService = {
  // Lấy danh sách table-orders theo status (pending, ...)
  getTableOrders: (params = {}) =>
    axiosInstance.get('/api/table-orders', { params }),

  // Hoàn thành đơn (update status)
  completeOrder: (orderId) =>
    axiosInstance.put(`/api/table-orders/${orderId}`, { status: 'completed' }),

  // Chef hoàn thành đơn (chuyển trạng thái sang completed)
  chefCompleteOrder: (orderId) =>
    axiosInstance.patch(`/api/table-orders/chef/${orderId}/complete`),

  // Chef lấy danh sách đơn pending kèm chi tiết combo
  getChefPendingOrders: () =>
    axiosInstance.get('/api/table-orders/chef/pending-orders'),

  // (Có thể bổ sung các API khác liên quan đến chef ở đây)
};

export default chefService; 