import React from 'react';

interface HireFlowLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  whiteText?: boolean;
}

export const HireFlowLogo: React.FC<HireFlowLogoProps> = ({
  className = '',
  size = 'md',
  showText = true,
  whiteText = false,
}) => {
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
  };

  const textSizes = {
    sm: 'text-base font-semibold',
    md: 'text-lg font-semibold tracking-tight',
    lg: 'text-2xl font-bold tracking-tight',
  };

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Precision Vector Icon matching user's Image 1 & Image 2 */}
      <div className={`relative ${iconSizes[size]} shrink-0 rounded-xl overflow-hidden shadow-xs flex items-center justify-center`}>
        <svg
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          {/* Background Squircle */}
          <rect width="48" height="48" rx="14" fill="#005F3A" />
          
          {/* Left Vertical Bar of H */}
          <rect x="13" y="14" width="6" height="20" rx="3" fill="#FFFFFF" />
          
          {/* Horizontal Crossbar of H */}
          <rect x="13" y="22" width="22" height="5" rx="2.5" fill="#FFFFFF" />
          
          {/* Right Vertical Bar of H */}
          <rect x="29" y="17" width="6" height="17" rx="3" fill="#FFFFFF" />
          
          {/* Beacon Dot floating above right stem of H */}
          <circle cx="32" cy="12" r="3.2" fill="#E5A823" />
        </svg>
      </div>

      {showText && (
        <span className={`${textSizes[size]} font-['Inter'] flex items-baseline leading-none`}>
          <span className={whiteText ? 'text-white' : 'text-[#131e19]'}>Hire</span>
          <span className="text-[#005f3a]">Flow</span>
        </span>
      )}
    </div>
  );
};
