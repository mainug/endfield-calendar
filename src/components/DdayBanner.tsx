import { differenceInDays, format, parseISO } from 'date-fns'
import { allEvents } from '../data/events'
import type { EventEntry } from '../data/events'

interface Props {
  today: Date
  onEventClick: (event: EventEntry) => void
}

const CATEGORY_LABEL: Record<string, string> = {
  headhunting: '헤드헌팅',
  arsenal: '신청',
  zone: '구역',
  event: '이벤트',
  content: '콘텐츠',
}

const THRESHOLD = 3

function getBannerEvents(today: Date) {
  const items: { event: EventEntry; type: 'ending' | 'starting'; diff: number }[] = []

  for (const e of allEvents) {
    const start = parseISO(e.startDate)
    const end = e.endDate ? parseISO(e.endDate) : null

    // 종료 임박
    if (end) {
      const diff = differenceInDays(end, today)
      if (diff >= 0 && diff <= THRESHOLD) {
        items.push({ event: e, type: 'ending', diff })
      }
    }

    // 시작 임박 (아직 시작 안 한 것만)
    const startDiff = differenceInDays(start, today)
    if (startDiff > 0 && startDiff <= THRESHOLD) {
      items.push({ event: e, type: 'starting', diff: startDiff })
    }
  }

  // 종료 임박 먼저, 그 다음 시작 임박 / 각각 diff 오름차순
  items.sort((a, b) => {
    if (a.type !== b.type) return a.type === 'ending' ? -1 : 1
    return a.diff - b.diff
  })

  return items
}

export default function DdayBanner({ today, onEventClick }: Props) {
  const items = getBannerEvents(today)
  if (items.length === 0) return null

  return (
    <div style={{
      background: '#0d0d0d',
      borderBottom: '1px solid #2a2a2a',
      padding: '8px 16px',
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      overflowX: 'auto',
      scrollbarWidth: 'none',
    }}>
      {/* 라벨 */}
      <span style={{
        fontSize: 9, fontWeight: 700, color: '#f5c518',
        letterSpacing: '0.1em', whiteSpace: 'nowrap', flexShrink: 0,
      }}>
        D-DAY
      </span>
      <div style={{ width: 1, height: 14, background: '#333', flexShrink: 0 }} />

      {/* pills */}
      {items.map(({ event, type, diff }) => {
        const isEnding = type === 'ending'
        const accentColor = diff === 0
          ? '#ef4444'
          : isEnding
            ? '#f87171'
            : '#f5c518'
        const bgColor = diff === 0
          ? 'rgba(239,68,68,0.12)'
          : isEnding
            ? 'rgba(248,113,113,0.08)'
            : 'rgba(245,197,24,0.08)'

        const label = diff === 0 ? 'D-DAY' : `D-${diff}`
        const dateStr = isEnding && event.endDate
          ? format(parseISO(event.endDate), 'MM.dd')
          : format(parseISO(event.startDate), 'MM.dd')

        return (
          <button
            key={`${event.id}-${type}`}
            onClick={() => onEventClick(event)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: bgColor,
              border: `1px solid ${accentColor}44`,
              borderRadius: 6, padding: '4px 10px',
              cursor: 'pointer', flexShrink: 0,
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = `${accentColor}22`)}
            onMouseLeave={e => (e.currentTarget.style.background = bgColor)}
          >
            <span style={{ fontSize: 10, fontWeight: 700, color: accentColor }}>
              {label}
            </span>
            <span style={{ fontSize: 10, color: '#888' }}>
              {isEnding ? '종료' : '시작'} {dateStr}
            </span>
            <span style={{ fontSize: 11, fontWeight: 600, color: '#ccc', maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {event.nameKo}
            </span>
            <span style={{ fontSize: 9, color: '#555' }}>
              {CATEGORY_LABEL[event.category]}
            </span>
          </button>
        )
      })}
    </div>
  )
}
