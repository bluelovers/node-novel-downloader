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
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = require("../../util");
const tree_1 = require("../demo/tree");
const jsdom_extra_1 = require("jsdom-extra");
//import { URL } from 'jsdom-url';
const index_1 = require("../index");
const index_2 = require("../index");
const util_2 = require("./util");
let NovelSiteKakuyomu = /** @class */ (() => {
    let NovelSiteKakuyomu = class NovelSiteKakuyomu extends tree_1.default {
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
            return ret.dom.$('#contentMain .widget-episodeBody').text();
        }
        /**
         * @todo 需要改良支援三級目錄
         */
        async get_volume_list(url, optionsRuntime = {}) {
            const self = this;
            url = await this.createMainUrl(url, optionsRuntime);
            return jsdom_extra_1.fromURL(url, optionsRuntime.optionsJSDOM)
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
                        let volume_title = util_1.trim(tr.text(), true);
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
                        let chapter_title = util_1.trim(a.find('.widget-toc-episode-titleLabel').text(), true);
                        let chapter_date;
                        let dd;
                        let da = a.find('.widget-toc-episode-datePublished');
                        if (!dd) {
                            dd = da.attr('datetime').replace(/^\s+|\s+$/g, '');
                        }
                        if (dd) {
                            chapter_date = index_2.moment(dd).local();
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
                return Object.assign(Object.assign({}, data_meta), { url: dom.url, url_data,
                    novel_title,
                    novel_author,
                    novel_desc,
                    novel_date,
                    novel_publisher,
                    //volume_list,
                    novelTree, checkdate: index_2.moment().local(), imgs: [] });
            });
        }
    };
    NovelSiteKakuyomu.IDKEY = 'kakuyomu';
    NovelSiteKakuyomu = __decorate([
        index_1.staticImplements()
    ], NovelSiteKakuyomu);
    return NovelSiteKakuyomu;
})();
exports.NovelSiteKakuyomu = NovelSiteKakuyomu;
exports.default = NovelSiteKakuyomu;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7O0dBRUc7Ozs7Ozs7O0FBRUgscUNBQWtDO0FBQ2xDLHVDQUF3RjtBQU94Riw2Q0FBK0Q7QUFFL0Qsa0NBQWtDO0FBRWxDLG9DQUEwRjtBQUUxRixvQ0FBa0M7QUFDbEMsaUNBQWtEO0FBR2xEO0lBQUEsSUFBYSxpQkFBaUIsR0FBOUIsTUFBYSxpQkFBa0IsU0FBUSxjQUFhO1FBSW5ELE1BQU0sQ0FBQyxLQUFLLENBQUMsR0FBdUMsRUFBRSxHQUFHLElBQUk7WUFFNUQsT0FBTyxZQUFLLENBQUMsR0FBRyxFQUFFLEdBQUcsSUFBSSxDQUFDLENBQUM7UUFDNUIsQ0FBQztRQUVELE1BQU0sQ0FBQyxPQUFPLENBQUMsTUFBMkIsRUFBRSxJQUF1QixFQUFFLEdBQUcsSUFBSTtZQUUzRSxPQUFPLGNBQU8sQ0FBQyxNQUFNLEVBQUUsSUFBSSxFQUFFLEdBQUcsSUFBSSxDQUFDLENBQUE7UUFDdEMsQ0FBQztRQUVELE1BQU0sQ0FBQyxRQUFRLENBQUMsR0FBMEIsRUFBRSxHQUFHLElBQUk7WUFFbEQsT0FBTyxlQUFRLENBQUMsR0FBRyxFQUFFLEdBQUcsSUFBSSxDQUFDLENBQUM7UUFDL0IsQ0FBQztRQUVELE9BQU8sQ0FBQyxNQUEyQixFQUFFLElBQXVCLEVBQUUsR0FBRyxJQUFJO1lBRXBFLE9BQU8sY0FBTyxDQUFDLE1BQU0sRUFBRSxJQUFJLEVBQUUsR0FBRyxJQUFJLENBQUMsQ0FBQTtRQUN0QyxDQUFDO1FBRUQsUUFBUSxDQUFDLEdBQTBCLEVBQUUsR0FBRyxJQUFJO1lBRTNDLE9BQU8sZUFBUSxDQUFDLEdBQUcsRUFBRSxHQUFHLElBQUksQ0FBQyxDQUFDO1FBQy9CLENBQUM7UUFFUyxhQUFhLENBQUksR0FBRyxFQUFFLGNBQWMsRUFBRSxLQUFLO1lBRXBELElBQUksQ0FBQyxHQUFHLEVBQ1I7Z0JBQ0MsT0FBTyxFQUFFLENB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aW1wb3J0IHsgdHJpbSB9IGZyb20gJy4uLy4uL3V0aWwnO1xuaW1wb3J0IE5vdmVsU2l0ZURlbW8sIHsgSURvd25sb2FkT3B0aW9ucywgSU5vdmVsLCBJT3B0aW9uc1J1bnRpbWUgfSBmcm9tICcuLi9kZW1vL3RyZWUnO1xuaW1wb3J0IHsgSVJvd1ZvbHVtZSwgVHJlZU5vZGUgfSBmcm9tICcuLi8uLi90cmVlL2luZGV4JztcblxuaW1wb3J0IGZzID0gcmVxdWlyZSgnZnMtZXh0cmEnKTtcbmltcG9ydCB7IHRyaW1GaWxlbmFtZSB9IGZyb20gJ2ZzLWljb252L3V0aWwnO1xuaW1wb3J0ICogYXMgcGF0aCBmcm9tICd1cGF0aDInO1xuaW1wb3J0IG5vdmVsSW5mbywgeyBJTWRjb25mTWV0YSB9IGZyb20gJ25vZGUtbm92ZWwtaW5mbyc7XG5pbXBvcnQgeyBmcm9tVVJMLCBJRnJvbVVybE9wdGlvbnMsIElKU0RPTSB9IGZyb20gJ2pzZG9tLWV4dHJhJztcblxuLy9pbXBvcnQgeyBVUkwgfSBmcm9tICdqc2RvbS11cmwnO1xuXG5pbXBvcnQgTm92ZWxTaXRlLCB7IHN0YXRpY0ltcGxlbWVudHMsIGRlZmF1bHRKU0RPTU9wdGlvbnMsIFNZTUJPTF9DQUNIRSB9IGZyb20gJy4uL2luZGV4JztcbmltcG9ydCB7IFByb21pc2VCbHVlYmlyZCwgYmx1ZWJpcmREZWNvcmF0b3IgfSBmcm9tICcuLi9pbmRleCc7XG5pbXBvcnQgeyBtb21lbnQgfSBmcm9tICcuLi9pbmRleCc7XG5pbXBvcnQgeyBwYXJzZVVybCwgbWFrZVVybCwgY2hlY2sgfSBmcm9tICcuL3V0aWwnO1xuXG5Ac3RhdGljSW1wbGVtZW50czxOb3ZlbFNpdGUuSU5vdmVsU2l0ZVN0YXRpYzxOb3ZlbFNpdGVLYWt1eW9tdT4+KClcbmV4cG9ydCBjbGFzcyBOb3ZlbFNpdGVLYWt1eW9tdSBleHRlbmRzIE5vdmVsU2l0ZURlbW9cbntcblx0cHVibGljIHN0YXRpYyByZWFkb25seSBJREtFWSA9ICdrYWt1eW9tdSc7XG5cblx0c3RhdGljIGNoZWNrKHVybDogc3RyaW5nIHwgVVJMIHwgTm92ZWxTaXRlLklQYXJzZVVybCwgLi4uYXJndik6IGJvb2xlYW5cblx0e1xuXHRcdHJldHVybiBjaGVjayh1cmwsIC4uLmFyZ3YpO1xuXHR9XG5cblx0c3RhdGljIG1ha2VVcmwodXJsb2JqOiBOb3ZlbFNpdGUuSVBhcnNlVXJsLCBib29sPzogYm9vbGVhbiB8IG51bWJlciwgLi4uYXJndilcblx0e1xuXHRcdHJldHVybiBtYWtlVXJsKHVybG9iaiwgYm9vbCwgLi4uYXJndilcblx0fVxuXG5cdHN0YXRpYyBwYXJzZVVybCh1cmw6IHN0cmluZyB8IFVSTCB8IG51bWJlciwgLi4uYXJndilcblx0e1xuXHRcdHJldHVybiBwYXJzZVVybCh1cmwsIC4uLmFyZ3YpO1xuXHR9XG5cblx0bWFrZVVybCh1cmxvYmo6IE5vdmVsU2l0ZS5JUGFyc2VVcmwsIGJvb2w/OiBib29sZWFuIHwgbnVtYmVyLCAuLi5hcmd2KVxuXHR7XG5cdFx0cmV0dXJuIG1ha2VVcmwodXJsb2JqLCBib29sLCAuLi5hcmd2KVxuXHR9XG5cblx0cGFyc2VVcmwodXJsOiBzdHJpbmcgfCBVUkwgfCBudW1iZXIsIC4uLmFyZ3YpXG5cdHtcblx0XHRyZXR1cm4gcGFyc2VVcmwodXJsLCAuLi5hcmd2KTtcblx0fVxuXG5cdHByb3RlY3RlZCBfcGFyc2VDaGFwdGVyPFQ+KHJldCwgb3B0aW9uc1J1bnRpbWUsIGNhY2hlKTogc3RyaW5nXG5cdHtcblx0XHRpZiAoIXJldClcblx0XHR7XG5cdFx0XHRyZXR1cm4gJyc7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHJldC5kb20uJCgnI2NvbnRlbnRNYWluIC53aWRnZXQtZXBpc29kZUJvZHknKS50ZXh0KCk7XG5cdH1cblxuXHQvKipcblx0ICogQHRvZG8g6ZyA6KaB5pS56Imv5pSv5o+05LiJ57Sa55uu6YyEXG5cdCAqL1xuXHRhc3luYyBnZXRfdm9sdW1lX2xpc3Q8VCBleHRlbmRzIElPcHRpb25zUnVudGltZT4odXJsOiBzdHJpbmcgfCBVUkwsXG5cdFx0b3B0aW9uc1J1bnRpbWU6IFBhcnRpYWw8VCAmIElEb3dubG9hZE9wdGlvbnM+ID0ge31cblx0KTogUHJvbWlzZTxJTm92ZWw+XG5cdHtcblx0XHRjb25zdCBzZWxmID0gdGhpcztcblxuXHRcdHVybCA9IGF3YWl0IHRoaXMuY3JlYXRlTWFpblVybCh1cmwgYXMgYW55LCBvcHRpb25zUnVudGltZSk7XG5cblx0XHRyZXR1cm4gZnJvbVVSTCh1cmwsIG9wdGlvbnNSdW50aW1lLm9wdGlvbnNKU0RPTSlcblx0XHRcdC50aGVuKGFzeW5jIGZ1bmN0aW9uIChkb206IElKU0RPTSlcblx0XHRcdHtcblx0XHRcdFx0Y29uc3QgJCA9IGRvbS4kO1xuXG5cdFx0XHRcdGxldCBub3ZlbF90aXRsZSA9IGRvbS4kKCcjd29ya1RpdGxlJykudGV4dCgpO1xuXHRcdFx0XHRsZXQgbm92ZWxfYXV0aG9yID0gZG9tLiQoJyN3b3JrQXV0aG9yLWFjdGl2aXR5TmFtZScpLnRleHQoKTtcblxuXHRcdFx0XHRsZXQgbm92ZWxfZGVzYzogc3RyaW5nO1xuXG5cdFx0XHRcdGRvbS4kKCcjZGVzY3JpcHRpb24nKS5lYWNoKGZ1bmN0aW9uICgpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHQkKCcjaW50cm9kdWN0aW9uJykuYWRkQ2xhc3MoJ2lzRXhwYW5kZWQnKTtcblx0XHRcdFx0XHQkKCcudWktdHJ1bmNhdGVUZXh0LWV4cGFuZEJ1dHRvbicpLnJlbW92ZSgpO1xuXHRcdFx0XHRcdCQoJy50ZXN0LWludHJvZHVjdGlvbi1yZXN0LXRleHQnKS5zaG93KCk7XG5cblx0XHRcdFx0XHRsZXQgZCA9IFtdO1xuXG5cdFx0XHRcdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdFx0XHRcdCQodGhpcylcblx0XHRcdFx0XHRcdC5maW5kKCcjY2F0Y2hwaHJhc2UtYm9keSwgI2NhdGNocGhyYXNlLWF1dGhvckxhYmVsJylcblx0XHRcdFx0XHRcdC5lYWNoKGZ1bmN0aW9uICgpXG5cdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdC8vIEB0cy1pZ25vcmVcblx0XHRcdFx0XHRcdFx0ZC5wdXNoKCQodGhpcykudGV4dCgpLnJlcGxhY2UoL1xccyskL2csICcnKSk7XG5cdFx0XHRcdFx0XHR9KVxuXHRcdFx0XHRcdDtcblxuXHRcdFx0XHRcdGlmIChkLmxlbmd0aClcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRkLnB1c2goJyAnKTtcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRkLnB1c2goJCgnI2ludHJvZHVjdGlvbicpLnRleHQoKS5yZXBsYWNlKC9cXHMrJC9nLCAnJykpO1xuXG5cdFx0XHRcdFx0bm92ZWxfZGVzYyA9IGRcblx0XHRcdFx0XHRcdC5maWx0ZXIodiA9PiB2KVxuXHRcdFx0XHRcdFx0LmpvaW4oXCJcXG5cIilcblx0XHRcdFx0XHRcdC5yZXBsYWNlKC9bIFxcdOOAgF0rJC9nbSwgJycpXG5cdFx0XHRcdFx0O1xuXG5cdFx0XHRcdH0pO1xuXG5cdFx0XHRcdGxldCBub3ZlbF9wdWJsaXNoZXIgPSBzZWxmLklES0VZO1xuXG5cdFx0XHRcdGxldCB1cmxfZGF0YSA9IHNlbGYucGFyc2VVcmwoZG9tLnVybC5ocmVmKTtcblxuXHRcdFx0XHRsZXQgdm9sdW1lX2xpc3QgPSBbXSBhcyBOb3ZlbFNpdGUuSVZvbHVtZVtdO1xuXG5cdFx0XHRcdGNvbnN0IG5vdmVsVHJlZSA9IG9wdGlvbnNSdW50aW1lLm5vdmVsVHJlZTtcblx0XHRcdFx0bGV0IGN1cnJlbnRWb2x1bWU6IFRyZWVOb2RlPElSb3dWb2x1bWU+O1xuXG5cdFx0XHRcdGxldCB0YWJsZSA9IGRvbS4kKCcjdGFibGUtb2YtY29udGVudHMnKS5maW5kKCcud2lkZ2V0LXRvYy1jaGFwdGVyLCAud2lkZ2V0LXRvYy1lcGlzb2RlJyk7XG5cblx0XHRcdFx0bGV0IF9jYWNoZV9kYXRlcyA9IFtdO1xuXG5cdFx0XHRcdGxldCB0b3RhbF9pZHggPSAwO1xuXG5cdFx0XHRcdHRhYmxlXG5cdFx0XHRcdFx0LmVhY2goZnVuY3Rpb24gKGluZGV4KVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdC8vIEB0cy1pZ25vcmVcblx0XHRcdFx0XHRcdGxldCB0ciA9IGRvbS4kKHRoaXMpO1xuXG5cdFx0XHRcdFx0XHRpZiAodHIuaXMoJy53aWRnZXQtdG9jLWNoYXB0ZXInKSlcblx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0Lypcblx0XHRcdFx0XHRcdFx0Y3VycmVudFZvbHVtZSA9IHZvbHVtZV9saXN0W3ZvbHVtZV9saXN0Lmxlbmd0aF0gPSB7XG5cdFx0XHRcdFx0XHRcdFx0dm9sdW1lX2luZGV4OiB2b2x1bWVfbGlzdC5sZW5ndGgsXG5cdFx0XHRcdFx0XHRcdFx0dm9sdW1lX3RpdGxlOiB0ci50ZXh0KCkucmVwbGFjZSgvXlxccyt8XFxzKyQvZywgJycpLFxuXHRcdFx0XHRcdFx0XHRcdGNoYXB0ZXJfbGlzdDogW10sXG5cdFx0XHRcdFx0XHRcdH07XG5cdFx0XHRcdFx0XHRcdCovXG5cblx0XHRcdFx0XHRcdFx0bGV0IHZvbHVtZV9sZXZlbDogbnVtYmVyID0gbnVsbDtcblxuXHRcdFx0XHRcdFx0XHRsZXQgbSA9IHRyLmF0dHIoJ2NsYXNzJykubWF0Y2goL1xcYndpZGdldC10b2MtbGV2ZWwoXFxkKylcXGIvKTtcblx0XHRcdFx0XHRcdFx0aWYgKG0pXG5cdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHR2b2x1bWVfbGV2ZWwgPSBwYXJzZUludChtWzFdKTtcblx0XHRcdFx0XHRcdFx0XHQvL2NvbnNvbGUubG9nKG0pO1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdGVsc2Vcblx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdHZvbHVtZV9sZXZlbCA9IDE7XG5cdFx0XHRcdFx0XHRcdFx0dGhyb3cgRXJyb3Jcblx0XHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHRcdGxldCB2b2x1bWVfdGl0bGUgPSB0cmltKHRyLnRleHQoKSwgdHJ1ZSk7XG5cblx0XHRcdFx0XHRcdFx0bGV0IG5vd1ZvbHVtZTogVHJlZU5vZGU8SVJvd1ZvbHVtZT47XG5cblx0XHRcdFx0XHRcdFx0aWYgKGN1cnJlbnRWb2x1bWUpXG5cdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHRsZXQgbGFzdExldmVsID0gY3VycmVudFZvbHVtZS5nZXQ8bnVtYmVyPignbGV2ZWwnKSBhcyBudW1iZXI7XG5cdFx0XHRcdFx0XHRcdFx0bGV0IHBhcmVudFZvbHVtZTogVHJlZU5vZGU8SVJvd1ZvbHVtZT47XG5cblx0XHRcdFx0XHRcdFx0XHRpZiAodm9sdW1lX2xldmVsID4gMSlcblx0XHRcdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdFx0XHRpZiAobGFzdExldmVsID09IHZvbHVtZV9sZXZlbClcblx0XHRcdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0cGFyZW50Vm9sdW1lID0gY3VycmVudFZvbHVtZS5wYXJlbnQ7XG5cdFx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdFx0XHRlbHNlIGlmIChsYXN0TGV2ZWwgPSAodm9sdW1lX2xldmVsICsgMSkpXG5cdFx0XHRcdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdHBhcmVudFZvbHVtZSA9IGN1cnJlbnRWb2x1bWU7XG5cdFx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdFx0XHRlbHNlXG5cdFx0XHRcdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdHRocm93IEVycm9yXG5cdFx0XHRcdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdFx0XHRcdGlmICh2b2x1bWVfdGl0bGUgPT0gJycpXG5cdFx0XHRcdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdGxldCBuID0gdHIubmV4dFVudGlsKCcud2lkZ2V0LXRvYy1jaGFwdGVyJylcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHQuZXEoLTEpXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0Lm5leHQoJy53aWRnZXQtdG9jLWNoYXB0ZXInKVxuXHRcdFx0XHRcdFx0XHRcdFx0XHQ7XG5cblx0XHRcdFx0XHRcdFx0XHRcdFx0Ly9jb25zb2xlLmxvZyhuLCBuLmF0dHIoJ2NsYXNzJykpO1xuXG5cdFx0XHRcdFx0XHRcdFx0XHRcdGlmICghbi5sZW5ndGggfHwgbi5oYXNDbGFzcyhgd2lkZ2V0LXRvYy1sZXZlbCR7dm9sdW1lX2xldmVsIC0gMX1gKSlcblx0XHRcdFx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdG5vd1ZvbHVtZSA9IHBhcmVudFZvbHVtZTtcblx0XHRcdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHRcdFx0XHRpZiAoIW5vd1ZvbHVtZSlcblx0XHRcdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0bm93Vm9sdW1lID0gbm92ZWxUcmVlLmFkZFZvbHVtZSh7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0dm9sdW1lX3RpdGxlLFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdHZvbHVtZV9sZXZlbCxcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHR2b2x1bWVfaW5kZXg6IHBhcmVudFZvbHVtZS5zaXplKCksXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0dG90YWxfaWR4OiB0b3RhbF9pZHgrKyxcblx0XHRcdFx0XHRcdFx0XHRcdFx0fSwgcGFyZW50Vm9sdW1lKTtcblx0XHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0XHRpZiAoIW5vd1ZvbHVtZSlcblx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdG5vd1ZvbHVtZSA9IG5vdmVsVHJlZS5hZGRWb2x1bWUoe1xuXHRcdFx0XHRcdFx0XHRcdFx0dm9sdW1lX3RpdGxlLFxuXHRcdFx0XHRcdFx0XHRcdFx0dm9sdW1lX2xldmVsLFxuXHRcdFx0XHRcdFx0XHRcdFx0dm9sdW1lX2luZGV4OiBub3ZlbFRyZWUucm9vdCgpLnNpemUoKSxcblx0XHRcdFx0XHRcdFx0XHRcdHRvdGFsX2lkeDogdG90YWxfaWR4KyssXG5cdFx0XHRcdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0XHRjdXJyZW50Vm9sdW1lID0gbm93Vm9sdW1lO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0ZWxzZSBpZiAoMSlcblx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0aWYgKCFjdXJyZW50Vm9sdW1lKVxuXHRcdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdFx0Lypcblx0XHRcdFx0XHRcdFx0XHRjdXJyZW50Vm9sdW1lID0gdm9sdW1lX2xpc3Rbdm9sdW1lX2xpc3QubGVuZ3RoXSA9IHtcblx0XHRcdFx0XHRcdFx0XHRcdHZvbHVtZV9pbmRleDogdm9sdW1lX2xpc3QubGVuZ3RoLFxuXHRcdFx0XHRcdFx0XHRcdFx0dm9sdW1lX3RpdGxlOiAnbnVsbCcsXG5cdFx0XHRcdFx0XHRcdFx0XHRjaGFwdGVyX2xpc3Q6IFtdLFxuXHRcdFx0XHRcdFx0XHRcdH07XG5cdFx0XHRcdFx0XHRcdFx0Ki9cblxuXHRcdFx0XHRcdFx0XHRcdGxldCB2b2x1bWVfdGl0bGUgPSAnbnVsbCc7XG5cdFx0XHRcdFx0XHRcdFx0bGV0IHZvbHVtZV9sZXZlbCA9IG51bGw7XG5cblx0XHRcdFx0XHRcdFx0XHRjdXJyZW50Vm9sdW1lID0gbm92ZWxUcmVlLmFkZFZvbHVtZSh7XG5cdFx0XHRcdFx0XHRcdFx0XHR2b2x1bWVfdGl0bGUsXG5cdFx0XHRcdFx0XHRcdFx0XHR2b2x1bWVfbGV2ZWwsXG5cdFx0XHRcdFx0XHRcdFx0XHR2b2x1bWVfaW5kZXg6IG5vdmVsVHJlZS5yb290KCkuc2l6ZSgpLFxuXHRcdFx0XHRcdFx0XHRcdFx0dG90YWxfaWR4OiB0b3RhbF9pZHgrKyxcblx0XHRcdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHRcdGxldCBhID0gdHIuZmluZCgnYTplcSgwKScpO1xuXG5cdFx0XHRcdFx0XHRcdGxldCBjaGFwdGVyX3RpdGxlID0gdHJpbShhLmZpbmQoJy53aWRnZXQtdG9jLWVwaXNvZGUtdGl0bGVMYWJlbCcpLnRleHQoKSwgdHJ1ZSk7XG5cblx0XHRcdFx0XHRcdFx0bGV0IGNoYXB0ZXJfZGF0ZTtcblx0XHRcdFx0XHRcdFx0bGV0IGRkO1xuXHRcdFx0XHRcdFx0XHRsZXQgZGEgPSBhLmZpbmQoJy53aWRnZXQtdG9jLWVwaXNvZGUtZGF0ZVB1Ymxpc2hlZCcpO1xuXG5cdFx0XHRcdFx0XHRcdGlmICghZGQpXG5cdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHRkZCA9IGRhLmF0dHIoJ2RhdGV0aW1lJykucmVwbGFjZSgvXlxccyt8XFxzKyQvZywgJycpO1xuXHRcdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdFx0aWYgKGRkKVxuXHRcdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdFx0Y2hhcHRlcl9kYXRlID0gbW9tZW50KGRkKS5sb2NhbCgpO1xuXHRcdFx0XHRcdFx0XHRcdF9jYWNoZV9kYXRlcy5wdXNoKGNoYXB0ZXJfZGF0ZS51bml4KCkpO1xuXHRcdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdFx0bGV0IGhyZWYgPSBhLnByb3AoJ2hyZWYnKTtcblxuXHRcdFx0XHRcdFx0XHRsZXQgZGF0YSA9IHNlbGYucGFyc2VVcmwoaHJlZik7XG5cblx0XHRcdFx0XHRcdFx0aWYgKCFkYXRhLmNoYXB0ZXJfaWQpXG5cdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHQvKlxuXHRcdFx0XHRcdFx0XHRcdGNvbnNvbGUubG9nKGEpO1xuXHRcdFx0XHRcdFx0XHRcdGNvbnNvbGUubG9nKGRhdGEpO1xuXHRcdFx0XHRcdFx0XHRcdGNvbnNvbGUubG9nKGhyZWYpO1xuXHRcdFx0XHRcdFx0XHRcdGNvbnNvbGUubG9nKGEuYXR0cignaHJlZicpKTtcblx0XHRcdFx0XHRcdFx0XHRjb25zb2xlLmxvZyhuZXcgVVJMKGhyZWYsIGRvbS51cmwpKTtcblxuXHRcdFx0XHRcdFx0XHRcdGNvbnNvbGUubG9nKGRvbS5fb3B0aW9ucyk7XG5cdFx0XHRcdFx0XHRcdFx0Ki9cblxuXHRcdFx0XHRcdFx0XHRcdHRocm93IG5ldyBFcnJvcigpXG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0ZWxzZVxuXHRcdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdFx0aHJlZiA9IHNlbGYubWFrZVVybChkYXRhKTtcblxuXHRcdFx0XHRcdFx0XHRcdGRhdGEudXJsID0gaHJlZjtcblx0XHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHRcdC8qXG5cdFx0XHRcdFx0XHRcdGN1cnJlbnRWb2x1bWVcblx0XHRcdFx0XHRcdFx0XHQuY2hhcHRlcl9saXN0XG5cdFx0XHRcdFx0XHRcdFx0LnB1c2goe1xuXHRcdFx0XHRcdFx0XHRcdFx0Y2hhcHRlcl9pbmRleDogY3VycmVudFZvbHVtZS5jaGFwdGVyX2xpc3QubGVuZ3RoLFxuXHRcdFx0XHRcdFx0XHRcdFx0Y2hhcHRlcl90aXRsZTogY2hhcHRlcl90aXRsZS5yZXBsYWNlKC9eXFxzK3xcXHMrJC9nLCAnJyksXG5cdFx0XHRcdFx0XHRcdFx0XHRjaGFwdGVyX2lkOiBkYXRhLmNoYXB0ZXJfaWQsXG5cdFx0XHRcdFx0XHRcdFx0XHRjaGFwdGVyX3VybDogaHJlZixcblx0XHRcdFx0XHRcdFx0XHRcdGNoYXB0ZXJfdXJsX2RhdGE6IGRhdGEsXG5cdFx0XHRcdFx0XHRcdFx0XHRjaGFwdGVyX2RhdGUsXG5cdFx0XHRcdFx0XHRcdFx0fSlcblx0XHRcdFx0XHRcdFx0O1xuXHRcdFx0XHRcdFx0XHQqL1xuXG5cdFx0XHRcdFx0XHRcdGxldCBjaGFwdGVyID0ge1xuXHRcdFx0XHRcdFx0XHRcdGNoYXB0ZXJfdGl0bGUsXG5cdFx0XHRcdFx0XHRcdFx0Y2hhcHRlcl9pZDogZGF0YS5jaGFwdGVyX2lkLFxuXHRcdFx0XHRcdFx0XHRcdGNoYXB0ZXJfdXJsOiBocmVmLFxuXHRcdFx0XHRcdFx0XHRcdGNoYXB0ZXJfdXJsX2RhdGE6IGRhdGEsXG5cdFx0XHRcdFx0XHRcdFx0Y2hhcHRlcl9kYXRlLFxuXHRcdFx0XHRcdFx0XHRcdGNoYXB0ZXJfaW5kZXg6IGN1cnJlbnRWb2x1bWUuc2l6ZSgpLFxuXHRcdFx0XHRcdFx0XHRcdHRvdGFsX2lkeDogdG90YWxfaWR4KyssXG5cdFx0XHRcdFx0XHRcdH07XG5cblx0XHRcdFx0XHRcdFx0bm92ZWxUcmVlLmFkZENoYXB0ZXIoY2hhcHRlciwgY3VycmVudFZvbHVtZSlcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9KVxuXHRcdFx0XHQ7XG5cblx0XHRcdFx0X2NhY2hlX2RhdGVzLnNvcnQoKTtcblxuXHRcdFx0XHRsZXQgbm92ZWxfZGF0ZSA9IG1vbWVudC51bml4KF9jYWNoZV9kYXRlc1tfY2FjaGVfZGF0ZXMubGVuZ3RoIC0gMV0pLmxvY2FsKCk7XG5cblx0XHRcdFx0bGV0IGRhdGFfbWV0YTogSU1kY29uZk1ldGEgPSB7fTtcblxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0ZGF0YV9tZXRhLm5vdmVsID0ge307XG5cdFx0XHRcdFx0ZGF0YV9tZXRhLm5vdmVsLnRhZ3MgPSBbXTtcblxuXHRcdFx0XHRcdCQoJyN3b3JrTWV0YS1mbGFncycpXG5cdFx0XHRcdFx0XHQuZmluZCgnI3dvcmtHZW5yZSBhLCAjd29ya01ldGEtYXR0ZW50aW9uc0FuZFRhZ3MgW2l0ZW1wcm9wPVwia2V5d29yZHNcIl0gYScpXG5cdFx0XHRcdFx0XHQuZWFjaChmdW5jdGlvbiAoKVxuXHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHQvLyBAdHMtaWdub3JlXG5cdFx0XHRcdFx0XHRcdGxldCB0ID0gJCh0aGlzKS50ZXh0KCkucmVwbGFjZSgvXlxccyt8XFxzKyQvZywgJycpO1xuXHRcdFx0XHRcdFx0XHRpZiAodClcblx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdGRhdGFfbWV0YS5ub3ZlbC50YWdzLnB1c2godCk7XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdH0pXG5cdFx0XHRcdFx0O1xuXG5cdFx0XHRcdFx0JCgnI3dvcmtNZXRhLWZsYWdzJylcblx0XHRcdFx0XHRcdC5maW5kKCcjd29ya01ldGEtYXR0ZW50aW9uIGxpLCAjd29ya0dlbnJlID4gYTplcSgwKScpXG5cdFx0XHRcdFx0XHQuZWFjaChmdW5jdGlvbiAoKVxuXHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHQvLyBAdHMtaWdub3JlXG5cdFx0XHRcdFx0XHRcdGxldCB0ID0gJCh0aGlzKS50ZXh0KCkucmVwbGFjZSgvXlxccyt8XFxzKyQvZywgJycpO1xuXHRcdFx0XHRcdFx0XHRpZiAodClcblx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdGRhdGFfbWV0YS5ub3ZlbC50YWdzLnB1c2godCk7XG5cblx0XHRcdFx0XHRcdFx0XHRpZiAodCA9PSAn5oCn5o+P5YaZ5pyJ44KKJylcblx0XHRcdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdFx0XHRkYXRhX21ldGEubm92ZWwudGFncy5wdXNoKGBub3ZlbDE4YCk7XG5cdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHR9KVxuXHRcdFx0XHRcdDtcblxuXHRcdFx0XHRcdCQoJyN0YWJsZS1vZi1jb250ZW50cyAud2lkZ2V0LXRvYy13b3JrU3RhdHVzIHNwYW46ZXEoMCknKVxuXHRcdFx0XHRcdFx0LmVhY2goZnVuY3Rpb24gKClcblx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdFx0XHRcdFx0XHRkYXRhX21ldGEubm92ZWwuc3RhdHVzID0gJCh0aGlzKS50ZXh0KCkucmVwbGFjZSgvXlxccyt8XFxzKyQvZywgJycpO1xuXHRcdFx0XHRcdFx0fSlcblx0XHRcdFx0XHQ7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRyZXR1cm4ge1xuXG5cdFx0XHRcdFx0Li4uZGF0YV9tZXRhLFxuXG5cdFx0XHRcdFx0dXJsOiBkb20udXJsLFxuXHRcdFx0XHRcdHVybF9kYXRhLFxuXG5cdFx0XHRcdFx0bm92ZWxfdGl0bGUsXG5cdFx0XHRcdFx0bm92ZWxfYXV0aG9yLFxuXG5cdFx0XHRcdFx0bm92ZWxfZGVzYyxcblx0XHRcdFx0XHRub3ZlbF9kYXRlLFxuXHRcdFx0XHRcdG5vdmVsX3B1Ymxpc2hlcixcblxuXHRcdFx0XHRcdC8vdm9sdW1lX2xpc3QsXG5cdFx0XHRcdFx0bm92ZWxUcmVlLFxuXG5cdFx0XHRcdFx0Y2hlY2tkYXRlOiBtb21lbnQoKS5sb2NhbCgpLFxuXG5cdFx0XHRcdFx0aW1nczogW10gYXMgc3RyaW5nW10sXG5cdFx0XHRcdH0gYXMgSU5vdmVsO1xuXHRcdFx0fSlcblx0XHRcdDtcblx0fVxuXG59XG5cbmV4cG9ydCBkZWZhdWx0IE5vdmVsU2l0ZUtha3V5b211O1xuIl19