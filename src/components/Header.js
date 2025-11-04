import React from 'react';
import { LogOut, CheckSquare } from 'lucide-react';
import '../styles/TaskStyles.css';

const Header = ({ user, onLogout }) => {
  return (
    <header className="app-header">
      <div className="header-content">
        <div className="header-left">
          <CheckSquare className="header-icon" />
          <div>
            <h1 className="header-title">Task Manager</h1>
            <p className="header-subtitle">Welcome back, {user.name}</p>
          </div>
        </div>
        <button onClick={onLogout} className="logout-btn">
          <LogOut className="logout-icon" />
          <span>Logout</span>
        </button>
      </div>
    </header>
  );
};

export default Header;