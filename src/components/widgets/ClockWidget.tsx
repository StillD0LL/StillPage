import React, { useState, useEffect } from 'react';
import { Clock as ClockIcon, Sparkles, Moon, Sun, Sunrise, Sunset } from 'lucide-react';
import { WidgetSize } from '../../types';

interface ClockWidgetProps {
  size: WidgetSize;
  settings?: {
    showSeconds?: boolean;
    format24h?: boolean;
    showGreeting?: boolean;
    showDate?: boolean;
  };
  onUpdateSettings?: (settings: any) => void;
}

export const ClockWidget: React.FC<ClockWidgetProps> = ({
  size,
  settings,
  onUpdateSettings,
}) => {
  const [time, setTime] = useState(new Date());

  const showSeconds = settings?.showSeconds ?? false;
  const format24h = settings?.format24h ?? false;
  const showGreeting = settings?.showGreeting ?? true;
  const showDate = settings?.showDate ?? true;

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const hours = time.getHours();
  const minutes = String(time.getMinutes()).padStart(2, '0');
  const seconds = String(time.getSeconds()).padStart(2, '0');

  let displayHours = hours;
  let ampm = '';

  if (!format24h) {
    ampm = hours >= 12 ? 'PM' : 'AM';
    displayHours = hours % 12 || 12;
  }

  const formattedHours = String(displayHours).padStart(2, '0');

  // Greeting determination
  let greeting = 'Hello';
  let GreetingIcon = Sun;
  if (hours >= 5 && hours < 12) {
    greeting = 'Good morning';
    GreetingIcon = Sunrise;
  } else if (hours >= 12 && hours < 18) {
    greeting = 'Good afternoon';
    GreetingIcon = Sun;
  } else if (hours >= 18 && hours < 22) {
    greeting = 'Good evening';
    GreetingIcon = Sunset;
  } else {
    greeting = 'Good night';
    GreetingIcon = Moon;
  }

  const dateOptions: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  };
  const formattedDate = time.toLocaleDateString(undefined, dateOptions);

  const toggle24h = () => {
    onUpdateSettings?.({
      ...settings,
      format24h: !format24h,
    });
  };

  const toggleSeconds = () => {
    onUpdateSettings?.({
      ...settings,
      showSeconds: !showSeconds,
    });
  };

  return (
    <div className="h-full flex flex-col justify-between items-center text-center p-2 select-none">
      {/* Greeting Header */}
      {showGreeting && (
        <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-300/90 tracking-wide uppercase">
          <GreetingIcon className="w-3.5 h-3.5 text-amber-400" />
          <span>{greeting}</span>
        </div>
      )}

      {/* Main Digital Clock Numbers */}
      <div
        className="my-auto cursor-pointer group"
        onClick={toggle24h}
        title="Click to toggle 12h / 24h format"
      >
        <div className="text-4xl sm:text-5xl font-black text-white tracking-tight font-mono flex items-baseline justify-center gap-1">
          <span>{formattedHours}</span>
          <span className="animate-pulse text-indigo-400">:</span>
          <span>{minutes}</span>
          {showSeconds && (
            <>
              <span className="text-zinc-500 text-2xl">:</span>
              <span className="text-2xl text-zinc-400 font-semibold">{seconds}</span>
            </>
          )}
          {!format24h && (
            <span className="text-xs font-bold text-indigo-400 ml-1.5 uppercase">{ampm}</span>
          )}
        </div>
      </div>

      {/* Date & Quick Format Controls */}
      <div className="w-full flex items-center justify-between pt-2 border-t border-zinc-800/60 text-xs text-zinc-400">
        {showDate && <span className="font-medium truncate">{formattedDate}</span>}

        <div className="flex items-center gap-1 ml-auto">
          <button
            type="button"
            onClick={toggleSeconds}
            className={`text-[10px] px-1.5 py-0.5 rounded font-mono transition-colors ${
              showSeconds ? 'bg-indigo-600/30 text-indigo-300' : 'bg-zinc-800 text-zinc-500'
            }`}
            title="Toggle seconds"
          >
            :ss
          </button>
          <button
            type="button"
            onClick={toggle24h}
            className="text-[10px] px-1.5 py-0.5 rounded font-mono bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
            title="Toggle 12h / 24h"
          >
            {format24h ? '24h' : '12h'}
          </button>
        </div>
      </div>
    </div>
  );
};
