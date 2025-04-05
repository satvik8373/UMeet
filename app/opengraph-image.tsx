import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export const alt = 'UMeet - Connect and Watch Together'
export const size = {
  width: 1200,
  height: 630,
}

export const contentType = 'image/png'

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#1a1a1a',
          fontFamily: 'sans-serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 40,
          }}
        >
          <div
            style={{
              width: 120,
              height: 120,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#00a8ff',
              borderRadius: 24,
              marginRight: 32,
              fontSize: 80,
              color: 'white',
              fontWeight: 700,
            }}
          >
            U
          </div>
          <div
            style={{
              fontSize: 80,
              color: 'white',
              fontWeight: 700,
            }}
          >
            UMeet
          </div>
        </div>
        <div
          style={{
            fontSize: 40,
            color: '#00a8ff',
          }}
        >
          Connect and Watch Together
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
} 