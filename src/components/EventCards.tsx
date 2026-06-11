import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { differenceInDays, format, parseISO } from 'date-fns'
import { allEvents } from '../data/events'
import type { EventEntry } from '../data/events'


const CATEGORY_LABEL: Record<string, string> = {
  headhunting: '헤드헌팅',
  arsenal: '신청',
  zone: '구역',
  event: '이벤트',
  content: '콘텐츠',
}

type Tab = 'active' | 'upcoming' | 'ended'

function classifyEvents(events: EventEntry[], today: Date) {
  const active: EventEntry[] = []
  const upcoming: EventEntry[] = []
  const ended: EventEntry[] = []

  for (const e of events) {
    const start = parseISO(e.startDate)
    const end = e.endDate ? parseISO(e.endDate) : null

    if (start > today) {
      upcoming.push(e)
    } else if (end && end < today) {
      ended.push(e)
    } else {
      active.push(e)
    }
  }

  return { active, upcoming, ended }
}

function DDay({ event, today }: { event: EventEntry; today: Date }) {
  const start = parseISO(event.startDate)
  const end = event.endDate ? parseISO(event.endDate) : null

  if (start > today) {
    const diff = differenceInDays(start, today)
    return (
      <span style={{ color: '#f5c518', fontSize: 11, fontWeight: 700 }}>
        D-{diff}
      </span>
    )
  }
  if (end) {
    const diff = differenceInDays(end, today)
    if (diff === 0) return <span style={{ color: '#ef4444', fontSize: 11, fontWeight: 700 }}>D-DAY</span>
    return <span style={{ color: '#f87171', fontSize: 11, fontWeight: 700 }}>D-{diff}</span>
  }
  return <span style={{ color: '#6b7280', fontSize: 11, fontWeight: 700 }}>상시</span>
}

function EventCard({ event, today, onClick }: { event: EventEntry; today: Date; onClick: (e: EventEntry) => void }) {
  const start = parseISO(event.startDate)
  const end = event.endDate ? parseISO(event.endDate) : null
  const isActive = start <= today && (!end || end >= today)

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={{ duration: 0.25 }}
      onClick={() => onClick(event)}
      style={{
        background: '#161616',
        border: `1px solid ${isActive ? '#f5c51830' : '#222'}`,
        borderRadius: 8,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        cursor: 'pointer',
      }}
    >
      {/* thumbnail image or gradient fallback */}
      <div style={{ height: 180, position: 'relative', overflow: 'hidden', background: event.imageGradient }}>
        {event.imageUrl && (
          <img
            src={event.imageUrl}
            alt={event.nameKo}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'center top',
              display: 'block',
            }}
            onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
          />
        )}
        {/* category color bottom bar */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, background: event.imageGradient }} />
      </div>

      <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
        {/* top row: category + dday */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{
            fontSize: 10,
            fontWeight: 700,
            color: '#888',
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
          }}>
            {CATEGORY_LABEL[event.category]}
          </span>
          <DDay event={event} today={today} />
        </div>

        {/* event name */}
        <div style={{ fontSize: 16, fontWeight: 700, color: '#e8e8e8', lineHeight: 1.4 }}>
          {event.nameKo}
        </div>

        {/* tag badge */}
        <div style={{
          display: 'inline-block',
          alignSelf: 'flex-start',
          fontSize: 11,
          fontWeight: 600,
          padding: '3px 8px',
          borderRadius: 3,
          background: '#2a2a2a',
          color: '#aaa',
          border: '1px solid #333',
        }}>
          {event.tag}
        </div>

        {/* dates */}
        <div style={{ fontSize: 12, color: '#666', marginTop: 'auto' }}>
          {format(start, 'MM.dd')}
          {end ? ` ~ ${format(end, 'MM.dd')}` : ' ~'}
        </div>
      </div>
    </motion.div>
  )
}

const TAB_LABELS: { key: Tab; label: string }[] = [
  { key: 'active', label: '진행중' },
  { key: 'upcoming', label: '예정' },
  { key: 'ended', label: '종료' },
]

interface Props {
  today: Date
  version: string
  onEventClick: (event: EventEntry) => void
}

export default function EventCards({ today, version, onEventClick }: Props) {
  const [tab, setTab] = useState<Tab>('active')
  const versionEvents = allEvents.filter(e => e.version === version)
  const { active, upcoming, ended } = classifyEvents(versionEvents, today)

  const counts = { active: active.length, upcoming: upcoming.length, ended: ended.length }
  const current = tab === 'active' ? active : tab === 'upcoming' ? upcoming : ended

  return (
    <div style={{ padding: '28px 0 40px', borderTop: '1px solid #222' }}>
      {/* Tab bar */}
      <div style={{ display: 'flex', gap: 0, marginBottom: 20, borderBottom: '1px solid #222' }}>
        {TAB_LABELS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            style={{
              background: 'none',
              border: 'none',
              borderBottom: tab === key ? '2px solid #f5c518' : '2px solid transparent',
              color: tab === key ? '#f5c518' : '#666',
              fontFamily: 'inherit',
              fontSize: 13,
              fontWeight: 700,
              padding: '8px 20px',
              cursor: 'pointer',
              marginBottom: -1,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              transition: 'color 0.15s',
            }}
          >
            {label}
            <span style={{
              fontSize: 10,
              background: tab === key ? '#f5c51820' : '#222',
              color: tab === key ? '#f5c518' : '#555',
              padding: '1px 6px',
              borderRadius: 10,
              fontWeight: 700,
            }}>
              {counts[key]}
            </span>
          </button>
        ))}
      </div>

      {/* Card grid */}
      <motion.div layout className="event-cards-grid">
        <AnimatePresence mode="popLayout">
          {current.map(event => (
            <EventCard key={event.id} event={event} today={today} onClick={onEventClick} />
          ))}
        </AnimatePresence>
      </motion.div>

      {current.length === 0 && (
        <div style={{ textAlign: 'center', color: '#444', fontSize: 13, padding: '40px 0' }}>
          해당 이벤트가 없습니다
        </div>
      )}
    </div>
  )
}
