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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYXBpLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7R0FFRzs7Ozs7Ozs7QUFFSCx1Q0FBMkM7QUFDM0MsdUNBQTJDO0FBQzNDLHFDQUFtRjtBQUNuRixvQ0FBbUY7QUFJbkYsdUNBQXlDO0FBSXpDLG9DQUFrQztBQUNsQywyQ0FBbUM7QUFDbkMsNkJBQTZCO0FBRTdCLDJDQUFzQztBQUN0Qyw2Q0FBcUU7QUFDckUsMENBQXNEO0FBRXRELGlDQUFrRDtBQUVsRCw4REFBOEQ7QUFHOUQ7SUFBQSxJQUFhLFlBQVksR0FBekIsTUFBYSxZQUFhLFNBQVEsY0FBYTtRQUk5QyxNQUFNLENBQUMsS0FBSyxDQUFDLEdBQXdDLEVBQUUsR0FBRyxJQUFJO1lBRTdELE9BQU8sWUFBSyxDQUFDLEdBQUcsRUFBRSxHQUFHLElBQUksQ0FBQyxDQUFDO1FBQzVCLENBQUM7UUFFRCxNQUFNLENBQUMsT0FBTyxDQUFDLE1BQTRCLEVBQUUsSUFBdUIsRUFBRSxHQUFHLElBQUk7WUFFNUUsT0FBTyxjQUFPLENBQUMsTUFBTSxFQUFFLElBQUksRUFBRSxHQUFHLElBQUksQ0FBQyxDQUFBO1FBQ3RDLENBQUM7UUFFRCxNQUFNLENBQUMsUUFBUSxDQUFDLEdBQTBCLEVBQUUsR0FBRyxJQUFJO1lBRWxELE9BQU8sZUFBUSxDQUFDLEdBQUcsRUFBRSxHQUFHLElBQUksQ0FBQyxDQUFDO1FBQy9CLENBQUM7UUFFRCxPQUFPLENBQUMsTUFBNEIsRUFBRSxJQUF1QixFQUFFLEdBQUcsSUFBSTtZQUVyRSxPQUFPLGNBQU8sQ0FBQyxNQUFNLEVBQUUsSUFBSSxFQUFFLEdBQUcsSUFBSSxDQUFDLENBQUE7UUFDdEMsQ0FBQztRQUVELFFBQVEsQ0FBQyxHQUEwQixFQUFFLEdBQUcsSUFBSTtZQUUzQyxPQUFPLGVBQVEsQ0FBQyxHQUFHLEVBQUUsR0FBRyxJQUFJLENBQUMsQ0FBQztRQUMvQixDQUFDO1FBRUQsT0FBTyxDQUFz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QTZDO09BQ2pELFlBQVksQ0FzVnhCO0lBQUQsbUJBQUM7S0FBQTtBQXRWWSxvQ0FBWTtBQXdWekIsa0JBQWUsWUFBWSxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDcmVhdGVkIGJ5IHVzZXIgb24gMjAxOC8zLzI1LzAyNS5cbiAqL1xuXG5pbXBvcnQgeyByZXRyeVJlcXVlc3QgfSBmcm9tICcuLi8uLi9mZXRjaCc7XG5pbXBvcnQgeyBzdHJpcENvbnRlbnQgfSBmcm9tICcuLi8uLi9zdHJpcCc7XG5pbXBvcnQgeyBhcnJheV91bmlxdWUsIGVzY2FwZVJlZ2V4cCwgaXNVbmRlZiwgbWluaWZ5SFRNTCwgdHJpbSB9IGZyb20gJy4uLy4uL3V0aWwnO1xuaW1wb3J0IF9Ob3ZlbFNpdGUsIHsgc3RhdGljSW1wbGVtZW50cywgU1lNQk9MX0NBQ0hFLCBJTWRjb25mTWV0YSB9IGZyb20gJy4uL2luZGV4JztcbmltcG9ydCB7IElEb3dubG9hZE9wdGlvbnMsIElOb3ZlbCB9IGZyb20gJy4uL2RlbW8vYmFzZSc7XG5pbXBvcnQgeyBJRmV0Y2hDaGFwdGVyLCBJT3B0aW9uc1J1bnRpbWUgfSBmcm9tICcuLi9kZW1vL2Jhc2UnO1xuaW1wb3J0ICogYXMgTm92ZWxTaXRlRGVtbyBmcm9tICcuLi9kZW1vL2Jhc2UnO1xuaW1wb3J0IE5vdmVsU2l0ZUJhc2UgZnJvbSAnLi4vZGVtby9iYXNlJztcbi8vaW1wb3J0IHsgVVJMIH0gZnJvbSAnanNkb20tdXJsJztcbmltcG9ydCB7IGZyb21VUkwsIElGcm9tVXJsT3B0aW9ucywgSUpTRE9NIH0gZnJvbSAnanNkb20tZXh0cmEnO1xuaW1wb3J0IHsgUHJvbWlzZUJsdWViaXJkLCBibHVlYmlyZERlY29yYXRvciB9IGZyb20gJy4uL2luZGV4JztcbmltcG9ydCB7IG1vbWVudCB9IGZyb20gJy4uL2luZGV4JztcbmltcG9ydCBub3ZlbFRleHQgZnJvbSAnbm92ZWwtdGV4dCc7XG5pbXBvcnQgKiBhcyBwYXRoIGZyb20gXCJwYXRoXCI7XG5pbXBvcnQgKiBhcyBTdHJVdGlsIGZyb20gJ3N0ci11dGlsJztcbmltcG9ydCB7IHpoUmVnRXhwIH0gZnJvbSAncmVnZXhwLWNqayc7XG5pbXBvcnQgeyByZXF1ZXN0VG9KU0RPTSwgcGFja0pTRE9NLCBjcmVhdGVKU0RPTSB9IGZyb20gJ2pzZG9tLWV4dHJhJztcbmltcG9ydCB7IF9rZWVwSW1hZ2VJbkNvbnRleHQgfSBmcm9tICcuLi8uLi91dGlsL2h0bWwnO1xuaW1wb3J0IGNyZWF0ZVVSTCBmcm9tICcuLi8uLi91dGlsL3VybCc7XG5pbXBvcnQgeyBwYXJzZVVybCwgbWFrZVVybCwgY2hlY2sgfSBmcm9tICcuL3V0aWwnO1xuXG4vL2ltcG9ydCBlc2NhcGVTdHJpbmdSZWdleHAgPSByZXF1aXJlKCdlc2NhcGUtc3RyaW5nLXJlZ2V4cCcpO1xuXG5Ac3RhdGljSW1wbGVtZW50czxfTm92ZWxTaXRlLklOb3ZlbFNpdGVTdGF0aWM8Tm92ZWxTaXRlVHBsPj4oKVxuZXhwb3J0IGNsYXNzIE5vdmVsU2l0ZVRwbCBleHRlbmRzIE5vdmVsU2l0ZUJhc2Vcbntcblx0cHVibGljIHN0YXRpYyByZWFkb25seSBJREtFWSA9IHBhdGguYmFzZW5hbWUoX19kaXJuYW1lKTtcblxuXHRzdGF0aWMgY2hlY2sodXJsOiBzdHJpbmcgfCBVUkwgfCBfTm92ZWxTaXRlLklQYXJzZVVybCwgLi4uYXJndik6IGJvb2xlYW5cblx0e1xuXHRcdHJldHVybiBjaGVjayh1cmwsIC4uLmFyZ3YpO1xuXHR9XG5cblx0c3RhdGljIG1ha2VVcmwodXJsb2JqOiBfTm92ZWxTaXRlLklQYXJzZVVybCwgYm9vbD86IGJvb2xlYW4gfCBudW1iZXIsIC4uLmFyZ3YpXG5cdHtcblx0XHRyZXR1cm4gbWFrZVVybCh1cmxvYmosIGJvb2wsIC4uLmFyZ3YpXG5cdH1cblxuXHRzdGF0aWMgcGFyc2VVcmwodXJsOiBzdHJpbmcgfCBVUkwgfCBudW1iZXIsIC4uLmFyZ3YpXG5cdHtcblx0XHRyZXR1cm4gcGFyc2VVcmwodXJsLCAuLi5hcmd2KTtcblx0fVxuXG5cdG1ha2VVcmwodXJsb2JqOiBfTm92ZWxTaXRlLklQYXJzZVVybCwgYm9vbD86IGJvb2xlYW4gfCBudW1iZXIsIC4uLmFyZ3YpXG5cdHtcblx0XHRyZXR1cm4gbWFrZVVybCh1cmxvYmosIGJvb2wsIC4uLmFyZ3YpXG5cdH1cblxuXHRwYXJzZVVybCh1cmw6IHN0cmluZyB8IFVSTCB8IG51bWJlciwgLi4uYXJndilcblx0e1xuXHRcdHJldHVybiBwYXJzZVVybCh1cmwsIC4uLmFyZ3YpO1xuXHR9XG5cblx0c2Vzc2lvbjxUID0gSU9wdGlvbnNSdW50aW1lPihvcHRpb25zUnVudGltZTogUGFydGlhbDxUICYgSURvd25sb2FkT3B0aW9ucz4sIHVybDogVVJMKVxuXHR7XG5cdFx0c3VwZXIuc2Vzc2lvbihvcHRpb25zUnVudGltZSwgdXJsKTtcblxuXHRcdG9wdGlvbnNSdW50aW1lLm9wdGlvbnNKU0RPTS5yZXF1ZXN0T3B0aW9ucyA9IG9wdGlvbnNSdW50aW1lLm9wdGlvbnNKU0RPTS5yZXF1ZXN0T3B0aW9ucyB8fCB7fTtcblxuXHRcdC8vIEB0cy1pZ25vcmVcblx0XHRvcHRpb25zUnVudGltZS5vcHRpb25zSlNET00ucmVxdWVzdE9wdGlvbnMuY29udGVudFR5cGUgPSAnanNvbic7XG5cblx0XHQvL2xldCB1cmwgPSBvcHRpb25zUnVudGltZVtTWU1CT0xfQ0FDSEVdLnVybDtcblxuXHRcdG9wdGlvbnNSdW50aW1lLm9wdGlvbnNKU0RPTS5jb29raWVKYXJcblx0XHQvLy5zZXRDb29raWVTeW5jKCdvdmVyMTg9eWVzOyBEb21haW49LnN5b3NldHUuY29tOyBQYXRoPS8nLCB1cmwuaHJlZilcblx0XHQ7XG5cblx0XHRyZXR1cm4gdGhpcztcblx0fVxuXG5cdGNyZWF0ZU1haW5Vcmw8VD4odXJsOiBzdHJpbmcgfCBVUkwsIG9wdGlvbnNSdW50aW1lOiBUICYgSU9wdGlvbnNSdW50aW1lKVxuXHR7XG5cdFx0bGV0IGRhdGEgPSB0aGlzLnBhcnNlVXJsKHVybCk7XG5cblx0XHRpZiAoIWRhdGEgfHwgIWRhdGEubm92ZWxfaWQpXG5cdFx0e1xuXHRcdFx0Y29uc29sZS5sb2coZGF0YSk7XG5cblx0XHRcdHRocm93IG5ldyBSZWZlcmVuY2VFcnJvcigpO1xuXHRcdH1cblxuXHRcdGxldCByZXQgPSB0aGlzLm1ha2VVcmwoZGF0YSwgdHJ1ZSwgb3B0aW9uc1J1bnRpbWUpO1xuXG5cdFx0cmV0dXJuIHJldDtcblx0fVxuXG5cdF9zdHJpcENvbnRlbnQodGV4dDogc3RyaW5nKVxuXHR7XG5cdFx0dGV4dCA9IHN0cmlwQ29udGVudCh0ZXh0KTtcblxuXHRcdC8vcHJvY2Vzcy5leGl0KCk7XG5cblx0XHRyZXR1cm4gdGV4dFxuXHRcdFx0Ly8ucmVwbGFjZSgvXuOAgOOAgC9nbSwgJycpXG5cdFx0XHQucmVwbGFjZSgvXltcXHVGRUZGXFx4QTBdKy9nbSwgJycpXG5cdFx0XHQvLyDkv67mraPmr4/ooYzplovpoK3lpJrlh7rnqbrnmb3nmoTllY/poYxcblx0XHRcdC5yZXBsYWNlKC9eICsvZ20sICcnKVxuXHRcdFx0LnJlcGxhY2UoLyArJC9nbSwgJycpXG5cdFx0XHQucmVwbGFjZSgvXFxzKyQvLCAnJylcblx0XHQ7XG5cdH1cblxuXHRwcm90ZWN0ZWQgX3NhdmVSZWFkbWUob3B0aW9uc1J1bnRpbWU6IElPcHRpb25zUnVudGltZSwgb3B0aW9ucyA9IHt9LCAuLi5vcHRzKVxuXHR7XG5cdFx0b3B0aW9uc1t0aGlzLklES0VZXSA9IHtcblx0XHRcdG5vdmVsX2lkOiBvcHRpb25zUnVudGltZVtTWU1CT0xfQ0FDSEVdLm5vdmVsLm5vdmVsX2lkLFxuXHRcdH07XG5cblx0XHRyZXR1cm4gc3VwZXIuX3NhdmVSZWFkbWUob3B0aW9uc1J1bnRpbWUsIG9wdGlvbnMsIHtcblx0XHRcdC8vXG5cdFx0fSwgLi4ub3B0cyk7XG5cdH1cblxuXHRwcm90ZWN0ZWQgYXN5bmMgX3BhcnNlQ2hhcHRlcjxUPihyZXQ6IElGZXRjaENoYXB0ZXIsIG9wdGlvbnNSdW50aW1lOiBUICYgSU9wdGlvbnNSdW50aW1lLCBjYWNoZSlcblx0e1xuXHRcdGlmICghcmV0KVxuXHRcdHtcblx0XHRcdHJldHVybiAnJztcblx0XHR9XG5cblx0XHRsZXQgYm9keV9zZWxlY3RvciA9ICdib2R5JztcblxuXHRcdHRyeVxuXHRcdHtcbi8vXHRcdFx0bGV0IGh0bWwgPSBtaW5pZnlIVE1MKHJldC5kb20uJChib2R5X3NlbGVjdG9yKS5odG1sKCkpO1xuLy9cbi8vXHRcdFx0Ly9odG1sID0gaHRtbC5yZXBsYWNlKC9eKCZuYnNwOyl7NH0vZ20sICcnKTtcbi8vXHRcdFx0aHRtbCA9IGh0bWwucmVwbGFjZSgvXlxccyt8XFxzKyQvZywgJycpO1xuLy9cbi8vXHRcdFx0cmV0LmRvbS4kKGJvZHlfc2VsZWN0b3IpLmh0bWwoaHRtbCk7XG5cdFx0fVxuXHRcdGNhdGNoIChlKVxuXHRcdHtcblxuXHRcdH1cblxuXHRcdGxldCB0ZXh0OiBzdHJpbmc7XG5cblx0XHRpZiAocmV0LmRvbSlcblx0XHR7XG5cdFx0XHR0ZXh0ID0gcmV0LmRvbS4kKGJvZHlfc2VsZWN0b3IpLnRleHQoKTtcblx0XHR9XG5cdFx0ZWxzZVxuXHRcdHtcblx0XHRcdHJldC5kb20gPSBjcmVhdGVKU0RPTShyZXQuYm9keS50b1N0cmluZygpKTtcblxuXHRcdFx0dGV4dCA9IHJldC5kb20uJChib2R5X3NlbGVjdG9yKS50ZXh0KCk7XG5cdFx0fVxuXG5cdFx0Y29uc3QgJCA9IHJldC5kb20uJDtcblxuXHRcdGlmIChyZXQuZG9tLiQoJ2ltZycpLmxlbmd0aClcblx0XHR7XG5cdFx0XHRjYWNoZS5jaGFwdGVyLmltZ3MgPSBjYWNoZS5jaGFwdGVyLmltZ3MgfHwgW107XG5cblx0XHRcdHJldC5kb20uJCgnaW1nW3NyY10nKS5lYWNoKGZ1bmN0aW9uICgpXG5cdFx0XHR7XG5cdFx0XHRcdC8vIEB0cy1pZ25vcmVcblx0XHRcdFx0Y2FjaGUuY2hhcHRlci5pbWdzLnB1c2gocmV0LmRvbS4kKHRoaXMpLnByb3AoJ3NyYycpKTtcblx0XHRcdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdFx0XHRjYWNoZS5ub3ZlbC5pbWdzLnB1c2gocmV0LmRvbS4kKHRoaXMpLnByb3AoJ3NyYycpKTtcblx0XHRcdH0pO1xuXG5cdFx0XHRpZiAob3B0aW9uc1J1bnRpbWUua2VlcEltYWdlKVxuXHRcdFx0e1xuXHRcdFx0XHRhd2FpdCBfa2VlcEltYWdlSW5Db250ZXh0KHJldC5kb20uJCgnaW1nW3NyY10nKSwgcmV0LmRvbS4kKTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHR0ZXh0ID0gdGhpcy5fc3RyaXBDb250ZW50KHRleHQpO1xuXG5cdFx0bGV0IHNwID0gJ1tcXHUwMGEwIOOAgF0qJztcblxuXHRcdGxldCByID0gbmV3IHpoUmVnRXhwKGBeW1xcdTAwYTAg44CAXFxcXHNdKiR7ZXNjYXBlUmVnZXhwKGNhY2hlLnZvbHVtZS52b2x1bWVfdGl0bGUpfSR7c3B9JHtlc2NhcGVSZWdleHAoY2FjaGUuY2hhcHRlci5jaGFwdGVyX3RpdGxlKX0ke3NwfWAsICdpZycpO1xuXG5cdFx0dGV4dCA9IHRleHRcblx0XHRcdC5yZXBsYWNlKHIsICcnKVxuXHRcdDtcblxuXHRcdHJldHVybiB0ZXh0O1xuXHR9XG5cblx0YXN5bmMgZ2V0X3ZvbHVtZV9saXN0PFQgPSBJT3B0aW9uc1J1bnRpbWU+KGlucHV0VXJsOiBzdHJpbmcgfCBVUkwsXG5cdFx0b3B0aW9uc1J1bnRpbWU6IFBhcnRpYWw8VCAmIElEb3dubG9hZE9wdGlvbnM+ID0ge31cblx0KTogUHJvbWlzZTxJTm92ZWw+XG5cdHtcblx0XHRjb25zdCBzZWxmID0gdGhpcztcblx0XHRsZXQgdXJsID0gYXdhaXQgdGhpcy5jcmVhdGVNYWluVXJsKGlucHV0VXJsLCBvcHRpb25zUnVudGltZSk7XG5cblx0XHQvLyBAdHMtaWdub3JlXG5cdFx0cmV0dXJuIHJldHJ5UmVxdWVzdCh1cmwsIG9wdGlvbnNSdW50aW1lLnJlcXVlc3RPcHRpb25zKVxuXHRcdFx0LnRoZW4oYXN5bmMgZnVuY3Rpb24gKGRvbSlcblx0XHRcdHtcblx0XHRcdFx0Y29uc3QgJCA9IGRvbS4kO1xuXG5cdFx0XHRcdGRvbSA9IEpTT04ucGFyc2UoZG9tIGFzIHN0cmluZyk7XG5cblx0XHRcdFx0bGV0IGRhdGFfbWV0YSA9IGF3YWl0IHNlbGYuX2dldF9tZXRhKHVybCwgb3B0aW9uc1J1bnRpbWUsIHtcblx0XHRcdFx0XHRkb20sXG5cdFx0XHRcdH0pO1xuXG5cdFx0XHRcdHVybCA9IGRhdGFfbWV0YS51cmw7XG5cdFx0XHRcdGxldCB1cmxfZGF0YSA9IGRhdGFfbWV0YS51cmxfZGF0YTtcblxuXHRcdFx0XHRsZXQgX2NhY2hlX2RhdGVzID0gW107XG5cdFx0XHRcdGxldCB2b2x1bWVfbGlzdCA9IFtdIGFzIF9Ob3ZlbFNpdGUuSVZvbHVtZVtdO1xuXG5cdFx0XHRcdGxldCBjdXJyZW50Vm9sdW1lOiBfTm92ZWxTaXRlLklWb2x1bWU7XG5cblx0XHRcdFx0bGV0IHRhYmxlID0gZG9tO1xuXG5cdFx0XHRcdHRhYmxlLmZvckVhY2goZnVuY3Rpb24gKHZvbHVtZURhdGE6IHtcblx0XHRcdFx0XHR2b2x1bWVfaWQ6IG51bWJlcixcblx0XHRcdFx0XHRpZDogbnVtYmVyLFxuXHRcdFx0XHRcdHZvbHVtZV9uYW1lOiBzdHJpbmcsXG5cdFx0XHRcdFx0dm9sdW1lX29yZGVyOiBudW1iZXIsXG5cdFx0XHRcdFx0Y2hhcHRlcnM6IHtcblx0XHRcdFx0XHRcdGNoYXB0ZXJfaWQ6IG51bWJlcixcblx0XHRcdFx0XHRcdGNoYXB0ZXJfbmFtZTogc3RyaW5nLFxuXHRcdFx0XHRcdFx0Y2hhcHRlcl9vcmRlcjogbnVtYmVyLFxuXHRcdFx0XHRcdH1bXSxcblx0XHRcdFx0fSlcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGN1cnJlbnRWb2x1bWUgPSB2b2x1bWVfbGlzdFt2b2x1bWVfbGlzdC5sZW5ndGhdID0ge1xuXHRcdFx0XHRcdFx0dm9sdW1lX2luZGV4OiB2b2x1bWVfbGlzdC5sZW5ndGgsXG5cdFx0XHRcdFx0XHR2b2x1bWVfdGl0bGU6IG5vdmVsVGV4dC50cmltKHZvbHVtZURhdGEudm9sdW1lX25hbWUpLFxuXHRcdFx0XHRcdFx0dm9sdW1lX2lzOiB2b2x1bWVEYXRhLnZvbHVtZV9pZCxcblx0XHRcdFx0XHRcdHZvbHVtZV9vcmRlcjogdm9sdW1lRGF0YS52b2x1bWVfb3JkZXIsXG5cdFx0XHRcdFx0XHRjaGFwdGVyX2xpc3Q6IFtdLFxuXHRcdFx0XHRcdH07XG5cblx0XHRcdFx0XHR2b2x1bWVEYXRhLmNoYXB0ZXJzLmZvckVhY2goZnVuY3Rpb24gKGNoYXB0ZXJEYXRhKVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdGxldCBjaGFwdGVyX3VybCA9IHNlbGYubWFrZVVybCh7XG5cdFx0XHRcdFx0XHRcdGNoYXB0ZXJfaWQ6IGNoYXB0ZXJEYXRhLmNoYXB0ZXJfaWQsXG5cdFx0XHRcdFx0XHRcdG5vdmVsX2lkOiBkYXRhX21ldGEubm92ZWxfaWQsXG5cdFx0XHRcdFx0XHRcdHZvbHVtZV9pZDogdm9sdW1lRGF0YS52b2x1bWVfaWQsXG5cdFx0XHRcdFx0XHR9KTtcblxuXHRcdFx0XHRcdFx0bGV0IGNoYXB0ZXJfdXJsX2RhdGEgPSBzZWxmLnBhcnNlVXJsKGNoYXB0ZXJfdXJsKTtcblxuXHRcdFx0XHRcdFx0Y3VycmVudFZvbHVtZVxuXHRcdFx0XHRcdFx0XHQuY2hhcHRlcl9saXN0XG5cdFx0XHRcdFx0XHRcdC5wdXNoKHtcblx0XHRcdFx0XHRcdFx0XHRjaGFwdGVyX2luZGV4OiBjdXJyZW50Vm9sdW1lLmNoYXB0ZXJfbGlzdC5sZW5ndGgsXG5cdFx0XHRcdFx0XHRcdFx0Y2hhcHRlcl90aXRsZTogbm92ZWxUZXh0LnRyaW0oY2hhcHRlckRhdGEuY2hhcHRlcl9uYW1lKSxcblx0XHRcdFx0XHRcdFx0XHRjaGFwdGVyX2lkOiBjaGFwdGVyRGF0YS5jaGFwdGVyX2lkLFxuXHRcdFx0XHRcdFx0XHRcdGNoYXB0ZXJfb3JkZXI6IGNoYXB0ZXJEYXRhLmNoYXB0ZXJfb3JkZXIsXG5cdFx0XHRcdFx0XHRcdFx0Y2hhcHRlcl91cmwsXG5cdFx0XHRcdFx0XHRcdFx0Y2hhcHRlcl91cmxfZGF0YSxcblx0XHRcdFx0XHRcdFx0fSlcblx0XHRcdFx0XHRcdDtcblx0XHRcdFx0XHR9KTtcblx0XHRcdFx0fSk7XG5cblx0XHRcdFx0bGV0IG5vdmVsX2RhdGU7XG5cblx0XHRcdFx0aWYgKF9jYWNoZV9kYXRlcy5sZW5ndGgpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRfY2FjaGVfZGF0ZXMuc29ydCgpO1xuXG5cdFx0XHRcdFx0bm92ZWxfZGF0ZSA9IG1vbWVudC51bml4KF9jYWNoZV9kYXRlc1tfY2FjaGVfZGF0ZXMubGVuZ3RoIC0gMV0pLmxvY2FsKCk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRyZXR1cm4ge1xuXG5cdFx0XHRcdFx0dXJsLFxuXHRcdFx0XHRcdHVybF9kYXRhLFxuXG5cdFx0XHRcdFx0Li4uZGF0YV9tZXRhLFxuXG5cdFx0XHRcdFx0dm9sdW1lX2xpc3QsXG5cblx0XHRcdFx0XHQvL25vdmVsX2RhdGUsXG5cblx0XHRcdFx0XHRjaGVja2RhdGU6IG1vbWVudCgpLmxvY2FsKCksXG5cblx0XHRcdFx0XHRpbWdzOiBbXSBhcyBzdHJpbmdbXSxcblx0XHRcdFx0fSBhcyBJTm92ZWw7XG5cdFx0XHR9KVxuXHRcdFx0LnRhcChmdW5jdGlvbiAobm92ZWwpXG5cdFx0XHR7XG5cdFx0XHRcdGNvbnNvbGUuZGlyKG5vdmVsLCB7XG5cdFx0XHRcdFx0Y29sb3JzOiB0cnVlLFxuXHRcdFx0XHRcdC8vZGVwdGg6IDMsXG5cdFx0XHRcdH0pO1xuXHRcdFx0fSlcblx0XHRcdDtcblx0fVxuXG5cdHByb3RlY3RlZCBhc3luYyBfZ2V0X21ldGEoaW5wdXRVcmwsIG9wdGlvbnNSdW50aW1lLCBjYWNoZToge1xuXHRcdGRvbTogSUpTRE9NLFxuXHR9KVxuXHR7XG5cdFx0Y29uc3Qgc2VsZiA9IHRoaXM7XG5cblx0XHRsZXQgdXJsID0gc2VsZi5tYWtlVXJsKHNlbGYucGFyc2VVcmwoaW5wdXRVcmwpLCAtMSk7XG5cdFx0bGV0IHVybF9kYXRhID0gc2VsZi5wYXJzZVVybCh1cmwpO1xuXG5cdFx0cmV0dXJuIHJldHJ5UmVxdWVzdCh1cmwsIG9wdGlvbnNSdW50aW1lLnJlcXVlc3RPcHRpb25zKVxuXHRcdC8vcmV0dXJuIGZyb21VUkwodXJsLCBvcHRpb25zUnVudGltZS5vcHRpb25zSlNET00pXG5cdFx0Ly9yZXR1cm4gUHJvbWlzZS5yZXNvbHZlKGNhY2hlLmRvbSlcblx0XHRcdC50aGVuKGZ1bmN0aW9uIChkb21Kc29uKVxuXHRcdFx0e1xuXHRcdFx0XHRkb21Kc29uID0gSlNPTi5wYXJzZShkb21Kc29uIGFzIHN0cmluZyk7XG5cblx0XHRcdFx0bGV0IGRhdGE6IElNZGNvbmZNZXRhID0ge307XG5cdFx0XHRcdGRhdGEubm92ZWwgPSB7fTtcblx0XHRcdFx0ZGF0YS5ub3ZlbC50YWdzID0gW107XG5cblx0XHRcdFx0bGV0IG5vdmVsX3RpdGxlID0gZG9tSnNvbi5uYW1lO1xuXHRcdFx0XHRsZXQgbm92ZWxfYXV0aG9yID0gZG9tSnNvbi5hdXRob3JzO1xuXG5cdFx0XHRcdGRvbUpzb24udHlwZXMgPSBkb21Kc29uLnR5cGVzIHx8IFtdO1xuXHRcdFx0XHRkb21Kc29uLnR5cGVzLmZvckVhY2goZnVuY3Rpb24gKHMpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRkYXRhLm5vdmVsLnRhZ3MucHVzaCguLi5zLnNwbGl0KCdcXC8nKSlcblx0XHRcdFx0fSk7XG5cblx0XHRcdFx0ZGF0YS5ub3ZlbC50YWdzLnB1c2goZG9tSnNvbi56b25lKTtcblx0XHRcdFx0Ly9kYXRhLm5vdmVsLnRhZ3MucHVzaChkb21Kc29uLnN0YXR1cyk7XG5cblx0XHRcdFx0ZGF0YS5ub3ZlbC5zdGF0dXMgPSBkb21Kc29uLnN0YXR1cztcblxuXHRcdFx0XHRsZXQgbm92ZWxfY292ZXIgPSBkb21Kc29uLmNvdmVyO1xuXHRcdFx0XHRsZXQgbm92ZWxfZGVzYyA9IGRvbUpzb24uaW50cm9kdWN0aW9uO1xuXG5cdFx0XHRcdGxldCBub3ZlbF9pZCA9IGRvbUpzb24uaWQ7XG5cblx0XHRcdFx0bGV0IG5vdmVsX2RhdGUgPSBtb21lbnQudW5peChkb21Kc29uLmxhc3RfdXBkYXRlX3RpbWUpLmxvY2FsKCk7XG5cblx0XHRcdFx0Ly9jb25zb2xlLmxvZyhkb21Kc29uKTtcblxuXHRcdFx0XHRsZXQgZG16al9hcGlfanNvbiA9IGRvbUpzb247XG5cblx0XHRcdFx0bGV0IG5vdmVsX3VybCA9IHNlbGYubWFrZVVybCh1cmxfZGF0YSwgMik7XG5cblx0XHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0XHR1cmw6IG5vdmVsX3VybCxcblx0XHRcdFx0XHR1cmxfZGF0YTogc2VsZi5wYXJzZVVybChub3ZlbF91cmwpLFxuXG5cdFx0XHRcdFx0dXJsX2FwaTogdXJsLFxuXHRcdFx0XHRcdHVybF9kYXRhX2FwaTogdXJsX2RhdGEsXG5cblx0XHRcdFx0XHQuLi5kYXRhLFxuXG5cdFx0XHRcdFx0bm92ZWxfdXJsLFxuXG5cdFx0XHRcdFx0bm92ZWxfaWQsXG5cblx0XHRcdFx0XHRub3ZlbF90aXRsZSxcblxuXHRcdFx0XHRcdG5vdmVsX2NvdmVyLFxuXG5cdFx0XHRcdFx0bm92ZWxfYXV0aG9yLFxuXHRcdFx0XHRcdG5vdmVsX2Rlc2MsXG5cblx0XHRcdFx0XHRub3ZlbF9kYXRlLFxuXG5cdFx0XHRcdFx0ZG16al9hcGlfanNvbixcblxuXHRcdFx0XHR9O1xuXHRcdFx0fSlcblx0XHRcdDtcblx0fVxufVxuXG5leHBvcnQgZGVmYXVsdCBOb3ZlbFNpdGVUcGw7XG4iXX0=