import React, { useEffect, useState } from 'react';
import tableService from '../../services/table.service';
import './index.css';
import { ToastContainer, toast } from 'react-toastify';
import {
    TableOutlined,
    UserOutlined,
    TeamOutlined,
    FileTextOutlined,
    ClockCircleOutlined,
    InfoCircleOutlined,
    CalendarOutlined
} from '@ant-design/icons';

const Assigned_Table_By_Servant = () => {
    const [assignedTables, setAssignedTables] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAssignedTables = async () => {
            try {
                const res = await tableService.getAssignedTableByServant();
                console.log('Assigned Tables:', res);
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
            <h2 className="assigned-title">
                <TableOutlined style={{ marginRight: 8, color: '#2b4c7e' }} />
                Bàn được giao
            </h2>
            {loading ? (
                <p className="assigned-loading">Đang tải dữ liệu...</p>
            ) : assignedTables.length === 0 ? (
                <p className="assigned-empty">Không có bàn nào đang được giao</p>
            ) : (
                <div className="assigned-grid">
                    {assignedTables.map((item, idx) => (
                        <div key={idx} className="assigned-card">
                            <div className="assigned-table-number">
                                <TableOutlined style={{ marginRight: 6, color: '#0e7ccf' }} />
                                Bàn #{item.tableNumber}
                            </div>
                            <div className="assigned-info-row">
                                <TeamOutlined style={{ marginRight: 6 }} />
                                <span>Sức chứa: <b>{item.tableCapacity}</b> người</span>
                            </div>
                            <div className="assigned-info-row">
                                <InfoCircleOutlined style={{ marginRight: 6 }} />
                                <span>Trạng thái bàn: <b>{item.tableStatus}</b></span>
                            </div>
                            <div className="assigned-info-row">
                                <FileTextOutlined style={{ marginRight: 6 }} />
                                <span>Mã đơn: <b>{item.reservationCode || 'N/A'}</b></span>
                            </div>
                            <div className="assigned-info-row">
                                <ClockCircleOutlined style={{ marginRight: 6 }} />
                                <span>Trạng thái đơn: <b>{item.reservationStatus}</b></span>
                            </div>
                            <div className="assigned-info-row">
                                <UserOutlined style={{ marginRight: 6 }} />
                                <span>Số người: <b>{item.numberOfPeople}</b></span>
                            </div>
                            {item.reservationNote && (
                                <div className="assigned-info-row">
                                    <InfoCircleOutlined style={{ marginRight: 6 }} />
                                    <span>Ghi chú: <b>{item.reservationNote}</b></span>
                                </div>
                            )}
                            <div className="assigned-info-row">
                                <CalendarOutlined style={{ marginRight: 6 }} />
                                <span>Thời gian:<br />
                                    <b>{formatDateTime(item.startTime)}</b> → <b>{formatDateTime(item.endTime)}</b>
                                </span>
                            </div>
                            <div className="assigned-customer">
                                <UserOutlined style={{ marginRight: 6 }} />
                                <span>Khách:</span><br />
                                {item.customer ? (
                                    <>
                                        <b>{item.customer.name}</b><br />
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
