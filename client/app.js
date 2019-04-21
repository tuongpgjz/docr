(function(window){
	'use strict';
	var _sf_lib = function (selector){
		this.selector = selector || null;
		this.length = 0;
	};
	_sf_lib.prototype = {

		init : function (){

			if(this.selector == null)
				return;

			if(typeof this.selector == 'object'){
				this[0] = this.selector;
				this.length = 1;
				return;
			}

			var count=0, elm;

			switch (this.selector[0]) {
				case '<':
					var wrp = document.createElement('div'), childs, l;
					wrp.innerHTML = this.selector;
					childs = wrp.childNodes,
					l = childs.length;
					while (l--) {
						if (childs[l].nodeType == 1){
							this[l] = childs[l];
							this.length++;
						}
					}

					if(this.length == 0){
						var matches = this.selector.match(/<([\w-]*)>/);
						if (matches === null || matches === undefined) {
							throw 'Invalid Selector / Node';
							return false;
						}
						var nodeName = matches[0].replace('<', '').replace('>', '');
						this[0] = document.createElement(nodeName);
						this.length = 1;
					}
				break;

				default:
					var elms = document.querySelectorAll(this.selector);
					for(;count<elms.length;count++)
						this[count] = elms[count];
					this.length = elms.length;
			}
		},

		eventHandler : {

			events : [],

			bind : function(event, callback, elm) {
				this.unbind(event, elm);
				elm.addEventListener(event, callback, false);
				this.events.push({
					type: event,
					event: callback,
					target: elm
				});
			},

			find: function(event) {
				return this.events.filter(function(evt) {
					return (evt.type === event);
				}, event)[0];
			},

			unbind: function(event, elm) {
				var foundEvent = this.find(event);

				if (foundEvent !== undefined) elm.removeEventListener(event, foundEvent.event, false);

				this.events = this.events.filter(function(evt) {
					return (evt.type !== event);
				}, event);
			}
		},

		get : function (ind){
			return this[ind];
		},

		on : function (event, callback){
			var l = this.length;
			while(l--){
				this.eventHandler.bind(event, callback, this[l]);
			}
			return this;
		},

		off : function(event) {
			var l = this.length;
			while(l--){
				this.eventHandler.unbind(event, this[l]);
			}
			return this;
		},

		append : function(obj) {
			if(this.length > 0){
				var l = this.length, i,
					objtype = typeof obj;
				while(l--){
					if(objtype === 'string')
						this[l].innerHTML = this[l].innerHTML + obj;
					else{
						i = obj.length;
						while(i--){
							this[l].appendChild(obj[i]);
						}
					}
				}
			}
			return this;
		},

		addClass : function (cls_names) {
			var classes = cls_names.split(' '),
				l = this.length,
				that = this;
			
			while(l--){
				var el = this[l];
				classes.map(function (cls){
					if(typeof that[l].classList !== 'undefined')
						that[l].classList.add(cls);
				});
			}
			return this;
		},

		removeClass : function (cls_names) {
			var classes = cls_names.split(' '),
				l = this.length,
				that = this;
			while(l--){
				var el = this[l];
				classes.map(function (cls){
					if(typeof that[l].classList !== 'undefined'){
						that[l].classList.remove(cls);
					}
						
				});
			}
			return this;
		},

		find : function (selector){
			var childs = new _sf_lib(),
				l = this.length;
			childs.length = 0;

			while(l--){
				var elms = this[l].querySelectorAll(selector);
				for(var count = 0;count<elms.length;count++)
					childs[count+childs.length] = elms[count];
				childs.length += elms.length;
			}
			return childs;
		},
	};

	var _s = function(selector) {
		var el = new _sf_lib(selector);
		el.init();
		return el;
	};
	
	window.docr = {
		
		data: {
			api: '',
			merchant:'',
			products: [],
			api_url: '',
		},

		appended : false,
		
		container:null,
		
		style: `<style>
			#docr_app{
				position: fixed;
				width: 500px;
				height: calc(100% - 80px);
				border-left: 1px solid #eaeaea;
				right: 0;
				top: 20px;
				z-index:100;
				visibility: hidden;
				opacity: 0;
				box-shadow: rgba(0, 0, 0, 0.16) 0px 5px 40px;
				border-top-left-radius: 6px;
				border-bottom-left-radius: 6px;
				overflow: hidden;
			}

			#docr_app iframe{
				border: none;
				width: 100%;
				height: calc(100%);
				border-bottom: 1px solid #e8e8e8;
			}
			#docr_handler{
				padding: 10px 15px;
				position: fixed;
				bottom: 0;
				right: 5px;
				z-index: 900;
				background: #4CAF50;
				border-top-left-radius: 4px;
				border-top-right-radius: 4px;
				color: #fff;
				text-decoration: none;
				font-family: Arial;
				text-transform: uppercase;
				font-weight: 500;
				font-size: 12px;
				letter-spacing: 0.7px;
				outline: none!important;
			}
			#docr_close_handler{
				position: fixed;
				bottom: 10px;
				right: 10px;
				width: 40px;
				height: 40px;
				content: "X";
				background: #94cb8d;
				border-radius: 50%;
				overflow: hidden;
				visibility: hidden;
				opacity: 0;
				display: flex;
				-webkit-box-align: center;
				align-items: center;
				-webkit-box-pack: center;
				justify-content: center;
				-webkit-transition: -webkit-transform .3s ease-in-out;
				transition:         transform .3s ease-in-out;
			}
			#docr_close_handler svg path {
				fill: rgb(255, 255, 255);
			}
			#docr_close_handler:hover{
			    -webkit-transform: rotate(90deg);
				transform: rotate(90deg);
			}
			.docr_open{
				visibility: visible!important;
				opacity: 1!important;
			}
			.docr_hide{
				visibility: hidden!important;
				opacity: 0!important;
			}
		</style>`,

		tags: {
			wrapper: '<div id="docr_app"><iframe src="http://localhost/docr/widgets"></iframe></div>',
			handler: '<a id="docr_handler" href="javascrip:void();">Need Help?</a>',
			close_handler: '<a id="docr_close_handler" href="javascrip:void();"><svg width="14" height="14"><path d="M13.978 12.637l-1.341 1.341L6.989 8.33l-5.648 5.648L0 12.637l5.648-5.648L0 1.341 1.341 0l5.648 5.648L12.637 0l1.341 1.341L8.33 6.989l5.648 5.648z" fill-rule="evenodd"></path></svg></a>'
		},		

		obj: {
			wrapper: null,
			handler: null,
			closer: null
		},
		
		init : function (){
			_s('html head').append(docr.style);
			docr.obj.handler = _s(docr.tags.handler);
			docr.obj.closer = _s(docr.tags.close_handler);
			//_s('body').append(this.wrapper);
			_s('body').append(docr.obj.handler);
			_s('body').append(docr.obj.closer);

			let func_open = function (){
					docr.obj.wrapper.addClass('docr_open');
					docr.obj.handler.addClass('docr_hide');
					docr.obj.closer.addClass('docr_open');
				},
				func_close = function (){
					docr.obj.wrapper.removeClass('docr_open');
					docr.obj.handler.removeClass('docr_hide');
					docr.obj.closer.removeClass('docr_open');
				};

			docr.obj.handler.on('click', function (e){
				if (!docr.appended) {

					docr.obj.wrapper = _s(docr.tags.wrapper);
					_s('body').append(docr.obj.wrapper);
					func_open();
					docr.appended = true;

					docr.obj.closer.on('click', function (e){
						if (docr.appended) func_close();
					});
				} else func_open();
			});
		}
	};
	
	docr.init();
	
})(window);
