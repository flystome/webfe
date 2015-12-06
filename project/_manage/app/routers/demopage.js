var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/demo', function(req, res, next) {
    // res.render('index', { title: 'Express' });
    res.render('demo');
});

module.exports = function demopage(app) {
    app.use(router);
}
