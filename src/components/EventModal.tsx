import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { differenceInDays, format, parseISO } from 'date-fns'
import type { EventEntry } from '../data/events'

const CATEGORY_LABEL: Record<string, string> = {
  headhunting: '헤드헌팅',
  arsenal: '신청',
  zone: '구역',
  event: '이벤트',
  content: '콘텐츠',
}

interface Props {
  event: EventEntry | null
  today: Date
  onClose: () => void
}

const DDAY_SHADOW = '0 1px 6px rgba(0,0,0,0.9)'

function DDay({ event, today }: { event: EventEntry; today: Date }) {
  const start = parseISO(event.startDate)
  const end = event.endDate ? parseISO(event.endDate) : null

  if (start > today) {
    const diff = differenceInDays(start, today)
    return <span style={{ color: '#f5c518', fontWeight: 700, textShadow: DDAY_SHADOW }}>D-{diff}</span>
  }
  if (end) {
    const diff = differenceInDays(end, today)
    if (diff < 0) return <span style={{ color: '#aaa', fontWeight: 700, textShadow: DDAY_SHADOW }}>종료</span>
    if (diff === 0) return <span style={{ color: '#ef4444', fontWeight: 700, textShadow: DDAY_SHADOW }}>D-DAY</span>
    return <span style={{ color: '#f87171', fontWeight: 700, textShadow: DDAY_SHADOW }}>D-{diff}</span>
  }
  return <span style={{ color: '#ccc', fontWeight: 700, textShadow: DDAY_SHADOW }}>상시</span>
}

export default function EventModal({ event, today, onClose }: Props) {
  useEffect(() => {
    if (!event) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [event, onClose])

  return createPortal(
    <AnimatePresence>
      {event && (
        <>
          {/* Overlay */}
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.7)',
              zIndex: 1000,
            }}
          />

          {/* Modal */}
          <div style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '90%',
            maxWidth: 480,
            zIndex: 1001,
          }}>
          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.94, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 12 }}
            transition={{ duration: 0.22, ease: [0.25, 0.46, 0.45, 0.94] }}
            style={{
              background: '#161616',
              border: '1px solid #2a2a2a',
              borderRadius: 12,
              overflow: 'hidden',
            }}
          >
            {/* Image / gradient header */}
            <div style={{ height: 220, position: 'relative', background: event.imageGradient, overflow: 'hidden' }}>
              {event.imageUrl && (
                <img
                  src={event.imageUrl}
                  alt={event.nameKo}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 40%' }}
                  onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
                />
              )}
              {/* bottom fade */}
              <div style={{
                position: 'absolute', bottom: 0, left: 0, right: 0, height: 100,
                background: 'linear-gradient(to bottom, transparent, rgba(0,0,0,0.85))',
              }} />
              {/* category + version + dday overlay — image 하단 */}
              <div style={{
                position: 'absolute', bottom: 14, left: 20, right: 20,
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                zIndex: 2,
              }}>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  <span style={{
                    fontSize: 10, fontWeight: 700, color: '#ffffffcc',
                    letterSpacing: '0.06em', textTransform: 'uppercase',
                    textShadow: '0 1px 6px rgba(0,0,0,0.9)',
                  }}>
                    {CATEGORY_LABEL[event.category]}
                  </span>
                  <span style={{ color: '#ffffff66', fontSize: 10, textShadow: '0 1px 6px rgba(0,0,0,0.9)' }}>·</span>
                  <span style={{ fontSize: 10, fontWeight: 700, color: '#f5c518cc', textShadow: '0 1px 6px rgba(0,0,0,0.9)' }}>
                    v{event.version}
                  </span>
                </div>
                <DDay event={event} today={today} />
              </div>
              {/* close button */}
              <button
                onClick={onClose}
                style={{
                  position: 'absolute', top: 12, right: 12,
                  background: 'rgba(0,0,0,0.55)', border: '1px solid #444',
                  borderRadius: 6, color: '#aaa', fontSize: 16,
                  width: 32, height: 32, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                ✕
              </button>
            </div>

            {/* Content */}
            <div style={{ padding: '20px 24px 28px' }}>
              {/* Event name */}
              <div style={{ fontSize: 22, fontWeight: 900, color: '#f0f0f0', lineHeight: 1.3, marginBottom: 4 }}>
                {event.nameKo}
              </div>
              <div style={{ fontSize: 12, color: '#555', marginBottom: 16 }}>
                {event.nameEn}
              </div>

              {/* Tag */}
              <div style={{
                display: 'inline-block', fontSize: 11, fontWeight: 600,
                padding: '3px 10px', borderRadius: 4,
                background: '#2a2a2a', color: '#aaa', border: '1px solid #333',
                marginBottom: 16,
              }}>
                {event.tag}
              </div>

              {/* Date */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '12px 14px', background: '#1a1a1a',
                borderRadius: 8, border: '1px solid #222', marginBottom: event.subEvents ? 16 : 0,
              }}>
                <span style={{ color: '#f5c518', fontSize: 13 }}>📅</span>
                <span style={{ fontSize: 13, color: '#ccc' }}>
                  {format(parseISO(event.startDate), 'yyyy.MM.dd')}
                  {event.endDate
                    ? ` ~ ${format(parseISO(event.endDate), 'yyyy.MM.dd')}`
                    : ' ~ 상시'}
                </span>
              </div>

              {/* Sub-events */}
              {event.subEvents && event.subEvents.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <div style={{ fontSize: 11, color: '#555', fontWeight: 700, letterSpacing: '0.06em', marginBottom: 2 }}>
                    포함 이벤트
                  </div>
                  {event.subEvents.map((sub, i) => (
                    <div
                      key={i}
                      style={{
                        padding: '8px 12px', background: '#1a1a1a',
                        borderRadius: 6, border: '1px solid #222',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      }}
                    >
                      <span style={{ fontSize: 12, color: '#ccc' }}>{sub.nameKo}</span>
                      <span style={{ fontSize: 10, color: '#555' }}>
                        {format(parseISO(sub.startDate), 'MM.dd')}
                        {sub.endDate ? ` ~ ${format(parseISO(sub.endDate), 'MM.dd')}` : ' ~'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>,
    document.body
  )
}
