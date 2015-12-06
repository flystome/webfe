var ejs = require('ejs');
module.exports = function demopage(app) {
    // code update
    app.get('/svnup', function(req, res, next) {
        var svn = require("svn-interface");
        var option = {
            "username": "heliang",
            "password": "nihao@1234"
        };
        svn.update(__dirname, option, function up(e, r) {
            res.send('<div>' + __dirname + '----' + r + '</div>')
        });
    });
    app.use(function(req, res, next) {
        var url = req.originalUrl.slice(1);
        var renderer = req.path.slice(1);
        var data = {
            staticUrl: app.get('staticUrl'),
            query: req.query,
            cat1: url.split('/')[0],
            cat2: url.split('/')[1],
            cat3: url.split('/')[2]
        };
        res.render(renderer, {
            data: data
        }, function(err, html) {
            if (err) {
                next(err);
            } else {
                res.send(ejs.render(html));
            }
        });
    });
}
