/* Fixed MonkeOnYT Loader for Ragdoll Hit */
function createUnityInstance(t, n, d) {
    function c(e, t) {
        if (!c.aborted && n.showBanner) return "error" == t && (c.aborted = !0), n.showBanner(e, t);
        switch (t) {
            case "error": console.error(e); break;
            case "warning": console.warn(e); break;
            default: console.log(e)
        }
    }

    function r(e) {
        var t = e.reason || e.error,
            n = t ? t.toString() : e.message || e.reason || "",
            r = t && t.stack ? t.stack.toString() : "";
        (n += "\n" + (r = r.startsWith(n) ? r.substring(n.length) : r).trim()) && l.stackTraceRegExp && l.stackTraceRegExp.test(n) && E(n, e.filename || t && (t.fileName || t.sourceURL) || "", e.lineno || t && (t.lineNumber || t.line) || 0)
    }

    function e(e, t, n) {
        var r = e[t];
        void 0 !== r && r || (e[t] = n)
    }

    d = d || function () { };
    var o, l = {
        canvas: t,
        webglContextAttributes: { preserveDrawingBuffer: !1, powerPreference: 2 },
        streamingAssetsUrl: "StreamingAssets",
        downloadProgress: {},
        deinitializers: [],
        intervals: {},
        setInterval: function (e, t) { e = window.setInterval(e, t); return this.intervals[e] = !0, e },
        clearInterval: function (e) { delete this.intervals[e], window.clearInterval(e) },
        preRun: [],
        postRun: [],
        print: function (e) { console.log(e) },
        printErr: function (e) { console.error(e) },
        locateFile: function (e) { return e },
        disabledCanvasEvents: ["contextmenu", "dragstart"]
    };

    for (o in e(n, "companyName", "MonkeOnYT"), e(n, "productName", "Ragdoll Hit"), e(n, "productVersion", "1.0"), n) l[o] = n[o];

    // --- CORE ENGINE FIXES ---
    var U = {
        Module: l,
        SetFullscreen: function () { if (l.SetFullscreen) return l.SetFullscreen.apply(l, arguments); },
        SendMessage: function () { if (l.SendMessage) return l.SendMessage.apply(l, arguments); },
        Quit: function () { return new Promise(function (e, t) { l.shouldQuit = !0, l.onQuit = e }) }
    };

    function E(e, t, n) {
        console.error("Unity Error: " + e);
    }

    function W(e, t) {
        if ("symbolsUrl" != e) {
            var n = l.downloadProgress[e];
            n = n || (l.downloadProgress[e] = { started: !1, finished: !1, lengthComputable: !1, total: 0, loaded: 0 });
            if (typeof t == "object" && (t.type == "progress" || t.type == "load")) {
                if (!n.started) { n.started = !0; n.lengthComputable = t.lengthComputable; }
                n.total = t.total; n.loaded = t.loaded;
                if (t.type == "load") n.finished = !0;
            }
            var r = 0, o = 0, i = 0, a = 0, s = 0;
            for (var key in l.downloadProgress) {
                var prog = l.downloadProgress[key];
                if (!prog.started) return;
                i++;
                if (prog.lengthComputable) { r += prog.loaded; o += prog.total; a++; }
                else if (prog.finished) s++;
            }
            d(.9 * (i ? (i - s - (o ? a * (o - r) / o : 0)) / i : 0));
        }
    }

    l.SystemInfo = (function () {
        var h = "object" == typeof WebAssembly && "function" == typeof WebAssembly.compile;
        var u = (function () {
            var f = document.createElement("canvas");
            var gl = f.getContext("webgl2") ? 2 : (f.getContext("webgl") ? 1 : 0);
            return gl;
        })();
        return { hasWebGL: u, hasWasm: h, browser: "Chrome", os: "Windows" };
    })();

    l.fetchWithProgress = function (e, t) {
        var n = function () { };
        if (t && t.onProgress) n = t.onProgress;
        return fetch(e, t).then(function (e) {
            return e.arrayBuffer().then(function (t) {
                n({ type: "load", total: t.byteLength, loaded: t.byteLength, lengthComputable: !0 });
                e.parsedBody = new Uint8Array(t);
                return e;
            });
        });
    };

    function N(n) {
        W(n);
        return l.fetchWithProgress(l[n], { method: "GET", onProgress: function (e) { W(n, e) } }).then(function (e) { return e.parsedBody; });
    }

    function R() {
        Promise.all([
            N("frameworkUrl").then(function (e) {
                var s = URL.createObjectURL(new Blob([e], { type: "application/javascript" }));
                return new Promise(function (i, e) {
                    var a = document.createElement("script");
                    a.src = s;
                    a.onload = function () {
                        var o = unityFramework; unityFramework = null; i(o);
                    };
                    document.body.appendChild(a);
                });
            }),
            N("codeUrl")
        ]).then(function (e) {
            l.wasmBinary = e[1];
            e[0](l);
        });

        var e = N("dataUrl");
        l.preRun.push(function () {
            l.addRunDependency("dataUrl");
            e.then(function (e) {
                var t = new DataView(e.buffer, e.byteOffset, e.byteLength), n = 0, r = "UnityWebData1.0\0";
                n += r.length;
                var o = t.getUint32(n, !0); n += 4;
                while (n < o) {
                    var i = t.getUint32(n, !0); n += 4;
                    var a = t.getUint32(n, !0); n += 4;
                    var s = t.getUint32(n, !0); n += 4;
                    var d = String.fromCharCode.apply(null, e.subarray(n, n + s)); n += s;
                    for (var c = 0, u = d.indexOf("/", c) + 1; 0 < u; c = u, u = d.indexOf("/", c) + 1)
                        l.FS_createPath(d.substring(0, c), d.substring(c, u - 1), !0, !0);
                    l.FS_createDataFile(d, null, e.subarray(i, i + a), !0, !0, !0);
                }
                l.removeRunDependency("dataUrl");
            });
        });
    }

    return new Promise(function (e, t) {
        if (l.SystemInfo.hasWebGL && l.SystemInfo.hasWasm) {
            l.startupErrorHandler = t;
            d(0);
            l.postRun.push(function () { d(1); e(U); });
            R();
        } else {
            t("WebGL/Wasm not supported");
        }
    });
}
