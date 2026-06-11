import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface Props {
  direction: 'left' | 'right'
  scrollRef: React.RefObject<HTMLDivElement | null>
}

export default function ScrollArrow({ direction, scrollRef }: Props) {
  const [hovered, setHovered] = useState(false)
  const rafRef = useRef<number | null>(null)
  const speedRef = useRef(0)

  useEffect(() => {
    if (!hovered) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      speedRef.current = 0
      return
    }

    let startTime: number | null = null

    const tick = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      const elapsed = timestamp - startTime

      // 0 → max speed over 400ms (서서히 가속)
      const progress = Math.min(elapsed / 400, 1)
      const eased = progress * progress
      const speed = eased * 20

      if (scrollRef.current) {
        scrollRef.current.scrollLeft += direction === 'right' ? speed : -speed
      }

      rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [hovered, direction, scrollRef])

  const isRight = direction === 'right'

  return (
    <div
      className="absolute top-0 bottom-0 z-40 flex items-center justify-center pointer-events-auto"
      style={{
        [isRight ? 'right' : 'left']: 0,
        width: 64,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* gradient fade */}
      <div
        className="absolute inset-0"
        style={{
          background: isRight
            ? 'linear-gradient(to right, transparent, rgba(10,10,10,0.85))'
            : 'linear-gradient(to left, transparent, rgba(10,10,10,0.85))',
          pointerEvents: 'none',
        }}
      />

      {/* arrow */}
      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ opacity: 0, x: isRight ? 10 : -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: isRight ? 10 : -10 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div
              animate={{ x: isRight ? [0, 5, 0] : [0, -5, 0] }}
              transition={{ duration: 0.7, repeat: Infinity, ease: 'easeInOut' }}
              style={{
                color: '#f5c518',
                fontSize: 48,
                fontWeight: 900,
                lineHeight: 1,
                textShadow: '0 0 16px #f5c51899',
              }}
            >
              {isRight ? '›' : '‹'}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
