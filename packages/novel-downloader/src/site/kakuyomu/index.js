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
                $('#workMeta-flags')
                    .find('#workMeta-attention li, #workGenre > a:eq(0)')
                    .each(function () {
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
exports.NovelSiteKakuyomu = NovelSiteKakuyomu;
exports.default = NovelSiteKakuyomu;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7O0dBRUc7Ozs7Ozs7O0FBRUgscUNBQWtDO0FBQ2xDLHVDQUF3RjtBQU94Riw2Q0FBK0Q7QUFFL0QseUNBQWdDO0FBRWhDLG9DQUEwRjtBQUUxRixvQ0FBa0M7QUFHbEMsSUFBYSxpQkFBaUIsR0FBOUIsTUFBYSxpQkFBa0IsU0FBUSxjQUFhO0lBSW5EOztPQUVHO0lBQ0gsT0FBTyxDQUFDLE1BQTJCLEVBQUUsSUFBZTtRQUVuRCxJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUMsSUFBSSxJQUFJLE1BQU0sQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsWUFBWSxHQUFHLE1BQU0sQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztRQUUvRSxhQUFhO1FBQ2IsT0FBTyxJQUFJLGVBQUcsQ0FBQyw2QkFBNkIsTUFBTSxDQUFDLFFBQVEsR0FBRyxHQUFHLEVBQUUsQ0FBQyxDQUFDO0lBQ3RFLENBQUM7SUFFRCxRQUFRLENBQUMsR0FBaUI7UUFFekIsSUFBSSxNQUFNLEdBQUc7WUFDWixHQUFHO1lBRUgsU0FBUyxFQUFFLElBQUk7WUFDZixRQUFRLEVBQUUsSUFBSTtZQUNkLFVBQVUsRUFBRSxJQUFJO1NBRWhCLENBQUM7UUFFRix1QkFBdUI7UUFFdkIsSUFDQTtZQUNDLGFBQWE7WUFDYixNQUFNLENBQUMsR0FBRyxHQUFHLElBQUksZUFBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQzFCLGFBQWE7WUFDYixHQUFHLEdBQUcsTUFBTSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUM7U0FDdEI7UUFDRCxPQUFPLENBQUMsRUFDUjtZQUNDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxHQUFHLEtBQUssR0FBRyxHQUFHLENBQUMsQ0FBQztTQUN6QztRQUVELElBQUksT0FBTyxHQUFHLElBQUksUUFB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RSxDQUFDLENBQUM7Z0JBQ25FLENBQUMsQ0FBQyxDQUNGO2FBQ0Q7WUFFRCxPQUFPLGdDQUVILFNBQVMsS0FFWixHQUFHLEVBQUUsR0FBRyxDQUFDLEdBQUcsRUFDWixRQUFRO2dCQUVSLFdBQVc7Z0JBQ1gsWUFBWTtnQkFFWixVQUFVO2dCQUNWLFVBQVU7Z0JBQ1YsZUFBZTtnQkFFZixjQUFjO2dCQUNkLFNBQVMsRUFFVCxTQUFTLEVBQUUsY0FBTSxFQUFFLENBQUMsS0FBSyxFQUFFLEVBRTNCLElBQUksRUFBRSxFQUFjLEdBQ1YsQ0FBQztRQUNiLENBQUMsQ0FBQyxDQUNEO0lBQ0gsQ0FBQztDQUVELENBQUE7QUFuWnVCLHVCQUFLLEdBQUcsVUFBVSxDQUFDO0FBRjlCLGlCQUFpQjtJQUQ3Qix3QkFBZ0IsRUFBaUQ7R0FDckQsaUJBQWlCLENBcVo3QjtBQXJaWSw4Q0FBaUI7QUF1WjlCLGtCQUFlLGlCQUFpQixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDcmVhdGVkIGJ5IHVzZXIgb24gMjAxOC8zLzE3LzAxNy5cbiAqL1xuXG5pbXBvcnQgeyB0cmltIH0gZnJvbSAnLi4vLi4vdXRpbCc7XG5pbXBvcnQgTm92ZWxTaXRlRGVtbywgeyBJRG93bmxvYWRPcHRpb25zLCBJTm92ZWwsIElPcHRpb25zUnVudGltZSB9IGZyb20gJy4uL2RlbW8vdHJlZSc7XG5pbXBvcnQgeyBJUm93Vm9sdW1lLCBUcmVlTm9kZSB9IGZyb20gJy4uLy4uL3RyZWUvaW5kZXgnO1xuXG5pbXBvcnQgZnMgPSByZXF1aXJlKCdmcy1leHRyYScpO1xuaW1wb3J0IHsgdHJpbUZpbGVuYW1lIH0gZnJvbSAnZnMtaWNvbnYvdXRpbCc7XG5pbXBvcnQgKiBhcyBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0IG5vdmVsSW5mbywgeyBJTWRjb25mTWV0YSB9IGZyb20gJ25vZGUtbm92ZWwtaW5mbyc7XG5pbXBvcnQgeyBmcm9tVVJMLCBJRnJvbVVybE9wdGlvbnMsIElKU0RPTSB9IGZyb20gJ2pzZG9tLWV4dHJhJztcblxuaW1wb3J0IHsgVVJMIH0gZnJvbSAnanNkb20tdXJsJztcblxuaW1wb3J0IE5vdmVsU2l0ZSwgeyBzdGF0aWNJbXBsZW1lbnRzLCBkZWZhdWx0SlNET01PcHRpb25zLCBTWU1CT0xfQ0FDSEUgfSBmcm9tICcuLi9pbmRleCc7XG5pbXBvcnQgeyBQcm9taXNlQmx1ZWJpcmQsIGJsdWViaXJkRGVjb3JhdG9yIH0gZnJvbSAnLi4vaW5kZXgnO1xuaW1wb3J0IHsgbW9tZW50IH0gZnJvbSAnLi4vaW5kZXgnO1xuXG5Ac3RhdGljSW1wbGVtZW50czxOb3ZlbFNpdGUuSU5vdmVsU2l0ZVN0YXRpYzxOb3ZlbFNpdGVLYWt1eW9tdT4+KClcbmV4cG9ydCBjbGFzcyBOb3ZlbFNpdGVLYWt1eW9tdSBleHRlbmRzIE5vdmVsU2l0ZURlbW9cbntcblx0cHVibGljIHN0YXRpYyByZWFkb25seSBJREtFWSA9ICdrYWt1eW9tdSc7XG5cblx0LyoqXG5cdCAqIGh0dHBzOi8va2FrdXlvbXUuanAvd29ya3MvNDg1MjIwMTQyNTE1NDg5ODIxNS9lcGlzb2Rlcy80ODUyMjAxNDI1MTU0OTM2MzE1XG5cdCAqL1xuXHRtYWtlVXJsKHVybG9iajogTm92ZWxTaXRlLklQYXJzZVVybCwgYm9vbCA/OiBib29sZWFuKTogVVJMXG5cdHtcblx0XHRsZXQgcGFkID0gKCFib29sICYmIHVybG9iai5jaGFwdGVyX2lkKSA/ICcvZXBpc29kZXMvJyArIHVybG9iai5jaGFwdGVyX2lkIDogJyc7XG5cblx0XHQvLyBAdHMtaWdub3JlXG5cdFx0cmV0dXJuIG5ldyBVUkwoYGh0dHBzOi8va2FrdXlvbXUuanAvd29ya3MvJHt1cmxvYmoubm92ZWxfaWR9JHtwYWR9YCk7XG5cdH1cblxuXHRwYXJzZVVybCh1cmw6IHN0cmluZyB8IFVSTCk6IE5vdmVsU2l0ZS5JUGFyc2VVcmxcblx0e1xuXHRcdGxldCB1cmxvYmogPSB7XG5cdFx0XHR1cmwsXG5cblx0XHRcdG5vdmVsX3BpZDogbnVsbCxcblx0XHRcdG5vdmVsX2lkOiBudWxsLFxuXHRcdFx0Y2hhcHRlcl9pZDogbnVsbCxcblxuXHRcdH07XG5cblx0XHQvL3VybCA9IHVybC50b1N0cmluZygpO1xuXG5cdFx0dHJ5XG5cdFx0e1xuXHRcdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdFx0dXJsb2JqLnVybCA9IG5ldyBVUkwodXJsKTtcblx0XHRcdC8vIEB0cy1pZ25vcmVcblx0XHRcdHVybCA9IHVybG9iai51cmwuaHJlZjtcblx0XHR9XG5cdFx0Y2F0Y2ggKGUpXG5cdFx0e1xuXHRcdFx0Y29uc29sZS53YXJuKGUudG9TdHJpbmcoKSArIGAgXCIke3VybH1cImApO1xuXHRcdH1cblxuXHRcdGlmICh0eXBlb2YgdXJsICE9ICdzdHJpbmcnKVxuXHRcdHtcblx0XHRcdC8vIEB0cy1pZ25vcmVcblx0XHRcdHRocm93IG5ldyBUeXBlRXJyb3IodXJsKTtcblx0XHR9XG5cblx0XHRsZXQgcjogUmVnRXhwO1xuXHRcdGxldCBtO1xuXG5cdFx0ciA9IC9eKFxcZHsxMCx9KSQvO1xuXHRcdGlmIChtID0gci5leGVjKHVybCkpXG5cdFx0e1xuXHRcdFx0dXJsb2JqLm5vdmVsX2lkID0gbVsxXTtcblx0XHRcdHJldHVybiB1cmxvYmo7XG5cdFx0fVxuXG5cdFx0ciA9IC9rYWt1eW9tdVxcLmpwXFwvd29ya3NcXC8oXFxkKykoPzpcXC8oPzplcGlzb2Rlc1xcLyhcXGQrKSkpPy9nO1xuXHRcdGlmIChtID0gci5leGVjKHVybCkpXG5cdFx0e1xuXHRcdFx0dXJsb2JqLm5vdmVsX2lkID0gbVsxXTtcblx0XHRcdHVybG9iai5jaGFwdGVyX2lkID0gbVsyXTtcblxuXHRcdFx0cmV0dXJuIHVybG9iajtcblx0XHR9XG5cblx0XHRyZXR1cm4gdXJsb2JqO1xuXHR9XG5cblx0cHJvdGVjdGVkIF9wYXJzZUNoYXB0ZXI8VD4ocmV0LCBvcHRpb25zUnVudGltZSwgY2FjaGUpOiBzdHJpbmdcblx0e1xuXHRcdGlmICghcmV0KVxuXHRcdHtcblx0XHRcdHJldHVybiAnJztcblx0XHR9XG5cblx0XHRyZXR1cm4gcmV0LmRvbS4kKCcjY29udGVudE1haW4gLndpZGdldC1lcGlzb2RlQm9keScpLnRleHQoKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBAdG9kbyDpnIDopoHmlLnoia/mlK/mj7TkuInntJrnm67pjIRcblx0ICovXG5cdGFzeW5jIGdldF92b2x1bWVfbGlzdDxUIGV4dGVuZHMgSU9wdGlvbnNSdW50aW1lPih1cmw6IHN0cmluZyB8IFVSTCxcblx0XHRvcHRpb25zUnVudGltZTogUGFydGlhbDxUICYgSURvd25sb2FkT3B0aW9ucz4gPSB7fVxuXHQpOiBQcm9taXNlPElOb3ZlbD5cblx0e1xuXHRcdGNvbnN0IHNlbGYgPSB0aGlzO1xuXG5cdFx0dXJsID0gYXdhaXQgdGhpcy5jcmVhdGVNYWluVXJsKHVybCBhcyBhbnkpO1xuXG5cdFx0cmV0dXJuIGF3YWl0IGZyb21VUkwodXJsLCBvcHRpb25zUnVudGltZS5vcHRpb25zSlNET00pXG5cdFx0XHQudGhlbihhc3luYyBmdW5jdGlvbiAoZG9tOiBJSlNET00pXG5cdFx0XHR7XG5cdFx0XHRcdGNvbnN0ICQgPSBkb20uJDtcblxuXHRcdFx0XHRsZXQgbm92ZWxfdGl0bGUgPSBkb20uJCgnI3dvcmtUaXRsZScpLnRleHQoKTtcblx0XHRcdFx0bGV0IG5vdmVsX2F1dGhvciA9IGRvbS4kKCcjd29ya0F1dGhvci1hY3Rpdml0eU5hbWUnKS50ZXh0KCk7XG5cblx0XHRcdFx0bGV0IG5vdmVsX2Rlc2M6IHN0cmluZztcblxuXHRcdFx0XHRkb20uJCgnI2Rlc2NyaXB0aW9uJykuZWFjaChmdW5jdGlvbiAoKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0JCgnI2ludHJvZHVjdGlvbicpLmFkZENsYXNzKCdpc0V4cGFuZGVkJyk7XG5cdFx0XHRcdFx0JCgnLnVpLXRydW5jYXRlVGV4dC1leHBhbmRCdXR0b24nKS5yZW1vdmUoKTtcblx0XHRcdFx0XHQkKCcudGVzdC1pbnRyb2R1Y3Rpb24tcmVzdC10ZXh0Jykuc2hvdygpO1xuXG5cdFx0XHRcdFx0bGV0IGQgPSBbXTtcblxuXHRcdFx0XHRcdCQodGhpcylcblx0XHRcdFx0XHRcdC5maW5kKCcjY2F0Y2hwaHJhc2UtYm9keSwgI2NhdGNocGhyYXNlLWF1dGhvckxhYmVsJylcblx0XHRcdFx0XHRcdC5lYWNoKGZ1bmN0aW9uICgpXG5cdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdGQucHVzaCgkKHRoaXMpLnRleHQoKS5yZXBsYWNlKC9cXHMrJC9nLCAnJykpO1xuXHRcdFx0XHRcdFx0fSlcblx0XHRcdFx0XHQ7XG5cblx0XHRcdFx0XHRpZiAoZC5sZW5ndGgpXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0ZC5wdXNoKCcgJyk7XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0ZC5wdXNoKCQoJyNpbnRyb2R1Y3Rpb24nKS50ZXh0KCkucmVwbGFjZSgvXFxzKyQvZywgJycpKTtcblxuXHRcdFx0XHRcdG5vdmVsX2Rlc2MgPSBkXG5cdFx0XHRcdFx0XHQuZmlsdGVyKHYgPT4gdilcblx0XHRcdFx0XHRcdC5qb2luKFwiXFxuXCIpXG5cdFx0XHRcdFx0XHQucmVwbGFjZSgvWyBcXHTjgIBdKyQvZ20sICcnKVxuXHRcdFx0XHRcdDtcblxuXHRcdFx0XHR9KTtcblxuXHRcdFx0XHRsZXQgbm92ZWxfcHVibGlzaGVyID0gc2VsZi5JREtFWTtcblxuXHRcdFx0XHRsZXQgdXJsX2RhdGEgPSBzZWxmLnBhcnNlVXJsKGRvbS51cmwuaHJlZik7XG5cblx0XHRcdFx0bGV0IHZvbHVtZV9saXN0ID0gW10gYXMgTm92ZWxTaXRlLklWb2x1bWVbXTtcblxuXHRcdFx0XHRjb25zdCBub3ZlbFRyZWUgPSBvcHRpb25zUnVudGltZS5ub3ZlbFRyZWU7XG5cdFx0XHRcdGxldCBjdXJyZW50Vm9sdW1lOiBUcmVlTm9kZTxJUm93Vm9sdW1lPjtcblxuXHRcdFx0XHRsZXQgdGFibGUgPSBkb20uJCgnI3RhYmxlLW9mLWNvbnRlbnRzJykuZmluZCgnLndpZGdldC10b2MtY2hhcHRlciwgLndpZGdldC10b2MtZXBpc29kZScpO1xuXG5cdFx0XHRcdGxldCBfY2FjaGVfZGF0ZXMgPSBbXTtcblxuXHRcdFx0XHRsZXQgdG90YWxfaWR4ID0gMDtcblxuXHRcdFx0XHR0YWJsZVxuXHRcdFx0XHRcdC5lYWNoKGZ1bmN0aW9uIChpbmRleClcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRsZXQgdHIgPSBkb20uJCh0aGlzKTtcblxuXHRcdFx0XHRcdFx0aWYgKHRyLmlzKCcud2lkZ2V0LXRvYy1jaGFwdGVyJykpXG5cdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdC8qXG5cdFx0XHRcdFx0XHRcdGN1cnJlbnRWb2x1bWUgPSB2b2x1bWVfbGlzdFt2b2x1bWVfbGlzdC5sZW5ndGhdID0ge1xuXHRcdFx0XHRcdFx0XHRcdHZvbHVtZV9pbmRleDogdm9sdW1lX2xpc3QubGVuZ3RoLFxuXHRcdFx0XHRcdFx0XHRcdHZvbHVtZV90aXRsZTogdHIudGV4dCgpLnJlcGxhY2UoL15cXHMrfFxccyskL2csICcnKSxcblx0XHRcdFx0XHRcdFx0XHRjaGFwdGVyX2xpc3Q6IFtdLFxuXHRcdFx0XHRcdFx0XHR9O1xuXHRcdFx0XHRcdFx0XHQqL1xuXG5cdFx0XHRcdFx0XHRcdGxldCB2b2x1bWVfbGV2ZWw6IG51bWJlciA9IG51bGw7XG5cblx0XHRcdFx0XHRcdFx0bGV0IG0gPSB0ci5hdHRyKCdjbGFzcycpLm1hdGNoKC9cXGJ3aWRnZXQtdG9jLWxldmVsKFxcZCspXFxiLyk7XG5cdFx0XHRcdFx0XHRcdGlmIChtKVxuXHRcdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdFx0dm9sdW1lX2xldmVsID0gcGFyc2VJbnQobVsxXSk7XG5cdFx0XHRcdFx0XHRcdFx0Ly9jb25zb2xlLmxvZyhtKTtcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRlbHNlXG5cdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHR2b2x1bWVfbGV2ZWwgPSAxO1xuXHRcdFx0XHRcdFx0XHRcdHRocm93IEVycm9yXG5cdFx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0XHRsZXQgdm9sdW1lX3RpdGxlID0gdHJpbSh0ci50ZXh0KCksIHRydWUpO1xuXG5cdFx0XHRcdFx0XHRcdGxldCBub3dWb2x1bWU6IFRyZWVOb2RlPElSb3dWb2x1bWU+O1xuXG5cdFx0XHRcdFx0XHRcdGlmIChjdXJyZW50Vm9sdW1lKVxuXHRcdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdFx0bGV0IGxhc3RMZXZlbCA9IGN1cnJlbnRWb2x1bWUuZ2V0PG51bWJlcj4oJ2xldmVsJykgYXMgbnVtYmVyO1xuXHRcdFx0XHRcdFx0XHRcdGxldCBwYXJlbnRWb2x1bWU6IFRyZWVOb2RlPElSb3dWb2x1bWU+O1xuXG5cdFx0XHRcdFx0XHRcdFx0aWYgKHZvbHVtZV9sZXZlbCA+IDEpXG5cdFx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdFx0aWYgKGxhc3RMZXZlbCA9PSB2b2x1bWVfbGV2ZWwpXG5cdFx0XHRcdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdHBhcmVudFZvbHVtZSA9IGN1cnJlbnRWb2x1bWUucGFyZW50O1xuXHRcdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRcdFx0ZWxzZSBpZiAobGFzdExldmVsID0gKHZvbHVtZV9sZXZlbCArIDEpKVxuXHRcdFx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRwYXJlbnRWb2x1bWUgPSBjdXJyZW50Vm9sdW1lO1xuXHRcdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRcdFx0ZWxzZVxuXHRcdFx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdFx0XHR0aHJvdyBFcnJvclxuXHRcdFx0XHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHRcdFx0XHRpZiAodm9sdW1lX3RpdGxlID09ICcnKVxuXHRcdFx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRsZXQgbiA9IHRyLm5leHRVbnRpbCgnLndpZGdldC10b2MtY2hhcHRlcicpXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0LmVxKC0xKVxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdC5uZXh0KCcud2lkZ2V0LXRvYy1jaGFwdGVyJylcblx0XHRcdFx0XHRcdFx0XHRcdFx0O1xuXG5cdFx0XHRcdFx0XHRcdFx0XHRcdC8vY29uc29sZS5sb2cobiwgbi5hdHRyKCdjbGFzcycpKTtcblxuXHRcdFx0XHRcdFx0XHRcdFx0XHRpZiAoIW4ubGVuZ3RoIHx8IG4uaGFzQ2xhc3MoYHdpZGdldC10b2MtbGV2ZWwke3ZvbHVtZV9sZXZlbCAtIDF9YCkpXG5cdFx0XHRcdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRub3dWb2x1bWUgPSBwYXJlbnRWb2x1bWU7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0XHRcdFx0aWYgKCFub3dWb2x1bWUpXG5cdFx0XHRcdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdG5vd1ZvbHVtZSA9IG5vdmVsVHJlZS5hZGRWb2x1bWUoe1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdHZvbHVtZV90aXRsZSxcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHR2b2x1bWVfbGV2ZWwsXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0dm9sdW1lX2luZGV4OiBwYXJlbnRWb2x1bWUuc2l6ZSgpLFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdHRvdGFsX2lkeDogdG90YWxfaWR4KyssXG5cdFx0XHRcdFx0XHRcdFx0XHRcdH0sIHBhcmVudFZvbHVtZSk7XG5cdFx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdFx0aWYgKCFub3dWb2x1bWUpXG5cdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHRub3dWb2x1bWUgPSBub3ZlbFRyZWUuYWRkVm9sdW1lKHtcblx0XHRcdFx0XHRcdFx0XHRcdHZvbHVtZV90aXRsZSxcblx0XHRcdFx0XHRcdFx0XHRcdHZvbHVtZV9sZXZlbCxcblx0XHRcdFx0XHRcdFx0XHRcdHZvbHVtZV9pbmRleDogbm92ZWxUcmVlLnJvb3QoKS5zaXplKCksXG5cdFx0XHRcdFx0XHRcdFx0XHR0b3RhbF9pZHg6IHRvdGFsX2lkeCsrLFxuXHRcdFx0XHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdFx0Y3VycmVudFZvbHVtZSA9IG5vd1ZvbHVtZTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdGVsc2UgaWYgKDEpXG5cdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdGlmICghY3VycmVudFZvbHVtZSlcblx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdC8qXG5cdFx0XHRcdFx0XHRcdFx0Y3VycmVudFZvbHVtZSA9IHZvbHVtZV9saXN0W3ZvbHVtZV9saXN0Lmxlbmd0aF0gPSB7XG5cdFx0XHRcdFx0XHRcdFx0XHR2b2x1bWVfaW5kZXg6IHZvbHVtZV9saXN0Lmxlbmd0aCxcblx0XHRcdFx0XHRcdFx0XHRcdHZvbHVtZV90aXRsZTogJ251bGwnLFxuXHRcdFx0XHRcdFx0XHRcdFx0Y2hhcHRlcl9saXN0OiBbXSxcblx0XHRcdFx0XHRcdFx0XHR9O1xuXHRcdFx0XHRcdFx0XHRcdCovXG5cblx0XHRcdFx0XHRcdFx0XHRsZXQgdm9sdW1lX3RpdGxlID0gJ251bGwnO1xuXHRcdFx0XHRcdFx0XHRcdGxldCB2b2x1bWVfbGV2ZWwgPSBudWxsO1xuXG5cdFx0XHRcdFx0XHRcdFx0Y3VycmVudFZvbHVtZSA9IG5vdmVsVHJlZS5hZGRWb2x1bWUoe1xuXHRcdFx0XHRcdFx0XHRcdFx0dm9sdW1lX3RpdGxlLFxuXHRcdFx0XHRcdFx0XHRcdFx0dm9sdW1lX2xldmVsLFxuXHRcdFx0XHRcdFx0XHRcdFx0dm9sdW1lX2luZGV4OiBub3ZlbFRyZWUucm9vdCgpLnNpemUoKSxcblx0XHRcdFx0XHRcdFx0XHRcdHRvdGFsX2lkeDogdG90YWxfaWR4KyssXG5cdFx0XHRcdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0XHRsZXQgYSA9IHRyLmZpbmQoJ2E6ZXEoMCknKTtcblxuXHRcdFx0XHRcdFx0XHRsZXQgY2hhcHRlcl90aXRsZSA9IHRyaW0oYS5maW5kKCcud2lkZ2V0LXRvYy1lcGlzb2RlLXRpdGxlTGFiZWwnKS50ZXh0KCksIHRydWUpO1xuXG5cdFx0XHRcdFx0XHRcdGxldCBjaGFwdGVyX2RhdGU7XG5cdFx0XHRcdFx0XHRcdGxldCBkZDtcblx0XHRcdFx0XHRcdFx0bGV0IGRhID0gYS5maW5kKCcud2lkZ2V0LXRvYy1lcGlzb2RlLWRhdGVQdWJsaXNoZWQnKTtcblxuXHRcdFx0XHRcdFx0XHRpZiAoIWRkKVxuXHRcdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdFx0ZGQgPSBkYS5hdHRyKCdkYXRldGltZScpLnJlcGxhY2UoL15cXHMrfFxccyskL2csICcnKTtcblx0XHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHRcdGlmIChkZClcblx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdGNoYXB0ZXJfZGF0ZSA9IG1vbWVudChkZCkubG9jYWwoKTtcblx0XHRcdFx0XHRcdFx0XHRfY2FjaGVfZGF0ZXMucHVzaChjaGFwdGVyX2RhdGUudW5peCgpKTtcblx0XHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHRcdGxldCBocmVmID0gYS5wcm9wKCdocmVmJyk7XG5cblx0XHRcdFx0XHRcdFx0bGV0IGRhdGEgPSBzZWxmLnBhcnNlVXJsKGhyZWYpO1xuXG5cdFx0XHRcdFx0XHRcdGlmICghZGF0YS5jaGFwdGVyX2lkKVxuXHRcdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdFx0Lypcblx0XHRcdFx0XHRcdFx0XHRjb25zb2xlLmxvZyhhKTtcblx0XHRcdFx0XHRcdFx0XHRjb25zb2xlLmxvZyhkYXRhKTtcblx0XHRcdFx0XHRcdFx0XHRjb25zb2xlLmxvZyhocmVmKTtcblx0XHRcdFx0XHRcdFx0XHRjb25zb2xlLmxvZyhhLmF0dHIoJ2hyZWYnKSk7XG5cdFx0XHRcdFx0XHRcdFx0Y29uc29sZS5sb2cobmV3IFVSTChocmVmLCBkb20udXJsKSk7XG5cblx0XHRcdFx0XHRcdFx0XHRjb25zb2xlLmxvZyhkb20uX29wdGlvbnMpO1xuXHRcdFx0XHRcdFx0XHRcdCovXG5cblx0XHRcdFx0XHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoKVxuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdGVsc2Vcblx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdGhyZWYgPSBzZWxmLm1ha2VVcmwoZGF0YSk7XG5cblx0XHRcdFx0XHRcdFx0XHRkYXRhLnVybCA9IGhyZWY7XG5cdFx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0XHQvKlxuXHRcdFx0XHRcdFx0XHRjdXJyZW50Vm9sdW1lXG5cdFx0XHRcdFx0XHRcdFx0LmNoYXB0ZXJfbGlzdFxuXHRcdFx0XHRcdFx0XHRcdC5wdXNoKHtcblx0XHRcdFx0XHRcdFx0XHRcdGNoYXB0ZXJfaW5kZXg6IGN1cnJlbnRWb2x1bWUuY2hhcHRlcl9saXN0Lmxlbmd0aCxcblx0XHRcdFx0XHRcdFx0XHRcdGNoYXB0ZXJfdGl0bGU6IGNoYXB0ZXJfdGl0bGUucmVwbGFjZSgvXlxccyt8XFxzKyQvZywgJycpLFxuXHRcdFx0XHRcdFx0XHRcdFx0Y2hhcHRlcl9pZDogZGF0YS5jaGFwdGVyX2lkLFxuXHRcdFx0XHRcdFx0XHRcdFx0Y2hhcHRlcl91cmw6IGhyZWYsXG5cdFx0XHRcdFx0XHRcdFx0XHRjaGFwdGVyX3VybF9kYXRhOiBkYXRhLFxuXHRcdFx0XHRcdFx0XHRcdFx0Y2hhcHRlcl9kYXRlLFxuXHRcdFx0XHRcdFx0XHRcdH0pXG5cdFx0XHRcdFx0XHRcdDtcblx0XHRcdFx0XHRcdFx0Ki9cblxuXHRcdFx0XHRcdFx0XHRsZXQgY2hhcHRlciA9IHtcblx0XHRcdFx0XHRcdFx0XHRjaGFwdGVyX3RpdGxlLFxuXHRcdFx0XHRcdFx0XHRcdGNoYXB0ZXJfaWQ6IGRhdGEuY2hhcHRlcl9pZCxcblx0XHRcdFx0XHRcdFx0XHRjaGFwdGVyX3VybDogaHJlZixcblx0XHRcdFx0XHRcdFx0XHRjaGFwdGVyX3VybF9kYXRhOiBkYXRhLFxuXHRcdFx0XHRcdFx0XHRcdGNoYXB0ZXJfZGF0ZSxcblx0XHRcdFx0XHRcdFx0XHRjaGFwdGVyX2luZGV4OiBjdXJyZW50Vm9sdW1lLnNpemUoKSxcblx0XHRcdFx0XHRcdFx0XHR0b3RhbF9pZHg6IHRvdGFsX2lkeCsrLFxuXHRcdFx0XHRcdFx0XHR9O1xuXG5cdFx0XHRcdFx0XHRcdG5vdmVsVHJlZS5hZGRDaGFwdGVyKGNoYXB0ZXIsIGN1cnJlbnRWb2x1bWUpXG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fSlcblx0XHRcdFx0O1xuXG5cdFx0XHRcdF9jYWNoZV9kYXRlcy5zb3J0KCk7XG5cblx0XHRcdFx0bGV0IG5vdmVsX2RhdGUgPSBtb21lbnQudW5peChfY2FjaGVfZGF0ZXNbX2NhY2hlX2RhdGVzLmxlbmd0aCAtIDFdKS5sb2NhbCgpO1xuXG5cdFx0XHRcdGxldCBkYXRhX21ldGE6IElNZGNvbmZNZXRhID0ge307XG5cblx0XHRcdFx0e1xuXHRcdFx0XHRcdGRhdGFfbWV0YS5ub3ZlbCA9IHt9O1xuXHRcdFx0XHRcdGRhdGFfbWV0YS5ub3ZlbC50YWdzID0gW107XG5cblx0XHRcdFx0XHQkKCcjd29ya01ldGEtZmxhZ3MnKVxuXHRcdFx0XHRcdFx0LmZpbmQoJyN3b3JrR2VucmUgYSwgI3dvcmtNZXRhLWF0dGVudGlvbnNBbmRUYWdzIFtpdGVtcHJvcD1cImtleXdvcmRzXCJdIGEnKVxuXHRcdFx0XHRcdFx0LmVhY2goZnVuY3Rpb24gKClcblx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0bGV0IHQgPSAkKHRoaXMpLnRleHQoKS5yZXBsYWNlKC9eXFxzK3xcXHMrJC9nLCAnJyk7XG5cdFx0XHRcdFx0XHRcdGlmICh0KVxuXHRcdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdFx0ZGF0YV9tZXRhLm5vdmVsLnRhZ3MucHVzaCh0KTtcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0fSlcblx0XHRcdFx0XHQ7XG5cblx0XHRcdFx0XHQkKCcjd29ya01ldGEtZmxhZ3MnKVxuXHRcdFx0XHRcdFx0LmZpbmQoJyN3b3JrTWV0YS1hdHRlbnRpb24gbGksICN3b3JrR2VucmUgPiBhOmVxKDApJylcblx0XHRcdFx0XHRcdC5lYWNoKGZ1bmN0aW9uICgpXG5cdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdGxldCB0ID0gJCh0aGlzKS50ZXh0KCkucmVwbGFjZSgvXlxccyt8XFxzKyQvZywgJycpO1xuXHRcdFx0XHRcdFx0XHRpZiAodClcblx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdGRhdGFfbWV0YS5ub3ZlbC50YWdzLnB1c2godCk7XG5cblx0XHRcdFx0XHRcdFx0XHRpZiAodCA9PSAn5oCn5o+P5YaZ5pyJ44KKJylcblx0XHRcdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdFx0XHRkYXRhX21ldGEubm92ZWwudGFncy5wdXNoKGBub3ZlbDE4YCk7XG5cdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHR9KVxuXHRcdFx0XHRcdDtcblxuXHRcdFx0XHRcdCQoJyN0YWJsZS1vZi1jb250ZW50cyAud2lkZ2V0LXRvYy13b3JrU3RhdHVzIHNwYW46ZXEoMCknKVxuXHRcdFx0XHRcdFx0LmVhY2goZnVuY3Rpb24gKClcblx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0ZGF0YV9tZXRhLm5vdmVsLnN0YXR1cyA9ICQodGhpcykudGV4dCgpLnJlcGxhY2UoL15cXHMrfFxccyskL2csICcnKTtcblx0XHRcdFx0XHRcdH0pXG5cdFx0XHRcdFx0O1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0cmV0dXJuIHtcblxuXHRcdFx0XHRcdC4uLmRhdGFfbWV0YSxcblxuXHRcdFx0XHRcdHVybDogZG9tLnVybCxcblx0XHRcdFx0XHR1cmxfZGF0YSxcblxuXHRcdFx0XHRcdG5vdmVsX3RpdGxlLFxuXHRcdFx0XHRcdG5vdmVsX2F1dGhvcixcblxuXHRcdFx0XHRcdG5vdmVsX2Rlc2MsXG5cdFx0XHRcdFx0bm92ZWxfZGF0ZSxcblx0XHRcdFx0XHRub3ZlbF9wdWJsaXNoZXIsXG5cblx0XHRcdFx0XHQvL3ZvbHVtZV9saXN0LFxuXHRcdFx0XHRcdG5vdmVsVHJlZSxcblxuXHRcdFx0XHRcdGNoZWNrZGF0ZTogbW9tZW50KCkubG9jYWwoKSxcblxuXHRcdFx0XHRcdGltZ3M6IFtdIGFzIHN0cmluZ1tdLFxuXHRcdFx0XHR9IGFzIElOb3ZlbDtcblx0XHRcdH0pXG5cdFx0XHQ7XG5cdH1cblxufVxuXG5leHBvcnQgZGVmYXVsdCBOb3ZlbFNpdGVLYWt1eW9tdTtcbiJdfQ==