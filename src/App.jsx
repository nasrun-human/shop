import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ShopProvider } from './context/ShopContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Shop from './pages/Shop';
import Cart from './pages/Cart';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Admin from './pages/Admin';
import VR from './pages/VR';
import Chat from './pages/Chat';
import './App.css';

function App() {
  return (
    <ShopProvider>
      <Router>
        <div className="app-container">
          <Navbar />
          <div className="main-content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/shop" element={<Shop />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/vr/:id" element={<VR />} />
              <Route path="/chat" element={<Chat />} />
            </Routes>
          </div>
          
          <footer className="footer">
            <p>&copy; 2026 VOID STREET. All rights reserved.</p>
            <div className="socials">
              <span>IG</span>
              <span>TW</span>
              <span>FB</span>
            </div>
          </footer>
        </div>
      </Router>
    </ShopProvider>
  );
}

export default App;
