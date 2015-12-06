;
define(ROCK.seaConfig.alias.dropdown, function(require, exports, module) {

    /** 下拉列表
     *
     *  @author ywchen(陈余文)
     *  @constructs Dropdown
     *  @date 2015.05.03
     *  @param {Object} opts   					[*]参数
     *  @param {String|HTMLElement} opts.btn   	[*]触发出列表的按钮Dom
     *  @param {String|HTMLElement} opts.list	[*]列表Dom
     *  @param {String} opts.btnOpenEvent   	按钮Dom触发显示事件，默认为mouseenter
     *  @param {String} opts.btnCancelEvent 	按钮Dom触发隐藏事件，默认为mouseleave；--- debug --- 暂不支持btnOpenEvent和btnCancelEvent事件都click的时候，即点一下显示再点一下隐藏的情况
     *  @param {String} opts.listOpenEvent   	列表Dom触发显示事件，默认为mouseenter
     *  @param {String} opts.listCancelEvent 	列表Dom触发隐藏事件，默认为mouseleave
     *  @param {Function} opts.init 			组件被初始化完后回调
     *  @param {Function} opts.beforeOpen       列表Dom被显示前回调；第一次参数是最后一次触发的按钮，第二个参数是被显示列表
     *  @param {Function} opts.open 			列表Dom被显示时回调；第一次参数是最后一次触发的按钮，第二个参数是被显示列表
     *  @param {Function} opts.beforeCancel     列表Dom被隐藏前回调；第一次参数是最后一次触发的按钮，第二个参数是被隐藏列表
     *  @param {Function} opts.cancel 			列表Dom被隐藏时回调；第一次参数是最后一次触发的按钮，第二个参数是被隐藏列表
     *  @param {Function} opts.time 			事件延迟器时间，默认200毫秒
     *  @return {Dropdown} Dropdown的实例
     *  @version 1.0.1
     *  @example
			var dropdown = new Dropdown({
				btn:".J_btn"
				,list:".J_list"
				,btnOpenEvent:"mouseenter click"
				,btnCancelEvent:"mouseleave"
				,listOpenEvent:"mouseenter"
				,listCancelEvent:"mouseleave"
				,time:200
				,open:function(){
					var currBtnElement = this.getCurrBtnElement();
					$(currBtnElement).addClass("bgRed");
				}
				,cancel:function(){
					var currBtnElement = this.getCurrBtnElement();
					$(currBtnElement).removeClass("bgRed");
				}
			});
     */
    var Dropdown = function(opts) {

        // 继承父类属性
        ROCK.core.BaseClass.call(this);

        // 参数的默认值配置
        var opt = {
        	btn:null						// 触发出列表的按钮Dom
        	,list:null						// 列表Dom
        	,btnOpenEvent:"mouseenter"		// 按钮Dom触发显示事件，默认为mouseenter
        	,btnCancelEvent:"mouseleave"	// 按钮Dom触发隐藏事件，默认为mouseleave
        	,listOpenEvent:"mouseenter"		// 列表Dom触发显示事件，默认为mouseenter
        	,listCancelEvent:"mouseleave"	// 列表Dom触发隐藏事件，默认为mouseleave
        	,init:function(){}				// 组件被初始化完后回调
        	,open:function(){}				// 列表Dom被显示时回调
        	,cancel:function(){}			// 列表Dom被隐藏时回调
        	,time:200						// 事件延迟器时间，默认200毫秒
        }

        // 重置配置
        $.extend(opt, opts);

        // 参数
        this.opt = opt;
        
        // 当前触发显示列表的按钮
        this._currBtn = null;
        // 时间ID
        this.timeId = null;
        
        // 组件初始化
        this._init();

    }

    // 继承原型
    ROCK.core.BaseClass.extend(Dropdown);

    $.extend(Dropdown.prototype, {

        /** 
         *  组件初始化
         *
         *  @roclass Dropdown
         *  @roname _init
         *  @return {Dropdown}	返回Dropdown本次引用
	     *  @example
				var drpdwn = new Dropdown({
					"btn":".btn"
					,"list":".list"
				});
				drpdwn._init();
	     */
        _init:function(){
			this._bind();
			this.opt.init && this.opt.init.call(this);
        }
        
        /** 
         *  事件绑定
         *
         *  @roclass Dropdown
         *  @roname _bind
         *  @return {Dropdown}	返回Dropdown本次引用
	     *  @example
				var drpdwn = new Dropdown({
					"btn":".btn"
					,"list":".list"
				});
				drpdwn._bind();
	     */
        ,_bind:function(){

        	var me = this
			  , opt = this.opt || {}
        	  , btnElement = me.getBtnElements()
        	  , listElement = me.getListElements()

			
            if(me._isClickShowHide()){
                this.opt.time = 0;
                btnElement.bind(opt.btnOpenEvent, function(){
                    if(me._isShow(this)){
                        me._hide();
                        $(document).trigger("DOMClick", {
                            "key":"ROCK.Dropdown"
                            ,"isCloseOwn":true
                        });
                    }else{
                        $(document).trigger("DOMClick", {
                            "key":"ROCK.Dropdown"
                            ,"isCloseOwn":true
                        });
                        me._show(this);
                    }
                    return false;
                });

                // 防止点上打开的列表时发生列表隐藏
                listElement.bind("click", function(){
                    $(document).trigger("DOMClick", {
                        "key":"ROCK.Dropdown"
                        ,"isCloseOwn":false
                    });
                    return false;
                });

                // 绑定
                $(document).bind("click DOMClick", function(e, data){
                    // 为了在每一个阻止事件冒泡的时候都派发出来DOMClick事件，并对封装的对象自身不能构成影响；
                    // 引入了key(被封装的对象名)和isCloseOwn的属性; 以此来辨别自身
                    if(data != null && data.key == "ROCK.Dropdown" && data.isCloseOwn === false){
                        return
                    }
                    me._hide(null,false);
                });
            }else{

                btnElement.bind(opt.btnOpenEvent, function(){
                    me._show(this);
                });
                
                btnElement.bind(opt.btnCancelEvent, function(){
                    me._hide();
                });
                
                listElement.bind(opt.listOpenEvent, function(){
                    clearTimeout(me.timeId);
                });
                listElement.bind(opt.listCancelEvent, function(){
                    me._hide();
                });
            }
        }

        /** 是否是点击显示隐藏的操作
         *
         *  @roclass Dropdown
         *  @roname _isClickShowHide
         *  @return {Boolean}  是否是点击显示隐藏的操作
         *  @example
                var drpdwn = new Dropdown({
                    "btn":".btn"
                    ,"list":".list"
                });
                drpdwn._isClickShowHide();
         */
        ,_isClickShowHide:function(){
            var opt = this.opt;
            return opt.btnOpenEvent == "click" && opt.btnCancelEvent == "click";
        }
        
        /** 指定列表是否正显示着
         *
         *  @roclass Dropdown
         *  @roname _isShow
         *  @param {HTMLElement} btnElement   [*]指定的按钮
         *  @return {Boolean}  是否显示
         *  @example
                var drpdwn = new Dropdown({
                    "btn":".btn"
                    ,"list":".list"
                });
                drpdwn._isShow();
         */
        ,_isShow:function(btnElement){
            var listElement = this._getCurrListElement(btnElement);
            return listElement.filter(":visible").length > 0;
        }

        /** 获取当前显示列表
         *
         *  @roclass Dropdown
         *  @roname _getCurrListElement
     	 *  @param {HTMLElement} handleElement   
         *  @return {Dropdown}	返回Dropdown本次引用
	     *  @example
				var drpdwn = new Dropdown({
					"btn":".btn"
					,"list":".list"
				});
				drpdwn.show();
	     */
        ,_getCurrListElement:function(btnElement){
			var me = this
			  , index = -1
			  , opt = me.opt || {}
			  , currListElement = null
			  , thisBtn = btnElement || me.getCurrBtnElement()
			  , listElement = me.getListElements()
			
			if(me._isMultipleToMultiple()){
				index = $(thisBtn).index(opt.btn);
				currListElement = listElement.eq(index);
			}else{
				currListElement = listElement;
			}
			
			return  currListElement;
        }
        
        /** 强制列表被显示,并触发显示回调
         *
         *  @roclass Dropdown
         *  @roname _show
     	 *  @param {HTMLElement} currBtnElement   当前触发显示的按钮Dom
         *  @return {Dropdown}	返回Dropdown本次引用
	     *  @example
				var drpdwn = new Dropdown({
					"btn":".btn"
					,"list":".list"
				});
				drpdwn._show();
	     */
        ,_show:function(currBtnElement){
			var me = this
			  , opt = this.opt || {}
			  , listElement = null
			
			this._hide(currBtnElement,true);
			this._currBtn = currBtnElement;
			listElement = this._getCurrListElement();
            opt.beforeOpen && opt.beforeOpen.call(this,me._currBtn,listElement);
			listElement.show();
			opt.open && opt.open.call(this,me._currBtn,listElement);
        }
        
        /** 强制列表被隐藏,并触发隐藏回调
         *
         *  @roclass Dropdown
         *  @roname hide
         *  @return {Dropdown}	返回Dropdown本次引用
	     *  @example
				var drpdwn = new Dropdown({
					"btn":".btn"
					,"list":".list"
				});
				drpdwn.hide();
	     */
        ,hide:function(){
			this._hide();
            return this;
        }
         
        /** 强制列表被隐藏,并触发隐藏回调
         *
         *  @roclass Dropdown
         *  @roname _hide
     	 *  @param {HTMLElement} currBtnElement   本次触发的按钮
         *  @return {Dropdown}	返回Dropdown本次引用
	     *  @example
				var drpdwn = new Dropdown({
					"btn":".btn"
					,"list":".list"
				});
				drpdwn._hide(currBtnElement,isClose);
	     */
        ,_hide:function(currBtnElement,isClose){
			var me = this
			  , opt = this.opt || {}
			  , listElement = me._getCurrListElement();
			
			if(currBtnElement != null && me._currBtn != null 
				&& currBtnElement != me._currBtn){
				
				clearTimeout(me.timeId);
                opt.beforeCancel && opt.beforeCancel.call(me,me._currBtn,listElement);
				listElement.hide();
				opt.cancel && opt.cancel.call(me,me._currBtn,listElement);
				me._currBtn = null;
			}else if(!isClose){

				me.timeId = setTimeout(function(){
                    opt.beforeCancel && opt.beforeCancel.call(me,me._currBtn,listElement);
					listElement.hide();
					opt.cancel && opt.cancel.call(me,me._currBtn,listElement);
					me._currBtn = null;
				},opt.time);
				
			}else{
				clearTimeout(me.timeId);
			}
        }
        
        /** 是否多对多的关系，多个按钮对应多个列表；只支持两种关系，
         *	一为多个按钮对应一个列表，二为多个按钮对应多个列表
         *
         *  @roclass Dropdown
         *  @roname _isMultipleToMultiple
         *  @return {Dropdown}	返回Dropdown本次引用
	     *  @example
				var drpdwn = new Dropdown({
					"btn":".btn"
					,"list":".list"
				});
				var isMult = drpdwn._isMultipleToMultiple();
	     */
        ,_isMultipleToMultiple:function(){
        	var opt = this.opt || {}
        	//, btnElement = $(opt.btn)
        	  , listElement = $(opt.list)
        	
        	if(listElement != null && listElement.length > 1){
        		return true;
        	}else{
        		return false;
        	}
        }
        
        /** 获取当前触发显示列表的按钮，无列表显示时，返回值为null
         *
         *  @roclass Dropdown
         *  @roname getCurrBtnElement
         *  @return {HTMLElement}	返回当前触发显示列表的按钮Dom
	     *  @example
				var drpdwn = new Dropdown({
					"btn":".btn"
					,"list":".list"
				});
				var currBtn = drpdwn.getCurrBtnElement();
	     */
        ,getCurrBtnElement:function(){
        	return this._currBtn;
        }
        
        /** 获取按钮列表Dom
         *
         *  @roclass Dropdown
         *  @roname getBtnElements
         *  @return {HTMLElement}	返回按钮列表Dom
	     *  @example
				var drpdwn = new Dropdown({
					"btn":".btn"
					,"list":".list"
				});
				var doms = drpdwn.getBtnElements();
	     */
        ,getBtnElements:function(){
        	return $(this.opt.btn);
        }
        
        /** 获取下拉列表Dom
         *
         *  @roclass Dropdown
         *  @roname getListElements
         *  @return {HTMLElement}	返回下拉列表Dom
	     *  @example
				var drpdwn = new Dropdown({
					"btn":".btn"
					,"list":".list"
				});
				var doms = drpdwn.getListElements();
	     */
        ,getListElements:function(){
        	return $(this.opt.list);
        }
    
    });

    module.exports = Dropdown;
});
