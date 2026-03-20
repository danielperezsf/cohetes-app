# Integración de RocketState en Next.js con MUI y gráficos dinámicos

## Stack objetivo

- **Next.js** 14+ (App Router)
- **Material UI** v5+
- **GSAP** (animaciones del cohete)
- **Recharts** (gráfica horizontal dinámica)
- **API REST** con metas monetarias

---

## 1. Instalación de dependencias

```bash
npm install gsap @mui/material @mui/system @emotion/react @emotion/styled recharts
```

---

## 2. Copiar el componente

Copiar `RocketState.jsx` a tu proyecto:

```
src/
└── components/
    └── rocket/
        └── RocketState.jsx
```

Agregar al inicio del archivo (obligatorio en Next.js App Router):

```js
'use client'
```

---

## 3. Formato de la API

La API devuelve metas monetarias con valor actual y objetivo. El valor puede ser decimal.

```json
[
  {
    "id": "team-alpha",
    "label": "Equipo Alpha",
    "current": 18500.75,
    "goal":    25000.50,
    "currency": "USD"
  },
  {
    "id": "team-beta",
    "label": "Equipo Beta",
    "current": 9200.00,
    "goal":    25000.50,
    "currency": "USD"
  },
  {
    "id": "team-gamma",
    "label": "Equipo Gamma",
    "current": 24100.30,
    "goal":    25000.50,
    "currency": "USD"
  }
]
```

---

## 4. Utilidades: progreso y estado del cohete

```js
// utils/rocketState.js

/**
 * Convierte valor actual vs meta a porcentaje 0-100.
 * Acepta decimales en ambos parámetros.
 */
export function toPercent(current, goal) {
  if (!goal || goal <= 0) return 0
  return Math.min(100, (current / goal) * 100)
}

/**
 * Mapea porcentaje al estado del cohete.
 * Umbrales ajustables por contexto de negocio.
 */
export function getRocketState(pct, thresholds = { low: 40, mid: 75 }) {
  if (pct < thresholds.low) return 'low'
  if (pct < thresholds.mid) return 'mid'
  return 'high'
}

/**
 * Formatea un número como moneda.
 * Soporta decimales (ej: 25000.50 → "$25,000.50")
 */
export function formatCurrency(value, currency = 'USD', locale = 'en-US') {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}
```

---

## 5. Hook para consumir la API

```js
// hooks/useProgressData.js
'use client'
import { useEffect, useState } from 'react'

export function useProgressData(endpoint, intervalMs = 5000) {
  const [data, setData]       = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  useEffect(() => {
    async function fetchData() {
      try {
        const res  = await fetch(endpoint)
        const json = await res.json()
        setData(json)
        setError(null)
      } catch (e) {
        setError(e.message)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
    const id = setInterval(fetchData, intervalMs)
    return () => clearInterval(id)
  }, [endpoint, intervalMs])

  return { data, loading, error }
}
```

---

## 6. Barra de progreso monetaria con cohete

El cohete se posiciona sobre la barra en el punto exacto del porcentaje alcanzado.

```jsx
// components/rocket/RocketProgressBar.jsx
'use client'
import { Box, Typography, LinearProgress } from '@mui/material'
import RocketState from './RocketState'
import { toPercent, getRocketState, formatCurrency } from '@/utils/rocketState'

export default function RocketProgressBar({ label, current, goal, currency = 'USD' }) {
  const pct    = toPercent(current, goal)
  const state  = getRocketState(pct)
  const rocketSize = 48

  const barColor =
    state === 'low'  ? 'error.main'   :
    state === 'mid'  ? 'warning.main' :
                       'success.main'

  return (
    <Box sx={{ mb: 5 }}>

      {/* Encabezado */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
        <Typography variant="body2" sx={{ fontWeight: 500 }}>
          {label}
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          {formatCurrency(current, currency)}
          <Typography component="span" variant="caption" sx={{ mx: 0.5, opacity: 0.5 }}>
            /
          </Typography>
          {formatCurrency(goal, currency)}
        </Typography>
      </Box>

      {/* Barra + cohete */}
      <Box sx={{ position: 'relative', pt: `${rocketSize / 2 + 4}px` }}>

        {/* Cohete animado sobre la barra */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: `calc(${pct}% - ${(rocketSize * 2.35) / 2}px)`,
            transition: 'left 1s cubic-bezier(0.4, 0, 0.2, 1)',
            // Clamp para que no se salga de los bordes
            maxLeft: `calc(100% - ${rocketSize * 2.35}px)`,
          }}
        >
          <RocketState state={state} size={rocketSize} />
        </Box>

        {/* Barra MUI */}
        <LinearProgress
          variant="determinate"
          value={pct}
          sx={{
            height: 12,
            borderRadius: 6,
            backgroundColor: 'grey.800',
            '& .MuiLinearProgress-bar': {
              borderRadius: 6,
              bgcolor: barColor,
              transition: 'transform 1s cubic-bezier(0.4, 0, 0.2, 1)',
            },
          }}
        />

        {/* Porcentaje */}
        <Typography
          variant="caption"
          sx={{ position: 'absolute', right: 0, top: 0, color: 'text.secondary' }}
        >
          {pct.toFixed(1)}%
        </Typography>
      </Box>
    </Box>
  )
}
```

---

## 7. Dashboard completo

```jsx
// components/rocket/RocketDashboard.jsx
'use client'
import { Box, Typography, CircularProgress, Paper, Alert } from '@mui/material'
import RocketProgressBar from './RocketProgressBar'
import { useProgressData } from '@/hooks/useProgressData'

export default function RocketDashboard({ apiEndpoint }) {
  const { data, loading, error } = useProgressData(apiEndpoint, 6000)

  if (loading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
      <CircularProgress />
    </Box>
  )

  if (error) return <Alert severity="error">Error al cargar datos: {error}</Alert>

  return (
    <Paper elevation={3} sx={{ p: 4, background: '#111', borderRadius: 3, minWidth: 520 }}>
      <Typography variant="h6" sx={{ mb: 3 }}>
        Progreso de metas
      </Typography>

      {data.map((item) => (
        <RocketProgressBar
          key={item.id}
          label={item.label}
          current={item.current}
          goal={item.goal}
          currency={item.currency ?? 'USD'}
        />
      ))}
    </Paper>
  )
}
```

**Uso en una página:**

```jsx
// app/dashboard/page.jsx
import RocketDashboard from '@/components/rocket/RocketDashboard'

export default function DashboardPage() {
  return (
    <main>
      <RocketDashboard apiEndpoint="https://tu-api.com/sales/progress" />
    </main>
  )
}
```

---

## 8. Integración con Recharts (barras horizontales)

Si se prefiere una gráfica Recharts con el cohete como marcador al final de cada barra:

```jsx
// components/rocket/RocketBarChart.jsx
'use client'
import { BarChart, Bar, XAxis, YAxis, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { Box } from '@mui/material'
import RocketState from './RocketState'
import { toPercent, getRocketState, formatCurrency } from '@/utils/rocketState'

// Marcador personalizado: cohete al final de la barra
function RocketLabel({ x, y, width, height, value, goal }) {
  const pct   = toPercent(value, goal)
  const state = getRocketState(pct)
  const size  = 32
  return (
    <foreignObject
      x={x + width - (size * 2.35) / 2}
      y={y + height / 2 - size / 2}
      width={size * 2.35}
      height={size}
      style={{ overflow: 'visible' }}
    >
      <RocketState state={state} size={size} />
    </foreignObject>
  )
}

// Tooltip con formato monetario
function MoneyTooltip({ active, payload, goal, currency }) {
  if (!active || !payload?.length) return null
  const { name, value } = payload[0]
  const pct = toPercent(value, goal)
  return (
    <Box sx={{ bgcolor: '#1e1e1e', p: 1.5, borderRadius: 1, fontSize: 12 }}>
      <div><b>{name}</b></div>
      <div>{formatCurrency(value, currency)} / {formatCurrency(goal, currency)}</div>
      <div>{pct.toFixed(1)}% de la meta</div>
    </Box>
  )
}

const STATE_COLORS = { low: '#CC1111', mid: '#CC9900', high: '#0E8C3A' }

export default function RocketBarChart({ data, currency = 'USD' }) {
  // data: [{ name: string, current: number, goal: number }]
  // Normalizar a porcentaje para la escala de la barra
  const chartData = data.map((d) => ({
    name:    d.label,
    value:   toPercent(d.current, d.goal),
    current: d.current,
    goal:    d.goal,
  }))

  return (
    <Box sx={{ width: '100%', height: data.length * 80 + 40 }}>
      <ResponsiveContainer>
        <BarChart data={chartData} layout="vertical" margin={{ right: 90, left: 16 }}>
          <XAxis type="number" domain={[0, 100]} unit="%" tick={{ fontSize: 11 }} />
          <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 12 }} />
          <Tooltip content={<MoneyTooltip goal={data[0]?.goal} currency={currency} />} />
          <Bar
            dataKey="value"
            radius={[0, 6, 6, 0]}
            label={(props) => (
              <RocketLabel {...props} goal={data[props.index]?.goal} />
            )}
          >
            {chartData.map((entry, i) => (
              <Cell
                key={i}
                fill={STATE_COLORS[getRocketState(entry.value)]}
                fillOpacity={0.75}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Box>
  )
}
```

