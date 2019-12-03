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
const regexp_cjk_1 = require("regexp-cjk");
/**
 * 铅笔小说
 * @example https://www.x23qb.com/book/284/
 */
let NovelSiteX23qb = class NovelSiteX23qb extends tree_1.default {
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
            pad = `book/${urlobj.novel_id}/${urlobj.chapter_id}.html`;
        }
        else {
            pad = `book/${urlobj.novel_id}/`;
        }
        // @ts-ignore
        return new jsdom_url_1.URL(`https://www.x23qb.com/${pad}`);
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
        r = /^(\d+)$/;
        if (m = r.exec(url)) {
            urlobj.novel_id = m[1];
            return urlobj;
        }
        r = /book\/(\d+)(?:\/(\d+).html|\/?)/g;
        if (m = r.exec(url)) {
            urlobj.novel_id = m[1];
            urlobj.chapter_id = m[2];
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
                let elems = $('.trans');
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
            let html = util_1.minifyHTML($('#mlfy_main_text').html());
            $('#mlfy_main_text').html(html);
        }
        catch (e) {
        }
        let elem = ret.dom.$('#TextContent');
        elem
            .find('> .tp, > .ke, > .rd, > .bd, script')
            .remove();
        _p_2_br(elem.find('p'), ret.dom.$);
        elem.html(function (i, old) {
            return old
                .replace(/(\<br\>){3,4}/g, '$1')
                .replace(/(?<=\<br\>)(?=[^\n])/g, '\n');
        });
        let title = util_1.trim(ret.dom.$('mlfy_main_text > h1:eq(0)').text());
        if (!this._cache_re) {
            this._cache_re = new regexp_cjk_1.zhRegExp(/^(?:鉛\s*筆\s*小\s*說\(w\s*w\s*w\s*\.\s*x\s*2\s*3\s*q\s*b\s*\.\s*c\s*o\s*m\))$/uigm);
        }
        let txt = elem
            .text()
            .replace(this._cache_re, '')
            .replace(/^\s+|\s+$/g, '')
            .replace(/^[ \xA0]+|[ \xA0]+$/gm, '');
        return txt;
    }
    async get_volume_list(url, optionsRuntime = {}) {
        const self = this;
        url = await this.createMainUrl(url, optionsRuntime);
        return jsdom_extra_1.fromURL(url, optionsRuntime.optionsJSDOM)
            .then(async function (dom) {
            const $ = dom.$;
            let novel_title = dom.$('.d_title h1').text();
            let novel_publisher = self.IDKEY;
            let url_data = self.parseUrl(dom.url.href);
            let novel_desc = $('#bookintro > p:eq(0)').text();
            let volume_list = [];
            const novelTree = optionsRuntime.novelTree;
            let currentVolume;
            let table = $('#chapterList li')
                .find('a');
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
                novel: {
                    tags: [],
                },
            };
            let novel_date = index_2.moment($('#uptime > span').text());
            let tag = $('.bookright #count li:eq(0) span:eq(0)').text().trim();
            if (tag) {
                data_meta.novel.tags.push(tag);
            }
            let novel_author = $('.p_author a:eq(0)').text().trim();
            data_meta.link = data_meta.link || [];
            data_meta.link.push($('.p_author a:eq(0)').prop('href'));
            $('.bookright #count li span')
                .each((i, elem) => {
                let txt = $(elem).text().trim();
                let bool = [
                    '完結済',
                    '完結',
                    '已完結',
                    '已完成',
                    '完结済',
                    '完结',
                    '已完结',
                    '已完成',
                ].includes(txt);
                if (bool) {
                    data_meta.novel.status = txt;
                }
            });
            return Object.assign(Object.assign({}, data_meta), { url: dom.url, url_data,
                novel_title,
                novel_publisher,
                novel_author,
                novel_date,
                novel_desc,
                //volume_list,
                novelTree, checkdate: index_2.moment().local(), imgs: [] });
        });
    }
};
NovelSiteX23qb.IDKEY = 'x23qb';
NovelSiteX23qb = __decorate([
    index_1.staticImplements()
], NovelSiteX23qb);
exports.NovelSiteX23qb = NovelSiteX23qb;
exports.default = NovelSiteX23qb;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7O0dBRUc7Ozs7Ozs7O0FBRUgscUNBQThDO0FBQzlDLHVDQUF1RztBQU92Ryw2Q0FBK0Q7QUFFL0QseUNBQWdDO0FBRWhDLG9DQUEwRjtBQUUxRixvQ0FBa0M7QUFDbEMsdUNBQTJDO0FBQzNDLDJDQUFzQztBQUV0Qzs7O0dBR0c7QUFFSCxJQUFhLGNBQWMsR0FBM0IsTUFBYSxjQUFlLFNBQVEsY0FBYTtJQUloRDs7Ozs7Ozs7O09BU0c7SUFFSCxNQUFNLENBQUMsS0FBSyxDQUFDLEdBQXVDLEVBQUUsT0FBUTtRQUU3RCxhQUFhO1FBQ2IsT0FBTyxjQUFjLENBQUMsSUFBSSxDQUFDLElBQUksZUFBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLFFBQVEsSUFBSSxFQUFFLENBQUMsQ0FBQztJQUN6RCxDQUFDO0lBSUQsT0FBTyxDQUFDLE1BQTJCLEVBQUUsSUFBZTtRQUVuRCxJQUFJLEdBQVcsQ0FBQztRQUVoQixJQUFJLENBQUMsSUFBSSxJQUFJLE1BQU0sQ0FBQyxVQUFVLEVBQzlCO1lBQ0MsR0FBRyxHQUFHLFFBQVEsTUFBTSxDQUFDLFFBQVEsSUFBSSxNQUFNLENBQUMsVUFBVSxPQUFPLENBQUE7U0FDekQ7YUFFRDtZQUNDLEdBQUcsR0FBRyxRQUFRLE1BQU0sQ0FBQyxRQUFRLEdBQUcsQ0FBQTtTQUNoQztRQUVELGFBQWE7UUFDYixPQUFPLElBQUksZUFBRyxDQUFDLHlCQUF5QixHQUFHLEVBQUUsQ0FBQyxDQUFDO0lBQ2hELENBQUM7SUFFRCxRQUFRLENBQUMsR0FBaUI7UUFFekIsSUFBSSxNQUFNLEdBQUc7WUFDWixHQUFHO1lBRUgsU0FBUyxFQUFFLElBQUk7WUFDZixRQUFRLEVBQUUsSUFBSTtZQUNkLFVBQVUsRUFBRSxJQUFJO1NBRWhCLENBQUM7UUFFRix1QkFBdUI7UUFFdkIsSUFDQTtZQUNDLGFBQWE7WUFDYixNQUFN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MjAxOC8zLzE3LzAxNy5cbiAqL1xuXG5pbXBvcnQgeyBtaW5pZnlIVE1MLCB0cmltIH0gZnJvbSAnLi4vLi4vdXRpbCc7XG5pbXBvcnQgTm92ZWxTaXRlRGVtbywgeyBJRG93bmxvYWRPcHRpb25zLCBJTm92ZWwsIElPcHRpb25zUnVudGltZSwgSUZldGNoQ2hhcHRlciB9IGZyb20gJy4uL2RlbW8vdHJlZSc7XG5pbXBvcnQgeyBJUm93Vm9sdW1lLCBUcmVlTm9kZSB9IGZyb20gJy4uLy4uL3RyZWUvaW5kZXgnO1xuXG5pbXBvcnQgZnMgPSByZXF1aXJlKCdmcy1leHRyYScpO1xuaW1wb3J0IHsgdHJpbUZpbGVuYW1lIH0gZnJvbSAnZnMtaWNvbnYvdXRpbCc7XG5pbXBvcnQgKiBhcyBwYXRoIGZyb20gJ3VwYXRoMic7XG5pbXBvcnQgbm92ZWxJbmZvLCB7IElNZGNvbmZNZXRhIH0gZnJvbSAnbm9kZS1ub3ZlbC1pbmZvJztcbmltcG9ydCB7IGZyb21VUkwsIElGcm9tVXJsT3B0aW9ucywgSUpTRE9NIH0gZnJvbSAnanNkb20tZXh0cmEnO1xuXG5pbXBvcnQgeyBVUkwgfSBmcm9tICdqc2RvbS11cmwnO1xuXG5pbXBvcnQgTm92ZWxTaXRlLCB7IHN0YXRpY0ltcGxlbWVudHMsIGRlZmF1bHRKU0RPTU9wdGlvbnMsIFNZTUJPTF9DQUNIRSB9IGZyb20gJy4uL2luZGV4JztcbmltcG9ydCB7IFByb21pc2VCbHVlYmlyZCwgYmx1ZWJpcmREZWNvcmF0b3IgfSBmcm9tICcuLi9pbmRleCc7XG5pbXBvcnQgeyBtb21lbnQgfSBmcm9tICcuLi9pbmRleCc7XG5pbXBvcnQgeyByZXRyeVJlcXVlc3QgfSBmcm9tICcuLi8uLi9mZXRjaCc7XG5pbXBvcnQgeyB6aFJlZ0V4cCB9IGZyb20gJ3JlZ2V4cC1jamsnO1xuXG4vKipcbiAqIOmTheeslOWwj+ivtFxuICogQGV4YW1wbGUgaHR0cHM6Ly93d3cueDIzcWIuY29tL2Jvb2svMjg0L1xuICovXG5Ac3RhdGljSW1wbGVtZW50czxOb3ZlbFNpdGUuSU5vdmVsU2l0ZVN0YXRpYzxOb3ZlbFNpdGVYMjNxYj4+KClcbmV4cG9ydCBjbGFzcyBOb3ZlbFNpdGVYMjNxYiBleHRlbmRzIE5vdmVsU2l0ZURlbW9cbntcblx0cHVibGljIHN0YXRpYyByZWFkb25seSBJREtFWSA9ICd4MjNxYic7XG5cblx0Lypcblx0cHJvdGVjdGVkIF9maXhPcHRpb25zUnVudGltZShvcHRpb25zUnVudGltZSlcblx0e1xuXHRcdG9wdGlvbnNSdW50aW1lLm9wdGlvbnNKU0RPTSA9IG9wdGlvbnNSdW50aW1lLm9wdGlvbnNKU0RPTSB8fCB7fTtcblxuXHRcdC8vb3B0aW9uc1J1bnRpbWUub3B0aW9uc0pTRE9NLnJ1blNjcmlwdHMgPSAnZGFuZ2Vyb3VzbHknO1xuXG5cdFx0cmV0dXJuIHN1cGVyLl9maXhPcHRpb25zUnVudGltZShvcHRpb25zUnVudGltZSlcblx0fVxuXHQgKi9cblxuXHRzdGF0aWMgY2hlY2sodXJsOiBzdHJpbmcgfCBVUkwgfCBOb3ZlbFNpdGUuSVBhcnNlVXJsLCBvcHRpb25zPyk6IGJvb2xlYW5cblx0e1xuXHRcdC8vIEB0cy1pZ25vcmVcblx0XHRyZXR1cm4gL2VzanpvbmVcXC5jYy9pLnRlc3QobmV3IFVSTCh1cmwpLmhvc3RuYW1lIHx8ICcnKTtcblx0fVxuXG5cdHByb3RlY3RlZCBfY2FjaGVfcmU6IFJlZ0V4cDtcblxuXHRtYWtlVXJsKHVybG9iajogTm92ZWxTaXRlLklQYXJzZVVybCwgYm9vbCA/OiBib29sZWFuKTogVVJMXG5cdHtcblx0XHRsZXQgcGFkOiBzdHJpbmc7XG5cblx0XHRpZiAoIWJvb2wgJiYgdXJsb2JqLmNoYXB0ZXJfaWQpXG5cdFx0e1xuXHRcdFx0cGFkID0gYGJvb2svJHt1cmxvYmoubm92ZWxfaWR9LyR7dXJsb2JqLmNoYXB0ZXJfaWR9Lmh0bWxgXG5cdFx0fVxuXHRcdGVsc2Vcblx0XHR7XG5cdFx0XHRwYWQgPSBgYm9vay8ke3VybG9iai5ub3ZlbF9pZH0vYFxuXHRcdH1cblxuXHRcdC8vIEB0cy1pZ25vcmVcblx0XHRyZXR1cm4gbmV3IFVSTChgaHR0cHM6Ly93d3cueDIzcWIuY29tLyR7cGFkfWApO1xuXHR9XG5cblx0cGFyc2VVcmwodXJsOiBzdHJpbmcgfCBVUkwpOiBOb3ZlbFNpdGUuSVBhcnNlVXJsXG5cdHtcblx0XHRsZXQgdXJsb2JqID0ge1xuXHRcdFx0dXJsLFxuXG5cdFx0XHRub3ZlbF9waWQ6IG51bGwsXG5cdFx0XHRub3ZlbF9pZDogbnVsbCxcblx0XHRcdGNoYXB0ZXJfaWQ6IG51bGwsXG5cblx0XHR9O1xuXG5cdFx0Ly91cmwgPSB1cmwudG9TdHJpbmcoKTtcblxuXHRcdHRyeVxuXHRcdHtcblx0XHRcdC8vIEB0cy1pZ25vcmVcblx0XHRcdHVybG9iai51cmwgPSBuZXcgVVJMKHVybCk7XG5cdFx0XHQvLyBAdHMtaWdub3JlXG5cdFx0XHR1cmwgPSB1cmxvYmoudXJsLmhyZWY7XG5cdFx0fVxuXHRcdGNhdGNoIChlKVxuXHRcdHtcblx0XHRcdGNvbnNvbGUud2FybihlLnRvU3RyaW5nKCkgKyBgIFwiJHt1cmx9XCJgKTtcblx0XHR9XG5cblx0XHRpZiAodHlwZW9mIHVybCAhPSAnc3RyaW5nJylcblx0XHR7XG5cdFx0XHQvLyBAdHMtaWdub3JlXG5cdFx0XHR0aHJvdyBuZXcgVHlwZUVycm9yKHVybCk7XG5cdFx0fVxuXG5cdFx0bGV0IHI6IFJlZ0V4cDtcblx0XHRsZXQgbTtcblxuXHRcdHIgPSAvXihcXGQrKSQvO1xuXHRcdGlmIChtID0gci5leGVjKHVybCkpXG5cdFx0e1xuXHRcdFx0dXJsb2JqLm5vdmVsX2lkID0gbVsxXTtcblx0XHRcdHJldHVybiB1cmxvYmo7XG5cdFx0fVxuXG5cdFx0ciA9IC9ib29rXFwvKFxcZCspKD86XFwvKFxcZCspLmh0bWx8XFwvPykvZztcblx0XHRpZiAobSA9IHIuZXhlYyh1cmwpKVxuXHRcdHtcblx0XHRcdHVybG9iai5ub3ZlbF9pZCA9IG1bMV07XG5cdFx0XHR1cmxvYmouY2hhcHRlcl9pZCA9IG1bMl07XG5cblx0XHRcdHJldHVybiB1cmxvYmo7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHVybG9iajtcblx0fVxuXG5cdHByb3RlY3RlZCBhc3luYyBfZGVjb2RlQ2hhcHRlcjxUPihyZXQ6IElGZXRjaENoYXB0ZXIsIG9wdGlvbnNSdW50aW1lOiBUICYgSU9wdGlvbnNSdW50aW1lLCBjYWNoZSlcblx0e1xuXHRcdGNvbnN0IHsgZG9tIH0gPSByZXQ7XG5cdFx0Y29uc3QgeyAkIH0gPSBkb207XG5cblx0XHRsZXQgaHRtbCA9IGRvbS5zZXJpYWxpemUoKTtcblxuXHRcdGxldCBtID0gaHRtbFxuXHRcdFx0Lm1hdGNoKC9nZXRUcmFuc2xhdGlvblxcKFsnXCJdKFteXFwnXCJdKylbJ1wiXS9pKVxuXHRcdDtcblxuXHRcdGlmIChtKVxuXHRcdHtcblx0XHRcdGxldCBjb2RlID0gbVsxXTtcblxuXHRcdFx0YXdhaXQgcmV0cnlSZXF1ZXN0KHJldC51cmwsIHtcblx0XHRcdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdFx0XHQuLi5vcHRpb25zUnVudGltZS5yZXF1ZXN0T3B0aW9ucyxcblx0XHRcdFx0bWV0aG9kOiAnUE9TVCcsXG5cdFx0XHRcdGZvcm06IHtcblx0XHRcdFx0XHRwbHhmOiAnZ2V0VHJhbnNsYXRpb24nLFxuXHRcdFx0XHRcdHBseGE6IFtjb2RlXSxcblx0XHRcdFx0fSxcblx0XHRcdH0pXG5cdFx0XHRcdC50aGVuKCh2OiBzdHJpbmcpID0+IHtcblx0XHRcdFx0XHR2ID0gdlxuXHRcdFx0XHRcdFx0LnJlcGxhY2UoL1xcPEppbkppbmdcXD4vLCAnJylcblx0XHRcdFx0XHRcdC5yZXBsYWNlKC9cXDxcXC9KaW5KaW5nXFw+LywgJycpXG5cdFx0XHRcdFx0O1xuXG5cdFx0XHRcdFx0cmV0dXJuIEpTT04ucGFyc2Uodilcblx0XHRcdFx0fSlcblx0XHRcdFx0Lypcblx0XHRcdFx0LnRhcCh2ID0+IHtcblx0XHRcdFx0XHRjb25zb2xlLmRpcignLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0nKVxuXHRcdFx0XHRcdGNvbnNvbGUuZGlyKHYpXG5cdFx0XHRcdFx0Y29uc29sZS5kaXIoJy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tJylcblx0XHRcdFx0fSlcblx0XHRcdFx0ICovXG5cdFx0XHRcdC50YXAoKGE6IHN0cmluZ1tdKSA9PiB7XG5cblx0XHRcdFx0XHRsZXQgZWxlbXMgPSAkKCcudHJhbnMnKTtcblxuXHRcdFx0XHRcdGEuZm9yRWFjaCgodiwgaSkgPT4ge1xuXHRcdFx0XHRcdFx0ZWxlbXMuZXEoaSkuaHRtbCh2KTtcblx0XHRcdFx0XHR9KVxuXG5cdFx0XHRcdH0pXG5cdFx0XHQ7XG5cblx0XHR9XG5cblx0XHQvL2NvbnNvbGUuZGlyKG0pO1xuXHRcdC8vcHJvY2Vzcy5leGl0KCk7XG5cdH1cblxuXHRwcm90ZWN0ZWQgYXN5bmMgX3BhcnNlQ2hhcHRlcjxUPihyZXQsIG9wdGlvbnNSdW50aW1lLCBjYWNoZSlcblx0e1xuXHRcdGlmICghcmV0KVxuXHRcdHtcblx0XHRcdHJldHVybiAnJztcblx0XHR9XG5cblx0XHR0cnlcblx0XHR7XG5cdFx0XHRsZXQgaHRtbCA9IG1pbmlmeUhUTUwoJCgnI21sZnlfbWFpbl90ZXh0JykuaHRtbCgpKTtcblxuXHRcdFx0JCgnI21sZnlfbWFpbl90ZXh0JykuaHRtbChodG1sKTtcblx0XHR9XG5cdFx0Y2F0Y2ggKGUpXG5cdFx0e1xuXG5cdFx0fVxuXG5cdFx0bGV0IGVsZW0gPSByZXQuZG9tLiQoJyNUZXh0Q29udGVudCcpO1xuXG5cdFx0ZWxlbVxuXHRcdFx0LmZpbmQoJz4gLnRwLCA+IC5rZSwgPiAucmQsID4gLmJkLCBzY3JpcHQnKVxuXHRcdFx0LnJlbW92ZSgpXG5cdFx0O1xuXG5cdFx0X3BfMl9icihlbGVtLmZpbmQoJ3AnKSwgcmV0LmRvbS4kKTtcblxuXHRcdGVsZW0uaHRtbChmdW5jdGlvbiAoaSwgb2xkOiBzdHJpbmcpXG5cdFx0e1xuXHRcdFx0cmV0dXJuIG9sZFxuXHRcdFx0XHQucmVwbGFjZSgvKFxcPGJyXFw+KXszLDR9L2csICckMScpXG5cdFx0XHRcdC5yZXBsYWNlKC8oPzw9XFw8YnJcXD4pKD89W15cXG5dKS9nLCAnXFxuJylcblx0XHR9KTtcblxuXHRcdGxldCB0aXRsZSA9IHRyaW0ocmV0LmRvbS4kKCdtbGZ5X21haW5fdGV4dCA+IGgxOmVxKDApJykudGV4dCgpKTtcblxuXHRcdGlmICghdGhpcy5fY2FjaGVfcmUpXG5cdFx0e1xuXHRcdFx0dGhpcy5fY2FjaGVfcmUgPSBuZXcgemhSZWdFeHAoL14oPzrpiZtcXHMq562GXFxzKuWwj1xccyroqqpcXCh3XFxzKndcXHMqd1xccypcXC5cXHMqeFxccyoyXFxzKjNcXHMqcVxccypiXFxzKlxcLlxccypjXFxzKm9cXHMqbVxcKSkkL3VpZ20pXG5cdFx0fVxuXG5cdFx0bGV0IHR4dDogc3RyaW5nID0gZWxlbVxuXHRcdFx0LnRleHQoKVxuXHRcdFx0LnJlcGxhY2UodGhpcy5fY2FjaGVfcmUsICcnKVxuXHRcdFx0LnJlcGxhY2UoL15cXHMrfFxccyskL2csICcnKVxuXHRcdFx0LnJlcGxhY2UoL15bIFxceEEwXSt8WyBcXHhBMF0rJC9nbSwgJycpXG5cdFx0O1xuXG5cdFx0cmV0dXJuIHR4dCBhcyBzdHJpbmdcblx0fVxuXG5cdGFzeW5jIGdldF92b2x1bWVfbGlzdDxUIGV4dGVuZHMgSU9wdGlvbnNSdW50aW1lPih1cmw6IHN0cmluZyB8IFVSTCxcblx0XHRvcHRpb25zUnVudGltZTogUGFydGlhbDxUICYgSURvd25sb2FkT3B0aW9ucz4gPSB7fSxcblx0KTogUHJvbWlzZTxJTm92ZWw+XG5cdHtcblx0XHRjb25zdCBzZWxmID0gdGhpcztcblxuXHRcdHVybCA9IGF3YWl0IHRoaXMuY3JlYXRlTWFpblVybCh1cmwgYXMgYW55LCBvcHRpb25zUnVudGltZSk7XG5cblx0XHRyZXR1cm4gZnJvbVVSTCh1cmwsIG9wdGlvbnNSdW50aW1lLm9wdGlvbnNKU0RPTSlcblx0XHRcdC50aGVuKGFzeW5jIGZ1bmN0aW9uIChkb206IElKU0RPTSlcblx0XHRcdHtcblx0XHRcdFx0Y29uc3QgJCA9IGRvbS4kO1xuXG5cdFx0XHRcdGxldCBub3ZlbF90aXRsZSA9IGRvbS4kKCcuZF90aXRsZSBoMScpLnRleHQoKTtcblxuXHRcdFx0XHRsZXQgbm92ZWxfcHVibGlzaGVyID0gc2VsZi5JREtFWTtcblxuXHRcdFx0XHRsZXQgdXJsX2RhdGEgPSBzZWxmLnBhcnNlVXJsKGRvbS51cmwuaHJlZik7XG5cblx0XHRcdFx0bGV0IG5vdmVsX2Rlc2MgPSAkKCcjYm9va2ludHJvID4gcDplcSgwKScpLnRleHQoKTtcblxuXHRcdFx0XHRsZXQgdm9sdW1lX2xpc3QgPSBbXSBhcyBOb3ZlbFNpdGUuSVZvbHVtZVtdO1xuXG5cdFx0XHRcdGNvbnN0IG5vdmVsVHJlZSA9IG9wdGlvbnNSdW50aW1lLm5vdmVsVHJlZTtcblx0XHRcdFx0bGV0IGN1cnJlbnRWb2x1bWU6IFRyZWVOb2RlPElSb3dWb2x1bWU+O1xuXG5cdFx0XHRcdGxldCB0YWJsZSA9ICQoJyNjaGFwdGVyTGlzdCBsaScpXG5cdFx0XHRcdFx0LmZpbmQoJ2EnKVxuXHRcdFx0XHQ7XG5cblx0XHRcdFx0bGV0IF9jYWNoZV9kYXRlcyA9IFtdO1xuXG5cdFx0XHRcdGxldCB0b3RhbF9pZHggPSAwO1xuXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRsZXQgdm9sdW1lX3RpdGxlID0gJ251bGwnO1xuXHRcdFx0XHRcdGxldCB2b2x1bWVfbGV2ZWwgPSBudWxsO1xuXG5cdFx0XHRcdFx0Y3VycmVudFZvbHVtZSA9IG5vdmVsVHJlZS5hZGRWb2x1bWUoe1xuXHRcdFx0XHRcdFx0dm9sdW1lX3RpdGxlLFxuXHRcdFx0XHRcdFx0dm9sdW1lX2xldmVsLFxuXHRcdFx0XHRcdFx0dm9sdW1lX2luZGV4OiBub3ZlbFRyZWUucm9vdCgpLnNpemUoKSxcblx0XHRcdFx0XHRcdHRvdGFsX2lkeDogdG90YWxfaWR4KyssXG5cdFx0XHRcdFx0fSk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHR0YWJsZVxuXHRcdFx0XHRcdC5lYWNoKGZ1bmN0aW9uIChpbmRleCwgZWxlbSlcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRsZXQgdHIgPSBkb20uJChlbGVtKTtcblxuXHRcdFx0XHRcdFx0aWYgKDEpXG5cdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdGxldCBhID0gdHI7XG5cdFx0XHRcdFx0XHRcdGxldCBjaGFwdGVyX3RpdGxlID0gdHJpbShhLnRleHQoKSwgdHJ1ZSk7XG5cblx0XHRcdFx0XHRcdFx0bGV0IGhyZWYgPSBhLnByb3AoJ2hyZWYnKTtcblxuXHRcdFx0XHRcdFx0XHRsZXQgZGF0YSA9IHNlbGYucGFyc2VVcmwoaHJlZik7XG5cblx0XHRcdFx0XHRcdFx0aWYgKCFkYXRhLmNoYXB0ZXJfaWQpXG5cdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHRyZXR1cm47XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0ZWxzZVxuXHRcdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdFx0aHJlZiA9IHNlbGYubWFrZVVybChkYXRhKTtcblxuXHRcdFx0XHRcdFx0XHRcdGRhdGEudXJsID0gaHJlZjtcblx0XHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHRcdGxldCBjaGFwdGVyID0ge1xuXHRcdFx0XHRcdFx0XHRcdGNoYXB0ZXJfdGl0bGUsXG5cdFx0XHRcdFx0XHRcdFx0Y2hhcHRlcl9pZDogZGF0YS5jaGFwdGVyX2lkLFxuXHRcdFx0XHRcdFx0XHRcdGNoYXB0ZXJfdXJsOiBocmVmLFxuXHRcdFx0XHRcdFx0XHRcdGNoYXB0ZXJfdXJsX2RhdGE6IGRhdGEsXG5cdFx0XHRcdFx0XHRcdFx0Y2hhcHRlcl9pbmRleDogY3VycmVudFZvbHVtZS5zaXplKCksXG5cdFx0XHRcdFx0XHRcdFx0dG90YWxfaWR4OiB0b3RhbF9pZHgrKyxcblx0XHRcdFx0XHRcdFx0fTtcblxuXHRcdFx0XHRcdFx0XHRub3ZlbFRyZWUuYWRkQ2hhcHRlcihjaGFwdGVyLCBjdXJyZW50Vm9sdW1lKVxuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH0pXG5cdFx0XHRcdDtcblxuXHRcdFx0XHRsZXQgZGF0YV9tZXRhOiBJTWRjb25mTWV0YSA9IHtcblx0XHRcdFx0XHRub3ZlbDoge1xuXHRcdFx0XHRcdFx0dGFnczogW10sXG5cdFx0XHRcdFx0fSxcblx0XHRcdFx0fTtcblxuXHRcdFx0XHRsZXQgbm92ZWxfZGF0ZSA9IG1vbWVudCgkKCcjdXB0aW1lID4gc3BhbicpLnRleHQoKSk7XG5cblx0XHRcdFx0bGV0IHRhZyA9ICQoJy5ib29rcmlnaHQgI2NvdW50IGxpOmVxKDApIHNwYW46ZXEoMCknKS50ZXh0KCkudHJpbSgpO1xuXG5cdFx0XHRcdGlmICh0YWcpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRkYXRhX21ldGEubm92ZWwudGFncy5wdXNoKHRhZylcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGxldCBub3ZlbF9hdXRob3IgPSAkKCcucF9hdXRob3IgYTplcSgwKScpLnRleHQoKS50cmltKCk7XG5cblx0XHRcdFx0ZGF0YV9tZXRhLmxpbmsgPSBkYXRhX21ldGEubGluayB8fCBbXTtcblx0XHRcdFx0ZGF0YV9tZXRhLmxpbmsucHVzaCgkKCcucF9hdXRob3IgYTplcSgwKScpLnByb3AoJ2hyZWYnKSk7XG5cblx0XHRcdFx0JCgnLmJvb2tyaWdodCAjY291bnQgbGkgc3BhbicpXG5cdFx0XHRcdFx0LmVhY2goKGksIGVsZW0pID0+IHtcblxuXHRcdFx0XHRcdFx0bGV0IHR4dCA9ICQoZWxlbSkudGV4dCgpLnRyaW0oKTtcblxuXHRcdFx0XHRcdFx0bGV0IGJvb2wgPSBbXG5cdFx0XHRcdFx0XHRcdCflrozntZDmuIgnLFxuXHRcdFx0XHRcdFx0XHQn5a6M57WQJyxcblx0XHRcdFx0XHRcdFx0J+W3suWujOe1kCcsXG5cdFx0XHRcdFx0XHRcdCflt7LlrozmiJAnLFxuXHRcdFx0XHRcdFx0XHQn5a6M57uT5riIJyxcblx0XHRcdFx0XHRcdFx0J+WujOe7kycsXG5cdFx0XHRcdFx0XHRcdCflt7Llroznu5MnLFxuXHRcdFx0XHRcdFx0XHQn5bey5a6M5oiQJyxcblx0XHRcdFx0XHRcdF0uaW5jbHVkZXModHh0KVxuXHRcdFx0XHRcdFx0O1xuXG5cdFx0XHRcdFx0XHRpZiAoYm9vbClcblx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0ZGF0YV9tZXRhLm5vdmVsLnN0YXR1cyA9IHR4dDtcblx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdH0pXG5cdFx0XHRcdDtcblxuXHRcdFx0XHRyZXR1cm4ge1xuXG5cdFx0XHRcdFx0Li4uZGF0YV9tZXRhLFxuXG5cdFx0XHRcdFx0dXJsOiBkb20udXJsLFxuXHRcdFx0XHRcdHVybF9kYXRhLFxuXG5cdFx0XHRcdFx0bm92ZWxfdGl0bGUsXG5cdFx0XHRcdFx0bm92ZWxfcHVibGlzaGVyLFxuXG5cdFx0XHRcdFx0bm92ZWxfYXV0aG9yLFxuXG5cdFx0XHRcdFx0bm92ZWxfZGF0ZSxcblxuXHRcdFx0XHRcdG5vdmVsX2Rlc2MsXG5cblx0XHRcdFx0XHQvL3ZvbHVtZV9saXN0LFxuXHRcdFx0XHRcdG5vdmVsVHJlZSxcblxuXHRcdFx0XHRcdGNoZWNrZGF0ZTogbW9tZW50KCkubG9jYWwoKSxcblxuXHRcdFx0XHRcdGltZ3M6IFtdIGFzIHN0cmluZ1tdLFxuXHRcdFx0XHR9IGFzIElOb3ZlbDtcblx0XHRcdH0pXG5cdFx0XHQ7XG5cdH1cblxufVxuXG5leHBvcnQgZGVmYXVsdCBOb3ZlbFNpdGVYMjNxYjtcblxuZnVuY3Rpb24gX3BfMl9icih0YXJnZXQsICQpXG57XG5cdHJldHVybiAkKHRhcmdldClcblx0XHQuZWFjaChmdW5jdGlvbiAoaSwgZWxlbSlcblx0XHR7XG5cdFx0XHRsZXQgX3RoaXMgPSAkKGVsZW0pO1xuXG5cdFx0XHRsZXQgX2h0bWwgPSBfdGhpc1xuXHRcdFx0XHQuaHRtbCgpXG5cdFx0XHRcdC5yZXBsYWNlKC8oPzombmJzcDs/KS9nLCAnICcpXG5cdFx0XHRcdC5yZXBsYWNlKC9bXFx4QTBcXHNdKyQvZywgJycpXG5cdFx0XHQ7XG5cblx0XHRcdGlmIChfaHRtbCA9PSAnPGJyLz4nIHx8IF9odG1sID09ICc8YnI+Jylcblx0XHRcdHtcblx0XHRcdFx0X2h0bWwgPSAnJztcblx0XHRcdH1cblxuXHRcdFx0X3RoaXMuYWZ0ZXIoYCR7X2h0bWx9PGJyLz5gKTtcblx0XHRcdF90aGlzLnJlbW92ZSgpXG5cdFx0fSlcblx0XHQ7XG59XG4iXX0=