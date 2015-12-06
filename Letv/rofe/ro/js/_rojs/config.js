// 全局命名空间
ROCK = window.ROCK || {};
window.RO = ROCK;

/**
 *  配置项
 *
 */
(function() {

    // 组件列表配置
    var aliasModuleList = [
        "dialog:1.0.1"				// 对话框
        ,"tips:1.0.1"				// 提示框
        ,"validation:1.0.1"			// 表单验证
        ,"go:1.0.1"					// ajax
        ,"dropdown:1.0.1"			// 下拉框
        ,"audio:1.0.1"				// 音频
        ,"muplayer:0.9.2"			// 以seajs的方式重新封装了下百度音乐播放内核
        ,"muplayer:0.9.2:player"	// 百度音乐播放内核
        ,"calendar:1.0.1"			// 日期组件
        ,"selection:1.0.1"			// 下拉框联动组件
        ,"selector:1.0.1"           // 模拟下拉框
        ,"upload:1.0.1:uploadify"   // 上传组件
        ,"upload:1.0.1"             // 上传组件
        ,"cutpicture:1.0.1"         // 裁截图片
        ,"page:1.0.1"               // 分页
        ,"router:1.0.1"             // 路由
        ,"drag:1.0.1"               // 拖拽
        ,"url:1.0.1"                // URL
    ]
    // 扩展组件
     , aliasExtList = [
        "formsend:1.0.1"
        ,"send:1.0.1"
        ,"sortable:1.0.1"
    ]
    // 业务相关
     , aliasLeList = [
        "uploader:1.0.1"           // 结合线上接口的上传组件
        ,'cut:1.0.1'
    ]

    // 默认静态资源的基础路径
      , defaultStaticPath = "/ro"
    // 模块的文件夹
      , moduleFolder = "/m/"
    // 扩展模块的文件夹
      , extFolder = "/ext/"
    // 业务相关模块的文件夹
      , leFolder = "/le/"
    // 模块和扩展模块的路径模板
      , modulePathTpl = "{module}/js/{version}/{filename}.js"

      , staticPath = window.ROCK && window.ROCK.staticPath || window.staticPath || defaultStaticPath
    // 模块的路径
      , modulePath = staticPath + moduleFolder
    // 模块的路径
      , extPath = staticPath + extFolder
    // 模块的路径
      , lePath = staticPath + leFolder;

    // 配置项目的静态资源基础路径
    ROCK.STATICPATH = staticPath;

    // 设置Sea.js 的配置
    ROCK.seaConfig = {

        // Sea.js 的基础路径
        base: modulePath

        // 别名配置
        ,alias: {
             //"dialog": modulePath + "dialog/js/1.0.1/dialog.js"
             //,"tips": modulePath + "tips/js/1.0.1/tips.js"
        }

        // 文件编码
        ,charset: 'utf-8'
    }

	// set模块设置
    setAliasConfig(aliasModuleList, modulePath);
	// set扩展模块设置
    setAliasConfig(aliasExtList, extPath);
    // set业务相关模块的文件夹设置
    setAliasConfig(aliasLeList, lePath);

    // 设置
    seajs.config(ROCK.seaConfig);

    function setAliasConfig(data, path){
    	$.each(data,function(index, item){
    		if($.trim(item) == "") return true
	        var items = item.split(":");
	        ROCK.seaConfig.alias[items[2] || items[0] || ""] = path + modulePathTpl.replace(/{(\w+)}/g, function(a, b){
	            if(b == "module"){
	                return items[0] || "";
	            }else if(b == "filename"){
	            	return items[2] || items[0] || "";
	            }else{
	                return items[1] || "";
	            }
	        });
	    });
    }
})();
