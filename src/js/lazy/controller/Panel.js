Ext.define('Tualo.tualolog.lazy.controller.Panel', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.tualo_tualolog_panel',

    onBoxReady: function () {
        this.loadEntries();
    },

    loadEntries: function () {
        let me = this,
            model = me.getViewModel(),
            store = model.getStore('entries'),
            view = me.getView(),
            params = {
                limit: model.get('limit')
            };

        if (!Ext.isEmpty(model.get('level'))) {
            params.level = model.get('level');
        }

        view.setLoading(true);
        model.set('selectedEntry', null);
        store.load({
            params: params,
            callback: function (records, operation, success) {
                view.setLoading(false);
                if (!success) {
                    let msg = 'Fehler beim Laden des Logs.';
                    try {
                        let response = Ext.decode(operation.getError().response.responseText);
                        if (response.msg) msg = response.msg;
                    } catch (e) {
                        // Standardmeldung verwenden
                    }
                    Ext.Msg.alert('Tualo Log', msg);
                } else {
                    let raw = store.getProxy().getReader().rawData;
                    if (raw) {
                        if (raw.success === false) {
                            Ext.Msg.alert('Tualo Log', raw.msg || 'Fehler beim Lesen des Logs.');
                        }
                        if (raw.logfile) {
                            model.set('logfile', raw.logfile);
                        }
                    }
                }
            }
        });
    },

    onRefresh: function () {
        this.loadEntries();
    },

    onLevelChange: function (combo, value) {
        this.getViewModel().set('level', value || '');
        this.loadEntries();
    },

    onSelectionChange: function (grid, selected) {
        this.getViewModel().set('selectedEntry', selected.length > 0 ? selected[0] : null);
    },

    onFilterChange: function (field) {
        let store = this.getViewModel().getStore('entries'),
            value = (field.getValue() || '').toLowerCase();

        store.clearFilter();
        if (value !== '') {
            store.filterBy(function (record) {
                let haystack = [
                    record.get('channel'),
                    record.get('level'),
                    record.get('message'),
                    Ext.encode(record.get('context'))
                ].join(' ').toLowerCase();
                return haystack.indexOf(value) !== -1;
            });
        }
    }
});
