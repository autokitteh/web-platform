#!/usr/bin/env bash
# progress-bar.sh  — reusable spinner + progress bar

ProgressBar() {
  local current=$1 total=$2 service=${3:-Service}
  local elapsed=$((current * 2))                 # loop sleeps 2 s
  local pct=$((current * 100 / total))
  local done=$((pct * 4 / 10)) left=$((40 - done))

  printf -v fill '%*s' "$done"
  printf -v empty '%*s' "$left"

  local sp='⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏'
  local ch=${sp:current%${#sp}:1}

  printf '\r%s %s: [%s%s] %s%% (%ss)' \
         "$ch" "$service" "${fill// /#}" "${empty// /-}" "$pct" "$elapsed"
}
export -f ProgressBar
