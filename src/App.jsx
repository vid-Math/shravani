import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './components/HomePage';
import SignInPage from './components/SignInPage';
import BookshelfPage from './components/BookshelfPage';
import ChapterPage from './components/ChapterPage';
import UploadPage from './components/UploadPage';
import './components/common.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        {/* <Route path="/signin" element={<SignInPage />} /> */}
        {/* <Route path="/bookshelf" element={<BookshelfPage />} /> */}
        {/* <Route path="/chapter" element={<ChapterPage />} /> */}
        <Route path="/upload" element={<UploadPage />} />
      </Routes>
    </Router>
  );
}

export default App;