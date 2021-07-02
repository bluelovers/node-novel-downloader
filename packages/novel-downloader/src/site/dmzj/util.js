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
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseUrl = exports.makeUrl = exports.check = exports.TxturlCreator = void 0;
const url_1 = __importStar(require("../../util/url"));
const crypto_1 = __importDefault(require("crypto"));
const txt_key = "IBAAKCAQEAsUAdKtXNt8cdrcTXLsaFKj9bSK1nEOAROGn2KJXlEVekcPssKUxSN8dsfba51kmHM";
class TxturlCreator {
    constructor(volid, chapterid) {
        this.volid = volid;
        this.chapterid = chapterid;
    }
    toString() {
        const path = `/lnovel/${this.volid}_${this.chapterid}.txt`;
        const ts = Math.floor(+new Date() / 1000);
        const sign_text = `${txt_key}${path}${ts}`;
        const sign = crypto_1.default.createHash("md5").update(sign_text).digest("hex").toLowerCase();
        return "http://jurisdiction.muwai.com" + path + `?t=${ts}&k=${sign}`;
    }
}
exports.TxturlCreator = TxturlCreator;
function check(url, options) {
    return /dmzj\.com/i.test(url_1.default(url).hostname || '');
}
exports.check = check;
function makeUrl(urlobj, bool, ...argv) {
    let url;
    //const api_url = 'http://v2.api.dmzj.com';
    const api_url = 'http://nnv4api.muwai.com';
    if (bool === 2 && urlobj.novel_id) {
        url = `http://q.dmzj.com/${urlobj.novel_id}/index.shtml`;
    }
    else if (!bool && urlobj.volume_id && urlobj.chapter_id) {
        const path = `/lnovel/${urlobj.volume_id}_${urlobj.chapter_id}.txt`;
        const ts = Math.floor(+new Date() / 1000);
        const sign_text = `${txt_key}${path}${ts}`;
        const sign = crypto_1.default.createHash("md5").update(sign_text).digest("hex").toLowerCase();
        url = "http://jurisdiction.muwai.com" + path + `?t=${ts}&k=${sign}`;
    }
    else if (bool === true && urlobj.novel_id) {
        url = `${api_url}/novel/chapter/${urlobj.novel_id}`;
    }
    else {
        url = `${api_url}/novel/detail/${urlobj.novel_id}`;
    }
    return url_1.default(url);
}
exports.makeUrl = makeUrl;
function parseUrl(_url, ...argv) {
    const { urlobj, url } = url_1._handleParseURL(_url, ...argv);
    let r;
    let m;
    r = /(?:api\.dmzj\.com|nnv3api\.dmzj\d\.com)\/novel\/(\d+).json/;
    if (m = r.exec(url)) {
        urlobj.novel_id = m[1];
        return urlobj;
    }
    r = /^(\d+)$/;
    if (m = r.exec(url)) {
        urlobj.novel_id = m[1];
        return urlobj;
    }
    r = /(?:api\.dmzj\.com|nnv3api\.dmzj\d\.com)\/novel\/chapter\/(\d+).json/;
    if (m = r.exec(url)) {
        urlobj.novel_id = m[1];
        return urlobj;
    }
    r = /(?:api\.dmzj\.com|nnv3api\.dmzj\d\.com)\/novel\/download\/(\d+)_(\d+)_(\d+).txt/;
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
    r = /^.*api\.(?:dmzj\d*|muwai)\.com\/novel\/detail\/(\d+)\/?$/;
    if (m = r.exec(url)) {
        urlobj.novel_id = m[1];
        return urlobj;
    }
    r = /^.*api\.(?:dmzj\d*|muwai)\.com\/novel\/chapter\/(\d+)\/?$/;
    if (m = r.exec(url)) {
        urlobj.novel_id = m[1];
        return urlobj;
    }
    r = /^jurisdiction.(?:dmzj\d*|muwai)\.com\/lnovel\/(\d+)_(\d+).txt/;
    if (m = r.exec(url)) {
        urlobj.volume_id = m[2];
        urlobj.chapter_id = m[3];
        return urlobj;
    }
}
exports.parseUrl = parseUrl;
//# sourceMappingURL=util.js.map