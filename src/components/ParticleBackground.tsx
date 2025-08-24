// src/components/ParticleBackground.tsx
'use client'
import { useEffect } from 'react'
import Particles, { initParticlesEngine } from '@tsparticles/react'
import { loadSlim } from '@tsparticles/slim'
import { useReducedMotion } from 'framer-motion'

export default function ParticleBackground() {
  const reduce = useReducedMotion()

  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine)
    })
  }, [])

  return (
    <div className="pointer-events-none absolute inset-0 -z-10">
      <Particles
        id="tsparticles"
        options={{
          background: { color: { value: 'transparent' } },
          fullScreen: { enable: false },
          fpsLimit: 60,
          detectRetina: true,
          particles: {
            number: {
              value: reduce ? 25 : 70,
              density: {
                enable: true,
                // width: 1600, // optional
                // height: 900,  // optional
              },
            },
            color: { value: '#ffffff' },
            size: { value: { min: 1, max: 3 } },
            opacity: { value: 0.5 },
            move: {
              enable: !reduce,
              speed: reduce ? 0.2 : 1,
              direction: 'none',
              outModes: { default: 'out' },
            },
            links: {
              enable: true,
              opacity: 0.25,
              distance: 120,
              width: 1,
              color: '#ffffff',
            },
          },
          interactivity: {
            events: {
              onHover: { enable: !reduce, mode: 'repulse' },
              resize: { enable: true }, // ✅ must be object in v3+
            },
            modes: {
              repulse: { distance: 120 },
            },
          },
        }}
      />
    </div>
  )
}
