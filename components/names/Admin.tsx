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
  BadgeCheck, Ban, Banknote, Brush, Check, Eye, KeyRound, ListChecks, LogOut,
  RefreshCw, Scale, ShieldAlert, ToggleLeft, Wrench,
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
  /** jak platba dorazila — prázdné u převodu na účet */
  zpusob_platby: string | null
  zaplaceno_kc: number | null
  // ── kreativa, tedy to, co se schvaluje ──
  znacka: string | null
  nadpis: string | null
  text: string | null
  cta: string | null
  odkaz: string | null
  ikona: string | null
  /** plná adresa loga, ne klíč v úložišti — dá se rovnou ukázat */
  logo_klic: string | null
  /** 1 = návštěvník ji vidí; 0 = čeká na schválení nebo je zamítnutá */
  schvaleno: number | null
  zamitnuto_duvod: string | null
}

const STAVY_OBJEDNAVKY: Record<string, string> = {
  ceka_na_platbu: 'čeká na platbu',
  aktivni: 'aktivní',
  vyprsela: 'vypršelá',
  zrusena: 'zrušená',
}

/** Objednávka, u které je vůbec co schvalovat — kreativa existuje a žije. */
const maZivouKreativu = (o: Objednavka) =>
  !!o.nadpis && (o.stav === 'aktivni' || o.stav === 'ceka_na_platbu')

/**
 * Náhled kreativy tak, jak ji uvidí návštěvník.
 *
 * Schvalovat text z tabulky by znamenalo schvalovat něco jiného, než co
 * půjde na web. Proto tady stojí celá karta — značka, nadpis, text, tlačítko
 * i logo — a k tomu cílový odkaz, na který je potřeba se podívat nejvíc:
 * text bývá v pořádku a odkaz vede jinam.
 */
