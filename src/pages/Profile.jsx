import React, { useState, useEffect } from 'react';
import { useShop } from '../context/ShopContext';
import { Navigate } from 'react-router-dom';
import './Profile.css';

const Profile = () => {
  const { user, orders } = useShop();
  const [qrId, setQrId] = useState(null);
  const [toast, setToast] = useState('');

  const myOrders = user ? orders.filter(order => order.user === user.username) : [];

  useEffect(() => {
    if (!user || !myOrders.length) return;
    const key = `delivered_notified_${user.username}`;
    const notified = JSON.parse(localStorage.getItem(key) || '[]');
    const newlyDelivered = myOrders.filter(o => o.status === 'Delivered' && !notified.includes(o.id));
    if (newlyDelivered.length) {
      const ids = newlyDelivered.map(o => o.id);
      localStorage.setItem(key, JSON.stringify([...notified, ...ids]));
      const msg = `ออเดอร์ ${ids.map(id => `#${id}`).join(', ')} ของคุณถึงแล้ว`;
      setToast(msg);
      (async () => {
        try {
          const reg = await navigator.serviceWorker?.getRegistration();
          if (reg) {
            reg.showNotification('VOID STREET', {
              body: msg,
              icon: '/pwa-192x192.png',
              badge: '/pwa-192x192.png'
            });
          } else if (Notification && Notification.permission === 'granted') {
            new Notification('VOID STREET', { body: msg });
          } else if (Notification && Notification.permission !== 'denied') {
            const perm = await Notification.requestPermission();
            if (perm === 'granted') {
              new Notification('VOID STREET', { body: msg });
            }
          }
        } catch { /* ignore */ }
      })();
      setTimeout(() => setToast(''), 6000);
    }
  }, [user, myOrders]);

  return (
    <div className="profile-container">
      {!user ? (
        <Navigate to="/login" />
      ) : (
        <>
      {toast && (
        <div style={{
          position: 'fixed', left: '50%', transform: 'translateX(-50%)',
          bottom: '1rem', background: '#0a0a0a', color: '#fff',
          border: '1px solid #333', padding: '0.8rem 1rem', borderRadius: '6px', zIndex: 1000
        }}>
          {toast}
        </div>
      )}
      <div className="profile-header">
        <div className="avatar">
          {user.username.charAt(0).toUpperCase()}
        </div>
        <div className="user-info">
          <h2>{user.username}</h2>
          <p>{user.role === 'admin' ? 'Administrator' : 'Streetwear Enthusiast'}</p>
        </div>
      </div>

      <div className="order-history">
        <h3 className="section-title">ORDER HISTORY</h3>
        {myOrders.length === 0 ? (
          <p className="no-orders">No orders yet. Go buy some drip.</p>
        ) : (
          <div className="orders-list">
            {myOrders.map(order => (
              <div key={order.id} className="order-card">
                <div className="order-header">
                  <span>Order #{order.id}</span>
                  <span className="order-date">{order.date}</span>
                </div>
                <div className="order-items">
                  {order.items.map(item => (
                    <div key={item.id} className="order-item-row">
                      <span>{item.name} x {item.quantity}</span>
                      <span>${item.price * item.quantity}</span>
                      <div style={{ marginTop: '0.4rem', display: 'flex', gap: '0.5rem' }}>
                        <a href={`/vr/${item.id}`} className="login-btn">VR VIEW</a>
                        <button className="login-btn" onClick={() => setQrId(item.id)}>QR VR</button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="order-footer">
                  <span className="status paid">{order.status}</span>
                  <span className="total-price">Total: ${order.total}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {qrId !== null && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div style={{ background: '#0a0a0a', border: '1px solid #333', padding: '1rem', width: '320px' }}>
            <h3 className="section-title" style={{ marginBottom: '0.5rem' }}>VR QR</h3>
            <img
              alt="QR"
              width="280"
              height="280"
              src={`https://api.qrserver.com/v1/create-qr-code/?size=280x280&data=${encodeURIComponent(`${window.location.origin}/vr/${qrId}`)}`}
            />
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
              <button
                className="login-btn"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(`${window.location.origin}/vr/${qrId}`);
                    alert('คัดลอกลิงก์ VR แล้ว');
                  } catch {
                    alert('คัดลอกไม่สำเร็จ');
                  }
                }}
              >
                คัดลอกลิงก์
              </button>
              <button className="login-btn" onClick={() => setQrId(null)}>ปิด</button>
            </div>
          </div>
        </div>
      )}
        </>
      )}
    </div>
  );
};

export default Profile;
