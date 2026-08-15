// Provozní audit projektu — jeden zdroj pravdy pro stránku /sprava.
//
// Tohle je ta část auditu, která se nemění za běhu: co je postavené, jaké
// hrozby jsou ošetřené, co čeká na majitelku a co se doporučuje dál.
// Žije v repozitáři schválně — každá změna auditu projde Gitem a je vidět
// v historii, nikdo (ani AI) ho nemůže tiše přepsat v databázi.
//
// Pravidlo obsahu: žádné uklidňující fráze. Když něco není hotové nebo
// bezpečné, píše se to sem červeně a s návodem, co s tím.

export const AUDIT_REVIZE = '2026-08-15'

export type StavPolozky = 'podchyceno' | 'ceka-na-vas' | 'trva'

export interface PolozkaAuditu {
  stav: StavPolozky
  nazev: string
  popis: string
  /** co přesně udělat, když je stav ceka-na-vas nebo trva */
  akce?: string
}

export const STAV_INFO: Record<StavPolozky, { stitek: string; barva: string }> = {
  podchyceno: { stitek: 'podchyceno', barva: '#4d8b5c' },
  'ceka-na-vas': { stitek: 'čeká na vás', barva: '#c98a2e' },
  trva: { stitek: 'trvá — riziko', barva: '#b3403a' },
}

// ── bezpečnost ────────────────────────────────────────────────────────────

