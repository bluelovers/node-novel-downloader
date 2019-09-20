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
    makeUrl(urlobj, bool, optionsRuntime) {
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
        let url = await this.createMainUrl(inputUrl, optionsRuntime);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYXBpLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7R0FFRzs7Ozs7Ozs7QUFFSCx1Q0FBMkM7QUFDM0MsdUNBQTJDO0FBQzNDLHFDQUFtRjtBQUNuRixvQ0FBbUY7QUFJbkYsdUNBQXlDO0FBQ3pDLHlDQUFnQztBQUdoQyxvQ0FBa0M7QUFDbEMsMkNBQW1DO0FBQ25DLDZCQUE2QjtBQUU3QiwyQ0FBc0M7QUFDdEMsNkNBQXFFO0FBRXJFLDhEQUE4RDtBQUc5RCxJQUFhLFlBQVksR0FBekIsTUFBYSxZQUFhLFNBQVEsY0FBYTtJQUk5QyxNQUFNLENBQUMsS0FBSyxDQUFDLEdBQXdDLEVBQUUsT0FBUTtRQUU5RCxhQUFhO1FBQ2IsT0FBTyxZQUFZLENBQUMsSUFBSSxDQUFDLElBQUksZUFBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLFFBQVEsSUFBSSxFQUFFLENBQUMsQ0FBQztJQUN2RCxDQUFDO0lBRUQsT0FBTyxDQUFJLE1BQTRCLEVBQUUsSUFBdUIsRUFBRSxjQUFvQztRQUVyRyxJQUFJLEdBQVcsQ0FBQztRQUVoQixJQUFJLElBQUksS0FBSyxDQUFDLElBQUksTUFBTSxDQUFDLFFBQVEsRUFDakM7WUFDQyxHQUFHLEdBQUcscUJBQXFCLE1BQU0sQ0FBQyxRQUFRLGNBQWMsQ0FBQztTQUN6RDthQUNJLElBQUksQ0FBQyxJQUFJLElBQUksTUFBTSxDQUFDLFNBQVMsSUFBSSxNQUFNLENBQUMsVUFBVSxFQUN2RDtZQUNDLEdBQUcsR0FBRyx5Q0FBeUMsTUFBTSxDQUFDLFFBQVEsSUFBSSxNQUFNLENBQUMsU0FBUyxJQUFJLE1BQU0sQ0FBQyxVQUFVLE1BQU0sQ0FBQztTQUM5RzthQUNJLElBQUksSUFBSSxLQUFLLElBQUksSUFBSSxNQUFNLENBQUMsUUFBUSxFQUN6QztZQUNDLEdBQUcsR0FBRyx3Q0FBd0MsTUFBTSxDQUFDLFFBQVEsT0FBTyxDQUFDO1NBQ3JFO2FBRUQ7WUFDQyxHQUFH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QUFDLFlBQVksQ0FBQztZQUV0QyxJQUFJLFFBQVEsR0FBRyxPQUFPLENBQUMsRUFBRSxDQUFDO1lBRTFCLElBQUksVUFBVSxHQUFHLGNBQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLGdCQUFnQixDQUFDLENBQUMsS0FBSyxFQUFFLENBQUM7WUFFL0QsdUJBQXVCO1lBRXZCLElBQUksYUFBYSxHQUFHLE9BQU8sQ0FBQztZQUU1QixJQUFJLFNBQVMsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUUxQyxxQ0FDQyxHQUFHLEVBQUUsU0FBUyxFQUNkLFFBQVEsRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxFQUVsQyxPQUFPLEVBQUUsR0FBRyxFQUNaLFlBQVksRUFBRSxRQUFRLElBRW5CLElBQUksS0FFUCxTQUFTO2dCQUVULFFBQVE7Z0JBRVIsV0FBVztnQkFFWCxXQUFXO2dCQUVYLFlBQVk7Z0JBQ1osVUFBVTtnQkFFVixVQUFVO2dCQUVWLGFBQWEsSUFFWjtRQUNILENBQUMsQ0FBQyxDQUNEO0lBQ0gsQ0FBQztDQUNELENBQUE7QUF2YXVCLGtCQUFLLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsQ0FBQztBQUY1QyxZQUFZO0lBRHhCLHdCQUFnQixFQUE2QztHQUNqRCxZQUFZLENBeWF4QjtBQXphWSxvQ0FBWTtBQTJhekIsa0JBQWUsWUFBWSxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDcmVhdGVkIGJ5IHVzZXIgb24gMjAxOC8zLzI1LzAyNS5cbiAqL1xuXG5pbXBvcnQgeyByZXRyeVJlcXVlc3QgfSBmcm9tICcuLi8uLi9mZXRjaCc7XG5pbXBvcnQgeyBzdHJpcENvbnRlbnQgfSBmcm9tICcuLi8uLi9zdHJpcCc7XG5pbXBvcnQgeyBhcnJheV91bmlxdWUsIGVzY2FwZVJlZ2V4cCwgaXNVbmRlZiwgbWluaWZ5SFRNTCwgdHJpbSB9IGZyb20gJy4uLy4uL3V0aWwnO1xuaW1wb3J0IF9Ob3ZlbFNpdGUsIHsgc3RhdGljSW1wbGVtZW50cywgU1lNQk9MX0NBQ0hFLCBJTWRjb25mTWV0YSB9IGZyb20gJy4uL2luZGV4JztcbmltcG9ydCB7IElEb3dubG9hZE9wdGlvbnMsIElOb3ZlbCB9IGZyb20gJy4uL2RlbW8vYmFzZSc7XG5pbXBvcnQgeyBJRmV0Y2hDaGFwdGVyLCBJT3B0aW9uc1J1bnRpbWUgfSBmcm9tICcuLi9kZW1vL2Jhc2UnO1xuaW1wb3J0ICogYXMgTm92ZWxTaXRlRGVtbyBmcm9tICcuLi9kZW1vL2Jhc2UnO1xuaW1wb3J0IE5vdmVsU2l0ZUJhc2UgZnJvbSAnLi4vZGVtby9iYXNlJztcbmltcG9ydCB7IFVSTCB9IGZyb20gJ2pzZG9tLXVybCc7XG5pbXBvcnQgeyBmcm9tVVJMLCBJRnJvbVVybE9wdGlvbnMsIElKU0RPTSB9IGZyb20gJ2pzZG9tLWV4dHJhJztcbmltcG9ydCB7IFByb21pc2VCbHVlYmlyZCwgYmx1ZWJpcmREZWNvcmF0b3IgfSBmcm9tICcuLi9pbmRleCc7XG5pbXBvcnQgeyBtb21lbnQgfSBmcm9tICcuLi9pbmRleCc7XG5pbXBvcnQgbm92ZWxUZXh0IGZyb20gJ25vdmVsLXRleHQnO1xuaW1wb3J0ICogYXMgcGF0aCBmcm9tIFwicGF0aFwiO1xuaW1wb3J0ICogYXMgU3RyVXRpbCBmcm9tICdzdHItdXRpbCc7XG5pbXBvcnQgeyB6aFJlZ0V4cCB9IGZyb20gJ3JlZ2V4cC1jamsnO1xuaW1wb3J0IHsgcmVxdWVzdFRvSlNET00sIHBhY2tKU0RPTSwgY3JlYXRlSlNET00gfSBmcm9tICdqc2RvbS1leHRyYSc7XG5cbi8vaW1wb3J0IGVzY2FwZVN0cmluZ1JlZ2V4cCA9IHJlcXVpcmUoJ2VzY2FwZS1zdHJpbmctcmVnZXhwJyk7XG5cbkBzdGF0aWNJbXBsZW1lbnRzPF9Ob3ZlbFNpdGUuSU5vdmVsU2l0ZVN0YXRpYzxOb3ZlbFNpdGVUcGw+PigpXG5leHBvcnQgY2xhc3MgTm92ZWxTaXRlVHBsIGV4dGVuZHMgTm92ZWxTaXRlQmFzZVxue1xuXHRwdWJsaWMgc3RhdGljIHJlYWRvbmx5IElES0VZID0gcGF0aC5iYXNlbmFtZShfX2Rpcm5hbWUpO1xuXG5cdHN0YXRpYyBjaGVjayh1cmw6IHN0cmluZyB8IFVSTCB8IF9Ob3ZlbFNpdGUuSVBhcnNlVXJsLCBvcHRpb25zPyk6IGJvb2xlYW5cblx0e1xuXHRcdC8vIEB0cy1pZ25vcmVcblx0XHRyZXR1cm4gL2RtempcXC5jb20vaS50ZXN0KG5ldyBVUkwodXJsKS5ob3N0bmFtZSB8fCAnJyk7XG5cdH1cblxuXHRtYWtlVXJsPFQ+KHVybG9iajogX05vdmVsU2l0ZS5JUGFyc2VVcmwsIGJvb2w/OiBib29sZWFuIHwgbnVtYmVyLCBvcHRpb25zUnVudGltZT86IFQgJiBJT3B0aW9uc1J1bnRpbWUpOiBVUkxcblx0e1xuXHRcdGxldCB1cmw6IHN0cmluZztcblxuXHRcdGlmIChib29sID09PSAyICYmIHVybG9iai5ub3ZlbF9pZClcblx0XHR7XG5cdFx0XHR1cmwgPSBgaHR0cDovL3EuZG16ai5jb20vJHt1cmxvYmoubm92ZWxfaWR9L2luZGV4LnNodG1sYDtcblx0XHR9XG5cdFx0ZWxzZSBpZiAoIWJvb2wgJiYgdXJsb2JqLnZvbHVtZV9pZCAmJiB1cmxvYmouY2hhcHRlcl9pZClcblx0XHR7XG5cdFx0XHR1cmwgPSBgaHR0cDovL3YyLmFwaS5kbXpqLmNvbS9ub3ZlbC9kb3dubG9hZC8ke3VybG9iai5ub3ZlbF9pZH1fJHt1cmxvYmoudm9sdW1lX2lkfV8ke3VybG9iai5jaGFwdGVyX2lkfS50eHRgO1xuXHRcdH1cblx0XHRlbHNlIGlmIChib29sID09PSB0cnVlICYmIHVybG9iai5ub3ZlbF9pZClcblx0XHR7XG5cdFx0XHR1cmwgPSBgaHR0cDovL3YyLmFwaS5kbXpqLmNvbS9ub3ZlbC9jaGFwdGVyLyR7dXJsb2JqLm5vdmVsX2lkfS5qc29uYDtcblx0XHR9XG5cdFx0ZWxzZVxuXHRcdHtcblx0XHRcdHVybCA9IGBodHRwOi8vdjIuYXBpLmRtemouY29tL25vdmVsLyR7dXJsb2JqLm5vdmVsX2lkfS5qc29uYDtcblx0XHR9XG5cblx0XHQvLyBAdHMtaWdub3JlXG5cdFx0cmV0dXJuIG5ldyBVUkwodXJsKTtcblx0fVxuXG5cdHBhcnNlVXJsKHVybDogVVJMIHwgc3RyaW5nLCBvcHRpb25zPyk6IF9Ob3ZlbFNpdGUuSVBhcnNlVXJsXG5cdHtcblx0XHRsZXQgdXJsb2JqID0ge1xuXHRcdFx0dXJsOiB1cmwsXG5cblx0XHRcdG5vdmVsX2lkOiBudWxsLFxuXHRcdFx0Y2hhcHRlcl9pZDogbnVsbCxcblxuXHRcdFx0dm9sdW1lX2lkOiBudWxsLFxuXHRcdH07XG5cblx0XHR0cnlcblx0XHR7XG5cdFx0XHQvLyBAdHMtaWdub3JlXG5cdFx0XHR1cmxvYmoudXJsID0gbmV3IFVSTCh1cmwpO1xuXHRcdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdFx0dXJsID0gdXJsb2JqLnVybC5ocmVmO1xuXHRcdH1cblx0XHRjYXRjaCAoZSlcblx0XHR7XG5cdFx0XHRjb25zb2xlLndhcm4oZS50b1N0cmluZygpICsgYCBcIiR7dXJsfVwiYCk7XG5cdFx0fVxuXG5cdFx0bGV0IHIgPSAvYXBpXFwuZG16alxcLmNvbVxcL25vdmVsXFwvKFxcZCspLmpzb24vO1xuXG5cdFx0bGV0IG0gPSByLmV4ZWModXJsIGFzIHN0cmluZyk7XG5cdFx0aWYgKG0pXG5cdFx0e1xuXHRcdFx0dXJsb2JqLm5vdmVsX2lkID0gbVsxXTtcblxuXHRcdFx0cmV0dXJuIHVybG9iajtcblx0XHR9XG5cblx0XHRyID0gL14oXFxkKykkLztcblx0XHRpZiAobSA9IHIuZXhlYyh1cmwgYXMgc3RyaW5nKSlcblx0XHR7XG5cdFx0XHR1cmxvYmoubm92ZWxfaWQgPSBtWzFdO1xuXG5cdFx0XHRyZXR1cm4gdXJsb2JqO1xuXHRcdH1cblxuXHRcdHIgPSAvYXBpXFwuZG16alxcLmNvbVxcL25vdmVsXFwvY2hhcHRlclxcLyhcXGQrKS5qc29uLztcblx0XHRpZiAobSA9IHIuZXhlYyh1cmwgYXMgc3RyaW5nKSlcblx0XHR7XG5cdFx0XHR1cmxvYmoubm92ZWxfaWQgPSBtWzFdO1xuXG5cdFx0XHRyZXR1cm4gdXJsb2JqO1xuXHRcdH1cblxuXHRcdHIgPSAvYXBpXFwuZG16alxcLmNvbVxcL25vdmVsXFwvZG93bmxvYWRcXC8oXFxkKylfKFxcZCspXyhcXGQrKS50eHQvO1xuXHRcdGlmIChtID0gci5leGVjKHVybCBhcyBzdHJpbmcpKVxuXHRcdHtcblx0XHRcdHVybG9iai5ub3ZlbF9pZCA9IG1bMV07XG5cdFx0XHR1cmxvYmoudm9sdW1lX2lkID0gbVsyXTtcblx0XHRcdHVybG9iai5jaGFwdGVyX2lkID0gbVszXTtcblxuXHRcdFx0cmV0dXJuIHVybG9iajtcblx0XHR9XG5cblx0XHQvLyDmiYvmqZ/niYjntrLlnYBcblx0XHRyID0gLyg/OnFcXC5kbXpqXFwuY29tXFwvfF5cXC8pKD86KFxcZCspXFwvKD86KFxcZCspXFwvKD86KFxcZCspW1xcLl9dKT8pPykvO1xuXHRcdGlmIChtID0gci5leGVjKHVybCBhcyBzdHJpbmcpKVxuXHRcdHtcblx0XHRcdHVybG9iai5ub3ZlbF9pZCA9IG1bMV07XG5cdFx0XHR1cmxvYmoudm9sdW1lX2lkID0gbVsyXTtcblx0XHRcdHVybG9iai5jaGFwdGVyX2lkID0gbVszXTtcblx0XHR9XG5cblx0XHRyZXR1cm4gdXJsb2JqO1xuXHR9XG5cblx0c2Vzc2lvbjxUID0gSU9wdGlvbnNSdW50aW1lPihvcHRpb25zUnVudGltZTogUGFydGlhbDxUICYgSURvd25sb2FkT3B0aW9ucz4sIHVybDogVVJMKVxuXHR7XG5cdFx0c3VwZXIuc2Vzc2lvbihvcHRpb25zUnVudGltZSwgdXJsKTtcblxuXHRcdG9wdGlvbnNSdW50aW1lLm9wdGlvbnNKU0RPTS5yZXF1ZXN0T3B0aW9ucyA9IG9wdGlvbnNSdW50aW1lLm9wdGlvbnNKU0RPTS5yZXF1ZXN0T3B0aW9ucyB8fCB7fTtcblxuXHRcdC8vIEB0cy1pZ25vcmVcblx0XHRvcHRpb25zUnVudGltZS5vcHRpb25zSlNET00ucmVxdWVzdE9wdGlvbnMuY29udGVudFR5cGUgPSAnanNvbic7XG5cblx0XHQvL2xldCB1cmwgPSBvcHRpb25zUnVudGltZVtTWU1CT0xfQ0FDSEVdLnVybDtcblxuXHRcdG9wdGlvbnNSdW50aW1lLm9wdGlvbnNKU0RPTS5jb29raWVKYXJcblx0XHQvLy5zZXRDb29raWVTeW5jKCdvdmVyMTg9eWVzOyBEb21haW49LnN5b3NldHUuY29tOyBQYXRoPS8nLCB1cmwuaHJlZilcblx0XHQ7XG5cblx0XHRyZXR1cm4gdGhpcztcblx0fVxuXG5cdGNyZWF0ZU1haW5Vcmw8VD4odXJsOiBzdHJpbmcgfCBVUkwsIG9wdGlvbnNSdW50aW1lOiBUICYgSU9wdGlvbnNSdW50aW1lKVxuXHR7XG5cdFx0bGV0IGRhdGEgPSB0aGlzLnBhcnNlVXJsKHVybCk7XG5cblx0XHRpZiAoIWRhdGEgfHwgIWRhdGEubm92ZWxfaWQpXG5cdFx0e1xuXHRcdFx0Y29uc29sZS5sb2coZGF0YSk7XG5cblx0XHRcdHRocm93IG5ldyBSZWZlcmVuY2VFcnJvcigpO1xuXHRcdH1cblxuXHRcdGxldCByZXQgPSB0aGlzLm1ha2VVcmwoZGF0YSwgdHJ1ZSwgb3B0aW9uc1J1bnRpbWUpO1xuXG5cdFx0cmV0dXJuIHJldDtcblx0fVxuXG5cdF9zdHJpcENvbnRlbnQodGV4dDogc3RyaW5nKVxuXHR7XG5cdFx0dGV4dCA9IHN0cmlwQ29udGVudCh0ZXh0KTtcblxuXHRcdC8vcHJvY2Vzcy5leGl0KCk7XG5cblx0XHRyZXR1cm4gdGV4dFxuXHRcdFx0Ly8ucmVwbGFjZSgvXuOAgOOAgC9nbSwgJycpXG5cdFx0XHQucmVwbGFjZSgvXltcXHVGRUZGXFx4QTBdKy9nbSwgJycpXG5cdFx0XHQvLyDkv67mraPmr4/ooYzplovpoK3lpJrlh7rnqbrnmb3nmoTllY/poYxcblx0XHRcdC5yZXBsYWNlKC9eICsvZ20sICcnKVxuXHRcdFx0LnJlcGxhY2UoLyArJC9nbSwgJycpXG5cdFx0XHQucmVwbGFjZSgvXFxzKyQvLCAnJylcblx0XHQ7XG5cdH1cblxuXHRwcm90ZWN0ZWQgX3NhdmVSZWFkbWUob3B0aW9uc1J1bnRpbWU6IElPcHRpb25zUnVudGltZSwgb3B0aW9ucyA9IHt9LCAuLi5vcHRzKVxuXHR7XG5cdFx0b3B0aW9uc1t0aGlzLklES0VZXSA9IHtcblx0XHRcdG5vdmVsX2lkOiBvcHRpb25zUnVudGltZVtTWU1CT0xfQ0FDSEVdLm5vdmVsLm5vdmVsX2lkLFxuXHRcdH07XG5cblx0XHRyZXR1cm4gc3VwZXIuX3NhdmVSZWFkbWUob3B0aW9uc1J1bnRpbWUsIG9wdGlvbnMsIHtcblx0XHRcdC8vXG5cdFx0fSwgLi4ub3B0cyk7XG5cdH1cblxuXHRwcm90ZWN0ZWQgX3BhcnNlQ2hhcHRlcjxUPihyZXQ6IElGZXRjaENoYXB0ZXIsIG9wdGlvbnNSdW50aW1lOiBUICYgSU9wdGlvbnNSdW50aW1lLCBjYWNoZSk6IHN0cmluZ1xuXHR7XG5cdFx0aWYgKCFyZXQpXG5cdFx0e1xuXHRcdFx0cmV0dXJuICcnO1xuXHRcdH1cblxuXHRcdGxldCBib2R5X3NlbGVjdG9yID0gJ2JvZHknO1xuXG5cdFx0dHJ5XG5cdFx0e1xuLy9cdFx0XHRsZXQgaHRtbCA9IG1pbmlmeUhUTUwocmV0LmRvbS4kKGJvZHlfc2VsZWN0b3IpLmh0bWwoKSk7XG4vL1xuLy9cdFx0XHQvL2h0bWwgPSBodG1sLnJlcGxhY2UoL14oJm5ic3A7KXs0fS9nbSwgJycpO1xuLy9cdFx0XHRodG1sID0gaHRtbC5yZXBsYWNlKC9eXFxzK3xcXHMrJC9nLCAnJyk7XG4vL1xuLy9cdFx0XHRyZXQuZG9tLiQoYm9keV9zZWxlY3RvcikuaHRtbChodG1sKTtcblx0XHR9XG5cdFx0Y2F0Y2ggKGUpXG5cdFx0e1xuXG5cdFx0fVxuXG5cdFx0bGV0IHRleHQ6IHN0cmluZztcblxuXHRcdGlmIChyZXQuZG9tKVxuXHRcdHtcblx0XHRcdHRleHQgPSByZXQuZG9tLiQoYm9keV9zZWxlY3RvcikudGV4dCgpO1xuXHRcdH1cblx0XHRlbHNlXG5cdFx0e1xuXHRcdFx0cmV0LmRvbSA9IGNyZWF0ZUpTRE9NKHJldC5ib2R5LnRvU3RyaW5nKCkpO1xuXG5cdFx0XHR0ZXh0ID0gcmV0LmRvbS4kKGJvZHlfc2VsZWN0b3IpLnRleHQoKTtcblx0XHR9XG5cblx0XHRpZiAocmV0LmRvbSAmJiByZXQuZG9tLiQgJiYgcmV0LmRvbS4kKCdpbWcnKS5sZW5ndGgpXG5cdFx0e1xuXHRcdFx0bGV0ICQgPSByZXQuZG9tLiQ7XG5cblx0XHRcdGNhY2hlLmNoYXB0ZXIuaW1ncyA9IGNhY2hlLmNoYXB0ZXIuaW1ncyB8fCBbXTtcblxuXHRcdFx0cmV0LmRvbS4kKCdpbWdbc3JjXScpLmVhY2goZnVuY3Rpb24gKClcblx0XHRcdHtcblx0XHRcdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdFx0XHRjYWNoZS5jaGFwdGVyLmltZ3MucHVzaCgkKHRoaXMpLnByb3AoJ3NyYycpKTtcblx0XHRcdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdFx0XHRjYWNoZS5ub3ZlbC5pbWdzLnB1c2goJCh0aGlzKS5wcm9wKCdzcmMnKSk7XG5cdFx0XHR9KTtcblx0XHR9XG5cblx0XHR0ZXh0ID0gdGhpcy5fc3RyaXBDb250ZW50KHRleHQpO1xuXG5cdFx0bGV0IHNwID0gJ1tcXHUwMGEwIOOAgF0qJztcblxuXHRcdGxldCByID0gbmV3IHpoUmVnRXhwKGBeW1xcdTAwYTAg44CAXFxcXHNdKiR7ZXNjYXBlUmVnZXhwKGNhY2hlLnZvbHVtZS52b2x1bWVfdGl0bGUpfSR7c3B9JHtlc2NhcGVSZWdleHAoY2FjaGUuY2hhcHRlci5jaGFwdGVyX3RpdGxlKX0ke3NwfWAsICdpZycpO1xuXG5cdFx0dGV4dCA9IHRleHRcblx0XHRcdC5yZXBsYWNlKHIsICcnKVxuXHRcdDtcblxuXHRcdHJldHVybiB0ZXh0O1xuXHR9XG5cblx0Ly8gQHRzLWlnbm9yZVxuXHRfY3JlYXRlQ2hhcHRlclVybDxUID0gSU9wdGlvbnNSdW50aW1lPih7XG5cdFx0bm92ZWwsXG5cdFx0dm9sdW1lLFxuXHRcdGNoYXB0ZXIsXG5cdH0sIG9wdGlvbnNSdW50aW1lPylcblx0e1xuXHRcdC8vIEB0cy1pZ25vcmVcblx0XHRyZXR1cm4gbmV3IFVSTChjaGFwdGVyLmNoYXB0ZXJfdXJsKTtcblx0fVxuXG5cdGFzeW5jIGdldF92b2x1bWVfbGlzdDxUID0gSU9wdGlvbnNSdW50aW1lPihpbnB1dFVybDogc3RyaW5nIHwgVVJMLFxuXHRcdG9wdGlvbnNSdW50aW1lOiBQYXJ0aWFsPFQgJiBJRG93bmxvYWRPcHRpb25zPiA9IHt9XG5cdCk6IFByb21pc2U8SU5vdmVsPlxuXHR7XG5cdFx0Y29uc3Qgc2VsZiA9IHRoaXM7XG5cdFx0bGV0IHVybCA9IGF3YWl0IHRoaXMuY3JlYXRlTWFpblVybChpbnB1dFVybCwgb3B0aW9uc1J1bnRpbWUpO1xuXG5cdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdHJldHVybiByZXRyeVJlcXVlc3QodXJsLCBvcHRpb25zUnVudGltZS5yZXF1ZXN0T3B0aW9ucylcblx0XHRcdC50aGVuKGFzeW5jIGZ1bmN0aW9uIChkb20pXG5cdFx0XHR7XG5cdFx0XHRcdGNvbnN0ICQgPSBkb20uJDtcblxuXHRcdFx0XHRkb20gPSBKU09OLnBhcnNlKGRvbSBhcyBzdHJpbmcpO1xuXG5cdFx0XHRcdGxldCBkYXRhX21ldGEgPSBhd2FpdCBzZWxmLl9nZXRfbWV0YSh1cmwsIG9wdGlvbnNSdW50aW1lLCB7XG5cdFx0XHRcdFx0ZG9tLFxuXHRcdFx0XHR9KTtcblxuXHRcdFx0XHR1cmwgPSBkYXRhX21ldGEudXJsO1xuXHRcdFx0XHRsZXQgdXJsX2RhdGEgPSBkYXRhX21ldGEudXJsX2RhdGE7XG5cblx0XHRcdFx0bGV0IF9jYWNoZV9kYXRlcyA9IFtdO1xuXHRcdFx0XHRsZXQgdm9sdW1lX2xpc3QgPSBbXSBhcyBfTm92ZWxTaXRlLklWb2x1bWVbXTtcblxuXHRcdFx0XHRsZXQgY3VycmVudFZvbHVtZTogX05vdmVsU2l0ZS5JVm9sdW1lO1xuXG5cdFx0XHRcdGxldCB0YWJsZSA9IGRvbTtcblxuXHRcdFx0XHR0YWJsZS5mb3JFYWNoKGZ1bmN0aW9uICh2b2x1bWVEYXRhOiB7XG5cdFx0XHRcdFx0dm9sdW1lX2lkOiBudW1iZXIsXG5cdFx0XHRcdFx0aWQ6IG51bWJlcixcblx0XHRcdFx0XHR2b2x1bWVfbmFtZTogc3RyaW5nLFxuXHRcdFx0XHRcdHZvbHVtZV9vcmRlcjogbnVtYmVyLFxuXHRcdFx0XHRcdGNoYXB0ZXJzOiB7XG5cdFx0XHRcdFx0XHRjaGFwdGVyX2lkOiBudW1iZXIsXG5cdFx0XHRcdFx0XHRjaGFwdGVyX25hbWU6IHN0cmluZyxcblx0XHRcdFx0XHRcdGNoYXB0ZXJfb3JkZXI6IG51bWJlcixcblx0XHRcdFx0XHR9W10sXG5cdFx0XHRcdH0pXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRjdXJyZW50Vm9sdW1lID0gdm9sdW1lX2xpc3Rbdm9sdW1lX2xpc3QubGVuZ3RoXSA9IHtcblx0XHRcdFx0XHRcdHZvbHVtZV9pbmRleDogdm9sdW1lX2xpc3QubGVuZ3RoLFxuXHRcdFx0XHRcdFx0dm9sdW1lX3RpdGxlOiBub3ZlbFRleHQudHJpbSh2b2x1bWVEYXRhLnZvbHVtZV9uYW1lKSxcblx0XHRcdFx0XHRcdHZvbHVtZV9pczogdm9sdW1lRGF0YS52b2x1bWVfaWQsXG5cdFx0XHRcdFx0XHR2b2x1bWVfb3JkZXI6IHZvbHVtZURhdGEudm9sdW1lX29yZGVyLFxuXHRcdFx0XHRcdFx0Y2hhcHRlcl9saXN0OiBbXSxcblx0XHRcdFx0XHR9O1xuXG5cdFx0XHRcdFx0dm9sdW1lRGF0YS5jaGFwdGVycy5mb3JFYWNoKGZ1bmN0aW9uIChjaGFwdGVyRGF0YSlcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRsZXQgY2hhcHRlcl91cmwgPSBzZWxmLm1ha2VVcmwoe1xuXHRcdFx0XHRcdFx0XHRjaGFwdGVyX2lkOiBjaGFwdGVyRGF0YS5jaGFwdGVyX2lkLFxuXHRcdFx0XHRcdFx0XHRub3ZlbF9pZDogZGF0YV9tZXRhLm5vdmVsX2lkLFxuXHRcdFx0XHRcdFx0XHR2b2x1bWVfaWQ6IHZvbHVtZURhdGEudm9sdW1lX2lkLFxuXHRcdFx0XHRcdFx0fSk7XG5cblx0XHRcdFx0XHRcdGxldCBjaGFwdGVyX3VybF9kYXRhID0gc2VsZi5wYXJzZVVybChjaGFwdGVyX3VybCk7XG5cblx0XHRcdFx0XHRcdGN1cnJlbnRWb2x1bWVcblx0XHRcdFx0XHRcdFx0LmNoYXB0ZXJfbGlzdFxuXHRcdFx0XHRcdFx0XHQucHVzaCh7XG5cdFx0XHRcdFx0XHRcdFx0Y2hhcHRlcl9pbmRleDogY3VycmVudFZvbHVtZS5jaGFwdGVyX2xpc3QubGVuZ3RoLFxuXHRcdFx0XHRcdFx0XHRcdGNoYXB0ZXJfdGl0bGU6IG5vdmVsVGV4dC50cmltKGNoYXB0ZXJEYXRhLmNoYXB0ZXJfbmFtZSksXG5cdFx0XHRcdFx0XHRcdFx0Y2hhcHRlcl9pZDogY2hhcHRlckRhdGEuY2hhcHRlcl9pZCxcblx0XHRcdFx0XHRcdFx0XHRjaGFwdGVyX29yZGVyOiBjaGFwdGVyRGF0YS5jaGFwdGVyX29yZGVyLFxuXHRcdFx0XHRcdFx0XHRcdGNoYXB0ZXJfdXJsLFxuXHRcdFx0XHRcdFx0XHRcdGNoYXB0ZXJfdXJsX2RhdGEsXG5cdFx0XHRcdFx0XHRcdH0pXG5cdFx0XHRcdFx0XHQ7XG5cdFx0XHRcdFx0fSk7XG5cdFx0XHRcdH0pO1xuXG5cdFx0XHRcdGxldCBub3ZlbF9kYXRlO1xuXG5cdFx0XHRcdGlmIChfY2FjaGVfZGF0ZXMubGVuZ3RoKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0X2NhY2hlX2RhdGVzLnNvcnQoKTtcblxuXHRcdFx0XHRcdG5vdmVsX2RhdGUgPSBtb21lbnQudW5peChfY2FjaGVfZGF0ZXNbX2NhY2hlX2RhdGVzLmxlbmd0aCAtIDFdKS5sb2NhbCgpO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0cmV0dXJuIHtcblxuXHRcdFx0XHRcdHVybCxcblx0XHRcdFx0XHR1cmxfZGF0YSxcblxuXHRcdFx0XHRcdC4uLmRhdGFfbWV0YSxcblxuXHRcdFx0XHRcdHZvbHVtZV9saXN0LFxuXG5cdFx0XHRcdFx0Ly9ub3ZlbF9kYXRlLFxuXG5cdFx0XHRcdFx0Y2hlY2tkYXRlOiBtb21lbnQoKS5sb2NhbCgpLFxuXG5cdFx0XHRcdFx0aW1nczogW10gYXMgc3RyaW5nW10sXG5cdFx0XHRcdH0gYXMgSU5vdmVsO1xuXHRcdFx0fSlcblx0XHRcdC50YXAoZnVuY3Rpb24gKG5vdmVsKVxuXHRcdFx0e1xuXHRcdFx0XHRjb25zb2xlLmRpcihub3ZlbCwge1xuXHRcdFx0XHRcdGNvbG9yczogdHJ1ZSxcblx0XHRcdFx0XHQvL2RlcHRoOiAzLFxuXHRcdFx0XHR9KTtcblx0XHRcdH0pXG5cdFx0XHQ7XG5cdH1cblxuXHRwcm90ZWN0ZWQgYXN5bmMgX2dldF9tZXRhKGlucHV0VXJsLCBvcHRpb25zUnVudGltZSwgY2FjaGU6IHtcblx0XHRkb206IElKU0RPTSxcblx0fSlcblx0e1xuXHRcdGNvbnN0IHNlbGYgPSB0aGlzO1xuXG5cdFx0bGV0IHVybCA9IHNlbGYubWFrZVVybChzZWxmLnBhcnNlVXJsKGlucHV0VXJsKSwgLTEpO1xuXHRcdGxldCB1cmxfZGF0YSA9IHNlbGYucGFyc2VVcmwodXJsKTtcblxuXHRcdHJldHVybiByZXRyeVJlcXVlc3QodXJsLCBvcHRpb25zUnVudGltZS5yZXF1ZXN0T3B0aW9ucylcblx0XHQvL3JldHVybiBmcm9tVVJMKHVybCwgb3B0aW9uc1J1bnRpbWUub3B0aW9uc0pTRE9NKVxuXHRcdC8vcmV0dXJuIFByb21pc2UucmVzb2x2ZShjYWNoZS5kb20pXG5cdFx0XHQudGhlbihmdW5jdGlvbiAoZG9tSnNvbilcblx0XHRcdHtcblx0XHRcdFx0ZG9tSnNvbiA9IEpTT04ucGFyc2UoZG9tSnNvbiBhcyBzdHJpbmcpO1xuXG5cdFx0XHRcdGxldCBkYXRhOiBJTWRjb25mTWV0YSA9IHt9O1xuXHRcdFx0XHRkYXRhLm5vdmVsID0ge307XG5cdFx0XHRcdGRhdGEubm92ZWwudGFncyA9IFtdO1xuXG5cdFx0XHRcdGxldCBub3ZlbF90aXRsZSA9IGRvbUpzb24ubmFtZTtcblx0XHRcdFx0bGV0IG5vdmVsX2F1dGhvciA9IGRvbUpzb24uYXV0aG9ycztcblxuXHRcdFx0XHRkb21Kc29uLnR5cGVzID0gZG9tSnNvbi50eXBlcyB8fCBbXTtcblx0XHRcdFx0ZG9tSnNvbi50eXBlcy5mb3JFYWNoKGZ1bmN0aW9uIChzKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0ZGF0YS5ub3ZlbC50YWdzLnB1c2goLi4ucy5zcGxpdCgnXFwvJykpXG5cdFx0XHRcdH0pO1xuXG5cdFx0XHRcdGRhdGEubm92ZWwudGFncy5wdXNoKGRvbUpzb24uem9uZSk7XG5cdFx0XHRcdC8vZGF0YS5ub3ZlbC50YWdzLnB1c2goZG9tSnNvbi5zdGF0dXMpO1xuXG5cdFx0XHRcdGRhdGEubm92ZWwuc3RhdHVzID0gZG9tSnNvbi5zdGF0dXM7XG5cblx0XHRcdFx0bGV0IG5vdmVsX2NvdmVyID0gZG9tSnNvbi5jb3Zlcjtcblx0XHRcdFx0bGV0IG5vdmVsX2Rlc2MgPSBkb21Kc29uLmludHJvZHVjdGlvbjtcblxuXHRcdFx0XHRsZXQgbm92ZWxfaWQgPSBkb21Kc29uLmlkO1xuXG5cdFx0XHRcdGxldCBub3ZlbF9kYXRlID0gbW9tZW50LnVuaXgoZG9tSnNvbi5sYXN0X3VwZGF0ZV90aW1lKS5sb2NhbCgpO1xuXG5cdFx0XHRcdC8vY29uc29sZS5sb2coZG9tSnNvbik7XG5cblx0XHRcdFx0bGV0IGRtempfYXBpX2pzb24gPSBkb21Kc29uO1xuXG5cdFx0XHRcdGxldCBub3ZlbF91cmwgPSBzZWxmLm1ha2VVcmwodXJsX2RhdGEsIDIpO1xuXG5cdFx0XHRcdHJldHVybiB7XG5cdFx0XHRcdFx0dXJsOiBub3ZlbF91cmwsXG5cdFx0XHRcdFx0dXJsX2RhdGE6IHNlbGYucGFyc2VVcmwobm92ZWxfdXJsKSxcblxuXHRcdFx0XHRcdHVybF9hcGk6IHVybCxcblx0XHRcdFx0XHR1cmxfZGF0YV9hcGk6IHVybF9kYXRhLFxuXG5cdFx0XHRcdFx0Li4uZGF0YSxcblxuXHRcdFx0XHRcdG5vdmVsX3VybCxcblxuXHRcdFx0XHRcdG5vdmVsX2lkLFxuXG5cdFx0XHRcdFx0bm92ZWxfdGl0bGUsXG5cblx0XHRcdFx0XHRub3ZlbF9jb3ZlcixcblxuXHRcdFx0XHRcdG5vdmVsX2F1dGhvcixcblx0XHRcdFx0XHRub3ZlbF9kZXNjLFxuXG5cdFx0XHRcdFx0bm92ZWxfZGF0ZSxcblxuXHRcdFx0XHRcdGRtempfYXBpX2pzb24sXG5cblx0XHRcdFx0fTtcblx0XHRcdH0pXG5cdFx0XHQ7XG5cdH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgTm92ZWxTaXRlVHBsO1xuIl19