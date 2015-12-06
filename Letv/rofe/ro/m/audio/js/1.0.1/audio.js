;
define(ROCK.seaConfig.alias.audio, function(require, exports, module) {

    /** 音频组件、仅支持HTML5的Audio标签
     *
     *  @author ywchen(陈余文)
     *  @constructs Audio
     *  @date 2015.05.05
     *  @version 1.0.1
     *  @param {Object} opts			[*]参数
     *  @param {Object} opts.container	[*]音频Dom
     *  @param {Object} opts.url		[*]音频地址
     *  @param {Object} opts.propertys	音频Dom的属性
         	属性 				描述
			audioTracks 		返回表示可用音轨的 AudioTrackList 对象
			autoplay 			设置或返回是否在加载完成后随即播放音频/视频
			buffered 			返回表示音频/视频已缓冲部分的 TimeRanges 对象
			controller 			返回表示音频/视频当前媒体控制器的 MediaController 对象
			controls 			设置或返回音频/视频是否显示控件（比如播放/暂停等）
			crossOrigin 		设置或返回音频/视频的 CORS 设置
			currentSrc 			返回当前音频/视频的 URL
			currentTime 		设置或返回音频/视频中的当前播放位置（以秒计）
			defaultMuted 		设置或返回音频/视频默认是否静音
			defaultPlaybackRate	设置或返回音频/视频的默认播放速度
			duration 			返回当前音频/视频的长度（以秒计）
			ended 				返回音频/视频的播放是否已结束
			error 				返回表示音频/视频错误状态的 MediaError 对象
			loop 				设置或返回音频/视频是否应在结束时重新播放
			mediaGroup 			设置或返回音频/视频所属的组合（用于连接多个音频/视频元素）
			muted 				设置或返回音频/视频是否静音
			networkState 		返回音频/视频的当前网络状态
			paused 				设置或返回音频/视频是否暂停
			playbackRate 		设置或返回音频/视频播放的速度
			played 				返回表示音频/视频已播放部分的 TimeRanges 对象
			preload 			设置或返回音频/视频是否应该在页面加载后进行加载
			readyState 			返回音频/视频当前的就绪状态
			seekable 			返回表示音频/视频可寻址部分的 TimeRanges 对象
			seeking 			返回用户是否正在音频/视频中进行查找
			src 				设置或返回音频/视频元素的当前来源
			startDate 			返回表示当前时间偏移的 Date 对象
			textTracks 			返回表示可用文本轨道的 TextTrackList 对象
			videoTracks 		返回表示可用视频轨道的 VideoTrackList 对象
			volume 				设置或返回音频/视频的音量
     *  @param {Object} opts.events		音频Dom的事件
		    事件 				描述
			abort 				当音频/视频的加载已放弃时
			canplay 			当浏览器可以播放音频/视频时
			canplaythrough 		当浏览器可在不因缓冲而停顿的情况下进行播放时
			durationchange 		当音频/视频的时长已更改时
			emptied 			当目前的播放列表为空时
			ended 				当目前的播放列表已结束时
			error 				当在音频/视频加载期间发生错误时
			loadeddata 			当浏览器已加载音频/视频的当前帧时
			loadedmetadata 		当浏览器已加载音频/视频的元数据时
			loadstart 			当浏览器开始查找音频/视频时
			pause 				当音频/视频已暂停时
			play 				当音频/视频已开始或不再暂停时
			playing 			当音频/视频在已因缓冲而暂停或停止后已就绪时
			progress 			当浏览器正在下载音频/视频时
			ratechange 			当音频/视频的播放速度已更改时
			seeked 				当用户已移动/跳跃到音频/视频中的新位置时
			seeking 			当用户开始移动/跳跃到音频/视频中的新位置时
			stalled 			当浏览器尝试获取媒体数据，但数据不可用时
			suspend 			当浏览器刻意不获取媒体数据时
			timeupdate 			当目前的播放位置已更改时
			volumechange 		当音量已更改时
			waiting 			当视频由于需要缓冲下一帧而停止
     *  @param {Object} opts.fail		不支持HTML5.Audio标签时回调
     *  @param {Object} opts.width		音频Dom的宽度，默认150px
     *  @param {Object} opts.height		音频Dom的高度，默认50px
     *  @return {Audio} Audio的实例
     *  @example
            var audio = new Audio({
				"container":"#audioContainer"
				,"url":"http://music.baidu.com/cms/app/muplayer/test_mp3/1.mp3"
				,"autoplay":false
				,propertys:{
		    		loop:"loop"				// 是否循环播放
		    		,controls:"controls"	// 是否显示操作控件
		    		,autoplay:"autoplay"	// 是否自动播放
				}
				,events:{
					pause:function(){
						console.log("音频被暂停了");
					}
					,play:function(){
						console.log("音频被播放了");
					}
				}
			});
     */
    var Audio = function(opts) {

        // 继承父类属性
        ROCK.core.BaseClass.call(this);

        // 参数的默认值配置
        var opt = {
        	container:""				// 容器
        	,url:""						// 音频地址
        	,propertys:{
        		loop:"loop"				// 是否循环播放
        		,controls:"controls"	// 是否显示操作控件
        		,autoplay:"autoplay"	// 是否自动播放
        	}
        	,events:{
	        	play:function(){}		// 播放时被回调
	        	,pause:function(){}		// 暂时时被回调
        	}
        	,fail:function(){}			// 创建控件失败回调
        	,width:150					// 控件的宽度，默认150px
        	,height:50					// 控件的高度，默认50px
        }

        // 重置配置
        $.extend(opt, opts);

        // 参数
        this.opt = opt;
        
        // audio元素Dom的Id前缀
        this.prefix = "ro_audio_";
        
        // audio元素Dom的可操作对象
        this._player = null;
        
        this.MSG = {
        	"M001":"浏览器不支持HTML的audio控件!"
        }
        
        // 错误信息,目前未对错误信息分级别
        this._errorInfo = [];
        
        // 组件初始化
        this._init();
    }

    // 继承原型
    ROCK.core.BaseClass.extend(Audio);

    $.extend(Audio.prototype, {
    	
        /** 初始化预处理
         *
         *  @roclass Audio
         *  @roname _init
         *  @return {Audio} Audio的实例
         */
        _init:function(){
        	var me = this;
        	var opt = this.opt || {};
        	var tpl = null;
        	
        	// 获取模板
        	if(me.isSupportHtml5Audio()){
        		tpl = me._getHtml5Tpl();
        	}else{
        		
	        	// 初始化_player属性
	        	this._setPlayer();
        		opt.fail.call(this);
        		me._setErrorInfo(this.MSG.M001);
        		return false;
        	}
        	
        	// 模板引擎
        	tpl = tpl.replace(/{(\w*)}/g,function(a, b){
        		var rev = opt[b];
        		if(b == "id"){
        			rev = me._getId();
        		}
        		rev = rev == null ? "" : rev;
        		return rev;
        	});
        	
        	// 模板插入到页面中
        	$(opt.container).html(tpl);
        	// 初始化_player属性
        	this._setPlayer();
        	// 绑定事件
        	this._bind();
        	// 设置音频Dom属性
        	$.each(opt.propertys, function(key, value){
        		me.propertys(key, value);
        	});
        }
        
        /** 绑定事件
         *
         *  @roclass Audio
         *  @roname _bind
         *  @return {Audio} Audio的实例
         */
        ,_bind:function(){
        	var me = this;
        	var events = me._getUserEvents();
        	$.each(events, function(key, func){
        		if(typeof(func) != "function") return true;
        		(function(){
        			var callback = func;
		        	$(me.getDom()).bind(key, function(){
		        		callback.apply(me, arguments);
		        	});
        		})();
        	});
        }
        
        /** 设置错误信息
         *
         *  @roclass Audio
         *  @roname _setErrorInfo
         *  @return {Audio} Audio的实例
         */
        ,_setErrorInfo:function(msg){
        	this._errorInfo.push(msg);
        }
        
        /** 是否有错误信息
         *
         *  @roclass Audio
         *  @roname hasErrorInfo
         *  @return {Audio} Audio的实例
         */
        ,hasErrorInfo:function(msg){
        	return this._errorInfo.length > 0;
        }
        
        /** 清空错误信息
         *
         *  @roclass Audio
         *  @roname clearErrorInfo
         *  @return {Object} 错误信息列表
         */
        ,clearErrorInfo:function(msg){
        	return this._errorInfo;
        }
        
        /** 获取错误信息
         *
         *  @roclass Audio
         *  @roname getErrorInfo
         *  @return {Object} 错误信息列表
         */
        ,getErrorInfo:function(msg){
        	return this._errorInfo;
        }
        
        /** 获取用户传入的音频事件
         *
         *  @roclass Audio
         *  @roname _getUserEvents
         *  @return {Audio} Audio的实例
         */
        ,_getUserEvents:function(){
        	var opt = this.opt || {};
        	var events = (opt.events != null && typeof(opt.events) == "object") ? opt.events : {};
        	return events;
        }
        
        /** 初始化_player属性
         *
         *  @roclass Audio
         *  @roname _setPlayer
         *  @return {Audio} Audio的实例
         */
        ,_setPlayer:function(){
        	this._player = this.getDom() || {
        		play:function(){}					// 开始播放音频/视频
        		,pause:function(){}					// 暂停当前播放的音频/视频
        		,load:function(){}					// 重新加载音频/视频元素
        		,canPlayType:function(){return ""}	// 检测浏览器是否能播放指定的音频/视频类型
        		,addTextTrack:function(){}			// 向音频/视频添加新的文本轨道
        	}
        }
        
        /** 获取_player属性
         *
         *  @roclass Audio
         *  @roname _getPlayer
         *  @return {Object|HTMLElement} 音频操作实例
         */
        ,_getPlayer:function(){
        	return this._player;
        }
        
        /** 获取音频Dom的ID
         *
         *  @roclass Audio
         *  @roname _getId
         *  @return {String} 音频Dom的ID
         */
        ,_getId:function(){
        	return this.prefix + this.guid;
        }
        
        /** 获取音频Dom
         *
         *  @roclass Audio
         *  @roname getDom
         *  @return {HTMLElement} 音频Dom
         */
        ,getDom:function(){
        	return $("#" + this._getId()).get(0);
        }
        
        /** 提供向音频/视频添加新的文本轨道接口
         * 	所有主流浏览器都不支持 addTextTrack() 方法。
         *
         *  @roclass Audio
     	 *  @param {String} kind		规定文本轨道的类型。
     	 *  @param {String} label		字符串值，为文本轨道规定标签。用于为用户对文本轨道进行标识。
     	 *  @param {String} language	双字母语言代码，规定文本轨道的语言。
         *  @roname addTextTrack
         *  @return {Audio} Audio的实例
         */
        ,addTextTrack:function(){
        	return this._player.addTextTrack.apply(this._player,arguments);
        	//text.addCue(new TextTrackCue("Test text", 01.000, 04.000,"","","",true));
        }
        
        /** 提供检测浏览器是否能播放指定的音频/视频类型接口
         *
         *  @roclass Audio
         *  @roname canPlayType
     	 *  @param {String} type	规定要检测的音频/视频类型。
				常用值：
				video/ogg
				video/mp4
				video/webm
				audio/mpeg
				audio/ogg
				audio/mp4

				常用值，包括编解码器：
				video/ogg; codecs="theora, vorbis"
				video/mp4; codecs="avc1.4D401E, mp4a.40.2"
				video/webm; codecs="vp8.0, vorbis"
				audio/ogg; codecs="vorbis"
				audio/mp4; codecs="mp4a.40.5"

				注释：如果包含编解码器，则只能返回 "probably"。
				
         *  @return {String} 	"probably" - 最有可能支持
							    "maybe" - 可能支持
							    "" - （空字符串）不支持
         */
        ,canPlayType:function(type){
        	return this._player.canPlayType.apply(this._player,arguments);
        }
        
        /** 提供重新加载音频/视频元素接口
         *
         *  @roclass Audio
         *  @roname load
         *  @return {Audio} Audio的实例
         */
        ,load:function(){
        	this._player.load();
        	return this;
        }
        
        /** 提供播放接口
         *
         *  @roclass Audio
         *  @roname play
         *  @return {Audio} Audio的实例
         */
        ,play:function(){
        	this._player.play();
        	return this;
        }
        
        /** 提供暂停接口
         *
         *  @roclass Audio
         *  @roname pause
         *  @return {Audio} Audio的实例
         */
        ,pause:function(){
        	this._player.pause();
        	return this;
        }
        
        /**	设置/获取属性
         *  
         	属性 				描述
			audioTracks 		返回表示可用音轨的 AudioTrackList 对象
			autoplay 			设置或返回是否在加载完成后随即播放音频/视频
			buffered 			返回表示音频/视频已缓冲部分的 TimeRanges 对象
			controller 			返回表示音频/视频当前媒体控制器的 MediaController 对象
			controls 			设置或返回音频/视频是否显示控件（比如播放/暂停等）
			crossOrigin 		设置或返回音频/视频的 CORS 设置
			currentSrc 			返回当前音频/视频的 URL
			currentTime 		设置或返回音频/视频中的当前播放位置（以秒计）
			defaultMuted 		设置或返回音频/视频默认是否静音
			defaultPlaybackRate	设置或返回音频/视频的默认播放速度
			duration 			返回当前音频/视频的长度（以秒计）
			ended 				返回音频/视频的播放是否已结束
			error 				返回表示音频/视频错误状态的 MediaError 对象
			loop 				设置或返回音频/视频是否应在结束时重新播放
			mediaGroup 			设置或返回音频/视频所属的组合（用于连接多个音频/视频元素）
			muted 				设置或返回音频/视频是否静音
			networkState 		返回音频/视频的当前网络状态
			paused 				设置或返回音频/视频是否暂停
			playbackRate 		设置或返回音频/视频播放的速度
			played 				返回表示音频/视频已播放部分的 TimeRanges 对象
			preload 			设置或返回音频/视频是否应该在页面加载后进行加载
			readyState 			返回音频/视频当前的就绪状态
			seekable 			返回表示音频/视频可寻址部分的 TimeRanges 对象
			seeking 			返回用户是否正在音频/视频中进行查找
			src 				设置或返回音频/视频元素的当前来源
			startDate 			返回表示当前时间偏移的 Date 对象
			textTracks 			返回表示可用文本轨道的 TextTrackList 对象
			videoTracks 		返回表示可用视频轨道的 VideoTrackList 对象
			volume 				设置或返回音频/视频的音量
         *  @roclass Audio
         *  @roname propertys
         *  @return {Audio} Audio的实例
     	 *  @example
     	 		audio..propertys("volume",0.9) 	// 设置，audio是Audio的实例
     	 		audio..propertys("volume") 		// 获取，audio是Audio的实例
		 */
        ,propertys:function(property,value){
        	var audioDom = this.getDom() || {};
        	if(value == null){
        		// 获取属性值
        		return audioDom[property];
        	}else{
        		// 使用设置属性的方法
        		//$(audioDom).attr(property,value);
        		try{audioDom[property] = value;}catch(e){}
        		return this;
        	}
        }
        
        /** 判断是否支持HTML5的音频
         *
         *  @roclass Audio
         *  @roname isSupportHtml5Audio
         *  @return {boolean} 是否支持HTML5的音频
         */
        ,isSupportHtml5Audio:function(){
        	return !!(document.createElement('audio').canPlayType);
        }
        
        /** 获取HTML5的音频模板
         *
         *  @roclass Audio
         *  @roname _getHtml5Tpl
         *  @return {String} HTML5的音频模板
         */
        ,_getHtml5Tpl:function(){
        	return  '\
        		<audio id="{id}" src="{url}" style="width:{width}px;height:{height}px;">\
        		</audio>'
        }
        
    });
    
    module.exports = Audio;
});