---

## 9. Theming MUI (colores semáforo alineados al cohete)

```js
// theme/theme.js
import { createTheme } from '@mui/material/styles'

export const theme = createTheme({
  palette: {
    mode: 'dark',
    background: { default: '#0d0d0d', paper: '#111' },
    error:   { main: '#CC1111' },  // low  — rojo
    warning: { main: '#CC9900' },  // mid  — amarillo
    success: { main: '#0E8C3A' },  // high — verde
  },
})
```

```jsx
// app/layout.jsx
import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { theme } from '@/theme/theme'

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
```

---

## 10. Umbrales configurables por equipo o métrica

Si distintas metas tienen umbrales diferentes (ej: ventas vs cobranza):

```json
{
  "id": "team-alpha",
  "label": "Ventas",
  "current": 18500.75,
  "goal": 25000.50,
  "currency": "USD",
  "thresholds": { "low": 50, "mid": 80 }
}
```

```jsx
<RocketProgressBar
  label={item.label}
  current={item.current}
  goal={item.goal}
  currency={item.currency}
  thresholds={item.thresholds}  // opcional, usa defaults si no viene
/>
```

Y en `RocketProgressBar` pasarlo a `getRocketState`:

```js
const state = getRocketState(pct, thresholds)
```

---

## 11. Estructura de archivos recomendada

```
src/
├── app/
│   ├── layout.jsx
│   └── dashboard/
│       └── page.jsx
├── components/
│   └── rocket/
│       ├── RocketState.jsx           ← componente de animación (añadir 'use client')
│       ├── RocketProgressBar.jsx     ← barra MUI + cohete
│       ├── RocketBarChart.jsx        ← gráfica Recharts
│       └── RocketDashboard.jsx       ← dashboard completo
├── hooks/
│   └── useProgressData.js            ← polling a la API
├── utils/
│   └── rocketState.js                ← toPercent · getRocketState · formatCurrency
└── theme/
    └── theme.js                      ← tema MUI oscuro con colores semáforo
```

---

## Notas clave

| Tema | Detalle |
|------|---------|
| `'use client'` | Obligatorio en `RocketState.jsx` — GSAP usa APIs del browser (`useEffect`, DOM) |
| Decimales | `toPercent` usa división flotante; `formatCurrency` usa `Intl.NumberFormat` para evitar errores de redondeo en display |
| Transición suave | `left` y `transform` del cohete/barra usan `1s cubic-bezier(0.4,0,0.2,1)` — sincronizados con el intervalo de polling |
| `foreignObject` | Permite embeber el componente React dentro del SVG de Recharts; requiere que sea Client Component |
| Polling vs WebSocket | Reemplazar `setInterval` por un listener SSE/WS si la API lo soporta para actualizaciones en tiempo real |
| Colores | `error/warning/success` del tema MUI coinciden exactamente con los fills de las ventanas del cohete |
