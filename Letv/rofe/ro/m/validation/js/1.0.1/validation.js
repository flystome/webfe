;
define(ROCK.seaConfig.alias.validation, function(require, exports, module) {

    /** 表单验证
     *
     *  @author ywchen(陈余文)
     *  @constructs Validation
     *  @date 2015.05.03
     *  @version 1.0.1
     *  @param {Object} opts						[*]参数
     *  @param {String|HTMLElement} opts.form		[*]要验证提交的Form
     *  @param {String} opts.events					被验证的DOM本身能被哪些事件触发，默认没有；如opts.events="focus blur"
     *  @param {String|RegExp|Function} opts.rule	规则注入
     *  @param {Object} opts.messages				全局消息配置
     *  @param {Object} opts.userCustomData			用户定义数据配置
     *  @param {String} opts.defaultMsg				缺省错误消息配置
     *  @param {String} opts.propertys				自定义属性配置，规定在使用本组件时的HTML自定义属性
     *  @param {String} opts.propertys.prefix		自定义属性的前缀
     *  @param {String} opts.propertys.validata		自定义属性 - 验证规则集名称
     *  @param {String} opts.propertys.user			自定义属性 - 在参数userCustomData里对应的key值
     *  @param {Function} opts.beforeValidata		返回值是 ===false时，程序执行中止；不进入验证，和提交阶段；其它值是反之,此时是否进入提交看验证是否通过，通过时可提交
     *  @param {Function} opts.afterValidata		里面可以通过 this.isSuccess()来判断是否成功，参数为是否成功
     *  @param {Function} opts.success				表单验证单控件成功时的回调
     *  @param {Function} opts.fail					验证成功时显示的文字
     *  @param {Function} opts.beforeSubmit			返回值!==true时，表单不会刷新方式提交；如果返回值是true,会影响异步回调的submit函数,默认false
     *  @param {Function} opts.submit				验证成功允许提交后的回调
     *  @return {Validation} 						Validation的实例
     *  @example
			var validate = new Validation({
				form:"#frmInfo"
				,"defaultMsg":"出错了"
				,rule:{
					number:"\/^[0-9]+$\/"
					,require:function(){
						var value = $(this).val();
						if($.trim(value) == ""){
							return false;
						}else{
							return true;
						}
					}
					,lleng:function(){
						return true
					}
				}
				,events:"focus blur change"
				,success:function(type){
					log("Global success",type,this)
				}
				,fail:function(type, errData){
					log("Global ------",type,errData,this.value)
				}
				,messages:{
					"AtoB":"输入字的范围是最小{A}最大{B}"
					,"number":"仅能输入数字require"
					,"require":"不能为空"
				}
				,userCustomData:{
					"ccc":{
						"validata":"number  require"
						,"number":"仅能输入数字"
						,"require":"不能为空"

						//type:blur,focus,submit哪种事件引发的成功
						,"success":function(type){
							log("Single success",type,this)
						}
						,"fail":function(type, errData){
							log("Single ======",type,errData,this.value)
						}
					}

				}
				,beforeValidata:function(){
					console.log("beforeValidata", this);
				}
				,submit:function(){
					log(this._form.serialize())
					log("submit",this);
				}
			});
		});
     */
    var Validation = function(opts) {

        // 继承父类属性
        ROCK.core.BaseClass.call(this);

        var me = this;
		
        // 参数的默认值配置
        var opt = {
        	form:null								// 要验证的Form
        	,events:""								// 被验证的DOM本身能被哪些事件触发，默认没有；
        	,rule:{}								// 规则注入
        	,messages:{}
        	,userCustomData:{}						// 用户自定信息
        	,defaultMsg:null						// 默认错误信息
        	,propertys:{							// 自定义属性
        		"prefix":"ro-"						// 自定义属性的前缀
        		,"validata":"validata"				// 自定义属性 - 验证规则集名称
        		,"user":"custom"					// 自定义属性 - 在参数userCustomData里对应的key值
        	}
        	,beforeValidata:function(){}			// 返回值是 ===false时，程序执行中止；不进入验证，和提交阶段；其它值是反之,此时是否进入提交看验证是否通过，通过时可提交
        	,afterValidata:function(){}
        	,fail:function(){}						// 单项验证失败时，回调；仅做提交的
        	,success:function(){}					// 单项验证成功时，回调；仅做提交的
        	,beforeSubmit:function(){}
        	,submit:function(){}
        }
		
        $.extend(opt, opts);						// 重置配置

		this.rule = {								// 配置规则
			"number":/^\d+$/
			,"mobile":/^((\(\d{2,3}\))|(\d{3}\-))?1[3578]\d{9}$/
			,"phone":/^((\(\d{2,3}\))|(\d{3}\-))?(\(0\d{2,3}\)|0\d{2,3}-)?[1-9]\d{6,7}(\-\d{1,4})?$/
			,"email":/^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/
			,"qq":/^[1-9][0-9]{4,}$/
			,"url":/^([a-zA-Z]+:\/\/)?[^\s\.]+\.[^\s]*$/
			,"date":/^(\d{1,4})(-|\/)(\d{1,2})\2(\d{1,2})$/
			,"chinese":/^[\u4E00-\u9FA5]+$/
			,"english":/^[a-zA-Z\s]+$/
			,"require":function(){
				var value = me.val(this);
				// --- debug --- 未考虑有提示的情况
				if($.trim(value) == ""){
					return false;
				}else{
					return true;
				}
			}
			// 字长度
			,"length":function(min, max){
				var value = me.val(this);
				var size = value.length;
				// --- debug --- 未考虑有提示的情况
				if(min <= size && max >= size){
					return true;
				}else{
					return false;
				}
			}
			// 字节长度;min:最小范围；max最大范围；length一个多字节算占几个字符（如一个汉字当成2个字符等）
			,"blength":function(min, max, length){
				var n = length || 2;
			    var s = '';
			    for(var i = 0; i < n; i++){
			        s += 'x';
			    }

				var value = me.val(this);
			    var size = value.replace(/[^\x00-\xff]/g, s).length;

				// --- debug --- 未考虑有提示的情况
				if(min <= size && max >= size){
					return true;
				}else{
					return false;
				}
			}
			/* 
			// 自定义验证
			,"custom":function(){
				
			}
			,"ajax":function(){
				
			}
			*/
		}
		
		opt.message = opt.message || {};			// 设置默认值
        this.opt = opt;								// 参数
        this._form = null;							// 表单form
        this._errorInfo = null;						// 错误信息
        this._okElements = null;					// 被验证为OK的DOM
        this.isStop									// 程序执行过程中是否有被用户强制中止
		
		this._init();
    }

    // 继承原型
    ROCK.core.BaseClass.extend(Validation);

    $.extend(Validation.prototype, {
    	_init:function(){
    		var opt = this.opt || {};
    		$.extend(this.rule, opt.rule || {});	// 规则注入
    		this._form = $(opt.form);				// 获取Form操作Dom
    		this._setPropertyInfoToDom();			// 将用户JS中定义的信息注入到相应Dom中
    		this._bind();							// 绑定事件
    	}
    	
        /** 表单提交
         *
         *  @roclass Validation
         *  @roname submit
         *  @return 无返回值
         *  @example
                var validate = new Validation();
                validate.submit();
         */
		,submit:function(){
			var opt = this.opt || {}
			  , canSubmit							// 是否验证已经成功
			  , isStop								// 验证被要求中止
			  , rev = null							// 当前函数返回值
			
			isStop = opt.beforeValidata == null ? true : opt.beforeValidata.call(this);				// 验证前回调，返回值是 ===false时，程序执行中止；不进入验证
			
			if(isStop === false){
				this.isStop = isStop;				// 被用户强制程序中止标识
				return false;
			}
			
			this._checkAll();						// 开始验证
			canSubmit = this.isSuccess();			// 获取是否验证已经成功
			isStop = opt.afterValidata == null ? true : opt.afterValidata.call(this, canSubmit);	// 验证结束，返回值是 ===false时，程序执行中止；验证失败
			if(isStop === false){
				this.isStop = isStop;				// 被用户强制程序中止标识
				return false;
			}
			//opt.afterValidata && opt.afterValidata.call(this, canSubmit)	// 验证结束
			
			// 验证未通过，处理中止
			if(canSubmit === false)return false;
			// 调用提交前回调
			rev = opt.beforeSubmit && opt.beforeSubmit.call(this);
			
			opt.submit && opt.submit.call(this);
			// 根据提交前回调的返回值确定是否直接提交Form表单
			rev = rev !== true ? false : true;
			return rev;
		}
		
        /** 在Submit提交时，判断过程是否全验证通过，如果全通过，返回值是TRUE，反之
         *
         *  @roclass Validation
         *  @roname isSuccess
         *  @return {Boolean}		是否验证全通过
         *  @example
                var validate = new Validation();
                validate.isSuccess();
         */
		,isSuccess:function(){
			return this._errorInfo == null || this._errorInfo.length == 0;
		}
		
        /** 添加错误信息
         *
         *  @roclass Validation
         *  @roname _addErrorInfo
         *  @param {Object} errorInfo    规定格式的错误信息
         *  @return 无返回值
         *  @example
                var validate = new Validation();
                validate._addErrorInfo({
	            	"dom":dom
	            	,"type":"number"
	            	,"msg":"不是数字"
	            });
         */
		,_addErrorInfo: function(errorInfo){
			this._errorInfo = this._errorInfo || [];
			this._errorInfo.push(errorInfo);
		}
		
        /** 获取错误信息列表
         *  只有发生submit事件验证中才正常获取
         *
         *  @roclass Validation
         *  @roname getErrorInfo
         *  @return {Array} 错误信息列表
         *  @example
                var validate = new Validation();
                validate.getErrorInfo();
         */
		,getErrorInfo: function(){
			return this._errorInfo;
		}
		
        /** 将用户将自定义的属性设置到HTML页面上 --- debug --- 可以优化这块
         *
         *  @roclass Validation
         *  @roname _setPropertyInfoToDom
         *  @param {HTMLElement}	dom    			拥有用户自定义DOM的元素
         *  @return {String}		自定义属性的值
         *  @example
                var validate = new Validation();
                validate._setPropertyInfoToDom(Dom);
         */
		,_setPropertyInfoToDom:function(dom){
			var me = this;
			var opt = this.opt || {};
			
			var userCustomData = opt.userCustomData || {};
			$.each(userCustomData, function(key, item){
				$.each(me._getUserDom(key), function(){
					var dom = this;
					$.each(item, function(key2, value){
						if(typeof(value) == "object" || typeof(value) == "function") return true;
						$(dom).attr(me._getProperty(key2), value);
					});
				});
			});
			return this;
		}
		
        /** 获取当前Form中拥有自定义属性的所有Dom列表
         *
         *  @roclass Validation
         *  @roname _getUserDom
         *  @param {String} key    用户定义的属性值
         *  @return {String} 完整属性值
         *  @example
                var validate = new Validation();
                validate._getProperty("user");
         */
		,_getUserDom: function(key){
			return this._form.find('[' + this._getProperty(this.opt.propertys.user) + '="' + key + '"]');
		}
		
        /** 获取自定义属性的值
         *
         *  @roclass Validation
         *  @roname _getUserValue
         *  @param {HTMLElement}	dom    			dom元素
         *  @return {String}		自定义属性的值
         *  @example
                var validate = new Validation();
                validate._getUserValue(Dom);
         */
		,_getUserValue:function(dom){
			return $(dom).attr(this._getProperty(this.opt.propertys.user)) || "";
		}
		
        /** 获取自定义属性
         *
         *  @roclass Validation
         *  @roname _getProperty
         *  @param {String} property    属性的后缀
         *  @return {String} 完整属性值
         *  @example
                var validate = new Validation();
                validate._getProperty("user");
         */
		,_getProperty:function(property){
			return $.trim(this.opt.propertys.prefix) + property;
		}
		
        /** 一次性验证所有项目
         *
         *  @roclass Validation
         *  @roname _checkAll
         *  @param {Boolean} isNotTrigger   强制调用时不发生(成功|失败的)回调（目前外部调用时才用到，le_cloud-查找设备中用到）
         *  @return {validation} Validation的实例
         *  @example
                var validate = new Validation();
                validate._checkAll();
         */
		,_checkAll:function(isNotTrigger){
			
			var me = this
			  , opt = me.opt 
			  , vdElements = me._getValidataDoms();
			
			// 重置错误信息
			me._errorInfo = null;
			// 重置OK的对象
			me._okElements = [];
			
			if(vdElements.length == 0)return true;
			
			$.each(vdElements,function(){
				me._trigger(isNotTrigger !== true ? "submit" : "validate", this);
			});
			
			return this;
		}
		
        /** 获取错误信息
         *
         *  @roclass Validation
         *  @roname _getMsg
         *  @param {HTMLElement} dom    信息所在的DOM
         *  @param {HTMLElement} vali   验证规则名称
         *  @return {validation} Validation的实例
         *  @example
                var validate = new Validation();
                validate._checkItem($(".dom"));
         */
		,_getMsg: function(dom, vali){
			var opt = this.opt;
			var message = opt.message || {};
			return $(dom).attr(this._getProperty(vali)) || message[vali] || opt.defaultMsg || ""
		}
		
        /** 验证单个项目
         *
         *  @roclass Validation
         *  @roname _checkItem
         *  @param {HTMLElement} dom    被验证的DOM
         *  @return {validation} Validation的实例
         *  @example
                var validate = new Validation();
                validate._checkItem($(".dom"));
         */
		,_checkItem: function(dom){
			var isOk = this._validataRule(dom);
			var rev = null;
			if(isOk !== true){
				rev = {
	            	"dom":dom
	            	,"type": this._getProperty(isOk)
	            	,"msg":this._getMsg(dom, isOk)
	            };
	            // 收集错误信息
				this._addErrorInfo(rev);
	            return rev;
			}else{
				this._okElements = this._okElements || [];
				this._okElements.push(dom);
				return true;
			}
			
		}
		
        /** 获取所有要被验证的Dom
         *
         *  @roclass Validation
         *  @roname _getValidataDoms
         *  @return {HTMLElements} 要被验证的Dom列表
         *  @example
                var validate = new validation();
                var elements = validate._getValidataDoms();
         */
		,_getValidataDoms: function(){
			return this._form.find(this._getValidataProperty());
		}
		
        /** 获取标识为验证的DOM属性
         *
         *  @roclass Validation
         *  @roname _getValidataProperty
         *  @return {HTMLElements} 要被验证的Dom列表
         *  @example
                var validate = new validation();
                var elements = validate._getValidataDoms();
         */
		,_getValidataProperty:function(){
			return '[' + this._getProperty(this.opt.propertys.validata) + ']'
		}
		
        /** 对规则验证
         *
         *  @roclass Validation
         *  @roname _validataRule
         *  @return {String} 返回验证失败的规则名称
         *  @example
                var validate = new validation();
                var elements = validate._validataRule($(".dom"));
         */
		,_validataRule:function(dom){
			var me = this;
			var element = $(dom);
			// ---debug ---  默认值剔除
			var value = $.trim(element.val());
			var vdString = $.trim(element.attr(this._getProperty(this.opt.propertys.validata)));
			if(vdString == ""){
				return true;
			}
			var isOk = true;
			var vds = vdString.replace(/\s+/," ").split(" ");
			/* --- deubg --- 暂不处理radio、checkbox等
			// radio & checkbox暂仅判断是否有选中
			if(vds.length > 0 && element.get(0) && $.trim(element.get(0).nodeName).toLowerCase() == "input" && (element.attr("type") == "radio" || element.attr("type") == "checkbox") ){
				if($('[name="' + element.attr("name") + '"]:checked').length > 0 || element.filter(":checked").length > 0) {
					return true;
				}else{
					return "gt0";
				}
			}
			*/

			$.each(vds,function(m, itm){
				var item = null;
				var agru = null;
				var items = itm.match(/^([a-z]+)\[(.+)\]$/i);
				if(items){
					item = items[1];
					agru = items[2];
				}else{
					item = itm;
				}
				
				var rule = me.rule[item];
				
				// 正规的情况
				var match = function(reg){
					var cm = value.match(reg);
					if(!!cm){
					    return true;
					}else{
						isOk = item;
						return false;
					}
				}
				
				if(typeof(rule) == "string"){
					try{
						eval("rule=" + rule);
					}catch(e){}
					return match(RegExp(rule));
				}else if(rule instanceof RegExp){
					return match(rule);
				}else if(typeof(rule) == "function"){
					if(rule.apply(dom, (agru || "").replace(/\s+/g,"").split(","))){
						return true;
					}else{
						isOk = item;
						return false;
					}
				}else{
					isOk = item;
					return false;
				}
		        
			});
			return isOk;
		}
		
        /** 设置验证成功或失败的回调
         *
         *  @roclass Validation
         *  @roname _trigger
         *  @param {event} e	事件
         *  @param {event} dom	发生事件的DOM
         *  @return 无返回值
         */
		,_trigger:function(type, dom){
			
			var me = this
			  , opt = me.opt
			  , json = opt.userCustomData[me._getUserValue(dom)]
			  , successSingleFn = ROCK.util.getFunction(json, "success")
			  , successGlobalFn = ROCK.util.getFunction(opt, "success", function(){})
			  , failSingleFn = ROCK.util.getFunction(json, "fail")
			  , failGlobalFn = ROCK.util.getFunction(opt, "fail", function(){})
			  , item = me._checkItem(dom)
			
			// 只有不是纯验证是才发生回调
			if(type != "validate" && item === true){
				(successSingleFn || successGlobalFn).call(dom, type);
			}else if (type != "validate"){
				(failSingleFn || failGlobalFn).call(dom, type, item);
			}
		}
		
        /** 事件绑定
         *
         *  @roclass Validation
         *  @roname _bind
         *  @return 无返回值
         */
		,_bind:function(){
			
			var me = this								// 当前实例的引用
			  , opt = me.opt							// 当前实例参数
			  , vdElements = me._getValidataDoms();		// 所有要求被验证的DOM
			
			// 绑定表单提交事件
			me._form.bind("submit", function(){
				return me.submit();
			});
			
			// 事件代理
			opt.events && me._form.on(opt.events, me._getValidataProperty(), function(e){
				// update 2015.7.14 ,去掉条件；原来是在le_cloud的设备查找的锁定中有总是
				//if($(e.target).index(vdElements) > -1){
					me._trigger(e.type, e.target);
				//}
			});
		}
    });

    module.exports = Validation;
});
