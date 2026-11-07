<?php

namespace Tualo\Office\TualoLog;

/**
 * Parser für das tualo-Anwendungslog (Monolog, Standard-LineFormatter):
 *
 *   [2026-11-07T15:36:21+01:00] CHANNEL.LEVEL: Meldung {"context":...} {"extra":...}
 *
 * Context und Extra stehen als JSON am Zeilenende (leer: "[]").
 * Zeilen ohne Monolog-Header (z. B. Stacktraces) werden der vorherigen
 * Meldung zugeordnet.
 */
class TualoLogParser
{
    private const LEVEL_VALUES = [
        'DEBUG' => 100,
        'INFO' => 200,
        'NOTICE' => 250,
        'WARNING' => 300,
        'ERROR' => 400,
        'CRITICAL' => 500,
        'ALERT' => 550,
        'EMERGENCY' => 600,
    ];

    /**
     * Liest die letzten $maxBytes der Datei und liefert maximal $limit
     * Einträge, neueste zuerst.
     */
    public static function parseFile(string $path, int $limit = 500, int $maxBytes = 4194304): array
    {
        if (!is_file($path)) {
            throw new \Exception('log file not found: ' . $path);
        }
        if (!is_readable($path)) {
            throw new \Exception('log file not readable: ' . $path);
        }

        $size = filesize($path);
        $offset = max(0, $size - $maxBytes);
        $fp = fopen($path, 'r');
        if ($fp === false) {
            throw new \Exception('could not open log file: ' . $path);
        }
        if ($offset > 0) {
            fseek($fp, $offset);
            fgets($fp); // angeschnittene erste Zeile verwerfen
        }
        $content = stream_get_contents($fp);
        fclose($fp);
        if ($content === false) {
            throw new \Exception('could not read log file: ' . $path);
        }

        $entries = self::parseString($content);
        $entries = array_reverse($entries);
        if (count($entries) > $limit) {
            $entries = array_slice($entries, 0, $limit);
        }
        return $entries;
    }

    public static function parseString(string $content): array
    {
        $entries = [];
        $lines = preg_split("/\r\n|\n|\r/", $content);
        foreach ($lines as $line) {
            if (trim($line) === '') {
                continue;
            }
            $entry = self::parseLine($line);
            if (!is_null($entry)) {
                $entries[] = $entry;
            } elseif (count($entries) > 0) {
                // Fortsetzungszeile (z. B. Stacktrace) an letzte Meldung anhängen
                $last = count($entries) - 1;
                $entries[$last]['message'] .= "\n" . $line;
                $entries[$last]['raw'] .= "\n" . $line;
            }
        }
        return $entries;
    }

    public static function parseLine(string $line): ?array
    {
        if (!preg_match('/^\[([^\]]+)\]\s+([\w\-]+)\.([A-Z]+):\s?(.*)$/', $line, $m)) {
            return null;
        }

        $rest = $m[4];
        $extra = self::extractTrailingJson($rest);
        $context = self::extractTrailingJson($rest);
        // Nur ein JSON-Anhang vorhanden -> er ist der Context
        if (is_null($context) && !is_null($extra)) {
            $context = $extra;
            $extra = null;
        }

        $level = strtoupper($m[3]);
        return [
            'timestamp' => self::normalizeTimestamp($m[1]),
            'channel' => $m[2],
            'level' => $level,
            'level_value' => self::LEVEL_VALUES[$level] ?? 0,
            'message' => trim($rest),
            'context' => $context,
            'extra' => $extra,
            'raw' => $line,
        ];
    }

    /**
     * Entfernt ein JSON-Objekt/-Array am Ende des Strings und gibt es
     * dekodiert zurück (null, wenn keines vorhanden ist).
     */
    private static function extractTrailingJson(string &$str): mixed
    {
        $t = rtrim($str);
        if ($t === '') {
            return null;
        }
        $close = substr($t, -1);
        if ($close !== '}' && $close !== ']') {
            return null;
        }
        $open = $close === '}' ? '{' : '[';

        // von hinten die passende Öffnung suchen (balanciert, mit String-Erkennung)
        $depth = 0;
        $start = -1;
        for ($p = strlen($t) - 1; $p >= 0; $p--) {
            $ch = $t[$p];
            if ($ch === $close) {
                $depth++;
            } elseif ($ch === $open) {
                $depth--;
                if ($depth === 0) {
                    $start = $p;
                    break;
                }
            }
        }
        if ($start < 0) {
            return null;
        }
        $candidate = substr($t, $start);
        $decoded = json_decode($candidate, true);
        if (is_null($decoded) && strtolower($candidate) !== 'null') {
            return null;
        }
        $str = substr($t, 0, $start);
        return $decoded;
    }

    private static function normalizeTimestamp(string $ts): string
    {
        $formats = [\DateTimeInterface::ATOM, 'Y-m-d\TH:i:s.uP', 'Y-m-d H:i:s'];
        foreach ($formats as $format) {
            $dt = \DateTime::createFromFormat($format, $ts);
            if ($dt !== false) {
                return $dt->format('Y-m-d H:i:s');
            }
        }
        return $ts;
    }
}
