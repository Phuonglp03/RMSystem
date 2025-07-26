import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import tableService from '../services/table.service';
import { Spin, Result, Button } from 'antd';

const PaymentCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState(null);
  const [order, setOrder] = useState(null);

  useEffect(() => {
    const transactionCode = searchParams.get('transactionCode');
    if (!transactionCode) {
      setStatus('error');
      setLoading(false);
      return;
    }
    let interval;
    const fetchStatus = async () => {
      setLoading(true);
      try {
        // Sử dụng API mới cho reservation
        const res = await tableService.checkPayosReservationPaymentStatus(transactionCode);
        const data = res.data || res;
        setOrder(data?.reservation || null);
        setStatus(data?.payment?.status || 'error');
      } catch (err) {
        setStatus('error');
      }
      setLoading(false);
    };
    fetchStatus();
    if (status === 'PENDING' || status === null) {
      interval = setInterval(fetchStatus, 3000);
    }
    return () => clearInterval(interval);
    // eslint-disable-next-line
  }, [searchParams, status]);

  useEffect(() => {
    if (status === 'PAID') {
      const timer = setTimeout(() => {
        // Kiểm tra role để quyết định chuyển hướng
        if (user?.role === 'servant') {
          navigate('/servant');
        } else {
          navigate('/');
        }
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [status, navigate, user?.role]);

  if (loading) return <Spin style={{ display: 'block', margin: '100px auto' }} />;

  let resultProps = {
    status: 'info',
    title: 'Đang xử lý thanh toán...',
    subTitle: 'Vui lòng chờ trong giây lát.'
  };
  if (status === 'PAID') {
    resultProps = {
      status: 'success',
      title: 'Thanh toán thành công!',
      subTitle: `Đặt bàn của bạn đã được thanh toán.`,
    };
  } else if (status === 'FAILED' || status === 'CANCELLED') {
    resultProps = {
      status: 'error',
      title: 'Thanh toán thất bại hoặc bị hủy!',
      subTitle: 'Vui lòng thử lại hoặc liên hệ hỗ trợ.',
    };
  } else if (status === 'PENDING') {
    resultProps = {
      status: 'warning',
      title: 'Thanh toán đang chờ xử lý',
      subTitle: 'Vui lòng kiểm tra lại sau ít phút.',
    };
  }

  const handleRedirect = () => {
    if (user?.role === 'servant') {
      navigate('/servant');
    } else {
      navigate('/');
    }
  };

  return (
    <div style={{ maxWidth: 500, margin: '60px auto' }}>
      <Result
        {...resultProps}
        extra={
          <Button type="primary" onClick={handleRedirect}>
            {user?.role === 'servant' ? 'Về trang quản lý bàn' : 'Về trang chủ'}
          </Button>
        }
      />
    </div>
  );
};

export default PaymentCallback; 