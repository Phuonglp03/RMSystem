import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import tableService from '../services/table.service';
import { Spin, Result, Button } from 'antd';

const PaymentCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState(null);
  const [order, setOrder] = useState(null);

  const fetchStatus = useCallback(async (transactionCode) => {
    setLoading(true);
    try {
      console.log('[FE] Gọi API checkPayosPaymentStatus với transactionCode:', transactionCode);
      const res = await tableService.checkPayosPaymentStatus(transactionCode);
      console.log('[FE] Nhận response checkPayosPaymentStatus:', res);
      
      // res đã là data do axios interceptor, không cần .data nữa
      const data = res;
      setOrder(data?.order || null);
      const newStatus = data?.payment?.status || 'error';
      setStatus(newStatus);
      return newStatus;
    } catch (err) {
      console.error('[FE] Lỗi khi checkPayosPaymentStatus:', err);
      setStatus('error');
      return 'error';
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const transactionCode = searchParams.get('transactionCode');
    if (!transactionCode) {
      setStatus('error');
      setLoading(false);
      return;
    }

    let interval;
    
    const checkStatus = async () => {
      const currentStatus = await fetchStatus(transactionCode);
      
      // Chỉ set interval nếu status vẫn là PENDING
      if (currentStatus === 'PENDING') {
        interval = setInterval(async () => {
          const updatedStatus = await fetchStatus(transactionCode);
          if (updatedStatus !== 'PENDING') {
            clearInterval(interval);
          }
        }, 3000);
      }
    };

    checkStatus();

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [searchParams, fetchStatus]);

  useEffect(() => {
    if (status === 'PAID') {
      const timer = setTimeout(() => {
        navigate('/');
      }, 2000); // 2 giây
      return () => clearTimeout(timer);
    }
  }, [status, navigate]);

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
      subTitle: `Đơn hàng của bạn đã được thanh toán. Mã đơn: ${order?.id}`,
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

  return (
    <div style={{ maxWidth: 500, margin: '60px auto' }}>
      <Result
        {...resultProps}
        extra={
          <Button type="primary" onClick={() => navigate(`/table-order/${order?.id || ''}`)}>
            Xem chi tiết đơn hàng
          </Button>
        }
      />
    </div>
  );
};

export default PaymentCallback; 