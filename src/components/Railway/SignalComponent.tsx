import React from 'react';
import type { Signal } from '../../types/railway';

interface SignalComponentProps {
  signal: Signal;
  onToggle?: (signalId: string) => void;
}

export const SignalComponent: React.FC<SignalComponentProps> = ({
  signal,
  onToggle
}) => {
  const handleClick = () => {
    if (onToggle) {
      onToggle(signal.id);
    }
  };

  const getSignalColor = () => {
    switch (signal.state) {
      case 'red': return '#F44336';
      case 'yellow': return '#FFC107';
      case 'green': return '#4CAF50';
      default: return '#F44336';
    }
  };

  return (
    <g
      onClick={handleClick}
      style={{ cursor: onToggle ? 'pointer' : 'default' }}
    >
      {/* Poste de la señal */}
      <line
        x1={signal.position.x}
        y1={signal.position.y}
        x2={signal.position.x}
        y2={signal.position.y - 20}
        stroke="#666"
        strokeWidth={3}
      />
      
      {/* Luz de la señal */}
      <circle
        cx={signal.position.x}
        cy={signal.position.y - 25}
        r={6}
        fill={getSignalColor()}
        stroke="#333"
        strokeWidth={1}
      />
      
      {/* ID de la señal */}
      <text
        x={signal.position.x + 15}
        y={signal.position.y - 20}
        fontSize="10"
        fill="#333"
        fontWeight="bold"
      >
        {signal.id}
      </text>
    </g>
  );
};
