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
const { Script } = require("vm");
let NovelSiteHetubook = class NovelSiteHetubook extends base_1.default {
    makeUrl(urlobj, bool) {
        let url;
        let cid = (!bool && urlobj.chapter_id) ? `${urlobj.chapter_id}.html` : 'index.html';
        url = `http://www.hetubook.com/book/${urlobj.novel_id}/${cid}`;
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
        urlobj.url = new jsdom_url_1.URL(url);
        url = urlobj.url.href;
        let r = /www\.hetubook\.com\/book\/(\d+)\/(?:(\d+)|index)\.html/;
        let m = r.exec(url);
        if (m) {
            urlobj.novel_id = m[1];
            urlobj.chapter_id = m[2];
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
    _stripContent(text) {
        text = strip_1.stripContent(text);
        //process.exit();
        return text
            .replace(/^　　/gm, '')
            .replace(/^[ \uFEFF\xA0]+/gm, '');
    }
    session(optionsRuntime, url) {
        super.session(optionsRuntime, url);
        Object.assign(optionsRuntime.optionsJSDOM, {
            minifyHTML: false,
            runScripts: 'dangerously',
            pretendToBeVisual: true,
            resources: "usable",
        });
        return this;
    }
    _parseChapter(ret, optionsRuntime, cache) {
        if (!ret) {
            return '';
        }
        let body_selector = '#content';
        ret.dom.$(body_selector).find('h2').remove();
        ret.dom.$(body_selector).html(function (i, old) {
            return old
                .replace(/(<\/div>)/ig, '$1\n');
        });
        let text = ret.dom.$(body_selector).text();
        text = this._stripContent(text);
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
            let table = $('#dir').find('dt, dd');
            table
                .each(function (index) {
                let tr = dom.$(this);
                if (tr.is('dt')) {
                    currentVolume = volume_list[volume_list.length] = {
                        volume_index: volume_list.length,
                        volume_title: novel_text_1.default.trim(tr.text()),
                        chapter_list: [],
                    };
                }
                if (tr.is('dd, dt:has(a)')) {
                    tr.find('a:eq(0)')
                        .each(function (index) {
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
            return Object.assign({ url: dom.url, url_data }, data_meta, { volume_list, 
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
            let novel_author = util_1.trim($('.book_info a[href*="/author/"]').text());
            $('.jieshao_content h3:eq(0)').html(function (i, old) {
                return old.replace(/(<br\/?>)/ig, '$1\n');
            });
            let novel_desc = $('.book_info .intro')
                .text()
                .trim();
            if ($('.book_info.finish').length) {
                data.novel.status = '已完結';
            }
            let novel_title = util_1.trim($('.book_info > img[alt]').attr('alt'));
            let url_data = self.parseUrl(url);
            data.novel.cover = $(`.book_info > img`).prop('src');
            data.novel.tags = [];
            data.novel.tags.push($('.title a:eq(1)').text());
            $('.tag dd .button')
                .each(function () {
                data.novel.tags.push($(this).text());
            });
            return Object.assign({ url,
                url_data }, data, { novel_title,
                novel_author,
                novel_desc });
        });
    }
};
NovelSiteHetubook.IDKEY = path.basename(__dirname);
NovelSiteHetubook = __decorate([
    index_1.staticImplements()
], NovelSiteHetubook);
exports.NovelSiteHetubook = NovelSiteHetubook;
exports.default = NovelSiteHetubook;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7O0dBRUc7Ozs7Ozs7O0FBRUgsdUNBQTJDO0FBQzNDLHFDQUFxRTtBQUNyRSxvQ0FBbUY7QUFJbkYsdUNBQXlDO0FBQ3pDLHlDQUFnQztBQUNoQyw2Q0FBK0Q7QUFFL0Qsb0NBQWtDO0FBQ2xDLDJDQUFtQztBQUNuQyw2QkFBNkI7QUFHN0IsTUFBTSxFQUFFLE1BQU0sRUFBRSxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUdqQyxJQUFhLGlCQUFpQixHQUE5QixNQUFhLGlCQUFrQixTQUFRLGNBQWE7SUFJbkQsT0FBTyxDQUFDLE1BQTRCLEVBQUUsSUFBdUI7UUFFNUQsSUFBSSxHQUFXLENBQUM7UUFFaEIsSUFBSSxHQUFHLEdBQUcsQ0FBQyxDQUFDLElBQUksSUFBSSxNQUFNLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsTUFBTSxDQUFDLFVBQVUsT0FBTyxDQUFDLENBQUMsQ0FBQyxZQUFZLENBQUM7UUFFcEYsR0FBRyxHQUFHLGdDQUFnQyxNQUFNLENBQUMsUUFBUSxJQUFJLEdBQUcsRUFBRSxDQUFDO1FBRS9ELE9BQU8sSUFBSSxlQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDckIsQ0FBQztJQUVELFFBQVEsQ0FBQyxHQUFpQixFQUFFLE9BQVE7UUFFbkMsSUFBSSxNQUFNLEdBQUc7WUFDWixHQUFHLEVBQUUsR0FBRztZQUVSLFNBQVMsRUFBRSxJQUFJO1lBQ2YsUUFBUSxFQUFFLElBQUk7WUFDZCxVQUFVLEVBQUUsSUFBSTtZQUVoQixXQUFXLEVBQUUsSUFBSTtTQUNqQixDQUFDO1FBRUYsTUFBTSxDQUFDLEdBQUcsR0FBRyxJQUFJLGVBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUMxQixHQUFHLEdBQUcsTUFBTSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUM7UUFFdEIsSUFBSSxDQUFD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aUJBQWlCLENBNlM3QjtBQTdTWSw4Q0FBaUI7QUErUzlCLGtCQUFlLGlCQUFpQixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDcmVhdGVkIGJ5IHVzZXIgb24gMjAxOC8zLzI1LzAyNS5cbiAqL1xuXG5pbXBvcnQgeyBzdHJpcENvbnRlbnQgfSBmcm9tICcuLi8uLi9zdHJpcCc7XG5pbXBvcnQgeyBhcnJheV91bmlxdWUsIGlzVW5kZWYsIG1pbmlmeUhUTUwsIHRyaW0gfSBmcm9tICcuLi8uLi91dGlsJztcbmltcG9ydCBfTm92ZWxTaXRlLCB7IHN0YXRpY0ltcGxlbWVudHMsIFNZTUJPTF9DQUNIRSwgSU1kY29uZk1ldGEgfSBmcm9tICcuLi9pbmRleCc7XG5pbXBvcnQgeyBJRG93bmxvYWRPcHRpb25zLCBJTm92ZWwgfSBmcm9tICcuLi9kZW1vL2Jhc2UnO1xuaW1wb3J0IHsgSUZldGNoQ2hhcHRlciwgSU9wdGlvbnNSdW50aW1lIH0gZnJvbSAnLi4vZGVtby9iYXNlJztcbmltcG9ydCAqIGFzIE5vdmVsU2l0ZURlbW8gZnJvbSAnLi4vZGVtby9iYXNlJztcbmltcG9ydCBOb3ZlbFNpdGVCYXNlIGZyb20gJy4uL2RlbW8vYmFzZSc7XG5pbXBvcnQgeyBVUkwgfSBmcm9tICdqc2RvbS11cmwnO1xuaW1wb3J0IHsgZnJvbVVSTCwgSUZyb21VcmxPcHRpb25zLCBJSlNET00gfSBmcm9tICdqc2RvbS1leHRyYSc7XG5pbXBvcnQgeyBQcm9taXNlQmx1ZWJpcmQsIGJsdWViaXJkRGVjb3JhdG9yIH0gZnJvbSAnLi4vaW5kZXgnO1xuaW1wb3J0IHsgbW9tZW50IH0gZnJvbSAnLi4vaW5kZXgnO1xuaW1wb3J0IG5vdmVsVGV4dCBmcm9tICdub3ZlbC10ZXh0JztcbmltcG9ydCAqIGFzIHBhdGggZnJvbSBcInBhdGhcIjtcbmltcG9ydCAqIGFzIFN0clV0aWwgZnJvbSAnc3RyLXV0aWwnO1xuaW1wb3J0IHsgemhSZWdFeHAgfSBmcm9tICdyZWdleHAtY2prJztcbmNvbnN0IHsgU2NyaXB0IH0gPSByZXF1aXJlKFwidm1cIik7XG5cbkBzdGF0aWNJbXBsZW1lbnRzPF9Ob3ZlbFNpdGUuSU5vdmVsU2l0ZVN0YXRpYzxOb3ZlbFNpdGVIZXR1Ym9vaz4+KClcbmV4cG9ydCBjbGFzcyBOb3ZlbFNpdGVIZXR1Ym9vayBleHRlbmRzIE5vdmVsU2l0ZUJhc2Vcbntcblx0cHVibGljIHN0YXRpYyByZWFkb25seSBJREtFWSA9IHBhdGguYmFzZW5hbWUoX19kaXJuYW1lKTtcblxuXHRtYWtlVXJsKHVybG9iajogX05vdmVsU2l0ZS5JUGFyc2VVcmwsIGJvb2w/OiBib29sZWFuIHwgbnVtYmVyKTogVVJMXG5cdHtcblx0XHRsZXQgdXJsOiBzdHJpbmc7XG5cblx0XHRsZXQgY2lkID0gKCFib29sICYmIHVybG9iai5jaGFwdGVyX2lkKSA/IGAke3VybG9iai5jaGFwdGVyX2lkfS5odG1sYCA6ICdpbmRleC5odG1sJztcblxuXHRcdHVybCA9IGBodHRwOi8vd3d3LmhldHVib29rLmNvbS9ib29rLyR7dXJsb2JqLm5vdmVsX2lkfS8ke2NpZH1gO1xuXG5cdFx0cmV0dXJuIG5ldyBVUkwodXJsKTtcblx0fVxuXG5cdHBhcnNlVXJsKHVybDogVVJMIHwgc3RyaW5nLCBvcHRpb25zPyk6IF9Ob3ZlbFNpdGUuSVBhcnNlVXJsXG5cdHtcblx0XHRsZXQgdXJsb2JqID0ge1xuXHRcdFx0dXJsOiB1cmwsXG5cblx0XHRcdG5vdmVsX3BpZDogbnVsbCxcblx0XHRcdG5vdmVsX2lkOiBudWxsLFxuXHRcdFx0Y2hhcHRlcl9pZDogbnVsbCxcblxuXHRcdFx0Y2hhcHRlcl92aXA6IG51bGwsXG5cdFx0fTtcblxuXHRcdHVybG9iai51cmwgPSBuZXcgVVJMKHVybCk7XG5cdFx0dXJsID0gdXJsb2JqLnVybC5ocmVmO1xuXG5cdFx0bGV0IHIgPSAvd3d3XFwuaGV0dWJvb2tcXC5jb21cXC9ib29rXFwvKFxcZCspXFwvKD86KFxcZCspfGluZGV4KVxcLmh0bWwvO1xuXG5cdFx0bGV0IG0gPSByLmV4ZWModXJsKTtcblx0XHRpZiAobSlcblx0XHR7XG5cdFx0XHR1cmxvYmoubm92ZWxfaWQgPSBtWzFdO1xuXHRcdFx0dXJsb2JqLmNoYXB0ZXJfaWQgPSBtWzJdO1xuXG5cdFx0XHRyZXR1cm4gdXJsb2JqO1xuXHRcdH1cblxuXHRcdHJldHVybiB1cmxvYmo7XG5cdH1cblxuXHRjcmVhdGVNYWluVXJsKHVybClcblx0e1xuXHRcdGxldCBkYXRhID0gdGhpcy5wYXJzZVVybCh1cmwpO1xuXG5cdFx0aWYgKCFkYXRhIHx8ICFkYXRhLm5vdmVsX2lkKVxuXHRcdHtcblx0XHRcdGNvbnNvbGUubG9nKGRhdGEpO1xuXG5cdFx0XHR0aHJvdyBuZXcgUmVmZXJlbmNlRXJyb3IoKTtcblx0XHR9XG5cblx0XHRsZXQgcmV0ID0gdGhpcy5tYWtlVXJsKGRhdGEsIHRydWUpO1xuXG5cdFx0cmV0dXJuIHJldDtcblx0fVxuXG5cdF9zdHJpcENvbnRlbnQodGV4dDogc3RyaW5nKVxuXHR7XG5cdFx0dGV4dCA9IHN0cmlwQ29udGVudCh0ZXh0KTtcblxuXHRcdC8vcHJvY2Vzcy5leGl0KCk7XG5cblx0XHRyZXR1cm4gdGV4dFxuXHRcdFx0LnJlcGxhY2UoL17jgIDjgIAvZ20sICcnKVxuXHRcdFx0LnJlcGxhY2UoL15bIFxcdUZFRkZcXHhBMF0rL2dtLCAnJylcblx0XHQ7XG5cdH1cblxuXHRzZXNzaW9uKG9wdGlvbnNSdW50aW1lLCB1cmwpXG5cdHtcblx0XHRzdXBlci5zZXNzaW9uKG9wdGlvbnNSdW50aW1lLCB1cmwpO1xuXG5cdFx0T2JqZWN0LmFzc2lnbihvcHRpb25zUnVudGltZS5vcHRpb25zSlNET00sIHtcblx0XHRcdG1pbmlmeUhUTUw6IGZhbHNlLFxuXHRcdFx0cnVuU2NyaXB0czogJ2Rhbmdlcm91c2x5Jyxcblx0XHRcdHByZXRlbmRUb0JlVmlzdWFsOiB0cnVlLFxuXHRcdFx0cmVzb3VyY2VzOiBcInVzYWJsZVwiLFxuXHRcdH0gYXMgSU9wdGlvbnNSdW50aW1lW1wib3B0aW9uc0pTRE9NXCJdKTtcblxuXHRcdHJldHVybiB0aGlzO1xuXHR9XG5cblx0cHJvdGVjdGVkIF9wYXJzZUNoYXB0ZXI8VD4ocmV0OiBJRmV0Y2hDaGFwdGVyLCBvcHRpb25zUnVudGltZTogVCAmIElPcHRpb25zUnVudGltZSwgY2FjaGUpXG5cdHtcblx0XHRpZiAoIXJldClcblx0XHR7XG5cdFx0XHRyZXR1cm4gJyc7XG5cdFx0fVxuXG5cdFx0bGV0IGJvZHlfc2VsZWN0b3IgPSAnI2NvbnRlbnQnO1xuXG5cdFx0cmV0LmRvbS4kKGJvZHlfc2VsZWN0b3IpLmZpbmQoJ2gyJykucmVtb3ZlKCk7XG5cblx0XHRyZXQuZG9tLiQoYm9keV9zZWxlY3RvcikuaHRtbChmdW5jdGlvbiAoaSwgb2xkKVxuXHRcdHtcblx0XHRcdHJldHVybiBvbGRcblx0XHRcdFx0LnJlcGxhY2UoLyg8XFwvZGl2PikvaWcsICckMVxcbicpXG5cdFx0XHRcdDtcblx0XHR9KTtcblxuXHRcdGxldCB0ZXh0ID0gcmV0LmRvbS4kKGJvZHlfc2VsZWN0b3IpLnRleHQoKTtcblxuXHRcdHRleHQgPSB0aGlzLl9zdHJpcENvbnRlbnQodGV4dCk7XG5cblx0XHRyZXR1cm4gdGV4dDtcblx0fVxuXG5cdGFzeW5jIGdldF92b2x1bWVfbGlzdDxUID0gSU9wdGlvbnNSdW50aW1lPihpbnB1dFVybDogc3RyaW5nIHwgVVJMLFxuXHRcdG9wdGlvbnNSdW50aW1lOiBQYXJ0aWFsPFQgJiBJRG93bmxvYWRPcHRpb25zPiA9IHt9XG5cdCk6IFByb21pc2U8SU5vdmVsPlxuXHR7XG5cdFx0Y29uc3Qgc2VsZiA9IHRoaXM7XG5cdFx0bGV0IHVybCA9IGF3YWl0IHRoaXMuY3JlYXRlTWFpblVybChpbnB1dFVybCk7XG5cblx0XHRyZXR1cm4gYXdhaXQgZnJvbVVSTCh1cmwsIG9wdGlvbnNSdW50aW1lLm9wdGlvbnNKU0RPTSlcblx0XHRcdC50aGVuKGFzeW5jIGZ1bmN0aW9uIChkb206IElKU0RPTSlcblx0XHRcdHtcblx0XHRcdFx0Y29uc3QgJCA9IGRvbS4kO1xuXG5cdFx0XHRcdGxldCB1cmxfZGF0YSA9IHNlbGYucGFyc2VVcmwoZG9tLnVybC5ocmVmKTtcblxuXHRcdFx0XHRsZXQgZGF0YV9tZXRhID0gYXdhaXQgc2VsZi5fZ2V0X21ldGEodXJsLCBvcHRpb25zUnVudGltZSwge1xuXHRcdFx0XHRcdGRvbSxcblx0XHRcdFx0fSk7XG5cblx0XHRcdFx0bGV0IF9jYWNoZV9kYXRlcyA9IFtdO1xuXHRcdFx0XHRsZXQgdm9sdW1lX2xpc3QgPSBbXSBhcyBfTm92ZWxTaXRlLklWb2x1bWVbXTtcblxuXHRcdFx0XHRsZXQgY3VycmVudFZvbHVtZTogX05vdmVsU2l0ZS5JVm9sdW1lO1xuXG5cdFx0XHRcdGxldCBub3ZlbF92aXAgPSAwO1xuXG5cdFx0XHRcdGxldCB0YWJsZSA9ICQoJyNkaXInKS5maW5kKCdkdCwgZGQnKTtcblx0XHRcdFx0dGFibGVcblx0XHRcdFx0XHQuZWFjaChmdW5jdGlvbiAoaW5kZXgpXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0bGV0IHRyID0gZG9tLiQodGhpcyk7XG5cblx0XHRcdFx0XHRcdGlmICh0ci5pcygnZHQnKSlcblx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0Y3VycmVudFZvbHVtZSA9IHZvbHVtZV9saXN0W3ZvbHVtZV9saXN0Lmxlbmd0aF0gPSB7XG5cdFx0XHRcdFx0XHRcdFx0dm9sdW1lX2luZGV4OiB2b2x1bWVfbGlzdC5sZW5ndGgsXG5cdFx0XHRcdFx0XHRcdFx0dm9sdW1lX3RpdGxlOiBub3ZlbFRleHQudHJpbSh0ci50ZXh0KCkpLFxuXHRcdFx0XHRcdFx0XHRcdGNoYXB0ZXJfbGlzdDogW10sXG5cdFx0XHRcdFx0XHRcdH07XG5cdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdGlmICh0ci5pcygnZGQsIGR0OmhhcyhhKScpKVxuXHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHR0ci5maW5kKCdhOmVxKDApJylcblx0XHRcdFx0XHRcdFx0XHQuZWFjaChmdW5jdGlvbiAoaW5kZXgpXG5cdFx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdFx0bGV0IGEgPSBkb20uJCh0aGlzKTtcblxuXHRcdFx0XHRcdFx0XHRcdFx0bGV0IGhyZWYgPSBhLnByb3AoJ2hyZWYnKTtcblxuXHRcdFx0XHRcdFx0XHRcdFx0bGV0IGRhdGEgPSBzZWxmLnBhcnNlVXJsKGhyZWYpO1xuXG5cdFx0XHRcdFx0XHRcdFx0XHRpZiAoIWRhdGEuY2hhcHRlcl9pZClcblx0XHRcdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0Ly9jb25zb2xlLmxvZyhocmVmLCBkYXRhKTtcblxuXHRcdFx0XHRcdFx0XHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoKVxuXHRcdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRcdFx0ZWxzZVxuXHRcdFx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRocmVmID0gc2VsZi5tYWtlVXJsKGRhdGEpO1xuXG5cdFx0XHRcdFx0XHRcdFx0XHRcdGRhdGEudXJsID0gaHJlZjtcblx0XHRcdFx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0XHRcdFx0bGV0IGNoYXB0ZXJfdGl0bGUgPSB0cmltKGEudGV4dCgpKTtcblxuXHRcdFx0XHRcdFx0XHRcdFx0aWYgKCFjaGFwdGVyX3RpdGxlKVxuXHRcdFx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRjb25zb2xlLmxvZyhocmVmKTtcblx0XHRcdFx0XHRcdFx0XHRcdFx0Y29uc29sZS5sb2coYSk7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdHRocm93IG5ldyBFcnJvcigpXG5cdFx0XHRcdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdFx0XHRcdGN1cnJlbnRWb2x1bWVcblx0XHRcdFx0XHRcdFx0XHRcdFx0LmNoYXB0ZXJfbGlzdFxuXHRcdFx0XHRcdFx0XHRcdFx0XHQucHVzaCh7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0Y2hhcHRlcl9pbmRleDogY3VycmVudFZvbHVtZS5jaGFwdGVyX2xpc3QubGVuZ3RoLFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdGNoYXB0ZXJfdGl0bGUsXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0Y2hhcHRlcl9pZDogZGF0YS5jaGFwdGVyX2lkLFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdGNoYXB0ZXJfdXJsOiBocmVmLFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdGNoYXB0ZXJfdXJsX2RhdGE6IGRhdGEsXG5cdFx0XHRcdFx0XHRcdFx0XHRcdH0pXG5cdFx0XHRcdFx0XHRcdFx0XHQ7XG5cdFx0XHRcdFx0XHRcdFx0fSlcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9KVxuXHRcdFx0XHQ7XG5cblx0XHRcdFx0bGV0IG5vdmVsX2RhdGU7XG5cblx0XHRcdFx0aWYgKF9jYWNoZV9kYXRlcy5sZW5ndGgpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRfY2FjaGVfZGF0ZXMuc29ydCgpO1xuXG5cdFx0XHRcdFx0bm92ZWxfZGF0ZSA9IG1vbWVudC51bml4KF9jYWNoZV9kYXRlc1tfY2FjaGVfZGF0ZXMubGVuZ3RoIC0gMV0pLmxvY2FsKCk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRyZXR1cm4ge1xuXG5cdFx0XHRcdFx0dXJsOiBkb20udXJsLFxuXHRcdFx0XHRcdHVybF9kYXRhLFxuXG5cdFx0XHRcdFx0Li4uZGF0YV9tZXRhLFxuXG5cdFx0XHRcdFx0dm9sdW1lX2xpc3QsXG5cblx0XHRcdFx0XHQvL25vdmVsX2RhdGUsXG5cblx0XHRcdFx0XHRjaGVja2RhdGU6IG1vbWVudCgpLmxvY2FsKCksXG5cblx0XHRcdFx0XHRpbWdzOiBbXSBhcyBzdHJpbmdbXSxcblx0XHRcdFx0fSBhcyBJTm92ZWw7XG5cdFx0XHR9KVxuXHRcdFx0LnRhcChmdW5jdGlvbiAobm92ZWwpXG5cdFx0XHR7XG5cdFx0XHRcdGNvbnNvbGUuZGlyKG5vdmVsLCB7XG5cdFx0XHRcdFx0Y29sb3JzOiB0cnVlLFxuXHRcdFx0XHRcdC8vZGVwdGg6IDMsXG5cdFx0XHRcdH0pO1xuXHRcdFx0fSlcblx0XHRcdDtcblx0fVxuXG5cdHByb3RlY3RlZCBhc3luYyBfZ2V0X21ldGEoaW5wdXRVcmwsIG9wdGlvbnNSdW50aW1lLCBjYWNoZToge1xuXHRcdGRvbTogSUpTRE9NLFxuXHR9KVxuXHR7XG5cdFx0Y29uc3Qgc2VsZiA9IHRoaXM7XG5cblx0XHRsZXQgdXJsID0gdGhpcy5tYWtlVXJsKHRoaXMucGFyc2VVcmwoaW5wdXRVcmwpLCAtMSk7XG5cblx0XHQvL3JldHVybiBmcm9tVVJMKHVybCwgb3B0aW9uc1J1bnRpbWUub3B0aW9uc0pTRE9NKVxuXHRcdHJldHVybiBQcm9taXNlLnJlc29sdmUoY2FjaGUuZG9tKVxuXHRcdFx0LnRoZW4oZnVuY3Rpb24gKGRvbSlcblx0XHRcdHtcblx0XHRcdFx0Y29uc3QgJCA9IGRvbS4kO1xuXHRcdFx0XHRsZXQgZGF0YTogSU1kY29uZk1ldGEgPSB7fTtcblx0XHRcdFx0ZGF0YS5ub3ZlbCA9IHt9O1xuXG5cdFx0XHRcdGxldCBub3ZlbF9hdXRob3IgPSB0cmltKCQoJy5ib29rX2luZm8gYVtocmVmKj1cIi9hdXRob3IvXCJdJykudGV4dCgpKTtcblxuXHRcdFx0XHQkKCcuamllc2hhb19jb250ZW50IGgzOmVxKDApJykuaHRtbChmdW5jdGlvbiAoaSwgb2xkKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0cmV0dXJuIG9sZC5yZXBsYWNlKC8oPGJyXFwvPz4pL2lnLCAnJDFcXG4nKTtcblx0XHRcdFx0fSk7XG5cblx0XHRcdFx0bGV0IG5vdmVsX2Rlc2MgPSAkKCcuYm9va19pbmZvIC5pbnRybycpXG5cdFx0XHRcdFx0LnRleHQoKVxuXHRcdFx0XHRcdC50cmltKClcblx0XHRcdFx0O1xuXG5cdFx0XHRcdGlmICgkKCcuYm9va19pbmZvLmZpbmlzaCcpLmxlbmd0aClcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGRhdGEubm92ZWwuc3RhdHVzID0gJ+W3suWujOe1kCc7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRsZXQgbm92ZWxfdGl0bGUgPSB0cmltKFxuXHRcdFx0XHRcdCQoJy5ib29rX2luZm8gPiBpbWdbYWx0XScpLmF0dHIoJ2FsdCcpXG5cdFx0XHRcdCk7XG5cblx0XHRcdFx0bGV0IHVybF9kYXRhID0gc2VsZi5wYXJzZVVybCh1cmwpO1xuXG5cdFx0XHRcdGRhdGEubm92ZWwuY292ZXIgPSAkKGAuYm9va19pbmZvID4gaW1nYCkucHJvcCgnc3JjJyk7XG5cblx0XHRcdFx0ZGF0YS5ub3ZlbC50YWdzID0gW107XG5cblx0XHRcdFx0ZGF0YS5ub3ZlbC50YWdzLnB1c2goJCgnLnRpdGxlIGE6ZXEoMSknKS50ZXh0KCkpO1xuXG5cdFx0XHRcdCQoJy50YWcgZGQgLmJ1dHRvbicpXG5cdFx0XHRcdFx0LmVhY2goZnVuY3Rpb24gKClcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRkYXRhLm5vdmVsLnRhZ3MucHVzaCgkKHRoaXMpLnRleHQoKSk7XG5cdFx0XHRcdFx0fSlcblx0XHRcdFx0O1xuXG5cdFx0XHRcdHJldHVybiB7XG5cdFx0XHRcdFx0dXJsLFxuXHRcdFx0XHRcdHVybF9kYXRhLFxuXG5cdFx0XHRcdFx0Li4uZGF0YSxcblxuXHRcdFx0XHRcdG5vdmVsX3RpdGxlLFxuXG5cdFx0XHRcdFx0bm92ZWxfYXV0aG9yLFxuXHRcdFx0XHRcdG5vdmVsX2Rlc2MsXG5cblx0XHRcdFx0fSBhcyBJTm92ZWw7XG5cdFx0XHR9KVxuXHRcdFx0O1xuXHR9XG59XG5cbmV4cG9ydCBkZWZhdWx0IE5vdmVsU2l0ZUhldHVib29rO1xuIl19