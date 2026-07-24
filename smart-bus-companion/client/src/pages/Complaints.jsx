import React, { useState } from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { fetchWithAuth } from '../lib/fetchWithAuth';

const Complaints = () => {
  const [activeTab, setActiveTab] = useState('submit'); // 'submit' or 'track'
  
  // Submit state
  const [routeId, setRouteId] = useState('');
  const [category, setCategory] = useState('other');
  const [description, setDescription] = useState('');
  const [rating, setRating] = useState(3);
  const [submitSuccess, setSubmitSuccess] = useState(null); // Reference ID

  // Track state
  const [trackId, setTrackId] = useState('');
  const [trackResult, setTrackResult] = useState(null);
  const [trackError, setTrackError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetchWithAuth('/api/complaints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ routeId: routeId || null, category, description, rating })
      });
      const data = await res.json();
      if (res.ok) {
        setSubmitSuccess(data.referenceId);
        setRouteId('');
        setDescription('');
      } else {
        alert(data.error);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleTrack = async (e) => {
    e.preventDefault();
    setTrackError('');
    setTrackResult(null);
    try {
      const res = await fetchWithAuth(`/api/complaints/track/${trackId}`);
      const data = await res.json();
      if (res.ok) {
        setTrackResult(data);
      } else {
        setTrackError('Complaint not found or invalid Reference ID.');
      }
    } catch (err) {
      setTrackError('An error occurred while tracking.');
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-8">
      <h1 className="text-3xl font-bold text-center text-primary mb-8">Service Feedback</h1>
      
      <div className="flex justify-center mb-6 border-b border-gray-200">
        <button 
          className={`px-6 py-3 font-medium text-lg border-b-2 transition-colors ${activeTab === 'submit' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('submit')}
        >
          Submit Complaint
        </button>
        <button 
          className={`px-6 py-3 font-medium text-lg border-b-2 transition-colors ${activeTab === 'track' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('track')}
        >
          Track Status
        </button>
      </div>

      {activeTab === 'submit' && (
        <Card className="p-6">
          {submitSuccess ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">✓</div>
              <h2 className="text-xl font-bold mb-2">Complaint Submitted Successfully</h2>
              <p className="text-gray-600 mb-6">Your reference ID is:</p>
              <div className="text-3xl font-mono-data font-bold text-transit-ink bg-gray-100 py-3 px-6 rounded-md inline-block mb-6 tracking-wider">
                {submitSuccess}
              </div>
              <p className="text-sm text-gray-500 mb-6">Please save this ID. You will need it to track your complaint's status.</p>
              <Button onClick={() => setSubmitSuccess(null)}>Submit Another</Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Route ID (Optional)</label>
                <input 
                  type="text" 
                  value={routeId} 
                  onChange={e => setRouteId(e.target.value)} 
                  placeholder="e.g. paste route ID from URL if known"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select 
                  value={category} 
                  onChange={e => setCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary bg-white"
                >
                  <option value="delay">Delay / Schedule Issue</option>
                  <option value="cleanliness">Cleanliness</option>
                  <option value="driver_behavior">Driver Behavior</option>
                  <option value="overcrowding">Overcrowding</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rating (1-5)</label>
                <input 
                  type="range" 
                  min="1" max="5" 
                  value={rating} 
                  onChange={e => setRating(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="text-center font-bold text-primary mt-1">{rating} Stars</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea 
                  required 
                  rows="4" 
                  value={description} 
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Please describe the issue in detail..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <Button type="submit" className="w-full">Submit Feedback</Button>
            </form>
          )}
        </Card>
      )}

      {activeTab === 'track' && (
        <Card className="p-6">
          <form onSubmit={handleTrack} className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Enter Reference ID</label>
            <div className="flex gap-2">
              <input 
                type="text" 
                required
                value={trackId}
                onChange={e => setTrackId(e.target.value.toUpperCase())}
                placeholder="e.g. CMP-1234"
                className="flex-grow px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-transit-ink font-mono-data"
              />
              <Button type="submit" className="bg-signal-amber text-ink border-none hover:bg-yellow-500 font-bold">Track</Button>
            </div>
          </form>

          {trackError && <div className="text-alert bg-red-50 p-3 rounded-md text-sm">{trackError}</div>}
          
          {trackResult && (
            <div className="bg-gray-50 border border-gray-200 rounded-md p-5 text-center">
              <h3 className="text-lg font-semibold mb-1">Status for {trackId}</h3>
              <p className="text-sm text-gray-500 mb-4 capitalize">Category: {trackResult.category.replace('_', ' ')}</p>
              
              <div className={`inline-flex items-center justify-center px-4 py-2 rounded-full font-bold text-sm uppercase tracking-wider ${
                  trackResult.status === 'open' ? 'bg-yellow-100 text-yellow-800' :
                  trackResult.status === 'in_review' ? 'bg-blue-100 text-blue-800' :
                  'bg-green-100 text-green-800'
                }`}
              >
                {trackResult.status.replace('_', ' ')}
              </div>
            </div>
          )}
        </Card>
      )}
    </div>
  );
};

export default Complaints;
