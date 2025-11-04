import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import Registration from './components/Registration';
import TaskList from './components/TaskList'; 
import Header from './components/Header';
import Sidebar from './components/Sidebar'; // <-- Import Sidebar component
import { authAPI } from './services/api'; 
import './App.css';

// Define a placeholder for filters if constants is not available
const LocalFILTERS = {
  ALL: 'all',
  ACTIVE: 'active',
  COMPLETED: 'completed'
};

function App() {
  const [user, setUser] = useState(null);
  const [showLogin, setShowLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  // State to manage the active filter, shared between Sidebar and potentially TaskList
  const [activeFilter, setActiveFilter] = useState(LocalFILTERS.ALL);

  // Check for existing user session (token and user info) on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUsername = localStorage.getItem('username'); // Use 'username' as per api.js

    if (token && savedUsername) {
      // Reconstitute the user object from stored data
      const userObject = {
        username: savedUsername,
        name: savedUsername // Assuming name defaults to username
      };
      setUser(userObject);
    }
    setIsLoading(false);
  }, []);

  // Handler for successful login
  const handleLogin = (userData) => {
    // Store user data in state
    const userToStore = {
      username: userData.username,
      name: userData.name || userData.username
    };
    setUser(userToStore);

    // Persist essential user info for reloads
    localStorage.setItem('username', userToStore.username);

    console.log('App: Login successful, user set:', userToStore.username);
  };

  // Handler for successful registration
  const handleRegister = (userData) => {
    // Store user data in state
    const userToStore = {
      username: userData.username,
      name: userData.name || userData.username
    };
    setUser(userToStore);
    
    // Persist essential user info for reloads
    localStorage.setItem('username', userToStore.username);
    
    console.log('App: Registration successful, user set:', userToStore.username);
  };

  // Handler for logout
  const handleLogout = () => {
    authAPI.logout(); // Clears 'token' and 'username' from localStorage
    setUser(null);
    setShowLogin(true);
    console.log('App: User logged out.');
  };

  const switchToRegister = () => {
    setShowLogin(false);
  };

  const switchToLogin = () => {
    setShowLogin(true);
  };

  if (isLoading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Loading session...</p>
      </div>
    );
  }

  if (!user) {
    // Show Authentication pages
    return (
      <div className="auth-wrapper">
        {showLogin ? (
          <Login 
            onLogin={handleLogin} 
            onSwitchToRegister={switchToRegister} 
          />
        ) : (
          <Registration 
            onRegister={handleRegister} 
            onSwitchToLogin={switchToLogin} 
          />
        )}
      </div>
    );
  }

  // Show Main Task Manager App
  return (
    // FIX 1: Changed class to 'app-container' to use the main CSS layout for sidebar/main content
    <div className="app-container">
      {/* Sidebar is fixed on the left (defined in TaskStyles.css) */}
      <Sidebar 
          activeFilter={activeFilter} 
          onFilterChange={setActiveFilter} 
      />
      
      {/* FIX 2: This is the main content area that is offset by the sidebar width. 
        It contains the header and the scrollable task list.
      */}
      <div className="main-content">
        <Header user={user} onLogout={handleLogout} />
        {/* TaskList will use the remaining space within main-content */}
        <TaskList user={user} onLogout={handleLogout} />
      </div>
    </div>
  );
}

export default App;
