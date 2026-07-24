import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include' // Allow cookies
      });
      const data = await res.json();
      
      if (res.ok) {
        // Cookies are set automatically by the browser
        localStorage.setItem('userRole', data.role); // Store role safely without token
        navigate('/admin');
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      setError('An error occurred during login.');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20">
      <Card className="p-8">
        <h1 className="text-2xl font-bold text-center text-primary mb-6">Staff Login</h1>
        
        {error && <div className="bg-red-50 text-alert p-3 rounded-md mb-4 text-sm">{error}</div>}
        
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <div className="flex justify-end">
            <a href="/forgot-password" className="text-sm text-primary hover:underline">Forgot password?</a>
          </div>
          <Button type="submit" className="w-full">Sign In</Button>
        </form>
      </Card>
    </div>
  );
};

export default AdminLogin;
