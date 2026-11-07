<?php

namespace Tualo\Office\TualoLog\Scopes;

use Tualo\Office\Basic\Scope;

class TualoLogScope extends Scope
{
    protected static string $identifier = 'tualolog';
    protected static array $name = [
        'EN' => 'Tualo Log',
        'DE' => 'Tualo Log',
    ];
    protected static array $description = [
        'EN' => 'View tualo application log entries (Monolog).',
        'DE' => 'Tualo Anwendungs-Log Einträge (Monolog) anzeigen.',
    ];
}
