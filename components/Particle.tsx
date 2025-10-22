import React from 'react';
import { Particle as ParticleType } from '../types';
import { BOARD_TILT_DEGREES, PERSPECTIVE_STRENGTH, PERSPECTIVE_HORIZONTAL_FACTOR, WORD_MIN_SCALE, WORD_MAX_SCALE } from '../constants';

interface ParticleProps {
    particle: ParticleType;
}

const Particle: React.FC<ParticleProps> = ({ particle }) => {
    const COS_TILT = Math.cos(BOARD_TILT_DEGREES * Math.PI / 180);
    const boardProjectedHeight = 100 * COS_TILT;
    const boardTopOffset = (100 - boardProjectedHeight) / 2;

    const getProjectedY = (y: number): number => {
        const normalizedY = y / 100;
        const perspectiveY = Math.pow(normalizedY, PERSPECTIVE_STRENGTH);
        return boardTopOffset + (perspectiveY * boardProjectedHeight);
    };

    const style = React.useMemo(() => {
        const topPosition = getProjectedY(particle.y);
        const normalizedY = particle.y / 100;
        const perspectiveY = Math.pow(normalizedY, PERSPECTIVE_STRENGTH);
        const scale = WORD_MIN_SCALE + (WORD_MAX_SCALE - WORD_MIN_SCALE) * perspectiveY;
        const centerOffset = particle.x - 50;
        const horizontalScale = 1 + (PERSPECTIVE_HORIZONTAL_FACTOR - 1) * perspectiveY;
        const left = 50 + centerOffset * horizontalScale;

        return {
            left: `${left}%`,
            top: `${topPosition}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            opacity: particle.opacity,
            transform: `translate(-50%, -50%) scale(${scale})`,
            transition: 'opacity 0.5s ease-out',
            backgroundColor: particle.color,
            boxShadow: `0 0 8px ${particle.color}`,
            willChange: 'transform, opacity',
        } as React.CSSProperties;
    }, [particle.y, particle.x, particle.size, particle.opacity, particle.color]);

    return <div key={particle.id} className="absolute rounded-full" style={style} />;
};

export default React.memo(Particle);