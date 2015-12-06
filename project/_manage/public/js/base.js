$Le = window.$Le || {};
$Le.seaConfig = $Le.seaConfig || {};

$Le.version = $Le.Config.staticVersion || '20151106164724';
$Le.seaConfig = $.extend(true, $Le.seaConfig, {
    base: $Le.Config.staticPath,
    alias: {
        "homeFrame":"/public/tmpl/home/tpl_home.js",
        "workflow":"/public/tmpl/workflow/tpl_workflow.js",



        "_": $Le.Config.staticPath + "/le_services/js/m/underscore-min.js",
        "dot": $Le.Config.staticPath + "/le_services/js/m/dot.js",
        "json2": $Le.Config.staticPath + "/le_services/js/m/json2.js",
        "stateman": $Le.Config.staticPath + "/le_services/js/m/stateman.min.js",
        "clip": $Le.Config.staticPath + "/le_services/js/m/ZeroClipboard.min.js",
        "echarts": $Le.Config.staticPath + "/le_services/js/m/echarts-all.js",
        "highcharts": $Le.Config.staticPath + "/le_services/js/m/highcharts/highcharts.js",
        "highcharts3d": $Le.Config.staticPath + "/le_services/js/m/highcharts/highcharts-3d.js",
        "editor": $Le.Config.staticPath + "/le_services/js/m/ace-editor/ace.js",
        "tag": $Le.Config.staticPath + "/le_services/js/m/jquery.tagsinput.js",
        "lang": $Le.Config.staticPath + "/le_services/js/m/lang.js",

        "intro": $Le.Config.staticPath + "/le_services/js/push4/tpl_intro.js" + "?v=" + $Le.version,
        "frame": $Le.Config.staticPath + "/le_services/js/push4/tpl_frame.js" + "?v=" + $Le.version,
        "appselect": $Le.Config.staticPath + "/le_services/js/push4/tmpl/tpl_select.js" + "?v=" + $Le.version,

        "guide": $Le.Config.staticPath + "/le_services/js/push2/tmpl/tpl_guide.js" + "?v=" + $Le.version,
        "side": $Le.Config.staticPath + "/le_services/js/push4/tmpl/tpl_side.js" + "?v=" + $Le.version,
        "applist": $Le.Config.staticPath + "/le_services/js/push4/tmpl/tpl_applist.js" + "?v=" + $Le.version,

        "create": $Le.Config.staticPath + "/le_services/js/push4/tmpl/tpl_create.js" + "?v=" + $Le.version,
        "infomodify": $Le.Config.staticPath + "/le_services/js/push4/tmpl/tpl_infomodify.js" + "?v=" + $Le.version,
        "AppManage": $Le.Config.staticPath + "/le_services/js/push4/tmpl/tpl_appmanage.js" + "?v=" + $Le.version,

        "pushmsg": $Le.Config.staticPath + "/le_services/js/push4/tmpl/tpl_pushmsg.js" + "?v=" + $Le.version,
        "listchart": $Le.Config.staticPath + "/le_services/js/push4/tmpl/tpl_listchart.js" + "?v=" + $Le.version,

        "approve": $Le.Config.staticPath + "/le_services/js/push4/tmpl/tpl_approve.js" + "?v=" + $Le.version,
        "visit": $Le.Config.staticPath + "/le_services/js/push4/tmpl/tpl_visit.js" + "?v=" + $Le.version,
        "appRecord": $Le.Config.staticPath + "/le_services/js/push4/tmpl/record/tpl_record.js" + "?v=" + $Le.version,

        "allRecord": $Le.Config.staticPath + "/le_services/js/push4/tpl_allRecord.js" + "?v=" + $Le.version,
        "Statistics": $Le.Config.staticPath + "/le_services/js/push4/tpl_statistics.js" + "?v=" + $Le.version
    }
});

seajs.config($Le.seaConfig);

