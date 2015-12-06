var fs = require("fs");
var read = require('./read.js');
var ejs = require('ejs');
module.exports = {
    createFile: function(name,data) {
        fs.writeFileSync(name, data);
        console.log(name + ': suc!')
    },
    getListTpl : function(data){
    	var head = read.readFile('./tpl/_head.html');
    	var list = read.readFile('./tpl/list.html');
    	var foot = read.readFile('./tpl/_foot.html');
    	return head + list + foot;
    },
    getIndexTpl : function(data){
        // var head = read.readFile('./tpl/_head.html');
        var list = read.readFile('./tpl/index.html');
        // var foot = read.readFile('./tpl/_foot.html');
        return list;
    },
    render : function(html,data){
    	return ejs.render(html,data)
    }
};