<?php

namespace Tualo\Office\TualoLog\Routes;

use Tualo\Office\Basic\TualoApplication as App;
use Tualo\Office\Basic\Route as BasicRoute;
use Tualo\Office\TualoLog\Scopes\TualoLogScope;

class CheckAccess extends \Tualo\Office\Basic\RouteWrapper
{
    public static function scope(): string
    {
        return TualoLogScope::identifier();
    }

    public static function register()
    {
        BasicRoute::add('/tualolog/access', function () {
            App::contenttype('application/json');
            App::result('success', true);
        }, ['get'], true, [], self::scope());
    }
}
