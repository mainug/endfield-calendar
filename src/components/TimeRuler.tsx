import { differenceInDays, format, addDays, parseISO } from 'date-fns'
import type { VersionInfo } from '../data/events'

interface Props {
  startDate: Date
  endDate: Date
  dayWidth: number
  versions: VersionInfo[]
  labelInterval?: number
}

export default function TimeRuler({ startDate, endDate, dayWidth, versions, labelInterval = 1 }: Props) {
  const totalDays = differenceInDays(endDate, startDate) + 1
  const days = Array.from({ length: totalDays }, (_, i) => addDays(startDate, i))

  const phaseDates = versions.flatMap(v => [
    { date: v.phase1Date, label: format(parseISO(v.phase1Date), 'MM.dd') },
    { date: v.phase2Date, label: format(parseISO(v.phase2Date), 'MM.dd') },
  ])

  return (
    <div className="relative flex" style={{ height: 36 }}>
      {days.map((day, i) => {
        const dateStr = format(day, 'yyyy-MM-dd')
        const phase = phaseDates.find(p => p.date === dateStr)
        const showLabel = i % labelInterval === 0

        return (
          <div
            key={dateStr}
            className="relative flex-shrink-0"
            style={{ width: dayWidth }}
          >
            {phase ? (
              <div
                className="absolute bottom-0 left-1/2 -translate-x-1/2 z-10 px-2 py-0.5 text-xs font-bold text-black"
                style={{ background: '#f5c518', fontSize: 11, whiteSpace: 'nowrap' }}
              >
                {phase.label}
              </div>
            ) : showLabel ? (
              <div
                className="absolute bottom-1 left-0 text-white/30"
                style={{ fontSize: 9, whiteSpace: 'nowrap' }}
              >
                {format(day, 'dd')}
              </div>
            ) : null}
          </div>
        )
      })}
    </div>
  )
}
