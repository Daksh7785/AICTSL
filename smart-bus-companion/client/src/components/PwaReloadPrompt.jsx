import React from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';

export default function PwaReloadPrompt() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    offlineReady: [offlineReady, setOfflineReady],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      console.log('SW Registered: ', r);
    },
    onRegisterError(error) {
      console.log('SW registration error', error);
    },
  });

  const close = () => {
    setOfflineReady(false);
    setNeedRefresh(false);
  };

  if (!offlineReady && !needRefresh) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 p-4 rounded-lg shadow-lg bg-white border border-gray-200 HC:bg-black HC:border-amber-400">
      <div className="text-sm mb-3 HC:text-amber-400">
        {offlineReady ? (
          <span>App ready to work offline</span>
        ) : (
          <span>New content available, click on reload button to update.</span>
        )}
      </div>
      <div className="flex gap-2">
        {needRefresh && (
          <button
            className="px-3 py-1.5 text-sm rounded bg-amber-500 text-white hover:bg-amber-600 HC:bg-amber-400 HC:text-black font-semibold"
            onClick={() => updateServiceWorker(true)}
          >
            Reload
          </button>
        )}
        <button
          className="px-3 py-1.5 text-sm rounded border border-gray-300 hover:bg-gray-50 HC:border-amber-400 HC:text-amber-400 HC:hover:bg-amber-900"
          onClick={() => close()}
        >
          Close
        </button>
      </div>
    </div>
  );
}
