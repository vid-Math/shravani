import React from 'react';
import { useNavigate } from 'react-router-dom';
import './common.css';
import './sitewide_common.css';

function BookshelfPage() {
  const navigate = useNavigate();

  const goToChapter = () => {
    navigate('/chapter');
  };

  return (
    <div className="bookshelf-layout">
      <div className="sidebar">
        <div className="menu-icon">&#9776;</div>
        <ul>
          <li className="nav-item active">Home</li>
          <li className="nav-item" onClick={() => navigate('/upload')}>Upload</li>
          <li className="nav-item">Profile</li>
        </ul>
      </div>

      <div className="container bookshelf-container">
        <div className="logo-header">
            <div className="logo">
              <img src="https://img.icons8.com/ios-filled/50/ffffff/headphones.png" alt="Logo" />
            </div>
            <div className="brand">ShraVani</div>
        </div>

        <div className="currently-playing">
          <div className="chapter-image">
            <img src="/images/ch-4.png" alt="Now Playing" />
          </div>
          <div className="chapter-info">
            <p>Now Playing</p>
            <h3>English Class - 4</h3>
            <p>Ch - 4</p>
            <div className="progress-bar">
              <div className="progress" style={{ width: '60%' }}></div>
            </div>
          </div>
          <div className="play-button-current" onClick={goToChapter}>
            <img src="https://img.icons8.com/ios-filled/24/ffffff/play--v1.png" alt="Play" />
          </div>
        </div>

        <div className="shelf">
          <div className="shelf-title">
            <h4>Your Shelf</h4>
            <img src="https://img.icons8.com/ios-glyphs/30/000000/search--v1.png" alt="search" />
          </div>

          <div className="books-grid">
            {[3, 2, 1].map(i => (
              <img
                key={i}
                className="book"
                src={`/images/ch-${i}.png`}
                alt={`Chapter ${i}`}
                onClick={goToChapter}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default BookshelfPage;