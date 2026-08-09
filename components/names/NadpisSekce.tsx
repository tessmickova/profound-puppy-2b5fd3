import type { ReactNode } from 'react'
import { Baby, PawPrint } from 'lucide-react'

// Lidé a zvířata mají po celém webu odlišené nadpisy — jinou ikonu i barvu,
// aby bylo na první pohled jasné, do které poloviny webu sekce patří.

export type Druh = 'lide' | 'zvirata'

export default function NadpisSekce({
  druh, children, uroven = 2,
}: {
  druh: Druh
  children: ReactNode
  /** 1 patří hlavnímu nadpisu stránky — na každé smí být jen jednou. */
  uroven?: 1 | 2 | 3
}) {
  const Ikona = druh === 'zvirata' ? PawPrint : Baby
  const Tag = `h${uroven}` as const
  const velikost = uroven === 3 ? 15 : uroven === 1 ? 20 : 17
  return (
    <Tag className={`nadpis-sekce nadpis-${druh} ${uroven === 1 ? 'nadpis-hlavni' : ''}`}>
      <span className="nadpis-znak" aria-hidden><Ikona size={velikost} /></span>
      {children}
    </Tag>
  )
}