export const BEZPECNOST: PolozkaAuditu[] = [
  {
    stav: 'trva',
    nazev: 'Web má dva repozitáře — a to už jednou stálo pět dní práce',
    popis: 'Svět jmen je v tessmickova/profound-puppy-2b5fd3 (větev '
      + 'claude/animal-children-names-by-country-c014s6 — odsud se nasazuje živý web) '
      + 'i v tessmickova/svetjmen (starší základ). 14. 8. se kvůli tomu nasadil starý '
      + 'kód a přepsal živou verzi; zachránil to rollback. Podrobně v docs/INCIDENT-2026-08-14.md.',
    akce: 'Rozhodnout, který repozitář je ten pravý, a druhý archivovat '
      + '(GitHub → Settings → Archive repository). Do té doby před každým ručním '
      + 'nasazením porovnat: npx wrangler deployments list vs. git log -1 --format=%ci — '
      + 'živá verze novější než commit znamená zastavit.',
  },
  {
    stav: 'trva',
    nazev: 'Cloudflare API token a GitHub token byly vloženy do chatu',
    popis: 'Oba tokeny prošly konverzací s AI, a proto je nutné je považovat '
      + 'za vyzrazené — kdokoli s přístupem k přepisu by je mohl použít.',
    akce: 'Cloudflare → My Profile → API Tokens → Roll/Delete a vytvořit nový '
      + '(oprávnění: Workers Scripts Edit + D1 Edit, ať CI zvládne i migrace databáze); '
      + 'GitHub → Settings → Developer settings → tokens → Revoke. Nové hodnoty '
      + 'vložit jen do GitHub → repozitář → Settings → Secrets → Actions.',
  },
  {
    stav: 'ceka-na-vas',
    nazev: 'ADMIN_TOKEN reklamní služby zatím není nastaven',
    popis: 'Bez něj se nedá přihlásit do adminu a schvalovat platby. Dokud '
      + 'není nastaven, admin API odmítá úplně všechno — to je bezpečný stav, '
      + 'ale nic se nedá spravovat.',
    akce: 'Vygenerovat dlouhý náhodný řetězec (min. 32 znaků) a v adresáři '
      + 'ads-worker spustit: npx wrangler secret put ADMIN_TOKEN. Token uložit '
      + 'do správce hesel — je to jediný klíč k adminu.',
  },
  {
    stav: 'ceka-na-vas',
    nazev: 'Ochrana hlavní větve na GitHubu',
    popis: 'Web se nasazuje automaticky při každém pushi. Bez ochrany větve '
      + 'může kdokoli s přístupem k repozitáři (včetně AI agentů) poslat změnu '
      + 'rovnou do produkce.',
    akce: 'GitHub → Settings → Branches → Add branch protection rule: vyžadovat '
      + 'pull request s vaším schválením před sloučením. Pak AI může navrhovat, '
      + 'ale o nasazení rozhodujete vy.',
  },
  {
    stav: 'ceka-na-vas',
    nazev: 'COMGATE_SECRET a COMGATE_MERCHANT zatím nejsou nastavené',
    popis: 'Dokud chybí, platební brána se vůbec nepoužije a reklama se prodává '
      + 'převodem s variabilním symbolem jako dosud — to je bezpečný stav, '
      + 'jen ruční. Tajemství brány je stejně citlivé jako admin token: kdo ho '
      + 'zná, umí poslat notifikaci „zaplaceno" a rozsvítit kampaň zadarmo.',
    akce: 'Po podpisu smlouvy s ComGate v adresáři ads-worker spustit: '
      + 'npx wrangler secret put COMGATE_SECRET, doplnit COMGATE_MERCHANT '
      + 'do [vars] ve wrangler.toml a v portálu ComGate nastavit adresy '
      + 'notifikace (/api/platba/notifikace) a návratu (/api/platba/navrat). '
      + 'Nejdřív s COMGATE_TEST = "true", teprve po zkoušce přepnout na "false".',
  },
  {
    stav: 'podchyceno',
    nazev: 'Cizí kreativa se nezveřejní bez schválení',
    popis: 'Zaplacení kampaň jen zaplatí — návštěvník uvidí inzerát až po '
      + 'schválení na /sprava. Rozhoduje o tom jediná podmínka v dotazu, který '
      + 'kreativy vydává, takže se to nedá obejít jinou cestou. Každá pozdější '
      + 'úprava textu i výměna loga schválení shodí zpátky na nulu.',
  },
  {
    stav: 'podchyceno',
    nazev: 'Notifikace o platbě se ověřuje, ne věří',
    popis: 'Zpráva z brány projde jen tehdy, když sedí tajemství (porovnané '
      + 'v konstantním čase), obchodník, měna, částka v haléřích i to, že refId '
      + 'je naše objednávka. Opakovaná notifikace nic nepřepíše. Návrat '
      + 'zákazníka z brány nic neaktivuje — jinak by stačilo otevřít adresu '
      + 's cizím refId a kampaň by běžela bez zaplacení.',
  },
  {
    stav: 'podchyceno',
    nazev: 'Admin API chráněné tokenem s porovnáním v konstantním čase',
    popis: 'Schvalování plateb, přehled objednávek a přepínače vyžadují Bearer '
      + 'token; porovnává se po znacích bez časového úniku a bez tokenu v URL.',
  },
  {
    stav: 'podchyceno',
    nazev: 'Vstupy od inzerentů se čistí a ověřují',
    popis: 'Texty procházejí normalizací, odstraněním řídicích a obousměrných '
      + 'znaků; odkazy jen http(s) bez přihlašovacích údajů; loga se čtou po '
      + 'bajtech (PNG/JPG/WEBP) a servírují se sandboxovanou CSP.',
  },
  {
    stav: 'podchyceno',
    nazev: 'Limity proti zahlcení objednávkami',
    popis: 'Počet objednávek, úprav a nahrání loga z jedné adresy je omezen '
      + 'na hodinu; IP se ukládá jen jako otisk, ne čitelně.',
  },
  {
    stav: 'podchyceno',
    nazev: 'Tajemství nejsou v repozitáři',
    popis: 'Deploy klíče žijí v GitHub Actions Secrets, ADMIN_TOKEN ve Wrangler '
      + 'secrets. V kódu ani v historii commitů žádné tokeny nejsou.',
  },
  {
    stav: 'podchyceno',
    nazev: 'Web nesbírá osobní údaje návštěvníků',
    popis: 'Žádné cookies, žádná analytika třetích stran, žádné odesílání '
      + 'zadaných jmen — výběr i rodina zůstávají v prohlížeči (localStorage).',
  },
  {
    stav: 'podchyceno',
    nazev: 'Oddělení webu a reklamní služby',
    popis: 'Výpadek reklamní služby web nepoloží — plochy se schovají a obsah '
      + 'jede dál. CORS pouští jen vyjmenované domény.',
  },
]

