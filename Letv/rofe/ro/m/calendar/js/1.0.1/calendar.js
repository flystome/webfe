;
define(ROCK.seaConfig.alias.calendar, function(require, exports, module) {

    /** 日期组件
     *  this.opt.date和this.opt.input里的时间，优先显示this.opt.input里的时间；
     *
     *  @author ywchen(陈余文)
     *  @constructs Calendar
     *  @date 2015.05.03
     *  @version 1.0.1
     *  @param {Object} opts                            [*]参数
     *  @param {HTMLElement}    opts.container          [*]日期容器
     *  @param {HTMLElement}    opts.input              [*]获取被选中日期的Dom
     *  @param {Number}         opts.weekOffset         星期日的列排列顺序，传值被限制在-6到0之间，含0和-6；0时，在第一列，-1是在第二列，-2是在第三列，以此类推;当值大于0时按0算，当值小于-6时按-6计算,默认值0
     *  @param {Date}           opts.date               初始化的日期
     *  @param {Date}           opts.fromDate           日期可激活区间，开始区间
     *  @param {Date}           opts.toDate             日期可激活区间，结束区间
     *  @param {String}         opts.titleFormat        不可以带时分秒，默认值yyyy-MM-dd
     *  @param {String}         opts.format             日期输出格式代，默认值yyyy-MM-dd
     *  @param {String}         opts.cellTpl            时间格子的模板，默认值是'<span class="{className}" title="{title}" data-value="{dateStr}">{date}</span>'，其中{title}为按format格式的数据，{date}为单纯的日，{className}为相应的样式，{dateStr}是标准的输出格式yyyy/MM/dd hh:mm:ss
     *  @param {String}         opts.cssClearFloat      清除浮动样式，默认值clearx
     *  @param {String}         opts.cssAllClass        每个格式都有的样式，默认值ro_date_cell
     *  @param {String}         opts.unCurMonth         非当前月的日期的格子样式，默认值ro_date_hui
     *  @param {String}         opts.headCell           星期的头部格子样式，默认值ro_date_head
     *  @param {String}         opts.footCell           尾部的格子样式，默认值ro_date_foot
     *  @param {String}         opts.cssEnter           最后一个格子的样式，默认值ro_date_enter
     *  @param {String}         opts.htmlEnter          最后一个格子后插入的Dom，默认值<br class="ro_date_br">
     *  @param {String}         opts.cssLine            将格子变成一整行的样式，默认值ro_date_line
     *  @param {String}         opts.cssDisabled        不在可选中区间的日期格子样式，默认值ro_date_disabled
     *  @param {String}         opts.cssSelect          日期格子被选中时的样式，默认值ro_date_select
     *  @param {Number}         opts.max                最大输出的格子个数,暂时只支持42;默认值42
     *  @param {Boolean}        opts.hasHour            是否显示小时
     *  @param {Boolean}        opts.hasMinutes         是否显示分钟
     *  @param {Boolean}        opts.hasSeconds         是否显示秒
     *  @param {Boolean}        opts.isReject           是否存在显示排斥，一般是弹框的容器里会出现这样的需要
     *  @param {function}       opts.callback           选中是的回调
     *  @param {function}       opts.unAreaFail         当前要选中的时间不在可选区间中
     *  @param {function}       opts.unSelectDateFail   日期还未选中，不能直接修改时分秒
     *  @param {function}       opts.show               时间控件容器被显示回调
     *  @param {function}       opts.hide               时间控件容器被隐藏回调
     *  @return {Calendar}      Calendar的实例
     *  @example

            calendar1 = new Calendar({
                container:".J_list1"
                ,input:"#txtInput1"
                ,titleFormat:"yyyy年MM月dd日"
                ,format:"yyyy-MM-dd hh:mm:ss"
                ,callback:function(dateStr,dom){
                    //this.hide();
                    //log(arguments)
                }
                ,hasHour:true
                ,hasMinutes:true
                ,hasSeconds:true

                ,date:"2015/05/01"
                ,fromDate:"2015/04/01"
                ,toDate:"2015/06/23"


            });

            calendar2 = new Calendar({
                container:".J_list2"
                ,input:"#txtInput2"
                ,titleFormat:"yyyy年MM月dd日"
                ,format:"yyyy-MM-dd"
                ,callback:function(dateStr,dom){
                    //$("#txtInput").val(dateStr);
                    log(arguments)
                }
                ,hasHour:false
                ,hasMinutes:false
                ,hasSeconds:false

                //,date:"2015/05/01"
                //,fromDate:"2015/04/01"
                //,toDate:"2015/05/23"


            });

            calendar1.setMaxDate(calendar2);
            calendar2.setMinDate(calendar1);
     */
    var Calendar = function(opts) {

        // 继承父类属性
        ROCK.core.BaseClass.call(this);

        // 参数的默认值配置
        var opt = {
            container:null                          // 日期容器
            ,input:null                             // 获取被选中日期的Dom
            ,weekOffset:0                           // 星期日的列排列顺序，传值被限制在-6到0之间，含0和-6；0时，在第一列，-1是在第二列，-2是在第三列，以此类推;当值大于0时按0算，当值小于-6时按-6计算,默认值0
            ,date:null                              // 初始化的日期
            ,titleFormat:"yyyy-MM-dd"               // 不可以带时分秒，默认值yyyy-MM-dd
            ,format:"yyyy-MM-dd"                    // 日期输出格式代，默认值yyyy-MM-dd
            ,cellTpl:'<span class="{className}" title="{title}" data-value="{dateStr}">{date}</span>'   // 时间格子的模板，默认值是'<span class="{className}" title="{title}" data-value="{dateStr}">{date}</span>'，其中{title}为按format格式的数据，{date}为单纯的日，{className}为相应的样式，{dateStr}是标准的输出格式yyyy/MM/dd hh:mm:ss
            ,cssClearFloat:"clearx"                 // 清除浮动样式，默认值clearx
            ,cssAllClass:"ro_date_cell"             // 每个格式都有的样式，默认值ro_date_cell
            ,unCurMonth:"ro_date_hui"               // 非当前月的日期的格子样式，默认值ro_date_hui
            ,headCell:"ro_date_head"                // 星期的头部格子样式，默认值ro_date_head
            ,footCell:"ro_date_foot"                // 尾部的格子样式，默认值ro_date_foot
            ,cssEnter:"ro_date_enter"               // 最后一个格子的样式，默认值ro_date_enter
            ,htmlEnter:'<br class="ro_date_br">'    // 最后一个格子后插入的Dom，默认值<br class="ro_date_br">
            ,cssLine:"ro_date_line"                 // 将格子变成一整行的样式，默认值ro_date_line
            ,cssDisabled:"ro_date_disabled"         // 不在可选中区间的日期格子样式，默认值ro_date_disabled
            ,cssSelect:"ro_date_select"             // 日期格子被选中时的样式，默认值ro_date_select
            ,cssToday:"ro_date_today"               // 不在可选中区间的日期格子样式，默认值ro_date_today
            ,cssDone:"ro_date_done"                 // 日期格子被选中时的样式，默认值ro_date_done
            ,max:42                                 // 最大输出的格子个数,暂时只支持42;默认值42
            ,callback:null                          // 选中是的回调
            ,hasHour:false                          // 是否显示小时
            ,hasMinutes:false                       // 是否显示分钟
            ,hasSeconds:false                       // 是否显示秒
            ,fromDate:null                          // 日期可激活区间，开始区间
            ,toDate:null                            // 日期可激活区间，结束区间
            ,isReject:true                          // 是否存在显示排斥，一般是弹框的容器里会出现这样的需要
            ,unAreaFail:function(){}                // 当前要选中的时间不在可选区间中
            ,unSelectDateFail:function(){}          // 日期还未选中，不能直接修改时分秒
            ,show:function(){}                      // 时间控件容器被显示回调
            ,hide:function(){}                      // 时间控件容器被隐藏回调
        }

        // 重置配置
        $.extend(opt, opts);
        // 星期日在哪个列的索引下进行限定
        opt.weekOffset = opt.weekOffset > 0 ? 0 : (opt.weekOffset < -6 ? -6 : opt.weekOffset);

        // 参数
        this.opt = opt;

        this._year = null;                          // 当前显示的年
        this._month = null;                         // 当前显示的月
        this._date = null;                          // 当前选中的日
        this._selectDateStr = null;
        this._selectHMSStr = null;
        this.fromDate = opt.fromDate == null ? null : this.getObjectDate(opt.fromDate);
        this.toDate = opt.toDate == null ? null : this.getObjectDate(opt.toDate);

        this._formatAllStr = "yyyy/MM/dd hh:mm:ss"; // 年月日时分秒-本类所使用的统一内部处理方式
        this._formatYMDStr = "yyyy/MM/dd";          // 年月日-本类所使用的统一内部处理方式
        this._formatHMSStr = "hh:mm:ss";            // 时分秒-本类所使用的统一内部处理方式
        this.isBindDomClick = false;                // 是否绑定过Document的DOMClick事件

        // 初始化已填入时间
        this._initSelectDate();

        this.init();
    }

    // 继承原型
    ROCK.core.BaseClass.extend(Calendar);

    // 日期组件扩展
    $.extend(Calendar.prototype, {

        /** 组件初始化入口，初始化指定的年月的当月日期；没有指定时以参数this.opt.date为准；当this.opt.date没有时以当前日期为准
         *
         *  @roclass    Calendar
         *  @roname     init
         *  @param      {Number}    year        初始化日期的年,可不值就是今天的年月
         *  @param      {Number}    month       初始化日期的月,可不值就是今天的年月
         *  @return     {Calendar}  Calendar的实例
         *  @example
                var calendar = new Calendar();
                calendar.init();
         */
        init:function(year, month){

            if(year == null){
                var date = null;
                if($.trim(this._selectDateStr) != ""){
                    date = this.getObjectDate(this._selectDateStr);
                }else{
                    date =  this.getObjectDate(this.opt.date);
                }
                this._year = this._year || date.getFullYear();
                this._month = this._month || date.getMonth();
                this._date =  date.getDate();
            }else{
                this._year = year;
                this._month = month;
            }

            this.count = 0;
            var  html = this.renderMonth(this._year, this._month);
            $(this.opt.container).html(html);
            this._initHMS();
            this._bind();
            return this;
        }

        /** 日期组件显示
         *
         *  @roclass    Calendar
         *  @roname     show
         *  @return     {Calendar}  Calendar的实例
         *  @example
                var calendar = new Calendar();
                calendar.show();
         */
        ,show:function(){
            //this.init(null, null, this.getInputValue());
            $(this.opt.container).show();
            this.opt.show.call(this);
            return this;
        }

        /** 日期组件隐藏
         *
         *  @roclass    Calendar
         *  @roname     hide
         *  @return     {Calendar}  Calendar的实例
         *  @example
                var calendar = new Calendar();
                calendar.hide();
         */
        ,hide:function(){
            $(this.opt.container).hide();
            this.opt.hide.call(this);
            return this;
        }

        /** 获取日期输入框Dom的值
         *
         *  @roclass    Calendar
         *  @roname     getInputValue
         *  @return     {Calendar}      Calendar的实例
         *  @example
                var calendar = new Calendar();
                calendar.getInputValue();
         */
        ,getInputValue:function(){
            var me = this;
            var inputDom = $(me.opt.input);
            // 设置值到输入框中
            return this.val(inputDom);
        }

        /** 设置日期输入框Dom的值
         *
         *  @roclass    Calendar
         *  @roname     setInputValue
         *  @param      {String}        value       日期格式
         *  @return     {Calendar}      Calendar的实例
         *  @example
                var calendar = new Calendar();
                calendar.getInputValue();
         */
        ,setInputValue:function(value){
            var me = this;
            var inputDom = $(me.opt.input);
            // 设置值到输入框中
            if(typeof(inputDom.value) == "function"){
                inputDom.value(value);
            }else{
                inputDom.val(value);
            }
        }

        /** 获取指定日期的格子Dom
         *
         *  @roclass    Calendar
         *  @roname     getDateDom
         *  @param      {String}    dateStr     日期格式
         *  @return     {Calendar}  Calendar的实例
         *  @example
                var calendar = new Calendar();
                calendar.getDateDom("2015/10/10 00:00:00"); // 时分秒只能是00，因为格子就是00的
         */
        ,getDateDom:function(dateStr){

            return $(this.opt.container).find('.J_dateCell[data-value="' + this.format(new Date(dateStr), this._formatAllStr) + '"]')
        }

        /** 日期格式化函数
         *
         *  @roclass    Calendar
         *  @roname     format
         *  @param      {String|Number|Date}    date        日期,可日期格式的字符串、可毫秒的数值1433835125037、可时间对象
         *  @param      {String}                format      格式化格式
         *  @return     {String}    格式化了的时间
         *  @example
                var calendar = new Calendar();
                calendar.format(new Date(), "yyyy/MM/dd hh:mm:ss");             // 时间对象
                calendar.format(new Date().getTime(), "yyyy/MM/dd hh:mm:ss");   // 毫秒的数值
                calendar.format(“2013/02/09”, "yyyy/MM/dd hh:mm:ss");           // 日期格式的字符串
         */
        ,format:function(date, format){
            if(date == null || date == "")return "";
            date = this.getObjectDate(date);

            var o = {
            "M+" : date.getMonth() + 1, //month
            "d+" : date.getDate(), //day
            "h+" : date.getHours(), //hour
            "m+" : date.getMinutes(), //minute
            "s+" : date.getSeconds(), //second
            "q+" : Math.floor((date.getMonth()+3)/3), //quarter
            "S" : date.getMilliseconds() //millisecond
            }
            format = format || "yyyy/MM/dd hh:mm:ss";
            if(/(y+)/.test(format)) {
                format = format.replace(RegExp.$1, (date.getFullYear()+"").substr(4 - RegExp.$1.length));
            }

            for(var k in o){
                if(new RegExp("("+ k +")").test(format)) {
                    format = format.replace(RegExp.$1, RegExp.$1.length==1 ? o[k] : ("00"+ o[k]).substr((""+ o[k]).length));
                }
            }
            return format;
        }

        /** 不管日期是字符的还是对象的，最终能返回一个对象的日期，返回的时间可能是NULL
         *
         *  @roclass    Calendar
         *  @roname     getObjectCalendar
         *  @param      {String|Number|Date}    date        日期,可日期格式的字符串、可毫秒的数值1433835125037、可时间对象
         *  @return     {Calendar}  Calendar的实例
         *  @example
                var calendar = new Calendar();
                var date1 = calendar.format(new Date());             // 时间对象
                var date2 = calendar.format(new Date().getTime());   // 毫秒的数值
                var date3 = calendar.format(“2013/02/09”);           // 日期格式的字符串
         */
        ,getObjectCalendar:function(date){
            if($.trim(date) == ""){
                return null;
            }else{
                return this.getObjectDate(date);
            }
        }

        /** 不管日期是字符的还是对象的，最终能返回一个对象的日期，肯定能返回一个时间
         *
         *  @roclass    Calendar
         *  @roname     getObjectDate
         *  @param      {String|Number|Date}    date        日期,可日期格式的字符串、可毫秒的数值1433835125037、可时间对象
         *  @return     {Calendar}  Calendar的实例
         *  @example
                var calendar = new Calendar();
                var date1 = calendar.format(new Date());             // 时间对象
                var date2 = calendar.format(new Date().getTime());   // 毫秒的数值
                var date3 = calendar.format(“2013/02/09”);           // 日期格式的字符串
         */
        ,getObjectDate:function(date){
            if(date == null){
                return new Date();
            }else if(typeof(date) == "string"){ // 最好传值是2015/06/02格式的
                return new Date(date);
            }else if(typeof(date) == "number"){ // 只支持是时间戳的场合
                var date2 = new Date();
                date2.setTime(date2);
                return date2;
            }else{                              // 其它场合返回今天的日期
                return date;
            }
            return;
        }

        /** 渲染组件的主函数模板
         *
         *  @roclass    Calendar
         *  @roname     renderMonth
         *  @param      {Number}        year   初始化日期的年
         *  @param      {Number}        month  初始化日期的月
         *  @return     返回组件当前展示的模板
         *  @example
                var calendar = new Calendar();
                calendar.renderMonth(2015, 6);
         */
        ,renderMonth:function(year, month){
            var prevDate = this._getPrevMonthDate(year, month);
            var nextDate = this._getNextMonthDate(year, month);
            var firstDate = this._firstDate(year, month);
            var maxDate = this._getMaxDate(year, month + 1);
            var day = maxDate.getDate();
            var week = firstDate.getDay();
            week = week == -1 ? 6 : week;
            var html = [];
            var pStart = prevDate.getDate() - week + 1 + (this.opt.weekOffset);
            pStart = prevDate.getDate() - pStart > 7 ? pStart + 7 : pStart;

            // 当前显示年月和星期头部
            var head = this._getHeader();


            // 上个月的补充显示天数
            var tpl_a = this._getRenderTpl({
                year:prevDate.getFullYear()
                ,month:prevDate.getMonth()
                ,start:pStart
                ,end:prevDate.getDate()
                ,enable:false
            });

            // 当前月的天显示数
            var tpl_b = this._getRenderTpl({
                year:year
                ,month:month
                ,start:1
                ,end:day
                ,enable:true
            });

            // 下个月的补充显示天数
            var tpl_c = this._getRenderTpl({
                year:nextDate.getFullYear()
                ,month:nextDate.getMonth()
                ,start:1
                ,end:this.opt.max - day - (prevDate.getDate() - (pStart - 1))
                ,enable:false
            });

            // 尾部，时分秒
            var foot = this._getFooter();
            html.push(head);
            html.push(tpl_a);
            html.push(tpl_b);
            html.push(tpl_c);
            html.push(foot);
            return html.join("");
        }

        /** 调用关联的此Calendar实例的另外Calendar实例重载
         *
         *  @roclass    Calendar
         *  @roname     goReload
         *  @param      {String|Number|Date}    date        日期,可日期格式的字符串、可毫秒的数值1433835125037、可时间对象
         *  @return     {Calendar}  Calendar的实例
         *  @example
                var calendar = new Calendar();
                calendar.goReload(“2013/12/10”);
         */
        ,goReload:function(date){
            this.minDate && this.minDate.reload({
                "toDate":date
            });
            this.maxDate && this.maxDate.reload({
                "fromDate":date
            });
            return this;
        }

        /** 当本身有日期选中的时候，要修改关联的对象的可选中状态
         *
         *  @roclass    Calendar
         *  @roname     reload
         *  @param      {Object}    opt           [*]参数
         *  @param      {Date}      opt.toDate    [*]最大可选中时间,和fromDate必须至少有一个参数是有值的
         *  @param      {Date}      opt.fromDate  [*]最小可选中时间,和toDate必须至少有一个参数是有值的
         *  @return 返回组件当前展示的模板
         *  @example
                var calendar = new Calendar();
                calendar.reload({
                    "fromDate":"2012/12/12"
                    "toDate":"2013/12/12"
                });
         */
        ,reload:function(opt){

            var me = this;
            var fromDate = null;
            var toDate = null;
            // 当构造时间出来的时候，的最大和最小值应该是它本身的最大限定，当此opt中的时间不在这些限定时，fromDate以最大限定为准; toDate以最小的为准
            if($.trim(opt.fromDate) != ""){
                fromDate = this._getDiffMaxDate(opt.fromDate, this.opt.fromDate);
            }
            if($.trim(opt.toDate) != ""){
                toDate = this._getDiffMinDate(opt.toDate, this.opt.toDate);
            }

            if((fromDate != null && this.fromDate != fromDate) || (toDate != null && this.toDate != toDate)){
                this.fromDate = fromDate != null ? fromDate : this.fromDate;
                this.toDate = toDate != null ? toDate : this.toDate;
                this.init(this.year, this.month);
            }
        }

        /** 设置最小时间的对象
         *
         *  @roclass    Calendar
         *  @roname     setMinDate
         *  @param      {Calendar}  arg_calendar    关联的Calendar对象的实例
         *  @return     {Calendar}  Calendar的实例
         *  @example
                var calendar1 = new Calendar();
                var calendar2 = new Calendar();
                calendar1.setMinDate(calendar2);
         */
        ,setMinDate:function(arg_calendar){

            this.minDate = arg_calendar;
            //this.goReload(null, true);
            //arg_calendar.setMaxDate(this);
            this.reload({
                "fromDate":arg_calendar.getDate()
            });
            return this;
        }

        /** 设置最大时间的对象
         *
         *  @roclass    Calendar
         *  @roname     setMaxDate
         *  @param      {Calendar}  arg_calendar    关联的Calendar对象的实例
         *  @return     {Calendar}  Calendar的实例
         *  @example
                var calendar1 = new Calendar();
                var calendar2 = new Calendar();
                calendar2.setMaxDate(calendar1);
         */
        ,setMaxDate:function(arg_calendar){

            this.maxDate = arg_calendar;
            //this.goReload(null, true);
            //arg_calendar.setMinDate(this);
            this.reload({
                "toDate":arg_calendar.getDate()
            });
            return this;
        }

        /** 初始化上个月显示
         *
         *  @roclass    Calendar
         *  @roname     prevMonth
         *  @return     {Calendar}  Calendar的实例
         *  @example
                var calendar = new Calendar();
                calendar.prevMonth();
         */
        ,prevMonth:function(){
            var pDate = this._getPrevMonthDate(this._year, this._month);
            this.init(pDate.getFullYear(), pDate.getMonth());
            return this;
        }

        /** 初始化下个月显示
         *
         *  @roclass    Calendar
         *  @roname     nextMonth
         *  @return     {Calendar}  Calendar的实例
         *  @example
                var calendar = new Calendar();
                calendar.nextMonth();
         */
        ,nextMonth:function(){
            var nextDate = this._getNextMonthDate(this._year, this._month);
            this.init(nextDate.getFullYear(), nextDate.getMonth());
            return this;
        }

        /** 初始化上个年显示
         *
         *  @roclass    Calendar
         *  @roname     prevYear
         *  @return     {Calendar}  Calendar的实例
         *  @example
                var calendar = new Calendar();
                calendar.prevYear();
         */
        ,prevYear:function(){
            var pDate = this._firstDate(--this._year, this._month);
            this.init(pDate.getFullYear(), pDate.getMonth());
            return this;
        }

        /** 初始化下个年显示
         *
         *  @roclass    Calendar
         *  @roname     nextYear
         *  @return     {Calendar}  Calendar的实例
         *  @example
                var calendar = new Calendar();
                calendar.nextYear();
         */
        ,nextYear:function(){
            var nextDate = this._firstDate(++this._year, this._month);
            this.init(nextDate.getFullYear(), nextDate.getMonth());
            return this;
        }

        // 日期组件的内部事件绑定初始化
        ,_bind:function(){
            var me = this;

            // 选中某一天
            $(me.opt.container).off("click");
            me.opt.isReject !== false && $(me.opt.container).on("click", "*", function(e){
                me._triggerDOMClick(e);
                return false
            });
            $(me.opt.container).on("click" ,".J_dateCell", function(e){
                me._selectDateEvent(this);
            });

            // 上一年
            $(me.opt.container).find(".J_prevYear").click(function(e){
                me._triggerDOMClick(e);
                me.prevYear();
                return false
            });
            // 上一月
            $(me.opt.container).find(".J_prevMonth").click(function(e){
                me._triggerDOMClick(e);
                me.prevMonth();
                return false
            });
            // 下一年
            $(me.opt.container).find(".J_nextYear").click(function(e){
                me._triggerDOMClick(e);
                me.nextYear();
                return false
            });
            // 下一月
            $(me.opt.container).find(".J_nextMonth").click(function(e){
                me._triggerDOMClick(e);
                me.nextMonth();
                return false
            });

            // 今天
            $(me.opt.container).find("." + me.opt.cssToday).click(function(e){
                me._triggerDOMClick(e);
                me._selectTodayEvent();
            });

            // 输入框获得光标或被点击显示
            $(me.opt.input).bind("click focus", function(e){
                me._triggerDOMClick(e);
                me.show();
                return false
            });

            // 关闭
            $(me.opt.container).find(".J_close").bind("click", function(e){
                me._triggerDOMClick(e);
                me.hide();
            });

            // 隐藏
            if(me.opt.isReject !== false && me.isBindDomClick == false){
                me.isBindDomClick = true;
                $(document).bind("DOMClick click", function(e, data){
                    e = data ? (data.event ? data.event : e) : e;
                    var containerDom = $(me.opt.container).get(0);
                    var inputDom = $(me.opt.input).get(0);

                    if(e.target == null || (containerDom == null && inputDom == null)){
                        return;
                    }

                    if(!((containerDom && $.contains(containerDom, e.target)) || (inputDom && $.contains(inputDom, e.target)) || $(me.opt.input).get(0) == e.target)){
                        me.hide();
                    }
                });
                // $(me.opt.container).on("click" ,".J_dateCell", function(){
                //     me._selectDateEvent(this);
                // });
            }

            // 时分秒被改变时
            $(me.opt.container).find(".J_hour:visible,.J_minute:visible,.J_second:visible").bind("change", function(){
                me._changeDateEvent();
            });

        }

        ,_triggerDOMClick:function(e){
            $(document).trigger("DOMClick", {
                "event":e
            })
        }

        // 时分秒选中被改变时触发
        ,_changeDateEvent:function(){
            var me = this;

            if(me._selectDateStr == null){
                me.opt.unSelectDateFail.call(me);
                return
            }

            var date = new Date(me._selectDateStr);
            date.setHours(0);
            date.setMinutes(0);
            date.setSeconds(0);

            me._select(me._selectDateStr);
        }
        // 日期选中被改变时触发
        ,_selectDateEvent:function(selectElement){
            var me = this;

            var dateStr = $(selectElement).attr("data-value");
            if(!me._isEnableDate(dateStr)){
                me.opt.unAreaFail.call(me, dateStr);
                return;
            }
            if(me.opt.isReject !== false){
                me.hide();
            }
            var date = new Date(dateStr);
            // 初始化到要选中日期的年月去；
            if(date.getFullYear() != me._year || date.getMonth() != me._month){
                me.init(date.getFullYear(), date.getMonth());
            }
            me._select(dateStr);
        }
        // 今天的按钮被点击时
        ,_selectTodayEvent:function(){
            var me = this;
            var date = new Date();
            date.setHours(0);
            date.setMinutes(0);
            date.setSeconds(0);
            var dateStr = me.format(date, me._formatAllStr);
            if(!me._isEnableDate(dateStr)){
                me.opt.unAreaFail.call(me, dateStr);
                return;
            }

            if(me.opt.isReject !== false){
                me.hide();
            }

            // 初始化到要选中日期的年月去；
            if(date.getFullYear() != me._year || date.getMonth() != me._month){
                me.init(date.getFullYear(), date.getMonth());
            }
            me._select(dateStr);
        }
        // 初始化时分秒下拉框
        ,_initSelectDate:function(){
            var me = this;
            var val = this.getInputValue();
            val = this._replaceDateFormat(val);
            val = val.replace(/[时分秒]/g, ":").replace(/:$/,"");
            var date = new Date(val);

            // 非正常的时间格式
            if(isNaN(date.getMonth())){
                return;
            }
            var dateStr = me.format(date,"yyyy/MM/dd hh:mm:ss");
            me._selectDateStr = dateStr.split(" ")[0];
            me._selectHMSStr = dateStr.split(" ")[1];
        }
        // 替换成本程序使用的标准日期格式
        ,_replaceDateFormat:function(dateStr){
            dateStr = $.trim(dateStr);
            dateStr = dateStr.replace(/[年月\.-]/g,"/").replace(/\/$/,"");
            dateStr = dateStr.replace(/[日]/g,"").replace(/\/$/,"");
            return dateStr;
        }
        // 是否可选中日期
        ,_isCheckSelect:function(dateStr){
            dateStr = this._replaceDateFormat(dateStr);
            if(me._selectDateStr == dateStr){
                return true;
            }
            return false;
        }
        // 设置选中的日期
        ,_setSelect:function(dateStr){

            var me = this;
            me._selectDateStr = me.format(dateStr, me._formatYMDStr);

            // 不能这样用，因为今天和其它的不一样
            //dom.siblings().removeClass(me.opt.cssSelect);
            $(me.opt.container).find(".J_dateCell").removeClass(me.opt.cssSelect);
            me.getDateDom(dateStr).addClass(me.opt.cssSelect);
            //$(me.opt.container).find('.J_dateCell[data-value="' + me.format(new Date(dateStr), me._formatAllStr) + '"]').addClass(me.opt.cssSelect);
        }
        // 设置选中的时分秒
        ,_setSelectHMS:function(date){
            var me = this;
            var hour = parseInt($(me.opt.container).find(".J_hour:visible").val());
            var minute = parseInt($(me.opt.container).find(".J_minute:visible").val());
            var second = parseInt($(me.opt.container).find(".J_second:visible").val());
            date = this.getObjectCalendar(date);
            if(date == null) return null;
            date.setHours(hour || 0);
            date.setMinutes(minute || 0);
            date.setSeconds(second || 0);
            return date;
        }
        // 触发选中
        ,_select:function(dateStr){

            var me = this;
            if($.trim(dateStr) == "" || !me._isEnableDate(dateStr)){
                $.trim(dateStr) != "" && me.opt.unAreaFail.call(me, dateStr);
                return;
            }

            me._setSelect(dateStr);

            var date = me._setSelectHMS(dateStr);

            // --- debug --- 当dateStr的时间为带时分秒或哪怕只带一种时都不兼容

            var resultDate = me.format(date, me.opt.format);
            me.goReload(me.format(date, me._formatAllStr));

            me.setInputValue(resultDate);

            me.opt.callback && me.opt.callback.call(me, resultDate);
        }
        // 组件头部
        ,_getHeader:function(){
            var weeks = ["日","一","二","三","四","五","六"];
            var tpl = this.opt.cellTpl || "";
            var html = [];
            var offset = this.opt.weekOffset;
            var seq = null;
            var me = this;
            html.push(tpl.replace(/{(\w+)}/g, function(a, b){
                if(b == "className"){
                    return me.opt.cssAllClass + " " + me.opt.cssLine + " " + me.opt.cssEnter;
                }else if(b == "title" || b == "dateStr"){
                    return "";
                }else{
                    return '<div class="ro_date_btn ro_date_left J_prevYear">&lt;&lt;</div><div class="ro_date_btn ro_date_left J_prevMonth">&lt;</div>' + me._fillZero(me._year) + "年" + me._fillZero(me._month + 1, 2) + "月" + '<div class="ro_date_btn ro_date_right J_nextYear">&gt;&gt;</div><div class="ro_date_btn ro_date_right J_nextMonth">&gt;</div>';
                }
            }));
            //html.push(me.opt.htmlEnter);

            $.each(weeks, function(index, item){
                me.count++;
                html.push(tpl.replace(/{(\w+)}/g, function(a, b){
                    if(b == "className"){
                        return me.opt.cssAllClass + " " + me.opt.cssClearFloat + " " + me.opt.headCell + (me.count % 7 == 0 ? " " + me.opt.cssEnter : "");
                    }else{
                        seq = weeks.length - (weeks.length - offset) + index;
                        seq = seq < 0 ? weeks.length + seq : seq;
                        return (b == "title" || b == "dateStr") ? "星期" + weeks[seq] : weeks[seq];
                    }
                }));
                if(me.count % 7 == 0){
                    html.push(me.opt.htmlEnter);
                }

            });
            return html.join("");
        }
        // 组件尾部
        ,_getFooter:function(){
            var me = this;
            var tpl = this.opt.cellTpl || "";
            var html = [];

            // 配置要求没有时分秒时
            // if(!this.hasHour && !this.hasMinutes && !this.hasSeconds){
            //     return "";
            // }

            html.push(tpl.replace(/{(\w+)}/g, function(a, b){
                if(b == "className"){
                    return me.opt.cssAllClass + " " + me.opt.cssClearFloat + " " + me.opt.footCell + " " + me.opt.cssLine + " " + me.opt.cssEnter;
                }else if(b == "title" || b == "dateStr"){
                    return "";
                }else{
                    return me._getHMSHtml();
                }
            }));
            return html.join("");
        }
        // 日期格子
        ,_getRenderTpl:function(opt){
            var me = this;
            var year = opt.year;
            var month = opt.month;
            var areaStart = opt.start;
            var areaEnd = opt.end;
            var isEnable = opt.enable;
            var tpl = this.opt.cellTpl || "";
            var html = [];

            for(var m = areaStart; m <= areaEnd; m++ ){
                me.count++;
                // 加7表示除去头部的显示的周几
                if(me.count > me.opt.max + 7)continue;
                html.push(tpl.replace(/{(\w+)}/g, function(a, b){
                    if(b == "date"){
                        return me._fillZero(m, 2);
                    }else if(b == "className"){
                        return me._addClass(isEnable, year, month, m);
                    }else if(b == "dateStr"){
                        return me.format(me._getDate(year,month, m), me._formatAllStr);
                    }else{
                        return me.format(me._getDate(year,month, m), me.opt.titleFormat);
                    }
                }));
                if(me.count % 7 == 0){
                    html.push(me.opt.htmlEnter);
                }
            }
            return html.join("");
        }
        // 日期格子添加的样式
        ,_addClass:function(isEnable,year, month, m){
            var me = this;

            // J_dateCell代表为时间的格子
            var classes = [me.opt.cssAllClass, "J_dateCell"];

            // 是否是当前月
            if(!isEnable){
                classes.push(me.opt.unCurMonth);
            }

            // 一行7格，最后一个换行
            if(me.count % 7 == 0){
                classes.push(me.opt.cssEnter);
            }

            // 是否在可用区间日期中
            if(!me._isEnableDate(year+ "/" + (month + 1) + "/" + m)){
                classes.push(me.opt.cssDisabled);
            }

            // 设置选中
            if(me._isEnableDate(year+ "/" + (month + 1) + "/" + m) && $.trim(me._selectDateStr) == me.format(me._getDate(year, month, m), me._formatYMDStr)){
                //me.goReload(me.format(me._getDate(year, month, m), this._formatAllStr));
                classes.push(me.opt.cssSelect);
            }

            return classes.join(" ");
        }
        // 是否是可用是日期判断
        ,_isEnableDate:function(date){
            if(date == null || date == "") return false;
            var opt = this.opt;
            var me = this;
            var rev = false;
            date = this.getObjectDate(date);
            if(this.fromDate == null && this.toDate == null){
                rev = true;
            }else if(this.fromDate != null && this.toDate != null){
                rev = this.fromDate.getTime() <= date.getTime() && this.toDate.getTime() >= date.getTime();
            }else if(this.fromDate != null){
                rev = this.fromDate.getTime() <= date.getTime();
            }else{
                rev = this.fromDate.toDate() >= date.getTime();
            }
            return rev;
        }
        // 比较两个时间，返回最大的；如果其它一个为空返回不为空的；如果两个都为空，返回结果是NULL
        ,_getDiffMaxDate:function(dateA, dateB){
            var aCalendar = this.getObjectCalendar(dateA);
            var bCalendar = this.getObjectCalendar(dateB);
            if(aCalendar == null && bCalendar == null){
                return null;
            }else if(aCalendar != null && bCalendar != null){
                return aCalendar.getTime() > bCalendar.getTime() ? aCalendar : bCalendar;
            }else if(aCalendar != null){
                return aCalendar;
            }else{
                return bCalendar;
            }
        }
        // 比较两个时间，返回最小的；如果其它一个为空返回不为空的；如果两个都为空，返回结果是NULL
        ,_getDiffMinDate:function(dateA, dateB){
            var aCalendar = this.getObjectCalendar(dateA);
            var bCalendar = this.getObjectCalendar(dateB);
            if(aCalendar == null && bCalendar == null){
                return null;
            }else if(aCalendar != null && bCalendar != null){
                return aCalendar.getTime() > bCalendar.getTime() ? bCalendar : aCalendar;
            }else if(aCalendar != null){
                return aCalendar;
            }else{
                return bCalendar;
            }
        }
        ,_getHMSHtml:function(){
            var html = [];
            html.push('<div class="ro_date_btn ro_date_left ' + this.opt.cssToday + '">今天</div>');

            this.opt.hasHour && html.push('<select class="J_hour"></select>时');
            this.opt.hasMinutes && ((this.opt.hasHour && html.push(':')) | html.push('<select class="J_minute"></select>分'));
            this.opt.hasSeconds && (((this.opt.hasHour || this.opt.hasMinutes) && html.push(':')) | html.push('<select class="J_second"></select>秒'));
            (this.opt.hasHour || this.opt.hasMinutes || this.opt.hasSeconds) && html.push('<div class="ro_date_btn ro_date_right done J_close">关闭</div>');

            return html.join("");
        }
        // 初始化时分秒
        ,_initHMS:function(){

            var houtElement = $(this.opt.container).find(".J_hour");
            var minuteElement = $(this.opt.container).find(".J_minute");
            var seconeElemnt = $(this.opt.container).find(".J_second");
            var hmsArr = $.trim(this._selectHMSStr).split(":");
            this._setOption(houtElement, 0, 23, 2);
            this._setOption(minuteElement, 0, 59, 2);
            this._setOption(seconeElemnt, 0, 59, 2);

            houtElement.val(this._getNumber(hmsArr[0], false, 2));
            minuteElement.val(this._getNumber(hmsArr[1], false, 2));
            seconeElemnt.val(this._getNumber(hmsArr[2], false, 2));
        }
        // 只获得数值型,可前补0
        ,_getNumber:function(value, isEmpry, maxLength){
            if(value == null && isEmpry && (maxLength == null || maxLength < 1)){
                return "";
            }else if(value == null || isNaN(value)){
                value = 0;
            }
            return this._fillZero(value, maxLength);
        }
        // 初始化时间的时分秒下拉菜单
        ,_setOption:function(element, start, end, maxLength){
            element = $(element);
            for(var m = start; m <= end; m++){
                element.append('<option value="' + this._fillZero(m, maxLength) + '">' + this._fillZero(m, maxLength)  + '</option>');
            }
        }
        // 数值补位
        ,_fillZero:function(value, maxLength){
            maxLength = maxLength || 0;
            if(value == null || isNaN(value)) return "";
            value = $.trim(value);
            var rev = value;
            var length = value.length;
            for(var i = length; i < maxLength; i++){
                rev = "0" + rev;
            }
            return rev;
        }
        // 根据年月日，获取时间对象
        ,_getDate:function(year, month, date){

            return new Date(parseInt(year, 10), parseInt(month, 10), parseInt(date, 10));
        }
        // 废弃的函数
        ,_get:function(year, month, offsetMonth){
            var pyear = year,pmonth = month;
            year = parseInt(year, 10);
            month = parseInt(month, 10);
            offsetMonth = parseInt(offsetMonth, 10);
            month += offsetMonth;
            //if(month > 12){
            year += Math.floor(month / 12);
            if(month >= 0){
                month = Math.floor(month % 12);
            }else{
                month = 12 + Math.floor(month % 12);
            }
            return this._firstDate(year, month, 1);
        }
        // 根据指定年月，获取上个月
        ,_getPrevMonthDate:function(year, month){
            var date = this._firstDate(year, month);
            var day = date.getDate();
            date.setDate(day - 1);
            return date;
        }
        // 根据指定年月，获取下个月
        ,_getNextMonthDate:function(year, month){
            var date = this._getMaxDate(year, month + 2);
            return date;
        }
        // 获取指定年月的第一天日期对象
        ,_firstDate:function(year, month){

            return this._getDate(year, month, 1);
        }
        // 获取指定年月的最后一天日期对象
        ,_getMaxDate:function(year, month){

            return this._getDate(year, month, 0);
        }
        // 获取当前
        ,getDate:function(){
            var date = new Date(this._selectDateStr + " " + this._selectHMSStr);
            if(isNaN(date.getTime())){
                return null;
            }else{
                return date;
            }
        }
    });
    module.exports = Calendar;
});
