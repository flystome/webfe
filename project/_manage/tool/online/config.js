var path = require('path');

var feDir = path.normalize(__dirname + '/../../../..');
module.exports = {
    feDir: feDir,
    onlineDir: path.normalize(feDir + '/letvs/online/'),
    staticDir: path.normalize(feDir + '/letvs/online/static/'),
    toolDir: path.normalize(feDir + '/letvs/online/_tool/'),
};
