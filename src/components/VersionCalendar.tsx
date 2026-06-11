import { useEffect, useMemo, useRef, useState, useCallback } from 'react'
import { addDays, differenceInDays, parseISO, startOfDay, subDays } from 'date-fns'
import { motion } from 'framer-motion'
import { allEvents, versions } from '../data/events'
import type { EventCategory, EventEntry } from '../data/events'
import TimeRuler from './TimeRuler'
import CategoryPanel from './CategoryPanel'
import EventBar from './EventBar'
import TodayLine from './TodayLine'
import ScrollArrow from './ScrollArrow'
import { useWindowWidth } from '../hooks/useWindowWidth'
import EventCards from './EventCards'
import VersionTabs from './VersionTabs'
import EventModal from './EventModal'
import DdayBanner from './DdayBanner'

const ROW_HEIGHT_DESKTOP = 80
const ROW_HEIGHT_MID = 65
const ROW_HEIGHT_MOBILE = 37
const ROW_GAP_DESKTOP = 5
const ROW_GAP_MID = 4
const ROW_GAP_MOBILE = 4
const PANEL_WIDTH = 220
const PANEL_WIDTH_MID = 180
const PANEL_WIDTH_MOBILE = 52

type CategoryConfig = {
  category: EventCategory
  label: string
  part: string
}

const CATEGORY_CONFIGS: CategoryConfig[] = [
  { category: 'headhunting', label: '헤드\n헌팅', part: 'PART.01' },
  { category: 'arsenal', label: '신청', part: 'PART.02' },
  { category: 'zone', label: '구역', part: 'PART.03' },
  { category: 'event', label: '이벤트', part: 'PART.04' },
  { category: 'content', label: '콘텐츠', part: 'PART.05' },
]

function groupEventsByCategory(events: EventEntry[]) {
  const grouped: Record<EventCategory, EventEntry[]> = {
    headhunting: [],
    arsenal: [],
    zone: [],
    event: [],
    content: [],
  }
  for (const e of events) {
    grouped[e.category].push(e)
  }
  return grouped
}

