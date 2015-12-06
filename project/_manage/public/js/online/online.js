// $.ajax({
//     url: '/online/up',
//     type: 'get'
// }).done(function(data) {
//     console.log(data);
// });
$(function() {
    var page = {
        tmpl: function(tmpl, config) {
            return doT.template(tmpl)(config || {});
        },
        render: function(selector, config) {
            var html = $('#' + selector + '_view').html();
            $('.' + selector).html(this.tmpl(html, config));
        },
        init: function() {
            this.bind();
            this.render('j_config');
        },
        bind: function() {
            var me = this;
            $('.buttons').on('click', '[data-op]', function(e) {
                e.preventDefault();
                var op = $(this).data('op');
                me[op]($(this));
            });
        },
        uponline: function(btn) {
            var me = this;
            $.ajax({
                url: '/online/svnup',
                type: 'get',
                success: function(data, status, jqXHR) {
                    var con = 'j_online';
                    data = data.split('\n').slice(1);
                    var ddata = [];
                    $.each(data, function(index, item) {
                        ddata.push(item.replace(/\/.*static\//, ''));
                    });
                    me.render(con, {
                        content: ddata
                    });
                }
            });
        },
        setconfig: function(btn) {
            $('#j_config_data').text('正在生成配置文件...');
            var data = $('textarea').val();
            data = $.trim(data);
            if (data.length < 1) {
                alert('请输入要上线的文件');
                return;
            } else {
                data = data.split('\n');
            }
            $.ajax({
                url: '/online/generate',
                type: 'post',
                data: {
                    online: data
                },
                success: function(data, status, jqXHR) {
                    $('#j_config_data').text(data);
                }
            });
        },
        catconfig: function(btn) {
            $('#j_config_file').text('正在读取配置文件...');
            $.ajax({
                url: '/online/showconfig',
                type: 'get',
                success: function(data, status, jqXHR) {
                    $('#j_config_file').text(data.data);
                }
            });
        },
        doup: function(btn) {
            var me = this;
            $.ajax({
                url: '/online/up',
                type: 'get',
                success: function(data, status, jqXHR) {
                    // console.log(data);
                    // window.rdata = data;
                    var con = 'j_result';
                    me.render(con, {
                        content: data.data
                    });
                }
            });

        },
    };
    page.init();
});
