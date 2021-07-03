"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseUrl = exports.makeUrl = exports.check = void 0;
const tslib_1 = require("tslib");
const url_1 = (0, tslib_1.__importStar)(require("../../util/url"));
function check(url, options) {
    return /x23qb/i.test((0, url_1.default)(url).hostname || '');
}
exports.check = check;
function makeUrl(urlobj, bool, ...argv) {
    let url;
    let pad;
    if (!bool && urlobj.chapter_id) {
        pad = `book/${urlobj.novel_id}/${urlobj.chapter_id}.html`;
    }
    else {
        pad = `book/${urlobj.novel_id}/`;
    }
    url = `https://www.x23qb.com/${pad}`;
    return (0, url_1.default)(url);
}
exports.makeUrl = makeUrl;
function parseUrl(_url, ...argv) {
    const { urlobj, url } = (0, url_1._handleParseURL)(_url, ...argv);
    let r;
    let m;
    r = /^(\d+)$/;
    if (m = r.exec(url)) {
        urlobj.novel_id = m[1];
        return urlobj;
    }
    r = /book\/(\d+)(?:\/(\d+).html|\/?)/g;
    if (m = r.exec(url)) {
        urlobj.novel_id = m[1];
        urlobj.chapter_id = m[2];
        return urlobj;
    }
    return urlobj;
}
exports.parseUrl = parseUrl;
//# sourceMappingURL=util.js.map