# 🧪 Guía de Testing - Railway Control System

## 🎯 Objetivos de Testing

Esta guía te ayudará a probar la aplicación Railway Control System en diferentes entornos y configuraciones para asegurar que todo funciona correctamente antes del deployment.

## 🏃‍♂️ Testing Local (Sin Docker)

### 📋 Prerrequisitos para Testing Local

```bash
# Verificar versiones requeridas
node --version    # Debe ser v18.0.0 o superior
npm --version     # Debe ser v8.0.0 o superior
git --version     # Cualquier versión reciente
```

### 🚀 Setup y Testing Básico

1. **Preparación del Entorno**

   ```bash
   # Clonar repositorio
   git clone https://github.com/tu-usuario/railway-control.git
   cd railway-control

   # Instalar dependencias
   npm install

   # Verificar que no hay errores
   echo "✅ Setup completado si no hay errores arriba"
   ```

2. **Test de Build de Desarrollo**

   ```bash
   # Iniciar servidor de desarrollo
   npm run dev

   # Verificaciones:
   # ✅ Servidor debe iniciar en http://localhost:5173
   # ✅ No debe haber errores en consola
   # ✅ Hot reload debe funcionar (edita un archivo y guarda)
   ```

3. **Test de Build de Producción**

   ```bash
   # Build para producción
   npm run build

   # Verificaciones esperadas:
   # ✅ Build exitoso sin errores
   # ✅ Archivos generados en ./dist/
   # ✅ Assets optimizados (CSS + JS minificados)

   # Previsualizar build de producción
   npm run preview

   # Verificaciones:
   # ✅ Servidor en http://localhost:4173
   # ✅ Aplicación carga correctamente
   # ✅ No errores en browser console
   ```

### 🎮 Testing Funcional Local

**Test de Funcionalidades Core:**

1. **Test de Carga Inicial**

   ```
   ✅ Página carga sin errores
   ✅ Se muestran ambos trenes en posiciones iniciales
   ✅ Paneles de control visibles y accesibles
   ✅ Switches y semáforos en estado por defecto
   ```

2. **Test de Controles de Trenes**

   ```
   ✅ Botón "Start" inicia tren (estado cambia a "EJECUTANDO")
   ✅ Botón "Stop" detiene tren (estado cambia a "DETENIDO")
   ✅ Slider de velocidad funciona (0.1x - 2.0x)
   ✅ Botón "Reset" regresa tren a posición inicial
   ✅ Controles independientes para cada tren
   ```

3. **Test de Switches**

   ```
   ✅ Click en switch cambia color (verde ↔ rojo)
   ✅ Trenes respetan estado del switch
   ✅ SW1: verde (principal) vs rojo (desvío)
   ✅ SW2: azul (principal) vs naranja (desvío)
   ```

4. **Test de Semáforos**
   ```
   ✅ Click en semáforo alterna rojo ↔ verde
   ✅ Tren se detiene ante semáforo rojo
   ✅ Tren continúa cuando semáforo cambia a verde
   ✅ Ambos trenes respetan semáforos independientemente
   ```

### 📊 Testing de Performance Local

```bash
# Verificar bundle size
npm run build
ls -la dist/assets/
# Verificar que JS gzipped < 100KB

# Test de memory leaks (opcional)
# Ejecutar en Chrome DevTools:
# 1. Abrir Performance tab
# 2. Iniciar simulación por 60 segundos
# 3. Verificar que memoria no crece constantemente
```

## 🐳 Testing con Docker

### 📋 Prerrequisitos para Docker

```bash
# Verificar Docker instalado
docker --version          # v20.0.0+
docker-compose --version  # v2.0.0+

# Verificar Docker running
docker ps
# Debe responder sin errores
```

### 🏗️ Testing Docker Development

