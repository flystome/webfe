var read = require('./util/read.js');
var html = require('./util/html.js');
var decode = require('./util/decode.js');
var ejs = require('ejs');
var jsmap = require('../_node/config/jsmap.js');
var baseUrl = require('../_node/config/server.js').data.baseUrl;
var mpath = '../';


var menuList = {
	m : [],
	ext : [],
	le : [],
	rojs : []
};


var create = function(opt){
	//读取模版
	var tpl = html.getListTpl();
	var jslist = opt.jslist;
	var mod = opt.mod;
	var creatJsItem = function(js){
		//js文件
		var source = read.readFile(mpath + js);



		var arrjs = decode.parse(source);

		// console.log(arrjs)

		var data = arrjs;
		data.title = data.constructs || data.roobject;
		data.title = data.title.replace('RO.','');
		var name = data.title ;
		if(mod == 'm' || mod == 'ext' || mod == 'le'){
			data.demo = baseUrl + '/_demo/' + mod + '/' + data.constructs.toLowerCase() + '/1'
			//data.demo = '/_demo/' + mod + '/' + data.constructs.toLowerCase() + '/1'
		}
		
		//取注释数据
		//console.log(data.prototypes.open.param)
		
		{
			if(data.constructs){
				data.type = '类'
			}else{
				data.type = '方法'
			}
		}
		var url = mod+'/' + name + '.html';

		menuList[mod].push({
			name : name,
			url : url
		})
		//获取render后的模版
		var c = html.render(tpl,{
			data : data
		})

		//生成文件
		html.createFile('doc/html/' + url,c);
	}
	for(var i = 0 ; i < jslist.length; i ++){
		creatJsItem(jslist[i])
	}
}

var createMenuList = function(){
	var tpl = html.getIndexTpl();
	
	var c = html.render(tpl,{
		menuList : menuList,
		title : 'RockJs'
	})
	

	//生成文件
	html.createFile('doc/html/index.html',c);
}


create({
	mod : 'rojs',
	dest : 'doc',
	jslist : jsmap.docRo
});

create({
	mod : 'm',
	dest : 'doc',
	jslist : jsmap.m
});


create({
	mod : 'ext',
	dest : 'doc',
	jslist : jsmap.ext
});

create({
	mod : 'le',
	dest : 'doc',
	jslist : jsmap.le
});


createMenuList();
