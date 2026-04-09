import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ini = (n) => (n || '').split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();

const Topbar = ({ title, theme, onToggleTheme, onNotify }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    if (window.confirm('Sign out of GITAM Academic Tracker?')) {
      await logout();
      navigate('/login');
    }
  };

  return (
    <header className="topbar">
      <div className="tbtit">{title}</div>
      <div className="tbact">
        
        <div className="ibtn" onClick={onToggleTheme} title="Toggle theme">
          {theme === 'dark' ? '☀️' : '🌙'}
        </div>
        <div
          className="ibtn"
          title="Notifications"
          onClick={onNotify}
        >
          🔔<div className="ndot" />
        </div>
        <div className="upill" onClick={() => navigate('/profile')}>
          <div className="uav">{ini(user?.name)}</div>
          <span className="uname">{user?.name?.split(' ')[0]}</span>
        </div>
        <button className="logoutbtn" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </header>
  );
};

export default Topbar;