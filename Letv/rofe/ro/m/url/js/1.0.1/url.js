;
define(ROCK.seaConfig.alias.url, function(require, exports, module) {
	/** URI复现
	 *
	 * @author x4storm(黄志)
	 * @constructs Url
	 * @date 2015.08.26
	 * @param {Object} opts
	 * @return {Url} Router的实例
	 * @version 1.0.1
	 * @example
	 */

	/** 工具方法
	 *
	 * @returns {Object}
	 */

	var TYPE = (function() {
		var result = {};
		var types = ['Arguments', 'Function', 'String', 'Number', 'Date', 'RegExp', 'Error', 'Array'];
		for (var i = 0, t; t = types[i++];) {
			(function(t) {
				result['is' + t] = function(obj) {
					return Object.prototype.toString.call(obj) === '[object ' + t + ']';
				}
			})(t)
		}
		return result;
	})();

	var util = (function() {
		//私有方法
		function _toArray(a, n) {
			return Array.prototype.slice.call(a, n || 0);
		}

		function _parseURL(url) {
			var a = document.createElement('a');
			a.href = url;
			return {
				source: url,
				protocol: a.protocol,
				hash: a.hash
			};
		}

		//遍历数组或对象
		var each = function(list, callback, isReverse) {
			var i, j;
			if (TYPE.isArray(list)) {
				for (i = isReverse ? list.length - 1 : 0, j = isReverse ? 0 : list.length; isReverse ? i > j : i < j; isReverse ? i-- : i++) {
					if (callback(i, list[i]) === false) {
						break;
					}
				}
			} else if (typeof(list) === 'object') {
				for (i in list) {
					if (callback(i, list[i]) === false) {
						break;
					}
				}
			}
		};

		function getPath(url) {
			var path = _parseURL(url).hash;
			if (!path) return "/";
			if (path.charAt(0) != "/") path = "/" + path;
			return path;
		}

		function cleanPath(path) {
			//获取处理后的path,去除?和多余的/
			var tmp = path.split('?');
			if (tmp[1]) path = tmp[0];
			path = path.split('//').join('/');
			return path;
		}

		function getSingle(fn) {
			var result;
			return function() {
				return result || (result = fn.apply(this, arguments));
			}
		}

		function stringify(obj) {
			var a = [];
			for (key in obj) {
				a.push(key + '=' + obj[key]);
			}
			return a.join('&')
		}

		function mix(origin, obj, iscall) {
			for (var key in obj) {
				val = obj[key];
				if (iscall && TYPE.isFunction(val)) {
					console.log(val(origin));
					val = val(origin);
				}
				origin[key] = val;
			}
			return origin;
		}

		function islteIE7() {
			var ua = navigator.userAgent.toLocaleLowerCase();
			n = {
				version: (ua.match(/.+(?:rv|it|ra|ie|chrome)[\/: ]([\d.]+)/) || [])[1],
				ie: /msie/.test(ua) && !/opera/.test(ua)
			}
			return n.ie && n.version < 8;
		}

		return {
			each: each,
			getPath: getPath,
			cleanPath: cleanPath,
			getSingle: getSingle,
			stringify: stringify,
			mix: mix,
			islteIE7: islteIE7
		};
	}());

	var PATH = (function() {
		//public
		function parseURL(url) {
			var a = document.createElement('a');
			a.href = url;
			return {
				source: url,
				protocol: a.protocol,
				hash: a.hash,
				absUrl: /^http/i.test(a.href) ? a.href : a.getAttribute('href', 4)
			};
		}

		function normalize(path) {
			//对获取到的路径进行标准化，参考nodejs实现
			//对连续出现的/或\进行单一化(/\同时连续出现不处理)，并统一成/
			//TODO:可能会对..及.进行解析
			path = path.split(/\b\/+|\\+\b/).join('/');
			return path;
		}

		function getPath(url, bClean) {
			var path = parseURL(url).hash.replace(/^#/, '');
			if (!path) return "/";
			if (path.charAt(0) != "/") path = "/" + path;
			return bClean ? normalize(path) : path;
		}

		function parseStatus(path) {

		}

		function parseData(path) {

		}
		return {
			parseURL: parseURL,
			normalize: normalize,
			getPath: getPath,
			parseStatus: parseStatus,
			parseData: parseData
		};
	}());

	//Url组件=================================================================
	var Url = function(opts) {
		// 继承父类属性
		ROCK.core.BaseClass.call(this);
		var me = this;
		//参数的默认配置
		var opt = {
			hashClean: true,
			dataSeg: '@',
			linkIndetify: 'href'
		};
		//合并配置
		$.extend(opt, opts);
		//挂载参数
		this.opt = opt;
		//执行初始化
		me._init();
	}

	ROCK.core.BaseClass.extend(Url);
	//共享原型方法
	$.extend(Url.prototype, {
		_init: function() {
			this.start(); //deprecated
			this._listenHashChange();
			this.hijack();
		},
		//deprecated v0.0.1 start
		data: {},
		_getQuery: function(str) {
			var param = str.split('&');
			var result = {};
			if (!param[0].length) return result;
			$.each(param, function(index, item) {
				var pair = item.split('=');
				result[pair[0]] = pair[1];
			});
			return result;
		},
		_stringify: function(obj) {
			var a = [];
			for (key in obj) {
				a.push(key + '=' + obj[key]);
			}
			return a.join('&')
		},
		start: function() {
			var me = this;
			var hash = location.hash.replace(/^#/, '');
			if (hash.length > 1) {
				me.data = me._getQuery(hash);
			}
		},
		get: function() {
			this.data = this._getQuery(location.hash.replace(/^#/, ''));
			return this.data;
		},
		set: function(obj) {
			this.data = obj;
			location.hash = this._stringify(obj);
		},
		update: function(obj) {
			$.extend(this.data, obj);
			location.hash = this._stringify(this.data);
		},
		//deprecated v0.0.1 end
		//url2 update v0.0.2
		originUrl: '',
		originHash: '',
		path: '',
		statusPart: '',
		dataPart: '',
		_lastHash: '',
		_listenHashChange: function() {
			var me = this;
			$(window).on('load hashchange', function() {
				if (location.hash != me._lastHash) {
					$(window).trigger('custom.hashchange');
					// console.log('custom.hashchange', location.hash, me._lastHash)
					me._initData();
					me._lastHash = location.hash;
				}
			});
		},
		_initData: function() {
			this.originUrl = location.href;
			this.originHash = location.hash;
			var path = this.path = PATH.getPath(location.href, this.opt.hashClean);
			var tmpData = path.split(this.opt.dataSeg);
			this.statusPart = tmpData[0] ? tmpData[0] : '';
			this.dataPart = tmpData[1] ? tmpData[1] : '';
			// console.log(tmpData, this.statusPart, this.dataPart)
		},
		getHash: function() {
			var tmp;
			tmp = location.hash;
		},
		setHash: function(hash) {
			var tmp;
			if (!hash) tmp = "#";
			if (hash.charAt(0) != "#") tmp = "#" + hash;
			location.hash = this.originHash = this._lastHash = tmp;
		},
		//数据段操作
		store: function() {}, //增
		fetch: function() {
			console.log(this.dataPart)
		}, //查
		// update: function() {}, //改
		delete: function() {}, //删
		has: function() {}, //查
		//状态段操作
		setState: function() {},
		getState: function() {
			console.log(this.statusPart)
		},
		on: function() {},
		off: function() {},
		once: function() {},
		use: function() {},
		//劫持要转移状态的链接或元素
		hijack: function() {
			$(document).on('click', '[data-' + this.opt.linkIndetify + ']', function(e) {
				e.preventDefault();
				var ele = e.target;
				var $ele = $(this);
				// console.log($ele.attr('href'))
				var srcUrlObject = PATH.parseURL(ele.href);
				// console.log(srcUrlObject);
			});
		}
	});


	//类静态方法
	Url.redirect = function(path, obj) {
		if (path.indexOf('?') == -1 && obj) {
			path += '?' + util.stringify(obj);
		} else if (path.indexOf('?' >= 0) && obj) {
			path = path.split('?')[0] + '?' + util.stringify(obj);
		}
		window.location.hash = window.encodeURI(path);
	};

	module.exports = Url;
});
