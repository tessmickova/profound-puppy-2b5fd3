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
  uroven?: 2 | 3
}) {
  const Ikona = druh === 'zvirata' ? PawPrint : Baby
  const Tag = uroven === 3 ? 'h3' : 'h2'
  return (
    <Tag className={`nadpis-sekce nadpis-${druh}`}>
      <span className="nadpis-znak" aria-hidden><Ikona size={uroven === 3 ? 15 : 17} /></span>
      {children}
    </Tag>
  )
}
