# Casa de Apuestas - Plataforma de Apuestas Deportivas y Casino

Una aplicación web moderna y responsiva para apuestas deportivas y juegos de casino, diseñada con una interfaz oscura elegante y acentos neón.

## Características

### Apuestas Deportivas
- Partidos en vivo y próximos para fútbol, baloncesto, tenis, esports y MMA/UFC
- Cuotas dinámicas que se actualizan en tiempo real
- Cupón de apuestas interactivo con cálculo automático de pagos potenciales
- Apuestas simples y combinadas (acumuladoras)
- Detalles de partidos con estadísticas y cronología en vivo

### Juegos de Casino
- **Tragamonedas**: Máquina tragamonedas de 3 rodillos con símbolos temáticos y líneas de pago
- **Ruleta**: Ruleta europea con tablero de apuestas completo y animación de rueda giratoria
- **Blackjack**: Juego de 21 contra un crupier IA con opciones de golpear, plantarse, doblar y dividir
- **Crash**: Juego estilo Aviator con gráfico multiplicador que sube hasta caer aleatoriamente

### Sistema de Cartera
- Balance virtual de fondos
- Historial de transacciones (depositos, apuestas, ganancias, perdidas)
- Sistema de deposito simulado
- Perfil de usuario con nivel y experiencia

### Interfaz de Usuario
- Diseño oscuro moderno con acentos neón (verde, cian, dorado)
- Totalmente responsivo para móviles y escritorio
- Navegación lateral y barra inferior móvil
- Cupón de apuestas como barra lateral (escritorio) o hoja inferior (móvil)
- Notificaciones tipo toast para eventos importantes
- Animaciones suaves y efectos visuales

## Estructura del Proyecto

```
PAGINA APUESTAS/
├── index.html              # Estructura HTML principal
├── css/
│   ├── variables.css       # Variables CSS (colores, tipografía, espacios)
│   ├── main.css            # Estilos básicos y layout
│   ├── components.css      # Estilos de componentes específicos
│   ├── sports.css          # Estilos para apuestas deportivas
│   └── casino.css          # Estilos para juegos de casino
├── js/
│   ├── main.js             # Punto de entrada de la aplicación y router
│   ├── state.js            # Gestión centralizada del estado
│   ├── utils.js            # Funciones de utilidad y helpers
│   ├── components/
│   │   ├── header.js       # Componente de encabezado
│   │   ├── sportsbetting.js# Lógica de apuestas deportivas
│   │   ├── casino.js       # Lógica de juegos de casino
│   │   ├── betslip.js      # Funcionalidad del cupón de apuestas
│   │   └── wallet.js       # Sistema de cartera y perfil
│   └── games/
│       ├── slots.js        # Lógica de tragamonedas
│       ├── roulette.js     # Lógica de ruleta
│       ├── blackjack.js    # Lógica de blackjack
│       └── crash.js        # Lógica del juego crash
├── assets/
│   ├── icons/              # Iconos SVG
│   ├── sounds/             # Efectos de sonido
│   └── images/             # Fondos, logotipos, etc.
└── README.md               # Este archivo
```

## Tecnologías Utilizadas

- **HTML5** - Estructura semántica
- **CSS3** - Flexbox, Grid, Variables CSS, Animaciones
- **JavaScript ES6+** - Programación modular, Estado reactivo
- **Web Audio API** - Efectos de sonido para juegos
- **Canvas API** - Visualizaciones personalizadas (opcional)
- **localStorage** - Persistencia del estado del usuario

## Cómo Ejecutar

1. Clona o descarga este repositorio
2. Abre `index.html` en tu navegador preferido (Chrome, Firefox, Safari, Edge)
3. ¡Disfruta jugando!

## Notas Importantes

- Esta es una aplicación de demostración con fondos virtuales
- No involucra dinero real ni apuestas reales
- Todos los resultados son simulados para fines de entretenimiento
- Diseñado únicamente para fines educativos y de demostración

## Futuras Mejoras

- Conexión WebSocket en tiempo real para cuotas en vivo
- Autenticación de usuario y perfiles personalizados
- Múltiples monedas virtuales
- Tablas de clasificación y logros
- Juegos de casino adicionales (poker, baccarat)
- Estadísticas y análisis deportivo
- Soporte multilingüe (español/inglés)

## Licencia

Este proyecto es para uso educativo y de demostración. 