// ── právo ─────────────────────────────────────────────────────────────────

export const PRAVO: PolozkaAuditu[] = [
  {
    stav: 'podchyceno',
    nazev: 'Provozovatel je uvedený a jeho IČO ověřené',
    popis: 'Vítězslav Miček, IČO 07347219, Těšínská 1240/50b, Havířov — údaje '
      + 'jsou v patičce webu i na objednávce reklamy. IČO prochází kontrolou '
      + 'kontrolní číslice, takže se do provozu nedostane překlep.',
  },
  {
    stav: 'ceka-na-vas',
    nazev: 'Bez podnikatelského účtu se reklama neprodává',
    popis: 'Účet je zatím zástupný, a proto služba objednávky vůbec nepřijímá '
      + '(vrací 503 a samoobsluha to rovnou napíše). Je to schválně: zákazník '
      + 'by jinak dostal pokyn poslat peníze na neexistující účet a plocha by '
      + 'se mezitím tvářila jako obsazená.',
    akce: 'Až bude účet založený, zapsat ho do ads-worker/wrangler.toml '
      + '(BANKOVNI_UCET) a do wrangler.jsonc (NEXT_PUBLIC_UCET) — nebo místo '
      + 'toho nastavit ComGate. Prodej se odemkne sám.',
  },
  {
    stav: 'ceka-na-vas',
    nazev: 'Schránky na svetjmen.cz musí začít doručovat',
    popis: 'V patičce i v objednávce je info@svetjmen.cz a reklama@svetjmen.cz. '
      + 'Doména se zakládá; dokud schránky nefungují, nikdo se na uvedený '
      + 'kontakt nedovolá — a kontakt na provozovatele je zákonná povinnost.',
    akce: 'Po zprovoznění domény založit obě schránky a poslat si zkušební '
      + 'zprávu. Pak sem stav přepnout na „podchyceno".',
  },
  {
    stav: 'ceka-na-vas',
    nazev: 'Objednávky reklamy obsahují osobní údaje',
    popis: 'E-mail a případně IČO inzerenta jsou osobní údaje — vy jste jejich '
      + 'správce podle GDPR. Stránka /soukromi to popisuje; je potřeba, aby '
      + 'uvedený kontakt skutečně někdo četl.',
    akce: 'Zkontrolovat text /soukromi a /podminky po doplnění provozovatele '
      + 'a mít funkční kontaktní e-mail.',
  },
  {
    stav: 'ceka-na-vas',
    nazev: 'Za obsah cizí reklamy odpovídáte vy — proto ji schvalujete',
    popis: 'Zákon o regulaci reklamy dělá ze šiřitele spoluodpovědnou osobu: '
      + 'za klamavou reklamu nebo reklamu na zakázané zboží se ručí i tehdy, '
      + 'když ji napsal někdo jiný. Služba proto nic nezveřejní bez schválení '
      + '— ale to schválení musí někdo skutečně udělat, jinak zaplacené kampaně '
      + 'jen čekají a nikdo o tom neví.',
    akce: 'Po každé objednávce projít /sprava → „Čeká na schválení": přečíst '
      + 'text a otevřít cílový odkaz. Zamítnutí vždycky s důvodem — inzerent ho '
      + 'vidí ve svém účtu a může text opravit.',
  },
  {
    stav: 'ceka-na-vas',
    nazev: 'Podmínky zatím nepočítají s platbou kartou ani se schvalováním',
    popis: 'Obchodní podmínky popisují převod na účet a nezmiňují, že si '
      + 'provozovatel vyhrazuje právo kreativu neschválit. Obojí je teď v kódu '
      + 'a mělo by být i v textu — jinak by zamítnutí vypadalo jako svévole.',
    akce: 'Do /podminky doplnit dvě věty: že se platí i kartou přes bránu '
      + 'ComGate a že se inzerát zveřejní až po schválení provozovatelem, '
      + 'přičemž při zamítnutí se peníze vracejí (nebo se kreativa opraví).',
  },
  {
    stav: 'podchyceno',
    nazev: 'Placené odkazy nepředávají hodnocení vyhledávačům',
    popis: 'Cílové odkazy inzerentů nesou rel="sponsored nofollow noopener" '
      + 'na webu a "noopener noreferrer nofollow" v náhledu ke schválení. '
      + 'Zaplacený odkaz tak nevypadá jako doporučení redakce — což je '
      + 'i požadavek vyhledávačů.',
  },
  {
    stav: 'podchyceno',
    nazev: 'Reklama je označená',
    popis: 'Každý inzerát nese viditelný štítek REKLAMA — splňuje požadavek '
      + 'zákona o regulaci reklamy na rozlišitelnost od obsahu.',
  },
  {
    stav: 'podchyceno',
    nazev: 'Bez cookie lišty — protože bez cookies',
    popis: 'Web nepoužívá cookies ani jiné sledování, takže souhlasová lišta '
      + 'není potřeba. Kdyby se někdy přidala analytika, musí být bezcookies '
      + '(např. Cloudflare Web Analytics), jinak lišta bude nutná.',
  },
  {
    stav: 'podchyceno',
    nazev: 'Podmínky a soukromí existují a jsou propojené',
    popis: 'Stránky /podminky a /soukromi jsou na webu i v objednávce reklamy '
      + '(souhlas s podmínkami je povinný krok).',
  },
]

