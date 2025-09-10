import React, { useEffect, useState } from 'react';
import type { RailwayConfig, Signal, Switch, Track, Train } from '../../types/railway';
import { getTrackColor } from '../../utils/trackUtils';
import { SignalComponent } from './SignalComponent';
import { SwitchComponent } from './SwitchComponent';
import { TrackComponent } from './TrackComponent';
import { TrainComponent } from './TrainComponent';

interface RailwaySystemProps {
  config?: Partial<RailwayConfig>;
}

export const RailwaySystem: React.FC<RailwaySystemProps> = ({
  config = {}
}) => {
  const defaultConfig: RailwayConfig = {
    width: 1000,
    height: 600,
    trackWidth: 4,
    ...config
  };

  // Estado para switches y señales
  const [switches, setSwitches] = useState<Switch[]>([
    {
      id: 'SW1',
      position: { x: 300, y: 200 }, // Exactamente en el punto de decisión
      mainTrack: 'track-2-main',
      branchTrack: 'track-2-branch-1',
      state: 'main', // Inicialmente en ruta principal
      mainColor: '#00FF00',    // Verde para ruta principal
      branchColor: '#FF0000',  // Rojo para ruta de desvío
      angle: 45
    },
    {
      id: 'SW2',
      position: { x: 600, y: 200 }, // Exactamente en el segundo punto de decisión
      mainTrack: 'track-3-main',
      branchTrack: 'track-3-branch-1',
      state: 'branch', // Inicialmente en ruta de desvío
      mainColor: '#00BFFF',    // Azul para ruta principal
      branchColor: '#FF6600',  // Naranja para ruta de desvío
      angle: -45
    }
  ]);

  const [signals, setSignals] = useState<Signal[]>([
    {
      id: 'S1',
      position: { x: 150, y: 190 }, // Ligeramente arriba de la vía
      trackId: 'track-1',
      state: 'green',
      direction: 'right'
    },
    {
      id: 'S2',
      position: { x: 450, y: 190 },
      trackId: 'track-2-main',
      state: 'red',
      direction: 'right'
    },
    {
      id: 'S3',
      position: { x: 750, y: 190 },
      trackId: 'track-3-main',
      state: 'green',
      direction: 'right'
    }
  ]);

  // Estado del tren 1 y simulación
  const [train, setTrain] = useState<Train>({
    id: 'T1',
    position: { x: 50, y: 200 },
    currentTrackId: 'track-1',
    progress: 0,
    speed: 0.00125, // velocidad base - 1/10 de 0.0125
    direction: 'forward',
    isMoving: false,
    color: '#DC143C',
    size: 24,
    isWaitingAtSignal: false
  });

  const [simulation, setSimulation] = useState({
    isRunning: false,
    speed: 1.0 // multiplicador de velocidad
  });

  // Estado del tren 2 (nuevo)
  const [train2, setTrain2] = useState<Train>({
    id: 'T2',
    position: { x: 60, y: 280 },
    currentTrackId: 'track-0-horizontal',
    progress: 0,
    speed: 0.00125,
    direction: 'forward',
    isMoving: false,
    color: '#2E8B57', // Verde mar
    size: 24,
    isWaitingAtSignal: false
  });

  const [simulation2, setSimulation2] = useState({
    isRunning: false,
    speed: 1.0
  });

  // Referencia para el interval de animación
  // const [animationFrame, setAnimationFrame] = useState<number | null>(null);

  // Sistema de vías complejo con múltiples rutas
  const tracks: Track[] = [
    // Vía principal horizontal superior (común - siempre activa)
    {
      id: 'track-1',
      start: { x: 50, y: 200 },
      end: { x: 300, y: 200 },
      type: 'straight',
      color: '#FFD700' // Dorado por defecto
    },
    
    // NUEVA VÍA: Entrada desde abajo - Parte horizontal
    {
      id: 'track-0-horizontal',
      start: { x: 60, y: 280 },
      end: { x: 266, y: 280 },
      type: 'straight',
      color: '#FFD700' // Dorado por defecto
    },
    
    // NUEVA VÍA: Entrada desde abajo - Parte diagonal hacia SW1 (corta pero conectada)
    {
      id: 'track-0-diagonal',
      start: { x: 266, y: 280 },
      end: { x: 300, y: 200 },
      type: 'straight',
      color: '#FFD700' // Dorado por defecto
    },
    
    // DESDE AQUÍ EL SWITCH SW1 DECIDE:
    // Opción 1: Vía principal continuación (SW1 en estado 'main')
    {
      id: 'track-2-main',
      start: { x: 300, y: 200 },
      end: { x: 600, y: 200 },
      type: 'straight',
      route: 'main',
      switchId: 'SW1'
    },
    
    // Opción 2: Vía de desvío superior (SW1 en estado 'branch')
    {
      id: 'track-2-branch-1',
      start: { x: 300, y: 200 },
      end: { x: 450, y: 150 },
      type: 'straight',
      route: 'branch',
      switchId: 'SW1'
    },
    {
      id: 'track-2-branch-2',
      start: { x: 450, y: 150 },
      end: { x: 600, y: 150 },
      type: 'straight',
      route: 'branch',
      switchId: 'SW1'
    },
    {
      id: 'track-2-branch-3',
      start: { x: 600, y: 150 },
      end: { x: 600, y: 200 },
      type: 'straight',
      route: 'branch',
      switchId: 'SW1'
    },
    
    // DESDE AQUÍ EL SWITCH SW2 DECIDE:
    // Opción 1: Continuar recto (SW2 en estado 'main')
    {
      id: 'track-3-main',
      start: { x: 600, y: 200 },
      end: { x: 800, y: 200 },
      type: 'straight',
      route: 'main',
      switchId: 'SW2'
    },
    
    // Opción 2: Desvío hacia abajo (SW2 en estado 'branch')
    {
      id: 'track-3-branch-1',
      start: { x: 600, y: 200 },
      end: { x: 750, y: 300 },
      type: 'straight',
      route: 'branch',
      switchId: 'SW2'
    },
    {
      id: 'track-3-branch-2',
      start: { x: 750, y: 300 },
      end: { x: 950, y: 300 },
      type: 'straight',
      route: 'branch',
      switchId: 'SW2'
    }
  ];

  const handleSwitchToggle = (switchId: string) => {
    setSwitches(prev => prev.map(sw => 
      sw.id === switchId 
        ? { ...sw, state: sw.state === 'main' ? 'branch' : 'main' }
        : sw
    ));
  };

  const handleSignalToggle = (signalId: string) => {
    setSignals(prev => prev.map(signal => {
      if (signal.id === signalId) {
        // Solo alternar entre rojo y verde
        const newState = signal.state === 'red' ? 'green' : 'red';
        return { ...signal, state: newState };
      }
      return signal;
    }));
  };

  // Funciones de control de simulación
  const startSimulation = () => {
    setSimulation(prev => ({ ...prev, isRunning: true }));
    setTrain(prev => ({ ...prev, isMoving: true }));
  };

  const stopSimulation = () => {
    setSimulation(prev => ({ ...prev, isRunning: false }));
    setTrain(prev => ({ ...prev, isMoving: false }));
  };

  const resetSimulation = () => {
    setSimulation({ isRunning: false, speed: 1.0 });
    setTrain({
      id: 'T1',
      position: { x: 50, y: 200 },
      currentTrackId: 'track-1',
      progress: 0,
      speed: 0.00125,
      direction: 'forward',
      isMoving: false,
      color: '#DC143C',
      size: 24,
      isWaitingAtSignal: false
    });
  };

  const updateSpeed = (newSpeed: number) => {
    setSimulation(prev => ({ ...prev, speed: newSpeed }));
  };

  // Funciones de control para el segundo tren
  const startSimulation2 = () => {
    setSimulation2(prev => ({ ...prev, isRunning: true }));
    setTrain2(prev => ({ ...prev, isMoving: true }));
  };

  const stopSimulation2 = () => {
    setSimulation2(prev => ({ ...prev, isRunning: false }));
    setTrain2(prev => ({ ...prev, isMoving: false }));
  };

  const resetSimulation2 = () => {
    setSimulation2({ isRunning: false, speed: 1.0 });
    setTrain2({
      id: 'T2',
      position: { x: 60, y: 280 },
      currentTrackId: 'track-0-horizontal',
      progress: 0,
      speed: 0.00125,
      direction: 'forward',
      isMoving: false,
      color: '#2E8B57',
      size: 24,
      isWaitingAtSignal: false
    });
  };

  const updateSpeed2 = (newSpeed: number) => {
    setSimulation2(prev => ({ ...prev, speed: newSpeed }));
  };

  // Loop de animación SUPER SIMPLE
  useEffect(() => {
    let animationId: number;
    
    const animate = () => {
      // El loop siempre continúa si la simulación está corriendo O si hay un tren esperando
      if (simulation.isRunning) {
        setTrain(prevTrain => {
          // Verificar si hay un semáforo rojo que bloquee el movimiento
          const currentTrack = tracks.find(t => t.id === prevTrain.currentTrackId);
          if (currentTrack) {
            const signalAhead = signals.find(s => 
              s.trackId === prevTrain.currentTrackId && 
              s.state === 'red'
            );
            
            // Si hay un semáforo rojo y el tren está cerca, no mover
            if (signalAhead) {
              const trainX = prevTrain.position.x;
              const signalX = signalAhead.position.x;
              
              // Si el tren está a menos de 30 píxeles del semáforo rojo, parar
              if (Math.abs(trainX - signalX) < 30 && trainX < signalX) {
                console.log(`[TREN] Detenido por semáforo rojo ${signalAhead.id}`);
                return { ...prevTrain, isWaitingAtSignal: true }; // Marcar que está esperando
              }
            }
            
            // Si el tren estaba esperando en un semáforo, verificar si puede continuar
            if (prevTrain.isWaitingAtSignal) {
              const signalAtPosition = signals.find(s => 
                s.trackId === prevTrain.currentTrackId
              );
              
              if (signalAtPosition && signalAtPosition.state === 'green') {
                console.log(`[TREN] Semáforo ${signalAtPosition.id} cambió a verde - reanudando movimiento`);
                // Limpiar bandera y continuar con movimiento normal
                // No return aquí, seguir con la lógica de movimiento
              } else if (signalAtPosition && signalAtPosition.state === 'red') {
                // Seguir esperando
                return prevTrain;
              }
            }
          }
          
          // Movimiento normal si no hay semáforo rojo o si puede continuar
          const newProgress = prevTrain.progress + 0.01;
          
          if (newProgress >= 1.0) {
            // Decidir siguiente vía basado en switches
            const sw1 = switches.find(s => s.id === 'SW1');
            const sw2 = switches.find(s => s.id === 'SW2');
            let nextTrackId: string;
            
            if (prevTrain.currentTrackId === 'track-1') {
              // Desde track-1, decidir con SW1
              nextTrackId = sw1?.state === 'main' ? 'track-2-main' : 'track-2-branch-1';
            } else if (prevTrain.currentTrackId === 'track-2-main') {
              // Desde track-2-main, decidir con SW2
              nextTrackId = sw2?.state === 'main' ? 'track-3-main' : 'track-3-branch-1';
            } else if (prevTrain.currentTrackId === 'track-2-branch-1') {
              // Continuar desde branch del SW1
              nextTrackId = 'track-2-branch-2';
            } else if (prevTrain.currentTrackId === 'track-2-branch-2') {
              nextTrackId = 'track-2-branch-3';
            } else if (prevTrain.currentTrackId === 'track-2-branch-3') {
              // Desde aquí también aplica SW2
              nextTrackId = sw2?.state === 'main' ? 'track-3-main' : 'track-3-branch-1';
            } else if (prevTrain.currentTrackId === 'track-3-branch-1') {
              // Continuar en branch del SW2
              nextTrackId = 'track-3-branch-2';
            } else {
              // Fin del recorrido
              console.log(`[TREN] Fin del recorrido en ${prevTrain.currentTrackId}`);
              return {
                ...prevTrain,
                isMoving: false,
                progress: 1.0
              };
            }
            
            const nextTrack = tracks.find(t => t.id === nextTrackId);
            if (nextTrack) {
              console.log(`[TREN] Cambiando de ${prevTrain.currentTrackId} a ${nextTrackId} (SW1: ${sw1?.state}, SW2: ${sw2?.state})`);
              return {
                ...prevTrain,
                currentTrackId: nextTrack.id,
                progress: 0,
                position: nextTrack.start,
                isWaitingAtSignal: false // Limpiar bandera al cambiar de vía
              };
            } else {
              console.log(`[TREN] No se encontró track ${nextTrackId}`);
              return {
                ...prevTrain,
                isMoving: false,
                progress: 1.0,
                isWaitingAtSignal: false
              };
            }
          } else {
            // Calcular nueva posición en la vía actual
            const currentTrack = tracks.find(t => t.id === prevTrain.currentTrackId);
            if (currentTrack) {
              const newPosition = {
                x: currentTrack.start.x + (currentTrack.end.x - currentTrack.start.x) * newProgress,
                y: currentTrack.start.y + (currentTrack.end.y - currentTrack.start.y) * newProgress
              };
              return {
                ...prevTrain,
                progress: newProgress,
                position: newPosition,
                isWaitingAtSignal: false // Limpiar bandera si se está moviendo normalmente
              };
            }
          }
          
          return prevTrain;
        });
        
        animationId = requestAnimationFrame(animate);
      }
    };

    if (simulation.isRunning) {
      animationId = requestAnimationFrame(animate);
    }

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [simulation.isRunning, signals]);

  // Loop de animación para el segundo tren
  useEffect(() => {
    let animationId2: number;
    
    const animate2 = () => {
      if (simulation2.isRunning) {
        setTrain2(prevTrain => {
          // Verificar si hay un semáforo rojo que bloquee el movimiento
          const currentTrack = tracks.find(t => t.id === prevTrain.currentTrackId);
          if (currentTrack) {
            const signalAhead = signals.find(s => 
              s.trackId === prevTrain.currentTrackId && 
              s.state === 'red'
            );
            
            // Si hay un semáforo rojo y el tren está cerca, no mover
            if (signalAhead) {
              const trainX = prevTrain.position.x;
              const signalX = signalAhead.position.x;
              
              // Si el tren está a menos de 30 píxeles del semáforo rojo, parar
              if (Math.abs(trainX - signalX) < 30 && trainX < signalX) {
                console.log(`[TREN2] Detenido por semáforo rojo ${signalAhead.id}`);
                return { ...prevTrain, isWaitingAtSignal: true };
              }
            }
            
            // Si el tren estaba esperando en un semáforo, verificar si puede continuar
            if (prevTrain.isWaitingAtSignal) {
              const signalAtPosition = signals.find(s => 
                s.trackId === prevTrain.currentTrackId
              );
              
              if (signalAtPosition && signalAtPosition.state === 'green') {
                console.log(`[TREN2] Semáforo ${signalAtPosition.id} cambió a verde - reanudando movimiento`);
              } else if (signalAtPosition && signalAtPosition.state === 'red') {
                return prevTrain;
              }
            }
          }
          
          // Movimiento normal
          const newProgress = prevTrain.progress + 0.01 * simulation2.speed;
          
          if (newProgress >= 1.0) {
            // Lógica de navegación para el segundo tren
            let nextTrackId: string;
            
            if (prevTrain.currentTrackId === 'track-0-horizontal') {
              nextTrackId = 'track-0-diagonal';
            } else if (prevTrain.currentTrackId === 'track-0-diagonal') {
              // Llega al switch SW1, usar su estado
              const sw1 = switches.find(s => s.id === 'SW1');
              nextTrackId = sw1?.state === 'main' ? 'track-2-main' : 'track-2-branch-1';
            } else if (prevTrain.currentTrackId === 'track-2-main') {
              // Llega al switch SW2
              const sw2 = switches.find(s => s.id === 'SW2');
              nextTrackId = sw2?.state === 'main' ? 'track-3-main' : 'track-3-branch-1';
            } else if (prevTrain.currentTrackId === 'track-2-branch-1') {
              nextTrackId = 'track-2-branch-2';
            } else if (prevTrain.currentTrackId === 'track-2-branch-2') {
              nextTrackId = 'track-2-branch-3';
            } else if (prevTrain.currentTrackId === 'track-2-branch-3') {
              const sw2 = switches.find(s => s.id === 'SW2');
              nextTrackId = sw2?.state === 'main' ? 'track-3-main' : 'track-3-branch-1';
            } else if (prevTrain.currentTrackId === 'track-3-branch-1') {
              nextTrackId = 'track-3-branch-2';
            } else {
              console.log(`[TREN2] Fin del recorrido en ${prevTrain.currentTrackId}`);
              return {
                ...prevTrain,
                isMoving: false,
                progress: 1.0,
                isWaitingAtSignal: false
              };
            }
            
            const nextTrack = tracks.find(t => t.id === nextTrackId);
            if (nextTrack) {
              console.log(`[TREN2] Cambiando de ${prevTrain.currentTrackId} a ${nextTrackId}`);
              return {
                ...prevTrain,
                currentTrackId: nextTrack.id,
                progress: 0,
                position: nextTrack.start,
                isWaitingAtSignal: false
              };
            } else {
              return {
                ...prevTrain,
                isMoving: false,
                progress: 1.0,
                isWaitingAtSignal: false
              };
            }
          } else {
            // Calcular nueva posición en la vía actual
            const currentTrack = tracks.find(t => t.id === prevTrain.currentTrackId);
            if (currentTrack) {
              const newPosition = {
                x: currentTrack.start.x + (currentTrack.end.x - currentTrack.start.x) * newProgress,
                y: currentTrack.start.y + (currentTrack.end.y - currentTrack.start.y) * newProgress
              };
              return {
                ...prevTrain,
                progress: newProgress,
                position: newPosition,
                isWaitingAtSignal: false
              };
            }
          }
          
          return prevTrain;
        });
        
        animationId2 = requestAnimationFrame(animate2);
      }
    };

    if (simulation2.isRunning) {
      animationId2 = requestAnimationFrame(animate2);
    }

    return () => {
      if (animationId2) {
        cancelAnimationFrame(animationId2);
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [simulation2.isRunning, signals]);

  return (
    <div className="railway-system">
      <svg
        width={defaultConfig.width}
        height={defaultConfig.height}
        viewBox={`0 0 ${defaultConfig.width} ${defaultConfig.height}`}
        style={{
          border: '1px solid #ccc',
          backgroundColor: '#1a1a2e'
        }}
      >
        {/* Renderizar todas las vías */}
        {tracks.map((track) => (
          <TrackComponent
            key={track.id}
            track={track}
            strokeWidth={defaultConfig.trackWidth}
            color={getTrackColor(track, switches)}
          />
        ))}
        
        {/* Renderizar switches */}
        {switches.map((switchData) => (
          <SwitchComponent
            key={switchData.id}
            switchData={switchData}
            onToggle={handleSwitchToggle}
          />
        ))}
        
        {/* Renderizar señales */}
        {signals.map((signal) => (
          <SignalComponent
            key={signal.id}
            signal={signal}
            onToggle={handleSignalToggle}
          />
        ))}
        
        {/* Renderizar los trenes */}
        <TrainComponent train={train} />
        <TrainComponent train={train2} />
      </svg>
      
      {/* Panel de control de simulación */}
      <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
        <h3 style={{ margin: '0 0 15px 0', color: '#333' }}>Control de Simulación</h3>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '15px' }}>
          <button
            onClick={startSimulation}
            disabled={simulation.isRunning}
            style={{
              padding: '8px 16px',
              backgroundColor: simulation.isRunning ? '#ccc' : '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: simulation.isRunning ? 'not-allowed' : 'pointer'
            }}
          >
            ▶ Iniciar
          </button>
          <button
            onClick={stopSimulation}
            disabled={!simulation.isRunning}
            style={{
              padding: '8px 16px',
              backgroundColor: !simulation.isRunning ? '#ccc' : '#f44336',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: !simulation.isRunning ? 'not-allowed' : 'pointer'
            }}
          >
            ⏸ Parar
          </button>
          <button
            onClick={resetSimulation}
            style={{
              padding: '8px 16px',
              backgroundColor: '#FF9800',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
            title="Resetea el tren al inicio y limpia el estado"
          >
            🔄 Reset
          </button>
          
          <div style={{ marginLeft: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <label style={{ color: '#333', fontWeight: 'bold' }}>Velocidad:</label>
            <input
              type="range"
              min="0.1"
              max="2"
              step="0.1"
              value={simulation.speed}
              onChange={(e) => updateSpeed(parseFloat(e.target.value))}
              style={{ width: '100px' }}
            />
            <span style={{ color: '#333', minWidth: '30px' }}>{simulation.speed}x</span>
          </div>
          
          <div style={{ marginLeft: '20px', color: '#333' }}>
            Estado: <strong style={{ color: simulation.isRunning ? '#4CAF50' : '#f44336' }}>
              {simulation.isRunning ? 'EJECUTANDO' : 'DETENIDO'}
            </strong>
          </div>
        </div>
      </div>

      {/* Panel de control del segundo tren */}
      <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#e8f5e8', borderRadius: '8px', border: '2px solid #2E8B57' }}>
        <h3 style={{ margin: '0 0 15px 0', color: '#2E8B57' }}>Control de Tren 2 (Verde Mar)</h3>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '15px' }}>
          <button
            onClick={startSimulation2}
            disabled={simulation2.isRunning}
            style={{
              padding: '8px 16px',
              backgroundColor: simulation2.isRunning ? '#ccc' : '#2E8B57',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: simulation2.isRunning ? 'not-allowed' : 'pointer'
            }}
          >
            ▶ Iniciar
          </button>
          <button
            onClick={stopSimulation2}
            disabled={!simulation2.isRunning}
            style={{
              padding: '8px 16px',
              backgroundColor: !simulation2.isRunning ? '#ccc' : '#f44336',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: !simulation2.isRunning ? 'not-allowed' : 'pointer'
            }}
          >
            ⏸ Parar
          </button>
          <button
            onClick={resetSimulation2}
            style={{
              padding: '8px 16px',
              backgroundColor: '#FF9800',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
            title="Resetea el tren 2 al inicio y limpia el estado"
          >
            🔄 Reset
          </button>
          
          <div style={{ marginLeft: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <label style={{ color: '#2E8B57', fontWeight: 'bold' }}>Velocidad:</label>
            <input
              type="range"
              min="0.1"
              max="2"
              step="0.1"
              value={simulation2.speed}
              onChange={(e) => updateSpeed2(parseFloat(e.target.value))}
              style={{ width: '100px' }}
            />
            <span style={{ color: '#2E8B57', minWidth: '30px' }}>{simulation2.speed}x</span>
          </div>
          
          <div style={{ marginLeft: '20px', color: '#2E8B57' }}>
            Estado: <strong style={{ color: simulation2.isRunning ? '#4CAF50' : '#f44336' }}>
              {simulation2.isRunning ? 'EJECUTANDO' : 'DETENIDO'}
            </strong>
          </div>
        </div>
      </div>
    </div>
  );
};
