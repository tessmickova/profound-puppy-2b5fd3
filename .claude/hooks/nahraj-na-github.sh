#!/usr/bin/env bash
# Na konci každého kroku nahraje hotové commity na GitHub.
#
# Cílem je, aby zdrojový kód nikdy nežil jen na jednom notebooku nebo jen
# na serveru. Commity se nahrávají samy; rozpracované (necommitnuté) změny
# se nenahrávají — jen se na ně nahlas upozorní, aby se do repozitáře
# omylem nedostalo něco, co tam nepatří (hesla, klíče, dočasné soubory).

set -uo pipefail

koren=$(git -C "${CLAUDE_PROJECT_DIR:-$PWD}" rev-parse --show-toplevel 2>/dev/null) || exit 0
[ -n "$koren" ] || exit 0

vetev=$(git -C "$koren" rev-parse --abbrev-ref HEAD 2>/dev/null)
[ -n "$vetev" ] && [ "$vetev" != "HEAD" ] || exit 0

# Stav na GitHubu čteme přes ls-remote, ne přes origin/<větev>: naklonovaný
# repozitář nemusí mít nastavené sledovací větve a porovnání by pak tiše
# vycházelo jako „všechno je nahráno" — a nenahrálo by se nic.

# Kam vlastně `origin` ukazuje.
#
# 15. 8. 2026 se `origin` v pracovní kopii přepsal zpátky na archivní
# repozitář a tři commity odešly tam. Nikde to nebylo vidět: push hlásil
# úspěch, jen do jiného repozitáře — a protože z kopie se schválně
# nenasazuje, na webu se nic neobjevilo a chyba vyšla najevo až u písem.
# Adresu proto ověřujeme před každým nahráním.
DOMOVSKY='tessmickova/svetjmen'
adresa=$(git -C "$koren" remote get-url origin 2>/dev/null || echo '')
case "$adresa" in
  *"$DOMOVSKY"*) ;;
  *)
    jq -n --arg m "✗ origin ukazuje na '$adresa', ne na $DOMOVSKY — commity by odešly do špatného repozitáře a nikdy se nenasadily.
Napravíš takto:
  git -C $koren remote set-url origin https://github.com/$DOMOVSKY" \
      '{systemMessage:$m,suppressOutput:true}'
    exit 0
    ;;
esac

vzdaleny=$(git -C "$koren" ls-remote origin "refs/heads/$vetev" 2>/dev/null | awk 'NR==1{print $1}')
if [ -z "$vzdaleny" ]; then
  nenahrane=$(git -C "$koren" rev-list --count HEAD 2>/dev/null || echo 0)
else
  git -C "$koren" cat-file -e "$vzdaleny" 2>/dev/null || git -C "$koren" fetch --quiet origin "$vetev" 2>/dev/null
  nenahrane=$(git -C "$koren" rev-list --count "$vzdaleny..HEAD" 2>/dev/null || echo 0)
fi
rozpracovane=$(git -C "$koren" status --porcelain 2>/dev/null)

hlaseni=""

if [ "${nenahrane:-0}" -gt 0 ]; then
  odklad=2
  nahrano=""
  for _ in 1 2 3; do
    if git -C "$koren" push --quiet -u origin "$vetev" 2>/dev/null; then
      nahrano=ano
      break
    fi
    sleep "$odklad"
    odklad=$((odklad * 2))
  done
  if [ -n "$nahrano" ]; then
    hlaseni="✓ Na GitHub nahráno ${nenahrane} commit(ů) → origin/${vetev}"
  else
    hlaseni="✗ Nahrání na GitHub selhalo (${nenahrane} commit(ů) zůstává jen lokálně, větev ${vetev}). Zkus ručně: git -C ${koren} push -u origin ${vetev}"
  fi
fi

if [ -n "$rozpracovane" ]; then
  pocet=$(printf '%s\n' "$rozpracovane" | grep -c .)
  [ -n "$hlaseni" ] && hlaseni="${hlaseni}"$'\n'
  hlaseni="${hlaseni}⚠ Necommitnuté změny (${pocet} souborů) — na GitHubu nejsou. Zkontroluj a commitni je."
fi

[ -n "$hlaseni" ] || exit 0
jq -n --arg m "$hlaseni" '{systemMessage:$m,suppressOutput:true}'
exit 0
