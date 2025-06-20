const NOTIFICATION_TYPES = {
    // Booking notifications
    RESERVATION_CREATED: 'RESERVATION_CREATED',           // Khi customer tạo reservation mới
    RESERVATION_UPDATED: 'RESERVATION_UPDATED',           // Khi customer cập nhật reservation
    RESERVATION_CONFIRMED: 'RESERVATION_CONFIRMED',       // Khi servant xác nhận reservation cua customer
    RESERVATION_REJECTED: 'RESERVATION_REJECTED',         // Khi servant từ chối reservation cua customer
    RESERVATION_CANCELLED_BY_RENTER: 'RESERVATION_CANCELLED_BY_CUSTOMER',   // Khi renter hủy
    RESERVATION_CANCELLED_BY_LANDLORD: 'RESERVATION_CANCELLED_BY_SERVANT', // Khi landlord hủy
    RESERVATION_DELETED: 'RESERVATION_DELETED', //Khi admin xoa

};

module.exports = NOTIFICATION_TYPES; 