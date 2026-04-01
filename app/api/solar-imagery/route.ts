// app/api/solar-imagery/route.ts
// Generic handler for all solar imagery animation sources

import { NextRequest, NextResponse } from 'next/server'

const SOURCES = {
  enlil: {
    url: 'https://services.swpc.noaa.gov/images/animations/enlil/',
    regex: /href="(enlil_com2_\d+_\d{8}T\d{6}\.jpg)"/g,
  },
  'lasco-c3': {
    url: 'https://services.swpc.noaa.gov/images/animations/lasco-c3/',
    regex: /href="(\d{8}_\d{4}_c3_512\.jpg)"/g,
  },
  ccor1: {
    url: 'https://services.swpc.noaa.gov/images/animations/ccor1/',
    regex: /href="(\d{8}_\d{4}_ccor1_1024by960\.jpg)"/g,
  },
  'suvi-fe195': {
    url: 'https://cdn.star.nesdis.noaa.gov/GOES19/SUVI/FD/Fe195/',
    regex: /href="(\d+_GOES19-SUVI-Fe195-600x600\.jpg)"/g,
  },
} as const

type SourceId = keyof typeof SOURCES

const VALID_SOURCES = new Set(Object.keys(SOURCES))

export const revalidate = 300

export async function GET(req: NextRequest) {
  const source = req.nextUrl.searchParams.get('source') as SourceId | null

  if (!source || !VALID_SOURCES.has(source)) {
    return NextResponse.json(
      { error: `Invalid source. Valid: ${Object.keys(SOURCES).join(', ')}`, frames: [], count: 0 },
      { status: 400 },
    )
  }

  const cfg = SOURCES[source]

  try {
    const html = await fetch(cfg.url, {
      next: { revalidate: 300 },
      headers: { 'User-Agent': 'AuroraDog/1.0 (aurora monitoring)' },
    }).then(r => {
      if (!r.ok) throw new Error(`Source responded ${r.status}`)
      return r.text()
    })

    // Create regex inside handler to avoid lastIndex persistence
    const re = new RegExp(cfg.regex.source, cfg.regex.flags)
    const frames: string[] = []
    let match: RegExpExecArray | null
    while ((match = re.exec(html)) !== null) {
      frames.push(match[1])
    }

    frames.sort()

    // SUVI has 40k+ frames — only return the latest 200 for animation
    const limited = source === 'suvi-fe195' ? frames.slice(-200) : frames
    const urls = limited.map(f => `${cfg.url}${f}`)

    return NextResponse.json({
      source,
      frames: urls,
      count: urls.length,
      totalAvailable: frames.length,
      latest: limited.at(-1) ?? null,
      fetchedAt: new Date().toISOString(),
    })
  } catch (err) {
    console.error(`[solar-imagery/${source}] Error:`, err)
    return NextResponse.json(
      { error: `Failed to fetch ${source} frames`, frames: [], count: 0 },
      { status: 502 },
    )
  }
}
