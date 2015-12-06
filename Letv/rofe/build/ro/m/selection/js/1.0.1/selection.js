;
define(ROCK.seaConfig.alias.selection, function(require, exports, module) {

    /** 模块数据加载初始化 
     *
     *  @author ywchen(陈余文)
     *  @constructs Selection
     *  @date 2015.05.28
     *  @version 1.0.1
     *  @param {Object}         ops 			[*]参数
     *  @param {HTMLElement}	ops.dom 		[*]Dom
     *  @param {Function}		ops.getParam	[*]取接口必须参数的回调（参数为上级被选中的value值）；当ops.getData有值时，此设置可以为空
     *											返回值要求必须是JSON格式，key按接口需要来
     *											在ops.getData无配置值时此函数返回的是直接可用数据
     *  @param {Function}	    ops.getData     [*]ajax获取数据；当ops.getParam有值时，此设置可以为空
     *  @param {HTMLElement}	ops.child 		子Dom
     *  @param {Boolean}		ops.isFirstLoad 是否第一次要加载
     *  @param {Boolean}		ops.callback 	值设置后的回调
     *  @param {String}         ops.defText		默认显示值
     *  @param {Function}		ops.getContent	生成每个option时前的回调（参数是接口返回数据单对象和对象的索引名）
     *											返回值要求必须是这种格式return {"value":"","text":""}
     *  @return {Selection} Selection的实例
     *  @example
     
        	<select id="sltYear"></select>
        	<select id="sltMonth"></select>
        	<select id="sltDate"></select>
        	
            new Selection({
                "dom":"#sltYear"
            	,"child":"#sltDate"
                ,isFirstLoad:true
            	,"defText":"请选择年"
                ,"getParam":function(cid){
                    return [2000, 2001, 2002, 2003, 2004];
                }
                ,"getContent":function(item,index){
                	return {
                		"value":item
                		,"text":item
                	}
                }
            });
            new Selection({
                "dom":"#sltMonth"
            	,"child":"#sltDate"
                ,isFirstLoad:true
            	,"defText":"请选择月"
                ,"getParam":function(cid){
                    return [1,2,3,4,5,6,7,8,9,10,11,12];
                }
                ,"getContent":function(item,index){
                	return {
                		"value":item
                		,"text":me._getAddZero(item)
                	}
                }
            });

            new Selection({
                "dom":"#sltDate"
            	,"defText":"请选择日"
                ,isFirstLoad:true
                ,"getParam":function(cid){
                    return me._getNumbers(1, 10);
                }
                ,"getContent":function(item,index){
                	return {
                		"value":item.id
                		,"text":item.name
                	}
                }
                ,getData:function(){
                    var selection = this;
                    // AJAX请求加回调
                    me._search(function(data){
                        selection.setData(data);
                    });
                }
                ,"callback":function(){
                    !isNaN(day) && $(this).val(day);
                }
            });
     */
    var Selection = function(opt){
        var me = this;
        var opts = opt || {};
        var element = $(opts.dom);
        var eleChild = $(opts.child);
        
        this.setData = function(data){
    		element.trigger("addItem",{
                "data":data
            });
        }
        
        // 清空操作
        element.bind("clean", function(e){
            element.find("option").remove();
            
            if($.trim(opts.defText) != ""){
    			element.trigger("set", {"value":"" ,"text":opts.defText});
            }
            
            if($(opts.child).length > 0){
                $(opts.child).trigger("clean");
            }
        });
        
        // 设置子项目
        element.bind("set", function(e, opt){
        	opt = opt || {};
            element.append('<option value="' + $.trim(opt.value) + '">' + $.trim(opt.text) + '</option>');
        });
        
        // 加载状态
        element.bind("loadStart", function(e){
    		element.trigger("clean");
            element.find("option").remove();
    		element.trigger("set", {"value":"" ,"text":"数据加载中..."});
        });
        
        // 添加状态
        element.bind("addItem", function(e, data){
        
    		element.trigger("clean");
            
        	if(data == null || data.data == null){
        		return;
        	}
        	$.each(data.data, function(index,item){
        		if(typeof(opts.getContent) == "function"){
        			var obj = opts.getContent.call(element,item,index);
    				element.trigger("set", obj);
        		}
        	});
    		if(typeof(opts.callback) == "function"){
    			opts.callback.call(element, opts)
    		}
        });
        
        // 搜索
        element.bind("search", function(e, data){
            data = data || {};
            var value = data.value;
            var text = data.text;
            
            if($.trim(opts.getData) == "" && typeof(opts.getParam) == "function"){
        		element.trigger("addItem",{
                    "data":opts.getParam(value, text)
                });
               	return true;
        	}else if($.trim(opts.getData) == ""){
        		alert("ERROR:形参getData和getParam不能都为空!");
               	return true;
        	}
            
            element.trigger("loadStart");
            
            opts.getData && opts.getData.call(me, value, this);
            
        });
        
        element.bind("change", function(e){
        	var value = this.options[this.options.selectedIndex].value;//$(this).val();
        	var text = this.options[this.options.selectedIndex].text;
            if($(opts.child).length > 0){
    	    	$(opts.child).trigger("search",{
    	    		"value":value
    	    		,"text":text
    	    	});
        	}
        });
    	
        if(opts.isFirstLoad === true){
        	element.trigger("search");
        }
    };
    module.exports = Selection;
});
