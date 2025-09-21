# Railway Control System 🚂# Railway Control System 🚂

Un sistema de simulación ferroviaria interactivo construido con React, TypeScript y Vite. Permite controlar múltiples trenes, switches y semáforos en tiempo real con completa independencia entre sistemas.Un sistema de simulación ferroviaria interactivo construido con React, TypeScript y Vite. Permite controlar múltiples trenes, switches y semáforos en tiempo real con completa independencia entre sistemas.

## 🚀 Deployment & CI/CD## 🚀 Deployment & CI/CD

Este proyecto incluye un pipeline completo de CI/CD con:Este proyecto incluye un pipeline completo de CI/CD con:

- 🐳 **Dockerización**: Contenedores optimizados para desarrollo y producción- 🐳 **Dockerización**: Contenedores optimizados para desarrollo y producción

- 🔄 **GitHub Actions**: Pipeline automatizado para build, test y deploy- 🔄 **GitHub Actions**: Pipeline automatizado para build, test y deploy

- 📦 **Docker Hub**: Registry público para imágenes versionadas- 📦 **Docker Hub**: Registry público para imágenes versionadas

- ☁️ **Azure Web App**: Hosting cloud con deployment automático- ☁️ **Azure Web App**: Hosting cloud con deployment automático

- 🏗️ **Terraform**: Infrastructure as Code para Azure- 🏗️ **Terraform**: Infrastructure as Code para Azure

- 🧪 **Testing Automático**: Unit, Integration y E2E tests- 🧪 **Testing Automático**: Unit, Integration y E2E tests

- 📋 **Semantic Versioning**: Versionado estándar con tags Git- 📋 **Semantic Versioning**: Versionado estándar con tags Git

## 🌟 Características Principales## 🌟 Características Principales

### 🚂 Sistema Dual de Trenes### 🚂 Sistema Dual de Trenes

- **Dos trenes independientes**: Control completo de dos trenes simultáneamente- **Dos trenes independientes**: Control completo de dos trenes simultáneamente

- **Tren Principal (Rojo)**: Comienza en la vía principal del sistema- **Tren Principal (Azul)**: Comienza en la vía principal del sistema

- **Tren Verde Mar**: Nuevo tren que inicia desde vía horizontal hacia SW1- **Tren Verde Mar**: Nuevo tren que inicia desde vía horizontal hacia SW1

- **Movimiento fluido**: Animación suave de ambos trenes a través de las vías- **Movimiento fluido**: Animación suave de ambos trenes a través de las vías

- **Visualización realista**: Trenes con ventanas, ruedas y colores distintivos- **Visualización realista**: Trenes con ventanas, ruedas y colores distintivos

- **Controles independientes**: Cada tren tiene su propio panel de control- **Controles independientes**: Cada tren tiene su propio panel de control

- **Velocidades independientes**: Control de velocidad separado (0.1x - 2.0x) para cada tren- **Velocidades independientes**: Control de velocidad separado (0.1x - 2.0x) para cada tren

- **Reset independiente**: Reinicia cada tren a su punto de partida específico- **Reset independiente**: Reinicia cada tren a su punto de partida específico

### 🎛️ Paneles de Control Duales### 🎛️ Paneles de Control Duales

- **Panel Tren Principal**: Controles tradicionales con fondo gris claro- **Panel Tren Principal**: Controles tradicionales con fondo gris claro

- **Panel Tren Verde Mar**: Controles con temática verde mar y bordes distintivos- **Panel Tren Verde Mar**: Controles con temática verde mar y bordes distintivos

- **Estados independientes**: Cada panel muestra EJECUTANDO/DETENIDO por separado- **Estados independientes**: Cada panel muestra EJECUTANDO/DETENIDO por separado

- **Botones específicos**: Start, Stop, Reset y control de velocidad para cada tren- **Botones específicos**: Start, Stop, Reset y control de velocidad para cada tren

