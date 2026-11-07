Ext.define('Tualo.tualolog.lazy.models.Panel', {
    extend: 'Ext.app.ViewModel',
    alias: 'viewmodel.tualo_tualolog_panel',
    data: {
        limit: 500,
        level: '',
        logfile: '',
        selectedEntry: null
    },
    formulas: {
        detailHtml: function (get) {
            let entry = get('selectedEntry');
            if (!entry) {
                return '<div style="padding:12px;color:#888;">Eintrag auswählen, um Details zu sehen.</div>';
            }
            let esc = Ext.String.htmlEncode,
                html = '<div style="padding:12px;font-size:12px;">';
            html += '<table style="border-spacing:0 2px;">';
            let row = function (label, value) {
                if (Ext.isEmpty(value)) return '';
                return '<tr><td style="color:#888;padding-right:12px;white-space:nowrap;vertical-align:top;">'
                    + esc(label) + '</td><td style="word-break:break-all;">' + value + '</td></tr>';
            };
            html += row('Zeit', esc(entry.get('timestamp')));
            html += row('Channel', esc(entry.get('channel')));
            html += row('Level', esc(entry.get('level')));
            html += '</table>';

            html += '<div style="margin-top:10px;padding:8px;border:1px solid #ddd;border-radius:4px;'
                + 'white-space:pre-wrap;word-break:break-all;">'
                + esc(entry.get('message')) + '</div>';

            let jsonBlock = function (label, value) {
                if (Ext.isEmpty(value) || (Ext.isArray(value) && value.length === 0)
                    || (Ext.isObject(value) && Ext.Object.getKeys(value).length === 0)) {
                    return '';
                }
                let pretty;
                try {
                    pretty = JSON.stringify(value, null, 2);
                } catch (e) {
                    pretty = '' + value;
                }
                return '<div style="margin-top:10px;"><b>' + esc(label) + '</b>'
                    + '<pre style="margin:4px 0 0;padding:8px;border:1px solid #ddd;border-radius:4px;'
                    + 'font-size:11px;overflow:auto;">' + esc(pretty) + '</pre></div>';
            };
            html += jsonBlock('Context', entry.get('context'));
            html += jsonBlock('Extra', entry.get('extra'));
            html += '</div>';
            return html;
        }
    },
    stores: {
        entries: {
            type: 'json',
            autoLoad: false,
            fields: [
                { name: 'timestamp', type: 'string' },
                { name: 'channel', type: 'string' },
                { name: 'level', type: 'string' },
                { name: 'level_value', type: 'int' },
                { name: 'message', type: 'string' },
                { name: 'context' },
                { name: 'extra' },
                { name: 'raw', type: 'string' }
            ],
            proxy: {
                type: 'ajax',
                url: './tualolog/read',
                reader: {
                    type: 'json',
                    rootProperty: 'data'
                }
            }
        }
    }
});
