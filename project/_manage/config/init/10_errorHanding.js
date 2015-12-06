var morgan = require('morgan');

module.exports = function viewEngin(app) {
    // better log
    app.use(morgan(':method :status :url :response-time ms'));
    app.use(function(req, res) {
        res.type('text/plain');
        res.status(404);
        res.send('404 - Not Found');
    });
    app.use(function(err, req, res, next) {
        console.error(err.stack);
        res.type('text/plain');
        res.status(500);
        res.send('500 - Server Error');
    });
}
