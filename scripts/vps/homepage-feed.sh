#!/usr/bin/env bash
# Builds /opt/homepage/feed/threats.json for the threat feed window.
# Aggregates the last 24 hours of the homepage access log and fail2ban log.
# Output contains counts, categories, countries and paths only, never IPs.
# Run from cron every 10 minutes as root.
set -euo pipefail

LOG_DIR=/opt/Shark-no-Seki/logs
F2B_LOG=/var/log/fail2ban.log
OUT_DIR=/opt/homepage/feed
OUT="$OUT_DIR/threats.json"
JAILS=(homepage-probe homepage-404 homepage-flood)

mkdir -p "$OUT_DIR"
cut_ts=$(date -d '24 hours ago' +%s)
cut_local=$(date -d '24 hours ago' '+%F %T')

# Access log stats: current file plus rotated ones (Caddy gzips them).
stats=$(zcat -f "$LOG_DIR"/homepage*.log* 2>/dev/null | jq -n -c --argjson cut "$cut_ts" '
  def norm: (.request.uri // "" | split("?")[0] | gsub("/+"; "/") | ascii_downcase);
  def category:
    norm as $p
    | if (.request.method == "POST") or (.request.headers["Next-Action"] != null) then "next.js rsc"
      elif ($p | test("wp-|xmlrpc|wordpress|wlwmanifest")) then "wordpress"
      elif ($p | test("\\.env|\\.aws|sftp\\.json|@vite")) then "secrets"
      elif ($p | test("/\\.git|/\\.svn|/\\.hg")) then "vcs"
      elif ($p | test("\\.php")) then "php"
      elif ($p | test("phpmyadmin|cgi-bin|actuator|server-status|\\.vscode")) then "other"
      else null end;
  [inputs | select(.ts? and .ts >= $cut)] as $all
  | [$all[] | . + {c: category} | select(.c != null)] as $probes
  | {
      requests: ($all | length),
      probes: ($probes | length),
      categories: ($probes | group_by(.c) | map({name: .[0].c, count: length}) | sort_by(-.count)),
      countries: ($probes
        | map({ip: .request.client_ip, cc: (.request.headers["Cf-Ipcountry"][0] // "??")})
        | unique | group_by(.cc) | map({code: .[0].cc, count: length}) | sort_by(-.count) | .[:6]),
      paths: ($probes
        | map((if .request.method == "GET" then "" else .request.method + " " end) + norm
              | gsub("[^ -~]"; "?") | .[:48])
        | group_by(.) | map({path: .[0], count: length}) | sort_by(-.count) | .[:8])
    }')

# Bans in the last 24 hours (restored bans after a restart don't count).
bans=$(cat "$F2B_LOG".1 "$F2B_LOG" 2>/dev/null \
  | awk -v cut="$cut_local" 'substr($0, 1, 19) >= cut' \
  | grep -cE '\[homepage-[a-z0-9]+\] Ban ' || true)

# Currently banned, unique across the three jails.
active=$( { for j in "${JAILS[@]}"; do fail2ban-client status "$j" 2>/dev/null || true; done; } \
  | sed -n 's/.*Banned IP list:\s*//p' | tr ' \t' '\n\n' | sed '/^$/d' | sort -u | wc -l)

jq -n --argjson s "$stats" --argjson bans "${bans:-0}" --argjson active "${active:-0}" \
  --arg generated "$(date -u +%FT%TZ)" \
  '{generated: $generated, hours: 24} + $s + {bans: $bans, active: $active}' > "$OUT.tmp"
chmod 644 "$OUT.tmp"
mv "$OUT.tmp" "$OUT"
