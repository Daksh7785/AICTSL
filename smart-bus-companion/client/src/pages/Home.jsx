import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { Mic } from 'lucide-react';

const AutocompleteInput = ({ id, label, value, onChange, onSelect, options, placeholder }) => {
  const [showOptions, setShowOptions] = useState(false);

  return (
    <div className="relative flex flex-col mb-4">
      {label && <label htmlFor={id} className="mb-1 text-sm font-semibold text-transit-ink">{label}</label>}
      <div className="relative">
        <input
          id={id}
          type="text"
          value={value}
          onChange={(e) => { onChange(e.target.value); setShowOptions(true); }}
          onFocus={() => setShowOptions(true)}
          onBlur={() => setTimeout(() => setShowOptions(false), 200)}
          placeholder={placeholder}
          className="w-full px-3 py-3 pr-10 bg-white border-2 border-gray-200 rounded-md focus:outline-none focus:border-transit-ink transition-colors text-lg font-mono-data"
          role="combobox"
          aria-expanded={showOptions && options.length > 0}
          aria-controls={`${id}-listbox`}
          aria-autocomplete="list"
        />
        {('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) && (
          <button 
            type="button"
            className="absolute right-3 top-3.5 text-gray-400 hover:text-transit-ink"
            onClick={(e) => {
              e.preventDefault();
              const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
              const recognition = new SpeechRecognition();
              recognition.lang = 'hi-IN'; // Supports Hindi + English (Hinglish) natively well
              recognition.start();
              recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                onChange(transcript);
                setShowOptions(true);
              };
            }}
            title="Search by Voice (English/Hindi)"
            aria-label={`Voice search for ${label}`}
          >
            <Mic className="w-5 h-5" aria-hidden="true" />
          </button>
        )}
      </div>
      {showOptions && options.length > 0 && (
        <ul id={`${id}-listbox`} role="listbox" className="absolute z-10 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto top-full mt-1">
          {options.map((opt) => (
            <li
              key={opt._id}
              role="option"
              onClick={() => { onSelect(opt); setShowOptions(false); }}
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
            >
              {opt.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

const LEDDepartureBoard = () => {
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    // Only animate on first mount
    setHasAnimated(true);
  }, []);

  return (
    <div className="bg-transit-ink text-signal-amber p-4 sm:p-6 rounded-t-lg shadow-inner relative overflow-hidden">
      {/* Scanline/Dot-matrix texture */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: 'radial-gradient(circle, var(--signal-amber) 1px, transparent 1px)',
          backgroundSize: '4px 4px'
        }}
      />
      
      <div className="relative z-10 font-mono-data">
        <div className="flex justify-between items-end border-b border-signal-amber/30 pb-2 mb-3 text-xs sm:text-sm text-signal-amber/70 uppercase tracking-widest">
          <span>Route</span>
          <span className="flex-grow ml-4">Destination</span>
          <span>Departs In</span>
        </div>
        
        <div className="space-y-3 text-sm sm:text-base">
          <div className="flex justify-between items-center">
            <span className="w-12 font-bold text-route-magenta">11</span>
            <span className="flex-grow ml-4 truncate">Vijay Nagar</span>
            <span className="text-right">2 min</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="w-12 font-bold text-transit-green">9</span>
            <span className="flex-grow ml-4 truncate">Indore Junction</span>
            <span className="text-right">5 min</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="w-12 font-bold text-signal-amber">15</span>
            <span className="flex-grow ml-4 truncate">Bhawarkuan</span>
            <span className="text-right">12 min</span>
          </div>
        </div>
      </div>
      
      {/* First Paint Animation */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-transit-ink overflow-hidden border-t border-signal-amber/20">
        <div className={`h-full bg-signal-amber ${hasAnimated ? 'motion-safe:animate-[busTravel_2s_ease-out_1]' : 'opacity-0'} motion-reduce:opacity-0 w-full transform -translate-x-full`}></div>
      </div>
    </div>
  );
};

const Home = () => {
  const [stops, setStops] = useState([]);
  const [fromQuery, setFromQuery] = useState('');
  const [toQuery, setToQuery] = useState('');
  const [fromStop, setFromStop] = useState(null);
  const [toStop, setToStop] = useState(null);
  
  const navigate = useNavigate();

  useEffect(() => {
    fetch('/api/stops')
      .then(res => res.json())
      .then(data => setStops(Array.isArray(data) ? data : []))
      .catch(console.error);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (fromStop && toStop) {
      navigate(`/search?from=${fromStop._id}&to=${toStop._id}`);
    }
  };

  const getOptions = (query) => {
    if (!query) return [];
    return stops.filter(s => s.name.toLowerCase().includes(query.toLowerCase()));
  };

  return (
    <div className="max-w-md mx-auto mt-6 sm:mt-10 px-4 sm:px-0">
      <LEDDepartureBoard />
      
      <div className="bg-white rounded-b-lg shadow-md border-x border-b border-gray-200 p-6">
        <h1 className="text-xl font-bold text-transit-ink mb-6 text-center font-display">Plan Your Journey</h1>
        <form onSubmit={handleSearch}>
          <AutocompleteInput
            id="from-stop"
            label="From"
            placeholder="Starting bus stop"
            value={fromQuery}
            onChange={(val) => { setFromQuery(val); setFromStop(null); }}
            onSelect={(stop) => { setFromQuery(stop.name); setFromStop(stop); }}
            options={getOptions(fromQuery)}
          />
          <AutocompleteInput
            id="to-stop"
            label="To"
            placeholder="Destination bus stop"
            value={toQuery}
            onChange={(val) => { setToQuery(val); setToStop(null); }}
            onSelect={(stop) => { setToQuery(stop.name); setToStop(stop); }}
            options={getOptions(toQuery)}
          />
          <Button type="submit" className="w-full mt-4 py-3 text-lg bg-signal-amber text-ink hover:bg-yellow-500 font-bold border-none" disabled={!fromStop || !toStop}>
            Find Routes
          </Button>
        </form>

        <div className="mt-6">
          <p className="text-sm text-gray-500 mb-3 font-semibold uppercase tracking-wider">Quick Destinations</p>
          <div className="flex flex-wrap gap-2">
            {[
              { label: 'IIT Indore', query: 'IIT' },
              { label: 'IIM Indore', query: 'IIM' },
              { label: 'DAVV Campus', query: 'Bhawarkuan' },
              { label: 'SGSITS', query: 'SGSITS' }
            ].map(campus => (
              <button
                key={campus.label}
                type="button"
                onClick={() => {
                  const match = stops.find(s => s.name.toLowerCase().includes(campus.query.toLowerCase()));
                  if (match) {
                    setToStop(match);
                    setToQuery(match.name);
                  } else {
                    setToQuery(campus.label);
                  }
                }}
                className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 text-transit-ink rounded-full transition-colors border border-gray-300"
              >
                {campus.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;

// style updates
