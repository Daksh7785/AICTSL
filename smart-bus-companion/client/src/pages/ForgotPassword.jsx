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
      <Card className="p-8 border-2 border-transit-ink/10 shadow-lg">
        <h1 className="text-2xl font-bold font-display text-center text-transit-ink mb-6 uppercase tracking-wide">Forgot Password</h1>
        {message && <div className="bg-transit-green/10 border-l-4 border-transit-green text-transit-green p-3 rounded-md mb-4 text-sm font-medium">{message}</div>}
        {error && <div className="bg-alert-red/10 border-l-4 border-alert-red text-alert-red p-3 rounded-md mb-4 text-sm font-medium">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-5">
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
          <Button type="submit" className="w-full bg-signal-amber text-ink hover:bg-yellow-500 font-bold uppercase tracking-wider mt-4">Send Reset Link</Button>
        </form>
      </Card>
    </div>
  );
};

export default ForgotPassword;

// style updates
