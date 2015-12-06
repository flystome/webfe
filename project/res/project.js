var fs = require("fs")
var port = require('../config/host.js').port||'8888';
var resroot = require('../config/host.js').res;
var express = require('express');
var modelName = '开发';
var expressLess = require('express-less');
var express = require('express');
var app = express();
var expressLess = require('express-less');
var merge = require('./_tool/merge.js');
var onlineConfig = require('./onlineConfig.js');
var modeljs = require('./_tool/mergeModel.js');

// var ejs = require('ejs');
// app.engine('.js', require('ejs').__express);
// app.engine('.html', require('ejs').__express);

// console.log('resroot:',resroot)
// console.log('host:',require('../config/host.js'))
app.use('', expressLess(__dirname + '/' + resroot, {
    compress: false,
    relativeUrls: true
}));
var path = require('path');

app.get('/*.js', function(req, res, next) {
    var query = req.originalUrl;
    query = '/' + query.substring(1, query.length).split('?')[0];

    console.log(query)
    //开发环境合并tpl
    if (resroot == 'src') {
        var content = null;
        if (/tpl_/g.test(query)) {
            var js = merge.readFile(resroot + '/' + query);
        } else if ((content = isMerge(query)) !== false) {
            var js = content;
        } else {
            var js = fs.readFileSync(resroot + query, 'utf-8');
        }

    } else {
        var js = fs.readFileSync(resroot + query, 'utf-8');
    }



    res.type('text/javascript');
    res.send(js);

});


app.get('/*.html', function(req, res, next) {
    var query = req.originalUrl;
    query = '/' + query.substring(1, query.length).split('?')[0];

    // console.log(query)
    var js = fs.readFileSync(resroot + query, 'utf-8');
    //开发环境合并tpl
    // if (resroot == 'src') {
    //     var content = null;
    //     if (/tpl_/g.test(query)) {
    //         var js = merge.readFile(resroot + '/' + query);
    //     } else if ((content = isMerge(query)) !== false) {
    //         var js = content;
    //     } else {
    //         var js = fs.readFileSync(resroot + query, 'utf-8');
    //     }

    // } else {
    //     var js = fs.readFileSync(resroot + query, 'utf-8');
    // }



    // res.type('text/javascript');
    res.send(js);

});


app.use('/', express.static(path.join(__dirname, '/' + resroot)));
// respond
app.get('/svnup', function(req, res, next) {

    var svn = require("svn-interface");
    var option = {
        "username": "heliang",
        "password": "nihao@1234"
    }


    svn.update(__dirname, option, function up(e, r) {

        console.log(r)

        res.send('<div>' + __dirname + '----' + r + '</div>')
    })

});
app.get('/clean', function(req, res, next) {

    var svn = require("svn-interface");
    var option = {
        "username": "heliang",
        "password": "nihao@1234"
    }
    svn.cleanup(__dirname, {}, function up(e, r) {
        res.send('<div>cleanup suc!!</div>')
    })



});


app.listen(port);
if (resroot == "dest") {
    modelName = "上线"
}
console.log('port is :' + port + "---" + modelName + '环境')


function isMerge(filePath) {
    var mergeModelJs = onlineConfig.mergeModelJs;
    var files = null;
    for (var key in mergeModelJs) {
        var item = mergeModelJs[key];
        var dest = item.dest;
        if (dest == filePath || dest == ("/" + filePath)) {
            files = item
        }
    }

    var rev = files != null ? modeljs.getModelContent(files, resroot) : false;
    return rev;
}
