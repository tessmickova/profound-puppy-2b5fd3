import type { Metadata } from 'next'
import Shell from '@/components/names/Shell'
import OblibeneSeznam from '@/components/names/OblibeneSeznam'

export const metadata: Metadata = {
  title: 'Oblíbená jména ❤️ | Svět jmen',
  description: 'Jména, která jste si označili srdíčkem — přehledně na jednom místě.',
}

export default function OblibeneStranka() {
  return (
    <Shell>
      <h1 className="mb-2 [font-family:var(--font-syne)] text-3xl font-extrabold">Vaše oblíbená jména ❤️</h1>
      <p className="mb-8 max-w-2xl text-[#6b6156]">
        Vše, co jste označili srdíčkem. Ukládá se jen ve vašem prohlížeči — nikam se nic neposílá.
      </p>
      <OblibeneSeznam />
    </Shell>
  )
}
