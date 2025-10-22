import React from 'react';

const DECORATIONS_COUNT = 15;

interface Decoration {
  id: number;
  shape: 'line' | 'triangle' | 'plus';
  style: React.CSSProperties;
}

const ShapeLine = () => (
  <div className="flex items-center justify-center w-full h-full">
    <div className="w-full h-1 bg-[var(--color-secondary)]" style={{ transform: 'rotate(45deg)', boxShadow: '0 0 2px #fff, 0 0 6px var(--color-secondary-light), 0 0 10px var(--color-secondary), 2px 2px 5px rgba(0,0,0,0.5)' }}></div>
  </div>
);

const ShapeTriangle = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full" style={{ filter: 'drop-shadow(0 0 2px #fff) drop-shadow(0 0 6px var(--color-primary)) drop-shadow(2px 2px 4px rgba(0,0,0,0.6))' }}>
    <polygon points="50,10 90,90 10,90" stroke="var(--color-primary)" strokeWidth="5" fill="none" />
  </svg>
);

const ShapePlus = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full" style={{ filter: 'drop-shadow(0 0 2px #fff) drop-shadow(0 0 6px var(--color-secondary-light)) drop-shadow(2px 2px 4px rgba(0,0,0,0.6))' }}>
    <line x1="50" y1="10" x2="50" y2="90" stroke="var(--color-secondary-light)" strokeWidth="8" strokeLinecap="round" />
    <line x1="10" y1="50" x2="90" y2="50" stroke="var(--color-secondary-light)" strokeWidth="8" strokeLinecap="round" />
  </svg>
);


const generateDecorations = (): Decoration[] => {
  const decorations: Decoration[] = [];
  for (let i = 0; i < DECORATIONS_COUNT; i++) {
    const shapeType = Math.random();
    let shape: 'line' | 'triangle' | 'plus';
    if (shapeType < 0.4) {
      shape = 'line';
    } else if (shapeType < 0.8) {
      shape = 'triangle';
    } else {
      shape = 'plus';
    }

    const size = Math.random() * 50 + 20; // 20px to 70px
    const floatDuration = Math.random() * 20 + 20; // 20s to 40s
    const pulseDuration = Math.random() * 5 + 3; // 3s to 8s
    
    const startOpacity = Math.random() * 0.1 + 0.05; // 0.05 to 0.15
    const endOpacity = startOpacity + Math.random() * 0.2 + 0.1; // Add 0.1 to 0.3

    decorations.push({
      id: i,
      shape,
      style: {
        '--start-opacity': startOpacity,
        '--end-opacity': endOpacity,
        position: 'absolute',
        top: `${Math.random() * 90}%`,
        left: `${Math.random() * 90}%`,
        width: `${size}px`,
        height: `${size}px`,
        animation: `float-around ${floatDuration}s infinite ease-in-out, pulse-opacity ${pulseDuration}s infinite ease-in-out alternate`,
        animationDelay: `${Math.random() * -floatDuration}s, ${Math.random() * -pulseDuration}s`,
      } as React.CSSProperties,
    });
  }
  return decorations;
};

// Generate decorations only once
const decorations = generateDecorations();

const MenuBackgroundEffects: React.FC = () => {
  return (
    <div className="w-full h-full relative">
      {decorations.map(({ id, shape, style }) => (
        <div key={id} style={style}>
          {shape === 'line' && <ShapeLine />}
          {shape === 'triangle' && <ShapeTriangle />}
          {shape === 'plus' && <ShapePlus />}
        </div>
      ))}
    </div>
  );
};

export default MenuBackgroundEffects;