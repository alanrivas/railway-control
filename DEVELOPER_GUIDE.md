# 🛠️ Guía de Desarrollo - Railway Control System

## 🎯 Para Desarrolladores

Esta guía está diseñada para desarrolladores que quieren contribuir, modificar o entender el funcionamiento interno del Railway Control System.

## 🏗️ Arquitectura Técnica

### 📁 Estructura del Proyecto

```
railway-control/
├── 📁 src/                          # Código fuente principal
│   ├── 📁 components/
│   │   └── 📁 Railway/
│   │       ├── 📄 index.ts          # Exports centralizados
│   │       ├── 🚂 RailwaySystem.tsx # Componente orquestador principal
│   │       ├── 🚂 TrainComponent.tsx # Lógica de trenes individuales
│   │       ├── 🛤️ TrackComponent.tsx # Sistema de vías y layout
│   │       ├── 🔀 SwitchComponent.tsx # Switches interactivos
│   │       └── 🚦 SignalComponent.tsx # Semáforos de control
│   ├── 📁 types/
│   │   └── 📄 railway.ts            # Definiciones TypeScript
│   ├── 📁 utils/
│   │   ├── 📄 trackUtils.ts         # Utilidades de vías
│   │   └── 📄 trainUtils.ts         # Utilidades de trenes
│   ├── 📁 hooks/                    # Custom React hooks
│   ├── 📁 assets/                   # Recursos estáticos
│   ├── 📄 App.tsx                   # Componente raíz
│   ├── 📄 main.tsx                  # Entry point
│   └── 📄 index.css                 # Estilos globales
├── 📁 public/                       # Assets públicos
├── 📁 .github/workflows/            # CI/CD pipelines
├── 📁 terraform/                    # Infrastructure as Code
├── 🐳 Dockerfile                    # Imagen de producción
├── 🐳 Dockerfile.dev                # Imagen de desarrollo
├── 🐳 docker-compose.yml            # Orquestación producción
├── 🐳 docker-compose.dev.yml        # Orquestación desarrollo
├── ⚙️ vite.config.ts               # Configuración Vite
├── ⚙️ tsconfig.json                # Configuración TypeScript
└── 📦 package.json                 # Dependencias y scripts
```

### 🧩 Componentes Principales

#### 🚂 RailwaySystem.tsx

**Propósito**: Componente orquestador principal que maneja el estado global

```typescript
interface RailwaySystemState {
  trains: Train[]; // Estado de todos los trenes
  switches: Switch[]; // Estado de todos los switches
  signals: Signal[]; // Estado de todos los semáforos
  isRunning: boolean; // Estado global de simulación
}
```

**Responsabilidades**:

- Manejo de estado global con useState/useReducer
- Coordinación entre trenes, switches y semáforos
- Loop de animación principal con requestAnimationFrame
- Gestión de eventos de usuario

#### 🚂 TrainComponent.tsx

**Propósito**: Manejo individual de cada tren

```typescript
interface TrainProps {
  id: string;
  initialPosition: Position;
  color: string;
  onPositionChange: (position: Position) => void;
}
```

**Características**:

- Estado independiente por tren
- Cálculo de movimiento y física
- Respuesta a switches y semáforos
- Animación suave con CSS transforms

#### 🛤️ TrackComponent.tsx

**Propósito**: Renderizado del sistema de vías

```typescript
interface Track {
  id: string;
  path: Position[];
  type: "straight" | "curve" | "switch";
  connections: string[];
}
```

**Funcionalidades**:

- Definición de rutas y paths
- Cálculo de conexiones entre vías
- Renderizado SVG de las vías
- Detección de colisiones

#### 🔀 SwitchComponent.tsx

**Propósito**: Switches interactivos para control de rutas

```typescript
interface SwitchProps {
  id: string;
  position: Position;
  state: "main" | "branch";
  onStateChange: (newState: SwitchState) => void;
}
```

**Comportamiento**:

- Toggle entre estados main/branch
- Feedback visual inmediato
- Propagación de cambios al sistema global
- Animaciones de transición

#### 🚦 SignalComponent.tsx

**Propósito**: Semáforos para control de tráfico

```typescript
interface SignalProps {
  id: string;
  position: Position;
  state: "red" | "green";
  onStateChange: (newState: SignalState) => void;
}
```

**Funcionalidades**:

- Control de tráfico bidireccional
- Detección de proximidad de trenes
- Estados visuales claros
- Integración con lógica de movimiento

## 🛠️ Setup de Desarrollo

### 📋 Prerrequisitos

