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
const jsdom_url_1 = require("jsdom-url");
const index_1 = require("../index");
const index_2 = require("../index");
const fetch_1 = require("../../fetch");
const value_1 = require("../../util/value");
const regex_1 = require("../../util/regex");
const html_1 = require("../../util/html");
let NovelSiteESJZone = class NovelSiteESJZone extends tree_1.default {
    _constructor(...argv) {
        // @ts-ignore
        super._constructor(...argv);
        this._reContext = new regex_1.zhRegExp(/^(?:由於百度\s*\d+\s*年以前的貼文都刪了|所以不清楚是由哪位大佬翻譯|若轉載的動作冒犯了您，先跟您說聲抱歉！|也麻煩留言告知，我們會將此文下架|已?由?譯者授權轉載！?|原文網址：[^\n]+|轉載自貼吧|ESJ輕小說(\s*(?:https:\/\/)?www\.esjzone\.cc\/?)?|僅供個人學習交流使用，禁作商業用途|下載后請在24小時內刪除，[^\n]*不負擔任何責任|請尊重翻譯、掃圖、錄入、校對的辛勤勞動，轉載請保留信息)$/uigm);
    }
    static check(url, options) {
        // @ts-ignore
        return /esjzone\.cc/i.test(new jsdom_url_1.URL(url).hostname || '');
    }
    makeUrl(urlobj, bool) {
        let pad;
        if (!bool && urlobj.chapter_id) {
            pad = `forum/${urlobj.novel_id}/${urlobj.chapter_id}.html`;
        }
        else {
            pad = `detail/${urlobj.novel_id}.html`;
        }
        // @ts-ignore
        return new jsdom_url_1.URL(`https://www.esjzone.cc/${pad}`);
    }
    parseUrl(url) {
        let urlobj = {
            url,
            novel_pid: null,
            novel_id: null,
            chapter_id: null,
        };
        //url = url.toString();
        try {
            // @ts-ignore
            urlobj.url = new jsdom_url_1.URL(url);
            // @ts-ignore
            url = urlobj.url.href;
        }
        catch (e) {
            console.warn(e.toString() + ` "${url}"`);
        }
        if (typeof url != 'string') {
            // @ts-ignore
            throw new TypeError(url);
        }
        let r;
        let m;
        r = /^(\d{6,})$/;
        if (m = r.exec(url)) {
            urlobj.novel_id = m[1];
            return urlobj;
        }
        r = /esjzone\.cc\/forum\/(\d+)(?:\.html|\/(\d+).html)/g;
        if (m = r.exec(url)) {
            urlobj.novel_id = m[1];
            urlobj.chapter_id = m[2];
            return urlobj;
        }
        r = /esjzone\.cc\/detail\/(\d+)(?:\.html)?/g;
        if (m = r.exec(url)) {
            urlobj.novel_id = m[1];
            return urlobj;
        }
        return urlobj;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7O0dBRUc7Ozs7Ozs7O0FBRUgscUNBQThDO0FBQzlDLHVDQUF1RztBQU92Ryw2Q0FBK0Q7QUFFL0QseUNBQWdDO0FBRWhDLG9DQUEwRjtBQUUxRixvQ0FBa0M7QUFDbEMsdUNBQTJDO0FBQzNDLDRDQUE0RDtBQUM1RCw0Q0FBNEM7QUFDNUMsMENBQXNEO0FBR3RELElBQWEsZ0JBQWdCLEdBQTdCLE1BQWEsZ0JBQWlCLFNBQVEsY0FBYTtJQWlCbEQsWUFBWSxDQUFDLEdBQUcsSUFBSTtRQUVuQixhQUFhO1FBQ2IsS0FBSyxDQUFDLFlBQVksQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDO1FBRTVCLElBQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxnQkFBUSxDQUFDLDRPQUE0TyxDQUFDLENBQUM7SUFFOVEsQ0FBQztJQUVELE1BQU0sQ0FBQyxLQUFLLENBQUMsR0FBdUMsRUFBRSxPQUFRO1FBRTdELGFBQWE7UUFDYixPQUFPLGNBQWMsQ0FBQyxJQUFJLENBQUMsSUFBSSxlQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsUUFBUSxJQUFJLEVBQUUsQ0FBQyxDQUFDO0lBQ3pELENBQUM7SUFFRCxPQUFPLENBQUMsTUFBMkIsRUFBRSxJQUFlO1FBRW5ELElBQUksR0FBVyxDQUFDO1FBRWhCLElBQUksQ0FBQyxJQUFJLElBQUksTUFBTSxDQUFDLFVBQVUsRUFDOUI7WUFDQyxHQUFHLEdBQUcsU0FBUyxNQUFNLENBQUMsUUFBUSxJQUFJLE1BQU0sQ0FBQyxVQUFVLE9BQU8sQ0FBQTtTQUMxRDthQUVEO1lBQ0MsR0FBRyxHQUFHLFVBQVUsTUFBTSxDQUFDLFFBQVEsT0FBTyxDQUFBO1NBQ3RDO1FBRUQsYUFBYTtRQUNiLE9BQU8sSUFBSSxlQUFHLENBQUMsMEJBQTBCLEdBQUcsRUFBRSxDQUFDLENBQUM7SUFDakQsQ0FBQztJQUVELFFBQVEsQ0FB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QUFDO1FBRXBCLElBQUksS0FBSyxHQUFHLEtBQUs7YUFDZixJQUFJLEVBQUU7YUFDTixPQUFPLENBQUMsY0FBYyxFQUFFLEdBQUcsQ0FBQzthQUM1QixPQUFPLENBQUMsYUFBYSxFQUFFLEVBQUUsQ0FBQyxDQUMzQjtRQUVELElBQUksS0FBSyxJQUFJLE9BQU8sSUFBSSxLQUFLLElBQUksTUFBTSxFQUN2QztZQUNDLEtBQUssR0FBRyxFQUFFLENBQUM7U0FDWDtRQUVELEtBQUssQ0FBQyxLQUFLLENBQUMsR0FBRyxLQUFLLE9BQU8sQ0FBQyxDQUFDO1FBQzdCLEtBQUssQ0FBQyxNQUFNLEVBQUUsQ0FBQTtJQUNmLENBQUMsQ0FBQyxDQUNEO0FBQ0gsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ3JlYXRlZCBieSB1c2VyIG9uIDIwMTgvMy8xNy8wMTcuXG4gKi9cblxuaW1wb3J0IHsgbWluaWZ5SFRNTCwgdHJpbSB9IGZyb20gJy4uLy4uL3V0aWwnO1xuaW1wb3J0IE5vdmVsU2l0ZURlbW8sIHsgSURvd25sb2FkT3B0aW9ucywgSU5vdmVsLCBJT3B0aW9uc1J1bnRpbWUsIElGZXRjaENoYXB0ZXIgfSBmcm9tICcuLi9kZW1vL3RyZWUnO1xuaW1wb3J0IHsgSVJvd1ZvbHVtZSwgVHJlZU5vZGUgfSBmcm9tICcuLi8uLi90cmVlL2luZGV4JztcblxuaW1wb3J0IGZzID0gcmVxdWlyZSgnZnMtZXh0cmEnKTtcbmltcG9ydCB7IHRyaW1GaWxlbmFtZSB9IGZyb20gJ2ZzLWljb252L3V0aWwnO1xuaW1wb3J0ICogYXMgcGF0aCBmcm9tICd1cGF0aDInO1xuaW1wb3J0IG5vdmVsSW5mbywgeyBJTWRjb25mTWV0YSB9IGZyb20gJ25vZGUtbm92ZWwtaW5mbyc7XG5pbXBvcnQgeyBmcm9tVVJMLCBJRnJvbVVybE9wdGlvbnMsIElKU0RPTSB9IGZyb20gJ2pzZG9tLWV4dHJhJztcblxuaW1wb3J0IHsgVVJMIH0gZnJvbSAnanNkb20tdXJsJztcblxuaW1wb3J0IE5vdmVsU2l0ZSwgeyBzdGF0aWNJbXBsZW1lbnRzLCBkZWZhdWx0SlNET01PcHRpb25zLCBTWU1CT0xfQ0FDSEUgfSBmcm9tICcuLi9pbmRleCc7XG5pbXBvcnQgeyBQcm9taXNlQmx1ZWJpcmQsIGJsdWViaXJkRGVjb3JhdG9yIH0gZnJvbSAnLi4vaW5kZXgnO1xuaW1wb3J0IHsgbW9tZW50IH0gZnJvbSAnLi4vaW5kZXgnO1xuaW1wb3J0IHsgcmV0cnlSZXF1ZXN0IH0gZnJvbSAnLi4vLi4vZmV0Y2gnO1xuaW1wb3J0IHsgZG90U2V0VmFsdWUsIGRvdEdldFZhbHVlIH0gZnJvbSAnLi4vLi4vdXRpbC92YWx1ZSc7XG5pbXBvcnQgeyB6aFJlZ0V4cCB9IGZyb20gJy4uLy4uL3V0aWwvcmVnZXgnO1xuaW1wb3J0IHsgX2tlZXBJbWFnZUluQ29udGV4dCB9IGZyb20gJy4uLy4uL3V0aWwvaHRtbCc7XG5cbkBzdGF0aWNJbXBsZW1lbnRzPE5vdmVsU2l0ZS5JTm92ZWxTaXRlU3RhdGljPE5vdmVsU2l0ZUVTSlpvbmU+PigpXG5leHBvcnQgY2xhc3MgTm92ZWxTaXRlRVNKWm9uZSBleHRlbmRzIE5vdmVsU2l0ZURlbW9cbntcblx0cHVibGljIHN0YXRpYyByZWFkb25seSBJREtFWSA9ICdlc2p6b25lJztcblxuXHQvKlxuXHRwcm90ZWN0ZWQgX2ZpeE9wdGlvbnNSdW50aW1lKG9wdGlvbnNSdW50aW1lKVxuXHR7XG5cdFx0b3B0aW9uc1J1bnRpbWUub3B0aW9uc0pTRE9NID0gb3B0aW9uc1J1bnRpbWUub3B0aW9uc0pTRE9NIHx8IHt9O1xuXG5cdFx0Ly9vcHRpb25zUnVudGltZS5vcHRpb25zSlNET00ucnVuU2NyaXB0cyA9ICdkYW5nZXJvdXNseSc7XG5cblx0XHRyZXR1cm4gc3VwZXIuX2ZpeE9wdGlvbnNSdW50aW1lKG9wdGlvbnNSdW50aW1lKVxuXHR9XG5cdCAqL1xuXG5cdHByb3RlY3RlZCBfcmVDb250ZXh0OiBSZWdFeHA7XG5cblx0X2NvbnN0cnVjdG9yKC4uLmFyZ3YpXG5cdHtcblx0XHQvLyBAdHMtaWdub3JlXG5cdFx0c3VwZXIuX2NvbnN0cnVjdG9yKC4uLmFyZ3YpO1xuXG5cdFx0dGhpcy5fcmVDb250ZXh0ID0gbmV3IHpoUmVnRXhwKC9eKD8655Sx5pa855m+5bqmXFxzKlxcZCtcXHMq5bm05Lul5YmN55qE6LK85paH6YO95Yiq5LqGfOaJgOS7peS4jea4healmuaYr+eUseWTquS9jeWkp+S9rOe/u+itr3zoi6XovYnovInnmoTli5XkvZzlhpLniq/kuobmgqjvvIzlhYjot5/mgqjoqqrogbLmirHmrYnvvIF85Lmf6bq754Wp55WZ6KiA5ZGK55+l77yM5oiR5YCR5pyD5bCH5q2k5paH5LiL5p62fOW3sj/nlLE/6K2v6ICF5o6I5qyK6L2J6LyJ77yBP3zljp/mlofntrLlnYDvvJpbXlxcbl0rfOi9iei8ieiHquiyvOWQp3xFU0rovJXlsI/oqqooXFxzKig/Omh0dHBzOlxcL1xcLyk/d3d3XFwuZXNqem9uZVxcLmNjXFwvPyk/fOWDheS+m+WAi+S6uuWtuOe/kuS6pOa1geS9v+eUqO+8jOemgeS9nOWVhualreeUqOmAlHzkuIvovInlkI7oq4vlnKgyNOWwj+aZguWFp+WIqumZpO+8jFteXFxuXSrkuI3osqDmk5Tku7vkvZXosqzku7t86KuL5bCK6YeN57+76K2v44CB5o6D5ZyW44CB6YyE5YWl44CB5qCh5bCN55qE6L6b5Yuk5Yue5YuV77yM6L2J6LyJ6KuL5L+d55WZ5L+h5oGvKSQvdWlnbSk7XG5cblx0fVxuXG5cdHN0YXRpYyBjaGVjayh1cmw6IHN0cmluZyB8IFVSTCB8IE5vdmVsU2l0ZS5JUGFyc2VVcmwsIG9wdGlvbnM/KTogYm9vbGVhblxuXHR7XG5cdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdHJldHVybiAvZXNqem9uZVxcLmNjL2kudGVzdChuZXcgVVJMKHVybCkuaG9zdG5hbWUgfHwgJycpO1xuXHR9XG5cblx0bWFrZVVybCh1cmxvYmo6IE5vdmVsU2l0ZS5JUGFyc2VVcmwsIGJvb2wgPzogYm9vbGVhbik6IFVSTFxuXHR7XG5cdFx0bGV0IHBhZDogc3RyaW5nO1xuXG5cdFx0aWYgKCFib29sICYmIHVybG9iai5jaGFwdGVyX2lkKVxuXHRcdHtcblx0XHRcdHBhZCA9IGBmb3J1bS8ke3VybG9iai5ub3ZlbF9pZH0vJHt1cmxvYmouY2hhcHRlcl9pZH0uaHRtbGBcblx0XHR9XG5cdFx0ZWxzZVxuXHRcdHtcblx0XHRcdHBhZCA9IGBkZXRhaWwvJHt1cmxvYmoubm92ZWxfaWR9Lmh0bWxgXG5cdFx0fVxuXG5cdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdHJldHVybiBuZXcgVVJMKGBodHRwczovL3d3dy5lc2p6b25lLmNjLyR7cGFkfWApO1xuXHR9XG5cblx0cGFyc2VVcmwodXJsOiBzdHJpbmcgfCBVUkwpOiBOb3ZlbFNpdGUuSVBhcnNlVXJsXG5cdHtcblx0XHRsZXQgdXJsb2JqID0ge1xuXHRcdFx0dXJsLFxuXG5cdFx0XHRub3ZlbF9waWQ6IG51bGwsXG5cdFx0XHRub3ZlbF9pZDogbnVsbCxcblx0XHRcdGNoYXB0ZXJfaWQ6IG51bGwsXG5cblx0XHR9O1xuXG5cdFx0Ly91cmwgPSB1cmwudG9TdHJpbmcoKTtcblxuXHRcdHRyeVxuXHRcdHtcblx0XHRcdC8vIEB0cy1pZ25vcmVcblx0XHRcdHVybG9iai51cmwgPSBuZXcgVVJMKHVybCk7XG5cdFx0XHQvLyBAdHMtaWdub3JlXG5cdFx0XHR1cmwgPSB1cmxvYmoudXJsLmhyZWY7XG5cdFx0fVxuXHRcdGNhdGNoIChlKVxuXHRcdHtcblx0XHRcdGNvbnNvbGUud2FybihlLnRvU3RyaW5nKCkgKyBgIFwiJHt1cmx9XCJgKTtcblx0XHR9XG5cblx0XHRpZiAodHlwZW9mIHVybCAhPSAnc3RyaW5nJylcblx0XHR7XG5cdFx0XHQvLyBAdHMtaWdub3JlXG5cdFx0XHR0aHJvdyBuZXcgVHlwZUVycm9yKHVybCk7XG5cdFx0fVxuXG5cdFx0bGV0IHI6IFJlZ0V4cDtcblx0XHRsZXQgbTtcblxuXHRcdHIgPSAvXihcXGR7Nix9KSQvO1xuXHRcdGlmIChtID0gci5leGVjKHVybCkpXG5cdFx0e1xuXHRcdFx0dXJsb2JqLm5vdmVsX2lkID0gbVsxXTtcblx0XHRcdHJldHVybiB1cmxvYmo7XG5cdFx0fVxuXG5cdFx0ciA9IC9lc2p6b25lXFwuY2NcXC9mb3J1bVxcLyhcXGQrKSg/OlxcLmh0bWx8XFwvKFxcZCspLmh0bWwpL2c7XG5cdFx0aWYgKG0gPSByLmV4ZWModXJsKSlcblx0XHR7XG5cdFx0XHR1cmxvYmoubm92ZWxfaWQgPSBtWzFdO1xuXHRcdFx0dXJsb2JqLmNoYXB0ZXJfaWQgPSBtWzJdO1xuXG5cdFx0XHRyZXR1cm4gdXJsb2JqO1xuXHRcdH1cblxuXHRcdHIgPSAvZXNqem9uZVxcLmNjXFwvZGV0YWlsXFwvKFxcZCspKD86XFwuaHRtbCk/L2c7XG5cdFx0aWYgKG0gPSByLmV4ZWModXJsKSlcblx0XHR7XG5cdFx0XHR1cmxvYmoubm92ZWxfaWQgPSBtWzFdO1xuXG5cdFx0XHRyZXR1cm4gdXJsb2JqO1xuXHRcdH1cblxuXHRcdHJldHVybiB1cmxvYmo7XG5cdH1cblxuXHRwcm90ZWN0ZWQgYXN5bmMgX2RlY29kZUNoYXB0ZXI8VD4ocmV0OiBJRmV0Y2hDaGFwdGVyLCBvcHRpb25zUnVudGltZTogVCAmIElPcHRpb25zUnVudGltZSwgY2FjaGUpXG5cdHtcblx0XHRjb25zdCB7IGRvbSB9ID0gcmV0O1xuXHRcdGNvbnN0IHsgJCB9ID0gZG9tO1xuXG5cdFx0bGV0IGh0bWwgPSBkb20uc2VyaWFsaXplKCk7XG5cblx0XHRsZXQgbSA9IGh0bWxcblx0XHRcdC5tYXRjaCgvZ2V0VHJhbnNsYXRpb25cXChbJ1wiXShbXlxcJ1wiXSspWydcIl0vaSlcblx0XHQ7XG5cblx0XHRpZiAobSlcblx0XHR7XG5cdFx0XHRsZXQgY29kZSA9IG1bMV07XG5cblx0XHRcdGF3YWl0IHJldHJ5UmVxdWVzdChyZXQudXJsLCB7XG5cdFx0XHRcdC8vIEB0cy1pZ25vcmVcblx0XHRcdFx0Li4ub3B0aW9uc1J1bnRpbWUucmVxdWVzdE9wdGlvbnMsXG5cdFx0XHRcdG1ldGhvZDogJ1BPU1QnLFxuXHRcdFx0XHRmb3JtOiB7XG5cdFx0XHRcdFx0cGx4ZjogJ2dldFRyYW5zbGF0aW9uJyxcblx0XHRcdFx0XHRwbHhhOiBbY29kZV0sXG5cdFx0XHRcdH0sXG5cdFx0XHR9KVxuXHRcdFx0XHQudGhlbigodjogc3RyaW5nKSA9PiB7XG5cdFx0XHRcdFx0diA9IHZcblx0XHRcdFx0XHRcdC5yZXBsYWNlKC9cXDxKaW5KaW5nXFw+LywgJycpXG5cdFx0XHRcdFx0XHQucmVwbGFjZSgvXFw8XFwvSmluSmluZ1xcPi8sICcnKVxuXHRcdFx0XHRcdDtcblxuXHRcdFx0XHRcdHJldHVybiBKU09OLnBhcnNlKHYpXG5cdFx0XHRcdH0pXG5cdFx0XHRcdC8qXG5cdFx0XHRcdC50YXAodiA9PiB7XG5cdFx0XHRcdFx0Y29uc29sZS5kaXIoJy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tJylcblx0XHRcdFx0XHRjb25zb2xlLmRpcih2KVxuXHRcdFx0XHRcdGNvbnNvbGUuZGlyKCctLS0tLS0tLS0tLS0tLS0tLS0tLS0tLScpXG5cdFx0XHRcdH0pXG5cdFx0XHRcdCAqL1xuXHRcdFx0XHQudGFwKChhOiBzdHJpbmdbXSkgPT4ge1xuXG5cdFx0XHRcdFx0bGV0IGVsZW1zID0gJCgnLnRyYW5zLCAudCcpO1xuXG5cdFx0XHRcdFx0YS5mb3JFYWNoKCh2LCBpKSA9PiB7XG5cdFx0XHRcdFx0XHRlbGVtcy5lcShpKS5odG1sKHYpO1xuXHRcdFx0XHRcdH0pXG5cblx0XHRcdFx0fSlcblx0XHRcdDtcblxuXHRcdH1cblxuXHRcdC8vY29uc29sZS5kaXIobSk7XG5cdFx0Ly9wcm9jZXNzLmV4aXQoKTtcblx0fVxuXG5cdHByb3RlY3RlZCBhc3luYyBfcGFyc2VDaGFwdGVyPFQ+KHJldCwgb3B0aW9uc1J1bnRpbWUsIGNhY2hlKVxuXHR7XG5cdFx0aWYgKCFyZXQpXG5cdFx0e1xuXHRcdFx0cmV0dXJuICcnO1xuXHRcdH1cblxuXHRcdGNvbnN0ICQgPSByZXQuZG9tLiQ7XG5cblx0XHR0cnlcblx0XHR7XG5cdFx0XHRsZXQgaHRtbCA9IG1pbmlmeUhUTUwocmV0LmRvbS4kKCcuY29udGFpbmVyIC5yb3c6aGFzKC5mb3J1bS1jb250ZW50KScpLmh0bWwoKSk7XG5cblx0XHRcdHJldC5kb20uJCgnLmNvbnRhaW5lciAucm93OmhhcyguZm9ydW0tY29udGVudCknKS5odG1sKGh0bWwpO1xuXHRcdH1cblx0XHRjYXRjaCAoZSlcblx0XHR7XG5cblx0XHR9XG5cblx0XHRyZXQuZG9tLiQoJ3BbY2xhc3NdOmhhcyg+IHNjcmlwdCksIC5hZHNieWdvb2dsZScpLnJlbW92ZSgpO1xuXG5cdFx0YXdhaXQgdGhpcy5fZGVjb2RlQ2hhcHRlcihyZXQsIG9wdGlvbnNSdW50aW1lLCBjYWNoZSk7XG5cblx0XHRfcF8yX2JyKCcuZm9ydW0tY29udGVudCA+IHAnLCByZXQuZG9tLiQpO1xuXG5cdFx0bGV0IGVsZW0gPSByZXQuZG9tLiQoJy5jb250YWluZXIgLmZvcnVtLWNvbnRlbnQnKTtcblxuXHRcdGVsZW0uaHRtbChmdW5jdGlvbiAoaSwgb2xkOiBzdHJpbmcpXG5cdFx0e1xuXHRcdFx0cmV0dXJuIG9sZFxuXHRcdFx0XHQucmVwbGFjZSgvKFxcPGJyXFw+KXszLDR9L2csICckMScpXG5cdFx0XHRcdC5yZXBsYWNlKC8oPzw9XFw8YnJcXD4pKD89W15cXG5dKS9nLCAnXFxuJylcblx0XHR9KTtcblxuXHRcdGxldCB0aXRsZSA9IHRyaW0ocmV0LmRvbS4kKCcuY29udGFpbmVyIC5yb3cgPiBkaXYgPiBoMycpLnRleHQoKSk7XG5cblx0XHRpZiAob3B0aW9uc1J1bnRpbWUua2VlcEltYWdlKVxuXHRcdHtcblx0XHRcdGF3YWl0IF9rZWVwSW1hZ2VJbkNvbnRleHQoZWxlbS5maW5kKCdpbWdbc3JjXScpLCAkKTtcblx0XHR9XG5cblx0XHRsZXQgdHh0OiBzdHJpbmcgPSBlbGVtXG5cdFx0XHQudGV4dCgpXG5cdFx0XHQucmVwbGFjZSh0aGlzLl9yZUNvbnRleHQsICcnKVxuXHRcdFx0LnJlcGxhY2UoL15cXHMrfFxccyskL2csICcnKVxuXHRcdDtcblxuXHRcdGlmICh0eHQuaW5kZXhPZih0aXRsZSArICdcXG4nKSA9PT0gMClcblx0XHR7XG5cdFx0XHR0eHQgPSB0eHQuc2xpY2UodGl0bGUubGVuZ3RoICsgMSlcblx0XHRcdFx0LnJlcGxhY2UoL15cXG4rL2csICcnKVxuXHRcdFx0O1xuXHRcdH1cblxuXHRcdGxldCBjb250cmlidXRlOiBzdHJpbmdbXSA9IGRvdEdldFZhbHVlKGNhY2hlLCAnbm92ZWwuY29udHJpYnV0ZScsIHsgZGVmYXVsdDogW10gfSk7XG5cblx0XHR0eHQgPSB0eHQucmVwbGFjZSgvXue/u+itr++8mihbXlxcbl0rKVxcbi8sIChzLCB2KSA9PiB7XG5cblx0XHRcdHYgPSB2LnJlcGxhY2UoL15bXFxz44CAXFx4QTBdK3xbXFxz44CAXFx4QTBdKyQvZywgJycpO1xuXG5cdFx0XHRpZiAodiAmJiAhY29udHJpYnV0ZS5pbmNsdWRlcyh2KSlcblx0XHRcdHtcblx0XHRcdFx0Y29udHJpYnV0ZS5wdXNoKHYpO1xuXHRcdFx0fVxuXG5cdFx0XHRyZXR1cm4gJydcblx0XHR9KTtcblxuXHRcdGlmIChjb250cmlidXRlLmxlbmd0aClcblx0XHR7XG5cdFx0XHRkb3RTZXRWYWx1ZShjYWNoZSwgJ25vdmVsLmNvbnRyaWJ1dGUnLCBjb250cmlidXRlKTtcblx0XHR9XG5cblx0XHQvKlxuXHRcdGxldCBodG1sID0gZWxlbS5odG1sKCk7XG5cblx0XHR0aHJvdyBjb25zb2xlLmRpcih7XG5cdFx0XHRodG1sLFxuXHRcdFx0dHh0LFxuXHRcdH0pO1xuXHRcdCAqL1xuXG4vL1x0XHRjb25zb2xlLmRpcih0eHQpO1xuXG4vL1x0XHRwcm9jZXNzLmV4aXQoKTtcblxuXHRcdHJldHVybiB0eHQgYXMgc3RyaW5nXG5cdH1cblxuXHRhc3luYyBnZXRfdm9sdW1lX2xpc3Q8VCBleHRlbmRzIElPcHRpb25zUnVudGltZT4odXJsOiBzdHJpbmcgfCBVUkwsXG5cdFx0b3B0aW9uc1J1bnRpbWU6IFBhcnRpYWw8VCAmIElEb3dubG9hZE9wdGlvbnM+ID0ge30sXG5cdCk6IFByb21pc2U8SU5vdmVsPlxuXHR7XG5cdFx0Y29uc3Qgc2VsZiA9IHRoaXM7XG5cblx0XHR1cmwgPSBhd2FpdCB0aGlzLmNyZWF0ZU1haW5VcmwodXJsIGFzIGFueSwgb3B0aW9uc1J1bnRpbWUpO1xuXG5cdFx0cmV0dXJuIGZyb21VUkwodXJsLCBvcHRpb25zUnVudGltZS5vcHRpb25zSlNET00pXG5cdFx0XHQudGhlbihhc3luYyBmdW5jdGlvbiAoZG9tOiBJSlNET00pXG5cdFx0XHR7XG5cdFx0XHRcdGNvbnN0ICQgPSBkb20uJDtcblxuXHRcdFx0XHR0cnlcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGxldCBodG1sID0gbWluaWZ5SFRNTChkb20uJCgnLnByb2R1Y3QtZGV0YWlsJykuaHRtbCgpKTtcblxuXHRcdFx0XHRcdGRvbS4kKCcucHJvZHVjdC1kZXRhaWwnKS5odG1sKGh0bWwpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGNhdGNoIChlKVxuXHRcdFx0XHR7XG5cblx0XHRcdFx0fVxuXG5cdFx0XHRcdGxldCBub3ZlbF90aXRsZSA9IGRvbS4kKCcuY29udGFpbmVyIC5yb3cgPiBkaXYgPiBoMycpLnRleHQoKTtcblxuXHRcdFx0XHRsZXQgbm92ZWxfcHVibGlzaGVyID0gc2VsZi5JREtFWTtcblxuXHRcdFx0XHRsZXQgdXJsX2RhdGEgPSBzZWxmLnBhcnNlVXJsKGRvbS51cmwuaHJlZik7XG5cblx0XHRcdFx0bGV0IG5vdmVsX2F1dGhvcjogc3RyaW5nO1xuXHRcdFx0XHRsZXQgbm92ZWxfZGF0ZTtcblxuXHRcdFx0XHQkKCcucHJvZHVjdC1kZXRhaWwgLndlbGwgLm5hdi1saXN0ID4gbGknKVxuXHRcdFx0XHRcdC5lYWNoKGZ1bmN0aW9uIChpLCBlbGVtKVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdGxldCBfdGhpcyA9ICQodGhpcyk7XG5cblx0XHRcdFx0XHRcdGxldCBfdGV4dCA9IHRyaW0oX3RoaXMudGV4dCgpKTtcblxuXHRcdFx0XHRcdFx0bGV0IF9tOiBSZWdFeHBNYXRjaEFycmF5O1xuXG5cdFx0XHRcdFx0XHRpZiAoX20gPSBfdGV4dC5tYXRjaCgv5L2c6ICFXFxzKlvvvJo6XVxccyooW15cXG5dKykvKSlcblx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0bm92ZWxfYXV0aG9yID0gdHJpbShfbVsxXSlcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdGVsc2UgaWYgKF9tID0gX3RleHQubWF0Y2goL1xcYihcXGR7NH1cXC1cXGR7MSwyfVxcLVxcZHsxLDJ9KVxcYi8pKVxuXHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHR0cnlcblx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdGxldCBsYXN0X3VwZGF0ZV90aW1lID0gbW9tZW50KF9tWzFdKTtcblx0XHRcdFx0XHRcdFx0XHRub3ZlbF9kYXRlID0gbGFzdF91cGRhdGVfdGltZTtcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRjYXRjaCAoZSlcblx0XHRcdFx0XHRcdFx0e1xuXG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdH0pXG5cdFx0XHRcdDtcblxuXHRcdFx0XHRsZXQgdm9sdW1lX2xpc3QgPSBbXSBhcyBOb3ZlbFNpdGUuSVZvbHVtZVtdO1xuXG5cdFx0XHRcdGNvbnN0IG5vdmVsVHJlZSA9IG9wdGlvbnNSdW50aW1lLm5vdmVsVHJlZTtcblx0XHRcdFx0bGV0IGN1cnJlbnRWb2x1bWU6IFRyZWVOb2RlPElSb3dWb2x1bWU+O1xuXG5cdFx0XHRcdGxldCB0YWJsZSA9IGRvbS4kKCcucHJvZHVjdC1kZXRhaWwgLnRhYmJhYmxlIC50YWItY29udGVudC5zaG93LWRlc2MnKS5maW5kKCdhJyk7XG5cblx0XHRcdFx0bGV0IF9jYWNoZV9kYXRlcyA9IFtdO1xuXG5cdFx0XHRcdGxldCB0b3RhbF9pZHggPSAwO1xuXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRsZXQgdm9sdW1lX3RpdGxlID0gJ251bGwnO1xuXHRcdFx0XHRcdGxldCB2b2x1bWVfbGV2ZWwgPSBudWxsO1xuXG5cdFx0XHRcdFx0Y3VycmVudFZvbHVtZSA9IG5vdmVsVHJlZS5hZGRWb2x1bWUoe1xuXHRcdFx0XHRcdFx0dm9sdW1lX3RpdGxlLFxuXHRcdFx0XHRcdFx0dm9sdW1lX2xldmVsLFxuXHRcdFx0XHRcdFx0dm9sdW1lX2luZGV4OiBub3ZlbFRyZWUucm9vdCgpLnNpemUoKSxcblx0XHRcdFx0XHRcdHRvdGFsX2lkeDogdG90YWxfaWR4KyssXG5cdFx0XHRcdFx0fSk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRkb20uJCgncFtjbGFzc106aGFzKD4gc2NyaXB0W3NyYyo9Z29vZ2xlXSksIGRpdltjbGFzc106aGFzKD4gc2NyaXB0W3NyYyo9Z29vZ2xlXSksIC5hZHNieWdvb2dsZScpLnJlbW92ZSgpO1xuXG5cdFx0XHRcdHRhYmxlXG5cdFx0XHRcdFx0LmVhY2goZnVuY3Rpb24gKGluZGV4LCBlbGVtKVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdGxldCB0ciA9IGRvbS4kKGVsZW0pO1xuXG5cdFx0XHRcdFx0XHRpZiAoMSlcblx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0bGV0IGEgPSB0cjtcblx0XHRcdFx0XHRcdFx0bGV0IGNoYXB0ZXJfdGl0bGUgPSB0cmltKGEudGV4dCgpLCB0cnVlKTtcblxuXHRcdFx0XHRcdFx0XHRsZXQgaHJlZiA9IGEucHJvcCgnaHJlZicpO1xuXG5cdFx0XHRcdFx0XHRcdGxldCBkYXRhID0gc2VsZi5wYXJzZVVybChocmVmKTtcblxuXHRcdFx0XHRcdFx0XHRpZiAoIWRhdGEuY2hhcHRlcl9pZClcblx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdHJldHVybjtcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRlbHNlXG5cdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHRocmVmID0gc2VsZi5tYWtlVXJsKGRhdGEpO1xuXG5cdFx0XHRcdFx0XHRcdFx0ZGF0YS51cmwgPSBocmVmO1xuXHRcdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdFx0bGV0IGNoYXB0ZXIgPSB7XG5cdFx0XHRcdFx0XHRcdFx0Y2hhcHRlcl90aXRsZSxcblx0XHRcdFx0XHRcdFx0XHRjaGFwdGVyX2lkOiBkYXRhLmNoYXB0ZXJfaWQsXG5cdFx0XHRcdFx0XHRcdFx0Y2hhcHRlcl91cmw6IGhyZWYsXG5cdFx0XHRcdFx0XHRcdFx0Y2hhcHRlcl91cmxfZGF0YTogZGF0YSxcblx0XHRcdFx0XHRcdFx0XHRjaGFwdGVyX2luZGV4OiBjdXJyZW50Vm9sdW1lLnNpemUoKSxcblx0XHRcdFx0XHRcdFx0XHR0b3RhbF9pZHg6IHRvdGFsX2lkeCsrLFxuXHRcdFx0XHRcdFx0XHR9O1xuXG5cdFx0XHRcdFx0XHRcdG5vdmVsVHJlZS5hZGRDaGFwdGVyKGNoYXB0ZXIsIGN1cnJlbnRWb2x1bWUpXG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fSlcblx0XHRcdFx0O1xuXG5cdFx0XHRcdGxldCBkYXRhX21ldGE6IElNZGNvbmZNZXRhID0ge1xuXHRcdFx0XHRcdG5vdmVsOiB7XG5cblx0XHRcdFx0XHR9LFxuXHRcdFx0XHR9O1xuXG5cdFx0XHRcdGRhdGFfbWV0YS5ub3ZlbC5jb3ZlciA9ICQoJy5wcm9kdWN0LWRldGFpbDplcSgwKScpLmZpbmQoJ2ltZy5wcm9kdWN0LWltYWdlJykucHJvcCgnc3JjJyk7XG5cblx0XHRcdFx0bGV0IG5vdmVsX2Rlc2MgPSB0cmltKCQoJy5wcm9kdWN0LWRldGFpbDplcSgwKScpLmZpbmQoJy5ib29rX2Rlc2NyaXB0aW9uJykudGV4dCgpIHx8ICcnKTtcblxuXHRcdFx0XHRyZXR1cm4ge1xuXG5cdFx0XHRcdFx0Li4uZGF0YV9tZXRhLFxuXG5cdFx0XHRcdFx0dXJsOiBkb20udXJsLFxuXHRcdFx0XHRcdHVybF9kYXRhLFxuXG5cdFx0XHRcdFx0bm92ZWxfYXV0aG9yLFxuXHRcdFx0XHRcdG5vdmVsX2RhdGUsXG5cblx0XHRcdFx0XHRub3ZlbF9kZXNjLFxuXG5cdFx0XHRcdFx0bm92ZWxfdGl0bGUsXG5cdFx0XHRcdFx0bm92ZWxfcHVibGlzaGVyLFxuXG5cdFx0XHRcdFx0Ly92b2x1bWVfbGlzdCxcblx0XHRcdFx0XHRub3ZlbFRyZWUsXG5cblx0XHRcdFx0XHRjaGVja2RhdGU6IG1vbWVudCgpLmxvY2FsKCksXG5cblx0XHRcdFx0XHRpbWdzOiBbXSBhcyBzdHJpbmdbXSxcblx0XHRcdFx0fSBhcyBJTm92ZWw7XG5cdFx0XHR9KVxuXHRcdFx0O1xuXHR9XG5cbn1cblxuZXhwb3J0IGRlZmF1bHQgTm92ZWxTaXRlRVNKWm9uZTtcblxuZnVuY3Rpb24gX3BfMl9icih0YXJnZXQsICQpXG57XG5cdHJldHVybiAkKHRhcmdldClcblx0XHQuZWFjaChmdW5jdGlvbiAoaSwgZWxlbSlcblx0XHR7XG5cdFx0XHRsZXQgX3RoaXMgPSAkKGVsZW0pO1xuXG5cdFx0XHRsZXQgX2h0bWwgPSBfdGhpc1xuXHRcdFx0XHQuaHRtbCgpXG5cdFx0XHRcdC5yZXBsYWNlKC8oPzombmJzcDs/KS9nLCAnICcpXG5cdFx0XHRcdC5yZXBsYWNlKC9bXFx4QTBcXHNdKyQvZywgJycpXG5cdFx0XHQ7XG5cblx0XHRcdGlmIChfaHRtbCA9PSAnPGJyLz4nIHx8IF9odG1sID09ICc8YnI+Jylcblx0XHRcdHtcblx0XHRcdFx0X2h0bWwgPSAnJztcblx0XHRcdH1cblxuXHRcdFx0X3RoaXMuYWZ0ZXIoYCR7X2h0bWx9PGJyLz5gKTtcblx0XHRcdF90aGlzLnJlbW92ZSgpXG5cdFx0fSlcblx0XHQ7XG59XG4iXX0=