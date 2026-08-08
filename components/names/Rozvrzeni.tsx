// Rozvržení obsahu stránky.
//
// Reklama tudy nechodí — má vlastní rám kolem okna (`ReklamniRam`), takže
// obsahu tady zbývá jen držet čitelnou šířku a střed.

import type { ReactNode } from 'react'

export default function Rozvrzeni({ children }: { children: ReactNode }) {
  return <div className="rozvrzeni-obsah">{children}</div>
}
