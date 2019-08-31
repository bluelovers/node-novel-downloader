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
let NovelSiteESJZone = class NovelSiteESJZone extends tree_1.default {
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
    _parseChapter(ret, optionsRuntime, cache) {
        if (!ret) {
            return '';
        }
        try {
            let html = util_1.minifyHTML(ret.dom.$('.container .row:has(.forum-content)').html());
            ret.dom.$('.container .row:has(.forum-content)').html(html);
        }
        catch (e) {
        }
        ret.dom.$('p[class]:has(> script), .adsbygoogle').remove();
        _p_2_br('.forum-content > p', ret.dom.$);
        let elem = ret.dom.$('.container .forum-content');
        elem.html(function (i, old) {
            return old
                .replace(/(\<br\>){3,4}/g, '$1')
                .replace(/(?<=\<br\>)(?=[^\n])/g, '\n');
        });
        let title = util_1.trim(ret.dom.$('.container .row > div > h3').text());
        let txt = elem
            .text()
            .replace(/^(?:由於百度\s*\d+\s*年以前的貼文都刪了|所以不清楚是由哪位大佬翻譯|若轉載的動作冒犯了您，先跟您說聲抱歉！|也麻煩留言告知，我們會將此文下架|已?由?譯者授權轉載！?|原文網址：[^\n]+|轉載自貼吧)$/uigm, '')
            .replace(/^\s+|\s+$/g, '');
        if (txt.indexOf(title + '\n') === 0) {
            txt = txt.slice(title.length + 1)
                .replace(/^\n+/g, '');
        }
        let html = elem.html();
        //		throw console.dir({
        //			html,
        //			txt,
        //		});
        return txt;
    }
    async get_volume_list(url, optionsRuntime = {}) {
        const self = this;
        url = await this.createMainUrl(url);
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
            let data_meta = {};
            return Object.assign(Object.assign({}, data_meta), { url: dom.url, url_data,
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7O0dBRUc7Ozs7Ozs7O0FBRUgscUNBQThDO0FBQzlDLHVDQUF3RjtBQU94Riw2Q0FBK0Q7QUFFL0QseUNBQWdDO0FBRWhDLG9DQUEwRjtBQUUxRixvQ0FBa0M7QUFHbEMsSUFBYSxnQkFBZ0IsR0FBN0IsTUFBYSxnQkFBaUIsU0FBUSxjQUFhO0lBSWxELE1BQU0sQ0FBQyxLQUFLLENBQUMsR0FBdUMsRUFBRSxPQUFRO1FBRTdELGFBQWE7UUFDYixPQUFPLGNBQWMsQ0FBQyxJQUFJLENBQUMsSUFBSSxlQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsUUFBUSxJQUFJLEVBQUUsQ0FBQyxDQUFDO0lBQ3pELENBQUM7SUFFRCxPQUFPLENBQUMsTUFBMkIsRUFBRSxJQUFlO1FBRW5ELElBQUksR0FBVyxDQUFDO1FBRWhCLElBQUksQ0FBQyxJQUFJLElBQUksTUFBTSxDQUFDLFVBQVUsRUFDOUI7WUFDQyxHQUFHLEdBQUcsU0FBUyxNQUFNLENBQUMsUUFBUSxJQUFJLE1BQU0sQ0FBQyxVQUFVLE9BQU8sQ0FBQTtTQUMxRDthQUVEO1lBQ0MsR0FBRyxHQUFHLFVBQVUsTUFBTSxDQUFDLFFBQVEsT0FBTyxDQUFBO1NBQ3RDO1FBRUQsYUFBYTtRQUNiLE9BQU8sSUFBSSxlQUFHLENBQUMsMEJBQTBCLEdBQUcsRUFBRSxDQUFDLENBQUM7SUFDakQsQ0FBQztJQUVELFFBQVEsQ0FBQyxHQUFpQjtRQUV6QixJQUFJLE1BQU0sR0FBRztZQUNaLEdBQUc7WUFFSCxTQUFTLEVBQUUsSUFBSTtZQUNmLFFBQVEsRUFBRSxJQUFJO1lBQ2QsVUFBVSxFQUFFLElBQUk7U0FFaEIsQ0FBQztRQUVGLHVCQUF1QjtRQUV2QixJQUNBO1lBQ0MsYUFBYTtZQUNiLE1BQU0sQ0FBQyxHQUFHLEdBQUcsSUFBSSxlQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDMUIs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SyxHQUFHLEtBQUs7YUFDZixJQUFJLEVBQUU7YUFDTixPQUFPLENBQUMsY0FBYyxFQUFFLEdBQUcsQ0FBQzthQUM1QixPQUFPLENBQUMsYUFBYSxFQUFFLEVBQUUsQ0FBQyxDQUMzQjtRQUVELElBQUksS0FBSyxJQUFJLE9BQU8sSUFBSSxLQUFLLElBQUksTUFBTSxFQUN2QztZQUNDLEtBQUssR0FBRyxFQUFFLENBQUM7U0FDWDtRQUVELEtBQUssQ0FBQyxLQUFLLENBQUMsR0FBRyxLQUFLLE9BQU8sQ0FBQyxDQUFDO1FBQzdCLEtBQUssQ0FBQyxNQUFNLEVBQUUsQ0FBQTtJQUNmLENBQUMsQ0FBQyxDQUNEO0FBQ0gsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ3JlYXRlZCBieSB1c2VyIG9uIDIwMTgvMy8xNy8wMTcuXG4gKi9cblxuaW1wb3J0IHsgbWluaWZ5SFRNTCwgdHJpbSB9IGZyb20gJy4uLy4uL3V0aWwnO1xuaW1wb3J0IE5vdmVsU2l0ZURlbW8sIHsgSURvd25sb2FkT3B0aW9ucywgSU5vdmVsLCBJT3B0aW9uc1J1bnRpbWUgfSBmcm9tICcuLi9kZW1vL3RyZWUnO1xuaW1wb3J0IHsgSVJvd1ZvbHVtZSwgVHJlZU5vZGUgfSBmcm9tICcuLi8uLi90cmVlL2luZGV4JztcblxuaW1wb3J0IGZzID0gcmVxdWlyZSgnZnMtZXh0cmEnKTtcbmltcG9ydCB7IHRyaW1GaWxlbmFtZSB9IGZyb20gJ2ZzLWljb252L3V0aWwnO1xuaW1wb3J0ICogYXMgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCBub3ZlbEluZm8sIHsgSU1kY29uZk1ldGEgfSBmcm9tICdub2RlLW5vdmVsLWluZm8nO1xuaW1wb3J0IHsgZnJvbVVSTCwgSUZyb21VcmxPcHRpb25zLCBJSlNET00gfSBmcm9tICdqc2RvbS1leHRyYSc7XG5cbmltcG9ydCB7IFVSTCB9IGZyb20gJ2pzZG9tLXVybCc7XG5cbmltcG9ydCBOb3ZlbFNpdGUsIHsgc3RhdGljSW1wbGVtZW50cywgZGVmYXVsdEpTRE9NT3B0aW9ucywgU1lNQk9MX0NBQ0hFIH0gZnJvbSAnLi4vaW5kZXgnO1xuaW1wb3J0IHsgUHJvbWlzZUJsdWViaXJkLCBibHVlYmlyZERlY29yYXRvciB9IGZyb20gJy4uL2luZGV4JztcbmltcG9ydCB7IG1vbWVudCB9IGZyb20gJy4uL2luZGV4JztcblxuQHN0YXRpY0ltcGxlbWVudHM8Tm92ZWxTaXRlLklOb3ZlbFNpdGVTdGF0aWM8Tm92ZWxTaXRlRVNKWm9uZT4+KClcbmV4cG9ydCBjbGFzcyBOb3ZlbFNpdGVFU0pab25lIGV4dGVuZHMgTm92ZWxTaXRlRGVtb1xue1xuXHRwdWJsaWMgc3RhdGljIHJlYWRvbmx5IElES0VZID0gJ2VzanpvbmUnO1xuXG5cdHN0YXRpYyBjaGVjayh1cmw6IHN0cmluZyB8IFVSTCB8IE5vdmVsU2l0ZS5JUGFyc2VVcmwsIG9wdGlvbnM/KTogYm9vbGVhblxuXHR7XG5cdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdHJldHVybiAvZXNqem9uZVxcLmNjL2kudGVzdChuZXcgVVJMKHVybCkuaG9zdG5hbWUgfHwgJycpO1xuXHR9XG5cblx0bWFrZVVybCh1cmxvYmo6IE5vdmVsU2l0ZS5JUGFyc2VVcmwsIGJvb2wgPzogYm9vbGVhbik6IFVSTFxuXHR7XG5cdFx0bGV0IHBhZDogc3RyaW5nO1xuXG5cdFx0aWYgKCFib29sICYmIHVybG9iai5jaGFwdGVyX2lkKVxuXHRcdHtcblx0XHRcdHBhZCA9IGBmb3J1bS8ke3VybG9iai5ub3ZlbF9pZH0vJHt1cmxvYmouY2hhcHRlcl9pZH0uaHRtbGBcblx0XHR9XG5cdFx0ZWxzZVxuXHRcdHtcblx0XHRcdHBhZCA9IGBkZXRhaWwvJHt1cmxvYmoubm92ZWxfaWR9Lmh0bWxgXG5cdFx0fVxuXG5cdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdHJldHVybiBuZXcgVVJMKGBodHRwczovL3d3dy5lc2p6b25lLmNjLyR7cGFkfWApO1xuXHR9XG5cblx0cGFyc2VVcmwodXJsOiBzdHJpbmcgfCBVUkwpOiBOb3ZlbFNpdGUuSVBhcnNlVXJsXG5cdHtcblx0XHRsZXQgdXJsb2JqID0ge1xuXHRcdFx0dXJsLFxuXG5cdFx0XHRub3ZlbF9waWQ6IG51bGwsXG5cdFx0XHRub3ZlbF9pZDogbnVsbCxcblx0XHRcdGNoYXB0ZXJfaWQ6IG51bGwsXG5cblx0XHR9O1xuXG5cdFx0Ly91cmwgPSB1cmwudG9TdHJpbmcoKTtcblxuXHRcdHRyeVxuXHRcdHtcblx0XHRcdC8vIEB0cy1pZ25vcmVcblx0XHRcdHVybG9iai51cmwgPSBuZXcgVVJMKHVybCk7XG5cdFx0XHQvLyBAdHMtaWdub3JlXG5cdFx0XHR1cmwgPSB1cmxvYmoudXJsLmhyZWY7XG5cdFx0fVxuXHRcdGNhdGNoIChlKVxuXHRcdHtcblx0XHRcdGNvbnNvbGUud2FybihlLnRvU3RyaW5nKCkgKyBgIFwiJHt1cmx9XCJgKTtcblx0XHR9XG5cblx0XHRpZiAodHlwZW9mIHVybCAhPSAnc3RyaW5nJylcblx0XHR7XG5cdFx0XHQvLyBAdHMtaWdub3JlXG5cdFx0XHR0aHJvdyBuZXcgVHlwZUVycm9yKHVybCk7XG5cdFx0fVxuXG5cdFx0bGV0IHI6IFJlZ0V4cDtcblx0XHRsZXQgbTtcblxuXHRcdHIgPSAvXihcXGR7Nix9KSQvO1xuXHRcdGlmIChtID0gci5leGVjKHVybCkpXG5cdFx0e1xuXHRcdFx0dXJsb2JqLm5vdmVsX2lkID0gbVsxXTtcblx0XHRcdHJldHVybiB1cmxvYmo7XG5cdFx0fVxuXG5cdFx0ciA9IC9lc2p6b25lXFwuY2NcXC9mb3J1bVxcLyhcXGQrKSg/OlxcLmh0bWx8XFwvKFxcZCspLmh0bWwpL2c7XG5cdFx0aWYgKG0gPSByLmV4ZWModXJsKSlcblx0XHR7XG5cdFx0XHR1cmxvYmoubm92ZWxfaWQgPSBtWzFdO1xuXHRcdFx0dXJsb2JqLmNoYXB0ZXJfaWQgPSBtWzJdO1xuXG5cdFx0XHRyZXR1cm4gdXJsb2JqO1xuXHRcdH1cblxuXHRcdHIgPSAvZXNqem9uZVxcLmNjXFwvZGV0YWlsXFwvKFxcZCspKD86XFwuaHRtbCk/L2c7XG5cdFx0aWYgKG0gPSByLmV4ZWModXJsKSlcblx0XHR7XG5cdFx0XHR1cmxvYmoubm92ZWxfaWQgPSBtWzFdO1xuXG5cdFx0XHRyZXR1cm4gdXJsb2JqO1xuXHRcdH1cblxuXHRcdHJldHVybiB1cmxvYmo7XG5cdH1cblxuXHRwcm90ZWN0ZWQgX3BhcnNlQ2hhcHRlcjxUPihyZXQsIG9wdGlvbnNSdW50aW1lLCBjYWNoZSk6IHN0cmluZ1xuXHR7XG5cdFx0aWYgKCFyZXQpXG5cdFx0e1xuXHRcdFx0cmV0dXJuICcnO1xuXHRcdH1cblxuXHRcdHRyeVxuXHRcdHtcblx0XHRcdGxldCBodG1sID0gbWluaWZ5SFRNTChyZXQuZG9tLiQoJy5jb250YWluZXIgLnJvdzpoYXMoLmZvcnVtLWNvbnRlbnQpJykuaHRtbCgpKTtcblxuXHRcdFx0cmV0LmRvbS4kKCcuY29udGFpbmVyIC5yb3c6aGFzKC5mb3J1bS1jb250ZW50KScpLmh0bWwoaHRtbCk7XG5cdFx0fVxuXHRcdGNhdGNoIChlKVxuXHRcdHtcblxuXHRcdH1cblxuXHRcdHJldC5kb20uJCgncFtjbGFzc106aGFzKD4gc2NyaXB0KSwgLmFkc2J5Z29vZ2xlJykucmVtb3ZlKCk7XG5cblx0XHRfcF8yX2JyKCcuZm9ydW0tY29udGVudCA+IHAnLCByZXQuZG9tLiQpO1xuXG5cdFx0bGV0IGVsZW0gPSByZXQuZG9tLiQoJy5jb250YWluZXIgLmZvcnVtLWNvbnRlbnQnKTtcblxuXHRcdGVsZW0uaHRtbChmdW5jdGlvbiAoaSwgb2xkOiBzdHJpbmcpXG5cdFx0e1xuXHRcdFx0cmV0dXJuIG9sZFxuXHRcdFx0XHQucmVwbGFjZSgvKFxcPGJyXFw+KXszLDR9L2csICckMScpXG5cdFx0XHRcdC5yZXBsYWNlKC8oPzw9XFw8YnJcXD4pKD89W15cXG5dKS9nLCAnXFxuJylcblx0XHR9KTtcblxuXHRcdGxldCB0aXRsZSA9IHRyaW0ocmV0LmRvbS4kKCcuY29udGFpbmVyIC5yb3cgPiBkaXYgPiBoMycpLnRleHQoKSk7XG5cblx0XHRsZXQgdHh0OiBzdHJpbmcgPSBlbGVtXG5cdFx0XHQudGV4dCgpXG5cdFx0XHQucmVwbGFjZSgvXig/OueUseaWvOeZvuW6plxccypcXGQrXFxzKuW5tOS7peWJjeeahOiyvOaWh+mDveWIquS6hnzmiYDku6XkuI3muIXmpZrmmK/nlLHlk6rkvY3lpKfkvaznv7vora986Iul6L2J6LyJ55qE5YuV5L2c5YaS54qv5LqG5oKo77yM5YWI6Lef5oKo6Kqq6IGy5oqx5q2J77yBfOS5n+m6u+eFqeeVmeiogOWRiuefpe+8jOaIkeWAkeacg+Wwh+atpOaWh+S4i+aetnzlt7I/55SxP+itr+iAheaOiOasiui9iei8ie+8gT985Y6f5paH57ay5Z2A77yaW15cXG5dK3zovYnovInoh6rosrzlkKcpJC91aWdtLCAnJylcblx0XHRcdC5yZXBsYWNlKC9eXFxzK3xcXHMrJC9nLCAnJylcblx0XHQ7XG5cblx0XHRpZiAodHh0LmluZGV4T2YodGl0bGUgKyAnXFxuJykgPT09IDApXG5cdFx0e1xuXHRcdFx0dHh0ID0gdHh0LnNsaWNlKHRpdGxlLmxlbmd0aCArIDEpXG5cdFx0XHRcdC5yZXBsYWNlKC9eXFxuKy9nLCAnJylcblx0XHRcdDtcblx0XHR9XG5cblx0XHRsZXQgaHRtbCA9IGVsZW0uaHRtbCgpO1xuXG4vL1x0XHR0aHJvdyBjb25zb2xlLmRpcih7XG4vL1x0XHRcdGh0bWwsXG4vL1x0XHRcdHR4dCxcbi8vXHRcdH0pO1xuXG5cdFx0cmV0dXJuIHR4dFxuXHR9XG5cblx0YXN5bmMgZ2V0X3ZvbHVtZV9saXN0PFQgZXh0ZW5kcyBJT3B0aW9uc1J1bnRpbWU+KHVybDogc3RyaW5nIHwgVVJMLFxuXHRcdG9wdGlvbnNSdW50aW1lOiBQYXJ0aWFsPFQgJiBJRG93bmxvYWRPcHRpb25zPiA9IHt9LFxuXHQpOiBQcm9taXNlPElOb3ZlbD5cblx0e1xuXHRcdGNvbnN0IHNlbGYgPSB0aGlzO1xuXG5cdFx0dXJsID0gYXdhaXQgdGhpcy5jcmVhdGVNYWluVXJsKHVybCBhcyBhbnkpO1xuXG5cdFx0cmV0dXJuIGZyb21VUkwodXJsLCBvcHRpb25zUnVudGltZS5vcHRpb25zSlNET00pXG5cdFx0XHQudGhlbihhc3luYyBmdW5jdGlvbiAoZG9tOiBJSlNET00pXG5cdFx0XHR7XG5cdFx0XHRcdGNvbnN0ICQgPSBkb20uJDtcblxuXHRcdFx0XHR0cnlcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGxldCBodG1sID0gbWluaWZ5SFRNTChkb20uJCgnLnByb2R1Y3QtZGV0YWlsJykuaHRtbCgpKTtcblxuXHRcdFx0XHRcdGRvbS4kKCcucHJvZHVjdC1kZXRhaWwnKS5odG1sKGh0bWwpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGNhdGNoIChlKVxuXHRcdFx0XHR7XG5cblx0XHRcdFx0fVxuXG5cdFx0XHRcdGxldCBub3ZlbF90aXRsZSA9IGRvbS4kKCcuY29udGFpbmVyIC5yb3cgPiBkaXYgPiBoMycpLnRleHQoKTtcblxuXHRcdFx0XHRsZXQgbm92ZWxfcHVibGlzaGVyID0gc2VsZi5JREtFWTtcblxuXHRcdFx0XHRsZXQgdXJsX2RhdGEgPSBzZWxmLnBhcnNlVXJsKGRvbS51cmwuaHJlZik7XG5cblx0XHRcdFx0bGV0IHZvbHVtZV9saXN0ID0gW10gYXMgTm92ZWxTaXRlLklWb2x1bWVbXTtcblxuXHRcdFx0XHRjb25zdCBub3ZlbFRyZWUgPSBvcHRpb25zUnVudGltZS5ub3ZlbFRyZWU7XG5cdFx0XHRcdGxldCBjdXJyZW50Vm9sdW1lOiBUcmVlTm9kZTxJUm93Vm9sdW1lPjtcblxuXHRcdFx0XHRsZXQgdGFibGUgPSBkb20uJCgnLnByb2R1Y3QtZGV0YWlsIC50YWJiYWJsZSAudGFiLWNvbnRlbnQuc2hvdy1kZXNjJykuZmluZCgnYScpO1xuXG5cdFx0XHRcdGxldCBfY2FjaGVfZGF0ZXMgPSBbXTtcblxuXHRcdFx0XHRsZXQgdG90YWxfaWR4ID0gMDtcblxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0bGV0IHZvbHVtZV90aXRsZSA9ICdudWxsJztcblx0XHRcdFx0XHRsZXQgdm9sdW1lX2xldmVsID0gbnVsbDtcblxuXHRcdFx0XHRcdGN1cnJlbnRWb2x1bWUgPSBub3ZlbFRyZWUuYWRkVm9sdW1lKHtcblx0XHRcdFx0XHRcdHZvbHVtZV90aXRsZSxcblx0XHRcdFx0XHRcdHZvbHVtZV9sZXZlbCxcblx0XHRcdFx0XHRcdHZvbHVtZV9pbmRleDogbm92ZWxUcmVlLnJvb3QoKS5zaXplKCksXG5cdFx0XHRcdFx0XHR0b3RhbF9pZHg6IHRvdGFsX2lkeCsrLFxuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0ZG9tLiQoJ3BbY2xhc3NdOmhhcyg+IHNjcmlwdFtzcmMqPWdvb2dsZV0pLCBkaXZbY2xhc3NdOmhhcyg+IHNjcmlwdFtzcmMqPWdvb2dsZV0pLCAuYWRzYnlnb29nbGUnKS5yZW1vdmUoKTtcblxuXHRcdFx0XHR0YWJsZVxuXHRcdFx0XHRcdC5lYWNoKGZ1bmN0aW9uIChpbmRleCwgZWxlbSlcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRsZXQgdHIgPSBkb20uJChlbGVtKTtcblxuXHRcdFx0XHRcdFx0aWYgKDEpXG5cdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdGxldCBhID0gdHI7XG5cdFx0XHRcdFx0XHRcdGxldCBjaGFwdGVyX3RpdGxlID0gdHJpbShhLnRleHQoKSwgdHJ1ZSk7XG5cblx0XHRcdFx0XHRcdFx0bGV0IGhyZWYgPSBhLnByb3AoJ2hyZWYnKTtcblxuXHRcdFx0XHRcdFx0XHRsZXQgZGF0YSA9IHNlbGYucGFyc2VVcmwoaHJlZik7XG5cblx0XHRcdFx0XHRcdFx0aWYgKCFkYXRhLmNoYXB0ZXJfaWQpXG5cdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHRyZXR1cm47XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0ZWxzZVxuXHRcdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdFx0aHJlZiA9IHNlbGYubWFrZVVybChkYXRhKTtcblxuXHRcdFx0XHRcdFx0XHRcdGRhdGEudXJsID0gaHJlZjtcblx0XHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHRcdGxldCBjaGFwdGVyID0ge1xuXHRcdFx0XHRcdFx0XHRcdGNoYXB0ZXJfdGl0bGUsXG5cdFx0XHRcdFx0XHRcdFx0Y2hhcHRlcl9pZDogZGF0YS5jaGFwdGVyX2lkLFxuXHRcdFx0XHRcdFx0XHRcdGNoYXB0ZXJfdXJsOiBocmVmLFxuXHRcdFx0XHRcdFx0XHRcdGNoYXB0ZXJfdXJsX2RhdGE6IGRhdGEsXG5cdFx0XHRcdFx0XHRcdFx0Y2hhcHRlcl9pbmRleDogY3VycmVudFZvbHVtZS5zaXplKCksXG5cdFx0XHRcdFx0XHRcdFx0dG90YWxfaWR4OiB0b3RhbF9pZHgrKyxcblx0XHRcdFx0XHRcdFx0fTtcblxuXHRcdFx0XHRcdFx0XHRub3ZlbFRyZWUuYWRkQ2hhcHRlcihjaGFwdGVyLCBjdXJyZW50Vm9sdW1lKVxuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH0pXG5cdFx0XHRcdDtcblxuXHRcdFx0XHRsZXQgZGF0YV9tZXRhOiBJTWRjb25mTWV0YSA9IHt9O1xuXG5cdFx0XHRcdHJldHVybiB7XG5cblx0XHRcdFx0XHQuLi5kYXRhX21ldGEsXG5cblx0XHRcdFx0XHR1cmw6IGRvbS51cmwsXG5cdFx0XHRcdFx0dXJsX2RhdGEsXG5cblx0XHRcdFx0XHRub3ZlbF90aXRsZSxcblx0XHRcdFx0XHRub3ZlbF9wdWJsaXNoZXIsXG5cblx0XHRcdFx0XHQvL3ZvbHVtZV9saXN0LFxuXHRcdFx0XHRcdG5vdmVsVHJlZSxcblxuXHRcdFx0XHRcdGNoZWNrZGF0ZTogbW9tZW50KCkubG9jYWwoKSxcblxuXHRcdFx0XHRcdGltZ3M6IFtdIGFzIHN0cmluZ1tdLFxuXHRcdFx0XHR9IGFzIElOb3ZlbDtcblx0XHRcdH0pXG5cdFx0XHQ7XG5cdH1cblxufVxuXG5leHBvcnQgZGVmYXVsdCBOb3ZlbFNpdGVFU0pab25lO1xuXG5mdW5jdGlvbiBfcF8yX2JyKHRhcmdldCwgJClcbntcblx0cmV0dXJuICQodGFyZ2V0KVxuXHRcdC5lYWNoKGZ1bmN0aW9uIChpLCBlbGVtKVxuXHRcdHtcblx0XHRcdGxldCBfdGhpcyA9ICQoZWxlbSk7XG5cblx0XHRcdGxldCBfaHRtbCA9IF90aGlzXG5cdFx0XHRcdC5odG1sKClcblx0XHRcdFx0LnJlcGxhY2UoLyg/OiZuYnNwOz8pL2csICcgJylcblx0XHRcdFx0LnJlcGxhY2UoL1tcXHhBMFxcc10rJC9nLCAnJylcblx0XHRcdDtcblxuXHRcdFx0aWYgKF9odG1sID09ICc8YnIvPicgfHwgX2h0bWwgPT0gJzxicj4nKVxuXHRcdFx0e1xuXHRcdFx0XHRfaHRtbCA9ICcnO1xuXHRcdFx0fVxuXG5cdFx0XHRfdGhpcy5hZnRlcihgJHtfaHRtbH08YnIvPmApO1xuXHRcdFx0X3RoaXMucmVtb3ZlKClcblx0XHR9KVxuXHRcdDtcbn0iXX0=