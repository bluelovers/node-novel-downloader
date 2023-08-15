"use strict";
/**
 * Created by user on 2018/3/25/025.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.NovelSiteHetubook = void 0;
const tslib_1 = require("tslib");
const strip_1 = require("../../strip");
const util_1 = require("../../util");
const index_1 = require("../index");
const base_1 = tslib_1.__importDefault(require("../demo/base"));
//import { URL } from 'jsdom-url';
const jsdom_extra_1 = require("jsdom-extra");
const index_2 = require("../index");
const layout_1 = tslib_1.__importDefault(require("@node-novel/layout"));
const path_1 = tslib_1.__importDefault(require("path"));
const { Script } = require("vm");
const util_2 = require("./util");
let NovelSiteHetubook = class NovelSiteHetubook extends base_1.default {
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
        text = (0, strip_1.stripContent)(text);
        //process.exit();
        return text
            .replace(/^　　/gm, '')
            .replace(/^[ \uFEFF\xA0]+/gm, '');
    }
    session(optionsRuntime, url) {
        super.session(optionsRuntime, url);
        Object.assign(optionsRuntime.optionsJSDOM, {
            minifyHTML: false,
            runScripts: 'dangerously',
            pretendToBeVisual: true,
            resources: "usable",
        });
        return this;
    }
    _parseChapter(ret, optionsRuntime, cache) {
        if (!ret) {
            return '';
        }
        let body_selector = '#content';
        ret.dom.$(body_selector).find('h2').remove();
        ret.dom.$(body_selector).html(function (i, old) {
            return old
                .replace(/(<\/div>)/ig, '$1\n');
        });
        let text = ret.dom.$(body_selector).text();
        text = this._stripContent(text);
        return text;
    }
    async get_volume_list(inputUrl, optionsRuntime = {}) {
        const self = this;
        let url = await this.createMainUrl(inputUrl, optionsRuntime);
        return (0, jsdom_extra_1.fromURL)(url, optionsRuntime.optionsJSDOM)
            .then(async function (dom) {
            const $ = dom.$;
            let url_data = self.parseUrl(dom.url.href);
            let data_meta = await self._get_meta(url, optionsRuntime, {
                dom,
            });
            let _cache_dates = [];
            let volume_list = [];
            let currentVolume;
            let novel_vip = 0;
            let table = $('#dir').find('dt, dd');
            table
                .each(function (index) {
                // @ts-ignore
                let tr = dom.$(this);
                if (tr.is('dt')) {
                    currentVolume = volume_list[volume_list.length] = {
                        volume_index: volume_list.length,
                        volume_title: layout_1.default.trim(tr.text()),
                        chapter_list: [],
                    };
                }
                if (tr.is('dd, dt:has(a)')) {
                    tr.find('a:eq(0)')
                        .each(function (index) {
                        // @ts-ignore
                        let a = dom.$(this);
                        let href = a.prop('href');
                        let data = self.parseUrl(href);
                        if (!data.chapter_id) {
                            //console.log(href, data);
                            throw new Error();
                        }
                        else {
                            href = self.makeUrl(data);
                            data.url = href;
                        }
                        let chapter_title = (0, util_1.trim)(a.text());
                        if (!chapter_title) {
                            console.log(href);
                            console.log(a);
                            throw new Error();
                        }
                        currentVolume
                            .chapter_list
                            .push({
                            chapter_index: currentVolume.chapter_list.length,
                            chapter_title,
                            chapter_id: data.chapter_id,
                            chapter_url: href,
                            chapter_url_data: data,
                        });
                    });
                }
            });
            let novel_date;
            if (_cache_dates.length) {
                _cache_dates.sort();
                novel_date = index_2.moment.unix(_cache_dates[_cache_dates.length - 1]).local();
            }
            return {
                url: dom.url,
                url_data,
                ...data_meta,
                volume_list,
                //novel_date,
                checkdate: (0, index_2.moment)().local(),
                imgs: [],
            };
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
        let url = this.makeUrl(this.parseUrl(inputUrl), -1);
        //return fromURL(url, optionsRuntime.optionsJSDOM)
        return Promise.resolve(cache.dom)
            .then(function (dom) {
            const $ = dom.$;
            let data = {};
            data.novel = {};
            let novel_author = (0, util_1.trim)($('.book_info a[href*="/author/"]').text());
            $('.jieshao_content h3:eq(0)').html(function (i, old) {
                return old.replace(/(<br\/?>)/ig, '$1\n');
            });
            let novel_desc = $('.book_info .intro')
                .text()
                .trim();
            if ($('.book_info.finish').length) {
                data.novel.status = '已完結';
            }
            let novel_title = (0, util_1.trim)($('.book_info > img[alt]').attr('alt'));
            let url_data = self.parseUrl(url);
            data.novel.cover = $(`.book_info > img`).prop('src');
            data.novel.tags = [];
            data.novel.tags.push($('.title a:eq(1)').text());
            $('.tag dd .button')
                .each(function () {
                // @ts-ignore
                data.novel.tags.push($(this).text());
            });
            return {
                url,
                url_data,
                ...data,
                novel_title,
                novel_author,
                novel_desc,
            };
        });
    }
};
exports.NovelSiteHetubook = NovelSiteHetubook;
NovelSiteHetubook.IDKEY = path_1.default.basename(__dirname);
exports.NovelSiteHetubook = NovelSiteHetubook = tslib_1.__decorate([
    (0, index_1.staticImplements)()
], NovelSiteHetubook);
exports.default = NovelSiteHetubook;
//# sourceMappingURL=index.js.map