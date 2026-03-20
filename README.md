# cohetes-app

Componente React de animaciones de cohetes con GSAP para visualizar el progreso de metas, diseñado para integrarse en dashboards dinámicos.

## Demo

Tres cohetes horizontales animados, cada uno representando un estado de progreso:

| Estado | Color ventana | Comportamiento |
|--------|--------------|----------------|
| `low`  | Rojo parpadeante (emergencia) | Tambaleo irregular, humo denso |
| `mid`  | Amarillo pulsante (precaución) | Float dinámico, llama moderada |
| `high` | Verde suave (nominal) | Bob energético, llamas intensas + estrellas |

## Stack

- **React 18+**
- **Vite**
- **GSAP** — animaciones del cohete (cuerpo, ventana, humo, llamas, chispas, estrellas)

## Instalación

```bash
npm install
npm run dev
```

## Uso del componente

```jsx
import RocketState from './src/RocketState'

// Uso directo por estado
<RocketState state="low"  size={100} />
<RocketState state="mid"  size={100} />
<RocketState state="high" size={100} />

// Uso dinámico desde porcentaje
const getState = (pct) => pct < 40 ? 'low' : pct < 75 ? 'mid' : 'high'
<RocketState state={getState(progress)} size={100} />
```

### Props

| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `state` | `'low' \| 'mid' \| 'high'` | `'mid'` | Estado del cohete |
| `size` | `number` | `90` | Ancho base en px. El alto se calcula automáticamente (× 2.35) |

El componente renderiza en horizontal (nariz apuntando a la derecha). El `size` corresponde al alto visual del cohete; el ancho total es `size * 2.35`.

## Estructura del proyecto

```
src/
├── App.jsx          ← demo con los tres estados
├── RocketState.jsx  ← componente principal
├── App.css
└── index.css
```

## Integración en Next.js con metas monetarias

Ver [`ROCKET_NEXTJS_INTEGRATION.md`](./ROCKET_NEXTJS_INTEGRATION.md) para la guía completa de integración con:

- Next.js 14 (App Router)
- Material UI v5
- API con metas monetarias (ej: `current: 18500.75, goal: 25000.50`)
- Recharts con cohete como marcador dinámico
- Polling automático y umbrales configurables por métrica
