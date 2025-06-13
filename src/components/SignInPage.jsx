import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './common.css';

function SignInPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSignIn = () => {
    if (username === 'edtech' && password === 'edtech') {
      navigate('/bookshelf');
    } else {
      setError('Incorrect username or password');
    }
  };

  return (
    <div className="signin-container">
      <a className="skip-link" href="/chapter">skip</a>
      <div className="header-logo">
        <img src="https://img.icons8.com/ios-filled/50/ffa500/headphones.png" alt="logo" width="60" />
      </div>
      <h2>Sign In</h2>
      <input type="text" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} />
      <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
      <button onClick={handleSignIn}>Let's Go</button>
      <div className="error-message">{error}</div>
    </div>
  );
}

export default SignInPage;