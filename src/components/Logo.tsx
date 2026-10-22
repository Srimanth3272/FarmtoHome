import React from 'react';
import Link from 'next/link';

interface LogoProps {
  className?: string;
  variant?: 'light' | 'dark';
}

export const Logo: React.FC<LogoProps> = ({ className = '', variant = 'dark' }) => {
  const isLight = variant === 'light';

  return (
    <Link href="/" className={`group flex items-center gap-3 select-none ${className}`}>
      {/* House & Leaf Motif Badge */}
      <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-forest-800 to-forest-950 text-white shadow-soft group-hover:scale-105 transition-transform duration-200">
        <svg
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-6 h-6"
        >
          {/* House Roof and Chimney outline */}
          <path
            d="M5 16L16 6L27 16"
            stroke="#FDE047"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M8 15V24C8 25.1046 8.89543 26 10 26H22C23.1046 26 24 25.1046 24 24V15"
            stroke="#86EFAC"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Sprouting leaf growing out from hearth of the home */}
          <path
            d="M16 23V14M16 14C16 11 19 10 21 11C21 13 19 16 16 16M16 17C16 15 13 14 11 15C11 17 13 19 16 19"
            stroke="#4ADE80"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        {/* Subtle glowing halo */}
        <div className="absolute -inset-0.5 rounded-xl bg-forest-400 opacity-20 blur-sm group-hover:opacity-40 transition-opacity" />
      </div>

      <div className="flex flex-col">
        <span
          className={`font-serif font-bold text-xl tracking-tight leading-none ${
            isLight ? 'text-white' : 'text-forest-950'
          }`}
        >
          Farm to Home
        </span>
        <span
          className={`text-[10px] uppercase font-semibold tracking-widest mt-0.5 ${
            isLight ? 'text-forest-200' : 'text-earth-600'
          }`}
        >
          Fresh from the Farm
        </span>
      </div>
    </Link>
  );
};
