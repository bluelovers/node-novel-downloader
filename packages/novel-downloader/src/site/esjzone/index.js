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
const fetch_1 = require("../../fetch");
let NovelSiteESJZone = class NovelSiteESJZone extends tree_1.default {
    /*
    protected _fixOptionsRuntime(optionsRuntime)
    {
        optionsRuntime.optionsJSDOM = optionsRuntime.optionsJSDOM || {};

        //optionsRuntime.optionsJSDOM.runScripts = 'dangerously';

        return super._fixOptionsRuntime(optionsRuntime)
    }
     */
    static check(url, options) {
        // @ts-ignore
        return /esjzone\.cc/i.test(new jsdom_url_1.URL(url).hostname || '');
    }
    makeUrl(urlobj, bool) {
        let pad;
        if (!bool && urlobj.chapter_id) {
            pad = `forum/${urlobj.novel_id}/${urlobj.chapter_id}.html`;
        }
        else {
            pad = `detail/${urlobj.novel_id}.html`;
        }
        // @ts-ignore
        return new jsdom_url_1.URL(`https://www.esjzone.cc/${pad}`);
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
        r = /^(\d{6,})$/;
        if (m = r.exec(url)) {
            urlobj.novel_id = m[1];
            return urlobj;
        }
        r = /esjzone\.cc\/forum\/(\d+)(?:\.html|\/(\d+).html)/g;
        if (m = r.exec(url)) {
            urlobj.novel_id = m[1];
            urlobj.chapter_id = m[2];
            return urlobj;
        }
        r = /esjzone\.cc\/detail\/(\d+)(?:\.html)?/g;
        if (m = r.exec(url)) {
            urlobj.novel_id = m[1];
            return urlobj;
        }
        return urlobj;
    }
    async _decodeChapter(ret, optionsRuntime, cache) {
        const { dom } = ret;
        const { $ } = dom;
        let html = dom.serialize();
        let m = html
            .match(/getTranslation\(['"]([^\'"]+)['"]/i);
        if (m) {
            let code = m[1];
            await fetch_1.retryRequest(ret.url, Object.assign(Object.assign({}, optionsRuntime.requestOptions), { method: 'POST', form: {
                    plxf: 'getTranslation',
                    plxa: [code],
                } }))
                .then((v) => {
                v = v
                    .replace(/\<JinJing\>/, '')
                    .replace(/\<\/JinJing\>/, '');
                return JSON.parse(v);
            })
                /*
                .tap(v => {
                    console.dir('-----------------------')
                    console.dir(v)
                    console.dir('-----------------------')
                })
                 */
                .tap((a) => {
                let elems = $('.trans, .t');
                a.forEach((v, i) => {
                    elems.eq(i).html(v);
                });
            });
        }
        //console.dir(m);
        //process.exit();
    }
    async _parseChapter(ret, optionsRuntime, cache) {
        if (!ret) {
            return '';
        }
        try {
            let html = util_1.minifyHTML(ret.dom.$('.container .row:has(.forum-content)').html());
            ret.dom.$('.container .row:has(.forum-content)').html(html);
        }
        catch (e) {
        }
        ret.dom.$('p[class]:has(> script), .adsbygoogle').remove();
        await this._decodeChapter(ret, optionsRuntime, cache);
        _p_2_br('.forum-content > p', ret.dom.$);
        let elem = ret.dom.$('.container .forum-content');
        elem.html(function (i, old) {
            return old
                .replace(/(\<br\>){3,4}/g, '$1')
                .replace(/(?<=\<br\>)(?=[^\n])/g, '\n');
        });
        let title = util_1.trim(ret.dom.$('.container .row > div > h3').text());
        let txt = elem
            .text()
            .replace(/^(?:由於百度\s*\d+\s*年以前的貼文都刪了|所以不清楚是由哪位大佬翻譯|若轉載的動作冒犯了您，先跟您說聲抱歉！|也麻煩留言告知，我們會將此文下架|已?由?譯者授權轉載！?|原文網址：[^\n]+|轉載自貼吧)$/uigm, '')
            .replace(/^\s+|\s+$/g, '');
        if (txt.indexOf(title + '\n') === 0) {
            txt = txt.slice(title.length + 1)
                .replace(/^\n+/g, '');
        }
        /*
        let html = elem.html();

        throw console.dir({
            html,
            txt,
        });
         */
        //		console.dir(txt);
        //		process.exit();
        return txt;
    }
    async get_volume_list(url, optionsRuntime = {}) {
        const self = this;
        url = await this.createMainUrl(url, optionsRuntime);
        return jsdom_extra_1.fromURL(url, optionsRuntime.optionsJSDOM)
            .then(async function (dom) {
            const $ = dom.$;
            try {
                let html = util_1.minifyHTML(dom.$('.product-detail').html());
                dom.$('.product-detail').html(html);
            }
            catch (e) {
            }
            let novel_title = dom.$('.container .row > div > h3').text();
            let novel_publisher = self.IDKEY;
            let url_data = self.parseUrl(dom.url.href);
            let novel_author;
            let novel_date;
            $('.product-detail .well .nav-list > li')
                .each(function (i, elem) {
                let _this = $(this);
                let _text = util_1.trim(_this.text());
                let _m;
                if (_m = _text.match(/作者\s*[：:]\s*([^\n]+)/)) {
                    novel_author = util_1.trim(_m[1]);
                }
                else if (_m = _text.match(/\b(\d{4}\-\d{1,2}\-\d{1,2})\b/)) {
                    try {
                        let last_update_time = index_2.moment(_m[1]);
                        novel_date = last_update_time;
                    }
                    catch (e) {
                    }
                }
            });
            let volume_list = [];
            const novelTree = optionsRuntime.novelTree;
            let currentVolume;
            let table = dom.$('.product-detail .tabbable .tab-content.show-desc').find('a');
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
            dom.$('p[class]:has(> script[src*=google]), div[class]:has(> script[src*=google]), .adsbygoogle').remove();
            table
                .each(function (index, elem) {
                let tr = dom.$(elem);
                if (1) {
                    let a = tr;
                    let chapter_title = util_1.trim(a.text(), true);
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
            let data_meta = {
                novel: {},
            };
            data_meta.novel.cover = $('.product-detail:eq(0)').find('img.product-image').prop('src');
            let novel_desc = util_1.trim($('.product-detail:eq(0)').find('.book_description').text() || '');
            return Object.assign(Object.assign({}, data_meta), { url: dom.url, url_data,
                novel_author,
                novel_date,
                novel_desc,
                novel_title,
                novel_publisher,
                //volume_list,
                novelTree, checkdate: index_2.moment().local(), imgs: [] });
        });
    }
};
NovelSiteESJZone.IDKEY = 'esjzone';
NovelSiteESJZone = __decorate([
    index_1.staticImplements()
], NovelSiteESJZone);
exports.NovelSiteESJZone = NovelSiteESJZone;
exports.default = NovelSiteESJZone;
function _p_2_br(target, $) {
    return $(target)
        .each(function (i, elem) {
        let _this = $(elem);
        let _html = _this
            .html()
            .replace(/(?:&nbsp;?)/g, ' ')
            .replace(/[\xA0\s]+$/g, '');
        if (_html == '<br/>' || _html == '<br>') {
            _html = '';
        }
        _this.after(`${_html}<br/>`);
        _this.remove();
    });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7O0dBRUc7Ozs7Ozs7O0FBRUgscUNBQThDO0FBQzlDLHVDQUF1RztBQU92Ryw2Q0FBK0Q7QUFFL0QseUNBQWdDO0FBRWhDLG9DQUEwRjtBQUUxRixvQ0FBa0M7QUFDbEMsdUNBQTJDO0FBRzNDLElBQWEsZ0JBQWdCLEdBQTdCLE1BQWEsZ0JBQWlCLFNBQVEsY0FBYTtJQUlsRDs7Ozs7Ozs7O09BU0c7SUFFSCxNQUFNLENBQUMsS0FBSyxDQUFDLEdBQXVDLEVBQUUsT0FBUTtRQUU3RCxhQUFhO1FBQ2IsT0FBTyxjQUFjLENBQUMsSUFBSSxDQUFDLElBQUksZUFBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLFFBQVEsSUFBSSxFQUFFLENBQUMsQ0FBQztJQUN6RCxDQUFDO0lBRUQsT0FBTyxDQUFDLE1BQTJCLEVBQUUsSUFBZTtRQUVuRCxJQUFJLEdBQVcsQ0FBQztRQUVoQixJQUFJLENBQUMsSUFBSSxJQUFJLE1BQU0sQ0FBQyxVQUFVLEVBQzlCO1lBQ0MsR0FBRyxHQUFHLFNBQVMsTUFBTSxDQUFDLFFBQVEsSUFBSSxNQUFNLENBQUMsVUFBVSxPQUFPLENBQUE7U0FDMUQ7YUFFRDtZQUNDLEdBQUcsR0FBRyxVQUFVLE1BQU0sQ0FBQyxRQUFRLE9BQU8sQ0FBQTtTQUN0QztRQUVELGFBQWE7UUFDYixPQUFPLElBQUksZUFBRyxDQUFDLDBCQUEwQixHQUFHLEVBQUUsQ0FBQyxDQUFDO0lBQ2pELENBQUM7SUFFRCxRQUFRLENBQUMsR0FBaUI7UUFFekIsSUFBSSxNQUFNLEdBQUc7WUFDWixHQUFHO1lBRUgsU0FBUyxFQUFFLElBQUk7WUFDZixRQUFRLEVBQUUsSUFBSTtZQUNkLFVBQVUsRUFBRSxJQUFJO1NBRWhCLENBQUM7UUFFRix1QkFBdUI7UUFFdkIsSUFDQTtZQUNDLGFBQWE7WUFDYixNQUFNLENBQUMsR0FBRyxHQUFHLElBQUks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QUFDLE1BQU0sQ0FBQztTQUNkLElBQUksQ0FBQyxVQUFVLENBQUMsRUFBRSxJQUFJO1FBRXRCLElBQUksS0FBSyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUVwQixJQUFJLEtBQUssR0FBRyxLQUFLO2FBQ2YsSUFBSSxFQUFFO2FBQ04sT0FBTyxDQUFDLGNBQWMsRUFBRSxHQUFHLENBQUM7YUFDNUIsT0FBTyxDQUFDLGFBQWEsRUFBRSxFQUFFLENBQUMsQ0FDM0I7UUFFRCxJQUFJLEtBQUssSUFBSSxPQUFPLElBQUksS0FBSyxJQUFJLE1BQU0sRUFDdkM7WUFDQyxLQUFLLEdBQUcsRUFBRSxDQUFDO1NBQ1g7UUFFRCxLQUFLLENBQUMsS0FBSyxDQUFDLEdBQUcsS0FBSyxPQUFPLENBQUMsQ0FBQztRQUM3QixLQUFLLENBQUMsTUFBTSxFQUFFLENBQUE7SUFDZixDQUFDLENBQUMsQ0FDRDtBQUNILENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENyZWF0ZWQgYnkgdXNlciBvbiAyMDE4LzMvMTcvMDE3LlxuICovXG5cbmltcG9ydCB7IG1pbmlmeUhUTUwsIHRyaW0gfSBmcm9tICcuLi8uLi91dGlsJztcbmltcG9ydCBOb3ZlbFNpdGVEZW1vLCB7IElEb3dubG9hZE9wdGlvbnMsIElOb3ZlbCwgSU9wdGlvbnNSdW50aW1lLCBJRmV0Y2hDaGFwdGVyIH0gZnJvbSAnLi4vZGVtby90cmVlJztcbmltcG9ydCB7IElSb3dWb2x1bWUsIFRyZWVOb2RlIH0gZnJvbSAnLi4vLi4vdHJlZS9pbmRleCc7XG5cbmltcG9ydCBmcyA9IHJlcXVpcmUoJ2ZzLWV4dHJhJyk7XG5pbXBvcnQgeyB0cmltRmlsZW5hbWUgfSBmcm9tICdmcy1pY29udi91dGlsJztcbmltcG9ydCAqIGFzIHBhdGggZnJvbSAndXBhdGgyJztcbmltcG9ydCBub3ZlbEluZm8sIHsgSU1kY29uZk1ldGEgfSBmcm9tICdub2RlLW5vdmVsLWluZm8nO1xuaW1wb3J0IHsgZnJvbVVSTCwgSUZyb21VcmxPcHRpb25zLCBJSlNET00gfSBmcm9tICdqc2RvbS1leHRyYSc7XG5cbmltcG9ydCB7IFVSTCB9IGZyb20gJ2pzZG9tLXVybCc7XG5cbmltcG9ydCBOb3ZlbFNpdGUsIHsgc3RhdGljSW1wbGVtZW50cywgZGVmYXVsdEpTRE9NT3B0aW9ucywgU1lNQk9MX0NBQ0hFIH0gZnJvbSAnLi4vaW5kZXgnO1xuaW1wb3J0IHsgUHJvbWlzZUJsdWViaXJkLCBibHVlYmlyZERlY29yYXRvciB9IGZyb20gJy4uL2luZGV4JztcbmltcG9ydCB7IG1vbWVudCB9IGZyb20gJy4uL2luZGV4JztcbmltcG9ydCB7IHJldHJ5UmVxdWVzdCB9IGZyb20gJy4uLy4uL2ZldGNoJztcblxuQHN0YXRpY0ltcGxlbWVudHM8Tm92ZWxTaXRlLklOb3ZlbFNpdGVTdGF0aWM8Tm92ZWxTaXRlRVNKWm9uZT4+KClcbmV4cG9ydCBjbGFzcyBOb3ZlbFNpdGVFU0pab25lIGV4dGVuZHMgTm92ZWxTaXRlRGVtb1xue1xuXHRwdWJsaWMgc3RhdGljIHJlYWRvbmx5IElES0VZID0gJ2VzanpvbmUnO1xuXG5cdC8qXG5cdHByb3RlY3RlZCBfZml4T3B0aW9uc1J1bnRpbWUob3B0aW9uc1J1bnRpbWUpXG5cdHtcblx0XHRvcHRpb25zUnVudGltZS5vcHRpb25zSlNET00gPSBvcHRpb25zUnVudGltZS5vcHRpb25zSlNET00gfHwge307XG5cblx0XHQvL29wdGlvbnNSdW50aW1lLm9wdGlvbnNKU0RPTS5ydW5TY3JpcHRzID0gJ2Rhbmdlcm91c2x5JztcblxuXHRcdHJldHVybiBzdXBlci5fZml4T3B0aW9uc1J1bnRpbWUob3B0aW9uc1J1bnRpbWUpXG5cdH1cblx0ICovXG5cblx0c3RhdGljIGNoZWNrKHVybDogc3RyaW5nIHwgVVJMIHwgTm92ZWxTaXRlLklQYXJzZVVybCwgb3B0aW9ucz8pOiBib29sZWFuXG5cdHtcblx0XHQvLyBAdHMtaWdub3JlXG5cdFx0cmV0dXJuIC9lc2p6b25lXFwuY2MvaS50ZXN0KG5ldyBVUkwodXJsKS5ob3N0bmFtZSB8fCAnJyk7XG5cdH1cblxuXHRtYWtlVXJsKHVybG9iajogTm92ZWxTaXRlLklQYXJzZVVybCwgYm9vbCA/OiBib29sZWFuKTogVVJMXG5cdHtcblx0XHRsZXQgcGFkOiBzdHJpbmc7XG5cblx0XHRpZiAoIWJvb2wgJiYgdXJsb2JqLmNoYXB0ZXJfaWQpXG5cdFx0e1xuXHRcdFx0cGFkID0gYGZvcnVtLyR7dXJsb2JqLm5vdmVsX2lkfS8ke3VybG9iai5jaGFwdGVyX2lkfS5odG1sYFxuXHRcdH1cblx0XHRlbHNlXG5cdFx0e1xuXHRcdFx0cGFkID0gYGRldGFpbC8ke3VybG9iai5ub3ZlbF9pZH0uaHRtbGBcblx0XHR9XG5cblx0XHQvLyBAdHMtaWdub3JlXG5cdFx0cmV0dXJuIG5ldyBVUkwoYGh0dHBzOi8vd3d3LmVzanpvbmUuY2MvJHtwYWR9YCk7XG5cdH1cblxuXHRwYXJzZVVybCh1cmw6IHN0cmluZyB8IFVSTCk6IE5vdmVsU2l0ZS5JUGFyc2VVcmxcblx0e1xuXHRcdGxldCB1cmxvYmogPSB7XG5cdFx0XHR1cmwsXG5cblx0XHRcdG5vdmVsX3BpZDogbnVsbCxcblx0XHRcdG5vdmVsX2lkOiBudWxsLFxuXHRcdFx0Y2hhcHRlcl9pZDogbnVsbCxcblxuXHRcdH07XG5cblx0XHQvL3VybCA9IHVybC50b1N0cmluZygpO1xuXG5cdFx0dHJ5XG5cdFx0e1xuXHRcdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdFx0dXJsb2JqLnVybCA9IG5ldyBVUkwodXJsKTtcblx0XHRcdC8vIEB0cy1pZ25vcmVcblx0XHRcdHVybCA9IHVybG9iai51cmwuaHJlZjtcblx0XHR9XG5cdFx0Y2F0Y2ggKGUpXG5cdFx0e1xuXHRcdFx0Y29uc29sZS53YXJuKGUudG9TdHJpbmcoKSArIGAgXCIke3VybH1cImApO1xuXHRcdH1cblxuXHRcdGlmICh0eXBlb2YgdXJsICE9ICdzdHJpbmcnKVxuXHRcdHtcblx0XHRcdC8vIEB0cy1pZ25vcmVcblx0XHRcdHRocm93IG5ldyBUeXBlRXJyb3IodXJsKTtcblx0XHR9XG5cblx0XHRsZXQgcjogUmVnRXhwO1xuXHRcdGxldCBtO1xuXG5cdFx0ciA9IC9eKFxcZHs2LH0pJC87XG5cdFx0aWYgKG0gPSByLmV4ZWModXJsKSlcblx0XHR7XG5cdFx0XHR1cmxvYmoubm92ZWxfaWQgPSBtWzFdO1xuXHRcdFx0cmV0dXJuIHVybG9iajtcblx0XHR9XG5cblx0XHRyID0gL2VzanpvbmVcXC5jY1xcL2ZvcnVtXFwvKFxcZCspKD86XFwuaHRtbHxcXC8oXFxkKykuaHRtbCkvZztcblx0XHRpZiAobSA9IHIuZXhlYyh1cmwpKVxuXHRcdHtcblx0XHRcdHVybG9iai5ub3ZlbF9pZCA9IG1bMV07XG5cdFx0XHR1cmxvYmouY2hhcHRlcl9pZCA9IG1bMl07XG5cblx0XHRcdHJldHVybiB1cmxvYmo7XG5cdFx0fVxuXG5cdFx0ciA9IC9lc2p6b25lXFwuY2NcXC9kZXRhaWxcXC8oXFxkKykoPzpcXC5odG1sKT8vZztcblx0XHRpZiAobSA9IHIuZXhlYyh1cmwpKVxuXHRcdHtcblx0XHRcdHVybG9iai5ub3ZlbF9pZCA9IG1bMV07XG5cblx0XHRcdHJldHVybiB1cmxvYmo7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHVybG9iajtcblx0fVxuXG5cdHByb3RlY3RlZCBhc3luYyBfZGVjb2RlQ2hhcHRlcjxUPihyZXQ6IElGZXRjaENoYXB0ZXIsIG9wdGlvbnNSdW50aW1lOiBUICYgSU9wdGlvbnNSdW50aW1lLCBjYWNoZSlcblx0e1xuXHRcdGNvbnN0IHsgZG9tIH0gPSByZXQ7XG5cdFx0Y29uc3QgeyAkIH0gPSBkb207XG5cblx0XHRsZXQgaHRtbCA9IGRvbS5zZXJpYWxpemUoKTtcblxuXHRcdGxldCBtID0gaHRtbFxuXHRcdFx0Lm1hdGNoKC9nZXRUcmFuc2xhdGlvblxcKFsnXCJdKFteXFwnXCJdKylbJ1wiXS9pKVxuXHRcdDtcblxuXHRcdGlmIChtKVxuXHRcdHtcblx0XHRcdGxldCBjb2RlID0gbVsxXTtcblxuXHRcdFx0YXdhaXQgcmV0cnlSZXF1ZXN0KHJldC51cmwsIHtcblx0XHRcdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdFx0XHQuLi5vcHRpb25zUnVudGltZS5yZXF1ZXN0T3B0aW9ucyxcblx0XHRcdFx0bWV0aG9kOiAnUE9TVCcsXG5cdFx0XHRcdGZvcm06IHtcblx0XHRcdFx0XHRwbHhmOiAnZ2V0VHJhbnNsYXRpb24nLFxuXHRcdFx0XHRcdHBseGE6IFtjb2RlXSxcblx0XHRcdFx0fSxcblx0XHRcdH0pXG5cdFx0XHRcdC50aGVuKCh2OiBzdHJpbmcpID0+IHtcblx0XHRcdFx0XHR2ID0gdlxuXHRcdFx0XHRcdFx0LnJlcGxhY2UoL1xcPEppbkppbmdcXD4vLCAnJylcblx0XHRcdFx0XHRcdC5yZXBsYWNlKC9cXDxcXC9KaW5KaW5nXFw+LywgJycpXG5cdFx0XHRcdFx0O1xuXG5cdFx0XHRcdFx0cmV0dXJuIEpTT04ucGFyc2Uodilcblx0XHRcdFx0fSlcblx0XHRcdFx0Lypcblx0XHRcdFx0LnRhcCh2ID0+IHtcblx0XHRcdFx0XHRjb25zb2xlLmRpcignLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0nKVxuXHRcdFx0XHRcdGNvbnNvbGUuZGlyKHYpXG5cdFx0XHRcdFx0Y29uc29sZS5kaXIoJy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tJylcblx0XHRcdFx0fSlcblx0XHRcdFx0ICovXG5cdFx0XHRcdC50YXAoKGE6IHN0cmluZ1tdKSA9PiB7XG5cblx0XHRcdFx0XHRsZXQgZWxlbXMgPSAkKCcudHJhbnMsIC50Jyk7XG5cblx0XHRcdFx0XHRhLmZvckVhY2goKHYsIGkpID0+IHtcblx0XHRcdFx0XHRcdGVsZW1zLmVxKGkpLmh0bWwodik7XG5cdFx0XHRcdFx0fSlcblxuXHRcdFx0XHR9KVxuXHRcdFx0O1xuXG5cdFx0fVxuXG5cdFx0Ly9jb25zb2xlLmRpcihtKTtcblx0XHQvL3Byb2Nlc3MuZXhpdCgpO1xuXHR9XG5cblx0cHJvdGVjdGVkIGFzeW5jIF9wYXJzZUNoYXB0ZXI8VD4ocmV0LCBvcHRpb25zUnVudGltZSwgY2FjaGUpXG5cdHtcblx0XHRpZiAoIXJldClcblx0XHR7XG5cdFx0XHRyZXR1cm4gJyc7XG5cdFx0fVxuXG5cdFx0dHJ5XG5cdFx0e1xuXHRcdFx0bGV0IGh0bWwgPSBtaW5pZnlIVE1MKHJldC5kb20uJCgnLmNvbnRhaW5lciAucm93OmhhcyguZm9ydW0tY29udGVudCknKS5odG1sKCkpO1xuXG5cdFx0XHRyZXQuZG9tLiQoJy5jb250YWluZXIgLnJvdzpoYXMoLmZvcnVtLWNvbnRlbnQpJykuaHRtbChodG1sKTtcblx0XHR9XG5cdFx0Y2F0Y2ggKGUpXG5cdFx0e1xuXG5cdFx0fVxuXG5cdFx0cmV0LmRvbS4kKCdwW2NsYXNzXTpoYXMoPiBzY3JpcHQpLCAuYWRzYnlnb29nbGUnKS5yZW1vdmUoKTtcblxuXHRcdGF3YWl0IHRoaXMuX2RlY29kZUNoYXB0ZXIocmV0LCBvcHRpb25zUnVudGltZSwgY2FjaGUpO1xuXG5cdFx0X3BfMl9icignLmZvcnVtLWNvbnRlbnQgPiBwJywgcmV0LmRvbS4kKTtcblxuXHRcdGxldCBlbGVtID0gcmV0LmRvbS4kKCcuY29udGFpbmVyIC5mb3J1bS1jb250ZW50Jyk7XG5cblx0XHRlbGVtLmh0bWwoZnVuY3Rpb24gKGksIG9sZDogc3RyaW5nKVxuXHRcdHtcblx0XHRcdHJldHVybiBvbGRcblx0XHRcdFx0LnJlcGxhY2UoLyhcXDxiclxcPil7Myw0fS9nLCAnJDEnKVxuXHRcdFx0XHQucmVwbGFjZSgvKD88PVxcPGJyXFw+KSg/PVteXFxuXSkvZywgJ1xcbicpXG5cdFx0fSk7XG5cblx0XHRsZXQgdGl0bGUgPSB0cmltKHJldC5kb20uJCgnLmNvbnRhaW5lciAucm93ID4gZGl2ID4gaDMnKS50ZXh0KCkpO1xuXG5cdFx0bGV0IHR4dDogc3RyaW5nID0gZWxlbVxuXHRcdFx0LnRleHQoKVxuXHRcdFx0LnJlcGxhY2UoL14oPzrnlLHmlrznmb7luqZcXHMqXFxkK1xccyrlubTku6XliY3nmoTosrzmlofpg73liKrkuoZ85omA5Lul5LiN5riF5qWa5piv55Sx5ZOq5L2N5aSn5L2s57+76K2vfOiLpei9iei8ieeahOWLleS9nOWGkueKr+S6huaCqO+8jOWFiOi3n+aCqOiqquiBsuaKseatie+8gXzkuZ/purvnhannlZnoqIDlkYrnn6XvvIzmiJHlgJHmnIPlsIfmraTmlofkuIvmnrZ85beyP+eUsT/ora/ogIXmjojmrIrovYnovInvvIE/fOWOn+aWh+e2suWdgO+8mlteXFxuXSt86L2J6LyJ6Ieq6LK85ZCnKSQvdWlnbSwgJycpXG5cdFx0XHQucmVwbGFjZSgvXlxccyt8XFxzKyQvZywgJycpXG5cdFx0O1xuXG5cdFx0aWYgKHR4dC5pbmRleE9mKHRpdGxlICsgJ1xcbicpID09PSAwKVxuXHRcdHtcblx0XHRcdHR4dCA9IHR4dC5zbGljZSh0aXRsZS5sZW5ndGggKyAxKVxuXHRcdFx0XHQucmVwbGFjZSgvXlxcbisvZywgJycpXG5cdFx0XHQ7XG5cdFx0fVxuXG5cdFx0Lypcblx0XHRsZXQgaHRtbCA9IGVsZW0uaHRtbCgpO1xuXG5cdFx0dGhyb3cgY29uc29sZS5kaXIoe1xuXHRcdFx0aHRtbCxcblx0XHRcdHR4dCxcblx0XHR9KTtcblx0XHQgKi9cblxuLy9cdFx0Y29uc29sZS5kaXIodHh0KTtcblxuLy9cdFx0cHJvY2Vzcy5leGl0KCk7XG5cblx0XHRyZXR1cm4gdHh0IGFzIHN0cmluZ1xuXHR9XG5cblx0YXN5bmMgZ2V0X3ZvbHVtZV9saXN0PFQgZXh0ZW5kcyBJT3B0aW9uc1J1bnRpbWU+KHVybDogc3RyaW5nIHwgVVJMLFxuXHRcdG9wdGlvbnNSdW50aW1lOiBQYXJ0aWFsPFQgJiBJRG93bmxvYWRPcHRpb25zPiA9IHt9LFxuXHQpOiBQcm9taXNlPElOb3ZlbD5cblx0e1xuXHRcdGNvbnN0IHNlbGYgPSB0aGlzO1xuXG5cdFx0dXJsID0gYXdhaXQgdGhpcy5jcmVhdGVNYWluVXJsKHVybCBhcyBhbnksIG9wdGlvbnNSdW50aW1lKTtcblxuXHRcdHJldHVybiBmcm9tVVJMKHVybCwgb3B0aW9uc1J1bnRpbWUub3B0aW9uc0pTRE9NKVxuXHRcdFx0LnRoZW4oYXN5bmMgZnVuY3Rpb24gKGRvbTogSUpTRE9NKVxuXHRcdFx0e1xuXHRcdFx0XHRjb25zdCAkID0gZG9tLiQ7XG5cblx0XHRcdFx0dHJ5XG5cdFx0XHRcdHtcblx0XHRcdFx0XHRsZXQgaHRtbCA9IG1pbmlmeUhUTUwoZG9tLiQoJy5wcm9kdWN0LWRldGFpbCcpLmh0bWwoKSk7XG5cblx0XHRcdFx0XHRkb20uJCgnLnByb2R1Y3QtZGV0YWlsJykuaHRtbChodG1sKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRjYXRjaCAoZSlcblx0XHRcdFx0e1xuXG5cdFx0XHRcdH1cblxuXHRcdFx0XHRsZXQgbm92ZWxfdGl0bGUgPSBkb20uJCgnLmNvbnRhaW5lciAucm93ID4gZGl2ID4gaDMnKS50ZXh0KCk7XG5cblx0XHRcdFx0bGV0IG5vdmVsX3B1Ymxpc2hlciA9IHNlbGYuSURLRVk7XG5cblx0XHRcdFx0bGV0IHVybF9kYXRhID0gc2VsZi5wYXJzZVVybChkb20udXJsLmhyZWYpO1xuXG5cdFx0XHRcdGxldCBub3ZlbF9hdXRob3I6IHN0cmluZztcblx0XHRcdFx0bGV0IG5vdmVsX2RhdGU7XG5cblx0XHRcdFx0JCgnLnByb2R1Y3QtZGV0YWlsIC53ZWxsIC5uYXYtbGlzdCA+IGxpJylcblx0XHRcdFx0XHQuZWFjaChmdW5jdGlvbiAoaSwgZWxlbSlcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRsZXQgX3RoaXMgPSAkKHRoaXMpO1xuXG5cdFx0XHRcdFx0XHRsZXQgX3RleHQgPSB0cmltKF90aGlzLnRleHQoKSk7XG5cblx0XHRcdFx0XHRcdGxldCBfbTogUmVnRXhwTWF0Y2hBcnJheTtcblxuXHRcdFx0XHRcdFx0aWYgKF9tID0gX3RleHQubWF0Y2goL+S9nOiAhVxccypb77yaOl1cXHMqKFteXFxuXSspLykpXG5cdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdG5vdmVsX2F1dGhvciA9IHRyaW0oX21bMV0pXG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRlbHNlIGlmIChfbSA9IF90ZXh0Lm1hdGNoKC9cXGIoXFxkezR9XFwtXFxkezEsMn1cXC1cXGR7MSwyfSlcXGIvKSlcblx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0dHJ5XG5cdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHRsZXQgbGFzdF91cGRhdGVfdGltZSA9IG1vbWVudChfbVsxXSk7XG5cdFx0XHRcdFx0XHRcdFx0bm92ZWxfZGF0ZSA9IGxhc3RfdXBkYXRlX3RpbWU7XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0Y2F0Y2ggKGUpXG5cdFx0XHRcdFx0XHRcdHtcblxuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHR9KVxuXHRcdFx0XHQ7XG5cblx0XHRcdFx0bGV0IHZvbHVtZV9saXN0ID0gW10gYXMgTm92ZWxTaXRlLklWb2x1bWVbXTtcblxuXHRcdFx0XHRjb25zdCBub3ZlbFRyZWUgPSBvcHRpb25zUnVudGltZS5ub3ZlbFRyZWU7XG5cdFx0XHRcdGxldCBjdXJyZW50Vm9sdW1lOiBUcmVlTm9kZTxJUm93Vm9sdW1lPjtcblxuXHRcdFx0XHRsZXQgdGFibGUgPSBkb20uJCgnLnByb2R1Y3QtZGV0YWlsIC50YWJiYWJsZSAudGFiLWNvbnRlbnQuc2hvdy1kZXNjJykuZmluZCgnYScpO1xuXG5cdFx0XHRcdGxldCBfY2FjaGVfZGF0ZXMgPSBbXTtcblxuXHRcdFx0XHRsZXQgdG90YWxfaWR4ID0gMDtcblxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0bGV0IHZvbHVtZV90aXRsZSA9ICdudWxsJztcblx0XHRcdFx0XHRsZXQgdm9sdW1lX2xldmVsID0gbnVsbDtcblxuXHRcdFx0XHRcdGN1cnJlbnRWb2x1bWUgPSBub3ZlbFRyZWUuYWRkVm9sdW1lKHtcblx0XHRcdFx0XHRcdHZvbHVtZV90aXRsZSxcblx0XHRcdFx0XHRcdHZvbHVtZV9sZXZlbCxcblx0XHRcdFx0XHRcdHZvbHVtZV9pbmRleDogbm92ZWxUcmVlLnJvb3QoKS5zaXplKCksXG5cdFx0XHRcdFx0XHR0b3RhbF9pZHg6IHRvdGFsX2lkeCsrLFxuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0ZG9tLiQoJ3BbY2xhc3NdOmhhcyg+IHNjcmlwdFtzcmMqPWdvb2dsZV0pLCBkaXZbY2xhc3NdOmhhcyg+IHNjcmlwdFtzcmMqPWdvb2dsZV0pLCAuYWRzYnlnb29nbGUnKS5yZW1vdmUoKTtcblxuXHRcdFx0XHR0YWJsZVxuXHRcdFx0XHRcdC5lYWNoKGZ1bmN0aW9uIChpbmRleCwgZWxlbSlcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRsZXQgdHIgPSBkb20uJChlbGVtKTtcblxuXHRcdFx0XHRcdFx0aWYgKDEpXG5cdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdGxldCBhID0gdHI7XG5cdFx0XHRcdFx0XHRcdGxldCBjaGFwdGVyX3RpdGxlID0gdHJpbShhLnRleHQoKSwgdHJ1ZSk7XG5cblx0XHRcdFx0XHRcdFx0bGV0IGhyZWYgPSBhLnByb3AoJ2hyZWYnKTtcblxuXHRcdFx0XHRcdFx0XHRsZXQgZGF0YSA9IHNlbGYucGFyc2VVcmwoaHJlZik7XG5cblx0XHRcdFx0XHRcdFx0aWYgKCFkYXRhLmNoYXB0ZXJfaWQpXG5cdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHRyZXR1cm47XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0ZWxzZVxuXHRcdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdFx0aHJlZiA9IHNlbGYubWFrZVVybChkYXRhKTtcblxuXHRcdFx0XHRcdFx0XHRcdGRhdGEudXJsID0gaHJlZjtcblx0XHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHRcdGxldCBjaGFwdGVyID0ge1xuXHRcdFx0XHRcdFx0XHRcdGNoYXB0ZXJfdGl0bGUsXG5cdFx0XHRcdFx0XHRcdFx0Y2hhcHRlcl9pZDogZGF0YS5jaGFwdGVyX2lkLFxuXHRcdFx0XHRcdFx0XHRcdGNoYXB0ZXJfdXJsOiBocmVmLFxuXHRcdFx0XHRcdFx0XHRcdGNoYXB0ZXJfdXJsX2RhdGE6IGRhdGEsXG5cdFx0XHRcdFx0XHRcdFx0Y2hhcHRlcl9pbmRleDogY3VycmVudFZvbHVtZS5zaXplKCksXG5cdFx0XHRcdFx0XHRcdFx0dG90YWxfaWR4OiB0b3RhbF9pZHgrKyxcblx0XHRcdFx0XHRcdFx0fTtcblxuXHRcdFx0XHRcdFx0XHRub3ZlbFRyZWUuYWRkQ2hhcHRlcihjaGFwdGVyLCBjdXJyZW50Vm9sdW1lKVxuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH0pXG5cdFx0XHRcdDtcblxuXHRcdFx0XHRsZXQgZGF0YV9tZXRhOiBJTWRjb25mTWV0YSA9IHtcblx0XHRcdFx0XHRub3ZlbDoge1xuXG5cdFx0XHRcdFx0fSxcblx0XHRcdFx0fTtcblxuXHRcdFx0XHRkYXRhX21ldGEubm92ZWwuY292ZXIgPSAkKCcucHJvZHVjdC1kZXRhaWw6ZXEoMCknKS5maW5kKCdpbWcucHJvZHVjdC1pbWFnZScpLnByb3AoJ3NyYycpO1xuXG5cdFx0XHRcdGxldCBub3ZlbF9kZXNjID0gdHJpbSgkKCcucHJvZHVjdC1kZXRhaWw6ZXEoMCknKS5maW5kKCcuYm9va19kZXNjcmlwdGlvbicpLnRleHQoKSB8fCAnJyk7XG5cblx0XHRcdFx0cmV0dXJuIHtcblxuXHRcdFx0XHRcdC4uLmRhdGFfbWV0YSxcblxuXHRcdFx0XHRcdHVybDogZG9tLnVybCxcblx0XHRcdFx0XHR1cmxfZGF0YSxcblxuXHRcdFx0XHRcdG5vdmVsX2F1dGhvcixcblx0XHRcdFx0XHRub3ZlbF9kYXRlLFxuXG5cdFx0XHRcdFx0bm92ZWxfZGVzYyxcblxuXHRcdFx0XHRcdG5vdmVsX3RpdGxlLFxuXHRcdFx0XHRcdG5vdmVsX3B1Ymxpc2hlcixcblxuXHRcdFx0XHRcdC8vdm9sdW1lX2xpc3QsXG5cdFx0XHRcdFx0bm92ZWxUcmVlLFxuXG5cdFx0XHRcdFx0Y2hlY2tkYXRlOiBtb21lbnQoKS5sb2NhbCgpLFxuXG5cdFx0XHRcdFx0aW1nczogW10gYXMgc3RyaW5nW10sXG5cdFx0XHRcdH0gYXMgSU5vdmVsO1xuXHRcdFx0fSlcblx0XHRcdDtcblx0fVxuXG59XG5cbmV4cG9ydCBkZWZhdWx0IE5vdmVsU2l0ZUVTSlpvbmU7XG5cbmZ1bmN0aW9uIF9wXzJfYnIodGFyZ2V0LCAkKVxue1xuXHRyZXR1cm4gJCh0YXJnZXQpXG5cdFx0LmVhY2goZnVuY3Rpb24gKGksIGVsZW0pXG5cdFx0e1xuXHRcdFx0bGV0IF90aGlzID0gJChlbGVtKTtcblxuXHRcdFx0bGV0IF9odG1sID0gX3RoaXNcblx0XHRcdFx0Lmh0bWwoKVxuXHRcdFx0XHQucmVwbGFjZSgvKD86Jm5ic3A7PykvZywgJyAnKVxuXHRcdFx0XHQucmVwbGFjZSgvW1xceEEwXFxzXSskL2csICcnKVxuXHRcdFx0O1xuXG5cdFx0XHRpZiAoX2h0bWwgPT0gJzxici8+JyB8fCBfaHRtbCA9PSAnPGJyPicpXG5cdFx0XHR7XG5cdFx0XHRcdF9odG1sID0gJyc7XG5cdFx0XHR9XG5cblx0XHRcdF90aGlzLmFmdGVyKGAke19odG1sfTxici8+YCk7XG5cdFx0XHRfdGhpcy5yZW1vdmUoKVxuXHRcdH0pXG5cdFx0O1xufVxuIl19