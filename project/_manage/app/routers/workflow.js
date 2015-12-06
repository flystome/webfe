var fs = require('fs');
var spawn = require('child_process').spawn;
var exec = require('child_process').exec;
var execFile = require('child_process').execFile;
var beautify = require('js-beautify').js_beautify;
var express = require('express');
var router = express.Router();

var child;

// define the home page route
router.get('/online-sd', function(req, res) {
    res.format({
        'application/json': function() {
            res.send({
                errno: 10000,
                errmsg: 'success',
                data: {
                    test: 1
                }
            })
        }
    })
});
router.get('/online-ls', function(req, res) {
    // res.send('Birds home page');
    child = execFile('test.sh', {
        cwd: __dirname + '/../tool/online'
    }, function(error, stdout, stderr) {
        var msg = stdout + stderr;
        if (error != null) {
            res.send(error);
        } else {
            res.send(stdout);
        }
    });
});
var server = ['internal.static.scloud.letv.com',
    'internal.static.hk.scloud.letv.com:20000'
];
server = JSON.stringify(server);
router.post('/online/generate', function(req, res) {
    console.log(req.body.online);
    var online = JSON.stringify(req.body.online);
    var writeTxt = ["var config = {server:", server, ",online:", online, "};", "module.exports = config;"].join('');
    fs.writeFile('./tool/online/upconfig.js', writeTxt, function(err) {
        if (err) {};
        res.send('成功生成配置文件！');
    });
});

router.get('/online/showconfig', function(req, res) {
    var ls = exec('cat upconfig.js', {
        cwd: './tool/online/'
    }, function(error, stdout, stderr) {
        if (error != null) {
            res.send(error);
        } else {
            var data = beautify(stdout, {
                indent_size: 2
            });
            res.format({
                'application/json': function() {
                    res.send({
                        data: data
                    });
                }
            });
        }
    });
});

router.get('/online/up', function(req, res) {
    var ls = exec('node up.js', {
        cwd: './tool/online/'
    }, function(error, stdout, stderr) {
        if (error != null) {
            res.send(error);
        } else {
            res.format({
                'application/json': function() {
                    res.send({
                        data: stdout
                    });
                }
            });
        }
    });
});


module.exports = function demopage(app) {
    app.use(router);
}
