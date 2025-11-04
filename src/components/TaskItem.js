import React, { useState } from 'react';
import { 
  CheckCircle, Circle, Trash2, Edit2, Check, X, 
  Calendar, Tag, AlertCircle, ChevronDown, ChevronUp,
  Clock, Flag, FileText
} from 'lucide-react';
import '../styles/TaskStyles.css';

const PRIORITY_CONFIG = {
  low: { label: 'Low', color: '#10b981', icon: '◉' },
  medium: { label: 'Medium', color: '#3b82f6', icon: '◉◉' },
  high: { label: 'High', color: '#f59e0b', icon: '◉◉◉' },
  urgent: { label: 'Urgent', color: '#ef4444', icon: '🔥' }
};

const TaskItem = ({ task, onToggle, onDelete, onEdit, onBulkSelect, isSelected }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const [editText, setEditText] = useState(task?.title || '');
  const [editDescription, setEditDescription] = useState(task?.description || '');
  const [editPriority, setEditPriority] = useState(task?.priority || 'medium');
  const [editDueDate, setEditDueDate] = useState(task?.dueDate || '');
  const [editTags, setEditTags] = useState(task?.tags?.join(', ') || '');

  if (!task) {
    console.error('TaskItem received undefined task');
    return null;
  }

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && !task.completed;
  const priorityConfig = PRIORITY_CONFIG[task.priority || 'medium'];

  const handleSave = () => {
    if (editText.trim()) {
      const updates = {
        title: editText.trim(),
        description: editDescription.trim(),
        priority: editPriority,
        dueDate: editDueDate || null,
        tags: editTags.split(',').map(t => t.trim()).filter(t => t)
      };
      onEdit(task.id, updates);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditText(task.title || '');
    setEditDescription(task.description || '');
    setEditPriority(task.priority || 'medium');
    setEditDueDate(task.dueDate || '');
    setEditTags(task.tags?.join(', ') || '');
    setIsEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const handleTaskClick = () => {
    if (!isEditing) {
      setShowActions(!showActions);
      setIsExpanded(!isExpanded);
    }
  };

  return (
    <div 
      className={`task-item ${task.completed ? 'task-completed' : ''} ${isSelected ? 'task-selected' : ''}`}
      onClick={handleTaskClick}
    >
      <div className="task-main-row">
        {/* Priority Indicator */}
        <div 
          className="task-priority-dot"
          style={{ backgroundColor: priorityConfig.color }}
          title={`Priority: ${priorityConfig.label}`}
        />

        {/* Task Content */}
        <div className="task-content" onClick={(e) => e.stopPropagation()}>
          {isEditing ? (
            <div className="task-edit-form">
              <input
                type="text"
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                onKeyDown={handleKeyDown}
                className="task-edit-input"
                placeholder="Task title"
                autoFocus
              />
              
              <textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                className="task-edit-description"
                placeholder="Add description (optional)"
                rows="2"
              />

              <div className="task-edit-meta">
                <div className="task-edit-field">
                  <label>Priority:</label>
                  <select 
                    value={editPriority} 
                    onChange={(e) => setEditPriority(e.target.value)}
                    className="task-edit-select"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>

                <div className="task-edit-field">
                  <label>Due Date:</label>
                  <input
                    type="date"
                    value={editDueDate}
                    onChange={(e) => setEditDueDate(e.target.value)}
                    className="task-edit-date"
                  />
                </div>

                <div className="task-edit-field">
                  <label>Tags:</label>
                  <input
                    type="text"
                    value={editTags}
                    onChange={(e) => setEditTags(e.target.value)}
                    className="task-edit-tags"
                    placeholder="work, personal, urgent"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="task-info">
              <div className="task-title-row">
                <span className={`task-text ${task.completed ? 'task-text-completed' : ''}`}>
                  {task.title || 'Untitled Task'}
                </span>
                {isOverdue && (
                  <span className="task-overdue-badge">
                    <AlertCircle size={14} /> Overdue
                  </span>
                )}
              </div>

              {/* Task Metadata */}
              <div className="task-metadata">
                {task.dueDate && (
                  <span className={`task-meta-item ${isOverdue ? 'task-meta-overdue' : ''}`}>
                    <Calendar size={12} />
                    {formatDate(task.dueDate)}
                  </span>
                )}
                
                {task.tags && task.tags.length > 0 && (
                  <div className="task-tags">
                    {task.tags.map((tag, idx) => (
                      <span key={idx} className="task-tag">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Expanded Details */}
              {isExpanded && task.description && (
                <div className="task-description">
                  <FileText size={14} />
                  <p>{task.description}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Action Buttons - Show when task is clicked */}
        {showActions && !isEditing && (
          <div className="task-actions" onClick={(e) => e.stopPropagation()}>
            <button 
              onClick={() => onToggle(task.id)} 
              className="task-toggle-action"
              title={task.completed ? "Mark as incomplete" : "Mark as complete"}
            >
              {task.completed ? (
                <CheckCircle className="task-icon task-icon-completed" />
              ) : (
                <Circle className="task-icon task-icon-pending" />
              )}
            </button>
            <button 
              onClick={() => {
                setIsEditing(true);
                setIsExpanded(true);
                setShowActions(true);
              }} 
              className="task-edit" 
              title="Edit"
            >
              <Edit2 className="edit-icon" />
            </button>
            <button 
              onClick={() => onDelete(task.id)} 
              className="task-delete" 
              title="Delete"
            >
              <Trash2 className="delete-icon" />
            </button>
          </div>
        )}

        {/* Save/Cancel Buttons when editing */}
        {isEditing && (
          <div className="task-actions" onClick={(e) => e.stopPropagation()}>
            <button onClick={handleSave} className="task-save" title="Save (Enter)">
              <Check className="save-icon" />
            </button>
            <button onClick={handleCancel} className="task-cancel" title="Cancel (Esc)">
              <X className="cancel-icon" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskItem;