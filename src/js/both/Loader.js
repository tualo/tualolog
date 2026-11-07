Ext.define('Tualo.tualolog.Loader', {
    singleton: true,

    constructor: function () {
        Ext.Loader.setPath('Tualo.tualolog.lazy', './js/tualolog/lazy');
    }
});
