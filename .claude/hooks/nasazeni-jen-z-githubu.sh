#!/usr/bin/env bash
# Nasadit se smí jen to, co je na GitHubu.
#
# 14. 8. 2026 běžela na Cloudflare novější verze webu než ta v repozitáři —
# vývoj z 10.–13. 8. se nikdy nenahrál na GitHub. Nasazení postavené z repozitáře
# pak živý web přepsalo starším kódem. Tenhle hook takový scénář zastaví dřív,
# než změna odejde k návštěvníkům.

set -uo pipefail

vstup=$(cat)
prikaz=$(printf '%s' "$vstup" | jq -r '.tool_input.command // ""')

# Zajímají nás jen příkazy, které něco nasazují.
case "$prikaz" in
  *"wrangler deploy"*|*"wrangler versions upload"*|*"wrangler pages deploy"*|\
  *"opennextjs-cloudflare deploy"*|*"run deploy"*|*"run nasadit"*) ;;
  *) exit 0 ;;
esac

# Zkušební běh nic nemění, ten propouštíme.
case "$prikaz" in *--dry-run*) exit 0 ;; esac

koren=$(git -C "${CLAUDE_PROJECT_DIR:-$PWD}" rev-parse --show-toplevel 2>/dev/null) || exit 0
[ -n "$koren" ] || exit 0

vetev=$(git -C "$koren" rev-parse --abbrev-ref HEAD 2>/dev/null)
rozpracovane=$(git -C "$koren" status --porcelain 2>/dev/null)

# Stav na GitHubu čteme přes ls-remote, ne přes origin/<větev>: naklonovaný
# repozitář nemusí mít nastavené sledovací větve a porovnání by pak tiše
# vycházelo jako „všechno je nahráno" — tedy přesně ta chyba, kterou hlídáme.
vzdaleny=$(git -C "$koren" ls-remote origin "refs/heads/$vetev" 2>/dev/null | awk 'NR==1{print $1}')
if [ -z "$vzdaleny" ]; then
  vetev_chybi=ano
  nenahrane=$(git -C "$koren" rev-list --count HEAD 2>/dev/null || echo 1)
else
  git -C "$koren" cat-file -e "$vzdaleny" 2>/dev/null || git -C "$koren" fetch --quiet origin "$vetev" 2>/dev/null
  nenahrane=$(git -C "$koren" rev-list --count "$vzdaleny..HEAD" 2>/dev/null || echo 1)
fi

duvod=""
if [ -n "${vetev_chybi:-}" ]; then
  duvod="Větev ${vetev} na GitHubu vůbec není.
"
fi
if [ -n "$rozpracovane" ]; then
  duvod="Rozpracované změny, které nejsou v commitu:
$(printf '%s' "$rozpracovane" | head -20)
"
fi
if [ "${nenahrane:-0}" -gt 0 ]; then
  duvod="${duvod}Commity, které nejsou na GitHubu: ${nenahrane} (větev ${vetev})
"
fi

[ -n "$duvod" ] || exit 0

zprava="NASAZENÍ ZASTAVENO — tenhle kód není na GitHubu.

${duvod}
Nejdřív ho nahraj, teprve pak nasazuj:
  git -C ${koren} add -A
  git -C ${koren} commit -m \"popis změny\"
  git -C ${koren} push -u origin ${vetev}

Pravidlo vzniklo po incidentu 14. 8. 2026, kdy nasazení ze zastaralého
repozitáře přepsalo novější živý web."

jq -n --arg r "$zprava" \
  '{hookSpecificOutput:{hookEventName:"PreToolUse",permissionDecision:"deny",permissionDecisionReason:$r}}'
exit 0
