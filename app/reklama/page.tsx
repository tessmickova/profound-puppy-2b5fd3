import type { Metadata } from 'next'
import Link from 'next/link'
import Shell from '@/components/names/Shell'
import { ADRESA_REKLAM, PRAVNI } from '@/lib/names/pravni'

export const metadata: Metadata = {
  title: 'Reklama na Světě jmen — nativní plochy pro firmy',
  description:
    'Inzerát, který vypadá jako zbytek webu. Plochy na měsíc, půl roku nebo rok, pevný formát, žádné blikající bannery.',
}

const KROKY = [
  { c: '1', h: 'Vyberete plochu', t: 'Vidíte, které plochy jsou volné a co která stojí. Na jedné se střídají nejvýš čtyři inzeráty, každý je vidět půl minuty.' },
  { c: '2', h: 'Naklikáte inzerát', t: 'Značka nebo logo, nadpis, dvě věty, tlačítko a odkaz. Formát je daný, náhled vidíte hned vedle.' },
  { c: '3', h: 'Zaplatíte převodem', t: 'Kampaň spustíme po připsání platby, nejpozději následující pracovní den.' },
  { c: '4', h: 'Na konci sama zhasne', t: 'Nic se neobnovuje automaticky. Plocha se uvolní a nabídne dalšímu — nebo si ji vezmete znovu.' },
]

export default function ReklamaStranka() {
  return (
    <Shell>
      <div className="mx-auto max-w-3xl">
        <h1 className="[font-family:var(--font-syne)] text-3xl font-bold sm:text-4xl">
          Reklama, která vypadá jako zbytek webu
        </h1>
        <p className="mt-3 text-lg text-[#6b6156]">
          Žádné blikající bannery ani vyskakovací okna. Váš inzerát je běžná karta
          Světa jmen a vidí ho lidé, kteří právě vybírají jméno pro dítě nebo pro
          zvíře — tedy chvíli před nákupem známky, pelíšku, knížky nebo focení.
        </p>

        <ol className="mt-8 grid gap-3 sm:grid-cols-2">
          {KROKY.map(k => (
            <li key={k.c} className="rounded-2xl border border-[#e8dfd2] bg-white p-5">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-[9px] bg-[#2b2723] text-sm font-bold text-[#faf6ef]">
                {k.c}
              </span>
              <h2 className="mt-3 [font-family:var(--font-syne)] text-base font-bold">{k.h}</h2>
              <p className="mt-1 text-sm text-[#6b6156]">{k.t}</p>
            </li>
          ))}
        </ol>

        <div className="mt-8 rounded-2xl border border-dashed border-[#e8dfd2] bg-[#faf6ef] p-5 text-sm text-[#6b6156]">
          <p className="font-semibold text-[#2b2723]">Co po vás chceme</p>
          <p className="mt-1">
            Název firmy, IČO a e-mail kvůli faktuře — a texty inzerátu. Nic víc
            neevidujeme, žádný účet nezakládáme.
          </p>
        </div>

        <div className="mt-8">
          {ADRESA_REKLAM ? (
            <a
              href={ADRESA_REKLAM}
              className="inline-flex items-center gap-2 rounded-full bg-[#d97757] px-7 py-3.5 font-bold text-white"
            >
              Vybrat volnou plochu <span aria-hidden>→</span>
            </a>
          ) : (
            <a
              href={`mailto:${PRAVNI.emailReklama}`}
              className="inline-flex items-center gap-2 rounded-full bg-[#d97757] px-7 py-3.5 font-bold text-white"
            >
              Napsat nám o volné ploše <span aria-hidden>→</span>
            </a>
          )}
          <p className="mt-3 text-sm text-[#8a7f71]">
            Otázky rádi zodpovíme na{' '}
            <a href={`mailto:${PRAVNI.emailReklama}`} className="underline">{PRAVNI.emailReklama}</a>.
            Pravidla inzerce jsou v <Link href="/podminky" className="underline">podmínkách</Link>.
          </p>
        </div>
      </div>
    </Shell>
  )
}
