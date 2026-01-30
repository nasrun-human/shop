import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import { Navigate } from 'react-router-dom';
import './Admin.css';

const Admin = () => {
  const { user, products, orders, updateStock, addProduct, updateOrderStatus, deleteProduct } = useShop();
  const [newProduct, setNewProduct] = useState({ name: '', price: '', stock: '', img: '', category: '', model: '' });
  const API_BASE = `/api`;
  const [mobileURL, setMobileURL] = useState(() => window.location.origin);
  const [aiQ, setAiQ] = useState('');
  const [aiA, setAiA] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [qrProduct, setQrProduct] = useState(null);

  if (!user || user.role !== 'admin') {
    return <Navigate to="/" />;
  }

  const totalSales = orders.reduce((sum, order) => sum + order.total, 0);
  const totalOrders = orders.length;

  const handleAddProduct = (e) => {
    e.preventDefault();
    if (newProduct.name && newProduct.price) {
      addProduct({
        ...newProduct,
        price: Number(newProduct.price),
        stock: Number(newProduct.stock),
        img: newProduct.img || 'https://placehold.co/400x500/111/39ff14?text=New+Item'
      });
      setNewProduct({ name: '', price: '', stock: '', img: '', category: '' });
      alert('Product Added');
    }
  };

  return (
    <div className="admin-container">
      <h2 className="section-title">ADMIN DASHBOARD</h2>
      
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Sales</h3>
          <p>${totalSales.toLocaleString()}</p>
        </div>
        <div className="stat-card">
          <h3>Total Orders</h3>
          <p>{totalOrders}</p>
        </div>
        <div className="stat-card">
          <h3>Total Products</h3>
          <p>{products.length}</p>
        </div>
      </div>

      <div className="admin-section">
        <h3>INVENTORY MANAGEMENT</h3>
        <div style={{ marginBottom: '0.8rem', display: 'flex', gap: '0.5rem' }}>
          <button
            className="action-btn"
            onClick={async () => {
              const ok = window.confirm('ลบสินค้าตัวอย่างทั้งหมด (hoodie, tee, cargo ฯลฯ)?');
              if (!ok) return;
              const res = await fetch(`/api/products/clear-samples`, { method: 'POST' });
              if (res.ok) {
                alert('ลบสินค้าตัวอย่างแล้ว');
                window.location.reload();
              } else {
                alert('ลบไม่สำเร็จ');
              }
            }}
          >
            CLEAR SAMPLE PRODUCTS
          </button>
        </div>
        <div className="inventory-table-container">
          <table className="inventory-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Product</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map(product => (
                <tr key={product.id}>
                  <td>{product.id}</td>
                  <td>
                    <div className="product-cell">
                      <img src={product.img} alt="" width="30" />
                      {product.name}
                    </div>
                  </td>
                  <td>${product.price}</td>
                  <td>
                    <span className={product.stock < 5 ? 'low-stock' : ''}>{product.stock}</span>
                  </td>
                  <td>
                    <div className="stock-controls">
                      <button onClick={() => updateStock(product.id, product.stock - 1)}>-</button>
                      <button onClick={() => updateStock(product.id, product.stock + 1)}>+</button>
                      <button onClick={() => setQrProduct(product)} style={{ marginLeft: '0.5rem' }}>VR QR</button>
                      <button
                        onClick={async () => {
                          const ok = window.confirm(`ลบสินค้า ${product.name}?`);
                          if (ok) {
                            await deleteProduct(product.id);
                            alert('ลบสินค้าแล้ว');
                          }
                        }}
                        style={{ marginLeft: '0.5rem', background: '#300', color: '#fff', border: '1px solid #500' }}
                      >
                        DELETE
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="admin-section">
        <h3>MOBILE ACCESS</h3>
        <p>ให้ลูกค้าหรือเพื่อนเปิดจากมือถือโดยสแกนคิวอาร์นี้</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <div>
            <img
              alt="QR"
              width="180"
              height="180"
              src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(mobileURL)}`}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1, minWidth: '280px' }}>
            <input
              className="input-field"
              placeholder="ลิงก์สำหรับมือถือ (เช่น https://your-public-url)"
              value={mobileURL}
              onChange={e => setMobileURL(e.target.value)}
            />
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                className="action-btn"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(mobileURL);
                    alert('คัดลอกลิงก์แล้ว');
                  } catch {
                    alert('คัดลอกไม่สำเร็จ');
                  }
                }}
              >
                คัดลอกลิงก์
              </button>
              <button
                className="action-btn"
                onClick={async () => {
                  if (navigator.share) {
                    try {
                      await navigator.share({ title: 'VOID STREET', url: mobileURL });
                    } catch { /* ignore */ }
                  } else {
                    alert('เบราว์เซอร์นี้ไม่รองรับ Web Share API');
                  }
                }}
              >
                แชร์ลิงก์
              </button>
            </div>
          </div>
        </div>
      </div>

      {qrProduct && (
        <div className="inventory-table-container" style={{ marginTop: '0.5rem' }}>
          <h3>VR QR สำหรับ: {qrProduct.name}</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <div>
              <img
                alt="QR"
                width="180"
                height="180"
                src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(`${mobileURL.replace(/\/$/, '')}/vr/${qrProduct.id}`)}`}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ color: '#bbb', fontSize: '0.85rem' }}>{`${mobileURL.replace(/\/$/, '')}/vr/${qrProduct.id}`}</div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  className="action-btn"
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(`${mobileURL.replace(/\/$/, '')}/vr/${qrProduct.id}`);
                      alert('คัดลอกลิงก์ VR แล้ว');
                    } catch {
                      alert('คัดลอกไม่สำเร็จ');
                    }
                  }}
                >
                  คัดลอกลิงก์
                </button>
                <button
                  className="checkout-btn"
                  onClick={async () => {
                    if (navigator.share) {
                      try {
                        await navigator.share({ title: 'VOID STREET VR', url: `${mobileURL.replace(/\/$/, '')}/vr/${qrProduct.id}` });
                      } catch { /* ignore */ }
                    } else {
                      alert('เบราว์เซอร์นี้ไม่รองรับ Web Share API');
                    }
                  }}
                >
                  แชร์ลิงก์
                </button>
                <button className="checkout-btn" onClick={() => setQrProduct(null)}>ปิด</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="admin-section">
        <h3>ORDERS MANAGEMENT</h3>
        {orders.length === 0 ? (
          <p>ยังไม่มีออเดอร์</p>
        ) : (
          <div className="inventory-table-container">
            <table className="inventory-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>User</th>
                  <th>Date</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(order => (
                  <tr key={order.id}>
                    <td>{order.id}</td>
                    <td>{order.user_id}</td>
                    <td>{order.date}</td>
                    <td>${order.total}</td>
                    <td>{order.status}</td>
                    <td>
                      <div className="stock-controls">
                        <button
                          onClick={async () => {
                            const ok = await updateOrderStatus(order.id, 'Confirmed');
                            if (ok) alert(`ยืนยันออเดอร์ #${order.id} แล้ว`);
                            else alert('อัปเดตสถานะไม่สำเร็จ');
                          }}
                          disabled={order.status === 'Confirmed'}
                        >
                          ยืนยัน
                        </button>
                        <button
                          style={{ marginLeft: '0.5rem' }}
                          onClick={async () => {
                            const ok = await updateOrderStatus(order.id, 'Delivered');
                            if (ok) alert(`แจ้งลูกค้า ออเดอร์ #${order.id} ถึงแล้ว`);
                            else alert('อัปเดตสถานะไม่สำเร็จ');
                          }}
                          disabled={order.status === 'Delivered'}
                        >
                          แจ้งลูกค้า: ถึงแล้ว
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="admin-section">
        <h3>AI ASSISTANT (Auto Support)</h3>
        <p>ถามข้อมูลสินค้า วิธีสั่งซื้อ หรือคำถามทั่วไป</p>
        <textarea
          placeholder="พิมพ์คำถามของคุณที่นี่..."
          value={aiQ}
          onChange={e => setAiQ(e.target.value)}
          style={{ width: '100%', minHeight: '100px', padding: '0.8rem', background: '#1a1a1a', color: '#fff', border: '1px solid #333', marginTop: '0.5rem' }}
        />
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
          <button
            className="checkout-btn"
            disabled={aiLoading || !aiQ.trim()}
            onClick={async () => {
              setAiLoading(true);
              setAiA('');
              try {
                const res = await fetch(`${API_BASE}/ai/chat`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ question: aiQ })
                });
                const data = await res.json();
                setAiA(data?.text || 'ตอบไม่ได้');
              } catch {
                setAiA('เกิดข้อผิดพลาด ลองใหม่อีกครั้ง');
              } finally {
                setAiLoading(false);
              }
            }}
          >
            {aiLoading ? 'กำลังถาม...' : 'ถาม AI'}
          </button>
          <button
            className="checkout-btn"
            onClick={() => {
              setAiQ('');
              setAiA('');
            }}
          >
            ล้างข้อความ
          </button>
        </div>
        {aiA && (
          <div className="inventory-table-container" style={{ marginTop: '0.8rem' }}>
            <div style={{ whiteSpace: 'pre-wrap', background: '#111', color: '#fff', padding: '1rem', border: '1px solid #333' }}>
              {aiA}
            </div>
          </div>
        )}
      </div>

      <div className="admin-section">
        <h3>ADD NEW PRODUCT</h3>
        <form className="add-product-form" onSubmit={handleAddProduct}>
          <input 
            placeholder="Product Name" 
            value={newProduct.name}
            onChange={e => setNewProduct({...newProduct, name: e.target.value})}
          />
          <input 
            placeholder="Price" 
            type="number"
            value={newProduct.price}
            onChange={e => setNewProduct({...newProduct, price: e.target.value})}
          />
          <input 
            placeholder="Stock" 
            type="number"
            value={newProduct.stock}
            onChange={e => setNewProduct({...newProduct, stock: e.target.value})}
          />
          <input 
            placeholder="Image URL (Optional)" 
            value={newProduct.img}
            onChange={e => setNewProduct({...newProduct, img: e.target.value})}
          />
          <input 
            placeholder="Model URL (GLB/USDZ - Optional)" 
            value={newProduct.model}
            onChange={e => setNewProduct({...newProduct, model: e.target.value})}
          />
          <input 
            type="file"
            accept="image/*"
            onChange={async e => {
              const file = e.target.files?.[0];
              if (!file) return;
              const fd = new FormData();
              fd.append('image', file);
              const res = await fetch(`${API_BASE}/upload/product`, { method: 'POST', body: fd });
              if (res.ok) {
                const data = await res.json();
                setNewProduct({...newProduct, img: `${data.url}`});
                alert('Uploaded product image');
              } else {
                alert('Upload failed');
              }
            }}
          />
          <input 
            type="file"
            accept=".glb,.usdz,model/*"
            onChange={async e => {
              const file = e.target.files?.[0];
              if (!file) return;
              const fd = new FormData();
              fd.append('model', file);
              const res = await fetch(`${API_BASE}/upload/model`, { method: 'POST', body: fd });
              if (res.ok) {
                const data = await res.json();
                setNewProduct({...newProduct, model: `${data.url}`});
                alert('Uploaded 3D model');
              } else {
                alert('Upload failed');
              }
            }}
          />
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              type="button"
              onClick={async () => {
                  const res = await fetch(`${API_BASE}/images`);
                if (res.ok) {
                  const list = await res.json();
                  if (list.length === 0) {
                    alert('ยังไม่มีรูปในโฟลเดอร์ images ของ server');
                    return;
                  }
                  const pick = prompt('พิมพ์ชื่อไฟล์ที่ต้องการ:\n' + list.join('\n'));
                  if (pick && list.includes(pick)) {
                        setNewProduct({...newProduct, img: `/images/${pick}`});
                  }
                } else {
                  alert('ดึงรายการรูปไม่สำเร็จ');
                }
              }}
            >
              เลือกจากโฟลเดอร์ภาพ (server/images)
            </button>
          </div>
          <input 
            placeholder="Category (เช่น TOPS / BOTTOMS)" 
            value={newProduct.category}
            onChange={e => setNewProduct({...newProduct, category: e.target.value})}
          />
          <button type="submit">ADD PRODUCT</button>
        </form>
      </div>
    </div>
  );
};

export default Admin;
