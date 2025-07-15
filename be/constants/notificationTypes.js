const NOTIFICATION_TYPES = {
    // Booking notifications
    RESERVATION_CREATED_BY_CUSTOMER: 'RESERVATION_CREATED_BY_CUSTOMER',           // Khi customer tạo reservation mới
    RESERVATION_UPDATED_BY_CUSTOMER: 'RESERVATION_UPDATED_BY_CUSTOMER',           // Khi customer cập nhật reservation
    RESERVATION_CONFIRMED_BY_SERVANT: 'RESERVATION_CONFIRMED_BY_SERVANT',       // Khi servant xác nhận reservation cua customer
    RESERVATION_REJECTED_BY_SERVANT: 'RESERVATION_REJECTED_BY_SERVANT',         // Khi servant từ chối reservation cua customer
    RESERVATION_CREATED_BY_SERVANT: 'RESERVATION_CREATED_BY_SERVANT',           //Khi servant tao reservation cho khach
    RESERVATION_DELETED_BY_SERVANT: 'RESERVATION_DELETED_BY_SERVANT',           //Khi servant xoa reservation
    RESERVATION_UPDATED_BY_SERVANT: 'RESERVATION_UPDATED_BY_SERVANT',           //Khi servant xoa reservation
    // TableOrder notifications
    TABLE_ORDER_CREATED_BY_SERVANT: 'TABLE_ORDER_CREATED_BY_SERVANT', // Khi servant tạo TableOrder
    TABLE_ORDER_UPDATED_BY_SERVANT: 'TABLE_ORDER_UPDATED_BY_SERVANT', // Khi servant cập nhật TableOrder
    TABLE_ORDER_TRANSFERRED_TO_CUSTOMER: 'TABLE_ORDER_TRANSFERRED_TO_CUSTOMER', // Khi servant chuyển TableOrder cho customer
    TABLE_ORDER_CONFIRMED_BY_SERVANT: 'TABLE_ORDER_CONFIRMED_BY_SERVANT', // Khi servant xác nhận TableOrder
    TABLE_ORDER_CANCELLED_BY_SERVANT: 'TABLE_ORDER_CANCELLED_BY_SERVANT', // Khi servant hủy TableOrder
    TABLE_ORDER_COMPLETED_BY_SERVANT: 'TABLE_ORDER_COMPLETED_BY_SERVANT', // Khi servant đánh dấu TableOrder đã hoàn thành
    TABLE_ORDER_ITEM_ADDED_BY_SERVANT: 'TABLE_ORDER_ITEM_ADDED_BY_SERVANT', // Khi servant thêm món vào TableOrder
    TABLE_ORDER_ITEM_REMOVED_BY_SERVANT: 'TABLE_ORDER_ITEM_REMOVED_BY_SERVANT', // Khi servant xóa món khỏi TableOrder
    TABLE_ORDER_TABLE_CHANGED_BY_SERVANT: 'TABLE_ORDER_TABLE_CHANGED_BY_SERVANT', // Khi servant thay đổi bàn cho TableOrder
    TABLE_ORDER_SENT_TO_CHEF: 'TABLE_ORDER_SENT_TO_CHEF', // Khi servant gửi TableOrder cho bếp
    TABLE_ORDER_DELETED_BY_SERVANT: 'TABLE_ORDER_DELETED_BY_SERVANT', // Khi servant xóa TableOrder
    TABLE_ORDER_STATS_UPDATED_BY_SERVANT: 'TABLE_ORDER_STATS_UPDATED_BY_SERVANT', // Khi servant cập nhật thống kê TableOrder
    TABLE_ORDER_ITEM_QUANTITY_UPDATED_BY_SERVANT: 'TABLE_ORDER_ITEM_QUANTITY_UPDATED_BY_SERVANT', // Khi servant cập nhật số lượng món trong TableOrder
    TABLE_ORDER_ITEM_PRICE_UPDATED_BY_SERVANT: 'TABLE_ORDER_ITEM_PRICE_UPDATED_BY_SERVANT', // Khi servant cập nhật giá món trong TableOrder
    TABLE_ORDER_ITEM_COMBO_ADDED_BY_SERVANT: 'TABLE_ORDER_ITEM_COMBO_ADDED_BY_SERVANT', // Khi servant thêm combo vào TableOrder
    TABLE_ORDER_ITEM_COMBO_REMOVED_BY_SERVANT: 'TABLE_ORDER_ITEM_COMBO_REMOVED_BY_SERVANT', // Khi servant xóa combo khỏi TableOrder
    TABLE_ORDER_ITEM_COMBO_QUANTITY_UPDATED_BY_SERVANT: 'TABLE_ORDER_ITEM_COMBO_QUANTITY_UPDATED_BY_SERVANT', // Khi servant cập nhật số lượng combo trong TableOrder
};

module.exports = NOTIFICATION_TYPES; 