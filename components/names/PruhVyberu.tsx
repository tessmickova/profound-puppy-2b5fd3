'use client'

// Proužek, který přizná, co se právě filtruje.
//
// Volba „koho pojmenováváme“ a vyřazená jména platí pro celou stránku.
// Bez téhle věty by to vypadalo jako chybějící obsah: člověk vidí míň
// jmen a neví proč. Proto je vedle každého omezení i způsob, jak ho zrušit.

import { useRodina } from '@/lib/names/rodina'
import { useVyber } from '@/lib/names/vyber'

export default function PruhVyberu() {
  const { pohlavi, nastavPohlavi } = useRodina()
  const { vyrazena, vratVsechnaVyrazena } = useVyber()

  if (!pohlavi && vyrazena.length === 0) return null

  return (
    <p className="pruh-vyberu" role="status">
      {pohlavi && (
        <span className="pruh-vyberu-cast">
          Ukazujeme jen <strong>{pohlavi === 'holka' ? 'holčičí' : 'chlapecká'} jména</strong>
          <button type="button" onClick={() => nastavPohlavi(null)}>zrušit</button>
        </span>
      )}
      {vyrazena.length > 0 && (
        <span className="pruh-vyberu-cast">
          <strong>{vyrazena.length}</strong>{' '}
          {vyrazena.length === 1 ? 'vyřazené jméno' : vyrazena.length < 5 ? 'vyřazená jména' : 'vyřazených jmen'}
          {' '}se nezobrazuje
          <button type="button" onClick={vratVsechnaVyrazena}>vrátit zpět</button>
        </span>
      )}
    </p>
  )
}
