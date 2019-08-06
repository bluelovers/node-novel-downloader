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
const fetch_1 = require("../../fetch");
const strip_1 = require("../../strip");
const util_1 = require("../../util");
const index_1 = require("../index");
const base_1 = require("../demo/base");
const jsdom_url_1 = require("jsdom-url");
const index_2 = require("../index");
const novel_text_1 = require("novel-text");
const path = require("path");
const regexp_cjk_1 = require("regexp-cjk");
const jsdom_extra_1 = require("jsdom-extra");
//import escapeStringRegexp = require('escape-string-regexp');
let NovelSiteTpl = class NovelSiteTpl extends base_1.default {
    static check(url, options) {
        // @ts-ignore
        return /dmzj\.com/i.test(new jsdom_url_1.URL(url).hostname || '');
    }
    makeUrl(urlobj, bool) {
        let url;
        if (bool === 2 && urlobj.novel_id) {
            url = `http://q.dmzj.com/${urlobj.novel_id}/index.shtml`;
        }
        else if (!bool && urlobj.volume_id && urlobj.chapter_id) {
            url = `http://v2.api.dmzj.com/novel/download/${urlobj.novel_id}_${urlobj.volume_id}_${urlobj.chapter_id}.txt`;
        }
        else if (bool === true && urlobj.novel_id) {
            url = `http://v2.api.dmzj.com/novel/chapter/${urlobj.novel_id}.json`;
        }
        else {
            url = `http://v2.api.dmzj.com/novel/${urlobj.novel_id}.json`;
        }
        // @ts-ignore
        return new jsdom_url_1.URL(url);
    }
    parseUrl(url, options) {
        let urlobj = {
            url: url,
            novel_id: null,
            chapter_id: null,
            volume_id: null,
        };
        try {
            // @ts-ignore
            urlobj.url = new jsdom_url_1.URL(url);
            // @ts-ignore
            url = urlobj.url.href;
        }
        catch (e) {
            console.warn(e.toString() + ` "${url}"`);
        }
        let r = /api\.dmzj\.com\/novel\/(\d+).json/;
        let m = r.exec(url);
        if (m) {
            urlobj.novel_id = m[1];
            return urlobj;
        }
        r = /^(\d+)$/;
        if (m = r.exec(url)) {
            urlobj.novel_id = m[1];
            return urlobj;
        }
        r = /api\.dmzj\.com\/novel\/chapter\/(\d+).json/;
        if (m = r.exec(url)) {
            urlobj.novel_id = m[1];
            return urlobj;
        }
        r = /api\.dmzj\.com\/novel\/download\/(\d+)_(\d+)_(\d+).txt/;
        if (m = r.exec(url)) {
            urlobj.novel_id = m[1];
            urlobj.volume_id = m[2];
            urlobj.chapter_id = m[3];
            return urlobj;
        }
        // 手機版網址
        r = /(?:q\.dmzj\.com\/|^\/)(?:(\d+)\/(?:(\d+)\/(?:(\d+)[\._])?)?)/;
        if (m = r.exec(url)) {
            urlobj.novel_id = m[1];
            urlobj.volume_id = m[2];
            urlobj.chapter_id = m[3];
        }
        return urlobj;
    }
    session(optionsRuntime, url) {
        super.session(optionsRuntime, url);
        optionsRuntime.optionsJSDOM.requestOptions = optionsRuntime.optionsJSDOM.requestOptions || {};
        // @ts-ignore
        optionsRuntime.optionsJSDOM.requestOptions.contentType = 'json';
        //let url = optionsRuntime[SYMBOL_CACHE].url;
        optionsRuntime.optionsJSDOM.cookieJar;
        return this;
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
            //.replace(/^　　/gm, '')
            .replace(/^[\uFEFF\xA0]+/gm, '')
            // 修正每行開頭多出空白的問題
            .replace(/^ +/gm, '')
            .replace(/ +$/gm, '')
            .replace(/\s+$/, '');
    }
    _saveReadme(optionsRuntime, options = {}, ...opts) {
        options[this.IDKEY] = {
            novel_id: optionsRuntime[index_1.SYMBOL_CACHE].novel.novel_id,
        };
        return super._saveReadme(optionsRuntime, options, {
        //
        }, ...opts);
    }
    _parseChapter(ret, optionsRuntime, cache) {
        if (!ret) {
            return '';
        }
        let body_selector = 'body';
        try {
            //			let html = minifyHTML(ret.dom.$(body_selector).html());
            //
            //			//html = html.replace(/^(&nbsp;){4}/gm, '');
            //			html = html.replace(/^\s+|\s+$/g, '');
            //
            //			ret.dom.$(body_selector).html(html);
        }
        catch (e) {
        }
        let text;
        if (ret.dom) {
            text = ret.dom.$(body_selector).text();
        }
        else {
            ret.dom = jsdom_extra_1.createJSDOM(ret.body.toString());
            text = ret.dom.$(body_selector).text();
        }
        if (ret.dom && ret.dom.$ && ret.dom.$('img').length) {
            let $ = ret.dom.$;
            cache.chapter.imgs = cache.chapter.imgs || [];
            ret.dom.$('img[src]').each(function () {
                // @ts-ignore
                cache.chapter.imgs.push($(this).prop('src'));
                // @ts-ignore
                cache.novel.imgs.push($(this).prop('src'));
            });
        }
        text = this._stripContent(text);
        let sp = '[\u00a0 　]*';
        let r = new regexp_cjk_1.zhRegExp(`^[\u00a0 　\\s]*${util_1.escapeRegexp(cache.volume.volume_title)}${sp}${util_1.escapeRegexp(cache.chapter.chapter_title)}${sp}`, 'ig');
        text = text
            .replace(r, '');
        return text;
    }
    // @ts-ignore
    _createChapterUrl({ novel, volume, chapter, }, optionsRuntime) {
        // @ts-ignore
        return new jsdom_url_1.URL(chapter.chapter_url);
    }
    async get_volume_list(inputUrl, optionsRuntime = {}) {
        const self = this;
        let url = await this.createMainUrl(inputUrl);
        // @ts-ignore
        return fetch_1.retryRequest(url, optionsRuntime.requestOptions)
            .then(async function (dom) {
            const $ = dom.$;
            dom = JSON.parse(dom);
            let data_meta = await self._get_meta(url, optionsRuntime, {
                dom,
            });
            url = data_meta.url;
            let url_data = data_meta.url_data;
            let _cache_dates = [];
            let volume_list = [];
            let currentVolume;
            let table = dom;
            table.forEach(function (volumeData) {
                currentVolume = volume_list[volume_list.length] = {
                    volume_index: volume_list.length,
                    volume_title: novel_text_1.default.trim(volumeData.volume_name),
                    volume_is: volumeData.volume_id,
                    volume_order: volumeData.volume_order,
                    chapter_list: [],
                };
                volumeData.chapters.forEach(function (chapterData) {
                    let chapter_url = self.makeUrl({
                        chapter_id: chapterData.chapter_id,
                        novel_id: data_meta.novel_id,
                        volume_id: volumeData.volume_id,
                    });
                    let chapter_url_data = self.parseUrl(chapter_url);
                    currentVolume
                        .chapter_list
                        .push({
                        chapter_index: currentVolume.chapter_list.length,
                        chapter_title: novel_text_1.default.trim(chapterData.chapter_name),
                        chapter_id: chapterData.chapter_id,
                        chapter_order: chapterData.chapter_order,
                        chapter_url,
                        chapter_url_data,
                    });
                });
            });
            let novel_date;
            if (_cache_dates.length) {
                _cache_dates.sort();
                novel_date = index_2.moment.unix(_cache_dates[_cache_dates.length - 1]).local();
            }
            return Object.assign(Object.assign({ url,
                url_data }, data_meta), { volume_list, 
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
        let url = self.makeUrl(self.parseUrl(inputUrl), -1);
        let url_data = self.parseUrl(url);
        return fetch_1.retryRequest(url, optionsRuntime.requestOptions)
            //return fromURL(url, optionsRuntime.optionsJSDOM)
            //return Promise.resolve(cache.dom)
            .then(function (domJson) {
            domJson = JSON.parse(domJson);
            let data = {};
            data.novel = {};
            data.novel.tags = [];
            let novel_title = domJson.name;
            let novel_author = domJson.authors;
            domJson.types = domJson.types || [];
            domJson.types.forEach(function (s) {
                data.novel.tags.push(...s.split('\/'));
            });
            data.novel.tags.push(domJson.zone);
            //data.novel.tags.push(domJson.status);
            data.novel.status = domJson.status;
            let novel_cover = domJson.cover;
            let novel_desc = domJson.introduction;
            let novel_id = domJson.id;
            let novel_date = index_2.moment.unix(domJson.last_update_time).local();
            //console.log(domJson);
            let dmzj_api_json = domJson;
            let novel_url = self.makeUrl(url_data, 2);
            return Object.assign(Object.assign({ url: novel_url, url_data: self.parseUrl(novel_url), url_api: url, url_data_api: url_data }, data), { novel_url,
                novel_id,
                novel_title,
                novel_cover,
                novel_author,
                novel_desc,
                novel_date,
                dmzj_api_json });
        });
    }
};
NovelSiteTpl.IDKEY = path.basename(__dirname);
NovelSiteTpl = __decorate([
    index_1.staticImplements()
], NovelSiteTpl);
exports.NovelSiteTpl = NovelSiteTpl;
exports.default = NovelSiteTpl;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYXBpLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7R0FFRzs7Ozs7Ozs7QUFFSCx1Q0FBMkM7QUFDM0MsdUNBQTJDO0FBQzNDLHFDQUFtRjtBQUNuRixvQ0FBbUY7QUFJbkYsdUNBQXlDO0FBQ3pDLHlDQUFnQztBQUdoQyxvQ0FBa0M7QUFDbEMsMkNBQW1DO0FBQ25DLDZCQUE2QjtBQUU3QiwyQ0FBc0M7QUFDdEMsNkNBQXFFO0FBRXJFLDhEQUE4RDtBQUc5RCxJQUFhLFlBQVksR0FBekIsTUFBYSxZQUFhLFNBQVEsY0FBYTtJQUk5QyxNQUFNLENBQUMsS0FBSyxDQUFDLEdBQXdDLEVBQUUsT0FBUTtRQUU5RCxhQUFhO1FBQ2IsT0FBTyxZQUFZLENBQUMsSUFBSSxDQUFDLElBQUksZUFBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLFFBQVEsSUFBSSxFQUFFLENBQUMsQ0FBQztJQUN2RCxDQUFDO0lBRUQsT0FBTyxDQUFDLE1BQTRCLEVBQUUsSUFBdUI7UUFFNUQsSUFBSSxHQUFXLENBQUM7UUFFaEIsSUFBSSxJQUFJLEtBQUssQ0FBQyxJQUFJLE1BQU0sQ0FBQyxRQUFRLEVBQ2pDO1lBQ0MsR0FBRyxHQUFHLHFCQUFxQixNQUFNLENBQUMsUUFBUSxjQUFjLENBQUM7U0FDekQ7YUFDSSxJQUFJLENBQUMsSUFBSSxJQUFJLE1BQU0sQ0FBQyxTQUFTLElBQUksTUFBTSxDQUFDLFVBQVUsRUFDdkQ7WUFDQyxHQUFHLEdBQUcseUNBQXlDLE1BQU0sQ0FBQyxRQUFRLElBQUksTUFBTSxDQUFDLFNBQVMsSUFBSSxNQUFNLENBQUMsVUFBVSxNQUFNLENBQUM7U0FDOUc7YUFDSSxJQUFJLElBQUksS0FBSyxJQUFJLElBQUksTUFBTSxDQUFDLFFBQVEsRUFDekM7WUFDQyxHQUFHLEdBQUcsd0NBQXdDLE1BQU0sQ0FBQyxRQUFRLE9BQU8sQ0FBQztTQUNyRTthQUVEO1lBQ0MsR0FBRyxHQUFHLGdDQUFn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QyxFQUFFLENBQUM7WUFFMUIsSUFBSSxVQUFVLEdBQUcsY0FBTSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQztZQUUvRCx1QkFBdUI7WUFFdkIsSUFBSSxhQUFhLEdBQUcsT0FBTyxDQUFDO1lBRTVCLElBQUksU0FBUyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBRTFDLHFDQUNDLEdBQUcsRUFBRSxTQUFTLEVBQ2QsUUFBUSxFQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLEVBRWxDLE9BQU8sRUFBRSxHQUFHLEVBQ1osWUFBWSxFQUFFLFFBQVEsSUFFbkIsSUFBSSxLQUVQLFNBQVM7Z0JBRVQsUUFBUTtnQkFFUixXQUFXO2dCQUVYLFdBQVc7Z0JBRVgsWUFBWTtnQkFDWixVQUFVO2dCQUVWLFVBQVU7Z0JBRVYsYUFBYSxJQUVaO1FBQ0gsQ0FBQyxDQUFDLENBQ0Q7SUFDSCxDQUFDO0NBQ0QsQ0FBQTtBQXZhdUIsa0JBQUssR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxDQUFDO0FBRjVDLFlBQVk7SUFEeEIsd0JBQWdCLEVBQTZDO0dBQ2pELFlBQVksQ0F5YXhCO0FBemFZLG9DQUFZO0FBMmF6QixrQkFBZSxZQUFZLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENyZWF0ZWQgYnkgdXNlciBvbiAyMDE4LzMvMjUvMDI1LlxuICovXG5cbmltcG9ydCB7IHJldHJ5UmVxdWVzdCB9IGZyb20gJy4uLy4uL2ZldGNoJztcbmltcG9ydCB7IHN0cmlwQ29udGVudCB9IGZyb20gJy4uLy4uL3N0cmlwJztcbmltcG9ydCB7IGFycmF5X3VuaXF1ZSwgZXNjYXBlUmVnZXhwLCBpc1VuZGVmLCBtaW5pZnlIVE1MLCB0cmltIH0gZnJvbSAnLi4vLi4vdXRpbCc7XG5pbXBvcnQgX05vdmVsU2l0ZSwgeyBzdGF0aWNJbXBsZW1lbnRzLCBTWU1CT0xfQ0FDSEUsIElNZGNvbmZNZXRhIH0gZnJvbSAnLi4vaW5kZXgnO1xuaW1wb3J0IHsgSURvd25sb2FkT3B0aW9ucywgSU5vdmVsIH0gZnJvbSAnLi4vZGVtby9iYXNlJztcbmltcG9ydCB7IElGZXRjaENoYXB0ZXIsIElPcHRpb25zUnVudGltZSB9IGZyb20gJy4uL2RlbW8vYmFzZSc7XG5pbXBvcnQgKiBhcyBOb3ZlbFNpdGVEZW1vIGZyb20gJy4uL2RlbW8vYmFzZSc7XG5pbXBvcnQgTm92ZWxTaXRlQmFzZSBmcm9tICcuLi9kZW1vL2Jhc2UnO1xuaW1wb3J0IHsgVVJMIH0gZnJvbSAnanNkb20tdXJsJztcbmltcG9ydCB7IGZyb21VUkwsIElGcm9tVXJsT3B0aW9ucywgSUpTRE9NIH0gZnJvbSAnanNkb20tZXh0cmEnO1xuaW1wb3J0IHsgUHJvbWlzZUJsdWViaXJkLCBibHVlYmlyZERlY29yYXRvciB9IGZyb20gJy4uL2luZGV4JztcbmltcG9ydCB7IG1vbWVudCB9IGZyb20gJy4uL2luZGV4JztcbmltcG9ydCBub3ZlbFRleHQgZnJvbSAnbm92ZWwtdGV4dCc7XG5pbXBvcnQgKiBhcyBwYXRoIGZyb20gXCJwYXRoXCI7XG5pbXBvcnQgKiBhcyBTdHJVdGlsIGZyb20gJ3N0ci11dGlsJztcbmltcG9ydCB7IHpoUmVnRXhwIH0gZnJvbSAncmVnZXhwLWNqayc7XG5pbXBvcnQgeyByZXF1ZXN0VG9KU0RPTSwgcGFja0pTRE9NLCBjcmVhdGVKU0RPTSB9IGZyb20gJ2pzZG9tLWV4dHJhJztcblxuLy9pbXBvcnQgZXNjYXBlU3RyaW5nUmVnZXhwID0gcmVxdWlyZSgnZXNjYXBlLXN0cmluZy1yZWdleHAnKTtcblxuQHN0YXRpY0ltcGxlbWVudHM8X05vdmVsU2l0ZS5JTm92ZWxTaXRlU3RhdGljPE5vdmVsU2l0ZVRwbD4+KClcbmV4cG9ydCBjbGFzcyBOb3ZlbFNpdGVUcGwgZXh0ZW5kcyBOb3ZlbFNpdGVCYXNlXG57XG5cdHB1YmxpYyBzdGF0aWMgcmVhZG9ubHkgSURLRVkgPSBwYXRoLmJhc2VuYW1lKF9fZGlybmFtZSk7XG5cblx0c3RhdGljIGNoZWNrKHVybDogc3RyaW5nIHwgVVJMIHwgX05vdmVsU2l0ZS5JUGFyc2VVcmwsIG9wdGlvbnM/KTogYm9vbGVhblxuXHR7XG5cdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdHJldHVybiAvZG16alxcLmNvbS9pLnRlc3QobmV3IFVSTCh1cmwpLmhvc3RuYW1lIHx8ICcnKTtcblx0fVxuXG5cdG1ha2VVcmwodXJsb2JqOiBfTm92ZWxTaXRlLklQYXJzZVVybCwgYm9vbD86IGJvb2xlYW4gfCBudW1iZXIpOiBVUkxcblx0e1xuXHRcdGxldCB1cmw6IHN0cmluZztcblxuXHRcdGlmIChib29sID09PSAyICYmIHVybG9iai5ub3ZlbF9pZClcblx0XHR7XG5cdFx0XHR1cmwgPSBgaHR0cDovL3EuZG16ai5jb20vJHt1cmxvYmoubm92ZWxfaWR9L2luZGV4LnNodG1sYDtcblx0XHR9XG5cdFx0ZWxzZSBpZiAoIWJvb2wgJiYgdXJsb2JqLnZvbHVtZV9pZCAmJiB1cmxvYmouY2hhcHRlcl9pZClcblx0XHR7XG5cdFx0XHR1cmwgPSBgaHR0cDovL3YyLmFwaS5kbXpqLmNvbS9ub3ZlbC9kb3dubG9hZC8ke3VybG9iai5ub3ZlbF9pZH1fJHt1cmxvYmoudm9sdW1lX2lkfV8ke3VybG9iai5jaGFwdGVyX2lkfS50eHRgO1xuXHRcdH1cblx0XHRlbHNlIGlmIChib29sID09PSB0cnVlICYmIHVybG9iai5ub3ZlbF9pZClcblx0XHR7XG5cdFx0XHR1cmwgPSBgaHR0cDovL3YyLmFwaS5kbXpqLmNvbS9ub3ZlbC9jaGFwdGVyLyR7dXJsb2JqLm5vdmVsX2lkfS5qc29uYDtcblx0XHR9XG5cdFx0ZWxzZVxuXHRcdHtcblx0XHRcdHVybCA9IGBodHRwOi8vdjIuYXBpLmRtemouY29tL25vdmVsLyR7dXJsb2JqLm5vdmVsX2lkfS5qc29uYDtcblx0XHR9XG5cblx0XHQvLyBAdHMtaWdub3JlXG5cdFx0cmV0dXJuIG5ldyBVUkwodXJsKTtcblx0fVxuXG5cdHBhcnNlVXJsKHVybDogVVJMIHwgc3RyaW5nLCBvcHRpb25zPyk6IF9Ob3ZlbFNpdGUuSVBhcnNlVXJsXG5cdHtcblx0XHRsZXQgdXJsb2JqID0ge1xuXHRcdFx0dXJsOiB1cmwsXG5cblx0XHRcdG5vdmVsX2lkOiBudWxsLFxuXHRcdFx0Y2hhcHRlcl9pZDogbnVsbCxcblxuXHRcdFx0dm9sdW1lX2lkOiBudWxsLFxuXHRcdH07XG5cblx0XHR0cnlcblx0XHR7XG5cdFx0XHQvLyBAdHMtaWdub3JlXG5cdFx0XHR1cmxvYmoudXJsID0gbmV3IFVSTCh1cmwpO1xuXHRcdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdFx0dXJsID0gdXJsb2JqLnVybC5ocmVmO1xuXHRcdH1cblx0XHRjYXRjaCAoZSlcblx0XHR7XG5cdFx0XHRjb25zb2xlLndhcm4oZS50b1N0cmluZygpICsgYCBcIiR7dXJsfVwiYCk7XG5cdFx0fVxuXG5cdFx0bGV0IHIgPSAvYXBpXFwuZG16alxcLmNvbVxcL25vdmVsXFwvKFxcZCspLmpzb24vO1xuXG5cdFx0bGV0IG0gPSByLmV4ZWModXJsIGFzIHN0cmluZyk7XG5cdFx0aWYgKG0pXG5cdFx0e1xuXHRcdFx0dXJsb2JqLm5vdmVsX2lkID0gbVsxXTtcblxuXHRcdFx0cmV0dXJuIHVybG9iajtcblx0XHR9XG5cblx0XHRyID0gL14oXFxkKykkLztcblx0XHRpZiAobSA9IHIuZXhlYyh1cmwgYXMgc3RyaW5nKSlcblx0XHR7XG5cdFx0XHR1cmxvYmoubm92ZWxfaWQgPSBtWzFdO1xuXG5cdFx0XHRyZXR1cm4gdXJsb2JqO1xuXHRcdH1cblxuXHRcdHIgPSAvYXBpXFwuZG16alxcLmNvbVxcL25vdmVsXFwvY2hhcHRlclxcLyhcXGQrKS5qc29uLztcblx0XHRpZiAobSA9IHIuZXhlYyh1cmwgYXMgc3RyaW5nKSlcblx0XHR7XG5cdFx0XHR1cmxvYmoubm92ZWxfaWQgPSBtWzFdO1xuXG5cdFx0XHRyZXR1cm4gdXJsb2JqO1xuXHRcdH1cblxuXHRcdHIgPSAvYXBpXFwuZG16alxcLmNvbVxcL25vdmVsXFwvZG93bmxvYWRcXC8oXFxkKylfKFxcZCspXyhcXGQrKS50eHQvO1xuXHRcdGlmIChtID0gci5leGVjKHVybCBhcyBzdHJpbmcpKVxuXHRcdHtcblx0XHRcdHVybG9iai5ub3ZlbF9pZCA9IG1bMV07XG5cdFx0XHR1cmxvYmoudm9sdW1lX2lkID0gbVsyXTtcblx0XHRcdHVybG9iai5jaGFwdGVyX2lkID0gbVszXTtcblxuXHRcdFx0cmV0dXJuIHVybG9iajtcblx0XHR9XG5cblx0XHQvLyDmiYvmqZ/niYjntrLlnYBcblx0XHRyID0gLyg/OnFcXC5kbXpqXFwuY29tXFwvfF5cXC8pKD86KFxcZCspXFwvKD86KFxcZCspXFwvKD86KFxcZCspW1xcLl9dKT8pPykvO1xuXHRcdGlmIChtID0gci5leGVjKHVybCBhcyBzdHJpbmcpKVxuXHRcdHtcblx0XHRcdHVybG9iai5ub3ZlbF9pZCA9IG1bMV07XG5cdFx0XHR1cmxvYmoudm9sdW1lX2lkID0gbVsyXTtcblx0XHRcdHVybG9iai5jaGFwdGVyX2lkID0gbVszXTtcblx0XHR9XG5cblx0XHRyZXR1cm4gdXJsb2JqO1xuXHR9XG5cblx0c2Vzc2lvbjxUID0gSU9wdGlvbnNSdW50aW1lPihvcHRpb25zUnVudGltZTogUGFydGlhbDxUICYgSURvd25sb2FkT3B0aW9ucz4sIHVybDogVVJMKVxuXHR7XG5cdFx0c3VwZXIuc2Vzc2lvbihvcHRpb25zUnVudGltZSwgdXJsKTtcblxuXHRcdG9wdGlvbnNSdW50aW1lLm9wdGlvbnNKU0RPTS5yZXF1ZXN0T3B0aW9ucyA9IG9wdGlvbnNSdW50aW1lLm9wdGlvbnNKU0RPTS5yZXF1ZXN0T3B0aW9ucyB8fCB7fTtcblxuXHRcdC8vIEB0cy1pZ25vcmVcblx0XHRvcHRpb25zUnVudGltZS5vcHRpb25zSlNET00ucmVxdWVzdE9wdGlvbnMuY29udGVudFR5cGUgPSAnanNvbic7XG5cblx0XHQvL2xldCB1cmwgPSBvcHRpb25zUnVudGltZVtTWU1CT0xfQ0FDSEVdLnVybDtcblxuXHRcdG9wdGlvbnNSdW50aW1lLm9wdGlvbnNKU0RPTS5jb29raWVKYXJcblx0XHQvLy5zZXRDb29raWVTeW5jKCdvdmVyMTg9eWVzOyBEb21haW49LnN5b3NldHUuY29tOyBQYXRoPS8nLCB1cmwuaHJlZilcblx0XHQ7XG5cblx0XHRyZXR1cm4gdGhpcztcblx0fVxuXG5cdGNyZWF0ZU1haW5VcmwodXJsKVxuXHR7XG5cdFx0bGV0IGRhdGEgPSB0aGlzLnBhcnNlVXJsKHVybCk7XG5cblx0XHRpZiAoIWRhdGEgfHwgIWRhdGEubm92ZWxfaWQpXG5cdFx0e1xuXHRcdFx0Y29uc29sZS5sb2coZGF0YSk7XG5cblx0XHRcdHRocm93IG5ldyBSZWZlcmVuY2VFcnJvcigpO1xuXHRcdH1cblxuXHRcdGxldCByZXQgPSB0aGlzLm1ha2VVcmwoZGF0YSwgdHJ1ZSk7XG5cblx0XHRyZXR1cm4gcmV0O1xuXHR9XG5cblx0X3N0cmlwQ29udGVudCh0ZXh0OiBzdHJpbmcpXG5cdHtcblx0XHR0ZXh0ID0gc3RyaXBDb250ZW50KHRleHQpO1xuXG5cdFx0Ly9wcm9jZXNzLmV4aXQoKTtcblxuXHRcdHJldHVybiB0ZXh0XG5cdFx0XHQvLy5yZXBsYWNlKC9e44CA44CAL2dtLCAnJylcblx0XHRcdC5yZXBsYWNlKC9eW1xcdUZFRkZcXHhBMF0rL2dtLCAnJylcblx0XHRcdC8vIOS/ruato+avj+ihjOmWi+mgreWkmuWHuuepuueZveeahOWVj+mhjFxuXHRcdFx0LnJlcGxhY2UoL14gKy9nbSwgJycpXG5cdFx0XHQucmVwbGFjZSgvICskL2dtLCAnJylcblx0XHRcdC5yZXBsYWNlKC9cXHMrJC8sICcnKVxuXHRcdDtcblx0fVxuXG5cdHByb3RlY3RlZCBfc2F2ZVJlYWRtZShvcHRpb25zUnVudGltZTogSU9wdGlvbnNSdW50aW1lLCBvcHRpb25zID0ge30sIC4uLm9wdHMpXG5cdHtcblx0XHRvcHRpb25zW3RoaXMuSURLRVldID0ge1xuXHRcdFx0bm92ZWxfaWQ6IG9wdGlvbnNSdW50aW1lW1NZTUJPTF9DQUNIRV0ubm92ZWwubm92ZWxfaWQsXG5cdFx0fTtcblxuXHRcdHJldHVybiBzdXBlci5fc2F2ZVJlYWRtZShvcHRpb25zUnVudGltZSwgb3B0aW9ucywge1xuXHRcdFx0Ly9cblx0XHR9LCAuLi5vcHRzKTtcblx0fVxuXG5cdHByb3RlY3RlZCBfcGFyc2VDaGFwdGVyPFQ+KHJldDogSUZldGNoQ2hhcHRlciwgb3B0aW9uc1J1bnRpbWU6IFQgJiBJT3B0aW9uc1J1bnRpbWUsIGNhY2hlKTogc3RyaW5nXG5cdHtcblx0XHRpZiAoIXJldClcblx0XHR7XG5cdFx0XHRyZXR1cm4gJyc7XG5cdFx0fVxuXG5cdFx0bGV0IGJvZHlfc2VsZWN0b3IgPSAnYm9keSc7XG5cblx0XHR0cnlcblx0XHR7XG4vL1x0XHRcdGxldCBodG1sID0gbWluaWZ5SFRNTChyZXQuZG9tLiQoYm9keV9zZWxlY3RvcikuaHRtbCgpKTtcbi8vXG4vL1x0XHRcdC8vaHRtbCA9IGh0bWwucmVwbGFjZSgvXigmbmJzcDspezR9L2dtLCAnJyk7XG4vL1x0XHRcdGh0bWwgPSBodG1sLnJlcGxhY2UoL15cXHMrfFxccyskL2csICcnKTtcbi8vXG4vL1x0XHRcdHJldC5kb20uJChib2R5X3NlbGVjdG9yKS5odG1sKGh0bWwpO1xuXHRcdH1cblx0XHRjYXRjaCAoZSlcblx0XHR7XG5cblx0XHR9XG5cblx0XHRsZXQgdGV4dDogc3RyaW5nO1xuXG5cdFx0aWYgKHJldC5kb20pXG5cdFx0e1xuXHRcdFx0dGV4dCA9IHJldC5kb20uJChib2R5X3NlbGVjdG9yKS50ZXh0KCk7XG5cdFx0fVxuXHRcdGVsc2Vcblx0XHR7XG5cdFx0XHRyZXQuZG9tID0gY3JlYXRlSlNET00ocmV0LmJvZHkudG9TdHJpbmcoKSk7XG5cblx0XHRcdHRleHQgPSByZXQuZG9tLiQoYm9keV9zZWxlY3RvcikudGV4dCgpO1xuXHRcdH1cblxuXHRcdGlmIChyZXQuZG9tICYmIHJldC5kb20uJCAmJiByZXQuZG9tLiQoJ2ltZycpLmxlbmd0aClcblx0XHR7XG5cdFx0XHRsZXQgJCA9IHJldC5kb20uJDtcblxuXHRcdFx0Y2FjaGUuY2hhcHRlci5pbWdzID0gY2FjaGUuY2hhcHRlci5pbWdzIHx8IFtdO1xuXG5cdFx0XHRyZXQuZG9tLiQoJ2ltZ1tzcmNdJykuZWFjaChmdW5jdGlvbiAoKVxuXHRcdFx0e1xuXHRcdFx0XHQvLyBAdHMtaWdub3JlXG5cdFx0XHRcdGNhY2hlLmNoYXB0ZXIuaW1ncy5wdXNoKCQodGhpcykucHJvcCgnc3JjJykpO1xuXHRcdFx0XHQvLyBAdHMtaWdub3JlXG5cdFx0XHRcdGNhY2hlLm5vdmVsLmltZ3MucHVzaCgkKHRoaXMpLnByb3AoJ3NyYycpKTtcblx0XHRcdH0pO1xuXHRcdH1cblxuXHRcdHRleHQgPSB0aGlzLl9zdHJpcENvbnRlbnQodGV4dCk7XG5cblx0XHRsZXQgc3AgPSAnW1xcdTAwYTAg44CAXSonO1xuXG5cdFx0bGV0IHIgPSBuZXcgemhSZWdFeHAoYF5bXFx1MDBhMCDjgIBcXFxcc10qJHtlc2NhcGVSZWdleHAoY2FjaGUudm9sdW1lLnZvbHVtZV90aXRsZSl9JHtzcH0ke2VzY2FwZVJlZ2V4cChjYWNoZS5jaGFwdGVyLmNoYXB0ZXJfdGl0bGUpfSR7c3B9YCwgJ2lnJyk7XG5cblx0XHR0ZXh0ID0gdGV4dFxuXHRcdFx0LnJlcGxhY2UociwgJycpXG5cdFx0O1xuXG5cdFx0cmV0dXJuIHRleHQ7XG5cdH1cblxuXHQvLyBAdHMtaWdub3JlXG5cdF9jcmVhdGVDaGFwdGVyVXJsPFQgPSBJT3B0aW9uc1J1bnRpbWU+KHtcblx0XHRub3ZlbCxcblx0XHR2b2x1bWUsXG5cdFx0Y2hhcHRlcixcblx0fSwgb3B0aW9uc1J1bnRpbWU/KVxuXHR7XG5cdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdHJldHVybiBuZXcgVVJMKGNoYXB0ZXIuY2hhcHRlcl91cmwpO1xuXHR9XG5cblx0YXN5bmMgZ2V0X3ZvbHVtZV9saXN0PFQgPSBJT3B0aW9uc1J1bnRpbWU+KGlucHV0VXJsOiBzdHJpbmcgfCBVUkwsXG5cdFx0b3B0aW9uc1J1bnRpbWU6IFBhcnRpYWw8VCAmIElEb3dubG9hZE9wdGlvbnM+ID0ge31cblx0KTogUHJvbWlzZTxJTm92ZWw+XG5cdHtcblx0XHRjb25zdCBzZWxmID0gdGhpcztcblx0XHRsZXQgdXJsID0gYXdhaXQgdGhpcy5jcmVhdGVNYWluVXJsKGlucHV0VXJsKTtcblxuXHRcdC8vIEB0cy1pZ25vcmVcblx0XHRyZXR1cm4gcmV0cnlSZXF1ZXN0KHVybCwgb3B0aW9uc1J1bnRpbWUucmVxdWVzdE9wdGlvbnMpXG5cdFx0XHQudGhlbihhc3luYyBmdW5jdGlvbiAoZG9tKVxuXHRcdFx0e1xuXHRcdFx0XHRjb25zdCAkID0gZG9tLiQ7XG5cblx0XHRcdFx0ZG9tID0gSlNPTi5wYXJzZShkb20gYXMgc3RyaW5nKTtcblxuXHRcdFx0XHRsZXQgZGF0YV9tZXRhID0gYXdhaXQgc2VsZi5fZ2V0X21ldGEodXJsLCBvcHRpb25zUnVudGltZSwge1xuXHRcdFx0XHRcdGRvbSxcblx0XHRcdFx0fSk7XG5cblx0XHRcdFx0dXJsID0gZGF0YV9tZXRhLnVybDtcblx0XHRcdFx0bGV0IHVybF9kYXRhID0gZGF0YV9tZXRhLnVybF9kYXRhO1xuXG5cdFx0XHRcdGxldCBfY2FjaGVfZGF0ZXMgPSBbXTtcblx0XHRcdFx0bGV0IHZvbHVtZV9saXN0ID0gW10gYXMgX05vdmVsU2l0ZS5JVm9sdW1lW107XG5cblx0XHRcdFx0bGV0IGN1cnJlbnRWb2x1bWU6IF9Ob3ZlbFNpdGUuSVZvbHVtZTtcblxuXHRcdFx0XHRsZXQgdGFibGUgPSBkb207XG5cblx0XHRcdFx0dGFibGUuZm9yRWFjaChmdW5jdGlvbiAodm9sdW1lRGF0YToge1xuXHRcdFx0XHRcdHZvbHVtZV9pZDogbnVtYmVyLFxuXHRcdFx0XHRcdGlkOiBudW1iZXIsXG5cdFx0XHRcdFx0dm9sdW1lX25hbWU6IHN0cmluZyxcblx0XHRcdFx0XHR2b2x1bWVfb3JkZXI6IG51bWJlcixcblx0XHRcdFx0XHRjaGFwdGVyczoge1xuXHRcdFx0XHRcdFx0Y2hhcHRlcl9pZDogbnVtYmVyLFxuXHRcdFx0XHRcdFx0Y2hhcHRlcl9uYW1lOiBzdHJpbmcsXG5cdFx0XHRcdFx0XHRjaGFwdGVyX29yZGVyOiBudW1iZXIsXG5cdFx0XHRcdFx0fVtdLFxuXHRcdFx0XHR9KVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0Y3VycmVudFZvbHVtZSA9IHZvbHVtZV9saXN0W3ZvbHVtZV9saXN0Lmxlbmd0aF0gPSB7XG5cdFx0XHRcdFx0XHR2b2x1bWVfaW5kZXg6IHZvbHVtZV9saXN0Lmxlbmd0aCxcblx0XHRcdFx0XHRcdHZvbHVtZV90aXRsZTogbm92ZWxUZXh0LnRyaW0odm9sdW1lRGF0YS52b2x1bWVfbmFtZSksXG5cdFx0XHRcdFx0XHR2b2x1bWVfaXM6IHZvbHVtZURhdGEudm9sdW1lX2lkLFxuXHRcdFx0XHRcdFx0dm9sdW1lX29yZGVyOiB2b2x1bWVEYXRhLnZvbHVtZV9vcmRlcixcblx0XHRcdFx0XHRcdGNoYXB0ZXJfbGlzdDogW10sXG5cdFx0XHRcdFx0fTtcblxuXHRcdFx0XHRcdHZvbHVtZURhdGEuY2hhcHRlcnMuZm9yRWFjaChmdW5jdGlvbiAoY2hhcHRlckRhdGEpXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0bGV0IGNoYXB0ZXJfdXJsID0gc2VsZi5tYWtlVXJsKHtcblx0XHRcdFx0XHRcdFx0Y2hhcHRlcl9pZDogY2hhcHRlckRhdGEuY2hhcHRlcl9pZCxcblx0XHRcdFx0XHRcdFx0bm92ZWxfaWQ6IGRhdGFfbWV0YS5ub3ZlbF9pZCxcblx0XHRcdFx0XHRcdFx0dm9sdW1lX2lkOiB2b2x1bWVEYXRhLnZvbHVtZV9pZCxcblx0XHRcdFx0XHRcdH0pO1xuXG5cdFx0XHRcdFx0XHRsZXQgY2hhcHRlcl91cmxfZGF0YSA9IHNlbGYucGFyc2VVcmwoY2hhcHRlcl91cmwpO1xuXG5cdFx0XHRcdFx0XHRjdXJyZW50Vm9sdW1lXG5cdFx0XHRcdFx0XHRcdC5jaGFwdGVyX2xpc3Rcblx0XHRcdFx0XHRcdFx0LnB1c2goe1xuXHRcdFx0XHRcdFx0XHRcdGNoYXB0ZXJfaW5kZXg6IGN1cnJlbnRWb2x1bWUuY2hhcHRlcl9saXN0Lmxlbmd0aCxcblx0XHRcdFx0XHRcdFx0XHRjaGFwdGVyX3RpdGxlOiBub3ZlbFRleHQudHJpbShjaGFwdGVyRGF0YS5jaGFwdGVyX25hbWUpLFxuXHRcdFx0XHRcdFx0XHRcdGNoYXB0ZXJfaWQ6IGNoYXB0ZXJEYXRhLmNoYXB0ZXJfaWQsXG5cdFx0XHRcdFx0XHRcdFx0Y2hhcHRlcl9vcmRlcjogY2hhcHRlckRhdGEuY2hhcHRlcl9vcmRlcixcblx0XHRcdFx0XHRcdFx0XHRjaGFwdGVyX3VybCxcblx0XHRcdFx0XHRcdFx0XHRjaGFwdGVyX3VybF9kYXRhLFxuXHRcdFx0XHRcdFx0XHR9KVxuXHRcdFx0XHRcdFx0O1xuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHR9KTtcblxuXHRcdFx0XHRsZXQgbm92ZWxfZGF0ZTtcblxuXHRcdFx0XHRpZiAoX2NhY2hlX2RhdGVzLmxlbmd0aClcblx0XHRcdFx0e1xuXHRcdFx0XHRcdF9jYWNoZV9kYXRlcy5zb3J0KCk7XG5cblx0XHRcdFx0XHRub3ZlbF9kYXRlID0gbW9tZW50LnVuaXgoX2NhY2hlX2RhdGVzW19jYWNoZV9kYXRlcy5sZW5ndGggLSAxXSkubG9jYWwoKTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdHJldHVybiB7XG5cblx0XHRcdFx0XHR1cmwsXG5cdFx0XHRcdFx0dXJsX2RhdGEsXG5cblx0XHRcdFx0XHQuLi5kYXRhX21ldGEsXG5cblx0XHRcdFx0XHR2b2x1bWVfbGlzdCxcblxuXHRcdFx0XHRcdC8vbm92ZWxfZGF0ZSxcblxuXHRcdFx0XHRcdGNoZWNrZGF0ZTogbW9tZW50KCkubG9jYWwoKSxcblxuXHRcdFx0XHRcdGltZ3M6IFtdIGFzIHN0cmluZ1tdLFxuXHRcdFx0XHR9IGFzIElOb3ZlbDtcblx0XHRcdH0pXG5cdFx0XHQudGFwKGZ1bmN0aW9uIChub3ZlbClcblx0XHRcdHtcblx0XHRcdFx0Y29uc29sZS5kaXIobm92ZWwsIHtcblx0XHRcdFx0XHRjb2xvcnM6IHRydWUsXG5cdFx0XHRcdFx0Ly9kZXB0aDogMyxcblx0XHRcdFx0fSk7XG5cdFx0XHR9KVxuXHRcdFx0O1xuXHR9XG5cblx0cHJvdGVjdGVkIGFzeW5jIF9nZXRfbWV0YShpbnB1dFVybCwgb3B0aW9uc1J1bnRpbWUsIGNhY2hlOiB7XG5cdFx0ZG9tOiBJSlNET00sXG5cdH0pXG5cdHtcblx0XHRjb25zdCBzZWxmID0gdGhpcztcblxuXHRcdGxldCB1cmwgPSBzZWxmLm1ha2VVcmwoc2VsZi5wYXJzZVVybChpbnB1dFVybCksIC0xKTtcblx0XHRsZXQgdXJsX2RhdGEgPSBzZWxmLnBhcnNlVXJsKHVybCk7XG5cblx0XHRyZXR1cm4gcmV0cnlSZXF1ZXN0KHVybCwgb3B0aW9uc1J1bnRpbWUucmVxdWVzdE9wdGlvbnMpXG5cdFx0Ly9yZXR1cm4gZnJvbVVSTCh1cmwsIG9wdGlvbnNSdW50aW1lLm9wdGlvbnNKU0RPTSlcblx0XHQvL3JldHVybiBQcm9taXNlLnJlc29sdmUoY2FjaGUuZG9tKVxuXHRcdFx0LnRoZW4oZnVuY3Rpb24gKGRvbUpzb24pXG5cdFx0XHR7XG5cdFx0XHRcdGRvbUpzb24gPSBKU09OLnBhcnNlKGRvbUpzb24gYXMgc3RyaW5nKTtcblxuXHRcdFx0XHRsZXQgZGF0YTogSU1kY29uZk1ldGEgPSB7fTtcblx0XHRcdFx0ZGF0YS5ub3ZlbCA9IHt9O1xuXHRcdFx0XHRkYXRhLm5vdmVsLnRhZ3MgPSBbXTtcblxuXHRcdFx0XHRsZXQgbm92ZWxfdGl0bGUgPSBkb21Kc29uLm5hbWU7XG5cdFx0XHRcdGxldCBub3ZlbF9hdXRob3IgPSBkb21Kc29uLmF1dGhvcnM7XG5cblx0XHRcdFx0ZG9tSnNvbi50eXBlcyA9IGRvbUpzb24udHlwZXMgfHwgW107XG5cdFx0XHRcdGRvbUpzb24udHlwZXMuZm9yRWFjaChmdW5jdGlvbiAocylcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGRhdGEubm92ZWwudGFncy5wdXNoKC4uLnMuc3BsaXQoJ1xcLycpKVxuXHRcdFx0XHR9KTtcblxuXHRcdFx0XHRkYXRhLm5vdmVsLnRhZ3MucHVzaChkb21Kc29uLnpvbmUpO1xuXHRcdFx0XHQvL2RhdGEubm92ZWwudGFncy5wdXNoKGRvbUpzb24uc3RhdHVzKTtcblxuXHRcdFx0XHRkYXRhLm5vdmVsLnN0YXR1cyA9IGRvbUpzb24uc3RhdHVzO1xuXG5cdFx0XHRcdGxldCBub3ZlbF9jb3ZlciA9IGRvbUpzb24uY292ZXI7XG5cdFx0XHRcdGxldCBub3ZlbF9kZXNjID0gZG9tSnNvbi5pbnRyb2R1Y3Rpb247XG5cblx0XHRcdFx0bGV0IG5vdmVsX2lkID0gZG9tSnNvbi5pZDtcblxuXHRcdFx0XHRsZXQgbm92ZWxfZGF0ZSA9IG1vbWVudC51bml4KGRvbUpzb24ubGFzdF91cGRhdGVfdGltZSkubG9jYWwoKTtcblxuXHRcdFx0XHQvL2NvbnNvbGUubG9nKGRvbUpzb24pO1xuXG5cdFx0XHRcdGxldCBkbXpqX2FwaV9qc29uID0gZG9tSnNvbjtcblxuXHRcdFx0XHRsZXQgbm92ZWxfdXJsID0gc2VsZi5tYWtlVXJsKHVybF9kYXRhLCAyKTtcblxuXHRcdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHRcdHVybDogbm92ZWxfdXJsLFxuXHRcdFx0XHRcdHVybF9kYXRhOiBzZWxmLnBhcnNlVXJsKG5vdmVsX3VybCksXG5cblx0XHRcdFx0XHR1cmxfYXBpOiB1cmwsXG5cdFx0XHRcdFx0dXJsX2RhdGFfYXBpOiB1cmxfZGF0YSxcblxuXHRcdFx0XHRcdC4uLmRhdGEsXG5cblx0XHRcdFx0XHRub3ZlbF91cmwsXG5cblx0XHRcdFx0XHRub3ZlbF9pZCxcblxuXHRcdFx0XHRcdG5vdmVsX3RpdGxlLFxuXG5cdFx0XHRcdFx0bm92ZWxfY292ZXIsXG5cblx0XHRcdFx0XHRub3ZlbF9hdXRob3IsXG5cdFx0XHRcdFx0bm92ZWxfZGVzYyxcblxuXHRcdFx0XHRcdG5vdmVsX2RhdGUsXG5cblx0XHRcdFx0XHRkbXpqX2FwaV9qc29uLFxuXG5cdFx0XHRcdH07XG5cdFx0XHR9KVxuXHRcdFx0O1xuXHR9XG59XG5cbmV4cG9ydCBkZWZhdWx0IE5vdmVsU2l0ZVRwbDtcbiJdfQ==