// ── peníze a provoz ───────────────────────────────────────────────────────

export const PROVOZ: PolozkaAuditu[] = [
  {
    stav: 'podchyceno',
    nazev: 'Všechno běží na bezplatných úrovních Cloudflare',
    popis: 'Workers (web i reklamní služba), D1 databáze a R2 úložiště log '
      + 'jsou v rámci free tieru. Projekt nemá žádné placené API ani '
      + 'předplatné — bez vašeho zásahu se nemá kde utrácet.',
  },
  {
    stav: 'ceka-na-vas',
    nazev: 'Platební brána: první platba nanečisto',
    popis: 'Brána je napsaná, ale dokud běží s COMGATE_TEST = "true", žádné '
      + 'peníze nedorazí. Přepnutí na ostrý provoz je jednořádková změna — '
      + 'a jediná věc, kterou se nedá otestovat jinak než skutečnou platbou.',
    akce: 'S COMGATE_TEST = "true" projít celou objednávku od začátku do '
      + 'konce a ověřit, že se objednávka sama přepnula na „aktivní". Pak '
      + 'přepnout na "false", koupit si vlastní kampaň za pár korun (ceník se '
      + 'dá na chvíli snížit) a totéž zopakovat naostro.',
  },
  {
    stav: 'ceka-na-vas',
    nazev: 'Platba kartou stojí provizi — ceník s ní nepočítá',
    popis: 'ComGate si z každé platby bere procenta. U kampaně za 5 000 Kč to '
      + 'jsou desítky až stovky korun, které dnes nikde nejsou započítané. '
      + 'Převod na účet zůstává zadarmo a služba ho umí dál.',
    akce: 'Po podpisu smlouvy si přečíst skutečné sazby a rozhodnout, jestli '
      + 'je vstřebat do ceny (shared/reklama.ts, CENA_MESIC_KC), nebo nechat '
      + 'být — u čtyř kampaní ročně to nemusí stát za zdražení.',
  },
  {
    stav: 'podchyceno',
    nazev: 'Platba nezveřejní kampaň sama',
    popis: 'Notifikace z brány objednávku zaplatí a rezervuje slot, ale '
      + 'kreativa jde na web až po schválení. Automat tedy nemůže vystavit '
      + 'cizí text bez toho, aby ho někdo viděl — a to platí i v noci '
      + 'a o víkendu, kdy platby chodí taky.',
  },
  {
    stav: 'ceka-na-vas',
    nazev: 'Upozornění na útratu v Cloudflare',
    popis: 'Pojistka pro klid: kdyby provoz někdy přerostl free tier, ať '
      + 'přijde e-mail dřív, než faktura.',
    akce: 'Cloudflare dashboard → Notifications → přidat Billing a '
      + 'Usage-based upozornění na e-mail.',
  },
  {
    stav: 'ceka-na-vas',
    nazev: 'Doména svetjmen.cz čeká na delegování',
    popis: 'Doména zatím nemá jmenné servery a v DNS není nic, takže ji nejde '
      + 'připojit. Konfigurace je připravená: až bude zóna v Cloudflare aktivní, '
      + 'stačí odkomentovat routes ve wrangler.jsonc a ads-worker/wrangler.toml '
      + 'a nasadit — wrangler doménu připojí a DNS záznamy si založí sám.',
    akce: 'U registrátora přepsat jmenné servery na ty z Cloudflare, počkat na '
      + 'stav Active, pak dát vědět. Celý postup i s mapou adres: docs/DOMENA.md.',
  },
  {
    stav: 'podchyceno',
    nazev: 'Rotace reklam se zapne až po vyprodání prvního kola',
    popis: 'Než se obsadí všech 10 ploch prvního kola, nic se nepřeklápí — '
      + 'zaplacená reklama je vidět nepřetržitě místo toho, aby se střídala '
      + 's prázdným místem. Druhá strana pozice se do té doby vůbec neprodává '
      + '(služba objednávku odmítne) a v podmínkách je to napsané, aby to '
      + 'inzerenta nezaskočilo.',
  },
  {
    stav: 'podchyceno',
    nazev: 'Nasazení jede přes CI s kontrolami',
    popis: 'Každý push projde typy, kontrolou dat, 78 testy a po nasazení '
      + 'SEO kontrolou 279 adres. Rozbitá verze se pozná hned.',
  },
]

