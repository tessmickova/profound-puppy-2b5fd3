import type { Metadata } from 'next'
import Link from 'next/link'
import Shell from '@/components/names/Shell'
import { PRAVNI, cesyDatum } from '@/lib/names/pravni'

export const metadata: Metadata = {
  title: 'Ochrana osobních údajů',
  description:
    'Co o vás Svět jmen ví — krátce a bez oklik. Jména, která si uložíte, zůstávají ve vašem prohlížeči.',
}

export default function SoukromiStranka() {
  return (
    <Shell>
      <article className="pravni-text">
        <h1>Ochrana osobních údajů</h1>
        <p className="pravni-datum">Účinné od {cesyDatum(PRAVNI.ucinnostOd)}</p>

        <p className="pravni-uvod">
          Krátce: běžný návštěvník nám o sobě neřekne nic. Účet tu není, registrace
          není, jména si ukládáte sami k sobě do prohlížeče. Údaje evidujeme jen
          u firem, které si tu koupí reklamu — a jen ty, bez kterých se nedá
          vystavit faktura.
        </p>

        <h2>Kdo za údaje odpovídá</h2>
        <p>
          Správcem je {PRAVNI.provozovatel}
          {PRAVNI.ico ? `, IČO ${PRAVNI.ico}` : ''}
          {PRAVNI.sidlo ? `, se sídlem ${PRAVNI.sidlo}` : ''}, kontakt{' '}
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
            tlačítkem v aplikaci nebo vymazáním dat prohlížeče. Konkrétně jde
            o tři záznamy: <code>svet-jmen-vyber</code> (uložená i vyřazená
            jména), <code>svet-jmen-rodina</code> (členové rodiny) a
            {' '}<code>svetjmen-podrobnosti</code> (co se má u jmen ukazovat).
            Firmy, které si u nás koupí reklamu, mají navíc
            {' '}<code>svetjmen-inzerent-klic</code> s přístupem k vlastní kampani.
          </li>
          <li>
            <strong>Jména blízkých.</strong> Do vyhledávače se dají zadat jména
            maminky, tatínka nebo sourozence — tedy údaje o jiných lidech.
            I ty zůstávají jen ve vašem prohlížeči a na server nejdou. Přesto
            platí: zadávejte je, jen když s tím ti lidé souhlasí.
          </li>
          <li>
            <strong>Cookies web nenastavuje žádné</strong> — ani vlastní, ani cizí.
            Používá jen úložiště prohlížeče (<code>localStorage</code>) na tři
            záznamy vyjmenované výš; ty si zakládáte sami tím, že si jméno uložíte
            nebo si nastavíte zobrazení. Podle § 89 odst. 3 zákona č. 127/2005 Sb.
            (ePrivacy) jde o úložiště nezbytné pro službu, kterou jste si vyžádali,
            takže se na ně souhlas nevztahuje a lišta tu není. Žádné měření
            návštěvnosti, analytiku ani sledovací skripty třetích stran
            nepoužíváme — web nedělá jediný požadavek mimo vlastní doménu
            (výjimkou je reklamní služba, viz níž).
          </li>
          <li>
            <strong>Provozní záznamy.</strong> Web běží na síti Cloudflare, která
            při každém požadavku zpracuje IP adresu, adresu stránky, čas a typ
            prohlížeče — bez toho by se stránka nedala doručit ani ochránit před
            útokem. Záznamy slouží jen k provozu a bezpečnosti, nespojujeme je
            s ničím dalším a sami si z nich nic dlouhodobě neukládáme. Právním
            základem je oprávněný zájem na bezpečném provozu.
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

        <h2>Doporučení počítá stroj, ne člověk</h2>
        <p>
          Pořadí jmen, skóre 0–100, rodinné štítky i výklad čísla jména počítá
          automaticky náš vlastní vzorec — z toho, co zadáte do vyhledávače,
          a z údajů o jménech v katalogu. <strong>Není to profilování vaší
          osoby</strong> a nevzniká z toho žádné rozhodnutí s právním účinkem;
          je to nápověda, kterou můžete ignorovat. Vysvětlení, proč se jméno
          umístilo, je u každého výsledku, a co se má u jmen ukazovat,
          si nastavíte sami.
        </p>
        <p>
          Popisky jmen a texty na webu jsme psali s pomocí umělé inteligence
          a pak je redakčně prošli. Výklad čísla jména berte jako hru,
          ne jako věštbu ani radu.
        </p>

        <h2>Kde web běží a kam se údaje dostanou</h2>
        <p>
          Web i objednávkový systém běží na platformě <strong>Cloudflare</strong>
          {' '}(Cloudflare, Inc., USA) — konkrétně na službách Workers, D1 a R2.
          Cloudflare je náš zpracovatel a provozuje globální síť: požadavek
          obslouží ten datový uzel, který je návštěvníkovi nejblíž, takže
          <strong> zpracování může proběhnout i mimo Evropskou unii</strong>.
          Předání mimo EU je pokryté standardními smluvními doložkami Evropské
          komise v rámci zpracovatelské smlouvy s Cloudflare. Netvrdíme tedy,
          že všechna data zůstávají v EU — to by u téhle architektury nebyla
          pravda.
        </p>
        <p>
          Objednávky inzerentů a loga leží v databázi Cloudflare D1 a v úložišti
          Cloudflare R2. Kromě Cloudflare, naší účetní a — v případě kontroly —
          příslušného úřadu se k údajům nikdo nedostane. Údaje neprodáváme,
          nesměňujeme ani nepředáváme reklamním sítím; žádnou tu nemáme.
        </p>
        <p className="pravni-doplnit">
          <strong>K doplnění majitelem projektu:</strong> odkaz na uzavřenou
          zpracovatelskou smlouvu s Cloudflare a případné další zpracovatele
          (poskytovatel e-mailu, účetní software). Tenhle odstavec projděte
          s právníkem — my popisujeme jen to, co je v kódu skutečně vidět.
        </p>

        <h2>Děti</h2>
        <p>
          Web je určený dospělým, kteří vybírají jméno. Od nikoho nechceme věk
          ani registraci a od návštěvníků nesbíráme žádné údaje — takže ani
          v případě, že si stránku otevře dítě, o něm nic nevzniká.
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
