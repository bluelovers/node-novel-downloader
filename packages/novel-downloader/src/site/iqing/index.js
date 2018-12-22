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
const util_1 = require("../../util");
const index_1 = require("../index");
const base_1 = require("../demo/base");
const jsdom_url_1 = require("jsdom-url");
const jsdom_extra_1 = require("jsdom-extra");
const index_2 = require("../index");
let NovelSiteIqing = class NovelSiteIqing extends base_1.default {
    checkSessionData(data, optionsRuntime = {}) {
        if (data) {
            if (data.sessionid && data.steins_csrf_token) {
                data.online = 1;
                return data;
            }
        }
        return data;
    }
    makeUrl(urlobj, bool) {
        let url;
        if (bool || !urlobj.chapter_id) {
            url = `https://www.iqing.com/book/${urlobj.novel_id}/`;
        }
        else {
            url = `https://poi.iqing.com/content/${urlobj.chapter_id}/chapter/`;
        }
        return new jsdom_url_1.URL(url);
    }
    parseUrl(url, options) {
        let urlobj = {
            url: url,
            novel_pid: null,
            novel_id: null,
            chapter_id: null,
        };
        urlobj.url = new jsdom_url_1.URL(url);
        url = urlobj.url.href;
        let r = /www\.iqing\.com\/read\/(\d+)/;
        let m = r.exec(url);
        if (m) {
            urlobj.chapter_id = m[1];
            return urlobj;
        }
        r = /poi\.iqing\.com\/content\/(\d+)\/chapter/;
        if (m = r.exec(url)) {
            urlobj.chapter_id = m[1];
            return urlobj;
        }
        r = /www\.iqing\.com\/book\/(\d+)/;
        if (m = r.exec(url)) {
            urlobj.novel_id = m[1];
            return urlobj;
        }
        return urlobj;
    }
    createMainUrl(url) {
        let data = this.parseUrl(url);
        if (!data || !data.novel_id) {
            console.log(data);
            throw new ReferenceError();
        }
        let ret = this.makeUrl(data, true);
        return ret;
    }
    _parseChapter(ret, optionsRuntime, cache) {
        if (!ret) {
            return '';
        }
        let text;
        if (ret.json && ret.json.results && ret.json.results.length) {
            text = ret.json.results
                .reduce(function (a, b) {
                if (b && b.value) {
                    a.push(b.value);
                }
                else {
                    console.log(777, b);
                    throw new Error();
                }
                return a;
            }, [])
                .join("\n");
            if (!text) {
                console.log(666, ret.json.results);
                throw new Error();
            }
            cache.chapter.chapter_date = index_2.moment(ret.json.updated_time).local();
            if (cache.chapter.chapter_vip) {
                text = `付費章节\n\n==========================\n\n${text}`;
            }
            return text;
        }
        console.log(ret);
        throw new Error;
        // @ts-ignore
        return text;
    }
    async get_volume_list(inputUrl, optionsRuntime = {}) {
        const self = this;
        let url = await this.createMainUrl(inputUrl);
        return await jsdom_extra_1.fromURL(url, optionsRuntime.optionsJSDOM)
            .then(async function (dom) {
            const $ = dom.$;
            let url_data = self.parseUrl(dom.url.href);
            let data_meta = await self._get_meta(url, optionsRuntime, {
                dom,
            });
            let _cache_dates = [];
            let volume_list = [];
            let currentVolume;
            let novel_vip = 0;
            let table = $('#book-menu .list-volume li');
            table
                .each(function (index) {
                let tr = dom.$(this);
                if (tr.is('.volume')) {
                    currentVolume = volume_list[volume_list.length] = {
                        volume_index: volume_list.length,
                        volume_title: util_1.trim(tr.find('h3').text()),
                        chapter_list: [],
                    };
                }
                else if (tr.is('.chapter')) {
                    let a = tr.find('a');
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
                    let chapter_vip;
                    chapter_vip = tr.find('.lock').length;
                    if (chapter_vip) {
                        novel_vip++;
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
                        chapter_vip,
                    });
                }
            });
            let novel_date;
            if (_cache_dates.length) {
                _cache_dates.sort();
                novel_date = index_2.moment.unix(_cache_dates[_cache_dates.length - 1]).local();
            }
            if (novel_vip) {
                data_meta.novel = data_meta.novel || {};
                data_meta.novel.tags = data_meta.novel.tags || [];
                data_meta.novel.tags.push('VIP');
            }
            return Object.assign({ url: dom.url, url_data }, data_meta, { novel_vip,
                volume_list, 
                //novel_date,
                checkdate: index_2.moment().local(), imgs: [] });
        })
            .tap(function (novel) {
            console.log(novel);
        });
    }
    async _get_meta(inputUrl, optionsRuntime, cache) {
        const self = this;
        let url = inputUrl;
        return Promise.resolve(cache.dom)
            .then(function (dom) {
            const $ = dom.$;
            let data = {};
            data.novel = {};
            let novel_author = $('#author-info .name[itemprop="author"] [itemprop="name"]')
                .text()
                .trim();
            $('#book-top .intro').find('.t').remove();
            let novel_desc = $('#book-top .intro')
                .text()
                .trim();
            data.novel.tags = [];
            $('#cat-list .cat, .book-title .book-tag')
                .each(function () {
                let t = util_1.trim($(this)
                    .text()
                    .replace(/\(\d+\)/g, ''));
                if (t) {
                    data.novel.tags.push(t);
                    if (t == '连载' && $(this).is('.book-tag')) {
                        data.novel.status = t;
                    }
                }
            });
            let novel_date;
            {
                let d = $('.update-time [itemprop="datePublished"]')
                    .attr('content')
                    //.replace(/更新：/, '')
                    .trim();
                //console.log(d);
                novel_date = index_2.moment(d).local();
            }
            let novel_title = util_1.trim($('.book-title .title').text());
            $('#book-top img.cover[src]').each(function () {
                data.novel.cover = $(this)
                    .prop('src')
                    .replace(/\?imageMogr2.+$/, '');
            });
            let url_data = self.parseUrl(url);
            return Object.assign({ url,
                url_data }, data, { novel_title,
                novel_author,
                novel_desc,
                novel_date });
        });
    }
};
NovelSiteIqing.IDKEY = 'iqing';
NovelSiteIqing = __decorate([
    index_1.staticImplements()
], NovelSiteIqing);
exports.NovelSiteIqing = NovelSiteIqing;
exports.default = NovelSiteIqing;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7O0dBRUc7Ozs7Ozs7O0FBRUgscUNBQXVEO0FBQ3ZELG9DQUFtRjtBQUluRix1Q0FBeUM7QUFDekMseUNBQWdDO0FBQ2hDLDZDQUErRDtBQUUvRCxvQ0FBa0M7QUFrQmxDLElBQWEsY0FBYyxHQUEzQixNQUFhLGNBQWUsU0FBUSxjQUFhO0lBSWhELGdCQUFnQixDQUFtQixJQUFzQixFQUFFLGlCQUFrQyxFQUFFO1FBRTlGLElBQUksSUFBSSxFQUNSO1lBQ0MsSUFBSSxJQUFJLENBQUMsU0FBUyxJQUFJLElBQUksQ0FBQyxpQkFBaUIsRUFDNUM7Z0JBQ0MsSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUM7Z0JBRWhCLE9BQU8sSUFBSSxDQUFDO2FBQ1o7U0FDRDtRQUVELE9BQU8sSUFBSSxDQUFDO0lBQ2IsQ0FBQztJQUVELE9BQU8sQ0FBQyxNQUE0QixFQUFFLElBQXVCO1FBRTVELElBQUksR0FBVyxDQUFDO1FBRWhCLElBQUksSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLFVBQVUsRUFDOUI7WUFDQyxHQUFHLEdBQUcsOEJBQThCLE1BQU0sQ0FBQyxRQUFRLEdBQUcsQ0FBQztTQUN2RDthQUVEO1lBQ0MsR0FBRyxHQUFHLGlDQUFpQyxNQUFNLENBQUMsVUFBVSxXQUFXLENBQUM7U0FDcEU7UUFFRCxPQUFPLElBQUksZUFBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQ3JCLENBQUM7SUFFRCxRQUFRLENBQUMsR0FBaUIsRUFBRSxPQUFRO1FBRW5DLElBQUksTUFBTSxHQUFHO1lBQ1osR0FBRyxFQUFFLEdBQUc7WUFFUixTQUFTLEVBQUUsSUFBSTtZQUNmLFFBQVEsRUFBRSxJQUFJO1lBQ2QsVUFBVSxFQUFFLElBQUk7U0FDaEIsQ0FBQztRQUVGLE1BQU0sQ0FBQyxHQUFHLEdBQUcsSUFBSSxlQUFHLENBQUMsR0FBRyxDQUFD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biAyMDE4LzMvMjUvMDI1LlxuICovXG5cbmltcG9ydCB7IGlzVW5kZWYsIG1pbmlmeUhUTUwsIHRyaW0gfSBmcm9tICcuLi8uLi91dGlsJztcbmltcG9ydCBfTm92ZWxTaXRlLCB7IHN0YXRpY0ltcGxlbWVudHMsIFNZTUJPTF9DQUNIRSwgSU1kY29uZk1ldGEgfSBmcm9tICcuLi9pbmRleCc7XG5pbXBvcnQgeyBJRG93bmxvYWRPcHRpb25zLCBJTm92ZWwgfSBmcm9tICcuLi9kZW1vL2Jhc2UnO1xuaW1wb3J0IHsgSUZldGNoQ2hhcHRlciwgSU9wdGlvbnNSdW50aW1lIH0gZnJvbSAnLi4vZGVtby9iYXNlJztcbmltcG9ydCAqIGFzIE5vdmVsU2l0ZURlbW8gZnJvbSAnLi4vZGVtby9iYXNlJztcbmltcG9ydCBOb3ZlbFNpdGVCYXNlIGZyb20gJy4uL2RlbW8vYmFzZSc7XG5pbXBvcnQgeyBVUkwgfSBmcm9tICdqc2RvbS11cmwnO1xuaW1wb3J0IHsgZnJvbVVSTCwgSUZyb21VcmxPcHRpb25zLCBJSlNET00gfSBmcm9tICdqc2RvbS1leHRyYSc7XG5pbXBvcnQgeyBQcm9taXNlQmx1ZWJpcmQsIGJsdWViaXJkRGVjb3JhdG9yIH0gZnJvbSAnLi4vaW5kZXgnO1xuaW1wb3J0IHsgbW9tZW50IH0gZnJvbSAnLi4vaW5kZXgnO1xuaW1wb3J0IG5vdmVsVGV4dCBmcm9tICdub3ZlbC10ZXh0JztcblxuZXhwb3J0IHR5cGUgSVNlc3Npb25EYXRhID0ge1xuXG5cdC8vIHJlcXVpcmVcblx0c2Vzc2lvbmlkOiBzdHJpbmcsXG5cdHN0ZWluc19jc3JmX3Rva2VuOiBzdHJpbmcsXG5cdG9ubGluZT86IDEgfCAnMScsXG5cblx0Ly8gbm8gbmVlZFxuXHRpZD86IG51bWJlciB8IHN0cmluZyxcblx0YXZhdGFyPzogc3RyaW5nLFxuXHR1c2VybmFtZT86IHN0cmluZyxcblxufVxuXG5Ac3RhdGljSW1wbGVtZW50czxfTm92ZWxTaXRlLklOb3ZlbFNpdGVTdGF0aWM8Tm92ZWxTaXRlSXFpbmc+PigpXG5leHBvcnQgY2xhc3MgTm92ZWxTaXRlSXFpbmcgZXh0ZW5kcyBOb3ZlbFNpdGVCYXNlXG57XG5cdHB1YmxpYyBzdGF0aWMgcmVhZG9ubHkgSURLRVkgPSAnaXFpbmcnO1xuXG5cdGNoZWNrU2Vzc2lvbkRhdGE8VCA9IElTZXNzaW9uRGF0YT4oZGF0YTogVCAmIElTZXNzaW9uRGF0YSwgb3B0aW9uc1J1bnRpbWU6IElPcHRpb25zUnVudGltZSA9IHt9KTogVFxuXHR7XG5cdFx0aWYgKGRhdGEpXG5cdFx0e1xuXHRcdFx0aWYgKGRhdGEuc2Vzc2lvbmlkICYmIGRhdGEuc3RlaW5zX2NzcmZfdG9rZW4pXG5cdFx0XHR7XG5cdFx0XHRcdGRhdGEub25saW5lID0gMTtcblxuXHRcdFx0XHRyZXR1cm4gZGF0YTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHRyZXR1cm4gZGF0YTtcblx0fVxuXG5cdG1ha2VVcmwodXJsb2JqOiBfTm92ZWxTaXRlLklQYXJzZVVybCwgYm9vbD86IGJvb2xlYW4gfCBudW1iZXIpOiBVUkxcblx0e1xuXHRcdGxldCB1cmw6IHN0cmluZztcblxuXHRcdGlmIChib29sIHx8ICF1cmxvYmouY2hhcHRlcl9pZClcblx0XHR7XG5cdFx0XHR1cmwgPSBgaHR0cHM6Ly93d3cuaXFpbmcuY29tL2Jvb2svJHt1cmxvYmoubm92ZWxfaWR9L2A7XG5cdFx0fVxuXHRcdGVsc2Vcblx0XHR7XG5cdFx0XHR1cmwgPSBgaHR0cHM6Ly9wb2kuaXFpbmcuY29tL2NvbnRlbnQvJHt1cmxvYmouY2hhcHRlcl9pZH0vY2hhcHRlci9gO1xuXHRcdH1cblxuXHRcdHJldHVybiBuZXcgVVJMKHVybCk7XG5cdH1cblxuXHRwYXJzZVVybCh1cmw6IFVSTCB8IHN0cmluZywgb3B0aW9ucz8pOiBfTm92ZWxTaXRlLklQYXJzZVVybFxuXHR7XG5cdFx0bGV0IHVybG9iaiA9IHtcblx0XHRcdHVybDogdXJsLFxuXG5cdFx0XHRub3ZlbF9waWQ6IG51bGwsXG5cdFx0XHRub3ZlbF9pZDogbnVsbCxcblx0XHRcdGNoYXB0ZXJfaWQ6IG51bGwsXG5cdFx0fTtcblxuXHRcdHVybG9iai51cmwgPSBuZXcgVVJMKHVybCk7XG5cdFx0dXJsID0gdXJsb2JqLnVybC5ocmVmO1xuXG5cdFx0bGV0IHIgPSAvd3d3XFwuaXFpbmdcXC5jb21cXC9yZWFkXFwvKFxcZCspLztcblxuXHRcdGxldCBtID0gci5leGVjKHVybCk7XG5cdFx0aWYgKG0pXG5cdFx0e1xuXHRcdFx0dXJsb2JqLmNoYXB0ZXJfaWQgPSBtWzFdO1xuXG5cdFx0XHRyZXR1cm4gdXJsb2JqO1xuXHRcdH1cblxuXHRcdHIgPSAvcG9pXFwuaXFpbmdcXC5jb21cXC9jb250ZW50XFwvKFxcZCspXFwvY2hhcHRlci87XG5cdFx0aWYgKG0gPSByLmV4ZWModXJsKSlcblx0XHR7XG5cdFx0XHR1cmxvYmouY2hhcHRlcl9pZCA9IG1bMV07XG5cblx0XHRcdHJldHVybiB1cmxvYmo7XG5cdFx0fVxuXG5cdFx0ciA9IC93d3dcXC5pcWluZ1xcLmNvbVxcL2Jvb2tcXC8oXFxkKykvO1xuXHRcdGlmIChtID0gci5leGVjKHVybCkpXG5cdFx0e1xuXHRcdFx0dXJsb2JqLm5vdmVsX2lkID0gbVsxXTtcblxuXHRcdFx0cmV0dXJuIHVybG9iajtcblx0XHR9XG5cblx0XHRyZXR1cm4gdXJsb2JqO1xuXHR9XG5cblx0Y3JlYXRlTWFpblVybCh1cmwpXG5cdHtcblx0XHRsZXQgZGF0YSA9IHRoaXMucGFyc2VVcmwodXJsKTtcblxuXHRcdGlmICghZGF0YSB8fCAhZGF0YS5ub3ZlbF9pZClcblx0XHR7XG5cdFx0XHRjb25zb2xlLmxvZyhkYXRhKTtcblxuXHRcdFx0dGhyb3cgbmV3IFJlZmVyZW5jZUVycm9yKCk7XG5cdFx0fVxuXG5cdFx0bGV0IHJldCA9IHRoaXMubWFrZVVybChkYXRhLCB0cnVlKTtcblxuXHRcdHJldHVybiByZXQ7XG5cdH1cblxuXHRwcm90ZWN0ZWQgX3BhcnNlQ2hhcHRlcjxUPihyZXQ6IElGZXRjaENoYXB0ZXIsIG9wdGlvbnNSdW50aW1lOiBUICYgSU9wdGlvbnNSdW50aW1lLCBjYWNoZSk6IHN0cmluZ1xuXHR7XG5cdFx0aWYgKCFyZXQpXG5cdFx0e1xuXHRcdFx0cmV0dXJuICcnO1xuXHRcdH1cblxuXHRcdGxldCB0ZXh0OiBzdHJpbmc7XG5cblx0XHRpZiAocmV0Lmpzb24gJiYgcmV0Lmpzb24ucmVzdWx0cyAmJiByZXQuanNvbi5yZXN1bHRzLmxlbmd0aClcblx0XHR7XG5cdFx0XHR0ZXh0ID0gcmV0Lmpzb24ucmVzdWx0c1xuXHRcdFx0XHQucmVkdWNlKGZ1bmN0aW9uIChhLCBiKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0aWYgKGIgJiYgYi52YWx1ZSlcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRhLnB1c2goYi52YWx1ZSk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGVsc2Vcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRjb25zb2xlLmxvZyg3NzcsIGIpO1xuXG5cdFx0XHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoKTtcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRyZXR1cm4gYTtcblx0XHRcdFx0fSwgW10pXG5cdFx0XHRcdC5qb2luKFwiXFxuXCIpXG5cdFx0XHQ7XG5cblx0XHRcdGlmICghdGV4dClcblx0XHRcdHtcblx0XHRcdFx0Y29uc29sZS5sb2coNjY2LCByZXQuanNvbi5yZXN1bHRzKTtcblxuXHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoKTtcblx0XHRcdH1cblxuXHRcdFx0Y2FjaGUuY2hhcHRlci5jaGFwdGVyX2RhdGUgPSBtb21lbnQocmV0Lmpzb24udXBkYXRlZF90aW1lKS5sb2NhbCgpO1xuXG5cdFx0XHRpZiAoY2FjaGUuY2hhcHRlci5jaGFwdGVyX3ZpcClcblx0XHRcdHtcblx0XHRcdFx0dGV4dCA9IGDku5josrvnq6DoioJcXG5cXG49PT09PT09PT09PT09PT09PT09PT09PT09PVxcblxcbiR7dGV4dH1gO1xuXHRcdFx0fVxuXG5cdFx0XHRyZXR1cm4gdGV4dDtcblx0XHR9XG5cblx0XHRjb25zb2xlLmxvZyhyZXQpO1xuXG5cdFx0dGhyb3cgbmV3IEVycm9yO1xuXG5cdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdHJldHVybiB0ZXh0O1xuXHR9XG5cblx0YXN5bmMgZ2V0X3ZvbHVtZV9saXN0PFQgPSBJT3B0aW9uc1J1bnRpbWU+KGlucHV0VXJsOiBzdHJpbmcgfCBVUkwsXG5cdFx0b3B0aW9uc1J1bnRpbWU6IFBhcnRpYWw8VCAmIElEb3dubG9hZE9wdGlvbnM+ID0ge31cblx0KTogUHJvbWlzZTxJTm92ZWw+XG5cdHtcblx0XHRjb25zdCBzZWxmID0gdGhpcztcblx0XHRsZXQgdXJsID0gYXdhaXQgdGhpcy5jcmVhdGVNYWluVXJsKGlucHV0VXJsKTtcblxuXHRcdHJldHVybiBhd2FpdCBmcm9tVVJMKHVybCwgb3B0aW9uc1J1bnRpbWUub3B0aW9uc0pTRE9NKVxuXHRcdFx0LnRoZW4oYXN5bmMgZnVuY3Rpb24gKGRvbTogSUpTRE9NKVxuXHRcdFx0e1xuXHRcdFx0XHRjb25zdCAkID0gZG9tLiQ7XG5cblx0XHRcdFx0bGV0IHVybF9kYXRhID0gc2VsZi5wYXJzZVVybChkb20udXJsLmhyZWYpO1xuXG5cdFx0XHRcdGxldCBkYXRhX21ldGEgPSBhd2FpdCBzZWxmLl9nZXRfbWV0YSh1cmwsIG9wdGlvbnNSdW50aW1lLCB7XG5cdFx0XHRcdFx0ZG9tLFxuXHRcdFx0XHR9KTtcblxuXHRcdFx0XHRsZXQgX2NhY2hlX2RhdGVzID0gW107XG5cdFx0XHRcdGxldCB2b2x1bWVfbGlzdCA9IFtdIGFzIF9Ob3ZlbFNpdGUuSVZvbHVtZVtdO1xuXG5cdFx0XHRcdGxldCBjdXJyZW50Vm9sdW1lOiBfTm92ZWxTaXRlLklWb2x1bWU7XG5cblx0XHRcdFx0bGV0IG5vdmVsX3ZpcCA9IDA7XG5cblx0XHRcdFx0bGV0IHRhYmxlID0gJCgnI2Jvb2stbWVudSAubGlzdC12b2x1bWUgbGknKTtcblx0XHRcdFx0dGFibGVcblx0XHRcdFx0XHQuZWFjaChmdW5jdGlvbiAoaW5kZXgpXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0bGV0IHRyID0gZG9tLiQodGhpcyk7XG5cblx0XHRcdFx0XHRcdGlmICh0ci5pcygnLnZvbHVtZScpKVxuXHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRjdXJyZW50Vm9sdW1lID0gdm9sdW1lX2xpc3Rbdm9sdW1lX2xpc3QubGVuZ3RoXSA9IHtcblx0XHRcdFx0XHRcdFx0XHR2b2x1bWVfaW5kZXg6IHZvbHVtZV9saXN0Lmxlbmd0aCxcblx0XHRcdFx0XHRcdFx0XHR2b2x1bWVfdGl0bGU6IHRyaW0odHIuZmluZCgnaDMnKS50ZXh0KCkpLFxuXHRcdFx0XHRcdFx0XHRcdGNoYXB0ZXJfbGlzdDogW10sXG5cdFx0XHRcdFx0XHRcdH07XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRlbHNlIGlmICh0ci5pcygnLmNoYXB0ZXInKSlcblx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0bGV0IGEgPSB0ci5maW5kKCdhJyk7XG5cblx0XHRcdFx0XHRcdFx0bGV0IGhyZWYgPSBhLnByb3AoJ2hyZWYnKTtcblxuXHRcdFx0XHRcdFx0XHRsZXQgZGF0YSA9IHNlbGYucGFyc2VVcmwoaHJlZik7XG5cblx0XHRcdFx0XHRcdFx0aWYgKCFkYXRhLmNoYXB0ZXJfaWQpXG5cdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHQvL2NvbnNvbGUubG9nKGhyZWYsIGRhdGEpO1xuXG5cdFx0XHRcdFx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKClcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRlbHNlXG5cdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHRocmVmID0gc2VsZi5tYWtlVXJsKGRhdGEpO1xuXG5cdFx0XHRcdFx0XHRcdFx0ZGF0YS51cmwgPSBocmVmO1xuXHRcdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdFx0bGV0IGNoYXB0ZXJfdmlwO1xuXG5cdFx0XHRcdFx0XHRcdGNoYXB0ZXJfdmlwID0gdHIuZmluZCgnLmxvY2snKS5sZW5ndGg7XG5cblx0XHRcdFx0XHRcdFx0aWYgKGNoYXB0ZXJfdmlwKVxuXHRcdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdFx0bm92ZWxfdmlwKys7XG5cdFx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0XHRsZXQgY2hhcHRlcl90aXRsZSA9IHRyaW0oYS50ZXh0KCkpO1xuXG5cdFx0XHRcdFx0XHRcdGlmICghY2hhcHRlcl90aXRsZSlcblx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdGNvbnNvbGUubG9nKGhyZWYpO1xuXHRcdFx0XHRcdFx0XHRcdGNvbnNvbGUubG9nKGEpO1xuXHRcdFx0XHRcdFx0XHRcdHRocm93IG5ldyBFcnJvcigpXG5cdFx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0XHRjdXJyZW50Vm9sdW1lXG5cdFx0XHRcdFx0XHRcdFx0LmNoYXB0ZXJfbGlzdFxuXHRcdFx0XHRcdFx0XHRcdC5wdXNoKHtcblx0XHRcdFx0XHRcdFx0XHRcdGNoYXB0ZXJfaW5kZXg6IGN1cnJlbnRWb2x1bWUuY2hhcHRlcl9saXN0Lmxlbmd0aCxcblx0XHRcdFx0XHRcdFx0XHRcdGNoYXB0ZXJfdGl0bGUsXG5cdFx0XHRcdFx0XHRcdFx0XHRjaGFwdGVyX2lkOiBkYXRhLmNoYXB0ZXJfaWQsXG5cdFx0XHRcdFx0XHRcdFx0XHRjaGFwdGVyX3VybDogaHJlZixcblx0XHRcdFx0XHRcdFx0XHRcdGNoYXB0ZXJfdXJsX2RhdGE6IGRhdGEsXG5cblx0XHRcdFx0XHRcdFx0XHRcdGNoYXB0ZXJfdmlwLFxuXHRcdFx0XHRcdFx0XHRcdH0pXG5cdFx0XHRcdFx0XHRcdDtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9KVxuXHRcdFx0XHQ7XG5cblx0XHRcdFx0bGV0IG5vdmVsX2RhdGU7XG5cblx0XHRcdFx0aWYgKF9jYWNoZV9kYXRlcy5sZW5ndGgpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRfY2FjaGVfZGF0ZXMuc29ydCgpO1xuXG5cdFx0XHRcdFx0bm92ZWxfZGF0ZSA9IG1vbWVudC51bml4KF9jYWNoZV9kYXRlc1tfY2FjaGVfZGF0ZXMubGVuZ3RoIC0gMV0pLmxvY2FsKCk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRpZiAobm92ZWxfdmlwKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0ZGF0YV9tZXRhLm5vdmVsID0gZGF0YV9tZXRhLm5vdmVsIHx8IHt9O1xuXHRcdFx0XHRcdGRhdGFfbWV0YS5ub3ZlbC50YWdzID0gZGF0YV9tZXRhLm5vdmVsLnRhZ3MgfHwgW107XG5cblx0XHRcdFx0XHRkYXRhX21ldGEubm92ZWwudGFncy5wdXNoKCdWSVAnKTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdHJldHVybiB7XG5cblx0XHRcdFx0XHR1cmw6IGRvbS51cmwsXG5cdFx0XHRcdFx0dXJsX2RhdGEsXG5cblx0XHRcdFx0XHQuLi5kYXRhX21ldGEsXG5cblx0XHRcdFx0XHRub3ZlbF92aXAsXG5cblx0XHRcdFx0XHR2b2x1bWVfbGlzdCxcblxuXHRcdFx0XHRcdC8vbm92ZWxfZGF0ZSxcblxuXHRcdFx0XHRcdGNoZWNrZGF0ZTogbW9tZW50KCkubG9jYWwoKSxcblxuXHRcdFx0XHRcdGltZ3M6IFtdIGFzIHN0cmluZ1tdLFxuXHRcdFx0XHR9IGFzIElOb3ZlbDtcblx0XHRcdH0pXG5cdFx0XHQudGFwKGZ1bmN0aW9uIChub3ZlbClcblx0XHRcdHtcblx0XHRcdFx0Y29uc29sZS5sb2cobm92ZWwpO1xuXHRcdFx0fSlcblx0XHRcdDtcblx0fVxuXG5cdHByb3RlY3RlZCBhc3luYyBfZ2V0X21ldGEoaW5wdXRVcmwsIG9wdGlvbnNSdW50aW1lLCBjYWNoZToge1xuXHRcdGRvbTogSUpTRE9NLFxuXHR9KVxuXHR7XG5cdFx0Y29uc3Qgc2VsZiA9IHRoaXM7XG5cblx0XHRsZXQgdXJsID0gaW5wdXRVcmw7XG5cblx0XHRyZXR1cm4gUHJvbWlzZS5yZXNvbHZlKGNhY2hlLmRvbSlcblx0XHRcdC50aGVuKGZ1bmN0aW9uIChkb20pXG5cdFx0XHR7XG5cdFx0XHRcdGNvbnN0ICQgPSBkb20uJDtcblx0XHRcdFx0bGV0IGRhdGE6IElNZGNvbmZNZXRhID0ge307XG5cdFx0XHRcdGRhdGEubm92ZWwgPSB7fTtcblxuXHRcdFx0XHRsZXQgbm92ZWxfYXV0aG9yID0gJCgnI2F1dGhvci1pbmZvIC5uYW1lW2l0ZW1wcm9wPVwiYXV0aG9yXCJdIFtpdGVtcHJvcD1cIm5hbWVcIl0nKVxuXHRcdFx0XHRcdC50ZXh0KClcblx0XHRcdFx0XHQudHJpbSgpXG5cdFx0XHRcdDtcblxuXHRcdFx0XHQkKCcjYm9vay10b3AgLmludHJvJykuZmluZCgnLnQnKS5yZW1vdmUoKTtcblxuXHRcdFx0XHRsZXQgbm92ZWxfZGVzYyA9ICQoJyNib29rLXRvcCAuaW50cm8nKVxuXHRcdFx0XHRcdC50ZXh0KClcblx0XHRcdFx0XHQudHJpbSgpXG5cdFx0XHRcdDtcblxuXHRcdFx0XHRkYXRhLm5vdmVsLnRhZ3MgPSBbXTtcblxuXHRcdFx0XHQkKCcjY2F0LWxpc3QgLmNhdCwgLmJvb2stdGl0bGUgLmJvb2stdGFnJylcblx0XHRcdFx0XHQuZWFjaChmdW5jdGlvbiAoKVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdGxldCB0ID0gdHJpbSgkKHRoaXMpXG5cdFx0XHRcdFx0XHRcdC50ZXh0KClcblx0XHRcdFx0XHRcdFx0LnJlcGxhY2UoL1xcKFxcZCtcXCkvZywgJycpKVxuXHRcdFx0XHRcdFx0O1xuXG5cdFx0XHRcdFx0XHRpZiAodClcblx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0ZGF0YS5ub3ZlbC50YWdzLnB1c2godCk7XG5cblx0XHRcdFx0XHRcdFx0aWYgKHQgPT0gJ+i/nui9vScgJiYgJCh0aGlzKS5pcygnLmJvb2stdGFnJykpXG5cdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHRkYXRhLm5vdmVsLnN0YXR1cyA9IHQ7XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9KVxuXHRcdFx0XHQ7XG5cblx0XHRcdFx0bGV0IG5vdmVsX2RhdGU7XG5cblx0XHRcdFx0e1xuXHRcdFx0XHRcdGxldCBkID0gJCgnLnVwZGF0ZS10aW1lIFtpdGVtcHJvcD1cImRhdGVQdWJsaXNoZWRcIl0nKVxuXHRcdFx0XHRcdFx0LmF0dHIoJ2NvbnRlbnQnKVxuXHRcdFx0XHRcdFx0Ly8ucmVwbGFjZSgv5pu05paw77yaLywgJycpXG5cdFx0XHRcdFx0XHQudHJpbSgpXG5cdFx0XHRcdFx0O1xuXG5cdFx0XHRcdFx0Ly9jb25zb2xlLmxvZyhkKTtcblxuXHRcdFx0XHRcdG5vdmVsX2RhdGUgPSBtb21lbnQoZCkubG9jYWwoKTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGxldCBub3ZlbF90aXRsZSA9IHRyaW0oJCgnLmJvb2stdGl0bGUgLnRpdGxlJykudGV4dCgpKTtcblxuXHRcdFx0XHQkKCcjYm9vay10b3AgaW1nLmNvdmVyW3NyY10nKS5lYWNoKGZ1bmN0aW9uICgpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRkYXRhLm5vdmVsLmNvdmVyID0gJCh0aGlzKVxuXHRcdFx0XHRcdFx0LnByb3AoJ3NyYycpXG5cdFx0XHRcdFx0XHQucmVwbGFjZSgvXFw/aW1hZ2VNb2dyMi4rJC8sICcnKVxuXHRcdFx0XHRcdDtcblx0XHRcdFx0fSk7XG5cblx0XHRcdFx0bGV0IHVybF9kYXRhID0gc2VsZi5wYXJzZVVybCh1cmwpO1xuXG5cdFx0XHRcdHJldHVybiB7XG5cdFx0XHRcdFx0dXJsLFxuXHRcdFx0XHRcdHVybF9kYXRhLFxuXG5cdFx0XHRcdFx0Li4uZGF0YSxcblxuXHRcdFx0XHRcdG5vdmVsX3RpdGxlLFxuXG5cdFx0XHRcdFx0bm92ZWxfYXV0aG9yLFxuXHRcdFx0XHRcdG5vdmVsX2Rlc2MsXG5cblx0XHRcdFx0XHRub3ZlbF9kYXRlLFxuXG5cdFx0XHRcdH07XG5cdFx0XHR9KVxuXHRcdFx0O1xuXHR9XG59XG5cbmV4cG9ydCBkZWZhdWx0IE5vdmVsU2l0ZUlxaW5nO1xuIl19