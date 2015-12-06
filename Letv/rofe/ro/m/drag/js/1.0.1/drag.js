;
define(ROCK.seaConfig.alias.drag, function(require, exports, module) {

    /** 拖拽类
     *
     *  @author ywchen(陈余文)
     *  @constructs Drag
     *  @date 2015.10.23
     *  @param  {Object}            opts                        [*]参数
     *  @param  {HTMLElement}       opts.drag                   [*]可拖拽对象
     *  @param  {HTMLElement}       opts.box                    被拖拽对象（被拖拽对象包含可拖拽对象）
     *  @param  {HTMLElement}       opts.area                   可拖拽区域容器
     *  @param  {Boolean}           opts.isEnable               是否启用拖拽
     *  @param  {HTMLElement}       opts.limitAreaOffset        可拖拽区域容器的外加限制：{x:10,y:20}
     *  @param  {HTMLElement}       opts.limitAreaSize          可拖拽区域容器的外加限制：{width:10,height:20}
     *  @param  {HTMLElement}       opts.scrollTarget           滚动条滚动目标
     *  @param  {Number}            opts.scrollSpeed            滚动加速度,默认0
     *  @param  {HTMLElement}       opts.insertParent           被插入的父容器
     *  @param  {HTMLElement}       opts.insertChild            被插入的父容器的项目
     *  @param  {Function}          opts.insertBeforeCallback   插入前回调
     *  @param  {Function}          opts.insertafterCallback    插入后回调
     *  @param  {Function}          opts.tmpInsertTpl           临时插入模板'<span class="item"></span>'
     *  @param  {Object|Function}   opts.scrollOffset           滚动条的偏移量;默认值{ty:50,by:50,lx:50,bx:50}
     *  @param  {Object|Function}   opts.offset                 偏移量
     *  @return {Dialog}            Dialog的实例
     *  @version 1.0.1
     *  @example
            new Drag({
                isEnable:true,
                ,drag:$(".title")
                ,box:$(".dialog")
                ,area:$("body")
                ,offset:function(){
                    return {x:0,y:0}
                } || {x:0,y:0}
            });
     */
    var Drag = function(opts) {

        // 继承父类属性
        ROCK.core.BaseClass.call(this);

        this.opts = opts = opts || {};
        var body = document.compatMode == "CSS1Compat" ? document.documentElement : document.body;
        var opt = {
            scrollOffset:{
                "x":0
                ,"y":0
            }
            ,tmpInsertTpl:'<span class="item checked {tmpClass}"></span>'
            ,dragTpl:'<div onmousedown="return false;" class="drag"></div>'
            ,tmpClass:"dragM"
        }
        
        this.opt = $.extend(opt, opts);
        this.body = body;
        this.drag = $(opts.drag);
        // 如果opts.area\opts.box是Jquery的dom还在进一步做判断是否 .length > 0
        this.box = $(opts.box || this.drag);
        this.area = $(opts.area || this.body);
        this.offset = opts.offset || {x:0,y:0};
        this.iwidth = null;
        this.iheight = null;
        
        // 是否处在拖拽状态
        this.isDraging = false;
        // 是否启用拖拽
        this.isEnable = opts.isEnable === false ? false : true;
        this._init();
    }

    // 继承原型
    ROCK.core.BaseClass.extend(Drag);

    $.extend(Drag.prototype, {
        
        /** 初始化预处理
         *
         *  @roclass Drag
         *  @roname _init
         *  @return {Drag} Drag的实例
         */
        _init:function(){
            var me = this;
            var iwidth = this.area.innerWidth();
            var iheight = this.area.height();
            this.iwidth = iwidth;
            this.iheight = iheight;
            var down = function(){
                if(me.isEnable === false){
                    return false;
                }
                $(this).css({"position":"absolute"});
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
                clearTimeout(me.timeId);
                $(document).unbind("mousemove",move);
                $(document).unbind("mouseup",up);
                me.replace();
                me.up.apply(me, arguments);
                return false;
            }
            //this.area.on("mousedown", down);
            this.drag.on("mousedown",down);

            // 为了点击别的地方时也能启动用的
            this.down2 = down;
        }
        ,down:function(e){
            // --- debug --- 需要排除可拖拽对象中的某些元素，比如对话框中的X关闭元素
            
            this.isDraging = true;
            this.mouseOffset = this.getMouseOffset(this.drag.get(0), e);
            this.downDom();
            // 不可选中
            $("body").addClass("userSelect");
            $("body").get(0).onselectstart = new Function("return false");
            typeof(this.opts.down) == "function" && this.opts.down.call(this);
        }

        /** 强制开启down
         *
         *  @roclass Drag
         *  @roname forceDown
         *  @param {Event}  e            [*]被启动mousedown事件传递过来的event
         *  @return {Drag} Drag的实例
         */
        ,forceDown:function(e){
            this.down2(e);
            return this;
        }
        // 获取边界大小(px)
        ,getHSideSize:function(dom){

            dom = $(dom);
            var height = 0;
            var pt = parseInt(dom.css("padding-top")) || 0;
            var pb = parseInt(dom.css("padding-bottom")) || 0;
            var mt = parseInt(dom.css("margin-top")) || 0;
            var mb = parseInt(dom.css("margin-bottom")) || 0;
            var bt = parseInt(dom.css("border-top-width")) || 0;
            var bb = parseInt(dom.css("border-bottom-width")) || 0;

            height = pt + pb + mt + mb + bt + bb;

            return height
        }
        // 获取边界大小(px)
        ,getWSideSize:function(dom){

            dom = $(dom);
            var height = 0;
            var pt = parseInt(dom.css("padding-left")) || 0;
            var pb = parseInt(dom.css("padding-right")) || 0;
            var mt = parseInt(dom.css("margin-left")) || 0;
            var mb = parseInt(dom.css("margin-right")) || 0;
            var bt = parseInt(dom.css("border-left-width")) || 0;
            var bb = parseInt(dom.css("border-right-width")) || 0;

            height = pt + pb + mt + mb + bt + bb;

            return height
        }
        ,downDom:function(){
            return;
            var me = this;
            var opt = me.opt;
            var parentElement = $(opt.insertParent);
            var mouseOffset = me.mouseOffset;
            me.tmpDom = $(opt.dragTpl);
            me.tmpDom.css({
                "top":mouseOffset.y
                ,"top":mouseOffset.x
            }).hide();
            //me.tmpDom.appendTo("body");
            me.drag = me.tmpDom;
            me.box = me.drag;
        }
        ,move:function(e){
            var me = this;
            var opt = me.opts || {};
            var mousePos = this.mouseCoords(e);
            var left = (mousePos.x - this.mouseOffset.x);
            var top = (mousePos.y - this.mouseOffset.y);
            var lastTop = top;
            var lastLeft = left;
            // var iwidth = this.area.innerWidth();
            // var iheight = this.area.height();
            iwidth = this.iwidth;
            iheight = this.iheight;

            // downDom 因为加入这个而加的
            if(this.drag.filter(":visible").length == 0){
                this.drag.show();
            }
            if(this.box.filter(":visible").length == 0){
                this.box.show();
            }


            var bwidth = this.drag.width() + this.getWSideSize(this.drag);
            var bheight = this.drag.height() + this.getHSideSize(this.drag);
            var leftTop = {};
            var limitAreaOffset = opt.limitAreaOffset || {};
            var areaX = limitAreaOffset.x || 0;
            var areaY = limitAreaOffset.y || 0;
            var limitAreaSize = opt.limitAreaSize || {};
            var limitAreaWidth = limitAreaSize.width || 0;
            var limitAreaHeight = limitAreaSize.height || 0;

            if(this.opts.type == "C"){
                // 右下
                left = left <= (iwidth - bwidth) ? left : iwidth - bwidth;
                top = top <= (iheight - bheight) ? top : iheight - bheight;

                // 左上
                left = left < 0 ? 0 : left;
                top = top < 0 ? 0 : top;

                //leftTop["left"] = left + "px";
                leftTop["top"] = top + "px";
            }else if(this.opts.type == "L"){
                left = left >= (iwidth - bwidth)  ? (iwidth - bwidth)  : left;
                left = left < -(bwidth / 2) ? -(bwidth / 2) : left;
                //leftTop["left"] = left + "px";
            }else if(this.area.length > 0){
                //areaX
                var limitAreaOffset = this.area.offset() || {top:0,left:0};
                var areaTop = limitAreaOffset.top + areaY;
                var areaLeft = limitAreaOffset.left + areaX;
                var areaHeight = this.area.innerHeight() + this.getHSideSize(this.area) - areaY - limitAreaHeight;
                var areaWidth = this.area.innerWidth() + this.getWSideSize(this.area) - areaX - limitAreaWidth;
                if(left < areaLeft){
                    left = areaLeft;
                }else if(left > (areaLeft + areaWidth - bwidth)){
                    left = areaLeft + areaWidth - bwidth;
                }
                if(top < areaTop){
                    top = areaTop;
                }else if(top > (areaTop + areaHeight - bheight)){
                    top = areaTop + areaHeight - bheight;
                }
            }

            var sTop = this.getTScrollSize(this.box);
            var sLeft = this.getLScrollSize(this.box);

            
            this.scroll(lastTop, lastLeft);

            /*
            var width = $(document).width();
            var boxWidth = this.box.width();
            if(left + boxWidth > width){
                left = width - boxWidth;
            }
            */

            // // 修正相对定位
            // var boxOffset = this.box.offset() || {top:0,left:0};
            // var boxPosition = this.box.position() || {top:0,left:0};
            // var diffValueTop = boxOffset.top - boxPosition.top - bheight;
            // var diffValueLeft = boxOffset.left - boxPosition.left;
            // log(diffValueTop)



            leftTop["top"] = (sTop + top) + "px";
            leftTop["left"] = (sLeft + left) + "px";

            this.box.css(leftTop);
            this.opts.move && this.opts.move.call(this);
            this.insert(lastLeft, lastTop);
        }
        ,getInsertItemQuery:function(){
            var me = this;
            var opt = me.opt || {};
            return "." + opt.tmpClass
        }
        ,insert:function(x, y){
            var me = this;
            var opt = me.opt || {};
            var tmpInsertTpl = opt.tmpInsertTpl || "";
            var parentElement = $(opt.insertParent);
            var node = null;
            var insetInfo = null;
            var itemElement = parentElement.find(opt.insertChild).not(me.getInsertItemQuery());
            tmpInsertTpl = tmpInsertTpl.replace(/{tmpClass}/g, opt.tmpClass);
            //insertCallback
            if(parentElement.length < 1){
                return;
            }

            // 防止到最后的时候；因为删除后再添加的操作产生抖动
            insetInfo = me.getInsertNodeInfo(x, y) || {};
            node = insetInfo.node;
            if(itemElement.length == 0 && parentElement.find("." + opt.tmpClass).length == 1){
                return;
            }else if(itemElement.length == 0){
                parentElement.find("." + opt.tmpClass).remove();
                parentElement.append(tmpInsertTpl);
            }else if(parentElement.find("." + opt.tmpClass).length == 1 && !insetInfo.isAfter && parentElement.find("." + opt.tmpClass).next().get(0) == $(node).get(0)){
                return;
            }else if(parentElement.find("." + opt.tmpClass).length == 1 && insetInfo.isAfter && parentElement.find("." + opt.tmpClass).prev().get(0) == $(node).get(0)){
                return;
            }else if(insetInfo.isAfter){
                parentElement.find("." + opt.tmpClass).remove();
                node && $(node).after(tmpInsertTpl);
            }else{
                parentElement.find("." + opt.tmpClass).remove();
                node && $(node).before(tmpInsertTpl);
            }

            // parentElement.find("." + opt.tmpClass).remove();
            // if(itemElement.length == 0){
            //     parentElement.append(tmpInsertTpl);
            // }else{
            //     data = me.getInsertNodeInfo();
            //     data && $(data.node).before && node.before(tmpInsertTpl);
            // }

        }
        ,replace:function(){

            var me = this;
            var opt = me.opt || {};
            var insertBeforeCallback = opt.insertBeforeCallback || function(){};
            var insertafterCallback = opt.insertafterCallback || function(){};
            var parentElement = $(opt.insertParent);
            var canInsert = (parentElement.length > 0 && parentElement.find(me.getInsertItemQuery()).length > 0) && parentElement.find("." + opt.tmpClass).length > 0;
            if(!canInsert){
                opt.replaceWith && opt.replaceWith.call(me, null);
                return false;
            }else{
                opt.replaceWith && opt.replaceWith.call(me, parentElement.find("." + opt.tmpClass));
            }

            // insertBeforeCallback && insertBeforeCallback.call(me, parentElement.find(me.getInsertItemQuery()));

            // parentElement.find("." + opt.tmpClass).replaceWith('<span class="item">ABC</span>');
            // opt.replaceWith && opt.replaceWith.call(me, parentElement.find("." + opt.tmpClass));
            // insertafterCallback && insertafterCallback.call(me, parentElement.find(me.getInsertItemQuery()));
        }
        ,getInsertNodeInfo:function(x, y){
            var me = this;
            var opt = me.opt || {};
            var parentElement = $(opt.insertParent);
            var itemElement = parentElement.find(opt.insertChild).not(me.getInsertItemQuery());
            return me.viewScope(x, y);
        }
        ,viewScope:function(x, y){
            var me = this;
            var reNode = null;
            var reNode2 = null;
            var opt = me.opt || {};
            var parentElement = $(opt.insertParent);
            var itemElement = parentElement.find(opt.insertChild).not(me.getInsertItemQuery());
            var boxNode = me.box;

            // 容器的点
            var pOffset = parentElement.offset() || {top:0,left:0};
            var pWidth = boxNode.outerWidth();
            var pHeight = boxNode.outerHeight();
            var psX = pOffset.left;
            var psY = pOffset.top;
            var peX = bsX + boxWidth;
            var peY = bsY + boxHeight;

            // 被拖拽盒子的点
            var boxOffset = boxNode.offset() || {top:0,left:0};
            var boxWidth = boxNode.outerWidth();
            var boxHeight = boxNode.outerHeight();
            var bsX = boxOffset.left;
            var bsY = boxOffset.top;
            var beX = bsX + boxWidth;
            var beY = bsY + boxHeight;

            var intersection = 0;
            var lastIndex = 0;
            var lastIndex2 = 0;
            var isAfter = false;
            var isAfter2 = false;

            var distance = 0;

            $.each(itemElement, function(index, item){
                var dom = $(item);
                var offset = dom.offset() || {};
                var position = dom.position() || {};
                var width = dom.outerWidth();
                var height = dom.outerHeight();
                var sX = offset.left;
                var sY = offset.top;
                var eX = sX + width;
                var eY = sY + height;


                var curDistance = null;

                // 不可见的排队丢掉
                if(dom.filter(":visible").length == 0){
                    return true;
                }

                // // 光标在第一个元素前的时候；放在最前面   --- debug ---
                // if(sX < bsX && bsX < eX && sY < bsY && bsY < eY){
                //     reNode = dom;
                //     return false;
                // }

                // 论与谁的交集面积最大
                var acreage = me.getIntersection({
                    // 矩形1
                    "rectangle1":{
                        x1:bsX
                        ,y1:bsY
                        ,x2:beX
                        ,y2:beY
                    }
                    // 矩形2
                    ,"rectangle2":{
                        x1:sX
                        ,y1:sY
                        ,x2:eX
                        ,y2:eY
                    }
                });

                // 最优先的方案为交集面积最大的；只能没有交集时才使用其它的方案
                if(acreage > 0 && acreage > intersection){
                    intersection = acreage;
                    reNode = dom;
                    lastIndex = index;
                    (sY + (height / 2)) < y && (isAfter = true);
                }

                curDistance = Math.min(Math.abs(sY - y), Math.abs(y - eY));
                if(Math.min(distance, curDistance) == curDistance){
                    distance = Math.min(distance, curDistance);
                    reNode2 = dom;
                    (sY + (height / 2)) < y && (isAfter2 = true);
                }

            });

            // 最后一个时作特殊处理；看光标在最后一个元素上半部分还是下半部分;即非最后一个的时候都被重置为false
            if(lastIndex != (itemElement.length - 1)){
                isAfter = false;
            }

            // 光标在容器中
            if(reNode == null && reNode2 != null && psX < x && x < peX && psY < y && y < peY){
                reNode = reNode2;
                isAfter = lastIndex2 != (itemElement.length - 1) ? false : isAfter2;
            }

            return {
                "node":reNode
                ,"isAfter":isAfter
            };
        }
        // 获取两个矩形的交集面积
        ,getIntersection:function(opt){
            opt = opt || {};
            var intersection = 0;
            var rectangleTmp = null;
            var width = 0;
            var height = 0;
            var rectangleA = opt.rectangle1 || {};
            var rectangleB = opt.rectangle2 || {};
            // var rectangleA = opt.rectangle1 || {
            //     x1:0
            //     ,y1:0
            //     ,x2:0
            //     ,y2:0
            // }
            // var rectangleB = opt.rectangle2 || {
            //     x1:0
            //     ,y1:0
            //     ,x2:0
            //     ,y2:0
            // }

            // // 为了达到rectangleA的X轴最小
            // if(rectangleA.x1 > rectangleB.x1){
            //     rectangleTmp = rectangleA;
            //     rectangleA = rectangleB;
            //     rectangleB = rectangleTmp;
            // }

            width = Math.min(rectangleA.x2, rectangleB.x2) - Math.max(rectangleA.x1, rectangleB.x1);
            height = Math.min(rectangleA.y2, rectangleB.y2) - Math.max(rectangleA.y1, rectangleB.y1);
            if(!isNaN(width) && !isNaN(height) && width >= 0 && height >= 0){
                intersection = width *  height;
            }else{
                intersection = 0; 
            }



            // // A矩形相对B矩形的左侧；且A矩形在B矩形的上面，至少是A矩形和B矩形同一高度;即B的x1在A的x1到x2之间
            // var isBx1InAx12 = rectangleA.x1 <= rectangleB.x1 && rectangleA.x2 > rectangleB.x1;
            // //width = Math.min(rectangleA.x2, rectangleB.x2) - rectangleB.x1;
            // width = Math.min(rectangleA.x2, rectangleB.x2) - Math.max(rectangleA.x1, rectangleB.x1);

            // // A矩形相对B矩形的左侧；且A矩形在B矩形的上面，至少是A矩形和B矩形同一高度
            // if(isBx1InAx12 && (rectangleA.y1 <= rectangleB.y1 && rectangleA.y2 > rectangleB.y1)){

            //     height = Math.min(rectangleA.y2, rectangleB.y2) - ;

            // // A矩形相对B矩形的左侧；且B矩形在A矩形的上面，至少是B矩形和A矩形同一高度;且即B的y1在A的y1到y2之间
            // }else if(isBx1InAx12 && (rectangleB.y1 <= rectangleA.y1 && rectangleB.y2 > rectangleA.y1)){


            //     return ;
            // }else{
            //     intersection = 0;
            // }

            return intersection;
        }
        ,getTScrollSize:function(dom){
            dom = $(dom);
            var scrollSize = 0;
            while(dom.get(0) != null && !(/html|body/i.test(dom.get(0).tagName))){
                scrollSize += dom.scrollTop();
                dom = dom.parent();
            }
            return scrollSize;
        }
        ,getLScrollSize:function(dom){
            dom = $(dom);
            var scrollSize = 0;
            while(dom.get(0) != null && !(/html|body/i.test(dom.get(0).tagName))){
                scrollSize += dom.scrollLeft();
                dom = dom.parent();
            }
            return scrollSize;
        }
        // isYC是否延时
        ,scroll:function(eTop, eLeft, isYC){
            
            var me = this;
            var opt = me.opt || {};
            var scrollSpeed = opt.scrollSpeed || 0;
            var scrollOffset = opt.scrollOffset || {};
            var time = (new Date()).getTime();
            if(isYC !== true){
                clearTimeout(me.timeId);
            }
            // 多久触发一次；
            if(isYC !== true && me.lastTime != null && time - me.lastTime < 100){
                // log(1111)
                // return;
            }
            me.lastTime = time;
            var opt = this.opts || {};
            var sTarget = $(opt.scrollTarget);
            if(sTarget.length == 0){
                return ;
            }
            var stop = (sTarget.offset() || {}).top || 0;
            var sbottom = stop + sTarget.height() + this.getHSideSize(this.sTarget);
            var initTop = sTarget.scrollTop();
            var tSpeed = Math.abs(stop - eTop) + scrollSpeed;
            var isDealing = false;

            // 计算当前被拖容器的位置和所占大小
            var boxOffset = me.box.offset() || {top:0,left:0};
            var boxWidth = me.box.outerWidth();
            var boxHeight = me.box.outerHeight();
            var boxTop = boxOffset.top;
            var boxLeft = boxOffset.left;
            var boxBottom = boxTop + boxHeight
            var boxRight = boxLeft + boxWidth;
            var isUp = false;
            var isDown = false;
            var defaultXY = 50;

            // 参数容错,和默认值 
            scrollOffset.lx = scrollOffset.lx == null ? defaultXY : scrollOffset.lx;
            scrollOffset.ty = scrollOffset.ty == null ? defaultXY : scrollOffset.ty;
            scrollOffset.rx = scrollOffset.rx == null ? defaultXY : scrollOffset.rx;
            scrollOffset.by = scrollOffset.by == null ? defaultXY : scrollOffset.by;


            if(boxTop < (stop + scrollOffset.ty)){
                tSpeed = Math.abs((stop + scrollOffset.ty) - boxTop);
                isUp = true;
            }else if((sbottom - scrollOffset.rx) < boxBottom){
                tSpeed = Math.abs(boxBottom - (sbottom - scrollOffset.rx));
                isDown = true;
            }

            // 滚动速度
            tSpeed = tSpeed < 5 ? 0 : 1 + tSpeed / 20;

            if(isUp){
            // 上负
            //if(stop > eTop){
                //log(1,initTop - tSpeed)
                sTarget.scrollTop(initTop - tSpeed);
                isDealing = true;
            }else if(isDown){
            // 下过
            //}else if(sbottom < eTop){
                //log(2,initTop + tSpeed)
                sTarget.scrollTop(initTop + tSpeed);
                isDealing = true;
            }

            if(isDealing){
                me.timeId = setTimeout(function(){
                    me.scroll(eTop, eLeft, true);
                },50);
            }
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
        
    });

    module.exports = Drag;
});
