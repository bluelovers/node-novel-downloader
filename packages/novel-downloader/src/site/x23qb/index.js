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
exports.NovelSiteX23qb = void 0;
const util_1 = require("../../util");
const tree_1 = require("../demo/tree");
const jsdom_extra_1 = require("jsdom-extra");
//import { URL } from 'jsdom-url';
const index_1 = require("../index");
const index_2 = require("../index");
const fetch_1 = require("../../fetch");
const regexp_cjk_1 = require("regexp-cjk");
const util_2 = require("./util");
const util_3 = require("../esjzone/util");
/**
 * 铅笔小说
 * @example https://www.x23qb.com/book/284/
 */
let NovelSiteX23qb = /** @class */ (() => {
    let NovelSiteX23qb = class NovelSiteX23qb extends tree_1.default {
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
                    let elems = $('.trans');
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
            try {
                let html = util_1.minifyHTML($('#mlfy_main_text').html());
                $('#mlfy_main_text').html(html);
            }
            catch (e) {
            }
            let elem = ret.dom.$('#TextContent');
            elem
                .find('> .tp, > .ke, > .rd, > .bd, script')
                .remove();
            util_3._p_2_br(elem.find('p'), ret.dom.$);
            elem.html(function (i, old) {
                return old
                    .replace(/(\<br\>){3,4}/g, '$1')
                    .replace(/(?<=\<br\>)(?=[^\n])/g, '\n');
            });
            let title = util_1.trim(ret.dom.$('mlfy_main_text > h1:eq(0)').text());
            if (!this._cache_re) {
                this._cache_re = new regexp_cjk_1.zhRegExp(/^(?:鉛\s*筆\s*小\s*說\(w\s*w\s*w\s*\.\s*x\s*2\s*3\s*q\s*b\s*\.\s*c\s*o\s*m\))$/uigm);
            }
            let txt = elem
                .text()
                .replace(this._cache_re, '')
                .replace(/^\s+|\s+$/g, '')
                .replace(/^[ \xA0]+|[ \xA0]+$/gm, '');
            return txt;
        }
        async get_volume_list(url, optionsRuntime = {}) {
            const self = this;
            url = await this.createMainUrl(url, optionsRuntime);
            return jsdom_extra_1.fromURL(url, optionsRuntime.optionsJSDOM)
                .then(async function (dom) {
                const $ = dom.$;
                let novel_title = dom.$('.d_title h1').text();
                let novel_publisher = self.IDKEY;
                let url_data = self.parseUrl(dom.url.href);
                let novel_desc = $('#bookintro > p:eq(0)').text();
                let volume_list = [];
                const novelTree = optionsRuntime.novelTree;
                let currentVolume;
                let table = $('#chapterList li')
                    .find('a');
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
                    novel: {
                        tags: [],
                    },
                };
                let novel_date = index_2.moment($('#uptime > span').text());
                let tag = $('.bookright #count li:eq(0) span:eq(0)').text().trim();
                if (tag) {
                    data_meta.novel.tags.push(tag);
                }
                let novel_author = $('.p_author a:eq(0)').text().trim();
                data_meta.link = data_meta.link || [];
                data_meta.link.push($('.p_author a:eq(0)').prop('href'));
                $('.bookright #count li span')
                    .each((i, elem) => {
                    let txt = $(elem).text().trim();
                    let bool = [
                        '完結済',
                        '完結',
                        '已完結',
                        '已完成',
                        '完结済',
                        '完结',
                        '已完结',
                        '已完成',
                    ].includes(txt);
                    if (bool) {
                        data_meta.novel.status = txt;
                    }
                });
                return Object.assign(Object.assign({}, data_meta), { url: dom.url, url_data,
                    novel_title,
                    novel_publisher,
                    novel_author,
                    novel_date,
                    novel_desc,
                    //volume_list,
                    novelTree, checkdate: index_2.moment().local(), imgs: [] });
            });
        }
    };
    NovelSiteX23qb.IDKEY = 'x23qb';
    NovelSiteX23qb = __decorate([
        index_1.staticImplements()
    ], NovelSiteX23qb);
    return NovelSiteX23qb;
})();
exports.NovelSiteX23qb = NovelSiteX23qb;
exports.default = NovelSiteX23qb;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7O0dBRUc7Ozs7Ozs7OztBQUVILHFDQUE4QztBQUM5Qyx1Q0FBdUc7QUFPdkcsNkNBQStEO0FBRS9ELGtDQUFrQztBQUVsQyxvQ0FBMEY7QUFFMUYsb0NBQWtDO0FBQ2xDLHVDQUEyQztBQUMzQywyQ0FBc0M7QUFDdEMsaUNBQWtEO0FBQ2xELDBDQUEwQztBQUUxQzs7O0dBR0c7QUFFSDtJQUFBLElBQWEsY0FBYyxHQUEzQixNQUFhLGNBQWUsU0FBUSxjQUFhO1FBaUJoRCxNQUFNLENBQUMsS0FBSyxDQUFDLEdBQXVDLEVBQUUsR0FBRyxJQUFJO1lBRTVELE9BQU8sWUFBSyxDQUFDLEdBQUcsRUFBRSxHQUFHLElBQUksQ0FBQyxDQUFDO1FBQzVCLENBQUM7UUFFRCxNQUFNLENBQUMsT0FBTyxDQUFDLE1BQTJCLEVBQUUsSUFBdUIsRUFBRSxHQUFHLElBQUk7WUFFM0UsT0FBTyxjQUFPLENBQUMsTUFBTSxFQUFFLElBQUksRUFBRSxHQUFHLElBQUksQ0FBQyxDQUFBO1FBQ3RDLENBQUM7UUFFRCxNQUFNLENBQUMsUUFBUSxDQUFDLEdBQTBCLEVBQUUsR0FBRyxJQUFJO1lBRWxELE9BQU8sZUFBUSxDQUFDLEdBQUcsRUFBRSxHQUFHLElBQUksQ0FBQyxDQUFDO1FBQy9CLENBQUM7UUFFRCxPQUFPLENBQUMsTUFBMkIsRUFBRSxJQUF1QixFQUFFLEdBQUcsSUFBSTtZQUVwRSxPQUFPLGNBQU8sQ0FBQyxNQUFNLEVBQUUsSUFBSSxFQUFFLEdBQUcsSUFBSSxDQUFDLENBQUE7UUFDdEMsQ0FBQztRQUVELFFBQVEsQ0FBQyxHQUEwQixFQUFFLEdBQUcsSUFBSTtZQUUzQyxPQUFPLGVBQVEsQ0FBQyxHQUFHLEVBQUUsR0FBRyxJQUFJLENBQUMsQ0FBQztRQUMvQixDQUFDO1FBRVMsS0FBSyxDQUFDLGNBQWMsQ0FBSSxHQUFrQixFQUFF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TCxJQUFJO3dCQUNKLEtBQUs7d0JBQ0wsS0FBSzt3QkFDTCxLQUFLO3dCQUNMLElBQUk7d0JBQ0osS0FBSzt3QkFDTCxLQUFLO3FCQUNMLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUNkO29CQUVELElBQUksSUFBSSxFQUNSO3dCQUNDLFNBQVMsQ0FBQyxLQUFLLENBQUMsTUFBTSxHQUFHLEdBQUcsQ0FBQztxQkFDN0I7Z0JBRUYsQ0FBQyxDQUFDLENBQ0Y7Z0JBRUQsT0FBTyxnQ0FFSCxTQUFTLEtBRVosR0FBRyxFQUFFLEdBQUcsQ0FBQyxHQUFHLEVBQ1osUUFBUTtvQkFFUixXQUFXO29CQUNYLGVBQWU7b0JBRWYsWUFBWTtvQkFFWixVQUFVO29CQUVWLFVBQVU7b0JBRVYsY0FBYztvQkFDZCxTQUFTLEVBRVQsU0FBUyxFQUFFLGNBQU0sRUFBRSxDQUFDLEtBQUssRUFBRSxFQUUzQixJQUFJLEVBQUUsRUFBYyxHQUNWLENBQUM7WUFDYixDQUFDLENBQUMsQ0FDRDtRQUNILENBQUM7S0FFRCxDQUFBO0lBalR1QixvQkFBSyxHQUFHLE9BQU8sQ0FBQztJQUYzQixjQUFjO1FBRDFCLHdCQUFnQixFQUE4QztPQUNsRCxjQUFjLENBbVQxQjtJQUFELHFCQUFDO0tBQUE7QUFuVFksd0NBQWM7QUFxVDNCLGtCQUFlLGNBQWMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ3JlYXRlZCBieSB1c2VyIG9uIDIwMTgvMy8xNy8wMTcuXG4gKi9cblxuaW1wb3J0IHsgbWluaWZ5SFRNTCwgdHJpbSB9IGZyb20gJy4uLy4uL3V0aWwnO1xuaW1wb3J0IE5vdmVsU2l0ZURlbW8sIHsgSURvd25sb2FkT3B0aW9ucywgSU5vdmVsLCBJT3B0aW9uc1J1bnRpbWUsIElGZXRjaENoYXB0ZXIgfSBmcm9tICcuLi9kZW1vL3RyZWUnO1xuaW1wb3J0IHsgSVJvd1ZvbHVtZSwgVHJlZU5vZGUgfSBmcm9tICcuLi8uLi90cmVlL2luZGV4JztcblxuaW1wb3J0IGZzID0gcmVxdWlyZSgnZnMtZXh0cmEnKTtcbmltcG9ydCB7IHRyaW1GaWxlbmFtZSB9IGZyb20gJ2ZzLWljb252L3V0aWwnO1xuaW1wb3J0ICogYXMgcGF0aCBmcm9tICd1cGF0aDInO1xuaW1wb3J0IG5vdmVsSW5mbywgeyBJTWRjb25mTWV0YSB9IGZyb20gJ25vZGUtbm92ZWwtaW5mbyc7XG5pbXBvcnQgeyBmcm9tVVJMLCBJRnJvbVVybE9wdGlvbnMsIElKU0RPTSB9IGZyb20gJ2pzZG9tLWV4dHJhJztcblxuLy9pbXBvcnQgeyBVUkwgfSBmcm9tICdqc2RvbS11cmwnO1xuXG5pbXBvcnQgTm92ZWxTaXRlLCB7IHN0YXRpY0ltcGxlbWVudHMsIGRlZmF1bHRKU0RPTU9wdGlvbnMsIFNZTUJPTF9DQUNIRSB9IGZyb20gJy4uL2luZGV4JztcbmltcG9ydCB7IFByb21pc2VCbHVlYmlyZCwgYmx1ZWJpcmREZWNvcmF0b3IgfSBmcm9tICcuLi9pbmRleCc7XG5pbXBvcnQgeyBtb21lbnQgfSBmcm9tICcuLi9pbmRleCc7XG5pbXBvcnQgeyByZXRyeVJlcXVlc3QgfSBmcm9tICcuLi8uLi9mZXRjaCc7XG5pbXBvcnQgeyB6aFJlZ0V4cCB9IGZyb20gJ3JlZ2V4cC1jamsnO1xuaW1wb3J0IHsgcGFyc2VVcmwsIG1ha2VVcmwsIGNoZWNrIH0gZnJvbSAnLi91dGlsJztcbmltcG9ydCB7IF9wXzJfYnIgfSBmcm9tICcuLi9lc2p6b25lL3V0aWwnO1xuXG4vKipcbiAqIOmTheeslOWwj+ivtFxuICogQGV4YW1wbGUgaHR0cHM6Ly93d3cueDIzcWIuY29tL2Jvb2svMjg0L1xuICovXG5Ac3RhdGljSW1wbGVtZW50czxOb3ZlbFNpdGUuSU5vdmVsU2l0ZVN0YXRpYzxOb3ZlbFNpdGVYMjNxYj4+KClcbmV4cG9ydCBjbGFzcyBOb3ZlbFNpdGVYMjNxYiBleHRlbmRzIE5vdmVsU2l0ZURlbW9cbntcblx0cHVibGljIHN0YXRpYyByZWFkb25seSBJREtFWSA9ICd4MjNxYic7XG5cblx0Lypcblx0cHJvdGVjdGVkIF9maXhPcHRpb25zUnVudGltZShvcHRpb25zUnVudGltZSlcblx0e1xuXHRcdG9wdGlvbnNSdW50aW1lLm9wdGlvbnNKU0RPTSA9IG9wdGlvbnNSdW50aW1lLm9wdGlvbnNKU0RPTSB8fCB7fTtcblxuXHRcdC8vb3B0aW9uc1J1bnRpbWUub3B0aW9uc0pTRE9NLnJ1blNjcmlwdHMgPSAnZGFuZ2Vyb3VzbHknO1xuXG5cdFx0cmV0dXJuIHN1cGVyLl9maXhPcHRpb25zUnVudGltZShvcHRpb25zUnVudGltZSlcblx0fVxuXHQgKi9cblxuXHRwcm90ZWN0ZWQgX2NhY2hlX3JlOiBSZWdFeHA7XG5cblx0c3RhdGljIGNoZWNrKHVybDogc3RyaW5nIHwgVVJMIHwgTm92ZWxTaXRlLklQYXJzZVVybCwgLi4uYXJndik6IGJvb2xlYW5cblx0e1xuXHRcdHJldHVybiBjaGVjayh1cmwsIC4uLmFyZ3YpO1xuXHR9XG5cblx0c3RhdGljIG1ha2VVcmwodXJsb2JqOiBOb3ZlbFNpdGUuSVBhcnNlVXJsLCBib29sPzogYm9vbGVhbiB8IG51bWJlciwgLi4uYXJndilcblx0e1xuXHRcdHJldHVybiBtYWtlVXJsKHVybG9iaiwgYm9vbCwgLi4uYXJndilcblx0fVxuXG5cdHN0YXRpYyBwYXJzZVVybCh1cmw6IHN0cmluZyB8IFVSTCB8IG51bWJlciwgLi4uYXJndilcblx0e1xuXHRcdHJldHVybiBwYXJzZVVybCh1cmwsIC4uLmFyZ3YpO1xuXHR9XG5cblx0bWFrZVVybCh1cmxvYmo6IE5vdmVsU2l0ZS5JUGFyc2VVcmwsIGJvb2w/OiBib29sZWFuIHwgbnVtYmVyLCAuLi5hcmd2KVxuXHR7XG5cdFx0cmV0dXJuIG1ha2VVcmwodXJsb2JqLCBib29sLCAuLi5hcmd2KVxuXHR9XG5cblx0cGFyc2VVcmwodXJsOiBzdHJpbmcgfCBVUkwgfCBudW1iZXIsIC4uLmFyZ3YpXG5cdHtcblx0XHRyZXR1cm4gcGFyc2VVcmwodXJsLCAuLi5hcmd2KTtcblx0fVxuXG5cdHByb3RlY3RlZCBhc3luYyBfZGVjb2RlQ2hhcHRlcjxUPihyZXQ6IElGZXRjaENoYXB0ZXIsIG9wdGlvbnNSdW50aW1lOiBUICYgSU9wdGlvbnNSdW50aW1lLCBjYWNoZSlcblx0e1xuXHRcdGNvbnN0IHsgZG9tIH0gPSByZXQ7XG5cdFx0Y29uc3QgeyAkIH0gPSBkb207XG5cblx0XHRsZXQgaHRtbCA9IGRvbS5zZXJpYWxpemUoKTtcblxuXHRcdGxldCBtID0gaHRtbFxuXHRcdFx0Lm1hdGNoKC9nZXRUcmFuc2xhdGlvblxcKFsnXCJdKFteXFwnXCJdKylbJ1wiXS9pKVxuXHRcdDtcblxuXHRcdGlmIChtKVxuXHRcdHtcblx0XHRcdGxldCBjb2RlID0gbVsxXTtcblxuXHRcdFx0YXdhaXQgcmV0cnlSZXF1ZXN0KHJldC51cmwsIHtcblx0XHRcdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdFx0XHQuLi5vcHRpb25zUnVudGltZS5yZXF1ZXN0T3B0aW9ucyxcblx0XHRcdFx0bWV0aG9kOiAnUE9TVCcsXG5cdFx0XHRcdGZvcm06IHtcblx0XHRcdFx0XHRwbHhmOiAnZ2V0VHJhbnNsYXRpb24nLFxuXHRcdFx0XHRcdHBseGE6IFtjb2RlXSxcblx0XHRcdFx0fSxcblx0XHRcdH0pXG5cdFx0XHRcdC50aGVuKCh2OiBzdHJpbmcpID0+IHtcblx0XHRcdFx0XHR2ID0gdlxuXHRcdFx0XHRcdFx0LnJlcGxhY2UoL1xcPEppbkppbmdcXD4vLCAnJylcblx0XHRcdFx0XHRcdC5yZXBsYWNlKC9cXDxcXC9KaW5KaW5nXFw+LywgJycpXG5cdFx0XHRcdFx0O1xuXG5cdFx0XHRcdFx0cmV0dXJuIEpTT04ucGFyc2Uodilcblx0XHRcdFx0fSlcblx0XHRcdFx0Lypcblx0XHRcdFx0LnRhcCh2ID0+IHtcblx0XHRcdFx0XHRjb25zb2xlLmRpcignLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0nKVxuXHRcdFx0XHRcdGNvbnNvbGUuZGlyKHYpXG5cdFx0XHRcdFx0Y29uc29sZS5kaXIoJy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tJylcblx0XHRcdFx0fSlcblx0XHRcdFx0ICovXG5cdFx0XHRcdC50YXAoKGE6IHN0cmluZ1tdKSA9PiB7XG5cblx0XHRcdFx0XHRsZXQgZWxlbXMgPSAkKCcudHJhbnMnKTtcblxuXHRcdFx0XHRcdGEuZm9yRWFjaCgodiwgaSkgPT4ge1xuXHRcdFx0XHRcdFx0ZWxlbXMuZXEoaSkuaHRtbCh2KTtcblx0XHRcdFx0XHR9KVxuXG5cdFx0XHRcdH0pXG5cdFx0XHQ7XG5cblx0XHR9XG5cblx0XHQvL2NvbnNvbGUuZGlyKG0pO1xuXHRcdC8vcHJvY2Vzcy5leGl0KCk7XG5cdH1cblxuXHRwcm90ZWN0ZWQgYXN5bmMgX3BhcnNlQ2hhcHRlcjxUPihyZXQsIG9wdGlvbnNSdW50aW1lLCBjYWNoZSlcblx0e1xuXHRcdGlmICghcmV0KVxuXHRcdHtcblx0XHRcdHJldHVybiAnJztcblx0XHR9XG5cblx0XHR0cnlcblx0XHR7XG5cdFx0XHRsZXQgaHRtbCA9IG1pbmlmeUhUTUwoJCgnI21sZnlfbWFpbl90ZXh0JykuaHRtbCgpKTtcblxuXHRcdFx0JCgnI21sZnlfbWFpbl90ZXh0JykuaHRtbChodG1sKTtcblx0XHR9XG5cdFx0Y2F0Y2ggKGUpXG5cdFx0e1xuXG5cdFx0fVxuXG5cdFx0bGV0IGVsZW0gPSByZXQuZG9tLiQoJyNUZXh0Q29udGVudCcpO1xuXG5cdFx0ZWxlbVxuXHRcdFx0LmZpbmQoJz4gLnRwLCA+IC5rZSwgPiAucmQsID4gLmJkLCBzY3JpcHQnKVxuXHRcdFx0LnJlbW92ZSgpXG5cdFx0O1xuXG5cdFx0X3BfMl9icihlbGVtLmZpbmQoJ3AnKSwgcmV0LmRvbS4kKTtcblxuXHRcdGVsZW0uaHRtbChmdW5jdGlvbiAoaSwgb2xkOiBzdHJpbmcpXG5cdFx0e1xuXHRcdFx0cmV0dXJuIG9sZFxuXHRcdFx0XHQucmVwbGFjZSgvKFxcPGJyXFw+KXszLDR9L2csICckMScpXG5cdFx0XHRcdC5yZXBsYWNlKC8oPzw9XFw8YnJcXD4pKD89W15cXG5dKS9nLCAnXFxuJylcblx0XHR9KTtcblxuXHRcdGxldCB0aXRsZSA9IHRyaW0ocmV0LmRvbS4kKCdtbGZ5X21haW5fdGV4dCA+IGgxOmVxKDApJykudGV4dCgpKTtcblxuXG5cdFx0aWYgKCF0aGlzLl9jYWNoZV9yZSlcblx0XHR7XG5cdFx0XHR0aGlzLl9jYWNoZV9yZSA9IG5ldyB6aFJlZ0V4cCgvXig/OumJm1xccyrnrYZcXHMq5bCPXFxzKuiqqlxcKHdcXHMqd1xccyp3XFxzKlxcLlxccyp4XFxzKjJcXHMqM1xccypxXFxzKmJcXHMqXFwuXFxzKmNcXHMqb1xccyptXFwpKSQvdWlnbSlcblx0XHR9XG5cblx0XHRsZXQgdHh0OiBzdHJpbmcgPSBlbGVtXG5cdFx0XHQudGV4dCgpXG5cdFx0XHQucmVwbGFjZSh0aGlzLl9jYWNoZV9yZSwgJycpXG5cdFx0XHQucmVwbGFjZSgvXlxccyt8XFxzKyQvZywgJycpXG5cdFx0XHQucmVwbGFjZSgvXlsgXFx4QTBdK3xbIFxceEEwXSskL2dtLCAnJylcblx0XHQ7XG5cblx0XHRyZXR1cm4gdHh0IGFzIHN0cmluZ1xuXHR9XG5cblx0YXN5bmMgZ2V0X3ZvbHVtZV9saXN0PFQgZXh0ZW5kcyBJT3B0aW9uc1J1bnRpbWU+KHVybDogc3RyaW5nIHwgVVJMLFxuXHRcdG9wdGlvbnNSdW50aW1lOiBQYXJ0aWFsPFQgJiBJRG93bmxvYWRPcHRpb25zPiA9IHt9LFxuXHQpOiBQcm9taXNlPElOb3ZlbD5cblx0e1xuXHRcdGNvbnN0IHNlbGYgPSB0aGlzO1xuXG5cdFx0dXJsID0gYXdhaXQgdGhpcy5jcmVhdGVNYWluVXJsKHVybCBhcyBhbnksIG9wdGlvbnNSdW50aW1lKTtcblxuXHRcdHJldHVybiBmcm9tVVJMKHVybCwgb3B0aW9uc1J1bnRpbWUub3B0aW9uc0pTRE9NKVxuXHRcdFx0LnRoZW4oYXN5bmMgZnVuY3Rpb24gKGRvbTogSUpTRE9NKVxuXHRcdFx0e1xuXHRcdFx0XHRjb25zdCAkID0gZG9tLiQ7XG5cblx0XHRcdFx0bGV0IG5vdmVsX3RpdGxlID0gZG9tLiQoJy5kX3RpdGxlIGgxJykudGV4dCgpO1xuXG5cdFx0XHRcdGxldCBub3ZlbF9wdWJsaXNoZXIgPSBzZWxmLklES0VZO1xuXG5cdFx0XHRcdGxldCB1cmxfZGF0YSA9IHNlbGYucGFyc2VVcmwoZG9tLnVybC5ocmVmKTtcblxuXHRcdFx0XHRsZXQgbm92ZWxfZGVzYyA9ICQoJyNib29raW50cm8gPiBwOmVxKDApJykudGV4dCgpO1xuXG5cdFx0XHRcdGxldCB2b2x1bWVfbGlzdCA9IFtdIGFzIE5vdmVsU2l0ZS5JVm9sdW1lW107XG5cblx0XHRcdFx0Y29uc3Qgbm92ZWxUcmVlID0gb3B0aW9uc1J1bnRpbWUubm92ZWxUcmVlO1xuXHRcdFx0XHRsZXQgY3VycmVudFZvbHVtZTogVHJlZU5vZGU8SVJvd1ZvbHVtZT47XG5cblx0XHRcdFx0bGV0IHRhYmxlID0gJCgnI2NoYXB0ZXJMaXN0IGxpJylcblx0XHRcdFx0XHQuZmluZCgnYScpXG5cdFx0XHRcdDtcblxuXHRcdFx0XHRsZXQgX2NhY2hlX2RhdGVzID0gW107XG5cblx0XHRcdFx0bGV0IHRvdGFsX2lkeCA9IDA7XG5cblx0XHRcdFx0e1xuXHRcdFx0XHRcdGxldCB2b2x1bWVfdGl0bGUgPSAnbnVsbCc7XG5cdFx0XHRcdFx0bGV0IHZvbHVtZV9sZXZlbCA9IG51bGw7XG5cblx0XHRcdFx0XHRjdXJyZW50Vm9sdW1lID0gbm92ZWxUcmVlLmFkZFZvbHVtZSh7XG5cdFx0XHRcdFx0XHR2b2x1bWVfdGl0bGUsXG5cdFx0XHRcdFx0XHR2b2x1bWVfbGV2ZWwsXG5cdFx0XHRcdFx0XHR2b2x1bWVfaW5kZXg6IG5vdmVsVHJlZS5yb290KCkuc2l6ZSgpLFxuXHRcdFx0XHRcdFx0dG90YWxfaWR4OiB0b3RhbF9pZHgrKyxcblx0XHRcdFx0XHR9KTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdHRhYmxlXG5cdFx0XHRcdFx0LmVhY2goZnVuY3Rpb24gKGluZGV4LCBlbGVtKVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdGxldCB0ciA9IGRvbS4kKGVsZW0pO1xuXG5cdFx0XHRcdFx0XHRpZiAoMSlcblx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0bGV0IGEgPSB0cjtcblx0XHRcdFx0XHRcdFx0bGV0IGNoYXB0ZXJfdGl0bGUgPSB0cmltKGEudGV4dCgpLCB0cnVlKTtcblxuXHRcdFx0XHRcdFx0XHRsZXQgaHJlZiA9IGEucHJvcCgnaHJlZicpO1xuXG5cdFx0XHRcdFx0XHRcdGxldCBkYXRhID0gc2VsZi5wYXJzZVVybChocmVmKTtcblxuXHRcdFx0XHRcdFx0XHRpZiAoIWRhdGEuY2hhcHRlcl9pZClcblx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdHJldHVybjtcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRlbHNlXG5cdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHRocmVmID0gc2VsZi5tYWtlVXJsKGRhdGEpO1xuXG5cdFx0XHRcdFx0XHRcdFx0ZGF0YS51cmwgPSBocmVmO1xuXHRcdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdFx0bGV0IGNoYXB0ZXIgPSB7XG5cdFx0XHRcdFx0XHRcdFx0Y2hhcHRlcl90aXRsZSxcblx0XHRcdFx0XHRcdFx0XHRjaGFwdGVyX2lkOiBkYXRhLmNoYXB0ZXJfaWQsXG5cdFx0XHRcdFx0XHRcdFx0Y2hhcHRlcl91cmw6IGhyZWYsXG5cdFx0XHRcdFx0XHRcdFx0Y2hhcHRlcl91cmxfZGF0YTogZGF0YSxcblx0XHRcdFx0XHRcdFx0XHRjaGFwdGVyX2luZGV4OiBjdXJyZW50Vm9sdW1lLnNpemUoKSxcblx0XHRcdFx0XHRcdFx0XHR0b3RhbF9pZHg6IHRvdGFsX2lkeCsrLFxuXHRcdFx0XHRcdFx0XHR9O1xuXG5cdFx0XHRcdFx0XHRcdG5vdmVsVHJlZS5hZGRDaGFwdGVyKGNoYXB0ZXIsIGN1cnJlbnRWb2x1bWUpXG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fSlcblx0XHRcdFx0O1xuXG5cdFx0XHRcdGxldCBkYXRhX21ldGE6IElNZGNvbmZNZXRhID0ge1xuXHRcdFx0XHRcdG5vdmVsOiB7XG5cdFx0XHRcdFx0XHR0YWdzOiBbXSxcblx0XHRcdFx0XHR9LFxuXHRcdFx0XHR9O1xuXG5cdFx0XHRcdGxldCBub3ZlbF9kYXRlID0gbW9tZW50KCQoJyN1cHRpbWUgPiBzcGFuJykudGV4dCgpKTtcblxuXHRcdFx0XHRsZXQgdGFnID0gJCgnLmJvb2tyaWdodCAjY291bnQgbGk6ZXEoMCkgc3BhbjplcSgwKScpLnRleHQoKS50cmltKCk7XG5cblx0XHRcdFx0aWYgKHRhZylcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGRhdGFfbWV0YS5ub3ZlbC50YWdzLnB1c2godGFnKVxuXHRcdFx0XHR9XG5cblx0XHRcdFx0bGV0IG5vdmVsX2F1dGhvciA9ICQoJy5wX2F1dGhvciBhOmVxKDApJykudGV4dCgpLnRyaW0oKTtcblxuXHRcdFx0XHRkYXRhX21ldGEubGluayA9IGRhdGFfbWV0YS5saW5rIHx8IFtdO1xuXHRcdFx0XHRkYXRhX21ldGEubGluay5wdXNoKCQoJy5wX2F1dGhvciBhOmVxKDApJykucHJvcCgnaHJlZicpKTtcblxuXHRcdFx0XHQkKCcuYm9va3JpZ2h0ICNjb3VudCBsaSBzcGFuJylcblx0XHRcdFx0XHQuZWFjaCgoaSwgZWxlbSkgPT4ge1xuXG5cdFx0XHRcdFx0XHRsZXQgdHh0ID0gJChlbGVtKS50ZXh0KCkudHJpbSgpO1xuXG5cdFx0XHRcdFx0XHRsZXQgYm9vbCA9IFtcblx0XHRcdFx0XHRcdFx0J+WujOe1kOa4iCcsXG5cdFx0XHRcdFx0XHRcdCflrozntZAnLFxuXHRcdFx0XHRcdFx0XHQn5bey5a6M57WQJyxcblx0XHRcdFx0XHRcdFx0J+W3suWujOaIkCcsXG5cdFx0XHRcdFx0XHRcdCflroznu5PmuIgnLFxuXHRcdFx0XHRcdFx0XHQn5a6M57uTJyxcblx0XHRcdFx0XHRcdFx0J+W3suWujOe7kycsXG5cdFx0XHRcdFx0XHRcdCflt7LlrozmiJAnLFxuXHRcdFx0XHRcdFx0XS5pbmNsdWRlcyh0eHQpXG5cdFx0XHRcdFx0XHQ7XG5cblx0XHRcdFx0XHRcdGlmIChib29sKVxuXHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRkYXRhX21ldGEubm92ZWwuc3RhdHVzID0gdHh0O1xuXHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0fSlcblx0XHRcdFx0O1xuXG5cdFx0XHRcdHJldHVybiB7XG5cblx0XHRcdFx0XHQuLi5kYXRhX21ldGEsXG5cblx0XHRcdFx0XHR1cmw6IGRvbS51cmwsXG5cdFx0XHRcdFx0dXJsX2RhdGEsXG5cblx0XHRcdFx0XHRub3ZlbF90aXRsZSxcblx0XHRcdFx0XHRub3ZlbF9wdWJsaXNoZXIsXG5cblx0XHRcdFx0XHRub3ZlbF9hdXRob3IsXG5cblx0XHRcdFx0XHRub3ZlbF9kYXRlLFxuXG5cdFx0XHRcdFx0bm92ZWxfZGVzYyxcblxuXHRcdFx0XHRcdC8vdm9sdW1lX2xpc3QsXG5cdFx0XHRcdFx0bm92ZWxUcmVlLFxuXG5cdFx0XHRcdFx0Y2hlY2tkYXRlOiBtb21lbnQoKS5sb2NhbCgpLFxuXG5cdFx0XHRcdFx0aW1nczogW10gYXMgc3RyaW5nW10sXG5cdFx0XHRcdH0gYXMgSU5vdmVsO1xuXHRcdFx0fSlcblx0XHRcdDtcblx0fVxuXG59XG5cbmV4cG9ydCBkZWZhdWx0IE5vdmVsU2l0ZVgyM3FiO1xuIl19