;
(function(){

    var timeid = null;
    var msgs = [];

    function callback(msg,type,opt){
        for(var i = 0; i < arguments.length; i++){
            //console.log("callback:",arguments[i]);
        }
    }

    function log(msg, type, opt){
        opt = opt || {};
        var sendMsg = null;
        msg = msg == null ? "" : msg + "";
        //console.log(type,":",msg)
        var sendMsgs = msg.split(/\\n/g);
        for(var m = 0; m < sendMsgs.length; m++){
            sendMsg = sendMsgs[m].replace(/^"|"$/g, "") || "";
            callback(sendMsg, type, opt);
            send(sendMsg,opt);
        }
    }

    function send(msg,opt){
        opt = opt || {}
        opt.res = opt.res || {
            send:function(){
                console.log("***********");
            }
        }
        var res = opt.res
        var tmd = opt.timeid;
        msgs.push(msg.replace(/[\r\n]/g,"<br>").replace(/\[99;55;31m/g,"").replace(/\[22;33;35m/g,"").replace(/\[5m/g,"").replace(/\[0m/g,"").replace(/\\033/g,""));
        clearTimeout(timeid);
        clearTimeout(tmd);
        timeid = setTimeout(function(){
            try{
                res.send(msgs.join("<br>"));
            }catch(e){

            }
        }, 2000);
    }

    // opt:req, res, next
    function run(opt){
        opt = opt || {};
        msgs = [];
        //http:\/\/www.taocms.org/809.html
        var childProcess;
        var param = ["./_tool/resetServer.sh"];
        try {
            childProcess = require("child_process");
        } catch (e) {
            callback(e, "error",opt);
        }
        if(opt && opt.param && opt.param.arg){
            param.push(opt.param.arg);
        }
        if (childProcess) {
            // resetServer.sh stopServer.sh
            var last = childProcess.execFile("/bin/bash", param, null, function (err, stdout, stderr) {
                // log(JSON.stringify(err), 'err',opt);
                // log(JSON.stringify(stdout), 'stdout',opt);
                // log(JSON.stringify(stderr), 'stderr',opt);
            });
            callback("Done", "debug",opt);


            last.stdout.on('data', function (data) {
                log(data, "标准输出",opt);
            });

            last.on('exit', function (code) {
                log("子进程已关闭:" + code, "子进程已关闭，代码",opt);
            });
        } else {
            callback("Unable to require child process", "warning",opt);
        }
    }

    // var callfile = require('child_process');
    // callfile.execFile('ls.sh',['1'],null,function (err, stdout, stderr) {
    //     console.log(err, stdout, stderr);
    // });     


    // var exec = require('child_process').exec,
    // execFile = require('child_process').execFile,
    // //last = exec('last | wc -l');
    // last = execFile('ls.sh',[1],null,function(){
    //     callback(arguments);
    // });


    // last.stdout.on('data', function (data) {
    //     callback('标准输出：' + data);
    // });

    // last.on('exit', function (code) {
    //     callback('子进程已关闭，代码：' + code);
    // });

    try{
        module.exports = {
            run:run
        }
    }catch(e){
        run();
    }
})();
