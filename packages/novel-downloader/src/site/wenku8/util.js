"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseUrl = exports.makeUrl = exports.check = void 0;
const tslib_1 = require("tslib");
const url_1 = (0, tslib_1.__importStar)(require("../../util/url"));
function check(url, options) {
    return /wenku8/i.test((0, url_1.default)(url).hostname || '');
}
exports.check = check;
function makeUrl(urlobj, bool, ...argv) {
    let url;
    if (bool < 0) {
        url = `http://www.wenku8.com/book/${urlobj.novel_id}.htm`;
    }
    else {
        let cid = (!bool && urlobj.chapter_id) ? '&cid=' + urlobj.chapter_id : '';
        url = `http://www.wenku8.com/modules/article/reader.php?aid=${urlobj.novel_id}${cid}`;
    }
    return (0, url_1.default)(url);
}
exports.makeUrl = makeUrl;
function parseUrl(_url, ...argv) {
    const { urlobj, url } = (0, url_1._handleParseURL)(_url, ...argv);
    let r;
    let m;
    r = /modules\/article\/articleinfo\.php\?id=(\d+)/;
    if (m = r.exec(url)) {
        urlobj.novel_id = m[1];
        return urlobj;
    }
    r = /modules\/article\/reader\.php\?aid=(\d+)(?:&cid=(\d+))?/;
    if (m = r.exec(url)) {
        urlobj.novel_id = m[1];
        urlobj.chapter_id = m[2];
        return urlobj;
    }
    r = /book\/(\d+)\.htm/;
    if (m = r.exec(url)) {
        urlobj.novel_id = m[1];
        return urlobj;
    }
    r = /novel\/([\d]+)\/([\d]+)\/(?:([\d]+)\.html?)?/;
    if (m = r.exec(url)) {
        urlobj.novel_pid = m[1];
        urlobj.novel_id = m[2];
        urlobj.chapter_id = m[3];
    }
    r = /^(\d+)$/;
    if (m = r.exec(url)) {
        urlobj.novel_id = m[1];
        return urlobj;
    }
    return urlobj;
}
exports.parseUrl = parseUrl;
//# sourceMappingURL=util.js.map