"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports._handleParseURL = exports.isURL = exports.createURL = void 0;
const jsdom_url_1 = require("jsdom-url");
const log_1 = require("./log");
const lazy_url_1 = require("lazy-url");
function createURL(...argv) {
    //return new _URL(...argv) as any
    return new lazy_url_1.LazyURL(...argv);
}
exports.createURL = createURL;
function isURL(obj) {
    if (obj instanceof URL || obj instanceof jsdom_url_1.URL || obj instanceof jsdom_url_1.URLImplCore) {
        return true;
    }
    return false;
}
exports.isURL = isURL;
function _handleParseURL(url, ...argv) {
    if (typeof url === 'number') {
        url = String(url);
    }
    let urlobj = {
        url: url,
        novel_pid: null,
        novel_id: null,
        chapter_id: null,
    };
    try {
        urlobj.url = createURL(url);
        url = urlobj.url.href;
    }
    catch (e) {
        if (isURL(url)) {
            url = url.href;
        }
        else {
            log_1.console.warn(e.toString() + ` "${url}"`);
        }
    }
    if (typeof url != 'string') {
        throw new TypeError(`expected url can be string, but got ${url}`);
    }
    return {
        urlobj,
        url: url
    };
}
exports._handleParseURL = _handleParseURL;
exports.default = createURL;
//# sourceMappingURL=url.js.map