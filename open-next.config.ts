// Převod Next.js buildu do podoby, kterou umí spustit edge runtime.
// Držíme výchozí nastavení — web je převážně staticky předgenerovaný,
// takže není co dolaďovat.
import { defineCloudflareConfig } from '@opennextjs/cloudflare'

export default defineCloudflareConfig()
