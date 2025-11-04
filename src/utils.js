// Task Management Utilities
export const TaskUtils = {
  addTask: (tasks, title) => {
    const newTask = {
      id: Date.now().toString(),
      title,
      completed: false,
      createdAt: new Date().toISOString()
    };
    return [...tasks, newTask];
  },

  toggleTask: (tasks, id) => {
    return tasks.map(task =>
      task.id === id ? { ...task, completed: !task.completed } : task
    );
  },

  deleteTask: (tasks, id) => {
    return tasks.filter(task => task.id !== id);
  },

  editTask: (tasks, id, newTitle) => {
    return tasks.map(task =>
      task.id === id ? { ...task, title: newTitle } : task
    );
  },

  filterTasks: (tasks, filter) => {
    switch (filter) {
      case 'active':
        return tasks.filter(task => !task.completed);
      case 'completed':
        return tasks.filter(task => task.completed);
      default:
        return tasks;
    }
  }
};

// Authentication Utilities
export const AuthUtils = {
  // Validate email format
  validateEmail: (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  // Validate password strength
  validatePassword: (password) => {
    // At least 6 characters
    return password.length >= 6;
  },

  // Validate password with strength check
  getPasswordStrength: (password) => {
    if (password.length < 6) return { valid: false, message: 'Password must be at least 6 characters' };
    if (password.length < 8) return { valid: true, strength: 'weak', message: 'Weak password' };
    
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    const strengthScore = [hasUpperCase, hasLowerCase, hasNumbers, hasSpecialChar].filter(Boolean).length;
    
    if (strengthScore >= 3 && password.length >= 10) {
      return { valid: true, strength: 'strong', message: 'Strong password' };
    } else if (strengthScore >= 2) {
      return { valid: true, strength: 'medium', message: 'Medium password' };
    } else {
      return { valid: true, strength: 'weak', message: 'Weak password' };
    }
  },

  // Validate name
  validateName: (name) => {
    return name.trim().length >= 2;
  },

  // Register user (store in memory - in production use backend API)
  register: (users, email, password, name) => {
    // Check if user already exists
    if (users.some(u => u.email === email)) {
      return { success: false, message: 'User already exists' };
    }

    const newUser = {
      id: Date.now().toString(),
      email,
      password, // In production, this should be hashed
      name,
      createdAt: new Date().toISOString()
    };

    return { success: true, user: newUser };
  },

  // Login user
  login: (users, email, password) => {
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
      return { success: true, user };
    }
    
    return { success: false, message: 'Invalid email or password' };
  },

  // Get current user from storage (simulate session)
  getCurrentUser: () => {
    try {
      const userJson = sessionStorage.getItem('currentUser');
      return userJson ? JSON.parse(userJson) : null;
    } catch (error) {
      return null;
    }
  },

  // Set current user in storage
  setCurrentUser: (user) => {
    try {
      sessionStorage.setItem('currentUser', JSON.stringify(user));
      return true;
    } catch (error) {
      return false;
    }
  },

  // Clear current user (logout)
  clearCurrentUser: () => {
    try {
      sessionStorage.removeItem('currentUser');
      return true;
    } catch (error) {
      return false;
    }
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    return AuthUtils.getCurrentUser() !== null;
  }
};