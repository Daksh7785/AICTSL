import React, { createContext, useContext, useState, useEffect } from 'react';

const PreferencesContext = createContext();

export const usePreferences = () => useContext(PreferencesContext);

export const PreferencesProvider = ({ children }) => {
  const [language, setLanguage] = useState(localStorage.getItem('lang') || 'en');
  const [highContrast, setHighContrast] = useState(localStorage.getItem('contrast') === 'true');

  useEffect(() => {
    localStorage.setItem('lang', language);
  }, [language]);

  useEffect(() => {
    localStorage.setItem('contrast', highContrast);
  }, [highContrast]);

  const toggleLanguage = () => setLanguage(l => (l === 'en' ? 'hi' : 'en'));
  const toggleContrast = () => setHighContrast(c => !c);

  // Super basic stubbed translation dictionary for demonstration
  const t = (key) => {
    const translations = {
      en: {
        'search.title': 'Find Your Bus',
        'search.placeholder': 'Enter destination...',
        'search.button': 'Search',
        'bus.crowding': 'Crowding',
        'bus.notify': 'Notify Me',
        'track.live': 'Live Tracking',
        'app.title': 'Smart Bus Companion'
      },
      hi: {
        'search.title': 'अपनी बस खोजें',
        'search.placeholder': 'गंतव्य दर्ज करें...',
        'search.button': 'खोजें',
        'bus.crowding': 'भीड़',
        'bus.notify': 'मुझे सूचित करें',
        'track.live': 'लाइव ट्रैकिंग',
        'app.title': 'स्मार्ट बस साथी'
      }
    };
    return translations[language][key] || key;
  };

  return (
    <PreferencesContext.Provider value={{ language, toggleLanguage, highContrast, toggleContrast, t }}>
      {children}
    </PreferencesContext.Provider>
  );
};
