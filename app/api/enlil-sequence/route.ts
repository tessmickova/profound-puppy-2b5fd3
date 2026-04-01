// app/api/enlil-sequence/route.ts
// Fetches ENLIL model frame list from NOAA SWPC and returns sorted URLs

import { NextResponse } from 'next/server'

const ENLIL_BASE = 'https://services.swpc.noaa.gov/images/animations/enlil/'

export const revalidate = 300 // 5-minute ISR cache

export async function GET() {
  try {
    const html = await fetch(ENLIL_BASE, {
      next: { revalidate: 300 },
      headers: { 'User-Agent': 'AuroraDog/1.0 (aurora monitoring)' },
    }).then(r => {
      if (!r.ok) throw new Error(`NOAA responded ${r.status}`)
      return r.text()
    })

    // Match filenames like enlil_com2_58007_20260319T170000.jpg
    // Regex created inside function to avoid lastIndex persistence across requests
    const frameRe = /href="(enlil_com2_\d+_\d{8}T\d{6}\.jpg)"/g
    const frames: string[] = []
    let match: RegExpExecArray | null
    while ((match = frameRe.exec(html)) !== null) {
      frames.push(match[1])
    }

    // Sort chronologically by timestamp in filename
    frames.sort()

    const urls = frames.map(f => `${ENLIL_BASE}${f}`)

    return NextResponse.json({
      frames: urls,
      count: urls.length,
      latest: frames.at(-1) ?? null,
      fetchedAt: new Date().toISOString(),
    })
  } catch (err) {
    console.error('[enlil-sequence] Error:', err)
    return NextResponse.json(
      { error: 'Failed to fetch ENLIL frames', frames: [], count: 0 },
      { status: 502 },
    )
  }
}
