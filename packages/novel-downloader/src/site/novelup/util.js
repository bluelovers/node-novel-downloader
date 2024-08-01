"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.check = check;
exports.makeUrl = makeUrl;
exports.parseUrl = parseUrl;
const url_1 = require("../../util/url");
function check(url, options) {
    return /novelup/i.test((0, url_1.createURL)(url).hostname || '');
}
function makeUrl(urlobj, bool, ...argv) {
    let pad;
    pad = `story/${urlobj.novel_id}`;
    if (!bool && urlobj.chapter_id) {
        pad += `/${urlobj.chapter_id}`;
    }
    let url = `https://novelup.plus/${pad}`;
    return (0, url_1.createURL)(url);
}
function parseUrl(_url, ...argv) {
    const { urlobj, url } = (0, url_1._handleParseURL)(_url, ...argv);
    let r;
    let m;
    r = /^(\d{6,})$/;
    if (m = r.exec(url)) {
        urlobj.novel_id = m[1];
        return urlobj;
    }
    r = /novelup\.plus\/story\/(\d+)(?:\/(\d+))?/g;
    if (m = r.exec(url)) {
        urlobj.novel_id = m[1];
        urlobj.chapter_id = m[2];
        return urlobj;
    }
    return urlobj;
}
//# sourceMappingURL=util.js.map