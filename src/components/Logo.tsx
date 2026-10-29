import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface LogoProps {
  className?: string;
  variant?: 'light' | 'dark';
  size?: 'sm' | 'md' | 'lg' | 'hero';
  showText?: boolean;
  showTagline?: boolean;
}

export const Logo: React.FC<LogoProps> = ({
  className = '',
  variant = 'dark',
  size = 'md',
  showText = true,
  showTagline = true,
}) => {
  const isLight = variant === 'light';

  // Responsive size definitions
  const sizeConfig = {
    sm: { img: 'h-8 sm:h-9 w-auto', text: 'text-lg', sub: 'text-[9px]' },
    md: { img: 'h-10 sm:h-12 w-auto', text: 'text-xl sm:text-2xl', sub: 'text-[10px]' },
    lg: { img: 'h-14 sm:h-16 w-auto', text: 'text-2xl sm:text-3xl', sub: 'text-xs' },
    hero: { img: 'h-20 sm:h-24 w-auto', text: 'text-3xl sm:text-4xl', sub: 'text-sm' },
  };

  const cfg = sizeConfig[size] || sizeConfig.md;

  return (
    <Link href="/" className={`group flex items-center gap-2.5 sm:gap-3 select-none shrink-0 ${className}`}>
      {/* Official Farm to Home (F2H) App Logo */}
      <div
        className={`relative overflow-hidden rounded-xl shadow-xs transition-transform duration-200 group-hover:scale-105 shrink-0 ${
          isLight
            ? 'bg-[#FBF6EE] p-1 border border-cream-200/30'
            : 'border border-cream-200/80 bg-[#FBF6EE]'
        }`}
      >
        <Image
          src="/logo.jpeg"
          alt="Farm to Home (F2H) Logo"
          width={160}
          height={120}
          className={`${cfg.img} object-contain rounded-lg`}
          priority
        />
      </div>

      {showText && (
        <div className="flex flex-col justify-center shrink-0 min-w-max">
          <span
            className={`font-serif font-black tracking-tight leading-snug whitespace-nowrap ${cfg.text} ${
              isLight ? 'text-white' : 'text-forest-950'
            }`}
          >
            Farm to Home
          </span>
          {showTagline && (
            <span
              className={`uppercase font-bold tracking-widest whitespace-nowrap leading-none mt-0.5 ${cfg.sub} ${
                isLight ? 'text-harvest-300' : 'text-earth-600'
              }`}
            >
              Fresh from the Farm
            </span>
          )}
        </div>
      )}
    </Link>
  );
};
