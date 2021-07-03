"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseUrl = exports.makeUrl = exports.check = void 0;
const tslib_1 = require("tslib");
const url_1 = (0, tslib_1.__importStar)(require("../../util/url"));
function check(url, options) {
    return /uukanshu/i.test((0, url_1.default)(url).hostname || '');
}
exports.check = check;
function makeUrl(urlobj, bool, ...argv) {
    let url;
    let cid = (!bool && urlobj.chapter_id) ? `${urlobj.chapter_id}.html` : '';
    url = `https://www.uukanshu.com/b/${urlobj.novel_id}/${cid}`;
    return (0, url_1.default)(url);
}
exports.makeUrl = makeUrl;
function parseUrl(_url, ...argv) {
    const { urlobj, url } = (0, url_1._handleParseURL)(_url, ...argv);
    let r;
    let m;
    r = /www\.uukanshu\.com\/b\/(\d+)\/(\d+)\.html/;
    m = r.exec(url);
    if (m) {
        urlobj.novel_id = m[1];
        urlobj.chapter_id = m[2];
        return urlobj;
    }
    r = /www\.uukanshu\.com\/b\/(\d+)/;
    if (m = r.exec(url)) {
        urlobj.novel_id = m[1];
        return urlobj;
    }
    return urlobj;
}
exports.parseUrl = parseUrl;
//# sourceMappingURL=util.js.map