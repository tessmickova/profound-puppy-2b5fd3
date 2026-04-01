// lib/space-weather/hero/getCurrentStory.ts

import type { SpaceWeatherState, AuroraLikelihood } from './types'
import { AURORA_LIKELIHOOD_LABELS } from './types'

interface StoryContext {
  kp:               number
  bz:               number | null
  swSpeed:          number | null
  latestFlareClass: string | null
  latestCmeSpeed:   number | null
  predictedArrival: string | null
  auroraLikelihood: AuroraLikelihood
  gScale:           number
}

interface Narrative {
  now:   string
  next:  string
  forCz: string
}

export function getCurrentStory(state: SpaceWeatherState, ctx: StoryContext): Narrative {
  switch (state) {
    case 'QUIET':
      return {
        now:   'Žádná významná sluneční aktivita směrem k Zemi nebyla zaznamenána.',
        next:  'Geomagnetické pole Země je klidné. Situace se může změnit při nové erupci.',
        forCz: 'Polární záře nad Českou republikou není v tuto chvíli očekávána.',
      }

    case 'SOLAR_EVENT_DETECTED': {
      const flareNote = ctx.latestFlareClass ? ` Detekována erupce třídy ${ctx.latestFlareClass}.` : ''
      return {
        now:   `Na Slunci byla zaznamenána aktivita.${flareNote}`,
        next:  'Sledujeme, zda sluneční hmota míří směrem k Zemi.',
        forCz: 'Zatím bez přímého dopadu na Českou republiku.',
      }
    }

    case 'EARTH_DIRECTED_CME': {
      const speedNote = ctx.latestCmeSpeed ? ` Rychlost CME: ~${Math.round(ctx.latestCmeSpeed)} km/s.` : ''
      return {
        now:   `Koronální výron hmoty (CME) míří k Zemi.${speedNote}`,
        next:  arrivalNote(ctx.predictedArrival) + ' Sledujte Bz a rychlost slunečního větru pro potvrzení dopadu.',
        forCz: 'Pokud CME zasáhne magnetosféru, podmínky pro záři se mohou zlepšit.',
      }
    }

    case 'CORONAL_HOLE_STREAM':
      return {
        now:   `Koronální díra vysílá vysokorychlostní proud slunečního větru${ctx.swSpeed ? ` (${Math.round(ctx.swSpeed)} km/s)` : ''}.`,
        next:  'Alfvénické oscilace Bz mohou přinést krátká okna pro záři. Aktivita může trvat 1–3 dny.',
        forCz: 'Šance na záři z ČR je nižší než u CME — Bz osciluje. Sledujte real-time data pro krátké záblesky.',
      }

    case 'IN_TRANSIT':
      return {
        now:   'Sluneční hmota je na cestě k Zemi meziplanetárním prostorem.',
        next:  arrivalNote(ctx.predictedArrival) + ' Čekáme na změnu Bz do záporných hodnot na sondě L1.',
        forCz: 'Po dopadu na magnetosféru se mohou podmínky pro záři v ČR zlepšit.',
      }

    case 'L1_IMPACT_IMMINENT':
      return {
        now:   `Sonda před Zemí (L1) měří zvýšený sluneční vítr${ctx.swSpeed ? ` o rychlosti ${Math.round(ctx.swSpeed)} km/s` : ''}.`,
        next:  'Účinky na magnetosféru Země mohou zesílit během desítek minut. Sledujte KP index a pokles Bz.',
        forCz: 'Sledujte podmínky — pokud Bz zůstane záporné, šance na záři v ČR roste.',
      }

    case 'MAGNETOSPHERE_ACTIVE':
      return {
        now:   `Magnetosféra Země aktivně reaguje na sluneční vítr. KP index: ${ctx.kp.toFixed(1)}${ctx.gScale > 0 ? `, geomagnetická bouře G${ctx.gScale}` : ''}.`,
        next:  'Geomagnetická aktivita může přetrvávat v následujících hodinách. Čekáme na růst KP a trvale záporný Bz.',
        forCz: ctx.kp >= 4
          ? 'V tmavých oblastech ČR může být záře viditelná fotoaparátem.'
          : 'Záře zatím není očekávána pouhým okem, ale sledujte vývoj.',
      }

    case 'AURORA_POSSIBLE_CZ':
      return {
        now:   `Podmínky jsou příznivé pro polární záři. KP: ${ctx.kp.toFixed(1)}${ctx.bz != null ? `, Bz: ${ctx.bz.toFixed(1)} nT` : ''}.`,
        next:  'Aktivita se může dále vyvíjet. Sledujte aktuální hodnoty.',
        forCz: 'Záře může být viditelná v České republice — ideálně bez oblačnosti a světelného znečištění, směr sever.',
      }

    case 'AURORA_LIKELY_CZ':
      return {
        now:   `Silná geomagnetická bouře! KP: ${ctx.kp.toFixed(1)}, G${ctx.gScale}${ctx.bz != null ? `, Bz: ${ctx.bz.toFixed(1)} nT` : ''}.`,
        next:  'Podmínky mohou zůstat silné několik hodin.',
        forCz: 'Polární záře je velmi pravděpodobná i v ČR! Zamíř na tmavé místo a sleduj severní obzor.',
      }
  }
}

function arrivalNote(arrival: string | null): string {
  if (!arrival) return 'Odhad dopadu zatím není k dispozici.'
  const d = new Date(arrival)
  if (isNaN(d.getTime())) return 'Odhad dopadu zatím není k dispozici.'
  const czTime = d.toLocaleString('cs-CZ', { timeZone: 'Europe/Prague', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
  return `Předpokládaný dopad na magnetosféru: ~${czTime} SEČ.`
}
