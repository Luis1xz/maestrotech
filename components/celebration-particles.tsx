'use client'

import { useEffect } from 'react'
import { motion } from 'framer-motion'

interface Particle {
  id: number
  x: number
  y: number
  color: string
  size: number
  rotation: number
  delay: number
}

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b', '#06b6d4', '#6366f1']

interface CelebrationParticlesProps {
  count?: number
  trigger?: boolean
  onComplete?: () => void
}

export default function CelebrationParticles({
  count = 28,
  trigger = true,
  onComplete,
}: CelebrationParticlesProps) {
  useEffect(() => {
    if (!trigger || !onComplete) return
    const timer = setTimeout(() => {
      onComplete()
    }, 1500)
    return () => clearTimeout(timer)
  }, [trigger, onComplete])

  if (!trigger) return null

  const particles: Particle[] = Array.from({ length: count }, (_, i) => ({
    id: i,
    x: (Math.random() - 0.5) * 360,
    y: (Math.random() - 0.5) * 320 - 40,
    color: COLORS[i % COLORS.length],
    size: Math.random() * 8 + 6,
    rotation: Math.random() * 360,
    delay: Math.random() * 0.2,
  }))

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-30 flex items-center justify-center">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          initial={{ opacity: 1, scale: 0, x: 0, y: 0, rotate: 0 }}
          animate={{
            opacity: [1, 1, 0],
            scale: [0, 1.2, 0.8],
            x: p.x,
            y: p.y,
            rotate: p.rotation,
          }}
          transition={{
            duration: 1.4,
            delay: p.delay,
            ease: [0.22, 1, 0.36, 1],
          }}
          style={{
            backgroundColor: p.color,
            width: p.size,
            height: p.size,
            borderRadius: p.id % 3 === 0 ? '50%' : p.id % 3 === 1 ? '2px' : '6px',
          }}
          className="absolute shadow-sm"
        />
      ))}
    </div>
  )
}
