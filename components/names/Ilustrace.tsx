// Vlastní ilustrace, ne ikony.
//
// Ikonka z knihovny je čára — na rozcestníku, kde se člověk rozhoduje mezi
// „miminko" a „zvíře", nese nulovou emoci a všechny volby vypadají stejně.
// Barevný obrázek rozhodne za půl vteřiny.
//
// Proč kreslené SVG a ne fotky:
//
// - **Průhledné pozadí** doopravdy, ne bílý čtverec na krémovém papíru.
// - **Žádný externí požadavek.** Web zatím nedělá jediný a přísná CSP by
//   obrázek z cizí domény stejně zablokovala.
// - **Ostré na každém displeji** a v součtu lehčí než jedna fotka.
// - **Vlastní práce**, takže u nich není co řešit s licencemi.
//
// Objem dělají vrstvené přechody a měkký stín, ne obrysová čára. Proto
// působí plasticky, i když je to plochá grafika.

interface Props {
  /** velikost v px; ilustrace je čtvercová */
  velikost?: number
  className?: string
}

/** Společné: bez popisku, protože význam nese text vedle. */
const spolecne = (velikost: number, className?: string) => ({
  width: velikost,
  height: velikost,
  viewBox: '0 0 120 120',
  role: 'presentation' as const,
  'aria-hidden': true,
  className: ['ilustrace', className].filter(Boolean).join(' '),
})

export function Stene({ velikost = 96, className }: Props) {
  return (
    <svg {...spolecne(velikost, className)}>
      <defs>
        <radialGradient id="st-srst" cx="38%" cy="30%" r="78%">
          <stop offset="0%" stopColor="#f6d3a8" />
          <stop offset="55%" stopColor="#e2ac74" />
          <stop offset="100%" stopColor="#c98a52" />
        </radialGradient>
        <linearGradient id="st-ucho" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#a9683a" />
          <stop offset="100%" stopColor="#8a5029" />
        </linearGradient>
        <radialGradient id="st-cenich" cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#5d4636" />
          <stop offset="100%" stopColor="#2f231b" />
        </radialGradient>
      </defs>

      {/* stín na zemi — drží ilustraci „na podlaze" */}
      <ellipse cx="60" cy="106" rx="30" ry="6" fill="#2b2723" opacity=".13" />

      {/* uši za hlavou */}
      <path d="M27 44c-7 6-9 22-3 32 6 9 15 6 17-3 2-10 0-24-4-29z" fill="url(#st-ucho)" />
      <path d="M93 44c7 6 9 22 3 32-6 9-15 6-17-3-2-10 0-24 4-29z" fill="url(#st-ucho)" />

      {/* hlava */}
      <ellipse cx="60" cy="60" rx="34" ry="31" fill="url(#st-srst)" />
      {/* světlo shora */}
      <ellipse cx="52" cy="44" rx="20" ry="12" fill="#fff" opacity=".22" />

      {/* čenichová část */}
      <ellipse cx="60" cy="74" rx="20" ry="14" fill="#f9e3c6" />
      <ellipse cx="60" cy="70" rx="7.5" ry="6" fill="url(#st-cenich)" />
      <ellipse cx="57.5" cy="68" rx="2.4" ry="1.6" fill="#fff" opacity=".55" />
      <path d="M60 76v5m0 0c-2.5 3.5-8 3-8-1m8 1c2.5 3.5 8 3 8-1" stroke="#8a6b52" strokeWidth="2.2" fill="none" strokeLinecap="round" />

      {/* oči */}
      <ellipse cx="46" cy="55" rx="5.4" ry="6" fill="#2f231b" />
      <ellipse cx="74" cy="55" rx="5.4" ry="6" fill="#2f231b" />
      <circle cx="44.4" cy="52.6" r="2" fill="#fff" opacity=".9" />
      <circle cx="72.4" cy="52.6" r="2" fill="#fff" opacity=".9" />

      {/* obojek */}
      <path d="M34 84c8 6 44 6 52 0" stroke="#d97757" strokeWidth="7" fill="none" strokeLinecap="round" />
      <circle cx="60" cy="90" r="5" fill="#f0c34e" />
      <circle cx="58.4" cy="88.4" r="1.6" fill="#fff" opacity=".7" />
    </svg>
  )
}

