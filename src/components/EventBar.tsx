import { motion } from 'framer-motion'
import { differenceInDays, format, parseISO } from 'date-fns'
import type { EventEntry } from '../data/events'

interface Props {
  event: EventEntry
  calendarStart: Date
  calendarEnd: Date
  dayWidth: number
  rowIndex: number
  onClick: (event: EventEntry) => void
}

export default function EventBar({ event, calendarStart, calendarEnd, dayWidth, onClick }: Props) {
  const start = parseISO(event.startDate)
  const end = event.endDate ? parseISO(event.endDate) : calendarEnd

  const offsetDays = differenceInDays(start, calendarStart)
  const durationDays = differenceInDays(end, start) + 1

  const left = offsetDays * dayWidth
  const width = durationDays * dayWidth

  const startLabel = format(start, 'MM.dd')

  // 뱃지 너비 약 36px, 그 이후에 텍스트 표시
  const BADGE_W = 56
  const textAreaWidth = width - BADGE_W - 12
  const showName = textAreaWidth > 30
  const showTag = textAreaWidth > 70

  const showImage = !!event.imageUrl && width > 150

  return (
    <motion.div
      className="absolute top-0 h-full rounded overflow-hidden select-none"
      style={{ left, width, background: event.imageGradient, cursor: 'pointer' }}
      onClick={() => onClick(event)}
      initial={{ scaleX: 0, originX: 0 }}
      animate={{ scaleX: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* banner image — fades in from right */}
      {showImage && (
        <img
          src={event.imageUrl}
          alt=""
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            height: '100%',
            width: '60%',
            objectFit: 'cover',
            objectPosition: 'center 40%',
            maskImage: 'linear-gradient(to right, transparent 0%, black 45%)',
            WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 45%)',
            pointerEvents: 'none',
          }}
          onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
        />
      )}

      {/* diagonal hatch overlay */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none opacity-5"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern id={`hatch-${event.id}`} width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <line x1="0" y1="0" x2="0" y2="8" stroke="white" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#hatch-${event.id})`} />
      </svg>

      {/* start date badge — top-left, vertically centered */}
      <div
        className="absolute left-1 top-1/2 -translate-y-1/2 z-10 flex items-center gap-0.5 rounded px-1 flex-shrink-0"
        style={{
          background: 'rgba(0,0,0,0.55)',
          border: '1px solid rgba(255,80,80,0.5)',
          fontSize: 11,
          fontWeight: 700,
          lineHeight: 1.4,
          whiteSpace: 'nowrap',
          color: '#fff',
        }}
      >
        <span style={{ color: '#ff6b6b' }}>●</span> {startLabel}
      </div>

      {/* text content — positioned after badge */}
      {showName && (
        <div
          className="absolute top-0 bottom-0 flex flex-col justify-center gap-0.5"
          style={{ left: BADGE_W + 8, right: 6, overflow: 'hidden' }}
        >
          <span
            className="text-white font-bold leading-tight"
            style={{
              fontSize: 14,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {event.nameKo}
          </span>
          {showTag && (
            <span
              className="font-semibold"
              style={{
                fontSize: 11,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                color: 'rgba(255,255,255,0.6)',
              }}
            >
              {event.tag}
            </span>
          )}
        </div>
      )}

      {/* permanent indicator */}
      {!event.endDate && (
        <div
          className="absolute top-0 right-0 h-full w-8 pointer-events-none"
          style={{ background: 'linear-gradient(to right, transparent, rgba(0,0,0,0.35))' }}
        />
      )}
    </motion.div>
  )
}
