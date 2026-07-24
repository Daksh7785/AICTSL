import React, { useState } from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (res.ok) {
        setMessage(data.message);
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
        <h1 className="text-2xl font-bold text-center text-primary mb-6">Forgot Password</h1>
        {message && <div className="bg-green-50 text-green-700 p-3 rounded-md mb-4 text-sm">{message}</div>}
        {error && <div className="bg-red-50 text-alert p-3 rounded-md mb-4 text-sm">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
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
          <Button type="submit" className="w-full">Send Reset Link</Button>
        </form>
      </Card>
    </div>
  );
};

export default ForgotPassword;
