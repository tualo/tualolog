Ext.define('Tualo.routes.TualoLog', {
    statics: {
        load: async function () {
            return [
                {
                    name: 'Tualo Log',
                    path: '#tualolog/panel'
                }
            ]
        }
    },
    url: 'tualolog/panel',
    handler: {
        action: function () {
            try {
                let fn = async function () {
                    let result = await fetch('./tualolog/access');
                    result = await result.json();
                    if (result.success) {
                        Ext.getApplication().addView('Tualo.tualolog.lazy.Panel');
                    }
                }();
            } catch (e) {
                console.error(e);
            }
        },
        before: function (action) {
            //Ext.require('Tualo.tualolog.lazy.Panel', function () {
            action.resume();
            //}, this);
        }
    }
});
