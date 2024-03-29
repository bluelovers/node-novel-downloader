"use strict";
/**
 * Created by user on 2018/3/25/025.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.NovelSiteSfacg = void 0;
const tslib_1 = require("tslib");
const util_1 = require("../../util");
const index_1 = require("../index");
const base_1 = tslib_1.__importDefault(require("../demo/base"));
//import { URL } from 'jsdom-url';
const jsdom_extra_1 = require("jsdom-extra");
const index_2 = require("../index");
const layout_1 = tslib_1.__importDefault(require("@node-novel/layout"));
const util_2 = require("./util");
let NovelSiteSfacg = class NovelSiteSfacg extends base_1.default {
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
    _parseChapter(ret, optionsRuntime, cache) {
        if (!ret) {
            return '';
        }
        try {
            let html = (0, util_1.minifyHTML)(ret.dom.$('#ChapterBody').html());
            //html = html.replace(/^(&nbsp;){4}/gm, '');
            html = html.replace(/^\s+|\s+$/g, '');
            ret.dom.$('#ChapterBody').html(html);
        }
        catch (e) {
        }
        ret.dom.$('#ChapterBody').html(function (i, old) {
            return old.replace(/(<\/p>)[ \t]*(<p>)/g, '$1\n$2');
        });
        /*
        ret.dom.$('#ChapterBody p').text(function (i, old)
        {
            return old + "\n";
        });
        */
        ret.dom.$('#ChapterBody img[src]').each(function () {
            // @ts-ignore
            let src = ret.dom.$(this).prop('src').trim();
            if (src) {
                cache.chapter.imgs = cache.chapter.imgs || [];
                cache.chapter.imgs.push(src);
                cache.novel.imgs.push(src);
            }
        });
        let text = ret.dom.$('#ChapterBody').text();
        if (cache.chapter.chapter_vip) {
            text = `付費章节\n\n==========================\n\n${text}`;
        }
        try {
            let chapter_date;
            let d = ret.dom.$('#"article .article-desc .text:eq(1)')
                .text()
                .replace(/^.+：/g, '')
                .trim();
            chapter_date = (0, index_2.moment)(d, 'YYYY/MM/DD HH:mm:ss').local();
            cache.chapter.chapter_date = chapter_date;
        }
        catch (e) { }
        return text;
    }
    async get_volume_list(inputUrl, optionsRuntime = {}) {
        const self = this;
        let url = await this.createMainUrl(inputUrl, optionsRuntime);
        return (0, jsdom_extra_1.fromURL)(url, optionsRuntime.optionsJSDOM)
            .then(async function (dom) {
            const $ = dom.$;
            let url_data = self.parseUrl(dom.url.href);
            let data_meta = await self._get_meta(url, optionsRuntime);
            let _cache_dates = [];
            let volume_list = [];
            let currentVolume;
            let novel_vip = 0;
            let table = $('.s-list .story-catalog > div');
            table
                .each(function (index) {
                // @ts-ignore
                let tr = dom.$(this);
                if (tr.is('.catalog-hd')) {
                    currentVolume = volume_list[volume_list.length] = {
                        volume_index: volume_list.length,
                        volume_title: layout_1.default.trim(tr.find('.catalog-title').text()),
                        chapter_list: [],
                    };
                }
                else if (tr.is('.catalog-list')) {
                    tr.find('ul > li > a')
                        .each(function (index) {
                        // @ts-ignore
                        let a = dom.$(this);
                        let href = a.prop('href');
                        let data = self.parseUrl(href);
                        if (!data.chapter_id || !data.chapter_vip && !data.novel_pid) {
                            //console.log(href, data);
                            throw new Error();
                        }
                        else {
                            href = self.makeUrl(data);
                            data.url = href;
                        }
                        let chapter_vip = a.find('.icn_vip').length;
                        if (chapter_vip) {
                            novel_vip++;
                        }
                        a
                            .find('.icn, .icn_vip')
                            .remove();
                        let chapter_title = (0, util_1.trim)(a.text());
                        if (chapter_title === '') {
                            return;
                        }
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
                            chapter_vip,
                        });
                    });
                }
            });
            let novel_date;
            if (_cache_dates.length) {
                _cache_dates.sort();
                novel_date = index_2.moment.unix(_cache_dates[_cache_dates.length - 1]).local();
            }
            if (novel_vip) {
                data_meta.novel = data_meta.novel || {};
                data_meta.novel.tags = data_meta.novel.tags || [];
                data_meta.novel.tags.push('VIP');
            }
            return {
                url: dom.url,
                url_data,
                ...data_meta,
                novel_vip,
                volume_list,
                //novel_date,
                checkdate: (0, index_2.moment)().local(),
                imgs: [],
            };
        })
            .tap(function (novel) {
            console.log(novel);
        });
    }
    async _get_meta(inputUrl, optionsRuntime) {
        const self = this;
        let url = this.makeUrl(this.parseUrl(inputUrl), -1);
        return (0, jsdom_extra_1.fromURL)(url, optionsRuntime.optionsJSDOM)
            .then(function (dom) {
            const $ = dom.$;
            let data = {};
            data.novel = {};
            let novel_author = $('.author-info .author-name span')
                .text()
                .trim();
            let novel_desc = $('.summary-content .introduce')
                .text()
                .trim();
            data.novel.status = $('.count-detail .text:eq(1)')
                .text()
                .replace(/^.+\[(.+)\].*$/g, '$1');
            data.novel.tags = [];
            {
                let t = $('.count-detail .text:eq(0)')
                    .text()
                    .replace(/^.+：/g, '')
                    .trim();
                if (t) {
                    data.novel.tags.push(t);
                }
            }
            $('.main-part .tag-list .tag .text')
                .each(function () {
                // @ts-ignore
                let t = (0, util_1.trim)($(this)
                    .text()
                    .replace(/\(\d+\)/g, ''));
                if (t) {
                    data.novel.tags.push(t);
                }
            });
            let novel_date;
            {
                let d = $('.count-detail .text:last')
                    .text()
                    .replace(/更新：/, '')
                    .trim();
                //console.log(d);
                novel_date = (0, index_2.moment)(d, 'YYYY/MM/DD HH:mm:ss').local();
            }
            let novel_title = (0, util_1.trim)($('.summary-content .title .text').text());
            let url_data = self.parseUrl(url);
            $(`.d-summary .summary-pic img[src], #hasTicket .left-part a[href*="${url_data.novel_id}"] img[src]`).each(function () {
                // @ts-ignore
                let src = $(this).prop('src');
                if (src) {
                    data.novel.cover = src;
                }
            });
            return {
                url,
                url_data,
                ...data,
                novel_title,
                novel_author,
                novel_desc,
                novel_date,
            };
        });
    }
};
exports.NovelSiteSfacg = NovelSiteSfacg;
NovelSiteSfacg.IDKEY = 'sfacg';
exports.NovelSiteSfacg = NovelSiteSfacg = tslib_1.__decorate([
    (0, index_1.staticImplements)()
], NovelSiteSfacg);
exports.default = NovelSiteSfacg;
//# sourceMappingURL=index.js.map