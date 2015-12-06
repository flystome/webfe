;
define(ROCK.seaConfig.alias.upload, function(require, exports, module) {

    /** 模拟Select下拉框,注意，此组件依赖input的contentChange自定义事件
     *
     *  @author ywchen(陈余文)
     *  @constructs Upload
     *  @date       2015.06.16
     *  @version    1.0.1
     *  @param      {Object}        opt                     [*]参数
     *  @param      {HTMLElement}   ops.container           [*]组件容器
     *  @param      {String}        ops.uploader            [*]上传地址
     *  @param      {function}      ops.initError           初始化控件时出错了,一般是浏览器不支持HTML5上传且没有传递opt.swf参数所致
     *  @param      {Object}        ops.formData            附带提交的数据，是JSON格式
     *  @param      {String}        ops.swf                 当不支持HTML5，使用Flash上传的Flash文件地址
     *  @param      {String}        ops.buttonClass         上传按钮的样式,默认“ro-upload-btn”
     *  @param      {String}        ops.buttonBox           组件的按钮的样式，默认“ro-upload-box”
     *  @param      {String}        ops.buttonText          上传组件显示的文本内容，默认“上 传”
     *  @param      {Boolean}       ops.multi               是否支持多个上传，默认支持
     *  @param      {String}        ops.fileTypeDesc        支持可上传什么类型的文件(HTML5的上传使用)，默认“All Files”；可设置例如'image/*'、'image/png'
     *  @param      {String}        ops.fileTypeExts        支持可上传什么类型的文件(Flash的上传使用)，默认“*.*”；可设置例如'*.gif,*.jpg,*.jpeg,*.bmp,*.png'
     *  @param      {String}        ops.fileObjName         接口接收的文件Key字段,默认“upfile”
     *  @param      {String}        ops.filename            上传时带到接口文件的名称，带扩展名；默认使用选择的原始名
     *  @param      {String}        ops.fileSizeLimit       上传文件大小限制，0为不限制；默认为5M
     *  @param      {String}        ops.uploadLimit         最大可上传文件数,默认999
     *  @param      {String}        ops.height              上传控件的高度，默认30
     *  @param      {String}        ops.width               上传控件的宽度，默认120
     *  @param      {String}        ops.auto                是否自动上传，默认是
     *  @param      {Boolean}       ops.sendAsBinary        是否将文件转为文本发送 
     *  @param      {String}        ops.tpl                 HTML5上传的模板，默认['<div class="{buttonBox}">','<input type="file" style="display:none" multiple="{multi}" name="{fileObjName}">','<span class="{buttonClass}">{buttonText}</span>','</div>'].join("") 
     *  @param      {function}      ops.customValidate      用户自定义验证,参数file,返回true为通过，false为不通过
     *  @param      {function}      ops.asyncValidate       异步验证，第一个参数是files;第二个参数是callback，不管是否验证通过都调用callback,callback的第一个参数是是否验证成功；第二个是哪个文件验证失败；第三个是错误原因；
     *  @param      {function}      ops.onUploadStart       开始上传时回调，第一个参数是File对象;对文件对象进行了扩展；file.index,为key，也是控件初始化后当前文件是第几个被选中的;file.length;在一次选择文件中一代被选中了几个；file.isHtml5;当前上传控件是否为html5版本的
     *  @param      {function}      ops.onUploadProgress    上传过程中回调，第一个参数是File对象，第二个参数是文件上传了的大小，第三个参数是被上传的文件是多大的
     *  @param      {function}      ops.onUploadSuccess     上传成功后回调，第一个参数是File对象，第二个参数是上传接口的返回值
     *  @param      {function}      ops.onUploadComplete    上传完成后回调，不管是上传是成功还是失败；都会回调，第一个参数是File对象
     *  @param      {function}      ops.onBeforeSelect      每一次选中文件事件触发前发生
     *  @param      {function}      ops.onSelect            选择上传文件时回调，第一个参数是File对象
     *  @param      {function}      ops.onAfterSelect       每一次选中文件事件触发后发生
     *  @param      {function}      ops.onBeforeUpload      每一次选中文件上传前回调
     *  @param      {function}      ops.onAfterUpload       每一次选中文件全部上传完成后回调
     *  @param      {function}      ops.onSelectError       选择的文件不符合要求时回调，第一个参数是File对象，第二个参数是错误码，第三个参数是错误内容
     *  @param      {function}      ops.onUploadError       上传文件出错时回调，第一个参数是File对象，第二个参数是错误码，第三个参数是错误内容
     *  @return     {Upload}        返回Upload的实例
     *  @example

            //HTML:
            <div id="uploadbar"></div>
            <div class="btn">提交</div>

            //JS:
            var upload = new Upload({
                "container":"#uploadbar"
                ,"uploader":"/upload"
                ,"formData":{
                    "data":123
                }
                ,"swf":"http://localhost:9000/ro/m/upload/js/1.0.1/uploadify.swf"
                ,"height":"30px"
                ,"width":"60px"
                ,"fileSizeLimit":"5M"   // 0为不限制
                ,"uploadLimit":10    // 最大可上传文件数
                ,"auto":false
                ,"fileTypeDesc":"image/png"
                //,"buttonText":"upload"
                ,"onUploadStart":function(file){
                    log("onUploadStart:",arguments)
                }
                ,"onUploadProgress":function(file, fileBytesLoaded, fileTotalBytes){
                    log("onUploadProgress:",arguments)
                }
                ,"onUploadSuccess":function(file, data, response){
                    log("onUploadSuccess:",arguments)
                }
                ,"onUploadComplete":function(file){
                    log("onUploadComplete:",arguments)
                }
                ,"onSelect":function(file){
                    log("onSelect:",arguments)
                }
                ,"onSelectError":function(file, errorCode, errorMsg){
                    log("onSelectError:",arguments)
                }
                ,"onUploadError":function(file, errorCode, errorMsg){
                    log("onUploadError:",arguments)
                }
            });

            $(".btn").click(function(){
                upload.send();
            });
     */
    var Upload = function(opts){

        // 继承父类属性
        ROCK.core.BaseClass.call(this);

        var me = this;
        // 参数的默认值配置
        var opt = {
            container:null                      // 组件容器
            ,buttonClass:"ro-upload-btn"        // 上传按钮的样式,默认“ro-upload-btn”
            ,buttonBox:"ro-upload-box"          // 组件的按钮的样式，默认“ro-upload-box”
            ,buttonText:"上 传"                  // 上传组件显示的文本内容，默认“上 传”
            ,multi:true                         // 是否支持多个上传，默认支持
            ,formData:{}                        // 附带提交的数据，是JSON格式
            ,fileTypeDesc:'All Files'           // 'image/*',"All Files"
            ,title:"Images"                     // 
            ,fileTypeExts:'*.*'                 // '*.gif,*.jpg,*.jpeg,*.bmp,*.png'
            ,fileObjName:"upfile"               // 接口接收的文件Key字段,默认“upfile”
            ,filename:null                      // 上传时带到接口文件的名称，带扩展名；默认使用上选择的原始名
            ,uploader:null                      // 上传地址
            ,fileSizeLimit:"5M"                 // 上传文件大小限制，0为不限制；默认为5M
            ,uploadLimit:999                    // 最大可上传文件数,默认999
            ,height:30                          // 上传控件的高度，默认30
            ,width:120                          // 上传控件的宽度，默认120
            ,auto:true                          // 是否自动上传，默认是
            ,tpl:[
                '<div class="{buttonBox}">'
                    ,'<input type="file" style="display:none" multiple="{multi}" name="{fileObjName}">'
                    ,'<span class="{buttonClass}">{buttonText}</span>'
                ,'</div>'
            ].join("")                          // HTML5上传的模板
            ,"customValidate":function(file){return true;}
            ,"onUploadStart":function(file){}
            ,"onUploadProgress":function(file, fileBytesLoaded, fileTotalBytes){}
            ,"onUploadSuccess":function(file, data, response){}
            ,"onUploadComplete":function(file){}
            ,"onBeforeSelect":function(file){}
            ,"onSelect":function(file){}
            ,"onAfterSelect":function(file){}
            ,"onSelectError":function(file, errorCode, errorMsg){}
            ,"onUploadError":function(file, errorCode, errorMsg) {}
            ,"asyncValidate":function(files, callback){callback(true)}
        }

        // 重置配置
        $.extend(opt, opts);

        // Html5的设置
        opt.accept = {
            title: opt.title
            ,extensions: opt.fileTypeExts
            ,accept: opt.fileTypeDesc
        }

        this.MSG = {
            "M001":"选择的文件数量已经超过了最大限定数量(" + opt.uploadLimit + ")"
            ,"M002":"选择的文件容量大小已经超过了最大限定(" + opt.fileSizeLimit + ")"
            ,"M003":"尚未选择文件！"
            ,"M004":""  // 下面有自定义
            ,"M005":"文件类型不符合要求"
            ,"M006":"自定义验证未通过"
            ,"M007":""  // 错误信息,异步的错误信息
        }

        // 参数
        this.opt = opt;
        this.files = [];
        this.xhr = {};      // 上传的请求
        this.xhr2 = {};     // 获取地址的请求
        this.abortList = {} // 取消列表
        this._error = [];
        this.maxSize = me._getFileLimitSize();

        this.container = $(opt.container);

        // 增量
        this._size = 0;
        this._isHtml5 = true;
        // 还在上传中的个数；
        this._count = 0;

        me._init();

    };

    // 继承原型
    ROCK.core.BaseClass.extend(Upload);

    $.extend(Upload.prototype, {

        // 初始化
        _init:function(){

            var me = this;
            if(!me._isSupportHtml5()){
                return false;
            }

            // 初始化控件
            me._initHtml();

            // 绑定事件
            me._bind();

        }

        // 绑定事件
        ,_bind:function(){

            var me = this;
            var inputElement = me._getInputElement();
            var btnElement = me._getBtnElement();

            // 选择文件后
            inputElement.bind("change", function(){
                me._select(this);
                me._reset();
            });

            // 绑定点击事件
            btnElement.bind("click", function(){
                inputElement.trigger("click");
            });

        }

        // 重置file选中控件
        ,_reset:function(){
            var me = this;
            me._initHtml();
            me._bind();
        }

        /** 获取指定(key)上传的AJAX对象
         *
         *  @roclass Upload
         *  @roname getXhr
         *  @param {Number} key [*]上传文件的ajax键；在file对象中file.index就是该key
         *  @return  {Upload} Upload的实例
         *  @example
                var upload = new Upload({...});
                upload.getXhr(2);
         */
        ,getXhr:function(key){

            return this.xhr[key];
        }

        /** 取消指定(key)上传
         *
         *  @roclass Upload
         *  @roname abort
         *  @param {Number} key [*]上传文件的ajax键；在file对象中file.index就是该key
         *  @return  {Upload} Upload的实例
         *  @example
                var upload = new Upload({...});
                upload.abort();
         */
        ,abort:function(key){
            var me = this;
            if(this.xhr[key] != null){
                this.xhr[key].abort();
            }
            if(this.xhr2[key] != null){
                this.xhr2[key].abort();
            }
            this.abortList[key] = true;

            // 删除的要从队列中删除掉
            $.each(me.files || [], function (index, file) {
                if(file && file.index == key){
                    me.files.splice(index, 1);
                }
            })
            return this;
        }

        /** 触发上传文件
         *
         *  @roclass Upload
         *  @roname send
         *  @return  {Upload} Upload的实例
         *  @example
                var upload = new Upload({...});
                upload.send();
         */
        ,send:function(){

            this._upload(true);
            return this;
        }

        /** 当前控件是否HTML5模式的；如果不是连这个方法也不存在 
         *
         *  @roclass Upload
         *  @roname isHtml5
         *  @return  {Upload} Upload的实例
         *  @example
                var upload = new Upload({...});
                upload.isHtml5();
         */
        ,isHtml5:function(){

            return this._isHtml5;
        }

        // 设置文件属性；返回是否设置成功
        ,_setFileProperty:function(file, key, value){

            if(file == null){
                return false;
            }

            try{
                file[key] = value;
            }catch(e){
                return false;
            }

            return true;
        }

        // 选择系统文件
        ,_select:function(fileInputElement){

            var me = this;
            var opt = me.opt || {};
            var files = fileInputElement.files;
            if(me.opt.multi == false){
                me.files = [];
            }
            me._error = [];

            // 添加属性
            $.each(files, function(index, file){
                // 当前的自增量, 当前文件是这个控件初始化后选中中多少个文件了
                me._setFileProperty(file, "index", me._size++);
                // 本次文件选中了几个
                me._setFileProperty(file, "length", files.length);
                // 是否为HTML5控件(file.isHtml5 === true)
                me._setFileProperty(file, "isHtml5", true);
                me.files.push(file)
            });

            me.opt.onBeforeSelect && me.opt.onBeforeSelect.call(me, me.files);

            if(!me._validata(files)){
                return false
            }

            // isOk,是否验证失败；file，失败的file；errorMsg,失败原因
            var onStart = function(isOk, file, errorMsg){

                if(isOk !== true){
                    me._onSelectError && me._onSelectError(file, "M007", errorMsg);
                    return;
                }

                // 选择文件
                $.each(files, function(index, file){
                    me.opt.onSelect && me.opt.onSelect.call(me, me._getFile(file));
                });

                me.opt.onAfterSelect && me.opt.onAfterSelect.call(me, me.files);

                me._upload(me.opt.auto);
            }

            // 异步验证
            if(typeof(opt.asyncValidate) == "function"){
                opt.asyncValidate.call(me, me.files, onStart);
            }else{
                onStart(true, null);
            }

        }

        // 验证选择文件后是否OK，若不OK派发出错误事件
        ,_validata:function(files){

            var me = this;
            var opt = me.opt || {};
            var length = files.length;
            var maxLength = opt.uploadLimit;
            var isOk = true;
            var customValidate = opt.customValidate || function(){return true};

            if(maxLength != 0 && length > maxLength){
                me._error = [files[0], "M001", me.MSG.M001];
                me._onSelectError && me._onSelectError(files[0], "M001", me.MSG.M001);
                return false;
            }

            $.each(files, function(index, file){
                if(me.maxSize != 0 && file.size > me.maxSize){
                    me._error = [file, "M002", me.MSG.M002];
                    me._onSelectError && me._onSelectError(file, "M002", me.MSG.M002);
                    isOk = false;
                    return false;
                }else if(!me._checkFileType(file)){
                    me._error = [file, "M005", me.MSG.M005];
                    me._onSelectError && me._onSelectError(file, "M005", me.MSG.M005);
                    isOk = false;
                    return false;
                }else if(!customValidate(file)){
                    me._error = [file, "M006", me.MSG.M006];
                    me._onSelectError && me._onSelectError(file, "M006", me.MSG.M006);
                    isOk = false;
                    return false;

                }
                    //me.opt.onSelect && me.opt.onSelect.call(me, me._getFile(file));
            });

            // 难大小，个数
            return isOk;
        }

        // 检查文件类型
        ,_checkFileType:function(file){

            var me = this;
            var opt = me.opt;
            var type = file.type;
            var isOk = true;
            var fileTypeDesc = opt.fileTypeDesc;
            fileTypeDesc = fileTypeDesc.replace(/\s*/g, "");  // 删除掉空格
            fileTypeDesc = fileTypeDesc.replace(/([\*\/])/g, function(a, b){
                switch(b){
                    case "\/":
                        return "\\\/";
                    case "*":
                        return ".*";
                }
            });  // 使用通配符

            var filterTypes = fileTypeDesc.split(",");
            $.each(filterTypes, function(index, item){
                if($.trim(item) == ""){
                    return true;
                }
                isOk = false;
                if(new RegExp("^" + item + "$").test(type)){
                    isOk = true;
                    return false;
                }
            });
            
            return isOk;

        }

        // 选择文件后出错时调用
        ,_onSelectError:function(files, errorCode, errorMsg){
            var me = this;
            var opt = me.opt;
            var file = null;
            // 取第一个文件
            if($.isArray(files)){
                file = me._getFile(files[0]);
            }else{
                file = me._getFile(files);
            }

            me.files = [];
            opt.onSelectError && opt.onSelectError.call(me, file, errorCode, errorMsg);

        }

        // 单文件循环上传
        ,_upload:function(auto){

            var me = this;
            var opt = me.opt;

            if(!auto){
                return ;
            }

            // 未选择文件不能上传
            if(me.files == null || me.files.length == 0){
                me._onSelectError &&me._onSelectError.call(me, null, "M003", me.MSG.M003);
                return;
            }

            // 有错误不能上传
            if(me._error.length > 0){
                me._onSelectError &&me._onSelectError.apply(me, me._error);
                return;
            }

            opt.onBeforeUpload && opt.onBeforeUpload.call(me, me.files);

            while(me.files.length > 0){
                var file = me.files.shift();
                // key:"M" + new Date().getTime() + "_" + Math.ceil(Math.random() * 10000)
                me._send(file.index, me._getFile(file));
            }

            //me.opt.onAfterUpload && me.opt.onAfterUpload.call(me, me.files);
        }

        // 单文件上传
        ,_send:function(key, file){

            var me = this;
            var opt = me.opt || {};
            var xhr = new _Ajax(me.opt, {
                "key":key
                ,"that":me
            });
            var sendAsBinary = false;

            // 被取消过的不再处理
            if(me.abortList[key] === true){
                return
            }

            me._count++;

            if(me.opt.sendAsBinary){
                sendAsBinary = true;
            }

            var goUp = function(uploader, headers){
                // 被取消过的不再处理
                if(me.abortList[key] === true){
                    me._upload._onUploadError(file, "M004", "abort", "用户取消");
                    return
                }
                xhr.send({
                    "filename":me._getFileName(file)
                    ,"extendData":me.opt.formData
                    ,"blob":file
                    ,"sendAsBinary":sendAsBinary
                    ,"uploader":uploader || me.opt.uploader
                    ,"headers":headers || me.opt.headers
                });

                goUp = null;
            }

            if(typeof(me.opt.onGetAsyncUploadURL) == "function"){
                // 获取地址的ajax
                this.xhr2[key] = me.opt.onGetAsyncUploadURL.call(me, file, goUp);
            }else{
                goUp();
            }

            
            
            this.xhr[key] = xhr;
        }

        // 上传中出错时调用
        ,_onUploadError:function(file, errorCode, errorMsg){
            var me = this;
            var opt = me.opt;
            opt.onUploadError && opt.onUploadError.apply(me, arguments);
            me._complete();
        }

        // 单文件上传成功
        ,_onUploadSuccess:function () {
            var me = this;
            var opt = me.opt;

            opt.onUploadSuccess && opt.onUploadSuccess.apply(me, arguments);
            opt.onUploadComplete && opt.onUploadComplete.apply(me, arguments);
            me._complete();
        }

        // 单文件上传完成
        ,_complete:function() {

            var me = this;
            var opt = me.opt;

            me._count--;

            if(me._count == 0){
                opt.onAfterUpload && opt.onAfterUpload.call(me);
            }
        }

        // 获取调用此接口的参数限定大小
        ,_getFileLimitSize: function(){
            var fileSizeLimit = this.opt.fileSizeLimit;
            var size = null;
            if(fileSizeLimit == null){
                size = 0;
            }else if(typeof(fileSizeLimit) == "number"){
                size = fileSizeLimit;
            }else if(/^\d+$/.test(fileSizeLimit)){
                size = parseInt(fileSizeLimit);
            }else if(/^\d+B$/i.test(fileSizeLimit)){
                size = parseInt(fileSizeLimit);
            }else if(/^\d+(K|KB)$/i.test(fileSizeLimit)){
                size = parseInt(fileSizeLimit) * 1024;
            }else if(/^\d+(M|MB)$/i.test(fileSizeLimit)){
                size = parseInt(fileSizeLimit) * 1024 * 1012;
            }else if(/^\d+(G|GB)$/i.test(fileSizeLimit)){
                size = parseInt(fileSizeLimit) * 1024 * 1012 * 1012;
            }else if(/^\d+(T|TB)$/i.test(fileSizeLimit)){
                size = parseInt(fileSizeLimit) * 1024 * 1012 * 1012 * 1012;
            }else {
                size = 0;
            }
            return size;
        }

        // 获取按钮Dom
        ,_getBtnElement: function(){

            return this.container.find("." + this.opt.buttonClass);
        }

        // 获取选择file控件Dom
        ,_getInputElement: function(){

            return this.container.find("input");
        }

        ,_getHtml:function(){

            var me = this;
            var tpl = me.opt.tpl;
            tpl = tpl.replace(/{(\w+)}/g, function(a, b){
                var str = me.opt[b];
                str = str == null ? "" : str;
                return str;
            });
            return tpl;
        }

        // 初始化组件
        ,_initHtml:function(){

            var me = this;
            var tpl = me._getHtml();

            // 渲染HTML
            me.container.html(tpl);

            if(me.opt.multi === false){
                me.container.find('[multiple]').removeAttr("multiple");
            }

            var btnElement = me._getBtnElement();
            var inputElement = me._getInputElement();

            // 设置上传控件的属性
            $.each(me.opt.accept, function(key, value){
                inputElement.attr(key, value);
            });

            // 设置按钮的属性
            btnElement.css({
                height:me.opt.height
                ,width:me.opt.width
            });
        }

        // 获取文件，统一做一个取的接口
        ,_getFile:function(file){

            return file;
        }

        // 获取文件名
        ,_getFileName: function(file){
            file = this._getFile(file);
            return file ? file.name : null;
        }

        // 是否支持Html5上传
        ,_isSupportHtml5:function(){

            // window.FormData ,FF和谷歌下是Function;safari下是object
            //if(typeof(window.FormData) != "function" || typeof(window.XMLHttpRequest) != "function"){
            //if((!this.sendAsBinary && window.FormData == null) || window.XMLHttpRequest == null){
            if((!this.sendAsBinary && window.FormData == null) || window.XMLHttpRequest == null || new XMLHttpRequest().upload == null){
                this._isHtml5 = false;
                if($.trim(this.opt.swf) != ""){
                    this.opt.fileTypeDesc = this.opt.fileTypeExts;
                    this._useJqueryUpload();
                }else{
                    this.container.html(this._getHtml());
                    this.opt.initError && this.opt.initError.call(this,"没有SWF文件");
                }
                return false;
            }else{
                this._isHtml5 = true;
                return true;
            }
        }

        // 加载Jquery的uploadify插件
        ,_useJqueryUpload:function(){

            var me = this;
            seajs.use(ROCK.seaConfig.alias.uploadify, function(){
                me._JQUpload();
            })
        }

        // 调用Jquery的uploadify插件
        ,_JQUpload:function(){

            var me = this;
            var id = me.container.attr("id");
            if($.trim(id) == ""){
                me.container.attr("id", "lblUploadify_" + new Date().getTime())
            }

            me.container.uploadify(me.opt);
        }

    });

    var _noop = function(){};

    // 管理Ajax
    var _Ajax = function (opts, upOpt){

        // 继承父类属性
        ROCK.core.BaseClass.call(this);

        var opt = {

        }

        upOpt = upOpt || {};

        this.key = upOpt.key;
        this.that = upOpt.that;
        this.xhr = null;
        this._response = null;
        this._status = 0;

        // 重置配置
        $.extend(opt, opts);
        this.options = opt;

        this.init();

    }

    // 继承原型
    ROCK.core.BaseClass.extend(_Ajax);

    $.extend(_Ajax.prototype, {
        
        init: function() {
            this._status = 0;
            this._response = null;
        },

        trigger:function(type, arg1, arg2){

            var me = this;

            // 被取消过的不再做处理
            if(me.that && me.that.abortList && me.that.abortList[me.key] === true){
                me._upload._onUploadError(arg1, "M004", "abort", "用户取消");
                return;
            }

            var arg = arguments;
            var args = [];
            for(var n = 1; n < arg.length; n++){
                args.push(arg[n]);
            }

            switch(type){
                case "start" :
                    me.options.onUploadStart && me.options.onUploadStart.apply(me.that, args);
                    break;
                case "progress" :
                    me.options.onUploadProgress && me.options.onUploadProgress.apply(me.that, args);
                    break;
                case "success" :
                    me.that && me.that._onUploadSuccess && me.that._onUploadSuccess.apply(me.that, args);
                    // me.options.onUploadSuccess && me.options.onUploadSuccess.apply(me.that, args);
                    // me.options.onUploadComplete && me.options.onUploadComplete.apply(me.that, [arg1]);
                    break;
                case "complete" :
                    //me.that && me.that._complete && me.that._complete.apply(me.that, args);
                    //me.options.onUploadComplete.apply(me.that, args);
                    break;
                case "error" :
                    me.that && me.that._onUploadError && me.that._onUploadError.apply(me.that, args);

                    // me.options.onUploadError && me.options.onUploadError.apply(me.that, args);
                    // me.options.onUploadComplete && me.options.onUploadComplete.apply(me.that, [arg1]);
                    break;
                default:
                    break;
            }
        },

        // opt.filename,opt.extendData,opt.sendAsBinary,opt.blob
        send: function(opt) {
            var opts = this.options || {}
              , type = opts.type || "POST"
              , blob = opt.blob && opt.blob.getSource ? opt.blob.getSource() : opt.blob
              , xhr = this._initAjax(blob)
              , uploader = opt.uploader
              , ormData
              , binary
              , fr;

            if ( opt.sendAsBinary ) {
                var search = $.param( opt.extendData || {});

                if(search != "")
                    uploader += (/\?/.test( uploader ) ? '&' : '?') + search
                   
                binary = blob;
            } else {
                formData = new FormData();
                $.each( opt.extendData || {}, function( k, v ) {
                    formData.append( k, v );
                });
                formData.append( opts.fileObjName, blob, opts.filename || opt.filename || '' );
            }

            if ( opts.withCredentials && 'withCredentials' in xhr ) {
                xhr.open( opts.method || type, uploader, true );
                xhr.withCredentials = true;
            } else {
                xhr.open( opts.method || type, uploader );
            }

            this._setRequestHeader( xhr, opt.headers || opts.headers );

            if ( binary ) {
                // 强制设置成 content-type 为文件流。
                //xhr.overrideMimeType && xhr.overrideMimeType('application/octet-stream');

                // android直接发送blob会导致服务端接收到的是空文件。
                // bug详情。
                // https://code.google.com/p/android/issues/detail?id=39882
                // 所以先用fileReader读取出来再通过arraybuffer的方式发送。
                if ( opts.isAndroid ) {
                    fr = new FileReader();

                    fr.onload = function() {
                        xhr.send( this.result );
                        fr = fr.onload = null;
                    };

                    fr.readAsArrayBuffer( binary );
                } else {

                    xhr.send( binary );
                }
            } else {
                xhr.send( formData );
            }
        },

        getResponse: function() {
            return this._response;
        },

        getResponseAsJson: function() {
            return this._parseJson( this._response );
        },

        getStatus: function() {
            return this._status;
        },

        abort: function() {
            var xhr = this._xhr;

            if ( xhr ) {
                xhr.upload.onprogress = _noop;
                xhr.onreadystatechange = _noop;
                xhr.abort();

                this._xhr = xhr = null;
            }
        },

        destroy: function() {
            this.abort();
        },

        _initAjax: function(file) {
            var me = this,
                xhr = new XMLHttpRequest(),
                opts = this.options;

            if ( opts.withCredentials && !('withCredentials' in xhr) &&
                    typeof XDomainRequest !== 'undefined' ) {
                xhr = new XDomainRequest();
            }

            xhr.upload.onloadstart = function(e) {
                return me.trigger( 'start', file );
            }
            xhr.upload.onprogress = function( e ) {
                var percentage = 0;

                if ( e.lengthComputable ) {
                    percentage = e.loaded / e.total;
                }

                return me.trigger( 'progress', file, e.loaded, e.total );
            };
            xhr.upload.onerror = function(e) {
                return me.trigger( 'error', file, "M004", "http", xhr.response);
            }

            xhr.onabort = function(e) {
                return me.trigger( 'error', file, "M004", "abort", xhr.response);
            }

            // 下面只是上传的abort；如果上传结束而响应未结束，此时abort不用触发upload.abort的事件
            // xhr.upload.onabort = function(e) {
            //     return me.trigger( 'error', file, "M004", "abort", xhr.response);
            // }
            xhr.upload.onloadend = function(e) {
                xhr.upload.onloadend = _noop;
                return me.trigger( 'complete', file );
            }

            xhr.onreadystatechange = function() {

                if ( xhr.readyState !== 4 ) {
                    return;
                }

                xhr.upload.onprogress = _noop;
                xhr.onreadystatechange = _noop;
                me._xhr = null;
                me._status = xhr.status;

                if ( xhr.status >= 200 && xhr.status < 300 ) {
                    me._response = xhr.responseText;
                    return me.trigger('success', file, me.getResponseAsJson(), me.getResponse());
                } else if ( xhr.status >= 500 && xhr.status < 600 ) {
                    me._response = xhr.responseText;
                    return me.trigger( 'error', file, "M004", xhr.statusText, xhr.response );
                }

                return me.trigger( 'error', file, "M004", me._status ? 'http' : 'abort', xhr.response );
            };

            me._xhr = xhr;
            return xhr;
        },

        _setRequestHeader: function( xhr, headers ) {
            $.each( headers || {}, function( key, val ) {
                xhr.setRequestHeader( key, val );
            });
        },

        _parseJson: function( str ) {
            var json;

            try {
                json = JSON.parse( str );
            } catch ( ex ) {
                json = {};
            }

            return json;
        }
    });
    
    
    module.exports = Upload;
});
