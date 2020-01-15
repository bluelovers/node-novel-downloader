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
        const $ = ret.dom.$;
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
            cache.chapter.imgs = cache.chapter.imgs || [];
            $('img[src]').each(function () {
                // @ts-ignore
                cache.chapter.imgs.push($(this).prop('src'));
                // @ts-ignore
                cache.novel.imgs.push($(this).prop('src'));
            });
            if (optionsRuntime.keepImage) {
                await html_1._keepImageInContext($('img[src]'), $);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYXBpLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7R0FFRzs7Ozs7Ozs7QUFFSCx1Q0FBMkM7QUFDM0MsdUNBQTJDO0FBQzNDLHFDQUFtRjtBQUNuRixvQ0FBbUY7QUFJbkYsdUNBQXlDO0FBQ3pDLHlDQUFnQztBQUdoQyxvQ0FBa0M7QUFDbEMsMkNBQW1DO0FBQ25DLDZCQUE2QjtBQUU3QiwyQ0FBc0M7QUFDdEMsNkNBQXFFO0FBQ3JFLDBDQUFzRDtBQUV0RCw4REFBOEQ7QUFHOUQsSUFBYSxZQUFZLEdBQXpCLE1BQWEsWUFBYSxTQUFRLGNBQWE7SUFJOUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxHQUF3QyxFQUFFLE9BQVE7UUFFOUQsYUFBYTtRQUNiLE9BQU8sWUFBWSxDQUFDLElBQUksQ0FBQyxJQUFJLGVBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxRQUFRLElBQUksRUFBRSxDQUFDLENBQUM7SUFDdkQsQ0FBQztJQUVELE9BQU8sQ0FBSSxNQUE0QixFQUFFLElBQXVCLEVBQUUsY0FBb0M7UUFFckcsSUFBSSxHQUFXLENBQUM7UUFFaEIsSUFBSSxJQUFJLEtBQUssQ0FBQyxJQUFJLE1BQU0sQ0FBQyxRQUFRLEVBQ2pDO1lBQ0MsR0FBRyxHQUFHLHFCQUFxQixNQUFNLENBQUMsUUFBUSxjQUFjLENBQUM7U0FDekQ7YUFDSSxJQUFJLENBQUMsSUFBSSxJQUFJLE1BQU0sQ0FBQyxTQUFTLElBQUksTUFBTSxDQUFDLFVBQVUsRUFDdkQ7WUFDQyxHQUFHLEdBQUcseUNBQXlDLE1BQU0sQ0FBQyxRQUFRLElBQUksTUFBTSxDQUFDLFNBQVMsSUFBSSxNQUFNLENBQUMsVUFBVSxNQUFNLENBQUM7U0FDOUc7YUFDSSxJQUFJLElBQUksS0FBSyxJQUFJLElBQUksTUFBTSxDQUFDLFFBQVEsRUFDekM7WUFDQyxHQUFHLEdBQUcsd0NBQXdDLE1BQU0sQ0FBQyxRQUFRLE9BQU8sQ0FBQztTQUNyRTth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Q0FBQyxNQUFNLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQztZQUVuQyxJQUFJLFdBQVcsR0FBRyxPQUFPLENBQUMsS0FBSyxDQUFDO1lBQ2hDLElBQUksVUFBVSxHQUFHLE9BQU8sQ0FBQyxZQUFZLENBQUM7WUFFdEMsSUFBSSxRQUFRLEdBQUcsT0FBTyxDQUFDLEVBQUUsQ0FBQztZQUUxQixJQUFJLFVBQVUsR0FBRyxjQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDO1lBRS9ELHVCQUF1QjtZQUV2QixJQUFJLGFBQWEsR0FBRyxPQUFPLENBQUM7WUFFNUIsSUFBSSxTQUFTLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFFMUMscUNBQ0MsR0FBRyxFQUFFLFNBQVMsRUFDZCxRQUFRLEVBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsRUFFbEMsT0FBTyxFQUFFLEdBQUcsRUFDWixZQUFZLEVBQUUsUUFBUSxJQUVuQixJQUFJLEtBRVAsU0FBUztnQkFFVCxRQUFRO2dCQUVSLFdBQVc7Z0JBRVgsV0FBVztnQkFFWCxZQUFZO2dCQUNaLFVBQVU7Z0JBRVYsVUFBVTtnQkFFVixhQUFhLElBRVo7UUFDSCxDQUFDLENBQUMsQ0FDRDtJQUNILENBQUM7Q0FDRCxDQUFBO0FBNWF1QixrQkFBSyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLENBQUM7QUFGNUMsWUFBWTtJQUR4Qix3QkFBZ0IsRUFBNkM7R0FDakQsWUFBWSxDQThheEI7QUE5YVksb0NBQVk7QUFnYnpCLGtCQUFlLFlBQVksQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ3JlYXRlZCBieSB1c2VyIG9uIDIwMTgvMy8yNS8wMjUuXG4gKi9cblxuaW1wb3J0IHsgcmV0cnlSZXF1ZXN0IH0gZnJvbSAnLi4vLi4vZmV0Y2gnO1xuaW1wb3J0IHsgc3RyaXBDb250ZW50IH0gZnJvbSAnLi4vLi4vc3RyaXAnO1xuaW1wb3J0IHsgYXJyYXlfdW5pcXVlLCBlc2NhcGVSZWdleHAsIGlzVW5kZWYsIG1pbmlmeUhUTUwsIHRyaW0gfSBmcm9tICcuLi8uLi91dGlsJztcbmltcG9ydCBfTm92ZWxTaXRlLCB7IHN0YXRpY0ltcGxlbWVudHMsIFNZTUJPTF9DQUNIRSwgSU1kY29uZk1ldGEgfSBmcm9tICcuLi9pbmRleCc7XG5pbXBvcnQgeyBJRG93bmxvYWRPcHRpb25zLCBJTm92ZWwgfSBmcm9tICcuLi9kZW1vL2Jhc2UnO1xuaW1wb3J0IHsgSUZldGNoQ2hhcHRlciwgSU9wdGlvbnNSdW50aW1lIH0gZnJvbSAnLi4vZGVtby9iYXNlJztcbmltcG9ydCAqIGFzIE5vdmVsU2l0ZURlbW8gZnJvbSAnLi4vZGVtby9iYXNlJztcbmltcG9ydCBOb3ZlbFNpdGVCYXNlIGZyb20gJy4uL2RlbW8vYmFzZSc7XG5pbXBvcnQgeyBVUkwgfSBmcm9tICdqc2RvbS11cmwnO1xuaW1wb3J0IHsgZnJvbVVSTCwgSUZyb21VcmxPcHRpb25zLCBJSlNET00gfSBmcm9tICdqc2RvbS1leHRyYSc7XG5pbXBvcnQgeyBQcm9taXNlQmx1ZWJpcmQsIGJsdWViaXJkRGVjb3JhdG9yIH0gZnJvbSAnLi4vaW5kZXgnO1xuaW1wb3J0IHsgbW9tZW50IH0gZnJvbSAnLi4vaW5kZXgnO1xuaW1wb3J0IG5vdmVsVGV4dCBmcm9tICdub3ZlbC10ZXh0JztcbmltcG9ydCAqIGFzIHBhdGggZnJvbSBcInBhdGhcIjtcbmltcG9ydCAqIGFzIFN0clV0aWwgZnJvbSAnc3RyLXV0aWwnO1xuaW1wb3J0IHsgemhSZWdFeHAgfSBmcm9tICdyZWdleHAtY2prJztcbmltcG9ydCB7IHJlcXVlc3RUb0pTRE9NLCBwYWNrSlNET00sIGNyZWF0ZUpTRE9NIH0gZnJvbSAnanNkb20tZXh0cmEnO1xuaW1wb3J0IHsgX2tlZXBJbWFnZUluQ29udGV4dCB9IGZyb20gJy4uLy4uL3V0aWwvaHRtbCc7XG5cbi8vaW1wb3J0IGVzY2FwZVN0cmluZ1JlZ2V4cCA9IHJlcXVpcmUoJ2VzY2FwZS1zdHJpbmctcmVnZXhwJyk7XG5cbkBzdGF0aWNJbXBsZW1lbnRzPF9Ob3ZlbFNpdGUuSU5vdmVsU2l0ZVN0YXRpYzxOb3ZlbFNpdGVUcGw+PigpXG5leHBvcnQgY2xhc3MgTm92ZWxTaXRlVHBsIGV4dGVuZHMgTm92ZWxTaXRlQmFzZVxue1xuXHRwdWJsaWMgc3RhdGljIHJlYWRvbmx5IElES0VZID0gcGF0aC5iYXNlbmFtZShfX2Rpcm5hbWUpO1xuXG5cdHN0YXRpYyBjaGVjayh1cmw6IHN0cmluZyB8IFVSTCB8IF9Ob3ZlbFNpdGUuSVBhcnNlVXJsLCBvcHRpb25zPyk6IGJvb2xlYW5cblx0e1xuXHRcdC8vIEB0cy1pZ25vcmVcblx0XHRyZXR1cm4gL2RtempcXC5jb20vaS50ZXN0KG5ldyBVUkwodXJsKS5ob3N0bmFtZSB8fCAnJyk7XG5cdH1cblxuXHRtYWtlVXJsPFQ+KHVybG9iajogX05vdmVsU2l0ZS5JUGFyc2VVcmwsIGJvb2w/OiBib29sZWFuIHwgbnVtYmVyLCBvcHRpb25zUnVudGltZT86IFQgJiBJT3B0aW9uc1J1bnRpbWUpOiBVUkxcblx0e1xuXHRcdGxldCB1cmw6IHN0cmluZztcblxuXHRcdGlmIChib29sID09PSAyICYmIHVybG9iai5ub3ZlbF9pZClcblx0XHR7XG5cdFx0XHR1cmwgPSBgaHR0cDovL3EuZG16ai5jb20vJHt1cmxvYmoubm92ZWxfaWR9L2luZGV4LnNodG1sYDtcblx0XHR9XG5cdFx0ZWxzZSBpZiAoIWJvb2wgJiYgdXJsb2JqLnZvbHVtZV9pZCAmJiB1cmxvYmouY2hhcHRlcl9pZClcblx0XHR7XG5cdFx0XHR1cmwgPSBgaHR0cDovL3YyLmFwaS5kbXpqLmNvbS9ub3ZlbC9kb3dubG9hZC8ke3VybG9iai5ub3ZlbF9pZH1fJHt1cmxvYmoudm9sdW1lX2lkfV8ke3VybG9iai5jaGFwdGVyX2lkfS50eHRgO1xuXHRcdH1cblx0XHRlbHNlIGlmIChib29sID09PSB0cnVlICYmIHVybG9iai5ub3ZlbF9pZClcblx0XHR7XG5cdFx0XHR1cmwgPSBgaHR0cDovL3YyLmFwaS5kbXpqLmNvbS9ub3ZlbC9jaGFwdGVyLyR7dXJsb2JqLm5vdmVsX2lkfS5qc29uYDtcblx0XHR9XG5cdFx0ZWxzZVxuXHRcdHtcblx0XHRcdHVybCA9IGBodHRwOi8vdjIuYXBpLmRtemouY29tL25vdmVsLyR7dXJsb2JqLm5vdmVsX2lkfS5qc29uYDtcblx0XHR9XG5cblx0XHQvLyBAdHMtaWdub3JlXG5cdFx0cmV0dXJuIG5ldyBVUkwodXJsKTtcblx0fVxuXG5cdHBhcnNlVXJsKHVybDogVVJMIHwgc3RyaW5nLCBvcHRpb25zPyk6IF9Ob3ZlbFNpdGUuSVBhcnNlVXJsXG5cdHtcblx0XHRsZXQgdXJsb2JqID0ge1xuXHRcdFx0dXJsOiB1cmwsXG5cblx0XHRcdG5vdmVsX2lkOiBudWxsLFxuXHRcdFx0Y2hhcHRlcl9pZDogbnVsbCxcblxuXHRcdFx0dm9sdW1lX2lkOiBudWxsLFxuXHRcdH07XG5cblx0XHR0cnlcblx0XHR7XG5cdFx0XHQvLyBAdHMtaWdub3JlXG5cdFx0XHR1cmxvYmoudXJsID0gbmV3IFVSTCh1cmwpO1xuXHRcdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdFx0dXJsID0gdXJsb2JqLnVybC5ocmVmO1xuXHRcdH1cblx0XHRjYXRjaCAoZSlcblx0XHR7XG5cdFx0XHRjb25zb2xlLndhcm4oZS50b1N0cmluZygpICsgYCBcIiR7dXJsfVwiYCk7XG5cdFx0fVxuXG5cdFx0bGV0IHIgPSAvYXBpXFwuZG16alxcLmNvbVxcL25vdmVsXFwvKFxcZCspLmpzb24vO1xuXG5cdFx0bGV0IG0gPSByLmV4ZWModXJsIGFzIHN0cmluZyk7XG5cdFx0aWYgKG0pXG5cdFx0e1xuXHRcdFx0dXJsb2JqLm5vdmVsX2lkID0gbVsxXTtcblxuXHRcdFx0cmV0dXJuIHVybG9iajtcblx0XHR9XG5cblx0XHRyID0gL14oXFxkKykkLztcblx0XHRpZiAobSA9IHIuZXhlYyh1cmwgYXMgc3RyaW5nKSlcblx0XHR7XG5cdFx0XHR1cmxvYmoubm92ZWxfaWQgPSBtWzFdO1xuXG5cdFx0XHRyZXR1cm4gdXJsb2JqO1xuXHRcdH1cblxuXHRcdHIgPSAvYXBpXFwuZG16alxcLmNvbVxcL25vdmVsXFwvY2hhcHRlclxcLyhcXGQrKS5qc29uLztcblx0XHRpZiAobSA9IHIuZXhlYyh1cmwgYXMgc3RyaW5nKSlcblx0XHR7XG5cdFx0XHR1cmxvYmoubm92ZWxfaWQgPSBtWzFdO1xuXG5cdFx0XHRyZXR1cm4gdXJsb2JqO1xuXHRcdH1cblxuXHRcdHIgPSAvYXBpXFwuZG16alxcLmNvbVxcL25vdmVsXFwvZG93bmxvYWRcXC8oXFxkKylfKFxcZCspXyhcXGQrKS50eHQvO1xuXHRcdGlmIChtID0gci5leGVjKHVybCBhcyBzdHJpbmcpKVxuXHRcdHtcblx0XHRcdHVybG9iai5ub3ZlbF9pZCA9IG1bMV07XG5cdFx0XHR1cmxvYmoudm9sdW1lX2lkID0gbVsyXTtcblx0XHRcdHVybG9iai5jaGFwdGVyX2lkID0gbVszXTtcblxuXHRcdFx0cmV0dXJuIHVybG9iajtcblx0XHR9XG5cblx0XHQvLyDmiYvmqZ/niYjntrLlnYBcblx0XHRyID0gLyg/OnFcXC5kbXpqXFwuY29tXFwvfF5cXC8pKD86KFxcZCspXFwvKD86KFxcZCspXFwvKD86KFxcZCspW1xcLl9dKT8pPykvO1xuXHRcdGlmIChtID0gci5leGVjKHVybCBhcyBzdHJpbmcpKVxuXHRcdHtcblx0XHRcdHVybG9iai5ub3ZlbF9pZCA9IG1bMV07XG5cdFx0XHR1cmxvYmoudm9sdW1lX2lkID0gbVsyXTtcblx0XHRcdHVybG9iai5jaGFwdGVyX2lkID0gbVszXTtcblx0XHR9XG5cblx0XHRyZXR1cm4gdXJsb2JqO1xuXHR9XG5cblx0c2Vzc2lvbjxUID0gSU9wdGlvbnNSdW50aW1lPihvcHRpb25zUnVudGltZTogUGFydGlhbDxUICYgSURvd25sb2FkT3B0aW9ucz4sIHVybDogVVJMKVxuXHR7XG5cdFx0c3VwZXIuc2Vzc2lvbihvcHRpb25zUnVudGltZSwgdXJsKTtcblxuXHRcdG9wdGlvbnNSdW50aW1lLm9wdGlvbnNKU0RPTS5yZXF1ZXN0T3B0aW9ucyA9IG9wdGlvbnNSdW50aW1lLm9wdGlvbnNKU0RPTS5yZXF1ZXN0T3B0aW9ucyB8fCB7fTtcblxuXHRcdC8vIEB0cy1pZ25vcmVcblx0XHRvcHRpb25zUnVudGltZS5vcHRpb25zSlNET00ucmVxdWVzdE9wdGlvbnMuY29udGVudFR5cGUgPSAnanNvbic7XG5cblx0XHQvL2xldCB1cmwgPSBvcHRpb25zUnVudGltZVtTWU1CT0xfQ0FDSEVdLnVybDtcblxuXHRcdG9wdGlvbnNSdW50aW1lLm9wdGlvbnNKU0RPTS5jb29raWVKYXJcblx0XHQvLy5zZXRDb29raWVTeW5jKCdvdmVyMTg9eWVzOyBEb21haW49LnN5b3NldHUuY29tOyBQYXRoPS8nLCB1cmwuaHJlZilcblx0XHQ7XG5cblx0XHRyZXR1cm4gdGhpcztcblx0fVxuXG5cdGNyZWF0ZU1haW5Vcmw8VD4odXJsOiBzdHJpbmcgfCBVUkwsIG9wdGlvbnNSdW50aW1lOiBUICYgSU9wdGlvbnNSdW50aW1lKVxuXHR7XG5cdFx0bGV0IGRhdGEgPSB0aGlzLnBhcnNlVXJsKHVybCk7XG5cblx0XHRpZiAoIWRhdGEgfHwgIWRhdGEubm92ZWxfaWQpXG5cdFx0e1xuXHRcdFx0Y29uc29sZS5sb2coZGF0YSk7XG5cblx0XHRcdHRocm93IG5ldyBSZWZlcmVuY2VFcnJvcigpO1xuXHRcdH1cblxuXHRcdGxldCByZXQgPSB0aGlzLm1ha2VVcmwoZGF0YSwgdHJ1ZSwgb3B0aW9uc1J1bnRpbWUpO1xuXG5cdFx0cmV0dXJuIHJldDtcblx0fVxuXG5cdF9zdHJpcENvbnRlbnQodGV4dDogc3RyaW5nKVxuXHR7XG5cdFx0dGV4dCA9IHN0cmlwQ29udGVudCh0ZXh0KTtcblxuXHRcdC8vcHJvY2Vzcy5leGl0KCk7XG5cblx0XHRyZXR1cm4gdGV4dFxuXHRcdFx0Ly8ucmVwbGFjZSgvXuOAgOOAgC9nbSwgJycpXG5cdFx0XHQucmVwbGFjZSgvXltcXHVGRUZGXFx4QTBdKy9nbSwgJycpXG5cdFx0XHQvLyDkv67mraPmr4/ooYzplovpoK3lpJrlh7rnqbrnmb3nmoTllY/poYxcblx0XHRcdC5yZXBsYWNlKC9eICsvZ20sICcnKVxuXHRcdFx0LnJlcGxhY2UoLyArJC9nbSwgJycpXG5cdFx0XHQucmVwbGFjZSgvXFxzKyQvLCAnJylcblx0XHQ7XG5cdH1cblxuXHRwcm90ZWN0ZWQgX3NhdmVSZWFkbWUob3B0aW9uc1J1bnRpbWU6IElPcHRpb25zUnVudGltZSwgb3B0aW9ucyA9IHt9LCAuLi5vcHRzKVxuXHR7XG5cdFx0b3B0aW9uc1t0aGlzLklES0VZXSA9IHtcblx0XHRcdG5vdmVsX2lkOiBvcHRpb25zUnVudGltZVtTWU1CT0xfQ0FDSEVdLm5vdmVsLm5vdmVsX2lkLFxuXHRcdH07XG5cblx0XHRyZXR1cm4gc3VwZXIuX3NhdmVSZWFkbWUob3B0aW9uc1J1bnRpbWUsIG9wdGlvbnMsIHtcblx0XHRcdC8vXG5cdFx0fSwgLi4ub3B0cyk7XG5cdH1cblxuXHRwcm90ZWN0ZWQgYXN5bmMgX3BhcnNlQ2hhcHRlcjxUPihyZXQ6IElGZXRjaENoYXB0ZXIsIG9wdGlvbnNSdW50aW1lOiBUICYgSU9wdGlvbnNSdW50aW1lLCBjYWNoZSlcblx0e1xuXHRcdGlmICghcmV0KVxuXHRcdHtcblx0XHRcdHJldHVybiAnJztcblx0XHR9XG5cblx0XHRjb25zdCAkID0gcmV0LmRvbS4kO1xuXG5cdFx0bGV0IGJvZHlfc2VsZWN0b3IgPSAnYm9keSc7XG5cblx0XHR0cnlcblx0XHR7XG4vL1x0XHRcdGxldCBodG1sID0gbWluaWZ5SFRNTChyZXQuZG9tLiQoYm9keV9zZWxlY3RvcikuaHRtbCgpKTtcbi8vXG4vL1x0XHRcdC8vaHRtbCA9IGh0bWwucmVwbGFjZSgvXigmbmJzcDspezR9L2dtLCAnJyk7XG4vL1x0XHRcdGh0bWwgPSBodG1sLnJlcGxhY2UoL15cXHMrfFxccyskL2csICcnKTtcbi8vXG4vL1x0XHRcdHJldC5kb20uJChib2R5X3NlbGVjdG9yKS5odG1sKGh0bWwpO1xuXHRcdH1cblx0XHRjYXRjaCAoZSlcblx0XHR7XG5cblx0XHR9XG5cblx0XHRsZXQgdGV4dDogc3RyaW5nO1xuXG5cdFx0aWYgKHJldC5kb20pXG5cdFx0e1xuXHRcdFx0dGV4dCA9IHJldC5kb20uJChib2R5X3NlbGVjdG9yKS50ZXh0KCk7XG5cdFx0fVxuXHRcdGVsc2Vcblx0XHR7XG5cdFx0XHRyZXQuZG9tID0gY3JlYXRlSlNET00ocmV0LmJvZHkudG9TdHJpbmcoKSk7XG5cblx0XHRcdHRleHQgPSByZXQuZG9tLiQoYm9keV9zZWxlY3RvcikudGV4dCgpO1xuXHRcdH1cblxuXHRcdGlmIChyZXQuZG9tICYmIHJldC5kb20uJCAmJiByZXQuZG9tLiQoJ2ltZycpLmxlbmd0aClcblx0XHR7XG5cdFx0XHRjYWNoZS5jaGFwdGVyLmltZ3MgPSBjYWNoZS5jaGFwdGVyLmltZ3MgfHwgW107XG5cblx0XHRcdCQoJ2ltZ1tzcmNdJykuZWFjaChmdW5jdGlvbiAoKVxuXHRcdFx0e1xuXHRcdFx0XHQvLyBAdHMtaWdub3JlXG5cdFx0XHRcdGNhY2hlLmNoYXB0ZXIuaW1ncy5wdXNoKCQodGhpcykucHJvcCgnc3JjJykpO1xuXHRcdFx0XHQvLyBAdHMtaWdub3JlXG5cdFx0XHRcdGNhY2hlLm5vdmVsLmltZ3MucHVzaCgkKHRoaXMpLnByb3AoJ3NyYycpKTtcblx0XHRcdH0pO1xuXG5cdFx0XHRpZiAob3B0aW9uc1J1bnRpbWUua2VlcEltYWdlKVxuXHRcdFx0e1xuXHRcdFx0XHRhd2FpdCBfa2VlcEltYWdlSW5Db250ZXh0KCQoJ2ltZ1tzcmNdJyksICQpO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHRleHQgPSB0aGlzLl9zdHJpcENvbnRlbnQodGV4dCk7XG5cblx0XHRsZXQgc3AgPSAnW1xcdTAwYTAg44CAXSonO1xuXG5cdFx0bGV0IHIgPSBuZXcgemhSZWdFeHAoYF5bXFx1MDBhMCDjgIBcXFxcc10qJHtlc2NhcGVSZWdleHAoY2FjaGUudm9sdW1lLnZvbHVtZV90aXRsZSl9JHtzcH0ke2VzY2FwZVJlZ2V4cChjYWNoZS5jaGFwdGVyLmNoYXB0ZXJfdGl0bGUpfSR7c3B9YCwgJ2lnJyk7XG5cblx0XHR0ZXh0ID0gdGV4dFxuXHRcdFx0LnJlcGxhY2UociwgJycpXG5cdFx0O1xuXG5cdFx0cmV0dXJuIHRleHQ7XG5cdH1cblxuXHQvLyBAdHMtaWdub3JlXG5cdF9jcmVhdGVDaGFwdGVyVXJsPFQgPSBJT3B0aW9uc1J1bnRpbWU+KHtcblx0XHRub3ZlbCxcblx0XHR2b2x1bWUsXG5cdFx0Y2hhcHRlcixcblx0fSwgb3B0aW9uc1J1bnRpbWU/KVxuXHR7XG5cdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdHJldHVybiBuZXcgVVJMKGNoYXB0ZXIuY2hhcHRlcl91cmwpO1xuXHR9XG5cblx0YXN5bmMgZ2V0X3ZvbHVtZV9saXN0PFQgPSBJT3B0aW9uc1J1bnRpbWU+KGlucHV0VXJsOiBzdHJpbmcgfCBVUkwsXG5cdFx0b3B0aW9uc1J1bnRpbWU6IFBhcnRpYWw8VCAmIElEb3dubG9hZE9wdGlvbnM+ID0ge31cblx0KTogUHJvbWlzZTxJTm92ZWw+XG5cdHtcblx0XHRjb25zdCBzZWxmID0gdGhpcztcblx0XHRsZXQgdXJsID0gYXdhaXQgdGhpcy5jcmVhdGVNYWluVXJsKGlucHV0VXJsLCBvcHRpb25zUnVudGltZSk7XG5cblx0XHQvLyBAdHMtaWdub3JlXG5cdFx0cmV0dXJuIHJldHJ5UmVxdWVzdCh1cmwsIG9wdGlvbnNSdW50aW1lLnJlcXVlc3RPcHRpb25zKVxuXHRcdFx0LnRoZW4oYXN5bmMgZnVuY3Rpb24gKGRvbSlcblx0XHRcdHtcblx0XHRcdFx0Y29uc3QgJCA9IGRvbS4kO1xuXG5cdFx0XHRcdGRvbSA9IEpTT04ucGFyc2UoZG9tIGFzIHN0cmluZyk7XG5cblx0XHRcdFx0bGV0IGRhdGFfbWV0YSA9IGF3YWl0IHNlbGYuX2dldF9tZXRhKHVybCwgb3B0aW9uc1J1bnRpbWUsIHtcblx0XHRcdFx0XHRkb20sXG5cdFx0XHRcdH0pO1xuXG5cdFx0XHRcdHVybCA9IGRhdGFfbWV0YS51cmw7XG5cdFx0XHRcdGxldCB1cmxfZGF0YSA9IGRhdGFfbWV0YS51cmxfZGF0YTtcblxuXHRcdFx0XHRsZXQgX2NhY2hlX2RhdGVzID0gW107XG5cdFx0XHRcdGxldCB2b2x1bWVfbGlzdCA9IFtdIGFzIF9Ob3ZlbFNpdGUuSVZvbHVtZVtdO1xuXG5cdFx0XHRcdGxldCBjdXJyZW50Vm9sdW1lOiBfTm92ZWxTaXRlLklWb2x1bWU7XG5cblx0XHRcdFx0bGV0IHRhYmxlID0gZG9tO1xuXG5cdFx0XHRcdHRhYmxlLmZvckVhY2goZnVuY3Rpb24gKHZvbHVtZURhdGE6IHtcblx0XHRcdFx0XHR2b2x1bWVfaWQ6IG51bWJlcixcblx0XHRcdFx0XHRpZDogbnVtYmVyLFxuXHRcdFx0XHRcdHZvbHVtZV9uYW1lOiBzdHJpbmcsXG5cdFx0XHRcdFx0dm9sdW1lX29yZGVyOiBudW1iZXIsXG5cdFx0XHRcdFx0Y2hhcHRlcnM6IHtcblx0XHRcdFx0XHRcdGNoYXB0ZXJfaWQ6IG51bWJlcixcblx0XHRcdFx0XHRcdGNoYXB0ZXJfbmFtZTogc3RyaW5nLFxuXHRcdFx0XHRcdFx0Y2hhcHRlcl9vcmRlcjogbnVtYmVyLFxuXHRcdFx0XHRcdH1bXSxcblx0XHRcdFx0fSlcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGN1cnJlbnRWb2x1bWUgPSB2b2x1bWVfbGlzdFt2b2x1bWVfbGlzdC5sZW5ndGhdID0ge1xuXHRcdFx0XHRcdFx0dm9sdW1lX2luZGV4OiB2b2x1bWVfbGlzdC5sZW5ndGgsXG5cdFx0XHRcdFx0XHR2b2x1bWVfdGl0bGU6IG5vdmVsVGV4dC50cmltKHZvbHVtZURhdGEudm9sdW1lX25hbWUpLFxuXHRcdFx0XHRcdFx0dm9sdW1lX2lzOiB2b2x1bWVEYXRhLnZvbHVtZV9pZCxcblx0XHRcdFx0XHRcdHZvbHVtZV9vcmRlcjogdm9sdW1lRGF0YS52b2x1bWVfb3JkZXIsXG5cdFx0XHRcdFx0XHRjaGFwdGVyX2xpc3Q6IFtdLFxuXHRcdFx0XHRcdH07XG5cblx0XHRcdFx0XHR2b2x1bWVEYXRhLmNoYXB0ZXJzLmZvckVhY2goZnVuY3Rpb24gKGNoYXB0ZXJEYXRhKVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdGxldCBjaGFwdGVyX3VybCA9IHNlbGYubWFrZVVybCh7XG5cdFx0XHRcdFx0XHRcdGNoYXB0ZXJfaWQ6IGNoYXB0ZXJEYXRhLmNoYXB0ZXJfaWQsXG5cdFx0XHRcdFx0XHRcdG5vdmVsX2lkOiBkYXRhX21ldGEubm92ZWxfaWQsXG5cdFx0XHRcdFx0XHRcdHZvbHVtZV9pZDogdm9sdW1lRGF0YS52b2x1bWVfaWQsXG5cdFx0XHRcdFx0XHR9KTtcblxuXHRcdFx0XHRcdFx0bGV0IGNoYXB0ZXJfdXJsX2RhdGEgPSBzZWxmLnBhcnNlVXJsKGNoYXB0ZXJfdXJsKTtcblxuXHRcdFx0XHRcdFx0Y3VycmVudFZvbHVtZVxuXHRcdFx0XHRcdFx0XHQuY2hhcHRlcl9saXN0XG5cdFx0XHRcdFx0XHRcdC5wdXNoKHtcblx0XHRcdFx0XHRcdFx0XHRjaGFwdGVyX2luZGV4OiBjdXJyZW50Vm9sdW1lLmNoYXB0ZXJfbGlzdC5sZW5ndGgsXG5cdFx0XHRcdFx0XHRcdFx0Y2hhcHRlcl90aXRsZTogbm92ZWxUZXh0LnRyaW0oY2hhcHRlckRhdGEuY2hhcHRlcl9uYW1lKSxcblx0XHRcdFx0XHRcdFx0XHRjaGFwdGVyX2lkOiBjaGFwdGVyRGF0YS5jaGFwdGVyX2lkLFxuXHRcdFx0XHRcdFx0XHRcdGNoYXB0ZXJfb3JkZXI6IGNoYXB0ZXJEYXRhLmNoYXB0ZXJfb3JkZXIsXG5cdFx0XHRcdFx0XHRcdFx0Y2hhcHRlcl91cmwsXG5cdFx0XHRcdFx0XHRcdFx0Y2hhcHRlcl91cmxfZGF0YSxcblx0XHRcdFx0XHRcdFx0fSlcblx0XHRcdFx0XHRcdDtcblx0XHRcdFx0XHR9KTtcblx0XHRcdFx0fSk7XG5cblx0XHRcdFx0bGV0IG5vdmVsX2RhdGU7XG5cblx0XHRcdFx0aWYgKF9jYWNoZV9kYXRlcy5sZW5ndGgpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRfY2FjaGVfZGF0ZXMuc29ydCgpO1xuXG5cdFx0XHRcdFx0bm92ZWxfZGF0ZSA9IG1vbWVudC51bml4KF9jYWNoZV9kYXRlc1tfY2FjaGVfZGF0ZXMubGVuZ3RoIC0gMV0pLmxvY2FsKCk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRyZXR1cm4ge1xuXG5cdFx0XHRcdFx0dXJsLFxuXHRcdFx0XHRcdHVybF9kYXRhLFxuXG5cdFx0XHRcdFx0Li4uZGF0YV9tZXRhLFxuXG5cdFx0XHRcdFx0dm9sdW1lX2xpc3QsXG5cblx0XHRcdFx0XHQvL25vdmVsX2RhdGUsXG5cblx0XHRcdFx0XHRjaGVja2RhdGU6IG1vbWVudCgpLmxvY2FsKCksXG5cblx0XHRcdFx0XHRpbWdzOiBbXSBhcyBzdHJpbmdbXSxcblx0XHRcdFx0fSBhcyBJTm92ZWw7XG5cdFx0XHR9KVxuXHRcdFx0LnRhcChmdW5jdGlvbiAobm92ZWwpXG5cdFx0XHR7XG5cdFx0XHRcdGNvbnNvbGUuZGlyKG5vdmVsLCB7XG5cdFx0XHRcdFx0Y29sb3JzOiB0cnVlLFxuXHRcdFx0XHRcdC8vZGVwdGg6IDMsXG5cdFx0XHRcdH0pO1xuXHRcdFx0fSlcblx0XHRcdDtcblx0fVxuXG5cdHByb3RlY3RlZCBhc3luYyBfZ2V0X21ldGEoaW5wdXRVcmwsIG9wdGlvbnNSdW50aW1lLCBjYWNoZToge1xuXHRcdGRvbTogSUpTRE9NLFxuXHR9KVxuXHR7XG5cdFx0Y29uc3Qgc2VsZiA9IHRoaXM7XG5cblx0XHRsZXQgdXJsID0gc2VsZi5tYWtlVXJsKHNlbGYucGFyc2VVcmwoaW5wdXRVcmwpLCAtMSk7XG5cdFx0bGV0IHVybF9kYXRhID0gc2VsZi5wYXJzZVVybCh1cmwpO1xuXG5cdFx0cmV0dXJuIHJldHJ5UmVxdWVzdCh1cmwsIG9wdGlvbnNSdW50aW1lLnJlcXVlc3RPcHRpb25zKVxuXHRcdC8vcmV0dXJuIGZyb21VUkwodXJsLCBvcHRpb25zUnVudGltZS5vcHRpb25zSlNET00pXG5cdFx0Ly9yZXR1cm4gUHJvbWlzZS5yZXNvbHZlKGNhY2hlLmRvbSlcblx0XHRcdC50aGVuKGZ1bmN0aW9uIChkb21Kc29uKVxuXHRcdFx0e1xuXHRcdFx0XHRkb21Kc29uID0gSlNPTi5wYXJzZShkb21Kc29uIGFzIHN0cmluZyk7XG5cblx0XHRcdFx0bGV0IGRhdGE6IElNZGNvbmZNZXRhID0ge307XG5cdFx0XHRcdGRhdGEubm92ZWwgPSB7fTtcblx0XHRcdFx0ZGF0YS5ub3ZlbC50YWdzID0gW107XG5cblx0XHRcdFx0bGV0IG5vdmVsX3RpdGxlID0gZG9tSnNvbi5uYW1lO1xuXHRcdFx0XHRsZXQgbm92ZWxfYXV0aG9yID0gZG9tSnNvbi5hdXRob3JzO1xuXG5cdFx0XHRcdGRvbUpzb24udHlwZXMgPSBkb21Kc29uLnR5cGVzIHx8IFtdO1xuXHRcdFx0XHRkb21Kc29uLnR5cGVzLmZvckVhY2goZnVuY3Rpb24gKHMpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRkYXRhLm5vdmVsLnRhZ3MucHVzaCguLi5zLnNwbGl0KCdcXC8nKSlcblx0XHRcdFx0fSk7XG5cblx0XHRcdFx0ZGF0YS5ub3ZlbC50YWdzLnB1c2goZG9tSnNvbi56b25lKTtcblx0XHRcdFx0Ly9kYXRhLm5vdmVsLnRhZ3MucHVzaChkb21Kc29uLnN0YXR1cyk7XG5cblx0XHRcdFx0ZGF0YS5ub3ZlbC5zdGF0dXMgPSBkb21Kc29uLnN0YXR1cztcblxuXHRcdFx0XHRsZXQgbm92ZWxfY292ZXIgPSBkb21Kc29uLmNvdmVyO1xuXHRcdFx0XHRsZXQgbm92ZWxfZGVzYyA9IGRvbUpzb24uaW50cm9kdWN0aW9uO1xuXG5cdFx0XHRcdGxldCBub3ZlbF9pZCA9IGRvbUpzb24uaWQ7XG5cblx0XHRcdFx0bGV0IG5vdmVsX2RhdGUgPSBtb21lbnQudW5peChkb21Kc29uLmxhc3RfdXBkYXRlX3RpbWUpLmxvY2FsKCk7XG5cblx0XHRcdFx0Ly9jb25zb2xlLmxvZyhkb21Kc29uKTtcblxuXHRcdFx0XHRsZXQgZG16al9hcGlfanNvbiA9IGRvbUpzb247XG5cblx0XHRcdFx0bGV0IG5vdmVsX3VybCA9IHNlbGYubWFrZVVybCh1cmxfZGF0YSwgMik7XG5cblx0XHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0XHR1cmw6IG5vdmVsX3VybCxcblx0XHRcdFx0XHR1cmxfZGF0YTogc2VsZi5wYXJzZVVybChub3ZlbF91cmwpLFxuXG5cdFx0XHRcdFx0dXJsX2FwaTogdXJsLFxuXHRcdFx0XHRcdHVybF9kYXRhX2FwaTogdXJsX2RhdGEsXG5cblx0XHRcdFx0XHQuLi5kYXRhLFxuXG5cdFx0XHRcdFx0bm92ZWxfdXJsLFxuXG5cdFx0XHRcdFx0bm92ZWxfaWQsXG5cblx0XHRcdFx0XHRub3ZlbF90aXRsZSxcblxuXHRcdFx0XHRcdG5vdmVsX2NvdmVyLFxuXG5cdFx0XHRcdFx0bm92ZWxfYXV0aG9yLFxuXHRcdFx0XHRcdG5vdmVsX2Rlc2MsXG5cblx0XHRcdFx0XHRub3ZlbF9kYXRlLFxuXG5cdFx0XHRcdFx0ZG16al9hcGlfanNvbixcblxuXHRcdFx0XHR9O1xuXHRcdFx0fSlcblx0XHRcdDtcblx0fVxufVxuXG5leHBvcnQgZGVmYXVsdCBOb3ZlbFNpdGVUcGw7XG4iXX0=