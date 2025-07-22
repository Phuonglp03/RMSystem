import axiosService from './axios.service';

const couponService = {
  getAllCoupons: () => axiosService.get('/api/coupons'),
  createCoupon: (data) => axiosService.post('/api/coupons', data),
  updateCoupon: (id, data) => axiosService.put(`/api/coupons/${id}`, data),
  deleteCoupon: (id) => axiosService.delete(`/api/coupons/${id}`),
  getCouponById: (id) => axiosService.get(`/api/coupons/${id}`),
  redeemCoupon: (userId, couponId) => axiosService.post(`/api/users/${userId}/redeem-coupon`, { couponId }),
};

export default couponService; 