### 🔀 Sistema de Switches (Desvíos)### 🔀 Sistema de Switches (Desvíos)

- **Switches interactivos**: Haz clic para cambiar entre rutas principales y de desvío- **Switches interactivos**: Haz clic para cambiar entre rutas principales y de desvío

- **Código de colores**:- **Código de colores**:

  - 🟢 **Verde**: Ruta principal (main) - 🟢 **Verde**: Ruta principal (main)

  - 🔴 **Rojo**: Ruta de desvío (branch) - 🔴 **Rojo**: Ruta de desvío (branch)

  - 🔵 **Azul**: Ruta principal en SW2 - 🔵 **Azul**: Ruta principal en SW2

  - 🟠 **Naranja**: Ruta de desvío en SW2 - 🟠 **Naranja**: Ruta de desvío en SW2

- **Navegación inteligente**: El tren respeta automáticamente el estado de los switches- **Navegación inteligente**: El tren respeta automáticamente el estado de los switches

### 🚦 Sistema de Semáforos### 🚦 Sistema de Semáforos

- **Control de tráfico**: Semáforos con estados rojo/verde- **Control de tráfico**: Semáforos con estados rojo/verde

- **Detección dual**: Ambos trenes se detienen independientemente ante semáforos rojos- **Detección dual**: Ambos trenes se detienen independientemente ante semáforos rojos

- **Reanudación automática**: Cuando un semáforo cambia a verde, ambos trenes pueden continuar- **Reanudación automática**: Cuando un semáforo cambia a verde, ambos trenes pueden continuar

- **Posicionamiento preciso**: Semáforos ubicados estratégicamente en las vías- **Posicionamiento preciso**: Semáforos ubicados estratégicamente en las vías

- **Impacto global**: Los semáforos afectan a cualquier tren que se acerque a ellos- **Impacto global**: Los semáforos afectan a cualquier tren que se acerque a ellos

## 🚀 Quick Start### 🎮 Controles de Simulación

### 📋 Prerrequisitos- **Start/Stop**: Inicia y detiene la simulación

- **Speed Control**: Ajusta la velocidad de 0.1x a 3.0x

````bash- **Reset**: Reinicia el tren al punto de partida

# Herramientas requeridas- **Interactividad**: Cambia switches y semáforos durante la simulación

node --version          # v18+ requerido

docker --version        # Para contenedores## 🏗️ Arquitectura del Proyecto

git --version          # Para versionado

terraform --version    # Para infraestructura (opcional)```

src/

# Azure CLI (para despliegue)├── components/Railway/

az --version           # Para Azure deployment│   ├── RailwaySystem.tsx      # Componente principal

```│   ├── TrackComponent.tsx     # Renderizado de vías

│   ├── SwitchComponent.tsx    # Componente de switches

### ⚡ Desarrollo Local (Rápido)│   ├── SignalComponent.tsx    # Componente de semáforos

│   └── TrainComponent.tsx     # Componente del tren

```bash├── types/

# 1. Clonar y configurar│   └── railway.ts             # Definiciones de tipos TypeScript

git clone https://github.com/tu-usuario/railway-control.git├── utils/

cd railway-control│   ├── trackUtils.ts          # Utilidades para vías y colores

npm install│   └── trainUtils.ts          # Lógica de navegación del tren

└── App.tsx                    # Aplicación principal

# 2. Ejecutar en desarrollo```

npm run dev

# ➡️ http://localhost:5173## 🛤️ Layout de Vías



# 3. Con Docker (recomendado)El sistema incluye un layout complejo con múltiples rutas y dos puntos de entrada:

docker-compose -f docker-compose.dev.yml up

# ➡️ http://localhost:5173 (con hot reload)### Vías de Entrada

````

- **track-1**: Vía de entrada principal (Tren 1 - Azul)

### 🐳 Producción Local- **track-0-horizontal**: Nueva vía de entrada horizontal (Tren 2 - Verde Mar)

