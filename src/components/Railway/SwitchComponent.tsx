import React from 'react';
import type { Switch } from '../../types/railway';

interface SwitchComponentProps {
  switchData: Switch;
  onToggle?: (switchId: string) => void;
}

export const SwitchComponent: React.FC<SwitchComponentProps> = ({
  switchData,
  onToggle
}) => {
  const handleClick = () => {
    if (onToggle) {
      onToggle(switchData.id);
    }
  };

  const getCurrentColor = () => {
    return switchData.state === 'main' ? switchData.mainColor : switchData.branchColor;
  };

  return (
    <g
      onClick={handleClick}
      style={{ cursor: onToggle ? 'pointer' : 'default' }}
    >
      {/* Punto de switch */}
      <circle
        cx={switchData.position.x}
        cy={switchData.position.y}
        r={12}
        fill={getCurrentColor()}
        stroke="#FFF"
        strokeWidth={2}
      />
      
      {/* Indicador de dirección activa */}
      <circle
        cx={switchData.position.x}
        cy={switchData.position.y}
        r={6}
        fill="#FFF"
        opacity={0.8}
      />
      
      {/* ID del switch */}
      <text
        x={switchData.position.x}
        y={switchData.position.y + 25}
        textAnchor="middle"
        fontSize="12"
        fill="#FFF"
        fontWeight="bold"
      >
        {switchData.id}
      </text>
      
      {/* Estado actual */}
      <text
        x={switchData.position.x}
        y={switchData.position.y + 40}
        textAnchor="middle"
        fontSize="10"
        fill={getCurrentColor()}
        fontWeight="bold"
      >
        {switchData.state === 'main' ? 'MAIN' : 'BRANCH'}
      </text>
    </g>
  );
};
