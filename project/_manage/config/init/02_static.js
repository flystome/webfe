var express = require('express');
var expless = require('express-less');
var router = express.Router();

var path = require('path');
var merge = require('../../tool/common/merge');

//略过favicon，防止pending状态
router.get('/favicon.ico', function(req, res, next) {
    res.sendStatus(404);
});

module.exports = function demopage(app) {
    app.use(router);
    app.use('/static/css', expless('public/css', {
        compress: false,
        debug: app.get('env') == 'development'
    }));
    app.use('/static', express.static('public'));
    //非静态资源js进行tpl合并
    app.get('/*.js', function(req, res, next) {
        var query = req.originalUrl;
        query = '/' + query.substring(1, query.length).split('?')[0];
        var js = merge.readFile(path.resolve('./' + query));
        res.type('text/javascript');
        res.send(js);
    });
}
