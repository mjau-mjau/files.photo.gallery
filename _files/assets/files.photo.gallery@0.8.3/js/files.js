
// get custom _c.config
_c.config = Object.assign({
  // favicon default simple icon / // https://yoksel.github.io/url-encoder/
  favicon: "<link rel=\"icon\" href=\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='%2337474F' d='M20,18H4V8H20M20,6H12L10,4H4C2.89,4 2,4.89 2,6V18A2,2 0 0,0 4,20H20A2,2 0 0,0 22,18V8C22,6.89 21.1,6 20,6Z' /%3E%3C/svg%3E\" type=\"image/svg+xml\" />",
  // create title function if _c.title is default '%name% [%count%]' /
  title: _c.title === '%name% [%count%]' || !_c.title ? (path, name, error, count) => {
    return (name || '/') + (error ? '' : ' [' + count + ']');
  } : false,
  panorama: {
    /*is_pano: (item, tests) => {
      var w = item.dimensions[0];
      return w >= 2048 && tests.max_texture_size >= w && w/item.dimensions[1] === 2 ? file_path(item) : false;
      //var d = item.dimensions;
      //return d[0] >= 2048 && Math.abs(d[0]/d[1] - 2) < 0.01; // >=2048px && ratio 2:1 with 1% pixel margin
    },*/
    is_pano: (item, tests) => {

      // vars
      var width = item.dimensions[0],
          height = item.dimensions[1],
          texture = tests.max_texture_size;

      // panorama requirements / max_texture_size >= 2048 / width >= 2048 / ratio === 2
      if(texture < 2048 || width < 2048 || width / height !== 2) return;

      // if !item.panorama_resized[] from PHP / return item if texture supports width
      if(!item.panorama_resized) return texture >= width ? file_path(item) : false;

      // vars
      var arr = [width].concat(item.panorama_resized), // add large original to beginning of array
          small = arr.pop(), // get last smallest resize and remove from array because will be default
          max_width = screen.availWidth * tests.pixel_ratio * 6; // target pano widths smaller than 6 x screen pixel width

      // smallest image is not supported (although down to 4096 and 2048 SHOULD be added)
      if(small > texture) return;

      // get target that first matches texture and is smaller than max_width / default to small
      var target = arr.find((w) => {
        return texture >= w && w < max_width;
      }) || small;

      // return original if target === width / else replace url_path
      return target === width ? file_path(item) : item.url_path.replace(item.basename, '_files_' + target + '_' + item.basename);
    }
  },
  history_scroll: true,
  load_svg_max_filesize: 100000 // ~100kb
}, _c.config || {});

// set page <title> / path always assigned, also on error / name is folder name, unless error
function set_page_title(path = _c.current_dir.path, name = _c.current_dir.basename, error){
  // set count, avoid errors if _c.file_names is not defined (initial load error)
  var count = (_c.file_names || []).length;
  // set document <title>
  //document.title = typeof _c.config.title === 'function' ? _c.config.title(path, name, error, count) : (_c.config.title || '%name% [%count%]').replace('%name%', name || '/').replace('%path%', path).replace('%count%', count);

  // _c.config.title (function) if exists, else use _c.title.replace()
  document.title = _c.config.title ? _c.config.title(path, name, error, count) : _c.title.replace('%name%', name || '/').replace('%path%', path).replace('%count%', count);
}


// files.polyfills.js

// element connected (element by var is in dom) polyfill / move to polyfill.js
if(!('isConnected' in Node.prototype)) Object.defineProperty(Node.prototype, 'isConnected', {
  get() { return this.ownerDocument.contains(this); }
});

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/fromEntries
// https://vanillajstoolkit.com/polyfills/objectfromentries/
/*if(!Object.fromEntries) Object.fromEntries = function (entries){
	let obj = {};
	for (let [key, value] of entries) obj[key] = value;
	return obj;
};*/


// helpers.js

// escape stuff
function html_entities(str) {
	return str ? str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;') : '';
}
function html_quotes(str) {
	return str ? str.replace(/"/g, '&quot;') : '';
}
function html_tags(str) {
	return str ? str.replace(/</g, '&lt;').replace(/>/g, '&gt;') : '';
}
// get_span()
function get_span(text, clazz){
	return '<span class="' + clazz + '">' + text + '</span>';
}
// get_download_link() / only used for context menu for now
function get_download_link(item, clazz){
	return tests.download && !item.is_dir && item.is_readable ? '<a href="' + file_path(item, true) + '" class="' + clazz + '" download>' + _f.get_svg_icon('tray_arrow_down') + lang.span('download') + '</a>' : '';
}

// get_download_dir_zip_link()
function get_download_dir_zip_link(dir){
	return is_licensed ? _c.script + '?download_dir_zip=' + encodeURIComponent(dir.path) + '&' + dir.mtime : '#';
}

// get_map_link functions {} // <a> or <span> (files cannot use <a>)
var get_map_link = {
	a: function(gps, clazz, text){
		if(!gps) return '';
		// text, lang is in text span
		if(text) return `<a class="${ clazz } map-link-text" target="_blank" href="${ google_map_link(gps) }">${ _f.get_svg_icon('marker') + lang.span('google maps') }</a>`;
		// icon, use lang title
		return `<a class="${ clazz } map-link map-link-icon" target="_blank" href="${ google_map_link(gps) }" data-lang="google maps" title="${ lang.get('google maps') }">${ _f.get_svg_icon('marker') }</a>`;
	},
	span: function(gps, clazz){
		return gps ? '<span class="' + clazz + ' map-link-icon" data-href="' + google_map_link(gps) + '"' + get_title('google maps') + '>' + _f.get_svg_icon('marker') + '</span>' : '';
	}
	// get_map_link.a(item.gps, 'dropdown-item', true);
}
// open_link() / only used for context menu for now
function open_link(item, clazz){
	//var href = item ? file_path(item) : false;
	var href = item ? get_href(item) : false;
	if(!href || href === '#') return ''; // don't create link
	return '<a class="' + clazz + '" href="' + href + '" target="_blank">' + _f.get_svg_icon('url') + lang.span('open in new tab') + '</a>';
}
// file_path (normally same as url_path)
function file_path(file, download){
	var path = file.url_path ? encodeURI(file.url_path).replace(/#/g, '%23') : false;
	if(file.is_dir) return path || '#';
	return path && (!download || !['php', 'htaccess'].includes(file.ext)) && !_c.load_files_proxy_php ? path : _c.script + (download ? '?download=': '?file=') + encodeURIComponent(file.path);
}
// get app link for dirs and direct path for files
function get_href(item, download){
	if(item.url) return encodeURI(item.url);
	return item.is_dir ? get_app_link(item.path) : file_path(item, download);
}
// get ?path app link / currently only for dirs / if files, need to figure out parent_dir and #file #pid=file
function get_app_link(path){
	return location.pathname + (path ? '?' + encodeURIComponent(path).replace(/%2F/g, '/') : '');
}
//
function copy_url(path){
	var url = new URL(path, location);
	return url ? clipboard_copy(url.href) : false;
}
function empty(el){
	while (el.firstChild) el.firstChild.remove();
}
function css_empty(el){
	while(el.classList.length) el.classList.remove(el.classList[0]);
}
function remove_elements(elz, parent){
	if(!elz.length) return;
	looper(elz, function(el){
		(parent || el.parentNode).removeChild(el);
	});
}
function actions(el, func, throttle){
	_event(el, function(e){
		var action = e.target.dataset.action;
	  if(action) func(action, e);
	}, 'click', false, throttle);
}
function google_map_link(gps){
	return Array.isArray(gps) ? 'https://www.google.com/maps/search/?api=1&query=' + gps : '#';
}

// get_dimensions()
function get_dimensions(dim, clazz){
	return dim ? '<span class="' + clazz + '">' + dim[0] + ' x ' + dim[1] + '</span>' : '';
}
// get_filesize()
function get_filesize(item, clazz){
	// dir / return only if item.hasOwnProperty('dirsize') / item.is_dir is premature
	if(item.is_dir) return item.hasOwnProperty('dirsize') ? '<span class="' + clazz + '">' + filesize(item.dirsize) + '</span>' : '';
	//if(item.filetype === 'dir') return item.hasOwnProperty('dirsize') ? '<span class="' + clazz + '">' + filesize(item.dirsize) + '</span>' : '';

	// file
	return '<span class="' + clazz + '">' + filesize(item.filesize) + '</span>';
}
// get_permissions()
function get_permissions(item, clazz){
	var read_write = item.is_readable && item.is_writeable;
	return item.fileperms ? '<span class="' + clazz + (read_write ? ' is-readwrite' : ' not-readwrite') + '">' + _f.get_svg_icon(read_write ? 'lock_open_outline' : 'lock_outline') + item.fileperms + '</span>' : '';
}
// get_context_button()
function get_context_button(cond, clazz, span){
	if(!_c.context_menu || !cond) return '';
	let tag = span ? 'span' : 'button';
	return `<${tag} class="button-icon context-button${ clazz ? ` ${clazz}` : '' }" data-action="context">${_f.get_svg_icon_multi('dots', 'close_thin')}</${tag}>`;
}

// get_iptc() / keyword_blocks for modal
function get_iptc(image, class_prepend, wrap, keyword_blocks){
	if(!image || !image.iptc) return '';
	var iptc_keys = Object.keys(image.iptc);
	if(!iptc_keys.length) return '';

	//
	var html = '', location = '', owner = '';
	iptc_keys.forEach(function(key) {
		var val = image.iptc[key];
		if(!val) return;

		// add certain keys to location- and owner-groups
		if(['city', 'sub-location', 'province-state'].includes(key)) return location += '<span class="' + class_prepend + '-' + key + '">' + val + '</span>';
		if(['creator', 'credit', 'copyright'].includes(key)) return owner += '<span class="' + class_prepend + '-' + key + '">' + val + '</span>';

		// keyword (Array)
		if(key === 'keywords' && Array.isArray(val)) {
			var keywords = val.filter(x => x);
			return html += keywords.length ? '<div class="' + class_prepend + '-' + key + '">' + keywords.join(', ')  + '</div>' : '';
		}

		// standard
		return html += '<div class="' + class_prepend + '-' + key + '">' + val + '</div>';

		// standard
		/*html += '<div class="' + class_prepend + '-' + key + '">' + (Array.isArray(val) ? (key === 'keywords' && keyword_blocks ? str_looper(val, function(keyword){
			return '<span class="iptc-keyword">' + keyword + '</span>';
		}) : val.filter(x => x).join(', ')) : val) + '</div>';*/
	});

	// add location and owner
	html += (location ? '<div class="' + class_prepend + '-location">' + location + '</div>' : '') + (owner ? '<div class="' + class_prepend + '-owner">' + owner + '</div>' : '');

	// return
	return html ? (wrap ? '<div class="' + class_prepend + '-iptc">' + html + '</div>' : html) : '';
}
/*
ApertureFNumber: "f/4.0"
DateTime: 1460248457
DateTimeOriginal: 1293755737
ExposureTime: "1/500"
FNumber: "4/1"
Flash: false
FocalLength: "24/1"
ISOSpeedRatings: 200
Make: "Canon"
Model: "Canon EOS 5D"
Orientation: 1
Software: "Adobe Photoshop CS5 Windows"
*/

function get_exif(image, clazz, gps_tag){
	if(!image || !image.exif) return '';
	var html = str_looper(['Model', 'ApertureFNumber', 'FocalLength', 'ExposureTime', 'ISOSpeedRatings', 'gps'], function(key){
		var val = image.exif[key];
		if(!val) return '';
		if(key === 'Model'){
			val = _f.get_svg_icon(val.toLowerCase().indexOf('phone') > -1 ? 'cellphone' : 'camera') + val;
		} else if(key === 'FocalLength'){
			var focal_arr = val.split('/');
			if(focal_arr.length === 2) val = (focal_arr[0] / focal_arr[1]).toFixed(1) + '<small>mm</small>';
		} else if(key === 'gps'){
			// <a> or <span> from gps_tag (files cannot use <a>)
			return get_map_link[gps_tag || 'a'](val, 'exif-item exif-gps');
		}
		// content, tag, clazz, title, href, download
		return '<span class="exif-item exif-' + key + '"' + get_title(key) + '>' + val + '</span>';
	});
	return html ? '<div class="' + clazz + '">' + html + '</div>' : '';
}
function get_title(title, tooltip){ // capitalize if is !tooltip
	return title && tests.is_pointer ? ' data-lang="' + title + '"' + (tooltip ? ' data-tooltip="' : ' title="') + lang.get(title, !tooltip) + '"' : '';
}
// clipboard
function clipboard_copy(str) {

  // Use the Async Clipboard API when available. Requires a secure browing context (i.e. HTTPS)
  if(navigator.clipboard) return navigator.clipboard.writeText(str);

  // Put the text to copy into a <span>
  var span = document.createElement('span');
  span.textContent = str;

  // Preserve consecutive spaces and newlines
  span.style.whiteSpace = 'pre';

  // Add the <span> to the page
  document.body.appendChild(span);

  // Make a selection object representing the range of text selected by the user
  var selection = window.getSelection();
  var range = window.document.createRange();
  selection.removeAllRanges();
  range.selectNode(span);
  selection.addRange(range);

  // Copy text to the clipboard
  var success = false;
  try {
		success = window.document.execCommand('copy')
  } catch (err) {
		console.log('error', err);
  }

  // Cleanup
  selection.removeAllRanges();
  window.document.body.removeChild(span);

  // The Async Clipboard API returns a promise that may reject with `undefined` so we match that here for consistency.
  return success ? Promise.resolve() : Promise.reject();
}

// class timer
function class_timer(el, clazz, disabled, duration){
	el.classList.add(clazz);
	if(disabled) el.disabled = disabled;
	wait(duration || 2000).then(() => {
		el.classList.remove([clazz]);
		if(disabled) el.disabled = false;
	});
}

// selector shortcuts
_id = document.getElementById.bind(document);
_class = function(clazz, context){
	return Array.from((context || document).getElementsByClassName(clazz));
}
_tag = function(tag, context){
	return Array.from((context || document).getElementsByTagName(tag));
}
_query = function(query, context){
	return (context || document).querySelector(query);
}
_querya = function(query, context){
	return Array.from((context || document).querySelectorAll(query));
}
function allow_href(e, a, cond){
	if(cond || e.which > 1 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) {
		var href = a ? a.getAttribute('href') : false;
		if(href && href !== '#') {
			if(!a.contains(e.target)) a.click();
			return true;
		}
	}
	e.preventDefault();
}
function _event(el, func, e, first, throttle){
	el.addEventListener(e || 'click', _throttle(func, throttle));
	if(first) func();
}
function _throttle(func, limit){
	if(!limit) return func;
  var throttled;
  return function(e){
  	if(throttled) return;
    func.apply(this, arguments);
    throttled = setTimeout(function(){
    	throttled = null;
    }, limit);
  };
}
function _debounce(func, debounce){
  var timer;
  return function(e){
    if(timer) clearTimeout(timer);
    timer = setTimeout(func, debounce || 1000, e);
  };
}
function _event_listener(el, event, func, debounce){
	if(debounce) func = _debounce(func, debounce);
	el.addEventListener(event, func);
	return {
		remove: () => {
			el.removeEventListener(event, func);
		}
	}
}
function multi_class(elz, clazz, add){
	var action = add ? 'add' : 'remove';
	looper(filter_class(elz, clazz, !add), function(el){
		el.classList[action](clazz);
	});
}
function filter_not(col1, col2){
	return col1.filter(function(el) {
		return !col2.includes(el);
	});
}
function filter_class(col, clazz, contains){
	return col.filter(function(el) {
		return contains == el.classList.contains(clazz);
	});
}
function looper(arr, func){
	var arr_length = arr.length;
	for (var i = 0; i < arr_length; i++) func(arr[i], i);
}
function str_looper(arr, func){
	var str = '', arr_length = arr.length;
	for (var i = 0; i < arr_length; i++) str += func(arr[i], i) || '';
	return str;
}
function arr_looper(arr, func){
	var new_arr = [], arr_length = arr.length;
	for (var i = 0; i < arr_length; i++) {
		var reply = func(arr[i], i);
		if(reply) new_arr.push(reply);
	}
	return new_arr;
}
function _param(param, get, is_hash){
	var regex = new RegExp('[' + (is_hash ? '#' : '?') + '&]' + param + (get ? '=([^&]*)' : '($|&|=)')),
			matches = location[(is_hash ? 'hash' : 'search')].match(regex);
  return matches ? (get ? matches[1] : true) : false;
}
function _log(msg){
	if(_c.debug) console.log.apply(this, arguments);
}
// toggle_display() / only set style.display if it changes on toggle
/*function toggle_display(el, toggle){
	if(!_e.files.style.display == !toggle) _e.files.style.display = toggle ? null : 'none';
}*/
function toggle_hidden(el, hidden){
	if(!el) return;
	if(!el.style.display != !hidden) el.style.display = hidden ? 'none' : null;
}
// Mousetrap shortcut
function mousetrap(a, b, c){
	if(!_o.plugins.mousetrap.loaded) return;
	Mousetrap[(arguments.length === 3 ? 'bind' : 'unbind')].apply(null, arguments);
}

// local_storage
const _ls = (() => {

	//
	function get(prop){
		return tests.local_storage ? localStorage.getItem(prop) : null;
	}

	//
	function set(prop, val){
		if(typeof val === 'boolean') val = val.toString(); // browsers do this automatically, but just in case
		try {
		  localStorage.setItem(prop, val);
		} catch(e) {
			_log('failed to write localstorage', e, 'warn');
		}
	}

	// return
	return {

		// get
		get: (prop) => {
			let val = get(prop);
			if(val === 'true') return true;
			if(val === 'false') return false;
			return val;
		},

		// get json
		get_json: (prop) => json_parse(get(prop)),

		// toggle
		/*toggle: function(prop, val, toggle){
			if(!tests.local_storage) return null;
			if(!toggle) return localStorage.removeItem(prop);
			set(prop, val);
		}*/

		// set / toggle will only toggle if !val
		set: function(prop, val, toggle, timer){
			if(!tests.local_storage) return null;
			if(toggle && !val) return localStorage.removeItem(prop);
			if(timer) return wait(timer).then(() => set(prop, val));
			set(prop, val);
		},

		// remove
		remove: function(prop){
			if(tests.local_storage) return localStorage.removeItem(prop);
		},

		// toggle (remove if !toggle)
		toggle: (prop, val, toggle) => {
			if(!tests.local_storage) return;
			if(!toggle) return localStorage.removeItem(prop);
			set(prop, val);
		}
	}
})();

// ajax get
// todo: change to fetch? Maybe later
function ajax_get(options) {
  var xmlhttp = new XMLHttpRequest();
  xmlhttp.onreadystatechange = function() {
  	if(xmlhttp.readyState != 4) return; // 4 is always the end
  	if(options.always) options.always(xmlhttp);
  	if(xmlhttp.status != 200){
  		if(options.fail) options.fail(xmlhttp);
  		return;
  	}
  	var response = xmlhttp.responseText,
  			is_json = options.json_response,
  			// is_json = xmlhttp.getResponseHeader('Content-Type') === 'application/json' ? true : false,
  			data = is_json ? (() => {
  				try {
			      return JSON.parse(response);
			    } catch (e) {
			    	is_json = false;
			    	return response;
			    }
  			})() : response;

  	// logged out
  	if(is_json && data.error && data.error === 'login') return _alert.confirm.fire({
			title: lang.get('login') + '!',
			//cancelButtonText: lang.get('cancel'),
			showCancelButton: false,
			confirmButtonText: lang.get('login')
		}).then((res) => {
			if(res.isConfirmed) location.reload();
		});

  	//
    if(options.complete) options.complete(data, response, is_json);
    var msg = !options.url ? xmlhttp.getResponseHeader('files-msg') : false;
    if(msg) _log('XHR: files-msg: ' + msg);
  };
  xmlhttp.open((options.params ? 'POST' : 'GET'), options.url || _c.script);
  if(options.params) xmlhttp.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
  if(options.json_response) xmlhttp.setRequestHeader('Accept', 'application/json');
  xmlhttp.send(options.params || null);
  return xmlhttp;
}

//
function is_exif_oriented(image){
	return _c.server_exif && image && image.exif && image.exif.Orientation && image.exif.Orientation > 4 && image.exif.Orientation < 9;
}

// atob alias
function _atob(str){
	return atob(str);
}

// math minmax()
function minmax(min, max, val){
	return Math.min(Math.max(val, min), max);
}

// update --scrollbar-width when hiding scrollbar on overflow hidden for modals (modal, popup, uppy, sweetalert)
function set_scrollbar_width(){
	if(!tests.scrollbar_width) return; // die
	var dd = document.documentElement; // documentElement shortcut

	// get real width of scrollbar or check if there is overflow hidden and still scroll, user stored scrollbar width
	var width = (window.innerWidth - dd.clientWidth) || (dd.scrollHeight > dd.clientHeight ? tests.scrollbar_width : 0);

	// die if _g.scrollbar_width didn't change or no scrollbar (0 == undefined = true)
	if(width == _g.scrollbar_width) return; // nothing changed or no scrollbar (0 == undefined = true)
	if(width) tests.scrollbar_width = width; // update stored scrollbar_width just to make sure it's correct according to CSS styling
	_g.scrollbar_width = width; // store CURRENT scrollbar_width (could be 0 of course)
	document.documentElement.style.setProperty('--scrollbar-width', width + 'px'); // assign css var
}

// tooltip functions / not used!
/*
var tooltip = {
	store: function(el){
		if(!el.dataset.tooltipOriginal) el.dataset.tooltipOriginal = el.dataset.tooltip;
	},
	set: function(el, text, show){
		tooltip.store(el);
		el.dataset.tooltip = lang.get(text);
		if(show) el.classList.add('show-tooltip');
	},
	// not currently using this
	timer: function(el, text, clazz, dur){
		if(text) tooltip.store(el);
		if(text) el.dataset.tooltip = lang.get(text);
		if(clazz) el.classList.add('tooltip-' + clazz);
		el.classList.add('show-tooltip');
		wait(dur || 1000).then(() => {
			if(text) el.dataset.tooltip = el.dataset.tooltipOriginal || '';
			if(clazz) el.classList.remove('tooltip-' + clazz);
			el.classList.remove('show-tooltip');
		});
	}
}
*/

// get folder preview <img>
function get_folder_preview(item){

  // must be dir + is_readable + _c.folder_preview_image + load_images + image_resize_enabled
	if(!item.is_dir || !item.is_readable || !_c.folder_preview_image || !_c.load_images || !_c.image_resize_enabled) return '';

	// check if dir is available in dirs object / could be from menu or loaded earlier
	const dir = _c.dirs[item.path];

	// prepare src var
	let src = false;

	// check if preview property exists in dir object (already loaded or menu_load_all)
	if(dir && dir.hasOwnProperty('preview')){

		// preview prop exists but is empty = abort / there is no preview found from PHP, so don't load anything / must return '' (not undefined)
		if(!dir.preview) return '';

		// make sure dir.preview exists in dir.files[], else it's hidden by exclude and can't be loaded with ?file=
		if(dir.files && dir.files[dir.preview]) src = '?file=' + encodeURIComponent(item.path + '/' + dir.preview) + '&resize=' + _c.image_resize_dimensions;
	}

	// default to ?preview=
	if(!src) src = '?preview=' + encodeURIComponent(item.path);

	// return src wrapped in <img> tag.
	return `<img data-src="${ _c.script }${ src }&${ _c.image_cache_hash }.${ item.mtime }" class="files-folder-preview files-lazy">`;
}

// replace <a> anchor links inside strings (for example IPTC) that are already inside <a> elements
function a_to_span(str){
	if(str.indexOf('<a') === -1) return str;
	return str.replace(/<a\s/g, '<span ').replace(/<\/a>/g, '</span>').replace(/\shref\=/g, ' data-href=');
}

// check_n
function check_n(){
	if(!Swal.isVisible()) return;
	let c = Swal.getContainer(),
			ccs = getComputedStyle(c),
			p = c.firstElementChild,
			pcs = getComputedStyle(p);
	// checks
	if(![ccs.top, ccs.right, ccs.bottom, ccs.left].every((val) => { return val == 0 || val == '0px' }) ||
		c.offsetWidth < window.innerWidth-100 || p.offsetWidth < 100 ||
		c.offsetHeight < window.innerHeight-100 || p.offsetHeight < 100 ||
		ccs.opacity != 1 || pcs.opacity != 1 ||
		ccs.pointerEvents == 'none' || pcs.pointerEvents == 'none' ||
		ccs.display == 'none' || pcs.display == 'none' ||
		ccs.visibility != 'visible' || pcs.visibility != 'visible' ||
		ccs.position != 'fixed' || ['absolute', 'fixed'].includes(pcs.position)
	) document.body.remove();
}

// start some new public _h helpers object
var _h = {
	popup: (e, w, h, url, name) => {
		if(e) e.preventDefault(); // prevent default click
		w = Math.floor(Math.min(screen.width, w || 1000));
		h = Math.floor(Math.min(screen.height, h || 99999));
		var mypopup = window.open(url, name || null, 'toolbar=no,status=no,menubar=no,scrollbars=yes,resizable=yes,copyhistory=no,titlebar=no,width=' + w + ',height=' + h + ',top=' + Math.round(screen.height / 2 - h / 2) + ',left=' + Math.round(screen.width / 2 - w / 2));
		if(window.focus) mypopup.focus();
		return mypopup;
	},
}

// Object values
function object_values(ob){
	return Object.values ? Object.values(ob) : Object.keys(ob).map(key => ob[key]);
}
// set_classname only if changes. Useful when provding a long classname string ...
function set_classname(el, classname){
	if(el.className != classname) el.className = classname;
}


// query_to_ob / used for localStorage googoo=1&gaga=2
function query_to_ob(str){
  var ob = {};
  if(str) str.split('&').forEach((p) => {
    let [key, val] = p.split('=');
    ob[key] = isNaN(val) ? val : +val; // force number
  });
  return ob;
}

// json_parse / get object from json string or fail
// used in uppy.xhr for validate status [return json_parse(responseText, 'success')]
function json_parse(str, prop){
	if(!str) return; // because localStorage for example might be null/empty
	try {
		let ob = JSON.parse(str);
		return prop ? ob[prop] : ob;
	} catch (err) {
		return;// false;
	}
}

// timeout event // wait(500).then(() => _e.files.style.pointerEvents = null);
const wait = async (ms) => new Promise((resolve) => setTimeout(resolve, ms));


// files.toast.js
// wrapper functions for toastify-js / https://apvarun.github.io/toastify-js/

//
const _toast = (() => {

  // default object
  const def = {
    duration: 2000,
    gravity: 'bottom',
    //gravity: "top", // `top` or `bottom`
    //position: "center", // `left`, `center` or `right`
    escapeMarkup: false
  }

  // shortcut for Toastify
  let toast = (ob) => Toastify(Object.assign({}, def, ob)).showToast();

  // get icon + text (escape html tags in filename/text)
  const get_text = (success, text) => _f.get_svg_icon(success ? 'check' : 'cancel_circle') + '<span class="toastify-text">' + html_tags(text) + '</span>';

  // for storing toasts
  //v ar toasts = {};

  // pre-defined methods
  const methods = {
    toggle: (success, text, ob) => {
      /*if(id && toasts[id] && toasts[id].toastElement && document.body.contains(toasts[id].toastElement)) toasts[id].hideToast();
      var mytoast = toast({
        text: _f.get_svg_icon(success ? 'check' : 'cancel_circle') + '<span class="toastify-text">' + text + '</span>',
        className: 'toastify-' + (success ? 'success' : 'danger')
      });
      if(id) toasts[id] = mytoast;
      return mytoast;*/
      return toast(Object.assign({
        text: get_text(success, text),
        className: 'toastify-' + (success ? 'success' : 'danger'),
        duration: success ? def.duration : 3000
      }, ob || {}));
    },

    loader: (text, progress) => {
      return toast({ // need to return, so we can dismiss it
        text: '<span class="toastify-text">' + text + '</span>' + (progress ? '<span class="toastify-percent">' + _f.get_svg_icon('tray_arrow_down') + '</span><span class="toastify-progress-bar"></span>' : ''),
        className: 'toastify-loading', // + (progress ? ' toastify-progress' : ''),
        duration: -1
      });
    }
  }

	// return
	return {

    toast: (ob) => toast(ob),
    //license: () => methods.toggle(false, 'License required.'),
    license: () => toast({
      text: get_text(false, 'License required!'),
      className: 'toastify-danger toastify-link',
      duration: 4000,
      destination: _atob('aHR0cHM6Ly9saWNlbnNlLmZpbGVzLmdhbGxlcnkv'), // 'https://license.files.gallery/',
      newWindow: true
    }),
    // refresh
    refresh: (text) => toast({
      text: get_text(false, text + ' Please refresh browser.'),
      className: 'toastify-danger toastify-link',
      duration: -1,
      destination: location.href,
    }),
		// toggle success
		toggle: methods.toggle,
    demo: () => methods.toggle(false, 'Not allowed in demo mode!'),
    loader: methods.loader,//(text) => methods.loader()
    // progress toast with percent counter and progress_bar
    progress: (text) => {
      let toast = methods.loader(text, true);
      return {
        toast: toast,
        counter: toast.toastElement.children[1],
        progress_bar: toast.toastElement.lastElementChild
      }
    }
	}
})();


// TESTING
/*setTimeout(() => {
  _toast.loader('loading something');
  _toast.toggle(0, 'nope!');
  _toast.toggle(1, 'yes sir, permission!');
}, 1000);*/


// global.js
// _e = elements
// _f = functions
// _c = config
// _o = objects
// _g = global vars
_c.debug = _param('debug') || location.host.indexOf('files.test') === 0;
_c.files = {};

// log global
_log('_c', _c);

// _functions, _objects and _elements
var _f = {}, _g = {}, _o = {}, _e = {
	main: _id('main'),
	topbar: _id('topbar'),
	files_container: _id('files-container'),
	files: _id('files'),
	topbar_info: _id('topbar-info'),
	filter_container: _id('search-container'),
	filter: _id('search')
}


// tests.js

/*
- CSS.supports()
- css vars
- intersection

if (!('IntersectionObserver' in window) ||
    !('IntersectionObserverEntry' in window) ||
    !('intersectionRatio' in window.IntersectionObserverEntry.prototype)) {
    // load polyfill now
}
*/


// tests object
var tests = {};

//
(function() {
	var t = tests,
			d = document,
			dd = d.documentElement,
			n = navigator,
			ua = n.userAgent,
			w = window;

	// userAgent
	t.ua = ua;

	// IE
	t.explorer = /MSIE /.test(ua) || /Trident\//.test(ua);

	// early tests to make sure browser is compatible (css vars + intersectionObserver)
	var supportsCSS = !!((w.CSS && w.CSS.supports) || w.supportsCSS || false);
	var browser_supported = !t.explorer && supportsCSS && CSS.supports('color', 'var(--fake-var)');

	// faux fail
	if(!browser_supported){
		d.body.innerHTML = '<div class="alert alert-danger" role="alert"><strong>' + (t.explorer ? 'Internet Explorer' : 'This browser is') + ' not supported.</strong><br>Please use a modern browser like <a href="https://www.microsoft.com/en-us/windows/microsoft-edge" class="alert-link">Edge</a>, <a href="https://www.google.com/chrome/" class="alert-link">Chrome</a>, <a href="https://www.mozilla.org/firefox/" class="alert-link">Firefox</a>, <a href="https://www.opera.com/" class="alert-link">Opera</a> or <a href="https://www.apple.com/safari/" class="alert-link">Safari</a>.</div>';
		d.body.classList.remove('body-loading');
		fail;
	}

	// localStorage
	t.local_storage = w.localStorage ? (() => {
		try {
      var x = '_t';
      w.localStorage.setItem(x, x);
      w.localStorage.removeItem(x);
      return true;
    } catch (e) {
      return false;
    }
	})() : false;

	// input
	t.is_touch = 'ontouchstart' in w || n.maxTouchPoints > 0 || n.msMaxTouchPoints > 0 || (w.DocumentTouch && d instanceof DocumentTouch) || w.matchMedia('(any-pointer: coarse)').matches;
	t.is_pointer = !t.is_touch || matchMedia('(pointer:fine)').matches;
	t.is_dual_input = t.is_touch && t.is_pointer;
	t.only_touch = t.is_touch && !t.is_pointer;
	t.only_pointer = !t.is_touch && t.is_pointer;
	t.PointerEvent = !!(w.PointerEvent) || n.msPointerEnabled;

	// nav langs
	t.nav_langs = (n.languages && n.languages.length ? n.languages : false) || (n.language ? [n.language] : false);

	// @media screen and (not (any-pointer: coarse)) and (hover: hover) and (pointer: fine) {
	//t.is_hover = t.is_pointer && matchMedia('(not (any-pointer: coarse)) and (hover: hover)').matches;
	/*if(t.is_touch && t.is_pointer){
		_event(d, function(){
			if(t.touchdown) clearTimeout(t.touchdown);
			t.touchdown = setTimeout(function(){
				t.touchdown = false;
			}, 500);
		}, 'touchend');
	}*/
	//t.is_dual_input = t.is_touch && t.is_pointer;
	t.pointer_events = !!('PointerEvent' in w)  || n.msPointerEnabled;
	t.is_mac = n.platform.toUpperCase().indexOf('MAC') >= 0;
	t.c_key = t.is_mac ? '⌘' : 'ctrl-';

	// detect lazy load support
	// t.loading = 'loading' in HTMLImageElement.prototype;

	// scrollbar_width / test if scrollbar consumes physical space
	// doesn't necessarily return correct scrollbar width, because .has-scrollbars style has not been assigned yet. Besides, some non-native pixel resolutions have decimal widths
	t.scrollbar_width = t.is_pointer ? (() => {
		d.body.insertAdjacentHTML('beforeend', '<div class="scrollbar-test"></div>'); // create scrollbar-test element
		var el = d.body.lastElementChild; // element shortcut
		var get_width = () => el.offsetWidth - el.clientWidth; // get scrollbar width shortcut function

		// DIE / ain't no physical scrollbar here no sir
		if(!get_width()) {
			el.remove(); // remove el obviously
			return 0;
		}

		// assign .has-scrollbars class on document <html>
		dd.classList.add('has-scrollbars');

		// force refresh Firefox scrollbar width thin hack / must set overflowY and then remove it
		if(ua.toLowerCase().indexOf('firefox') > -1) {
			dd.style.overflowY = 'auto';
			//setTimeout(() => dd.style.removeProperty('overflow-y'), 0);
			wait(0).then(() => dd.style.removeProperty('overflow-y'));
		}

		// get fresh scrollbar width after .has-scrollbars style has been assigned
		var scrollbar_width = get_width();

		// remove element
		el.remove();

		// return
		return scrollbar_width;
	})() : 0;

	//
	t.pixel_ratio = w.devicePixelRatio || 1;
	t.download = 'download' in d.createElement('a');
	t.clipboard = !!(d.queryCommandSupported && d.queryCommandSupported('copy'));
	t.url = !!(typeof URL === 'function');
	t.fullscreen = screenfull.isEnabled;
	t.image_orientation = CSS.supports('image-orientation', 'from-image');

	// browser supported images
	t.browser_images = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'svg+xml', 'ico', 'vnd.microsoft.icon', 'x-icon'];
	// detect extended images webp, avif
	(() => {

		// array with image types webp, avif with their 2px base64 to check
		const check_images = [
			['webp','UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA'],
			['avif','AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAIAAAACAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQ0MAAAAABNjb2xybmNseAACAAIAAYAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAACVtZGF0EgAKCBgANogQEAwgMg8f8D///8WfhwB8+ErK42A=']
		];

		// only check for tiff on Apple
		if((n.vendor.match(/apple/i) || '').length > 0) check_images.push(['tiff', 'SUkqAAwAAAADIAACEwAAAQMAAQAAAAEAAAABAQMAAQAAAAIAAAACAQMAAQAAAAEAAAADAQMAAQAAAAQAAAAGAQMAAQAAAAAAAAAKAQMAAQAAAAIAAAANAQIACwAAAAYBAAARAQQAAQAAAAgAAAASAQMAAQAAAAEAAAAVAQMAAQAAAAEAAAAWAQMAAQAAAAIAAAAXAQQAAQAAAAQAAAAaAQUAAQAAAPYAAAAbAQUAAQAAAP4AAAAcAQMAAQAAAAEAAAAoAQMAAQAAAAIAAAApAQMAAgAAAAAAAQAxAQIARwAAABIBAABTAQMAAQAAAAEAAAAAAAAASAAAAAEAAABIAAAAAQAAAHRlbXAyLnRpZmYAAEdyYXBoaWNzTWFnaWNrIDEuNCBzbmFwc2hvdC0yMDIyMTIxMyBROCBodHRwOi8vd3d3LkdyYXBoaWNzTWFnaWNrLm9yZy8A']);

		// localStorage
		let ls = _ls.get('files:tests:extended_images');
		let extended = ls ? ls.split(',') : [];						// initial extended array from localStorage
		let ls_count = extended.length;										// store initial count to compare when saving localStorage
		if(ls_count) t.browser_images.push(...extended);	// push to t.browser_images don't wait for tests
		if(ls_count >= check_images.length) return;				// die if localStorage count >= check_images count, just in case

		// tested
		let counter = 1;
		const tested = (supported) => {
			// add to extended_images and t.browser_images if img is supported
			if(supported) [extended, t.browser_images].forEach((arr) => arr.push(supported));
			// runs on last test, and stores new extended images if length changed from original ls_count
			if(counter++ === check_images.length && extended.length > ls_count) _ls.set('files:tests:extended_images', extended);
		}

		// prepare canvas for preferred test
		let canvas = d.createElement('canvas');
		canvas.width = canvas.height = 1; // best performance

		// loop check_images
		check_images.forEach((a, i) => {

			// already included from localStorage
			if(extended.includes(a[0])) return tested(); // die and tested()

			// preferred test, but does not work in all browsers / https://stackoverflow.com/a/27232658/3040364
			if(canvas.toDataURL(`image/${ a[0] }`).indexOf(`data:image/${ a[0] }`) == 0) return tested(a[0]);

			// secondary test load as base64 and check 2px height
			let img = new Image();
			// capture both onload and onerror as we need to trigger tested()
			img.onload = img.onerror = () => tested(img.height && img.height == 2 ? a[0] : false);
			// set base64 image as source from array
			img.src = `data:image/${ a[0] };base64,${ a[1] }`;
		});
	})();

	// history
	t.history = !!(w.history && history.pushState);
	if(!t.history) _c.history = false;

	// URLSearchParams
	t.URLSearchParams = !!('URLSearchParams' in w);

	// CSS --variables from ?search parameters
	if(location.search && t.URLSearchParams) new URLSearchParams(location.search).forEach(function(val, key) {
	  if(val && key.startsWith('--')) dd.style.setProperty(key, val); // only if key starts with -- and val
	});

	// webgl.MAX_TEXTURE_SIZE for pano
	t.max_texture_size = (function(){
		if(!w.WebGLRenderingContext) return;
		var canvas = document.createElement('canvas');
		if(!canvas || !canvas.getContext) return;
		try {
			var webgl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
			return webgl ? webgl.getParameter(webgl.MAX_TEXTURE_SIZE) : false;
		} catch (e){
			return;
		}
	})() || 0;
})();

// is browser media / video, audio
function is_browser_media(type, item){

	// must have mime1 && mime0 must equal requested type
	if(!item.mime1 || item.mime0 !== type) return;

	// create compatibility array tests.audio = [] and tests.video = [];
	if(!tests.hasOwnProperty(type)) tests[type] = (function() {
		if(type === 'audio' && !window.Audio) return false;
		var arr = type === 'audio' ? ['mpeg', 'mp4', 'x-aiff', 'ogg', 'x-m4a', 'aac', 'webm', 'wave', 'wav', 'x-wav', 'x-pn-wav', 'flac'] : ['mp4', 'webm', 'ogg', '3gp', 'm4v', 'x-m4v'];
		try {
			var a = document.createElement(type);
			if(!a.canPlayType) return false;
			var supported = arr.filter(function(el) {
				return a.canPlayType(type + '/' + el).replace(/no/, '');
			});
			return supported.length ? supported : false;
	  } catch (e) {
	    return false;
	  }
	})();
	// x-flac was changed to flac in mime.js
	//return tests[type] && tests[type].includes(item.mime1 === 'x-flac' ? 'flac' : item.mime1) ? item.mime1 : false;
	return tests[type] && tests[type].includes(item.mime1) ? item.mime1 : false;
}

// log
_log('tests', tests);


// localstorage.js
// this just cleans data

//
(function () {

	// early exit
	if(!tests.local_storage) return;

	// clear query params
	var clearall = _param('clearall', true),
			clear = clearall ? false : _param('clear', true),
			init_clean = clearall || clear;

	// clean localstorage. Removed
	_f.clean_localstorage = function(){
		if(init_clean) return;
		var keys = Object.keys(localStorage);
		if(!keys.length) return;

		// loop keys
		looper(keys, function(key){

			// files:menu: items [delete all]. Will be set again after cleaned from menu load
			if(key.startsWith('files:menu:')) {
				localStorage.removeItem(key);

			// files:dir: items
			} else if(key.startsWith('files:dir:')){

				// outdated dirs_hash
				if(!key.startsWith('files:dir:' + _c.dirs_hash)){
					localStorage.removeItem(key);

				// clean compare with _c.dirs
				} else if(_c.exists){
					var arr = key.split(':'),
							path = arr[3];

					// skip if path is deeper than menu_max_depth. Might exist outside menu
					if(_c.menu_max_depth && path.split('/').length >= _c.menu_max_depth) return;

					// mtime
					var mtime = parseInt(arr[4]);
					
					// delete if path does not exist || mtime does not match
					if(!_c.dirs[path] || _c.dirs[path].mtime != mtime) localStorage.removeItem(key);
				}
			}
		});
	}

	// clear by query
	if(init_clean){
		var removed = 0;
		looper(Object.keys(localStorage), function(key){
			if((clearall && key.startsWith('files:')) || key.startsWith('files:menu:') || key.startsWith('files:dir:')) {
				localStorage.removeItem(key);
				removed ++;
			}
		});
		_log(removed + ' localStorage items cleared');

	// else if !clear params && !menu_exists, clean localstorage immediately
	} else if(!_c.menu_exists){
		_f.clean_localstorage();
	}

}());

// options.js
// localStorage options to _config and _config to localStorage

// NEW
(function () {

	// clear localStorage options from query ?clear_storage / todo: should be some global feature with child parameters
	if(tests.local_storage && _param('action', true) === 'clear_storage') looper(Object.keys(localStorage), function(key){
		if(key.startsWith('files:config:') || key.startsWith('files:interface:')) localStorage.removeItem(key);
	});

	// prepare default interchangeable options (to determine if LS values can be deleted)
	var default_options = {},
			options = ['layout', 'sort', 'menu_show']; // applicable interchangeable localStorage options

	// populate default object (before changing _c[option] from ls values)
	options.forEach(function(option) {
		default_options[option] = _c[option];
	});

	// SET CONFIG / global function to store config value in _c and localStorage
	_f.set_config = function(prop, val){
		if(!default_options.hasOwnProperty(prop)) return; // prop don't exist in applicable config values
		_c[prop] = val; // set value to _c config
		// delete localStorage if val is default, so that new default config values may apply
		if(default_options[prop] === val) return _ls.remove('files:config:' + prop);
		_ls.set('files:config:' + prop, val); // store
	}

	// LEGACY OPTIONS / for backwards compatibility / must come before setting from new localStorage
	var legacy_options = _ls.get_json('files:options:' + _c.location_hash);
	if(legacy_options) {

		// loop and update config and localstorage
		looper(Object.keys(legacy_options), function(prop){
			_f.set_config(prop, legacy_options[prop]);
		});

		// DELETE outdated localstorage json options and ls_options
		_ls.remove('files:options:' + _c.location_hash); // DELETE
		_ls.remove('files:ls_options'); // DELETE
	}

	// localStorage options to config / need to be set here because some functions share _c[prop] (like _c.layout)
	looper(options, function(option){
		var ls = _ls.get('files:config:' + option); // get localStorage
		if(ls === null) return; // nope
		if(ls === _c[option]) return _ls.remove('files:config:' + option); // DELETE if same as default _c
		_c[option] = ls; // set _c from localStorage
	});

// the end
}());


// lang.js

// capitalize / todo: move
const capitalize = (str) => str[0].toUpperCase() + str.slice(1);

//
const lang = (() => {

	// vars
	var is_loading = false,
			dropdown = false;

	// merge _c.config.lang options
	var options = _c.config ? _c.config.lang || {} : {};

	// custom _files/lang/{code}.json
	// adding or extending from Javascript
		// must be able to fill in blanks
		// maybe PHP version can extend existing?
	// flags menu done, but what about flags set in JS or custom JSON?
	// add all new lang stuff into todo notes

	// langs object, used to store langs
	// https://gist.github.com/wpsmith/7604842 / use browser lang codes
	var langs = {
		ar: null,
		bg: null,
		cs: null,
		da: null,
		de: null,
		en: null,
		es: null,
		et: null,
		fr: null,
		hu: null,
		it: null,
		ja: null,
		ko: null,
		nl: null,
		no: null,
		pl: null,
		pt: null,
		ro: null,
		ru: null,
		sk: null,
		sv: null,
		th: null,
		zh: null
	}

	// flags map / converts ISO lang codes to flag codes from https://flagicons.lipis.dev/
	// https://www.jsdelivr.com/package/npm/flag-icons?path=flags%2F4x3
	var flags = {
		ar: 'sa',
		cs: 'cz',
		da: 'dk',
		en: 'gb',
		et: 'ee',
		ja: 'jp',
		ko: 'kr',
		sv: 'se',
		vi: 'vn',
		zh: 'cn',
	}

	// custom_langs from _c.lang_custom _files/lang/{code}.json
	var custom_langs = typeof _c.lang_custom === 'object' ? _c.lang_custom : {};

	// merge Javascript _c.config.lang.langs into custom_langs (merge if exists)
	if(typeof options.langs === 'object') Object.keys(options.langs).forEach((code) => {
		custom_langs[code] = Object.assign(custom_langs[code] || {}, options.langs[code]);
	});

	// loops custom langs to assign custom flags and new languages that don't exist to load from official
	Object.keys(custom_langs).forEach((code) => {

		// add custom flag, may override existing flag[code]
		if(custom_langs[code].flag) flags[code] = custom_langs[code].flag;

		// add directly to langs{} if don't exist to load from official
		if(!langs.hasOwnProperty(code)) langs[code] = custom_langs[code];
	});

	// lang_keys are ready and will never change / sort 'em
	var lang_keys = Object.keys(langs).sort();

	// clear localstorage languages if new version / version stuff should be moved
	if(tests.local_storage){
		var ls_version = _ls.get('files:version'); // get stored files:version
		if(ls_version !== _c.version) _ls.set('files:version', _c.version); // store new version if not set or not same
		if(ls_version && ls_version !== _c.version) looper(lang_keys, function(code){ // delete localStorage on new version
			_ls.remove('files:lang:' + code);
		});
	}

	// current lang object / english empty
	var current = {};

	// lang object functions
	var l = {

		// get lang output string
		get: function(str, cap){
			var out = current[str] || str;
			return cap ? capitalize(out) : out;
		},

		// key title
		/*get_key: function(str, key){
			//return (current[str] || str) + ' ' + '[' + (tests.is_mac ? '⌘' : 'ctrl-') + key + ']';
			return (tests.is_mac ? '⌘' : 'ctrl-') + key;
		},*/

		// set new lang to item and set content
		set: function(el, str){
			el.dataset.lang = str;
			el.textContent = this.get(str);
		},

		// create basic lang span / for usage inside links and buttons, so block pointer
		span: function(str, cap){
			return '<span data-lang="' + str + '" class="no-pointer">' + this.get(str, cap) + '</span>';
		},

		// create language dropdown menu in topbar (on command from topbar.js)
		dropdown: function(){

			// menu enabled, from query (if set) || options.menu (from javascript, true or [] of items)
			var lang_menu = _param('lang_menu', true) || options.menu;
			if(!lang_menu || lang_menu == 'false' || lang_menu == '0') return;

			// menu items from lang_keys or options menu
			var menu_items = Array.isArray(options.menu) ? options.menu : lang_keys;

			// add html for dropdown
			_e.topbar_top.insertAdjacentHTML('beforeend', `<div id="change-lang" class="dropdown${ is_loading ? ' dropdown-lang-loading' : '' }"><button type="button" class="button-icon button-lang" data-text="${ current_lang.split('-')[0] }"></button><div class="dropdown-menu dropdown-menu-topbar"><span class="dropdown-header" data-lang="language">${ l.get('language') }</span><div class="dropdown-lang-items">${ str_looper(menu_items, function(key){
				return `<button class="dropdown-item-lang${ key === current_lang ? ' dropdown-lang-active' : '' }" data-action="${ key }" style="background-image:url(${ _c.assets + 'flag-icons@6.6.4/flags/1x1/' + (flags[key] || key) }.svg)"></button>`;
			}) }</div></div>`);

			// global dropdown
			dropdown = _e.topbar_top.lastElementChild;

			// vars
			var dropdown_button = dropdown.firstElementChild,
					dropdown_items = dropdown.lastElementChild.lastElementChild,
					menu_index = menu_items.indexOf(current_lang), // current_lang might not exist in menu
					active = menu_index > -1 ? dropdown_items.children[menu_index] : false;

			// create dropdown
			_f.dropdown(dropdown, dropdown_button);

			// click actions
			actions(dropdown_items, function(code, e){

				// die if code equals current_lang
				if(code === current_lang) return;

				// update current_lang code
				current_lang = code;

				// set_lang
				set_lang(code);

				// dayjs_locale from clicked lang
				_f.dayjs_locale(code);

				// uppy_locale from clicked lang
				if(_o.uppy) _f.uppy_locale(code);

				// localStorage lang:current on menu click
				_ls.set('files:lang:current', code);

				// set dropdown button text from code
				dropdown_button.dataset.text = code.split('-')[0];

				// remove active / could be it doesn't exist in menu
				if(active) active.classList.remove('dropdown-lang-active');

				// active
				active = e.target; // clicked target
				active.classList.add('dropdown-lang-active');
			});
		}
	}

	// set lang (on init or from lang menu click)
	function set_lang(code){
		if(code === 'en') return update({}, code);
		var ob = langs[code] || _ls.get_json('files:lang:' + code);
		return ob ? update(ob, code) : load(code);
	}

	// helper function loaded, regardless of error
	function toggle_loading(toggle){
		is_loading = !!toggle;
		if(!dropdown) return; // exit if !dropdown
		dropdown.classList.toggle('dropdown-lang-loading', is_loading); // toggle dropdown loading class
	}

	// load new language JSON file
	function load(code){
		toggle_loading(true);
		ajax_get({
		  //url: _param('local') ? 'lang/' + code + '.json' : 'https://cdn.jsdelivr.net/npm/files.photo.gallery@' + _c.version + '/lang/' + code + '.json',
			url: _c.assets + 'files.photo.gallery@' + _c.version + '/lang/' + code + '.json',
			//url: _c.assets + 'lang/' + code + '.json',

		  json_response: true,
		  complete: function(data, response, is_json) {
		  	toggle_loading();

		  	// die
		  	if(!data || !response || !is_json) _toast.toggle(false, code.toUpperCase()); // fail with toast

		  	// always localStorage lang after load
		  	_ls.set('files:lang:' + code, response);

		    // update
		    update(data, code);
		  },
		  fail: function(){
		  	toggle_loading();
		  }
		});
	}

	// update dom from object and store
	function update(ob, code){

		// update ob
		if(!langs[code]) langs[code] = Object.assign(ob, custom_langs[code] || {});
		current = ob; // update current

		// loop all data-lang elements
		_querya('[data-lang]').forEach(function(item) { // loop all existing data-lang element
      var new_lang = l.get(item.dataset.lang);
      if(item.dataset.tooltip) return item.dataset.tooltip = new_lang;
			// title blocks assigning text / clumsy, but why not / used for GPS icon link for example
      if(item.title) return item.title = capitalize(new_lang);
      item.textContent = new_lang;
    });

    // filter input placeholder
    if(_e.filter) _e.filter.placeholder = l.get('filter');
	}

	/* INIT */

	// checks if language code is supported
	function supported(code){
		if(!code) return;
		if(code === 'nb' || code === 'nn') return 'no'; // fix for Norwegian
		return lang_keys.includes(code) ? code : false;
	}

	// lang query
	var query = _param('lang', true), // get ?lang= query
			query_supported = supported(query); // check if ?lang is supported

	// reset pre-selected language stored in localStorage
	if(query === 'reset') _ls.remove('files:lang:current');

	// add to localStorage for consecutive loading if query_supported
	if(query_supported) _ls.set('files:lang:current', query_supported);

	// detect lang from 1. query ?lang=en, 2. localStorage, 3. browser navigator.languages, 4. _c.lang_default, 5. English 'en'
	var current_lang = query_supported || supported(_ls.get('files:lang:current')) || (function() {
		if(_c.lang_auto && tests.nav_langs) for (var i = 0; i < tests.nav_langs.length; i++) {
			var arr = tests.nav_langs[i].toLowerCase().split('-');
			if(arr[1] === 'tw') return; // Taiwan don't use Chinese
			var code = supported(arr[0]);
			if(code) return code;
		};
	})() || supported(_c.lang_default) || 'en';

	// is default english, extend from custom
	if(current_lang === 'en') {
		Object.assign(current, custom_langs.en || {});

	// assign current lang if not english (default lang object)
	} else {
		set_lang(current_lang);
	}

	// return to global lang object
	return l;
})();


/*
// function to create json output for lang items on new lines translated from Google translate
(function () {
	var keys = ["blocks", "columns", "copy link", "copy text", "date", "delete", "directory is empty", "download", "error", "fail", "files", "filter", "folders", "google maps", "grid", "imagelist", "images", "kind", "language", "layout", "list", "loading", "login", "logout", "matches found for", "name", "open in new tab", "rows", "save", "show info", "size", "sort", "space", "uniform", "upload", "zoom"];
	var new_ob = {};
	var mylang = `blocks
columns
copy link
copy text
date
delete
directory is empty
download
error
fail
files
filter
folders
google maps
grid
imagelist
images
kind
language
layout
list
loading
login
logout
matches found for
name
open in new tab
rows
save
show info
size
sort
space
uniform
upload
zoom`;

	//
	mylang_arr = mylang.split('\n');

	// create lang
	keys.forEach(function(key, index) {
		new_ob[key] = mylang_arr[index].toLowerCase();
	});

	// out
	console.log('newlang', JSON.stringify(new_ob, null, '	'));
}());
*/


// plugin.js

(function() {

	// versions
	var version = {
		codemirror: 'codemirror@5.65.14',
		headroom: 'headroom.js@0.12.0',
		mousetrap: 'mousetrap@1.6.5',
		uppy: 'uppy@3.13.1',
		pannellum: 'pannellum@2.5.6'
	}

	// plugins
	_o.plugins = {
		codemirror: {
			// have to load meta.js here and in index.php :(
			src: [[version.codemirror + '/lib/codemirror.min.js', version.codemirror + '/lib/codemirror.css'], [version.codemirror + '/mode/meta.js', version.codemirror + '/addon/mode/loadmode.js', version.codemirror + '/addon/selection/active-line.js']],
			complete: [function(){
				CodeMirror.modeURL = _c.assets + version.codemirror + '/mode/%N/%N.js';
			}]
		},
		headroom: {
			src: [version.headroom + '/dist/headroom.min.js']
		},
		mousetrap: {
			src: [version.mousetrap + '/mousetrap.min.js']
		},
		pannellum: {
			src: [version.pannellum + '/build/pannellum.min.js']
		},
		uppy: {
			src: [version.uppy + '/dist/uppy.min.js', version.uppy + '/dist/uppy.min.css']
		}
	};

	// loaded
	function loaded(plugin){
		plugin.loading = false;
		plugin.loaded = true;
		looper(plugin.complete, function(complete){
			complete();
		});
		delete plugin.complete;
		delete plugin.src;
	}

	// load plugin function
	_f.load_plugin = function(name, complete, options){

		// create plugin object and merge options
		if(!_o.plugins[name]) _o.plugins[name] = {};
		var plugin = options ? Object.assign(_o.plugins[name], options) : _o.plugins[name];

		// bypass
		/*if(plugin.bypass){
			if(complete) complete();
			return;
		}*/

		// complete
		if(plugin.loaded){
			if(complete) complete();
		} else if(plugin.loading){
			if(complete) plugin.complete.push(complete);
		} else {
			plugin.loading = true;
			if(!plugin.complete) plugin.complete = [];
			if(complete) plugin.complete.push(complete);

			var multi = plugin.src && Array.isArray(plugin.src[0]);
			load_assets(multi ? plugin.src[0] : plugin.src, function(){
				if(multi){
					load_assets(plugin.src[1], function(){
						loaded(plugin);
					}, plugin);
				} else {
					loaded(plugin);
				}
			}, plugin);
		}
	}

	// load multiple assets array
	function load_assets(paths, complete, plugin){
		var load_count = 0;
		looper(paths, function(path){
			load_asset(path, function(){
				load_count ++;
				if(load_count === paths.length && complete) complete();
			}, plugin);
		});
	}

	// load asset
	function load_asset(path, complete, plugin){
		var js = plugin.type == 'js' || path.slice(-2) == 'js',
				el = document.createElement(js ? 'script' : 'link');
		el[(js ? 'src' : 'href')] = path.startsWith('http') ? path : _c.assets + path;
		if(complete) el.onload = complete;
		if(plugin.error) el.onerror = plugin.error;
		if(js){
			document.body.appendChild(el); // add to end of body
		} else {
			el.type = 'text/css';
			el.rel = 'stylesheet';
			document.head.insertBefore(el, _tag('link', document.head)[0]); // add before first CSS <link> in head
		}
	}

	// mousetrap
	_f.load_plugin('mousetrap', function(){
		Mousetrap.bind(['mod+f'], function(e) { // ['meta+f', 'ctrl+f']
			e.preventDefault();
			_o.headroom.pin();
			_e.filter.focus();
		});
	});

	// headroom
	if(_c.topbar_sticky === 'scroll'){
		if(getComputedStyle(_e.topbar).position.match('sticky')) _f.load_plugin('headroom', function(){
			if(!Headroom.cutsTheMustard) return;
			var options = {
		    tolerance: { down : 10, up : 20 },
		    offset: _e.topbar.clientHeight
		  }
		  /*if(_e.sidebar_toggle){
		  	options.onPin = function(){
		  		_e.sidebar_toggle.classList.remove('sidebar-toggle-unpinned');
		  	}
		  	options.onUnpin = function(){
		  		_e.sidebar_toggle.classList.add('sidebar-toggle-unpinned');
		  	}
		  }*/
			_o.headroom = new Headroom(_e.topbar, options);
			_o.headroom.init();
		});
	}
	//destroy(): destroy the headroom instance, removing event listeners and any classes added
	//pin(): forcibly set the headroom instance's state to pinned
	//unpin(): forcibly set the headroom instance's state to unpinned
	//freeze(): freeze the headroom instance's state (pinned or unpinned), and no longer respond to scroll events
	//unfreeze(): resume responding to scroll events
})();


// files.license.js


// license_countdown
let license_countdown = _c.menu_exists ? 2 : 1;
// always consider licensed until checked / _c.qrx might not be set and may be from host or attached to X3
let is_licensed = true;

// license
function _license(){

	// license_countdown // settimout call itself if is last count
	if(license_countdown--) return !license_countdown ? setTimeout(_license, 1000) : false;

	// vars
	const files_qrx = _atob('ZmlsZXM6cXJ4'), // 'files:qrx'
				hostname = location.hostname,
				ls_qrx = _ls.get(files_qrx);

	// localstorage is_licensed / success if ls_qrx == _c.qrx || ls_qrx == hostname
	if(ls_qrx && (ls_qrx == _c.qrx || _atob(ls_qrx) == hostname)) return;

	// open license modal / invalid msg, display PayPal
	function license_modal(invalid){

		// is definitely not licensed at this point
		is_licensed = false;

		// prepare key regex for validation / F1-45N0-0DJ0-HID3-1M6G-38IY-756B
		// ^F1-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$
		const key_regex = new RegExp(_atob('XkYxLVtBLVowLTldezR9LVtBLVowLTldezR9LVtBLVowLTldezR9LVtBLVowLTldezR9LVtBLVowLTldezR9LVtBLVowLTldezR9JA=='));

		// license key is_valid
		const is_valid = (v) => {
			let val = v || Swal.getInput().value.trim(); // from param or get from Swal
			return val && key_regex.test(val);
		};

		// open _alert.prompt
		_alert.prompt.fire({
			//showCloseButton: true,
			html: `<div class="license-container"><div class="license-header">${ invalid ? '<div class="alert alert-danger" role="alert"><strong>Invalid license</strong><br>You have entered an invalid license key.</div>' : '' }<div class="license-title">Purchase a <a href="https://www.files.gallery/docs/license/" target="_blank" tabIndex="-1">license</a> to unlock features!</div><small><a href="https://www.files.gallery/" target="_blank" tabIndex="-1">www.files.gallery</a></small></div>${ (() => {
				let html = '<div class="license-features">';
				['Remove this popup', 'Upload', 'Download folder zip', 'Code and text editor', 'Create new file', 'Create new folder', 'Rename', 'Delete', 'Duplicate file', 'Panorama viewer', 'Dedicated support', 'More features coming!'].forEach((item) => {
					html += '<div class="license-feature">' + _f.get_svg_icon('check') + item + '</div>';
				});
				return html;
			})() }</div><small>* After purchase, you will receive a license key by email.</small><a href="https://license.files.gallery/${ location.search.includes('test=1') ? '?test=1' : '' }" target="_blank" class="button button-success" id="buy_button" tabIndex="-1">BUY LICENSE<span class="buy-button-price">$39.00</span></a></div>`,
			customClass: {
	      confirmButton: 'button button-success',
	      cancelButton: 'button button-secondary',
	      input: 'input',
				//actions: 'license-actions',
				popup: 'license-popup'
	    },
			//focusConfirm: false,
			focusCancel: true, // focus on cancel button
			inputAutoFocus: false, // required to force focus on cancel
			showConfirmButton: false, // we wan't to hide this initially
			confirmButtonText: lang.get('save'),
			cancelButtonText: 'No thanks!',
			inputPlaceholder: 'LICENSE-KEY',
			allowEnterKey: () => document.activeElement !== Swal.getInput() || is_valid(), // only allow EnterKey if license key is valid
			preConfirm: (v) => { // shouldn't be needed, but just in case / v is already trimmed
				if(!is_valid(v)) return false; // block from closing if !is_valid
			},
			/*inputValidator: (v) => { // shouldn't be needed, but just in case / need to override from _alert.prompt / v is already trimmed
				if(!is_valid(v)) return _alert.invalid_response('Invalid license key'); // invalid text
			},*/
			didOpen: (popup) => {

				// shortcuts
				const confirm = Swal.getConfirmButton(),
							cancel = Swal.getCancelButton(),
							input = Swal.getInput();

				// update_input_valid / aria-valid toggle / toggle cancel,confirm buttons
				const update_input_valid = () => {
					let trimmed = input.value.trim(), // get trimmed first
							valid = is_valid(trimmed); // get valid
					// assign aria-invalid=true/false if there is value
					input[(trimmed ? 'set' : 'remove') + 'Attribute']('aria-invalid', !valid);
					confirm.style.display = valid ? 'inline-block' : 'none';
					cancel.style.display = !valid ? 'inline-block' : 'none';
					//F1-45N0-0DJ0-HID3-1M6G-38IY-756B
				}

				// input event
				_event(input, () => update_input_valid(), 'input');

				// buy_button click, attempt to open in popup and listen to message from payment success
				_id('buy_button').addEventListener('click', (e) => {

					// attempt to popup
					var popup = _h.popup(e, 800, 1000, e.currentTarget.href, 'buy');

					// listen to message from payment success
					window.addEventListener('message', (e) => {

						// make sure message is from the popup and origin is the same as the one opened
						if(e.source !== popup || !/^https:\/\/.*(files|photo)\.gallery/.test(e.origin)) return;

						// payment success text
						Swal.getHtmlContainer().firstElementChild.innerHTML = `<div class="license-header"><div class="license-title">Thanks for purchasing!</div><p>Please ${ e.data ? 'save your license key' : 'check your email' }.</p></div>`;

						// insert license key
						if(e.data){
							input.value = e.data.trim();
							update_input_valid(); // update input valid
							//input.dispatchEvent(new Event('input', { bubbles:true })); // update _event(input)
							//confirm.focus(); // prepare so that it can be saved
						}
						//
						window.focus(); // not sure if this is needed but in case
						input.focus(); // focus inserted license key
					}, false);
				});

				// make sure license modal has not been hidden
				setTimeout(check_n, 1000); // after 1 sec to avoid animations etc
			}

		// on [confirm] save
		}).then((r) => {

			// die if !confirm or !value
		  if(!r.isConfirmed || !r.value) return;

			// toast loader
			let loader = _toast.loader('Saving license');

			// save license key
			ajax_get({
				// action=license&key= / r.value is already trimmed
				params: _atob('YWN0aW9uPWxpY2Vuc2Uma2V5PQ') + r.value,
				json_response: true,
				always: () => loader.hideToast(), // always remove toast loader
				complete: (data, response, is_json) => {
					is_licensed = !!(is_json && data.success); // is_licensed true
					_toast.toggle(is_licensed, is_licensed ? 'License saved!' : 'Failed to save license key.');
				},
				fail: (x) => _toast.toggle(false, 'Error')
			});
		});
	}


	// -------- EVENTS --------

	// is x3_auth if _c.x3_path && !_c.qrx / Files app license prioritized
	var x3_auth = _c.x3_path && !_c.qrx;

	// is flamepix! _c.userx === 'fp', from $_SERVER['USERX']
	if(x3_auth && _c[_atob('dXNlcng=')] === _atob('ZnA=')) return;

	// if !license and non-standard hostname (without .dot.), always show license_modal / !x3 (needs to always be checked vs host)
	if(!_c.qrx && !x3_auth && hostname && !hostname.includes('.')) return license_modal();

	// invalid md5 license / qrx must be MD5
	if(_c.qrx && (typeof _c.qrx != 'string' || !(/^[a-f0-9]{32}$/).test(_c.qrx))) return license_modal(true);

	// X3 : 		{ "app": "1", "domain": "hostname" }
	// FILES : 	{ "app": "2", "key": "MD5", "host": "hostname" }

	// un-comment to always show license modal
	//return license_modal(false);

	// auth load
	ajax_get({
		params: (_c.qrx ? 'key=' + _c.qrx + '&' : '') + (x3_auth ? 'app=1&domain=' : 'app=2&host=') + encodeURI(hostname),
		url: _atob('aHR0cHM6Ly9hdXRoLnBob3RvLmdhbGxlcnkv'), // auth.photo.gallery
		json_response: true,
		complete: (data, r, is_json) => {

			// invalid response / no status / ignore and consider is_licensed
			if(!is_json || !data || !data.hasOwnProperty('status')) return;

			// no license found / 0=files 301=x3 / invalid if _c.qrx license is entered
			if(!data.status || data.status == 301) return license_modal(_c.qrx);

			// localStorage 'files:qrx' / not x3_auth
			if(!x3_auth) _ls.set(files_qrx, _c.qrx || btoa(hostname));
		}
		// fail, do nothing, cuz it's not supposed to fail / consider is_licensed
	});
}


// date.js using dayjs

/* TODO
- should really combine lang.js and date.js into single file function
*/

//
(function() {

	// check invalid. if invalid, don't use <time> or datetime attribute
	// dayjs.unix(file.mtime).fromNow()
	// icon
	// deal with camera date vs modified date
	// check if get from DateTimeOriginal if exists
	// exclusively set from DateTimeOriginal or return false

	// actual text
	function time_content(date, format, relative){
		return date.format(format) + (relative ? '<span class="relative-time">' + date.fromNow() + '</span>' : '');
	}
	// global get_time()
	_f.get_time = function(item, format, title, relative){
		var date = dayjs.unix(item.mtime);
		return '<time datetime="' + date.format() + '" data-time="' + item.mtime + '" data-format="' + format + '"' + (title && tests.is_pointer ? ' title="' + date.format('LLLL') + ' ~ ' + date.fromNow() + '" data-title-format="LLLL"' : '') + '>' + time_content(date, format, relative) + '</time>';
	}

	// extend localizedFormat and relativeTime
	dayjs.extend(dayjs_plugin_localizedFormat);
	dayjs.extend(dayjs_plugin_relativeTime);

	// update dom
	function update(code){

		// assign locale code
		dayjs.locale(code);

		// set --list-date-flex var based on character offset from default 16 (most languages)
		// AM/PM = (19 - 16 = 3) / Korean
		_e.main.style.setProperty('--list-date-flex', dayjs().hour(22).date(22).format('L LT').length - 16);

		//
		looper(_tag('time'), function(el){
			if(!el.dataset.time) return;
			var date = dayjs.unix(el.dataset.time);
			el.innerHTML = time_content(date, el.dataset.format, el.children[0]);
			if(el.dataset.titleFormat) el.title = date.format(el.dataset.titleFormat) + ' — ' + date.fromNow();
		});
		if(_c.current_dir) _c.current_dir.html = false;
	}

	// load locale
	function load_locale(code){
		_f.load_plugin('dayjs_locale_' + code, function(){ // plugin name dayjs_locale_{code}
			update(code);
		}, {
			src: ['dayjs@1.11.9/locale/' + code + '.js']
		});
	}

	// load new locale (from lang menu)
	_f.dayjs_locale = function(code){
		if(code === 'en') return update(code); // only UPDATE to English (when clicked from language menu) / Don't load!
		code = supported(code); // check if supported with fix for norwegian
		if(code) load_locale(code);
	}

	// dayjs locales
	// use below tool to map official json locale list into array above
	// https://cdn.jsdelivr.net/npm/dayjs@1.11.9/locale.json
	// console.log(JSON.stringify(dayjs_locales2).replaceAll('"', "'"));
	const dayjs_locales = ['af','am','ar-dz','ar-iq','ar-kw','ar-ly','ar-ma','ar-sa','ar-tn','ar','az','be','bg','bi','bm','bn-bd','bn','bo','br','bs','ca','cs','cv','cy','da','de-at','de-ch','de','dv','el','en-au','en-ca','en-gb','en-ie','en-il','en-in','en-nz','en-sg','en-tt','en','eo','es-do','es-mx','es-pr','es-us','es','et','eu','fa','fi','fo','fr-ca','fr-ch','fr','fy','ga','gd','gl','gom-latn','gu','he','hi','hr','ht','hu','hy-am','id','is','it-ch','it','ja','jv','ka','kk','km','kn','ko','ku','ky','lb','lo','lt','lv','me','mi','mk','ml','mn','mr','ms-my','ms','mt','my','nb','ne','nl-be','nl','nn','oc-lnc','pa-in','pl','pt-br','pt','rn','sd','se','si','sk','sl','sq','sr-cyrl','sr','ss','sv-fi','sv','sw','ta','te','tet','tg','th','tk','tl-ph','tlh','tr','tzl','tzm-latn','tzm','ug-cn','uk','ur','uz-latn','uz','vi','x-pseudo','yo','zh-cn','zh-hk','zh-tw','zh','rw','ru','ro'];

	// LANG ON LOAD
	function supported(code){
		if(!code) return;
		if(code === 'no' || code === 'nn') return 'nb'; // fix for Norwegian
		return dayjs_locales.includes(code) ? code : false
	}

	// current from 1. query ?lang=en, 2. localStorage, 3. browser navigator.languages, 4. _c.lang_default, 5. English 'en'
	var current = supported(_param('lang', true)) || supported(_ls.get('files:lang:current')) || (function() {
		if(_c.lang_auto && tests.nav_langs) for (var i = 0; i < tests.nav_langs.length; i++) {
			var lower = tests.nav_langs[i].toLowerCase(), // val to lowercase
					// check if full xx-yy supported, then check xx
					exists = supported(lower) || (lower.includes('-') ? supported(lower.split('-')[0]) : false);
			if(exists) return exists;
		};
	})() || supported(_c.lang_default) || 'en';

	// load_locale if not english default
	if(!['en', 'en-us'].includes(current)) load_locale(current);

	// THE END!
})();


// svg.js

/*
// small icons material design resources
// https://fonts.google.com/icons?selected=Material+Icons
// https://mui.com/material-ui/material-icons/?query=bright
// https://www.iconhunt.site/?search=sort
// https://pictogrammers.com/library/mdi/
https://yqnn.github.io/svg-path-editor/ // use this tool to adjust SVG's x, y, scale

// color
https://www.schemecolor.com/?s=microsoft

// JSDelivr icons
https://fileicons.org/?view=square-o
https://kravets-levko.github.io/pretty-file-icons/preview.html

// icons
https://icons8.com/icon/set/code/color good resource
https://iconify.design/icon-sets/flat-color-icons/ sort, folder, color, nice, pano
https://iconify.design/icon-sets/logos/ brands
https://iconify.design/icon-sets/ant-design/ some nice two-tone icons here
https://leungwensen.github.io/svg-icon/#flag flags
https://iconify.design/icon-sets/zmdi/ lots of grids, wrap text, two tone
https://iconify.design/icon-sets/bx/ cool got file icons js/css etc, nice folders
*/

//
// file_find: 'M9,13A3,3 0 0,0 12,16A3,3 0 0,0 15,13A3,3 0 0,0 12,10A3,3 0 0,0 9,13M20,19.59V8L14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18C18.45,22 18.85,21.85 19.19,21.6L14.76,17.17C13.96,17.69 13,18 12,18A5,5 0 0,1 7,13A5,5 0 0,1 12,8A5,5 0 0,1 17,13C17,14 16.69,14.96 16.17,15.75L20,19.59Z'
// file_outline: 'M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z'

/*
TODO
- smaller "Box" file icons? https://materialdesignicons.com/icon/note / note-text-outline / note-text / text-box
- order-icons
- rotate-left (refresh)
- sort-clock-ascending
- tray-arrow-down (download)
- tray-arrow-up (upload)
- view-grid, replace small grid icon (too small dots)
*/

//
(function () {

	// svg icons from http://materialdesignicons.com/
	const svg_small = {
		bell: 'M16,17H7V10.5C7,8 9,6 11.5,6C14,6 16,8 16,10.5M18,16V10.5C18,7.43 15.86,4.86 13,4.18V3.5A1.5,1.5 0 0,0 11.5,2A1.5,1.5 0 0,0 10,3.5V4.18C7.13,4.86 5,7.43 5,10.5V16L3,18V19H20V18M11.5,22A2,2 0 0,0 13.5,20H9.5A2,2 0 0,0 11.5,22Z',
		check: 'M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z',
		close: 'M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z',
		close_thin: 'M6.4 18.65 5.35 17.6l5.6-5.6-5.6-5.6L6.4 5.35l5.6 5.6 5.6-5.6 1.05 1.05-5.6 5.6 5.6 5.6-1.05 1.05-5.6-5.6Z',
		//close_circle: 'M12,2C17.53,2 22,6.47 22,12C22,17.53 17.53,22 12,22C6.47,22 2,17.53 2,12C2,6.47 6.47,2 12,2M15.59,7L12,10.59L8.41,7L7,8.41L10.59,12L7,15.59L8.41,17L12,13.41L15.59,17L17,15.59L13.41,12L17,8.41L15.59,7Z',
		dots: 'M12,16A2,2 0 0,1 14,18A2,2 0 0,1 12,20A2,2 0 0,1 10,18A2,2 0 0,1 12,16M12,10A2,2 0 0,1 14,12A2,2 0 0,1 12,14A2,2 0 0,1 10,12A2,2 0 0,1 12,10M12,4A2,2 0 0,1 14,6A2,2 0 0,1 12,8A2,2 0 0,1 10,6A2,2 0 0,1 12,4Z',
		//dots: 'M16,12A2,2 0 0,1 18,10A2,2 0 0,1 20,12A2,2 0 0,1 18,14A2,2 0 0,1 16,12M10,12A2,2 0 0,1 12,10A2,2 0 0,1 14,12A2,2 0 0,1 12,14A2,2 0 0,1 10,12M4,12A2,2 0 0,1 6,10A2,2 0 0,1 8,12A2,2 0 0,1 6,14A2,2 0 0,1 4,12Z',
		expand: 'M10,21V19H6.41L10.91,14.5L9.5,13.09L5,17.59V14H3V21H10M14.5,10.91L19,6.41V10H21V3H14V5H17.59L13.09,9.5L14.5,10.91Z',
		collapse: 'M19.5,3.09L15,7.59V4H13V11H20V9H16.41L20.91,4.5L19.5,3.09M4,13V15H7.59L3.09,19.5L4.5,20.91L9,16.41V20H11V13H4Z',
		//zoom_in: 'M15.5,14L20.5,19L19,20.5L14,15.5V14.71L13.73,14.43C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.43,13.73L14.71,14H15.5M9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5C7,5 5,7 5,9.5C5,12 7,14 9.5,14M12,10H10V12H9V10H7V9H9V7H10V9H12V10Z',
		magnify_plus: 'M9,2A7,7 0 0,1 16,9C16,10.57 15.5,12 14.61,13.19L15.41,14H16L22,20L20,22L14,16V15.41L13.19,14.61C12,15.5 10.57,16 9,16A7,7 0 0,1 2,9A7,7 0 0,1 9,2M8,5V8H5V10H8V13H10V10H13V8H10V5H8Z',
		//zoom_out: 'M15.5,14H14.71L14.43,13.73C15.41,12.59 16,11.11 16,9.5A6.5,6.5 0 0,0 9.5,3A6.5,6.5 0 0,0 3,9.5A6.5,6.5 0 0,0 9.5,16C11.11,16 12.59,15.41 13.73,14.43L14,14.71V15.5L19,20.5L20.5,19L15.5,14M9.5,14C7,14 5,12 5,9.5C5,7 7,5 9.5,5C12,5 14,7 14,9.5C14,12 12,14 9.5,14M7,9H12V10H7V9Z',
		magnify_minus: 'M9,2A7,7 0 0,1 16,9C16,10.57 15.5,12 14.61,13.19L15.41,14H16L22,20L20,22L14,16V15.41L13.19,14.61C12,15.5 10.57,16 9,16A7,7 0 0,1 2,9A7,7 0 0,1 9,2M5,8V10H13V8H5Z',
		chevron_left: 'M15.41,16.58L10.83,12L15.41,7.41L14,6L8,12L14,18L15.41,16.58Z',
		chevron_right: 'M8.59,16.58L13.17,12L8.59,7.41L10,6L16,12L10,18L8.59,16.58Z',
		chevron_up: 'M7.41,15.41L12,10.83L16.59,15.41L18,14L12,8L6,14L7.41,15.41Z',
		chevron_down: 'M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z',
		arrow_left: 'M20,11V13H8L13.5,18.5L12.08,19.92L4.16,12L12.08,4.08L13.5,5.5L8,11H20Z',
		arrow_right: 'M4,11V13H16L10.5,18.5L11.92,19.92L19.84,12L11.92,4.08L10.5,5.5L16,11H4Z',
		link: 'M14,3V5H17.59L7.76,14.83L9.17,16.24L19,6.41V10H21V3M19,19H5V5H12V3H5C3.89,3 3,3.9 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V12H19V19Z',
		logout: 'M14.08,15.59L16.67,13H7V11H16.67L14.08,8.41L15.5,7L20.5,12L15.5,17L14.08,15.59M19,3A2,2 0 0,1 21,5V9.67L19,7.67V5H5V19H19V16.33L21,14.33V19A2,2 0 0,1 19,21H5C3.89,21 3,20.1 3,19V5C3,3.89 3.89,3 5,3H19Z',
		// download only used by update, else we always use tray_arrow_down
		download: 'M5,20H19V18H5M19,9H15V3H9V9H5L12,16L19,9Z',
		tray_arrow_down: 'M2 12H4V17H20V12H22V17C22 18.11 21.11 19 20 19H4C2.9 19 2 18.11 2 17V12M12 15L17.55 9.54L16.13 8.13L13 11.25V2H11V11.25L7.88 8.13L6.46 9.55L12 15Z',
		tray_arrow_up: 'M2 12H4V17H20V12H22V17C22 18.11 21.11 19 20 19H4C2.9 19 2 18.11 2 17V12M12 2L6.46 7.46L7.88 8.88L11 5.75V15H13V5.75L16.13 8.88L17.55 7.45L12 2Z',
		//form_textbox: 'M17,7H22V17H17V19A1,1 0 0,0 18,20H20V22H17.5C16.95,22 16,21.55 16,21C16,21.55 15.05,22 14.5,22H12V20H14A1,1 0 0,0 15,19V5A1,1 0 0,0 14,4H12V2H14.5C15.05,2 16,2.45 16,3C16,2.45 16.95,2 17.5,2H20V4H18A1,1 0 0,0 17,5V7M2,7H13V9H4V15H13V17H2V7M20,15V9H17V15H20Z',
		content_copy: 'M19,21H8V7H19M19,5H8A2,2 0 0,0 6,7V21A2,2 0 0,0 8,23H19A2,2 0 0,0 21,21V7A2,2 0 0,0 19,5M16,1H4A2,2 0 0,0 2,3V17H4V3H16V1Z',
		delete_outline: 'M9,3V4H4V6H5V19A2,2 0 0,0 7,21H17A2,2 0 0,0 19,19V6H20V4H15V3H9M7,6H17V19H7V6M9,8V17H11V8H9M13,8V17H15V8H13Z',
		//file_plus_outline: 'M12,14V11H10V14H7V16H10V19H12V16H15V14M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18',
		//pencil: 'M20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18,2.9 17.35,2.9 16.96,3.29L15.12,5.12L18.87,8.87M3,17.25V21H6.75L17.81,9.93L14.06,6.18L3,17.25Z',
		//plus_thick: 'M20 14H14V20H10V14H4V10H10V4H14V10H20V14Z',
		pencil_outline: 'M14.06,9L15,9.94L5.92,19H5V18.08L14.06,9M17.66,3C17.41,3 17.15,3.1 16.96,3.29L15.13,5.12L18.88,8.87L20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18.17,3.09 17.92,3 17.66,3M14.06,6.19L3,17.25V21H6.75L17.81,9.94L14.06,6.19Z',
		close_thick: 'M20 6.91L17.09 4L12 9.09L6.91 4L4 6.91L9.09 12L4 17.09L6.91 20L12 14.91L17.09 20L20 17.09L14.91 12L20 6.91Z',
		plus_circle_multiple_outline: 'M16,8H14V11H11V13H14V16H16V13H19V11H16M2,12C2,9.21 3.64,6.8 6,5.68V3.5C2.5,4.76 0,8.09 0,12C0,15.91 2.5,19.24 6,20.5V18.32C3.64,17.2 2,14.79 2,12M15,3C10.04,3 6,7.04 6,12C6,16.96 10.04,21 15,21C19.96,21 24,16.96 24,12C24,7.04 19.96,3 15,3M15,19C11.14,19 8,15.86 8,12C8,8.14 11.14,5 15,5C18.86,5 22,8.14 22,12C22,15.86 18.86,19 15,19Z',
		upload: 'M9,16V10H5L12,3L19,10H15V16H9M5,20V18H19V20H5Z',
		clipboard: 'M19,3H14.82C14.4,1.84 13.3,1 12,1C10.7,1 9.6,1.84 9.18,3H5A2,2 0 0,0 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5A2,2 0 0,0 19,3M12,3A1,1 0 0,1 13,4A1,1 0 0,1 12,5A1,1 0 0,1 11,4A1,1 0 0,1 12,3M7,7H17V5H19V19H5V5H7V7M7.5,13.5L9,12L11,14L15.5,9.5L17,11L11,17L7.5,13.5Z',
		save_edit: 'M10,19L10.14,18.86C8.9,18.5 8,17.36 8,16A3,3 0 0,1 11,13C12.36,13 13.5,13.9 13.86,15.14L20,9V7L16,3H4C2.89,3 2,3.9 2,5V19A2,2 0 0,0 4,21H10V19M4,5H14V9H4V5M20.04,12.13C19.9,12.13 19.76,12.19 19.65,12.3L18.65,13.3L20.7,15.35L21.7,14.35C21.92,14.14 21.92,13.79 21.7,13.58L20.42,12.3C20.31,12.19 20.18,12.13 20.04,12.13M18.07,13.88L12,19.94V22H14.06L20.12,15.93L18.07,13.88Z',


		// theme button
		theme_contrast: 'M12 9c1.65 0 3 1.35 3 3s-1.35 3-3 3-3-1.35-3-3 1.35-3 3-3m0-2c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41L5.99 4.58zm12.37 12.37c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0 .39-.39.39-1.03 0-1.41l-1.06-1.06zm1.06-10.96c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06zM7.05 18.36c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06z',
		theme_light: 'm6.76 4.84-1.8-1.79-1.41 1.41 1.79 1.79 1.42-1.41zM4 10.5H1v2h3v-2zm9-9.95h-2V3.5h2V.55zm7.45 3.91-1.41-1.41-1.79 1.79 1.41 1.41 1.79-1.79zm-3.21 13.7 1.79 1.8 1.41-1.41-1.8-1.79-1.4 1.4zM20 10.5v2h3v-2h-3zm-8-5c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm-1 16.95h2V19.5h-2v2.95zm-7.45-3.91 1.41 1.41 1.79-1.8-1.41-1.41-1.79 1.8z',
		theme_dark: 'M9.37 5.51c-.18.64-.27 1.31-.27 1.99 0 4.08 3.32 7.4 7.4 7.4.68 0 1.35-.09 1.99-.27C17.45 17.19 14.93 19 12 19c-3.86 0-7-3.14-7-7 0-2.93 1.81-5.45 4.37-6.49zM12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9c0-.46-.04-.92-.1-1.36-.98 1.37-2.58 2.26-4.4 2.26-2.98 0-5.4-2.42-5.4-5.4 0-1.81.89-3.42 2.26-4.4-.44-.06-.9-.1-1.36-.1z',

		marker: 'M12,11.5A2.5,2.5 0 0,1 9.5,9A2.5,2.5 0 0,1 12,6.5A2.5,2.5 0 0,1 14.5,9A2.5,2.5 0 0,1 12,11.5M12,2A7,7 0 0,0 5,9C5,14.25 12,22 12,22C12,22 19,14.25 19,9A7,7 0 0,0 12,2Z',
		//marker: 'M15.5,4.5C15.5,5.06 15.7,5.54 16.08,5.93C16.45,6.32 16.92,6.5 17.5,6.5C18.05,6.5 18.5,6.32 18.91,5.93C19.3,5.54 19.5,5.06 19.5,4.5C19.5,3.97 19.3,3.5 18.89,3.09C18.5,2.69 18,2.5 17.5,2.5C16.95,2.5 16.5,2.69 16.1,3.09C15.71,3.5 15.5,3.97 15.5,4.5M22,4.5C22,5.5 21.61,6.69 20.86,8.06C20.11,9.44 19.36,10.56 18.61,11.44L17.5,12.75C17.14,12.38 16.72,11.89 16.22,11.3C15.72,10.7 15.05,9.67 14.23,8.2C13.4,6.73 13,5.5 13,4.5C13,3.25 13.42,2.19 14.3,1.31C15.17,0.44 16.23,0 17.5,0C18.73,0 19.8,0.44 20.67,1.31C21.55,2.19 22,3.25 22,4.5M21,11.58V19C21,19.5 20.8,20 20.39,20.39C20,20.8 19.5,21 19,21H5C4.5,21 4,20.8 3.61,20.39C3.2,20 3,19.5 3,19V5C3,4.5 3.2,4 3.61,3.61C4,3.2 4.5,3 5,3H11.2C11.08,3.63 11,4.13 11,4.5C11,5.69 11.44,7.09 12.28,8.7C13.13,10.3 13.84,11.5 14.41,12.21C15,12.95 15.53,13.58 16.03,14.11L17.5,15.7L19,14.11C20.27,12.5 20.94,11.64 21,11.58M9,14.5V15.89H11.25C11,17 10.25,17.53 9,17.53C8.31,17.53 7.73,17.28 7.27,16.78C6.8,16.28 6.56,15.69 6.56,15C6.56,14.31 6.8,13.72 7.27,13.22C7.73,12.72 8.31,12.47 9,12.47C9.66,12.47 10.19,12.67 10.59,13.08L11.67,12.05C10.92,11.36 10.05,11 9.05,11H9C7.91,11 6.97,11.41 6.19,12.19C5.41,12.97 5,13.91 5,15C5,16.09 5.41,17.03 6.19,17.81C6.97,18.59 7.91,19 9,19C10.16,19 11.09,18.63 11.79,17.91C12.5,17.19 12.84,16.25 12.84,15.09C12.84,14.81 12.83,14.61 12.8,14.5H9Z',
		//marker: 'M18.27 6C19.28 8.17 19.05 10.73 17.94 12.81C17 14.5 15.65 15.93 14.5 17.5C14 18.2 13.5 18.95 13.13 19.76C13 20.03 12.91 20.31 12.81 20.59C12.71 20.87 12.62 21.15 12.53 21.43C12.44 21.69 12.33 22 12 22H12C11.61 22 11.5 21.56 11.42 21.26C11.18 20.53 10.94 19.83 10.57 19.16C10.15 18.37 9.62 17.64 9.08 16.93L18.27 6M9.12 8.42L5.82 12.34C6.43 13.63 7.34 14.73 8.21 15.83C8.42 16.08 8.63 16.34 8.83 16.61L13 11.67L12.96 11.68C11.5 12.18 9.88 11.44 9.3 10C9.22 9.83 9.16 9.63 9.12 9.43C9.07 9.06 9.06 8.79 9.12 8.43L9.12 8.42M6.58 4.62L6.57 4.63C4.95 6.68 4.67 9.53 5.64 11.94L9.63 7.2L9.58 7.15L6.58 4.62M14.22 2.36L11 6.17L11.04 6.16C12.38 5.7 13.88 6.28 14.56 7.5C14.71 7.78 14.83 8.08 14.87 8.38C14.93 8.76 14.95 9.03 14.88 9.4L14.88 9.41L18.08 5.61C17.24 4.09 15.87 2.93 14.23 2.37L14.22 2.36M9.89 6.89L13.8 2.24L13.76 2.23C13.18 2.08 12.59 2 12 2C10.03 2 8.17 2.85 6.85 4.31L6.83 4.32L9.89 6.89Z',
		info: 'M11,9H13V7H11M12,20C7.59,20 4,16.41 4,12C4,7.59 7.59,4 12,4C16.41,4 20,7.59 20,12C20,16.41 16.41,20 12,20M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M11,17H13V11H11V17Z',

		//folder: 'M10,4H4C2.89,4 2,4.89 2,6V18A2,2 0 0,0 4,20H20A2,2 0 0,0 22,18V8C22,6.89 21.1,6 20,6H12L10,4Z',
		//folder: 'M20,18H4V8H20M20,6H12L10,4H4C2.89,4 2,4.89 2,6V18A2,2 0 0,0 4,20H20A2,2 0 0,0 22,18V8C22,6.89 21.1,6 20,6Z',
		//folder: 'M20 5h-8.586L9.707 3.293A.996.996 0 0 0 9 3H4c-1.103 0-2 .897-2 2v14c0 1.103.897 2 2 2h16c1.103 0 2-.897 2-2V7c0-1.103-.897-2-2-2zM4 19V7h16l.002 12H4z',
		folder: 'M4 5v14h16V7h-8.414l-2-2H4zm8.414 0H21a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h7.414l2 2z',
		folder_plus: 'M13 9h-2v3H8v2h3v3h2v-3h3v-2h-3z',
		folder_minus: 'M7.874 12h8v2h-8z',
		folder_forbid: 'M22 11.255a6.972 6.972 0 0 0-2-.965V7h-8.414l-2-2H4v14h7.29a6.96 6.96 0 0 0 .965 2H3a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h7.414l2 2H21a1 1 0 0 1 1 1v5.255zM18 22a5 5 0 1 1 0-10a5 5 0 0 1 0 10zm-1.293-2.292a3 3 0 0 0 4.001-4.001l-4.001 4zm-1.415-1.415l4.001-4a3 3 0 0 0-4.001 4.001z',
		folder_link: 'M22 13h-2V7h-8.414l-2-2H4v14h9v2H3a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h7.414l2 2H21a1 1 0 0 1 1 1v7zm-4 4v-3.5l5 4.5l-5 4.5V19h-3v-2h3z',
		folder_wrench: 'M13.03 20H4C2.9 20 2 19.11 2 18V6C2 4.89 2.89 4 4 4H10L12 6H20C21.1 6 22 6.89 22 8V17.5L20.96 16.44C20.97 16.3 21 16.15 21 16C21 13.24 18.76 11 16 11S11 13.24 11 16C11 17.64 11.8 19.09 13.03 20M22.87 21.19L18.76 17.08C19.17 16.04 18.94 14.82 18.08 13.97C17.18 13.06 15.83 12.88 14.74 13.38L16.68 15.32L15.33 16.68L13.34 14.73C12.8 15.82 13.05 17.17 13.93 18.08C14.79 18.94 16 19.16 17.05 18.76L21.16 22.86C21.34 23.05 21.61 23.05 21.79 22.86L22.83 21.83C23.05 21.65 23.05 21.33 22.87 21.19Z',
		//folder_cog: 'M4 4C2.89 4 2 4.89 2 6V18C2 19.11 2.9 20 4 20H12.08A7 7 0 0 1 12 19A7 7 0 0 1 19 12A7 7 0 0 1 22 12.69V8C22 6.89 21.1 6 20 6H12L10 4H4M18 14C17.87 14 17.76 14.09 17.74 14.21L17.55 15.53C17.25 15.66 16.96 15.82 16.7 16L15.46 15.5C15.35 15.5 15.22 15.5 15.15 15.63L14.15 17.36C14.09 17.47 14.11 17.6 14.21 17.68L15.27 18.5C15.25 18.67 15.24 18.83 15.24 19C15.24 19.17 15.25 19.33 15.27 19.5L14.21 20.32C14.12 20.4 14.09 20.53 14.15 20.64L15.15 22.37C15.21 22.5 15.34 22.5 15.46 22.5L16.7 22C16.96 22.18 17.24 22.35 17.55 22.47L17.74 23.79C17.76 23.91 17.86 24 18 24H20C20.11 24 20.22 23.91 20.24 23.79L20.43 22.47C20.73 22.34 21 22.18 21.27 22L22.5 22.5C22.63 22.5 22.76 22.5 22.83 22.37L23.83 20.64C23.89 20.53 23.86 20.4 23.77 20.32L22.7 19.5C22.72 19.33 22.74 19.17 22.74 19C22.74 18.83 22.73 18.67 22.7 18.5L23.76 17.68C23.85 17.6 23.88 17.47 23.82 17.36L22.82 15.63C22.76 15.5 22.63 15.5 22.5 15.5L21.27 16C21 15.82 20.73 15.65 20.42 15.53L20.23 14.21C20.22 14.09 20.11 14 20 14H18M19 17.5C19.83 17.5 20.5 18.17 20.5 19C20.5 19.83 19.83 20.5 19 20.5C18.16 20.5 17.5 19.83 17.5 19C17.5 18.17 18.17 17.5 19 17.5Z',
		folder_cog_outline: 'M4 4C2.89 4 2 4.89 2 6V18C2 19.11 2.9 20 4 20H12V18H4V8H20V12H22V8C22 6.89 21.1 6 20 6H12L10 4M18 14C17.87 14 17.76 14.09 17.74 14.21L17.55 15.53C17.25 15.66 16.96 15.82 16.7 16L15.46 15.5C15.35 15.5 15.22 15.5 15.15 15.63L14.15 17.36C14.09 17.47 14.11 17.6 14.21 17.68L15.27 18.5C15.25 18.67 15.24 18.83 15.24 19C15.24 19.17 15.25 19.33 15.27 19.5L14.21 20.32C14.12 20.4 14.09 20.53 14.15 20.64L15.15 22.37C15.21 22.5 15.34 22.5 15.46 22.5L16.7 22C16.96 22.18 17.24 22.35 17.55 22.47L17.74 23.79C17.76 23.91 17.86 24 18 24H20C20.11 24 20.22 23.91 20.24 23.79L20.43 22.47C20.73 22.34 21 22.18 21.27 22L22.5 22.5C22.63 22.5 22.76 22.5 22.83 22.37L23.83 20.64C23.89 20.53 23.86 20.4 23.77 20.32L22.7 19.5C22.72 19.33 22.74 19.17 22.74 19C22.74 18.83 22.73 18.67 22.7 18.5L23.76 17.68C23.85 17.6 23.88 17.47 23.82 17.36L22.82 15.63C22.76 15.5 22.63 15.5 22.5 15.5L21.27 16C21 15.82 20.73 15.65 20.42 15.53L20.23 14.21C20.22 14.09 20.11 14 20 14M19 17.5C19.83 17.5 20.5 18.17 20.5 19C20.5 19.83 19.83 20.5 19 20.5C18.16 20.5 17.5 19.83 17.5 19C17.5 18.17 18.17 17.5 19 17.5Z',

		//folder_open: 'M2.165 19.551c.186.28.499.449.835.449h15c.4 0 .762-.238.919-.606l3-7A.998.998 0 0 0 21 11h-1V7c0-1.103-.897-2-2-2h-6.1L9.616 3.213A.997.997 0 0 0 9 3H4c-1.103 0-2 .897-2 2v14h.007a1 1 0 0 0 .158.551zM17.341 18H4.517l2.143-5h12.824l-2.143 5zM18 7v4H6c-.4 0-.762.238-.919.606L4 14.129V7h14z',
		folder_open: 'M12.414 5H21a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h7.414l2 2zM4 5v14h16V7h-8.414l-2-2H4zm8 7V9l4 4l-4 4v-3H8v-2h4z',

		folder_move_outline: 'M20 18H4V8H20V18M12 6L10 4H4C2.9 4 2 4.89 2 6V18C2 19.11 2.9 20 4 20H20C21.11 20 22 19.11 22 18V8C22 6.9 21.11 6 20 6H12M11 14V12H15V9L19 13L15 17V14H11Z',
		//folder_plus: 'M10,4L12,6H20A2,2 0 0,1 22,8V18A2,2 0 0,1 20,20H4C2.89,20 2,19.1 2,18V6C2,4.89 2.89,4 4,4H10M15,9V12H12V14H15V17H17V14H20V12H17V9H15Z',
		//folder_plus: 'M12 12H14V10H16V12H18V14H16V16H14V14H12V12M22 8V18C22 19.11 21.11 20 20 20H4C2.89 20 2 19.11 2 18V6C2 4.89 2.89 4 4 4H10L12 6H20C21.11 6 22 6.89 22 8M20 8H4V18H20V8Z',
		//folder_star: 'M20,6H12L10,4H4A2,2 0 0,0 2,6V18A2,2 0 0,0 4,20H20A2,2 0 0,0 22,18V8A2,2 0 0,0 20,6M17.94,17L15,15.28L12.06,17L12.84,13.67L10.25,11.43L13.66,11.14L15,8L16.34,11.14L19.75,11.43L17.16,13.67L17.94,17Z',
		alert_circle_outline: 'M11,15H13V17H11V15M11,7H13V13H11V7M12,2C6.47,2 2,6.5 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20Z',
		//date: 'M9,10H7V12H9V10M13,10H11V12H13V10M17,10H15V12H17V10M19,3H18V1H16V3H8V1H6V3H5C3.89,3 3,3.9 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5A2,2 0 0,0 19,3M19,19H5V8H19V19Z',
		//date: 'M12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22C6.47,22 2,17.5 2,12A10,10 0 0,1 12,2M12.5,7V12.25L17,14.92L16.25,16.15L11,13V7H12.5Z',
		//date: 'M19.5 16C17.6 16 16 17.6 16 19.5S17.6 23 19.5 23 23 21.4 23 19.5 21.4 16 19.5 16M14 19.5C14 19.33 14 19.17 14.03 19H5V9H19V14.03C19.17 14 19.33 14 19.5 14C20 14 20.5 14.08 21 14.21V5C21 3.9 20.11 3 19 3H18V1H16V3H8V1H6V3H5C3.89 3 3 3.9 3 5V19C3 20.11 3.9 21 5 21H14.21C14.08 20.5 14 20 14 19.5M5 5H19V7H5V5Z',
		date: 'M19 3H18V1H16V3H8V1H6V3H5C3.89 3 3 3.9 3 5V19C3 20.11 3.9 21 5 21H19C20.11 21 21 20.11 21 19V5C21 3.9 20.11 3 19 3M19 19H5V9H19V19M19 7H5V5H19V7Z',
		camera: 'M20,4H16.83L15,2H9L7.17,4H4A2,2 0 0,0 2,6V18A2,2 0 0,0 4,20H20A2,2 0 0,0 22,18V6A2,2 0 0,0 20,4M20,18H4V6H8.05L9.88,4H14.12L15.95,6H20V18M12,7A5,5 0 0,0 7,12A5,5 0 0,0 12,17A5,5 0 0,0 17,12A5,5 0 0,0 12,7M12,15A3,3 0 0,1 9,12A3,3 0 0,1 12,9A3,3 0 0,1 15,12A3,3 0 0,1 12,15Z',
		cellphone: 'M17,19H7V5H17M17,1H7C5.89,1 5,1.89 5,3V21A2,2 0 0,0 7,23H17A2,2 0 0,0 19,21V3C19,1.89 18.1,1 17,1Z',
		//plus: 'M17,13H13V17H11V13H7V11H11V7H13V11H17M19,3H5C3.89,3 3,3.89 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5C21,3.89 20.1,3 19,3Z',
		//minus: 'M17,13H7V11H17M19,3H5C3.89,3 3,3.89 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5C21,3.89 20.1,3 19,3Z',
		plus: 'M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z',
		minus: 'M19,13H5V11H19V13Z',
		menu: 'M3,6H21V8H3V6M3,11H21V13H3V11M3,16H21V18H3V16Z',
		menu_back: 'M5,13L9,17L7.6,18.42L1.18,12L7.6,5.58L9,7L5,11H21V13H5M21,6V8H11V6H21M21,16V18H11V16H21Z',

		//sort_name: 'M9.25,5L12.5,1.75L15.75,5H9.25M15.75,19L12.5,22.25L9.25,19H15.75M8.89,14.3H6L5.28,17H2.91L6,7H9L12.13,17H9.67L8.89,14.3M6.33,12.68H8.56L7.93,10.56L7.67,9.59L7.42,8.63H7.39L7.17,9.6L6.93,10.58L6.33,12.68M13.05,17V15.74L17.8,8.97V8.91H13.5V7H20.73V8.34L16.09,15V15.08H20.8V17H13.05Z',
		//sort_kind: 'M3,13H15V11H3M3,6V8H21V6M3,18H9V16H3V18Z',
		//sort_filesize: 'M10,13V11H18V13H10M10,19V17H14V19H10M10,7V5H22V7H10M6,17H8.5L5,20.5L1.5,17H4V7H1.5L5,3.5L8.5,7H6V17Z',
		//sort_date: 'M7.78,7C9.08,7.04 10,7.53 10.57,8.46C11.13,9.4 11.41,10.56 11.39,11.95C11.4,13.5 11.09,14.73 10.5,15.62C9.88,16.5 8.95,16.97 7.71,17C6.45,16.96 5.54,16.5 4.96,15.56C4.38,14.63 4.09,13.45 4.09,12C4.09,10.55 4.39,9.36 5,8.44C5.59,7.5 6.5,7.04 7.78,7M7.75,8.63C7.31,8.63 6.96,8.9 6.7,9.46C6.44,10 6.32,10.87 6.32,12C6.31,13.15 6.44,14 6.69,14.54C6.95,15.1 7.31,15.37 7.77,15.37C8.69,15.37 9.16,14.24 9.17,12C9.17,9.77 8.7,8.65 7.75,8.63M13.33,17V15.22L13.76,15.24L14.3,15.22L15.34,15.03C15.68,14.92 16,14.78 16.26,14.58C16.59,14.35 16.86,14.08 17.07,13.76C17.29,13.45 17.44,13.12 17.53,12.78L17.5,12.77C17.05,13.19 16.38,13.4 15.47,13.41C14.62,13.4 13.91,13.15 13.34,12.65C12.77,12.15 12.5,11.43 12.46,10.5C12.47,9.5 12.81,8.69 13.47,8.03C14.14,7.37 15,7.03 16.12,7C17.37,7.04 18.29,7.45 18.88,8.24C19.47,9 19.76,10 19.76,11.19C19.75,12.15 19.61,13 19.32,13.76C19.03,14.5 18.64,15.13 18.12,15.64C17.66,16.06 17.11,16.38 16.47,16.61C15.83,16.83 15.12,16.96 14.34,17H13.33M16.06,8.63C15.65,8.64 15.32,8.8 15.06,9.11C14.81,9.42 14.68,9.84 14.68,10.36C14.68,10.8 14.8,11.16 15.03,11.46C15.27,11.77 15.63,11.92 16.11,11.93C16.43,11.93 16.7,11.86 16.92,11.74C17.14,11.61 17.3,11.46 17.41,11.28C17.5,11.17 17.53,10.97 17.53,10.71C17.54,10.16 17.43,9.69 17.2,9.28C16.97,8.87 16.59,8.65 16.06,8.63M9.25,5L12.5,1.75L15.75,5H9.25M15.75,19L12.5,22.25L9.25,19H15.75Z',

		gif: 'M11.5 9H13v6h-1.5zM9 9H6c-.6 0-1 .5-1 1v4c0 .5.4 1 1 1h3c.6 0 1-.5 1-1v-2H8.5v1.5h-2v-3H10V10c0-.5-.4-1-1-1zM19 10.5V9h-4.5v6H16v-2h2v-1.5h-2v-1z',

		rotate_right: 'M16.89,15.5L18.31,16.89C19.21,15.73 19.76,14.39 19.93,13H17.91C17.77,13.87 17.43,14.72 16.89,15.5M13,17.9V19.92C14.39,19.75 15.74,19.21 16.9,18.31L15.46,16.87C14.71,17.41 13.87,17.76 13,17.9M19.93,11C19.76,9.61 19.21,8.27 18.31,7.11L16.89,8.53C17.43,9.28 17.77,10.13 17.91,11M15.55,5.55L11,1V4.07C7.06,4.56 4,7.92 4,12C4,16.08 7.05,19.44 11,19.93V17.91C8.16,17.43 6,14.97 6,12C6,9.03 8.16,6.57 11,6.09V10L15.55,5.55Z',

		motion_play_outline: 'M10 16.5L16 12L10 7.5M22 12C22 6.46 17.54 2 12 2C10.83 2 9.7 2.19 8.62 2.56L9.32 4.5C10.17 4.16 11.06 3.97 12 3.97C16.41 3.97 20.03 7.59 20.03 12C20.03 16.41 16.41 20.03 12 20.03C7.59 20.03 3.97 16.41 3.97 12C3.97 11.06 4.16 10.12 4.5 9.28L2.56 8.62C2.19 9.7 2 10.83 2 12C2 17.54 6.46 22 12 22C17.54 22 22 17.54 22 12M5.47 3.97C6.32 3.97 7 4.68 7 5.47C7 6.32 6.32 7 5.47 7C4.68 7 3.97 6.32 3.97 5.47C3.97 4.68 4.68 3.97 5.47 3.97Z',
		motion_pause_outline: 'M22 12C22 6.46 17.54 2 12 2C10.83 2 9.7 2.19 8.62 2.56L9.32 4.5C10.17 4.16 11.06 3.97 12 3.97C16.41 3.97 20.03 7.59 20.03 12C20.03 16.41 16.41 20.03 12 20.03C7.59 20.03 3.97 16.41 3.97 12C3.97 11.06 4.16 10.12 4.5 9.28L2.56 8.62C2.19 9.7 2 10.83 2 12C2 17.54 6.46 22 12 22C17.54 22 22 17.54 22 12M5.47 7C4.68 7 3.97 6.32 3.97 5.47C3.97 4.68 4.68 3.97 5.47 3.97C6.32 3.97 7 4.68 7 5.47C7 6.32 6.32 7 5.47 7M9 9H11V15H9M13 9H15V15H13',
		panorama_variant: 'M20.7 4.1C18.7 4.8 15.9 5.5 12 5.5C8.1 5.5 5.1 4.7 3.3 4.1C2.7 3.8 2 4.3 2 5V19C2 19.7 2.7 20.2 3.3 20C5.4 19.3 8.1 18.5 12 18.5C15.9 18.5 18.7 19.3 20.7 20C21.4 20.2 22 19.7 22 19V5C22 4.3 21.3 3.8 20.7 4.1M12 15C9.7 15 7.5 15.1 5.5 15.4L9.2 11L11.2 13.4L14 10L18.5 15.4C16.5 15.1 14.3 15 12 15Z',


		//sort_name_asc: 'M19 17H22L18 21L14 17H17V3H19M11 13V15L7.67 19H11V21H5V19L8.33 15H5V13M9 3H7C5.9 3 5 3.9 5 5V11H7V9H9V11H11V5C11 3.9 10.11 3 9 3M9 7H7V5H9Z',
		sort_name_asc: 'M9.25 5L12.5 1.75L15.75 5H9.25M8.89 14.3H6L5.28 17H2.91L6 7H9L12.13 17H9.67L8.89 14.3M6.33 12.68H8.56L7.93 10.56L7.67 9.59L7.42 8.63H7.39L7.17 9.6L6.93 10.58L6.33 12.68M13.05 17V15.74L17.8 8.97V8.91H13.5V7H20.73V8.34L16.09 15V15.08H20.8V17H13.05Z',
		//sort_name_desc: 'M19 7H22L18 3L14 7H17V21H19M11 13V15L7.67 19H11V21H5V19L8.33 15H5V13M9 3H7C5.9 3 5 3.9 5 5V11H7V9H9V11H11V5C11 3.9 10.11 3 9 3M9 7H7V5H9Z',
		sort_name_desc: 'M15.75 19L12.5 22.25L9.25 19H15.75M8.89 14.3H6L5.28 17H2.91L6 7H9L12.13 17H9.67L8.89 14.3M6.33 12.68H8.56L7.93 10.56L7.67 9.59L7.42 8.63H7.39L7.17 9.6L6.93 10.58L6.33 12.68M13.05 17V15.74L17.8 8.97V8.91H13.5V7H20.73V8.34L16.09 15V15.08H20.8V17H13.05Z',

		sort_kind_asc: 'M3 11H15V13H3M3 18V16H21V18M3 6H9V8H3Z',
		sort_kind_desc: 'M3,13H15V11H3M3,6V8H21V6M3,18H9V16H3V18Z',
		sort_size_asc: 'M10,13V11H18V13H10M10,19V17H14V19H10M10,7V5H22V7H10M6,17H8.5L5,20.5L1.5,17H4V7H1.5L5,3.5L8.5,7H6V17Z',
		sort_size_desc: 'M10,13V11H18V13H10M10,19V17H14V19H10M10,7V5H22V7H10M6,17H8.5L5,20.5L1.5,17H4V7H1.5L5,3.5L8.5,7H6V17Z',
		sort_date_asc: 'M7.78 7C9.08 7.04 10 7.53 10.57 8.46C11.13 9.4 11.41 10.56 11.39 11.95C11.4 13.5 11.09 14.73 10.5 15.62C9.88 16.5 8.95 16.97 7.71 17C6.45 16.96 5.54 16.5 4.96 15.56C4.38 14.63 4.09 13.45 4.09 12S4.39 9.36 5 8.44C5.59 7.5 6.5 7.04 7.78 7M7.75 8.63C7.31 8.63 6.96 8.9 6.7 9.46C6.44 10 6.32 10.87 6.32 12C6.31 13.15 6.44 14 6.69 14.54C6.95 15.1 7.31 15.37 7.77 15.37C8.69 15.37 9.16 14.24 9.17 12C9.17 9.77 8.7 8.65 7.75 8.63M13.33 17V15.22L13.76 15.24L14.3 15.22L15.34 15.03C15.68 14.92 16 14.78 16.26 14.58C16.59 14.35 16.86 14.08 17.07 13.76C17.29 13.45 17.44 13.12 17.53 12.78L17.5 12.77C17.05 13.19 16.38 13.4 15.47 13.41C14.62 13.4 13.91 13.15 13.34 12.65S12.5 11.43 12.46 10.5C12.47 9.5 12.81 8.69 13.47 8.03C14.14 7.37 15 7.03 16.12 7C17.37 7.04 18.29 7.45 18.88 8.24C19.47 9 19.76 10 19.76 11.19C19.75 12.15 19.61 13 19.32 13.76C19.03 14.5 18.64 15.13 18.12 15.64C17.66 16.06 17.11 16.38 16.47 16.61C15.83 16.83 15.12 16.96 14.34 17H13.33M16.06 8.63C15.65 8.64 15.32 8.8 15.06 9.11C14.81 9.42 14.68 9.84 14.68 10.36C14.68 10.8 14.8 11.16 15.03 11.46C15.27 11.77 15.63 11.92 16.11 11.93C16.43 11.93 16.7 11.86 16.92 11.74C17.14 11.61 17.3 11.46 17.41 11.28C17.5 11.17 17.53 10.97 17.53 10.71C17.54 10.16 17.43 9.69 17.2 9.28C16.97 8.87 16.59 8.65 16.06 8.63M9.25 5L12.5 1.75L15.75 5H9.25',
		sort_date_desc: 'M7.78 7C9.08 7.04 10 7.53 10.57 8.46C11.13 9.4 11.41 10.56 11.39 11.95C11.4 13.5 11.09 14.73 10.5 15.62C9.88 16.5 8.95 16.97 7.71 17C6.45 16.96 5.54 16.5 4.96 15.56C4.38 14.63 4.09 13.45 4.09 12S4.39 9.36 5 8.44C5.59 7.5 6.5 7.04 7.78 7M7.75 8.63C7.31 8.63 6.96 8.9 6.7 9.46C6.44 10 6.32 10.87 6.32 12C6.31 13.15 6.44 14 6.69 14.54C6.95 15.1 7.31 15.37 7.77 15.37C8.69 15.37 9.16 14.24 9.17 12C9.17 9.77 8.7 8.65 7.75 8.63M13.33 17V15.22L13.76 15.24L14.3 15.22L15.34 15.03C15.68 14.92 16 14.78 16.26 14.58C16.59 14.35 16.86 14.08 17.07 13.76C17.29 13.45 17.44 13.12 17.53 12.78L17.5 12.77C17.05 13.19 16.38 13.4 15.47 13.41C14.62 13.4 13.91 13.15 13.34 12.65S12.5 11.43 12.46 10.5C12.47 9.5 12.81 8.69 13.47 8.03C14.14 7.37 15 7.03 16.12 7C17.37 7.04 18.29 7.45 18.88 8.24C19.47 9 19.76 10 19.76 11.19C19.75 12.15 19.61 13 19.32 13.76C19.03 14.5 18.64 15.13 18.12 15.64C17.66 16.06 17.11 16.38 16.47 16.61C15.83 16.83 15.12 16.96 14.34 17H13.33M16.06 8.63C15.65 8.64 15.32 8.8 15.06 9.11C14.81 9.42 14.68 9.84 14.68 10.36C14.68 10.8 14.8 11.16 15.03 11.46C15.27 11.77 15.63 11.92 16.11 11.93C16.43 11.93 16.7 11.86 16.92 11.74C17.14 11.61 17.3 11.46 17.41 11.28C17.5 11.17 17.53 10.97 17.53 10.71C17.54 10.16 17.43 9.69 17.2 9.28C16.97 8.87 16.59 8.65 16.06 8.63M15.75 19L12.5 22.25L9.25 19H15.75Z',
		filesize: 'M3,13H15V11H3M3,6V8H21V6M3,18H9V16H3V18Z', // don't think this is used

		// layout
		//layout_list: 'M7,5H21V7H7V5M7,13V11H21V13H7M4,4.5A1.5,1.5 0 0,1 5.5,6A1.5,1.5 0 0,1 4,7.5A1.5,1.5 0 0,1 2.5,6A1.5,1.5 0 0,1 4,4.5M4,10.5A1.5,1.5 0 0,1 5.5,12A1.5,1.5 0 0,1 4,13.5A1.5,1.5 0 0,1 2.5,12A1.5,1.5 0 0,1 4,10.5M7,19V17H21V19H7M4,16.5A1.5,1.5 0 0,1 5.5,18A1.5,1.5 0 0,1 4,19.5A1.5,1.5 0 0,1 2.5,18A1.5,1.5 0 0,1 4,16.5Z',
		//layout_list: 'M6 6H4v2h2V6zm14 0H8v2h12V6zM4 11h2v2H4v-2zm16 0H8v2h12v-2zM4 16h2v2H4v-2zm16 0H8v2h12v-2z',
		layout_list: 'M8 5h13v2H7V5Zm-5 0h2v2H3Zm0 6h2v2H3Zm0 6h2v2H3ZM8 11h13v2H7v-2Zm0 6h13v2H7v-2Z',
		//layout_imagelist: 'M3,4H7V8H3V4M9,5V7H21V5H9M3,10H7V14H3V10M9,11V13H21V11H9M3,16H7V20H3V16M9,17V19H21V17H9',
		layout_imagelist: 'M3,4H7V8H3V4M9,5V7H21V5H9M3,10H7V14H3V10M9,11V13H21V11H9M3,16H7V20H3V16M9,17V19H21V17H9',
		//layout_blocks: 'M2 14H8V20H2M16 8H10V10H16M2 10H8V4H2M10 4V6H22V4M10 20H16V18H10M10 16H22V14H10',
		//layout_blocks: 'M3 13H11V21H3M17 8H13V10H17M3 11H11V3H3M13 4V6H21V4M13 20H17V18H13M13 16H21V14H13',
		layout_blocks: 'M4 11h6A1 1 0 0011 10v-6A1 1 0 0010 3h-6A1 1 0 003 4V10A1 1 0 004 11zM4 21h6a1 1 0 001-1v-6a1 1 0 00-1-1H4a1 1 0 00-1 1v6a1 1 0 001 1zM17 8H13V10H17M13 4V6H21V4M13 20H17V18H13M13 16H21V14H13',
		//layout_blocks: 'M3 14H9V20H3M16 8H11V10H16M3 10H9V4H3M11 4V6H21V4M11 20H17V18H11M11 16H21V14H11',

		//layout_grid: 'M3,9H7V5H3V9M3,14H7V10H3V14M8,14H12V10H8V14M13,14H17V10H13V14M8,9H12V5H8V9M13,5V9H17V5H13M18,14H22V10H18V14M3,19H7V15H3V19M8,19H12V15H8V19M13,19H17V15H13V19M18,19H22V15H18V19M18,5V9H22V5H18Z',
		//layout_grid: 'M3,11H11V3H3M3,21H11V13H3M13,21H21V13H13M13,3V11H21V3',
		//layout_grid: 'M3 3v8h8V3H3zm6 6H5V5h4v4zm-6 4v8h8v-8H3zm6 6H5v-4h4v4zm4-16v8h8V3h-8zm6 6h-4V5h4v4zm-6 4v8h8v-8h-8zm6 6h-4v-4h4v4z',
		//layout_grid: 'M4 8h4V4H4v4zm6 12h4v-4h-4v4zm-6 0h4v-4H4v4zm0-6h4v-4H4v4zm6 0h4v-4h-4v4zm6-10v4h4V4h-4zm-6 4h4V4h-4v4zm6 6h4v-4h-4v4zm0 6h4v-4h-4v4z',
		//layout_grid: 'M3,11H11V3H3M3,21H11V13H3M13,21H21V13H13M13,3V11H21V3',
		layout_grid: 'M4 11h6a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1zm10 0h6a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1h-6a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1zM4 21h6a1 1 0 0 0 1-1v-6a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1zm10 0h6a1 1 0 0 0 1-1v-6a1 1 0 0 0-1-1h-6a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1z',
		//layout_grid: 'M14.67 5v6.5H9.33V5h5.34zm1 6.5H21V5h-5.33v6.5zm-1 7.5v-6.5H9.33V19h5.34zm1-6.5V19H21v-6.5h-5.33zm-7.34 0H3V19h5.33v-6.5zm0-1V5H3v6.5h5.33z',

		//layout_rows: 'M3,19H9V12H3V19M10,19H22V12H10V19M3,5V11H22V5H3Z',
		//layout_rows: 'M2 4v7h20V4H2zm8 16h12v-7H10v7zm-8 0h6v-7H2v7z',
		layout_rows: 'M3 4v6c0 .55.45 1 1 1h16c.55 0 1-.45 1-1V4c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1zm9 17h8c.55 0 1-.45 1-1v-6c0-.55-.45-1-1-1H12c-.55 0-1 .45-1 1v6c0 .55.45 1 1 1zm-8 0h4c.55 0 1-.45 1-1v-6c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v6c0 .55.45 1 1 1z',
		//layout_columns: 'M2,5V19H8V5H2M9,5V10H15V5H9M16,5V14H22V5H16M9,11V19H15V11H9M16,15V19H22V15H16Z',
		//layout_columns: 'M13,3V9H21V3M13,21H21V11H13M3,21H11V15H3M3,13H11V3H3V13Z',
		//layout_columns: 'M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z',
		layout_columns: 'M4 13h6c.55 0 1-.45 1-1V4c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v8c0 .55.45 1 1 1zm0 8h6c.55 0 1-.45 1-1v-4c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v4c0 .55.45 1 1 1zm10 0h6c.55 0 1-.45 1-1v-8c0-.55-.45-1-1-1h-6c-.55 0-1 .45-1 1v8c0 .55.45 1 1 1zM13 4v4c0 .55.45 1 1 1h6c.55 0 1-.45 1-1V4c0-.55-.45-1-1-1h-6c-.55 0-1 .45-1 1z',
		//layout_small: 'M16.59,5.41L15.17,4L12,7.17L8.83,4L7.41,5.41L12,10M7.41,18.59L8.83,20L12,16.83L15.17,20L16.58,18.59L12,14L7.41,18.59Z',
		//layout_large: 'M12,18.17L8.83,15L7.42,16.41L12,21L16.59,16.41L15.17,15M12,5.83L15.17,9L16.58,7.59L12,3L7.41,7.59L8.83,9L12,5.83Z',


		lock_outline: 'M12,17C10.89,17 10,16.1 10,15C10,13.89 10.89,13 12,13A2,2 0 0,1 14,15A2,2 0 0,1 12,17M18,20V10H6V20H18M18,8A2,2 0 0,1 20,10V20A2,2 0 0,1 18,22H6C4.89,22 4,21.1 4,20V10C4,8.89 4.89,8 6,8H7V6A5,5 0 0,1 12,1A5,5 0 0,1 17,6V8H18M12,3A3,3 0 0,0 9,6V8H15V6A3,3 0 0,0 12,3Z',
		lock_open_outline: 'M18,20V10H6V20H18M18,8A2,2 0 0,1 20,10V20A2,2 0 0,1 18,22H6C4.89,22 4,21.1 4,20V10A2,2 0 0,1 6,8H15V6A3,3 0 0,0 12,3A3,3 0 0,0 9,6H7A5,5 0 0,1 12,1A5,5 0 0,1 17,6V8H18M12,17A2,2 0 0,1 10,15A2,2 0 0,1 12,13A2,2 0 0,1 14,15A2,2 0 0,1 12,17Z',
		//open_in_new: 'M14,3V5H17.59L7.76,14.83L9.17,16.24L19,6.41V10H21V3M19,19H5V5H12V3H5C3.89,3 3,3.9 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V12H19V19Z',
		//open_in_new: 'M19,3H5A2,2 0 0,0 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5A2,2 0 0,0 19,3M11,16H10C8.39,16 6,14.94 6,12C6,9.07 8.39,8 10,8H11V10H10C9.54,10 8,10.17 8,12C8,13.9 9.67,14 10,14H11V16M15,11V13H9V11H15M14,16H13V14H14C14.46,14 16,13.83 16,12C16,10.1 14.33,10 14,10H13V8H14C15.61,8 18,9.07 18,12C18,14.94 15.61,16 14,16Z',
		//open_in_new: 'M3 6a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V6zm10-1a1 1 0 1 0 0 2h2.586l-4.293 4.293a1 1 0 0 0 1.414 1.414L17 8.414V11a1 1 0 1 0 2 0V6a1 1 0 0 0-1-1h-5z',
		//open_in_new: 'm21 11l-6-6v5H8c-2.76 0-5 2.24-5 5v4h2v-4c0-1.65 1.35-3 3-3h7v5l6-6z',
		//open_in_new: 'M15 18V13.5H9a4.5 4.5 90 00-4.5 4.5v3a7.5 7.5 90 014.5-13.5h6V3l7.5 7.5-7.5 7.5Z',
		open_in_new: 'm15 5l-1.41 1.41L15 7.83L17.17 10H8c-2.76 0-5 2.24-5 5v4h2v-4c0-1.65 1.35-3 3-3h9.17L15 14.17l-1.41 1.41L15 17l6-6l-6-6z',
		//open_in_new: 'M14,3V5H17.59L7.76,14.83L9.17,16.24L19,6.41V10H21V3M19,19H5V5H12V3H5C3.89,3 3,3.9 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V12H19V19Z',
		//open_in_new: 'M19 3C20.1 3 21 3.9 21 5V19C21 20.1 20.1 21 19 21H5C3.9 21 3 20.1 3 19V5C3 3.9 3.9 3 5 3H19M8.7 8L10.8 10.1L7 14L9.8 16.8L13.6 12.9L15.7 15V8H8.7Z',
		play: 'M8,5.14V19.14L19,12.14L8,5.14Z',
		pause: 'M14,19H18V5H14M6,19H10V5H6V19Z',
		menu_down: 'M7,13L12,18L17,13H7Z',
		menu_up: 'M7,12L12,7L17,12H7Z',

		//home: 'M10,20V14H14V20H19V12H22L12,3L2,12H5V20H10Z',
		home: 'M20 6H12L10 4H4A2 2 0 0 0 2 6V18A2 2 0 0 0 4 20H20A2 2 0 0 0 22 18V8A2 2 0 0 0 20 6M17 13V17H15V14H13V17H11V13H9L14 9L19 13Z',
		//filter_outline: 'M15,19.88C15.04,20.18 14.94,20.5 14.71,20.71C14.32,21.1 13.69,21.1 13.3,20.71L9.29,16.7C9.06,16.47 8.96,16.16 9,15.87V10.75L4.21,4.62C3.87,4.19 3.95,3.56 4.38,3.22C4.57,3.08 4.78,3 5,3V3H19V3C19.22,3 19.43,3.08 19.62,3.22C20.05,3.56 20.13,4.19 19.79,4.62L15,10.75V19.88M7.04,5L11,10.06V15.58L13,17.58V10.05L16.96,5H7.04Z',
		//filter_remove_outline: 'M14.73,20.83L17.58,18L14.73,15.17L16.15,13.76L19,16.57L21.8,13.76L23.22,15.17L20.41,18L23.22,20.83L21.8,22.24L19,19.4L16.15,22.24L14.73,20.83M13,19.88C13.04,20.18 12.94,20.5 12.71,20.71C12.32,21.1 11.69,21.1 11.3,20.71L7.29,16.7C7.06,16.47 6.96,16.16 7,15.87V10.75L2.21,4.62C1.87,4.19 1.95,3.56 2.38,3.22C2.57,3.08 2.78,3 3,3V3H17V3C17.22,3 17.43,3.08 17.62,3.22C18.05,3.56 18.13,4.19 17.79,4.62L13,10.75V19.88M5.04,5L9,10.06V15.58L11,17.58V10.05L14.96,5H5.04Z',
		//file_document_box_search_outline: 'M15.5,12C18,12 20,14 20,16.5C20,17.38 19.75,18.21 19.31,18.9L22.39,22L21,23.39L17.88,20.32C17.19,20.75 16.37,21 15.5,21C13,21 11,19 11,16.5C11,14 13,12 15.5,12M15.5,14A2.5,2.5 0 0,0 13,16.5A2.5,2.5 0 0,0 15.5,19A2.5,2.5 0 0,0 18,16.5A2.5,2.5 0 0,0 15.5,14M5,3H19C20.11,3 21,3.89 21,5V13.03C20.5,12.23 19.81,11.54 19,11V5H5V19H9.5C9.81,19.75 10.26,20.42 10.81,21H5C3.89,21 3,20.11 3,19V5C3,3.89 3.89,3 5,3M7,7H17V9H7V7M7,11H12.03C11.23,11.5 10.54,12.19 10,13H7V11M7,15H9.17C9.06,15.5 9,16 9,16.5V17H7V15Z',
		image_search_outline: 'M15.5,9C16.2,9 16.79,8.76 17.27,8.27C17.76,7.79 18,7.2 18,6.5C18,5.83 17.76,5.23 17.27,4.73C16.79,4.23 16.2,4 15.5,4C14.83,4 14.23,4.23 13.73,4.73C13.23,5.23 13,5.83 13,6.5C13,7.2 13.23,7.79 13.73,8.27C14.23,8.76 14.83,9 15.5,9M19.31,8.91L22.41,12L21,13.41L17.86,10.31C17.08,10.78 16.28,11 15.47,11C14.22,11 13.16,10.58 12.3,9.7C11.45,8.83 11,7.77 11,6.5C11,5.27 11.45,4.2 12.33,3.33C13.2,2.45 14.27,2 15.5,2C16.77,2 17.83,2.45 18.7,3.33C19.58,4.2 20,5.27 20,6.5C20,7.33 19.78,8.13 19.31,8.91M16.5,18H5.5L8.25,14.5L10.22,16.83L12.94,13.31L16.5,18M18,13L20,15V20C20,20.55 19.81,21 19.41,21.4C19,21.79 18.53,22 18,22H4C3.45,22 3,21.79 2.6,21.4C2.21,21 2,20.55 2,20V6C2,5.47 2.21,5 2.6,4.59C3,4.19 3.45,4 4,4H9.5C9.2,4.64 9.03,5.31 9,6H4V20H18V13Z',
		search: 'M9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.44,13.73L14.71,14H15.5L20.5,19L19,20.5L14,15.5V14.71L13.73,14.44C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3M9.5,5C7,5 5,7 5,9.5C5,12 7,14 9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5Z',

		// file icons
		//file_default: 'M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z',
		//file_default: 'M19,3A2,2 0 0,1 21,5V19A2,2 0 0,1 19,21H5C3.89,21 3,20.1 3,19V5C3,3.89 3.89,3 5,3H19M11,17H13V13.73L15.83,15.36L16.83,13.63L14,12L16.83,10.36L15.83,8.63L13,10.27V7H11V10.27L8.17,8.63L7.17,10.36L10,12L7.17,13.63L8.17,15.36L11,13.73V17Z',
		default: 'M14 10V4.5L19 10M5 3C3.89 3 3 3.89 3 5V19A2 2 0 005 21H19A2 2 0 0021 19V9L15 3H5Z',
		//file_default: 'M15 3H5A2 2 0 003 5V19A2 2 0 005 21H19A2 2 0 0021 19V9L15 3M17 19H5V5H14V10H19V19Z',
		//file_default: 'M6 2c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6H6zm7 7V3.5L18.5 9H13z',
		//file_hidden: 'M13,9H14V11H11V7H13V9M18.5,9L16.38,6.88L17.63,5.63L20,8V10H18V11H15V9H18.5M13,3.5V2H12V4H13V6H11V4H9V2H8V4H6V5H4V4C4,2.89 4.89,2 6,2H14L16.36,4.36L15.11,5.61L13,3.5M20,20A2,2 0 0,1 18,22H16V20H18V19H20V20M18,15H20V18H18V15M12,22V20H15V22H12M8,22V20H11V22H8M6,22C4.89,22 4,21.1 4,20V18H6V20H7V22H6M4,14H6V17H4V14M4,10H6V13H4V10M18,11H20V14H18V11M4,6H6V9H4V6Z',
		//application: 'M19,4C20.11,4 21,4.9 21,6V18A2,2 0 0,1 19,20H5C3.89,20 3,19.1 3,18V6A2,2 0 0,1 5,4H19M19,18V8H5V18H19Z',
		//application: 'M21 2H3C1.9 2 1 2.9 1 4V20C1 21.1 1.9 22 3 22H21C22.1 22 23 21.1 23 20V4C23 2.9 22.1 2 21 2M21 7H3V4H21V7Z',
		application: 'M19 3H5a2 2 0 00-2 2v2h18V5a2 2 0 00-2-2ZM6 6a1 1 0 111-1 1 1 0 01-1 1Zm3 0a1 1 0 111-1 1.003 1.003 0 01-1 1Zm12 6V8H3v11a2 2 0 002 2h14a2 2 0 002-2Z',
		archive: 'M14,17H12V15H10V13H12V15H14M14,9H12V11H14V13H12V11H10V9H12V7H10V5H12V7H14M19,3H5C3.89,3 3,3.89 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5C21,3.89 20.1,3 19,3Z',
		//audio: 'M14,3.23V5.29C16.89,6.15 19,8.83 19,12C19,15.17 16.89,17.84 14,18.7V20.77C18,19.86 21,16.28 21,12C21,7.72 18,4.14 14,3.23M16.5,12C16.5,10.23 15.5,8.71 14,7.97V16C15.5,15.29 16.5,13.76 16.5,12M3,9V15H7L12,20V4L7,9H3Z',
		audio: 'M16,9H13V14.5A2.5,2.5 0 0,1 10.5,17A2.5,2.5 0 0,1 8,14.5A2.5,2.5 0 0,1 10.5,12C11.07,12 11.58,12.19 12,12.5V7H16M19,3H5A2,2 0 0,0 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5A2,2 0 0,0 19,3Z',
		cd: 'M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,9A3,3 0 0,1 15,12A3,3 0 0,1 12,15A3,3 0 0,1 9,12A3,3 0 0,1 12,9Z',
		//code: 'M14.6,16.6L19.2,12L14.6,7.4L16,6L22,12L16,18L14.6,16.6M9.4,16.6L4.8,12L9.4,7.4L8,6L2,12L8,18L9.4,16.6Z',
		//code: 'M12.89,3L14.85,3.4L11.11,21L9.15,20.6L12.89,3M19.59,12L16,8.41V5.58L22.42,12L16,18.41V15.58L19.59,12M1.58,12L8,5.58V8.41L4.41,12L8,15.58V18.41L1.58,12Z',
		code: 'm9.6 15.6l1.4-1.425L8.825 12L11 9.825L9.6 8.4L6 12Zm4.8 0L18 12l-3.6-3.6L13 9.825L15.175 12L13 14.175ZM5 21q-.825 0-1.413-.587Q3 19.825 3 19V5q0-.825.587-1.413Q4.175 3 5 3h14q.825 0 1.413.587Q21 4.175 21 5v14q0 .825-.587 1.413Q19.825 21 19 21Z',
		//excel: 'M16.2,17H14.2L12,13.2L9.8,17H7.8L11,12L7.8,7H9.8L12,10.8L14.2,7H16.2L13,12M19,3H5C3.89,3 3,3.89 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5C21,3.89 20.1,3 19,3Z',
		excel: 'M19 3H5C3.89 3 3 3.89 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.89 20.1 3 19 3M9 18H6V16H9V18M9 15H6V13H9V15M9 12H6V10H9V12M13 18H10V16H13V18M13 15H10V13H13V15M13 12H10V10H13V12Z',
		//font: 'M17,8H20V20H21V21H17V20H18V17H14L12.5,20H14V21H10V20H11L17,8M18,9L14.5,16H18V9M5,3H10C11.11,3 12,3.89 12,5V16H9V11H6V16H3V5C3,3.89 3.89,3 5,3M6,5V9H9V5H6Z',
		//font: 'M9.93 13.5h4.14L12 7.98zM20 2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-4.05 16.5-1.14-3H9.17l-1.12 3H5.96l5.11-13h1.86l5.11 13h-2.09z',
		//font: 'M9,7V17H11V13H14V11H11V9H15V7H9M5,3H19A2,2 0 0,1 21,5V19A2,2 0 0,1 19,21H5A2,2 0 0,1 3,19V5A2,2 0 0,1 5,3Z',
		font: 'M9.837 13.05h3.726L11.7 8.082zM18.9 2.7H4.5c-.99 0-1.8.81-1.8 1.8v14.4c0 .99.81 1.8 1.8 1.8h14.4c.99 0 1.8-.81 1.8-1.8V4.5c0-.99-.81-1.8-1.8-1.8zm-3.645 14.85-1.026-2.7H9.153l-1.008 2.7H6.264l4.599-11.7h1.674l4.599 11.7h-1.881z',
		image: 'M8.5,13.5L11,16.5L14.5,12L19,18H5M21,19V5C21,3.89 20.1,3 19,3H5A2,2 0 0,0 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19Z',
		pdf: 'M19,3A2,2 0 0,1 21,5V19A2,2 0 0,1 19,21H5C3.89,21 3,20.1 3,19V5C3,3.89 3.89,3 5,3H19M10.59,10.08C10.57,10.13 10.3,11.84 8.5,14.77C8.5,14.77 5,16.58 5.83,17.94C6.5,19 8.15,17.9 9.56,15.27C9.56,15.27 11.38,14.63 13.79,14.45C13.79,14.45 17.65,16.19 18.17,14.34C18.69,12.5 15.12,12.9 14.5,13.09C14.5,13.09 12.46,11.75 12,9.89C12,9.89 13.13,5.95 11.38,6C9.63,6.05 10.29,9.12 10.59,10.08M11.4,11.13C11.43,11.13 11.87,12.33 13.29,13.58C13.29,13.58 10.96,14.04 9.9,14.5C9.9,14.5 10.9,12.75 11.4,11.13M15.32,13.84C15.9,13.69 17.64,14 17.58,14.32C17.5,14.65 15.32,13.84 15.32,13.84M8.26,15.7C7.73,16.91 6.83,17.68 6.6,17.67C6.37,17.66 7.3,16.07 8.26,15.7M11.4,8.76C11.39,8.71 11.03,6.57 11.4,6.61C11.94,6.67 11.4,8.71 11.4,8.76Z',
		powerpoint: 'M9.8,13.4H12.3C13.8,13.4 14.46,13.12 15.1,12.58C15.74,12.03 16,11.25 16,10.23C16,9.26 15.75,8.5 15.1,7.88C14.45,7.29 13.83,7 12.3,7H8V17H9.8V13.4M19,3A2,2 0 0,1 21,5V19A2,2 0 0,1 19,21H5A2,2 0 0,1 3,19V5C3,3.89 3.9,3 5,3H19M9.8,12V8.4H12.1C12.76,8.4 13.27,8.65 13.6,9C13.93,9.35 14.1,9.72 14.1,10.24C14.1,10.8 13.92,11.19 13.6,11.5C13.28,11.81 12.9,12 12.22,12H9.8Z',
		text: 'M14,17H7V15H14M17,13H7V11H17M17,9H7V7H17M19,3H5C3.89,3 3,3.89 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5C21,3.89 20.1,3 19,3Z',
		//text: 'M5,3C3.89,3 3,3.89 3,5V19C3,20.11 3.89,21 5,21H19C20.11,21 21,20.11 21,19V5C21,3.89 20.11,3 19,3H5M5,5H19V19H5V5M7,7V9H17V7H7M7,11V13H17V11H7M7,15V17H14V15H7Z',
		//video: 'M17,10.5V7A1,1 0 0,0 16,6H4A1,1 0 0,0 3,7V17A1,1 0 0,0 4,18H16A1,1 0 0,0 17,17V13.5L21,17.5V6.5L17,10.5Z',
		video: 'M19 3H5C3.89 3 3 3.89 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.89 20.1 3 19 3M10 16V8L15 12',
		word: 'M15.5,17H14L12,9.5L10,17H8.5L6.1,7H7.8L9.34,14.5L11.3,7H12.7L14.67,14.5L16.2,7H17.9M19,3H5C3.89,3 3,3.89 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5C21,3.89 20.1,3 19,3Z',

		translate: 'M12.87,15.07L10.33,12.56L10.36,12.53C12.1,10.59 13.34,8.36 14.07,6H17V4H10V2H8V4H1V6H12.17C11.5,7.92 10.44,9.75 9,11.35C8.07,10.32 7.3,9.19 6.69,8H4.69C5.42,9.63 6.42,11.17 7.67,12.56L2.58,17.58L4,19L9,14L12.11,17.11L12.87,15.07M18.5,10H16.5L12,22H14L15.12,19H19.87L21,22H23L18.5,10M15.88,17L17.5,12.67L19.12,17H15.88Z',
		web: 'M16.36,14C16.44,13.34 16.5,12.68 16.5,12C16.5,11.32 16.44,10.66 16.36,10H19.74C19.9,10.64 20,11.31 20,12C20,12.69 19.9,13.36 19.74,14M14.59,19.56C15.19,18.45 15.65,17.25 15.97,16H18.92C17.96,17.65 16.43,18.93 14.59,19.56M14.34,14H9.66C9.56,13.34 9.5,12.68 9.5,12C9.5,11.32 9.56,10.65 9.66,10H14.34C14.43,10.65 14.5,11.32 14.5,12C14.5,12.68 14.43,13.34 14.34,14M12,19.96C11.17,18.76 10.5,17.43 10.09,16H13.91C13.5,17.43 12.83,18.76 12,19.96M8,8H5.08C6.03,6.34 7.57,5.06 9.4,4.44C8.8,5.55 8.35,6.75 8,8M5.08,16H8C8.35,17.25 8.8,18.45 9.4,19.56C7.57,18.93 6.03,17.65 5.08,16M4.26,14C4.1,13.36 4,12.69 4,12C4,11.31 4.1,10.64 4.26,10H7.64C7.56,10.66 7.5,11.32 7.5,12C7.5,12.68 7.56,13.34 7.64,14M12,4.03C12.83,5.23 13.5,6.57 13.91,8H10.09C10.5,6.57 11.17,5.23 12,4.03M18.92,8H15.97C15.65,6.75 15.19,5.55 14.59,4.44C16.43,5.07 17.96,6.34 18.92,8M12,2C6.47,2 2,6.5 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z',

		cancel_circle: 'M12 2C17.5 2 22 6.5 22 12S17.5 22 12 22 2 17.5 2 12 6.5 2 12 2M12 4C10.1 4 8.4 4.6 7.1 5.7L18.3 16.9C19.3 15.5 20 13.8 20 12C20 7.6 16.4 4 12 4M16.9 18.3L5.7 7.1C4.6 8.4 4 10.1 4 12C4 16.4 7.6 20 12 20C13.9 20 15.6 19.4 16.9 18.3Z',
		printer: 'M18,3H6V7H18M19,12A1,1 0 0,1 18,11A1,1 0 0,1 19,10A1,1 0 0,1 20,11A1,1 0 0,1 19,12M16,19H8V14H16M19,8H5A3,3 0 0,0 2,11V17H6V21H18V17H22V11A3,3 0 0,0 19,8Z',
		//youtube_overlay: 'M10,15L15.19,12L10,9V15M21.56,7.17C21.69,7.64 21.78,8.27 21.84,9.07C21.91,9.87 21.94,10.56 21.94,11.16L22,12C22,14.19 21.84,15.8 21.56,16.83C21.31,17.73 20.73,18.31 19.83,18.56C19.36,18.69 18.5,18.78 17.18,18.84C15.88,18.91 14.69,18.94 13.59,18.94L12,19C7.81,19 5.2,18.84 4.17,18.56C3.27,18.31 2.69,17.73 2.44,16.83C2.31,16.36 2.22,15.73 2.16,14.93C2.09,14.13 2.06,13.44 2.06,12.84L2,12C2,9.81 2.16,8.2 2.44,7.17C2.69,6.27 3.27,5.69 4.17,5.44C4.64,5.31 5.5,5.22 6.82,5.16C8.12,5.09 9.31,5.06 10.41,5.06L12,5C16.19,5 18.8,5.16 19.83,5.44C20.73,5.69 21.31,6.27 21.56,7.17Z',
		//vimeo: 'M22,7.42C21.91,9.37 20.55,12.04 17.92,15.44C15.2,19 12.9,20.75 11,20.75C9.85,20.75 8.86,19.67 8.05,17.5C7.5,15.54 7,13.56 6.44,11.58C5.84,9.42 5.2,8.34 4.5,8.34C4.36,8.34 3.84,8.66 2.94,9.29L2,8.07C3,7.2 3.96,6.33 4.92,5.46C6.24,4.32 7.23,3.72 7.88,3.66C9.44,3.5 10.4,4.58 10.76,6.86C11.15,9.33 11.42,10.86 11.57,11.46C12,13.5 12.5,14.5 13.05,14.5C13.47,14.5 14.1,13.86 14.94,12.53C15.78,11.21 16.23,10.2 16.29,9.5C16.41,8.36 15.96,7.79 14.94,7.79C14.46,7.79 13.97,7.9 13.46,8.12C14.44,4.89 16.32,3.32 19.09,3.41C21.15,3.47 22.12,4.81 22,7.42Z'
	};
	// clone video for small youtube icon (but use youtube color)
	svg_small.vimeo = svg_small.youtube = svg_small.video;
	svg_small.url = svg_small.open_in_new; // create url for contextmenu, don't inherit the one use for files


	// large file/folder icons
	const svg_large = {
		//application: '<path d="M35 14C36.11 14 37 14.9 37 16V28A2 2 0 0 1 35 30H21C19.89 30 19 29.1 19 28V16A2 2 0 0 1 21 14H35M35 28V18H21V28H35z"/>',
		application: '<path d="M17.875 14.625v2.25h20.25V14.625a2.2511 2.2511 90 00-2.25-2.25H20.125a2.2511 2.2511 90 00-2.25 2.25Zm3.375 1.125a1.1104 1.1104 90 01-1.1171-1.116A1.1261 1.1261 90 0121.25 13.5a1.1396 1.1396 90 011.1318 1.134A1.1228 1.1228 90 0121.25 15.75Zm3.375 0a1.125 1.125 90 111.125-1.125 1.1295 1.1295 90 01-1.125 1.125ZM17.875 18v12.375a2.25 2.25 90 002.25 2.25h15.75a2.25 2.25 90 002.25-2.25V18Zm18 12.375H20.125V20.25h15.75Z"/>',
		archive: '<path d="M28.5,24v-2h2v-2h-2v-2h2v-2h-2v-2h2v-2h-2v-2h2V8h-2V6h-2v2h-2v2h2v2h-2v2h2v2h-2v2h2v2h-2v2h2v2 h-4v5c0,2.757,2.243,5,5,5s5-2.243,5-5v-5H28.5z M30.5,29c0,1.654-1.346,3-3,3s-3-1.346-3-3v-3h6V29z"/><path d="M26.5,30h2c0.552,0,1-0.447,1-1s-0.448-1-1-1h-2c-0.552,0-1,0.447-1,1S25.948,30,26.5,30z"/></g>',
		audio: '<path d="M35.67,14.986c-0.567-0.796-1.3-1.543-2.308-2.351c-3.914-3.131-4.757-6.277-4.862-6.738V5 c0-0.553-0.447-1-1-1s-1,0.447-1,1v1v8.359v9.053h-3.706c-3.882,0-6.294,1.961-6.294,5.117c0,3.466,2.24,5.706,5.706,5.706 c3.471,0,6.294-2.823,6.294-6.294V16.468l0.298,0.243c0.34,0.336,0.861,0.72,1.521,1.205c2.318,1.709,6.2,4.567,5.224,7.793 C35.514,25.807,35.5,25.904,35.5,26c0,0.43,0.278,0.826,0.71,0.957C36.307,26.986,36.404,27,36.5,27c0.43,0,0.826-0.278,0.957-0.71 C39.084,20.915,37.035,16.9,35.67,14.986z M26.5,27.941c0,2.368-1.926,4.294-4.294,4.294c-2.355,0-3.706-1.351-3.706-3.706 c0-2.576,2.335-3.117,4.294-3.117H26.5V27.941z M31.505,16.308c-0.571-0.422-1.065-0.785-1.371-1.081l-1.634-1.34v-3.473 c0.827,1.174,1.987,2.483,3.612,3.783c0.858,0.688,1.472,1.308,1.929,1.95c0.716,1.003,1.431,2.339,1.788,3.978 C34.502,18.515,32.745,17.221,31.505,16.308z"/>',
		cd: '<circle cx="27.5" cy="21" r="12"/><circle style="fill:rgba(255,255,255,.5)" cx="27.5" cy="21" r="3"/><path style="fill:rgba(255,255,255,.3)" d="M25.379,18.879c0.132-0.132,0.276-0.245,0.425-0.347l-2.361-8.813 c-1.615,0.579-3.134,1.503-4.427,2.796c-1.294,1.293-2.217,2.812-2.796,4.427l8.813,2.361 C25.134,19.155,25.247,19.011,25.379,18.879z"/><path style="fill:rgba(255,255,255,.3)" d="M30.071,23.486l2.273,8.483c1.32-0.582,2.56-1.402,3.641-2.484c1.253-1.253,2.16-2.717,2.743-4.275 l-8.188-2.194C30.255,22.939,29.994,23.2,30.071,23.486z"/>',
		code: '<path d="M15.5,24c-0.256,0-0.512-0.098-0.707-0.293c-0.391-0.391-0.391-1.023,0-1.414l6-6 c0.391-0.391,1.023-0.391,1.414,0s0.391,1.023,0,1.414l-6,6C16.012,23.902,15.756,24,15.5,24z"/><path d="M21.5,30c-0.256,0-0.512-0.098-0.707-0.293l-6-6c-0.391-0.391-0.391-1.023,0-1.414 s1.023-0.391,1.414,0l6,6c0.391,0.391,0.391,1.023,0,1.414C22.012,29.902,21.756,30,21.5,30z"/><path d="M33.5,30c-0.256,0-0.512-0.098-0.707-0.293c-0.391-0.391-0.391-1.023,0-1.414l6-6 c0.391-0.391,1.023-0.391,1.414,0s0.391,1.023,0,1.414l-6,6C34.012,29.902,33.756,30,33.5,30z"/><path d="M39.5,24c-0.256,0-0.512-0.098-0.707-0.293l-6-6c-0.391-0.391-0.391-1.023,0-1.414 s1.023-0.391,1.414,0l6,6c0.391,0.391,0.391,1.023,0,1.414C40.012,23.902,39.756,24,39.5,24z"/><path d="M24.5,32c-0.11,0-0.223-0.019-0.333-0.058c-0.521-0.184-0.794-0.755-0.61-1.276l6-17 c0.185-0.521,0.753-0.795,1.276-0.61c0.521,0.184,0.794,0.755,0.61,1.276l-6,17C25.298,31.744,24.912,32,24.5,32z"/>',

		//folder: '<svg viewBox="0 0 48 48" class="img-svg svg-folder-icon"><path class="svg-folder-bg" d="M40 12H22l-4-4H8c-2.2 0-4 1.8-4 4v8h40v-4c0-2.2-1.8-4-4-4z"/><path class="svg-folder-fg" d="M40 12H8c-2.2 0-4 1.8-4 4v20c0 2.2 1.8 4 4 4h32c2.2 0 4-1.8 4-4V16c0-2.2-1.8-4-4-4z"/></svg>',
		//style="transform: translate(16px, 10px)"
		open_in_new: '<path d="m31 15-1.41 1.41L31 17.83 33.17 20H24c-2.76 0-5 2.24-5 5v4h2v-4c0-1.65 1.35-3 3-3h9.17L31 24.17l-1.41 1.41L31 27l6-6-6-6z" />',
		font: '<path d="M33 18H36V30H37V31H33V30H34V27H30L28.5 30H30V31H26V30H27L33 18M34 19L30.5 26H34V19M21 13H26C27.11 13 28 13.89 28 15V26H25V21H22V26H19V15C19 13.89 19.89 13 21 13M22 15V19H25V15H22z"/>',
		excel: '<path d="M23.5,16v-4h-12v4v2v2v2v2v2v2v2v4h10h2h21v-4v-2v-2v-2v-2v-2v-4H23.5z M13.5,14h8v2h-8V14z M13.5,18h8v2h-8V18z M13.5,22h8v2h-8V22z M13.5,26h8v2h-8V26z M21.5,32h-8v-2h8V32z M42.5,32h-19v-2h19V32z M42.5,28h-19v-2h19V28 z M42.5,24h-19v-2h19V24z M23.5,20v-2h19v2H23.5z"/>',
		image: '<circle class="circle-sun" cx="18.931" cy="14.431" r="4.569"/><polygon class="polygon-image" points="6.5,39 17.5,39 49.5,39 49.5,28 39.5,18.5 29,30 23.517,24.517"/>',
		pdf: '<path d="M19.514,33.324L19.514,33.324c-0.348,0-0.682-0.113-0.967-0.326 c-1.041-0.781-1.181-1.65-1.115-2.242c0.182-1.628,2.195-3.332,5.985-5.068c1.504-3.296,2.935-7.357,3.788-10.75 c-0.998-2.172-1.968-4.99-1.261-6.643c0.248-0.579,0.557-1.023,1.134-1.215c0.228-0.076,0.804-0.172,1.016-0.172 c0.504,0,0.947,0.649,1.261,1.049c0.295,0.376,0.964,1.173-0.373,6.802c1.348,2.784,3.258,5.62,5.088,7.562 c1.311-0.237,2.439-0.358,3.358-0.358c1.566,0,2.515,0.365,2.902,1.117c0.32,0.622,0.189,1.349-0.39,2.16 c-0.557,0.779-1.325,1.191-2.22,1.191c-1.216,0-2.632-0.768-4.211-2.285c-2.837,0.593-6.15,1.651-8.828,2.822 c-0.836,1.774-1.637,3.203-2.383,4.251C21.273,32.654,20.389,33.324,19.514,33.324z M22.176,28.198 c-2.137,1.201-3.008,2.188-3.071,2.744c-0.01,0.092-0.037,0.334,0.431,0.692C19.685,31.587,20.555,31.19,22.176,28.198z M35.813,23.756c0.815,0.627,1.014,0.944,1.547,0.944c0.234,0,0.901-0.01,1.21-0.441c0.149-0.209,0.207-0.343,0.23-0.415 c-0.123-0.065-0.286-0.197-1.175-0.197C37.12,23.648,36.485,23.67,35.813,23.756z M28.343,17.174 c-0.715,2.474-1.659,5.145-2.674,7.564c2.09-0.811,4.362-1.519,6.496-2.02C30.815,21.15,29.466,19.192,28.343,17.174z M27.736,8.712c-0.098,0.033-1.33,1.757,0.096,3.216C28.781,9.813,27.779,8.698,27.736,8.712z"/>',
		powerpoint: '<path d="M39.5,30h-24V14h24V30z M17.5,28h20V16h-20V28z"/><path d="M20.499,35c-0.175,0-0.353-0.046-0.514-0.143c-0.474-0.284-0.627-0.898-0.343-1.372l3-5 c0.284-0.474,0.898-0.627,1.372-0.343c0.474,0.284,0.627,0.898,0.343,1.372l-3,5C21.17,34.827,20.839,35,20.499,35z"/><path d="M34.501,35c-0.34,0-0.671-0.173-0.858-0.485l-3-5c-0.284-0.474-0.131-1.088,0.343-1.372 c0.474-0.283,1.088-0.131,1.372,0.343l3,5c0.284,0.474,0.131,1.088-0.343,1.372C34.854,34.954,34.676,35,34.501,35z"/><path d="M27.5,16c-0.552,0-1-0.447-1-1v-3c0-0.553,0.448-1,1-1s1,0.447,1,1v3C28.5,15.553,28.052,16,27.5,16 z"/>',
		text: '<path d="M12.5,13h6c0.553,0,1-0.448,1-1s-0.447-1-1-1h-6c-0.553,0-1,0.448-1,1S11.947,13,12.5,13z"/><path d="M12.5,18h9c0.553,0,1-0.448,1-1s-0.447-1-1-1h-9c-0.553,0-1,0.448-1,1S11.947,18,12.5,18z"/><path d="M25.5,18c0.26,0,0.52-0.11,0.71-0.29c0.18-0.19,0.29-0.45,0.29-0.71c0-0.26-0.11-0.52-0.29-0.71 c-0.38-0.37-1.04-0.37-1.42,0c-0.181,0.19-0.29,0.44-0.29,0.71s0.109,0.52,0.29,0.71C24.979,17.89,25.24,18,25.5,18z"/><path d="M29.5,18h8c0.553,0,1-0.448,1-1s-0.447-1-1-1h-8c-0.553,0-1,0.448-1,1S28.947,18,29.5,18z"/><path d="M11.79,31.29c-0.181,0.19-0.29,0.44-0.29,0.71s0.109,0.52,0.29,0.71 C11.979,32.89,12.229,33,12.5,33c0.27,0,0.52-0.11,0.71-0.29c0.18-0.19,0.29-0.45,0.29-0.71c0-0.26-0.11-0.52-0.29-0.71 C12.84,30.92,12.16,30.92,11.79,31.29z"/><path d="M24.5,31h-8c-0.553,0-1,0.448-1,1s0.447,1,1,1h8c0.553,0,1-0.448,1-1S25.053,31,24.5,31z"/><path d="M41.5,18h2c0.553,0,1-0.448,1-1s-0.447-1-1-1h-2c-0.553,0-1,0.448-1,1S40.947,18,41.5,18z"/><path d="M12.5,23h22c0.553,0,1-0.448,1-1s-0.447-1-1-1h-22c-0.553,0-1,0.448-1,1S11.947,23,12.5,23z"/><path d="M43.5,21h-6c-0.553,0-1,0.448-1,1s0.447,1,1,1h6c0.553,0,1-0.448,1-1S44.053,21,43.5,21z"/><path d="M12.5,28h4c0.553,0,1-0.448,1-1s-0.447-1-1-1h-4c-0.553,0-1,0.448-1,1S11.947,28,12.5,28z"/><path d="M30.5,26h-10c-0.553,0-1,0.448-1,1s0.447,1,1,1h10c0.553,0,1-0.448,1-1S31.053,26,30.5,26z"/><path d="M43.5,26h-9c-0.553,0-1,0.448-1,1s0.447,1,1,1h9c0.553,0,1-0.448,1-1S44.053,26,43.5,26z"/>',
		video: '<path d="M24.5,28c-0.166,0-0.331-0.041-0.481-0.123C23.699,27.701,23.5,27.365,23.5,27V13 c0-0.365,0.199-0.701,0.519-0.877c0.321-0.175,0.71-0.162,1.019,0.033l11,7C36.325,19.34,36.5,19.658,36.5,20 s-0.175,0.66-0.463,0.844l-11,7C24.874,27.947,24.687,28,24.5,28z M25.5,14.821v10.357L33.637,20L25.5,14.821z"/><path d="M28.5,35c-8.271,0-15-6.729-15-15s6.729-15,15-15s15,6.729,15,15S36.771,35,28.5,35z M28.5,7 c-7.168,0-13,5.832-13,13s5.832,13,13,13s13-5.832,13-13S35.668,7,28.5,7z"/>'
	}
	// clone some svg's into other types
	Object.assign(svg_large, {
		word: svg_large.text,
		vimeo: svg_large.video,
		youtube: svg_large.video
	});

	// return folder svg for SMALL + LARGE
	function folder_svg(clazz, is_link, is_readable){
		return `<svg viewBox="0 0 48 48" class="svg-folder ${ clazz }"><path class="svg-folder-bg" d="M40 12H22l-4-4H8c-2.2 0-4 1.8-4 4v8h40v-4c0-2.2-1.8-4-4-4z"/><path class="svg-folder-fg" d="M40 12H8c-2.2 0-4 1.8-4 4v20c0 2.2 1.8 4 4 4h32c2.2 0 4-1.8 4-4V16c0-2.2-1.8-4-4-4z"/>${ is_link ? '<path class="svg-folder-symlink" d="M 39.231 23.883 L 28.485 32.862 L 28.485 14.902 Z"/><path class="svg-folder-symlink" d="M 10.065 30.022 L 10.065 40 L 16.205 40 L 16.205 30.022 C 16.205 28.334 17.587 26.953 19.275 26.953 L 32.323 26.953 L 32.323 20.812 L 19.275 20.812 C 14.21 20.812 10.065 24.956 10.065 30.022 Z"/>' : '' }${ !is_readable ? '<path class="svg-folder-forbidden" d="M 34.441 26.211 C 34.441 31.711 29.941 36.211 24.441 36.211 C 18.941 36.211 14.441 31.711 14.441 26.211 C 14.441 20.711 18.941 16.211 24.441 16.211 C 29.941 16.211 34.441 20.711 34.441 26.211"/><path class="path-exclamation" d="M 22.941 19.211 L 25.941 19.211 L 25.941 28.211 L 22.941 28.211 Z M 22.941 19.211"/><path class="path-exclamation" d="M 22.941 30.211 L 25.941 30.211 L 25.941 33.211 L 22.941 33.211 Z M 22.941 30.211"/>' : '' }</svg>`;
	}

	// extensions for mapping / we use mime also
	var extensions = {
		application: ['app', 'exe'],
		archive: ['gz', 'zip', '7z', '7zip', 'arj', 'rar', 'gzip', 'bz2', 'bzip2', 'tar', 'x-gzip'],
		cd: ['dmg', 'iso', 'bin', 'cd', 'cdr', 'cue', 'disc', 'disk', 'dsk', 'dvd', 'dvdr', 'hdd', 'hdi', 'hds', 'hfs', 'hfv', 'ima', 'image', 'imd', 'img', 'mdf', 'mdx', 'nrg', 'omg', 'toast', 'cso', 'mds'],
		code: ['php', 'x-php', 'js', 'css', 'xml', 'json', 'html', 'htm', 'py', 'jsx', 'scss', 'clj', 'less', 'rb', 'sql', 'ts', 'yml', 'webmanifest'],
		excel: ['xls','xlt','xlm','xlsx','xlsm','xltx','xltm','xlsb','xla','xlam','xll','xlw','csv','numbers'],
		font: ['ttf', 'otf', 'woff', 'woff2', 'eot', 'ttc'],
		open_in_new: ['url'],
		image: ['wbmp', 'tiff', 'webp', 'psd', 'ai', 'eps', 'jpg', 'jpeg', 'webp', 'png', 'gif', 'bmp'],
		pdf: ['pdf'],
		powerpoint: ['ppt','pot','pps','pptx','pptm','potx','potm','ppam','ppsx','ppsm','sldx','sldm'],
		text: ['epub', 'rtf'],
		word: ['doc', 'dot', 'docx', 'docm', 'dotx', 'dotm', 'docb', 'odt', 'wbk']
	};

	// pre-create icon map key:val array
	var icon_map = {};
	looper(Object.keys(extensions), function(key){
		looper(extensions[key], function(ext){
			icon_map[ext] = key;
		});
	});

	//
	_f.get_type_color = (item) => {
		return '--type-color:var(--type-' + (_f.get_icon(item) || 'default') + ')';
	}

	// get icon name, with cache
	const get_icon = _f.get_icon = (item) => {

		// cached or from php?
		if(item.hasOwnProperty('icon')) return item.icon;

		// get name
		return item.icon = (() => {

			// icon by mime0
			if(item.mime0 && ['archive', 'audio', 'image', 'video'].includes(item.mime0)) return item.mime0;

			// icon by mime1 // x-gzip, html, pdf, php, x-php, rtf, zip, xml
			let mime1_icon = item.mime1 ? icon_map[item.mime1] : false;
			if(mime1_icon) return mime1_icon;

			// icon by extension
			let ext_icon = item.ext ? icon_map[item.ext] : false;
			if(ext_icon) return ext_icon;

			// text file text
			if(item.mime0 === 'text') return 'text';

			//
			return false;
		})();
	}


	_f.get_svg_icon_custom = (icon, d) => {
		return '<svg viewBox="0 0 24 24" class="svg-icon svg-' + icon + '"><path class="svg-path-' + icon + '" d="' + d + '" /></svg>';
	}

	// SMALL
	// strictly one icon
	_f.get_svg_icon = function(icon){
		return '<svg viewBox="0 0 24 24" class="svg-icon svg-' + icon + '"><path class="svg-path-' + icon + '" d="' + svg_small[icon] + '" /></svg>';
	}
	_f.get_svg_icon_class = (icon, clazz) => `<svg viewBox="0 0 24 24" class="${ clazz }"><path class="svg-path-${ icon }" d="${ svg_small[icon] }" /></svg>`;
	// multiple icon paths (layered icons)
	_f.get_svg_icon_multi = function(){
		var args = arguments, l = args.length, str = '';
		for (var i = 0; i < l; i++) str += '<path class="svg-path-' + args[i] + '" d="' + svg_small[args[i]] + '" />';
		return '<svg viewBox="0 0 24 24" class="svg-icon svg-' + args[0] + '">' + str + '</svg>';
	}
	_f.get_svg_icon_multi_class = function(clazz){
		var args = arguments, l = args.length, str = '';
		for (var i = 1; i < l; i++) str += '<path class="svg-path-' + args[i] + '" d="' + svg_small[args[i]] + '" />';
		return '<svg viewBox="0 0 24 24" class="' + clazz + '">' + str + '</svg>';
	}


	// folder_svg(clazz, is_link, is_readable)
	// _f.get_svg_icon_files is used by files, modal and contextmenu
	// ${ get_span(_f.get_svg_icon_files(item), 'icon') }

	_f.get_svg_icon_files_layout = (item) => {
		if(item.is_dir) return folder_svg('icon svg-icon', item.is_link, item.is_readable);
		let icon = item.is_pano ? 'panorama_variant' : (get_icon(item) || 'default');
		return `<svg viewBox="0 0 24 24" class="icon svg-icon svg-${ icon }"><path class="svg-path-${ icon }" d="${ svg_small[icon] }" /></svg>`;
	}


	// get icon by item property (for files, contextmenu, modal)
	_f.get_svg_icon_files = function(item){
		if(item.is_dir) return folder_svg('svg-icon', item.is_link, item.is_readable);
		// pano detect here, because get_icon() is for large also
		return _f.get_svg_icon(item.is_pano ? 'panorama_variant' : get_icon(item) || 'default');
	}

	// LARGE
	_f.get_svg_large = function(item, classs){

		// dir
		if(item.is_dir) return folder_svg('svg-folder-large ' + classs, item.is_link, item.is_readable);

		// get icon
		let icon = get_icon(item);

		// text from extension or image type
		let text = item.ext && item.ext.length < 9 ? item.ext : (icon === 'image' ? item.mime1 : false);

		// return
		return '<svg viewBox="0 0 56 56" class="svg-file svg-' + (icon || 'default') + (classs ? ' ' + classs : '') + '"><path class="svg-file-bg" d="M36.985,0H7.963C7.155,0,6.5,0.655,6.5,1.926V55c0,0.345,0.655,1,1.463,1h40.074 c0.808,0,1.463-0.655,1.463-1V12.978c0-0.696-0.093-0.92-0.257-1.085L37.607,0.257C37.442,0.093,37.218,0,36.985,0z"/>' + (icon ? '<g class="svg-file-icon"' + (!text ? ' style="transform: translateY(6.5px)"' : '') + '>' + svg_large[icon] + '</g>' : '') + '<polygon  class="svg-file-flip" points="37.5,0.151 37.5,12 49.349,12"/>' + (text ? '<path class="svg-file-text-bg" d="M48.037,56H7.963C7.155,56,6.5,55.345,6.5,54.537V39h43v15.537C49.5,55.345,48.845,56,48.037,56z"/><g><text class="svg-file-ext"' + (text.length > 5 ? ' style="font-size:' + (15 - text.length) + 'px"' : '') + ' x="28" y="48.5">' + text + '</text></g>' : '') + (!item.is_readable ? '<path class="svg-file-forbidden" d="M 40.691 24.958 C 40.691 31.936 34.982 37.645 28.003 37.645 C 21.026 37.645 15.317 31.936 15.317 24.958 C 15.317 17.98 21.026 12.271 28.003 12.271 C 34.982 12.271 40.691 17.98 40.691 24.958"/><path class="path-exclamation" d="M 26.101 16.077 L 29.907 16.077 L 29.907 27.495 L 26.101 27.495 Z M 26.101 16.077"/><path class="path-exclamation" d="M 26.101 30.033 L 29.907 30.033 L 29.907 33.839 L 26.101 33.839 Z M 26.101 30.033"/>' : '') + '</svg>';
	}
}());


/*
ICON RULES
18 / 24 / 36 / 48 best sizes
20px / 40px click area mouse
24px / 48px click area mobile
87% active / 54% inactive / 38% disabled OPACITY
100% active / 70% inactive / 50% disabled OPACITY[DARK]
#344955
#232F34
#4A6572
#F9AA33
*/

// MATERIAL
// https://material.io/design/material-studies/#usage
// https://material.io/collections/developer-tutorials/#web
// https://material.io/design/material-studies/reply.html#components
// https://material.io/develop/web/docs/getting-started/
// https://storage.googleapis.com/spec-host-backup/mio-design%2Fassets%2F1TeQ0O5CvwY52_xe4UTvJG_fqFfBR2F7d%2Fcolor-applyingcolorui-bars-differentiating-reply.png
// https://material.io/design/color/the-color-system.html#tools-for-picking-colors


/*<svg style="width:24px;height:24px" viewBox="0 0 24 24">
    <path fill="#000000" d="M16,9H13V14.5A2.5,2.5 0 0,1 10.5,17A2.5,2.5 0 0,1 8,14.5A2.5,2.5 0 0,1 10.5,12C11.07,12 11.58,12.19 12,12.5V7H16M19,3H5A2,2 0 0,0 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5A2,2 0 0,0 19,3Z" />
</svg>
<svg aria-hidden="true" focusable="false" width="1em" height="1em" style="-ms-transform: rotate(360deg); -webkit-transform: rotate(360deg); transform: rotate(360deg);" preserveAspectRatio="xMidYMid meet" viewBox="0 0 24 24"><path d="M10 3.998H4c-1.106 0-1.99.896-1.99 2l-.01 12a2 2 0 0 0 2 2h16c1.103 0 2-.896 2-2v-10c0-1.104-.897-2-2-2h-8l-2-2z" fill="#626262"/></svg>
*/


// breadcrumbs.js

//
(() => {

	// 8 Images · 850.75 KB
	// 31 Files · 9.83 MB

	// global elements
	_e.topbar_breadcrumbs = _id('topbar-breadcrumbs');
	_e.breadcrumbs_info = _e.topbar_breadcrumbs.firstElementChild;

	// folder actions contextmenu
	const folder_actions = (() => {
		_e.topbar_breadcrumbs.insertAdjacentHTML('afterbegin', '<button id="folder-actions" class="button-icon" style="display:none">' + _f.get_svg_icon('folder_cog_outline') + '</button>');
		var button = _e.topbar_breadcrumbs.firstElementChild;
		_event(button, (e) => _f.create_contextmenu(e, 'topbar', button, _c.current_dir));
		return button;
	})();

	// breadcrumbs info / must be set AFTER dir is loaded
	_f.breadcrumbs_info = function(){

		// vars
		var dir = _c.current_dir,
				count = _c.files_count, // all items (files + dirs)
				type = (function(){
					if(count && dir.images_count === count) return 'images'; // only images
					if(count && !dir.files_count) return 'folders'; // only folders
					return 'files'; // mixed files
				})();

		// html
		_e.breadcrumbs_info.innerHTML = count + ' <span data-lang="' + type + '" class="breadcrumbs-info-type">' + lang.get(type) + '</span>' + (dir.dirsize ? '<span class="breadcrumbs-info-size">' + filesize(dir.dirsize) + '</span>' : '');

		// display breadcrumbs_info && folder_actions / + animation opacity forwards css
		toggle_hidden(_e.breadcrumbs_info);
		toggle_hidden(folder_actions);
	};

	// get crumb / now we link to folder in app so don't need to get url_path for folder
	function get_crumb(path, html){
		return '<span class="crumb"><a href="' + get_app_link(path) + '" data-path="' + html_quotes(path) + '" class="crumb-link">' + html + '</a></span>';
	}

	// vars
	_e.breadcrumbs = _id('breadcrumbs');
	var current_crumbs = [],
			last_crumbs = [];

	// set root home link
	_e.breadcrumbs.innerHTML = get_crumb('', _f.get_svg_icon('home'));

	// crumbs anime
	function crumbs_anime(crumbs, out){
		var ob = {
		  targets: crumbs,
		  translateX: out ? [0, -2] : [-2, 0],
		  opacity: out ? [1, 0] : [0, 1],
		  easing: 'easeOutQuad',
		  duration: 150,
		  delay: anime.stagger(Math.round(100/crumbs.length))
		}
		if(out) ob.complete = function(){
			remove_elements(crumbs, _e.breadcrumbs);
			crumbs_in();
		};
		anime(ob);
	}
	// crumbs in
	function crumbs_in(){

		// vars
		var crumbs_path = '',
				add = [],
				html = '';

		// loop
		if(current_crumbs.length) looper(current_crumbs, function(crumb, i){
			crumbs_path += crumbs_path ? '/' + crumb : crumb;
			if(add.length || crumb !== last_crumbs[i]){
				html += get_crumb(crumbs_path, html_tags(crumb));
				add.push(i + 1);
			}
		});

		// add!
		if(add.length) {

			// insert new adjacent html
			_e.breadcrumbs.insertAdjacentHTML('beforeend', html);

			// animate crumbs
			crumbs_anime(arr_looper(add, function(i){
				return _e.breadcrumbs.children[i];
			}));
		}

		// set last crumbs
		last_crumbs = current_crumbs.slice(0);

		// active
		if(_e.breadcrumbs.lastChild != _e.breadcrumbs.firstChild) _e.breadcrumbs.lastChild.classList.add('crumb-active');
	}

	// set breadcrumbs / can be set before dir is loaded
	_f.set_breadcrumbs = function(path){

		// hide folder_actions && breadcrumbs_info
		toggle_hidden(folder_actions, true);
		toggle_hidden(_e.breadcrumbs_info, true);

		// set current crumbs
		current_crumbs = path.split('/').filter(Boolean);

		// remove crumbs
		if(last_crumbs.length){
			var remove = [];
			looper(last_crumbs, function(crumb, i){
				if(remove.length || crumb !== current_crumbs[i]) remove.unshift(_e.breadcrumbs.children[i + 1]);
			});
			if(remove.length) {
				crumbs_anime(remove, true);
			} else {
				_e.breadcrumbs.lastChild.classList.remove('crumb-active');
				crumbs_in();
			}
		} else {
			crumbs_in();
		}
	}

	// click
	_event(_e.breadcrumbs, function(e){
		if(e.target.nodeName !== 'A' || allow_href(e, e.target)) return;
		//if(_e.breadcrumbs.lastChild === e.target.parentNode) _f.open_modal(_c.current_dir, true);
		_f.get_files(e.target.dataset.path, 'push');
	});

})();


// contextmenu.js

/*
THEN
! IN WEB ROOT
- zoom, new window, clipboard, download - PROXY.php
- submenu https://vsn4ik.github.io/bootstrap-submenu/

MORE context ITEMS
- share
- email link (share?)
- favorites
- image editor
- file actions: remove, copy, rename, move to
*/

// prevent right click
if(_c.prevent_right_click) {
	_event(document, function(e){
		if(e.target.nodeName === 'IMG' || e.target.nodeName === 'VIDEO' || e.target.closest('.menu-li') || e.target.closest('.files-a')) e.preventDefault();
	}, 'contextmenu');
	document.documentElement.style.setProperty('--touch-callout', 'none');
}

//
(function () {

	// custom contextmenu object
	var custom = _c.config.contextmenu || {};

	// vars
	var cm = _o.contextmenu = {};
	var cm_el = _e.contextmenu = _id('contextmenu');

	// get dropdown button
  function get_dropdown_button(text, icon, action, cond, clazz, href, item){
		let tag = href ? 'a' : 'button';
		return cond ? `<${ tag }${ href ? ' href="' + (typeof href === 'function' ? href(item) : href) + '" target="_blank"' : '' } class="dropdown-item${ clazz ? ' ' + clazz : '' }" data-action="${ action }">${ icon ? (icon.startsWith('M') ? _f.get_svg_icon_custom(action, icon) : _f.get_svg_icon(icon)) : '' }${ lang.span(text, true) }</${ tag }>` : '';
  }

	// set progress for loader toast
	function set_progress(t, percent){
		t.counter.textContent = Math.round(percent * 100) + '%';
		t.progress_bar.style.setProperty('transform', 'scaleX(' + percent + ')');
	}

	// get_downloadables for download_dir 'browser' (zip) and 'files' (multi)
	function get_downloadables(item){
		return (download_config.use_filter && _c.current_dir === item ? _o.list.matchingItems.map(ob => ob._values) : object_values(item.files || (_c.dirs[item.path] || {}).files || {})).filter(file => !file.is_dir && file.is_readable);
	}

  // download_config / might need to move this
  var download_config = Object.assign({
  	javascript: true, // false only applies for server 'zip' download
  	current_dir_only: true, // false only works for dirs that have already files{} object
		use_filter: true, // only works for 'browser' and 'files'
  }, _c.config && _c.config.download_dir ? _c.config.download_dir : {});

  // get_download_dir_button
  function get_download_dir_button(item){

  	// exit 1
  	if(!tests.download || !['browser', 'zip', 'files'].includes(_c.download_dir) || !item.is_dir || !item.is_readable) return '';

  	// dir is item if files_count (stored in dir props) / current=always, layout=no, menu=ifalreadyloaded
  	var dir = item.hasOwnProperty('files_count') ? item : _c.dirs[item.path];

  	// exit 2
  	if(!dir ||
  		// only current_dir
  		(download_config.current_dir_only && dir !== _c.current_dir) ||
			// for options 'browser' and 'files' we need files_count up front (files_count doesn't exist or is 0 = exit)
			['browser', 'files'].includes(_c.download_dir) && !dir.files_count ||
  		// if 'files' method, must be tests.is_pointer (does not work on mobile)
  		(_c.download_dir === 'files' && !tests.is_pointer) ||
  		// if dir.files_count (already loaded), it must not be empty (if not yet loaded, there could be files for 'zip')
  		(dir.hasOwnProperty('files_count') && !dir.files_count)) return '';

  	// direct zip
  	if(_c.download_dir === 'zip' && !download_config.javascript) return '<a href="' + get_download_dir_zip_link(dir) + '" class="dropdown-item" data-action="download_dir" download="' + (is_licensed ? html_quotes(item.basename) + '.zip' : '') + '">' + _f.get_svg_icon('tray_arrow_down') + lang.span('download', true) + '&nbsp;<span class="no-pointer">Zip</span></a>';

  	// javascript download / files || zip || multi
  	return '<button class="dropdown-item" data-action="download_dir">' + _f.get_svg_icon('tray_arrow_down') + lang.span('download', true) + '&nbsp;<span class="no-pointer">' + (_c.download_dir === 'files' ? lang.get('files') : 'zip') + '</span></button>';
  }

  // create contextmenu
  // event, type, element, item, a (only if parent needs class)
  _f.create_contextmenu = (e, type, el, item, a) => {

  	// die! (just in case) / allow topbar if !_c.context_menu
		if((!_c.context_menu && type !== 'topbar') || !el || !item) return;

		// is open
		if(cm.is_open) {
			// close contextmenu if click on same element (clicks on document)
			if(el == cm.el) return e.preventDefault();
			// remove cm-active from previous elements (because contextmenu is open)
			if(cm.el) cm.el.classList.remove('cm-active');
			if(cm.a) cm.a.classList.remove('cm-active');
		}

		// block propagation to document contextmenu, which closes contextmenu
		e.stopPropagation();

		// re-create contextmenu html if new element || new item || sidebar (because download.zip availability changes)
	  if(el !== cm.el || item !== cm.item || type === 'sidebar') cm_el.innerHTML = `<span class="dropdown-header" title="${ html_quotes(item.display_name || item.basename) }">${ _f.get_svg_icon_files(item) }<span class="dropdown-header-text">${ html_tags(item.display_name || item.basename) }</span></span>` +

	  	// photoswipe zoom
	  	get_dropdown_button('zoom', 'magnify_plus', 'popup', type !== 'popup' && item.browser_image && item.is_readable) +

	  	// open dir // we don't need this for mainmenu || current_dir
	  	get_dropdown_button('open', 'folder_open', 'folder', type !== 'sidebar' && item.is_dir && item !== _c.current_dir) +

	  	// modal
	  	get_dropdown_button('show info', 'info', 'modal', !['modal', 'popup'].includes(type)) +

	  	// new window
	  	open_link(item, 'dropdown-item') +

	  	// clipboard copy link
	  	get_dropdown_button('copy link', 'content_copy', 'clipboard', tests.url && tests.clipboard) +

	  	// download file
	  	get_download_link(item, 'dropdown-item') +

	  	// google maps
	  	get_map_link.a(item.gps, 'dropdown-item', true) +

	  	// download dir
	  	get_download_dir_button(item) +

			// print / DISABLED for now
			// get_dropdown_button('print', null, 'print', item.browser_image && item.is_readable) +

	  	// file action buttons / only allow if !popup and item.is_writeable and is_licensed
	  	(() => {
	  		if(type === 'popup' || !item.is_writeable || !is_licensed) return '';
	  		let html = get_dropdown_button('delete', 'delete_outline', 'delete', _c.allow_delete && item.path) +
			  	get_dropdown_button('new folder', 'plus', 'new_folder', _c.allow_new_folder && item.is_dir) +
			  	get_dropdown_button('new file', 'plus', 'new_file', _c.allow_new_file && item.is_dir) +
			  	get_dropdown_button('rename', 'pencil_outline', 'rename', _c.allow_rename && item.path) +
			  	get_dropdown_button('duplicate', 'plus_circle_multiple_outline', 'duplicate', _c.allow_duplicate && !item.is_dir) +
			  	get_dropdown_button('upload', 'tray_arrow_up', 'upload', _o.uppy && item.is_dir);
			  return html ? '<hr class="dropdown-separator">' + html : '';
	  	})() +

			// custom actions
			str_looper(Object.keys(custom), (key) => {
				var b = custom[key];
				// text, icon, action(key), cond, class, href (overrides button action), item (for href(item))
				return get_dropdown_button(b.text || key, b.icon, key, b.condition ? b.condition(item) : true, b.class, b.href, item);
			});
			// END cm_el.innerHTML

		//
		cm_el.style.setProperty('--type-color', 'var(--type-' + (_f.get_icon(item) || 'default') + ')');

	  // display so we can get height
	  cm_el.style.display = 'block';

	  // get element rect
	  let rect = el.getBoundingClientRect();

	  // y
	  let top_target = (el.clientHeight > 50 ? e.clientY : rect.top) - cm_el.clientHeight - 10,
	  		bottom_target = (el.clientHeight > 50 ? e.clientY + 20 : rect.bottom + 10),
				is_bottom_target = bottom_target + cm_el.clientHeight <= document.documentElement.clientHeight;
	  cm_el.style.top = Math.round(is_bottom_target ? bottom_target : Math.max(0, top_target)) + 'px';

	  // x
	  let x_click = el.clientWidth > 100/*500*/ /*|| type === 'sidebar'*/ ? e.clientX : rect.left + el.offsetWidth/2,
	  		left_target = x_click - cm_el.clientWidth/2,
	  		left_pos = Math.max(10, Math.min(document.documentElement.clientWidth - cm_el.clientWidth - 10, left_target));
	  cm_el.style.left = Math.round(left_pos) + 'px';
	  cm_el.style.setProperty('--nub-left', Math.round(Math.max(10, Math.min(cm_el.clientWidth - 10, cm_el.clientWidth / 2 - left_pos + left_target))) + 'px');

		// add cm-type and nub-bottom if !is_bottom_target
		set_classname(cm_el, `dropdown-menu${ is_bottom_target ? '' : ' nub-bottom'} cm-${ type }`);

	  // store props for global usage
	  cm.el = el; // for toggling class, and comparing with previous el
	  cm.item = item; // store item for usage in context button actions
		cm.a = a || false; // parent element for class styling

	  // toggle visible
	  toggle(true);

		// focus parent so that buttons can be focused by keyboard
		// kinda sucks because keyboard ENTER can't toggle open/close, but better to allow access by keyboard tabs after open
		cm_el.focus();

	  // prevent default
		e.preventDefault();
  };

	// hide if is_open
	function hide(){
		if(cm.is_open) toggle();
	}

	// toggle
	function toggle(show){

		// event listeners for close
		if(show != cm.is_open) {
			var method = (show ? 'add' : 'remove') + 'EventListener';
			// close contextmenu events
			document.documentElement[method]('click', hide);
			document[method]('contextmenu', hide);
			document[method]('visibilitychange', hide);
			window[method]('blur', hide);
			window[method]('scroll', hide);
			if(_o.popup && _o.popup.topbar) _o.popup.topbar[method]('click', hide); // fix for popup topbar buttons to close
			if(_e.sidebar_menu) _e.sidebar_menu[method]('scroll', hide);
		}

		// el toggle cm-active
		cm.el.classList.toggle('cm-active', show);
		if(cm.a) cm.a.classList.toggle('cm-active', show);

		// no anim if already open
		if(show != cm.is_open){
			anime.remove(cm_el);
		  anime({
				targets: cm_el,
			  opacity: show ? [0, 1] : 0,
			  easing: 'easeOutQuart', //'easeOutCubic', // 'easeOutQuint'
			  duration: 150,//show ? 200 : 100,
			  complete: show ? null : function(){
					cm_el.style.cssText = null;
				}
			});
		}

	  // toggle is_open
		cm.is_open = !!show;
	}

	// context menu actions
	actions(cm_el, (action, e) => {

		// custom actiions from _c.config.contextmenu
		if(custom[action]){
			// if HREF, do nothing, else if action, do action.
			if(!custom[action].href && custom[action].action) custom[action].action(cm.item);

		// filemanager action
		} else if(_fm[action]){
			_fm[action](cm.item);

		// upload
		} else if(action === 'upload'){
			_o.uppy.setMeta({ path: cm.item.path }); // set path
			_o.uppy.getPlugin('Dashboard').openModal();

		// zoom
		} else if(action === 'popup'){
			_f.open_popup(cm.item);

		// open folder
		} else if(action === 'folder'){
			_f.close_modal(false); // close modal without history() (important) because is loading new page
			_f.get_files(cm.item.path, 'push');

		// open modal
		} else if(action === 'modal'){
			_f.open_modal(cm.item, true);

		// copy path to clipboard
		} else if(action === 'clipboard'){
			// copy_url(get_href(cm.item)); // app-link for dirs, direct link for files
			_toast.toggle(copy_url(get_href(cm.item)), lang.get('copy link')); // app-link for dirs, direct link for files

		// print / DISABLED for now
		/*} else if(action === 'print'){

			// inject temporary iframe
			var toast_loader = _toast.loader('print');
			document.body.insertAdjacentHTML('beforeend', '<iframe style="height:0;width:0;visibility:hidden;position:absolute;" srcdoc="' + html_quotes('<html><body style="margin:0;"><img style="display:block;margin:0 auto;max-width:100%;page-break-inside:avoid;max-height:100vh;width:auto;"/></body></html>') + '"></iframe>');

			// get iframe
			var iframe = document.body.lastElementChild;
			iframe.addEventListener('load', () => {
				var img = iframe.contentDocument.body.firstElementChild;
				img.addEventListener('load', () => {
					toast_loader.hideToast(); // always hide the toast_loader for this instance
					iframe.contentWindow.addEventListener('afterprint', () => iframe.remove());
					iframe.contentWindow.print();
				});
				img.src = cm.item.url_path;
			});*/

		// download dir
		} else if(action === 'download_dir'){

			// <a> direct !javascript zip click / return default click
			if(is_licensed && _c.download_dir === 'zip' && !download_config.javascript) return;

			// always preventDefault click beyond this point (although most likely not needed on <button>)
			e.preventDefault();

			// block click if !is_licensed
			if(!is_licensed) return _toast.license();

			// Default download files as zip directly from browser, downloads from filter
			if(_c.download_dir === 'browser'){

				// get downloadables[] array of file item objects / return if !files
				var downloadables = get_downloadables(cm.item);
				// die if !downloadables / should be disabled from interface, but JIC just in case
				if(!downloadables.length) return _toast.toggle(false, 'No files to download!');

				// load_total for progress needs to be calculated separate from item.dirsize since some files might not be downloadable
				var load_total = 0;
				downloadables.forEach((file) => load_total += file.filesize);

				// zipname is dirname / used for toast, folder inside zip, and zipname.zip / basename should probably always exist, but JIC
				var zipname = cm.item.basename || cm.item.path.split('/').pop() || lang.get('download');

				// new toastify loader with progress / true
				var toast_loader = _toast.progress(zipname + '.zip'), // returns object with {toast, counter, progress_bar}
						zip = new JSZip(), // new JSZip
						// folder = zip.folder(zipname), // create root folder that matches zip filename / creates double-zip on Windows
						loading = [], // loading array for progress
						loading_ref, // loading_ref for onprogress event
						completed = 0, // completed count, includes errors
						added = 0; // added to zip count, so we know at least one file is added

				// loop downloadables_keys
				downloadables.forEach((file, index) => {
					var xhr = new XMLHttpRequest();
					xhr.responseType = 'arraybuffer'; // jszip blob
					xhr.onreadystatechange = (e) => {
						if(xhr.readyState !== XMLHttpRequest.DONE) return; // only readyState DONE(4)

						// add to zip if status >= 200 && status < 400 and response
						if(xhr.status >= 200 && xhr.status < 400 && xhr.response && zip.file(file.basename, xhr.response, { binary:true })) added ++;

						// reset loading_ref if loading_ref is this, forces change to a new ref
						if(loading_ref === file) loading_ref = false;

						// always set loading filesize complete, in case of errors it should count as loaded in progress bar
						loading[index] = file.filesize;

						// check if downloads are complete / Even if errors, because we need to know when entire process is finished.
						completed ++;
						if(completed < downloadables.length) return;

						// fail if no files have been added / JIC just in case, perhaps files are blocked by server
						if(!added) {
							toast_loader.toast.hideToast(); // hide toast
							return _toast.toggle(false, 'Failed to download files!');
						}

						// serve the zip
						zip.generateAsync({type: 'blob'}).then((blob) => {
							toast_loader.toast.hideToast(); // hide toast after process is complete
							saveAs(blob, zipname + '.zip');
						}, (e) => { // some zip error
							toast_loader.toast.hideToast(); // hide toast
							_toast.toggle(false, e.message || 'Error');
						});
					};
					//xhr.onloadstart = (e) => {}
					xhr.onprogress = (e) => {
						loading[index] = e.loaded || 0; // set loaded bytes at array index
						if(!loading_ref) loading_ref = file; // use this as loading_ref if !loading_ref
						if(loading_ref !== file) return; // only use one loading_ref for progress bar
						var total = 0;
						loading.forEach((fs) => total += fs);
						set_progress(toast_loader, total / load_total);
					};
					//xhr.onloadend = (e) => {}
					xhr.open('GET', file_path(file, true), true);
					xhr.send();
				});

			// javascript download dir as zip from server
			}	else if(_c.download_dir === 'zip'){

				// zipname is dirname / used for toast and filename / basename should probably always exist, but just in case
				var zipname = cm.item.basename || cm.item.path.split('/').pop() || lang.get('download'),
						toast_loader = _toast.progress(zipname + '.zip'); // returns object with {toast, counter, progress_bar}

				// use jsFileDownloader to download so we can show progress
				new jsFileDownloader({
					url: get_download_dir_zip_link(cm.item),
					timeout: 600000, // 10min / 40000 / 40s default
					process: (e) => {
						if(e.lengthComputable) set_progress(toast_loader, e.loaded / e.total);
					},
					filename: zipname + '.zip',
					forceDesktopMode: true, // so it works on mobile. I don't see why this is not default
					nativeFallbackOnError: true, // so that it opens new tab on fail ... just in case for older browsers
					contentTypeDetermination: 'header' // should definitely be application/zip from server

				// then
				}).then(() => {
					toast_loader.toast.hideToast(); // hide toast

				// on error, assume there are no files to zip (or ZipArchive error), only applies if !current_dir_only
				}).catch((err) => {
					_log('Download error', err);
					toast_loader.toast.hideToast(); // hide toast
					_toast.toggle(false, 'No files to zip');
				});

			// javascript multi file download / only works in desktop browsers / only works if dir has files (usually current_dir_only)
			} else if(_c.download_dir === 'files'){

				// get downloadables[] array of file item objects / return if !files
				var downloadables = get_downloadables(cm.item);
				// die if !downloadables / should be disabled from interface, but JIC just in case / could be inaccessible files
				if(!downloadables.length) return _toast.toggle(false, 'No files to download!');

				// javascript down file loop
				function down_file(i){
					new jsFileDownloader({ url: file_path(downloadables[i], true) }).then(() => {
						if(i < downloadables.length - 1) down_file(i + 1);
					});
				}

				// download first file in array
				down_file(0);
			}
		}
	});
}());


// topbar dropdowns
// files.dropdown.js

_o.dropdown = {};

/*
USED in topbar
files.layout.js
files.sort.js
files.update.js
files.lang.js
*/

//
(() => {

	// scope vars
	const dropdowns = [], // create a list of dropdowns, used for display/align with _f.topbar_dropdowns_init()
				blur_event = tests.pointer_events ? 'pointerdown' : (tests.only_touch ? 'touchstart' : 'mousedown'),
				toggle_open_event = tests.pointer_events ? 'pointerup' : 'click'

	// toggle_open blur event listener ref
	let listener;

	// Need the hack below to allow touch hover effects, and dropdown bugs when using pointer events to open
	// https://stackoverflow.com/a/23012580/3040364
	if(tests.is_touch) document.addEventListener('touchstart', function(){}, true);

	// toggle_open
	function toggle_open(el){
		if(el.classList.contains('touch-open')){
			if(listener) listener.remove();
		} else {
			listener = _event_listener(document, blur_event, function(e){
				if(e.target.closest('.dropdown') === el) return;
				listener.remove();
				el.classList.remove('touch-open');

				// temporarily block click on files / should really only happen on touch
				_e.files.style.pointerEvents = 'none';
				wait(500).then(() => _e.files.style.pointerEvents = null);
			});
		}
		el.classList.toggle('touch-open');
	}

	// display and align offset 10px from right edge if menu exceeds screen right
	// this kinda sucks, but best way to align dropdowns properly on mobile / prefer center, but then align 10px from right
	// triggers on _f.dropdown() create and _f.topbar_dropdowns_init() loop from init.js
	const dropdown_offset = (dropdown_menu) => {
		dropdown_menu.style.display = 'block';
		let rect = dropdown_menu.getBoundingClientRect();
		let diff = window.innerWidth - (rect.x + rect.width);
		if(diff < 10) dropdown_menu.style.setProperty('--offset', (diff - 10) + 'px');
	}

	// triggered from init.js / position all after page and topbar is displaying
  _f.topbar_dropdowns_init = () => dropdowns.forEach((el) => dropdown_offset(el.lastElementChild));

	// _f.dropdown / triggered from various topbar dropdown features
	_f.dropdown = function(el, button, func){

		// store dropdown parent elements (used in _f.topbar_dropdowns_init() triggered from init.js)
		dropdowns.push(el);

		// in case topbar is already visible (for example update-bell icon), attempt to display and offset
		if(el.offsetParent) dropdown_offset(el.lastElementChild);

		// only pointer / click triggers function
		if(tests.only_pointer){
			if(func) _event(button, func);

		// only touch or !pointerEvents / click triggers toggle_open();
		} else if(tests.only_touch || !tests.pointer_events){
			_event(button, function(){
				toggle_open(el);
			}, toggle_open_event);

		// dual-input + pointerEvents / action depends on pointer type
		} else {

			// detect pointer type
			_event(button, function(e){

				// mouse, trigger function
				if(e.pointerType === 'mouse') {
					if(func) func();

				// non-mouse, open toggle
				} else {
					toggle_open(el);
				}
			}, 'pointerup'); // must be pointerup to detect pointerType
		}

		// dual input
		if(tests.is_dual_input) {

			// toggle .mouse-hover class on pointerover (if pointerEvents)
			if(tests.pointer_events) _event(button, function(e){
				el.classList.toggle('mouse-hover', e.pointerType === 'mouse');
			}, 'pointerover');

		// only mouse, add mouse-hover persistent
		} else if(tests.is_pointer){
			el.classList.add('mouse-hover');
		}
	}

})();


// files.embed.js
// get preview images and embed source and assign properties for embedding Youtube and Vimeo

/*
Youtube
https://www.youtube.com/watch?v=8jT9ygmMvMg
https://www.youtube.com/embed/8jT9ygmMvMg
https://img.youtube.com/vi/8jT9ygmMvMg/hq720.jpg
https://developers.google.com/youtube/player_parameters

Vimeo
https://vimeo.com/815583669
https://player.vimeo.com/video/815583669
https://vumbnail.com/815583669.jpg
https://help.vimeo.com/hc/en-us/articles/12426260232977-Player-parameters-overview
*/

//
const get_embed = (() => {

  // embed options
  const options = Object.assign({
    enabled: true, // disable entirely / doesn't check, and doesn't assign icon/color / works like normal .url file
    youtube: true, // Youtube preview/modal enabled / still shows icon/color if disabled
    vimeo: true, // Vimeo preview/modal enabled / still shows icon/color if disabled
    vumbnail: true, // we don't document this, but it allows us to disable Vimeo vumbnail while keeping preview for Youtube
    preview: true, // attempt to load preview image from service
    modal: true, // display in files modal / opens in normal link if disabled
    params: 'autoplay=1&modestbranding=1', // add optional parameters to the embeded player
  }, _c.config ? _c.config.embed || {} : {});

  // get embed preview image
  const get_embed_img = (item) => {
    return `${ _f.get_svg_icon_class('play', 'svg-icon svg-overlay-play svg-overlay-play-embed') }<img class="files-img files-img-placeholder files-lazy" data-src="${ item.embed_img }" width="${ item.preview_dimensions[0] }" height="${ item.preview_dimensions[1] }">`;
  }

  // return get_embed() function
  return (item) => {

    // die!
    if(!options.enabled) return;

    // cache / not really required with _c.current_dir.html, but just in case we empty html cache
    // if item.embed_img exists, return it, and item.embed must have been created also (if options.modal enabled)
    if(item.embed_img) return get_embed_img(item);
    // preview was disabled but item.embed might still exist, simply return
    if(item.embed) return;

    // shortcut
    let u = item.url;

    // get type 'youtube' or 'vimeo' or undefined
    const type = /(\.|\/)youtu(\.be|be\.com)\//.test(u) ? 'youtube' : (/(\.|\/)vimeo\.com\//.test(u) ? 'vimeo' : false);
    // die if not found
    if(!type) return;

    // assign youtube/vimeo icon instead or "url" shortcut icon for modal / even if type disabled or !match
    // also used for --type-color: --type-{vimeo/youtube} (icon, border etc)
    item.icon = type;
    // make display name same as basename / extension is always ".url", remove four last chars
    item.display_name = item.basename.slice(0, -4);

    // die if type disabled (after icon and color assigned, which should always be ok)
    if(!options[type]) return;

    // get ID match
    // old youtube, didn't work with youtu.be / /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/
    // https://stackoverflow.com/questions/3452546/how-do-i-get-the-youtube-video-id-from-a-url
    const match = u.match(type === 'youtube' ? /^.*(?:(?:youtu\.be\/|v\/|vi\/|u\/\w\/|embed\/|shorts\/)|(?:(?:watch)?\?v(?:i)?=|\&v(?:i)?=))([^#\&\?]*).*/ : /vimeo.*\/(\d+)/);
    // die if not found
    if(!match) return;

    // get ID
    const id = match[1];//match[(type === 'youtube' ? 7 : 1)];
    // die if ID not found (Youtube should actually be exactly 11 and Vimeo is now 9)
    if(!id || id.length < 6) return;

    // display embed in files modal / if disabled, will open normal link on click
    if(options.modal) {

      // assign embed src
      item.embed = `https://${ type === 'youtube' ? 'www.youtube.com/embed/' : 'player.vimeo.com/video/' }${ id }`;

      // params / merge options.params with existing params / remove empty / join to singe arrray
      let params = (options.params || '').split('&').concat((u.split('?')[1] || '').split('&')).filter(Boolean).join('&');
      // append params if params
      if(params) item.embed += '?' + params;
    }

    // preview / load preview image for Youtube and Vimeo
    if(options.preview) {

      // disable if vumbnail disabled / in case it breaks or someone doesn't like loading from 3rd party resource
      if(type === 'vimeo' && !options.vumbnail) return;

      // preview image size
      // youtube, use mqdefault.jpg [320 x 180] / very small, but 1.333 ratio / higher res is 1.33, which kinda sucks, and even higher res versions may or may not exist / read more https://stackoverflow.com/questions/2068344/how-do-i-get-a-youtube-video-thumbnail-from-the-youtube-api
      // vimeo / [640 x 360] from https://vumbnail.com / https://vumbnail.com/815583669.jpg
      item.preview_dimensions = type === 'youtube' ? [1280, 720] : [640, 360];
      item.preview_ratio = item.preview_dimensions[0] / item.preview_dimensions[1];

      // get img src
      // youtube use img.youtube.com or i3.ytimg.com, doesn't matter
      //item.embed_img = `https://${ type === 'youtube' ? `img.youtube.com/vi/${ id }/mqdefault` : `vumbnail.com/${ id }` }.jpg`;
      // https://vumbnail.com/ for Vimeo
      item.embed_img = `https://${ type === 'youtube' ? `img.youtube.com/vi/${ id }/hq720` : `vumbnail.com/${ id }` }.jpg`;

      // return play overlay icon and <img>
      //return `${ _f.get_svg_icon_class('play', 'svg-icon svg-overlay-play svg-overlay-play-embed') }<img class="files-img files-img-placeholder files-lazy" data-src="${ img }" width="${item.preview_dimensions[0]}" height="${item.preview_dimensions[1]}">`;
      return get_embed_img(item);
    }
  }
})();


// files.filemanager.js

/* TODO
- FUTURE
	- filemanager: move, copy
	- SECURITY
		- .htaccess / .php
	- fukin text_edit function (modal.js) surely should be here with shared functions
*/

// _fm / filemanager functions
var _fm = (() => {

	// run_task for all FM options
	function run_task(task, item, params, item_name, complete){

		// task must be available (obviously) / just in case
    if(!_fm[task]) return _toast.toggle(false, task + ' is not available.');
    // task must be allowed / should not be accessible, but just in case / todo: assign for upload and text_edit
    if(!_c['allow_' + task]) return _toast.toggle(false, task + ' is not allowed.');
		// demo_mode
    if(_c.demo_mode) return _toast.demo();
		// license required
    if(!is_licensed) return _toast.license();
		// writeable required for delete, rename, new_folder, new_file (not required for operations on parent)
    if(!item.is_writeable && ['delete', 'rename', 'new_folder', 'new_file'].includes(task)) return _toast.toggle(false, item.basename + ' is not writeable.');

		// elements / either files_el or menu_el (or both)
		var list_item = _c.files[item.basename] ? _o.list.get('path', item.path)[0] : false,
				// files_el / item is found in current list
				files_el = list_item ? action_processing(list_item.elm) : false,
				// menu element / is_dir and menu_enabled / _e.sidebar_menu if path === '' (no processing class)
				menu_el = item.is_dir && _e.sidebar_menu ? (item.path === '' ? _e.sidebar_menu : action_processing(_query('[data-path="' + css_escape(item.path) + '"]', _e.sidebar_menu))) : false,
				// prepare parent_dir{} / same as _current_dir if files_el / else lookup parent dir
				parent_dir = files_el ? _c.current_dir : _c.dirs[item.path.substring(0, item.path.lastIndexOf('/'))];

    // prepare toast text and start toast_loader
    var toast_text = lang.get(task.replace('_', ' ')) + ' ' + (item_name || item.basename || item.path),
        toast_loader = _toast.loader(toast_text);

		// xhr
		var xhr = ajax_get({
	  	params: 'action=fm&task=' + task + (item.is_dir ? '&is_dir=1' : '') + '&path=' + encodeURIComponent(item.path) + (params || ''),
	  	json_response: true,
      // fail triggers on server errors 400, 401, 403, 404 and 500 / extract error code and display
      fail: () => _toast.toggle(false, ((xhr.status||'') + ' ' + (xhr.statusText||'')).trim() || 'Server error'),
			always: () => {
        toast_loader.hideToast();
				//if(files_el) files_el.classList.remove('action-processing');
				//if(menu_el) menu_el.classList.remove('action-processing');
				//_e.files.parentElement.classList.remove('action-processing'); // always remove fm-processing!

				// remove (if exists and assigned) from files_el, menu_el and parent files-container
				[files_el, menu_el, _e.files.parentElement].forEach((el) => {
					if(el) el.classList.remove('action-processing');
				});

			},
	  	// data (object), raw response, is_json flag
	  	complete: (data, response, is_json) => {

	  		// errors
	  		_log('fm:task:' + task, data, item); // log it
        // invalid json/response without error code or data.error / serve response / should probably never happen
        if(!is_json || !data || !response) return _toast.toggle(false, 'Unknown Error');
	  		// data.error is output in JSON when we know the cause
        if(data.error) return _toast.toggle(false, data.error);
        // this should never happen if !data.error, because there would always be data.success / JIC just in case
	  		if(!data.success) return _toast.toggle(false, 'Unknown Error');

	  		// success
        if(!data.fail) _toast.toggle(true, toast_text); // generic success toast, unless data.fail (partial fail in delete)
				if(_o.contextmenu.item === item) delete _o.contextmenu.el; // refresh contextmenu
	  		if(complete) complete(list_item, files_el, menu_el, parent_dir, data); // complete func
	  	}
	  });
	}

	// processing state for elements being removed or processed
	function action_processing(el){
		if(!el) return false;
		el.style.removeProperty('opacity'); // in case it's added from anime()
		el.classList.add('action-processing');
		return el;
	}

	// CSS.escape polyfill / can probably be moved to helpers
	function css_escape(str){
		return CSS.escape ? CSS.escape(str) : str.replace(/["\\]/g, '\\$&');
	}

	// relative paths from parent / parent must be
	function rel_path(parent, path){
		if(typeof parent !== 'string') return false;
		// empty=root, endsWith('/')=url_path possibility
		return parent === '' ? path : parent + (parent.endsWith('/') ? '' : '/') + path;
	}

	// path highlight 'path/to/<strong>item</strong>' for SWAL
	function path_highlight(path, highlight){
		//if(!path) return ''; // no path nothing (happens in root obviously) / actually, show '/'
    if(highlight) { // if highlight, parse out basename and separate from path
      let arr = path.split('/');
      highlight = arr.pop('/'); // basename
      path = arr.length ? arr.join('/') : ''; // path after basename was removed
    }
		// return path+highlight / if !path && !highlight use empty /
		return `<div class="files-swal2-path">${ path || !highlight ? '<div class="files-swal2-path-path">' + html_tags(path) + '/</div>' : '' }${ highlight ? '<div class="files-swal2-path-highlight">' + html_tags(highlight) + '</div>' : '' }</div>`;
	}

	// public functions / same names as fm task= in PHP
	return {

		//
		/*text_edit: function(item, text, complete){
			// run_task(task, item, params, item_name, complete)
			run_task('text_edit', item, '&text=' + text, item_name, function(){
				console.log('text edited!');
				if(complete) complete();
			});
		}*/

		// duplicate
		duplicate: (item) => {

			// only file (for now) / already blocked by interface, but JIC just in case
      if(item.is_dir) return _toast.toggle(false, 'Can\'t duplicate folders');

			// prompt
      _alert.prompt.fire({
				title: lang.get('duplicate'),
				html: path_highlight(item.path, true),//lang.get('Duplicate name', true),
			  //inputLabel: lang.get('Duplicate name', true),
        confirmButtonText: lang.get('duplicate'),
        cancelButtonText: lang.get('cancel'),
			  inputPlaceholder: lang.get('name'),//item.basename,//lang.get('Duplicate name', true),
			  inputValue: item.basename,
			  inputValidator: (val) => {
          let invalid_input = _alert.invalid_input(val);
          if(invalid_input) return invalid_input;
			  	if(_c.files[val]) return _alert.invalid_response('File already exists');
			  }
			}).then((res) => {

				// if res
				if(!res.isConfirmed || !res.value || res.value === item.basename) return;

				// run_task
				run_task('duplicate', item, '&name=' + encodeURI(res.value), null, (list_item, files_el, menu_el, parent_dir) => {
					// reload dir for now
					if(!parent_dir) return;
	  			delete parent_dir.files; // stale
	  			delete parent_dir.html; // stale
	  			delete parent_dir.json_cache; // stale
	  			_ls.remove(get_ls_key(parent_dir.path, parent_dir.mtime)); // stale
					if(parent_dir === _c.current_dir) _f.get_files(_c.current_path, 'replace', true); // only if current_dir is parent_dir
				});
			});
		},


		// rename
		rename: (item) => {

			// prompt
			_alert.prompt.fire({
				title: lang.get('rename'),
				html: path_highlight(item.path, true),//item.basename, //lang.get('rename', true) + ' ' + item.basename,
			  //inputLabel: lang.get('rename', true) + ' ' + item.basename,//lang.get('new name', true),
        confirmButtonText: lang.get('rename'),
        cancelButtonText: lang.get('cancel'),
			  inputPlaceholder: lang.get('name'),//item.basename, //lang.get('new name', true),
			  inputValue: item.basename,

				/* // update path-highlight on input / kinda pointless, as we can see what we are typing, and might be useful to see current
				didOpen: () => {
					console.log('onopen');
					let dada = document.getElementsByClassName('files-swal2-path-highlight')[0];
					let original = dada.textContent;
			    Swal.getInput().addEventListener('input', (e) => {
						dada.textContent = e.currentTarget.value || original;
					});
			  },*/
			  inputValidator: (val) => {

			  	// value did not change / ignore
			  	if(val === item.basename) return false;

			  	// invalid
          let invalid_input = _alert.invalid_input(val);
          if(invalid_input) return invalid_input;

			  	// item is current dir
			  	if(_c.files[item.basename] && _c.files[item.basename].path === item.path){
			  		if(_c.files[val]) return _alert.invalid_response((item.is_dir ? 'Folder' : 'File') + ' already exists');

			  	// is_dir
			  	} else if(item.is_dir){
			  		var parent = item.path.split('/').slice(0,-1).join('/');
			  		if(_c.dirs[rel_path(parent, val)]) return _alert.invalid_response('Folder already exists');
			  	}
			  }
			}).then((res) => {

				// res
				if(!res.isConfirmed || !res.value || res.value === item.basename) return;
				var rename = res.value;

				// run_task
				run_task('rename', item, '&name=' + encodeURIComponent(rename), rename, (list_item, files_el, menu_el, parent_dir) => {
				//run_task('rename', item, '&name=' + encodeURI(rename), rename, (list_item, files_el, menu_el, parent_dir) => {

					// common vars
					var old_name = item.basename,
							old_path = item.path,
							new_path = rel_path((parent_dir ? parent_dir.path : old_path.split('/').slice(0,-1).join('/')), rename),
							new_url_path = parent_dir ? rel_path(parent_dir.url_path, rename) : false;

					// make sure parent_dir exists (from _c.dirs)
					if(parent_dir){

						// parent_dir is current_dir / && parent_dir.files (only when renaming items inside current dir)
						if(parent_dir === _c.current_dir && parent_dir.files){

							// create new file
							var new_file = parent_dir.files[rename] = Object.assign(item, {
								basename: rename,
								path: new_path,
								url_path: new_url_path
							});

							// dom manipulations
							if(files_el && files_el.isConnected){

								// update href / data-name / textContent
								files_el.setAttribute('href', file_path(new_file, _c.click === 'download'));
								files_el.dataset.name = rename;
								_class('name', files_el)[0].textContent = rename;

								// update img
								var img = files_el.firstElementChild;
								if(!item.is_dir && img.nodeName === 'IMG') {
									var new_src = _c.script + '?file=' + encodeURIComponent(new_file.path) + '&resize=' + (tests.pixel_ratio >= 1.5 && _c.image_resize_dimensions_retina ? _c.image_resize_dimensions_retina : _c.image_resize_dimensions) + '&' + new Date().getTime();
									img.dataset.src = new_src;
									if(img.hasAttribute('src')) img.setAttribute('src', new_src); // why check first
								}

								// update list_item
								list_item._values = new_file;

								// re-sort
								_f.set_sort();
							}

							// delete popup_caption cache
							delete new_file.popup_caption;

							// delete old key
							delete parent_dir.files[old_name];

						// parent_dir is NOT current_dir / just delete files
						} else {
							delete parent_dir.files;
						}

						// reset preview and remove html cache from parent_parent
						// todo: ugh, probably revert to not assign preview from child dir
						if(parent_dir.preview === old_name) {
							parent_dir.preview = rename;
							var parent_parent_dir = parent_dir.path.split('/').slice(0,-1).join('/');
							if(parent_parent_dir && _c.dirs[parent_parent_dir]) delete _c.dirs[parent_parent_dir].html;
						}

						// always
						delete parent_dir.html; // because contains outdated names
						delete parent_dir.json_cache; // because contains outdated names
						_ls.remove(get_ls_key(parent_dir.path, parent_dir.mtime)); // because contains outdated names
					}

					// clean affected dirs (including self)
					if(item.is_dir){

						// get all dir_paths that are affected
						var update_dirs = Object.keys(_c.dirs).filter(dir_path => dir_path.startsWith(old_path));

						// loop update_dirs
						update_dirs.forEach(function(dir_path) {

							// new_dir_path
							var rel_path = dir_path.split(old_path).slice(1).join('/'), // path relative to delete item / empty if === delete item
									new_dir_path = new_path + rel_path;

							// rename dir / edit props / use reference so that _c.current_dir remains
							var new_dir = _c.dirs[new_dir_path] = Object.assign(/*{}, */_c.dirs[dir_path], {
								path: new_dir_path,
								files: false,
								json_cache: false,
								html: false,
								url_path: new_url_path ? new_url_path + rel_path : false
							});

							// assign new basename if is renamed item
							if(dir_path === old_path) new_dir.basename = rename;

							// delete old key
							delete _c.dirs[dir_path];

							// remove localStorage
							_ls.remove(get_ls_key(dir_path, new_dir.mtime));

							// rename menu element path and href
							if(_e.sidebar_menu) {
								var menu_item = _query('[data-path="' + css_escape(dir_path) + '"]', _e.sidebar_menu);
								if(menu_item) {
									if(dir_path === old_path) menu_item.firstElementChild.lastChild.textContent = rename;
									menu_item.dataset.path = new_dir_path;
									menu_item.firstElementChild.setAttribute('href', file_path(new_dir));
								}
							}
						});

						// force reload and force re-sort after get_files
						if(_c.current_path && _c.current_path.startsWith(old_path)) _f.get_files(_c.current_dir.path, 'push');
					}
				});
			});
		},

		// new_folder
		new_folder: (item) => {

			// item (parent) must be dir / JIC just in case
      if(!item.is_dir) return _toast.toggle(false, item.basename + ' is not a directory');

			// prompt
			_alert.prompt.fire({
				title: lang.get('new folder'),
				html: path_highlight(item.path, false),//path_highlight(item.path),//item.path,
			  //inputLabel: lang.get('Folder name', true),
        confirmButtonText: lang.get('new folder'),
        cancelButtonText: lang.get('cancel'),
			  inputPlaceholder: lang.get('name'),
			  //inputValue: 'foldername',
			  inputValidator: (val) => {
          let invalid_input = _alert.invalid_input(val);
          if(invalid_input) return invalid_input;
			  	// newfolder exists in dirs
			  	if(_c.dirs[rel_path(item.path, val)]) return _alert.invalid_response('Folder already exists');
			  	// newfolder exists in files
			  	if(_c.dirs[item.path] && _c.dirs[item.path].files && _c.dirs[item.path].files[val]) return _alert.invalid_response('Folder already exists');
			  }
			}).then((res) => {

				// result
				if(!res.isConfirmed || !res.value) return;
				var dirname = res.value;

				// task
				run_task('new_folder', item, '&name=' + encodeURI(dirname), dirname, (list_item, files_el, menu_el, parent_dir) => {

					// menu_enabled && !menu_exists means there was zero dirs
	  			if(_c.menu_enabled && !_c.menu_exists) return window.location.reload();

					// common vars
					var owner_dir = _c.dirs[item.path]; // must be _c.dirs[item] / not necessarily item, because that might be from files
					if(!owner_dir) return; // might not exist if dir not in menu and not loaded yet
					delete owner_dir.files; // stale
	  			delete owner_dir.html; // stale
	  			delete owner_dir.json_cache; // stale
	  			_ls.remove(get_ls_key(owner_dir.path, owner_dir.mtime)); // stale

	  			// submenu html
	  			if(menu_el){

	  				// vars
	  				var path = rel_path(owner_dir.path, dirname),
	  						new_dir = _c.dirs[path] = {
			  					basename: dirname,
									path: path,
									url_path: rel_path(owner_dir.url_path, dirname),
									is_dir: true,
									is_writeable: true,
									is_readable: true,
									filetype: 'dir',
									mime: 'directory',
									mtime: Date.now() / 1000, // owner_dir.mtime,
									fileperms: owner_dir.fileperms
			  				},
			  				ul = menu_el.lastElementChild.nodeName === 'UL' ? menu_el.lastElementChild : false,
	  						level = (menu_el.dataset.level || 0) * 1,
	  						li = '<li data-level="' + (level + 1) + '" data-path="' + html_quotes(path) + '" class="menu-li"><a href="' + file_path(new_dir) + '" class="menu-a">' + _f.get_svg_icon_class('folder', 'menu-icon menu-icon-folder') + html_tags(dirname) + '</a></li>';

	  				// <ul> already exists
	  				if(ul){
	  					ul.insertAdjacentHTML('afterbegin', li);

	  				// create new <ul>, toggle SVG and classes
	  				} else {
	  					menu_el.firstElementChild.firstElementChild.remove(); // remove icon
	  					menu_el.firstElementChild.insertAdjacentHTML('afterbegin', _f.get_svg_icon_multi_class('menu-icon menu-icon-toggle', 'plus', 'minus') + _f.get_svg_icon_multi_class('menu-icon menu-icon-folder menu-icon-folder-toggle', 'folder', 'folder_plus', 'folder_minus'));
	  					menu_el.classList.add('has-ul');
	  					menu_el.insertAdjacentHTML('beforeend', '<ul style="--depth:' + level + '" class="menu-ul">' + li + '</ul>');
	  				}

	  				// add reference to menu_li from dir object / for sidebar menu-active class
	  				new_dir.menu_li = menu_el.lastElementChild.firstElementChild;
	  			}

	  			// reload if owner_dir is current dir
					if(owner_dir === _c.current_dir) _f.get_files(_c.current_path, 'replace', true); // only if item is current_dir
				});
			});
		},

		// new_file
		new_file: function(item){

      // item (parent) must be dir / JIC just in case
      if(!item.is_dir) return _toast.toggle(false, item.basename + ' is not a directory');

			// prompt
			_alert.prompt.fire({
				title: lang.get('new file'),
				html: path_highlight(item.path, false),
				//text: item.path + '/*',
			  //inputLabel: lang.get('File name', true),
        confirmButtonText: lang.get('new file'),
        cancelButtonText: lang.get('cancel'),
			  inputPlaceholder: lang.get('name'),
			  inputValue: 'file.txt',
			  inputValidator: (val) => {
          let invalid_input = _alert.invalid_input(val);
          if(invalid_input) return invalid_input;
			  	// filename exists in dir.files
			  	if(_c.dirs[item.path] && _c.dirs[item.path].files && _c.dirs[item.path].files[val]) return _alert.invalid_response('File already exists');
			  }
			}).then((res) => {

				// res
				if(!res.isConfirmed || !res.value) return;
				var filename = res.value;

				// task
				run_task('new_file', item, '&name=' + encodeURI(filename), filename, (list_item, files_el, menu_el, parent_dir) => {

					// cleaning
					var owner_dir = _c.dirs[item.path]; // must be _c.dirs[item] / not necessarily item, because that might be from files
					if(!owner_dir) return; // should probably always exist
					delete owner_dir.files; // stale
	  			delete owner_dir.html; // stale
	  			delete owner_dir.json_cache; // stale
	  			_ls.remove(get_ls_key(owner_dir.path, owner_dir.mtime)); // stale
	  			// reload if item is current dir
					if(owner_dir === _c.current_dir) _f.get_files(_c.current_path, 'replace', true); // only if item is current_dir
				});
			});
		},

		// delete
		// ?action=fm&task=delete&path=dir/path/fileordir&is_dir=1/0
		delete: (item) => {

			// confirm
      _alert.confirm.fire({
				title: lang.get('delete'),
				html: path_highlight(item.path, true),
        confirmButtonText: lang.get('delete'),
        cancelButtonText: lang.get('cancel'),
        focusConfirm: tests.only_touch, // false unless touch / make users explicitly click "confirm"
			}).then((res) => {
				if(!res.isConfirmed) return;

				// task
				run_task('delete', item, null, null, (list_item, files_el, menu_el, parent_dir, data) => {

					// partial success intervene
					if(data.fail) return _toast.refresh('Failed to delete ' + data.fail + ' items.');

					// delete files item from parent_dir / files might not exist if parent not loaded yet and item is deleted from menu
	  			if(parent_dir.files) delete parent_dir.files[item.basename];

	  			// clear caches / always
					delete parent_dir.html; // because contains removed item
					delete parent_dir.json_cache; // because contains removed item
					_ls.remove(get_ls_key(parent_dir.path, parent_dir.mtime)); // because contains removed item

					// update counts
					if(item.mime0 === 'image' && parent_dir.images_count) parent_dir.images_count --;
					if(!item.is_dir && parent_dir.files_count) parent_dir.files_count --;
					if(parent_dir.dirsize && item.filesize) parent_dir.dirsize -= item.filesize;

	  			// reset preview and remove html cache from parent_parent / todo: ugh, probably revert to not assign preview from child dir
					if(parent_dir.preview === item.basename) {
						delete parent_dir.preview;
						if(parent_dir.path) {
							// could be '' ROOT
							var parent_parent_dir = parent_dir.path.split('/').slice(0,-1).join('/');
							if(_c.dirs[parent_parent_dir]) delete _c.dirs[parent_parent_dir].html;
						}
					}

					// update current dir
					if(parent_dir === _c.current_dir) {
						_c.file_names = Object.keys(_c.files);
						_c.files_count = _c.file_names.length; // this is NOT THE SAME as dir.files_count (from PHP, excludes dirs count)
						_f.breadcrumbs_info(); // refresh breadcrumbs please if current path
						_o.list.remove('path', item.path); // return 1
            set_page_title(); // update file count
					}

					// deleted item is_dir
	  			if(item.is_dir) {

	  				// update dirs recursively / so they are not cached obviously (for example browser nav)
	  				Object.keys(_c.dirs).forEach((path) => {
	  					if(!path.startsWith(item.path)) return true;
	  					var dir = _c.dirs[path]; // get dir from _c.dirs{}
	  					if(!dir) return;
  						_ls.remove(get_ls_key(dir.path, dir.mtime)); // delete from localStorage / not really necessary
  						delete _c.dirs[path]; // delete from _c.dirs
	  				});

	  				// menu_el detected / delete dir (and subdirs)
		  			if(menu_el && menu_el.isConnected) {

		  				// parent <ul> element (could be root)
		  				var menu_ul = menu_el.parentElement;

							// if menu_el has siblings or IS_ROOT / only delete <li> menu_el (don't delete ROOT)
							if(menu_ul.children.length > 1 || menu_ul.parentElement.tagName !== 'LI'){
								menu_el.remove();

							// menu_el is only-child / delete parent <ul> / remove classes on parent.parent <li> / toggle <svg>
							} else {
								var menu_li = menu_ul.parentElement; // get parent.parent <li>
								menu_ul.remove(); // remove parent <ul>
								menu_li.classList.remove('has-ul', 'menu-li-open'); // remove .has-ul and .menu-li-open
								var menu_a = menu_li.firstElementChild; // get <a>
								menu_a.firstElementChild.remove(); // remove <svg>.menu-icon-toggle
								var svg = menu_a.firstElementChild; // get <svg>.menu-icon-folder
								svg.lastElementChild.remove(); // remove <path>.svg-path-folder_minus
								svg.lastElementChild.remove(); // remove <path>.svg-path-folder_plus
								svg.classList.remove('menu-icon-folder-toggle'); // remove <svg>.menu-icon-folder-toggle
							}
		  			}

		  			// navigate to deleted parent if current dir is in delete path
	  				if(_c.current_path && _c.current_path.startsWith(item.path)) _f.get_files(parent_dir.path, 'replace');
	  			}
				});
			});
		}
	}
})();


// files.filemanager.uppy.js

/* TODO
FUTURE
- relativePath may allow keeping dropped folders
- do we really need to create the uppy instance and hidden dashboard before user clicks any button to upload?
  - maybe add some loading interface?
- light/dark skin?
*/

// upload_enabled and license / load uppy js/css
if(_c.allow_upload) _f.load_plugin('uppy', () => {

  // load_watermark_assets / triggered on first open
  function load_watermark_assets(){
    let w = compressor_options.watermark; // shortcut
    if(!w || typeof w !== 'object' || w.assets_loaded) return; // die
    w.assets_loaded = true; // flag to prevent further load attemps

    // from index.php glob() into `_files/watermark/*`
    let watermark_files = _c.watermark_files || [];

    // load image from w.image_src || watermark_files[] / ignore if !w.interface && w.text assigned
    let image_src = w.interface === false && w.text ? false : w.image_src || watermark_files.find((f) => /\.(png|jpg|gif|webp)$/i.test(f));
    if(image_src) {
      w.image = new Image();
      w.image.addEventListener('load', () => {
        let container = _id('watermark');
        // assign use_image if !input or from localStorage only if watermark input exists and ls isn't specifically false
        w.use_image = container ? _ls.get('files:upload:watermark:use_image') !== false : true;
        toggle_watermark(); // must toggle watermark/strict on/off if use_image assigned
        if(!container) return; // die
        // inject use_image checkbox
        container.insertAdjacentHTML('afterbegin', `<label class="checkbox-label" style="float:right"><input class="checkbox" type="checkbox" id="watermark-image"${ w.use_image ? ' checked' : '' }>${ lang.span('use image') }</label>`);
        _id('watermark-image').addEventListener('change', (e) => {
          w.use_image = e.currentTarget.checked;
          toggle_watermark();
          _ls.set('files:upload:watermark:use_image', w.use_image);
        });
      });

      // load it!
      w.image.src = image_src;
    }

    // load font from w.font_src || watermark_files[] / ignore if !w.interface && image_src
    let font_src = w.interface === false && image_src ? false : w.font_src || watermark_files.find((f) => /\.(otf|ttf|woff|woff2)$/i.test(f));
    if(font_src) {
      let font_face = new FontFace('custom_font', `url(${ font_src })`);
      document.fonts.add(font_face);
      font_face.load().then(() => {
        w.font = '10px custom_font';
      });
    }
  }

  // toggle_watermark enabled if use_image || text / also toggle Compressor.strict false if watermark enabled
  function toggle_watermark(){
    let enabled = compressor_options.watermark.use_image || !!compressor_options.watermark.text;
    compressor_options.watermark.enabled = enabled;
    let strict = enabled ? false : strict_default; // strict false if watermark enabled / else use strict_default
    // disable Compressor strict mode if watermark enabled, so that compressed image is always used
    // https://github.com/fengyuanchen/compressorjs#strict
    //if(compressor_options.watermark.text) compressor_options.strict = false;
    if(compressor_options.strict === strict) return; // die if strict === strict
    compressor_options.strict = strict;
    // update Compressor plugin if already loaded
    let c = uppy.getPlugin('Compressor');
    if(c) c.setOptions(compressor_options);
  }

  // toggle_dashboard_size depending on files amount
  const toggle_dashboard_size = () => {
    let count = uppy.getFiles().length;
    [1, 2, 5, 9].forEach((k) => uppy_inner.classList.toggle('uppy-Dashboard-inner-' + k, count >= k));
    // ugly hack replace upload button
    wait(1).then(() => {
      let ub = _class('uppy-StatusBar-actionBtn--upload')[0];
      if(ub) ub.className = 'button upload-button';
    });
  }

  // disable_drop if Chrome non-SSL // https://github.com/transloadit/uppy/issues/4133
  // seems to be resolved since Files Gallery 3.9.0
  const disable_drop = false;//location.protocol !== 'https:' && location.hostname !== 'localhost' && /Chrome/i.test(navigator.userAgent);

	// default uppy options
	const options = {
		//locale: false,
		note: true,
		DropTarget: !disable_drop,
		ImageEditor: true,
		//Webcam: true,
	}

	// merge _c.config.uppy options
	if(_c.config && _c.config.uppy) Object.assign(options, _c.config.uppy);

	// uppy / Uppy.Uppy (previously .Core)
  const uppy = _o.uppy = new Uppy.Uppy({
    // autoProceed: true,
    // allowMultipleUploadBatches: false,
    // debug: true,
    // logger: Uppy.debugLogger,
    // allowMultipleUploads: false, // interesting option, cleaner layout, force close after upload batch
    restrictions: {
      maxFileSize: _c.upload_max_filesize || null,
      //minFileSize: null,
      //maxTotalFileSize: null,
      //maxNumberOfFiles: null,
      //minNumberOfFiles: null,
      //allowedFileTypes: _c.upload_allowed_file_types && _c.upload_allowed_file_types.length ? _c.upload_allowed_file_types : null
      allowedFileTypes: _c.upload_allowed_file_types ? _c.upload_allowed_file_types.split(',').map(str => {
				var trimmed = str.trim();
				return !trimmed.startsWith('.') && !trimmed.includes('/') && !trimmed.includes('*') ? '.' + trimmed : trimmed;
			}).filter(x => x) : null
    },
    // meta / ?action=fm&task=upload&path=dir/path&is_dir=1&name=NEWFILENAME
    meta: {
      action: 'fm',
      task: 'upload',
      is_dir: true
    },
    // onBeforeFileAdded: (currentFile, files) => {},
    // onBeforeUpload: (files) => {},
    // locale: Uppy.locales.ja_JP,//Uppy.locales.de_DE, // can go here or in Uppy.Dashboard



  // Uppy.Dashboard / https://uppy.io/docs/dashboard/
  }).use(Uppy.Dashboard, {
    // closeAfterFinish: true, // use with allowMultipleUploads: false
  	// target: 'body' //'#drag-drop-area',
		// inline: false,
		trigger: '#fm-upload',
		// width: 1000, // width of the Dashboard in pixels. Used when inline: true.
		// height: 800, // height of the Dashboard in pixels. Used when inline: true.
		thumbnailWidth: Math.round(160 * Math.min(tests.pixel_ratio, 2)), // 160 * (tests.pixel_ratio >= 2 ? 2 : 1),
	  // waitForThumbnailsBeforeUpload: false // exif hmmm
	  showLinkToFileUploadResult: true,
	  showProgressDetails: true, // Uploading: 45%・43 MB of 101 MB・8s left / why not?
		// hideProgressAfterFinish: false, // might as well keep this
		// hideUploadButton: true,

		//metaFields: [{ id: 'name', name: lang.get('name'), placeholder: lang.get('name') }],
		metaFields: [{
      id: 'name',
      name: lang.get('name'),
      placeholder: lang.get('name'),
      render ({ value, onChange, fieldCSSClasses }, h) {
        return h('input', {
          class: fieldCSSClasses.text,
          type: 'text',
          value: value,
          maxlength: 128, // keep sane
          onChange: (e) => onChange(e.target.value.trim()),
          onInput: (e) => { // block nasty characters
          	e.target.value = e.target.value.replace(/[#%&(){}\\<>*?/$!'":;\[\]@+`|=]/gi,'').replace('..','.');
          },
          'data-uppy-super-focusable': true
        })
      }
    }],
    // custom doneButtonHandler to force reload page
		doneButtonHandler: () => {
      toggle_dashboard(false); // to force reload page
      uppy.cancelAll(); //uppy.reset();
      // this.uppy.cancelAll() / default
      // this.requestCloseModal() / default
	  },
	  closeModalOnClickOutside: true, // makes sense to match other modals
	  //closeAfterFinish: false // Set to true to automatically close the modal when all current uploads are complete.
    //disableStatusBar: false // true if we add own _toast()
    //disableInformer: false, // true if we add own _toast()
    //disablePageScrollWhenModalOpen: true, // default true / uses our own @extend %hide-scrollbar
	  animateOpenClose: false, // make some nice fade-in instead? I don't like the translateY effect
	  // fileManagerSelectionType: 'files' // interesting, can set to 'both', shows two select links for 'files' and 'folders'
    proudlyDisplayPoweredByUppy: false,
    //onRequestCloseModal: () => toggle_dashboard(),
    showRemoveButtonAfterComplete: _c.allow_delete, // true, // easily delete files after upload
    //browserBackButtonClose: false, // don't enable, because it messes with push/replace nav after upload
	  theme: _c.theme === 'dark' ? 'dark' : 'light',

  // Uppy.XHRUpload
  }).use(Uppy.XHRUpload, {
    endpoint: _c.script,
    // bundle: true, // Send all files in a single multipart request. When bundle is set to true, formData must also be set to true
    // formData: true,
    // limit: 5, // Limit the amount of uploads going on at the same time

    // validateStatus / Check if the response from the upload endpoint indicates that the upload was successful
    validateStatus: (statusCode, responseText, response) => {
      return json_parse(responseText, 'success'); // get response.success
    },

    // This response data will be available on the file’s .response property, and be emitted in the upload-success event
    // getResponseData: (responseText, response) => {},

    // getResponseError / triggers after validateStatus === false
    getResponseError: (responseText, response) => {
    	return json_parse(responseText, 'error'); // get response.error
    },

  // files-added
  }).on('files-added', (files) => {
		toggle_dashboard_size();

  // files-added
  }).on('file-removed', (files) => {
		toggle_dashboard_size();

  // files-added
  }).on('cancel-all', (files) => {
		toggle_dashboard_size();


	// upload
	/*}).on('upload', (files) => {
		toggle_compressor_options(); // hide compressor options when upload starts*/

  // file-removed
  }).on('file-removed', (file, reason) => {
		//toggle_compressor_options(false, uppy.getFiles()); // hide compressor options if visible and there are no images

  	// silently delete file, if successfully uploaded
    if(!_c.allow_delete || reason !== 'removed-by-user' || !file.response || !file.response.body || !file.response.body.success || !file.progress || !file.progress.uploadComplete || !file.meta) return;

    // silently delete file
    var xhr = ajax_get({ params: 'action=fm&task=delete&path=' + encodeURIComponent(file.meta.path + '/' + file.meta.name) });

  // upload-success / Fired each time a single upload is completed.
  }).on('upload-success', (file, response) => {

      // if filename gets renamed or incremented in PHP, update name
      var new_name = response.body.filename;
      if(new_name && file.name !== new_name) uppy.setFileMeta(file.id, { name: new_name });

  // complete / Fired when all uploads are complete.
  }).on('complete', (result) => {

  	// make file.uploadURL absolute for copylink() function
  	if(result.successful && result.successful.length) result.successful.forEach(function(file) {
  		if(file.uploadURL) file.uploadURL = new URL(file.uploadURL, location.href).href;
  	});

  	// always reset upload_path dirs object after upload completes / might be cleared already if multiple uploads complete
  	var upload_path = uppy.getState().meta.path,
  			clear_dir = _c.dirs[upload_path];
  	if(clear_dir){ // clear_dir should probably exist unless not in menu and not already loaded
  		delete clear_dir.files;
  		delete clear_dir.html;
  		delete clear_dir.json_cache;
  		_ls.remove(get_ls_key(upload_path, clear_dir.mtime));
  	}

    // refresh contextmenu since download zip might be available after upload
    delete _o.contextmenu.el;


  // complete / Fired when all uploads are complete.
  /*}).on('upload', (data) => {
  	console.log('upload', data);*/

  // error / fired when Uppy fails to upload/encode the entire upload.
  /*}).on('error', (error) => {
  	console.error(error.stack);*/

  // upload-error / fired each time a single upload has errored.
  /*}).on('upload-error', (file, error, response) => {
		console.log('upload-error', file, error, response);*/

  // dashboard:modal-open / fired when the Dashboard modal is open.
  }).on('dashboard:modal-open', () => {

    //shortcut
    let dash = uppy.getPlugin('Dashboard');

    // change theme if Files theme was changed
    let uppy_theme = _c.theme === 'dark' ? 'dark' : 'light';
    if(dash.opts.theme !== uppy_theme) dash.setOptions({ theme: uppy_theme });

    // load fonts and images assigned for watermark
    load_watermark_assets();

  	// set_scrollbar_width to block body from resizing when hiding scrollbar
    // this now works after overflow hidden, will use tests.scrollbar_width if there is scroll
    set_scrollbar_width();

  	// block if !is_licensed
  	if(!is_licensed) uppy_root.classList.add('uppy-nolicense');

  	// set note options.note || '%path% ≤ %upload_max_filesize%'
		if(options.note) dash.setOptions({
		  note: (typeof options.note === 'string' ? options.note : '%path% ≤ %upload_max_filesize%').replace('%upload_max_filesize%', (_c.upload_max_filesize ? filesize(_c.upload_max_filesize) : '')).replace('%path%', (uppy.getState().meta.path || _c.current_path || '/'))
		});

  // dashboard:modal-closed / fired when the Dashboard modal is closed
  }).on('dashboard:modal-closed', () => {
  	var state = uppy.getState();

    // navigate to path / reload page if path === current_path && totalProgress === 100 (upload is complete)
  	if(state.totalProgress === 100) {
  		let reload = state.meta.path === _c.current_path; // reload current page?
      // must remove #hash if reload, else #hash and filter-input remains after reload, without actually filtering
      if(reload && filter.current()) history.replaceState(history.state || null, document.title, location.pathname + location.search);
  		_f.get_files(state.meta.path, reload ? 'replace' : 'push', reload);
      uppy.cancelAll(); // uppy.reset(); // must reset after reload to reset and make sure it doesn't reload again (unless new uploads complete)
  	}
  });

  // block drop
  //if(disable_drop) document.querySelector('.uppy-Root').classList.add('uppy-chrome-non-ssl');

	// default options for plugins
	var plugins = {
		ImageEditor: { // Uppy.ImageEditor / https://uppy.io/docs/image-editor/
			target: Uppy.Dashboard,
	    quality: 0.8
		},
		DropTarget: { // Uppy.DropTarget / https://uppy.io/docs/drop-target/
			target: document.body, //_e.files,//document.body,
			onDrop: (e) => toggle_dashboard(true, _c.current_path) // open dashboard on drop
		},
		Webcam: { // Uppy.Webcam / https://uppy.io/docs/webcam/
			target: Uppy.Dashboard
		}
	}

	// apply plugins
	Object.keys(plugins).forEach((key) => {
		if(options[key]) uppy.use(Uppy[key], typeof options[key] === 'object' ? Object.assign(plugins[key], options[key]) : plugins[key]);
	});

  // dom elements
  const uppy_root = document.body.lastElementChild // _class('uppy-Root')[0];
        uppy_dash = uppy_root.firstElementChild,
        uppy_inner = uppy_dash.lastElementChild,
        uppy_close = uppy_inner.firstElementChild,
        uppy_inner_wrap = uppy_inner.lastElementChild;

  // demo_mode / hide button and show some text
  if(_c.demo_mode) uppy_root.classList.add('uppy-demo-mode');

  // allow_delete / add class that makes room for delete button
  if(_c.allow_delete) uppy_root.classList.add('uppy-allow-delete');

  // modify close button with own <svg> / see uppy.scss
  uppy_close.insertAdjacentHTML('afterbegin', _f.get_svg_icon('close_thin'));
  uppy_close.className = 'button-icon button-uppy-close';

	// COMPRESSOR / RESIZE
	// compressor options, return empty (disabled) if options.Compressor === falsy, else merge default options with custom options
	// https://github.com/fengyuanchen/compressorjs#options / https://uppy.io/docs/compressor/
	const compressor_options = options.hasOwnProperty('Compressor') && !options.Compressor ? {} : Object.assign({
		interface: true, // custom option to show interface
		enabled: false, // custom option Compressor enabled / disabled default with interface
		quality: 0.8, // default quality, same as https://github.com/fengyuanchen/compressorjs#quality
		maxWidth: 2000, // default resize max width
		maxHeight: 2000, // default resize max height
    // watermark will get overwritten on custom watermark: {} so don't store defaults here
    // https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D
    watermark: {
      //fillStyle: 'rgba(255, 0, 0, 0.5)', // 'blue' / '#990000'
      //filter: 'blur(5px)', // various
      //font: '10px Georgia', // px size will be ignored because we use scale
      //globalAlpha: 0.5, // works on images and text / optionally, use fillStyle: 'rgba(255, 0, 0, 0.9)'
      //globalCompositeOperation: 'destination-out', // screen, difference (text), luminosity (image)
      //shadowBlur: 50,
      //shadowColor: rgba(0,0,0,.5)
      //
      // CUSTOM OPTIONS
      //position: 'top-left', // top-left, top, top-right, center-left, center, center-right, bottom-left, bottom, bottom-right
      //scale: .3, // scale 0.1 - 1 relative to canvas or >1 assigns pixel size
      //margin: 0.05 // margin 0.1 - 1 relative to canvas or >1 assigns pixel margin
    },
    strict: true, // must keep to assign strict_default var / strict is set to false on watermark text or image
    drew: (context, canvas) => {

      // shortcut
      let w = compressor_options.watermark;
      // die if !compressor_options.watermark.enabled
      if(!w.enabled) return;

      // default options merge into context
      // contains custom and standard standard context options https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D
      Object.assign(context, {
        font: '10px Futura, Gill Sans, Gill Sans MT, Calibri, Trebuchet MS, sans-serif',
        fillStyle: 'white',//'rgba(255, 255, 255, 0.4)', // seems like a good balance
        //
        position: 'bottom-right',
        scale: .3,
        margin: 0.05
      // merge custom options from compressor_options.watermark and options from text input ?params
      }, w, /(.+)=(.+)/.test(w.text) ? query_to_ob(w.text) : {});

      // shortcuts
      let pos = context.position.split('-'), // position array
          cw = canvas.width, // canvas.width
          ch = canvas.height, // canvas.height
          // parseFloat scale and margin
          [scale, margin] = ['scale', 'margin'].map(v => parseFloat(context[v]) || 0);

      // scale must be a positive number > 0
      if(!scale || isNaN(scale) || scale <= 0) return console.warn('scale must be a positive number > 0');

      // margin must be a positive number >= 0
      if(isNaN(margin) || margin < 0) return console.warn('margin must be a positive number >= 0');

      // if margin is decimal 0.1 - 1.0, multiply with canvas.width
      if(margin <= 1) margin = margin * cw;

      // use_image
      if(compressor_options.watermark.use_image){

        // shortcuts
        let img = compressor_options.watermark.image,
            nw = img.naturalWidth,
            nh = img.naturalHeight;

        // die
        if(!img || !img.complete || !nw || !nh) return;

        // width and position
        let ratio = scale > 1 ? 1 : cw / nw * scale, // use ratio if scale 0.1 - 1.0
            w = scale > 1 ? scale : nw * ratio, // use ratio if scale 0.1 - 1.0
            h = scale > 1 ? scale * (nh / nw) : nh * ratio, // use ratio if scale 0.1 - 1.0
            x = pos[1] === 'left' ? margin : pos[1] === 'right' ? cw - w - margin : cw / 2 - w / 2,
            y = pos[0] === 'top' ? margin : pos[0] === 'bottom' ? ch - h - margin : ch / 2 - h / 2;

        // drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight)
        context.drawImage(img, 0, 0, nw, nh, x, y, w, h);

      // is text/font
      } else {

        // font size is px if > 1, else ratio of canvas.width if 0.1 - 1.0
        let fs = scale > 1 ? scale : (context.font.match(/\d+/) || 10) * (cw / context.measureText(context.text).width) * scale;

        // assign new font size in pixels
        context.font = context.font.replace(/\d+px/, fs + 'px');

        // merge textBaseline (y) and textAlign (x) for positioning text
        Object.assign(context, {
          textBaseline: pos[0] === 'center' ? 'middle' : pos[0], // 'middle', // top, middle, bottom
          textAlign: pos[1] || 'center', //'center', // left, right, center
        });

        // assign x,y coordinates
        let x = pos[1] === 'left' ? margin : pos[1] === 'right' ? cw - margin : cw / 2,
            y = pos[0] === 'top' ? margin : pos[0] === 'bottom' ? ch - margin : ch / 2;

        // fillText with coordinates
        context.fillText(context.text, x, y);
      }
    },
	}, options.Compressor || {});

  // assign strict_default as reference when reverting from watermark strict toggle
  const strict_default = !!compressor_options.strict;

	// compressor_options.interface / default true
	if(compressor_options.interface){

		// create compressor_interface options to compare with localStorage for defaults removal
		let compressor_interface = {},
        ls_compressor = query_to_ob(_ls.get('files:upload:compressor')); // prepare compressor options from localStorage
    // loop compressor localStoragable options
    ['enabled', 'quality', 'maxWidth', 'maxHeight'].forEach((key) => {
      compressor_interface[key] = compressor_options[key]; // assign defaults from compressor_options
      if(ls_compressor[key]) compressor_options[key] = ls_compressor[key]; // assign from localStorage
    });

    // assign watermark.text from localStorage / only if interface input is enabled
    compressor_options.watermark.text = compressor_options.watermark.interface !== false ? _ls.get('files:upload:watermark') : false;

		// update compressor options from interface
		function update_compressor_options(e){

      // vars
      let i = e.currentTarget, // input
          key = i.id.replace('compressor-', ''), // key
          val = key === 'enabled' ? (i.checked ? 1 : 0) : i.value.replace(',', '.'); // assign val

      // quality, maxWidth, maxHeight modify
      if(['quality', 'maxWidth', 'maxHeight'].includes(key)) {

        // if !number or empty, exit and replace input with current option
        if(isNaN(val) || val === '') return i.value = compressor_options[key];

        // force number type
        val = +val;

        // quality
        if(key === 'quality'){

          // force quality range 0-1
          if(val < 0 || val > 1) i.value = val = val > 1 ? 1 : 0;

        // maxWidth, maxHeight
        } else {

          // minimum 1
          if(val < 1) {
            i.value = val = 1;

          // always round
          } else {
            let round = Math.round(val);
            if(val !== round) i.value = val = round;
          }
        }
      }

      // die because nothing changed
      if(val === compressor_options[key]) return;

      // update compressor options
      compressor_options[key] = val;

      // update localStorage, or clear if empty / should maybe store as json but ok
			_ls.set('files:upload:compressor', Object.keys(compressor_interface).map((key) => {
        return compressor_options[key] == compressor_interface[key] ? false : key + '=' + compressor_options[key];
      }).filter(Boolean).join('&'), true);

      // enabled checkbox / toggle visible / toggle plugin and return
			if(key === 'enabled') {
				compressor_container.classList.toggle('compressor-enabled', !!val);
				if(!val) return uppy.removePlugin(uppy.getPlugin('Compressor'));
				return uppy.use(Uppy.Compressor, compressor_options);
			}

      // update Compressor options / Must be enabled already, else would not be able to toggle interface options
			uppy.getPlugin('Compressor').setOptions(compressor_options);
		}

		// Create compressor options interface
    uppy_inner_wrap.insertAdjacentHTML('beforeend', `<div class="compressor-container${ compressor_options.enabled ? ' compressor-enabled' : '' }"><label class="checkbox-label"><input class="checkbox" type="checkbox" id="compressor-enabled"${ compressor_options.enabled ? ' checked' : '' }>${ lang.span('resize and compress images') }</label><div class="compressor-options"><label class="input-label">${ lang.span('width') }<input type="number" class="input" inputmode="numeric" pattern="[0-9]*" id="compressor-maxWidth" min="0" max="99999" step="10" value="${ compressor_options.maxWidth }"></label><label class="input-label">${ lang.span('height') }<input type="number" class="input" inputmode="numeric" pattern="[0-9]*" id="compressor-maxHeight" min="0" max="99999" step="10" value="${ compressor_options.maxHeight }"></label><label class="input-label">${ lang.span('quality') }<input${ (tests.is_pointer ? ' type="number"' : '') } class="input" pattern="[0-9]*" inputmode="decimal" id="compressor-quality" min="0" max="1" step="0.1" value="${ compressor_options.quality }"></label>${ compressor_options.watermark.interface !== false ? `<div id="watermark"><label class="input-label">${ lang.span('overlay') }<textarea class="input" rows="1" type="text" id="watermark-text">${ compressor_options.watermark.text || '' }</textarea>` : '' }</label></div></div></div>`);

    // compressor dom elements
		const compressor_container = uppy_inner_wrap.lastElementChild, // _class('compressor-container')[0];
		      compressor_inputs = _tag('input', compressor_container); // get inputs except watermark

    // change event for all compressor inputs
		compressor_inputs.forEach((el) => _event(el, update_compressor_options, 'change'));

    // <textarea> is optional
    let textarea = _id('watermark-text');
    if(textarea) {
      // auto-expand watermark textarea on input and focus, set to auto-only on blur
      ['input', 'focus'].forEach((type) => _event(textarea, () => {
        textarea.style.height = 'auto';
        textarea.style.height = textarea.scrollHeight + 'px';
      }, type));

      // assign compressor_options.watermark.text and localStorage on change
      _event(textarea, () => {
        let val = textarea.value.trim();
        compressor_options.watermark.text = val;
        toggle_watermark();
        _ls.set('files:upload:watermark', val, true);
      }, 'change');
    }

		// As a precaution, disable if hidden by CSS (only if enabled and no custom options.Compressor)
		if(compressor_options.enabled && !options.Compressor && window.getComputedStyle(compressor_container).getPropertyValue('display') === 'none') {
			compressor_options.enabled = false; // disable
			_ls.remove('files:upload:compressor'); // must be enabled by localStorage, so remove it
		}
	}

	// enable compressor init (options || localStorage if interface)
	if(compressor_options.enabled) {
    // toggle watermark.enabled and strict, may have values from options or localStorage
    toggle_watermark(); // before use(Uppy.Compressor) so we don't need to re-init Uppy.Compressor
    uppy.use(Uppy.Compressor, compressor_options);
  }

  // toggle_dashboard Uppy
  function toggle_dashboard(toggle, meta){
		var dash = uppy.getPlugin('Dashboard');
		if(!!toggle === dash.isModalOpen()) return;
		dash[toggle ? 'openModal' : 'closeModal']();
    // check if meta is string, because it could be '' empty (falsy value)
		if(typeof meta === 'string') uppy.setMeta({ path: meta });
	}

  // load locale
	function load_locale(code){
		_f.load_plugin('uppy_locale_' + code, () => { // plugin name dayjs_locale_{code}
			_o.uppy.setOptions({
			  locale: Uppy.locales[code]
			});
		}, {
			// NOT SAME NPM as main uppy! -> https://www.jsdelivr.com/package/npm/@uppy/locales
      src: ['@uppy/locales@3.2.4/dist/' + code + '.min.js']
		});
	}

	// set locale from language menu
	_f.uppy_locale = function(code){
		var new_current = supported(code) || supported(_c.lang_default) || 'en_US';
		if(new_current === current) return; // language didn't change
		current = new_current; // assign new_current
		load_locale(current);
	}

  // uppy_locales map to utility object
	// https://github.com/transloadit/uppy/tree/main/packages/%40uppy/locales/src
	var uppy_locales = { no: 'nb_NO', nn: 'nb_NO' }; // hardcode Norway fix
	['ar_SA', 'bg_BG', 'cs_CZ', 'da_DK', 'de_DE', 'el_GR', 'en_US', 'es_ES', 'es_MX', 'fa_IR', 'fi_FI', 'fr_FR', 'gl_ES', 'he_IL', 'hi_IN', 'hr_HR', 'hu_HU', 'id_ID', 'is_IS', 'it_IT', 'ja_JP', 'ko_KR', 'nb_NO', 'nl_NL', 'pl_PL', 'pt_BR', 'pt_PT', 'ro_RO', 'ru_RU', 'sk_SK', 'sr_RS_Cyrillic', 'sr_RS_Latin', 'sv_SE', 'th_TH', 'tr_TR', 'uk_UA', 'uz_UZ', 'vi_VN', 'zh_CN', 'zh_TW'].forEach(function(locale) {
		uppy_locales[locale.replace('_','-').toLowerCase()] = locale; // 'fr-fr' => 'fr_FR' // match browser nav_langs
		var single = locale.split('_')[0]; // 'fr' // get singular
		if(!uppy_locales[single]) uppy_locales[single] = locale; // 'fr' => 'fr_FR' // assign singular if not yet assigned
	});

	// LANG ON LOAD
  const supported = (code) => code ? uppy_locales[code] : false;

	// current from 1. query ?lang=en, 2. localStorage, 3. custom.locale, 4. browser navigator.languages, 5. _c.lang_default, 6. English 'en'
	var current = supported(_param('lang', true)) || supported(_ls.get('files:lang:current')) || (options.locale ? supported(options.locale.replace('_','-').toLowerCase()) : false) || (() => {
		if(_c.lang_auto && tests.nav_langs) for (var i = 0; i < tests.nav_langs.length; i++) {
			var lower = tests.nav_langs[i].toLowerCase();

			// check full xx-yy or just xx
			var full = supported(lower);
			if(full) return full;

			// check xx (if xx-yy)
			var split = lower.includes('-') ? supported(lower.split('-')[0]) : false;
			if(split) return split;
		};
	})() || supported(_c.lang_default) || 'en_US';

	// load_locale if not english default
	if(current !== 'en_US') load_locale(current);

	// close dashboard on popstate
  // instead of native option browserBackButtonClose:true which interferes with _f.get_files() push/replace
	_event(window, (e) => {
		uppy.cancelAll();//uppy.reset(); // must reset dashboard as we can't risk reloading current dir after pop
		toggle_dashboard();
	}, 'popstate');

	// open dashboard on ?upload=1 / must wait for _c.current_path to resolve after _f.init_files()
	if(_param('upload', true)) var upload_open = setInterval(() => {
		if(!_c.hasOwnProperty('current_path')) return;
		toggle_dashboard(true, _c.current_path);
		clearTimeout(upload_open)
	}, 300);
});


// files.filter.js
// functions using list.js for filter input mechanism in topbar

//
var filter = (() => {

	// private
	var current = '', // current search
			current_class = '',
			hash_timeout,
			filter_input_timeout, // filter_input_timeout
			use_input_placeholder = screen.width >= 768, // use input placeholder if screen >= 768 px (else is 100%)
			filter_live = _c.filter_live && tests.is_pointer;

	// get filter_props array from config _c.filter_props = 'name, filetype, mime, features';
	var filter_props = (function () {

		// return ['basename'] on invalid _c.filter_props
		if(!_c.filter_props || typeof _c.filter_props !== 'string') return ['basename'];

		// available for selection
		var valid = ['basename', 'filetype', 'mime', 'features', 'title', 'headline', 'description', 'creator', 'credit', 'copyright', 'keywords', 'city', 'sub-location', 'province-state'],
				arr = ['icon']; // always include icon

		// loop items
		_c.filter_props.split(',').forEach(function(item) {
			var option = item.trim().toLowerCase(); // normalize
			if(option === 'name') option = 'basename'; // replace 'name' with 'basename'
			if(!option || !valid.includes(option) || arr.includes(option)) return; // return if empty || !available || already exists
			arr.push(option);
		});

		// return
		return arr;
	}());

	// set_input_placeholder
	function set_input_placeholder(str){
		if(use_input_placeholder) _e.filter_container.dataset.input = str || ''; // set input placeholder for width
	}

	// public
	var f = {

		current: () => current,

		// create new list on new dir load
		create: function(){
			_o.list = new List(_e.files.parentElement, {});

			// create list object values
			looper(_c.file_names, function(name, i){
				//_o.list.items[i].values(_c.files[name]);
				_o.list.items[i]._values = _c.files[name]; // direct method, faster
			});
		},

		// empty list OB and files elements (anim)
		empty: function(){
			if(_o.list) _o.list.clear();
			empty(_e.files);
			if(window.scrollY) window.scroll({ top: 0 });
		},

		// list search
		filter: function(update_hash){

			// die
			if(current === _e.filter.value || !_o.list) return;

			// get filter string from input;
			current = _e.filter.value;//.replace(/#/g, '%23');

			// search and return matches
			let matches = _o.list.search(current, filter_props).length;

			// filter input update class or remove
			set_classname(_e.filter_container, (current ? `filter-${ matches ? '' : 'no' }match` : ''));

			// show info in topbar
			_f.topbar_info_search(current, matches);

			// update_hash
			if(update_hash !== false) history.replaceState(history.state || null, document.title, (current ? '#filter=' + encodeURIComponent(current) : location.pathname + location.search));

			// scroll to top
			if(window.scrollY) window.scrollTo({ top: 0 });
		},

		// filter from url#hash topbar.js init and files.js loaded (!push)
		hash: function(filter){
			var hash = _param('filter', true, true); // get #filter=filter
			if(!hash) return; // no hash
			hash = decodeURIComponent(hash); // decode
			_e.filter.value = hash; // set input val
			set_input_placeholder(hash); // set input width placeholder
			if(filter) f.filter(false); // filter without updating hash
		},

		// clear filter input, 1. with re-filter (clear button), 2. without re-filter (get_files, before loading, no need update_hash)
		clear: function(filter){
			if(!current) return; // already empty
			_e.filter.value = '';
			set_input_placeholder(); // clear input width placeholder
			if(filter) return f.filter(); // return if filter()
			current = ''; // must empty current so it's not stuck on old value
			set_classname(_e.filter_container, ''); // only if !filter, else class will be updated from filter()
		},

		// disable [empty, loading]
		disabled: function(toggle){
			if(_e.filter.disabled !== !!toggle) _e.filter.disabled = !!toggle;
		}
	}

	// on input event / use_input_placeholder &&|| filter_live
	if(use_input_placeholder || filter_live) _event(_e.filter, function(e){
		// dataset.input expander / always regardless of pointer and options
		set_input_placeholder(_e.filter.value);
		if(!filter_live) return; //
		if(filter_input_timeout) clearTimeout(filter_input_timeout);
		filter_input_timeout = setTimeout(f.filter, minmax(250, 750, _c.files_count));
	}, 'input');

	// on change/search (reset, blur, search)
	_event(_e.filter, f.filter, 'change');
	// need 'search' event also, so it triggers on native input "reset" click (without waiting for timer)
	//_event(_e.filter, f.filter, 'search'); // not necessary?
	/*if(tests.is_touch) *///_event(_e.filter, f.filter, 'blur'); // necessary on touch devices on keyboard close (does not trigger 'change')

	// return public
	return f;
})();


// files.js

// get localstorage dir key
function get_ls_key(path, mtime){
	//console.log('path(' + path + ')', '_c.current_dir.path(' + _c.current_dir.path + ')');
	if(path === '') path = 'ROOT';
	return 'files:dir:' + _c.dirs_hash + ':' + (path || _c.current_dir.path) + ':' + (mtime || _c.current_dir.mtime);
}

//
(function () {

	// vars
	var xhr = false,
			image_resize_dimensions = tests.pixel_ratio >= 1.5 && _c.image_resize_dimensions_retina ? _c.image_resize_dimensions_retina : _c.image_resize_dimensions,
			x3_render_path = _c.x3_path ? _c.x3_path + (_c.x3_path.endsWith('/') ? '' : '/') + 'render/w' + (tests.pixel_ratio >= 1.5 ? '480' : '320') + '/' : false
			image_load_errors = 0,
			image_resize_min_ratio = Math.max(_c.image_resize_min_ratio, 1);
			image_resize_types = _c.image_resize_enabled && _c.image_resize_types ? _c.image_resize_types.split(',').map(type => ({jpeg:2,jpg:2,png:3,gif:1,webp:18,bmp:6,avif:19}[type.toLowerCase().trim()])).filter(x => x) : [],
			click_window = _c.click_window && !['download', 'window'].includes(_c.click) ? _c.click_window.split(',').map(type => type.toLowerCase().trim()).filter(x => x) : [];


	// get overlay icon top left / panorama, gif, gps
	const get_overlay_icon = (item, img) => {
		let icon = item.is_pano ? 'panorama_variant' : item.browser_image === 'gif' && (item.resize || !img) ? 'gif' : item.gps ? 'marker' : false;
		return icon ? _f.get_svg_icon_class(icon, 'svg-icon files-icon-overlay') : '';
	}

	// anim
	function files_anime(show, complete){

		// current xhr abort and complete
		if(xhr) {
			xhr.abort();
			xhr = false;
			if(complete) complete();
			return;
		}

		// !transition or empty
		if(!_c.transitions || !_c.files_count){
			if(complete) complete();
			return;
		}

		// list anim opacity only
		if(_c.layout === 'list'){// || (!tests.is_pointer && _c.files_count > 50 && _c.layout === 'columns')){
			anime.remove(_e.files);
			var ob = {
			  targets: _e.files,
			  opacity: show ? [0,1] : [1,0], // force feed / show ? 1 : 0,
			  easing: 'easeOutCubic',
			  duration: show ? 300 : 150, //show ? 300 : 100 // 250
			  complete: function(){
			  	// remove opacity:0 in case !files and change layout after / will still remain hidden on load (CSS:hidden) and files removed
			  	if(!show) _e.files.style.removeProperty('opacity');
					if(complete) complete();
			  }
			}
			// ob.complete = complete;
			anime(ob);
			return;
		}

		// items anim
		//console.log('opacity', _e.files.style.opacity);

		// get visible
		var lis = _e.files.children,
				lis_length = lis.length,
				visible = [],
				inner_height = window.innerHeight;

		// loop
		for (var i = 0; i < lis_length; i++) {
			var li = lis[i],
					rect = li.getBoundingClientRect();

			// above
			if(rect.bottom < 0) continue;

			// visible
			if(rect.top < inner_height - 10){
				visible.push(li);

			// below
			} else if(_c.layout !== 'columns'){
				break;
			}
		}

		// stagger
		var stagger = Math.min(Math.round(200 / visible.length), 30);

		// anime ob
		var ob = {
		  targets: visible,
		  //scale: show ? [.95, 1] : [1, .98],
		  //translateY: show ? [-3, 0] : [0, 3],
		  opacity: show ? [0, 1] : [1, 0],
		  easing: 'easeOutQuint',
		  //duration: show ? 200 : 100,
		  duration: show ? 300 : 150,
		  delay: anime.stagger(stagger)//30//anime.stagger(100) // increase delay by 100ms for each elements.
		}
		if(complete) ob.complete = complete;

		// anime
		anime(ob);
	}

	// set page info <title>, history() and body.data-path attribute / from load and error
	function set_page_info(path, title, hist, error){

		// <title> / path / title is folder name, unless error
		set_page_title(path, title, error);

		// history
		if(hist && _c.history) history[hist + 'State']({ path: path }, title, get_pop_path(hist, path));

		//
		document.body.dataset.currentPath = path || '/';
	}

	// get pop path
	var popped = false;
	function get_pop_path(hist, path){

		// keep full url on init if query_path already in url || is ROOT (else, change ...)
		if(!popped && hist === 'replace' && (_c.query_path || !path)) return location.href;
		popped = true;

		// replace (on load):
		/*if(hist === 'replace'){
			if(_c.query_path || !path) {
				_c.query_path = false; // wtf / need to reset for fm:delete when navigating to prev
				return location.href;
			}
		}*/

		// push path || ROOT
		return path ? '?' + encodeURI(path).replace(/&/g, '%26').replace(/#/g, '%23') : '//' + location.host + location.pathname;
	}

	// item features for filter
	function item_features(item){
		// folders, files, image, square, landscape, horizontal, portrait, vertical, exif, gps, maps, iptc, title, description, keywords
		var features = item.filetype == 'dir' ? 'folders' : 'files',
				image = item.image;
		if(image){
			features += ',image';
			var width = image.width,
					height = image.height,
					exif = image.exif,
					iptc = image.iptc;
			if(width && height){
				features += width === height ? ',square' : (width > height ? ',landscape,horizontal' : ',portrait,vertical');
			}
			if(exif) {
				features += ',exif';
				if(exif.gps) features += ',gps,maps';
				features += str_looper(['Make', 'Model', 'Software'], function(item){
					if(exif[item]) return ',' + exif[item];
				});
			}
			// add iptc features
			if(iptc) features += ',iptc' + str_looper(['title', 'headline', 'description', 'creator', 'credit', 'copyright', 'keywords', 'city', 'sub-location', 'province-state'], function(key){
				if(iptc[key]) return ',' + key;
			});
		}
		// add filter for embed videos: video, youtube, vimeo
		if(item.embed) features += ',video,' + item.icon;

		item.features = features;
	}

	// is resize / check if image is resizable (resize ratio, memory, pixels)
	function is_resize(item){

		// die!
		if(!_c.image_resize_enabled || !item.dimensions || !item.mime1 || !item.image || !_c.resize_image_types.includes(item.mime1)) return;

		// start match
		var image = item.image,
				resize_ratio = Math.max(image.width, image.height) / image_resize_dimensions,
				pixels = image.width * image.height;

		// only if image.type (number) is included in image_resize_types
		if(image.type && !image_resize_types.includes(image.type)) return;

		// serve original if resize_ratio < image_resize_min_ratio (normally SMALL dimensions original), but only if filesize <= load_images_max_filesize (required for original to load) ... else just resize (likely GIF small dimensions, large file size)
		if(resize_ratio < image_resize_min_ratio && item.filesize <= _c.load_images_max_filesize) return;
		//if(resize_ratio < image_resize_min_ratio) return;

		// check vs image_resize_max_pixels
		if(_c.image_resize_max_pixels && pixels > _c.image_resize_max_pixels) return;

		// check vs memory
		if(_c.image_resize_memory_limit){
			var resize_width = image.width / resize_ratio,
					resize_height = image.height / resize_ratio,
					memory_required = (pixels * (image.bits ? image.bits / 8 : 1) * (image.channels || 3) * 1.33 + resize_width * resize_height * 4) / 1048576;
			if(memory_required > _c.image_resize_memory_limit) return;
		}

		// resize
		return true;
	}

	// files html
	function files_html(){

		// loop
		return _c.current_dir.html = str_looper(_c.file_names, function(name, i){

			// item
			var item = _c.files[name];

			// get item mime data from JS map, .mime, .mime0 and .mime1
			if(!item.is_dir) {
				if(!item.mime && item.ext) item.mime = mimes[item.ext];// || '';
				if(item.mime){
					var arr = item.mime.split('/');
					item.mime0 = arr[0];
					if(arr[1]) item.mime1 = arr[1];
				}
			}

			// assign display_name property, with name from URL if url property is set
			item.display_name = item.url ? item.url.replace(/(^https?:\/\/|\/$)/gi, '') : item.basename;

			// various image properties
			if(item.image) {

				// gps
				if(item.image.exif && item.image.exif.gps && Array.isArray(item.image.exif.gps)) item.gps = item.image.exif.gps;

				// add dimensions, even if !item.browser_image
				if(item.image.width && item.image.height) {
					item.dimensions = [item.image.width, item.image.height];
					item.ratio = item.image.width / item.image.height;
				}

				// copy IPTC properties to item root to use with filter / we can use for other stuff also, seems safe
				if(item.image.iptc) Object.assign(item, item.image.iptc);
			}

			// get <img>
			var img = (function(){

				// no file type (or dir)
				if(!item.mime1) return;

				// image
				if(item.mime0 === 'image'){

					// proceed only if browser_image
					if(!tests.browser_images.includes(item.mime1)) return;

					// store item.browser_image
					item.browser_image = item.mime1;

					// is_popup
					item.is_popup = true;

					// is_pano / we need to prepare here for 1.icon, 2.popup, 3.preload pannellum
					if(is_licensed && item.dimensions && tests.max_texture_size) {
						var is_pano = _c.config.panorama.is_pano(item, tests); // get panorama src from custom function
						if(is_pano) {
							item.is_pano = is_pano;
							_c.current_dir.has_pano = true;
						}
					}

					// only proceed with <img> if _c.load_images && item.is_readable
					if(!_c.load_images || !item.is_readable) return;

					// vars
					var resize = false,
							img_class = 'files-img files-img-placeholder files-lazy';

					// svg
					if(item.browser_image === 'svg+xml' || item.ext === 'svg') {

						// svg exceeds _c.config.load_svg_max_filesize
						if(item.filesize > _c.config.load_svg_max_filesize) return;

						// img-svg class
						img_class += ' files-img-svg';

					// all images except svg
					} else {

						// check if image should serve resized
						if(is_resize(item)) resize = item.resize = image_resize_dimensions;

						// die if !resize && filesize > load_images_max_filesize
						if(!resize && item.filesize > _c.load_images_max_filesize) return;

						// img-ico class
						if(item.ext === 'ico') img_class += ' files-img-ico';

						// get preview_dimensions and preview_ratio
						if(item.dimensions){
							item.preview_dimensions = resize ? (item.ratio > 1 ? [resize, Math.round(resize / item.ratio)] : [Math.round(resize * item.ratio), resize]) : [item.image.width, item.image.height];
							item.preview_ratio = item.preview_dimensions[0] / item.preview_dimensions[1];
						}
					}

					// <img>
					return '<img class="' + img_class + '" data-src="' + function(){

						// x3 render
						//if(x3_render_path) return x3_render_path + encodeURI(item.path);
						if(x3_render_path && item.url_path) {
							var render_path = item.url_path.match(/\/content\/(.+)/); // item.url_path.match(/(?<=content\/).+$/);
							if(render_path) return x3_render_path + encodeURI(render_path.pop());
						}

						// files pre-cached resize
						if(resize && item.image['resize' + resize]) return encodeURI(item.image['resize' + resize]);

						// direct if !resize && !proxy && url_path / old:html_quotes(item.url_path);
						if(!resize && !_c.load_files_proxy_php && item.url_path) return encodeURI(item.url_path).replace(/#/g, '%23');

						// run from PHP script, with our without resize
						var hash = item.mtime + '.' + item.filesize;
						return _c.script + '?file=' + encodeURIComponent(item.path) + (resize ? '&resize=' + resize + '&' + _c.image_cache_hash + '.' + hash : '&' + hash);
					}() + '"' + (item.preview_dimensions ? ' width="' + item.preview_dimensions[0] + '" height="' + item.preview_dimensions[1] + '"' : '') + '>';

				// video / why is this inside anon function here? ... less checkups, because !image
				} else if(item.mime0 === 'video'){

					// is_browser_video / item.is_popup
					if(is_browser_media('video', item)){
						item.is_browser_video = true;
						if(_c.popup_video) item.is_popup = true;
					}

					// video_thumbs_enabled (compiled from multiple settings) && item.is_readable
					if(_c.video_thumbs_enabled && item.is_readable) {

						// locked preview image options for thumbnails
						item.preview_dimensions = [480, 320];
						item.preview_ratio = 1.5; // item.preview_dimensions[0] / item.preview_dimensions[1];

						// return <img> html
						// todo: item.image.resize480 image_resize_cache_direct for video also?
						return `${ item.is_browser_video ? _f.get_svg_icon_class('play', 'svg-icon svg-overlay-play') : '' }<img class="files-img files-img-placeholder files-lazy" data-src="${ _c.script }?file=${ encodeURIComponent(item.path) }&resize=video&${ _c.image_cache_hash }.${ item.mtime }.${ item.filesize }"${ item.preview_dimensions ? ` width="${ item.preview_dimensions[0] }" height="${ item.preview_dimensions[1] }"` : '' }>`;
					}

				// get embed Youtube and Vimeo
				} else if(item.url) {
					return get_embed(item);
				}
			}());

			// populate item.features
			item_features(item);

			// append sort_name and edit mtime if DateTimeOriginal
			// item.sort_name = item.basename.toLowerCase();
			// todo: item.sort_date instead? mtime should remain original
			if(item.DateTimeOriginal) item.mtime = item.DateTimeOriginal;

			// return html / get_href() gets app-link for dirs and direct link for files

			// ${ item.preview_ratio ? ' style="--ratio:' + item.preview_ratio + '"' : '' }
			//--type-pdf

			//
			return `<a href="${ get_href(item, _c.click === 'download') }" target="_blank" class="files-a files-a-${ (img ? 'img' : 'svg') + (item.url ? ' files-a-url' : '') }" style="${ _f.get_type_color(item) }${ item.preview_ratio ? ';--ratio:' + item.preview_ratio : '' }" data-name="${ html_quotes(item.basename) }"${ !item.is_dir && _c.click === 'download' ? ' download' : '' }>${ (img || _f.get_svg_large(item, 'files-svg')) }
				<div class="files-data">
					${ get_map_link.span(item.gps, 'gps') }
					<span class="name" title="${ html_quotes(item.display_name) }">${ html_tags(item.display_name) }</span>
					${ item.image && item.image.iptc && item.image.iptc.title ? get_span(a_to_span(item.image.iptc.title), 'title') : '' }
					${ _f.get_svg_icon_files_layout(item) }
					${ get_dimensions(item.dimensions, 'dimensions') }
					${ get_filesize(item, 'size') }
					${ get_exif(item.image, 'exif', 'span') }
					${ get_span(item.ext ? get_span(item.ext, 'ext-inner') : '', 'ext') }
					${ get_span(_f.get_time(item, 'L LT', true, false), 'date') }
					<span class="flex"></span>
				</div>
				${ get_overlay_icon(item, img) }
				${ get_context_button(_c.click !== 'menu' || item.is_dir, 'files-context', true) }
				${ get_folder_preview(item) }
			</a>`;

			/*return '<a href="' + get_href(item, _c.click === 'download') + '" target="_blank" class="files-a files-a-' + (img ? 'img' : 'svg') + (item.url ? ' files-a-url' : '') + '"' + (item.preview_ratio ? ' style="--ratio:' + item.preview_ratio + '"' : '') + ' data-name="' + html_quotes(item.basename) + '"' + (!item.is_dir && _c.click === 'download' ? ' download' : '') + '>' +
							(img || _f.get_svg_large(item, 'files-svg')) +
							'<div class="files-data">' +
								get_map_link.span(item.gps, 'gps') +
								'<span class="name" title="' + html_quotes(item.display_name) + '">' + html_tags(item.display_name) + '</span>' +
								(item.image && item.image.iptc && item.image.iptc.title ? get_span(a_to_span(item.image.iptc.title), 'title') : '') +
								get_span(_f.get_svg_icon_files(item), 'icon') +
								get_dimensions(item.dimensions, 'dimensions') +
								get_filesize(item, 'size') +
								get_exif(item.image, 'exif', 'span') +
								get_span(item.ext ? get_span(item.ext, 'ext-inner') : '', 'ext') +
								get_span(_f.get_time(item, 'L LT', true, false), 'date') +
								'<span class="flex"></span>' +
							'</div>' +
							get_overlay_icon(item) + // must be after <img> which must be firstChild
							get_context_button(_c.click !== 'menu' || item.is_dir, 'files-context', true) +
							get_folder_preview(item) +
							'</a>';*/
		});
	}

	// loaded
	function loaded(path, hist, msg){

		//
		_license();

		// reset image load errors
		image_load_errors = 0;

		// dir
		_c.current_dir = _c.dirs[path];

		// current files ob
		_c.files = _c.current_dir.files;// || files || {};

		// log
		_log(msg + ' :', path, _c.current_dir);

		// current file paths array
		_c.file_names = Object.keys(_c.files);

		// current files count
		_c.files_count = _c.file_names.length;

		// set page info <title>, history() and body.data-path attribute / (path, title, hist)
		set_page_info(path, _c.current_dir.basename, hist);

		// set breadcrumbs INFO (amount + size) after loaded
		_f.breadcrumbs_info();

		// warning
		if(!_c.files_count) _f.topbar_info(_f.get_svg_icon('alert_circle_outline') + '<span data-lang="directory is empty">' + lang.get('directory is empty') + '</span>', 'warning');

		// filter disabled
		filter.disabled(!_c.files_count);

		// toggle sortbar visibility (will be hidden for some layouts regardless) / no point and causes inconsistent layout
		//toggle_hidden(_e.sortbar, !_c.files_count);

		// early return if !files (list and files already removed)
		if(!_c.files_count) return;

		// inject html
		_e.files.innerHTML = _c.current_dir.html || files_html();

		// load pano
		if(_c.current_dir.has_pano) _f.load_plugin('pannellum');

		// new filter
		filter.create();

		// check #filter from hash if !push
		if(hist !== 'push') filter.hash(true);

		// set custom sort (after potential filter query, before anim and open #hash)
		_f.set_sort();

		// history_scroll if !hist (onpopstate) / _c.config.history_scroll / must go after set_sort()
		if(!hist && _c.current_dir.scroll && _c.current_dir.scroll.y && _c.current_dir.scroll.h == document.body.scrollHeight){
			// _o.headroom.unpin(); pin/freeze/unpin/unfreeze/ hmm....
			window.scrollTo(0, _c.current_dir.scroll.y);
		}

		// animate list only if ![first load] || !open #hash (only runs on first load)
		if(hist !== 'replace' || !open_hash(path)) files_anime(true);
	}

	// get files
	_f.get_files = (path, hist, reload) => {

		// current path / todo
		if(!reload && path === _c.current_path) return;
		_c.current_path = path;

		// remember scroll position / always store height to match before triggering scrollto() after onpopstate
		if(_c.config.history_scroll && _c.current_dir) _c.current_dir.scroll = {
			y: window.scrollY,
			h: document.body.scrollHeight
		};

		// clear topbar-info / set info-hidden and remove type classes
		_e.topbar_info.className = 'info-hidden';
		// clear filter (without re-filter())
		filter.clear();

		// set breadcrumbs even before loading
		if(!reload) _f.set_breadcrumbs(path);

		// menu active
		if(!reload && _c.menu_exists) _f.set_menu_active(path);

		// dir
		var dir = _c.dirs[path];

		// CACHE
		if(!reload && dir){

			// cache JS
			if(dir.files){ // files could be empty array[] but will still succeed
				return files_anime(false, function(){
					filter.empty();
					loaded(path, hist, 'files from JS');
				});

			// cache localStorage
			} else {
				var ls_files = _ls.get_json(get_ls_key(path, dir.mtime));
				if(ls_files) {
					set_dir(path, ls_files);
					return files_anime(false, function(){
						filter.empty();
						loaded(path, hist, 'files from localStorage');
					});
				}
			}
		}

		// LOAD

		// only disable filter if loading, else is pointless to thrash enabled/disabled. Get's toggled from loaded()
		filter.disabled(true);

		// set menu loading
		if(_c.menu_exists) _f.menu_loading(false, true);
		//_e.topbar.classList.add('topbar-spinner');
		_e.files_container.classList.add('files-spinner');

		// ajax
		var counter = 0,
				json_cache = dir && dir.json_cache ? dir.json_cache : false;
		function ajax_complete(msg){
			if(counter++ === 1) loaded(path, hist, json_cache ? 'files from JSON ' + json_cache : 'files from xmlhttp');
		}

		// anime out
		files_anime(false, function(){
			filter.empty();
			ajax_complete();
		});

		// new xhr
		xhr = ajax_get({
	  	params: json_cache ? false : 'action=files&dir=' + encodeURIComponent(path),
	  	url: json_cache,
	  	json_response: true,
	  	fail: () => {
	  		load_error(path, path, hist);
	  	},
	  	always: () => {
	  		xhr = false; // !xhr
	  		if(_c.menu_exists) _f.menu_loading(false, false); // remove current menu spinner
	  		//_e.topbar.classList.remove('topbar-spinner'); // remove topbar-spinner
				_e.files_container.classList.remove('files-spinner');
	  	},
	  	complete: function(files, response, is_json){

	  		// fail if !json/empty || files.error
	  		if(!is_json) return load_error(path, path, hist);
	  		if(files.error) return load_error(files.error + ' ' + path, path, hist);

				// JS dir.files
				set_dir(path, files);

				// localStorage
				_ls.set(get_ls_key(path, files.mtime), response, false, 1000); // prop, val, toggle, timer

				// loaded
				ajax_complete();
	  	}
	  });
	}

	// get and extend dir
	function set_dir(path, ob){

		// new path / !menu || menu !loaded || exists outside of menu
		if(!_c.dirs[path]) return _c.dirs[path] = ob || {};

		// empty ob return current / should never apply
		if(!ob) return _c.dirs[path];

		// [current is newer than ob] merge current into new / should never apply, unless json file loaded
		if(_c.dirs[path].mtime > ob.mtime) return _c.dirs[path] = Object.assign(ob, _c.dirs[path]);

		// [default] merge new into current
		return Object.assign(_c.dirs[path], ob);
	}

	// load error
	function load_error(msg, path, hist){
		//toggle_hidden(_e.sortbar, true); // always hide sortbar on error / no point, and causes inconsistent layout
		_f.topbar_info(_f.get_svg_icon('alert_circle_outline') + '<strong data-lang="error">' + lang.get('error') + '</strong>' + (msg ? ': ' + msg : '.'), 'error');
		// set page info <title>, history() and body.data-path attribute / (path, title, hist)
		set_page_info(path, lang.get('error') + (msg ? ': ' + msg : '.'), hist, true);
	}

	// init files
	_f.init_files = function(){

		// query path from PHP
		if(_c.query_path) {
			if(_c.query_path_valid) return _f.get_files(_c.query_path, 'replace');
			return load_error('Invalid directory ' + _c.query_path, _c.query_path, 'replace');

		// in case of non-PHP index.html
		} else if(location.search){

			// get ?path
			var search_path = location.search.split('&')[0].replace('?', '');
			if(search_path && search_path !== 'debug' && (search_path.indexOf('=') === -1 || search_path.indexOf('/') > -1)){

				// re-assign _c.query_path
				_c.query_path = decodeURIComponent(search_path);

				// check if path is root_child (_c.dirs[''].files[_c.query_path]), allows localStorage checkup
				var root_child = !_c.dirs[_c.query_path] && search_path.indexOf('/') === -1 && _c.dirs[''] && _c.dirs[''].files ? _c.dirs[''].files[_c.query_path] : false;

				// assign root_child to _c.dirs[] for mtime/localStorage
				if(root_child && root_child.is_dir) set_dir(_c.query_path, root_child);

				// return _c.query_path
				return _f.get_files(_c.query_path, 'replace');
			}
		}

		// !query / load _c.init_path (start_path || root)
		_f.get_files(_c.init_path, 'replace');
	}


	// EVENTS

	// files info clicks
	actions(_e.topbar_info, function(action, e){

		// clear and re-filter
		if(action === 'reset') return filter.clear(true);
	});

	// check login
	function check_login(){
		if(_c.has_login) ajax_get({ params: 'action=check_login', json_response: true });
	}

	/* add optional dblclick event if single click set to "select"
	// also add keyboard shortcuts click
	_event(_e.files, function(e){
		console.log('dblclick');
	}, 'dblclick');*/

	// files click
	_event(_e.files, function(e){

		// hmm desktop click (!.files-a)
		//return _f.create_contextmenu(e, 'files', _e.files_container, _c.current_dir);
		//e.preventDefault();
		//return;

	  // define clicked target
	  const clicked = e.target;

		// return if click is container
		if(clicked === _e.files) return;

		// get clicked link
		var a = clicked.closest('.files-a'),
				item = a ? _c.files[a.dataset.name] : false;

		// no item / wtf
		if(!item) return; // should not happen, but then just allow passthru

		// context button / already includes e.preventDefault() for the passed e
	  if(clicked.classList.contains('context-button')) return _f.create_contextmenu(e, 'files', clicked, item, a);

	  // block any clicks (except other contextmenu) if contextmenu is open
	  if(_o.contextmenu.is_open && (_c.click !== 'menu' || item.is_dir)) return e.preventDefault();

	  // data-href (google maps) open window
		if(clicked.dataset.href){
			e.preventDefault();
			return window.open(clicked.dataset.href);
			//return _h.popup(e, 1000, 600, clicked.dataset.href, item.basename);
		}

		// open window / if click === window || click_window includes item extension
		// will open in new window for filetypes supported by browser, else will prompt download
		// also works for .url files if included in click_window array
		if(!item.is_dir && (_c.click === 'window' || (item.ext && click_window.includes(item.ext)))) {

			// click_window_popup
			if(_c.click_window_popup) return _h.popup(e, 1000, null, a.href, item.basename);
			// always return
			return;
		}

		// click === 'download' passthru
		if(!item.is_dir && _c.click === 'download') return;

		// if item.url passthru (will first check if click_window.includes('url') above). Bypass if embed, because we open in modal
		if(item.url && !item.embed) return;

	  // allow <a href> click event with meta keys, else e.preventDefault() and disregard and HREF
		// includes e.preventDefault();
	  if(allow_href(e, a)) return;

		// embed (youtube and vimeo) / should come after click_window and allow_href()
		if(item.embed) return _f.open_modal(item, true);
		/*var w = Math.max(Math.min(screen.availWidth * .8, 1000), 640); // 80% screen width, min 640, max 1000
		var h = w * 0.5625;
		return _h.popup(e, w, h, item.embed, item.basename);*/

		// block default click event <> for all following _c.click functions
		e.preventDefault();

		// dir always open
		if(item.is_dir){
			set_dir(item.path, item);
			_f.get_files(item.path, 'push');

		// contextmenu
		} else if(_c.click === 'menu'){
			_f.create_contextmenu(e, 'files', a, item);

		// popup
		} else if(_c.click === 'popup' && item.is_popup && item.is_readable) {
			if(tests.is_pointer) class_timer(a, 'files-data-hidden', null, 300); // temporarily hide caption (see grid.scss)
	  	_f.open_popup(item);

	  // modal
	  } else {
	  	_f.open_modal(item, true);
	  }
	});

	// prevent scroll scheit on iOS
	history.scrollRestoration = 'manual';
}());


// files.layout.js

//
(() => {

	// layouts object
	var layouts = {
		list: {},
		imagelist: {},
		blocks: {
			contain: true
		},
		grid: {
			contain: true,
			size: {
				default: 160,
				min: 80,
				max: 240
			}
		},
		rows: {
			size: {
				default: 150,
				min: 80,
				max: 220
			}
		},
		columns: {
			size: {
				default: 180,
				min: 120,
				max: 240
			}
		}
	}

	// function to set_files_classname on layout change and layouts toggle / assigned on start below
	const set_files_classname = (layout) => {
		let l = layout || current.layout;
		set_classname(_e.files, `no-transition-strict list files-${ l }${ l === 'columns' ? ` columns-${ columns_type }` : '' }`);
		// block transitions on layout change (remove no-transition-strict class added above after 1 ms)
		wait(10).then(() => _e.files.classList.remove('no-transition-strict'));
	}

	// create array keys from layouts
	var keys = Object.keys(layouts);

	// from ?layout param, make sure param is included in keys
	let param = _param('layout', true);
	if(param && keys.includes(param)) {
		_c.layout = param;

	// else make sure initial layout from config or localStorage exists / applies for sort.js and files.js animations also
	} else if(!keys.includes(_c.layout)) {
		_c.layout = 'rows';
	}

	// prepare initial columns_type from localStorage
	let columns_type = _ls.get('files:layout:columns-type') || 'info';

	// immediately set new layout class if is !default (for example comes from localStorage)
	set_files_classname(_c.layout);

	// img_object_fit (grid and blocks layouts)
	// get default value from computedStyle() or default 'cover'
	var img_object_fit_default = getComputedStyle(_e.files).getPropertyValue('--img-object-fit').trim() || 'cover';
	// set current value from localStorage or default
	var img_object_fit = _ls.get('files:interface:img-object-fit') || img_object_fit_default;
	// if current value does not equal default, setProperty()
	if(img_object_fit != img_object_fit_default) _e.files.style.setProperty('--img-object-fit', img_object_fit);

	// toggle imagelist square layout
	function toggle_imagelist_square(){
		_e.files.style.setProperty('--imagelist-height', (imagelist_square ? '100px' : '100%'));
		_e.files.style[(imagelist_square ? 'set' :'remove') + 'Property']('--imagelist-min-height', 'auto');
	}

	// get imagelist_square
	var imagelist_square = _ls.get('files:layout:imagelist-square');
	if(imagelist_square === null) imagelist_square = getComputedStyle(_e.files).getPropertyValue('--imagelist-height').trim() !== 'auto';
	toggle_imagelist_square(); // immediately toggle imagelist square vars in layout

	// populate size.current from localstorage, else set default. Set vars if !default
	['grid', 'rows', 'columns'].forEach(function(layout) {

		// shortcut
		var size = layouts[layout].size;

		// change default if --{layout}-size assign in CSS
		var def = getComputedStyle(_e.files).getPropertyValue('--' + layout + '-size');
		if(def) size.default = parseInt(def);

		// get and set current [layout] size from localStorage, setProperty() if !deffault
		size.current = (function () {
			var ls = _ls.get('files:layout:' + layout + '-size');
			if(!ls || isNaN(ls) || ls == size.default) return size.default;
			ls = minmax(size.min, size.max, ls);
			_e.files.style.setProperty('--' + layout + '-size', ls + 'px');
			return ls;
		}());

		// get and set current [layout] space-factor from localStorage, setProperty() if !deffault, border-radius:0
		size.space = (function () {
			var ls = _ls.get('files:layout:' + layout + '-space-factor');
			if(!ls || isNaN(ls) || ls == 50) return 50;
			ls = minmax(0, 100, ls);
			_e.files.style.setProperty('--' + layout + '-space-factor', ls);
			if(ls == 0) _e.files.style.setProperty('--' + layout + '-border-radius', 0);
			return ls;
		}());
	});

	// function to populate current layout object
	function set_current(layout){
		return {
			layout: layout,
			ob: layouts[layout],
			index: keys.indexOf(layout)
		}
	}

	// immediately populate current object from _c.layout
	var current = set_current(_c.layout);

	// set layout interface options (sizer, cover)
	function set_layout_options(){

		// shortcut
		var ob = current.ob;

		// toggle display of options depending on layout
		[
			[layout_options, (current.layout === 'imagelist' || ob.size || ob.contain)],	// toggle main layout
			[layout_sizer, ob.size], 																											// toggle sizer
			[layout_spacer, ob.size], 																										// toggle spacer
			[layout_aspect, current.layout === 'grid'], 																	// toggle aspect
			[cover_toggle, ob.contain], 																									// toggle cover_toggle
			[imagelist_square_toggle, current.layout === 'imagelist'], 										// toggle imagelist_square_toggle
			[columns_info_toggle, current.layout === 'columns']
		].forEach((arr) => {
			if(!!arr[0].style.display == !!arr[1]) arr[0].style.display = arr[1] ? '' : 'none'; // change display
		});

		// layout sizer properties
		if(ob.size) {
			if(ob.size.min) layout_sizer_range.min = ob.size.min;
			if(ob.size.max) layout_sizer_range.max = ob.size.max;
			if(ob.size.default) {
				layout_sizer_default_option.value = ob.size.default;
				layout_sizer_range.style.setProperty('--range-default-pos', (ob.size.default - ob.size.min) / (ob.size.max - ob.size.min)); // set var for default value:before indicator
			}
			lang.set(layout_sizer_label_type, current.layout);
			layout_sizer_range.value = ob.size.current; // set value after min/max/default adjusted

			// spacer
			lang.set(layout_spacer_label_type, current.layout);
			layout_spacer_range.value = ob.size.space;
		}
	}

	// ADD TEMPLATE
	var el = _id('change-layout');
	el.innerHTML = `<button type="button" class="button-icon">${ _f.get_svg_icon('layout_' + current.layout) }</button><div class="dropdown-menu dropdown-menu-topbar"><span class="dropdown-header" data-lang="layout">${ lang.get('layout') }</span><div class="dropdown-items">${ str_looper(keys, (key) => {
		return `<button class="dropdown-item${ (key === current.layout ? ' active' : '') }" data-action="${ key }">${ _f.get_svg_icon('layout_' + key) }${ lang.span(key) }</button>`;
	}) }</div><div id="layout-options"><div id="layout-sizer"><label for="layout-sizer-range" class="layout-range-label"><span data-lang="size">${ lang.get('size') }</span><span data-lang="${ current.layout }" class="layout-label-type">${ lang.get(current.layout) }</span></label><input type="range" class="form-range" id="layout-sizer-range" value="200" min="100" max="300" list="layout-size-default"><datalist id="layout-size-default"><option value="200"></datalist></div><div id="layout-spacer"><label for="layout-spacer-range" class="layout-range-label"><span data-lang="space">${ lang.get('space') }</span><span data-lang="${ current.layout }" class="layout-label-type">${ lang.get(current.layout) }</span></label><input type="range" class="form-range" id="layout-spacer-range" value="50" min="0" max="100" list="layout-space-default"><datalist id="layout-space-default"><option value="50"></datalist></div><div id="layout-aspect"><label for="layout-aspect-range" class="layout-range-label"><span class="layout-aspect-ratio">1:1</span><span data-lang="grid" class="layout-label-type">${ lang.get('grid') }</span></label><input type="range" class="form-range" id="layout-aspect-range" value="50" min="0" max="100" list="layout-aspect-default"><datalist id="layout-aspect-default"><option value="50"></datalist></div><label class="checkbox-label"><input class="checkbox" type="checkbox" id="covertoggle"${ (img_object_fit === 'cover' ? ' checked' : '') }>${ lang.span('uniform') }</label><label class="checkbox-label"><input class="checkbox" type="checkbox" id="imagelistsquare"${ (imagelist_square ? ' checked' : '') }>${ lang.span('uniform') }</label><label class="checkbox-label"><input class="checkbox" type="checkbox" id="columnsinfo"${ (columns_type === 'info' ? ' checked' : '') }>${ lang.span('details') }</label></div>`;

	// elements
	var button = el.firstElementChild,
			dropdown_menu = el.lastElementChild,
			dropdown_items_container = dropdown_menu.children[1],
			dropdown_items = dropdown_items_container.children,
			layout_options = dropdown_menu.children[2],

			// sizer
			layout_sizer = layout_options.firstElementChild,
			layout_sizer_label_type = layout_sizer.firstElementChild.lastElementChild,
			layout_sizer_range = layout_sizer.children[1],
			layout_sizer_default_option = layout_sizer.children[2].lastElementChild,

			// spacer
			layout_spacer = layout_options.children[1],
			layout_spacer_label_type = layout_spacer.firstElementChild.lastElementChild,
			layout_spacer_range = layout_spacer.children[1],

			// aspect (grid only)
			layout_aspect = layout_options.children[2],
			// layout_aspect_label_type = layout_aspect.firstElementChild.lastElementChild, / no need because is always grid
			layout_aspect_range = layout_aspect.children[1];

			// cover toggle
			cover_toggle = layout_options.children[3],
			cover_toggle_input = cover_toggle.firstElementChild,

			// imagelist square
			imagelist_square_toggle = layout_options.children[4],
			imagelist_square_toggle_input = imagelist_square_toggle.firstElementChild,

			// columns info
			columns_info_toggle = layout_options.children[5],
			columns_info_toggle_input = columns_info_toggle.firstElementChild;


	// layout helper functions

	// set CSS vars property
	const set_property = (type, val, e) => {
		if(e.type === 'input' && _c.files_count > max_files) return;
		if(e.type === 'change') {
			_ls.set('files:layout:' + current.layout + '-' + type, e.currentTarget.value); // store value as localStorage
			if(_c.files_count <= max_files) return;
		}
		_e.files.style.setProperty('--' + current.layout + '-' + type, val);
	}
	// set size px
	const set_size = (e) => set_property('size', layout_sizer_range.value + 'px', e);
	// get aspect values from 2 (wide) to 0.5 (tall)
	const get_aspect = (v) => v < 50 ? 2 - v / 50 : 1.5 - v / 100;
	// set aspect shortcut
	//const set_aspect = (e) => set_property('aspect', get_aspect(layout_aspect_range.value), e);
	const set_aspect = (e) => {
		var aspect = get_aspect(layout_aspect_range.value);
		set_property('aspect', aspect, e);
		set_aspect_label(aspect);
	};
	//
	const set_aspect_label = (a) => {
		var rounded = Math.round((a > 1 ? a : 1/a) * 10) / 10; // math depending on dir ><1
		layout_aspect.firstElementChild.firstElementChild.textContent = a > 1 ? rounded + ':1' : '1:' + rounded;
	}
	// set space shortcut
	const set_space = (e) => set_property('space-factor', layout_spacer_range.value, e);
	// set aspect from localStorage
	// only needs to be set once (grid only), but needs to be here to set layout_aspect_range.value after element is created
	(() => {
		var ls = _ls.get('files:layout:grid-aspect');
		if(!ls || isNaN(ls) || ls == 50) return; // return if un-assigned or isNaN() or is default
		ls = minmax(0, 100, ls); // make sure it's 0-100
		layout_aspect_range.value = ls; // set layout_aspect_range.value
		var aspect = get_aspect(ls);
		_e.files.style.setProperty('--grid-aspect', aspect); // set --grid-aspect
		set_aspect_label(aspect);
	})();

	// always set layout options after interface is rendered
	set_layout_options();

	// prepare max_files value for live resizing on input (live) or change / 100 if mobile
	const max_files = tests.is_pointer ? 200 : 100;

	// size input <= max_files
	_event(layout_sizer_range, set_size, 'input');
	// sizer change > max_files / store ob.size.current and set localStorage
	_event(layout_sizer_range, (e) => {
		set_size(e);
		current.ob.size.current = layout_sizer_range.value;
	}, 'change');

	// aspect input <= max_files files
	_event(layout_aspect_range, set_aspect, 'input');
	// aspect change > max_files / set localStorage
	_event(layout_aspect_range, set_aspect, 'change');

	// spacer input <= max_files
	_event(layout_spacer_range, set_space, 'input');
	// spacer change  > max_files / store ob.size.space, set border-radius and localStorage
	_event(layout_spacer_range, (e) => {
		set_space(e);
		var space = current.ob.size.space = layout_spacer_range.value; // store in object and create shortcut
		_e.files.style[(space > 0 ? 'remove' : 'set') + 'Property']('--' + current.layout + '-border-radius', 0); // border-radius 0 space
	}, 'change');

	// covertoggle input change
	_event(cover_toggle_input, (e) => {
		img_object_fit = cover_toggle_input.checked ? 'cover' : 'contain';
		if(img_object_fit == img_object_fit_default){
			_e.files.style.removeProperty('--img-object-fit');
			_ls.remove('files:interface:img-object-fit');
		} else {
			_e.files.style.setProperty('--img-object-fit', img_object_fit);
			_ls.set('files:interface:img-object-fit', img_object_fit);
		}
	}, 'change');

	// imagelist_square toggle checkbox
	_event(imagelist_square_toggle_input, (e) => {
		imagelist_square = imagelist_square_toggle_input.checked;
		toggle_imagelist_square(); // set vars to _e.files
		_ls.set('files:layout:imagelist-square', imagelist_square); //
	}, 'change');


	// columns info toggle input
	_event(columns_info_toggle_input, (e) => {
		columns_type = columns_info_toggle_input.checked ? 'info' : 'noinfo';
		_ls.set('files:layout:columns-type', columns_type);
		set_files_classname();
	}, 'change');

	// change layout (from dropdown option or cycle)
	function change_layout(layout){

		// die
		if(current.layout === layout) return;

		// toggle dropdown button icon
		button.innerHTML = _f.get_svg_icon('layout_' + layout);

		// remove current active dropdown
		dropdown_items[current.index].classList.remove('active');

		// populate current object from layout
		current = set_current(layout);

		// new active dropdown
		dropdown_items[current.index].classList.add('active');

		// set interface layout options
		set_layout_options();

		// change to new layout class
		set_files_classname();

		// sortbar class (visible on list and imagelist list)
		_e.sortbar.className = 'sortbar-' + layout;

		// _c config + localstorage
		_f.set_config('layout', layout); // sets both _c.config and files:config:layout
	}

	// dropdown items click action
	actions(dropdown_items_container, change_layout);

	// click cycle button // function() only runs if click==mouse
	_f.dropdown(el, button, () => {
		change_layout(keys[current.index >= keys.length - 1 ? 0 : current.index + 1]);
	});
})();



// files.popup.js

/* TODO FUTURE
- improved captions exif/iptc/gps ... Move to flat object?
- caption templating like embed.photo.gallery?
*/

//
(() => {

	// Global access + transitions
	const _p = _o.popup = {
		transitions: {
			glide: (dir) => {
				return {
					translateX: [10 * dir, 0],
				  opacity: [.1, 1],
				  duration: 500,
				  easing: 'easeOutQuart'
				}
			},
			fade: (dir) => {
				return {
				  opacity: [.1, 1],
				  duration: 400,
				  easing: 'easeOutCubic'
				}
			},
			zoom: (dir) => {
				return {
				  scale: [1.05, 1],
				  opacity: [.1, 1],
				  duration: 500,
				  easing: 'easeOutQuint'
				}
			},
			pop: (dir) => {
				return {
					scale: {
						value: [.9, 1],
					  duration: 600,
					  easing: 'easeOutElastic'
					},
					opacity: {
					  value: [0, 1],
					  duration: 400,
					  easing: 'easeOutCubic'
					},
					duration: 600
				}
			},
			elastic: (dir) => {
				return {
					translateX: {
						value: [50 * dir, 0],
						duration: 600,
				  	easing: 'easeOutElastic'
					},
				  opacity: {
				    value: [.1, 1],
				    duration: 500,
				    easing: 'easeOutQuart'
				  },
					duration: 600
				}
			},
			wipe: (dir) => {
				return {
					translateX: [10 * dir, 0],
				  opacity: [.1, 1],
				  //clipPath: ['inset(0% 50%)', 'inset(0% 0%)'],
				  clipPath: [dir > 0 ? 'inset(0% 25% 0% 65%)' : 'inset(0% 65% 0% 25%)', 'inset(0% 0% 0% 0%)'],
				  scale: [1.05, 1],
				  duration: 500,
				  easing: 'easeOutQuint'
				}
			}
		},
		playing: false, // global
		timer: false // global
	};

	// assign custom transitions object
	//if(typeof transitions == 'object') Object.assign(_p.transitions, transitions);

	// public local vars (don't need to assign to photoswipe options)
	/*var caption_hide = _c.hasOwnProperty('popup_caption_hide') ? _c.popup_caption_hide : true,
			caption_style = _c.popup_caption_style && ['block', 'box', 'subtitles', 'gradient', 'topbar', 'none'].includes(_c.popup_caption_style) ? _c.popup_caption_style : 'block'; // block, box, subtitles, gradient, topbar, none
			caption_align = _c.popup_caption_align && ['left', 'center-left', 'center', 'right'].includes(_c.popup_caption_align) ? _c.popup_caption_align : 'center-left'; // left, center-left, center, right*/

	// private vars (don't need to assign to photoswipe options
	let mygallery,
			locked_caption = _ls.get('files:popup:locked_caption'),
			caption_transition = 333,
			caption_timer,
			date_format = screen.width < 375 ? 'll' : (screen.width < 414 ? 'lll' : 'llll'),
			date_relative = screen.width >= 576,
			current_matchingItems; // compare with _o.list.matchingItems changes

	// photoswipe default options
	const default_options = {

		// native Files options version 0.3.2
		caption_hide: true,
		caption_style: 'gradient', // 'block, box, subtitles, gradient, topbar, none
		caption_align: 'center-left', // left, center-left, center, right

		//
		//captionEl: true,//_c.hasOwnProperty('popup_caption') ? _c.popup_caption : true, //true,
		click: 'prev_next', // prev_next, next, zoom
		// zoomEl: true,
		downloadEl: !tests.is_pointer, // applies contextmenu if pointer
		mapEl: false, // disable, because is available in contextmenu and caption
		// playEl: true,
		//transition: _c.popup_transition || 'glide', //'glide',
		//play_transition: _c.popup_transition_play && _c.popup_transition_play != 'inherit' ? _c.popup_transition_play : (_c.popup_transition || 'glide'),
		// bgOpacity: 0.95, // default 1
		play_interval: 5000,//!_c.hasOwnProperty('popup_interval') || isNaN(_c.popup_interval) ? 5000 : Math.max(_c.popup_interval, 1000),
    // loop: true,
		history: _c.history, // inherit from config history

		// pswp.currItem.initialZoomLevel
		// is 1 by default (original)
		// https://photoswipe.com/documentation/options.html
		// maxSpreadZoom: 1 / tests.pixel_ratio,

		// video
		video_autoplay: false,
		video_autoplay_clicked: true,
		//
	  getDoubleTapZoom: () => {
	  	_p.toggle_play(false);
	  	return 1;
	  },
		getThumbBoundsFn: (index, out) => {

			// vars
    	var slide = mygallery.items[index];//,
					// img from modal (only if modal image is current popup open/close item) || slide
    			img = _o.modal.open ? (_o.modal.item === slide.item ? _class('modal-image', _o.modal.el.preview)[0] : false) : slide.img_el;

    	// required: width, height, msrc, img_el, offsetParent (img not hidden)
    	if(!slide.w || !slide.h || !slide.msrc || !img || !img.offsetParent) return out ? toggle_showHideOpacity(true) : false;

    	// rect
    	var rect = img.getBoundingClientRect();

    	// out: die if !inViewport || make sure !showHideOpacity (prepare for thumb zoom out)
    	if(out){
    		if(rect.bottom < 0 || rect.top > window.innerHeight) return toggle_showHideOpacity(true);
    		toggle_showHideOpacity(false);
    	}

    	// get true image coordinates
			var original_aspect = slide.w / slide.h,
					img_aspect = rect.width / rect.height,
					computed_style = getComputedStyle(img),
					aspect = computed_style.objectFit === 'cover' ? original_aspect < img_aspect : original_aspect > img_aspect,
					y_offset = aspect ? (img.clientWidth / original_aspect - img.clientHeight) / 2 : 0,
					x_offset = !aspect ? (img.clientHeight * original_aspect - img.clientWidth) / 2 : 0,
					border = img.offsetWidth - img.clientWidth,
					padding = parseFloat(computed_style.padding || computed_style.paddingTop || 0); // for SVG paddings, paddingTop for Firefox

    	// return rect
    	return {
				x: rect.left - x_offset + border / 2 + padding,
				y: rect.top - y_offset + window.pageYOffset + border / 2 + padding,
				w: rect.width + x_offset * 2 - border - padding * 2,
				h: rect.height + y_offset * 2 - border - padding * 2,
				img: img
			};
    },
		index: 0,
		addCaptionHTMLFn: (slide, captionEl) => {

			// get items
			var item = slide.item;

			// topbar / use search element and return;
			if(default_options.caption_style === 'topbar'){
				_p.search.innerText = item.basename;
				return false;

			// video / don't use bottom caption because it interferes with native <video> controls
			} else if(slide.type === 'video') {
				// use search element if not already used
				if(!_e.filter.value) _p.search.innerText = item.basename;
				// always empty caption and return;
				return empty(_p.caption_center);

			// empty search if !filter, when navigating away from video
			} else if(!_e.filter.value){
				empty(_p.search); // always empty search if !search and was previous populated by video
			}

			// create and cache caption
			if(!item.hasOwnProperty('popup_caption')) item.popup_caption =
	    	// contextmenu
	    	//get_context_button(tests.PointerEvent, 'popup-context') +
	    	// basename
	    	'<div class="popup-basename">' + html_tags(item.basename) + '</div>' +
				// IMAGE META START
				'<div class="popup-image-meta">' +
	    	// dimensions
	    	get_dimensions(item.dimensions, 'popup-dimensions') +
	    	// file size
				get_filesize(item, 'popup-filesize') +
				// date
				'<span class="popup-date">' + _f.get_time(item, date_format, 'LLLL', date_relative) + '</span>' +
				// IMAGE META END
				'</div>' +
				// exif
				get_exif(item.image, 'popup-exif') +
				// iptc
				get_iptc(item.image, 'popup');

			// empty caption reset
	  	if(!item.popup_caption) return framework.resetEl(_p.caption_center);

			// caption transition (if !swiping and transition has duration)
			if(caption_transition && _p.caption_transition_delay){

				// hide it
				_p.caption.style.cssText = 'transition: none; opacity: 0';

				// stop current timer
				if(caption_timer) clearTimeout(caption_timer);

				// timer after transition complete
				caption_timer = setTimeout(() => {
					_p.caption.style.cssText = 'transition: opacity ' + caption_transition + 'ms cubic-bezier(0.33, 1, 0.68, 1)';
					caption_timer = setTimeout(() => {
						_p.caption.removeAttribute('style');
					}, caption_transition);
				}, _p.caption_transition_delay);
			}

			// set caption html
	  	_p.caption_center.innerHTML = item.popup_caption;

	  	// yup
			return true;
    }
	};

	// custom _c.config.popup from custom.js
	if(_c.config && _c.config.popup) {
		Object.assign(default_options, _c.config.popup);
		if(!default_options.play_transition) default_options.play_transition = default_options.transition || 'glide';
		if(default_options.transitions) Object.assign(_p.transitions, default_options.transitions);
	}


	/* FUNCTIONS */

	// open popup (global)
	_f.open_popup = (start_item, instant) => {

		// nothing
		if(!start_item || !_o.list.items.length || _p.is_open) return;

		// prepare options
		var options = { index: 0 };

		// check if slides_cached vs matchingItems (from list.js)
		var slides_cached = current_matchingItems === _o.list.matchingItems;

		// slides cached, just get index
		if(slides_cached){

			// get start_item index
			for (var i = 0; i < _p.slides.length; i++) if(_p.slides[i].item === start_item){
				options.index = i;
				break;
			}

		// re-create slides
		} else {

			// assign state
			current_matchingItems = _o.list.matchingItems;

			// re-start slides
			_p.slides = [];

			// loopr
			current_matchingItems.forEach(function(match, i) {

				// match and item
				var item = match._values;

				// break if !item.is_readable
		  	if(!item || !item.is_readable || !item.is_popup) return;

				// slide item object always
				var slide = {
					pid: encodeURIComponent(item.basename),
					item: item
				}

				// pano
				if(is_licensed && item.is_pano){
					Object.assign(slide, {
						type: 'pano',
						html: '<div class="popup-pano-placeholder">' + _f.get_svg_icon('panorama_variant') + '</div>'
					});

		  	// image
				} else if(item.browser_image){

		  		// img element
			  	var img = _c.load_images ? match.elm.firstElementChild : false,
			  			invert_dimensions = !tests.image_orientation && is_exif_oriented(item.image), // !browser.orientation
			  			use_msrc = img && !invert_dimensions;

			  	// slide
					Object.assign(slide, {
						type: 'image',
						src: file_path(item),
						// fallback to naturalWidth (avif) or availWidth (object-fit: scale-down), !item.image use availHeight (SVG)
			      w: item.image ? item.image.width || (use_msrc ? img.naturalWidth : 0) || screen.availWidth : screen.availHeight,
			      h: item.image ? item.image.height || (use_msrc ? img.naturalHeight : 0) || screen.availHeight : screen.availHeight,
			      img_el: img,
			      msrc: use_msrc && img.complete ? img.getAttribute('src') : false
					});

					// invert w/h if !tests.image_orientation && is_exif_oriented
					if(invert_dimensions){
						slide.w = item.image.height;
						slide.h = item.image.width;
					}

					// assign msrc as image loads
					if(use_msrc && !slide.msrc) img.onload = function(){
						slide.msrc = this.getAttribute('src');
					}

					// ico 16px fix ()
					if(item.ext === 'ico' && slide.w <= 16){
						var factor = 256 / slide.w;
						slide.w *= factor;
						slide.h *= factor;
					}

		  	// video
		  	} else if(item.is_browser_video){
					Object.assign(slide, {
						type: 'video', // preload="auto" REMOVED cuz of Safari
						// add video source with preview hack for iOS https://muffinman.io/blog/hack-for-ios-safari-to-display-html-video-thumbnail/
						html: '<video class="popup-video" playsinline disablepictureinpicture controls controlsList="nodownload"><source src="' + file_path(item) + (tests.only_touch ? '#t=0.001' : '') + '" type="' + item.mime + '"></video>'
					});

				// Youtube / complicated, because have to start/stop, and assign locked navigation.
				/*} else if(item.youtube){
					Object.assign(slide, {
						type: 'video', // preload="auto" REMOVED cuz of Safari
						// add video source with preview hack for iOS https://muffinman.io/blog/hack-for-ios-safari-to-display-html-video-thumbnail/
						html: '<iframe width="100%" height="100%" src="https://www.youtube.com/embed/' + item.youtube + '" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>'
					});*/
		  	}

				// set index
				if(item === start_item) options.index = _p.slides.length;

		  	// push item
				_p.slides.push(slide);
			});
		}

		// nothing
		if(!_p.slides.length) return;

		// OPEN!
		set_scrollbar_width(); // update --scrollbar-width before overflow:hidden
		document.documentElement.classList.add('popup-open'); // add html class
		_p.is_open = true; // is_open

		// prepare caption_transition_delay for opening
		_p.caption_transition_delay = 333; // should match showAnimationDuration

		// toggle cursor:pointer _p.slides.length > 1
		_p.container.style.cursor = _p.slides.length > 1 ? 'pointer' : 'default';

		// search text topbar
		if(default_options.caption_style !== 'topbar' && _e.filter.value) _p.search.innerHTML = _f.get_svg_icon('image_search_outline') + '"' + html_tags(_e.filter.value) + '"';

		// disable playEl if < 3 slides
		if(_p.slides.length < 3) options.playEl = false;

		// initialize and open PhotoSwipe
		mygallery = new PhotoSwipe(_p.pswp, PhotoSwipeUI_Default, _p.slides, Object.assign({}, default_options, options, {
			arrowEl: _p.slides.length > 1 && (!tests.only_touch || _c.current_dir.has_pano),
			arrowKeys: _p.slides.length > 1,
	    counterEl: _p.slides.length > 1,
			showAnimationDuration: instant ? 0 : 333,
			// showHideOpacity:true if !msrc && !instant
			//showHideOpacity: !_p.slides[options.index].msrc && !instant
			showHideOpacity: (() => {
				if(instant) return false; // instant, show asap without transition
				let item = _p.slides[options.index];
				if(!item.msrc) return true; // !msrc, fade!
				if(!item.img_el.offsetWidth) return true; // msrc defined (img_el exists), but !offsetWidth (list layout), fade!
				return false; // msrc and img_el has width, don't fade, use zoom in effect
			})()
		}));

		// zoomGestureEnded: stop slideshow
		if(tests.is_touch) mygallery.listen('zoomGestureEnded', function() {
			if(mygallery.getZoomLevel() > mygallery.currItem.initialZoomLevel) _p.toggle_play(false);
		});

		// beforechange
		mygallery.listen('beforeChange', function() {
			video_pause();
			_p.toggle_timer(false); // stop play timer
		});

		// afterchange
		mygallery.listen('afterChange', function(){

			// type
			var type = mygallery.currItem.type;

			// restart play timer
			_p.toggle_timer(true);

			// toggle popup-ui class (video, pano)
			['video', 'pano'].forEach((item) => _p.ui.classList.toggle('popup-ui-' + item, type == item));

			// get video element if is video / used to pause video on 'beforeChange' and 'close'
			_p.current_video = type === 'video' ? get_video_el() : false;

			// autoplay video if video_autoplay
			if(_p.current_video && default_options.video_autoplay) _p.current_video.play();

			// toggle popup pano UI (swipe, drag, keyboard)
			toggle_pano_ui(type == 'pano');

			// always destroy pano so it doesn't stick until next is loaded / AFTER toggle_pano_ui() so it can detect current state
			pano_destroy();

			// pano!
			if(type == 'pano') {

				// load ellum (hopefully already loaded)
				var currItem = mygallery.currItem; // save current item to compare after plugin load
				_f.load_plugin('pannellum', () => {
					// item changed while loading plugin, abort.
					if(currItem !== mygallery.currItem) return;
					// start pannellum
					// https://pannellum.org/documentation/reference/
					// https://pannellum.org/documentation/api/
					_p.pano_viewer = pannellum.viewer(_p.pano_container, {
		        type: 'equirectangular',
		        panorama: currItem.item.is_pano,// file_path(mygallery.currItem.item),
		        autoLoad: true,
		        autoRotate: _p.pano_is_rotating ? -2 : 0,
		        autoRotateInactivityDelay: 3000,
		        showControls: false,
						hfov: window.innerWidth > window.innerHeight ? 105 : 75, // simple fix for mobile aspect hfov
		      });
				});
			}
		});

		// video_autoplay_clicked (only apply if !video_autoplay, else will already play from 'afterChange' event)
		if(start_item.is_browser_video && !default_options.video_autoplay && default_options.video_autoplay_clicked) {
			mygallery.listen('initialZoomInEnd', function() {
				_p.current_video = get_video_el();
				if(_p.current_video) _p.current_video.play();
			});
		}

		// imageLoadComplete toggle_timer (must start timer after load, since it wasn't loaded on display)
		mygallery.listen('imageLoadComplete', function(index, item){
			if(mygallery.options.playEl && index === mygallery.getCurrentIndex()) _p.toggle_timer(true);
		});

		// close event listener
		mygallery.listen('close', function() {
			video_pause(); // stop video playing
			_p.current_video = false; // always reset _p.current_video for next session
			_p.toggle_play(false); // stop play
			document.documentElement.classList.remove('popup-open'); // moved here instead of destroy
		});

		// destroy
		mygallery.listen('destroy', function() {
			_p.preloader.classList.remove('pswp__spinner');
			for (var i = 0; i < _p.items.length; i++) empty(_p.items[i]); // empty items
			pano_destroy(); // make sure to destroy pano
			empty(_p.search); // empty search in topbar
			_p.is_open = false;
		});

		// init
		mygallery.init();
	}

	// toggle play
	_p.toggle_play = function(toggle){
		if(toggle === _p.playing || (toggle && is_last_slide())) return;
		_p.playing = !!toggle;
		framework.toggle_class(_p.play_button, 'is-playing', toggle);
		_p.toggle_timer(toggle);
	}

	// toggle timer
	_p.toggle_timer = function(timer){

		// stop if !loop and last slide
		if(timer && is_last_slide()) return _p.toggle_play(false);

		// stop if (timer && !playing || (!loaded && .src)) || _p.timer == timer
		if((timer && (!_p.playing || (!mygallery.currItem.loaded && mygallery.currItem.src))) || _p.timer == timer) return;
		_p.timer = !!timer;

		// timer enabled set opacity = 1
		if(timer) _p.play_timer.style.opacity = 1;

  	// stop anime
		anime.remove(_p.play_timer);

		// anime
		var ob = {
			targets: _p.play_timer,
			duration: timer ? mygallery.options.play_interval : 333, // same as transition speed please
			easing: timer ? 'easeInOutCubic' : 'easeOutQuad',
			scaleX: timer ? [0, 1] : 0
		}
		if(timer){
			ob.begin = function(){ _p.play_timer.style.display = 'block'; }
			ob.complete = function(){ mygallery.next(true); }
		} else {
			ob.complete = function(){ _p.play_timer.style.display = 'none'; }
			ob.opacity = [1, 0];
		}
		anime(ob);
	}

	// toggle showHideOpacity
	function toggle_showHideOpacity(toggle){
		if(toggle === mygallery.options.showHideOpacity) return;
		mygallery.options.showHideOpacity = toggle;
		framework.toggle_class(_p.pswp, 'pswp--animate_opacity', toggle);
	}

	// get current video element
	function get_video_el(){
		var vid = mygallery.currItem.container.firstElementChild;
		return vid && vid.nodeName == 'VIDEO' ? vid : false;
	}

	// video pause (on beforeChange and close)
	function video_pause(){
		var v = _p.current_video;
		if(v && v.currentTime > 0 && !v.paused && !v.ended && v.readyState > 2) v.pause();
	}

	// is last slide / only applies when !loop
	function is_last_slide(){
		return !mygallery.options.loop && mygallery.getCurrentIndex() === mygallery.options.getNumItemsFn() - 1;
	}


	/* TEMPLATE */

	// pano_is_rotating before add template
	_p.pano_is_rotating = _ls.get('files:popup:pano:rotating') !== false;

	//
	// template
	document.body.insertAdjacentHTML('beforeend', '\
		<div class="pswp' + (tests.is_touch ? ' pswp--touch' : '') + (tests.only_pointer ? ' pswp--has_mouse' : '') + '" tabindex="-1" role="dialog" aria-hidden="true">\
	    	<div class="pswp__bg"></div>\
	    	<div class="pswp__scroll-wrap">\
	    		<div class="pswp__container' + (_c.server_exif ? ' server-exif' : '') + '">\
		        <div class="pswp__item"></div>\
		        <div class="pswp__item"></div>\
		        <div class="pswp__item"></div>\
	        </div>\
	        <div class="pswp__ui pswp__ui--hidden pswp__caption-align-' + default_options.caption_align + '">\
	          <div class="pswp__top-bar">\
	            <div class="pswp__counter"></div>\
	            <div class="pswp__search"></div>\
	            <div class="pswp__topbar-spacer"></div>\
	            <span class="pswp__preloader"></span>'
	            + (default_options.downloadEl ? '<a type="button" class="button-icon pswp__button pswp__button--download"' + get_title(tests.download ? 'download' : 'open in new tab') + ' target="_blank"' + (tests.download ? ' download' : '') + '>' + _f.get_svg_icon(tests.download ? 'download' : 'open_in_new') + '</a>' : get_context_button(true, 'button-icon pswp__button')) + '\
							<button class="button-icon pswp__button pswp__button--pano-rotate' + (_p.pano_is_rotating ? ' is-rotating' : '') + '">' + _f.get_svg_icon_multi('motion_play_outline', 'motion_pause_outline') + '</button>'
	            + (!tests.only_touch ? '<button class="button-icon pswp__button pswp__button--zoom">' + _f.get_svg_icon_multi('magnify_plus', 'magnify_minus') + '</button>' : '') + '\
	            <button class="button-icon pswp__button pswp__button--play">' + _f.get_svg_icon_multi('play', 'pause') + '</button>\
	            ' + (tests.fullscreen ? '<button class="button-icon pswp__button pswp__button--fs">' + _f.get_svg_icon_multi('expand', 'collapse') + '</button>' : '') + '\
	            <button class="button-icon pswp__button pswp__button--close">' + _f.get_svg_icon('close_thin') + '</button>\
	          </div>\
	          <button class="pswp__button pswp__button--arrow--left">' + _f.get_svg_icon('chevron_left') + '</button><button class="pswp__button pswp__button--arrow--right">' + _f.get_svg_icon('chevron_right') + '</button>' + '\
	          <div class="pswp__timer"></div>\
	          <div class="pswp__caption pswp__caption-style-' + default_options.caption_style + (default_options.caption_hide ? ' pswp__caption-hide' : '') + (locked_caption ? ' pswp__caption-locked' : '') + '">\
	          	' + (!tests.only_touch ? '<button class="button-icon pswp__button--lock-caption">' + _f.get_svg_icon_multi('lock_outline', 'lock_open_outline') + '</button>' : '') + '\
	          	<div class="pswp__caption__center"></div>\
	          </div>\
	        </div>\
	    	</div>\
				<div class="pswp__pano"></div>\
			</div>');

	// elements
	_p.pswp = document.body.lastElementChild;
	_p.bg = _p.pswp.firstElementChild;
	_p.scrollwrap = _p.pswp.children[1];
	_p.pano_container = _p.pswp.lastElementChild;
	_p.container = _p.scrollwrap.firstElementChild;
	_p.items = _p.container.children;
	_p.ui = _p.scrollwrap.lastElementChild;
	_p.topbar = _p.ui.firstElementChild;
	_p.ArrowLeft = _p.ui.children[1];
	_p.ArrowRight = _p.ui.children[2];
	_p.caption = _p.ui.lastElementChild;
	_p.caption_center = _p.caption.lastElementChild;
	_p.play_timer = _p.ui.children[3];

	// get child elements from topbar
	Array.from(_p.topbar.children).forEach(function(el) {
		var cl = el.classList;
		if(cl.contains('pswp__preloader')) return _p.preloader = el;
		if(cl.contains('pswp__button--play')) return _p.play_button = el;
		if(cl.contains('pswp__search')) return _p.search = el;
		if(cl.contains('context-button')) return _p.contextmenu_button = el;
		if(cl.contains('pswp__button--pano-rotate')) return _p.pano_rotate_button = el;
	});

	// panorama autorotate button / triggered from photoswipe-ui-default.custom.js
	_p.toggle_pano_rotate = () => {
		if(!_p.pano_viewer) return; // just in case
		_p.pano_is_rotating = !_p.pano_is_rotating;
		_p.pano_viewer[(_p.pano_is_rotating ? 'start' : 'stop') + 'AutoRotate']();
		if(_p.pano_is_rotating){ // need to re-apply autoRotate && autoRotateInactivityDelay (for some reason!)
			var config = _p.pano_viewer.getConfig();
			config.autoRotate = -2;
			config.autoRotateInactivityDelay = 3000;
		}
		_ls.set('files:popup:pano:rotating', !!_p.pano_is_rotating);
		_p.pano_rotate_button.classList.toggle('is-rotating', _p.pano_is_rotating);
	};

	// toggle panorama UI from "afterChange" event
	function toggle_pano_ui(state){
		// nothing changes, exit
		if(!!state == !!_p.pano_viewer) return;
		// remove pinch, scroll, drag, keyboard on active pano
		Object.assign(mygallery.options, {
			pinchToClose: !state,
			closeOnScroll: !state,
			closeOnVerticalDrag: !state,
			arrowKeys: state ? false : _p.slides.length > 1
		});
	}

	// common destroy function used on PSWP 'beforeChange' and 'destroy'
	function pano_destroy(){
		if(!_p.pano_viewer) return;
		_p.pano_viewer.destroy();
		_p.pano_viewer = false;
	}

	// apply toggle-click functionality on captions centered element
	_p.caption.addEventListener('click', function(e){

		// lock caption
		if(e.target.classList.contains('pswp__button--lock-caption')){
			locked_caption = !locked_caption;
			framework.toggle_class(_p.caption, 'pswp__caption-locked', locked_caption);
			return _ls.set('files:popup:locked_caption', locked_caption, true); // toggle
		}

		// caption context menu
		if(e.target.dataset.action == 'context') return _f.create_contextmenu(e, 'popup', e.target, mygallery.currItem.item);

		// click on caption left/right navigate in case caption is over arrow buttons
		if(tests.is_pointer && e.target.className.indexOf('pswp') === 0) {
			if(default_options.caption_align === 'right' && e.pageX > this.clientWidth - 49) {
				mygallery.next();
			} else if(default_options.caption_align === 'left' && e.pageX < 49){
				mygallery.prev();
			}
		}
	});

	// topbar contextmenu button
	if(tests.is_pointer && _p.contextmenu_button) _event(_p.contextmenu_button, function(e){
		_f.create_contextmenu(e, 'popup', e.target, mygallery.currItem.item);
	});

	// the end!
})();


// files.sweetalert.js
// wrapper functions for sweetalert

// _alert
const _alert = (() => {

  // remove that anti-Russia junk
  _ls.remove('swal-initiation');

  // sweetalert default, use own classes etc
  const defaults = Swal.mixin({
    scrollbarPadding: false,
    showCloseButton: false,
    closeButtonHtml: _f.get_svg_icon('close_thin'),
    buttonsStyling: false, // false to remove useless swal2-styled since we are doing it ourselves in SCSS
    reverseButtons: !tests.ua || tests.ua.indexOf('Win') === -1, // add OK on right for all except Windows
    showCancelButton: true, // I think it's useful
    cancelButtonText: lang.get('cancel'), // default / needs to be set when lang loads slow or changes from menu
    customClass: {
      confirmButton: 'button',
      //denyButton: 'button',
      cancelButton: 'button button-secondary',//'button button-outline',
      input: 'input',
      closeButton: 'button-icon'
    },
    willOpen: () => set_scrollbar_width(), // update --scrollbar-width
    // we don't need this since doc is not set to 100% height
    // https://github.com/sweetalert2/sweetalert2/issues/1107
    // sets height: auto !important; // #781 #1107
    heightAuto: false // see above
  });

  // methods
  const methods = {

    //
    default: defaults.mixin(),

		// prompt
    prompt: defaults.mixin({
      input: 'text',
      inputAttributes: {
        maxlength: 127,
        autocapitalize: 'off',
        autocorrect: 'off',
        autocomplete: 'off',
        spellcheck: 'false'
      },
      didOpen: () => { // select input text
        if(!tests.is_pointer) return; // only pre-select if mouse, because is clumsy on touch
        let input = Swal.getInput(); // shortcut
        if(!input || !input.value) return; // die if no value
        let dot_index = input.value.lastIndexOf('.'); // get index of last dot
        if(dot_index < 1) return input.select(); // no dot or starts with dot, select all
        input.setSelectionRange(0, dot_index); // select all before dot assuming to keep extension
      },
      // default, but inputValidator is notmally assigned separately.
      inputValidator: val => methods.invalid_input(val),
    }),

    // confirm
    confirm: defaults.mixin({
      title: 'Confirm?', // probably never used
      // focusConfirm: false, // probably yes by default, but maybe not delete?
    }),

    // invalid response with icon
    invalid_response: (str) => {
      return _f.get_svg_icon('alert_circle_outline') + str;
    },

    // invalid() function used for inputValidator
    invalid_input: (val) => {
      let invalid = val.match(/[<>:"'/\\|?*#]|\.\.|\.$/g); // match invalid characters
      // return string and unique invalid characters
      if(invalid) return methods.invalid_response(`${ lang.get('invalid characters', true) }<span class="files-swal2-invalid-chars">${ [...new Set(invalid)].join('') }</span>`);
    }
  };

  // premade alerts / prompt / confirm and other methos
  return methods;
})();



/* // OLD

// sweetalert default, use own classes etc
var sdef = Swal.mixin({
  scrollbarPadding: false,
  showCloseButton: true,
  closeButtonHtml: _f.get_svg_icon('close_thin'),
  buttonsStyling: false,
  customClass: {
    confirmButton: 'button',
    denyButton: 'button',
    cancelButton: 'button',
    input: 'input',
    //closeButton: 'button-icon'
  },
  heightAuto: false // We don't need this since doc is not set to 100% height and !scrollbarPadding
});

// sweetalert prompt
var sprompt = sdef.mixin({
  //title: lang.get('new name', true),
  //html: lang.get('new name', true),
  //inputLabel: lang.get('new name', true),
  input: 'text',
  //inputValue: item.basename,
  //inputPlaceholder: lang.get('new name', true),
  inputAttributes: {
    maxlength: 127,
    autocapitalize: 'off',
    autocorrect: 'off',
    autocomplete: 'off',
    spellcheck: 'false'
  },
  inputValidator: (val) => {
  	var invalid = val.match(/[<>:"'/\\|?*#]|\.\.|\.$/g);
  	if(invalid) return 'Invalid characters ' + invalid.join(' ');
  	// filename exists / rename / duplicate / new_folder (sub of item) / new_file (sub of item)
  },
  //scrollbarPadding: false,
  //icon: 'question',
  //padding: '.5rem',
  //position: 'top',
  //closeButtonHtml: _f.get_svg_icon('close'),
  //iconColor: '#78a642',
  //footer: 'feckoff',
  //backdrop: false,
  //toast: true,
  //width: '320px',
  //timer: 2000,
  //showCloseButton: true,
  //showCancelButton: true,
  //focusConfirm: false,
  //confirmButtonText: lang.get('rename', true),
  //cancelButtonText: lang.get('cancel', true),
  //showClass: {
    //popup: 'animate__animated animate__fadeInDown'
  //},
  //hideClass: {
    //popup: 'animate__animated animate__fadeOutUp'
  //}
  //imageUrl: item.url_path
});
// sweetalert confirm
var sconfirm = sdef.mixin({
  title: 'Confirm?',
  //text: 'Delete ' + item.basename + '?',
  //showCloseButton: true,
  showCancelButton: true,
  //scrollbarPadding: false
});

*/


// files.update.js

/*
TODO
- No thanks, and don't show this again.

- DOWNLOAD
- LINK
- UPDATE!
*/

//
(() => {

	//
	var body = document.body;

	//
	function click_close(msg){
		body.dataset.updated = msg;
		body.style.cursor = 'pointer';
		var click = _event_listener(body, 'click', function(){
			body.classList.remove('updated');
			body.removeAttribute('data-updated');
			body.style.removeProperty('cursor');
			click.remove();
		});
	}

	// check updates
	function check_updates(){

		/*
		// check update from javascript
		ajax_get({
			json_response: true,
			url: 'https://data.jsdelivr.com/v1/package/npm/files.photo.gallery',
			complete: function(data, response, is_json){
				console.log('data', data);
				console.log('response', response);
				console.log('is_json', is_json);
			}
		});
		return;
		*/

		//
		ajax_get({
			json_response: true,
			params: 'action=check_updates',
			complete: function(data, response, is_json){
				if(data && response && is_json && data.hasOwnProperty('success')){
					var new_version = data.success;
					_log(new_version ? 'New version ' + new_version + ' available.' : 'Already using latest version ' + _c.version);

					// notification on update available
					if(new_version){

						// update dropdown
						_id('change-sort').insertAdjacentHTML('afterend', '<div id="files-notifications" class="dropdown"><button type="button" class="button-icon">' + _f.get_svg_icon('bell') + '</button><div class="dropdown-menu dropdown-menu-topbar"><span class="dropdown-header">Files Gallery ' + new_version + '</span>' + (data.writeable ? '<button class="dropdown-item">' + _f.get_svg_icon('rotate_right') + '<span class="dropdown-text" data-lang="update">' + lang.get('update') + '</span></button>' : '') + (tests.download ? '<a href="https://cdn.jsdelivr.net/npm/files.photo.gallery@' + new_version + '/index.php" class="dropdown-item" download>' + _f.get_svg_icon('download') + '<span class="dropdown-text" data-lang="download">' + lang.get('download') + '</span></a>' : '') + '<a href="https://files.photo.gallery/latest" class="dropdown-item" target="_blank">' + _f.get_svg_icon('info') + '<span class="dropdown-text" data-lang="read more">' + lang.get('read more') + '</span></a></div></div>');

						// dropdown
						var notifications = _id('files-notifications');
						_f.dropdown(notifications, notifications.firstChild);

						// die if not writeable
						if(!data.writeable) return;

						// update button
						_event(notifications.children[1].children[1], () => {

							_alert.confirm.fire({
								title: lang.get('update'),
								text: 'Update to Files Gallery ' + new_version + '?',
								cancelButtonText: lang.get('cancel'),
								confirmButtonText: lang.get('update')
							}).then((res) => {
								if(!res.isConfirmed) return;

								// body updating
								body.classList.add('updating');

								// ajax do_update
								ajax_get({
									params: 'action=do_update&version=' + new_version,
									json_response: true,
									complete: function(data, response, is_json){

										// body updated
										body.classList.add('updated');
										body.classList.remove('updating');

										// success
										if(data && response && is_json && data.hasOwnProperty('success') && data.success) {

											// updated localstorage for reload
											_ls.set('files:updated', true);

											// refresh
											try {
												body.dataset.updated = '✓ Success! Reloading ...';
												// does not always clear document cache / https://forum.files.gallery/d/228-autoupdate-message
												// location.reload(true);
												// hopefully this works better:
												var h = location.href;
												location.href = h.split('#')[0] + (h.indexOf('?') > 0 ? '&' : '?') + 'version=' + new_version;


											// failed to refresh
									    } catch (e){
									      body.dataset.updated = '✓ Success! Please refresh ...';
									    }

										// ajax fail for some reason
										} else {
											click_close('✗ Failed to load update :(');
										}
									}
								});
							});
						});
					}
				} else {
					_log('Failed to load external JSON check_updates.');
				}
			}
		});
	}

	// init
	if(_c.check_updates) {
		if(_ls.get('files:updated')){
			_ls.remove('files:updated');
			click_close('✓ Successfully updated to Files app version ' + _c.version);
			body.classList.add('updated');
		} else {
			check_updates();
		}
	}

	// the end
})();


// hash.js

function open_hash(path){

	// !history || !#hash
	if(!_c.history || !location.hash) return;

	// get file from pid or hash
	var pid = _param('pid', true, true),
			filename = pid || location.hash.replace('#', '');//.split('&')[0];

	// no file
	if(!filename) return;

	// set item
	var item = _c.files[decodeURIComponent(filename)];

	// item does not exist
	if(!item) return;

	// popup
	if(pid && item.is_popup) {
		_f.open_popup(item, true);

	// modal
	} else {
		_f.open_modal(item);
	}

	// return true so we know hash#file is found
	return true;
}


// history.js
// todo: errors on too fast popstate

// popstate
window.onpopstate = function(e) {
  if(!_c.history || !e.state || !e.state.hasOwnProperty('path')) return;
  _f.get_files(e.state.path);
};


// mime.js

// from https://github.com/jshttp/mime-db/
// https://www.jsdelivr.com/package/npm/mime
// https://cdn.jsdelivr.net/npm/mime@2.4.6/types/standard.js
// https://cdn.jsdelivr.net/npm/mime@2.4.6/types/other.js
// 06.06.2021 / Changed audio/x-flac -> audio/flac, because x-flac is not supported in browser canPlayType() audio tests
// 12.03.2023 / Added .cfg => text/plain
// 12.03.2023 / added .config => text/xml, so we get code icon and can view code in codemirror XML mode


/*var mime_source = {
  "application/1d-interleaved-parityfec": {
    "source": "iana"
  },
  "application/3gpdash-qoe-report+xml": {
    "source": "iana",
    "charset": "UTF-8",
    "compressible": true
  },
  "application/3gpp-ims+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/a2l": {
    "source": "iana"
  },
  "application/activemessage": {
    "source": "iana"
  },
  "application/activity+json": {
    "source": "iana",
    "compressible": true
  },
  "application/alto-costmap+json": {
    "source": "iana",
    "compressible": true
  },
  "application/alto-costmapfilter+json": {
    "source": "iana",
    "compressible": true
  },
  "application/alto-directory+json": {
    "source": "iana",
    "compressible": true
  },
  "application/alto-endpointcost+json": {
    "source": "iana",
    "compressible": true
  },
  "application/alto-endpointcostparams+json": {
    "source": "iana",
    "compressible": true
  },
  "application/alto-endpointprop+json": {
    "source": "iana",
    "compressible": true
  },
  "application/alto-endpointpropparams+json": {
    "source": "iana",
    "compressible": true
  },
  "application/alto-error+json": {
    "source": "iana",
    "compressible": true
  },
  "application/alto-networkmap+json": {
    "source": "iana",
    "compressible": true
  },
  "application/alto-networkmapfilter+json": {
    "source": "iana",
    "compressible": true
  },
  "application/alto-updatestreamcontrol+json": {
    "source": "iana",
    "compressible": true
  },
  "application/alto-updatestreamparams+json": {
    "source": "iana",
    "compressible": true
  },
  "application/aml": {
    "source": "iana"
  },
  "application/andrew-inset": {
    "source": "iana",
    "extensions": ["ez"]
  },
  "application/applefile": {
    "source": "iana"
  },
  "application/applixware": {
    "source": "apache",
    "extensions": ["aw"]
  },
  "application/atf": {
    "source": "iana"
  },
  "application/atfx": {
    "source": "iana"
  },
  "application/atom+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": ["atom"]
  },
  "application/atomcat+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": ["atomcat"]
  },
  "application/atomdeleted+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": ["atomdeleted"]
  },
  "application/atomicmail": {
    "source": "iana"
  },
  "application/atomsvc+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": ["atomsvc"]
  },
  "application/atsc-dwd+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": ["dwd"]
  },
  "application/atsc-dynamic-event-message": {
    "source": "iana"
  },
  "application/atsc-held+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": ["held"]
  },
  "application/atsc-rdt+json": {
    "source": "iana",
    "compressible": true
  },
  "application/atsc-rsat+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": ["rsat"]
  },
  "application/atxml": {
    "source": "iana"
  },
  "application/auth-policy+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/bacnet-xdd+zip": {
    "source": "iana",
    "compressible": false
  },
  "application/batch-smtp": {
    "source": "iana"
  },
  "application/bdoc": {
    "compressible": false,
    "extensions": ["bdoc"]
  },
  "application/beep+xml": {
    "source": "iana",
    "charset": "UTF-8",
    "compressible": true
  },
  "application/calendar+json": {
    "source": "iana",
    "compressible": true
  },
  "application/calendar+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": ["xcs"]
  },
  "application/call-completion": {
    "source": "iana"
  },
  "application/cals-1840": {
    "source": "iana"
  },
  "application/cap+xml": {
    "source": "iana",
    "charset": "UTF-8",
    "compressible": true
  },
  "application/cbor": {
    "source": "iana"
  },
  "application/cbor-seq": {
    "source": "iana"
  },
  "application/cccex": {
    "source": "iana"
  },
  "application/ccmp+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/ccxml+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": ["ccxml"]
  },
  "application/cdfx+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": ["cdfx"]
  },
  "application/cdmi-capability": {
    "source": "iana",
    "extensions": ["cdmia"]
  },
  "application/cdmi-container": {
    "source": "iana",
    "extensions": ["cdmic"]
  },
  "application/cdmi-domain": {
    "source": "iana",
    "extensions": ["cdmid"]
  },
  "application/cdmi-object": {
    "source": "iana",
    "extensions": ["cdmio"]
  },
  "application/cdmi-queue": {
    "source": "iana",
    "extensions": ["cdmiq"]
  },
  "application/cdni": {
    "source": "iana"
  },
  "application/cea": {
    "source": "iana"
  },
  "application/cea-2018+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/cellml+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/cfw": {
    "source": "iana"
  },
  "application/clue+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/clue_info+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/cms": {
    "source": "iana"
  },
  "application/cnrp+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/coap-group+json": {
    "source": "iana",
    "compressible": true
  },
  "application/coap-payload": {
    "source": "iana"
  },
  "application/commonground": {
    "source": "iana"
  },
  "application/conference-info+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/cose": {
    "source": "iana"
  },
  "application/cose-key": {
    "source": "iana"
  },
  "application/cose-key-set": {
    "source": "iana"
  },
  "application/cpl+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/csrattrs": {
    "source": "iana"
  },
  "application/csta+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/cstadata+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/csvm+json": {
    "source": "iana",
    "compressible": true
  },
  "application/cu-seeme": {
    "source": "apache",
    "extensions": ["cu"]
  },
  "application/cwt": {
    "source": "iana"
  },
  "application/cybercash": {
    "source": "iana"
  },
  "application/dart": {
    "compressible": true
  },
  "application/dash+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": ["mpd"]
  },
  "application/dashdelta": {
    "source": "iana"
  },
  "application/davmount+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": ["davmount"]
  },
  "application/dca-rft": {
    "source": "iana"
  },
  "application/dcd": {
    "source": "iana"
  },
  "application/dec-dx": {
    "source": "iana"
  },
  "application/dialog-info+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/dicom": {
    "source": "iana"
  },
  "application/dicom+json": {
    "source": "iana",
    "compressible": true
  },
  "application/dicom+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/dii": {
    "source": "iana"
  },
  "application/dit": {
    "source": "iana"
  },
  "application/dns": {
    "source": "iana"
  },
  "application/dns+json": {
    "source": "iana",
    "compressible": true
  },
  "application/dns-message": {
    "source": "iana"
  },
  "application/docbook+xml": {
    "source": "apache",
    "compressible": true,
    "extensions": ["dbk"]
  },
  "application/dots+cbor": {
    "source": "iana"
  },
  "application/dskpp+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/dssc+der": {
    "source": "iana",
    "extensions": ["dssc"]
  },
  "application/dssc+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": ["xdssc"]
  },
  "application/dvcs": {
    "source": "iana"
  },
  "application/ecmascript": {
    "source": "iana",
    "compressible": true,
    "extensions": ["ecma","es"]
  },
  "application/edi-consent": {
    "source": "iana"
  },
  "application/edi-x12": {
    "source": "iana",
    "compressible": false
  },
  "application/edifact": {
    "source": "iana",
    "compressible": false
  },
  "application/efi": {
    "source": "iana"
  },
  "application/emergencycalldata.comment+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/emergencycalldata.control+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/emergencycalldata.deviceinfo+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/emergencycalldata.ecall.msd": {
    "source": "iana"
  },
  "application/emergencycalldata.providerinfo+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/emergencycalldata.serviceinfo+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/emergencycalldata.subscriberinfo+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/emergencycalldata.veds+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/emma+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": ["emma"]
  },
  "application/emotionml+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": ["emotionml"]
  },
  "application/encaprtp": {
    "source": "iana"
  },
  "application/epp+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/epub+zip": {
    "source": "iana",
    "compressible": false,
    "extensions": ["epub"]
  },
  "application/eshop": {
    "source": "iana"
  },
  "application/exi": {
    "source": "iana",
    "extensions": ["exi"]
  },
  "application/expect-ct-report+json": {
    "source": "iana",
    "compressible": true
  },
  "application/fastinfoset": {
    "source": "iana"
  },
  "application/fastsoap": {
    "source": "iana"
  },
  "application/fdt+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": ["fdt"]
  },
  "application/fhir+json": {
    "source": "iana",
    "charset": "UTF-8",
    "compressible": true
  },
  "application/fhir+xml": {
    "source": "iana",
    "charset": "UTF-8",
    "compressible": true
  },
  "application/fido.trusted-apps+json": {
    "compressible": true
  },
  "application/fits": {
    "source": "iana"
  },
  "application/flexfec": {
    "source": "iana"
  },
  "application/font-sfnt": {
    "source": "iana"
  },
  "application/font-tdpfr": {
    "source": "iana",
    "extensions": ["pfr"]
  },
  "application/font-woff": {
    "source": "iana",
    "compressible": false
  },
  "application/framework-attributes+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/geo+json": {
    "source": "iana",
    "compressible": true,
    "extensions": ["geojson"]
  },
  "application/geo+json-seq": {
    "source": "iana"
  },
  "application/geopackage+sqlite3": {
    "source": "iana"
  },
  "application/geoxacml+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/gltf-buffer": {
    "source": "iana"
  },
  "application/gml+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": ["gml"]
  },
  "application/gpx+xml": {
    "source": "apache",
    "compressible": true,
    "extensions": ["gpx"]
  },
  "application/gxf": {
    "source": "apache",
    "extensions": ["gxf"]
  },
  "application/gzip": {
    "source": "iana",
    "compressible": false,
    "extensions": ["gz"]
  },
  "application/h224": {
    "source": "iana"
  },
  "application/held+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/hjson": {
    "extensions": ["hjson"]
  },
  "application/http": {
    "source": "iana"
  },
  "application/hyperstudio": {
    "source": "iana",
    "extensions": ["stk"]
  },
  "application/ibe-key-request+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/ibe-pkg-reply+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/ibe-pp-data": {
    "source": "iana"
  },
  "application/iges": {
    "source": "iana"
  },
  "application/im-iscomposing+xml": {
    "source": "iana",
    "charset": "UTF-8",
    "compressible": true
  },
  "application/index": {
    "source": "iana"
  },
  "application/index.cmd": {
    "source": "iana"
  },
  "application/index.obj": {
    "source": "iana"
  },
  "application/index.response": {
    "source": "iana"
  },
  "application/index.vnd": {
    "source": "iana"
  },
  "application/inkml+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": ["ink","inkml"]
  },
  "application/iotp": {
    "source": "iana"
  },
  "application/ipfix": {
    "source": "iana",
    "extensions": ["ipfix"]
  },
  "application/ipp": {
    "source": "iana"
  },
  "application/isup": {
    "source": "iana"
  },
  "application/its+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": ["its"]
  },
  "application/java-archive": {
    "source": "apache",
    "compressible": false,
    "extensions": ["jar","war","ear"]
  },
  "application/java-serialized-object": {
    "source": "apache",
    "compressible": false,
    "extensions": ["ser"]
  },
  "application/java-vm": {
    "source": "apache",
    "compressible": false,
    "extensions": ["class"]
  },
  "application/javascript": {
    "source": "iana",
    "charset": "UTF-8",
    "compressible": true,
    "extensions": ["js","mjs"]
  },
  "application/jf2feed+json": {
    "source": "iana",
    "compressible": true
  },
  "application/jose": {
    "source": "iana"
  },
  "application/jose+json": {
    "source": "iana",
    "compressible": true
  },
  "application/jrd+json": {
    "source": "iana",
    "compressible": true
  },
  "application/json": {
    "source": "iana",
    "charset": "UTF-8",
    "compressible": true,
    "extensions": ["json","map"]
  },
  "application/json-patch+json": {
    "source": "iana",
    "compressible": true
  },
  "application/json-seq": {
    "source": "iana"
  },
  "application/json5": {
    "extensions": ["json5"]
  },
  "application/jsonml+json": {
    "source": "apache",
    "compressible": true,
    "extensions": ["jsonml"]
  },
  "application/jwk+json": {
    "source": "iana",
    "compressible": true
  },
  "application/jwk-set+json": {
    "source": "iana",
    "compressible": true
  },
  "application/jwt": {
    "source": "iana"
  },
  "application/kpml-request+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/kpml-response+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/ld+json": {
    "source": "iana",
    "compressible": true,
    "extensions": ["jsonld"]
  },
  "application/lgr+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": ["lgr"]
  },
  "application/link-format": {
    "source": "iana"
  },
  "application/load-control+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/lost+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": ["lostxml"]
  },
  "application/lostsync+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/lpf+zip": {
    "source": "iana",
    "compressible": false
  },
  "application/lxf": {
    "source": "iana"
  },
  "application/mac-binhex40": {
    "source": "iana",
    "extensions": ["hqx"]
  },
  "application/mac-compactpro": {
    "source": "apache",
    "extensions": ["cpt"]
  },
  "application/macwriteii": {
    "source": "iana"
  },
  "application/mads+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": ["mads"]
  },
  "application/manifest+json": {
    "charset": "UTF-8",
    "compressible": true,
    "extensions": ["webmanifest"]
  },
  "application/marc": {
    "source": "iana",
    "extensions": ["mrc"]
  },
  "application/marcxml+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": ["mrcx"]
  },
  "application/mathematica": {
    "source": "iana",
    "extensions": ["ma","nb","mb"]
  },
  "application/mathml+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": ["mathml"]
  },
  "application/mathml-content+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/mathml-presentation+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/mbms-associated-procedure-description+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/mbms-deregister+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/mbms-envelope+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/mbms-msk+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/mbms-msk-response+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/mbms-protection-description+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/mbms-reception-report+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/mbms-register+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/mbms-register-response+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/mbms-schedule+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/mbms-user-service-description+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/mbox": {
    "source": "iana",
    "extensions": ["mbox"]
  },
  "application/media-policy-dataset+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/media_control+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/mediaservercontrol+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": ["mscml"]
  },
  "application/merge-patch+json": {
    "source": "iana",
    "compressible": true
  },
  "application/metalink+xml": {
    "source": "apache",
    "compressible": true,
    "extensions": ["metalink"]
  },
  "application/metalink4+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": ["meta4"]
  },
  "application/mets+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": ["mets"]
  },
  "application/mf4": {
    "source": "iana"
  },
  "application/mikey": {
    "source": "iana"
  },
  "application/mipc": {
    "source": "iana"
  },
  "application/mmt-aei+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": ["maei"]
  },
  "application/mmt-usd+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": ["musd"]
  },
  "application/mods+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": ["mods"]
  },
  "application/moss-keys": {
    "source": "iana"
  },
  "application/moss-signature": {
    "source": "iana"
  },
  "application/mosskey-data": {
    "source": "iana"
  },
  "application/mosskey-request": {
    "source": "iana"
  },
  "application/mp21": {
    "source": "iana",
    "extensions": ["m21","mp21"]
  },
  "application/mp4": {
    "source": "iana",
    "extensions": ["mp4s","m4p"]
  },
  "application/mpeg4-generic": {
    "source": "iana"
  },
  "application/mpeg4-iod": {
    "source": "iana"
  },
  "application/mpeg4-iod-xmt": {
    "source": "iana"
  },
  "application/mrb-consumer+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": ["xdf"]
  },
  "application/mrb-publish+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": ["xdf"]
  },
  "application/msc-ivr+xml": {
    "source": "iana",
    "charset": "UTF-8",
    "compressible": true
  },
  "application/msc-mixer+xml": {
    "source": "iana",
    "charset": "UTF-8",
    "compressible": true
  },
  "application/msword": {
    "source": "iana",
    "compressible": false,
    "extensions": ["doc","dot"]
  },
  "application/mud+json": {
    "source": "iana",
    "compressible": true
  },
  "application/multipart-core": {
    "source": "iana"
  },
  "application/mxf": {
    "source": "iana",
    "extensions": ["mxf"]
  },
  "application/n-quads": {
    "source": "iana",
    "extensions": ["nq"]
  },
  "application/n-triples": {
    "source": "iana",
    "extensions": ["nt"]
  },
  "application/nasdata": {
    "source": "iana"
  },
  "application/news-checkgroups": {
    "source": "iana",
    "charset": "US-ASCII"
  },
  "application/news-groupinfo": {
    "source": "iana",
    "charset": "US-ASCII"
  },
  "application/news-transmission": {
    "source": "iana"
  },
  "application/nlsml+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/node": {
    "source": "iana",
    "extensions": ["cjs"]
  },
  "application/nss": {
    "source": "iana"
  },
  "application/ocsp-request": {
    "source": "iana"
  },
  "application/ocsp-response": {
    "source": "iana"
  },
  "application/octet-stream": {
    "source": "iana",
    "compressible": false,
    "extensions": ["bin","dms","lrf","mar","so","dist","distz","pkg","bpk","dump","elc","deploy","exe","dll","deb","dmg","iso","img","msi","msp","msm","buffer"]
  },
  "application/oda": {
    "source": "iana",
    "extensions": ["oda"]
  },
  "application/odm+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/odx": {
    "source": "iana"
  },
  "application/oebps-package+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": ["opf"]
  },
  "application/ogg": {
    "source": "iana",
    "compressible": false,
    "extensions": ["ogx"]
  },
  "application/omdoc+xml": {
    "source": "apache",
    "compressible": true,
    "extensions": ["omdoc"]
  },
  "application/onenote": {
    "source": "apache",
    "extensions": ["onetoc","onetoc2","onetmp","onepkg"]
  },
  "application/oscore": {
    "source": "iana"
  },
  "application/oxps": {
    "source": "iana",
    "extensions": ["oxps"]
  },
  "application/p2p-overlay+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": ["relo"]
  },
  "application/parityfec": {
    "source": "iana"
  },
  "application/passport": {
    "source": "iana"
  },
  "application/patch-ops-error+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": ["xer"]
  },
  "application/pdf": {
    "source": "iana",
    "compressible": false,
    "extensions": ["pdf"]
  },
  "application/pdx": {
    "source": "iana"
  },
  "application/pem-certificate-chain": {
    "source": "iana"
  },
  "application/pgp-encrypted": {
    "source": "iana",
    "compressible": false,
    "extensions": ["pgp"]
  },
  "application/pgp-keys": {
    "source": "iana"
  },
  "application/pgp-signature": {
    "source": "iana",
    "extensions": ["asc","sig"]
  },
  "application/pics-rules": {
    "source": "apache",
    "extensions": ["prf"]
  },
  "application/pidf+xml": {
    "source": "iana",
    "charset": "UTF-8",
    "compressible": true
  },
  "application/pidf-diff+xml": {
    "source": "iana",
    "charset": "UTF-8",
    "compressible": true
  },
  "application/pkcs10": {
    "source": "iana",
    "extensions": ["p10"]
  },
  "application/pkcs12": {
    "source": "iana"
  },
  "application/pkcs7-mime": {
    "source": "iana",
    "extensions": ["p7m","p7c"]
  },
  "application/pkcs7-signature": {
    "source": "iana",
    "extensions": ["p7s"]
  },
  "application/pkcs8": {
    "source": "iana",
    "extensions": ["p8"]
  },
  "application/pkcs8-encrypted": {
    "source": "iana"
  },
  "application/pkix-attr-cert": {
    "source": "iana",
    "extensions": ["ac"]
  },
  "application/pkix-cert": {
    "source": "iana",
    "extensions": ["cer"]
  },
  "application/pkix-crl": {
    "source": "iana",
    "extensions": ["crl"]
  },
  "application/pkix-pkipath": {
    "source": "iana",
    "extensions": ["pkipath"]
  },
  "application/pkixcmp": {
    "source": "iana",
    "extensions": ["pki"]
  },
  "application/pls+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": ["pls"]
  },
  "application/poc-settings+xml": {
    "source": "iana",
    "charset": "UTF-8",
    "compressible": true
  },
  "application/postscript": {
    "source": "iana",
    "compressible": true,
    "extensions": ["ai","eps","ps"]
  },
  "application/ppsp-tracker+json": {
    "source": "iana",
    "compressible": true
  },
  "application/problem+json": {
    "source": "iana",
    "compressible": true
  },
  "application/problem+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/provenance+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": ["provx"]
  },
  "application/prs.alvestrand.titrax-sheet": {
    "source": "iana"
  },
  "application/prs.cww": {
    "source": "iana",
    "extensions": ["cww"]
  },
  "application/prs.hpub+zip": {
    "source": "iana",
    "compressible": false
  },
  "application/prs.nprend": {
    "source": "iana"
  },
  "application/prs.plucker": {
    "source": "iana"
  },
  "application/prs.rdf-xml-crypt": {
    "source": "iana"
  },
  "application/prs.xsf+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/pskc+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": ["pskcxml"]
  },
  "application/pvd+json": {
    "source": "iana",
    "compressible": true
  },
  "application/qsig": {
    "source": "iana"
  },
  "application/raml+yaml": {
    "compressible": true,
    "extensions": ["raml"]
  },
  "application/raptorfec": {
    "source": "iana"
  },
  "application/rdap+json": {
    "source": "iana",
    "compressible": true
  },
  "application/rdf+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": ["rdf","owl"]
  },
  "application/reginfo+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": ["rif"]
  },
  "application/relax-ng-compact-syntax": {
    "source": "iana",
    "extensions": ["rnc"]
  },
  "application/remote-printing": {
    "source": "iana"
  },
  "application/reputon+json": {
    "source": "iana",
    "compressible": true
  },
  "application/resource-lists+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": ["rl"]
  },
  "application/resource-lists-diff+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": ["rld"]
  },
  "application/rfc+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/riscos": {
    "source": "iana"
  },
  "application/rlmi+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/rls-services+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": ["rs"]
  },
  "application/route-apd+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": ["rapd"]
  },
  "application/route-s-tsid+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": ["sls"]
  },
  "application/route-usd+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": ["rusd"]
  },
  "application/rpki-ghostbusters": {
    "source": "iana",
    "extensions": ["gbr"]
  },
  "application/rpki-manifest": {
    "source": "iana",
    "extensions": ["mft"]
  },
  "application/rpki-publication": {
    "source": "iana"
  },
  "application/rpki-roa": {
    "source": "iana",
    "extensions": ["roa"]
  },
  "application/rpki-updown": {
    "source": "iana"
  },
  "application/rsd+xml": {
    "source": "apache",
    "compressible": true,
    "extensions": ["rsd"]
  },
  "application/rss+xml": {
    "source": "apache",
    "compressible": true,
    "extensions": ["rss"]
  },
  "application/rtf": {
    "source": "iana",
    "compressible": true,
    "extensions": ["rtf"]
  },
  "application/rtploopback": {
    "source": "iana"
  },
  "application/rtx": {
    "source": "iana"
  },
  "application/samlassertion+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/samlmetadata+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/sbe": {
    "source": "iana"
  },
  "application/sbml+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": ["sbml"]
  },
  "application/scaip+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/scim+json": {
    "source": "iana",
    "compressible": true
  },
  "application/scvp-cv-request": {
    "source": "iana",
    "extensions": ["scq"]
  },
  "application/scvp-cv-response": {
    "source": "iana",
    "extensions": ["scs"]
  },
  "application/scvp-vp-request": {
    "source": "iana",
    "extensions": ["spq"]
  },
  "application/scvp-vp-response": {
    "source": "iana",
    "extensions": ["spp"]
  },
  "application/sdp": {
    "source": "iana",
    "extensions": ["sdp"]
  },
  "application/secevent+jwt": {
    "source": "iana"
  },
  "application/senml+cbor": {
    "source": "iana"
  },
  "application/senml+json": {
    "source": "iana",
    "compressible": true
  },
  "application/senml+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": ["senmlx"]
  },
  "application/senml-etch+cbor": {
    "source": "iana"
  },
  "application/senml-etch+json": {
    "source": "iana",
    "compressible": true
  },
  "application/senml-exi": {
    "source": "iana"
  },
  "application/sensml+cbor": {
    "source": "iana"
  },
  "application/sensml+json": {
    "source": "iana",
    "compressible": true
  },
  "application/sensml+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": ["sensmlx"]
  },
  "application/sensml-exi": {
    "source": "iana"
  },
  "application/sep+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/sep-exi": {
    "source": "iana"
  },
  "application/session-info": {
    "source": "iana"
  },
  "application/set-payment": {
    "source": "iana"
  },
  "application/set-payment-initiation": {
    "source": "iana",
    "extensions": ["setpay"]
  },
  "application/set-registration": {
    "source": "iana"
  },
  "application/set-registration-initiation": {
    "source": "iana",
    "extensions": ["setreg"]
  },
  "application/sgml": {
    "source": "iana"
  },
  "application/sgml-open-catalog": {
    "source": "iana"
  },
  "application/shf+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": ["shf"]
  },
  "application/sieve": {
    "source": "iana",
    "extensions": ["siv","sieve"]
  },
  "application/simple-filter+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/simple-message-summary": {
    "source": "iana"
  },
  "application/simplesymbolcontainer": {
    "source": "iana"
  },
  "application/sipc": {
    "source": "iana"
  },
  "application/slate": {
    "source": "iana"
  },
  "application/smil": {
    "source": "iana"
  },
  "application/smil+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": ["smi","smil"]
  },
  "application/smpte336m": {
    "source": "iana"
  },
  "application/soap+fastinfoset": {
    "source": "iana"
  },
  "application/soap+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/sparql-query": {
    "source": "iana",
    "extensions": ["rq"]
  },
  "application/sparql-results+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": ["srx"]
  },
  "application/spirits-event+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/sql": {
    "source": "iana"
  },
  "application/srgs": {
    "source": "iana",
    "extensions": ["gram"]
  },
  "application/srgs+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": ["grxml"]
  },
  "application/sru+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": ["sru"]
  },
  "application/ssdl+xml": {
    "source": "apache",
    "compressible": true,
    "extensions": ["ssdl"]
  },
  "application/ssml+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": ["ssml"]
  },
  "application/stix+json": {
    "source": "iana",
    "compressible": true
  },
  "application/swid+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": ["swidtag"]
  },
  "application/tamp-apex-update": {
    "source": "iana"
  },
  "application/tamp-apex-update-confirm": {
    "source": "iana"
  },
  "application/tamp-community-update": {
    "source": "iana"
  },
  "application/tamp-community-update-confirm": {
    "source": "iana"
  },
  "application/tamp-error": {
    "source": "iana"
  },
  "application/tamp-sequence-adjust": {
    "source": "iana"
  },
  "application/tamp-sequence-adjust-confirm": {
    "source": "iana"
  },
  "application/tamp-status-query": {
    "source": "iana"
  },
  "application/tamp-status-response": {
    "source": "iana"
  },
  "application/tamp-update": {
    "source": "iana"
  },
  "application/tamp-update-confirm": {
    "source": "iana"
  },
  "application/tar": {
    "compressible": true
  },
  "application/taxii+json": {
    "source": "iana",
    "compressible": true
  },
  "application/td+json": {
    "source": "iana",
    "compressible": true
  },
  "application/tei+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": ["tei","teicorpus"]
  },
  "application/tetra_isi": {
    "source": "iana"
  },
  "application/thraud+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": ["tfi"]
  },
  "application/timestamp-query": {
    "source": "iana"
  },
  "application/timestamp-reply": {
    "source": "iana"
  },
  "application/timestamped-data": {
    "source": "iana",
    "extensions": ["tsd"]
  },
  "application/tlsrpt+gzip": {
    "source": "iana"
  },
  "application/tlsrpt+json": {
    "source": "iana",
    "compressible": true
  },
  "application/tnauthlist": {
    "source": "iana"
  },
  "application/toml": {
    "compressible": true,
    "extensions": ["toml"]
  },
  "application/trickle-ice-sdpfrag": {
    "source": "iana"
  },
  "application/trig": {
    "source": "iana"
  },
  "application/ttml+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": ["ttml"]
  },
  "application/tve-trigger": {
    "source": "iana"
  },
  "application/tzif": {
    "source": "iana"
  },
  "application/tzif-leap": {
    "source": "iana"
  },
  "application/ulpfec": {
    "source": "iana"
  },
  "application/urc-grpsheet+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/urc-ressheet+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": ["rsheet"]
  },
  "application/urc-targetdesc+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/urc-uisocketdesc+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vcard+json": {
    "source": "iana",
    "compressible": true
  },
  "application/vcard+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vemmi": {
    "source": "iana"
  },
  "application/vividence.scriptfile": {
    "source": "apache"
  },
  "application/vnd.1000minds.decision-model+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": ["1km"]
  },
  "application/vnd.3gpp-prose+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.3gpp-prose-pc3ch+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.3gpp-v2x-local-service-information": {
    "source": "iana"
  },
  "application/vnd.3gpp.access-transfer-events+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.3gpp.bsf+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.3gpp.gmop+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.3gpp.mc-signalling-ear": {
    "source": "iana"
  },
  "application/vnd.3gpp.mcdata-affiliation-command+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.3gpp.mcdata-info+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.3gpp.mcdata-payload": {
    "source": "iana"
  },
  "application/vnd.3gpp.mcdata-service-config+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.3gpp.mcdata-signalling": {
    "source": "iana"
  },
  "application/vnd.3gpp.mcdata-ue-config+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.3gpp.mcdata-user-profile+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.3gpp.mcptt-affiliation-command+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.3gpp.mcptt-floor-request+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.3gpp.mcptt-info+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.3gpp.mcptt-location-info+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.3gpp.mcptt-mbms-usage-info+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.3gpp.mcptt-service-config+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.3gpp.mcptt-signed+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.3gpp.mcptt-ue-config+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.3gpp.mcptt-ue-init-config+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.3gpp.mcptt-user-profile+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.3gpp.mcvideo-affiliation-command+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.3gpp.mcvideo-affiliation-info+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.3gpp.mcvideo-info+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.3gpp.mcvideo-location-info+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.3gpp.mcvideo-mbms-usage-info+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.3gpp.mcvideo-service-config+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.3gpp.mcvideo-transmission-request+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.3gpp.mcvideo-ue-config+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.3gpp.mcvideo-user-profile+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.3gpp.mid-call+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.3gpp.pic-bw-large": {
    "source": "iana",
    "extensions": ["plb"]
  },
  "application/vnd.3gpp.pic-bw-small": {
    "source": "iana",
    "extensions": ["psb"]
  },
  "application/vnd.3gpp.pic-bw-var": {
    "source": "iana",
    "extensions": ["pvb"]
  },
  "application/vnd.3gpp.sms": {
    "source": "iana"
  },
  "application/vnd.3gpp.sms+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.3gpp.srvcc-ext+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.3gpp.srvcc-info+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.3gpp.state-and-event-info+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.3gpp.ussd+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.3gpp2.bcmcsinfo+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.3gpp2.sms": {
    "source": "iana"
  },
  "application/vnd.3gpp2.tcap": {
    "source": "iana",
    "extensions": ["tcap"]
  },
  "application/vnd.3lightssoftware.imagescal": {
    "source": "iana"
  },
  "application/vnd.3m.post-it-notes": {
    "source": "iana",
    "extensions": ["pwn"]
  },
  "application/vnd.accpac.simply.aso": {
    "source": "iana",
    "extensions": ["aso"]
  },
  "application/vnd.accpac.simply.imp": {
    "source": "iana",
    "extensions": ["imp"]
  },
  "application/vnd.acucobol": {
    "source": "iana",
    "extensions": ["acu"]
  },
  "application/vnd.acucorp": {
    "source": "iana",
    "extensions": ["atc","acutc"]
  },
  "application/vnd.adobe.air-application-installer-package+zip": {
    "source": "apache",
    "compressible": false,
    "extensions": ["air"]
  },
  "application/vnd.adobe.flash.movie": {
    "source": "iana"
  },
  "application/vnd.adobe.formscentral.fcdt": {
    "source": "iana",
    "extensions": ["fcdt"]
  },
  "application/vnd.adobe.fxp": {
    "source": "iana",
    "extensions": ["fxp","fxpl"]
  },
  "application/vnd.adobe.partial-upload": {
    "source": "iana"
  },
  "application/vnd.adobe.xdp+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": ["xdp"]
  },
  "application/vnd.adobe.xfdf": {
    "source": "iana",
    "extensions": ["xfdf"]
  },
  "application/vnd.aether.imp": {
    "source": "iana"
  },
  "application/vnd.afpc.afplinedata": {
    "source": "iana"
  },
  "application/vnd.afpc.afplinedata-pagedef": {
    "source": "iana"
  },
  "application/vnd.afpc.foca-charset": {
    "source": "iana"
  },
  "application/vnd.afpc.foca-codedfont": {
    "source": "iana"
  },
  "application/vnd.afpc.foca-codepage": {
    "source": "iana"
  },
  "application/vnd.afpc.modca": {
    "source": "iana"
  },
  "application/vnd.afpc.modca-formdef": {
    "source": "iana"
  },
  "application/vnd.afpc.modca-mediummap": {
    "source": "iana"
  },
  "application/vnd.afpc.modca-objectcontainer": {
    "source": "iana"
  },
  "application/vnd.afpc.modca-overlay": {
    "source": "iana"
  },
  "application/vnd.afpc.modca-pagesegment": {
    "source": "iana"
  },
  "application/vnd.ah-barcode": {
    "source": "iana"
  },
  "application/vnd.ahead.space": {
    "source": "iana",
    "extensions": ["ahead"]
  },
  "application/vnd.airzip.filesecure.azf": {
    "source": "iana",
    "extensions": ["azf"]
  },
  "application/vnd.airzip.filesecure.azs": {
    "source": "iana",
    "extensions": ["azs"]
  },
  "application/vnd.amadeus+json": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.amazon.ebook": {
    "source": "apache",
    "extensions": ["azw"]
  },
  "application/vnd.amazon.mobi8-ebook": {
    "source": "iana"
  },
  "application/vnd.americandynamics.acc": {
    "source": "iana",
    "extensions": ["acc"]
  },
  "application/vnd.amiga.ami": {
    "source": "iana",
    "extensions": ["ami"]
  },
  "application/vnd.amundsen.maze+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.android.ota": {
    "source": "iana"
  },
  "application/vnd.android.package-archive": {
    "source": "apache",
    "compressible": false,
    "extensions": ["apk"]
  },
  "application/vnd.anki": {
    "source": "iana"
  },
  "application/vnd.anser-web-certificate-issue-initiation": {
    "source": "iana",
    "extensions": ["cii"]
  },
  "application/vnd.anser-web-funds-transfer-initiation": {
    "source": "apache",
    "extensions": ["fti"]
  },
  "application/vnd.antix.game-component": {
    "source": "iana",
    "extensions": ["atx"]
  },
  "application/vnd.apache.thrift.binary": {
    "source": "iana"
  },
  "application/vnd.apache.thrift.compact": {
    "source": "iana"
  },
  "application/vnd.apache.thrift.json": {
    "source": "iana"
  },
  "application/vnd.api+json": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.aplextor.warrp+json": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.apothekende.reservation+json": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.apple.installer+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": ["mpkg"]
  },
  "application/vnd.apple.keynote": {
    "source": "iana",
    "extensions": ["keynote"]
  },
  "application/vnd.apple.mpegurl": {
    "source": "iana",
    "extensions": ["m3u8"]
  },
  "application/vnd.apple.numbers": {
    "source": "iana",
    "extensions": ["numbers"]
  },
  "application/vnd.apple.pages": {
    "source": "iana",
    "extensions": ["pages"]
  },
  "application/vnd.apple.pkpass": {
    "compressible": false,
    "extensions": ["pkpass"]
  },
  "application/vnd.arastra.swi": {
    "source": "iana"
  },
  "application/vnd.aristanetworks.swi": {
    "source": "iana",
    "extensions": ["swi"]
  },
  "application/vnd.artisan+json": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.artsquare": {
    "source": "iana"
  },
  "application/vnd.astraea-software.iota": {
    "source": "iana",
    "extensions": ["iota"]
  },
  "application/vnd.audiograph": {
    "source": "iana",
    "extensions": ["aep"]
  },
  "application/vnd.autopackage": {
    "source": "iana"
  },
  "application/vnd.avalon+json": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.avistar+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.balsamiq.bmml+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": ["bmml"]
  },
  "application/vnd.balsamiq.bmpr": {
    "source": "iana"
  },
  "application/vnd.banana-accounting": {
    "source": "iana"
  },
  "application/vnd.bbf.usp.error": {
    "source": "iana"
  },
  "application/vnd.bbf.usp.msg": {
    "source": "iana"
  },
  "application/vnd.bbf.usp.msg+json": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.bekitzur-stech+json": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.bint.med-content": {
    "source": "iana"
  },
  "application/vnd.biopax.rdf+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.blink-idb-value-wrapper": {
    "source": "iana"
  },
  "application/vnd.blueice.multipass": {
    "source": "iana",
    "extensions": ["mpm"]
  },
  "application/vnd.bluetooth.ep.oob": {
    "source": "iana"
  },
  "application/vnd.bluetooth.le.oob": {
    "source": "iana"
  },
  "application/vnd.bmi": {
    "source": "iana",
    "extensions": ["bmi"]
  },
  "application/vnd.bpf": {
    "source": "iana"
  },
  "application/vnd.bpf3": {
    "source": "iana"
  },
  "application/vnd.businessobjects": {
    "source": "iana",
    "extensions": ["rep"]
  },
  "application/vnd.byu.uapi+json": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.cab-jscript": {
    "source": "iana"
  },
  "application/vnd.canon-cpdl": {
    "source": "iana"
  },
  "application/vnd.canon-lips": {
    "source": "iana"
  },
  "application/vnd.capasystems-pg+json": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.cendio.thinlinc.clientconf": {
    "source": "iana"
  },
  "application/vnd.century-systems.tcp_stream": {
    "source": "iana"
  },
  "application/vnd.chemdraw+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": ["cdxml"]
  },
  "application/vnd.chess-pgn": {
    "source": "iana"
  },
  "application/vnd.chipnuts.karaoke-mmd": {
    "source": "iana",
    "extensions": ["mmd"]
  },
  "application/vnd.ciedi": {
    "source": "iana"
  },
  "application/vnd.cinderella": {
    "source": "iana",
    "extensions": ["cdy"]
  },
  "application/vnd.cirpack.isdn-ext": {
    "source": "iana"
  },
  "application/vnd.citationstyles.style+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": ["csl"]
  },
  "application/vnd.claymore": {
    "source": "iana",
    "extensions": ["cla"]
  },
  "application/vnd.cloanto.rp9": {
    "source": "iana",
    "extensions": ["rp9"]
  },
  "application/vnd.clonk.c4group": {
    "source": "iana",
    "extensions": ["c4g","c4d","c4f","c4p","c4u"]
  },
  "application/vnd.cluetrust.cartomobile-config": {
    "source": "iana",
    "extensions": ["c11amc"]
  },
  "application/vnd.cluetrust.cartomobile-config-pkg": {
    "source": "iana",
    "extensions": ["c11amz"]
  },
  "application/vnd.coffeescript": {
    "source": "iana"
  },
  "application/vnd.collabio.xodocuments.document": {
    "source": "iana"
  },
  "application/vnd.collabio.xodocuments.document-template": {
    "source": "iana"
  },
  "application/vnd.collabio.xodocuments.presentation": {
    "source": "iana"
  },
  "application/vnd.collabio.xodocuments.presentation-template": {
    "source": "iana"
  },
  "application/vnd.collabio.xodocuments.spreadsheet": {
    "source": "iana"
  },
  "application/vnd.collabio.xodocuments.spreadsheet-template": {
    "source": "iana"
  },
  "application/vnd.collection+json": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.collection.doc+json": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.collection.next+json": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.comicbook+zip": {
    "source": "iana",
    "compressible": false
  },
  "application/vnd.comicbook-rar": {
    "source": "iana"
  },
  "application/vnd.commerce-battelle": {
    "source": "iana"
  },
  "application/vnd.commonspace": {
    "source": "iana",
    "extensions": ["csp"]
  },
  "application/vnd.contact.cmsg": {
    "source": "iana",
    "extensions": ["cdbcmsg"]
  },
  "application/vnd.coreos.ignition+json": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.cosmocaller": {
    "source": "iana",
    "extensions": ["cmc"]
  },
  "application/vnd.crick.clicker": {
    "source": "iana",
    "extensions": ["clkx"]
  },
  "application/vnd.crick.clicker.keyboard": {
    "source": "iana",
    "extensions": ["clkk"]
  },
  "application/vnd.crick.clicker.palette": {
    "source": "iana",
    "extensions": ["clkp"]
  },
  "application/vnd.crick.clicker.template": {
    "source": "iana",
    "extensions": ["clkt"]
  },
  "application/vnd.crick.clicker.wordbank": {
    "source": "iana",
    "extensions": ["clkw"]
  },
  "application/vnd.criticaltools.wbs+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": ["wbs"]
  },
  "application/vnd.cryptii.pipe+json": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.crypto-shade-file": {
    "source": "iana"
  },
  "application/vnd.ctc-posml": {
    "source": "iana",
    "extensions": ["pml"]
  },
  "application/vnd.ctct.ws+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.cups-pdf": {
    "source": "iana"
  },
  "application/vnd.cups-postscript": {
    "source": "iana"
  },
  "application/vnd.cups-ppd": {
    "source": "iana",
    "extensions": ["ppd"]
  },
  "application/vnd.cups-raster": {
    "source": "iana"
  },
  "application/vnd.cups-raw": {
    "source": "iana"
  },
  "application/vnd.curl": {
    "source": "iana"
  },
  "application/vnd.curl.car": {
    "source": "apache",
    "extensions": ["car"]
  },
  "application/vnd.curl.pcurl": {
    "source": "apache",
    "extensions": ["pcurl"]
  },
  "application/vnd.cyan.dean.root+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.cybank": {
    "source": "iana"
  },
  "application/vnd.d2l.coursepackage1p0+zip": {
    "source": "iana",
    "compressible": false
  },
  "application/vnd.dart": {
    "source": "iana",
    "compressible": true,
    "extensions": ["dart"]
  },
  "application/vnd.data-vision.rdz": {
    "source": "iana",
    "extensions": ["rdz"]
  },
  "application/vnd.datapackage+json": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.dataresource+json": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.dbf": {
    "source": "iana"
  },
  "application/vnd.debian.binary-package": {
    "source": "iana"
  },
  "application/vnd.dece.data": {
    "source": "iana",
    "extensions": ["uvf","uvvf","uvd","uvvd"]
  },
  "application/vnd.dece.ttml+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": ["uvt","uvvt"]
  },
  "application/vnd.dece.unspecified": {
    "source": "iana",
    "extensions": ["uvx","uvvx"]
  },
  "application/vnd.dece.zip": {
    "source": "iana",
    "extensions": ["uvz","uvvz"]
  },
  "application/vnd.denovo.fcselayout-link": {
    "source": "iana",
    "extensions": ["fe_launch"]
  },
  "application/vnd.desmume.movie": {
    "source": "iana"
  },
  "application/vnd.dir-bi.plate-dl-nosuffix": {
    "source": "iana"
  },
  "application/vnd.dm.delegation+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.dna": {
    "source": "iana",
    "extensions": ["dna"]
  },
  "application/vnd.document+json": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.dolby.mlp": {
    "source": "apache",
    "extensions": ["mlp"]
  },
  "application/vnd.dolby.mobile.1": {
    "source": "iana"
  },
  "application/vnd.dolby.mobile.2": {
    "source": "iana"
  },
  "application/vnd.doremir.scorecloud-binary-document": {
    "source": "iana"
  },
  "application/vnd.dpgraph": {
    "source": "iana",
    "extensions": ["dpg"]
  },
  "application/vnd.dreamfactory": {
    "source": "iana",
    "extensions": ["dfac"]
  },
  "application/vnd.drive+json": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.ds-keypoint": {
    "source": "apache",
    "extensions": ["kpxx"]
  },
  "application/vnd.dtg.local": {
    "source": "iana"
  },
  "application/vnd.dtg.local.flash": {
    "source": "iana"
  },
  "application/vnd.dtg.local.html": {
    "source": "iana"
  },
  "application/vnd.dvb.ait": {
    "source": "iana",
    "extensions": ["ait"]
  },
  "application/vnd.dvb.dvbisl+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.dvb.dvbj": {
    "source": "iana"
  },
  "application/vnd.dvb.esgcontainer": {
    "source": "iana"
  },
  "application/vnd.dvb.ipdcdftnotifaccess": {
    "source": "iana"
  },
  "application/vnd.dvb.ipdcesgaccess": {
    "source": "iana"
  },
  "application/vnd.dvb.ipdcesgaccess2": {
    "source": "iana"
  },
  "application/vnd.dvb.ipdcesgpdd": {
    "source": "iana"
  },
  "application/vnd.dvb.ipdcroaming": {
    "source": "iana"
  },
  "application/vnd.dvb.iptv.alfec-base": {
    "source": "iana"
  },
  "application/vnd.dvb.iptv.alfec-enhancement": {
    "source": "iana"
  },
  "application/vnd.dvb.notif-aggregate-root+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.dvb.notif-container+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.dvb.notif-generic+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.dvb.notif-ia-msglist+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.dvb.notif-ia-registration-request+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.dvb.notif-ia-registration-response+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.dvb.notif-init+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.dvb.pfr": {
    "source": "iana"
  },
  "application/vnd.dvb.service": {
    "source": "iana",
    "extensions": ["svc"]
  },
  "application/vnd.dxr": {
    "source": "iana"
  },
  "application/vnd.dynageo": {
    "source": "iana",
    "extensions": ["geo"]
  },
  "application/vnd.dzr": {
    "source": "iana"
  },
  "application/vnd.easykaraoke.cdgdownload": {
    "source": "iana"
  },
  "application/vnd.ecdis-update": {
    "source": "iana"
  },
  "application/vnd.ecip.rlp": {
    "source": "iana"
  },
  "application/vnd.ecowin.chart": {
    "source": "iana",
    "extensions": ["mag"]
  },
  "application/vnd.ecowin.filerequest": {
    "source": "iana"
  },
  "application/vnd.ecowin.fileupdate": {
    "source": "iana"
  },
  "application/vnd.ecowin.series": {
    "source": "iana"
  },
  "application/vnd.ecowin.seriesrequest": {
    "source": "iana"
  },
  "application/vnd.ecowin.seriesupdate": {
    "source": "iana"
  },
  "application/vnd.efi.img": {
    "source": "iana"
  },
  "application/vnd.efi.iso": {
    "source": "iana"
  },
  "application/vnd.emclient.accessrequest+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.enliven": {
    "source": "iana",
    "extensions": ["nml"]
  },
  "application/vnd.enphase.envoy": {
    "source": "iana"
  },
  "application/vnd.eprints.data+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.epson.esf": {
    "source": "iana",
    "extensions": ["esf"]
  },
  "application/vnd.epson.msf": {
    "source": "iana",
    "extensions": ["msf"]
  },
  "application/vnd.epson.quickanime": {
    "source": "iana",
    "extensions": ["qam"]
  },
  "application/vnd.epson.salt": {
    "source": "iana",
    "extensions": ["slt"]
  },
  "application/vnd.epson.ssf": {
    "source": "iana",
    "extensions": ["ssf"]
  },
  "application/vnd.ericsson.quickcall": {
    "source": "iana"
  },
  "application/vnd.espass-espass+zip": {
    "source": "iana",
    "compressible": false
  },
  "application/vnd.eszigno3+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": ["es3","et3"]
  },
  "application/vnd.etsi.aoc+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.etsi.asic-e+zip": {
    "source": "iana",
    "compressible": false
  },
  "application/vnd.etsi.asic-s+zip": {
    "source": "iana",
    "compressible": false
  },
  "application/vnd.etsi.cug+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.etsi.iptvcommand+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.etsi.iptvdiscovery+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.etsi.iptvprofile+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.etsi.iptvsad-bc+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.etsi.iptvsad-cod+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.etsi.iptvsad-npvr+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.etsi.iptvservice+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.etsi.iptvsync+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.etsi.iptvueprofile+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.etsi.mcid+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.etsi.mheg5": {
    "source": "iana"
  },
  "application/vnd.etsi.overload-control-policy-dataset+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.etsi.pstn+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.etsi.sci+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.etsi.simservs+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.etsi.timestamp-token": {
    "source": "iana"
  },
  "application/vnd.etsi.tsl+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.etsi.tsl.der": {
    "source": "iana"
  },
  "application/vnd.eudora.data": {
    "source": "iana"
  },
  "application/vnd.evolv.ecig.profile": {
    "source": "iana"
  },
  "application/vnd.evolv.ecig.settings": {
    "source": "iana"
  },
  "application/vnd.evolv.ecig.theme": {
    "source": "iana"
  },
  "application/vnd.exstream-empower+zip": {
    "source": "iana",
    "compressible": false
  },
  "application/vnd.exstream-package": {
    "source": "iana"
  },
  "application/vnd.ezpix-album": {
    "source": "iana",
    "extensions": ["ez2"]
  },
  "application/vnd.ezpix-package": {
    "source": "iana",
    "extensions": ["ez3"]
  },
  "application/vnd.f-secure.mobile": {
    "source": "iana"
  },
  "application/vnd.fastcopy-disk-image": {
    "source": "iana"
  },
  "application/vnd.fdf": {
    "source": "iana",
    "extensions": ["fdf"]
  },
  "application/vnd.fdsn.mseed": {
    "source": "iana",
    "extensions": ["mseed"]
  },
  "application/vnd.fdsn.seed": {
    "source": "iana",
    "extensions": ["seed","dataless"]
  },
  "application/vnd.ffsns": {
    "source": "iana"
  },
  "application/vnd.ficlab.flb+zip": {
    "source": "iana",
    "compressible": false
  },
  "application/vnd.filmit.zfc": {
    "source": "iana"
  },
  "application/vnd.fints": {
    "source": "iana"
  },
  "application/vnd.firemonkeys.cloudcell": {
    "source": "iana"
  },
  "application/vnd.flographit": {
    "source": "iana",
    "extensions": ["gph"]
  },
  "application/vnd.fluxtime.clip": {
    "source": "iana",
    "extensions": ["ftc"]
  },
  "application/vnd.font-fontforge-sfd": {
    "source": "iana"
  },
  "application/vnd.framemaker": {
    "source": "iana",
    "extensions": ["fm","frame","maker","book"]
  },
  "application/vnd.frogans.fnc": {
    "source": "iana",
    "extensions": ["fnc"]
  },
  "application/vnd.frogans.ltf": {
    "source": "iana",
    "extensions": ["ltf"]
  },
  "application/vnd.fsc.weblaunch": {
    "source": "iana",
    "extensions": ["fsc"]
  },
  "application/vnd.fujitsu.oasys": {
    "source": "iana",
    "extensions": ["oas"]
  },
  "application/vnd.fujitsu.oasys2": {
    "source": "iana",
    "extensions": ["oa2"]
  },
  "application/vnd.fujitsu.oasys3": {
    "source": "iana",
    "extensions": ["oa3"]
  },
  "application/vnd.fujitsu.oasysgp": {
    "source": "iana",
    "extensions": ["fg5"]
  },
  "application/vnd.fujitsu.oasysprs": {
    "source": "iana",
    "extensions": ["bh2"]
  },
  "application/vnd.fujixerox.art-ex": {
    "source": "iana"
  },
  "application/vnd.fujixerox.art4": {
    "source": "iana"
  },
  "application/vnd.fujixerox.ddd": {
    "source": "iana",
    "extensions": ["ddd"]
  },
  "application/vnd.fujixerox.docuworks": {
    "source": "iana",
    "extensions": ["xdw"]
  },
  "application/vnd.fujixerox.docuworks.binder": {
    "source": "iana",
    "extensions": ["xbd"]
  },
  "application/vnd.fujixerox.docuworks.container": {
    "source": "iana"
  },
  "application/vnd.fujixerox.hbpl": {
    "source": "iana"
  },
  "application/vnd.fut-misnet": {
    "source": "iana"
  },
  "application/vnd.futoin+cbor": {
    "source": "iana"
  },
  "application/vnd.futoin+json": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.fuzzysheet": {
    "source": "iana",
    "extensions": ["fzs"]
  },
  "application/vnd.genomatix.tuxedo": {
    "source": "iana",
    "extensions": ["txd"]
  },
  "application/vnd.gentics.grd+json": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.geo+json": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.geocube+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.geogebra.file": {
    "source": "iana",
    "extensions": ["ggb"]
  },
  "application/vnd.geogebra.tool": {
    "source": "iana",
    "extensions": ["ggt"]
  },
  "application/vnd.geometry-explorer": {
    "source": "iana",
    "extensions": ["gex","gre"]
  },
  "application/vnd.geonext": {
    "source": "iana",
    "extensions": ["gxt"]
  },
  "application/vnd.geoplan": {
    "source": "iana",
    "extensions": ["g2w"]
  },
  "application/vnd.geospace": {
    "source": "iana",
    "extensions": ["g3w"]
  },
  "application/vnd.gerber": {
    "source": "iana"
  },
  "application/vnd.globalplatform.card-content-mgt": {
    "source": "iana"
  },
  "application/vnd.globalplatform.card-content-mgt-response": {
    "source": "iana"
  },
  "application/vnd.gmx": {
    "source": "iana",
    "extensions": ["gmx"]
  },
  "application/vnd.google-apps.document": {
    "compressible": false,
    "extensions": ["gdoc"]
  },
  "application/vnd.google-apps.presentation": {
    "compressible": false,
    "extensions": ["gslides"]
  },
  "application/vnd.google-apps.spreadsheet": {
    "compressible": false,
    "extensions": ["gsheet"]
  },
  "application/vnd.google-earth.kml+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": ["kml"]
  },
  "application/vnd.google-earth.kmz": {
    "source": "iana",
    "compressible": false,
    "extensions": ["kmz"]
  },
  "application/vnd.gov.sk.e-form+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.gov.sk.e-form+zip": {
    "source": "iana",
    "compressible": false
  },
  "application/vnd.gov.sk.xmldatacontainer+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.grafeq": {
    "source": "iana",
    "extensions": ["gqf","gqs"]
  },
  "application/vnd.gridmp": {
    "source": "iana"
  },
  "application/vnd.groove-account": {
    "source": "iana",
    "extensions": ["gac"]
  },
  "application/vnd.groove-help": {
    "source": "iana",
    "extensions": ["ghf"]
  },
  "application/vnd.groove-identity-message": {
    "source": "iana",
    "extensions": ["gim"]
  },
  "application/vnd.groove-injector": {
    "source": "iana",
    "extensions": ["grv"]
  },
  "application/vnd.groove-tool-message": {
    "source": "iana",
    "extensions": ["gtm"]
  },
  "application/vnd.groove-tool-template": {
    "source": "iana",
    "extensions": ["tpl"]
  },
  "application/vnd.groove-vcard": {
    "source": "iana",
    "extensions": ["vcg"]
  },
  "application/vnd.hal+json": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.hal+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": ["hal"]
  },
  "application/vnd.handheld-entertainment+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": ["zmm"]
  },
  "application/vnd.hbci": {
    "source": "iana",
    "extensions": ["hbci"]
  },
  "application/vnd.hc+json": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.hcl-bireports": {
    "source": "iana"
  },
  "application/vnd.hdt": {
    "source": "iana"
  },
  "application/vnd.heroku+json": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.hhe.lesson-player": {
    "source": "iana",
    "extensions": ["les"]
  },
  "application/vnd.hp-hpgl": {
    "source": "iana",
    "extensions": ["hpgl"]
  },
  "application/vnd.hp-hpid": {
    "source": "iana",
    "extensions": ["hpid"]
  },
  "application/vnd.hp-hps": {
    "source": "iana",
    "extensions": ["hps"]
  },
  "application/vnd.hp-jlyt": {
    "source": "iana",
    "extensions": ["jlt"]
  },
  "application/vnd.hp-pcl": {
    "source": "iana",
    "extensions": ["pcl"]
  },
  "application/vnd.hp-pclxl": {
    "source": "iana",
    "extensions": ["pclxl"]
  },
  "application/vnd.httphone": {
    "source": "iana"
  },
  "application/vnd.hydrostatix.sof-data": {
    "source": "iana",
    "extensions": ["sfd-hdstx"]
  },
  "application/vnd.hyper+json": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.hyper-item+json": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.hyperdrive+json": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.hzn-3d-crossword": {
    "source": "iana"
  },
  "application/vnd.ibm.afplinedata": {
    "source": "iana"
  },
  "application/vnd.ibm.electronic-media": {
    "source": "iana"
  },
  "application/vnd.ibm.minipay": {
    "source": "iana",
    "extensions": ["mpy"]
  },
  "application/vnd.ibm.modcap": {
    "source": "iana",
    "extensions": ["afp","listafp","list3820"]
  },
  "application/vnd.ibm.rights-management": {
    "source": "iana",
    "extensions": ["irm"]
  },
  "application/vnd.ibm.secure-container": {
    "source": "iana",
    "extensions": ["sc"]
  },
  "application/vnd.iccprofile": {
    "source": "iana",
    "extensions": ["icc","icm"]
  },
  "application/vnd.ieee.1905": {
    "source": "iana"
  },
  "application/vnd.igloader": {
    "source": "iana",
    "extensions": ["igl"]
  },
  "application/vnd.imagemeter.folder+zip": {
    "source": "iana",
    "compressible": false
  },
  "application/vnd.imagemeter.image+zip": {
    "source": "iana",
    "compressible": false
  },
  "application/vnd.immervision-ivp": {
    "source": "iana",
    "extensions": ["ivp"]
  },
  "application/vnd.immervision-ivu": {
    "source": "iana",
    "extensions": ["ivu"]
  },
  "application/vnd.ims.imsccv1p1": {
    "source": "iana"
  },
  "application/vnd.ims.imsccv1p2": {
    "source": "iana"
  },
  "application/vnd.ims.imsccv1p3": {
    "source": "iana"
  },
  "application/vnd.ims.lis.v2.result+json": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.ims.lti.v2.toolconsumerprofile+json": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.ims.lti.v2.toolproxy+json": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.ims.lti.v2.toolproxy.id+json": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.ims.lti.v2.toolsettings+json": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.ims.lti.v2.toolsettings.simple+json": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.informedcontrol.rms+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.informix-visionary": {
    "source": "iana"
  },
  "application/vnd.infotech.project": {
    "source": "iana"
  },
  "application/vnd.infotech.project+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.innopath.wamp.notification": {
    "source": "iana"
  },
  "application/vnd.insors.igm": {
    "source": "iana",
    "extensions": ["igm"]
  },
  "application/vnd.intercon.formnet": {
    "source": "iana",
    "extensions": ["xpw","xpx"]
  },
  "application/vnd.intergeo": {
    "source": "iana",
    "extensions": ["i2g"]
  },
  "application/vnd.intertrust.digibox": {
    "source": "iana"
  },
  "application/vnd.intertrust.nncp": {
    "source": "iana"
  },
  "application/vnd.intu.qbo": {
    "source": "iana",
    "extensions": ["qbo"]
  },
  "application/vnd.intu.qfx": {
    "source": "iana",
    "extensions": ["qfx"]
  },
  "application/vnd.iptc.g2.catalogitem+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.iptc.g2.conceptitem+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.iptc.g2.knowledgeitem+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.iptc.g2.newsitem+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.iptc.g2.newsmessage+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.iptc.g2.packageitem+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.iptc.g2.planningitem+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.ipunplugged.rcprofile": {
    "source": "iana",
    "extensions": ["rcprofile"]
  },
  "application/vnd.irepository.package+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": ["irp"]
  },
  "application/vnd.is-xpr": {
    "source": "iana",
    "extensions": ["xpr"]
  },
  "application/vnd.isac.fcs": {
    "source": "iana",
    "extensions": ["fcs"]
  },
  "application/vnd.iso11783-10+zip": {
    "source": "iana",
    "compressible": false
  },
  "application/vnd.jam": {
    "source": "iana",
    "extensions": ["jam"]
  },
  "application/vnd.japannet-directory-service": {
    "source": "iana"
  },
  "application/vnd.japannet-jpnstore-wakeup": {
    "source": "iana"
  },
  "application/vnd.japannet-payment-wakeup": {
    "source": "iana"
  },
  "application/vnd.japannet-registration": {
    "source": "iana"
  },
  "application/vnd.japannet-registration-wakeup": {
    "source": "iana"
  },
  "application/vnd.japannet-setstore-wakeup": {
    "source": "iana"
  },
  "application/vnd.japannet-verification": {
    "source": "iana"
  },
  "application/vnd.japannet-verification-wakeup": {
    "source": "iana"
  },
  "application/vnd.jcp.javame.midlet-rms": {
    "source": "iana",
    "extensions": ["rms"]
  },
  "application/vnd.jisp": {
    "source": "iana",
    "extensions": ["jisp"]
  },
  "application/vnd.joost.joda-archive": {
    "source": "iana",
    "extensions": ["joda"]
  },
  "application/vnd.jsk.isdn-ngn": {
    "source": "iana"
  },
  "application/vnd.kahootz": {
    "source": "iana",
    "extensions": ["ktz","ktr"]
  },
  "application/vnd.kde.karbon": {
    "source": "iana",
    "extensions": ["karbon"]
  },
  "application/vnd.kde.kchart": {
    "source": "iana",
    "extensions": ["chrt"]
  },
  "application/vnd.kde.kformula": {
    "source": "iana",
    "extensions": ["kfo"]
  },
  "application/vnd.kde.kivio": {
    "source": "iana",
    "extensions": ["flw"]
  },
  "application/vnd.kde.kontour": {
    "source": "iana",
    "extensions": ["kon"]
  },
  "application/vnd.kde.kpresenter": {
    "source": "iana",
    "extensions": ["kpr","kpt"]
  },
  "application/vnd.kde.kspread": {
    "source": "iana",
    "extensions": ["ksp"]
  },
  "application/vnd.kde.kword": {
    "source": "iana",
    "extensions": ["kwd","kwt"]
  },
  "application/vnd.kenameaapp": {
    "source": "iana",
    "extensions": ["htke"]
  },
  "application/vnd.kidspiration": {
    "source": "iana",
    "extensions": ["kia"]
  },
  "application/vnd.kinar": {
    "source": "iana",
    "extensions": ["kne","knp"]
  },
  "application/vnd.koan": {
    "source": "iana",
    "extensions": ["skp","skd","skt","skm"]
  },
  "application/vnd.kodak-descriptor": {
    "source": "iana",
    "extensions": ["sse"]
  },
  "application/vnd.las": {
    "source": "iana"
  },
  "application/vnd.las.las+json": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.las.las+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": ["lasxml"]
  },
  "application/vnd.laszip": {
    "source": "iana"
  },
  "application/vnd.leap+json": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.liberty-request+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.llamagraphics.life-balance.desktop": {
    "source": "iana",
    "extensions": ["lbd"]
  },
  "application/vnd.llamagraphics.life-balance.exchange+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": ["lbe"]
  },
  "application/vnd.logipipe.circuit+zip": {
    "source": "iana",
    "compressible": false
  },
  "application/vnd.loom": {
    "source": "iana"
  },
  "application/vnd.lotus-1-2-3": {
    "source": "iana",
    "extensions": ["123"]
  },
  "application/vnd.lotus-approach": {
    "source": "iana",
    "extensions": ["apr"]
  },
  "application/vnd.lotus-freelance": {
    "source": "iana",
    "extensions": ["pre"]
  },
  "application/vnd.lotus-notes": {
    "source": "iana",
    "extensions": ["nsf"]
  },
  "application/vnd.lotus-organizer": {
    "source": "iana",
    "extensions": ["org"]
  },
  "application/vnd.lotus-screencam": {
    "source": "iana",
    "extensions": ["scm"]
  },
  "application/vnd.lotus-wordpro": {
    "source": "iana",
    "extensions": ["lwp"]
  },
  "application/vnd.macports.portpkg": {
    "source": "iana",
    "extensions": ["portpkg"]
  },
  "application/vnd.mapbox-vector-tile": {
    "source": "iana"
  },
  "application/vnd.marlin.drm.actiontoken+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.marlin.drm.conftoken+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.marlin.drm.license+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.marlin.drm.mdcf": {
    "source": "iana"
  },
  "application/vnd.mason+json": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.maxmind.maxmind-db": {
    "source": "iana"
  },
  "application/vnd.mcd": {
    "source": "iana",
    "extensions": ["mcd"]
  },
  "application/vnd.medcalcdata": {
    "source": "iana",
    "extensions": ["mc1"]
  },
  "application/vnd.mediastation.cdkey": {
    "source": "iana",
    "extensions": ["cdkey"]
  },
  "application/vnd.meridian-slingshot": {
    "source": "iana"
  },
  "application/vnd.mfer": {
    "source": "iana",
    "extensions": ["mwf"]
  },
  "application/vnd.mfmp": {
    "source": "iana",
    "extensions": ["mfm"]
  },
  "application/vnd.micro+json": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.micrografx.flo": {
    "source": "iana",
    "extensions": ["flo"]
  },
  "application/vnd.micrografx.igx": {
    "source": "iana",
    "extensions": ["igx"]
  },
  "application/vnd.microsoft.portable-executable": {
    "source": "iana"
  },
  "application/vnd.microsoft.windows.thumbnail-cache": {
    "source": "iana"
  },
  "application/vnd.miele+json": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.mif": {
    "source": "iana",
    "extensions": ["mif"]
  },
  "application/vnd.minisoft-hp3000-save": {
    "source": "iana"
  },
  "application/vnd.mitsubishi.misty-guard.trustweb": {
    "source": "iana"
  },
  "application/vnd.mobius.daf": {
    "source": "iana",
    "extensions": ["daf"]
  },
  "application/vnd.mobius.dis": {
    "source": "iana",
    "extensions": ["dis"]
  },
  "application/vnd.mobius.mbk": {
    "source": "iana",
    "extensions": ["mbk"]
  },
  "application/vnd.mobius.mqy": {
    "source": "iana",
    "extensions": ["mqy"]
  },
  "application/vnd.mobius.msl": {
    "source": "iana",
    "extensions": ["msl"]
  },
  "application/vnd.mobius.plc": {
    "source": "iana",
    "extensions": ["plc"]
  },
  "application/vnd.mobius.txf": {
    "source": "iana",
    "extensions": ["txf"]
  },
  "application/vnd.mophun.application": {
    "source": "iana",
    "extensions": ["mpn"]
  },
  "application/vnd.mophun.certificate": {
    "source": "iana",
    "extensions": ["mpc"]
  },
  "application/vnd.motorola.flexsuite": {
    "source": "iana"
  },
  "application/vnd.motorola.flexsuite.adsi": {
    "source": "iana"
  },
  "application/vnd.motorola.flexsuite.fis": {
    "source": "iana"
  },
  "application/vnd.motorola.flexsuite.gotap": {
    "source": "iana"
  },
  "application/vnd.motorola.flexsuite.kmr": {
    "source": "iana"
  },
  "application/vnd.motorola.flexsuite.ttc": {
    "source": "iana"
  },
  "application/vnd.motorola.flexsuite.wem": {
    "source": "iana"
  },
  "application/vnd.motorola.iprm": {
    "source": "iana"
  },
  "application/vnd.mozilla.xul+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": ["xul"]
  },
  "application/vnd.ms-3mfdocument": {
    "source": "iana"
  },
  "application/vnd.ms-artgalry": {
    "source": "iana",
    "extensions": ["cil"]
  },
  "application/vnd.ms-asf": {
    "source": "iana"
  },
  "application/vnd.ms-cab-compressed": {
    "source": "iana",
    "extensions": ["cab"]
  },
  "application/vnd.ms-color.iccprofile": {
    "source": "apache"
  },
  "application/vnd.ms-excel": {
    "source": "iana",
    "compressible": false,
    "extensions": ["xls","xlm","xla","xlc","xlt","xlw"]
  },
  "application/vnd.ms-excel.addin.macroenabled.12": {
    "source": "iana",
    "extensions": ["xlam"]
  },
  "application/vnd.ms-excel.sheet.binary.macroenabled.12": {
    "source": "iana",
    "extensions": ["xlsb"]
  },
  "application/vnd.ms-excel.sheet.macroenabled.12": {
    "source": "iana",
    "extensions": ["xlsm"]
  },
  "application/vnd.ms-excel.template.macroenabled.12": {
    "source": "iana",
    "extensions": ["xltm"]
  },
  "application/vnd.ms-fontobject": {
    "source": "iana",
    "compressible": true,
    "extensions": ["eot"]
  },
  "application/vnd.ms-htmlhelp": {
    "source": "iana",
    "extensions": ["chm"]
  },
  "application/vnd.ms-ims": {
    "source": "iana",
    "extensions": ["ims"]
  },
  "application/vnd.ms-lrm": {
    "source": "iana",
    "extensions": ["lrm"]
  },
  "application/vnd.ms-office.activex+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.ms-officetheme": {
    "source": "iana",
    "extensions": ["thmx"]
  },
  "application/vnd.ms-opentype": {
    "source": "apache",
    "compressible": true
  },
  "application/vnd.ms-outlook": {
    "compressible": false,
    "extensions": ["msg"]
  },
  "application/vnd.ms-package.obfuscated-opentype": {
    "source": "apache"
  },
  "application/vnd.ms-pki.seccat": {
    "source": "apache",
    "extensions": ["cat"]
  },
  "application/vnd.ms-pki.stl": {
    "source": "apache",
    "extensions": ["stl"]
  },
  "application/vnd.ms-playready.initiator+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.ms-powerpoint": {
    "source": "iana",
    "compressible": false,
    "extensions": ["ppt","pps","pot"]
  },
  "application/vnd.ms-powerpoint.addin.macroenabled.12": {
    "source": "iana",
    "extensions": ["ppam"]
  },
  "application/vnd.ms-powerpoint.presentation.macroenabled.12": {
    "source": "iana",
    "extensions": ["pptm"]
  },
  "application/vnd.ms-powerpoint.slide.macroenabled.12": {
    "source": "iana",
    "extensions": ["sldm"]
  },
  "application/vnd.ms-powerpoint.slideshow.macroenabled.12": {
    "source": "iana",
    "extensions": ["ppsm"]
  },
  "application/vnd.ms-powerpoint.template.macroenabled.12": {
    "source": "iana",
    "extensions": ["potm"]
  },
  "application/vnd.ms-printdevicecapabilities+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.ms-printing.printticket+xml": {
    "source": "apache",
    "compressible": true
  },
  "application/vnd.ms-printschematicket+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.ms-project": {
    "source": "iana",
    "extensions": ["mpp","mpt"]
  },
  "application/vnd.ms-tnef": {
    "source": "iana"
  },
  "application/vnd.ms-windows.devicepairing": {
    "source": "iana"
  },
  "application/vnd.ms-windows.nwprinting.oob": {
    "source": "iana"
  },
  "application/vnd.ms-windows.printerpairing": {
    "source": "iana"
  },
  "application/vnd.ms-windows.wsd.oob": {
    "source": "iana"
  },
  "application/vnd.ms-wmdrm.lic-chlg-req": {
    "source": "iana"
  },
  "application/vnd.ms-wmdrm.lic-resp": {
    "source": "iana"
  },
  "application/vnd.ms-wmdrm.meter-chlg-req": {
    "source": "iana"
  },
  "application/vnd.ms-wmdrm.meter-resp": {
    "source": "iana"
  },
  "application/vnd.ms-word.document.macroenabled.12": {
    "source": "iana",
    "extensions": ["docm"]
  },
  "application/vnd.ms-word.template.macroenabled.12": {
    "source": "iana",
    "extensions": ["dotm"]
  },
  "application/vnd.ms-works": {
    "source": "iana",
    "extensions": ["wps","wks","wcm","wdb"]
  },
  "application/vnd.ms-wpl": {
    "source": "iana",
    "extensions": ["wpl"]
  },
  "application/vnd.ms-xpsdocument": {
    "source": "iana",
    "compressible": false,
    "extensions": ["xps"]
  },
  "application/vnd.msa-disk-image": {
    "source": "iana"
  },
  "application/vnd.mseq": {
    "source": "iana",
    "extensions": ["mseq"]
  },
  "application/vnd.msign": {
    "source": "iana"
  },
  "application/vnd.multiad.creator": {
    "source": "iana"
  },
  "application/vnd.multiad.creator.cif": {
    "source": "iana"
  },
  "application/vnd.music-niff": {
    "source": "iana"
  },
  "application/vnd.musician": {
    "source": "iana",
    "extensions": ["mus"]
  },
  "application/vnd.muvee.style": {
    "source": "iana",
    "extensions": ["msty"]
  },
  "application/vnd.mynfc": {
    "source": "iana",
    "extensions": ["taglet"]
  },
  "application/vnd.ncd.control": {
    "source": "iana"
  },
  "application/vnd.ncd.reference": {
    "source": "iana"
  },
  "application/vnd.nearst.inv+json": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.nervana": {
    "source": "iana"
  },
  "application/vnd.netfpx": {
    "source": "iana"
  },
  "application/vnd.neurolanguage.nlu": {
    "source": "iana",
    "extensions": ["nlu"]
  },
  "application/vnd.nimn": {
    "source": "iana"
  },
  "application/vnd.nintendo.nitro.rom": {
    "source": "iana"
  },
  "application/vnd.nintendo.snes.rom": {
    "source": "iana"
  },
  "application/vnd.nitf": {
    "source": "iana",
    "extensions": ["ntf","nitf"]
  },
  "application/vnd.noblenet-directory": {
    "source": "iana",
    "extensions": ["nnd"]
  },
  "application/vnd.noblenet-sealer": {
    "source": "iana",
    "extensions": ["nns"]
  },
  "application/vnd.noblenet-web": {
    "source": "iana",
    "extensions": ["nnw"]
  },
  "application/vnd.nokia.catalogs": {
    "source": "iana"
  },
  "application/vnd.nokia.conml+wbxml": {
    "source": "iana"
  },
  "application/vnd.nokia.conml+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.nokia.iptv.config+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.nokia.isds-radio-presets": {
    "source": "iana"
  },
  "application/vnd.nokia.landmark+wbxml": {
    "source": "iana"
  },
  "application/vnd.nokia.landmark+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.nokia.landmarkcollection+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.nokia.n-gage.ac+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": ["ac"]
  },
  "application/vnd.nokia.n-gage.data": {
    "source": "iana",
    "extensions": ["ngdat"]
  },
  "application/vnd.nokia.n-gage.symbian.install": {
    "source": "iana",
    "extensions": ["n-gage"]
  },
  "application/vnd.nokia.ncd": {
    "source": "iana"
  },
  "application/vnd.nokia.pcd+wbxml": {
    "source": "iana"
  },
  "application/vnd.nokia.pcd+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.nokia.radio-preset": {
    "source": "iana",
    "extensions": ["rpst"]
  },
  "application/vnd.nokia.radio-presets": {
    "source": "iana",
    "extensions": ["rpss"]
  },
  "application/vnd.novadigm.edm": {
    "source": "iana",
    "extensions": ["edm"]
  },
  "application/vnd.novadigm.edx": {
    "source": "iana",
    "extensions": ["edx"]
  },
  "application/vnd.novadigm.ext": {
    "source": "iana",
    "extensions": ["ext"]
  },
  "application/vnd.ntt-local.content-share": {
    "source": "iana"
  },
  "application/vnd.ntt-local.file-transfer": {
    "source": "iana"
  },
  "application/vnd.ntt-local.ogw_remote-access": {
    "source": "iana"
  },
  "application/vnd.ntt-local.sip-ta_remote": {
    "source": "iana"
  },
  "application/vnd.ntt-local.sip-ta_tcp_stream": {
    "source": "iana"
  },
  "application/vnd.oasis.opendocument.chart": {
    "source": "iana",
    "extensions": ["odc"]
  },
  "application/vnd.oasis.opendocument.chart-template": {
    "source": "iana",
    "extensions": ["otc"]
  },
  "application/vnd.oasis.opendocument.database": {
    "source": "iana",
    "extensions": ["odb"]
  },
  "application/vnd.oasis.opendocument.formula": {
    "source": "iana",
    "extensions": ["odf"]
  },
  "application/vnd.oasis.opendocument.formula-template": {
    "source": "iana",
    "extensions": ["odft"]
  },
  "application/vnd.oasis.opendocument.graphics": {
    "source": "iana",
    "compressible": false,
    "extensions": ["odg"]
  },
  "application/vnd.oasis.opendocument.graphics-template": {
    "source": "iana",
    "extensions": ["otg"]
  },
  "application/vnd.oasis.opendocument.image": {
    "source": "iana",
    "extensions": ["odi"]
  },
  "application/vnd.oasis.opendocument.image-template": {
    "source": "iana",
    "extensions": ["oti"]
  },
  "application/vnd.oasis.opendocument.presentation": {
    "source": "iana",
    "compressible": false,
    "extensions": ["odp"]
  },
  "application/vnd.oasis.opendocument.presentation-template": {
    "source": "iana",
    "extensions": ["otp"]
  },
  "application/vnd.oasis.opendocument.spreadsheet": {
    "source": "iana",
    "compressible": false,
    "extensions": ["ods"]
  },
  "application/vnd.oasis.opendocument.spreadsheet-template": {
    "source": "iana",
    "extensions": ["ots"]
  },
  "application/vnd.oasis.opendocument.text": {
    "source": "iana",
    "compressible": false,
    "extensions": ["odt"]
  },
  "application/vnd.oasis.opendocument.text-master": {
    "source": "iana",
    "extensions": ["odm"]
  },
  "application/vnd.oasis.opendocument.text-template": {
    "source": "iana",
    "extensions": ["ott"]
  },
  "application/vnd.oasis.opendocument.text-web": {
    "source": "iana",
    "extensions": ["oth"]
  },
  "application/vnd.obn": {
    "source": "iana"
  },
  "application/vnd.ocf+cbor": {
    "source": "iana"
  },
  "application/vnd.oci.image.manifest.v1+json": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.oftn.l10n+json": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.oipf.contentaccessdownload+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.oipf.contentaccessstreaming+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.oipf.cspg-hexbinary": {
    "source": "iana"
  },
  "application/vnd.oipf.dae.svg+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.oipf.dae.xhtml+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.oipf.mippvcontrolmessage+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.oipf.pae.gem": {
    "source": "iana"
  },
  "application/vnd.oipf.spdiscovery+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.oipf.spdlist+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.oipf.ueprofile+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.oipf.userprofile+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.olpc-sugar": {
    "source": "iana",
    "extensions": ["xo"]
  },
  "application/vnd.oma-scws-config": {
    "source": "iana"
  },
  "application/vnd.oma-scws-http-request": {
    "source": "iana"
  },
  "application/vnd.oma-scws-http-response": {
    "source": "iana"
  },
  "application/vnd.oma.bcast.associated-procedure-parameter+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.oma.bcast.drm-trigger+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.oma.bcast.imd+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.oma.bcast.ltkm": {
    "source": "iana"
  },
  "application/vnd.oma.bcast.notification+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.oma.bcast.provisioningtrigger": {
    "source": "iana"
  },
  "application/vnd.oma.bcast.sgboot": {
    "source": "iana"
  },
  "application/vnd.oma.bcast.sgdd+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.oma.bcast.sgdu": {
    "source": "iana"
  },
  "application/vnd.oma.bcast.simple-symbol-container": {
    "source": "iana"
  },
  "application/vnd.oma.bcast.smartcard-trigger+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.oma.bcast.sprov+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.oma.bcast.stkm": {
    "source": "iana"
  },
  "application/vnd.oma.cab-address-book+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.oma.cab-feature-handler+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.oma.cab-pcc+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.oma.cab-subs-invite+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.oma.cab-user-prefs+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.oma.dcd": {
    "source": "iana"
  },
  "application/vnd.oma.dcdc": {
    "source": "iana"
  },
  "application/vnd.oma.dd2+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": ["dd2"]
  },
  "application/vnd.oma.drm.risd+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.oma.group-usage-list+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.oma.lwm2m+json": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.oma.lwm2m+tlv": {
    "source": "iana"
  },
  "application/vnd.oma.pal+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.oma.poc.detailed-progress-report+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.oma.poc.final-report+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.oma.poc.groups+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.oma.poc.invocation-descriptor+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.oma.poc.optimized-progress-report+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.oma.push": {
    "source": "iana"
  },
  "application/vnd.oma.scidm.messages+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.oma.xcap-directory+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.omads-email+xml": {
    "source": "iana",
    "charset": "UTF-8",
    "compressible": true
  },
  "application/vnd.omads-file+xml": {
    "source": "iana",
    "charset": "UTF-8",
    "compressible": true
  },
  "application/vnd.omads-folder+xml": {
    "source": "iana",
    "charset": "UTF-8",
    "compressible": true
  },
  "application/vnd.omaloc-supl-init": {
    "source": "iana"
  },
  "application/vnd.onepager": {
    "source": "iana"
  },
  "application/vnd.onepagertamp": {
    "source": "iana"
  },
  "application/vnd.onepagertamx": {
    "source": "iana"
  },
  "application/vnd.onepagertat": {
    "source": "iana"
  },
  "application/vnd.onepagertatp": {
    "source": "iana"
  },
  "application/vnd.onepagertatx": {
    "source": "iana"
  },
  "application/vnd.openblox.game+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": ["obgx"]
  },
  "application/vnd.openblox.game-binary": {
    "source": "iana"
  },
  "application/vnd.openeye.oeb": {
    "source": "iana"
  },
  "application/vnd.openofficeorg.extension": {
    "source": "apache",
    "extensions": ["oxt"]
  },
  "application/vnd.openstreetmap.data+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": ["osm"]
  },
  "application/vnd.openxmlformats-officedocument.custom-properties+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.openxmlformats-officedocument.customxmlproperties+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.openxmlformats-officedocument.drawing+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.openxmlformats-officedocument.drawingml.chart+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.openxmlformats-officedocument.drawingml.chartshapes+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.openxmlformats-officedocument.drawingml.diagramcolors+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.openxmlformats-officedocument.drawingml.diagramdata+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.openxmlformats-officedocument.drawingml.diagramlayout+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.openxmlformats-officedocument.drawingml.diagramstyle+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.openxmlformats-officedocument.extended-properties+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.openxmlformats-officedocument.presentationml.commentauthors+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.openxmlformats-officedocument.presentationml.comments+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.openxmlformats-officedocument.presentationml.handoutmaster+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.openxmlformats-officedocument.presentationml.notesmaster+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.openxmlformats-officedocument.presentationml.notesslide+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.openxmlformats-officedocument.presentationml.presentation": {
    "source": "iana",
    "compressible": false,
    "extensions": ["pptx"]
  },
  "application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.openxmlformats-officedocument.presentationml.presprops+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.openxmlformats-officedocument.presentationml.slide": {
    "source": "iana",
    "extensions": ["sldx"]
  },
  "application/vnd.openxmlformats-officedocument.presentationml.slide+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.openxmlformats-officedocument.presentationml.slidelayout+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.openxmlformats-officedocument.presentationml.slidemaster+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.openxmlformats-officedocument.presentationml.slideshow": {
    "source": "iana",
    "extensions": ["ppsx"]
  },
  "application/vnd.openxmlformats-officedocument.presentationml.slideshow.main+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.openxmlformats-officedocument.presentationml.slideupdateinfo+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.openxmlformats-officedocument.presentationml.tablestyles+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.openxmlformats-officedocument.presentationml.tags+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.openxmlformats-officedocument.presentationml.template": {
    "source": "iana",
    "extensions": ["potx"]
  },
  "application/vnd.openxmlformats-officedocument.presentationml.template.main+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.openxmlformats-officedocument.presentationml.viewprops+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.calcchain+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.chartsheet+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.comments+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.connections+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.dialogsheet+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.externallink+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.pivotcachedefinition+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.pivotcacherecords+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.pivottable+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.querytable+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.revisionheaders+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.revisionlog+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sharedstrings+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": {
    "source": "iana",
    "compressible": false,
    "extensions": ["xlsx"]
  },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheetmetadata+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.table+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.tablesinglecells+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.template": {
    "source": "iana",
    "extensions": ["xltx"]
  },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.template.main+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.usernames+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.volatiledependencies+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.openxmlformats-officedocument.theme+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.openxmlformats-officedocument.themeoverride+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.openxmlformats-officedocument.vmldrawing": {
    "source": "iana"
  },
  "application/vnd.openxmlformats-officedocument.wordprocessingml.comments+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": {
    "source": "iana",
    "compressible": false,
    "extensions": ["docx"]
  },
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document.glossary+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.openxmlformats-officedocument.wordprocessingml.endnotes+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.openxmlformats-officedocument.wordprocessingml.fonttable+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.openxmlformats-officedocument.wordprocessingml.footer+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.openxmlformats-officedocument.wordprocessingml.footnotes+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.openxmlformats-officedocument.wordprocessingml.numbering+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.openxmlformats-officedocument.wordprocessingml.settings+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.openxmlformats-officedocument.wordprocessingml.template": {
    "source": "iana",
    "extensions": ["dotx"]
  },
  "application/vnd.openxmlformats-officedocument.wordprocessingml.template.main+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.openxmlformats-officedocument.wordprocessingml.websettings+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.openxmlformats-package.core-properties+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.openxmlformats-package.digital-signature-xmlsignature+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.openxmlformats-package.relationships+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.oracle.resource+json": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.orange.indata": {
    "source": "iana"
  },
  "application/vnd.osa.netdeploy": {
    "source": "iana"
  },
  "application/vnd.osgeo.mapguide.package": {
    "source": "iana",
    "extensions": ["mgp"]
  },
  "application/vnd.osgi.bundle": {
    "source": "iana"
  },
  "application/vnd.osgi.dp": {
    "source": "iana",
    "extensions": ["dp"]
  },
  "application/vnd.osgi.subsystem": {
    "source": "iana",
    "extensions": ["esa"]
  },
  "application/vnd.otps.ct-kip+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.oxli.countgraph": {
    "source": "iana"
  },
  "application/vnd.pagerduty+json": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.palm": {
    "source": "iana",
    "extensions": ["pdb","pqa","oprc"]
  },
  "application/vnd.panoply": {
    "source": "iana"
  },
  "application/vnd.paos.xml": {
    "source": "iana"
  },
  "application/vnd.patentdive": {
    "source": "iana"
  },
  "application/vnd.patientecommsdoc": {
    "source": "iana"
  },
  "application/vnd.pawaafile": {
    "source": "iana",
    "extensions": ["paw"]
  },
  "application/vnd.pcos": {
    "source": "iana"
  },
  "application/vnd.pg.format": {
    "source": "iana",
    "extensions": ["str"]
  },
  "application/vnd.pg.osasli": {
    "source": "iana",
    "extensions": ["ei6"]
  },
  "application/vnd.piaccess.application-licence": {
    "source": "iana"
  },
  "application/vnd.picsel": {
    "source": "iana",
    "extensions": ["efif"]
  },
  "application/vnd.pmi.widget": {
    "source": "iana",
    "extensions": ["wg"]
  },
  "application/vnd.poc.group-advertisement+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.pocketlearn": {
    "source": "iana",
    "extensions": ["plf"]
  },
  "application/vnd.powerbuilder6": {
    "source": "iana",
    "extensions": ["pbd"]
  },
  "application/vnd.powerbuilder6-s": {
    "source": "iana"
  },
  "application/vnd.powerbuilder7": {
    "source": "iana"
  },
  "application/vnd.powerbuilder7-s": {
    "source": "iana"
  },
  "application/vnd.powerbuilder75": {
    "source": "iana"
  },
  "application/vnd.powerbuilder75-s": {
    "source": "iana"
  },
  "application/vnd.preminet": {
    "source": "iana"
  },
  "application/vnd.previewsystems.box": {
    "source": "iana",
    "extensions": ["box"]
  },
  "application/vnd.proteus.magazine": {
    "source": "iana",
    "extensions": ["mgz"]
  },
  "application/vnd.psfs": {
    "source": "iana"
  },
  "application/vnd.publishare-delta-tree": {
    "source": "iana",
    "extensions": ["qps"]
  },
  "application/vnd.pvi.ptid1": {
    "source": "iana",
    "extensions": ["ptid"]
  },
  "application/vnd.pwg-multiplexed": {
    "source": "iana"
  },
  "application/vnd.pwg-xhtml-print+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.qualcomm.brew-app-res": {
    "source": "iana"
  },
  "application/vnd.quarantainenet": {
    "source": "iana"
  },
  "application/vnd.quark.quarkxpress": {
    "source": "iana",
    "extensions": ["qxd","qxt","qwd","qwt","qxl","qxb"]
  },
  "application/vnd.quobject-quoxdocument": {
    "source": "iana"
  },
  "application/vnd.radisys.moml+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.radisys.msml+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.radisys.msml-audit+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.radisys.msml-audit-conf+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.radisys.msml-audit-conn+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.radisys.msml-audit-dialog+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.radisys.msml-audit-stream+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.radisys.msml-conf+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.radisys.msml-dialog+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.radisys.msml-dialog-base+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.radisys.msml-dialog-fax-detect+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.radisys.msml-dialog-fax-sendrecv+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.radisys.msml-dialog-group+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.radisys.msml-dialog-speech+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.radisys.msml-dialog-transform+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.rainstor.data": {
    "source": "iana"
  },
  "application/vnd.rapid": {
    "source": "iana"
  },
  "application/vnd.rar": {
    "source": "iana"
  },
  "application/vnd.realvnc.bed": {
    "source": "iana",
    "extensions": ["bed"]
  },
  "application/vnd.recordare.musicxml": {
    "source": "iana",
    "extensions": ["mxl"]
  },
  "application/vnd.recordare.musicxml+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": ["musicxml"]
  },
  "application/vnd.renlearn.rlprint": {
    "source": "iana"
  },
  "application/vnd.restful+json": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.rig.cryptonote": {
    "source": "iana",
    "extensions": ["cryptonote"]
  },
  "application/vnd.rim.cod": {
    "source": "apache",
    "extensions": ["cod"]
  },
  "application/vnd.rn-realmedia": {
    "source": "apache",
    "extensions": ["rm"]
  },
  "application/vnd.rn-realmedia-vbr": {
    "source": "apache",
    "extensions": ["rmvb"]
  },
  "application/vnd.route66.link66+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": ["link66"]
  },
  "application/vnd.rs-274x": {
    "source": "iana"
  },
  "application/vnd.ruckus.download": {
    "source": "iana"
  },
  "application/vnd.s3sms": {
    "source": "iana"
  },
  "application/vnd.sailingtracker.track": {
    "source": "iana",
    "extensions": ["st"]
  },
  "application/vnd.sar": {
    "source": "iana"
  },
  "application/vnd.sbm.cid": {
    "source": "iana"
  },
  "application/vnd.sbm.mid2": {
    "source": "iana"
  },
  "application/vnd.scribus": {
    "source": "iana"
  },
  "application/vnd.sealed.3df": {
    "source": "iana"
  },
  "application/vnd.sealed.csf": {
    "source": "iana"
  },
  "application/vnd.sealed.doc": {
    "source": "iana"
  },
  "application/vnd.sealed.eml": {
    "source": "iana"
  },
  "application/vnd.sealed.mht": {
    "source": "iana"
  },
  "application/vnd.sealed.net": {
    "source": "iana"
  },
  "application/vnd.sealed.ppt": {
    "source": "iana"
  },
  "application/vnd.sealed.tiff": {
    "source": "iana"
  },
  "application/vnd.sealed.xls": {
    "source": "iana"
  },
  "application/vnd.sealedmedia.softseal.html": {
    "source": "iana"
  },
  "application/vnd.sealedmedia.softseal.pdf": {
    "source": "iana"
  },
  "application/vnd.seemail": {
    "source": "iana",
    "extensions": ["see"]
  },
  "application/vnd.sema": {
    "source": "iana",
    "extensions": ["sema"]
  },
  "application/vnd.semd": {
    "source": "iana",
    "extensions": ["semd"]
  },
  "application/vnd.semf": {
    "source": "iana",
    "extensions": ["semf"]
  },
  "application/vnd.shade-save-file": {
    "source": "iana"
  },
  "application/vnd.shana.informed.formdata": {
    "source": "iana",
    "extensions": ["ifm"]
  },
  "application/vnd.shana.informed.formtemplate": {
    "source": "iana",
    "extensions": ["itp"]
  },
  "application/vnd.shana.informed.interchange": {
    "source": "iana",
    "extensions": ["iif"]
  },
  "application/vnd.shana.informed.package": {
    "source": "iana",
    "extensions": ["ipk"]
  },
  "application/vnd.shootproof+json": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.shopkick+json": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.shp": {
    "source": "iana"
  },
  "application/vnd.shx": {
    "source": "iana"
  },
  "application/vnd.sigrok.session": {
    "source": "iana"
  },
  "application/vnd.simtech-mindmapper": {
    "source": "iana",
    "extensions": ["twd","twds"]
  },
  "application/vnd.siren+json": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.smaf": {
    "source": "iana",
    "extensions": ["mmf"]
  },
  "application/vnd.smart.notebook": {
    "source": "iana"
  },
  "application/vnd.smart.teacher": {
    "source": "iana",
    "extensions": ["teacher"]
  },
  "application/vnd.snesdev-page-table": {
    "source": "iana"
  },
  "application/vnd.software602.filler.form+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": ["fo"]
  },
  "application/vnd.software602.filler.form-xml-zip": {
    "source": "iana"
  },
  "application/vnd.solent.sdkm+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": ["sdkm","sdkd"]
  },
  "application/vnd.spotfire.dxp": {
    "source": "iana",
    "extensions": ["dxp"]
  },
  "application/vnd.spotfire.sfs": {
    "source": "iana",
    "extensions": ["sfs"]
  },
  "application/vnd.sqlite3": {
    "source": "iana"
  },
  "application/vnd.sss-cod": {
    "source": "iana"
  },
  "application/vnd.sss-dtf": {
    "source": "iana"
  },
  "application/vnd.sss-ntf": {
    "source": "iana"
  },
  "application/vnd.stardivision.calc": {
    "source": "apache",
    "extensions": ["sdc"]
  },
  "application/vnd.stardivision.draw": {
    "source": "apache",
    "extensions": ["sda"]
  },
  "application/vnd.stardivision.impress": {
    "source": "apache",
    "extensions": ["sdd"]
  },
  "application/vnd.stardivision.math": {
    "source": "apache",
    "extensions": ["smf"]
  },
  "application/vnd.stardivision.writer": {
    "source": "apache",
    "extensions": ["sdw","vor"]
  },
  "application/vnd.stardivision.writer-global": {
    "source": "apache",
    "extensions": ["sgl"]
  },
  "application/vnd.stepmania.package": {
    "source": "iana",
    "extensions": ["smzip"]
  },
  "application/vnd.stepmania.stepchart": {
    "source": "iana",
    "extensions": ["sm"]
  },
  "application/vnd.street-stream": {
    "source": "iana"
  },
  "application/vnd.sun.wadl+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": ["wadl"]
  },
  "application/vnd.sun.xml.calc": {
    "source": "apache",
    "extensions": ["sxc"]
  },
  "application/vnd.sun.xml.calc.template": {
    "source": "apache",
    "extensions": ["stc"]
  },
  "application/vnd.sun.xml.draw": {
    "source": "apache",
    "extensions": ["sxd"]
  },
  "application/vnd.sun.xml.draw.template": {
    "source": "apache",
    "extensions": ["std"]
  },
  "application/vnd.sun.xml.impress": {
    "source": "apache",
    "extensions": ["sxi"]
  },
  "application/vnd.sun.xml.impress.template": {
    "source": "apache",
    "extensions": ["sti"]
  },
  "application/vnd.sun.xml.math": {
    "source": "apache",
    "extensions": ["sxm"]
  },
  "application/vnd.sun.xml.writer": {
    "source": "apache",
    "extensions": ["sxw"]
  },
  "application/vnd.sun.xml.writer.global": {
    "source": "apache",
    "extensions": ["sxg"]
  },
  "application/vnd.sun.xml.writer.template": {
    "source": "apache",
    "extensions": ["stw"]
  },
  "application/vnd.sus-calendar": {
    "source": "iana",
    "extensions": ["sus","susp"]
  },
  "application/vnd.svd": {
    "source": "iana",
    "extensions": ["svd"]
  },
  "application/vnd.swiftview-ics": {
    "source": "iana"
  },
  "application/vnd.symbian.install": {
    "source": "apache",
    "extensions": ["sis","sisx"]
  },
  "application/vnd.syncml+xml": {
    "source": "iana",
    "charset": "UTF-8",
    "compressible": true,
    "extensions": ["xsm"]
  },
  "application/vnd.syncml.dm+wbxml": {
    "source": "iana",
    "charset": "UTF-8",
    "extensions": ["bdm"]
  },
  "application/vnd.syncml.dm+xml": {
    "source": "iana",
    "charset": "UTF-8",
    "compressible": true,
    "extensions": ["xdm"]
  },
  "application/vnd.syncml.dm.notification": {
    "source": "iana"
  },
  "application/vnd.syncml.dmddf+wbxml": {
    "source": "iana"
  },
  "application/vnd.syncml.dmddf+xml": {
    "source": "iana",
    "charset": "UTF-8",
    "compressible": true,
    "extensions": ["ddf"]
  },
  "application/vnd.syncml.dmtnds+wbxml": {
    "source": "iana"
  },
  "application/vnd.syncml.dmtnds+xml": {
    "source": "iana",
    "charset": "UTF-8",
    "compressible": true
  },
  "application/vnd.syncml.ds.notification": {
    "source": "iana"
  },
  "application/vnd.tableschema+json": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.tao.intent-module-archive": {
    "source": "iana",
    "extensions": ["tao"]
  },
  "application/vnd.tcpdump.pcap": {
    "source": "iana",
    "extensions": ["pcap","cap","dmp"]
  },
  "application/vnd.think-cell.ppttc+json": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.tmd.mediaflex.api+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.tml": {
    "source": "iana"
  },
  "application/vnd.tmobile-livetv": {
    "source": "iana",
    "extensions": ["tmo"]
  },
  "application/vnd.tri.onesource": {
    "source": "iana"
  },
  "application/vnd.trid.tpt": {
    "source": "iana",
    "extensions": ["tpt"]
  },
  "application/vnd.triscape.mxs": {
    "source": "iana",
    "extensions": ["mxs"]
  },
  "application/vnd.trueapp": {
    "source": "iana",
    "extensions": ["tra"]
  },
  "application/vnd.truedoc": {
    "source": "iana"
  },
  "application/vnd.ubisoft.webplayer": {
    "source": "iana"
  },
  "application/vnd.ufdl": {
    "source": "iana",
    "extensions": ["ufd","ufdl"]
  },
  "application/vnd.uiq.theme": {
    "source": "iana",
    "extensions": ["utz"]
  },
  "application/vnd.umajin": {
    "source": "iana",
    "extensions": ["umj"]
  },
  "application/vnd.unity": {
    "source": "iana",
    "extensions": ["unityweb"]
  },
  "application/vnd.uoml+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": ["uoml"]
  },
  "application/vnd.uplanet.alert": {
    "source": "iana"
  },
  "application/vnd.uplanet.alert-wbxml": {
    "source": "iana"
  },
  "application/vnd.uplanet.bearer-choice": {
    "source": "iana"
  },
  "application/vnd.uplanet.bearer-choice-wbxml": {
    "source": "iana"
  },
  "application/vnd.uplanet.cacheop": {
    "source": "iana"
  },
  "application/vnd.uplanet.cacheop-wbxml": {
    "source": "iana"
  },
  "application/vnd.uplanet.channel": {
    "source": "iana"
  },
  "application/vnd.uplanet.channel-wbxml": {
    "source": "iana"
  },
  "application/vnd.uplanet.list": {
    "source": "iana"
  },
  "application/vnd.uplanet.list-wbxml": {
    "source": "iana"
  },
  "application/vnd.uplanet.listcmd": {
    "source": "iana"
  },
  "application/vnd.uplanet.listcmd-wbxml": {
    "source": "iana"
  },
  "application/vnd.uplanet.signal": {
    "source": "iana"
  },
  "application/vnd.uri-map": {
    "source": "iana"
  },
  "application/vnd.valve.source.material": {
    "source": "iana"
  },
  "application/vnd.vcx": {
    "source": "iana",
    "extensions": ["vcx"]
  },
  "application/vnd.vd-study": {
    "source": "iana"
  },
  "application/vnd.vectorworks": {
    "source": "iana"
  },
  "application/vnd.vel+json": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.verimatrix.vcas": {
    "source": "iana"
  },
  "application/vnd.veryant.thin": {
    "source": "iana"
  },
  "application/vnd.ves.encrypted": {
    "source": "iana"
  },
  "application/vnd.vidsoft.vidconference": {
    "source": "iana"
  },
  "application/vnd.visio": {
    "source": "iana",
    "extensions": ["vsd","vst","vss","vsw"]
  },
  "application/vnd.visionary": {
    "source": "iana",
    "extensions": ["vis"]
  },
  "application/vnd.vividence.scriptfile": {
    "source": "iana"
  },
  "application/vnd.vsf": {
    "source": "iana",
    "extensions": ["vsf"]
  },
  "application/vnd.wap.sic": {
    "source": "iana"
  },
  "application/vnd.wap.slc": {
    "source": "iana"
  },
  "application/vnd.wap.wbxml": {
    "source": "iana",
    "charset": "UTF-8",
    "extensions": ["wbxml"]
  },
  "application/vnd.wap.wmlc": {
    "source": "iana",
    "extensions": ["wmlc"]
  },
  "application/vnd.wap.wmlscriptc": {
    "source": "iana",
    "extensions": ["wmlsc"]
  },
  "application/vnd.webturbo": {
    "source": "iana",
    "extensions": ["wtb"]
  },
  "application/vnd.wfa.p2p": {
    "source": "iana"
  },
  "application/vnd.wfa.wsc": {
    "source": "iana"
  },
  "application/vnd.windows.devicepairing": {
    "source": "iana"
  },
  "application/vnd.wmc": {
    "source": "iana"
  },
  "application/vnd.wmf.bootstrap": {
    "source": "iana"
  },
  "application/vnd.wolfram.mathematica": {
    "source": "iana"
  },
  "application/vnd.wolfram.mathematica.package": {
    "source": "iana"
  },
  "application/vnd.wolfram.player": {
    "source": "iana",
    "extensions": ["nbp"]
  },
  "application/vnd.wordperfect": {
    "source": "iana",
    "extensions": ["wpd"]
  },
  "application/vnd.wqd": {
    "source": "iana",
    "extensions": ["wqd"]
  },
  "application/vnd.wrq-hp3000-labelled": {
    "source": "iana"
  },
  "application/vnd.wt.stf": {
    "source": "iana",
    "extensions": ["stf"]
  },
  "application/vnd.wv.csp+wbxml": {
    "source": "iana"
  },
  "application/vnd.wv.csp+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.wv.ssp+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.xacml+json": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.xara": {
    "source": "iana",
    "extensions": ["xar"]
  },
  "application/vnd.xfdl": {
    "source": "iana",
    "extensions": ["xfdl"]
  },
  "application/vnd.xfdl.webform": {
    "source": "iana"
  },
  "application/vnd.xmi+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.xmpie.cpkg": {
    "source": "iana"
  },
  "application/vnd.xmpie.dpkg": {
    "source": "iana"
  },
  "application/vnd.xmpie.plan": {
    "source": "iana"
  },
  "application/vnd.xmpie.ppkg": {
    "source": "iana"
  },
  "application/vnd.xmpie.xlim": {
    "source": "iana"
  },
  "application/vnd.yamaha.hv-dic": {
    "source": "iana",
    "extensions": ["hvd"]
  },
  "application/vnd.yamaha.hv-script": {
    "source": "iana",
    "extensions": ["hvs"]
  },
  "application/vnd.yamaha.hv-voice": {
    "source": "iana",
    "extensions": ["hvp"]
  },
  "application/vnd.yamaha.openscoreformat": {
    "source": "iana",
    "extensions": ["osf"]
  },
  "application/vnd.yamaha.openscoreformat.osfpvg+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": ["osfpvg"]
  },
  "application/vnd.yamaha.remote-setup": {
    "source": "iana"
  },
  "application/vnd.yamaha.smaf-audio": {
    "source": "iana",
    "extensions": ["saf"]
  },
  "application/vnd.yamaha.smaf-phrase": {
    "source": "iana",
    "extensions": ["spf"]
  },
  "application/vnd.yamaha.through-ngn": {
    "source": "iana"
  },
  "application/vnd.yamaha.tunnel-udpencap": {
    "source": "iana"
  },
  "application/vnd.yaoweme": {
    "source": "iana"
  },
  "application/vnd.yellowriver-custom-menu": {
    "source": "iana",
    "extensions": ["cmp"]
  },
  "application/vnd.youtube.yt": {
    "source": "iana"
  },
  "application/vnd.zul": {
    "source": "iana",
    "extensions": ["zir","zirz"]
  },
  "application/vnd.zzazz.deck+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": ["zaz"]
  },
  "application/voicexml+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": ["vxml"]
  },
  "application/voucher-cms+json": {
    "source": "iana",
    "compressible": true
  },
  "application/vq-rtcpxr": {
    "source": "iana"
  },
  "application/wasm": {
    "compressible": true,
    "extensions": ["wasm"]
  },
  "application/watcherinfo+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/webpush-options+json": {
    "source": "iana",
    "compressible": true
  },
  "application/whoispp-query": {
    "source": "iana"
  },
  "application/whoispp-response": {
    "source": "iana"
  },
  "application/widget": {
    "source": "iana",
    "extensions": ["wgt"]
  },
  "application/winhlp": {
    "source": "apache",
    "extensions": ["hlp"]
  },
  "application/wita": {
    "source": "iana"
  },
  "application/wordperfect5.1": {
    "source": "iana"
  },
  "application/wsdl+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": ["wsdl"]
  },
  "application/wspolicy+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": ["wspolicy"]
  },
  "application/x-7z-compressed": {
    "source": "apache",
    "compressible": false,
    "extensions": ["7z"]
  },
  "application/x-abiword": {
    "source": "apache",
    "extensions": ["abw"]
  },
  "application/x-ace-compressed": {
    "source": "apache",
    "extensions": ["ace"]
  },
  "application/x-amf": {
    "source": "apache"
  },
  "application/x-apple-diskimage": {
    "source": "apache",
    "extensions": ["dmg"]
  },
  "application/x-arj": {
    "compressible": false,
    "extensions": ["arj"]
  },
  "application/x-authorware-bin": {
    "source": "apache",
    "extensions": ["aab","x32","u32","vox"]
  },
  "application/x-authorware-map": {
    "source": "apache",
    "extensions": ["aam"]
  },
  "application/x-authorware-seg": {
    "source": "apache",
    "extensions": ["aas"]
  },
  "application/x-bcpio": {
    "source": "apache",
    "extensions": ["bcpio"]
  },
  "application/x-bdoc": {
    "compressible": false,
    "extensions": ["bdoc"]
  },
  "application/x-bittorrent": {
    "source": "apache",
    "extensions": ["torrent"]
  },
  "application/x-blorb": {
    "source": "apache",
    "extensions": ["blb","blorb"]
  },
  "application/x-bzip": {
    "source": "apache",
    "compressible": false,
    "extensions": ["bz"]
  },
  "application/x-bzip2": {
    "source": "apache",
    "compressible": false,
    "extensions": ["bz2","boz"]
  },
  "application/x-cbr": {
    "source": "apache",
    "extensions": ["cbr","cba","cbt","cbz","cb7"]
  },
  "application/x-cdlink": {
    "source": "apache",
    "extensions": ["vcd"]
  },
  "application/x-cfs-compressed": {
    "source": "apache",
    "extensions": ["cfs"]
  },
  "application/x-chat": {
    "source": "apache",
    "extensions": ["chat"]
  },
  "application/x-chess-pgn": {
    "source": "apache",
    "extensions": ["pgn"]
  },
  "application/x-chrome-extension": {
    "extensions": ["crx"]
  },
  "application/x-cocoa": {
    "source": "nginx",
    "extensions": ["cco"]
  },
  "application/x-compress": {
    "source": "apache"
  },
  "application/x-conference": {
    "source": "apache",
    "extensions": ["nsc"]
  },
  "application/x-cpio": {
    "source": "apache",
    "extensions": ["cpio"]
  },
  "application/x-csh": {
    "source": "apache",
    "extensions": ["csh"]
  },
  "application/x-deb": {
    "compressible": false
  },
  "application/x-debian-package": {
    "source": "apache",
    "extensions": ["deb","udeb"]
  },
  "application/x-dgc-compressed": {
    "source": "apache",
    "extensions": ["dgc"]
  },
  "application/x-director": {
    "source": "apache",
    "extensions": ["dir","dcr","dxr","cst","cct","cxt","w3d","fgd","swa"]
  },
  "application/x-doom": {
    "source": "apache",
    "extensions": ["wad"]
  },
  "application/x-dtbncx+xml": {
    "source": "apache",
    "compressible": true,
    "extensions": ["ncx"]
  },
  "application/x-dtbook+xml": {
    "source": "apache",
    "compressible": true,
    "extensions": ["dtb"]
  },
  "application/x-dtbresource+xml": {
    "source": "apache",
    "compressible": true,
    "extensions": ["res"]
  },
  "application/x-dvi": {
    "source": "apache",
    "compressible": false,
    "extensions": ["dvi"]
  },
  "application/x-envoy": {
    "source": "apache",
    "extensions": ["evy"]
  },
  "application/x-eva": {
    "source": "apache",
    "extensions": ["eva"]
  },
  "application/x-font-bdf": {
    "source": "apache",
    "extensions": ["bdf"]
  },
  "application/x-font-dos": {
    "source": "apache"
  },
  "application/x-font-framemaker": {
    "source": "apache"
  },
  "application/x-font-ghostscript": {
    "source": "apache",
    "extensions": ["gsf"]
  },
  "application/x-font-libgrx": {
    "source": "apache"
  },
  "application/x-font-linux-psf": {
    "source": "apache",
    "extensions": ["psf"]
  },
  "application/x-font-pcf": {
    "source": "apache",
    "extensions": ["pcf"]
  },
  "application/x-font-snf": {
    "source": "apache",
    "extensions": ["snf"]
  },
  "application/x-font-speedo": {
    "source": "apache"
  },
  "application/x-font-sunos-news": {
    "source": "apache"
  },
  "application/x-font-type1": {
    "source": "apache",
    "extensions": ["pfa","pfb","pfm","afm"]
  },
  "application/x-font-vfont": {
    "source": "apache"
  },
  "application/x-freearc": {
    "source": "apache",
    "extensions": ["arc"]
  },
  "application/x-futuresplash": {
    "source": "apache",
    "extensions": ["spl"]
  },
  "application/x-gca-compressed": {
    "source": "apache",
    "extensions": ["gca"]
  },
  "application/x-glulx": {
    "source": "apache",
    "extensions": ["ulx"]
  },
  "application/x-gnumeric": {
    "source": "apache",
    "extensions": ["gnumeric"]
  },
  "application/x-gramps-xml": {
    "source": "apache",
    "extensions": ["gramps"]
  },
  "application/x-gtar": {
    "source": "apache",
    "extensions": ["gtar"]
  },
  "application/x-gzip": {
    "source": "apache"
  },
  "application/x-hdf": {
    "source": "apache",
    "extensions": ["hdf"]
  },
  "application/x-httpd-php": {
    "compressible": true,
    "extensions": ["php"]
  },
  "application/x-install-instructions": {
    "source": "apache",
    "extensions": ["install"]
  },
  "application/x-iso9660-image": {
    "source": "apache",
    "extensions": ["iso"]
  },
  "application/x-java-archive-diff": {
    "source": "nginx",
    "extensions": ["jardiff"]
  },
  "application/x-java-jnlp-file": {
    "source": "apache",
    "compressible": false,
    "extensions": ["jnlp"]
  },
  "application/x-javascript": {
    "compressible": true
  },
  "application/x-keepass2": {
    "extensions": ["kdbx"]
  },
  "application/x-latex": {
    "source": "apache",
    "compressible": false,
    "extensions": ["latex"]
  },
  "application/x-lua-bytecode": {
    "extensions": ["luac"]
  },
  "application/x-lzh-compressed": {
    "source": "apache",
    "extensions": ["lzh","lha"]
  },
  "application/x-makeself": {
    "source": "nginx",
    "extensions": ["run"]
  },
  "application/x-mie": {
    "source": "apache",
    "extensions": ["mie"]
  },
  "application/x-mobipocket-ebook": {
    "source": "apache",
    "extensions": ["prc","mobi"]
  },
  "application/x-mpegurl": {
    "compressible": false
  },
  "application/x-ms-application": {
    "source": "apache",
    "extensions": ["application"]
  },
  "application/x-ms-shortcut": {
    "source": "apache",
    "extensions": ["lnk"]
  },
  "application/x-ms-wmd": {
    "source": "apache",
    "extensions": ["wmd"]
  },
  "application/x-ms-wmz": {
    "source": "apache",
    "extensions": ["wmz"]
  },
  "application/x-ms-xbap": {
    "source": "apache",
    "extensions": ["xbap"]
  },
  "application/x-msaccess": {
    "source": "apache",
    "extensions": ["mdb"]
  },
  "application/x-msbinder": {
    "source": "apache",
    "extensions": ["obd"]
  },
  "application/x-mscardfile": {
    "source": "apache",
    "extensions": ["crd"]
  },
  "application/x-msclip": {
    "source": "apache",
    "extensions": ["clp"]
  },
  "application/x-msdos-program": {
    "extensions": ["exe"]
  },
  "application/x-msdownload": {
    "source": "apache",
    "extensions": ["exe","dll","com","bat","msi"]
  },
  "application/x-msmediaview": {
    "source": "apache",
    "extensions": ["mvb","m13","m14"]
  },
  "application/x-msmetafile": {
    "source": "apache",
    "extensions": ["wmf","wmz","emf","emz"]
  },
  "application/x-msmoney": {
    "source": "apache",
    "extensions": ["mny"]
  },
  "application/x-mspublisher": {
    "source": "apache",
    "extensions": ["pub"]
  },
  "application/x-msschedule": {
    "source": "apache",
    "extensions": ["scd"]
  },
  "application/x-msterminal": {
    "source": "apache",
    "extensions": ["trm"]
  },
  "application/x-mswrite": {
    "source": "apache",
    "extensions": ["wri"]
  },
  "application/x-netcdf": {
    "source": "apache",
    "extensions": ["nc","cdf"]
  },
  "application/x-ns-proxy-autoconfig": {
    "compressible": true,
    "extensions": ["pac"]
  },
  "application/x-nzb": {
    "source": "apache",
    "extensions": ["nzb"]
  },
  "application/x-perl": {
    "source": "nginx",
    "extensions": ["pl","pm"]
  },
  "application/x-pilot": {
    "source": "nginx",
    "extensions": ["prc","pdb"]
  },
  "application/x-pkcs12": {
    "source": "apache",
    "compressible": false,
    "extensions": ["p12","pfx"]
  },
  "application/x-pkcs7-certificates": {
    "source": "apache",
    "extensions": ["p7b","spc"]
  },
  "application/x-pkcs7-certreqresp": {
    "source": "apache",
    "extensions": ["p7r"]
  },
  "application/x-pki-message": {
    "source": "iana"
  },
  "application/x-rar-compressed": {
    "source": "apache",
    "compressible": false,
    "extensions": ["rar"]
  },
  "application/x-redhat-package-manager": {
    "source": "nginx",
    "extensions": ["rpm"]
  },
  "application/x-research-info-systems": {
    "source": "apache",
    "extensions": ["ris"]
  },
  "application/x-sea": {
    "source": "nginx",
    "extensions": ["sea"]
  },
  "application/x-sh": {
    "source": "apache",
    "compressible": true,
    "extensions": ["sh"]
  },
  "application/x-shar": {
    "source": "apache",
    "extensions": ["shar"]
  },
  "application/x-shockwave-flash": {
    "source": "apache",
    "compressible": false,
    "extensions": ["swf"]
  },
  "application/x-silverlight-app": {
    "source": "apache",
    "extensions": ["xap"]
  },
  "application/x-sql": {
    "source": "apache",
    "extensions": ["sql"]
  },
  "application/x-stuffit": {
    "source": "apache",
    "compressible": false,
    "extensions": ["sit"]
  },
  "application/x-stuffitx": {
    "source": "apache",
    "extensions": ["sitx"]
  },
  "application/x-subrip": {
    "source": "apache",
    "extensions": ["srt"]
  },
  "application/x-sv4cpio": {
    "source": "apache",
    "extensions": ["sv4cpio"]
  },
  "application/x-sv4crc": {
    "source": "apache",
    "extensions": ["sv4crc"]
  },
  "application/x-t3vm-image": {
    "source": "apache",
    "extensions": ["t3"]
  },
  "application/x-tads": {
    "source": "apache",
    "extensions": ["gam"]
  },
  "application/x-tar": {
    "source": "apache",
    "compressible": true,
    "extensions": ["tar"]
  },
  "application/x-tcl": {
    "source": "apache",
    "extensions": ["tcl","tk"]
  },
  "application/x-tex": {
    "source": "apache",
    "extensions": ["tex"]
  },
  "application/x-tex-tfm": {
    "source": "apache",
    "extensions": ["tfm"]
  },
  "application/x-texinfo": {
    "source": "apache",
    "extensions": ["texinfo","texi"]
  },
  "application/x-tgif": {
    "source": "apache",
    "extensions": ["obj"]
  },
  "application/x-ustar": {
    "source": "apache",
    "extensions": ["ustar"]
  },
  "application/x-virtualbox-hdd": {
    "compressible": true,
    "extensions": ["hdd"]
  },
  "application/x-virtualbox-ova": {
    "compressible": true,
    "extensions": ["ova"]
  },
  "application/x-virtualbox-ovf": {
    "compressible": true,
    "extensions": ["ovf"]
  },
  "application/x-virtualbox-vbox": {
    "compressible": true,
    "extensions": ["vbox"]
  },
  "application/x-virtualbox-vbox-extpack": {
    "compressible": false,
    "extensions": ["vbox-extpack"]
  },
  "application/x-virtualbox-vdi": {
    "compressible": true,
    "extensions": ["vdi"]
  },
  "application/x-virtualbox-vhd": {
    "compressible": true,
    "extensions": ["vhd"]
  },
  "application/x-virtualbox-vmdk": {
    "compressible": true,
    "extensions": ["vmdk"]
  },
  "application/x-wais-source": {
    "source": "apache",
    "extensions": ["src"]
  },
  "application/x-web-app-manifest+json": {
    "compressible": true,
    "extensions": ["webapp"]
  },
  "application/x-www-form-urlencoded": {
    "source": "iana",
    "compressible": true
  },
  "application/x-x509-ca-cert": {
    "source": "iana",
    "extensions": ["der","crt","pem"]
  },
  "application/x-x509-ca-ra-cert": {
    "source": "iana"
  },
  "application/x-x509-next-ca-cert": {
    "source": "iana"
  },
  "application/x-xfig": {
    "source": "apache",
    "extensions": ["fig"]
  },
  "application/x-xliff+xml": {
    "source": "apache",
    "compressible": true,
    "extensions": ["xlf"]
  },
  "application/x-xpinstall": {
    "source": "apache",
    "compressible": false,
    "extensions": ["xpi"]
  },
  "application/x-xz": {
    "source": "apache",
    "extensions": ["xz"]
  },
  "application/x-zmachine": {
    "source": "apache",
    "extensions": ["z1","z2","z3","z4","z5","z6","z7","z8"]
  },
  "application/x400-bp": {
    "source": "iana"
  },
  "application/xacml+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/xaml+xml": {
    "source": "apache",
    "compressible": true,
    "extensions": ["xaml"]
  },
  "application/xcap-att+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": ["xav"]
  },
  "application/xcap-caps+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": ["xca"]
  },
  "application/xcap-diff+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": ["xdf"]
  },
  "application/xcap-el+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": ["xel"]
  },
  "application/xcap-error+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": ["xer"]
  },
  "application/xcap-ns+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": ["xns"]
  },
  "application/xcon-conference-info+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/xcon-conference-info-diff+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/xenc+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": ["xenc"]
  },
  "application/xhtml+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": ["xhtml","xht"]
  },
  "application/xhtml-voice+xml": {
    "source": "apache",
    "compressible": true
  },
  "application/xliff+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": ["xlf"]
  },
  "application/xml": {
    "source": "iana",
    "compressible": true,
    "extensions": ["xml","xsl","xsd","rng"]
  },
  "application/xml-dtd": {
    "source": "iana",
    "compressible": true,
    "extensions": ["dtd"]
  },
  "application/xml-external-parsed-entity": {
    "source": "iana"
  },
  "application/xml-patch+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/xmpp+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/xop+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": ["xop"]
  },
  "application/xproc+xml": {
    "source": "apache",
    "compressible": true,
    "extensions": ["xpl"]
  },
  "application/xslt+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": ["xslt"]
  },
  "application/xspf+xml": {
    "source": "apache",
    "compressible": true,
    "extensions": ["xspf"]
  },
  "application/xv+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": ["mxml","xhvml","xvml","xvm"]
  },
  "application/yang": {
    "source": "iana",
    "extensions": ["yang"]
  },
  "application/yang-data+json": {
    "source": "iana",
    "compressible": true
  },
  "application/yang-data+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/yang-patch+json": {
    "source": "iana",
    "compressible": true
  },
  "application/yang-patch+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/yin+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": ["yin"]
  },
  "application/zip": {
    "source": "iana",
    "compressible": false,
    "extensions": ["zip"]
  },
  "application/zlib": {
    "source": "iana"
  },
  "application/zstd": {
    "source": "iana"
  },
  "audio/1d-interleaved-parityfec": {
    "source": "iana"
  },
  "audio/32kadpcm": {
    "source": "iana"
  },
  "audio/3gpp": {
    "source": "iana",
    "compressible": false,
    "extensions": ["3gpp"]
  },
  "audio/3gpp2": {
    "source": "iana"
  },
  "audio/aac": {
    "source": "iana"
  },
  "audio/ac3": {
    "source": "iana"
  },
  "audio/adpcm": {
    "source": "apache",
    "extensions": ["adp"]
  },
  "audio/amr": {
    "source": "iana"
  },
  "audio/amr-wb": {
    "source": "iana"
  },
  "audio/amr-wb+": {
    "source": "iana"
  },
  "audio/aptx": {
    "source": "iana"
  },
  "audio/asc": {
    "source": "iana"
  },
  "audio/atrac-advanced-lossless": {
    "source": "iana"
  },
  "audio/atrac-x": {
    "source": "iana"
  },
  "audio/atrac3": {
    "source": "iana"
  },
  "audio/basic": {
    "source": "iana",
    "compressible": false,
    "extensions": ["au","snd"]
  },
  "audio/bv16": {
    "source": "iana"
  },
  "audio/bv32": {
    "source": "iana"
  },
  "audio/clearmode": {
    "source": "iana"
  },
  "audio/cn": {
    "source": "iana"
  },
  "audio/dat12": {
    "source": "iana"
  },
  "audio/dls": {
    "source": "iana"
  },
  "audio/dsr-es201108": {
    "source": "iana"
  },
  "audio/dsr-es202050": {
    "source": "iana"
  },
  "audio/dsr-es202211": {
    "source": "iana"
  },
  "audio/dsr-es202212": {
    "source": "iana"
  },
  "audio/dv": {
    "source": "iana"
  },
  "audio/dvi4": {
    "source": "iana"
  },
  "audio/eac3": {
    "source": "iana"
  },
  "audio/encaprtp": {
    "source": "iana"
  },
  "audio/evrc": {
    "source": "iana"
  },
  "audio/evrc-qcp": {
    "source": "iana"
  },
  "audio/evrc0": {
    "source": "iana"
  },
  "audio/evrc1": {
    "source": "iana"
  },
  "audio/evrcb": {
    "source": "iana"
  },
  "audio/evrcb0": {
    "source": "iana"
  },
  "audio/evrcb1": {
    "source": "iana"
  },
  "audio/evrcnw": {
    "source": "iana"
  },
  "audio/evrcnw0": {
    "source": "iana"
  },
  "audio/evrcnw1": {
    "source": "iana"
  },
  "audio/evrcwb": {
    "source": "iana"
  },
  "audio/evrcwb0": {
    "source": "iana"
  },
  "audio/evrcwb1": {
    "source": "iana"
  },
  "audio/evs": {
    "source": "iana"
  },
  "audio/flexfec": {
    "source": "iana"
  },
  "audio/fwdred": {
    "source": "iana"
  },
  "audio/g711-0": {
    "source": "iana"
  },
  "audio/g719": {
    "source": "iana"
  },
  "audio/g722": {
    "source": "iana"
  },
  "audio/g7221": {
    "source": "iana"
  },
  "audio/g723": {
    "source": "iana"
  },
  "audio/g726-16": {
    "source": "iana"
  },
  "audio/g726-24": {
    "source": "iana"
  },
  "audio/g726-32": {
    "source": "iana"
  },
  "audio/g726-40": {
    "source": "iana"
  },
  "audio/g728": {
    "source": "iana"
  },
  "audio/g729": {
    "source": "iana"
  },
  "audio/g7291": {
    "source": "iana"
  },
  "audio/g729d": {
    "source": "iana"
  },
  "audio/g729e": {
    "source": "iana"
  },
  "audio/gsm": {
    "source": "iana"
  },
  "audio/gsm-efr": {
    "source": "iana"
  },
  "audio/gsm-hr-08": {
    "source": "iana"
  },
  "audio/ilbc": {
    "source": "iana"
  },
  "audio/ip-mr_v2.5": {
    "source": "iana"
  },
  "audio/isac": {
    "source": "apache"
  },
  "audio/l16": {
    "source": "iana"
  },
  "audio/l20": {
    "source": "iana"
  },
  "audio/l24": {
    "source": "iana",
    "compressible": false
  },
  "audio/l8": {
    "source": "iana"
  },
  "audio/lpc": {
    "source": "iana"
  },
  "audio/melp": {
    "source": "iana"
  },
  "audio/melp1200": {
    "source": "iana"
  },
  "audio/melp2400": {
    "source": "iana"
  },
  "audio/melp600": {
    "source": "iana"
  },
  "audio/mhas": {
    "source": "iana"
  },
  "audio/midi": {
    "source": "apache",
    "extensions": ["mid","midi","kar","rmi"]
  },
  "audio/mobile-xmf": {
    "source": "iana",
    "extensions": ["mxmf"]
  },
  "audio/mp3": {
    "compressible": false,
    "extensions": ["mp3"]
  },
  "audio/mp4": {
    "source": "iana",
    "compressible": false,
    "extensions": ["m4a","mp4a"]
  },
  "audio/mp4a-latm": {
    "source": "iana"
  },
  "audio/mpa": {
    "source": "iana"
  },
  "audio/mpa-robust": {
    "source": "iana"
  },
  "audio/mpeg": {
    "source": "iana",
    "compressible": false,
    "extensions": ["mpga","mp2","mp2a","mp3","m2a","m3a"]
  },
  "audio/mpeg4-generic": {
    "source": "iana"
  },
  "audio/musepack": {
    "source": "apache"
  },
  "audio/ogg": {
    "source": "iana",
    "compressible": false,
    "extensions": ["oga","ogg","spx"]
  },
  "audio/opus": {
    "source": "iana"
  },
  "audio/parityfec": {
    "source": "iana"
  },
  "audio/pcma": {
    "source": "iana"
  },
  "audio/pcma-wb": {
    "source": "iana"
  },
  "audio/pcmu": {
    "source": "iana"
  },
  "audio/pcmu-wb": {
    "source": "iana"
  },
  "audio/prs.sid": {
    "source": "iana"
  },
  "audio/qcelp": {
    "source": "iana"
  },
  "audio/raptorfec": {
    "source": "iana"
  },
  "audio/red": {
    "source": "iana"
  },
  "audio/rtp-enc-aescm128": {
    "source": "iana"
  },
  "audio/rtp-midi": {
    "source": "iana"
  },
  "audio/rtploopback": {
    "source": "iana"
  },
  "audio/rtx": {
    "source": "iana"
  },
  "audio/s3m": {
    "source": "apache",
    "extensions": ["s3m"]
  },
  "audio/silk": {
    "source": "apache",
    "extensions": ["sil"]
  },
  "audio/smv": {
    "source": "iana"
  },
  "audio/smv-qcp": {
    "source": "iana"
  },
  "audio/smv0": {
    "source": "iana"
  },
  "audio/sp-midi": {
    "source": "iana"
  },
  "audio/speex": {
    "source": "iana"
  },
  "audio/t140c": {
    "source": "iana"
  },
  "audio/t38": {
    "source": "iana"
  },
  "audio/telephone-event": {
    "source": "iana"
  },
  "audio/tetra_acelp": {
    "source": "iana"
  },
  "audio/tetra_acelp_bb": {
    "source": "iana"
  },
  "audio/tone": {
    "source": "iana"
  },
  "audio/uemclip": {
    "source": "iana"
  },
  "audio/ulpfec": {
    "source": "iana"
  },
  "audio/usac": {
    "source": "iana"
  },
  "audio/vdvi": {
    "source": "iana"
  },
  "audio/vmr-wb": {
    "source": "iana"
  },
  "audio/vnd.3gpp.iufp": {
    "source": "iana"
  },
  "audio/vnd.4sb": {
    "source": "iana"
  },
  "audio/vnd.audiokoz": {
    "source": "iana"
  },
  "audio/vnd.celp": {
    "source": "iana"
  },
  "audio/vnd.cisco.nse": {
    "source": "iana"
  },
  "audio/vnd.cmles.radio-events": {
    "source": "iana"
  },
  "audio/vnd.cns.anp1": {
    "source": "iana"
  },
  "audio/vnd.cns.inf1": {
    "source": "iana"
  },
  "audio/vnd.dece.audio": {
    "source": "iana",
    "extensions": ["uva","uvva"]
  },
  "audio/vnd.digital-winds": {
    "source": "iana",
    "extensions": ["eol"]
  },
  "audio/vnd.dlna.adts": {
    "source": "iana"
  },
  "audio/vnd.dolby.heaac.1": {
    "source": "iana"
  },
  "audio/vnd.dolby.heaac.2": {
    "source": "iana"
  },
  "audio/vnd.dolby.mlp": {
    "source": "iana"
  },
  "audio/vnd.dolby.mps": {
    "source": "iana"
  },
  "audio/vnd.dolby.pl2": {
    "source": "iana"
  },
  "audio/vnd.dolby.pl2x": {
    "source": "iana"
  },
  "audio/vnd.dolby.pl2z": {
    "source": "iana"
  },
  "audio/vnd.dolby.pulse.1": {
    "source": "iana"
  },
  "audio/vnd.dra": {
    "source": "iana",
    "extensions": ["dra"]
  },
  "audio/vnd.dts": {
    "source": "iana",
    "extensions": ["dts"]
  },
  "audio/vnd.dts.hd": {
    "source": "iana",
    "extensions": ["dtshd"]
  },
  "audio/vnd.dts.uhd": {
    "source": "iana"
  },
  "audio/vnd.dvb.file": {
    "source": "iana"
  },
  "audio/vnd.everad.plj": {
    "source": "iana"
  },
  "audio/vnd.hns.audio": {
    "source": "iana"
  },
  "audio/vnd.lucent.voice": {
    "source": "iana",
    "extensions": ["lvp"]
  },
  "audio/vnd.ms-playready.media.pya": {
    "source": "iana",
    "extensions": ["pya"]
  },
  "audio/vnd.nokia.mobile-xmf": {
    "source": "iana"
  },
  "audio/vnd.nortel.vbk": {
    "source": "iana"
  },
  "audio/vnd.nuera.ecelp4800": {
    "source": "iana",
    "extensions": ["ecelp4800"]
  },
  "audio/vnd.nuera.ecelp7470": {
    "source": "iana",
    "extensions": ["ecelp7470"]
  },
  "audio/vnd.nuera.ecelp9600": {
    "source": "iana",
    "extensions": ["ecelp9600"]
  },
  "audio/vnd.octel.sbc": {
    "source": "iana"
  },
  "audio/vnd.presonus.multitrack": {
    "source": "iana"
  },
  "audio/vnd.qcelp": {
    "source": "iana"
  },
  "audio/vnd.rhetorex.32kadpcm": {
    "source": "iana"
  },
  "audio/vnd.rip": {
    "source": "iana",
    "extensions": ["rip"]
  },
  "audio/vnd.rn-realaudio": {
    "compressible": false
  },
  "audio/vnd.sealedmedia.softseal.mpeg": {
    "source": "iana"
  },
  "audio/vnd.vmx.cvsd": {
    "source": "iana"
  },
  "audio/vnd.wave": {
    "compressible": false
  },
  "audio/vorbis": {
    "source": "iana",
    "compressible": false
  },
  "audio/vorbis-config": {
    "source": "iana"
  },
  "audio/wav": {
    "compressible": false,
    "extensions": ["wav"]
  },
  "audio/wave": {
    "compressible": false,
    "extensions": ["wav"]
  },
  "audio/webm": {
    "source": "apache",
    "compressible": false,
    "extensions": ["weba"]
  },
  "audio/x-aac": {
    "source": "apache",
    "compressible": false,
    "extensions": ["aac"]
  },
  "audio/x-aiff": {
    "source": "apache",
    "extensions": ["aif","aiff","aifc"]
  },
  "audio/x-caf": {
    "source": "apache",
    "compressible": false,
    "extensions": ["caf"]
  },
  "audio/flac": {
    "source": "apache",
    "extensions": ["flac"]
  },
  "audio/x-m4a": {
    "source": "nginx",
    "extensions": ["m4a"]
  },
  "audio/x-matroska": {
    "source": "apache",
    "extensions": ["mka"]
  },
  "audio/x-mpegurl": {
    "source": "apache",
    "extensions": ["m3u"]
  },
  "audio/x-ms-wax": {
    "source": "apache",
    "extensions": ["wax"]
  },
  "audio/x-ms-wma": {
    "source": "apache",
    "extensions": ["wma"]
  },
  "audio/x-pn-realaudio": {
    "source": "apache",
    "extensions": ["ram","ra"]
  },
  "audio/x-pn-realaudio-plugin": {
    "source": "apache",
    "extensions": ["rmp"]
  },
  "audio/x-realaudio": {
    "source": "nginx",
    "extensions": ["ra"]
  },
  "audio/x-tta": {
    "source": "apache"
  },
  "audio/x-wav": {
    "source": "apache",
    "extensions": ["wav"]
  },
  "audio/xm": {
    "source": "apache",
    "extensions": ["xm"]
  },
  "chemical/x-cdx": {
    "source": "apache",
    "extensions": ["cdx"]
  },
  "chemical/x-cif": {
    "source": "apache",
    "extensions": ["cif"]
  },
  "chemical/x-cmdf": {
    "source": "apache",
    "extensions": ["cmdf"]
  },
  "chemical/x-cml": {
    "source": "apache",
    "extensions": ["cml"]
  },
  "chemical/x-csml": {
    "source": "apache",
    "extensions": ["csml"]
  },
  "chemical/x-pdb": {
    "source": "apache"
  },
  "chemical/x-xyz": {
    "source": "apache",
    "extensions": ["xyz"]
  },
  "font/collection": {
    "source": "iana",
    "extensions": ["ttc"]
  },
  "font/otf": {
    "source": "iana",
    "compressible": true,
    "extensions": ["otf"]
  },
  "font/sfnt": {
    "source": "iana"
  },
  "font/ttf": {
    "source": "iana",
    "compressible": true,
    "extensions": ["ttf"]
  },
  "font/woff": {
    "source": "iana",
    "extensions": ["woff"]
  },
  "font/woff2": {
    "source": "iana",
    "extensions": ["woff2"]
  },
  "image/aces": {
    "source": "iana",
    "extensions": ["exr"]
  },
  "image/apng": {
    "compressible": false,
    "extensions": ["apng"]
  },
  "image/avci": {
    "source": "iana"
  },
  "image/avcs": {
    "source": "iana"
  },
  "image/avif": {
    "source": "iana",
    "compressible": false,
    "extensions": ["avif"]
  },
  "image/bmp": {
    "source": "iana",
    "compressible": true,
    "extensions": ["bmp"]
  },
  "image/cgm": {
    "source": "iana",
    "extensions": ["cgm"]
  },
  "image/dicom-rle": {
    "source": "iana",
    "extensions": ["drle"]
  },
  "image/emf": {
    "source": "iana",
    "extensions": ["emf"]
  },
  "image/fits": {
    "source": "iana",
    "extensions": ["fits"]
  },
  "image/g3fax": {
    "source": "iana",
    "extensions": ["g3"]
  },
  "image/gif": {
    "source": "iana",
    "compressible": false,
    "extensions": ["gif"]
  },
  "image/heic": {
    "source": "iana",
    "extensions": ["heic"]
  },
  "image/heic-sequence": {
    "source": "iana",
    "extensions": ["heics"]
  },
  "image/heif": {
    "source": "iana",
    "extensions": ["heif"]
  },
  "image/heif-sequence": {
    "source": "iana",
    "extensions": ["heifs"]
  },
  "image/hej2k": {
    "source": "iana",
    "extensions": ["hej2"]
  },
  "image/hsj2": {
    "source": "iana",
    "extensions": ["hsj2"]
  },
  "image/ief": {
    "source": "iana",
    "extensions": ["ief"]
  },
  "image/jls": {
    "source": "iana",
    "extensions": ["jls"]
  },
  "image/jp2": {
    "source": "iana",
    "compressible": false,
    "extensions": ["jp2","jpg2"]
  },
  "image/jpeg": {
    "source": "iana",
    "compressible": false,
    "extensions": ["jpeg","jpg","jpe"]
  },
  "image/jph": {
    "source": "iana",
    "extensions": ["jph"]
  },
  "image/jphc": {
    "source": "iana",
    "extensions": ["jhc"]
  },
  "image/jpm": {
    "source": "iana",
    "compressible": false,
    "extensions": ["jpm"]
  },
  "image/jpx": {
    "source": "iana",
    "compressible": false,
    "extensions": ["jpx","jpf"]
  },
  "image/jxr": {
    "source": "iana",
    "extensions": ["jxr"]
  },
  "image/jxra": {
    "source": "iana",
    "extensions": ["jxra"]
  },
  "image/jxrs": {
    "source": "iana",
    "extensions": ["jxrs"]
  },
  "image/jxs": {
    "source": "iana",
    "extensions": ["jxs"]
  },
  "image/jxsc": {
    "source": "iana",
    "extensions": ["jxsc"]
  },
  "image/jxsi": {
    "source": "iana",
    "extensions": ["jxsi"]
  },
  "image/jxss": {
    "source": "iana",
    "extensions": ["jxss"]
  },
  "image/ktx": {
    "source": "iana",
    "extensions": ["ktx"]
  },
  "image/naplps": {
    "source": "iana"
  },
  "image/pjpeg": {
    "compressible": false
  },
  "image/png": {
    "source": "iana",
    "compressible": false,
    "extensions": ["png"]
  },
  "image/prs.btif": {
    "source": "iana",
    "extensions": ["btif"]
  },
  "image/prs.pti": {
    "source": "iana",
    "extensions": ["pti"]
  },
  "image/pwg-raster": {
    "source": "iana"
  },
  "image/sgi": {
    "source": "apache",
    "extensions": ["sgi"]
  },
  "image/svg+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": ["svg","svgz"]
  },
  "image/t38": {
    "source": "iana",
    "extensions": ["t38"]
  },
  "image/tiff": {
    "source": "iana",
    "compressible": false,
    "extensions": ["tif","tiff"]
  },
  "image/tiff-fx": {
    "source": "iana",
    "extensions": ["tfx"]
  },
  "image/vnd.adobe.photoshop": {
    "source": "iana",
    "compressible": true,
    "extensions": ["psd"]
  },
  "image/vnd.airzip.accelerator.azv": {
    "source": "iana",
    "extensions": ["azv"]
  },
  "image/vnd.cns.inf2": {
    "source": "iana"
  },
  "image/vnd.dece.graphic": {
    "source": "iana",
    "extensions": ["uvi","uvvi","uvg","uvvg"]
  },
  "image/vnd.djvu": {
    "source": "iana",
    "extensions": ["djvu","djv"]
  },
  "image/vnd.dvb.subtitle": {
    "source": "iana",
    "extensions": ["sub"]
  },
  "image/vnd.dwg": {
    "source": "iana",
    "extensions": ["dwg"]
  },
  "image/vnd.dxf": {
    "source": "iana",
    "extensions": ["dxf"]
  },
  "image/vnd.fastbidsheet": {
    "source": "iana",
    "extensions": ["fbs"]
  },
  "image/vnd.fpx": {
    "source": "iana",
    "extensions": ["fpx"]
  },
  "image/vnd.fst": {
    "source": "iana",
    "extensions": ["fst"]
  },
  "image/vnd.fujixerox.edmics-mmr": {
    "source": "iana",
    "extensions": ["mmr"]
  },
  "image/vnd.fujixerox.edmics-rlc": {
    "source": "iana",
    "extensions": ["rlc"]
  },
  "image/vnd.globalgraphics.pgb": {
    "source": "iana"
  },
  "image/vnd.microsoft.icon": {
    "source": "iana",
    "extensions": ["ico"]
  },
  "image/vnd.mix": {
    "source": "iana"
  },
  "image/vnd.mozilla.apng": {
    "source": "iana"
  },
  "image/vnd.ms-dds": {
    "extensions": ["dds"]
  },
  "image/vnd.ms-modi": {
    "source": "iana",
    "extensions": ["mdi"]
  },
  "image/vnd.ms-photo": {
    "source": "apache",
    "extensions": ["wdp"]
  },
  "image/vnd.net-fpx": {
    "source": "iana",
    "extensions": ["npx"]
  },
  "image/vnd.radiance": {
    "source": "iana"
  },
  "image/vnd.sealed.png": {
    "source": "iana"
  },
  "image/vnd.sealedmedia.softseal.gif": {
    "source": "iana"
  },
  "image/vnd.sealedmedia.softseal.jpg": {
    "source": "iana"
  },
  "image/vnd.svf": {
    "source": "iana"
  },
  "image/vnd.tencent.tap": {
    "source": "iana",
    "extensions": ["tap"]
  },
  "image/vnd.valve.source.texture": {
    "source": "iana",
    "extensions": ["vtf"]
  },
  "image/vnd.wap.wbmp": {
    "source": "iana",
    "extensions": ["wbmp"]
  },
  "image/vnd.xiff": {
    "source": "iana",
    "extensions": ["xif"]
  },
  "image/vnd.zbrush.pcx": {
    "source": "iana",
    "extensions": ["pcx"]
  },
  "image/webp": {
    "source": "apache",
    "extensions": ["webp"]
  },
  "image/wmf": {
    "source": "iana",
    "extensions": ["wmf"]
  },
  "image/x-3ds": {
    "source": "apache",
    "extensions": ["3ds"]
  },
  "image/x-cmu-raster": {
    "source": "apache",
    "extensions": ["ras"]
  },
  "image/x-cmx": {
    "source": "apache",
    "extensions": ["cmx"]
  },
  "image/x-freehand": {
    "source": "apache",
    "extensions": ["fh","fhc","fh4","fh5","fh7"]
  },
  "image/x-icon": {
    "source": "apache",
    "compressible": true,
    "extensions": ["ico"]
  },
  "image/x-jng": {
    "source": "nginx",
    "extensions": ["jng"]
  },
  "image/x-mrsid-image": {
    "source": "apache",
    "extensions": ["sid"]
  },
  "image/x-ms-bmp": {
    "source": "nginx",
    "compressible": true,
    "extensions": ["bmp"]
  },
  "image/x-pcx": {
    "source": "apache",
    "extensions": ["pcx"]
  },
  "image/x-pict": {
    "source": "apache",
    "extensions": ["pic","pct"]
  },
  "image/x-portable-anymap": {
    "source": "apache",
    "extensions": ["pnm"]
  },
  "image/x-portable-bitmap": {
    "source": "apache",
    "extensions": ["pbm"]
  },
  "image/x-portable-graymap": {
    "source": "apache",
    "extensions": ["pgm"]
  },
  "image/x-portable-pixmap": {
    "source": "apache",
    "extensions": ["ppm"]
  },
  "image/x-rgb": {
    "source": "apache",
    "extensions": ["rgb"]
  },
  "image/x-tga": {
    "source": "apache",
    "extensions": ["tga"]
  },
  "image/x-xbitmap": {
    "source": "apache",
    "extensions": ["xbm"]
  },
  "image/x-xcf": {
    "compressible": false
  },
  "image/x-xpixmap": {
    "source": "apache",
    "extensions": ["xpm"]
  },
  "image/x-xwindowdump": {
    "source": "apache",
    "extensions": ["xwd"]
  },
  "message/cpim": {
    "source": "iana"
  },
  "message/delivery-status": {
    "source": "iana"
  },
  "message/disposition-notification": {
    "source": "iana",
    "extensions": [
      "disposition-notification"
    ]
  },
  "message/external-body": {
    "source": "iana"
  },
  "message/feedback-report": {
    "source": "iana"
  },
  "message/global": {
    "source": "iana",
    "extensions": ["u8msg"]
  },
  "message/global-delivery-status": {
    "source": "iana",
    "extensions": ["u8dsn"]
  },
  "message/global-disposition-notification": {
    "source": "iana",
    "extensions": ["u8mdn"]
  },
  "message/global-headers": {
    "source": "iana",
    "extensions": ["u8hdr"]
  },
  "message/http": {
    "source": "iana",
    "compressible": false
  },
  "message/imdn+xml": {
    "source": "iana",
    "compressible": true
  },
  "message/news": {
    "source": "iana"
  },
  "message/partial": {
    "source": "iana",
    "compressible": false
  },
  "message/rfc822": {
    "source": "iana",
    "compressible": true,
    "extensions": ["eml","mime"]
  },
  "message/s-http": {
    "source": "iana"
  },
  "message/sip": {
    "source": "iana"
  },
  "message/sipfrag": {
    "source": "iana"
  },
  "message/tracking-status": {
    "source": "iana"
  },
  "message/vnd.si.simp": {
    "source": "iana"
  },
  "message/vnd.wfa.wsc": {
    "source": "iana",
    "extensions": ["wsc"]
  },
  "model/3mf": {
    "source": "iana",
    "extensions": ["3mf"]
  },
  "model/gltf+json": {
    "source": "iana",
    "compressible": true,
    "extensions": ["gltf"]
  },
  "model/gltf-binary": {
    "source": "iana",
    "compressible": true,
    "extensions": ["glb"]
  },
  "model/iges": {
    "source": "iana",
    "compressible": false,
    "extensions": ["igs","iges"]
  },
  "model/mesh": {
    "source": "iana",
    "compressible": false,
    "extensions": ["msh","mesh","silo"]
  },
  "model/mtl": {
    "source": "iana",
    "extensions": ["mtl"]
  },
  "model/obj": {
    "source": "iana",
    "extensions": ["obj"]
  },
  "model/stl": {
    "source": "iana",
    "extensions": ["stl"]
  },
  "model/vnd.collada+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": ["dae"]
  },
  "model/vnd.dwf": {
    "source": "iana",
    "extensions": ["dwf"]
  },
  "model/vnd.flatland.3dml": {
    "source": "iana"
  },
  "model/vnd.gdl": {
    "source": "iana",
    "extensions": ["gdl"]
  },
  "model/vnd.gs-gdl": {
    "source": "apache"
  },
  "model/vnd.gs.gdl": {
    "source": "iana"
  },
  "model/vnd.gtw": {
    "source": "iana",
    "extensions": ["gtw"]
  },
  "model/vnd.moml+xml": {
    "source": "iana",
    "compressible": true
  },
  "model/vnd.mts": {
    "source": "iana",
    "extensions": ["mts"]
  },
  "model/vnd.opengex": {
    "source": "iana",
    "extensions": ["ogex"]
  },
  "model/vnd.parasolid.transmit.binary": {
    "source": "iana",
    "extensions": ["x_b"]
  },
  "model/vnd.parasolid.transmit.text": {
    "source": "iana",
    "extensions": ["x_t"]
  },
  "model/vnd.rosette.annotated-data-model": {
    "source": "iana"
  },
  "model/vnd.usdz+zip": {
    "source": "iana",
    "compressible": false,
    "extensions": ["usdz"]
  },
  "model/vnd.valve.source.compiled-map": {
    "source": "iana",
    "extensions": ["bsp"]
  },
  "model/vnd.vtu": {
    "source": "iana",
    "extensions": ["vtu"]
  },
  "model/vrml": {
    "source": "iana",
    "compressible": false,
    "extensions": ["wrl","vrml"]
  },
  "model/x3d+binary": {
    "source": "apache",
    "compressible": false,
    "extensions": ["x3db","x3dbz"]
  },
  "model/x3d+fastinfoset": {
    "source": "iana",
    "extensions": ["x3db"]
  },
  "model/x3d+vrml": {
    "source": "apache",
    "compressible": false,
    "extensions": ["x3dv","x3dvz"]
  },
  "model/x3d+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": ["x3d","x3dz"]
  },
  "model/x3d-vrml": {
    "source": "iana",
    "extensions": ["x3dv"]
  },
  "multipart/alternative": {
    "source": "iana",
    "compressible": false
  },
  "multipart/appledouble": {
    "source": "iana"
  },
  "multipart/byteranges": {
    "source": "iana"
  },
  "multipart/digest": {
    "source": "iana"
  },
  "multipart/encrypted": {
    "source": "iana",
    "compressible": false
  },
  "multipart/form-data": {
    "source": "iana",
    "compressible": false
  },
  "multipart/header-set": {
    "source": "iana"
  },
  "multipart/mixed": {
    "source": "iana"
  },
  "multipart/multilingual": {
    "source": "iana"
  },
  "multipart/parallel": {
    "source": "iana"
  },
  "multipart/related": {
    "source": "iana",
    "compressible": false
  },
  "multipart/report": {
    "source": "iana"
  },
  "multipart/signed": {
    "source": "iana",
    "compressible": false
  },
  "multipart/vnd.bint.med-plus": {
    "source": "iana"
  },
  "multipart/voice-message": {
    "source": "iana"
  },
  "multipart/x-mixed-replace": {
    "source": "iana"
  },
  "text/1d-interleaved-parityfec": {
    "source": "iana"
  },
  "text/cache-manifest": {
    "source": "iana",
    "compressible": true,
    "extensions": ["appcache","manifest"]
  },
  "text/calendar": {
    "source": "iana",
    "extensions": ["ics","ifb"]
  },
  "text/calender": {
    "compressible": true
  },
  "text/cmd": {
    "compressible": true
  },
  "text/coffeescript": {
    "extensions": ["coffee","litcoffee"]
  },
  "text/css": {
    "source": "iana",
    "charset": "UTF-8",
    "compressible": true,
    "extensions": ["css"]
  },
  "text/csv": {
    "source": "iana",
    "compressible": true,
    "extensions": ["csv"]
  },
  "text/csv-schema": {
    "source": "iana"
  },
  "text/directory": {
    "source": "iana"
  },
  "text/dns": {
    "source": "iana"
  },
  "text/ecmascript": {
    "source": "iana"
  },
  "text/encaprtp": {
    "source": "iana"
  },
  "text/enriched": {
    "source": "iana"
  },
  "text/flexfec": {
    "source": "iana"
  },
  "text/fwdred": {
    "source": "iana"
  },
  "text/grammar-ref-list": {
    "source": "iana"
  },
  "text/html": {
    "source": "iana",
    "compressible": true,
    "extensions": ["html","htm","shtml"]
  },
  "text/jade": {
    "extensions": ["jade"]
  },
  "text/javascript": {
    "source": "iana",
    "compressible": true
  },
  "text/jcr-cnd": {
    "source": "iana"
  },
  "text/jsx": {
    "compressible": true,
    "extensions": ["jsx"]
  },
  "text/less": {
    "compressible": true,
    "extensions": ["less"]
  },
  "text/markdown": {
    "source": "iana",
    "compressible": true,
    "extensions": ["markdown","md"]
  },
  "text/mathml": {
    "source": "nginx",
    "extensions": ["mml"]
  },
  "text/mdx": {
    "compressible": true,
    "extensions": ["mdx"]
  },
  "text/mizar": {
    "source": "iana"
  },
  "text/n3": {
    "source": "iana",
    "charset": "UTF-8",
    "compressible": true,
    "extensions": ["n3"]
  },
  "text/parameters": {
    "source": "iana",
    "charset": "UTF-8"
  },
  "text/parityfec": {
    "source": "iana"
  },
  "text/plain": {
    "source": "iana",
    "compressible": true,
    "extensions": ["txt","text","conf","def","list","log","in","ini","url","cfg"]
  },
  "text/provenance-notation": {
    "source": "iana",
    "charset": "UTF-8"
  },
  "text/prs.fallenstein.rst": {
    "source": "iana"
  },
  "text/prs.lines.tag": {
    "source": "iana",
    "extensions": ["dsc"]
  },
  "text/prs.prop.logic": {
    "source": "iana"
  },
  "text/raptorfec": {
    "source": "iana"
  },
  "text/red": {
    "source": "iana"
  },
  "text/rfc822-headers": {
    "source": "iana"
  },
  "text/richtext": {
    "source": "iana",
    "compressible": true,
    "extensions": ["rtx"]
  },
  "text/rtf": {
    "source": "iana",
    "compressible": true,
    "extensions": ["rtf"]
  },
  "text/rtp-enc-aescm128": {
    "source": "iana"
  },
  "text/rtploopback": {
    "source": "iana"
  },
  "text/rtx": {
    "source": "iana"
  },
  "text/sgml": {
    "source": "iana",
    "extensions": ["sgml","sgm"]
  },
  "text/shex": {
    "extensions": ["shex"]
  },
  "text/slim": {
    "extensions": ["slim","slm"]
  },
  "text/strings": {
    "source": "iana"
  },
  "text/stylus": {
    "extensions": ["stylus","styl"]
  },
  "text/t140": {
    "source": "iana"
  },
  "text/tab-separated-values": {
    "source": "iana",
    "compressible": true,
    "extensions": ["tsv"]
  },
  "text/troff": {
    "source": "iana",
    "extensions": ["t","tr","roff","man","me","ms"]
  },
  "text/turtle": {
    "source": "iana",
    "charset": "UTF-8",
    "extensions": ["ttl"]
  },
  "text/ulpfec": {
    "source": "iana"
  },
  "text/uri-list": {
    "source": "iana",
    "compressible": true,
    "extensions": ["uri","uris","urls"]
  },
  "text/vcard": {
    "source": "iana",
    "compressible": true,
    "extensions": ["vcard"]
  },
  "text/vnd.a": {
    "source": "iana"
  },
  "text/vnd.abc": {
    "source": "iana"
  },
  "text/vnd.ascii-art": {
    "source": "iana"
  },
  "text/vnd.curl": {
    "source": "iana",
    "extensions": ["curl"]
  },
  "text/vnd.curl.dcurl": {
    "source": "apache",
    "extensions": ["dcurl"]
  },
  "text/vnd.curl.mcurl": {
    "source": "apache",
    "extensions": ["mcurl"]
  },
  "text/vnd.curl.scurl": {
    "source": "apache",
    "extensions": ["scurl"]
  },
  "text/vnd.debian.copyright": {
    "source": "iana",
    "charset": "UTF-8"
  },
  "text/vnd.dmclientscript": {
    "source": "iana"
  },
  "text/vnd.dvb.subtitle": {
    "source": "iana",
    "extensions": ["sub"]
  },
  "text/vnd.esmertec.theme-descriptor": {
    "source": "iana",
    "charset": "UTF-8"
  },
  "text/vnd.ficlab.flt": {
    "source": "iana"
  },
  "text/vnd.fly": {
    "source": "iana",
    "extensions": ["fly"]
  },
  "text/vnd.fmi.flexstor": {
    "source": "iana",
    "extensions": ["flx"]
  },
  "text/vnd.gml": {
    "source": "iana"
  },
  "text/vnd.graphviz": {
    "source": "iana",
    "extensions": ["gv"]
  },
  "text/vnd.hgl": {
    "source": "iana"
  },
  "text/vnd.in3d.3dml": {
    "source": "iana",
    "extensions": ["3dml"]
  },
  "text/vnd.in3d.spot": {
    "source": "iana",
    "extensions": ["spot"]
  },
  "text/vnd.iptc.newsml": {
    "source": "iana"
  },
  "text/vnd.iptc.nitf": {
    "source": "iana"
  },
  "text/vnd.latex-z": {
    "source": "iana"
  },
  "text/vnd.motorola.reflex": {
    "source": "iana"
  },
  "text/vnd.ms-mediapackage": {
    "source": "iana"
  },
  "text/vnd.net2phone.commcenter.command": {
    "source": "iana"
  },
  "text/vnd.radisys.msml-basic-layout": {
    "source": "iana"
  },
  "text/vnd.senx.warpscript": {
    "source": "iana"
  },
  "text/vnd.si.uricatalogue": {
    "source": "iana"
  },
  "text/vnd.sosi": {
    "source": "iana"
  },
  "text/vnd.sun.j2me.app-descriptor": {
    "source": "iana",
    "charset": "UTF-8",
    "extensions": ["jad"]
  },
  "text/vnd.trolltech.linguist": {
    "source": "iana",
    "charset": "UTF-8"
  },
  "text/vnd.wap.si": {
    "source": "iana"
  },
  "text/vnd.wap.sl": {
    "source": "iana"
  },
  "text/vnd.wap.wml": {
    "source": "iana",
    "extensions": ["wml"]
  },
  "text/vnd.wap.wmlscript": {
    "source": "iana",
    "extensions": ["wmls"]
  },
  "text/vtt": {
    "source": "iana",
    "charset": "UTF-8",
    "compressible": true,
    "extensions": ["vtt"]
  },
  "text/x-asm": {
    "source": "apache",
    "extensions": ["s","asm"]
  },
  "text/x-c": {
    "source": "apache",
    "extensions": ["c","cc","cxx","cpp","h","hh","dic"]
  },
  "text/x-component": {
    "source": "nginx",
    "extensions": ["htc"]
  },
  "text/x-fortran": {
    "source": "apache",
    "extensions": ["f","for","f77","f90"]
  },
  "text/x-gwt-rpc": {
    "compressible": true
  },
  "text/x-handlebars-template": {
    "extensions": ["hbs"]
  },
  "text/x-java-source": {
    "source": "apache",
    "extensions": ["java"]
  },
  "text/x-jquery-tmpl": {
    "compressible": true
  },
  "text/x-lua": {
    "extensions": ["lua"]
  },
  "text/x-markdown": {
    "compressible": true,
    "extensions": ["mkd"]
  },
  "text/x-nfo": {
    "source": "apache",
    "extensions": ["nfo"]
  },
  "text/x-opml": {
    "source": "apache",
    "extensions": ["opml"]
  },
  "text/x-org": {
    "compressible": true,
    "extensions": ["org"]
  },
  "text/x-pascal": {
    "source": "apache",
    "extensions": ["p","pas"]
  },
  "text/x-processing": {
    "compressible": true,
    "extensions": ["pde"]
  },
  "text/x-sass": {
    "extensions": ["sass"]
  },
  "text/x-scss": {
    "extensions": ["scss"]
  },
  "text/x-setext": {
    "source": "apache",
    "extensions": ["etx"]
  },
  "text/x-sfv": {
    "source": "apache",
    "extensions": ["sfv"]
  },
  "text/x-suse-ymp": {
    "compressible": true,
    "extensions": ["ymp"]
  },
  "text/x-uuencode": {
    "source": "apache",
    "extensions": ["uu"]
  },
  "text/x-vcalendar": {
    "source": "apache",
    "extensions": ["vcs"]
  },
  "text/x-vcard": {
    "source": "apache",
    "extensions": ["vcf"]
  },
  "text/xml": {
    "source": "iana",
    "compressible": true,
    "extensions": ["xml","config"]
  },
  "text/xml-external-parsed-entity": {
    "source": "iana"
  },
  "text/yaml": {
    "extensions": ["yaml","yml"]
  },
  "video/1d-interleaved-parityfec": {
    "source": "iana"
  },
  "video/3gpp": {
    "source": "iana",
    "extensions": ["3gp","3gpp"]
  },
  "video/3gpp-tt": {
    "source": "iana"
  },
  "video/3gpp2": {
    "source": "iana",
    "extensions": ["3g2"]
  },
  "video/bmpeg": {
    "source": "iana"
  },
  "video/bt656": {
    "source": "iana"
  },
  "video/celb": {
    "source": "iana"
  },
  "video/dv": {
    "source": "iana"
  },
  "video/encaprtp": {
    "source": "iana"
  },
  "video/flexfec": {
    "source": "iana"
  },
  "video/h261": {
    "source": "iana",
    "extensions": ["h261"]
  },
  "video/h263": {
    "source": "iana",
    "extensions": ["h263"]
  },
  "video/h263-1998": {
    "source": "iana"
  },
  "video/h263-2000": {
    "source": "iana"
  },
  "video/h264": {
    "source": "iana",
    "extensions": ["h264"]
  },
  "video/h264-rcdo": {
    "source": "iana"
  },
  "video/h264-svc": {
    "source": "iana"
  },
  "video/h265": {
    "source": "iana"
  },
  "video/iso.segment": {
    "source": "iana"
  },
  "video/jpeg": {
    "source": "iana",
    "extensions": ["jpgv"]
  },
  "video/jpeg2000": {
    "source": "iana"
  },
  "video/jpm": {
    "source": "apache",
    "extensions": ["jpm","jpgm"]
  },
  "video/mj2": {
    "source": "iana",
    "extensions": ["mj2","mjp2"]
  },
  "video/mp1s": {
    "source": "iana"
  },
  "video/mp2p": {
    "source": "iana"
  },
  "video/mp2t": {
    "source": "iana",
    "extensions": ["ts"]
  },
  "video/mp4": {
    "source": "iana",
    "compressible": false,
    "extensions": ["mp4","mp4v","mpg4"]
  },
  "video/mp4v-es": {
    "source": "iana"
  },
  "video/mpeg": {
    "source": "iana",
    "compressible": false,
    "extensions": ["mpeg","mpg","mpe","m1v","m2v"]
  },
  "video/mpeg4-generic": {
    "source": "iana"
  },
  "video/mpv": {
    "source": "iana"
  },
  "video/nv": {
    "source": "iana"
  },
  "video/ogg": {
    "source": "iana",
    "compressible": false,
    "extensions": ["ogv"]
  },
  "video/parityfec": {
    "source": "iana"
  },
  "video/pointer": {
    "source": "iana"
  },
  "video/quicktime": {
    "source": "iana",
    "compressible": false,
    "extensions": ["qt","mov"]
  },
  "video/raptorfec": {
    "source": "iana"
  },
  "video/raw": {
    "source": "iana"
  },
  "video/rtp-enc-aescm128": {
    "source": "iana"
  },
  "video/rtploopback": {
    "source": "iana"
  },
  "video/rtx": {
    "source": "iana"
  },
  "video/smpte291": {
    "source": "iana"
  },
  "video/smpte292m": {
    "source": "iana"
  },
  "video/ulpfec": {
    "source": "iana"
  },
  "video/vc1": {
    "source": "iana"
  },
  "video/vc2": {
    "source": "iana"
  },
  "video/vnd.cctv": {
    "source": "iana"
  },
  "video/vnd.dece.hd": {
    "source": "iana",
    "extensions": ["uvh","uvvh"]
  },
  "video/vnd.dece.mobile": {
    "source": "iana",
    "extensions": ["uvm","uvvm"]
  },
  "video/vnd.dece.mp4": {
    "source": "iana"
  },
  "video/vnd.dece.pd": {
    "source": "iana",
    "extensions": ["uvp","uvvp"]
  },
  "video/vnd.dece.sd": {
    "source": "iana",
    "extensions": ["uvs","uvvs"]
  },
  "video/vnd.dece.video": {
    "source": "iana",
    "extensions": ["uvv","uvvv"]
  },
  "video/vnd.directv.mpeg": {
    "source": "iana"
  },
  "video/vnd.directv.mpeg-tts": {
    "source": "iana"
  },
  "video/vnd.dlna.mpeg-tts": {
    "source": "iana"
  },
  "video/vnd.dvb.file": {
    "source": "iana",
    "extensions": ["dvb"]
  },
  "video/vnd.fvt": {
    "source": "iana",
    "extensions": ["fvt"]
  },
  "video/vnd.hns.video": {
    "source": "iana"
  },
  "video/vnd.iptvforum.1dparityfec-1010": {
    "source": "iana"
  },
  "video/vnd.iptvforum.1dparityfec-2005": {
    "source": "iana"
  },
  "video/vnd.iptvforum.2dparityfec-1010": {
    "source": "iana"
  },
  "video/vnd.iptvforum.2dparityfec-2005": {
    "source": "iana"
  },
  "video/vnd.iptvforum.ttsavc": {
    "source": "iana"
  },
  "video/vnd.iptvforum.ttsmpeg2": {
    "source": "iana"
  },
  "video/vnd.motorola.video": {
    "source": "iana"
  },
  "video/vnd.motorola.videop": {
    "source": "iana"
  },
  "video/vnd.mpegurl": {
    "source": "iana",
    "extensions": ["mxu","m4u"]
  },
  "video/vnd.ms-playready.media.pyv": {
    "source": "iana",
    "extensions": ["pyv"]
  },
  "video/vnd.nokia.interleaved-multimedia": {
    "source": "iana"
  },
  "video/vnd.nokia.mp4vr": {
    "source": "iana"
  },
  "video/vnd.nokia.videovoip": {
    "source": "iana"
  },
  "video/vnd.objectvideo": {
    "source": "iana"
  },
  "video/vnd.radgamettools.bink": {
    "source": "iana"
  },
  "video/vnd.radgamettools.smacker": {
    "source": "iana"
  },
  "video/vnd.sealed.mpeg1": {
    "source": "iana"
  },
  "video/vnd.sealed.mpeg4": {
    "source": "iana"
  },
  "video/vnd.sealed.swf": {
    "source": "iana"
  },
  "video/vnd.sealedmedia.softseal.mov": {
    "source": "iana"
  },
  "video/vnd.uvvu.mp4": {
    "source": "iana",
    "extensions": ["uvu","uvvu"]
  },
  "video/vnd.vivo": {
    "source": "iana",
    "extensions": ["viv"]
  },
  "video/vnd.youtube.yt": {
    "source": "iana"
  },
  "video/vp8": {
    "source": "iana"
  },
  "video/webm": {
    "source": "apache",
    "compressible": false,
    "extensions": ["webm"]
  },
  "video/x-f4v": {
    "source": "apache",
    "extensions": ["f4v"]
  },
  "video/x-fli": {
    "source": "apache",
    "extensions": ["fli"]
  },
  "video/x-flv": {
    "source": "apache",
    "compressible": false,
    "extensions": ["flv"]
  },
  "video/x-m4v": {
    "source": "apache",
    "extensions": ["m4v"]
  },
  "video/x-matroska": {
    "source": "apache",
    "compressible": false,
    "extensions": ["mkv","mk3d","mks"]
  },
  "video/x-mng": {
    "source": "apache",
    "extensions": ["mng"]
  },
  "video/x-ms-asf": {
    "source": "apache",
    "extensions": ["asf","asx"]
  },
  "video/x-ms-vob": {
    "source": "apache",
    "extensions": ["vob"]
  },
  "video/x-ms-wm": {
    "source": "apache",
    "extensions": ["wm"]
  },
  "video/x-ms-wmv": {
    "source": "apache",
    "compressible": false,
    "extensions": ["wmv"]
  },
  "video/x-ms-wmx": {
    "source": "apache",
    "extensions": ["wmx"]
  },
  "video/x-ms-wvx": {
    "source": "apache",
    "extensions": ["wvx"]
  },
  "video/x-msvideo": {
    "source": "apache",
    "extensions": ["avi"]
  },
  "video/x-sgi-movie": {
    "source": "apache",
    "extensions": ["movie"]
  },
  "video/x-smv": {
    "source": "apache",
    "extensions": ["smv"]
  },
  "x-conference/x-cooltalk": {
    "source": "apache",
    "extensions": ["ice"]
  },
  "x-shader/x-fragment": {
    "compressible": true
  },
  "x-shader/x-vertex": {
    "compressible": true
  }
}
var mime_compiled = {};
Object.keys(mime_source).forEach(function(key){
	var prop = mime_source[key];
	if(prop.extensions) prop.extensions.forEach(function(ext){
		mime_compiled[ext] = key;
	});
});
console.log(JSON.stringify(mime_compiled));*/

// compiled mimes
var mimes = {"123":"application/vnd.lotus-1-2-3","ez":"application/andrew-inset","aw":"application/applixware","atom":"application/atom+xml","atomcat":"application/atomcat+xml","atomdeleted":"application/atomdeleted+xml","atomsvc":"application/atomsvc+xml","dwd":"application/atsc-dwd+xml","held":"application/atsc-held+xml","rsat":"application/atsc-rsat+xml","bdoc":"application/x-bdoc","xcs":"application/calendar+xml","ccxml":"application/ccxml+xml","cdfx":"application/cdfx+xml","cdmia":"application/cdmi-capability","cdmic":"application/cdmi-container","cdmid":"application/cdmi-domain","cdmio":"application/cdmi-object","cdmiq":"application/cdmi-queue","cu":"application/cu-seeme","mpd":"application/dash+xml","davmount":"application/davmount+xml","dbk":"application/docbook+xml","dssc":"application/dssc+der","xdssc":"application/dssc+xml","ecma":"application/ecmascript","es":"application/ecmascript","emma":"application/emma+xml","emotionml":"application/emotionml+xml","epub":"application/epub+zip","exi":"application/exi","fdt":"application/fdt+xml","pfr":"application/font-tdpfr","geojson":"application/geo+json","gml":"application/gml+xml","gpx":"application/gpx+xml","gxf":"application/gxf","gz":"application/gzip","hjson":"application/hjson","stk":"application/hyperstudio","ink":"application/inkml+xml","inkml":"application/inkml+xml","ipfix":"application/ipfix","its":"application/its+xml","jar":"application/java-archive","war":"application/java-archive","ear":"application/java-archive","ser":"application/java-serialized-object","class":"application/java-vm","js":"application/javascript","mjs":"application/javascript","json":"application/json","map":"application/json","json5":"application/json5","jsonml":"application/jsonml+json","jsonld":"application/ld+json","lgr":"application/lgr+xml","lostxml":"application/lost+xml","hqx":"application/mac-binhex40","cpt":"application/mac-compactpro","mads":"application/mads+xml","webmanifest":"application/manifest+json","mrc":"application/marc","mrcx":"application/marcxml+xml","ma":"application/mathematica","nb":"application/mathematica","mb":"application/mathematica","mathml":"application/mathml+xml","mbox":"application/mbox","mscml":"application/mediaservercontrol+xml","metalink":"application/metalink+xml","meta4":"application/metalink4+xml","mets":"application/mets+xml","maei":"application/mmt-aei+xml","musd":"application/mmt-usd+xml","mods":"application/mods+xml","m21":"application/mp21","mp21":"application/mp21","mp4s":"application/mp4","m4p":"application/mp4","xdf":"application/xcap-diff+xml","doc":"application/msword","dot":"application/msword","mxf":"application/mxf","nq":"application/n-quads","nt":"application/n-triples","cjs":"application/node","bin":"application/octet-stream","dms":"application/octet-stream","lrf":"application/octet-stream","mar":"application/octet-stream","so":"application/octet-stream","dist":"application/octet-stream","distz":"application/octet-stream","pkg":"application/octet-stream","bpk":"application/octet-stream","dump":"application/octet-stream","elc":"application/octet-stream","deploy":"application/octet-stream","exe":"application/x-msdownload","dll":"application/x-msdownload","deb":"application/x-debian-package","dmg":"application/x-apple-diskimage","iso":"application/x-iso9660-image","img":"application/octet-stream","msi":"application/x-msdownload","msp":"application/octet-stream","msm":"application/octet-stream","buffer":"application/octet-stream","oda":"application/oda","opf":"application/oebps-package+xml","ogx":"application/ogg","omdoc":"application/omdoc+xml","onetoc":"application/onenote","onetoc2":"application/onenote","onetmp":"application/onenote","onepkg":"application/onenote","oxps":"application/oxps","relo":"application/p2p-overlay+xml","xer":"application/xcap-error+xml","pdf":"application/pdf","pgp":"application/pgp-encrypted","asc":"application/pgp-signature","sig":"application/pgp-signature","prf":"application/pics-rules","p10":"application/pkcs10","p7m":"application/pkcs7-mime","p7c":"application/pkcs7-mime","p7s":"application/pkcs7-signature","p8":"application/pkcs8","ac":"application/vnd.nokia.n-gage.ac+xml","cer":"application/pkix-cert","crl":"application/pkix-crl","pkipath":"application/pkix-pkipath","pki":"application/pkixcmp","pls":"application/pls+xml","ai":"application/postscript","eps":"application/postscript","ps":"application/postscript","provx":"application/provenance+xml","cww":"application/prs.cww","pskcxml":"application/pskc+xml","raml":"application/raml+yaml","rdf":"application/rdf+xml","owl":"application/rdf+xml","rif":"application/reginfo+xml","rnc":"application/relax-ng-compact-syntax","rl":"application/resource-lists+xml","rld":"application/resource-lists-diff+xml","rs":"application/rls-services+xml","rapd":"application/route-apd+xml","sls":"application/route-s-tsid+xml","rusd":"application/route-usd+xml","gbr":"application/rpki-ghostbusters","mft":"application/rpki-manifest","roa":"application/rpki-roa","rsd":"application/rsd+xml","rss":"application/rss+xml","rtf":"text/rtf","sbml":"application/sbml+xml","scq":"application/scvp-cv-request","scs":"application/scvp-cv-response","spq":"application/scvp-vp-request","spp":"application/scvp-vp-response","sdp":"application/sdp","senmlx":"application/senml+xml","sensmlx":"application/sensml+xml","setpay":"application/set-payment-initiation","setreg":"application/set-registration-initiation","shf":"application/shf+xml","siv":"application/sieve","sieve":"application/sieve","smi":"application/smil+xml","smil":"application/smil+xml","rq":"application/sparql-query","srx":"application/sparql-results+xml","gram":"application/srgs","grxml":"application/srgs+xml","sru":"application/sru+xml","ssdl":"application/ssdl+xml","ssml":"application/ssml+xml","swidtag":"application/swid+xml","tei":"application/tei+xml","teicorpus":"application/tei+xml","tfi":"application/thraud+xml","tsd":"application/timestamped-data","toml":"application/toml","ttml":"application/ttml+xml","rsheet":"application/urc-ressheet+xml","1km":"application/vnd.1000minds.decision-model+xml","plb":"application/vnd.3gpp.pic-bw-large","psb":"application/vnd.3gpp.pic-bw-small","pvb":"application/vnd.3gpp.pic-bw-var","tcap":"application/vnd.3gpp2.tcap","pwn":"application/vnd.3m.post-it-notes","aso":"application/vnd.accpac.simply.aso","imp":"application/vnd.accpac.simply.imp","acu":"application/vnd.acucobol","atc":"application/vnd.acucorp","acutc":"application/vnd.acucorp","air":"application/vnd.adobe.air-application-installer-package+zip","fcdt":"application/vnd.adobe.formscentral.fcdt","fxp":"application/vnd.adobe.fxp","fxpl":"application/vnd.adobe.fxp","xdp":"application/vnd.adobe.xdp+xml","xfdf":"application/vnd.adobe.xfdf","ahead":"application/vnd.ahead.space","azf":"application/vnd.airzip.filesecure.azf","azs":"application/vnd.airzip.filesecure.azs","azw":"application/vnd.amazon.ebook","acc":"application/vnd.americandynamics.acc","ami":"application/vnd.amiga.ami","apk":"application/vnd.android.package-archive","cii":"application/vnd.anser-web-certificate-issue-initiation","fti":"application/vnd.anser-web-funds-transfer-initiation","atx":"application/vnd.antix.game-component","mpkg":"application/vnd.apple.installer+xml","keynote":"application/vnd.apple.keynote","m3u8":"application/vnd.apple.mpegurl","numbers":"application/vnd.apple.numbers","pages":"application/vnd.apple.pages","pkpass":"application/vnd.apple.pkpass","swi":"application/vnd.aristanetworks.swi","iota":"application/vnd.astraea-software.iota","aep":"application/vnd.audiograph","bmml":"application/vnd.balsamiq.bmml+xml","mpm":"application/vnd.blueice.multipass","bmi":"application/vnd.bmi","rep":"application/vnd.businessobjects","cdxml":"application/vnd.chemdraw+xml","mmd":"application/vnd.chipnuts.karaoke-mmd","cdy":"application/vnd.cinderella","csl":"application/vnd.citationstyles.style+xml","cla":"application/vnd.claymore","rp9":"application/vnd.cloanto.rp9","c4g":"application/vnd.clonk.c4group","c4d":"application/vnd.clonk.c4group","c4f":"application/vnd.clonk.c4group","c4p":"application/vnd.clonk.c4group","c4u":"application/vnd.clonk.c4group","c11amc":"application/vnd.cluetrust.cartomobile-config","c11amz":"application/vnd.cluetrust.cartomobile-config-pkg","csp":"application/vnd.commonspace","cdbcmsg":"application/vnd.contact.cmsg","cmc":"application/vnd.cosmocaller","clkx":"application/vnd.crick.clicker","clkk":"application/vnd.crick.clicker.keyboard","clkp":"application/vnd.crick.clicker.palette","clkt":"application/vnd.crick.clicker.template","clkw":"application/vnd.crick.clicker.wordbank","wbs":"application/vnd.criticaltools.wbs+xml","pml":"application/vnd.ctc-posml","ppd":"application/vnd.cups-ppd","car":"application/vnd.curl.car","pcurl":"application/vnd.curl.pcurl","dart":"application/vnd.dart","rdz":"application/vnd.data-vision.rdz","uvf":"application/vnd.dece.data","uvvf":"application/vnd.dece.data","uvd":"application/vnd.dece.data","uvvd":"application/vnd.dece.data","uvt":"application/vnd.dece.ttml+xml","uvvt":"application/vnd.dece.ttml+xml","uvx":"application/vnd.dece.unspecified","uvvx":"application/vnd.dece.unspecified","uvz":"application/vnd.dece.zip","uvvz":"application/vnd.dece.zip","fe_launch":"application/vnd.denovo.fcselayout-link","dna":"application/vnd.dna","mlp":"application/vnd.dolby.mlp","dpg":"application/vnd.dpgraph","dfac":"application/vnd.dreamfactory","kpxx":"application/vnd.ds-keypoint","ait":"application/vnd.dvb.ait","svc":"application/vnd.dvb.service","geo":"application/vnd.dynageo","mag":"application/vnd.ecowin.chart","nml":"application/vnd.enliven","esf":"application/vnd.epson.esf","msf":"application/vnd.epson.msf","qam":"application/vnd.epson.quickanime","slt":"application/vnd.epson.salt","ssf":"application/vnd.epson.ssf","es3":"application/vnd.eszigno3+xml","et3":"application/vnd.eszigno3+xml","ez2":"application/vnd.ezpix-album","ez3":"application/vnd.ezpix-package","fdf":"application/vnd.fdf","mseed":"application/vnd.fdsn.mseed","seed":"application/vnd.fdsn.seed","dataless":"application/vnd.fdsn.seed","gph":"application/vnd.flographit","ftc":"application/vnd.fluxtime.clip","fm":"application/vnd.framemaker","frame":"application/vnd.framemaker","maker":"application/vnd.framemaker","book":"application/vnd.framemaker","fnc":"application/vnd.frogans.fnc","ltf":"application/vnd.frogans.ltf","fsc":"application/vnd.fsc.weblaunch","oas":"application/vnd.fujitsu.oasys","oa2":"application/vnd.fujitsu.oasys2","oa3":"application/vnd.fujitsu.oasys3","fg5":"application/vnd.fujitsu.oasysgp","bh2":"application/vnd.fujitsu.oasysprs","ddd":"application/vnd.fujixerox.ddd","xdw":"application/vnd.fujixerox.docuworks","xbd":"application/vnd.fujixerox.docuworks.binder","fzs":"application/vnd.fuzzysheet","txd":"application/vnd.genomatix.tuxedo","ggb":"application/vnd.geogebra.file","ggt":"application/vnd.geogebra.tool","gex":"application/vnd.geometry-explorer","gre":"application/vnd.geometry-explorer","gxt":"application/vnd.geonext","g2w":"application/vnd.geoplan","g3w":"application/vnd.geospace","gmx":"application/vnd.gmx","gdoc":"application/vnd.google-apps.document","gslides":"application/vnd.google-apps.presentation","gsheet":"application/vnd.google-apps.spreadsheet","kml":"application/vnd.google-earth.kml+xml","kmz":"application/vnd.google-earth.kmz","gqf":"application/vnd.grafeq","gqs":"application/vnd.grafeq","gac":"application/vnd.groove-account","ghf":"application/vnd.groove-help","gim":"application/vnd.groove-identity-message","grv":"application/vnd.groove-injector","gtm":"application/vnd.groove-tool-message","tpl":"application/vnd.groove-tool-template","vcg":"application/vnd.groove-vcard","hal":"application/vnd.hal+xml","zmm":"application/vnd.handheld-entertainment+xml","hbci":"application/vnd.hbci","les":"application/vnd.hhe.lesson-player","hpgl":"application/vnd.hp-hpgl","hpid":"application/vnd.hp-hpid","hps":"application/vnd.hp-hps","jlt":"application/vnd.hp-jlyt","pcl":"application/vnd.hp-pcl","pclxl":"application/vnd.hp-pclxl","sfd-hdstx":"application/vnd.hydrostatix.sof-data","mpy":"application/vnd.ibm.minipay","afp":"application/vnd.ibm.modcap","listafp":"application/vnd.ibm.modcap","list3820":"application/vnd.ibm.modcap","irm":"application/vnd.ibm.rights-management","sc":"application/vnd.ibm.secure-container","icc":"application/vnd.iccprofile","icm":"application/vnd.iccprofile","igl":"application/vnd.igloader","ivp":"application/vnd.immervision-ivp","ivu":"application/vnd.immervision-ivu","igm":"application/vnd.insors.igm","xpw":"application/vnd.intercon.formnet","xpx":"application/vnd.intercon.formnet","i2g":"application/vnd.intergeo","qbo":"application/vnd.intu.qbo","qfx":"application/vnd.intu.qfx","rcprofile":"application/vnd.ipunplugged.rcprofile","irp":"application/vnd.irepository.package+xml","xpr":"application/vnd.is-xpr","fcs":"application/vnd.isac.fcs","jam":"application/vnd.jam","rms":"application/vnd.jcp.javame.midlet-rms","jisp":"application/vnd.jisp","joda":"application/vnd.joost.joda-archive","ktz":"application/vnd.kahootz","ktr":"application/vnd.kahootz","karbon":"application/vnd.kde.karbon","chrt":"application/vnd.kde.kchart","kfo":"application/vnd.kde.kformula","flw":"application/vnd.kde.kivio","kon":"application/vnd.kde.kontour","kpr":"application/vnd.kde.kpresenter","kpt":"application/vnd.kde.kpresenter","ksp":"application/vnd.kde.kspread","kwd":"application/vnd.kde.kword","kwt":"application/vnd.kde.kword","htke":"application/vnd.kenameaapp","kia":"application/vnd.kidspiration","kne":"application/vnd.kinar","knp":"application/vnd.kinar","skp":"application/vnd.koan","skd":"application/vnd.koan","skt":"application/vnd.koan","skm":"application/vnd.koan","sse":"application/vnd.kodak-descriptor","lasxml":"application/vnd.las.las+xml","lbd":"application/vnd.llamagraphics.life-balance.desktop","lbe":"application/vnd.llamagraphics.life-balance.exchange+xml","apr":"application/vnd.lotus-approach","pre":"application/vnd.lotus-freelance","nsf":"application/vnd.lotus-notes","org":"text/x-org","scm":"application/vnd.lotus-screencam","lwp":"application/vnd.lotus-wordpro","portpkg":"application/vnd.macports.portpkg","mcd":"application/vnd.mcd","mc1":"application/vnd.medcalcdata","cdkey":"application/vnd.mediastation.cdkey","mwf":"application/vnd.mfer","mfm":"application/vnd.mfmp","flo":"application/vnd.micrografx.flo","igx":"application/vnd.micrografx.igx","mif":"application/vnd.mif","daf":"application/vnd.mobius.daf","dis":"application/vnd.mobius.dis","mbk":"application/vnd.mobius.mbk","mqy":"application/vnd.mobius.mqy","msl":"application/vnd.mobius.msl","plc":"application/vnd.mobius.plc","txf":"application/vnd.mobius.txf","mpn":"application/vnd.mophun.application","mpc":"application/vnd.mophun.certificate","xul":"application/vnd.mozilla.xul+xml","cil":"application/vnd.ms-artgalry","cab":"application/vnd.ms-cab-compressed","xls":"application/vnd.ms-excel","xlm":"application/vnd.ms-excel","xla":"application/vnd.ms-excel","xlc":"application/vnd.ms-excel","xlt":"application/vnd.ms-excel","xlw":"application/vnd.ms-excel","xlam":"application/vnd.ms-excel.addin.macroenabled.12","xlsb":"application/vnd.ms-excel.sheet.binary.macroenabled.12","xlsm":"application/vnd.ms-excel.sheet.macroenabled.12","xltm":"application/vnd.ms-excel.template.macroenabled.12","eot":"application/vnd.ms-fontobject","chm":"application/vnd.ms-htmlhelp","ims":"application/vnd.ms-ims","lrm":"application/vnd.ms-lrm","thmx":"application/vnd.ms-officetheme","msg":"application/vnd.ms-outlook","cat":"application/vnd.ms-pki.seccat","stl":"model/stl","ppt":"application/vnd.ms-powerpoint","pps":"application/vnd.ms-powerpoint","pot":"application/vnd.ms-powerpoint","ppam":"application/vnd.ms-powerpoint.addin.macroenabled.12","pptm":"application/vnd.ms-powerpoint.presentation.macroenabled.12","sldm":"application/vnd.ms-powerpoint.slide.macroenabled.12","ppsm":"application/vnd.ms-powerpoint.slideshow.macroenabled.12","potm":"application/vnd.ms-powerpoint.template.macroenabled.12","mpp":"application/vnd.ms-project","mpt":"application/vnd.ms-project","docm":"application/vnd.ms-word.document.macroenabled.12","dotm":"application/vnd.ms-word.template.macroenabled.12","wps":"application/vnd.ms-works","wks":"application/vnd.ms-works","wcm":"application/vnd.ms-works","wdb":"application/vnd.ms-works","wpl":"application/vnd.ms-wpl","xps":"application/vnd.ms-xpsdocument","mseq":"application/vnd.mseq","mus":"application/vnd.musician","msty":"application/vnd.muvee.style","taglet":"application/vnd.mynfc","nlu":"application/vnd.neurolanguage.nlu","ntf":"application/vnd.nitf","nitf":"application/vnd.nitf","nnd":"application/vnd.noblenet-directory","nns":"application/vnd.noblenet-sealer","nnw":"application/vnd.noblenet-web","ngdat":"application/vnd.nokia.n-gage.data","n-gage":"application/vnd.nokia.n-gage.symbian.install","rpst":"application/vnd.nokia.radio-preset","rpss":"application/vnd.nokia.radio-presets","edm":"application/vnd.novadigm.edm","edx":"application/vnd.novadigm.edx","ext":"application/vnd.novadigm.ext","odc":"application/vnd.oasis.opendocument.chart","otc":"application/vnd.oasis.opendocument.chart-template","odb":"application/vnd.oasis.opendocument.database","odf":"application/vnd.oasis.opendocument.formula","odft":"application/vnd.oasis.opendocument.formula-template","odg":"application/vnd.oasis.opendocument.graphics","otg":"application/vnd.oasis.opendocument.graphics-template","odi":"application/vnd.oasis.opendocument.image","oti":"application/vnd.oasis.opendocument.image-template","odp":"application/vnd.oasis.opendocument.presentation","otp":"application/vnd.oasis.opendocument.presentation-template","ods":"application/vnd.oasis.opendocument.spreadsheet","ots":"application/vnd.oasis.opendocument.spreadsheet-template","odt":"application/vnd.oasis.opendocument.text","odm":"application/vnd.oasis.opendocument.text-master","ott":"application/vnd.oasis.opendocument.text-template","oth":"application/vnd.oasis.opendocument.text-web","xo":"application/vnd.olpc-sugar","dd2":"application/vnd.oma.dd2+xml","obgx":"application/vnd.openblox.game+xml","oxt":"application/vnd.openofficeorg.extension","osm":"application/vnd.openstreetmap.data+xml","pptx":"application/vnd.openxmlformats-officedocument.presentationml.presentation","sldx":"application/vnd.openxmlformats-officedocument.presentationml.slide","ppsx":"application/vnd.openxmlformats-officedocument.presentationml.slideshow","potx":"application/vnd.openxmlformats-officedocument.presentationml.template","xlsx":"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet","xltx":"application/vnd.openxmlformats-officedocument.spreadsheetml.template","docx":"application/vnd.openxmlformats-officedocument.wordprocessingml.document","dotx":"application/vnd.openxmlformats-officedocument.wordprocessingml.template","mgp":"application/vnd.osgeo.mapguide.package","dp":"application/vnd.osgi.dp","esa":"application/vnd.osgi.subsystem","pdb":"application/x-pilot","pqa":"application/vnd.palm","oprc":"application/vnd.palm","paw":"application/vnd.pawaafile","str":"application/vnd.pg.format","ei6":"application/vnd.pg.osasli","efif":"application/vnd.picsel","wg":"application/vnd.pmi.widget","plf":"application/vnd.pocketlearn","pbd":"application/vnd.powerbuilder6","box":"application/vnd.previewsystems.box","mgz":"application/vnd.proteus.magazine","qps":"application/vnd.publishare-delta-tree","ptid":"application/vnd.pvi.ptid1","qxd":"application/vnd.quark.quarkxpress","qxt":"application/vnd.quark.quarkxpress","qwd":"application/vnd.quark.quarkxpress","qwt":"application/vnd.quark.quarkxpress","qxl":"application/vnd.quark.quarkxpress","qxb":"application/vnd.quark.quarkxpress","bed":"application/vnd.realvnc.bed","mxl":"application/vnd.recordare.musicxml","musicxml":"application/vnd.recordare.musicxml+xml","cryptonote":"application/vnd.rig.cryptonote","cod":"application/vnd.rim.cod","rm":"application/vnd.rn-realmedia","rmvb":"application/vnd.rn-realmedia-vbr","link66":"application/vnd.route66.link66+xml","st":"application/vnd.sailingtracker.track","see":"application/vnd.seemail","sema":"application/vnd.sema","semd":"application/vnd.semd","semf":"application/vnd.semf","ifm":"application/vnd.shana.informed.formdata","itp":"application/vnd.shana.informed.formtemplate","iif":"application/vnd.shana.informed.interchange","ipk":"application/vnd.shana.informed.package","twd":"application/vnd.simtech-mindmapper","twds":"application/vnd.simtech-mindmapper","mmf":"application/vnd.smaf","teacher":"application/vnd.smart.teacher","fo":"application/vnd.software602.filler.form+xml","sdkm":"application/vnd.solent.sdkm+xml","sdkd":"application/vnd.solent.sdkm+xml","dxp":"application/vnd.spotfire.dxp","sfs":"application/vnd.spotfire.sfs","sdc":"application/vnd.stardivision.calc","sda":"application/vnd.stardivision.draw","sdd":"application/vnd.stardivision.impress","smf":"application/vnd.stardivision.math","sdw":"application/vnd.stardivision.writer","vor":"application/vnd.stardivision.writer","sgl":"application/vnd.stardivision.writer-global","smzip":"application/vnd.stepmania.package","sm":"application/vnd.stepmania.stepchart","wadl":"application/vnd.sun.wadl+xml","sxc":"application/vnd.sun.xml.calc","stc":"application/vnd.sun.xml.calc.template","sxd":"application/vnd.sun.xml.draw","std":"application/vnd.sun.xml.draw.template","sxi":"application/vnd.sun.xml.impress","sti":"application/vnd.sun.xml.impress.template","sxm":"application/vnd.sun.xml.math","sxw":"application/vnd.sun.xml.writer","sxg":"application/vnd.sun.xml.writer.global","stw":"application/vnd.sun.xml.writer.template","sus":"application/vnd.sus-calendar","susp":"application/vnd.sus-calendar","svd":"application/vnd.svd","sis":"application/vnd.symbian.install","sisx":"application/vnd.symbian.install","xsm":"application/vnd.syncml+xml","bdm":"application/vnd.syncml.dm+wbxml","xdm":"application/vnd.syncml.dm+xml","ddf":"application/vnd.syncml.dmddf+xml","tao":"application/vnd.tao.intent-module-archive","pcap":"application/vnd.tcpdump.pcap","cap":"application/vnd.tcpdump.pcap","dmp":"application/vnd.tcpdump.pcap","tmo":"application/vnd.tmobile-livetv","tpt":"application/vnd.trid.tpt","mxs":"application/vnd.triscape.mxs","tra":"application/vnd.trueapp","ufd":"application/vnd.ufdl","ufdl":"application/vnd.ufdl","utz":"application/vnd.uiq.theme","umj":"application/vnd.umajin","unityweb":"application/vnd.unity","uoml":"application/vnd.uoml+xml","vcx":"application/vnd.vcx","vsd":"application/vnd.visio","vst":"application/vnd.visio","vss":"application/vnd.visio","vsw":"application/vnd.visio","vis":"application/vnd.visionary","vsf":"application/vnd.vsf","wbxml":"application/vnd.wap.wbxml","wmlc":"application/vnd.wap.wmlc","wmlsc":"application/vnd.wap.wmlscriptc","wtb":"application/vnd.webturbo","nbp":"application/vnd.wolfram.player","wpd":"application/vnd.wordperfect","wqd":"application/vnd.wqd","stf":"application/vnd.wt.stf","xar":"application/vnd.xara","xfdl":"application/vnd.xfdl","hvd":"application/vnd.yamaha.hv-dic","hvs":"application/vnd.yamaha.hv-script","hvp":"application/vnd.yamaha.hv-voice","osf":"application/vnd.yamaha.openscoreformat","osfpvg":"application/vnd.yamaha.openscoreformat.osfpvg+xml","saf":"application/vnd.yamaha.smaf-audio","spf":"application/vnd.yamaha.smaf-phrase","cmp":"application/vnd.yellowriver-custom-menu","zir":"application/vnd.zul","zirz":"application/vnd.zul","zaz":"application/vnd.zzazz.deck+xml","vxml":"application/voicexml+xml","wasm":"application/wasm","wgt":"application/widget","hlp":"application/winhlp","wsdl":"application/wsdl+xml","wspolicy":"application/wspolicy+xml","7z":"application/x-7z-compressed","abw":"application/x-abiword","ace":"application/x-ace-compressed","arj":"application/x-arj","aab":"application/x-authorware-bin","x32":"application/x-authorware-bin","u32":"application/x-authorware-bin","vox":"application/x-authorware-bin","aam":"application/x-authorware-map","aas":"application/x-authorware-seg","bcpio":"application/x-bcpio","torrent":"application/x-bittorrent","blb":"application/x-blorb","blorb":"application/x-blorb","bz":"application/x-bzip","bz2":"application/x-bzip2","boz":"application/x-bzip2","cbr":"application/x-cbr","cba":"application/x-cbr","cbt":"application/x-cbr","cbz":"application/x-cbr","cb7":"application/x-cbr","vcd":"application/x-cdlink","cfs":"application/x-cfs-compressed","chat":"application/x-chat","pgn":"application/x-chess-pgn","crx":"application/x-chrome-extension","cco":"application/x-cocoa","nsc":"application/x-conference","cpio":"application/x-cpio","csh":"application/x-csh","udeb":"application/x-debian-package","dgc":"application/x-dgc-compressed","dir":"application/x-director","dcr":"application/x-director","dxr":"application/x-director","cst":"application/x-director","cct":"application/x-director","cxt":"application/x-director","w3d":"application/x-director","fgd":"application/x-director","swa":"application/x-director","wad":"application/x-doom","ncx":"application/x-dtbncx+xml","dtb":"application/x-dtbook+xml","res":"application/x-dtbresource+xml","dvi":"application/x-dvi","evy":"application/x-envoy","eva":"application/x-eva","bdf":"application/x-font-bdf","gsf":"application/x-font-ghostscript","psf":"application/x-font-linux-psf","pcf":"application/x-font-pcf","snf":"application/x-font-snf","pfa":"application/x-font-type1","pfb":"application/x-font-type1","pfm":"application/x-font-type1","afm":"application/x-font-type1","arc":"application/x-freearc","spl":"application/x-futuresplash","gca":"application/x-gca-compressed","ulx":"application/x-glulx","gnumeric":"application/x-gnumeric","gramps":"application/x-gramps-xml","gtar":"application/x-gtar","hdf":"application/x-hdf","php":"application/x-httpd-php","install":"application/x-install-instructions","jardiff":"application/x-java-archive-diff","jnlp":"application/x-java-jnlp-file","kdbx":"application/x-keepass2","latex":"application/x-latex","luac":"application/x-lua-bytecode","lzh":"application/x-lzh-compressed","lha":"application/x-lzh-compressed","run":"application/x-makeself","mie":"application/x-mie","prc":"application/x-pilot","mobi":"application/x-mobipocket-ebook","application":"application/x-ms-application","lnk":"application/x-ms-shortcut","wmd":"application/x-ms-wmd","wmz":"application/x-msmetafile","xbap":"application/x-ms-xbap","mdb":"application/x-msaccess","obd":"application/x-msbinder","crd":"application/x-mscardfile","clp":"application/x-msclip","com":"application/x-msdownload","bat":"application/x-msdownload","mvb":"application/x-msmediaview","m13":"application/x-msmediaview","m14":"application/x-msmediaview","wmf":"image/wmf","emf":"image/emf","emz":"application/x-msmetafile","mny":"application/x-msmoney","pub":"application/x-mspublisher","scd":"application/x-msschedule","trm":"application/x-msterminal","wri":"application/x-mswrite","nc":"application/x-netcdf","cdf":"application/x-netcdf","pac":"application/x-ns-proxy-autoconfig","nzb":"application/x-nzb","pl":"application/x-perl","pm":"application/x-perl","p12":"application/x-pkcs12","pfx":"application/x-pkcs12","p7b":"application/x-pkcs7-certificates","spc":"application/x-pkcs7-certificates","p7r":"application/x-pkcs7-certreqresp","rar":"application/x-rar-compressed","rpm":"application/x-redhat-package-manager","ris":"application/x-research-info-systems","sea":"application/x-sea","sh":"application/x-sh","shar":"application/x-shar","swf":"application/x-shockwave-flash","xap":"application/x-silverlight-app","sql":"application/x-sql","sit":"application/x-stuffit","sitx":"application/x-stuffitx","srt":"application/x-subrip","sv4cpio":"application/x-sv4cpio","sv4crc":"application/x-sv4crc","t3":"application/x-t3vm-image","gam":"application/x-tads","tar":"application/x-tar","tcl":"application/x-tcl","tk":"application/x-tcl","tex":"application/x-tex","tfm":"application/x-tex-tfm","texinfo":"application/x-texinfo","texi":"application/x-texinfo","obj":"model/obj","ustar":"application/x-ustar","hdd":"application/x-virtualbox-hdd","ova":"application/x-virtualbox-ova","ovf":"application/x-virtualbox-ovf","vbox":"application/x-virtualbox-vbox","vbox-extpack":"application/x-virtualbox-vbox-extpack","vdi":"application/x-virtualbox-vdi","vhd":"application/x-virtualbox-vhd","vmdk":"application/x-virtualbox-vmdk","src":"application/x-wais-source","webapp":"application/x-web-app-manifest+json","der":"application/x-x509-ca-cert","crt":"application/x-x509-ca-cert","pem":"application/x-x509-ca-cert","fig":"application/x-xfig","xlf":"application/xliff+xml","xpi":"application/x-xpinstall","xz":"application/x-xz","z1":"application/x-zmachine","z2":"application/x-zmachine","z3":"application/x-zmachine","z4":"application/x-zmachine","z5":"application/x-zmachine","z6":"application/x-zmachine","z7":"application/x-zmachine","z8":"application/x-zmachine","xaml":"application/xaml+xml","xav":"application/xcap-att+xml","xca":"application/xcap-caps+xml","xel":"application/xcap-el+xml","xns":"application/xcap-ns+xml","xenc":"application/xenc+xml","xhtml":"application/xhtml+xml","xht":"application/xhtml+xml","xml":"text/xml","config":"text/xml","xsl":"application/xml","xsd":"application/xml","rng":"application/xml","dtd":"application/xml-dtd","xop":"application/xop+xml","xpl":"application/xproc+xml","xslt":"application/xslt+xml","xspf":"application/xspf+xml","mxml":"application/xv+xml","xhvml":"application/xv+xml","xvml":"application/xv+xml","xvm":"application/xv+xml","yang":"application/yang","yin":"application/yin+xml","zip":"application/zip","3gpp":"video/3gpp","adp":"audio/adpcm","au":"audio/basic","snd":"audio/basic","mid":"audio/midi","midi":"audio/midi","kar":"audio/midi","rmi":"audio/midi","mxmf":"audio/mobile-xmf","mp3":"audio/mpeg","m4a":"audio/x-m4a","mp4a":"audio/mp4","mpga":"audio/mpeg","mp2":"audio/mpeg","mp2a":"audio/mpeg","m2a":"audio/mpeg","m3a":"audio/mpeg","oga":"audio/ogg","ogg":"audio/ogg","spx":"audio/ogg","s3m":"audio/s3m","sil":"audio/silk","uva":"audio/vnd.dece.audio","uvva":"audio/vnd.dece.audio","eol":"audio/vnd.digital-winds","dra":"audio/vnd.dra","dts":"audio/vnd.dts","dtshd":"audio/vnd.dts.hd","lvp":"audio/vnd.lucent.voice","pya":"audio/vnd.ms-playready.media.pya","ecelp4800":"audio/vnd.nuera.ecelp4800","ecelp7470":"audio/vnd.nuera.ecelp7470","ecelp9600":"audio/vnd.nuera.ecelp9600","rip":"audio/vnd.rip","wav":"audio/x-wav","weba":"audio/webm","aac":"audio/x-aac","aif":"audio/x-aiff","aiff":"audio/x-aiff","aifc":"audio/x-aiff","caf":"audio/x-caf","flac":"audio/flac","mka":"audio/x-matroska","m3u":"audio/x-mpegurl","wax":"audio/x-ms-wax","wma":"audio/x-ms-wma","ram":"audio/x-pn-realaudio","ra":"audio/x-realaudio","rmp":"audio/x-pn-realaudio-plugin","xm":"audio/xm","cdx":"chemical/x-cdx","cif":"chemical/x-cif","cmdf":"chemical/x-cmdf","cml":"chemical/x-cml","csml":"chemical/x-csml","xyz":"chemical/x-xyz","ttc":"font/collection","otf":"font/otf","ttf":"font/ttf","woff":"font/woff","woff2":"font/woff2","exr":"image/aces","apng":"image/apng","avif":"image/avif","bmp":"image/x-ms-bmp","cgm":"image/cgm","drle":"image/dicom-rle","fits":"image/fits","g3":"image/g3fax","gif":"image/gif","heic":"image/heic","heics":"image/heic-sequence","heif":"image/heif","heifs":"image/heif-sequence","hej2":"image/hej2k","hsj2":"image/hsj2","ief":"image/ief","jls":"image/jls","jp2":"image/jp2","jpg2":"image/jp2","jpeg":"image/jpeg","jpg":"image/jpeg","jpe":"image/jpeg","jph":"image/jph","jhc":"image/jphc","jpm":"video/jpm","jpx":"image/jpx","jpf":"image/jpx","jxr":"image/jxr","jxra":"image/jxra","jxrs":"image/jxrs","jxs":"image/jxs","jxsc":"image/jxsc","jxsi":"image/jxsi","jxss":"image/jxss","ktx":"image/ktx","png":"image/png","btif":"image/prs.btif","pti":"image/prs.pti","sgi":"image/sgi","svg":"image/svg+xml","svgz":"image/svg+xml","t38":"image/t38","tif":"image/tiff","tiff":"image/tiff","tfx":"image/tiff-fx","psd":"image/vnd.adobe.photoshop","azv":"image/vnd.airzip.accelerator.azv","uvi":"image/vnd.dece.graphic","uvvi":"image/vnd.dece.graphic","uvg":"image/vnd.dece.graphic","uvvg":"image/vnd.dece.graphic","djvu":"image/vnd.djvu","djv":"image/vnd.djvu","sub":"text/vnd.dvb.subtitle","dwg":"image/vnd.dwg","dxf":"image/vnd.dxf","fbs":"image/vnd.fastbidsheet","fpx":"image/vnd.fpx","fst":"image/vnd.fst","mmr":"image/vnd.fujixerox.edmics-mmr","rlc":"image/vnd.fujixerox.edmics-rlc","ico":"image/x-icon","dds":"image/vnd.ms-dds","mdi":"image/vnd.ms-modi","wdp":"image/vnd.ms-photo","npx":"image/vnd.net-fpx","tap":"image/vnd.tencent.tap","vtf":"image/vnd.valve.source.texture","wbmp":"image/vnd.wap.wbmp","xif":"image/vnd.xiff","pcx":"image/x-pcx","webp":"image/webp","3ds":"image/x-3ds","ras":"image/x-cmu-raster","cmx":"image/x-cmx","fh":"image/x-freehand","fhc":"image/x-freehand","fh4":"image/x-freehand","fh5":"image/x-freehand","fh7":"image/x-freehand","jng":"image/x-jng","sid":"image/x-mrsid-image","pic":"image/x-pict","pct":"image/x-pict","pnm":"image/x-portable-anymap","pbm":"image/x-portable-bitmap","pgm":"image/x-portable-graymap","ppm":"image/x-portable-pixmap","rgb":"image/x-rgb","tga":"image/x-tga","xbm":"image/x-xbitmap","xpm":"image/x-xpixmap","xwd":"image/x-xwindowdump","disposition-notification":"message/disposition-notification","u8msg":"message/global","u8dsn":"message/global-delivery-status","u8mdn":"message/global-disposition-notification","u8hdr":"message/global-headers","eml":"message/rfc822","mime":"message/rfc822","wsc":"message/vnd.wfa.wsc","3mf":"model/3mf","gltf":"model/gltf+json","glb":"model/gltf-binary","igs":"model/iges","iges":"model/iges","msh":"model/mesh","mesh":"model/mesh","silo":"model/mesh","mtl":"model/mtl","dae":"model/vnd.collada+xml","dwf":"model/vnd.dwf","gdl":"model/vnd.gdl","gtw":"model/vnd.gtw","mts":"model/vnd.mts","ogex":"model/vnd.opengex","x_b":"model/vnd.parasolid.transmit.binary","x_t":"model/vnd.parasolid.transmit.text","usdz":"model/vnd.usdz+zip","bsp":"model/vnd.valve.source.compiled-map","vtu":"model/vnd.vtu","wrl":"model/vrml","vrml":"model/vrml","x3db":"model/x3d+fastinfoset","x3dbz":"model/x3d+binary","x3dv":"model/x3d-vrml","x3dvz":"model/x3d+vrml","x3d":"model/x3d+xml","x3dz":"model/x3d+xml","appcache":"text/cache-manifest","manifest":"text/cache-manifest","ics":"text/calendar","ifb":"text/calendar","coffee":"text/coffeescript","litcoffee":"text/coffeescript","css":"text/css","csv":"text/csv","html":"text/html","htm":"text/html","shtml":"text/html","jade":"text/jade","jsx":"text/jsx","less":"text/less","markdown":"text/markdown","md":"text/markdown","mml":"text/mathml","mdx":"text/mdx","n3":"text/n3","txt":"text/plain","text":"text/plain","conf":"text/plain","def":"text/plain","list":"text/plain","log":"text/plain","in":"text/plain","ini":"text/plain","url":"text/plain","cfg":"text/plain","dsc":"text/prs.lines.tag","rtx":"text/richtext","sgml":"text/sgml","sgm":"text/sgml","shex":"text/shex","slim":"text/slim","slm":"text/slim","stylus":"text/stylus","styl":"text/stylus","tsv":"text/tab-separated-values","t":"text/troff","tr":"text/troff","roff":"text/troff","man":"text/troff","me":"text/troff","ms":"text/troff","ttl":"text/turtle","uri":"text/uri-list","uris":"text/uri-list","urls":"text/uri-list","vcard":"text/vcard","curl":"text/vnd.curl","dcurl":"text/vnd.curl.dcurl","mcurl":"text/vnd.curl.mcurl","scurl":"text/vnd.curl.scurl","fly":"text/vnd.fly","flx":"text/vnd.fmi.flexstor","gv":"text/vnd.graphviz","3dml":"text/vnd.in3d.3dml","spot":"text/vnd.in3d.spot","jad":"text/vnd.sun.j2me.app-descriptor","wml":"text/vnd.wap.wml","wmls":"text/vnd.wap.wmlscript","vtt":"text/vtt","s":"text/x-asm","asm":"text/x-asm","c":"text/x-c","cc":"text/x-c","cxx":"text/x-c","cpp":"text/x-c","h":"text/x-c","hh":"text/x-c","dic":"text/x-c","htc":"text/x-component","f":"text/x-fortran","for":"text/x-fortran","f77":"text/x-fortran","f90":"text/x-fortran","hbs":"text/x-handlebars-template","java":"text/x-java-source","lua":"text/x-lua","mkd":"text/x-markdown","nfo":"text/x-nfo","opml":"text/x-opml","p":"text/x-pascal","pas":"text/x-pascal","pde":"text/x-processing","sass":"text/x-sass","scss":"text/x-scss","etx":"text/x-setext","sfv":"text/x-sfv","ymp":"text/x-suse-ymp","uu":"text/x-uuencode","vcs":"text/x-vcalendar","vcf":"text/x-vcard","yaml":"text/yaml","yml":"text/yaml","3gp":"video/3gpp","3g2":"video/3gpp2","h261":"video/h261","h263":"video/h263","h264":"video/h264","jpgv":"video/jpeg","jpgm":"video/jpm","mj2":"video/mj2","mjp2":"video/mj2","ts":"video/mp2t","mp4":"video/mp4","mp4v":"video/mp4","mpg4":"video/mp4","mpeg":"video/mpeg","mpg":"video/mpeg","mpe":"video/mpeg","m1v":"video/mpeg","m2v":"video/mpeg","ogv":"video/ogg","qt":"video/quicktime","mov":"video/quicktime","uvh":"video/vnd.dece.hd","uvvh":"video/vnd.dece.hd","uvm":"video/vnd.dece.mobile","uvvm":"video/vnd.dece.mobile","uvp":"video/vnd.dece.pd","uvvp":"video/vnd.dece.pd","uvs":"video/vnd.dece.sd","uvvs":"video/vnd.dece.sd","uvv":"video/vnd.dece.video","uvvv":"video/vnd.dece.video","dvb":"video/vnd.dvb.file","fvt":"video/vnd.fvt","mxu":"video/vnd.mpegurl","m4u":"video/vnd.mpegurl","pyv":"video/vnd.ms-playready.media.pyv","uvu":"video/vnd.uvvu.mp4","uvvu":"video/vnd.uvvu.mp4","viv":"video/vnd.vivo","webm":"video/webm","f4v":"video/x-f4v","fli":"video/x-fli","flv":"video/x-flv","m4v":"video/x-m4v","mkv":"video/x-matroska","mk3d":"video/x-matroska","mks":"video/x-matroska","mng":"video/x-mng","asf":"video/x-ms-asf","asx":"video/x-ms-asf","vob":"video/x-ms-vob","wm":"video/x-ms-wm","wmv":"video/x-ms-wmv","wmx":"video/x-ms-wmx","wvx":"video/x-ms-wvx","avi":"video/x-msvideo","movie":"video/x-sgi-movie","smv":"video/x-smv","ice":"x-conference/x-cooltalk"};


// modal.js

/* TODO

LATER
- [idea] mouse-hover modal?
- [idea] make right sidebar out of modal and display it fixed on screen
- [theme] dark
- [theme] nail scrollbars has-scrollbar vs !has-scrollbar vs Mac vs Windows vs Mobile vs Firefox vs webkit
*/

// new
(() => {

	function get_codemirror_theme(){
		if(_c.theme === 'dark') return 'dark';
		if(!o.codemirror_theme) o.codemirror_theme = _ls.get('files:codemirror_theme') || 'light';
		return o.codemirror_theme;
	}

	// local vars
	let nav_timer = 0, // flag toggle to avoid anims on fast navigation
			nav_timer_interval = 0, // setTimeout timer reference
			//nav_anime, // reference to navigation anime() so that it can be paused on fast nav.
			previous_active_element; // store previous active element when modal was opened

	// function to set count / used in nav() and _f.open_modal
	function set_count(){
		el.preview.dataset.counter = (o.index + 1) + '/' + _o.list.matchingItems.length;
	}

	// stop any playing <video> or <audio> / used on close and nav
	function stop_media(){
		var m = el.preview.firstElementChild;
		if(m && ['audio', 'video'].includes(o.type) && ['AUDIO', 'VIDEO'].includes(m.nodeName) && !m.paused) m.pause();
	}

	// code save
	function code_save(){

		// DIE
		// die if is already saving
		if(o.codemirror_saving || !el.code_save_button || el.code_save_button.disabled) return;
		// demo_mode
		if(_c.demo_mode) return _toast.demo();
		// license required
		if(!is_licensed) return _toast.license();
		// file is not writeable, don't even try.
		if(!o.item.is_writeable) return _toast.toggle(false, 'File is not writeable');

		// PROCEED
		o.codemirror_saving = true;
		// disable button from further clicking
		el.code_save_button.disabled = true;
		// toast loader (saving)
		var toast_loader = _toast.loader(lang.get('save') + ' ' + html_tags(o.item.basename));
		// pre-assign save_dir for this item, in case it changes before load, so that we can clear cache.
		var save_dir = _c.current_dir
		// assign item var in case item changes
		var item = o.item;

		// ajax text_Edit
		ajax_get({
			params: 'action=fm&task=text_edit&path=' + o.item.path + '&text=' + encodeURIComponent(o.codemirror.getValue()),
			json_response: true,
			always: () => {
				toast_loader.hideToast(); // always hide the toast_loader for this instance
				if(item !== o.item) return; // only assign modal states below if item is current item
				o.codemirror_saving = false; // !codemirror_saving
				el.code_save_button.disabled = false; // re-enable button
			},
			fail: () => {
				_toast.toggle(false, error || lang.get('save') + '&nbsp;' + html_tags(item.basename));
			},
			complete: (r) => {
				_toast.toggle(!!r.success, lang.get('save') + '&nbsp;' + html_tags(item.basename));
				// success only:
				if(!r.success) return;
				_ls.remove(get_ls_key(save_dir.path, save_dir.path.mtime)); // remove localStorage for dir
				delete save_dir.files; // remove JS
				delete save_dir.html; // remove html
			}
		});
	}

	// common function for modal history, used on open and change (not close, because it needs to be back() or replace with dir)
	function modal_history(method, basename){
		if(!_c.history) return; // fukkit
		history[method + 'State'](null, o.item.basename, '#' + encodeURIComponent(o.item.basename));
	}

	// animate SVG children on change.show and open (not when hiding)
	function svg_anim(delay){
		anime({
			targets: el.preview.querySelector('svg').children, // definitely looks cooler when reversed
			//translateY: [-2, 0],
			scale: [.9,1], // requires transform-origin: center
			opacity: [0, 1],
			duration: 120,
			easing: 'easeOutQuad',
			delay: anime.stagger(30, { start: delay, direction: 'reverse' })
		});
	}

	// get index on nav and get titles for nav
	const get_index = (dir) => {
		let length = _o.list.matchingItems.length;
		let index = o.index + dir; // add direction
		if(index < 0) return length - 1; // loop to last item
		if(index >= length) return 0; // loop to first item
		return index;
	}

	// modal navigation
	function nav(dir){

		// matchingItems shortcut
		var mi = _o.list.matchingItems;
		// die! (just in case)
		if(mi.length < 2) return;

		// assign new index
		o.index = get_index(dir);

		// set count and animate with modal-count-show, which is removed in make_item()
		set_count();
		el.preview.classList.add('modal-count-show');

		// // stop anim and open immediately if nav_timer is on / for effective browsing
		if(nav_timer) clearTimeout(nav_timer_interval); // always clear current nav_timer_interval
		nav_timer_interval = setTimeout(() => nav_timer = 0, 500); //nav_anim_duration * 2); // start new timer

		if(nav_timer) return change_item(mi[o.index]._values);
		nav_timer = 1;

		// stop any playing <video> or <audio> / only required if anim, else media gets removed instantaneously anyway
		stop_media();

		// change item then animate svg icon
		change_item(mi[o.index]._values);
		if(['file', 'dir'].includes(o.type)) svg_anim(0); // stagger=30, delay=0 on nav
	}

	// abort codemirror_xhr / used on change and close
	function abort_codemirror_xhr(){
		if(!o.codemirror_xhr) return; // make sure codemirror_xhr is set
		o.codemirror_xhr.abort(); // abort load
		o.codemirror_xhr = false; // remove reference
	}

	// checks if some other event (POPUP) has assigned history on top of modal. Used for popstate and keyboard(ESC).
	function is_current_history(){
		return location.hash === '#' + encodeURIComponent(o.item.basename);
	}

	// toggle_classes open/close
	function toggle_classes(bool){
		document.documentElement.classList.toggle('modal-open', !!bool); // add modal-open <html> class
		el.modal.classList.toggle('modal-show', !!bool); // add modal-show <div> class
	}

	// toggle code fullscreen
	function code_fullscreen(){
		el.popup.classList.toggle('modal-popup-fullscreen');
		if(o.codemirror) o.codemirror.refresh();
	}

	// get code mode for CodeMirror
	function get_code_mode(item){

		// early exit
		if(!item || item.filesize > _c.code_max_load) return;

		// htaccess override nginx
		if(item.ext && item.ext === 'htaccess') return CodeMirror.findModeByName('nginx');
		if(item.ext && item.ext === 'csv') return CodeMirror.findModeByName('Spreadsheet');

		// get from mime or ext
		var mode = item.mime ? CodeMirror.findModeByMIME(item.mime) : false; // mime
		if((!mode || mode.mode === 'null') && item.ext) mode = CodeMirror.findModeByExtension(item.ext) || mode; // ext

		// return
		return mode;
	}

	// modal positions // Only works for mouse + large screens
	var positions = ['start-start', 'center-start', 'end-start', 'start-center', 'center-center', 'end-center', 'start-end', 'center-end', 'end-end'];
	// default position, get from localStorage
	var position = (() => {
		var ls = _ls.get('files:modal:position');
		return ls && positions.includes(ls) ? ls : 'center-center';
	})();
	// get position x,y classes
	function pos_classes(p, toggle){
		var positions = (p || position).split('-'); // get from parameter or current position
		var class_names = ['x', 'y'].map((direction, i) => `modal-pos-${ direction }-${ positions[i] }`);
		if(toggle) return el.popup.classList[toggle](...class_names); // assign classes immediately and return
		return class_names.join(' '); // return classes to be assigned into string
	}
	// function to toggle position from button
	function modal_position(pos, clicked){
		if(pos === position) return; // close if position did not change
		pos_classes(position, 'remove');
		pos_classes(pos, 'add');
		position = pos; // update position flag
		el.pos_active.classList.remove('modal-pos-active'); // remove current active
		el.pos_active = clicked; // update active
		el.pos_active.classList.add('modal-pos-active'); // new active class
		_ls.set('files:modal:position', pos); // localStorage new pos
	}

	// prepare modal object with o shortcut
	const o = _o.modal = {};

	// inject modal
	document.body.insertAdjacentHTML('beforeend', `
	<div class="modal" data-action="close-bg" style="display:none;">
		<div class="modal-popup">
			<div class="modal-header">
				<h2 class="modal-title"></h2>
				${_c.allow_text_edit ? `<button type="button" class="button-icon modal-code-button" data-action="save" data-tooltip="${lang.get('save')}">${_f.get_svg_icon('save_edit')}</button>` : ''}
				<button type="button" class="button-icon modal-code-button" data-action="copy" data-tooltip="${lang.get('copy text')}">${_f.get_svg_icon('clipboard')}</button>
				<button type="button" class="button-icon modal-code-button" data-action="toggle-codemirror-theme">${_f.get_svg_icon_multi('theme_light', 'theme_dark')}</button>
				<button type="button" class="button-icon modal-code-button" data-action="fullscreen">${_f.get_svg_icon_multi('expand', 'collapse')}</button>
				${ get_context_button(true) }
				<span class="modal-pos">${ str_looper(positions, (pos) => {
					return '<span class="modal-pos-el' + (pos === position ? ' modal-pos-active' : '') + '" data-action="' + pos + '"></span>';
				})}</span>
				<button type="button" class="button-icon" data-action="close">${ _f.get_svg_icon('close_thin') }</button>
			</div>
			<button class="button-icon modal-nav-left" data-action="nav-left">${_f.get_svg_icon('arrow_left')}</button>
			<button class="button-icon modal-nav-right" data-action="nav-right">${_f.get_svg_icon('arrow_right')}</button>
			<div class="modal-preview" id="modal_preview"></div>
			<div class="modal-info"></div>
		</div>
	</div>`);

	//
	const el = o.el = { modal: document.body.lastElementChild };
	el.popup = el.modal.firstElementChild;
	el.header = el.popup.firstElementChild;
	el.ArrowLeft = el.popup.children[1]; // named so matches e.key
	el.ArrowRight = el.popup.children[2]; // named so matches e.key
	el.title = el.header.firstElementChild;
	el.code_save_button = _c.allow_text_edit ? el.header.children[2] : false;
	el.close = el.header.lastElementChild;
	el.preview = el.popup.children[3];
	el.info = el.popup.lastElementChild;
	el.pos_active = _class('modal-pos-active', el.header)[0];

	// block touch/tap on preview <a> links, because they may be tapped accidentally, and open new window
	if(tests.is_touch) _event(el.preview, (e) => {
		if(e.pointerType === 'mouse') return; // always allow mouse
		var a = e.target.closest('.modal-preview-a'); // get <a>
		if(a && !a.dataset.action) e.preventDefault(); // block if <a> and !a.action assigned (means it's normal non-action link)
	});

	// on click bg, use o.bgdown and o.bgup to make sure mousedown and mouseup targets are el.modal / prevent drag in/out closing
	['down', 'up'].forEach((d) => el.modal.addEventListener('mouse' + d, (e) => o['bg' + d] = e.target === el.modal));

	// actions on click in modal
	actions(el.modal, (action, e) => {

		// die if modal is closed or is closing (just in case)
		if(!o.open) return e.preventDefault();

		// navigation button
		if(action === 'nav-left') {
			nav(-1);

		} else if(action === 'nav-right'){
			nav(1);

		// context menu // e, item, el, type
		} else if(action === 'context'){
			_f.create_contextmenu(e, 'modal', e.target, o.item);

		// on click background, make sure mousedown and mouseup targets are el.modal / prevent drag in/out closing
		} else if(action === 'close-bg'){
			if(o.bgdown && o.bgup) _f.close_modal();

		// close button
		} else if(action === 'close'){
			_f.close_modal();

		// image zoom / could be from <a> or <img> inside <a>
		} else if(action === 'zoom') {
			// prevent open popup if modal contextmenu, because user might click popup to close contextmenu
			if(_o.contextmenu.is_open) return e.preventDefault();
			// allows keys to open in new tab, new window, download
			if(allow_href(e, e.target.closest('.modal-preview-a'))) return;
			// open popup
			_f.open_popup(o.item);

		// code copy
		} else if(action === 'copy'){
			var copy_text = o.codemirror ? o.codemirror.getValue() : false,
					success = copy_text && clipboard_copy(copy_text);
			/*if(o.copy_toast && o.copy_toast.toastElement && document.body.contains(o.copy_toast.toastElement)) o.copy_toast.hideToast();
			o.copy_toast = */_toast.toggle(success, lang.get('copy text'), 'blarrgh');

		// code fullscreen
		} else if(action === 'fullscreen'){
			code_fullscreen();

		// code save
		} else if(action === 'save'){
			code_save();

		// codeMirror theme / light skins only, because nobody wants light codemirror background in dark theme
		} else if(action === 'toggle-codemirror-theme'){

			// get codemirror wrapper element / will only exist if codeMirror is loaded and displaying
			let cm = o.codemirror && o.codemirror.display ? o.codemirror.display.wrapper : false;
			if(!cm) return; // die, just in case

			// update var and replace classes for codeMirror element and el.popup (button svg and background)
			let current = o.codemirror_theme;
			o.codemirror_theme = current === 'light' ? 'dark' : 'light';
			cm.classList.replace('cm-s-one-' + current, 'cm-s-one-' + o.codemirror_theme);
			el.popup.classList.replace('modal-codemirror-theme-' + current, 'modal-codemirror-theme-' + o.codemirror_theme);
			// localStorage
			_ls.set('files:codemirror_theme', o.codemirror_theme);

		// modal position element click
		} else if(e.target.classList.contains('modal-pos-el')) {
			modal_position(action, e.target);
		}
	});

	// change_item / on modal_nav()
	function change_item(item){

		// abort any current codemirror_xhr
		abort_codemirror_xhr();

		// make new item (replace current with updated item from moda_nav())
		make_item(item);

		// replace current #item in history (must come after above when o.item is generated)
		modal_history('replace');
	}

	// make_item / triggers on open_modal() and change_item()
	function make_item(item){

		// always scroll modal to top if was scrolled
		el.modal.scrollTop = 0;

		// remove code buttons if previously displaying
		if(o.codemirror) el.header.classList.remove('modal-header-code');
		// make sure code_save_button is not disabled for new item
		if(el.code_save_button && el.code_save_button.disabled) el.code_save_button.disabled = false;

		// modal object assign new item and reset some props
		Object.assign(o, {
			item: item, // item props
			codemirror: false, // codemirror reference empty on new item
			codemirror_xhr: false, // codemirror_xhr reference empty on new item
			codemirror_saving: false, //
			type: item.is_dir ? 'dir' : 'file', // type default (re-assigned if file)
		});

		// TITLE
		el.title.innerText = el.title.title = item.display_name || item.basename || '';

		// PREVIEW
		var preview; // preview html var

		// !directory check for type
		if(!item.is_dir && item.is_readable){

			// <img>
			if(item.browser_image){
				o.type = 'image';
				// width/height only if orientation
				preview = '<img data-action="zoom" src="' + file_path(item) +'" class="modal-image files-img-placeholder' + (item.ext == 'ico' ? ' modal-image-ico' : '') + '"' + (item.dimensions && ((_c.server_exif || !tests.image_orientation) && (tests.image_orientation || !is_exif_oriented(item.image))) ? ' width="' + item.dimensions[0] + '" height="' + item.dimensions[1] + '" style="--ratio:' + item.ratio + '"' : '') + '></img>';

			// <video>
			} else if(item.is_browser_video){
				o.type = 'video';
				preview = '<video src="' + file_path(item) + '" type="' + item.mime + '" class="modal-video" controls playsinline disablepictureinpicture controlslist="nodownload"' + (_c.video_autoplay ? ' autoplay' : '') + '></video>';

			// ffmpeg image (if !is_browser_video)
			} else if(_c.video_thumbs_enabled && item.mime0 === 'video' && item.is_readable){
				o.type = 'video-thumb';
				preview = '<img src="' + _c.script + '?file=' + encodeURIComponent(item.path) + '&resize=video&' + _c.image_cache_hash + '.' + item.mtime + '.' + item.filesize +'" class="modal-image modal-image-video files-img-placeholder" width="' + item.preview_dimensions[0] + '" height="' + item.preview_dimensions[1] + '" style="--ratio:' + item.preview_ratio + '"></img>';

			// <audio>
			// is_browser_media() because not yet detected
			} else if(is_browser_media('audio', item)){
				o.type = 'audio';
				preview = '<audio src="' + file_path(item) + '" type="' + item.mime + '" class="modal-audio" controls playsinline controlslist="nodownload"></audio>';
				//preview = `<vm-player theme="light"><vm-audio><source src="${ file_path(item) }" type="audio/mp3" /></vm-audio><vm-default-ui no-settings></vm-default-ui></vm-player>`;

			// embed youtube or video
			} else if(item.embed) {
				o.type = 'embed'; // this isn't actually used
				// width="560" height="315" from default Youtube embed, although it gets overridden in CSS. Vimeo width="640" height="360"
				preview = '<iframe class="modal-embed" width="560" height="315" src="' + item.embed + '" frameborder="0" allow="accelerometer; fullscreen; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe><div class="modal-preview-spinner"></div>';

			// code?
			} else {

				// get item.code_mode (if not set)
				if(!item.hasOwnProperty('code_mode')) {
					var cmob = get_code_mode(item);
					item.code_mode = cmob ? (cmob.mode || false) : false;
				}

				// do codemirror!
				if(item.code_mode) {
					o.type = 'code';
					_f.load_plugin('codemirror'); // start loading codemirror if not loaded
					// only add spinner / we don't really need SVG as it will vanish fast
					preview = '<div class="modal-preview-spinner"></div>';
				}
			}
		}

		// add default preview + dir preview image (if is_dir)
		if(!preview) preview = _f.get_svg_large(item, 'modal-svg') + get_folder_preview(item);

		// change popup class (if type changes) / must come after o.type is resolved
		set_classname(el.popup, `modal-popup modal-popup-${ o.type } modal-${ o.has_nav ? 'multi' : 'single' } ${ pos_classes() } modal-codemirror-theme-${ get_codemirror_theme() }`);
		// modal-popup modal-popup-code modal-multi modal-pos-x-center modal-pos-y-center
		// modal-codemirror-theme-dark / 1. toggle button, 2. assign preview .modal-preview-code dark BG (if !dark parent already)

		// assign titles on nav buttons
		if(tests.is_pointer && o.has_nav) {
			el.ArrowLeft.title = _o.list.matchingItems[get_index(-1)]._values.basename;
			el.ArrowRight.title = _o.list.matchingItems[get_index(1)]._values.basename;
		}

		// set type color var
		//el.popup.style.setProperty('--type-color', 'var(--type-' + (_f.get_icon(item) || 'default') + ')');
		// get hsl
		//    --type-color: var(--svg-folder-fg);
		let type_var = item.is_dir ? '--svg-folder-fg' : `--type-${ _f.get_icon(item) || 'default' }`;
		let type_color = CSS.supports('background-color', 'hsl(50 50% 50% / 50%)') ? getComputedStyle(document.documentElement).getPropertyValue(type_var) : false;
		el.popup.style = `--type-color:var(${ type_var })${ type_color && type_color.indexOf('hsl(') === 0 ? ';--type-color-hsl:' + type_color.split(')')[0].split('(')[1].split(',').join('') : BBB }`;

		// change preview class (if type changes) / must come after o.type is resolved
		set_classname(el.preview, 'modal-preview modal-preview-' + o.type);

		// insert preview / wrapped in <a> if image||file or dir&&url_path (NOT video||audio||code)
		el.preview.innerHTML = ['image', 'file'].includes(o.type) || (o.type === 'dir' && item.url_path) ? `<a href="${ get_href(item) }" class="modal-preview-a" target="_blank"${ item.browser_image ? ' data-action="zoom"' : '' } title="${ lang.get(item.browser_image ? 'zoom' : 'open in new tab') }" tabindex="-1">${ preview }</a>` : preview;

		// remove img_placeholder background (needs to be done for svg/png/gif or transparent images)
		// use _class because we don't really know where the element is under el.preview
		if(['image', 'video-thumb'].includes(o.type)) _class('files-img-placeholder', el.preview)[0].addEventListener('load', (e) => e.target.classList.remove('files-img-placeholder'));

		// embed (Youtube and Vimeo) detect iframe loaded
		if(item.embed) el.preview.firstElementChild.addEventListener('load', () => {
			el.preview.lastElementChild.remove();
		}, true);

		// CODEMIRROR
		// load file with reference to codemirror_xhr so we can abort
		if(item.code_mode) o.codemirror_xhr = ajax_get({
			params: 'action=file&file=' + encodeURIComponent(item.path),
			always: () => {
				if(!o.open || item !== o.item) return;
				// remove o.codemirror_xhr ref, always
				o.codemirror_xhr = false;
			},
			fail: (xhr) => {
				if(!xhr.status || !o.open || item !== o.item) return; // die if aborted or closed or not current item
				_toast.toggle(false, (xhr.status ? xhr.status + ' - ' : '') + (xhr.statusText || item.basename));
				// remove spinner / this is only element inside el.preview until codemirror added
				el.preview.firstElementChild.remove();
			},
			complete: (content) => {

				// die if !open or different modal, should already be handled by .abort() on change/close, but just in case!
				if(!o.open || item !== o.item) return;

				// load codemirror, although probably loaded already
				_f.load_plugin('codemirror', () => {

					// die if !open or different modal (same abort as above, just in case)
					if(!o.open || item !== o.item) return;

					// remove spinner / this is only element inside el.preview until codemirror added
					el.preview.firstElementChild.remove();

					// prepare theme / always dark if dark theme (button is hidden)
					/*let theme = `one-${ _c.theme === 'dark' ? 'dark' : (() => {
						// assign o.codemirror_theme from localStorage if not yet assigned
						if(!o.codemirror_theme) o.codemirror_theme = _ls.get('files:codemirror_theme') || 'light';
						return o.codemirror_theme;
					})() }`;*/

					// display code buttons
					el.header.classList.add('modal-header-code');

					// initiate and store CodeMirror
					o.codemirror = CodeMirror(el.preview, {
						value: content,
						lineWrapping: true,
						lineNumbers: true,
						readOnly: !_c.allow_text_edit,
						mode: item.code_mode,
						viewportMargin: Infinity,
						//theme: theme,
						theme: 'one-' + get_codemirror_theme(), // cm-s-light // cm-s-one-light
						addModeClass: item.code_mode === 'css', // only add mode class .cm-m-css for CSS (see codemirror.scss)
						styleActiveLine: true,
						extraKeys: Object.assign({
							'F11': code_fullscreen,
							//'Esc': code_fullscreen // moved to own keyup events, because Escape is used for modal
						}, _c.allow_text_edit ? {
							'Ctrl-S': code_save,
							'Cmd-S': code_save
						} : {})
					});

					// load code mode
					CodeMirror.autoLoadMode(o.codemirror, item.code_mode);
				});
			}
		});

		// add info
		el.info.innerHTML = `
			<div class="modal-info-name">
				${ item.url ? '<a href="' + get_href(item) + '" target="_blank">' : '' }\
				${ html_tags(item.display_name || item.basename) }
				${ item.url ? '</a>' : '' }
			</div>\
			<div class="modal-info-meta">
				${ item.mime ? '<span class="modal-info-mime" title="' + item.mime + '">' + _f.get_svg_icon_files(item) + get_span(item.mime, 'modal-info-mime-text') + '</span>' : '' }${ get_dimensions(item.dimensions, 'modal-info-dimensions') }${ get_filesize(item, 'modal-info-filesize') }${ get_permissions(item, 'modal-info-permissions') }
			</div>
			<div class="modal-info-date">${ _f.get_svg_icon('date') }${ _f.get_time(item, 'llll', 'LLLL', true) }</div>
			${ get_exif(item.image, 'modal-info-exif') }
			${ get_iptc(item.image, 'modal-info', true, false)}
		`;
	}

	// open_modal
	_f.open_modal = (item, push) => {

		// if already open (for example keybaord tab nav), nav to new item if item changes, or die if item is the same
		if(o.open) return o.item !== item ? nav(_o.list.matchingItems.findIndex((i) => i._values === item) - o.index) : false;

		// open
		o.open = true;

		// store previous active element before open modal and focus change
		previous_active_element = document.activeElement || null;

		// remove any transitionend listener initiated by close function / in case we re-open fast
		el.popup.removeEventListener('transitionend', destroy);

		// bind popstate and keyup listener events
		modal_events(true);

		// set scrollbar width before we hide the scrollbar with overflow:hidden
		set_scrollbar_width();

		// assign initial index on open (used for nav and display current nav location x/X)
		o.index = _o.list.matchingItems.findIndex((i) => i._values === item);
		// has_nav if index found (could be item in left menu unrelated to matchingItems) and matchingItems.length > 1
		o.has_nav = o.index > -1 && _o.list.matchingItems.length > 1;
		// set count, because might be used on mouse hover
		set_count();

		// make modal item (pointless to not re-make, even if item did not change ... need to deal with destroyed preview and classes)
		make_item(item);

		// history push (push is false if opened from url)
		if(push) modal_history('push');

		// unhide (defaults to CSS display: grid)
		el.modal.style.removeProperty('display');

		// clear focus on clicked activeElement so that ENTER key does not re-trigger the element after modal navigation
		// run after transitionEnd, so we can keep transition out on list files-a:focus element
		if(document.activeElement) el.popup.addEventListener('transitionend', () => document.activeElement.blur(), { once: true });
		//el.popup.addEventListener('transitionend', () => el.close.focus(), { once: true }); // NO because this is kinda ugly

		// 1ms timeout so that transiton works with display
		wait(1).then(() => {

			// cool SVG effect (only dir and files) / stagger=40 delay=80 to give time for modal to start showing before anim starts
			if(['file', 'dir'].includes(o.type)) svg_anim(0);

			// add modal classes to show and animate, AFTER everything was added
			toggle_classes(true);
		});
	}

	// destroy modal after transitionend
	function destroy(e){
		// make sure is transition for el.popup only and not child elements
		if(e && e.target !== el.popup) return; // die
		el.popup.removeEventListener('transitionend', destroy);
		// just in case it was re-opened
		if(o.open) return; // die
		el.modal.style.display = 'none'; // display none, because we don't want it floating around with just visibility: hidden;
		// empty preview on close, to save memory and because video/audio may be playing. Pointless to keep SVG's also
		empty(el.preview);
	}

	// close_modal
	_f.close_modal = (hist = true) => {

		// die if already closed
		if(!o.open) return;
		o.open = false;

		// stop any playing <video> or <audio> before closing
		stop_media();

		// abort codemirror_xhr
		abort_codemirror_xhr();

		// remove eventListeners
		modal_events(false);

		// run destroy after transitonend (toggle_classes)
		el.popup.addEventListener('transitionend', destroy);

		// remove modal classes
		toggle_classes();

		// focus previous_active_element / should probably happen after modal_events(false)
		if(previous_active_element && previous_active_element.isConnected) previous_active_element.focus();

		// history / dir if !_c.history or !hist (hist = false on popstate obviously)
		if(!_c.history || !hist) return;
		// !state = was pushed open / just go back()
		if(!history.state) return history.back();
		// replaceState() if was initially opened with #hash (history.state)
		return history.replaceState({ path: _c.current_path }, _c.current_dir.basename || '/',  location.pathname + location.search);
	}

	// popstate function for popstate eventListener / execute only if !is_current_history(), eg. not coming back from popup
	function popstate(){
		if(o.open && !is_current_history()) _f.close_modal(false);
	}

	// block key event if !open || Swal open || !is_current_history() (popup or something else overlaying modal)
	function block_key_events(){
		return !o.open || Swal.isVisible() || !is_current_history();
	}

	// allow key arrow nav only if items > 1 && Arrow key && !focus on audio, video or textarea (codemirror)
	function valid_arrow_key(key){
		return _o.list.matchingItems.length > 1 && ['ArrowLeft', 'ArrowRight'].includes(key) && (!document.activeElement || !['AUDIO', 'VIDEO', 'TEXTAREA'].includes(document.activeElement.nodeName));
	}

	// keydown function for keydown eventListener
	function keydown(e){
		// block on e.repeat and block_key_events()
		if(e.repeat || block_key_events()) return;

		// Escape
		if(e.key === 'Escape') {
			// in code mode, toggle fullscreen if codemirror focus, or close fullscreen if already fullscreen
			if(o.type === 'code' && (document.activeElement.nodeName === 'TEXTAREA' || el.popup.classList.contains('modal-popup-fullscreen'))) return code_fullscreen();
			_f.close_modal(); // close modal

		// Enter close (if !focus on element inside modal)
		} else if(e.key === 'Enter' && !el.popup.contains(document.activeElement)){
			_f.close_modal(); // close modal

		// Arrow nav
		} else if(valid_arrow_key(e.key)){

			// add modal-nav-active class to button / removed on keyup
			el[e.key].classList.add('modal-nav-active');

			// navigate direction
			nav(e.key === 'ArrowLeft' ? -1 : 1);

			// show counter after nav() (must be after, because preview gets recreated) / removed on keyup
			el.preview.classList.add('modal-count-show');
		}
	}

	// keyup function for keyup eventListener
	function keyup(e){

		// block
		if(block_key_events() || !valid_arrow_key(e.key)) return;

		// remove classes applied to arrows keys and preview on keydown
		el[e.key].classList.remove('modal-nav-active');
		el.preview.classList.remove('modal-count-show');
	}

	// focus trap
	function focus(e){
		if(block_key_events() || el.popup.contains(e.target)) return;
		// backwards shift+tab focus arrow right / NOPE, cuz it focuses arrow as first item (we want close)
		//if(e.relatedTarget) return el.ArrowRight.focus();
		// focus on first visible element in header
		Array.from(el.header.children).find(el => el.nodeName == 'BUTTON' && el.offsetParent).focus();
	}

	// toggle modal event listeners
	function modal_events(add){
		var toggle = (add ? 'add' : 'remove') + 'EventListener';
		window[toggle]('popstate', popstate);
		document[toggle]('keydown', keydown);
		document[toggle]('keyup', keyup);
		document.body[toggle]('focus', focus, { capture: true });
	}
})();



// photoswipe-ui-default.custom.js
// https://github.com/andi34/PhotoSwipe/ 21.Sep 2020

//
var PhotoSwipeUI_Default = function(pswp, framework) {
	var ui = this;
	var _overlayUIUpdated = false,
		_controlsVisible = true,
		_stopAllAnimations,
		_controls,
		_captionContainer,
		_fakeCaptionContainer,
		_indexIndicator,
		_prevButton,
		_nextButton,
		_fullscreenButton,
		//_shareButton,
		//_shareModal,
		//_shareModalHidden = true,
		//_shareModalUpdated,
		_downloadButton,
		_mapButton,
		_initalCloseOnScrollValue,
		_isIdle,
		_listen,
		_loadingIndicator,
		_loadingIndicatorHidden,
		_loadingIndicatorTimeout,
		_galleryHasOneSlide,
		_options,
		_defaultUIOptions = {
			//barsSize: { top: 0, bottom: 0 }, // { top: 44, bottom: 'auto' }, // { top:0, bottom: 'auto'},
			//closeElClasses: ['item', 'caption', 'zoom-wrap', 'ui', 'top-bar'],
			//closeElClasses: ['item', 'zoom-wrap', 'ui'],
			timeToIdle: 3000,
			timeToIdleOutside: 1000,
			loadingIndicatorDelay: 1000,
			addCaptionHTMLFn: function(item, captionEl /*, isFake */ ) {
				return item.title ? (captionEl.firstElementChild.innerHTML = item.title) : framework.resetEl(captionEl.firstElementChild);
			},
			closeEl: true,
			captionEl: true,
			fullscreenEl: tests.fullscreen,
			zoomEl: true,
			//shareEl: false, // not feasible
			downloadEl: false,
			mapEl: true,
			playEl: true,
			panoRotateEl: true,
			counterEl: true,
			arrowEl: true,
			preloaderEl: true,
			closeOnOutsideClick: true,
			tapToClose: false,
			clickToCloseNonZoomable: false,
			clickToShowNextNonZoomable: false,
			indexIndicatorSep: '<span class="popup-counter-separator">/</span>',
			fitControlsWidth: 1200
		},
		_blockControlsTap,
		_blockControlsTapTimeout;

	var _onControlsTap = function(e) {
			if (_blockControlsTap) return true;
			e = e || window.event;

			if (_options.timeToIdle && _options.mouseUsed && !_isIdle) {
				// reset idle timer
				_onIdleMouseMove();
			}

			var target = e.target || e.srcElement,
				uiElement,
				found;

			for (var i = 0; i < _uiElements.length; i++) {
				uiElement = _uiElements[i];
				if (uiElement.onTap && target.classList.contains('pswp__' + uiElement.name)) {
					uiElement.onTap();
					found = true;
				}
			}

			if (found) {
				e.stopPropagation();
				_blockControlsTap = true;
				_blockControlsTapTimeout = setTimeout(function() {
					_blockControlsTap = false;
				}, 30);
			}
		},
		_idle_toggle = function(e){
			if(e.keyCode !== 32) return;
			if(tests.is_dual_input) ui.toggleControls(false); // always remove 'ui--hidden' if touch
			ui.setIdle(!_isIdle);
		},
		_fitControlsInViewport = function() {
			return !pswp.likelyTouchDevice || _options.mouseUsed || screen.width > _options.fitControlsWidth;
		},
		_togglePswpClass = function(el, cName, add) {
			el.classList[(add ? 'add' : 'remove')]('pswp__' + cName);
		},
		// add class when there is just one item in the gallery
		// (by default it hides left/right arrows and 1ofX counter)
		_countNumItems = function() {
			var hasOneSlide = _options.getNumItemsFn() === 1;
			if (hasOneSlide !== _galleryHasOneSlide) {
				_togglePswpClass(_controls, 'ui--one-slide', hasOneSlide);
				_galleryHasOneSlide = hasOneSlide;
			}
		},
		//_downloadFile = function(e) {
			//_downloadButton.setAttribute('href', pswp.currItem.original || pswp.currItem.src || '#');
			/*
			var link = document.createElement('A');
			link.setAttribute('href', pswp.currItem.downloadURL || pswp.currItem.src || '');
			link.setAttribute('target', '_blank');
			link.setAttribute('download', '');
			_downloadButton.appendChild(link);
			link.click();
			_downloadButton.removeChild(link);
			*/
		//},
		/*_toggleShareModal = function() {
			_shareModalHidden = !_shareModalHidden;
			if(!_shareModalHidden) _o.popup.toggle_play(false);
			framework.toggle_class(_shareModal, 'pswp__share-modal--hidden', _shareModalHidden);
			if (!_shareModalHidden) _updateShareURLs();
			return false;
		},*/
		/*_openWindowPopup = function(e) {
			var target = e.target;
			if(!target.href) return false;
			// ignore download and mailto
			if(target.hasAttribute('download') || target.href.indexOf('mailto') == 0) return true;
			e.preventDefault();
			// open popup
			_f.popupwin(e.target.href, 'pswp_share', 550, 420);
			// hide modal
			if(!_shareModalHidden) _toggleShareModal();
			return false;
		},*/
		/*_updateShareURLs = function() {

			// return if _shareModalUpdated already
			var item = pswp.currItem;
			if(_shareModalUpdated == item.src) return;
			_shareModalUpdated = item.src;

			// vars
			var child = _shareModal.firstElementChild,
					image_url = item.src,
					page_url = encodeURIComponent(tests.website + item.page + location.hash),
					text = encodeURIComponent(item.title || ''),
					description = encodeURIComponent(item.description || item.title_name || ''),
					file_name = encodeURIComponent(item.file_name || ''),
					file_name_ext = encodeURIComponent(item.file_name_ext || ''),
					path = encodeURIComponent(x3_settings.path + x3_settings.file_path + '/');

			// loop links change href
			_options.share_urls.forEach(function(url, i) {
				child.children[i].setAttribute('href', url.replace('{{url}}', page_url)
					.replace('{{image_url}}', encodeURIComponent(image_url))
					.replace('{{raw_image_url}}', image_url)
					.replace('{{text}}', text)
					.replace('{{description}}', description)
					.replace('{{file_name}}', file_name)
					.replace('{{file_name_ext}}', file_name_ext)
					.replace('{{path}}', path));
			});
		},*/
		_idleInterval,
		_idleTimer,
		_idleIncrement = 0,
		_onIdleMouseMove = function() {
			clearTimeout(_idleTimer);
			_idleIncrement = 0;
			if (_isIdle) ui.setIdle(false);
		},
		_onMouseLeaveWindow = function(e) {
			e = e ? e : window.event;
			var from = e.relatedTarget || e.toElement;
			if (!from || from.nodeName === 'HTML') {
				clearTimeout(_idleTimer);
				_idleTimer = setTimeout(function() {
					ui.setIdle(true);
				}, _options.timeToIdleOutside);
			}
		},
		_setupLoadingIndicator = function() {
			// Setup loading indicator
			if (_options.preloaderEl) {
				_toggleLoadingIndicator(true);

				_listen('beforeChange', function() {
					clearTimeout(_loadingIndicatorTimeout);

					// display loading indicator with delay
					_loadingIndicatorTimeout = setTimeout(function() {
						if (pswp.currItem && pswp.currItem.loading) {
							if (pswp.currItem.img && !pswp.currItem.img.naturalWidth) {
								// show preloader if progressive loading is not enabled,
								// or image width is not defined yet (because of slow connection)
								_toggleLoadingIndicator(false);
								// items-controller.js function allowProgressiveImg
							}
						} else {
							_toggleLoadingIndicator(true); // hide preloader
						}
					}, _options.loadingIndicatorDelay);
				});
				_listen('imageLoadComplete', function(index, item) {
					if (pswp.currItem === item) _toggleLoadingIndicator(true);
				});
			}
		},
		_toggleLoadingIndicator = function(hide) {
			if (_loadingIndicatorHidden !== hide) {
				framework.toggle_class(_loadingIndicator, 'pswp__spinner', !hide);
				_loadingIndicatorHidden = hide;
			}
		},
		/*_applyNavBarGaps = function(item) {
			var gap = item.vGap;
			var bars = _options.barsSize;

			if (_fitControlsInViewport()) {
				if (_options.captionEl && bars.bottom === 'auto') {
					if (!_fakeCaptionContainer) {
						_fakeCaptionContainer = framework.createEl('pswp__caption pswp__caption--fake');
						_fakeCaptionContainer.appendChild(framework.createEl('pswp__caption__center'));
						_controls.insertBefore(_fakeCaptionContainer, _captionContainer);
						_controls.classList.add('pswp__ui--fit');
					}
					if (_options.addCaptionHTMLFn(item, _fakeCaptionContainer, true)) {
						var captionSize = _fakeCaptionContainer.clientHeight;
						gap.bottom = parseInt(captionSize, 10) || 44;
					} else {
						gap.bottom = bars.top; // if no caption, set size of bottom gap to size of top
					}
				} else {
					gap.bottom = bars.bottom === 'auto' ? 0 : bars.bottom;
				}

				// height of top bar is static, no need to calculate it
				gap.top = bars.top;
			} else {
				gap.top = gap.bottom = 0;
			}
		},*/
		_setupIdle = function() {
			// Hide controls when mouse is used
			if (_options.timeToIdle) {
				_listen('mouseUsed', function() {
					framework.bind(document, 'mousemove', _onIdleMouseMove);
					framework.bind(document, 'mouseout', _onMouseLeaveWindow);

					_idleInterval = setInterval(function() {
						_idleIncrement++;
						if (_idleIncrement === 2) {
							ui.setIdle(true);
						}
					}, _options.timeToIdle / 2);
				});
			}
		},
		_setupHidingControlsDuringGestures = function() {
			// Hide controls on vertical drag
			_listen('onVerticalDrag', function(now) {
				if (_controlsVisible && now < 0.95) {
					ui.toggleControls();
				} else if (!_controlsVisible && now >= 0.95) {
					ui.toggleControls(true);
				}
			});

			// Hide controls when pinching to close
			var pinchControlsHidden;
			_listen('onPinchClose', function(now) {
				if (_controlsVisible && now < 0.9) {
					ui.toggleControls();
					pinchControlsHidden = true;
				} else if (pinchControlsHidden && !_controlsVisible && now > 0.9) {
					ui.toggleControls(true);
				}
			});

			_listen('zoomGestureEnded', function() {
				pinchControlsHidden = false;
				if (pinchControlsHidden && !_controlsVisible) ui.toggleControls(true);
			});
		};

	var _uiElements = [{
			name: 'caption',
			option: 'captionEl',
			onInit: function(el) {
				_captionContainer = el;
			}
		},
		/*{
			name: 'share-modal',
			option: 'shareEl',
			onInit: function(el) {
				_shareModal = el;
				el.firstElementChild.onclick = _openWindowPopup;
			},
			onTap: function() {
				_toggleShareModal();
			}
		},*/
		/*{
			name: 'button--share',
			option: 'shareEl',
			onInit: function(el) {
				_shareButton = el;
			},
			onTap: function() {
				_toggleShareModal();
			}
		},*/
		{
			name: 'button--download',
			option: 'downloadEl',
			onInit: function(el) {
				_downloadButton = el;
			},
			onTap: function() {
				return;
			}
		},
		{
			name: 'button--map',
			option: 'mapEl',
			onInit: function(el) {
				_mapButton = el;
			},
			onTap: function() {
				return;
			}
		},
		{
			name: 'button--zoom',
			option: 'zoomEl',
			onTap: pswp.toggleDesktopZoom
		},
		{
			name: 'counter',
			option: 'counterEl',
			onInit: function(el) {
				_indexIndicator = el;
			}
		},
		{
			name: 'button--close',
			option: 'closeEl',
			onTap: pswp.close
			/*onTap: function() {
				setTimeout(pswp.close);
			}*/
		},
		{
			name: 'button--arrow--left',
			option: 'arrowEl',
			onInit: function(el) {
				_prevButton = el;
			},
			onTap: function(){
				// block button if isdragging && !pointerEvent
				/*if(framework.features.pointerEvent || !pswp.isMainScrollAnimating())*/ pswp.prev();
			}
		},
		{
			name: 'button--arrow--right',
			option: 'arrowEl',
			onInit: function(el) {
				_nextButton = el;
			},
			onTap: function(){
				// console.log('pswp.isMainScrollAnimating()', pswp.isMainScrollAnimating(), pswp.isDragging());
				// block button if isdragging && !pointerEvent
				//if(!pswp.isMainScrollAnimating()) pswp.next();
				pswp.next();
			}
		},
		{
			name: 'button--fs',
			option: 'fullscreenEl',
			onInit: function(el) {
				_fullscreenButton = el;
			},
			onTap: function() {
				//ui[(screenfull.isFullscreen ? 'exit' : 'enter') + 'Fullscreen']();
				screenfull.toggle();
			}
		},
		{
			name: 'preloader',
			option: 'preloaderEl',
			onInit: function(el) {
				_loadingIndicator = el;
			}
		},
		{
			name: 'button--play',
			option: 'playEl',
			onTap: function() {
				_o.popup.toggle_play(!_o.popup.playing);
			}
		},
		{
			name: 'button--pano-rotate',
			option: 'panoRotateEl',
			onTap: _o.popup.toggle_pano_rotate
		}
	];

	// setup ui elements
	var _setupUIElements = function() {
		var item, uiElement;
		var loopThroughChildElements = function(sChildren) {
			if (!sChildren) return;
			var l = sChildren.length;
			for (var i = 0; i < l; i++) {
				item = sChildren[i];
				for (var a = 0; a < _uiElements.length; a++) {
					uiElement = _uiElements[a];
					if (item.classList.contains('pswp__' + uiElement.name)) {
						if (_options[uiElement.option]) {
							item.classList.remove('pswp__element--disabled');
							if (uiElement.onInit) uiElement.onInit(item);
						} else {
							item.classList.add('pswp__element--disabled');
						}
					}
				}
			}
		};
		loopThroughChildElements(_controls.children);
		loopThroughChildElements(_o.popup.topbar.children);
	};

	ui.init = function() {
		// extend options
		framework.copy_unique(pswp.options, _defaultUIOptions);

		// create local link for fast access
		_options = pswp.options;

		// find pswp__ui element
		_controls = _o.popup.ui;

		// create local link
		_listen = pswp.listen;

		_setupHidingControlsDuringGestures();

		// update controls when slides change
		_listen('beforeChange', ui.update);

		// update downloadEl link
		if(_options.downloadEl) _listen('afterChange', function(){
			// var href = pswp.currItem.original || pswp.currItem.src;
			var href = file_path(pswp.currItem.item); // make pano and video downloadable from mobile (html items without src prop)
			_downloadButton.setAttribute('href', href || '#');
			_downloadButton.style.display = href ? '' : 'none';
		});

		// update mapEl link
		if(_options.mapEl) _listen('afterChange', function(){
			var item = pswp.currItem.item,
					map_link = item && item.image && item.image.exif ? item.image.exif.gps : false;
			_mapButton.style.display = map_link ? '' : 'none';
			_mapButton.setAttribute('href', (map_link ? google_map_link(map_link) : '#'));
		});

		// toggle zoom on double-tap
		_listen('doubleTap', function(point) {
			var initialZoomLevel = pswp.currItem.initialZoomLevel;
			pswp.zoomTo(pswp.getZoomLevel() === initialZoomLevel ? _options.getDoubleTapZoom(false, pswp.currItem) : initialZoomLevel, point, 250);
		});

		// Allow text selection in caption
		_listen('preventDragEvent', function(e, isDown, preventObj) {
			var t = e.target || e.srcElement;
			if (
				t &&
				t.getAttribute('class') &&
				e.type.indexOf('mouse') > -1 &&
				(t.getAttribute('class').indexOf('__caption') > 0 || /(SMALL|STRONG|EM)/i.test(t.tagName))
			) {
				preventObj.prevent = false;
				_stopAllAnimations();
			}
		});

		// bind events for UI
		_listen('bindEvents', function() {
			framework.bind(_controls, 'pswpTap click', _onControlsTap);
			framework.bind(_o.popup.scrollwrap, 'pswpTap', ui.onGlobalTap);
			framework.bind(document, 'keydown', _idle_toggle);
		});

		// unbind events for UI
		_listen('unbindEvents', function() {
			//if (!_shareModalHidden) _toggleShareModal();
			if (_idleInterval) clearInterval(_idleInterval);
			framework.unbind(document, 'mouseout', _onMouseLeaveWindow);
			framework.unbind(document, 'mousemove', _onIdleMouseMove);
			framework.unbind(_controls, 'pswpTap click', _onControlsTap);
			framework.unbind(_o.popup.scrollwrap, 'pswpTap', ui.onGlobalTap);
			framework.unbind(document, 'keydown', _idle_toggle);
		});

		// clean up things when gallery is destroyed
		_listen('destroy', function() {
			if (_options.captionEl) {
				if (_fakeCaptionContainer) _controls.removeChild(_fakeCaptionContainer);
				_captionContainer.classList.remove('pswp__caption--empty');
			}
			//if (_shareModal) _shareModal.firstElementChild.onclick = null;
			_controls.classList.add('pswp__ui--hidden');
			if(_idleTimer) clearTimeout(_idleTimer); // mine make sure to clearTimeout
			ui.setIdle(false);
		});

		if (!_options.showAnimationDuration) _controls.classList.remove('pswp__ui--hidden');
		_listen('initialZoomIn', function() {
			if (_options.showAnimationDuration) _controls.classList.remove('pswp__ui--hidden');
		});
		_listen('initialZoomOut', function() {
			_controls.classList.add('pswp__ui--hidden');
		});

		//_listen('parseVerticalMargin', _applyNavBarGaps);

		_setupUIElements();

		//if (_options.shareEl && _shareButton && _shareModal) _shareModalHidden = true;

		_countNumItems();

		_setupIdle();

		_setupLoadingIndicator();
	};

	ui.setIdle = function(isIdle) {
		_isIdle = isIdle;
		_togglePswpClass(_controls, 'ui--idle', isIdle);
	};

	ui.update = function() {
		// Don't update UI if it's hidden
		if (_controlsVisible && pswp.currItem) {
			ui.updateIndexIndicator();
			if (_options.captionEl) {
				var captionExists = _options.addCaptionHTMLFn(pswp.currItem, _captionContainer);
				_togglePswpClass(_captionContainer, 'caption--empty', !captionExists);
			}
			_overlayUIUpdated = true;
		} else {
			_overlayUIUpdated = false;
		}

		//if (!_shareModalHidden) _toggleShareModal();
		_countNumItems();
	};

	ui.updateIndexIndicator = function() {
		if (_options.counterEl) _indexIndicator.innerHTML = pswp.getCurrentIndex() + 1 + _options.indexIndicatorSep + _options.getNumItemsFn();
		if (!_options.loop && _options.arrowEl && _options.getNumItemsFn() > 1) {
			framework.toggle_class(_prevButton, 'pswp__element--disabled', pswp.getCurrentIndex() === 0);
			framework.toggle_class(_nextButton, 'pswp__element--disabled', pswp.getCurrentIndex() === _options.getNumItemsFn() - 1);
		}
	};

	ui.onGlobalTap = function(e) {
		e = e || window.event;
		var target = e.target || e.srcElement;
		if (_blockControlsTap) return;

		if (e.detail && e.detail.pointerType === 'mouse') {
			// Silently ignore right-click events.
			if (!e.detail.rightClick) {

				// IMGzoom if (click == zoom || items == 1 || is_zoomed) && click on pswp__img
				//if((_options.getNumItemsFn() < 2 || pswp.getZoomLevel() > pswp.currItem.fitRatio) && target.classList.contains('pswp__img')){
				if((_options.click == 'zoom' || _options.getNumItemsFn() < 2 || pswp.getZoomLevel() > pswp.currItem.fitRatio) && target.classList.contains('pswp__img')){
					if(pswp.currItem.fitRatio < 1) pswp.toggleDesktopZoom(e.detail.releasePoint);

				// next previous (also applies in zoom mode when clicking outside image)
				} else if(target.className.indexOf('pswp__') === 0) {
					var dir = (_options.getNumItemsFn() > 2 || !pswp.getCurrentIndex()) && (_options.click == 'next' || e.detail.releasePoint.x > _o.popup.pswp.clientWidth / 2) ? 'next' : 'prev';
					pswp[dir]();
				}
			}
		} else {

			// tap anywhere (except buttons) to toggle visibility of controls
			// mine: touch-tap on dual-input, use idle instead to not block mouse. IE11, block operation
			if(tests.is_dual_input){
				if(!tests.legacy_ie) ui.setIdle(!_isIdle);
			} else {
				ui.toggleControls(!_controlsVisible);
			}
		}
	};

	ui.toggleControls = function(toggle){
		_controlsVisible = toggle;
		if(toggle && !_overlayUIUpdated) ui.update();
		_togglePswpClass(_controls, 'ui--hidden', !toggle);
	}
};



// photoswipe.custom.js
// https://github.com/andi34/PhotoSwipe/ 21.Sep 2020

// framework / Set of generic functions used by gallery.
var framework = {
	bind: function(target, type, listener, unbind) {
		var methodName = (unbind ? 'remove' : 'add') + 'EventListener';
		type = type.split(' ');
		for (var i = 0; i < type.length; i++) {
			if (type[i]) target[methodName](type[i], listener, false);
		}
	},
	createEl: function(classes, tag) {
		var el = document.createElement(tag || 'div');
		if (classes) el.className = classes;
		return el;
	},
	resetEl: function(el) {
		while (el.firstChild) el.removeChild(el.firstChild);
	},
	getScrollY: function() {
		return window.pageYOffset;
	},
	unbind: function(target, type, listener) {
		framework.bind(target, type, listener, true);
	},
	toggle_class: function(el, cname, add){
		el.classList[(add ? 'add' : 'remove')](cname);
	},
	arraySearch: function(array, value, key) {
		var i = array.length;
		while (i--) if (array[i][key] === value) return i;
		return -1;
	},
	copy_unique: function(o1, o2) {
		Object.keys(o2).forEach(function(prop) {
			if(!o1.hasOwnProperty(prop)) o1[prop] = o2[prop];
		});
	},
	easing: {
		sine: {
			out: function(k) {
				return Math.sin(k * (Math.PI / 2));
			},
			inOut: function(k) {
				return -(Math.cos(Math.PI * k) - 1) / 2;
			}
		},
		cubic: {
			out: function(k) {
				return --k * k * k + 1;
			}
		}
	},
	features: {
		touch: tests.is_touch,
		raf: window.requestAnimationFrame,
		caf: window.cancelAnimationFrame,
		pointerEvent: !!(window.PointerEvent) || navigator.msPointerEnabled,
		is_mouse: tests.only_pointer
	}
};

// PhotoSwipe
var PhotoSwipe = function(template, UiClass, items, options) {

	//
	var self = this;

	// static vars
	var DOUBLE_TAP_RADIUS = 25,
			NUM_HOLDERS = 3;

	// options
	var _options = {
		allowPanToNext: true,
		spacing: 0.12,
		bgOpacity: 1,
		mouseUsed: tests.only_pointer,
		loop: true,
		pinchToClose: true,
		closeOnScroll: true,
		closeOnVerticalDrag: true,
		verticalDragRange: 0.75,
		hideAnimationDuration: 333,
		showAnimationDuration: 333,
		showHideOpacity: false,
		focus: true,
		escKey: true,
		arrowKeys: true,
		mainScrollEndFriction: 0.35,
		panEndFriction: 0.35,
		transition: 'glide',
		play_transition: 'glide',
		isClickableElement: function(el) {
			return el.tagName === 'A' || el.tagName === 'VIDEO' || el.closest('.time-control');
		},
		getDoubleTapZoom: function(isMouseClick, item) {
			return isMouseClick || item.initialZoomLevel < 0.7 ? 1 : 1.33;
		},
		maxSpreadZoom: 1//1.33
	};

	// extend options
	Object.assign(_options, options);

	// helpers
	var _getEmptyPoint = function() {
		return { x: 0, y: 0 };
	};

	// private
	var _isOpen,
		_isDestroying,
		_closedByScroll,
		_currentItemIndex,
		_containerStyle,
		_containerShiftIndex,
		_currPanDist = _getEmptyPoint(),
		_startPanOffset = _getEmptyPoint(),
		_panOffset = _getEmptyPoint(),
		_upMoveEvents, // drag move, drag end & drag cancel events array
		_downEvents, // drag start events array
		_globalEventHandlers,
		_viewportSize = {},
		_currZoomLevel,
		_startZoomLevel,
		_translatePrefix,
		//_updateSizeInterval,
		_itemsNeedUpdate,
		_currPositionIndex = 0,
		_offset = {},
		_slideSize = _getEmptyPoint(), // size of slide area, including spacing
		_itemHolders,
		_prevItemIndex,
		_indexDiff = 0, // difference of indexes since last content update
		_dragStartEvent,
		_dragMoveEvent,
		_dragEndEvent,
		_dragCancelEvent,
		_pointerEventEnabled,
		_likelyTouchDevice,
		_modules = [],
		_requestAF,
		_cancelAF,
		_initalClassName,
		_initalWindowScrollY,
		_currentWindowScrollY,
		_features,
		_windowVisibleSize = {},
		_renderMaxResolution = false,
		_orientationChangeTimeout,
		// Registers PhotoSWipe module (History, Controller ...)
		_registerModule = function(name, module) {
			Object.assign(self, module.publicMethods);
			_modules.push(name);
		},
		_getLoopedId = function(index) {
			var numSlides = _getNumItems();
			if (index > numSlides - 1) {
				return index - numSlides;
			} else if (index < 0) {
				return numSlides + index;
			}
			return index;
		},
		// Micro bind/trigger
		_listeners = {},
		_listen = function(name, fn) {
			if (!_listeners[name]) _listeners[name] = [];
			return _listeners[name].push(fn);
		},
		_shout = function(name) {
			var listeners = _listeners[name];
			if (listeners) {
				var args = Array.prototype.slice.call(arguments);
				args.shift();
				for (var i = 0; i < listeners.length; i++) listeners[i].apply(self, args);
			}
		},
		_getCurrentTime = function() {
			return new Date().getTime();
		},
		_applyBgOpacity = function(opacity) {
			_bgOpacity = opacity;
			_o.popup.bg.style.opacity = opacity * _options.bgOpacity;
		},
		_applyZoomTransform = function(styleObj, x, y, zoom, item) {
			if (!_renderMaxResolution || (item && item !== self.currItem)) {
				zoom = zoom / (item ? item.fitRatio : self.currItem.fitRatio);
			}
			styleObj.transform = _translatePrefix + x + 'px, ' + y + 'px, 0px) scale(' + zoom + ')';
		},
		_applyCurrentZoomPan = function(allowRenderResolution) {
			if (_currZoomElementStyle && !self.currItem.loadError) {
				if (allowRenderResolution) {
					if (_currZoomLevel > self.currItem.fitRatio) {
						if (!_renderMaxResolution) {
							_setImageSize(self.currItem, false, true);
							_renderMaxResolution = true;
						}
					} else {
						if (_renderMaxResolution) {
							_setImageSize(self.currItem);
							_renderMaxResolution = false;
						}
					}
				}
				_applyZoomTransform(_currZoomElementStyle, _panOffset.x, _panOffset.y, _currZoomLevel);
			}
		},
		_applyZoomPanToItem = function(item) {
			if (item.container) {
				_applyZoomTransform(item.container.style, item.initialPosition.x, item.initialPosition.y, item.initialZoomLevel, item);
			}
		},
		_setTranslateX = function(x, elStyle) {
			elStyle.transform = _translatePrefix + x + 'px, 0px, 0px)';
		},
		_moveMainScroll = function(x, dragging) {
			if (!_options.loop && dragging) {
				var newSlideIndexOffset = _currentItemIndex + (_slideSize.x * _currPositionIndex - x) / _slideSize.x,
					delta = Math.round(x - _mainScrollPos.x);

				if ((newSlideIndexOffset < 0 && delta > 0) || (newSlideIndexOffset >= _getNumItems() - 1 && delta < 0)) {
					x = _mainScrollPos.x + delta * _options.mainScrollEndFriction;
				}
			}
			_mainScrollPos.x = x;
			_setTranslateX(x, _containerStyle);
		},
		_calculatePanOffset = function(axis, zoomLevel) {
			var m = _midZoomPoint[axis] - _offset[axis];
			return _startPanOffset[axis] + _currPanDist[axis] + m - m * (zoomLevel / _startZoomLevel);
		},
		_equalizePoints = function(p1, p2) {
			p1.x = p2.x;
			p1.y = p2.y;
			if (p2.id) {
				p1.id = p2.id;
			}
		},
		_roundPoint = function(p) {
			p.x = Math.round(p.x);
			p.y = Math.round(p.y);
		},
		_mouseUsed = function(){
			if(!_features.is_mouse) {
				template.classList.add('pswp--has_mouse');
				_initalClassName += ' pswp--has_mouse';
				_features.is_mouse = _options.mouseUsed = true;
			}
			_shout('mouseUsed');
		},
		_mouseMoveTimeout = null,
		_onFirstMouseMove = function() {
			if (_mouseMoveTimeout) {
				framework.unbind(document, 'mousemove', _onFirstMouseMove);
				_mouseUsed();
			}
			_mouseMoveTimeout = setTimeout(function() {
				_mouseMoveTimeout = null;
			}, 100);
		},
		_bindEvents = function() {
			framework.bind(document, 'keydown', self);
			framework.bind(_o.popup.scrollwrap, 'click', self);
			if(_features.is_mouse){
				_mouseUsed();
			} else if(tests.is_pointer) {
				framework.bind(document, 'mousemove', _onFirstMouseMove);
			}
			framework.bind(window, 'resize scroll orientationchange', self);
			_shout('bindEvents');
		},
		_unbindEvents = function() {
			setTimeout(function() {
				framework.unbind(window, 'resize scroll orientationchange', self);
			}, 400);
			framework.unbind(window, 'scroll', _globalEventHandlers.scroll);
			framework.unbind(document, 'keydown', self);
			if(tests.is_pointer) framework.unbind(document, 'mousemove', _onFirstMouseMove);
			framework.unbind(_o.popup.scrollwrap, 'click', self);
			if (_isDragging) framework.unbind(window, _upMoveEvents, self);
			clearTimeout(_orientationChangeTimeout);
			_shout('unbindEvents');
		},
		_calculatePanBounds = function(zoomLevel, update) {
			var bounds = _calculateItemSize(self.currItem, _viewportSize, zoomLevel);
			if (update) _currPanBounds = bounds;
			return bounds;
		},
		_getMinZoomLevel = function(item) {
			return (item || self.currItem).initialZoomLevel;
		},
		_getMaxZoomLevel = function(item) {
			return (item || self.currItem).w > 0 ? _options.maxSpreadZoom : 1;
		},
		// Return true if offset is out of the bounds
		_modifyDestPanOffset = function(axis, destPanBounds, destPanOffset, destZoomLevel) {
			if (destZoomLevel === self.currItem.initialZoomLevel) {
				destPanOffset[axis] = self.currItem.initialPosition[axis];
				return true;
			} else {
				destPanOffset[axis] = _calculatePanOffset(axis, destZoomLevel);
				if (destPanOffset[axis] > destPanBounds.min[axis]) {
					destPanOffset[axis] = destPanBounds.min[axis];
					return true;
				} else if (destPanOffset[axis] < destPanBounds.max[axis]) {
					destPanOffset[axis] = destPanBounds.max[axis];
					return true;
				}
			}
			return false;
		},
		_setupTransforms = function() {
			_translatePrefix = 'translate' + (!_likelyTouchDevice ? '3d(' : '(');
			// return;
		},
		_onKeyDown = function(e) {
			var keydownAction = '';
			if (_options.escKey && e.keyCode === 27) {
				keydownAction = 'close';
			} else if (_options.arrowKeys) {
				if (e.keyCode === 37) {
					keydownAction = 'prev';
				} else if (e.keyCode === 39) {
					keydownAction = 'next';
				}
			}

			// don't do anything if special key pressed to prevent from overriding default browser actions
			// e.g. in Chrome on Mac cmd+arrow-left returns to previous page
			if(!keydownAction || e.ctrlKey || e.altKey || e.shiftKey || e.metaKey) return false;

			// key!
			e.preventDefault();
			self[keydownAction]();
		},
		_onGlobalClick = function(e) {
			if (!e) return;
			// don't allow click event to pass through when triggering after drag or some other gesture
			if (_moved || _zoomStarted || _mainScrollAnimating || _verticalDragInitiated) {
				e.preventDefault();
				e.stopPropagation();
			}
		},
		_updatePageScrollOffset = function() {
			self.setScrollOffset(0, framework.getScrollY());
		};

	// Micro animation engine
	var _animations = {},
		_numAnimations = 0,
		_stopAnimation = function(name) {
			if (_animations[name]) {
				if (_animations[name].raf) _cancelAF(_animations[name].raf);
				_numAnimations--;
				delete _animations[name];
			}
		},
		_registerStartAnimation = function(name) {
			if (_animations[name]) _stopAnimation(name);
			if (!_animations[name]) {
				_numAnimations++;
				_animations[name] = {};
			}
		},
		_stopAllAnimations = function() {
			for (var prop in _animations) {
				if (_animations.hasOwnProperty(prop)) _stopAnimation(prop);
			}
		},
		_animateProp = function(name, b, endProp, d, easingFn, onUpdate, onComplete) {
			var startAnimTime = _getCurrentTime(), t;
			_registerStartAnimation(name);
			var animloop = function() {
				if (_animations[name]) {
					t = _getCurrentTime() - startAnimTime; // time diff
					//b - beginning (start prop)
					//d - anim duration

					if (t >= d) {
						_stopAnimation(name);
						onUpdate(endProp);
						if (onComplete) onComplete();
						return;
					}
					onUpdate((endProp - b) * easingFn(t / d) + b);
					_animations[name].raf = _requestAF(animloop);
				}
			};
			animloop();
		};

	// make a few local variables and functions public
	var publicMethods = {
		shout: _shout,
		listen: _listen,
		viewportSize: _viewportSize,
		options: _options,
		isMainScrollAnimating: function() {
			return _mainScrollAnimating;
		},
		getZoomLevel: function() {
			return _currZoomLevel;
		},
		getCurrentIndex: function() {
			return _currentItemIndex;
		},
		isDragging: function() {
			return _isDragging;
		},
		isZooming: function() {
			return _isZooming;
		},
		setScrollOffset: function(x, y) {
			_offset.x = x;
			_currentWindowScrollY = _offset.y = y;
			//_shout('updateScrollOffset', _offset);
		},
		applyZoomPan: function(zoomLevel, panX, panY, allowRenderResolution) {
			_panOffset.x = panX;
			_panOffset.y = panY;
			_currZoomLevel = zoomLevel;
			_applyCurrentZoomPan(allowRenderResolution);
		},
		init: function() {
			if (_isOpen || _isDestroying) return;
			var i;

			self.framework = framework; // basic functionality
			self.template = template; // root DOM element of PhotoSwipe

			_initalClassName = template.className;
			_isOpen = true;

			_features = framework.features;
			_requestAF = _features.raf;
			_cancelAF = _features.caf;
			_containerStyle = _o.popup.container.style; // for fast access

			// Objects that hold slides (there are only 3 in DOM)
			self.itemHolders = _itemHolders = [{
					el: _o.popup.items[0],
					wrap: 0,
					index: -1
				},
				{
					el: _o.popup.items[1],
					wrap: 0,
					index: -1
				},
				{
					el: _o.popup.items[2],
					wrap: 0,
					index: -1
				}
			];

			// hide nearby item holders until initial zoom animation finishes (to avoid extra Paints)
			_itemHolders[0].el.style.display = _itemHolders[2].el.style.display = 'none';

			_setupTransforms();

			// Setup global events
			_globalEventHandlers = {
				resize: self.updateSize,

				// Fixes: iOS 10.3 resize event
				// does not update scrollWrap.clientWidth instantly after resize
				// https://github.com/dimsemenov/PhotoSwipe/issues/1315
				orientationchange: function() {
					clearTimeout(_orientationChangeTimeout);
					_orientationChangeTimeout = setTimeout(function() {
						if (_viewportSize.x !== _o.popup.scrollwrap.clientWidth) {
							self.updateSize();
						}
					}, 500);
				},
				scroll: _updatePageScrollOffset,
				keydown: _onKeyDown,
				click: _onGlobalClick
			};

			// init modules
			for (i = 0; i < _modules.length; i++) self['init' + _modules[i]]();

			// init
			if (UiClass) {
				var ui = (self.ui = new UiClass(self, framework));
				ui.init();
			}

			_shout('firstUpdate');
			_currentItemIndex = _currentItemIndex || _options.index || 0;
			// validate index
			if (isNaN(_currentItemIndex) || _currentItemIndex < 0 || _currentItemIndex >= _getNumItems()) {
				_currentItemIndex = 0;
			}
			self.currItem = _getItemAt(_currentItemIndex);

			template.setAttribute('aria-hidden', 'false');
			//template.style.position = 'fixed';

			if (_currentWindowScrollY === undefined) {
				_shout('initialLayout');
				_currentWindowScrollY = _initalWindowScrollY = framework.getScrollY();
			}

			// add classes to root element of PhotoSwipe
			var root_classes = 'pswp--open' + (_options.showHideOpacity ? ' pswp--animate_opacity' : '') + (tests.is_pointer && (_options.click == 'zoom' || _options.getNumItemsFn() < 2) ? ' pswp--zoom-cursor' : '');
			DOMTokenList.prototype.add.apply(template.classList, root_classes.split(' '));

			//
			self.updateSize();

			// initial update
			_containerShiftIndex = -1;
			_indexDiff = null;
			for (i = 0; i < NUM_HOLDERS; i++) {
				_setTranslateX((i + _containerShiftIndex) * _slideSize.x, _itemHolders[i].el.style);
			}

			framework.bind(_o.popup.scrollwrap, _downEvents, self);

			_listen('initialZoomInEnd', function() {
				self.setContent(_itemHolders[0], _currentItemIndex - 1);
				self.setContent(_itemHolders[2], _currentItemIndex + 1);

				_itemHolders[0].el.style.display = _itemHolders[2].el.style.display = 'block';

				if (_options.focus) template.focus();

				_bindEvents();
			});

			// set content for center slide (first time)
			self.setContent(_itemHolders[1], _currentItemIndex);

			self.updateCurrItem();

			template.classList.add('pswp--visible');
		},

		// Close the gallery, then destroy it
		close: function() {
			if (!_isOpen) return;
			_isOpen = false;
			_isDestroying = true;
			_shout('close');
			_unbindEvents();
			_showOrHide(self.currItem, null, true, self.destroy);
		},

		// destroys the gallery (unbinds events, cleans up intervals and timeouts to avoid memory leaks)
		destroy: function() {
			_shout('destroy');
			if (_showOrHideTimeout) clearTimeout(_showOrHideTimeout);
			template.setAttribute('aria-hidden', 'true');
			template.className = _initalClassName;
			framework.unbind(_o.popup.scrollwrap, _downEvents, self);
			// we unbind scroll event at the end, as closing animation may depend on it
			framework.unbind(window, 'scroll', self);
			_stopDragUpdateLoop();
			_stopAllAnimations();
			_listeners = {};
		},
		// Pan image to position
		panTo: function(x, y, force) {
			if (!force) {
				if (x > _currPanBounds.min.x) {
					x = _currPanBounds.min.x;
				} else if (x < _currPanBounds.max.x) {
					x = _currPanBounds.max.x;
				}
				if (y > _currPanBounds.min.y) {
					y = _currPanBounds.min.y;
				} else if (y < _currPanBounds.max.y) {
					y = _currPanBounds.max.y;
				}
			}
			if(x == _panOffset.x && y == _panOffset.y) return;
			_panOffset.x = x;
			_panOffset.y = y;
			_applyCurrentZoomPan();
		},
		handleEvent: function(e) {
			e = e || window.event;
			if (_globalEventHandlers[e.type]) _globalEventHandlers[e.type](e);
		},
		goTo: function(index, dir, is_play) {

			// transition name
			var transition = is_play ? _options.play_transition : _options.transition;

			//
			if (transition === 'slide') {
				_finishSwipeMainScrollGesture('swipe', 80 * index, {
					lastFlickDist: { x: 80, y: 0 },
					lastFlickOffset: { x: 80 * index, y: 0 },
					lastFlickSpeed: { x: 2 * index, y: 0 }
				});
			} else {
				index = _getLoopedId(index);
				var diff = index - _currentItemIndex;
				_indexDiff = diff;
				_currentItemIndex = index;
				self.currItem = _getItemAt(_currentItemIndex);
				_currPositionIndex -= diff;
				_moveMainScroll(_slideSize.x * _currPositionIndex);
				_stopAllAnimations();
				_mainScrollAnimating = false;

				// stop pause current anim just in case
				if(_o.popup.image_anim && !_o.popup.image_anim.paused) _o.popup.image_anim.pause();

				// get transition props
				var transition_props = _o.popup.transitions.hasOwnProperty(transition) ? _o.popup.transitions[transition](dir) : false;

				// calculate current caption_transition_delay
				_o.popup.caption_transition_delay = transition_props ? (transition_props.duration || 0) : 0;

				// update
				self.updateCurrItem();

				// exit if !transition_props
				if(!transition_props) return;

				// prepare target
				var target = self.currItem.container ? self.currItem.container.lastElementChild : false;

				// process transition if target
				// none, slide, glide, fade, zoom, pop, elastic, custom
				if(target) {
					if(_o.popup.image_timer) {
						clearTimeout(_o.popup.image_timer);
					} else {
						_o.popup.image_anim = anime(Object.assign({ targets: target }, transition_props));
					}

					// timer for fast nav
					_o.popup.image_timer = setTimeout(function(){
						_o.popup.image_timer = false;
					}, 300);
				}
			}
		},
		next: function(is_play) {
			if (!_options.loop && _currentItemIndex === _getNumItems() - 1) return;
			var transition = is_play ? _options.play_transition : _options.transition;
			self.goTo(transition === 'slide' ? -1 : parseInt(_currentItemIndex) + 1, 1, is_play);
		},
		prev: function() {
			if (!_options.loop && _currentItemIndex === 0) return;
			self.goTo(_options.transition === 'slide' ? 1 : parseInt(_currentItemIndex) - 1, -1);
		},
		// update current zoom/pan objects
		updateCurrZoomItem: function(emulateSetContent) {
			if (emulateSetContent) _shout('beforeChange', 0);

			// itemHolder[1] is middle (current) item
			var zoomElement = _itemHolders[1].el.children;
			_currZoomElementStyle = zoomElement.length && zoomElement[0].classList.contains('pswp__zoom-wrap') ? zoomElement[0].style : null;
			_currPanBounds = self.currItem.bounds;
			_startZoomLevel = _currZoomLevel = self.currItem.initialZoomLevel;
			_panOffset.x = _currPanBounds.center.x;
			_panOffset.y = _currPanBounds.center.y;
			if (emulateSetContent) _shout('afterChange');
		},
		invalidateCurrItems: function() {
			_itemsNeedUpdate = true;
			for (var i = 0; i < NUM_HOLDERS; i++) {
				if (_itemHolders[i].item) _itemHolders[i].item.needsUpdate = true;
			}
		},
		updateCurrItem: function(beforeAnimation) {
			if (_indexDiff === 0) return;
			var diffAbs = Math.abs(_indexDiff), tempHolder;
			if (beforeAnimation && diffAbs < 2) return;
			self.currItem = _getItemAt(_currentItemIndex);
			_renderMaxResolution = false;
			_shout('beforeChange', _indexDiff);
			if (diffAbs >= NUM_HOLDERS) {
				_containerShiftIndex += _indexDiff + (_indexDiff > 0 ? -NUM_HOLDERS : NUM_HOLDERS);
				diffAbs = NUM_HOLDERS;
			}
			for (var i = 0; i < diffAbs; i++) {
				if (_indexDiff > 0) {
					tempHolder = _itemHolders.shift();
					_itemHolders[NUM_HOLDERS - 1] = tempHolder; // move first to last
					_containerShiftIndex++;
					_setTranslateX((_containerShiftIndex + 2) * _slideSize.x, tempHolder.el.style);
					self.setContent(tempHolder, _currentItemIndex - diffAbs + i + 1 + 1);
				} else {
					tempHolder = _itemHolders.pop();
					_itemHolders.unshift(tempHolder); // move last to first
					_containerShiftIndex--;
					_setTranslateX(_containerShiftIndex * _slideSize.x, tempHolder.el.style);
					self.setContent(tempHolder, _currentItemIndex + diffAbs - i - 1 - 1);
				}
			}

			// reset zoom/pan on previous item
			if (_currZoomElementStyle && Math.abs(_indexDiff) === 1) {
				var prevItem = _getItemAt(_prevItemIndex);
				if (prevItem.initialZoomLevel !== _currZoomLevel) {
					_calculateItemSize(prevItem, _viewportSize);
					_setImageSize(prevItem);
					_applyZoomPanToItem(prevItem);
				}
			}

			// reset diff after update
			_indexDiff = 0;
			self.updateCurrZoomItem();
			_prevItemIndex = _currentItemIndex;
			_shout('afterChange');
		},
		updateSize: function(force) {
			_viewportSize.x = _o.popup.scrollwrap.clientWidth;
			_viewportSize.y = _o.popup.scrollwrap.clientHeight;
			_updatePageScrollOffset();
			_slideSize.x = _viewportSize.x + Math.round(_viewportSize.x * _options.spacing);
			_slideSize.y = _viewportSize.y;
			_moveMainScroll(_slideSize.x * _currPositionIndex);
			_shout('beforeResize'); // even may be used for example to switch image sources
			// don't re-calculate size on inital size update
			if (_containerShiftIndex !== undefined) {
				var holder, item, hIndex;
				for (var i = 0; i < NUM_HOLDERS; i++) {
					holder = _itemHolders[i];
					_setTranslateX((i + _containerShiftIndex) * _slideSize.x, holder.el.style);
					hIndex = _currentItemIndex + i - 1;
					if (_options.loop && _getNumItems() > 2) hIndex = _getLoopedId(hIndex);

					// update zoom level on items and refresh source (if needsUpdate)
					item = _getItemAt(hIndex);

					// re-render gallery item if `needsUpdate`,
					// or doesn't have `bounds` (entirely new slide object)
					if (item && (_itemsNeedUpdate || item.needsUpdate || !item.bounds)) {
						self.cleanSlide(item);
						self.setContent(holder, hIndex);

						// if "center" slide
						if (i === 1) {
							self.currItem = item;
							self.updateCurrZoomItem(true);
						}

						item.needsUpdate = false;
					} else if (holder.index === -1 && hIndex >= 0) {
						// add content first time
						self.setContent(holder, hIndex);
					}
					if (item && item.container) {
						_calculateItemSize(item, _viewportSize);
						_setImageSize(item);
						_applyZoomPanToItem(item);
					}
				}
				_itemsNeedUpdate = false;
			}

			_startZoomLevel = _currZoomLevel = self.currItem.initialZoomLevel;
			_currPanBounds = self.currItem.bounds;

			if (_currPanBounds) {
				_panOffset.x = _currPanBounds.center.x;
				_panOffset.y = _currPanBounds.center.y;
				_applyCurrentZoomPan(true);
			}

			_shout('resize');
		},

		// Zoom current item to
		zoomTo: function(destZoomLevel, centerPoint, speed, easingFn, updateFn) {
			if (centerPoint) {
				_startZoomLevel = _currZoomLevel;
				_midZoomPoint.x = Math.abs(centerPoint.x) - _panOffset.x;
				_midZoomPoint.y = Math.abs(centerPoint.y) - _panOffset.y;
				_equalizePoints(_startPanOffset, _panOffset);
			}

			var destPanBounds = _calculatePanBounds(destZoomLevel, false),
				destPanOffset = {};

			_modifyDestPanOffset('x', destPanBounds, destPanOffset, destZoomLevel);
			_modifyDestPanOffset('y', destPanBounds, destPanOffset, destZoomLevel);

			var initialZoomLevel = _currZoomLevel;
			var initialPanOffset = {
				x: _panOffset.x,
				y: _panOffset.y
			};

			_roundPoint(destPanOffset);

			var onUpdate = function(now) {
				if (now === 1) {
					_currZoomLevel = destZoomLevel;
					_panOffset.x = destPanOffset.x;
					_panOffset.y = destPanOffset.y;
				} else {
					_currZoomLevel = (destZoomLevel - initialZoomLevel) * now + initialZoomLevel;
					_panOffset.x = (destPanOffset.x - initialPanOffset.x) * now + initialPanOffset.x;
					_panOffset.y = (destPanOffset.y - initialPanOffset.y) * now + initialPanOffset.y;
				}

				if (updateFn) updateFn(now);
				_applyCurrentZoomPan(now === 1);
			};
			if (speed) {
				_animateProp('customZoomTo', 0, 1, speed, easingFn || framework.easing.sine.inOut, onUpdate);
			} else {
				onUpdate(1);
			}
		}
	};


	// gestures
	var MIN_SWIPE_DISTANCE = 30,
		DIRECTION_CHECK_OFFSET = 10; // amount of pixels to drag to determine direction of swipe

	var _gestureStartTime,
		_gestureCheckSpeedTime,
		// pool of objects that are used during dragging of zooming
		p = {}, // first point
		p2 = {}, // second point (for zoom gesture)
		delta = {},
		_currPoint = {},
		_startPoint = {},
		_currPointers = [],
		_startMainScrollPos = {},
		_releaseAnimData,
		_posPoints = [], // array of points during dragging, used to determine type of gesture
		_tempPoint = {},
		_isZoomingIn,
		_verticalDragInitiated,
		_currZoomedItemIndex = 0,
		_centerPoint = _getEmptyPoint(),
		_lastReleaseTime = 0,
		_isDragging, // at least one pointer is down
		_isMultitouch, // at least two _pointers are down
		_zoomStarted, // zoom level changed during zoom gesture
		_moved,
		_dragAnimFrame,
		_mainScrollShifted,
		_currentPoints, // array of current touch points
		_isZooming,
		_currPointsDistance,
		_startPointsDistance,
		_currPanBounds,
		_mainScrollPos = _getEmptyPoint(),
		_currZoomElementStyle,
		_mainScrollAnimating, // true, if animation after swipe gesture is running
		_midZoomPoint = _getEmptyPoint(),
		_currCenterPoint = _getEmptyPoint(),
		_direction,
		_isFirstMove,
		_opacityChanged,
		_bgOpacity,
		_wasOverInitialZoom,
		_isEqualPoints = function(p1, p2) {
			return p1.x === p2.x && p1.y === p2.y;
		},
		_isNearbyPoints = function(touch0, touch1) {
			return Math.abs(touch0.x - touch1.x) < DOUBLE_TAP_RADIUS && Math.abs(touch0.y - touch1.y) < DOUBLE_TAP_RADIUS;
		},
		_calculatePointsDistance = function(p1, p2) {
			_tempPoint.x = Math.abs(p1.x - p2.x);
			_tempPoint.y = Math.abs(p1.y - p2.y);
			return Math.sqrt(_tempPoint.x * _tempPoint.x + _tempPoint.y * _tempPoint.y);
		},
		_stopDragUpdateLoop = function() {
			if (_dragAnimFrame) {
				_cancelAF(_dragAnimFrame);
				_dragAnimFrame = null;
			}
		},
		_dragUpdateLoop = function() {
			if (_isDragging) {
				_dragAnimFrame = _requestAF(_dragUpdateLoop);
				_renderMovement();
			}
		},
		_canPan = function() {
			return !(_currZoomLevel === self.currItem.initialZoomLevel);
		},
		// find the closest parent DOM element
		_closestElement = function(el, fn) {
			if (!el || el === document || el === _o.popup.scrollwrap) return false;
			if (fn(el)) return el;
			return _closestElement(el.parentNode, fn);
		},
		_preventObj = {},
		_preventDefaultEventBehaviour = function(e, isDown) {
			_preventObj.prevent = !_closestElement(e.target, _options.isClickableElement);
			_shout('preventDragEvent', e, isDown, _preventObj);
			return _preventObj.prevent;
		},
		_convertTouchToPoint = function(touch, p) {
			p.x = touch.pageX;
			p.y = touch.pageY;
			p.id = touch.identifier;
			return p;
		},
		_findCenterOfPoints = function(p1, p2, pCenter) {
			pCenter.x = (p1.x + p2.x) * 0.5;
			pCenter.y = (p1.y + p2.y) * 0.5;
		},
		_pushPosPoint = function(time, x, y) {
			if (time - _gestureCheckSpeedTime > 50) {
				var o = _posPoints.length > 2 ? _posPoints.shift() : {};
				o.x = x;
				o.y = y;
				_posPoints.push(o);
				_gestureCheckSpeedTime = time;
			}
		},
		_calculateVerticalDragOpacityRatio = function() {
			var yOffset = _panOffset.y - self.currItem.initialPosition.y; // difference between initial and current position
			return 1 - Math.abs(yOffset / (_viewportSize.y / 2));
		},
		// points pool, reused during touch events
		_ePoint1 = {},
		_ePoint2 = {},
		_tempPointsArr = [],
		_tempCounter,
		_getTouchPoints = function(e) {
			// clean up previous points, without recreating array
			while (_tempPointsArr.length > 0) _tempPointsArr.pop();

			if (!_pointerEventEnabled) {
				if (e.type.indexOf('touch') > -1) {
					if (e.touches && e.touches.length > 0) {
						_tempPointsArr[0] = _convertTouchToPoint(e.touches[0], _ePoint1);
						if (e.touches.length > 1) {
							_tempPointsArr[1] = _convertTouchToPoint(e.touches[1], _ePoint2);
						}
					}
				} else {
					_ePoint1.x = e.pageX;
					_ePoint1.y = e.pageY;
					_ePoint1.id = '';
					_tempPointsArr[0] = _ePoint1; //_ePoint1;
				}
			} else {
				_tempCounter = 0;
				// we can use forEach, as pointer events are supported only in modern browsers
				_currPointers.forEach(function(p) {
					if (_tempCounter === 0) {
						_tempPointsArr[0] = p;
					} else if (_tempCounter === 1) {
						_tempPointsArr[1] = p;
					}
					_tempCounter++;
				});
			}
			return _tempPointsArr;
		},
		_panOrMoveMainScroll = function(axis, delta) {
			var panFriction,
				overDiff = 0,
				newOffset = _panOffset[axis] + delta[axis],
				startOverDiff,
				dir = delta[axis] > 0,
				newMainScrollPosition = _mainScrollPos.x + delta.x,
				mainScrollDiff = _mainScrollPos.x - _startMainScrollPos.x,
				newPanPos,
				newMainScrollPos;

			// calculate fdistance over the bounds and friction
			panFriction = newOffset > _currPanBounds.min[axis] || newOffset < _currPanBounds.max[axis] ? _options.panEndFriction : 1;
			newOffset = _panOffset[axis] + delta[axis] * panFriction;

			// move main scroll or start panning
			if (_options.allowPanToNext || _currZoomLevel === self.currItem.initialZoomLevel) {
				if (!_currZoomElementStyle) {
					newMainScrollPos = newMainScrollPosition;
				} else if (_direction === 'h' && axis === 'x' && !_zoomStarted) {
					if (dir) {
						if (newOffset > _currPanBounds.min[axis]) {
							panFriction = _options.panEndFriction;
							overDiff = _currPanBounds.min[axis] - newOffset;
							startOverDiff = _currPanBounds.min[axis] - _startPanOffset[axis];
						}

						// drag right
						if ((startOverDiff <= 0 || mainScrollDiff < 0) && _getNumItems() > 1) {
							newMainScrollPos = newMainScrollPosition;
							if (mainScrollDiff < 0 && newMainScrollPosition > _startMainScrollPos.x) {
								newMainScrollPos = _startMainScrollPos.x;
							}
						} else {
							if (_currPanBounds.min.x !== _currPanBounds.max.x) {
								newPanPos = newOffset;
							}
						}
					} else {
						if (newOffset < _currPanBounds.max[axis]) {
							panFriction = _options.panEndFriction;
							overDiff = newOffset - _currPanBounds.max[axis];
							startOverDiff = _startPanOffset[axis] - _currPanBounds.max[axis];
						}

						if ((startOverDiff <= 0 || mainScrollDiff > 0) && _getNumItems() > 1) {
							newMainScrollPos = newMainScrollPosition;

							if (mainScrollDiff > 0 && newMainScrollPosition < _startMainScrollPos.x) {
								newMainScrollPos = _startMainScrollPos.x;
							}
						} else {
							if (_currPanBounds.min.x !== _currPanBounds.max.x) {
								newPanPos = newOffset;
							}
						}
					}
				}

				if (axis === 'x') {
					if (newMainScrollPos !== undefined) {
						_moveMainScroll(newMainScrollPos, true);
						_mainScrollShifted = newMainScrollPos === _startMainScrollPos.x ? false : true;
					}
					if (_currPanBounds.min.x !== _currPanBounds.max.x) {
						if (newPanPos !== undefined) {
							_panOffset.x = newPanPos;
						} else if (!_mainScrollShifted) {
							_panOffset.x += delta.x * panFriction;
						}
					}
					return newMainScrollPos !== undefined;
				}
			}

			if (!_mainScrollAnimating && !_mainScrollShifted && _currZoomLevel > self.currItem.fitRatio) {
				_panOffset[axis] += delta[axis] * panFriction;
			}
		},
		// Pointerdown/touchstart/mousedown handler
		_onDragStart = function(e) {

			// Allow dragging only via left mouse button.
			// As this handler is not added in IE8 - we ignore e.which
			//
			// http://www.quirksmode.org/js/events_properties.html
			// https://developer.mozilla.org/en-US/docs/Web/API/event.button
			//if (e.type === 'mousedown' && (e.button > 0 || e.buttons === 0)) return;
			if (e.type === 'pointerdown' && (e.which > 1 || e.ctrlKey)) return; // mine

			//
			if (_initialZoomRunning) {
				e.preventDefault();
				return;
			}
			if (_preventDefaultEventBehaviour(e, true)) e.preventDefault();
			_shout('pointerDown');
			if (_pointerEventEnabled) {
				var pointerIndex = framework.arraySearch(_currPointers, e.pointerId, 'id');
				if (pointerIndex < 0) pointerIndex = _currPointers.length;
				_currPointers[pointerIndex] = {
					x: e.pageX,
					y: e.pageY,
					id: e.pointerId
				};
			}
			var startPointsList = _getTouchPoints(e),
				numPoints = startPointsList.length;
			_currentPoints = null;
			_stopAllAnimations();
			// init drag
			if (!_isDragging || numPoints === 1) {
				_isDragging = _isFirstMove = true;
				framework.bind(window, _upMoveEvents, self);
				_isZoomingIn = _wasOverInitialZoom = _opacityChanged = _verticalDragInitiated = _mainScrollShifted = _moved = _isMultitouch = _zoomStarted = false;

				_direction = null;

				_shout('firstTouchStart', startPointsList);

				_equalizePoints(_startPanOffset, _panOffset);

				_currPanDist.x = _currPanDist.y = 0;
				_equalizePoints(_currPoint, startPointsList[0]);
				_equalizePoints(_startPoint, _currPoint);

				//_equalizePoints(_startMainScrollPos, _mainScrollPos);
				_startMainScrollPos.x = _slideSize.x * _currPositionIndex;

				_posPoints = [{
					x: _currPoint.x,
					y: _currPoint.y
				}];

				_gestureCheckSpeedTime = _gestureStartTime = _getCurrentTime();

				//_mainScrollAnimationEnd(true);
				_calculatePanBounds(_currZoomLevel, true);

				// Start rendering
				_stopDragUpdateLoop();
				_dragUpdateLoop();
			}

			// init zoom
			if (!_isZooming && numPoints > 1 && !_mainScrollAnimating && !_mainScrollShifted) {
				_startZoomLevel = _currZoomLevel;
				_zoomStarted = false; // true if zoom changed at least once

				_isZooming = _isMultitouch = true;
				_currPanDist.y = _currPanDist.x = 0;

				_equalizePoints(_startPanOffset, _panOffset);

				_equalizePoints(p, startPointsList[0]);
				_equalizePoints(p2, startPointsList[1]);

				_findCenterOfPoints(p, p2, _currCenterPoint);

				_midZoomPoint.x = Math.abs(_currCenterPoint.x) - _panOffset.x;
				_midZoomPoint.y = Math.abs(_currCenterPoint.y) - _panOffset.y;
				_currPointsDistance = _startPointsDistance = _calculatePointsDistance(p, p2);
			}
		},
		// Pointermove/touchmove/mousemove handler
		_onDragMove = function(e) {
			//if (_options.preventSwiping) return;
			e.preventDefault();

			if (_pointerEventEnabled) {
				var pointerIndex = framework.arraySearch(_currPointers, e.pointerId, 'id');
				if (pointerIndex > -1) {
					var p = _currPointers[pointerIndex];
					p.x = e.pageX;
					p.y = e.pageY;
				}
			}

			if (_isDragging) {
				var touchesList = _getTouchPoints(e);
				if (!_direction && !_moved && !_isZooming) {
					if (_mainScrollPos.x !== _slideSize.x * _currPositionIndex) {
						// if main scroll position is shifted – direction is always horizontal
						_direction = 'h';
					} else {
						var diff = Math.abs(touchesList[0].x - _currPoint.x) - Math.abs(touchesList[0].y - _currPoint.y);
						// check the direction of movement
						if (Math.abs(diff) >= DIRECTION_CHECK_OFFSET) {
							_direction = diff > 0 ? 'h' : 'v';
							_currentPoints = touchesList;
						}
					}
				} else {
					_currentPoints = touchesList;
				}
			}
		},
		//
		_renderMovement = function() {
			if (!_currentPoints) return;
			var numPoints = _currentPoints.length;
			if (numPoints === 0) return;

			_equalizePoints(p, _currentPoints[0]);

			delta.x = p.x - _currPoint.x;
			delta.y = p.y - _currPoint.y;

			if (_isZooming && numPoints > 1) {
				// Handle behaviour for more than 1 point

				_currPoint.x = p.x;
				_currPoint.y = p.y;

				// check if one of two points changed
				if (!delta.x && !delta.y && _isEqualPoints(_currentPoints[1], p2)) return;

				_equalizePoints(p2, _currentPoints[1]);

				if (!_zoomStarted) {
					_zoomStarted = true;
					//_shout('zoomGestureStarted');
				}

				// Distance between two points
				var pointsDistance = _calculatePointsDistance(p, p2);

				var zoomLevel = _calculateZoomLevel(pointsDistance);

				// slightly over the of initial zoom level
				if (zoomLevel > self.currItem.initialZoomLevel + self.currItem.initialZoomLevel / 15) {
					_wasOverInitialZoom = true;
				}

				// Apply the friction if zoom level is out of the bounds
				var zoomFriction = 1,
					minZoomLevel = _getMinZoomLevel(),
					maxZoomLevel = _getMaxZoomLevel();

				if (zoomLevel < minZoomLevel) {
					if (_options.pinchToClose && !_wasOverInitialZoom && _startZoomLevel <= self.currItem.initialZoomLevel) {
						// fade out background if zooming out
						var minusDiff = minZoomLevel - zoomLevel;
						var percent = 1 - minusDiff / (minZoomLevel / 1.2);

						_applyBgOpacity(percent);
						_shout('onPinchClose', percent);
						_opacityChanged = true;
					} else {
						zoomFriction = (minZoomLevel - zoomLevel) / minZoomLevel;
						if (zoomFriction > 1) {
							zoomFriction = 1;
						}
						zoomLevel = minZoomLevel - zoomFriction * (minZoomLevel / 3);
					}
				} else if (zoomLevel > maxZoomLevel) {
					// 1.5 - extra zoom level above the max. E.g. if max is x6, real max 6 + 1.5 = 7.5
					zoomFriction = (zoomLevel - maxZoomLevel) / (minZoomLevel * 6);
					if (zoomFriction > 1) {
						zoomFriction = 1;
					}
					zoomLevel = maxZoomLevel + zoomFriction * minZoomLevel;
				}

				if (zoomFriction < 0) zoomFriction = 0;

				// distance between touch points after friction is applied
				_currPointsDistance = pointsDistance;

				// _centerPoint - The point in the middle of two pointers
				_findCenterOfPoints(p, p2, _centerPoint);

				// paning with two pointers pressed
				_currPanDist.x += _centerPoint.x - _currCenterPoint.x;
				_currPanDist.y += _centerPoint.y - _currCenterPoint.y;
				_equalizePoints(_currCenterPoint, _centerPoint);

				_panOffset.x = _calculatePanOffset('x', zoomLevel);
				_panOffset.y = _calculatePanOffset('y', zoomLevel);

				_isZoomingIn = zoomLevel > _currZoomLevel;
				_currZoomLevel = zoomLevel;
				_applyCurrentZoomPan();
			} else {
				// handle behaviour for one point (dragging or panning)

				if (!_direction) return;

				if (_isFirstMove) {
					_isFirstMove = false;

					// subtract drag distance that was used during the detection direction

					if (Math.abs(delta.x) >= DIRECTION_CHECK_OFFSET) {
						delta.x -= _currentPoints[0].x - _startPoint.x;
					}

					if (Math.abs(delta.y) >= DIRECTION_CHECK_OFFSET) {
						delta.y -= _currentPoints[0].y - _startPoint.y;
					}
				}

				_currPoint.x = p.x;
				_currPoint.y = p.y;

				// do nothing if pointers position hasn't changed
				if (delta.x === 0 && delta.y === 0) return;

				if (_direction === 'v' && _options.closeOnVerticalDrag) {
					if (!_canPan()) {
						_currPanDist.y += delta.y;
						_panOffset.y += delta.y;

						var opacityRatio = _calculateVerticalDragOpacityRatio();

						_verticalDragInitiated = true;
						_shout('onVerticalDrag', opacityRatio);

						_applyBgOpacity(opacityRatio);
						_applyCurrentZoomPan();
						return;
					}
				}

				_pushPosPoint(_getCurrentTime(), p.x, p.y);

				_moved = true;
				_currPanBounds = self.currItem.bounds;

				var mainScrollChanged = _panOrMoveMainScroll('x', delta);
				if (!mainScrollChanged) {
					_panOrMoveMainScroll('y', delta);

					_roundPoint(_panOffset);
					_applyCurrentZoomPan();
				}
			}
		},
		// Pointerup/pointercancel/touchend/touchcancel/mouseup event handler
		_onDragRelease = function(e) {
			_shout('pointerUp');
			if (_preventDefaultEventBehaviour(e, false)) e.preventDefault();

			var releasePoint;

			if (_pointerEventEnabled) {
				var pointerIndex = framework.arraySearch(_currPointers, e.pointerId, 'id');

				if (pointerIndex > -1) {
					releasePoint = _currPointers.splice(pointerIndex, 1)[0];

					if (navigator.msPointerEnabled) {
						var MSPOINTER_TYPES = {
							4: 'mouse', // event.MSPOINTER_TYPE_MOUSE
							2: 'touch', // event.MSPOINTER_TYPE_TOUCH
							3: 'pen' // event.MSPOINTER_TYPE_PEN
						};
						releasePoint.type = MSPOINTER_TYPES[e.pointerType];

						if (!releasePoint.type) releasePoint.type = e.pointerType || 'mouse';
					} else {
						releasePoint.type = e.pointerType || 'mouse';
					}
				}
			}

			var touchList = _getTouchPoints(e),
				gestureType,
				numPoints = touchList.length;

			if (e.type === 'mouseup') numPoints = 0;

			// Do nothing if there were 3 touch points or more
			if (numPoints === 2) {
				_currentPoints = null;
				return true;
			}

			// if second pointer released
			if (numPoints === 1) {
				_equalizePoints(_startPoint, touchList[0]);
			}

			// pointer hasn't moved, send "tap release" point
			if (numPoints === 0 && !_direction && !_mainScrollAnimating) {
				if (!releasePoint) {
					if (e.type === 'mouseup') {
						releasePoint = {
							x: e.pageX,
							y: e.pageY,
							type: 'mouse'
						};
					} else if (e.changedTouches && e.changedTouches[0]) {
						releasePoint = {
							x: e.changedTouches[0].pageX,
							y: e.changedTouches[0].pageY,
							type: 'touch'
						};
					}
				}
				_shout('touchRelease', e, releasePoint);
			}

			// Difference in time between releasing of two last touch points (zoom gesture)
			var releaseTimeDiff = -1;

			// Gesture completed, no pointers left
			if (numPoints === 0) {
				_isDragging = false;
				framework.unbind(window, _upMoveEvents, self);

				_stopDragUpdateLoop();

				if (_isZooming) {
					// Two points released at the same time
					releaseTimeDiff = 0;
				} else if (_lastReleaseTime !== -1) {
					releaseTimeDiff = _getCurrentTime() - _lastReleaseTime;
				}
			}
			_lastReleaseTime = numPoints === 1 ? _getCurrentTime() : -1;

			gestureType = releaseTimeDiff !== -1 && releaseTimeDiff < 150 ? 'zoom' : 'swipe';

			if (_isZooming && numPoints < 2) {
				_isZooming = false;

				// Only second point released
				if (numPoints === 1) {
					gestureType = 'zoomPointerUp';
				}
				_shout('zoomGestureEnded');
			}

			_currentPoints = null;
			if (!_moved && !_zoomStarted && !_mainScrollAnimating && !_verticalDragInitiated) {
				// nothing to animate
				return;
			}

			_stopAllAnimations();

			if (!_releaseAnimData) {
				_releaseAnimData = _initDragReleaseAnimationData();
			}

			_releaseAnimData.calculateSwipeSpeed('x');

			if (_verticalDragInitiated) {
				var opacityRatio = _calculateVerticalDragOpacityRatio();

				if (opacityRatio < _options.verticalDragRange) {
					self.close();
				} else {
					var initalPanY = _panOffset.y,
						initialBgOpacity = _bgOpacity;

					_animateProp('verticalDrag', 0, 1, 300, framework.easing.cubic.out, function(now) {
						_panOffset.y = (self.currItem.initialPosition.y - initalPanY) * now + initalPanY;

						_applyBgOpacity((1 - initialBgOpacity) * now + initialBgOpacity);
						_applyCurrentZoomPan();
					});

					_shout('onVerticalDrag', 1);
				}

				return;
			}

			// main scroll
			if ((_mainScrollShifted || _mainScrollAnimating) && numPoints === 0) {
				var totalShiftDist = _currPoint.x - _startPoint.x,
					itemChanged = _finishSwipeMainScrollGesture(gestureType, totalShiftDist, _releaseAnimData);
				if (itemChanged) {
					return;
				}
				gestureType = 'zoomPointerUp';
			}

			// prevent zoom/pan animation when main scroll animation runs
			if (_mainScrollAnimating) return;

			// Complete simple zoom gesture (reset zoom level if it's out of the bounds)
			if (gestureType !== 'swipe') {
				_completeZoomGesture();
				return;
			}

			// Complete pan gesture if main scroll is not shifted, and it's possible to pan current image
			if (!_mainScrollShifted && _currZoomLevel > self.currItem.fitRatio) {
				_completePanGesture(_releaseAnimData);
			}
		},
		// Returns object with data about gesture
		// It's created only once and then reused
		_initDragReleaseAnimationData = function() {
			// temp local vars
			var lastFlickDuration, tempReleasePos;

			// s = this
			var s = {
				lastFlickOffset: {},
				lastFlickDist: {},
				lastFlickSpeed: {},
				slowDownRatio: {},
				slowDownRatioReverse: {},
				speedDecelerationRatio: {},
				speedDecelerationRatioAbs: {},
				distanceOffset: {},
				backAnimDestination: {},
				backAnimStarted: {},
				calculateSwipeSpeed: function(axis) {
					if (_posPoints.length > 1) {
						lastFlickDuration = _getCurrentTime() - _gestureCheckSpeedTime + 50;
						tempReleasePos = _posPoints[_posPoints.length - 2][axis];
					} else {
						lastFlickDuration = _getCurrentTime() - _gestureStartTime; // total gesture duration
						tempReleasePos = _startPoint[axis];
					}
					s.lastFlickOffset[axis] = _currPoint[axis] - tempReleasePos;
					s.lastFlickDist[axis] = Math.abs(s.lastFlickOffset[axis]);
					if (s.lastFlickDist[axis] > 20) {
						s.lastFlickSpeed[axis] = s.lastFlickOffset[axis] / lastFlickDuration;
					} else {
						s.lastFlickSpeed[axis] = 0;
					}
					if (Math.abs(s.lastFlickSpeed[axis]) < 0.1) {
						s.lastFlickSpeed[axis] = 0;
					}

					s.slowDownRatio[axis] = 0.95;
					s.slowDownRatioReverse[axis] = 1 - s.slowDownRatio[axis];
					s.speedDecelerationRatio[axis] = 1;
				},

				calculateOverBoundsAnimOffset: function(axis, speed) {
					if (!s.backAnimStarted[axis]) {
						if (_panOffset[axis] > _currPanBounds.min[axis]) {
							s.backAnimDestination[axis] = _currPanBounds.min[axis];
						} else if (_panOffset[axis] < _currPanBounds.max[axis]) {
							s.backAnimDestination[axis] = _currPanBounds.max[axis];
						}

						if (s.backAnimDestination[axis] !== undefined) {
							s.slowDownRatio[axis] = 0.7;
							s.slowDownRatioReverse[axis] = 1 - s.slowDownRatio[axis];
							if (s.speedDecelerationRatioAbs[axis] < 0.05) {
								s.lastFlickSpeed[axis] = 0;
								s.backAnimStarted[axis] = true;

								_animateProp(
									'bounceZoomPan' + axis,
									_panOffset[axis],
									s.backAnimDestination[axis],
									speed || 300,
									framework.easing.sine.out,
									function(pos) {
										_panOffset[axis] = pos;
										_applyCurrentZoomPan();
									}
								);
							}
						}
					}
				},

				// Reduces the speed by slowDownRatio (per 10ms)
				calculateAnimOffset: function(axis) {
					if (!s.backAnimStarted[axis]) {
						s.speedDecelerationRatio[axis] =
							s.speedDecelerationRatio[axis] *
							(s.slowDownRatio[axis] + s.slowDownRatioReverse[axis] - (s.slowDownRatioReverse[axis] * s.timeDiff) / 10);

						s.speedDecelerationRatioAbs[axis] = Math.abs(s.lastFlickSpeed[axis] * s.speedDecelerationRatio[axis]);
						s.distanceOffset[axis] = s.lastFlickSpeed[axis] * s.speedDecelerationRatio[axis] * s.timeDiff;
						_panOffset[axis] += s.distanceOffset[axis];
					}
				},

				panAnimLoop: function() {
					if (_animations.zoomPan) {
						_animations.zoomPan.raf = _requestAF(s.panAnimLoop);

						s.now = _getCurrentTime();
						s.timeDiff = s.now - s.lastNow;
						s.lastNow = s.now;

						s.calculateAnimOffset('x');
						s.calculateAnimOffset('y');

						_applyCurrentZoomPan();

						s.calculateOverBoundsAnimOffset('x');
						s.calculateOverBoundsAnimOffset('y');

						if (s.speedDecelerationRatioAbs.x < 0.05 && s.speedDecelerationRatioAbs.y < 0.05) {
							// round pan position
							_panOffset.x = Math.round(_panOffset.x);
							_panOffset.y = Math.round(_panOffset.y);
							_applyCurrentZoomPan();

							_stopAnimation('zoomPan');
							return;
						}
					}
				}
			};
			return s;
		},
		_completePanGesture = function(animData) {
			// calculate swipe speed for Y axis (paanning)
			animData.calculateSwipeSpeed('y');

			_currPanBounds = self.currItem.bounds;

			animData.backAnimDestination = {};
			animData.backAnimStarted = {};

			// Avoid acceleration animation if speed is too low
			if (Math.abs(animData.lastFlickSpeed.x) <= 0.05 && Math.abs(animData.lastFlickSpeed.y) <= 0.05) {
				animData.speedDecelerationRatioAbs.x = animData.speedDecelerationRatioAbs.y = 0;

				// Run pan drag release animation. E.g. if you drag image and release finger without momentum.
				animData.calculateOverBoundsAnimOffset('x');
				animData.calculateOverBoundsAnimOffset('y');
				return true;
			}

			// Animation loop that controls the acceleration after pan gesture ends
			_registerStartAnimation('zoomPan');
			animData.lastNow = _getCurrentTime();
			animData.panAnimLoop();
		},
		_finishSwipeMainScrollGesture = function(gestureType, totalShiftDist, _releaseAnimData) {
			_o.popup.caption_transition_delay = 0;
			var itemChanged;
			if (!_mainScrollAnimating) {
				_currZoomedItemIndex = _currentItemIndex;
			}

			var itemsDiff;

			if (gestureType === 'swipe') {
				var isFastLastFlick = _releaseAnimData.lastFlickDist.x < 10;

				// if container is shifted for more than MIN_SWIPE_DISTANCE,
				// and last flick gesture was in right direction
				if (totalShiftDist > MIN_SWIPE_DISTANCE && (isFastLastFlick || _releaseAnimData.lastFlickOffset.x > 20)) {
					// go to prev item
					itemsDiff = -1;
				} else if (totalShiftDist < -MIN_SWIPE_DISTANCE && (isFastLastFlick || _releaseAnimData.lastFlickOffset.x < -20)) {
					// go to next item
					itemsDiff = 1;
				}
			}

			var nextCircle;

			if (itemsDiff) {
				_currentItemIndex += itemsDiff;

				if (_currentItemIndex < 0) {
					_currentItemIndex = _options.loop ? _getNumItems() - 1 : 0;
					nextCircle = true;
				} else if (_currentItemIndex >= _getNumItems()) {
					_currentItemIndex = _options.loop ? 0 : _getNumItems() - 1;
					nextCircle = true;
				}

				if (!nextCircle || _options.loop) {
					_indexDiff += itemsDiff;
					_currPositionIndex -= itemsDiff;
					itemChanged = true;
				}
			}

			var animateToX = _slideSize.x * _currPositionIndex;
			var animateToDist = Math.abs(animateToX - _mainScrollPos.x);
			var finishAnimDuration;

			if (!itemChanged && animateToX > _mainScrollPos.x !== _releaseAnimData.lastFlickSpeed.x > 0) {
				// "return to current" duration, e.g. when dragging from slide 0 to -1
				finishAnimDuration = 333;
			} else {
				finishAnimDuration = Math.abs(_releaseAnimData.lastFlickSpeed.x) > 0 ? Math.max(Math.min(animateToDist / Math.abs(_releaseAnimData.lastFlickSpeed.x), 400), 250) : 333;
				/*finishAnimDuration = Math.abs(_releaseAnimData.lastFlickSpeed.x) > 0 ? animateToDist / Math.abs(_releaseAnimData.lastFlickSpeed.x) : 333;
				finishAnimDuration = Math.min(finishAnimDuration, 400);
				finishAnimDuration = Math.max(finishAnimDuration, 250);*/
			}

			if (_currZoomedItemIndex === _currentItemIndex) {
				itemChanged = false;
			}

			_mainScrollAnimating = true;

			//_shout('mainScrollAnimStart');
			if(itemChanged) _o.popup.toggle_timer(false);

			_animateProp(
				'mainScroll',
				_mainScrollPos.x,
				animateToX,
				finishAnimDuration,
				framework.easing.cubic.out,
				_moveMainScroll,
				function() {
					_stopAllAnimations();
					_mainScrollAnimating = false;
					_currZoomedItemIndex = -1;

					if (itemChanged || _currZoomedItemIndex !== _currentItemIndex) {
						self.updateCurrItem();
					}

					_shout('mainScrollAnimComplete');
				}
			);

			if (itemChanged) self.updateCurrItem(true);
			return itemChanged;
		},
		_calculateZoomLevel = function(touchesDistance) {
			return (1 / _startPointsDistance) * touchesDistance * _startZoomLevel;
		},
		// Resets zoom if it's out of bounds
		_completeZoomGesture = function() {
			var destZoomLevel = _currZoomLevel,
				minZoomLevel = _getMinZoomLevel(),
				maxZoomLevel = _getMaxZoomLevel();

			if (_currZoomLevel < minZoomLevel) {
				destZoomLevel = minZoomLevel;
			} else if (_currZoomLevel > maxZoomLevel) {
				destZoomLevel = maxZoomLevel;
			}

			var destOpacity = 1,
				onUpdate,
				initialOpacity = _bgOpacity;

			if (_opacityChanged && !_isZoomingIn && !_wasOverInitialZoom && _currZoomLevel < minZoomLevel) {
				//_closedByScroll = true;
				self.close();
				return true;
			}

			if (_opacityChanged) {
				onUpdate = function(now) {
					_applyBgOpacity((destOpacity - initialOpacity) * now + initialOpacity);
				};
			}

			self.zoomTo(destZoomLevel, 0, 200, framework.easing.cubic.out, onUpdate);
			return true;
		};

	_registerModule('Gestures', {
		publicMethods: {
			initGestures: function() {
				// helper function that builds touch/pointer/mouse events
				var addEventNames = function(pref, down, move, up, cancel) {
					_dragStartEvent = pref + down;
					_dragMoveEvent = pref + move;
					_dragEndEvent = pref + up;
					_dragCancelEvent = cancel ? pref + cancel : '';
				};

				_pointerEventEnabled = _features.pointerEvent;
				if (_pointerEventEnabled && _features.touch) {
					// we don't need touch events, if browser supports pointer events
					_features.touch = false;
				}

				if (_pointerEventEnabled) {
					addEventNames('pointer', 'down', 'move', 'up', 'cancel');
				} else if (_features.touch) {
					addEventNames('touch', 'start', 'move', 'end', 'cancel');
					_likelyTouchDevice = true;
				} else {
					addEventNames('mouse', 'down', 'move', 'up');
				}

				_upMoveEvents = _dragMoveEvent + ' ' + _dragEndEvent + ' ' + _dragCancelEvent;
				_downEvents = _dragStartEvent;

				if (_pointerEventEnabled && !_likelyTouchDevice) {
					_likelyTouchDevice = tests.is_touch;
					//_likelyTouchDevice = (navigator.maxTouchPoints > 1) || (navigator.msMaxTouchPoints > 1);
				}
				// make variable public
				self.likelyTouchDevice = _likelyTouchDevice;

				_globalEventHandlers[_dragStartEvent] = _onDragStart;
				_globalEventHandlers[_dragMoveEvent] = _onDragMove;
				_globalEventHandlers[_dragEndEvent] = _onDragRelease; // the Kraken

				if (_dragCancelEvent) {
					_globalEventHandlers[_dragCancelEvent] = _globalEventHandlers[_dragEndEvent];
				}

				// Bind mouse events on device with detected hardware touch support, in case it supports multiple types of input.
				//if (_features.touch) {
				if (_features.dual_input) { // mine
					_downEvents += ' mousedown';
					_upMoveEvents += ' mousemove mouseup';
					_globalEventHandlers.mousedown = _globalEventHandlers[_dragStartEvent];
					_globalEventHandlers.mousemove = _globalEventHandlers[_dragMoveEvent];
					_globalEventHandlers.mouseup = _globalEventHandlers[_dragEndEvent];
				}

				if (!_likelyTouchDevice) {
					// don't allow pan to next slide from zoomed state on Desktop
					_options.allowPanToNext = false;
				}
			}
		}
	});


	// show-hide-transition
	var _showOrHideTimeout,
		_showOrHide = function(item, img, out, completeFn) {
			if (_showOrHideTimeout) clearTimeout(_showOrHideTimeout);

			_initialZoomRunning = true;
			_initialContentSet = true;

			// dimensions of small thumbnail {x:,y:,w:}.
			// Height is optional, as calculated based on large image.
			var thumbBounds;
			if (item.initialLayout) {
				thumbBounds = item.initialLayout;
				item.initialLayout = null;
			} else {
				thumbBounds = _options.getThumbBoundsFn && _options.getThumbBoundsFn(_currentItemIndex, out);
			}

			// Don't animate "out" when picture was dragged vertically
			// otherwise use configured in/out duration
			/*var duration;
			if ((_verticalDragInitiated || _zoomStarted) && out) {
				duration = 0;
			} else {
				duration = out ? _options.hideAnimationDuration : _options.showAnimationDuration;
			}*/
			var duration = out ? _options.hideAnimationDuration : _options.showAnimationDuration;

			//
			var onComplete = function() {
				_stopAnimation('initialZoom');
				if (!out) {
					_applyBgOpacity(1);
					if (img) img.style.display = 'block';
					template.classList.add('pswp--animated-in');
				} else {
					self.template.removeAttribute('style');
					//_o.popup.bg.removeAttribute('style');
					_o.popup.bg.style.removeProperty('opacity');
				}
				_shout('initialZoom' + (out ? 'OutEnd' : 'InEnd'));
				if (completeFn) completeFn();
				_initialZoomRunning = false;
			};

			// if bounds aren't provided, just open gallery without animation
			if (!duration || !thumbBounds || thumbBounds.x === undefined) {
				_shout('initialZoom' + (out ? 'Out' : 'In'));

				if (!out) {
					_currZoomLevel = item.initialZoomLevel;
					_equalizePoints(_panOffset, item.initialPosition);
					_applyCurrentZoomPan();
					template.style.opacity = 1;
					_applyBgOpacity(1);
				} else {
					template.style.opacity = 0;
				}

				if (duration) {
					setTimeout(function() {
						onComplete();
					}, duration);
				} else {
					onComplete();
				}
				return;
			}

			// get_clip_path / calculatate % difference between cropped img element and actual image dimensions for zoom in/out
			let get_clip_path = () => {
				// clicked img should be stored in thumbBounds from getThumbBoundsFn()
				if(!thumbBounds || !thumbBounds.img) return; // die if !img_el || !thumbBounds || !thumbBounds.img
				let w = thumbBounds.img.offsetWidth; // get real image width
				let h = thumbBounds.img.offsetHeight; // get real image height
				if(!w || !h) return; // die if !width or !height / just in case
				let x = Math.max(((thumbBounds.w - w) / thumbBounds.w * 50), 0); // % difference between thumbBounds and img_el width
				let y = Math.max(((thumbBounds.h - h) / thumbBounds.h * 50), 0); // % difference between thumbBounds and img_el height
				if(x < 1 && y < 1) return; // die if difference is < 1% / pointless transition
				return { x, y }; // return x, y % as object to feed to --clip-apth
			}
			// set --clip-path vars on .pswp__zoom-wrap, so it affects both .pswp__img inside
			let set_clip_path = (c) => {
				// longer duration on open, looks cool / close duration must match zoomOut $hide-transition-duration
				_currZoomElementStyle.setProperty('--clip-path-transition-duration', out ? '0.333s' : '0.433s');
				// assign inset percentage properties
				_currZoomElementStyle.setProperty('--clip-path', `inset(${ c ? `${ c.y }% ${ c.x }%` : '0% 0%'})`);
			}

			//
			var startAnimation = function() {
				var closeWithRaf = _closedByScroll,
					fadeEverything = !self.currItem.src || self.currItem.loadError || _options.showHideOpacity;

				// apply hw-acceleration to image
				if (item.miniImg) {
					item.miniImg.style.webkitBackfaceVisibility = 'hidden';
				}

				if (!out) {
					_currZoomLevel = thumbBounds.w / item.w;
					_panOffset.x = thumbBounds.x;
					_panOffset.y = thumbBounds.y - _initalWindowScrollY;
					_o.popup[fadeEverything ? 'pswp' : 'bg'].style.opacity = 0.001;
					_applyCurrentZoomPan();
				}

				// get clip-path values for animating cropped thumbnails (imagelist, blocks, grid, rows (sometimes))
				let clip_path = get_clip_path(); // store value, must assign inside _showOrHideTimeout()
				if(clip_path) set_clip_path(out ? 0 : clip_path); // in start at clip_path, out start at 0

				//
				_registerStartAnimation('initialZoom');

				if (out && !closeWithRaf) template.classList.remove('pswp--animated-in');

				if (fadeEverything) {
					if (out) {
						framework.toggle_class(template, 'pswp--animate_opacity', !closeWithRaf);
					} else {
						setTimeout(function() {
							template.classList.add('pswp--animate_opacity');
						}, 30);
					}
				}

				_showOrHideTimeout = setTimeout(
					function() {
						_shout('initialZoom' + (out ? 'Out' : 'In'));

						// in animate to 0, out animate to clip_path
						if(clip_path) set_clip_path(out ? clip_path : 0);

						//
						if (!out) {
							// "in" animation always uses CSS transitions (instead of rAF).
							// CSS transition work faster here,
							// as developer may also want to animate other things,
							// like ui on top of sliding area, which can be animated just via CSS

							_currZoomLevel = item.initialZoomLevel;
							_equalizePoints(_panOffset, item.initialPosition);
							_applyCurrentZoomPan();
							_applyBgOpacity(1);

							if (fadeEverything) {
								template.style.opacity = 1;
							} else {
								_applyBgOpacity(1);
							}

							_showOrHideTimeout = setTimeout(onComplete, duration + 20);
						} else {
							// "out" animation uses rAF only when PhotoSwipe is closed by browser scroll, to recalculate position
							var destZoomLevel = thumbBounds.w / item.w,
								initialPanOffset = {
									x: _panOffset.x,
									y: _panOffset.y
								},
								initialZoomLevel = _currZoomLevel,
								initalBgOpacity = _bgOpacity,
								onUpdate = function(now) {
									if (now === 1) {
										_currZoomLevel = destZoomLevel;
										_panOffset.x = thumbBounds.x;
										_panOffset.y = thumbBounds.y - _currentWindowScrollY;
									} else {
										_currZoomLevel = (destZoomLevel - initialZoomLevel) * now + initialZoomLevel;
										_panOffset.x = (thumbBounds.x - initialPanOffset.x) * now + initialPanOffset.x;
										_panOffset.y = (thumbBounds.y - _currentWindowScrollY - initialPanOffset.y) * now + initialPanOffset.y;
									}

									_applyCurrentZoomPan();
									if (fadeEverything) {
										template.style.opacity = 1 - now;
									} else {
										_applyBgOpacity(initalBgOpacity - now * initalBgOpacity);
									}
								};

							if (closeWithRaf) {
								_animateProp('initialZoom', 0, 1, duration, framework.easing.cubic.out, onUpdate, onComplete);
							} else {
								onUpdate(1);
								_showOrHideTimeout = setTimeout(onComplete, duration + 20);
							}
						}
					},
					//out ? 25 : 90
					out ? 10 : 20 // mime
				); // Main purpose of this delay is to give browser time to paint and
				// create composite layers of PhotoSwipe UI parts (background, controls, caption, arrows).
				// Which avoids lag at the beginning of scale transition.
			};
			startAnimation();
		};


	// items-controller
	var _items,
		_tempPanAreaSize = {},
		_imagesToAppendPool = [],
		_initialContentSet,
		_initialZoomRunning,
		_controllerDefaultOptions = {
			index: 0,
			errorMsg: '<div class="pswp__error-msg"><a href="%url%" target="_blank">The image</a> could not be loaded.</div>',
			preload: [1, 1],
			getNumItemsFn: function() {
				return _items.length;
			}
		};

	var _getItemAt,
		_getNumItems,
		_initialIsLoop,
		_getZeroBounds = function() {
			return {
				center: { x: 0, y: 0 },
				max: { x: 0, y: 0 },
				min: { x: 0, y: 0 }
			};
		},
		_calculateSingleItemPanBounds = function(item, realPanElementW, realPanElementH) {
			var bounds = item.bounds;

			// position of element when it's centered
			bounds.center.x = Math.round((_tempPanAreaSize.x - realPanElementW) / 2);
			bounds.center.y = Math.round((_tempPanAreaSize.y - realPanElementH) / 2);// + item.vGap.top;

			// maximum pan position
			bounds.max.x = realPanElementW > _tempPanAreaSize.x ? Math.round(_tempPanAreaSize.x - realPanElementW) : bounds.center.x;

			bounds.max.y =
				realPanElementH > _tempPanAreaSize.y ? Math.round(_tempPanAreaSize.y - realPanElementH)/* + item.vGap.top */: bounds.center.y;

			// minimum pan position
			bounds.min.x = realPanElementW > _tempPanAreaSize.x ? 0 : bounds.center.x;
			bounds.min.y = realPanElementH > _tempPanAreaSize.y ? /*item.vGap.top*/0 : bounds.center.y;
		},
		_calculateItemSize = function(item, viewportSize, zoomLevel) {
			if (item.src && !item.loadError) {
				var isInitial = !zoomLevel;

				/*if (isInitial) {
					_shout('parseVerticalMargin', item);
				}*/

				_tempPanAreaSize.x = viewportSize.x;
				_tempPanAreaSize.y = viewportSize.y;// - item.vGap.top - item.vGap.bottom;

				if (isInitial) {
					var hRatio = _tempPanAreaSize.x / item.w;
					var vRatio = _tempPanAreaSize.y / item.h;

					item.fitRatio = hRatio < vRatio ? hRatio : vRatio;

					zoomLevel = item.fitRatio;
					if (zoomLevel > 1) zoomLevel = 1;

					item.initialZoomLevel = zoomLevel;

					if (!item.bounds) {
						// reuse bounds object
						item.bounds = _getZeroBounds();
					}
				}

				if (!zoomLevel) return;

				_calculateSingleItemPanBounds(item, item.w * zoomLevel, item.h * zoomLevel);

				if (isInitial && zoomLevel === item.initialZoomLevel) {
					item.initialPosition = item.bounds.center;
				}

				return item.bounds;
			} else {
				item.w = item.h = 0;
				item.initialZoomLevel = item.fitRatio = 1;
				item.bounds = _getZeroBounds();
				item.initialPosition = item.bounds.center;

				// if it's not image, we return zero bounds (content is not zoomable)
				return item.bounds;
			}
		},
		_appendImage = function(index, item, baseDiv, img, preventAnimation, keepPlaceholder) {
			if (item.loadError) return;
			if (img) {
				item.imageAppended = true;
				_setImageSize(item, img, item === self.currItem && _renderMaxResolution);

				baseDiv.appendChild(img);

				if (keepPlaceholder) {
					setTimeout(function() {
						if (item && item.loaded && item.placeholder) {
							item.placeholder.style.display = 'none';
							item.placeholder = null;
						}
					}, 500);
				}
			}
		},
		_preloadImage = function(item) {
			item.loading = true;
			item.loaded = false;
			var img = (item.img = framework.createEl('pswp__img', 'img'));
			var onComplete = function() {
				item.loading = false;
				item.loaded = true;

				// set natural image size // doesn't work?
				/*if (item.autoSize) {
					item.w = img.naturalWidth;
					item.h = img.naturalHeight;
					item.autoSize = false;
					self.updateSize();
				}*/

				if (item.loadComplete) {
					item.loadComplete(item);
				} else {
					item.img = null; // no need to store image object
				}
				img.onload = img.onerror = null;
				img = null;
			};
			img.onload = onComplete;
			img.onerror = function() {
				item.loadError = true;
				onComplete();
			};
			img.src = item.src; // + '?a=' + Math.random();
			return img;
		},
		_checkForError = function(item, cleanUp) {
			if (item.src && item.loadError && item.container) {
				if (cleanUp) framework.resetEl(item.container);
				item.container.innerHTML = _options.errorMsg.replace('%url%', item.src);
				return true;
			}
		},
		_setImageSize = function(item, img, maxRes) {
			if (!item.src) return;
			//if (!img) img = item.container.lastChild;
			if (!img) img = item.container.lastElementChild;

			var w = maxRes ? item.w : Math.round(item.w * item.fitRatio),
				h = maxRes ? item.h : Math.round(item.h * item.fitRatio);

			// ensure correct aspect ratio
			// todo: not sure if we need this junk. Is it related to loading images with unknown size?
			/*if (img.naturalHeight && img.naturalWidth) {
				var newHeight = w * (img.naturalHeight / img.naturalWidth);
				if (newHeight > h) {
					var newWidth = h * (img.naturalWidth / img.naturalHeight);
					img.style.marginLeft = (w - newWidth) / 2 + 'px';
					w = newWidth;
				} else {
					img.style.marginTop = (h - newHeight) / 2 + 'px';
					h = newHeight;
				}
			}*/

			if (item.placeholder && !item.loaded) {
				item.placeholder.style.width = w + 'px';
				item.placeholder.style.height = h + 'px';
			}

			img.style.width = w + 'px';
			img.style.height = h + 'px';
		},
		_appendImagesPool = function() {
			if (_imagesToAppendPool.length) {
				var poolItem;

				for (var i = 0; i < _imagesToAppendPool.length; i++) {
					poolItem = _imagesToAppendPool[i];
					if (poolItem.holder.index === poolItem.index) {
						_appendImage(poolItem.index, poolItem.item, poolItem.baseDiv, poolItem.img, false, poolItem.clearPlaceholder);
					}
				}
				_imagesToAppendPool = [];
			}
		};

	_registerModule('Controller', {
		publicMethods: {
			lazyLoadItem: function(index) {
				index = _getLoopedId(index);
				var item = _getItemAt(index);

				if (!item || ((item.loaded || item.loading) && !_itemsNeedUpdate)) {
					return;
				}

				_shout('gettingData', index, item);

				if (!item.src) {
					return;
				}

				_preloadImage(item);
			},
			initController: function() {
				framework.copy_unique(_options, _controllerDefaultOptions);
				self.items = _items = items;
				_getItemAt = self.getItemAt;
				_getNumItems = _options.getNumItemsFn; //self.getNumItems;

				_initialIsLoop = _options.loop;
				if (_getNumItems() < 3) {
					_options.loop = false; // disable loop if less then 3 items
				}

				_listen('beforeChange', function(diff) {
					var p = _options.preload,
						isNext = diff === null ? true : diff >= 0,
						preloadBefore = Math.min(p[0], _getNumItems()),
						preloadAfter = Math.min(p[1], _getNumItems()),
						i;

					for (i = 1; i <= (isNext ? preloadAfter : preloadBefore); i++) {
						self.lazyLoadItem(_currentItemIndex + i);
					}
					for (i = 1; i <= (isNext ? preloadBefore : preloadAfter); i++) {
						self.lazyLoadItem(_currentItemIndex - i);
					}
				});

				_listen('initialLayout', function() {
					self.currItem.initialLayout = _options.getThumbBoundsFn && _options.getThumbBoundsFn(_currentItemIndex);
				});

				_listen('mainScrollAnimComplete', _appendImagesPool);
				_listen('initialZoomInEnd', _appendImagesPool);

				_listen('destroy', function() {
					var item;
					for (var i = 0; i < _items.length; i++) {
						item = _items[i];
						// remove reference to DOM elements, for GC
						if (item.container) {
							item.container = null;
						}
						if (item.placeholder) {
							item.placeholder = null;
						}
						if (item.img) {
							item.img = null;
						}
						if (item.preloader) {
							item.preloader = null;
						}
						if (item.loadError) {
							item.loaded = item.loadError = false;
						}
					}
					_imagesToAppendPool = null;
				});
			},

			getItemAt: function(index) {
				if (index >= 0) {
					var item = _items[index] !== undefined ? _items[index] : false;
					return item;
				}
				return false;
			},

			/*allowProgressiveImg: function() {
				// 1. Progressive image loading isn't working on webkit/blink
				//    when hw-acceleration (e.g. translateZ) is applied to IMG element.
				//    That's why in PhotoSwipe parent element gets zoom transform, not image itself.
				//
				// 2. Progressive image loading sometimes blinks in webkit/blink when applying animation to parent element.
				//    That's why it's disabled on touch devices (mainly because of swipe transition)
				//
				// 3. Progressive image loading sometimes doesn't work in IE (up to 11).

				// Don't allow progressive loading on non-large touch devices
				return _options.forceProgressiveLoading || !_likelyTouchDevice || _options.mouseUsed || screen.width > 1200;
				// 1200 - to eliminate touch devices with large screen (like Chromebook Pixel)
			},*/

			setContent: function(holder, index) {
				if (_options.loop) index = _getLoopedId(index);

				var prevItem = self.getItemAt(holder.index);
				if (prevItem) prevItem.container = null;

				var item = self.getItemAt(index),
					img;

				if (!item) {
					framework.resetEl(holder.el);
					return;
				}

				// allow to override data
				_shout('gettingData', index, item);

				holder.index = index;
				holder.item = item;

				// base container DIV is created only once for each of 3 holders
				var baseDiv = (item.container = framework.createEl('pswp__zoom-wrap'));

				if (!item.src && item.html) {
					if (item.html.tagName) {
						baseDiv.appendChild(item.html);
					} else {
						baseDiv.innerHTML = item.html;
					}
				}

				_checkForError(item);

				_calculateItemSize(item, _viewportSize);

				if (item.src && !item.loadError && !item.loaded) {
					item.loadComplete = function(item) {
						// gallery closed before image finished loading
						if (!_isOpen) {
							return;
						}

						// check if holder hasn't changed while image was loading
						if (holder && holder.index === index) {
							if (_checkForError(item, true)) {
								item.loadComplete = item.img = null;
								_calculateItemSize(item, _viewportSize);
								_applyZoomPanToItem(item);

								if (holder.index === _currentItemIndex) {
									// recalculate dimensions
									self.updateCurrZoomItem();
								}
								return;
							}
							if (!item.imageAppended) {
								if (_mainScrollAnimating || _initialZoomRunning) {
									_imagesToAppendPool.push({
										item: item,
										baseDiv: baseDiv,
										img: item.img,
										index: index,
										holder: holder,
										clearPlaceholder: true
									});
								} else {
									_appendImage(index, item, baseDiv, item.img, _mainScrollAnimating || _initialZoomRunning, true);
								}
							} else {
								// remove preloader & mini-img
								if (!_initialZoomRunning && item.placeholder) {
									item.placeholder.style.display = 'none';
									item.placeholder = null;
								}
							}
						}

						item.loadComplete = null;
						item.img = null; // no need to store image element after it's added

						_shout('imageLoadComplete', index, item);
					};

					// msrc / only use if msrc !== src || _initialContentSet (first opening image zoom)
					var use_msrc = item.msrc && (item.msrc !== item.src || !_initialContentSet),
							placeholder = framework.createEl('pswp__img pswp__img--placeholder' + (use_msrc ? '' : ' pswp__img--placeholder--blank'), use_msrc ? 'img' : '');
					if (use_msrc) placeholder.src = item.msrc;

					_setImageSize(item, placeholder);

					baseDiv.appendChild(placeholder);
					item.placeholder = placeholder;

					if (!item.loading) {
						_preloadImage(item);
					}

					//if (self.allowProgressiveImg()) {
						// just append image
						if (!_initialContentSet) {
							_imagesToAppendPool.push({
								item: item,
								baseDiv: baseDiv,
								img: item.img,
								index: index,
								holder: holder
							});
						} else {
							_appendImage(index, item, baseDiv, item.img, true, true);
						}
					//}
				} else if (item.src && !item.loadError) {
					// image object is created every time, due to bugs of image loading & delay when switching images
					img = framework.createEl('pswp__img', 'img');
					img.style.opacity = 1;
					img.src = item.src;
					_setImageSize(item, img);
					_appendImage(index, item, baseDiv, img, true);
				}

				if (!_initialContentSet && index === _currentItemIndex) {
					_currZoomElementStyle = baseDiv.style;
					_showOrHide(item, img || item.img);
				} else {
					_applyZoomPanToItem(item);
				}

				framework.resetEl(holder.el);
				holder.el.appendChild(baseDiv);
			},

			cleanSlide: function(item) {
				if (item.img) {
					item.img.onload = item.img.onerror = null;
				}
				item.loaded = item.loading = item.img = item.imageAppended = false;
			}
		}
	});


	// tap
	var tapTimer,
		tapReleasePoint = {},
		_dispatchTapEvent = function(origEvent, releasePoint, pointerType) {
			var e = document.createEvent('CustomEvent'),
				eDetail = {
					origEvent: origEvent,
					pointerType: pointerType || 'touch',
					releasePoint: releasePoint,
					target: origEvent.target,
					rightClick: pointerType === 'mouse' && origEvent.which === 3
				};

			e.initCustomEvent('pswpTap', true, true, eDetail);
			origEvent.target.dispatchEvent(e);
		};

	_registerModule('Tap', {
		publicMethods: {
			initTap: function() {
				_listen('firstTouchStart', self.onTapStart);
				_listen('touchRelease', self.onTapRelease);
				_listen('destroy', function() {
					tapReleasePoint = {};
					tapTimer = null;
				});
			},
			onTapStart: function(touchList) {
				if (touchList.length > 1) {
					clearTimeout(tapTimer);
					tapTimer = null;
				}
			},
			onTapRelease: function(e, releasePoint) {
				if (!releasePoint) {
					return;
				}

				// fixed iphone bug / https://github.com/andi34/PhotoSwipe/issues/13
				if (!_moved && !_isMultitouch && !_numAnimations && (!_pointerEventEnabled || _o.popup.container.contains(e.target))) {
					var p0 = releasePoint;
					if (tapTimer) {
						clearTimeout(tapTimer);
						tapTimer = null;

						// Check if taped on the same place
						if (_isNearbyPoints(p0, tapReleasePoint)) {
							_shout('doubleTap', p0);
							return;
						}
					}

					if (releasePoint.type === 'mouse') {
						_dispatchTapEvent(e, releasePoint, 'mouse');
						return;
					}

					// Fix for share buttons zooming image.
					// @see https://github.com/dimsemenov/PhotoSwipe/issues/1198
					if (e.target.tagName === 'A') return;

					// avoid double tap delay on buttons and elements that have class pswp__single-tap
					if (e.target.tagName === 'BUTTON' || e.target.classList.contains('pswp__single-tap')) {
						_dispatchTapEvent(e, releasePoint);
						return;
					}

					_equalizePoints(tapReleasePoint, p0);

					tapTimer = setTimeout(function() {
						_dispatchTapEvent(e, releasePoint);
						tapTimer = null;
					}, 300);
				}
			}
		}
	});


	/*>>tap*/

	// desktop-zoom
	var _wheelDelta;

	_registerModule('DesktopZoom', {
		publicMethods: {
			initDesktopZoom: function() {
				if (tests.is_dual_input) {
					_listen('mouseUsed', function() {
						self.setupDesktopZoom();
					});
				} else if(tests.is_pointer){
					self.setupDesktopZoom(true);
				}
			},

			setupDesktopZoom: function(onInit) {
				_wheelDelta = {};

				var events = 'wheel mousewheel DOMMouseScroll';

				_listen('bindEvents', function() {
					framework.bind(template, events, self.handleMouseWheel);
				});

				_listen('unbindEvents', function() {
					if (_wheelDelta) {
						framework.unbind(template, events, self.handleMouseWheel);
					}
				});

				self.mouseZoomedIn = false;

				var hasDraggingClass,
					updateZoomable = function() {
						if (self.mouseZoomedIn) {
							template.classList.remove('pswp--zoomed-in');
							self.mouseZoomedIn = false;
						}

						framework.toggle_class(template, 'pswp--zoom-allowed', _currZoomLevel < 1);
						removeDraggingClass();
					},
					removeDraggingClass = function() {
						if (hasDraggingClass) {
							template.classList.remove('pswp--dragging');
							hasDraggingClass = false;
						}
					};

				_listen('resize', updateZoomable);
				_listen('afterChange', updateZoomable);
				_listen('pointerDown', function() {
					if (self.mouseZoomedIn) {
						hasDraggingClass = true;
						template.classList.add('pswp--dragging');
					}
				});
				_listen('pointerUp', removeDraggingClass);

				if (!onInit) {
					updateZoomable();
				}
			},

			handleMouseWheel: function(e) {
				if (_currZoomLevel <= self.currItem.fitRatio) {
					if (!_options.closeOnScroll || _numAnimations || _isDragging) {
						e.preventDefault();
					} else if (Math.abs(e.deltaY) > 2) {
						// close PhotoSwipe
						// if browser supports transforms & scroll changed enough
						_closedByScroll = true;
						self.close();
					}
					return true;
				}

				// allow just one event to fire
				e.stopPropagation();

				// https://developer.mozilla.org/en-US/docs/Web/Events/wheel
				_wheelDelta.x = 0;

				if ('deltaX' in e) {
					if (e.deltaMode === 1 /* DOM_DELTA_LINE */ ) {
						// 18 - average line height
						_wheelDelta.x = e.deltaX * 18;
						_wheelDelta.y = e.deltaY * 18;
					} else {
						_wheelDelta.x = e.deltaX;
						_wheelDelta.y = e.deltaY;
					}
				} else if ('wheelDelta' in e) {
					if (e.wheelDeltaX) {
						_wheelDelta.x = -0.16 * e.wheelDeltaX;
					}
					if (e.wheelDeltaY) {
						_wheelDelta.y = -0.16 * e.wheelDeltaY;
					} else {
						_wheelDelta.y = -0.16 * e.wheelDelta;
					}
				} else if ('detail' in e) {
					_wheelDelta.y = e.detail;
				} else {
					return;
				}

				_calculatePanBounds(_currZoomLevel, true);

				var newPanX = _panOffset.x - _wheelDelta.x,
					newPanY = _panOffset.y - _wheelDelta.y;

				// prevent scrolling
				e.preventDefault();

				// TODO: use rAF instead of mousewheel?
				self.panTo(newPanX, newPanY);
			},

			toggleDesktopZoom: function(centerPoint) {
				centerPoint = centerPoint || {
					x: _viewportSize.x / 2 + _offset.x,
					y: _viewportSize.y / 2 + _offset.y
				};

				var doubleTapZoomLevel = _options.getDoubleTapZoom(true, self.currItem);
				var zoomOut = _currZoomLevel === doubleTapZoomLevel;

				self.mouseZoomedIn = !zoomOut;

				self.zoomTo(zoomOut ? self.currItem.initialZoomLevel : doubleTapZoomLevel, centerPoint, 333);
				framework.toggle_class(template, 'pswp--zoomed-in', !zoomOut);
			}
		}
	});


	// history
	var _historyDefaultOptions = {
		history: true
	};

	var _historyUpdateTimeout,
		_hashChangeTimeout,
		_hashAnimCheckTimeout,
		_hashChangedByScript,
		_hashChangedByHistory,
		_hashReseted,
		_initialHash,
		_historyChanged,
		_closedFromURL,
		_urlChangedOnce,
		_windowLoc,
		_getHash = function() {
			return _windowLoc.hash.substring(1);
		},
		_cleanHistoryTimeouts = function() {
			if (_historyUpdateTimeout) {
				clearTimeout(_historyUpdateTimeout);
			}

			if (_hashAnimCheckTimeout) {
				clearTimeout(_hashAnimCheckTimeout);
			}
		},
		_updateHash = function() {
			if (_hashAnimCheckTimeout) {
				clearTimeout(_hashAnimCheckTimeout);
			}

			if (_numAnimations || _isDragging) {
				// changing browser URL forces layout/paint in some browsers, which causes noticable lag during animation
				// that's why we update hash only when no animations running
				_hashAnimCheckTimeout = setTimeout(_updateHash, 500);
				return;
			}

			if (_hashChangedByScript) {
				clearTimeout(_hashChangeTimeout);
			} else {
				_hashChangedByScript = true;
			}

			var pid = _currentItemIndex + 1;
			var item = _getItemAt(_currentItemIndex);
			if (item.hasOwnProperty('pid')) {
				// carry forward any custom pid assigned to the item
				pid = item.pid;
			}
			var newHash = (_initialHash ? _initialHash + '&' : '') + 'pid=' + pid;

			if (!_historyChanged) {
				if (_windowLoc.hash.indexOf(newHash) === -1) {
					_urlChangedOnce = true;
				}
				// first time - add new hisory record, then just replace
			}

			var newURL = _windowLoc.href.split('#')[0] + '#' + newHash;
			if ('#' + newHash !== window.location.hash) {
				history[_historyChanged ? 'replaceState' : 'pushState']('', document.title, newURL);
			}

			_historyChanged = true;
			_hashChangeTimeout = setTimeout(function() {
				_hashChangedByScript = false;
			}, 60);
		};

	_registerModule('History', {
		publicMethods: {
			initHistory: function() {
				framework.copy_unique(_options, _historyDefaultOptions);

				if (!_options.history) {
					return;
				}

				_windowLoc = window.location;
				_urlChangedOnce = false;
				_closedFromURL = false;
				_historyChanged = false;
				_initialHash = _getHash();
				/*if (_initialHash.indexOf('gid=') > -1) {
					_initialHash = _initialHash.split('&gid=')[0];
					_initialHash = _initialHash.split('?gid=')[0];
				}*/

				_listen('afterChange', self.updateURL);
				_listen('unbindEvents', function() {
					framework.unbind(window, 'hashchange', self.onHashChange);
				});

				if (history.scrollRestoration) history.scrollRestoration = 'manual';

				var returnToOriginal = function() {
					_hashReseted = true;
					if (!_closedFromURL) {
						if (_urlChangedOnce) {
							history.back();
						} else {
							if (_initialHash) {
								_windowLoc.hash = _initialHash;
							} else {
								history.pushState('', document.title, _windowLoc.pathname + _windowLoc.search);
							}
						}
					}

					_cleanHistoryTimeouts();
					if (history.scrollRestoration) history.scrollRestoration = 'auto';
				};

				_listen('unbindEvents', function() {
					if (_closedByScroll) {
						// if PhotoSwipe is closed by scroll, we go "back" before the closing animation starts
						// this is done to keep the scroll position
						returnToOriginal();
					}
				});
				_listen('destroy', function() {
					if (!_hashReseted) {
						returnToOriginal();
					}
				});

				var index = _initialHash.indexOf('pid=');
				if (index > -1) {
					_initialHash = _initialHash.substring(0, index);
					if (_initialHash.slice(-1) === '&') {
						_initialHash = _initialHash.slice(0, -1);
					}
				}

				setTimeout(function() {
					if (_isOpen) {
						// hasn't destroyed yet
						framework.bind(window, 'hashchange', self.onHashChange);
					}
				}, 40);
			},
			onHashChange: function() {
				if (_getHash() === _initialHash) {
					_closedFromURL = true;
					self.close();
					return;
				}
				/*if (!_hashChangedByScript) {
					_hashChangedByHistory = true;
					self.goTo(_parseItemIndexFromURL().pid);
					_hashChangedByHistory = false;
				}*/
			},
			updateURL: function() {
				// Delay the update of URL, to avoid lag during transition,
				// and to not to trigger actions like "refresh page sound" or "blinking favicon" to often

				_cleanHistoryTimeouts();

				if (_hashChangedByHistory) {
					return;
				}

				if (!_historyChanged) {
					_updateHash(); // first time
				} else {
					_historyUpdateTimeout = setTimeout(_updateHash, 800);
				}
			}
		}
	});


	/*>>history*/
	Object.assign(self, publicMethods);
};


// sidebar.js

/* CSS

// file cache / hyper cache? / localstorage / object cache
// refresh button?
// cache options and more
// manage cache

close/open on load without anim
remove animations on specific amount
todo: _c.transitions
*/

//
(function () {

	// early exit
	if(!_c.menu_exists) return;

	// elements
	_e.sidebar = _id('sidebar');
	_e.sidebar_inner = _id('sidebar-inner');
	_e.sidebar_menu = _id('sidebar-menu');
	_e.sidebar_toggle = _id('sidebar-toggle');
	_e.sidebar_modal = _id('sidebar-bg');
	_e.sidebar_topbar = _id('sidebar-topbar');

	// vars
	var menu_ls_timeout = false,
			menu_toggle,
			menu_root, has_uls, has_uls_root, has_uls_not_root,
			menu_active = false,
			menu_open = {},
			menu_expanded = false,
			menu_open_ls = _ls.get_json('files:interface:menu-expanded:' + _c.location_hash),
			toggle_duration = 200;//250;

	// sidebar is_open
	let is_open = _c.menu_show && matchMedia('(min-width: 992px)').matches;
	if(!is_open) document.documentElement.classList.add('sidebar-closed');

	// shortcut functions to toggle <li> open/closed class
	const li_open = (li) => li.classList.replace('menu-li-closed', 'menu-li-open');
	const li_close = (li) => li.classList.replace('menu-li-open', 'menu-li-closed');

	// set menu active classes
	function set_menu_active_classes(el, toggle){
		if(!el || !el.isConnected) return;
		el.classList.toggle('menu-active', toggle);
		// menu-active-ancestor moved to CSS :has(.menu-active)
  	/*var ancestor_li = el.parentElement.parentElement.parentElement; // first element to check <li> <- <ul><li><a>
  	while(ancestor_li.nodeName === 'LI') { // element has to be <li class="menu-li">
  		ancestor_li.classList.toggle('menu-active-ancestor', toggle); // toggle class on firstElementChild <a>
      ancestor_li = ancestor_li.parentElement.parentElement; // next el two elements up <li> <- <ul><li>
  	}*/
	}

	// toggle menu loading on get_files
	_f.menu_loading = function(el, toggle){
		if(!el) el = menu_active;
		//if(el) _class('menu-icon-folder', el)[0].classList.toggle('menu-spinner', toggle);
		if(el) el.classList.toggle('menu-spinner', toggle);
	}

	// set menu active
	_f.set_menu_active = function(path){
		var prev_menu_active = menu_active,
				menu_li = _c.dirs[path] ? _c.dirs[path].menu_li : false;
		menu_active = menu_li ? menu_li.firstChild : false;
		if(menu_active == prev_menu_active) return;
		if(prev_menu_active) _f.menu_loading(prev_menu_active, false); // remove loading on abort
		set_menu_active_classes(prev_menu_active, false);
		set_menu_active_classes(menu_active, true);
	}

	// set menu toggle
	function set_menu_toggle(){

		// vars
		let close_timer = false;

		// menu expanded boolean
		menu_expanded = Object.keys(menu_open).length === has_uls.length ? true : false;

		// add menu toggle
		_e.sidebar_topbar.innerHTML = '<button id="menu-toggle" class="button-icon' + (menu_expanded ? ' is-expanded' : '') + '">' + _f.get_svg_icon_multi('plus', 'minus') + '</button>';

		// element
		menu_toggle = _e.sidebar_topbar.lastElementChild;

		// menu toggle click
		_event(menu_toggle, function(e){

			// vars for both expand and collapse
			let no_anim = [], anim = [], below = false, wheight = window.innerHeight;

			// collapse
			if(menu_expanded){

				// loop / only root uls
				looper(has_uls_root, function(li){
					if(!li.classList.contains('menu-li-open')) return;
					if(below){
						no_anim.push(li);
					} else {
						var bounding = li.getBoundingClientRect();
						// doesn't seem legit to use || (bounding.bottom - bounding.top) > wheight * 2
						if(bounding.top > wheight/* || (bounding.bottom - bounding.top) > wheight * 2*/) {
							no_anim.push(li);
							below = true;
						} else {
							anim.push(li);
						}
					}
				});

				// no_anim / close with class
				if(no_anim.length) no_anim.forEach(li => li_close(li));

				// anim / close anime()
				if(anim.length) looper(anim, function(li){
					ul_anime(li, false);
				});

				// close inner uls
				if(close_timer) clearTimeout(close_timer);
				close_timer = setTimeout(() => {
					has_uls_not_root.forEach(li => li_close(li));
				}, anim.length ? toggle_duration + 10 : 10);

			// expand
			} else {

				// assigns expandables to all has_uls
				let expandables = has_uls;

				// if has_uls.length > 100, only expand has_uls_root
				// prevents mass animations on open descendants which doesn't look smooth
				if(has_uls.length > 100) {
					// expandables only [has_uls_root]
					expandables = has_uls_root;
					// open all [has_uls_not_root] / no need to check classList.contains as that seems slower
					has_uls_not_root.forEach(li => li_open(li));
				}

				// loop expandables
				looper(expandables, function(li){
					// skip entirely if already open, so we don't need to do further tests
					if(li.classList.contains('menu-li-open')) return;
					if(below || !li.offsetParent){
						no_anim.push(li);
					} else {
						var bounding = li.getBoundingClientRect();
						if(bounding.top > wheight || li.lastChild.childNodes.length > 50) {
							below = true
							no_anim.push(li);
						} else {
							anim.push(li);
						}
					}
				});

				// no_anim / open with class
				if(no_anim.length) no_anim.forEach(li => li_open(li));

				// anim
				if(anim.length) looper(anim, function(li){
					ul_anime(li, true);
				});
			}

			// menu manager
			menu_open_manager('all', !menu_expanded);
		}, 'click');
	}

	// menu open manager
	function menu_open_manager(li, toggle){

		// expand / collapse
		if(li === 'all') {

			// expand all
			if(toggle) {
				looper(has_uls, function(li){
					menu_open[li.dataset.path] = true;
				});

			// collapse all
			} else {
				menu_open = {};
			}

		// li
		} else {
			var key = li.dataset.path;

			// expand li
			if(toggle) {
				menu_open[key] = true;

			// collapse li
			} else {
				if(menu_open[key]) delete menu_open[key];
			}
		}

		// menu toggle state
		var menu_open_count = Object.keys(menu_open).length,
				is_expanded = menu_open_count === has_uls.length ? true : false;

		// proceed if menu_expanded changes
		if(menu_expanded !== is_expanded) {
			menu_expanded = is_expanded;
			if(tests.is_pointer) menu_toggle.title = lang.get(menu_expanded ? 'collapse menu' : 'expand menu');
			menu_toggle.classList.toggle('is-expanded', menu_expanded);
		}

		// store in localstorage
		if(tests.local_storage) {
			if(menu_ls_timeout) clearTimeout(menu_ls_timeout);
			menu_ls_timeout = setTimeout(function(){
				_ls.set('files:interface:menu-expanded:' + _c.location_hash, (menu_open_count ? JSON.stringify(menu_open) : false), true);
			}, 1000);
		}
	}

	// ul anime
	function ul_anime(li, is_open/*, complete*/){

		// get ul
		var ul = li.lastChild;

		// must be visible before anim
		ul.style.display = 'block';

		// remove existing
		anime.remove(ul);

		// anime ob
		var ob = {
		  targets: ul,
		  //translateY: is_open ? [-5, 0] : -5, //is_open ? [-10, 0] : -10,
			translateY: is_open ? [-2, 0] : -2, //is_open ? [-10, 0] : -10,
		  height: [ul.clientHeight + 'px', !is_open ? 0 : ul.scrollHeight + 'px'],
		  opacity: is_open ? 1 : 0,
			easing: 'cubicBezier(.6,0,.1,1)', // 'easeInOutQuint' // 'easeOutQuint'
		  duration: toggle_duration,
		  complete: () => {
				// remove styles applies by anime, but keep --depth var for CSS indent!
		  	ul.style.cssText = '--depth:' + (li.dataset.level || 0);
		  	//if(complete) complete(); // this isn't used
		  }
		}

		// anime!
		anime(ob);

		// toggle menu-li-open/menu-li-closed classes
		// don't need to wait for anime to complete because style values will override stuff in open/close classes
		if(is_open) return li_open(li);
		li_close(li);
	}

	// toggle button
	_e.sidebar_toggle.innerHTML = _f.get_svg_icon_multi('menu', 'menu_back');

	// toggle sidebar
	function toggle_sidebar(e){
		_f.set_config('menu_show', !_c.menu_show);
		document.documentElement.classList.toggle('sidebar-closed');
		is_open = !is_open;
	}

	// toggle
	_event(_e.sidebar_toggle, toggle_sidebar, 'click');
	_event(_e.sidebar_modal, toggle_sidebar, 'click');

	// html repeat
	function html_repeat(html, amount){
		var output = '';
		for (var i = 0; i < amount; i++) {
			output += html;
		};
		return output;
	}

	// add li
	function add_li(item, has_ul){
		var li_class = 'menu-li',
				a_class = 'menu-a',
				level = item.path ? (item.path.match(/\//g) || []).length + 1 : 0,
				folder_icon = 'folder' + (item.is_readable ? (item.is_link ? '_link' : '') : '_forbid');

		// has_ul
		if(has_ul){
			let ls_open = menu_open_ls && menu_open_ls[item.path];
			li_class += ` has-ul menu-li-${ ls_open ? 'open' : 'closed'}`;
			if(ls_open) menu_open[item.path] = true;

		} else if(!item.is_readable){
			a_class += ' menu-a-forbidden';
		}
		// changed from file_path(item) -> get_href(item) for in-app link
		return `<li data-level="${ level }" data-path="${ html_quotes(item.path) }" class="${ li_class }"><a href="${ get_href(item) }" class="${ a_class }">${ has_ul ? _f.get_svg_icon_multi_class('button-icon menu-icon menu-icon-toggle', 'plus', 'minus') + _f.get_svg_icon_multi_class('menu-icon menu-icon-folder menu-icon-folder-toggle', folder_icon, 'folder_plus', 'folder_minus') : _f.get_svg_icon_class(folder_icon, 'menu-icon menu-icon-folder') }${ html_tags(item.basename) }</a>`;
		//return '<li data-level="' + level + '" data-path="' + html_quotes(item.path) + '" class="' + li_class + '"><a href="' + get_href(item) + '" class="' + a_class + '">' + (has_ul ? _f.get_svg_icon_multi_class('button-icon menu-icon menu-icon-toggle', 'plus', 'minus') : '') + (has_ul ? _f.get_svg_icon_multi_class('menu-icon menu-icon-folder menu-icon-folder-toggle', folder_icon, 'folder_plus', 'folder_minus') : _f.get_svg_icon_class(folder_icon, 'menu-icon menu-icon-folder')) + html_tags(item.basename) + '</a>';
	}

	// menu create segment
	function create_menu_html(dirs){

		// vars
		var html = '',
				current_slashes = 0,
				level = 0,
				last = false;

		//
		//if(!dirs.length) return _e.sidebar_menu.innerHTML = '<ul style="--depth:0" class="menu-root"></ul>';

		// looper
		looper(dirs, function(dir, index){
			var path = dir.path;
			if(!path) return;
			var slashes = (path.match(/\//g) || []).length + 1,
					slash_diff = slashes - current_slashes;
			current_slashes = slashes;
			level += slash_diff;

			// create list item from previous loop if li_end
			if(last) html += add_li(last, slash_diff > 0);

			// create UL if children or end li and ul
			html += slash_diff > 0 ? '<ul style="--depth:' + (level - 1) + '" class="menu-' + (last ? 'ul' : 'root') + '">' : '</li>' + html_repeat('</ul></li>', -slash_diff);

			// prepare last element for next loop
			last = _c.dirs[path];
		});

		// add last li, end ul's and return
		html += add_li(last, false) + html_repeat('</li></ul>', level);

		// LINK
		//if(location.hostname !== atob('ZmlsZXMucGhvdG8uZ2FsbGVyeQ==')) html += atob('PGEgaHJlZj0iaHR0cHM6Ly9maWxlcy5waG90by5nYWxsZXJ5IiBjbGFzcz0iZmlsZXMtbGluayI+ZmlsZXMucGhvdG8uZ2FsbGVyeTwvYT4=');

		// html
		_e.sidebar_menu.innerHTML = html;
	}
	//_f.create_menu_html = create_menu_html;

	// create menu
	function create_menu(dirs, log){

		// license
		_license();

		// log
		_log(log, dirs);

		// add menu dirs to to _c.dirs{} if not already in object
		looper(dirs, (dir) => {
			if(_c.dirs[dir.path]) return; // exit if dir already exists
			_c.dirs[dir.path] = dir; // add to dirs if !exist (from PHP then)
		});

		// sidebar menu innerhtml
		create_menu_html(dirs);

		// global elements
		menu_root = _e.sidebar_menu.firstChild;
		has_uls = _class('has-ul', menu_root);
		has_uls_root = has_uls.length ? filter_class(Array.from(menu_root.children), 'has-ul', true) : [];
		has_uls_not_root = filter_not(has_uls, has_uls_root);

		// add menu_li to dirs object
		looper(_class('menu-li', menu_root), function(li){
			var prop = _c.dirs[li.dataset.path];
			if(prop) prop.menu_li = li;
		});

		// set menu active, current_path || init_path
		_f.set_menu_active(_c.current_path || _c.init_path);

		// remember scroll
		if(tests.local_storage) {
			_e.sidebar_menu.scrollTop = _ls.get('files:interface:menu_scroll:' + _c.location_hash) || 0;
			_event(_e.sidebar_menu, _debounce(function(){
				_ls.set('files:interface:menu_scroll:' + _c.location_hash, _e.sidebar_menu.scrollTop, true);
			}, 1000), 'scroll');
		}

		// set menu toggle
		if(has_uls.length) set_menu_toggle();

		// anime in
		if(_c.transitions && is_open) {
			var anim = {
				targets: (() => {
					var anims = [], lis = menu_root.children, l = lis.length, h = _e.sidebar_inner.clientHeight;
					for (var i = 0; i < l; i++) {
						var li = lis[i],
								rect = li.getBoundingClientRect();
						if(rect.top < h) {
							anims.push(li);
						} else if(anims.length){
							break;
						}
					}
					return anims;
				})(),
			  translateY: [-5, 0],
			  opacity: [0,1],
			  easing: 'easeOutCubic',
			  duration: 100
			}
			anim.delay = anime.stagger(minmax(20, 50, Math.round(200/anim.targets.length)));
			anime(anim);
		}

		// click
		_event(menu_root, function(e){

			// block click event if contextmenu is open
	  	if(_o.contextmenu.is_open) return e.preventDefault();

	  	// clicks on root
	  	if(e.target === menu_root) return;

			// vars
			var is_link = e.target.nodeName === 'A',
					li = is_link ? e.target.parentElement : e.target.closest('.menu-li'),
					a = is_link ? e.target : li.firstElementChild;

			// allow <a href> click (event, <a>) early exit, else e.preventDefault()
	  	if(allow_href(e, a)) return;

			// item click
			if(is_link && a !== menu_active){

				// load
				_f.get_files(li.dataset.path, 'push');

				// small, close sidebar
				if(!matchMedia('(min-width: 992px)').matches) {
					toggle_sidebar();

				// large, add sidebar-clicked if closed (using hover)
				} else if(!_c.menu_show){
					class_timer(_e.sidebar, 'sidebar-clicked', null, 1000);
				}

			// is toggle
			} else if(!is_link || li.classList.contains('has-ul')) {

				// toggle
				var toggle = !li.classList.contains('menu-li-open');
				menu_open_manager(li, toggle);
				ul_anime(li, toggle);
			}
		});
	}
	_f.create_menu = create_menu;

	// localstorage match _c.menu_cache_hash
	var ls_menu = _ls.get_json('files:menu:' + _c.menu_cache_hash),
			ls_validate = _c.menu_cache_validate || (_c.cache && !_c.menu_cache_file),
			ls_valid = ls_menu && (!ls_validate || (function(){ // already valid if only root paths
				var l = ls_menu.length;
				for (var i = 0; i < l; i++) if(ls_menu[i].path.includes('/')) return false;
				return true;
			})()) ? true : false;

	// localstorage valid
	if(ls_valid) {
		create_menu(ls_menu, 'menu from localstorage [' + (_c.menu_cache_validate ? 'shallow menu' : 'menu cache validation disabled') + ']');

	// load
	} else {

		// add. spinner
		_e.sidebar_menu.classList.add('sidebar-spinner');

		//
		ajax_get({
			params: _c.menu_cache_file ? false : 'action=dirs' + (_c.cache ? '&menu_cache_hash=' + _c.menu_cache_hash : '') + (ls_menu ? '&localstorage=1' : ''),
			url: _c.menu_cache_file,
			json_response: true,
			complete: function(data, response, is_json){

				// remove spinner
				_e.sidebar_menu.classList.remove('sidebar-spinner');

				// empty
				if(!is_json || !data || data.error || !Object.keys(data).length) {
					_license();
					_log('Error or no dirs!');
					return;
				}

				// dirs valid, serve localstorage
				if(data.localstorage){
					create_menu(ls_menu, 'menu from localstorage');

				// serve loaded data, from cache or new
				} else {
					create_menu(data, 'menu from ' + (_c.menu_cache_file ? 'JSON cache: ' + _c.menu_cache_file : 'xmlhttp'));
					if(tests.local_storage) setTimeout(function(){
						_f.clean_localstorage();
						_ls.set('files:menu:' + _c.menu_cache_hash, response);
					}, 1000);
				}
			}
		});
	}

	// sidebar width rounded, only required on media-breakpoint-up(lg)
	/*if(matchMedia('(min-width: 992px)').matches) (function () {
		var css_var = getComputedStyle(document.body).getPropertyValue('--sidebar-width'); // get var
		if(!css_var || !css_var.includes('vw')) return; // no vw means no decimals, and no need for JS;
		var arr = css_var.match(/\d+/g); // get numbers
		if(arr.length !== 2) return; // must be of format with two numbers vs and px "calc(10vw + 180px)"
		var vw = arr[0]/100, px = arr[1]*1; // should be 10, 180 by default

		// sidebar width function
		function sidebar_width(){
			var vw_width = document.body.clientWidth * vw; // calculate px width from vw value
			// set if is decimal, else remove
			document.documentElement.style[(Math.floor(vw_width) === vw_width ? 'remove' : 'set') + 'Property']('--sidebar-width', Math.min(480, px + Math.round(vw_width)) + 'px');
		}
		_event(window, _debounce(sidebar_width, 500), 'resize'); // set event on window resize
		sidebar_width(); // immediately check
	}());*/
}());


// sort.js

/*
a = a.toLowerCase();
b = b.toLowerCase();
if (a == b) return 0;
if (a > b) return 1;
return -1;

return a === b ? 0 : a > b ? 1 : -1;
*/


/* SORTSCHEIT
- OPTIONS
	- localeCompare / DEFAULT
	- Custom collator() locale
	- New option >< basic sort

	- custom

- scheit in PHP/files.js
- need lowercase props again if default?
- what's that inconsistency when changing folder and/or sort?
- a == b ? 0 : (a > b ? -1 : 1)

- DONE
- removed pre-cache sorting, now always use sort() on dir load
*/




//
(function () {

	// sort object
	_o.sort = {
		sorting: {
			name: {
				//prop: 'sort_name',
				prop: 'basename',
				order: 'asc'
			},
			kind: {
				prop: 'ext',
				order: 'asc'
			},
			size: {
				prop: 'filesize',
				order: 'desc'
			},
			date: {
				prop: 'mtime',
				order: 'desc'
			}
		}
	}

	// sort props
	function sort_props(sort, order){
		//if(!_o.sort.keys.includes(sort)) sort = 'name';
		//if(!['asc', 'desc'].includes(order)) order = _o.sort.sorting[sort].sort;
		Object.assign(_o.sort, {
			sort: sort,
			order: order,
			multi: order === 'asc' ? 1 : -1,
			index: _o.sort.keys.indexOf(sort),
			prop: _o.sort.sorting[sort].prop
		});
	}

	// prepare sort keys array from object
	_o.sort.keys = Object.keys(_o.sort.sorting);

	// split sort and order from config string, and make sure we have valid initial config values
	var config = (_c.sort || 'name_asc').split('_'); // split
	if(!_o.sort.keys.includes(config[0])) config[0] = 'name'; // must be in sort.keys
	if(!config[1] || !['asc', 'desc'].includes(config[1])) config[1] = _o.sort.sorting[config[0]].order; // asc or desc
	if(config.join('_') !== _c.sort) _c.sort = config.join('_'); // write back to _c.sort

	// immediately set sort props
	sort_props(config[0], config[1]);

	// add button and dropdowns
	const el = _id('change-sort');

	el.innerHTML = `<button type="button" class="button-icon">${ _f.get_svg_icon('sort_' + _o.sort.sort + '_' + _o.sort.order) }</button><div class="dropdown-menu dropdown-menu-topbar"><span class="dropdown-header" data-lang="sort">${ lang.get('sort') }</span>${ str_looper(_o.sort.keys, (key) => {
		return `<button class="dropdown-item dropdown-item-sort${ key === _o.sort.sort ? ' active sort-' + _o.sort.order : '' }" data-action="${ key }">${ _f.get_svg_icon_multi_class('svg-icon svg-icon-sort', 'chevron_down', 'chevron_up') + _f.get_svg_icon_multi('sort_' + key + '_asc', 'sort_' + key + '_desc') + lang.span(key) }</button>`;
	}) }</div>`;

	// elements
	const button = el.firstElementChild,
				toggle = el.children[1],
				dropdown = el.lastElementChild,
				dropdown_items = _class('dropdown-item', dropdown);

	// main files_sort method / always use this
	function files_sort(a, b){

		// _c.sort_dirs_first ? one dir + one file = dir first
		if(_c.sort_dirs_first && a._values.is_dir !== b._values.is_dir) return (b._values.is_dir ? 1 : -1) * _o.sort.multi;

		// sort vals
		var a_val = a._values[_o.sort.prop],
				b_val = b._values[_o.sort.prop];

		// sort by basename / use assigned name_sort_method()
		if(_o.sort.sort === 'name' || a_val === b_val) return sort_function(a._values.basename, b._values.basename);

		// basic sort for non-basename (if they are !equal)
		return a_val > b_val ? 1 : -1;
	}

	// sort methods for name/basename
	var sort_functions = {

		// localeCompare || fallback to case
		locale: function(a, b){
			return collator.compare(a, b) || sort_functions.basic(a, b);
		},

		// basic lowerCase sorting
		basic: function(a, b){
			var al = a.toLowerCase(), bl = b.toLowerCase();

			// if lowerCase are same (unlikely), use basename (which can't possibly be identical)
			if(al === bl) return a > b ? 1 : -1;

			// use lowercase (100% is not same)
			return al > bl ? 1 : -1;
		}
	}

	// localeCompare() collator / assign 'locale' option if !['basic', 'locale'].includes(_c.sort_function)
	var collator = new Intl.Collator((_c.sort_function && !['basic', 'locale'].includes(_c.sort_function) ? _c.sort_function.trim() : undefined), { numeric: true, sensitivity: 'base' });

	// assign basename sort_function / basic || locale
	var sort_function = sort_functions[_c.sort_function === 'basic' ? 'basic' : 'locale'];

	// toggle classes
	function toggle_classes(is_new_sort, is_new_order, add){
		var method = add ? 'add' : 'remove';
		if(is_new_sort){
			dropdown_items[_o.sort.index].classList[method]('active');
			sortbar_items[_o.sort.index].classList[method]('sortbar-active');
		}
		if(is_new_sort || is_new_order){
			dropdown_items[_o.sort.index].classList[method]('sort-' + _o.sort.order);
			sortbar_items[_o.sort.index].classList[method]('sort-' + _o.sort.order);
		}
	}

	// set sort
	_f.set_sort = function(sort){

		// new sort
		if(sort) {

			// is new sort
			var is_new_sort = sort !== _o.sort.sort,
					order = is_new_sort ? _o.sort.sorting[sort].order : (_o.sort.order === 'asc' ? 'desc' : 'asc'),
					is_new_order = order !== _o.sort.order;

			// remove classes
			toggle_classes(is_new_sort, is_new_order, false);

			// update props
			sort_props(sort, order);

			// toggle button icon
			/*if(is_new_sort) */button.innerHTML = _f.get_svg_icon('sort_' + sort + '_' + order);

			// active dropdown
			toggle_classes(is_new_sort, is_new_order, true);

			// localstorage
			_f.set_config('sort', _o.sort.sort + '_' + _o.sort.order);
		}

		// list sort
		if(_c.debug) console.time('sort');
		// check if _o.list exists because _o.list might not ne defined yet if first folder was empty/forbidden
		if(_o.list) _o.list.sort(_o.sort.prop, { // _o.sort.prop seems to be irrelevant because custom sort function
			order: _o.sort.order,
			//alphabet: 'ABCDEFGHIJKLMNOPQRSTUVXYZÆØÅabcdefghijklmnopqrstuvxyzæøå',
			//insensitive: true, // default
			sortFunction: files_sort
		});
		if(_c.debug) console.timeEnd('sort');
	}

	// dropdown button click, cycle sorting
	_f.dropdown(el, button, function(){
		_f.set_sort(_o.sort.keys[_o.sort.index >= _o.sort.keys.length - 1 ? 0 : _o.sort.index + 1]);
	});

	// dropdown
	actions(dropdown, _f.set_sort);

	// sortbar
	_e.sortbar = _id('files-sortbar');
	_e.sortbar.className = 'sortbar-' + _c.layout; // todo: don't set if same as default?
	_e.sortbar.innerHTML = `<div class="sortbar-inner">${ str_looper(_o.sort.keys, function(key){
		return '<div class="sortbar-item sortbar-' + key + (key === _o.sort.sort ? ' sortbar-active sort-' + _o.sort.order : '') + '" data-action="' + key + '"><span data-lang="' + key + '" class="sortbar-item-text">' + lang.get(key) + '</span>' + _f.get_svg_icon_multi_class('svg-icon svg-icon-sort', 'chevron_down', 'chevron_up') + '</div>';
	}) }</div>`;
	const sortbar_items = _e.sortbar.firstChild.children;

	// sortbar click event / search for element with action
	_event(_e.sortbar, function(e){
		var el = e.target.closest('[data-action]');
		if(el) _f.set_sort(el.dataset.action, e);
	});
}());


// topbar.js

// fullscreen
(function () {

	_e.topbar_top = _id('topbar-top');

	_o.topbar = {
		info: {}
	}

	// filter
	_e.filter.placeholder = lang.get('filter');
	_e.filter.title = tests.c_key + 'F';
	filter.hash();

	// search icon
	_e.filter.parentElement.insertAdjacentHTML('beforeend', `${_f.get_svg_icon_class('search', 'svg-icon filter-search-icon')}<button class="button-icon filter-reset" tabindex="-1">${_f.get_svg_icon('close_thin')}</button>`);

	// filter-reset X button
	_event(_e.filter.parentElement.lastElementChild, () => {
		_e.filter.focus(); // set focus to input
		filter.clear(true); // clear filter
	});

	// create language dropdown menu
	lang.dropdown();

	/* THEME */
	(() => {

		/* TODO
		- config and/or Javascript config: default, button, auto (dark)

		let theme = (() => {
		  try {
		    return localStorage.getItem('files:theme');
		  } catch (e) {
		    return false;
		  };
		})() || (matchMedia('(prefers-color-scheme:dark)').matches ? 'dark' : 'contrast');
		if(theme !== 'contrast') document.documentElement.dataset.theme = theme;

		1. assign different default.
		2. allow button/switching. If disallowed, use default (or prefers-color-scheme)
		3. new feature allow switching from ?theme=xyz?

		let theme = (() => {
		  try {
		    return localStorage.getItem('files:theme');
		  } catch (e) {
		    return false;
		  };
		})() || (matchMedia('(prefers-color-scheme:dark)').matches ? 'dark' : 'contrast');
		if(theme !== 'contrast') document.documentElement.dataset.theme = theme;
		*/



		// array of avaialble themes
		//const themes = ['contrast', 'light', 'dark'];

		// theme default 'contrast'
		//const theme_default = 'contrast';
		/*(() => {
			let conf = _c.config && _c.config.theme && _c.config.theme.default ? _c.config.theme.default : false;
			return conf && themes.includes(conf) ? conf : 'contrast';
		})();*/


		/* SCENARIOS
		- assign different default (same behavior store current from button)
		- disable button, always uses default (ignore localStorage), still accept prefers-color-scheme:dark
			- disable auto, prevents prefers-color-scheme:dark

		- any scenario we need to reset _ls.set('files:theme') based on custom config options?
			- YES, if dataset.theme !== _c.theme, because it means it was assigned incorrectly
			 A: from localStorage, and localStorage was/is wrong or button disabled
			 B: from prefers-color-scheme yet auto is disabled
			 C: "contrast" was used, yet options.default is something else
		*/

		// options merge with _c.config.theme custom options
		const options = Object.assign({
			themes: ['contrast', 'light', 'dark'],	// array of available themes for button switch
			default: 'contrast',										// default theme
			button: true,														// allow button switch / ignore localStorage if false
			auto: true,															// allow prefers-color-scheme:dark
		}, _c.config ? _c.config.theme || {} : {});

		// assign _c.theme from 1.localStorage (if button), 2. auto, 3. default
		// will normally be the same as current data-theme (assigned from index.php), unless 1. localStorage is/was wrong button:false, 2. Assigned from prefers-color-scheme:dark yet auto:false, 3. Assigned to tdefault, yet options.default is not 'contrast'
		_c.theme = (options.button ? _ls.get('files:theme') : false) || (options.auto && matchMedia('(prefers-color-scheme:dark)').matches ? 'dark' : options.default);

		// make sure _c.theme is populated and exists in themes[] / could be expired from localStorage or spelling
		if(!_c.theme || !options.themes.includes(_c.theme)) _c.theme = options.default;

		// html.dataset shortcut
		const dataset = document.documentElement.dataset;

		// in case data-theme was not assigned correctly (see 1,2,3 comment above _c.theme assignment)
		if(dataset.theme !== _c.theme) {
			dataset.theme = _c.theme;					// set it appropriately!
			_ls.set('files:theme', _c.theme);	// save in localStorage, so it gets set correctly next time from index.php
		}

		// die if !button
		if(!options.button) return;

		// assign theme start index for rotating themes
		let theme_index = options.themes.indexOf(_c.theme);

		// topbar theme changer button UI
		_e.topbar_top.insertAdjacentHTML('beforeend', `<button class="button-icon" id="change-theme">${ _f.get_svg_icon_multi('theme_contrast', 'theme_light', 'theme_dark') }</button>`);
		_event(_e.topbar_top.lastElementChild, () => {
			theme_index ++;
			if(theme_index >= options.themes.length) theme_index = 0;
			_c.theme = options.themes[theme_index];
			class_timer(document.body, 'no-transition', null, 10); // block transitions temporarily on change
			dataset.theme = _c.theme;
			//if(_c.theme === theme_default) return _ls.remove('files:theme'); // remove localStorage if default option / NOPE
			_ls.set('files:theme', _c.theme); // always store because we might need it for index.php
		});
	})();

	// logout
	if(_c.has_login) {
		_e.topbar_top.insertAdjacentHTML('beforeend', '<a href="' + location.href.split('?')[0] + '?logout=1" class="button-icon" id="logout"' + get_title('logout', true) + '>' + _f.get_svg_icon('logout') + '</a>');
		var logout_button = _e.topbar_top.lastElementChild;
		_event(logout_button, (e) => {
			e.preventDefault();
			_alert.confirm.fire({
				title: lang.get('logout'),
				text: lang.get('logout') + '?',
				cancelButtonText: lang.get('cancel'),
				confirmButtonText: lang.get('logout')
			}).then((res) => {
				if(res.isConfirmed) location.assign(logout_button.href);
			});
		});
	}

	// fullscreen
	if(screenfull.isEnabled){
		_e.topbar_top.insertAdjacentHTML('beforeend', '<button class="button-icon" id="topbar-fullscreen">' + _f.get_svg_icon_multi('expand', 'collapse') + '</button>');
		_event(_e.topbar_top.lastElementChild, function(){
			screenfull.toggle();
		});
		screenfull.on('change', function(){
			document.documentElement.classList.toggle('is-fullscreen', screenfull.isFullscreen);
		});
	}

	// topbar info
	_f.topbar_info = function(msg, type){
		_e.topbar_info.className = 'info-' + type; // set visible + class type
		_e.topbar_info.innerHTML = msg; // msg html
	}

	// topbar search
	_f.topbar_info_search = function(val, matches){

		// toggle sibling sortbar visibility depending on matches / not necessary!
		// toggle_hidden(_e.sortbar, !matches);

		// return and hide topbar_info if no search (also removes classes used for sortbar)
		if(!val) return _e.topbar_info.className = 'info-hidden';

		// update existing info-search filter html ()
		if(_e.topbar_info.classList.contains('info-search')) {
			_e.topbar_info.classList.toggle('info-nomatch', !matches); // toggle nomatches
			_e.topbar_info.children[0].textContent = matches; // amount
			_e.topbar_info.children[2].textContent = val; // phrase

		// create filter html
		} else {
			_f.topbar_info('<span class="info-search-count">' + matches + '</span><span class="info-search-lang"><span data-lang="matches found for">' + lang.get('matches found for') + '</span></span><span class="info-search-phrase">' + val + '</span><button class="button-icon info-search-reset" data-action="reset">' + _f.get_svg_icon('close_thin') + '</button>', 'search' + (matches ? '' : ' info-nomatch'));
		}
	}
}());


// files.init.js

// inject favicon
if(_c.config.favicon) document.head.insertAdjacentHTML('beforeend', _c.config.favicon);

// add --files-cursor: zoom-in for grid layouts
if(_c.click === 'popup' && tests.is_pointer) _e.files_container.style.setProperty('--files-cursor', 'zoom-in');

// files app loaded
function app_loaded(){

  // delayed image remove / errors + 1px placeholders / 100ms seems to work without breaking
  const image_remove = (img) => wait(100).then(() => {
    if(img) img.remove();
  });

  // init yall lazy on #files and .modal (for folder preview images)
  ['.modal', '#files'].forEach(function(root) {
    yall({
      observeChanges: true,
      //observeRootSelector: '#files',
      observeRootSelector: root,
      //lazyBackgroundClass: 'img-bg',
      //lazyBackgroundLoaded: 'img-bg-loading',
      lazyClass: 'files-lazy',
      threshold: 300,
      events: {
        load: function (e) {
          let img = e.target;
          // folder preview images, remove 1px empty previews, and fade in
          if(img.classList.contains('files-folder-preview')) {
            let w = img.naturalWidth;
            if(w && w === 1) return image_remove(img);
            img.style.setProperty('--ratio', img.naturalWidth / img.naturalHeight);
            return img.style.opacity = 1; // fade in (opacity 1) and die
          }

          // cheap fix for Youtube images that don't have hq720.jpg / load mqdefault (same aspect)
          // https://stackoverflow.com/questions/2068344/how-do-i-get-a-youtube-video-thumbnail-from-the-youtube-api
          if(e.target.src.indexOf('https://img.youtube.com/') === 0 && img.naturalWidth !== 1280){
            e.target.src = `https://img.youtube.com/vi/${ e.target.src.split('/')[4] }/mqdefault.jpg`;
          }

          // get <a> files item
          let files_a = img.parentElement;

          // ugly fix to block transition on files-data element when image loads
          if(['grid', 'rows', 'columns'].includes(_c.layout)){
            let s = files_a.style;
            s.setProperty('--files-data-transition-duration', '0s');
            wait(250).then(() => s.removeProperty('--files-data-transition-duration'));
          }

          // remove placeholder bg, necessary for transparent SVG/PNG/GIF
          img.classList.remove('files-img-placeholder');

          // caption styles when an image loads into place
          files_a.classList.add('files-a-loaded');
        },
        error: {
          listener: (e) => {
            if(e.target.classList.contains('files-folder-preview')) image_remove(e.target); // remove failed files-folder-preview
          }
          // The option below is sent as the third argument to `addEventListener`,
          // offering more control over how events are bound. If you want to
          // specify `useCapture` in lieu of options pass a boolean here instead.
          //options: {
            //once: true
          //}
        }
      }
    });
  }); //

  // remove body-loading class
  document.body.classList.remove('body-loading');

  // display and align dropdown menus in topbar / must trigger after body is loaded and visible
  _f.topbar_dropdowns_init();

  // contextmenu
  if(!_c.prevent_right_click && _c.context_menu) {

    // files
    if(_e.files_container) _e.files_container.addEventListener('contextmenu', (e) => {
      // detect <a> or is parent _f.files_container which represents _c.current_dir
      let a = e.target.closest('.files-a');
      _f.create_contextmenu(e, 'files', a || _e.files_container, a ? _c.files[a.dataset.name] : _c.current_dir);
    });

    // sidebar menu
    if(_e.sidebar_menu) _e.sidebar_menu.addEventListener('contextmenu', (e) => {
      // detect menu <li> or is parent _e.sidebar_menu which represents ROOT _c.dirs['']
      //let li = e.target.closest('.menu-li');
      //_f.create_contextmenu(e, 'sidebar', li || _e.sidebar_menu, _c.dirs[li ? li.dataset.path : '']);
      let a = e.target.closest('.menu-a');
      let li = a ? a.parentElement : false;
      _f.create_contextmenu(e, 'sidebar', a || _e.sidebar_menu, _c.dirs[li ? li.dataset.path : '']);
    });
  }

  // anim in body opacity, then init_files()
  anime({
    targets: document.body,
    opacity: [0, 1],
    duration: 500,
    easing: 'easeOutQuad',
    complete: _f.init_files
  });
}

// check for IntersectionObserver
if('IntersectionObserver' in window && 'IntersectionObserverEntry' in window && 'intersectionRatio' in window.IntersectionObserverEntry.prototype){
  app_loaded();

// load polyfill first
} else {
  _f.load_plugin('intersection-observer', app_loaded, {
    src: ['intersection-observer@0.12.2/intersection-observer.js']
  });
}

/*
// set mouse coordines on button click, for click click event
document.addEventListener('mousedown', (e) => {
  let b = e.target;
  if(!b.nodeName === 'BUTTON') return;
  b.style.setProperty('--x', e.offsetX + 'px');
  b.style.setProperty('--y', e.offsetY + 'px');
});
*/
