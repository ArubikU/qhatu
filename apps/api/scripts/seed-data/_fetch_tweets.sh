#!/usr/bin/env bash
set -u
KEY="new1_d59b10498cd145ac8a163bf996343203"
BASE="https://api.twitterapi.io/twitter/tweet/advanced_search"
OUT="D:/Github/qhatu/apps/api/scripts/seed-data/_raw_tweets.ndjson"
> "$OUT"

fetch() {
  local q="$1"; local cursor="$2"
  local url="${BASE}?query=${q}&queryType=Latest"
  if [ -n "$cursor" ]; then url="${url}&cursor=${cursor}"; fi
  local tries=0
  while :; do
    resp=$(curl -s -w "\n%{http_code}" "$url" -H "X-API-Key: ${KEY}")
    code=$(printf '%s' "$resp" | tail -n1)
    body=$(printf '%s' "$resp" | sed '$d')
    if [ "$code" = "429" ]; then
      tries=$((tries+1)); [ $tries -gt 5 ] && { echo ""; return; }
      sleep 6; continue
    fi
    printf '%s' "$body"; return
  done
}

# URL-encoded queries
declare -a QUERIES=(
  "funa%20universidad%20%28Lima%20OR%20Per%C3%BA%20OR%20profesor%20OR%20alumno%20OR%20acoso%29%20lang%3Aes"
  "%28Cayetano%20Heredia%20OR%20UNFV%20OR%20%22Federico%20Villarreal%22%29%20%28denuncia%20OR%20queja%20OR%20funa%20OR%20protesta%20OR%20toma%29%20lang%3Aes"
  "%28ESAN%20OR%20%22Cient%C3%ADfica%20del%20Sur%22%20OR%20UCSUR%29%20%28denuncia%20OR%20queja%20OR%20funa%20OR%20clasismo%29%20lang%3Aes"
  "universidad%20Lima%20%28acoso%20OR%20denuncia%20OR%20funa%20OR%20ampay%29%20lang%3Aes"
)

for q in "${QUERIES[@]}"; do
  cursor=""
  for page in 1 2; do
    body=$(fetch "$q" "$cursor")
    [ -z "$body" ] && break
    printf '%s\n' "$body" >> "$OUT"
    cursor=$(printf '%s' "$body" | python -c "import sys,json; d=json.load(sys.stdin); print(d.get('next_cursor','') if d.get('has_next_page') else '')" 2>/dev/null)
    sleep 5
    [ -z "$cursor" ] && break
  done
done
echo "DONE_TWEETS"
wc -l "$OUT"