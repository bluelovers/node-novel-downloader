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
const jsdom_url_1 = require("jsdom-url");
const index_1 = require("../index");
const index_2 = require("../index");
let NovelSiteKakuyomu = class NovelSiteKakuyomu extends tree_1.default {
    /**
     * https://kakuyomu.jp/works/4852201425154898215/episodes/4852201425154936315
     */
    makeUrl(urlobj, bool) {
        let pad = (!bool && urlobj.chapter_id) ? '/episodes/' + urlobj.chapter_id : '';
        // @ts-ignore
        return new jsdom_url_1.URL(`https://kakuyomu.jp/works/${urlobj.novel_id}${pad}`);
    }
    parseUrl(url) {
        let urlobj = {
            url,
            novel_pid: null,
            novel_id: null,
            chapter_id: null,
        };
        //url = url.toString();
        try {
            // @ts-ignore
            urlobj.url = new jsdom_url_1.URL(url);
            // @ts-ignore
            url = urlobj.url.href;
        }
        catch (e) {
            console.warn(e.toString() + ` "${url}"`);
        }
        if (typeof url != 'string') {
            // @ts-ignore
            throw new TypeError(url);
        }
        let r;
        let m;
        r = /^(\d{10,})$/;
        if (m = r.exec(url)) {
            urlobj.novel_id = m[1];
            return urlobj;
        }
        r = /kakuyomu\.jp\/works\/(\d+)(?:\/(?:episodes\/(\d+)))?/g;
        if (m = r.exec(url)) {
            urlobj.novel_id = m[1];
            urlobj.chapter_id = m[2];
            return urlobj;
        }
        return urlobj;
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
        url = await this.createMainUrl(url);
        return await jsdom_extra_1.fromURL(url, optionsRuntime.optionsJSDOM)
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
                $(this)
                    .find('#catchphrase-body, #catchphrase-authorLabel')
                    .each(function () {
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
                    let t = $(this).text().replace(/^\s+|\s+$/g, '');
                    if (t) {
                        data_meta.novel.tags.push(t);
                    }
                });
                $('#table-of-contents .widget-toc-workStatus span:eq(0)')
                    .each(function () {
                    data_meta.novel.status = $(this).text().replace(/^\s+|\s+$/g, '');
                });
            }
            return Object.assign({}, data_meta, { url: dom.url, url_data,
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
exports.NovelSiteKakuyomu = NovelSiteKakuyomu;
exports.default = NovelSiteKakuyomu;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7O0dBRUc7Ozs7Ozs7O0FBRUgscUNBQWtDO0FBQ2xDLHVDQUF3RjtBQU14Riw2Q0FBK0Q7QUFFL0QseUNBQWdDO0FBRWhDLG9DQUEwRjtBQUUxRixvQ0FBa0M7QUFHbEMsSUFBYSxpQkFBaUIsR0FBOUIsTUFBYSxpQkFBa0IsU0FBUSxjQUFhO0lBSW5EOztPQUVHO0lBQ0gsT0FBTyxDQUFDLE1BQTJCLEVBQUUsSUFBZTtRQUVuRCxJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUMsSUFBSSxJQUFJLE1BQU0sQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsWUFBWSxHQUFHLE1BQU0sQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztRQUUvRSxhQUFhO1FBQ2IsT0FBTyxJQUFJLGVBQUcsQ0FBQyw2QkFBNkIsTUFBTSxDQUFDLFFBQVEsR0FBRyxHQUFHLEVBQUUsQ0FBQyxDQUFDO0lBQ3RFLENBQUM7SUFFRCxRQUFRLENBQUMsR0FBaUI7UUFFekIsSUFBSSxNQUFNLEdBQUc7WUFDWixHQUFHO1lBRUgsU0FBUyxFQUFFLElBQUk7WUFDZixRQUFRLEVBQUUsSUFBSTtZQUNkLFVBQVUsRUFBRSxJQUFJO1NBRWhCLENBQUM7UUFFRix1QkFBdUI7UUFFdkIsSUFDQTtZQUNDLGFBQWE7WUFDYixNQUFNLENBQUMsR0FBRyxHQUFHLElBQUksZUFBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQzFCLGFBQWE7WUFDYixHQUFHLEdBQUcsTUFBTSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUM7U0FDdEI7UUFDRCxPQUFPLENBQUMsRUFDUjtZQUNDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxHQUFHLEtBQUssR0FBRyxHQUFHLENBQUMsQ0FBQztTQUN6QztRQUVELElBQUksT0FBTyxHQUFHLElBQUksUUFB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QUFzWTlCLGtCQUFlLGlCQUFpQixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDcmVhdGVkIGJ5IHVzZXIgb24gMjAxOC8zLzE3LzAxNy5cbiAqL1xuXG5pbXBvcnQgeyB0cmltIH0gZnJvbSAnLi4vLi4vdXRpbCc7XG5pbXBvcnQgTm92ZWxTaXRlRGVtbywgeyBJRG93bmxvYWRPcHRpb25zLCBJTm92ZWwsIElPcHRpb25zUnVudGltZSB9IGZyb20gJy4uL2RlbW8vdHJlZSc7XG5pbXBvcnQgeyBJUm93Vm9sdW1lLCBUcmVlTm9kZSB9IGZyb20gJy4uLy4uL3RyZWUvaW5kZXgnO1xuXG5pbXBvcnQgZnMsIHsgdHJpbUZpbGVuYW1lIH0gZnJvbSAnZnMtaWNvbnYnO1xuaW1wb3J0ICogYXMgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCBub3ZlbEluZm8sIHsgSU1kY29uZk1ldGEgfSBmcm9tICdub2RlLW5vdmVsLWluZm8nO1xuaW1wb3J0IHsgZnJvbVVSTCwgSUZyb21VcmxPcHRpb25zLCBJSlNET00gfSBmcm9tICdqc2RvbS1leHRyYSc7XG5cbmltcG9ydCB7IFVSTCB9IGZyb20gJ2pzZG9tLXVybCc7XG5cbmltcG9ydCBOb3ZlbFNpdGUsIHsgc3RhdGljSW1wbGVtZW50cywgZGVmYXVsdEpTRE9NT3B0aW9ucywgU1lNQk9MX0NBQ0hFIH0gZnJvbSAnLi4vaW5kZXgnO1xuaW1wb3J0IHsgUHJvbWlzZUJsdWViaXJkLCBibHVlYmlyZERlY29yYXRvciB9IGZyb20gJy4uL2luZGV4JztcbmltcG9ydCB7IG1vbWVudCB9IGZyb20gJy4uL2luZGV4JztcblxuQHN0YXRpY0ltcGxlbWVudHM8Tm92ZWxTaXRlLklOb3ZlbFNpdGVTdGF0aWM8Tm92ZWxTaXRlS2FrdXlvbXU+PigpXG5leHBvcnQgY2xhc3MgTm92ZWxTaXRlS2FrdXlvbXUgZXh0ZW5kcyBOb3ZlbFNpdGVEZW1vXG57XG5cdHB1YmxpYyBzdGF0aWMgcmVhZG9ubHkgSURLRVkgPSAna2FrdXlvbXUnO1xuXG5cdC8qKlxuXHQgKiBodHRwczovL2tha3V5b211LmpwL3dvcmtzLzQ4NTIyMDE0MjUxNTQ4OTgyMTUvZXBpc29kZXMvNDg1MjIwMTQyNTE1NDkzNjMxNVxuXHQgKi9cblx0bWFrZVVybCh1cmxvYmo6IE5vdmVsU2l0ZS5JUGFyc2VVcmwsIGJvb2wgPzogYm9vbGVhbik6IFVSTFxuXHR7XG5cdFx0bGV0IHBhZCA9ICghYm9vbCAmJiB1cmxvYmouY2hhcHRlcl9pZCkgPyAnL2VwaXNvZGVzLycgKyB1cmxvYmouY2hhcHRlcl9pZCA6ICcnO1xuXG5cdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdHJldHVybiBuZXcgVVJMKGBodHRwczovL2tha3V5b211LmpwL3dvcmtzLyR7dXJsb2JqLm5vdmVsX2lkfSR7cGFkfWApO1xuXHR9XG5cblx0cGFyc2VVcmwodXJsOiBzdHJpbmcgfCBVUkwpOiBOb3ZlbFNpdGUuSVBhcnNlVXJsXG5cdHtcblx0XHRsZXQgdXJsb2JqID0ge1xuXHRcdFx0dXJsLFxuXG5cdFx0XHRub3ZlbF9waWQ6IG51bGwsXG5cdFx0XHRub3ZlbF9pZDogbnVsbCxcblx0XHRcdGNoYXB0ZXJfaWQ6IG51bGwsXG5cblx0XHR9O1xuXG5cdFx0Ly91cmwgPSB1cmwudG9TdHJpbmcoKTtcblxuXHRcdHRyeVxuXHRcdHtcblx0XHRcdC8vIEB0cy1pZ25vcmVcblx0XHRcdHVybG9iai51cmwgPSBuZXcgVVJMKHVybCk7XG5cdFx0XHQvLyBAdHMtaWdub3JlXG5cdFx0XHR1cmwgPSB1cmxvYmoudXJsLmhyZWY7XG5cdFx0fVxuXHRcdGNhdGNoIChlKVxuXHRcdHtcblx0XHRcdGNvbnNvbGUud2FybihlLnRvU3RyaW5nKCkgKyBgIFwiJHt1cmx9XCJgKTtcblx0XHR9XG5cblx0XHRpZiAodHlwZW9mIHVybCAhPSAnc3RyaW5nJylcblx0XHR7XG5cdFx0XHQvLyBAdHMtaWdub3JlXG5cdFx0XHR0aHJvdyBuZXcgVHlwZUVycm9yKHVybCk7XG5cdFx0fVxuXG5cdFx0bGV0IHI6IFJlZ0V4cDtcblx0XHRsZXQgbTtcblxuXHRcdHIgPSAvXihcXGR7MTAsfSkkLztcblx0XHRpZiAobSA9IHIuZXhlYyh1cmwpKVxuXHRcdHtcblx0XHRcdHVybG9iai5ub3ZlbF9pZCA9IG1bMV07XG5cdFx0XHRyZXR1cm4gdXJsb2JqO1xuXHRcdH1cblxuXHRcdHIgPSAva2FrdXlvbXVcXC5qcFxcL3dvcmtzXFwvKFxcZCspKD86XFwvKD86ZXBpc29kZXNcXC8oXFxkKykpKT8vZztcblx0XHRpZiAobSA9IHIuZXhlYyh1cmwpKVxuXHRcdHtcblx0XHRcdHVybG9iai5ub3ZlbF9pZCA9IG1bMV07XG5cdFx0XHR1cmxvYmouY2hhcHRlcl9pZCA9IG1bMl07XG5cblx0XHRcdHJldHVybiB1cmxvYmo7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHVybG9iajtcblx0fVxuXG5cdHByb3RlY3RlZCBfcGFyc2VDaGFwdGVyPFQ+KHJldCwgb3B0aW9uc1J1bnRpbWUsIGNhY2hlKTogc3RyaW5nXG5cdHtcblx0XHRpZiAoIXJldClcblx0XHR7XG5cdFx0XHRyZXR1cm4gJyc7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHJldC5kb20uJCgnI2NvbnRlbnRNYWluIC53aWRnZXQtZXBpc29kZUJvZHknKS50ZXh0KCk7XG5cdH1cblxuXHQvKipcblx0ICogQHRvZG8g6ZyA6KaB5pS56Imv5pSv5o+05LiJ57Sa55uu6YyEXG5cdCAqL1xuXHRhc3luYyBnZXRfdm9sdW1lX2xpc3Q8VCBleHRlbmRzIElPcHRpb25zUnVudGltZT4odXJsOiBzdHJpbmcgfCBVUkwsXG5cdFx0b3B0aW9uc1J1bnRpbWU6IFBhcnRpYWw8VCAmIElEb3dubG9hZE9wdGlvbnM+ID0ge31cblx0KTogUHJvbWlzZTxJTm92ZWw+XG5cdHtcblx0XHRjb25zdCBzZWxmID0gdGhpcztcblxuXHRcdHVybCA9IGF3YWl0IHRoaXMuY3JlYXRlTWFpblVybCh1cmwgYXMgYW55KTtcblxuXHRcdHJldHVybiBhd2FpdCBmcm9tVVJMKHVybCwgb3B0aW9uc1J1bnRpbWUub3B0aW9uc0pTRE9NKVxuXHRcdFx0LnRoZW4oYXN5bmMgZnVuY3Rpb24gKGRvbTogSUpTRE9NKVxuXHRcdFx0e1xuXHRcdFx0XHRjb25zdCAkID0gZG9tLiQ7XG5cblx0XHRcdFx0bGV0IG5vdmVsX3RpdGxlID0gZG9tLiQoJyN3b3JrVGl0bGUnKS50ZXh0KCk7XG5cdFx0XHRcdGxldCBub3ZlbF9hdXRob3IgPSBkb20uJCgnI3dvcmtBdXRob3ItYWN0aXZpdHlOYW1lJykudGV4dCgpO1xuXG5cdFx0XHRcdGxldCBub3ZlbF9kZXNjOiBzdHJpbmc7XG5cblx0XHRcdFx0ZG9tLiQoJyNkZXNjcmlwdGlvbicpLmVhY2goZnVuY3Rpb24gKClcblx0XHRcdFx0e1xuXHRcdFx0XHRcdCQoJyNpbnRyb2R1Y3Rpb24nKS5hZGRDbGFzcygnaXNFeHBhbmRlZCcpO1xuXHRcdFx0XHRcdCQoJy51aS10cnVuY2F0ZVRleHQtZXhwYW5kQnV0dG9uJykucmVtb3ZlKCk7XG5cdFx0XHRcdFx0JCgnLnRlc3QtaW50cm9kdWN0aW9uLXJlc3QtdGV4dCcpLnNob3coKTtcblxuXHRcdFx0XHRcdGxldCBkID0gW107XG5cblx0XHRcdFx0XHQkKHRoaXMpXG5cdFx0XHRcdFx0XHQuZmluZCgnI2NhdGNocGhyYXNlLWJvZHksICNjYXRjaHBocmFzZS1hdXRob3JMYWJlbCcpXG5cdFx0XHRcdFx0XHQuZWFjaChmdW5jdGlvbiAoKVxuXHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRkLnB1c2goJCh0aGlzKS50ZXh0KCkucmVwbGFjZSgvXFxzKyQvZywgJycpKTtcblx0XHRcdFx0XHRcdH0pXG5cdFx0XHRcdFx0O1xuXG5cdFx0XHRcdFx0aWYgKGQubGVuZ3RoKVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdGQucHVzaCgnICcpO1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdGQucHVzaCgkKCcjaW50cm9kdWN0aW9uJykudGV4dCgpLnJlcGxhY2UoL1xccyskL2csICcnKSk7XG5cblx0XHRcdFx0XHRub3ZlbF9kZXNjID0gZFxuXHRcdFx0XHRcdFx0LmZpbHRlcih2ID0+IHYpXG5cdFx0XHRcdFx0XHQuam9pbihcIlxcblwiKVxuXHRcdFx0XHRcdFx0LnJlcGxhY2UoL1sgXFx044CAXSskL2dtLCAnJylcblx0XHRcdFx0XHQ7XG5cblx0XHRcdFx0fSk7XG5cblx0XHRcdFx0bGV0IG5vdmVsX3B1Ymxpc2hlciA9IHNlbGYuSURLRVk7XG5cblx0XHRcdFx0bGV0IHVybF9kYXRhID0gc2VsZi5wYXJzZVVybChkb20udXJsLmhyZWYpO1xuXG5cdFx0XHRcdGxldCB2b2x1bWVfbGlzdCA9IFtdIGFzIE5vdmVsU2l0ZS5JVm9sdW1lW107XG5cblx0XHRcdFx0Y29uc3Qgbm92ZWxUcmVlID0gb3B0aW9uc1J1bnRpbWUubm92ZWxUcmVlO1xuXHRcdFx0XHRsZXQgY3VycmVudFZvbHVtZTogVHJlZU5vZGU8SVJvd1ZvbHVtZT47XG5cblx0XHRcdFx0bGV0IHRhYmxlID0gZG9tLiQoJyN0YWJsZS1vZi1jb250ZW50cycpLmZpbmQoJy53aWRnZXQtdG9jLWNoYXB0ZXIsIC53aWRnZXQtdG9jLWVwaXNvZGUnKTtcblxuXHRcdFx0XHRsZXQgX2NhY2hlX2RhdGVzID0gW107XG5cblx0XHRcdFx0bGV0IHRvdGFsX2lkeCA9IDA7XG5cblx0XHRcdFx0dGFibGVcblx0XHRcdFx0XHQuZWFjaChmdW5jdGlvbiAoaW5kZXgpXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0bGV0IHRyID0gZG9tLiQodGhpcyk7XG5cblx0XHRcdFx0XHRcdGlmICh0ci5pcygnLndpZGdldC10b2MtY2hhcHRlcicpKVxuXHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHQvKlxuXHRcdFx0XHRcdFx0XHRjdXJyZW50Vm9sdW1lID0gdm9sdW1lX2xpc3Rbdm9sdW1lX2xpc3QubGVuZ3RoXSA9IHtcblx0XHRcdFx0XHRcdFx0XHR2b2x1bWVfaW5kZXg6IHZvbHVtZV9saXN0Lmxlbmd0aCxcblx0XHRcdFx0XHRcdFx0XHR2b2x1bWVfdGl0bGU6IHRyLnRleHQoKS5yZXBsYWNlKC9eXFxzK3xcXHMrJC9nLCAnJyksXG5cdFx0XHRcdFx0XHRcdFx0Y2hhcHRlcl9saXN0OiBbXSxcblx0XHRcdFx0XHRcdFx0fTtcblx0XHRcdFx0XHRcdFx0Ki9cblxuXHRcdFx0XHRcdFx0XHRsZXQgdm9sdW1lX2xldmVsOiBudW1iZXIgPSBudWxsO1xuXG5cdFx0XHRcdFx0XHRcdGxldCBtID0gdHIuYXR0cignY2xhc3MnKS5tYXRjaCgvXFxid2lkZ2V0LXRvYy1sZXZlbChcXGQrKVxcYi8pO1xuXHRcdFx0XHRcdFx0XHRpZiAobSlcblx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdHZvbHVtZV9sZXZlbCA9IHBhcnNlSW50KG1bMV0pO1xuXHRcdFx0XHRcdFx0XHRcdC8vY29uc29sZS5sb2cobSk7XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0ZWxzZVxuXHRcdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdFx0dm9sdW1lX2xldmVsID0gMTtcblx0XHRcdFx0XHRcdFx0XHR0aHJvdyBFcnJvclxuXHRcdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdFx0bGV0IHZvbHVtZV90aXRsZSA9IHRyaW0odHIudGV4dCgpLCB0cnVlKTtcblxuXHRcdFx0XHRcdFx0XHRsZXQgbm93Vm9sdW1lOiBUcmVlTm9kZTxJUm93Vm9sdW1lPjtcblxuXHRcdFx0XHRcdFx0XHRpZiAoY3VycmVudFZvbHVtZSlcblx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdGxldCBsYXN0TGV2ZWwgPSBjdXJyZW50Vm9sdW1lLmdldDxudW1iZXI+KCdsZXZlbCcpIGFzIG51bWJlcjtcblx0XHRcdFx0XHRcdFx0XHRsZXQgcGFyZW50Vm9sdW1lOiBUcmVlTm9kZTxJUm93Vm9sdW1lPjtcblxuXHRcdFx0XHRcdFx0XHRcdGlmICh2b2x1bWVfbGV2ZWwgPiAxKVxuXHRcdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHRcdGlmIChsYXN0TGV2ZWwgPT0gdm9sdW1lX2xldmVsKVxuXHRcdFx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRwYXJlbnRWb2x1bWUgPSBjdXJyZW50Vm9sdW1lLnBhcmVudDtcblx0XHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0XHRcdGVsc2UgaWYgKGxhc3RMZXZlbCA9ICh2b2x1bWVfbGV2ZWwgKyAxKSlcblx0XHRcdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0cGFyZW50Vm9sdW1lID0gY3VycmVudFZvbHVtZTtcblx0XHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0XHRcdGVsc2Vcblx0XHRcdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0dGhyb3cgRXJyb3Jcblx0XHRcdFx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0XHRcdFx0aWYgKHZvbHVtZV90aXRsZSA9PSAnJylcblx0XHRcdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0bGV0IG4gPSB0ci5uZXh0VW50aWwoJy53aWRnZXQtdG9jLWNoYXB0ZXInKVxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdC5lcSgtMSlcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHQubmV4dCgnLndpZGdldC10b2MtY2hhcHRlcicpXG5cdFx0XHRcdFx0XHRcdFx0XHRcdDtcblxuXHRcdFx0XHRcdFx0XHRcdFx0XHQvL2NvbnNvbGUubG9nKG4sIG4uYXR0cignY2xhc3MnKSk7XG5cblx0XHRcdFx0XHRcdFx0XHRcdFx0aWYgKCFuLmxlbmd0aCB8fCBuLmhhc0NsYXNzKGB3aWRnZXQtdG9jLWxldmVsJHt2b2x1bWVfbGV2ZWwgLSAxfWApKVxuXHRcdFx0XHRcdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0bm93Vm9sdW1lID0gcGFyZW50Vm9sdW1lO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdFx0XHRcdGlmICghbm93Vm9sdW1lKVxuXHRcdFx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRub3dWb2x1bWUgPSBub3ZlbFRyZWUuYWRkVm9sdW1lKHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHR2b2x1bWVfdGl0bGUsXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0dm9sdW1lX2xldmVsLFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdHZvbHVtZV9pbmRleDogcGFyZW50Vm9sdW1lLnNpemUoKSxcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHR0b3RhbF9pZHg6IHRvdGFsX2lkeCsrLFxuXHRcdFx0XHRcdFx0XHRcdFx0XHR9LCBwYXJlbnRWb2x1bWUpO1xuXHRcdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHRcdGlmICghbm93Vm9sdW1lKVxuXHRcdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdFx0bm93Vm9sdW1lID0gbm92ZWxUcmVlLmFkZFZvbHVtZSh7XG5cdFx0XHRcdFx0XHRcdFx0XHR2b2x1bWVfdGl0bGUsXG5cdFx0XHRcdFx0XHRcdFx0XHR2b2x1bWVfbGV2ZWwsXG5cdFx0XHRcdFx0XHRcdFx0XHR2b2x1bWVfaW5kZXg6IG5vdmVsVHJlZS5yb290KCkuc2l6ZSgpLFxuXHRcdFx0XHRcdFx0XHRcdFx0dG90YWxfaWR4OiB0b3RhbF9pZHgrKyxcblx0XHRcdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHRcdGN1cnJlbnRWb2x1bWUgPSBub3dWb2x1bWU7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRlbHNlIGlmICgxKVxuXHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRpZiAoIWN1cnJlbnRWb2x1bWUpXG5cdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHQvKlxuXHRcdFx0XHRcdFx0XHRcdGN1cnJlbnRWb2x1bWUgPSB2b2x1bWVfbGlzdFt2b2x1bWVfbGlzdC5sZW5ndGhdID0ge1xuXHRcdFx0XHRcdFx0XHRcdFx0dm9sdW1lX2luZGV4OiB2b2x1bWVfbGlzdC5sZW5ndGgsXG5cdFx0XHRcdFx0XHRcdFx0XHR2b2x1bWVfdGl0bGU6ICdudWxsJyxcblx0XHRcdFx0XHRcdFx0XHRcdGNoYXB0ZXJfbGlzdDogW10sXG5cdFx0XHRcdFx0XHRcdFx0fTtcblx0XHRcdFx0XHRcdFx0XHQqL1xuXG5cdFx0XHRcdFx0XHRcdFx0bGV0IHZvbHVtZV90aXRsZSA9ICdudWxsJztcblx0XHRcdFx0XHRcdFx0XHRsZXQgdm9sdW1lX2xldmVsID0gbnVsbDtcblxuXHRcdFx0XHRcdFx0XHRcdGN1cnJlbnRWb2x1bWUgPSBub3ZlbFRyZWUuYWRkVm9sdW1lKHtcblx0XHRcdFx0XHRcdFx0XHRcdHZvbHVtZV90aXRsZSxcblx0XHRcdFx0XHRcdFx0XHRcdHZvbHVtZV9sZXZlbCxcblx0XHRcdFx0XHRcdFx0XHRcdHZvbHVtZV9pbmRleDogbm92ZWxUcmVlLnJvb3QoKS5zaXplKCksXG5cdFx0XHRcdFx0XHRcdFx0XHR0b3RhbF9pZHg6IHRvdGFsX2lkeCsrLFxuXHRcdFx0XHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdFx0bGV0IGEgPSB0ci5maW5kKCdhOmVxKDApJyk7XG5cblx0XHRcdFx0XHRcdFx0bGV0IGNoYXB0ZXJfdGl0bGUgPSB0cmltKGEuZmluZCgnLndpZGdldC10b2MtZXBpc29kZS10aXRsZUxhYmVsJykudGV4dCgpLCB0cnVlKTtcblxuXHRcdFx0XHRcdFx0XHRsZXQgY2hhcHRlcl9kYXRlO1xuXHRcdFx0XHRcdFx0XHRsZXQgZGQ7XG5cdFx0XHRcdFx0XHRcdGxldCBkYSA9IGEuZmluZCgnLndpZGdldC10b2MtZXBpc29kZS1kYXRlUHVibGlzaGVkJyk7XG5cblx0XHRcdFx0XHRcdFx0aWYgKCFkZClcblx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdGRkID0gZGEuYXR0cignZGF0ZXRpbWUnKS5yZXBsYWNlKC9eXFxzK3xcXHMrJC9nLCAnJyk7XG5cdFx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0XHRpZiAoZGQpXG5cdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHRjaGFwdGVyX2RhdGUgPSBtb21lbnQoZGQpLmxvY2FsKCk7XG5cdFx0XHRcdFx0XHRcdFx0X2NhY2hlX2RhdGVzLnB1c2goY2hhcHRlcl9kYXRlLnVuaXgoKSk7XG5cdFx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0XHRsZXQgaHJlZiA9IGEucHJvcCgnaHJlZicpO1xuXG5cdFx0XHRcdFx0XHRcdGxldCBkYXRhID0gc2VsZi5wYXJzZVVybChocmVmKTtcblxuXHRcdFx0XHRcdFx0XHRpZiAoIWRhdGEuY2hhcHRlcl9pZClcblx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdC8qXG5cdFx0XHRcdFx0XHRcdFx0Y29uc29sZS5sb2coYSk7XG5cdFx0XHRcdFx0XHRcdFx0Y29uc29sZS5sb2coZGF0YSk7XG5cdFx0XHRcdFx0XHRcdFx0Y29uc29sZS5sb2coaHJlZik7XG5cdFx0XHRcdFx0XHRcdFx0Y29uc29sZS5sb2coYS5hdHRyKCdocmVmJykpO1xuXHRcdFx0XHRcdFx0XHRcdGNvbnNvbGUubG9nKG5ldyBVUkwoaHJlZiwgZG9tLnVybCkpO1xuXG5cdFx0XHRcdFx0XHRcdFx0Y29uc29sZS5sb2coZG9tLl9vcHRpb25zKTtcblx0XHRcdFx0XHRcdFx0XHQqL1xuXG5cdFx0XHRcdFx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKClcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRlbHNlXG5cdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHRocmVmID0gc2VsZi5tYWtlVXJsKGRhdGEpO1xuXG5cdFx0XHRcdFx0XHRcdFx0ZGF0YS51cmwgPSBocmVmO1xuXHRcdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdFx0Lypcblx0XHRcdFx0XHRcdFx0Y3VycmVudFZvbHVtZVxuXHRcdFx0XHRcdFx0XHRcdC5jaGFwdGVyX2xpc3Rcblx0XHRcdFx0XHRcdFx0XHQucHVzaCh7XG5cdFx0XHRcdFx0XHRcdFx0XHRjaGFwdGVyX2luZGV4OiBjdXJyZW50Vm9sdW1lLmNoYXB0ZXJfbGlzdC5sZW5ndGgsXG5cdFx0XHRcdFx0XHRcdFx0XHRjaGFwdGVyX3RpdGxlOiBjaGFwdGVyX3RpdGxlLnJlcGxhY2UoL15cXHMrfFxccyskL2csICcnKSxcblx0XHRcdFx0XHRcdFx0XHRcdGNoYXB0ZXJfaWQ6IGRhdGEuY2hhcHRlcl9pZCxcblx0XHRcdFx0XHRcdFx0XHRcdGNoYXB0ZXJfdXJsOiBocmVmLFxuXHRcdFx0XHRcdFx0XHRcdFx0Y2hhcHRlcl91cmxfZGF0YTogZGF0YSxcblx0XHRcdFx0XHRcdFx0XHRcdGNoYXB0ZXJfZGF0ZSxcblx0XHRcdFx0XHRcdFx0XHR9KVxuXHRcdFx0XHRcdFx0XHQ7XG5cdFx0XHRcdFx0XHRcdCovXG5cblx0XHRcdFx0XHRcdFx0bGV0IGNoYXB0ZXIgPSB7XG5cdFx0XHRcdFx0XHRcdFx0Y2hhcHRlcl90aXRsZSxcblx0XHRcdFx0XHRcdFx0XHRjaGFwdGVyX2lkOiBkYXRhLmNoYXB0ZXJfaWQsXG5cdFx0XHRcdFx0XHRcdFx0Y2hhcHRlcl91cmw6IGhyZWYsXG5cdFx0XHRcdFx0XHRcdFx0Y2hhcHRlcl91cmxfZGF0YTogZGF0YSxcblx0XHRcdFx0XHRcdFx0XHRjaGFwdGVyX2RhdGUsXG5cdFx0XHRcdFx0XHRcdFx0Y2hhcHRlcl9pbmRleDogY3VycmVudFZvbHVtZS5zaXplKCksXG5cdFx0XHRcdFx0XHRcdFx0dG90YWxfaWR4OiB0b3RhbF9pZHgrKyxcblx0XHRcdFx0XHRcdFx0fTtcblxuXHRcdFx0XHRcdFx0XHRub3ZlbFRyZWUuYWRkQ2hhcHRlcihjaGFwdGVyLCBjdXJyZW50Vm9sdW1lKVxuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH0pXG5cdFx0XHRcdDtcblxuXHRcdFx0XHRfY2FjaGVfZGF0ZXMuc29ydCgpO1xuXG5cdFx0XHRcdGxldCBub3ZlbF9kYXRlID0gbW9tZW50LnVuaXgoX2NhY2hlX2RhdGVzW19jYWNoZV9kYXRlcy5sZW5ndGggLSAxXSkubG9jYWwoKTtcblxuXHRcdFx0XHRsZXQgZGF0YV9tZXRhOiBJTWRjb25mTWV0YSA9IHt9O1xuXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRkYXRhX21ldGEubm92ZWwgPSB7fTtcblx0XHRcdFx0XHRkYXRhX21ldGEubm92ZWwudGFncyA9IFtdO1xuXG5cdFx0XHRcdFx0JCgnI3dvcmtNZXRhLWZsYWdzJylcblx0XHRcdFx0XHRcdC5maW5kKCcjd29ya0dlbnJlIGEsICN3b3JrTWV0YS1hdHRlbnRpb25zQW5kVGFncyBbaXRlbXByb3A9XCJrZXl3b3Jkc1wiXSBhJylcblx0XHRcdFx0XHRcdC5lYWNoKGZ1bmN0aW9uICgpXG5cdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdGxldCB0ID0gJCh0aGlzKS50ZXh0KCkucmVwbGFjZSgvXlxccyt8XFxzKyQvZywgJycpO1xuXHRcdFx0XHRcdFx0XHRpZiAodClcblx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdGRhdGFfbWV0YS5ub3ZlbC50YWdzLnB1c2godCk7XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdH0pXG5cdFx0XHRcdFx0O1xuXG5cdFx0XHRcdFx0JCgnI3RhYmxlLW9mLWNvbnRlbnRzIC53aWRnZXQtdG9jLXdvcmtTdGF0dXMgc3BhbjplcSgwKScpXG5cdFx0XHRcdFx0XHQuZWFjaChmdW5jdGlvbiAoKVxuXHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRkYXRhX21ldGEubm92ZWwuc3RhdHVzID0gJCh0aGlzKS50ZXh0KCkucmVwbGFjZSgvXlxccyt8XFxzKyQvZywgJycpO1xuXHRcdFx0XHRcdFx0fSlcblx0XHRcdFx0XHQ7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRyZXR1cm4ge1xuXG5cdFx0XHRcdFx0Li4uZGF0YV9tZXRhLFxuXG5cdFx0XHRcdFx0dXJsOiBkb20udXJsLFxuXHRcdFx0XHRcdHVybF9kYXRhLFxuXG5cdFx0XHRcdFx0bm92ZWxfdGl0bGUsXG5cdFx0XHRcdFx0bm92ZWxfYXV0aG9yLFxuXG5cdFx0XHRcdFx0bm92ZWxfZGVzYyxcblx0XHRcdFx0XHRub3ZlbF9kYXRlLFxuXHRcdFx0XHRcdG5vdmVsX3B1Ymxpc2hlcixcblxuXHRcdFx0XHRcdC8vdm9sdW1lX2xpc3QsXG5cdFx0XHRcdFx0bm92ZWxUcmVlLFxuXG5cdFx0XHRcdFx0Y2hlY2tkYXRlOiBtb21lbnQoKS5sb2NhbCgpLFxuXG5cdFx0XHRcdFx0aW1nczogW10gYXMgc3RyaW5nW10sXG5cdFx0XHRcdH0gYXMgSU5vdmVsO1xuXHRcdFx0fSlcblx0XHRcdDtcblx0fVxuXG59XG5cbmV4cG9ydCBkZWZhdWx0IE5vdmVsU2l0ZUtha3V5b211O1xuIl19