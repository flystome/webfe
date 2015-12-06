;
define(ROCK.seaConfig.alias.muplayer, ["player"], function(require, exports, module) {
	
	require("player");

    /** 百度音乐播放内核；封装了下按seajs的格式输出,这里只将百度的命名空间_mu修改成Muplayer做seajs闭包内输出
     *
     *  @author ywchen(陈余文)
     *  @constructs Muplayer
     *  @date 2015.05.03
     *  @version 1.0.1
     *  @return 无返回值
     *  @example
     		// 下面的比较简单的样例，更多样例和API查看请上http://labs.music.baidu.com/muplayer/doc/
			seajs.use('muplayer', function(Muplayer){
				// 初始化一个MuPlayer的实例。
			    var player = new Muplayer.Player({
			        // baseDir是必填初始化参数
			        baseDir: ROCK.seaConfig.base + 'muplayer/js/0.9.2/'
			    });

			    // 通过add方法添加需要播放的音频，并调用play方法开始播放。
			    player.add('http://music.baidu.com/cms/app/muplayer/test_mp3/1.mp3').play();
			});
     */
    var Muplayer = _mu;
    
    module.exports = Muplayer;
});
