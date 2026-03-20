/**
 * RocketState — React + GSAP
 *
 * Props:
 *   state : 'low' | 'mid' | 'high'
 *   size  : number  (ancho base px, default 90)
 *
 * Instalación:
 *   npm install gsap
 *
 * Uso básico:
 *   import RocketState from './RocketState'
 *   <RocketState state="high" size={100} />
 *
 * Uso con barra de progreso:
 *   const getState = (pct) => pct < 40 ? 'low' : pct < 75 ? 'mid' : 'high'
 *   <RocketState state={getState(progress)} />
 */

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'

// ─── Partícula de humo animada con GSAP ───────────────────────────────────────
function SmokeParticle({ cx, cy, r, fill, delay }) {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const tl = gsap.timeline({ repeat: -1, delay })
    tl.set(el, { opacity: 0.7, x: 0, y: 0, scale: 1 })
      .to(el, {
        opacity : 0,
        x       : gsap.utils.random(-14, 14),
        y       : 40,
        scale   : 3.4,
        duration: 1.1,
        ease    : 'power1.out',
      })
    return () => tl.kill()
  }, [delay])

  return <ellipse ref={ref} cx={cx} cy={cy} rx={r} ry={r * 0.8} fill={fill} />
}

// ─── Chispa animada con GSAP ──────────────────────────────────────────────────
function Spark({ cx, cy, r, fill, delay, dx, dy }) {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const tl = gsap.timeline({ repeat: -1, delay })
    tl.set(el, { opacity: 1, x: 0, y: 0, scale: 1 })
      .to(el, {
        opacity : 0,
        x       : dx,
        y       : dy,
        scale   : 0.2,
        duration: 0.55,
        ease    : 'power2.out',
      })
    return () => tl.kill()
  }, [delay, dx, dy])

  return <circle ref={ref} cx={cx} cy={cy} r={r} fill={fill} />
}

