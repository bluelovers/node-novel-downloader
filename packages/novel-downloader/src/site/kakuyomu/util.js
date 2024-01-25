"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseUrl = exports.makeUrl = exports.check = void 0;
const url_1 = require("../../util/url");
function check(url, options) {
    return /kakuyomu\.jp/i.test((0, url_1.createURL)(url).hostname || '');
}
exports.check = check;
function makeUrl(urlobj, bool, ...argv) {
    let pad = (!bool && urlobj.chapter_id) ? '/episodes/' + urlobj.chapter_id : '';
    let url = `https://kakuyomu.jp/works/${urlobj.novel_id}${pad}`;
    return (0, url_1.createURL)(url);
}
exports.makeUrl = makeUrl;
function parseUrl(_url, ...argv) {
    const { urlobj, url } = (0, url_1._handleParseURL)(_url, ...argv);
    let r;
    let m;
    r = /^(\d{10,})$/;
    if (m = r.exec(url)) {
        urlobj.novel_id = m[1];
        return urlobj;
    }
    r = /kakuyomu\.jp\/works\/(\d+)(?:\/(?:episodes\/(\d+)))?/g;
    if (m = r.exec(url)) {
        urlobj.novel_id = m[1];
        urlobj.chapter_id = m[2];
        return urlobj;
    }
    return urlobj;
}
exports.parseUrl = parseUrl;
//# sourceMappingURL=util.js.map