"use strict";
/**
 * Created by user on 2018/3/17/017.
 */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = require("../../util");
const tree_1 = require("../demo/tree");
const jsdom_extra_1 = require("jsdom-extra");
const index_1 = require("../index");
const fetch_1 = require("../../fetch");
const value_1 = require("../../util/value");
const regex_1 = require("../../util/regex");
const html_1 = require("../../util/html");
const util_2 = require("./util");
//import { URL } from 'jsdom-url';
let NovelSiteESJZone = /** @class */ (() => {
    let NovelSiteESJZone = class NovelSiteESJZone extends tree_1.default {
        _constructor(...argv) {
            // @ts-ignore
            super._constructor(...argv);
            this._reContext = new regex_1.zhRegExp(/^(?:由於百度\s*\d+\s*年以前的貼文都刪了|所以不清楚是由哪位大佬翻譯|若轉載的動作冒犯了您，先跟您說聲抱歉！|也麻煩留言告知，我們會將此文下架|已?由?譯者授權轉載！?|原文網址：[^\n]+|轉載自貼吧|ESJ輕小說(\s*(?:https:\/\/)?www\.esjzone\.cc\/?)?|僅供個人學習交流使用，禁作商業用途|下載后請在24小時內刪除，[^\n]*不負擔任何責任|請尊重翻譯、掃圖、錄入、校對的辛勤勞動，轉載請保留信息|轉載自真白)$/uigm);
        }
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
        async _decodeChapter(ret, optionsRuntime, cache) {
            const { dom } = ret;
            const { $ } = dom;
            let html = dom.serialize();
            let m = html
                .match(/getTranslation\(['"]([^\'"]+)['"]/i);
            if (m) {
                let code = m[1];
                await fetch_1.retryRequest(ret.url, Object.assign(Object.assign({}, optionsRuntime.requestOptions), { method: 'POST', form: {
                        plxf: 'getTranslation',
                        plxa: [code],
                    } }))
                    .then((v) => {
                    v = v
                        .replace(/\<JinJing\>/, '')
                        .replace(/\<\/JinJing\>/, '');
                    return JSON.parse(v);
                })
                    /*
                    .tap(v => {
                        console.dir('-----------------------')
                        console.dir(v)
                        console.dir('-----------------------')
                    })
                     */
                    .tap((a) => {
                    let elems = $('.trans, .t');
                    a.forEach((v, i) => {
                        elems.eq(i).html(v);
                    });
                });
            }
            //console.dir(m);
            //process.exit();
        }
        async _parseChapter(ret, optionsRuntime, cache) {
            if (!ret) {
                return '';
            }
            const $ = ret.dom.$;
            try {
                let html = util_1.minifyHTML(ret.dom.$('.container .row:has(.forum-content)').html());
                ret.dom.$('.container .row:has(.forum-content)').html(html);
            }
            catch (e) {
            }
            if (!ret.dom.$('.container .row:has(.forum-content)').html()) {
                throw this._fetchChapterRetryError(`發現防爬蟲機制，將稍後再試圖下載`, ret, optionsRuntime, cache);
            }
            ret.dom.$('p[class]:has(> script), .adsbygoogle').remove();
            await this._decodeChapter(ret, optionsRuntime, cache);
            util_2._p_2_br('.forum-content > p', ret.dom.$);
            let elem = ret.dom.$('.container .forum-content');
            elem.html(function (i, old) {
                return old
                    .replace(/(\<br\>){3,4}/g, '$1')
                    .replace(/(?<=\<br\>)(?=[^\n])/g, '\n');
            });
            let title = util_1.trim(ret.dom.$('.container .row > div > h3').text());
            if (optionsRuntime.keepImage) {
                await html_1._keepImageInContext(elem.find('img[src]'), $);
            }
            let txt = elem
                .text()
                .replace(this._reContext, '')
                .replace(/^\s+|\s+$/g, '');
            if (txt.indexOf(title + '\n') === 0) {
                txt = txt.slice(title.length + 1)
                    .replace(/^\n+/g, '');
            }
            let contribute = value_1.dotGetValue(cache, 'novel.contribute', { default: [] });
            txt = txt.replace(/^翻譯：([^\n]+)\n/, (s, v) => {
                v = v.replace(/^[\s　\xA0]+|[\s　\xA0]+$/g, '');
                if (v && !contribute.includes(v)) {
                    contribute.push(v);
                }
                return '';
            });
            if (contribute.length) {
                value_1.dotSetValue(cache, 'novel.contribute', contribute);
            }
            /*
            let html = elem.html();
    
            throw console.dir({
                html,
                txt,
            });
             */
            //		console.dir(txt);
            //		process.exit();
            return txt;
        }
        async get_volume_list(url, optionsRuntime = {}) {
            const self = this;
            url = await this.createMainUrl(url, optionsRuntime);
            return jsdom_extra_1.fromURL(url, optionsRuntime.optionsJSDOM)
                .then(async function (dom) {
                const $ = dom.$;
                try {
                    let html = util_1.minifyHTML(dom.$('.product-detail').html());
                    dom.$('.product-detail').html(html);
                }
                catch (e) {
                }
                let novel_title = dom.$('.container .row > div > h3').text();
                let novel_publisher = self.IDKEY;
                let url_data = self.parseUrl(dom.url.href);
                let novel_author;
                let novel_date;
                $('.product-detail .well .nav-list > li')
                    .each(function (i, elem) {
                    let _this = $(this);
                    let _text = util_1.trim(_this.text());
                    let _m;
                    if (_m = _text.match(/作者\s*[：:]\s*([^\n]+)/)) {
                        novel_author = util_1.trim(_m[1]);
                    }
                    else if (_m = _text.match(/\b(\d{4}\-\d{1,2}\-\d{1,2})\b/)) {
                        try {
                            let last_update_time = index_1.moment(_m[1]);
                            novel_date = last_update_time;
                        }
                        catch (e) {
                        }
                    }
                });
                let volume_list = [];
                const novelTree = optionsRuntime.novelTree;
                let currentVolume;
                let _content = $('.product-detail:eq(0)');
                let table = _content.find('#tab1 a[href], #tab1  .non');
                let _cache_dates = [];
                let total_idx = 0;
                {
                    let volume_title = 'null';
                    let volume_level = null;
                    currentVolume = novelTree.addVolume({
                        volume_title,
                        volume_level,
                        volume_index: novelTree.root().size(),
                        total_idx: total_idx++,
                    });
                }
                //console.dir(table.length)
                table
                    .each(function (index, elem) {
                    let tr = $(elem);
                    let _this = tr;
                    if (_this.is('.non')) {
                        let volume_title = util_1.trim(_this.text());
                        if (volume_title) {
                            currentVolume = novelTree.addVolume({
                                volume_title,
                                volume_index: novelTree.root().size(),
                                total_idx: total_idx++,
                            });
                            return;
                        }
                    }
                    if (tr.is('a')) {
                        let a = tr;
                        let chapter_title = util_1.trim(a.text(), true);
                        //console.log(chapter_title)
                        let href = a.prop('href');
                        let data = self.parseUrl(href);
                        if (!data.chapter_id) {
                            return;
                        }
                        else {
                            href = self.makeUrl(data);
                            data.url = href;
                        }
                        let chapter = {
                            chapter_title,
                            chapter_id: data.chapter_id,
                            chapter_url: href,
                            chapter_url_data: data,
                            chapter_index: currentVolume.size(),
                            total_idx: total_idx++,
                        };
                        novelTree.addChapter(chapter, currentVolume);
                    }
                });
                dom.$('p[class]:has(> script[src*=google]), div[class]:has(> script[src*=google]), .adsbygoogle').remove();
                let data_meta = {
                    novel: {},
                };
                $('.product-detail .well ')
                    .find('.row a[href]')
                    .not('.btn, .form-group *')
                    .each((i, elem) => {
                    let _this = $(elem);
                    let name = util_1.trim(_this.text());
                    let href = _this.prop('href');
                    if (name === href) {
                        name = undefined;
                    }
                    data_meta.link = data_meta.link || [];
                    data_meta.link.push(href);
                });
                $('.show-tag a[href*="tag"]')
                    .each((i, elem) => {
                    let _this = $(elem);
                    let name = util_1.trim(_this.text());
                    if (name) {
                        data_meta.novel.tags = data_meta.novel.tags || [];
                        data_meta.novel.tags.push(name);
                    }
                });
                data_meta.novel.cover = $('.product-detail:eq(0)').find('img.product-image:not([src*="empty.jpg"])').prop('src');
                let novel_desc = util_1.trim($('.product-detail:eq(0)').find('.book_description').text() || '');
                return Object.assign(Object.assign({}, data_meta), { url: dom.url, url_data,
                    novel_author,
                    novel_date,
                    novel_desc,
                    novel_title,
                    novel_publisher,
                    //volume_list,
                    novelTree, checkdate: index_1.moment().local(), imgs: [] });
            });
        }
    };
    NovelSiteESJZone.IDKEY = 'esjzone';
    NovelSiteESJZone = __decorate([
        index_1.staticImplements()
    ], NovelSiteESJZone);
    return NovelSiteESJZone;
})();
exports.NovelSiteESJZone = NovelSiteESJZone;
exports.default = NovelSiteESJZone;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7O0dBRUc7Ozs7Ozs7O0FBRUgscUNBQThDO0FBQzlDLHVDQUF1RztBQUd2Ryw2Q0FBOEM7QUFDOUMsb0NBQStEO0FBQy9ELHVDQUEyQztBQUMzQyw0Q0FBNEQ7QUFDNUQsNENBQTRDO0FBQzVDLDBDQUFzRDtBQUN0RCxpQ0FBMkQ7QUFFM0Qsa0NBQWtDO0FBR2xDO0lBQUEsSUFBYSxnQkFBZ0IsR0FBN0IsTUFBYSxnQkFBaUIsU0FBUSxjQUFhO1FBaUJsRCxZQUFZLENBQUMsR0FBRyxJQUFJO1lBRW5CLGFBQWE7WUFDYixLQUFLLENBQUMsWUFBWSxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUM7WUFFNUIsSUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLGdCQUFRLENBQUMsa1BBQWtQLENBQUMsQ0FBQztRQUVwUixDQUFDO1FBRUQsTUFBTSxDQUFDLEtBQUssQ0FBQyxHQUF1QyxFQUFFLEdBQUcsSUFBSTtZQUU1RCxPQUFPLFlBQUssQ0FBQyxHQUFHLEVBQUUsR0FBRyxJQUFJLENBQUMsQ0FBQztRQUM1QixDQUFDO1FBRUQsTUFBTSxDQUFDLE9BQU8sQ0FBQyxNQUEyQixFQUFFLElBQXVCLEVBQUUsR0FBRyxJQUFJO1lBRTNFLE9BQU8sY0FBTyxDQUFDLE1BQU0sRUFBRSxJQUFJLEVBQUUsR0FBRyxJQUFJLENBQUMsQ0FBQTtRQUN0QyxDQUFDO1FBRUQsTUFBTSxDQUFDLFFBQVEsQ0FBQyxHQUEwQixFQUFFLEdBQUcsSUFBSTtZQUVsRCxPQUFPLGVBQVEsQ0FBQyxHQUFHLEVBQUUsR0FBRyxJQUFJLENBQUMsQ0FBQztRQUMvQixDQUFDO1FBRUQsT0FBTyxDQUFDLE1BQTJCLEVBQUUsSUFBdUIsRUFBRSxHQUFHLElBQUk7WUFFcEUsT0FBTyxjQUFPLENBQUMsTUFBTSxFQUFFLElBQUksRUFBRSxHQUFHLElBQUksQ0FBQyxDQUFBO1FB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LEVBQUUsQ0FBQyxDQUFDO2dCQUV6RixPQUFPLGdDQUVILFNBQVMsS0FFWixHQUFHLEVBQUUsR0FBRyxDQUFDLEdBQUcsRUFDWixRQUFRO29CQUVSLFlBQVk7b0JBQ1osVUFBVTtvQkFFVixVQUFVO29CQUVWLFdBQVc7b0JBQ1gsZUFBZTtvQkFFZixjQUFjO29CQUNkLFNBQVMsRUFFVCxTQUFTLEVBQUUsY0FBTSxFQUFFLENBQUMsS0FBSyxFQUFFLEVBRTNCLElBQUksRUFBRSxFQUFjLEdBQ1YsQ0FBQztZQUNiLENBQUMsQ0FBQyxDQUNEO1FBQ0gsQ0FBQztLQUVELENBQUE7SUFwYXVCLHNCQUFLLEdBQUcsU0FBUyxDQUFDO0lBRjdCLGdCQUFnQjtRQUQ1Qix3QkFBZ0IsRUFBZ0Q7T0FDcEQsZ0JBQWdCLENBc2E1QjtJQUFELHVCQUFDO0tBQUE7QUF0YVksNENBQWdCO0FBd2E3QixrQkFBZSxnQkFBZ0IsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ3JlYXRlZCBieSB1c2VyIG9uIDIwMTgvMy8xNy8wMTcuXG4gKi9cblxuaW1wb3J0IHsgbWluaWZ5SFRNTCwgdHJpbSB9IGZyb20gJy4uLy4uL3V0aWwnO1xuaW1wb3J0IE5vdmVsU2l0ZURlbW8sIHsgSURvd25sb2FkT3B0aW9ucywgSU5vdmVsLCBJT3B0aW9uc1J1bnRpbWUsIElGZXRjaENoYXB0ZXIgfSBmcm9tICcuLi9kZW1vL3RyZWUnO1xuaW1wb3J0IHsgSVJvd1ZvbHVtZSwgVHJlZU5vZGUsIElSb3dDaGFwdGVyIH0gZnJvbSAnLi4vLi4vdHJlZS9pbmRleCc7XG5pbXBvcnQgeyBJTWRjb25mTWV0YSB9IGZyb20gJ25vZGUtbm92ZWwtaW5mbyc7XG5pbXBvcnQgeyBmcm9tVVJMLCBJSlNET00gfSBmcm9tICdqc2RvbS1leHRyYSc7XG5pbXBvcnQgTm92ZWxTaXRlLCB7IHN0YXRpY0ltcGxlbWVudHMsIG1vbWVudCB9IGZyb20gJy4uL2luZGV4JztcbmltcG9ydCB7IHJldHJ5UmVxdWVzdCB9IGZyb20gJy4uLy4uL2ZldGNoJztcbmltcG9ydCB7IGRvdFNldFZhbHVlLCBkb3RHZXRWYWx1ZSB9IGZyb20gJy4uLy4uL3V0aWwvdmFsdWUnO1xuaW1wb3J0IHsgemhSZWdFeHAgfSBmcm9tICcuLi8uLi91dGlsL3JlZ2V4JztcbmltcG9ydCB7IF9rZWVwSW1hZ2VJbkNvbnRleHQgfSBmcm9tICcuLi8uLi91dGlsL2h0bWwnO1xuaW1wb3J0IHsgcGFyc2VVcmwsIG1ha2VVcmwsIGNoZWNrLCBfcF8yX2JyIH0gZnJvbSAnLi91dGlsJztcblxuLy9pbXBvcnQgeyBVUkwgfSBmcm9tICdqc2RvbS11cmwnO1xuXG5Ac3RhdGljSW1wbGVtZW50czxOb3ZlbFNpdGUuSU5vdmVsU2l0ZVN0YXRpYzxOb3ZlbFNpdGVFU0pab25lPj4oKVxuZXhwb3J0IGNsYXNzIE5vdmVsU2l0ZUVTSlpvbmUgZXh0ZW5kcyBOb3ZlbFNpdGVEZW1vXG57XG5cdHB1YmxpYyBzdGF0aWMgcmVhZG9ubHkgSURLRVkgPSAnZXNqem9uZSc7XG5cblx0Lypcblx0cHJvdGVjdGVkIF9maXhPcHRpb25zUnVudGltZShvcHRpb25zUnVudGltZSlcblx0e1xuXHRcdG9wdGlvbnNSdW50aW1lLm9wdGlvbnNKU0RPTSA9IG9wdGlvbnNSdW50aW1lLm9wdGlvbnNKU0RPTSB8fCB7fTtcblxuXHRcdC8vb3B0aW9uc1J1bnRpbWUub3B0aW9uc0pTRE9NLnJ1blNjcmlwdHMgPSAnZGFuZ2Vyb3VzbHknO1xuXG5cdFx0cmV0dXJuIHN1cGVyLl9maXhPcHRpb25zUnVudGltZShvcHRpb25zUnVudGltZSlcblx0fVxuXHQgKi9cblxuXHRwcm90ZWN0ZWQgX3JlQ29udGV4dDogUmVnRXhwO1xuXG5cdF9jb25zdHJ1Y3RvciguLi5hcmd2KVxuXHR7XG5cdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdHN1cGVyLl9jb25zdHJ1Y3RvciguLi5hcmd2KTtcblxuXHRcdHRoaXMuX3JlQ29udGV4dCA9IG5ldyB6aFJlZ0V4cCgvXig/OueUseaWvOeZvuW6plxccypcXGQrXFxzKuW5tOS7peWJjeeahOiyvOaWh+mDveWIquS6hnzmiYDku6XkuI3muIXmpZrmmK/nlLHlk6rkvY3lpKfkvaznv7vora986Iul6L2J6LyJ55qE5YuV5L2c5YaS54qv5LqG5oKo77yM5YWI6Lef5oKo6Kqq6IGy5oqx5q2J77yBfOS5n+m6u+eFqeeVmeiogOWRiuefpe+8jOaIkeWAkeacg+Wwh+atpOaWh+S4i+aetnzlt7I/55SxP+itr+iAheaOiOasiui9iei8ie+8gT985Y6f5paH57ay5Z2A77yaW15cXG5dK3zovYnovInoh6rosrzlkKd8RVNK6LyV5bCP6KqqKFxccyooPzpodHRwczpcXC9cXC8pP3d3d1xcLmVzanpvbmVcXC5jY1xcLz8pP3zlg4XkvpvlgIvkurrlrbjnv5LkuqTmtYHkvb/nlKjvvIznpoHkvZzllYbmpa3nlKjpgJR85LiL6LyJ5ZCO6KuL5ZyoMjTlsI/mmYLlhafliKrpmaTvvIxbXlxcbl0q5LiN6LKg5pOU5Lu75L2V6LKs5Lu7fOiri+WwiumHjee/u+itr+OAgeaOg+WcluOAgemMhOWFpeOAgeagoeWwjeeahOi+m+WLpOWLnuWLle+8jOi9iei8ieiri+S/neeVmeS/oeaBr3zovYnovInoh6rnnJ/nmb0pJC91aWdtKTtcblxuXHR9XG5cblx0c3RhdGljIGNoZWNrKHVybDogc3RyaW5nIHwgVVJMIHwgTm92ZWxTaXRlLklQYXJzZVVybCwgLi4uYXJndik6IGJvb2xlYW5cblx0e1xuXHRcdHJldHVybiBjaGVjayh1cmwsIC4uLmFyZ3YpO1xuXHR9XG5cblx0c3RhdGljIG1ha2VVcmwodXJsb2JqOiBOb3ZlbFNpdGUuSVBhcnNlVXJsLCBib29sPzogYm9vbGVhbiB8IG51bWJlciwgLi4uYXJndilcblx0e1xuXHRcdHJldHVybiBtYWtlVXJsKHVybG9iaiwgYm9vbCwgLi4uYXJndilcblx0fVxuXG5cdHN0YXRpYyBwYXJzZVVybCh1cmw6IHN0cmluZyB8IFVSTCB8IG51bWJlciwgLi4uYXJndilcblx0e1xuXHRcdHJldHVybiBwYXJzZVVybCh1cmwsIC4uLmFyZ3YpO1xuXHR9XG5cblx0bWFrZVVybCh1cmxvYmo6IE5vdmVsU2l0ZS5JUGFyc2VVcmwsIGJvb2w/OiBib29sZWFuIHwgbnVtYmVyLCAuLi5hcmd2KVxuXHR7XG5cdFx0cmV0dXJuIG1ha2VVcmwodXJsb2JqLCBib29sLCAuLi5hcmd2KVxuXHR9XG5cblx0cGFyc2VVcmwodXJsOiBzdHJpbmcgfCBVUkwgfCBudW1iZXIsIC4uLmFyZ3YpXG5cdHtcblx0XHRyZXR1cm4gcGFyc2VVcmwodXJsLCAuLi5hcmd2KTtcblx0fVxuXG5cdHByb3RlY3RlZCBhc3luYyBfZGVjb2RlQ2hhcHRlcjxUPihyZXQ6IElGZXRjaENoYXB0ZXIsIG9wdGlvbnNSdW50aW1lOiBUICYgSU9wdGlvbnNSdW50aW1lLCBjYWNoZSlcblx0e1xuXHRcdGNvbnN0IHsgZG9tIH0gPSByZXQ7XG5cdFx0Y29uc3QgeyAkIH0gPSBkb207XG5cblx0XHRsZXQgaHRtbCA9IGRvbS5zZXJpYWxpemUoKTtcblxuXHRcdGxldCBtID0gaHRtbFxuXHRcdFx0Lm1hdGNoKC9nZXRUcmFuc2xhdGlvblxcKFsnXCJdKFteXFwnXCJdKylbJ1wiXS9pKVxuXHRcdDtcblxuXHRcdGlmIChtKVxuXHRcdHtcblx0XHRcdGxldCBjb2RlID0gbVsxXTtcblxuXHRcdFx0YXdhaXQgcmV0cnlSZXF1ZXN0KHJldC51cmwsIHtcblx0XHRcdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdFx0XHQuLi5vcHRpb25zUnVudGltZS5yZXF1ZXN0T3B0aW9ucyxcblx0XHRcdFx0bWV0aG9kOiAnUE9TVCcsXG5cdFx0XHRcdGZvcm06IHtcblx0XHRcdFx0XHRwbHhmOiAnZ2V0VHJhbnNsYXRpb24nLFxuXHRcdFx0XHRcdHBseGE6IFtjb2RlXSxcblx0XHRcdFx0fSxcblx0XHRcdH0pXG5cdFx0XHRcdC50aGVuKCh2OiBzdHJpbmcpID0+IHtcblx0XHRcdFx0XHR2ID0gdlxuXHRcdFx0XHRcdFx0LnJlcGxhY2UoL1xcPEppbkppbmdcXD4vLCAnJylcblx0XHRcdFx0XHRcdC5yZXBsYWNlKC9cXDxcXC9KaW5KaW5nXFw+LywgJycpXG5cdFx0XHRcdFx0O1xuXG5cdFx0XHRcdFx0cmV0dXJuIEpTT04ucGFyc2Uodilcblx0XHRcdFx0fSlcblx0XHRcdFx0Lypcblx0XHRcdFx0LnRhcCh2ID0+IHtcblx0XHRcdFx0XHRjb25zb2xlLmRpcignLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0nKVxuXHRcdFx0XHRcdGNvbnNvbGUuZGlyKHYpXG5cdFx0XHRcdFx0Y29uc29sZS5kaXIoJy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tJylcblx0XHRcdFx0fSlcblx0XHRcdFx0ICovXG5cdFx0XHRcdC50YXAoKGE6IHN0cmluZ1tdKSA9PiB7XG5cblx0XHRcdFx0XHRsZXQgZWxlbXMgPSAkKCcudHJhbnMsIC50Jyk7XG5cblx0XHRcdFx0XHRhLmZvckVhY2goKHYsIGkpID0+IHtcblx0XHRcdFx0XHRcdGVsZW1zLmVxKGkpLmh0bWwodik7XG5cdFx0XHRcdFx0fSlcblxuXHRcdFx0XHR9KVxuXHRcdFx0O1xuXG5cdFx0fVxuXG5cdFx0Ly9jb25zb2xlLmRpcihtKTtcblx0XHQvL3Byb2Nlc3MuZXhpdCgpO1xuXHR9XG5cblx0cHJvdGVjdGVkIGFzeW5jIF9wYXJzZUNoYXB0ZXI8VD4ocmV0LCBvcHRpb25zUnVudGltZSwgY2FjaGUpXG5cdHtcblx0XHRpZiAoIXJldClcblx0XHR7XG5cdFx0XHRyZXR1cm4gJyc7XG5cdFx0fVxuXG5cdFx0Y29uc3QgJCA9IHJldC5kb20uJDtcblxuXHRcdHRyeVxuXHRcdHtcblx0XHRcdGxldCBodG1sID0gbWluaWZ5SFRNTChyZXQuZG9tLiQoJy5jb250YWluZXIgLnJvdzpoYXMoLmZvcnVtLWNvbnRlbnQpJykuaHRtbCgpKTtcblxuXHRcdFx0cmV0LmRvbS4kKCcuY29udGFpbmVyIC5yb3c6aGFzKC5mb3J1bS1jb250ZW50KScpLmh0bWwoaHRtbCk7XG5cdFx0fVxuXHRcdGNhdGNoIChlKVxuXHRcdHtcblxuXHRcdH1cblxuXHRcdGlmICghcmV0LmRvbS4kKCcuY29udGFpbmVyIC5yb3c6aGFzKC5mb3J1bS1jb250ZW50KScpLmh0bWwoKSlcblx0XHR7XG5cdFx0XHR0aHJvdyB0aGlzLl9mZXRjaENoYXB0ZXJSZXRyeUVycm9yKGDnmbznj77pmLLniKzon7LmqZ/liLbvvIzlsIfnqI3lvozlho3oqablnJbkuIvovIlgLCByZXQsIG9wdGlvbnNSdW50aW1lLCBjYWNoZSk7XG5cdFx0fVxuXG5cdFx0cmV0LmRvbS4kKCdwW2NsYXNzXTpoYXMoPiBzY3JpcHQpLCAuYWRzYnlnb29nbGUnKS5yZW1vdmUoKTtcblxuXHRcdGF3YWl0IHRoaXMuX2RlY29kZUNoYXB0ZXIocmV0LCBvcHRpb25zUnVudGltZSwgY2FjaGUpO1xuXG5cdFx0X3BfMl9icignLmZvcnVtLWNvbnRlbnQgPiBwJywgcmV0LmRvbS4kKTtcblxuXHRcdGxldCBlbGVtID0gcmV0LmRvbS4kKCcuY29udGFpbmVyIC5mb3J1bS1jb250ZW50Jyk7XG5cblx0XHRlbGVtLmh0bWwoZnVuY3Rpb24gKGksIG9sZDogc3RyaW5nKVxuXHRcdHtcblx0XHRcdHJldHVybiBvbGRcblx0XHRcdFx0LnJlcGxhY2UoLyhcXDxiclxcPil7Myw0fS9nLCAnJDEnKVxuXHRcdFx0XHQucmVwbGFjZSgvKD88PVxcPGJyXFw+KSg/PVteXFxuXSkvZywgJ1xcbicpXG5cdFx0fSk7XG5cblx0XHRsZXQgdGl0bGUgPSB0cmltKHJldC5kb20uJCgnLmNvbnRhaW5lciAucm93ID4gZGl2ID4gaDMnKS50ZXh0KCkpO1xuXG5cdFx0aWYgKG9wdGlvbnNSdW50aW1lLmtlZXBJbWFnZSlcblx0XHR7XG5cdFx0XHRhd2FpdCBfa2VlcEltYWdlSW5Db250ZXh0KGVsZW0uZmluZCgnaW1nW3NyY10nKSwgJCk7XG5cdFx0fVxuXG5cdFx0bGV0IHR4dDogc3RyaW5nID0gZWxlbVxuXHRcdFx0LnRleHQoKVxuXHRcdFx0LnJlcGxhY2UodGhpcy5fcmVDb250ZXh0LCAnJylcblx0XHRcdC5yZXBsYWNlKC9eXFxzK3xcXHMrJC9nLCAnJylcblx0XHQ7XG5cblx0XHRpZiAodHh0LmluZGV4T2YodGl0bGUgKyAnXFxuJykgPT09IDApXG5cdFx0e1xuXHRcdFx0dHh0ID0gdHh0LnNsaWNlKHRpdGxlLmxlbmd0aCArIDEpXG5cdFx0XHRcdC5yZXBsYWNlKC9eXFxuKy9nLCAnJylcblx0XHRcdDtcblx0XHR9XG5cblx0XHRsZXQgY29udHJpYnV0ZTogc3RyaW5nW10gPSBkb3RHZXRWYWx1ZShjYWNoZSwgJ25vdmVsLmNvbnRyaWJ1dGUnLCB7IGRlZmF1bHQ6IFtdIH0pO1xuXG5cdFx0dHh0ID0gdHh0LnJlcGxhY2UoL17nv7vora/vvJooW15cXG5dKylcXG4vLCAocywgdikgPT4ge1xuXG5cdFx0XHR2ID0gdi5yZXBsYWNlKC9eW1xcc+OAgFxceEEwXSt8W1xcc+OAgFxceEEwXSskL2csICcnKTtcblxuXHRcdFx0aWYgKHYgJiYgIWNvbnRyaWJ1dGUuaW5jbHVkZXModikpXG5cdFx0XHR7XG5cdFx0XHRcdGNvbnRyaWJ1dGUucHVzaCh2KTtcblx0XHRcdH1cblxuXHRcdFx0cmV0dXJuICcnXG5cdFx0fSk7XG5cblx0XHRpZiAoY29udHJpYnV0ZS5sZW5ndGgpXG5cdFx0e1xuXHRcdFx0ZG90U2V0VmFsdWUoY2FjaGUsICdub3ZlbC5jb250cmlidXRlJywgY29udHJpYnV0ZSk7XG5cdFx0fVxuXG5cdFx0Lypcblx0XHRsZXQgaHRtbCA9IGVsZW0uaHRtbCgpO1xuXG5cdFx0dGhyb3cgY29uc29sZS5kaXIoe1xuXHRcdFx0aHRtbCxcblx0XHRcdHR4dCxcblx0XHR9KTtcblx0XHQgKi9cblxuLy9cdFx0Y29uc29sZS5kaXIodHh0KTtcblxuLy9cdFx0cHJvY2Vzcy5leGl0KCk7XG5cblx0XHRyZXR1cm4gdHh0IGFzIHN0cmluZ1xuXHR9XG5cblx0YXN5bmMgZ2V0X3ZvbHVtZV9saXN0PFQgZXh0ZW5kcyBJT3B0aW9uc1J1bnRpbWU+KHVybDogc3RyaW5nIHwgVVJMLFxuXHRcdG9wdGlvbnNSdW50aW1lOiBQYXJ0aWFsPFQgJiBJRG93bmxvYWRPcHRpb25zPiA9IHt9LFxuXHQpOiBQcm9taXNlPElOb3ZlbD5cblx0e1xuXHRcdGNvbnN0IHNlbGYgPSB0aGlzO1xuXG5cdFx0dXJsID0gYXdhaXQgdGhpcy5jcmVhdGVNYWluVXJsKHVybCBhcyBhbnksIG9wdGlvbnNSdW50aW1lKTtcblxuXHRcdHJldHVybiBmcm9tVVJMKHVybCwgb3B0aW9uc1J1bnRpbWUub3B0aW9uc0pTRE9NKVxuXHRcdFx0LnRoZW4oYXN5bmMgZnVuY3Rpb24gKGRvbTogSUpTRE9NKVxuXHRcdFx0e1xuXHRcdFx0XHRjb25zdCAkID0gZG9tLiQ7XG5cblx0XHRcdFx0dHJ5XG5cdFx0XHRcdHtcblx0XHRcdFx0XHRsZXQgaHRtbCA9IG1pbmlmeUhUTUwoZG9tLiQoJy5wcm9kdWN0LWRldGFpbCcpLmh0bWwoKSk7XG5cblx0XHRcdFx0XHRkb20uJCgnLnByb2R1Y3QtZGV0YWlsJykuaHRtbChodG1sKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRjYXRjaCAoZSlcblx0XHRcdFx0e1xuXG5cdFx0XHRcdH1cblxuXHRcdFx0XHRsZXQgbm92ZWxfdGl0bGUgPSBkb20uJCgnLmNvbnRhaW5lciAucm93ID4gZGl2ID4gaDMnKS50ZXh0KCk7XG5cblx0XHRcdFx0bGV0IG5vdmVsX3B1Ymxpc2hlciA9IHNlbGYuSURLRVk7XG5cblx0XHRcdFx0bGV0IHVybF9kYXRhID0gc2VsZi5wYXJzZVVybChkb20udXJsLmhyZWYpO1xuXG5cdFx0XHRcdGxldCBub3ZlbF9hdXRob3I6IHN0cmluZztcblx0XHRcdFx0bGV0IG5vdmVsX2RhdGU7XG5cblx0XHRcdFx0JCgnLnByb2R1Y3QtZGV0YWlsIC53ZWxsIC5uYXYtbGlzdCA+IGxpJylcblx0XHRcdFx0XHQuZWFjaChmdW5jdGlvbiAoaSwgZWxlbSlcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRsZXQgX3RoaXMgPSAkKHRoaXMpO1xuXG5cdFx0XHRcdFx0XHRsZXQgX3RleHQgPSB0cmltKF90aGlzLnRleHQoKSk7XG5cblx0XHRcdFx0XHRcdGxldCBfbTogUmVnRXhwTWF0Y2hBcnJheTtcblxuXHRcdFx0XHRcdFx0aWYgKF9tID0gX3RleHQubWF0Y2goL+S9nOiAhVxccypb77yaOl1cXHMqKFteXFxuXSspLykpXG5cdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdG5vdmVsX2F1dGhvciA9IHRyaW0oX21bMV0pXG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRlbHNlIGlmIChfbSA9IF90ZXh0Lm1hdGNoKC9cXGIoXFxkezR9XFwtXFxkezEsMn1cXC1cXGR7MSwyfSlcXGIvKSlcblx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0dHJ5XG5cdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHRsZXQgbGFzdF91cGRhdGVfdGltZSA9IG1vbWVudChfbVsxXSk7XG5cdFx0XHRcdFx0XHRcdFx0bm92ZWxfZGF0ZSA9IGxhc3RfdXBkYXRlX3RpbWU7XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0Y2F0Y2ggKGUpXG5cdFx0XHRcdFx0XHRcdHtcblxuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHR9KVxuXHRcdFx0XHQ7XG5cblx0XHRcdFx0bGV0IHZvbHVtZV9saXN0ID0gW10gYXMgTm92ZWxTaXRlLklWb2x1bWVbXTtcblxuXHRcdFx0XHRjb25zdCBub3ZlbFRyZWUgPSBvcHRpb25zUnVudGltZS5ub3ZlbFRyZWU7XG5cdFx0XHRcdGxldCBjdXJyZW50Vm9sdW1lOiBUcmVlTm9kZTxJUm93Vm9sdW1lPjtcblxuXHRcdFx0XHRsZXQgX2NvbnRlbnQgPSAkKCcucHJvZHVjdC1kZXRhaWw6ZXEoMCknKTtcblx0XHRcdFx0bGV0IHRhYmxlID0gX2NvbnRlbnQuZmluZCgnI3RhYjEgYVtocmVmXSwgI3RhYjEgIC5ub24nKTtcblxuXHRcdFx0XHRsZXQgX2NhY2hlX2RhdGVzID0gW107XG5cblx0XHRcdFx0bGV0IHRvdGFsX2lkeCA9IDA7XG5cblx0XHRcdFx0e1xuXHRcdFx0XHRcdGxldCB2b2x1bWVfdGl0bGUgPSAnbnVsbCc7XG5cdFx0XHRcdFx0bGV0IHZvbHVtZV9sZXZlbCA9IG51bGw7XG5cblx0XHRcdFx0XHRjdXJyZW50Vm9sdW1lID0gbm92ZWxUcmVlLmFkZFZvbHVtZSh7XG5cdFx0XHRcdFx0XHR2b2x1bWVfdGl0bGUsXG5cdFx0XHRcdFx0XHR2b2x1bWVfbGV2ZWwsXG5cdFx0XHRcdFx0XHR2b2x1bWVfaW5kZXg6IG5vdmVsVHJlZS5yb290KCkuc2l6ZSgpLFxuXHRcdFx0XHRcdFx0dG90YWxfaWR4OiB0b3RhbF9pZHgrKyxcblx0XHRcdFx0XHR9KTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdC8vY29uc29sZS5kaXIodGFibGUubGVuZ3RoKVxuXG5cdFx0XHRcdHRhYmxlXG5cdFx0XHRcdFx0LmVhY2goZnVuY3Rpb24gKGluZGV4LCBlbGVtKVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdGxldCB0ciA9ICQoZWxlbSk7XG5cdFx0XHRcdFx0XHRsZXQgX3RoaXMgPSB0cjtcblxuXHRcdFx0XHRcdFx0aWYgKF90aGlzLmlzKCcubm9uJykpXG5cdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdGxldCB2b2x1bWVfdGl0bGUgPSB0cmltKF90aGlzLnRleHQoKSk7XG5cblx0XHRcdFx0XHRcdFx0aWYgKHZvbHVtZV90aXRsZSlcblx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdGN1cnJlbnRWb2x1bWUgPSBub3ZlbFRyZWUuYWRkVm9sdW1lKHtcblx0XHRcdFx0XHRcdFx0XHRcdHZvbHVtZV90aXRsZSxcblx0XHRcdFx0XHRcdFx0XHRcdHZvbHVtZV9pbmRleDogbm92ZWxUcmVlLnJvb3QoKS5zaXplKCksXG5cdFx0XHRcdFx0XHRcdFx0XHR0b3RhbF9pZHg6IHRvdGFsX2lkeCsrLFxuXHRcdFx0XHRcdFx0XHRcdH0pO1xuXG5cdFx0XHRcdFx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdGlmICh0ci5pcygnYScpKVxuXHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRsZXQgYSA9IHRyO1xuXHRcdFx0XHRcdFx0XHRsZXQgY2hhcHRlcl90aXRsZSA9IHRyaW0oYS50ZXh0KCksIHRydWUpO1xuXG5cdFx0XHRcdFx0XHRcdC8vY29uc29sZS5sb2coY2hhcHRlcl90aXRsZSlcblxuXHRcdFx0XHRcdFx0XHRsZXQgaHJlZiA9IGEucHJvcCgnaHJlZicpO1xuXG5cdFx0XHRcdFx0XHRcdGxldCBkYXRhID0gc2VsZi5wYXJzZVVybChocmVmKTtcblxuXHRcdFx0XHRcdFx0XHRpZiAoIWRhdGEuY2hhcHRlcl9pZClcblx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdHJldHVybjtcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRlbHNlXG5cdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHRocmVmID0gc2VsZi5tYWtlVXJsKGRhdGEpO1xuXG5cdFx0XHRcdFx0XHRcdFx0ZGF0YS51cmwgPSBocmVmO1xuXHRcdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdFx0bGV0IGNoYXB0ZXI6IElSb3dDaGFwdGVyID0ge1xuXHRcdFx0XHRcdFx0XHRcdGNoYXB0ZXJfdGl0bGUsXG5cdFx0XHRcdFx0XHRcdFx0Y2hhcHRlcl9pZDogZGF0YS5jaGFwdGVyX2lkLFxuXHRcdFx0XHRcdFx0XHRcdGNoYXB0ZXJfdXJsOiBocmVmLFxuXHRcdFx0XHRcdFx0XHRcdGNoYXB0ZXJfdXJsX2RhdGE6IGRhdGEsXG5cdFx0XHRcdFx0XHRcdFx0Y2hhcHRlcl9pbmRleDogY3VycmVudFZvbHVtZS5zaXplKCksXG5cdFx0XHRcdFx0XHRcdFx0dG90YWxfaWR4OiB0b3RhbF9pZHgrKyxcblx0XHRcdFx0XHRcdFx0fTtcblxuXHRcdFx0XHRcdFx0XHRub3ZlbFRyZWUuYWRkQ2hhcHRlcihjaGFwdGVyLCBjdXJyZW50Vm9sdW1lKVxuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH0pXG5cdFx0XHRcdDtcblxuXHRcdFx0XHRkb20uJCgncFtjbGFzc106aGFzKD4gc2NyaXB0W3NyYyo9Z29vZ2xlXSksIGRpdltjbGFzc106aGFzKD4gc2NyaXB0W3NyYyo9Z29vZ2xlXSksIC5hZHNieWdvb2dsZScpLnJlbW92ZSgpO1xuXG5cdFx0XHRcdGxldCBkYXRhX21ldGE6IElNZGNvbmZNZXRhID0ge1xuXHRcdFx0XHRcdG5vdmVsOiB7XG5cblx0XHRcdFx0XHR9LFxuXHRcdFx0XHR9O1xuXG5cdFx0XHRcdCQoJy5wcm9kdWN0LWRldGFpbCAud2VsbCAnKVxuXHRcdFx0XHRcdC5maW5kKCcucm93IGFbaHJlZl0nKVxuXHRcdFx0XHRcdC5ub3QoJy5idG4sIC5mb3JtLWdyb3VwIConKVxuXHRcdFx0XHRcdC5lYWNoKChpLCBlbGVtKSA9PlxuXHRcdFx0XHRcdHtcblxuXHRcdFx0XHRcdFx0bGV0IF90aGlzID0gJChlbGVtKTtcblxuXHRcdFx0XHRcdFx0bGV0IG5hbWUgPSB0cmltKF90aGlzLnRleHQoKSk7XG5cdFx0XHRcdFx0XHRsZXQgaHJlZiA9IF90aGlzLnByb3AoJ2hyZWYnKSBhcyBzdHJpbmc7XG5cblx0XHRcdFx0XHRcdGlmIChuYW1lID09PSBocmVmKVxuXHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRuYW1lID0gdW5kZWZpbmVkO1xuXHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHRkYXRhX21ldGEubGluayA9IGRhdGFfbWV0YS5saW5rIHx8IFtdO1xuXHRcdFx0XHRcdFx0ZGF0YV9tZXRhLmxpbmsucHVzaChocmVmKTtcblxuXHRcdFx0XHRcdH0pXG5cdFx0XHRcdDtcblxuXHRcdFx0XHQkKCcuc2hvdy10YWcgYVtocmVmKj1cInRhZ1wiXScpXG5cdFx0XHRcdFx0LmVhY2goKGksIGVsZW0pID0+XG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0bGV0IF90aGlzID0gJChlbGVtKTtcblx0XHRcdFx0XHRcdGxldCBuYW1lID0gdHJpbShfdGhpcy50ZXh0KCkpO1xuXG5cdFx0XHRcdFx0XHRpZiAobmFtZSlcblx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0ZGF0YV9tZXRhLm5vdmVsLnRhZ3MgPSBkYXRhX21ldGEubm92ZWwudGFncyB8fCBbXTtcblx0XHRcdFx0XHRcdFx0ZGF0YV9tZXRhLm5vdmVsLnRhZ3MucHVzaChuYW1lKTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9KVxuXHRcdFx0XHQ7XG5cblx0XHRcdFx0ZGF0YV9tZXRhLm5vdmVsLmNvdmVyID0gJCgnLnByb2R1Y3QtZGV0YWlsOmVxKDApJykuZmluZCgnaW1nLnByb2R1Y3QtaW1hZ2U6bm90KFtzcmMqPVwiZW1wdHkuanBnXCJdKScpLnByb3AoJ3NyYycpO1xuXG5cdFx0XHRcdGxldCBub3ZlbF9kZXNjID0gdHJpbSgkKCcucHJvZHVjdC1kZXRhaWw6ZXEoMCknKS5maW5kKCcuYm9va19kZXNjcmlwdGlvbicpLnRleHQoKSB8fCAnJyk7XG5cblx0XHRcdFx0cmV0dXJuIHtcblxuXHRcdFx0XHRcdC4uLmRhdGFfbWV0YSxcblxuXHRcdFx0XHRcdHVybDogZG9tLnVybCxcblx0XHRcdFx0XHR1cmxfZGF0YSxcblxuXHRcdFx0XHRcdG5vdmVsX2F1dGhvcixcblx0XHRcdFx0XHRub3ZlbF9kYXRlLFxuXG5cdFx0XHRcdFx0bm92ZWxfZGVzYyxcblxuXHRcdFx0XHRcdG5vdmVsX3RpdGxlLFxuXHRcdFx0XHRcdG5vdmVsX3B1Ymxpc2hlcixcblxuXHRcdFx0XHRcdC8vdm9sdW1lX2xpc3QsXG5cdFx0XHRcdFx0bm92ZWxUcmVlLFxuXG5cdFx0XHRcdFx0Y2hlY2tkYXRlOiBtb21lbnQoKS5sb2NhbCgpLFxuXG5cdFx0XHRcdFx0aW1nczogW10gYXMgc3RyaW5nW10sXG5cdFx0XHRcdH0gYXMgSU5vdmVsO1xuXHRcdFx0fSlcblx0XHRcdDtcblx0fVxuXG59XG5cbmV4cG9ydCBkZWZhdWx0IE5vdmVsU2l0ZUVTSlpvbmU7XG5cbiJdfQ==