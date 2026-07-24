import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Bus } from 'lucide-react';
import AlertBanner from './AlertBanner';

const Layout = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <AlertBanner />
      <header className="bg-primary text-white p-4 shadow-md relative z-40">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bus className="h-6 w-6 text-accent" />
            <Link to="/" className="text-xl font-bold tracking-wide">Smart Bus Companion</Link>
          </div>
          <nav className="hidden sm:flex gap-4">
            <Link to="/complaints" className="hover:text-accent transition-colors">Feedback & Complaints</Link>
          </nav>
        </div>
      </header>
      <main className="flex-grow container mx-auto p-4 sm:p-6">
        <Outlet />
      </main>
      <footer className="bg-gray-100 text-center py-4 text-sm text-gray-500">
        &copy; {new Date().getFullYear()} Smart Bus Companion. Indore.
      </footer>
    </div>
  );
};

export default Layout;
