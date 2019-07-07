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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYXBpLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7R0FFRzs7Ozs7Ozs7QUFFSCx1Q0FBMkM7QUFDM0MsdUNBQTJDO0FBQzNDLHFDQUFtRjtBQUNuRixvQ0FBbUY7QUFJbkYsdUNBQXlDO0FBQ3pDLHlDQUFnQztBQUdoQyxvQ0FBa0M7QUFDbEMsMkNBQW1DO0FBQ25DLDZCQUE2QjtBQUU3QiwyQ0FBc0M7QUFDdEMsNkNBQXFFO0FBRXJFLDhEQUE4RDtBQUc5RCxJQUFhLFlBQVksR0FBekIsTUFBYSxZQUFhLFNBQVEsY0FBYTtJQUk5QyxPQUFPLENBQUMsTUFBNEIsRUFBRSxJQUF1QjtRQUU1RCxJQUFJLEdBQVcsQ0FBQztRQUVoQixJQUFJLElBQUksS0FBSyxDQUFDLElBQUksTUFBTSxDQUFDLFFBQVEsRUFDakM7WUFDQyxHQUFHLEdBQUcscUJBQXFCLE1BQU0sQ0FBQyxRQUFRLGNBQWMsQ0FBQztTQUN6RDthQUNJLElBQUksQ0FBQyxJQUFJLElBQUksTUFBTSxDQUFDLFNBQVMsSUFBSSxNQUFNLENBQUMsVUFBVSxFQUN2RDtZQUNDLEdBQUcsR0FBRyx5Q0FBeUMsTUFBTSxDQUFDLFFBQVEsSUFBSSxNQUFNLENBQUMsU0FBUyxJQUFJLE1BQU0sQ0FBQyxVQUFVLE1BQU0sQ0FBQztTQUM5RzthQUNJLElBQUksSUFBSSxLQUFLLElBQUksSUFBSSxNQUFNLENBQUMsUUFBUSxFQUN6QztZQUNDLEdBQUcsR0FBRyx3Q0FBd0MsTUFBTSxDQUFDLFFBQVEsT0FBTyxDQUFDO1NBQ3JFO2FBRUQ7WUFDQyxHQUFHLEdBQUcsZ0NBQWdDLE1BQU0sQ0FBQyxRQUFRLE9BQU8sQ0FBQztTQUM3RDtRQUVELGFBQWE7UUFDYixPQUFPLElBQUksZUFBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQ3JCLENBQUM7SUFFRCxRQUFRLENBQUMsR0FBaUIsRUFBRSxPQUFRO1FBRW5DLElBQUksTUFBTSxHQUFHO1lB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QU8sQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFFMUMsdUJBQ0MsR0FBRyxFQUFFLFNBQVMsRUFDZCxRQUFRLEVBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsRUFFbEMsT0FBTyxFQUFFLEdBQUcsRUFDWixZQUFZLEVBQUUsUUFBUSxJQUVuQixJQUFJLElBRVAsU0FBUztnQkFFVCxRQUFRO2dCQUVSLFdBQVc7Z0JBRVgsV0FBVztnQkFFWCxZQUFZO2dCQUNaLFVBQVU7Z0JBRVYsVUFBVTtnQkFFVixhQUFhLElBRVo7UUFDSCxDQUFDLENBQUMsQ0FDRDtJQUNILENBQUM7Q0FDRCxDQUFBO0FBL1p1QixrQkFBSyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLENBQUM7QUFGNUMsWUFBWTtJQUR4Qix3QkFBZ0IsRUFBNkM7R0FDakQsWUFBWSxDQWlheEI7QUFqYVksb0NBQVk7QUFtYXpCLGtCQUFlLFlBQVksQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ3JlYXRlZCBieSB1c2VyIG9uIDIwMTgvMy8yNS8wMjUuXG4gKi9cblxuaW1wb3J0IHsgcmV0cnlSZXF1ZXN0IH0gZnJvbSAnLi4vLi4vZmV0Y2gnO1xuaW1wb3J0IHsgc3RyaXBDb250ZW50IH0gZnJvbSAnLi4vLi4vc3RyaXAnO1xuaW1wb3J0IHsgYXJyYXlfdW5pcXVlLCBlc2NhcGVSZWdleHAsIGlzVW5kZWYsIG1pbmlmeUhUTUwsIHRyaW0gfSBmcm9tICcuLi8uLi91dGlsJztcbmltcG9ydCBfTm92ZWxTaXRlLCB7IHN0YXRpY0ltcGxlbWVudHMsIFNZTUJPTF9DQUNIRSwgSU1kY29uZk1ldGEgfSBmcm9tICcuLi9pbmRleCc7XG5pbXBvcnQgeyBJRG93bmxvYWRPcHRpb25zLCBJTm92ZWwgfSBmcm9tICcuLi9kZW1vL2Jhc2UnO1xuaW1wb3J0IHsgSUZldGNoQ2hhcHRlciwgSU9wdGlvbnNSdW50aW1lIH0gZnJvbSAnLi4vZGVtby9iYXNlJztcbmltcG9ydCAqIGFzIE5vdmVsU2l0ZURlbW8gZnJvbSAnLi4vZGVtby9iYXNlJztcbmltcG9ydCBOb3ZlbFNpdGVCYXNlIGZyb20gJy4uL2RlbW8vYmFzZSc7XG5pbXBvcnQgeyBVUkwgfSBmcm9tICdqc2RvbS11cmwnO1xuaW1wb3J0IHsgZnJvbVVSTCwgSUZyb21VcmxPcHRpb25zLCBJSlNET00gfSBmcm9tICdqc2RvbS1leHRyYSc7XG5pbXBvcnQgeyBQcm9taXNlQmx1ZWJpcmQsIGJsdWViaXJkRGVjb3JhdG9yIH0gZnJvbSAnLi4vaW5kZXgnO1xuaW1wb3J0IHsgbW9tZW50IH0gZnJvbSAnLi4vaW5kZXgnO1xuaW1wb3J0IG5vdmVsVGV4dCBmcm9tICdub3ZlbC10ZXh0JztcbmltcG9ydCAqIGFzIHBhdGggZnJvbSBcInBhdGhcIjtcbmltcG9ydCAqIGFzIFN0clV0aWwgZnJvbSAnc3RyLXV0aWwnO1xuaW1wb3J0IHsgemhSZWdFeHAgfSBmcm9tICdyZWdleHAtY2prJztcbmltcG9ydCB7IHJlcXVlc3RUb0pTRE9NLCBwYWNrSlNET00sIGNyZWF0ZUpTRE9NIH0gZnJvbSAnanNkb20tZXh0cmEnO1xuXG4vL2ltcG9ydCBlc2NhcGVTdHJpbmdSZWdleHAgPSByZXF1aXJlKCdlc2NhcGUtc3RyaW5nLXJlZ2V4cCcpO1xuXG5Ac3RhdGljSW1wbGVtZW50czxfTm92ZWxTaXRlLklOb3ZlbFNpdGVTdGF0aWM8Tm92ZWxTaXRlVHBsPj4oKVxuZXhwb3J0IGNsYXNzIE5vdmVsU2l0ZVRwbCBleHRlbmRzIE5vdmVsU2l0ZUJhc2Vcbntcblx0cHVibGljIHN0YXRpYyByZWFkb25seSBJREtFWSA9IHBhdGguYmFzZW5hbWUoX19kaXJuYW1lKTtcblxuXHRtYWtlVXJsKHVybG9iajogX05vdmVsU2l0ZS5JUGFyc2VVcmwsIGJvb2w/OiBib29sZWFuIHwgbnVtYmVyKTogVVJMXG5cdHtcblx0XHRsZXQgdXJsOiBzdHJpbmc7XG5cblx0XHRpZiAoYm9vbCA9PT0gMiAmJiB1cmxvYmoubm92ZWxfaWQpXG5cdFx0e1xuXHRcdFx0dXJsID0gYGh0dHA6Ly9xLmRtemouY29tLyR7dXJsb2JqLm5vdmVsX2lkfS9pbmRleC5zaHRtbGA7XG5cdFx0fVxuXHRcdGVsc2UgaWYgKCFib29sICYmIHVybG9iai52b2x1bWVfaWQgJiYgdXJsb2JqLmNoYXB0ZXJfaWQpXG5cdFx0e1xuXHRcdFx0dXJsID0gYGh0dHA6Ly92Mi5hcGkuZG16ai5jb20vbm92ZWwvZG93bmxvYWQvJHt1cmxvYmoubm92ZWxfaWR9XyR7dXJsb2JqLnZvbHVtZV9pZH1fJHt1cmxvYmouY2hhcHRlcl9pZH0udHh0YDtcblx0XHR9XG5cdFx0ZWxzZSBpZiAoYm9vbCA9PT0gdHJ1ZSAmJiB1cmxvYmoubm92ZWxfaWQpXG5cdFx0e1xuXHRcdFx0dXJsID0gYGh0dHA6Ly92Mi5hcGkuZG16ai5jb20vbm92ZWwvY2hhcHRlci8ke3VybG9iai5ub3ZlbF9pZH0uanNvbmA7XG5cdFx0fVxuXHRcdGVsc2Vcblx0XHR7XG5cdFx0XHR1cmwgPSBgaHR0cDovL3YyLmFwaS5kbXpqLmNvbS9ub3ZlbC8ke3VybG9iai5ub3ZlbF9pZH0uanNvbmA7XG5cdFx0fVxuXG5cdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdHJldHVybiBuZXcgVVJMKHVybCk7XG5cdH1cblxuXHRwYXJzZVVybCh1cmw6IFVSTCB8IHN0cmluZywgb3B0aW9ucz8pOiBfTm92ZWxTaXRlLklQYXJzZVVybFxuXHR7XG5cdFx0bGV0IHVybG9iaiA9IHtcblx0XHRcdHVybDogdXJsLFxuXG5cdFx0XHRub3ZlbF9pZDogbnVsbCxcblx0XHRcdGNoYXB0ZXJfaWQ6IG51bGwsXG5cblx0XHRcdHZvbHVtZV9pZDogbnVsbCxcblx0XHR9O1xuXG5cdFx0dHJ5XG5cdFx0e1xuXHRcdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdFx0dXJsb2JqLnVybCA9IG5ldyBVUkwodXJsKTtcblx0XHRcdC8vIEB0cy1pZ25vcmVcblx0XHRcdHVybCA9IHVybG9iai51cmwuaHJlZjtcblx0XHR9XG5cdFx0Y2F0Y2ggKGUpXG5cdFx0e1xuXHRcdFx0Y29uc29sZS53YXJuKGUudG9TdHJpbmcoKSArIGAgXCIke3VybH1cImApO1xuXHRcdH1cblxuXHRcdGxldCByID0gL2FwaVxcLmRtempcXC5jb21cXC9ub3ZlbFxcLyhcXGQrKS5qc29uLztcblxuXHRcdGxldCBtID0gci5leGVjKHVybCBhcyBzdHJpbmcpO1xuXHRcdGlmIChtKVxuXHRcdHtcblx0XHRcdHVybG9iai5ub3ZlbF9pZCA9IG1bMV07XG5cblx0XHRcdHJldHVybiB1cmxvYmo7XG5cdFx0fVxuXG5cdFx0ciA9IC9eKFxcZCspJC87XG5cdFx0aWYgKG0gPSByLmV4ZWModXJsIGFzIHN0cmluZykpXG5cdFx0e1xuXHRcdFx0dXJsb2JqLm5vdmVsX2lkID0gbVsxXTtcblxuXHRcdFx0cmV0dXJuIHVybG9iajtcblx0XHR9XG5cblx0XHRyID0gL2FwaVxcLmRtempcXC5jb21cXC9ub3ZlbFxcL2NoYXB0ZXJcXC8oXFxkKykuanNvbi87XG5cdFx0aWYgKG0gPSByLmV4ZWModXJsIGFzIHN0cmluZykpXG5cdFx0e1xuXHRcdFx0dXJsb2JqLm5vdmVsX2lkID0gbVsxXTtcblxuXHRcdFx0cmV0dXJuIHVybG9iajtcblx0XHR9XG5cblx0XHRyID0gL2FwaVxcLmRtempcXC5jb21cXC9ub3ZlbFxcL2Rvd25sb2FkXFwvKFxcZCspXyhcXGQrKV8oXFxkKykudHh0Lztcblx0XHRpZiAobSA9IHIuZXhlYyh1cmwgYXMgc3RyaW5nKSlcblx0XHR7XG5cdFx0XHR1cmxvYmoubm92ZWxfaWQgPSBtWzFdO1xuXHRcdFx0dXJsb2JqLnZvbHVtZV9pZCA9IG1bMl07XG5cdFx0XHR1cmxvYmouY2hhcHRlcl9pZCA9IG1bM107XG5cblx0XHRcdHJldHVybiB1cmxvYmo7XG5cdFx0fVxuXG5cdFx0Ly8g5omL5qmf54mI57ay5Z2AXG5cdFx0ciA9IC8oPzpxXFwuZG16alxcLmNvbVxcL3xeXFwvKSg/OihcXGQrKVxcLyg/OihcXGQrKVxcLyg/OihcXGQrKVtcXC5fXSk/KT8pLztcblx0XHRpZiAobSA9IHIuZXhlYyh1cmwgYXMgc3RyaW5nKSlcblx0XHR7XG5cdFx0XHR1cmxvYmoubm92ZWxfaWQgPSBtWzFdO1xuXHRcdFx0dXJsb2JqLnZvbHVtZV9pZCA9IG1bMl07XG5cdFx0XHR1cmxvYmouY2hhcHRlcl9pZCA9IG1bM107XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHVybG9iajtcblx0fVxuXG5cdHNlc3Npb248VCA9IElPcHRpb25zUnVudGltZT4ob3B0aW9uc1J1bnRpbWU6IFBhcnRpYWw8VCAmIElEb3dubG9hZE9wdGlvbnM+LCB1cmw6IFVSTClcblx0e1xuXHRcdHN1cGVyLnNlc3Npb24ob3B0aW9uc1J1bnRpbWUsIHVybCk7XG5cblx0XHRvcHRpb25zUnVudGltZS5vcHRpb25zSlNET00ucmVxdWVzdE9wdGlvbnMgPSBvcHRpb25zUnVudGltZS5vcHRpb25zSlNET00ucmVxdWVzdE9wdGlvbnMgfHwge307XG5cblx0XHQvLyBAdHMtaWdub3JlXG5cdFx0b3B0aW9uc1J1bnRpbWUub3B0aW9uc0pTRE9NLnJlcXVlc3RPcHRpb25zLmNvbnRlbnRUeXBlID0gJ2pzb24nO1xuXG5cdFx0Ly9sZXQgdXJsID0gb3B0aW9uc1J1bnRpbWVbU1lNQk9MX0NBQ0hFXS51cmw7XG5cblx0XHRvcHRpb25zUnVudGltZS5vcHRpb25zSlNET00uY29va2llSmFyXG5cdFx0Ly8uc2V0Q29va2llU3luYygnb3ZlcjE4PXllczsgRG9tYWluPS5zeW9zZXR1LmNvbTsgUGF0aD0vJywgdXJsLmhyZWYpXG5cdFx0O1xuXG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblxuXHRjcmVhdGVNYWluVXJsKHVybClcblx0e1xuXHRcdGxldCBkYXRhID0gdGhpcy5wYXJzZVVybCh1cmwpO1xuXG5cdFx0aWYgKCFkYXRhIHx8ICFkYXRhLm5vdmVsX2lkKVxuXHRcdHtcblx0XHRcdGNvbnNvbGUubG9nKGRhdGEpO1xuXG5cdFx0XHR0aHJvdyBuZXcgUmVmZXJlbmNlRXJyb3IoKTtcblx0XHR9XG5cblx0XHRsZXQgcmV0ID0gdGhpcy5tYWtlVXJsKGRhdGEsIHRydWUpO1xuXG5cdFx0cmV0dXJuIHJldDtcblx0fVxuXG5cdF9zdHJpcENvbnRlbnQodGV4dDogc3RyaW5nKVxuXHR7XG5cdFx0dGV4dCA9IHN0cmlwQ29udGVudCh0ZXh0KTtcblxuXHRcdC8vcHJvY2Vzcy5leGl0KCk7XG5cblx0XHRyZXR1cm4gdGV4dFxuXHRcdFx0Ly8ucmVwbGFjZSgvXuOAgOOAgC9nbSwgJycpXG5cdFx0XHQucmVwbGFjZSgvXltcXHVGRUZGXFx4QTBdKy9nbSwgJycpXG5cdFx0XHQvLyDkv67mraPmr4/ooYzplovpoK3lpJrlh7rnqbrnmb3nmoTllY/poYxcblx0XHRcdC5yZXBsYWNlKC9eICsvZ20sICcnKVxuXHRcdFx0LnJlcGxhY2UoLyArJC9nbSwgJycpXG5cdFx0XHQucmVwbGFjZSgvXFxzKyQvLCAnJylcblx0XHQ7XG5cdH1cblxuXHRwcm90ZWN0ZWQgX3NhdmVSZWFkbWUob3B0aW9uc1J1bnRpbWU6IElPcHRpb25zUnVudGltZSwgb3B0aW9ucyA9IHt9LCAuLi5vcHRzKVxuXHR7XG5cdFx0b3B0aW9uc1t0aGlzLklES0VZXSA9IHtcblx0XHRcdG5vdmVsX2lkOiBvcHRpb25zUnVudGltZVtTWU1CT0xfQ0FDSEVdLm5vdmVsLm5vdmVsX2lkLFxuXHRcdH07XG5cblx0XHRyZXR1cm4gc3VwZXIuX3NhdmVSZWFkbWUob3B0aW9uc1J1bnRpbWUsIG9wdGlvbnMsIHtcblx0XHRcdC8vXG5cdFx0fSwgLi4ub3B0cyk7XG5cdH1cblxuXHRwcm90ZWN0ZWQgX3BhcnNlQ2hhcHRlcjxUPihyZXQ6IElGZXRjaENoYXB0ZXIsIG9wdGlvbnNSdW50aW1lOiBUICYgSU9wdGlvbnNSdW50aW1lLCBjYWNoZSk6IHN0cmluZ1xuXHR7XG5cdFx0aWYgKCFyZXQpXG5cdFx0e1xuXHRcdFx0cmV0dXJuICcnO1xuXHRcdH1cblxuXHRcdGxldCBib2R5X3NlbGVjdG9yID0gJ2JvZHknO1xuXG5cdFx0dHJ5XG5cdFx0e1xuLy9cdFx0XHRsZXQgaHRtbCA9IG1pbmlmeUhUTUwocmV0LmRvbS4kKGJvZHlfc2VsZWN0b3IpLmh0bWwoKSk7XG4vL1xuLy9cdFx0XHQvL2h0bWwgPSBodG1sLnJlcGxhY2UoL14oJm5ic3A7KXs0fS9nbSwgJycpO1xuLy9cdFx0XHRodG1sID0gaHRtbC5yZXBsYWNlKC9eXFxzK3xcXHMrJC9nLCAnJyk7XG4vL1xuLy9cdFx0XHRyZXQuZG9tLiQoYm9keV9zZWxlY3RvcikuaHRtbChodG1sKTtcblx0XHR9XG5cdFx0Y2F0Y2ggKGUpXG5cdFx0e1xuXG5cdFx0fVxuXG5cdFx0bGV0IHRleHQ6IHN0cmluZztcblxuXHRcdGlmIChyZXQuZG9tKVxuXHRcdHtcblx0XHRcdHRleHQgPSByZXQuZG9tLiQoYm9keV9zZWxlY3RvcikudGV4dCgpO1xuXHRcdH1cblx0XHRlbHNlXG5cdFx0e1xuXHRcdFx0cmV0LmRvbSA9IGNyZWF0ZUpTRE9NKHJldC5ib2R5LnRvU3RyaW5nKCkpO1xuXG5cdFx0XHR0ZXh0ID0gcmV0LmRvbS4kKGJvZHlfc2VsZWN0b3IpLnRleHQoKTtcblx0XHR9XG5cblx0XHRpZiAocmV0LmRvbSAmJiByZXQuZG9tLiQgJiYgcmV0LmRvbS4kKCdpbWcnKS5sZW5ndGgpXG5cdFx0e1xuXHRcdFx0bGV0ICQgPSByZXQuZG9tLiQ7XG5cblx0XHRcdGNhY2hlLmNoYXB0ZXIuaW1ncyA9IGNhY2hlLmNoYXB0ZXIuaW1ncyB8fCBbXTtcblxuXHRcdFx0cmV0LmRvbS4kKCdpbWdbc3JjXScpLmVhY2goZnVuY3Rpb24gKClcblx0XHRcdHtcblx0XHRcdFx0Y2FjaGUuY2hhcHRlci5pbWdzLnB1c2goJCh0aGlzKS5wcm9wKCdzcmMnKSk7XG5cdFx0XHRcdGNhY2hlLm5vdmVsLmltZ3MucHVzaCgkKHRoaXMpLnByb3AoJ3NyYycpKTtcblx0XHRcdH0pO1xuXHRcdH1cblxuXHRcdHRleHQgPSB0aGlzLl9zdHJpcENvbnRlbnQodGV4dCk7XG5cblx0XHRsZXQgc3AgPSAnW8KgIOOAgF0qJztcblxuXHRcdGxldCByID0gbmV3IHpoUmVnRXhwKGBeW8KgIOOAgFxcXFxzXSoke2VzY2FwZVJlZ2V4cChjYWNoZS52b2x1bWUudm9sdW1lX3RpdGxlKX0ke3NwfSR7ZXNjYXBlUmVnZXhwKGNhY2hlLmNoYXB0ZXIuY2hhcHRlcl90aXRsZSl9JHtzcH1gLCAnaWcnKTtcblxuXHRcdHRleHQgPSB0ZXh0XG5cdFx0XHQucmVwbGFjZShyLCAnJylcblx0XHQ7XG5cblx0XHRyZXR1cm4gdGV4dDtcblx0fVxuXG5cdC8vIEB0cy1pZ25vcmVcblx0X2NyZWF0ZUNoYXB0ZXJVcmw8VCA9IElPcHRpb25zUnVudGltZT4oe1xuXHRcdG5vdmVsLFxuXHRcdHZvbHVtZSxcblx0XHRjaGFwdGVyLFxuXHR9LCBvcHRpb25zUnVudGltZT8pXG5cdHtcblx0XHQvLyBAdHMtaWdub3JlXG5cdFx0cmV0dXJuIG5ldyBVUkwoY2hhcHRlci5jaGFwdGVyX3VybCk7XG5cdH1cblxuXHRhc3luYyBnZXRfdm9sdW1lX2xpc3Q8VCA9IElPcHRpb25zUnVudGltZT4oaW5wdXRVcmw6IHN0cmluZyB8IFVSTCxcblx0XHRvcHRpb25zUnVudGltZTogUGFydGlhbDxUICYgSURvd25sb2FkT3B0aW9ucz4gPSB7fVxuXHQpOiBQcm9taXNlPElOb3ZlbD5cblx0e1xuXHRcdGNvbnN0IHNlbGYgPSB0aGlzO1xuXHRcdGxldCB1cmwgPSBhd2FpdCB0aGlzLmNyZWF0ZU1haW5VcmwoaW5wdXRVcmwpO1xuXG5cdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdHJldHVybiByZXRyeVJlcXVlc3QodXJsLCBvcHRpb25zUnVudGltZS5yZXF1ZXN0T3B0aW9ucylcblx0XHRcdC50aGVuKGFzeW5jIGZ1bmN0aW9uIChkb20pXG5cdFx0XHR7XG5cdFx0XHRcdGNvbnN0ICQgPSBkb20uJDtcblxuXHRcdFx0XHRkb20gPSBKU09OLnBhcnNlKGRvbSBhcyBzdHJpbmcpO1xuXG5cdFx0XHRcdGxldCBkYXRhX21ldGEgPSBhd2FpdCBzZWxmLl9nZXRfbWV0YSh1cmwsIG9wdGlvbnNSdW50aW1lLCB7XG5cdFx0XHRcdFx0ZG9tLFxuXHRcdFx0XHR9KTtcblxuXHRcdFx0XHR1cmwgPSBkYXRhX21ldGEudXJsO1xuXHRcdFx0XHRsZXQgdXJsX2RhdGEgPSBkYXRhX21ldGEudXJsX2RhdGE7XG5cblx0XHRcdFx0bGV0IF9jYWNoZV9kYXRlcyA9IFtdO1xuXHRcdFx0XHRsZXQgdm9sdW1lX2xpc3QgPSBbXSBhcyBfTm92ZWxTaXRlLklWb2x1bWVbXTtcblxuXHRcdFx0XHRsZXQgY3VycmVudFZvbHVtZTogX05vdmVsU2l0ZS5JVm9sdW1lO1xuXG5cdFx0XHRcdGxldCB0YWJsZSA9IGRvbTtcblxuXHRcdFx0XHR0YWJsZS5mb3JFYWNoKGZ1bmN0aW9uICh2b2x1bWVEYXRhOiB7XG5cdFx0XHRcdFx0dm9sdW1lX2lkOiBudW1iZXIsXG5cdFx0XHRcdFx0aWQ6IG51bWJlcixcblx0XHRcdFx0XHR2b2x1bWVfbmFtZTogc3RyaW5nLFxuXHRcdFx0XHRcdHZvbHVtZV9vcmRlcjogbnVtYmVyLFxuXHRcdFx0XHRcdGNoYXB0ZXJzOiB7XG5cdFx0XHRcdFx0XHRjaGFwdGVyX2lkOiBudW1iZXIsXG5cdFx0XHRcdFx0XHRjaGFwdGVyX25hbWU6IHN0cmluZyxcblx0XHRcdFx0XHRcdGNoYXB0ZXJfb3JkZXI6IG51bWJlcixcblx0XHRcdFx0XHR9W10sXG5cdFx0XHRcdH0pXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRjdXJyZW50Vm9sdW1lID0gdm9sdW1lX2xpc3Rbdm9sdW1lX2xpc3QubGVuZ3RoXSA9IHtcblx0XHRcdFx0XHRcdHZvbHVtZV9pbmRleDogdm9sdW1lX2xpc3QubGVuZ3RoLFxuXHRcdFx0XHRcdFx0dm9sdW1lX3RpdGxlOiBub3ZlbFRleHQudHJpbSh2b2x1bWVEYXRhLnZvbHVtZV9uYW1lKSxcblx0XHRcdFx0XHRcdHZvbHVtZV9pczogdm9sdW1lRGF0YS52b2x1bWVfaWQsXG5cdFx0XHRcdFx0XHR2b2x1bWVfb3JkZXI6IHZvbHVtZURhdGEudm9sdW1lX29yZGVyLFxuXHRcdFx0XHRcdFx0Y2hhcHRlcl9saXN0OiBbXSxcblx0XHRcdFx0XHR9O1xuXG5cdFx0XHRcdFx0dm9sdW1lRGF0YS5jaGFwdGVycy5mb3JFYWNoKGZ1bmN0aW9uIChjaGFwdGVyRGF0YSlcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRsZXQgY2hhcHRlcl91cmwgPSBzZWxmLm1ha2VVcmwoe1xuXHRcdFx0XHRcdFx0XHRjaGFwdGVyX2lkOiBjaGFwdGVyRGF0YS5jaGFwdGVyX2lkLFxuXHRcdFx0XHRcdFx0XHRub3ZlbF9pZDogZGF0YV9tZXRhLm5vdmVsX2lkLFxuXHRcdFx0XHRcdFx0XHR2b2x1bWVfaWQ6IHZvbHVtZURhdGEudm9sdW1lX2lkLFxuXHRcdFx0XHRcdFx0fSk7XG5cblx0XHRcdFx0XHRcdGxldCBjaGFwdGVyX3VybF9kYXRhID0gc2VsZi5wYXJzZVVybChjaGFwdGVyX3VybCk7XG5cblx0XHRcdFx0XHRcdGN1cnJlbnRWb2x1bWVcblx0XHRcdFx0XHRcdFx0LmNoYXB0ZXJfbGlzdFxuXHRcdFx0XHRcdFx0XHQucHVzaCh7XG5cdFx0XHRcdFx0XHRcdFx0Y2hhcHRlcl9pbmRleDogY3VycmVudFZvbHVtZS5jaGFwdGVyX2xpc3QubGVuZ3RoLFxuXHRcdFx0XHRcdFx0XHRcdGNoYXB0ZXJfdGl0bGU6IG5vdmVsVGV4dC50cmltKGNoYXB0ZXJEYXRhLmNoYXB0ZXJfbmFtZSksXG5cdFx0XHRcdFx0XHRcdFx0Y2hhcHRlcl9pZDogY2hhcHRlckRhdGEuY2hhcHRlcl9pZCxcblx0XHRcdFx0XHRcdFx0XHRjaGFwdGVyX29yZGVyOiBjaGFwdGVyRGF0YS5jaGFwdGVyX29yZGVyLFxuXHRcdFx0XHRcdFx0XHRcdGNoYXB0ZXJfdXJsLFxuXHRcdFx0XHRcdFx0XHRcdGNoYXB0ZXJfdXJsX2RhdGEsXG5cdFx0XHRcdFx0XHRcdH0pXG5cdFx0XHRcdFx0XHQ7XG5cdFx0XHRcdFx0fSk7XG5cdFx0XHRcdH0pO1xuXG5cdFx0XHRcdGxldCBub3ZlbF9kYXRlO1xuXG5cdFx0XHRcdGlmIChfY2FjaGVfZGF0ZXMubGVuZ3RoKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0X2NhY2hlX2RhdGVzLnNvcnQoKTtcblxuXHRcdFx0XHRcdG5vdmVsX2RhdGUgPSBtb21lbnQudW5peChfY2FjaGVfZGF0ZXNbX2NhY2hlX2RhdGVzLmxlbmd0aCAtIDFdKS5sb2NhbCgpO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0cmV0dXJuIHtcblxuXHRcdFx0XHRcdHVybCxcblx0XHRcdFx0XHR1cmxfZGF0YSxcblxuXHRcdFx0XHRcdC4uLmRhdGFfbWV0YSxcblxuXHRcdFx0XHRcdHZvbHVtZV9saXN0LFxuXG5cdFx0XHRcdFx0Ly9ub3ZlbF9kYXRlLFxuXG5cdFx0XHRcdFx0Y2hlY2tkYXRlOiBtb21lbnQoKS5sb2NhbCgpLFxuXG5cdFx0XHRcdFx0aW1nczogW10gYXMgc3RyaW5nW10sXG5cdFx0XHRcdH0gYXMgSU5vdmVsO1xuXHRcdFx0fSlcblx0XHRcdC50YXAoZnVuY3Rpb24gKG5vdmVsKVxuXHRcdFx0e1xuXHRcdFx0XHRjb25zb2xlLmRpcihub3ZlbCwge1xuXHRcdFx0XHRcdGNvbG9yczogdHJ1ZSxcblx0XHRcdFx0XHQvL2RlcHRoOiAzLFxuXHRcdFx0XHR9KTtcblx0XHRcdH0pXG5cdFx0XHQ7XG5cdH1cblxuXHRwcm90ZWN0ZWQgYXN5bmMgX2dldF9tZXRhKGlucHV0VXJsLCBvcHRpb25zUnVudGltZSwgY2FjaGU6IHtcblx0XHRkb206IElKU0RPTSxcblx0fSlcblx0e1xuXHRcdGNvbnN0IHNlbGYgPSB0aGlzO1xuXG5cdFx0bGV0IHVybCA9IHNlbGYubWFrZVVybChzZWxmLnBhcnNlVXJsKGlucHV0VXJsKSwgLTEpO1xuXHRcdGxldCB1cmxfZGF0YSA9IHNlbGYucGFyc2VVcmwodXJsKTtcblxuXHRcdHJldHVybiByZXRyeVJlcXVlc3QodXJsLCBvcHRpb25zUnVudGltZS5yZXF1ZXN0T3B0aW9ucylcblx0XHQvL3JldHVybiBmcm9tVVJMKHVybCwgb3B0aW9uc1J1bnRpbWUub3B0aW9uc0pTRE9NKVxuXHRcdC8vcmV0dXJuIFByb21pc2UucmVzb2x2ZShjYWNoZS5kb20pXG5cdFx0XHQudGhlbihmdW5jdGlvbiAoZG9tSnNvbilcblx0XHRcdHtcblx0XHRcdFx0ZG9tSnNvbiA9IEpTT04ucGFyc2UoZG9tSnNvbiBhcyBzdHJpbmcpO1xuXG5cdFx0XHRcdGxldCBkYXRhOiBJTWRjb25mTWV0YSA9IHt9O1xuXHRcdFx0XHRkYXRhLm5vdmVsID0ge307XG5cdFx0XHRcdGRhdGEubm92ZWwudGFncyA9IFtdO1xuXG5cdFx0XHRcdGxldCBub3ZlbF90aXRsZSA9IGRvbUpzb24ubmFtZTtcblx0XHRcdFx0bGV0IG5vdmVsX2F1dGhvciA9IGRvbUpzb24uYXV0aG9ycztcblxuXHRcdFx0XHRkb21Kc29uLnR5cGVzID0gZG9tSnNvbi50eXBlcyB8fCBbXTtcblx0XHRcdFx0ZG9tSnNvbi50eXBlcy5mb3JFYWNoKGZ1bmN0aW9uIChzKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0ZGF0YS5ub3ZlbC50YWdzLnB1c2goLi4ucy5zcGxpdCgnXFwvJykpXG5cdFx0XHRcdH0pO1xuXG5cdFx0XHRcdGRhdGEubm92ZWwudGFncy5wdXNoKGRvbUpzb24uem9uZSk7XG5cdFx0XHRcdC8vZGF0YS5ub3ZlbC50YWdzLnB1c2goZG9tSnNvbi5zdGF0dXMpO1xuXG5cdFx0XHRcdGRhdGEubm92ZWwuc3RhdHVzID0gZG9tSnNvbi5zdGF0dXM7XG5cblx0XHRcdFx0bGV0IG5vdmVsX2NvdmVyID0gZG9tSnNvbi5jb3Zlcjtcblx0XHRcdFx0bGV0IG5vdmVsX2Rlc2MgPSBkb21Kc29uLmludHJvZHVjdGlvbjtcblxuXHRcdFx0XHRsZXQgbm92ZWxfaWQgPSBkb21Kc29uLmlkO1xuXG5cdFx0XHRcdGxldCBub3ZlbF9kYXRlID0gbW9tZW50LnVuaXgoZG9tSnNvbi5sYXN0X3VwZGF0ZV90aW1lKS5sb2NhbCgpO1xuXG5cdFx0XHRcdC8vY29uc29sZS5sb2coZG9tSnNvbik7XG5cblx0XHRcdFx0bGV0IGRtempfYXBpX2pzb24gPSBkb21Kc29uO1xuXG5cdFx0XHRcdGxldCBub3ZlbF91cmwgPSBzZWxmLm1ha2VVcmwodXJsX2RhdGEsIDIpO1xuXG5cdFx0XHRcdHJldHVybiB7XG5cdFx0XHRcdFx0dXJsOiBub3ZlbF91cmwsXG5cdFx0XHRcdFx0dXJsX2RhdGE6IHNlbGYucGFyc2VVcmwobm92ZWxfdXJsKSxcblxuXHRcdFx0XHRcdHVybF9hcGk6IHVybCxcblx0XHRcdFx0XHR1cmxfZGF0YV9hcGk6IHVybF9kYXRhLFxuXG5cdFx0XHRcdFx0Li4uZGF0YSxcblxuXHRcdFx0XHRcdG5vdmVsX3VybCxcblxuXHRcdFx0XHRcdG5vdmVsX2lkLFxuXG5cdFx0XHRcdFx0bm92ZWxfdGl0bGUsXG5cblx0XHRcdFx0XHRub3ZlbF9jb3ZlcixcblxuXHRcdFx0XHRcdG5vdmVsX2F1dGhvcixcblx0XHRcdFx0XHRub3ZlbF9kZXNjLFxuXG5cdFx0XHRcdFx0bm92ZWxfZGF0ZSxcblxuXHRcdFx0XHRcdGRtempfYXBpX2pzb24sXG5cblx0XHRcdFx0fTtcblx0XHRcdH0pXG5cdFx0XHQ7XG5cdH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgTm92ZWxTaXRlVHBsO1xuIl19