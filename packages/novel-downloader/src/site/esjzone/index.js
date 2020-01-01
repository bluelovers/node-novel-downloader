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
const value_1 = require("../../util/value");
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
        let contribute = value_1.dotGetValue(cache, 'novel.contribute', { default: [] });
        txt = txt.replace(/^翻譯：([^\n]+)\n/, (s, v) => {
            v = v.replace(/^[\s　\xA0]+|[\s　\xA0]+$/g, '');
            if (v && !contribute.includes(v)) {
                contribute.push(v);
            }
            return '';
        });
        if (contribute.length) {
            value_1.dotSetValue(cache, 'novel.contribute', contribute);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7O0dBRUc7Ozs7Ozs7O0FBRUgscUNBQThDO0FBQzlDLHVDQUF1RztBQU92Ryw2Q0FBK0Q7QUFFL0QseUNBQWdDO0FBRWhDLG9DQUEwRjtBQUUxRixvQ0FBa0M7QUFDbEMsdUNBQTJDO0FBQzNDLDRDQUE0RDtBQUc1RCxJQUFhLGdCQUFnQixHQUE3QixNQUFhLGdCQUFpQixTQUFRLGNBQWE7SUFJbEQ7Ozs7Ozs7OztPQVNHO0lBRUgsTUFBTSxDQUFDLEtBQUssQ0FBQyxHQUF1QyxFQUFFLE9BQVE7UUFFN0QsYUFBYTtRQUNiLE9BQU8sY0FBYyxDQUFDLElBQUksQ0FBQyxJQUFJLGVBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxRQUFRLElBQUksRUFBRSxDQUFDLENBQUM7SUFDekQsQ0FBQztJQUVELE9BQU8sQ0FBQyxNQUEyQixFQUFFLElBQWU7UUFFbkQsSUFBSSxHQUFXLENBQUM7UUFFaEIsSUFBSSxDQUFDLElBQUksSUFBSSxNQUFNLENBQUMsVUFBVSxFQUM5QjtZQUNDLEdBQUcsR0FBRyxTQUFTLE1BQU0sQ0FBQyxRQUFRLElBQUksTUFBTSxDQUFDLFVBQVUsT0FBTyxDQUFBO1NBQzFEO2FBRUQ7WUFDQyxHQUFHLEdBQUcsVUFBVSxNQUFNLENBQUMsUUFBUSxPQUFPLENBQUE7U0FDdEM7UUFFRCxhQUFhO1FBQ2IsT0FBTyxJQUFJLGVBQUcsQ0FBQywwQkFBMEIsR0FBRyxFQUFFLENBQUMsQ0FBQztJQUNqRCxDQUFDO0lBRUQsUUFBUSxDQUFDLEdBQWlCO1FBRXpCLElBQUksTUFBTSxHQUFHO1lBQ1osR0FBRztZQUVILFNBQVMsRUFBRSxJQUFJO1lBQ2YsUUFBUSxFQUFFLElBQUk7WUFDZCxVQUFVLEVBQUUsSUFBSTtTQUVoQixDQUFDO1FBRUYsdUJBQXVCO1FBRXZCLElBQ0E7WUFDQyxhQUFhO1lBQ2IsTUFBTSxDQUFDLEdB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bnQiOlsiLyoqXG4gKiBDcmVhdGVkIGJ5IHVzZXIgb24gMjAxOC8zLzE3LzAxNy5cbiAqL1xuXG5pbXBvcnQgeyBtaW5pZnlIVE1MLCB0cmltIH0gZnJvbSAnLi4vLi4vdXRpbCc7XG5pbXBvcnQgTm92ZWxTaXRlRGVtbywgeyBJRG93bmxvYWRPcHRpb25zLCBJTm92ZWwsIElPcHRpb25zUnVudGltZSwgSUZldGNoQ2hhcHRlciB9IGZyb20gJy4uL2RlbW8vdHJlZSc7XG5pbXBvcnQgeyBJUm93Vm9sdW1lLCBUcmVlTm9kZSB9IGZyb20gJy4uLy4uL3RyZWUvaW5kZXgnO1xuXG5pbXBvcnQgZnMgPSByZXF1aXJlKCdmcy1leHRyYScpO1xuaW1wb3J0IHsgdHJpbUZpbGVuYW1lIH0gZnJvbSAnZnMtaWNvbnYvdXRpbCc7XG5pbXBvcnQgKiBhcyBwYXRoIGZyb20gJ3VwYXRoMic7XG5pbXBvcnQgbm92ZWxJbmZvLCB7IElNZGNvbmZNZXRhIH0gZnJvbSAnbm9kZS1ub3ZlbC1pbmZvJztcbmltcG9ydCB7IGZyb21VUkwsIElGcm9tVXJsT3B0aW9ucywgSUpTRE9NIH0gZnJvbSAnanNkb20tZXh0cmEnO1xuXG5pbXBvcnQgeyBVUkwgfSBmcm9tICdqc2RvbS11cmwnO1xuXG5pbXBvcnQgTm92ZWxTaXRlLCB7IHN0YXRpY0ltcGxlbWVudHMsIGRlZmF1bHRKU0RPTU9wdGlvbnMsIFNZTUJPTF9DQUNIRSB9IGZyb20gJy4uL2luZGV4JztcbmltcG9ydCB7IFByb21pc2VCbHVlYmlyZCwgYmx1ZWJpcmREZWNvcmF0b3IgfSBmcm9tICcuLi9pbmRleCc7XG5pbXBvcnQgeyBtb21lbnQgfSBmcm9tICcuLi9pbmRleCc7XG5pbXBvcnQgeyByZXRyeVJlcXVlc3QgfSBmcm9tICcuLi8uLi9mZXRjaCc7XG5pbXBvcnQgeyBkb3RTZXRWYWx1ZSwgZG90R2V0VmFsdWUgfSBmcm9tICcuLi8uLi91dGlsL3ZhbHVlJztcblxuQHN0YXRpY0ltcGxlbWVudHM8Tm92ZWxTaXRlLklOb3ZlbFNpdGVTdGF0aWM8Tm92ZWxTaXRlRVNKWm9uZT4+KClcbmV4cG9ydCBjbGFzcyBOb3ZlbFNpdGVFU0pab25lIGV4dGVuZHMgTm92ZWxTaXRlRGVtb1xue1xuXHRwdWJsaWMgc3RhdGljIHJlYWRvbmx5IElES0VZID0gJ2VzanpvbmUnO1xuXG5cdC8qXG5cdHByb3RlY3RlZCBfZml4T3B0aW9uc1J1bnRpbWUob3B0aW9uc1J1bnRpbWUpXG5cdHtcblx0XHRvcHRpb25zUnVudGltZS5vcHRpb25zSlNET00gPSBvcHRpb25zUnVudGltZS5vcHRpb25zSlNET00gfHwge307XG5cblx0XHQvL29wdGlvbnNSdW50aW1lLm9wdGlvbnNKU0RPTS5ydW5TY3JpcHRzID0gJ2Rhbmdlcm91c2x5JztcblxuXHRcdHJldHVybiBzdXBlci5fZml4T3B0aW9uc1J1bnRpbWUob3B0aW9uc1J1bnRpbWUpXG5cdH1cblx0ICovXG5cblx0c3RhdGljIGNoZWNrKHVybDogc3RyaW5nIHwgVVJMIHwgTm92ZWxTaXRlLklQYXJzZVVybCwgb3B0aW9ucz8pOiBib29sZWFuXG5cdHtcblx0XHQvLyBAdHMtaWdub3JlXG5cdFx0cmV0dXJuIC9lc2p6b25lXFwuY2MvaS50ZXN0KG5ldyBVUkwodXJsKS5ob3N0bmFtZSB8fCAnJyk7XG5cdH1cblxuXHRtYWtlVXJsKHVybG9iajogTm92ZWxTaXRlLklQYXJzZVVybCwgYm9vbCA/OiBib29sZWFuKTogVVJMXG5cdHtcblx0XHRsZXQgcGFkOiBzdHJpbmc7XG5cblx0XHRpZiAoIWJvb2wgJiYgdXJsb2JqLmNoYXB0ZXJfaWQpXG5cdFx0e1xuXHRcdFx0cGFkID0gYGZvcnVtLyR7dXJsb2JqLm5vdmVsX2lkfS8ke3VybG9iai5jaGFwdGVyX2lkfS5odG1sYFxuXHRcdH1cblx0XHRlbHNlXG5cdFx0e1xuXHRcdFx0cGFkID0gYGRldGFpbC8ke3VybG9iai5ub3ZlbF9pZH0uaHRtbGBcblx0XHR9XG5cblx0XHQvLyBAdHMtaWdub3JlXG5cdFx0cmV0dXJuIG5ldyBVUkwoYGh0dHBzOi8vd3d3LmVzanpvbmUuY2MvJHtwYWR9YCk7XG5cdH1cblxuXHRwYXJzZVVybCh1cmw6IHN0cmluZyB8IFVSTCk6IE5vdmVsU2l0ZS5JUGFyc2VVcmxcblx0e1xuXHRcdGxldCB1cmxvYmogPSB7XG5cdFx0XHR1cmwsXG5cblx0XHRcdG5vdmVsX3BpZDogbnVsbCxcblx0XHRcdG5vdmVsX2lkOiBudWxsLFxuXHRcdFx0Y2hhcHRlcl9pZDogbnVsbCxcblxuXHRcdH07XG5cblx0XHQvL3VybCA9IHVybC50b1N0cmluZygpO1xuXG5cdFx0dHJ5XG5cdFx0e1xuXHRcdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdFx0dXJsb2JqLnVybCA9IG5ldyBVUkwodXJsKTtcblx0XHRcdC8vIEB0cy1pZ25vcmVcblx0XHRcdHVybCA9IHVybG9iai51cmwuaHJlZjtcblx0XHR9XG5cdFx0Y2F0Y2ggKGUpXG5cdFx0e1xuXHRcdFx0Y29uc29sZS53YXJuKGUudG9TdHJpbmcoKSArIGAgXCIke3VybH1cImApO1xuXHRcdH1cblxuXHRcdGlmICh0eXBlb2YgdXJsICE9ICdzdHJpbmcnKVxuXHRcdHtcblx0XHRcdC8vIEB0cy1pZ25vcmVcblx0XHRcdHRocm93IG5ldyBUeXBlRXJyb3IodXJsKTtcblx0XHR9XG5cblx0XHRsZXQgcjogUmVnRXhwO1xuXHRcdGxldCBtO1xuXG5cdFx0ciA9IC9eKFxcZHs2LH0pJC87XG5cdFx0aWYgKG0gPSByLmV4ZWModXJsKSlcblx0XHR7XG5cdFx0XHR1cmxvYmoubm92ZWxfaWQgPSBtWzFdO1xuXHRcdFx0cmV0dXJuIHVybG9iajtcblx0XHR9XG5cblx0XHRyID0gL2VzanpvbmVcXC5jY1xcL2ZvcnVtXFwvKFxcZCspKD86XFwuaHRtbHxcXC8oXFxkKykuaHRtbCkvZztcblx0XHRpZiAobSA9IHIuZXhlYyh1cmwpKVxuXHRcdHtcblx0XHRcdHVybG9iai5ub3ZlbF9pZCA9IG1bMV07XG5cdFx0XHR1cmxvYmouY2hhcHRlcl9pZCA9IG1bMl07XG5cblx0XHRcdHJldHVybiB1cmxvYmo7XG5cdFx0fVxuXG5cdFx0ciA9IC9lc2p6b25lXFwuY2NcXC9kZXRhaWxcXC8oXFxkKykoPzpcXC5odG1sKT8vZztcblx0XHRpZiAobSA9IHIuZXhlYyh1cmwpKVxuXHRcdHtcblx0XHRcdHVybG9iai5ub3ZlbF9pZCA9IG1bMV07XG5cblx0XHRcdHJldHVybiB1cmxvYmo7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHVybG9iajtcblx0fVxuXG5cdHByb3RlY3RlZCBhc3luYyBfZGVjb2RlQ2hhcHRlcjxUPihyZXQ6IElGZXRjaENoYXB0ZXIsIG9wdGlvbnNSdW50aW1lOiBUICYgSU9wdGlvbnNSdW50aW1lLCBjYWNoZSlcblx0e1xuXHRcdGNvbnN0IHsgZG9tIH0gPSByZXQ7XG5cdFx0Y29uc3QgeyAkIH0gPSBkb207XG5cblx0XHRsZXQgaHRtbCA9IGRvbS5zZXJpYWxpemUoKTtcblxuXHRcdGxldCBtID0gaHRtbFxuXHRcdFx0Lm1hdGNoKC9nZXRUcmFuc2xhdGlvblxcKFsnXCJdKFteXFwnXCJdKylbJ1wiXS9pKVxuXHRcdDtcblxuXHRcdGlmIChtKVxuXHRcdHtcblx0XHRcdGxldCBjb2RlID0gbVsxXTtcblxuXHRcdFx0YXdhaXQgcmV0cnlSZXF1ZXN0KHJldC51cmwsIHtcblx0XHRcdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdFx0XHQuLi5vcHRpb25zUnVudGltZS5yZXF1ZXN0T3B0aW9ucyxcblx0XHRcdFx0bWV0aG9kOiAnUE9TVCcsXG5cdFx0XHRcdGZvcm06IHtcblx0XHRcdFx0XHRwbHhmOiAnZ2V0VHJhbnNsYXRpb24nLFxuXHRcdFx0XHRcdHBseGE6IFtjb2RlXSxcblx0XHRcdFx0fSxcblx0XHRcdH0pXG5cdFx0XHRcdC50aGVuKCh2OiBzdHJpbmcpID0+IHtcblx0XHRcdFx0XHR2ID0gdlxuXHRcdFx0XHRcdFx0LnJlcGxhY2UoL1xcPEppbkppbmdcXD4vLCAnJylcblx0XHRcdFx0XHRcdC5yZXBsYWNlKC9cXDxcXC9KaW5KaW5nXFw+LywgJycpXG5cdFx0XHRcdFx0O1xuXG5cdFx0XHRcdFx0cmV0dXJuIEpTT04ucGFyc2Uodilcblx0XHRcdFx0fSlcblx0XHRcdFx0Lypcblx0XHRcdFx0LnRhcCh2ID0+IHtcblx0XHRcdFx0XHRjb25zb2xlLmRpcignLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0nKVxuXHRcdFx0XHRcdGNvbnNvbGUuZGlyKHYpXG5cdFx0XHRcdFx0Y29uc29sZS5kaXIoJy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tJylcblx0XHRcdFx0fSlcblx0XHRcdFx0ICovXG5cdFx0XHRcdC50YXAoKGE6IHN0cmluZ1tdKSA9PiB7XG5cblx0XHRcdFx0XHRsZXQgZWxlbXMgPSAkKCcudHJhbnMsIC50Jyk7XG5cblx0XHRcdFx0XHRhLmZvckVhY2goKHYsIGkpID0+IHtcblx0XHRcdFx0XHRcdGVsZW1zLmVxKGkpLmh0bWwodik7XG5cdFx0XHRcdFx0fSlcblxuXHRcdFx0XHR9KVxuXHRcdFx0O1xuXG5cdFx0fVxuXG5cdFx0Ly9jb25zb2xlLmRpcihtKTtcblx0XHQvL3Byb2Nlc3MuZXhpdCgpO1xuXHR9XG5cblx0cHJvdGVjdGVkIGFzeW5jIF9wYXJzZUNoYXB0ZXI8VD4ocmV0LCBvcHRpb25zUnVudGltZSwgY2FjaGUpXG5cdHtcblx0XHRpZiAoIXJldClcblx0XHR7XG5cdFx0XHRyZXR1cm4gJyc7XG5cdFx0fVxuXG5cdFx0dHJ5XG5cdFx0e1xuXHRcdFx0bGV0IGh0bWwgPSBtaW5pZnlIVE1MKHJldC5kb20uJCgnLmNvbnRhaW5lciAucm93OmhhcyguZm9ydW0tY29udGVudCknKS5odG1sKCkpO1xuXG5cdFx0XHRyZXQuZG9tLiQoJy5jb250YWluZXIgLnJvdzpoYXMoLmZvcnVtLWNvbnRlbnQpJykuaHRtbChodG1sKTtcblx0XHR9XG5cdFx0Y2F0Y2ggKGUpXG5cdFx0e1xuXG5cdFx0fVxuXG5cdFx0cmV0LmRvbS4kKCdwW2NsYXNzXTpoYXMoPiBzY3JpcHQpLCAuYWRzYnlnb29nbGUnKS5yZW1vdmUoKTtcblxuXHRcdGF3YWl0IHRoaXMuX2RlY29kZUNoYXB0ZXIocmV0LCBvcHRpb25zUnVudGltZSwgY2FjaGUpO1xuXG5cdFx0X3BfMl9icignLmZvcnVtLWNvbnRlbnQgPiBwJywgcmV0LmRvbS4kKTtcblxuXHRcdGxldCBlbGVtID0gcmV0LmRvbS4kKCcuY29udGFpbmVyIC5mb3J1bS1jb250ZW50Jyk7XG5cblx0XHRlbGVtLmh0bWwoZnVuY3Rpb24gKGksIG9sZDogc3RyaW5nKVxuXHRcdHtcblx0XHRcdHJldHVybiBvbGRcblx0XHRcdFx0LnJlcGxhY2UoLyhcXDxiclxcPil7Myw0fS9nLCAnJDEnKVxuXHRcdFx0XHQucmVwbGFjZSgvKD88PVxcPGJyXFw+KSg/PVteXFxuXSkvZywgJ1xcbicpXG5cdFx0fSk7XG5cblx0XHRsZXQgdGl0bGUgPSB0cmltKHJldC5kb20uJCgnLmNvbnRhaW5lciAucm93ID4gZGl2ID4gaDMnKS50ZXh0KCkpO1xuXG5cdFx0bGV0IHR4dDogc3RyaW5nID0gZWxlbVxuXHRcdFx0LnRleHQoKVxuXHRcdFx0LnJlcGxhY2UoL14oPzrnlLHmlrznmb7luqZcXHMqXFxkK1xccyrlubTku6XliY3nmoTosrzmlofpg73liKrkuoZ85omA5Lul5LiN5riF5qWa5piv55Sx5ZOq5L2N5aSn5L2s57+76K2vfOiLpei9iei8ieeahOWLleS9nOWGkueKr+S6huaCqO+8jOWFiOi3n+aCqOiqquiBsuaKseatie+8gXzkuZ/purvnhannlZnoqIDlkYrnn6XvvIzmiJHlgJHmnIPlsIfmraTmlofkuIvmnrZ85beyP+eUsT/ora/ogIXmjojmrIrovYnovInvvIE/fOWOn+aWh+e2suWdgO+8mlteXFxuXSt86L2J6LyJ6Ieq6LK85ZCnKSQvdWlnbSwgJycpXG5cdFx0XHQucmVwbGFjZSgvXlxccyt8XFxzKyQvZywgJycpXG5cdFx0O1xuXG5cdFx0aWYgKHR4dC5pbmRleE9mKHRpdGxlICsgJ1xcbicpID09PSAwKVxuXHRcdHtcblx0XHRcdHR4dCA9IHR4dC5zbGljZSh0aXRsZS5sZW5ndGggKyAxKVxuXHRcdFx0XHQucmVwbGFjZSgvXlxcbisvZywgJycpXG5cdFx0XHQ7XG5cdFx0fVxuXG5cdFx0bGV0IGNvbnRyaWJ1dGU6IHN0cmluZ1tdID0gZG90R2V0VmFsdWUoY2FjaGUsICdub3ZlbC5jb250cmlidXRlJywgeyBkZWZhdWx0OiBbXSB9KTtcblxuXHRcdHR4dCA9IHR4dC5yZXBsYWNlKC9e57+76K2v77yaKFteXFxuXSspXFxuLywgKHMsIHYpID0+IHtcblxuXHRcdFx0diA9IHYucmVwbGFjZSgvXltcXHPjgIBcXHhBMF0rfFtcXHPjgIBcXHhBMF0rJC9nLCAnJyk7XG5cblx0XHRcdGlmICh2ICYmICFjb250cmlidXRlLmluY2x1ZGVzKHYpKVxuXHRcdFx0e1xuXHRcdFx0XHRjb250cmlidXRlLnB1c2godik7XG5cdFx0XHR9XG5cblx0XHRcdHJldHVybiAnJ1xuXHRcdH0pO1xuXG5cdFx0aWYgKGNvbnRyaWJ1dGUubGVuZ3RoKVxuXHRcdHtcblx0XHRcdGRvdFNldFZhbHVlKGNhY2hlLCAnbm92ZWwuY29udHJpYnV0ZScsIGNvbnRyaWJ1dGUpO1xuXHRcdH1cblxuXHRcdC8qXG5cdFx0bGV0IGh0bWwgPSBlbGVtLmh0bWwoKTtcblxuXHRcdHRocm93IGNvbnNvbGUuZGlyKHtcblx0XHRcdGh0bWwsXG5cdFx0XHR0eHQsXG5cdFx0fSk7XG5cdFx0ICovXG5cbi8vXHRcdGNvbnNvbGUuZGlyKHR4dCk7XG5cbi8vXHRcdHByb2Nlc3MuZXhpdCgpO1xuXG5cdFx0cmV0dXJuIHR4dCBhcyBzdHJpbmdcblx0fVxuXG5cdGFzeW5jIGdldF92b2x1bWVfbGlzdDxUIGV4dGVuZHMgSU9wdGlvbnNSdW50aW1lPih1cmw6IHN0cmluZyB8IFVSTCxcblx0XHRvcHRpb25zUnVudGltZTogUGFydGlhbDxUICYgSURvd25sb2FkT3B0aW9ucz4gPSB7fSxcblx0KTogUHJvbWlzZTxJTm92ZWw+XG5cdHtcblx0XHRjb25zdCBzZWxmID0gdGhpcztcblxuXHRcdHVybCA9IGF3YWl0IHRoaXMuY3JlYXRlTWFpblVybCh1cmwgYXMgYW55LCBvcHRpb25zUnVudGltZSk7XG5cblx0XHRyZXR1cm4gZnJvbVVSTCh1cmwsIG9wdGlvbnNSdW50aW1lLm9wdGlvbnNKU0RPTSlcblx0XHRcdC50aGVuKGFzeW5jIGZ1bmN0aW9uIChkb206IElKU0RPTSlcblx0XHRcdHtcblx0XHRcdFx0Y29uc3QgJCA9IGRvbS4kO1xuXG5cdFx0XHRcdHRyeVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0bGV0IGh0bWwgPSBtaW5pZnlIVE1MKGRvbS4kKCcucHJvZHVjdC1kZXRhaWwnKS5odG1sKCkpO1xuXG5cdFx0XHRcdFx0ZG9tLiQoJy5wcm9kdWN0LWRldGFpbCcpLmh0bWwoaHRtbCk7XG5cdFx0XHRcdH1cblx0XHRcdFx0Y2F0Y2ggKGUpXG5cdFx0XHRcdHtcblxuXHRcdFx0XHR9XG5cblx0XHRcdFx0bGV0IG5vdmVsX3RpdGxlID0gZG9tLiQoJy5jb250YWluZXIgLnJvdyA+IGRpdiA+IGgzJykudGV4dCgpO1xuXG5cdFx0XHRcdGxldCBub3ZlbF9wdWJsaXNoZXIgPSBzZWxmLklES0VZO1xuXG5cdFx0XHRcdGxldCB1cmxfZGF0YSA9IHNlbGYucGFyc2VVcmwoZG9tLnVybC5ocmVmKTtcblxuXHRcdFx0XHRsZXQgbm92ZWxfYXV0aG9yOiBzdHJpbmc7XG5cdFx0XHRcdGxldCBub3ZlbF9kYXRlO1xuXG5cdFx0XHRcdCQoJy5wcm9kdWN0LWRldGFpbCAud2VsbCAubmF2LWxpc3QgPiBsaScpXG5cdFx0XHRcdFx0LmVhY2goZnVuY3Rpb24gKGksIGVsZW0pXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0bGV0IF90aGlzID0gJCh0aGlzKTtcblxuXHRcdFx0XHRcdFx0bGV0IF90ZXh0ID0gdHJpbShfdGhpcy50ZXh0KCkpO1xuXG5cdFx0XHRcdFx0XHRsZXQgX206IFJlZ0V4cE1hdGNoQXJyYXk7XG5cblx0XHRcdFx0XHRcdGlmIChfbSA9IF90ZXh0Lm1hdGNoKC/kvZzogIVcXHMqW++8mjpdXFxzKihbXlxcbl0rKS8pKVxuXHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRub3ZlbF9hdXRob3IgPSB0cmltKF9tWzFdKVxuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0ZWxzZSBpZiAoX20gPSBfdGV4dC5tYXRjaCgvXFxiKFxcZHs0fVxcLVxcZHsxLDJ9XFwtXFxkezEsMn0pXFxiLykpXG5cdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdHRyeVxuXHRcdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdFx0bGV0IGxhc3RfdXBkYXRlX3RpbWUgPSBtb21lbnQoX21bMV0pO1xuXHRcdFx0XHRcdFx0XHRcdG5vdmVsX2RhdGUgPSBsYXN0X3VwZGF0ZV90aW1lO1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdGNhdGNoIChlKVxuXHRcdFx0XHRcdFx0XHR7XG5cblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0fSlcblx0XHRcdFx0O1xuXG5cdFx0XHRcdGxldCB2b2x1bWVfbGlzdCA9IFtdIGFzIE5vdmVsU2l0ZS5JVm9sdW1lW107XG5cblx0XHRcdFx0Y29uc3Qgbm92ZWxUcmVlID0gb3B0aW9uc1J1bnRpbWUubm92ZWxUcmVlO1xuXHRcdFx0XHRsZXQgY3VycmVudFZvbHVtZTogVHJlZU5vZGU8SVJvd1ZvbHVtZT47XG5cblx0XHRcdFx0bGV0IHRhYmxlID0gZG9tLiQoJy5wcm9kdWN0LWRldGFpbCAudGFiYmFibGUgLnRhYi1jb250ZW50LnNob3ctZGVzYycpLmZpbmQoJ2EnKTtcblxuXHRcdFx0XHRsZXQgX2NhY2hlX2RhdGVzID0gW107XG5cblx0XHRcdFx0bGV0IHRvdGFsX2lkeCA9IDA7XG5cblx0XHRcdFx0e1xuXHRcdFx0XHRcdGxldCB2b2x1bWVfdGl0bGUgPSAnbnVsbCc7XG5cdFx0XHRcdFx0bGV0IHZvbHVtZV9sZXZlbCA9IG51bGw7XG5cblx0XHRcdFx0XHRjdXJyZW50Vm9sdW1lID0gbm92ZWxUcmVlLmFkZFZvbHVtZSh7XG5cdFx0XHRcdFx0XHR2b2x1bWVfdGl0bGUsXG5cdFx0XHRcdFx0XHR2b2x1bWVfbGV2ZWwsXG5cdFx0XHRcdFx0XHR2b2x1bWVfaW5kZXg6IG5vdmVsVHJlZS5yb290KCkuc2l6ZSgpLFxuXHRcdFx0XHRcdFx0dG90YWxfaWR4OiB0b3RhbF9pZHgrKyxcblx0XHRcdFx0XHR9KTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGRvbS4kKCdwW2NsYXNzXTpoYXMoPiBzY3JpcHRbc3JjKj1nb29nbGVdKSwgZGl2W2NsYXNzXTpoYXMoPiBzY3JpcHRbc3JjKj1nb29nbGVdKSwgLmFkc2J5Z29vZ2xlJykucmVtb3ZlKCk7XG5cblx0XHRcdFx0dGFibGVcblx0XHRcdFx0XHQuZWFjaChmdW5jdGlvbiAoaW5kZXgsIGVsZW0pXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0bGV0IHRyID0gZG9tLiQoZWxlbSk7XG5cblx0XHRcdFx0XHRcdGlmICgxKVxuXHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRsZXQgYSA9IHRyO1xuXHRcdFx0XHRcdFx0XHRsZXQgY2hhcHRlcl90aXRsZSA9IHRyaW0oYS50ZXh0KCksIHRydWUpO1xuXG5cdFx0XHRcdFx0XHRcdGxldCBocmVmID0gYS5wcm9wKCdocmVmJyk7XG5cblx0XHRcdFx0XHRcdFx0bGV0IGRhdGEgPSBzZWxmLnBhcnNlVXJsKGhyZWYpO1xuXG5cdFx0XHRcdFx0XHRcdGlmICghZGF0YS5jaGFwdGVyX2lkKVxuXHRcdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdGVsc2Vcblx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdGhyZWYgPSBzZWxmLm1ha2VVcmwoZGF0YSk7XG5cblx0XHRcdFx0XHRcdFx0XHRkYXRhLnVybCA9IGhyZWY7XG5cdFx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0XHRsZXQgY2hhcHRlciA9IHtcblx0XHRcdFx0XHRcdFx0XHRjaGFwdGVyX3RpdGxlLFxuXHRcdFx0XHRcdFx0XHRcdGNoYXB0ZXJfaWQ6IGRhdGEuY2hhcHRlcl9pZCxcblx0XHRcdFx0XHRcdFx0XHRjaGFwdGVyX3VybDogaHJlZixcblx0XHRcdFx0XHRcdFx0XHRjaGFwdGVyX3VybF9kYXRhOiBkYXRhLFxuXHRcdFx0XHRcdFx0XHRcdGNoYXB0ZXJfaW5kZXg6IGN1cnJlbnRWb2x1bWUuc2l6ZSgpLFxuXHRcdFx0XHRcdFx0XHRcdHRvdGFsX2lkeDogdG90YWxfaWR4KyssXG5cdFx0XHRcdFx0XHRcdH07XG5cblx0XHRcdFx0XHRcdFx0bm92ZWxUcmVlLmFkZENoYXB0ZXIoY2hhcHRlciwgY3VycmVudFZvbHVtZSlcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9KVxuXHRcdFx0XHQ7XG5cblx0XHRcdFx0bGV0IGRhdGFfbWV0YTogSU1kY29uZk1ldGEgPSB7XG5cdFx0XHRcdFx0bm92ZWw6IHtcblxuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdH07XG5cblx0XHRcdFx0ZGF0YV9tZXRhLm5vdmVsLmNvdmVyID0gJCgnLnByb2R1Y3QtZGV0YWlsOmVxKDApJykuZmluZCgnaW1nLnByb2R1Y3QtaW1hZ2UnKS5wcm9wKCdzcmMnKTtcblxuXHRcdFx0XHRsZXQgbm92ZWxfZGVzYyA9IHRyaW0oJCgnLnByb2R1Y3QtZGV0YWlsOmVxKDApJykuZmluZCgnLmJvb2tfZGVzY3JpcHRpb24nKS50ZXh0KCkgfHwgJycpO1xuXG5cdFx0XHRcdHJldHVybiB7XG5cblx0XHRcdFx0XHQuLi5kYXRhX21ldGEsXG5cblx0XHRcdFx0XHR1cmw6IGRvbS51cmwsXG5cdFx0XHRcdFx0dXJsX2RhdGEsXG5cblx0XHRcdFx0XHRub3ZlbF9hdXRob3IsXG5cdFx0XHRcdFx0bm92ZWxfZGF0ZSxcblxuXHRcdFx0XHRcdG5vdmVsX2Rlc2MsXG5cblx0XHRcdFx0XHRub3ZlbF90aXRsZSxcblx0XHRcdFx0XHRub3ZlbF9wdWJsaXNoZXIsXG5cblx0XHRcdFx0XHQvL3ZvbHVtZV9saXN0LFxuXHRcdFx0XHRcdG5vdmVsVHJlZSxcblxuXHRcdFx0XHRcdGNoZWNrZGF0ZTogbW9tZW50KCkubG9jYWwoKSxcblxuXHRcdFx0XHRcdGltZ3M6IFtdIGFzIHN0cmluZ1tdLFxuXHRcdFx0XHR9IGFzIElOb3ZlbDtcblx0XHRcdH0pXG5cdFx0XHQ7XG5cdH1cblxufVxuXG5leHBvcnQgZGVmYXVsdCBOb3ZlbFNpdGVFU0pab25lO1xuXG5mdW5jdGlvbiBfcF8yX2JyKHRhcmdldCwgJClcbntcblx0cmV0dXJuICQodGFyZ2V0KVxuXHRcdC5lYWNoKGZ1bmN0aW9uIChpLCBlbGVtKVxuXHRcdHtcblx0XHRcdGxldCBfdGhpcyA9ICQoZWxlbSk7XG5cblx0XHRcdGxldCBfaHRtbCA9IF90aGlzXG5cdFx0XHRcdC5odG1sKClcblx0XHRcdFx0LnJlcGxhY2UoLyg/OiZuYnNwOz8pL2csICcgJylcblx0XHRcdFx0LnJlcGxhY2UoL1tcXHhBMFxcc10rJC9nLCAnJylcblx0XHRcdDtcblxuXHRcdFx0aWYgKF9odG1sID09ICc8YnIvPicgfHwgX2h0bWwgPT0gJzxicj4nKVxuXHRcdFx0e1xuXHRcdFx0XHRfaHRtbCA9ICcnO1xuXHRcdFx0fVxuXG5cdFx0XHRfdGhpcy5hZnRlcihgJHtfaHRtbH08YnIvPmApO1xuXHRcdFx0X3RoaXMucmVtb3ZlKClcblx0XHR9KVxuXHRcdDtcbn1cbiJdfQ==