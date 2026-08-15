#!/bin/sh
# Pustí všechny migrace v pořadí. Chybu „sloupec/tabulka už existuje"
# bere jako hotovo — migrace se smí spustit opakovaně.
kam=${1:---remote}
for f in $(ls migrace/*.sql | sort); do
  echo "── $f"
  if vystup=$(npx wrangler d1 execute svetjmen-ads "$kam" -c wrangler.toml --file="$f" 2>&1); then
    continue
  fi
  case "$vystup" in
    *"duplicate column name"*|*"already exists"*) echo "   už bylo provedeno dřív" ;;
    *) echo "$vystup"; exit 1 ;;
  esac
done
echo "Migrace hotové."