// ─── Estrella que parpadea ────────────────────────────────────────────────────
function Star({ cx, cy, size, delay }) {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const tl = gsap.timeline({ repeat: -1, delay, repeatDelay: 1.4 })
    tl.set(el, { opacity: 0, scale: 0.4, transformOrigin: `${cx}px ${cy}px` })
      .to(el, { opacity: 1,   scale: 1.1, duration: 0.22, ease: 'power2.out'  })
      .to(el, { opacity: 0.85,scale: 1,   duration: 0.14                       })
      .to(el, { opacity: 0,   scale: 0.4, duration: 0.38, ease: 'power2.in'   })
    return () => tl.kill()
  }, [delay, cx, cy])

  // estrella de 8 puntas construida como polígono
  const pts = Array.from({ length: 8 }, (_, i) => {
    const angle = (i * Math.PI) / 4 - Math.PI / 2
    const r = i % 2 === 0 ? size : size * 0.45
    return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`
  }).join(' ')

  return <polygon ref={ref} points={pts} fill="#FCDE5A" opacity="0" />
}

// ─── Llama orgánica animada con GSAP ─────────────────────────────────────────
function Flame({ d, fill, opacity = 1, delay = 0 }) {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const tl = gsap.timeline({ repeat: -1, yoyo: true, delay })
    tl.to(el, {
      scaleX          : gsap.utils.random(0.87, 1.15),
      scaleY          : gsap.utils.random(0.87, 1.17),
      duration        : 0.15,
      ease            : 'sine.inOut',
      transformOrigin : '45px 168px',
      yoyo            : true,
      repeat          : -1,
    })
    return () => tl.kill()
  }, [delay])

  return <path ref={ref} d={d} fill={fill} opacity={opacity} />
}

// ─── Anillo de exhaust ────────────────────────────────────────────────────────
function ExhaustRing({ delay }) {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const tl = gsap.timeline({ repeat: -1, delay })
    tl.set(el, { scale: 1, opacity: 0.55, transformOrigin: '45px 170px' })
      .to(el, { scale: 3.6, opacity: 0, duration: 0.65, ease: 'power1.out' })
    return () => tl.kill()
  }, [delay])

  return (
    <ellipse
      ref={ref}
      cx="45" cy="170" rx="9" ry="5"
      fill="none" stroke="#FCDE5A" strokeWidth="2" opacity="0.55"
    />
  )
}

// ─── Componente principal ─────────────────────────────────────────────────────
export default function RocketState({ state = 'mid', size = 90 }) {
  const groupRef  = useRef(null)   // grupo del cuerpo del cohete
  const windowRef = useRef(null)   // portilla (glow)
  const bodyTw    = useRef(null)   // tween/timeline del body

  // ── Movimiento del cuerpo según estado ─────────────────────────────────────
  useEffect(() => {
    const el = groupRef.current
    if (!el) return
    bodyTw.current?.kill()
    gsap.set(el, { y: 0, rotation: 0, transformOrigin: '45px 95px' })

    if (state === 'low') {
      // Tambaleo irregular que refleja inestabilidad
      bodyTw.current = gsap.timeline({ repeat: -1 })
        .to(el, { rotation: -6, y:  0, duration: 0.22, ease: 'power1.inOut', transformOrigin: '45px 95px' })
        .to(el, { rotation:  4, y: -3, duration: 0.20, ease: 'power1.inOut' })
        .to(el, { rotation: -8, y:  2, duration: 0.28, ease: 'power1.inOut' })
        .to(el, { rotation:  3, y: -2, duration: 0.18, ease: 'power1.inOut' })
        .to(el, { rotation: -5, y:  1, duration: 0.24, ease: 'power1.inOut' })

    } else if (state === 'mid') {
      // Float con empuje moderado
      bodyTw.current = gsap.timeline({ repeat: -1 })
        .to(el, { y: -6, rotation:  1.2, duration: 1.8, ease: 'sine.inOut', transformOrigin: '45px 95px' })
        .to(el, { y:  2, rotation: -0.8, duration: 2.0, ease: 'sine.inOut' })

    } else {
      // Bob energético — propulsión al máximo
      bodyTw.current = gsap.timeline({ repeat: -1 })
        .to(el, { y: -5, rotation:  1,   duration: 0.7, ease: 'sine.inOut', transformOrigin: '45px 95px' })
        .to(el, { y:  3, rotation: -0.8, duration: 0.9, ease: 'sine.inOut' })
    }

    return () => bodyTw.current?.kill()
  }, [state])

  // ── Glow de la portilla ─────────────────────────────────────────────────────
  useEffect(() => {
    const el = windowRef.current
    if (!el) return
    gsap.killTweensOf(el)

    if (state === 'low') {
      // Rojo: parpadeo rápido de emergencia
      gsap.fromTo(el, { opacity: 0.25 }, { opacity: 0.9, duration: 0.6, yoyo: true, repeat: -1, ease: 'sine.inOut' })
    } else if (state === 'mid') {
      // Amarillo: pulso moderado, precaución
      gsap.fromTo(el, { opacity: 0.45 }, { opacity: 0.95, duration: 1.1, yoyo: true, repeat: -1, ease: 'sine.inOut' })
    } else {
      // Verde: brillo suave y estable
      gsap.fromTo(el, { opacity: 0.7 }, { opacity: 1, duration: 1.8, yoyo: true, repeat: -1, ease: 'sine.inOut' })
    }

    return () => gsap.killTweensOf(el)
  }, [state])

  const windowFill = state === 'low' ? '#CC1111' : state === 'mid' ? '#CC9900' : '#0E8C3A'

  return (
    <div style={{
      width: size * 2.35,
      height: size,
      position: 'relative',
      overflow: 'visible',
    }}>
    <svg
      width={size}
      height={size * 2.35}
      viewBox="0 0 90 210"
      style={{
        overflow: 'visible',
        transform: 'rotate(90deg)',
        transformOrigin: 'center center',
        position: 'absolute',
        top: '50%',
        left: '50%',
        marginTop: -(size * 2.35) / 2,
        marginLeft: -size / 2,
      }}
      aria-label={`Cohete estado ${state}`}
    >
      {/* ── LOW: humo denso ── */}
      {state === 'low' && (
        <g>
          {[
            { cx:45, cy:168, r:7,   fill:'#888780', delay:0    },
            { cx:45, cy:166, r:6,   fill:'#5F5E5A', delay:0.25 },
            { cx:38, cy:170, r:5,   fill:'#B4B2A9', delay:0.10 },
            { cx:52, cy:170, r:5,   fill:'#888780', delay:0.18 },
            { cx:42, cy:165, r:4,   fill:'#6e6d69', delay:0.38 },
            { cx:49, cy:165, r:4,   fill:'#B4B2A9', delay:0.50 },
            { cx:36, cy:168, r:3.5, fill:'#5F5E5A', delay:0.30 },
            { cx:54, cy:168, r:3,   fill:'#888780', delay:0.42 },
          ].map((p, i) => <SmokeParticle key={i} {...p} />)}
        </g>
      )}

      {/* ── MID: llama moderada + chispas leves ── */}
      {state === 'mid' && (
        <g>
          {/* llamas (más cortas que high) */}
          <Flame d="M33,168 Q31,180 33,191 Q39,200 45,202 Q51,200 57,191 Q59,180 57,168 Z" fill="#FCDE5A" delay={0}    />
          <Flame d="M36,168 Q34,177 37,186 Q41,194 45,196 Q49,194 53,186 Q56,177 54,168 Z" fill="#F2A623" delay={0.07} />
          <Flame d="M39,168 Q38,174 40,181 Q43,187 45,189 Q47,187 50,181 Q52,174 51,168 Z" fill="#fff"    opacity={0.75} delay={0.12} />

          {/* chispas leves */}
          {[
            { cx:40, cy:172, r:1.8, fill:'#FCDE5A', delay:0,    dx:-12, dy:18 },
            { cx:50, cy:172, r:1.6, fill:'#FCDE5A', delay:0.2,  dx: 10, dy:16 },
            { cx:37, cy:168, r:1.4, fill:'#F2A623', delay:0.1,  dx:-16, dy:10 },
            { cx:53, cy:168, r:1.3, fill:'#F2A623', delay:0.28, dx: 14, dy: 8 },
          ].map((s, i) => <Spark key={i} {...s} />)}
        </g>
      )}

      {/* ── HIGH: fuego, chispas, estrellas ── */}
      {state === 'high' && (
        <g>
          {/* estrellas */}
          <Star cx={12} cy={20}  size={5}   delay={0}    />
          <Star cx={76} cy={30}  size={4}   delay={0.8}  />
          <Star cx={10} cy={58}  size={3.5} delay={1.5}  />
          <Star cx={80} cy={62}  size={3.5} delay={0.4}  />
          <Star cx={22} cy={40}  size={3}   delay={0.6}  />
          <Star cx={68} cy={48}  size={3}   delay={1.1}  />
          <Star cx={5}  cy={80}  size={2.5} delay={0.2}  />
          <Star cx={85} cy={90}  size={2.5} delay={1.3}  />
          <Star cx={18} cy={105} size={3}   delay={0.9}  />
          <Star cx={72} cy={115} size={2.5} delay={0.5}  />
          <Star cx={8}  cy={130} size={2}   delay={1.7}  />
          <Star cx={82} cy={140} size={2}   delay={0.3}  />

          {/* llamas multicapa (de afuera hacia adentro) */}
          <Flame d="M26,168 Q23,190 26,208 Q35,222 45,225 Q55,222 64,208 Q67,190 64,168 Z" fill="#FCDE5A" opacity={0.6} delay={0.03} />
          <Flame d="M29,168 Q26,188 29,205 Q37,218 45,220 Q53,218 61,205 Q64,188 61,168 Z" fill="#FCDE5A" delay={0}    />
          <Flame d="M32,168 Q29,184 32,199 Q39,211 45,213 Q51,211 58,199 Q61,184 58,168 Z" fill="#F2A623" delay={0.08} />
          <Flame d="M36,168 Q34,178 37,191 Q41,201 45,203 Q49,201 53,191 Q56,178 54,168 Z" fill="#EF9F27" delay={0.05} />
          <Flame d="M39,168 Q38,176 41,186 Q43,193 45,195 Q47,193 49,186 Q52,176 51,168 Z" fill="#fff" opacity={0.85} delay={0.1} />

          {/* chispas */}
          {[
            { cx:38, cy:172, r:2.5, fill:'#FCDE5A', delay:0,    dx:-22, dy:28  },
            { cx:52, cy:172, r:2.3, fill:'#FCDE5A', delay:0.15, dx: 20, dy:26  },
            { cx:34, cy:168, r:2,   fill:'#F2A623', delay:0.08, dx:-28, dy:18  },
            { cx:56, cy:168, r:1.8, fill:'#F2A623', delay:0.22, dx: 26, dy:16  },
            { cx:42, cy:176, r:1.7, fill:'#fff',    delay:0.3,  dx:-12, dy:32  },
            { cx:48, cy:176, r:1.6, fill:'#fff',    delay:0.38, dx: 10, dy:30  },
            { cx:30, cy:165, r:1.5, fill:'#FCDE5A', delay:0.1,  dx:-34, dy:10  },
            { cx:60, cy:165, r:1.5, fill:'#FCDE5A', delay:0.25, dx: 32, dy:12  },
            { cx:36, cy:180, r:1.3, fill:'#F2A623', delay:0.18, dx:-18, dy:36  },
            { cx:54, cy:180, r:1.3, fill:'#F2A623', delay:0.42, dx: 16, dy:34  },
          ].map((s, i) => <Spark key={i} {...s} />)}
        </g>
      )}

      {/* ── Cuerpo del cohete ── */}
      <g ref={groupRef} style={{ transformOrigin: '45px 95px' }}>
        {/* nozzle */}
        <rect x="35" y="155" width="20" height="14" rx="2" fill="#2C2C2A" />
        <rect x="37" y="155" width="16" height="4"  rx="1" fill="#444441" />

        {/* body */}
        <rect x="20" y="52" width="50" height="104" rx="8" fill="#DCEEF8" />
        <rect x="20" y="52" width="14" height="104" rx="8" fill="#C5DFF0" opacity=".6" />
        <rect x="58" y="56" width="8"  height="96"  rx="4" fill="#fff"    opacity=".35" />
        <rect x="43" y="52" width="4"  height="104"        fill="#B4D0E5" opacity=".3" />

        {/* nose cone */}
        <path d="M45,10 C38,10 22,38 20,52 L70,52 C68,38 52,10 45,10 Z" fill="#C1362A" />
        <path d="M45,10 C40,10 26,36 23,50 L35,50 C34,38 40,18 45,10 Z" fill="#E24B4A" opacity=".5" />
        <ellipse cx="45" cy="12" rx="6" ry="4" fill="#E24B4A" />

        {/* nose band */}
        <rect x="20" y="50" width="50" height="8" rx="2" fill="#C1362A" />
        <rect x="20" y="50" width="50" height="4" rx="2" fill="#E24B4A" opacity=".5" />

        {/* porthole frame */}
        <circle cx="45" cy="90" r="20" fill="#fff" opacity=".9" />
        <circle cx="45" cy="90" r="19" fill="#C0DDF5" />
        {[[45,71],[45,109],[26,90],[64,90],[31,76],[59,76],[31,104],[59,104]].map(([x,y],i) => (
          <circle key={i} cx={x} cy={y} r={i < 4 ? 1.5 : 1.2} fill="#888780" />
        ))}

        {/* porthole glass con ref para glow */}
        <circle ref={windowRef} cx="45" cy="90" r="15" fill={windowFill} />
        <ellipse cx="40" cy="84" rx="5"   ry="3.5" fill={state === 'low' ? '#FF6666' : state === 'mid' ? '#FFE066' : '#4DCC7A'} opacity=".5"  transform="rotate(-30,40,84)" />
        <ellipse cx="50" cy="97" rx="3"   ry="2"   fill={state === 'low' ? '#880000' : state === 'mid' ? '#886600' : '#065C26'} opacity=".35" transform="rotate(-30,50,97)" />
        {state === 'high' && (
          <ellipse cx="39" cy="82" rx="3" ry="2"   fill="#fff"    opacity=".3"  transform="rotate(-35,39,82)" />
        )}

        {/* bottom band */}
        <rect x="20" y="148" width="50" height="8" rx="2" fill="#C1362A" />

        {/* fins */}
        <path d="M20,120 L2,155  L18,155 L20,140 Z" fill="#C1362A"  />
        <path d="M20,120 L4,154  L10,154 L20,132 Z" fill="#E24B4A" opacity=".45" />
        <path d="M70,120 L88,155 L72,155 L70,140 Z" fill="#C1362A"  />
        <path d="M70,120 L86,154 L80,154 L70,132 Z" fill="#E24B4A" opacity=".45" />
        <path d="M22,148 L8,162  L22,162 Z"          fill="#9e2a1f" />
        <path d="M68,148 L82,162 L68,162 Z"          fill="#9e2a1f" />
      </g>
    </svg>
    </div>
  )
}