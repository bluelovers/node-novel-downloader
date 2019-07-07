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
let NovelSiteClass = class NovelSiteClass extends base_1.default {
    makeUrl(urlobj, bool) {
        let url;
        let cid = (!bool && urlobj.chapter_id) ? `${urlobj.chapter_id}.htm` : 'index.html';
        url = `http://www.millionbook.net/${urlobj.novel_pid}/${urlobj.novel_id}/${cid}`;
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
        // @ts-ignore
        url = urlobj.url.href;
        let r = /www\.millionbook\.net\/([\w\/]+)\/(\w+)\/(?:(\d+)|index)\.html?/;
        // @ts-ignore
        let m = r.exec(url);
        if (m) {
            urlobj.novel_pid = m[1];
            urlobj.novel_id = m[2];
            urlobj.chapter_id = m[3];
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
            .replace(/^[ \uFEFF\xA0]+/gm, '')
            .replace(/^\n+/, '')
            .replace(/\s+$/, '');
    }
    _parseChapter(ret, optionsRuntime, cache) {
        if (!ret) {
            return '';
        }
        ret.dom.$('.tt2 center').remove();
        let body_selector = '.tt2';
        try {
            let html = util_1.minifyHTML(ret.dom.$(body_selector).html());
            //html = html.replace(/^(&nbsp;){4}/gm, '');
            html = html.replace(/^\s+|\s+$/g, '');
            ret.dom.$(body_selector).html(html);
        }
        catch (e) {
        }
        ret.dom.$(body_selector).html(function (i, old) {
            return old;
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
            let table = $('body > center > table center:has(font[color="#FF0000"]) > center > table td');
            table
                .each(function (index) {
                let tr = dom.$(this);
                let title = novel_text_1.default.trim(util_1.trim(tr.text())).replace(/^◎/, '');
                if (title && tr.find('a').length == 0) {
                    currentVolume = volume_list[volume_list.length] = {
                        volume_index: volume_list.length,
                        volume_title: title,
                        chapter_list: [],
                    };
                }
                else if (title && tr.has('a').length) {
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
            let novel_author = util_1.trim($('title').text().match(/\(([^()]+)\)\s*$/)[1]);
            let novel_title = util_1.trim($('body > center > table center font[color="#FF0000"]').text());
            let url_data = self.parseUrl(url);
            return Object.assign({ url,
                url_data }, data, { novel_title,
                novel_author });
        });
    }
};
NovelSiteClass.IDKEY = path.basename(__dirname);
NovelSiteClass = __decorate([
    index_1.staticImplements()
], NovelSiteClass);
exports.NovelSiteClass = NovelSiteClass;
exports.default = NovelSiteClass;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7O0dBRUc7Ozs7Ozs7O0FBRUgsdUNBQTJDO0FBQzNDLHFDQUFxRTtBQUNyRSxvQ0FBbUY7QUFJbkYsdUNBQXlDO0FBQ3pDLHlDQUFnQztBQUNoQyw2Q0FBK0Q7QUFFL0Qsb0NBQWtDO0FBQ2xDLDJDQUFtQztBQUNuQyw2QkFBNkI7QUFLN0IsSUFBYSxjQUFjLEdBQTNCLE1BQWEsY0FBZSxTQUFRLGNBQWE7SUFJaEQsT0FBTyxDQUFDLE1BQTRCLEVBQUUsSUFBdUI7UUFFNUQsSUFBSSxHQUFXLENBQUM7UUFFaEIsSUFBSSxHQUFHLEdBQUcsQ0FBQyxDQUFDLElBQUksSUFBSSxNQUFNLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsTUFBTSxDQUFDLFVBQVUsTUFBTSxDQUFDLENBQUMsQ0FBQyxZQUFZLENBQUM7UUFFbkYsR0FBRyxHQUFHLDhCQUE4QixNQUFNLENBQUMsU0FBUyxJQUFJLE1BQU0sQ0FBQyxRQUFRLElBQUksR0FBRyxFQUFFLENBQUM7UUFFakYsYUFBYTtRQUNiLE9BQU8sSUFBSSxlQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDckIsQ0FBQztJQUVELFFBQVEsQ0FBQyxHQUFpQixFQUFFLE9BQVE7UUFFbkMsSUFBSSxNQUFNLEdBQUc7WUFDWixHQUFHLEVBQUUsR0FBRztZQUVSLFNBQVMsRUFBRSxJQUFJO1lBQ2YsUUFBUSxFQUFFLElBQUk7WUFDZCxVQUFVLEVBQUUsSUFBSTtZQUVoQixXQUFXLEVBQUUsSUFBSTtTQUNqQixDQUFDO1FBRUYsYUFBYTtRQUNiLE1BQU0sQ0FBQyxHQUFHLEdBQUcsSUFBSSxlQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDMUIsYUFBYTtRQUNiLEdBQUcsR0FBRyxNQUFNLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQztRQUV0QixJQUFJLENBQUMsR0FBRyxpRUFB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QUMvQixJQUFJLENBQUMsVUFBVSxHQUFHO1lBRWxCLE1BQU0sQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDaEIsSUFBSSxJQUFJLEdBQWdCLEVBQUUsQ0FBQztZQUMzQixJQUFJLENBQUMsS0FBSyxHQUFHLEVBQUUsQ0FBQztZQUVoQixJQUFJLFlBQVksR0FBRyxXQUFJLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDLEtBQUssQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFFeEUsSUFBSSxXQUFXLEdBQUcsV0FBSSxDQUNyQixDQUFDLENBQUMsb0RBQW9ELENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FDOUQsQ0FBQztZQUVGLElBQUksUUFBUSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUM7WUFFbEMsdUJBQ0MsR0FBRztnQkFDSCxRQUFRLElBRUwsSUFBSSxJQUVQLFdBQVc7Z0JBRVgsWUFBWSxJQUVYO1FBQ0gsQ0FBQyxDQUFDLENBQ0Q7SUFDSCxDQUFDO0NBQ0QsQ0FBQTtBQTdSdUIsb0JBQUssR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxDQUFDO0FBRjVDLGNBQWM7SUFEMUIsd0JBQWdCLEVBQStDO0dBQ25ELGNBQWMsQ0ErUjFCO0FBL1JZLHdDQUFjO0FBaVMzQixrQkFBZSxjQUFjLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENyZWF0ZWQgYnkgdXNlciBvbiAyMDE4LzMvMjUvMDI1LlxuICovXG5cbmltcG9ydCB7IHN0cmlwQ29udGVudCB9IGZyb20gJy4uLy4uL3N0cmlwJztcbmltcG9ydCB7IGFycmF5X3VuaXF1ZSwgaXNVbmRlZiwgbWluaWZ5SFRNTCwgdHJpbSB9IGZyb20gJy4uLy4uL3V0aWwnO1xuaW1wb3J0IF9Ob3ZlbFNpdGUsIHsgc3RhdGljSW1wbGVtZW50cywgU1lNQk9MX0NBQ0hFLCBJTWRjb25mTWV0YSB9IGZyb20gJy4uL2luZGV4JztcbmltcG9ydCB7IElEb3dubG9hZE9wdGlvbnMsIElOb3ZlbCB9IGZyb20gJy4uL2RlbW8vYmFzZSc7XG5pbXBvcnQgeyBJRmV0Y2hDaGFwdGVyLCBJT3B0aW9uc1J1bnRpbWUgfSBmcm9tICcuLi9kZW1vL2Jhc2UnO1xuaW1wb3J0ICogYXMgTm92ZWxTaXRlRGVtbyBmcm9tICcuLi9kZW1vL2Jhc2UnO1xuaW1wb3J0IE5vdmVsU2l0ZUJhc2UgZnJvbSAnLi4vZGVtby9iYXNlJztcbmltcG9ydCB7IFVSTCB9IGZyb20gJ2pzZG9tLXVybCc7XG5pbXBvcnQgeyBmcm9tVVJMLCBJRnJvbVVybE9wdGlvbnMsIElKU0RPTSB9IGZyb20gJ2pzZG9tLWV4dHJhJztcbmltcG9ydCB7IFByb21pc2VCbHVlYmlyZCwgYmx1ZWJpcmREZWNvcmF0b3IgfSBmcm9tICcuLi9pbmRleCc7XG5pbXBvcnQgeyBtb21lbnQgfSBmcm9tICcuLi9pbmRleCc7XG5pbXBvcnQgbm92ZWxUZXh0IGZyb20gJ25vdmVsLXRleHQnO1xuaW1wb3J0ICogYXMgcGF0aCBmcm9tIFwicGF0aFwiO1xuaW1wb3J0ICogYXMgU3RyVXRpbCBmcm9tICdzdHItdXRpbCc7XG5pbXBvcnQgeyB6aFJlZ0V4cCB9IGZyb20gJ3JlZ2V4cC1jamsnO1xuXG5Ac3RhdGljSW1wbGVtZW50czxfTm92ZWxTaXRlLklOb3ZlbFNpdGVTdGF0aWM8Tm92ZWxTaXRlQ2xhc3M+PigpXG5leHBvcnQgY2xhc3MgTm92ZWxTaXRlQ2xhc3MgZXh0ZW5kcyBOb3ZlbFNpdGVCYXNlXG57XG5cdHB1YmxpYyBzdGF0aWMgcmVhZG9ubHkgSURLRVkgPSBwYXRoLmJhc2VuYW1lKF9fZGlybmFtZSk7XG5cblx0bWFrZVVybCh1cmxvYmo6IF9Ob3ZlbFNpdGUuSVBhcnNlVXJsLCBib29sPzogYm9vbGVhbiB8IG51bWJlcik6IFVSTFxuXHR7XG5cdFx0bGV0IHVybDogc3RyaW5nO1xuXG5cdFx0bGV0IGNpZCA9ICghYm9vbCAmJiB1cmxvYmouY2hhcHRlcl9pZCkgPyBgJHt1cmxvYmouY2hhcHRlcl9pZH0uaHRtYCA6ICdpbmRleC5odG1sJztcblxuXHRcdHVybCA9IGBodHRwOi8vd3d3Lm1pbGxpb25ib29rLm5ldC8ke3VybG9iai5ub3ZlbF9waWR9LyR7dXJsb2JqLm5vdmVsX2lkfS8ke2NpZH1gO1xuXG5cdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdHJldHVybiBuZXcgVVJMKHVybCk7XG5cdH1cblxuXHRwYXJzZVVybCh1cmw6IFVSTCB8IHN0cmluZywgb3B0aW9ucz8pOiBfTm92ZWxTaXRlLklQYXJzZVVybFxuXHR7XG5cdFx0bGV0IHVybG9iaiA9IHtcblx0XHRcdHVybDogdXJsLFxuXG5cdFx0XHRub3ZlbF9waWQ6IG51bGwsXG5cdFx0XHRub3ZlbF9pZDogbnVsbCxcblx0XHRcdGNoYXB0ZXJfaWQ6IG51bGwsXG5cblx0XHRcdGNoYXB0ZXJfdmlwOiBudWxsLFxuXHRcdH07XG5cblx0XHQvLyBAdHMtaWdub3JlXG5cdFx0dXJsb2JqLnVybCA9IG5ldyBVUkwodXJsKTtcblx0XHQvLyBAdHMtaWdub3JlXG5cdFx0dXJsID0gdXJsb2JqLnVybC5ocmVmO1xuXG5cdFx0bGV0IHIgPSAvd3d3XFwubWlsbGlvbmJvb2tcXC5uZXRcXC8oW1xcd1xcL10rKVxcLyhcXHcrKVxcLyg/OihcXGQrKXxpbmRleClcXC5odG1sPy87XG5cblx0XHQvLyBAdHMtaWdub3JlXG5cdFx0bGV0IG0gPSByLmV4ZWModXJsKTtcblxuXHRcdGlmIChtKVxuXHRcdHtcblx0XHRcdHVybG9iai5ub3ZlbF9waWQgPSBtWzFdO1xuXHRcdFx0dXJsb2JqLm5vdmVsX2lkID0gbVsyXTtcblx0XHRcdHVybG9iai5jaGFwdGVyX2lkID0gbVszXTtcblxuXHRcdFx0cmV0dXJuIHVybG9iajtcblx0XHR9XG5cblx0XHRyZXR1cm4gdXJsb2JqO1xuXHR9XG5cblx0Y3JlYXRlTWFpblVybCh1cmwpXG5cdHtcblx0XHRsZXQgZGF0YSA9IHRoaXMucGFyc2VVcmwodXJsKTtcblxuXHRcdGlmICghZGF0YSB8fCAhZGF0YS5ub3ZlbF9pZClcblx0XHR7XG5cdFx0XHRjb25zb2xlLmxvZyhkYXRhKTtcblxuXHRcdFx0dGhyb3cgbmV3IFJlZmVyZW5jZUVycm9yKCk7XG5cdFx0fVxuXG5cdFx0bGV0IHJldCA9IHRoaXMubWFrZVVybChkYXRhLCB0cnVlKTtcblxuXHRcdHJldHVybiByZXQ7XG5cdH1cblxuXHRfc3RyaXBDb250ZW50KHRleHQ6IHN0cmluZylcblx0e1xuXHRcdHRleHQgPSBzdHJpcENvbnRlbnQodGV4dCk7XG5cblx0XHQvL3Byb2Nlc3MuZXhpdCgpO1xuXG5cdFx0cmV0dXJuIHRleHRcblx0XHRcdC5yZXBsYWNlKC9e44CA44CAL2dtLCAnJylcblx0XHRcdC5yZXBsYWNlKC9eWyBcXHVGRUZGXFx4QTBdKy9nbSwgJycpXG5cdFx0XHQucmVwbGFjZSgvXlxcbisvLCAnJylcblx0XHRcdC5yZXBsYWNlKC9cXHMrJC8sICcnKVxuXHRcdDtcblx0fVxuXG5cdHByb3RlY3RlZCBfcGFyc2VDaGFwdGVyPFQ+KHJldDogSUZldGNoQ2hhcHRlciwgb3B0aW9uc1J1bnRpbWU6IFQgJiBJT3B0aW9uc1J1bnRpbWUsIGNhY2hlKTogc3RyaW5nXG5cdHtcblx0XHRpZiAoIXJldClcblx0XHR7XG5cdFx0XHRyZXR1cm4gJyc7XG5cdFx0fVxuXG5cdFx0cmV0LmRvbS4kKCcudHQyIGNlbnRlcicpLnJlbW92ZSgpO1xuXG5cdFx0bGV0IGJvZHlfc2VsZWN0b3IgPSAnLnR0Mic7XG5cblx0XHR0cnlcblx0XHR7XG5cdFx0XHRsZXQgaHRtbCA9IG1pbmlmeUhUTUwocmV0LmRvbS4kKGJvZHlfc2VsZWN0b3IpLmh0bWwoKSk7XG5cblx0XHRcdC8vaHRtbCA9IGh0bWwucmVwbGFjZSgvXigmbmJzcDspezR9L2dtLCAnJyk7XG5cdFx0XHRodG1sID0gaHRtbC5yZXBsYWNlKC9eXFxzK3xcXHMrJC9nLCAnJyk7XG5cblx0XHRcdHJldC5kb20uJChib2R5X3NlbGVjdG9yKS5odG1sKGh0bWwpO1xuXHRcdH1cblx0XHRjYXRjaCAoZSlcblx0XHR7XG5cblx0XHR9XG5cblx0XHRyZXQuZG9tLiQoYm9keV9zZWxlY3RvcikuaHRtbChmdW5jdGlvbiAoaSwgb2xkKVxuXHRcdHtcblx0XHRcdHJldHVybiBvbGRcblx0XHRcdFx0Ly8ucmVwbGFjZSgvKDxiclxcLz8+KS9pZywgJyQxXFxuJylcblx0XHRcdFx0Ly8ucmVwbGFjZSgvKDxwPikvaWcsICdcXG4kMScpXG5cdFx0XHRcdDtcblx0XHR9KTtcblxuXHRcdGxldCB0ZXh0ID0gcmV0LmRvbS4kKGJvZHlfc2VsZWN0b3IpLnRleHQoKTtcblxuXHRcdHRleHQgPSB0aGlzLl9zdHJpcENvbnRlbnQodGV4dCk7XG5cblx0XHRyZXR1cm4gdGV4dDtcblx0fVxuXG5cdGFzeW5jIGdldF92b2x1bWVfbGlzdDxUID0gSU9wdGlvbnNSdW50aW1lPihpbnB1dFVybDogc3RyaW5nIHwgVVJMLFxuXHRcdG9wdGlvbnNSdW50aW1lOiBQYXJ0aWFsPFQgJiBJRG93bmxvYWRPcHRpb25zPiA9IHt9XG5cdCk6IFByb21pc2U8SU5vdmVsPlxuXHR7XG5cdFx0Y29uc3Qgc2VsZiA9IHRoaXM7XG5cdFx0bGV0IHVybCA9IGF3YWl0IHRoaXMuY3JlYXRlTWFpblVybChpbnB1dFVybCk7XG5cblx0XHRyZXR1cm4gYXdhaXQgZnJvbVVSTCh1cmwsIG9wdGlvbnNSdW50aW1lLm9wdGlvbnNKU0RPTSlcblx0XHRcdC50aGVuKGFzeW5jIGZ1bmN0aW9uIChkb206IElKU0RPTSlcblx0XHRcdHtcblx0XHRcdFx0Y29uc3QgJCA9IGRvbS4kO1xuXG5cdFx0XHRcdCQuZm4uZWFjaFJldmVyc2UgPSBmdW5jdGlvbiAoLi4uYXJndilcblx0XHRcdFx0e1xuXHRcdFx0XHRcdHJldHVybiAkKCQodGhpcykuZ2V0KCkucmV2ZXJzZSgpKS5lYWNoKC4uLmFyZ3YpO1xuXHRcdFx0XHR9O1xuXG5cdFx0XHRcdGxldCB1cmxfZGF0YSA9IHNlbGYucGFyc2VVcmwoZG9tLnVybC5ocmVmKTtcblxuXHRcdFx0XHRsZXQgZGF0YV9tZXRhID0gYXdhaXQgc2VsZi5fZ2V0X21ldGEodXJsLCBvcHRpb25zUnVudGltZSwge1xuXHRcdFx0XHRcdGRvbSxcblx0XHRcdFx0fSk7XG5cblx0XHRcdFx0bGV0IF9jYWNoZV9kYXRlcyA9IFtdO1xuXHRcdFx0XHRsZXQgdm9sdW1lX2xpc3QgPSBbXSBhcyBfTm92ZWxTaXRlLklWb2x1bWVbXTtcblxuXHRcdFx0XHRsZXQgY3VycmVudFZvbHVtZTogX05vdmVsU2l0ZS5JVm9sdW1lO1xuXG5cdFx0XHRcdGxldCBub3ZlbF92aXAgPSAwO1xuXG5cdFx0XHRcdGxldCB0YWJsZSA9ICQoJ2JvZHkgPiBjZW50ZXIgPiB0YWJsZSBjZW50ZXI6aGFzKGZvbnRbY29sb3I9XCIjRkYwMDAwXCJdKSA+IGNlbnRlciA+IHRhYmxlIHRkJyk7XG5cdFx0XHRcdHRhYmxlXG5cdFx0XHRcdFx0LmVhY2goZnVuY3Rpb24gKGluZGV4KVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdGxldCB0ciA9IGRvbS4kKHRoaXMpO1xuXG5cdFx0XHRcdFx0XHRsZXQgdGl0bGUgPSBub3ZlbFRleHQudHJpbSh0cmltKHRyLnRleHQoKSkpLnJlcGxhY2UoL17il44vLCAnJyk7XG5cblx0XHRcdFx0XHRcdGlmICh0aXRsZSAmJiB0ci5maW5kKCdhJykubGVuZ3RoID09IDApXG5cdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdGN1cnJlbnRWb2x1bWUgPSB2b2x1bWVfbGlzdFt2b2x1bWVfbGlzdC5sZW5ndGhdID0ge1xuXHRcdFx0XHRcdFx0XHRcdHZvbHVtZV9pbmRleDogdm9sdW1lX2xpc3QubGVuZ3RoLFxuXHRcdFx0XHRcdFx0XHRcdHZvbHVtZV90aXRsZTogdGl0bGUsXG5cdFx0XHRcdFx0XHRcdFx0Y2hhcHRlcl9saXN0OiBbXSxcblx0XHRcdFx0XHRcdFx0fTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdGVsc2UgaWYgKHRpdGxlICYmIHRyLmhhcygnYScpLmxlbmd0aClcblx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0dHIuZmluZCgnYTplcSgwKScpXG5cdFx0XHRcdFx0XHRcdFx0LmVhY2goZnVuY3Rpb24gKGluZGV4KVxuXHRcdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHRcdGxldCBhID0gZG9tLiQodGhpcyk7XG5cblx0XHRcdFx0XHRcdFx0XHRcdGxldCBocmVmID0gYS5wcm9wKCdocmVmJyk7XG5cblx0XHRcdFx0XHRcdFx0XHRcdGxldCBkYXRhID0gc2VsZi5wYXJzZVVybChocmVmKTtcblxuXHRcdFx0XHRcdFx0XHRcdFx0aWYgKCFkYXRhLmNoYXB0ZXJfaWQpXG5cdFx0XHRcdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdC8vY29uc29sZS5sb2coaHJlZiwgZGF0YSk7XG5cblx0XHRcdFx0XHRcdFx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKClcblx0XHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0XHRcdGVsc2Vcblx0XHRcdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0aHJlZiA9IHNlbGYubWFrZVVybChkYXRhKTtcblxuXHRcdFx0XHRcdFx0XHRcdFx0XHRkYXRhLnVybCA9IGhyZWY7XG5cdFx0XHRcdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdFx0XHRcdGxldCBjaGFwdGVyX3RpdGxlID0gdHJpbShhLnRleHQoKSk7XG5cblx0XHRcdFx0XHRcdFx0XHRcdGlmICghY2hhcHRlcl90aXRsZSlcblx0XHRcdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0Y29uc29sZS5sb2coaHJlZik7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdGNvbnNvbGUubG9nKGEpO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoKVxuXHRcdFx0XHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHRcdFx0XHRjdXJyZW50Vm9sdW1lXG5cdFx0XHRcdFx0XHRcdFx0XHRcdC5jaGFwdGVyX2xpc3Rcblx0XHRcdFx0XHRcdFx0XHRcdFx0LnB1c2goe1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdGNoYXB0ZXJfaW5kZXg6IGN1cnJlbnRWb2x1bWUuY2hhcHRlcl9saXN0Lmxlbmd0aCxcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRjaGFwdGVyX3RpdGxlLFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdGNoYXB0ZXJfaWQ6IGRhdGEuY2hhcHRlcl9pZCxcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRjaGFwdGVyX3VybDogaHJlZixcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRjaGFwdGVyX3VybF9kYXRhOiBkYXRhLFxuXHRcdFx0XHRcdFx0XHRcdFx0XHR9KVxuXHRcdFx0XHRcdFx0XHRcdFx0O1xuXHRcdFx0XHRcdFx0XHRcdH0pXG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fSlcblx0XHRcdFx0O1xuXG5cdFx0XHRcdGxldCBub3ZlbF9kYXRlO1xuXG5cdFx0XHRcdGlmIChfY2FjaGVfZGF0ZXMubGVuZ3RoKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0X2NhY2hlX2RhdGVzLnNvcnQoKTtcblxuXHRcdFx0XHRcdG5vdmVsX2RhdGUgPSBtb21lbnQudW5peChfY2FjaGVfZGF0ZXNbX2NhY2hlX2RhdGVzLmxlbmd0aCAtIDFdKS5sb2NhbCgpO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0cmV0dXJuIHtcblxuXHRcdFx0XHRcdHVybDogZG9tLnVybCxcblx0XHRcdFx0XHR1cmxfZGF0YSxcblxuXHRcdFx0XHRcdC4uLmRhdGFfbWV0YSxcblxuXHRcdFx0XHRcdHZvbHVtZV9saXN0LFxuXG5cdFx0XHRcdFx0Ly9ub3ZlbF9kYXRlLFxuXG5cdFx0XHRcdFx0Y2hlY2tkYXRlOiBtb21lbnQoKS5sb2NhbCgpLFxuXG5cdFx0XHRcdFx0aW1nczogW10gYXMgc3RyaW5nW10sXG5cdFx0XHRcdH0gYXMgSU5vdmVsO1xuXHRcdFx0fSlcblx0XHRcdC50YXAoZnVuY3Rpb24gKG5vdmVsKVxuXHRcdFx0e1xuXHRcdFx0XHRjb25zb2xlLmRpcihub3ZlbCwge1xuXHRcdFx0XHRcdGNvbG9yczogdHJ1ZSxcblx0XHRcdFx0XHQvL2RlcHRoOiAzLFxuXHRcdFx0XHR9KTtcblx0XHRcdH0pXG5cdFx0XHQ7XG5cdH1cblxuXHRwcm90ZWN0ZWQgYXN5bmMgX2dldF9tZXRhKGlucHV0VXJsLCBvcHRpb25zUnVudGltZSwgY2FjaGU6IHtcblx0XHRkb206IElKU0RPTSxcblx0fSlcblx0e1xuXHRcdGNvbnN0IHNlbGYgPSB0aGlzO1xuXG5cdFx0bGV0IHVybCA9IHRoaXMubWFrZVVybCh0aGlzLnBhcnNlVXJsKGlucHV0VXJsKSwgLTEpO1xuXG5cdFx0Ly9yZXR1cm4gZnJvbVVSTCh1cmwsIG9wdGlvbnNSdW50aW1lLm9wdGlvbnNKU0RPTSlcblx0XHRyZXR1cm4gUHJvbWlzZS5yZXNvbHZlKGNhY2hlLmRvbSlcblx0XHRcdC50aGVuKGZ1bmN0aW9uIChkb20pXG5cdFx0XHR7XG5cdFx0XHRcdGNvbnN0ICQgPSBkb20uJDtcblx0XHRcdFx0bGV0IGRhdGE6IElNZGNvbmZNZXRhID0ge307XG5cdFx0XHRcdGRhdGEubm92ZWwgPSB7fTtcblxuXHRcdFx0XHRsZXQgbm92ZWxfYXV0aG9yID0gdHJpbSgkKCd0aXRsZScpLnRleHQoKS5tYXRjaCgvXFwoKFteKCldKylcXClcXHMqJC8pWzFdKTtcblxuXHRcdFx0XHRsZXQgbm92ZWxfdGl0bGUgPSB0cmltKFxuXHRcdFx0XHRcdCQoJ2JvZHkgPiBjZW50ZXIgPiB0YWJsZSBjZW50ZXIgZm9udFtjb2xvcj1cIiNGRjAwMDBcIl0nKS50ZXh0KClcblx0XHRcdFx0KTtcblxuXHRcdFx0XHRsZXQgdXJsX2RhdGEgPSBzZWxmLnBhcnNlVXJsKHVybCk7XG5cblx0XHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0XHR1cmwsXG5cdFx0XHRcdFx0dXJsX2RhdGEsXG5cblx0XHRcdFx0XHQuLi5kYXRhLFxuXG5cdFx0XHRcdFx0bm92ZWxfdGl0bGUsXG5cblx0XHRcdFx0XHRub3ZlbF9hdXRob3IsXG5cblx0XHRcdFx0fTtcblx0XHRcdH0pXG5cdFx0XHQ7XG5cdH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgTm92ZWxTaXRlQ2xhc3M7XG4iXX0=