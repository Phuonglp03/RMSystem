import React, { useState, useEffect } from 'react';
import reservationService from '../../services/reservation.service';
import { useNavigate } from 'react-router-dom';
import './index.css';

const statusMap = {
  pending: { label: 'Chờ nhận', color: '#faad14', bg: '#fffbe6' },
  confirmed: { label: 'Đã nhận', color: '#52c41a', bg: '#f6ffed' },
  cancelled: { label: 'Đã hủy', color: '#ff4d4f', bg: '#fff1f0' },
};

const Reservation_History = () => {
  const [activeTab, setActiveTab] = useState('unassigned');
  const [unassignedReservations, setUnassignedReservations] = useState([]);
  const [assignedReservations, setAssignedReservations] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        if (activeTab === 'unassigned') {
          const res = await reservationService.getUnAssignedReservations();
          setUnassignedReservations(res.reservations || []);
        } else {
          const res = await reservationService.getCustomerReservationByServant();
          setAssignedReservations(res.reservations || []);
        }
      } catch (err) {
        // Optionally use toast here
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [activeTab]);

  const handleAction = async (reservationId, action) => {
    // Optionally implement accept/reject here
  };

  const handleViewDetail = (reservationId) => {
    navigate(`/servant/reservation-detail/${reservationId}`);
  };

  const renderStatus = (status) => {
    const s = statusMap[status] || { label: status, color: '#888', bg: '#f5f5f5' };
    return (
      <span className="resv-his-status" style={{ color: s.color, background: s.bg }}>{s.label}</span>
    );
  };

  const renderCard = (resv) => (
    <div
      key={resv._id || resv.reservationId}
      className="resv-his-card"
      onClick={() => handleViewDetail(resv._id || resv.reservationId)}
    >
      <div className="resv-his-card-row">
        <div className="resv-his-customer">{resv.customer?.fullname || resv.customer?.name}</div>
        {renderStatus(resv.status)}
      </div>
      <div className="resv-his-info">
        <span>Thời gian: <b>{resv.startTime || resv.bookingTime}</b></span>
        <span>Số người: <b>{resv.numberOfPeople}</b></span>
      </div>
      <div className="resv-his-actions">
        {activeTab === 'unassigned' && (
          <>
            <button className="resv-his-btn accept" onClick={e => { e.stopPropagation(); handleAction(resv._id, 'confirmed'); }}>Nhận đơn</button>
            <button className="resv-his-btn reject" onClick={e => { e.stopPropagation(); handleAction(resv._id, 'cancelled'); }}>Từ chối</button>
          </>
        )}
        <button className="resv-his-btn detail" onClick={e => { e.stopPropagation(); handleViewDetail(resv._id || resv.reservationId); }}>Xem chi tiết</button>
      </div>
    </div>
  );

  return (
    <div className="resv-his-container">
      <div className="resv-his-title">Lịch sử Đặt Bàn</div>
      <div className="resv-his-tabs">
        <button className={activeTab === 'unassigned' ? 'active' : ''} onClick={() => setActiveTab('unassigned')}>Đơn chưa nhận</button>
        <button className={activeTab === 'assigned' ? 'active' : ''} onClick={() => setActiveTab('assigned')}>Đơn đã nhận</button>
      </div>
      <div className="resv-his-list">
        {loading ? (
          <div className="resv-his-loading">Đang tải...</div>
        ) : activeTab === 'unassigned' ? (
          unassignedReservations.length === 0 ? <div className="resv-his-empty">Không có đơn nào</div> : unassignedReservations.map(renderCard)
        ) : (
          assignedReservations.length === 0 ? <div className="resv-his-empty">Không có đơn nào</div> : assignedReservations.map(renderCard)
        )}
      </div>
    </div>
  );
};

export default Reservation_History;
