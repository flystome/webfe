var path = require('path');
var ejs = require('ejs');
var Mock = require('mockjs');
var express = require('express');
var router = express.Router();

router.use(function(req, res, next) {
    var url = req.originalUrl,
        renderer;
    if (req.query.t || 'POST' == req.method) {
        renderer = '../../json' + req.path + '.js';
        res.render(renderer, {
            data: req,
            Mock: Mock
        });
    } else {
        next();
    }
});

module.exports = function demopage(app) {
    app.use(router);
}