export function Kotatko({ velikost = 96, className }: Props) {
  return (
    <svg {...spolecne(velikost, className)}>
      <defs>
        <radialGradient id="ko-srst" cx="38%" cy="28%" r="78%">
          <stop offset="0%" stopColor="#e7e2f4" />
          <stop offset="55%" stopColor="#c8bfe0" />
          <stop offset="100%" stopColor="#a396c6" />
        </radialGradient>
      </defs>

      <ellipse cx="60" cy="106" rx="28" ry="6" fill="#2b2723" opacity=".13" />

      {/* uši */}
      <path d="M32 40l-4-22 22 11z" fill="#b3a6d3" />
      <path d="M88 40l4-22-22 11z" fill="#b3a6d3" />
      <path d="M34 38l-2.5-13 13 6.5z" fill="#f3c6d4" />
      <path d="M86 38l2.5-13-13 6.5z" fill="#f3c6d4" />

      {/* hlava */}
      <ellipse cx="60" cy="62" rx="33" ry="30" fill="url(#ko-srst)" />
      <ellipse cx="51" cy="46" rx="19" ry="11" fill="#fff" opacity=".28" />

      {/* oči — kočka má mandle, ne kolečka */}
      <path d="M40 58c3-5 9-5 12 0-3 5-9 5-12 0z" fill="#4a7c59" />
      <path d="M68 58c3-5 9-5 12 0-3 5-9 5-12 0z" fill="#4a7c59" />
      <ellipse cx="46" cy="58" rx="1.7" ry="4" fill="#221c17" />
      <ellipse cx="74" cy="58" rx="1.7" ry="4" fill="#221c17" />
      <circle cx="44.6" cy="56" r="1.4" fill="#fff" opacity=".85" />
      <circle cx="72.6" cy="56" r="1.4" fill="#fff" opacity=".85" />

      {/* čumáček a pusa */}
      <path d="M56.5 70h7l-3.5 4z" fill="#e2879d" />
      <path d="M60 74v3m0 0c-2 3-6.5 2.6-6.5-.8m6.5.8c2 3 6.5 2.6 6.5-.8" stroke="#7b6f92" strokeWidth="2" fill="none" strokeLinecap="round" />

      {/* vousy */}
      <g stroke="#8d81a8" strokeWidth="1.6" strokeLinecap="round" opacity=".85">
        <path d="M50 71l-16-3M50 75l-15 4M70 71l16-3M70 75l15 4" />
      </g>
    </svg>
  )
}

export function Miminko({ velikost = 96, className }: Props) {
  return (
    <svg {...spolecne(velikost, className)}>
      <defs>
        <radialGradient id="mi-plet" cx="38%" cy="30%" r="78%">
          <stop offset="0%" stopColor="#ffe6d4" />
          <stop offset="60%" stopColor="#f7cdb1" />
          <stop offset="100%" stopColor="#e2ab8c" />
        </radialGradient>
        <linearGradient id="mi-cepice" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#8fbfe0" />
          <stop offset="100%" stopColor="#5f95bd" />
        </linearGradient>
      </defs>

      <ellipse cx="60" cy="106" rx="26" ry="6" fill="#2b2723" opacity=".13" />

      {/* hlava */}
      <ellipse cx="60" cy="64" rx="31" ry="29" fill="url(#mi-plet)" />
      <ellipse cx="52" cy="50" rx="17" ry="10" fill="#fff" opacity=".3" />

      {/* čepička s bambulí */}
      <path d="M29 56c2-19 15-29 31-29s29 10 31 29c-10-6-21-9-31-9s-21 3-31 9z" fill="url(#mi-cepice)" />
      <circle cx="60" cy="24" r="7" fill="#bcd9ee" />
      <circle cx="57.6" cy="21.6" r="2.4" fill="#fff" opacity=".65" />

      {/* obličej */}
      <path d="M45 62c1.6-2.6 5.4-2.6 7 0" stroke="#4a3a30" strokeWidth="2.6" fill="none" strokeLinecap="round" />
      <path d="M68 62c1.6-2.6 5.4-2.6 7 0" stroke="#4a3a30" strokeWidth="2.6" fill="none" strokeLinecap="round" />
      <ellipse cx="41" cy="72" rx="5.5" ry="3.6" fill="#f0a7a0" opacity=".7" />
      <ellipse cx="79" cy="72" rx="5.5" ry="3.6" fill="#f0a7a0" opacity=".7" />
      <path d="M53 76c3.4 4 10.6 4 14 0" stroke="#c96f68" strokeWidth="2.6" fill="none" strokeLinecap="round" />

      {/* ručička mává */}
      <ellipse cx="26" cy="88" rx="8" ry="7" fill="url(#mi-plet)" />
      <path d="M22 84c-3-3-3-7 0-8" stroke="#e2ab8c" strokeWidth="2.4" fill="none" strokeLinecap="round" />
    </svg>
  )
}

