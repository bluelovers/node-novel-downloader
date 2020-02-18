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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7O0dBRUc7Ozs7Ozs7O0FBRUgscUNBQThDO0FBQzlDLHVDQUF1RztBQU92Ryw2Q0FBK0Q7QUFFL0Qsa0NBQWtDO0FBRWxDLG9DQUEwRjtBQUUxRixvQ0FBa0M7QUFDbEMsdUNBQTJDO0FBQzNDLDJDQUFzQztBQUN0QyxpQ0FBa0Q7QUFDbEQsMENBQTBDO0FBRTFDOzs7R0FHRztBQUVIO0lBQUEsSUFBYSxjQUFjLEdBQTNCLE1BQWEsY0FBZSxTQUFRLGNBQWE7UUFpQmhELE1BQU0sQ0FBQyxLQUFLLENBQUMsR0FBdUMsRUFBRSxHQUFHLElBQUk7WUFFNUQsT0FBTyxZQUFLLENBQUMsR0FBRyxFQUFFLEdBQUcsSUFBSSxDQUFDLENBQUM7UUFDNUIsQ0FBQztRQUVELE1BQU0sQ0FBQyxPQUFPLENBQUMsTUFBMkIsRUFBRSxJQUF1QixFQUFFLEdBQUcsSUFBSTtZQUUzRSxPQUFPLGNBQU8sQ0FBQyxNQUFNLEVBQUUsSUFBSSxFQUFFLEdBQUcsSUFBSSxDQUFDLENBQUE7UUFDdEMsQ0FBQztRQUVELE1BQU0sQ0FBQyxRQUFRLENBQUMsR0FBMEIsRUFBRSxHQUFHLElBQUk7WUFFbEQsT0FBTyxlQUFRLENBQUMsR0FBRyxFQUFFLEdBQUcsSUFBSSxDQUFDLENBQUM7UUFDL0IsQ0FBQztRQUVELE9BQU8sQ0FBQyxNQUEyQixFQUFFLElBQXVCLEVBQUUsR0FBRyxJQUFJO1lBRXBFLE9BQU8sY0FBTyxDQUFDLE1BQU0sRUFBRSxJQUFJLEVBQUUsR0FBRyxJQUFJLENBQUMsQ0FBQTtRQUN0QyxDQUFDO1FBRUQsUUFBUSxDQUFDLEdBQTBCLEVBQUUsR0FBRyxJQUFJO1lBRTNDLE9BQU8sZUFBUSxDQUFDLEdBQUcsRUFBRSxHQUFHLElBQUksQ0FBQyxDQUFDO1FBQy9CLENBQUM7UUFFUyxLQUFLLENBQUMsY0FBYyxDQUFJLEdBQWtCLEVBQUUs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LElBQUk7d0JBQ0osS0FBSzt3QkFDTCxLQUFLO3dCQUNMLEtBQUs7d0JBQ0wsSUFBSTt3QkFDSixLQUFLO3dCQUNMLEtBQUs7cUJBQ0wsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQ2Q7b0JBRUQsSUFBSSxJQUFJLEVBQ1I7d0JBQ0MsU0FBUyxDQUFDLEtBQUssQ0FBQyxNQUFNLEdBQUcsR0FBRyxDQUFDO3FCQUM3QjtnQkFFRixDQUFDLENBQUMsQ0FDRjtnQkFFRCxPQUFPLGdDQUVILFNBQVMsS0FFWixHQUFHLEVBQUUsR0FBRyxDQUFDLEdBQUcsRUFDWixRQUFRO29CQUVSLFdBQVc7b0JBQ1gsZUFBZTtvQkFFZixZQUFZO29CQUVaLFVBQVU7b0JBRVYsVUFBVTtvQkFFVixjQUFjO29CQUNkLFNBQVMsRUFFVCxTQUFTLEVBQUUsY0FBTSxFQUFFLENBQUMsS0FBSyxFQUFFLEVBRTNCLElBQUksRUFBRSxFQUFjLEdBQ1YsQ0FBQztZQUNiLENBQUMsQ0FBQyxDQUNEO1FBQ0gsQ0FBQztLQUVELENBQUE7SUFqVHVCLG9CQUFLLEdBQUcsT0FBTyxDQUFDO0lBRjNCLGNBQWM7UUFEMUIsd0JBQWdCLEVBQThDO09BQ2xELGNBQWMsQ0FtVDFCO0lBQUQscUJBQUM7S0FBQTtBQW5UWSx3Q0FBYztBQXFUM0Isa0JBQWUsY0FBYyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDcmVhdGVkIGJ5IHVzZXIgb24gMjAxOC8zLzE3LzAxNy5cbiAqL1xuXG5pbXBvcnQgeyBtaW5pZnlIVE1MLCB0cmltIH0gZnJvbSAnLi4vLi4vdXRpbCc7XG5pbXBvcnQgTm92ZWxTaXRlRGVtbywgeyBJRG93bmxvYWRPcHRpb25zLCBJTm92ZWwsIElPcHRpb25zUnVudGltZSwgSUZldGNoQ2hhcHRlciB9IGZyb20gJy4uL2RlbW8vdHJlZSc7XG5pbXBvcnQgeyBJUm93Vm9sdW1lLCBUcmVlTm9kZSB9IGZyb20gJy4uLy4uL3RyZWUvaW5kZXgnO1xuXG5pbXBvcnQgZnMgPSByZXF1aXJlKCdmcy1leHRyYScpO1xuaW1wb3J0IHsgdHJpbUZpbGVuYW1lIH0gZnJvbSAnZnMtaWNvbnYvdXRpbCc7XG5pbXBvcnQgKiBhcyBwYXRoIGZyb20gJ3VwYXRoMic7XG5pbXBvcnQgbm92ZWxJbmZvLCB7IElNZGNvbmZNZXRhIH0gZnJvbSAnbm9kZS1ub3ZlbC1pbmZvJztcbmltcG9ydCB7IGZyb21VUkwsIElGcm9tVXJsT3B0aW9ucywgSUpTRE9NIH0gZnJvbSAnanNkb20tZXh0cmEnO1xuXG4vL2ltcG9ydCB7IFVSTCB9IGZyb20gJ2pzZG9tLXVybCc7XG5cbmltcG9ydCBOb3ZlbFNpdGUsIHsgc3RhdGljSW1wbGVtZW50cywgZGVmYXVsdEpTRE9NT3B0aW9ucywgU1lNQk9MX0NBQ0hFIH0gZnJvbSAnLi4vaW5kZXgnO1xuaW1wb3J0IHsgUHJvbWlzZUJsdWViaXJkLCBibHVlYmlyZERlY29yYXRvciB9IGZyb20gJy4uL2luZGV4JztcbmltcG9ydCB7IG1vbWVudCB9IGZyb20gJy4uL2luZGV4JztcbmltcG9ydCB7IHJldHJ5UmVxdWVzdCB9IGZyb20gJy4uLy4uL2ZldGNoJztcbmltcG9ydCB7IHpoUmVnRXhwIH0gZnJvbSAncmVnZXhwLWNqayc7XG5pbXBvcnQgeyBwYXJzZVVybCwgbWFrZVVybCwgY2hlY2sgfSBmcm9tICcuL3V0aWwnO1xuaW1wb3J0IHsgX3BfMl9iciB9IGZyb20gJy4uL2VzanpvbmUvdXRpbCc7XG5cbi8qKlxuICog6ZOF56yU5bCP6K+0XG4gKiBAZXhhbXBsZSBodHRwczovL3d3dy54MjNxYi5jb20vYm9vay8yODQvXG4gKi9cbkBzdGF0aWNJbXBsZW1lbnRzPE5vdmVsU2l0ZS5JTm92ZWxTaXRlU3RhdGljPE5vdmVsU2l0ZVgyM3FiPj4oKVxuZXhwb3J0IGNsYXNzIE5vdmVsU2l0ZVgyM3FiIGV4dGVuZHMgTm92ZWxTaXRlRGVtb1xue1xuXHRwdWJsaWMgc3RhdGljIHJlYWRvbmx5IElES0VZID0gJ3gyM3FiJztcblxuXHQvKlxuXHRwcm90ZWN0ZWQgX2ZpeE9wdGlvbnNSdW50aW1lKG9wdGlvbnNSdW50aW1lKVxuXHR7XG5cdFx0b3B0aW9uc1J1bnRpbWUub3B0aW9uc0pTRE9NID0gb3B0aW9uc1J1bnRpbWUub3B0aW9uc0pTRE9NIHx8IHt9O1xuXG5cdFx0Ly9vcHRpb25zUnVudGltZS5vcHRpb25zSlNET00ucnVuU2NyaXB0cyA9ICdkYW5nZXJvdXNseSc7XG5cblx0XHRyZXR1cm4gc3VwZXIuX2ZpeE9wdGlvbnNSdW50aW1lKG9wdGlvbnNSdW50aW1lKVxuXHR9XG5cdCAqL1xuXG5cdHByb3RlY3RlZCBfY2FjaGVfcmU6IFJlZ0V4cDtcblxuXHRzdGF0aWMgY2hlY2sodXJsOiBzdHJpbmcgfCBVUkwgfCBOb3ZlbFNpdGUuSVBhcnNlVXJsLCAuLi5hcmd2KTogYm9vbGVhblxuXHR7XG5cdFx0cmV0dXJuIGNoZWNrKHVybCwgLi4uYXJndik7XG5cdH1cblxuXHRzdGF0aWMgbWFrZVVybCh1cmxvYmo6IE5vdmVsU2l0ZS5JUGFyc2VVcmwsIGJvb2w/OiBib29sZWFuIHwgbnVtYmVyLCAuLi5hcmd2KVxuXHR7XG5cdFx0cmV0dXJuIG1ha2VVcmwodXJsb2JqLCBib29sLCAuLi5hcmd2KVxuXHR9XG5cblx0c3RhdGljIHBhcnNlVXJsKHVybDogc3RyaW5nIHwgVVJMIHwgbnVtYmVyLCAuLi5hcmd2KVxuXHR7XG5cdFx0cmV0dXJuIHBhcnNlVXJsKHVybCwgLi4uYXJndik7XG5cdH1cblxuXHRtYWtlVXJsKHVybG9iajogTm92ZWxTaXRlLklQYXJzZVVybCwgYm9vbD86IGJvb2xlYW4gfCBudW1iZXIsIC4uLmFyZ3YpXG5cdHtcblx0XHRyZXR1cm4gbWFrZVVybCh1cmxvYmosIGJvb2wsIC4uLmFyZ3YpXG5cdH1cblxuXHRwYXJzZVVybCh1cmw6IHN0cmluZyB8IFVSTCB8IG51bWJlciwgLi4uYXJndilcblx0e1xuXHRcdHJldHVybiBwYXJzZVVybCh1cmwsIC4uLmFyZ3YpO1xuXHR9XG5cblx0cHJvdGVjdGVkIGFzeW5jIF9kZWNvZGVDaGFwdGVyPFQ+KHJldDogSUZldGNoQ2hhcHRlciwgb3B0aW9uc1J1bnRpbWU6IFQgJiBJT3B0aW9uc1J1bnRpbWUsIGNhY2hlKVxuXHR7XG5cdFx0Y29uc3QgeyBkb20gfSA9IHJldDtcblx0XHRjb25zdCB7ICQgfSA9IGRvbTtcblxuXHRcdGxldCBodG1sID0gZG9tLnNlcmlhbGl6ZSgpO1xuXG5cdFx0bGV0IG0gPSBodG1sXG5cdFx0XHQubWF0Y2goL2dldFRyYW5zbGF0aW9uXFwoWydcIl0oW15cXCdcIl0rKVsnXCJdL2kpXG5cdFx0O1xuXG5cdFx0aWYgKG0pXG5cdFx0e1xuXHRcdFx0bGV0IGNvZGUgPSBtWzFdO1xuXG5cdFx0XHRhd2FpdCByZXRyeVJlcXVlc3QocmV0LnVybCwge1xuXHRcdFx0XHQvLyBAdHMtaWdub3JlXG5cdFx0XHRcdC4uLm9wdGlvbnNSdW50aW1lLnJlcXVlc3RPcHRpb25zLFxuXHRcdFx0XHRtZXRob2Q6ICdQT1NUJyxcblx0XHRcdFx0Zm9ybToge1xuXHRcdFx0XHRcdHBseGY6ICdnZXRUcmFuc2xhdGlvbicsXG5cdFx0XHRcdFx0cGx4YTogW2NvZGVdLFxuXHRcdFx0XHR9LFxuXHRcdFx0fSlcblx0XHRcdFx0LnRoZW4oKHY6IHN0cmluZykgPT4ge1xuXHRcdFx0XHRcdHYgPSB2XG5cdFx0XHRcdFx0XHQucmVwbGFjZSgvXFw8SmluSmluZ1xcPi8sICcnKVxuXHRcdFx0XHRcdFx0LnJlcGxhY2UoL1xcPFxcL0ppbkppbmdcXD4vLCAnJylcblx0XHRcdFx0XHQ7XG5cblx0XHRcdFx0XHRyZXR1cm4gSlNPTi5wYXJzZSh2KVxuXHRcdFx0XHR9KVxuXHRcdFx0XHQvKlxuXHRcdFx0XHQudGFwKHYgPT4ge1xuXHRcdFx0XHRcdGNvbnNvbGUuZGlyKCctLS0tLS0tLS0tLS0tLS0tLS0tLS0tLScpXG5cdFx0XHRcdFx0Y29uc29sZS5kaXIodilcblx0XHRcdFx0XHRjb25zb2xlLmRpcignLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0nKVxuXHRcdFx0XHR9KVxuXHRcdFx0XHQgKi9cblx0XHRcdFx0LnRhcCgoYTogc3RyaW5nW10pID0+IHtcblxuXHRcdFx0XHRcdGxldCBlbGVtcyA9ICQoJy50cmFucycpO1xuXG5cdFx0XHRcdFx0YS5mb3JFYWNoKCh2LCBpKSA9PiB7XG5cdFx0XHRcdFx0XHRlbGVtcy5lcShpKS5odG1sKHYpO1xuXHRcdFx0XHRcdH0pXG5cblx0XHRcdFx0fSlcblx0XHRcdDtcblxuXHRcdH1cblxuXHRcdC8vY29uc29sZS5kaXIobSk7XG5cdFx0Ly9wcm9jZXNzLmV4aXQoKTtcblx0fVxuXG5cdHByb3RlY3RlZCBhc3luYyBfcGFyc2VDaGFwdGVyPFQ+KHJldCwgb3B0aW9uc1J1bnRpbWUsIGNhY2hlKVxuXHR7XG5cdFx0aWYgKCFyZXQpXG5cdFx0e1xuXHRcdFx0cmV0dXJuICcnO1xuXHRcdH1cblxuXHRcdHRyeVxuXHRcdHtcblx0XHRcdGxldCBodG1sID0gbWluaWZ5SFRNTCgkKCcjbWxmeV9tYWluX3RleHQnKS5odG1sKCkpO1xuXG5cdFx0XHQkKCcjbWxmeV9tYWluX3RleHQnKS5odG1sKGh0bWwpO1xuXHRcdH1cblx0XHRjYXRjaCAoZSlcblx0XHR7XG5cblx0XHR9XG5cblx0XHRsZXQgZWxlbSA9IHJldC5kb20uJCgnI1RleHRDb250ZW50Jyk7XG5cblx0XHRlbGVtXG5cdFx0XHQuZmluZCgnPiAudHAsID4gLmtlLCA+IC5yZCwgPiAuYmQsIHNjcmlwdCcpXG5cdFx0XHQucmVtb3ZlKClcblx0XHQ7XG5cblx0XHRfcF8yX2JyKGVsZW0uZmluZCgncCcpLCByZXQuZG9tLiQpO1xuXG5cdFx0ZWxlbS5odG1sKGZ1bmN0aW9uIChpLCBvbGQ6IHN0cmluZylcblx0XHR7XG5cdFx0XHRyZXR1cm4gb2xkXG5cdFx0XHRcdC5yZXBsYWNlKC8oXFw8YnJcXD4pezMsNH0vZywgJyQxJylcblx0XHRcdFx0LnJlcGxhY2UoLyg/PD1cXDxiclxcPikoPz1bXlxcbl0pL2csICdcXG4nKVxuXHRcdH0pO1xuXG5cdFx0bGV0IHRpdGxlID0gdHJpbShyZXQuZG9tLiQoJ21sZnlfbWFpbl90ZXh0ID4gaDE6ZXEoMCknKS50ZXh0KCkpO1xuXG5cblx0XHRpZiAoIXRoaXMuX2NhY2hlX3JlKVxuXHRcdHtcblx0XHRcdHRoaXMuX2NhY2hlX3JlID0gbmV3IHpoUmVnRXhwKC9eKD866YmbXFxzKuethlxccyrlsI9cXHMq6KqqXFwod1xccyp3XFxzKndcXHMqXFwuXFxzKnhcXHMqMlxccyozXFxzKnFcXHMqYlxccypcXC5cXHMqY1xccypvXFxzKm1cXCkpJC91aWdtKVxuXHRcdH1cblxuXHRcdGxldCB0eHQ6IHN0cmluZyA9IGVsZW1cblx0XHRcdC50ZXh0KClcblx0XHRcdC5yZXBsYWNlKHRoaXMuX2NhY2hlX3JlLCAnJylcblx0XHRcdC5yZXBsYWNlKC9eXFxzK3xcXHMrJC9nLCAnJylcblx0XHRcdC5yZXBsYWNlKC9eWyBcXHhBMF0rfFsgXFx4QTBdKyQvZ20sICcnKVxuXHRcdDtcblxuXHRcdHJldHVybiB0eHQgYXMgc3RyaW5nXG5cdH1cblxuXHRhc3luYyBnZXRfdm9sdW1lX2xpc3Q8VCBleHRlbmRzIElPcHRpb25zUnVudGltZT4odXJsOiBzdHJpbmcgfCBVUkwsXG5cdFx0b3B0aW9uc1J1bnRpbWU6IFBhcnRpYWw8VCAmIElEb3dubG9hZE9wdGlvbnM+ID0ge30sXG5cdCk6IFByb21pc2U8SU5vdmVsPlxuXHR7XG5cdFx0Y29uc3Qgc2VsZiA9IHRoaXM7XG5cblx0XHR1cmwgPSBhd2FpdCB0aGlzLmNyZWF0ZU1haW5VcmwodXJsIGFzIGFueSwgb3B0aW9uc1J1bnRpbWUpO1xuXG5cdFx0cmV0dXJuIGZyb21VUkwodXJsLCBvcHRpb25zUnVudGltZS5vcHRpb25zSlNET00pXG5cdFx0XHQudGhlbihhc3luYyBmdW5jdGlvbiAoZG9tOiBJSlNET00pXG5cdFx0XHR7XG5cdFx0XHRcdGNvbnN0ICQgPSBkb20uJDtcblxuXHRcdFx0XHRsZXQgbm92ZWxfdGl0bGUgPSBkb20uJCgnLmRfdGl0bGUgaDEnKS50ZXh0KCk7XG5cblx0XHRcdFx0bGV0IG5vdmVsX3B1Ymxpc2hlciA9IHNlbGYuSURLRVk7XG5cblx0XHRcdFx0bGV0IHVybF9kYXRhID0gc2VsZi5wYXJzZVVybChkb20udXJsLmhyZWYpO1xuXG5cdFx0XHRcdGxldCBub3ZlbF9kZXNjID0gJCgnI2Jvb2tpbnRybyA+IHA6ZXEoMCknKS50ZXh0KCk7XG5cblx0XHRcdFx0bGV0IHZvbHVtZV9saXN0ID0gW10gYXMgTm92ZWxTaXRlLklWb2x1bWVbXTtcblxuXHRcdFx0XHRjb25zdCBub3ZlbFRyZWUgPSBvcHRpb25zUnVudGltZS5ub3ZlbFRyZWU7XG5cdFx0XHRcdGxldCBjdXJyZW50Vm9sdW1lOiBUcmVlTm9kZTxJUm93Vm9sdW1lPjtcblxuXHRcdFx0XHRsZXQgdGFibGUgPSAkKCcjY2hhcHRlckxpc3QgbGknKVxuXHRcdFx0XHRcdC5maW5kKCdhJylcblx0XHRcdFx0O1xuXG5cdFx0XHRcdGxldCBfY2FjaGVfZGF0ZXMgPSBbXTtcblxuXHRcdFx0XHRsZXQgdG90YWxfaWR4ID0gMDtcblxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0bGV0IHZvbHVtZV90aXRsZSA9ICdudWxsJztcblx0XHRcdFx0XHRsZXQgdm9sdW1lX2xldmVsID0gbnVsbDtcblxuXHRcdFx0XHRcdGN1cnJlbnRWb2x1bWUgPSBub3ZlbFRyZWUuYWRkVm9sdW1lKHtcblx0XHRcdFx0XHRcdHZvbHVtZV90aXRsZSxcblx0XHRcdFx0XHRcdHZvbHVtZV9sZXZlbCxcblx0XHRcdFx0XHRcdHZvbHVtZV9pbmRleDogbm92ZWxUcmVlLnJvb3QoKS5zaXplKCksXG5cdFx0XHRcdFx0XHR0b3RhbF9pZHg6IHRvdGFsX2lkeCsrLFxuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0dGFibGVcblx0XHRcdFx0XHQuZWFjaChmdW5jdGlvbiAoaW5kZXgsIGVsZW0pXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0bGV0IHRyID0gZG9tLiQoZWxlbSk7XG5cblx0XHRcdFx0XHRcdGlmICgxKVxuXHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRsZXQgYSA9IHRyO1xuXHRcdFx0XHRcdFx0XHRsZXQgY2hhcHRlcl90aXRsZSA9IHRyaW0oYS50ZXh0KCksIHRydWUpO1xuXG5cdFx0XHRcdFx0XHRcdGxldCBocmVmID0gYS5wcm9wKCdocmVmJyk7XG5cblx0XHRcdFx0XHRcdFx0bGV0IGRhdGEgPSBzZWxmLnBhcnNlVXJsKGhyZWYpO1xuXG5cdFx0XHRcdFx0XHRcdGlmICghZGF0YS5jaGFwdGVyX2lkKVxuXHRcdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdGVsc2Vcblx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdGhyZWYgPSBzZWxmLm1ha2VVcmwoZGF0YSk7XG5cblx0XHRcdFx0XHRcdFx0XHRkYXRhLnVybCA9IGhyZWY7XG5cdFx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0XHRsZXQgY2hhcHRlciA9IHtcblx0XHRcdFx0XHRcdFx0XHRjaGFwdGVyX3RpdGxlLFxuXHRcdFx0XHRcdFx0XHRcdGNoYXB0ZXJfaWQ6IGRhdGEuY2hhcHRlcl9pZCxcblx0XHRcdFx0XHRcdFx0XHRjaGFwdGVyX3VybDogaHJlZixcblx0XHRcdFx0XHRcdFx0XHRjaGFwdGVyX3VybF9kYXRhOiBkYXRhLFxuXHRcdFx0XHRcdFx0XHRcdGNoYXB0ZXJfaW5kZXg6IGN1cnJlbnRWb2x1bWUuc2l6ZSgpLFxuXHRcdFx0XHRcdFx0XHRcdHRvdGFsX2lkeDogdG90YWxfaWR4KyssXG5cdFx0XHRcdFx0XHRcdH07XG5cblx0XHRcdFx0XHRcdFx0bm92ZWxUcmVlLmFkZENoYXB0ZXIoY2hhcHRlciwgY3VycmVudFZvbHVtZSlcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9KVxuXHRcdFx0XHQ7XG5cblx0XHRcdFx0bGV0IGRhdGFfbWV0YTogSU1kY29uZk1ldGEgPSB7XG5cdFx0XHRcdFx0bm92ZWw6IHtcblx0XHRcdFx0XHRcdHRhZ3M6IFtdLFxuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdH07XG5cblx0XHRcdFx0bGV0IG5vdmVsX2RhdGUgPSBtb21lbnQoJCgnI3VwdGltZSA+IHNwYW4nKS50ZXh0KCkpO1xuXG5cdFx0XHRcdGxldCB0YWcgPSAkKCcuYm9va3JpZ2h0ICNjb3VudCBsaTplcSgwKSBzcGFuOmVxKDApJykudGV4dCgpLnRyaW0oKTtcblxuXHRcdFx0XHRpZiAodGFnKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0ZGF0YV9tZXRhLm5vdmVsLnRhZ3MucHVzaCh0YWcpXG5cdFx0XHRcdH1cblxuXHRcdFx0XHRsZXQgbm92ZWxfYXV0aG9yID0gJCgnLnBfYXV0aG9yIGE6ZXEoMCknKS50ZXh0KCkudHJpbSgpO1xuXG5cdFx0XHRcdGRhdGFfbWV0YS5saW5rID0gZGF0YV9tZXRhLmxpbmsgfHwgW107XG5cdFx0XHRcdGRhdGFfbWV0YS5saW5rLnB1c2goJCgnLnBfYXV0aG9yIGE6ZXEoMCknKS5wcm9wKCdocmVmJykpO1xuXG5cdFx0XHRcdCQoJy5ib29rcmlnaHQgI2NvdW50IGxpIHNwYW4nKVxuXHRcdFx0XHRcdC5lYWNoKChpLCBlbGVtKSA9PiB7XG5cblx0XHRcdFx0XHRcdGxldCB0eHQgPSAkKGVsZW0pLnRleHQoKS50cmltKCk7XG5cblx0XHRcdFx0XHRcdGxldCBib29sID0gW1xuXHRcdFx0XHRcdFx0XHQn5a6M57WQ5riIJyxcblx0XHRcdFx0XHRcdFx0J+WujOe1kCcsXG5cdFx0XHRcdFx0XHRcdCflt7LlrozntZAnLFxuXHRcdFx0XHRcdFx0XHQn5bey5a6M5oiQJyxcblx0XHRcdFx0XHRcdFx0J+WujOe7k+a4iCcsXG5cdFx0XHRcdFx0XHRcdCflroznu5MnLFxuXHRcdFx0XHRcdFx0XHQn5bey5a6M57uTJyxcblx0XHRcdFx0XHRcdFx0J+W3suWujOaIkCcsXG5cdFx0XHRcdFx0XHRdLmluY2x1ZGVzKHR4dClcblx0XHRcdFx0XHRcdDtcblxuXHRcdFx0XHRcdFx0aWYgKGJvb2wpXG5cdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdGRhdGFfbWV0YS5ub3ZlbC5zdGF0dXMgPSB0eHQ7XG5cdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHR9KVxuXHRcdFx0XHQ7XG5cblx0XHRcdFx0cmV0dXJuIHtcblxuXHRcdFx0XHRcdC4uLmRhdGFfbWV0YSxcblxuXHRcdFx0XHRcdHVybDogZG9tLnVybCxcblx0XHRcdFx0XHR1cmxfZGF0YSxcblxuXHRcdFx0XHRcdG5vdmVsX3RpdGxlLFxuXHRcdFx0XHRcdG5vdmVsX3B1Ymxpc2hlcixcblxuXHRcdFx0XHRcdG5vdmVsX2F1dGhvcixcblxuXHRcdFx0XHRcdG5vdmVsX2RhdGUsXG5cblx0XHRcdFx0XHRub3ZlbF9kZXNjLFxuXG5cdFx0XHRcdFx0Ly92b2x1bWVfbGlzdCxcblx0XHRcdFx0XHRub3ZlbFRyZWUsXG5cblx0XHRcdFx0XHRjaGVja2RhdGU6IG1vbWVudCgpLmxvY2FsKCksXG5cblx0XHRcdFx0XHRpbWdzOiBbXSBhcyBzdHJpbmdbXSxcblx0XHRcdFx0fSBhcyBJTm92ZWw7XG5cdFx0XHR9KVxuXHRcdFx0O1xuXHR9XG5cbn1cblxuZXhwb3J0IGRlZmF1bHQgTm92ZWxTaXRlWDIzcWI7XG4iXX0=