import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import reservationService from '../../services/reservation.service';
import { ToastContainer, toast } from 'react-toastify';
import './index.css';

const Reservation_Detail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [reservation, setReservation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({});
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const fetchDetail = async () => {
      setLoading(true);
      try {
        const res = await reservationService.getReservationDetailById(id);
        setReservation(res.reservation?.reservationId ? res.reservation : res.reservation || null);
        setForm({
          note: res.reservation?.note || '',
          numberOfPeople: res.reservation?.numberOfPeople || '',
          startTime: res.reservation?.startTime || '',
          endTime: res.reservation?.endTime || '',
          status: res.reservation?.status || '',
        });
      } catch (err) {
        toast.error('Không thể tải chi tiết đơn: ' + (err?.message || err));
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
    // eslint-disable-next-line
  }, [id]);

  const handleAccept = async () => {
    setActionLoading(true);
    try {
      await reservationService.confirmOrRejectReservation(id, 'confirm');
      toast.success('Bạn đã nhận đơn này!');
      setTimeout(() => window.location.reload(), 1200);
    } catch (err) {
      toast.error('Lỗi khi nhận đơn: ' + (err?.message || err));
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    setActionLoading(true);
    try {
      await reservationService.confirmOrRejectReservation(id, 'reject');
      toast.success('Bạn đã từ chối đơn này!');
      setTimeout(() => navigate(-1), 1200);
    } catch (err) {
      toast.error('Lỗi khi từ chối đơn: ' + (err?.message || err));
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Bạn chắc chắn muốn xóa đơn này?')) return;
    setActionLoading(true);
    try {
      await reservationService.servantDeleteReservation(id);
      toast.success('Đã xóa đơn!');
      setTimeout(() => navigate(-1), 1200);
    } catch (err) {
      toast.error('Lỗi khi xóa đơn: ' + (err?.message || err));
    } finally {
      setActionLoading(false);
    }
  };

  const handleEdit = () => setEditMode(true);
  const handleCancelEdit = () => setEditMode(false);

  const handleChange = e => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleUpdate = async e => {
    e.preventDefault();
    setActionLoading(true);
    try {
      await reservationService.servantUpdateReservation(id, form);
      toast.success('Cập nhật thành công!');
      setEditMode(false);
      setTimeout(() => window.location.reload(), 1200);
    } catch (err) {
      toast.error('Lỗi khi cập nhật: ' + (err?.message || err));
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="resv-detail-container">
      <ToastContainer position="top-right" autoClose={2500} />
      {loading ? (
        <div className="resv-detail-loading">Đang tải chi tiết...</div>
      ) : !reservation ? (
        <div className="resv-detail-error">Không tìm thấy đơn đặt bàn!</div>
      ) : (
        <div className="resv-detail-card">
          <div className="resv-detail-header">
            <span className="resv-detail-title">Chi tiết Đặt Bàn</span>
            <span className={`resv-detail-status status-${reservation.status}`}>{reservation.status}</span>
          </div>
          <div className="resv-detail-section">
            <div><b>Mã đơn:</b> {reservation.reservationCode || 'Mã Code'}</div>
            <div><b>Khách:</b> {reservation.customer?.fullname || 'Đây là đơn do Servant tạo'}</div>
            <div><b>Số điện thoại:</b> {reservation.customer?.phone || 'Ẩn danh'}</div>
            <div><b>Bàn số</b> {(reservation.table || []).map(t => t.tableNumber || t.number).join(', bàn số ')}</div>
            <div><b>Số người:</b> {editMode ? <input name="numberOfPeople" value={form.numberOfPeople} onChange={handleChange} className="resv-detail-input" /> : reservation.numberOfPeople}</div>
            <div><b>Thời gian:</b> {
              editMode ? <>
                <input name="startTime" value={form.startTime} onChange={handleChange} className="resv-detail-input" placeholder="Bắt đầu" /> -
                <input name="endTime" value={form.endTime} onChange={handleChange} className="resv-detail-input" placeholder="Kết thúc" />
              </> : `${new Date(reservation.startTime).toLocaleString('vi-VN')} - ${new Date(reservation.endTime).toLocaleString('vi-VN')}`
            }</div>
            <div><b>Ghi chú:</b> {editMode ? <input name="note" value={form.note} onChange={handleChange} className="resv-detail-input" /> : reservation.note || '(Không có)'}</div>
            <div><b>Trạng thái:</b> {editMode ? <select name="status" value={form.status} onChange={handleChange} className="resv-detail-input">
              <option value="pending">Chờ nhận</option>
              <option value="confirmed">Đã nhận</option>
              <option value="cancelled">Đã hủy</option>
              <option value="completed">Hoàn thành</option>
              <option value="no-show">Không đến</option>
            </select> : reservation.status}</div>
          </div>
          <div className="resv-detail-actions">
            {reservation.status === 'pending' ? (
              <>
                <button className="resv-btn accept" onClick={handleAccept} disabled={actionLoading}>Nhận đơn</button>
                <button className="resv-btn reject" onClick={handleReject} disabled={actionLoading}>Từ chối</button>
              </>
            ) : editMode ? (
              <>
                <button className="resv-btn save" onClick={handleUpdate} disabled={actionLoading}>Lưu</button>
                <button className="resv-btn cancel" onClick={handleCancelEdit} disabled={actionLoading}>Hủy</button>
              </>
            ) : (
              <>
                <button className="resv-btn edit" onClick={handleEdit} disabled={actionLoading}>Chỉnh sửa</button>
                <button className="resv-btn delete" onClick={handleDelete} disabled={actionLoading}>Xóa</button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Reservation_Detail;
