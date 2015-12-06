;
define(ROCK.seaConfig.alias.cut,[ROCK.seaConfig.alias.uploader, ROCK.seaConfig.alias.dialog, ROCK.seaConfig.alias.cutpicture, ROCK.seaConfig.alias.go, ROCK.seaConfig.alias.tips], function(require, exports, module) {

    var Uploader = require(ROCK.seaConfig.alias.uploader);
    var Dialog = require(ROCK.seaConfig.alias.dialog);
    var Cutpicture = require(ROCK.seaConfig.alias.cutpicture);
    var Go = require(ROCK.seaConfig.alias.go);
    var Tips = require(ROCK.seaConfig.alias.tips);

    /** 对弹框、上传、裁截图的封装;
     *
     *  @author ywchen(陈余文)
     *  @constructs Cut
     *  @date       2015.08.20
     *  @version    1.0.1
     *  @param      {Object}        opt                     [*]参数
     *  @param      {HTMLElement}   opt.openBtn             [*]触发弹出对话框的按钮
     *  @param      {HTMLElement}   opt.imgElement          图片裁好后被反写图片地址的Dom
     *  @param      {Boolean}       opt.isShowMsg           是否有Tips提示  
     *  @param      {Number}        opt.tipTimer            Tips提示信息停留多久才关闭
     *  @param      {String}        opt.defaultImgSrc       显示的图片地址是此图片时，工具栏不可用，不可裁图
     *  @param      {String}        opt.initImgSrc          初始化的图片URL地址
     *  @param      {String}        opt.token               令牌
     *  @param      {Function}      opt.setToolDisabled     图片加载完成后；是否是正常可用的，参数为是否不可用
     *  @param      {Function}      opt.upSuccess           上传成功回调
     *  @param      {Function}      opt.success             裁图上成功回调
     *  @param      {Function}      opt.fail                裁图上失败回调
     *  @param      {Function}      opt.loading             裁图已经成功，正在尝试加载图片；前提是success回调没有被覆盖
     *  @param      {Function}      opt.loadSuccess         裁图已经成功，图片尝试加载成功；前提是success回调没有被覆盖
     *  @param      {Function}      opt.loadFail            裁图已经成功，图片尝试加载失败；前提是success回调没有被覆盖
     *  @param      {Function}      opt.beforeCut           裁图前回调
     *  @param      {Function}      opt.imgLoadFail         上传成功但加载图片失败回调
     *  @param      {Function}      opt.getCutURI           获取裁图的服务地址，默认返回是https://image.scloud.letv.com/api/v1/icon
     *  @param      {Object}        opt.cutpictureOpt       裁图参数，参考Cutpicture
     *  @param      {Object}        opt.uploaderOpt         上传参数，参考Uploader
     *  @param      {Object}        opt.pushMsg             过程信息和错误信息在这个回调中都能取到;参数依次是msgCode, msgString, btnElement, hasCloseBtn, isError
     *  @param      {Object}        opt.cutOpt              截图请求Go的参数，传参需谨慎；
     *  @return     {Cut}           返回Cut的实例
     *  @example

            new Cut({
                "openBtn":".ui-button"
                ,"imgElement":$("#img")
                ,"token":"10298ccca5AzuHm1njfbJ2khoGMkFuh73Nkm1ypbLQxeupoWWgJzg0Qm3NwU3iQDiXz2zk7Yh"
                // ,"success":function(data, imgURI){
                //     log("success:",imgURI);
                // }
                ,"fail":function(data){
                    log("fail:",data)
                }
                ,initImgSrc:"http://img1.imgtn.bdimg.com/it/u=1897355986,2914710187&fm=21&gp=0.jpg"
                ,tipTimer:3000
                // ,"dialogOpt":{
                //     width:900
                // }
            });
     */
    var Cut = function(opts){

        // 继承父类属性
        ROCK.core.BaseClass.call(this);

        var me = this;

        // 参数的默认值配置
        var opt = {
            openBtn:""
            ,isShowMsg:true
            // 裁图成功
            ,success:function(data, cutAfterImgURI){
                opts.loading && opts.loading.call(me, cutAfterImgURI);
                ROCK.util.attemptAccessImg(cutAfterImgURI, {
                    "success":function(imgUrl, img){
                        $(opt.imgElement).attr("src", $(img).attr("src"));
                        opts.loadSuccess && opts.loadSuccess.call(me, $(img).attr("src"), cutAfterImgURI);
                    }
                    ,"fail":function(imgUrl){
                        opts.loadFail && opts.loadFail.call(me, imgUrl, cutAfterImgURI);
                        me._showMsg("CUT_M006", me._MSG["M006"], me._dialog && me._dialog.getDialogDom().find(".J_cutBtn"), true, true);
                    }
                    ,"unTimestamp":!!opts.unTimestamp
                    ,"maxCount":10
                    ,"timer":800
                    ,"group":"cut_GRP_" + ROCK.util.getOnlyKey()
                });
                //$(opt.imgElement).attr("src", cutAfterImgURI);
            }
            // 裁图失败
            ,fail:function(data){}
            // 裁图前
            ,beforeCut:function(){}
            // 图片加载失败,在不重写uploaderOpt.onUploadSuccess时有效
            ,imgLoadFail:function(){}
            // 裁图片的接口地址
            ,getCutURI:function(){
                return "https://image.scloud.letv.com/api/v1/icon";
            }
            ,cutpictureOpt:{

            }
            ,uploaderOpt:{

            }
        }

        // 重置配置
        $.extend(opt, opts);

        // 参数
        this.opt = opt;
        this._initDialogOpt();
        this._dialog = null;
        this._uploader = null;
        this._cutpicture = null;
        this._tips = null;
        this.uploadIndex = 0; // 正在上传的Key
        this._MSG = {
            "M001":"裁图失败"
            ,"M002":"处理中..."
            ,"M003":"选择图片"
            ,"M004":"图片加载失败"
            ,"M005":"请先上传图片"
            ,"M006":"图片显示加载失败"
        }

        // 控件初始值化
        me._init();

    };

    // 继承原型
    ROCK.core.BaseClass.extend(Cut);

    $.extend(Cut.prototype, {

        // 初始化
        _init:function(){

            var me = this;
            var opt = me.opt;

            // 初始化对话框
            me._dialog = new Dialog(opt.dialogOpt);

            // 绑定外部事件
            me._bind();
        }

        /** 获取上传Uploader组件实例
         *
         *  @roclass    Cut
         *  @roname     getUploader
         *  @return     {Uploader}      返回上传Uploader组件实例
         */
        ,getUploader:function(){

            return this._uploader;
        }

        /** 获取对话框Dialog组件实例
         *
         *  @roclass    Cut
         *  @roname     getDialog
         *  @return     {Dialog}        返回对话框Dialog组件实例
         */
        ,getDialog:function(){

            return this._dialog;
        }

        /** 获取切图Cutpicture组件实例
         *
         *  @roclass    Cut
         *  @roname     getCutpicture
         *  @return     {Cutpicture}    返回切图Cutpicture组件实例
         */
        ,getCutpicture:function(){

            return this._cutpicture;
        }

        // 显示信息
        ,_showMsg:function(code, msg, btnElement, hasCloseBtn, isError){
            var me = this;
            var opt = me.opt;

            opt.pushMsg && opt.pushMsg.apply(this, arguments);

            if(opt.isShowMsg === false){
                return false;
            } 

            me._tips && me._tips.close();
            // 没有提示的必要
            if(btnElement.parent().filter(":visible").length == 0){
                return false;
            }
            me._tips = new Tips({
                content:msg
                ,zIndex:10009
                ,width:"auto"
                ,target:btnElement
                ,offset:{
                    y:0
                    ,x:0
                }
                ,hasCloseBtn:hasCloseBtn
                ,parent:btnElement.parent()
                ,cancel:function(){
                }
                ,show:function(){  
                    var my = this;                     
                    setTimeout(function(){
                        hasCloseBtn && my.close();
                    }, opt.tipTimer || 3000);
                }
            });
        }

        // 获取token令牌
        ,_getToken:function(){
            var me = this;
            var opt = me.opt;
            var token = opt.token;
            var tmpToken = null;

            if(typeof(token) == "string"){
                tmpToken = token;
            }else if(typeof(token) == "function"){
                tmpToken = token();
            }

            return tmpToken;
        }

        // 使用裁截接口裁截的参数
        ,_getCutAPI:function(dom){

            var me = this;
            var opt = me.opt;
            var imgElement = dom.find(".ui-dialog-content img");
            var url = imgElement.attr("src");
            var imgUrl = $.trim(url);
            if(imgUrl == ""){
                me._showMsg("CUT_M005", me._MSG["M005"], dom.find(".J_cutBtn"), true, true);
                // 请先上传图片
                return;
            }

            var picData = me._cutpicture.getData();
            var data = {
                "srcImg":imgUrl
                ,"curSize":Math.abs(parseInt(picData.curWidth)) + "x" + Math.abs(parseInt(picData.curHeight))
                ,"cropOffset":Math.abs(parseInt(picData.x)) + "x" + Math.abs(parseInt(picData.y))
                ,"cropSize":Math.abs(parseInt(picData.cutWidth)) + "x" + Math.abs(parseInt(picData.cutHeight))
            }

            opt.beforeCut.call(me, data) === true && me._dialog.close();

            new Go($.extend({
                "url":opt.getCutURI.call(me),
                "crossDomain":false,
                "type":'get',
                "lock":imgElement,
                "data":data,
                "headers":{
                    "X-Requested-With":true
                    ,"withcredentials":true
                    ,"token":me._getToken()
                },
                success:function(data) {

                    data = data || {};

                    var dt = data.data || {};
                    var icon_url = dt.icon_url;

                    if(data.errno == "10000"){
                        opt.success.call(me, data, icon_url) !== true && me._dialog.close();
                        //me._tips && me._tips.close();
                    }else {
                        opt.fail.call(me, data) === true && me._dialog.close();
                        me._showMsg("CUT_M001", me._MSG["M001"], dom.find(".J_cutBtn"), true, true);
                    }
                },
                beforeSend:function(){
                    me._showMsg("CUT_M002", me._MSG["M002"], dom.find(".J_cutBtn"), false, false);
                },
                fail:function(data){
                    opt.fail.call(me, data) === true && me._dialog.close();
                    me._showMsg("CUT_M001", me._MSG["M001"], dom.find(".J_cutBtn"), true, true);

                },
                complete:function(){
                },
                dataType:'json'
            }, opt.cutOpt));
        }

        // 获取上传组件的参数
        ,_getUpOpt:function(dom){
            var me = this;
            var opt = me.opt;
            opt.uploaderOpt = opt.uploaderOpt || {};
            var upOpt = opt.uploaderOpt.upOpt || {};
            var selecFn = upOpt.onSelect;
            var selecErrorFn = upOpt.onSelectError;
            var uploadSuccessFn = upOpt.onUploadSuccess;
            delete upOpt.onSelect;
            delete upOpt.onSelectError;
            delete upOpt.onUploadSuccess;
            delete opt.uploaderOpt.upOpt;

            return $.extend({
                token:me._getToken()
                ,bucket:"contacticon"
                ,upOpt: $.extend({
                    "container": dom.find(".J_uploadBtn")
                    ,"buttonClass":"ui-button"
                    ,"auto":true
                    ,"fileSizeLimit": "5M"
                    ,"fileTypeDesc": "image/jpeg,image/jpg,image/png,image/bmp"
                    ,"buttonText": me._MSG["M003"]
                    ,"onSelectError": function(file, errorCode, errorMsg) {
                        me._showMsg(errorCode, errorMsg, dom.find(".J_uploadBtn"), true, true);
                        selecErrorFn && selecErrorFn.apply(this, arguments);
                    }
                    ,onUploadStart:function(file){
                    }
                    ,"onUploadError": function(file, errorCode, errorMsg) {
                        me._showMsg(errorCode, errorMsg, dom.find(".J_uploadBtn"), true, true);
                    }
                    ,"onUploadSuccess":function(file, data, response){
                        uploadSuccessFn && uploadSuccessFn.apply(this, arguments);
                        opt.upSuccess && opt.upSuccess.apply(me, arguments);
                        me._cutpicture.loadImg(file.downloadPath);
                    }
                    ,initError:function(){
                    }
                    ,onSelect:function(file){
                        me.uploadIndex = file.index;
                        dom.find(".ui-dialog-content img").hide();
                        dom.find(".ui-dialog-content .J_cutTool").children().hide();
                        selecFn && selecFn.apply(this, arguments);
                    }
                    ,onAfterUpload:function () {
                    }
                }, upOpt)
                // GO 的配置
                ,upURLOpt: {
                    
                }
            }, opt.uploaderOpt);
        }

        // 获取裁截图片的参数
        ,_getCutPictureOpt:function(dom){

            var me = this;
            var opt = me.opt;

            return $.extend({
                container:dom.find(".ui-box")           // 控件容器Dom
                ,plus:dom.find(".J_ZoomUp")             // +按钮
                ,subtract:dom.find(".J_ZoomDown")       // -按钮
                //,view:".J_base"                       // 恢复初始按钮
                ,maxLevel:30
                ,progressContainer:dom.find(".pro")
                ,progressDom:dom.find(".l")
                ,dotDom:dom.find(".dot")
                ,offsetX:6
                ,speed:40
                ,imgSrc:opt.initImgSrc
                ,fail:function(){
                    me._showMsg("CUT_M004", me._MSG["M004"], dom.find(".J_uploadBtn"), false, true);
                    opt.imgLoadFail.call(me, opt.initImgSrc);
                    opt.setToolDisabled && opt.setToolDisabled.call(me, true);
                }
                ,success:function(imgSrc){
                    if($.trim(opt.defaultImgSrc) != "" && opt.defaultImgSrc == imgSrc){
                        dom.find(".ui-dialog-content .J_cutTool").children().hide();
                        opt.setToolDisabled && opt.setToolDisabled.call(me, false);
                    }else{
                        dom.find(".ui-dialog-content .J_cutTool").children().show();
                        opt.setToolDisabled && opt.setToolDisabled.call(me, true);
                    }
                    
                }
            }, opt.cutpictureOpt);
        }

        // 初始化对话框组件的参数
        ,_initDialogOpt:function(){

            var me = this;
            var opt = me.opt;

            var dlgOpt = {
                content:me._getHtml()
                ,width:356
                ,init:function(){
                    var dom = me._dialog.getDialogDom();
                    // 初始裁截组件
                    me._cutpicture = new Cutpicture(me._getCutPictureOpt(dom));
                    // 初始上传组件
                    me._uploader = new Uploader(me._getUpOpt(dom));
                    // 调用裁图
                    dom.on("click", ".J_cutBtn", function(){
                        me._getCutAPI(dom);
                    });
                }
                ,cancel:function(){
                    me._tips && me._tips.close();
                }
            }

            // 小心使用这种方式
            opt.dialogOpt = $.extend(dlgOpt, opt.dialogOpt);
        }

        // 获取弹框模板
        ,_getHtml:function(){
            var html = '\
                <div class="ui-cut">\
                    <span class="ui-close" onclick="ROCK.core.BaseClass.get({guid}).close()">X</span>\
                    <div class="ui-dialog-header"></div>\
                    <div class="ui-dialog-content">\
                        <div class="ui-box">\
                            <div style="font-size: 23px;" class="ui-load">\
                                <div class="ui-load-bg1"></div>\
                                <div class="ui-load-bg2">\
                                    <div class="ui-load-bg3"></div>\
                                </div>\
                            </div>\
                            <img class="animated pulse" style="display:none;" src="">\
                        </div>\
                        <div class="toolBar clearfix J_cutTool">\
                            <span class="ui-button J_ZoomDown">-</span>\
                            <span class="pro">\
                                <span class="h"></span>\
                                <span class="l" style="width: 0px;"></span>\
                                <span class="dot" style="left: -6px;"></span>\
                            </span>\
                            <span class="ui-button J_ZoomUp">+</span>\
                        </div>\
                    </div>\
                    <div class="ui-dialog-footer">\
                        <span class="J_uploadBtn">\
                        </span>\
                        <span class="ui-button J_cutBtn">确定</span>\
                    </div>\
                </div>'
            return html;
        }

        // 绑定事件
        ,_bind:function(){
            var me = this;
            var opt = me.opt;

            // 呼出对话框
            $(opt.openBtn).on("click", function(){
                me._dialog.open();
            });
        }

    });
    
    
    module.exports = Cut;
});
