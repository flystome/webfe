var replaceEnter = "\n";
try{
	module = module || {};
}catch(e){
	module = {};
}
try{
	$ = $ || {};
}catch(e){
	$ = {};
}
$.extend = $.extend || function(opt,opt1){
	for(var t in opt1){
		opt[t] = opt1[t];
	}
}
function parse(str){
	
	var T = {};
	var regStr1 = "/\\*\\*";
	var regStr2 = "(.*?)";
	var regStr3 = "\\*/";
	var reg = new RegExp(regStr1 + regStr2 + regStr3,"g")
	var isReplace = 1;
	
	var f = str;
	f = (f + "").replace(/\bROCK\./g,"RO.");
	/**
	var a = str.match(/\n*\s*(define\s*\()/) || {index:0};
	var b = str.match(/\n*\s*module\.exports/) || {index:0};
	var c = str.substr(a.index,b.index);
	var d = c.match(/\n/) || {index:0};
	f = str.substr(d.index,b.index);
	*/
	var index = 1;
	var w = "---##YWCHEN{lineNumber}##---"
	
	if(isReplace != 0){
		f = f.replace(/[\n\r]/g,function(){
			return w.replace(/{lineNumber}/,index++);
		});
	}
	
	f.replace(reg,function(){
		parseNote(T,arguments);
	});
	
	//preview(T);
	for(var i in T)return T[i];
	return T;
}

// 获取每一块注释
function parseNote (t,arg){
//对话框     *     *  @author ywchen(陈余文)     *  @param {Object} opts   参数     *  @param {Number} opts.width  对话框宽度，300px 
	var str = arg[1];
	var index = str.indexOf("@");
	var comments = getValue(str.substr(0,index),true);
	var tt = str.substr(index);
	tts = tt.split("@");
	
	var TT = {
		"desc":comments
	};
	for(var i = 0; i < tts.length; i++){
		var cont = getValue(tts[i] + "")
			
		parseContent(cont,TT)
	}
	
	setLevel(t,TT);
	
	//log(TT)
	//appendPreview(TT);
	//t.aa TT
}

function parseContent(str,obj){
	var key = str.match(/^\w+/);
	var val = str.replace(/^\w+/,"");
	var values = null;
	var value = null;
	if(!key){
		//log("解析Key失败！解决字符：",str)
		return;
	}
	key = key[0];
	switch(key){
		case "param":
			value = getValue(val);
			var type = value.match(/^{([\w|]+)}/,"");
			type = type && type.length > 1 ? type[1] : (type && type.length == 1 ? type[0] : "");
			var kk = value.replace(/^{([\w|]+)}/,"");
			kk = getValue(kk);
			var key2 =  getKey(kk.match(/^[\w_$]+[\.\w_$\d]+/));
			var val2 = kk.replace(new RegExp("^" + key2), "");
			var isRequire = /\[\*\]/.test(val2);
			val2 = val2.replace(/\[\*\]/g,"");
			obj["param"] = obj["param"] || {};
			setParam(obj["param"], {
				"type":type
				,"key":key2
				,"isTopParam":!(/\./.test(key2.replace(/^\.|\.$/g,"")))
				,"value":getValue(val2, true)
				,"isRequire":isRequire
			});
			
			break;
		case "return":
			value = getValue(val);
			var type = value.match(/^{([\w.]+)}/,"")
			type = type && type.length > 1 ? type[1] : (type && type.length == 1 ? type[0] : "");
			var kk = value.replace(/^{[\w.]+}/,"");
			obj["returns"] = {
				"type":type
				,"value":getValue(kk,true)
			};
			break;
		case "author":
			obj.author = getValue(val,true);
			break;
		case "example":
			obj.example = getValue(val,true,replaceEnter);
			break;
		case "constructs":
			obj.constructs = getValue(val,true);
		case "version":
			obj.version = getValue(val,true);
			break;
		case "function":
			obj.function = getValue(val,true);
			break;
		case "property":
			obj.property = getValue(val,true);
		case "roclass":  		// 指定的类名
			obj.roclass = getValue(val,true);
		case "roobject":      	// 指定的名称空间
			obj.roobject = getValue(val,true);
		case "roname":			// 指定这个函数名或属性名是什么
			obj.roname = getValue(val,true);
		case "static":
			obj.isStatic = true;
			break;
		default:
			obj[key] = getValue(val,true);
			break;
	}
}

function setLevel(t,x){
	var prototypes = "prototypes";
	// ["constructs","roclass","roobject"];
	// 构造函数，只有类上的注释才有
	if(trim(x.constructs) != ""){
		t[x.constructs] = t[x.constructs] || {};
		$.extend(t[x.constructs],x);
		
	// 不是下划开头的（非私有属性或函数）
	}else if(x.roclass && !(/^_/.test(x.roname))){
		t[x.roclass] = t[x.roclass] || {};
		t[x.roclass][prototypes] = t[x.roclass][prototypes] || {};
		t[x.roclass][prototypes][x.roname] = t[x.roclass][prototypes][x.roname] || {};
		$.extend(t[x.roclass][prototypes][x.roname],x);
	}else if(x.roobject && !(/^_/.test(x.roname))){
		t[x.roobject] = t[x.roobject] || {};
		t[x.roobject]["roobject"] = x.roname;
		t[x.roobject][prototypes] = t[x.roobject][prototypes] || {};
		t[x.roobject][prototypes][x.roname] = t[x.roobject][prototypes][x.roname] || {};
		$.extend(t[x.roobject][prototypes][x.roname],x);
	}
}

// 解析param的层级
function setParam(params,opts){
	var key = opts.key || "";
	var keys = key.split(".");
	var key2 = null;
	var prms = params;
	var length = keys.length;
	for(var i = 0; i < length; i++){
		key2 = keys[i];
		if(i == 0 && i == length - 1){
			prms[key2] = prms[key2] || {};
			$.extend(prms[key2],opts);
			prms = prms[key2];
		}else if(i == length - 1){
			prms = prms || {};
			prms[key2] = prms[key2] || {};
			//prms[key2]["childs"] = prms[key2]["childs"] || {};
			$.extend(prms[key2],opts);
			prms = prms[key2]["childs"];
		}else{
			prms = prms || {};
			prms[key2] = prms[key2] || {};
			prms[key2]["childs"] = prms[key2]["childs"] || {};
			prms = prms[key2]["childs"];
		}
	}
}

function getValue(str,isRemoveEnter,replaceVal){
	var rev = str;
	if(isRemoveEnter === true){
		rev = rev.replace(/---##YWCHEN\d+##---/g,replaceVal || "");
	}
	
	if(replaceVal == null || replaceVal == ""){
		rev =  trim(rev);
	
	// 一般这种情况是示例的场合，此时需要将\t换成四个空格
	}else{
		//rev = rev.replace(//);
	}
	return rev || "";
}

function trim(str){
	var rev = str;
	rev = rev == null ? "" : rev;
	rev = (rev + "").replace(/^[\s*]*|[\s*]*$/g,"");
	return rev || "";
}

function getKey(match){
	if(!match){
		return "";
	}
	if(match.length > 1){
		return match[1] || "";
	}else if(match.length == 1){
		return match[0] || "";
	}else{
		return ""
	}
}
module.exports = {
    parse: function(str) {
    	return parse(str);
    }
};
