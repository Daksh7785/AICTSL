import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Bus } from 'lucide-react';
import AlertBanner from './AlertBanner';
import TopBar from './TopBar';
import { usePreferences } from '../../context/PreferencesContext';

const Layout = () => {
  const { highContrast, t } = usePreferences();
  return (
    <div className={`min-h-screen flex flex-col ${highContrast ? 'bg-black text-yellow-400 contrast-125 saturate-200' : 'bg-paper text-ink font-body'}`}>
      <TopBar />
      <AlertBanner />
      <header className={`${highContrast ? 'bg-black border-yellow-400' : 'bg-transit-ink border-signal-amber'} text-white p-4 shadow-md relative z-40 border-b-4`}>
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bus className={`h-6 w-6 ${highContrast ? 'text-yellow-400' : 'text-signal-amber'}`} />
            <Link to="/" className={`text-xl font-bold font-display uppercase tracking-widest ${highContrast ? 'text-yellow-400 hover:text-white' : 'text-white hover:text-signal-amber'} transition-colors`}>{t('app.title')}</Link>
          </div>
          <nav className="hidden sm:flex gap-4">
            <Link to="/complaints" className="font-semibold text-sm uppercase tracking-wide hover:text-signal-amber transition-colors">Feedback & Complaints</Link>
          </nav>
        </div>
      </header>
      <main className="flex-grow container mx-auto p-4 sm:p-6">
        <Outlet />
      </main>
      <footer className={`${highContrast ? 'bg-black text-yellow-400 border-yellow-400' : 'bg-transit-ink text-gray-400 border-transit-ink/20'} text-center py-6 text-sm font-mono-data border-t-2`}>
        &copy; {new Date().getFullYear()} {t('app.title')}. Indore.
      </footer>
    </div>
  );
};

export default Layout;

// style updates
