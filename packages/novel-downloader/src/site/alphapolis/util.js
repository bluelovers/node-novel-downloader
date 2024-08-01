"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.check = check;
exports.makeUrl = makeUrl;
exports.parseUrl = parseUrl;
const tslib_1 = require("tslib");
const url_1 = tslib_1.__importStar(require("../../util/url"));
function check(url, options) {
    return /alphapolis/i.test((0, url_1.default)(url).hostname || '');
}
function makeUrl(urlobj, bool, ...argv) {
    let url;
    let cid = (!bool && urlobj.chapter_id) ? `episode\/${urlobj.chapter_id}` : '';
    url = `https://www.alphapolis.co.jp/novel/${urlobj.novel_pid}/${urlobj.novel_id}/${cid}`;
    return (0, url_1.default)(url);
}
function parseUrl(_url, ...argv) {
    const { urlobj, url } = (0, url_1._handleParseURL)(_url, ...argv);
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
//# sourceMappingURL=util.js.map