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
      <h1 className="text-3xl font-bold font-display text-center text-transit-ink mb-8 uppercase tracking-wide">Service Feedback</h1>
      
      <div className="flex justify-center mb-6 border-b-2 border-gray-200">
        <button 
          className={`px-6 py-3 font-semibold text-lg border-b-4 transition-colors -mb-[2px] ${activeTab === 'submit' ? 'border-transit-ink text-transit-ink' : 'border-transparent text-gray-500 hover:text-transit-ink'}`}
          onClick={() => setActiveTab('submit')}
        >
          Submit Complaint
        </button>
        <button 
          className={`px-6 py-3 font-semibold text-lg border-b-4 transition-colors -mb-[2px] ${activeTab === 'track' ? 'border-transit-ink text-transit-ink' : 'border-transparent text-gray-500 hover:text-transit-ink'}`}
          onClick={() => setActiveTab('track')}
        >
          Track Status
        </button>
      </div>

      {activeTab === 'submit' && (
        <Card className="p-6 border-2 border-transit-ink/10 shadow-lg">
          {submitSuccess ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-transit-green/20 text-transit-green rounded-full flex items-center justify-center mx-auto mb-4 text-3xl font-bold border-2 border-transit-green/30">✓</div>
              <h2 className="text-2xl font-bold font-display text-transit-ink mb-2">Complaint Submitted Successfully</h2>
              <p className="text-gray-600 mb-6 font-medium">Your reference ID is:</p>
              <div className="text-3xl font-mono-data font-bold text-transit-ink bg-gray-100 py-4 px-8 rounded-md inline-block mb-6 tracking-wider border-2 border-gray-200 shadow-inner">
                {submitSuccess}
              </div>
              <p className="text-sm text-gray-500 mb-8 font-medium">Please save this ID. You will need it to track your complaint's status.</p>
              <Button onClick={() => setSubmitSuccess(null)} className="bg-transit-ink text-white">Submit Another</Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-transit-ink mb-1">Route ID (Optional)</label>
                <input 
                  type="text" 
                  value={routeId} 
                  onChange={e => setRouteId(e.target.value)} 
                  placeholder="e.g. paste route ID from URL if known"
                  className="w-full px-3 py-2 bg-white border-2 border-gray-200 rounded-md focus:outline-none focus:border-transit-ink font-mono-data transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-transit-ink mb-1">Category</label>
                <select 
                  value={category} 
                  onChange={e => setCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-white border-2 border-gray-200 rounded-md focus:outline-none focus:border-transit-ink transition-colors font-medium"
                >
                  <option value="delay">Delay / Schedule Issue</option>
                  <option value="cleanliness">Cleanliness</option>
                  <option value="driver_behavior">Driver Behavior</option>
                  <option value="overcrowding">Overcrowding</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-transit-ink mb-1">Rating (1-5)</label>
                <input 
                  type="range" 
                  min="1" max="5" 
                  value={rating} 
                  onChange={e => setRating(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-signal-amber"
                />
                <div className="text-center font-bold font-mono-data text-transit-ink mt-2 text-lg">{rating} Stars</div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-transit-ink mb-1">Description</label>
                <textarea 
                  required 
                  rows="4" 
                  value={description} 
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Please describe the issue in detail..."
                  className="w-full px-3 py-2 bg-white border-2 border-gray-200 rounded-md focus:outline-none focus:border-transit-ink transition-colors"
                />
              </div>
              <Button type="submit" className="w-full bg-signal-amber text-ink hover:bg-yellow-500 font-bold uppercase tracking-wider mt-4">Submit Feedback</Button>
            </form>
          )}
        </Card>
      )}

      {activeTab === 'track' && (
        <Card className="p-6 border-2 border-transit-ink/10 shadow-lg">
          <form onSubmit={handleTrack} className="mb-6">
            <label className="block text-sm font-semibold text-transit-ink mb-2">Enter Reference ID</label>
            <div className="flex gap-2">
              <input 
                type="text" 
                required
                value={trackId}
                onChange={e => setTrackId(e.target.value.toUpperCase())}
                placeholder="e.g. CMP-1234"
                className="flex-grow px-3 py-3 bg-white border-2 border-gray-200 rounded-md focus:outline-none focus:border-transit-ink font-mono-data tracking-wider transition-colors"
              />
              <Button type="submit" className="bg-transit-ink text-white hover:bg-blue-900 font-bold px-6">Track</Button>
            </div>
          </form>

          {trackError && <div className="text-alert-red bg-alert-red/10 border-l-4 border-alert-red p-3 rounded-md text-sm font-medium">{trackError}</div>}
          
          {trackResult && (
            <div className="bg-paper border-2 border-gray-200 rounded-md p-6 text-center shadow-sm">
              <h3 className="text-xl font-bold font-mono-data text-transit-ink mb-2">Status for {trackId}</h3>
              <p className="text-sm text-gray-600 mb-5 capitalize font-medium">Category: <span className="font-bold text-transit-ink">{trackResult.category.replace('_', ' ')}</span></p>
              
              <div className={`inline-flex items-center justify-center px-5 py-2 rounded-full font-bold text-sm uppercase tracking-wider border-2 ${
                  trackResult.status === 'open' ? 'bg-signal-amber/20 text-yellow-800 border-signal-amber/50' :
                  trackResult.status === 'in_review' ? 'bg-blue-100 text-blue-800 border-blue-300' :
                  'bg-transit-green/20 text-transit-green border-transit-green/50'
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

// style updates