1. **Test con Docker Compose (Recomendado)**

   ```bash
   # Build y ejecutar en desarrollo
   docker-compose -f docker-compose.dev.yml up --build

   # Verificaciones esperadas:
   # ✅ Build exitoso sin errores
   # ✅ Contenedor iniciado en puerto 5173
   # ✅ Hot reload funcionando
   # ✅ Logs limpios sin errores

   # Test de acceso
   curl -I http://localhost:5173
   # Debe responder: HTTP/1.1 200 OK

   # Cleanup
   docker-compose -f docker-compose.dev.yml down
   ```

2. **Test con Docker Manual**

   ```bash
   # Build imagen de desarrollo
   docker build -f Dockerfile.dev -t railway-control:dev .

   # Verificaciones del build:
   # ✅ Build completado exitosamente
   # ✅ No errores durante npm install
   # ✅ Imagen creada correctamente

   # Ejecutar contenedor
   docker run -d -p 5173:5173 --name railway-dev railway-control:dev

   # Test de funcionamiento
   sleep 5  # Esperar que inicie
   curl -I http://localhost:5173
   # Debe responder: HTTP/1.1 200 OK

   # Verificar logs
   docker logs railway-dev
   # Debe mostrar "Local: http://localhost:5173/"

   # Cleanup
   docker stop railway-dev
   docker rm railway-dev
   ```

### 🚀 Testing Docker Production

1. **Test con Docker Compose Producción**

   ```bash
   # Build y ejecutar en producción
   docker-compose up --build

   # Verificaciones:
   # ✅ Multi-stage build exitoso
   # ✅ Nginx iniciado correctamente
   # ✅ Aplicación servida en puerto 80

   # Test de acceso
   curl -I http://localhost:80
   # Debe responder: HTTP/1.1 200 OK
   # Server: nginx/x.x.x

   # Test de contenido
   curl http://localhost:80 | grep "Railway Control"
   # Debe encontrar el título de la aplicación

   # Cleanup
   docker-compose down
   ```

2. **Test Docker Production Manual**

   ```bash
   # Build imagen de producción
   docker build -f Dockerfile -t railway-control:prod .

   # Verificaciones del build:
   # ✅ Build stage completado (Node.js)
   # ✅ Production stage completado (Nginx)
   # ✅ Imagen optimizada (~50MB)

   # Test de ejecución
   docker run -d -p 8080:80 --name railway-prod railway-control:prod

   # Test básico
   sleep 3
   curl -I http://localhost:8080
   # HTTP/1.1 200 OK

   # Test de contenido
   curl http://localhost:8080 | head -20
   # Debe mostrar HTML válido con título correcto

   # Test de assets
   curl -I http://localhost:8080/assets/
   # Verificar que CSS y JS cargan correctamente

   # Cleanup
   docker stop railway-prod
   docker rm railway-prod
   ```

### 🔄 Testing Docker con Scripts NPM

```bash
# Testing automatizado con scripts pre-configurados

# Test desarrollo Docker
npm run docker:dev
# Abre automáticamente en puerto 5173

# Test producción Docker
npm run docker:prod
# Abre automáticamente en puerto 8080

# Test build únicamente
npm run docker:build
# Solo construye imagen sin ejecutar

# Test completo automatizado
npm run docker:test
# Ejecuta suite completa de tests Docker
```

## 🌐 Testing de Deployment

### ☁️ Test de Deploy en Azure (Opcional)

Si tienes Azure configurado:

```bash
# Deploy con Terraform
cd terraform/
terraform plan
terraform apply

# Test de health check
curl -I https://tu-app.azurewebsites.net
# HTTP/1.1 200 OK

# Test de funcionalidad
curl https://tu-app.azurewebsites.net | grep "Railway Control"
```

### 📦 Test de Docker Hub (Opcional)

Si tienes Docker Hub configurado:

```bash
# Test de pull público
docker pull tu-usuario/railway-control:latest

# Test de ejecución desde registry
docker run -d -p 8080:80 tu-usuario/railway-control:latest

# Verificar funcionamiento
curl -I http://localhost:8080
```

