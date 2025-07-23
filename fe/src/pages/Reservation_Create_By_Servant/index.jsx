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
        numberOfPeople: '',
        note: '',
        isWalkIn: ''
    });
    const [endTime, setEndTime] = useState('');
    const [loading, setLoading] = useState(false);
    const [availableTables, setAvailableTables] = useState([])
    const [loadingTables, setLoadingTables] = useState(false)
    const navigate = useNavigate();

    const handleChange = e => {
        const { name, value } = e.target;
        setForm(f => {
            const updatedForm = { ...f, [name]: value };
            if (name === 'startTime') {
                const start = new Date(value);
                const calculatedEnd = new Date(start.getTime() + 3 * 60 * 60 * 1000);
                const formattedEnd = formatDateTimeLocal(calculatedEnd); // dùng hàm bên trên
                setEndTime(formattedEnd);
            }
            return updatedForm;
        });
    };

    const formatDateTimeLocal = (date) => {
        const pad = num => num.toString().padStart(2, '0');
        const year = date.getFullYear();
        const month = pad(date.getMonth() + 1);
        const day = pad(date.getDate());
        const hours = pad(date.getHours());
        const minutes = pad(date.getMinutes());
        return `${year}-${month}-${day}T${hours}:${minutes}`;
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
            if (!form.startTime || !endTime) {
                setAvailableTables([])
                return
            }

            setLoadingTables(true)

            try {
                const response = await tableService.getAvailableTableForCreateReservation({
                    startTime: form.startTime,
                    endTime
                })
                setAvailableTables(response.tables.filter(t => t.status === 'available'))
            } catch (error) {
                toast.error(error?.message || 'Lỗi tải bàn trống');
            } finally {
                setLoadingTables(false)
            }
        }
        loadAvailableTables()
    }, [form.startTime, endTime])

    const handleSubmit = async e => {
        e.preventDefault();
        if (!form.tableIds.length) {
            toast.error('Vui lòng chọn ít nhất 1 bàn!');
            return;
        }
        if (form.isWalkIn === '') return toast.error('Vui lòng chọn loại đơn!');
        if (!form.startTime) return toast.error('Vui lòng chọn thời gian bắt đầu');
        setLoading(true);
        try {
            const data = {
                bookedTableId: form.tableIds,
                startTime: form.startTime,
                endTime,
                numberOfPeople: Number(form.numberOfPeople),
                note: form.note,
                isWalkIn: form.isWalkIn === 'true' //convert string to boolean
            };
            console.log('Creating reservation with data:', data);
            const response = await reservationService.servantCreateReservation(data);
            console.log('Reservation created:', response);
            toast.success('Tạo đơn thành công!');
            if (form.isWalkIn === 'true') {
                // Chuyển ngay sang trang tạo order, truyền reservationCode qua url
                navigate(`/servant/table-order-create?code=${response.reservationCode}`);
            } else {
                setTimeout(() => navigate('/servant/reservation-history'), 1200);
            }
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
                        Loại đơn:
                        <select
                            name="isWalkIn"
                            value={form.isWalkIn}
                            onChange={handleChange}
                            className="resv-create-input"
                            required
                            disabled={loading}
                        >
                            <option value="">-- Chọn loại đơn --</option>
                            <option value="true">Khách dùng ngay</option>
                            <option value="false">Khách đặt trước</option>
                        </select>
                    </label>
                    <label>
                        Thời gian bắt đầu:
                        <input name="startTime" type="datetime-local" value={form.startTime} onChange={handleChange} className="resv-create-input" required disabled={loading} />
                    </label>
                    <label>
                        Kết thúc (tự động sau 3 giờ):
                        {/* <input
                            type="datetime-local"
                            value={endTime ? new Date(endTime).toISOString().slice(0, 16) : ''}
                            className="resv-create-input"
                            readOnly
                            disabled
                        /> */}
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
