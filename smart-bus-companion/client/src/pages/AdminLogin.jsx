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
      <Card className="p-8 border-2 border-transit-ink/10 shadow-lg">
        <h1 className="text-2xl font-bold font-display text-center text-transit-ink mb-6 uppercase tracking-wide">Staff Login</h1>
        
        {error && <div className="bg-alert-red/10 border-l-4 border-alert-red text-alert-red p-3 rounded-md mb-4 text-sm font-medium">{error}</div>}
        
        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-transit-ink mb-1">Email</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-3 py-2 bg-white border-2 border-gray-200 rounded-md focus:outline-none focus:border-transit-ink transition-colors font-mono-data"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-transit-ink mb-1">Password</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full px-3 py-2 bg-white border-2 border-gray-200 rounded-md focus:outline-none focus:border-transit-ink transition-colors font-mono-data"
            />
          </div>
          <div className="flex justify-end mt-2">
            <a href="/forgot-password" className="text-sm font-medium text-transit-ink hover:text-signal-amber transition-colors">Forgot password?</a>
          </div>
          <Button type="submit" className="w-full bg-signal-amber text-ink hover:bg-yellow-500 font-bold uppercase tracking-wider mt-4">Sign In</Button>
        </form>
      </Card>
    </div>
  );
};

export default AdminLogin;

// style updates
