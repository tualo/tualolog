<?php

namespace Tualo\Office\TualoLog;

use Tualo\Office\ExtJSCompiler\ICompiler;
use Tualo\Office\ExtJSCompiler\CompilerHelper;

class Compiler implements ICompiler
{
    public static function getFiles()
    {
        return CompilerHelper::getFiles(__DIR__, 'tualolog', 10007);
    }
}
