import type { Metadata } from 'next'
import Link from 'next/link'
import Shell from '@/components/names/Shell'
import { PRAVNI } from '@/lib/names/pravni'

export const metadata: Metadata = {
  title: 'Ochrana osobních údajů | Svět jmen',
  description:
    'Co o vás Svět jmen ví — krátce a bez oklik. Jména, která si uložíte, zůstávají ve vašem prohlížeči.',
}

export default function SoukromiStranka() {
  return (
    <Shell>
      <article className="pravni-text">
        <h1>Ochrana osobních údajů</h1>
        <p className="pravni-datum">Platné od {PRAVNI.platnostOd}</p>

        <p className="pravni-uvod">
          Krátce: běžný návštěvník nám o sobě neřekne nic. Účet tu není, registrace
          není, jména si ukládáte sami k sobě do prohlížeče. Údaje evidujeme jen
          u firem, které si tu koupí reklamu — a jen ty, bez kterých se nedá
          vystavit faktura.
        </p>

        <h2>Kdo za údaje odpovídá</h2>
        <p>
          Správcem je {PRAVNI.provozovatel}
          {PRAVNI.ico ? `, IČO ${PRAVNI.ico}` : ''}, kontakt{' '}
          <a href={`mailto:${PRAVNI.email}`}>{PRAVNI.email}</a>.
        </p>

        <h2>Když web jen procházíte</h2>
        <ul>
          <li>
            <strong>Účet nepotřebujete.</strong> Nechceme e-mail ani jméno.
          </li>
          <li>
            <strong>Uložená jména a rodinný profil</strong> — včetně jmen, která
            zadáte do rodinného vyhledávače — zůstávají v úložišti vašeho
            prohlížeče. Nikam se neodesílají a my se k nim nedostaneme. Smažete je
            tlačítkem v aplikaci nebo vymazáním dat prohlížeče.
          </li>
          <li>
            <strong>Sledovací cookies nepoužíváme</strong> a reklamu necílíme podle
            toho, kdo jste. Inzerát je vázaný na stránku, ne na člověka — proto
            u nás není žádná cookie lišta.
          </li>
          <li>
            <strong>Provozní záznamy.</strong> Jako každý web krátkodobě
            zaznamenáváme přístupy (adresa stránky, čas, typ prohlížeče, IP adresa),
            abychom uhlídali výpadky a zneužití. Držíme je nejdéle 30 dnů a
            k ničemu jinému je nepoužíváme. Právním základem je oprávněný zájem
            na bezpečném provozu.
          </li>
        </ul>

        <h2>Když si u nás koupíte reklamu</h2>
        <p>Od inzerenta potřebujeme jen tohle:</p>
        <ul>
          <li>název firmy a IČO — kvůli faktuře,</li>
          <li>e-mail — abychom mohli poslat pokyny k platbě a ozvat se ke kampani,</li>
          <li>obsah inzerátu (značka, nadpis, text, tlačítko, odkaz, případně logo),</li>
          <li>údaje o objednávce — plocha, období, cena, stav platby.</li>
        </ul>
        <p>
          Nic dalšího nesbíráme. Právním základem je plnění smlouvy a u účetních
          dokladů zákonná povinnost. Objednávku a fakturu si necháváme po dobu,
          kterou ukládá zákon o účetnictví; e-mail mažeme rok po skončení poslední
          kampaně. Ostatní údaje o inzerentech nikomu nepředáváme; s účetními
          doklady pracuje naše účetní a v případě kontroly příslušný úřad.
        </p>

        <h2>Kam se údaje dostanou</h2>
        <p>
          Web i objednávkový systém běží na serverech v Evropské unii. Údaje
          neprodáváme, nesměňujeme ani nepředáváme reklamním sítím — žádnou tu
          nemáme.
        </p>

        <h2>Vaše práva</h2>
        <p>
          Máte právo vědět, co o vás vedeme, nechat si to opravit nebo smazat,
          omezit zpracování a vznést námitku. Stačí napsat na{' '}
          <a href={`mailto:${PRAVNI.email}`}>{PRAVNI.email}</a>; ozveme se do
          jednoho měsíce. Když se vám naše odpověď nebude líbit, můžete se obrátit
          na Úřad pro ochranu osobních údajů.
        </p>

        <h2>Změny</h2>
        <p>
          Když se způsob zpracování změní, upravíme tenhle text a změníme datum
          nahoře. Starší znění vám na vyžádání pošleme.
        </p>

        <p className="pravni-odkaz">
          Pravidla provozu a inzerce najdete v <Link href="/podminky">Podmínkách používání</Link>.
        </p>
      </article>
    </Shell>
  )
}
