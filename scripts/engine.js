Test = (function() {			
	
	var blacklists = {};
	var whitelists = {};
	
	function test (c) { this.initialize(c) }
	test.prototype = {
		suites: [ 
			[ testSugar ],
			[ testAsm ]
		],
		
		initialize: function(c) {					
			blacklists = {
				dateFields:			Browsers.isBrowser('Maxthon') || Browsers.isBrowser('UC Browser'),
				colorField:			Browsers.isBrowser('Maxthon') || Browsers.isBrowser('UC Browser'),
				rangeField:			Browsers.isBrowser('UC Browser'),
				subtitle:			Browsers.isBrowser('Maxthon'),
				getUserMedia:		Browsers.isBrowser('Maxthon') || Browsers.isBrowser('UC Browser') || Browsers.isBrowser('Dolphin'),
				webgl:				Browsers.isBrowser('Maxthon'),
			};		
			
			whitelists = {
				contentEditable:	Browsers.isType('desktop') ||
									Browsers.isType('mobile', 'tablet', 'media') && (
										Browsers.isOs('iOS', '>=', '5') || 
										Browsers.isOs('Android', '>=', '4') || 
										Browsers.isOs('Windows Phone', '>=', '7.5') || 
										Browsers.isOs('BlackBerry') || 
										Browsers.isOs('BlackBerry OS') || 
										Browsers.isOs('BlackBerry Tablet OS') || 
										Browsers.isOs('Meego') || 
										Browsers.isOs('Tizen') || 
										Browsers.isEngine('Gecko') ||
										Browsers.isEngine('Presto') || 
										Browsers.isBrowser('Chrome') ||
										Browsers.isBrowser('Polaris', '>=', '8')
									) ||
									Browsers.isType('television') && (
										Browsers.isBrowser('Espial') ||
										Browsers.isBrowser('MachBlue XT') ||
										Browsers.isEngine('Presto', '>=', '2.9')
									),
									
				dragdrop:			Browsers.isType('desktop') ||
									Browsers.isType('mobile', 'tablet', 'media') && (
										Browsers.isEngine('Presto')
									)	
			};
	
			this.backgroundTasks = {};
			this.callback = c;
			
			this.results = new results(this);
			
			for (g in this.suites) {
				for (s in this.suites[g]) {
					new (this.suites[g][s])(this.results);
				}
			}
			
			this.waitForBackground();
		},
		
		waitForBackground: function() {
			var that = this;

			window.setTimeout(function() {
				that.checkForBackground.call(that);
			}, 300);
		},
		
		checkForBackground: function() {
			var running = 0;
			for (var task in this.backgroundTasks) { running += this.backgroundTasks[task] }

			if (running) {
				this.waitForBackground();
			} else {
				this.finished();
			}				
		},
		
		startBackground: function(id) {
			this.backgroundTasks[id] = 1;
		},
		
		stopBackground: function(id) {
			this.backgroundTasks[id] = 0;
		},
		
		finished: function() {
			var results = [], points = [];
			
			collectResults(0, '', this.results);
			function collectResults(level, prefix, data) {
				if (data.items) {
					for (i in data.items) {
						if (level == 0) points.push(data.items[i].data.id + '=' + data.items[i].points + '/' + data.items[i].max + '+' + data.items[i].bonus);
						if (typeof data.items[i].data.passed != 'undefined') results.push(prefix + data.items[i].data.id + '=' + (!! data.items[i].data.passed ? 1 : 0));
						if (data.items[i].items) {
							collectResults(level + 1, prefix + data.items[i].data.id + '-', data.items[i]);
						}
					}
				}
			}
			
			var date = new Date;
			var uniqueid = date.getTime() + '_' + (((1+Math.random())*0x10000)|0).toString(16).substring(1);

			this.callback({
				uniqueid:	uniqueid,
				score:		this.results.points,
				bonus:		this.results.bonus,
				results:	results.join(','),
				points:		points.join(','),
				maximum:	this.results.max
			});
		}
	}

	function results (parent) { this.initialize(parent) }
	results.prototype = {
		initialize: function(parent) {
			this.parent = parent;
			this.items = [];
			this.points = 0;
			this.bonus = 0;
			this.max = 0;
		
			this.backgroundTasks = 0;

			this.update();
		},
		
		startBackground: function(id) {
			this.parent.startBackground(id);
		},
		
		stopBackground: function(id) {
			this.parent.stopBackground(id);
		},
		
		getSection: function(data) {
			var i = new section(this, data)
			this.items.push(i);
			return i;
		},

		update: function() {
			var points = 0;
			var bonus = 0;
			var max = 0;
			
			for (var i = 0; i < this.items.length; i++) {
				points += this.items[i].getPoints();
				bonus += this.items[i].getBonus();
				max += this.items[i].getMaximum();	
			}

			this.points = points;
			this.bonus = bonus;
			this.max = max;
		},
		
		retrieve: function() {
			var data = {
				points:		this.points,
				bonus:		this.bonus,
				items:		{}
			}
			
			for (var i = 0; i < this.items.length; i++) {
				data.items[this.items[i].data.id] = this.items[i].retrieve();
			}

			return data;
		}
	}

	function section (parent, data) { this.initialize(parent, data) }
	section.prototype = {
		initialize: function(parent, data) {
			this.items = [];
			this.points = 0;
			this.bonus = 0;
			this.max = 0;
		
			this.parent = parent;
			this.data = data;
		},
		
		startBackground: function(id) {
			this.parent.startBackground(id);
		},
		
		stopBackground: function(id) {
			this.parent.stopBackground(id);
		},
		
		setItem: function(result) {
			var i = new item(this, result);
			this.items.push(i);
			
			this.update();
			
			return i;
		},
		
		getGroup: function(data) {
			var i = new group(this, data);
			this.items.push(i);
			return i;
		},
		
		update: function() {
			var points = 0;
			var bonus = 0;
			var max = 0;
			
			for (var i = 0; i < this.items.length; i++) {
				points += this.items[i].getPoints();
				bonus += this.items[i].getBonus();
				max += this.items[i].getMaximum();	
			}
			
			this.points = points;
			this.bonus = bonus;
			this.max = max;
			
			this.parent.update();
		},
		
		getBonus: function() {
			return this.bonus;
		},
		
		getPoints: function() {
			return this.points;
		},
		
		getMaximum: function() {
			return this.max;
		},
		
		retrieve: function() {
			var data = {
				points:		this.points,
				bonus:		this.bonus,
				items: 		{}
			};
			
			for (var i = 0; i < this.items.length; i++) {
				data.items[this.items[i].data.id] = this.items[i].retrieve();
			}

			return data;
		}
	}
	
	function group (parent, data) { this.initialize(parent, data) }
	group.prototype = {
		initialize: function(parent, data) {
			this.items = [];
			this.points = 0;
			this.bonus = 0;
			this.max = 0;
			
			this.data = data;
			this.parent = parent;
		},
		
		update: function() {
			var points = 0;
			var bonus = 0;
			var max = 0;
			var count = 0;
			
			var passedAllRequiredFields = true;
			var passedPartially = false;
			
			for (var i = 0; i < this.items.length; i++) {
				points += this.items[i].getPoints();
				bonus += this.items[i].getBonus();
				max += this.items[i].getMaximum();	
				count += this.items[i].getPassed() ? 1 : 0;
			
				if (this.items[i].getRequired()) {
					passedAllRequiredFields &= this.items[i].getPassed();
				}
				
				passedPartially |= this.items[i].getPartiallyPassed();
			}
			
			if (!passedAllRequiredFields) {
				points = 0;
			}
			
			this.points = points;
			this.bonus = bonus;
			this.max = max;
			
			this.parent.update();
		},
		
		startBackground: function(id) {
			this.parent.startBackground(id);
		},
		
		stopBackground: function(id) {
			this.parent.stopBackground(id);
		},
		
		setItem: function(result) {
			var i = new item(this, result);
			this.items.push(i);
			
			this.update();
			
			return i;
		},
		
		getBonus: function() {
			return this.bonus;
		},
		
		getPoints: function() {
			return this.points;
		},
		
		getMaximum: function() {
			return this.max;
		},
		
		retrieve: function() {
			var data = {
				points:		this.points,
				bonus:		this.bonus,
				items: 		{}
			};
			
			for (var i = 0; i < this.items.length; i++) {
				data.items[this.items[i].data.id] = this.items[i].retrieve();
			}

			return data;
		}
	}
	
	function item (parent, data) { this.initialize(parent, data) }
	item.prototype = {
		initialize: function(parent, data) {
			this.parent = parent;
		
			this.data = data;
			if (typeof this.data.value == 'undefined') this.data.value = 0;
			if (typeof this.data.bonus == 'undefined') this.data.bonus = 0;
			if (typeof this.data.award == 'undefined') this.data.award = this.data.value;
		},
		
		update: function(data) {
			for (key in data) {
				this.data[key] = data[key];
			}

			if (typeof this.data.value == 'undefined') this.data.value = 0;
			if (typeof this.data.bonus == 'undefined') this.data.bonus = 0;
			if (typeof this.data.award == 'undefined') this.data.award = this.data.value;
			
			this.parent.update();
		},
			
		startBackground: function() {
			this.parent.startBackground(this.data.id);
		},
		
		stopBackground: function() {
			this.parent.stopBackground(this.data.id);
		},
		
		getBonus: function() {
			return this.data.bonus;
		},
		
		getPoints: function() {
			return this.data.passed ? this.data.award : 0;
		},
		
		getMaximum: function() {
			return this.data.value;
		},
		
		getPassed: function() {
			return this.data.passed;
		},
		
		getPartiallyPassed: function() {
			if (this.data.custom && this.data.custom == 'partial') {
				return true;
			}
			
			return this.getPassed();
		},
		
		getRequired: function() {
			return !!this.data.required;
		},
		
		retrieve: function() {
			var data = {
				points:	this.getPoints(),
				bonus:	this.getBonus()
			};
			
			return data;
		}
	}
	
	
	var isEventSupported = (function(){
	  
		var TAGNAMES = {
			'select':'input','change':'input','input':'input',
			'submit':'form','reset':'form','forminput':'form','formchange':'form',
			'error':'img','load':'img','abort':'img'
		}
		
		function isEventSupported(eventName, element) {
			element = element || document.createElement(TAGNAMES[eventName] || 'div');
			eventName = 'on' + eventName;
			
			var isSupported = (eventName in element);
			
			if (!isSupported) {
				if (!element.setAttribute) {
					element = document.createElement('div');
				}
				if (element.setAttribute && element.removeAttribute) {
					element.setAttribute(eventName, '');
					isSupported = typeof element[eventName] == 'function';
				
					if (typeof element[eventName] != 'undefined') {
						element[eventName] = void 0;
					}
					element.removeAttribute(eventName);
				}
			}
				
			element = null;
			return isSupported;
		}

		return isEventSupported;
	})();

	var getRenderedStyle = (function(){
	
		function getRenderedStyle(elem, name) {
		    if (document.defaultView && document.defaultView.getComputedStyle) {
		        s = document.defaultView.getComputedStyle(elem, "");
		        r = [];
		        
		        if (s.length) {
			        for (var i = 0; i < s.length; i++) {
			        	try {
				        	v = s.getPropertyValue(s[i]);
				        	if (v != '') {
				        		r.push(s[i] + ': ' + v);
				        	}
			        	} catch(e) {
			        	};
			        }
		        } else {
			        for (var i in s) {
			        	try {
				        	v = s.getPropertyValue(i);
				        	if (v != '') {
				        		r.push(i + ': ' + v);
				        	}
			        	} catch(e) {
			        	};
			        }
		        }
		        
		        return r.join('; ') + ';';
		    } else {
		        return null;
		    }
		}
		
		return getRenderedStyle;
	})();

  function jsonCompare(x, y) {
    return JSON.stringify(x) == JSON.stringify(y);
  }

  function tryEval(str) {
    try {
      return eval(str);
    } catch(e) {
      return e;
    }
  }

  function tryFunc(str) {
    try {
      var f = new Function(str);
      return f();
    } catch(e) {
      return e;
    }
  }

	function testSugar (results) { this.initialize(results) }			
	testSugar.prototype = {
		initialize: function(results) {
			this.section = results.getSection({
				id:		'ES6'
			});
			
			this.section.setItem({
				id:		'spread call',
				passed:	jsonCompare(tryEval('x = [1,2,3], (function (a, b, c) { return [a, b, c] })(...x)'), [1, 2, 3]),
				value: 	5
			});

			this.section.setItem({
				id:		'spread array',
				passed:	jsonCompare(tryEval('a = [5, 6], [1, 2, ...a]'), [1, 2, 5, 6]),
				value: 	5
			});

			this.section.setItem({
				id:		'arrow functions',
				passed:	tryEval('(x => 2*x)(10)') == 20,
				value: 	10
			});

			this.section.setItem({
				id: 'class',
				passed:	tryFunc('class TestClass { }; var x = new TestClass(); return 5') == 5,
				value: 	10
			});

			this.section.setItem({
				id: 'let',
				passed:	tryFunc('let x = 10; { let x = 20; } return x*x') == 100,
				value: 	10
			});

			this.section.setItem({
				id: 'const',
				passed:	tryFunc('const x = 10; return x*10') == 100,
				value: 	10
			});

			this.section.setItem({
				id: 'default parameters',
				passed:	tryEval('(function(x = 10) { return x*x })()') == 100,
				value: 	10
			});

			this.section.setItem({
				id: 'rest parameters',
				passed:	jsonCompare(tryEval('(function(x, y, ...others) { return [x, y, others] })(4, 9, 16, 25, 36)'), [4, 9, [16, 25, 36]]),
				value: 	10
			});

			this.section.setItem({
				id: 'for-of',
				passed:	tryFunc('for (var x of ["hello", "world"]) return x') == 'hello',
				value: 	10
			});
		}
  };

	function testAsm (results) { this.initialize(results) }			
	testAsm.prototype = {
		initialize: function(results) {
			this.section = results.getSection({
				id:		'asm.js'
			});

      // opts

      function testAsmAOT(asm) {
        var asm = new Function("(function(global, env, buffer) { '" + (asm ? '' : 'z') + "use asm'; var HEAP32 = new global.Int32Array(buffer); function main() { var f = 0, t = 0, i = 0; while ((t|0) < 300) { i = 0; while ((i|0) < 1024*1024) { HEAP32[i>>2] = ((HEAP32[(i & 255)>>2]|0) + i + f)&255; i = (i+1)|0; } i = 0; while ((i|0) < 1024*1024) { f = (f + (HEAP32[i>>2] & 1))|0; i = (i+1)|0; } f = f&255; t = (t+1)|0; } return f|0; } return main; })({ 'Int32Array': Int32Array }, {}, buffer1.buffer); return asm1;");
        return asm;
      }
      var N = 1000;
      var t = Date.now();
      for (var i = 0; i < N; i++) testAsmAOT(true);
      var aot = Date.now() - t;
      t = Date.now();
      for (var i = 0; i < N; i++) testAsmAOT(false);
      var normal = Date.now() - t;

			this.section.setItem({
				id:		'asm.js optimization',
				passed:	aot > 2*normal,
				value: 	10
			});

      // imul

			this.section.setItem({
				id:		'Math.imul',
				passed:	tryEval('!!Math.imul'),
				value: 	5
			});
		}
	};
	
	return test;			
})();			
