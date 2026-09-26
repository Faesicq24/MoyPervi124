#!/usr/bin/env bash
# Автосохранение: каждые 15 минут коммитит и пушит последнюю версию игры.
# Запуск в фоне:  nohup tools/autosave.sh >/tmp/autosave.log 2>&1 &
# Настройки: AUTOSAVE_INTERVAL (сек, по умолчанию 900), AUTOSAVE_FILES, AUTOSAVE_BRANCH.
set -u
cd "$(git rev-parse --show-toplevel)" || exit 1

INTERVAL="${AUTOSAVE_INTERVAL:-900}"
read -r -a FILES <<<"${AUTOSAVE_FILES:-index.html}"

# Не даём запустить две копии одновременно.
exec 9>"$(git rev-parse --git-dir)/autosave.lock"
flock -n 9 || { echo "autosave уже запущен"; exit 0; }

while true; do
  BRANCH="${AUTOSAVE_BRANCH:-$(git rev-parse --abbrev-ref HEAD)}"
  STAMP="$(date -u '+%Y-%m-%d %H:%M UTC')"
  if [ -n "$(git status --porcelain -- "${FILES[@]}")" ]; then
    git add -- "${FILES[@]}" &&
      git commit -q -m "autosave: $STAMP" -- "${FILES[@]}" &&
      echo "[$STAMP] сохранено локально"
  fi
  # Пушим всё неотправленное; если пуш не удался — повторим в следующем цикле.
  if ! git rev-parse -q --verify "refs/remotes/origin/$BRANCH" >/dev/null ||
    [ -n "$(git rev-list "origin/$BRANCH..HEAD" 2>/dev/null)" ]; then
    if git push -q origin "HEAD:$BRANCH"; then
      echo "[$STAMP] отправлено в origin/$BRANCH"
    else
      echo "[$STAMP] пуш не удался, повтор через $INTERVAL с"
    fi
  fi
  sleep "$INTERVAL"
done
