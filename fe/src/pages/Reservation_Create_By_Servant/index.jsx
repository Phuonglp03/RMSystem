import React, { useEffect, useState } from 'react';
import reservationService from '../../services/reservation.service';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import './index.css';
import tableService from '../../services/table.service';

const Reservation_Create_By_Servant = () => {
    const [form, setForm] = useState({
        tableIds: [],
        startTime: '',
        endTime: '',
        numberOfPeople: '',
        note: ''
    });
    const [loading, setLoading] = useState(false);
    const [availableTables, setAvailableTables] = useState([])
    const [loadingTables, setLoadingTables] = useState(false)
    const navigate = useNavigate();

    const handleChange = e => {
        setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    };

    const handleTableCheck = (id) => {
        setForm(f => {
            const ids = f.tableIds.includes(id)
                ? f.tableIds.filter(t => t !== id)
                : [...f.tableIds, id];
            return { ...f, tableIds: ids };
        });
    };

    // Khi ngày giờ thay đổi, tự động load bàn trống
    useEffect(() => {
        const loadAvailableTables = async () => {
            if (!form.startTime || !form.endTime) {
                setAvailableTables([])
                return
            }

            setLoadingTables(true)

            try {
                const response = await tableService.getAvailableTableForCreateReservation({
                    startTime: new Date(form.startTime).toISOString(),
                    endTime: new Date(form.endTime).toISOString()
                })
                setAvailableTables(response.tables.filter(t => t.status === 'available'))
            } catch (error) {
                toast.error(error?.message || 'Lỗi tải bàn trống');
            } finally {
                setLoadingTables(false)
            }
        }
        loadAvailableTables()
    }, [form.startTime, form.endTime])

    const handleSubmit = async e => {
        e.preventDefault();
        if (!form.tableIds.length) {
            toast.error('Vui lòng chọn ít nhất 1 bàn!');
            return;
        }
        setLoading(true);
        try {
            const data = {
                bookedTableId: form.tableIds,
                startTime: form.startTime,
                endTime: form.endTime,
                numberOfPeople: Number(form.numberOfPeople),
                note: form.note
            };
            await reservationService.servantCreateReservation(data);
            toast.success('Tạo đơn thành công!');
            setTimeout(() => navigate('/servant/reservation-history'), 1200);
        } catch (err) {
            toast.error('Lỗi khi tạo đơn: ' + (err?.message || err));
        } finally {
            setLoading(false);
        }
    };

    // Hiển thị danh sách bàn dạng card grid
    const renderTableGrid = () => {
        if (loadingTables) {
            return <div className="resv-table-empty">Đang tải danh sách bàn trống...</div>;
        }
        if (!loadingTables && availableTables.length === 0) {
            return <div className="resv-table-empty">Không có bàn trống trong khoảng thời gian này</div>;
        }
        return (
            <div className="resv-table-list">
                {availableTables.map(table => {
                    const selected = form.tableIds.includes(table.id);
                    return (
                        <div
                            key={table.id}
                            className={`resv-table-card${selected ? ' selected' : ''}`}
                            onClick={() => handleTableCheck(table.id)}
                            tabIndex={0}
                            role="button"
                            aria-pressed={selected}
                        >
                            <input
                                type="checkbox"
                                value={table.id}
                                checked={selected}
                                readOnly
                            />
                            <div className="table-number">Bàn số {table.tableNumber}</div>
                            <div className="table-capacity">Sức chứa {table.capacity}</div>
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <div className="resv-create-container">
            <ToastContainer position="top-right" autoClose={2500} />
            <div className="resv-create-card">
                <div className="resv-create-title">Tạo Đơn Đặt Bàn Mới</div>
                <form className="resv-create-form" onSubmit={handleSubmit}>
                    <label>
                        Thời gian bắt đầu:
                        <input name="startTime" type="datetime-local" value={form.startTime} onChange={handleChange} className="resv-create-input" required disabled={loading} />
                    </label>
                    <label>
                        Thời gian kết thúc:
                        <input name="endTime" type="datetime-local" value={form.endTime} onChange={handleChange} className="resv-create-input" required disabled={loading} />
                    </label>
                    <div>
                        <div className='resv-create-label'>Chọn bàn: </div>
                        {renderTableGrid()}
                    </div>
                    <label>
                        Số người:
                        <input name="numberOfPeople" type="number" min="1" value={form.numberOfPeople} onChange={handleChange} className="resv-create-input" required disabled={loading} />
                    </label>
                    <label>
                        Ghi chú:
                        <input name="note" value={form.note} onChange={handleChange} className="resv-create-input" disabled={loading} />
                    </label>
                    <button className="resv-create-btn" type="submit" disabled={loading}>{loading ? 'Đang tạo...' : 'Tạo đơn'}</button>
                </form>
            </div>
        </div>
    );
};

export default Reservation_Create_By_Servant;
