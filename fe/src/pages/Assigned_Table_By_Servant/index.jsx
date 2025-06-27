import React, { useEffect, useState } from 'react';
import tableService from '../../services/table.service';
import './index.css';
import { ToastContainer, toast } from 'react-toastify';

const Assigned_Table_By_Servant = () => {
    const [assignedTables, setAssignedTables] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAssignedTables = async () => {
            try {
                const res = await tableService.getAssignedTableByServant();
                setAssignedTables(res.assignedTables);
            } catch (err) {
                toast.error('Lỗi khi tải danh sách bàn');
            } finally {
                setLoading(false);
            }
        };
        fetchAssignedTables();
    }, []);

    const formatDateTime = (isoStr) => {
        const d = new Date(isoStr);
        return d.toLocaleString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        });
    };

    return (
        <div className="assigned-container">
            <ToastContainer />
            <h2 className="assigned-title">🪑 Bàn đã được giao</h2>
            {loading ? (
                <p className="assigned-loading">Đang tải dữ liệu...</p>
            ) : assignedTables.length === 0 ? (
                <p className="assigned-empty">Không có bàn nào đang được giao</p>
            ) : (
                <div className="assigned-grid">
                    {assignedTables.map((item, idx) => (
                        <div key={idx} className="assigned-card">
                            <h3 className="assigned-table-number">Bàn #{item.tableNumber}</h3>
                            <p><strong>Sức chứa:</strong> {item.tableCapacity} người</p>
                            <p><strong>Trạng thái bàn:</strong> {item.tableStatus}</p>
                            <p><strong>📝 Mã đơn:</strong> {item.reservationCode || 'N/A'}</p>
                            <p><strong>⏱ Trạng thái đơn:</strong> {item.reservationStatus}</p>
                            <p><strong>👥 Số người:</strong> {item.numberOfPeople}</p>
                            {item.reservationNote && <p><strong>🗒 Ghi chú:</strong> {item.reservationNote}</p>}
                            <p><strong>📅 Thời gian:</strong><br /> {formatDateTime(item.startTime)} → {formatDateTime(item.endTime)}</p>
                            <div className="assigned-customer">
                                <strong>👤 Khách:</strong><br />
                                {item.customer ? (
                                    <>
                                        {item.customer.name}<br />
                                        {item.customer.phone}<br />
                                        {item.customer.email}
                                    </>
                                ) : 'Chưa xác định'}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Assigned_Table_By_Servant;
