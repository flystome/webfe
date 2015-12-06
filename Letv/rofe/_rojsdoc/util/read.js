var fs = require("fs");


module.exports = {
    readFile: function(file) {
        var code = fs.readFileSync(file, 'utf-8');
        return code;
    }
};
