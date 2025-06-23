const NOTIFICATION_TYPES = {
    // Booking notifications
    RESERVATION_CREATED_BY_CUSTOMER: 'RESERVATION_CREATED_BY_CUSTOMER',           // Khi customer tạo reservation mới
    RESERVATION_UPDATED_BY_CUSTOMER: 'RESERVATION_UPDATED_BY_CUSTOMER',           // Khi customer cập nhật reservation
    RESERVATION_CONFIRMED_BY_SERVANT: 'RESERVATION_CONFIRMED_BY_SERVANT',       // Khi servant xác nhận reservation cua customer
    RESERVATION_REJECTED_BY_SERVANT: 'RESERVATION_REJECTED_BY_SERVANT',         // Khi servant từ chối reservation cua customer
    RESERVATION_CREATED_BY_SERVANT: 'RESERVATION_CREATED_BY_SERVANT',           //Khi servant tao reservation cho khach
    RESERVATION_DELETED_BY_SERVANT: 'RESERVATION_DELETED_BY_SERVANT',           //Khi servant xoa reservation
    RESERVATION_UPDATED_BY_SERVANT: 'RESERVATION_UPDATED_BY_SERVANT',           //Khi servant xoa reservation

};

module.exports = NOTIFICATION_TYPES; 