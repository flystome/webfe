;
define(ROCK.seaConfig.alias.tips, function(require, exports, module) {

    /** 提示框
     *
     *  @author ywchen(陈余文)
     *  @constructs Tips
     *  @date 2015.05.03
     *  @version 1.0.1
     *  @param {Object} opts                [*]参数
     *  @param {String} opts.target         [*]目标Dom，即被Tip的小三角指向的
     *  @param {String} opts.content        内容
     *  @param {String} opts.zIndex         组件DOM的Sytle.z-index值,默认1001
     *  @param {String} opts.width          组件宽度,默认300
     *  @param {String} opts.parent         放置当前Tip的Dom的容器
     *  @param {String} opts.hasCloseBtn    是否有"X"关闭按钮,默认有X关闭功能
     *  @param {Object} opts.offset         偏移值
     *  @param {String} opts.offset.x       横坐标上的偏移值，默认值0
     *  @param {String} opts.offset.y       纵坐标上的偏移值，默认值0
     *  @param {Object} opts.classes        样式配置
     *  @param {function} opts.show         组件被显示时的回调
     *  @param {function} opts.cancel       组件被关闭时的回调
     *  @return {Tips} Tips的实例
     *  @example
            seajs.use('tips', function(Tips){
                
                var tip = new Tips({
                    content:"我就是Tip提示信息"
                    ,zIndex:10009
                    ,width:500
                    ,target:"#btnTip"
                    ,offset:{
                        y:0
                        ,x:0
                    }
                    ,hasCloseBtn:true
                    ,parent:null
                    ,cancel:function(){                     
                        console.log("callback cancel guid:" + this.guid)
                    }
                    ,show:function(){                       
                        console.log("callback show guid:" + this.guid)
                    }
                });
                //tip.setContent(12399);
            }); 
     */
    var Tips = function(opts) {

        // 继承父类属性
        ROCK.core.BaseClass.call(this);

        // 参数的默认值配置
        var opt = {
             content: ''                    // 内容
            ,zIndec: 1001                   // 组件DOM的Sytle.z-index值
            ,width:300                      // 组件宽度
            ,target:null                    // 目标Dom，即被Tip的小三角指向的
            ,parent: null                   // 放置当前Tip的Dom的容器
            ,hasCloseBtn:true               // 是否有"X"关闭按钮,默认有X关闭功能
            ,offset: {                      // 偏移值
                 x: 0                       // 横坐标上的偏移值
                ,y: 0                       // 纵坐标上的偏移值
            }
            ,classes:{                      // 样式配置
                "box":"ui-poptip"
                ,"container":"ui-poptip-container"
                ,"arrow":"ui-poptip-arrow"
                ,"btn":"ui-poptip-close"
                ,"content":"ui-poptip-content"
                ,"direction":{
                    "up":"ui-poptip-arrow-up"
                    ,"down":"ui-poptip-arrow-down"
                    ,"left":"ui-poptip-arrow-left"
                    ,"right":"ui-poptip-arrow-right"
                }
            }
            ,show: function(){          // 组件被显示时的回调

            }
            ,cancel:function(){         // 组件被关闭时的回调

            }
        }

        // 重置配置
        $.extend(opt, opts);

        // 模板
        this.tpl = [
            '<div class="{box}">'
                ,'<div class="{container}">'
                    ,'<div class="{arrow}">'
                        ,'<em></em>'
                        ,'<span></span>'
                    ,'</div>'
                    ,opt.hasCloseBtn === false ? "" : '<a href="javascript:void(0);" class="{btn}">x</a>'
                    ,'<div class="{content}">{contentString}</div>'
                ,'</div>'
            ,'</div>'
        ].join('');

        // 参数
        this.opt = opt;

        // 初始化处理执行后初赋值
        this.element = null;
        this._isShow = false;

        // 初始化
        this._init();

    }

    // 继承原型
    ROCK.core.BaseClass.extend(Tips);

    $.extend(Tips.prototype, {

        /** 初始化
         *
         *  @roclass Tips
         *  @roname _init
         *  @return 无返回值
         */
        _init:function(){
            var opt = this.opt || {}
              , item = {                    // 组织模板需要的信息
                    guid:this.guid
                    ,contentString:opt.content
                }

            // 模板替换
            this.element = $(this.tpl.replace(/{(\w+)}/g, function(a, b){
                return item[b] || a;
            }).replace(/{(\w+)}/g, function(a, b){
                return opt.classes[b] || "";
            }));

            // 根据父节点信息，载入到页面上
            if(opt.parent == null){
                $("body").append(this.element);
            }else{
                $(opt.parent).append(this.element);
            }

            // 绑定事件
            this._bind();
            // 显示组件
            this.show();

        }

        /** 事件绑定
         *
         *  @roclass Tips
         *  @roname _bind
         *  @return 无返回值
         */
        ,_bind: function(){
            var me = this;

            // 绑定关闭事件
            $(this.element).find("." + me.opt.classes.btn).click(function(){
                me.close();
            });

            var timeId = null;
            // 绑定窗口大小变化的事件，为优化性能有延时操作
            $(window).resize(function(){
                clearTimeout(timeId);
                timeId = setTimeout(function(){
                    !me.parent && me._isShow && me.setStyle();
                }, 50);
            });
        }

        /** 设置显示的位置和样式
         *
         *  @roclass Tips
         *  @roname setStyle
         *  @param {Number} width   Tips的宽度
         *  @return {Tips} Tips的实例
         *  @example
                var tip = new Tips({});
                tip.setStyle();
         */
        ,setStyle: function(width){
            width = width || 0;
            this.opt.width = width || this.opt.width;

            var me = this
              , opt = this.opt || {}
              , padding_left_and_right = (parseInt($(this.element).css("padding-left")) || 0 ) + (parseInt($(this.element).css("padding-right")) || 0)
              , target = opt.target
              , targetOffset = $(target).offset() || {}             // 目标的绝对位置的信息
              , targetPOffset = $(target).position() || {}          // 目标的相对位置的信息
              , targetWidth = $(target).width()                     // 目标的宽度
              , targetHeight = $(target).outerHeight()              // 目标的高度
              , targetTop = targetOffset.top                        // 目标的绝对top
              , targetLeft = targetOffset.left                      // 目标的绝对left
              , targetPTop = targetPOffset.top                      // 目标的相对top
              , targetPLeft = targetPOffset.left                    // 目标的相对left
              , winWidth = $(window).width()                        // 窗口的宽
              , winHeight = $(window).height()                      // 窗口的高
              , winTop = $(window).scrollTop()                      // 页面已滚动的值
              //, width = opt.width + padding_left_and_right        // tip的实际宽度
              , width = isNaN(opt.width) ? 
                    $(this.element).css("width","auto") && $(this.element).outerWidth() : 
                    opt.width + padding_left_and_right                  // tip的实际宽度
              , height = $(this.element)
                  .css({width:width
                   - padding_left_and_right,height:"auto"})
                  .outerHeight()   // tip的高度
              , setBoxTop = 0                                       // tip的Dom的top
              , setBoxLeft = 0                                      // tip的Dom的left
              , setArrowLeft = 0;                                   // 箭头的偏移
              
            // 在目标的上面显示
            if((targetTop - winTop) > ((winTop + winHeight) - targetTop - targetHeight)){
                this.setDirection(opt.classes.direction.down);
                setBoxTop = targetTop - height - $(this.element).find("." + opt.classes.arrow + " span").outerHeight();

            // 在目标下面显示
            }else{
                this.setDirection(opt.classes.direction.up);
                setBoxTop = targetTop + targetHeight + $(this.element).find("." + opt.classes.arrow + " span").outerHeight();
            }

            var a = targetLeft + targetWidth / 2 ;
            var b = width / 2;
            var c = 4

            // 在基准位置放不下的时候，向右移（基准位置：Tip的横向中间线位置和目标的中间线位置一g致时）
            if(a < b){
                setBoxLeft = a - b + (b - a);
                setArrowLeft = b - (b - a);

            // 如果右边放不下，且放不下的部分可以放到左边去不致于让左边出现看不见的情况
            }else if(winWidth - a < b && a - b > (b - (winWidth - a - c))) {
                setBoxLeft = (a - b) - (b - (winWidth - a - c));
                setArrowLeft = b +(b - (winWidth - a - c));
            }else{
                setBoxLeft = a - b;
                setArrowLeft = b;
            }

            $(this.element).find("." + opt.classes.arrow).css({
                "left":setArrowLeft
            });

            // 修正position的值
            setBoxTop = setBoxTop - (targetTop - targetPTop);
            setBoxLeft = setBoxLeft - (targetLeft - targetPLeft);

            // 修改当前CSS
            $(this.element).css({
                top:setBoxTop + opt.offset.y
                ,left:setBoxLeft + opt.offset.x
                ,width:width - padding_left_and_right
                ,zIndex:opt.index
            });
                
            return this;
        }

        /** 设置方向
         *
         *  @roclass Tips
         *  @roname setDirection
         *  @param {String} type  箭头上下左右的样式名
         *  @return {HTMLElement} 返回当前Tip的Dom
         *  @example
                var tip = new Tips({});
                tip.getDom();
         */
        ,setDirection: function(type){
            var opt = this.opt || {};
            $(this.element).find("." + opt.classes.arrow).removeClass(opt.classes.direction.down)
                .removeClass(opt.classes.direction.left).removeClass(opt.classes.direction.right)
                .addClass(type);
            return this.getDom();
        }

        /** 获取当前Tip的Dom
         *
         *  @roclass Tips
         *  @roname getDom
         *  @return {HTMLElement} 返回当前Tip的Dom
         *  @example
                var tip = new Tips({});
                tip.getDom();
         */
        ,getDom:function(){
            return $(this.element);
        }

        /** 设置Tip显示的内容
         *
         *  @roclass Tips
         *  @roname setContent
         *  @param {String} value 显示的内容
         *  @return  {Tips} Tips的实例
         *  @example
                var tip = new Tips({});
                tip.setContent("显示我");
         */
        ,setContent:function(value){
            $(this.element).find("." + this.opt.classes.content).html(value);
            return this;
        }

        /** 设置Tip为显示状态
         *
         *  @roclass Tips
         *  @roname show
         *  @param {Number} width   Tips的宽度,可选参数
         *  @return  {Tips} Tips的实例
         *  @example
                var tip = new Tips({});
                tip.show();
         */
        ,show:function(width){
            var isShow = this._isShow ;
            this._isShow = true;
            this.setStyle(width);
            $(this.element).show();
            !isShow && this.opt.show.call(this);
            return this;
        }

        /** 设置Tip为隐藏状态
         *
         *  @roclass Tips
         *  @roname hide
         *  @return  {Tips} Tips的实例
         *  @example
                var tip = new Tips({});
                tip.hide();
         */
        ,hide:function(){
            var isShow = this._isShow ;
            this._isShow = false;
            $(this.element).hide();
            isShow && this.opt.cancel.call(this);
            return this;
        }

        /** 设置Tip为隐藏状态且移除Dom
         *
         *  @roclass Tips
         *  @roname close
         *  @return {HTMLElement} 返回当前Tip的Dom
         *  @example
                var tip = new Tips({});
                tip.hide();
         */
        ,close:function(){
            var isShow = this._isShow ;
            this._isShow = false;
            $(this.element).remove();
            isShow && this.opt.cancel.call(this);
        }
    });

    module.exports = Tips;
});
