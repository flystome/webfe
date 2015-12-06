var fs = require('fs');
var request = require('request');

request.post({
    url: 'http://localhost:5555',
    formData: {
        my_file: 'test'
    }
}, function(err, res, body) {
    if (!err && res.statusCode == 200) {
        console.log(body);
    } else {
        console.log(err, res);
    }
});
