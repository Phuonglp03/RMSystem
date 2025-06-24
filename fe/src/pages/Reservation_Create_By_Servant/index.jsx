import React, { useState } from 'react';
import reservationService from '../../services/reservation.service';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import './index.css';

const Reservation_Create_By_Servant = () => {
    const [form, setForm] = useState({
        tableIds: '',
        startTime: '',
        endTime: '',
        numberOfPeople: '',
        note: ''
    });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = e => {
        setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async e => {
        e.preventDefault();
        setLoading(true);
        try {
            const data = {
                bookedTableId: form.tableIds.split(',').map(s => s.trim()),
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

    return (
        <div className="resv-create-container">
            <ToastContainer position="top-right" autoClose={2500} />
            <div className="resv-create-card">
                <div className="resv-create-title">Tạo Đơn Đặt Bàn Mới</div>
                <form className="resv-create-form" onSubmit={handleSubmit}>
                    <label>
                        Bàn (ID, cách nhau dấu phẩy):
                        <input name="tableIds" value={form.tableIds} onChange={handleChange} className="resv-create-input" required disabled={loading} />
                    </label>
                    <label>
                        Thời gian bắt đầu:
                        <input name="startTime" type="datetime-local" value={form.startTime} onChange={handleChange} className="resv-create-input" required disabled={loading} />
                    </label>
                    <label>
                        Thời gian kết thúc:
                        <input name="endTime" type="datetime-local" value={form.endTime} onChange={handleChange} className="resv-create-input" required disabled={loading} />
                    </label>
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
