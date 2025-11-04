import React, { useState } from 'react';

const APIDebugger = () => {
  const [results, setResults] = useState([]);

  const addResult = (result) => {
    setResults(prev => [...prev, { ...result, timestamp: new Date().toLocaleTimeString() }]);
  };

  // Test 1: Login with email only
  const testLoginEmail = async () => {
    try {
      const response = await fetch('http://localhost:5050/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'john@example.com',
          password: 'SecurePass123'
        })
      });
      const data = await response.json();
      addResult({
        test: 'Login with email',
        status: response.status,
        success: response.ok,
        data: JSON.stringify(data, null, 2)
      });
    } catch (error) {
      addResult({
        test: 'Login with email',
        status: 'ERROR',
        success: false,
        data: error.message
      });
    }
  };

  // Test 2: Login with username
  const testLoginUsername = async () => {
    try {
      const response = await fetch('http://localhost:5050/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: 'johndoe',
          password: 'SecurePass123'
        })
      });
      const data = await response.json();
      addResult({
        test: 'Login with username',
        status: response.status,
        success: response.ok,
        data: JSON.stringify(data, null, 2)
      });
    } catch (error) {
      addResult({
        test: 'Login with username',
        status: 'ERROR',
        success: false,
        data: error.message
      });
    }
  };

  // Test 3: Login with both
  const testLoginBoth = async () => {
    try {
      const response = await fetch('http://localhost:5050/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: 'johndoe',
          email: 'john@example.com',
          password: 'SecurePass123'
        })
      });
      const data = await response.json();
      addResult({
        test: 'Login with username + email',
        status: response.status,
        success: response.ok,
        data: JSON.stringify(data, null, 2)
      });
    } catch (error) {
      addResult({
        test: 'Login with username + email',
        status: 'ERROR',
        success: false,
        data: error.message
      });
    }
  };

  // Test 4: Check register endpoint
  const testRegisterFormat = async () => {
    try {
      const response = await fetch('http://localhost:5050/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: 'testuser' + Date.now(),
          email: 'test' + Date.now() + '@example.com',
          password: 'TestPass123'
        })
      });
      const data = await response.json();
      addResult({
        test: 'Register endpoint',
        status: response.status,
        success: response.ok,
        data: JSON.stringify(data, null, 2)
      });
    } catch (error) {
      addResult({
        test: 'Register endpoint',
        status: 'ERROR',
        success: false,
        data: error.message
      });
    }
  };

  // Test 5: Get todos with token
  const testGetTodos = async () => {
    try {
      // First login to get token
      const loginResponse = await fetch('http://localhost:5050/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: 'johndoe',
          password: 'SecurePass123'
        })
      });
      const loginData = await loginResponse.json();
      
      if (!loginData.token) {
        addResult({
          test: 'Get Todos',
          status: 'ERROR',
          success: false,
          data: 'Failed to get token'
        });
        return;
      }

      // Now fetch todos
      const todosResponse = await fetch('http://localhost:5050/api/todos', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${loginData.token}`
        }
      });
      
      const todosData = await todosResponse.json();
      addResult({
        test: 'Get Todos',
        status: todosResponse.status,
        success: todosResponse.ok,
        data: JSON.stringify(todosData, null, 2)
      });
    } catch (error) {
      addResult({
        test: 'Get Todos',
        status: 'ERROR',
        success: false,
        data: error.message
      });
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h1>API Backend Debugger</h1>
      <p>Test different endpoints to find response format</p>
      
      <div style={{ marginBottom: '20px' }}>
        <button onClick={testLoginEmail} style={buttonStyle}>
          Test: Login with Email
        </button>
        <button onClick={testLoginUsername} style={buttonStyle}>
          Test: Login with Username
        </button>
        <button onClick={testLoginBoth} style={buttonStyle}>
          Test: Login with Both
        </button>
        <button onClick={testRegisterFormat} style={buttonStyle}>
          Test: Register Format
        </button>
        <button onClick={testGetTodos} style={{ ...buttonStyle, background: '#48bb78' }}>
          Test: Get Todos
        </button>
        <button onClick={() => setResults([])} style={{ ...buttonStyle, background: '#666' }}>
          Clear Results
        </button>
      </div>

      <div style={{ marginTop: '20px' }}>
        <h2>Test Results:</h2>
        {results.length === 0 ? (
          <p style={{ color: '#888' }}>No tests run yet. Click a button above to test.</p>
        ) : (
          results.map((result, index) => (
            <div key={index} style={{
              border: '1px solid #ccc',
              borderRadius: '8px',
              padding: '15px',
              marginBottom: '15px',
              background: result.success ? '#e8f5e9' : '#ffebee'
            }}>
              <div style={{ marginBottom: '10px' }}>
                <strong>{result.test}</strong>
                <span style={{ marginLeft: '10px', color: result.success ? 'green' : 'red' }}>
                  Status: {result.status} {result.success ? '✓' : '✗'}
                </span>
                <span style={{ marginLeft: '10px', color: '#666', fontSize: '12px' }}>
                  {result.timestamp}
                </span>
              </div>
              <pre style={{
                background: '#f5f5f5',
                padding: '10px',
                borderRadius: '4px',
                overflow: 'auto',
                fontSize: '12px'
              }}>
                {result.data}
              </pre>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const buttonStyle = {
  padding: '10px 15px',
  margin: '5px',
  background: '#2196F3',
  color: 'white',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
  fontSize: '14px'
};

export default APIDebugger;