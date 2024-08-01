"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.check = check;
exports.makeUrl = makeUrl;
exports.parseUrl = parseUrl;
const url_1 = require("../../util/url");
const txtUrlCreator_1 = require("./v4/txtUrlCreator");
function check(url, options) {
    return /dmzj\.com/i.test((0, url_1.createURL)(url).hostname || '');
}
function makeUrl(urlobj, bool, ...argv) {
    let url;
    //const api_url = 'http://v2.api.dmzj.com';
    //const api_url = 'http://nnv3api.dmzj1.com';
    //const api_url = 'http://nnv4api.muwai.com';
    const api_url = 'http://nnv4api.dmzj.com';
    if (bool === 2 && urlobj.novel_id) {
        url = `http://q.dmzj.com/${urlobj.novel_id}/index.shtml`;
    }
    else if (!bool && urlobj.volume_id && urlobj.chapter_id) {
        //url = `${api_url}/novel/download/${urlobj.novel_id}_${urlobj.volume_id}_${urlobj.chapter_id}.txt`;
        url = txtUrlCreator_1.TxtUrlCreator.newUrl(urlobj.volume_id, urlobj.chapter_id);
    }
    else if (bool === true && urlobj.novel_id) {
        url = `${api_url}/novel/chapter/${urlobj.novel_id}`;
        // url = `${api_url}/novel/chapter/${urlobj.novel_id}.json`;
    }
    else {
        url = `${api_url}/novel/detail/${urlobj.novel_id}`;
        // url = `${api_url}/novel/${urlobj.novel_id}.json`;
    }
    return (0, url_1.createURL)(url);
}
function parseUrl(_url, ...argv) {
    const { urlobj, url } = (0, url_1._handleParseURL)(_url, ...argv);
    let r;
    let m;
    r = /(?:api|nnv\dapi)\.(?:dmzj\d?|muwai)\.com\/novel\/(\d+).json/;
    if (m = r.exec(url)) {
        urlobj.novel_id = m[1];
        return urlobj;
    }
    r = /^(\d+)$/;
    if (m = r.exec(url)) {
        urlobj.novel_id = m[1];
        return urlobj;
    }
    r = /(?:api|nnv\dapi)\.(?:dmzj\d?|muwai)\.com\/novel\/chapter\/(\d+)(?:.json|\/?$)/;
    if (m = r.exec(url)) {
        urlobj.novel_id = m[1];
        return urlobj;
    }
    r = /(?:api|nnv\dapi)\.(?:dmzj\d?|muwai)\.com\/novel\/download\/(\d+)_(\d+)_(\d+).txt/;
    if (m = r.exec(url)) {
        urlobj.novel_id = m[1];
        urlobj.volume_id = m[2];
        urlobj.chapter_id = m[3];
        return urlobj;
    }
    // 手機版網址
    r = /(?:q\.dmzj\.com\/|^\/)(?:(\d+)\/(?:(\d+)\/(?:(\d+)[\._])?)?)/;
    if (m = r.exec(url)) {
        urlobj.novel_id = m[1];
        urlobj.volume_id = m[2];
        urlobj.chapter_id = m[3];
        return urlobj;
    }
    //v4
    r = /(?:api|nnv\dapi)\.(?:dmzj\d?|muwai)\.com\/novel\/detail\/(\d+)\/?$/;
    if (m = r.exec(url)) {
        urlobj.novel_id = m[1];
        return urlobj;
    }
    r = /jurisdiction.(?:dmzj\d*|muwai)\.com\/lnovel\/(\d+)_(\d+).txt/;
    if (m = r.exec(url)) {
        urlobj.volume_id = m[1];
        urlobj.chapter_id = m[2];
        return urlobj;
    }
    return urlobj;
}
//# sourceMappingURL=util.js.map