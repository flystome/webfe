;
define(ROCK.seaConfig.alias.uploader,[ROCK.seaConfig.alias.upload,ROCK.seaConfig.alias.go], function(require, exports, module) {

    var Upload = require(ROCK.seaConfig.alias.upload);
    var Go = require(ROCK.seaConfig.alias.go);

    /** 对上传组件upload的封装;
     *
     *  @author ywchen(陈余文)
     *  @constructs Uploader
     *  @date       2015.08.10
     *  @version    1.0.1
     *  @param      {Object}        opt                     [*]参数
     *  @param      {String}        opt.token               [*]上传令牌
     *  @param      {String}        opt.bucket              [*]上传的目录，由后端人员提供名字；和opt.getUploadURL参数互斥
     *  @param      {Function}      opt.getUploadURL        [*]获取上传地址的接口；和opt.bucket参数互斥
     *  @param      {Function}      opt.setHeader           当次上传的头信息设置，参数为当次要上传的file文件对象
     *  @param      {Function}      opt.upOpt               上传Upload对象的参数；参考Upload说明；
     *  @param      {Function}      opt.upURLOpt            获取上传地址参数（上传文件前要获取上传地址；）Go的配置;通常不需要配置
     *  @return     {Uploader}      返回Uploader的实例
     *  @example

            html:
            <div id="uploadbar">
                <!--
                <div class="ro-upload-box">
                    <input type="file" style="display:none">
                    <span class="ro-upload-btn">上 传</span>
                </div>
                -->
            </div>
            <div class="btn">提 交</div>
            <div id="preview"></div>

            JS:
            var uploader = new Uploader({
                token:"10298ccca5AzuHm1njfbJ2khoGMkFuh73Nkm1ypbLQxeupoWWgJzg0Qm3NwU3iQDiXz2zk7Yh"
                ,uploadSuccess:function(){
                    log("uploadSuccess...")
                }
                ,getUploadURL:function(file){
                    return "https://s3proxy.scloud.letv.com/api/v1/url?bucket=contacticon&type=" +  file.type
                }
                ,upOpt: {
                    "container": $("#uploadbar")
                    ,"auto":false
                    ,"fileSizeLimit": "10M"
                    ,"fileTypeDesc": "image/jpeg,image/jpg,image/png,image/bmp"
                    ,"buttonText": "选择图片"
                    ,"onSelectError": function(file, errorCode, errorMsg) {
                        if (errorCode == "M002") {
                            log("请上传10M以内的图片")
                        } else {
                            log(errorMsg)
                        }
                    }
                    ,onUploadStart:function(file){

                        $('[data-index="' + file.index + '"] label').html('上传中...');
                        //this.abort(file.index);
                    }
                    ,"onUploadError": function(file, errorCode, errorMsg) {
                        log("onUploadError", arguments);
                        $('[data-index="' + file.index + '"]').html('【上传失败】：' + file.name);
                    }
                    ,"onUploadSuccess":function(file, data, response){
                        $('[data-index="' + file.index + '"]').html('【图片加载中...】：' + file.name);
                        var cnt = 5;
                        var load = function(){
                            cnt--;
                            if(cnt == 0){
                                $('[data-index="' + file.index + '"]').html('【图片加载失败...】：' + file.name);
                                return;
                            }
                            var img = new Image();
                            img.onload = function(){
                                $('[data-index="' + file.index + '"]').html('<img src="' + file.downloadPath +'">');
                                $('[data-index="' + file.index + '"] img').fadeIn();
                            }
                            img.onerror = function(){
                                log("Error")
                                load();
                            }
                            img.src = file.downloadPath;
                        }
                        load();
                        
                    }
                    ,initError:function(){
                        log("initError", arguments);
                    }
                    ,onSelect:function(file){

                        var me = this;

                        var tpl = '<div class="load" data-index="{index}">\
                            <label>【等待上传...】</label>\
                            <span data-key="{index}">点击取消</span>\
                            {name}\
                        </div>';

                        var dom = $(tpl.replace(/{(\w+)}/g, function(a, b){

                            return file[b];
                        }));

                        $("#preview").append(dom);

                        dom.find("span").bind("click", function(){
                            var key = $(this).attr("data-key");
                            me.abort(key);
                            dom.fadeOut(function(){
                                $(this).remove();
                            });
                        });

                    }
                }
                // GO 的配置
                ,upURLOpt: {
                    
                }
            });
            
            $(".btn").click(function(){
                uploader.getUpload().send();
            });

     */
    var Uploader = function(opts){

        // 继承父类属性
        ROCK.core.BaseClass.call(this);

        var me = this;

        // 参数的默认值配置
        var opt = {
            token:null                              // 令牌
            ,bucket:"contacticon"                    // 上传的目录
            ,setHeader:function(file){              // 当次上传的头信息设置

            }
            ,upOpt:{                                // 上传的默认扩展

            }
            ,upURLOpt:{                             // 请求的默认扩展
            }
            ,getUploadURL:function(file){
                return "https://s3proxy.scloud.letv.com/api/v1/url?bucket=" + opt.bucket + "&type=" +  file.type
            }
        }

        // 重置配置
        $.extend(opt, opts);

        // 参数
        this.opt = opt;

        // 上传的默认扩展
        me._extendUpOpt();

        // 上传组件
        this._upload = null;

        // 控件初始值化
        me._init();

    };

    // 继承原型
    ROCK.core.BaseClass.extend(Uploader);

    $.extend(Uploader.prototype, {

        // 初始化
        _init:function(){

            var me = this;
            var opt = me.opt;

            me._upload = new Upload(opt.upOpt);
        }

        /** 获取上传Upload对象(和Uploader不是同一个对象)
         *
         *  @roclass Uploader
         *  @roname getUpload
         *  @return  {Upload} Upload的实例
         *  @example
                var uploader = new Uploader({...});
                uploader.getUpload();
         */
        ,getUpload:function(){
            var me = this;
            return me._upload;
        }

        // 当次上传的头信息设置
        ,_setHeader:function(file){
            var me = this;
            return me.opt.setHeader ? me.opt.setHeader(file) : null;
        }

        // 扩展upOpt上传参数
        ,_extendUpOpt:function(){

            var me = this;
            this.opt.upOpt = $.extend({
                "onGetAsyncUploadURL":function(file, callback){

                    var xhr = null;
                    // 获取地址
                    xhr = me._getUploadUrl(file, function(data) {

                        file.downloadPath = data.download_url;
                        // 接口需要的头信息
                        var headers = me._setHeader(file);
                        
                        // 设置默认头信息
                        if(headers == null){
                            headers = {
                                "Content-Type": file.type,
                                "x-amz-acl": "public-read"
                            };
                        }
                        
                        // 调用上传
                        callback(data.upload_url, headers);

                    });

                    if(xhr){
                        return xhr.ajax;
                    }else{
                        return null;
                    }
                }
                ,"sendAsBinary":true
                ,"method":"put"
            }, me.opt.upOpt);
        }

        // 获取上传地址
        ,_getUploadUrl:function(file, callback){

            var me = this;
            var opt = me.opt || {};

            var goOpt = $.extend({
                url: this.opt.getUploadURL(file),
                type: 'get',
                headers: {
                    "X-Requested-With": true,
                    "token": me._getToken(),
                    withcredentials: true
                },
                crossDomain: true,
                success: function(data) {

                    data = data || {};
                    if(data.errno == "10000"){
                        callback && callback(data.data || {});
                    }else{
                        me._upload._onUploadError(file, "M004", "http", "获取上传地址失败");
                    }
                },
                beforeSend: function() {
                    // imgElement.hide();
                },
                fail: function(data) {
                    me._upload._onUploadError(file, "M004", "abort", "获取上传地址失败");
                    //me.opt.upOpt.onUploadError && me.opt.upOpt.onUploadError();
                    //me.opt.upURLOpt.getURLFail(file);
                },
                complete: function() {},
                dataType: 'json'
            }, this.opt.upURLOpt)

            return new Go(goOpt);
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

            // if(tmpToken == null || $.trim(tmpToken) == ""){
            //     alert("参数opt.token不能为空");
            // }

            return tmpToken;
        }

    });
    
    
    module.exports = Uploader;
});
