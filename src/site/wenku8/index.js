"use strict";
/**
 * Created by user on 2018/3/25/025.
 */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = require("../../util");
const index_1 = require("../index");
const base_1 = require("../demo/base");
const jsdom_url_1 = require("jsdom-url");
const jsdom_extra_1 = require("jsdom-extra");
const index_2 = require("../index");
const novel_text_1 = require("novel-text");
let NovelSiteWenku8 = class NovelSiteWenku8 extends base_1.default {
    makeUrl(urlobj, bool) {
        let url;
        if (bool < 0) {
            url = `http://www.wenku8.com/book/${urlobj.novel_id}.htm`;
        }
        else {
            let cid = (!bool && urlobj.chapter_id) ? '&cid=' + urlobj.chapter_id : '';
            url = `http://www.wenku8.com/modules/article/reader.php?aid=${urlobj.novel_id}${cid}`;
        }
        return new jsdom_url_1.URL(url);
    }
    parseUrl(url, options) {
        let urlobj = {
            url: url,
            novel_pid: null,
            novel_id: null,
            chapter_id: null,
        };
        urlobj.url = new jsdom_url_1.URL(url);
        url = urlobj.url.href;
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
        return urlobj;
    }
    createMainUrl(url) {
        let data = this.parseUrl(url);
        if (!data || !data.novel_id) {
            console.log(data);
            throw new ReferenceError();
        }
        let ret = this.makeUrl(data, true);
        return ret;
    }
    _parseChapter(ret, optionsRuntime, cache) {
        if (!ret) {
            return '';
        }
        ret.dom.$('#content').find('#contentdp').remove();
        ret.dom.$('#content').find('#contentdp').remove();
        ret.dom.$('#content').find('#contentdp').remove();
        try {
            let html = util_1.minifyHTML(ret.dom.$('#content').html());
            html = html.replace(/^(&nbsp;){4}/gm, '');
            ret.dom.$('#content').html(html);
        }
        catch (e) {
        }
        ret.dom.$('#content img[src]').each(function () {
            let src = ret.dom.$(this).prop('src').trim();
            if (src) {
                cache.chapter.imgs = cache.chapter.imgs || [];
                cache.chapter.imgs.push(src);
                cache.novel.imgs.push(src);
            }
        });
        //console.log(ret.dom.serialize());
        return ret.dom.$('#content').text();
    }
    async get_volume_list(inputUrl, optionsRuntime = {}) {
        const self = this;
        let url = await this.createMainUrl(inputUrl);
        return await jsdom_extra_1.fromURL(url, optionsRuntime.optionsJSDOM)
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
                let tr = dom.$(this);
                if (tr.is('.vcss')) {
                    currentVolume = volume_list[volume_list.length] = {
                        volume_index: volume_list.length,
                        volume_title: util_1.trim(tr.text()),
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
                    let chapter_title = util_1.trim(a.text());
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
            return Object.assign({ url: dom.url, url_data }, data_meta, { volume_list, 
                //novel_date,
                checkdate: index_2.moment().local(), imgs: [] });
        })
            .tap(function (novel) {
            console.log(novel);
        });
    }
    async _get_meta(inputUrl, optionsRuntime, cache) {
        const self = this;
        let url = this.makeUrl(this.parseUrl(inputUrl), -1);
        return jsdom_extra_1.fromURL(url, optionsRuntime.optionsJSDOM)
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
            let novel_desc = novel_text_1.default.trim(_content.find('.hottext + br + span:eq(-1)').text() || '', {
                trim: true,
            });
            let novel_status;
            let novel_date;
            let novel_publisher;
            dom.$('#content > div > table:eq(0) tr:eq(-1) > td').each(function (i, elem) {
                let t = util_1.trim(dom.$(elem).text());
                if (t.match(/(?:状态|狀態)：\s*(.+)/)) {
                    novel_status = util_1.trim(RegExp.$1);
                }
                else if (t.match(/(?:更新)：\s*(.+)/)) {
                    novel_date = util_1.trim(RegExp.$1);
                    novel_date = index_2.moment(novel_date).local();
                }
                else if (t.match(/(?:文库分类)：\s*(.+)/)) {
                    novel_publisher = util_1.trim(RegExp.$1);
                }
            });
            let url_data = self.parseUrl(url);
            return Object.assign({ url,
                url_data }, data, { novel_title,
                novel_cover,
                novel_author,
                novel_desc,
                novel_date,
                novel_status,
                novel_publisher });
        });
    }
};
NovelSiteWenku8.IDKEY = 'wenku8';
NovelSiteWenku8 = __decorate([
    index_1.staticImplements()
], NovelSiteWenku8);
exports.NovelSiteWenku8 = NovelSiteWenku8;
exports.default = NovelSiteWenku8;
