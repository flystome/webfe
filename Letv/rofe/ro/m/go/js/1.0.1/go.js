;
define(ROCK.seaConfig.alias.go, function(require, exports, module) {

    /** AJAX
     *  未实现push队列的提交方式，有需要时再补上
     *
     *  @author ywchen(陈余文)
     *  @constructs Go
     *  @date 2015.05.03
     *  @version 1.0.1
     *  @param {Object} opts			    [*]参数
     *  @param {Function} opts.url		    [*]提交数据的URL
     *  @param {Function} opts.repeatError	重复提交错误,即在上一个请求回来之前又提交了；发生这种情况只在设置了opts.lock参数的情况下且未设置opt.group
     *  @param {Function} opts.success	    表单验证单控件成功时的回调,参数为AJAX的数据
     *  @param {Function} opts.fail		    表单验证单控件失败时的回调，参数为什么类型的错误(ajaxError,customError)
     *  @param {Object}	opts.lock		    防重复提交DOM,一般是被点击的按钮
     *  @param {Object}	opts.group		    标识请求列表组，比如在自动完成框中使用时
     *  @param {Object}	opts.isPush		    是否以队列方式提交 --- debug --- 未实现
     *  @param {Object}	opts.*			    其它$.ajax的配置参数
     *  @return {Go} Go的实例
     *  @example
            var go = new Go({
            	url:"/"
                ,group:"group1"
            	,lock:".btnSubmit"
                ,repeatError:function(){
                    alert("请不要重复提交");
                }
            	,success:function(){}
            	,fail:function(){}
            });
     */
    var Go = function(opts) {

        // 继承父类属性
        ROCK.core.BaseClass.call(this);

        // 参数的默认值配置
        var opt = {
            //repeatError:function(){alert(12)}
        }

        // 重置配置
        $.extend(opt, opts);

        // 参数
        this.opt = opt;
        
        this.lockStates = {
		    // 繁忙状态
		    busyState:"J_SubmitBusying"
		    // 空闲状态
		    ,vacancyState:"J_SubmitVacancy"
        }

        // 当前发起的Jquery的ajax对象
        this.ajax = null;
        
        // 请求组
        this.group = $.trim(opt.group);
        
        // 被锁上时不发起AJAX提交
        if(this.isLock()){
        	opt.repeatError && opt.repeatError.call(this);
        	return ;
        }
        
        this._init();
        
        // 仅非组情况才加锁
        if(this.group == ""){
	        // 发起ajax前先上锁
	        this.addLock();
        }
        
        // 最后发起请求的Key
        this.lastKey = "Key_" + (new Date()).getTime() + "_" + Math.ceil(Math.random() * 10000);
        
        // ajax分组
        var self = arguments.callee;
        self.groups = self.groups || {};
        this.setGroup = function(group, value){
        	self.groups[group] = value;
        }
        this.getGroup = function(group){
        	if($.trim(group) == "")return null;
        	return self.groups[group] || null;
        }
        
        var groupObj = this.getGroup(this.group);
        // 有组时，强制中止上次的请求
        if(this.group != "" && groupObj){
	        groupObj["req"].abort();
        }
        
        // 发起AJAX
        this._send();
        
        // 组信息存储
        this.setGroup(this.group, {
            "key": this.lastKey
            ,"req": this.ajax
            ,"self":this
        });
    }

    // 继承原型
    ROCK.core.BaseClass.extend(Go);

    $.extend(Go.prototype, {
    	
        /** 初始化，预处理AJAX的Options参数
         *
         *  @roclass Go
         *  @roname _init
         *  @return 无返回值
         */
        _init:function(){
        	var me = this;
        	var opt = this.opt || {};
            // 发送请求前回调
            var beforeSend = ROCK.util.getFunction(opt, "beforeSend", function(){});
        	// 成功处理函数
        	var success = ROCK.util.getFunction(opt, "success", function(){});
        	// 失败处理函数
        	var fail = ROCK.util.getFunction(opt, "fail", function(){});
        	// 完成处理函数
        	var complete = ROCK.util.getFunction(opt, "complete", function(){});

            // 发送请求前回调
            opt.beforeSend = function(){
                me.ajax = me.ajax == null ? this : me.ajax;
                return beforeSend.call(me);
            }
        	
        	// AJAX成功回调
        	opt.success = function(){
        		
            	// 请求响应回来后解锁
    			me.removeLock();
        		return success.apply(me, arguments);
        	}
        	
        	// AJAX失败回调
        	opt.error = function(){
        		if(arguments[1] != "abort"){
        			
	            	// 请求响应回来后解锁
	    			me.removeLock();
        			return fail.call(me, "ajaxError", arguments);
        		}
        	}
        	
        	// AJAX完成回调
        	opt.complete = function(){
            	// 请求响应回来后解锁
    			me.removeLock();
    			return complete.call(me);
        	}
        	
        	// 添加时间戳
        	if(opt.type != "post"){
        		var t = new Date().getTime();
        		if(typeof(opt.data) == "string"){
        			opt.data += ($.trim(opt.data) == "" ? "" : "&") + "t=" + t;
        		}else{
        			opt.data = opt.data || {};
        			$.extend(opt.data, {
        				t:t
        			});
        		}
        	}
        	this.opt = opt;
        }
        
        /** 发送AJAX请求
         *
         *  @roclass Go
         *  @roname _send
         *  @return 无返回值
         */
        ,_send:function(){
        	this.ajax = $.ajax(this.opt);
        }
        
        /** 中断本次AJAX请求
         *
         *  @roclass Go
         *  @roname abort
         *  @return 无返回值
         */
        ,abort:function(){
        	this.ajax && this.ajax.abort && this.ajax.abort() 
        }
        
        /** 获取$.ajax的实例
         *
         *  @roclass Go
         *  @roname getAjax
         *  @return {Jquery.ajax} 本次$.ajax的实例
         */
        ,getAjax:function(){
	        return this.ajax;
        }
        
        /** 添加LOCK状态
         *
         *  @roclass Go
         *  @roname addLock
         *  @return 无返回值
         */
        ,addLock:function(){
	        var element = $(this.opt.lock);
	        if(element.length < 1){
	            return;
	        }
	        element.removeClass(this.lockStates.vacancyState);
	        element.addClass(this.lockStates.busyState);
        }
        
        /** 移除LOCK状态，无条件移除，实际操作中要调用removeLock函数移除
         *
         *  @roclass Go
         *  @roname _delLock
         *  @return 无返回值
         */
        ,_delLock:function(){
        	
	        var element = $(this.opt.lock);
	        if(element.length < 1){
	            return;
	        }
	        element.removeClass(this.lockStates.busyState);
	        element.addClass(this.lockStates.vacancyState);
        }
        
        /** 移除LOCK状态
         *
         *  @roclass Go
         *  @roname removeLock
         *  @return 无返回值
         */
        ,removeLock:function(){
    		var groupObj = this.getGroup(this.group);
            if(groupObj == null || (groupObj != null &&  groupObj.key === this.lastKey)){
    			this._delLock();
            }
        }
        
        /** 检查是否被LOCK
         *
         *  @roclass Go
         *  @roname isLock
         *  @return {Boolean} 是否被LOCK着
         */
        ,isLock:function(){
        	
	        var element = $(this.opt.lock);
	        if(element.length < 1){
	            return false;
	        }
	        if(element.hasClass(this.lockStates.busyState)){
	            return true;
	        }
	        return false;
        }
        
        /** 设置全局 AJAX 默认选项,和$.ajaxSetup的使用方式一致
         *
         *  @roclass Go
         *  @roname setSetup
         *  @return {Object} 被设置的Options
         */
        ,setSetup:function(opt){
        	return $.ajaxSetup(opt);
        }
    });
    
    module.exports = Go;
});
