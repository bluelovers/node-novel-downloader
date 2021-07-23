"use strict";
/**
 * Created by user on 2018/3/17/017.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.NovelSiteKakuyomu = void 0;
const tslib_1 = require("tslib");
const util_1 = require("../../util");
const tree_1 = (0, tslib_1.__importDefault)(require("../demo/tree"));
const jsdom_extra_1 = require("jsdom-extra");
//import { URL } from 'jsdom-url';
const index_1 = require("../index");
const index_2 = require("../index");
const util_2 = require("./util");
const html_1 = require("../../util/html");
let NovelSiteKakuyomu = class NovelSiteKakuyomu extends tree_1.default {
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
    _parseChapter(ret, optionsRuntime, cache) {
        if (!ret) {
            return '';
        }
        (0, html_1.keepFormatTag)(ret.dom.$('#contentMain .widget-episodeBody'), {
            $: ret.dom.$,
            optionsRuntime,
        });
        return ret.dom.$('#contentMain .widget-episodeBody').text();
    }
    /**
     * @todo 需要改良支援三級目錄
     */
    async get_volume_list(url, optionsRuntime = {}) {
        const self = this;
        url = await this.createMainUrl(url, optionsRuntime);
        return (0, jsdom_extra_1.fromURL)(url, optionsRuntime.optionsJSDOM)
            .then(async function (dom) {
            const $ = dom.$;
            let novel_title = dom.$('#workTitle').text();
            let novel_author = dom.$('#workAuthor-activityName').text();
            let novel_desc;
            dom.$('#description').each(function () {
                $('#introduction').addClass('isExpanded');
                $('.ui-truncateText-expandButton').remove();
                $('.test-introduction-rest-text').show();
                let d = [];
                // @ts-ignore
                $(this)
                    .find('#catchphrase-body, #catchphrase-authorLabel')
                    .each(function () {
                    // @ts-ignore
                    d.push($(this).text().replace(/\s+$/g, ''));
                });
                if (d.length) {
                    d.push(' ');
                }
                d.push($('#introduction').text().replace(/\s+$/g, ''));
                novel_desc = d
                    .filter(v => v)
                    .join("\n")
                    .replace(/[ \t　]+$/gm, '');
            });
            let novel_publisher = self.IDKEY;
            let url_data = self.parseUrl(dom.url.href);
            let volume_list = [];
            const novelTree = optionsRuntime.novelTree;
            let currentVolume;
            let table = dom.$('#table-of-contents').find('.widget-toc-chapter, .widget-toc-episode');
            let _cache_dates = [];
            let total_idx = 0;
            table
                .each(function (index) {
                // @ts-ignore
                let tr = dom.$(this);
                if (tr.is('.widget-toc-chapter')) {
                    /*
                    currentVolume = volume_list[volume_list.length] = {
                        volume_index: volume_list.length,
                        volume_title: tr.text().replace(/^\s+|\s+$/g, ''),
                        chapter_list: [],
                    };
                    */
                    let volume_level = null;
                    let m = tr.attr('class').match(/\bwidget-toc-level(\d+)\b/);
                    if (m) {
                        volume_level = parseInt(m[1]);
                        //console.log(m);
                    }
                    else {
                        volume_level = 1;
                        throw Error;
                    }
                    let volume_title = (0, util_1.trim)(tr.text(), true);
                    let nowVolume;
                    if (currentVolume) {
                        let lastLevel = currentVolume.get('level');
                        let parentVolume;
                        if (volume_level > 1) {
                            if (lastLevel == volume_level) {
                                parentVolume = currentVolume.parent;
                            }
                            else if (lastLevel = (volume_level + 1)) {
                                parentVolume = currentVolume;
                            }
                            else {
                                throw Error;
                            }
                            if (volume_title == '') {
                                let n = tr.nextUntil('.widget-toc-chapter')
                                    .eq(-1)
                                    .next('.widget-toc-chapter');
                                //console.log(n, n.attr('class'));
                                if (!n.length || n.hasClass(`widget-toc-level${volume_level - 1}`)) {
                                    nowVolume = parentVolume;
                                }
                            }
                            if (!nowVolume) {
                                nowVolume = novelTree.addVolume({
                                    volume_title,
                                    volume_level,
                                    volume_index: parentVolume.size(),
                                    total_idx: total_idx++,
                                }, parentVolume);
                            }
                        }
                    }
                    if (!nowVolume) {
                        nowVolume = novelTree.addVolume({
                            volume_title,
                            volume_level,
                            volume_index: novelTree.root().size(),
                            total_idx: total_idx++,
                        });
                    }
                    currentVolume = nowVolume;
                }
                else if (1) {
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
                    let chapter_title = (0, util_1.trim)(a.find('.widget-toc-episode-titleLabel').text(), true);
                    let chapter_date;
                    let dd;
                    let da = a.find('.widget-toc-episode-datePublished');
                    if (!dd) {
                        dd = da.attr('datetime').replace(/^\s+|\s+$/g, '');
                    }
                    if (dd) {
                        chapter_date = (0, index_2.moment)(dd).local();
                        _cache_dates.push(chapter_date.unix());
                    }
                    let href = a.prop('href');
                    let data = self.parseUrl(href);
                    if (!data.chapter_id) {
                        /*
                        console.log(a);
                        console.log(data);
                        console.log(href);
                        console.log(a.attr('href'));
                        console.log(new URL(href, dom.url));

                        console.log(dom._options);
                        */
                        throw new Error();
                    }
                    else {
                        href = self.makeUrl(data);
                        data.url = href;
                    }
                    /*
                    currentVolume
                        .chapter_list
                        .push({
                            chapter_index: currentVolume.chapter_list.length,
                            chapter_title: chapter_title.replace(/^\s+|\s+$/g, ''),
                            chapter_id: data.chapter_id,
                            chapter_url: href,
                            chapter_url_data: data,
                            chapter_date,
                        })
                    ;
                    */
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
                $('#workMeta-flags')
                    .find('#workGenre a, #workMeta-attentionsAndTags [itemprop="keywords"] a')
                    .each(function () {
                    // @ts-ignore
                    let t = $(this).text().replace(/^\s+|\s+$/g, '');
                    if (t) {
                        data_meta.novel.tags.push(t);
                    }
                });
                $('#workMeta-flags')
                    .find('#workMeta-attention li, #workGenre > a:eq(0)')
                    .each(function () {
                    // @ts-ignore
                    let t = $(this).text().replace(/^\s+|\s+$/g, '');
                    if (t) {
                        data_meta.novel.tags.push(t);
                        if (t == '性描写有り') {
                            data_meta.novel.tags.push(`novel18`);
                        }
                    }
                });
                $('#table-of-contents .widget-toc-workStatus span:eq(0)')
                    .each(function () {
                    // @ts-ignore
                    data_meta.novel.status = $(this).text().replace(/^\s+|\s+$/g, '');
                });
            }
            let novel_cover = `https://cdn-static.kakuyomu.jp/works/${url_data.novel_id}/ogimage.png`;
            return {
                ...data_meta,
                url: dom.url,
                url_data,
                novel_title,
                novel_cover,
                novel_author,
                novel_desc,
                novel_date,
                novel_publisher,
                //volume_list,
                novelTree,
                checkdate: (0, index_2.moment)().local(),
                imgs: [],
            };
        });
    }
};
NovelSiteKakuyomu.IDKEY = 'kakuyomu';
NovelSiteKakuyomu = (0, tslib_1.__decorate)([
    (0, index_1.staticImplements)()
], NovelSiteKakuyomu);
exports.NovelSiteKakuyomu = NovelSiteKakuyomu;
exports.default = NovelSiteKakuyomu;
//# sourceMappingURL=index.js.map