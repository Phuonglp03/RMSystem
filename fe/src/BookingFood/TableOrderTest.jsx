import React, { useState } from 'react';
import axios from 'axios';

const TableOrderTest = () => {
  const [reservationCode, setReservationCode] = useState('');
  const [reservation, setReservation] = useState(null);
  const [orders, setOrders] = useState([]); // [{ tableId, foods, combos }]
  const [foods, setFoods] = useState([]);
  const [combos, setCombos] = useState([]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState('');

  // Kiểm tra reservationCode và lấy foods, combos
  const handleCheckCode = async () => {
    setChecking(true);
    setError('');
    setReservation(null);
    setOrders([]);
    setResult(null);
    try {
      const [res, foodRes, comboRes] = await Promise.all([
        axios.get(`http://localhost:9999/api/table-orders/reservation/by-code/${reservationCode}`),
        axios.get('http://localhost:9999/api/foods'),
        axios.get('http://localhost:9999/api/combos'),
      ]);
      setReservation(res.data.data);
      setFoods(foodRes.data.data || foodRes.data.foods || []);
      setCombos(comboRes.data.data || comboRes.data.combos || []);
      // Khởi tạo orders cho từng bàn
      setOrders(res.data.data.bookedTable.map(table => ({
        tableId: table._id,
        foods: [{ foodId: '', quantity: 1 }],
        combos: ['']
      })));
    } catch (err) {
      setError(err.response?.data?.message || 'Không tìm thấy reservation');
    }
    setChecking(false);
  };

  const handleFoodChange = (orderIdx, foodIdx, field, value) => {
    const newOrders = [...orders];
    newOrders[orderIdx].foods[foodIdx][field] = value;
    setOrders(newOrders);
  };

  const handleComboChange = (orderIdx, comboIdx, value) => {
    const newOrders = [...orders];
    newOrders[orderIdx].combos[comboIdx] = value;
    setOrders(newOrders);
  };

  const addFood = (orderIdx) => {
    const newOrders = [...orders];
    newOrders[orderIdx].foods.push({ foodId: '', quantity: 1 });
    setOrders(newOrders);
  };

  const addCombo = (orderIdx) => {
    const newOrders = [...orders];
    newOrders[orderIdx].combos.push('');
    setOrders(newOrders);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    try {
      const res = await axios.post('http://localhost:9999/api/table-orders', {
        bookingCode: reservationCode,
        orders: orders.map(order => ({
          tableId: order.tableId,
          foods: order.foods.filter(f => f.foodId).map(f => ({ foodId: f.foodId, quantity: Number(f.quantity) })),
          combos: order.combos.filter(c => c),
          status: 'pending',
        }))
      });
      setResult(res.data);
    } catch (err) {
      setResult(err.response?.data || err.message);
    }
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: 24 }}>
      <h2>Test Đặt Món Ăn Cho Từng Bàn (TableOrder)</h2>
      <div>
        <label>Mã ReservationCode (bookingCode): </label>
        <input value={reservationCode} onChange={e => setReservationCode(e.target.value)} style={{ width: 300 }} />
        <button type="button" onClick={handleCheckCode} disabled={checking || !reservationCode} style={{ marginLeft: 8 }}>
          {checking ? 'Đang kiểm tra...' : 'Kiểm tra'}
        </button>
      </div>
      {error && <div style={{ color: 'red', marginTop: 8 }}>{error}</div>}
      {reservation && (
        <div style={{ marginTop: 16 }}>
          <b>Khách hàng:</b> {reservation.customerId?.fullname || reservation.customerId}
          <br />
          <b>Danh sách bàn đã đặt:</b>
          <ul>
            {reservation.bookedTable.map((table, idx) => (
              <li key={table._id}>
                Bàn số: <b>{table.tableNumber}</b> (ID: {table._id}) - Sức chứa: {table.capacity} - Trạng thái: {table.status}
              </li>
            ))}
          </ul>
        </div>
      )}
      {reservation && orders.length > 0 && foods.length > 0 && combos.length > 0 && (
        <form onSubmit={handleSubmit}>
          <hr />
          {orders.map((order, idx) => (
            <div key={order.tableId} style={{ border: '1px solid #ccc', marginBottom: 16, padding: 12 }}>
              <h4>Bàn số {reservation.bookedTable[idx]?.tableNumber} (ID: {order.tableId})</h4>
              <div>
                <b>Foods:</b>
                {order.foods.map((food, fidx) => (
                  <div key={fidx} style={{ marginLeft: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <label>Chọn món: </label>
                    <select value={food.foodId} onChange={e => handleFoodChange(idx, fidx, 'foodId', e.target.value)} required style={{ width: 220 }}>
                      <option value="">-- Chọn món ăn --</option>
                      {foods.map(f => (
                        <option key={f._id} value={f._id}>
                          {f.name} - {f.price?.toLocaleString()}đ
                        </option>
                      ))}
                    </select>
                    <label> Số lượng: </label>
                    <input type="number" min={1} value={food.quantity} onChange={e => handleFoodChange(idx, fidx, 'quantity', e.target.value)} style={{ width: 60 }} />
                    {food.foodId && (
                      <img src={foods.find(f => f._id === food.foodId)?.images?.[0]} alt="food" style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 4 }} />
                    )}
                  </div>
                ))}
                <button type="button" onClick={() => addFood(idx)}>+ Thêm món</button>
              </div>
              <div style={{ marginTop: 8 }}>
                <b>Combos:</b>
                {order.combos.map((combo, cidx) => (
                  <div key={cidx} style={{ marginLeft: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <label>Chọn combo: </label>
                    <select value={combo} onChange={e => handleComboChange(idx, cidx, e.target.value)} style={{ width: 220 }}>
                      <option value="">-- Chọn combo --</option>
                      {combos.map(c => (
                        <option key={c._id} value={c._id}>
                          {c.name} - {c.price?.toLocaleString()}đ
                        </option>
                      ))}
                    </select>
                    {combo && (
                      <img src={combos.find(c => c._id === combo)?.image} alt="combo" style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 4 }} />
                    )}
                  </div>
                ))}
                <button type="button" onClick={() => addCombo(idx)}>+ Thêm combo</button>
              </div>
            </div>
          ))}
          <button type="submit" disabled={loading}>{loading ? 'Đang gửi...' : 'Gửi đặt món'}</button>
        </form>
      )}
      {result && (
        <div style={{ marginTop: 24 }}>
          <h3>Kết quả:</h3>
          <pre style={{ background: '#f5f5f5', padding: 12 }}>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default TableOrderTest; 