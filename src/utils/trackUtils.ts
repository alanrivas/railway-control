import type { Track, Switch } from '../types/railway';

export const getTrackColor = (track: Track, switches: Switch[], defaultColor: string = '#FFD700'): string => {
  // Si la vía no está asociada a ningún switch, usar color por defecto
  if (!track.switchId) {
    return track.color || defaultColor;
  }

  // Encontrar el switch que controla esta vía
  const controllingSwitch = switches.find(sw => sw.id === track.switchId);
  if (!controllingSwitch) {
    return track.color || defaultColor;
  }

  // Determinar el color basado en el estado del switch y la ruta de la vía
  if (track.route === 'main') {
    return controllingSwitch.state === 'main' ? controllingSwitch.mainColor : '#555';
  } else if (track.route === 'branch') {
    return controllingSwitch.state === 'branch' ? controllingSwitch.branchColor : '#555';
  }

  // Para vías comunes o sin ruta específica
  return track.color || defaultColor;
};

export const isTrackActive = (track: Track, switches: Switch[]): boolean => {
  if (!track.switchId) {
    return true; // Las vías sin switch siempre están activas
  }

  const controllingSwitch = switches.find(sw => sw.id === track.switchId);
  if (!controllingSwitch) {
    return true;
  }

  // La vía está activa si el switch está en la posición correcta para su ruta
  if (track.route === 'main') {
    return controllingSwitch.state === 'main';
  } else if (track.route === 'branch') {
    return controllingSwitch.state === 'branch';
  }

  return true; // Vías comunes siempre activas
};
