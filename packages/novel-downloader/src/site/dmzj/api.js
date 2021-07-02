"use strict";
/**
 * Created by user on 2018/3/25/025.
 */
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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
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
exports.NovelSiteTpl = void 0;
const fetch_1 = require("../../fetch");
const strip_1 = require("../../strip");
const util_1 = require("../../util");
const index_1 = require("../index");
const base_1 = __importDefault(require("../demo/base"));
const index_2 = require("../index");
const path_1 = __importDefault(require("path"));
const regexp_cjk_1 = require("regexp-cjk");
const jsdom_extra_1 = require("jsdom-extra");
const html_1 = require("../../util/html");
const util_2 = require("./util");
//import escapeStringRegexp from 'escape-string-regexp';
const crypto_1 = __importDefault(require("crypto"));
const protobuf = __importStar(require("protobufjs"));
const rsa_key = "MIICXgIBAAKBgQCvJzUdZU5yHyHrOqEViTY95gejrLAxsdLhjKYKW1QqX+vlcJ7iNrLZoWTaEHDONeyM+1qpT821JrvUeHRCpixhBKjoTnVWnofV5NiDz46iLuU25C2UcZGN3STNYbW8+e3f66HrCS5GV6rLHxuRCWrjXPkXAAU3y2+CIhY0jJU7JwIDAQABAoGBAIs/6YtoSjiSpb3Ey+I6RyRo5/PpS98GV/i3gB5Fw6E4x2uO4NJJ2GELXgm7/mMDHgBrqQVoi8uUcsoVxaBjSm25737TGCueoR/oqsY7Qy540gylp4XAe9PPbDSmhDPSJYpersVjKzDAR/b9jy3WLKjAR6j7rSrv0ooHhj3oge1RAkEA4s1ZTb+u4KPfUACL9p/4GuHtMC4s1bmjQVxPPAHTp2mdCzk3p4lRKrz7YFJOt8245dD/6c0M8o4rcHuh6AgCKQJBAMWzrZwptbihKeR7DWlxCU8BO1kH+z6yw+PgaRrTSpII2un+heJXeEGdk0Oqr7Aos0hia4zqTXY1Rie24GDHHM8CQQC7yVjy5g4u06BXxkwdBLDR2VShOupGf/Ercfns7npHuEueel6Zajn5UAY2549j4oMATf9Gn0/kGVDgTo1s6AyZAkApc6PqA0DLxlbPRhGo0v99pid4YlkGa1rxM4M2Eakn911XBHuz2l0nfM98t5QAnngArEoakKHPMBpWh1yCTh03AkEAmcOddu2RrPGQ00q6IKx+9ysPx71+ecBgHoqymHL9vHmrr3ghu4shUdDxQfz/xA2Z8m/on78hBZbnD1CNPmPOxQ==";
const key = crypto_1.default.createPrivateKey({
    key: Buffer.from(rsa_key, "base64"),
    format: "der",
    type: "pkcs1",
});
const block_size = 1024 / 8;
const root = protobuf.Root.fromJSON(require("./dmzjproto.json"));
function decrypt(key, input) {
    const block_count = input.length;
    const blocks = [];
    let i = 0;
    while (i < block_count) {
        blocks.push(input.slice(i, i += block_size));
    }
    return Buffer.concat(blocks.map(p => crypto_1.default.privateDecrypt({
        key: key,
        padding: crypto_1.default.constants.RSA_PKCS1_PADDING
    }, p)));
}
let NovelSiteTpl = class NovelSiteTpl extends base_1.default {
    static check(url, ...argv) {
        return util_2.check(url, ...argv);
    }
    static makeUrl(urlobj, bool, ...argv) {
        return util_2.makeUrl(urlobj, bool, ...argv);
    }
    static parseUrl(url, ...argv) {
        return util_2.parseUrl(url, ...argv);
    }
    makeUrl(urlobj, bool, ...argv) {
        return util_2.makeUrl(urlobj, bool, ...argv);
    }
    parseUrl(url, ...argv) {
        return util_2.parseUrl(url, ...argv);
    }
    session(optionsRuntime, url) {
        super.session(optionsRuntime, url);
        optionsRuntime.optionsJSDOM.requestOptions = optionsRuntime.optionsJSDOM.requestOptions || {};
        // @ts-ignore
        optionsRuntime.optionsJSDOM.requestOptions.contentType = 'json';
        //let url = optionsRuntime[SYMBOL_CACHE].url;
        optionsRuntime.optionsJSDOM.cookieJar;
        return this;
    }
    createMainUrl(url, optionsRuntime) {
        let data = this.parseUrl(url);
        if (!data || !data.novel_id) {
            console.log(data);
            throw new ReferenceError();
        }
        let ret = this.makeUrl(data, true, optionsRuntime);
        return ret;
    }
    _stripContent(text) {
        text = strip_1.stripContent(text);
        //process.exit();
        return text
            //.replace(/^　　/gm, '')
            .replace(/^[\uFEFF\xA0]+/gm, '')
            // 修正每行開頭多出空白的問題
            .replace(/^ +/gm, '')
            .replace(/ +$/gm, '')
            .replace(/\s+$/, '');
    }
    _saveReadme(optionsRuntime, options = {}, ...opts) {
        options[this.IDKEY] = {
            novel_id: optionsRuntime[index_1.SYMBOL_CACHE].novel.novel_id,
        };
        return super._saveReadme(optionsRuntime, options, {
        //
        }, ...opts);
    }
    async _parseChapter(ret, optionsRuntime, cache) {
        if (!ret) {
            return '';
        }
        let body_selector = 'body';
        try {
            //			let html = minifyHTML(ret.dom.$(body_selector).html());
            //
            //			//html = html.replace(/^(&nbsp;){4}/gm, '');
            //			html = html.replace(/^\s+|\s+$/g, '');
            //
            //			ret.dom.$(body_selector).html(html);
        }
        catch (e) {
        }
        let text;
        if (ret.dom) {
            text = ret.dom.$(body_selector).text();
        }
        else {
            ret.dom = jsdom_extra_1.createJSDOM(ret.body.toString());
            text = ret.dom.$(body_selector).text();
        }
        const $ = ret.dom.$;
        if (ret.dom.$('img').length) {
            /*
            cache.chapter.imgs = cache.chapter.imgs || [];

            ret.dom.$('img[src]').each(function ()
            {
                // @ts-ignore
                cache.chapter.imgs.push(ret.dom.$(this).prop('src'));
                // @ts-ignore
                cache.novel.imgs.push(ret.dom.$(this).prop('src'));
            });
             */
            html_1._saveImageToAttach(ret.dom.$, ret.dom.$('img[src]'), cache);
            if (optionsRuntime.keepImage) {
                await html_1._keepImageInContext(ret.dom.$('img[src]'), ret.dom.$);
            }
        }
        text = this._stripContent(text);
        let sp = '[\u00a0 　]*';
        let r = new regexp_cjk_1.zhRegExp(`^[\u00a0 　\\s]*${util_1.escapeRegexp(cache.volume.volume_title)}${sp}${util_1.escapeRegexp(cache.chapter.chapter_title)}${sp}`, 'ig');
        text = text
            .replace(r, '');
        return text;
    }
    async get_volume_list(inputUrl, optionsRuntime = {}) {
        const self = this;
        let url = await this.createMainUrl(inputUrl, optionsRuntime);
        // @ts-ignore
        return fetch_1.retryRequest(url, optionsRuntime.requestOptions)
            .then(async function (dom) {
            const novel_meta = await self._get_meta(url, optionsRuntime, {
                dom,
            });
            const buffer = Buffer.from(dom, "base64");
            const decrypted = decrypt(key, buffer);
            const response_type = root.lookupType("NovelChapterResponse");
            const result = response_type.decode(decrypted);
            const apiresult = result.Data.map((v) => {
                return {
                    id: v.VolumeId,
                    chapter_list: v.Chapters.map((c) => {
                        return {
                            chapter_id: c.ChapterId,
                            chapter_title: c.ChapterName,
                            chapter_index: c.ChapterOrder,
                            chapter_url: new util_2.TxturlCreator(v.VolumeId, c.ChapterId)
                        };
                    }),
                    volume_id: v.VolumeId,
                    volume_title: v.VolumeName,
                    volume_index: v.VolumeOrder
                };
            });
            novel_meta.volume_list = apiresult;
            return novel_meta;
        })
            .tap(function (novel) {
            console.dir(novel, {
                colors: true,
                //depth: 3,
            });
        });
    }
    async _get_meta(inputUrl, optionsRuntime, cache) {
        const self = this;
        let url = self.makeUrl(self.parseUrl(inputUrl), -1);
        let url_data = self.parseUrl(url);
        return fetch_1.retryRequest(url, optionsRuntime.requestOptions)
            //return fromURL(url, optionsRuntime.optionsJSDOM)
            //return Promise.resolve(cache.dom)
            .then(function (domJson) {
            const buffer = Buffer.from(domJson, "base64");
            const decrypted = decrypt(key, buffer);
            const response_type = root.lookupType("NovelDetailResponse");
            const result = response_type.decode(decrypted);
            const vol_list = [];
            // (<Array<any>>result.Data.Volume).map(v=>{
            // 	return <IVolume>{
            // 		chapter_list:[],
            // 		imgs:[],
            // 		volume_index:v.VolumeOrder,
            // 		volume_title:v.VolumeName,
            // 		id: v.VolumeId,
            // 		volume_id: v.VolumeId,
            // 	}
            // })
            return {
                url,
                url_data: util_2.parseUrl(url),
                novel_author: result.Data.Authors,
                novel_cover: result.Data.Cover,
                novel_date: index_2.moment(+result.Data.LastUpdateTime),
                novel_desc: result.Data.Introduction,
                novel_title: result.Data.Name,
                volume_list: vol_list
            };
        });
    }
};
NovelSiteTpl.IDKEY = path_1.default.basename(__dirname);
NovelSiteTpl = __decorate([
    index_1.staticImplements()
], NovelSiteTpl);
exports.NovelSiteTpl = NovelSiteTpl;
exports.default = NovelSiteTpl;
//# sourceMappingURL=api.js.map