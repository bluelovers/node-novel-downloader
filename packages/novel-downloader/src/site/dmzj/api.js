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
exports.NovelSiteTpl = void 0;
const fetch_1 = require("../../fetch");
const strip_1 = require("../../strip");
const util_1 = require("../../util");
const index_1 = require("../index");
const base_1 = require("../demo/base");
const index_2 = require("../index");
const novel_text_1 = require("novel-text");
const path = require("path");
const regexp_cjk_1 = require("regexp-cjk");
const jsdom_extra_1 = require("jsdom-extra");
const html_1 = require("../../util/html");
const util_2 = require("./util");
//import escapeStringRegexp = require('escape-string-regexp');
let NovelSiteTpl = /** @class */ (() => {
    let NovelSiteTpl = class NovelSiteTpl extends base_1.default {
        static check(url, ...argv) {
            return util_2.check(url, ...argv);
        }
        static makeUrl(urlobj, bool, ...argv) {
            return util_2.makeUrl(urlobj, bool, ...argv);
        }
        static parseUrl(url, ...argv) {
            return util_2.parseUrl(url, ...argv);
        }
        makeUrl(urlobj, bool, ...argv) {
            return util_2.makeUrl(urlobj, bool, ...argv);
        }
        parseUrl(url, ...argv) {
            return util_2.parseUrl(url, ...argv);
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
    return NovelSiteTpl;
})();
exports.NovelSiteTpl = NovelSiteTpl;
exports.default = NovelSiteTpl;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYXBpLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7R0FFRzs7Ozs7Ozs7O0FBRUgsdUNBQTJDO0FBQzNDLHVDQUEyQztBQUMzQyxxQ0FBbUY7QUFDbkYsb0NBQW1GO0FBSW5GLHVDQUF5QztBQUl6QyxvQ0FBa0M7QUFDbEMsMkNBQW1DO0FBQ25DLDZCQUE2QjtBQUU3QiwyQ0FBc0M7QUFDdEMsNkNBQXFFO0FBQ3JFLDBDQUFzRDtBQUV0RCxpQ0FBa0Q7QUFFbEQsOERBQThEO0FBRzlEO0lBQUEsSUFBYSxZQUFZLEdBQXpCLE1BQWEsWUFBYSxTQUFRLGNBQWE7UUFJOUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxHQUF3QyxFQUFFLEdBQUcsSUFBSTtZQUU3RCxPQUFPLFlBQUssQ0FBQyxHQUFHLEVBQUUsR0FBRyxJQUFJLENBQUMsQ0FBQztRQUM1QixDQUFDO1FBRUQsTUFBTSxDQUFDLE9BQU8sQ0FBQyxNQUE0QixFQUFFLElBQXVCLEVBQUUsR0FBRyxJQUFJO1lBRTVFLE9BQU8sY0FBTyxDQUFDLE1BQU0sRUFBRSxJQUFJLEVBQUUsR0FBRyxJQUFJLENBQUMsQ0FBQTtRQUN0QyxDQUFDO1FBRUQsTUFBTSxDQUFDLFFBQVEsQ0FBQyxHQUEwQixFQUFFLEdBQUcsSUFBSTtZQUVsRCxPQUFPLGVBQVEsQ0FBQyxHQUFHLEVBQUUsR0FBRyxJQUFJLENBQUMsQ0FBQztRQUMvQixDQUFDO1FBRUQsT0FBTyxDQUFDLE1BQTRCLEVBQUUsSUFBdUIsRUFBRSxHQUFHLElBQUk7WUFFckUsT0FBTyxjQUFPLENBQUMsTUFBTSxFQUFFLElBQUksRUFBRSxHQUFHLElBQUksQ0FBQyxDQUFBO1FBQ3RDLENBQUM7UUFFRCxRQUFRLENBQUMsR0FBMEIsRUFBRSxHQUFHLElBQUk7WUFFM0MsT0FBTyxlQUFRLENBQUMsR0FBRyxFQUFFLEdBQUcsSUFBSSxDQUFDLENBQUM7UUFDL0IsQ0FBQztRQUVELE9BQU8sQ0FB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QUE2QztPQUNqRCxZQUFZLENBc1Z4QjtJQUFELG1CQUFDO0tBQUE7QUF0Vlksb0NBQVk7QUF3VnpCLGtCQUFlLFlBQVksQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ3JlYXRlZCBieSB1c2VyIG9uIDIwMTgvMy8yNS8wMjUuXG4gKi9cblxuaW1wb3J0IHsgcmV0cnlSZXF1ZXN0IH0gZnJvbSAnLi4vLi4vZmV0Y2gnO1xuaW1wb3J0IHsgc3RyaXBDb250ZW50IH0gZnJvbSAnLi4vLi4vc3RyaXAnO1xuaW1wb3J0IHsgYXJyYXlfdW5pcXVlLCBlc2NhcGVSZWdleHAsIGlzVW5kZWYsIG1pbmlmeUhUTUwsIHRyaW0gfSBmcm9tICcuLi8uLi91dGlsJztcbmltcG9ydCBfTm92ZWxTaXRlLCB7IHN0YXRpY0ltcGxlbWVudHMsIFNZTUJPTF9DQUNIRSwgSU1kY29uZk1ldGEgfSBmcm9tICcuLi9pbmRleCc7XG5pbXBvcnQgeyBJRG93bmxvYWRPcHRpb25zLCBJTm92ZWwgfSBmcm9tICcuLi9kZW1vL2Jhc2UnO1xuaW1wb3J0IHsgSUZldGNoQ2hhcHRlciwgSU9wdGlvbnNSdW50aW1lIH0gZnJvbSAnLi4vZGVtby9iYXNlJztcbmltcG9ydCAqIGFzIE5vdmVsU2l0ZURlbW8gZnJvbSAnLi4vZGVtby9iYXNlJztcbmltcG9ydCBOb3ZlbFNpdGVCYXNlIGZyb20gJy4uL2RlbW8vYmFzZSc7XG4vL2ltcG9ydCB7IFVSTCB9IGZyb20gJ2pzZG9tLXVybCc7XG5pbXBvcnQgeyBmcm9tVVJMLCBJRnJvbVVybE9wdGlvbnMsIElKU0RPTSB9IGZyb20gJ2pzZG9tLWV4dHJhJztcbmltcG9ydCB7IFByb21pc2VCbHVlYmlyZCwgYmx1ZWJpcmREZWNvcmF0b3IgfSBmcm9tICcuLi9pbmRleCc7XG5pbXBvcnQgeyBtb21lbnQgfSBmcm9tICcuLi9pbmRleCc7XG5pbXBvcnQgbm92ZWxUZXh0IGZyb20gJ25vdmVsLXRleHQnO1xuaW1wb3J0ICogYXMgcGF0aCBmcm9tIFwicGF0aFwiO1xuaW1wb3J0ICogYXMgU3RyVXRpbCBmcm9tICdzdHItdXRpbCc7XG5pbXBvcnQgeyB6aFJlZ0V4cCB9IGZyb20gJ3JlZ2V4cC1jamsnO1xuaW1wb3J0IHsgcmVxdWVzdFRvSlNET00sIHBhY2tKU0RPTSwgY3JlYXRlSlNET00gfSBmcm9tICdqc2RvbS1leHRyYSc7XG5pbXBvcnQgeyBfa2VlcEltYWdlSW5Db250ZXh0IH0gZnJvbSAnLi4vLi4vdXRpbC9odG1sJztcbmltcG9ydCBjcmVhdGVVUkwgZnJvbSAnLi4vLi4vdXRpbC91cmwnO1xuaW1wb3J0IHsgcGFyc2VVcmwsIG1ha2VVcmwsIGNoZWNrIH0gZnJvbSAnLi91dGlsJztcblxuLy9pbXBvcnQgZXNjYXBlU3RyaW5nUmVnZXhwID0gcmVxdWlyZSgnZXNjYXBlLXN0cmluZy1yZWdleHAnKTtcblxuQHN0YXRpY0ltcGxlbWVudHM8X05vdmVsU2l0ZS5JTm92ZWxTaXRlU3RhdGljPE5vdmVsU2l0ZVRwbD4+KClcbmV4cG9ydCBjbGFzcyBOb3ZlbFNpdGVUcGwgZXh0ZW5kcyBOb3ZlbFNpdGVCYXNlXG57XG5cdHB1YmxpYyBzdGF0aWMgcmVhZG9ubHkgSURLRVkgPSBwYXRoLmJhc2VuYW1lKF9fZGlybmFtZSk7XG5cblx0c3RhdGljIGNoZWNrKHVybDogc3RyaW5nIHwgVVJMIHwgX05vdmVsU2l0ZS5JUGFyc2VVcmwsIC4uLmFyZ3YpOiBib29sZWFuXG5cdHtcblx0XHRyZXR1cm4gY2hlY2sodXJsLCAuLi5hcmd2KTtcblx0fVxuXG5cdHN0YXRpYyBtYWtlVXJsKHVybG9iajogX05vdmVsU2l0ZS5JUGFyc2VVcmwsIGJvb2w/OiBib29sZWFuIHwgbnVtYmVyLCAuLi5hcmd2KVxuXHR7XG5cdFx0cmV0dXJuIG1ha2VVcmwodXJsb2JqLCBib29sLCAuLi5hcmd2KVxuXHR9XG5cblx0c3RhdGljIHBhcnNlVXJsKHVybDogc3RyaW5nIHwgVVJMIHwgbnVtYmVyLCAuLi5hcmd2KVxuXHR7XG5cdFx0cmV0dXJuIHBhcnNlVXJsKHVybCwgLi4uYXJndik7XG5cdH1cblxuXHRtYWtlVXJsKHVybG9iajogX05vdmVsU2l0ZS5JUGFyc2VVcmwsIGJvb2w/OiBib29sZWFuIHwgbnVtYmVyLCAuLi5hcmd2KVxuXHR7XG5cdFx0cmV0dXJuIG1ha2VVcmwodXJsb2JqLCBib29sLCAuLi5hcmd2KVxuXHR9XG5cblx0cGFyc2VVcmwodXJsOiBzdHJpbmcgfCBVUkwgfCBudW1iZXIsIC4uLmFyZ3YpXG5cdHtcblx0XHRyZXR1cm4gcGFyc2VVcmwodXJsLCAuLi5hcmd2KTtcblx0fVxuXG5cdHNlc3Npb248VCA9IElPcHRpb25zUnVudGltZT4ob3B0aW9uc1J1bnRpbWU6IFBhcnRpYWw8VCAmIElEb3dubG9hZE9wdGlvbnM+LCB1cmw6IFVSTClcblx0e1xuXHRcdHN1cGVyLnNlc3Npb24ob3B0aW9uc1J1bnRpbWUsIHVybCk7XG5cblx0XHRvcHRpb25zUnVudGltZS5vcHRpb25zSlNET00ucmVxdWVzdE9wdGlvbnMgPSBvcHRpb25zUnVudGltZS5vcHRpb25zSlNET00ucmVxdWVzdE9wdGlvbnMgfHwge307XG5cblx0XHQvLyBAdHMtaWdub3JlXG5cdFx0b3B0aW9uc1J1bnRpbWUub3B0aW9uc0pTRE9NLnJlcXVlc3RPcHRpb25zLmNvbnRlbnRUeXBlID0gJ2pzb24nO1xuXG5cdFx0Ly9sZXQgdXJsID0gb3B0aW9uc1J1bnRpbWVbU1lNQk9MX0NBQ0hFXS51cmw7XG5cblx0XHRvcHRpb25zUnVudGltZS5vcHRpb25zSlNET00uY29va2llSmFyXG5cdFx0Ly8uc2V0Q29va2llU3luYygnb3ZlcjE4PXllczsgRG9tYWluPS5zeW9zZXR1LmNvbTsgUGF0aD0vJywgdXJsLmhyZWYpXG5cdFx0O1xuXG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblxuXHRjcmVhdGVNYWluVXJsPFQ+KHVybDogc3RyaW5nIHwgVVJMLCBvcHRpb25zUnVudGltZTogVCAmIElPcHRpb25zUnVudGltZSlcblx0e1xuXHRcdGxldCBkYXRhID0gdGhpcy5wYXJzZVVybCh1cmwpO1xuXG5cdFx0aWYgKCFkYXRhIHx8ICFkYXRhLm5vdmVsX2lkKVxuXHRcdHtcblx0XHRcdGNvbnNvbGUubG9nKGRhdGEpO1xuXG5cdFx0XHR0aHJvdyBuZXcgUmVmZXJlbmNlRXJyb3IoKTtcblx0XHR9XG5cblx0XHRsZXQgcmV0ID0gdGhpcy5tYWtlVXJsKGRhdGEsIHRydWUsIG9wdGlvbnNSdW50aW1lKTtcblxuXHRcdHJldHVybiByZXQ7XG5cdH1cblxuXHRfc3RyaXBDb250ZW50KHRleHQ6IHN0cmluZylcblx0e1xuXHRcdHRleHQgPSBzdHJpcENvbnRlbnQodGV4dCk7XG5cblx0XHQvL3Byb2Nlc3MuZXhpdCgpO1xuXG5cdFx0cmV0dXJuIHRleHRcblx0XHRcdC8vLnJlcGxhY2UoL17jgIDjgIAvZ20sICcnKVxuXHRcdFx0LnJlcGxhY2UoL15bXFx1RkVGRlxceEEwXSsvZ20sICcnKVxuXHRcdFx0Ly8g5L+u5q2j5q+P6KGM6ZaL6aCt5aSa5Ye656m655m955qE5ZWP6aGMXG5cdFx0XHQucmVwbGFjZSgvXiArL2dtLCAnJylcblx0XHRcdC5yZXBsYWNlKC8gKyQvZ20sICcnKVxuXHRcdFx0LnJlcGxhY2UoL1xccyskLywgJycpXG5cdFx0O1xuXHR9XG5cblx0cHJvdGVjdGVkIF9zYXZlUmVhZG1lKG9wdGlvbnNSdW50aW1lOiBJT3B0aW9uc1J1bnRpbWUsIG9wdGlvbnMgPSB7fSwgLi4ub3B0cylcblx0e1xuXHRcdG9wdGlvbnNbdGhpcy5JREtFWV0gPSB7XG5cdFx0XHRub3ZlbF9pZDogb3B0aW9uc1J1bnRpbWVbU1lNQk9MX0NBQ0hFXS5ub3ZlbC5ub3ZlbF9pZCxcblx0XHR9O1xuXG5cdFx0cmV0dXJuIHN1cGVyLl9zYXZlUmVhZG1lKG9wdGlvbnNSdW50aW1lLCBvcHRpb25zLCB7XG5cdFx0XHQvL1xuXHRcdH0sIC4uLm9wdHMpO1xuXHR9XG5cblx0cHJvdGVjdGVkIGFzeW5jIF9wYXJzZUNoYXB0ZXI8VD4ocmV0OiBJRmV0Y2hDaGFwdGVyLCBvcHRpb25zUnVudGltZTogVCAmIElPcHRpb25zUnVudGltZSwgY2FjaGUpXG5cdHtcblx0XHRpZiAoIXJldClcblx0XHR7XG5cdFx0XHRyZXR1cm4gJyc7XG5cdFx0fVxuXG5cdFx0bGV0IGJvZHlfc2VsZWN0b3IgPSAnYm9keSc7XG5cblx0XHR0cnlcblx0XHR7XG4vL1x0XHRcdGxldCBodG1sID0gbWluaWZ5SFRNTChyZXQuZG9tLiQoYm9keV9zZWxlY3RvcikuaHRtbCgpKTtcbi8vXG4vL1x0XHRcdC8vaHRtbCA9IGh0bWwucmVwbGFjZSgvXigmbmJzcDspezR9L2dtLCAnJyk7XG4vL1x0XHRcdGh0bWwgPSBodG1sLnJlcGxhY2UoL15cXHMrfFxccyskL2csICcnKTtcbi8vXG4vL1x0XHRcdHJldC5kb20uJChib2R5X3NlbGVjdG9yKS5odG1sKGh0bWwpO1xuXHRcdH1cblx0XHRjYXRjaCAoZSlcblx0XHR7XG5cblx0XHR9XG5cblx0XHRsZXQgdGV4dDogc3RyaW5nO1xuXG5cdFx0aWYgKHJldC5kb20pXG5cdFx0e1xuXHRcdFx0dGV4dCA9IHJldC5kb20uJChib2R5X3NlbGVjdG9yKS50ZXh0KCk7XG5cdFx0fVxuXHRcdGVsc2Vcblx0XHR7XG5cdFx0XHRyZXQuZG9tID0gY3JlYXRlSlNET00ocmV0LmJvZHkudG9TdHJpbmcoKSk7XG5cblx0XHRcdHRleHQgPSByZXQuZG9tLiQoYm9keV9zZWxlY3RvcikudGV4dCgpO1xuXHRcdH1cblxuXHRcdGNvbnN0ICQgPSByZXQuZG9tLiQ7XG5cblx0XHRpZiAocmV0LmRvbS4kKCdpbWcnKS5sZW5ndGgpXG5cdFx0e1xuXHRcdFx0Y2FjaGUuY2hhcHRlci5pbWdzID0gY2FjaGUuY2hhcHRlci5pbWdzIHx8IFtdO1xuXG5cdFx0XHRyZXQuZG9tLiQoJ2ltZ1tzcmNdJykuZWFjaChmdW5jdGlvbiAoKVxuXHRcdFx0e1xuXHRcdFx0XHQvLyBAdHMtaWdub3JlXG5cdFx0XHRcdGNhY2hlLmNoYXB0ZXIuaW1ncy5wdXNoKHJldC5kb20uJCh0aGlzKS5wcm9wKCdzcmMnKSk7XG5cdFx0XHRcdC8vIEB0cy1pZ25vcmVcblx0XHRcdFx0Y2FjaGUubm92ZWwuaW1ncy5wdXNoKHJldC5kb20uJCh0aGlzKS5wcm9wKCdzcmMnKSk7XG5cdFx0XHR9KTtcblxuXHRcdFx0aWYgKG9wdGlvbnNSdW50aW1lLmtlZXBJbWFnZSlcblx0XHRcdHtcblx0XHRcdFx0YXdhaXQgX2tlZXBJbWFnZUluQ29udGV4dChyZXQuZG9tLiQoJ2ltZ1tzcmNdJyksIHJldC5kb20uJCk7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0dGV4dCA9IHRoaXMuX3N0cmlwQ29udGVudCh0ZXh0KTtcblxuXHRcdGxldCBzcCA9ICdbXFx1MDBhMCDjgIBdKic7XG5cblx0XHRsZXQgciA9IG5ldyB6aFJlZ0V4cChgXltcXHUwMGEwIOOAgFxcXFxzXSoke2VzY2FwZVJlZ2V4cChjYWNoZS52b2x1bWUudm9sdW1lX3RpdGxlKX0ke3NwfSR7ZXNjYXBlUmVnZXhwKGNhY2hlLmNoYXB0ZXIuY2hhcHRlcl90aXRsZSl9JHtzcH1gLCAnaWcnKTtcblxuXHRcdHRleHQgPSB0ZXh0XG5cdFx0XHQucmVwbGFjZShyLCAnJylcblx0XHQ7XG5cblx0XHRyZXR1cm4gdGV4dDtcblx0fVxuXG5cdGFzeW5jIGdldF92b2x1bWVfbGlzdDxUID0gSU9wdGlvbnNSdW50aW1lPihpbnB1dFVybDogc3RyaW5nIHwgVVJMLFxuXHRcdG9wdGlvbnNSdW50aW1lOiBQYXJ0aWFsPFQgJiBJRG93bmxvYWRPcHRpb25zPiA9IHt9XG5cdCk6IFByb21pc2U8SU5vdmVsPlxuXHR7XG5cdFx0Y29uc3Qgc2VsZiA9IHRoaXM7XG5cdFx0bGV0IHVybCA9IGF3YWl0IHRoaXMuY3JlYXRlTWFpblVybChpbnB1dFVybCwgb3B0aW9uc1J1bnRpbWUpO1xuXG5cdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdHJldHVybiByZXRyeVJlcXVlc3QodXJsLCBvcHRpb25zUnVudGltZS5yZXF1ZXN0T3B0aW9ucylcblx0XHRcdC50aGVuKGFzeW5jIGZ1bmN0aW9uIChkb20pXG5cdFx0XHR7XG5cdFx0XHRcdGNvbnN0ICQgPSBkb20uJDtcblxuXHRcdFx0XHRkb20gPSBKU09OLnBhcnNlKGRvbSBhcyBzdHJpbmcpO1xuXG5cdFx0XHRcdGxldCBkYXRhX21ldGEgPSBhd2FpdCBzZWxmLl9nZXRfbWV0YSh1cmwsIG9wdGlvbnNSdW50aW1lLCB7XG5cdFx0XHRcdFx0ZG9tLFxuXHRcdFx0XHR9KTtcblxuXHRcdFx0XHR1cmwgPSBkYXRhX21ldGEudXJsO1xuXHRcdFx0XHRsZXQgdXJsX2RhdGEgPSBkYXRhX21ldGEudXJsX2RhdGE7XG5cblx0XHRcdFx0bGV0IF9jYWNoZV9kYXRlcyA9IFtdO1xuXHRcdFx0XHRsZXQgdm9sdW1lX2xpc3QgPSBbXSBhcyBfTm92ZWxTaXRlLklWb2x1bWVbXTtcblxuXHRcdFx0XHRsZXQgY3VycmVudFZvbHVtZTogX05vdmVsU2l0ZS5JVm9sdW1lO1xuXG5cdFx0XHRcdGxldCB0YWJsZSA9IGRvbTtcblxuXHRcdFx0XHR0YWJsZS5mb3JFYWNoKGZ1bmN0aW9uICh2b2x1bWVEYXRhOiB7XG5cdFx0XHRcdFx0dm9sdW1lX2lkOiBudW1iZXIsXG5cdFx0XHRcdFx0aWQ6IG51bWJlcixcblx0XHRcdFx0XHR2b2x1bWVfbmFtZTogc3RyaW5nLFxuXHRcdFx0XHRcdHZvbHVtZV9vcmRlcjogbnVtYmVyLFxuXHRcdFx0XHRcdGNoYXB0ZXJzOiB7XG5cdFx0XHRcdFx0XHRjaGFwdGVyX2lkOiBudW1iZXIsXG5cdFx0XHRcdFx0XHRjaGFwdGVyX25hbWU6IHN0cmluZyxcblx0XHRcdFx0XHRcdGNoYXB0ZXJfb3JkZXI6IG51bWJlcixcblx0XHRcdFx0XHR9W10sXG5cdFx0XHRcdH0pXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRjdXJyZW50Vm9sdW1lID0gdm9sdW1lX2xpc3Rbdm9sdW1lX2xpc3QubGVuZ3RoXSA9IHtcblx0XHRcdFx0XHRcdHZvbHVtZV9pbmRleDogdm9sdW1lX2xpc3QubGVuZ3RoLFxuXHRcdFx0XHRcdFx0dm9sdW1lX3RpdGxlOiBub3ZlbFRleHQudHJpbSh2b2x1bWVEYXRhLnZvbHVtZV9uYW1lKSxcblx0XHRcdFx0XHRcdHZvbHVtZV9pczogdm9sdW1lRGF0YS52b2x1bWVfaWQsXG5cdFx0XHRcdFx0XHR2b2x1bWVfb3JkZXI6IHZvbHVtZURhdGEudm9sdW1lX29yZGVyLFxuXHRcdFx0XHRcdFx0Y2hhcHRlcl9saXN0OiBbXSxcblx0XHRcdFx0XHR9O1xuXG5cdFx0XHRcdFx0dm9sdW1lRGF0YS5jaGFwdGVycy5mb3JFYWNoKGZ1bmN0aW9uIChjaGFwdGVyRGF0YSlcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRsZXQgY2hhcHRlcl91cmwgPSBzZWxmLm1ha2VVcmwoe1xuXHRcdFx0XHRcdFx0XHRjaGFwdGVyX2lkOiBjaGFwdGVyRGF0YS5jaGFwdGVyX2lkLFxuXHRcdFx0XHRcdFx0XHRub3ZlbF9pZDogZGF0YV9tZXRhLm5vdmVsX2lkLFxuXHRcdFx0XHRcdFx0XHR2b2x1bWVfaWQ6IHZvbHVtZURhdGEudm9sdW1lX2lkLFxuXHRcdFx0XHRcdFx0fSk7XG5cblx0XHRcdFx0XHRcdGxldCBjaGFwdGVyX3VybF9kYXRhID0gc2VsZi5wYXJzZVVybChjaGFwdGVyX3VybCk7XG5cblx0XHRcdFx0XHRcdGN1cnJlbnRWb2x1bWVcblx0XHRcdFx0XHRcdFx0LmNoYXB0ZXJfbGlzdFxuXHRcdFx0XHRcdFx0XHQucHVzaCh7XG5cdFx0XHRcdFx0XHRcdFx0Y2hhcHRlcl9pbmRleDogY3VycmVudFZvbHVtZS5jaGFwdGVyX2xpc3QubGVuZ3RoLFxuXHRcdFx0XHRcdFx0XHRcdGNoYXB0ZXJfdGl0bGU6IG5vdmVsVGV4dC50cmltKGNoYXB0ZXJEYXRhLmNoYXB0ZXJfbmFtZSksXG5cdFx0XHRcdFx0XHRcdFx0Y2hhcHRlcl9pZDogY2hhcHRlckRhdGEuY2hhcHRlcl9pZCxcblx0XHRcdFx0XHRcdFx0XHRjaGFwdGVyX29yZGVyOiBjaGFwdGVyRGF0YS5jaGFwdGVyX29yZGVyLFxuXHRcdFx0XHRcdFx0XHRcdGNoYXB0ZXJfdXJsLFxuXHRcdFx0XHRcdFx0XHRcdGNoYXB0ZXJfdXJsX2RhdGEsXG5cdFx0XHRcdFx0XHRcdH0pXG5cdFx0XHRcdFx0XHQ7XG5cdFx0XHRcdFx0fSk7XG5cdFx0XHRcdH0pO1xuXG5cdFx0XHRcdGxldCBub3ZlbF9kYXRlO1xuXG5cdFx0XHRcdGlmIChfY2FjaGVfZGF0ZXMubGVuZ3RoKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0X2NhY2hlX2RhdGVzLnNvcnQoKTtcblxuXHRcdFx0XHRcdG5vdmVsX2RhdGUgPSBtb21lbnQudW5peChfY2FjaGVfZGF0ZXNbX2NhY2hlX2RhdGVzLmxlbmd0aCAtIDFdKS5sb2NhbCgpO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0cmV0dXJuIHtcblxuXHRcdFx0XHRcdHVybCxcblx0XHRcdFx0XHR1cmxfZGF0YSxcblxuXHRcdFx0XHRcdC4uLmRhdGFfbWV0YSxcblxuXHRcdFx0XHRcdHZvbHVtZV9saXN0LFxuXG5cdFx0XHRcdFx0Ly9ub3ZlbF9kYXRlLFxuXG5cdFx0XHRcdFx0Y2hlY2tkYXRlOiBtb21lbnQoKS5sb2NhbCgpLFxuXG5cdFx0XHRcdFx0aW1nczogW10gYXMgc3RyaW5nW10sXG5cdFx0XHRcdH0gYXMgSU5vdmVsO1xuXHRcdFx0fSlcblx0XHRcdC50YXAoZnVuY3Rpb24gKG5vdmVsKVxuXHRcdFx0e1xuXHRcdFx0XHRjb25zb2xlLmRpcihub3ZlbCwge1xuXHRcdFx0XHRcdGNvbG9yczogdHJ1ZSxcblx0XHRcdFx0XHQvL2RlcHRoOiAzLFxuXHRcdFx0XHR9KTtcblx0XHRcdH0pXG5cdFx0XHQ7XG5cdH1cblxuXHRwcm90ZWN0ZWQgYXN5bmMgX2dldF9tZXRhKGlucHV0VXJsLCBvcHRpb25zUnVudGltZSwgY2FjaGU6IHtcblx0XHRkb206IElKU0RPTSxcblx0fSlcblx0e1xuXHRcdGNvbnN0IHNlbGYgPSB0aGlzO1xuXG5cdFx0bGV0IHVybCA9IHNlbGYubWFrZVVybChzZWxmLnBhcnNlVXJsKGlucHV0VXJsKSwgLTEpO1xuXHRcdGxldCB1cmxfZGF0YSA9IHNlbGYucGFyc2VVcmwodXJsKTtcblxuXHRcdHJldHVybiByZXRyeVJlcXVlc3QodXJsLCBvcHRpb25zUnVudGltZS5yZXF1ZXN0T3B0aW9ucylcblx0XHQvL3JldHVybiBmcm9tVVJMKHVybCwgb3B0aW9uc1J1bnRpbWUub3B0aW9uc0pTRE9NKVxuXHRcdC8vcmV0dXJuIFByb21pc2UucmVzb2x2ZShjYWNoZS5kb20pXG5cdFx0XHQudGhlbihmdW5jdGlvbiAoZG9tSnNvbilcblx0XHRcdHtcblx0XHRcdFx0ZG9tSnNvbiA9IEpTT04ucGFyc2UoZG9tSnNvbiBhcyBzdHJpbmcpO1xuXG5cdFx0XHRcdGxldCBkYXRhOiBJTWRjb25mTWV0YSA9IHt9O1xuXHRcdFx0XHRkYXRhLm5vdmVsID0ge307XG5cdFx0XHRcdGRhdGEubm92ZWwudGFncyA9IFtdO1xuXG5cdFx0XHRcdGxldCBub3ZlbF90aXRsZSA9IGRvbUpzb24ubmFtZTtcblx0XHRcdFx0bGV0IG5vdmVsX2F1dGhvciA9IGRvbUpzb24uYXV0aG9ycztcblxuXHRcdFx0XHRkb21Kc29uLnR5cGVzID0gZG9tSnNvbi50eXBlcyB8fCBbXTtcblx0XHRcdFx0ZG9tSnNvbi50eXBlcy5mb3JFYWNoKGZ1bmN0aW9uIChzKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0ZGF0YS5ub3ZlbC50YWdzLnB1c2goLi4ucy5zcGxpdCgnXFwvJykpXG5cdFx0XHRcdH0pO1xuXG5cdFx0XHRcdGRhdGEubm92ZWwudGFncy5wdXNoKGRvbUpzb24uem9uZSk7XG5cdFx0XHRcdC8vZGF0YS5ub3ZlbC50YWdzLnB1c2goZG9tSnNvbi5zdGF0dXMpO1xuXG5cdFx0XHRcdGRhdGEubm92ZWwuc3RhdHVzID0gZG9tSnNvbi5zdGF0dXM7XG5cblx0XHRcdFx0bGV0IG5vdmVsX2NvdmVyID0gZG9tSnNvbi5jb3Zlcjtcblx0XHRcdFx0bGV0IG5vdmVsX2Rlc2MgPSBkb21Kc29uLmludHJvZHVjdGlvbjtcblxuXHRcdFx0XHRsZXQgbm92ZWxfaWQgPSBkb21Kc29uLmlkO1xuXG5cdFx0XHRcdGxldCBub3ZlbF9kYXRlID0gbW9tZW50LnVuaXgoZG9tSnNvbi5sYXN0X3VwZGF0ZV90aW1lKS5sb2NhbCgpO1xuXG5cdFx0XHRcdC8vY29uc29sZS5sb2coZG9tSnNvbik7XG5cblx0XHRcdFx0bGV0IGRtempfYXBpX2pzb24gPSBkb21Kc29uO1xuXG5cdFx0XHRcdGxldCBub3ZlbF91cmwgPSBzZWxmLm1ha2VVcmwodXJsX2RhdGEsIDIpO1xuXG5cdFx0XHRcdHJldHVybiB7XG5cdFx0XHRcdFx0dXJsOiBub3ZlbF91cmwsXG5cdFx0XHRcdFx0dXJsX2RhdGE6IHNlbGYucGFyc2VVcmwobm92ZWxfdXJsKSxcblxuXHRcdFx0XHRcdHVybF9hcGk6IHVybCxcblx0XHRcdFx0XHR1cmxfZGF0YV9hcGk6IHVybF9kYXRhLFxuXG5cdFx0XHRcdFx0Li4uZGF0YSxcblxuXHRcdFx0XHRcdG5vdmVsX3VybCxcblxuXHRcdFx0XHRcdG5vdmVsX2lkLFxuXG5cdFx0XHRcdFx0bm92ZWxfdGl0bGUsXG5cblx0XHRcdFx0XHRub3ZlbF9jb3ZlcixcblxuXHRcdFx0XHRcdG5vdmVsX2F1dGhvcixcblx0XHRcdFx0XHRub3ZlbF9kZXNjLFxuXG5cdFx0XHRcdFx0bm92ZWxfZGF0ZSxcblxuXHRcdFx0XHRcdGRtempfYXBpX2pzb24sXG5cblx0XHRcdFx0fTtcblx0XHRcdH0pXG5cdFx0XHQ7XG5cdH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgTm92ZWxTaXRlVHBsO1xuIl19