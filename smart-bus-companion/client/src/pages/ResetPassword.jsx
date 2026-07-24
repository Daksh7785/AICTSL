import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    try {
      const res = await fetch(`/api/auth/reset-password/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });
      const data = await res.json();
      if (res.ok) {
        setMessage('Password reset successfully. Redirecting to login...');
        setTimeout(() => navigate('/login'), 2000);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('An error occurred');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20">
      <Card className="p-8">
        <h1 className="text-2xl font-bold text-center text-primary mb-6">Reset Password</h1>
        {message && <div className="bg-green-50 text-green-700 p-3 rounded-md mb-4 text-sm">{message}</div>}
        {error && <div className="bg-red-50 text-alert p-3 rounded-md mb-4 text-sm">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <Button type="submit" className="w-full">Reset Password</Button>
        </form>
      </Card>
    </div>
  );
};

export default ResetPassword;
