$Le = window.$Le || {};

$Le.Config.api = $.extend({
    demo: '/online-sd'
}, $Le.Config.api);

define($Le.seaConfig.alias.workflow, ["dot", "json2", "lang", "go", "dialog"], function(require, exports, module) {
    var dot = require('dot');
    var JSON = require('json2');
    var Go = require('go');
    var Dialog = require('dialog');

    var Util = {
        getHtml: function(config) {
            return $Le.tplRender(dot, _html, config || {});
        },
        _ajaxFail: function(data) {
            var con;
            if (typeof data == 'object') {
                con = {
                    isSingle: true,
                    head: data.head || '请求错误',
                    context: data.text || '网络错误，请重试或刷新页面'
                };
            } else {
                con = {
                    isSingle: true,
                    head: '请求错误',
                    context: data
                };
            }
            this._showDialog({
                width: 200,
                con: con
            });
        },
        _showDialog: function(opt, callback) {
            var dialog = $Le.pg.showDialog({
                Dialog: Dialog
            }, {
                width: opt.width,
                height: opt.height,
                nclose: opt.nclose || false,
                context: opt.context || false,
                con: opt.con,
                confirm: function(self) {
                    callback && callback(self);
                }
            });
            dialog.open();
            return dialog;
        }
    };

    var workflow = new $Le.Model({
        _initDom: $('.g_init'),
        _container: $('.g_container'),
        init: function() {
            var self = this;
            self.render({
                frame: true
            });
            self.bind();
        },
        putData: function(name, data) {
            var json = {};
            json[name] = data.info;
            $Le.plat.trigger("push.data", "store", json);
        },
        render: function(json) {
            this._initDom.hide();
            this._container.show();
            this._container.removeClass('hide');
            this._container.html(Util.getHtml(json));
        },
        bind: function() {
            var self = this;
            this._container.on('click', '[data-op]', function() {
                var $this = $(this);
                var op = $this.data('op');
                self[op] && self[op]($this);
            });
        },
        view: function(btn) {
            $Le.pg.goAjax({
                Go: Go
            }, {
                url: $Le.Config.api.demo,
                type: 'get',
                success: function(data) {
                    console.log(data);
                },
                error: function(data) {
                    Util._ajaxFail({
                        head: '请求错误',
                        text: data.info
                    });
                },
                fail: function(e) {
                    Util._ajaxFail(e);
                }
            });
        }
    });

    module.exports = workflow;
})
