# The Long Road

Игра в одном файле: откройте `index.html` в браузере (Chrome/Edge/Firefox).

## Автосохранение

`tools/autosave.sh` каждые 15 минут коммитит изменения `index.html` и пушит их
в текущую ветку, чтобы последняя версия игры всегда была в репозитории:

```sh
nohup tools/autosave.sh >/tmp/autosave.log 2>&1 &
```

Интервал меняется переменной `AUTOSAVE_INTERVAL` (в секундах).
