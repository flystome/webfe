;
define(ROCK.seaConfig.alias.cutpicture, function(require, exports, module) {

    /** 图片裁截
     *
     *  @author ywchen(陈余文)
     *  @constructs Cutpicture
     *  @date 2015.07.21
     *  @version 1.0.1
     *  @param {Object} opts                        [*]参数
     *  @param {HTMLElement} opts.container         [*]被缩放的容器
     *  @param {Object} opts.img                    图片Dom,必须是container容器的子Dom；查找方式为container.find(img),默认值是”img“
     *  @param {HTMLElement} opts.plus              放大的按钮DOM
     *  @param {HTMLElement} opts.subtract          缩小的按钮DOM
     *  @param {HTMLElement} opts.view              恢复初始按钮DOM
     *  @param {HTMLElement} opts.levelDom          等级显示容器
     *  @param {HTMLElement} opts.progressContainer 进行条容器
     *  @param {HTMLElement} opts.progressDom       进行条容器进度的容器
     *  @param {HTMLElement} opts.dotDom            进行条容器上的点
     *  @param {Number} opts.maxLevel               最大放大等级，默认10级
     *  @param {Number} opts.offsetX                X偏移值
     *  @param {Number} opts.speed                  每次放大或缩小的数值；默认为”10“px;以宽为参考
     *  @param {Number} opts.cutWidth               裁后的最终宽；默认是0，即按图片显示的大小，当为0或null是都是图片显示的大小；它必须是cutWidth/cutHeight = $(opts.container).width() / $(opts.container).height(); getData的数据会根据cutWidth / $(opts.container).width()的比例，计算出其它值 
     *  @param {Number} opts.cutHeight              裁后的最终高；默认是0，即按图片显示的大小，当为0或null是都是图片显示的大小；它必须是cutWidth/cutHeight = $(opts.container).width() / $(opts.container).height(); getData的数据会根据cutWidth / $(opts.container).width()的比例，计算出其它值
     *  @param {HTMLElement} opts.load              控件的图片加载中
     *  @param {HTMLElement} opts.success           控件初始化成功 OR 图片加载成功
     *  @param {HTMLElement} opts.fail              控件初始化失败 OR 图片加载失败
     *  @return {Cutpicture} Cutpicture的实例
     *  @example
            new Cutpicture({
                container:".picBar"             // 控件容器Dom
                ,plus:".J_ZoomUp"               // +按钮
                ,subtract:".J_ZoomDown"         // -按钮
                ,view:".J_base"                 // 恢复初始按钮
                ,maxLevel:30                    // 放大等级，默认10级
                ,progressContainer:$(".pro")    // 进行条容器
                ,progressDom:$(".l")            // 进行条容器进度的容器
                ,dotDom:$(".dot")               // 进行条容器上的点
                ,offsetX:6                      // 偏移值
                ,speed:40                       // 每次放大或缩小的数值；默认为10px;以宽为参考；
                ,cutWidth:1500
                ,cutHeight:1515
            });
     */
    var Cutpicture = function(opts) {

        // 继承父类属性
        ROCK.core.BaseClass.call(this);

        // 参数的默认值配置
        var opt = {
            container:""                // [*]被缩放的容器
            ,img:"img"                  // 图片Dom,必须是container容器的子Dom；查找方式为container.find(img),opt.img和opt.imgSrc只能使用其中一个,当imgSrc有值就优先使用；无值时默认使用img;默认值是”img“
            ,imgSrc:""                  // 图片的SRC，自动在opt.container容器里插入img标签；opt.img和opt.imgSrc只能使用其中一个,当imgSrc有值就优先使用；无值时默认使用img;无默认值
            ,plus:""                    // 放大的按钮DOM
            ,subtract:""                // 缩小的按钮DOM
            ,view:""                    // 恢复初始按钮DOM
            ,levelDom:""                // 等级显示容器
            ,progressContainer:""       // 进行条容器
            ,progressDom:""             // 进行条容器进度的容器
            ,dotDom:""                  // 进行条容器上的点
            ,maxLevel:10                // 最大放大等级，默认10级
            ,offsetX:0                  // X偏移值
            ,speed:10                   // 每次放大或缩小的数值；默认为10px;以宽为参考；
            ,load:function(){

            }
            ,success:function(){        // 控件初始化成功

            }
            ,fail:function(){           // 控件初始化失败

            }
        }

        // 重置配置
        $.extend(opt, opts);

        // 参数
        this.opt = opt;

        // 默认等级10
        this.level = 0;

        // 图片加载令牌
        this.lastTime = null;

        var me = this;
        var imgSrc = $.trim(opt.imgSrc);
        var imgElemet = this.getImgDom();
        if(imgSrc == ""){
            imgSrc = imgElemet.attr("src");
        }
        imgSrc = $.trim(opt.imgSrc);

        // 有URL时加载图片
        imgSrc != "" && me.loadImg(imgSrc);
        
    }

    // 继承原型
    ROCK.core.BaseClass.extend(Cutpicture);

    $.extend(Cutpicture.prototype, {
        
        /** 初始化预处理
         *
         *  @roclass Cutpicture
         *  @roname _init
         *  @return {Cutpicture} Cutpicture的实例
         */
        _init:function(){

            var me = this;
            var opt = me.opt || {};
            var container = $(this.opt.container);
            var imgElemet = this.getImgDom();



            // 禁止图片被拖拽
            imgElemet.bind("dragstart ondragend mousedown", function(e){

                e.preventDefault();
                e.stopPropagation();

                return false;
            });

            // 绑定事件
            this._bind();

            // 初始图片的拖拽
            new Drag({
               isEnable:true
               ,drag:imgElemet
               ,box:imgElemet
               ,area:container
               ,offset:{x:0,y:0}
               ,type:"C"
            });

            // 初始放大等级的拖动
            new Drag({
               isEnable:true
               ,drag:$(this.opt.dotDom)
               ,box:$(this.opt.dotDom)
               ,area:$(this.opt.progressContainer)
               ,offset:{x:0,y:0}
               ,type:"L"
               ,move:function(){

                    var width = $(me.opt.progressContainer).width() - $(me.opt.dotDom).width();
                    var left = $(me.opt.dotDom).position().left;

                    var unit = width / me.opt.maxLevel;
                    var level = left / unit;
                    me.zoom(level)
               }
            });

            return this;
        }

        /** 绑定事件
         *
         *  @roclass Cutpicture
         *  @roname _bind
         *  @return {Cutpicture} Cutpicture的实例
         */
        ,_bind:function(){
            var me = this;
            var opt = me.opt || {};

            // 绑定+事件
            $(opt.plus).bind("click", function(){
                me.zoom("+");
            });

            // 绑定-事件
            $(opt.subtract).bind("click", function(){
                me.zoom("-");
            });

            // 绑定恢复初始事件
            $(opt.view).bind("click", function(){
                me.level = 0;
                me.zoom("-");
            });

            return this;
        }

        ,setImg:function(imgSrc, img){

            var me = this;
            var container = $(me.opt.container);
            var imgElemet = me.getImgDom();

            if(imgElemet.length == 0){
                imgElemet = $('<img class="J_roCutPictureImg" src="">');
                container.append(imgElemet);
            }

            imgElemet.on("load", function(){
                me.loadSuccessedImg(imgSrc, img);
            });

            imgElemet.attr("src", imgSrc).show();
        }

        /** 图片的放大或缩小接口
         *
         *  @roclass Cutpicture
         *  @roname zoom
         *  @param {String|Number} type     取值范围 “+”，放大；“-”缩小；其它仅能为数值型，即放大的级别，可为小数
         *  @return {Cutpicture} Cutpicture的实例
         */
        ,zoom:function (type){

            var me = this;
            var opt = me.opt;

            var maxZoom = opt.maxLevel || 0;
            var proDom = $(opt.progressContainer);
            var _width = proDom.width() - ($(opt.dotDom).width() / 2);
            var curLevel = me.level;
            if(type == "+"){
                if(Math.ceil(curLevel) != curLevel){
                    curLevel = Math.ceil(curLevel);
                }else{
                    curLevel++;
                }
            }else if(type == "-"){
                if(Math.floor(curLevel) != curLevel){
                    curLevel = Math.floor(curLevel);
                }else{
                    curLevel--;
                }
            }else{
                curLevel = (type == null || isNaN(type)) ? 0 : type;
            }
            
            curLevel = curLevel > maxZoom ? maxZoom : (curLevel < 0 ? 0 : curLevel);

            var curWid = _width * curLevel / maxZoom;
            $(opt.progressDom).width(curWid);
            $(opt.dotDom).css("left",curWid - (opt.offsetX || 0));

            me.scale(curLevel);
            me.level = curLevel;

            return this;
        }

        /** 获取相关数据，如原始图片大小(width,height)、当前的图片大小(width,height)、当前的显示起点(x,y)
         *
         *  @roclass Cutpicture
         *  @roname getData
         *  @return {Object} 相关数据，如原始图片大小(width,height)、当前的图片大小(width,height)、当前的显示起点(x,y)
                    {
                        "x":当前的显示起点的x
                        ,"y":当前的显示起点的y
                        ,"owidth":原始图片大小宽
                        ,"oheight":原始图片大小高
                        ,"curWidth":、当前的图片大小的宽
                        ,"curHeight":、当前的图片大小的高
                        ,"cutWidth":、裁截的图片大小的宽
                        ,"cutHeight":、裁截的图片大小的高
                    }
         */
        ,getData:function(){

            var me = this;
            var opt = me.opt;
            var paramCutWidth = parseInt(opt.cutWidth || 0);
            var paramCutHeight = parseInt(opt.cutHeight || 0);
            var mathcale = 1;
            var container = $(opt.container);
            var imgElemet = me.getImgDom();
            // 图片原尺寸
            var initWidth = imgElemet.attr("data-width");
            var initHeight = imgElemet.attr("data-height");
            // 当前图片的尺寸
            var curWidth = imgElemet.width();
            var curHeight = imgElemet.height();
            // 当前可视区域的左上起始点离图片的左上角的像素
            var leftTop = imgElemet.position() || {left:0,top:0}
            var left =  leftTop.left.toFixed(2);
            var top =  leftTop.top.toFixed(2);

            var cutWidth = container.width();
            var cutHeight = container.height();

            // 输出变量
            var outCurWidth = null;             // 当前的图片大小的宽
            var outCurHeight = null;            // 当前的图片大小的高
            var outCutWidth = null;             // 裁截的图片大小的宽
            var outCutHeight = null;            // 裁截的图片大小的高


            // 添加比例计算
            if(!isNaN(paramCutWidth) && !isNaN(paramCutHeight) && 
                paramCutWidth != 0 && paramCutHeight != 0 && cutHeight != 0 &&
                // 误差值
                Math.abs((paramCutWidth / paramCutHeight) - (cutWidth / cutHeight)) < 0.01){

                mathcale = paramCutWidth / cutWidth;

                left =  (leftTop.left * mathcale).toFixed(2);
                top =  (leftTop.top * mathcale).toFixed(2);
                outCurWidth = curWidth * mathcale;
                outCurHeight = curHeight * mathcale;
                outCutWidth = paramCutWidth;
                outCutHeight = paramCutHeight;

            }else{
                outCurWidth = curWidth;
                outCurHeight = curHeight;
                outCutWidth = cutWidth;
                outCutHeight = cutHeight;
            }

            var rev = {
                "x":left                        // 当前的显示起点的x
                ,"y":top                        // 当前的显示起点的y
                ,"owidth":initWidth             // 原始图片大小宽
                ,"oheight":initHeight           // 原始图片大小高
                ,"curWidth":outCurWidth         // 当前的图片大小的宽
                ,"curHeight":outCurHeight       // 当前的图片大小的高
                ,"cutWidth":outCutWidth         // 裁截的图片大小的宽
                ,"cutHeight":outCutHeight       // 裁截的图片大小的高
            }

            return rev;
        }

        /** 设置显示级别
         *
         *  @roclass Cutpicture
         *  @roname scale
         *  @param {Number} level     放大级别，可为小数
         *  @return {Cutpicture} Cutpicture的实例
         */
        ,scale:function(level){

            level = level || 0;

            var me = this;
            var opt = me.opt;
            var container = $(this.opt.container);
            var imgElemet = this.getImgDom();
            var minWidth = parseInt(imgElemet.attr("data-minwidth"), 10);
            var minHeight = parseInt(imgElemet.attr("data-minheight"), 10);
            var speed = opt.speed;

            var sclW = speed * level;
            var sclH = parseInt((minHeight * sclW) / minWidth);

            var bwidth = container.width();
            var bheight = container.height();

            var iwidth = minWidth + sclW;
            var iheight = minHeight + sclH;

            // 中心点比例值
            var center = this.getCenter();

            // 中心点像素值
            var centerW = iwidth * center.x;
            var centerY = iheight * center.y;

            // 左上
            var left = 0 - Math.abs(centerW - (bwidth / 2));
            var top = 0 - Math.abs(centerY - (bheight / 2));

            // 右下
            left = (left < 0 && left + iwidth < bwidth) ? bwidth - iwidth : left;
            top = (top < 0 && top + iheight < bheight) ? bheight - iheight : top;
            //top = top >= (iheight - bheight) ? top : iheight - bheight;

            left = left > 0 ? 0 : left;
            top = top > 0 ? 0 : top;

            // 中心点的定位
            imgElemet.css({
                "width":iwidth
                ,"height":iheight
                ,"left":left
                ,"top":top
            });

            return this;
        }

        /** 获取图片Dom
         *
         *  @roclass Cutpicture
         *  @roname getImgDom
         *  @return {HTMLElement} 图片Dom
         */
        ,getImgDom:function(){

            var container = $(this.opt.container);
            return container.find(this.opt.img);
        }

        /** 初始化视图到最小级别
         *
         *  @roclass Cutpicture
         *  @roname initView
         *  @return {Cutpicture} Cutpicture的实例
         */
        ,initView:function(img){

            var container = $(this.opt.container);
            var imgElemet = this.getImgDom();

            // var width = imgElemet.attr("data-width") || img.width;
            // var height = imgElemet.attr("data-height") || img.height;

            var width = img.width;
            var height = img.height;

            var wh = this._getScaleWH(width, height, container.width(), container.height());

            // 限定图片最大的放大为图片的最大宽；另；当图片小于可视区域时自动变成填满
            //this.opt.speed = (width - container.width()) / this.opt.maxLevel;
            //this.opt.speed = this.opt.speed < 0 ? 0 : this.opt.speed;

            imgElemet.attr({
                "data-width":width
                ,"data-height":height
                ,"data-minwidth":wh.width
                ,"data-minheight":wh.height
            }).css({
                "width":wh.width
                ,"height":wh.height
                ,"left":0
                ,"top":0
            });

            return this;
        }

        /** 初始化视图到最小级别
         *
         *  @roclass Cutpicture
         *  @roname loadImg
         *  @param {String}      imgUrl      图片地址
         *  @param {Function}    callback    回调
         *                                  参数:①img对象{object}，②成功或失败的标识{boolean},true为成功
         *  @return {Cutpicture} Cutpicture的实例
         */
        ,loadImg:function(imgSrc){

            var me = this;
            var opt = me.opt || {};
            // 最多重试次数
            var cnt = 3;

            // 图片加载中
            opt.load && opt.load.call(me);
            var ts = new Date().getTime() + Math.ceil(Math.random() * 1000000);
            me.lastTime = ts;

            var load = function(){

                // 加载图片
                me._loadImg(imgSrc, function(img, isSuccessed){

                    // 令牌不是最新的令牌都要丢弃掉
                    if(me.lastTime != ts){
                        return 
                    }

                    cnt--;

                    // 若重试规定次数内未成功，回调失败
                    if(!isSuccessed && cnt < 0){
                        // 图片加载失败
                        opt.fail && opt.fail.call(me);

                    // 若加载图片失败但未到规定的重试次数；继续重试
                    }else if(!isSuccessed){

                        setTimeout(function(){
                            load();
                        }, 300);

                    // 加载成功时，初始化控件，并回调成功
                    }else{

                        me.setImg(imgSrc, img);

                        // 组件初始化
                        me.initView(img);
                        
                    }
                });
            }

            load();
        }

        ,loadSuccessedImg:function(imgSrc, img){

            var me = this;
            var opt = me.opt || {};
            // 初始化大小，默认0级
            me.zoom(0);

            if(me.isLoaded !== true){
                me._init(img);
                me.isLoaded = true;
            }

            // 图片加载成功
            opt.success && opt.success.call(me, imgSrc);
        }

        /** 初始化视图到最小级别
         *
         *  @roclass Cutpicture
         *  @roname _loadImg
         *  @param {String}      imgUrl      图片地址
         *  @param {Function}    callback    回调
         *                                  参数:①img对象{object}，②成功或失败的标识{boolean},true为成功
         *  @return {Cutpicture} Cutpicture的实例
         */
        ,_loadImg:function(imgUrl, callback){
            var img = new Image();
            var clbk = function(isSuccessed){
                if(typeof(callback) == "function"){
                    callback(img, isSuccessed);
                }
            }
            
            $(img).bind("load", function(){
                clbk(true);
            }).css({
                "position":"absolute"
                ,"top":"-9999px"
                ,"left":"-9999px"
            });
            
            $(img).bind("error", function(){
                clbk(false);
            });
            
            $(img).attr("src", imgUrl);
        }

        /** 获取可视区域中心点
         *
         *  @roclass Cutpicture
         *  @roname getCenter
         *  @return {Object} 获取可视区域中心点
         */
        ,getCenter:function(){

            var container = $(this.opt.container);
            var imgElemet = this.getImgDom();

            var leftTop = imgElemet.position() || {left:0,top:0}
            var left = leftTop.left;
            var top = leftTop.top;

            var iwidth = imgElemet.width();
            var iheight = imgElemet.height();

            var bwidth = container.width();
            var bheight = container.height();

            var halfW = bwidth / 2;
            var halfH = bheight / 2;

            // 当前中心点的像素
            var centerW = Math.abs(left) + halfW;
            var centerH = Math.abs(top) + halfH;

            // 当前中心点的整体比例
            var sclW = (centerW / iwidth).toFixed(3);
            var sclH = (centerH / iheight).toFixed(3);

            return {
                x:sclW
                ,y:sclH
            }
        }

        /** 取得图片显示的宽高值 ---使用了递归处理
         *
         *  @roclass Cutpicture
         *  @roname _getScaleWH
         * @param {Number} width 图片真实宽度
         * @param {Number} height 图片真实高度
         * @param {Number} maxWidth 最大宽度
         * @param {Number} maxHeight 最大高度
         */
        ,_getScaleWH: function(width, height,maxWidth,maxHeight){
            var defWidth = maxWidth || 300;
            var defHeight = maxHeight || 300;
            var reWidth,reHeight;

            width = parseInt(width, 10);
            height = parseInt(height, 10);
            defWidth = parseInt(defWidth, 10);
            defHeight = parseInt(defHeight, 10);

            // 比率谁小
            var zoomWidth = width / defWidth;
            var zoomHeight = height / defHeight;

            // 图片不能小于指定框
            // 以宽为准
            if(zoomWidth <= zoomHeight){
                reWidth = defWidth;
                reHeight = parseInt((height * defWidth) / width);

            // 以高为准
            }else {
                reHeight = defHeight;
                reWidth = parseInt((reHeight * width) / height);

            }

            // 结果取整
            reWidth = parseInt(reWidth, 10);
            reHeight = parseInt(reHeight, 10);

            return {
                "width":reWidth
                ,"height":reHeight
            };
        }
        
    });


    /*  拖拽类
     *
     *  @param {Object} opts 参数
     *  @param {Boolean} opts.isEnable 是否启用拖拽
     *  @param {HTMLElement或Jquery的dom}   opts.drag   可拖拽对象
     *  @param {HTMLElement或Jquery的dom}   opts.box    被拖拽对象（被拖拽对象包含可拖拽对象）
     *  @param {HTMLElement或Jquery的dom}   opts.area   可拖拽区域容器(--- debug --- 还未做支持)
     *  @param {Object|Function}            opts.offset 偏移量
     *  @eg:
     *      new Drag({
     *          isEnable:true,
     *          ,drag:$(".title")
     *          ,box:$(".dialog")
     *          ,area:$("body")
     *          ,offset:function(){
     *              return {x:0,y:0}
     *          } || {x:0,y:0}
     *      });
     */
    Drag = function (opts){
        this.opts = opts = opts || {};
        var body = document.compatMode == "CSS1Compat" ? document.documentElement : document.body;
        
        this.body = body;
        this.drag = $(opts.drag);
        // 如果opts.area\opts.box是Jquery的dom还在进一步做判断是否 .length > 0
        this.box = $(opts.box || dragElement);
        this.area = $(opts.area || this.body);
        this.offset = opts.offset;
        
        // 是否处在拖拽状态
        this.isDraging = false;
        // 是否启用拖拽
        this.isEnable = opts.isEnable === false ? false : true;
        this.init();
    }
    Drag.prototype = {
        init:function(){
            var me = this;
            var down = function(){
                if(me.isEnable === false){
                    return false;
                }
                $(document).bind("mousemove",move);
                $(document).bind("mouseup",up);
                me.down.apply(me, arguments);
                return false;
            }
            var move = function(){
                me.move.apply(me, arguments);
                return false;
            }
            var up = function(){
                $(document).unbind("mousemove",move);
                $(document).unbind("mouseup",up);
                me.up.apply(me, arguments);
                return false;
            }
            this.drag.bind("mousedown",down);
        }
        ,down:function(e){
            // --- debug --- 需要排除可拖拽对象中的某些元素，比如对话框中的X关闭元素
            
            this.isDraging = true;
            this.mouseOffset = this.getMouseOffset(this.drag.get(0), e);
            // 不可选中
            $("body").addClass("userSelect");
            $("body").get(0).onselectstart = new Function("return false");
            typeof(this.opts.down) == "function" && this.opts.down.call(this);
        }
        ,move:function(e){
            var mousePos = this.mouseCoords(e);
            var left = (mousePos.x - this.mouseOffset.x);
            var top = (mousePos.y - this.mouseOffset.y);
            var iwidth = this.area.innerWidth();
            var iheight = this.area.height();
            var bwidth = this.drag.width();
            var bheight = this.drag.height();
            var leftTop = {};

            if(this.opts.type == "C"){

                // 右下
                left = left >= (iwidth - bwidth) ? left : iwidth - bwidth;
                top = top >= (iheight - bheight) ? top : iheight - bheight;

                // 左上
                left = left > 0 ? 0 : left;
                top = top > 0 ? 0 : top;

                leftTop["left"] = left + "px";
                leftTop["top"] = top + "px";
            }else if(this.opts.type == "L"){
                left = left >= (iwidth - bwidth)  ? (iwidth - bwidth)  : left;
                left = left < -(bwidth / 2) ? -(bwidth / 2) : left;
                leftTop["left"] = left + "px";

            }

            /*
            var width = $(document).width();
            var boxWidth = this.box.width();
            if(left + boxWidth > width){
                left = width - boxWidth;
            }
            */
            this.box.css(leftTop);
            this.opts.move && this.opts.move.call(this);
        }
        ,up:function(e){
            this.isDraging = false;
            // 可选中
            $("body").removeClass("userSelect");
            $("body").get(0).onselectstart = new Function("return true");
            typeof(this.opts.up) == "function" && this.opts.up.call(this);
        }
        ,getMouseOffset:function(target, e){
            var docPos    = $(this.box).position();
            //docPos = {left:0,top:0}
            var offset = typeof(this.offset) == "function" ? this.offset() : this.offset;
            offset = offset == null ? {x:0,y:0} : offset;
            // 未做非数字判断
            var mLeft = parseInt(offset.x);
            var mTop = parseInt(offset.y);
            var mousePos  = this.mouseCoords(e);
            return {x:mousePos.x - docPos.left + mLeft, y:mousePos.y - docPos.top + mTop};
        }
        ,mouseCoords:function(ev){
            if(ev.pageX || ev.pageY){
                return {"x":ev.pageX, "y":ev.pageY};
            }
            return {
                "x":ev.clientX + parseInt(this.body.scrollLeft) - parseInt(this.body.clientLeft)
                ,"y":ev.clientY + parseInt(this.body.scrollTop)  - parseInt(this.body.clientTop)
            };
        }
    }

    
    module.exports = Cutpicture;
});
