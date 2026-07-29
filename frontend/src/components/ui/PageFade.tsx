import React from 'react';

interface PageFadeProps {
  children: React.ReactNode;
  className?: string;
}

export default function PageFade({ children, className = '' }: PageFadeProps) {
  return (
    <div className={`animate-fade-in transition-all duration-300 ${className}`}>
      {children}
    </div>
  );
}
