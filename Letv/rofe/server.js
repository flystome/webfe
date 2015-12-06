var port = '9001';
var config = './_node/config/';
var jsmap = require(config + 'jsmap.js');
var tool = require('./_tool/tool.js');
var resources = require(config + 'server.js').resources;
var ro = require(config + 'server.js').data.ro;
var fs = require("fs")
var ejs = require('ejs');
var expressLess = require('express-less');
var express = require('express');
var app = express();
var path = require('path');
var router = express.Router();
var formidable = require('formidable');
var fileTemp = "temp";// 上传文件后预览的目录


app.set('views', __dirname + '/view/'); //设置模版目录
app.engine('.html', require('ejs').__express);
// app.engine('.js', require('ejs').__express);
app.use('/view/', express.static(path.join(__dirname, '/view/')));
app.set('view engine', 'html');
app.get('/favicon.ico', function(req, res, next) {
    res.sendStatus(404);
});
app.get('/ro/js/ro.js', function(req, res, next) {
    var alljs = [];
    var js = jsmap.rojs;
    for(var i = 0 ; i < js.length; i ++){
        var item = fs.readFileSync(js[i],'utf-8');
        alljs.push(item);
    }
    var resjs = alljs.join('');
    // resjs = fs.readFileSync('build/ro/js/ro.js','utf-8');
    res.type('text/javascript');
    res.send(resjs);

})

app.get('/api', function(req, res, next) {
    var resjs = '{"type":"A"}';
    // resjs = fs.readFileSync('build/ro/js/ro.js','utf-8');
    res.type('text/html');
    function sleep(milliSeconds) {
        var startTime = new Date().getTime();
        while (new Date().getTime() < startTime + milliSeconds);
    };
    sleep(3000);
    res.send(resjs);

})

app.use('/doc', express.static(path.join(__dirname, '/_rojsdoc/doc'  )));


router.use(function(req, res, next) {
    var query = req.originalUrl;

    var testJson = function(){
        if(req.query.t || 'POST' == req.method){
            return 1
        }else{
            return 0
        }
    }
    query = query.substring(1, query.length).split('?')[0];
    var isFilter = function(str){
        var list = [".swf"];
        var regStr = [];
        for(var m = 0; m < list.length; m++){
            regStr.push(list[m] + "$");
        }
        return new RegExp(regStr.join("|"), "gi").test(str);
    }

    if (query == 'favicon.ico') {
        return
    }

    if(isFilter(query)){
        var item = fs.readFileSync(__dirname + "/" + query,'utf-8');
        sleep(2000);
        res.send(item);
        return;
    } else if (testJson()) {
        query = 'json' + req._parsedUrl.pathname;
        var routerQ = query + '.json';
         //console.log(routerQ)
    } else {
        var routerQ = query + '.html';
    }

    var data = {
        ro : ro
    }

    res.render( routerQ,data,function(err, html) {

        if(err){
          next(err);
        }else{
            res.send(ejs.render(html));
        }
    });
})




app.use('/'+resources, expressLess(__dirname + '/' + resources, {
    compress: false,
    relativeUrls: true
}));
app.use('/'+resources, express.static(path.join(__dirname, '/' + resources)));

// 上传文件后可以预览
app.use('/' + fileTemp, express.static(path.join(__dirname, '/' + fileTemp)));


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

// restart
app.get('/restart',function(req, res, next) {

    try{

        var timeid = setTimeout(function(){
            res && res.send("超时!");
        }, 30000);

        tool.run({
            req:req
            ,res:res
            ,next:next
            ,param:req.query
            ,timeid:timeid
        });


        //res.send(req.query);

    }catch(e){
        res.send(msgs.join("<br>") + "<br>--------<br>" + e.message);
    }

    // var timeid = null;
    // var msgs = [];
    // function callback(msg){
    //     //console.log(arguments);
    //     msgs.push(msg);
    //     clearTimeout(timeid);
    //     timeid = setTimeout(function(){
    //         res.send(msgs.join("<br>"));
    //     }, 2000);
    // }



    // var callfile = require('child_process');
    // var ip = '1.1.1.1';
    // ip = "127.0.0.1";
    // var username = 'ywchen';
    // var password = '252146';
    // var newpassword = '252146';


    // callfile.execFile('ls.sh',['1'],null,function (err, stdout, stderr) {
    // //callfile.execFile('ls.sh',['-H', ip, '-U', username, '-P', password, '-N', newpassword],null,function (err, stdout, stderr) {
    //     callback("是否大成功呢！");
    //     console.log(err, stdout, stderr);
    // });






    // var timeid = null;
    // var msgs = [];
    // function callback(msg){
    //     //console.log(arguments);
    //     msgs.push(msg);
    //     clearTimeout(timeid);
    //     timeid = setTimeout(function(){
    //         res.send(msgs.join("<br>"));
    //     }, 2000);
    // }

    // var exec = require('child_process').exec,
    //     //last = exec('last | wc -l');
    //     //last = exec('sudo netstat -lntp | grep node');
    //     last = exec('lsof -i -P | grep -E -i "^node\s*(\d+).*tcp.*9000\D.*listen.*"');

    // last.stdout.on('data', function (data) {
    //     callback('标准输出：' + data);
    // });

    // last.on('exit', function (code) {
    //     callback('子进程已关闭，代码：' + code);
    // });




    // var callfile = require('child_process');
    // //exec execFile
    // callfile.exec('ls.sh',function (err, stdout, stderr) {
    //     callback(err, stdout, stderr);
    //     res.send('1234');
    // });


});

// 上传
app.post('/:upload?', function(req, res){

    var form=new formidable.IncomingForm();
    form.uploadDir="./" + fileTemp;
    var height = "";
    var width = "";
    var path = "";

    form.parse(req,function(error,fields,files){
        for (var file in files) {
            outName = Math.ceil((Math.random() * 10000000)) + "_" + files[file].name;
            fs.renameSync(files[file].path,form.uploadDir + "/" + outName);
        };
        res.send('{"errno":"10000","error":"","data":["/' + fileTemp + "/" + outName +'"]}');
    });

    // res.writeHead(200,{"Content-Type":"text.html"});
    // res.write("received image:<br/>");
    // res.write("<img src='./TEMP/undefined.png'/>");
    // res.end();

    // res.send('{"errno":"10000","error":"","data":["' + outPath +'"]}');

});

app.use('/', router);
app.listen(port);
console.log(port)
