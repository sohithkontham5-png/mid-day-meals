import React, { useState, useEffect } from 'react';
import { Wifi, Battery } from 'lucide-react';

export const MobileStatusBar: React.FC = () => {
  const [timeStr, setTimeStr] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, '0');
      const minutes = now.getMinutes().toString().padStart(2, '0');
      setTimeStr(`${hours}:${minutes}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full bg-white text-zinc-950 px-6 pt-3 pb-1 flex items-center justify-between text-xs font-semibold select-none shrink-0 z-30">
      {/* Time */}
      <span className="font-mono text-[13px] tracking-tight pl-1">{timeStr || '09:41'}</span>

      {/* Dynamic Island / Camera Notch */}
      <div className="w-24 h-5 bg-black rounded-full flex items-center justify-center space-x-1 shadow-inner">
        <span className="w-2 h-2 rounded-full bg-zinc-800" />
        <span className="w-2.5 h-2.5 rounded-full bg-zinc-900 border border-zinc-700/50" />
      </div>

      {/* Status Icons: Signal, 5G/Wi-Fi, Battery */}
      <div className="flex items-center space-x-1.5 pr-1 text-zinc-900">
        {/* 4 Signal bars */}
        <div className="flex items-end space-x-0.5 h-3">
          <span className="w-0.5 h-1 bg-black rounded-xs" />
          <span className="w-0.5 h-1.5 bg-black rounded-xs" />
          <span className="w-0.5 h-2.5 bg-black rounded-xs" />
          <span className="w-0.5 h-3 bg-black rounded-xs" />
        </div>

        <span className="text-[10px] font-mono font-bold">5G</span>

        {/* Wi-Fi Icon */}
        <Wifi className="w-3.5 h-3.5 stroke-[2.5]" />

        {/* Battery Icon */}
        <div className="flex items-center">
          <div className="w-5 h-2.5 border border-black rounded-[3px] p-0.5 flex items-center">
            <div className="w-full h-full bg-black rounded-[1px]" />
          </div>
          <div className="w-0.5 h-1 bg-black rounded-r-xs -ml-px" />
        </div>
      </div>
    </div>
  );
};

