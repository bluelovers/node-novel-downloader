"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.check = check;
exports.makeUrl = makeUrl;
exports.parseUrl = parseUrl;
const tslib_1 = require("tslib");
const url_1 = tslib_1.__importStar(require("../../util/url"));
function check(url, options) {
    return /x23qb/i.test((0, url_1.default)(url).hostname || '');
}
function makeUrl(urlobj, bool, ...argv) {
    let url;
    let pad;
    if (!bool && urlobj.chapter_id) {
        pad = `book/${urlobj.novel_id}/${urlobj.chapter_id}.html`;
    }
    else {
        pad = `book/${urlobj.novel_id}/`;
    }
    //url = `https://www.x23qb.com/${pad}`;
    url = `https://www.23qb.com/${pad}`;
    return (0, url_1.default)(url);
}
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
//# sourceMappingURL=util.js.map