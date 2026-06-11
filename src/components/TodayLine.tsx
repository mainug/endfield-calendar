import { motion } from 'framer-motion'
import { differenceInDays, format } from 'date-fns'

interface Props {
  today: Date
  calendarStart: Date
  calendarEnd: Date
  dayWidth: number
  totalHeight: number
}

export default function TodayLine({ today, calendarStart, calendarEnd, dayWidth, totalHeight }: Props) {
  const offsetDays = differenceInDays(today, calendarStart)
  const totalDays = differenceInDays(calendarEnd, calendarStart)
  if (offsetDays < 0 || offsetDays > totalDays) return null

  const left = offsetDays * dayWidth + dayWidth / 2

  return (
    <motion.div
      className="absolute top-0 z-30 pointer-events-none"
      style={{ left, height: totalHeight }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.6, duration: 0.4 }}
    >
      <div
        className="absolute top-0 -translate-x-1/2 flex flex-col items-center"
        style={{ height: totalHeight }}
      >
        {/* date label */}
        <div
          className="px-1.5 py-0.5 text-black font-black rounded-sm flex-shrink-0"
          style={{ background: '#f59e0b', fontSize: 9, whiteSpace: 'nowrap' }}
        >
          TODAY {format(today, 'MM.dd')}
        </div>

        {/* line */}
        <motion.div
          className="w-px flex-1"
          style={{ background: '#f59e0b' }}
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>
    </motion.div>
  )
}
