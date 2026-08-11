'use client'

// Konec seznamu nesmí být slepá ulička. Kdo dojel až sem a nic si
// nevybral, dostane jedním klikem cestu dál — uvolnit filtr, nebo
// zkusit jiný způsob hledání. Co přesně tlačítko udělá, určuje volající;
// tady je jen společný rámeček, ať to všude vypadá stejně.

export default function KonecSeznamu({ celkem, children }: {
  celkem: number
  children: React.ReactNode
}) {
  if (celkem === 0) return null
  return (
    <div className="konec-seznamu">
      <p>
        To je všech <strong>{celkem}</strong> jmen podle aktuálního zadání.
      </p>
      <div className="konec-seznamu-akce">{children}</div>
    </div>
  )
}
