# 🚀 Guía Completa de Deployment en Azure Static Web Apps

Esta guía documenta todo el proceso de deployment en Azure Static Web Apps, incluyendo errores comunes y sus soluciones.

## 📋 Tabla de Contenidos

- [Configuración Inicial](#configuración-inicial)
- [Obtener el Deployment Token](#obtener-el-deployment-token)
- [Configuración del Workflow](#configuración-del-workflow)
- [Errores Comunes y Soluciones](#errores-comunes-y-soluciones)
- [Troubleshooting](#troubleshooting)
- [Configuración Final Exitosa](#configuración-final-exitosa)

## 🎯 Configuración Inicial

### 1. Crear Azure Static Web App

1. Ve al **Azure Portal**: https://portal.azure.com
2. Busca **"Static Web Apps"**
3. **Crear nuevo recurso**:
   - **Subscription**: Tu suscripción de Azure
   - **Resource Group**: Crear nuevo o usar existente
   - **Name**: `railway-control` (o el nombre que prefieras)
   - **Plan type**: Free (para desarrollo)
   - **Source**: GitHub
   - **Repository**: `alanrivas/railway-control`
   - **Branch**: `master`
   - **Build Presets**: React
   - **App location**: `/`
   - **Output location**: `dist`

4. Azure creará automáticamente:
   - El recurso Static Web App
   - Un workflow de GitHub Actions
   - Un deployment token

## 🔑 Obtener el Deployment Token

### Método 1: Desde Azure Portal

1. Ve a tu **Static Web App** en Azure Portal
2. En el menú izquierdo, selecciona **"Información general"**
3. Busca el **"Deployment token"** o **"Token de implementación"**
4. Copia el token (formato: `xxxxx-xxxxx-xxxxx-xxxxx`)

### Método 2: Desde Configuración

1. En tu Static Web App, ve a **"Configuración"**
2. Busca **"Configuración de la implementación"**
3. El token debería estar visible o tener un botón para copiarlo

⚠️ **Importante**: El token es largo y único para tu aplicación.

## 🔐 Configurar GitHub Secrets

1. Ve a tu repositorio en GitHub
2. **Settings** → **Secrets and variables** → **Actions**
3. **New repository secret**:
   - **Name**: `AZURE_STATIC_WEB_APPS_API_TOKEN`
   - **Secret**: Pega el token obtenido de Azure
4. **Add secret**

## ⚙️ Configuración del Workflow

### Workflow Correcto (azure-static-web-apps-gray-pebble-*.yml)

```yaml
name: Azure Static Web Apps CI/CD

on:
  push:
    branches:
      - master
  pull_request:
    types: [opened, synchronize, reopened, closed]
    branches:
      - master

jobs:
  build_and_deploy_job:
    if: github.event_name == 'push' || (github.event_name == 'pull_request' && github.event.action != 'closed')
    runs-on: ubuntu-latest
    name: Build and Deploy Job
    steps:
      - uses: actions/checkout@v3
        with:
          submodules: true
          lfs: false
      - name: Build And Deploy
        id: builddeploy
        uses: Azure/static-web-apps-deploy@v1
        with:
          azure_static_web_apps_api_token: ${{ secrets.AZURE_STATIC_WEB_APPS_API_TOKEN }}
          repo_token: ${{ secrets.GITHUB_TOKEN }}
          action: "upload"
          app_location: "/" # App source code path
          api_location: "" # Api source code path - optional
          output_location: "dist" # ✅ CLAVE: Built app content directory
```

### Configuraciones Clave

- **`output_location: "dist"`**: Vite genera archivos en la carpeta `dist/`
- **`app_location: "/"`**: Código fuente en la raíz del repositorio
- **`api_location: ""`**: No hay API backend
- **Token correcto**: `AZURE_STATIC_WEB_APPS_API_TOKEN`

## ❌ Errores Comunes y Soluciones

### 1. "deployment_token was not provided"

**Error**:
```
deployment_token was not provided.
The deployment_token is required for deploying content.
```

**Causa**: Falta el token en GitHub Secrets

**Solución**:
1. Obtener el token de Azure (ver sección anterior)
2. Agregarlo como secret `AZURE_STATIC_WEB_APPS_API_TOKEN`
3. Verificar que el nombre del secret sea exacto

### 2. "Unable to determine the location of app artifacts"

**Error**:
```
Oryx built the app folder but was unable to determine the location of the app artifacts.
Please specify the app artifact location.
```

**Causa**: Azure no encuentra los archivos compilados

**❌ Configuraciones incorrectas**:
```yaml
# INCORRECTO
output_location: ""
app_artifact_location: "dist"
skip_app_build: true
```

**✅ Configuración correcta**:
```yaml
# CORRECTO
output_location: "dist"
```

### 3. Workflows Duplicados

**Problema**: Múltiples workflows ejecutándose y fallando

**Solución**: Mantener solo el workflow generado por Azure
1. Eliminar workflows duplicados en `.github/workflows/`
2. Conservar solo: `azure-static-web-apps-gray-pebble-*.yml`

### 4. Token Incorrecto

**Problema**: Usar el token auto-generado vacío

**❌ Incorrecto**:
```yaml
azure_static_web_apps_api_token: ${{ secrets.AZURE_STATIC_WEB_APPS_API_TOKEN_GRAY_PEBBLE_* }}
```

**✅ Correcto**:
```yaml
azure_static_web_apps_api_token: ${{ secrets.AZURE_STATIC_WEB_APPS_API_TOKEN }}
```

## 🔧 Troubleshooting

### Verificar Build Local

```bash
# Verificar que el build funciona localmente
npm run build

# Verificar que se genera la carpeta dist/
ls dist/

# Debería contener:
# - index.html
# - assets/ (CSS y JS)
```

### Verificar Node.js Version

Para proyectos con Vite 7.x:

```json
// package.json
{
  "engines": {
    "node": ">=20.19.0"
  }
}
```

### Verificar GitHub Actions

1. Ve a **Actions** en tu repositorio
2. Verifica que solo se ejecute un workflow
3. Revisa los logs para errores específicos

### Verificar Azure Configuration

1. **Azure Portal** → Tu Static Web App
2. **Configuración** → Verificar configuraciones
3. **Overview** → Ver URL de la aplicación

## ✅ Configuración Final Exitosa

### Archivos Importantes

```
.github/workflows/
└── azure-static-web-apps-gray-pebble-*.yml  # Workflow correcto

package.json  # Con engines.node >= 20.19.0
```

### GitHub Secrets Requeridos

- `AZURE_STATIC_WEB_APPS_API_TOKEN`: Token obtenido de Azure

### Resultado Final

- **URL de la aplicación**: `https://gray-pebble-*.azurestaticapps.net`
- **Deployment automático**: En cada push a `master`
- **Sin errores**: Solo un workflow ejecutándose

## 📊 Comandos de Limpieza

Si tienes workflows duplicados:

```bash
# Eliminar workflows innecesarios
rm .github/workflows/ci.yml
rm .github/workflows/release.yml
rm .github/workflows/azure-static-web-apps.yml.disabled

# Mantener solo el que funciona
# azure-static-web-apps-gray-pebble-*.yml

# Commit y push
git add .github/workflows/
git commit -m "cleanup: remove duplicate workflows"
git push origin master
```

## 🎯 Checklist de Deployment

- [ ] Azure Static Web App creado
- [ ] Token obtenido de Azure Portal
- [ ] Secret `AZURE_STATIC_WEB_APPS_API_TOKEN` configurado en GitHub
- [ ] Workflow correcto con `output_location: "dist"`
- [ ] Solo un workflow en `.github/workflows/`
- [ ] Build local exitoso (`npm run build`)
- [ ] Node.js >= 20.19.0 para Vite 7.x
- [ ] Aplicación funcionando en la URL de Azure

## 🚀 Resultado Final

Tu aplicación estará disponible en:
**https://[nombre-generado].azurestaticapps.net**

Cada push a `master` disparará un deployment automático.

---

## 📝 Historial de Errores Resueltos

### Timeline de Solución

1. **Error inicial**: "unable to determine location of app artifacts"
2. **Solución 1**: Cambiar a `app_artifact_location: "dist"`
3. **Error persiste**: Azure sigue usando Oryx build automático
4. **Solución 2**: Usar `skip_app_build: true`
5. **Error persiste**: Configuración incorrecta
6. **Solución final**: Usar workflow generado por Azure con `output_location: "dist"`

### Lecciones Aprendidas

1. **Azure genera el workflow correcto automáticamente**
2. **`output_location` es el parámetro correcto para Vite**
3. **Un solo workflow evita conflictos**
4. **El token debe ser el correcto, no el auto-generado vacío**
5. **Vite 7.x requiere Node.js >= 20.19.0**

---

**✅ Esta configuración ha sido probada y funciona correctamente con Railway Control System en Azure Static Web Apps.**