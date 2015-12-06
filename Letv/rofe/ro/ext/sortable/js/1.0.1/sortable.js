;
define(ROCK.seaConfig.alias.sortable, [ROCK.seaConfig.alias.drag], function(require, exports, module) {

    var Drag = require(ROCK.seaConfig.alias.drag);

    /** 拖拽类
     *
     *  @author ywchen(陈余文)
     *  @constructs Sortable
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
            new Sortable({
                isEnable:true,
                ,drag:$(".title")
                ,box:$(".dialog")
                ,area:$("body")
                ,offset:function(){
                    return {x:0,y:0}
                } || {x:0,y:0}
            });
     */
    var Sortable = function(opts) {

        // 继承父类属性
        ROCK.core.BaseClass.call(this);
        this.opts = opts = opts || {};
        var opt = {
            tmpInsertTpl:'<span class="item checked {tmpClass}"></span>'
            ,dragTpl:'<div onmousedown="return false;" class="drag"></div>'
            ,tmpClass:"dragM"
            ,isOnEvent:true
            ,target:null
            ,isDragTarget:true

            ,area:null
            ,insertParent:null
            ,insertChild:null
            ,scrollTarget:null
            ,insertCallback:function(tmpNode){
            }
            ,limitAreaSize:null
        }
        
        this.opt = $.extend(opt, opts);
        this._init()
    }

    // 继承原型
    ROCK.core.BaseClass.extend(Sortable);

    $.extend(Sortable.prototype, {
        
        /** 初始化预处理
         *
         *  @roclass Sortable
         *  @roname _init
         *  @return {Sortable} Sortable的实例
         */
         _session:{}
        ,_init:function(){
            var me = this;
            me._bind();
        }
        ,_bind:function(e){
            var me = this;
            var opt = me.opt || {};
            var dragDom = null;
            $(document).on("mousedown", opt.target, function(ev){
                if(ev.button == 2){
                    return false;
                }

                // 防止Sortable被调用多次而相互干扰的问题出现
                var dom = ev.target;
                if($(opt.target).find(dom).length == 0 && $(dom).filter(opt.target).length == 0){
                    return false;
                }
                if($(dom).parents(opt.target).length > 0){
                    dom = $(dom).parents(opt.target);
                }

                $("body").css({"user-select":"none"});
                $("body").bind("selectstart", function(){return false;});
                var xy = me.getEventXY(ev);
                // 开启拖拽灵敏度
                var diff = 10;
                $(document).bind("mousemove", function(ev2){
                    var xy2 = me.getEventXY(ev2);
                    var x = Math.abs(xy2.x - xy.x);
                    var y = Math.abs(xy2.y - xy.y);
                    if(x > diff || y > diff){
                        $(document).unbind("mousemove");
                        dragDom = me.drag(ev, dom);
                    }
                });
                return false;
            })
            $(document).on("mouseup", function(){
                $("body").css({"user-select":"auto"});
                $("body").unbind("selectstart");
                $(this).unbind("mousemove");
                dragDom && dragDom.remove();
            });
        }
        ,setData:function(key, value){
            var me = this;
            me._session = me._session || {};
            me._session[key] = value;
        }
        ,getData:function(key){
            var me = this;
            me._session = me._session || {};
            return me._session[key];
        }
        ,getEventXY:function(ev){
            ev = ev || {};
            if(ev.pageX || ev.pageY){
                return {"x":ev.pageX, "y":ev.pageY};
            }
            return {
                "x":ev.clientX + parseInt(this.body.scrollLeft) - parseInt(this.body.clientLeft)
                ,"y":ev.clientY + parseInt(this.body.scrollTop)  - parseInt(this.body.clientTop)
            };
        }

        ,drag:function(ev, dom){        
            
            var me = this;
            var opt = me.opt || {};
            var xy = me.getEventXY(ev)
            var doms = null;
            var confirmMsg = null;
            var msg = null;
            var count = null;
            var width = null;
            var height = null;
            var drag = null;
            var groupId = null;
            var groupName = null;
            var itemIds = [];

            dom = $(dom);
            var html = $(opt.dragTpl);
            $("body").append(html);

            if(ev.ctrlKey || ev.metaKey){
                return;
            }

            width = 20 || html.width();
            height = html.height();
            html.css({
                left:xy.x - (width / 2)
                ,top:xy.y - (height / 2)
                ,"opacity":"0.9"
            });

            opt.isDragTarget && dom.hide();


            drag = new Drag($.extend({
               drag:html
               ,box:html
               ,offset:{x:0,y:0}
               ,down:function(){
                    groupId = null;
               }
               ,move:function(){
                    // me.insert();
               }
               ,up:function(){
                    groupId = null;
                    drag = null;
                    html && html.remove();
                    html = null;
               }
               ,limitAreaSize:opt.limitAreaSize
               ,dragTpl:opt.dragTpl
               ,tmpInsertTpl:opt.tmpInsertTpl
               ,area:opt.area
               ,insertParent:opt.insertParent
               ,insertChild:opt.insertChild
               ,scrollTarget:opt.scrollTarget
               ,insertCallback:function(tmpNode){
               }
               ,replaceWith:function(dom1){
                    var replaceNode = me.getCreateTpl(dom);
                    dom1 && dom1.replaceWith(replaceNode);
                    replaceNode && replaceNode.show && replaceNode.show();
                    opt.insertCallback && opt.insertCallback.call(me, dom);
               }
            }, opt.drag));

            drag && drag.forceDown(ev);
            return html;
        }
        ,getCreateTpl:function(dragNode){
            var me = this;
            var opt = me.opt || {};
            var createTpl = opt.createTpl;
            var tmpCreateTpl = null;
            if(typeof(createTpl) === "function"){
                tmpCreateTpl = createTpl.call(me, dragNode);
            }else if(typeof(tmpCreateTpl) == "object"){
                tmpCreateTpl = createTpl;
            }else{
                tmpCreateTpl = $.trim(tmpCreateTpl);
            }

            //tmpCreateTpl = $.trim(tmpCreateTpl);
            if((typeof(tmpCreateTpl) != "object" && $.trim(tmpCreateTpl) == "") || (typeof(tmpCreateTpl) == "object" && tmpCreateTpl.length == 0)){
                dragNode && dragNode.show && dragNode.show();
                return $(dragNode);
            }else{
                return $(tmpCreateTpl);
            }
        }
    });

    module.exports = Sortable;
});
