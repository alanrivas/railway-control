import React from 'react';
import type { Track } from '../../types/railway';

interface TrackComponentProps {
  track: Track;
  strokeWidth?: number;
  color?: string;
}

export const TrackComponent: React.FC<TrackComponentProps> = ({
  track,
  strokeWidth = 4,
  color = '#8B4513'
}) => {
  return (
    <g>
      {/* Vía principal */}
      {track.type === 'straight' ? (
        <line
          x1={track.start.x}
          y1={track.start.y}
          x2={track.end.x}
          y2={track.end.y}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
      ) : track.type === 'curve' && track.controlPoint ? (
        <path
          d={`M ${track.start.x} ${track.start.y} Q ${track.controlPoint.x} ${track.controlPoint.y} ${track.end.x} ${track.end.y}`}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
      ) : null}
    </g>
  );
};
