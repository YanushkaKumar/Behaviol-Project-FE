import React, { useState, useEffect, useMemo } from 'react';
import TaskItem from './TaskItem';
import AddTaskForm from './AddTaskForm';
import { tasksAPI } from '../services/api';
import { 
  Search, SlidersHorizontal, ArrowUpDown, CheckSquare, 
  Trash2, Archive, BarChart3, X, Calendar, Tag as TagIcon
} from 'lucide-react';
import '../styles/TaskStyles.css';

const FILTERS = { 
  ALL: 'all', 
  ACTIVE: 'active', 
  COMPLETED: 'completed',
  OVERDUE: 'overdue',
  TODAY: 'today',
  WEEK: 'week'
};

const SORT_OPTIONS = {
  DATE_DESC: 'date_desc',
  DATE_ASC: 'date_asc',
  PRIORITY: 'priority',
  TITLE: 'title',
  CREATED: 'created'
};

const TaskList = ({ user, onLogout, activeFilter, setActiveFilter }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [addingTask, setAddingTask] = useState(false);
  
  // Advanced Features State
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState(SORT_OPTIONS.CREATED);
  const [selectedTasks, setSelectedTasks] = useState(new Set());
  const [showFilters, setShowFilters] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showArchived, setShowArchived] = useState(false);
  
  // Advanced Filters
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [tagFilter, setTagFilter] = useState('all');
  const [dateRangeFilter, setDateRangeFilter] = useState({ start: '', end: '' });

  useEffect(() => {
    loadTasks();
  }, [user]);

  const loadTasks = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError('');
      const fetchedTasks = await tasksAPI.getTasks();
      console.log('Tasks loaded in component:', fetchedTasks);
      setTasks(fetchedTasks);
    } catch (err) {
      setError('Failed to load tasks. Please try again.');
      console.error('Error loading tasks:', err);
      setTasks([]); 
    } finally {
      setLoading(false);
    }
  };

  const handleAddTask = async (title) => {
    if (!title.trim()) return;

    setAddingTask(true);
    try {
      const createdTask = await tasksAPI.createTask({ 
        title: title.trim(),
        priority: 'medium',
        tags: [],
        description: '',
        completed: false
      });
      console.log('Task created:', createdTask);
      setTasks(prevTasks => [createdTask, ...prevTasks]);
      setError('');
      
      if (activeFilter === FILTERS.COMPLETED) {
        setActiveFilter(FILTERS.ALL);
      }
    } catch (err) {
      setError('Failed to add task. Please try again.');
      console.error('Error adding task:', err);
    } finally {
      setAddingTask(false);
    }
  };

  const handleToggleTask = async (taskId) => {
    try {
      const task = tasks.find(t => t.id === taskId);
      if (!task) {
        console.error('Task not found:', taskId);
        return;
      }

      console.log('Toggling task:', task);
      
      const newCompleted = !task.completed;
      
      // Optimistic update
      setTasks(prevTasks => prevTasks.map(t => 
        t.id === taskId ? { ...t, completed: newCompleted } : t
      ));

      // Prepare full task data for update
      const taskData = {
        title: task.title,
        description: task.description || '',
        priority: task.priority || 'medium',
        dueDate: task.dueDate || null,
        tags: task.tags || [],
        completed: newCompleted
      };

      console.log('Sending toggle with full data:', taskData);

      // API call
      const updatedTask = await tasksAPI.toggleTask(taskId, taskData);
      
      console.log('Received updated task from backend:', updatedTask);
      
      // Update with server response
      setTasks(prevTasks => prevTasks.map(t => 
        t.id === taskId ? updatedTask : t
      ));
      
      setError('');
    } catch (err) {
      setError('Failed to update task. Please try again.');
      console.error('Error toggling task:', err);
      // Reload tasks on error
      await loadTasks();
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      // Optimistic update
      setTasks(prevTasks => prevTasks.filter(t => t.id !== taskId));
      
      await tasksAPI.deleteTask(taskId);
      setError('');
      
      setSelectedTasks(prev => {
        const newSet = new Set(prev);
        newSet.delete(taskId);
        return newSet;
      });
    } catch (err) {
      setError('Failed to delete task. Please try again.');
      console.error('Error deleting task:', err);
      await loadTasks(); // Reload on error
    }
  };

  const handleEditTask = async (taskId, updates) => {
    try {
      const task = tasks.find(t => t.id === taskId);
      if (!task) {
        console.error('Task not found for edit:', taskId);
        return;
      }

      // Merge updates with existing task data
      const updatedData = {
        title: updates.title !== undefined ? updates.title : task.title,
        description: updates.description !== undefined ? updates.description : (task.description || ''),
        priority: updates.priority !== undefined ? updates.priority : (task.priority || 'medium'),
        dueDate: updates.dueDate !== undefined ? updates.dueDate : task.dueDate,
        tags: updates.tags !== undefined ? updates.tags : (task.tags || []),
        completed: updates.completed !== undefined ? updates.completed : task.completed
      };

      console.log('Editing task with merged data:', updatedData);

      const updatedTask = await tasksAPI.updateTask(taskId, updatedData);
      console.log('Edit response:', updatedTask);
      
      setTasks(prevTasks => prevTasks.map(t => t.id === taskId ? updatedTask : t));
      setError('');
    } catch (err) {
      setError('Failed to update task. Please try again.');
      console.error('Error editing task:', err);
    }
  };

  // Bulk Actions
  const handleBulkSelect = (taskId, isSelected) => {
    setSelectedTasks(prev => {
      const newSet = new Set(prev);
      if (isSelected) {
        newSet.add(taskId);
      } else {
        newSet.delete(taskId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedTasks.size === filteredTasks.length) {
      setSelectedTasks(new Set());
    } else {
      setSelectedTasks(new Set(filteredTasks.map(t => t.id)));
    }
  };

  const handleBulkComplete = async () => {
    const tasksToUpdate = Array.from(selectedTasks);
    for (const taskId of tasksToUpdate) {
      await handleToggleTask(taskId);
    }
    setSelectedTasks(new Set());
  };

  const handleBulkDelete = async () => {
    if (!window.confirm(`Delete ${selectedTasks.size} tasks?`)) return;
    
    const tasksToDelete = Array.from(selectedTasks);
    for (const taskId of tasksToDelete) {
      await handleDeleteTask(taskId);
    }
    setSelectedTasks(new Set());
  };

  // Get all unique tags
  const allTags = useMemo(() => {
    const tagSet = new Set();
    tasks.forEach(task => {
      if (task.tags && Array.isArray(task.tags)) {
        task.tags.forEach(tag => tagSet.add(tag));
      }
    });
    return Array.from(tagSet);
  }, [tasks]);

  // Statistics
  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed === true).length;
    const active = total - completed;
    const overdue = tasks.filter(t => 
      t.dueDate && new Date(t.dueDate) < new Date() && !t.completed
    ).length;
    const dueToday = tasks.filter(t => {
      if (!t.dueDate || t.completed) return false;
      const today = new Date().toDateString();
      return new Date(t.dueDate).toDateString() === today;
    }).length;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    return { total, completed, active, overdue, dueToday, completionRate };
  }, [tasks]);

  // Advanced Filtering and Sorting
  const filteredTasks = useMemo(() => {
    console.log('Filtering tasks. Total tasks:', tasks.length);
    console.log('Active filter:', activeFilter);
    console.log('Sort by:', sortBy);
    
    let filtered = tasks.filter(task => {
      if (!task || !task.id || !task.title) {
        console.log('Filtering out invalid task:', task);
        return false;
      }
      return true;
    });

    console.log('After basic validation:', filtered.length);

    // Search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(task =>
        task.title.toLowerCase().includes(query) ||
        (task.description && task.description.toLowerCase().includes(query)) ||
        (task.tags && task.tags.some(tag => tag.toLowerCase().includes(query)))
      );
      console.log('After search filter:', filtered.length);
    }

    // Base Filter
    if (activeFilter === FILTERS.ACTIVE) {
      filtered = filtered.filter(t => t.completed !== true);
      console.log('Active filter applied:', filtered.length);
    } else if (activeFilter === FILTERS.COMPLETED) {
      filtered = filtered.filter(t => t.completed === true);
      console.log('Completed filter applied:', filtered.length);
    } else if (activeFilter === FILTERS.OVERDUE) {
      filtered = filtered.filter(t => {
        if (!t.dueDate || t.completed) return false;
        return new Date(t.dueDate) < new Date();
      });
      console.log('Overdue filter applied:', filtered.length);
    } else if (activeFilter === FILTERS.TODAY) {
      const today = new Date().toDateString();
      filtered = filtered.filter(t => {
        if (!t.dueDate || t.completed) return false;
        return new Date(t.dueDate).toDateString() === today;
      });
      console.log('Today filter applied:', filtered.length);
    } else if (activeFilter === FILTERS.WEEK) {
      const today = new Date();
      const nextWeek = new Date(today);
      nextWeek.setDate(today.getDate() + 7);
      filtered = filtered.filter(t => {
        if (!t.dueDate || t.completed) return false;
        const dueDate = new Date(t.dueDate);
        return dueDate >= today && dueDate <= nextWeek;
      });
      console.log('Week filter applied:', filtered.length);
    }

    // Priority Filter
    if (priorityFilter !== 'all') {
      filtered = filtered.filter(t => t.priority === priorityFilter);
      console.log('Priority filter applied:', filtered.length);
    }

    // Tag Filter
    if (tagFilter !== 'all') {
      filtered = filtered.filter(t => t.tags && t.tags.includes(tagFilter));
      console.log('Tag filter applied:', filtered.length);
    }

    // Date Range Filter
    if (dateRangeFilter.start) {
      filtered = filtered.filter(t => {
        if (!t.dueDate) return false;
        return new Date(t.dueDate) >= new Date(dateRangeFilter.start);
      });
      console.log('Start date filter applied:', filtered.length);
    }
    if (dateRangeFilter.end) {
      filtered = filtered.filter(t => {
        if (!t.dueDate) return false;
        return new Date(t.dueDate) <= new Date(dateRangeFilter.end);
      });
      console.log('End date filter applied:', filtered.length);
    }

    // Archived
    if (!showArchived) {
      filtered = filtered.filter(t => t.archived !== true);
      console.log('Archived filter applied:', filtered.length);
    }

    // Sorting
    const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
    
    switch (sortBy) {
      case SORT_OPTIONS.DATE_DESC:
        filtered.sort((a, b) => {
          if (!a.dueDate && !b.dueDate) return 0;
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return new Date(b.dueDate) - new Date(a.dueDate);
        });
        console.log('Sorted by date desc');
        break;
      case SORT_OPTIONS.DATE_ASC:
        filtered.sort((a, b) => {
          if (!a.dueDate && !b.dueDate) return 0;
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return new Date(a.dueDate) - new Date(b.dueDate);
        });
        console.log('Sorted by date asc');
        break;
      case SORT_OPTIONS.PRIORITY:
        filtered.sort((a, b) => {
          const aPriority = priorityOrder[a.priority || 'medium'] || 2;
          const bPriority = priorityOrder[b.priority || 'medium'] || 2;
          return bPriority - aPriority;
        });
        console.log('Sorted by priority');
        break;
      case SORT_OPTIONS.TITLE:
        filtered.sort((a, b) => {
          const aTitle = (a.title || '').toLowerCase();
          const bTitle = (b.title || '').toLowerCase();
          return aTitle.localeCompare(bTitle);
        });
        console.log('Sorted by title');
        break;
      case SORT_OPTIONS.CREATED:
      default:
        filtered.sort((a, b) => {
          const aDate = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const bDate = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return bDate - aDate;
        });
        console.log('Sorted by created date');
    }

    console.log('Final filtered tasks:', filtered.map(t => ({ 
      id: t.id, 
      title: t.title, 
      completed: t.completed,
      createdAt: t.createdAt,
      priority: t.priority,
      dueDate: t.dueDate
    })));

    return filtered;
  }, [tasks, searchQuery, activeFilter, sortBy, priorityFilter, tagFilter, dateRangeFilter, showArchived]);

  const getFilterTitle = (filter) => {
    switch(filter) {
      case FILTERS.ACTIVE: return 'Active Tasks';
      case FILTERS.COMPLETED: return 'Completed Tasks';
      case FILTERS.OVERDUE: return 'Overdue Tasks';
      case FILTERS.TODAY: return 'Due Today';
      case FILTERS.WEEK: return 'Due This Week';
      default: return 'All Tasks';
    }
  };

  return (
    <div className="tasks-main">
      <div className="tasks-container">
        {/* Header */}
        <div className="tasks-header">
          <h1 className="tasks-title">{getFilterTitle(activeFilter)}</h1>
          <button 
            onClick={() => setShowStats(!showStats)}
            className="stats-toggle-btn"
            title="Toggle Statistics"
          >
            <BarChart3 size={20} />
          </button>
        </div>

        {/* Statistics Panel */}
        {showStats && (
          <div className="stats-panel">
            <div className="stat-card">
              <span className="stat-label">Total</span>
              <span className="stat-value">{stats.total}</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">Active</span>
              <span className="stat-value stat-active">{stats.active}</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">Completed</span>
              <span className="stat-value stat-completed">{stats.completed}</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">Overdue</span>
              <span className="stat-value stat-overdue">{stats.overdue}</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">Due Today</span>
              <span className="stat-value stat-today">{stats.dueToday}</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">Completion</span>
              <span className="stat-value">{stats.completionRate}%</span>
            </div>
          </div>
        )}

        {/* Error Banner */}
        {error && (
          <div className="error-banner">
            {error}
            <button onClick={() => setError('')} className="error-close">×</button>
          </div>
        )}

        {/* Search and Filters */}
        <div className="tasks-toolbar">
          <div className="search-bar">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search tasks, tags, or descriptions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="search-clear">
                <X size={16} />
              </button>
            )}
          </div>

          <div className="toolbar-actions">
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className={`toolbar-btn ${showFilters ? 'active' : ''}`}
              title="Advanced Filters"
            >
              <SlidersHorizontal size={18} />
            </button>
          </div>
        </div>

        {/* Advanced Filters Panel */}
        {showFilters && (
          <div className="filters-panel">
            <div className="filter-group">
              <label>Priority:</label>
              <select 
                value={priorityFilter} 
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="filter-select"
              >
                <option value="all">All Priorities</option>
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Tag:</label>
              <select 
                value={tagFilter} 
                onChange={(e) => setTagFilter(e.target.value)}
                className="filter-select"
              >
                <option value="all">All Tags</option>
                {allTags.map(tag => (
                  <option key={tag} value={tag}>{tag}</option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Due Date Range:</label>
              <div className="date-range">
                <input
                  type="date"
                  value={dateRangeFilter.start}
                  onChange={(e) => setDateRangeFilter(prev => ({ ...prev, start: e.target.value }))}
                  className="filter-date"
                />
                <span>to</span>
                <input
                  type="date"
                  value={dateRangeFilter.end}
                  onChange={(e) => setDateRangeFilter(prev => ({ ...prev, end: e.target.value }))}
                  className="filter-date"
                />
              </div>
            </div>

            <button 
              onClick={() => {
                setPriorityFilter('all');
                setTagFilter('all');
                setDateRangeFilter({ start: '', end: '' });
              }}
              className="clear-filters-btn"
            >
              Clear Filters
            </button>
          </div>
        )}

        {/* Bulk Actions */}
        {selectedTasks.size > 0 && (
          <div className="bulk-actions-bar">
            <span className="bulk-count">{selectedTasks.size} selected</span>
            <div className="bulk-actions">
              <button onClick={handleBulkComplete} className="bulk-btn" title="Complete Selected">
                <CheckSquare size={16} /> Complete
              </button>
              <button onClick={handleBulkDelete} className="bulk-btn bulk-delete" title="Delete Selected">
                <Trash2 size={16} /> Delete
              </button>
              <button onClick={() => setSelectedTasks(new Set())} className="bulk-btn" title="Clear Selection">
                <X size={16} /> Clear
              </button>
            </div>
          </div>
        )}

        {/* Add Task Form */}
        <div className="tasks-form-wrapper">
          <AddTaskForm onAdd={handleAddTask} disabled={addingTask} />
        </div>

        {/* Tasks List */}
        <div className="tasks-list">
          {loading ? (
            <div className="task-loading">Loading tasks...</div>
          ) : filteredTasks.length === 0 ? (
            <div className="empty-state">
              <h2 className="empty-title">No tasks found</h2>
              <p className="empty-subtitle">
                {searchQuery ? 'Try a different search term' : 
                 activeFilter === FILTERS.ALL ? 'Start by adding a new task above!' :
                 'Try changing the filter or create a new task'}
              </p>
            </div>
          ) : (
            <>
              {filteredTasks.length > 5 && (
                <button onClick={handleSelectAll} className="select-all-btn">
                  {selectedTasks.size === filteredTasks.length ? 'Deselect All' : 'Select All'}
                </button>
              )}
              
              {filteredTasks.map(task => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onToggle={handleToggleTask}
                  onDelete={handleDeleteTask}
                  onEdit={handleEditTask}
                  onBulkSelect={handleBulkSelect}
                  isSelected={selectedTasks.has(task.id)}
                />
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskList;