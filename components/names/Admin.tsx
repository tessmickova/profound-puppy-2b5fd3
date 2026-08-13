'use client'

// Správa webu na jednom místě — bez terminálu a bez AI.
//
// Dvě patra:
//  · Audit (bezpečnost, právo, provoz, inventura) je vidět hned — je to
//    statický obsah z repozitáře, žádné tajemství v něm není.
//  · Živá správa (objednávky, potvrzování plateb, přepínače) chce admin
//    token reklamní služby. Token se drží jen v sessionStorage — zavřením
//    panelu prohlížeče zmizí — a posílá se výhradně jako Bearer hlavička
//    na reklamní službu přes HTTPS.
//
// Proč token a ne účet s heslem: služba má jediného správce. Jeden dlouhý
// náhodný token ve správci hesel je pro tenhle případ bezpečnější než
// vlastní správa účtů, kterou by bylo nutné napsat a hlídat.

import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  BadgeCheck, Banknote, Brush, KeyRound, ListChecks, LogOut, RefreshCw,
  Scale, ShieldAlert, ToggleLeft, Wrench,
} from 'lucide-react'
import { ADRESA_REKLAM } from '@/lib/names/reklamniServer'
import {
  POPIS_PREPINACU, VYCHOZI_PREPINACE, type Prepinace,
} from '@/lib/names/nastaveni'
import {
  AUDIT_REVIZE, BEZPECNOST, DOPORUCENI, INVENTURA, PRAVO, PROVOZ, STAV_INFO,
  type PolozkaAuditu,
} from '@/lib/names/audit'

const KLIC_TOKENU = 'svetjmen-admin-token'

interface Objednavka {
  id: string
  plocha: string
  obdobi: string
  cena_kc: number
  vs: string
  stav: string
  plati_od: string | null
  plati_do: string | null
  firma: string
  email: string
  znacka: string | null
  nadpis: string | null
}

const STAVY_OBJEDNAVKY: Record<string, string> = {
  ceka_na_platbu: 'čeká na platbu',
  aktivni: 'aktivní',
  vyprsela: 'vypršelá',
  zrusena: 'zrušená',
}

function AuditSekce({ nadpis, ikona, polozky }: {
  nadpis: string
  ikona: React.ReactNode
  polozky: PolozkaAuditu[]
}) {
  return (
    <section className="admin-sekce">
      <h2>{ikona} {nadpis}</h2>
      <ul className="admin-audit">
        {polozky.map(p => (
          <li key={p.nazev} className="admin-audit-polozka">
            <span className="admin-stitek" style={{ ['--stav-barva' as string]: STAV_INFO[p.stav].barva }}>
              {STAV_INFO[p.stav].stitek}
            </span>
            <div>
              <strong>{p.nazev}</strong>
              <p>{p.popis}</p>
              {p.akce && <p className="admin-akce"><strong>Co udělat:</strong> {p.akce}</p>}
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}

export default function Admin() {
  const [token, setToken] = useState('')
  const [prihlasen, setPrihlasen] = useState(false)
  const [hlaska, setHlaska] = useState<string | null>(null)
  const [objednavky, setObjednavky] = useState<Objednavka[] | null>(null)
  const [prepinace, setPrepinace] = useState<Prepinace>(VYCHOZI_PREPINACE)
  const [pracuje, setPracuje] = useState(false)

  const zavolej = useCallback(async (cesta: string, init: RequestInit = {}, t = token) => {
    const odpoved = await fetch(`${ADRESA_REKLAM}${cesta}`, {
      ...init,
      headers: { ...(init.headers ?? {}), Authorization: `Bearer ${t}` },
    })
    if (odpoved.status === 401) throw new Error('unauthorized')
    if (!odpoved.ok) throw new Error(`http ${odpoved.status}`)
    return odpoved.json()
  }, [token])

  const nactiData = useCallback(async (t: string) => {
    const [prehled, nastaveni] = await Promise.all([
      zavolej('/api/admin/prehled', {}, t) as Promise<{ objednavky: Objednavka[] }>,
      fetch(`${ADRESA_REKLAM}/api/nastaveni`).then(r => r.json()) as Promise<{ nastaveni: Prepinace }>,
    ])
    setObjednavky(prehled.objednavky)
    setPrepinace({ ...VYCHOZI_PREPINACE, ...nastaveni.nastaveni })
  }, [zavolej])

  // Token z minula: zkusíme ho potichu — když neplatí, přihlášení se ukáže.
  useEffect(() => {
    const ulozeny = sessionStorage.getItem(KLIC_TOKENU)
    if (!ulozeny || !ADRESA_REKLAM) return
    setToken(ulozeny)
    zavolej('/api/admin/overeni', {}, ulozeny)
      .then(() => { setPrihlasen(true); return nactiData(ulozeny) })
      .catch(() => sessionStorage.removeItem(KLIC_TOKENU))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const prihlas = async (e: React.FormEvent) => {
    e.preventDefault()
    setHlaska(null)
    setPracuje(true)
    try {
      await zavolej('/api/admin/overeni')
      sessionStorage.setItem(KLIC_TOKENU, token)
      setPrihlasen(true)
      await nactiData(token)
    } catch (err) {
      setHlaska(err instanceof Error && err.message === 'unauthorized'
        ? 'Token neplatí. Buď je špatně opsaný, nebo ještě není nastavený — viz návod níže.'
        : 'Reklamní služba neodpovídá. Zkuste to za chvíli.')
    } finally {
      setPracuje(false)
    }
  }

  const odhlas = () => {
    sessionStorage.removeItem(KLIC_TOKENU)
    setToken('')
    setPrihlasen(false)
    setObjednavky(null)
  }

  const potvrd = async (vs: string) => {
    setPracuje(true)
    setHlaska(null)
    try {
      await zavolej('/api/admin/potvrdit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vs }),
      })
      setHlaska(`Platba ${vs} potvrzena — kampaň běží.`)
      await nactiData(token)
    } catch {
      setHlaska('Potvrzení se nepovedlo — zkontrolujte, že objednávka pořád čeká na platbu.')
    } finally {
      setPracuje(false)
    }
  }

  const prepni = async (klic: keyof Prepinace) => {
    const nova = !prepinace[klic]
    setPrepinace(p => ({ ...p, [klic]: nova }))
    try {
      await zavolej('/api/admin/nastaveni', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ klic, hodnota: nova }),
      })
    } catch {
      setPrepinace(p => ({ ...p, [klic]: !nova }))
      setHlaska('Přepnutí se neuložilo — zkuste to znovu.')
    }
  }

  const ukliď = async () => {
    setPracuje(true)
    try {
      const v = await zavolej('/api/admin/uklid', { method: 'POST' }) as { prosle: number; zrusene: number }
      setHlaska(`Úklid hotový: vypršelo ${v.prosle}, zrušeno nezaplacených ${v.zrusene}.`)
      await nactiData(token)
    } catch {
      setHlaska('Úklid se nepovedl.')
    } finally {
      setPracuje(false)
    }
  }

  const cekajici = useMemo(
    () => (objednavky ?? []).filter(o => o.stav === 'ceka_na_platbu'),
    [objednavky],
  )

  return (
    <div className="admin">
      {/* ── živá správa ── */}
      <section className="admin-sekce">
        <h2><KeyRound size={16} aria-hidden /> Živá správa</h2>

        {!ADRESA_REKLAM && (
          <p className="admin-varovani">
            Web nemá nastavenou adresu reklamní služby (NEXT_PUBLIC_ADS_API),
            takže správa objednávek a přepínačů odsud teď nejde ovládat.
          </p>
        )}

        {ADRESA_REKLAM && !prihlasen && (
          <>
            <form onSubmit={prihlas} className="admin-prihlaseni">
              <label>
                <span>Admin token</span>
                <input
                  type="password"
                  value={token}
                  onChange={e => setToken(e.target.value)}
                  placeholder="vložte token ze správce hesel"
                  autoComplete="off"
                />
              </label>
              <button type="submit" className="vyber-tlacitko je-hlavni" disabled={!token || pracuje}>
                Přihlásit se
              </button>
            </form>
            <p className="admin-pozn">
              Token je nastavený příkazem <code>npx wrangler secret put ADMIN_TOKEN</code>{' '}
              v adresáři <code>ads-worker</code>. Drží se jen do zavření prohlížeče
              a posílá se výhradně reklamní službě.
            </p>
          </>
        )}

        {prihlasen && (
          <>
            <div className="admin-radek">
              <button type="button" className="vyber-tlacitko" onClick={() => nactiData(token)} disabled={pracuje}>
                <RefreshCw size={13} aria-hidden /> Obnovit
              </button>
              <button type="button" className="vyber-tlacitko" onClick={ukliď} disabled={pracuje}>
                <Brush size={13} aria-hidden /> Uklidit prošlé
              </button>
              <button type="button" className="vyber-tlacitko" onClick={odhlas}>
                <LogOut size={13} aria-hidden /> Odhlásit
              </button>
            </div>

            <h3><ToggleLeft size={15} aria-hidden /> Přepínače webu</h3>
            <ul className="admin-prepinace">
              {POPIS_PREPINACU.map(p => (
                <li key={p.klic}>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={prepinace[p.klic]}
                    className={`admin-prepinac ${prepinace[p.klic] ? 'je-zapnuty' : ''}`}
                    onClick={() => prepni(p.klic)}
                  >
                    <span className="admin-prepinac-drah" aria-hidden><span /></span>
                    {prepinace[p.klic] ? 'zapnuto' : 'vypnuto'}
                  </button>
                  <div>
                    <strong>{p.nazev}</strong>
                    <p>{p.popis}</p>
                  </div>
                </li>
              ))}
            </ul>
            <p className="admin-pozn">
              Změna se na webu projeví do minuty (návštěvníkům s otevřenou
              stránkou po dalším načtení). Vypnutí nic nemaže.
            </p>

            <h3><Banknote size={15} aria-hidden /> Objednávky reklamy</h3>
            {cekajici.length > 0 && (
              <p className="admin-pozn">
                <strong>{cekajici.length}</strong> objednávek čeká na platbu — až
                peníze dorazí na účet, potvrďte je podle variabilního symbolu.
              </p>
            )}
            {objednavky && objednavky.length === 0 && (
              <p className="admin-pozn">Zatím žádné objednávky.</p>
            )}
            {objednavky && objednavky.length > 0 && (
              <div className="admin-tabulka-obal">
                <table className="admin-tabulka">
                  <thead>
                    <tr>
                      <th>Firma</th><th>Plocha</th><th>Cena</th><th>VS</th>
                      <th>Stav</th><th>Platí do</th><th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {objednavky.map(o => (
                      <tr key={o.id}>
                        <td><strong>{o.firma}</strong><br /><small>{o.email}</small></td>
                        <td>{o.plocha}<br /><small>{o.obdobi}</small></td>
                        <td>{o.cena_kc} Kč</td>
                        <td><code>{o.vs}</code></td>
                        <td>{STAVY_OBJEDNAVKY[o.stav] ?? o.stav}</td>
                        <td>{o.plati_do ?? '—'}</td>
                        <td>
                          {o.stav === 'ceka_na_platbu' && (
                            <button type="button" className="vyber-tlacitko" onClick={() => potvrd(o.vs)} disabled={pracuje}>
                              <BadgeCheck size={13} aria-hidden /> Platba došla
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {hlaska && <p className="admin-hlaska" role="status">{hlaska}</p>}
      </section>

      {/* ── audit — vidět bez přihlášení, tajemství v něm nejsou ── */}
      <AuditSekce nadpis={`Bezpečnost (revize ${AUDIT_REVIZE})`} ikona={<ShieldAlert size={16} aria-hidden />} polozky={BEZPECNOST} />
      <AuditSekce nadpis="Právo" ikona={<Scale size={16} aria-hidden />} polozky={PRAVO} />
      <AuditSekce nadpis="Peníze a provoz" ikona={<Wrench size={16} aria-hidden />} polozky={PROVOZ} />

      <section className="admin-sekce">
        <h2><ListChecks size={16} aria-hidden /> Co je postavené</h2>
        {INVENTURA.map(s => (
          <div key={s.oblast} className="admin-inventura">
            <h3>{s.oblast}</h3>
            <ul>{s.polozky.map(p => <li key={p}>{p}</li>)}</ul>
          </div>
        ))}
      </section>

      <section className="admin-sekce">
        <h2><Wrench size={16} aria-hidden /> Doporučení, co dál</h2>
        <ol className="admin-doporuceni">
          {DOPORUCENI.map(d => <li key={d}>{d}</li>)}
        </ol>
        <p className="admin-pozn">
          Jak je hlídané, že si AI nedělá, co chce: každá změna webu jde přes
          Git a nasadí se jen z větve přes CI — s ochranou větve (viz
          Bezpečnost) nic nedoputuje do produkce bez vašeho schválení. Admin
          token zná jen váš správce hesel; AI k němu ani k databázi objednávek
          nemá přístup.
        </p>
      </section>
    </div>
  )
}
