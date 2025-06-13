import React from 'react';
import { useNavigate } from 'react-router-dom';
import './common.css';

function HomePage() {
  const navigate = useNavigate();
  return (
    <div className="home-wrapper">
      <div className="logo">
        <img src="https://img.icons8.com/ios-filled/50/ffffff/headphones.png" alt="Logo" />
      </div>
      <h1>ShraVani</h1>
      <p>Learn & Speak English</p>
      <button className="btn" onClick={() => navigate('/signin')}>Get Started</button>
    </div>
  );
}

export default HomePage;
