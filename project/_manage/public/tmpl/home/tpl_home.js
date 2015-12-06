$Le = window.$Le || {};

$Le.Config.api = $.extend({
    demo: '/json/test'
}, $Le.Config.api);

define($Le.seaConfig.alias.homeFrame, ["dot", "json2", "lang", "go", "dialog", 'stateman'], function(require, exports, module) {
    var dot = require('dot');
    var JSON = require('json2');
    var Go = require('go');
    var Dialog = require('dialog');

    var stateman = new StateMan({
        strict: true
    });

    var Util = {
        getHtml: function(config) {
            return $Le.tplRender(dot, _html, config || {});
        },
        config: {
            enter: function(option) {
                console.log("enter: " + this.name + "; param: " + JSON.stringify(option.param));
            },
            leave: function(option) {
                // console.log("leave: " + this.name + "; param: " + JSON.stringify(option.param));
            },
            update: function(option) {
                console.log("update: " + this.name + "; param: " + JSON.stringify(option.param));
            },
        },
        createCFG: function(o) {
            o.enter = o.enter || this.config.enter
            o.leave = o.leave || this.config.leave
            o.update = o.update || this.config.update
            return o;
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
            var dialog = $Le.push.showDialog({
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

    var homeFrame = new $Le.Model({
        _initDom: $('.g_init'),
        _container: $('.g_container'),
        init: function() {
            var self = this;
            self.render({
                username: 'sssss'
            });
            $('#photo').change(this.uptest);
            this.bindJump();
        },
        uptest: function() {
            function http(date, url, callback) {
                function createXHttpRequest() {
                    if (window.ActiveXObject) {
                        xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
                    } else if (window.XMLHttpRequest) {
                        xmlhttp = new XMLHttpRequest();
                    } else {
                        return;
                    }
                }

                function starRequest(date) {
                    createXHttpRequest();
                    xmlhttp.onreadystatechange = function() {
                        if (xmlhttp.readyState == 4) {
                            if (xmlhttp.status == 200) {
                                callback();

                            }
                        }
                    };
                    xmlhttp.upload.onprogress = function() {
                        console.log(arguments);
                    }
                    xmlhttp.open("POST", url, true);
                    xmlhttp.send(date);
                }
                starRequest(date);
            }
            var date = new FormData($("form[name='form1']")[0]);
            var url = "http://localhost:8080/test.php";
            var callback = function() {};
            http(date, url, callback);
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
        bindJump: function() {
            this._container.on('click', '[data-jump]', function() {
                var $this = $(this);
                var link = $this.data('jump');
                location.href = link;
            });
        },
        //单页面路由定义
        router: function() {
            var self = this;
            stateman.state({
                "app": this.app(),
                "app.applist": this.applist(),
                "app.cerate": this.create(),
                "app.info.appid": {
                    url: ":appid(.*)"
                },
                "app.info.appid.infotype": this.infoModify(),
                "app.manage.operate": this.appManage(),
                "app.record.type": this.appRecord(),
                "app.approval.type": this.approval(),
                "app.visit.type": this.visit()
            }).on('notfound', function(evt) {
                this.go('app.applist');
            }).start();
        },
        //路由对应的行为，相当于控制器
        app: function() {
            var self = this;
            return Util.createCFG({
                url: "app",
                title: "消息推送",
                enter: function(option) {
                    // Util.config.enter.call(this, option);
                    self.render({
                        username: gName
                    });
                    $Le.useModel({
                        "paths": [$Le.seaConfig.alias.side],
                        "data": null
                    });
                },
                update: function(option) {
                    // Util.config.update.call(this, option);
                }
            });
        },
        applist: function() {
            var self = this;
            return Util.createCFG({
                url: "main",
                title: "应用列表",
                enter: function(option) {
                    // Util.config.enter.call(this, option);
                    $Le.useModel({
                        "paths": [$Le.seaConfig.alias.applist],
                        "data": stateman
                    });
                },
                update: function(option) {
                    // Util.config.update.call(this, option);
                    if (option.param.keyword == undefined) {
                        $Le.useModel({
                            "paths": [$Le.seaConfig.alias.applist],
                            "data": stateman
                        });
                    }
                }
            });
        },
        create: function() {
            var self = this;
            return Util.createCFG({
                url: "create",
                title: "创建应用",
                enter: function(option) {
                    // Util.config.enter.call(this, option);
                    $Le.useModel({
                        "paths": [$Le.seaConfig.alias.create],
                        "data": null
                    });
                },
                update: function(option) {
                    // Util.config.update.call(this, option);
                }
            });
        },
        infoModify: function() {
            var self = this;
            return Util.createCFG({
                url: ":usertype(yes|no)",
                title: "应用信息",
                enter: function(option) {
                    $Le.useModel({
                        "paths": [$Le.seaConfig.alias.infomodify],
                        "data": option
                    });
                },
                update: function(option) {
                    $Le.useModel({
                        "paths": [$Le.seaConfig.alias.infomodify],
                        "data": option
                    });
                }
            });
        },
        appManage: function() {
            var self = this;
            return Util.createCFG({
                url: ":operate",
                title: "应用信息",
                enter: function(option) {
                    // Util.config.enter.call(this, option);
                    self.loadPkgs(function(data) {
                        self.putData('pkgs', data);
                    });
                    $Le.useModel({
                        "paths": [$Le.seaConfig.alias.AppManage],
                        "data": {
                            option: option,
                            stateman: stateman
                        }
                    });
                    $Le.useModel({
                        "paths": [$Le.seaConfig.alias.appselect],
                        "data": {
                            data: option,
                            stateman: stateman
                        }
                    });
                },
                update: function(option) {
                    // Util.config.update.call(this, option);
                    self.loadPkgs(function(data) {
                        self.putData('pkgs', data);
                    });
                    $Le.useModel({
                        "paths": [$Le.seaConfig.alias.AppManage],
                        "data": {
                            option: option,
                            stateman: stateman
                        }
                    });
                    // $Le.useModel({
                    //     "paths": [$Le.seaConfig.alias.appselect],
                    //     "data": {
                    //         data: option,
                    //         stateman: stateman
                    //     }
                    // });
                },
                leave: function(option) {
                    // Util.config.update.call(this, option);
                    $Le.useModel({
                        "paths": [$Le.seaConfig.alias.appselect],
                        "data": {
                            leave: 'leave',
                            data: option
                        }
                    });
                }
            });
        },
        appRecord: function() {
            var self = this;
            return Util.createCFG({
                url: ":type",
                title: "操作记录",
                enter: function(option) {
                    // Util.config.enter.call(this, option);
                    $Le.useModel({
                        "paths": [$Le.seaConfig.alias.appRecord],
                        "data": option
                    });
                },
                update: function(option) {
                    // Util.config.update.call(this, option);
                    $Le.useModel({
                        "paths": [$Le.seaConfig.alias.appRecord],
                        "data": option
                    });
                }
            });
        },
        approval: function() {
            var self = this;
            return Util.createCFG({
                url: ":type",
                title: "应用审批",
                enter: function(option) {
                    // Util.config.enter.call(this, option);
                    $Le.useModel({
                        "paths": [$Le.seaConfig.alias.approve],
                        "data": option
                    });
                },
                update: function(option) {
                    // Util.config.update.call(this, option);
                    $Le.useModel({
                        "paths": [$Le.seaConfig.alias.approve],
                        "data": option
                    });
                }
            });
        },
        visit: function() {
            var self = this;
            return Util.createCFG({
                url: ":type",
                title: "访问审批",
                enter: function(option) {
                    // Util.config.enter.call(this, option);
                    $Le.useModel({
                        "paths": [$Le.seaConfig.alias.visit],
                        "data": option
                    });
                },
                update: function(option) {
                    // Util.config.update.call(this, option);
                    $Le.useModel({
                        "paths": [$Le.seaConfig.alias.visit],
                        "data": option
                    });
                }
            });
        }
    });

    module.exports = homeFrame;
})
