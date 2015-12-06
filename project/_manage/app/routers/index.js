module.exports = function routers(app) {
    app.get('/', function(req, res) {
        res.render('index', {
            data: {
                staticUrl: app.get('staticUrl')
            }
        });
    });
    // router config
    var routeWorkflow = require('./workflow')(app);
    var routeDemo = require('./demopage')(app);
}
