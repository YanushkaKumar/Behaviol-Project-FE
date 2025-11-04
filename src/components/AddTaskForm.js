import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import '../styles/TaskStyles.css';

const AddTaskForm = ({ onAdd, disabled }) => {
  const [title, setTitle] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (title.trim()) {
      onAdd(title.trim());
      setTitle('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="add-task-form">
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="What needs to be done?"
        className="task-input"
        disabled={disabled}
      />
      <button type="submit" className="add-task-btn" disabled={disabled}>
        <Plus className="add-icon" />
        <span>{disabled ? 'Adding...' : 'Add Task'}</span>
      </button>
    </form>
  );
};

export default AddTaskForm;
