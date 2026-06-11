import type { EventCategory } from '../data/events'

interface CategoryRow {
  category: EventCategory
  label: string
  part: string
  rowCount: number
}

interface Props {
  rows: CategoryRow[]
  rowHeight: number
  rowGap: number
  width: number
  compact?: boolean
}

const ICONS: Record<EventCategory, string> = {
  headhunting: '⟁',
  arsenal: '✕',
  zone: '⊞',
  event: '★',
  content: '↻',
}

export default function CategoryPanel({ rows, rowHeight, rowGap, width, compact = false }: Props) {
  return (
    <div
      className="flex-shrink-0 relative z-20"
      style={{
        width,
        background: '#0a0a0a',
        borderRight: '1px solid #2a2a2a',
      }}
    >
      {/* ENDFIELD watermark */}
      {!compact && (
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden"
          style={{ opacity: 0.04 }}
        >
          <span
            className="text-white font-black tracking-widest"
            style={{ fontSize: 11, writingMode: 'vertical-rl', letterSpacing: '0.3em' }}
          >
            ENDFIELD
          </span>
        </div>
      )}

      <div className="flex flex-col" style={{ paddingTop: 38 }}>
        {rows.map(({ category, label, part, rowCount }) => (
          <div
            key={category}
            className="flex flex-col items-center justify-center relative"
            style={{
              height: rowCount * (rowHeight + rowGap) + rowGap,
              borderBottom: '1px solid #222',
            }}
          >
            {compact ? (
              /* compact 모드: 텍스트 레이블 */
              <div
                className="font-bold text-center leading-tight text-white/80"
                style={{ fontSize: 10, whiteSpace: 'pre-line', textAlign: 'center' }}
              >
                {label}
              </div>
            ) : (
              /* 데스크톱: 아이콘 + 레이블 + part */
              <>
                <div style={{ color: '#f5c518', opacity: 0.7, fontSize: 26, lineHeight: 1, marginBottom: 6 }}>
                  {ICONS[category]}
                </div>
                <div
                  className="text-white/80 font-bold text-center leading-tight whitespace-pre"
                  style={{ fontSize: 14 }}
                >
                  {label}
                </div>
                <div
                  className="mt-1.5 font-bold"
                  style={{ fontSize: 10, letterSpacing: '0.08em', color: '#f5c51866' }}
                >
                  {part}
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
