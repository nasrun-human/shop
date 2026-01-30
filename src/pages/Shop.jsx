import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useShop } from '../context/ShopContext';
import '../App.css';

const Shop = () => {
  const { products, addToCart } = useShop();
  const navigate = useNavigate();
  const [qrId, setQrId] = useState(null);
  const [q, setQ] = useState('');
  const [category, setCategory] = useState('');
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetch('/api/categories')
      .then(r => r.json())
      .then(setCategories)
      .catch(() => setCategories([]));
  }, []);

  const filtered = products.filter(p => {
    const matchQ = q ? p.name.toLowerCase().includes(q.toLowerCase()) : true;
    const matchCat = category ? (p.category === category) : true;
    return matchQ && matchCat;
  });

  return (
    <div className="app-container" style={{ paddingTop: '2rem' }}>
      <h2 className="section-title">ALL COLLECTIONS</h2>
      
      <div className="shop-filters">
        <input 
          className="search-input"
          placeholder="ค้นหาสินค้า..."
          value={q}
          onChange={e => setQ(e.target.value)}
        />
        <select 
          className="category-select"
          value={category}
          onChange={e => setCategory(e.target.value)}
        >
          <option value="">ทุกหมวดหมู่</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      <div className="product-grid">
        {filtered.map((product) => (
          <div key={product.id} className="product-card">
            <div className="product-image-container">
              <img src={product.img} alt={product.name} className="product-image" />
              {product.stock === 0 && (
                <div className="out-of-stock-overlay">SOLD OUT</div>
              )}
              <div className="overlay">
                <button 
                  className="view-btn" 
                  onClick={() => addToCart(product)}
                  disabled={product.stock === 0}
                >
                  {product.stock > 0 ? 'ADD TO CART' : 'OUT OF STOCK'}
                </button>
                <button 
                  className="view-btn vr-btn" 
                  onClick={() => navigate(`/vr/${product.id}`)}
                >
                  VR VIEW
                </button>
                <button 
                  className="view-btn qr-btn" 
                  onClick={() => setQrId(product.id)}
                >
                  QR VR
                </button>
              </div>
            </div>
            <div className="product-info">
              <h3>{product.name}</h3>
              <div className="product-meta">
                 <p className="price">${product.price}</p>
                 <span className="stock-status" style={{ color: product.stock < 5 ? 'red' : '#888' }}>
                   {product.stock} items left
                 </span>
              </div>
              {product.category && (
                <div className="product-category">
                  หมวด: {product.category}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      
      {qrId !== null && (
        <div className="qr-modal-overlay" onClick={() => setQrId(null)}>
          <div className="qr-modal-content" onClick={e => e.stopPropagation()}>
            <img 
              src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${window.location.origin}/vr/${qrId}`} 
              alt="QR Code"
              className="qr-code-img"
            />
            <p>Scan to view in VR on mobile</p>
            <div className="qr-actions">
              <button 
                className="action-btn" 
                onClick={async () => {
                   try {
                     await navigator.clipboard.writeText(`${window.location.origin}/vr/${qrId}`);
                     alert('Link copied!');
                   } catch {
                     alert('Failed to copy');
                   }
                }}
              >
                COPY LINK
              </button>
              <button className="action-btn" onClick={() => setQrId(null)}>CLOSE</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Shop;
