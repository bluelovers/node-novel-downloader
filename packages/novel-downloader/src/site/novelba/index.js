"use strict";
/**
 * Created by user on 2018/3/17/017.
 */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NovelSiteNovelba = void 0;
const util_1 = require("../../util");
const tree_1 = __importDefault(require("../demo/tree"));
const jsdom_extra_1 = require("jsdom-extra");
//import { URL } from 'jsdom-url';
const index_1 = require("../index");
const index_2 = require("../index");
const util_2 = require("./util");
let NovelSiteNovelba = class NovelSiteNovelba extends tree_1.default {
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
    _parseChapter(ret, optionsRuntime, cache) {
        if (!ret) {
            return '';
        }
        try {
            let html = util_1.minifyHTML(ret.dom.$('.episode_box').html());
            ret.dom.$('.episode_box').html(html);
        }
        catch (e) {
        }
        return ret.dom.$('.episode_section .episode_box .detail')
            .html(function (index, old) {
            return old.replace(/(?<=\<br\>)\r?\n?/ig, '\n');
        })
            .text()
            .replace(/^\s+|\s+$/g, '');
        ;
    }
    async get_volume_list(url, optionsRuntime = {}) {
        const self = this;
        url = await this.createMainUrl(url, optionsRuntime);
        return jsdom_extra_1.fromURL(url, optionsRuntime.optionsJSDOM)
            .then(async function (dom) {
            const $ = dom.$;
            $('.work_section .summary_box a.more').click();
            try {
                let html = util_1.minifyHTML(dom.$('.summary_box .detail').html());
                dom.$('.summary_box .detail').html(html);
            }
            catch (e) {
            }
            let novel_title = dom.$('.work_section .info_list .title').text();
            let novel_author = dom.$('.work_section .info_list .author a').text();
            let novel_desc;
            novel_desc = $('.work_section .summary_box .detail')
                .text()
                .replace(/^[ \xa0]+/gm, '')
                .replace(/[ \t　\xa0]+$/gm, '')
                .replace(/\s+$/g, '');
            let novel_publisher = self.IDKEY;
            let url_data = self.parseUrl(dom.url.href);
            let volume_list = [];
            const novelTree = optionsRuntime.novelTree;
            let currentVolume;
            let table = dom.$('.episode_box').find('.episode_list > li');
            let _cache_dates = [];
            let total_idx = 0;
            table
                .each(function (index) {
                // @ts-ignore
                let tr = dom.$(this);
                if (1) {
                    if (!currentVolume) {
                        /*
                        currentVolume = volume_list[volume_list.length] = {
                            volume_index: volume_list.length,
                            volume_title: 'null',
                            chapter_list: [],
                        };
                        */
                        let volume_title = 'null';
                        let volume_level = null;
                        currentVolume = novelTree.addVolume({
                            volume_title,
                            volume_level,
                            volume_index: novelTree.root().size(),
                            total_idx: total_idx++,
                        });
                    }
                    let a = tr.find('a:eq(0)');
                    let chapter_date;
                    let dd;
                    let da = a.find('.update');
                    if (da.length) {
                        dd = da.find('time').text();
                        da.remove();
                    }
                    if (dd) {
                        chapter_date = index_2.moment(dd, ['YYYY/MM/DD']).local();
                        _cache_dates.push(chapter_date.unix());
                    }
                    let chapter_title = util_1.trim(a.text(), true);
                    let href = a.prop('href');
                    let data = self.parseUrl(href);
                    if (!data.chapter_id) {
                        throw new Error();
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
                        chapter_date,
                        chapter_index: currentVolume.size(),
                        total_idx: total_idx++,
                    };
                    novelTree.addChapter(chapter, currentVolume);
                }
            });
            _cache_dates.sort();
            let novel_date = index_2.moment.unix(_cache_dates[_cache_dates.length - 1]).local();
            let data_meta = {};
            {
                data_meta.novel = {};
                data_meta.novel.tags = [];
                $('.work_section .keyword_list a')
                    .each(function () {
                    // @ts-ignore
                    let t = $(this).text().replace(/^\s+|\s+$/g, '');
                    if (t) {
                        data_meta.novel.tags.push(t);
                    }
                });
            }
            return {
                ...data_meta,
                url: dom.url,
                url_data,
                novel_title,
                novel_author,
                novel_desc,
                novel_date,
                novel_publisher,
                //volume_list,
                novelTree,
                checkdate: index_2.moment().local(),
                imgs: [],
            };
        });
    }
};
NovelSiteNovelba.IDKEY = 'novelba';
NovelSiteNovelba = __decorate([
    index_1.staticImplements()
], NovelSiteNovelba);
exports.NovelSiteNovelba = NovelSiteNovelba;
exports.default = NovelSiteNovelba;
//# sourceMappingURL=index.js.map