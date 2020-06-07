"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseUrl = exports.makeUrl = exports.check = void 0;
const url_1 = __importStar(require("../../util/url"));
function check(url, options) {
    return /dmzj\.com/i.test(url_1.default(url).hostname || '');
}
exports.check = check;
function makeUrl(urlobj, bool, ...argv) {
    let url;
    if (bool === 2 && urlobj.novel_id) {
        url = `http://q.dmzj.com/${urlobj.novel_id}/index.shtml`;
    }
    else if (!bool && urlobj.volume_id && urlobj.chapter_id) {
        url = `http://v2.api.dmzj.com/novel/download/${urlobj.novel_id}_${urlobj.volume_id}_${urlobj.chapter_id}.txt`;
    }
    else if (bool === true && urlobj.novel_id) {
        url = `http://v2.api.dmzj.com/novel/chapter/${urlobj.novel_id}.json`;
    }
    else {
        url = `http://v2.api.dmzj.com/novel/${urlobj.novel_id}.json`;
    }
    return url_1.default(url);
}
exports.makeUrl = makeUrl;
function parseUrl(_url, ...argv) {
    const { urlobj, url } = url_1._handleParseURL(_url, ...argv);
    let r;
    let m;
    r = /api\.dmzj\.com\/novel\/(\d+).json/;
    if (m = r.exec(url)) {
        urlobj.novel_id = m[1];
        return urlobj;
    }
    r = /^(\d+)$/;
    if (m = r.exec(url)) {
        urlobj.novel_id = m[1];
        return urlobj;
    }
    r = /api\.dmzj\.com\/novel\/chapter\/(\d+).json/;
    if (m = r.exec(url)) {
        urlobj.novel_id = m[1];
        return urlobj;
    }
    r = /api\.dmzj\.com\/novel\/download\/(\d+)_(\d+)_(\d+).txt/;
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
    }
    return urlobj;
}
exports.parseUrl = parseUrl;
//# sourceMappingURL=util.js.map