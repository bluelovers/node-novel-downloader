"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseUrl = exports.makeUrl = exports.check = void 0;
const tslib_1 = require("tslib");
const url_1 = tslib_1.__importStar(require("../../util/url"));
function check(url, options) {
    return /book\.sfacg/i.test((0, url_1.default)(url).hostname || '');
}
exports.check = check;
function makeUrl(urlobj, bool, ...argv) {
    let url;
    if (bool < 0) {
        url = `http://book.sfacg.com/Novel/${urlobj.novel_id}/`;
    }
    else if (urlobj.chapter_vip && urlobj.chapter_id) {
        url = `http://book.sfacg.com/vip/c/${urlobj.chapter_id}/`;
    }
    else {
        let cid = (!bool && urlobj.chapter_id) ? [urlobj.novel_pid, urlobj.chapter_id].join('/') : 'MainIndex';
        url = `http://book.sfacg.com/Novel/${urlobj.novel_id}/${cid}/`;
    }
    return (0, url_1.default)(url);
}
exports.makeUrl = makeUrl;
function parseUrl(_url, ...argv) {
    const { urlobj, url } = (0, url_1._handleParseURL)(_url, ...argv);
    let r;
    let m;
    r = /book\.sfacg\.com\/Novel\/(\d+)\/(?:(\d+)\/(\d+))/;
    m = r.exec(url);
    if (m) {
        urlobj.novel_pid = m[2];
        urlobj.novel_id = m[1];
        urlobj.chapter_id = m[3];
        return urlobj;
    }
    r = /book\.sfacg\.com\/Novel\/(\d+)\/(?:MainIndex)?/;
    if (m = r.exec(url)) {
        urlobj.novel_id = m[1];
        return urlobj;
    }
    r = /book\.sfacg\.com\/vip\/c\/(\d+)/;
    if (m = r.exec(url)) {
        urlobj.chapter_id = m[1];
        urlobj.chapter_vip = true;
        return urlobj;
    }
    return urlobj;
}
exports.parseUrl = parseUrl;
//# sourceMappingURL=util.js.map