import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useShop } from '../context/ShopContext';

const View = ({ img, yaw }) => (
  <div
    style={{
      flex: 1,
      height: '100%',
      backgroundImage: `url(${img})`,
      backgroundRepeat: 'repeat-x',
      backgroundSize: 'cover',
      backgroundPositionX: `${yaw}%`,
      backgroundPositionY: 'center',
      filter: 'brightness(0.95)',
    }}
  />
);

const VR = () => {
  const { id } = useParams();
  const { products } = useShop();
  const product = products.find(p => String(p.id) === String(id));
  const [yaw, setYaw] = useState(0);
  const [split, setSplit] = useState(false);
  const dragRef = useRef({ dragging: false, lastX: 0 });

  useEffect(() => {
    const onOrient = (e) => {
      if (typeof e.alpha === 'number') {
        setYaw((e.alpha / 360) * 100);
      }
    };
    window.addEventListener('deviceorientation', onOrient, true);
    return () => window.removeEventListener('deviceorientation', onOrient, true);
  }, []);

  const onPointerDown = (e) => {
    dragRef.current.dragging = true;
    dragRef.current.lastX = e.clientX || (e.touches?.[0]?.clientX ?? 0);
  };
  const onPointerMove = (e) => {
    if (!dragRef.current.dragging) return;
    const x = e.clientX || (e.touches?.[0]?.clientX ?? 0);
    const dx = x - dragRef.current.lastX;
    dragRef.current.lastX = x;
    setYaw(v => Math.max(0, Math.min(100, v - dx * 0.1)));
  };
  const onPointerUp = () => { dragRef.current.dragging = false; };

  if (!product) {
    return (
      <div className="app-container shop-page-container">
        <h2 className="section-title">VR VIEWER</h2>
        <p style={{ color: '#fff', textAlign: 'center' }}>ไม่พบสินค้า</p>
        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <Link to="/" className="action-btn">กลับหน้าแรก</Link>
        </div>
      </div>
    );
  }

  return (
    <div
      className="vr-container"
      onMouseDown={onPointerDown}
      onMouseMove={onPointerMove}
      onMouseUp={onPointerUp}
      onTouchStart={onPointerDown}
      onTouchMove={onPointerMove}
      onTouchEnd={onPointerUp}
    >
      <div className="vr-header">
        <Link to="/" className="action-btn">HOME</Link>
        <span className="vr-title">{product.name}</span>
        <span className="vr-controls">
          <button
            className="action-btn"
            onClick={() => setSplit(s => !s)}
            title="Toggle Split Screen"
          >
            {split ? 'EXIT VR' : 'ENTER VR'}
          </button>
        </span>
      </div>
      <div style={{ flex: 1, display: 'flex' }}>
        {product.model ? (
          <model-viewer
            src={product.model}
            poster={product.img}
            alt={product.name}
            ar
            ar-modes="webxr scene-viewer quick-look"
            camera-controls
            auto-rotate
            exposure="0.9"
            style={{ width: '100%', height: '100%' }}
          />
        ) : (
          <>
            {split ? (
              <>
                <View img={product.img} yaw={yaw} />
                <View img={product.img} yaw={yaw} />
              </>
            ) : (
              <View img={product.img} yaw={yaw} />
            )}
          </>
        )}
      </div>
      <div style={{ padding: '0.8rem', borderTop: '1px solid #222', display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
        <span style={{ fontSize: '0.9rem', color: '#bbb' }}>
          เคล็ดลับ: หมุนมือถือหรือใช้นิ้วลากเพื่อมองไปรอบๆ
        </span>
        <span style={{ marginLeft: 'auto', fontSize: '0.9rem', color: '#888' }}>
          โหมดนี้ต้องการภาพ 360 เพื่อความสมจริง
        </span>
      </div>
    </div>
  );
};

export default VR;
