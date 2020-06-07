"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseUrl = exports.makeUrl = exports.check = void 0;
const url_1 = __importStar(require("../../util/url"));
function check(url, options) {
    return /syosetu/i.test(url_1.default(url).hostname || '');
}
exports.check = check;
function makeUrl(urlobj, bool, ...argv) {
    let subdomain = urlobj.novel_r18 ? 'novel18' : 'ncode';
    if (urlobj.novel_pid && urlobj.chapter_id) {
        // @ts-ignore
        return new URL(`https://${subdomain}.syosetu.com/txtdownload/dlstart/ncode/${urlobj.novel_pid}/?no=${urlobj.chapter_id}&hankaku=0&code=utf-8&kaigyo=crlf`);
    }
    let pad = (!bool && urlobj.chapter_id) ? urlobj.chapter_id : '';
    let url = `http://${subdomain}.syosetu.com/${urlobj.novel_id}/${pad}`;
    return url_1.default(url);
}
exports.makeUrl = makeUrl;
function parseUrl(_url, ...argv) {
    const { urlobj, url } = url_1._handleParseURL(_url, ...argv);
    let r;
    let m;
    r = /^(n[\w]{5,6})$/;
    if (m = r.exec(url)) {
        urlobj.novel_id = m[1];
        return urlobj;
    }
    r = /(novel18)\.syosetu\.com/;
    if (m = r.exec(url)) {
        urlobj.novel_r18 = m[1];
    }
    r = /txtdownload\/dlstart\/ncode\/(\d+)/;
    if (m = r.exec(url)) {
        urlobj.novel_pid = m[1];
        return urlobj;
    }
    r = /\.syosetu\.com\/(n\w+)(?:\/?(\d+))?/;
    if (m = r.exec(url)) {
        urlobj.novel_id = m[1];
        urlobj.chapter_id = m[2];
        return urlobj;
    }
    return urlobj;
}
exports.parseUrl = parseUrl;
//# sourceMappingURL=util.js.map