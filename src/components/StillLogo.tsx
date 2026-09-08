import React from 'react';

interface StillLogoProps {
  className?: string;
  size?: number | string;
}

export const StillLogo: React.FC<StillLogoProps> = ({
  className = 'w-5 h-5 text-indigo-400',
  size,
}) => {
  const angles = [0, 60, 120, 180, 240, 300];

  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={size ? { width: size, height: size } : undefined}
    >
      <defs>
        <linearGradient id="stillGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#818cf8" />
          <stop offset="100%" stopColor="#38bdf8" />
        </linearGradient>
      </defs>
      <g>
        {angles.map((angle) => (
          <g key={angle} transform={`rotate(${angle} 50 50)`}>
            <polygon
              points="50,6 63.5,25 50,44 36.5,25"
              stroke="currentColor"
              strokeWidth="3.2"
              strokeLinejoin="round"
              strokeLinecap="round"
              fill="currentColor"
              fillOpacity="0.12"
            />
          </g>
        ))}
      </g>
    </svg>
  );
};
