import { ImageResponse } from 'next/og'
import { SITE_DESCRIPTION, SITE_NAME } from '@/lib/seo'

export const runtime = 'edge'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

function DocGlyph() {
  return (
    <div
      style={{
        width: 72,
        height: 84,
        background: '#1D3FB0',
        borderRadius: 10,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          color: '#F3EFE4',
          fontSize: 52,
          fontWeight: 900,
          fontStyle: 'italic',
          lineHeight: 1,
          transform: 'translateY(4px)',
        }}
      >
        P
      </div>
    </div>
  )
}

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: '#10151C',
          padding: '72px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <DocGlyph />
          <div style={{ color: '#F3EFE4', fontSize: 32, fontWeight: 700 }}>{SITE_NAME}</div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ color: '#35D68E', fontSize: 24, fontFamily: 'monospace', marginBottom: 20 }}>
            $ upload_required: false · files_transmitted: 0
          </div>
          <div style={{ color: '#F3EFE4', fontSize: 74, fontWeight: 800, lineHeight: 1.08, letterSpacing: -2 }}>
            PDF tools that feel<br />effortlessly fast.
          </div>
          <div style={{ color: '#8E97A3', fontSize: 27, marginTop: 22 }}>
            {SITE_NAME} — {SITE_DESCRIPTION}
          </div>
        </div>
      </div>
    ),
    size
  )
}
