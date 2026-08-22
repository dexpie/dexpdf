import { ImageResponse } from 'next/og'
import { getToolById, getToolSeoCopy, SITE_NAME } from '@/lib/seo'

export const runtime = 'edge'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function OpengraphImage({ params }) {
  const tool = getToolById(params.toolId)
  const title = tool?.title || 'PDF Tools'
  const description = getToolSeoCopy(params.toolId)?.description || ''

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
          <div
            style={{
              width: 60,
              height: 70,
              background: '#1D3FB0',
              borderRadius: 10,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div style={{ color: '#F3EFE4', fontSize: 42, fontWeight: 900, fontStyle: 'italic', transform: 'translateY(4px)' }}>
              P
            </div>
          </div>
          <div style={{ color: '#8E97A3', fontSize: 30, fontWeight: 600 }}>{SITE_NAME}</div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ color: '#35D68E', fontSize: 24, fontFamily: 'monospace', marginBottom: 20 }}>
            $ processed_on: this_device · 100% local
          </div>
          <div style={{ color: '#F3EFE4', fontSize: title.length > 18 ? 66 : 84, fontWeight: 800, lineHeight: 1.08 }}>
            {title}
          </div>
          <div style={{ color: '#8E97A3', fontSize: 27, marginTop: 22, maxWidth: 940 }}>
            {description}
          </div>
        </div>
      </div>
    ),
    size
  )
}
