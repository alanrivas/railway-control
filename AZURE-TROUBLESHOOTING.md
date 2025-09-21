# 🐛 Errores Comunes en Azure Static Web Apps - Guía de Troubleshooting

Esta guía documenta todos los errores que encontramos durante el deployment y sus soluciones exactas.

## 📋 Índice de Errores

1. [deployment_token was not provided](#error-1-deployment_token-was-not-provided)
2. [unable to determine location of app artifacts](#error-2-unable-to-determine-location-of-app-artifacts)
3. [Permission denied](#error-3-permission-denied)
4. [Context access might be invalid](#error-4-context-access-might-be-invalid)
5. [Workflows duplicados ejecutándose](#error-5-workflows-duplicados-ejecutándose)

---

## Error #1: deployment_token was not provided

### 🔴 Error Completo
```
deployment_token was not provided.
The deployment_token is required for deploying content. If you'd like to continue the run without deployment, add the configuration skip_deploy_on_missing_secrets set to true in your workflow file
An unknown exception has occurred
```

### ❓ Causa
- Falta el token de Azure en GitHub Secrets
- El nombre del secret es incorrecto
- El token está vacío o mal configurado

### ✅ Solución Paso a Paso

1. **Obtener token de Azure Portal**:
   ```
   Azure Portal → Static Web App → Información general → Token de implementación
   ```

2. **Configurar en GitHub**:
   ```
   GitHub → Settings → Secrets and variables → Actions → New repository secret
   Name: AZURE_STATIC_WEB_APPS_API_TOKEN
   Secret: [pegar token completo]
   ```

3. **Verificar workflow**:
   ```yaml
   azure_static_web_apps_api_token: ${{ secrets.AZURE_STATIC_WEB_APPS_API_TOKEN }}
   ```

### 🎯 Token Ejemplo
```
bd5f4ff15aab0cd9a1c2189d399e74aad323fcb6ee25e46f6f6565cdc2f494da01-fd66d59c-f3b6-4d1d-899f-7224924ca5c40100317051720810
```

---

## Error #2: unable to determine location of app artifacts

### 🔴 Error Completo
```
---End of Oryx build logs---
Try to validate location at: '/bin/staticsites/xxx-swa-oryx/app'.
Oryx built the app folder but was unable to determine the location of the app artifacts. Please specify the app artifact location.
```

### ❓ Causa
- Azure no encuentra los archivos compilados de Vite
- Configuración incorrecta de `output_location`
- Parámetros incorrectos en el workflow

### ❌ Configuraciones que NO funcionaron

#### Intento 1: app_artifact_location
```yaml
# ❌ NO FUNCIONA
with:
  app_location: "/"
  app_artifact_location: "dist"
  skip_app_build: true
```

#### Intento 2: output_location vacío
```yaml
# ❌ NO FUNCIONA  
with:
  app_location: "/"
  output_location: ""
```

### ✅ Configuración que SÍ funciona
```yaml
# ✅ FUNCIONA CORRECTAMENTE
with:
  azure_static_web_apps_api_token: ${{ secrets.AZURE_STATIC_WEB_APPS_API_TOKEN }}
  repo_token: ${{ secrets.GITHUB_TOKEN }}
  action: "upload"
  app_location: "/"
  api_location: ""
  output_location: "dist"  # 🎯 CLAVE: Vite genera archivos aquí
```

### 🔍 Verificación Local
```bash
# Verificar que Vite genera archivos en dist/
npm run build
ls dist/
# Debe mostrar: index.html, assets/
```

---

## Error #3: Permission denied

### 🔴 Error
```
Permission denied
```

### ❓ Causa
- Problemas de permisos en el workflow
- Token incorrecto o expirado

### ✅ Solución
1. Verificar que el token sea correcto
2. Regenerar token si es necesario
3. Usar workflow generado por Azure (no custom)

---

## Error #4: Context access might be invalid

### 🔴 Error
```
Context access might be invalid: AZURE_STATIC_WEB_APPS_API_TOKEN
Unrecognized named-value: 'secrets'
```

### ❓ Causa
- Problema de sintaxis en GitHub Actions
- Uso de condicionales incorrectos

### ❌ Sintaxis incorrecta
```yaml
# ❌ NO FUNCIONA
if: ${{ secrets.AZURE_STATIC_WEB_APPS_API_TOKEN }}
if: ${{ !secrets.AZURE_STATIC_WEB_APPS_API_TOKEN }}
```

### ✅ Sintaxis correcta
```yaml
# ✅ FUNCIONA
# No usar condicionales complejas, usar workflow directo
```

---

## Error #5: Workflows duplicados ejecutándose

### 🔴 Problema
- Múltiples workflows en `.github/workflows/`
- Unos fallan, otros funcionan
- Confusión en GitHub Actions

### 📁 Estado problemático
```
.github/workflows/
├── azure-static-web-apps.yml                    ❌ Falla
├── azure-static-web-apps.yml.disabled           ❌ Deshabilitado
├── azure-static-web-apps-gray-pebble-*.yml      ✅ Funciona
├── ci.yml                                        ❌ Innecesario
├── release.yml                                   ❌ Innecesario
└── rollback.yml                                  ❌ Innecesario
```

### ✅ Solución: Mantener solo el que funciona
```bash
# Eliminar workflows innecesarios
rm .github/workflows/azure-static-web-apps.yml
rm .github/workflows/azure-static-web-apps.yml.disabled  
rm .github/workflows/ci.yml
rm .github/workflows/release.yml
rm .github/workflows/rollback.yml

# Mantener solo:
# azure-static-web-apps-gray-pebble-*.yml
```

### 📁 Estado final correcto
```
.github/workflows/
└── azure-static-web-apps-gray-pebble-051720810.yml  ✅ Solo este
```

---

## 🔧 Workflow Final que Funciona

### Archivo: `azure-static-web-apps-gray-pebble-051720810.yml`

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
          app_location: "/"
          api_location: ""
          output_location: "dist"  # 🎯 CLAVE PARA VITE

  close_pull_request_job:
    if: github.event_name == 'pull_request' && github.event.action == 'closed'
    runs-on: ubuntu-latest
    name: Close Pull Request Job
    steps:
      - name: Close Pull Request
        id: closepullrequest
        uses: Azure/static-web-apps-deploy@v1
        with:
          azure_static_web_apps_api_token: ${{ secrets.AZURE_STATIC_WEB_APPS_API_TOKEN }}
          action: "close"
```

---

## 📊 Timeline de Resolución

### Orden cronológico de errores y soluciones:

1. **Push inicial** → Error: "deployment_token was not provided"
2. **Agregar token** → Error: "unable to determine location of app artifacts"  
3. **Cambiar a app_artifact_location** → Mismo error persiste
4. **Agregar skip_app_build** → Mismo error persiste
5. **Usar workflow de Azure** → ✅ **FUNCIONA**
6. **Limpiar workflows duplicados** → ✅ **Sin más errores**

### Lección clave:
**El workflow generado automáticamente por Azure es el que funciona correctamente.**

---

## 🎯 Checklist de Verificación

### Antes de hacer push:
- [ ] Token `AZURE_STATIC_WEB_APPS_API_TOKEN` configurado
- [ ] Solo un workflow en `.github/workflows/`
- [ ] Workflow usa `output_location: "dist"`
- [ ] Build local exitoso: `npm run build`
- [ ] Node.js >= 20.19.0 (para Vite 7.x)

### Si hay errores:
- [ ] Revisar logs completos en GitHub Actions
- [ ] Verificar que el token sea correcto
- [ ] Confirmar que `dist/` se genera localmente
- [ ] Eliminar workflows duplicados
- [ ] Usar workflow generado por Azure

---

## 🚀 Resultado Final Exitoso

### URL de la aplicación:
```
https://gray-pebble-051720810.1.azurestaticapps.net/
```

### GitHub Actions:
- ✅ Solo un workflow ejecutándose
- ✅ Build exitoso en ~1 minuto
- ✅ Deployment automático en cada push

### Archivos importantes:
```
✅ .github/workflows/azure-static-web-apps-gray-pebble-051720810.yml
✅ package.json (engines.node >= 20.19.0)
```

---

**💡 Tip final**: Cuando Azure crea automáticamente la integración con GitHub, genera un workflow que ya tiene la configuración correcta. Es mejor usar ese workflow que crear uno custom.