/**
 * @description [letv fe playground workflow]
 * @add by huangzhi@20151126
 * @update by huangzhi@20151126
 */
$(function() {
    var App = new RO.core.BaseClass();

    App = {
        globalData: {},
        init: function() {
            this.manageGlobalData();
            this.renderFrame();
        },
        manageGlobalData: function() {
            var self = this;
            $Le.plat.on('push.data', 'store', function(type, data) {
                $.extend(self.globalData, data);
                $Le.plat.trigger('push.data', 'distribute', self.globalData);
            });
            $Le.plat.on('push.data', 'fetch', function(type, data) {
                data.callback && data.callback(self.globalData);
            });
        },
        renderFrame: function() {
            $Le.useModel({
                "paths": [$Le.seaConfig.alias.workflow],
                "data": null
            });
        }
    };
    App.init();

});
