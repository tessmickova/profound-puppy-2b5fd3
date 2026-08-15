// Samoobsluha pro firmy: vyberou plochu, délku kampaně, naklikají inzerát,
// hned vidí, jak bude na webu vypadat, a odešlou objednávku.
//
// Stránka je schválně jeden soubor bez závislostí — reklamní služba má být
// co nejjednodušší, aby neměla co pokazit.

import type { Prostredi } from './db'

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

/**
 * Klíč, pod kterým si samoobsluha nechá token objednávky v prohlížeči.
 *
 * Před odchodem do brány zákazník opustí stránku a token by mu zmizel
 * z očí. Návratová stránka běží na téže adrese, takže si ho odtud přečte
 * a ukáže znovu — do URL ho dávat nechceme, ta se leckde zapisuje.
 */
const ULOZISTE_TOKENU = 'svetjmen-ads-token'

export function samoobsluha(env: Prostredi): string {
  // Adresa webu je v nastavení služby. Odkazy na podmínky a soukromí musí
  // mířit tam, kde web skutečně běží — na náhledu i v produkci.
  const web = (env.WEB_URL ?? '').trim().replace(/\/$/, '')
    || (env.POVOLENE_ORIGINY ?? '').split(',')[0]?.trim()
    || ''
  const kontakt = env.PROVOZOVATEL_EMAIL ?? ''

  return `<!doctype html>
<html lang="cs">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>Reklama na Světě jmen — vyberte si plochu</title>
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='8' fill='%23d97757'/%3E%3C/svg%3E">
<style>
  :root {
    --papir:#faf6ef; --karta:#fff; --linka:#e8dfd2; --text:#2b2723;
    --tlumene:#8a7f71; --akcent:#d97757; --akcent-tmavy:#c4633f;
  }
  * { box-sizing:border-box; }
  body {
    margin:0; background:var(--papir); color:var(--text);
    font:16px/1.55 system-ui, -apple-system, "Segoe UI", sans-serif;
  }
  .obal { max-width:1080px; margin:0 auto; padding:32px 20px 64px; }
  h1 { font-size:clamp(28px,5vw,40px); line-height:1.15; margin:0 0 8px; letter-spacing:-.02em; }
  h2 { font-size:20px; margin:0 0 4px; }
  .podnadpis { color:var(--tlumene); max-width:60ch; margin:0 0 32px; }
  .krok { background:var(--karta); border:1px solid var(--linka); border-radius:20px; padding:20px; margin-bottom:16px; }
  .krok > p { color:var(--tlumene); font-size:14px; margin:0 0 16px; }
  .cislo {
    display:inline-flex; align-items:center; justify-content:center; width:26px; height:26px;
    border-radius:9px; background:var(--text); color:var(--papir); font-size:14px; font-weight:700; margin-right:8px;
  }
  .hlava-kroku { display:flex; align-items:center; margin-bottom:2px; }
  /* Ploch je třicet — ať kvůli nim nemusí nikdo scrollovat přes celou stránku. */
  .rolovaci { max-height:340px; overflow-y:auto; border:1px solid var(--linka); border-radius:14px; }
  table { width:100%; border-collapse:collapse; font-size:14px; }
  th, td { text-align:left; padding:9px 10px; border-bottom:1px solid var(--linka); }
  tbody tr:last-child td { border-bottom:0; }
  th {
    position:sticky; top:0; z-index:1; background:var(--karta);
    color:var(--tlumene); font-weight:600; font-size:12px; text-transform:uppercase; letter-spacing:.04em;
    box-shadow:0 1px 0 var(--linka);
  }
  tbody tr { cursor:pointer; }
  tbody tr:hover { background:var(--papir); }
  tbody tr.je-vybrana { background:#fdf1ec; }
  tbody tr.obsazena { opacity:.45; cursor:not-allowed; }
  .volno { font-variant-numeric:tabular-nums; }
  .obdobi { display:flex; flex-wrap:wrap; gap:10px; }
  .obdobi label {
    flex:1 1 180px; border:1px solid var(--linka); border-radius:14px; padding:12px 14px; cursor:pointer;
  }
  .obdobi label:has(input:checked) { border-color:var(--akcent); background:#fdf1ec; }
  .obdobi input { margin-right:8px; }
  .obdobi .cena { display:block; font-size:20px; font-weight:700; margin-top:4px; }
  .obdobi .sleva { color:var(--akcent); font-size:12px; }
  .pole { display:block; margin-bottom:14px; }
  .pole span { display:block; font-size:13px; font-weight:600; margin-bottom:4px; }
  .pole em { font-style:normal; color:var(--tlumene); font-weight:400; }
  input[type=text], input[type=email], input[type=url], textarea, select {
    width:100%; font:inherit; font-size:15px; padding:9px 12px; border:1px solid var(--linka);
    border-radius:12px; background:var(--papir); color:var(--text);
  }
  textarea { resize:vertical; min-height:74px; }
  input:focus, textarea:focus, select:focus { outline:2px solid var(--akcent); outline-offset:1px; }
  .dvojice { display:grid; grid-template-columns:1fr 1fr; gap:0 14px; }
  @media (max-width:640px) { .dvojice { grid-template-columns:1fr; } }
  .ikony { display:flex; flex-wrap:wrap; gap:6px; }
  .ikony button {
    font:inherit; font-size:13px; padding:5px 11px; border-radius:999px; cursor:pointer;
    border:1px solid var(--linka); background:var(--papir); color:var(--text);
  }
  .ikony button[aria-pressed=true] { border-color:var(--text); background:var(--text); color:var(--papir); }
  .nahled { position:sticky; top:16px; }
  .rozvrzeni { display:grid; grid-template-columns:1fr 300px; gap:16px; align-items:start; }
  @media (max-width:900px) { .rozvrzeni { grid-template-columns:1fr; } .nahled { position:static; } }
  .reklama {
    background:var(--karta); border:1px solid var(--linka); border-radius:18px; padding:14px;
  }
  .reklama .hlava { display:flex; align-items:center; justify-content:space-between; gap:8px; margin-bottom:8px; }
  .reklama .znacka { display:flex; align-items:center; gap:6px; font-size:12px; font-weight:600; color:var(--tlumene); }
  .reklama .znacka img { width:18px; height:18px; object-fit:contain; border-radius:4px; }
  .reklama .stitek { font-size:10px; text-transform:uppercase; letter-spacing:.06em; color:#b0a595; }
  .reklama h3 { margin:0 0 4px; font-size:16px; line-height:1.3; }
  .reklama p { margin:0 0 10px; font-size:13px; color:#6b6156; }
  .reklama .cta { font-size:13px; font-weight:700; color:var(--akcent-tmavy); }
  .odeslat {
    font:inherit; font-weight:700; font-size:16px; width:100%; padding:14px; border:0; cursor:pointer;
    border-radius:999px; background:var(--akcent); color:#fff;
  }
  .odeslat:disabled { opacity:.45; cursor:not-allowed; }
  .souhlas { display:flex; gap:10px; font-size:13px; color:var(--tlumene); margin:0 0 14px; }
  .hlaska { border-radius:14px; padding:12px 14px; font-size:14px; margin-bottom:14px; }
  .hlaska.chyba { background:#fdecea; color:#8f2f28; }
  .hlaska.ok { background:#eef6ee; color:#2f6b39; }
  .shrnuti { background:var(--papir); border:1px dashed var(--linka); border-radius:14px; padding:14px; font-size:14px; }
  .shrnuti dl { display:grid; grid-template-columns:auto 1fr; gap:4px 12px; margin:0; }
  .shrnuti dt { color:var(--tlumene); }
  .shrnuti dd { margin:0; font-weight:600; }
  footer { margin-top:40px; font-size:13px; color:var(--tlumene); }
  footer a { color:var(--tlumene); }
  .schovano { display:none; }
</style>
</head>
<body data-web="${esc(web)}">
<div class="obal">
  <h1>Reklama, která vypadá jako zbytek webu</h1>
  <p class="podnadpis">
    Žádné blikající bannery. Váš inzerát se zobrazí jako běžná karta Světa jmen —
    lidem, kteří právě vybírají jméno pro dítě nebo zvíře. Vyberte si plochu,
    naklikejte text a hned uvidíte, jak to bude vypadat.
  </p>

  <div class="rozvrzeni">
    <div>
      <section class="krok">
        <div class="hlava-kroku"><span class="cislo">1</span><h2>Vyberte plochu</h2></div>
        <p>Na každé ploše se střídají nejvýš čtyři inzeráty, každý je vidět půl minuty.</p>
        <div id="tabulka">Načítám volné plochy…</div>
      </section>

      <section class="krok" id="krok-obdobi" hidden>
        <div class="hlava-kroku"><span class="cislo">2</span><h2>Na jak dlouho</h2></div>
        <p>Ceny jsou bez DPH. Kampaň se po skončení sama vypne a slot se uvolní — nic se neobnovuje automaticky, takže vám nic nebude tiše ubíhat.</p>
        <div class="obdobi" id="obdobi"></div>
      </section>

      <section class="krok" id="krok-inzerat" hidden>
        <div class="hlava-kroku"><span class="cislo">3</span><h2>Jak má inzerát vypadat</h2></div>
        <p>Formát je daný, aby reklama nerušila. Vyplňte texty a vpravo hned uvidíte výsledek.</p>

        <label class="pole"><span>Značka <em>— jak se jmenujete u inzerátu</em></span>
          <input type="text" id="znacka" maxlength="32" placeholder="Známkárna.cz"></label>
        <label class="pole"><span>Nadpis <em>— nejvýš 48 znaků</em></span>
          <input type="text" id="nadpis" maxlength="48" placeholder="Gravírovaná známka na obojek"></label>
        <label class="pole"><span>Text <em>— nejvýš 150 znaků</em></span>
          <textarea id="text" maxlength="150" placeholder="Jméno i telefon vyrytý do nerezu. Vyrobíme do druhého dne."></textarea></label>
        <div class="dvojice">
          <label class="pole"><span>Text tlačítka</span>
            <input type="text" id="cta" maxlength="24" placeholder="Vybrat známku"></label>
          <label class="pole"><span>Odkaz</span>
            <input type="url" id="odkaz" placeholder="https://…"></label>
        </div>

        <label class="pole"><span>Logo <em>— PNG, JPG nebo WEBP do 200 kB; na kartě je vidět místo ikony</em></span>
          <input type="file" id="logo" accept="image/png,image/jpeg,image/webp"></label>

        <div class="pole"><span>Ikona <em>— použije se, jen když logo nenahrajete</em></span>
          <div class="ikony" id="ikony"></div>
        </div>
      </section>

      <section class="krok" id="krok-firma" hidden>
        <div class="hlava-kroku"><span class="cislo">4</span><h2>Fakturační údaje</h2></div>
        <p>Potřebujeme jen tohle — nic dalšího o vás neevidujeme.</p>
        <div class="dvojice">
          <label class="pole"><span>Firma</span><input type="text" id="firma" maxlength="80"></label>
          <label class="pole"><span>IČO <em>— nepovinné</em></span><input type="text" id="ico" maxlength="12"></label>
        </div>
        <label class="pole"><span>E-mail <em>— sem pošleme pokyny k platbě</em></span>
          <input type="email" id="email" maxlength="120"></label>

        <p class="souhlas">
          <input type="checkbox" id="souhlas">
          <label for="souhlas">Souhlasím s <a href="${esc(web)}/podminky" target="_blank" rel="noopener">obchodními podmínkami</a>
            a beru na vědomí <a href="${esc(web)}/soukromi" target="_blank" rel="noopener">zpracování osobních údajů</a>.</label>
        </p>
        <div id="hlaska"></div>
        <button class="odeslat" id="odeslat" disabled>Odeslat objednávku</button>
      </section>

      <section class="krok schovano" id="krok-hotovo">
        <div class="hlava-kroku"><span class="cislo">✓</span><h2>Objednávka je u nás</h2></div>
        <div id="pokyny"></div>
      </section>
    </div>

    <aside class="nahled">
      <div class="krok">
        <h2 style="font-size:14px;color:var(--tlumene);margin-bottom:10px;">Náhled na webu</h2>
        <div class="reklama">
          <div class="hlava">
            <span class="znacka"><img id="n-logo" alt="" hidden style="width:16px;height:16px;object-fit:contain"><span id="n-ikona">✦</span><span id="n-znacka">Vaše značka</span></span>
            <span class="stitek">sponzorováno</span>
          </div>
          <h3 id="n-nadpis">Nadpis inzerátu</h3>
          <p id="n-text">Dvě věty o tom, co nabízíte. Klidně konkrétně — lidé sem chodí něco vybírat.</p>
          <span class="cta"><span id="n-cta">Text tlačítka</span> →</span>
        </div>
        <div class="shrnuti" id="shrnuti" style="margin-top:14px;">
          <dl>
            <dt>Plocha</dt><dd id="s-plocha">—</dd>
            <dt>Délka</dt><dd id="s-obdobi">—</dd>
            <dt>Cena</dt><dd id="s-cena">—</dd>
          </dl>
        </div>
      </div>
    </aside>
  </div>

  <footer>
    <p>Otázky posílejte na <a href="mailto:${esc(kontakt)}">${esc(kontakt)}</a>.
      Provozovatel: ${esc(env.PROVOZOVATEL ?? '')}${env.PROVOZOVATEL_ICO ? `, IČO ${esc(env.PROVOZOVATEL_ICO)}` : ''}.</p>
  </footer>
</div>

<script>
(function () {
  var IKONY_ZNAKY = {
    'bone':'🦴','dog':'🐕','cat':'🐈','house':'🏠','shield-check':'🛡️','star':'★','baby':'👶',
    'sparkles':'✦','type':'A','users':'👪','globe':'🌍','calendar':'📅','languages':'文'
  };
  var stav = { plocha:null, obdobi:null, ikona:'sparkles', ceny:null, logo:null };
  // Adresa webu ze serveru — odkaz na účet musí vést tam, kde web běží.
  var WEB_ADRESA = document.body.dataset.web || '';
  var ULOZISTE_TOKENU = '${ULOZISTE_TOKENU}';
  var $ = function (id) { return document.getElementById(id); };

  function korun(n) { return n.toLocaleString('cs-CZ') + ' Kč'; }

  fetch('/api/sloty').then(function (r) { return r.json(); }).then(function (d) {
    var radky = d.plochy.map(function (p) {
      var plno = p.volno === 0;
      return '<tr data-id="' + p.id + '" class="' + (plno ? 'obsazena' : '') + '">' +
        '<td><strong>' + p.nazev + '</strong><br><span style="color:var(--tlumene);font-size:12px">' + p.stranka + '</span></td>' +
        '<td class="volno">' + (plno ? 'obsazeno' : p.volno + ' z ' + d.kapacita) + '</td>' +
        '<td>' + korun(p.ceny.mesic) + ' / měsíc</td></tr>';
    }).join('');
    $('tabulka').innerHTML = '<div class="rolovaci"><table><thead><tr><th>Plocha</th><th>Volno</th><th>Od</th></tr></thead><tbody>' + radky + '</tbody></table></div>';

    // Než je kam poslat peníze, nemá smysl nechat někoho vyplnit celý
    // formulář a teprve na konci mu říct, že to nejde. Ceník ať vidí.
    if (d.prodejPozastaven) {
      var zprava = document.createElement('p');
      zprava.className = 'poznamka';
      zprava.setAttribute('role', 'status');
      zprava.innerHTML = '<strong>Objednávky jsou dočasně pozastavené.</strong> '
        + 'Dokončujeme nastavení plateb. Napište nám a ozveme se, jakmile to půjde — '
        + '<a href="mailto:${esc(kontakt)}">${esc(kontakt)}</a>.';
      $('tabulka').appendChild(zprava);
      var krokPlocha = $('krok-plocha');
      if (krokPlocha) krokPlocha.querySelectorAll('tr').forEach(function (r) { r.classList.add('obsazena'); });
      return;
    }

    stav.ceny = {};
    d.plochy.forEach(function (p) { stav.ceny[p.id] = { ceny: p.ceny, nazev: p.nazev, volno: p.volno }; });

    // Zákazník přichází z náhledu na webu, kde si plochu i délku už vybral.
    var zAdresy = new URLSearchParams(location.search);
    if (zAdresy.get('plocha') && stav.ceny[zAdresy.get('plocha')]) {
      var radek = document.querySelector('tr[data-id="' + zAdresy.get('plocha') + '"]');
      if (radek && !radek.classList.contains('obsazena')) {
        radek.classList.add('je-vybrana');
        radek.scrollIntoView({ block: 'nearest' });
        stav.plocha = zAdresy.get('plocha');
        $('s-plocha').textContent = stav.ceny[stav.plocha].nazev;
        vykresliObdobi(d.obdobi);
        $('krok-obdobi').hidden = false;
        $('krok-inzerat').hidden = false;
        $('krok-firma').hidden = false;
        var chtene = zAdresy.get('obdobi');
        var prepinac = document.querySelector('#obdobi input[value="' + chtene + '"]');
        if (prepinac) { prepinac.checked = true; prepinac.dispatchEvent(new Event('change', { bubbles: true })); }
        prekresli();
      }
    }

    $('tabulka').addEventListener('click', function (e) {
      var tr = e.target.closest('tr[data-id]');
      if (!tr || tr.classList.contains('obsazena')) return;
      Array.prototype.forEach.call(document.querySelectorAll('tr.je-vybrana'), function (x) { x.classList.remove('je-vybrana'); });
      tr.classList.add('je-vybrana');
      stav.plocha = tr.dataset.id;
      $('s-plocha').textContent = stav.ceny[stav.plocha].nazev;
      vykresliObdobi(d.obdobi);
      $('krok-obdobi').hidden = false;
      $('krok-inzerat').hidden = false;
      $('krok-firma').hidden = false;
      prekresli();
    });

    var ikony = d.ikony.map(function (k) {
      return '<button type="button" data-ikona="' + k + '" aria-pressed="' + (k === stav.ikona) + '">' +
        (IKONY_ZNAKY[k] || '✦') + '</button>';
    }).join('');
    $('ikony').innerHTML = ikony;
    $('ikony').addEventListener('click', function (e) {
      var b = e.target.closest('button[data-ikona]');
      if (!b) return;
      stav.ikona = b.dataset.ikona;
      Array.prototype.forEach.call($('ikony').children, function (x) {
        x.setAttribute('aria-pressed', String(x === b));
      });
      prekresli();
    });
  }).catch(function () {
    $('tabulka').innerHTML = '<p class="hlaska chyba">Seznam ploch se teď nepodařilo načíst. Zkuste to prosím za chvíli.</p>';
  });

  function vykresliObdobi(obdobi) {
    var c = stav.ceny[stav.plocha].ceny;
    var mesicne = c.mesic;
    var popisky = {};
    $('obdobi').innerHTML = obdobi.map(function (o) {
      return '<label><input type="radio" name="obdobi" value="' + o.id + '">' + o.nazev +
        '<span class="cena">' + korun(c[o.id]) + '</span>' +
        (popisky[o.id] ? '<span class="sleva">' + popisky[o.id] + '</span>' : '<span class="sleva">&nbsp;</span>') +
        '</label>';
    }).join('');
    $('obdobi').addEventListener('change', function (e) {
      stav.obdobi = e.target.value;
      var vybrane = obdobi.filter(function (o) { return o.id === stav.obdobi; })[0];
      $('s-obdobi').textContent = vybrane ? vybrane.nazev : stav.obdobi;
      $('s-cena').textContent = korun(c[stav.obdobi]) + ' bez DPH';
      prekresli();
    });
    void mesicne;
  }

  // Logo se odešle až po vytvoření objednávky — do té chvíle ho jen ukazujeme.
  $('logo').addEventListener('change', function () {
    var soubor = this.files && this.files[0];
    if (!soubor) { stav.logo = null; $('n-logo').hidden = true; $('n-ikona').hidden = false; prekresli(); return; }
    if (soubor.size > 200 * 1024) {
      $('hlaska').innerHTML = '<p class="hlaska chyba">Logo je větší než 200 kB. Zmenšete ho prosím.</p>';
      this.value = ''; return;
    }
    stav.logo = soubor;
    $('n-logo').src = URL.createObjectURL(soubor);
    $('n-logo').hidden = false;
    $('n-ikona').hidden = true;
    prekresli();
  });

  ['znacka','nadpis','text','cta','odkaz','email','firma','souhlas'].forEach(function (id) {
    $(id).addEventListener('input', prekresli);
    $(id).addEventListener('change', prekresli);
  });

  function prekresli() {
    $('n-znacka').textContent = $('znacka').value || 'Vaše značka';
    $('n-nadpis').textContent = $('nadpis').value || 'Nadpis inzerátu';
    $('n-text').textContent = $('text').value || 'Dvě věty o tom, co nabízíte. Klidně konkrétně — lidé sem chodí něco vybírat.';
    $('n-cta').textContent = $('cta').value || 'Text tlačítka';
    $('n-ikona').textContent = IKONY_ZNAKY[stav.ikona] || '✦';
    $('odeslat').disabled = !(
      stav.plocha && stav.obdobi &&
      $('znacka').value.trim().length > 1 &&
      $('nadpis').value.trim().length > 5 &&
      $('text').value.trim().length > 19 &&
      $('cta').value.trim().length > 2 &&
      /^https?:\\/\\//.test($('odkaz').value.trim()) &&
      $('firma').value.trim().length > 1 &&
      /^[^\\s@]+@[^\\s@]+\\.[^\\s@]{2,}$/.test($('email').value.trim()) &&
      $('souhlas').checked
    );
  }

  $('odeslat').addEventListener('click', function () {
    $('odeslat').disabled = true;
    $('hlaska').innerHTML = '';
    fetch('/api/objednavka', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        plocha: stav.plocha, obdobi: stav.obdobi, ikona: stav.ikona,
        firma: $('firma').value, ico: $('ico').value, email: $('email').value,
        znacka: $('znacka').value, nadpis: $('nadpis').value, text: $('text').value,
        cta: $('cta').value, odkaz: $('odkaz').value, souhlas: $('souhlas').checked
      })
    }).then(function (r) { return r.json().then(function (d) { return { ok: r.ok, d: d }; }); })
      .then(function (v) {
        if (!v.ok) {
          $('hlaska').innerHTML = '<p class="hlaska chyba">' + (v.d.chyba || 'Objednávku se nepodařilo uložit.') + '</p>';
          $('odeslat').disabled = false;
          return;
        }
        var d = v.d;
        var platba = d.platba || {};
        $('krok-firma').hidden = true;
        $('krok-obdobi').hidden = true;
        $('krok-inzerat').hidden = true;
        $('krok-hotovo').classList.remove('schovano');

        // Token si necháme v prohlížeči. Po odchodu do brány zmizí stránka
        // i s ním a zákazník by se ke svému účtu nedostal.
        try { localStorage.setItem(ULOZISTE_TOKENU, d.token); } catch (e) { /* soukromý režim */ }

        // Logo jde nahoru jako holé tělo požadavku — službě stačí typ souboru.
        // Vrací slib, protože při platbě kartou musí doletět dřív, než
        // zákazníka pošleme do brány; přesměrování by ho utnulo v půli.
        function posliLogo() {
          if (!stav.logo) return Promise.resolve();
          return fetch('/api/objednavka/' + d.token + '/logo', {
            method: 'POST',
            headers: { 'Content-Type': stav.logo.type },
            body: stav.logo,
          }).then(function (r) {
            var el = $('logo-stav');
            if (el) {
              el.innerHTML = r.ok
                ? '<p class="hlaska ok">Logo je nahrané, na kartě se ukáže místo ikony.</p>'
                : '<p class="hlaska chyba">Logo se nepodařilo nahrát. Zkuste ho prosím poslat znovu na adrese níž.</p>';
            }
          }).catch(function () {
            var el = $('logo-stav');
            if (el) el.innerHTML = '<p class="hlaska chyba">Logo se nepodařilo nahrát. Zkuste ho prosím poslat znovu na adrese níž.</p>';
          });
        }

        var klicUctu =
          '<p style="font-size:14px;margin-top:14px"><strong>Tohle je klíč k vašemu účtu inzerenta.</strong> ' +
          'Uložte si ho — otevřete jím stav kampaně, pokyny k platbě i úpravu textu:<br>' +
          '<code style="word-break:break-all;font-size:15px">' + d.token + '</code></p>' +
          '<p style="font-size:14px"><a href="' + WEB_ADRESA + '/reklama/ucet" target="_blank" rel="noopener">Otevřít účet inzerenta →</a></p>';

        if (platba.brana === 'comgate' && platba.url) {
          // Brána odpověděla: zákazník zaplatí hned. Klíč mu ukážeme ještě
          // před odchodem a necháme i ruční odkaz, kdyby přesměrování
          // neproběhlo (blokovač, pomalá síť).
          $('pokyny').innerHTML =
            '<p class="hlaska ok">Máme ji. Za okamžik vás přesměrujeme na platební bránu.</p>' +
            '<div class="shrnuti"><dl>' +
            '<dt>Plocha</dt><dd>' + d.plocha + '</dd>' +
            '<dt>Délka</dt><dd>' + d.obdobi + '</dd>' +
            '<dt>Částka</dt><dd>' + korun(d.cena_kc) + ' bez DPH</dd>' +
            '</dl></div>' +
            '<div id="logo-stav"></div>' +
            klicUctu +
            '<p style="font-size:14px"><a id="do-brany" href="' + platba.url + '">Přejít k platbě →</a></p>';
          window.scrollTo({ top: 0, behavior: 'smooth' });
          posliLogo().then(function () { location.href = platba.url; });
          return;
        }

        // Bez brány (nebo když neodpověděla) platí to, co vždycky:
        // převod s variabilním symbolem.
        $('pokyny').innerHTML =
          '<p class="hlaska ok">Máme ji. Kampaň spustíme, jakmile dorazí platba — obvykle do druhého pracovního dne.</p>' +
          '<div class="shrnuti"><dl>' +
          '<dt>Plocha</dt><dd>' + d.plocha + '</dd>' +
          '<dt>Délka</dt><dd>' + d.obdobi + '</dd>' +
          '<dt>Částka</dt><dd>' + korun(d.cena_kc) + ' bez DPH</dd>' +
          '<dt>Účet</dt><dd>' + platba.ucet + '</dd>' +
          '<dt>Variabilní symbol</dt><dd>' + platba.vs + '</dd>' +
          '</dl></div>' +
          '<div id="logo-stav"></div>' +
          klicUctu +
          '<p style="font-size:13px;color:var(--tlumene)">Kreativu ještě projdeme — na webu se objeví po schválení.</p>';
        posliLogo();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }).catch(function () {
        $('hlaska').innerHTML = '<p class="hlaska chyba">Spojení se nepodařilo navázat. Zkuste to prosím znovu.</p>';
        $('odeslat').disabled = false;
      });
  });
})();
</script>
</body>
</html>`
}

