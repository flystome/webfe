var fs = require('fs');
var path = require('path');


function walk(dir, options, callback) {
    fs.readdir(dir, function(err, list) {
        if (err) {
            return callback(err);
        }

        if (list.length === 0) {
            return callback(null, []);
        }

        callback(null, list);
    });
}

walk('/User/x4storm/Work/fe', {}, function(err, list) {
    if (err) {
        console.log(err);
    } else {
        console.log(list);
    }
})