$Le.pg = {
    fileSize: function(size) {
        var str = '';
        str = size > 1024 * 1024 ? (Math.round(size * 100 / (1024 * 1024)) / 100).toString() + 'MB' : (Math.round(size * 100 / 1024) / 100).toString() + 'KB';
        return str;
    },
    limitInputLen: function(parent, opt) {
        //parent 字数限制委托的父元素
        //opt [comParent 输入框和提示框的父元素]
        //[data-limit] 输入框绑定属性，值为限定长度
        //[data-tips] 提示框绑定属性，无值
        var aimInput;
        var parent = parent || document;
        var comParent = opt.comParent || 'li';
        var aimEvents = $Le.getChangeEvent() + ' contentChange';
        $(parent).on(aimEvents, '[data-limit]', function(e) {
            aimInput = e.target;
            var max = $(aimInput).data('limit');
            var tips = $(aimInput).parents(comParent).find('[data-tips]');
            $(aimInput).attr('maxLength', max);
            tips.html('<var class="j_cur">0</var>/<var class="j_total">' + max + '</var>');
            if (aimInput.value.length <= max) {
                tips.find('.j_cur').text(aimInput.value.length);
            }
        })
        $('[data-limit]').trigger("contentChange");
    },
    goAjax: function(m, opt) {
        var Go = m.Go;
        return new Go({
            url: opt.url,
            type: opt.type || 'get',
            dataType: opt.dataType || 'json',
            data: (opt.getData && opt.getData()) || opt.data || '',
            contentType: opt.contentType || 'application/json',
            lock: opt.lock || null,
            beforeSend: function() {
                opt.beforeSend && opt.beforeSend();
            },
            success: function(json) {
                var data, error;
                data = $Le.push.ajaxParse(json);
                if (data.errno == '10000') {
                    opt.success && opt.success(data);
                } else {
                    opt.error && opt.error(data);
                }
            },
            fail: function(e) {
                opt.fail && opt.fail(e);
            }
        });
    },
    formToJSON: function(str) {
        var param = str.split('&');
        var result = {};
        $.each(param, function(index, item) {
            var pair = item.split('=');
            result[pair[0]] = decodeURIComponent(pair[1]);
        });
        return result;
    },
    ajaxParse: function(json) {
        var data = typeof json === 'string' ? JSON.parse(json) : json;
        return data;
    },
    createUpInstan: function(m, opt) {
        var Uploader = m.Uploader;
        return new Uploader({
            token: $Le.Config.upToken,
            bucket: $Le.Config.upFloder,
            upOpt: {
                container: opt.container,
                width: opt.width,
                height: opt.height,
                fileSizeLimit: opt.fileSizeLimit || '2M',
                multi: !(opt.multi ^ true),
                uploadLimit: opt.uploadLimit || 10,
                fileTypeDesc: opt.fileTypeDesc || 'image/*',
                buttonText: opt.buttonText || '',
                fileObjName: opt.fileObjName || 'upImg',
                auto: opt.auto || false,
                imgWidth: opt.imgWidth || false,
                imgHeight: opt.imgHeight || false,
                asyncValidate: function(files, callback) {
                    var count = files.length;
                    var resultFiles = [];

                    function checkWH(files, callback) {
                        var reader = new FileReader();
                        var img = new Image();
                        reader.onload = function(e) {
                            var dataURL = reader.result;
                            img.onload = function() {
                                if (
                                    (opt.imgWidth && img.width != opt.imgWidth) ||
                                    (opt.imgHeight && img.height != opt.imgHeight)
                                ) {
                                    resultFiles.push(files[files.length - count]);
                                }
                                count--;
                                if (count > 0) {
                                    checkWH(files, callback);
                                } else {
                                    callback();
                                }
                            }
                            img.src = dataURL;
                        }
                        reader.readAsDataURL(files[files.length - count]);
                    }
                    checkWH(files, function() {
                        if (resultFiles.length > 0) {
                            callback(false, resultFiles[0])
                        } else {
                            callback(true);
                        }
                    });
                },
                onSelectError: function(file, errorCode, errorMsg) {
                    var errList = [];
                    var errObj = {};
                    errObj.name = file.name;
                    errObj.code = errorCode;
                    errObj.msg = errorMsg;
                    errList.push(errObj);
                    opt.onSelectError && opt.onSelectError(errList);
                },
                onSelect: function(file) {
                    opt.onSelect && opt.onSelect(file);
                },
                onAfterSelect: function(files) {
                    opt.onAfterSelect && opt.onAfterSelect(files);
                },
                onUploadStart: function(file) {
                    opt.onUploadStart && opt.onUploadStart(file);
                },
                onUploadProgress: function(file, fileBytesLoaded, fileTotalBytes) {
                    var percent = (fileBytesLoaded / fileTotalBytes) * 100;
                    percent = percent.toFixed(2) + '%';
                    var load = $Le.push.fileSize(fileBytesLoaded);
                    var total = $Le.push.fileSize(fileTotalBytes);
                    opt.onUploadProgress && opt.onUploadProgress(file, load, total, percent);
                },
                onUploadError: function(file, errorCode, errorMsg) {
                    opt.onUploadError && opt.onUploadError(file, errorCode, errorMsg);
                },
                onUploadSuccess: function(file, data, response) {
                    var t = new Date().getTime();
                    var imgPath = file.downloadPath;
                    opt.onUploadSuccess && opt.onUploadSuccess(file, data, response, imgPath, t);
                    var retry = opt.retry || 3;
                    var imgUrl;
                    $Le.attemptAccessImg(imgPath, {
                        maxCount: retry,
                        timer: 1000,
                        success: function() {
                            opt.loadSuccess && opt.loadSuccess(file, imgPath, t);
                        },
                        fail: function() {
                            opt.loadFail && opt.loadFail(file, data, response);
                        }
                    });
                },
                onAfterUpload: function() {
                    opt.onAfterUpload && opt.onAfterUpload();
                },
                initError: function() {
                    opt.initError && opt.initError();
                }
            }
        });
    },
    showDialog: function(m, opt) {
        /**
         * opt {con:{head:'',context:'',isSingle:''},width:'',height:'',nclose:''}
         */
        var Dialog = m.Dialog;
        var dialogBtn = opt.con.isSingle || false ? '<a class="ui-btn ui-btn-success mr10" data-op="confirm" href="javascript:;">确定</a>' : ['<a class="ui-btn ui-btn-success mr10" data-op="confirm" href="javascript:;">确定</a>',
            '<a class="ui-btn" data-op="close" href="javascript:;">取消</a>'
        ].join("");
        if (opt.con.isSingle == 'x') {
            dialogBtn = opt.btn || "";
        };
        var dialogClass = opt.dialogClass || '';
        var closeBtn = opt.unhasClose || false ? '' : '<span onclick="ROCK.core.BaseClass.get({guid}).close()">关闭</span>';
        var context = [
            '<div class="ui-dialog-container' + dialogClass + '">',
            '<div class="ui-dialog-head">',
            closeBtn,
            '<h2>',
            opt.con.head || '提示',
            '</h2>',
            '</div>',
            '<div class="ui-dialog-content">',
            opt.con.context || '',
            '</div>',
            '<div class="ui-dialog-footer">',
            dialogBtn,
            '</div>',
            '</div>'
        ].join("");
        context = opt.isCustCon ? opt.context : context;
        var nclose = opt.nclose || false;
        return new Dialog({
            width: opt.width || 300,
            height: opt.height || 'auto',
            content: context,
            timer: opt.timer || null,
            init: function() {
                var self = this;
                this.getDialogDom().on('click', '[data-op]', function(e) {
                    var op = $(this).data('op');
                    self[op] && self[op]();
                });
                opt.init && opt.init();
            },
            beforeOpen: function() {
                opt.beforeOpen && opt.beforeOpen();
            },
            afterOpen: function() {
                opt.afterOpen && opt.afterOpen(this);
            },
            beforeClose: function() {
                opt.beforeClose && opt.beforeClose();
            },
            confirm: function() {
                var self = this;
                if (nclose) {
                    console.log(nclose)
                    opt.confirm && opt.confirm(self);
                    // return true;
                } else {
                    this.uclose();
                    opt.confirm && opt.confirm(self);
                }
                // return true;
            },
            afterClose: function() {
                opt.afterClose && opt.afterClose(this);
            },
            cancel: function(isUser) {
                opt.cancel && opt.cancel(this, isUser);
            }
        });
    },
    loading: function(opt) {
        var html = [
            '<div class="spinner">', '<div class="double-bounce1"></div>',
            '<div class="double-bounce2"></div>', '</div>'
        ].join('');
        opt.parent.css({
            'position': 'relative',
            'min-height': (opt.height) || '300px'
        });
        opt.parent.html(html);
    }
}
