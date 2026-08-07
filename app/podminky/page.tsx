import type { Metadata } from 'next'
import Link from 'next/link'
import Shell from '@/components/names/Shell'
import { PRAVNI } from '@/lib/names/pravni'

export const metadata: Metadata = {
  title: 'Podmínky používání | Svět jmen',
  description:
    'Za jakých podmínek Svět jmen funguje — pro návštěvníky i pro firmy, které si tu inzerují.',
}

export default function PodminkyStranka() {
  return (
    <Shell>
      <article className="pravni-text">
        <h1>Podmínky používání</h1>
        <p className="pravni-datum">Platné od {PRAVNI.platnostOd}</p>

        <h2>Kdo web provozuje</h2>
        <p>
          Svět jmen provozuje {PRAVNI.provozovatel}
          {PRAVNI.ico ? `, IČO ${PRAVNI.ico}` : ''}. Napsat nám můžete na{' '}
          <a href={`mailto:${PRAVNI.email}`}>{PRAVNI.email}</a>.
        </p>

        <h2>K čemu web je</h2>
        <p>
          Svět jmen pomáhá vybrat jméno pro dítě nebo pro zvíře. Doporučení, shody
          s příjmením, rodinné štítky i výklad čísla jména jsou doporučení a hra —
          ne odborná rada a ne věštba. Rozhodnutí je vždycky vaše.
        </p>
        <p>
          Web je zdarma a bez registrace. Uložená jména i rodinný profil zůstávají
          ve vašem prohlížeči; když si vymažete data prohlížeče, zmizí i ony.
        </p>

        <h2>Co tu nedělat</h2>
        <ul>
          <li>Nesnažte se web přetížit ani automatizovaně stahovat celý jeho obsah.</li>
          <li>Texty a data ze Světa jmen nepřebírejte ve větším rozsahu bez našeho souhlasu.</li>
        </ul>

        <h2>Za co neručíme</h2>
        <p>
          Data o jménech dáváme dohromady poctivě, ale nemůžeme zaručit, že je
          všechno bez chyby a stále aktuální. Za škodu vzniklou tím, že jste se
          rozhodli podle doporučení na webu, neodpovídáme. Web se občas může
          odmlčet kvůli údržbě nebo výpadku.
        </p>
        <p>
          Našli jste chybu ve jménu, významu nebo svátku? Napište nám — opravíme to.
        </p>

        <h2>Reklama na webu</h2>
        <p>
          Provoz webu platí reklama. Je vždycky označená slovem „sponzorováno" a
          nikdy nevypadá jako naše doporučení. Za nabídku inzerenta a za obsah
          stránek, kam odkazuje, neodpovídáme.
        </p>

        <h3>Pro firmy, které si chtějí inzerovat</h3>
        <ul>
          <li>
            Formát je daný předem: značka nebo logo, nadpis, dvě věty, tlačítko a odkaz.
            Nic víc se do plochy nevejde a nic dalšího po vás nechceme.
          </li>
          <li>
            Kampaň se kupuje na <strong>měsíc, 6 měsíců nebo rok</strong>. Ceny jsou
            uvedené u každé plochy bez DPH.
          </li>
          <li>
            Objednávka je závazná okamžikem odeslání. Kampaň spustíme po připsání
            platby, nejpozději následující pracovní den.
          </li>
          <li>
            Na jedné ploše se střídají nejvýš čtyři inzeráty. Negarantujeme počet
            zobrazení ani proklik — garantujeme místo po celou zaplacenou dobu.
          </li>
          <li>
            <strong>Nic se neobnovuje automaticky.</strong> Na konci období kampaň
            sama zhasne a plocha se nabídne jako volná. Chcete-li pokračovat,
            objednáte si další období.
          </li>
          <li>
            Text i odkaz můžete během kampaně nechat upravit; plocha se nemění.
            Zaplacené období se úpravou neprodlužuje.
          </li>
          <li>
            Odmítneme inzerát, který klame, míří na děti jako na zákazníky, nabízí
            alkohol, tabák, hazard, úvěry na první pohled nevýhodné, léčitelství
            nebo cokoli protiprávního. Odmítneme i inzerát, který se vydává za
            obsah webu. V takovém případě vrátíme celou částku.
          </li>
          <li>
            Kampaň můžeme zastavit, pokud odkaz přestane fungovat nebo se cíl
            odkazu změní na něco z předchozího bodu. Vracíme poměrnou část ceny.
          </li>
          <li>
            Za obsah inzerátu, za práva k logu a za soulad nabídky se zákonem
            odpovídá inzerent.
          </li>
        </ul>

        <h3>Když se nám něco pokazí</h3>
        <p>
          Nezobrazí-li se vaše kampaň souvislé tři dny a je to naše chyba,
          prodloužíme ji o dvojnásobek výpadku, nebo vám poměrnou část vrátíme —
          vyberte si. Reklamaci pošlete do 30 dnů od konce kampaně na{' '}
          <a href={`mailto:${PRAVNI.email}`}>{PRAVNI.email}</a>, odpovíme do 14 dnů.
        </p>

        <h2>Změny podmínek</h2>
        <p>
          Podmínky můžeme upravit. Na už zaplacené kampaně se vztahuje znění platné
          v den objednávky. Vztahy se řídí českým právem.
        </p>

        <p className="pravni-odkaz">
          Jak nakládáme s údaji, popisuje <Link href="/soukromi">Ochrana osobních údajů</Link>.
        </p>
      </article>
    </Shell>
  )
}
