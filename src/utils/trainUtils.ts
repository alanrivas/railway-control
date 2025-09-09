import type { Train, Track, Switch, Point } from '../types/railway';

export const calculateTrainPosition = (track: Track, progress: number): Point => {
  if (track.type === 'straight') {
    return {
      x: track.start.x + (track.end.x - track.start.x) * progress,
      y: track.start.y + (track.end.y - track.start.y) * progress
    };
  } else if (track.type === 'curve' && track.controlPoint) {
    // Curva Bézier cuadrática
    const t = progress;
    return {
      x: Math.pow(1 - t, 2) * track.start.x + 
         2 * (1 - t) * t * track.controlPoint.x + 
         Math.pow(t, 2) * track.end.x,
      y: Math.pow(1 - t, 2) * track.start.y + 
         2 * (1 - t) * t * track.controlPoint.y + 
         Math.pow(t, 2) * track.end.y
    };
  }
  return track.start;
};

export const getNextTrack = (
  currentTrack: Track, 
  tracks: Track[], 
  switches: Switch[]
): Track | null => {
  // Buscar vías que comiencen donde termina la actual
  const possibleTracks = tracks.filter(track => 
    track.id !== currentTrack.id &&
    Math.abs(track.start.x - currentTrack.end.x) < 5 &&
    Math.abs(track.start.y - currentTrack.end.y) < 5
  );

  console.log(`[NAVEGACIÓN] Vía actual: ${currentTrack.id}, Posibles siguientes:`, possibleTracks.map(t => `${t.id}(${t.route || 'común'})`));

  if (possibleTracks.length === 0) {
    console.log('[NAVEGACIÓN] No hay vías siguientes disponibles - FIN DEL RECORRIDO');
    return null;
  }

  if (possibleTracks.length === 1) {
    console.log(`[NAVEGACIÓN] Solo una opción disponible: ${possibleTracks[0].id}`);
    return possibleTracks[0];
  }

  // IMPORTANTE: Si hay múltiples opciones, revisar SIEMPRE el estado actual de los switches
  console.log('[NAVEGACIÓN] Múltiples opciones - consultando switches...');
  
  // Buscar vías que están controladas por switches
  const switchControlledTracks = possibleTracks.filter(track => track.switchId);
  
  if (switchControlledTracks.length > 0) {
    console.log('[NAVEGACIÓN] Vías controladas por switches encontradas:', switchControlledTracks.map(t => `${t.id} (switch: ${t.switchId}, ruta: ${t.route})`));
    
    for (const track of switchControlledTracks) {
      const controllingSwitch = switches.find(sw => sw.id === track.switchId);
      
      if (controllingSwitch) {
        console.log(`[SWITCH] ${controllingSwitch.id} estado actual: ${controllingSwitch.state}, vía ${track.id} es ruta: ${track.route}`);
        
        // Verificar si esta vía está activa según el switch ACTUAL
        if (track.route === 'main' && controllingSwitch.state === 'main') {
          console.log(`[DECISIÓN] ✅ Tomando ruta PRINCIPAL: ${track.id} (switch ${controllingSwitch.id} = main)`);
          return track;
        } else if (track.route === 'branch' && controllingSwitch.state === 'branch') {
          console.log(`[DECISIÓN] ✅ Tomando ruta DESVÍO: ${track.id} (switch ${controllingSwitch.id} = branch)`);
          return track;
        } else {
          console.log(`[DECISIÓN] ❌ Vía ${track.id} NO activa (switch ${controllingSwitch.id} = ${controllingSwitch.state} pero vía es ${track.route})`);
        }
      }
    }
  }

  // Si no hay switches relevantes o ninguna vía controlada está activa,
  // buscar vías sin control de switch (vías comunes)
  const commonTracks = possibleTracks.filter(track => !track.switchId);
  if (commonTracks.length > 0) {
    console.log(`[NAVEGACIÓN] Tomando vía común (sin switch): ${commonTracks[0].id}`);
    return commonTracks[0];
  }

  // Como último recurso, tomar la primera vía disponible
  console.log(`[NAVEGACIÓN] ⚠️ Fallback: tomando primera vía disponible: ${possibleTracks[0].id}`);
  return possibleTracks[0];
};

export const updateTrainPosition = (
  train: Train, 
  tracks: Track[], 
  switches: Switch[], 
  deltaTime: number
): Train => {
  if (!train.isMoving) {
    return train;
  }

  const currentTrack = tracks.find(track => track.id === train.currentTrackId);
  if (!currentTrack) {
    return { ...train, isMoving: false };
  }

  // Calcular nuevo progreso
  const newProgress = train.progress + (train.speed * deltaTime / 1000);

  if (newProgress >= 1) {
    // El tren ha completado la vía actual, buscar la siguiente
    const nextTrack = getNextTrack(currentTrack, tracks, switches);
    
    if (nextTrack) {
      // Mover al siguiente segmento
      const newPosition = calculateTrainPosition(nextTrack, 0);
      return {
        ...train,
        currentTrackId: nextTrack.id,
        progress: 0,
        position: newPosition
      };
    } else {
      // No hay más vías, detener el tren
      return {
        ...train,
        isMoving: false,
        progress: 1
      };
    }
  } else {
    // Actualizar posición en la vía actual
    const newPosition = calculateTrainPosition(currentTrack, newProgress);
    return {
      ...train,
      progress: newProgress,
      position: newPosition
    };
  }
};

export const resetTrainToStart = (train: Train, tracks: Track[]): Train => {
  // Encontrar la primera vía (más a la izquierda)
  const startTrack = tracks.reduce((leftmost, track) => {
    return track.start.x < leftmost.start.x ? track : leftmost;
  });

  const startPosition = calculateTrainPosition(startTrack, 0);

  console.log('Reset: Colocando tren en vía inicial:', startTrack.id);

  return {
    ...train,
    currentTrackId: startTrack.id,
    progress: 0,
    position: startPosition,
    isMoving: false,
    direction: 'forward' // Asegurar que siempre vaya hacia adelante
  };
};
