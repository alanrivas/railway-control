export interface Point {
  x: number;
  y: number;
}

export interface Track {
  id: string;
  start: Point;
  end: Point;
  type: 'straight' | 'curve' | 'switch';
  color?: string;       // Color de la vía
  route?: string;       // Ruta a la que pertenece ('main' o 'branch')
  switchId?: string;    // ID del switch que controla esta vía
  // Para curvas
  controlPoint?: Point; // Punto de control para curvas Bézier
  radius?: number;      // Radio de la curva
  startAngle?: number;  // Ángulo inicial
  endAngle?: number;    // Ángulo final
}

export interface Switch {
  id: string;
  position: Point;
  mainTrack: string;    // ID de la vía principal
  branchTrack: string;  // ID de la vía secundaria
  state: 'main' | 'branch'; // Estado actual del switch
  mainColor: string;    // Color cuando está en ruta principal
  branchColor: string;  // Color cuando está en ruta secundaria
  angle: number;        // Ángulo del switch
}

export interface Signal {
  id: string;
  position: Point;
  trackId: string;      // ID de la vía asociada
  state: 'red' | 'yellow' | 'green';
  direction: 'up' | 'down' | 'left' | 'right';
}

export interface Train {
  id: string;
  position: Point;
  currentTrackId: string;
  progress: number;        // Progreso en la vía actual (0-1)
  speed: number;          // Velocidad del tren
  direction: 'forward' | 'backward';
  isMoving: boolean;
  color: string;
  size: number;
  isWaitingAtSignal?: boolean; // Nuevo: indica si está esperando en un semáforo
}

export interface Simulation {
  isRunning: boolean;
  speed: number;          // Velocidad global de simulación
  trains: Train[];
}

export interface RailwayConfig {
  width: number;
  height: number;
  trackWidth: number;
}
