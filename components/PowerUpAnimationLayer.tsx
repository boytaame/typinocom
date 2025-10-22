import React, { useState, useEffect } from 'react';
import { PowerUpNotificationInfo, PowerUpType } from '../types';
import { POWER_UP_CONFIG } from '../constants';

const PowerUpIcons: Record<PowerUpType, React.FC<{className: string}>> = {
  [PowerUpType.TimeWarp]: ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
  ),
  [PowerUpType.ScoreSurge]: ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z" />
    </svg>
  ),
  [PowerUpType.SystemShock]: ({className}) => (
     <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456Z" />
     </svg>
  ),
};


interface PowerUpNotificationProps {
  notification: PowerUpNotificationInfo;
  onComplete: (id: number) => void;
}

const NOTIFICATION_DURATION = 2500;
const ANIMATION_OUT_DURATION = 400;

const PowerUpNotification: React.FC<PowerUpNotificationProps> = ({ notification, onComplete }) => {
  const [animationClass, setAnimationClass] = useState('animate-slide-in-from-top');
  
  useEffect(() => {
    const exitTimer = setTimeout(() => {
      setAnimationClass('animate-slide-out-to-top');
    }, NOTIFICATION_DURATION - ANIMATION_OUT_DURATION);
    
    const removeTimer = setTimeout(() => {
      onComplete(notification.id);
    }, NOTIFICATION_DURATION);

    return () => {
      clearTimeout(exitTimer);
      clearTimeout(removeTimer);
    };
  }, [notification.id, onComplete]);
  
  const config = POWER_UP_CONFIG[notification.type as keyof typeof POWER_UP_CONFIG];
  const Icon = PowerUpIcons[notification.type];

  return (
    <div className={`w-80 h-32 p-4 rounded-lg border-2 border-[var(--color-primary-light)] bg-slate-900/80 shadow-[inset_0_0_8px_rgba(0,0,0,0.6),0_0_3px_#fff,0_0_8px_var(--color-primary-light),0_0_15px_var(--color-primary),4px_4px_15px_rgba(0,0,0,0.5)] backdrop-blur-sm flex flex-col items-center justify-center ${animationClass}`}
    >
      <div className="flex items-center">
        <Icon className="w-10 h-10 text-[var(--color-primary-text-on-dark)]" />
        <div className="ml-4 text-left">
          <p className="text-sm text-[var(--color-secondary-text-on-dark)]">POWER-UP ACQUIRED</p>
          <h3 className="text-2xl font-bold text-[var(--color-text-base)] tracking-wider">{config.name}</h3>
        </div>
      </div>
    </div>
  );
};

interface PowerUpAnimationLayerProps {
  notifications: PowerUpNotificationInfo[];
  onAnimationComplete: (id: number) => void;
}

const PowerUpAnimationLayer: React.FC<PowerUpAnimationLayerProps> = ({ notifications, onAnimationComplete }) => {
  return (
    <div 
        className="absolute top-0 left-0 w-full h-full pointer-events-none z-40 flex justify-center items-start pt-8"
    >
        {notifications.map(notification => (
            <PowerUpNotification
              key={notification.id}
              notification={notification}
              onComplete={onAnimationComplete}
            />
        ))}
    </div>
  );
};

export default PowerUpAnimationLayer;