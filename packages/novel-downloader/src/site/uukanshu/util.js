"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.check = check;
exports.makeUrl = makeUrl;
exports.parseUrl = parseUrl;
const url_1 = require("../../util/url");
function check(url, options) {
    return /uukanshu/i.test((0, url_1.createURL)(url).hostname || '');
}
function makeUrl(urlobj, bool, ...argv) {
    let url;
    let cid = (!bool && urlobj.chapter_id) ? `${urlobj.chapter_id}.html` : '';
    url = `https://www.uukanshu.com/b/${urlobj.novel_id}/${cid}`;
    return (0, url_1.createURL)(url);
}
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
//# sourceMappingURL=util.js.map