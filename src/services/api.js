// src/services/api.js

const API_BASE_URL = "https://todoappilication.danushka.tech";


// Helper function to handle API responses
const handleResponse = async (response) => {
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || 'An error occurred');
  }
  
  return data;
};

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

// Helper function to normalize task from backend
const normalizeTask = (task) => ({
  id: task.id || task._id,
  title: task.title || task.text || '',
  description: task.description || '',
  completed: task.completed || false,
  priority: task.priority || 'medium',
  tags: task.tags || [],
  dueDate: task.dueDate || null,
  archived: task.archived || false,
  createdAt: task.createdAt || new Date().toISOString()
});

// Authentication API
export const authAPI = {
  register: async (userData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: userData.name, 
          password: userData.password
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Registration failed');
      }
      
      const data = await response.json();
      
      if (data.success) {
        localStorage.setItem('username', userData.name);
      }
      
      return {
        success: true,
        message: data.message,
        username: userData.name
      };
    } catch (error) {
      console.error('Registration error:', error);
      return {
        success: false,
        message: error.message || 'Registration failed. Please try again.'
      };
    }
  },

  login: async (credentials) => {
    try {
      const loginData = {
        username: credentials.username,
        password: credentials.password
      };
      
      console.log('Sending login request with username:', loginData.username);
      
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginData),
      });
      
      console.log('Login response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Login error response:', errorData);
        throw new Error(errorData.message || errorData.username || `Login failed with status ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Login success response:', data);
      
      if (data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('username', data.username);
      }
      
      return {
        success: true,
        user: {
          username: data.username,
          name: data.username
        },
        token: data.token
      };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        message: error.message || 'Login failed. Please check your credentials.'
      };
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
  }
};

// Tasks API
export const tasksAPI = {
  // Get all tasks for the logged-in user
  getTasks: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/todos`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch tasks');
      }
      
      const data = await response.json();
      console.log('Fetched tasks from backend:', data);
      
      const tasksArray = Array.isArray(data) ? data : (data.todos || []);
      
      const normalizedTasks = tasksArray.map(normalizeTask);
      console.log('Normalized tasks:', normalizedTasks);
      
      return normalizedTasks;
    } catch (error) {
      console.error('Get tasks error:', error);
      throw new Error(error.message || 'Failed to fetch tasks');
    }
  },

  // Create a new task
  createTask: async (taskData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/todos`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          title: taskData.title,
          description: taskData.description || '',
          priority: taskData.priority || 'medium',
          dueDate: taskData.dueDate || null,
          tags: taskData.tags || [],
          completed: false 
        }),
      });
          
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to create task');
      }
      
      const data = await response.json();
      console.log('Created task from backend:', data);
      
      return normalizeTask(data);
    } catch (error) {
      console.error('Create task error:', error);
      throw new Error(error.message || 'Failed to create task');
    }
  },

  // Update a task (handles all updates including completion toggle)
 updateTask: async (taskId, updates) => {
    try {
      console.log('Updating task:', taskId, 'with updates:', updates);
      
      // Convert date-only string to datetime string for backend
      let dueDate = updates.dueDate;
      if (dueDate && !dueDate.includes('T')) {
        dueDate = `${dueDate}T00:00:00`;
      }
      
      const response = await fetch(`${API_BASE_URL}/todos/${taskId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          title: updates.title,
          description: updates.description,
          priority: updates.priority,
          dueDate: dueDate,
          tags: updates.tags,
          completed: updates.completed
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to update task');
      }
      
      const data = await response.json();
      console.log('Updated task from backend:', data);
      
      return normalizeTask(data);
    } catch (error) {
      console.error('Update task error:', error);
      throw new Error(error.message || 'Failed to update task');
    }
  },

  // Toggle task completion (uses updateTask)
  toggleTask: async (taskId, taskData) => {
    console.log('Toggle task called with:', taskId, taskData);
    return tasksAPI.updateTask(taskId, taskData);
  },

  // Delete a task
  deleteTask: async (taskId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/todos/${taskId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete task');
      }
      
      console.log('Deleted task:', taskId);
      return { success: true };
    } catch (error) {
      console.error('Delete task error:', error);
      throw new Error(error.message || 'Failed to delete task');
    }
  }
};

export default { authAPI, tasksAPI };