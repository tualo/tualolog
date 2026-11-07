<?php

namespace Tualo\Office\TualoLog\Routes;

use Tualo\Office\Basic\TualoApplication as App;
use Tualo\Office\Basic\Route as BasicRoute;
use Tualo\Office\TualoLog\TualoLogParser;
use Tualo\Office\TualoLog\Scopes\TualoLogScope;

class Read extends \Tualo\Office\Basic\RouteWrapper
{
    public static function scope(): string
    {
        return TualoLogScope::identifier();
    }

    public static function register()
    {
        BasicRoute::add('/tualolog/read', function ($matches) {
            App::contenttype('application/json');
            try {
                // Default: dieselbe Datei, in die der Monolog-Handler schreibt
                $path = App::configuration(
                    'tualolog',
                    'logfile',
                    App::configuration('logger-file', 'filename', '/var/log/tualo.log')
                );

                $limit = (int)($_REQUEST['limit'] ?? 500);
                if ($limit < 1) $limit = 1;
                if ($limit > 5000) $limit = 5000;

                $maxBytes = (int)App::configuration('tualolog', 'maxbytes', 4194304);

                $entries = TualoLogParser::parseFile($path, $limit, $maxBytes);

                // optionale Server-Filter
                $level = strtoupper((string)($_REQUEST['level'] ?? ''));
                $channel = (string)($_REQUEST['channel'] ?? '');
                if ($level !== '' || $channel !== '') {
                    $entries = array_values(array_filter($entries, function ($e) use ($level, $channel) {
                        if ($level !== '' && $e['level'] !== $level) return false;
                        if ($channel !== '' && $e['channel'] !== $channel) return false;
                        return true;
                    }));
                }

                App::result('data', $entries);
                App::result('total', count($entries));
                App::result('logfile', $path);
                App::result('success', true);
            } catch (\Exception $e) {
                App::result('success', false);
                App::result('msg', $e->getMessage());
            }
        }, ['get', 'post'], true, [], self::scope());
    }
}
