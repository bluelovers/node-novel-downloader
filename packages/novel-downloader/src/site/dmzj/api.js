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
const html_1 = require("../../util/html");
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
    async _parseChapter(ret, optionsRuntime, cache) {
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
        const $ = ret.dom.$;
        if (ret.dom.$('img').length) {
            cache.chapter.imgs = cache.chapter.imgs || [];
            ret.dom.$('img[src]').each(function () {
                // @ts-ignore
                cache.chapter.imgs.push(ret.dom.$(this).prop('src'));
                // @ts-ignore
                cache.novel.imgs.push(ret.dom.$(this).prop('src'));
            });
            if (optionsRuntime.keepImage) {
                await html_1._keepImageInContext(ret.dom.$('img[src]'), ret.dom.$);
            }
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYXBpLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7R0FFRzs7Ozs7Ozs7QUFFSCx1Q0FBMkM7QUFDM0MsdUNBQTJDO0FBQzNDLHFDQUFtRjtBQUNuRixvQ0FBbUY7QUFJbkYsdUNBQXlDO0FBQ3pDLHlDQUFnQztBQUdoQyxvQ0FBa0M7QUFDbEMsMkNBQW1DO0FBQ25DLDZCQUE2QjtBQUU3QiwyQ0FBc0M7QUFDdEMsNkNBQXFFO0FBQ3JFLDBDQUFzRDtBQUV0RCw4REFBOEQ7QUFHOUQsSUFBYSxZQUFZLEdBQXpCLE1BQWEsWUFBYSxTQUFRLGNBQWE7SUFJOUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxHQUF3QyxFQUFFLE9BQVE7UUFFOUQsYUFBYTtRQUNiLE9BQU8sWUFBWSxDQUFDLElBQUksQ0FBQyxJQUFJLGVBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxRQUFRLElBQUksRUFBRSxDQUFDLENBQUM7SUFDdkQsQ0FBQztJQUVELE9BQU8sQ0FBSSxNQUE0QixFQUFFLElBQXVCLEVBQUUsY0FBb0M7UUFFckcsSUFBSSxHQUFXLENBQUM7UUFFaEIsSUFBSSxJQUFJLEtBQUssQ0FBQyxJQUFJLE1BQU0sQ0FBQyxRQUFRLEVBQ2pDO1lBQ0MsR0FBRyxHQUFHLHFCQUFxQixNQUFNLENBQUMsUUFBUSxjQUFjLENBQUM7U0FDekQ7YUFDSSxJQUFJLENBQUMsSUFBSSxJQUFJLE1BQU0sQ0FBQyxTQUFTLElBQUksTUFBTSxDQUFDLFVBQVUsRUFDdkQ7WUFDQyxHQUFHLEdBQUcseUNBQXlDLE1BQU0sQ0FBQyxRQUFRLElBQUksTUFBTSxDQUFDLFNBQVMsSUFBSSxNQUFNLENBQUMsVUFBVSxNQUFNLENBQUM7U0FDOUc7YUFDSSxJQUFJLElBQUksS0FBSyxJQUFJLElBQUksTUFBTSxDQUFDLFFBQVEsRUFDekM7WUFDQyxHQUFHLEdBQUcsd0NBQXdDLE1BQU0sQ0FBQyxRQUFRLE9BQU8sQ0FBQztTQUNyRTth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LElBQUksQ0FBQyxDQUFDO1lBQ25DLHVDQUF1QztZQUV2QyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDO1lBRW5DLElBQUksV0FBVyxHQUFHLE9BQU8sQ0FBQyxLQUFLLENBQUM7WUFDaEMsSUFBSSxVQUFVLEdBQUcsT0FBTyxDQUFDLFlBQVksQ0FBQztZQUV0QyxJQUFJLFFBQVEsR0FBRyxPQUFPLENBQUMsRUFBRSxDQUFDO1lBRTFCLElBQUksVUFBVSxHQUFHLGNBQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLGdCQUFnQixDQUFDLENBQUMsS0FBSyxFQUFFLENBQUM7WUFFL0QsdUJBQXVCO1lBRXZCLElBQUksYUFBYSxHQUFHLE9BQU8sQ0FBQztZQUU1QixJQUFJLFNBQVMsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUUxQyxxQ0FDQyxHQUFHLEVBQUUsU0FBUyxFQUNkLFFBQVEsRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxFQUVsQyxPQUFPLEVBQUUsR0FBRyxFQUNaLFlBQVksRUFBRSxRQUFRLElBRW5CLElBQUksS0FFUCxTQUFTO2dCQUVULFFBQVE7Z0JBRVIsV0FBVztnQkFFWCxXQUFXO2dCQUVYLFlBQVk7Z0JBQ1osVUFBVTtnQkFFVixVQUFVO2dCQUVWLGFBQWEsSUFFWjtRQUNILENBQUMsQ0FBQyxDQUNEO0lBQ0gsQ0FBQztDQUNELENBQUE7QUE1YXVCLGtCQUFLLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsQ0FBQztBQUY1QyxZQUFZO0lBRHhCLHdCQUFnQixFQUE2QztHQUNqRCxZQUFZLENBOGF4QjtBQTlhWSxvQ0FBWTtBQWdiekIsa0JBQWUsWUFBWSxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDcmVhdGVkIGJ5IHVzZXIgb24gMjAxOC8zLzI1LzAyNS5cbiAqL1xuXG5pbXBvcnQgeyByZXRyeVJlcXVlc3QgfSBmcm9tICcuLi8uLi9mZXRjaCc7XG5pbXBvcnQgeyBzdHJpcENvbnRlbnQgfSBmcm9tICcuLi8uLi9zdHJpcCc7XG5pbXBvcnQgeyBhcnJheV91bmlxdWUsIGVzY2FwZVJlZ2V4cCwgaXNVbmRlZiwgbWluaWZ5SFRNTCwgdHJpbSB9IGZyb20gJy4uLy4uL3V0aWwnO1xuaW1wb3J0IF9Ob3ZlbFNpdGUsIHsgc3RhdGljSW1wbGVtZW50cywgU1lNQk9MX0NBQ0hFLCBJTWRjb25mTWV0YSB9IGZyb20gJy4uL2luZGV4JztcbmltcG9ydCB7IElEb3dubG9hZE9wdGlvbnMsIElOb3ZlbCB9IGZyb20gJy4uL2RlbW8vYmFzZSc7XG5pbXBvcnQgeyBJRmV0Y2hDaGFwdGVyLCBJT3B0aW9uc1J1bnRpbWUgfSBmcm9tICcuLi9kZW1vL2Jhc2UnO1xuaW1wb3J0ICogYXMgTm92ZWxTaXRlRGVtbyBmcm9tICcuLi9kZW1vL2Jhc2UnO1xuaW1wb3J0IE5vdmVsU2l0ZUJhc2UgZnJvbSAnLi4vZGVtby9iYXNlJztcbmltcG9ydCB7IFVSTCB9IGZyb20gJ2pzZG9tLXVybCc7XG5pbXBvcnQgeyBmcm9tVVJMLCBJRnJvbVVybE9wdGlvbnMsIElKU0RPTSB9IGZyb20gJ2pzZG9tLWV4dHJhJztcbmltcG9ydCB7IFByb21pc2VCbHVlYmlyZCwgYmx1ZWJpcmREZWNvcmF0b3IgfSBmcm9tICcuLi9pbmRleCc7XG5pbXBvcnQgeyBtb21lbnQgfSBmcm9tICcuLi9pbmRleCc7XG5pbXBvcnQgbm92ZWxUZXh0IGZyb20gJ25vdmVsLXRleHQnO1xuaW1wb3J0ICogYXMgcGF0aCBmcm9tIFwicGF0aFwiO1xuaW1wb3J0ICogYXMgU3RyVXRpbCBmcm9tICdzdHItdXRpbCc7XG5pbXBvcnQgeyB6aFJlZ0V4cCB9IGZyb20gJ3JlZ2V4cC1jamsnO1xuaW1wb3J0IHsgcmVxdWVzdFRvSlNET00sIHBhY2tKU0RPTSwgY3JlYXRlSlNET00gfSBmcm9tICdqc2RvbS1leHRyYSc7XG5pbXBvcnQgeyBfa2VlcEltYWdlSW5Db250ZXh0IH0gZnJvbSAnLi4vLi4vdXRpbC9odG1sJztcblxuLy9pbXBvcnQgZXNjYXBlU3RyaW5nUmVnZXhwID0gcmVxdWlyZSgnZXNjYXBlLXN0cmluZy1yZWdleHAnKTtcblxuQHN0YXRpY0ltcGxlbWVudHM8X05vdmVsU2l0ZS5JTm92ZWxTaXRlU3RhdGljPE5vdmVsU2l0ZVRwbD4+KClcbmV4cG9ydCBjbGFzcyBOb3ZlbFNpdGVUcGwgZXh0ZW5kcyBOb3ZlbFNpdGVCYXNlXG57XG5cdHB1YmxpYyBzdGF0aWMgcmVhZG9ubHkgSURLRVkgPSBwYXRoLmJhc2VuYW1lKF9fZGlybmFtZSk7XG5cblx0c3RhdGljIGNoZWNrKHVybDogc3RyaW5nIHwgVVJMIHwgX05vdmVsU2l0ZS5JUGFyc2VVcmwsIG9wdGlvbnM/KTogYm9vbGVhblxuXHR7XG5cdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdHJldHVybiAvZG16alxcLmNvbS9pLnRlc3QobmV3IFVSTCh1cmwpLmhvc3RuYW1lIHx8ICcnKTtcblx0fVxuXG5cdG1ha2VVcmw8VD4odXJsb2JqOiBfTm92ZWxTaXRlLklQYXJzZVVybCwgYm9vbD86IGJvb2xlYW4gfCBudW1iZXIsIG9wdGlvbnNSdW50aW1lPzogVCAmIElPcHRpb25zUnVudGltZSk6IFVSTFxuXHR7XG5cdFx0bGV0IHVybDogc3RyaW5nO1xuXG5cdFx0aWYgKGJvb2wgPT09IDIgJiYgdXJsb2JqLm5vdmVsX2lkKVxuXHRcdHtcblx0XHRcdHVybCA9IGBodHRwOi8vcS5kbXpqLmNvbS8ke3VybG9iai5ub3ZlbF9pZH0vaW5kZXguc2h0bWxgO1xuXHRcdH1cblx0XHRlbHNlIGlmICghYm9vbCAmJiB1cmxvYmoudm9sdW1lX2lkICYmIHVybG9iai5jaGFwdGVyX2lkKVxuXHRcdHtcblx0XHRcdHVybCA9IGBodHRwOi8vdjIuYXBpLmRtemouY29tL25vdmVsL2Rvd25sb2FkLyR7dXJsb2JqLm5vdmVsX2lkfV8ke3VybG9iai52b2x1bWVfaWR9XyR7dXJsb2JqLmNoYXB0ZXJfaWR9LnR4dGA7XG5cdFx0fVxuXHRcdGVsc2UgaWYgKGJvb2wgPT09IHRydWUgJiYgdXJsb2JqLm5vdmVsX2lkKVxuXHRcdHtcblx0XHRcdHVybCA9IGBodHRwOi8vdjIuYXBpLmRtemouY29tL25vdmVsL2NoYXB0ZXIvJHt1cmxvYmoubm92ZWxfaWR9Lmpzb25gO1xuXHRcdH1cblx0XHRlbHNlXG5cdFx0e1xuXHRcdFx0dXJsID0gYGh0dHA6Ly92Mi5hcGkuZG16ai5jb20vbm92ZWwvJHt1cmxvYmoubm92ZWxfaWR9Lmpzb25gO1xuXHRcdH1cblxuXHRcdC8vIEB0cy1pZ25vcmVcblx0XHRyZXR1cm4gbmV3IFVSTCh1cmwpO1xuXHR9XG5cblx0cGFyc2VVcmwodXJsOiBVUkwgfCBzdHJpbmcsIG9wdGlvbnM/KTogX05vdmVsU2l0ZS5JUGFyc2VVcmxcblx0e1xuXHRcdGxldCB1cmxvYmogPSB7XG5cdFx0XHR1cmw6IHVybCxcblxuXHRcdFx0bm92ZWxfaWQ6IG51bGwsXG5cdFx0XHRjaGFwdGVyX2lkOiBudWxsLFxuXG5cdFx0XHR2b2x1bWVfaWQ6IG51bGwsXG5cdFx0fTtcblxuXHRcdHRyeVxuXHRcdHtcblx0XHRcdC8vIEB0cy1pZ25vcmVcblx0XHRcdHVybG9iai51cmwgPSBuZXcgVVJMKHVybCk7XG5cdFx0XHQvLyBAdHMtaWdub3JlXG5cdFx0XHR1cmwgPSB1cmxvYmoudXJsLmhyZWY7XG5cdFx0fVxuXHRcdGNhdGNoIChlKVxuXHRcdHtcblx0XHRcdGNvbnNvbGUud2FybihlLnRvU3RyaW5nKCkgKyBgIFwiJHt1cmx9XCJgKTtcblx0XHR9XG5cblx0XHRsZXQgciA9IC9hcGlcXC5kbXpqXFwuY29tXFwvbm92ZWxcXC8oXFxkKykuanNvbi87XG5cblx0XHRsZXQgbSA9IHIuZXhlYyh1cmwgYXMgc3RyaW5nKTtcblx0XHRpZiAobSlcblx0XHR7XG5cdFx0XHR1cmxvYmoubm92ZWxfaWQgPSBtWzFdO1xuXG5cdFx0XHRyZXR1cm4gdXJsb2JqO1xuXHRcdH1cblxuXHRcdHIgPSAvXihcXGQrKSQvO1xuXHRcdGlmIChtID0gci5leGVjKHVybCBhcyBzdHJpbmcpKVxuXHRcdHtcblx0XHRcdHVybG9iai5ub3ZlbF9pZCA9IG1bMV07XG5cblx0XHRcdHJldHVybiB1cmxvYmo7XG5cdFx0fVxuXG5cdFx0ciA9IC9hcGlcXC5kbXpqXFwuY29tXFwvbm92ZWxcXC9jaGFwdGVyXFwvKFxcZCspLmpzb24vO1xuXHRcdGlmIChtID0gci5leGVjKHVybCBhcyBzdHJpbmcpKVxuXHRcdHtcblx0XHRcdHVybG9iai5ub3ZlbF9pZCA9IG1bMV07XG5cblx0XHRcdHJldHVybiB1cmxvYmo7XG5cdFx0fVxuXG5cdFx0ciA9IC9hcGlcXC5kbXpqXFwuY29tXFwvbm92ZWxcXC9kb3dubG9hZFxcLyhcXGQrKV8oXFxkKylfKFxcZCspLnR4dC87XG5cdFx0aWYgKG0gPSByLmV4ZWModXJsIGFzIHN0cmluZykpXG5cdFx0e1xuXHRcdFx0dXJsb2JqLm5vdmVsX2lkID0gbVsxXTtcblx0XHRcdHVybG9iai52b2x1bWVfaWQgPSBtWzJdO1xuXHRcdFx0dXJsb2JqLmNoYXB0ZXJfaWQgPSBtWzNdO1xuXG5cdFx0XHRyZXR1cm4gdXJsb2JqO1xuXHRcdH1cblxuXHRcdC8vIOaJi+apn+eJiOe2suWdgFxuXHRcdHIgPSAvKD86cVxcLmRtempcXC5jb21cXC98XlxcLykoPzooXFxkKylcXC8oPzooXFxkKylcXC8oPzooXFxkKylbXFwuX10pPyk/KS87XG5cdFx0aWYgKG0gPSByLmV4ZWModXJsIGFzIHN0cmluZykpXG5cdFx0e1xuXHRcdFx0dXJsb2JqLm5vdmVsX2lkID0gbVsxXTtcblx0XHRcdHVybG9iai52b2x1bWVfaWQgPSBtWzJdO1xuXHRcdFx0dXJsb2JqLmNoYXB0ZXJfaWQgPSBtWzNdO1xuXHRcdH1cblxuXHRcdHJldHVybiB1cmxvYmo7XG5cdH1cblxuXHRzZXNzaW9uPFQgPSBJT3B0aW9uc1J1bnRpbWU+KG9wdGlvbnNSdW50aW1lOiBQYXJ0aWFsPFQgJiBJRG93bmxvYWRPcHRpb25zPiwgdXJsOiBVUkwpXG5cdHtcblx0XHRzdXBlci5zZXNzaW9uKG9wdGlvbnNSdW50aW1lLCB1cmwpO1xuXG5cdFx0b3B0aW9uc1J1bnRpbWUub3B0aW9uc0pTRE9NLnJlcXVlc3RPcHRpb25zID0gb3B0aW9uc1J1bnRpbWUub3B0aW9uc0pTRE9NLnJlcXVlc3RPcHRpb25zIHx8IHt9O1xuXG5cdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdG9wdGlvbnNSdW50aW1lLm9wdGlvbnNKU0RPTS5yZXF1ZXN0T3B0aW9ucy5jb250ZW50VHlwZSA9ICdqc29uJztcblxuXHRcdC8vbGV0IHVybCA9IG9wdGlvbnNSdW50aW1lW1NZTUJPTF9DQUNIRV0udXJsO1xuXG5cdFx0b3B0aW9uc1J1bnRpbWUub3B0aW9uc0pTRE9NLmNvb2tpZUphclxuXHRcdC8vLnNldENvb2tpZVN5bmMoJ292ZXIxOD15ZXM7IERvbWFpbj0uc3lvc2V0dS5jb207IFBhdGg9LycsIHVybC5ocmVmKVxuXHRcdDtcblxuXHRcdHJldHVybiB0aGlzO1xuXHR9XG5cblx0Y3JlYXRlTWFpblVybDxUPih1cmw6IHN0cmluZyB8IFVSTCwgb3B0aW9uc1J1bnRpbWU6IFQgJiBJT3B0aW9uc1J1bnRpbWUpXG5cdHtcblx0XHRsZXQgZGF0YSA9IHRoaXMucGFyc2VVcmwodXJsKTtcblxuXHRcdGlmICghZGF0YSB8fCAhZGF0YS5ub3ZlbF9pZClcblx0XHR7XG5cdFx0XHRjb25zb2xlLmxvZyhkYXRhKTtcblxuXHRcdFx0dGhyb3cgbmV3IFJlZmVyZW5jZUVycm9yKCk7XG5cdFx0fVxuXG5cdFx0bGV0IHJldCA9IHRoaXMubWFrZVVybChkYXRhLCB0cnVlLCBvcHRpb25zUnVudGltZSk7XG5cblx0XHRyZXR1cm4gcmV0O1xuXHR9XG5cblx0X3N0cmlwQ29udGVudCh0ZXh0OiBzdHJpbmcpXG5cdHtcblx0XHR0ZXh0ID0gc3RyaXBDb250ZW50KHRleHQpO1xuXG5cdFx0Ly9wcm9jZXNzLmV4aXQoKTtcblxuXHRcdHJldHVybiB0ZXh0XG5cdFx0XHQvLy5yZXBsYWNlKC9e44CA44CAL2dtLCAnJylcblx0XHRcdC5yZXBsYWNlKC9eW1xcdUZFRkZcXHhBMF0rL2dtLCAnJylcblx0XHRcdC8vIOS/ruato+avj+ihjOmWi+mgreWkmuWHuuepuueZveeahOWVj+mhjFxuXHRcdFx0LnJlcGxhY2UoL14gKy9nbSwgJycpXG5cdFx0XHQucmVwbGFjZSgvICskL2dtLCAnJylcblx0XHRcdC5yZXBsYWNlKC9cXHMrJC8sICcnKVxuXHRcdDtcblx0fVxuXG5cdHByb3RlY3RlZCBfc2F2ZVJlYWRtZShvcHRpb25zUnVudGltZTogSU9wdGlvbnNSdW50aW1lLCBvcHRpb25zID0ge30sIC4uLm9wdHMpXG5cdHtcblx0XHRvcHRpb25zW3RoaXMuSURLRVldID0ge1xuXHRcdFx0bm92ZWxfaWQ6IG9wdGlvbnNSdW50aW1lW1NZTUJPTF9DQUNIRV0ubm92ZWwubm92ZWxfaWQsXG5cdFx0fTtcblxuXHRcdHJldHVybiBzdXBlci5fc2F2ZVJlYWRtZShvcHRpb25zUnVudGltZSwgb3B0aW9ucywge1xuXHRcdFx0Ly9cblx0XHR9LCAuLi5vcHRzKTtcblx0fVxuXG5cdHByb3RlY3RlZCBhc3luYyBfcGFyc2VDaGFwdGVyPFQ+KHJldDogSUZldGNoQ2hhcHRlciwgb3B0aW9uc1J1bnRpbWU6IFQgJiBJT3B0aW9uc1J1bnRpbWUsIGNhY2hlKVxuXHR7XG5cdFx0aWYgKCFyZXQpXG5cdFx0e1xuXHRcdFx0cmV0dXJuICcnO1xuXHRcdH1cblxuXHRcdGxldCBib2R5X3NlbGVjdG9yID0gJ2JvZHknO1xuXG5cdFx0dHJ5XG5cdFx0e1xuLy9cdFx0XHRsZXQgaHRtbCA9IG1pbmlmeUhUTUwocmV0LmRvbS4kKGJvZHlfc2VsZWN0b3IpLmh0bWwoKSk7XG4vL1xuLy9cdFx0XHQvL2h0bWwgPSBodG1sLnJlcGxhY2UoL14oJm5ic3A7KXs0fS9nbSwgJycpO1xuLy9cdFx0XHRodG1sID0gaHRtbC5yZXBsYWNlKC9eXFxzK3xcXHMrJC9nLCAnJyk7XG4vL1xuLy9cdFx0XHRyZXQuZG9tLiQoYm9keV9zZWxlY3RvcikuaHRtbChodG1sKTtcblx0XHR9XG5cdFx0Y2F0Y2ggKGUpXG5cdFx0e1xuXG5cdFx0fVxuXG5cdFx0bGV0IHRleHQ6IHN0cmluZztcblxuXHRcdGlmIChyZXQuZG9tKVxuXHRcdHtcblx0XHRcdHRleHQgPSByZXQuZG9tLiQoYm9keV9zZWxlY3RvcikudGV4dCgpO1xuXHRcdH1cblx0XHRlbHNlXG5cdFx0e1xuXHRcdFx0cmV0LmRvbSA9IGNyZWF0ZUpTRE9NKHJldC5ib2R5LnRvU3RyaW5nKCkpO1xuXG5cdFx0XHR0ZXh0ID0gcmV0LmRvbS4kKGJvZHlfc2VsZWN0b3IpLnRleHQoKTtcblx0XHR9XG5cblx0XHRjb25zdCAkID0gcmV0LmRvbS4kO1xuXG5cdFx0aWYgKHJldC5kb20uJCgnaW1nJykubGVuZ3RoKVxuXHRcdHtcblx0XHRcdGNhY2hlLmNoYXB0ZXIuaW1ncyA9IGNhY2hlLmNoYXB0ZXIuaW1ncyB8fCBbXTtcblxuXHRcdFx0cmV0LmRvbS4kKCdpbWdbc3JjXScpLmVhY2goZnVuY3Rpb24gKClcblx0XHRcdHtcblx0XHRcdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdFx0XHRjYWNoZS5jaGFwdGVyLmltZ3MucHVzaChyZXQuZG9tLiQodGhpcykucHJvcCgnc3JjJykpO1xuXHRcdFx0XHQvLyBAdHMtaWdub3JlXG5cdFx0XHRcdGNhY2hlLm5vdmVsLmltZ3MucHVzaChyZXQuZG9tLiQodGhpcykucHJvcCgnc3JjJykpO1xuXHRcdFx0fSk7XG5cblx0XHRcdGlmIChvcHRpb25zUnVudGltZS5rZWVwSW1hZ2UpXG5cdFx0XHR7XG5cdFx0XHRcdGF3YWl0IF9rZWVwSW1hZ2VJbkNvbnRleHQocmV0LmRvbS4kKCdpbWdbc3JjXScpLCByZXQuZG9tLiQpO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHRleHQgPSB0aGlzLl9zdHJpcENvbnRlbnQodGV4dCk7XG5cblx0XHRsZXQgc3AgPSAnW1xcdTAwYTAg44CAXSonO1xuXG5cdFx0bGV0IHIgPSBuZXcgemhSZWdFeHAoYF5bXFx1MDBhMCDjgIBcXFxcc10qJHtlc2NhcGVSZWdleHAoY2FjaGUudm9sdW1lLnZvbHVtZV90aXRsZSl9JHtzcH0ke2VzY2FwZVJlZ2V4cChjYWNoZS5jaGFwdGVyLmNoYXB0ZXJfdGl0bGUpfSR7c3B9YCwgJ2lnJyk7XG5cblx0XHR0ZXh0ID0gdGV4dFxuXHRcdFx0LnJlcGxhY2UociwgJycpXG5cdFx0O1xuXG5cdFx0cmV0dXJuIHRleHQ7XG5cdH1cblxuXHQvLyBAdHMtaWdub3JlXG5cdF9jcmVhdGVDaGFwdGVyVXJsPFQgPSBJT3B0aW9uc1J1bnRpbWU+KHtcblx0XHRub3ZlbCxcblx0XHR2b2x1bWUsXG5cdFx0Y2hhcHRlcixcblx0fSwgb3B0aW9uc1J1bnRpbWU/KVxuXHR7XG5cdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdHJldHVybiBuZXcgVVJMKGNoYXB0ZXIuY2hhcHRlcl91cmwpO1xuXHR9XG5cblx0YXN5bmMgZ2V0X3ZvbHVtZV9saXN0PFQgPSBJT3B0aW9uc1J1bnRpbWU+KGlucHV0VXJsOiBzdHJpbmcgfCBVUkwsXG5cdFx0b3B0aW9uc1J1bnRpbWU6IFBhcnRpYWw8VCAmIElEb3dubG9hZE9wdGlvbnM+ID0ge31cblx0KTogUHJvbWlzZTxJTm92ZWw+XG5cdHtcblx0XHRjb25zdCBzZWxmID0gdGhpcztcblx0XHRsZXQgdXJsID0gYXdhaXQgdGhpcy5jcmVhdGVNYWluVXJsKGlucHV0VXJsLCBvcHRpb25zUnVudGltZSk7XG5cblx0XHQvLyBAdHMtaWdub3JlXG5cdFx0cmV0dXJuIHJldHJ5UmVxdWVzdCh1cmwsIG9wdGlvbnNSdW50aW1lLnJlcXVlc3RPcHRpb25zKVxuXHRcdFx0LnRoZW4oYXN5bmMgZnVuY3Rpb24gKGRvbSlcblx0XHRcdHtcblx0XHRcdFx0Y29uc3QgJCA9IGRvbS4kO1xuXG5cdFx0XHRcdGRvbSA9IEpTT04ucGFyc2UoZG9tIGFzIHN0cmluZyk7XG5cblx0XHRcdFx0bGV0IGRhdGFfbWV0YSA9IGF3YWl0IHNlbGYuX2dldF9tZXRhKHVybCwgb3B0aW9uc1J1bnRpbWUsIHtcblx0XHRcdFx0XHRkb20sXG5cdFx0XHRcdH0pO1xuXG5cdFx0XHRcdHVybCA9IGRhdGFfbWV0YS51cmw7XG5cdFx0XHRcdGxldCB1cmxfZGF0YSA9IGRhdGFfbWV0YS51cmxfZGF0YTtcblxuXHRcdFx0XHRsZXQgX2NhY2hlX2RhdGVzID0gW107XG5cdFx0XHRcdGxldCB2b2x1bWVfbGlzdCA9IFtdIGFzIF9Ob3ZlbFNpdGUuSVZvbHVtZVtdO1xuXG5cdFx0XHRcdGxldCBjdXJyZW50Vm9sdW1lOiBfTm92ZWxTaXRlLklWb2x1bWU7XG5cblx0XHRcdFx0bGV0IHRhYmxlID0gZG9tO1xuXG5cdFx0XHRcdHRhYmxlLmZvckVhY2goZnVuY3Rpb24gKHZvbHVtZURhdGE6IHtcblx0XHRcdFx0XHR2b2x1bWVfaWQ6IG51bWJlcixcblx0XHRcdFx0XHRpZDogbnVtYmVyLFxuXHRcdFx0XHRcdHZvbHVtZV9uYW1lOiBzdHJpbmcsXG5cdFx0XHRcdFx0dm9sdW1lX29yZGVyOiBudW1iZXIsXG5cdFx0XHRcdFx0Y2hhcHRlcnM6IHtcblx0XHRcdFx0XHRcdGNoYXB0ZXJfaWQ6IG51bWJlcixcblx0XHRcdFx0XHRcdGNoYXB0ZXJfbmFtZTogc3RyaW5nLFxuXHRcdFx0XHRcdFx0Y2hhcHRlcl9vcmRlcjogbnVtYmVyLFxuXHRcdFx0XHRcdH1bXSxcblx0XHRcdFx0fSlcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGN1cnJlbnRWb2x1bWUgPSB2b2x1bWVfbGlzdFt2b2x1bWVfbGlzdC5sZW5ndGhdID0ge1xuXHRcdFx0XHRcdFx0dm9sdW1lX2luZGV4OiB2b2x1bWVfbGlzdC5sZW5ndGgsXG5cdFx0XHRcdFx0XHR2b2x1bWVfdGl0bGU6IG5vdmVsVGV4dC50cmltKHZvbHVtZURhdGEudm9sdW1lX25hbWUpLFxuXHRcdFx0XHRcdFx0dm9sdW1lX2lzOiB2b2x1bWVEYXRhLnZvbHVtZV9pZCxcblx0XHRcdFx0XHRcdHZvbHVtZV9vcmRlcjogdm9sdW1lRGF0YS52b2x1bWVfb3JkZXIsXG5cdFx0XHRcdFx0XHRjaGFwdGVyX2xpc3Q6IFtdLFxuXHRcdFx0XHRcdH07XG5cblx0XHRcdFx0XHR2b2x1bWVEYXRhLmNoYXB0ZXJzLmZvckVhY2goZnVuY3Rpb24gKGNoYXB0ZXJEYXRhKVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdGxldCBjaGFwdGVyX3VybCA9IHNlbGYubWFrZVVybCh7XG5cdFx0XHRcdFx0XHRcdGNoYXB0ZXJfaWQ6IGNoYXB0ZXJEYXRhLmNoYXB0ZXJfaWQsXG5cdFx0XHRcdFx0XHRcdG5vdmVsX2lkOiBkYXRhX21ldGEubm92ZWxfaWQsXG5cdFx0XHRcdFx0XHRcdHZvbHVtZV9pZDogdm9sdW1lRGF0YS52b2x1bWVfaWQsXG5cdFx0XHRcdFx0XHR9KTtcblxuXHRcdFx0XHRcdFx0bGV0IGNoYXB0ZXJfdXJsX2RhdGEgPSBzZWxmLnBhcnNlVXJsKGNoYXB0ZXJfdXJsKTtcblxuXHRcdFx0XHRcdFx0Y3VycmVudFZvbHVtZVxuXHRcdFx0XHRcdFx0XHQuY2hhcHRlcl9saXN0XG5cdFx0XHRcdFx0XHRcdC5wdXNoKHtcblx0XHRcdFx0XHRcdFx0XHRjaGFwdGVyX2luZGV4OiBjdXJyZW50Vm9sdW1lLmNoYXB0ZXJfbGlzdC5sZW5ndGgsXG5cdFx0XHRcdFx0XHRcdFx0Y2hhcHRlcl90aXRsZTogbm92ZWxUZXh0LnRyaW0oY2hhcHRlckRhdGEuY2hhcHRlcl9uYW1lKSxcblx0XHRcdFx0XHRcdFx0XHRjaGFwdGVyX2lkOiBjaGFwdGVyRGF0YS5jaGFwdGVyX2lkLFxuXHRcdFx0XHRcdFx0XHRcdGNoYXB0ZXJfb3JkZXI6IGNoYXB0ZXJEYXRhLmNoYXB0ZXJfb3JkZXIsXG5cdFx0XHRcdFx0XHRcdFx0Y2hhcHRlcl91cmwsXG5cdFx0XHRcdFx0XHRcdFx0Y2hhcHRlcl91cmxfZGF0YSxcblx0XHRcdFx0XHRcdFx0fSlcblx0XHRcdFx0XHRcdDtcblx0XHRcdFx0XHR9KTtcblx0XHRcdFx0fSk7XG5cblx0XHRcdFx0bGV0IG5vdmVsX2RhdGU7XG5cblx0XHRcdFx0aWYgKF9jYWNoZV9kYXRlcy5sZW5ndGgpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRfY2FjaGVfZGF0ZXMuc29ydCgpO1xuXG5cdFx0XHRcdFx0bm92ZWxfZGF0ZSA9IG1vbWVudC51bml4KF9jYWNoZV9kYXRlc1tfY2FjaGVfZGF0ZXMubGVuZ3RoIC0gMV0pLmxvY2FsKCk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRyZXR1cm4ge1xuXG5cdFx0XHRcdFx0dXJsLFxuXHRcdFx0XHRcdHVybF9kYXRhLFxuXG5cdFx0XHRcdFx0Li4uZGF0YV9tZXRhLFxuXG5cdFx0XHRcdFx0dm9sdW1lX2xpc3QsXG5cblx0XHRcdFx0XHQvL25vdmVsX2RhdGUsXG5cblx0XHRcdFx0XHRjaGVja2RhdGU6IG1vbWVudCgpLmxvY2FsKCksXG5cblx0XHRcdFx0XHRpbWdzOiBbXSBhcyBzdHJpbmdbXSxcblx0XHRcdFx0fSBhcyBJTm92ZWw7XG5cdFx0XHR9KVxuXHRcdFx0LnRhcChmdW5jdGlvbiAobm92ZWwpXG5cdFx0XHR7XG5cdFx0XHRcdGNvbnNvbGUuZGlyKG5vdmVsLCB7XG5cdFx0XHRcdFx0Y29sb3JzOiB0cnVlLFxuXHRcdFx0XHRcdC8vZGVwdGg6IDMsXG5cdFx0XHRcdH0pO1xuXHRcdFx0fSlcblx0XHRcdDtcblx0fVxuXG5cdHByb3RlY3RlZCBhc3luYyBfZ2V0X21ldGEoaW5wdXRVcmwsIG9wdGlvbnNSdW50aW1lLCBjYWNoZToge1xuXHRcdGRvbTogSUpTRE9NLFxuXHR9KVxuXHR7XG5cdFx0Y29uc3Qgc2VsZiA9IHRoaXM7XG5cblx0XHRsZXQgdXJsID0gc2VsZi5tYWtlVXJsKHNlbGYucGFyc2VVcmwoaW5wdXRVcmwpLCAtMSk7XG5cdFx0bGV0IHVybF9kYXRhID0gc2VsZi5wYXJzZVVybCh1cmwpO1xuXG5cdFx0cmV0dXJuIHJldHJ5UmVxdWVzdCh1cmwsIG9wdGlvbnNSdW50aW1lLnJlcXVlc3RPcHRpb25zKVxuXHRcdC8vcmV0dXJuIGZyb21VUkwodXJsLCBvcHRpb25zUnVudGltZS5vcHRpb25zSlNET00pXG5cdFx0Ly9yZXR1cm4gUHJvbWlzZS5yZXNvbHZlKGNhY2hlLmRvbSlcblx0XHRcdC50aGVuKGZ1bmN0aW9uIChkb21Kc29uKVxuXHRcdFx0e1xuXHRcdFx0XHRkb21Kc29uID0gSlNPTi5wYXJzZShkb21Kc29uIGFzIHN0cmluZyk7XG5cblx0XHRcdFx0bGV0IGRhdGE6IElNZGNvbmZNZXRhID0ge307XG5cdFx0XHRcdGRhdGEubm92ZWwgPSB7fTtcblx0XHRcdFx0ZGF0YS5ub3ZlbC50YWdzID0gW107XG5cblx0XHRcdFx0bGV0IG5vdmVsX3RpdGxlID0gZG9tSnNvbi5uYW1lO1xuXHRcdFx0XHRsZXQgbm92ZWxfYXV0aG9yID0gZG9tSnNvbi5hdXRob3JzO1xuXG5cdFx0XHRcdGRvbUpzb24udHlwZXMgPSBkb21Kc29uLnR5cGVzIHx8IFtdO1xuXHRcdFx0XHRkb21Kc29uLnR5cGVzLmZvckVhY2goZnVuY3Rpb24gKHMpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRkYXRhLm5vdmVsLnRhZ3MucHVzaCguLi5zLnNwbGl0KCdcXC8nKSlcblx0XHRcdFx0fSk7XG5cblx0XHRcdFx0ZGF0YS5ub3ZlbC50YWdzLnB1c2goZG9tSnNvbi56b25lKTtcblx0XHRcdFx0Ly9kYXRhLm5vdmVsLnRhZ3MucHVzaChkb21Kc29uLnN0YXR1cyk7XG5cblx0XHRcdFx0ZGF0YS5ub3ZlbC5zdGF0dXMgPSBkb21Kc29uLnN0YXR1cztcblxuXHRcdFx0XHRsZXQgbm92ZWxfY292ZXIgPSBkb21Kc29uLmNvdmVyO1xuXHRcdFx0XHRsZXQgbm92ZWxfZGVzYyA9IGRvbUpzb24uaW50cm9kdWN0aW9uO1xuXG5cdFx0XHRcdGxldCBub3ZlbF9pZCA9IGRvbUpzb24uaWQ7XG5cblx0XHRcdFx0bGV0IG5vdmVsX2RhdGUgPSBtb21lbnQudW5peChkb21Kc29uLmxhc3RfdXBkYXRlX3RpbWUpLmxvY2FsKCk7XG5cblx0XHRcdFx0Ly9jb25zb2xlLmxvZyhkb21Kc29uKTtcblxuXHRcdFx0XHRsZXQgZG16al9hcGlfanNvbiA9IGRvbUpzb247XG5cblx0XHRcdFx0bGV0IG5vdmVsX3VybCA9IHNlbGYubWFrZVVybCh1cmxfZGF0YSwgMik7XG5cblx0XHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0XHR1cmw6IG5vdmVsX3VybCxcblx0XHRcdFx0XHR1cmxfZGF0YTogc2VsZi5wYXJzZVVybChub3ZlbF91cmwpLFxuXG5cdFx0XHRcdFx0dXJsX2FwaTogdXJsLFxuXHRcdFx0XHRcdHVybF9kYXRhX2FwaTogdXJsX2RhdGEsXG5cblx0XHRcdFx0XHQuLi5kYXRhLFxuXG5cdFx0XHRcdFx0bm92ZWxfdXJsLFxuXG5cdFx0XHRcdFx0bm92ZWxfaWQsXG5cblx0XHRcdFx0XHRub3ZlbF90aXRsZSxcblxuXHRcdFx0XHRcdG5vdmVsX2NvdmVyLFxuXG5cdFx0XHRcdFx0bm92ZWxfYXV0aG9yLFxuXHRcdFx0XHRcdG5vdmVsX2Rlc2MsXG5cblx0XHRcdFx0XHRub3ZlbF9kYXRlLFxuXG5cdFx0XHRcdFx0ZG16al9hcGlfanNvbixcblxuXHRcdFx0XHR9O1xuXHRcdFx0fSlcblx0XHRcdDtcblx0fVxufVxuXG5leHBvcnQgZGVmYXVsdCBOb3ZlbFNpdGVUcGw7XG4iXX0=