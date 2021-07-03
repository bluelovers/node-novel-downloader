"use strict";
/**
 * Created by user on 2018/3/17/017.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.NovelSiteESJZone = void 0;
const tslib_1 = require("tslib");
const util_1 = require("../../util");
const tree_1 = (0, tslib_1.__importDefault)(require("../demo/tree"));
const jsdom_extra_1 = require("jsdom-extra");
//import { URL } from 'jsdom-url';
const index_1 = require("../index");
const index_2 = require("../index");
const util_2 = require("./util");
let NovelSiteESJZone = class NovelSiteESJZone extends tree_1.default {
    /*
    protected _fixOptionsRuntime(optionsRuntime)
    {
        optionsRuntime.optionsJSDOM = optionsRuntime.optionsJSDOM || {};

        //optionsRuntime.optionsJSDOM.runScripts = 'dangerously';

        return super._fixOptionsRuntime(optionsRuntime)
    }
     */
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
    async _decodeChapter(ret, optionsRuntime, cache) {
        const { dom } = ret;
        const { $ } = dom;
    }
    async _parseChapter(ret, optionsRuntime, cache) {
        if (!ret) {
            return '';
        }
        const $ = ret.dom.$;
        let section_episode = $('#section_episode');
        try {
            //let html = minifyHTML(section_episode.html());
            //section_episode.html(html);
        }
        catch (e) {
        }
        let elem = section_episode.find('.content > p');
        let txt = (await elem
            .text())
            //.replace(/\x20/g, '\n')
            .replace(/^\n+|\s+$/g, '');
        //		let html = elem.html();
        /*
        let html = elem.html();

        throw console.dir({
            html,
            txt,
        });
         */
        //		console.dir(html);
        //
        //		console.dir(txt);
        //		console.dir(txt);
        //
        //		process.exit();
        return txt;
    }
    getOutputDir(options, novelName) {
        let ret = super.getOutputDir(options, novelName);
        ret[1].optionsJSDOM.minifyHTML = false;
        return ret;
    }
    async get_volume_list(url, optionsRuntime = {}) {
        const self = this;
        url = await this.createMainUrl(url, optionsRuntime);
        return (0, jsdom_extra_1.fromURL)(url, optionsRuntime.optionsJSDOM)
            .then(async function (dom) {
            const $ = dom.$;
            let data_meta = {
                novel: {},
            };
            let section_works_info = $('#section_works_info');
            let novel_title = (0, util_1.trim)(section_works_info.find('.novel_title').text());
            let novel_publisher = self.IDKEY;
            let url_data = self.parseUrl(dom.url.href);
            let novel_author = (0, util_1.trim)(section_works_info.find('.novel_author').text());
            let novel_date;
            const novelTree = optionsRuntime.novelTree;
            let currentVolume;
            let _cache_dates = [];
            let total_idx = 0;
            {
                let volume_title = 'null';
                let volume_level = null;
                currentVolume = novelTree.addVolume({
                    volume_title,
                    volume_level,
                    volume_index: novelTree.root().size(),
                    total_idx: total_idx++,
                });
            }
            let table = $('#section_episode .episode_list ul:eq(0) > li');
            table
                .each(function (index, elem) {
                let tr = $(elem);
                if (tr.is('.chapter')) {
                    let volume_title = (0, util_1.trim)(tr.text());
                    if (volume_title != currentVolume.content.volume_title) {
                        currentVolume = novelTree.addVolume({
                            volume_title,
                            volume_index: novelTree.root().size(),
                            total_idx: total_idx++,
                        });
                    }
                }
                else {
                    let a = tr.find('.episode_link a');
                    let chapter_title = (0, util_1.trim)(a.text(), true);
                    let href = a.prop('href');
                    let data = self.parseUrl(href);
                    if (!data.chapter_id) {
                        return;
                    }
                    else {
                        href = self.makeUrl(data);
                        data.url = href;
                    }
                    let chapter = {
                        chapter_title,
                        chapter_id: data.chapter_id,
                        chapter_url: href,
                        chapter_url_data: data,
                        chapter_index: currentVolume.size(),
                        total_idx: total_idx++,
                    };
                    novelTree.addChapter(chapter, currentVolume);
                }
            });
            data_meta.novel.cover = section_works_info.find('.novel_cover img').prop('src');
            let novel_desc = (0, util_1.trim)(section_works_info.find('.novel_synopsis').text());
            data_meta.novel.tags = data_meta.novel.tags || [];
            $('#section_episode .info_table dd')
                .find(`a[href*="[tag]"], a[href*="genre[1]"]`)
                .each((i, elem) => {
                data_meta.novel.tags.push((0, util_1.trim)($(elem).text()));
            });
            return {
                ...data_meta,
                url: dom.url,
                url_data,
                novel_author,
                novel_date,
                novel_desc,
                novel_title,
                novel_publisher,
                //volume_list,
                novelTree,
                checkdate: (0, index_2.moment)().local(),
                imgs: [],
            };
        });
    }
};
NovelSiteESJZone.IDKEY = 'novelup';
NovelSiteESJZone = (0, tslib_1.__decorate)([
    (0, index_1.staticImplements)()
], NovelSiteESJZone);
exports.NovelSiteESJZone = NovelSiteESJZone;
exports.default = NovelSiteESJZone;
//# sourceMappingURL=index.js.map