// ── návrat z platební brány ──────────────────────────────────────────────

/** Co návratová stránka o objednávce ví. Sestavuje to `index.ts` z databáze. */
export interface StavNavratu {
  refId: string
  /** našli jsme k `refId` objednávku? */
  nalezena: boolean
  /** objednávka je zaplacená a slot běží */
  zaplaceno: boolean
  /** pořád čeká na platbu — brána nám ještě nic nepotvrdila */
  ceka: boolean
  /** kreativu už majitelka schválila */
  schvaleno: boolean
  plocha: string
  cena_kc: number
  vs: string
}

/**
 * Stránka, na kterou se zákazník vrací z brány.
 *
 * Nic neaktivuje a nic nemění — jen převypráví stav, který v databázi
 * najde. O zaplacení rozhoduje notifikace z brány, a ta může dorazit
 * o vteřinu později než zákazník; proto stránka nikdy netvrdí „nezaplatili
 * jste", jen „ještě to k nám nedoputovalo".
 */
export function strankaNavratu(env: Prostredi, stav: StavNavratu): string {
  const web = (env.WEB_URL ?? '').trim().replace(/\/$/, '')
    || (env.POVOLENE_ORIGINY ?? '').split(',')[0]?.trim()
    || ''
  const kontakt = env.PROVOZOVATEL_EMAIL ?? ''

  let druh: 'ok' | 'ceka' | 'chyba'
  let nadpis: string
  let veta: string

  if (!stav.nalezena) {
    druh = 'chyba'
    nadpis = 'Tuhle objednávku neznáme'
    veta = 'Adresa nejspíš není úplná. Zkuste otevřít účet inzerenta svým klíčem — '
      + 'stav kampaně je vidět tam.'
  } else if (stav.zaplaceno) {
    druh = 'ok'
    nadpis = 'Zaplaceno, děkujeme'
    // Zaplacení není zveřejnění — říct to tady je poctivější než nechat
    // zákazníka půl dne hledat svůj inzerát na webu.
    veta = stav.schvaleno
      ? 'Kampaň běží a inzerát je na webu vidět.'
      : 'Kampaň máme zaplacenou. Než ji spustíme, projdeme ještě text a odkaz — '
        + 'obvykle do jednoho pracovního dne. Pak se inzerát objeví na webu sám.'
  } else if (stav.ceka) {
    druh = 'ceka'
    nadpis = 'Platbu zatím nemáme'
    veta = 'Může to být jen chvilka zpoždění — potvrzení z brány chodí zvlášť. '
      + 'Zkuste za minutu obnovit stránku. Když platba neproběhla, dá se poslat '
      + 'i běžným převodem na variabilní symbol ' + stav.vs + '.'
  } else {
    druh = 'chyba'
    nadpis = 'Kampaň už neběží'
    veta = 'Objednávka byla zrušená nebo jí skončila platnost. Napište nám a najdeme, co s tím.'
  }

  return `<!doctype html>
<html lang="cs">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>${esc(nadpis)} — reklama na Světě jmen</title>
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='8' fill='%23d97757'/%3E%3C/svg%3E">
<style>
  :root {
    --papir:#faf6ef; --karta:#fff; --linka:#e8dfd2; --text:#2b2723;
    --tlumene:#8a7f71; --akcent:#d97757;
  }
  * { box-sizing:border-box; }
  body {
    margin:0; background:var(--papir); color:var(--text);
    font:16px/1.55 system-ui, -apple-system, "Segoe UI", sans-serif;
  }
  .obal { max-width:620px; margin:0 auto; padding:48px 20px 64px; }
  h1 { font-size:clamp(24px,4vw,32px); line-height:1.2; margin:0 0 10px; letter-spacing:-.02em; }
  .karta { background:var(--karta); border:1px solid var(--linka); border-radius:20px; padding:22px; }
  .hlaska { border-radius:14px; padding:12px 14px; font-size:14px; margin:0 0 16px; }
  .hlaska.ok { background:#eef6ee; color:#2f6b39; }
  .hlaska.ceka { background:#fdf3e3; color:#8a5d16; }
  .hlaska.chyba { background:#fdecea; color:#8f2f28; }
  dl { display:grid; grid-template-columns:auto 1fr; gap:4px 12px; margin:0 0 16px; font-size:14px; }
  dt { color:var(--tlumene); }
  dd { margin:0; font-weight:600; }
  code { word-break:break-all; background:#f6ece2; border-radius:6px; padding:2px 6px; font-size:14px; }
  a { color:var(--akcent); }
  footer { margin-top:28px; font-size:13px; color:var(--tlumene); }
  .schovano { display:none; }
</style>
</head>
<body>
<div class="obal">
  <h1>${esc(nadpis)}</h1>
  <div class="karta">
    <p class="hlaska ${druh}">${esc(veta)}</p>
    ${stav.nalezena ? `<dl>
      <dt>Plocha</dt><dd>${esc(stav.plocha)}</dd>
      <dt>Částka</dt><dd>${stav.cena_kc.toLocaleString('cs-CZ')} Kč bez DPH</dd>
      <dt>Variabilní symbol</dt><dd>${esc(stav.vs)}</dd>
    </dl>` : ''}
    <div id="klic" class="schovano">
      <p style="font-size:14px"><strong>Klíč k vašemu účtu inzerenta:</strong><br>
        <code id="klic-hodnota"></code></p>
    </div>
    <p style="font-size:14px"><a href="${esc(web)}/reklama/ucet">Otevřít účet inzerenta →</a></p>
  </div>
  <footer>
    <p>Něco nesedí? Napište na <a href="mailto:${esc(kontakt)}">${esc(kontakt)}</a>.</p>
  </footer>
</div>
<script>
(function () {
  // Klíč jsme si schovali do prohlížeče ještě před odchodem do brány —
  // v adrese být nesmí, ta se zapisuje do historie i do logů.
  try {
    var k = localStorage.getItem('${ULOZISTE_TOKENU}');
    if (k) {
      document.getElementById('klic-hodnota').textContent = k;
      document.getElementById('klic').classList.remove('schovano');
    }
  } catch (e) { /* soukromý režim */ }
})();
</script>
</body>
</html>`
}
