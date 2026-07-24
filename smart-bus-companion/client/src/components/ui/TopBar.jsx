import React from 'react';
import { usePreferences } from '../../context/PreferencesContext';

export default function TopBar() {
  const { language, toggleLanguage, highContrast, toggleContrast, t } = usePreferences();

  return (
    <div className={`w-full p-2 flex justify-between items-center ${highContrast ? 'bg-black text-yellow-400 border-b-2 border-yellow-400' : 'bg-transit-ink text-white'}`}>
      <span className="font-bold text-sm tracking-widest uppercase ml-4">
        {t('app.title')}
      </span>
      <div className="flex space-x-2 mr-4">
        <button
          onClick={toggleLanguage}
          className={`px-3 py-1 text-xs font-bold rounded ${highContrast ? 'bg-yellow-400 text-black' : 'bg-signal-amber text-transit-ink'}`}
        >
          {language === 'en' ? 'हिन्दी' : 'ENG'}
        </button>
        <button
          onClick={toggleContrast}
          className={`px-3 py-1 text-xs font-bold rounded border ${highContrast ? 'border-yellow-400 text-yellow-400' : 'border-white text-white'}`}
          title="Toggle High Contrast"
        >
          {highContrast ? 'STD' : 'HC'}
        </button>
      </div>
    </div>
  );
}
