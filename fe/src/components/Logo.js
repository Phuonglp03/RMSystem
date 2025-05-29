import React from 'react';

const logoStyles = {
  jesterHat: {
    position: 'relative',
    background: 'linear-gradient(45deg, #d4af37, #f4e99b)',
    clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)',
    transition: 'transform 0.3s ease'
  },
  jesterBell: {
    position: 'absolute',
    width: '12px',
    height: '12px',
    borderRadius: '50%',
    background: 'linear-gradient(45deg, #ff6b6b, #ff8e8e)',
    boxShadow: '0 0 8px rgba(255, 107, 107, 0.6)'
  },
  goldText: {
    background: 'linear-gradient(45deg, #d4af37 0%, #f4e99b 50%, #d4af37 100%)',
    backgroundClip: 'text',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    fontFamily: 'Georgia, serif',
    // Fallback cho browser không support
    color: '#d4af37'
  },
  mainLogoContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center'
  },
  horizontalLogoContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px'
  },
  minimalLogoContainer: {
    textAlign: 'center'
  }
};

export const JesterHat = ({ size = 40, animate = true, style = {} }) => (
  <div 
    style={{ 
      position: 'relative',
      width: size, 
      height: size,
      ...style
    }}
  >
    <div 
      style={{
        ...logoStyles.jesterHat,
        width: '100%',
        height: '100%',
        transform: animate ? 'rotate(-2deg)' : 'none'
      }}
    >
      {/* Chuông 1 - trái trên */}
      <div 
        style={{
          ...logoStyles.jesterBell,
          top: '-6px',
          left: '-6px'
        }}
      />
      {/* Chuông 2 - phải trên */}
      <div 
        style={{
          ...logoStyles.jesterBell,
          top: '-6px',
          right: '-6px'
        }}
      />
      {/* Chuông 3 - giữa dưới */}
      <div 
        style={{
          ...logoStyles.jesterBell,
          bottom: '10px',
          left: '50%',
          transform: 'translateX(-50%)'
        }}
      />
    </div>
  </div>
);

export const MainLogo = ({ className = "", style = {} }) => (
  <div 
    className={className}
    style={{
      ...logoStyles.mainLogoContainer,
      ...style
    }}
  >
    <JesterHat size={60} animate={true} style={{ marginBottom: '8 px' }} />
    <h1 
      style={{
        ...logoStyles.goldText,
        fontSize: '32px',
        fontWeight: '300',
        letterSpacing: '3px',
        textTransform: 'uppercase',
        margin: '0 0 8px 0',
        lineHeight: '1',
        whiteSpace: 'nowrap'
      }}
    >
      The Fool
    </h1>
    
  </div>
);

export const HorizontalLogo = ({ 
  className = "", 
  size = "medium", 
  style = {} 
}) => {
  const sizes = {
    small: { icon: 30, fontSize: '20px' },
    medium: { icon: 40, fontSize: '28px' },
    large: { icon: 50, fontSize: '36px' }
  };
  
  const currentSize = sizes[size];
  
  return (
    <div 
      className={className}
      style={{
        ...logoStyles.horizontalLogoContainer,
        ...style
      }}
    >
      <JesterHat size={currentSize.icon} animate={false} />
      <h2 
        style={{
          ...logoStyles.goldText,
          fontSize: currentSize.fontSize,
          fontWeight: '300',
          letterSpacing: '2px',
          textTransform: 'uppercase',
          margin: '0',
          lineHeight: '1'
        }}
      >
        The Fool
      </h2>
    </div>
  );
};

export const MinimalLogo = ({ 
  className = "", 
  showTagline = true, 
  style = {},
  textColor = null
}) => (
  <div 
    className={className}
    style={{
      ...logoStyles.minimalLogoContainer,
      ...style
    }}
  >
    <h2 
      style={{
        ...(textColor ? { color: textColor } : logoStyles.goldText),
        fontSize: '36px',
        fontWeight: '300',
        letterSpacing: '2px',
        textTransform: 'uppercase',
        margin: '0 0 8px 0',
        lineHeight: '1'
      }}
    >
      The Fool
    </h2>
    {showTagline && (
      <p 
        style={{
          color: textColor || '#666',
          fontStyle: 'italic',
          letterSpacing: '1px',
          fontSize: '16px',
          fontFamily: 'Georgia, serif',
          margin: '0'
        }}
      >
        Restaurant
      </p>
    )}
  </div>
);

export const AntdLogoDemo = () => {
  return (
    <div style={{ padding: '24px', backgroundColor: '#fff' }}>
      <div style={{ 
        borderBottom: '1px solid #f0f0f0', 
        paddingBottom: '24px', 
        marginBottom: '32px' 
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center' 
        }}>
          <HorizontalLogo size="medium" />
          <div style={{ display: 'flex', gap: '24px' }}>
            <a href="#" style={{ color: '#666', textDecoration: 'none' }}>Menu</a>
            <a href="#" style={{ color: '#666', textDecoration: 'none' }}>Đặt bàn</a>
            <a href="#" style={{ color: '#666', textDecoration: 'none' }}>Liên hệ</a>
          </div>
        </div>
      </div>

      <div style={{ 
        textAlign: 'center', 
        padding: '64px 24px',
        background: 'linear-gradient(to bottom, #fafafa, #fff)',
        borderRadius: '12px',
        marginBottom: '32px'
      }}>
        <MainLogo />
        <p style={{ 
          color: '#666', 
          fontSize: '20px', 
          marginTop: '32px',
          maxWidth: '600px',
          margin: '32px auto 0',
          lineHeight: '1.6'
        }}>
          Chào mừng đến với The Fool Restaurant - Nơi ẩm thực gặp gỡ nghệ thuật
        </p>
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
        gap: '24px' 
      }}>
        <div style={{ 
          background: '#fafafa', 
          padding: '32px', 
          borderRadius: '8px', 
          textAlign: 'center' 
        }}>
          <h3 style={{ marginBottom: '16px', color: '#333' }}>Logo Chính</h3>
          <MainLogo />
        </div>
        
        <div style={{ 
          background: '#fafafa', 
          padding: '32px', 
          borderRadius: '8px', 
          textAlign: 'center' 
        }}>
          <h3 style={{ marginBottom: '16px', color: '#333' }}>Logo Ngang</h3>
          <HorizontalLogo size="small" style={{ justifyContent: 'center' }} />
        </div>
        
        <div style={{ 
          background: '#fafafa', 
          padding: '32px', 
          borderRadius: '8px', 
          textAlign: 'center' 
        }}>
          <h3 style={{ marginBottom: '16px', color: '#333' }}>Logo Tối giản</h3>
          <MinimalLogo />
        </div>
      </div>
    </div>
  );
};