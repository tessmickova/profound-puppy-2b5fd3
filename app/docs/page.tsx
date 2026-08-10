import type { Metadata } from 'next'
import { HuskyLogo } from '@/components/HuskyLogo'

export const metadata: Metadata = {
  title: 'Slovníček pojmů – AuroraDog',
  description: 'Vysvětlení pojmů kosmického počasí: KP index, Bz, sluneční vítr, CME, G-škála a další.',
}

export default function DocsPage() {
  return (
    <main className="min-h-screen bg-[#03080f] text-slate-100 font-head">
      {/* ── Aurora background ── */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_120%_40%_at_50%_-10%,rgba(0,200,120,0.06)_0%,transparent_70%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_30%_at_80%_10%,rgba(100,0,200,0.04)_0%,transparent_60%)]" />
      </div>

      {/* ── NAV ── */}
      <nav className="sticky top-0 z-50 bg-[#03080f]/90 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center gap-4">
          <a href="/aurora" className="flex items-center gap-2 no-underline">
            <HuskyLogo size={28} />
            <span className="font-display text-base font-black tracking-widest bg-linear-to-r from-aurora-green to-aurora-teal bg-clip-text text-transparent">
              AURORADOG
            </span>
          </a>
          <div className="flex gap-1 ml-4">
            <span className="px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide bg-aurora-teal/10 border border-aurora-teal/30 text-aurora-teal">
              📖 Slovníček
            </span>
            <a href="/admin" className="px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent transition-all">
              🔧 Admin
            </a>
          </div>
          <a href="/aurora" className="ml-auto text-xs font-mono text-slate-400 hover:text-aurora-teal transition-colors">
            ← Dashboard
          </a>
        </div>
      </nav>

      {/* ── CONTENT ── */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 py-12">
        <header className="mb-12">
          <h1 className="font-display text-3xl md:text-4xl font-black tracking-tight bg-linear-to-r from-aurora-green to-aurora-teal bg-clip-text text-transparent mb-3">
            Slovníček kosmického počasí
          </h1>
          <p className="text-slate-400 text-sm max-w-xl">
            Průvodce pro začátečníky — co znamenají čísla a pojmy, které na AuroraDog uvidíte.
          </p>
        </header>

        {/* TOC */}
        <div className="bg-[#04101e]/80 border border-white/8 rounded-2xl p-5 mb-12">
          <h2 className="text-xs font-mono uppercase tracking-[3px] text-aurora-purple/80 mb-3 flex items-center gap-3">
            Obsah <span className="flex-1 h-px bg-white/8" />
          </h2>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-sm">
            {TOC.map(item => (
              <li key={item.id}>
                <a href={`#${item.id}`} className="text-aurora-teal hover:text-aurora-green transition-colors">{item.icon} {item.title}</a>
              </li>
            ))}
          </ul>
        </div>

        {/* Sections */}
        <div className="space-y-8">
          <Section id="kp" icon="⚡" title="KP index (planetární geomagnetický index)">
            <p>
              KP index měří <strong>narušení magnetického pole Země</strong> v globálním měřítku.
              Škála je od 0 (klidno) do 9 (extrémní bouře). Aktualizuje se každou minutu na základě
              dat z magnetometrů po celém světě.
            </p>
            <InfoBox>
              <li><strong>KP 0–1:</strong> Klidné podmínky, žádná šance na záři v ČR</li>
              <li><strong>KP 2–3:</strong> Záře zachytitelná pouze fotoaparátem z tmavých míst</li>
              <li><strong>KP 4:</strong> Slabá záře na severním obzoru z tmavých míst ČR</li>
              <li><strong>KP 5–6:</strong> Záře viditelná pouhým okem, oblouk na obzoru</li>
              <li><strong>KP 7+:</strong> Silná záře, může pokrýt velkou část oblohy</li>
              <li><strong>KP 8–9:</strong> Extrémní bouře — tančící záře i z měst (velmi vzácné!)</li>
            </InfoBox>
            <p className="text-sm text-slate-400">
              Zdroj: <Ext href="https://www.swpc.noaa.gov/products/planetary-k-index">NOAA SWPC</Ext> —
              aktualizace každých 60 sekund.
            </p>
          </Section>

          <Section id="bz" icon="🧲" title="Bz složka (interplanetární magnetické pole)">
            <p>
              Bz je <strong>vertikální složka magnetického pole slunečního větru</strong> měřená sondami
              před Zemí (DSCOVR/ACE na bodě L1). Udává se v nanoteslách (nT).
            </p>
            <InfoBox>
              <li><strong>Bz kladné (severní):</strong> Magnetosféra Země se „uzavírá" — záře se netlačí dovnitř</li>
              <li><strong>Bz záporné (jižní):</strong> Magnetosféra se „otevírá" — sluneční vítr proniká, záře zesiluje!</li>
              <li><strong>Bz &lt; -5 nT:</strong> Příznivé podmínky pro záři</li>
              <li><strong>Bz &lt; -10 nT:</strong> Velmi příznivé — vysoká šance na záři v ČR</li>
              <li><strong>Bz &lt; -20 nT:</strong> Extrémní podmínky — záře téměř jistá</li>
            </InfoBox>
            <p className="text-sm text-slate-400">
              Klíčový ukazatel: záporné Bz je <em>důležitější</em> než samotný KP, protože předchází
              nárůstu geomagnetické aktivity o 30–60 minut.
            </p>
          </Section>

          <Section id="solar-wind" icon="💨" title="Sluneční vítr">
            <p>
              Proud nabitých částic (elektronů a protonů) proudících od Slunce rychlostí
              300–800+ km/s. Měříme jeho <strong>rychlost</strong>, <strong>hustotu</strong> a <strong>magnetické pole</strong>.
            </p>
            <InfoBox>
              <li><strong>Rychlost &lt; 400 km/s:</strong> Normální (pomalý) sluneční vítr</li>
              <li><strong>400–500 km/s:</strong> Mírně zvýšená — sledovat vývoj</li>
              <li><strong>500–700 km/s:</strong> Rychlý vítr — může vyvolat geomagnetickou aktivitu</li>
              <li><strong>&gt; 700 km/s:</strong> Velmi rychlý — vysoká šance na bouři</li>
              <li><strong>Hustota &gt; 10/cm³:</strong> Zvýšená — zesiluje dopad na magnetosféru</li>
            </InfoBox>
          </Section>

          <Section id="cme" icon="🌊" title="CME (koronální výron hmoty)">
            <p>
              Obrovský oblak plazmatu a magnetického pole vyvržený ze Slunce. Cestuje meziplanetárním
              prostorem rychlostí 250–3000 km/s. Cesta k Zemi trvá typicky <strong>1–3 dny</strong>.
            </p>
            <InfoBox>
              <li><strong>Typ analýzy S:</strong> Směřuje přímo k Zemi (Earth-directed)</li>
              <li><strong>Typ analýzy C:</strong> Částečně směřuje k Zemi</li>
              <li><strong>Typ analýzy O:</strong> Nesměřuje k Zemi</li>
              <li><strong>Rychlost &gt; 500 km/s:</strong> Rychlé CME s větším potenciálem bouře</li>
              <li><strong>Rychlost &gt; 1000 km/s:</strong> Velmi rychlé — možná silná bouře</li>
            </InfoBox>
            <p className="text-sm text-slate-400">
              Zdroj: <Ext href="https://api.nasa.gov/#donki">NASA DONKI</Ext> (Space Weather Database Of Notifications,
              Knowledge, Information).
            </p>
          </Section>

          <Section id="g-scale" icon="📊" title="G-škála (geomagnetické bouře, NOAA)">
            <p>
              Pětistupňová škála <strong>síly geomagnetických bouří</strong> používaná NOAA.
              Odvozená z KP indexu.
            </p>
            <InfoBox>
              <li><strong>G0:</strong> Žádná bouře (KP &lt; 5)</li>
              <li><strong>G1 Minor:</strong> Slabá bouře (KP 5) — záře na obzoru v ČR</li>
              <li><strong>G2 Moderate:</strong> Střední (KP 6) — záře pouhým okem</li>
              <li><strong>G3 Strong:</strong> Silná (KP 7) — záře nad námi, problémy se signálem</li>
              <li><strong>G4 Severe:</strong> Těžká (KP 8) — tančící záře, výpadky GPS</li>
              <li><strong>G5 Extreme:</strong> Extrémní (KP 9) — historická bouře, výpadky sítí</li>
            </InfoBox>
          </Section>

          <Section id="flares" icon="☀️" title="Sluneční erupce (Solar Flares)">
            <p>
              Náhlé záblesky záření z povrchu Slunce. Klasifikují se podle síly rentgenového záření.
            </p>
            <InfoBox>
              <li><strong>Třída A, B:</strong> Slabé — nemají vliv na Zemi</li>
              <li><strong>Třída C:</strong> Střední — drobné poruchy komunikací</li>
              <li><strong>Třída M:</strong> Silné — přechodné výpadky rádiové komunikace</li>
              <li><strong>Třída X:</strong> Extrémní — silné poruchy, často doprovázeny CME</li>
            </InfoBox>
            <p className="text-sm text-slate-400">
              Erupce samotná záři na Zemi nevyvolá — to dělá až případné CME, které erupci doprovází.
            </p>
          </Section>

          <Section id="l1" icon="🛰️" title="Lagrangeův bod L1 (DSCOVR / ACE)">
            <p>
              Bod v prostoru ~1,5 milionu km před Zemí, kde se gravitace Slunce a Země vyrovnává.
              Zde orbitují sondy <strong>DSCOVR</strong> a <strong>ACE</strong>, které měří sluneční vítr
              <strong> 30–60 minut předtím, než dorazí k Zemi</strong>.
            </p>
            <p className="text-sm text-slate-400">
              Data z L1 jsou nejdůležitější „předpověd" — když L1 měří silný vítr a záporné Bz,
              velmi pravděpodobně za ~hodinu zasáhne magnetosféru.
            </p>
          </Section>

          <Section id="magnetosphere" icon="🧲" title="Magnetosféra">
            <p>
              Ochranná „bublina" magnetického pole Země. Sluneční vítr ji deformuje —
              na denní straně stlačí, na noční protáhne. Když je Bz záporné, magnetosféra
              se otevírá a nabité částice pronikají k pólům, kde vytvářejí polární záři.
            </p>
          </Section>

          <Section id="visibility" icon="👁" title="Stupnice viditelnosti (Česko 50°N)">
            <p>
              Česká republika leží na ~50° severní šířky, což je poměrně daleko od polárního oválu.
              Pro viditelnou záři potřebujeme výrazně silnější bouři než např. Skandinávie.
            </p>
            <InfoBox>
              <li><strong>KP 0–1: Neviditelná</strong> — žádná záře ani kamerou</li>
              <li><strong>KP 2–3: Fotografická</strong> — kamera ji zachytí, oko ne</li>
              <li><strong>KP 4: Na obzoru</strong> — slabá záře viditelná z tmavého místa</li>
              <li><strong>KP 5–6: Oblouk</strong> — jasný oblouk pouhým okem</li>
              <li><strong>KP 7: Nad námi</strong> — záře pokrývá velkou část oblohy</li>
              <li><strong>KP 8+: Tančící!</strong> — dramatická pohybující se záře (VZÁCNÉ)</li>
            </InfoBox>
          </Section>

          <Section id="bortle" icon="💡" title="Bortleho škála (světelné znečištění)">
            <p>
              Škála 1–9 hodnotící tmavost oblohy v dané lokalitě.
            </p>
            <InfoBox>
              <li><strong>1–2:</strong> Vynikající tmavá obloha (horské lokality)</li>
              <li><strong>3–4:</strong> Tmavý venkov — ideální pro záři</li>
              <li><strong>5–6:</strong> Příměstské oblasti — záře obtížně viditelná</li>
              <li><strong>7–8:</strong> Města — záře viditelná jen při extrémních bouřích</li>
              <li><strong>9:</strong> Centrum velkoměsta — prakticky nemožné</li>
            </InfoBox>
          </Section>

          <Section id="moon" icon="🌙" title="Vliv Měsíce">
            <p>
              Jasný Měsíc (zejména úplněk) rozjasňuje oblohu a ztěžuje pozorování slabé záře.
              Ideální je novoluní nebo tenký srpek.
            </p>
            <InfoBox>
              <li><strong>Novoluní / srpek:</strong> Vynikající — tma pomáhá</li>
              <li><strong>Čtvrť:</strong> Přijatelné — foťte směrem od Měsíce</li>
              <li><strong>Úplněk:</strong> Špatné — jedině při KP 7+</li>
            </InfoBox>
          </Section>

          <Section id="darkness" icon="🌃" title="Tma oblohy (soumraky)">
            <p>
              Pro pozorování záře potřebujeme dostatečnou tmu. Rozlišujeme:
            </p>
            <InfoBox>
              <li><strong>Den:</strong> Slunce nad obzorem — záři nelze vidět</li>
              <li><strong>Občanský soumrak:</strong> Slunce 0° až -6° — příliš světlo</li>
              <li><strong>Námořnický soumrak:</strong> -6° až -12° — možné zachycení silné záře</li>
              <li><strong>Astronomický soumrak:</strong> -12° až -18° — dobré podmínky</li>
              <li><strong>Noc:</strong> Slunce pod -18° — ideální pro pozorování</li>
            </InfoBox>
          </Section>

          <Section id="tips" icon="📷" title="Tipy pro pozorování a fotografování">
            <ul className="list-disc list-inside space-y-2 text-slate-300">
              <li>Sledujte KP index a Bz v reálném čase — Bz předbíhá KP o 30–60 min</li>
              <li>Zamíř na <strong>sever</strong>, ideálně 10–30° nad obzorem</li>
              <li>Najdi <strong>tmavé místo</strong> daleko od měst (Bortle ≤ 4)</li>
              <li>Stativ + širokoúhlý objektiv (14–24mm), clona f/2.8 nebo nižší</li>
              <li>Foť v <strong>RAW</strong>, ne JPEG — lepší postprodukce</li>
              <li>Expozice: 8–30s podle síly záře (silnější = kratší)</li>
              <li>ISO: 800–6400 podle KP (vyšší KP = nižší ISO stačí)</li>
              <li>Vypni stabilizaci objektivu na stativu</li>
              <li>Oči potřebují 15–20 minut adaptace na tmu</li>
              <li>Záře může být zelená, růžová, fialová nebo červená</li>
            </ul>
          </Section>
        </div>

        {/* Footer */}
        <div className="mt-16 pt-8 border-t border-white/6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-slate-400">
            AuroraDog — Data z{' '}
            <Ext href="https://www.swpc.noaa.gov">NOAA SWPC</Ext> a{' '}
            <Ext href="https://api.nasa.gov/#donki">NASA DONKI</Ext>
          </p>
          <div className="flex gap-4 text-xs">
            <a href="/aurora" className="text-slate-400 hover:text-aurora-teal transition-colors">Dashboard</a>
            <a href="/admin" className="text-slate-400 hover:text-aurora-pink transition-colors">Admin</a>
          </div>
        </div>
      </div>
    </main>
  )
}

