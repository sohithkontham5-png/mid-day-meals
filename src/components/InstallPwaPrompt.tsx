import React, { useState, useEffect } from 'react';
import { Smartphone, Download, X, ArrowUpRight } from 'lucide-react';

export const InstallPwaPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if already in standalone PWA mode
    const isStandaloneMode = 
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;
    setIsStandalone(isStandaloneMode);

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    // Listen for beforeinstallprompt event (Android / Desktop Chrome)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstallable(false);
    }
    setDeferredPrompt(null);
  };

  // Don't show if already installed in standalone mode or dismissed
  if (isStandalone || isDismissed) return null;

  // Show if either Android/Chrome installable or on iOS browser
  if (!isInstallable && !isIOS) return null;

  return (
    <div className="md:hidden mx-4 mb-4 bg-zinc-950 text-white p-3.5 rounded-xl shadow-lg border border-zinc-800 flex items-center justify-between gap-3 animate-in fade-in slide-in-from-bottom-2">
      <div className="flex items-center space-x-2.5 overflow-hidden">
        <div className="w-8 h-8 rounded-lg bg-white text-black flex items-center justify-center shrink-0">
          <Smartphone className="w-4 h-4" />
        </div>
        <div className="overflow-hidden">
          <div className="font-bold text-xs truncate">Install MDM Mobile App</div>
          <div className="text-[10px] text-zinc-400 font-mono truncate">
            {isIOS ? 'Tap Share and Add to Home Screen' : '1-tap access on your phone'}
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-1.5 shrink-0">
        {isInstallable && (
          <button
            onClick={handleInstallClick}
            className="bg-white text-black text-xs font-bold px-3 py-1.5 rounded-lg active:scale-95 transition-all shadow-sm flex items-center space-x-1"
          >
            <Download className="w-3 h-3" />
            <span>Install</span>
          </button>
        )}
        <button
          onClick={() => setIsDismissed(true)}
          className="p-1 text-zinc-400 hover:text-white"
          aria-label="Dismiss install banner"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