- **track-0-diagonal**: Conexión diagonal hacia SW1 (Tren 2 - Verde Mar)

````bash

# Build y ejecutar producción### Vías Principales

docker-compose up --build

# ➡️ http://localhost:80- **track-2-main**: Ruta principal después de SW1

```- **track-3-main**: Continuación ruta principal después de SW2



## 📦 CI/CD Pipeline### Vías de Desvío



### 🏗️ Arquitectura de Deployment- **track-2-branch-1/2/3**: Ruta superior (desvío de SW1)

- **track-3-branch-1/2**: Ruta inferior (desvío de SW2)

```mermaid

graph TD### Puntos de Decisión

    A[Git Push] --> B[GitHub Actions]

    B --> C[Build & Test]- **SW1 (x:300)**: Decide entre ruta principal y desvío superior (afecta ambos trenes)

    C --> D[Docker Build]- **SW2 (x:600)**: Decide entre continuación recta y desvío inferior

    D --> E[Push to Docker Hub]

    E --> F[Deploy to Azure]### Rutas de Trenes



    G[Git Tag v1.0.0] --> H[Release Pipeline]- **Tren 1 (Azul)**: track-1 → SW1 → [rutas existentes]

    H --> I[Build Production]- **Tren 2 (Verde Mar)**: track-0-horizontal → track-0-diagonal → SW1 → [rutas existentes]

    I --> J[Tag: latest + v1.0.0]

    J --> K[Deploy Production]## 🎯 Funcionalidades Implementadas



    L[Manual Rollback] --> M[Select Version]### ✅ Completadas

    M --> N[Deploy Specific Tag]

```- [x] Sistema básico de vías y navegación

- [x] Switches interactivos con código de colores

### 🏷️ Versionado Automático- [x] Semáforos rojo/verde con control de tráfico

- [x] Movimiento fluido de múltiples trenes

```bash- [x] **Sistema dual de trenes independientes** 🆕

# Crear release (dispara deployment automático)- [x] **Tren verde mar con entrada alternativa** 🆕

git tag v1.0.0- [x] **Controles independientes para cada tren** 🆕

git push origin v1.0.0- [x] **Paneles de control diferenciados** 🆕

# ➡️ Crea imagen: railway-control:v1.0.0 + railway-control:latest- [x] Respeto de switches por parte de ambos trenes

- [x] Detección de semáforos rojos para ambos trenes

# Pre-release- [x] Controles de simulación duales (start/stop/reset/speed)

git tag v1.1.0-beta.1- [x] **Nuevas vías: horizontal + diagonal hacia SW1** 🆕

git push origin v1.1.0-beta.1- [x] Interfaz visual estilo metro

# ➡️ Crea imagen: railway-control:v1.1.0-beta.1

### 🔄 En Desarrollo

# Hotfix

git tag v1.0.1- [ ] Reanudación automática cuando semáforo cambia a verde

git push origin v1.0.1- [x] **Múltiples trenes simultáneos** ✅ Implementado en v0.3.0

# ➡️ Actualiza railway-control:latest- [ ] Sonidos y efectos

```- [ ] Guardado/carga de configuraciones

- [ ] Tercer y cuarto tren

## 🛠️ Setup Completo (Paso a Paso)- [ ] Colisiones entre trenes



### 1️⃣ **Configuración Inicial**## 🚀 Instalación y Uso



```bash### Prerrequisitos

# Clonar repositorio

git clone https://github.com/tu-usuario/railway-control.git- Node.js (v16 o superior)

cd railway-control- npm o yarn



# Instalar dependencias### Instalación

npm install

```bash

# Verificar que todo funciona# Clonar el repositorio

npm run devgit clone [URL_DEL_REPO]

npm run testcd railway-control

npm run build

```# Instalar dependencias

npm install

### 2️⃣ **Docker Setup**

# Ejecutar en modo desarrollo

```bashnpm run dev

# Test Docker local```