function NahledKreativy({ o }: { o: Objednavka }) {
  return (
    <div className="admin-inzerat-nahled">
      <div className="admin-inzerat-hlava">
        {o.logo_klic
          // eslint-disable-next-line @next/next/no-img-element
          ? <img src={o.logo_klic} alt="" width={20} height={20} />
          : <span className="admin-inzerat-ikona" aria-hidden>✦</span>}
        <strong>{o.znacka ?? '—'}</strong>
        <span className="admin-inzerat-stitek">sponzorováno</span>
      </div>
      <p className="admin-inzerat-nadpis">{o.nadpis}</p>
      <p className="admin-inzerat-text">{o.text}</p>
      <p className="admin-inzerat-cta">{o.cta} →</p>
      {o.odkaz && (
        <p className="admin-inzerat-odkaz">
          Vede na:{' '}
          {/* Cizí odkaz otevíráme v novém okně a bez předání šťávy:
              noopener kvůli přístupu k naší stránce, nofollow proto,
              že zaplacený odkaz nesmí vypadat jako doporučení. */}
          <a href={o.odkaz} target="_blank" rel="noopener noreferrer nofollow">{o.odkaz}</a>
        </p>
      )}
    </div>
  )
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
  /** Rozepsané důvody zamítnutí podle id objednávky. */
  const [duvody, setDuvody] = useState<Record<string, string>>({})

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

  const schval = async (id: string) => {
    setPracuje(true)
    setHlaska(null)
    try {
      await zavolej('/api/admin/schvalit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      setHlaska('Schváleno — inzerát se na webu objeví do pěti minut.')
      setDuvody(d => { const n = { ...d }; delete n[id]; return n })
      await nactiData(token)
    } catch {
      setHlaska('Schválení se nepovedlo. Zkuste to prosím znovu.')
    } finally {
      setPracuje(false)
    }
  }

  const zamitni = async (id: string) => {
    const duvod = (duvody[id] ?? '').trim()
    // Důvod je povinný: inzerent podle něj text opraví. Bez něj by se jen
    // rozjelo kolečko e-mailů „a co je na tom špatně".
    if (duvod.length < 3) {
      setHlaska('Napište prosím krátký důvod zamítnutí — inzerent ho uvidí.')
      return
    }
    setPracuje(true)
    setHlaska(null)
    try {
      await zavolej('/api/admin/zamitnout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, duvod }),
      })
      setHlaska('Zamítnuto. Inzerent uvidí důvod ve svém účtu.')
      setDuvody(d => { const n = { ...d }; delete n[id]; return n })
      await nactiData(token)
    } catch {
      setHlaska('Zamítnutí se nepovedlo. Zkuste to prosím znovu.')
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

  // Zaplacení ≠ zveřejnění: dokud kreativa nemá schvaleno = 1, návštěvník
  // ji nevidí, i když kampaň běží a je zaplacená.
  const keSchvaleni = useMemo(
    () => (objednavky ?? []).filter(o => maZivouKreativu(o) && o.schvaleno !== 1),
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

            <h3><Eye size={15} aria-hidden /> Čeká na schválení</h3>
            <p className="admin-pozn">
              Zaplacená kampaň drží plochu, ale na webu se neukáže, dokud
              kreativu neschválíte. Přečtěte si text a hlavně{' '}
              <strong>klikněte na cílový odkaz</strong> — text bývá v pořádku
              a odkaz vede jinam. Každá pozdější úprava textu nebo loga vrátí
              inzerát sem.
            </p>

            {objednavky && keSchvaleni.length === 0 && (
              <p className="admin-pozn">Nic nečeká — všechny živé kreativy jsou schválené.</p>
            )}

            {keSchvaleni.length > 0 && (
              <ul className="admin-inzerat-seznam">
                {keSchvaleni.map(o => (
                  <li key={o.id} className="admin-inzerat-polozka">
                    <div className="admin-inzerat-udaje">
                      <strong>{o.firma}</strong>
                      <p>
                        {o.plocha} · {o.obdobi} · {o.cena_kc} Kč ·{' '}
                        {STAVY_OBJEDNAVKY[o.stav] ?? o.stav}
                      </p>
                      {o.zamitnuto_duvod && (
                        <p className="admin-inzerat-zamitnuto">
                          Zamítnuto: {o.zamitnuto_duvod} — čeká, až inzerent text opraví.
                        </p>
                      )}
                    </div>

                    <NahledKreativy o={o} />

                    <div className="admin-inzerat-akce">
                      <button
                        type="button"
                        className="vyber-tlacitko je-hlavni"
                        onClick={() => schval(o.id)}
                        disabled={pracuje}
                      >
                        <Check size={13} aria-hidden /> Schválit
                      </button>
                      <input
                        type="text"
                        className="admin-inzerat-duvod"
                        placeholder="důvod zamítnutí — inzerent ho uvidí"
                        maxLength={300}
                        value={duvody[o.id] ?? ''}
                        onChange={e => setDuvody(d => ({ ...d, [o.id]: e.target.value }))}
                      />
                      <button
                        type="button"
                        className="vyber-tlacitko"
                        onClick={() => zamitni(o.id)}
                        disabled={pracuje}
                      >
                        <Ban size={13} aria-hidden /> Zamítnout
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}

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
                      <th>Stav</th><th>Kreativa</th><th>Platí do</th><th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {objednavky.map(o => (
                      <tr key={o.id}>
                        <td><strong>{o.firma}</strong><br /><small>{o.email}</small></td>
                        <td>{o.plocha}<br /><small>{o.obdobi}</small></td>
                        <td>
                          {o.cena_kc} Kč
                          {/* U platby přes bránu je vidět, čím a kolik přišlo —
                              u převodu zůstává prázdno. */}
                          {o.zpusob_platby && <><br /><small>{o.zpusob_platby}</small></>}
                        </td>
                        <td><code>{o.vs}</code></td>
                        <td>{STAVY_OBJEDNAVKY[o.stav] ?? o.stav}</td>
                        <td>
                          {/* I u běžící kampaně musí být na první pohled vidět,
                              jestli je opravdu venku, nebo jen zaplacená. */}
                          {!o.nadpis
                            ? '—'
                            : o.schvaleno === 1
                              ? <span className="admin-inzerat-znamka je-schvalena">schválená</span>
                              : o.zamitnuto_duvod
                                ? <span className="admin-inzerat-znamka je-zamitnuta" title={o.zamitnuto_duvod}>zamítnutá</span>
                                : <span className="admin-inzerat-znamka je-ceka">čeká na schválení</span>}
                        </td>
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
