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
				protocol: a.protocol.replace(':', ''),
				hash: a.hash.replace('#', '')
			};
		}

		//===========================================
		//公开方法
		var type = (function() {
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

		//遍历数组或对象
		var each = function(list, callback, isReverse) {
			var i, j;
			if (util.type.isArray(list)) {
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
				if (iscall && util.type.isFunction(val)) {
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
			type: type,
			each: each,
			getPath: getPath,
			cleanPath: cleanPath,
			getSingle: getSingle,
			stringify: stringify,
			mix: mix,
			islteIE7: islteIE7
		};
	}());
	var TYPE = util.type;

	//Url组件=================================================================
	var Url = function(opts) {
		// 继承父类属性
		ROCK.core.BaseClass.call(this);
		var me = this;
		//参数的默认配置
		var opt = {};
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
			// this.start();
			this._listenHashChange();
		},
		data: {},
		_getQuery: function(str) {
			var param = str.split('&');
			var result = {};
			if (!param[1]) return result;
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
			$(window).on('load', function() {
				me.hashchange(util.getPath(location.href));
			});
			$(window).on('hashchange', function() {
				me.hashchange(util.getPath(location.href));
			});
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
		//url2 update

		_listenHashChange: function() {
			var me = this;
			$(window).on('load', function() {
				me.hashchange(util.getPath(location.href));
			});
			$(window).on('hashchange', function() {
				me.hashchange(util.getPath(location.href));
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