```bash
# Versiones requeridas
node --version     # v18.0.0+
npm --version      # v8.0.0+
git --version      # v2.0.0+
docker --version   # v20.0.0+ (opcional)
```

### 🚀 Setup Inicial

1. **Clonar y Setup**

   ```bash
   git clone https://github.com/tu-usuario/railway-control.git
   cd railway-control

   # Instalar dependencias
   npm install

   # Verificar setup
   npm run build
   npm run dev
   ```

2. **Setup con Script Automatizado**

   ```bash
   # Linux/Mac
   chmod +x setup.sh
   ./setup.sh

   # Windows
   .\setup.ps1
   ```

3. **Verificar Instalación**

   ```bash
   # Test de build
   npm run build

   # Test de desarrollo
   npm run dev
   # Debe abrir http://localhost:5173

   # Test de Docker (opcional)
   npm run docker:build
   npm run docker:test
   ```

## 🧪 Testing y Calidad

### 🔍 Linting y Formato

```bash
# Linting (ESLint configurado)
npm run lint
npm run lint:fix

# Formateo (Prettier)
npm run format
npm run format:check

# TypeScript check
npm run type-check
```

### 🧪 Testing Framework

**Configuración Actual**: Ready para testing con React Testing Library + Vitest

```typescript
// Ejemplo de test unitario
import { render, screen } from "@testing-library/react";
import { TrainComponent } from "../components/Railway/TrainComponent";

describe("TrainComponent", () => {
  test("renders train with correct initial position", () => {
    render(
      <TrainComponent
        id="train-1"
        initialPosition={{ x: 0, y: 0 }}
        color="blue"
        onPositionChange={() => {}}
      />
    );

    const train = screen.getByTestId("train-1");
    expect(train).toBeInTheDocument();
  });
});
```

### 📊 Performance Monitoring

```bash
# Bundle analysis
npm run build:analyze

# Performance testing
npm run lighthouse

# Memory profiling
npm run profile
```

## 🐳 Docker Development

### 🏗️ Multi-Stage Build

**Dockerfile Structure**:

```dockerfile
# Build stage
FROM node:20-slim AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
```

### 🔧 Docker Commands

```bash
# Desarrollo
docker-compose -f docker-compose.dev.yml up
# Hot reload en http://localhost:5173

# Producción
docker-compose up
# Optimizado en http://localhost:80

# Build manual
docker build -f Dockerfile -t railway-control:prod .
docker build -f Dockerfile.dev -t railway-control:dev .

# Testing
docker run --rm -p 8080:80 railway-control:prod
curl http://localhost:8080  # Debe responder 200
```

## 🎨 Customización y Extensión

### 🚂 Agregar Nuevos Trenes

1. **Extender Types**

   ```typescript
   // src/types/railway.ts
   interface Train {
     id: string;
     position: Position;
     speed: number;
     color: string;
     type: "passenger" | "freight" | "express"; // Nuevo
   }
   ```

2. **Modificar RailwaySystem**

   ```typescript
   const [trains, setTrains] = useState<Train[]>([
     // Tren existente
     {
       id: "train-1",
       position: { x: 50, y: 200 },
       speed: 1,
       color: "blue",
       type: "passenger",
     },
     // Nuevo tren
     {
       id: "train-3",
       position: { x: 50, y: 400 },
       speed: 1.5,
       color: "purple",
       type: "express",
     },
   ]);
   ```

3. **Agregar Panel de Control**
   ```typescript
   // Duplicar lógica de paneles existentes
   <TrainControlPanel
     train={trains[2]}
     onSpeedChange={(speed) => updateTrainSpeed("train-3", speed)}
     onToggle={() => toggleTrain("train-3")}
     onReset={() => resetTrain("train-3")}
   />
   ```

### 🛤️ Agregar Nuevas Vías

1. **Definir Nueva Ruta**

   ```typescript
   // src/utils/trackUtils.ts
   export const TRACK_DEFINITIONS = {
     // Rutas existentes...
     "track-4-loop": {
       path: [
         { x: 100, y: 100 },
         { x: 200, y: 100 },
         { x: 200, y: 200 },
         { x: 100, y: 200 },
         { x: 100, y: 100 }, // Loop cerrado
       ],
       type: "loop",
     },
   };
   ```

2. **Renderizar en TrackComponent**
   ```typescript
   <g className="track-4-loop">
     <path
       d={generateSVGPath(TRACK_DEFINITIONS["track-4-loop"].path)}
       stroke="#333"
       strokeWidth="4"
       fill="none"
     />
   </g>
   ```

### 🔀 Agregar Nuevos Switches

