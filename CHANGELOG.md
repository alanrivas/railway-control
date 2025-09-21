# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- CI/CD pipeline with GitHub Actions
- Docker support for development and production
- Terraform infrastructure as code for Azure
- Comprehensive testing setup (Unit, Integration, E2E)
- Automated rollback capabilities
- Performance monitoring and alerts

## [1.0.0] - 2025-09-11

### Added

- Sistema dual de trenes independientes
- Tren principal (rojo) y tren verde mar
- Controles independientes para cada tren
- Paneles de control diferenciados por tren
- Sistema de switches interactivos con código de colores
- Sistema de semáforos con control de tráfico
- Detección de colisiones con semáforos
- Navegación inteligente respetando switches
- Velocidades ajustables independientes (0.1x - 2.0x)
- Reset independiente para cada tren
- Layout complejo de vías con múltiples rutas
- Interfaz visual estilo metro/subway
- Animaciones fluidas de movimiento
- Responsive design para diferentes pantallas

### Technical

- React 19 con TypeScript
- Vite como build tool
- SVG para gráficos vectoriales
- CSS3 con animaciones
- Arquitectura de componentes modular
- Tipado estricto con TypeScript
- Configuración ESLint estricta

### Infrastructure

- Dockerización completa
- Multi-stage builds optimizados
- Nginx para serving en producción
- Hot reload en desarrollo
- Volume mounting para desarrollo
- Environment variables configurables

### CI/CD

- GitHub Actions workflows
- Automated testing pipeline
- Docker image building and pushing
- Azure Web App deployment
- Manual rollback capabilities
- Semantic versioning automation
- Security scanning with Trivy
- Performance monitoring setup

### Documentation

- README completo con guías de setup
- Documentación de arquitectura
- Guías de contribución
- Troubleshooting guides
- Performance optimization guides

## [0.9.0] - 2025-09-10

### Added

- Sistema básico de un solo tren
- Switches simples
- Semáforos básicos
- Layout inicial de vías

### Changed

- Migración a React 19
- Actualización de dependencias

### Fixed

- Problemas de navegación en curvas
- Detección de colisiones básica

## [0.8.0] - 2025-09-09

### Added

- Componente base de railway
- Sistema de vías básico
- Renderizado SVG inicial

### Technical

- Setup inicial del proyecto
- Configuración de Vite
- Setup de TypeScript
- Configuración básica de ESLint

---

## Template para Nuevas Releases

### [X.Y.Z] - YYYY-MM-DD

### Added

- Nueva funcionalidad agregada

### Changed

- Cambios en funcionalidad existente

### Deprecated

- Funcionalidad que será removida en versiones futuras

### Removed

- Funcionalidad removida

### Fixed

- Bugs corregidos

### Security

- Vulnerabilidades corregidas

---

## Convenciones

### Tipos de Cambios

- **Added**: Nueva funcionalidad
- **Changed**: Cambios en funcionalidad existente
- **Deprecated**: Funcionalidad que será removida
- **Removed**: Funcionalidad removida
- **Fixed**: Bugs corregidos
- **Security**: Vulnerabilidades corregidas

### Versionado

- **Major (X.0.0)**: Breaking changes
- **Minor (X.Y.0)**: Nueva funcionalidad compatible
- **Patch (X.Y.Z)**: Bug fixes compatibles

### Links

- [Unreleased]: https://github.com/tu-usuario/railway-control/compare/v1.0.0...HEAD
- [1.0.0]: https://github.com/tu-usuario/railway-control/releases/tag/v1.0.0
- [0.9.0]: https://github.com/tu-usuario/railway-control/releases/tag/v0.9.0
- [0.8.0]: https://github.com/tu-usuario/railway-control/releases/tag/v0.8.0
