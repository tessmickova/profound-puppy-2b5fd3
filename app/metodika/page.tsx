import type { Metadata } from 'next'
import Link from 'next/link'
import Shell from '@/components/names/Shell'
import { JMENA, ZEME } from '@/lib/names/data'
import { VSECHNA_PLEMENA } from '@/lib/names/breeds'
import { ENTITY_SE_STRANKOU } from '@/lib/names/entita'
import { PRAVNI, cesyDatum } from '@/lib/names/pravni'

export const metadata: Metadata = {
  title: 'Jak vybíráme a hodnotíme jména',
  description:
    'Odkud jsou významy a jmeniny, co znamená „shoda podle pravidel Světa jmen“, '
    + 'co je heuristika a co ověřený fakt — a kde pomáhala umělá inteligence.',
  alternates: { canonical: '/metodika' },
}

export default function MetodikaStranka() {
  return (
    <Shell>
      <article className="pravni-text">
        <h1>Jak vybíráme a hodnotíme jména</h1>
        <p className="pravni-datum">Naposledy ověřeno {cesyDatum(PRAVNI.overeno)}</p>

        <p className="pravni-uvod">
          Svět jmen je <strong>redakční katalog</strong>, ne statistický úřad.
          Čísla, která tu vidíte, jsou naše hodnocení — ne měření. Tahle stránka
          říká přesně, co za čím stojí, abyste věděli, čemu věřit a co brát
          jako nápad.
        </p>

        <h2>Co v katalogu je</h2>
        <p>
          {JMENA.length} záznamů jmen z {ZEME.length} zemí, {VSECHNA_PLEMENA.length} plemen
          psů a koček a {ENTITY_SE_STRANKOU.length} jmen s vlastní detailovou
          stránkou. Vlastní stránku dostane jméno až tehdy, když o něm máme co
          říct — význam a k tomu aspoň jmeniny, domácké tvary nebo doložené
          použití ve víc zemích. Zbytek zůstává v přehledech; nemá smysl vyrábět
          stránky, na kterých by nebylo nic nového.
        </p>

        <h2>Význam jmen</h2>
        <p>
          Výklady významů jsme sestavili z běžně dostupných jazykových
          a etymologických zdrojů a <strong>psali je s pomocí umělé
          inteligence</strong>; každý pak prošel redakční kontrolou. U řady
          jmen se výklady mezi zdroji liší — uvádíme ten nejrozšířenější,
          ne jediný správný. Berte je jako výchozí bod, ne jako etymologický
          posudek.
        </p>

        <h2>Země u jména</h2>
        <p>
          Země u jména znamená, <strong>kde se jméno používá</strong> — ne odkud
          pochází. To jsou dvě různé věci: Emma se běžně dává v Německu i v Česku,
          ale jazykový původ má jen jeden. Původ proto uvádíme jen tam, kde je
          doložený, a jinde raději mlčíme.
        </p>

        <h2>Jmeniny</h2>
        <p>
          Data o jmeninách vycházejí z českého občanského kalendáře. Kalendář
          není právní předpis a jednotlivá vydání se v okrajových jménech liší;
          u jmen mimo kalendář žádné datum neuvádíme.
        </p>

        <h2>Hodnocení líbivosti (0–100)</h2>
        <p>
          Číslo u jména <strong>není měřená popularita ani počet novorozenců</strong>.
          Je to naše redakční skóre líbivosti: jak je jméno v dané zemi běžné,
          jak dobře se vyslovuje, jak stárne a jak působí. Přiřazujeme ho ručně
          při zařazení jména do katalogu.
        </p>
        <p>
          Skóre líbivosti <strong>neříká nic o době</strong>, ve které se jméno
          dávalo. Na to je samostatný údaj níž.
        </p>

        <h2>Dobové zařazení: kde jméno stojí na české vlně</h2>
        <p>
          Dřív u nás štítek <em>originál</em> dostávalo jméno jen podle toho, že
          mělo nižší skóre líbivosti. Bylo to špatně a bylo to vidět:{' '}
          <strong>Denisa vycházela jako „originál“</strong>. Denisa přitom není
          originální jméno ani trochu — je to naprosto běžné české jméno, jen se
          dávalo generaci dnešních maminek, ne dnešním miminkám. Stejně dopadly
          Blanka, Ludmila, Zuzana nebo Richard.
        </p>
        <p>
          Jsou to dvě různé věci: <strong>jak je jméno vzácné</strong> a{' '}
          <strong>v jaké době se dávalo</strong>. Kryšpín je vzácný pořád. Denisa
          nebyla vzácná nikdy. Rozálie byla vzácná a teď se vrací. Do jednoho
          čísla se to nevejde, takže má každé jméno vlastní dobové zařazení:
        </p>
        <ul>
          <li><strong>teď nejčastější</strong> — patří k nejčastějším jménům dnešních miminek</li>
          <li><strong>jde nahoru</strong> — dává se čím dál víc, dá se čekat přírůstek</li>
          <li><strong>vrací se</strong> — jméno prababiček a pradědečků zpátky v módě</li>
          <li><strong>stálice</strong> — dává se v každé generaci</li>
          <li><strong>jméno generace rodičů</strong> — běžné, ale jeho doba byla o generaci dřív</li>
          <li><strong>vzácné</strong> — vzácné bez ohledu na dobu</li>
        </ul>
        <p>
          Je to <strong>redakční zařazení, ne statistika</strong>. Data ČSÚ ani
          matrik k dispozici nemáme, a kdybychom z nich dělali, že vycházíme,
          bylo by to horší než přiznaný odhad. Proto je u zařazení vždycky uvedený
          rok revize — bez roku by za dvě sezóny nikdo nepoznal, že zestaralo.
        </p>
        <p>
          Zařazení má zatím jen <strong>českých dětských jmen</strong>. Cizí
          záznamy popisují jméno v jeho zemi, ne to, co se dává v Česku, a
          o módě zvířecích jmen žádná použitelná data nejsou. Kde nevíme, tam
          nic netvrdíme a jméno zůstane bez štítku.
        </p>

        <h2>Český a světový zápis téhož jména</h2>
        <p>
          Část rodičů nehledá jiné jméno, ale <strong>jiný zápis</strong>.
          Teodor a Theodor je totéž jméno, jenže Theodor zní světověji a jinak
          vypadá v pase. Stejně tak Sofie/Sofia, Ema/Emma, Melánie/Melanie
          nebo Sebastián/Sebastian. Matrika zapíše obě podoby, takže je to
          skutečné rozhodnutí — a u jmen, kde ho evidujeme, ho na detailu
          uvidíte pod „Píše se také".
        </p>
        <p>
          Hledání s tím počítá: když napíšete <em>Theodor</em>, najde vám
          Teodora. Naopak <strong>překlady jmen do jiných jazyků sem
          nepatří</strong> — Jan a John jsou příbuzná jména, ne dva zápisy
          jednoho.
        </p>
        <p>
          Štítek „zní světově" je <strong>redakční výběr</strong>, ne pravidlo
          z pravopisu: rozhoduje, jak jméno působí na české ucho, ne kolik má
          cizích písmen.
        </p>

        <h2>Shoda podle pravidel Světa jmen</h2>
        <p>
          Když zadáte příjmení, jména rodičů nebo sourozence, spočítá web skóre
          0–100. Není to věda — je to <strong>součet jasně daných pravidel</strong>,
          která si můžete zkontrolovat u každého výsledku:
        </p>
        <ul>
          <li>
            <strong>Přechod jméno–příjmení.</strong> Když jméno končí a příjmení
            začíná stejnou hláskou (Anna Adamcová), dvojice se hůř vyslovuje.
          </li>
          <li>
            <strong>Rytmus.</strong> Dohromady čtyři až šest slabik zní vyváženě;
            výrazně kratší i delší kombinace ubírají body.
          </li>
          <li>
            <strong>Rým.</strong> Stejná koncovka jména i příjmení dělá z dvojice
            říkanku.
          </li>
          <li>
            <strong>Rodina.</strong> Sdílený styl a původ přidávají, shodná první
            hláska se sourozencem ubírá — doma se jména pletou.
          </li>
          <li>
            <strong>Měsíc narození.</strong> Bere v úvahu jmeniny a sezónní
            asociace jména; je to nejměkčí pravidlo z celé sady.
          </li>
        </ul>
        <p>
          Všechno tohle jsou <strong>heuristiky</strong>, tedy zkušenostní
          pravidla — ne fakta. Jméno s nižším skóre není horší.
        </p>

        <h2>Číslo jména</h2>
        <p>
          Numerologický výklad je <strong>hra, ne rada</strong>. Nemá oporu ve
          vědě a nepoužíváme ho k ničemu jinému než k pobavení; dá se vypnout
          ve volbě podrobností.
        </p>

        <h2>Tipy k volání zvířat</h2>
        <p>
          Doporučení „krátké jméno zakončené samohláskou se psovi volá lépe“
          vychází z běžné kynologické praxe a z toho, že psi lépe rozlišují
          výraznější zvukové vzorce. Neopíráme ho o konkrétní studii —
          berte ho jako praktickou zkušenost chovatelů, ne jako prokázaný fakt.
        </p>

        <h2>Kde pomáhala umělá inteligence</h2>
        <p>
          Popisky jmen, texty na webu a část kurátorských seznamů k plemenům
          vznikly s pomocí umělé inteligence a prošly redakcí. Výběr jmen do
          katalogu, pravidla shody i hodnocení líbivosti jsou lidská práce.
        </p>

        <h2>Našli jste chybu?</h2>
        <p>
          Budeme rádi, když nám ji napíšete na{' '}
          <a href={`mailto:${PRAVNI.email}`}>{PRAVNI.email}</a>. Opravy děláme
          průběžně a datum nahoře pak posuneme.
        </p>

        <p className="pravni-odkaz">
          Pravidla provozu najdete v <Link href="/podminky">Podmínkách</Link>,
          zpracování údajů v <Link href="/soukromi">Ochraně osobních údajů</Link>.
        </p>
      </article>
    </Shell>
  )
}
