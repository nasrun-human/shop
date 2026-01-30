import React from 'react';
import { Link } from 'react-router-dom';
import Banner from '../components/Banner';
import { useShop } from '../context/ShopContext';
import '../App.css'; // Reuse existing styles

const Home = () => {
  const { products, addToCart } = useShop();
  // Show only first 3 products
  const featuredProducts = products.slice(0, 3);

  return (
    <div>
      <Banner />
      
      <section className="shop-section">
        <h2 className="section-title">TRENDING NOW</h2>
        <div className="product-grid">
          {featuredProducts.map((product) => (
            <div key={product.id} className="product-card">
              <div className="product-image-container">
                <img src={product.img} alt={product.name} className="product-image" />
                <div className="overlay">
                  <button className="view-btn" onClick={() => addToCart(product)}>ADD TO CART</button>
                </div>
              </div>
              <div className="product-info">
                <h3>{product.name}</h3>
                <p className="price">${product.price}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="home-action-container">
          <Link to="/shop" className="action-btn btn-lg">VIEW ALL PRODUCTS</Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
