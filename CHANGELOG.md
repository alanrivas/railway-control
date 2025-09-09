# Changelog

Registro de todos los cambios importantes del Railway Control System.

## [v0.2.0] - 2025-09-09

### ✨ Nuevas Características
- **Sistema de Semáforos Mejorado**: Implementados semáforos rojo/verde únicamente
- **Detección de Semáforos**: El tren se detiene automáticamente ante semáforos rojos
- **Posicionamiento Corregido**: Eliminado semáforo S4 "volador", semáforos correctamente posicionados
- **Switches Funcionales**: Ambos switches (SW1 y SW2) ahora funcionan correctamente
- **Navegación Inteligente**: El tren respeta el estado de ambos switches para decidir rutas

### 🔧 Mejoras
- **Simplificación de Código**: Eliminada lógica compleja de useCallback/useMemo que causaba problemas
- **Sistema de Animación**: Implementado loop de animación simple pero funcional
- **Tipos TypeScript**: Agregada propiedad `isWaitingAtSignal` al tipo Train
- **Código de Colores**: Mejorado sistema de colores para switches y vías

### 🐛 Correcciones
- **Movimiento del Tren**: Reparado sistema de animación que se había roto
- **Switch SW2**: Corregida lógica para que el segundo switch funcione correctamente
- **Semáforos**: Eliminados estados amarillos, solo rojo/verde
- **Reset del Tren**: Funcionalidad de reset ahora inicializa correctamente todas las propiedades

### 🛤️ Layout de Vías
- **track-1**: Vía de entrada común
- **track-2-main/branch**: Sistema de rutas controlado por SW1
- **track-3-main/branch**: Sistema de rutas controlado por SW2
- **Navegación**: El tren sigue las rutas según el estado de los switches

### 📋 Estado Actual
- ✅ Movimiento fluido del tren
- ✅ Switches interactivos (SW1 y SW2)
- ✅ Semáforos rojo/verde funcionales
- ✅ Detección de semáforos rojos
- 🔄 Reanudación automática en semáforos (en desarrollo)

## [v0.1.0] - 2025-09-09

### 🎉 Lanzamiento Inicial
- **Proyecto Base**: Creado con React + TypeScript + Vite
- **Sistema de Vías**: Layout básico con múltiples rutas
- **Componente Tren**: Visualización básica del tren
- **Switches Básicos**: Implementación inicial de desvíos
- **Semáforos Básicos**: Sistema inicial de señales
- **Controles**: Start/Stop/Reset/Speed básicos

### 🏗️ Arquitectura
- **Componentes Modulares**: Separación en TrackComponent, SwitchComponent, etc.
- **Tipos TypeScript**: Definiciones completas para Train, Track, Switch, Signal
- **Utilidades**: trackUtils.ts y trainUtils.ts para lógica de negocio
- **Estado React**: Manejo de estado con useState y useEffect

## [Próximas Versiones]

### 🎯 v0.3.0 (Planificado)
- [ ] Reanudación automática completa en semáforos verdes
- [ ] Múltiples trenes simultáneos
- [ ] Detección de colisiones
- [ ] Sonidos y efectos visuales

### 🎯 v0.4.0 (Planificado)
- [ ] Guardado/carga de configuraciones
- [ ] Editor de layout de vías
- [ ] Sistema de horarios para trenes
- [ ] Métricas y estadísticas

---

**Formato**: Basado en [Keep a Changelog](https://keepachangelog.com/)  
**Versionado**: [Semantic Versioning](https://semver.org/)
