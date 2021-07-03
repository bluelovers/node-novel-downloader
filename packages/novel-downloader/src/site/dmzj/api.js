"use strict";
/**
 * Created by user on 2018/3/25/025.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.NovelSiteTpl = void 0;
const tslib_1 = require("tslib");
const fetch_1 = require("../../fetch");
const strip_1 = require("../../strip");
const util_1 = require("../../util");
const index_1 = require("../index");
const base_1 = (0, tslib_1.__importDefault)(require("../demo/base"));
//import { URL } from 'jsdom-url';
const jsdom_extra_1 = require("jsdom-extra");
const path_1 = (0, tslib_1.__importDefault)(require("path"));
const regexp_cjk_1 = require("regexp-cjk");
const html_1 = require("../../util/html");
const util_2 = require("./util");
//import escapeStringRegexp from 'escape-string-regexp';
const txtUrlCreator_1 = require("./v4/txtUrlCreator");
const protobuf_1 = require("./protobuf/protobuf");
const v4_1 = require("./v4/v4");
let NovelSiteTpl = class NovelSiteTpl extends base_1.default {
    static check(url, ...argv) {
        return (0, util_2.check)(url, ...argv);
    }
    static makeUrl(urlobj, bool, ...argv) {
        return (0, util_2.makeUrl)(urlobj, bool, ...argv);
    }
    static parseUrl(url, ...argv) {
        return (0, util_2.parseUrl)(url, ...argv);
    }
    makeUrl(urlobj, bool, ...argv) {
        return (0, util_2.makeUrl)(urlobj, bool, ...argv);
    }
    parseUrl(url, ...argv) {
        return (0, util_2.parseUrl)(url, ...argv);
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
            console.dir(data, {
                depth: null,
            });
            throw new ReferenceError();
        }
        let ret = this.makeUrl(data, true, optionsRuntime);
        return ret;
    }
    _stripContent(text) {
        text = (0, strip_1.stripContent)(text);
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
            ret.dom = (0, jsdom_extra_1.createJSDOM)(ret.body.toString());
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
            (0, html_1._saveImageToAttach)(ret.dom.$, ret.dom.$('img[src]'), cache);
            if (optionsRuntime.keepImage) {
                await (0, html_1._keepImageInContext)(ret.dom.$('img[src]'), ret.dom.$);
            }
        }
        text = this._stripContent(text);
        let sp = '[\u00a0 　]*';
        let r = new regexp_cjk_1.zhRegExp(`^[\u00a0 　\\s]*${(0, util_1.escapeRegexp)(cache.volume.volume_title)}${sp}${(0, util_1.escapeRegexp)(cache.chapter.chapter_title)}${sp}`, 'ig');
        text = text
            .replace(r, '');
        return text;
    }
    async get_volume_list(inputUrl, optionsRuntime = {}) {
        const self = this;
        let url = await this.createMainUrl(inputUrl, optionsRuntime);
        // @ts-ignore
        return (0, fetch_1.retryRequest)(url, optionsRuntime.requestOptions)
            .then(async function (dom) {
            const novel_meta = await self._get_meta(url, optionsRuntime, {
                dom,
            });
            const decrypted = (0, v4_1.decryptBase64V4)(dom);
            const result = (0, protobuf_1.lookupTypeNovelChapterResponse)().decode(decrypted);
            const apiresult = result.Data.map((v) => {
                return {
                    id: v.VolumeId,
                    chapter_list: v.Chapters.map((c) => {
                        return {
                            chapter_id: c.ChapterId,
                            chapter_title: c.ChapterName,
                            chapter_index: c.ChapterOrder,
                            chapter_url: new txtUrlCreator_1.TxtUrlCreator(v.VolumeId, c.ChapterId)
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
        return (0, fetch_1.retryRequest)(url, optionsRuntime.requestOptions)
            //return fromURL(url, optionsRuntime.optionsJSDOM)
            //return Promise.resolve(cache.dom)
            .then(function (domJson) {
            const decrypted = (0, v4_1.decryptBase64V4)(domJson);
            const result = (0, protobuf_1.lookupTypeNovelDetailResponse)().decode(decrypted);
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
                url_data: (0, util_2.parseUrl)(url),
                novel_author: result.Data.Authors,
                novel_cover: result.Data.Cover,
                novel_date: (0, index_1.moment)(+result.Data.LastUpdateTime),
                novel_desc: result.Data.Introduction,
                novel_title: result.Data.Name,
                volume_list: vol_list
            };
        });
    }
};
NovelSiteTpl.IDKEY = path_1.default.basename(__dirname);
NovelSiteTpl = (0, tslib_1.__decorate)([
    (0, index_1.staticImplements)()
], NovelSiteTpl);
exports.NovelSiteTpl = NovelSiteTpl;
exports.default = NovelSiteTpl;
//# sourceMappingURL=api.js.map