;
define(ROCK.seaConfig.alias.dialog, function(require, exports, module) {

    /** 对话框
     *
     *  @author ywchen(陈余文)
     *  @constructs Dialog
     *  @date 2015.04.30
     *  @param {Object} opts                                [*]参数
     *  @param {String|Function|HTMLElement} opts.content   [*]对话框的内容
     *  @param {Number} opts.width                          对话框宽度，默认300px
     *  @param {Number} opts.height                         对话框高度，默认自动
     *  @param {Boolean} opts.isStop                        对话框是否不跟随滚动，默认为不跟随
     *  @param {Number} opts.timer                          设置自动关闭时间，毫秒级，默认不自动关闭
     *  @param {Boolean} opts.hasMask                       是否显示蒙板，默认显示
     *  @param {Boolean} opts.classes                       配置样式{"iframe":"","window":"","mask":""}
     *  @param {Boolean} opts.idsPrefix                     配置样式ID前缀{"iframe":"","window":"","mask":""}
     *  @param {Function} opts.init                         对话框被初始化时的回调，仅触发一次
     *  @param {Function} opts.confirm                      点击确定按钮时被回调
     *  @param {Function} opts.colse                        点击关闭按钮时被回调，和ucolse的区别是：colse被定义为程序处理的，ucolse被用户主动发起的
     *  @param {Function} opts.ucolse                       点击关闭按钮时被回调，和colse的区别是：colse被定义为程序处理的，ucolse被用户主动发起的
     *  @param {Function} opts.beforeOpen                   对话框被打开显示前的回调
     *  @param {Function} opts.afterOpen                    对话框被打开显示后的回调
     *  @param {Function} opts.beforeClose                  对话框被关闭或被移除前的回调
     *  @param {Function} opts.afterClose                   对话框被关闭或被移除后的回调
     *  @param {Function} opts.cancel                       只要对话框被移除或隐藏都被回调；回调的参数恒等于true是，是用户主动关闭的
     *  @return {Dialog} Dialog的实例
     *  @version 1.0.1
     *  @example
     
            var dlg = new Dialog({
                "width":500
            });
            dlg.open(); 
     */
    var Dialog = function(opts) {

        var meFn = arguments.callee;
        meFn.session = meFn.session || {};
        meFn.session.dialogs = meFn.session.dialogs || [];
        meFn.session.dialogs.push(this);

        // 继承父类属性
        ROCK.core.BaseClass.call(this);

        // 参数的默认值配置
        var opt = {
             width: 300                             // 对话框宽度，300px
            ,height: "auto"                         // 对话框高度，默认自动
            ,content: ''                            // 对话框的内容
            ,isStop:false                           // 对话框是否不跟随滚动，默认为不跟随
            ,timer: null                            // 设置自动关闭时间，毫秒级，默认不自动关闭
            ,hasMask: true                          // 是否显示蒙板，默认显示
            ,classes:{
                "container":"ui-dialogs-container"
                ,"iframe":"ui-iframe"
                ,"window":"ui-dialog"
                ,"mask":"ui-mask"
            }
            ,idsPrefix:{
                "iframe":"lbl_dialog_iframe_"
                ,"window":"lbl_dialog_window_"
                ,"mask":"lbl_dialog_mask_"
            }
            ,init:function(){}                      // 对话框被初始化时的回调，仅触发一次
            ,confirm: function() {return true}      // 点击确定按钮时被回调
            ,colse: function() {return true}        // 点击关闭按钮时被回调，和ucolse的区别是：colse被定义为程序处理的，ucolse被用户主动发起的
            ,ucolse: function() {return true}       // 点击关闭按钮时被回调, 和colse的区别是：colse被定义为程序处理的，ucolse被用户主动发起的
            ,beforeOpen: function() {}              // 对话框被打开显示前的回调
            ,afterOpen: function() {}               // 对话框被打开显示后的回调
            ,beforeClose: function(){}              // 对话框被关闭或被移除前的回调
            ,afterClose: function(){}               // 对话框被关闭或被移除后的回调
            ,cancel: function() {}                  // 只要对话框被移除或隐藏都被回调
            //,ucancel: function() {}               // 用户关闭的回调
            ,unload: function() {}                  // 暂不支持 --- debug --- 
        }

        // 重置配置
        $.extend(opt, opts);

        // 参数
        this.opt = opt;

        // 是否已经宣染过
        this._rendered = false;
        // 是否是显示状态
        this.isShow = false;
        // 当前实例是否已经被释放
        this._isDispose = false;
        // 缓存空间
        this._data = {};
        this.dialogs = meFn.session.dialogs;
        //this.isFirstOpen = true;
    }

    // 继承原型
    ROCK.core.BaseClass.extend(Dialog);

    $.extend(Dialog.prototype, {

        /** 提供数据的存取
         *
         *  @roclass Dialog
         *  @roname data
         *  @param {String} key    键
         *  @param {String} value  值
         *  @return {Object|String|Numer} 设置值时无返回值，取值时有返回；返回值的类型为存储入的类型
         *  @example
                var dlg = new Dialog();
                dlg.data("key1","123"); // 设置键值
                dlg.data("key1");       // 根据键取值
         */
        data:function(key, value){

            // 对象被释放的话，中止执行
            if(this._isDispose == null || this._isDispose) {return;} ;

            if(value == null){
                return this._data[key];
            }else{
                this._data[key] = value;
            }
        }

        /** 事件绑定
         *
         *  @roclass Dialog
         *  @roname _bind
         *  @return 无返回值
         *  @example
                var dlg = new Dialog();
                dlg._bind();
         */
        ,_bind:function(){
            var me = this;
            // 按下Tab键，对话框关闭
            $(document).bind("keyup", function(e){
                if(e.keyCode == 27){
                    me.close();
                }
            });
        }

        /** 显示对话框
         *
         *  @roclass Dialog
         *  @roname open
         *  @return 无返回值
         *  @example
                var dlg = new Dialog();
                dlg.open();
         */
        ,open:function(){

            // 对象被释放的话，中止执行
            if(this._isDispose == null || this._isDispose) {return;} ;

            var opt = this.opt || {};

            // 是否渲染过了；未渲染过则渲染；
            if(!this._rendered){
                this._render();
                this._bind();
                opt.init.call(this);
            }

            // 如果是已经显示的，处理中止
            if(this.isShow){
                return ;
            }

            // 显示前回调，当回调处理要求不能显示时(返回值为恒等于false时)，处理中止，对话框不执行显示操作
            if(opt.beforeOpen.call(this) === false){
                return false;
            }
            
            // 显示内容区域
            $("#" + opt.idsPrefix.window + this.guid).stop(false,true).fadeIn();

            // 显示蒙层区域
            if(opt.hasMask !== false){
                $("#" + opt.idsPrefix.mask + this.guid).show().css({
                    "opacity":"0"
                }).animate({
                    "opacity":"0.5"
                })
            }

            // 显示IE下select控件的处理区域
            $("#" + opt.idsPrefix.iframe + this.guid).show();

            // 设置自动关闭
            this._setTimer();

            // 标识显示
            this.isShow = true;
            
            // 显示后的回调
            opt.afterOpen.call(this);

        }

        /** 判断是否是IE6
         *
         *  @roclass Dialog
         *  @roname _isIe6
         *  @return {Boolean}    是否是IE6
         */
        ,_isIe6:function(){

            // 对象被释放的话，中止执行
            if(this._isDispose == null || this._isDispose) {return;} ;

            // --- debug ---
            return false;
            /*
            if($.browser.msie && $.browser.version < 7){
                return true;
            }else{
                return false;
            }
            */
        }

        /** 按不同类型取模板
         *
         *  @roclass Dialog
         *  @roname _getTpl
         *  @param {Function|String|HTMLElement} tpl    被处理的模板
         *  @param {Number} maxLoopCount    最大处理深度10级
         *  @return {String}    被处理后的值
         */
        ,_getTpl:function(tpl, maxLoopCount){

            // 对象被释放的话，中止执行
            if(this._isDispose == null || this._isDispose) {return;} ;

            var self = arguments.callee;

            // 最大处理深度10级
            if(maxLoopCount == null){
                maxLoopCount = 10;
            }

            if(maxLoopCount <= 0){
                // END
                return "";
            }
            maxLoopCount--;
            
            // 函数时
            if(typeof(tpl) == "function"){
                
                tpl = tpl.call(this, this.guid);
                tpl = self.call(this, tpl, maxLoopCount);

            // 字符串时
            }else if(tpl == null || typeof(tpl) == "string"){

                tpl = $.trim(tpl);
                tpl = tpl.replace(/{guid}/g, this.guid);
                
            // op.tpl是dom对象
            }else{
                tpl = tpl;
            }

            return tpl;
        }

        /** 
         *  对话框宣染
         *
         *  @roclass Dialog
         *  @roname _render
         *  @return 无返回值
         */
        ,_render: function(){

            // 对象被释放的话，中止执行
            if(this._isDispose == null || this._isDispose) {return;} ;

            var me = this
              , op = me.opt
              , top = null
              , iframeString = ''
              , html
              , dom
              , winElement
              , maxLoopCount = 10;  // 最大深度10级
            
            top = (document.documentElement || document.body).scrollTop;

            // 处理IE6的select总是
            if(me._isIe6()){
                iframeString = '<iframe data-hash="{guid}" id="' + op.idsPrefix.iframe + '{guid}" class="' + op.classes.iframe + '" frameborder="0" style="display:none;"></iframe>';
            }

            html = iframeString + '<div data-hash="{guid}" id="' + op.idsPrefix.mask + '{guid}" class="' + op.classes.mask + '" style="display:block;visibility:hidden;"></div><div data-hash="{guid}" style="display:block;visibility:hidden;" id="' + op.idsPrefix.window + '{guid}" class="' + op.classes.window + '"></div>';
            html = me._getTpl(html);

            dom = $(html);
            winElement = dom.filter("." + op.classes.window);
            
            winElement.append(me._getTpl(op.content));
            
            if($("." + op.classes.container).length == 0){
                $("body").append('<div class="' + op.classes.container + '"></div>');
            }
            $($("." + op.classes.container).first()).append(dom);

            
            
            //this._setStytle(winElement);
            // 跟随滚动，（可只限制IE6，因为非IE6下有position:fixed）
            if(op.isStop !== true && me._isIe6()){
                $(window).bind("scroll resize", function(e){
                    me._scroll(e);
                });
            }
            
            // IE6下蒙板放最大
            if(me._isIe6()){
                $(window).bind("resize", function(e){
                    // 只有延时操作才能在IE6下获取准确的值
                    setTimeout(function(){
                        $("#" + op.idsPrefix.iframe + me.guid).css({"width":"0px"});
                        me.getMaskDom().css({"width":"0px"});
                        var wWidth = $(window).width();
                        var dWidth = $(document).width();
                        if(wWidth < dWidth){
                            me.getMaskDom().css({
                                "width":dWidth + "px"
                            });
                            $("#" + op.idsPrefix.iframe + me.guid).css({
                                "width":dWidth + "px"
                            });
                        }else{
                            me.getMaskDom().css({
                                "width":"100%"
                            });
                            
                            $("#" + op.idsPrefix.iframe + me.guid).css({
                                "width":"100%"
                            });
                        }
                    },1);
                });
            }

            me._setStytle();
            
            winElement.css({
                "visibility":"visible"
                ,"display":"none"
            });
            dom.filter("." + op.classes.mask).css({
                "visibility":"visible"
                ,"display":"none"
            });

            this._rendered = true;

        }

        /** 
         *  设置自动关闭操作
         *
         *  @roclass Dialog
         *  @roname _setTimer
         *  @return 无返回值
         */
        ,_setTimer : function(){

            // 对象被释放的话，中止执行
            if(this._isDispose == null || this._isDispose) {return;} ;

            var op = this.opt;
            var me = this;
            if(op.timer){
                setTimeout(function(){
                    me.close();
                },op.timer)
            }
        }

        /** 
         *  执行确定操作
         *
         *  @roclass Dialog
         *  @roname confirm
         *  @return 无返回值
         */
        ,confirm : function(){

            // 对象被释放的话，中止执行
            if(this._isDispose == null || this._isDispose) {return;} ;

            if(this.opt.confirm.call(this)){
                this.close();
            }
        }   

        /** 
         *  执行关闭操作，规定为用户执行的
         *
         *  @roclass Dialog
         *  @roname uclose
         *  @return 无返回值
         */
        ,uclose:function(){

            // 对象被释放的话，中止执行
            if(this._isDispose == null || this._isDispose) {return;} ;

            //typeof(this.opt.ucancel) == "function" && this.opt.ucancel.call(this);
            this.close(true);
        }

        /** 
         *  执行关闭操作，规定为程序执行的
         *
         *  @roclass Dialog
         *  @roname close
         *  @param  {Boolean} isUserClose 是否是用户主动关闭的，默认false
         *  @return 无返回值
         */
        ,close:function(isUserClose){

            // 对象被释放的话，中止执行
            if(this._isDispose == null || this._isDispose) {return;} ;

            var me = this;
            var op = me.opt;

            if(this.opt.beforeClose && this.opt.beforeClose.call(this, isUserClose) === false){
                return ;
            }

            me.cancel(isUserClose);
            $("#" + op.idsPrefix.mask + me.guid + ',' + "#" + op.idsPrefix.window + me.guid).stop(false,true).fadeOut();
            $("#" + op.idsPrefix.iframe + me.guid).hide();

        }
    
        /** 
         *  执行移除操作
         *
         *  @roclass Dialog
         *  @roname remove
         *  @return 无返回值
         */
        ,remove:function(){

            // 对象被释放的话，中止执行
            if(this._isDispose == null || this._isDispose) {return;} ;

            var me = this;

            if(this.opt.beforeClose && this.opt.beforeClose.call(this, false) === false){
                return ;
            }

            me._remove();
            me.cancel();
        }

        /** 
         *  不管是隐藏还是删除dom节点，只要用户从看到变到看不到就会触发 
         *
         *  @roclass Dialog
         *  @roname cancel
         *  @param  {Boolean} isUserClose 是否是用户主动关闭的，默认false
         *  @return 无返回值
         */
        ,cancel:function(isUserClose){

            // 对象被释放的话，中止执行
            if(this._isDispose == null || this._isDispose) {return;} ;
            var me = this;
            var opt = me.opt;
            me.isShow = false;
            opt.cancel && opt.cancel.call(me, isUserClose);
            opt.afterClose && opt.afterClose.call(me, isUserClose);
        }

        /** 
         *  获取对话框的蒙板 
         *
         *  @roclass Dialog
         *  @roname getMaskDom
         *  @return 无返回值
         */
        ,getMaskDom:function(){

            // 对象被释放的话，中止执行
            if(this._isDispose == null || this._isDispose) {return;} ;

            var me = this;
            var op = this.opt;
            return $("#" + op.idsPrefix.mask + me.guid);
        }

        /** 
         *  获取对话的框Dom 
         *
         *  @roclass Dialog
         *  @roname getDialogDom
         *  @return 无返回值
         */
        ,getDialogDom:function(){

            // 对象被释放的话，中止执行
            if(this._isDispose == null || this._isDispose) {return;} ;

            var me = this;
            var op = me.opt;
            return $("#" + op.idsPrefix.window + me.guid);
        }

        /** 
         *  对话框的Dom移除，同时注销缓存对象 
         *
         *  @roclass Dialog
         *  @roname _remove
         *  @return 无返回值
         */
        ,_remove:function(){

            // 对象被释放的话，中止执行
            if(this._isDispose == null || this._isDispose) {return;} ;

            var me = this;
            var op = me.opt;

            $("#" + op.idsPrefix.iframe + me.guid).hide();
            $("#" + op.idsPrefix.mask + me.guid + ',' + "#" + op.idsPrefix.window + me.guid).stop(false,true).fadeOut(function(){
                $("#" + op.idsPrefix.mask + me.guid + ',' + "#" + op.idsPrefix.window + me.guid + ',' + "#" + op.idsPrefix.iframe + me.guid).remove();

                // 注销内存
                me.dispose();

                // 标识对象已经被释放
                me._isDispose = true;
            });
        }

        /** 
         *  设置样式 
         *
         *  @roclass Dialog
         *  @roname _setStytle
         *  @return 无返回值
         */
        ,_setStytle : function(){

            // 对象被释放的话，中止执行
            if(this._isDispose == null || this._isDispose) {return;} ;

            var me = this
              , dom = me.getDialogDom()
              , op = me.opt
              , wHeight = $(window).height()
              , h = 0;

            op.css = {
                width:op.width
                ,height:op.height
            }

            if(op.isStop || (!op.isStop && me._isIe6())){
                // 要优先SET样式，再计算
                dom.css(op.css);
                dom.css("position","absolute");
                var s = $(window).scrollTop();
                var m = $(window).scrollLeft();
                var hei = this.getDialogDom().height();
                var wid = this.getDialogDom().width();
                var dWidth = $(document).width();
                var dHeight = $(document).height();
                var wWidth = $(window).width();
                var wHeight = $(window).height();
                var height = wHeight - Math.min(wHeight,hei);
                var width = wWidth - Math.min(wWidth,wid);
                // --- debug --- 可以设置成只有margin-left和top是负值时才减半
                var top = s + (height / 2);
                var left = m + (width / 2);
                
                op.css.top = top;
                op.css.left = left;
                op.css.top = parseInt(op.css.top >= 0 ? op.css.top : 0); 
                op.css.left = parseInt(op.css.left >= 0 ? op.css.left : 0); 
            }

            dom.css(op.css);

            if(op.css.top === 0 || op.css.top){     //传递坐标值的时候,使用坐标值
                return
            }
            
            // 修复过高时上部看不到的问题
            h = wHeight - dom.height();
            h = (h >= 0) ? dom.height() : wHeight
            
            dom.css({
                'margin-left' : 0 - (dom.width()/2), 
                'margin-top' : 0 - (h/2)
            })
        }

        /** 重新设置定位
         *
         *  @roclass Dialog
         *  @roname resize
         *  @return 无返回值
         */
        ,resize : function(opts){
            var me = this;
            var opt = me.opt
            opts = opts || {};
            opt.width = opts.width || opt.width;
            opt.height = opts.height || opt.height;

            me._setStytle();
        }

        /** 关闭其它窗体，慎用
         *
         *  @roclass Dialog
         *  @roname closeOther
         *  @param {Dialog} dialog 保留显示的窗体
         *  @return 无返回值
         */
        ,closeOther:function(dialog){
            $.each(this.dialogs, function(index, dlg){
                if(dlg != dialog){
                    dlg.close();
                }
            });
        }
    });

    module.exports = Dialog;
});
