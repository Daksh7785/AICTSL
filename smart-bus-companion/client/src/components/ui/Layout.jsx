import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Bus } from 'lucide-react';
import AlertBanner from './AlertBanner';

const Layout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-paper font-body text-ink">
      <AlertBanner />
      <header className="bg-transit-ink text-white p-4 shadow-md relative z-40 border-b-4 border-signal-amber">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bus className="h-6 w-6 text-signal-amber" />
            <Link to="/" className="text-xl font-bold font-display uppercase tracking-widest text-white hover:text-signal-amber transition-colors">Smart Bus Companion</Link>
          </div>
          <nav className="hidden sm:flex gap-4">
            <Link to="/complaints" className="font-semibold text-sm uppercase tracking-wide hover:text-signal-amber transition-colors">Feedback & Complaints</Link>
          </nav>
        </div>
      </header>
      <main className="flex-grow container mx-auto p-4 sm:p-6">
        <Outlet />
      </main>
      <footer className="bg-transit-ink text-center py-6 text-sm text-gray-400 font-mono-data border-t-2 border-transit-ink/20">
        &copy; {new Date().getFullYear()} Smart Bus Companion. Indore.
      </footer>
    </div>
  );
};

export default Layout;

// style updates
