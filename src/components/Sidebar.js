import React from 'react';
import { CheckCircle, Circle, LayoutDashboard, Calendar, AlertCircle, Clock } from 'lucide-react';
import '../styles/TaskStyles.css';

const Sidebar = ({ activeFilter, onFilterChange }) => {
  const filters = [
    { id: 'all', label: 'All Tasks', icon: LayoutDashboard },
    { id: 'active', label: 'Active', icon: Circle },
    { id: 'completed', label: 'Completed', icon: CheckCircle },
    { id: 'overdue', label: 'Overdue', icon: AlertCircle },
    { id: 'today', label: 'Due Today', icon: Calendar },
    { id: 'week', label: 'Due This Week', icon: Clock }
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h2 className="sidebar-title">Filters</h2>
        <p className="sidebar-subtitle">Organize your tasks</p>
      </div>
      
      <nav className="sidebar-nav">
        {filters.map(filter => {
          const Icon = filter.icon;
          const isActive = activeFilter === filter.id;
          
          return (
            <button
              key={filter.id}
              onClick={() => onFilterChange(filter.id)}
              className={`filter-btn ${isActive ? 'filter-btn-active' : ''}`}
            >
              <Icon className="filter-icon" />
              <span className="filter-label">{filter.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-tip">
          <p className="tip-title">Quick Tip</p>
          <p className="tip-text">Use filters to organize and track your tasks efficiently</p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;