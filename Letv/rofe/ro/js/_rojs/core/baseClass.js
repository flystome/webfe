;
ROCK = window.ROCK || {};
ROCK.core = ROCK.core || {};

/** 所有类的基类
 *	
 *  @constructs ROCK.core.BaseClass
 *  @date 2015.05.03
 *  @version 1.0.1
 *	@return {ROCK.core.BaseClass} ROCK.core.BaseClass类的实例
 *	@example
 		vra bassClass = new ROCK.core.BaseClass();
 */
ROCK.core.BaseClass = function() {

	var me = arguments.callee;

	me.guid = me.guid || 0;
	var guid = me.guid++;

	me.sessions = me.sessions || [];
	me.sessions[guid] = this;
	this.guid = guid;

}

/** 提供统一设置|获取可输入框值的方法；因为对Jquery的val函数作了扩展成value的原因；目的是把提示内容和真正的实在内容作区分
 *  
 *  @roclass ROCK.core.BaseClass
 *  @roname     val
 *  @param      {HTMLElement}       element  可输入框的Dom（如input、select、textarea）
 *  @return     可输入框中的内容，仅返回非提示性的内容；（是否为提示性，只看内容是否和Dom上的属性data-title的值相同）
 *  @example
        vra baseClass = new ROCK.core.BaseClass();
        baseClass.val(dom);         // 取值
        baseClass.val(dom, "123");  // 设置值
 */
ROCK.core.BaseClass.prototype.val = function(element, value){
    element = $(element);
    var fn = null;
    if(typeof(element.value) == "function"){
        fn = element.value;
        //return element.value();
    }else{
        fn = element.val;
        //return element.val();
    }
    if(arguments.length > 1){
        fn.call(element, value);
    }else{
        return fn.call(element);
    }
}

/** 释放对象所持有的资源。
 *
 *  @roclass ROCK.core.BaseClass
 *  @roname dispose
 *	@return 无
 *	@example
 		vra baseClass = new ROCK.core.BaseClass();
 		baseClass.dispose();
 */
ROCK.core.BaseClass.prototype.dispose = function(){
    if(this.guid){
        delete ROCK.core.BaseClass.sessions[this.guid];
    }

    for(var i in this){
        if(typeof this[i] != "function"){
            delete this[i];
        }
    }
};

/** 根据guid获取实例过的对象
 *
 *  @roobject ROCK.core.BaseClass
 *  @roname ROCK.core.BaseClass.get
 *  @static
 *	@param {Number} guid  对象实例的ID
 *	@return {Object} 类的实例
 *	@example
 		ROCK.core.BaseClass.get("{guid}");
 */
ROCK.core.BaseClass.get = function(guid){
	return ROCK.core.BaseClass.sessions[guid];
}

/** 类继承
 *	
 *  @roobject ROCK.core.BaseClass
 *  @roname ROCK.core.BaseClass.extend
 *  @static
 *	@param {Function} SubClass  子类
 *	@param {Function} BaseClass 父类，默认是ROCK.core.BaseClass
 *	@return 无
 *	@example
 		function SbClss(){
			// code
 		}
 		ROCK.core.BaseClass.extend(SbClss);
 */
ROCK.core.BaseClass.extend = function(SubClass, BaseClass) {

	BaseClass = BaseClass || ROCK.core.BaseClass;

    var F = function() {
    	// 属性继承
    	// BaseClass.call(this);
    };

    // 原型继承
    F.prototype = BaseClass.prototype;
    SubClass.prototype = new F();
    SubClass.prototype.constructor = SubClass;
};