```typescript
// Nuevo switch con 3 direcciones
interface TripleSwitch extends Switch {
  states: "main" | "branch1" | "branch2";
  connections: {
    main: string;
    branch1: string;
    branch2: string;
  };
}
```

### 🚦 Funcionalidades Avanzadas

**Semáforos Inteligentes**:

```typescript
interface SmartSignal extends Signal {
  autoMode: boolean;
  detectionRadius: number;
  timingConfig: {
    redDuration: number;
    greenDuration: number;
  };
}
```

## 🔄 CI/CD y Deployment

### 🚀 GitHub Actions Workflows

**CI Pipeline** (`.github/workflows/ci.yml`):

```yaml
name: CI Pipeline
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "npm"
      - run: npm ci
      - run: npm run build
      - run: npm run test
      - run: npm run lint
```

**Release Pipeline** (`.github/workflows/release.yml`):

```yaml
name: Release Pipeline
on:
  push:
    tags: ["v*"]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Build and Push Docker
        uses: docker/build-push-action@v5
        with:
          push: true
          tags: ${{ secrets.DOCKER_HUB_USERNAME }}/railway-control:${{ github.ref_name }}
```

### 🏗️ Infrastructure as Code

**Terraform Setup** (`terraform/main.tf`):

```hcl
resource "azurerm_container_group" "railway_control" {
  name                = "railway-control"
  location            = var.location
  resource_group_name = azurerm_resource_group.main.name
  os_type            = "Linux"

  container {
    name   = "railway-control"
    image  = "tu-usuario/railway-control:latest"
    cpu    = "0.5"
    memory = "1.5"

    ports {
      port     = 80
      protocol = "TCP"
    }
  }
}
```

### 📋 Deployment Checklist

**Pre-Deploy**:

- [ ] Tests pasando (`npm test`)
- [ ] Build exitoso (`npm run build`)
- [ ] Linting limpio (`npm run lint`)
- [ ] Docker build funcionando (`docker build`)
- [ ] Performance check (`npm run lighthouse`)

**Deploy**:

- [ ] Tag creado (`git tag v1.0.0`)
- [ ] Secrets configurados en GitHub
- [ ] Pipeline ejecutándose sin errores
- [ ] Health check post-deploy

**Post-Deploy**:

- [ ] Aplicación cargando correctamente
- [ ] Funcionalidades core funcionando
- [ ] Performance dentro de métricas esperadas
- [ ] Logs sin errores críticos

## 🐛 Debugging y Troubleshooting

### 🔍 Debug Local

```bash
# Debug con source maps
npm run dev:debug

# Profiling de performance
npm run dev:profile

# Debug de build
npm run build:debug
```

### 📊 Monitoring y Logs

**Browser DevTools**:

```javascript
// Console debugging
console.log("Train position:", train.position);
console.table(switches);

// Performance monitoring
performance.mark("simulation-start");
// ... simulation code ...
performance.mark("simulation-end");
performance.measure("simulation", "simulation-start", "simulation-end");
```

**Error Boundaries**:

```typescript
class RailwayErrorBoundary extends Component {
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Railway simulation error:", error, errorInfo);
    // Log to monitoring service
  }
}
```

### 🚨 Common Issues

**"Trenes no se mueven"**:

```typescript
// Debug checklist
1. Verificar animationId está activo
2. Comprobar requestAnimationFrame loop
3. Validar que speed > 0
4. Confirmar que no hay semáforos rojos bloqueando
```

**"Switches no responden"**:

```typescript
// Debug steps
1. Verificar event handlers están conectados
2. Comprobar state updates propagándose
3. Validar re-renders del componente
4. Confirmar CSS transitions funcionando
```

## 📚 Recursos de Desarrollo

### 📖 Documentación Técnica

- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Vite Guide](https://vitejs.dev/guide/)
- [Docker Best Practices](https://docs.docker.com/develop/best-practices/)

### 🛠️ Tools Recomendadas

- **VS Code** con extensiones:
  - TypeScript and JavaScript
  - ESLint
  - Prettier
  - Docker
  - GitHub Copilot
- **Browser DevTools** para debugging
- **Docker Desktop** para containerización
- **GitHub CLI** para workflow management

### 🤝 Contribución

1. **Fork del repositorio**
2. **Crear feature branch**: `git checkout -b feature/amazing-feature`
3. **Desarrollo con tests**: Asegurar que tests pasen
4. **Commit semántico**: `git commit -m 'feat: add amazing feature'`
5. **Push y PR**: `git push origin feature/amazing-feature`

---

<div align="center">

**🛠️ ¡Happy coding en el Railway Control System! 🚂**

_¿Preguntas técnicas? Abre un issue o discussion en GitHub_

</div>