docker build -f Dockerfile.dev -t railway-control:dev .

docker run -p 5173:5173 railway-control:dev### Uso



# Test producción1. Abre http://localhost:5173 en tu navegador

docker build -f Dockerfile -t railway-control:prod .2. Configura switches haciendo clic en ellos (cambian de color)

docker run -p 80:80 railway-control:prod3. Ajusta semáforos (rojo/verde) según sea necesario

```4. Haz clic en "Start Simulation" para iniciar

5. Ajusta la velocidad con el slider

### 3️⃣ **Docker Hub Setup**6. Usa "Reset Train" para reiniciar



```bash## 🎮 Controles

# 1. Crear cuenta en Docker Hub (https://hub.docker.com)

# 2. Crear repositorio público: tu-usuario/railway-control| Control                      | Función                                           |

# 3. Generar Access Token: Account Settings > Security > Access Tokens| ---------------------------- | ------------------------------------------------- |

| **Start Simulation (Tren 1)** | Inicia el movimiento del tren principal         |

# Test push manual| **Stop Simulation (Tren 1)**  | Detiene el tren principal                        |

docker login| **Reset (Tren 1)**           | Reinicia el tren principal al punto de partida   |

docker tag railway-control:prod tu-usuario/railway-control:latest| **Speed Slider (Tren 1)**    | Ajusta velocidad del tren principal (0.1x - 2.0x)|

docker push tu-usuario/railway-control:latest| **Start Simulation (Tren 2)** | Inicia el movimiento del tren verde mar         |

```| **Stop Simulation (Tren 2)**  | Detiene el tren verde mar                        |

| **Reset (Tren 2)**           | Reinicia el tren verde mar al punto de partida   |

### 4️⃣ **GitHub Secrets Configuration**| **Speed Slider (Tren 2)**    | Ajusta velocidad del tren verde mar (0.1x - 2.0x)|

| **Clic en Switch**           | Cambia entre ruta principal/desvío               |

```bash| **Clic en Semáforo**         | Alterna entre rojo y verde                       |

# Ir a GitHub repo > Settings > Secrets and variables > Actions

# Agregar los siguientes secrets:## 🎨 Código de Colores



DOCKER_HUB_USERNAME=tu-usuario### Vías

DOCKER_HUB_TOKEN=dckr_pat_xxxxxxxxxxxxx

