import React from 'react';
import logoImg from '../../assets/images/she_hunnar_logo_official.png';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
  variant?: 'light' | 'dark';
}

export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  showSubtitle = true,
  variant = 'light',
}) => {
  const logoDimensions = {
    sm: 'h-16',
    md: 'h-20 sm:h-24',
    lg: 'h-28 sm:h-32',
  }[size];

  return (
    <div className="flex items-center gap-2 group cursor-pointer">
      <img
        src={logoImg}
        alt="She Hunnar Logo"
        className={`${logoDimensions} w-auto object-contain transition-transform duration-300 group-hover:scale-105 filter drop-shadow-xs`}
      />
    </div>
  );
};
