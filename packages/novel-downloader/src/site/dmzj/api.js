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
                cache.chapter.imgs.push($(this).prop('src'));
                cache.novel.imgs.push($(this).prop('src'));
            });
        }
        text = this._stripContent(text);
        let sp = '[  　]*';
        let r = new regexp_cjk_1.zhRegExp(`^[  　\\s]*${util_1.escapeRegexp(cache.volume.volume_title)}${sp}${util_1.escapeRegexp(cache.chapter.chapter_title)}${sp}`, 'ig');
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
        return await fetch_1.retryRequest(url, optionsRuntime.requestOptions)
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
            return Object.assign({ url,
                url_data }, data_meta, { volume_list, 
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
            return Object.assign({ url: novel_url, url_data: self.parseUrl(novel_url), url_api: url, url_data_api: url_data }, data, { novel_url,
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYXBpLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7R0FFRzs7Ozs7Ozs7QUFFSCx1Q0FBMkM7QUFDM0MsdUNBQTJDO0FBQzNDLHFDQUFtRjtBQUNuRixvQ0FBbUY7QUFJbkYsdUNBQXlDO0FBQ3pDLHlDQUFnQztBQUdoQyxvQ0FBa0M7QUFDbEMsMkNBQW1DO0FBQ25DLDZCQUE2QjtBQUU3QiwyQ0FBc0M7QUFDdEMsNkNBQXFFO0FBRXJFLDhEQUE4RDtBQUc5RCxJQUFhLFlBQVksR0FBekIsTUFBYSxZQUFhLFNBQVEsY0FBYTtJQUk5QyxPQUFPLENBQUMsTUFBNEIsRUFBRSxJQUF1QjtRQUU1RCxJQUFJLEdBQVcsQ0FBQztRQUVoQixJQUFJLElBQUksS0FBSyxDQUFDLElBQUksTUFBTSxDQUFDLFFBQVEsRUFDakM7WUFDQyxHQUFHLEdBQUcscUJBQXFCLE1BQU0sQ0FBQyxRQUFRLGNBQWMsQ0FBQztTQUN6RDthQUNJLElBQUksQ0FBQyxJQUFJLElBQUksTUFBTSxDQUFDLFNBQVMsSUFBSSxNQUFNLENBQUMsVUFBVSxFQUN2RDtZQUNDLEdBQUcsR0FBRyx5Q0FBeUMsTUFBTSxDQUFDLFFBQVEsSUFBSSxNQUFNLENBQUMsU0FBUyxJQUFJLE1BQU0sQ0FBQyxVQUFVLE1BQU0sQ0FBQztTQUM5RzthQUNJLElBQUksSUFBSSxLQUFLLElBQUksSUFBSSxNQUFNLENBQUMsUUFBUSxFQUN6QztZQUNDLEdBQUcsR0FBRyx3Q0FBd0MsTUFBTSxDQUFDLFFBQVEsT0FBTyxDQUFDO1NBQ3JFO2FBRUQ7WUFDQyxHQUFHLEdBQUcsZ0NBQWdDLE1BQU0sQ0FBQyxRQUFRLE9BQU8sQ0FBQztTQUM3RDtRQUVELGFBQWE7UUFDYixPQUFPLElBQUksZUFBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQ3JCLENBQUM7SUFFRCxRQUFRLENBQUMsR0FBaUIsRUFBRSxPQUFRO1FBRW5DLElBQUksTUFBTSxHQUFHO1lB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QUMsT0FBTyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUUxQyx1QkFDQyxHQUFHLEVBQUUsU0FBUyxFQUNkLFFBQVEsRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxFQUVsQyxPQUFPLEVBQUUsR0FBRyxFQUNaLFlBQVksRUFBRSxRQUFRLElBRW5CLElBQUksSUFFUCxTQUFTO2dCQUVULFFBQVE7Z0JBRVIsV0FBVztnQkFFWCxXQUFXO2dCQUVYLFlBQVk7Z0JBQ1osVUFBVTtnQkFFVixVQUFVO2dCQUVWLGFBQWEsSUFFWjtRQUNILENBQUMsQ0FBQyxDQUNEO0lBQ0gsQ0FBQztDQUNELENBQUE7QUEvWnVCLGtCQUFLLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsQ0FBQztBQUY1QyxZQUFZO0lBRHhCLHdCQUFnQixFQUE2QztHQUNqRCxZQUFZLENBaWF4QjtBQWphWSxvQ0FBWTtBQW1hekIsa0JBQWUsWUFBWSxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDcmVhdGVkIGJ5IHVzZXIgb24gMjAxOC8zLzI1LzAyNS5cbiAqL1xuXG5pbXBvcnQgeyByZXRyeVJlcXVlc3QgfSBmcm9tICcuLi8uLi9mZXRjaCc7XG5pbXBvcnQgeyBzdHJpcENvbnRlbnQgfSBmcm9tICcuLi8uLi9zdHJpcCc7XG5pbXBvcnQgeyBhcnJheV91bmlxdWUsIGVzY2FwZVJlZ2V4cCwgaXNVbmRlZiwgbWluaWZ5SFRNTCwgdHJpbSB9IGZyb20gJy4uLy4uL3V0aWwnO1xuaW1wb3J0IF9Ob3ZlbFNpdGUsIHsgc3RhdGljSW1wbGVtZW50cywgU1lNQk9MX0NBQ0hFLCBJTWRjb25mTWV0YSB9IGZyb20gJy4uL2luZGV4JztcbmltcG9ydCB7IElEb3dubG9hZE9wdGlvbnMsIElOb3ZlbCB9IGZyb20gJy4uL2RlbW8vYmFzZSc7XG5pbXBvcnQgeyBJRmV0Y2hDaGFwdGVyLCBJT3B0aW9uc1J1bnRpbWUgfSBmcm9tICcuLi9kZW1vL2Jhc2UnO1xuaW1wb3J0ICogYXMgTm92ZWxTaXRlRGVtbyBmcm9tICcuLi9kZW1vL2Jhc2UnO1xuaW1wb3J0IE5vdmVsU2l0ZUJhc2UgZnJvbSAnLi4vZGVtby9iYXNlJztcbmltcG9ydCB7IFVSTCB9IGZyb20gJ2pzZG9tLXVybCc7XG5pbXBvcnQgeyBmcm9tVVJMLCBJRnJvbVVybE9wdGlvbnMsIElKU0RPTSB9IGZyb20gJ2pzZG9tLWV4dHJhJztcbmltcG9ydCB7IFByb21pc2VCbHVlYmlyZCwgYmx1ZWJpcmREZWNvcmF0b3IgfSBmcm9tICcuLi9pbmRleCc7XG5pbXBvcnQgeyBtb21lbnQgfSBmcm9tICcuLi9pbmRleCc7XG5pbXBvcnQgbm92ZWxUZXh0IGZyb20gJ25vdmVsLXRleHQnO1xuaW1wb3J0ICogYXMgcGF0aCBmcm9tIFwicGF0aFwiO1xuaW1wb3J0ICogYXMgU3RyVXRpbCBmcm9tICdzdHItdXRpbCc7XG5pbXBvcnQgeyB6aFJlZ0V4cCB9IGZyb20gJ3JlZ2V4cC1jamsnO1xuaW1wb3J0IHsgcmVxdWVzdFRvSlNET00sIHBhY2tKU0RPTSwgY3JlYXRlSlNET00gfSBmcm9tICdqc2RvbS1leHRyYSc7XG5cbi8vaW1wb3J0IGVzY2FwZVN0cmluZ1JlZ2V4cCA9IHJlcXVpcmUoJ2VzY2FwZS1zdHJpbmctcmVnZXhwJyk7XG5cbkBzdGF0aWNJbXBsZW1lbnRzPF9Ob3ZlbFNpdGUuSU5vdmVsU2l0ZVN0YXRpYzxOb3ZlbFNpdGVUcGw+PigpXG5leHBvcnQgY2xhc3MgTm92ZWxTaXRlVHBsIGV4dGVuZHMgTm92ZWxTaXRlQmFzZVxue1xuXHRwdWJsaWMgc3RhdGljIHJlYWRvbmx5IElES0VZID0gcGF0aC5iYXNlbmFtZShfX2Rpcm5hbWUpO1xuXG5cdG1ha2VVcmwodXJsb2JqOiBfTm92ZWxTaXRlLklQYXJzZVVybCwgYm9vbD86IGJvb2xlYW4gfCBudW1iZXIpOiBVUkxcblx0e1xuXHRcdGxldCB1cmw6IHN0cmluZztcblxuXHRcdGlmIChib29sID09PSAyICYmIHVybG9iai5ub3ZlbF9pZClcblx0XHR7XG5cdFx0XHR1cmwgPSBgaHR0cDovL3EuZG16ai5jb20vJHt1cmxvYmoubm92ZWxfaWR9L2luZGV4LnNodG1sYDtcblx0XHR9XG5cdFx0ZWxzZSBpZiAoIWJvb2wgJiYgdXJsb2JqLnZvbHVtZV9pZCAmJiB1cmxvYmouY2hhcHRlcl9pZClcblx0XHR7XG5cdFx0XHR1cmwgPSBgaHR0cDovL3YyLmFwaS5kbXpqLmNvbS9ub3ZlbC9kb3dubG9hZC8ke3VybG9iai5ub3ZlbF9pZH1fJHt1cmxvYmoudm9sdW1lX2lkfV8ke3VybG9iai5jaGFwdGVyX2lkfS50eHRgO1xuXHRcdH1cblx0XHRlbHNlIGlmIChib29sID09PSB0cnVlICYmIHVybG9iai5ub3ZlbF9pZClcblx0XHR7XG5cdFx0XHR1cmwgPSBgaHR0cDovL3YyLmFwaS5kbXpqLmNvbS9ub3ZlbC9jaGFwdGVyLyR7dXJsb2JqLm5vdmVsX2lkfS5qc29uYDtcblx0XHR9XG5cdFx0ZWxzZVxuXHRcdHtcblx0XHRcdHVybCA9IGBodHRwOi8vdjIuYXBpLmRtemouY29tL25vdmVsLyR7dXJsb2JqLm5vdmVsX2lkfS5qc29uYDtcblx0XHR9XG5cblx0XHQvLyBAdHMtaWdub3JlXG5cdFx0cmV0dXJuIG5ldyBVUkwodXJsKTtcblx0fVxuXG5cdHBhcnNlVXJsKHVybDogVVJMIHwgc3RyaW5nLCBvcHRpb25zPyk6IF9Ob3ZlbFNpdGUuSVBhcnNlVXJsXG5cdHtcblx0XHRsZXQgdXJsb2JqID0ge1xuXHRcdFx0dXJsOiB1cmwsXG5cblx0XHRcdG5vdmVsX2lkOiBudWxsLFxuXHRcdFx0Y2hhcHRlcl9pZDogbnVsbCxcblxuXHRcdFx0dm9sdW1lX2lkOiBudWxsLFxuXHRcdH07XG5cblx0XHR0cnlcblx0XHR7XG5cdFx0XHQvLyBAdHMtaWdub3JlXG5cdFx0XHR1cmxvYmoudXJsID0gbmV3IFVSTCh1cmwpO1xuXHRcdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdFx0dXJsID0gdXJsb2JqLnVybC5ocmVmO1xuXHRcdH1cblx0XHRjYXRjaCAoZSlcblx0XHR7XG5cdFx0XHRjb25zb2xlLndhcm4oZS50b1N0cmluZygpICsgYCBcIiR7dXJsfVwiYCk7XG5cdFx0fVxuXG5cdFx0bGV0IHIgPSAvYXBpXFwuZG16alxcLmNvbVxcL25vdmVsXFwvKFxcZCspLmpzb24vO1xuXG5cdFx0bGV0IG0gPSByLmV4ZWModXJsIGFzIHN0cmluZyk7XG5cdFx0aWYgKG0pXG5cdFx0e1xuXHRcdFx0dXJsb2JqLm5vdmVsX2lkID0gbVsxXTtcblxuXHRcdFx0cmV0dXJuIHVybG9iajtcblx0XHR9XG5cblx0XHRyID0gL14oXFxkKykkLztcblx0XHRpZiAobSA9IHIuZXhlYyh1cmwgYXMgc3RyaW5nKSlcblx0XHR7XG5cdFx0XHR1cmxvYmoubm92ZWxfaWQgPSBtWzFdO1xuXG5cdFx0XHRyZXR1cm4gdXJsb2JqO1xuXHRcdH1cblxuXHRcdHIgPSAvYXBpXFwuZG16alxcLmNvbVxcL25vdmVsXFwvY2hhcHRlclxcLyhcXGQrKS5qc29uLztcblx0XHRpZiAobSA9IHIuZXhlYyh1cmwgYXMgc3RyaW5nKSlcblx0XHR7XG5cdFx0XHR1cmxvYmoubm92ZWxfaWQgPSBtWzFdO1xuXG5cdFx0XHRyZXR1cm4gdXJsb2JqO1xuXHRcdH1cblxuXHRcdHIgPSAvYXBpXFwuZG16alxcLmNvbVxcL25vdmVsXFwvZG93bmxvYWRcXC8oXFxkKylfKFxcZCspXyhcXGQrKS50eHQvO1xuXHRcdGlmIChtID0gci5leGVjKHVybCBhcyBzdHJpbmcpKVxuXHRcdHtcblx0XHRcdHVybG9iai5ub3ZlbF9pZCA9IG1bMV07XG5cdFx0XHR1cmxvYmoudm9sdW1lX2lkID0gbVsyXTtcblx0XHRcdHVybG9iai5jaGFwdGVyX2lkID0gbVszXTtcblxuXHRcdFx0cmV0dXJuIHVybG9iajtcblx0XHR9XG5cblx0XHQvLyDmiYvmqZ/niYjntrLlnYBcblx0XHRyID0gLyg/OnFcXC5kbXpqXFwuY29tXFwvfF5cXC8pKD86KFxcZCspXFwvKD86KFxcZCspXFwvKD86KFxcZCspW1xcLl9dKT8pPykvO1xuXHRcdGlmIChtID0gci5leGVjKHVybCBhcyBzdHJpbmcpKVxuXHRcdHtcblx0XHRcdHVybG9iai5ub3ZlbF9pZCA9IG1bMV07XG5cdFx0XHR1cmxvYmoudm9sdW1lX2lkID0gbVsyXTtcblx0XHRcdHVybG9iai5jaGFwdGVyX2lkID0gbVszXTtcblx0XHR9XG5cblx0XHRyZXR1cm4gdXJsb2JqO1xuXHR9XG5cblx0c2Vzc2lvbjxUID0gSU9wdGlvbnNSdW50aW1lPihvcHRpb25zUnVudGltZTogUGFydGlhbDxUICYgSURvd25sb2FkT3B0aW9ucz4sIHVybDogVVJMKVxuXHR7XG5cdFx0c3VwZXIuc2Vzc2lvbihvcHRpb25zUnVudGltZSwgdXJsKTtcblxuXHRcdG9wdGlvbnNSdW50aW1lLm9wdGlvbnNKU0RPTS5yZXF1ZXN0T3B0aW9ucyA9IG9wdGlvbnNSdW50aW1lLm9wdGlvbnNKU0RPTS5yZXF1ZXN0T3B0aW9ucyB8fCB7fTtcblxuXHRcdC8vIEB0cy1pZ25vcmVcblx0XHRvcHRpb25zUnVudGltZS5vcHRpb25zSlNET00ucmVxdWVzdE9wdGlvbnMuY29udGVudFR5cGUgPSAnanNvbic7XG5cblx0XHQvL2xldCB1cmwgPSBvcHRpb25zUnVudGltZVtTWU1CT0xfQ0FDSEVdLnVybDtcblxuXHRcdG9wdGlvbnNSdW50aW1lLm9wdGlvbnNKU0RPTS5jb29raWVKYXJcblx0XHQvLy5zZXRDb29raWVTeW5jKCdvdmVyMTg9eWVzOyBEb21haW49LnN5b3NldHUuY29tOyBQYXRoPS8nLCB1cmwuaHJlZilcblx0XHQ7XG5cblx0XHRyZXR1cm4gdGhpcztcblx0fVxuXG5cdGNyZWF0ZU1haW5VcmwodXJsKVxuXHR7XG5cdFx0bGV0IGRhdGEgPSB0aGlzLnBhcnNlVXJsKHVybCk7XG5cblx0XHRpZiAoIWRhdGEgfHwgIWRhdGEubm92ZWxfaWQpXG5cdFx0e1xuXHRcdFx0Y29uc29sZS5sb2coZGF0YSk7XG5cblx0XHRcdHRocm93IG5ldyBSZWZlcmVuY2VFcnJvcigpO1xuXHRcdH1cblxuXHRcdGxldCByZXQgPSB0aGlzLm1ha2VVcmwoZGF0YSwgdHJ1ZSk7XG5cblx0XHRyZXR1cm4gcmV0O1xuXHR9XG5cblx0X3N0cmlwQ29udGVudCh0ZXh0OiBzdHJpbmcpXG5cdHtcblx0XHR0ZXh0ID0gc3RyaXBDb250ZW50KHRleHQpO1xuXG5cdFx0Ly9wcm9jZXNzLmV4aXQoKTtcblxuXHRcdHJldHVybiB0ZXh0XG5cdFx0XHQvLy5yZXBsYWNlKC9e44CA44CAL2dtLCAnJylcblx0XHRcdC5yZXBsYWNlKC9eW1xcdUZFRkZcXHhBMF0rL2dtLCAnJylcblx0XHRcdC8vIOS/ruato+avj+ihjOmWi+mgreWkmuWHuuepuueZveeahOWVj+mhjFxuXHRcdFx0LnJlcGxhY2UoL14gKy9nbSwgJycpXG5cdFx0XHQucmVwbGFjZSgvICskL2dtLCAnJylcblx0XHRcdC5yZXBsYWNlKC9cXHMrJC8sICcnKVxuXHRcdDtcblx0fVxuXG5cdHByb3RlY3RlZCBfc2F2ZVJlYWRtZShvcHRpb25zUnVudGltZTogSU9wdGlvbnNSdW50aW1lLCBvcHRpb25zID0ge30sIC4uLm9wdHMpXG5cdHtcblx0XHRvcHRpb25zW3RoaXMuSURLRVldID0ge1xuXHRcdFx0bm92ZWxfaWQ6IG9wdGlvbnNSdW50aW1lW1NZTUJPTF9DQUNIRV0ubm92ZWwubm92ZWxfaWQsXG5cdFx0fTtcblxuXHRcdHJldHVybiBzdXBlci5fc2F2ZVJlYWRtZShvcHRpb25zUnVudGltZSwgb3B0aW9ucywge1xuXHRcdFx0Ly9cblx0XHR9LCAuLi5vcHRzKTtcblx0fVxuXG5cdHByb3RlY3RlZCBfcGFyc2VDaGFwdGVyPFQ+KHJldDogSUZldGNoQ2hhcHRlciwgb3B0aW9uc1J1bnRpbWU6IFQgJiBJT3B0aW9uc1J1bnRpbWUsIGNhY2hlKTogc3RyaW5nXG5cdHtcblx0XHRpZiAoIXJldClcblx0XHR7XG5cdFx0XHRyZXR1cm4gJyc7XG5cdFx0fVxuXG5cdFx0bGV0IGJvZHlfc2VsZWN0b3IgPSAnYm9keSc7XG5cblx0XHR0cnlcblx0XHR7XG4vL1x0XHRcdGxldCBodG1sID0gbWluaWZ5SFRNTChyZXQuZG9tLiQoYm9keV9zZWxlY3RvcikuaHRtbCgpKTtcbi8vXG4vL1x0XHRcdC8vaHRtbCA9IGh0bWwucmVwbGFjZSgvXigmbmJzcDspezR9L2dtLCAnJyk7XG4vL1x0XHRcdGh0bWwgPSBodG1sLnJlcGxhY2UoL15cXHMrfFxccyskL2csICcnKTtcbi8vXG4vL1x0XHRcdHJldC5kb20uJChib2R5X3NlbGVjdG9yKS5odG1sKGh0bWwpO1xuXHRcdH1cblx0XHRjYXRjaCAoZSlcblx0XHR7XG5cblx0XHR9XG5cblx0XHRsZXQgdGV4dDogc3RyaW5nO1xuXG5cdFx0aWYgKHJldC5kb20pXG5cdFx0e1xuXHRcdFx0dGV4dCA9IHJldC5kb20uJChib2R5X3NlbGVjdG9yKS50ZXh0KCk7XG5cdFx0fVxuXHRcdGVsc2Vcblx0XHR7XG5cdFx0XHRyZXQuZG9tID0gY3JlYXRlSlNET00ocmV0LmJvZHkudG9TdHJpbmcoKSk7XG5cblx0XHRcdHRleHQgPSByZXQuZG9tLiQoYm9keV9zZWxlY3RvcikudGV4dCgpO1xuXHRcdH1cblxuXHRcdGlmIChyZXQuZG9tICYmIHJldC5kb20uJCAmJiByZXQuZG9tLiQoJ2ltZycpLmxlbmd0aClcblx0XHR7XG5cdFx0XHRsZXQgJCA9IHJldC5kb20uJDtcblxuXHRcdFx0Y2FjaGUuY2hhcHRlci5pbWdzID0gY2FjaGUuY2hhcHRlci5pbWdzIHx8IFtdO1xuXG5cdFx0XHRyZXQuZG9tLiQoJ2ltZ1tzcmNdJykuZWFjaChmdW5jdGlvbiAoKVxuXHRcdFx0e1xuXHRcdFx0XHRjYWNoZS5jaGFwdGVyLmltZ3MucHVzaCgkKHRoaXMpLnByb3AoJ3NyYycpKTtcblx0XHRcdFx0Y2FjaGUubm92ZWwuaW1ncy5wdXNoKCQodGhpcykucHJvcCgnc3JjJykpO1xuXHRcdFx0fSk7XG5cdFx0fVxuXG5cdFx0dGV4dCA9IHRoaXMuX3N0cmlwQ29udGVudCh0ZXh0KTtcblxuXHRcdGxldCBzcCA9ICdbwqAg44CAXSonO1xuXG5cdFx0bGV0IHIgPSBuZXcgemhSZWdFeHAoYF5bwqAg44CAXFxcXHNdKiR7ZXNjYXBlUmVnZXhwKGNhY2hlLnZvbHVtZS52b2x1bWVfdGl0bGUpfSR7c3B9JHtlc2NhcGVSZWdleHAoY2FjaGUuY2hhcHRlci5jaGFwdGVyX3RpdGxlKX0ke3NwfWAsICdpZycpO1xuXG5cdFx0dGV4dCA9IHRleHRcblx0XHRcdC5yZXBsYWNlKHIsICcnKVxuXHRcdDtcblxuXHRcdHJldHVybiB0ZXh0O1xuXHR9XG5cblx0Ly8gQHRzLWlnbm9yZVxuXHRfY3JlYXRlQ2hhcHRlclVybDxUID0gSU9wdGlvbnNSdW50aW1lPih7XG5cdFx0bm92ZWwsXG5cdFx0dm9sdW1lLFxuXHRcdGNoYXB0ZXIsXG5cdH0sIG9wdGlvbnNSdW50aW1lPylcblx0e1xuXHRcdC8vIEB0cy1pZ25vcmVcblx0XHRyZXR1cm4gbmV3IFVSTChjaGFwdGVyLmNoYXB0ZXJfdXJsKTtcblx0fVxuXG5cdGFzeW5jIGdldF92b2x1bWVfbGlzdDxUID0gSU9wdGlvbnNSdW50aW1lPihpbnB1dFVybDogc3RyaW5nIHwgVVJMLFxuXHRcdG9wdGlvbnNSdW50aW1lOiBQYXJ0aWFsPFQgJiBJRG93bmxvYWRPcHRpb25zPiA9IHt9XG5cdCk6IFByb21pc2U8SU5vdmVsPlxuXHR7XG5cdFx0Y29uc3Qgc2VsZiA9IHRoaXM7XG5cdFx0bGV0IHVybCA9IGF3YWl0IHRoaXMuY3JlYXRlTWFpblVybChpbnB1dFVybCk7XG5cblx0XHQvLyBAdHMtaWdub3JlXG5cdFx0cmV0dXJuIGF3YWl0IHJldHJ5UmVxdWVzdCh1cmwsIG9wdGlvbnNSdW50aW1lLnJlcXVlc3RPcHRpb25zKVxuXHRcdFx0LnRoZW4oYXN5bmMgZnVuY3Rpb24gKGRvbSlcblx0XHRcdHtcblx0XHRcdFx0Y29uc3QgJCA9IGRvbS4kO1xuXG5cdFx0XHRcdGRvbSA9IEpTT04ucGFyc2UoZG9tIGFzIHN0cmluZyk7XG5cblx0XHRcdFx0bGV0IGRhdGFfbWV0YSA9IGF3YWl0IHNlbGYuX2dldF9tZXRhKHVybCwgb3B0aW9uc1J1bnRpbWUsIHtcblx0XHRcdFx0XHRkb20sXG5cdFx0XHRcdH0pO1xuXG5cdFx0XHRcdHVybCA9IGRhdGFfbWV0YS51cmw7XG5cdFx0XHRcdGxldCB1cmxfZGF0YSA9IGRhdGFfbWV0YS51cmxfZGF0YTtcblxuXHRcdFx0XHRsZXQgX2NhY2hlX2RhdGVzID0gW107XG5cdFx0XHRcdGxldCB2b2x1bWVfbGlzdCA9IFtdIGFzIF9Ob3ZlbFNpdGUuSVZvbHVtZVtdO1xuXG5cdFx0XHRcdGxldCBjdXJyZW50Vm9sdW1lOiBfTm92ZWxTaXRlLklWb2x1bWU7XG5cblx0XHRcdFx0bGV0IHRhYmxlID0gZG9tO1xuXG5cdFx0XHRcdHRhYmxlLmZvckVhY2goZnVuY3Rpb24gKHZvbHVtZURhdGE6IHtcblx0XHRcdFx0XHR2b2x1bWVfaWQ6IG51bWJlcixcblx0XHRcdFx0XHRpZDogbnVtYmVyLFxuXHRcdFx0XHRcdHZvbHVtZV9uYW1lOiBzdHJpbmcsXG5cdFx0XHRcdFx0dm9sdW1lX29yZGVyOiBudW1iZXIsXG5cdFx0XHRcdFx0Y2hhcHRlcnM6IHtcblx0XHRcdFx0XHRcdGNoYXB0ZXJfaWQ6IG51bWJlcixcblx0XHRcdFx0XHRcdGNoYXB0ZXJfbmFtZTogc3RyaW5nLFxuXHRcdFx0XHRcdFx0Y2hhcHRlcl9vcmRlcjogbnVtYmVyLFxuXHRcdFx0XHRcdH1bXSxcblx0XHRcdFx0fSlcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGN1cnJlbnRWb2x1bWUgPSB2b2x1bWVfbGlzdFt2b2x1bWVfbGlzdC5sZW5ndGhdID0ge1xuXHRcdFx0XHRcdFx0dm9sdW1lX2luZGV4OiB2b2x1bWVfbGlzdC5sZW5ndGgsXG5cdFx0XHRcdFx0XHR2b2x1bWVfdGl0bGU6IG5vdmVsVGV4dC50cmltKHZvbHVtZURhdGEudm9sdW1lX25hbWUpLFxuXHRcdFx0XHRcdFx0dm9sdW1lX2lzOiB2b2x1bWVEYXRhLnZvbHVtZV9pZCxcblx0XHRcdFx0XHRcdHZvbHVtZV9vcmRlcjogdm9sdW1lRGF0YS52b2x1bWVfb3JkZXIsXG5cdFx0XHRcdFx0XHRjaGFwdGVyX2xpc3Q6IFtdLFxuXHRcdFx0XHRcdH07XG5cblx0XHRcdFx0XHR2b2x1bWVEYXRhLmNoYXB0ZXJzLmZvckVhY2goZnVuY3Rpb24gKGNoYXB0ZXJEYXRhKVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdGxldCBjaGFwdGVyX3VybCA9IHNlbGYubWFrZVVybCh7XG5cdFx0XHRcdFx0XHRcdGNoYXB0ZXJfaWQ6IGNoYXB0ZXJEYXRhLmNoYXB0ZXJfaWQsXG5cdFx0XHRcdFx0XHRcdG5vdmVsX2lkOiBkYXRhX21ldGEubm92ZWxfaWQsXG5cdFx0XHRcdFx0XHRcdHZvbHVtZV9pZDogdm9sdW1lRGF0YS52b2x1bWVfaWQsXG5cdFx0XHRcdFx0XHR9KTtcblxuXHRcdFx0XHRcdFx0bGV0IGNoYXB0ZXJfdXJsX2RhdGEgPSBzZWxmLnBhcnNlVXJsKGNoYXB0ZXJfdXJsKTtcblxuXHRcdFx0XHRcdFx0Y3VycmVudFZvbHVtZVxuXHRcdFx0XHRcdFx0XHQuY2hhcHRlcl9saXN0XG5cdFx0XHRcdFx0XHRcdC5wdXNoKHtcblx0XHRcdFx0XHRcdFx0XHRjaGFwdGVyX2luZGV4OiBjdXJyZW50Vm9sdW1lLmNoYXB0ZXJfbGlzdC5sZW5ndGgsXG5cdFx0XHRcdFx0XHRcdFx0Y2hhcHRlcl90aXRsZTogbm92ZWxUZXh0LnRyaW0oY2hhcHRlckRhdGEuY2hhcHRlcl9uYW1lKSxcblx0XHRcdFx0XHRcdFx0XHRjaGFwdGVyX2lkOiBjaGFwdGVyRGF0YS5jaGFwdGVyX2lkLFxuXHRcdFx0XHRcdFx0XHRcdGNoYXB0ZXJfb3JkZXI6IGNoYXB0ZXJEYXRhLmNoYXB0ZXJfb3JkZXIsXG5cdFx0XHRcdFx0XHRcdFx0Y2hhcHRlcl91cmwsXG5cdFx0XHRcdFx0XHRcdFx0Y2hhcHRlcl91cmxfZGF0YSxcblx0XHRcdFx0XHRcdFx0fSlcblx0XHRcdFx0XHRcdDtcblx0XHRcdFx0XHR9KTtcblx0XHRcdFx0fSk7XG5cblx0XHRcdFx0bGV0IG5vdmVsX2RhdGU7XG5cblx0XHRcdFx0aWYgKF9jYWNoZV9kYXRlcy5sZW5ndGgpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRfY2FjaGVfZGF0ZXMuc29ydCgpO1xuXG5cdFx0XHRcdFx0bm92ZWxfZGF0ZSA9IG1vbWVudC51bml4KF9jYWNoZV9kYXRlc1tfY2FjaGVfZGF0ZXMubGVuZ3RoIC0gMV0pLmxvY2FsKCk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRyZXR1cm4ge1xuXG5cdFx0XHRcdFx0dXJsLFxuXHRcdFx0XHRcdHVybF9kYXRhLFxuXG5cdFx0XHRcdFx0Li4uZGF0YV9tZXRhLFxuXG5cdFx0XHRcdFx0dm9sdW1lX2xpc3QsXG5cblx0XHRcdFx0XHQvL25vdmVsX2RhdGUsXG5cblx0XHRcdFx0XHRjaGVja2RhdGU6IG1vbWVudCgpLmxvY2FsKCksXG5cblx0XHRcdFx0XHRpbWdzOiBbXSBhcyBzdHJpbmdbXSxcblx0XHRcdFx0fSBhcyBJTm92ZWw7XG5cdFx0XHR9KVxuXHRcdFx0LnRhcChmdW5jdGlvbiAobm92ZWwpXG5cdFx0XHR7XG5cdFx0XHRcdGNvbnNvbGUuZGlyKG5vdmVsLCB7XG5cdFx0XHRcdFx0Y29sb3JzOiB0cnVlLFxuXHRcdFx0XHRcdC8vZGVwdGg6IDMsXG5cdFx0XHRcdH0pO1xuXHRcdFx0fSlcblx0XHRcdDtcblx0fVxuXG5cdHByb3RlY3RlZCBhc3luYyBfZ2V0X21ldGEoaW5wdXRVcmwsIG9wdGlvbnNSdW50aW1lLCBjYWNoZToge1xuXHRcdGRvbTogSUpTRE9NLFxuXHR9KVxuXHR7XG5cdFx0Y29uc3Qgc2VsZiA9IHRoaXM7XG5cblx0XHRsZXQgdXJsID0gc2VsZi5tYWtlVXJsKHNlbGYucGFyc2VVcmwoaW5wdXRVcmwpLCAtMSk7XG5cdFx0bGV0IHVybF9kYXRhID0gc2VsZi5wYXJzZVVybCh1cmwpO1xuXG5cdFx0cmV0dXJuIHJldHJ5UmVxdWVzdCh1cmwsIG9wdGlvbnNSdW50aW1lLnJlcXVlc3RPcHRpb25zKVxuXHRcdC8vcmV0dXJuIGZyb21VUkwodXJsLCBvcHRpb25zUnVudGltZS5vcHRpb25zSlNET00pXG5cdFx0Ly9yZXR1cm4gUHJvbWlzZS5yZXNvbHZlKGNhY2hlLmRvbSlcblx0XHRcdC50aGVuKGZ1bmN0aW9uIChkb21Kc29uKVxuXHRcdFx0e1xuXHRcdFx0XHRkb21Kc29uID0gSlNPTi5wYXJzZShkb21Kc29uIGFzIHN0cmluZyk7XG5cblx0XHRcdFx0bGV0IGRhdGE6IElNZGNvbmZNZXRhID0ge307XG5cdFx0XHRcdGRhdGEubm92ZWwgPSB7fTtcblx0XHRcdFx0ZGF0YS5ub3ZlbC50YWdzID0gW107XG5cblx0XHRcdFx0bGV0IG5vdmVsX3RpdGxlID0gZG9tSnNvbi5uYW1lO1xuXHRcdFx0XHRsZXQgbm92ZWxfYXV0aG9yID0gZG9tSnNvbi5hdXRob3JzO1xuXG5cdFx0XHRcdGRvbUpzb24udHlwZXMgPSBkb21Kc29uLnR5cGVzIHx8IFtdO1xuXHRcdFx0XHRkb21Kc29uLnR5cGVzLmZvckVhY2goZnVuY3Rpb24gKHMpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRkYXRhLm5vdmVsLnRhZ3MucHVzaCguLi5zLnNwbGl0KCdcXC8nKSlcblx0XHRcdFx0fSk7XG5cblx0XHRcdFx0ZGF0YS5ub3ZlbC50YWdzLnB1c2goZG9tSnNvbi56b25lKTtcblx0XHRcdFx0Ly9kYXRhLm5vdmVsLnRhZ3MucHVzaChkb21Kc29uLnN0YXR1cyk7XG5cblx0XHRcdFx0ZGF0YS5ub3ZlbC5zdGF0dXMgPSBkb21Kc29uLnN0YXR1cztcblxuXHRcdFx0XHRsZXQgbm92ZWxfY292ZXIgPSBkb21Kc29uLmNvdmVyO1xuXHRcdFx0XHRsZXQgbm92ZWxfZGVzYyA9IGRvbUpzb24uaW50cm9kdWN0aW9uO1xuXG5cdFx0XHRcdGxldCBub3ZlbF9pZCA9IGRvbUpzb24uaWQ7XG5cblx0XHRcdFx0bGV0IG5vdmVsX2RhdGUgPSBtb21lbnQudW5peChkb21Kc29uLmxhc3RfdXBkYXRlX3RpbWUpLmxvY2FsKCk7XG5cblx0XHRcdFx0Ly9jb25zb2xlLmxvZyhkb21Kc29uKTtcblxuXHRcdFx0XHRsZXQgZG16al9hcGlfanNvbiA9IGRvbUpzb247XG5cblx0XHRcdFx0bGV0IG5vdmVsX3VybCA9IHNlbGYubWFrZVVybCh1cmxfZGF0YSwgMik7XG5cblx0XHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0XHR1cmw6IG5vdmVsX3VybCxcblx0XHRcdFx0XHR1cmxfZGF0YTogc2VsZi5wYXJzZVVybChub3ZlbF91cmwpLFxuXG5cdFx0XHRcdFx0dXJsX2FwaTogdXJsLFxuXHRcdFx0XHRcdHVybF9kYXRhX2FwaTogdXJsX2RhdGEsXG5cblx0XHRcdFx0XHQuLi5kYXRhLFxuXG5cdFx0XHRcdFx0bm92ZWxfdXJsLFxuXG5cdFx0XHRcdFx0bm92ZWxfaWQsXG5cblx0XHRcdFx0XHRub3ZlbF90aXRsZSxcblxuXHRcdFx0XHRcdG5vdmVsX2NvdmVyLFxuXG5cdFx0XHRcdFx0bm92ZWxfYXV0aG9yLFxuXHRcdFx0XHRcdG5vdmVsX2Rlc2MsXG5cblx0XHRcdFx0XHRub3ZlbF9kYXRlLFxuXG5cdFx0XHRcdFx0ZG16al9hcGlfanNvbixcblxuXHRcdFx0XHR9O1xuXHRcdFx0fSlcblx0XHRcdDtcblx0fVxufVxuXG5leHBvcnQgZGVmYXVsdCBOb3ZlbFNpdGVUcGw7XG4iXX0=