/**
 * Rodina — hlavní obrázek úvodní stránky.
 *
 * Nese celý slib webu: nehledáme jméno do vzduchoprázdna, hledáme jméno,
 * které sedí k lidem, co už doma jsou. Proto jsou v obrázku všichni
 * najednou a miminko je uprostřed a nejvýš.
 */
export function Rodina({ velikost = 160, className }: Props) {
  return (
    <svg
      width={velikost}
      height={velikost * 0.72}
      viewBox="0 0 220 158"
      role="presentation"
      aria-hidden
      className={['ilustrace', className].filter(Boolean).join(' ')}
    >
      <defs>
        <radialGradient id="ro-plet" cx="38%" cy="30%" r="78%">
          <stop offset="0%" stopColor="#ffe6d4" />
          <stop offset="100%" stopColor="#eab894" />
        </radialGradient>
        <linearGradient id="ro-maminka" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f0a8b8" />
          <stop offset="100%" stopColor="#d97a92" />
        </linearGradient>
        <linearGradient id="ro-tatinek" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#8fbfe0" />
          <stop offset="100%" stopColor="#5b8fb5" />
        </linearGradient>
        <linearGradient id="ro-dite" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f6d99a" />
          <stop offset="100%" stopColor="#e0b45f" />
        </linearGradient>
      </defs>

      <ellipse cx="110" cy="146" rx="86" ry="8" fill="#2b2723" opacity=".1" />

      {/* maminka */}
      <path d="M40 142c0-20 10-32 24-32s24 12 24 32z" fill="url(#ro-maminka)" />
      <circle cx="64" cy="92" r="17" fill="url(#ro-plet)" />
      <path d="M47 90c0-13 8-20 17-20s17 7 17 20c-4-6-10-9-17-9s-13 3-17 9z" fill="#8a5b3e" />
      <circle cx="58" cy="92" r="1.9" fill="#3d2f26" />
      <circle cx="70" cy="92" r="1.9" fill="#3d2f26" />
      <path d="M59 99c2.6 2.6 7.4 2.6 10 0" stroke="#b9695f" strokeWidth="2" fill="none" strokeLinecap="round" />

      {/* tatínek */}
      <path d="M132 142c0-20 10-32 24-32s24 12 24 32z" fill="url(#ro-tatinek)" />
      <circle cx="156" cy="92" r="17" fill="url(#ro-plet)" />
      <path d="M139 88c1-11 8-17 17-17s16 6 17 17c-5-5-10-7-17-7s-12 2-17 7z" fill="#4b3a2c" />
      <circle cx="150" cy="92" r="1.9" fill="#3d2f26" />
      <circle cx="162" cy="92" r="1.9" fill="#3d2f26" />
      <path d="M151 99c2.6 2.6 7.4 2.6 10 0" stroke="#b9695f" strokeWidth="2" fill="none" strokeLinecap="round" />

      {/* miminko uprostřed a nejvýš — je to o něm */}
      <path d="M88 142c0-15 8-24 22-24s22 9 22 24z" fill="url(#ro-dite)" />
      <circle cx="110" cy="102" r="15" fill="url(#ro-plet)" />
      <path d="M96 98c1-10 7-15 14-15s13 5 14 15c-4-4-9-6-14-6s-10 2-14 6z" fill="#c98f4e" />
      <circle cx="105" cy="103" r="1.8" fill="#3d2f26" />
      <circle cx="115" cy="103" r="1.8" fill="#3d2f26" />
      <path d="M105.5 109c2.4 2.4 6.6 2.4 9 0" stroke="#b9695f" strokeWidth="1.9" fill="none" strokeLinecap="round" />
      <ellipse cx="99" cy="107" rx="3.4" ry="2.2" fill="#f0a7a0" opacity=".65" />
      <ellipse cx="121" cy="107" rx="3.4" ry="2.2" fill="#f0a7a0" opacity=".65" />

      {/* pejsek u nohou — patří do rodiny stejně jako ostatní */}
      <ellipse cx="196" cy="134" rx="17" ry="12" fill="#e2ac74" />
      <circle cx="196" cy="118" r="11" fill="#f0c495" />
      <path d="M187 112c-4 2-5 9-2 12 3 2 6 0 6-4z" fill="#a9683a" />
      <path d="M205 112c4 2 5 9 2 12-3 2-6 0-6-4z" fill="#a9683a" />
      <circle cx="192" cy="118" r="1.7" fill="#3d2f26" />
      <circle cx="200" cy="118" r="1.7" fill="#3d2f26" />
      <ellipse cx="196" cy="123" rx="3" ry="2.2" fill="#3d2f26" />

      {/* srdíčko nad rodinou */}
      <path
        d="M110 66c-9-8-16-13-16-20 0-4 3-7 7-7 3 0 6 2 9 6 3-4 6-6 9-6 4 0 7 3 7 7 0 7-7 12-16 20z"
        fill="#d97757"
        opacity=".9"
      />
    </svg>
  )
}

