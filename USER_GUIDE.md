# 📖 Guía de Usuario - Railway Control System

## 🎯 ¿Qué es Railway Control System?

Railway Control System es una simulación interactiva de un sistema ferroviario donde puedes controlar múltiples trenes, switches y semáforos en tiempo real. Es perfecto para entender conceptos de control de tráfico ferroviario y para disfrutar de una simulación realista.

## 🚀 Cómo Empezar

### 🌐 Acceso Online

Simplemente visita: **https://railway-control-app.azurewebsites.net**

- No requiere instalación
- Funciona en cualquier navegador moderno
- Acceso inmediato

### 💻 Instalación Local

**Opción 1: Con Docker (Recomendado)**

```bash
# 1. Instalar Docker desde https://docker.com
# 2. Ejecutar el comando:
docker run -p 8080:80 tu-usuario/railway-control:latest
# 3. Abrir http://localhost:8080
```

**Opción 2: Desarrollo Local**

```bash
# 1. Instalar Node.js desde https://nodejs.org
# 2. Clonar el repositorio:
git clone https://github.com/tu-usuario/railway-control.git
cd railway-control
# 3. Instalar dependencias:
npm install
# 4. Ejecutar:
npm run dev
# 5. Abrir http://localhost:5173
```

## 🎮 Interfaz de Usuario

### 📱 Layout Principal

```
┌─────────────────────────────────────────────────┐
│                 Railway Layout                   │
│  🚂────🔀SW1────🚦────🔀SW2────🚦────🚂        │
│   │                                    │         │
│   └─────🔀──────🚦──────🔀─────────────┘        │
│                                                 │
│  ┌─────────────┐    ┌─────────────┐             │
│  │ Tren Azul   │    │ Tren Verde  │             │
│  │ Control     │    │ Mar Control │             │
│  │ Panel       │    │ Panel       │             │
│  └─────────────┘    └─────────────┘             │
└─────────────────────────────────────────────────┘
```

### 🎛️ Paneles de Control

**Panel Tren Azul (Principal)**

- **Start/Stop**: Iniciar o detener el tren
- **Velocidad**: Slider de 0.1x a 2.0x
- **Reset**: Regresar a posición inicial
- **Estado**: Muestra "EJECUTANDO" o "DETENIDO"

**Panel Tren Verde Mar**

- **Start/Stop**: Control independiente
- **Velocidad**: Slider independiente de 0.1x a 2.0x
- **Reset**: Regresar a su posición inicial específica
- **Estado**: Estado independiente del otro tren

### 🔀 Switches (Desvíos)

Los switches controlan las rutas que tomarán los trenes:

**SW1 (Switch Principal)**

- 🟢 **Verde**: Ruta principal (continúa derecho)
- 🔴 **Rojo**: Ruta de desvío (va hacia arriba)
- **Clic**: Cambia entre rutas

**SW2 (Switch Secundario)**

- 🔵 **Azul**: Ruta principal (continúa derecho)
- 🟠 **Naranja**: Ruta de desvío (va hacia abajo)
- **Clic**: Alterna entre opciones

### 🚦 Semáforos

Los semáforos controlan el tráfico de ambos trenes:

- 🔴 **Rojo**: Detiene cualquier tren que se acerque
- 🟢 **Verde**: Permite el paso libre
- **Clic**: Alterna entre rojo y verde
- **Efecto Global**: Afecta a ambos trenes automáticamente

## 🎯 Cómo Usar la Simulación

### 📋 Paso a Paso

1. **Configuración Inicial**

   ```
   1. Observa el layout de vías
   2. Nota las posiciones iniciales de los trenes:
      - Tren Azul: Lado izquierdo, vía principal
      - Tren Verde Mar: Parte superior, vía horizontal
   3. Configura switches y semáforos según tu preferencia
   ```

2. **Iniciar Simulación**

   ```
   1. Haz clic en "Start" en el panel del Tren Azul
   2. Haz clic en "Start" en el panel del Tren Verde Mar
   3. Ajusta las velocidades independientemente
   4. Observa cómo los trenes siguen las rutas configuradas
   ```

3. **Control Durante la Simulación**
   ```
   1. Cambia switches mientras los trenes se mueven
   2. Usa semáforos para controlar el tráfico
   3. Ajusta velocidades en tiempo real
   4. Detén trenes específicos si es necesario
   ```

### 🎪 Escenarios de Ejemplo

**Escenario 1: Rutas Paralelas**

```
1. SW1 en verde (principal)
2. SW2 en azul (principal)
3. Ambos semáforos en verde
4. Resultado: Ambos trenes siguen rutas paralelas
```

