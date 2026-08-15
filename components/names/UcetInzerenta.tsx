'use client'

// Účet inzerenta.
//
// Účet záměrně nemá heslo. Při rezervaci dostane firma přístupový klíč —
// ten je zároveň jejím účtem. Nezakládáme jí tím profil, nesbíráme o ní nic
// navíc a nemusíme řešit obnovu hesla; klíč se dá uložit do prohlížeče
// a příště se načte sám.
//
// Přes účet firma vidí stav kampaně, pokyny k platbě a může upravit text
// i odkaz — přesně jak slibují podmínky. Plocha ani délka se měnit nedají,
// tím by se obcházel ceník.

import { useCallback, useEffect, useState } from 'react'
import { KeyRound, Loader2, LogOut, Save, Upload } from 'lucide-react'
import { ADRESA_REKLAM } from '@/lib/names/reklamniServer'
import { MEZE } from '@/shared/reklama'

/** Klíč si pamatujeme v prohlížeči, ať ho firma nemusí opisovat pokaždé. */
const ULOZISTE = 'svetjmen-inzerent-klic'

interface Inzerat {
  znacka: string
  nadpis: string
  text: string
  cta: string
  odkaz: string
  logo: string | null
}

interface Stav {
  stav: string
  plocha: string
  obdobi: string
  cena_kc: number
  vs: string
  plati_od: string | null
  plati_do: string | null
  /** 1 = kreativa je schválená a na webu ji lidé vidí */
  schvaleno?: number
  zamitnuto_duvod?: string | null
  platba?: { ucet: string; vs: string; prijemce: string; zprava: string }
  kontakt?: string
  inzerat: Inzerat | null
}

const STAVY: Record<string, { text: string; trida: string }> = {
  ceka_na_platbu: { text: 'Čeká na platbu', trida: 'je-ceka' },
  aktivni: { text: 'Kampaň běží', trida: 'je-bezi' },
  vyprsela: { text: 'Kampaň skončila', trida: 'je-konec' },
  zrusena: { text: 'Zrušeno', trida: 'je-konec' },
}

/**
 * Co inzerentovi opravdu říct.
 *
 * Zaplacená kampaň ještě není zveřejněná kampaň — kreativu čte majitelka
 * a teprve pak jde na web. Kdyby tady stálo „Kampaň běží", firma by marně
 * hledala svůj inzerát a hledala chybu u sebe. Proto stav schválení
 * přebíjí stav objednávky.
 */
function popisStavuKampane(s: Stav): { text: string; trida: string } {
  const zaklad = STAVY[s.stav] ?? { text: s.stav, trida: '' }
  if (s.stav !== 'aktivni') return zaklad
  if (s.schvaleno === 1) return { text: 'Kampaň běží', trida: 'je-bezi' }
  if (s.zamitnuto_duvod) return { text: 'Kreativa zamítnuta', trida: 'je-ceka' }
  return { text: 'Zaplaceno, čeká na schválení', trida: 'je-ceka' }
}

const korun = (c: number) => c.toLocaleString('cs-CZ')

