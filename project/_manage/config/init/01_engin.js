var path = require('path');
var ejs = require('ejs');
var bodyParser = require('body-parser');

module.exports = function viewEngin(app) {
    // view engine setup
    app.set('views', path.join(__dirname, '../../app/views'));
    app.engine('.html', ejs.__express);
    app.engine('.js', ejs.__express);
    app.set('view engine', 'html');
    // parse request body
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({
        extended: true
    }));
};
