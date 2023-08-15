"use strict";
/**
 * Created by user on 2018/3/25/025.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.NovelSiteWenku8 = void 0;
const tslib_1 = require("tslib");
const util_1 = require("../../util");
const index_1 = require("../index");
const base_1 = tslib_1.__importDefault(require("../demo/base"));
//import { URL } from 'jsdom-url';
const jsdom_extra_1 = require("jsdom-extra");
const index_2 = require("../index");
const layout_1 = tslib_1.__importDefault(require("@node-novel/layout"));
const const_1 = require("node-novel-info/lib/const");
const html_1 = require("../../util/html");
const util_2 = require("./util");
let NovelSiteWenku8 = class NovelSiteWenku8 extends base_1.default {
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
    async _parseChapter(ret, optionsRuntime, cache) {
        if (!ret) {
            return '';
        }
        const $ = ret.dom.$;
        {
            let c = ret.dom.$('#content');
            c.find('#contentdp').remove();
            c.find('#contentdp').remove();
            c.find('#contentdp').remove();
        }
        try {
            let html = (0, util_1.minifyHTML)(ret.dom.$('#content').html());
            html = html.replace(/^(&nbsp;){4}/gm, '');
            ret.dom.$('#content').html(html);
        }
        catch (e) {
        }
        /*
        ret.dom.$('#content img[src]').each(function ()
        {
            // @ts-ignore
            let src = ret.dom.$(this).prop('src').trim();

            if (src)
            {
                cache.chapter.imgs = cache.chapter.imgs || [];

                cache.chapter.imgs.push(src);
                cache.novel.imgs.push(src);
            }
        });
         */
        (0, html_1._saveImageToAttach)(ret.dom.$, ret.dom.$('#content img[src]'), cache);
        if (optionsRuntime.keepImage) {
            await (0, html_1._keepImageInContext)(ret.dom.$('#content img[src]'), $, {
                append: '\n',
            });
        }
        //console.log(ret.dom.serialize());
        return ret.dom.$('#content').text();
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
            let table = $('body > #info').siblings('table').eq(0);
            table
                .find('td.vcss, td.ccss')
                .each(function (index) {
                // @ts-ignore
                let tr = dom.$(this);
                if (tr.is('.vcss')) {
                    currentVolume = volume_list[volume_list.length] = {
                        volume_index: volume_list.length,
                        volume_title: (0, util_1.trim)(tr.text()),
                        chapter_list: [],
                    };
                }
                else if (tr.is('.ccss')) {
                    let a = tr.find('a').eq(0);
                    if (!a.length) {
                        return;
                    }
                    let href = a.prop('href');
                    let data = self.parseUrl(href);
                    if (!data.chapter_id) {
                        throw new Error();
                    }
                    else {
                        href = self.makeUrl(data);
                        data.url = href;
                    }
                    let chapter_title = (0, util_1.trim)(a.text());
                    currentVolume
                        .chapter_list
                        .push({
                        chapter_index: currentVolume.chapter_list.length,
                        chapter_title,
                        chapter_id: data.chapter_id,
                        chapter_url: href,
                        chapter_url_data: data,
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
            console.log(novel);
        });
    }
    async _get_meta(inputUrl, optionsRuntime, cache) {
        const self = this;
        let url = this.makeUrl(this.parseUrl(inputUrl), -1);
        return (0, jsdom_extra_1.fromURL)(url, optionsRuntime.optionsJSDOM)
            .then(function (dom) {
            const $ = dom.$;
            let data = {};
            data.novel = {};
            let novel_title = cache.dom.$('body > #title').text().trim();
            let novel_author = cache.dom.$('#info')
                .text()
                .replace(/^.+：/g, '')
                .trim();
            let _content = dom.$('#content > div > table:eq(1)');
            let novel_cover = _content.find('img:eq(0)').prop('src');
            let novel_desc = layout_1.default.trim(_content.find('.hottext + br + span:eq(-1)').text() || '', {
                trim: true,
            });
            let novel_status;
            let novel_date;
            let novel_publisher;
            dom.$('#content > div > table:eq(0) tr:eq(-1) > td').each(function (i, elem) {
                let t = (0, util_1.trim)(dom.$(elem).text());
                if (t.match(/(?:状态|狀態)：\s*(.+)/)) {
                    novel_status = (0, util_1.trim)(RegExp.$1);
                }
                else if (t.match(/(?:更新)：\s*(.+)/)) {
                    novel_date = (0, util_1.trim)(RegExp.$1);
                    novel_date = (0, index_2.moment)(novel_date).local();
                }
                else if (t.match(/(?:文库分类)：\s*(.+)/)) {
                    novel_publisher = (0, util_1.trim)(RegExp.$1);
                }
            });
            let url_data = self.parseUrl(url);
            return {
                url,
                url_data,
                ...data,
                novel_title,
                novel_cover,
                novel_author,
                novel_desc,
                novel_date,
                novel_status,
                novel_publisher,
            };
        });
    }
    _handleDataForStringify(...argv) {
        let mdconf = super._handleDataForStringify(...argv);
        if (mdconf.novel) {
            mdconf.novel.novel_status = (mdconf.novel.novel_status | 0) | const_1.EnumNovelStatus.P_BOOK;
        }
        return mdconf;
    }
};
exports.NovelSiteWenku8 = NovelSiteWenku8;
NovelSiteWenku8.IDKEY = 'wenku8';
exports.NovelSiteWenku8 = NovelSiteWenku8 = tslib_1.__decorate([
    (0, index_1.staticImplements)()
], NovelSiteWenku8);
exports.default = NovelSiteWenku8;
//# sourceMappingURL=index.js.map