export default function UcetInzerenta() {
  const [klic, setKlic] = useState('')
  const [prihlasen, setPrihlasen] = useState<string | null>(null)
  const [stav, setStav] = useState<Stav | null>(null)
  const [nacita, setNacita] = useState(false)
  const [hlaska, setHlaska] = useState<{ text: string; chyba: boolean } | null>(null)
  const [formular, setFormular] = useState<Inzerat | null>(null)
  const [uklada, setUklada] = useState(false)

  const nacti = useCallback(async (k: string) => {
    setNacita(true)
    setHlaska(null)
    try {
      const o = await fetch(`${ADRESA_REKLAM}/api/objednavka/${encodeURIComponent(k)}`, { cache: 'no-store' })
      if (!o.ok) {
        setHlaska({ text: 'Tenhle klíč neznáme. Zkontrolujte ho prosím.', chyba: true })
        setNacita(false)
        return false
      }
      const d = await o.json() as Stav
      setStav(d)
      setFormular(d.inzerat)
      setPrihlasen(k)
      try { window.localStorage.setItem(ULOZISTE, k) } catch { /* soukromý režim */ }
      setNacita(false)
      return true
    } catch {
      setHlaska({ text: 'Služba se teď neozývá. Zkuste to prosím za chvíli.', chyba: true })
      setNacita(false)
      return false
    }
  }, [])

  // Uložený klíč načteme sami — přihlašování jednou stačí.
  useEffect(() => {
    if (!ADRESA_REKLAM) return
    let ulozeny: string | null = null
    try { ulozeny = window.localStorage.getItem(ULOZISTE) } catch { /* soukromý režim */ }
    if (ulozeny) void nacti(ulozeny)
  }, [nacti])

  const odhlas = () => {
    try { window.localStorage.removeItem(ULOZISTE) } catch { /* soukromý režim */ }
    setPrihlasen(null)
    setStav(null)
    setFormular(null)
    setKlic('')
  }

  const uloz = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formular || !prihlasen) return
    setUklada(true)
    setHlaska(null)
    try {
      const o = await fetch(`${ADRESA_REKLAM}/api/objednavka/${encodeURIComponent(prihlasen)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formular),
      })
      const d = await o.json() as { chyba?: string }
      if (o.ok) {
        // Úprava shazuje schválení — slibovat „za pět minut je to venku"
        // by byla lež. Stav načteme znovu (a až potom napíšeme hlášku,
        // protože `nacti` starou hlášku maže), ať se rovnou ukáže
        // „čeká na schválení".
        await nacti(prihlasen)
        setHlaska({
          text: 'Uloženo. Upravenou kreativu ještě projdeme — na webu se objeví po schválení.',
          chyba: false,
        })
      } else {
        setHlaska({ text: d.chyba ?? 'Uložit se to nepovedlo.', chyba: true })
      }
    } catch {
      setHlaska({ text: 'Služba se teď neozývá. Zkuste to prosím za chvíli.', chyba: true })
    }
    setUklada(false)
  }

  const nahrajLogo = async (soubor: File) => {
    if (!prihlasen) return
    if (soubor.size > MEZE.logo) {
      setHlaska({ text: 'Logo je větší než 200 kB. Zmenšete ho prosím.', chyba: true })
      return
    }
    setHlaska(null)
    try {
      const o = await fetch(`${ADRESA_REKLAM}/api/objednavka/${encodeURIComponent(prihlasen)}/logo`, {
        method: 'POST',
        headers: { 'Content-Type': soubor.type },
        body: soubor,
      })
      const d = await o.json() as { chyba?: string }
      if (o.ok) {
        setHlaska({ text: 'Logo je nahrané.', chyba: false })
        void nacti(prihlasen)
      } else {
        setHlaska({ text: d.chyba ?? 'Logo se nepodařilo nahrát.', chyba: true })
      }
    } catch {
      setHlaska({ text: 'Služba se teď neozývá.', chyba: true })
    }
  }

  if (!ADRESA_REKLAM) {
    return (
      <section className="ucet">
        <h2>Účet inzerenta</h2>
        <p className="ucet-popis">Reklamní služba zatím neběží. Ozvěte se nám e-mailem.</p>
      </section>
    )
  }

  // ── přihlášení ─────────────────────────────────────────────────────────
  if (!prihlasen || !stav) {
    return (
      <section className="ucet">
        <h2>Účet inzerenta</h2>
        <p className="ucet-popis">
          Účet zakládáme automaticky při rezervaci — dostanete přístupový klíč.
          Žádné heslo si vymýšlet nemusíte a nic dalšího o vás neevidujeme.
          Klíčem se dostanete ke stavu kampaně, pokynům k platbě a k úpravám textu.
        </p>
        <form
          className="ucet-prihlaseni"
          onSubmit={e => { e.preventDefault(); if (klic.trim()) void nacti(klic.trim()) }}
        >
          <label className="ucet-pole">
            <span>Přístupový klíč</span>
            <input
              value={klic}
              onChange={e => setKlic(e.target.value)}
              placeholder="např. 3optvmmivmpavtg2mjbyf6wr"
              autoComplete="off"
              spellCheck={false}
            />
          </label>
          <button type="submit" className="ucet-tlacitko" disabled={!klic.trim() || nacita}>
            {nacita ? <Loader2 size={15} className="ucet-tocitko" aria-hidden /> : <KeyRound size={15} aria-hidden />}
            Otevřít účet
          </button>
        </form>
        {hlaska && <p className={`ucet-hlaska ${hlaska.chyba ? 'je-chyba' : ''}`}>{hlaska.text}</p>}
        <p className="ucet-pozn">
          Klíč jste dostali hned po rezervaci. Ztratil se? Napište nám a pošleme ho znovu.
        </p>
      </section>
    )
  }

  // ── přihlášený inzerent ────────────────────────────────────────────────
  const popisStavu = popisStavuKampane(stav)

  return (
    <section className="ucet">
      <div className="ucet-hlava">
        <h2>Vaše kampaň</h2>
        <button type="button" className="ucet-odhlasit" onClick={odhlas}>
          <LogOut size={14} aria-hidden /> Odhlásit
        </button>
      </div>

      <dl className="ucet-prehled">
        <div><dt>Stav</dt><dd><span className={`ucet-stav ${popisStavu.trida}`}>{popisStavu.text}</span></dd></div>
        <div><dt>Plocha</dt><dd>{stav.plocha}</dd></div>
        <div><dt>Délka</dt><dd>{stav.obdobi}</dd></div>
        <div><dt>Cena</dt><dd>{korun(stav.cena_kc)} Kč bez DPH</dd></div>
        {stav.plati_od && <div><dt>Běží od</dt><dd>{stav.plati_od}</dd></div>}
        {stav.plati_do && <div><dt>Běží do</dt><dd>{stav.plati_do}</dd></div>}
      </dl>

      {/* Schvalování na rovinu. Firma potřebuje vědět, jestli čeká na nás,
          nebo jestli má něco opravit — a co přesně. */}
      {stav.stav === 'aktivni' && stav.schvaleno !== 1 && (
        <div className="ucet-platba">
          <h3>{stav.zamitnuto_duvod ? 'Kreativu jsme zamítli' : 'Kreativa čeká na schválení'}</h3>
          {stav.zamitnuto_duvod
            ? (
              <>
                <p><strong>Důvod:</strong> {stav.zamitnuto_duvod}</p>
                <p>
                  Upravte prosím text níž a uložte ho — kreativa se tím vrátí
                  ke schválení a po něm se sama objeví na webu. Zaplacené dny
                  vám tím nepropadají.
                </p>
              </>
            )
            : (
              <p>
                Kampaň máme zaplacenou a plocha je vaše. Než inzerát pustíme
                na web, projdeme ještě text a odkaz — obvykle do jednoho
                pracovního dne. Pak se zobrazí sám, nemusíte nic dělat.
              </p>
            )}
        </div>
      )}

      {stav.stav === 'ceka_na_platbu' && stav.platba && (
        <div className="ucet-platba">
          <h3>Pokyny k platbě</h3>
          <dl>
            <div><dt>Účet</dt><dd>{stav.platba.ucet}</dd></div>
            <div><dt>Variabilní symbol</dt><dd>{stav.platba.vs}</dd></div>
            <div><dt>Příjemce</dt><dd>{stav.platba.prijemce}</dd></div>
            <div><dt>Zpráva</dt><dd>{stav.platba.zprava}</dd></div>
          </dl>
          <p>Kampaň spustíme po připsání platby, nejpozději následující pracovní den.</p>
        </div>
      )}

      {formular && (
        <form className="ucet-formular" onSubmit={uloz}>
          <h3>Text inzerátu</h3>
          <p className="ucet-popis">
            Text i odkaz jde měnit i za běhu kampaně. Plocha a délka zůstávají —
            ty jsou součástí objednávky.
          </p>

          <label className="ucet-pole">
            <span>Značka <em>{formular.znacka.length}/{MEZE.znacka}</em></span>
            <input value={formular.znacka} maxLength={MEZE.znacka}
              onChange={e => setFormular({ ...formular, znacka: e.target.value })} />
          </label>
          <label className="ucet-pole">
            <span>Nadpis <em>{formular.nadpis.length}/{MEZE.nadpis}</em></span>
            <input value={formular.nadpis} maxLength={MEZE.nadpis}
              onChange={e => setFormular({ ...formular, nadpis: e.target.value })} />
          </label>
          <label className="ucet-pole">
            <span>Text <em>{formular.text.length}/{MEZE.text}</em></span>
            <textarea rows={3} value={formular.text} maxLength={MEZE.text}
              onChange={e => setFormular({ ...formular, text: e.target.value })} />
          </label>
          <div className="ucet-dvojice">
            <label className="ucet-pole">
              <span>Tlačítko <em>{formular.cta.length}/{MEZE.cta}</em></span>
              <input value={formular.cta} maxLength={MEZE.cta}
                onChange={e => setFormular({ ...formular, cta: e.target.value })} />
            </label>
            <label className="ucet-pole">
              <span>Odkaz</span>
              <input type="url" value={formular.odkaz} maxLength={MEZE.odkaz}
                onChange={e => setFormular({ ...formular, odkaz: e.target.value })} />
            </label>
          </div>

          <label className="ucet-pole">
            <span>Logo <em>PNG, JPG nebo WEBP do 200 kB</em></span>
            <span className="ucet-logo">
              {formular.logo && <img src={formular.logo} alt="" width={32} height={32} />}
              <span className="ucet-nahrat">
                <Upload size={14} aria-hidden /> Vybrat soubor
                <input type="file" accept="image/png,image/jpeg,image/webp"
                  onChange={e => { const f = e.target.files?.[0]; if (f) void nahrajLogo(f) }} />
              </span>
            </span>
          </label>

          <button type="submit" className="ucet-tlacitko" disabled={uklada}>
            {uklada ? <Loader2 size={15} className="ucet-tocitko" aria-hidden /> : <Save size={15} aria-hidden />}
            Uložit změny
          </button>
        </form>
      )}

      {hlaska && (
        <p className={`ucet-hlaska ${hlaska.chyba ? 'je-chyba' : ''}`} role="status">{hlaska.text}</p>
      )}
    </section>
  )
}