AZURE_WEBAPP_NAME=railway-control-app- **Dorado (#FFD700)**: Vías comunes

AZURE_PUBLISH_PROFILE=<contenido-del-publish-profile>- **Verde**: Ruta principal activa

```- **Rojo**: Ruta de desvío activa

- **Azul**: Ruta principal SW2

### 5️⃣ **Azure Infrastructure (Terraform)**- **Naranja**: Ruta de desvío SW2



```bash### Elementos

# 1. Login a Azure

az login- **Rojo (#DC143C)**: Tren

- **Verde/Rojo**: Estados de semáforos

# 2. Crear infraestructura- **Fondo oscuro (#1a1a2e)**: Estilo metro

cd terraform/

terraform init## 🔧 Tecnologías Utilizadas

terraform plan

terraform apply- **React 18**: Framework de UI

- **TypeScript**: Tipado estático

# 3. Obtener publish profile- **Vite**: Build tool y dev server

az webapp deployment list-publishing-profiles \- **SVG**: Gráficos vectoriales para las vías

  --name railway-control-app \- **CSS3**: Estilos y animaciones

  --resource-group railway-control-rg \

  --xml## 📝 Estructura de Datos

````

### Train (Tren)

### 6️⃣ **Pipeline Testing**

````typescript

```bashinterface Train {

# Test pipeline completo  id: string;

git add .  position: Point;

git commit -m "feat: setup CI/CD pipeline"  currentTrackId: string;

git push origin main  progress: number; // 0-1

  speed: number;

# Test release pipeline  direction: "forward" | "backward";

git tag v1.0.0  isMoving: boolean;

git push origin v1.0.0  color: string;

  size: number;

# Verificar en:  isWaitingAtSignal?: boolean;

# - GitHub Actions: https://github.com/tu-usuario/railway-control/actions}

# - Docker Hub: https://hub.docker.com/r/tu-usuario/railway-control```

# - Azure: https://railway-control-app.azurewebsites.net

```### Switch (Desvío)



## 🧪 Testing Strategy```typescript

interface Switch {

### 📝 **Test Scripts**  id: string;

  position: Point;

```bash  mainTrack: string;

# Unit tests  branchTrack: string;

npm run test              # Jest + React Testing Library  state: "main" | "branch";

npm run test:watch        # Watch mode  mainColor: string;

npm run test:coverage     # Coverage report  branchColor: string;

  angle: number;

# E2E tests  }

npm run test:e2e          # Playwright tests```

npm run test:e2e:ui       # E2E con UI

### Signal (Semáforo)

# Integration tests

npm run test:integration  # API + Database tests```typescript

interface Signal {

# All tests  id: string;

npm run test:all          # Ejecuta todos los tests  position: Point;

```  trackId: string;

  state: "red" | "green";

### 🎯 **Test Coverage Targets**  direction: "up" | "down" | "left" | "right";

}

- **Unit Tests**: >80% coverage```

- **Integration Tests**: Rutas críticas

- **E2E Tests**: User journeys completos## 🐛 Problemas Conocidos

- **Performance Tests**: Core Web Vitals

1. **Semáforos**: La reanudación automática cuando cambia a verde necesita refinamiento

## 📋 Available Scripts2. **Colisiones**: No hay detección de colisiones entre múltiples trenes

3. **Persistencia**: Las configuraciones no se guardan entre sesiones

### 🔧 **Development**

```bash## 🤝 Contribuciones

npm run dev              # Vite dev server

npm run dev:docker       # Docker developmentLas contribuciones son bienvenidas. Por favor:

npm run build            # Production build

npm run preview          # Preview build locally1. Fork el proyecto

npm run lint             # ESLint2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)

npm run lint:fix         # ESLint + auto-fix3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)

npm run type-check       # TypeScript check4. Push a la rama (`git push origin feature/AmazingFeature`)

```5. Abre un Pull Request



### 🐳 **Docker**## 📄 Licencia

```bash

npm run docker:dev       # Build dev containerEste proyecto está bajo la Licencia MIT. Ver `LICENSE` para más detalles.

npm run docker:prod      # Build production container

npm run docker:push      # Push to Docker Hub## 👨‍💻 Autor

npm run docker:run       # Run latest image

```Desarrollado con ❤️ como proyecto de simulación ferroviaria



### 🚀 **Deployment**---

```bash

npm run deploy:staging   # Deploy a staging**Estado del Proyecto**: 🟡 En Desarrollo Activo

npm run deploy:prod      # Deploy a producción

npm run rollback         # Rollback a versión anterior**Última Actualización**: Septiembre 2025

````

      **Última Actualización**: Septiembre 2025

### 🧪 **Testing**

```bash````

npm run test # Unit tests

npm run test:watch # Watch modeYou can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

npm run test:e2e # E2E tests

npm run test:all # Todos los tests```js

npm run test:ci # Tests para CI// eslint.config.js

`````import reactX from 'eslint-plugin-react-x'

import reactDom from 'eslint-plugin-react-dom'

## 🏗️ Project Structure

export default tseslint.config([

```  globalIgnores(['dist']),

railway-control/  {

├── 📁 src/                          # Código fuente    files: ['**/*.{ts,tsx}'],

│   ├── 📁 components/Railway/       # Componentes principales    extends: [

│   ├── 📁 hooks/                    # Custom hooks      // Other configs...

│   ├── 📁 types/                    # TypeScript definitions      // Enable lint rules for React

│   ├── 📁 utils/                    # Utilidades      reactX.configs['recommended-typescript'],

│   └── 📁 __tests__/               # Tests unitarios      // Enable lint rules for React DOM

├── 📁 e2e/                         # Tests E2E (Playwright)      reactDom.configs.recommended,

├── 📁 terraform/                   # Infrastructure as Code    ],

│   ├── 📄 main.tf                  # Configuración principal    languageOptions: {

│   ├── 📄 variables.tf             # Variables      parserOptions: {

│   └── 📄 outputs.tf               # Outputs        project: ['./tsconfig.node.json', './tsconfig.app.json'],

├── 📁 .github/workflows/           # GitHub Actions        tsconfigRootDir: import.meta.dirname,

│   ├── 📄 ci.yml                   # CI Pipeline      },

│   ├── 📄 release.yml              # Release Pipeline      // other options...

│   └── 📄 rollback.yml             # Manual Rollback    },

├── 📁 docker/                      # Docker configurations  },

│   ├── 📄 Dockerfile               # Production image])

│   ├── 📄 Dockerfile.dev           # Development image````

│   └── 📄 nginx.conf               # Nginx configuration
├── 📄 docker-compose.yml           # Production compose
├── 📄 docker-compose.dev.yml       # Development compose
├── 📄 playwright.config.ts         # E2E test config
├── 📄 jest.config.js               # Unit test config
└── 📄 package.json                 # Dependencies & scripts
`````

## 🌐 Environments

### 🏠 **Local Development**

- **URL**: http://localhost:5173
- **Hot Reload**: ✅ Habilitado
- **Source Maps**: ✅ Habilitado
- **Mock Data**: ✅ Disponible

### ☁️ **Production (Azure)**

- **URL**: https://railway-control-app.azurewebsites.net
- **SSL**: ✅ Automático
- **CDN**: ✅ Azure CDN
- **Monitoring**: ✅ Application Insights

## 📊 Monitoring & Observability

### 📈 **Métricas Automatizadas**

- **Build Success Rate**: GitHub Actions dashboard
- **Deployment Frequency**: Azure DevOps metrics
- **Application Performance**: Application Insights
- **Error Tracking**: Automated error reporting
- **Core Web Vitals**: Lighthouse CI

### 🚨 **Alertas Configuradas**

- Pipeline failures → Email + Slack
- High error rates → Teams notification
- Performance degradation → Auto-scaling trigger
- Security vulnerabilities → Security team alert

## 🔄 Release Process

### 🏷️ **Semantic Versioning**

```bash
# Major release (breaking changes)
git tag v2.0.0

# Minor release (new features)
git tag v1.1.0

# Patch release (bug fixes)
git tag v1.0.1

# Pre-release
git tag v1.1.0-beta.1
git tag v1.1.0-rc.1
```

### 🚀 **Automatic Deployment**

1. **Push a main** → Deploy to development environment
2. **Create tag** → Build image + Deploy to production
3. **Manual trigger** → Rollback to specific version

### 📋 **Release Checklist**

- [ ] All tests passing
- [ ] Code review completed
- [ ] Performance benchmarks met
- [ ] Security scan passed
- [ ] Documentation updated
- [ ] CHANGELOG.md updated

## 🔧 Configuration

### 🌍 **Environment Variables**

```bash
# Development
NODE_ENV=development
VITE_API_URL=http://localhost:3001
VITE_APP_VERSION=${npm_package_version}

# Production
NODE_ENV=production
VITE_API_URL=https://api.railway-control.com
VITE_APP_VERSION=${GITHUB_REF_NAME}
```

### ⚙️ **Docker Configuration**

```yaml
# docker-compose.override.yml (local customization)
version: "3.8"
services:
  railway-control:
    environment:
      - NODE_ENV=development
      - DEBUG=true
    volumes:
      - ./src:/app/src:ro
```

## 🔐 Security

### 🛡️ **Security Measures**

- **Container Scanning**: Trivy + Snyk
- **Dependency Scanning**: Dependabot
- **HTTPS Only**: Force SSL
- **CSP Headers**: Content Security Policy
- **Security Headers**: HSTS, X-Frame-Options

### 🔑 **Secrets Management**

- **GitHub Secrets**: CI/CD credentials
- **Azure Key Vault**: Production secrets
- **Environment Variables**: Runtime configuration
- **Never in Code**: No secrets committed

## 🚨 Troubleshooting

### 🐞 **Common Issues**

#### Docker Build Fails

```bash
# Clear Docker cache
docker system prune -a

# Rebuild without cache
docker build --no-cache -f Dockerfile .
```

#### Tests Failing in CI

```bash
# Run tests locally with same environment
npm run test:ci

# Check test coverage
npm run test:coverage
```

#### Deployment Fails

```bash
# Check Azure logs
az webapp log tail --name railway-control-app --resource-group railway-control-rg

# Verify Docker image
docker run -p 80:80 tu-usuario/railway-control:latest
```

#### Performance Issues

```bash
# Run performance audit
npm run build
npx lighthouse http://localhost:4173 --view

# Check bundle size
npm run build
npx bundlesize
```

### 📞 **Getting Help**

1. **Check GitHub Issues**: [Issues](https://github.com/tu-usuario/railway-control/issues)
2. **Review Pipeline Logs**: GitHub Actions tab
3. **Azure Diagnostics**: Application Insights
4. **Community Discord**: [Discord Link]

## 🛠️ Development Workflow

### 🔄 **Standard Workflow**

```bash
# 1. Crear feature branch
git checkout -b feature/nueva-funcionalidad

# 2. Desarrollar localmente
npm run dev
# Hacer cambios...

# 3. Testing
npm run test:all
npm run lint

# 4. Commit con conventional commits
git add .
git commit -m "feat: agregar nueva funcionalidad"

# 5. Push y crear PR
git push origin feature/nueva-funcionalidad
# Crear Pull Request en GitHub

# 6. Después de merge, crear release
git checkout main
git pull origin main
git tag v1.1.0
git push origin v1.1.0
```

### 🎯 **Conventional Commits**

```bash
feat: nueva funcionalidad
fix: corrección de bug
docs: actualización documentación
style: cambios de formato
refactor: refactoring código
test: agregar tests
chore: tareas de mantenimiento
```

## 📈 Performance

### ⚡ **Optimization Targets**

- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **Cumulative Layout Shift**: < 0.1
- **First Input Delay**: < 100ms
- **Bundle Size**: < 500KB gzipped

### 🔧 **Performance Tools**

- **Vite**: Fast build tool
- **Code Splitting**: Dynamic imports
- **Tree Shaking**: Dead code elimination
- **Image Optimization**: WebP + lazy loading
- **CDN**: Azure CDN integration

## 🛤️ Layout de Vías

El sistema incluye un layout complejo con múltiples rutas y dos puntos de entrada:

### Vías de Entrada

- **track-1**: Vía de entrada principal (Tren 1 - Rojo)
- **track-0-horizontal**: Nueva vía de entrada horizontal (Tren 2 - Verde Mar)
- **track-0-diagonal**: Conexión diagonal hacia SW1 (Tren 2 - Verde Mar)

### Vías Principales

- **track-2-main**: Ruta principal después de SW1
- **track-3-main**: Continuación ruta principal después de SW2

### Vías de Desvío

- **track-2-branch-1/2/3**: Ruta superior (desvío de SW1)
- **track-3-branch-1/2**: Ruta inferior (desvío de SW2)

### Puntos de Decisión

- **SW1 (x:300)**: Decide entre ruta principal y desvío superior
- **SW2 (x:600)**: Decide entre continuación recta y desvío inferior

## 🎮 Controles

| Control                       | Función                                           |
| ----------------------------- | ------------------------------------------------- |
| **Start Simulation (Tren 1)** | Inicia el movimiento del tren principal           |
| **Stop Simulation (Tren 1)**  | Detiene el tren principal                         |
| **Reset (Tren 1)**            | Reinicia el tren principal al punto de partida    |
| **Speed Slider (Tren 1)**     | Ajusta velocidad del tren principal (0.1x - 2.0x) |
| **Start Simulation (Tren 2)** | Inicia el movimiento del tren verde mar           |
| **Stop Simulation (Tren 2)**  | Detiene el tren verde mar                         |
| **Reset (Tren 2)**            | Reinicia el tren verde mar al punto de partida    |
| **Speed Slider (Tren 2)**     | Ajusta velocidad del tren verde mar (0.1x - 2.0x) |
| **Clic en Switch**            | Cambia entre ruta principal/desvío                |
| **Clic en Semáforo**          | Alterna entre rojo y verde                        |

## 🎨 Código de Colores

### Vías

- **Dorado (#FFD700)**: Vías comunes
- **Verde**: Ruta principal activa
- **Rojo**: Ruta de desvío activa
- **Azul**: Ruta principal SW2
- **Naranja**: Ruta de desvío SW2

### Trenes

- **Rojo (#DC143C)**: Tren principal (T1)
- **Verde Mar (#2E8B57)**: Segundo tren (T2)

## 🎯 Roadmap

### ✅ **Completed (v1.0.0)**

- [x] Sistema básico de trenes
- [x] Switches y semáforos
- [x] Sistema dual de trenes
- [x] Dockerización completa
- [x] CI/CD Pipeline
- [x] Azure deployment

### 🔄 **In Progress (v1.1.0)**

- [ ] Testing completo (Unit + E2E)
- [ ] Performance optimization
- [ ] Monitoring avanzado
- [ ] Security hardening

### 🚀 **Planned (v1.2.0)**

- [ ] Detección de colisiones
- [ ] Sonidos y efectos
- [ ] Editor de layout
- [ ] Multi-tenancy
- [ ] Real-time collaboration

### 🌟 **Future (v2.0.0)**

- [ ] 3D visualization
- [ ] AI-powered routing
- [ ] Mobile app
- [ ] IoT integration

## 🔧 Tecnologías Utilizadas

- **React 19**: Framework de UI
- **TypeScript**: Tipado estático
- **Vite**: Build tool y dev server
- **SVG**: Gráficos vectoriales para las vías
- **CSS3**: Estilos y animaciones
- **Docker**: Contenedorización
- **Nginx**: Servidor web para producción
- **GitHub Actions**: CI/CD pipeline
- **Azure Web App**: Cloud hosting
- **Terraform**: Infrastructure as Code

## 🤝 Contributing

### 📋 **Contribution Guidelines**

1. **Fork** el repositorio
2. **Crear** feature branch
3. **Implementar** cambios con tests
4. **Verificar** que pasan todos los tests
5. **Crear** Pull Request con descripción detallada

### 🧪 **Testing Requirements**

- Unit tests para nueva funcionalidad
- E2E tests para user journeys
- Performance tests si afecta rendimiento
- Security tests si maneja datos sensibles

### 📖 **Documentation Standards**

- Comentarios en código para lógica compleja
- README actualizado para nuevas features
- API documentation si aplica
- Architecture decisions en ADR format

## 📄 Licencia

MIT License - ver [LICENSE](LICENSE) para detalles.

## 👨‍💻 Autor

**Tu Nombre** - [@tu-usuario](https://github.com/tu-usuario)

---

## 🚀 **¿Listo para empezar?**

```bash
# Quick start completo
git clone https://github.com/tu-usuario/railway-control.git
cd railway-control
npm install
npm run dev
```

**🎯 Estado**: 🟢 Producción Ready  
**📅 Última Actualización**: Septiembre 2025  
**🔄 Versión**: v1.0.0
