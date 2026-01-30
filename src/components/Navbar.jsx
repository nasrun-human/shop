import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, LogOut, Menu, X, MessageSquare } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import './Navbar.css';

const Navbar = () => {
  const { cart, user, logout, products } = useShop();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
  const handleVR = () => {
    const first = products && products.length ? products[0] : null;
    if (first) {
      navigate(`/vr/${first.id}`);
    } else {
      alert('ยังไม่มีสินค้าให้เปิด VR');
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="logo">VOID STREET</Link>

        {/* Desktop Menu */}
        <ul className={`nav-links ${isMenuOpen ? 'active' : ''}`}>
          <li><Link to="/" onClick={() => setIsMenuOpen(false)}>Home</Link></li>
          <li><Link to="/shop" onClick={() => setIsMenuOpen(false)}>Shop</Link></li>
          {user?.role === 'admin' && (
             <li><Link to="/admin" className="admin-link" onClick={() => setIsMenuOpen(false)}>Admin Panel</Link></li>
          )}
        </ul>

        <div className="nav-icons">
          <Link to="/cart" className="icon-link">
            <ShoppingCart size={24} />
            {totalItems > 0 && <span className="cart-badge">{totalItems}</span>}
          </Link>
          
          {user ? (
            <div className="user-menu">
              <Link to="/profile" className="icon-link" title="Profile">
                <User size={24} />
              </Link>
              <Link to="/chat" className="icon-link" title="Chat" style={{ marginLeft: '0.4rem' }}>
                <MessageSquare size={24} />
              </Link>
              <button onClick={handleLogout} className="icon-btn" title="Logout">
                <LogOut size={24} />
              </button>
              <button onClick={handleVR} className="action-btn" title="VR View" style={{ marginLeft: '0.5rem' }}>
                VR
              </button>
            </div>
          ) : (
            <Link to="/login" className="action-btn">LOGIN</Link>
          )}

          <button className="menu-toggle" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
