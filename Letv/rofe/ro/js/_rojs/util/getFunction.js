;
ROCK = window.ROCK || {};
ROCK.util = ROCK.util || {};

/** 获取对象所对应的Path的Funnction
 *
 *  @author ywchen(陈余文)
 *  @date 2015.05.05
 *  @version 1.0.1
 *  @roobject ROCK.util
 *  @static
 *  @roname ROCK.util.getFunction
 *  @param {Object} 	root		被查找的对象
 *  @param {String} 	path		被查找的路径
 *  @param {String} 	defaultVal	当查找不到对应的函数时，返回的值；默认为null
 *  @return {function} 	对应路径的函数
 *  @example
        var json = {
        	e:{
        		o:{
        			f:function(arg){console.log(arg)}
        		}
        	}
        };
        // 正常Case
        ROCK.util.getFunction(json.e, "o.f")("test");
        ROCK.util.getFunction(json, "e.o.f")("test");
       	// 异常Case
        ROCK.util.getFunction(json, "e.o.fn", function(){console.log("123")})("test");
        ROCK.util.getFunction(json.e, "e.o.f")("test");
 */
ROCK.util.getFunction = function(root, path, defaultVal){
	//var emptyFun = function(){};
	var emptyFun = null || defaultVal;
	if(root == null || typeof(root) != "object" || typeof(path) != "string" || $.trim(path) == "") return emptyFun;
	var obj = root;
	var paths = path.split(".");
	for(var i = 0; i < paths.length; i++){
		if( i < paths.length - 1 && obj && obj[paths[i]]){
			obj = obj[paths[i]];
		}else if(obj && obj[paths[i]] && typeof(obj && obj[paths[i]]) == "function"){
			return obj[paths[i]];
		}else{
			return emptyFun;
		}
	}
	return emptyFun;
};


/** 获取唯一值
 *
 *  @author ywchen(陈余文)
 *  @date 2015.05.13
 *  @roobject ROCK.util
 *  @static
 *  @roname ROCK.util.getOnlyKey
 *  @return 唯一值
 *  @example
        var onlyone = ROCK.util.getOnlyKey();
        console.log(onlyone)
 */
ROCK.util.getOnlyKey = function() {
    return (new Date()).getTime() + "_" + Math.ceil(Math.random() * 10000);
}


/** 取图片对象
 *
 *  @author ywchen(陈余文)
 *  @date 2015.09.09
 *  @roobject ROCK.util
 *  @static
 *  @roname ROCK.util.loadImg
 *  @param {String}      imgUrl      图片地址
 *  @param {Function}    callback    回调
 *                                  参数:①img对象{object}，②成功或失败的标识{boolean},true为成功
 *  @return 无
 *  @example
        ROCK.util.loadImg(“imgSRC”, function(img, isSuccess){
            console.log(img, isSuccess);
        });
 */
ROCK.util.loadImg = function(imgUrl, callback){
    var img = new Image();
    var clbk = function(isSuccessed){
        if(typeof(callback) == "function"){
            callback(img, isSuccessed);
        }
    }
    
    $(img).bind("load", function(){
        clbk(true);
    }).css({
        "position":"absolute"
        ,"top":"-9999px"
        ,"left":"-9999px"
    });
    
    $(img).bind("error", function(){
        clbk(false);
    });
    
    $(img).attr("src", imgUrl);
}

/** 尝试加载图片，确认图片是否可用的
 *
 *  @author ywchen(陈余文)
 *  @date 2015.09.09
 *  @roobject ROCK.util
 *  @static
 *  @roname ROCK.util.attemptAccessImg
 *  @param  {String}        imgUrl              [*]图片地址
 *  @param  {Object}        opts                可选参数
 *  @param  {Number}        opts.maxCount       最大尝试加载次数
 *  @param  {Number}        opts.timer          每次尝试的时间间隔
 *  @param  {String}        opts.group          分组，同组的请求同时被多次发起后，只处理最后一次
 *  @param  {Boolean}       opts.unTimestamp    是否强制重试加载图片时不加时间戳
 *  @param  {Function}      opts.loading        开始加载图片
 *  @param  {Function}      opts.success        图片加载成功回调
 *  @param  {Function}      opts.fail           图片加载失败回调
 *  @return 无
 *  @example
        ROCK.util.attemptAccessImg("imgSRC", {
            "success":function(){}
            ,"fail":function(){}
            ,"maxCount":3
            ,"timer":800
            ,"group":"cut_GRP_A"
        });
 */