/**
 * Drobné značky do nadpisů sekcí.
 *
 * Velká ilustrace by se ve 20 px slila do skvrny, takže tyhle mají jen
 * pár tvarů — ale pořád jsou barevné a plné, ne obrysové. O to jde:
 * na první pohled musí být poznat, jestli sekce patří dětem, nebo zvířatům.
 */
export function ZnakDite({ velikost = 20, className }: Props) {
  return (
    <svg width={velikost} height={velikost} viewBox="0 0 24 24" role="presentation" aria-hidden className={className}>
      <circle cx="12" cy="13" r="8.5" fill="#f7cdb1" />
      <path d="M3.5 11C4 5.5 7.5 3 12 3s8 2.5 8.5 8c-2.4-2-5.2-3-8.5-3s-6.1 1-8.5 3z" fill="#8fbfe0" />
      <circle cx="12" cy="2.6" r="2" fill="#bcd9ee" />
      <circle cx="9" cy="13" r="1.3" fill="#4a3a30" />
      <circle cx="15" cy="13" r="1.3" fill="#4a3a30" />
      <path d="M9.6 16.5c1.4 1.4 3.4 1.4 4.8 0" stroke="#c96f68" strokeWidth="1.5" fill="none" strokeLinecap="round" />
    </svg>
  )
}

export function ZnakZvire({ velikost = 20, className }: Props) {
  return (
    <svg width={velikost} height={velikost} viewBox="0 0 24 24" role="presentation" aria-hidden className={className}>
      <path d="M4.5 8c-1.6 1.4-2 5.4-.6 7.6 1.4 2 3.4 1.2 3.8-.8z" fill="#a9683a" />
      <path d="M19.5 8c1.6 1.4 2 5.4.6 7.6-1.4 2-3.4 1.2-3.8-.8z" fill="#a9683a" />
      <ellipse cx="12" cy="13" rx="8" ry="7.4" fill="#e2ac74" />
      <ellipse cx="12" cy="16.4" rx="4.6" ry="3.2" fill="#f9e3c6" />
      <ellipse cx="12" cy="15.2" rx="1.8" ry="1.4" fill="#3d2f26" />
      <circle cx="9.2" cy="11.4" r="1.3" fill="#2f231b" />
      <circle cx="14.8" cy="11.4" r="1.3" fill="#2f231b" />
    </svg>
  )
}
