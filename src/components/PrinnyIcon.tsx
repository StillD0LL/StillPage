import React from 'react';

interface PrinnyIconProps {
  className?: string;
  size?: number;
}

export const PrinnyIcon: React.FC<PrinnyIconProps> = ({ className = 'w-5 h-5' }) => {
  return (
    <svg
      viewBox="0 0 32 38"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`inline-block shrink-0 ${className}`}
      style={{ imageRendering: 'pixelated' }}
    >
      {/* Black Outline & Base Silhouettes */}
      {/* Left Bat Wing Outline & Fill */}
      <path
        d="M2 16L1 19V20H2L3 21H5V19H7V18H8V15H7V13H5V12H3V14H2V16Z"
        fill="#000000"
      />
      <path
        d="M2 17L2 19H3V20H4V18H6V17H7V15H6V13H4V14H3V17H2Z"
        fill="#9B3B6D"
      />
      <path
        d="M3 15H4V17H3V15ZM4 14H5V16H4V14ZM5 16H6V17H5V16Z"
        fill="#C4568E"
      />

      {/* Main Body Outline */}
      <path
        d="M11 1H21V2H24V4H25V6H26V8H27V11H26V13H27V14H29V15H30V18H29V19H28V20H27V21H26V23H27V28H26V31H24V32H23V33H21V34H19V33H18V32H16V33H14V34H11V33H10V32H9V31H7V28H6V23H7V21H6V16H7V13H8V9H9V6H10V4H11V2H11V1Z"
        fill="#000000"
      />

      {/* Blue Body Base */}
      <path
        d="M12 2H20V4H23V6H24V8H25V11H24V14H23V16H24V21H25V28H24V30H23V31H21V32H19V31H18V30H15V31H14V32H11V31H10V30H8V28H7V21H8V16H9V14H8V9H9V6H10V4H12V2Z"
        fill="#3F63C6"
      />
      {/* Blue Body Highlights & Shading */}
      <path
        d="M13 3H19V5H21V7H22V10H21V12H20V14H19V16H18V18H17V20H15V18H14V14H13V10H12V6H13V3Z"
        fill="#557CE5"
      />
      <path
        d="M8 21H9V27H8V21ZM24 21H25V27H24V21ZM9 27H10V29H9V27ZM23 27H24V29H23V27Z"
        fill="#2A4494"
      />

      {/* Eye */}
      <path d="M14 6H17V10H14V6Z" fill="#000000" />
      <path d="M14 6H16V9H14V6Z" fill="#FFFFFF" />
      <path d="M15 7H16V8H15V7Z" fill="#000000" />

      {/* Yellow Beak */}
      <path
        d="M19 7H26V8H28V9H29V10H30V12H29V13H28V14H26V15H21V14H19V13H18V9H19V7Z"
        fill="#000000"
      />
      <path
        d="M20 8H25V9H27V10H28V12H27V13H25V14H21V13H19V10H20V8Z"
        fill="#FFCA00"
      />
      <path
        d="M21 9H24V10H26V11H27V12H25V13H21V12H20V10H21V9Z"
        fill="#FFE653"
      />
      <path
        d="M21 12H25V13H26V14H21V13V12Z"
        fill="#D68B00"
      />

      {/* White Pouch / Belly with Scallops */}
      <path
        d="M10 20H11V19H12V20H14V19H15V20H17V18H18V17H19V18H20V19H22V18H23V19H24V20H25V22H26V27H25V29H24V31H23V32H20V33H19V32H18V31H15V32H14V33H12V32H11V31H9V29H8V27H7V22H8V20H10Z"
        fill="#000000"
      />
      <path
        d="M11 21H12V20H13V21H15V20H16V21H18V19H19V20H21V20H22V21H24V22H25V27H24V29H23V31H22V32H20V31H19V30H16V31H14V32H12V31H10V29H9V27H8V22H9V21H11Z"
        fill="#FFFFFF"
      />
      <path
        d="M9 26H10V28H11V29H13V30H14V31H15V30H19V31H20V30H22V29H23V27H24V25H25V27H24V29H23V31H22V32H20V31H19V30H16V31H14V32H12V31H10V29H9V27H8V25H9V26Z"
        fill="#D6DCE7"
      />
      {/* Belly Stitches */}
      <path d="M12 25H14V26H12V25ZM18 25H20V26H18V25Z" fill="#A4B0C2" />

      {/* Wooden Peg Legs */}
      {/* Left Leg */}
      <path d="M11 33H14V38H13V39H12V38H11V33Z" fill="#000000" />
      <path d="M12 34H13V37H12V34Z" fill="#A85C38" />
      <path d="M12 34H12.5V36H12V34Z" fill="#C9784F" />

      {/* Right Leg */}
      <path d="M19 33H22V38H21V39H20V38H19V33Z" fill="#000000" />
      <path d="M20 34H21V37H20V34Z" fill="#A85C38" />
      <path d="M20 34H20.5V36H20V34Z" fill="#C9784F" />
    </svg>
  );
};
