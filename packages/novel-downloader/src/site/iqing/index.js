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
//import { URL } from 'jsdom-url';
const jsdom_extra_1 = require("jsdom-extra");
const index_2 = require("../index");
let NovelSiteIqing = /** @class */ (() => {
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
        makeUrl(urlobj, bool, optionsRuntime) {
            let url;
            if (bool || !urlobj.chapter_id) {
                url = `https://www.iqing.com/book/${urlobj.novel_id}/`;
            }
            else {
                url = `https://poi.iqing.com/content/${urlobj.chapter_id}/chapter/`;
            }
            // @ts-ignore
            return new URL(url);
        }
        parseUrl(url, options) {
            let urlobj = {
                url: url,
                novel_pid: null,
                novel_id: null,
                chapter_id: null,
            };
            // @ts-ignore
            urlobj.url = new URL(url);
            // @ts-ignore
            url = urlobj.url.href;
            let r = /www\.iqing\.com\/read\/(\d+)/;
            // @ts-ignore
            let m = r.exec(url);
            if (m) {
                urlobj.chapter_id = m[1];
                return urlobj;
            }
            r = /poi\.iqing\.com\/content\/(\d+)\/chapter/;
            // @ts-ignore
            if (m = r.exec(url)) {
                urlobj.chapter_id = m[1];
                return urlobj;
            }
            r = /www\.iqing\.com\/book\/(\d+)/;
            // @ts-ignore
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
            let url = await this.createMainUrl(inputUrl, optionsRuntime);
            return jsdom_extra_1.fromURL(url, optionsRuntime.optionsJSDOM)
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
                    // @ts-ignore
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
                return Object.assign(Object.assign({ url: dom.url, url_data }, data_meta), { novel_vip,
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
                    // @ts-ignore
                    let t = util_1.trim($(this)
                        .text()
                        .replace(/\(\d+\)/g, ''));
                    if (t) {
                        data.novel.tags.push(t);
                        // @ts-ignore
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
                    // @ts-ignore
                    data.novel.cover = $(this)
                        .prop('src')
                        .replace(/\?imageMogr2.+$/, '');
                });
                let url_data = self.parseUrl(url);
                return Object.assign(Object.assign({ url,
                    url_data }, data), { novel_title,
                    novel_author,
                    novel_desc,
                    novel_date });
            });
        }
    };
    NovelSiteIqing.IDKEY = 'iqing';
    NovelSiteIqing.disabled = true;
    NovelSiteIqing = __decorate([
        index_1.staticImplements()
    ], NovelSiteIqing);
    return NovelSiteIqing;
})();
exports.NovelSiteIqing = NovelSiteIqing;
exports.default = NovelSiteIqing;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7O0dBRUc7Ozs7Ozs7O0FBRUgscUNBQXVEO0FBQ3ZELG9DQUFtRjtBQUluRix1Q0FBeUM7QUFDekMsa0NBQWtDO0FBQ2xDLDZDQUErRDtBQUUvRCxvQ0FBa0M7QUFrQmxDO0lBQUEsSUFBYSxjQUFjLEdBQTNCLE1BQWEsY0FBZSxTQUFRLGNBQWE7UUFLaEQsZ0JBQWdCLENBQW1CLElBQXNCLEVBQUUsaUJBQWtDLEVBQUU7WUFFOUYsSUFBSSxJQUFJLEVBQ1I7Z0JBQ0MsSUFBSSxJQUFJLENBQUMsU0FBUyxJQUFJLElBQUksQ0FBQyxpQkFBaUIsRUFDNUM7b0JBQ0MsSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUM7b0JBRWhCLE9BQU8sSUFBSSxDQUFDO2lCQUNaO2FBQ0Q7WUFFRCxPQUFPLElBQUksQ0FBQztRQUNiLENBQUM7UUFFRCxPQUFPLENBQUksTUFBNEIsRUFBRSxJQUF1QixFQUFFLGNBQW9DO1lBRXJHLElBQUksR0FBVyxDQUFDO1lBRWhCLElBQUksSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLFVBQVUsRUFDOUI7Z0JBQ0MsR0FBRyxHQUFHLDhCQUE4QixNQUFNLENBQUMsUUFBUSxHQUFHLENBQUM7YUFDdkQ7aUJBRUQ7Z0JBQ0MsR0FBRyxHQUFHLGlDQUFpQyxNQUFNLENBQUMsVUFBVSxXQUFXLENBQUM7YUFDcEU7WUFFRCxhQUFhO1lBQ2IsT0FBTyxJQUFJLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUNyQixDQUFDO1FBRUQsUUFBUSxDQUFDLEdBQWlCLEVBQUUsT0FBUTtZQUVuQyxJQUFJLE1BQU0sR0FBRztnQkFDWixHQUFHLEVBQUUsR0FBRztnQkFFUixTQUFTLEVBQUUsSUFBSTtnQkFDZixRQUFRLEVBQUUsSUFBSTtnQkFDZCxVQUFVLEVBQUUsSUFBSTthQUNoQixDQUFDO1lBRUYsYUFBYTtZQUNi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QkFFVixVQUFVLElBRVQ7WUFDSCxDQUFDLENBQUMsQ0FDRDtRQUNILENBQUM7S0FDRCxDQUFBO0lBall1QixvQkFBSyxHQUFHLE9BQU8sQ0FBQztJQUNoQyx1QkFBUSxHQUFHLElBQUksQ0FBQztJQUhYLGNBQWM7UUFEMUIsd0JBQWdCLEVBQStDO09BQ25ELGNBQWMsQ0FtWTFCO0lBQUQscUJBQUM7S0FBQTtBQW5ZWSx3Q0FBYztBQXFZM0Isa0JBQWUsY0FBYyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDcmVhdGVkIGJ5IHVzZXIgb24gMjAxOC8zLzI1LzAyNS5cbiAqL1xuXG5pbXBvcnQgeyBpc1VuZGVmLCBtaW5pZnlIVE1MLCB0cmltIH0gZnJvbSAnLi4vLi4vdXRpbCc7XG5pbXBvcnQgX05vdmVsU2l0ZSwgeyBzdGF0aWNJbXBsZW1lbnRzLCBTWU1CT0xfQ0FDSEUsIElNZGNvbmZNZXRhIH0gZnJvbSAnLi4vaW5kZXgnO1xuaW1wb3J0IHsgSURvd25sb2FkT3B0aW9ucywgSU5vdmVsIH0gZnJvbSAnLi4vZGVtby9iYXNlJztcbmltcG9ydCB7IElGZXRjaENoYXB0ZXIsIElPcHRpb25zUnVudGltZSB9IGZyb20gJy4uL2RlbW8vYmFzZSc7XG5pbXBvcnQgKiBhcyBOb3ZlbFNpdGVEZW1vIGZyb20gJy4uL2RlbW8vYmFzZSc7XG5pbXBvcnQgTm92ZWxTaXRlQmFzZSBmcm9tICcuLi9kZW1vL2Jhc2UnO1xuLy9pbXBvcnQgeyBVUkwgfSBmcm9tICdqc2RvbS11cmwnO1xuaW1wb3J0IHsgZnJvbVVSTCwgSUZyb21VcmxPcHRpb25zLCBJSlNET00gfSBmcm9tICdqc2RvbS1leHRyYSc7XG5pbXBvcnQgeyBQcm9taXNlQmx1ZWJpcmQsIGJsdWViaXJkRGVjb3JhdG9yIH0gZnJvbSAnLi4vaW5kZXgnO1xuaW1wb3J0IHsgbW9tZW50IH0gZnJvbSAnLi4vaW5kZXgnO1xuaW1wb3J0IG5vdmVsVGV4dCBmcm9tICdub3ZlbC10ZXh0JztcblxuZXhwb3J0IHR5cGUgSVNlc3Npb25EYXRhID0ge1xuXG5cdC8vIHJlcXVpcmVcblx0c2Vzc2lvbmlkOiBzdHJpbmcsXG5cdHN0ZWluc19jc3JmX3Rva2VuOiBzdHJpbmcsXG5cdG9ubGluZT86IDEgfCAnMScsXG5cblx0Ly8gbm8gbmVlZFxuXHRpZD86IG51bWJlciB8IHN0cmluZyxcblx0YXZhdGFyPzogc3RyaW5nLFxuXHR1c2VybmFtZT86IHN0cmluZyxcblxufVxuXG5Ac3RhdGljSW1wbGVtZW50czxfTm92ZWxTaXRlLklOb3ZlbFNpdGVTdGF0aWM8Tm92ZWxTaXRlSXFpbmc+PigpXG5leHBvcnQgY2xhc3MgTm92ZWxTaXRlSXFpbmcgZXh0ZW5kcyBOb3ZlbFNpdGVCYXNlXG57XG5cdHB1YmxpYyBzdGF0aWMgcmVhZG9ubHkgSURLRVkgPSAnaXFpbmcnO1xuXHRzdGF0aWMgZGlzYWJsZWQgPSB0cnVlO1xuXG5cdGNoZWNrU2Vzc2lvbkRhdGE8VCA9IElTZXNzaW9uRGF0YT4oZGF0YTogVCAmIElTZXNzaW9uRGF0YSwgb3B0aW9uc1J1bnRpbWU6IElPcHRpb25zUnVudGltZSA9IHt9KTogVFxuXHR7XG5cdFx0aWYgKGRhdGEpXG5cdFx0e1xuXHRcdFx0aWYgKGRhdGEuc2Vzc2lvbmlkICYmIGRhdGEuc3RlaW5zX2NzcmZfdG9rZW4pXG5cdFx0XHR7XG5cdFx0XHRcdGRhdGEub25saW5lID0gMTtcblxuXHRcdFx0XHRyZXR1cm4gZGF0YTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHRyZXR1cm4gZGF0YTtcblx0fVxuXG5cdG1ha2VVcmw8VD4odXJsb2JqOiBfTm92ZWxTaXRlLklQYXJzZVVybCwgYm9vbD86IGJvb2xlYW4gfCBudW1iZXIsIG9wdGlvbnNSdW50aW1lPzogVCAmIElPcHRpb25zUnVudGltZSk6IFVSTFxuXHR7XG5cdFx0bGV0IHVybDogc3RyaW5nO1xuXG5cdFx0aWYgKGJvb2wgfHwgIXVybG9iai5jaGFwdGVyX2lkKVxuXHRcdHtcblx0XHRcdHVybCA9IGBodHRwczovL3d3dy5pcWluZy5jb20vYm9vay8ke3VybG9iai5ub3ZlbF9pZH0vYDtcblx0XHR9XG5cdFx0ZWxzZVxuXHRcdHtcblx0XHRcdHVybCA9IGBodHRwczovL3BvaS5pcWluZy5jb20vY29udGVudC8ke3VybG9iai5jaGFwdGVyX2lkfS9jaGFwdGVyL2A7XG5cdFx0fVxuXG5cdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdHJldHVybiBuZXcgVVJMKHVybCk7XG5cdH1cblxuXHRwYXJzZVVybCh1cmw6IFVSTCB8IHN0cmluZywgb3B0aW9ucz8pOiBfTm92ZWxTaXRlLklQYXJzZVVybFxuXHR7XG5cdFx0bGV0IHVybG9iaiA9IHtcblx0XHRcdHVybDogdXJsLFxuXG5cdFx0XHRub3ZlbF9waWQ6IG51bGwsXG5cdFx0XHRub3ZlbF9pZDogbnVsbCxcblx0XHRcdGNoYXB0ZXJfaWQ6IG51bGwsXG5cdFx0fTtcblxuXHRcdC8vIEB0cy1pZ25vcmVcblx0XHR1cmxvYmoudXJsID0gbmV3IFVSTCh1cmwpO1xuXHRcdC8vIEB0cy1pZ25vcmVcblx0XHR1cmwgPSB1cmxvYmoudXJsLmhyZWY7XG5cblx0XHRsZXQgciA9IC93d3dcXC5pcWluZ1xcLmNvbVxcL3JlYWRcXC8oXFxkKykvO1xuXG5cdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdGxldCBtID0gci5leGVjKHVybCk7XG5cdFx0aWYgKG0pXG5cdFx0e1xuXHRcdFx0dXJsb2JqLmNoYXB0ZXJfaWQgPSBtWzFdO1xuXG5cdFx0XHRyZXR1cm4gdXJsb2JqO1xuXHRcdH1cblxuXHRcdHIgPSAvcG9pXFwuaXFpbmdcXC5jb21cXC9jb250ZW50XFwvKFxcZCspXFwvY2hhcHRlci87XG5cdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdGlmIChtID0gci5leGVjKHVybCkpXG5cdFx0e1xuXHRcdFx0dXJsb2JqLmNoYXB0ZXJfaWQgPSBtWzFdO1xuXG5cdFx0XHRyZXR1cm4gdXJsb2JqO1xuXHRcdH1cblxuXHRcdHIgPSAvd3d3XFwuaXFpbmdcXC5jb21cXC9ib29rXFwvKFxcZCspLztcblx0XHQvLyBAdHMtaWdub3JlXG5cdFx0aWYgKG0gPSByLmV4ZWModXJsKSlcblx0XHR7XG5cdFx0XHR1cmxvYmoubm92ZWxfaWQgPSBtWzFdO1xuXG5cdFx0XHRyZXR1cm4gdXJsb2JqO1xuXHRcdH1cblxuXHRcdHJldHVybiB1cmxvYmo7XG5cdH1cblxuXHRjcmVhdGVNYWluVXJsPFQ+KHVybDogc3RyaW5nIHwgVVJMLCBvcHRpb25zUnVudGltZTogVCAmIElPcHRpb25zUnVudGltZSlcblx0e1xuXHRcdGxldCBkYXRhID0gdGhpcy5wYXJzZVVybCh1cmwpO1xuXG5cdFx0aWYgKCFkYXRhIHx8ICFkYXRhLm5vdmVsX2lkKVxuXHRcdHtcblx0XHRcdGNvbnNvbGUubG9nKGRhdGEpO1xuXG5cdFx0XHR0aHJvdyBuZXcgUmVmZXJlbmNlRXJyb3IoKTtcblx0XHR9XG5cblx0XHRsZXQgcmV0ID0gdGhpcy5tYWtlVXJsKGRhdGEsIHRydWUsIG9wdGlvbnNSdW50aW1lKTtcblxuXHRcdHJldHVybiByZXQ7XG5cdH1cblxuXHRwcm90ZWN0ZWQgX3BhcnNlQ2hhcHRlcjxUPihyZXQ6IElGZXRjaENoYXB0ZXIsIG9wdGlvbnNSdW50aW1lOiBUICYgSU9wdGlvbnNSdW50aW1lLCBjYWNoZSk6IHN0cmluZ1xuXHR7XG5cdFx0aWYgKCFyZXQpXG5cdFx0e1xuXHRcdFx0cmV0dXJuICcnO1xuXHRcdH1cblxuXHRcdGxldCB0ZXh0OiBzdHJpbmc7XG5cblx0XHRpZiAocmV0Lmpzb24gJiYgcmV0Lmpzb24ucmVzdWx0cyAmJiByZXQuanNvbi5yZXN1bHRzLmxlbmd0aClcblx0XHR7XG5cdFx0XHR0ZXh0ID0gcmV0Lmpzb24ucmVzdWx0c1xuXHRcdFx0XHQucmVkdWNlKGZ1bmN0aW9uIChhLCBiKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0aWYgKGIgJiYgYi52YWx1ZSlcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRhLnB1c2goYi52YWx1ZSk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGVsc2Vcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRjb25zb2xlLmxvZyg3NzcsIGIpO1xuXG5cdFx0XHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoKTtcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRyZXR1cm4gYTtcblx0XHRcdFx0fSwgW10pXG5cdFx0XHRcdC5qb2luKFwiXFxuXCIpXG5cdFx0XHQ7XG5cblx0XHRcdGlmICghdGV4dClcblx0XHRcdHtcblx0XHRcdFx0Y29uc29sZS5sb2coNjY2LCByZXQuanNvbi5yZXN1bHRzKTtcblxuXHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoKTtcblx0XHRcdH1cblxuXHRcdFx0Y2FjaGUuY2hhcHRlci5jaGFwdGVyX2RhdGUgPSBtb21lbnQocmV0Lmpzb24udXBkYXRlZF90aW1lKS5sb2NhbCgpO1xuXG5cdFx0XHRpZiAoY2FjaGUuY2hhcHRlci5jaGFwdGVyX3ZpcClcblx0XHRcdHtcblx0XHRcdFx0dGV4dCA9IGDku5josrvnq6DoioJcXG5cXG49PT09PT09PT09PT09PT09PT09PT09PT09PVxcblxcbiR7dGV4dH1gO1xuXHRcdFx0fVxuXG5cdFx0XHRyZXR1cm4gdGV4dDtcblx0XHR9XG5cblx0XHRjb25zb2xlLmxvZyhyZXQpO1xuXG5cdFx0dGhyb3cgbmV3IEVycm9yO1xuXG5cdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdHJldHVybiB0ZXh0O1xuXHR9XG5cblx0YXN5bmMgZ2V0X3ZvbHVtZV9saXN0PFQgPSBJT3B0aW9uc1J1bnRpbWU+KGlucHV0VXJsOiBzdHJpbmcgfCBVUkwsXG5cdFx0b3B0aW9uc1J1bnRpbWU6IFBhcnRpYWw8VCAmIElEb3dubG9hZE9wdGlvbnM+ID0ge31cblx0KTogUHJvbWlzZTxJTm92ZWw+XG5cdHtcblx0XHRjb25zdCBzZWxmID0gdGhpcztcblx0XHRsZXQgdXJsID0gYXdhaXQgdGhpcy5jcmVhdGVNYWluVXJsKGlucHV0VXJsLCBvcHRpb25zUnVudGltZSk7XG5cblx0XHRyZXR1cm4gZnJvbVVSTCh1cmwsIG9wdGlvbnNSdW50aW1lLm9wdGlvbnNKU0RPTSlcblx0XHRcdC50aGVuKGFzeW5jIGZ1bmN0aW9uIChkb206IElKU0RPTSlcblx0XHRcdHtcblx0XHRcdFx0Y29uc3QgJCA9IGRvbS4kO1xuXG5cdFx0XHRcdGxldCB1cmxfZGF0YSA9IHNlbGYucGFyc2VVcmwoZG9tLnVybC5ocmVmKTtcblxuXHRcdFx0XHRsZXQgZGF0YV9tZXRhID0gYXdhaXQgc2VsZi5fZ2V0X21ldGEodXJsLCBvcHRpb25zUnVudGltZSwge1xuXHRcdFx0XHRcdGRvbSxcblx0XHRcdFx0fSk7XG5cblx0XHRcdFx0bGV0IF9jYWNoZV9kYXRlcyA9IFtdO1xuXHRcdFx0XHRsZXQgdm9sdW1lX2xpc3QgPSBbXSBhcyBfTm92ZWxTaXRlLklWb2x1bWVbXTtcblxuXHRcdFx0XHRsZXQgY3VycmVudFZvbHVtZTogX05vdmVsU2l0ZS5JVm9sdW1lO1xuXG5cdFx0XHRcdGxldCBub3ZlbF92aXAgPSAwO1xuXG5cdFx0XHRcdGxldCB0YWJsZSA9ICQoJyNib29rLW1lbnUgLmxpc3Qtdm9sdW1lIGxpJyk7XG5cdFx0XHRcdHRhYmxlXG5cdFx0XHRcdFx0LmVhY2goZnVuY3Rpb24gKGluZGV4KVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdC8vIEB0cy1pZ25vcmVcblx0XHRcdFx0XHRcdGxldCB0ciA9IGRvbS4kKHRoaXMpO1xuXG5cdFx0XHRcdFx0XHRpZiAodHIuaXMoJy52b2x1bWUnKSlcblx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0Y3VycmVudFZvbHVtZSA9IHZvbHVtZV9saXN0W3ZvbHVtZV9saXN0Lmxlbmd0aF0gPSB7XG5cdFx0XHRcdFx0XHRcdFx0dm9sdW1lX2luZGV4OiB2b2x1bWVfbGlzdC5sZW5ndGgsXG5cdFx0XHRcdFx0XHRcdFx0dm9sdW1lX3RpdGxlOiB0cmltKHRyLmZpbmQoJ2gzJykudGV4dCgpKSxcblx0XHRcdFx0XHRcdFx0XHRjaGFwdGVyX2xpc3Q6IFtdLFxuXHRcdFx0XHRcdFx0XHR9O1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0ZWxzZSBpZiAodHIuaXMoJy5jaGFwdGVyJykpXG5cdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdGxldCBhID0gdHIuZmluZCgnYScpO1xuXG5cdFx0XHRcdFx0XHRcdGxldCBocmVmID0gYS5wcm9wKCdocmVmJyk7XG5cblx0XHRcdFx0XHRcdFx0bGV0IGRhdGEgPSBzZWxmLnBhcnNlVXJsKGhyZWYpO1xuXG5cdFx0XHRcdFx0XHRcdGlmICghZGF0YS5jaGFwdGVyX2lkKVxuXHRcdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdFx0Ly9jb25zb2xlLmxvZyhocmVmLCBkYXRhKTtcblxuXHRcdFx0XHRcdFx0XHRcdHRocm93IG5ldyBFcnJvcigpXG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0ZWxzZVxuXHRcdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdFx0aHJlZiA9IHNlbGYubWFrZVVybChkYXRhKTtcblxuXHRcdFx0XHRcdFx0XHRcdGRhdGEudXJsID0gaHJlZjtcblx0XHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHRcdGxldCBjaGFwdGVyX3ZpcDtcblxuXHRcdFx0XHRcdFx0XHRjaGFwdGVyX3ZpcCA9IHRyLmZpbmQoJy5sb2NrJykubGVuZ3RoO1xuXG5cdFx0XHRcdFx0XHRcdGlmIChjaGFwdGVyX3ZpcClcblx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdG5vdmVsX3ZpcCsrO1xuXHRcdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdFx0bGV0IGNoYXB0ZXJfdGl0bGUgPSB0cmltKGEudGV4dCgpKTtcblxuXHRcdFx0XHRcdFx0XHRpZiAoIWNoYXB0ZXJfdGl0bGUpXG5cdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHRjb25zb2xlLmxvZyhocmVmKTtcblx0XHRcdFx0XHRcdFx0XHRjb25zb2xlLmxvZyhhKTtcblx0XHRcdFx0XHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoKVxuXHRcdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdFx0Y3VycmVudFZvbHVtZVxuXHRcdFx0XHRcdFx0XHRcdC5jaGFwdGVyX2xpc3Rcblx0XHRcdFx0XHRcdFx0XHQucHVzaCh7XG5cdFx0XHRcdFx0XHRcdFx0XHRjaGFwdGVyX2luZGV4OiBjdXJyZW50Vm9sdW1lLmNoYXB0ZXJfbGlzdC5sZW5ndGgsXG5cdFx0XHRcdFx0XHRcdFx0XHRjaGFwdGVyX3RpdGxlLFxuXHRcdFx0XHRcdFx0XHRcdFx0Y2hhcHRlcl9pZDogZGF0YS5jaGFwdGVyX2lkLFxuXHRcdFx0XHRcdFx0XHRcdFx0Y2hhcHRlcl91cmw6IGhyZWYsXG5cdFx0XHRcdFx0XHRcdFx0XHRjaGFwdGVyX3VybF9kYXRhOiBkYXRhLFxuXG5cdFx0XHRcdFx0XHRcdFx0XHRjaGFwdGVyX3ZpcCxcblx0XHRcdFx0XHRcdFx0XHR9KVxuXHRcdFx0XHRcdFx0XHQ7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fSlcblx0XHRcdFx0O1xuXG5cdFx0XHRcdGxldCBub3ZlbF9kYXRlO1xuXG5cdFx0XHRcdGlmIChfY2FjaGVfZGF0ZXMubGVuZ3RoKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0X2NhY2hlX2RhdGVzLnNvcnQoKTtcblxuXHRcdFx0XHRcdG5vdmVsX2RhdGUgPSBtb21lbnQudW5peChfY2FjaGVfZGF0ZXNbX2NhY2hlX2RhdGVzLmxlbmd0aCAtIDFdKS5sb2NhbCgpO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0aWYgKG5vdmVsX3ZpcClcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGRhdGFfbWV0YS5ub3ZlbCA9IGRhdGFfbWV0YS5ub3ZlbCB8fCB7fTtcblx0XHRcdFx0XHRkYXRhX21ldGEubm92ZWwudGFncyA9IGRhdGFfbWV0YS5ub3ZlbC50YWdzIHx8IFtdO1xuXG5cdFx0XHRcdFx0ZGF0YV9tZXRhLm5vdmVsLnRhZ3MucHVzaCgnVklQJyk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRyZXR1cm4ge1xuXG5cdFx0XHRcdFx0dXJsOiBkb20udXJsLFxuXHRcdFx0XHRcdHVybF9kYXRhLFxuXG5cdFx0XHRcdFx0Li4uZGF0YV9tZXRhLFxuXG5cdFx0XHRcdFx0bm92ZWxfdmlwLFxuXG5cdFx0XHRcdFx0dm9sdW1lX2xpc3QsXG5cblx0XHRcdFx0XHQvL25vdmVsX2RhdGUsXG5cblx0XHRcdFx0XHRjaGVja2RhdGU6IG1vbWVudCgpLmxvY2FsKCksXG5cblx0XHRcdFx0XHRpbWdzOiBbXSBhcyBzdHJpbmdbXSxcblx0XHRcdFx0fSBhcyBJTm92ZWw7XG5cdFx0XHR9KVxuXHRcdFx0LnRhcChmdW5jdGlvbiAobm92ZWwpXG5cdFx0XHR7XG5cdFx0XHRcdGNvbnNvbGUubG9nKG5vdmVsKTtcblx0XHRcdH0pXG5cdFx0XHQ7XG5cdH1cblxuXHRwcm90ZWN0ZWQgYXN5bmMgX2dldF9tZXRhKGlucHV0VXJsLCBvcHRpb25zUnVudGltZSwgY2FjaGU6IHtcblx0XHRkb206IElKU0RPTSxcblx0fSlcblx0e1xuXHRcdGNvbnN0IHNlbGYgPSB0aGlzO1xuXG5cdFx0bGV0IHVybCA9IGlucHV0VXJsO1xuXG5cdFx0cmV0dXJuIFByb21pc2UucmVzb2x2ZShjYWNoZS5kb20pXG5cdFx0XHQudGhlbihmdW5jdGlvbiAoZG9tKVxuXHRcdFx0e1xuXHRcdFx0XHRjb25zdCAkID0gZG9tLiQ7XG5cdFx0XHRcdGxldCBkYXRhOiBJTWRjb25mTWV0YSA9IHt9O1xuXHRcdFx0XHRkYXRhLm5vdmVsID0ge307XG5cblx0XHRcdFx0bGV0IG5vdmVsX2F1dGhvciA9ICQoJyNhdXRob3ItaW5mbyAubmFtZVtpdGVtcHJvcD1cImF1dGhvclwiXSBbaXRlbXByb3A9XCJuYW1lXCJdJylcblx0XHRcdFx0XHQudGV4dCgpXG5cdFx0XHRcdFx0LnRyaW0oKVxuXHRcdFx0XHQ7XG5cblx0XHRcdFx0JCgnI2Jvb2stdG9wIC5pbnRybycpLmZpbmQoJy50JykucmVtb3ZlKCk7XG5cblx0XHRcdFx0bGV0IG5vdmVsX2Rlc2MgPSAkKCcjYm9vay10b3AgLmludHJvJylcblx0XHRcdFx0XHQudGV4dCgpXG5cdFx0XHRcdFx0LnRyaW0oKVxuXHRcdFx0XHQ7XG5cblx0XHRcdFx0ZGF0YS5ub3ZlbC50YWdzID0gW107XG5cblx0XHRcdFx0JCgnI2NhdC1saXN0IC5jYXQsIC5ib29rLXRpdGxlIC5ib29rLXRhZycpXG5cdFx0XHRcdFx0LmVhY2goZnVuY3Rpb24gKClcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHQvLyBAdHMtaWdub3JlXG5cdFx0XHRcdFx0XHRsZXQgdCA9IHRyaW0oJCh0aGlzKVxuXHRcdFx0XHRcdFx0XHQudGV4dCgpXG5cdFx0XHRcdFx0XHRcdC5yZXBsYWNlKC9cXChcXGQrXFwpL2csICcnKSlcblx0XHRcdFx0XHRcdDtcblxuXHRcdFx0XHRcdFx0aWYgKHQpXG5cdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdGRhdGEubm92ZWwudGFncy5wdXNoKHQpO1xuXG5cdFx0XHRcdFx0XHRcdC8vIEB0cy1pZ25vcmVcblx0XHRcdFx0XHRcdFx0aWYgKHQgPT0gJ+i/nui9vScgJiYgJCh0aGlzKS5pcygnLmJvb2stdGFnJykpXG5cdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHRkYXRhLm5vdmVsLnN0YXR1cyA9IHQ7XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9KVxuXHRcdFx0XHQ7XG5cblx0XHRcdFx0bGV0IG5vdmVsX2RhdGU7XG5cblx0XHRcdFx0e1xuXHRcdFx0XHRcdGxldCBkID0gJCgnLnVwZGF0ZS10aW1lIFtpdGVtcHJvcD1cImRhdGVQdWJsaXNoZWRcIl0nKVxuXHRcdFx0XHRcdFx0LmF0dHIoJ2NvbnRlbnQnKVxuXHRcdFx0XHRcdFx0Ly8ucmVwbGFjZSgv5pu05paw77yaLywgJycpXG5cdFx0XHRcdFx0XHQudHJpbSgpXG5cdFx0XHRcdFx0O1xuXG5cdFx0XHRcdFx0Ly9jb25zb2xlLmxvZyhkKTtcblxuXHRcdFx0XHRcdG5vdmVsX2RhdGUgPSBtb21lbnQoZCkubG9jYWwoKTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGxldCBub3ZlbF90aXRsZSA9IHRyaW0oJCgnLmJvb2stdGl0bGUgLnRpdGxlJykudGV4dCgpKTtcblxuXHRcdFx0XHQkKCcjYm9vay10b3AgaW1nLmNvdmVyW3NyY10nKS5lYWNoKGZ1bmN0aW9uICgpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHQvLyBAdHMtaWdub3JlXG5cdFx0XHRcdFx0ZGF0YS5ub3ZlbC5jb3ZlciA9ICQodGhpcylcblx0XHRcdFx0XHRcdC5wcm9wKCdzcmMnKVxuXHRcdFx0XHRcdFx0LnJlcGxhY2UoL1xcP2ltYWdlTW9ncjIuKyQvLCAnJylcblx0XHRcdFx0XHQ7XG5cdFx0XHRcdH0pO1xuXG5cdFx0XHRcdGxldCB1cmxfZGF0YSA9IHNlbGYucGFyc2VVcmwodXJsKTtcblxuXHRcdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHRcdHVybCxcblx0XHRcdFx0XHR1cmxfZGF0YSxcblxuXHRcdFx0XHRcdC4uLmRhdGEsXG5cblx0XHRcdFx0XHRub3ZlbF90aXRsZSxcblxuXHRcdFx0XHRcdG5vdmVsX2F1dGhvcixcblx0XHRcdFx0XHRub3ZlbF9kZXNjLFxuXG5cdFx0XHRcdFx0bm92ZWxfZGF0ZSxcblxuXHRcdFx0XHR9O1xuXHRcdFx0fSlcblx0XHRcdDtcblx0fVxufVxuXG5leHBvcnQgZGVmYXVsdCBOb3ZlbFNpdGVJcWluZztcbiJdfQ==