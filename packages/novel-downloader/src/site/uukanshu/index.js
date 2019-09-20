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
const strip_1 = require("../../strip");
const util_1 = require("../../util");
const index_1 = require("../index");
const base_1 = require("../demo/base");
const jsdom_url_1 = require("jsdom-url");
const jsdom_extra_1 = require("jsdom-extra");
const index_2 = require("../index");
const novel_text_1 = require("novel-text");
const path = require("path");
let NovelSiteUukanshu = class NovelSiteUukanshu extends base_1.default {
    makeUrl(urlobj, bool, optionsRuntime) {
        let url;
        let cid = (!bool && urlobj.chapter_id) ? `${urlobj.chapter_id}.html` : '';
        url = `https://www.uukanshu.com/b/${urlobj.novel_id}/${cid}`;
        // @ts-ignore
        return new jsdom_url_1.URL(url);
    }
    parseUrl(url, options) {
        let urlobj = {
            url: url,
            novel_pid: null,
            novel_id: null,
            chapter_id: null,
            chapter_vip: null,
        };
        // @ts-ignore
        urlobj.url = new jsdom_url_1.URL(url);
        url = urlobj.url.href;
        let r = /www\.uukanshu\.com\/b\/(\d+)\/(\d+)\.html/;
        let m = r.exec(url);
        if (m) {
            urlobj.novel_id = m[1];
            urlobj.chapter_id = m[2];
            return urlobj;
        }
        r = /www\.uukanshu\.com\/b\/(\d+)/;
        if (m = r.exec(url)) {
            urlobj.novel_id = m[1];
            return urlobj;
        }
        return urlobj;
    }
    createMainUrl(url, optionsRuntime) {
        let data = this.parseUrl(url);
        if (!data || !data.novel_id) {
            console.log(data);
            throw new ReferenceError();
        }
        let ret = this.makeUrl(data, true, optionsRuntime);
        return ret;
    }
    _stripContent(text) {
        text = strip_1.stripContent(text);
        //process.exit();
        return text
            .replace(/^　　/gm, '')
            .replace(/^[ \uFEFF\xA0]+/gm, '');
    }
    _parseChapter(ret, optionsRuntime, cache) {
        if (!ret) {
            return '';
        }
        ret.dom.$('.ad_content').remove();
        let body_selector = '#contentbox';
        try {
            let html = util_1.minifyHTML(ret.dom.$(body_selector).html());
            //html = html.replace(/^(&nbsp;){4}/gm, '');
            html = html.replace(/^\s+|\s+$/g, '');
            ret.dom.$(body_selector).html(html);
        }
        catch (e) {
        }
        ret.dom.$(body_selector).html(function (i, old) {
            return old
                .replace(/(<br\/?>)/ig, '$1\n')
                .replace(/(<p>)/ig, '\n$1');
        });
        let text = ret.dom.$(body_selector).text();
        text = this._stripContent(text);
        return text;
    }
    async get_volume_list(inputUrl, optionsRuntime = {}) {
        const self = this;
        let url = await this.createMainUrl(inputUrl, optionsRuntime);
        return jsdom_extra_1.fromURL(url, optionsRuntime.optionsJSDOM)
            .then(async function (dom) {
            const $ = dom.$;
            $.fn.eachReverse = function (...argv) {
                return $($(this).get().reverse()).each(...argv);
            };
            let url_data = self.parseUrl(dom.url.href);
            let data_meta = await self._get_meta(url, optionsRuntime, {
                dom,
            });
            let _cache_dates = [];
            let volume_list = [];
            let currentVolume;
            let novel_vip = 0;
            let table = $('#chapterList li');
            table
                .eachReverse(function (index) {
                // @ts-ignore
                let tr = dom.$(this);
                if (tr.is('.volume')) {
                    currentVolume = volume_list[volume_list.length] = {
                        volume_index: volume_list.length,
                        volume_title: novel_text_1.default.trim(tr.text()),
                        chapter_list: [],
                    };
                }
                else if (tr.has('a').length) {
                    tr.find('a:eq(0)')
                        .each(function (index) {
                        // @ts-ignore
                        let a = dom.$(this);
                        let href = a.prop('href');
                        let data = self.parseUrl(href);
                        if (!data.chapter_id) {
                            //console.log(href, data);
                            throw new Error();
                        }
                        else {
                            href = self.makeUrl(data);
                            data.url = href;
                        }
                        let chapter_title = util_1.trim(a.text());
                        if (!chapter_title) {
                            console.log(href);
                            console.log(a);
                            throw new Error();
                        }
                        currentVolume
                            .chapter_list
                            .push({
                            chapter_index: currentVolume.chapter_list.length,
                            chapter_title,
                            chapter_id: data.chapter_id,
                            chapter_url: href,
                            chapter_url_data: data,
                        });
                    });
                }
            });
            let novel_date;
            if (_cache_dates.length) {
                _cache_dates.sort();
                novel_date = index_2.moment.unix(_cache_dates[_cache_dates.length - 1]).local();
            }
            return Object.assign(Object.assign({ url: dom.url, url_data }, data_meta), { volume_list, 
                //novel_date,
                checkdate: index_2.moment().local(), imgs: [] });
        })
            .tap(function (novel) {
            console.dir(novel, {
                colors: true,
            });
        });
    }
    async _get_meta(inputUrl, optionsRuntime, cache) {
        const self = this;
        let url = this.makeUrl(this.parseUrl(inputUrl), -1);
        //return fromURL(url, optionsRuntime.optionsJSDOM)
        return Promise.resolve(cache.dom)
            .then(function (dom) {
            const $ = dom.$;
            let data = {};
            data.novel = {};
            let novel_author = util_1.trim($('.jieshao_content h2 a').text());
            $('.jieshao_content h3:eq(0)').html(function (i, old) {
                return old.replace(/(<br\/?>)/ig, '$1\n');
            });
            let novel_desc = $('.jieshao_content h3:eq(0)')
                .text()
                .trim();
            novel_desc = self._stripContent(novel_desc);
            let novel_title = util_1.trim($('.jieshao-img .bookImg img').attr('alt')
                || $('.jieshao_content h1 a').text().replace(/最新章节/g, ''));
            let url_data = self.parseUrl(url);
            $(`.jieshao-img .bookImg img`)
                .each(function () {
                // @ts-ignore
                let src = $(this).prop('src');
                if (src) {
                    data.novel.cover = src;
                }
            });
            return Object.assign(Object.assign({ url,
                url_data }, data), { novel_title,
                novel_author,
                novel_desc });
        });
    }
};
NovelSiteUukanshu.IDKEY = path.basename(__dirname);
NovelSiteUukanshu = __decorate([
    index_1.staticImplements()
], NovelSiteUukanshu);
exports.NovelSiteUukanshu = NovelSiteUukanshu;
exports.default = NovelSiteUukanshu;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7O0dBRUc7Ozs7Ozs7O0FBRUgsdUNBQTJDO0FBQzNDLHFDQUFxRTtBQUNyRSxvQ0FBbUY7QUFJbkYsdUNBQXlDO0FBQ3pDLHlDQUFnQztBQUNoQyw2Q0FBK0Q7QUFFL0Qsb0NBQWtDO0FBQ2xDLDJDQUFtQztBQUNuQyw2QkFBNkI7QUFLN0IsSUFBYSxpQkFBaUIsR0FBOUIsTUFBYSxpQkFBa0IsU0FBUSxjQUFhO0lBSW5ELE9BQU8sQ0FBSSxNQUE0QixFQUFFLElBQXVCLEVBQUUsY0FBb0M7UUFFckcsSUFBSSxHQUFXLENBQUM7UUFFaEIsSUFBSSxHQUFHLEdBQUcsQ0FBQyxDQUFDLElBQUksSUFBSSxNQUFNLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsTUFBTSxDQUFDLFVBQVUsT0FBTyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7UUFFMUUsR0FBRyxHQUFHLDhCQUE4QixNQUFNLENBQUMsUUFBUSxJQUFJLEdBQUcsRUFBRSxDQUFDO1FBRTdELGFBQWE7UUFDYixPQUFPLElBQUksZUFBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQ3JCLENBQUM7SUFFRCxRQUFRLENBQUMsR0FBaUIsRUFBRSxPQUFRO1FBRW5DLElBQUksTUFBTSxHQUFHO1lBQ1osR0FBRyxFQUFFLEdBQVU7WUFFZixTQUFTLEVBQUUsSUFBSTtZQUNmLFFBQVEsRUFBRSxJQUFJO1lBQ2QsVUFBVSxFQUFFLElBQUk7WUFFaEIsV0FBVyxFQUFFLElBQUk7U0FDakIsQ0FBQztRQUVGLGFBQWE7UUFDYixNQUFNLENBQUMsR0FBRyxHQUFHLElBQUksZUFBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQzFCLEdBQUcsR0FBRyxNQUFNLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQztRQUV0QixJQUFJLENBQUMsR0FBRywyQ0FBMkMsQ0FBQztRQUVwRCxJ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R0FBRyxHQUFHLENBQUM7aUJBQ3ZCO1lBQ0YsQ0FBQyxDQUFDLENBQUM7WUFFSixxQ0FDQyxHQUFHO2dCQUNILFFBQVEsSUFFTCxJQUFJLEtBRVAsV0FBVztnQkFFWCxZQUFZO2dCQUNaLFVBQVUsSUFFVDtRQUNILENBQUMsQ0FBQyxDQUNEO0lBQ0gsQ0FBQztDQUNELENBQUE7QUExVHVCLHVCQUFLLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsQ0FBQztBQUY1QyxpQkFBaUI7SUFEN0Isd0JBQWdCLEVBQWtEO0dBQ3RELGlCQUFpQixDQTRUN0I7QUE1VFksOENBQWlCO0FBOFQ5QixrQkFBZSxpQkFBaUIsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ3JlYXRlZCBieSB1c2VyIG9uIDIwMTgvMy8yNS8wMjUuXG4gKi9cblxuaW1wb3J0IHsgc3RyaXBDb250ZW50IH0gZnJvbSAnLi4vLi4vc3RyaXAnO1xuaW1wb3J0IHsgYXJyYXlfdW5pcXVlLCBpc1VuZGVmLCBtaW5pZnlIVE1MLCB0cmltIH0gZnJvbSAnLi4vLi4vdXRpbCc7XG5pbXBvcnQgX05vdmVsU2l0ZSwgeyBzdGF0aWNJbXBsZW1lbnRzLCBTWU1CT0xfQ0FDSEUsIElNZGNvbmZNZXRhIH0gZnJvbSAnLi4vaW5kZXgnO1xuaW1wb3J0IHsgSURvd25sb2FkT3B0aW9ucywgSU5vdmVsIH0gZnJvbSAnLi4vZGVtby9iYXNlJztcbmltcG9ydCB7IElGZXRjaENoYXB0ZXIsIElPcHRpb25zUnVudGltZSB9IGZyb20gJy4uL2RlbW8vYmFzZSc7XG5pbXBvcnQgKiBhcyBOb3ZlbFNpdGVEZW1vIGZyb20gJy4uL2RlbW8vYmFzZSc7XG5pbXBvcnQgTm92ZWxTaXRlQmFzZSBmcm9tICcuLi9kZW1vL2Jhc2UnO1xuaW1wb3J0IHsgVVJMIH0gZnJvbSAnanNkb20tdXJsJztcbmltcG9ydCB7IGZyb21VUkwsIElGcm9tVXJsT3B0aW9ucywgSUpTRE9NIH0gZnJvbSAnanNkb20tZXh0cmEnO1xuaW1wb3J0IHsgUHJvbWlzZUJsdWViaXJkLCBibHVlYmlyZERlY29yYXRvciB9IGZyb20gJy4uL2luZGV4JztcbmltcG9ydCB7IG1vbWVudCB9IGZyb20gJy4uL2luZGV4JztcbmltcG9ydCBub3ZlbFRleHQgZnJvbSAnbm92ZWwtdGV4dCc7XG5pbXBvcnQgKiBhcyBwYXRoIGZyb20gXCJwYXRoXCI7XG5pbXBvcnQgKiBhcyBTdHJVdGlsIGZyb20gJ3N0ci11dGlsJztcbmltcG9ydCB7IHpoUmVnRXhwIH0gZnJvbSAncmVnZXhwLWNqayc7XG5cbkBzdGF0aWNJbXBsZW1lbnRzPF9Ob3ZlbFNpdGUuSU5vdmVsU2l0ZVN0YXRpYzxOb3ZlbFNpdGVVdWthbnNodT4+KClcbmV4cG9ydCBjbGFzcyBOb3ZlbFNpdGVVdWthbnNodSBleHRlbmRzIE5vdmVsU2l0ZUJhc2Vcbntcblx0cHVibGljIHN0YXRpYyByZWFkb25seSBJREtFWSA9IHBhdGguYmFzZW5hbWUoX19kaXJuYW1lKTtcblxuXHRtYWtlVXJsPFQ+KHVybG9iajogX05vdmVsU2l0ZS5JUGFyc2VVcmwsIGJvb2w/OiBib29sZWFuIHwgbnVtYmVyLCBvcHRpb25zUnVudGltZT86IFQgJiBJT3B0aW9uc1J1bnRpbWUpOiBVUkxcblx0e1xuXHRcdGxldCB1cmw6IHN0cmluZztcblxuXHRcdGxldCBjaWQgPSAoIWJvb2wgJiYgdXJsb2JqLmNoYXB0ZXJfaWQpID8gYCR7dXJsb2JqLmNoYXB0ZXJfaWR9Lmh0bWxgIDogJyc7XG5cblx0XHR1cmwgPSBgaHR0cHM6Ly93d3cudXVrYW5zaHUuY29tL2IvJHt1cmxvYmoubm92ZWxfaWR9LyR7Y2lkfWA7XG5cblx0XHQvLyBAdHMtaWdub3JlXG5cdFx0cmV0dXJuIG5ldyBVUkwodXJsKTtcblx0fVxuXG5cdHBhcnNlVXJsKHVybDogVVJMIHwgc3RyaW5nLCBvcHRpb25zPyk6IF9Ob3ZlbFNpdGUuSVBhcnNlVXJsXG5cdHtcblx0XHRsZXQgdXJsb2JqID0ge1xuXHRcdFx0dXJsOiB1cmwgYXMgVVJMLFxuXG5cdFx0XHRub3ZlbF9waWQ6IG51bGwsXG5cdFx0XHRub3ZlbF9pZDogbnVsbCxcblx0XHRcdGNoYXB0ZXJfaWQ6IG51bGwsXG5cblx0XHRcdGNoYXB0ZXJfdmlwOiBudWxsLFxuXHRcdH07XG5cblx0XHQvLyBAdHMtaWdub3JlXG5cdFx0dXJsb2JqLnVybCA9IG5ldyBVUkwodXJsKTtcblx0XHR1cmwgPSB1cmxvYmoudXJsLmhyZWY7XG5cblx0XHRsZXQgciA9IC93d3dcXC51dWthbnNodVxcLmNvbVxcL2JcXC8oXFxkKylcXC8oXFxkKylcXC5odG1sLztcblxuXHRcdGxldCBtID0gci5leGVjKHVybCk7XG5cdFx0aWYgKG0pXG5cdFx0e1xuXHRcdFx0dXJsb2JqLm5vdmVsX2lkID0gbVsxXTtcblx0XHRcdHVybG9iai5jaGFwdGVyX2lkID0gbVsyXTtcblxuXHRcdFx0cmV0dXJuIHVybG9iajtcblx0XHR9XG5cblx0XHRyID0gL3d3d1xcLnV1a2Fuc2h1XFwuY29tXFwvYlxcLyhcXGQrKS87XG5cblx0XHRpZiAobSA9IHIuZXhlYyh1cmwpKVxuXHRcdHtcblx0XHRcdHVybG9iai5ub3ZlbF9pZCA9IG1bMV07XG5cblx0XHRcdHJldHVybiB1cmxvYmo7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHVybG9iajtcblx0fVxuXG5cdGNyZWF0ZU1haW5Vcmw8VD4odXJsOiBzdHJpbmcgfCBVUkwsIG9wdGlvbnNSdW50aW1lOiBUICYgSU9wdGlvbnNSdW50aW1lKVxuXHR7XG5cdFx0bGV0IGRhdGEgPSB0aGlzLnBhcnNlVXJsKHVybCk7XG5cblx0XHRpZiAoIWRhdGEgfHwgIWRhdGEubm92ZWxfaWQpXG5cdFx0e1xuXHRcdFx0Y29uc29sZS5sb2coZGF0YSk7XG5cblx0XHRcdHRocm93IG5ldyBSZWZlcmVuY2VFcnJvcigpO1xuXHRcdH1cblxuXHRcdGxldCByZXQgPSB0aGlzLm1ha2VVcmwoZGF0YSwgdHJ1ZSwgb3B0aW9uc1J1bnRpbWUpO1xuXG5cdFx0cmV0dXJuIHJldDtcblx0fVxuXG5cdF9zdHJpcENvbnRlbnQodGV4dDogc3RyaW5nKVxuXHR7XG5cdFx0dGV4dCA9IHN0cmlwQ29udGVudCh0ZXh0KTtcblxuXHRcdC8vcHJvY2Vzcy5leGl0KCk7XG5cblx0XHRyZXR1cm4gdGV4dFxuXHRcdFx0LnJlcGxhY2UoL17jgIDjgIAvZ20sICcnKVxuXHRcdFx0LnJlcGxhY2UoL15bIFxcdUZFRkZcXHhBMF0rL2dtLCAnJylcblx0XHQ7XG5cdH1cblxuXHRwcm90ZWN0ZWQgX3BhcnNlQ2hhcHRlcjxUPihyZXQ6IElGZXRjaENoYXB0ZXIsIG9wdGlvbnNSdW50aW1lOiBUICYgSU9wdGlvbnNSdW50aW1lLCBjYWNoZSk6IHN0cmluZ1xuXHR7XG5cdFx0aWYgKCFyZXQpXG5cdFx0e1xuXHRcdFx0cmV0dXJuICcnO1xuXHRcdH1cblxuXHRcdHJldC5kb20uJCgnLmFkX2NvbnRlbnQnKS5yZW1vdmUoKTtcblxuXHRcdGxldCBib2R5X3NlbGVjdG9yID0gJyNjb250ZW50Ym94JztcblxuXHRcdHRyeVxuXHRcdHtcblx0XHRcdGxldCBodG1sID0gbWluaWZ5SFRNTChyZXQuZG9tLiQoYm9keV9zZWxlY3RvcikuaHRtbCgpKTtcblxuXHRcdFx0Ly9odG1sID0gaHRtbC5yZXBsYWNlKC9eKCZuYnNwOyl7NH0vZ20sICcnKTtcblx0XHRcdGh0bWwgPSBodG1sLnJlcGxhY2UoL15cXHMrfFxccyskL2csICcnKTtcblxuXHRcdFx0cmV0LmRvbS4kKGJvZHlfc2VsZWN0b3IpLmh0bWwoaHRtbCk7XG5cdFx0fVxuXHRcdGNhdGNoIChlKVxuXHRcdHtcblxuXHRcdH1cblxuXHRcdHJldC5kb20uJChib2R5X3NlbGVjdG9yKS5odG1sKGZ1bmN0aW9uIChpLCBvbGQpXG5cdFx0e1xuXHRcdFx0cmV0dXJuIG9sZFxuXHRcdFx0XHQucmVwbGFjZSgvKDxiclxcLz8+KS9pZywgJyQxXFxuJylcblx0XHRcdFx0LnJlcGxhY2UoLyg8cD4pL2lnLCAnXFxuJDEnKVxuXHRcdFx0XHQ7XG5cdFx0fSk7XG5cblx0XHRsZXQgdGV4dCA9IHJldC5kb20uJChib2R5X3NlbGVjdG9yKS50ZXh0KCk7XG5cblx0XHR0ZXh0ID0gdGhpcy5fc3RyaXBDb250ZW50KHRleHQpO1xuXG5cdFx0cmV0dXJuIHRleHQ7XG5cdH1cblxuXHRhc3luYyBnZXRfdm9sdW1lX2xpc3Q8VCA9IElPcHRpb25zUnVudGltZT4oaW5wdXRVcmw6IHN0cmluZyB8IFVSTCxcblx0XHRvcHRpb25zUnVudGltZTogUGFydGlhbDxUICYgSURvd25sb2FkT3B0aW9ucz4gPSB7fVxuXHQpOiBQcm9taXNlPElOb3ZlbD5cblx0e1xuXHRcdGNvbnN0IHNlbGYgPSB0aGlzO1xuXHRcdGxldCB1cmwgPSBhd2FpdCB0aGlzLmNyZWF0ZU1haW5VcmwoaW5wdXRVcmwsIG9wdGlvbnNSdW50aW1lKTtcblxuXHRcdHJldHVybiBmcm9tVVJMKHVybCwgb3B0aW9uc1J1bnRpbWUub3B0aW9uc0pTRE9NKVxuXHRcdFx0LnRoZW4oYXN5bmMgZnVuY3Rpb24gKGRvbTogSUpTRE9NKVxuXHRcdFx0e1xuXHRcdFx0XHRjb25zdCAkID0gZG9tLiQ7XG5cblx0XHRcdFx0JC5mbi5lYWNoUmV2ZXJzZSA9IGZ1bmN0aW9uICguLi5hcmd2KVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0cmV0dXJuICQoJCh0aGlzKS5nZXQoKS5yZXZlcnNlKCkpLmVhY2goLi4uYXJndik7XG5cdFx0XHRcdH07XG5cblx0XHRcdFx0bGV0IHVybF9kYXRhID0gc2VsZi5wYXJzZVVybChkb20udXJsLmhyZWYpO1xuXG5cdFx0XHRcdGxldCBkYXRhX21ldGEgPSBhd2FpdCBzZWxmLl9nZXRfbWV0YSh1cmwsIG9wdGlvbnNSdW50aW1lLCB7XG5cdFx0XHRcdFx0ZG9tLFxuXHRcdFx0XHR9KTtcblxuXHRcdFx0XHRsZXQgX2NhY2hlX2RhdGVzID0gW107XG5cdFx0XHRcdGxldCB2b2x1bWVfbGlzdCA9IFtdIGFzIF9Ob3ZlbFNpdGUuSVZvbHVtZVtdO1xuXG5cdFx0XHRcdGxldCBjdXJyZW50Vm9sdW1lOiBfTm92ZWxTaXRlLklWb2x1bWU7XG5cblx0XHRcdFx0bGV0IG5vdmVsX3ZpcCA9IDA7XG5cblx0XHRcdFx0bGV0IHRhYmxlID0gJCgnI2NoYXB0ZXJMaXN0IGxpJyk7XG5cdFx0XHRcdHRhYmxlXG5cdFx0XHRcdFx0LmVhY2hSZXZlcnNlKGZ1bmN0aW9uIChpbmRleClcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHQvLyBAdHMtaWdub3JlXG5cdFx0XHRcdFx0XHRsZXQgdHIgPSBkb20uJCh0aGlzKTtcblxuXHRcdFx0XHRcdFx0aWYgKHRyLmlzKCcudm9sdW1lJykpXG5cdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdGN1cnJlbnRWb2x1bWUgPSB2b2x1bWVfbGlzdFt2b2x1bWVfbGlzdC5sZW5ndGhdID0ge1xuXHRcdFx0XHRcdFx0XHRcdHZvbHVtZV9pbmRleDogdm9sdW1lX2xpc3QubGVuZ3RoLFxuXHRcdFx0XHRcdFx0XHRcdHZvbHVtZV90aXRsZTogbm92ZWxUZXh0LnRyaW0odHIudGV4dCgpKSxcblx0XHRcdFx0XHRcdFx0XHRjaGFwdGVyX2xpc3Q6IFtdLFxuXHRcdFx0XHRcdFx0XHR9O1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0ZWxzZSBpZiAodHIuaGFzKCdhJykubGVuZ3RoKVxuXHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHR0ci5maW5kKCdhOmVxKDApJylcblx0XHRcdFx0XHRcdFx0XHQuZWFjaChmdW5jdGlvbiAoaW5kZXgpXG5cdFx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdFx0XHRcdFx0XHRcdFx0bGV0IGEgPSBkb20uJCh0aGlzKTtcblxuXHRcdFx0XHRcdFx0XHRcdFx0bGV0IGhyZWYgPSBhLnByb3AoJ2hyZWYnKTtcblxuXHRcdFx0XHRcdFx0XHRcdFx0bGV0IGRhdGEgPSBzZWxmLnBhcnNlVXJsKGhyZWYpO1xuXG5cdFx0XHRcdFx0XHRcdFx0XHRpZiAoIWRhdGEuY2hhcHRlcl9pZClcblx0XHRcdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0Ly9jb25zb2xlLmxvZyhocmVmLCBkYXRhKTtcblxuXHRcdFx0XHRcdFx0XHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoKVxuXHRcdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRcdFx0ZWxzZVxuXHRcdFx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRocmVmID0gc2VsZi5tYWtlVXJsKGRhdGEpO1xuXG5cdFx0XHRcdFx0XHRcdFx0XHRcdGRhdGEudXJsID0gaHJlZjtcblx0XHRcdFx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0XHRcdFx0bGV0IGNoYXB0ZXJfdGl0bGUgPSB0cmltKGEudGV4dCgpKTtcblxuXHRcdFx0XHRcdFx0XHRcdFx0aWYgKCFjaGFwdGVyX3RpdGxlKVxuXHRcdFx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRjb25zb2xlLmxvZyhocmVmKTtcblx0XHRcdFx0XHRcdFx0XHRcdFx0Y29uc29sZS5sb2coYSk7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdHRocm93IG5ldyBFcnJvcigpXG5cdFx0XHRcdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdFx0XHRcdGN1cnJlbnRWb2x1bWVcblx0XHRcdFx0XHRcdFx0XHRcdFx0LmNoYXB0ZXJfbGlzdFxuXHRcdFx0XHRcdFx0XHRcdFx0XHQucHVzaCh7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0Y2hhcHRlcl9pbmRleDogY3VycmVudFZvbHVtZS5jaGFwdGVyX2xpc3QubGVuZ3RoLFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdGNoYXB0ZXJfdGl0bGUsXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0Y2hhcHRlcl9pZDogZGF0YS5jaGFwdGVyX2lkLFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdGNoYXB0ZXJfdXJsOiBocmVmLFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdGNoYXB0ZXJfdXJsX2RhdGE6IGRhdGEsXG5cdFx0XHRcdFx0XHRcdFx0XHRcdH0pXG5cdFx0XHRcdFx0XHRcdFx0XHQ7XG5cdFx0XHRcdFx0XHRcdFx0fSlcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9KVxuXHRcdFx0XHQ7XG5cblx0XHRcdFx0bGV0IG5vdmVsX2RhdGU7XG5cblx0XHRcdFx0aWYgKF9jYWNoZV9kYXRlcy5sZW5ndGgpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRfY2FjaGVfZGF0ZXMuc29ydCgpO1xuXG5cdFx0XHRcdFx0bm92ZWxfZGF0ZSA9IG1vbWVudC51bml4KF9jYWNoZV9kYXRlc1tfY2FjaGVfZGF0ZXMubGVuZ3RoIC0gMV0pLmxvY2FsKCk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRyZXR1cm4ge1xuXG5cdFx0XHRcdFx0dXJsOiBkb20udXJsLFxuXHRcdFx0XHRcdHVybF9kYXRhLFxuXG5cdFx0XHRcdFx0Li4uZGF0YV9tZXRhLFxuXG5cdFx0XHRcdFx0dm9sdW1lX2xpc3QsXG5cblx0XHRcdFx0XHQvL25vdmVsX2RhdGUsXG5cblx0XHRcdFx0XHRjaGVja2RhdGU6IG1vbWVudCgpLmxvY2FsKCksXG5cblx0XHRcdFx0XHRpbWdzOiBbXSBhcyBzdHJpbmdbXSxcblx0XHRcdFx0fSBhcyBJTm92ZWw7XG5cdFx0XHR9KVxuXHRcdFx0LnRhcChmdW5jdGlvbiAobm92ZWwpXG5cdFx0XHR7XG5cdFx0XHRcdGNvbnNvbGUuZGlyKG5vdmVsLCB7XG5cdFx0XHRcdFx0Y29sb3JzOiB0cnVlLFxuXHRcdFx0XHRcdC8vZGVwdGg6IDMsXG5cdFx0XHRcdH0pO1xuXHRcdFx0fSlcblx0XHRcdDtcblx0fVxuXG5cdHByb3RlY3RlZCBhc3luYyBfZ2V0X21ldGEoaW5wdXRVcmwsIG9wdGlvbnNSdW50aW1lLCBjYWNoZToge1xuXHRcdGRvbTogSUpTRE9NLFxuXHR9KVxuXHR7XG5cdFx0Y29uc3Qgc2VsZiA9IHRoaXM7XG5cblx0XHRsZXQgdXJsID0gdGhpcy5tYWtlVXJsKHRoaXMucGFyc2VVcmwoaW5wdXRVcmwpLCAtMSk7XG5cblx0XHQvL3JldHVybiBmcm9tVVJMKHVybCwgb3B0aW9uc1J1bnRpbWUub3B0aW9uc0pTRE9NKVxuXHRcdHJldHVybiBQcm9taXNlLnJlc29sdmUoY2FjaGUuZG9tKVxuXHRcdFx0LnRoZW4oZnVuY3Rpb24gKGRvbSlcblx0XHRcdHtcblx0XHRcdFx0Y29uc3QgJCA9IGRvbS4kO1xuXHRcdFx0XHRsZXQgZGF0YTogSU1kY29uZk1ldGEgPSB7fTtcblx0XHRcdFx0ZGF0YS5ub3ZlbCA9IHt9O1xuXG5cdFx0XHRcdGxldCBub3ZlbF9hdXRob3IgPSB0cmltKCQoJy5qaWVzaGFvX2NvbnRlbnQgaDIgYScpLnRleHQoKSk7XG5cblx0XHRcdFx0JCgnLmppZXNoYW9fY29udGVudCBoMzplcSgwKScpLmh0bWwoZnVuY3Rpb24gKGksIG9sZClcblx0XHRcdFx0e1xuXHRcdFx0XHRcdHJldHVybiBvbGQucmVwbGFjZSgvKDxiclxcLz8+KS9pZywgJyQxXFxuJyk7XG5cdFx0XHRcdH0pO1xuXG5cdFx0XHRcdGxldCBub3ZlbF9kZXNjID0gJCgnLmppZXNoYW9fY29udGVudCBoMzplcSgwKScpXG5cdFx0XHRcdFx0LnRleHQoKVxuXHRcdFx0XHRcdC50cmltKClcblx0XHRcdFx0O1xuXG5cdFx0XHRcdG5vdmVsX2Rlc2MgPSBzZWxmLl9zdHJpcENvbnRlbnQobm92ZWxfZGVzYyk7XG5cblx0XHRcdFx0bGV0IG5vdmVsX3RpdGxlID0gdHJpbShcblx0XHRcdFx0XHQkKCcuamllc2hhby1pbWcgLmJvb2tJbWcgaW1nJykuYXR0cignYWx0Jylcblx0XHRcdFx0XHR8fCAkKCcuamllc2hhb19jb250ZW50IGgxIGEnKS50ZXh0KCkucmVwbGFjZSgv5pyA5paw56ug6IqCL2csICcnKVxuXHRcdFx0XHQpO1xuXG5cdFx0XHRcdGxldCB1cmxfZGF0YSA9IHNlbGYucGFyc2VVcmwodXJsKTtcblxuXHRcdFx0XHQkKGAuamllc2hhby1pbWcgLmJvb2tJbWcgaW1nYClcblx0XHRcdFx0XHQuZWFjaChmdW5jdGlvbiAoKVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdC8vIEB0cy1pZ25vcmVcblx0XHRcdFx0XHRcdGxldCBzcmMgPSAkKHRoaXMpLnByb3AoJ3NyYycpO1xuXG5cdFx0XHRcdFx0XHRpZiAoc3JjKVxuXHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRkYXRhLm5vdmVsLmNvdmVyID0gc3JjO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH0pO1xuXG5cdFx0XHRcdHJldHVybiB7XG5cdFx0XHRcdFx0dXJsLFxuXHRcdFx0XHRcdHVybF9kYXRhLFxuXG5cdFx0XHRcdFx0Li4uZGF0YSxcblxuXHRcdFx0XHRcdG5vdmVsX3RpdGxlLFxuXG5cdFx0XHRcdFx0bm92ZWxfYXV0aG9yLFxuXHRcdFx0XHRcdG5vdmVsX2Rlc2MsXG5cblx0XHRcdFx0fTtcblx0XHRcdH0pXG5cdFx0XHQ7XG5cdH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgTm92ZWxTaXRlVXVrYW5zaHU7XG4iXX0=