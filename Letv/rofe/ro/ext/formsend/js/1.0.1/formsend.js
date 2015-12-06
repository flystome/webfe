define(ROCK.seaConfig.alias.formsend, ["validation", "go", "tips"], function(require, exports, module) {
	
	var Validation = require("validation");
	var Go = require("go");

    /** 表单验证
     *
     *  @author ywchen(陈余文)
     *  @constructs Formsend
     *  @date 2015.05.03
     *  @version 1.0.1
     *  @param {Object} opts				[*]参数
     *  @param {String} opts.form			[*]要验证提交的Form；opts.valiOpts.form和opts.form必须有一个存在值；当两者都存在值，但不一致时，以opts.valiOpts.form为准；
     *  @param {String} opts.url			[*]表单提交AJAX的URL；和opts.goOpts.url是一样的；
     *  @param {String} opts.data			表单提交AJAX的额外数据；和opts.goOpts.data是一样的；
     *  @param {String} opts.successText	验证成功时显示的文字,在默认opts.validationOpts.success不被修改时有效
     *  @param {String} opts.valiOpts		Validation组件的参数，参见Validation组件说明;opts.valiOpts.*的属性都可以opts.*方式配置，如果有相同，以opts.valiOpts为优先
     *  @param {String} opts.goOpts			Go组件的参数，参见GO组件说明
     *  @return {Formsend} Formsend的实例
     *  @example
            var frmSend = new Formsend({
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
    var Formsend = function(opts) {
	
        // 继承父类属性
        ROCK.core.BaseClass.call(this);
        
        var me = this;
        var opt = {
        	
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
				
				var data = me.userData;
				var formData = $(opt.valiOpts.form).serialize();
				if(data != null && typeof(data) != "string"){
					data = $.param(data);
				}
				if($.trim(data) != "" && $.trim(formData) != ""){
					data = formData + "&" + data;
				}else if($.trim(formData) != ""){
					data = formData;
				}
				opt.goOpts.data = data;
				
				//if(!this.go), --- debug --- 当go被实例后，多次发起时，使用之前的实例，未实现
				this.go = new Go(opt.goOpts);
			}
        }
        
        // Go组件的参数默认值配置
        var goOpts = {
        	
        }
		
        $.extend(opt, opts);							// 重置配置
        opt.valiOpts = $.extend(valiOpts, opt.valiOpts)	// Validation组件的参数
        opt.goOpts = $.extend(goOpts, opt.goOpts)		// Go组件的参数
        
        // 参数使用扩展
        opt.valiOpts.form = opt.valiOpts.form || opt.form;
        opt.valiOpts.events = opt.valiOpts.events || opt.events;
        opt.valiOpts.rule = opt.valiOpts.rule || opt.rule;
        opt.valiOpts.userCustomData = opt.valiOpts.userCustomData || opt.userCustomData;
        opt.valiOpts.defaultMsg = opt.valiOpts.defaultMsg || opt.defaultMsg;
        opt.valiOpts.propertys = opt.valiOpts.propertys || opt.propertys;
        opt.valiOpts.beforeValidata = opt.valiOpts.beforeValidata || opt.beforeValidata;
        opt.valiOpts.success = opt.valiOpts.success || opt.success;
        opt.valiOpts.fail = opt.valiOpts.fail || opt.fail;
        opt.valiOpts.messages = opt.valiOpts.messages || opt.messages;
        opt.valiOpts.beforeValidata = opt.valiOpts.beforeValidata || opt.beforeValidata;
        opt.valiOpts.beforeSubmit = opt.valiOpts.beforeSubmit || opt.beforeSubmit;
        opt.valiOpts.submit = opt.valiOpts.submit || opt.submit;
        opt.goOpts.url = opt.goOpts.url || opt.url || $(opt.valiOpts.form).attr("action");
        opt.goOpts.lock = opt.goOpts.lock || opt.lock;
        opt.goOpts.data = opt.goOpts.data || opt.data;
        
        this.userData = opt.goOpts.data;
        this.opt = opt;
        this.validate = null;							// 验证类实例
        this.go = null;									// AJAX提交类
        
		this._init();
    }

    // 继承原型
    ROCK.core.BaseClass.extend(Formsend);

    $.extend(Formsend.prototype, {
    	_init:function(){
    		this.validate = new Validation(this.opt.valiOpts);
    	}
    });

    module.exports = Formsend;
})