// ── doporučení dál ────────────────────────────────────────────────────────

export const DOPORUCENI: string[] = [
  'Zapnout Cloudflare Web Analytics (bez cookies, zdarma) — ať je vidět návštěvnost a odkud lidé chodí, bez právních povinností navíc.',
  'Po nasazení nové verze spouštět skript IndexNow (npm run indexnow) — vyhledávače se o změnách dozvědí během hodin, ne týdnů.',
  'Psát obsah na dotazy, které lidé hledají: „jména pro holčičky 2026", „jak vybrat jméno k příjmení" — podklad je v docs/CONTENT_ROADMAP.md.',
  'Ceník reklamy ladit podle obsazenosti: když se plochy plní, zdražit další období; když zejí prázdnotou, nabídnout první měsíc levněji.',
  'Jednou za čtvrt rok projít dobové zařazení jmen (lib/names/vlny.ts, ROK_REVIZE) — bez revize štítky „jde nahoru" zestárnou.',
  'Až bude vlastní doména, nechat si zkontrolovat podmínky a soukromí právníkem — texty jsou poctivé, ale nejsou právní služba.',
]

// ── co AI postavila (inventura) ──────────────────────────────────────────

export const INVENTURA: { oblast: string; polozky: string[] }[] = [
  {
    oblast: 'Web pro návštěvníky',
    polozky: [
      'Katalog 1443 jmen (děti + 15 druhů zvířat, 25 zemí), 241 jmen s vlastní stránkou',
      'Rodinné ladění: jméno k příjmení, rodičům, sourozencům; skóre s vypsanými důvody',
      'Výběr: srdíčka, hvězdičky, hlasy členů rodiny, levý panel, stránka analýzy',
      'Nástroje: dvojice, porovnání, jméno k příjmení, neshoda rodičů, test jména',
      'Volání, oslovení a zdrobněliny generované českou morfologií',
    ],
  },
  {
    oblast: 'Reklamní služba (samostatný Worker + D1 + R2)',
    polozky: [
      'Samoobslužná objednávka: plocha, období, cena, platba převodem s VS',
      'Admin API: potvrzení platby, přehled, denní úklid prošlých kampaní',
      'Přepínače webu (reklamy, panel, analýza) čtené webem za běhu',
    ],
  },
  {
    oblast: 'Provoz',
    polozky: [
      'GitHub Actions: typy → data → testy → build → nasazení → SEO kontrola',
      'Mapa webu po vrstvách, robots, IndexNow skript, strukturovaná data',
      'Stránka /sprava: přihlášení tokenem, objednávky, přepínače, tento audit',
    ],
  },
]
