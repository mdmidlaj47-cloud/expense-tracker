import React from 'react';

export default function RupyaSeedLogo({ className = "w-5 h-5" }) {
  return (
    <svg 
      viewBox="0 0 48 48" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="coinGradSmall" x1="26" y1="23" x2="38" y2="35" gradientUnits="userSpaceOnUse">
          <stop stopColor="#dba954" />
          <stop offset="0.5" stopColor="#c99a4c" />
          <stop offset="1" stopColor="#b8873d" />
        </linearGradient>
        <linearGradient id="coinInnerSmall" x1="28" y1="25" x2="36" y2="33" gradientUnits="userSpaceOnUse">
          <stop stopColor="#e8bf6a" />
          <stop offset="1" stopColor="#be8c3e" />
        </linearGradient>
      </defs>

      {/* Left Leaf (Soft Muted Sage) */}
      <path 
        d="M23 33C17 32 11 27 10.5 21C16.5 21.5 22 26.5 23 33Z" 
        fill="#75967f" 
      />
      <path 
        d="M10.5 21C14 23.5 19.5 29 23 33C20.5 28 16 22.5 10.5 21Z" 
        fill="#5e8068" 
      />

      {/* Center Vertical Leaf */}
      <path 
        d="M24 25C21 20 19 14 24 8C24 14 24 20 24 25Z" 
        fill="#8eb098" 
      />
      <path 
        d="M24 25C24 20 24 14 24 8C29 14 27 20 24 25Z" 
        fill="#6b8e76" 
      />

      {/* Golden Coin / Seed Pod (Right side) */}
      <circle cx="31.5" cy="29.5" r="7.5" fill="url(#coinGradSmall)" />
      <circle cx="31.5" cy="29.5" r="5.2" fill="url(#coinInnerSmall)" />
      <circle cx="31.5" cy="29.5" r="5.2" stroke="#eecf87" strokeWidth="0.8" fill="none" opacity="0.6" />

      {/* Main Curved Stem (Connecting leaves and arching over coin) */}
      <path 
        d="M23 38L25.5 38C25.5 35 25 32 27.5 26.5C30.5 21.5 34.5 21 35.5 21.5C36 22 35.5 24 33.5 25.5C30 28 27 32 27 38Z" 
        fill="#75967f" 
      />
      <path 
        d="M23 38C23 33 23 29 24 25C24 29 24 33 25 38Z" 
        fill="#5e8068" 
      />
    </svg>
  );
}
