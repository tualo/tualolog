Ext.define('Tualo.tualolog.lazy.Panel', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.tualo_tualolog_panel',

    requires: [
        'Tualo.tualolog.lazy.controller.Panel',
        'Tualo.tualolog.lazy.models.Panel'
    ],
    controller: 'tualo_tualolog_panel',
    viewModel: {
        type: 'tualo_tualolog_panel'
    },
    listeners: {
        boxready: 'onBoxReady'
    },

    getWindowTitle: function () {
        return 'Tualo Log'
    },
    getWindowIcon: function () {
        return 'fa-solid fa-gears';
    },
    title: 'Tualo Log',
    closable: true,
    layout: 'border',
    items: [
        {
            region: 'center',
            xtype: 'grid',
            itemId: 'entries',
            plugins: {
                gridfilters: true
            },
            tbar: [
                {
                    text: 'Aktualisieren',
                    iconCls: 'x-fa fa-sync',
                    handler: 'onRefresh'
                },
                {
                    xtype: 'combobox',
                    emptyText: 'Level (alle)',
                    editable: false,
                    width: 150,
                    store: [
                        ['', '(alle)'],
                        ['DEBUG', 'DEBUG'],
                        ['INFO', 'INFO'],
                        ['NOTICE', 'NOTICE'],
                        ['WARNING', 'WARNING'],
                        ['ERROR', 'ERROR'],
                        ['CRITICAL', 'CRITICAL'],
                        ['ALERT', 'ALERT'],
                        ['EMERGENCY', 'EMERGENCY']
                    ],
                    listeners: {
                        change: 'onLevelChange'
                    }
                },
                {
                    xtype: 'textfield',
                    emptyText: 'Filter (Channel, Meldung) ...',
                    width: 280,
                    listeners: {
                        change: {
                            fn: 'onFilterChange',
                            buffer: 300
                        }
                    }
                },
                '->',
                {
                    xtype: 'tbtext',
                    bind: {
                        text: '{logfile}'
                    }
                }
            ],
            columns: [
                { text: 'Zeit', dataIndex: 'timestamp', width: 150 },
                { text: 'Channel', dataIndex: 'channel', width: 110, filter: { type: 'string' } },
                {
                    text: 'Level', dataIndex: 'level', width: 110, filter: { type: 'string' },
                    renderer: function (value, meta, record) {
                        let v = record.get('level_value'),
                            color = '';
                        if (v >= 400) color = '#c0392b';
                        else if (v >= 300) color = '#e67e22';
                        else if (v >= 250) color = '#2980b9';
                        else if (v <= 100) color = '#888';
                        return color
                            ? '<span style="color:' + color + ';font-weight:' + (v >= 400 ? 'bold' : 'normal') + ';">'
                            + Ext.String.htmlEncode(value) + '</span>'
                            : Ext.String.htmlEncode(value);
                    }
                },
                {
                    text: 'Meldung', dataIndex: 'message', flex: 1, filter: { type: 'string' },
                    renderer: function (value) {
                        // nur erste Zeile im Grid anzeigen (Stacktraces im Detailbereich)
                        let first = ('' + value).split('\n')[0];
                        return Ext.String.htmlEncode(first);
                    }
                }
            ],
            bind: {
                store: '{entries}'
            },
            listeners: {
                selectionchange: 'onSelectionChange'
            }
        },
        {
            region: 'south',
            split: true,
            height: 240,
            title: 'Details',
            collapsible: true,
            scrollable: true,
            bind: {
                html: '{detailHtml}'
            }
        }
    ]
});
