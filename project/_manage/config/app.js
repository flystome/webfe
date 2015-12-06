var path = require('path');
var express = require('express');
var app = express();

app.set('rootDir', path.join(__dirname, '..'));
app.set('staticUrl', 'http://localhost:8888');

require('./init/01_engin')(app); //设置模版引擎
require('./init/02_static')(app); //设置静态资源
require('../app/routers/index')(app); //加载路由
require('./init/04_mockdata')(app); //模拟数据
require('./init/05_defaultRouter')(app); //模拟数据
require('./init/10_errorHanding')(app); //错误及日志处理

module.exports = app;
