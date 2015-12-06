var fs = require("fs");

// 测试时打开下面的，再打命令>node merge.js  ./mod/menu/1.0.1/tpl_menu.js就可以了，后面的文件参数整成自己的
// console.log(readFile(_getProcessArguments()[0]));

function readFile(js) {
    js = _trim(js);
    var buildJsPath = _getBuildPath(js);
    var htmlPath = null;

    try {
        htmlPath = buildJsPath.replace(/\.js$/, ".html");
    } catch (e) {
        htmlPath = "该JS没有模板文件";
    }

    var jsSource = _readSystemFile(js),
        htmlSource = _readSystemFile(htmlPath),
        jsTpl = null,
        htmlTpl = null,
        arg = _getProcessArguments(); // 不需要做压缩，所以用不上

    jsSource = jsSource.replace(/([\r\n]+)/g, function(a, b) {
        return b + "    ";
    });

    htmlTpl = 'var _html = ' + _format(htmlSource);
    jsTpl = ';\n(function() {\n    {html};\n    {js}\n})();\n'.replace(/{(\w+)}/g, function(a, b) {
        if (b == "html") {
            return htmlTpl;
        } else {
            return jsSource;
        }
    });

    return jsTpl;
}

function _readSystemFile(file) {
    var code = fs.readFileSync(file, 'utf-8');
    return code;
}

function _format(str) {
    var rev = str;
    rev = rev.replace(/^\s+/gm, " ");
    rev = JSON.stringify(rev);
    return rev;
}

// 只有第一次调用才返回正常结果，因为它是对原数据进行切割的
function _getProcessArguments() {
    var proArg = process.argv;
    return proArg.splice(2);
}

function canMerge(jsPath) {
    if (jsPath != _getBuildPath(jsPath)) {
        return true;
    } else {
        return false;
    }
}

function _getBuildPath(jsPath) {
    return _trim(jsPath).replace(/(\/*)tpl_(\S+?\.js)$/gi, function(a, b, c) {
        return b + c;
    })
}

function _trim(str) {
    if (str == null) {
        return ""
    } else {
        str += "";
        return str.replace(/^\s+|\s+$/g, "");
    }
}

module.exports = {
    readFile: readFile,
    canMerge: canMerge
}