ROCK.util.attemptAccessImg = function(imgUrl, opts){
    
    opts = opts || {};
    var unTimestamp = opts.unTimestamp;
    var success = typeof(opts.success) == "function" ? opts.success : function(){};
    var fail = typeof(opts.fail) == "function" ? opts.fail : function(){};
    var loading = typeof(opts.loading) == "function" ? opts.loading : function(){};
    var attemptMaxCount = (isNaN(opts.maxCount) || $.trim(opts.maxCount) == "") ? 10 : parseInt(opts.maxCount);
    var timer = (isNaN(opts.timer) || $.trim(opts.timer) == "") ? 500 : parseInt(opts.timer);
    var group = $.trim(opts.group);
    var meFn = arguments.callee;
    meFn.session = meFn.session || {};
    var key = ROCK.util.getOnlyKey(); 
    meFn.session[group] = key;

    loading && loading(imgUrl);

    
    // 由于服务器生成图片时间过长，所以反复请求
    var ldImg = function(isFirst){
        
        if(attemptMaxCount < 0){
            if(group != "" && meFn.session[group] != key){
                return false;
            }
            fail(imgUrl);
            return false;
        }
        
        attemptMaxCount--;
        
        var url = ROCK.util.addTimeToUrl(imgUrl, null, isFirst === true || unTimestamp === true);
        //var url = imgUrl;
        
        ROCK.util.loadImg(url, function(img, flg){
            if(group != "" && meFn.session[group] != key){
                return false;
            }
            if(flg == false){
                setTimeout(ldImg, timer);
            }else{
                success(imgUrl, img);
            }
        });
    }
    ldImg(true);
}


/** 给路径加时间戳
 *
 *  @author ywchen(陈余文)
 *  @date 2015.10.09
 *  @roobject ROCK.util
 *  @static
 *  @roname ROCK.util.addTimeToUrl
 *  @param {String}  url         路径
 *  @param {Obejct}  opts        参数
 *  @param {Boolean} unTimestamp 是否强制不加时间戳
 *  @eg    ROCK.util.addTimeToUrl("http://www.letv.com");
 *  @return 加了时间戳的路径
 */
ROCK.util.addTimeToUrl = function(url, opts, unTimestamp){
    var path = null,
    hash = null,
    search = null,
    tmpHash = null,
    tmpSearch = null,
    tmpPath = null,
    other = {};
    opts = opts || {};

    if(url == null || url == "" || typeof(url) != "string"){
        return url;
    }
    url = $.trim(url);
    
    var index = url.indexOf("?");
    index = index == -1 ? url.length : index;
    path = url.substring(0,index);
    tmpSearch = url.substring(index + 1)
    //tmpPath = url.split("?");
    //path = $.trim(tmpPath[0]);
    //tmpSearch = tmpPath[1];
    if(tmpSearch != null){
        tmpHash = tmpSearch.split("#");
        search = $.trim(tmpHash[0]);
        hash = $.trim(tmpHash[1]);
    }
    
    // 原地址的
    if($.trim(search) != ""){
        var reg = /&*([\w_$]+)=([\[\]\{\}\"\'\/\.\\,:%\w_$]*)/g;
        //var reg = /&*([\w_$]+)=([^=&]*)/g;
        var count = 100;
        while((arr = reg.exec(search)) !=null && count > 1){
            other[arr[1]] = arr[2];
        }
    }
    
    // 添加的
    for(var key in opts){
        other[key] = opts[key] == null ? "" : opts[key];
    }
    
    // 添加时间戳
    other["v"] = ROCK.util.getOnlyKey();
    if(unTimestamp === true){
        delete other["v"];
    }
    
    search = $.param(other);
    if(search != ""){
        search = "?" + search;
    }
    
    if(hash != null && hash != ""){
        hash = "#" + hash;
    }else{
        hash = "";
    }
    return path + search + hash;
};

console = window.console || {};
console.log = console.log || function(){};
// 为打log方便，也为了在IE下不出错
window.log = function (){
    // if(console && console.log && console.log.apply){
    //     console.log.apply(console, arguments);
    // }else{
    // 	//alert(arguments);
    // }

    try{
        var userAgent = navigator.userAgent.toLocaleLowerCase();
        var browser = {
            version: (userAgent.match( /.+(?:rv|it|ra|ie)[\/: ]([\d.]+)/ ) || [])[1],
            safari: /webkit/.test( userAgent ),
            opera: /opera/.test( userAgent ),
            ie: /msie/.test( userAgent ) && !/opera/.test( userAgent ),
            mozilla: /mozilla/.test( userAgent ) && !/(compatible|webkit)/.test( userAgent )
        }; 

        var toPrint = [];
        for (var i = 0; i < arguments.length; ++i) {
            toPrint.push(arguments[i]);
        }

        function getErrorObject() {
            try {
                throw Error('')
            } catch (err) {
                return err;
            }
        }
        var err = getErrorObject(),
            caller;
        if (browser.mozilla) {
            caller = err.stack.split("\n")[2];
        } else {
            caller = err.stack.split("\n")[4];
        }
        var index = caller.indexOf('.js');
        var str = caller.substr(0, index + 3);
        index = str.lastIndexOf('/');
        str = str.substr(index + 1, str.length);
        var info = "\t\tFile: " + str;
        if (browser.mozilla) {
            str = caller;
        } else {
            index = caller.lastIndexOf(':');
            str = caller.substr(0, index);
        }
        index = str.lastIndexOf(':');
        str = str.substr(index + 1, str.length);
        info += " Line: " + str;
        toPrint.push(info);
        console.log.apply(console, toPrint);
    }catch(e){}
}