## 🧪 Testing Automatizado

### 🔧 Setup de Testing Framework

```bash
# Instalar dependencias de testing (futuro)
npm install --save-dev @testing-library/react @testing-library/jest-dom vitest

# Configurar en vite.config.ts
export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts'
  }
});
```

### 📝 Test Cases Ejemplo

```typescript
// src/components/Railway/__tests__/TrainComponent.test.tsx
import { render, screen, fireEvent } from "@testing-library/react";
import { TrainComponent } from "../TrainComponent";

describe("TrainComponent", () => {
  test("starts and stops correctly", () => {
    render(<TrainComponent id="test-train" />);

    const startButton = screen.getByText("Start");
    fireEvent.click(startButton);

    expect(screen.getByText("EJECUTANDO")).toBeInTheDocument();
  });
});
```

## 🚨 Troubleshooting de Testing

### ❗ Problemas Comunes y Soluciones

**"npm run dev falla"**

```bash
# Limpiar dependencias
rm -rf node_modules package-lock.json
npm install

# Verificar Node version
node --version  # Debe ser v18+

# Verificar puertos
lsof -i :5173  # Verificar que puerto esté libre
```

**"Docker build falla"**

```bash
# Limpiar Docker cache
docker system prune -a

# Verificar Dockerfile syntax
docker build --no-cache -f Dockerfile .

# Check Docker daemon
docker info
```

**"Aplicación no carga en browser"**

```bash
# Verificar en Network tab de DevTools
# Buscar errores 404 o CORS

# Test básico de conectividad
curl -v http://localhost:5173

# Verificar JavaScript habilitado
# Probar en modo incógnito
```

**"Hot reload no funciona"**

```bash
# Verificar que archivos están siendo watched
# Revisar vite.config.ts

# En Windows, verificar límites de file watchers
# Reiniciar VS Code si es necesario
```

## ✅ Checklist de Testing Completo

### 🏃‍♂️ Testing Local

- [ ] `npm install` sin errores
- [ ] `npm run dev` inicia correctamente
- [ ] Aplicación carga en http://localhost:5173
- [ ] Hot reload funciona
- [ ] `npm run build` exitoso
- [ ] `npm run preview` funciona
- [ ] Todos los controles responden
- [ ] Simulación de trenes funciona

### 🐳 Testing Docker Dev

- [ ] `docker-compose -f docker-compose.dev.yml up` exitoso
- [ ] Aplicación accesible en puerto 5173
- [ ] Hot reload funciona en Docker
- [ ] Logs limpios sin errores
- [ ] Performance aceptable

### 🚀 Testing Docker Prod

- [ ] `docker build -f Dockerfile` exitoso
- [ ] Imagen multi-stage optimizada
- [ ] `docker run` inicia Nginx correctamente
- [ ] Aplicación accesible en puerto 80
- [ ] Assets servidos correctamente
- [ ] Tamaño de imagen < 100MB

### 🌐 Testing Deployment (Opcional)

- [ ] GitHub Actions CI/CD pipeline verde
- [ ] Docker Hub push exitoso
- [ ] Azure deployment funcional
- [ ] Health checks pasando
- [ ] Performance en producción aceptable

## 📊 Métricas de Testing Exitoso

**Performance Targets:**

- Build time local: < 30 segundos
- Docker build time: < 5 minutos
- First contentful paint: < 1.5 segundos
- Bundle size: < 500KB
- Docker image: < 100MB

**Funcionalidad:**

- 100% de controles funcionando
- 0 errores en browser console
- Responsive en desktop y tablet
- Compatible con Chrome, Firefox, Safari

---

<div align="center">

**🧪 ¡Testing completo = Deployment confiable! 🚀**

_¿Encontraste algún problema? Consulta la sección de troubleshooting o abre un issue_

</div>
