define(ROCK.seaConfig.alias.send, ["validation", "go", "tips"], function(require, exports, module) {

	var Validation = require("validation");
	var Go = require("go");
	var Tips = require("tips");

    /** 表单验证
     *
     *  @author ywchen(陈余文)
     *  @constructs Send
     *  @date 2015.05.12
     *  @version 1.0.1
     *  @param {Object} opts				[*]参数
     *  @param {String} opts.container      [*]要验证提交的Form；opts.valiOpts.form和opts.form必须有一个存在值；当两者都存在值，但不一致时，以opts.valiOpts.form为准；
     *  @param {String} opts.url			[*]表单提交AJAX的URL；和opts.goOpts.url是一样的；
     *  @param {String} opts.query			opts.container容器中哪些可以做用提交数据项，例："input,textarea",这些标签得含有Name属性
     *  @param {String} opts.data			表单提交AJAX的额外数据；和opts.goOpts.data是一样的；
     *  @param {String} opts.sucShowMsgTime	成功后显示成功MSG的时间，前提是isAutoHideTip被设置为false;默认1500毫秒
     *  @param {boolean} opts.hasTips       是否有Tip显示,默认为true(显示)
     *  @param {boolean} opts.isAutoHideTip 是否在请求回来后自动隐藏tip，默认true(隐藏)
     *  @param {String} opts.successText	验证成功时显示的文字,在默认opts.validationOpts.success不被修改时有效
     *  @param {String} opts.valiOpts		Validation组件的参数，参见Validation组件说明;opts.valiOpts.*的属性都可以opts.*方式配置，如果有相同，以opts.valiOpts为优先
     *  @param {String} opts.goOpts			Go组件的参数，参见GO组件说明
     *  @param {String} opts.tipsOpts       Tips组件的参数，参见Tips组件说明
     *  @param {function} opts.getData      获取最终提交的数据
     *  @return {Send} Send的实例
     *  @example
            var frmSend = new Send({
				form:"#frmInfo"
				,"url":"/"
				,"successText":"验证成功了耶"
				,goOpts:{
					"success":function(){
						console.log("GO success");
					}
					,"fail":function(){
						console.log("GO fail");
					}
				}
			});
     */
    var Send = function(opts) {

        // 继承父类属性
        ROCK.core.BaseClass.call(this);

        var me = this;
        var opt = {
        	isAutoHideTip:true
            ,hasTips:true
            ,query:"input,textarea,select"
            ,sucShowMsgTime:1500
        }

        // Validation组件的参数默认值配置
        var valiOpts = {
        	form:""
			,success:function(type){
				$(this).siblings(".ui-tiptext").not(".ui-tiptext-message").removeClass("ui-tiptext-error").addClass("ui-tiptext-success").html(opt.successText || "验证成功")
			}
			,fail:function(type, errData){
				$(this).siblings(".ui-tiptext").not(".ui-tiptext-message").removeClass("ui-tiptext-success").addClass("ui-tiptext-error").html(errData.msg || "验证失败")
			}
			,submit:function(){
                me._ajaxSubmit();
			}
        }

        // Go组件的参数默认值配置
        var goOpts = {
			repeatError:function(){
			}
			,beforeSend:function(){
                me.showTips(opt.tipsOpts.content || "处理中...");
			}
        }

        // Tips组件的参数默认值配置
        var tipsOpts = {
            hasCloseBtn:false
            ,width:"auto"
        }

        $.extend(opt, opts);							// 重置配置
        opt.valiOpts = $.extend(valiOpts, opt.valiOpts)	// Validation组件的参数
        opt.goOpts = $.extend(goOpts, opt.goOpts)		// Go组件的参数
        opt.tipsOpts = $.extend(tipsOpts, opt.tipsOpts) // Tips组件的参数

        // 参数使用扩展
        opt.valiOpts.form = opt.valiOpts.form || opt.form || opt.container;
        opt.valiOpts.events = opt.valiOpts.events || opt.events;
        opt.valiOpts.rule = opt.valiOpts.rule || opt.rule;
        opt.valiOpts.userCustomData = opt.valiOpts.userCustomData || opt.userCustomData;
        opt.valiOpts.defaultMsg = opt.valiOpts.defaultMsg || opt.defaultMsg;
        opt.valiOpts.propertys = opt.valiOpts.propertys || opt.propertys;
        opt.valiOpts.beforeValidata = opt.valiOpts.beforeValidata || opt.beforeValidata;
        opt.valiOpts.messages = opt.valiOpts.messages || opt.messages;
        opt.valiOpts.beforeValidata = opt.valiOpts.beforeValidata || opt.beforeValidata;
        opt.valiOpts.beforeSubmit = opt.valiOpts.beforeSubmit || opt.beforeSubmit;
        opt.valiOpts.submit = opt.valiOpts.submit || opt.submit;
        opt.goOpts.url = opt.goOpts.url || opt.url || $(opt.valiOpts.form).attr("action");
        opt.goOpts.lock = opt.goOpts.lock || opt.lock;
        opt.goOpts.data = opt.goOpts.data || opt.data;
        opt.goOpts.type = opt.goOpts.type || opt.type;
        opt.goOpts.success = opt.goOpts.success || opt.success;
        opt.goOpts.fail = opt.goOpts.fail || opt.fail;
        opt.goOpts.repeatError = opt.goOpts.repeatError || opt.repeatError;
        opt.tipsOpts.target = opt.tipsOpts.target || opt.target || opt.lock || opt.goOpts.lock;
        opt.tipsOpts.content = $.trim(opt.tipsOpts.content) != "" ? opt.tipsOpts.content : (opt.goOpts.type.toUpperCase != "POST" ? "数据获取中..." : "数据提交处理中...")
        opt.getData = typeof(opt.getData) == "function" ? opt.getData : function(t){return t;};

        this.userData = opt.goOpts.data;
        this.opt = opt;
        this.validate = null;							// 验证类实例
        this.go = null;									// AJAX提交实例
        this.tips = null;                               // Tips提示实例

		this._init();
    }

    // 继承原型
    ROCK.core.BaseClass.extend(Send);

    $.extend(Send.prototype, {
    	_init:function(){
    		this.validate = new Validation(this.opt.valiOpts);
    	}

        /** 设置Tip为显示状态
         *
         *  @roclass Send
         *  @roname showTips
         *  @return  {Send} Send的实例
         *  @example
                // opt.hasTips == true时才起作用
                var send = new Send({});
                send.showTips();
         */
        ,showTips:function(content){
            if(!this.opt.hasTips) return this;
            this.tips = this.tips || new Tips(this.opt.tipsOpts);
            if(content != null){
                this.tips.show().setContent(content);
            }
            return this;
        }

        /** 设置Tip为隐藏状态
         *
         *  @roclass Send
         *  @roname hideTips
         *  @return  {Send} Send的实例
         *  @example
                // opt.hasTips == true时才起作用
                var send = new Send({});
                send.hideTips();
         */
        ,hideTips:function(){
            this.tips && this.tips.hide();
        }

        /** 重置Tips位置为最佳显示位置；也可设置Tips的宽度
         *
         *  @roclass Send
         *  @roname setTipStyle
         *  @param {Number} width   Tips的宽度,可选参数
         *  @return  {Send} Send的实例
         *  @example
                // opt.hasTips == true时才起作用
                var send = new Send({});
                send.setTipStyle(200);
         */
        ,setTipStyle:function(width){
            this.tips && this.tips.show(width);
        }

        /** 重置Tips位置为最佳显示位置；也可设置Tips的宽度
         *
         *  @roclass Send
         *  @roname setTipContent
         *  @param {String} content   重置Tips的内容
         *  @return  {Send} Send的实例
         *  @example
                // opt.hasTips == true时才起作用
                var send = new Send({});
                send.setTipContent("等待中！");
         */
        ,setTipContent:function(content){
            this.tips && this.tips.show().setContent(content);
        }
        ,_serialize:function(){
            var me = this;
            var opt = me.opt;
            var element = $(opt.valiOpts.form);
            var dom = element.get(0);
            if(dom == null) return "";

            // 屏蔽掉，因为有提示的时候会把提示信息提交
            //if($.trim(dom.nodeName).toUpperCase() == "FORM"){
            //    return element.serialize();
            //}

            var formData = [];
            var queryElements = element.find(opt.query);
            $.each(queryElements, function(){
                var name = $.trim($(this).attr("name"));
                if(name == "") return true;
                var nameFilter = '[name="' + name + '"]';
                var dataElemts = queryElements.filter(nameFilter);
                var checkArr = [];
                // --- debug --- 未验证，项目忙，有时间的时候再验证
                if(dataElemts.length > 0 && (dataElemts.eq(0).attr("type") == "checkbox" || dataElemts.eq(0).attr("type") == "radio")){
                    $.each(dataElemts.filter(":checked"),function(){
                        checkArr.push(me._getValue(this));
                    });
                    formData.push(name + "=" + me._encode(checkArr.join(",")));
                    queryElements = queryElements.not(nameFilter);//bug 更新的queryElements不会被each引用
                }else{
                    //如果是checkbox或radio则跳出此分支 update by huangzhi @ 20150916
                    var ele = $(this);
                    var isBox = function(){
                        return ele.attr('type')=='checkbox'||ele.attr('type')=='radio';
                    };
                    if(isBox())return true;
                    formData.push(name + "=" + me._encode(me._getValue(this)));
                }
            })
            return formData.join("&");
        }
        ,_getValue:function(dom){
            dom = $(dom);
            // 如何有扩展value，优先使用；value的扩展主要做的事是对提示内容的过滤
            if(typeof(dom.value) == "function"){
                return dom.value();
            }else{
                return dom.val();
            }
        }
        ,_encode:function(value){
            return encodeURIComponent(value);
        }
        ,_getData:function(){

            var me = this;
            var opt = me.opt;
			var data = me.userData;
			var formData = me._serialize();
			if(data != null && typeof(data) != "string"){
				data = $.param(data);
			}
			if($.trim(data) != "" && $.trim(formData) != ""){
				data = formData + "&" + data;
			}else if($.trim(formData) != ""){
				data = formData;
			}
            return data;
        }

        /** 表单验证成功后，发起AJAX请求
         *
         *  @roclass Send
         *  @roname _ajaxSubmit
         *  @return  {Send} Send的实例
         *  @example
                var send = new Send({});
                send._ajaxSubmit();
         */
        ,_ajaxSubmit:function(){
            var me = this;
            var opt = me.opt;
            var complete = opt.goOpts.complete || function(){};
            opt.goOpts.data = opt.getData(me._getData());

            opt.goOpts.complete = function(){
                me.setTipContent("处理完成！");
                !opt.isAutoHideTip && setTimeout(function(){
                    me.hideTips();
                }, opt.sucShowMsgTime);
                complete.apply(me.go, arguments);
            }

			//if(!this.go), --- debug --- 当go被实例后，多次发起时，使用之前的实例，未实现
			me.go = new Go(opt.goOpts);
            return this;
        }
    });

    module.exports = Send;
})