/* ── Helper components ── */

const TOC = [
  { id: 'kp', icon: '⚡', title: 'KP index' },
  { id: 'bz', icon: '🧲', title: 'Bz složka' },
  { id: 'solar-wind', icon: '💨', title: 'Sluneční vítr' },
  { id: 'cme', icon: '🌊', title: 'CME' },
  { id: 'g-scale', icon: '📊', title: 'G-škála' },
  { id: 'flares', icon: '☀️', title: 'Sluneční erupce' },
  { id: 'l1', icon: '🛰️', title: 'L1 sonda' },
  { id: 'magnetosphere', icon: '🧲', title: 'Magnetosféra' },
  { id: 'visibility', icon: '👁', title: 'Stupnice viditelnosti' },
  { id: 'bortle', icon: '💡', title: 'Bortleho škála' },
  { id: 'moon', icon: '🌙', title: 'Vliv Měsíce' },
  { id: 'darkness', icon: '🌃', title: 'Tma oblohy' },
  { id: 'tips', icon: '📷', title: 'Tipy pro pozorování' },
]

function Section({ id, icon, title, children }: { id: string; icon: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-20 bg-[#04101e]/60 border border-white/8 rounded-2xl p-5 md:p-6">
      <h2 className="text-lg md:text-xl font-bold text-slate-100 mb-3 flex items-center gap-2">
        <span className="text-xl">{icon}</span> {title}
      </h2>
      <div className="space-y-3 text-slate-300 text-sm leading-relaxed">
        {children}
      </div>
    </section>
  )
}

function InfoBox({ children }: { children: React.ReactNode }) {
  return (
    <ul className="bg-[#03080f]/60 border border-white/6 rounded-xl p-4 space-y-1.5 text-sm text-slate-200 list-none">
      {children}
    </ul>
  )
}

function Ext({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="text-aurora-teal hover:underline">
      {children}
    </a>
  )
}
