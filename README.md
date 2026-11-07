# tualo/tualolog

Tualo Anwendungs-Log Viewer für tualo office (Schwester-Package zu
`tualo/modsecuritylog` und `tualo/apachelog`).

Stellt die Einträge des Monolog-Anwendungslogs (`TualoApplication::logger()`,
Standard-LineFormatter) für Frontend-Benutzer mit dem Scope `tualolog`
aufbereitet dar: Zeitpunkt, Channel, Level, Meldung sowie Context/Extra als
aufbereitetes JSON. Fortsetzungszeilen (z. B. Stacktraces) werden der
zugehörigen Meldung zugeordnet.

## Scope

Der Zugriff ist über den Scope **`tualolog`** geschützt. Der Scope wird über
`install-sql-bsc-scopes` registriert und muss dem Benutzer bzw. der Gruppe
zugewiesen werden.

## Routen

| Route | Methode | Beschreibung |
| --- | --- | --- |
| `/tualolog/read` | GET/POST | Letzte Log-Einträge als JSON (`limit` Default 500 / max. 5000, optional `level`, `channel`) |
| `/tualolog/access` | GET | Scope-Check für das Frontend |
| `/js/tualolog/lazy/...` | GET | Lazy-Loading der ExtJS-Views |

## Frontend

Panel über die Hash-Route `#tualolog/panel` (Eintrag „Tualo Log").
Grid mit Level-Auswahl, Spaltenfiltern und Live-Filter; Level-Farbcodierung
(ERROR+ rot, WARNING orange, NOTICE blau, DEBUG grau); Detailbereich mit
vollständiger Meldung (inkl. Stacktrace) und Context/Extra als JSON.

## Konfiguration

Der Log-Pfad wird per Default aus der bestehenden Logger-Konfiguration
übernommen (`logger-file.filename`). Optional überschreibbar:

```json
{
  "tualolog": {
    "logfile": "/var/log/tualo.log",
    "maxbytes": 4194304
  }
}
```

- `logfile`: Pfad zum Anwendungslog (Default: `logger-file.filename`,
  Fallback `/var/log/tualo.log`)
- `maxbytes`: maximal gelesene Bytes vom Log-Ende (Default 4 MB)

## Voraussetzungen

Die Logdatei wird vom PHP-FPM-User (`tualo`) selbst geschrieben und ist
damit ohne weitere Rechteanpassung lesbar.
