import React from 'react';
import { ScorePopup as ScorePopupType } from '../types';
import { BOARD_TILT_DEGREES, PERSPECTIVE_STRENGTH, PERSPECTIVE_HORIZONTAL_FACTOR, WORD_MIN_SCALE, WORD_MAX_SCALE } from '../constants';

interface ScorePopupProps {
    popup: ScorePopupType;
}

const ScorePopup: React.FC<ScorePopupProps> = ({ popup }) => {
    const COS_TILT = Math.cos(BOARD_TILT_DEGREES * Math.PI / 180);
    const boardProjectedHeight = 100 * COS_TILT;
    const boardTopOffset = (100 - boardProjectedHeight) / 2;

    const getProjectedY = (y: number): number => {
        const normalizedY = y / 100;
        const perspectiveY = Math.pow(normalizedY, PERSPECTIVE_STRENGTH);
        return boardTopOffset + (perspectiveY * boardProjectedHeight);
    };

    const style = React.useMemo(() => {
        const topPosition = getProjectedY(popup.y);
        const normalizedY = popup.y / 100;
        const perspectiveY = Math.pow(normalizedY, PERSPECTIVE_STRENGTH);
        const scale = WORD_MIN_SCALE + (WORD_MAX_SCALE - WORD_MIN_SCALE) * perspectiveY;
        const centerOffset = popup.x - 50;
        const horizontalScale = 1 + (PERSPECTIVE_HORIZONTAL_FACTOR - 1) * perspectiveY;
        const left = 50 + centerOffset * horizontalScale;

        return {
            left: `${left}%`,
            top: `${topPosition}%`,
            transform: `translateX(-50%) scale(${scale})`,
            textShadow: `0 0 4px ${popup.color === 'green' ? 'var(--color-success-light)' : 'var(--color-danger-light)'}, 0 0 10px ${popup.color === 'green' ? 'var(--color-success)' : 'var(--color-danger)'}`,
            zIndex: 20,
            willChange: 'transform, opacity',
        } as React.CSSProperties;
    }, [popup.y, popup.x, popup.color]);

    return (
        <div
            key={popup.id}
            className={`absolute text-3xl font-bold score-popup pointer-events-none ${popup.color === 'green' ? 'text-[var(--color-success-light)]' : 'text-[var(--color-danger)]'}`}
            style={style}
        >
            {popup.text}
        </div>
    );
};

export default React.memo(ScorePopup);