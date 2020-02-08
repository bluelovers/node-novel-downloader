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
//import { URL } from 'jsdom-url';
const index_1 = require("../index");
const index_2 = require("../index");
const fetch_1 = require("../../fetch");
const value_1 = require("../../util/value");
const regex_1 = require("../../util/regex");
const html_1 = require("../../util/html");
const util_2 = require("./util");
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
        _p_2_br('.forum-content > p', ret.dom.$);
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
                        let last_update_time = index_2.moment(_m[1]);
                        novel_date = last_update_time;
                    }
                    catch (e) {
                    }
                }
            });
            let volume_list = [];
            const novelTree = optionsRuntime.novelTree;
            let currentVolume;
            let table = dom.$('.product-detail .tabbable .tab-content.show-desc').find('a');
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
            dom.$('p[class]:has(> script[src*=google]), div[class]:has(> script[src*=google]), .adsbygoogle').remove();
            table
                .each(function (index, elem) {
                let tr = dom.$(elem);
                if (1) {
                    let a = tr;
                    let chapter_title = util_1.trim(a.text(), true);
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
            let data_meta = {
                novel: {},
            };
            data_meta.novel.cover = $('.product-detail:eq(0)').find('img.product-image').prop('src');
            let novel_desc = util_1.trim($('.product-detail:eq(0)').find('.book_description').text() || '');
            return Object.assign(Object.assign({}, data_meta), { url: dom.url, url_data,
                novel_author,
                novel_date,
                novel_desc,
                novel_title,
                novel_publisher,
                //volume_list,
                novelTree, checkdate: index_2.moment().local(), imgs: [] });
        });
    }
};
NovelSiteESJZone.IDKEY = 'esjzone';
NovelSiteESJZone = __decorate([
    index_1.staticImplements()
], NovelSiteESJZone);
exports.NovelSiteESJZone = NovelSiteESJZone;
exports.default = NovelSiteESJZone;
function _p_2_br(target, $) {
    return $(target)
        .each(function (i, elem) {
        let _this = $(elem);
        let _html = _this
            .html()
            .replace(/(?:&nbsp;?)/g, ' ')
            .replace(/[\xA0\s]+$/g, '');
        if (_html == '<br/>' || _html == '<br>') {
            _html = '';
        }
        _this.after(`${_html}<br/>`);
        _this.remove();
    });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7O0dBRUc7Ozs7Ozs7O0FBRUgscUNBQThDO0FBQzlDLHVDQUF1RztBQU92Ryw2Q0FBK0Q7QUFFL0Qsa0NBQWtDO0FBRWxDLG9DQUEwRjtBQUUxRixvQ0FBa0M7QUFDbEMsdUNBQTJDO0FBQzNDLDRDQUE0RDtBQUM1RCw0Q0FBNEM7QUFDNUMsMENBQXNEO0FBQ3RELGlDQUFrRDtBQUlsRCxJQUFhLGdCQUFnQixHQUE3QixNQUFhLGdCQUFpQixTQUFRLGNBQWE7SUFpQmxELFlBQVksQ0FBQyxHQUFHLElBQUk7UUFFbkIsYUFBYTtRQUNiLEtBQUssQ0FBQyxZQUFZLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQztRQUU1QixJQUFJLENBQUMsVUFBVSxHQUFHLElBQUksZ0JBQVEsQ0FBQyxrUEFBa1AsQ0FBQyxDQUFDO0lBRXBSLENBQUM7SUFFRCxNQUFNLENBQUMsS0FBSyxDQUFDLEdBQXVDLEVBQUUsR0FBRyxJQUFJO1FBRTVELE9BQU8sWUFBSyxDQUFDLEdBQUcsRUFBRSxHQUFHLElBQUksQ0FBQyxDQUFDO0lBQzVCLENBQUM7SUFFRCxNQUFNLENBQUMsT0FBTyxDQUFDLE1BQTJCLEVBQUUsSUFBdUIsRUFBRSxHQUFHLElBQUk7UUFFM0UsT0FBTyxjQUFPLENBQUMsTUFBTSxFQUFFLElBQUksRUFBRSxHQUFHLElBQUksQ0FBQyxDQUFBO0lBQ3RDLENBQUM7SUFFRCxNQUFNLENBQUMsUUFBUSxDQUFDLEdBQTBCLEVBQUUsR0FBRyxJQUFJO1FBRWxELE9BQU8sZUFBUSxDQUFDLEdBQUcsRUFBRSxHQUFHLElBQUksQ0FBQyxDQUFDO0lBQy9CLENBQUM7SUFFRCxPQUFPLENBQUMsTUFBMkIsRUFBRSxJQUF1QixFQUFFLEdBQUcsSUFBSTtRQUVwRSxPQUFPLGNBQU8sQ0FBQyxNQUFNLEVBQUUsSUFBSSxFQUFFLEdBQUcsSUFBSSxDQUFD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QUMsTUFBTSxFQUFFLENBQUM7SUFFekIsT0FBTyxDQUFDLENBQUMsTUFBTSxDQUFDO1NBQ2QsSUFBSSxDQUFDLFVBQVUsQ0FBQyxFQUFFLElBQUk7UUFFdEIsSUFBSSxLQUFLLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBRXBCLElBQUksS0FBSyxHQUFHLEtBQUs7YUFDZixJQUFJLEVBQUU7YUFDTixPQUFPLENBQUMsY0FBYyxFQUFFLEdBQUcsQ0FBQzthQUM1QixPQUFPLENBQUMsYUFBYSxFQUFFLEVBQUUsQ0FBQyxDQUMzQjtRQUVELElBQUksS0FBSyxJQUFJLE9BQU8sSUFBSSxLQUFLLElBQUksTUFBTSxFQUN2QztZQUNDLEtBQUssR0FBRyxFQUFFLENBQUM7U0FDWDtRQUVELEtBQUssQ0FBQyxLQUFLLENBQUMsR0FBRyxLQUFLLE9BQU8sQ0FBQyxDQUFDO1FBQzdCLEtBQUssQ0FBQyxNQUFNLEVBQUUsQ0FBQTtJQUNmLENBQUMsQ0FBQyxDQUNEO0FBQ0gsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ3JlYXRlZCBieSB1c2VyIG9uIDIwMTgvMy8xNy8wMTcuXG4gKi9cblxuaW1wb3J0IHsgbWluaWZ5SFRNTCwgdHJpbSB9IGZyb20gJy4uLy4uL3V0aWwnO1xuaW1wb3J0IE5vdmVsU2l0ZURlbW8sIHsgSURvd25sb2FkT3B0aW9ucywgSU5vdmVsLCBJT3B0aW9uc1J1bnRpbWUsIElGZXRjaENoYXB0ZXIgfSBmcm9tICcuLi9kZW1vL3RyZWUnO1xuaW1wb3J0IHsgSVJvd1ZvbHVtZSwgVHJlZU5vZGUgfSBmcm9tICcuLi8uLi90cmVlL2luZGV4JztcblxuaW1wb3J0IGZzID0gcmVxdWlyZSgnZnMtZXh0cmEnKTtcbmltcG9ydCB7IHRyaW1GaWxlbmFtZSB9IGZyb20gJ2ZzLWljb252L3V0aWwnO1xuaW1wb3J0ICogYXMgcGF0aCBmcm9tICd1cGF0aDInO1xuaW1wb3J0IG5vdmVsSW5mbywgeyBJTWRjb25mTWV0YSB9IGZyb20gJ25vZGUtbm92ZWwtaW5mbyc7XG5pbXBvcnQgeyBmcm9tVVJMLCBJRnJvbVVybE9wdGlvbnMsIElKU0RPTSB9IGZyb20gJ2pzZG9tLWV4dHJhJztcblxuLy9pbXBvcnQgeyBVUkwgfSBmcm9tICdqc2RvbS11cmwnO1xuXG5pbXBvcnQgTm92ZWxTaXRlLCB7IHN0YXRpY0ltcGxlbWVudHMsIGRlZmF1bHRKU0RPTU9wdGlvbnMsIFNZTUJPTF9DQUNIRSB9IGZyb20gJy4uL2luZGV4JztcbmltcG9ydCB7IFByb21pc2VCbHVlYmlyZCwgYmx1ZWJpcmREZWNvcmF0b3IgfSBmcm9tICcuLi9pbmRleCc7XG5pbXBvcnQgeyBtb21lbnQgfSBmcm9tICcuLi9pbmRleCc7XG5pbXBvcnQgeyByZXRyeVJlcXVlc3QgfSBmcm9tICcuLi8uLi9mZXRjaCc7XG5pbXBvcnQgeyBkb3RTZXRWYWx1ZSwgZG90R2V0VmFsdWUgfSBmcm9tICcuLi8uLi91dGlsL3ZhbHVlJztcbmltcG9ydCB7IHpoUmVnRXhwIH0gZnJvbSAnLi4vLi4vdXRpbC9yZWdleCc7XG5pbXBvcnQgeyBfa2VlcEltYWdlSW5Db250ZXh0IH0gZnJvbSAnLi4vLi4vdXRpbC9odG1sJztcbmltcG9ydCB7IHBhcnNlVXJsLCBtYWtlVXJsLCBjaGVjayB9IGZyb20gJy4vdXRpbCc7XG5pbXBvcnQgY3JlYXRlVVJMIGZyb20gJy4uLy4uL3V0aWwvdXJsJztcblxuQHN0YXRpY0ltcGxlbWVudHM8Tm92ZWxTaXRlLklOb3ZlbFNpdGVTdGF0aWM8Tm92ZWxTaXRlRVNKWm9uZT4+KClcbmV4cG9ydCBjbGFzcyBOb3ZlbFNpdGVFU0pab25lIGV4dGVuZHMgTm92ZWxTaXRlRGVtb1xue1xuXHRwdWJsaWMgc3RhdGljIHJlYWRvbmx5IElES0VZID0gJ2VzanpvbmUnO1xuXG5cdC8qXG5cdHByb3RlY3RlZCBfZml4T3B0aW9uc1J1bnRpbWUob3B0aW9uc1J1bnRpbWUpXG5cdHtcblx0XHRvcHRpb25zUnVudGltZS5vcHRpb25zSlNET00gPSBvcHRpb25zUnVudGltZS5vcHRpb25zSlNET00gfHwge307XG5cblx0XHQvL29wdGlvbnNSdW50aW1lLm9wdGlvbnNKU0RPTS5ydW5TY3JpcHRzID0gJ2Rhbmdlcm91c2x5JztcblxuXHRcdHJldHVybiBzdXBlci5fZml4T3B0aW9uc1J1bnRpbWUob3B0aW9uc1J1bnRpbWUpXG5cdH1cblx0ICovXG5cblx0cHJvdGVjdGVkIF9yZUNvbnRleHQ6IFJlZ0V4cDtcblxuXHRfY29uc3RydWN0b3IoLi4uYXJndilcblx0e1xuXHRcdC8vIEB0cy1pZ25vcmVcblx0XHRzdXBlci5fY29uc3RydWN0b3IoLi4uYXJndik7XG5cblx0XHR0aGlzLl9yZUNvbnRleHQgPSBuZXcgemhSZWdFeHAoL14oPzrnlLHmlrznmb7luqZcXHMqXFxkK1xccyrlubTku6XliY3nmoTosrzmlofpg73liKrkuoZ85omA5Lul5LiN5riF5qWa5piv55Sx5ZOq5L2N5aSn5L2s57+76K2vfOiLpei9iei8ieeahOWLleS9nOWGkueKr+S6huaCqO+8jOWFiOi3n+aCqOiqquiBsuaKseatie+8gXzkuZ/purvnhannlZnoqIDlkYrnn6XvvIzmiJHlgJHmnIPlsIfmraTmlofkuIvmnrZ85beyP+eUsT/ora/ogIXmjojmrIrovYnovInvvIE/fOWOn+aWh+e2suWdgO+8mlteXFxuXSt86L2J6LyJ6Ieq6LK85ZCnfEVTSui8leWwj+iqqihcXHMqKD86aHR0cHM6XFwvXFwvKT93d3dcXC5lc2p6b25lXFwuY2NcXC8/KT985YOF5L6b5YCL5Lq65a2457+S5Lqk5rWB5L2/55So77yM56aB5L2c5ZWG5qWt55So6YCUfOS4i+i8ieWQjuiri+WcqDI05bCP5pmC5YWn5Yiq6Zmk77yMW15cXG5dKuS4jeiyoOaTlOS7u+S9leiyrOS7u3zoq4vlsIrph43nv7vora/jgIHmjoPlnJbjgIHpjITlhaXjgIHmoKHlsI3nmoTovpvli6Tli57li5XvvIzovYnovInoq4vkv53nlZnkv6Hmga986L2J6LyJ6Ieq55yf55m9KSQvdWlnbSk7XG5cblx0fVxuXG5cdHN0YXRpYyBjaGVjayh1cmw6IHN0cmluZyB8IFVSTCB8IE5vdmVsU2l0ZS5JUGFyc2VVcmwsIC4uLmFyZ3YpOiBib29sZWFuXG5cdHtcblx0XHRyZXR1cm4gY2hlY2sodXJsLCAuLi5hcmd2KTtcblx0fVxuXG5cdHN0YXRpYyBtYWtlVXJsKHVybG9iajogTm92ZWxTaXRlLklQYXJzZVVybCwgYm9vbD86IGJvb2xlYW4gfCBudW1iZXIsIC4uLmFyZ3YpXG5cdHtcblx0XHRyZXR1cm4gbWFrZVVybCh1cmxvYmosIGJvb2wsIC4uLmFyZ3YpXG5cdH1cblxuXHRzdGF0aWMgcGFyc2VVcmwodXJsOiBzdHJpbmcgfCBVUkwgfCBudW1iZXIsIC4uLmFyZ3YpXG5cdHtcblx0XHRyZXR1cm4gcGFyc2VVcmwodXJsLCAuLi5hcmd2KTtcblx0fVxuXG5cdG1ha2VVcmwodXJsb2JqOiBOb3ZlbFNpdGUuSVBhcnNlVXJsLCBib29sPzogYm9vbGVhbiB8IG51bWJlciwgLi4uYXJndilcblx0e1xuXHRcdHJldHVybiBtYWtlVXJsKHVybG9iaiwgYm9vbCwgLi4uYXJndilcblx0fVxuXG5cdHBhcnNlVXJsKHVybDogc3RyaW5nIHwgVVJMIHwgbnVtYmVyLCAuLi5hcmd2KVxuXHR7XG5cdFx0cmV0dXJuIHBhcnNlVXJsKHVybCwgLi4uYXJndik7XG5cdH1cblxuXHRwcm90ZWN0ZWQgYXN5bmMgX2RlY29kZUNoYXB0ZXI8VD4ocmV0OiBJRmV0Y2hDaGFwdGVyLCBvcHRpb25zUnVudGltZTogVCAmIElPcHRpb25zUnVudGltZSwgY2FjaGUpXG5cdHtcblx0XHRjb25zdCB7IGRvbSB9ID0gcmV0O1xuXHRcdGNvbnN0IHsgJCB9ID0gZG9tO1xuXG5cdFx0bGV0IGh0bWwgPSBkb20uc2VyaWFsaXplKCk7XG5cblx0XHRsZXQgbSA9IGh0bWxcblx0XHRcdC5tYXRjaCgvZ2V0VHJhbnNsYXRpb25cXChbJ1wiXShbXlxcJ1wiXSspWydcIl0vaSlcblx0XHQ7XG5cblx0XHRpZiAobSlcblx0XHR7XG5cdFx0XHRsZXQgY29kZSA9IG1bMV07XG5cblx0XHRcdGF3YWl0IHJldHJ5UmVxdWVzdChyZXQudXJsLCB7XG5cdFx0XHRcdC8vIEB0cy1pZ25vcmVcblx0XHRcdFx0Li4ub3B0aW9uc1J1bnRpbWUucmVxdWVzdE9wdGlvbnMsXG5cdFx0XHRcdG1ldGhvZDogJ1BPU1QnLFxuXHRcdFx0XHRmb3JtOiB7XG5cdFx0XHRcdFx0cGx4ZjogJ2dldFRyYW5zbGF0aW9uJyxcblx0XHRcdFx0XHRwbHhhOiBbY29kZV0sXG5cdFx0XHRcdH0sXG5cdFx0XHR9KVxuXHRcdFx0XHQudGhlbigodjogc3RyaW5nKSA9PiB7XG5cdFx0XHRcdFx0diA9IHZcblx0XHRcdFx0XHRcdC5yZXBsYWNlKC9cXDxKaW5KaW5nXFw+LywgJycpXG5cdFx0XHRcdFx0XHQucmVwbGFjZSgvXFw8XFwvSmluSmluZ1xcPi8sICcnKVxuXHRcdFx0XHRcdDtcblxuXHRcdFx0XHRcdHJldHVybiBKU09OLnBhcnNlKHYpXG5cdFx0XHRcdH0pXG5cdFx0XHRcdC8qXG5cdFx0XHRcdC50YXAodiA9PiB7XG5cdFx0XHRcdFx0Y29uc29sZS5kaXIoJy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tJylcblx0XHRcdFx0XHRjb25zb2xlLmRpcih2KVxuXHRcdFx0XHRcdGNvbnNvbGUuZGlyKCctLS0tLS0tLS0tLS0tLS0tLS0tLS0tLScpXG5cdFx0XHRcdH0pXG5cdFx0XHRcdCAqL1xuXHRcdFx0XHQudGFwKChhOiBzdHJpbmdbXSkgPT4ge1xuXG5cdFx0XHRcdFx0bGV0IGVsZW1zID0gJCgnLnRyYW5zLCAudCcpO1xuXG5cdFx0XHRcdFx0YS5mb3JFYWNoKCh2LCBpKSA9PiB7XG5cdFx0XHRcdFx0XHRlbGVtcy5lcShpKS5odG1sKHYpO1xuXHRcdFx0XHRcdH0pXG5cblx0XHRcdFx0fSlcblx0XHRcdDtcblxuXHRcdH1cblxuXHRcdC8vY29uc29sZS5kaXIobSk7XG5cdFx0Ly9wcm9jZXNzLmV4aXQoKTtcblx0fVxuXG5cdHByb3RlY3RlZCBhc3luYyBfcGFyc2VDaGFwdGVyPFQ+KHJldCwgb3B0aW9uc1J1bnRpbWUsIGNhY2hlKVxuXHR7XG5cdFx0aWYgKCFyZXQpXG5cdFx0e1xuXHRcdFx0cmV0dXJuICcnO1xuXHRcdH1cblxuXHRcdGNvbnN0ICQgPSByZXQuZG9tLiQ7XG5cblx0XHR0cnlcblx0XHR7XG5cdFx0XHRsZXQgaHRtbCA9IG1pbmlmeUhUTUwocmV0LmRvbS4kKCcuY29udGFpbmVyIC5yb3c6aGFzKC5mb3J1bS1jb250ZW50KScpLmh0bWwoKSk7XG5cblx0XHRcdHJldC5kb20uJCgnLmNvbnRhaW5lciAucm93OmhhcyguZm9ydW0tY29udGVudCknKS5odG1sKGh0bWwpO1xuXHRcdH1cblx0XHRjYXRjaCAoZSlcblx0XHR7XG5cblx0XHR9XG5cblx0XHRpZiAoIXJldC5kb20uJCgnLmNvbnRhaW5lciAucm93OmhhcyguZm9ydW0tY29udGVudCknKS5odG1sKCkpXG5cdFx0e1xuXHRcdFx0dGhyb3cgdGhpcy5fZmV0Y2hDaGFwdGVyUmV0cnlFcnJvcihg55m854++6Ziy54is6J+y5qmf5Yi277yM5bCH56iN5b6M5YaN6Kmm5ZyW5LiL6LyJYCwgcmV0LCBvcHRpb25zUnVudGltZSwgY2FjaGUpO1xuXHRcdH1cblxuXHRcdHJldC5kb20uJCgncFtjbGFzc106aGFzKD4gc2NyaXB0KSwgLmFkc2J5Z29vZ2xlJykucmVtb3ZlKCk7XG5cblx0XHRhd2FpdCB0aGlzLl9kZWNvZGVDaGFwdGVyKHJldCwgb3B0aW9uc1J1bnRpbWUsIGNhY2hlKTtcblxuXHRcdF9wXzJfYnIoJy5mb3J1bS1jb250ZW50ID4gcCcsIHJldC5kb20uJCk7XG5cblx0XHRsZXQgZWxlbSA9IHJldC5kb20uJCgnLmNvbnRhaW5lciAuZm9ydW0tY29udGVudCcpO1xuXG5cdFx0ZWxlbS5odG1sKGZ1bmN0aW9uIChpLCBvbGQ6IHN0cmluZylcblx0XHR7XG5cdFx0XHRyZXR1cm4gb2xkXG5cdFx0XHRcdC5yZXBsYWNlKC8oXFw8YnJcXD4pezMsNH0vZywgJyQxJylcblx0XHRcdFx0LnJlcGxhY2UoLyg/PD1cXDxiclxcPikoPz1bXlxcbl0pL2csICdcXG4nKVxuXHRcdH0pO1xuXG5cdFx0bGV0IHRpdGxlID0gdHJpbShyZXQuZG9tLiQoJy5jb250YWluZXIgLnJvdyA+IGRpdiA+IGgzJykudGV4dCgpKTtcblxuXHRcdGlmIChvcHRpb25zUnVudGltZS5rZWVwSW1hZ2UpXG5cdFx0e1xuXHRcdFx0YXdhaXQgX2tlZXBJbWFnZUluQ29udGV4dChlbGVtLmZpbmQoJ2ltZ1tzcmNdJyksICQpO1xuXHRcdH1cblxuXHRcdGxldCB0eHQ6IHN0cmluZyA9IGVsZW1cblx0XHRcdC50ZXh0KClcblx0XHRcdC5yZXBsYWNlKHRoaXMuX3JlQ29udGV4dCwgJycpXG5cdFx0XHQucmVwbGFjZSgvXlxccyt8XFxzKyQvZywgJycpXG5cdFx0O1xuXG5cdFx0aWYgKHR4dC5pbmRleE9mKHRpdGxlICsgJ1xcbicpID09PSAwKVxuXHRcdHtcblx0XHRcdHR4dCA9IHR4dC5zbGljZSh0aXRsZS5sZW5ndGggKyAxKVxuXHRcdFx0XHQucmVwbGFjZSgvXlxcbisvZywgJycpXG5cdFx0XHQ7XG5cdFx0fVxuXG5cdFx0bGV0IGNvbnRyaWJ1dGU6IHN0cmluZ1tdID0gZG90R2V0VmFsdWUoY2FjaGUsICdub3ZlbC5jb250cmlidXRlJywgeyBkZWZhdWx0OiBbXSB9KTtcblxuXHRcdHR4dCA9IHR4dC5yZXBsYWNlKC9e57+76K2v77yaKFteXFxuXSspXFxuLywgKHMsIHYpID0+IHtcblxuXHRcdFx0diA9IHYucmVwbGFjZSgvXltcXHPjgIBcXHhBMF0rfFtcXHPjgIBcXHhBMF0rJC9nLCAnJyk7XG5cblx0XHRcdGlmICh2ICYmICFjb250cmlidXRlLmluY2x1ZGVzKHYpKVxuXHRcdFx0e1xuXHRcdFx0XHRjb250cmlidXRlLnB1c2godik7XG5cdFx0XHR9XG5cblx0XHRcdHJldHVybiAnJ1xuXHRcdH0pO1xuXG5cdFx0aWYgKGNvbnRyaWJ1dGUubGVuZ3RoKVxuXHRcdHtcblx0XHRcdGRvdFNldFZhbHVlKGNhY2hlLCAnbm92ZWwuY29udHJpYnV0ZScsIGNvbnRyaWJ1dGUpO1xuXHRcdH1cblxuXHRcdC8qXG5cdFx0bGV0IGh0bWwgPSBlbGVtLmh0bWwoKTtcblxuXHRcdHRocm93IGNvbnNvbGUuZGlyKHtcblx0XHRcdGh0bWwsXG5cdFx0XHR0eHQsXG5cdFx0fSk7XG5cdFx0ICovXG5cbi8vXHRcdGNvbnNvbGUuZGlyKHR4dCk7XG5cbi8vXHRcdHByb2Nlc3MuZXhpdCgpO1xuXG5cdFx0cmV0dXJuIHR4dCBhcyBzdHJpbmdcblx0fVxuXG5cdGFzeW5jIGdldF92b2x1bWVfbGlzdDxUIGV4dGVuZHMgSU9wdGlvbnNSdW50aW1lPih1cmw6IHN0cmluZyB8IFVSTCxcblx0XHRvcHRpb25zUnVudGltZTogUGFydGlhbDxUICYgSURvd25sb2FkT3B0aW9ucz4gPSB7fSxcblx0KTogUHJvbWlzZTxJTm92ZWw+XG5cdHtcblx0XHRjb25zdCBzZWxmID0gdGhpcztcblxuXHRcdHVybCA9IGF3YWl0IHRoaXMuY3JlYXRlTWFpblVybCh1cmwgYXMgYW55LCBvcHRpb25zUnVudGltZSk7XG5cblx0XHRyZXR1cm4gZnJvbVVSTCh1cmwsIG9wdGlvbnNSdW50aW1lLm9wdGlvbnNKU0RPTSlcblx0XHRcdC50aGVuKGFzeW5jIGZ1bmN0aW9uIChkb206IElKU0RPTSlcblx0XHRcdHtcblx0XHRcdFx0Y29uc3QgJCA9IGRvbS4kO1xuXG5cdFx0XHRcdHRyeVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0bGV0IGh0bWwgPSBtaW5pZnlIVE1MKGRvbS4kKCcucHJvZHVjdC1kZXRhaWwnKS5odG1sKCkpO1xuXG5cdFx0XHRcdFx0ZG9tLiQoJy5wcm9kdWN0LWRldGFpbCcpLmh0bWwoaHRtbCk7XG5cdFx0XHRcdH1cblx0XHRcdFx0Y2F0Y2ggKGUpXG5cdFx0XHRcdHtcblxuXHRcdFx0XHR9XG5cblx0XHRcdFx0bGV0IG5vdmVsX3RpdGxlID0gZG9tLiQoJy5jb250YWluZXIgLnJvdyA+IGRpdiA+IGgzJykudGV4dCgpO1xuXG5cdFx0XHRcdGxldCBub3ZlbF9wdWJsaXNoZXIgPSBzZWxmLklES0VZO1xuXG5cdFx0XHRcdGxldCB1cmxfZGF0YSA9IHNlbGYucGFyc2VVcmwoZG9tLnVybC5ocmVmKTtcblxuXHRcdFx0XHRsZXQgbm92ZWxfYXV0aG9yOiBzdHJpbmc7XG5cdFx0XHRcdGxldCBub3ZlbF9kYXRlO1xuXG5cdFx0XHRcdCQoJy5wcm9kdWN0LWRldGFpbCAud2VsbCAubmF2LWxpc3QgPiBsaScpXG5cdFx0XHRcdFx0LmVhY2goZnVuY3Rpb24gKGksIGVsZW0pXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0bGV0IF90aGlzID0gJCh0aGlzKTtcblxuXHRcdFx0XHRcdFx0bGV0IF90ZXh0ID0gdHJpbShfdGhpcy50ZXh0KCkpO1xuXG5cdFx0XHRcdFx0XHRsZXQgX206IFJlZ0V4cE1hdGNoQXJyYXk7XG5cblx0XHRcdFx0XHRcdGlmIChfbSA9IF90ZXh0Lm1hdGNoKC/kvZzogIVcXHMqW++8mjpdXFxzKihbXlxcbl0rKS8pKVxuXHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRub3ZlbF9hdXRob3IgPSB0cmltKF9tWzFdKVxuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0ZWxzZSBpZiAoX20gPSBfdGV4dC5tYXRjaCgvXFxiKFxcZHs0fVxcLVxcZHsxLDJ9XFwtXFxkezEsMn0pXFxiLykpXG5cdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdHRyeVxuXHRcdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdFx0bGV0IGxhc3RfdXBkYXRlX3RpbWUgPSBtb21lbnQoX21bMV0pO1xuXHRcdFx0XHRcdFx0XHRcdG5vdmVsX2RhdGUgPSBsYXN0X3VwZGF0ZV90aW1lO1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdGNhdGNoIChlKVxuXHRcdFx0XHRcdFx0XHR7XG5cblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0fSlcblx0XHRcdFx0O1xuXG5cdFx0XHRcdGxldCB2b2x1bWVfbGlzdCA9IFtdIGFzIE5vdmVsU2l0ZS5JVm9sdW1lW107XG5cblx0XHRcdFx0Y29uc3Qgbm92ZWxUcmVlID0gb3B0aW9uc1J1bnRpbWUubm92ZWxUcmVlO1xuXHRcdFx0XHRsZXQgY3VycmVudFZvbHVtZTogVHJlZU5vZGU8SVJvd1ZvbHVtZT47XG5cblx0XHRcdFx0bGV0IHRhYmxlID0gZG9tLiQoJy5wcm9kdWN0LWRldGFpbCAudGFiYmFibGUgLnRhYi1jb250ZW50LnNob3ctZGVzYycpLmZpbmQoJ2EnKTtcblxuXHRcdFx0XHRsZXQgX2NhY2hlX2RhdGVzID0gW107XG5cblx0XHRcdFx0bGV0IHRvdGFsX2lkeCA9IDA7XG5cblx0XHRcdFx0e1xuXHRcdFx0XHRcdGxldCB2b2x1bWVfdGl0bGUgPSAnbnVsbCc7XG5cdFx0XHRcdFx0bGV0IHZvbHVtZV9sZXZlbCA9IG51bGw7XG5cblx0XHRcdFx0XHRjdXJyZW50Vm9sdW1lID0gbm92ZWxUcmVlLmFkZFZvbHVtZSh7XG5cdFx0XHRcdFx0XHR2b2x1bWVfdGl0bGUsXG5cdFx0XHRcdFx0XHR2b2x1bWVfbGV2ZWwsXG5cdFx0XHRcdFx0XHR2b2x1bWVfaW5kZXg6IG5vdmVsVHJlZS5yb290KCkuc2l6ZSgpLFxuXHRcdFx0XHRcdFx0dG90YWxfaWR4OiB0b3RhbF9pZHgrKyxcblx0XHRcdFx0XHR9KTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGRvbS4kKCdwW2NsYXNzXTpoYXMoPiBzY3JpcHRbc3JjKj1nb29nbGVdKSwgZGl2W2NsYXNzXTpoYXMoPiBzY3JpcHRbc3JjKj1nb29nbGVdKSwgLmFkc2J5Z29vZ2xlJykucmVtb3ZlKCk7XG5cblx0XHRcdFx0dGFibGVcblx0XHRcdFx0XHQuZWFjaChmdW5jdGlvbiAoaW5kZXgsIGVsZW0pXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0bGV0IHRyID0gZG9tLiQoZWxlbSk7XG5cblx0XHRcdFx0XHRcdGlmICgxKVxuXHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRsZXQgYSA9IHRyO1xuXHRcdFx0XHRcdFx0XHRsZXQgY2hhcHRlcl90aXRsZSA9IHRyaW0oYS50ZXh0KCksIHRydWUpO1xuXG5cdFx0XHRcdFx0XHRcdGxldCBocmVmID0gYS5wcm9wKCdocmVmJyk7XG5cblx0XHRcdFx0XHRcdFx0bGV0IGRhdGEgPSBzZWxmLnBhcnNlVXJsKGhyZWYpO1xuXG5cdFx0XHRcdFx0XHRcdGlmICghZGF0YS5jaGFwdGVyX2lkKVxuXHRcdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdGVsc2Vcblx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdGhyZWYgPSBzZWxmLm1ha2VVcmwoZGF0YSk7XG5cblx0XHRcdFx0XHRcdFx0XHRkYXRhLnVybCA9IGhyZWY7XG5cdFx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0XHRsZXQgY2hhcHRlciA9IHtcblx0XHRcdFx0XHRcdFx0XHRjaGFwdGVyX3RpdGxlLFxuXHRcdFx0XHRcdFx0XHRcdGNoYXB0ZXJfaWQ6IGRhdGEuY2hhcHRlcl9pZCxcblx0XHRcdFx0XHRcdFx0XHRjaGFwdGVyX3VybDogaHJlZixcblx0XHRcdFx0XHRcdFx0XHRjaGFwdGVyX3VybF9kYXRhOiBkYXRhLFxuXHRcdFx0XHRcdFx0XHRcdGNoYXB0ZXJfaW5kZXg6IGN1cnJlbnRWb2x1bWUuc2l6ZSgpLFxuXHRcdFx0XHRcdFx0XHRcdHRvdGFsX2lkeDogdG90YWxfaWR4KyssXG5cdFx0XHRcdFx0XHRcdH07XG5cblx0XHRcdFx0XHRcdFx0bm92ZWxUcmVlLmFkZENoYXB0ZXIoY2hhcHRlciwgY3VycmVudFZvbHVtZSlcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9KVxuXHRcdFx0XHQ7XG5cblx0XHRcdFx0bGV0IGRhdGFfbWV0YTogSU1kY29uZk1ldGEgPSB7XG5cdFx0XHRcdFx0bm92ZWw6IHtcblxuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdH07XG5cblx0XHRcdFx0ZGF0YV9tZXRhLm5vdmVsLmNvdmVyID0gJCgnLnByb2R1Y3QtZGV0YWlsOmVxKDApJykuZmluZCgnaW1nLnByb2R1Y3QtaW1hZ2UnKS5wcm9wKCdzcmMnKTtcblxuXHRcdFx0XHRsZXQgbm92ZWxfZGVzYyA9IHRyaW0oJCgnLnByb2R1Y3QtZGV0YWlsOmVxKDApJykuZmluZCgnLmJvb2tfZGVzY3JpcHRpb24nKS50ZXh0KCkgfHwgJycpO1xuXG5cdFx0XHRcdHJldHVybiB7XG5cblx0XHRcdFx0XHQuLi5kYXRhX21ldGEsXG5cblx0XHRcdFx0XHR1cmw6IGRvbS51cmwsXG5cdFx0XHRcdFx0dXJsX2RhdGEsXG5cblx0XHRcdFx0XHRub3ZlbF9hdXRob3IsXG5cdFx0XHRcdFx0bm92ZWxfZGF0ZSxcblxuXHRcdFx0XHRcdG5vdmVsX2Rlc2MsXG5cblx0XHRcdFx0XHRub3ZlbF90aXRsZSxcblx0XHRcdFx0XHRub3ZlbF9wdWJsaXNoZXIsXG5cblx0XHRcdFx0XHQvL3ZvbHVtZV9saXN0LFxuXHRcdFx0XHRcdG5vdmVsVHJlZSxcblxuXHRcdFx0XHRcdGNoZWNrZGF0ZTogbW9tZW50KCkubG9jYWwoKSxcblxuXHRcdFx0XHRcdGltZ3M6IFtdIGFzIHN0cmluZ1tdLFxuXHRcdFx0XHR9IGFzIElOb3ZlbDtcblx0XHRcdH0pXG5cdFx0XHQ7XG5cdH1cblxufVxuXG5leHBvcnQgZGVmYXVsdCBOb3ZlbFNpdGVFU0pab25lO1xuXG5mdW5jdGlvbiBfcF8yX2JyKHRhcmdldCwgJClcbntcblx0cmV0dXJuICQodGFyZ2V0KVxuXHRcdC5lYWNoKGZ1bmN0aW9uIChpLCBlbGVtKVxuXHRcdHtcblx0XHRcdGxldCBfdGhpcyA9ICQoZWxlbSk7XG5cblx0XHRcdGxldCBfaHRtbCA9IF90aGlzXG5cdFx0XHRcdC5odG1sKClcblx0XHRcdFx0LnJlcGxhY2UoLyg/OiZuYnNwOz8pL2csICcgJylcblx0XHRcdFx0LnJlcGxhY2UoL1tcXHhBMFxcc10rJC9nLCAnJylcblx0XHRcdDtcblxuXHRcdFx0aWYgKF9odG1sID09ICc8YnIvPicgfHwgX2h0bWwgPT0gJzxicj4nKVxuXHRcdFx0e1xuXHRcdFx0XHRfaHRtbCA9ICcnO1xuXHRcdFx0fVxuXG5cdFx0XHRfdGhpcy5hZnRlcihgJHtfaHRtbH08YnIvPmApO1xuXHRcdFx0X3RoaXMucmVtb3ZlKClcblx0XHR9KVxuXHRcdDtcbn1cbiJdfQ==