
var fs = require("fs");

function Sync(opt){
    this.input = opt.input;
    this.outer = opt.outer;
    this.types = opt.types;
    this.unTypes = opt.unTypes;
    this.callback = opt.callback;
    this.files = [];

    this._init();
}

Sync.prototype = {
    _init:function(){
        var me = this;
        this._getFileList(this.input,function(files){
           me.callback(files);
        });
    }
    ,forList:function(files){
        var me = this;
        var file = null;
        for(var i = 0; i < files.length; i++){
            file = files[i];
            this.copy(file);
        }
        me.callback && me.callback(function(){
            me.remove();
        });
    }
    ,_checkCopy:function(file){
        if(this._isInUnType(file)){
            return false;
        }else if(this._isInType(file)){
            return true;
        }else{
            return false;
        }
    }
    ,_isInType:function(file){
        var types = this.types || [];
        var type = this._getExtend(file).toUpperCase();
        for(var n = 0; n < types.length; n++){
            if((types[n] || "").toUpperCase() == type){
                return true;
            }
        }
        return false;
    }
    ,_isInUnType:function(file){
        var types = this.unTypes || [];
        var type = this._getExtend(file).toUpperCase();
        for(var n = 0; n < types.length; n++){
            if((types[n] || "").toUpperCase() == type){
                return true;
            }
        }
        return false;
    }
    ,_readSystemFile:function(file){
        var code = fs.readFileSync(file, 'utf-8');
        return code;
    }
    ,_getFileName:function(file){
        var index = file.lastIndexOf("/");
        var fileName = file.substr(index + 1);
        return fileName;
    }
    ,_getExtend:function(file){
        var fileName = this._getFileName(file);
        var index = fileName.lastIndexOf(".");
        var extend = fileName.substr(index + 1);
        return extend;
    }
    ,_getFileList:function(dir,callback,level){

        level = level || 0;
        var me = this;
        var hasDir = false;
        var dirList = fs.readdirSync(dir);
        dirList.forEach(function(item){
            if(fs.statSync(dir + '/' + item).isDirectory()){
                hasDir = true;
                me._getFileList(dir + '/' + item,callback,level + 1);
            }else{
                me.files.push(dir + '/' + item);
            }
        });
        if(level == 0){
            callback(me.files);
        }
    }
    ,copy:function(file,a_input){
        var me = this;
        var input = a_input || this.input;
        var outer = this.outer;
        var path = file.replace(new RegExp("^" + input),"");
        var index = path.lastIndexOf("/");
        var dir = path.substr(0,index + 1);
        var fileName = path.substr(index + 1);
        if(!me._checkCopy(file)){
            return;
        }
        var fileContent = null;
        fileContent = me._readSystemFile(file);

        this.createFolder(outer,dir);

        console.log("FM:", file);
        console.log("TO:",outer + path);
        //console.log(fileContent)
        //fs.
        try {
            //fs.unlinkSync(outer + path);
            fs.writeFileSync(outer + path, fileContent,{
                "encoding":"utf-8"
                ,"mode":"0777"
                ,"flag":"w"
            });
        }catch(e){
            console.log(e)
        }
    }
    ,remove:function(){
    }
    ,createFolder:function(root,dir){
        var dirs = dir.split("\/");
        var path2 = "";

        for(var j = 0; j < dirs.length; j++){
            if(dirs[j] == "")continue;
            path2 += "/" + dirs[j];

            var dirPath = root + path2;
            if(!fs.existsSync(dirPath)){
                fs.mkdirSync(dirPath,"0777");
            }
        }
    }
}



module.exports = Sync



