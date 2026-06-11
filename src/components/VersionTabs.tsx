import type { VersionInfo } from '../data/events'

interface Props {
  versions: VersionInfo[]
  selected: string
  onChange: (version: string) => void
  isMobile?: boolean
}

export default function VersionTabs({ versions, selected, onChange, isMobile = false }: Props) {
  return (
    <div
      style={{
        display: 'flex',
        gap: 0,
        background: '#0a0a0a',
        borderBottom: '1px solid #2a2a2a',
        paddingLeft: isMobile ? 12 : 24,
        overflowX: 'auto',
        scrollbarWidth: 'none',
      }}
    >
      {versions.map(v => {
        const isActive = v.version === selected
        return (
          <button
            key={v.version}
            onClick={() => onChange(v.version)}
            style={{
              background: 'none',
              border: 'none',
              borderBottom: isActive ? '2px solid #f5c518' : '2px solid transparent',
              color: isActive ? '#f5c518' : '#555',
              fontFamily: 'inherit',
              cursor: 'pointer',
              padding: isMobile ? '10px 14px' : '12px 20px',
              marginBottom: -1,
              flexShrink: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              gap: 3,
              transition: 'color 0.15s',
            }}
          >
            <span style={{ fontSize: isMobile ? 12 : 13, fontWeight: 700 }}>v{v.version}</span>
            {!isMobile && (
              <span style={{ fontSize: 10, color: isActive ? '#f5c51899' : '#444', fontWeight: 600, whiteSpace: 'nowrap' }}>
                {v.titleKo}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
