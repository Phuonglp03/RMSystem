import React from 'react';

export const JesterHat = ({ size = 40, animate = true }) => (
    <div 
      className={`relative ${animate ? 'animate-pulse' : ''}`}
      style={{ width: size, height: size }}
    >
      <div 
        className="w-full h-full relative"
        style={{
          background: 'linear-gradient(45deg, #d4af37, #f4e99b)',
          clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)',
          transform: animate ? 'rotate(-2deg)' : 'none',
          transition: 'transform 0.3s ease'
        }}
      >
        {/* Chuông 1 */}
        <div 
          className="absolute w-3 h-3 rounded-full"
          style={{
            background: 'linear-gradient(45deg, #ff6b6b, #ff8e8e)',
            top: '-6px',
            left: '-6px',
            boxShadow: '0 0 8px rgba(255, 107, 107, 0.6)'
          }}
        />
        <div 
          className="absolute w-3 h-3 rounded-full"
          style={{
            background: 'linear-gradient(45deg, #ff6b6b, #ff8e8e)',
            top: '-6px',
            right: '-6px',
            boxShadow: '0 0 8px rgba(255, 107, 107, 0.6)'
          }}
        />
        {/* Chuông 3 */}
        <div 
          className="absolute w-3 h-3 rounded-full"
          style={{
            background: 'linear-gradient(45deg, #ff6b6b, #ff8e8e)',
            bottom: '10px',
            left: '50%',
            transform: 'translateX(-50%)',
            boxShadow: '0 0 8px rgba(255, 107, 107, 0.6)'
          }}
        />
      </div>
    </div>
  );
  
  // 1. Logo chính - Phiên bản đầy đủ
  export const MainLogo = ({ className = "" }) => (
    <div className={`flex flex-col items-center ${className}`}>
      <JesterHat size={60} animate={true} />
      <h1 
        className="text-4xl font-light tracking-wider uppercase mt-4 mb-2"
        style={{
          background: 'linear-gradient(45deg, #d4af37 0%, #f4e99b 50%, #d4af37 100%)',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          fontFamily: 'Georgia, serif'
        }}
      >
        The Fool
      </h1>
      <p 
        className="text-gray-600 italic tracking-wide text-lg"
        style={{ fontFamily: 'Georgia, serif' }}
      >
        Restaurant
      </p>
    </div>
  );
  
  // 2. Logo ngang - Cho header/navbar
  export const HorizontalLogo = ({ className = "", size = "medium" }) => {
    const sizes = {
      small: { icon: 30, text: 'text-xl' },
      medium: { icon: 40, text: 'text-2xl' },
      large: { icon: 50, text: 'text-3xl' }
    };
    
    const currentSize = sizes[size];
    
    return (
      <div className={`flex items-center gap-4 ${className}`}>
        <JesterHat size={currentSize.icon} animate={false} />
        <h2 
          className={`${currentSize.text} font-light tracking-wider uppercase`}
          style={{
            background: 'linear-gradient(45deg, #d4af37 0%, #f4e99b 50%, #d4af37 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontFamily: 'Georgia, serif'
          }}
        >
          The Fool
        </h2>
      </div>
    );
  };
  
  export const MinimalLogo = ({ className = "", showTagline = true }) => (
    <div className={`text-center ${className}`}>
      <h2 
        className="text-3xl font-light tracking-wider uppercase mb-2"
        style={{
          background: 'linear-gradient(45deg, #d4af37 0%, #f4e99b 50%, #d4af37 100%)',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          fontFamily: 'Georgia, serif'
        }}
      >
        The Fool
      </h2>
      {showTagline && (
        <p 
          className="text-gray-600 italic tracking-wide"
          style={{ fontFamily: 'Georgia, serif' }}
        >
          Restaurant
        </p>
      )}
    </div>
  );