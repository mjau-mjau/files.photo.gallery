! function (e) {
    function t(e) {
        return e ? e.replace(/"/g, "&quot;") : ""
    }

    function i(e) {
        return e ? e.replace(/</g, "&lt;").replace(/>/g, "&gt;") : ""
    }

    function a(e, t) {
        return '<span class="' + t + '">' + e + "</span>"
    }
    "isConnected" in Node.prototype || Object.defineProperty(Node.prototype, "isConnected", {
        get() {
            return this.ownerDocument.contains(this)
        }
    });
    var n = {
        a: function (e, t, i) {
            return e ? '<a class="' + t + ' map-link" target="_blank" href="' + d(e) + '" data-lang="google maps"' + (i ? "" : ' title="' + X.get("google maps") + '"') + ">" + (i ? X.get("google maps") : P.get_svg_icon("marker")) + "</a>" : ""
        },
        span: function (e, t) {
            return e ? '<span class="' + t + ' map-link" data-href="' + d(e) + '"' + _("google maps") + ">" + P.get_svg_icon("marker") + "</span>" : ""
        }
    };

    function o(e, t) {
        var i = !!e.url_path && encodeURI(e.url_path).replace(/#/g, "%23");
        return e.is_dir ? i || "#" : !i || t && ["php", "htaccess"].includes(e.ext) || _c.load_files_proxy_php ? _c.script + (t ? "?download=" : "?file=") + encodeURIComponent(e.path) : i
    }

    function l(e, t) {
        return e.is_dir ? s(e.path) : o(e, t)
    }

    function s(e) {
        return location.pathname + (e ? "?" + encodeURIComponent(e).replace(/%2F/g, "/") : "")
    }

    function r(e) {
        for (; e.firstChild;) e.removeChild(e.firstChild)
    }

    function c(e, t) {
        e.length && k(e, (function (e) {
            (t || e.parentNode).removeChild(e)
        }))
    }

    function p(e, t, i) {
        y(e, (function (e) {
            var i = e.target.dataset.action;
            i && t(i, e)
        }), "click", !1, i)
    }

    function d(e) {
        return Array.isArray(e) ? "https://www.google.com/maps/search/?api=1&query=" + e : "#"
    }

    function m(e, t) {
        return e ? '<span class="' + t + '">' + e[0] + " x " + e[1] + "</span>" : ""
    }

    function u(e, t) {
        return e.is_dir ? e.hasOwnProperty("dirsize") ? '<span class="' + t + '">' + filesize(e.dirsize) + "</span>" : "" : '<span class="' + t + '">' + filesize(e.filesize) + "</span>"
    }

    function f(e, t) {
        return _c.context_menu && e ? '<span class="context-button ' + t + '" data-action="context">' + P.get_svg_icon_multi("dots", "minus") + "</span>" : ""
    }

    function v(e, t, i, a) {
        if (!e || !e.iptc) return "";
        var n = Object.keys(e.iptc);
        if (!n.length) return "";
        var o = "",
            l = "",
            s = "";
        return n.forEach((function (i) {
            var a = e.iptc[i];
            if (a) {
                if (["city", "sub-location", "province-state"].includes(i)) return l += '<span class="' + t + "-" + i + '">' + a + "</span>";
                if (["creator", "credit", "copyright"].includes(i)) return s += '<span class="' + t + "-" + i + '">' + a + "</span>";
                if ("keywords" === i && Array.isArray(a)) {
                    var n = a.filter((e => e));
                    return o += n.length ? '<div class="' + t + "-" + i + '">' + n.join(", ") + "</div>" : ""
                }
                return o += '<div class="' + t + "-" + i + '">' + a + "</div>"
            }
        })), (o += (l ? '<div class="' + t + '-location">' + l + "</div>" : "") + (s ? '<div class="' + t + '-owner">' + s + "</div>" : "")) ? i ? '<div class="' + t + '-iptc">' + o + "</div>" : o : ""
    }

    function g(e, t, i) {
        if (!e || !e.exif) return "";
        var a = M(["Model", "ApertureFNumber", "FocalLength", "ExposureTime", "ISOSpeedRatings", "gps"], (function (t) {
            var a = e.exif[t];
            if (!a) return "";
            if ("Model" === t) a = P.get_svg_icon(a.toLowerCase().indexOf("phone") > -1 ? "cellphone" : "camera") + a;
            else if ("FocalLength" === t) {
                var o = a.split("/");
                2 === o.length && (a = (o[0] / o[1]).toFixed(1) + "<small>mm</small>")
            } else if ("gps" === t) return n[i || "a"](a, "exif-item exif-gps");
            return '<span class="exif-item exif-' + t + '"' + _(t) + ">" + a + "</span>"
        }));
        return a ? '<div class="' + t + '">' + a + "</div>" : ""
    }

    function _(e, t) {
        return e && U.is_pointer ? ' data-lang="' + e + '"' + (t ? ' data-tooltip="' : ' title="') + X.get(e, !t) + '"' : ""
    }

    function h(e) {
        if (navigator.clipboard) return navigator.clipboard.writeText(e);
        var t = document.createElement("span");
        t.textContent = e, t.style.whiteSpace = "pre", document.body.appendChild(t);
        var i = window.getSelection(),
            a = window.document.createRange();
        i.removeAllRanges(), a.selectNode(t), i.addRange(a);
        var n = !1;
        try {
            n = window.document.execCommand("copy")
        } catch (e) {
            console.log("error", e)
        }
        return i.removeAllRanges(), window.document.body.removeChild(t), n ? Promise.resolve() : Promise.reject()
    }

    function x(e, t, i, a) {
        e.classList.add(t), i && (e.disabled = i), setTimeout((function () {
            e.classList.remove([t]), i && (e.disabled = !1)
        }), a || 2e3)
    }

    function b(e, t, i) {
        if (i || e.which > 1 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) {
            var a = !!t && t.getAttribute("href");
            if (a && "#" !== a) return t.contains(e.target) || t.click(), !0
        }
        e.preventDefault()
    }

    function y(e, t, i, a, n) {
        e.addEventListener(i || "click", function (e, t) {
            return t ? function (a) {
                i || (e.apply(this, arguments), i = setTimeout((function () {
                    i = null
                }), t))
            } : e;
            var i
        }(t, n)), a && t()
    }

    function w(e, t) {
        var i;
        return function (a) {
            i && clearTimeout(i), i = setTimeout(e, t || 1e3, a)
        }
    }

    function L(e, t, i, a) {
        return a && (i = w(i, a)), e.addEventListener(t, i), {
            remove: function () {
                e.removeEventListener(t, i)
            }
        }
    }

    function C(e, t, i) {
        var a = i ? "add" : "remove";
        k(H(e, t, !i), (function (e) {
            e.classList[a](t)
        }))
    }

    function H(e, t, i) {
        return e.filter((function (e) {
            return i == e.classList.contains(t)
        }))
    }

    function k(e, t) {
        for (var i = e.length, a = 0; a < i; a++) t(e[a], a)
    }

    function M(e, t) {
        for (var i = "", a = e.length, n = 0; n < a; n++) i += t(e[n], n) || "";
        return i
    }

    function V(e, t, i) {
        var a = new RegExp("[" + (i ? "#" : "?") + "&]" + e + (t ? "=([^&]*)" : "($|&|=)")),
            n = location[i ? "hash" : "search"].match(a);
        return !!n && (!t || n[1])
    }

    function z(e) {
        _c.debug && console.log.apply(this, arguments)
    }

    function A(e, t) {
        !e.style.display != !t && (e.style.display = t ? "none" : null)
    }

    function j(e, t, i) {
        q.plugins.mousetrap.loaded && Mousetrap[3 === arguments.length ? "bind" : "unbind"].apply(null, arguments)
    }
    _id = document.getElementById.bind(document), _class = function (e, t) {
        return Array.from((t || document).getElementsByClassName(e))
    }, _tag = function (e, t) {
        return Array.from((t || document).getElementsByTagName(e))
    }, _query = function (e, t) {
        return (t || document).querySelector(e)
    }, _querya = function (e, t) {
        return Array.from((t || document).querySelectorAll(e))
    };
    var E = function () {
        function e(e) {
            return U.local_storage ? localStorage.getItem(e) : null
        }

        function t(e, t) {
            "boolean" == typeof t && (t = t.toString());
            try {
                localStorage.setItem(e, t)
            } catch (e) {
                z("failed to write localstorage", e, "warn")
            }
        }
        return {
            get: function (t) {
                var i = e(t);
                return "true" === i || "false" !== i && i
            },
            get_json: function (t) {
                var i = e(t);
                if (i) try {
                    return JSON.parse(i)
                } catch (e) {
                    return null
                }
                return null
            },
            set: function (e, i, a, n) {
                return U.local_storage ? a && !i ? localStorage.removeItem(e) : n ? setTimeout((function () {
                    t(e, i)
                }), n) : void t(e, i) : null
            },
            remove: function (e) {
                if (U.local_storage) return localStorage.removeItem(e)
            }
        }
    }();

    function I(e) {
        var t = new XMLHttpRequest;
        return t.onreadystatechange = function () {
            if (4 == t.readyState)
                if (e.always && e.always(t), 200 == t.status) {
                    var i = t.responseText,
                        a = e.json_response,
                        n = a ? function () {
                            try {
                                return JSON.parse(i)
                            } catch (e) {
                                return a = !1, i
                            }
                        }() : i;
                    if (a && n.error && "login" === n.error) ie.fire(X.get("login", !0) + "!").then((e => {
                        e.isConfirmed && location.reload()
                    }));
                    else {
                        e.complete && e.complete(n, i, a);
                        var o = !e.url && t.getResponseHeader("files-msg");
                        o && z("XHR: files-msg: " + o)
                    }
                } else e.fail && e.fail(t)
        }, t.open(e.params ? "POST" : "GET", e.url || _c.script), e.params && t.setRequestHeader("Content-Type", "application/x-www-form-urlencoded"), e.json_response && t.setRequestHeader("Accept", "application/json"), t.send(e.params || null), t
    }

    function T(e) {
        return _c.server_exif && e && e.exif && e.exif.Orientation && e.exif.Orientation > 4 && e.exif.Orientation < 9
    }

    function S(e) {
        return atob(e)
    }

    function O(e, t, i) {
        return Math.min(Math.max(i, e), t)
    }

    function Z() {
        if (U.scrollbar_width) {
            var e = document.documentElement,
                t = window.innerWidth > e.clientWidth ? e.getBoundingClientRect().width : 0;
            t ? t !== F.body_width && e.style.setProperty("--body-width", t + "px") : F.body_width && e.style.removeProperty("--body-width"), F.body_width = t
        }
    }
    var R = {
        store: function (e) {
            e.dataset.tooltipOriginal || (e.dataset.tooltipOriginal = e.dataset.tooltip)
        },
        set: function (e, t, i) {
            R.store(e), e.dataset.tooltip = X.get(t), i && e.classList.add("show-tooltip")
        },
        timer: function (e, t, i, a) {
            t && R.store(e), t && (e.dataset.tooltip = X.get(t)), i && e.classList.add("tooltip-" + i), e.classList.add("show-tooltip"), setTimeout((function () {
                t && (e.dataset.tooltip = e.dataset.tooltipOriginal || ""), i && e.classList.remove("tooltip-" + i), e.classList.remove("show-tooltip")
            }), a || 1e3)
        }
    };

    function D(e) {
        if (!(e.is_dir && _c.folder_preview_image && _c.load_images && _c.image_resize_enabled)) return "";
        var t = _c.dirs[e.path];
        return t && t.hasOwnProperty("preview") && !t.preview ? "" : '<img data-src="' + _c.script + (t && t.preview ? "?file=" + encodeURIComponent(e.path + "/" + t.preview) + "&resize=" + _c.image_resize_dimensions : "?preview=" + encodeURIComponent(e.path)) + "&" + _c.image_cache_hash + "." + e.mtime + '" class="files-folder-preview files-lazy">'
    }
    _c.debug = V("debug") || 0 === location.host.indexOf("localhost"), _c.files = {}, z("_c", _c);
    var P = {},
        F = {},
        q = {},
        N = {
            main: _id("main"),
            topbar: _id("topbar"),
            files: _id("files"),
            topbar_info: _id("topbar-info"),
            filter_container: _id("search-container"),
            filter: _id("search"),
            modal: _id("files_modal"),
            modal_bg: _id("modal-bg")
        },
        U = {};

    function W(e, t) {
        if (t.mime1 && t.mime0 === e) return U.hasOwnProperty(e) || (U[e] = function () {
            if ("audio" === e && !window.Audio) return !1;
            var t = "audio" === e ? ["mpeg", "mp4", "x-aiff", "ogg", "x-m4a", "aac", "webm", "wave", "wav", "x-wav", "x-pn-wav", "flac"] : ["mp4", "webm", "ogg", "3gp", "m4v", "x-m4v"];
            try {
                var i = document.createElement(e);
                if (!i.canPlayType) return !1;
                var a = t.filter((function (t) {
                    return i.canPlayType(e + "/" + t).replace(/no/, "")
                }));
                return !!a.length && a
            } catch (e) {
                return !1
            }
        }()), !(!U[e] || !U[e].includes(t.mime1)) && t.mime1
    }

    function B(e) {
        return e[0].toUpperCase() + e.slice(1)
    }! function () {
        var e = U,
            t = document,
            i = t.documentElement,
            a = navigator,
            n = window;
        e.explorer = /MSIE /.test(a.userAgent) || /Trident\//.test(a.userAgent);
        var o = !!(n.CSS && n.CSS.supports || n.supportsCSS);
        !e.explorer && o && CSS.supports("color", "var(--fake-var)") || (t.body.innerHTML = '<div class="alert alert-danger" role="alert"><h4 class="alert-heading">' + (e.explorer ? "Internet Explorer" : "This browser is") + ' not supported.</h4>Please use a modern browser like <a href="https://www.microsoft.com/en-us/windows/microsoft-edge" class="alert-link">Edge</a>, <a href="https://www.google.com/chrome/" class="alert-link">Chrome</a>, <a href="https://www.mozilla.org/firefox/" class="alert-link">Firefox</a>, <a href="https://www.opera.com/" class="alert-link">Opera</a> or <a href="https://www.apple.com/safari/" class="alert-link">Safari</a>.</div>', t.body.classList.remove("body-loading"), fail), e.local_storage = !!n.localStorage && function () {
            try {
                var e = "_t";
                return n.localStorage.setItem(e, e), n.localStorage.removeItem(e), !0
            } catch (e) {
                return !1
            }
        }(), e.is_touch = "ontouchstart" in n || a.maxTouchPoints > 0 || a.msMaxTouchPoints > 0 || n.DocumentTouch && t instanceof DocumentTouch || n.matchMedia("(any-pointer: coarse)").matches, e.is_pointer = !e.is_touch || matchMedia("(pointer:fine)").matches, e.is_dual_input = e.is_touch && e.is_pointer, e.only_touch = e.is_touch && !e.is_pointer, e.only_pointer = !e.is_touch && e.is_pointer, e.PointerEvent = !!n.PointerEvent || a.msPointerEnabled, e.nav_langs = !(!a.languages || !a.languages.length) && a.languages || !!a.language && [a.language], e.pointer_events = !!("PointerEvent" in n) || a.msPointerEnabled, e.is_mac = a.platform.toUpperCase().indexOf("MAC") >= 0, e.is_mac && i.style.setProperty("--mac-bold", "500"), e.c_key = e.is_mac ? "⌘" : "ctrl-", e.scrollbar_width = e.is_pointer ? function () {
            var e = n.innerWidth - i.clientWidth;
            if (e) return e;
            var a = t.createElement("div");
            t.body.appendChild(a), a.style.cssText = "width: 100px;height: 100px;overflow: scroll;position: absolute;top: -9999px";
            var o = a.offsetWidth - a.clientWidth;
            return t.body.removeChild(a), o
        }() : 0, e.scrollbar_width && i.classList.add("has-scrollbars"), e.pixel_ratio = n.devicePixelRatio || 1, e.download = "download" in t.createElement("a"), e.clipboard = !(!t.queryCommandSupported || !t.queryCommandSupported("copy")), e.url = !("function" != typeof URL), e.fullscreen = screenfull.isEnabled, e.image_orientation = CSS.supports("image-orientation", "from-image"), e.browser_images = ["jpg", "jpeg", "png", "gif", "bmp", "svg", "svg+xml", "ico", "vnd.microsoft.icon", "x-icon"];
        var l = new Image;
        l.onload = l.onerror = function () {
            2 == l.height && e.browser_images.push("webp"), e.webp = 2 == l.height
        }, l.src = "data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA", e.history = !(!n.history || !history.pushState), e.history || (_c.history = !1), location.search && "URLSearchParams" in n && new URLSearchParams(location.search).forEach((function (e, t) {
            e && t.startsWith("--") && i.style.setProperty(t, e)
        }))
    }(), z("tests", U),
        function () {
            if (U.local_storage) {
                var e = V("clearall", !0),
                    t = !e && V("clear", !0),
                    i = e || t;
                if (P.clean_localstorage = function () {
                        if (!i) {
                            var e = Object.keys(localStorage);
                            e.length && k(e, (function (e) {
                                if (e.startsWith("files:menu:")) localStorage.removeItem(e);
                                else if (e.startsWith("files:dir:"))
                                    if (e.startsWith("files:dir:" + _c.dirs_hash)) {
                                        if (_c.menu_enabled) {
                                            var t = e.split(":"),
                                                i = t[3];
                                            if (_c.menu_max_depth && i.split("/").length >= _c.menu_max_depth) return;
                                            var a = parseInt(t[4]);
                                            _c.dirs[i] && _c.dirs[i].mtime == a || localStorage.removeItem(e)
                                        }
                                    } else localStorage.removeItem(e)
                            }))
                        }
                    }, i) {
                    var a = 0;
                    k(Object.keys(localStorage), (function (t) {
                        (e && t.startsWith("files:") || t.startsWith("files:menu:") || t.startsWith("files:dir:")) && (localStorage.removeItem(t), a++)
                    })), z(a + " localStorage items cleared")
                } else _c.menu_enabled || P.clean_localstorage()
            }
        }(),
        function () {
            U.local_storage && "clear_storage" === V("action", !0) && k(Object.keys(localStorage), (function (e) {
                (e.startsWith("files:config:") || e.startsWith("files:interface:")) && localStorage.removeItem(e)
            }));
            var e = {},
                t = ["layout", "sort", "menu_show"];
            t.forEach((function (t) {
                e[t] = _c[t]
            })), P.set_config = function (t, i) {
                if (e.hasOwnProperty(t)) {
                    if (_c[t] = i, e[t] === i) return E.remove("files:config:" + t);
                    E.set("files:config:" + t, i)
                }
            };
            var i = E.get_json("files:options:" + _c.location_hash);
            i && (k(Object.keys(i), (function (e) {
                P.set_config(e, i[e])
            })), E.remove("files:options:" + _c.location_hash), E.remove("files:ls_options")), k(t, (function (e) {
                var t = E.get("files:config:" + e);
                if (null !== t) return t === _c[e] ? E.remove("files:config:" + e) : void(_c[e] = t)
            }))
        }();
    var X = function () {
        function e(e, t) {
            return "object" == typeof files_lang && files_lang[t] ? Object.assign(e, files_lang[t]) : e
        }
        var t = !1,
            i = !1,
            a = {},
            n = ["bg", "da", "de", "en", "es", "fr", "hu", "it", "ja", "ko", "nl", "no", "pl", "pt", "ro", "ru", "th", "zh"];
        if (U.local_storage) {
            var o = E.get("files:version");
            o !== _c.version && E.set("files:version", _c.version), o && o !== _c.version && k(n, (function (e) {
                E.remove("files:lang:" + e)
            }))
        }
        var l = {
            da: "dk",
            en: "gb",
            ja: "jp",
            ko: "kr",
            sv: "se",
            vi: "vn",
            zh: "cn"
        };
        "object" == typeof files_lang && k(Object.keys(files_lang), (function (e) {
            files_lang[e].flag && (l[e] = files_lang[e].flag)
        })), _c.lang_custom && (k(Object.keys(_c.lang_custom), (function (t) {
            a[t] = e(_c.lang_custom[t], t), a[t].flag && (l[t] = a[t].flag), n.includes(t) || n.push(t)
        })), n.sort());
        var s = {},
            r = {
                get: function (e, t) {
                    var i = s[e] || e;
                    return t ? B(i) : i
                },
                set: function (e, t) {
                    e.dataset.lang = t, e.textContent = this.get(t)
                },
                dropdown: function () {
                    var e = V("lang_menu", !0) || _c.lang_menu;
                    if (e && "false" != e && "0" != e) {
                        N.topbar_top.insertAdjacentHTML("beforeend", '<div id="change-lang" class="dropdown' + (t ? " dropdown-lang-loading" : "") + '"><button type="button" class="btn-icon btn-topbar btn-lang" data-text="' + g + '"></button><div class="dropdown-menu dropdown-menu-topbar dropdown-menu-left"><h6 class="dropdown-header" data-lang="language">' + r.get("language") + '</h6><div class="dropdown-lang-items">' + M(n, (function (e) {
                            return '<button class="dropdown-item-lang' + (e === g ? " dropdown-lang-active" : "") + '" data-action="' + e + '"><img src="https://cdn.jsdelivr.net/npm/flag-icon-css@4.1.5/flags/1x1/' + (l[e] || e) + '.svg" class="dropdown-lang-flag"></button>'
                        })) + "</div></div>");
                        var a = (i = N.topbar_top.lastElementChild).firstElementChild,
                            o = i.lastElementChild.lastElementChild,
                            s = o.children[n.indexOf(g)];
                        P.dropdown(i, a), p(o, (function (e, t) {
                            e !== g && (g = e, c(e), P.dayjs_locale(e), q.uppy && P.uppy_locale(e), E.set("files:lang:current", e), a.dataset.text = e, s.classList.remove("dropdown-lang-active"), (s = t.target).classList.add("dropdown-lang-active"))
                        }))
                    }
                }
            };

        function c(e) {
            if ("en" === e) return m({}, e);
            var t = a[e] || E.get_json("files:lang:" + e);
            return t ? m(t, e) : function (e) {
                d(!0), I({
                    url: V("local") ? "lang/" + e + ".json" : "https://cdn.jsdelivr.net/npm/files.photo.gallery@" + _c.version + "/lang/" + e + ".json",
                    json_response: !0,
                    complete: function (t, i, a) {
                        d(), t && i && a && (E.set("files:lang:" + e, i), m(t, e))
                    },
                    fail: function () {
                        d()
                    }
                })
            }(e)
        }

        function d(e) {
            t = !!e, i && i.classList.toggle("dropdown-lang-loading", t)
        }

        function m(t, i) {
            a[i] || (a[i] = e(t, i)), s = t, _querya("[data-lang]").forEach((function (e) {
                var t = r.get(e.dataset.lang);
                return e.dataset.tooltip ? e.dataset.tooltip = t : e.title ? e.title = B(t) : void(e.textContent = t)
            })), N.filter && (N.filter.placeholder = r.get("filter"))
        }

        function u(e) {
            return !(!e || !n.includes(e)) && e
        }
        var f = V("lang", !0),
            v = u(f);
        "reset" === f && E.remove("files:lang:current"), v && E.set("files:lang:current", v);
        var g = v || u(E.get("files:lang:current")) || function () {
            if (_c.lang_auto && U.nav_langs)
                for (var e = 0; e < U.nav_langs.length; e++) {
                    var t = U.nav_langs[e].split("-")[0].toLowerCase();
                    if (u(t)) return t
                }
        }() || u(_c.lang_default) || "en";
        return "en" === g ? e(s, "en") : c(g), r
    }();
    ! function () {
        var e = "https://cdn.jsdelivr.net/npm/",
            t = "codemirror@5.63.3",
            i = "headroom.js@0.12.0",
            a = "mousetrap@1.6.5",
            n = "uppy@2.2.2";

        function o(e) {
            e.loading = !1, e.loaded = !0, k(e.complete, (function (e) {
                e()
            })), delete e.complete, delete e.src
        }

        function l(t, i, a) {
            var n = 0;
            k(t, (function (o) {
                ! function (t, i, a) {
                    var n = "js" == a.type || "js" == t.slice(-2),
                        o = document.createElement(n ? "script" : "link");
                    o[n ? "src" : "href"] = t.startsWith("http") ? t : e + t, i && (o.onload = i);
                    a.error && (o.onerror = a.error);
                    n ? document.body.appendChild(o) : (o.type = "text/css", o.rel = "stylesheet", document.head.insertBefore(o, _tag("link", document.head)[0]))
                }(o, (function () {
                    ++n === t.length && i && i()
                }), a)
            }))
        }
        q.plugins = {
            codemirror: {
                src: [
                    [t + "/lib/codemirror.min.js", t + "/lib/codemirror.css"],
                    [t + "/mode/meta.js", t + "/addon/mode/loadmode.js"]
                ],
                complete: [function () {
                    CodeMirror.modeURL = e + t + "/mode/%N/%N.js"
                }]
            },
            headroom: {
                src: [i + "/dist/headroom.min.js"]
            },
            mousetrap: {
                src: [a + "/mousetrap.min.js"]
            },
            cGF5cGFs: {
                src: [S("aHR0cHM6Ly93d3cucGF5cGFsLmNvbS9zZGsvanM/Y2xpZW50LWlkPQ==") + (location.search.includes("sandbox") ? S("QWRETjBCNzJWSUlHQk5HZnpOTHpfT0YtVGJ6MkxYcnhQeFNTamduUllmVUJFRnJZckp3eWV4cGsyM1VsZHh4ZnNmN3FSU2dvZG9OS3g1bTY=") : S("QVJFNEg3UWNvWG1LS1dUZktrLXBYQW5zSWZXMVpveDNidXdLbWFfeS1tbjRSalFaalM4R2hwMS1KVXhjZXZua2w1S0kwdkwtVUlKLXVFZlU="))],
                type: "js"
            },
            uppy: {
                src: [n + "/dist/uppy.min.js", n + "/dist/uppy.min.css"]
            }
        }, P.load_plugin = function (e, t, i) {
            q.plugins[e] || (q.plugins[e] = {});
            var a = i ? Object.assign(q.plugins[e], i) : q.plugins[e];
            if (a.loaded) t && t();
            else if (a.loading) t && a.complete.push(t);
            else {
                a.loading = !0, a.complete || (a.complete = []), t && a.complete.push(t);
                var n = Array.isArray(a.src[0]);
                l(n ? a.src[0] : a.src, (function () {
                    n ? l(a.src[1], (function () {
                        o(a)
                    }), a) : o(a)
                }), a)
            }
        }, P.load_plugin("mousetrap", (function () {
            Mousetrap.bind(["mod+f"], (function (e) {
                e.preventDefault(), q.headroom.pin(), N.filter.focus()
            }))
        })), "scroll" === _c.topbar_sticky && getComputedStyle(N.topbar).position.match("sticky") && P.load_plugin("headroom", (function () {
            if (Headroom.cutsTheMustard) {
                var e = {
                    tolerance: {
                        down: 10,
                        up: 20
                    },
                    offset: N.topbar.clientHeight
                };
                q.headroom = new Headroom(N.topbar, e), q.headroom.init()
            }
        }))
    }();
    var Y = _c.menu_enabled ? 2 : 1,
        G = !0;

    function K() {
        if (Y--) return !Y && setTimeout(K, 1e3);
        var e = S("ZmlsZXM6cXJ4"),
            t = S("ZmlsZXM6cHVyY2hhc2Vk"),
            i = location.hostname,
            a = E.get(e);
        if (!a || a != _c.qrx && S(a) != i) {
            var n = _c.x3_path && !_c.qrx;
            return _c.qrx || n || !i || i.includes(".") ? !_c.qrx || "string" == typeof _c.qrx && /^[a-f0-9]{32}$/.test(_c.qrx) ? void I({
                params: (_c.qrx ? "key=" + _c.qrx + "&" : "") + (n ? "app=1&domain=" : "app=2&host=") + encodeURI(i),
                url: S("aHR0cHM6Ly9hdXRoLnBob3RvLmdhbGxlcnkv"),
                json_response: !0,
                complete: function (t, a, o) {
                    //if (o && t && t.hasOwnProperty("status")) return t.status && 301 != t.status ? void(n || E.set(e, _c.qrx || btoa(i))) : l(_c.qrx)
                    if (o && t && t.hasOwnProperty("status")) return E.set(e, _c.qrx || btoa(i))
		    //l(_c.qrx)
                }
            }) : l(!0) : l()
        }

        function o(e, i) {
            var a, n = function (e, t, i, a) {
                    var n = '<div class="modal fade" id="' + e + '" tabindex="-1" aria-labelledby="' + e + '-label" aria-hidden="true">\t\t  <div class="modal-dialog">\t\t    <div class="modal-content">\t\t      <div class="modal-body">' + i + "</div>\t\t      " + (a ? '<div class="modal-footer">' + a + "</div>" : "") + "\t\t    </div>\t\t  </div>\t\t</div>";
                    document.body.insertAdjacentHTML("beforeend", n);
                    var o = _id(e),
                        l = new bootstrap.Modal(o);
                    return y(o, (function (e) {
                        l.dispose(), document.body.removeChild(o)
                    }), "hidden.bs.modal"), l.show(), l
                }("license_modal", 0, (e ? '<div class="alert alert-danger alert-dismissible fade show" role="alert"><strong>Invalid license</strong><br>You have entered an invalid license key.<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button></div>' : "") + '<div id="pay" class="mb-2"><div id="pay_info" class="mb-3 mt-1"><strong>Purchase a license [$39]</strong> to unlock features and support dev!\t\t<div>' + (a = '<div class="license-features">', ["Remove this popup", "Upload", "Download folder", "Code and text editor", "Create new file", "Create new folder", "Rename", "Delete", "Duplicate file", "Dedicated support", "Multi-user, panorama and much more coming soon!"].forEach((function (e) {
                    a += '<div class="license-feature">' + P.get_svg_icon("check") + e + "</div>"
                })), a + '</div></div><small>* After purchase, you will receive <strong>license key</strong> by email.</small>\t\t</div><div id="pay_pp"></div></div>\t\t<form id="license_form" novalidate>\t\t\t<input id="license_key" class="form-control" type="text" placeholder="LICENSE-KEY" required>\t\t\t<div class="float-right mt-3">\t\t\t\t<button id="continue_free" type="button" class="btn btn-light" data-bs-dismiss="modal">No thanks!</button>\t\t\t\t<button id="license_save_button" type="submit" class="btn btn-success text-light" style="display:none;">Save</button>\t\t\t</div>\t\t</form>')),
                o = _id("license_form"),
                l = o.parentNode,
                s = _id("license_key"),
                r = _id("license_save_button"),
                c = _id("continue_free"),
                p = _id("pay"),
                d = _id("pay_pp");

            function m(e) {
                l.style.cssText = e ? "pointer-events:none;opacity:.5" : ""
            }

            function u(e) {
                var i = s.value.trim(),
                    a = i && key_regex.test(i),
                    l = "submit" === e.type;
                s.classList.toggle("is-valid", a), s.classList.toggle("is-invalid", (i || l) && !a), r.style.display = a ? "" : "none", c.style.display = a ? "none" : "", l && (e.preventDefault(), e.stopPropagation(), a && (E.remove(t), m(1), I({
                    params: S("YWN0aW9uPWxpY2Vuc2Uma2V5PQ") + i,
                    json_response: !0,
                    complete: function (e, t, i) {
                        var a = i && e.success;
                        o.innerHTML = '<div class="alert alert-' + (a ? "success" : "danger") + ' mb-0" role="alert">' + P.get_svg_icon(a ? "check" : "alert_circle_outline") + (a ? "Great success!" : "Failed to save license key") + "</div>", m(0), a && (G = !0, setTimeout((function () {
                            n.hide()
                        }), 2e3))
                    }
                })))
            }
            pay_info = _id("pay_info"), key_regex = new RegExp(S("XkYxLVtBLVowLTldezR9LVtBLVowLTldezR9LVtBLVowLTldezR9LVtBLVowLTldezR9LVtBLVowLTldezR9LVtBLVowLTldezR9JA==")), y(o, u, "input"), y(o, u, "submit"), i && i.Buttons({
                createOrder: function (e, t) {
                    return t.order.create({
                        purchase_units: [{
                            amount: {
                                value: "39.00"
                            },
                            description: "Files App",
                            custom_id: "files_app"
                        }],
                        application_context: {
                            brand_name: "Files App",
                            shipping_preference: "NO_SHIPPING",
                            user_action: "PAY_NOW"
                        }
                    })
                },
                onError: function (e) {
                    z("error", e), p.innerHTML = '<div class="alert alert-danger" role="alert">' + P.get_svg_icon("alert_circle_outline") + "Payment error</div>"
                },
                onApprove: function (e, i) {
                    return m(1), z("onApprove", e, i), i.order.capture().then((function (e) {
                        m(0), p.innerHTML = "<p><strong>" + e.payer.name.given_name + " " + e.payer.name.surname + "</strong><br>" + e.payer.email_address + "</p><p>" + P.get_svg_icon("check") + "Thanks for purchasing! Please check your email.</p>", z("details", e), E.set(t, !0)
                    }))
                }
            }).render(d)
        }

        function l(e) {
            if (G = !1, E.get(t)) return o(e);
            P.load_plugin("cGF5cGFs", (function (t) {
                o(e, paypal)
            }), {
                error: function () {
                    o(e)
                }
            })
        }
    }! function () {
        function e(e, t, i) {
            return e.format(t) + (i ? '<span class="relative-time">' + e.fromNow() + "</span>" : "")
        }

        function t(t) {
            dayjs.locale(t), k(_tag("time"), (function (t) {
                if (t.dataset.time) {
                    var i = dayjs.unix(t.dataset.time);
                    t.innerHTML = e(i, t.dataset.format, t.children[0]), t.dataset.titleFormat && (t.title = i.format(t.dataset.titleFormat) + " — " + i.fromNow())
                }
            })), _c.current_dir && (_c.current_dir.html = !1)
        }

        function i(e) {
            P.load_plugin("dayjs_locale_" + e, (function () {
                t(e)
            }), {
                src: ["dayjs@1.10.7/locale/" + e + ".js"]
            })
        }
        P.get_time = function (t, i, a, n) {
            var o = dayjs.unix(t.mtime);
            return '<time datetime="' + o.format() + '" data-time="' + t.mtime + '" data-format="' + i + '"' + (a && U.is_pointer ? ' title="' + o.format("LLLL") + " ~ " + o.fromNow() + '" data-title-format="LLLL"' : "") + ">" + e(o, i, n) + "</time>"
        }, dayjs.extend(dayjs_plugin_localizedFormat), dayjs.extend(dayjs_plugin_relativeTime), P.dayjs_locale = function (e) {
            if ("en" === e) return t(e);
            (e = n(e)) && i(e)
        };
        var a = ["af", "am", "ar-dz", "ar-kw", "ar-ly", "ar-ma", "ar-sa", "ar-tn", "ar", "az", "be", "bg", "bi", "bm", "bn", "bo", "br", "bs", "ca", "cs", "cv", "cy", "da", "de-at", "de-ch", "de", "dv", "el", "en-au", "en-ca", "en-gb", "en-ie", "en-il", "en-in", "en-nz", "en-sg", "en-tt", "en", "eo", "es-do", "es-pr", "es-us", "es", "fi", "fo", "fr-ca", "fr-ch", "fr", "fy", "ga", "gd", "gl", "gom-latn", "gu", "he", "hi", "hr", "ht", "hu", "hy-am", "id", "is", "it-ch", "it", "ja", "jv", "ka", "kk", "km", "kn", "ko", "ku", "ky", "lb", "lo", "lt", "lv", "me", "mi", "mk", "ml", "mn", "mr", "ms-my", "ms", "mt", "my", "nb", "ne", "nl-be", "nl", "nn", "oc-lnc", "pa-in", "pl", "pt-br", "pt", "ro", "ru", "rw", "sd", "se", "si", "sk", "sl", "sq", "sr-cyrl", "sr", "ss", "sv-fi", "sv", "sw", "ta", "te", "tet", "tg", "th", "tk", "tl-ph", "tlh", "tr", "tzl", "tzm-latn", "tzm", "ug-cn", "uk", "ur", "uz-latn", "uz", "vi", "x-pseudo", "yo", "zh-cn", "zh-hk", "zh-tw", "zh", "et", "eu", "fa"];

        function n(e) {
            return "no" === e ? "nb" : !(!e || !a.includes(e)) && e
        }
        var o = n(V("lang", !0)) || n(E.get("files:lang:current")) || function () {
            if (_c.lang_auto && U.nav_langs)
                for (var e = 0; e < U.nav_langs.length; e++) {
                    var t = U.nav_langs[e].toLowerCase();
                    if (n(t)) return t;
                    var i = !!t.includes("-") && t.split("-")[0];
                    if (n(i)) return i
                }
        }() || n(_c.lang_default) || "en";
        ["en", "en-us"].includes(o) || i(o)
    }(),
    function () {
        var e = {
                bell: "M16,17H7V10.5C7,8 9,6 11.5,6C14,6 16,8 16,10.5M18,16V10.5C18,7.43 15.86,4.86 13,4.18V3.5A1.5,1.5 0 0,0 11.5,2A1.5,1.5 0 0,0 10,3.5V4.18C7.13,4.86 5,7.43 5,10.5V16L3,18V19H20V18M11.5,22A2,2 0 0,0 13.5,20H9.5A2,2 0 0,0 11.5,22Z",
                check: "M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z",
                close: "M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z",
                dots: "M12,16A2,2 0 0,1 14,18A2,2 0 0,1 12,20A2,2 0 0,1 10,18A2,2 0 0,1 12,16M12,10A2,2 0 0,1 14,12A2,2 0 0,1 12,14A2,2 0 0,1 10,12A2,2 0 0,1 12,10M12,4A2,2 0 0,1 14,6A2,2 0 0,1 12,8A2,2 0 0,1 10,6A2,2 0 0,1 12,4Z",
                expand: "M10,21V19H6.41L10.91,14.5L9.5,13.09L5,17.59V14H3V21H10M14.5,10.91L19,6.41V10H21V3H14V5H17.59L13.09,9.5L14.5,10.91Z",
                collapse: "M19.5,3.09L15,7.59V4H13V11H20V9H16.41L20.91,4.5L19.5,3.09M4,13V15H7.59L3.09,19.5L4.5,20.91L9,16.41V20H11V13H4Z",
                zoom_in: "M15.5,14L20.5,19L19,20.5L14,15.5V14.71L13.73,14.43C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.43,13.73L14.71,14H15.5M9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5C7,5 5,7 5,9.5C5,12 7,14 9.5,14M12,10H10V12H9V10H7V9H9V7H10V9H12V10Z",
                zoom_out: "M15.5,14H14.71L14.43,13.73C15.41,12.59 16,11.11 16,9.5A6.5,6.5 0 0,0 9.5,3A6.5,6.5 0 0,0 3,9.5A6.5,6.5 0 0,0 9.5,16C11.11,16 12.59,15.41 13.73,14.43L14,14.71V15.5L19,20.5L20.5,19L15.5,14M9.5,14C7,14 5,12 5,9.5C5,7 7,5 9.5,5C12,5 14,7 14,9.5C14,12 12,14 9.5,14M7,9H12V10H7V9Z",
                chevron_left: "M15.41,16.58L10.83,12L15.41,7.41L14,6L8,12L14,18L15.41,16.58Z",
                chevron_right: "M8.59,16.58L13.17,12L8.59,7.41L10,6L16,12L10,18L8.59,16.58Z",
                arrow_left: "M20,11V13H8L13.5,18.5L12.08,19.92L4.16,12L12.08,4.08L13.5,5.5L8,11H20Z",
                arrow_right: "M4,11V13H16L10.5,18.5L11.92,19.92L19.84,12L11.92,4.08L10.5,5.5L16,11H4Z",
                link: "M14,3V5H17.59L7.76,14.83L9.17,16.24L19,6.41V10H21V3M19,19H5V5H12V3H5C3.89,3 3,3.9 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V12H19V19Z",
                logout: "M14.08,15.59L16.67,13H7V11H16.67L14.08,8.41L15.5,7L20.5,12L15.5,17L14.08,15.59M19,3A2,2 0 0,1 21,5V9.67L19,7.67V5H5V19H19V16.33L21,14.33V19A2,2 0 0,1 19,21H5C3.89,21 3,20.1 3,19V5C3,3.89 3.89,3 5,3H19Z",
                download: "M5,20H19V18H5M19,9H15V3H9V9H5L12,16L19,9Z",
                tray_arrow_down: "M2 12H4V17H20V12H22V17C22 18.11 21.11 19 20 19H4C2.9 19 2 18.11 2 17V12M12 15L17.55 9.54L16.13 8.13L13 11.25V2H11V11.25L7.88 8.13L6.46 9.55L12 15Z",
                tray_arrow_up: "M2 12H4V17H20V12H22V17C22 18.11 21.11 19 20 19H4C2.9 19 2 18.11 2 17V12M12 2L6.46 7.46L7.88 8.88L11 5.75V15H13V5.75L16.13 8.88L17.55 7.45L12 2Z",
                content_copy: "M19,21H8V7H19M19,5H8A2,2 0 0,0 6,7V21A2,2 0 0,0 8,23H19A2,2 0 0,0 21,21V7A2,2 0 0,0 19,5M16,1H4A2,2 0 0,0 2,3V17H4V3H16V1Z",
                pencil: "M20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18,2.9 17.35,2.9 16.96,3.29L15.12,5.12L18.87,8.87M3,17.25V21H6.75L17.81,9.93L14.06,6.18L3,17.25Z",
                pencil_outline: "M14.06,9L15,9.94L5.92,19H5V18.08L14.06,9M17.66,3C17.41,3 17.15,3.1 16.96,3.29L15.13,5.12L18.88,8.87L20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18.17,3.09 17.92,3 17.66,3M14.06,6.19L3,17.25V21H6.75L17.81,9.94L14.06,6.19Z",
                plus_circle_multiple_outline: "M16,8H14V11H11V13H14V16H16V13H19V11H16M2,12C2,9.21 3.64,6.8 6,5.68V3.5C2.5,4.76 0,8.09 0,12C0,15.91 2.5,19.24 6,20.5V18.32C3.64,17.2 2,14.79 2,12M15,3C10.04,3 6,7.04 6,12C6,16.96 10.04,21 15,21C19.96,21 24,16.96 24,12C24,7.04 19.96,3 15,3M15,19C11.14,19 8,15.86 8,12C8,8.14 11.14,5 15,5C18.86,5 22,8.14 22,12C22,15.86 18.86,19 15,19Z",
                upload: "M9,16V10H5L12,3L19,10H15V16H9M5,20V18H19V20H5Z",
                clipboard: "M19,3H14.82C14.4,1.84 13.3,1 12,1C10.7,1 9.6,1.84 9.18,3H5A2,2 0 0,0 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5A2,2 0 0,0 19,3M12,3A1,1 0 0,1 13,4A1,1 0 0,1 12,5A1,1 0 0,1 11,4A1,1 0 0,1 12,3M7,7H17V5H19V19H5V5H7V7M7.5,13.5L9,12L11,14L15.5,9.5L17,11L11,17L7.5,13.5Z",
                save_edit: "M10,19L10.14,18.86C8.9,18.5 8,17.36 8,16A3,3 0 0,1 11,13C12.36,13 13.5,13.9 13.86,15.14L20,9V7L16,3H4C2.89,3 2,3.9 2,5V19A2,2 0 0,0 4,21H10V19M4,5H14V9H4V5M20.04,12.13C19.9,12.13 19.76,12.19 19.65,12.3L18.65,13.3L20.7,15.35L21.7,14.35C21.92,14.14 21.92,13.79 21.7,13.58L20.42,12.3C20.31,12.19 20.18,12.13 20.04,12.13M18.07,13.88L12,19.94V22H14.06L20.12,15.93L18.07,13.88Z",
                marker: "M18.27 6C19.28 8.17 19.05 10.73 17.94 12.81C17 14.5 15.65 15.93 14.5 17.5C14 18.2 13.5 18.95 13.13 19.76C13 20.03 12.91 20.31 12.81 20.59C12.71 20.87 12.62 21.15 12.53 21.43C12.44 21.69 12.33 22 12 22H12C11.61 22 11.5 21.56 11.42 21.26C11.18 20.53 10.94 19.83 10.57 19.16C10.15 18.37 9.62 17.64 9.08 16.93L18.27 6M9.12 8.42L5.82 12.34C6.43 13.63 7.34 14.73 8.21 15.83C8.42 16.08 8.63 16.34 8.83 16.61L13 11.67L12.96 11.68C11.5 12.18 9.88 11.44 9.3 10C9.22 9.83 9.16 9.63 9.12 9.43C9.07 9.06 9.06 8.79 9.12 8.43L9.12 8.42M6.58 4.62L6.57 4.63C4.95 6.68 4.67 9.53 5.64 11.94L9.63 7.2L9.58 7.15L6.58 4.62M14.22 2.36L11 6.17L11.04 6.16C12.38 5.7 13.88 6.28 14.56 7.5C14.71 7.78 14.83 8.08 14.87 8.38C14.93 8.76 14.95 9.03 14.88 9.4L14.88 9.41L18.08 5.61C17.24 4.09 15.87 2.93 14.23 2.37L14.22 2.36M9.89 6.89L13.8 2.24L13.76 2.23C13.18 2.08 12.59 2 12 2C10.03 2 8.17 2.85 6.85 4.31L6.83 4.32L9.89 6.89Z",
                info: "M11,9H13V7H11M12,20C7.59,20 4,16.41 4,12C4,7.59 7.59,4 12,4C16.41,4 20,7.59 20,12C20,16.41 16.41,20 12,20M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M11,17H13V11H11V17Z",
                folder: "M4 5v14h16V7h-8.414l-2-2H4zm8.414 0H21a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h7.414l2 2z",
                folder_plus: "M13 9h-2v3H8v2h3v3h2v-3h3v-2h-3z",
                folder_minus: "M7.874 12h8v2h-8z",
                folder_forbid: "M22 11.255a6.972 6.972 0 0 0-2-.965V7h-8.414l-2-2H4v14h7.29a6.96 6.96 0 0 0 .965 2H3a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h7.414l2 2H21a1 1 0 0 1 1 1v5.255zM18 22a5 5 0 1 1 0-10a5 5 0 0 1 0 10zm-1.293-2.292a3 3 0 0 0 4.001-4.001l-4.001 4zm-1.415-1.415l4.001-4a3 3 0 0 0-4.001 4.001z",
                folder_link: "M22 13h-2V7h-8.414l-2-2H4v14h9v2H3a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h7.414l2 2H21a1 1 0 0 1 1 1v7zm-4 4v-3.5l5 4.5l-5 4.5V19h-3v-2h3z",
                folder_open: "M12.414 5H21a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h7.414l2 2zM4 5v14h16V7h-8.414l-2-2H4zm8 7V9l4 4l-4 4v-3H8v-2h4z",
                folder_move_outline: "M20 18H4V8H20V18M12 6L10 4H4C2.9 4 2 4.89 2 6V18C2 19.11 2.9 20 4 20H20C21.11 20 22 19.11 22 18V8C22 6.9 21.11 6 20 6H12M11 14V12H15V9L19 13L15 17V14H11Z",
                alert_circle_outline: "M11,15H13V17H11V15M11,7H13V13H11V7M12,2C6.47,2 2,6.5 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20Z",
                date: "M12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22C6.47,22 2,17.5 2,12A10,10 0 0,1 12,2M12.5,7V12.25L17,14.92L16.25,16.15L11,13V7H12.5Z",
                camera: "M20,4H16.83L15,2H9L7.17,4H4A2,2 0 0,0 2,6V18A2,2 0 0,0 4,20H20A2,2 0 0,0 22,18V6A2,2 0 0,0 20,4M20,18H4V6H8.05L9.88,4H14.12L15.95,6H20V18M12,7A5,5 0 0,0 7,12A5,5 0 0,0 12,17A5,5 0 0,0 17,12A5,5 0 0,0 12,7M12,15A3,3 0 0,1 9,12A3,3 0 0,1 12,9A3,3 0 0,1 15,12A3,3 0 0,1 12,15Z",
                cellphone: "M17,19H7V5H17M17,1H7C5.89,1 5,1.89 5,3V21A2,2 0 0,0 7,23H17A2,2 0 0,0 19,21V3C19,1.89 18.1,1 17,1Z",
                plus: "M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z",
                minus: "M19,13H5V11H19V13Z",
                menu: "M3,6H21V8H3V6M3,11H21V13H3V11M3,16H21V18H3V16Z",
                menu_back: "M5,13L9,17L7.6,18.42L1.18,12L7.6,5.58L9,7L5,11H21V13H5M21,6V8H11V6H21M21,16V18H11V16H21Z",
                rotate_right: "M16.89,15.5L18.31,16.89C19.21,15.73 19.76,14.39 19.93,13H17.91C17.77,13.87 17.43,14.72 16.89,15.5M13,17.9V19.92C14.39,19.75 15.74,19.21 16.9,18.31L15.46,16.87C14.71,17.41 13.87,17.76 13,17.9M19.93,11C19.76,9.61 19.21,8.27 18.31,7.11L16.89,8.53C17.43,9.28 17.77,10.13 17.91,11M15.55,5.55L11,1V4.07C7.06,4.56 4,7.92 4,12C4,16.08 7.05,19.44 11,19.93V17.91C8.16,17.43 6,14.97 6,12C6,9.03 8.16,6.57 11,6.09V10L15.55,5.55Z",
                sort_name_asc: "M9.25 5L12.5 1.75L15.75 5H9.25M8.89 14.3H6L5.28 17H2.91L6 7H9L12.13 17H9.67L8.89 14.3M6.33 12.68H8.56L7.93 10.56L7.67 9.59L7.42 8.63H7.39L7.17 9.6L6.93 10.58L6.33 12.68M13.05 17V15.74L17.8 8.97V8.91H13.5V7H20.73V8.34L16.09 15V15.08H20.8V17H13.05Z",
                sort_name_desc: "M15.75 19L12.5 22.25L9.25 19H15.75M8.89 14.3H6L5.28 17H2.91L6 7H9L12.13 17H9.67L8.89 14.3M6.33 12.68H8.56L7.93 10.56L7.67 9.59L7.42 8.63H7.39L7.17 9.6L6.93 10.58L6.33 12.68M13.05 17V15.74L17.8 8.97V8.91H13.5V7H20.73V8.34L16.09 15V15.08H20.8V17H13.05Z",
                sort_kind_asc: "M3 11H15V13H3M3 18V16H21V18M3 6H9V8H3Z",
                sort_kind_desc: "M3,13H15V11H3M3,6V8H21V6M3,18H9V16H3V18Z",
                sort_size_asc: "M10,13V11H18V13H10M10,19V17H14V19H10M10,7V5H22V7H10M6,17H8.5L5,20.5L1.5,17H4V7H1.5L5,3.5L8.5,7H6V17Z",
                sort_size_desc: "M10,13V11H18V13H10M10,19V17H14V19H10M10,7V5H22V7H10M6,17H8.5L5,20.5L1.5,17H4V7H1.5L5,3.5L8.5,7H6V17Z",
                sort_date_asc: "M7.78 7C9.08 7.04 10 7.53 10.57 8.46C11.13 9.4 11.41 10.56 11.39 11.95C11.4 13.5 11.09 14.73 10.5 15.62C9.88 16.5 8.95 16.97 7.71 17C6.45 16.96 5.54 16.5 4.96 15.56C4.38 14.63 4.09 13.45 4.09 12S4.39 9.36 5 8.44C5.59 7.5 6.5 7.04 7.78 7M7.75 8.63C7.31 8.63 6.96 8.9 6.7 9.46C6.44 10 6.32 10.87 6.32 12C6.31 13.15 6.44 14 6.69 14.54C6.95 15.1 7.31 15.37 7.77 15.37C8.69 15.37 9.16 14.24 9.17 12C9.17 9.77 8.7 8.65 7.75 8.63M13.33 17V15.22L13.76 15.24L14.3 15.22L15.34 15.03C15.68 14.92 16 14.78 16.26 14.58C16.59 14.35 16.86 14.08 17.07 13.76C17.29 13.45 17.44 13.12 17.53 12.78L17.5 12.77C17.05 13.19 16.38 13.4 15.47 13.41C14.62 13.4 13.91 13.15 13.34 12.65S12.5 11.43 12.46 10.5C12.47 9.5 12.81 8.69 13.47 8.03C14.14 7.37 15 7.03 16.12 7C17.37 7.04 18.29 7.45 18.88 8.24C19.47 9 19.76 10 19.76 11.19C19.75 12.15 19.61 13 19.32 13.76C19.03 14.5 18.64 15.13 18.12 15.64C17.66 16.06 17.11 16.38 16.47 16.61C15.83 16.83 15.12 16.96 14.34 17H13.33M16.06 8.63C15.65 8.64 15.32 8.8 15.06 9.11C14.81 9.42 14.68 9.84 14.68 10.36C14.68 10.8 14.8 11.16 15.03 11.46C15.27 11.77 15.63 11.92 16.11 11.93C16.43 11.93 16.7 11.86 16.92 11.74C17.14 11.61 17.3 11.46 17.41 11.28C17.5 11.17 17.53 10.97 17.53 10.71C17.54 10.16 17.43 9.69 17.2 9.28C16.97 8.87 16.59 8.65 16.06 8.63M9.25 5L12.5 1.75L15.75 5H9.25",
                sort_date_desc: "M7.78 7C9.08 7.04 10 7.53 10.57 8.46C11.13 9.4 11.41 10.56 11.39 11.95C11.4 13.5 11.09 14.73 10.5 15.62C9.88 16.5 8.95 16.97 7.71 17C6.45 16.96 5.54 16.5 4.96 15.56C4.38 14.63 4.09 13.45 4.09 12S4.39 9.36 5 8.44C5.59 7.5 6.5 7.04 7.78 7M7.75 8.63C7.31 8.63 6.96 8.9 6.7 9.46C6.44 10 6.32 10.87 6.32 12C6.31 13.15 6.44 14 6.69 14.54C6.95 15.1 7.31 15.37 7.77 15.37C8.69 15.37 9.16 14.24 9.17 12C9.17 9.77 8.7 8.65 7.75 8.63M13.33 17V15.22L13.76 15.24L14.3 15.22L15.34 15.03C15.68 14.92 16 14.78 16.26 14.58C16.59 14.35 16.86 14.08 17.07 13.76C17.29 13.45 17.44 13.12 17.53 12.78L17.5 12.77C17.05 13.19 16.38 13.4 15.47 13.41C14.62 13.4 13.91 13.15 13.34 12.65S12.5 11.43 12.46 10.5C12.47 9.5 12.81 8.69 13.47 8.03C14.14 7.37 15 7.03 16.12 7C17.37 7.04 18.29 7.45 18.88 8.24C19.47 9 19.76 10 19.76 11.19C19.75 12.15 19.61 13 19.32 13.76C19.03 14.5 18.64 15.13 18.12 15.64C17.66 16.06 17.11 16.38 16.47 16.61C15.83 16.83 15.12 16.96 14.34 17H13.33M16.06 8.63C15.65 8.64 15.32 8.8 15.06 9.11C14.81 9.42 14.68 9.84 14.68 10.36C14.68 10.8 14.8 11.16 15.03 11.46C15.27 11.77 15.63 11.92 16.11 11.93C16.43 11.93 16.7 11.86 16.92 11.74C17.14 11.61 17.3 11.46 17.41 11.28C17.5 11.17 17.53 10.97 17.53 10.71C17.54 10.16 17.43 9.69 17.2 9.28C16.97 8.87 16.59 8.65 16.06 8.63M15.75 19L12.5 22.25L9.25 19H15.75Z",
                filesize: "M3,13H15V11H3M3,6V8H21V6M3,18H9V16H3V18Z",
                layout_list: "M7,5H21V7H7V5M7,13V11H21V13H7M4,4.5A1.5,1.5 0 0,1 5.5,6A1.5,1.5 0 0,1 4,7.5A1.5,1.5 0 0,1 2.5,6A1.5,1.5 0 0,1 4,4.5M4,10.5A1.5,1.5 0 0,1 5.5,12A1.5,1.5 0 0,1 4,13.5A1.5,1.5 0 0,1 2.5,12A1.5,1.5 0 0,1 4,10.5M7,19V17H21V19H7M4,16.5A1.5,1.5 0 0,1 5.5,18A1.5,1.5 0 0,1 4,19.5A1.5,1.5 0 0,1 2.5,18A1.5,1.5 0 0,1 4,16.5Z",
                layout_imagelist: "M3,4H7V8H3V4M9,5V7H21V5H9M3,10H7V14H3V10M9,11V13H21V11H9M3,16H7V20H3V16M9,17V19H21V17H9",
                layout_blocks: "M2 14H8V20H2M16 8H10V10H16M2 10H8V4H2M10 4V6H22V4M10 20H16V18H10M10 16H22V14H10",
                layout_grid: "M3,9H7V5H3V9M3,14H7V10H3V14M8,14H12V10H8V14M13,14H17V10H13V14M8,9H12V5H8V9M13,5V9H17V5H13M18,14H22V10H18V14M3,19H7V15H3V19M8,19H12V15H8V19M13,19H17V15H13V19M18,19H22V15H18V19M18,5V9H22V5H18Z",
                layout_rows: "M3,19H9V12H3V19M10,19H22V12H10V19M3,5V11H22V5H3Z",
                layout_columns: "M2,5V19H8V5H2M9,5V10H15V5H9M16,5V14H22V5H16M9,11V19H15V11H9M16,15V19H22V15H16Z",
                lock_outline: "M12,17C10.89,17 10,16.1 10,15C10,13.89 10.89,13 12,13A2,2 0 0,1 14,15A2,2 0 0,1 12,17M18,20V10H6V20H18M18,8A2,2 0 0,1 20,10V20A2,2 0 0,1 18,22H6C4.89,22 4,21.1 4,20V10C4,8.89 4.89,8 6,8H7V6A5,5 0 0,1 12,1A5,5 0 0,1 17,6V8H18M12,3A3,3 0 0,0 9,6V8H15V6A3,3 0 0,0 12,3Z",
                lock_open_outline: "M18,20V10H6V20H18M18,8A2,2 0 0,1 20,10V20A2,2 0 0,1 18,22H6C4.89,22 4,21.1 4,20V10A2,2 0 0,1 6,8H15V6A3,3 0 0,0 12,3A3,3 0 0,0 9,6H7A5,5 0 0,1 12,1A5,5 0 0,1 17,6V8H18M12,17A2,2 0 0,1 10,15A2,2 0 0,1 12,13A2,2 0 0,1 14,15A2,2 0 0,1 12,17Z",
                open_in_new: "M14,3V5H17.59L7.76,14.83L9.17,16.24L19,6.41V10H21V3M19,19H5V5H12V3H5C3.89,3 3,3.9 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V12H19V19Z",
                play: "M8,5.14V19.14L19,12.14L8,5.14Z",
                pause: "M14,19H18V5H14M6,19H10V5H6V19Z",
                menu_down: "M7,13L12,18L17,13H7Z",
                menu_up: "M7,12L12,7L17,12H7Z",
                home: "M20 6H12L10 4H4A2 2 0 0 0 2 6V18A2 2 0 0 0 4 20H20A2 2 0 0 0 22 18V8A2 2 0 0 0 20 6M17 13V17H15V14H13V17H11V13H9L14 9L19 13Z",
                image_search_outline: "M15.5,9C16.2,9 16.79,8.76 17.27,8.27C17.76,7.79 18,7.2 18,6.5C18,5.83 17.76,5.23 17.27,4.73C16.79,4.23 16.2,4 15.5,4C14.83,4 14.23,4.23 13.73,4.73C13.23,5.23 13,5.83 13,6.5C13,7.2 13.23,7.79 13.73,8.27C14.23,8.76 14.83,9 15.5,9M19.31,8.91L22.41,12L21,13.41L17.86,10.31C17.08,10.78 16.28,11 15.47,11C14.22,11 13.16,10.58 12.3,9.7C11.45,8.83 11,7.77 11,6.5C11,5.27 11.45,4.2 12.33,3.33C13.2,2.45 14.27,2 15.5,2C16.77,2 17.83,2.45 18.7,3.33C19.58,4.2 20,5.27 20,6.5C20,7.33 19.78,8.13 19.31,8.91M16.5,18H5.5L8.25,14.5L10.22,16.83L12.94,13.31L16.5,18M18,13L20,15V20C20,20.55 19.81,21 19.41,21.4C19,21.79 18.53,22 18,22H4C3.45,22 3,21.79 2.6,21.4C2.21,21 2,20.55 2,20V6C2,5.47 2.21,5 2.6,4.59C3,4.19 3.45,4 4,4H9.5C9.2,4.64 9.03,5.31 9,6H4V20H18V13Z",
                search: "M9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.44,13.73L14.71,14H15.5L20.5,19L19,20.5L14,15.5V14.71L13.73,14.44C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3M9.5,5C7,5 5,7 5,9.5C5,12 7,14 9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5Z",
                file_default: "M14,10H19.5L14,4.5V10M5,3H15L21,9V19A2,2 0 0,1 19,21H5C3.89,21 3,20.1 3,19V5C3,3.89 3.89,3 5,3M5,5V19H19V12H12V5H5Z",
                application: "M19,4C20.11,4 21,4.9 21,6V18A2,2 0 0,1 19,20H5C3.89,20 3,19.1 3,18V6A2,2 0 0,1 5,4H19M19,18V8H5V18H19Z",
                archive: "M14,17H12V15H10V13H12V15H14M14,9H12V11H14V13H12V11H10V9H12V7H10V5H12V7H14M19,3H5C3.89,3 3,3.89 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5C21,3.89 20.1,3 19,3Z",
                audio: "M14,3.23V5.29C16.89,6.15 19,8.83 19,12C19,15.17 16.89,17.84 14,18.7V20.77C18,19.86 21,16.28 21,12C21,7.72 18,4.14 14,3.23M16.5,12C16.5,10.23 15.5,8.71 14,7.97V16C15.5,15.29 16.5,13.76 16.5,12M3,9V15H7L12,20V4L7,9H3Z",
                cd: "M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,9A3,3 0 0,1 15,12A3,3 0 0,1 12,15A3,3 0 0,1 9,12A3,3 0 0,1 12,9Z",
                code: "M14.6,16.6L19.2,12L14.6,7.4L16,6L22,12L16,18L14.6,16.6M9.4,16.6L4.8,12L9.4,7.4L8,6L2,12L8,18L9.4,16.6Z",
                excel: "M16.2,17H14.2L12,13.2L9.8,17H7.8L11,12L7.8,7H9.8L12,10.8L14.2,7H16.2L13,12M19,3H5C3.89,3 3,3.89 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5C21,3.89 20.1,3 19,3Z",
                font: "M17,8H20V20H21V21H17V20H18V17H14L12.5,20H14V21H10V20H11L17,8M18,9L14.5,16H18V9M5,3H10C11.11,3 12,3.89 12,5V16H9V11H6V16H3V5C3,3.89 3.89,3 5,3M6,5V9H9V5H6Z",
                image: "M8.5,13.5L11,16.5L14.5,12L19,18H5M21,19V5C21,3.89 20.1,3 19,3H5A2,2 0 0,0 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19Z",
                pdf: "M19,3A2,2 0 0,1 21,5V19A2,2 0 0,1 19,21H5C3.89,21 3,20.1 3,19V5C3,3.89 3.89,3 5,3H19M10.59,10.08C10.57,10.13 10.3,11.84 8.5,14.77C8.5,14.77 5,16.58 5.83,17.94C6.5,19 8.15,17.9 9.56,15.27C9.56,15.27 11.38,14.63 13.79,14.45C13.79,14.45 17.65,16.19 18.17,14.34C18.69,12.5 15.12,12.9 14.5,13.09C14.5,13.09 12.46,11.75 12,9.89C12,9.89 13.13,5.95 11.38,6C9.63,6.05 10.29,9.12 10.59,10.08M11.4,11.13C11.43,11.13 11.87,12.33 13.29,13.58C13.29,13.58 10.96,14.04 9.9,14.5C9.9,14.5 10.9,12.75 11.4,11.13M15.32,13.84C15.9,13.69 17.64,14 17.58,14.32C17.5,14.65 15.32,13.84 15.32,13.84M8.26,15.7C7.73,16.91 6.83,17.68 6.6,17.67C6.37,17.66 7.3,16.07 8.26,15.7M11.4,8.76C11.39,8.71 11.03,6.57 11.4,6.61C11.94,6.67 11.4,8.71 11.4,8.76Z",
                powerpoint: "M9.8,13.4H12.3C13.8,13.4 14.46,13.12 15.1,12.58C15.74,12.03 16,11.25 16,10.23C16,9.26 15.75,8.5 15.1,7.88C14.45,7.29 13.83,7 12.3,7H8V17H9.8V13.4M19,3A2,2 0 0,1 21,5V19A2,2 0 0,1 19,21H5A2,2 0 0,1 3,19V5C3,3.89 3.9,3 5,3H19M9.8,12V8.4H12.1C12.76,8.4 13.27,8.65 13.6,9C13.93,9.35 14.1,9.72 14.1,10.24C14.1,10.8 13.92,11.19 13.6,11.5C13.28,11.81 12.9,12 12.22,12H9.8Z",
                text: "M14,17H7V15H14M17,13H7V11H17M17,9H7V7H17M19,3H5C3.89,3 3,3.89 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5C21,3.89 20.1,3 19,3Z",
                video: "M17,10.5V7A1,1 0 0,0 16,6H4A1,1 0 0,0 3,7V17A1,1 0 0,0 4,18H16A1,1 0 0,0 17,17V13.5L21,17.5V6.5L17,10.5Z",
                word: "M15.5,17H14L12,9.5L10,17H8.5L6.1,7H7.8L9.34,14.5L11.3,7H12.7L14.67,14.5L16.2,7H17.9M19,3H5C3.89,3 3,3.89 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5C21,3.89 20.1,3 19,3Z",
                translate: "M12.87,15.07L10.33,12.56L10.36,12.53C12.1,10.59 13.34,8.36 14.07,6H17V4H10V2H8V4H1V6H12.17C11.5,7.92 10.44,9.75 9,11.35C8.07,10.32 7.3,9.19 6.69,8H4.69C5.42,9.63 6.42,11.17 7.67,12.56L2.58,17.58L4,19L9,14L12.11,17.11L12.87,15.07M18.5,10H16.5L12,22H14L15.12,19H19.87L21,22H23L18.5,10M15.88,17L17.5,12.67L19.12,17H15.88Z",
                web: "M16.36,14C16.44,13.34 16.5,12.68 16.5,12C16.5,11.32 16.44,10.66 16.36,10H19.74C19.9,10.64 20,11.31 20,12C20,12.69 19.9,13.36 19.74,14M14.59,19.56C15.19,18.45 15.65,17.25 15.97,16H18.92C17.96,17.65 16.43,18.93 14.59,19.56M14.34,14H9.66C9.56,13.34 9.5,12.68 9.5,12C9.5,11.32 9.56,10.65 9.66,10H14.34C14.43,10.65 14.5,11.32 14.5,12C14.5,12.68 14.43,13.34 14.34,14M12,19.96C11.17,18.76 10.5,17.43 10.09,16H13.91C13.5,17.43 12.83,18.76 12,19.96M8,8H5.08C6.03,6.34 7.57,5.06 9.4,4.44C8.8,5.55 8.35,6.75 8,8M5.08,16H8C8.35,17.25 8.8,18.45 9.4,19.56C7.57,18.93 6.03,17.65 5.08,16M4.26,14C4.1,13.36 4,12.69 4,12C4,11.31 4.1,10.64 4.26,10H7.64C7.56,10.66 7.5,11.32 7.5,12C7.5,12.68 7.56,13.34 7.64,14M12,4.03C12.83,5.23 13.5,6.57 13.91,8H10.09C10.5,6.57 11.17,5.23 12,4.03M18.92,8H15.97C15.65,6.75 15.19,5.55 14.59,4.44C16.43,5.07 17.96,6.34 18.92,8M12,2C6.47,2 2,6.5 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z"
            },
            t = {
                application: '<path d="M35 14C36.11 14 37 14.9 37 16V28A2 2 0 0 1 35 30H21C19.89 30 19 29.1 19 28V16A2 2 0 0 1 21 14H35M35 28V18H21V28H35z"/>',
                archive: '<path d="M28.5,24v-2h2v-2h-2v-2h2v-2h-2v-2h2v-2h-2v-2h2V8h-2V6h-2v2h-2v2h2v2h-2v2h2v2h-2v2h2v2h-2v2h2v2 h-4v5c0,2.757,2.243,5,5,5s5-2.243,5-5v-5H28.5z M30.5,29c0,1.654-1.346,3-3,3s-3-1.346-3-3v-3h6V29z"/><path d="M26.5,30h2c0.552,0,1-0.447,1-1s-0.448-1-1-1h-2c-0.552,0-1,0.447-1,1S25.948,30,26.5,30z"/></g>',
                audio: '<path d="M35.67,14.986c-0.567-0.796-1.3-1.543-2.308-2.351c-3.914-3.131-4.757-6.277-4.862-6.738V5 c0-0.553-0.447-1-1-1s-1,0.447-1,1v1v8.359v9.053h-3.706c-3.882,0-6.294,1.961-6.294,5.117c0,3.466,2.24,5.706,5.706,5.706 c3.471,0,6.294-2.823,6.294-6.294V16.468l0.298,0.243c0.34,0.336,0.861,0.72,1.521,1.205c2.318,1.709,6.2,4.567,5.224,7.793 C35.514,25.807,35.5,25.904,35.5,26c0,0.43,0.278,0.826,0.71,0.957C36.307,26.986,36.404,27,36.5,27c0.43,0,0.826-0.278,0.957-0.71 C39.084,20.915,37.035,16.9,35.67,14.986z M26.5,27.941c0,2.368-1.926,4.294-4.294,4.294c-2.355,0-3.706-1.351-3.706-3.706 c0-2.576,2.335-3.117,4.294-3.117H26.5V27.941z M31.505,16.308c-0.571-0.422-1.065-0.785-1.371-1.081l-1.634-1.34v-3.473 c0.827,1.174,1.987,2.483,3.612,3.783c0.858,0.688,1.472,1.308,1.929,1.95c0.716,1.003,1.431,2.339,1.788,3.978 C34.502,18.515,32.745,17.221,31.505,16.308z"/>',
                cd: '<circle cx="27.5" cy="21" r="12"/><circle style="fill:#e9e9e0" cx="27.5" cy="21" r="3"/><path style="fill:#d3ccc9" d="M25.379,18.879c0.132-0.132,0.276-0.245,0.425-0.347l-2.361-8.813 c-1.615,0.579-3.134,1.503-4.427,2.796c-1.294,1.293-2.217,2.812-2.796,4.427l8.813,2.361 C25.134,19.155,25.247,19.011,25.379,18.879z"/><path style="fill:#d3ccc9" d="M30.071,23.486l2.273,8.483c1.32-0.582,2.56-1.402,3.641-2.484c1.253-1.253,2.16-2.717,2.743-4.275 l-8.188-2.194C30.255,22.939,29.994,23.2,30.071,23.486z"/>',
                code: '<path d="M15.5,24c-0.256,0-0.512-0.098-0.707-0.293c-0.391-0.391-0.391-1.023,0-1.414l6-6 c0.391-0.391,1.023-0.391,1.414,0s0.391,1.023,0,1.414l-6,6C16.012,23.902,15.756,24,15.5,24z"/><path d="M21.5,30c-0.256,0-0.512-0.098-0.707-0.293l-6-6c-0.391-0.391-0.391-1.023,0-1.414 s1.023-0.391,1.414,0l6,6c0.391,0.391,0.391,1.023,0,1.414C22.012,29.902,21.756,30,21.5,30z"/><path d="M33.5,30c-0.256,0-0.512-0.098-0.707-0.293c-0.391-0.391-0.391-1.023,0-1.414l6-6 c0.391-0.391,1.023-0.391,1.414,0s0.391,1.023,0,1.414l-6,6C34.012,29.902,33.756,30,33.5,30z"/><path d="M39.5,24c-0.256,0-0.512-0.098-0.707-0.293l-6-6c-0.391-0.391-0.391-1.023,0-1.414 s1.023-0.391,1.414,0l6,6c0.391,0.391,0.391,1.023,0,1.414C40.012,23.902,39.756,24,39.5,24z"/><path d="M24.5,32c-0.11,0-0.223-0.019-0.333-0.058c-0.521-0.184-0.794-0.755-0.61-1.276l6-17 c0.185-0.521,0.753-0.795,1.276-0.61c0.521,0.184,0.794,0.755,0.61,1.276l-6,17C25.298,31.744,24.912,32,24.5,32z"/>',
                font: '<path d="M33 18H36V30H37V31H33V30H34V27H30L28.5 30H30V31H26V30H27L33 18M34 19L30.5 26H34V19M21 13H26C27.11 13 28 13.89 28 15V26H25V21H22V26H19V15C19 13.89 19.89 13 21 13M22 15V19H25V15H22z"/>',
                excel: '<path style="fill:#c8bdb8" d="M23.5,16v-4h-12v4v2v2v2v2v2v2v2v4h10h2h21v-4v-2v-2v-2v-2v-2v-4H23.5z M13.5,14h8v2h-8V14z M13.5,18h8v2h-8V18z M13.5,22h8v2h-8V22z M13.5,26h8v2h-8V26z M21.5,32h-8v-2h8V32z M42.5,32h-19v-2h19V32z M42.5,28h-19v-2h19V28 z M42.5,24h-19v-2h19V24z M23.5,20v-2h19v2H23.5z"/>',
                image: '<circle style="fill:#f3d55b" cx="18.931" cy="14.431" r="4.569"/><polygon style="fill:#88c057" points="6.5,39 17.5,39 49.5,39 49.5,28 39.5,18.5 29,30 23.517,24.517"/>',
                pdf: '<path d="M19.514,33.324L19.514,33.324c-0.348,0-0.682-0.113-0.967-0.326 c-1.041-0.781-1.181-1.65-1.115-2.242c0.182-1.628,2.195-3.332,5.985-5.068c1.504-3.296,2.935-7.357,3.788-10.75 c-0.998-2.172-1.968-4.99-1.261-6.643c0.248-0.579,0.557-1.023,1.134-1.215c0.228-0.076,0.804-0.172,1.016-0.172 c0.504,0,0.947,0.649,1.261,1.049c0.295,0.376,0.964,1.173-0.373,6.802c1.348,2.784,3.258,5.62,5.088,7.562 c1.311-0.237,2.439-0.358,3.358-0.358c1.566,0,2.515,0.365,2.902,1.117c0.32,0.622,0.189,1.349-0.39,2.16 c-0.557,0.779-1.325,1.191-2.22,1.191c-1.216,0-2.632-0.768-4.211-2.285c-2.837,0.593-6.15,1.651-8.828,2.822 c-0.836,1.774-1.637,3.203-2.383,4.251C21.273,32.654,20.389,33.324,19.514,33.324z M22.176,28.198 c-2.137,1.201-3.008,2.188-3.071,2.744c-0.01,0.092-0.037,0.334,0.431,0.692C19.685,31.587,20.555,31.19,22.176,28.198z M35.813,23.756c0.815,0.627,1.014,0.944,1.547,0.944c0.234,0,0.901-0.01,1.21-0.441c0.149-0.209,0.207-0.343,0.23-0.415 c-0.123-0.065-0.286-0.197-1.175-0.197C37.12,23.648,36.485,23.67,35.813,23.756z M28.343,17.174 c-0.715,2.474-1.659,5.145-2.674,7.564c2.09-0.811,4.362-1.519,6.496-2.02C30.815,21.15,29.466,19.192,28.343,17.174z M27.736,8.712c-0.098,0.033-1.33,1.757,0.096,3.216C28.781,9.813,27.779,8.698,27.736,8.712z"/>',
                powerpoint: '<path style="fill:#c8bdb8" d="M39.5,30h-24V14h24V30z M17.5,28h20V16h-20V28z"/><path style="fill:#c8bdb8" d="M20.499,35c-0.175,0-0.353-0.046-0.514-0.143c-0.474-0.284-0.627-0.898-0.343-1.372l3-5 c0.284-0.474,0.898-0.627,1.372-0.343c0.474,0.284,0.627,0.898,0.343,1.372l-3,5C21.17,34.827,20.839,35,20.499,35z"/><path style="fill:#c8bdb8" d="M34.501,35c-0.34,0-0.671-0.173-0.858-0.485l-3-5c-0.284-0.474-0.131-1.088,0.343-1.372 c0.474-0.283,1.088-0.131,1.372,0.343l3,5c0.284,0.474,0.131,1.088-0.343,1.372C34.854,34.954,34.676,35,34.501,35z"/><path style="fill:#c8bdb8" d="M27.5,16c-0.552,0-1-0.447-1-1v-3c0-0.553,0.448-1,1-1s1,0.447,1,1v3C28.5,15.553,28.052,16,27.5,16 z"/><rect x="17.5" y="16" style="fill:#d3ccc9" width="20" height="12"/>',
                text: '<path d="M12.5,13h6c0.553,0,1-0.448,1-1s-0.447-1-1-1h-6c-0.553,0-1,0.448-1,1S11.947,13,12.5,13z"/><path d="M12.5,18h9c0.553,0,1-0.448,1-1s-0.447-1-1-1h-9c-0.553,0-1,0.448-1,1S11.947,18,12.5,18z"/><path d="M25.5,18c0.26,0,0.52-0.11,0.71-0.29c0.18-0.19,0.29-0.45,0.29-0.71c0-0.26-0.11-0.52-0.29-0.71 c-0.38-0.37-1.04-0.37-1.42,0c-0.181,0.19-0.29,0.44-0.29,0.71s0.109,0.52,0.29,0.71C24.979,17.89,25.24,18,25.5,18z"/><path d="M29.5,18h8c0.553,0,1-0.448,1-1s-0.447-1-1-1h-8c-0.553,0-1,0.448-1,1S28.947,18,29.5,18z"/><path d="M11.79,31.29c-0.181,0.19-0.29,0.44-0.29,0.71s0.109,0.52,0.29,0.71 C11.979,32.89,12.229,33,12.5,33c0.27,0,0.52-0.11,0.71-0.29c0.18-0.19,0.29-0.45,0.29-0.71c0-0.26-0.11-0.52-0.29-0.71 C12.84,30.92,12.16,30.92,11.79,31.29z"/><path d="M24.5,31h-8c-0.553,0-1,0.448-1,1s0.447,1,1,1h8c0.553,0,1-0.448,1-1S25.053,31,24.5,31z"/><path d="M41.5,18h2c0.553,0,1-0.448,1-1s-0.447-1-1-1h-2c-0.553,0-1,0.448-1,1S40.947,18,41.5,18z"/><path d="M12.5,23h22c0.553,0,1-0.448,1-1s-0.447-1-1-1h-22c-0.553,0-1,0.448-1,1S11.947,23,12.5,23z"/><path d="M43.5,21h-6c-0.553,0-1,0.448-1,1s0.447,1,1,1h6c0.553,0,1-0.448,1-1S44.053,21,43.5,21z"/><path d="M12.5,28h4c0.553,0,1-0.448,1-1s-0.447-1-1-1h-4c-0.553,0-1,0.448-1,1S11.947,28,12.5,28z"/><path d="M30.5,26h-10c-0.553,0-1,0.448-1,1s0.447,1,1,1h10c0.553,0,1-0.448,1-1S31.053,26,30.5,26z"/><path d="M43.5,26h-9c-0.553,0-1,0.448-1,1s0.447,1,1,1h9c0.553,0,1-0.448,1-1S44.053,26,43.5,26z"/>',
                video: '<path d="M24.5,28c-0.166,0-0.331-0.041-0.481-0.123C23.699,27.701,23.5,27.365,23.5,27V13 c0-0.365,0.199-0.701,0.519-0.877c0.321-0.175,0.71-0.162,1.019,0.033l11,7C36.325,19.34,36.5,19.658,36.5,20 s-0.175,0.66-0.463,0.844l-11,7C24.874,27.947,24.687,28,24.5,28z M25.5,14.821v10.357L33.637,20L25.5,14.821z"/><path d="M28.5,35c-8.271,0-15-6.729-15-15s6.729-15,15-15s15,6.729,15,15S36.771,35,28.5,35z M28.5,7 c-7.168,0-13,5.832-13,13s5.832,13,13,13s13-5.832,13-13S35.668,7,28.5,7z"/>'
            };

        function i(e, t, i) {
            return '<svg viewBox="0 0 48 48" class="svg-folder ' + e + '"><path class="svg-folder-bg" d="M40 12H22l-4-4H8c-2.2 0-4 1.8-4 4v8h40v-4c0-2.2-1.8-4-4-4z"/><path class="svg-folder-fg" d="M40 12H8c-2.2 0-4 1.8-4 4v20c0 2.2 1.8 4 4 4h32c2.2 0 4-1.8 4-4V16c0-2.2-1.8-4-4-4z"/>' + (t ? '<path class="svg-folder-symlink" d="M 39.231 23.883 L 28.485 32.862 L 28.485 14.902 Z"/><path class="svg-folder-symlink" d="M 10.065 30.022 L 10.065 40 L 16.205 40 L 16.205 30.022 C 16.205 28.334 17.587 26.953 19.275 26.953 L 32.323 26.953 L 32.323 20.812 L 19.275 20.812 C 14.21 20.812 10.065 24.956 10.065 30.022 Z"/>' : "") + (i ? "" : '<path class="svg-folder-forbidden" d="M 34.441 26.211 C 34.441 31.711 29.941 36.211 24.441 36.211 C 18.941 36.211 14.441 31.711 14.441 26.211 C 14.441 20.711 18.941 16.211 24.441 16.211 C 29.941 16.211 34.441 20.711 34.441 26.211"/><path style="fill:#FFF;" d="M 22.941 19.211 L 25.941 19.211 L 25.941 28.211 L 22.941 28.211 Z M 22.941 19.211"/><path style="fill:#FFF;" d="M 22.941 30.211 L 25.941 30.211 L 25.941 33.211 L 22.941 33.211 Z M 22.941 30.211"/>') + "</svg>"
        }
        t.word = t.text;
        var a = {
                application: ["app", "exe"],
                archive: ["gz", "zip", "7z", "7zip", "arj", "rar", "gzip", "bz2", "bzip2", "tar", "x-gzip"],
                cd: ["dmg", "iso", "bin", "cd", "cdr", "cue", "disc", "disk", "dsk", "dvd", "dvdr", "hdd", "hdi", "hds", "hfs", "hfv", "ima", "image", "imd", "img", "mdf", "mdx", "nrg", "omg", "toast", "cso", "mds"],
                code: ["php", "x-php", "js", "css", "xml", "json", "html", "htm", "py", "jsx", "scss", "clj", "less", "rb", "sql", "ts", "yml"],
                excel: ["xls", "xlt", "xlm", "xlsx", "xlsm", "xltx", "xltm", "xlsb", "xla", "xlam", "xll", "xlw", "csv"],
                font: ["ttf", "otf", "woff", "woff2", "eot", "ttc"],
                image: ["wbmp", "tiff", "webp", "psd", "ai", "eps", "jpg", "jpeg", "webp", "png", "gif", "bmp"],
                pdf: ["pdf"],
                powerpoint: ["ppt", "pot", "pps", "pptx", "pptm", "potx", "potm", "ppam", "ppsx", "ppsm", "sldx", "sldm"],
                text: ["epub", "rtf"],
                word: ["doc", "dot", "docx", "docm", "dotx", "dotm", "docb", "odt", "wbk"]
            },
            n = {};

        function o(e) {
            return e.hasOwnProperty("icon") ? e.icon : e.icon = function () {
                if (e.mime0 && ["archive", "audio", "image", "video"].includes(e.mime0)) return e.mime0;
                var t = !!e.mime1 && n[e.mime1];
                if (t) return t;
                var i = !!e.ext && n[e.ext];
                return i || "text" === e.mime0 && "text"
            }()
        }
        k(Object.keys(a), (function (e) {
            k(a[e], (function (t) {
                n[t] = e
            }))
        })), P.get_svg_icon = function (t) {
            return '<svg viewBox="0 0 24 24" class="svg-icon svg-' + t + '"><path class="svg-path-' + t + '" d="' + e[t] + '" /></svg>'
        }, P.get_svg_icon_class = function (t, i) {
            return '<svg viewBox="0 0 24 24" class="' + i + '"><path class="svg-path-' + t + '" d="' + e[t] + '" /></svg>'
        }, P.get_svg_icon_multi = function () {
            for (var t = arguments, i = t.length, a = "", n = 0; n < i; n++) a += '<path class="svg-path-' + t[n] + '" d="' + e[t[n]] + '" />';
            return '<svg viewBox="0 0 24 24" class="svg-icon svg-' + t[0] + '">' + a + "</svg>"
        }, P.get_svg_icon_multi_class = function (t) {
            for (var i = arguments, a = i.length, n = "", o = 1; o < a; o++) n += '<path class="svg-path-' + i[o] + '" d="' + e[i[o]] + '" />';
            return '<svg viewBox="0 0 24 24" class="' + t + '">' + n + "</svg>"
        }, P.get_svg_icon_files = function (e) {
            return e.is_dir ? i("svg-icon", e.is_link, e.is_readable) : P.get_svg_icon(o(e) || "file_default")
        }, P.get_svg_large = function (e, a) {
            if (e.is_dir) return i(a, e.is_link, e.is_readable);
            var n = o(e),
                l = e.ext && e.ext.length < 6 ? e.ext : "image" === n && e.mime1;
            return '<svg viewBox="0 0 56 56" class="svg-file svg-' + (n || "none") + (a ? " " + a : "") + '"><path class="svg-file-bg" d="M36.985,0H7.963C7.155,0,6.5,0.655,6.5,1.926V55c0,0.345,0.655,1,1.463,1h40.074 c0.808,0,1.463-0.655,1.463-1V12.978c0-0.696-0.093-0.92-0.257-1.085L37.607,0.257C37.442,0.093,37.218,0,36.985,0z"/><polygon  class="svg-file-flip" points="37.5,0.151 37.5,12 49.349,12"/>' + (n ? '<g class="svg-file-icon">' + t[n] + "</g>" : "") + (l ? '<path class="svg-file-text-bg" d="M48.037,56H7.963C7.155,56,6.5,55.345,6.5,54.537V39h43v15.537C49.5,55.345,48.845,56,48.037,56z"/><text class="svg-file-ext' + (l.length > 3 ? " f_" + (15 - l.length) : "") + '" x="28" y="51.5">' + l + "</text>" : "") + (e.is_readable ? "" : '<path class="svg-file-forbidden" d="M 40.691 24.958 C 40.691 31.936 34.982 37.645 28.003 37.645 C 21.026 37.645 15.317 31.936 15.317 24.958 C 15.317 17.98 21.026 12.271 28.003 12.271 C 34.982 12.271 40.691 17.98 40.691 24.958"/><path style="fill: #FFF;" d="M 26.101 16.077 L 29.907 16.077 L 29.907 27.495 L 26.101 27.495 Z M 26.101 16.077"/><path style="fill: #FFF;" d="M 26.101 30.033 L 29.907 30.033 L 29.907 33.839 L 26.101 33.839 Z M 26.101 30.033"/>') + "</svg>"
        }
    }(),
    function () {
        if (_c.breadcrumbs) {
            N.topbar_breadcrumbs = _id("topbar-breadcrumbs"), N.breadcrumbs_info = N.topbar_breadcrumbs.firstElementChild;
            var e = function () {
                    if (!U.download || !_c.download_dir || "files" === _c.download_dir && !U.is_pointer) return !1;
                    var t = "files" === _c.download_dir;
                    N.topbar_breadcrumbs.insertAdjacentHTML("afterbegin", "<" + (t ? "button" : 'a href="#" target="_blank"') + " style=\"display:none;--tooltip-append:' " + (t ? X.get("files") : "zip") + '\'" class="download-dir tooltip-left"' + _("download", !0) + (t ? "" : " download") + ">" + P.get_svg_icon("tray_arrow_down") + "</" + (t ? "button" : "a") + ">");
                    var i = N.topbar_breadcrumbs.firstElementChild;
                    return y(i, (function (t) {
                        if (!G) return t.preventDefault(), te.fire();
                        if ("zip" === _c.download_dir) x(e, "download-dir-disabled", !0, 1e3);
                        else if ("files" === _c.download_dir) {
                            t.preventDefault();
                            var i = [],
                                a = 0;
                            _c.file_names.forEach((function (e) {
                                var t = _c.current_dir.files[e];
                                !t.is_dir && t.url_path && i.push(encodeURI(t.url_path))
                            })), i.length && function e() {
                                new jsFileDownloader({
                                    url: i[a]
                                }).then((function () {
                                    a++ < i.length - 1 && e()
                                }))
                            }()
                        }
                    })), i
                }(),
                a = !!_c.allow_upload && function () {
                    N.topbar_breadcrumbs.insertAdjacentHTML("afterbegin", '<button id="fm-upload" style="display:none" class="fm-upload tooltip-left"' + _("upload", !0) + ">" + P.get_svg_icon("tray_arrow_up") + "</button>");
                    var e = N.topbar_breadcrumbs.firstElementChild;
                    return y(e, (e => {
                        Z(), q.uppy && q.uppy.setMeta({
                            path: _c.current_path
                        })
                    })), e
                }();
            P.breadcrumbs_info = function () {
                var t = _c.current_dir,
                    i = _c.files_count,
                    n = i && t.images_count === i ? "images" : i && !t.files_count ? "folders" : "files";
                N.breadcrumbs_info.innerHTML = i + ' <span data-lang="' + n + '" class="breadcrumbs-info-type">' + X.get(n) + "</span>" + (t.dirsize ? '<span class="breadcrumbs-info-size">' + filesize(t.dirsize) + "</span>" : ""), A(N.breadcrumbs_info), e && ("zip" === _c.download_dir && (e.setAttribute("href", t.files_count && G ? _c.script + "?download_dir_zip=" + encodeURIComponent(t.path) + "&" + t.mtime : "#"), e.download = t.files_count && G ? t.basename + ".zip" : ""), A(e, !t.files_count)), q.uppy && A(a, !t.is_writeable)
            }, N.breadcrumbs = _id("breadcrumbs");
            var n = [],
                o = [];
            N.breadcrumbs.innerHTML = l("", P.get_svg_icon("home")), P.set_breadcrumbs = function (t) {
                if (q.uppy && A(a, !0), e && A(e, !0), A(N.breadcrumbs_info, !0), n = t.split("/").filter(Boolean), o.length) {
                    var i = [];
                    k(o, (function (e, t) {
                        (i.length || e !== n[t]) && i.unshift(N.breadcrumbs.children[t + 1])
                    })), i.length ? r(i, !0) : (N.breadcrumbs.lastChild.classList.remove("crumb-active"), p())
                } else p()
            }, y(N.breadcrumbs, (function (e) {
                "A" !== e.target.nodeName || b(e, e.target) || P.get_files(e.target.dataset.path, "push")
            }))
        }

        function l(e, i) {
            return '<span class="crumb"><a href="' + s(e) + '" data-path="' + t(e) + '" class="crumb-link">' + i + "</a></span>"
        }

        function r(e, t) {
            var i = {
                targets: e,
                translateX: t ? [0, -2] : [-2, 0],
                opacity: t ? [1, 0] : [0, 1],
                easing: "easeOutQuad",
                duration: 150,
                delay: anime.stagger(Math.round(100 / e.length))
            };
            t && (i.complete = function () {
                c(e, N.breadcrumbs), p()
            }), anime(i)
        }

        function p() {
            var e = "",
                t = [],
                a = "";
            n.length && k(n, (function (n, s) {
                e += e ? "/" + n : n, (t.length || n !== o[s]) && (a += l(e, i(n)), t.push(s + 1))
            })), t.length && (N.breadcrumbs.insertAdjacentHTML("beforeend", a), r(function (e, t) {
                for (var i = [], a = e.length, n = 0; n < a; n++) {
                    var o = t(e[n], n);
                    o && i.push(o)
                }
                return i
            }(t, (function (e) {
                return N.breadcrumbs.children[e]
            })))), o = n.slice(0), N.breadcrumbs.lastChild != N.breadcrumbs.firstChild && N.breadcrumbs.lastChild.classList.add("crumb-active")
        }
    }(), _c.prevent_right_click && (y(document, (function (e) {
            ("IMG" === e.target.nodeName || "VIDEO" === e.target.nodeName || e.target.closest(".menu-li") || e.target.closest(".files-a")) && e.preventDefault()
        }), "contextmenu"), document.documentElement.style.setProperty("--touch-callout", "none")),
        function () {
            var e = q.contextmenu = {},
                a = N.contextmenu = _id("contextmenu");

            function s(e, t, i, a, n) {
                return a ? '<button class="dropdown-item' + (n ? " " + n : "") + '" data-action="' + i + '" data-lang="' + e + '">' + (t ? P.get_svg_icon(t) : "") + X.get(e) + "</button>" : ""
            }

            function r() {
                e.is_open && c()
            }

            function c(t) {
                if (t != e.is_open) {
                    var i = (t ? "add" : "remove") + "EventListener";
                    document.documentElement[i]("click", r), document[i]("contextmenu", r), document[i]("visibilitychange", r), window[i]("blur", r), window[i]("scroll", r), q.popup && q.popup.topbar && q.popup.topbar[i]("click", r), N.sidebar_menu && N.sidebar_menu[i]("scroll", r)
                }
                e.el.classList.toggle("cm-active", t), e.a && e.a.classList.toggle("cm-active", t), t != e.is_open && (anime.remove(a), anime({
                    targets: a,
                    opacity: t ? [0, 1] : 0,
                    easing: "easeOutQuart",
                    duration: 150,
                    complete: t ? null : function () {
                        a.style.cssText = null
                    }
                })), e.is_open = !!t
            }
            P.create_contextmenu = function (r, p, d, m, u) {
                if (_c.context_menu && d && m) {
                    if (e.is_open) {
                        if (d == e.el) return r.preventDefault();
                        e.el && e.el.classList.remove("cm-active"), e.a && e.a.classList.remove("cm-active")
                    }
                    r.stopPropagation(), d === e.el && m === e.item || (a.innerHTML = '<h6 class="dropdown-header" title="' + t(m.basename) + '">' + i(m.basename) + "</h6>" + s("zoom", null, "popup", "popup" !== p && m.browser_image && m.is_readable) + s("open", null, "folder", "sidebar" !== p && m.is_dir) + s("show info", null, "modal", !["modal", "popup"].includes(p)) + function (e, t) {
                        var i = !!e && l(e);
                        return i && "#" !== i ? '<a class="' + t + '" href="' + i + '" target="_blank" data-lang="open in new tab">' + X.get("open in new tab") + "</a>" : ""
                    }(m, "dropdown-item") + s("copy link", null, "clipboard", U.url && U.clipboard && m.url_path) + function (e, t) {
                        return U.download && !e.is_dir && e.is_readable ? '<a href="' + o(e, !0) + '" class="' + t + '" data-lang="download" download>' + X.get("download") + "</a>" : ""
                    }(m, "dropdown-item") + n.a(m.gps, "dropdown-item", !0) + function () {
                        if ("popup" === p) return "";
                        var e = s("delete", "close", "delete", _c.allow_delete, "fm-action") + s("new folder", "plus", "new_folder", _c.allow_new_folder && m.is_dir, "fm-action") + s("new file", "plus", "new_file", _c.allow_new_file && m.is_dir, "fm-action") + s("rename", "pencil_outline", "rename", _c.allow_rename, "fm-action") + s("duplicate", "plus_circle_multiple_outline", "duplicate", _c.allow_duplicate && !m.is_dir, "fm-action") + s("upload", "tray_arrow_up", "upload", q.uppy && m.is_dir, "fm-action");
                        return e ? '<div class="context-fm">' + e + "</div>" : ""
                    }()), a.style.display = "block";
                    var f = d.getBoundingClientRect(),
                        v = (d.clientHeight > 50 ? r.clientY : f.top) - a.clientHeight - 10,
                        g = d.clientHeight > 50 ? r.clientY + 20 : f.bottom + 10,
                        _ = v >= 0,
                        h = !_ && g + a.clientHeight <= document.documentElement.clientHeight;
                    a.style.top = Math.round(h ? g : Math.max(0, v)) + "px";
                    var x = (d.clientWidth > 100 ? r.clientX : f.left + d.offsetWidth / 2) - a.clientWidth / 2,
                        b = Math.max(10, Math.min(document.documentElement.clientWidth - a.clientWidth - 10, x));
                    a.style.left = Math.round(b) + "px", a.style.setProperty("--offset", Math.round(Math.max(10, Math.min(a.clientWidth - 10, a.clientWidth / 2 - b + x))) + "px"), a.classList.toggle("cm-top", _), a.classList.toggle("cm-bottom", h), a.classList.toggle("cm-border", "sidebar" === p), e.el = d, e.item = m, e.a = u || !1, c(!0), r.preventDefault()
                }
            }, p(a, (function (t, i) {
                var a, n;
                ae[t] ? ae[t](e.item) : "upload" === t ? (Z(), q.uppy.setMeta({
                    path: e.item.path
                }), q.uppy.getPlugin("Dashboard").openModal()) : "popup" === t ? (_c.history && q.modal.open && q.modal.popstate.remove(), P.open_popup(e.item)) : "folder" === t ? (q.modal.open && P.close_modal(), P.get_files(e.item.path, "push")) : "modal" === t ? P.open_modal(e.item, !0) : "clipboard" === t && (a = l(e.item), (n = new URL(a, location)) && h(n.href))
            }))
        }(), q.dropdown = {},
        function () {
            var e, t = U.pointer_events ? "pointerdown" : U.only_touch ? "touchstart" : "mousedown",
                i = U.pointer_events ? "pointerup" : "click";

            function a(i) {
                i.classList.contains("touch-open") ? e && e.remove() : e = L(document, t, (function (t) {
                    t.target.closest(".dropdown") !== i && (e.remove(), i.classList.remove("touch-open"), N.files.style.pointerEvents = "none", setTimeout((function () {
                        N.files.style.pointerEvents = null
                    }), 500))
                })), i.classList.toggle("touch-open")
            }
            U.is_touch && document.addEventListener("touchstart", (function () {}), !0), P.dropdown = function (e, t, n) {
                U.only_pointer ? n && y(t, n) : U.only_touch || !U.pointer_events ? y(t, (function () {
                    a(e)
                }), i) : y(t, (function (t) {
                    "mouse" === t.pointerType ? n && n() : a(e)
                }), "pointerup"), U.is_dual_input ? U.pointer_events && y(t, (function (t) {
                    e.classList.toggle("mouse-hover", "mouse" === t.pointerType)
                }), "pointerover") : U.is_pointer && e.classList.add("mouse-hover")
            }
        }();
    var Q = Swal.mixin({
            input: "text",
            inputAttributes: {
                maxlength: 127,
                autocapitalize: "off",
                autocorrect: "off",
                autocomplete: "off",
                spellcheck: "false"
            },
            inputValidator: e => {
                var t = e.match(/[<>:"'/\\|?*#]|\.\.|\.$/g);
                if (t) return "Invalid characters " + t.join(" ")
            },
            scrollbarPadding: !1,
            closeButtonHtml: P.get_svg_icon("close"),
            showCloseButton: !0
        }),
        J = Swal.mixin({
            toast: !0,
            showConfirmButton: !1,
            timerProgressBar: !0,
            didOpen: e => {
                e.addEventListener("mouseenter", Swal.stopTimer), e.addEventListener("mouseleave", Swal.resumeTimer), e.addEventListener("click", Swal.close)
            }
        }),
        $ = J.mixin({
            icon: "success",
            title: "Success",
            position: "bottom-right",
            timer: 2e3,
            customClass: {
                popup: "success-toast"
            }
        }),
        ee = J.mixin({
            icon: "error",
            title: "Error",
            timer: 3e3,
            customClass: {
                popup: "error-toast"
            }
        }),
        te = ee.mixin({
            title: S("TGljZW5zZSByZXF1aXJlZA==")
        }),
        ie = Swal.mixin({
            title: "Confirm?",
            showCloseButton: !0,
            showCancelButton: !0,
            scrollbarPadding: !1
        }),
        ae = function () {
            function e(e, t, i, o) {
                if (!ae[e]) return ee.fire({
                    title: e + " is not available"
                });
                if (!_c["allow_" + e]) return ee.fire({
                    title: e + " is not allowed"
                });
                if (_c.demo_mode) return ee.fire({
                    title: "Not allowed in demo mode"
                });
                if (!G) return te.fire();
                if (!t.is_writeable && ["delete", "rename", "new_folder", "new_file"].includes(e)) return ee.fire({
                    title: t.path + " is not writeable"
                });
                var l = !!_c.files[t.basename] && q.list.get("path", t.path)[0],
                    s = !!l && a(l.elm),
                    r = !(!t.is_dir || !N.sidebar_menu) && a(_query('[data-path="' + n(t.path) + '"]', N.sidebar_menu)),
                    c = s ? _c.current_dir : _c.dirs[t.path.substring(0, t.path.lastIndexOf("/"))];
                I({
                    params: "action=fm&task=" + e + (t.is_dir ? "&is_dir=1" : "") + "&path=" + encodeURIComponent(t.path) + (i || ""),
                    json_response: !0,
                    fail: function () {
                        return ee.fire()
                    },
                    always: function () {
                        s && s.classList.remove("fm-processing"), r && r.classList.remove("fm-processing"), N.files.parentElement.classList.remove("fm-processing")
                    },
                    complete: function (i, a, n) {
                        return z("fm:task:" + e, i, t), n && i && a ? i.error ? ee.fire({
                            title: i.error
                        }) : i.success ? (q.contextmenu.item === t && delete q.contextmenu.el, void(o && o(l, s, r, c, i))) : ee.fire() : ee.fire()
                    }
                })
            }

            function a(e) {
                return !!e && (e.style.removeProperty("opacity"), e.classList.add("fm-processing"), e)
            }

            function n(e) {
                return CSS.escape ? CSS.escape(e) : e.replace(/["\\]/g, "\\$&")
            }
            return {
                duplicate: function (t) {
                    if (t.is_dir) return ee.fire({
                        title: "Can't duplicate folders"
                    });
                    Q.fire({
                        title: X.get("Duplicate", !0),
                        text: t.basename,
                        inputPlaceholder: X.get("Duplicate name", !0),
                        inputValue: t.basename,
                        inputValidator: e => {
                            var t = e.match(/[<>:"'/\\|?*#]|\.\.|\.$/g);
                            return t ? "Invalid characters " + t.join(" ") : _c.files[e] ? "File already exists" : void 0
                        }
                    }).then((i => {
                        i.isConfirmed && i.value && i.value !== t.basename && e("duplicate", t, "&name=" + encodeURI(i.value), (function (e, t, i, a) {
                            a && (delete a.files, delete a.html, delete a.json_cache, E.remove(le(a.path, a.mtime)), a === _c.current_dir && P.get_files(_c.current_path, "replace", !0))
                        }))
                    }))
                },
                rename: function (t) {
                    Q.fire({
                        title: X.get("rename", !0),
                        text: t.basename,
                        inputPlaceholder: X.get("new name", !0),
                        inputValue: t.basename,
                        inputValidator: e => {
                            if (e === t.basename) return !1;
                            var i = e.match(/[<>:"'/\\|?*#]|\.\.|\.$/g);
                            if (i) return "Invalid characters " + i.join(" ");
                            if (_c.files[t.basename] && _c.files[t.basename].path === t.path) {
                                if (_c.files[e]) return (t.is_dir ? "Folder" : "File") + " already exists"
                            } else if (t.is_dir) {
                                var a = t.path.split("/").slice(0, -1).join("/");
                                if (a && _c.dirs[a + "/" + e]) return "Folder already exists"
                            }
                        }
                    }).then((i => {
                        if (i.isConfirmed && i.value && i.value !== t.basename) {
                            var a = i.value;
                            e("rename", t, "&name=" + encodeURI(a), (function (e, i, l, s) {
                                $.fire({
                                    title: a
                                });
                                var r = t.basename,
                                    c = t.path,
                                    p = (s ? s.path : c.split("/").slice(0, -1).join("/")) + "/" + a,
                                    d = !(!s || !s.url_path) && s.url_path + "/" + a;
                                if (s) {
                                    if (s === _c.current_dir && s.files) {
                                        var m = s.files[a] = Object.assign(t, {
                                            basename: a,
                                            path: p,
                                            url_path: d
                                        });
                                        if (i && i.isConnected) {
                                            i.setAttribute("href", o(m, "download" === _c.click)), i.dataset.name = a, _class("name", i)[0].textContent = a;
                                            var u = i.firstElementChild;
                                            if (!t.is_dir && "IMG" === u.nodeName) {
                                                var f = _c.script + "?file=" + encodeURIComponent(m.path) + "&resize=" + (U.pixel_ratio >= 1.5 && _c.image_resize_dimensions_retina ? _c.image_resize_dimensions_retina : _c.image_resize_dimensions) + "&" + (new Date).getTime();
                                                u.dataset.src = f, u.hasAttribute("src") && u.setAttribute("src", f)
                                            }
                                            e._values = m, P.set_sort()
                                        }
                                        delete m.popup_caption, delete s.files[r]
                                    } else delete s.files;
                                    if (s.preview === r) {
                                        s.preview = a;
                                        var v = s.path.split("/").slice(0, -1).join("/");
                                        v && _c.dirs[v] && delete _c.dirs[v].html
                                    }
                                    delete s.html, delete s.json_cache, E.remove(le(s.path, s.mtime))
                                }
                                t.is_dir && (_c.dir_paths.filter((e => e.startsWith(c))).forEach((function (e) {
                                    var t = e.split(c).slice(1).join("/"),
                                        i = p + t,
                                        l = _c.dirs[i] = Object.assign(_c.dirs[e], {
                                            path: i,
                                            files: !1,
                                            json_cache: !1,
                                            html: !1,
                                            url_path: !!d && d + t
                                        });
                                    if (e === c && (l.basename = a), delete _c.dirs[e], E.remove(le(e, l.mtime)), N.sidebar_menu) {
                                        var s = _query('[data-path="' + n(e) + '"]', N.sidebar_menu);
                                        s && (e === c && (s.firstElementChild.lastChild.textContent = a), s.dataset.path = i, s.firstElementChild.setAttribute("href", o(l)))
                                    }
                                })), _c.dir_paths = Object.keys(_c.dirs), _c.current_path.startsWith(c) && P.get_files(_c.current_dir.path, "push"))
                            }))
                        }
                    }))
                },
                new_folder: function (a) {
                    if (!a.is_dir) return ee.fire({
                        title: a.basename + " is not a directory"
                    });
                    Q.fire({
                        title: X.get("new folder", !0),
                        inputPlaceholder: X.get("Folder name", !0),
                        inputValidator: e => {
                            var t = e.match(/[<>:"'/\\|?*#]|\.\.|\.$/g);
                            return t ? "Invalid characters " + t.join(" ") : _c.dirs[a.path + "/" + e] || _c.dirs[a.path] && _c.dirs[a.path].files && _c.dirs[a.path].files[e] ? "Folder exists" : void 0
                        }
                    }).then((n => {
                        if (n.isConfirmed && n.value) {
                            var l = n.value;
                            e("new_folder", a, "&name=" + encodeURI(l), (function (e, n, s, r) {
                                $.fire({
                                    title: l
                                });
                                var c = _c.dirs[a.path];
                                if (c) {
                                    if (delete c.files, delete c.html, delete c.json_cache, E.remove(le(c.path, c.mtime)), s) {
                                        var p = c.path + "/" + l,
                                            d = _c.dirs[p] = {
                                                basename: l,
                                                path: p,
                                                url_path: !!c.url_path && c.url_path + "/" + l,
                                                is_dir: !0,
                                                is_writeable: !0,
                                                is_readable: !0,
                                                filetype: "dir",
                                                mime: "directory",
                                                mtime: Date.now() / 1e3,
                                                fileperms: c.fileperms
                                            },
                                            m = s.children[1],
                                            u = 1 * s.dataset.level,
                                            f = '<li data-level="' + (u + 1) + '" data-path="' + t(p) + '" class="menu-li"><a href="' + o(d) + '" class="menu-a">' + P.get_svg_icon_class("folder", "menu-icon menu-icon-folder") + i(l) + "</a></li>";
                                        m ? m.insertAdjacentHTML("afterbegin", f) : (s.firstElementChild.firstElementChild.remove(), s.firstElementChild.insertAdjacentHTML("afterbegin", P.get_svg_icon_multi_class("menu-icon menu-icon-toggle", "plus", "minus") + P.get_svg_icon_multi_class("menu-icon menu-icon-folder menu-icon-folder-toggle", "folder", "folder_plus", "folder_minus")), s.classList.add("has-ul"), s.insertAdjacentHTML("beforeend", '<ul style="--depth:' + u + '" class="menu-ul">' + f + "</ul>")), d.menu_li = s.lastElementChild.firstElementChild
                                    }
                                    c === _c.current_dir && P.get_files(_c.current_path, "replace", !0)
                                }
                            }))
                        }
                    }))
                },
                new_file: function (t) {
                    if (!t.is_dir) return ee.fire({
                        title: t.basename + " is not a directory"
                    });
                    Q.fire({
                        title: X.get("new file", !0),
                        inputPlaceholder: X.get("File name", !0),
                        inputValue: "file.txt",
                        inputValidator: e => {
                            var i = e.match(/[<>:"'/\\|?*#]|\.\.|\.$/g);
                            return i ? "Invalid characters " + i.join(" ") : _c.dirs[t.path] && _c.dirs[t.path].files && _c.dirs[t.path].files[e] ? "Filename exists" : void 0
                        }
                    }).then((i => {
                        if (i.isConfirmed && i.value) {
                            var a = i.value;
                            e("new_file", t, "&name=" + encodeURI(a), (function (e, i, n, o) {
                                $.fire({
                                    title: a
                                });
                                var l = _c.dirs[t.path];
                                l && (delete l.files, delete l.html, delete l.json_cache, E.remove(le(l.path, l.mtime)), l === _c.current_dir && P.get_files(_c.current_path, "replace", !0))
                            }))
                        }
                    }))
                },
                delete: function (t) {
                    ie.fire(X.get("delete", !0), t.basename).then((i => {
                        i.isConfirmed && e("delete", t, null, (function (e, i, a, n, o) {
                            if (o.fail) return ee.fire({
                                title: "Failed to delete " + o.fail + " items. Please refresh browser.",
                                timer: !1
                            });
                            if ($.fire({
                                    title: X.get("delete", !0) + " " + t.basename
                                }), n.files && delete n.files[t.basename], delete n.html, delete n.json_cache, E.remove(le(n.path, n.mtime)), "image" === t.mime0 && n.images_count && n.images_count--, !t.is_dir && n.files_count && n.files_count--, n.dirsize && t.filesize && (n.dirsize -= t.filesize), n.preview === t.basename) {
                                delete n.preview;
                                var l = n.path.split("/").slice(0, -1).join("/");
                                l && _c.dirs[l] && delete _c.dirs[l].html
                            }
                            if (n === _c.current_dir && (_c.file_names = Object.keys(_c.files), _c.files_count = _c.file_names.length, _c.breadcrumbs && P.breadcrumbs_info(), q.list.remove("path", t.path)), t.is_dir) {
                                if (_c.dir_paths = _c.dir_paths.filter((function (e) {
                                        if (!e.startsWith(t.path)) return !0;
                                        var i = _c.dirs[e];
                                        i && (E.remove(le(i.path, i.mtime)), delete _c.dirs[e])
                                    })), a && a.isConnected) {
                                    var s = a.parentElement;
                                    if (s.children.length > 1 || "LI" !== s.parentElement.tagName) a.remove();
                                    else {
                                        var r = s.parentElement;
                                        s.remove(), r.classList.remove("has-ul", "menu-li-open");
                                        var c = r.firstElementChild;
                                        c.firstElementChild.remove();
                                        var p = c.firstElementChild;
                                        p.lastElementChild.remove(), p.lastElementChild.remove(), p.classList.remove("menu-icon-folder-toggle")
                                    }
                                }
                                _c.current_path.startsWith(t.path) && P.get_files(n.path, "replace")
                            }
                        }))
                    }))
                }
            }
        }();

    function ne(e, t) {
        try {
            var i = JSON.parse(e);
            return t ? i[t] : i
        } catch (e) {
            return !1
        }
    }
    _c.allow_upload && P.load_plugin("uppy", (function () {
        _c.current_dir && A(_id("fm-upload"), !_c.current_dir.is_writeable);
        var e = q.uppy = new Uppy.Core({
                restrictions: {
                    maxFileSize: _c.upload_max_filesize || null,
                    allowedFileTypes: _c.upload_allowed_file_types ? _c.upload_allowed_file_types.split(",").map((e => {
                        var t = e.trim();
                        return t.startsWith(".") || t.includes("/") || t.includes("*") ? t : "." + t
                    })).filter((e => e)) : null
                },
                meta: {
                    action: "fm",
                    task: "upload",
                    is_dir: !0
                }
            }).use(Uppy.Dashboard, {
                trigger: "#fm-upload",
                thumbnailWidth: Math.round(160 * Math.min(U.pixel_ratio, 2)),
                doneButtonHandler: () => {
                    i(!1), e.reset()
                },
                showLinkToFileUploadResult: !0,
                showProgressDetails: !0,
                showRemoveButtonAfterComplete: _c.allow_delete,
                metaFields: [{
                    id: "name",
                    name: X.get("name"),
                    placeholder: X.get("name"),
                    render: ({
                        value: e,
                        onChange: t,
                        fieldCSSClasses: i
                    }, a) => a("input", {
                        class: i.text,
                        type: "text",
                        value: e,
                        maxlength: 128,
                        onChange: e => t(e.target.value.trim()),
                        onInput: e => {
                            e.target.value = e.target.value.replace(/[#%&(){}\\<>*?/$!'":;\[\]@+`|=]/gi, "").replace("..", ".")
                        },
                        "data-uppy-super-focusable": !0
                    })
                }],
                closeModalOnClickOutside: !0,
                animateOpenClose: !1,
                proudlyDisplayPoweredByUppy: !1,
                theme: "dark"
            }).use(Uppy.DropTarget, {
                target: document.body,
                onDrop: e => i(!0, _c.current_path)
            }).use(Uppy.XHRUpload, {
                endpoint: _c.script,
                validateStatus: (e, t, i) => ne(t, "success"),
                getResponseError: (e, t) => ne(e, "error")
            }).on("file-removed", ((e, t) => {
                if (_c.allow_delete && "removed-by-user" === t && e.response && e.response.body && e.response.body.success && e.progress && e.progress.uploadComplete && e.meta) I({
                    params: "action=fm&task=delete&path=" + encodeURIComponent(e.meta.path + "/" + e.meta.name)
                })
            })).on("upload-success", ((t, i) => {
                var a = i.body.filename;
                a && t.name !== a && e.setFileMeta(t.id, {
                    name: a
                })
            })).on("complete", (t => {
                t.successful && t.successful.length && t.successful.forEach((function (e) {
                    e.uploadURL && (e.uploadURL = new URL(e.uploadURL, location.href).href)
                }));
                var i = e.getState().meta.path,
                    a = _c.dirs[i];
                a && (delete a.files, delete a.html, delete a.json_cache, E.remove(le(i, a.mtime)))
            })).on("dashboard:modal-open", (() => {
                var i, a;
                G || t.classList.add("uppy-nolicense"), i = _c.upload_max_filesize ? filesize(_c.upload_max_filesize) : "", a = e.getState().meta.path || _c.current_path || "/", e.getPlugin("Dashboard").setOptions({
                    note: _c.upload_note ? _c.upload_note.replace("%upload_max_filesize%", i).replace("%path%", a) : a + (i ? " ≤ " + i : "")
                })
            })).on("dashboard:modal-closed", (() => {
                var t = e.getState();
                if (100 === t.totalProgress) {
                    var i = t.meta.path === _c.current_path;
                    P.get_files(t.meta.path, i ? "replace" : "push", i), e.reset()
                }
            })).use(Uppy.ImageEditor, {
                target: Uppy.Dashboard,
                quality: .8
            }),
            t = _class("uppy-Root")[0];

        function i(t, i) {
            var a = e.getPlugin("Dashboard");
            !!t !== a.isModalOpen() && (a[t ? "openModal" : "closeModal"](), i && e.setMeta({
                path: i
            }))
        }

        function a(e) {
            P.load_plugin("uppy_locale_" + e, (function () {
                q.uppy.setOptions({
                    locale: Uppy.locales[e]
                })
            }), {
                src: ["@uppy/locales@2.0.2/dist/" + e + ".min.js"]
            })
        }
        _c.demo_mode && t.classList.add("uppy-demo-mode"), _c.allow_delete && t.classList.add("uppy-allow-delete"), P.uppy_locale = function (e) {
            var t = o(e) || o(_c.lang_default) || "en_US";
            t !== l && a(l = t)
        };
        var n = {};

        function o(e) {
            return !!e && n[e]
        } ["ar_SA", "bg_BG", "cs_CZ", "da_DK", "de_DE", "el_GR", "en_US", "es_ES", "fa_IR", "fi_FI", "fr_FR", "gl_ES", "he_IL", "hr_HR", "hu_HU", "id_ID", "is_IS", "it_IT", "ja_JP", "ko_KR", "nb_NO", "nl_NL", "pl_PL", "pt_BR", "pt_PT", "ro_RO", "ru_RU", "sk_SK", "sr_RS_Cyrillic", "sr_RS_Latin", "sv_SE", "th_TH", "tr_TR", "uk_UA", "vi_VN", "zh_CN", "zh_TW"].forEach((function (e) {
            n[e.replace("_", "-").toLowerCase()] = e;
            var t = e.split("_")[0];
            n[t] || (n[t] = e)
        }));
        var l = o(V("lang", !0)) || o(E.get("files:lang:current")) || function () {
            if (_c.lang_auto && U.nav_langs)
                for (var e = 0; e < U.nav_langs.length; e++) {
                    var t = o(U.nav_langs[e].toLowerCase());
                    if (t) return t;
                    var i = !!t.includes("-") && o(t.split("-")[0]);
                    if (i) return i
                }
        }() || o(_c.lang_default) || "en_US";
        "en_US" !== l && a(l), y(window, (t => {
            e.reset(), i(!1)
        }), "popstate")
    }));
    var oe = function () {
        var e, t = "",
            i = screen.width >= 768,
            a = _c.filter_live && U.is_pointer,
            n = function () {
                if (!_c.filter_props || "string" != typeof _c.filter_props) return ["basename"];
                var e = ["basename", "filetype", "mime", "features", "title", "headline", "description", "creator", "credit", "copyright", "keywords", "city", "sub-location", "province-state"],
                    t = ["icon"];
                return _c.filter_props.split(",").forEach((function (i) {
                    var a = i.trim().toLowerCase();
                    "name" === a && (a = "basename"), a && e.includes(a) && !t.includes(a) && t.push(a)
                })), t
            }();

        function o(e) {
            i && (N.filter_container.dataset.input = e || "")
        }
        var l = {
            create: function () {
                q.list = new List(N.files.parentElement, {}), k(_c.file_names, (function (e, t) {
                    q.list.items[t]._values = _c.files[e]
                }))
            },
            empty: function () {
                q.list && q.list.clear(), r(N.files), window.scrollY && window.scroll({
                    top: 0
                })
            },
            filter: function (e) {
                if (t !== N.filter.value && q.list) {
                    t = N.filter.value;
                    var i = q.list.search(t, n).length,
                        a = t ? "filter-" + (i ? "" : "no") + "match" : "";
                    N.filter.className !== a && (N.filter.className = a), P.topbar_info_search(t, i), !1 !== e && history.replaceState(history.state || null, document.title, t ? "#filter=" + encodeURIComponent(t) : location.pathname + location.search), window.scrollY && window.scrollTo({
                        top: 0
                    })
                }
            },
            hash: function (e) {
                var t = V("filter", !0, !0);
                t && (t = decodeURIComponent(t), N.filter.value = t, o(t), e && l.filter(!1))
            },
            clear: function (e) {
                if (t) {
                    if (N.filter.value = "", o(), e) return l.filter();
                    t = "", N.filter.className = ""
                }
            },
            disabled: function (e) {
                N.filter.disabled !== !!e && (N.filter.disabled = !!e)
            }
        };
        return (i || a) && y(N.filter, (function (t) {
            o(N.filter.value), a && (e && clearTimeout(e), e = setTimeout(l.filter, O(250, 750, _c.files_count)))
        }), "input"), y(N.filter, l.filter, "change"), l
    }();

    function le(e, t) {
        return "" === e && (e = "ROOT"), "files:dir:" + _c.dirs_hash + ":" + (e || _c.current_dir.path) + ":" + (t || _c.current_dir.mtime)
    }! function () {
        var e = !1,
            o = U.pixel_ratio >= 1.5 && _c.image_resize_dimensions_retina ? _c.image_resize_dimensions_retina : _c.image_resize_dimensions,
            s = !!_c.x3_path && _c.x3_path + (_c.x3_path.endsWith("/") ? "" : "/") + "render/w" + (U.pixel_ratio >= 1.5 ? "480" : "320") + "/";

        function r(t, i) {
            if (e) return e.abort(), e = !1, void(i && i());
            if (_c.transitions && _c.files_count)
                if ("list" !== _c.layout) {
                    for (var a = N.files.children, n = a.length, o = [], l = window.innerHeight, s = 0; s < n; s++) {
                        var r = a[s],
                            c = r.getBoundingClientRect();
                        if (!(c.bottom < 0))
                            if (c.top < l - 10) o.push(r);
                            else if ("columns" !== _c.layout) break
                    }
                    var p = Math.min(Math.round(200 / o.length), 30);
                    d = {
                        targets: o,
                        opacity: t ? [0, 1] : [1, 0],
                        easing: "easeOutQuint",
                        duration: t ? 300 : 150,
                        delay: anime.stagger(p)
                    };
                    i && (d.complete = i), anime(d)
                } else {
                    anime.remove(N.files);
                    var d = {
                        targets: N.files,
                        opacity: t ? [0, 1] : [1, 0],
                        easing: "easeOutCubic",
                        duration: t ? 300 : 150,
                        complete: function () {
                            t || N.files.style.removeProperty("opacity"), i && i()
                        }
                    };
                    anime(d)
                }
            else i && i()
        }

        function c(e, t, i) {
            document.title = t || "/", i && _c.history && history[i + "State"]({
                path: e
            }, t, function (e, t) {
                if ("replace" === e) {
                    if (_c.query_path || !t) return _c.query_path = !1, location.href
                } else if (!t) return "//" + location.host + location.pathname;
                return "?" + encodeURI(t).replace(/&/g, "%26").replace(/#/g, "%23")
            }(i, e)), document.body.dataset.currentPath = e || "/"
        }

        function d() {
            return _c.current_dir.html = M(_c.file_names, (function (e, r) {
                var c = _c.files[e];
                if (!c.is_dir && (!c.mime && c.ext && (c.mime = se[c.ext]), c.mime)) {
                    var p = c.mime.split("/");
                    c.mime0 = p[0], p[1] && (c.mime1 = p[1])
                }
                c.image && (c.image.exif && c.image.exif.gps && Array.isArray(c.image.exif.gps) && (c.gps = c.image.exif.gps), c.image.width && c.image.height && (c.dimensions = [c.image.width, c.image.height], c.ratio = c.image.width / c.image.height), c.image.iptc && Object.assign(c, c.image.iptc));
                var d = function () {
                    if (c.mime1) {
                        if ("image" === c.mime0) {
                            if (!U.browser_images.includes(c.mime1)) return;
                            if (c.browser_image = c.mime0, c.is_popup = !0, !_c.load_images || !c.is_readable) return;
                            var e = !1,
                                t = "files-img files-img-placeholder files-lazy";
                            if ("svg+xml" === c.browser_image || "svg" === c.ext) {
                                if (c.filesize > _c.load_svg_max_filesize) return;
                                t += " files-img-svg"
                            } else {
                                if (function (e) {
                                        if (_c.image_resize_enabled && e.dimensions && e.mime1 && e.image && _c.resize_image_types.includes(e.mime1)) {
                                            var t = e.image,
                                                i = Math.max(t.width, t.height) / o,
                                                a = t.width * t.height;
                                            if ((!t.type || image_resize_types.includes(t.type)) && !(i < image_resize_min_ratio || _c.image_resize_max_pixels && a > _c.image_resize_max_pixels)) {
                                                if (_c.image_resize_memory_limit) {
                                                    var n = t.width / i,
                                                        l = t.height / i;
                                                    if ((a * (t.bits ? t.bits / 8 : 1) * (t.channels || 3) * 1.33 + n * l * 4) / 1048576 > _c.image_resize_memory_limit) return
                                                }
                                                return !0
                                            }
                                        }
                                    }(c) && (e = o), !e && c.filesize > _c.load_images_max_filesize) return;
                                "ico" === c.ext && (t += " files-img-ico"), c.dimensions && (c.preview_dimensions = e ? c.ratio > 1 ? [e, Math.round(e / c.ratio)] : [Math.round(e * c.ratio), e] : [c.image.width, c.image.height], c.preview_ratio = c.preview_dimensions[0] / c.preview_dimensions[1])
                            }
                            return '<img class="' + t + '" data-src="' + function () {
                                if (s) return s + encodeURI(c.path);
                                if (e && c.image["resize" + e]) return encodeURI(c.image["resize" + e]);
                                if (!e && !_c.load_files_proxy_php && c.url_path) return encodeURI(c.url_path).replace(/#/g, "%23");
                                var t = c.mtime + "." + c.filesize;
                                return _c.script + "?file=" + encodeURIComponent(c.path) + (e ? "&resize=" + e + "&" + _c.image_cache_hash + "." + t : "&" + t)
                            }() + '"' + (c.preview_dimensions ? ' width="' + c.preview_dimensions[0] + '" height="' + c.preview_dimensions[1] + '"' : "") + ">"
                        }
                        return "video" === c.mime0 && (W("video", c) && (c.is_browser_video = !0, _c.popup_video && (c.is_popup = !0)), _c.video_thumbs_enabled && c.is_readable) ? (c.preview_dimensions = [480, 320], c.preview_ratio = 1.5, (c.is_browser_video ? P.get_svg_icon("play") : "") + '<img class="files-img files-img-placeholder files-lazy" data-src="' + _c.script + "?file=" + encodeURIComponent(c.path) + "&resize=video&" + _c.image_cache_hash + "." + c.mtime + "." + c.filesize + '"' + (c.preview_dimensions ? ' width="' + c.preview_dimensions[0] + '" height="' + c.preview_dimensions[1] + '"' : "") + ">") : void 0
                    }
                }();
                return function (e) {
                    var t = "dir" == e.filetype ? "folders" : "files",
                        i = e.image;
                    if (i) {
                        t += ",image";
                        var a = i.width,
                            n = i.height,
                            o = i.exif,
                            l = i.iptc;
                        a && n && (t += a === n ? ",square" : a > n ? ",landscape,horizontal" : ",portrait,vertical"), o && (t += ",exif", o.gps && (t += ",gps,maps"), t += M(["Make", "Model", "Software"], (function (e) {
                            if (o[e]) return "," + o[e]
                        }))), l && (t += ",iptc" + M(["title", "headline", "description", "creator", "credit", "copyright", "keywords", "city", "sub-location", "province-state"], (function (e) {
                            if (l[e]) return "," + e
                        })))
                    }
                    e.features = t
                }(c), c.DateTimeOriginal && (c.mtime = c.DateTimeOriginal), '<a href="' + l(c, "download" === _c.click) + '" target="_blank" class="files-a files-a-' + (d ? "img" : "svg") + '"' + (c.preview_ratio ? ' style="--ratio:' + c.preview_ratio + '"' : "") + ' data-name="' + t(c.basename) + '"' + (c.is_dir || "download" !== _c.click ? "" : " download") + ">" + (d || P.get_svg_large(c, "files-svg")) + '<div class="files-data">' + n.span(c.gps, "gps") + a(i(c.basename), "name") + (c.image && c.image.iptc && c.image.iptc.title ? a(c.image.iptc.title, "title") : "") + a(P.get_svg_icon_files(c), "icon") + m(c.dimensions, "dimensions") + u(c, "size") + g(c.image, "exif", "span") + a(c.ext ? a(c.ext, "ext-inner") : "", "ext") + a(P.get_time(c, "ll", "llll", !1), "date") + '<span class="flex"></span></div>' + f("menu" !== _c.click || c.is_dir, "files-context") + D(c) + "</a>"
            }))
        }

        function v(e, t, i) {
            K(), image_load_errors = 0, _c.current_dir = _c.dirs[e], c(e, _c.current_dir.basename, t), _c.files = _c.current_dir.files, z(i + " :", e, _c.current_dir), _c.file_names = Object.keys(_c.files), _c.files_count = _c.file_names.length, _c.files_count && !_c.current_dir.html && (_c.current_dir.resort = !1, _c.file_names.sort((function (e, t) {
                return _c.sort_dirs_first && _c.files[e].is_dir !== _c.files[t].is_dir ? _c.files[t].is_dir ? 1 : -1 : de.compare(_c.files[e].basename, _c.files[t].basename)
            }))), _c.breadcrumbs && P.breadcrumbs_info(), _c.files_count || P.topbar_info(P.get_svg_icon("alert_circle_outline") + '<span data-lang="directory is empty" class="f-inline-block">' + X.get("directory is empty") + "</span>", "warning"), oe.disabled(!_c.files_count), A(N.sortbar, !_c.files_count), _c.files_count && (N.files.innerHTML = _c.current_dir.html || d(), oe.create(), "push" !== t && oe.hash(!0), "name" == q.sort.sort && "asc" == q.sort.order || P.set_sort(), "replace" === t && function (e) {
                if (!_c.history || !location.hash) return;
                var t = V("pid", !0, !0),
                    i = t || location.hash.replace("#", "");
                if (!i) return;
                var a = _c.files[decodeURIComponent(i)];
                if (!a) return;
                t && a.is_popup ? P.open_popup(a, !0) : P.open_modal(a);
                return !0
            }() || r(!0))
        }

        function _(e, t) {
            return _c.dirs[e] ? t ? _c.dirs[e].mtime > t.mtime ? _c.dirs[e] = Object.assign(t, _c.dirs[e]) : Object.assign(_c.dirs[e], t) : _c.dirs[e] : _c.dirs[e] = t || {}
        }

        function h(e, t, i) {
            A(N.sortbar, !0), P.topbar_info(P.get_svg_icon("alert_circle_outline") + '<strong data-lang="error" class="f-inline-block">' + X.get("error") + "</strong>" + (e ? ": " + e : "."), "error"), c(t, X.get("error") + (e ? ": " + e : "."), i)
        }
        image_load_errors = 0, image_resize_min_ratio = Math.max(_c.image_resize_min_ratio, 1), image_resize_types = _c.image_resize_enabled && _c.image_resize_types ? _c.image_resize_types.split(",").map((e => ({
            jpeg: 2,
            jpg: 2,
            png: 3,
            gif: 1,
            webp: 18,
            bmp: 6
        } [e.toLowerCase().trim()]))).filter((e => e)) : [], click_window = _c.click_window && !["download", "window"].includes(_c.click) ? _c.click_window.split(",").map((e => e.toLowerCase().trim())).filter((e => e)) : [], P.get_files = function (t, i, a) {
            if (a || t !== _c.current_path) {
                _c.current_path = t, N.topbar_info.className = "info-hidden", oe.clear(), !a && _c.breadcrumbs && P.set_breadcrumbs(t), !a && _c.menu_enabled && P.set_menu_active(t);
                var n = _c.dirs[t];
                if (!a && n) {
                    if (n.files) return r(!1, (function () {
                        oe.empty(), v(t, i, "files from JS")
                    }));
                    var o = E.get_json(le(t, n.mtime));
                    if (o) return _(t, o), r(!1, (function () {
                        oe.empty(), v(t, i, "files from localStorage")
                    }))
                }
                oe.disabled(!0), _c.menu_enabled && P.menu_loading(!1, !0), N.topbar.classList.add("topbar-spinner");
                var l = 0,
                    s = !(!n || !n.json_cache) && n.json_cache;
                r(!1, (function () {
                    oe.empty(), c()
                })), e = I({
                    params: !s && "action=files&dir=" + encodeURIComponent(t),
                    url: s,
                    json_response: !0,
                    fail: () => {
                        h(t, t, i)
                    },
                    always: () => {
                        e = !1, _c.menu_enabled && P.menu_loading(!1, !1), N.topbar.classList.remove("topbar-spinner")
                    },
                    complete: function (e, a, n) {
                        return n ? e.error ? h(e.error + " " + t, t, i) : (_(t, e), E.set(le(t, e.mtime), a, !1, 1e3), void c()) : h(t, t, i)
                    }
                })
            }

            function c(e) {
                1 == l++ && v(t, i, s ? "files from JSON " + s : "files from xmlhttp")
            }
        }, P.init_files = function () {
            if (_c.query_path) return _c.query_path_valid ? P.get_files(_c.query_path, "replace") : h("Invalid directory " + _c.query_path, _c.query_path, "replace");
            if (location.search) {
                var e = location.search.split("&")[0].replace("?", "");
                if (e && "debug" !== e && (-1 === e.indexOf("=") || e.indexOf("/") > -1)) {
                    _c.query_path = decodeURIComponent(e);
                    var t = !(-1 !== e.indexOf("/") || !_c.dirs[""].files) && _c.dirs[""].files[_c.query_path];
                    return void(t || !_c.menu_enabled ? (t && _(_c.query_path, t), P.get_files(_c.query_path, "replace")) : P.menu_init_files(_c.query_path))
                }
            }
            P.get_files(_c.init_path, "replace")
        };
        var x = !1;
        P.menu_init_files = function (e) {
            if (e) {
                if (_c.dir_paths) return P.get_files(e, "replace");
                x = e
            } else x && P.get_files(x, "replace")
        }, p(N.topbar_info, (function (e, t) {
            if ("reset" === e) return oe.clear(!0)
        })), y(N.files, (function (e) {
            var t = e.target;
            if (t !== N.files) {
                var i = t.closest(".files-a"),
                    a = !!i && _c.files[i.dataset.name];
                if (a) {
                    if (t.classList.contains("context-button")) return P.create_contextmenu(e, "files", t, a, i);
                    if (q.contextmenu.is_open && ("menu" !== _c.click || a.is_dir)) return e.preventDefault();
                    if (t.dataset.href) return e.preventDefault(), window.open(t.dataset.href);
                    if (a.is_dir || !("window" === _c.click || a.ext && click_window.includes(a.ext)))(a.is_dir || "download" !== _c.click) && (b(e, i) || (e.preventDefault(), a.is_dir ? (_(a.path, a), P.get_files(a.path, "push")) : "menu" === _c.click ? P.create_contextmenu(e, "files", i, a) : "popup" === _c.click && a.is_popup && a.is_readable ? P.open_popup(a) : P.open_modal(a, !0)));
                    else if (_c.click_window_popup) {
                        e.preventDefault();
                        var n = Math.floor(Math.min(screen.width, 1e3)),
                            o = window.open(i.href, a.basename, "toolbar=no,status=no,menubar=no,scrollbars=yes,resizable=yes,copyhistory=no,titlebar=no,width=" + n + ",height=" + screen.height + ",left=" + Math.round(screen.width / 2 - n / 2));
                        window.focus && o.focus()
                    }
                }
            }
        })), history.scrollRestoration = "manual"
    }(),
    function () {
        var e = {
                list: {},
                imagelist: {},
                blocks: {
                    contain: !0
                },
                grid: {
                    contain: !0,
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
            },
            t = Object.keys(e);
        t.includes(_c.layout) || (_c.layout = "rows"), N.files.className != "list files-" + _c.layout && (N.files.className = "list files-" + _c.layout);
        var i = getComputedStyle(N.files).getPropertyValue("--img-object-fit").trim() || "cover",
            a = E.get("files:interface:img-object-fit") || i;

        function n() {
            N.files.style.setProperty("--imagelist-height", o ? "100px" : "100%"), N.files.style[(o ? "set" : "remove") + "Property"]("--imagelist-min-height", "auto")
        }
        a != i && N.files.style.setProperty("--img-object-fit", a);
        var o = E.get("files:layout:imagelist-square");

        function l(i) {
            return {
                layout: i,
                ob: e[i],
                index: t.indexOf(i)
            }
        }
        null === o && (o = "auto" !== getComputedStyle(N.files).getPropertyValue("--imagelist-height").trim()), n(), ["grid", "rows", "columns"].forEach((function (t) {
            var i, a = e[t].size,
                n = getComputedStyle(N.files).getPropertyValue("--" + t + "-size");
            n && (a.default = parseInt(n)), a.current = !(i = E.get("files:layout:" + t + "-size")) || isNaN(i) || i == a.default ? a.default : (i = O(a.min, a.max, i), N.files.style.setProperty("--" + t + "-size", i + "px"), i), a.space = function () {
                var e = E.get("files:layout:" + t + "-space-factor");
                return !e || isNaN(e) || 50 == e ? 50 : (e = O(0, 100, e), N.files.style.setProperty("--" + t + "-space-factor", e), 0 == e && N.files.style.setProperty("--" + t + "-border-radius", 0), e)
            }()
        }));
        var s = l(_c.layout);

        function r() {
            var e = s.ob;
            v.style.display = "imagelist" === s.layout || e.size || e.contain ? "" : "none", g.style.display = e.size ? "" : "none", b.style.display = e.size ? "" : "none", C.style.display = e.contain ? "" : "none", k.style.display = "imagelist" === s.layout ? "" : "none", e.size && (e.size.min && (h.min = e.size.min), e.size.max && (h.max = e.size.max), e.size.default && (x.value = e.size.default, h.style.setProperty("--range-default-pos", (e.size.default-e.size.min) / (e.size.max - e.size.min))), X.set(_, s.layout), h.value = e.size.current, X.set(w, s.layout), L.value = e.size.space)
        }
        var c = _id("change-layout");
        c.innerHTML = '<button type="button" class="btn-icon btn-topbar">' + P.get_svg_icon("layout_" + s.layout) + '</button><div class="dropdown-menu dropdown-menu-topbar dropdown-menu-center"><h6 class="dropdown-header" data-lang="layout">' + X.get("layout") + "</h6><div>" + M(t, (function (e) {
            return '<button class="dropdown-item' + (e === s.layout ? " active" : "") + '" data-action="' + e + '">' + P.get_svg_icon("layout_" + e) + '<span class="dropdown-text" data-lang="' + e + '">' + X.get(e) + "<span></button>"
        })) + '</div><div id="layout-options"><div id="layout-sizer"><label for="layout-sizer-range" class="form-label mb-0"><span data-lang="size">' + X.get("size") + '</span><span data-lang="' + s.layout + '" class="layout-label-type">' + X.get(s.layout) + '</span></label><input type="range" class="form-range" id="layout-sizer-range" value="200" min="100" max="300" list="layout-size-default"><datalist id="layout-size-default"><option value="200"></datalist></div><div id="layout-spacer"><label for="layout-spacer-range" class="form-label mb-0"><span data-lang="space">' + X.get("space") + '</span><span data-lang="' + s.layout + '" class="layout-label-type">' + X.get(s.layout) + '</span></label><input type="range" class="form-range" id="layout-spacer-range" value="50" min="0" max="100" list="layout-space-default"><datalist id="layout-space-default"><option value="50"></datalist></div><div id="cover-toggle"><div class="form-check"><input class="form-check-input" type="checkbox" id="covertoggle"' + ("cover" === a ? " checked" : "") + '><label class="form-check-label" for="covertoggle" data-lang="uniform">' + X.get("uniform") + '</label></div></div><div id="imagelist-square"><div class="form-check"><input class="form-check-input" type="checkbox" id="imagelistsquare"' + (o ? " checked" : "") + '><label class="form-check-label" for="imagelistsquare" data-lang="uniform">' + X.get("uniform") + "</label></div></div></div>";
        var d = c.firstElementChild,
            m = c.lastElementChild,
            u = m.children[1],
            f = u.children,
            v = m.children[2],
            g = v.firstElementChild,
            _ = g.firstElementChild.lastElementChild,
            h = g.children[1],
            x = g.children[2].lastElementChild,
            b = v.children[1],
            w = b.firstElementChild.lastElementChild,
            L = b.children[1],
            C = v.children[2],
            H = C.firstElementChild.firstElementChild,
            k = v.children[3],
            V = k.firstElementChild.firstElementChild;
        r();
        var z = U.is_pointer ? 200 : 100;

        function A(e) {
            s.layout !== e && (d.innerHTML = P.get_svg_icon("layout_" + e), f[s.index].classList.remove("active"), s = l(e), f[s.index].classList.add("active"), r(), N.files.className = "list files-" + e, N.sortbar.className = "sortbar-" + e, P.set_config("layout", e))
        }
        y(h, (function (e) {
            _c.files_count <= z && N.files.style.setProperty("--" + s.layout + "-size", h.value + "px")
        }), "input"), y(h, (function (e) {
            _c.files_count > z && N.files.style.setProperty("--" + s.layout + "-size", h.value + "px"), s.ob.size.current = h.value, E.set("files:layout:" + s.layout + "-size", h.value)
        }), "change"), y(L, (function (e) {
            _c.files_count <= z && N.files.style.setProperty("--" + s.layout + "-space-factor", L.value)
        }), "input"), y(L, (function (e) {
            var t = s.ob.size.space = L.value;
            _c.files_count > z && N.files.style.setProperty("--" + s.layout + "-space-factor", t), N.files.style[(t > 0 ? "remove" : "set") + "Property"]("--" + s.layout + "-border-radius", 0), E.set("files:layout:" + s.layout + "-space-factor", t)
        }), "change"), y(H, (function () {
            (a = this.checked ? "cover" : "contain") == i ? (N.files.style.removeProperty("--img-object-fit"), E.remove("files:interface:img-object-fit")) : (N.files.style.setProperty("--img-object-fit", a), E.set("files:interface:img-object-fit", a))
        }), "change"), y(V, (function () {
            o = this.checked, n(), E.set("files:layout:imagelist-square", o)
        }), "change"), p(u, A), P.dropdown(c, d, (function () {
            A(t[s.index >= t.length - 1 ? 0 : s.index + 1])
        }))
    }(),
    function () {
        var e = q.popup = {
            transitions: {
                glide: function (e) {
                    return {
                        translateX: [10 * e, 0],
                        opacity: [.1, 1],
                        duration: 500,
                        easing: "easeOutQuart"
                    }
                },
                fade: function (e) {
                    return {
                        opacity: [.1, 1],
                        duration: 400,
                        easing: "easeOutCubic"
                    }
                },
                zoom: function (e) {
                    return {
                        scale: [1.05, 1],
                        opacity: [.1, 1],
                        duration: 500,
                        easing: "easeOutQuint"
                    }
                },
                pop: function (e) {
                    return {
                        scale: {
                            value: [.9, 1],
                            duration: 600,
                            easing: "easeOutElastic"
                        },
                        opacity: {
                            value: [0, 1],
                            duration: 400,
                            easing: "easeOutCubic"
                        },
                        duration: 600
                    }
                },
                elastic: function (e) {
                    return {
                        translateX: {
                            value: [50 * e, 0],
                            duration: 600,
                            easing: "easeOutElastic"
                        },
                        opacity: {
                            value: [.1, 1],
                            duration: 500,
                            easing: "easeOutQuart"
                        },
                        duration: 600
                    }
                },
                wipe: function (e) {
                    return {
                        translateX: [10 * e, 0],
                        opacity: [.1, 1],
                        clipPath: [e > 0 ? "inset(0% 25% 0% 65%)" : "inset(0% 65% 0% 25%)", "inset(0% 0% 0% 0%)"],
                        scale: [1.05, 1],
                        duration: 500,
                        easing: "easeOutQuint"
                    }
                }
            },
            playing: !1,
            timer: !1
        };
        "object" == typeof transitions && Object.assign(e.transitions, transitions);
        var t = !_c.hasOwnProperty("popup_caption_hide") || _c.popup_caption_hide,
            a = _c.popup_caption_style && ["block", "box", "subtitles", "gradient", "topbar", "none"].includes(_c.popup_caption_style) ? _c.popup_caption_style : "block";
        caption_align = _c.popup_caption_align && ["left", "center-left", "center", "right"].includes(_c.popup_caption_align) ? _c.popup_caption_align : "center-left";
        var n, l, s, c = E.get("files:popup:locked_caption"),
            p = screen.width < 375 ? "ll" : screen.width < 414 ? "lll" : "llll",
            d = screen.width >= 576,
            h = {
                captionEl: !_c.hasOwnProperty("popup_caption") || _c.popup_caption,
                downloadEl: !U.is_pointer,
                mapEl: !1,
                transition: _c.popup_transition || "glide",
                play_transition: _c.popup_transition_play && "inherit" != _c.popup_transition_play ? _c.popup_transition_play : _c.popup_transition || "glide",
                play_interval: !_c.hasOwnProperty("popup_interval") || isNaN(_c.popup_interval) ? 5e3 : Math.max(_c.popup_interval, 1e3),
                getDoubleTapZoom: function () {
                    return e.toggle_play(!1), 1
                },
                getThumbBoundsFn: function (e, t) {
                    var i = n.items[e],
                        a = q.modal.open ? q.modal.item === i.item && _class("modal-image", N.modal)[0] : i.img_el;
                    if (!(i.w && i.h && i.msrc && a && a.offsetParent)) return !!t && x(!0);
                    var o = a.getBoundingClientRect();
                    if (t) {
                        if (o.bottom < 0 || o.top > window.innerHeight) return x(!0);
                        x(!1)
                    }
                    var l = i.w / i.h,
                        s = o.width / o.height,
                        r = "cover" === getComputedStyle(a).objectFit ? l < s : l > s,
                        c = r ? (a.clientWidth / l - a.clientHeight) / 2 : 0,
                        p = r ? 0 : (a.clientHeight * l - a.clientWidth) / 2,
                        d = a.offsetWidth - a.clientWidth,
                        m = parseFloat(getComputedStyle(a).padding || getComputedStyle(a).paddingTop || 0);
                    return {
                        x: o.left - p + d / 2 + m,
                        y: o.top - c + window.pageYOffset + d / 2 + m,
                        w: o.width + 2 * p - d - 2 * m
                    }
                },
                index: 0,
                addCaptionHTMLFn: function (t, n) {
                    var o = t.item;
                    if ("topbar" === a) return e.search.innerHTML = o.basename, !1;
                    if (!N.filter.value) {
                        if ("video" === t.type) return e.search.innerHTML = o.basename, r(e.caption_center);
                        r(e.search)
                    }
                    return o.hasOwnProperty("popup_caption") || (o.popup_caption = f(U.PointerEvent, "popup-context") + '<div class="popup-basename">' + i(o.basename) + "</div>" + m(o.dimensions, "popup-dimensions") + u(o, "popup-filesize") + '<span class="popup-date">' + P.get_time(o, p, "LLLL", d) + "</span>" + g(o.image, "popup-exif") + v(o.image, "popup")), o.popup_caption ? (e.caption_transition_delay && (e.caption.style.cssText = "transition: none; opacity: 0", l && clearTimeout(l), l = setTimeout((function () {
                        e.caption.style.cssText = "transition: opacity 333ms cubic-bezier(0.33, 1, 0.68, 1)", l = setTimeout((function () {
                            e.caption.removeAttribute("style")
                        }), 333)
                    }), e.caption_transition_delay)), e.caption_center.innerHTML = o.popup_caption, !0) : ce.resetEl(e.caption_center)
                }
            };

        function x(t) {
            t !== n.options.showHideOpacity && (n.options.showHideOpacity = t, ce.toggle_class(e.pswp, "pswp--animate_opacity", t))
        }

        function b(t) {
            var i = !!(e.current_video && e.is_open && n && n.itemHolders) && e.current_video.firstElementChild;
            i && "VIDEO" == i.nodeName && i[t]()
        }

        function w(t) {
            b("pause"), e.current_video = t
        }

        function L() {
            return !n.options.loop && n.getCurrentIndex() === n.options.getNumItemsFn() - 1
        }
        P.open_popup = function (t, l) {
            if (t && q.list.items.length && !e.is_open) {
                var c = {
                    index: 0
                };
                if (s === q.list.matchingItems) {
                    for (var p = 0; p < e.slides.length; p++)
                        if (e.slides[p].item === t) {
                            c.index = p;
                            break
                        }
                } else s = q.list.matchingItems, e.slides = [], s.forEach((function (i, a) {
                    var n = i._values;
                    if (n && n.is_readable && n.is_popup) {
                        if (n.browser_image) {
                            var l = !!_c.load_images && i.elm.firstElementChild,
                                s = !U.image_orientation && T(n.image),
                                r = l && !s,
                                p = {
                                    type: "image",
                                    src: o(n),
                                    w: n.image ? n.image.width : screen.availHeight,
                                    h: n.image ? n.image.height : screen.availHeight,
                                    pid: encodeURIComponent(n.basename),
                                    img_el: l,
                                    msrc: !(!r || !l.complete) && l.getAttribute("src"),
                                    item: n
                                };
                            if (s && (p.w = n.image.height, p.h = n.image.width), r && !p.msrc && (l.onload = function () {
                                    p.msrc = this.getAttribute("src")
                                }), "ico" === n.ext && p.w <= 16) {
                                var d = 256 / p.w;
                                p.w *= d, p.h *= d
                            }
                        } else if (n.is_browser_video) p = {
                            type: "video",
                            html: '<video class="popup-video" playsinline disablepictureinpicture controls controlsList="nodownload"><source src="' + o(n) + '" type="' + n.mime + '"></video>',
                            pid: encodeURIComponent(n.basename),
                            item: n
                        };
                        n === t && (c.index = e.slides.length), e.slides.push(p)
                    }
                }));
                e.slides.length && (Z(), document.documentElement.classList.add("popup-open"), e.is_open = !0, e.caption_transition_delay = 333, e.container.style.cursor = e.slides.length > 1 ? "pointer" : "default", "topbar" !== a && N.filter.value && (e.search.innerHTML = P.get_svg_icon("image_search_outline") + '"' + i(N.filter.value) + '"'), e.slides.length < 3 && (c.playEl = !1), n = new pe(e.pswp, re, e.slides, Object.assign({}, h, c, {
                    arrowEl: e.slides.length > 1 && !U.only_touch,
                    arrowKeys: e.slides.length > 1,
                    counterEl: e.slides.length > 1,
                    showAnimationDuration: l ? 0 : 333,
                    showHideOpacity: !e.slides[c.index].msrc && !l
                })), U.is_touch && n.listen("zoomGestureEnded", (function () {
                    n.getZoomLevel() > n.currItem.initialZoomLevel && e.toggle_play(!1)
                })), n.listen("beforeChange", (function () {
                    w("video" == n.currItem.type && n.currItem.container), e.toggle_timer(!1)
                })), n.listen("afterChange", (function () {
                    e.ui.classList.toggle("popup-ui-video", "video" == n.currItem.type), e.toggle_timer(!0)
                })), t.is_browser_video && _c.video_autoplay && n.listen("initialZoomInEnd", (function () {
                    b("play")
                })), n.listen("imageLoadComplete", (function (t, i) {
                    n.options.playEl && t === n.getCurrentIndex() && e.toggle_timer(!0)
                })), n.listen("close", (function () {
                    w(!1), e.toggle_play(!1)
                })), n.listen("destroy", (function () {
                    document.documentElement.classList.remove("popup-open"), e.preloader.classList.remove("svg-preloader-active");
                    for (var t = 0; t < e.items.length; t++) r(e.items[t]);
                    r(e.search), e.is_open = !1
                })), n.init())
            }
        }, e.toggle_play = function (t) {
            t === e.playing || t && L() || (e.playing = !!t, ce.toggle_class(e.play_button, "is-playing", t), e.toggle_timer(t))
        }, e.toggle_timer = function (t) {
            if (t && L()) return e.toggle_play(!1);
            if ((!t || e.playing && (n.currItem.loaded || !n.currItem.src)) && e.timer != t) {
                e.timer = !!t, t && (e.play_timer.style.opacity = 1), anime.remove(e.play_timer);
                var i = {
                    targets: e.play_timer,
                    duration: t ? n.options.play_interval : 333,
                    easing: t ? "easeInOutCubic" : "easeOutQuad",
                    scaleX: t ? [0, 1] : 0
                };
                t ? (i.begin = function () {
                    e.play_timer.style.display = "block"
                }, i.complete = function () {
                    n.next(!0)
                }) : (i.complete = function () {
                    e.play_timer.style.display = "none"
                }, i.opacity = [1, 0]), anime(i)
            }
        }, document.body.insertAdjacentHTML("beforeend", '\t\t<div class="pswp' + (U.is_touch ? " pswp--touch" : "") + (U.only_pointer ? " pswp--has_mouse" : "") + '" tabindex="-1" role="dialog" aria-hidden="true">\t    \t<div class="pswp__bg"></div>\t    \t<div class="pswp__scroll-wrap">\t    \t\t<div class="pswp__container' + (_c.server_exif ? " server-exif" : "") + '">\t\t        <div class="pswp__item"></div>\t\t        <div class="pswp__item"></div>\t\t        <div class="pswp__item"></div>\t        </div>\t        <div class="pswp__ui pswp__ui--hidden pswp__caption-align-' + caption_align + '">\t          <div class="pswp__top-bar">\t            <div class="pswp__counter"></div>\t            <div class="pswp__search"></div>\t            <div class="pswp__topbar-spacer"></div>\t            <svg viewBox="0 0 18 18" class="pswp__preloader svg-preloader"><circle cx="9" cy="9" r="8" pathLength="100" class="svg-preloader-circle"></svg>' + (h.downloadEl ? '<a type="button" class="pswp__button pswp__button--download"' + _(U.download ? "download" : "open in new tab") + ' target="_blank"' + (U.download ? " download" : "") + ">" + P.get_svg_icon(U.download ? "download" : "open_in_new") + "</a>" : f(!0, "pswp__button pswp__button--contextmenu")) + (U.only_touch ? "" : '<button class="pswp__button pswp__button--zoom">' + P.get_svg_icon_multi("zoom_in", "zoom_out") + "</button>") + '\t            <button class="pswp__button pswp__button--play">' + P.get_svg_icon_multi("play", "pause") + "</button>\t            " + (U.fullscreen ? '<button class="pswp__button pswp__button--fs">' + P.get_svg_icon_multi("expand", "collapse") + "</button>" : "") + '\t            <button class="pswp__button pswp__button--close">' + P.get_svg_icon("close") + '</button>\t          </div>\t          <button class="pswp__button pswp__button--arrow--left">' + P.get_svg_icon("chevron_left") + '</button><button class="pswp__button pswp__button--arrow--right">' + P.get_svg_icon("chevron_right") + '</button>\t          <div class="pswp__timer"></div>\t          <div class="pswp__caption pswp__caption-style-' + a + (t ? " pswp__caption-hide" : "") + (c ? " pswp__caption-locked" : "") + '">\t          \t' + (U.only_touch ? "" : '<button class="pswp__button pswp__button--lock-caption">' + P.get_svg_icon_multi("lock_outline", "lock_open_outline") + "</button>") + '\t          \t<div class="pswp__caption__center"></div>\t          </div>\t        </div>\t    \t</div>\t\t\t</div>'), e.pswp = document.body.lastElementChild, e.bg = e.pswp.firstElementChild, e.scrollwrap = e.pswp.lastElementChild, e.container = e.scrollwrap.firstElementChild, e.items = e.container.children, e.ui = e.scrollwrap.lastElementChild, e.topbar = e.ui.firstElementChild, e.caption = e.ui.lastElementChild, e.caption_center = e.caption.lastElementChild, e.play_timer = e.ui.children[3], Array.from(e.topbar.children).forEach((function (t) {
            var i = t.classList;
            return i.contains("pswp__preloader") ? e.preloader = t : i.contains("pswp__button--play") ? e.play_button = t : i.contains("pswp__search") ? e.search = t : i.contains("pswp__button--contextmenu") ? e.contextmenu_button = t : void 0
        })), e.caption.addEventListener("click", (function (t) {
            return t.target.classList.contains("pswp__button--lock-caption") ? (c = !c, ce.toggle_class(e.caption, "pswp__caption-locked", c), E.set("files:popup:locked_caption", c, !0)) : "context" == t.target.dataset.action ? P.create_contextmenu(t, "popup", t.target, n.currItem.item) : void(U.is_pointer && 0 === t.target.className.indexOf("pswp") && ("right" === caption_align && t.pageX > this.clientWidth - 49 ? n.next() : "left" === caption_align && t.pageX < 49 && n.prev()))
        })), U.is_pointer && e.contextmenu_button && y(e.contextmenu_button, (function (e) {
            P.create_contextmenu(e, "popup", e.target, n.currItem.item)
        }))
    }(),
    function () {
        var e = document.body;

        function t(t) {
            e.dataset.updated = t, e.style.cursor = "pointer";
            var i = L(e, "click", (function () {
                e.classList.remove("updated"), e.removeAttribute("data-updated"), e.style.removeProperty("cursor"), i.remove()
            }))
        }
        _c.check_updates && (E.get("files:updated") ? (E.remove("files:updated"), t("✓ Successfully updated to Files app version " + _c.version), e.classList.add("updated")) : I({
            json_response: !0,
            params: "action=check_updates",
            complete: function (i, a, n) {
                if (i && a && n && i.hasOwnProperty("success")) {
                    var o = i.success;
                    if (z(o ? "New version " + o + " available." : "Already using latest version " + _c.version), o) {
                        _id("change-sort").insertAdjacentHTML("afterend", '<div id="files-notifications" class="dropdown"><button type="button" class="btn-icon btn-topbar">' + P.get_svg_icon("bell") + '</button><div class="dropdown-menu dropdown-menu-topbar"><h6 class="dropdown-header">Files ' + o + "</h6>" + (i.writeable ? '<button class="dropdown-item">' + P.get_svg_icon("rotate_right") + '<span class="dropdown-text" data-lang="update">' + X.get("update") + "</span></button>" : "") + (U.download ? '<a href="https://cdn.jsdelivr.net/npm/files.photo.gallery@' + o + '/index.php" class="dropdown-item" download>' + P.get_svg_icon("download") + '<span class="dropdown-text" data-lang="download">' + X.get("download") + "</span></a>" : "") + '<a href="https://files.photo.gallery/latest" class="dropdown-item" target="_blank">' + P.get_svg_icon("info") + '<span class="dropdown-text" data-lang="read more">' + X.get("read more") + "</span></a></div></div>");
                        var l = _id("files-notifications");
                        if (P.dropdown(l, l.firstChild), !i.writeable) return;
                        y(l.children[1].children[1], (function () {
                            ie.fire("Update to Files app " + o + "?").then((i => {
                                i.isConfirmed && (e.classList.add("updating"), I({
                                    params: "action=do_update&version=" + o,
                                    json_response: !0,
                                    complete: function (i, a, n) {
                                        if (e.classList.add("updated"), e.classList.remove("updating"), i && a && n && i.hasOwnProperty("success") && i.success) {
                                            E.set("files:updated", !0);
                                            try {
                                                e.dataset.updated = "✓ Success! Reloading ...", location.reload(!0)
                                            } catch (t) {
                                                e.dataset.updated = "✓ Success! Please refresh ..."
                                            }
                                        } else t("✗ Failed to load update :(")
                                    }
                                }))
                            }))
                        }))
                    }
                } else z("Failed to load external JSON check_updates.")
            }
        }))
    }(), window.onpopstate = function (e) {
        _c.history && e.state && e.state.hasOwnProperty("path") && P.get_files(e.state.path)
    };
    var se = {
        123: "application/vnd.lotus-1-2-3",
        ez: "application/andrew-inset",
        aw: "application/applixware",
        atom: "application/atom+xml",
        atomcat: "application/atomcat+xml",
        atomdeleted: "application/atomdeleted+xml",
        atomsvc: "application/atomsvc+xml",
        dwd: "application/atsc-dwd+xml",
        held: "application/atsc-held+xml",
        rsat: "application/atsc-rsat+xml",
        bdoc: "application/x-bdoc",
        xcs: "application/calendar+xml",
        ccxml: "application/ccxml+xml",
        cdfx: "application/cdfx+xml",
        cdmia: "application/cdmi-capability",
        cdmic: "application/cdmi-container",
        cdmid: "application/cdmi-domain",
        cdmio: "application/cdmi-object",
        cdmiq: "application/cdmi-queue",
        cu: "application/cu-seeme",
        mpd: "application/dash+xml",
        davmount: "application/davmount+xml",
        dbk: "application/docbook+xml",
        dssc: "application/dssc+der",
        xdssc: "application/dssc+xml",
        ecma: "application/ecmascript",
        es: "application/ecmascript",
        emma: "application/emma+xml",
        emotionml: "application/emotionml+xml",
        epub: "application/epub+zip",
        exi: "application/exi",
        fdt: "application/fdt+xml",
        pfr: "application/font-tdpfr",
        geojson: "application/geo+json",
        gml: "application/gml+xml",
        gpx: "application/gpx+xml",
        gxf: "application/gxf",
        gz: "application/gzip",
        hjson: "application/hjson",
        stk: "application/hyperstudio",
        ink: "application/inkml+xml",
        inkml: "application/inkml+xml",
        ipfix: "application/ipfix",
        its: "application/its+xml",
        jar: "application/java-archive",
        war: "application/java-archive",
        ear: "application/java-archive",
        ser: "application/java-serialized-object",
        class: "application/java-vm",
        js: "application/javascript",
        mjs: "application/javascript",
        json: "application/json",
        map: "application/json",
        json5: "application/json5",
        jsonml: "application/jsonml+json",
        jsonld: "application/ld+json",
        lgr: "application/lgr+xml",
        lostxml: "application/lost+xml",
        hqx: "application/mac-binhex40",
        cpt: "application/mac-compactpro",
        mads: "application/mads+xml",
        webmanifest: "application/manifest+json",
        mrc: "application/marc",
        mrcx: "application/marcxml+xml",
        ma: "application/mathematica",
        nb: "application/mathematica",
        mb: "application/mathematica",
        mathml: "application/mathml+xml",
        mbox: "application/mbox",
        mscml: "application/mediaservercontrol+xml",
        metalink: "application/metalink+xml",
        meta4: "application/metalink4+xml",
        mets: "application/mets+xml",
        maei: "application/mmt-aei+xml",
        musd: "application/mmt-usd+xml",
        mods: "application/mods+xml",
        m21: "application/mp21",
        mp21: "application/mp21",
        mp4s: "application/mp4",
        m4p: "application/mp4",
        xdf: "application/xcap-diff+xml",
        doc: "application/msword",
        dot: "application/msword",
        mxf: "application/mxf",
        nq: "application/n-quads",
        nt: "application/n-triples",
        cjs: "application/node",
        bin: "application/octet-stream",
        dms: "application/octet-stream",
        lrf: "application/octet-stream",
        mar: "application/octet-stream",
        so: "application/octet-stream",
        dist: "application/octet-stream",
        distz: "application/octet-stream",
        pkg: "application/octet-stream",
        bpk: "application/octet-stream",
        dump: "application/octet-stream",
        elc: "application/octet-stream",
        deploy: "application/octet-stream",
        exe: "application/x-msdownload",
        dll: "application/x-msdownload",
        deb: "application/x-debian-package",
        dmg: "application/x-apple-diskimage",
        iso: "application/x-iso9660-image",
        img: "application/octet-stream",
        msi: "application/x-msdownload",
        msp: "application/octet-stream",
        msm: "application/octet-stream",
        buffer: "application/octet-stream",
        oda: "application/oda",
        opf: "application/oebps-package+xml",
        ogx: "application/ogg",
        omdoc: "application/omdoc+xml",
        onetoc: "application/onenote",
        onetoc2: "application/onenote",
        onetmp: "application/onenote",
        onepkg: "application/onenote",
        oxps: "application/oxps",
        relo: "application/p2p-overlay+xml",
        xer: "application/xcap-error+xml",
        pdf: "application/pdf",
        pgp: "application/pgp-encrypted",
        asc: "application/pgp-signature",
        sig: "application/pgp-signature",
        prf: "application/pics-rules",
        p10: "application/pkcs10",
        p7m: "application/pkcs7-mime",
        p7c: "application/pkcs7-mime",
        p7s: "application/pkcs7-signature",
        p8: "application/pkcs8",
        ac: "application/vnd.nokia.n-gage.ac+xml",
        cer: "application/pkix-cert",
        crl: "application/pkix-crl",
        pkipath: "application/pkix-pkipath",
        pki: "application/pkixcmp",
        pls: "application/pls+xml",
        ai: "application/postscript",
        eps: "application/postscript",
        ps: "application/postscript",
        provx: "application/provenance+xml",
        cww: "application/prs.cww",
        pskcxml: "application/pskc+xml",
        raml: "application/raml+yaml",
        rdf: "application/rdf+xml",
        owl: "application/rdf+xml",
        rif: "application/reginfo+xml",
        rnc: "application/relax-ng-compact-syntax",
        rl: "application/resource-lists+xml",
        rld: "application/resource-lists-diff+xml",
        rs: "application/rls-services+xml",
        rapd: "application/route-apd+xml",
        sls: "application/route-s-tsid+xml",
        rusd: "application/route-usd+xml",
        gbr: "application/rpki-ghostbusters",
        mft: "application/rpki-manifest",
        roa: "application/rpki-roa",
        rsd: "application/rsd+xml",
        rss: "application/rss+xml",
        rtf: "text/rtf",
        sbml: "application/sbml+xml",
        scq: "application/scvp-cv-request",
        scs: "application/scvp-cv-response",
        spq: "application/scvp-vp-request",
        spp: "application/scvp-vp-response",
        sdp: "application/sdp",
        senmlx: "application/senml+xml",
        sensmlx: "application/sensml+xml",
        setpay: "application/set-payment-initiation",
        setreg: "application/set-registration-initiation",
        shf: "application/shf+xml",
        siv: "application/sieve",
        sieve: "application/sieve",
        smi: "application/smil+xml",
        smil: "application/smil+xml",
        rq: "application/sparql-query",
        srx: "application/sparql-results+xml",
        gram: "application/srgs",
        grxml: "application/srgs+xml",
        sru: "application/sru+xml",
        ssdl: "application/ssdl+xml",
        ssml: "application/ssml+xml",
        swidtag: "application/swid+xml",
        tei: "application/tei+xml",
        teicorpus: "application/tei+xml",
        tfi: "application/thraud+xml",
        tsd: "application/timestamped-data",
        toml: "application/toml",
        ttml: "application/ttml+xml",
        rsheet: "application/urc-ressheet+xml",
        "1km": "application/vnd.1000minds.decision-model+xml",
        plb: "application/vnd.3gpp.pic-bw-large",
        psb: "application/vnd.3gpp.pic-bw-small",
        pvb: "application/vnd.3gpp.pic-bw-var",
        tcap: "application/vnd.3gpp2.tcap",
        pwn: "application/vnd.3m.post-it-notes",
        aso: "application/vnd.accpac.simply.aso",
        imp: "application/vnd.accpac.simply.imp",
        acu: "application/vnd.acucobol",
        atc: "application/vnd.acucorp",
        acutc: "application/vnd.acucorp",
        air: "application/vnd.adobe.air-application-installer-package+zip",
        fcdt: "application/vnd.adobe.formscentral.fcdt",
        fxp: "application/vnd.adobe.fxp",
        fxpl: "application/vnd.adobe.fxp",
        xdp: "application/vnd.adobe.xdp+xml",
        xfdf: "application/vnd.adobe.xfdf",
        ahead: "application/vnd.ahead.space",
        azf: "application/vnd.airzip.filesecure.azf",
        azs: "application/vnd.airzip.filesecure.azs",
        azw: "application/vnd.amazon.ebook",
        acc: "application/vnd.americandynamics.acc",
        ami: "application/vnd.amiga.ami",
        apk: "application/vnd.android.package-archive",
        cii: "application/vnd.anser-web-certificate-issue-initiation",
        fti: "application/vnd.anser-web-funds-transfer-initiation",
        atx: "application/vnd.antix.game-component",
        mpkg: "application/vnd.apple.installer+xml",
        keynote: "application/vnd.apple.keynote",
        m3u8: "application/vnd.apple.mpegurl",
        numbers: "application/vnd.apple.numbers",
        pages: "application/vnd.apple.pages",
        pkpass: "application/vnd.apple.pkpass",
        swi: "application/vnd.aristanetworks.swi",
        iota: "application/vnd.astraea-software.iota",
        aep: "application/vnd.audiograph",
        bmml: "application/vnd.balsamiq.bmml+xml",
        mpm: "application/vnd.blueice.multipass",
        bmi: "application/vnd.bmi",
        rep: "application/vnd.businessobjects",
        cdxml: "application/vnd.chemdraw+xml",
        mmd: "application/vnd.chipnuts.karaoke-mmd",
        cdy: "application/vnd.cinderella",
        csl: "application/vnd.citationstyles.style+xml",
        cla: "application/vnd.claymore",
        rp9: "application/vnd.cloanto.rp9",
        c4g: "application/vnd.clonk.c4group",
        c4d: "application/vnd.clonk.c4group",
        c4f: "application/vnd.clonk.c4group",
        c4p: "application/vnd.clonk.c4group",
        c4u: "application/vnd.clonk.c4group",
        c11amc: "application/vnd.cluetrust.cartomobile-config",
        c11amz: "application/vnd.cluetrust.cartomobile-config-pkg",
        csp: "application/vnd.commonspace",
        cdbcmsg: "application/vnd.contact.cmsg",
        cmc: "application/vnd.cosmocaller",
        clkx: "application/vnd.crick.clicker",
        clkk: "application/vnd.crick.clicker.keyboard",
        clkp: "application/vnd.crick.clicker.palette",
        clkt: "application/vnd.crick.clicker.template",
        clkw: "application/vnd.crick.clicker.wordbank",
        wbs: "application/vnd.criticaltools.wbs+xml",
        pml: "application/vnd.ctc-posml",
        ppd: "application/vnd.cups-ppd",
        car: "application/vnd.curl.car",
        pcurl: "application/vnd.curl.pcurl",
        dart: "application/vnd.dart",
        rdz: "application/vnd.data-vision.rdz",
        uvf: "application/vnd.dece.data",
        uvvf: "application/vnd.dece.data",
        uvd: "application/vnd.dece.data",
        uvvd: "application/vnd.dece.data",
        uvt: "application/vnd.dece.ttml+xml",
        uvvt: "application/vnd.dece.ttml+xml",
        uvx: "application/vnd.dece.unspecified",
        uvvx: "application/vnd.dece.unspecified",
        uvz: "application/vnd.dece.zip",
        uvvz: "application/vnd.dece.zip",
        fe_launch: "application/vnd.denovo.fcselayout-link",
        dna: "application/vnd.dna",
        mlp: "application/vnd.dolby.mlp",
        dpg: "application/vnd.dpgraph",
        dfac: "application/vnd.dreamfactory",
        kpxx: "application/vnd.ds-keypoint",
        ait: "application/vnd.dvb.ait",
        svc: "application/vnd.dvb.service",
        geo: "application/vnd.dynageo",
        mag: "application/vnd.ecowin.chart",
        nml: "application/vnd.enliven",
        esf: "application/vnd.epson.esf",
        msf: "application/vnd.epson.msf",
        qam: "application/vnd.epson.quickanime",
        slt: "application/vnd.epson.salt",
        ssf: "application/vnd.epson.ssf",
        es3: "application/vnd.eszigno3+xml",
        et3: "application/vnd.eszigno3+xml",
        ez2: "application/vnd.ezpix-album",
        ez3: "application/vnd.ezpix-package",
        fdf: "application/vnd.fdf",
        mseed: "application/vnd.fdsn.mseed",
        seed: "application/vnd.fdsn.seed",
        dataless: "application/vnd.fdsn.seed",
        gph: "application/vnd.flographit",
        ftc: "application/vnd.fluxtime.clip",
        fm: "application/vnd.framemaker",
        frame: "application/vnd.framemaker",
        maker: "application/vnd.framemaker",
        book: "application/vnd.framemaker",
        fnc: "application/vnd.frogans.fnc",
        ltf: "application/vnd.frogans.ltf",
        fsc: "application/vnd.fsc.weblaunch",
        oas: "application/vnd.fujitsu.oasys",
        oa2: "application/vnd.fujitsu.oasys2",
        oa3: "application/vnd.fujitsu.oasys3",
        fg5: "application/vnd.fujitsu.oasysgp",
        bh2: "application/vnd.fujitsu.oasysprs",
        ddd: "application/vnd.fujixerox.ddd",
        xdw: "application/vnd.fujixerox.docuworks",
        xbd: "application/vnd.fujixerox.docuworks.binder",
        fzs: "application/vnd.fuzzysheet",
        txd: "application/vnd.genomatix.tuxedo",
        ggb: "application/vnd.geogebra.file",
        ggt: "application/vnd.geogebra.tool",
        gex: "application/vnd.geometry-explorer",
        gre: "application/vnd.geometry-explorer",
        gxt: "application/vnd.geonext",
        g2w: "application/vnd.geoplan",
        g3w: "application/vnd.geospace",
        gmx: "application/vnd.gmx",
        gdoc: "application/vnd.google-apps.document",
        gslides: "application/vnd.google-apps.presentation",
        gsheet: "application/vnd.google-apps.spreadsheet",
        kml: "application/vnd.google-earth.kml+xml",
        kmz: "application/vnd.google-earth.kmz",
        gqf: "application/vnd.grafeq",
        gqs: "application/vnd.grafeq",
        gac: "application/vnd.groove-account",
        ghf: "application/vnd.groove-help",
        gim: "application/vnd.groove-identity-message",
        grv: "application/vnd.groove-injector",
        gtm: "application/vnd.groove-tool-message",
        tpl: "application/vnd.groove-tool-template",
        vcg: "application/vnd.groove-vcard",
        hal: "application/vnd.hal+xml",
        zmm: "application/vnd.handheld-entertainment+xml",
        hbci: "application/vnd.hbci",
        les: "application/vnd.hhe.lesson-player",
        hpgl: "application/vnd.hp-hpgl",
        hpid: "application/vnd.hp-hpid",
        hps: "application/vnd.hp-hps",
        jlt: "application/vnd.hp-jlyt",
        pcl: "application/vnd.hp-pcl",
        pclxl: "application/vnd.hp-pclxl",
        "sfd-hdstx": "application/vnd.hydrostatix.sof-data",
        mpy: "application/vnd.ibm.minipay",
        afp: "application/vnd.ibm.modcap",
        listafp: "application/vnd.ibm.modcap",
        list3820: "application/vnd.ibm.modcap",
        irm: "application/vnd.ibm.rights-management",
        sc: "application/vnd.ibm.secure-container",
        icc: "application/vnd.iccprofile",
        icm: "application/vnd.iccprofile",
        igl: "application/vnd.igloader",
        ivp: "application/vnd.immervision-ivp",
        ivu: "application/vnd.immervision-ivu",
        igm: "application/vnd.insors.igm",
        xpw: "application/vnd.intercon.formnet",
        xpx: "application/vnd.intercon.formnet",
        i2g: "application/vnd.intergeo",
        qbo: "application/vnd.intu.qbo",
        qfx: "application/vnd.intu.qfx",
        rcprofile: "application/vnd.ipunplugged.rcprofile",
        irp: "application/vnd.irepository.package+xml",
        xpr: "application/vnd.is-xpr",
        fcs: "application/vnd.isac.fcs",
        jam: "application/vnd.jam",
        rms: "application/vnd.jcp.javame.midlet-rms",
        jisp: "application/vnd.jisp",
        joda: "application/vnd.joost.joda-archive",
        ktz: "application/vnd.kahootz",
        ktr: "application/vnd.kahootz",
        karbon: "application/vnd.kde.karbon",
        chrt: "application/vnd.kde.kchart",
        kfo: "application/vnd.kde.kformula",
        flw: "application/vnd.kde.kivio",
        kon: "application/vnd.kde.kontour",
        kpr: "application/vnd.kde.kpresenter",
        kpt: "application/vnd.kde.kpresenter",
        ksp: "application/vnd.kde.kspread",
        kwd: "application/vnd.kde.kword",
        kwt: "application/vnd.kde.kword",
        htke: "application/vnd.kenameaapp",
        kia: "application/vnd.kidspiration",
        kne: "application/vnd.kinar",
        knp: "application/vnd.kinar",
        skp: "application/vnd.koan",
        skd: "application/vnd.koan",
        skt: "application/vnd.koan",
        skm: "application/vnd.koan",
        sse: "application/vnd.kodak-descriptor",
        lasxml: "application/vnd.las.las+xml",
        lbd: "application/vnd.llamagraphics.life-balance.desktop",
        lbe: "application/vnd.llamagraphics.life-balance.exchange+xml",
        apr: "application/vnd.lotus-approach",
        pre: "application/vnd.lotus-freelance",
        nsf: "application/vnd.lotus-notes",
        org: "text/x-org",
        scm: "application/vnd.lotus-screencam",
        lwp: "application/vnd.lotus-wordpro",
        portpkg: "application/vnd.macports.portpkg",
        mcd: "application/vnd.mcd",
        mc1: "application/vnd.medcalcdata",
        cdkey: "application/vnd.mediastation.cdkey",
        mwf: "application/vnd.mfer",
        mfm: "application/vnd.mfmp",
        flo: "application/vnd.micrografx.flo",
        igx: "application/vnd.micrografx.igx",
        mif: "application/vnd.mif",
        daf: "application/vnd.mobius.daf",
        dis: "application/vnd.mobius.dis",
        mbk: "application/vnd.mobius.mbk",
        mqy: "application/vnd.mobius.mqy",
        msl: "application/vnd.mobius.msl",
        plc: "application/vnd.mobius.plc",
        txf: "application/vnd.mobius.txf",
        mpn: "application/vnd.mophun.application",
        mpc: "application/vnd.mophun.certificate",
        xul: "application/vnd.mozilla.xul+xml",
        cil: "application/vnd.ms-artgalry",
        cab: "application/vnd.ms-cab-compressed",
        xls: "application/vnd.ms-excel",
        xlm: "application/vnd.ms-excel",
        xla: "application/vnd.ms-excel",
        xlc: "application/vnd.ms-excel",
        xlt: "application/vnd.ms-excel",
        xlw: "application/vnd.ms-excel",
        xlam: "application/vnd.ms-excel.addin.macroenabled.12",
        xlsb: "application/vnd.ms-excel.sheet.binary.macroenabled.12",
        xlsm: "application/vnd.ms-excel.sheet.macroenabled.12",
        xltm: "application/vnd.ms-excel.template.macroenabled.12",
        eot: "application/vnd.ms-fontobject",
        chm: "application/vnd.ms-htmlhelp",
        ims: "application/vnd.ms-ims",
        lrm: "application/vnd.ms-lrm",
        thmx: "application/vnd.ms-officetheme",
        msg: "application/vnd.ms-outlook",
        cat: "application/vnd.ms-pki.seccat",
        stl: "model/stl",
        ppt: "application/vnd.ms-powerpoint",
        pps: "application/vnd.ms-powerpoint",
        pot: "application/vnd.ms-powerpoint",
        ppam: "application/vnd.ms-powerpoint.addin.macroenabled.12",
        pptm: "application/vnd.ms-powerpoint.presentation.macroenabled.12",
        sldm: "application/vnd.ms-powerpoint.slide.macroenabled.12",
        ppsm: "application/vnd.ms-powerpoint.slideshow.macroenabled.12",
        potm: "application/vnd.ms-powerpoint.template.macroenabled.12",
        mpp: "application/vnd.ms-project",
        mpt: "application/vnd.ms-project",
        docm: "application/vnd.ms-word.document.macroenabled.12",
        dotm: "application/vnd.ms-word.template.macroenabled.12",
        wps: "application/vnd.ms-works",
        wks: "application/vnd.ms-works",
        wcm: "application/vnd.ms-works",
        wdb: "application/vnd.ms-works",
        wpl: "application/vnd.ms-wpl",
        xps: "application/vnd.ms-xpsdocument",
        mseq: "application/vnd.mseq",
        mus: "application/vnd.musician",
        msty: "application/vnd.muvee.style",
        taglet: "application/vnd.mynfc",
        nlu: "application/vnd.neurolanguage.nlu",
        ntf: "application/vnd.nitf",
        nitf: "application/vnd.nitf",
        nnd: "application/vnd.noblenet-directory",
        nns: "application/vnd.noblenet-sealer",
        nnw: "application/vnd.noblenet-web",
        ngdat: "application/vnd.nokia.n-gage.data",
        "n-gage": "application/vnd.nokia.n-gage.symbian.install",
        rpst: "application/vnd.nokia.radio-preset",
        rpss: "application/vnd.nokia.radio-presets",
        edm: "application/vnd.novadigm.edm",
        edx: "application/vnd.novadigm.edx",
        ext: "application/vnd.novadigm.ext",
        odc: "application/vnd.oasis.opendocument.chart",
        otc: "application/vnd.oasis.opendocument.chart-template",
        odb: "application/vnd.oasis.opendocument.database",
        odf: "application/vnd.oasis.opendocument.formula",
        odft: "application/vnd.oasis.opendocument.formula-template",
        odg: "application/vnd.oasis.opendocument.graphics",
        otg: "application/vnd.oasis.opendocument.graphics-template",
        odi: "application/vnd.oasis.opendocument.image",
        oti: "application/vnd.oasis.opendocument.image-template",
        odp: "application/vnd.oasis.opendocument.presentation",
        otp: "application/vnd.oasis.opendocument.presentation-template",
        ods: "application/vnd.oasis.opendocument.spreadsheet",
        ots: "application/vnd.oasis.opendocument.spreadsheet-template",
        odt: "application/vnd.oasis.opendocument.text",
        odm: "application/vnd.oasis.opendocument.text-master",
        ott: "application/vnd.oasis.opendocument.text-template",
        oth: "application/vnd.oasis.opendocument.text-web",
        xo: "application/vnd.olpc-sugar",
        dd2: "application/vnd.oma.dd2+xml",
        obgx: "application/vnd.openblox.game+xml",
        oxt: "application/vnd.openofficeorg.extension",
        osm: "application/vnd.openstreetmap.data+xml",
        pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        sldx: "application/vnd.openxmlformats-officedocument.presentationml.slide",
        ppsx: "application/vnd.openxmlformats-officedocument.presentationml.slideshow",
        potx: "application/vnd.openxmlformats-officedocument.presentationml.template",
        xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        xltx: "application/vnd.openxmlformats-officedocument.spreadsheetml.template",
        docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        dotx: "application/vnd.openxmlformats-officedocument.wordprocessingml.template",
        mgp: "application/vnd.osgeo.mapguide.package",
        dp: "application/vnd.osgi.dp",
        esa: "application/vnd.osgi.subsystem",
        pdb: "application/x-pilot",
        pqa: "application/vnd.palm",
        oprc: "application/vnd.palm",
        paw: "application/vnd.pawaafile",
        str: "application/vnd.pg.format",
        ei6: "application/vnd.pg.osasli",
        efif: "application/vnd.picsel",
        wg: "application/vnd.pmi.widget",
        plf: "application/vnd.pocketlearn",
        pbd: "application/vnd.powerbuilder6",
        box: "application/vnd.previewsystems.box",
        mgz: "application/vnd.proteus.magazine",
        qps: "application/vnd.publishare-delta-tree",
        ptid: "application/vnd.pvi.ptid1",
        qxd: "application/vnd.quark.quarkxpress",
        qxt: "application/vnd.quark.quarkxpress",
        qwd: "application/vnd.quark.quarkxpress",
        qwt: "application/vnd.quark.quarkxpress",
        qxl: "application/vnd.quark.quarkxpress",
        qxb: "application/vnd.quark.quarkxpress",
        bed: "application/vnd.realvnc.bed",
        mxl: "application/vnd.recordare.musicxml",
        musicxml: "application/vnd.recordare.musicxml+xml",
        cryptonote: "application/vnd.rig.cryptonote",
        cod: "application/vnd.rim.cod",
        rm: "application/vnd.rn-realmedia",
        rmvb: "application/vnd.rn-realmedia-vbr",
        link66: "application/vnd.route66.link66+xml",
        st: "application/vnd.sailingtracker.track",
        see: "application/vnd.seemail",
        sema: "application/vnd.sema",
        semd: "application/vnd.semd",
        semf: "application/vnd.semf",
        ifm: "application/vnd.shana.informed.formdata",
        itp: "application/vnd.shana.informed.formtemplate",
        iif: "application/vnd.shana.informed.interchange",
        ipk: "application/vnd.shana.informed.package",
        twd: "application/vnd.simtech-mindmapper",
        twds: "application/vnd.simtech-mindmapper",
        mmf: "application/vnd.smaf",
        teacher: "application/vnd.smart.teacher",
        fo: "application/vnd.software602.filler.form+xml",
        sdkm: "application/vnd.solent.sdkm+xml",
        sdkd: "application/vnd.solent.sdkm+xml",
        dxp: "application/vnd.spotfire.dxp",
        sfs: "application/vnd.spotfire.sfs",
        sdc: "application/vnd.stardivision.calc",
        sda: "application/vnd.stardivision.draw",
        sdd: "application/vnd.stardivision.impress",
        smf: "application/vnd.stardivision.math",
        sdw: "application/vnd.stardivision.writer",
        vor: "application/vnd.stardivision.writer",
        sgl: "application/vnd.stardivision.writer-global",
        smzip: "application/vnd.stepmania.package",
        sm: "application/vnd.stepmania.stepchart",
        wadl: "application/vnd.sun.wadl+xml",
        sxc: "application/vnd.sun.xml.calc",
        stc: "application/vnd.sun.xml.calc.template",
        sxd: "application/vnd.sun.xml.draw",
        std: "application/vnd.sun.xml.draw.template",
        sxi: "application/vnd.sun.xml.impress",
        sti: "application/vnd.sun.xml.impress.template",
        sxm: "application/vnd.sun.xml.math",
        sxw: "application/vnd.sun.xml.writer",
        sxg: "application/vnd.sun.xml.writer.global",
        stw: "application/vnd.sun.xml.writer.template",
        sus: "application/vnd.sus-calendar",
        susp: "application/vnd.sus-calendar",
        svd: "application/vnd.svd",
        sis: "application/vnd.symbian.install",
        sisx: "application/vnd.symbian.install",
        xsm: "application/vnd.syncml+xml",
        bdm: "application/vnd.syncml.dm+wbxml",
        xdm: "application/vnd.syncml.dm+xml",
        ddf: "application/vnd.syncml.dmddf+xml",
        tao: "application/vnd.tao.intent-module-archive",
        pcap: "application/vnd.tcpdump.pcap",
        cap: "application/vnd.tcpdump.pcap",
        dmp: "application/vnd.tcpdump.pcap",
        tmo: "application/vnd.tmobile-livetv",
        tpt: "application/vnd.trid.tpt",
        mxs: "application/vnd.triscape.mxs",
        tra: "application/vnd.trueapp",
        ufd: "application/vnd.ufdl",
        ufdl: "application/vnd.ufdl",
        utz: "application/vnd.uiq.theme",
        umj: "application/vnd.umajin",
        unityweb: "application/vnd.unity",
        uoml: "application/vnd.uoml+xml",
        vcx: "application/vnd.vcx",
        vsd: "application/vnd.visio",
        vst: "application/vnd.visio",
        vss: "application/vnd.visio",
        vsw: "application/vnd.visio",
        vis: "application/vnd.visionary",
        vsf: "application/vnd.vsf",
        wbxml: "application/vnd.wap.wbxml",
        wmlc: "application/vnd.wap.wmlc",
        wmlsc: "application/vnd.wap.wmlscriptc",
        wtb: "application/vnd.webturbo",
        nbp: "application/vnd.wolfram.player",
        wpd: "application/vnd.wordperfect",
        wqd: "application/vnd.wqd",
        stf: "application/vnd.wt.stf",
        xar: "application/vnd.xara",
        xfdl: "application/vnd.xfdl",
        hvd: "application/vnd.yamaha.hv-dic",
        hvs: "application/vnd.yamaha.hv-script",
        hvp: "application/vnd.yamaha.hv-voice",
        osf: "application/vnd.yamaha.openscoreformat",
        osfpvg: "application/vnd.yamaha.openscoreformat.osfpvg+xml",
        saf: "application/vnd.yamaha.smaf-audio",
        spf: "application/vnd.yamaha.smaf-phrase",
        cmp: "application/vnd.yellowriver-custom-menu",
        zir: "application/vnd.zul",
        zirz: "application/vnd.zul",
        zaz: "application/vnd.zzazz.deck+xml",
        vxml: "application/voicexml+xml",
        wasm: "application/wasm",
        wgt: "application/widget",
        hlp: "application/winhlp",
        wsdl: "application/wsdl+xml",
        wspolicy: "application/wspolicy+xml",
        "7z": "application/x-7z-compressed",
        abw: "application/x-abiword",
        ace: "application/x-ace-compressed",
        arj: "application/x-arj",
        aab: "application/x-authorware-bin",
        x32: "application/x-authorware-bin",
        u32: "application/x-authorware-bin",
        vox: "application/x-authorware-bin",
        aam: "application/x-authorware-map",
        aas: "application/x-authorware-seg",
        bcpio: "application/x-bcpio",
        torrent: "application/x-bittorrent",
        blb: "application/x-blorb",
        blorb: "application/x-blorb",
        bz: "application/x-bzip",
        bz2: "application/x-bzip2",
        boz: "application/x-bzip2",
        cbr: "application/x-cbr",
        cba: "application/x-cbr",
        cbt: "application/x-cbr",
        cbz: "application/x-cbr",
        cb7: "application/x-cbr",
        vcd: "application/x-cdlink",
        cfs: "application/x-cfs-compressed",
        chat: "application/x-chat",
        pgn: "application/x-chess-pgn",
        crx: "application/x-chrome-extension",
        cco: "application/x-cocoa",
        nsc: "application/x-conference",
        cpio: "application/x-cpio",
        csh: "application/x-csh",
        udeb: "application/x-debian-package",
        dgc: "application/x-dgc-compressed",
        dir: "application/x-director",
        dcr: "application/x-director",
        dxr: "application/x-director",
        cst: "application/x-director",
        cct: "application/x-director",
        cxt: "application/x-director",
        w3d: "application/x-director",
        fgd: "application/x-director",
        swa: "application/x-director",
        wad: "application/x-doom",
        ncx: "application/x-dtbncx+xml",
        dtb: "application/x-dtbook+xml",
        res: "application/x-dtbresource+xml",
        dvi: "application/x-dvi",
        evy: "application/x-envoy",
        eva: "application/x-eva",
        bdf: "application/x-font-bdf",
        gsf: "application/x-font-ghostscript",
        psf: "application/x-font-linux-psf",
        pcf: "application/x-font-pcf",
        snf: "application/x-font-snf",
        pfa: "application/x-font-type1",
        pfb: "application/x-font-type1",
        pfm: "application/x-font-type1",
        afm: "application/x-font-type1",
        arc: "application/x-freearc",
        spl: "application/x-futuresplash",
        gca: "application/x-gca-compressed",
        ulx: "application/x-glulx",
        gnumeric: "application/x-gnumeric",
        gramps: "application/x-gramps-xml",
        gtar: "application/x-gtar",
        hdf: "application/x-hdf",
        php: "application/x-httpd-php",
        install: "application/x-install-instructions",
        jardiff: "application/x-java-archive-diff",
        jnlp: "application/x-java-jnlp-file",
        kdbx: "application/x-keepass2",
        latex: "application/x-latex",
        luac: "application/x-lua-bytecode",
        lzh: "application/x-lzh-compressed",
        lha: "application/x-lzh-compressed",
        run: "application/x-makeself",
        mie: "application/x-mie",
        prc: "application/x-pilot",
        mobi: "application/x-mobipocket-ebook",
        application: "application/x-ms-application",
        lnk: "application/x-ms-shortcut",
        wmd: "application/x-ms-wmd",
        wmz: "application/x-msmetafile",
        xbap: "application/x-ms-xbap",
        mdb: "application/x-msaccess",
        obd: "application/x-msbinder",
        crd: "application/x-mscardfile",
        clp: "application/x-msclip",
        com: "application/x-msdownload",
        bat: "application/x-msdownload",
        mvb: "application/x-msmediaview",
        m13: "application/x-msmediaview",
        m14: "application/x-msmediaview",
        wmf: "image/wmf",
        emf: "image/emf",
        emz: "application/x-msmetafile",
        mny: "application/x-msmoney",
        pub: "application/x-mspublisher",
        scd: "application/x-msschedule",
        trm: "application/x-msterminal",
        wri: "application/x-mswrite",
        nc: "application/x-netcdf",
        cdf: "application/x-netcdf",
        pac: "application/x-ns-proxy-autoconfig",
        nzb: "application/x-nzb",
        pl: "application/x-perl",
        pm: "application/x-perl",
        p12: "application/x-pkcs12",
        pfx: "application/x-pkcs12",
        p7b: "application/x-pkcs7-certificates",
        spc: "application/x-pkcs7-certificates",
        p7r: "application/x-pkcs7-certreqresp",
        rar: "application/x-rar-compressed",
        rpm: "application/x-redhat-package-manager",
        ris: "application/x-research-info-systems",
        sea: "application/x-sea",
        sh: "application/x-sh",
        shar: "application/x-shar",
        swf: "application/x-shockwave-flash",
        xap: "application/x-silverlight-app",
        sql: "application/x-sql",
        sit: "application/x-stuffit",
        sitx: "application/x-stuffitx",
        srt: "application/x-subrip",
        sv4cpio: "application/x-sv4cpio",
        sv4crc: "application/x-sv4crc",
        t3: "application/x-t3vm-image",
        gam: "application/x-tads",
        tar: "application/x-tar",
        tcl: "application/x-tcl",
        tk: "application/x-tcl",
        tex: "application/x-tex",
        tfm: "application/x-tex-tfm",
        texinfo: "application/x-texinfo",
        texi: "application/x-texinfo",
        obj: "model/obj",
        ustar: "application/x-ustar",
        hdd: "application/x-virtualbox-hdd",
        ova: "application/x-virtualbox-ova",
        ovf: "application/x-virtualbox-ovf",
        vbox: "application/x-virtualbox-vbox",
        "vbox-extpack": "application/x-virtualbox-vbox-extpack",
        vdi: "application/x-virtualbox-vdi",
        vhd: "application/x-virtualbox-vhd",
        vmdk: "application/x-virtualbox-vmdk",
        src: "application/x-wais-source",
        webapp: "application/x-web-app-manifest+json",
        der: "application/x-x509-ca-cert",
        crt: "application/x-x509-ca-cert",
        pem: "application/x-x509-ca-cert",
        fig: "application/x-xfig",
        xlf: "application/xliff+xml",
        xpi: "application/x-xpinstall",
        xz: "application/x-xz",
        z1: "application/x-zmachine",
        z2: "application/x-zmachine",
        z3: "application/x-zmachine",
        z4: "application/x-zmachine",
        z5: "application/x-zmachine",
        z6: "application/x-zmachine",
        z7: "application/x-zmachine",
        z8: "application/x-zmachine",
        xaml: "application/xaml+xml",
        xav: "application/xcap-att+xml",
        xca: "application/xcap-caps+xml",
        xel: "application/xcap-el+xml",
        xns: "application/xcap-ns+xml",
        xenc: "application/xenc+xml",
        xhtml: "application/xhtml+xml",
        xht: "application/xhtml+xml",
        xml: "text/xml",
        xsl: "application/xml",
        xsd: "application/xml",
        rng: "application/xml",
        dtd: "application/xml-dtd",
        xop: "application/xop+xml",
        xpl: "application/xproc+xml",
        xslt: "application/xslt+xml",
        xspf: "application/xspf+xml",
        mxml: "application/xv+xml",
        xhvml: "application/xv+xml",
        xvml: "application/xv+xml",
        xvm: "application/xv+xml",
        yang: "application/yang",
        yin: "application/yin+xml",
        zip: "application/zip",
        "3gpp": "video/3gpp",
        adp: "audio/adpcm",
        au: "audio/basic",
        snd: "audio/basic",
        mid: "audio/midi",
        midi: "audio/midi",
        kar: "audio/midi",
        rmi: "audio/midi",
        mxmf: "audio/mobile-xmf",
        mp3: "audio/mpeg",
        m4a: "audio/x-m4a",
        mp4a: "audio/mp4",
        mpga: "audio/mpeg",
        mp2: "audio/mpeg",
        mp2a: "audio/mpeg",
        m2a: "audio/mpeg",
        m3a: "audio/mpeg",
        oga: "audio/ogg",
        ogg: "audio/ogg",
        spx: "audio/ogg",
        s3m: "audio/s3m",
        sil: "audio/silk",
        uva: "audio/vnd.dece.audio",
        uvva: "audio/vnd.dece.audio",
        eol: "audio/vnd.digital-winds",
        dra: "audio/vnd.dra",
        dts: "audio/vnd.dts",
        dtshd: "audio/vnd.dts.hd",
        lvp: "audio/vnd.lucent.voice",
        pya: "audio/vnd.ms-playready.media.pya",
        ecelp4800: "audio/vnd.nuera.ecelp4800",
        ecelp7470: "audio/vnd.nuera.ecelp7470",
        ecelp9600: "audio/vnd.nuera.ecelp9600",
        rip: "audio/vnd.rip",
        wav: "audio/x-wav",
        weba: "audio/webm",
        aac: "audio/x-aac",
        aif: "audio/x-aiff",
        aiff: "audio/x-aiff",
        aifc: "audio/x-aiff",
        caf: "audio/x-caf",
        flac: "audio/flac",
        mka: "audio/x-matroska",
        m3u: "audio/x-mpegurl",
        wax: "audio/x-ms-wax",
        wma: "audio/x-ms-wma",
        ram: "audio/x-pn-realaudio",
        ra: "audio/x-realaudio",
        rmp: "audio/x-pn-realaudio-plugin",
        xm: "audio/xm",
        cdx: "chemical/x-cdx",
        cif: "chemical/x-cif",
        cmdf: "chemical/x-cmdf",
        cml: "chemical/x-cml",
        csml: "chemical/x-csml",
        xyz: "chemical/x-xyz",
        ttc: "font/collection",
        otf: "font/otf",
        ttf: "font/ttf",
        woff: "font/woff",
        woff2: "font/woff2",
        exr: "image/aces",
        apng: "image/apng",
        bmp: "image/x-ms-bmp",
        cgm: "image/cgm",
        drle: "image/dicom-rle",
        fits: "image/fits",
        g3: "image/g3fax",
        gif: "image/gif",
        heic: "image/heic",
        heics: "image/heic-sequence",
        heif: "image/heif",
        heifs: "image/heif-sequence",
        hej2: "image/hej2k",
        hsj2: "image/hsj2",
        ief: "image/ief",
        jls: "image/jls",
        jp2: "image/jp2",
        jpg2: "image/jp2",
        jpeg: "image/jpeg",
        jpg: "image/jpeg",
        jpe: "image/jpeg",
        jph: "image/jph",
        jhc: "image/jphc",
        jpm: "video/jpm",
        jpx: "image/jpx",
        jpf: "image/jpx",
        jxr: "image/jxr",
        jxra: "image/jxra",
        jxrs: "image/jxrs",
        jxs: "image/jxs",
        jxsc: "image/jxsc",
        jxsi: "image/jxsi",
        jxss: "image/jxss",
        ktx: "image/ktx",
        png: "image/png",
        btif: "image/prs.btif",
        pti: "image/prs.pti",
        sgi: "image/sgi",
        svg: "image/svg+xml",
        svgz: "image/svg+xml",
        t38: "image/t38",
        tif: "image/tiff",
        tiff: "image/tiff",
        tfx: "image/tiff-fx",
        psd: "image/vnd.adobe.photoshop",
        azv: "image/vnd.airzip.accelerator.azv",
        uvi: "image/vnd.dece.graphic",
        uvvi: "image/vnd.dece.graphic",
        uvg: "image/vnd.dece.graphic",
        uvvg: "image/vnd.dece.graphic",
        djvu: "image/vnd.djvu",
        djv: "image/vnd.djvu",
        sub: "text/vnd.dvb.subtitle",
        dwg: "image/vnd.dwg",
        dxf: "image/vnd.dxf",
        fbs: "image/vnd.fastbidsheet",
        fpx: "image/vnd.fpx",
        fst: "image/vnd.fst",
        mmr: "image/vnd.fujixerox.edmics-mmr",
        rlc: "image/vnd.fujixerox.edmics-rlc",
        ico: "image/x-icon",
        dds: "image/vnd.ms-dds",
        mdi: "image/vnd.ms-modi",
        wdp: "image/vnd.ms-photo",
        npx: "image/vnd.net-fpx",
        tap: "image/vnd.tencent.tap",
        vtf: "image/vnd.valve.source.texture",
        wbmp: "image/vnd.wap.wbmp",
        xif: "image/vnd.xiff",
        pcx: "image/x-pcx",
        webp: "image/webp",
        "3ds": "image/x-3ds",
        ras: "image/x-cmu-raster",
        cmx: "image/x-cmx",
        fh: "image/x-freehand",
        fhc: "image/x-freehand",
        fh4: "image/x-freehand",
        fh5: "image/x-freehand",
        fh7: "image/x-freehand",
        jng: "image/x-jng",
        sid: "image/x-mrsid-image",
        pic: "image/x-pict",
        pct: "image/x-pict",
        pnm: "image/x-portable-anymap",
        pbm: "image/x-portable-bitmap",
        pgm: "image/x-portable-graymap",
        ppm: "image/x-portable-pixmap",
        rgb: "image/x-rgb",
        tga: "image/x-tga",
        xbm: "image/x-xbitmap",
        xpm: "image/x-xpixmap",
        xwd: "image/x-xwindowdump",
        "disposition-notification": "message/disposition-notification",
        u8msg: "message/global",
        u8dsn: "message/global-delivery-status",
        u8mdn: "message/global-disposition-notification",
        u8hdr: "message/global-headers",
        eml: "message/rfc822",
        mime: "message/rfc822",
        wsc: "message/vnd.wfa.wsc",
        "3mf": "model/3mf",
        gltf: "model/gltf+json",
        glb: "model/gltf-binary",
        igs: "model/iges",
        iges: "model/iges",
        msh: "model/mesh",
        mesh: "model/mesh",
        silo: "model/mesh",
        mtl: "model/mtl",
        dae: "model/vnd.collada+xml",
        dwf: "model/vnd.dwf",
        gdl: "model/vnd.gdl",
        gtw: "model/vnd.gtw",
        mts: "model/vnd.mts",
        ogex: "model/vnd.opengex",
        x_b: "model/vnd.parasolid.transmit.binary",
        x_t: "model/vnd.parasolid.transmit.text",
        usdz: "model/vnd.usdz+zip",
        bsp: "model/vnd.valve.source.compiled-map",
        vtu: "model/vnd.vtu",
        wrl: "model/vrml",
        vrml: "model/vrml",
        x3db: "model/x3d+fastinfoset",
        x3dbz: "model/x3d+binary",
        x3dv: "model/x3d-vrml",
        x3dvz: "model/x3d+vrml",
        x3d: "model/x3d+xml",
        x3dz: "model/x3d+xml",
        appcache: "text/cache-manifest",
        manifest: "text/cache-manifest",
        ics: "text/calendar",
        ifb: "text/calendar",
        coffee: "text/coffeescript",
        litcoffee: "text/coffeescript",
        css: "text/css",
        csv: "text/csv",
        html: "text/html",
        htm: "text/html",
        shtml: "text/html",
        jade: "text/jade",
        jsx: "text/jsx",
        less: "text/less",
        markdown: "text/markdown",
        md: "text/markdown",
        mml: "text/mathml",
        mdx: "text/mdx",
        n3: "text/n3",
        txt: "text/plain",
        text: "text/plain",
        conf: "text/plain",
        def: "text/plain",
        list: "text/plain",
        log: "text/plain",
        in: "text/plain",
        ini: "text/plain",
        dsc: "text/prs.lines.tag",
        rtx: "text/richtext",
        sgml: "text/sgml",
        sgm: "text/sgml",
        shex: "text/shex",
        slim: "text/slim",
        slm: "text/slim",
        stylus: "text/stylus",
        styl: "text/stylus",
        tsv: "text/tab-separated-values",
        t: "text/troff",
        tr: "text/troff",
        roff: "text/troff",
        man: "text/troff",
        me: "text/troff",
        ms: "text/troff",
        ttl: "text/turtle",
        uri: "text/uri-list",
        uris: "text/uri-list",
        urls: "text/uri-list",
        vcard: "text/vcard",
        curl: "text/vnd.curl",
        dcurl: "text/vnd.curl.dcurl",
        mcurl: "text/vnd.curl.mcurl",
        scurl: "text/vnd.curl.scurl",
        fly: "text/vnd.fly",
        flx: "text/vnd.fmi.flexstor",
        gv: "text/vnd.graphviz",
        "3dml": "text/vnd.in3d.3dml",
        spot: "text/vnd.in3d.spot",
        jad: "text/vnd.sun.j2me.app-descriptor",
        wml: "text/vnd.wap.wml",
        wmls: "text/vnd.wap.wmlscript",
        vtt: "text/vtt",
        s: "text/x-asm",
        asm: "text/x-asm",
        c: "text/x-c",
        cc: "text/x-c",
        cxx: "text/x-c",
        cpp: "text/x-c",
        h: "text/x-c",
        hh: "text/x-c",
        dic: "text/x-c",
        htc: "text/x-component",
        f: "text/x-fortran",
        for: "text/x-fortran",
        f77: "text/x-fortran",
        f90: "text/x-fortran",
        hbs: "text/x-handlebars-template",
        java: "text/x-java-source",
        lua: "text/x-lua",
        mkd: "text/x-markdown",
        nfo: "text/x-nfo",
        opml: "text/x-opml",
        p: "text/x-pascal",
        pas: "text/x-pascal",
        pde: "text/x-processing",
        sass: "text/x-sass",
        scss: "text/x-scss",
        etx: "text/x-setext",
        sfv: "text/x-sfv",
        ymp: "text/x-suse-ymp",
        uu: "text/x-uuencode",
        vcs: "text/x-vcalendar",
        vcf: "text/x-vcard",
        yaml: "text/yaml",
        yml: "text/yaml",
        "3gp": "video/3gpp",
        "3g2": "video/3gpp2",
        h261: "video/h261",
        h263: "video/h263",
        h264: "video/h264",
        jpgv: "video/jpeg",
        jpgm: "video/jpm",
        mj2: "video/mj2",
        mjp2: "video/mj2",
        ts: "video/mp2t",
        mp4: "video/mp4",
        mp4v: "video/mp4",
        mpg4: "video/mp4",
        mpeg: "video/mpeg",
        mpg: "video/mpeg",
        mpe: "video/mpeg",
        m1v: "video/mpeg",
        m2v: "video/mpeg",
        ogv: "video/ogg",
        qt: "video/quicktime",
        mov: "video/quicktime",
        uvh: "video/vnd.dece.hd",
        uvvh: "video/vnd.dece.hd",
        uvm: "video/vnd.dece.mobile",
        uvvm: "video/vnd.dece.mobile",
        uvp: "video/vnd.dece.pd",
        uvvp: "video/vnd.dece.pd",
        uvs: "video/vnd.dece.sd",
        uvvs: "video/vnd.dece.sd",
        uvv: "video/vnd.dece.video",
        uvvv: "video/vnd.dece.video",
        dvb: "video/vnd.dvb.file",
        fvt: "video/vnd.fvt",
        mxu: "video/vnd.mpegurl",
        m4u: "video/vnd.mpegurl",
        pyv: "video/vnd.ms-playready.media.pyv",
        uvu: "video/vnd.uvvu.mp4",
        uvvu: "video/vnd.uvvu.mp4",
        viv: "video/vnd.vivo",
        webm: "video/webm",
        f4v: "video/x-f4v",
        fli: "video/x-fli",
        flv: "video/x-flv",
        m4v: "video/x-m4v",
        mkv: "video/x-matroska",
        mk3d: "video/x-matroska",
        mks: "video/x-matroska",
        mng: "video/x-mng",
        asf: "video/x-ms-asf",
        asx: "video/x-ms-asf",
        vob: "video/x-ms-vob",
        wm: "video/x-ms-wm",
        wmv: "video/x-ms-wmv",
        wmx: "video/x-ms-wmx",
        wvx: "video/x-ms-wvx",
        avi: "video/x-msvideo",
        movie: "video/x-sgi-movie",
        smv: "video/x-smv",
        ice: "x-conference/x-cooltalk"
    };
    ! function () {
        var e = {};
        N.modal.innerHTML = '<div class="modal-dialog" role="document">\t  <div class="modal-content">\t    <div class="modal-header">\t      <h5 class="modal-title"></h5>\t      <div class="modal-buttons">\t      \t<div class="modal-code-buttons" style="display: none">' + (_c.allow_text_edit ? '<button type="button" class="btn btn-1 is-icon" data-action="save" data-tooltip="' + X.get("save") + '" data-lang="save">' + P.get_svg_icon("save_edit") + "</button>" : "") + '<button type="button" class="btn ' + 'btn-1 is-icon" data-action="copy" data-tooltip="' + X.get("copy text") + '" data-lang="copy text">' + P.get_svg_icon("clipboard") + '</button><button type="button" class="btn ' + 'btn-1 is-icon" data-action="fullscreen">' + P.get_svg_icon_multi("expand", "collapse") + '</button></div><button class="btn btn-1 is-icon" data-action="close"' + _("close") + ">" + P.get_svg_icon("close") + '</button>\t      </div>\t    </div>\t    <div class="modal-body"></div>\t  </div>\t</div>';
        var t = N.modal.children[0],
            a = t.children[0],
            n = a.children[0],
            l = n.children[0],
            s = n.children[1].children[0],
            d = (s.lastElementChild, !!_c.allow_text_edit && s.children[0]),
            x = a.children[1];
        q.modal = {};
        var y = w((function () {
            q.modal.code_mirror && q.modal.code_mirror.refresh()
        }), 500);

        function C(e) {
            N.modal.style.display = e ? "block" : "none", N.modal_bg.style.display = e ? "block" : "none", document.body.classList[e ? "add" : "remove"]("modal-open")
        }

        function H(e, t, i, a) {
            var n = {
                targets: e,
                opacity: t,
                easing: "easeOutQuint",
                duration: 250
            };
            i && (n.scale = i), a && (n.complete = a), anime(n)
        }
        P.open_modal = function (n, r) {
            var p = "",
                d = !1;
            if (Object.assign(q.modal, {
                    item: n,
                    resize_listener: !1,
                    type: n.is_dir ? "dir" : "file"
                }), !n.is_dir && n.is_readable)
                if (n.browser_image) q.modal.type = "image", n.dimensions && n.dimensions[0] > 800 && n.ratio > 1 && document.documentElement.clientWidth >= 1600 && (d = !0), p = '<img data-action="zoom" src="' + o(n) + '" class="modal-image files-img-placeholder' + ("ico" == n.ext ? " modal-image-ico" : "") + '"' + (!n.dimensions || !_c.server_exif && U.image_orientation || !U.image_orientation && T(n.image) ? "" : ' width="' + n.dimensions[0] + '" height="' + n.dimensions[1] + '" style="--ratio:' + n.ratio + '"') + "></img>";
                else if (n.is_browser_video) q.modal.type = "video", p = '<video src="' + o(n) + '" type="' + n.mime + '" class="modal-video" controls playsinline disablepictureinpicture controlslist="nodownload"' + (_c.video_autoplay ? " autoplay" : "") + "></video>";
            else if (_c.video_thumbs_enabled && "video" === n.mime0 && n.is_readable) q.modal.type = "video-thumb", p = '<img src="' + _c.script + "?file=" + encodeURIComponent(n.path) + "&resize=video&" + _c.image_cache_hash + "." + n.mtime + "." + n.filesize + '" class="modal-image files-img-placeholder" width="' + n.preview_dimensions[0] + '" height="' + n.preview_dimensions[1] + '" style="--ratio:' + n.preview_ratio + '"></img>';
            else if (W("audio", n)) q.modal.type = "audio", p = P.get_svg_large(n, "modal-svg") + '<audio src="' + o(n) + '" type="' + n.mime + '" class="modal-audio" controls playsinline controlslist="nodownload"></audio>';
            else {
                if (!n.hasOwnProperty("code_mode")) {
                    var _ = function (e) {
                        if (e && !(e.filesize > _c.code_max_load)) {
                            if (e.ext && "htaccess" === e.ext) return CodeMirror.findModeByName("nginx");
                            var t = !!e.mime && CodeMirror.findModeByMIME(e.mime);
                            return t && "null" !== t.mode || !e.ext || (t = CodeMirror.findModeByExtension(e.ext) || t), t
                        }
                    }(n);
                    n.code_mode = _ && _.mode || !1
                }
                n.code_mode && (q.modal.type = "code", n.filesize > 1e3 && (d = !0), P.load_plugin("codemirror"), p = '<div class="spinner-border modal-preview-spinner"></div>' + P.get_svg_large(n, "modal-svg"))
            }
            p || (p = P.get_svg_large(n, "modal-svg") + D(n));
            var h = ["image", "file"].includes(q.modal.type) || "dir" === q.modal.type && n.url_path ? "a" : "div",
                b = "<" + ("a" === h ? 'a href="' + o(n) + '" target="_blank" title="' + X.get("image" === q.modal.type ? "zoom" : "open in new tab") + '"' : "div") + ' class="modal-preview modal-preview-' + q.modal.type + '">' + p + "</" + h + '><div class="modal-info">' + f(!0, "modal-info-context") + '<div class="modal-info-name">' + i(n.basename) + '</div>\t\t\t<div class="modal-info-meta">' + (n.mime ? '<span class="modal-info-mime">' + P.get_svg_icon_files(n) + n.mime + "</span>" : "") + m(n.dimensions, "modal-info-dimensions") + u(n, "modal-info-filesize") + function (e, t) {
                    var i = e.is_readable && e.is_writeable;
                    return e.fileperms ? '<span class="' + t + (i ? " is-readwrite" : " not-readwrite") + '">' + P.get_svg_icon(i ? "lock_open_outline" : "lock_outline") + e.fileperms + "</span>" : ""
                }(n, "modal-info-permissions") + '</div>\t\t\t<div class="modal-info-date">' + P.get_svg_icon("date") + P.get_time(n, "llll", "LLLL", !0) + "</div>" + g(n.image, "modal-info-exif") + v(n.image, "modal-info", !0) + "</div>";
            t.classList.toggle("modal-lg", d), a.classList.add("modal-content-" + q.modal.type), l.innerText = n.basename, U.is_pointer && (l.title = n.basename), x.innerHTML = b;
            var w, k = !!n.browser_image && _class("files-img-placeholder", x)[0];
            k && k.addEventListener("load", (function () {
                this.classList.remove("files-img-placeholder")
            })), _c.history && (r && history.pushState(null, n.basename, "#" + encodeURIComponent(n.basename)), q.modal.popstate = L(window, "popstate", (function () {
                P.close_modal()
            }))), w = function () {
                if (n.code_mode) {
                    var t = q.modal.open;
                    e.file = I({
                        params: "action=file&file=" + encodeURIComponent(n.path),
                        complete: function (i) {
                            e.file = !1, P.load_plugin("codemirror", (function () {
                                if (q.modal.open === t) {
                                    c(_class("modal-preview-spinner", x));
                                    var e = _class("modal-preview-code", x)[0];
                                    e && (c(_class("modal-svg", x)), q.modal.code_mirror = CodeMirror(e, {
                                        value: i,
                                        lineWrapping: !0,
                                        lineNumbers: !0,
                                        readOnly: !_c.allow_text_edit,
                                        mode: n.code_mode,
                                        viewportMargin: 1 / 0,
                                        extraKeys: Object.assign({
                                            F11: z,
                                            Esc: z
                                        }, _c.allow_text_edit ? {
                                            "Ctrl-S": V,
                                            "Cmd-S": V
                                        } : {})
                                    }), CodeMirror.autoLoadMode(q.modal.code_mirror, n.code_mode), q.modal.resize_listener = L(window, "resize", y), s.style.display = "")
                                }
                            }))
                        }
                    })
                }
            }, q.modal.open = Math.random(), j("esc", P.close_modal, "keyup"), Z(), C(!0), H(N.modal_bg, [0, .8]), H(a, [0, 1], [.98, 1], w)
        }, P.close_modal = function (t) {
            if (q.modal.open = !1, e.file && e.file.abort(), j("esc", "keyup"), q.modal.resize_listener && q.modal.resize_listener.remove(), H(N.modal_bg, [.8, 0]), H(a, [1, 0], [1, .98], (function () {
                    N.modal.scrollTop = 0, C(), r(x), r(l), N.modal.classList.remove("modal-code-fullscreen"), a.classList.remove("modal-content-" + q.modal.type), q.modal.code_mirror = !1, "code" === q.modal.type && (s.style.display = "none")
                })), _c.history && q.modal.popstate) {
                if (q.modal.popstate.remove(), !t) return;
                history.state ? history.replaceState({
                    path: _c.current_path
                }, _c.current_dir.basename || "/", location.pathname + location.search) : history.back()
            }
        };
        var k = !1;

        function M(e, t) {
            k = !1, d.classList.remove("tooltip-loading"), R.timer(d, t, e ? "success" : "danger")
        }

        function V(e) {
            if (!k && !d.disabled) {
                if (_c.demo_mode) return ee.fire("Demo mode");
                if (!G) return te.fire();
                if (!q.modal.item.is_writeable) return ee.fire("File is not writeable");
                k = !0, d.classList.add("tooltip-loading");
                var t = _c.current_dir;
                I({
                    params: "action=fm&task=text_edit&path=" + q.modal.item.path + "&text=" + encodeURIComponent(q.modal.code_mirror.getValue()),
                    json_response: !0,
                    fail: function () {
                        M(!1, "fail"), ee.fire()
                    },
                    complete: function (e) {
                        M(e.success, e.error), e.success ? ($.fire(X.get("save", !0) + " " + q.modal.item.basename), E.remove(le(t.path, t.path.mtime)), delete t.files, delete t.html) : ee.fire(e.error)
                    }
                })
            }
        }

        function z() {
            N.modal.classList.toggle("modal-code-fullscreen"), y()
        }
        p(N.modal, (function (e, t) {
            if ("context" === e) P.create_contextmenu(t, "modal", t.target, q.modal.item);
            else if ("close" === e) P.close_modal(!0);
            else if ("zoom" === e) {
                if (q.contextmenu.is_open) return t.preventDefault();
                if (b(t, t.target.closest(".modal-preview"))) return;
                q.modal.popstate.remove(), P.open_popup(q.modal.item)
            } else if ("copy" === e) {
                var i = q.modal.code_mirror.getValue(),
                    a = i && h(i);
                R.timer(t.target, !1, a ? "success" : "danger")
            } else "fullscreen" === e ? z() : "save" === e && V()
        }))
    }();
    var re = function (e, t) {
            var i, a, n, o, l, s, r, c, p, m, u, f, v, g, _, h, x, b = this,
                y = !1,
                w = !0,
                L = {
                    timeToIdle: 3e3,
                    timeToIdleOutside: 1e3,
                    loadingIndicatorDelay: 1e3,
                    addCaptionHTMLFn: function (e, i) {
                        return e.title ? i.firstElementChild.innerHTML = e.title : t.resetEl(i.firstElementChild)
                    },
                    closeEl: !0,
                    captionEl: !0,
                    fullscreenEl: U.fullscreen,
                    zoomEl: !0,
                    downloadEl: !1,
                    mapEl: !0,
                    playEl: !0,
                    counterEl: !0,
                    arrowEl: !0,
                    preloaderEl: !0,
                    closeOnOutsideClick: !0,
                    tapToClose: !1,
                    clickToCloseNonZoomable: !1,
                    clickToShowNextNonZoomable: !1,
                    indexIndicatorSep: " / ",
                    fitControlsWidth: 1200
                },
                C = function (e) {
                    if (_) return !0;
                    e = e || window.event, g.timeToIdle && g.mouseUsed && !c && z();
                    for (var t, i, a = e.target || e.srcElement, n = 0; n < E.length; n++)(t = E[n]).onTap && a.classList.contains("pswp__" + t.name) && (t.onTap(), i = !0);
                    i && (e.stopPropagation(), _ = !0, setTimeout((function () {
                        _ = !1
                    }), 30))
                },
                H = function (e) {
                    32 === e.keyCode && (U.is_dual_input && b.toggleControls(!1), b.setIdle(!c))
                },
                k = function (e, t, i) {
                    e.classList[i ? "add" : "remove"]("pswp__" + t)
                },
                M = function () {
                    var e = 1 === g.getNumItemsFn();
                    e !== v && (k(i, "ui--one-slide", e), v = e)
                },
                V = 0,
                z = function () {
                    clearTimeout(x), V = 0, c && b.setIdle(!1)
                },
                A = function (e) {
                    var t = (e = e || window.event).relatedTarget || e.toElement;
                    t && "HTML" !== t.nodeName || (clearTimeout(x), x = setTimeout((function () {
                        b.setIdle(!0)
                    }), g.timeToIdleOutside))
                },
                j = function (e) {
                    u !== e && (t.toggle_class(m, "svg-preloader-active", !e), u = e)
                },
                E = [{
                    name: "caption",
                    option: "captionEl",
                    onInit: function (e) {
                        a = e
                    }
                }, {
                    name: "button--download",
                    option: "downloadEl",
                    onInit: function (e) {
                        s = e
                    },
                    onTap: function () {}
                }, {
                    name: "button--map",
                    option: "mapEl",
                    onInit: function (e) {
                        r = e
                    },
                    onTap: function () {}
                }, {
                    name: "button--zoom",
                    option: "zoomEl",
                    onTap: e.toggleDesktopZoom
                }, {
                    name: "counter",
                    option: "counterEl",
                    onInit: function (e) {
                        n = e
                    }
                }, {
                    name: "button--close",
                    option: "closeEl",
                    onTap: e.close
                }, {
                    name: "button--arrow--left",
                    option: "arrowEl",
                    onInit: function (e) {
                        o = e
                    },
                    onTap: function () {
                        e.prev()
                    }
                }, {
                    name: "button--arrow--right",
                    option: "arrowEl",
                    onInit: function (e) {
                        l = e
                    },
                    onTap: function () {
                        e.next()
                    }
                }, {
                    name: "button--fs",
                    option: "fullscreenEl",
                    onInit: function (e) {
                        e
                    },
                    onTap: function () {
                        screenfull.toggle()
                    }
                }, {
                    name: "preloader",
                    option: "preloaderEl",
                    onInit: function (e) {
                        m = e
                    }
                }, {
                    name: "button--play",
                    option: "playEl",
                    onTap: function () {
                        q.popup.toggle_play(!q.popup.playing)
                    }
                }];
            b.init = function () {
                var n, o, l, c;
                t.copy_unique(e.options, L), g = e.options, i = q.popup.ui, (p = e.listen)("onVerticalDrag", (function (e) {
                    w && e < .95 ? b.toggleControls() : !w && e >= .95 && b.toggleControls(!0)
                })), p("onPinchClose", (function (e) {
                    w && e < .9 ? (b.toggleControls(), n = !0) : n && !w && e > .9 && b.toggleControls(!0)
                })), p("zoomGestureEnded", (function () {
                    (n = !1) && !w && b.toggleControls(!0)
                })), p("beforeChange", b.update), g.downloadEl && p("afterChange", (function () {
                    var t = e.currItem.original || e.currItem.src;
                    s.setAttribute("href", t || "#"), s.style.display = t ? "" : "none"
                })), g.mapEl && p("afterChange", (function () {
                    var t = e.currItem.item,
                        i = !!(t && t.image && t.image.exif) && t.image.exif.gps;
                    r.style.display = i ? "" : "none", r.setAttribute("href", i ? d(i) : "#")
                })), p("doubleTap", (function (t) {
                    var i = e.currItem.initialZoomLevel;
                    e.zoomTo(e.getZoomLevel() === i ? g.getDoubleTapZoom(!1, e.currItem) : i, t, 250)
                })), p("preventDragEvent", (function (e, t, i) {
                    var a = e.target || e.srcElement;
                    a && a.getAttribute("class") && e.type.indexOf("mouse") > -1 && (a.getAttribute("class").indexOf("__caption") > 0 || /(SMALL|STRONG|EM)/i.test(a.tagName)) && (i.prevent = !1, undefined())
                })), p("bindEvents", (function () {
                    t.bind(i, "pswpTap click", C), t.bind(q.popup.scrollwrap, "pswpTap", b.onGlobalTap), t.bind(document, "keydown", H)
                })), p("unbindEvents", (function () {
                    h && clearInterval(h), t.unbind(document, "mouseout", A), t.unbind(document, "mousemove", z), t.unbind(i, "pswpTap click", C), t.unbind(q.popup.scrollwrap, "pswpTap", b.onGlobalTap), t.unbind(document, "keydown", H)
                })), p("destroy", (function () {
                    g.captionEl && a.classList.remove("pswp__caption--empty"), i.classList.add("pswp__ui--hidden"), x && clearTimeout(x), b.setIdle(!1)
                })), g.showAnimationDuration || i.classList.remove("pswp__ui--hidden"), p("initialZoomIn", (function () {
                    g.showAnimationDuration && i.classList.remove("pswp__ui--hidden")
                })), p("initialZoomOut", (function () {
                    i.classList.add("pswp__ui--hidden")
                })), (c = function (e) {
                    if (e)
                        for (var t = e.length, i = 0; i < t; i++) {
                            o = e[i];
                            for (var a = 0; a < E.length; a++) l = E[a], o.classList.contains("pswp__" + l.name) && (g[l.option] ? (o.classList.remove("pswp__element--disabled"), l.onInit && l.onInit(o)) : o.classList.add("pswp__element--disabled"))
                        }
                })(i.children), c(q.popup.topbar.children), M(), g.timeToIdle && p("mouseUsed", (function () {
                    t.bind(document, "mousemove", z), t.bind(document, "mouseout", A), h = setInterval((function () {
                        2 == ++V && b.setIdle(!0)
                    }), g.timeToIdle / 2)
                })), g.preloaderEl && (j(!0), p("beforeChange", (function () {
                    clearTimeout(f), f = setTimeout((function () {
                        e.currItem && e.currItem.loading ? e.currItem.img && !e.currItem.img.naturalWidth && j(!1) : j(!0)
                    }), g.loadingIndicatorDelay)
                })), p("imageLoadComplete", (function (t, i) {
                    e.currItem === i && j(!0)
                })))
            }, b.setIdle = function (e) {
                c = e, k(i, "ui--idle", e)
            }, b.update = function () {
                if (w && e.currItem) {
                    if (b.updateIndexIndicator(), g.captionEl) {
                        var t = g.addCaptionHTMLFn(e.currItem, a);
                        k(a, "caption--empty", !t)
                    }
                    y = !0
                } else y = !1;
                M()
            }, b.updateIndexIndicator = function () {
                g.counterEl && (n.innerHTML = e.getCurrentIndex() + 1 + g.indexIndicatorSep + g.getNumItemsFn()), !g.loop && g.arrowEl && g.getNumItemsFn() > 1 && (t.toggle_class(o, "pswp__element--disabled", 0 === e.getCurrentIndex()), t.toggle_class(l, "pswp__element--disabled", e.getCurrentIndex() === g.getNumItemsFn() - 1))
            }, b.onGlobalTap = function (t) {
                var i = (t = t || window.event).target || t.srcElement;
                if (!_)
                    if (t.detail && "mouse" === t.detail.pointerType) {
                        if (!t.detail.rightClick)
                            if (("zoom" == g.click || g.getNumItemsFn() < 2 || e.getZoomLevel() > e.currItem.fitRatio) && i.classList.contains("pswp__img")) e.currItem.fitRatio < 1 && e.toggleDesktopZoom(t.detail.releasePoint);
                            else if (0 === i.className.indexOf("pswp__")) {
                            var a = (g.getNumItemsFn() > 2 || !e.getCurrentIndex()) && ("next" == g.click || t.detail.releasePoint.x > q.popup.pswp.clientWidth / 2) ? "next" : "prev";
                            e[a]()
                        }
                    } else U.is_dual_input ? U.legacy_ie || b.setIdle(!c) : b.toggleControls(!w)
            }, b.toggleControls = function (e) {
                w = e, e && !y && b.update(), k(i, "ui--hidden", !e)
            }
        },
        ce = {
            bind: function (e, t, i, a) {
                var n = (a ? "remove" : "add") + "EventListener";
                t = t.split(" ");
                for (var o = 0; o < t.length; o++) t[o] && e[n](t[o], i, !1)
            },
            createEl: function (e, t) {
                var i = document.createElement(t || "div");
                return e && (i.className = e), i
            },
            resetEl: function (e) {
                for (; e.firstChild;) e.removeChild(e.firstChild)
            },
            getScrollY: function () {
                return window.pageYOffset
            },
            unbind: function (e, t, i) {
                ce.bind(e, t, i, !0)
            },
            toggle_class: function (e, t, i) {
                e.classList[i ? "add" : "remove"](t)
            },
            arraySearch: function (e, t, i) {
                for (var a = e.length; a--;)
                    if (e[a][i] === t) return a;
                return -1
            },
            copy_unique: function (e, t) {
                Object.keys(t).forEach((function (i) {
                    e.hasOwnProperty(i) || (e[i] = t[i])
                }))
            },
            easing: {
                sine: {
                    out: function (e) {
                        return Math.sin(e * (Math.PI / 2))
                    },
                    inOut: function (e) {
                        return -(Math.cos(Math.PI * e) - 1) / 2
                    }
                },
                cubic: {
                    out: function (e) {
                        return --e * e * e + 1
                    }
                }
            },
            features: {
                touch: U.is_touch,
                raf: window.requestAnimationFrame,
                caf: window.cancelAnimationFrame,
                pointerEvent: !!window.PointerEvent || navigator.msPointerEnabled,
                is_mouse: U.only_pointer
            }
        },
        pe = function (e, t, i, a) {
            var n = this,
                o = {
                    allowPanToNext: !0,
                    spacing: .12,
                    bgOpacity: 1,
                    mouseUsed: U.only_pointer,
                    loop: !0,
                    pinchToClose: !0,
                    closeOnScroll: !0,
                    closeOnVerticalDrag: !0,
                    verticalDragRange: .75,
                    hideAnimationDuration: 333,
                    showAnimationDuration: 333,
                    showHideOpacity: !1,
                    focus: !0,
                    escKey: !0,
                    arrowKeys: !0,
                    mainScrollEndFriction: .35,
                    panEndFriction: .35,
                    transition: "glide",
                    play_transition: "glide",
                    isClickableElement: function (e) {
                        return "A" === e.tagName
                    },
                    getDoubleTapZoom: function (e, t) {
                        return e || t.initialZoomLevel < .7 ? 1 : 1.33
                    },
                    maxSpreadZoom: 1
                };
            Object.assign(o, a);
            var l, s, r, c, p, d, m, u, f, v, g, _, h, x, b, y, w, L, C, H, k, M, V, z, A, j, E, I, T, S, O, Z, R, D, P, F, N, W, B, X, Y, G, K, Q, J, $, ee, te, ie, ae, ne, oe = {
                    x: 0,
                    y: 0
                },
                le = {
                    x: 0,
                    y: 0
                },
                se = {
                    x: 0,
                    y: 0
                },
                re = {},
                pe = 0,
                de = {},
                me = {
                    x: 0,
                    y: 0
                },
                ue = 0,
                fe = [],
                ve = !1,
                ge = function (e, t) {
                    Object.assign(n, t.publicMethods), fe.push(e)
                },
                _e = function (e) {
                    var t = Zt();
                    return e > t - 1 ? e - t : e < 0 ? t + e : e
                },
                he = {},
                xe = function (e, t) {
                    return he[e] || (he[e] = []), he[e].push(t)
                },
                be = function (e) {
                    var t = he[e];
                    if (t) {
                        var i = Array.prototype.slice.call(arguments);
                        i.shift();
                        for (var a = 0; a < t.length; a++) t[a].apply(n, i)
                    }
                },
                ye = function () {
                    return (new Date).getTime()
                },
                we = function (e) {
                    ie = e, q.popup.bg.style.opacity = e * o.bgOpacity
                },
                Le = function (e, t, i, a, o) {
                    (!ve || o && o !== n.currItem) && (a /= o ? o.fitRatio : n.currItem.fitRatio), e.transform = _ + t + "px, " + i + "px, 0px) scale(" + a + ")"
                },
                Ce = function (e) {
                    Q && !n.currItem.loadError && (e && (v > n.currItem.fitRatio ? ve || (Bt(n.currItem, !1, !0), ve = !0) : ve && (Bt(n.currItem), ve = !1)), Le(Q, se.x, se.y, v))
                },
                He = function (e) {
                    e.container && Le(e.container.style, e.initialPosition.x, e.initialPosition.y, e.initialZoomLevel, e)
                },
                ke = function (e, t) {
                    t.transform = _ + e + "px, 0px, 0px)"
                },
                Me = function (e, t) {
                    if (!o.loop && t) {
                        var i = c + (me.x * pe - e) / me.x,
                            a = Math.round(e - lt.x);
                        (i < 0 && a > 0 || i >= Zt() - 1 && a < 0) && (e = lt.x + a * o.mainScrollEndFriction)
                    }
                    lt.x = e, ke(e, p)
                },
                Ve = function (e, t) {
                    var i = st[e] - de[e];
                    return le[e] + oe[e] + i - i * (t / g)
                },
                ze = function (e, t) {
                    e.x = t.x, e.y = t.y, t.id && (e.id = t.id)
                },
                Ae = function (e) {
                    e.x = Math.round(e.x), e.y = Math.round(e.y)
                },
                je = function () {
                    E.is_mouse || (e.classList.add("pswp--has_mouse"), z += " pswp--has_mouse", E.is_mouse = o.mouseUsed = !0), be("mouseUsed")
                },
                Ee = null,
                Ie = function () {
                    Ee && (ce.unbind(document, "mousemove", Ie), je()), Ee = setTimeout((function () {
                        Ee = null
                    }), 100)
                },
                Te = function (e, t) {
                    var i = qt(n.currItem, re, e);
                    return t && (K = i), i
                },
                Se = function (e) {
                    return (e || n.currItem).initialZoomLevel
                },
                Oe = function (e) {
                    return (e || n.currItem).w > 0 ? o.maxSpreadZoom : 1
                },
                Ze = function (e, t, i, a) {
                    return a === n.currItem.initialZoomLevel ? (i[e] = n.currItem.initialPosition[e], !0) : (i[e] = Ve(e, a), i[e] > t.min[e] ? (i[e] = t.min[e], !0) : i[e] < t.max[e] && (i[e] = t.max[e], !0))
                },
                Re = function (e) {
                    var t = "";
                    if (o.escKey && 27 === e.keyCode ? t = "close" : o.arrowKeys && (37 === e.keyCode ? t = "prev" : 39 === e.keyCode && (t = "next")), !t || e.ctrlKey || e.altKey || e.shiftKey || e.metaKey) return !1;
                    e.preventDefault(), n[t]()
                },
                De = function (e) {
                    e && (N || F || J || R) && (e.preventDefault(), e.stopPropagation())
                },
                Pe = function () {
                    n.setScrollOffset(0, ce.getScrollY())
                },
                Fe = {},
                qe = 0,
                Ne = function (e) {
                    Fe[e] && (Fe[e].raf && V(Fe[e].raf), qe--, delete Fe[e])
                },
                Ue = function (e) {
                    Fe[e] && Ne(e), Fe[e] || (qe++, Fe[e] = {})
                },
                We = function () {
                    for (var e in Fe) Fe.hasOwnProperty(e) && Ne(e)
                },
                Be = function (e, t, i, a, n, o, l) {
                    var s, r = ye();
                    Ue(e);
                    var c = function () {
                        if (Fe[e]) {
                            if ((s = ye() - r) >= a) return Ne(e), o(i), void(l && l());
                            o((i - t) * n(s / a) + t), Fe[e].raf = M(c)
                        }
                    };
                    c()
                },
                Xe = {
                    shout: be,
                    listen: xe,
                    viewportSize: re,
                    options: o,
                    isMainScrollAnimating: function () {
                        return J
                    },
                    getZoomLevel: function () {
                        return v
                    },
                    getCurrentIndex: function () {
                        return c
                    },
                    isDragging: function () {
                        return D
                    },
                    isZooming: function () {
                        return Y
                    },
                    setScrollOffset: function (e, t) {
                        de.x = e, j = de.y = t
                    },
                    applyZoomPan: function (e, t, i, a) {
                        se.x = t, se.y = i, v = e, Ce(a)
                    },
                    init: function () {
                        if (!l && !s) {
                            var i;
                            for (n.framework = ce, n.template = e, z = e.className, l = !0, E = ce.features, M = E.raf, V = E.caf, p = q.popup.container.style, n.itemHolders = x = [{
                                    el: q.popup.items[0],
                                    wrap: 0,
                                    index: -1
                                }, {
                                    el: q.popup.items[1],
                                    wrap: 0,
                                    index: -1
                                }, {
                                    el: q.popup.items[2],
                                    wrap: 0,
                                    index: -1
                                }], x[0].el.style.display = x[2].el.style.display = "none", _ = "translate" + (k ? "(" : "3d("), f = {
                                    resize: n.updateSize,
                                    orientationchange: function () {
                                        clearTimeout(I), I = setTimeout((function () {
                                            re.x !== q.popup.scrollwrap.clientWidth && n.updateSize()
                                        }), 500)
                                    },
                                    scroll: Pe,
                                    keydown: Re,
                                    click: De
                                }, i = 0; i < fe.length; i++) n["init" + fe[i]]();
                            if (t)(n.ui = new t(n, ce)).init();
                            be("firstUpdate"), c = c || o.index || 0, (isNaN(c) || c < 0 || c >= Zt()) && (c = 0), n.currItem = Ot(c), e.setAttribute("aria-hidden", "false"), void 0 === j && (be("initialLayout"), j = A = ce.getScrollY());
                            var a = "pswp--open" + (o.showHideOpacity ? " pswp--animate_opacity" : "") + (U.is_pointer && ("zoom" == o.click || o.getNumItemsFn() < 2) ? " pswp--zoom-cursor" : "");
                            for (DOMTokenList.prototype.add.apply(e.classList, a.split(" ")), n.updateSize(), d = -1, ue = null, i = 0; i < 3; i++) ke((i + d) * me.x, x[i].el.style);
                            ce.bind(q.popup.scrollwrap, u, n), xe("initialZoomInEnd", (function () {
                                n.setContent(x[0], c - 1), n.setContent(x[2], c + 1), x[0].el.style.display = x[2].el.style.display = "block", o.focus && e.focus(), ce.bind(document, "keydown", n), ce.bind(q.popup.scrollwrap, "click", n), E.is_mouse ? je() : U.is_pointer && ce.bind(document, "mousemove", Ie), ce.bind(window, "resize scroll orientationchange", n), be("bindEvents")
                            })), n.setContent(x[1], c), n.updateCurrItem(), e.classList.add("pswp--visible")
                        }
                    },
                    close: function () {
                        l && (l = !1, s = !0, be("close"), setTimeout((function () {
                            ce.unbind(window, "resize scroll orientationchange", n)
                        }), 400), ce.unbind(window, "scroll", f.scroll), ce.unbind(document, "keydown", n), U.is_pointer && ce.unbind(document, "mousemove", Ie), ce.unbind(q.popup.scrollwrap, "click", n), D && ce.unbind(window, m, n), clearTimeout(I), be("unbindEvents"), Rt(n.currItem, null, !0, n.destroy))
                    },
                    destroy: function () {
                        be("destroy"), Et && clearTimeout(Et), e.setAttribute("aria-hidden", "true"), e.className = z, ce.unbind(q.popup.scrollwrap, u, n), ce.unbind(window, "scroll", n), pt(), We(), he = {}
                    },
                    panTo: function (e, t, i) {
                        i || (e > K.min.x ? e = K.min.x : e < K.max.x && (e = K.max.x), t > K.min.y ? t = K.min.y : t < K.max.y && (t = K.max.y)), e == se.x && t == se.y || (se.x = e, se.y = t, Ce())
                    },
                    handleEvent: function (e) {
                        e = e || window.event, f[e.type] && f[e.type](e)
                    },
                    goTo: function (e, t, i) {
                        var a = i ? o.play_transition : o.transition;
                        if ("slide" === a) zt("swipe", 80 * e, {
                            lastFlickDist: {
                                x: 80,
                                y: 0
                            },
                            lastFlickOffset: {
                                x: 80 * e,
                                y: 0
                            },
                            lastFlickSpeed: {
                                x: 2 * e,
                                y: 0
                            }
                        });
                        else {
                            var l = (e = _e(e)) - c;
                            ue = l, c = e, n.currItem = Ot(c), pe -= l, Me(me.x * pe), We(), J = !1, q.popup.image_anim && !q.popup.image_anim.paused && q.popup.image_anim.pause();
                            var s = !!q.popup.transitions.hasOwnProperty(a) && q.popup.transitions[a](t);
                            if (q.popup.caption_transition_delay = s && s.duration || 0, n.updateCurrItem(), !s) return;
                            var r = !!n.currItem.container && n.currItem.container.lastElementChild;
                            r && (q.popup.image_timer ? clearTimeout(q.popup.image_timer) : q.popup.image_anim = anime(Object.assign({
                                targets: r
                            }, s)), q.popup.image_timer = setTimeout((function () {
                                q.popup.image_timer = !1
                            }), 300))
                        }
                    },
                    next: function (e) {
                        if (o.loop || c !== Zt() - 1) {
                            var t = e ? o.play_transition : o.transition;
                            n.goTo("slide" === t ? -1 : parseInt(c) + 1, 1, e)
                        }
                    },
                    prev: function () {
                        (o.loop || 0 !== c) && n.goTo("slide" === o.transition ? 1 : parseInt(c) - 1, -1)
                    },
                    updateCurrZoomItem: function (e) {
                        e && be("beforeChange", 0);
                        var t = x[1].el.children;
                        Q = t.length && t[0].classList.contains("pswp__zoom-wrap") ? t[0].style : null, K = n.currItem.bounds, g = v = n.currItem.initialZoomLevel, se.x = K.center.x, se.y = K.center.y, e && be("afterChange")
                    },
                    invalidateCurrItems: function () {
                        h = !0;
                        for (var e = 0; e < 3; e++) x[e].item && (x[e].item.needsUpdate = !0)
                    },
                    updateCurrItem: function (e) {
                        if (0 !== ue) {
                            var t, i = Math.abs(ue);
                            if (!(e && i < 2)) {
                                n.currItem = Ot(c), ve = !1, be("beforeChange", ue), i >= 3 && (d += ue + (ue > 0 ? -3 : 3), i = 3);
                                for (var a = 0; a < i; a++) ue > 0 ? (t = x.shift(), x[2] = t, d++, ke((d + 2) * me.x, t.el.style), n.setContent(t, c - i + a + 1 + 1)) : (t = x.pop(), x.unshift(t), d--, ke(d * me.x, t.el.style), n.setContent(t, c + i - a - 1 - 1));
                                if (Q && 1 === Math.abs(ue)) {
                                    var o = Ot(b);
                                    o.initialZoomLevel !== v && (qt(o, re), Bt(o), He(o))
                                }
                                ue = 0, n.updateCurrZoomItem(), b = c, be("afterChange")
                            }
                        }
                    },
                    updateSize: function (e) {
                        if (re.x = q.popup.scrollwrap.clientWidth, re.y = q.popup.scrollwrap.clientHeight, Pe(), me.x = re.x + Math.round(re.x * o.spacing), me.y = re.y, Me(me.x * pe), be("beforeResize"), void 0 !== d) {
                            for (var t, i, a, l = 0; l < 3; l++) t = x[l], ke((l + d) * me.x, t.el.style), a = c + l - 1, o.loop && Zt() > 2 && (a = _e(a)), (i = Ot(a)) && (h || i.needsUpdate || !i.bounds) ? (n.cleanSlide(i), n.setContent(t, a), 1 === l && (n.currItem = i, n.updateCurrZoomItem(!0)), i.needsUpdate = !1) : -1 === t.index && a >= 0 && n.setContent(t, a), i && i.container && (qt(i, re), Bt(i), He(i));
                            h = !1
                        }
                        g = v = n.currItem.initialZoomLevel, (K = n.currItem.bounds) && (se.x = K.center.x, se.y = K.center.y, Ce(!0)), be("resize")
                    },
                    zoomTo: function (e, t, i, a, n) {
                        t && (g = v, st.x = Math.abs(t.x) - se.x, st.y = Math.abs(t.y) - se.y, ze(le, se));
                        var o = Te(e, !1),
                            l = {};
                        Ze("x", o, l, e), Ze("y", o, l, e);
                        var s = v,
                            r = se.x,
                            c = se.y;
                        Ae(l);
                        var p = function (t) {
                            1 === t ? (v = e, se.x = l.x, se.y = l.y) : (v = (e - s) * t + s, se.x = (l.x - r) * t + r, se.y = (l.y - c) * t + c), n && n(t), Ce(1 === t)
                        };
                        i ? Be("customZoomTo", 0, 1, i, a || ce.easing.sine.inOut, p) : p(1)
                    }
                },
                Ye = {},
                Ge = {},
                Ke = {},
                Qe = {},
                Je = {},
                $e = [],
                et = {},
                tt = [],
                it = {},
                at = 0,
                nt = {
                    x: 0,
                    y: 0
                },
                ot = 0,
                lt = {
                    x: 0,
                    y: 0
                },
                st = {
                    x: 0,
                    y: 0
                },
                rt = {
                    x: 0,
                    y: 0
                },
                ct = function (e, t) {
                    return it.x = Math.abs(e.x - t.x), it.y = Math.abs(e.y - t.y), Math.sqrt(it.x * it.x + it.y * it.y)
                },
                pt = function () {
                    W && (V(W), W = null)
                },
                dt = function () {
                    D && (W = M(dt), Ht())
                },
                mt = function (e, t) {
                    return !(!e || e === document || e === q.popup.scrollwrap) && (t(e) ? e : mt(e.parentNode, t))
                },
                ut = {},
                ft = function (e, t) {
                    return ut.prevent = !mt(e.target, o.isClickableElement), be("preventDragEvent", e, t, ut), ut.prevent
                },
                vt = function (e, t) {
                    return t.x = e.pageX, t.y = e.pageY, t.id = e.identifier, t
                },
                gt = function (e, t, i) {
                    i.x = .5 * (e.x + t.x), i.y = .5 * (e.y + t.y)
                },
                _t = function () {
                    var e = se.y - n.currItem.initialPosition.y;
                    return 1 - Math.abs(e / (re.y / 2))
                },
                ht = {},
                xt = {},
                bt = [],
                yt = function (e) {
                    for (; bt.length > 0;) bt.pop();
                    return H ? (ne = 0, $e.forEach((function (e) {
                        0 === ne ? bt[0] = e : 1 === ne && (bt[1] = e), ne++
                    }))) : e.type.indexOf("touch") > -1 ? e.touches && e.touches.length > 0 && (bt[0] = vt(e.touches[0], ht), e.touches.length > 1 && (bt[1] = vt(e.touches[1], xt))) : (ht.x = e.pageX, ht.y = e.pageY, ht.id = "", bt[0] = ht), bt
                },
                wt = function (e, t) {
                    var i, a, l, s, r = se[e] + t[e],
                        c = t[e] > 0,
                        p = lt.x + t.x,
                        d = lt.x - et.x;
                    if (i = r > K.min[e] || r < K.max[e] ? o.panEndFriction : 1, r = se[e] + t[e] * i, (o.allowPanToNext || v === n.currItem.initialZoomLevel) && (Q ? "h" !== $ || "x" !== e || F || (c ? (r > K.min[e] && (i = o.panEndFriction, K.min[e] - r, a = K.min[e] - le[e]), (a <= 0 || d < 0) && Zt() > 1 ? (s = p, d < 0 && p > et.x && (s = et.x)) : K.min.x !== K.max.x && (l = r)) : (r < K.max[e] && (i = o.panEndFriction, r - K.max[e], a = le[e] - K.max[e]), (a <= 0 || d > 0) && Zt() > 1 ? (s = p, d > 0 && p < et.x && (s = et.x)) : K.min.x !== K.max.x && (l = r))) : s = p, "x" === e)) return void 0 !== s && (Me(s, !0), B = s !== et.x), K.min.x !== K.max.x && (void 0 !== l ? se.x = l : B || (se.x += t.x * i)), void 0 !== s;
                    !J && !B && v > n.currItem.fitRatio && (se[e] += t[e] * i)
                },
                Lt = function (e) {
                    if ("pointerdown" !== e.type || !(e.which > 1 || e.ctrlKey))
                        if (St) e.preventDefault();
                        else {
                            if (ft(e, !0) && e.preventDefault(), be("pointerDown"), H) {
                                var t = ce.arraySearch($e, e.pointerId, "id");
                                t < 0 && (t = $e.length), $e[t] = {
                                    x: e.pageX,
                                    y: e.pageY,
                                    id: e.pointerId
                                }
                            }
                            var i = yt(e),
                                a = i.length;
                            X = null, We(), D && 1 !== a || (D = ee = !0, ce.bind(window, m, n), Z = ae = te = R = B = N = P = F = !1, $ = null, be("firstTouchStart", i), ze(le, se), oe.x = oe.y = 0, ze(Qe, i[0]), ze(Je, Qe), et.x = me.x * pe, tt = [{
                                x: Qe.x,
                                y: Qe.y
                            }], S = T = ye(), Te(v, !0), pt(), dt()), !Y && a > 1 && !J && !B && (g = v, F = !1, Y = P = !0, oe.y = oe.x = 0, ze(le, se), ze(Ye, i[0]), ze(Ge, i[1]), gt(Ye, Ge, rt), st.x = Math.abs(rt.x) - se.x, st.y = Math.abs(rt.y) - se.y, G = ct(Ye, Ge))
                        }
                },
                Ct = function (e) {
                    if (e.preventDefault(), H) {
                        var t = ce.arraySearch($e, e.pointerId, "id");
                        if (t > -1) {
                            var i = $e[t];
                            i.x = e.pageX, i.y = e.pageY
                        }
                    }
                    if (D) {
                        var a = yt(e);
                        if ($ || N || Y) X = a;
                        else if (lt.x !== me.x * pe) $ = "h";
                        else {
                            var n = Math.abs(a[0].x - Qe.x) - Math.abs(a[0].y - Qe.y);
                            Math.abs(n) >= 10 && ($ = n > 0 ? "h" : "v", X = a)
                        }
                    }
                },
                Ht = function () {
                    if (X) {
                        var e = X.length;
                        if (0 !== e)
                            if (ze(Ye, X[0]), Ke.x = Ye.x - Qe.x, Ke.y = Ye.y - Qe.y, Y && e > 1) {
                                if (Qe.x = Ye.x, Qe.y = Ye.y, !Ke.x && !Ke.y && function (e, t) {
                                        return e.x === t.x && e.y === t.y
                                    }(X[1], Ge)) return;
                                ze(Ge, X[1]), F || (F = !0);
                                var t = ct(Ye, Ge),
                                    i = At(t);
                                i > n.currItem.initialZoomLevel + n.currItem.initialZoomLevel / 15 && (ae = !0);
                                var a = 1,
                                    l = Se(),
                                    s = Oe();
                                if (i < l)
                                    if (o.pinchToClose && !ae && g <= n.currItem.initialZoomLevel) {
                                        var r = 1 - (l - i) / (l / 1.2);
                                        we(r), be("onPinchClose", r), te = !0
                                    } else(a = (l - i) / l) > 1 && (a = 1), i = l - a * (l / 3);
                                else i > s && ((a = (i - s) / (6 * l)) > 1 && (a = 1), i = s + a * l);
                                a < 0 && (a = 0), t, gt(Ye, Ge, nt), oe.x += nt.x - rt.x, oe.y += nt.y - rt.y, ze(rt, nt), se.x = Ve("x", i), se.y = Ve("y", i), Z = i > v, v = i, Ce()
                            } else {
                                if (!$) return;
                                if (ee && (ee = !1, Math.abs(Ke.x) >= 10 && (Ke.x -= X[0].x - Je.x), Math.abs(Ke.y) >= 10 && (Ke.y -= X[0].y - Je.y)), Qe.x = Ye.x, Qe.y = Ye.y, 0 === Ke.x && 0 === Ke.y) return;
                                if ("v" === $ && o.closeOnVerticalDrag && v === n.currItem.initialZoomLevel) {
                                    oe.y += Ke.y, se.y += Ke.y;
                                    var c = _t();
                                    return R = !0, be("onVerticalDrag", c), we(c), void Ce()
                                }! function (e, t, i) {
                                    if (e - S > 50) {
                                        var a = tt.length > 2 ? tt.shift() : {};
                                        a.x = t, a.y = i, tt.push(a), S = e
                                    }
                                }(ye(), Ye.x, Ye.y), N = !0, K = n.currItem.bounds, wt("x", Ke) || (wt("y", Ke), Ae(se), Ce())
                            }
                    }
                },
                kt = function (e) {
                    var t;
                    if (be("pointerUp"), ft(e, !1) && e.preventDefault(), H) {
                        var i = ce.arraySearch($e, e.pointerId, "id");
                        if (i > -1)
                            if (t = $e.splice(i, 1)[0], navigator.msPointerEnabled) {
                                t.type = {
                                    4: "mouse",
                                    2: "touch",
                                    3: "pen"
                                } [e.pointerType], t.type || (t.type = e.pointerType || "mouse")
                            } else t.type = e.pointerType || "mouse"
                    }
                    var a, l = yt(e),
                        s = l.length;
                    if ("mouseup" === e.type && (s = 0), 2 === s) return X = null, !0;
                    1 === s && ze(Je, l[0]), 0 !== s || $ || J || (t || ("mouseup" === e.type ? t = {
                        x: e.pageX,
                        y: e.pageY,
                        type: "mouse"
                    } : e.changedTouches && e.changedTouches[0] && (t = {
                        x: e.changedTouches[0].pageX,
                        y: e.changedTouches[0].pageY,
                        type: "touch"
                    })), be("touchRelease", e, t));
                    var r = -1;
                    if (0 === s && (D = !1, ce.unbind(window, m, n), pt(), Y ? r = 0 : -1 !== ot && (r = ye() - ot)), ot = 1 === s ? ye() : -1, a = -1 !== r && r < 150 ? "zoom" : "swipe", Y && s < 2 && (Y = !1, 1 === s && (a = "zoomPointerUp"), be("zoomGestureEnded")), X = null, N || F || J || R)
                        if (We(), O || (O = Mt()), O.calculateSwipeSpeed("x"), R) {
                            if (_t() < o.verticalDragRange) n.close();
                            else {
                                var c = se.y,
                                    p = ie;
                                Be("verticalDrag", 0, 1, 300, ce.easing.cubic.out, (function (e) {
                                    se.y = (n.currItem.initialPosition.y - c) * e + c, we((1 - p) * e + p), Ce()
                                })), be("onVerticalDrag", 1)
                            }
                        } else {
                            if ((B || J) && 0 === s) {
                                var d = Qe.x - Je.x;
                                if (zt(a, d, O)) return;
                                a = "zoomPointerUp"
                            }
                            J || ("swipe" === a ? !B && v > n.currItem.fitRatio && Vt(O) : jt())
                        }
                },
                Mt = function () {
                    var e, t, i = {
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
                        calculateSwipeSpeed: function (a) {
                            tt.length > 1 ? (e = ye() - S + 50, t = tt[tt.length - 2][a]) : (e = ye() - T, t = Je[a]), i.lastFlickOffset[a] = Qe[a] - t, i.lastFlickDist[a] = Math.abs(i.lastFlickOffset[a]), i.lastFlickDist[a] > 20 ? i.lastFlickSpeed[a] = i.lastFlickOffset[a] / e : i.lastFlickSpeed[a] = 0, Math.abs(i.lastFlickSpeed[a]) < .1 && (i.lastFlickSpeed[a] = 0), i.slowDownRatio[a] = .95, i.slowDownRatioReverse[a] = 1 - i.slowDownRatio[a], i.speedDecelerationRatio[a] = 1
                        },
                        calculateOverBoundsAnimOffset: function (e, t) {
                            i.backAnimStarted[e] || (se[e] > K.min[e] ? i.backAnimDestination[e] = K.min[e] : se[e] < K.max[e] && (i.backAnimDestination[e] = K.max[e]), void 0 !== i.backAnimDestination[e] && (i.slowDownRatio[e] = .7, i.slowDownRatioReverse[e] = 1 - i.slowDownRatio[e], i.speedDecelerationRatioAbs[e] < .05 && (i.lastFlickSpeed[e] = 0, i.backAnimStarted[e] = !0, Be("bounceZoomPan" + e, se[e], i.backAnimDestination[e], t || 300, ce.easing.sine.out, (function (t) {
                                se[e] = t, Ce()
                            })))))
                        },
                        calculateAnimOffset: function (e) {
                            i.backAnimStarted[e] || (i.speedDecelerationRatio[e] = i.speedDecelerationRatio[e] * (i.slowDownRatio[e] + i.slowDownRatioReverse[e] - i.slowDownRatioReverse[e] * i.timeDiff / 10), i.speedDecelerationRatioAbs[e] = Math.abs(i.lastFlickSpeed[e] * i.speedDecelerationRatio[e]), i.distanceOffset[e] = i.lastFlickSpeed[e] * i.speedDecelerationRatio[e] * i.timeDiff, se[e] += i.distanceOffset[e])
                        },
                        panAnimLoop: function () {
                            if (Fe.zoomPan && (Fe.zoomPan.raf = M(i.panAnimLoop), i.now = ye(), i.timeDiff = i.now - i.lastNow, i.lastNow = i.now, i.calculateAnimOffset("x"), i.calculateAnimOffset("y"), Ce(), i.calculateOverBoundsAnimOffset("x"), i.calculateOverBoundsAnimOffset("y"), i.speedDecelerationRatioAbs.x < .05 && i.speedDecelerationRatioAbs.y < .05)) return se.x = Math.round(se.x), se.y = Math.round(se.y), Ce(), void Ne("zoomPan")
                        }
                    };
                    return i
                },
                Vt = function (e) {
                    if (e.calculateSwipeSpeed("y"), K = n.currItem.bounds, e.backAnimDestination = {}, e.backAnimStarted = {}, Math.abs(e.lastFlickSpeed.x) <= .05 && Math.abs(e.lastFlickSpeed.y) <= .05) return e.speedDecelerationRatioAbs.x = e.speedDecelerationRatioAbs.y = 0, e.calculateOverBoundsAnimOffset("x"), e.calculateOverBoundsAnimOffset("y"), !0;
                    Ue("zoomPan"), e.lastNow = ye(), e.panAnimLoop()
                },
                zt = function (e, t, i) {
                    var a, l, s;
                    if (q.popup.caption_transition_delay = 0, J || (at = c), "swipe" === e) {
                        var r = i.lastFlickDist.x < 10;
                        t > 30 && (r || i.lastFlickOffset.x > 20) ? l = -1 : t < -30 && (r || i.lastFlickOffset.x < -20) && (l = 1)
                    }
                    l && ((c += l) < 0 ? (c = o.loop ? Zt() - 1 : 0, s = !0) : c >= Zt() && (c = o.loop ? 0 : Zt() - 1, s = !0), s && !o.loop || (ue += l, pe -= l, a = !0));
                    var p, d = me.x * pe,
                        m = Math.abs(d - lt.x);
                    return p = (a || d > lt.x == i.lastFlickSpeed.x > 0) && Math.abs(i.lastFlickSpeed.x) > 0 ? Math.max(Math.min(m / Math.abs(i.lastFlickSpeed.x), 400), 250) : 333, at === c && (a = !1), J = !0, a && q.popup.toggle_timer(!1), Be("mainScroll", lt.x, d, p, ce.easing.cubic.out, Me, (function () {
                        We(), J = !1, at = -1, (a || at !== c) && n.updateCurrItem(), be("mainScrollAnimComplete")
                    })), a && n.updateCurrItem(!0), a
                },
                At = function (e) {
                    return 1 / G * e * g
                },
                jt = function () {
                    var e = v,
                        t = Se(),
                        i = Oe();
                    v < t ? e = t : v > i && (e = i);
                    var a, o = ie;
                    return te && !Z && !ae && v < t ? (n.close(), !0) : (te && (a = function (e) {
                        we((1 - o) * e + o)
                    }), n.zoomTo(e, 0, 200, ce.easing.cubic.out, a), !0)
                };
            ge("Gestures", {
                publicMethods: {
                    initGestures: function () {
                        var e = function (e, t, i, a, n) {
                            y = e + t, w = e + i, L = e + a, C = n ? e + n : ""
                        };
                        (H = E.pointerEvent) && E.touch && (E.touch = !1), H ? e("pointer", "down", "move", "up", "cancel") : E.touch ? (e("touch", "start", "move", "end", "cancel"), k = !0) : e("mouse", "down", "move", "up"), m = w + " " + L + " " + C, u = y, H && !k && (k = U.is_touch), n.likelyTouchDevice = k, f[y] = Lt, f[w] = Ct, f[L] = kt, C && (f[C] = f[L]), E.dual_input && (u += " mousedown", m += " mousemove mouseup", f.mousedown = f[y], f.mousemove = f[w], f.mouseup = f[L]), k || (o.allowPanToNext = !1)
                    }
                }
            });
            var Et, It, Tt, St, Ot, Zt, Rt = function (t, i, a, l) {
                    var s;
                    Et && clearTimeout(Et), St = !0, Tt = !0, t.initialLayout ? (s = t.initialLayout, t.initialLayout = null) : s = o.getThumbBoundsFn && o.getThumbBoundsFn(c, a);
                    var p = a ? o.hideAnimationDuration : o.showAnimationDuration,
                        d = function () {
                            Ne("initialZoom"), a ? (n.template.removeAttribute("style"), q.popup.bg.style.removeProperty("opacity")) : (we(1), i && (i.style.display = "block"), e.classList.add("pswp--animated-in")), be("initialZoom" + (a ? "OutEnd" : "InEnd")), l && l(), St = !1
                        };
                    if (!p || !s || void 0 === s.x) return be("initialZoom" + (a ? "Out" : "In")), a ? e.style.opacity = 0 : (v = t.initialZoomLevel, ze(se, t.initialPosition), Ce(), e.style.opacity = 1, we(1)), void(p ? setTimeout((function () {
                        d()
                    }), p) : d());
                    var m, u;
                    m = r, u = !n.currItem.src || n.currItem.loadError || o.showHideOpacity, t.miniImg && (t.miniImg.style.webkitBackfaceVisibility = "hidden"), a || (v = s.w / t.w, se.x = s.x, se.y = s.y - A, q.popup[u ? "pswp" : "bg"].style.opacity = .001, Ce()), Ue("initialZoom"), a && !m && e.classList.remove("pswp--animated-in"), u && (a ? ce.toggle_class(e, "pswp--animate_opacity", !m) : setTimeout((function () {
                        e.classList.add("pswp--animate_opacity")
                    }), 30)), Et = setTimeout((function () {
                        if (be("initialZoom" + (a ? "Out" : "In")), a) {
                            var i = s.w / t.w,
                                n = {
                                    x: se.x,
                                    y: se.y
                                },
                                o = v,
                                l = ie,
                                r = function (t) {
                                    1 === t ? (v = i, se.x = s.x, se.y = s.y - j) : (v = (i - o) * t + o, se.x = (s.x - n.x) * t + n.x, se.y = (s.y - j - n.y) * t + n.y), Ce(), u ? e.style.opacity = 1 - t : we(l - t * l)
                                };
                            m ? Be("initialZoom", 0, 1, p, ce.easing.cubic.out, r, d) : (r(1), Et = setTimeout(d, p + 20))
                        } else v = t.initialZoomLevel, ze(se, t.initialPosition), Ce(), we(1), u ? e.style.opacity = 1 : we(1), Et = setTimeout(d, p + 20)
                    }), a ? 10 : 20)
                },
                Dt = {},
                Pt = [],
                Ft = {
                    index: 0,
                    errorMsg: '<div class="pswp__error-msg"><a href="%url%" target="_blank">The image</a> could not be loaded.</div>',
                    preload: [1, 1],
                    getNumItemsFn: function () {
                        return It.length
                    }
                },
                qt = function (e, t, i) {
                    if (e.src && !e.loadError) {
                        var a = !i;
                        if (Dt.x = t.x, Dt.y = t.y, a) {
                            var n = Dt.x / e.w,
                                o = Dt.y / e.h;
                            e.fitRatio = n < o ? n : o, (i = e.fitRatio) > 1 && (i = 1), e.initialZoomLevel = i, e.bounds || (e.bounds = {
                                center: {
                                    x: 0,
                                    y: 0
                                },
                                max: {
                                    x: 0,
                                    y: 0
                                },
                                min: {
                                    x: 0,
                                    y: 0
                                }
                            })
                        }
                        if (!i) return;
                        return function (e, t, i) {
                            var a = e.bounds;
                            a.center.x = Math.round((Dt.x - t) / 2), a.center.y = Math.round((Dt.y - i) / 2), a.max.x = t > Dt.x ? Math.round(Dt.x - t) : a.center.x, a.max.y = i > Dt.y ? Math.round(Dt.y - i) : a.center.y, a.min.x = t > Dt.x ? 0 : a.center.x, a.min.y = i > Dt.y ? 0 : a.center.y
                        }(e, e.w * i, e.h * i), a && i === e.initialZoomLevel && (e.initialPosition = e.bounds.center), e.bounds
                    }
                    return e.w = e.h = 0, e.initialZoomLevel = e.fitRatio = 1, e.bounds = {
                        center: {
                            x: 0,
                            y: 0
                        },
                        max: {
                            x: 0,
                            y: 0
                        },
                        min: {
                            x: 0,
                            y: 0
                        }
                    }, e.initialPosition = e.bounds.center, e.bounds
                },
                Nt = function (e, t, i, a, o, l) {
                    t.loadError || a && (t.imageAppended = !0, Bt(t, a, t === n.currItem && ve), i.appendChild(a), l && setTimeout((function () {
                        t && t.loaded && t.placeholder && (t.placeholder.style.display = "none", t.placeholder = null)
                    }), 500))
                },
                Ut = function (e) {
                    e.loading = !0, e.loaded = !1;
                    var t = e.img = ce.createEl("pswp__img", "img"),
                        i = function () {
                            e.loading = !1, e.loaded = !0, e.loadComplete ? e.loadComplete(e) : e.img = null, t.onload = t.onerror = null, t = null
                        };
                    return t.onload = i, t.onerror = function () {
                        e.loadError = !0, i()
                    }, t.src = e.src, t
                },
                Wt = function (e, t) {
                    if (e.src && e.loadError && e.container) return t && ce.resetEl(e.container), e.container.innerHTML = o.errorMsg.replace("%url%", e.src), !0
                },
                Bt = function (e, t, i) {
                    if (e.src) {
                        t || (t = e.container.lastElementChild);
                        var a = i ? e.w : Math.round(e.w * e.fitRatio),
                            n = i ? e.h : Math.round(e.h * e.fitRatio);
                        e.placeholder && !e.loaded && (e.placeholder.style.width = a + "px", e.placeholder.style.height = n + "px"), t.style.width = a + "px", t.style.height = n + "px"
                    }
                },
                Xt = function () {
                    if (Pt.length) {
                        for (var e, t = 0; t < Pt.length; t++)(e = Pt[t]).holder.index === e.index && Nt(e.index, e.item, e.baseDiv, e.img, 0, e.clearPlaceholder);
                        Pt = []
                    }
                };
            ge("Controller", {
                publicMethods: {
                    lazyLoadItem: function (e) {
                        e = _e(e);
                        var t = Ot(e);
                        t && (!t.loaded && !t.loading || h) && (be("gettingData", e, t), t.src && Ut(t))
                    },
                    initController: function () {
                        ce.copy_unique(o, Ft), n.items = It = i, Ot = n.getItemAt, Zt = o.getNumItemsFn, o.loop, Zt() < 3 && (o.loop = !1), xe("beforeChange", (function (e) {
                            var t, i = o.preload,
                                a = null === e || e >= 0,
                                l = Math.min(i[0], Zt()),
                                s = Math.min(i[1], Zt());
                            for (t = 1; t <= (a ? s : l); t++) n.lazyLoadItem(c + t);
                            for (t = 1; t <= (a ? l : s); t++) n.lazyLoadItem(c - t)
                        })), xe("initialLayout", (function () {
                            n.currItem.initialLayout = o.getThumbBoundsFn && o.getThumbBoundsFn(c)
                        })), xe("mainScrollAnimComplete", Xt), xe("initialZoomInEnd", Xt), xe("destroy", (function () {
                            for (var e, t = 0; t < It.length; t++)(e = It[t]).container && (e.container = null), e.placeholder && (e.placeholder = null), e.img && (e.img = null), e.preloader && (e.preloader = null), e.loadError && (e.loaded = e.loadError = !1);
                            Pt = null
                        }))
                    },
                    getItemAt: function (e) {
                        return e >= 0 && (void 0 !== It[e] && It[e])
                    },
                    setContent: function (e, t) {
                        o.loop && (t = _e(t));
                        var i = n.getItemAt(e.index);
                        i && (i.container = null);
                        var a, s = n.getItemAt(t);
                        if (s) {
                            be("gettingData", t, s), e.index = t, e.item = s;
                            var r = s.container = ce.createEl("pswp__zoom-wrap");
                            if (!s.src && s.html && (s.html.tagName ? r.appendChild(s.html) : r.innerHTML = s.html), Wt(s), qt(s, re), !s.src || s.loadError || s.loaded) s.src && !s.loadError && ((a = ce.createEl("pswp__img", "img")).style.opacity = 1, a.src = s.src, Bt(s, a), Nt(0, s, r, a));
                            else {
                                s.loadComplete = function (i) {
                                    if (l) {
                                        if (e && e.index === t) {
                                            if (Wt(i, !0)) return i.loadComplete = i.img = null, qt(i, re), He(i), void(e.index === c && n.updateCurrZoomItem());
                                            i.imageAppended ? !St && i.placeholder && (i.placeholder.style.display = "none", i.placeholder = null) : J || St ? Pt.push({
                                                item: i,
                                                baseDiv: r,
                                                img: i.img,
                                                index: t,
                                                holder: e,
                                                clearPlaceholder: !0
                                            }) : Nt(0, i, r, i.img, 0, !0)
                                        }
                                        i.loadComplete = null, i.img = null, be("imageLoadComplete", t, i)
                                    }
                                };
                                var p = s.msrc && (s.msrc !== s.src || !Tt),
                                    d = ce.createEl("pswp__img pswp__img--placeholder" + (p ? "" : " pswp__img--placeholder--blank"), p ? "img" : "");
                                p && (d.src = s.msrc), Bt(s, d), r.appendChild(d), s.placeholder = d, s.loading || Ut(s), Tt ? Nt(0, s, r, s.img, 0, !0) : Pt.push({
                                    item: s,
                                    baseDiv: r,
                                    img: s.img,
                                    index: t,
                                    holder: e
                                })
                            }
                            Tt || t !== c ? He(s) : (Q = r.style, Rt(s, a || s.img)), ce.resetEl(e.el), e.el.appendChild(r)
                        } else ce.resetEl(e.el)
                    },
                    cleanSlide: function (e) {
                        e.img && (e.img.onload = e.img.onerror = null), e.loaded = e.loading = e.img = e.imageAppended = !1
                    }
                }
            });
            var Yt, Gt, Kt = {},
                Qt = function (e, t, i) {
                    var a = document.createEvent("CustomEvent"),
                        n = {
                            origEvent: e,
                            pointerType: i || "touch",
                            releasePoint: t,
                            target: e.target,
                            rightClick: "mouse" === i && 3 === e.which
                        };
                    a.initCustomEvent("pswpTap", !0, !0, n), e.target.dispatchEvent(a)
                };
            ge("Tap", {
                publicMethods: {
                    initTap: function () {
                        xe("firstTouchStart", n.onTapStart), xe("touchRelease", n.onTapRelease), xe("destroy", (function () {
                            Kt = {}, Yt = null
                        }))
                    },
                    onTapStart: function (e) {
                        e.length > 1 && (clearTimeout(Yt), Yt = null)
                    },
                    onTapRelease: function (e, t) {
                        var i, a;
                        if (t && (!N && !P && !qe && (!H || q.popup.container.contains(e.target)))) {
                            var n = t;
                            if (Yt && (clearTimeout(Yt), Yt = null, i = n, a = Kt, Math.abs(i.x - a.x) < 25 && Math.abs(i.y - a.y) < 25)) return void be("doubleTap", n);
                            if ("mouse" === t.type) return void Qt(e, t, "mouse");
                            if ("A" === e.target.tagName) return;
                            if ("BUTTON" === e.target.tagName || e.target.classList.contains("pswp__single-tap")) return void Qt(e, t);
                            ze(Kt, n), Yt = setTimeout((function () {
                                Qt(e, t), Yt = null
                            }), 300)
                        }
                    }
                }
            }), ge("DesktopZoom", {
                publicMethods: {
                    initDesktopZoom: function () {
                        U.is_dual_input ? xe("mouseUsed", (function () {
                            n.setupDesktopZoom()
                        })) : U.is_pointer && n.setupDesktopZoom(!0)
                    },
                    setupDesktopZoom: function (t) {
                        Gt = {};
                        var i = "wheel mousewheel DOMMouseScroll";
                        xe("bindEvents", (function () {
                            ce.bind(e, i, n.handleMouseWheel)
                        })), xe("unbindEvents", (function () {
                            Gt && ce.unbind(e, i, n.handleMouseWheel)
                        })), n.mouseZoomedIn = !1;
                        var a, o = function () {
                                n.mouseZoomedIn && (e.classList.remove("pswp--zoomed-in"), n.mouseZoomedIn = !1), ce.toggle_class(e, "pswp--zoom-allowed", v < 1), l()
                            },
                            l = function () {
                                a && (e.classList.remove("pswp--dragging"), a = !1)
                            };
                        xe("resize", o), xe("afterChange", o), xe("pointerDown", (function () {
                            n.mouseZoomedIn && (a = !0, e.classList.add("pswp--dragging"))
                        })), xe("pointerUp", l), t || o()
                    },
                    handleMouseWheel: function (e) {
                        if (v <= n.currItem.fitRatio) return !o.closeOnScroll || qe || D ? e.preventDefault() : Math.abs(e.deltaY) > 2 && (r = !0, n.close()), !0;
                        if (e.stopPropagation(), Gt.x = 0, "deltaX" in e) 1 === e.deltaMode ? (Gt.x = 18 * e.deltaX, Gt.y = 18 * e.deltaY) : (Gt.x = e.deltaX, Gt.y = e.deltaY);
                        else if ("wheelDelta" in e) e.wheelDeltaX && (Gt.x = -.16 * e.wheelDeltaX), e.wheelDeltaY ? Gt.y = -.16 * e.wheelDeltaY : Gt.y = -.16 * e.wheelDelta;
                        else {
                            if (!("detail" in e)) return;
                            Gt.y = e.detail
                        }
                        Te(v, !0);
                        var t = se.x - Gt.x,
                            i = se.y - Gt.y;
                        e.preventDefault(), n.panTo(t, i)
                    },
                    toggleDesktopZoom: function (t) {
                        t = t || {
                            x: re.x / 2 + de.x,
                            y: re.y / 2 + de.y
                        };
                        var i = o.getDoubleTapZoom(!0, n.currItem),
                            a = v === i;
                        n.mouseZoomedIn = !a, n.zoomTo(a ? n.currItem.initialZoomLevel : i, t, 333), ce.toggle_class(e, "pswp--zoomed-in", !a)
                    }
                }
            });
            var Jt, $t, ei, ti, ii, ai, ni, oi, li, si, ri = {
                    history: !0
                },
                ci = function () {
                    return si.hash.substring(1)
                },
                pi = function () {
                    Jt && clearTimeout(Jt), ei && clearTimeout(ei)
                },
                di = function () {
                    if (ei && clearTimeout(ei), qe || D) ei = setTimeout(di, 500);
                    else {
                        ti ? clearTimeout($t) : ti = !0;
                        var e = c + 1,
                            t = Ot(c);
                        t.hasOwnProperty("pid") && (e = t.pid);
                        var i = (ai ? ai + "&" : "") + "pid=" + e;
                        ni || -1 === si.hash.indexOf(i) && (li = !0);
                        var a = si.href.split("#")[0] + "#" + i;
                        "#" + i !== window.location.hash && history[ni ? "replaceState" : "pushState"]("", document.title, a), ni = !0, $t = setTimeout((function () {
                            ti = !1
                        }), 60)
                    }
                };
            ge("History", {
                publicMethods: {
                    initHistory: function () {
                        if (ce.copy_unique(o, ri), o.history) {
                            si = window.location, li = !1, oi = !1, ni = !1, ai = ci(), xe("afterChange", n.updateURL), xe("unbindEvents", (function () {
                                ce.unbind(window, "hashchange", n.onHashChange)
                            })), history.scrollRestoration && (history.scrollRestoration = "manual");
                            var e = function () {
                                ii = !0, oi || (li ? history.back() : ai ? si.hash = ai : history.pushState("", document.title, si.pathname + si.search)), pi(), history.scrollRestoration && (history.scrollRestoration = "auto")
                            };
                            xe("unbindEvents", (function () {
                                r && e()
                            })), xe("destroy", (function () {
                                ii || e()
                            }));
                            var t = ai.indexOf("pid=");
                            t > -1 && "&" === (ai = ai.substring(0, t)).slice(-1) && (ai = ai.slice(0, -1)), setTimeout((function () {
                                l && ce.bind(window, "hashchange", n.onHashChange)
                            }), 40)
                        }
                    },
                    onHashChange: function () {
                        if (ci() === ai) return oi = !0, void n.close()
                    },
                    updateURL: function () {
                        pi(), ni ? Jt = setTimeout(di, 800) : di()
                    }
                }
            }), Object.assign(n, Xe)
        };
    ! function () {
        if (_c.menu_enabled) {
            N.sidebar = _id("sidebar"), N.sidebar_inner = _id("sidebar-inner"), N.sidebar_menu = _id("sidebar-menu"), N.sidebar_toggle = _id("sidebar-toggle"), N.sidebar_modal = _id("sidebar-bg"), N.sidebar_topbar = _id("sidebar-topbar");
            var e, a, n, o, s, r = !1,
                c = !1,
                p = {},
                d = !1,
                m = E.get_json("files:interface:menu-expanded:" + _c.location_hash),
                u = _c.menu_show && matchMedia("(min-width: 992px)").matches;
            u || document.documentElement.classList.add("sidebar-closed"), P.menu_loading = function (e, t) {
                e || (e = c), e && e.classList.toggle("menu-spinner", t)
            }, P.set_menu_active = function (e) {
                var t = c,
                    i = !!_c.dirs[e] && _c.dirs[e].menu_li;
                (c = !!i && i.firstChild) != t && (t && P.menu_loading(t, !1), g(t, !1), g(c, !0))
            }, N.sidebar_toggle.innerHTML = P.get_svg_icon_multi("menu", "menu_back"), y(N.sidebar_toggle, L, "click"), y(N.sidebar_modal, L, "click"), P.create_menu = A;
            var f = E.get_json("files:menu:" + _c.menu_cache_hash),
                v = _c.menu_cache_validate || _c.cache && !_c.menu_cache_file;
            !(!f || v && ! function () {
                for (var e = f.length, t = 0; t < e; t++)
                    if (f[t].path.includes("/")) return !1;
                return !0
            }()) ? A(f, "menu from localstorage [" + (_c.menu_cache_validate ? "shallow menu" : "menu cache validation disabled") + "]"): (N.sidebar_menu.classList.add("sidebar-spinner"), N.sidebar_menu.dataset.title = X.get("loading"), I({
                params: !_c.menu_cache_file && "action=dirs" + (_c.cache ? "&menu_cache_hash=" + _c.menu_cache_hash : "") + (f ? "&localstorage=1" : ""),
                url: _c.menu_cache_file,
                json_response: !0,
                complete: function (e, t, i) {
                    if (N.sidebar_menu.classList.remove("sidebar-spinner"), delete N.sidebar_menu.dataset.title, !i || !e || e.error || !Object.keys(e).length) return K(), void z("Error or no dirs!");
                    e.localstorage ? A(f, "menu from localstorage") : (A(e, "menu from " + (_c.menu_cache_file ? "JSON cache: " + _c.menu_cache_file : "xmlhttp")), U.local_storage && setTimeout((function () {
                        P.clean_localstorage(), E.set("files:menu:" + _c.menu_cache_hash, t)
                    }), 1e3))
                }
            }))
        }

        function g(e, t) {
            if (e && e.isConnected) {
                e.classList.toggle("menu-active", t);
                for (var i = e.parentElement.parentElement.parentElement;
                    "LI" === i.nodeName;) i.classList.toggle("menu-active-ancestor", t), i = i.parentElement.parentElement
            }
        }

        function _(t, i) {
            if ("all" === t) i ? k(n, (function (e) {
                p[e.dataset.path] = !0
            })) : p = {};
            else {
                var a = t.dataset.path;
                i ? p[a] = !0 : p[a] && delete p[a]
            }
            var o = Object.keys(p).length,
                l = o === n.length;
            d !== l && (d = l, U.is_pointer && (e.title = X.get(d ? "collapse menu" : "expand menu")), e.classList.toggle("is-expanded", d)), U.local_storage && (r && clearTimeout(r), r = setTimeout((function () {
                E.set("files:interface:menu-expanded:" + _c.location_hash, !!o && JSON.stringify(p), !0)
            }), 1e3))
        }

        function h(e, t, i) {
            var a = e.lastChild;
            a.style.display = "block", anime.remove(a);
            var n = {
                targets: a,
                translateY: t ? [-5, 0] : -5,
                height: [a.clientHeight + "px", t ? a.scrollHeight + "px" : 0],
                opacity: t ? 1 : 0,
                easing: "easeOutQuint",
                duration: 250,
                complete: function () {
                    a.style.cssText = "--depth:" + (e.dataset.level || 0), i && i()
                }
            };
            anime(n), e.classList.toggle("menu-li-open", t)
        }

        function L(e) {
            P.set_config("menu_show", !_c.menu_show), document.documentElement.classList.toggle("sidebar-closed"), u = !u
        }

        function M(e, t) {
            for (var i = "", a = 0; a < t; a++) i += e;
            return i
        }

        function V(e, a) {
            var n = "menu-li",
                o = "menu-a",
                s = e.path ? (e.path.match(/\//g) || []).length + 1 : 0,
                r = "folder" + (e.is_readable ? e.is_link ? "_link" : "" : "_forbid");
            return a ? (n += " has-ul", m && m[e.path] && (n += " menu-li-open", p[e.path] = !0)) : e.is_readable || (o += " menu-a-forbidden"), '<li data-level="' + s + '" data-path="' + t(e.path) + '" class="' + n + '"><a href="' + l(e) + '" class="' + o + '">' + (a ? P.get_svg_icon_multi_class("menu-icon menu-icon-toggle", "plus", "minus") : "") + (a ? P.get_svg_icon_multi_class("menu-icon menu-icon-folder menu-icon-folder-toggle", r, "folder_plus", "folder_minus") : P.get_svg_icon_class(r, "menu-icon menu-icon-folder")) + i(e.basename) + "</a>"
        }

        function A(t, i) {
            var l, r, m, f, v, g;
            if (K(), z(i, t), _c.dir_paths = [], k(t, (function (e) {
                    _c.dir_paths.push(e.path), _c.dirs[e.path] || (_c.dirs[e.path] = e)
                })), P.menu_init_files(), l = "", r = 0, m = 0, f = !1, k(_c.dir_paths, (function (e, t) {
                    if (e) {
                        var i = (e.match(/\//g) || []).length + 1,
                            a = i - r;
                        r = i, m += a, f && (l += V(f, a > 0)), l += a > 0 ? '<ul style="--depth:' + (m - 1) + '" class="menu-' + (f ? "ul" : "root") + '">' : "</li>" + M("</ul></li>", -a), f = _c.dirs[e]
                    }
                })), l += V(f, !1) + M("</li></ul>", m), N.sidebar_menu.innerHTML = l, a = N.sidebar_menu.firstChild, n = _class("has-ul", a), o = n.length ? H(Array.from(a.children), "has-ul", !0) : [], v = o, s = n.filter((function (e) {
                    return !v.includes(e)
                })), k(_class("menu-li", a), (function (e) {
                    var t = _c.dirs[e.dataset.path];
                    t && (t.menu_li = e)
                })), P.set_menu_active(_c.current_path || _c.init_path), U.local_storage && (N.sidebar_menu.scrollTop = E.get("files:interface:menu_scroll:" + _c.location_hash) || 0, y(N.sidebar_menu, w((function () {
                    E.set("files:interface:menu_scroll:" + _c.location_hash, N.sidebar_menu.scrollTop, !0)
                }), 1e3), "scroll")), n.length && (g = !1, d = Object.keys(p).length === n.length, N.sidebar_topbar.innerHTML = '<button id="menu-toggle" type="button" class="btn-icon' + (d ? " is-expanded" : "") + '">' + P.get_svg_icon_multi("plus", "minus") + "</button>", y(e = N.sidebar_topbar.lastElementChild, (function (e) {
                    if (d) {
                        var t = [],
                            i = [],
                            a = !1,
                            l = window.innerHeight;
                        k(o, (function (e) {
                            if (e.classList.contains("menu-li-open"))
                                if (a) t.push(e);
                                else {
                                    var n = e.getBoundingClientRect();
                                    n.top > l || n.bottom - n.top > 2 * l ? (t.push(e), a = !0) : i.push(e)
                                }
                        })), t.length && k(t, (function (e) {
                            e.classList.remove("menu-li-open")
                        })), i.length && k(i, (function (e) {
                            h(e, !1)
                        })), g && clearTimeout(g), g = setTimeout((function () {
                            C(s, "menu-li-open", !1)
                        }), i.length ? 260 : 10)
                    } else n.length > 100 ? C(n, "menu-li-open", !0) : (t = [], i = [], a = !1, l = window.innerHeight, k(n, (function (e) {
                        e.classList.contains("menu-li-open") || (a || !e.offsetParent ? t.push(e) : e.getBoundingClientRect().top > l || e.lastChild.childNodes.length > 50 ? (a = !0, t.push(e)) : i.push(e))
                    })), t.length && k(t, (function (e) {
                        e.classList.add("menu-li-open")
                    })), i.length && k(i, (function (e) {
                        h(e, !0)
                    })));
                    _("all", !d)
                }), "click")), _c.transitions && u) {
                var A = {
                    targets: function () {
                        for (var e = [], t = a.children, i = t.length, n = N.sidebar_inner.clientHeight, o = 0; o < i; o++) {
                            var l = t[o];
                            if (l.getBoundingClientRect().top < n) e.push(l);
                            else if (e.length) break
                        }
                        return e
                    }(),
                    translateY: [-5, 0],
                    opacity: [0, 1],
                    easing: "easeOutCubic",
                    duration: 100
                };
                A.delay = anime.stagger(O(20, 50, Math.round(200 / A.targets.length))), anime(A)
            }
            y(a, (function (e) {
                if (q.contextmenu.is_open) return e.preventDefault();
                if (e.target !== a) {
                    var t = "A" === e.target.nodeName,
                        i = t ? e.target.parentElement : e.target.closest(".menu-li"),
                        n = t ? e.target : i.firstElementChild;
                    if (!b(e, n))
                        if (t && n !== c) P.get_files(i.dataset.path, "push"), matchMedia("(min-width: 992px)").matches ? _c.menu_show || x(N.sidebar, "sidebar-clicked", null, 1e3) : L();
                        else if (!t || i.classList.contains("has-ul")) {
                        var o = !i.classList.contains("menu-li-open");
                        _(i, o), h(i, o)
                    }
                }
            }))
        }
    }();
    var de = new Intl.Collator(void 0, {
        numeric: !0,
        sensitivity: "base"
    });

    function me() {
        function e(e) {
            setTimeout((function () {
                e && e.remove()
            }), 100)
        } [".modal-body", "#files"].forEach((function (t) {
            yall({
                observeChanges: !0,
                observeRootSelector: t,
                lazyClass: "files-lazy",
                threshold: 300,
                events: {
                    load: function (t) {
                        var i = t.target;
                        if (i.classList.contains("files-folder-preview")) {
                            var a = i.naturalWidth;
                            return a && 1 === a ? e(i) : i.style.opacity = 1
                        }
                        i.classList.remove("files-img-placeholder"), i.parentElement.classList.add("files-a-loaded")
                    },
                    error: {
                        listener: function (t) {
                            var i = t.target;
                            i.classList.contains("files-folder-preview") && e(i)
                        }
                    }
                }
            })
        })), _query(".preloader-body").remove(), document.body.classList.remove("body-loading"), !_c.prevent_right_click && _c.context_menu && (N.files && N.files.addEventListener("contextmenu", (function (e) {
            var t = e.target.closest(".files-a"),
                i = !!t && _c.files[t.dataset.name];
            i && P.create_contextmenu(e, "files", t, i)
        })), N.sidebar_menu && N.sidebar_menu.addEventListener("contextmenu", (function (e) {
            var t = e.target.closest(".menu-li"),
                i = !!t && _c.dirs[t.dataset.path];
            i && P.create_contextmenu(e, "sidebar", t, i)
        }))), anime({
            targets: document.body,
            opacity: [0, 1],
            duration: 500,
            easing: "easeOutQuad",
            complete: P.init_files
        })
    }! function () {
        function e(e, t) {
            Object.assign(q.sort, {
                sort: e,
                order: t,
                multi: "asc" === t ? 1 : -1,
                index: q.sort.keys.indexOf(e),
                prop: q.sort.sorting[e].prop
            })
        }
        q.sort = {
            sorting: {
                name: {
                    prop: "basename",
                    order: "asc"
                },
                kind: {
                    prop: "ext",
                    order: "asc"
                },
                size: {
                    prop: "filesize",
                    order: "desc"
                },
                date: {
                    prop: "mtime",
                    order: "desc"
                }
            }
        }, q.sort.keys = Object.keys(q.sort.sorting);
        var t = (_c.sort || "name_asc").split("_");
        q.sort.keys.includes(t[0]) || (t[0] = "name"), t[1] && ["asc", "desc"].includes(t[1]) || (t[1] = q.sort.sorting[t[0]].order), t.join("_") !== _c.sort && (_c.sort = t.join("_")), e(t[0], t[1]);
        var i = _id("change-sort");
        i.innerHTML = '<button type="button" class="btn-icon btn-topbar">' + P.get_svg_icon("sort_" + q.sort.sort + "_" + q.sort.order) + '</button><div class="dropdown-menu dropdown-menu-topbar dropdown-menu-center"><h6 class="dropdown-header" data-lang="sort">' + X.get("sort") + "</h6>" + M(q.sort.keys, (function (e) {
            return '<button class="dropdown-item' + (e === q.sort.sort ? " active sort-" + q.sort.order : "") + '" data-action="' + e + '">' + P.get_svg_icon_multi("menu_down", "menu_up") + P.get_svg_icon_multi("sort_" + e + "_asc", "sort_" + e + "_desc") + '<span class="dropdown-text" data-lang="' + e + '">' + X.get(e) + "</span></button>"
        })) + "</div>";
        var a = i.firstChild,
            n = (i.children[1], i.lastChild),
            o = _class("dropdown-item", n);

        function l(e, t) {
            return e._values.is_dir === t._values.is_dir ? s(e, t) : (t._values.is_dir ? 1 : -1) * q.sort.multi
        }

        function s(e, t) {
            return "name" === q.sort.sort || e._values[q.sort.prop] === t._values[q.sort.prop] ? de.compare(e._values.basename, t._values.basename) : e._values[q.sort.prop] < t._values[q.sort.prop] ? -1 : 1
        }

        function r(e, t, i) {
            var a = i ? "add" : "remove";
            e && (o[q.sort.index].classList[a]("active"), c[q.sort.index].classList[a]("sortbar-active")), (e || t) && (o[q.sort.index].classList[a]("sort-" + q.sort.order), c[q.sort.index].classList[a]("sort-" + q.sort.order))
        }
        P.set_sort = function (t) {
            if (t) {
                var i = t !== q.sort.sort,
                    n = i ? q.sort.sorting[t].order : "asc" === q.sort.order ? "desc" : "asc",
                    o = n !== q.sort.order;
                r(i, o, !1), e(t, n), a.innerHTML = P.get_svg_icon("sort_" + t + "_" + n), r(i, o, !0), P.set_config("sort", q.sort.sort + "_" + q.sort.order)
            }
            _c.debug && console.time("sort"), q.list.sort(q.sort.prop, {
                order: q.sort.order,
                sortFunction: _c.sort_dirs_first ? l : s
            }), _c.debug && console.timeEnd("sort")
        }, P.dropdown(i, a, (function () {
            P.set_sort(q.sort.keys[q.sort.index >= q.sort.keys.length - 1 ? 0 : q.sort.index + 1])
        })), p(n, P.set_sort), N.sortbar = _id("files-sortbar"), N.sortbar.className = "sortbar-" + _c.layout, N.sortbar.innerHTML = '<div class="sortbar-inner">' + M(q.sort.keys, (function (e) {
            return '<div class="sortbar-item sortbar-' + e + (e === q.sort.sort ? " sortbar-active sort-" + q.sort.order : "") + '" data-action="' + e + '"><span data-lang="' + e + '" class="sortbar-item-text">' + X.get(e) + "</span>" + P.get_svg_icon_multi("menu_down", "menu_up") + "</div>"
        })) + "</div>";
        var c = N.sortbar.firstChild.children;
        y(N.sortbar, (function (e) {
            var t = e.target.closest("[data-action]");
            t && P.set_sort(t.dataset.action, e)
        }))
    }(),
    function () {
        if (N.topbar_top = _id("topbar-top"), q.topbar = {
                info: {}
            }, N.filter.placeholder = X.get("filter"), N.filter.title = U.c_key + "F", oe.hash(), N.filter.parentElement.insertAdjacentHTML("beforeend", P.get_svg_icon("search")), X.dropdown(), _c.has_login) {
            N.topbar_top.insertAdjacentHTML("beforeend", '<a href="' + location.href.split("?")[0] + '?logout" class="btn-icon btn-topbar" id="logout"' + _("logout", !0) + ">" + P.get_svg_icon("logout") + "</a>");
            var e = N.topbar_top.lastElementChild;
            y(e, (function (t) {
                t.preventDefault(), ie.fire(X.get("logout", !0) + "?").then((t => {
                    t.isConfirmed && location.assign(e.href)
                }))
            }))
        }
        screenfull.isEnabled && (N.topbar_top.insertAdjacentHTML("beforeend", '<button class="btn-icon btn-topbar" id="topbar-fullscreen">' + P.get_svg_icon_multi("expand", "collapse") + "</button>"), y(N.topbar_top.lastElementChild, (function () {
            screenfull.toggle()
        })), screenfull.on("change", (function () {
            document.documentElement.classList.toggle("is-fullscreen", screenfull.isFullscreen)
        }))), P.topbar_info = function (e, t) {
            N.topbar_info.className = "info-" + t, N.topbar_info.innerHTML = e
        }, P.topbar_info_search = function (e, t) {
            if (A(N.sortbar, !t), !e) return N.topbar_info.className = "info-hidden";
            N.topbar_info.classList.contains("info-search") ? (N.topbar_info.classList.toggle("info-nomatch", !t), N.topbar_info.children[0].textContent = t, N.topbar_info.children[2].textContent = e) : P.topbar_info('<span class="info-search-count">' + t + '</span><span class="info-search-lang"><span data-lang="matches found for">' + X.get("matches found for") + '</span></span><span class="info-search-phrase">' + e + '</span><button class="info-search-reset" data-action="reset">' + P.get_svg_icon("close") + "</button>", "search" + (t ? "" : " info-nomatch"))
        }
    }(), "IntersectionObserver" in window && "IntersectionObserverEntry" in window && "intersectionRatio" in window.IntersectionObserverEntry.prototype ? me() : P.load_plugin("intersection-observer", me, {
        src: ["intersection-observer@0.12.0/intersection-observer.js"]
    })
}("undefined" == typeof files ? files = {} : files);
