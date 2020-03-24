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
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseUrl = exports.makeUrl = exports.check = void 0;
const url_1 = __importStar(require("../../util/url"));
function check(url, options) {
    return /alphapolis/i.test(url_1.default(url).hostname || '');
}
exports.check = check;
function makeUrl(urlobj, bool, ...argv) {
    let url;
    let cid = (!bool && urlobj.chapter_id) ? `episode\/${urlobj.chapter_id}` : '';
    url = `https://www.alphapolis.co.jp/novel/${urlobj.novel_pid}/${urlobj.novel_id}/${cid}`;
    return url_1.default(url);
}
exports.makeUrl = makeUrl;
function parseUrl(_url, ...argv) {
    const { urlobj, url } = url_1._handleParseURL(_url, ...argv);
    let r;
    let m;
    r = /alphapolis\.co\.jp\/novel\/([^\/]+)\/([^\/]+)(?:\/episode\/([^\/]+))?/;
    m = r.exec(url);
    if (!m) {
        r = /novel\/([^\/]+)\/([^\/]+)(?:\/episode\/([^\/]+))?/;
        m = r.exec(url);
    }
    if (m) {
        urlobj.novel_pid = m[1];
        urlobj.novel_id = m[2];
        urlobj.chapter_id = m[3];
        return urlobj;
    }
    return urlobj;
}
exports.parseUrl = parseUrl;
//# sourceMappingURL=util.js.map