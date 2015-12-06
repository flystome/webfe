;
define(ROCK.seaConfig.alias.router, function(require, exports, module) {
	/** 路由(URI复现)
	 *
	 * @author x4storm(黄志)
	 * @constructs Router
	 * @date 2015.08.26
	 * @param {Object} opts
	 * @return {Router} Router的实例
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

	//路由组件=================================================================
	var Router = function(opts) {
		// 继承父类属性
		ROCK.core.BaseClass.call(this);
		var me = this;
		//参数的默认配置
		var opt = {
			//路径字符串中正则类型
			types: {
				number: /^\d+$/,
				string: /^[^\/]+$/
			}
		};
		//合并配置
		$.extend(opt, opts);
		//私有属性
		this._data = {
			middlewares: []
		};
		//挂载参数
		this.opt = opt;
		//执行初始化
		me._init();
	}

	ROCK.core.BaseClass.extend(Router);
	//共享原型方法
	$.extend(Router.prototype, {
		_rigister: null,
		_init: function() {
			this._bindNotA();
			this.use(this._getQuery);
		},
		hashchange: function(path) {
			var me = this;
			var req = {
				path: path,
				rigister: me._rigister
			};
			var mdWares = this._data.middlewares;
			var mLen = mdWares.length;
			if (mLen == 0) {
				//doSomething
				return;
			}
			//执行中间件链
			+ function intec(i) {
				if (i == mLen) return;
				mdWares[i](req, function() {
					intec(i + 1);
				});
			}(0);
		},
		use: function(fn) {
			this._data.middlewares.push(fn);
		},
		start: function() {
			var me = this;
			$(window).on('load', function() {
				me.hashchange(util.getPath(location.href));
			});
			$(window).on('hashchange', function() {
				me.hashchange(util.getPath(location.href));
			});
		},
		get: function(path, callback) {
			//匹配路径的5种默认拦截器
			if (TYPE.isFunction(path)) this.use(this._get1(path, callback));
			if (TYPE.isRegExp(path)) this.use(this._get2(path, callback));
			if (!TYPE.isString(path)) return;
			var patt = path.split(':');
			var wildcard = path.split('*');
			var group = path.split('/$');
			if (patt.length != 1) {
				this.use(this._get3(patt, callback));
				return;
			}
			if (wildcard.length != 1) {
				this.use(this._get4(wildcard, callback));
				return;
			}
			this.use(this._get5(path, callback));
		},
		//内置路由拦截器实现
		_get1: function(fn, callback) {
			//function interceptor 当函数返回true时，执行拦截器链
			return function(req, next) {
				if (fn(util.cleanPath(req.path))) callback(req, next);
				else next();
			};
		},
		_get2: function(reg, callback) {
			//regular interceptor
			return function(req, next) {
				var param = reg.exec(util.cleanPath(req.path));
				if (param) {
					req.param = param;
					callback(req, next);
				} else next();
			};
		},
		_get3: function(patt, callback) {
			//:xxx 字符串路径中模式匹配
			var me = this;
			return function(req, next) {
				var reg = me.opt.types[patt[1]];
				var path = util.cleanPath(req.path);
				var param = path.slice(patt[0].length);
				if (path.indexOf(patt[0]) == 0 && reg.test(param)) {
					req.param = param;
					callback(req, next);
				} else next();
			};
		},
		_get4: function(wildcard, callback) {
			//通配符 interceptor
			return function(req, next) {
				if (util.cleanPath(req.path).indexOf(wildcard[0]) == 0) callback(req, next);
				else next();
			};
		},
		_get5: function(path, callback) {
			//string interceptor
			return function(req, next) {
				if (path == util.cleanPath(req.path)) callback(req, next);
				else next();
			};
		},
		_get6: function(group, callback) {
			//group interceptor
			return function(req, next) {
				//TODO
			};
		},
		//内置中间件实现
		_getQuery: function(req, next) {
			var query = req.path.split('?')[1];
			if (!query) {
				next();
				return;
			}
			var param = query.split('&');
			var result = {};
			util.each(param, function(index, item) {
				var pair = item.split('=');
				result[pair[0]] = pair[1];
			});
			req.query = result;
			next();
		},
		//兼容IE7以下
		_compatibleIE: function() {
			console.log('ie7');
			if (util.islteIE7()) {
				var lurl = window.location.href;
				window.setInterval(function() {
					var curl = window.location.href;
					if (lurl == curl) return;
					lurl = curl;
					if (window.onhashchange) {
						window.onhashchange();
					}
				})
			}
		},
		//添加非a标签的事件绑定
		_bindNotA: function() {
			var me = this;
			$(document).on('click', '[data-href]', function(e) {
				var href = $(this).attr('data-href');
				me._rigister = e.target;
				location.hash = href;
			});
		}
	});
	//类静态方法
	Router.redirect = function(path, obj) {
		if (path.indexOf('?') == -1 && obj) {
			path += '?' + util.stringify(obj);
		} else if (path.indexOf('?' >= 0) && obj) {
			path = path.split('?')[0] + '?' + util.stringify(obj);
		}
		window.location.hash = window.encodeURI(path);
	};

	module.exports = Router;
});