**Escenario 2: Rutas Cruzadas**

```
1. SW1 en rojo (desvío)
2. SW2 en naranja (desvío)
3. Semáforos controlando intersecciones
4. Resultado: Trenes se cruzan controladamente
```

**Escenario 3: Control de Tráfico**

```
1. Configurar switches según preferencia
2. Usar semáforos para crear "semáforos inteligentes"
3. Alternar semáforos para evitar colisiones
4. Resultado: Simulación de control de tráfico real
```

## 🔧 Funciones Avanzadas

### ⚡ Control de Velocidad

- **Rango**: 0.1x (muy lento) a 2.0x (muy rápido)
- **Ajuste en Tiempo Real**: Cambia velocidad mientras el tren se mueve
- **Control Independiente**: Cada tren tiene su propia velocidad
- **Efectos Visuales**: La animación se ajusta automáticamente

### 🔄 Sistema de Reset

- **Reset Individual**: Cada tren regresa a su posición inicial específica
- **Estado Preservado**: Los switches y semáforos mantienen su configuración
- **Reset Durante Movimiento**: Puedes resetear un tren mientras el otro sigue en movimiento

### 🎨 Indicadores Visuales

- **Trenes Animados**: Ventanas, ruedas y colores distintivos
- **Feedback de Estado**: Los paneles muestran el estado actual claramente
- **Transiciones Suaves**: Cambios de switch y semáforo con animaciones
- **Código de Colores Consistente**: Fácil identificación visual

## 🐛 Solución de Problemas

### ❓ Problemas Comunes

**"El tren no se mueve"**

```
✅ Verificar que el tren esté en estado "EJECUTANDO"
✅ Comprobar que la velocidad no esté en 0.1x
✅ Verificar que no haya un semáforo rojo bloqueando
✅ Hacer reset y intentar de nuevo
```

**"El tren no respeta los switches"**

```
✅ Los switches cambian la ruta desde ese punto en adelante
✅ Si el tren ya pasó el switch, no se verá afectado
✅ Cambiar el switch antes de que llegue el tren
```

**"Los semáforos no funcionan"**

```
✅ Los semáforos afectan cuando el tren está cerca
✅ Cambiar el semáforo a verde para permitir el paso
✅ Los trenes se detienen automáticamente en rojo
```

**"La página no carga"**

```
✅ Verificar conexión a internet
✅ Actualizar la página (F5)
✅ Probar en modo incógnito
✅ Verificar que JavaScript esté habilitado
```

### 💡 Consejos y Trucos

1. **Experimentación Libre**

   - No hay forma "incorrecta" de usar la simulación
   - Prueba diferentes combinaciones de switches y semáforos
   - Observa cómo interactúan los dos sistemas de trenes

2. **Observación del Comportamiento**

   - Los trenes respetan automáticamente la configuración
   - Cada tren es completamente independiente
   - Las decisiones de routing se toman en tiempo real

3. **Control de Tráfico Realista**
   - Usa semáforos para simular control de tráfico real
   - Coordina switches para crear rutas complejas
   - Experimenta con diferentes velocidades para simular diferentes tipos de trenes

## 📱 Compatibilidad

### 🌐 Navegadores Soportados

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ✅ Opera 76+

### 📱 Dispositivos

- ✅ **Desktop**: Experiencia completa
- ✅ **Tablet**: Funcionalidad completa con touch
- ✅ **Móvil**: Funcional pero recomendado en landscape

### ⚙️ Requisitos Técnicos

- **JavaScript**: Debe estar habilitado
- **Resolución Mínima**: 1024x768
- **Memoria**: 512MB RAM disponible
- **Conexión**: No requiere conexión constante (después de cargar)

## 🆘 Soporte

### 📞 Obtener Ayuda

- **GitHub Issues**: [Reportar bugs o solicitar features](https://github.com/tu-usuario/railway-control/issues)
- **Discussions**: [Preguntas generales y discusión](https://github.com/tu-usuario/railway-control/discussions)
- **Email**: soporte@railway-control.com

### 📚 Recursos Adicionales

- [🔧 Documentación Técnica](README.md)
- [🚀 Guía de Deployment](DEPLOYMENT_PLAN.md)
- [📝 Historial de Cambios](CHANGELOG.md)
- [❓ FAQ](https://github.com/tu-usuario/railway-control/wiki/FAQ)

---

<div align="center">

**🚂 ¡Disfruta explorando el mundo del control ferroviario! 🚂**

_¿Tienes una idea para mejorar la simulación? ¡Nos encantaría escucharla!_

</div>
