;
define(ROCK.seaConfig.alias.page, function(require, exports, module) {

    /** 翻页组件，模板中的{href}这种形式的都是变量；替换模板时应尽量保留以保证功能完整性
     *
     *  @author ywchen(陈余文)
     *  @constructs Page
     *  @date       2015.08.17
     *  @version    1.0.1
     *  @param      {Object}        opt                     [*]参数
     *  @param      {HTMLElement}   opt.container           [*]组件容器
     *  @param      {Number}        opt.length              [*]总记录数，默认0条
     *  @param      {Number}        opt.curPage             当前页码,默认第一页
     *  @param      {Number}        opt.count               每页的条数,可选参数，默认为10
     *  @param      {Number}        opt.size                每屏的页码数,可选参数，默认为10
     *  @param      {Boolean}       opt.hasFirstAndEndTag   是否有首页和末页标签，默认true,显示
     *  @param      {Boolean}       opt.hasPreAndNextTag    是否有上一页和下一页标签，默认true,显示
     *  @param      {Boolean}       opt.hasJumpTag          是否有跳转到标签，默认true,显示
     *  @param      {String}        opt.jumpTpl             跳转到的模板，输入框必须带J_roPageInput样式名；按钮必须带J_roPageButton样式名；跳转到的模板；默认为‘<input class="ui-text J_roPageInput" type="text" placeholder="页码"><span class="ui-button J_roPageButton">跳转</span>’
     *  @param      {String}        opt.linkTpl             页码的模板，默认为'<a title="{text}" href="{href}" class="{linkClass} J_roPageLink" data-ro-page={page}>{text}</a>'
     *  @param      {String}        opt.btnTpl              首页、末页、上页、下页按钮的模板,默认'<a title="{text}" href="{href}" class="{linkClass} J_roPageLink" data-ro-page={page}>{text}</a>'
     *  @param      {String}        opt.parentTpl           父节点的容器模板,格式如‘<div>{html}</div>’；默认空
     *  @param      {String}        opt.firstText           首页按钮的文本，默认”首页“
     *  @param      {String}        opt.endText             末页按钮的文本，默认”末页“
     *  @param      {String}        opt.preText             上一页按钮的文本，默认”上一页“
     *  @param      {String}        opt.nextText            下一页按钮的文本，默认”下一页“
     *  @param      {String}        opt.linkHref            模板中变量参数为{href}的值
     *  @param      {String}        opt.midText             ”页码“标签的文本内容，默认{page}
     *  @param      {String}        opt.commonClass         ”首页“、”末页“、”上一页“、”下一页“以及页数标签的能用样式
     *  @param      {String}        opt.curClass            选中的样式，默认cur
     *  @param      {String}        opt.preClass            ”上一页“的样式，无默认
     *  @param      {String}        opt.nextClass           ”上一页“的样式，无默认
     *  @param      {String}        opt.firstClass          ”首页“的样式，无默认
     *  @param      {String}        opt.endClass            ”末页“的样式，无默认
     *  @param      {String}        opt.btnDisableClass     ”首页“、”末页“、”上一页“、”下一页“的不可用状态样式；当存在值时，当前是第一页也会出现”首页“等
     *  @param      {Number}        opt.maxPage             最大页码,可选参数，默认为0,不限制
     *  @param      {function}      opt.jumpParamError      当输入的内容不符合时被回调，该函数返回值是true,继续跳转；若为false不跳转；函数参数，第一个是当前页，第二个是最大页   
     *  @param      {function}      opt.beforeJump          当页码跳转前被回调，该函数返回值是true,继续跳转；若为false不跳转；函数参数，第一个是当前页，第二个是最大页
     *  @param      {function}      opt.rendered            当页码跳转后且渲染完后被回调，该函数返回值是true,继续跳转；若为false不跳转；函数参数，第一个是当前页，第二个是最大页
     *  @return     {Page}          opt.返回Page的实例
     *  @example
            new Page({
                "container":".J_page1"
                ,"curPage":3
                ,"length":data.length || 41
                ,"count":count || 10
                ,"size":size || 8
                ,"commonClass":"common ui-button"
                ,"firstClass":"first"
                ,"preClass":"pre"
                ,"nextClass":"next"
                ,"endClass":"end"
                ,"curClass":"cur"
                ,midText:'{page}/{end}'
                ,preText:"上"
                ,nextText:"下"
                ,firstText:"首"
                ,endText:"末"
                ,btnDisableClass:"disable"
                // ,hasFirstAndEndTag:false    // 是否有首页和末页
                // ,hasPreAndNextTag:false     // 是否有上一页和下一页
                // ,hasJumpTag:false
                ,beforeJump:function(curPage, end){
                    
                }
                ,beforeJump:function(curPage, end){
                    
                }
                ,rendered:function(curPage, end){
                    
                }
            });
     */
    var Page = function(opts){

        // 继承父类属性
        ROCK.core.BaseClass.call(this);

        var me = this;
        // 参数的默认值配置
        var opt = {
            container:null                              // [*]组件容器
            ,curPage:1                                  // 当前页码,默认第一页
            ,length:0                                   // 一共有多少条记录
            ,count:10                                   // 默认每页10条
            ,size:10                                    // 默认每屏10条
            ,hasFirstAndEndTag:true                     // 是否有首页和末页标签，默认true,显示
            ,hasPreAndNextTag:true                      // 是否有上一页和下一页标签，默认true,显示
            ,hasJumpTag:true                            // 是否有跳转到标签，默认true,显示
            // 输入框必须带J_roPageInput样式名；按钮必须带J_roPageButton样式名；跳转到的模板
            ,jumpTpl:'<input class="ui-text J_roPageInput" type="text" placeholder="页码"><span class="ui-button J_roPageButton">跳转</span>'
            ,linkTpl:'<a title="{text}" href="{href}" class="{linkClass} J_roPageLink" data-ro-page={page}>{text}</a>'
            ,btnTpl:'<a title="{text}" href="{href}" class="{linkClass} J_roPageLink" data-ro-page={page}>{text}</a>'
            ,parentTpl:''                               // <div>{html}</div>
            ,firstText:"首页"
            ,endText:"末页"
            ,preText:"上一页"
            ,nextText:"下一页"
            ,midText:"{page}"
            ,linkHref:"javascript:void(0);"
            ,commonClass:""
            ,curClass:"cur"
            ,preClass:""
            ,nextClass:""
            ,maxPage:0
            ,firstClass:""
            ,endClass:""
            ,btnDisableClass:""
            ,jumpParamError:function(curPage, end){     // 跳转的参数异常时回调，若返回是true，继续跳转;若false, 停止跳转；默认是false
                return false;
            }
            ,beforeJump:function(curPage, end){         // 跳转前回调

            }
            ,rendered:function(curPage, end){           // 每一次渲染完成时回调

            }
        }

        // 重置配置
        $.extend(opt, opts);

        // 参数
        this.opt = opt;
        // 上次渲染在哪个页码
        this.lastPage = null;
        me._init();

    };

    // 继承原型
    ROCK.core.BaseClass.extend(Page);

    $.extend(Page.prototype, {

        // 初始化
        _init:function(){

            var me = this;
            this._render(me.opt.curPage || 1);
            this._bind();
        }

        // 绑定事件
        ,_bind:function(){
            var me = this;
            var opt = me.opt;

            // 绑定链跳转
            me.getContainer().off("click", ".J_roPageLink");
            me.getContainer().on("click", ".J_roPageLink", function(){
                // 当前页不能点击
                if($(this).hasClass(opt.curClass) || ($.trim(opt.btnDisableClass) != "" && $(this).hasClass(opt.btnDisableClass))){
                    return false;
                }
                var curPage = $(this).attr("data-ro-page");

                // 为实现css伪类的focus;
                //$(this).blur();
                me._render(curPage);
            });

            // 跳转块
            me.getContainer().off("click", ".J_roPageButton");
            me.getContainer().on("click", ".J_roPageButton", function(){
                var curPage = me.val(me.getContainer().find(".J_roPageInput"));
                me._checkParam(curPage) && me._render(curPage);
            });

            me.getContainer().off("keyup", ".J_roPageInput");
            me.getContainer().on("keyup", ".J_roPageInput", function(e){
                if(e.keyCode !== 13){
                    return true;
                }
                var curPage = me.val(this);
                me._checkParam(curPage) && me._render(curPage);
            });
        }

        // 渲染
        ,_render:function(curPage){

            curPage = Math.ceil((curPage == null || curPage < 1) ? 1 : curPage) || 1;

            var me = this;
            var opt = me.opt;

            var html = []
            var seData = me._getStartAndMidAndEnd(curPage);
            var start = seData.start;
            curPage = seData.mid;
            var end = seData.end;
            var size = me._getSize();
            var hasPre = false;
            var hasNext = false;

            // 跳转前回调
            opt.beforeJump && opt.beforeJump.call(me, curPage, end);


            // 仅不是第一页时显示，且只显示一次
            hasPre = curPage != 1;
            if(end > 0 && ($.trim(opt.btnDisableClass) != "" || hasPre)){

                // 首页 & 上一页
                opt.hasFirstAndEndTag && html.push(me._getTpl(opt.btnTpl, {
                    page:1
                    ,end:end
                    ,text:opt.firstText
                    ,linkClass:opt.firstClass + ' J_roPageFisrt' + (hasPre ? "" : " " + opt.btnDisableClass)
                }));

                // 上一页
                opt.hasPreAndNextTag && html.push(me._getTpl(opt.btnTpl, {
                    page:curPage - 1
                    ,end:end
                    ,text:opt.preText
                    ,linkClass:opt.preClass + " J_roPagePre" + (hasPre ? "" : " " + opt.btnDisableClass)
                }));
            }

            for(var i = start; i <= end; i++){

                size--;

                // 中间页
                html.push(me._getTpl(opt.linkTpl, {
                    page:i
                    ,end:end
                    ,text:opt.midText
                    ,linkClass:curPage == i ? opt.curClass : ""
                }));

                if(size <= 0){
                    break;
                }

            }


            // 仅不是最后一页时显示，且只显示一次
            hasNext = (curPage !== end);
            if(end > 0 && ($.trim(opt.btnDisableClass) != "" || hasNext)){

                // 下一页
                opt.hasPreAndNextTag && html.push(me._getTpl(opt.btnTpl, {
                    page:curPage + 1
                    ,end:end
                    ,text:opt.nextText 
                    ,linkClass:opt.nextClass + " J_roPageNext" + (hasNext ? "" : " " + opt.btnDisableClass)
                }));

                // 末页
                opt.hasFirstAndEndTag && html.push(me._getTpl(opt.btnTpl, {
                    page:end
                    ,end:end
                    ,text:opt.endText
                    ,linkClass:opt.endClass + " J_roPageEnd" + (hasNext ? "" : " " + opt.btnDisableClass)
                }));
            }

            // 当总页码大于1页，且允许显示跳转标签时，显示跳转标签
            end > 1 && opt.hasJumpTag && html.push(opt.jumpTpl);

            var isFinded = false;
            var content = $.trim(opt.parentTpl).replace(/{html}/g, function(){
                isFinded = true;
                return html.join("");
            });
            // 如果提供父容器没有{html}字符串，丢弃提供的父容器
            !isFinded && (content = html.join(""));

            me.getContainer().html(content);

            opt.rendered && opt.rendered.call(me, curPage, end);

            me.lastPage = curPage;
        }

        // 获取共有多少条记录
        ,_getLength:function(){

            return Math.ceil(this.opt.length) || 0;
        }

        // 获取每屏的页码数
        ,_getSize:function(){

            return Math.ceil(this.opt.size) || 10;
        }

        // 获取每页的条数
        ,_getCount:function(){

            return Math.ceil(this.opt.count) || 10;
        }

        // 获取开始页码和中间页码(当前页码)和结束页码
        ,_getStartAndMidAndEnd:function(curPage){

            var me = this;
            var opt = me.opt;

            // 每屏的默认页码数为10
            var size = me._getSize()
            // 一共有多少条记录
              , length = me._getLength()
            // 每页的默认条数为10
              , count = me._getCount()
            // 最大页码
              , allPage = Math.ceil(length / count) || 0
            // 最大默认页码为0,不限制
              , maxPage = Math.ceil(opt.maxPage) || 0
            // 显示起点页
              , start
            // 一屏页码的一半数
              , half
            // 一共多少页码可显示
              , all = (maxPage > 0 && allPage > maxPage) ? maxPage : allPage;
            curPage = curPage > all ? all : curPage;

            // 取得一屏的一半数
            half = Math.floor(size / 2);

            // 当前页码未到一屏的一半数时，从1页码开始显示
            if(curPage <= half){
                start = 1;

            // 当前页码与一屏的一半数的和大于总页码时
            }else if(curPage + half > all){
                start = all - size + 1;

            // 当前页码与一屏的一半数的和等于总页码时
            }else if(curPage + half == all){
                start = half == 0 ? all : all - size;

            // 其它情况
            }else{
                start = curPage - half;
            }

            // 起点页码未足1时，从1页码开始显示
            if(start < 1){
                start = 1;
            }

            return {
                "start":start
                ,"mid":curPage
                ,"end":all
            };
        }

        // 获取模板
        ,_getTpl:function(tpl, data){
            var me = this;
            var opt = me.opt;
            var linkClass = $.trim(data.linkClass) == "" ? "" : " " + data.linkClass;

            return $.trim(tpl).replace(/{(\w+)}/g,function(a, b){
                switch(b){
                    case "page":
                        return data.page;
                    case "end":
                        return data.end;
                    case "text":
                        return me._replacePageParam(data.text, data.page, data.end);
                    case "linkClass":
                        return me._replacePageParam(opt.commonClass + linkClass, data.page, data.end);
                    case "href":
                        return me._replacePageParam(opt.linkHref, data.page, data.end);
                    default:
                        return me._replacePageParam(opt[b] || "", data.page, data.end);
                }
            });
        }

        // 将字符串中的{page}替换成页码
        ,_replacePageParam:function(tpl, page, end){

            return $.trim(tpl).replace(/{page}/g, page).replace(/{end}/g, end);
        }

        // 检查当前页是否合理；
        ,_checkParam:function(curPage){
            var me = this;
            var opt = me.opt || {};
            var end = Math.ceil(me._getLength() / me._getCount());
            if(($.trim(curPage) == "" || isNaN(curPage) || curPage > end || curPage < 1) 
                && typeof(opt.jumpParamError) == "function" 
                && !opt.jumpParamError.call(me, curPage, end)){

                return false;
            }
            return true;
        }

        /** 获取组件的容器
         *
         *  @roclass    Page
         *  @roname     getContainer
         *  @return     {HTMLElement}           组件容器
         */
        ,getContainer:function(){
            var me = this;
            var opt = me.opt || {};
            return $(opt.container);
        }


        /** 获取上次渲染时的页码
         *
         *  @roclass    Page
         *  @roname     getPage
         *  @return     {Number}                获取上次渲染的页码，上次没有渲染时，返回为null
         */
        ,getPage:function(){
            return this.lastPage;
        }

        /** 跳转到指定的页码
         *
         *  @roclass    Page
         *  @roname     goToPage
         *  @param      {Number}    curPage     被跳转到的页码, 当参数不合理时还是会跳转；比如大于最大页码时按最大页码跳转
         *  @return     {Page}                  opt.返回Page的实例
         */
        ,goToPage:function(curPage){
            this._render(curPage);
        }

        /** 获取”首页“的Dom
         *
         *  @roclass    Page
         *  @roname     getFirstDom
         *  @return     {HTMLElement}           获取”首页“的Dom
         */
        ,getFirstDom:function(){
            return this.getContainer().find(".J_roPageFisrt");
        }

        /** 获取”末页“的Dom
         *
         *  @roclass    Page
         *  @roname     getEndDom
         *  @return     {HTMLElement}           获取”末页“的Dom
         */
        ,getEndDom:function(){
            return this.getContainer().find(".J_roPageEnd");
        }

        /** 获取”上一页“的Dom
         *
         *  @roclass    Page
         *  @roname     getPreDom
         *  @return     {HTMLElement}           获取”上一页“的Dom
         */
        ,getPreDom:function(){
            return this.getContainer().find(".J_roPagePre");
        }

        /** 获取”下一页“的Dom
         *
         *  @roclass    Page
         *  @roname     getNextDom
         *  @return     {HTMLElement}           获取”下一页“的Dom
         */
        ,getNextDom:function(){
            return this.getContainer().find(".J_roPageNext");
        }

    });

    module.exports = Page;
});
