# Railway Control System 🚂

Un sistema de simulación ferroviaria interactivo construido con React, TypeScript y Vite. Permite controlar trenes, switches y semáforos en tiempo real.

## 🌟 Características Principales

### 🚂 Sistema de Trenes
- **Movimiento fluido**: Animación suave del tren a través de las vías
- **Visualización realista**: Tren con ventanas, ruedas y colores personalizables
- **Control de velocidad**: Slider para ajustar la velocidad de simulación
- **Reset inteligente**: Reinicia el tren al punto de partida

### 🔀 Sistema de Switches (Desvíos)
- **Switches interactivos**: Haz clic para cambiar entre rutas principales y de desvío
- **Código de colores**:
  - 🟢 **Verde**: Ruta principal (main)
  - 🔴 **Rojo**: Ruta de desvío (branch)
  - 🔵 **Azul**: Ruta principal en SW2
  - 🟠 **Naranja**: Ruta de desvío en SW2
- **Navegación inteligente**: El tren respeta automáticamente el estado de los switches

### 🚦 Sistema de Semáforos
- **Control de tráfico**: Semáforos con estados rojo/verde
- **Detección automática**: El tren se detiene ante semáforos rojos
- **Reanudación automática**: Cuando un semáforo cambia a verde, el tren continúa (en desarrollo)
- **Posicionamiento preciso**: Semáforos ubicados estratégicamente en las vías

### 🎮 Controles de Simulación
- **Start/Stop**: Inicia y detiene la simulación
- **Speed Control**: Ajusta la velocidad de 0.1x a 3.0x
- **Reset**: Reinicia el tren al punto de partida
- **Interactividad**: Cambia switches y semáforos durante la simulación

## 🏗️ Arquitectura del Proyecto

```
src/
├── components/Railway/
│   ├── RailwaySystem.tsx      # Componente principal
│   ├── TrackComponent.tsx     # Renderizado de vías
│   ├── SwitchComponent.tsx    # Componente de switches
│   ├── SignalComponent.tsx    # Componente de semáforos
│   └── TrainComponent.tsx     # Componente del tren
├── types/
│   └── railway.ts             # Definiciones de tipos TypeScript
├── utils/
│   ├── trackUtils.ts          # Utilidades para vías y colores
│   └── trainUtils.ts          # Lógica de navegación del tren
└── App.tsx                    # Aplicación principal
```

## 🛤️ Layout de Vías

El sistema incluye un layout complejo con múltiples rutas:

### Vías Principales
- **track-1**: Vía de entrada (común)
- **track-2-main**: Ruta principal después de SW1
- **track-3-main**: Continuación ruta principal después de SW2

### Vías de Desvío
- **track-2-branch-1/2/3**: Ruta superior (desvío de SW1)
- **track-3-branch-1/2**: Ruta inferior (desvío de SW2)

### Puntos de Decisión
- **SW1 (x:300)**: Decide entre ruta principal y desvío superior
- **SW2 (x:600)**: Decide entre continuación recta y desvío inferior

## 🎯 Funcionalidades Implementadas

### ✅ Completadas
- [x] Sistema básico de vías y navegación
- [x] Switches interactivos con código de colores
- [x] Semáforos rojo/verde con control de tráfico
- [x] Movimiento fluido del tren
- [x] Respeto de switches por parte del tren
- [x] Detección de semáforos rojos
- [x] Controles de simulación (start/stop/reset/speed)
- [x] Interfaz visual estilo metro

### 🔄 En Desarrollo
- [ ] Reanudación automática cuando semáforo cambia a verde
- [ ] Múltiples trenes simultáneos
- [ ] Sonidos y efectos
- [ ] Guardado/carga de configuraciones

## 🚀 Instalación y Uso

### Prerrequisitos
- Node.js (v16 o superior)
- npm o yarn

### Instalación
```bash
# Clonar el repositorio
git clone [URL_DEL_REPO]
cd railway-control

# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
npm run dev
```

### Uso
1. Abre http://localhost:5173 en tu navegador
2. Configura switches haciendo clic en ellos (cambian de color)
3. Ajusta semáforos (rojo/verde) según sea necesario
4. Haz clic en "Start Simulation" para iniciar
5. Ajusta la velocidad con el slider
6. Usa "Reset Train" para reiniciar

## 🎮 Controles

| Control | Función |
|---------|---------|
| **Start Simulation** | Inicia el movimiento del tren |
| **Stop Simulation** | Detiene la simulación |
| **Reset Train** | Reinicia el tren al punto de partida |
| **Speed Slider** | Ajusta velocidad de simulación (0.1x - 3.0x) |
| **Clic en Switch** | Cambia entre ruta principal/desvío |
| **Clic en Semáforo** | Alterna entre rojo y verde |

## 🎨 Código de Colores

### Vías
- **Dorado (#FFD700)**: Vías comunes
- **Verde**: Ruta principal activa
- **Rojo**: Ruta de desvío activa
- **Azul**: Ruta principal SW2
- **Naranja**: Ruta de desvío SW2

### Elementos
- **Rojo (#DC143C)**: Tren
- **Verde/Rojo**: Estados de semáforos
- **Fondo oscuro (#1a1a2e)**: Estilo metro

## 🔧 Tecnologías Utilizadas

- **React 18**: Framework de UI
- **TypeScript**: Tipado estático
- **Vite**: Build tool y dev server
- **SVG**: Gráficos vectoriales para las vías
- **CSS3**: Estilos y animaciones

## 📝 Estructura de Datos

### Train (Tren)
```typescript
interface Train {
  id: string;
  position: Point;
  currentTrackId: string;
  progress: number;        // 0-1
  speed: number;
  direction: 'forward' | 'backward';
  isMoving: boolean;
  color: string;
  size: number;
  isWaitingAtSignal?: boolean;
}
```

### Switch (Desvío)
```typescript
interface Switch {
  id: string;
  position: Point;
  mainTrack: string;
  branchTrack: string;
  state: 'main' | 'branch';
  mainColor: string;
  branchColor: string;
  angle: number;
}
```

### Signal (Semáforo)
```typescript
interface Signal {
  id: string;
  position: Point;
  trackId: string;
  state: 'red' | 'green';
  direction: 'up' | 'down' | 'left' | 'right';
}
```

## 🐛 Problemas Conocidos

1. **Semáforos**: La reanudación automática cuando cambia a verde necesita refinamiento
2. **Colisiones**: No hay detección de colisiones entre múltiples trenes
3. **Persistencia**: Las configuraciones no se guardan entre sesiones

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver `LICENSE` para más detalles.

## 👨‍💻 Autor

Desarrollado con ❤️ como proyecto de simulación ferroviaria

---

**Estado del Proyecto**: 🟡 En Desarrollo Activo

**Última Actualización**: Septiembre 2025

      **Última Actualización**: Septiembre 2025
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
