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
        <linearGradient id="seedLeafLeft" x1="12" y1="28" x2="24" y2="12" gradientUnits="userSpaceOnUse">
          <stop stopColor="#6ee7b7" />
          <stop offset="1" stopColor="#ecfdf5" />
        </linearGradient>
        <linearGradient id="seedLeafRight" x1="24" y1="24" x2="38" y2="10" gradientUnits="userSpaceOnUse">
          <stop stopColor="#34d399" />
          <stop offset="1" stopColor="#a7f3d0" />
        </linearGradient>
        <linearGradient id="seedBaseGrad" x1="19" y1="33" x2="29" y2="43" gradientUnits="userSpaceOnUse">
          <stop stopColor="#fef08a" />
          <stop offset="1" stopColor="#f59e0b" />
        </linearGradient>
      </defs>

      {/* Main Upright Curved Sprout Stem */}
      <path 
        d="M24 37C24 31 23.5 24 24 16" 
        stroke="#a7f3d0" 
        strokeWidth="3.2" 
        strokeLinecap="round" 
      />

      {/* Left Leaf - unfurling gently */}
      <path 
        d="M23.5 25C18.5 25 13 20.5 12 14C18.5 13.5 23 18.5 23.5 25Z" 
        fill="url(#seedLeafLeft)" 
      />

      {/* Right Leaf - reaching higher for growth & prosperity */}
      <path 
        d="M24.5 21C28 16.5 34.5 12 37.5 13C37.5 19.5 31.5 22.5 24.5 21Z" 
        fill="url(#seedLeafRight)" 
      />

      {/* Golden Seed at base */}
      <path 
        d="M19.5 37.5C19.5 34.5 24 30.5 24 30.5C24 30.5 28.5 34.5 28.5 37.5C28.5 40 26.5 42 24 42C21.5 42 19.5 40 19.5 37.5Z" 
        fill="url(#seedBaseGrad)" 
      />
      
      {/* Light Spark of Prosperity */}
      <circle cx="38.5" cy="11.5" r="1.5" fill="#fef08a" />
    </svg>
  );
}
