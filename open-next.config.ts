// Převod Next.js buildu do podoby, kterou umí spustit edge runtime.
//
// Vyrovnávací paměť předgenerovaných stránek tu není pro rychlost, ale pro
// správnost: bez ní adaptér část stránek nenašel a vracel na ně 404 —
// pokaždé na jiné, podle toho, co zrovna měl po ruce. Bereme je ze statických
// souborů, které se nasazují spolu s workerem; nepotřebují tedy žádné další
// úložiště ani další nastavení.
import { defineCloudflareConfig } from '@opennextjs/cloudflare'
import staticAssetsIncrementalCache from '@opennextjs/cloudflare/overrides/incremental-cache/static-assets-incremental-cache'

export default defineCloudflareConfig({
  incrementalCache: staticAssetsIncrementalCache,
})
