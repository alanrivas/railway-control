import React from 'react';
import type { Train } from '../../types/railway';

interface TrainComponentProps {
  train: Train;
}

export const TrainComponent: React.FC<TrainComponentProps> = ({ train }) => {
  return (
    <g>
      {/* Cuerpo principal del tren */}
      <rect
        x={train.position.x - train.size / 2}
        y={train.position.y - train.size / 3}
        width={train.size}
        height={train.size / 1.5}
        fill={train.color}
        stroke="#000"
        strokeWidth={1}
        rx={2}
      />
      
      {/* Ventanas del tren */}
      <rect
        x={train.position.x - train.size / 3}
        y={train.position.y - train.size / 5}
        width={train.size / 6}
        height={train.size / 8}
        fill="#87CEEB"
        stroke="#000"
        strokeWidth={0.5}
      />
      <rect
        x={train.position.x - train.size / 8}
        y={train.position.y - train.size / 5}
        width={train.size / 6}
        height={train.size / 8}
        fill="#87CEEB"
        stroke="#000"
        strokeWidth={0.5}
      />
      <rect
        x={train.position.x + train.size / 12}
        y={train.position.y - train.size / 5}
        width={train.size / 6}
        height={train.size / 8}
        fill="#87CEEB"
        stroke="#000"
        strokeWidth={0.5}
      />
      
      {/* Ruedas */}
      <circle
        cx={train.position.x - train.size / 4}
        cy={train.position.y + train.size / 6}
        r={train.size / 12}
        fill="#333"
        stroke="#000"
        strokeWidth={1}
      />
      <circle
        cx={train.position.x + train.size / 4}
        cy={train.position.y + train.size / 6}
        r={train.size / 12}
        fill="#333"
        stroke="#000"
        strokeWidth={1}
      />
      
      {/* ID del tren */}
      <text
        x={train.position.x}
        y={train.position.y + 2}
        textAnchor="middle"
        fontSize="8"
        fill="#FFF"
        fontWeight="bold"
      >
        {train.id}
      </text>
      
      {/* Indicador de movimiento */}
      {train.isMoving && (
        <circle
          cx={train.position.x + train.size / 2 + 5}
          cy={train.position.y - train.size / 3}
          r={3}
          fill="#00FF00"
          opacity={0.8}
        >
          <animate attributeName="opacity" values="0.8;0.3;0.8" dur="1s" repeatCount="indefinite" />
        </circle>
      )}
    </g>
  );
};
