import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import { Trash2, Plus, Minus } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import './Cart.css';

const Cart = () => {
  const { cart, updateCartQuantity, removeFromCart, checkout, user } = useShop();
  const navigate = useNavigate();
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('transfer');
  const [slipFile, setSlipFile] = useState(null);

  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handleCheckout = async () => {
    if (!user) {
      alert('Please login to checkout');
      navigate('/login');
      return;
    }
    let slipUrl = '';
    if (paymentMethod === 'transfer') {
      if (!slipFile) {
        alert('กรุณาอัปโหลดสลิปโอนเงิน');
        return;
      }
      const fd = new FormData();
      fd.append('slip', slipFile);
      const res = await fetch(`/api/upload/slip`, { method: 'POST', body: fd });
      if (res.ok) {
        const data = await res.json();
        slipUrl = data.url;
      } else {
        alert('อัปโหลดสลิปล้มเหลว');
        return;
      }
    }
    const success = await checkout({
      address,
      phone,
      payment_method: paymentMethod,
      slip: slipUrl
    });
    if (success) {
      alert('Order Placed Successfully!');
      navigate('/profile');
    }
  };

  if (cart.length === 0) {
    return (
      <div className="empty-cart">
        <h2>Your Cart is Empty</h2>
        <Link to="/shop" className="action-btn">GO SHOPPING</Link>
      </div>
    );
  }

  return (
    <div className="cart-container">
      <h2 className="section-title">SHOPPING CART</h2>
      <div className="cart-content">
        <div className="cart-items">
          {cart.map((item) => (
            <div key={item.id} className="cart-item">
              <img src={item.img} alt={item.name} className="cart-item-img" />
              <div className="cart-item-details">
                <h3>{item.name}</h3>
                <p className="cart-price">${item.price}</p>
              </div>
              <div className="cart-actions">
                <div className="quantity-controls">
                  <button onClick={() => updateCartQuantity(item.id, -1)} disabled={item.quantity <= 1}><Minus size={16} /></button>
                  <span>{item.quantity}</span>
                  <button onClick={() => updateCartQuantity(item.id, 1)}><Plus size={16} /></button>
                </div>
                <button className="remove-btn" onClick={() => removeFromCart(item.id)}>
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          ))}
        </div>
        
        <div className="cart-summary">
          <h3>ORDER SUMMARY</h3>
          <div className="summary-row">
            <span>Subtotal</span>
            <span>${total}</span>
          </div>
          <div className="summary-row">
            <span>Shipping</span>
            <span>Free</span>
          </div>
          <div className="summary-row total">
            <span>Total</span>
            <span>${total}</span>
          </div>
          
          <div style={{ marginTop: '1rem' }}>
            <input 
              className="input-field"
              placeholder="ที่อยู่จัดส่ง" 
              value={address}
              onChange={e => setAddress(e.target.value)}
              style={{ width: '100%', marginBottom: '0.8rem' }}
            />
            <input 
              className="input-field"
              placeholder="เบอร์โทร" 
              value={phone}
              onChange={e => setPhone(e.target.value)}
              style={{ width: '100%', marginBottom: '0.8rem' }}
            />
            <select 
              className="input-field"
              value={paymentMethod}
              onChange={e => setPaymentMethod(e.target.value)}
              style={{ width: '100%', marginBottom: '0.8rem' }}
            >
              <option value="transfer">โอนเงิน (อัปโหลดสลิป)</option>
              <option value="cod">เก็บเงินปลายทาง (COD)</option>
            </select>
            {paymentMethod === 'transfer' && (
              <input 
                type="file"
                accept="image/*"
                onChange={e => setSlipFile(e.target.files[0] || null)}
                className="input-field"
                style={{ width: '100%', marginBottom: '0.8rem' }}
              />
            )}
          </div>
          <button className="action-btn" onClick={handleCheckout} style={{ width: '100%', marginTop: '1rem' }}>CHECKOUT</button>
        </div>
      </div>
    </div>
  );
};

export default Cart;
