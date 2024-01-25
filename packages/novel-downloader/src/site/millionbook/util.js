"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseUrl = exports.makeUrl = exports.check = void 0;
const url_1 = require("../../util/url");
function check(url, options) {
    return /millionbook/i.test((0, url_1.createURL)(url).hostname || '');
}
exports.check = check;
function makeUrl(urlobj, bool, ...argv) {
    let url;
    let cid = (!bool && urlobj.chapter_id) ? `${urlobj.chapter_id}.htm` : 'index.html';
    url = `http://www.millionbook.net/${urlobj.novel_pid}/${urlobj.novel_id}/${cid}`;
    return (0, url_1.createURL)(url);
}
exports.makeUrl = makeUrl;
function parseUrl(_url, ...argv) {
    const { urlobj, url } = (0, url_1._handleParseURL)(_url, ...argv);
    let r;
    let m;
    r = /www\.millionbook\.net\/([\w\/]+)\/(\w+)\/(?:(\d+)|index)\.html?/;
    m = r.exec(url);
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