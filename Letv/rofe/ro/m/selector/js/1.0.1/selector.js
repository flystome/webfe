;

// --- debug --- 有的方法是传入element就能设置的；这时要看传入的element是否在container中；没有是不可以设置的
// --- debug --- 选中的时候再打开时，选中的显示位置
define(ROCK.seaConfig.alias.selector, function(require, exports, module) {

    /** 模拟Select下拉框,注意，此组件依赖input的contentChange自定义事件
     *
     *  @author ywchen(陈余文)
     *  @constructs Selector
     *  @date 2015.06.16
     *  @update huangzhi@20150915
     *  @version 1.0.1
     *  @param {Object}         opts                     [*]参数
     *  @param {HTMLElement}    opts.container           [*]Dom
     *  @param {Function}       opts.getParam            [*]取接口必须参数的回调（参数为上级被选中的value值）；当ops.getData有值时，此设置可以为空
     *                                                  返回值要求必须是JSON格式，key按接口需要来
     *                                                  在ops.getData无配置值时此函数返回的是直接可用数据
     *  @param {Function}       opts.getData             [*]ajax获取数据；当ops.getParam有值时，此设置可以为空
     *  @param {HTMLElement}    opts.child               子Dom
     *  @param {Boolean}        opts.isFirstLoad         是否第一次要加载
     *  @param {Function}       opts.changeCallback      下拉选项选中值被改变时回调，参数：第一个参数是选中的选项Dom对象，第二个参数是选中的值，this操作句柄是本Selector实例
     *  @param {Function}       opts.selCallback         下拉选项被选中后回调，参数：第一个参数是选中的选项Dom对象，第二个参数是选中的值，this操作句柄是本Selector实例
     *  @param {Function}       opts.callback            选项初始化后的回调
     *  @param {Function}       opts.inited              下拉控件初始化后的回调
     *  @param {Function}       opts.open                下拉框打开的时候回调
     *  @param {Function}       opts.close               下拉框关闭的时候回调
     *  @param {String}         opts.defText             默认显示值
     *  @param {Boolean}        opts.canNotDownList      是否不启用下拉事件,一般使用不上
     *  @param {Function}       opts.getContent          生成每个option时前的回调（参数是接口返回数据单对象和对象的索引名）
     *                                                  返回值要求必须是这种格式return {"value":"","text":"","custom":""},value和text是必须的，custom可扩展
     *  @param {String}         opts.widgetCssName       select模拟框最外层容器样式,默认值ro-selector-selector
     *  @param {String}         opts.listCssName         下框列表的旬层容器样式,默认值ro-selector-list
     *  @param {String}         opts.contentCssName      select的text值容器样式,默认值ro-selector-content
     *  @param {String}         opts.iconCssName         小三角容器样式,默认值ro-selector-icon
     *  @param {String}         opts.iconDownCssName     倒三角(即下拉框显示时)的样式。(此时小三角容器样式仍存在),默认值ro-selector-down
     *  @param {String}         opts.itemCssName         下拉框选项的样式,默认值ro-selector-item
     *  @param {String}         opts.hoverCssName        下拉框选项被光标放在上面时的样式,默认值ro-selector-hover
     *  @param {String}         opts.onCssName           下拉框选项被选中时的样式,默认值ro-selector-on
     *  @param {String}         opts.selectTpl           下拉框的模板 ‘<div class="{widgetCssName}" tabindex="-1"><span class="{contentCssName}"></span><input type="hidden"><span class="{iconCssName}">▾</span><div class="{listCssName}"></div></div>’
     *  @param {String}         opts.itemTpl             下拉框选项的模板,默认值'<span class="{itemCssName}" data-value="{value}">{text}</span>',模板语法可扩展{custom},在getContent中返回对应key即可
     *  @param {String}         opts.zIndex              select框的z-index的值,默认值1
     *  @param {String}         opts.maxHeight           下拉框容器的最大高度,默认值300
     *  @param {Object}         opts.propertys           下拉框的内属性，比如用户配合Send组件的Validation验证属性等
     *  @return {Selector} Selector的实例
     *  @example

            <div id="sltYear" class="initSelect"></div>
            <div id="sltMonth" class="initSelect"></div>
            <div id="sltDate" class="initSelect">
                <div class="ro-selector-selector" tabindex="-1">
                    <span class="ro-selector-content">请选择日</span>
                    <input type="hidden" name="year" data-value="">
                    <span class="ro-selector-icon">▾</span>
                    <div class="ro-selector-list">
                        <span class="ro-selector-item" data-value="">请选择日</span>
                    </div>
                </div>
            </div>


            // 例1
            seajs.use('selector', function(Selector){
                var yearObj = new Selector({
                    "container":"#sltYear"
                    ,"child":"#sltDate"
                    ,isFirstLoad:true
                    ,"defText":"请选择年"
                    ,"getParam":function(cid){
                        return [2000, 2001, 2002, 2003, 2004];
                    }
                    ,"getContent":function(item,index){
                        return {
                            "value":item
                            ,"text":item + "年"
                        }
                    }
                    ,"callback":function(element){
                        log("#sltYear：",this.getValue("#sltYear"))
                    }
                    ,propertys:{
                        "ro-validate":"require"
                        ,"ro-require":"年不能为空！"
                    }
                });
                var monthObj = new Selector({
                    "container":"#sltMonth"
                    ,"child":"#sltDate"
                    ,isFirstLoad:true
                    ,"defText":"请选择月"
                    ,"getParam":function(cid){
                        return [1,2,3,4,5,6,7,8,9,10,11,12];
                    }
                    ,"getContent":function(item,index){
                        return {
                            "value":item
                            ,"text":item + "月"
                        }
                    }
                    ,"callback":function(element){
                        log("#sltMonth")
                    }
                });

                new Selector({
                    "container":"#sltDate"
                    ,"defText":"请选择日"
                    ,isFirstLoad:true
                    ,"getParam":function(cid){
                        //return [1,2,3,4,5,6,7,8,9,10];
                    }
                    ,"getContent":function(item,index){
                        return {
                            "value":item.id
                            ,"text":item.name + "日"
                        }
                    }
                    ,getData:function(){
                        var selection = this;

                        if(yearObj.getValue("#sltYear") == "" || monthObj.getValue("#sltMonth")  == ""){
                            selection.setData([]);
                            return ;
                        }
                        // AJAX请求加回调
                        search(function(data){
                            selection.setData(data);
                        }, yearObj.getValue("#sltYear"), monthObj.getValue("#sltMonth"));
                    }
                    ,"callback":function(element){
                        log("#sltDate")
                        //if($(this).get(0).options.length > 1)
                        this.autoSelect(element,2);
                    }
                });
            });

            function search(cb,year,month){
                setTimeout(function(){
                    function isLeapYear(year){
                        if((year % 4 == 0 && year % 100 != 0) || year%400==0)
                        //if((year % 4 == 0 && year % 100 != 0) || (year%100==0 && year%400==0))
                            return true;
                        else
                            return false;
                    }
                    month = parseInt(month);
                    var leap = [31,29,31,30,31,30,31,31,30,31,30,31];
                    var nonleap = [31,28,31,30,31,30,31,31,30,31,30,31];
                    var months = isLeapYear(year) ? leap : nonleap;
                    var days = [];
                    for(var i = 1; i <= months[month - 1]; i++){
                        days.push({
                            id:i
                            ,name:i
                        });
                    }
                    cb(days);
                },3000);
            }
     */
    var Selector = function(opts){

        // 继承父类属性
        ROCK.core.BaseClass.call(this);

        var me = this;
        // 参数的默认值配置
        var opt = {
            container:null
            ,"widgetCssName":"ro-selector-selector"         // select模拟框最外层容器样式,默认值ro-selector-selector
            ,"listCssName":"ro-selector-list"               // 下框列表的旬层容器样式,默认值ro-selector-list
            ,"contentCssName":"ro-selector-content"         // select的text值容器样式,默认值ro-selector-content
            ,"iconCssName":"ro-selector-icon"               // 小三角容器样式,默认值ro-selector-icon
            ,"iconDownCssName":"ro-selector-down"           // 倒三角(即下拉框显示时)的样式。(此时小三角容器样式仍存在),默认值ro-selector-down
            ,"itemCssName":"ro-selector-item"               // 下拉框选项的样式,默认值ro-selector-item
            ,"hoverCssName":"ro-selector-hover"             // 下拉框选项被光标放在上面时的样式,默认值ro-selector-hover
            ,"onCssName":"ro-selector-on"                   // 下拉框选项被选中时的样式,默认值ro-selector-on
            ,"selectTpl":[
                '<div class="{widgetCssName}" tabindex="-1">'
                    ,'<span class="{contentCssName}"></span>'
                    ,'<input type="hidden">'
                    ,'<span class="{iconCssName}">▾</span>'
                    ,'<div class="{listCssName}">'
                    ,'</div>'
                ,'</div>'
            ].join("")                                      // 下拉框的模板 ‘<div class="{widgetCssName}" tabindex="-1"><span class="{contentCssName}"></span><input type="hidden"><span class="{iconCssName}">▾</span><div class="{listCssName}"></div></div>’
            ,"itemTpl":'<span class="{itemCssName}" data-value="{value}">{text}</span>' // 下拉框选项的模板,默认值<span class="{itemCssName}" data-value="{value}">{text}</span>
            ,"zIndex":1                                     // select框的z-index的值,默认值1
            ,"maxHeight":300                                // 下拉框容器的最大高度,默认值300
            ,"canNotDownList":false                         //  是否不启用下拉事件,一般使用不上
        }

        // 重置配置
        $.extend(opt, opts);

        // 参数
        this.opt = opt;
        this._container = $(this.opt.container);
        this.canNotDownList = null;

        $.each(this._container, function(){
            me._init($(this));
            me.setNotDownList(me.opt.canNotDownList);
        });

    };

    // 继承原型
    ROCK.core.BaseClass.extend(Selector);

    $.extend(Selector.prototype, {

        // 初始化
        _init:function(element){

            var me = this;
            element = $(element);
            var eleChild = $(me.opt.child);

            this.setData = function(data){
                element.trigger("addItem",{
                    "data":data
                });
            }

            this.clean = function(){
                element.find("." + me.opt.listCssName).html("");
                element.find("." + me.opt.contentCssName).html("");
                me.val(element.find("input"), "");
            }

            // 清空操作
            element.unbind("clean");
            element.bind("clean", function(e){

                me.clean();
                var dom = me._getSelectDom(element);

                if($.trim(me.opt.defText) != ""){
                    element.trigger("set", {"value":"" ,"text":me.opt.defText});
                    me._selectContent(dom, dom.find("." + me.opt.itemCssName).get(0));
                }

                if($(me.opt.child).length > 0){
                    $(me.opt.child).trigger("clean");
                }
            });

            // 设置子项目
            element.unbind("set");
            element.bind("set", function(e, opt){
                opt = opt || {};
                var tpl = me.opt.itemTpl;
                tpl = tpl.replace(/{(\w+)}/g, function(a, b){
                    if(b == "itemCssName"){
                        return me.opt[b];
                    }else if(b == "value"){
                        return $.trim(opt.value);
                    }else if(b == "text"){
                        return $.trim(opt.text);
                    }else {
                        return $.trim(opt[b]);
                    }
                });
                element.find("." + me.opt.listCssName).append(tpl);
            });

            // 加载状态
            element.unbind("loadStart");
            element.bind("loadStart", function(e){
                element.trigger("clean");
                me.clean();
                element.trigger("set", {"value":"" ,"text":"数据加载中..."});
                me.autoSelect(element, "");
            });

            // 添加状态
            element.unbind("addItem");
            element.bind("addItem", function(e, data){

                element.trigger("clean");

                if(data == null || data.data == null){
                    return;
                }
                $.each(data.data, function(index,item){
                    if(typeof(me.opt.getContent) == "function"){
                        var obj = me.opt.getContent.call(element,item,index);
                        element.trigger("set", obj);
                    }
                });

                me.autoSelect(element, "");

                if(typeof(me.opt.callback) == "function"){
                    me.opt.callback.call(me,me._getSelectDom(element), me.opt)
                }
            });

            // 搜索
            element.unbind("search");
            element.bind("search", function(e, data){
                data = data || {};
                var value = data.value;
                var text = data.text;

                if($.trim(me.opt.getData) == "" && typeof(me.opt.getParam) == "function"){
                    element.trigger("addItem",{
                        "data":me.opt.getParam(value, text)
                    });
                    return true;
                }else if($.trim(me.opt.getData) == ""){
                    alert("ERROR:形参getData和getParam不能都为空!");
                    return true;
                }

                element.trigger("loadStart");

                me.opt.getData && me.opt.getData.call(me, value, this);

            });

            // 内容改变
            element.unbind("contentChange");
            element.bind("contentChange", function(e){
                var value = $(this).attr("data-value");
                var text = $(this).html();
                if($(me.opt.child).length > 0){
                    $(me.opt.child).trigger("search",{
                        "value":value
                        ,"text":text
                    });
                }
            });

            // 初始化控件
            me._initSelect(element);

            // 是否默认执行搜索
            if(me.opt.isFirstLoad === true){
                element.trigger("search");
            }

            // 初始化相关事件
            me._initEvent(element);

            // 初始化完成回调
            if(typeof(me.opt.inited) == "function"){
                me.opt.inited.call(me,me._getSelectDom(element), me.opt)
            }
        }

        // 初始化控件
        ,_initSelect:function(element){
            var me = this;
            var opt = me.opt || {};
            element = $(element);
            if(me._getSelectDom(element).length == 0){

                var html = opt.selectTpl;
                html = html.replace(/{(\w+)}/g, function(a, b){
                    var css = me.opt[b];
                    css = $.trim(css) == "" ? "" : css;
                    return css;
                });

                element.append(html);
            }

            $.each(me.opt.propertys || {}, function(key, value){
                element.find("input").attr(key, value);
            });

            me._bindDOMClick(element);

        }

        // 绑定DOMClick事件;DOMClick事件是自定义的派发事件，在document上的click事件
        ,_bindDOMClick:function(element){
            var me = this;
            var selectorElement = me._getSelectDom(element);
            $(document).bind("DOMClick click", function(){
                me.hiddenList(selectorElement);
            });
        }

        // 绑定模拟select的相关事件
        ,_initEvent:function(element){
            var me = this;
            element = $(element);
            var cssNames = [];
            cssNames.push("." + me.opt.iconCssName);
            cssNames.push(me.opt.contentCssName);
            //cssNames.push("." + me.opt.listCssName);
            cssNames.push(me.opt.itemCssName);
            var selectorElement = me._getSelectDom(element);
            selectorElement.find("." + me.opt.listCssName).css({
                "max-height":me.opt.maxHeight
                ,"overflow-y":"auto"
            });

            // 事件绑定
            me._getSelectDom(element).off("click mouseenter mouseleave",cssNames.join(",."));
            me._getSelectDom(element).on("click mouseenter mouseleave",cssNames.join(",."),function(ev){

                // 下拉框的显示和隐藏
                if(($(this).hasClass(me.opt.contentCssName) || $(this).hasClass(me.opt.iconCssName)) && ev.type == "click"){
                    if(selectorElement.find("." + me.opt.listCssName + ":hidden").length > 0){
                        $(document).trigger("DOMClick");
                        if(me.canNotDownList !== true){
                            me.showList(selectorElement);
                        }
                    }else{
                        me.hiddenList(selectorElement);
                    }

                // 选中选项
                }else if($(this).hasClass(me.opt.itemCssName) && ev.type == "click"){
                    me._selectItem(selectorElement, this);
                    me.opt.selCallback && me.opt.selCallback.call(me, this, me.getValue(selectorElement));
                }else if($(this).hasClass(me.opt.itemCssName) && ev.type == "mouseenter"){
                    me._mouseenter(selectorElement, this);
                }else if($(this).hasClass(me.opt.itemCssName) && ev.type == "mouseleave"){
                    me._mouseleave(selectorElement, this);
                }

                return false
            });

            me.autoSelect(selectorElement);
        }

        /** 下拉事件是否不开启
         *
         *  @roclass    Selector
         *  @roname     setNotDownList
         *  @param      {Boolean}   canNotDownList     是否不启用下拉；默认启用
         *  @return     {Selector}  Selector的实例
         */
        ,setNotDownList:function(canNotDownList){
            var me = this;
            me.canNotDownList = canNotDownList === true ? true : false;
            if(me.canNotDownList){
                me._getSelectDom().find("." + me.opt.iconCssName).hide();
            }else{
                me._getSelectDom().find("." + me.opt.iconCssName).show();
            }
            return this;
        }

        /** 自动设置选中
         *
         *  @roclass    Selector
         *  @roname     autoSelect
         *  @param      {HTMLElement}   selectorElement     select的Dom元素,可选
         *  @param      {String}        arg_value           要被选中的值，和下拉框选项的某一value值一致的
         *  @param      {Boolean}       isNotForceHide      是否不强制隐藏列表         
         *  @return     {Selector}      Selector的实例
         */
        ,autoSelect:function(selectorElement, arg_value, isNotForceHide){

            var me = this;
            var isSet = false;
            isNotForceHide = isNotForceHide !== true ? false : true;
            if(arguments.length > 1){
                isSet = true;
            }

            selectorElement = $(selectorElement);
            if(selectorElement.length == 0){
                selectorElement = me._container;
            }

            $.each(selectorElement.find("." + me.opt.itemCssName), function(index, itemElement){
                itemElement = $(itemElement);
                var value = isSet ? arg_value : selectorElement.find("input").attr("data-value");
                var itemValue = itemElement.attr("data-value") == null ? itemElement.html() : itemElement.attr("data-value");

                if(value == itemValue){
                    me._selectItem(selectorElement, itemElement, isNotForceHide);
                    //itemElement.addClass(me.opt.onCssName);
                    //return false;
                }else{
                    itemElement.removeClass(me.opt.onCssName);
                }
            });

            return this;

        }

        /** 获取下拉框选中的值
         *
         *  @roclass    Selector
         *  @roname     getValue
         *  @param      {HTMLElement}   selectorElement     select的Dom元素,可选
         *  @return     {String}        返回下拉框选中的值
         */
        ,getValue:function(selectorElement){
            var me = this;
            selectorElement = $(selectorElement);
            if(selectorElement.length == 0){
                selectorElement = me._container;
            }
            var value = me.val(selectorElement.find("input"));
            return value;
        }

        /** 移除下拉Select组件
         *
         *  @roclass    Selector
         *  @roname     remove
         *  @param      {HTMLElement}   selectorElement     select的Dom元素,可选
         *  @return     {Selector}      Selector的实例
         */
        ,remove:function(selectorElement){
            var me = this;
            selectorElement = me._getSelectDom(selectorElement);
            selectorElement.remove();
            return this;
        }

        /** 隐藏下拉Select组件
         *
         *  @roclass    Selector
         *  @roname     hide
         *  @param      {HTMLElement}   selectorElement     select的Dom元素,可选
         *  @return     {Selector}      Selector的实例
         */
        ,hide:function(selectorElement){
            var me = this;
            selectorElement = me._getSelectDom(selectorElement);
            selectorElement.hide();
            return this;
        }

        /** 显示下拉Select组件
         *
         *  @roclass    Selector
         *  @roname     show
         *  @param      {HTMLElement}   selectorElement     select的Dom元素,可选
         *  @return     {Selector}      Selector的实例
         */
        ,show:function(selectorElement){
            var me = this;
            selectorElement = me._getSelectDom(selectorElement);
            selectorElement.show();
            return this;
        }

        /** 隐藏下拉框
         *
         *  @roclass    Selector
         *  @roname     hiddenList
         *  @param      {HTMLElement}   selectorElement     select的Dom元素,可选
         *  @return     {Selector}      Selector的实例
         */
        ,hiddenList:function(selectorElement){
            var me = this;
            selectorElement = $(selectorElement);
            if(selectorElement.length == 0){
                selectorElement = me._container;
            }
            var listElement = selectorElement.find("." + me.opt.listCssName);

            // 没有打开的，中止处理；
            if(!listElement.is(":visible")) return;

            selectorElement.find("." + me.opt.iconCssName).removeClass(me.opt.iconDownCssName);
            listElement.hide();
            selectorElement.css("z-index", me.opt.zIndex);
            this.opt.close && this.opt.close.call(me, listElement);
            return this;
        }

        /** 显示下拉框
         *
         *  @roclass    Selector
         *  @roname     showList
         *  @param      {HTMLElement}   selectorElement     select的Dom元素,可选
         *  @return     {Selector}      Selector的实例
         */
        ,showList:function(selectorElement){
            var me = this;
            selectorElement = $(selectorElement);
            if(selectorElement.length == 0){
                selectorElement = me._container;
            }
            selectorElement.find("." + me.opt.iconCssName).addClass(me.opt.iconDownCssName);
            selectorElement.css("z-index", parseInt(me.opt.zIndex) + 1);
            selectorElement.find("." + me.opt.listCssName).show();
            me._srcollTop(selectorElement.find("." + me.opt.listCssName));
            this.opt.open && this.opt.open.call(me, selectorElement.find("." + me.opt.listCssName));
            return this;
        }

        // 个性下拉框被选中选项的位置
        ,_srcollTop:function(listElement){
            var me = this;
            listElement = $(listElement);
            var onElememt = listElement.find("." + me.opt.onCssName).first();
            if(onElememt.length == 0){
                return ;
            }
            var height = onElememt.outerHeight();
            var scrollTop = listElement.scrollTop();
            var minPosition = listElement.offset().top;
            var maxPosition = minPosition + listElement.height() - height;
            var onPosition = onElememt.offset().top;

            // 在正常可视范围不做修改
            if(onPosition > minPosition && onPosition < maxPosition){
                return;
            }

            // 修正原始值
            listElement.scrollTop(0);
            onPosition = onElememt.offset().top;
            if(onPosition > minPosition && onPosition < maxPosition){
                return;
            }

            // 重新设定
            listElement.scrollTop(onPosition - minPosition);
            onPosition = onElememt.offset().top;
        }

        // 获取下拉Select的Dom
        ,_getSelectDom:function(element){

            var me = this;
            var selectorElement = null;
            var filter = "." + me.opt.widgetCssName;
            element = $(element);

            if(element.length == 0){
                element = me._container;
            }

            if(element.hasClass(me.opt.widgetCssName)){
                selectorElement = element.filter(filter);
            }else if(element.find(filter).length > 0){
                selectorElement = element.find(filter);
            }else if(element.parents(filter).length > 0){
                selectorElement = element.parents(filter);
            }else{
                selectorElement = $("");
            }

            return selectorElement;
        }

        // 选中某一select的指定选中Dom
        ,_selectItem:function(selectorElement, itemElement, isNotForceHide){
            var me = this;
            me._selectContent(selectorElement, itemElement);
            !isNotForceHide && me.hiddenList(selectorElement);
        }

        // 选中内容
        ,_selectContent:function(selectorElement, itemElement){
            var me = this;
            selectorElement = $(selectorElement);
            itemElement = $(itemElement);

            selectorElement.find("." + me.opt.itemCssName).removeClass(me.opt.onCssName);
            itemElement.addClass(me.opt.onCssName);
            selectorElement.find("." + me.opt.contentCssName).html(itemElement.html());
            var value = itemElement.attr("data-value") == null ? itemElement.html() : itemElement.attr("data-value");
            selectorElement.find("input").attr("data-value",value);
            me.val(selectorElement.find("input"), value);
            me.opt.changeCallback && me.opt.changeCallback.call(me, itemElement, value);

        }

        // 光标在下拉选项时,修改成光标在上面的样式
        ,_mouseenter:function(selectorElement, itemElement){
            var me = this;
            itemElement = $(itemElement);
            itemElement.addClass(me.opt.hoverCssName);
        }

        // 光标离开下拉选项时,修改成光标不在上面的样式
        ,_mouseleave:function(selectorElement, itemElement){
            var me = this;
            itemElement = $(itemElement);
            itemElement.removeClass(me.opt.hoverCssName);
        }

        /** 获取下拉列表的dom列表
         *
         *  @roclass    Selector
         *  @roname     getItems
         *  @param      {HTMLElement}   selectorElement     select的Dom元素,可选
         *  @return     {[HTMLElement]}  下拉列表的dom列表
         */
        ,getItems:function(selectorElement){
            var me = this;
            selectorElement = $(selectorElement);
            if(selectorElement.length == 0){
                selectorElement = me._container;
            }
            return selectorElement.find("." + me.opt.itemCssName);
        }

        /** 删除所有下拉项目
         *
         *  @roclass    Selector
         *  @roname     removeAllItems
         *  @param      {HTMLElement}   selectorElement     select的Dom元素,可选
         *  @return     {Selector}      Selector的实例
         */
        ,removeAllItems:function(selectorElement){
            var me = this;
            selectorElement = $(selectorElement);
            if(selectorElement.length == 0){
                selectorElement = me._container;
            }
            selectorElement.trigger("clean");
            return me;
        }

        /** 添加下拉项目
         *
         *  @roclass    Selector
         *  @roname     addChild
         *  @param      {Object}        itemData        单项目的数据，如：{value:"1",text:"123"}
         *  @return     {Selector}      Selector的实例
         */
        ,addItem:function(itemData){
            var me = this;
            var selectorElement = me._getSelectDom();
            if(selectorElement.length == 0){
                selectorElement = me._container;
            }
            selectorElement.trigger("set", itemData);
            return me;
        }

        /** 删除下拉项目(未实现)
         *
         *  @roclass    Selector
         *  @roname     removeItem
         *  @param      {HTMLElement}   itemElement     select的Dom元素,可选
         *  @param      {String}        value           指定value删除，优先使用value后itemElement；
         *  @return     {Selector}      Selector的实例
         */
        ,removeItem:function(itemElement, value){
            var me = this;
            
            return me;
        }
    });

    module.exports = Selector;
});