export default function VersionCalendar() {
  const today = startOfDay(new Date())
  const windowWidth = useWindowWidth()
  const isMobile = windowWidth <= 768
  const isMid = windowWidth > 768 && windowWidth <= 1200
  const DAY_WIDTH = isMobile ? 16 : isMid ? 35 : 50
  const ROW_HEIGHT = isMobile ? ROW_HEIGHT_MOBILE : isMid ? ROW_HEIGHT_MID : ROW_HEIGHT_DESKTOP
  const ROW_GAP = isMobile ? ROW_GAP_MOBILE : isMid ? ROW_GAP_MID : ROW_GAP_DESKTOP
  const scrollRef = useRef<HTMLDivElement>(null)
  const [selectedVersion, setSelectedVersion] = useState(() => {
    const current = versions.find(v =>
      parseISO(v.startDate) <= today && today <= parseISO(v.endDate)
    )
    if (current) return current.version
    const upcoming = versions.find(v => parseISO(v.startDate) > today)
    if (upcoming) return upcoming.version
    return versions[versions.length - 1].version
  })
  const [selectedEvent, setSelectedEvent] = useState<EventEntry | null>(null)
  const handleEventClick = useCallback((event: EventEntry) => setSelectedEvent(event), [])
  const handleModalClose = useCallback(() => setSelectedEvent(null), [])

  const drag = useRef({
    active: false, startX: 0, scrollLeft: 0, moved: false,
    lastX: 0, lastTime: 0, velocity: 0, rafId: 0,
  })

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    const el = scrollRef.current
    if (!el) return
    cancelAnimationFrame(drag.current.rafId)
    drag.current = {
      active: true, startX: e.pageX, scrollLeft: el.scrollLeft, moved: false,
      lastX: e.pageX, lastTime: performance.now(), velocity: 0, rafId: 0,
    }
    el.style.cursor = 'grabbing'
  }, [])

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (!drag.current.active) return
    const now = performance.now()
    const dt = now - drag.current.lastTime
    const dx = e.pageX - drag.current.startX
    if (Math.abs(dx) > 3) drag.current.moved = true
    if (dt > 0) drag.current.velocity = (drag.current.lastX - e.pageX) / dt
    drag.current.lastX = e.pageX
    drag.current.lastTime = now
    scrollRef.current!.scrollLeft = drag.current.scrollLeft - dx
  }, [])

  const launchMomentum = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    let v = drag.current.velocity * 14
    const step = () => {
      if (Math.abs(v) < 0.5) return
      el.scrollLeft += v
      v *= 0.92
      drag.current.rafId = requestAnimationFrame(step)
    }
    drag.current.rafId = requestAnimationFrame(step)
  }, [])

  const onMouseUp = useCallback((e: React.MouseEvent) => {
    if (!drag.current.active) return
    drag.current.active = false
    scrollRef.current!.style.cursor = ''
    launchMomentum()
    if (drag.current.moved) e.stopPropagation()
  }, [launchMomentum])

  const onMouseLeave = useCallback(() => {
    if (!drag.current.active) return
    drag.current.active = false
    scrollRef.current!.style.cursor = ''
    launchMomentum()
  }, [launchMomentum])

  const currentVersion = versions.find(v => v.version === selectedVersion)!
  const calendarStart = subDays(parseISO(currentVersion.startDate), 2)
  const calendarEnd = addDays(parseISO(currentVersion.endDate), 5)

  const isCurrentVersion = today >= parseISO(currentVersion.startDate) && today <= parseISO(currentVersion.endDate)

  const todayVersion = versions.find(v =>
    today >= parseISO(v.startDate) && today <= parseISO(v.endDate)
  )

  const goToToday = useCallback(() => {
    if (!todayVersion) return
    if (selectedVersion === todayVersion.version) {
      // 이미 today 버전 → 스크롤만
      const el = scrollRef.current
      if (!el) return
      const todayOffset = differenceInDays(today, calendarStart) * DAY_WIDTH
      el.scrollTo({ left: Math.max(0, todayOffset - el.clientWidth / 2), behavior: 'smooth' })
    } else {
      // 다른 버전 → 탭 전환 (useEffect가 스크롤 처리)
      setSelectedVersion(todayVersion.version)
    }
  }, [selectedVersion, todayVersion, calendarStart])

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    if (isCurrentVersion) {
      const todayOffset = differenceInDays(today, calendarStart) * DAY_WIDTH
      el.scrollLeft = Math.max(0, todayOffset - el.clientWidth / 2)
    } else {
      el.scrollLeft = 0
    }
  }, [selectedVersion])
  const totalDays = differenceInDays(calendarEnd, calendarStart) + 1

  const versionEvents = useMemo(
    () => allEvents.filter(e => e.version === selectedVersion),
    [selectedVersion]
  )
  const grouped = useMemo(() => groupEventsByCategory(versionEvents), [versionEvents])

  const categoryRows = CATEGORY_CONFIGS
    .map(cfg => ({
      ...cfg,
      events: grouped[cfg.category],
      rowCount: grouped[cfg.category].length,
    }))
    .filter(row => row.rowCount > 0)

  const totalRows = categoryRows.reduce((sum, c) => sum + c.rowCount, 0)
  // 섹션 높이 = rowCount*(ROW_HEIGHT+ROW_GAP) + ROW_GAP, 모든 카테고리 합산
  const totalHeight = totalRows * (ROW_HEIGHT + ROW_GAP) + categoryRows.length * ROW_GAP

  const versionDividers: { left: number; label: string }[] = []

  return (
    <div className="flex flex-col" style={{ background: '#111' }}>
      {/* Header */}
      <div
        className="relative overflow-hidden flex items-end pb-5"
        style={{
          height: isMobile ? 64 : 100,
          paddingLeft: isMobile ? 16 : 32,
          paddingRight: isMobile ? 16 : 32,
          background: '#0a0a0a',
          borderBottom: '2px solid #f5c518',
        }}
      >
        {/* subtle diamond grid */}
        <svg className="absolute inset-0 w-full h-full opacity-5 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="diamonds" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
              <polygon points="20,2 38,20 20,38 2,20" fill="none" stroke="#f5c518" strokeWidth="0.8" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#diamonds)" />
        </svg>

        <div className="relative z-10 flex flex-col justify-end gap-1">
          {!isMobile && (
            <span className="font-bold tracking-widest" style={{ fontSize: 11, color: '#f5c518cc' }}>명일방주</span>
          )}
          <div className="flex items-baseline" style={{ gap: isMobile ? 8 : 16 }}>
            <span className="font-black text-white" style={{ fontSize: isMobile ? 18 : 30, letterSpacing: '-0.02em' }}>
              {isMobile ? '명일방주: 엔드필드' : '엔드필드'}
            </span>
            {!isMobile && (
              <>
                <div className="w-px self-stretch" style={{ background: '#f5c51866' }} />
                <span className="text-white font-bold" style={{ fontSize: 30 }}>일정</span>
              </>
            )}
            <span className="font-bold tracking-widest" style={{ fontSize: isMobile ? 10 : 13, color: '#f5c518cc' }}>
              {isMobile ? 'SCHEDULE' : 'SCHEDULE'}
            </span>
          </div>
        </div>
      </div>

      {/* Version tabs */}
      <VersionTabs versions={versions} selected={selectedVersion} onChange={setSelectedVersion} isMobile={isMobile} />

      {/* D-day 배너 */}
      <DdayBanner today={today} onEventClick={handleEventClick} />

      {/* Calendar body */}
      <div className="flex" style={{ overflow: 'hidden' }}>
        {/* Category panel */}
        <div className="flex-shrink-0" style={{ width: isMobile ? PANEL_WIDTH_MOBILE : isMid ? PANEL_WIDTH_MID : PANEL_WIDTH, zIndex: 20 }}>
          <CategoryPanel
            rows={categoryRows}
            rowHeight={ROW_HEIGHT}
            rowGap={ROW_GAP}
            width={isMobile ? PANEL_WIDTH_MOBILE : isMid ? PANEL_WIDTH_MID : PANEL_WIDTH}
            compact={isMobile}
          />
        </div>

        {/* Scrollable timeline */}
        <div className="flex-1 relative overflow-hidden">
          {!isMobile && <ScrollArrow direction="left" scrollRef={scrollRef} />}
          {!isMobile && <ScrollArrow direction="right" scrollRef={scrollRef} />}
          {todayVersion && (
            <button
              onClick={goToToday}
              style={{
                position: 'absolute', top: 6, right: 44, zIndex: 30,
                background: '#1a1a1a', border: '1px solid #f5c51866',
                borderRadius: 6, color: '#f5c518', fontSize: 11, fontWeight: 700,
                padding: '4px 10px', cursor: 'pointer', letterSpacing: '0.04em',
                transition: 'background 0.15s, border-color 0.15s',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLButtonElement).style.background = '#f5c51822'
                ;(e.currentTarget as HTMLButtonElement).style.borderColor = '#f5c518'
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.background = '#1a1a1a'
                ;(e.currentTarget as HTMLButtonElement).style.borderColor = '#f5c51866'
              }}
            >
              오늘
            </button>
          )}
        <div
          ref={scrollRef}
          className="w-full h-full overflow-x-auto overflow-y-hidden"
          style={{ scrollbarWidth: 'none', cursor: 'grab', userSelect: 'none' }}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseLeave}
        >
          <div style={{ width: totalDays * DAY_WIDTH, position: 'relative' }}>
            {/* Time ruler */}
            <div
              className="sticky top-0 z-10"
              style={{ background: '#0a0a0a', borderBottom: '1px solid #2a2a2a' }}
            >
              <TimeRuler
                startDate={calendarStart}
                endDate={calendarEnd}
                dayWidth={DAY_WIDTH}
                versions={versions}
                labelInterval={isMobile ? 5 : 1}
              />
            </div>

            {/* Timeline body */}
            <div
              className="relative"
              style={{
                height: totalHeight,
                background: `repeating-linear-gradient(
                  45deg,
                  transparent,
                  transparent 7px,
                  rgba(255,255,255,0.015) 7px,
                  rgba(255,255,255,0.015) 8px
                )`,
              }}
            >
              {/* next version dividers */}
              {versionDividers.map(d => (
                <div
                  key={d.label}
                  className="absolute top-0 bottom-0 z-10 pointer-events-none"
                  style={{ left: d.left, borderLeft: '2px dashed #f5c51840' }}
                >
                  <span
                    className="absolute top-2 left-1 font-bold"
                    style={{ fontSize: 9, color: '#f5c518aa' }}
                  >
                    {d.label}
                  </span>
                </div>
              ))}

              {/* phase 2 divider — 현재 버전만 */}
              {(() => {
                const phase2Offset = differenceInDays(parseISO(currentVersion.phase2Date), calendarStart)
                return (
                  <div
                    className="absolute top-0 bottom-0 z-10 pointer-events-none"
                    style={{ left: phase2Offset * DAY_WIDTH, borderLeft: '1px solid #f5c51860' }}
                  />
                )
              })()}

              {/* Category rows */}
              {(() => {
                let rowOffset = 0
                return categoryRows.map(({ category, events, rowCount }, categoryIndex) => {
                  // 각 카테고리 섹션 높이 = rowCount*(ROW_HEIGHT+ROW_GAP) + ROW_GAP
                  // topOffset = 이전 섹션들 합계 + ROW_GAP(섹션 내부 상단 패딩)
                  const topOffset = rowOffset * (ROW_HEIGHT + ROW_GAP) + categoryIndex * ROW_GAP + ROW_GAP
                  rowOffset += rowCount

                  return (
                    <div key={category}>
                      <div
                        className="absolute left-0 right-0"
                        style={{ top: topOffset - ROW_GAP, height: 1, background: 'rgba(255,255,255,0.06)' }}
                      />

                      {events.map((event, idx) => {
                        const top = topOffset + idx * (ROW_HEIGHT + ROW_GAP)
                        return (
                          <motion.div
                            key={event.id}
                            className="absolute"
                            style={{ top, height: ROW_HEIGHT, left: 0, right: 0 }}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: idx * 0.05 + 0.1, duration: 0.3 }}
                          >
                            <EventBar
                              event={event}
                              calendarStart={calendarStart}
                              calendarEnd={calendarEnd}
                              dayWidth={DAY_WIDTH}
                              rowIndex={idx}
                              onClick={handleEventClick}
                            />
                          </motion.div>
                        )
                      })}
                    </div>
                  )
                })
              })()}

              <TodayLine
                today={today}
                calendarStart={calendarStart}
                calendarEnd={calendarEnd}
                dayWidth={DAY_WIDTH}
                totalHeight={totalHeight + 36}
              />
            </div>
          </div>
        </div>
        </div>
      </div>
      {/* Event cards */}
      <div style={{ padding: '0 24px' }}>
        <EventCards today={today} version={selectedVersion} onEventClick={handleEventClick} />
      </div>

      <EventModal event={selectedEvent} today={today} onClose={handleModalClose} />
    </div>
  )
}
