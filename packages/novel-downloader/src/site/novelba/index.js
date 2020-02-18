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
const util_2 = require("./util");
let NovelSiteNovelba = /** @class */ (() => {
    let NovelSiteNovelba = class NovelSiteNovelba extends tree_1.default {
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
        _parseChapter(ret, optionsRuntime, cache) {
            if (!ret) {
                return '';
            }
            try {
                let html = util_1.minifyHTML(ret.dom.$('.episode_box').html());
                ret.dom.$('.episode_box').html(html);
            }
            catch (e) {
            }
            return ret.dom.$('.episode_section .episode_box .detail')
                .html(function (index, old) {
                return old.replace(/(?<=\<br\>)\r?\n?/ig, '\n');
            })
                .text()
                .replace(/^\s+|\s+$/g, '');
            ;
        }
        async get_volume_list(url, optionsRuntime = {}) {
            const self = this;
            url = await this.createMainUrl(url, optionsRuntime);
            return jsdom_extra_1.fromURL(url, optionsRuntime.optionsJSDOM)
                .then(async function (dom) {
                const $ = dom.$;
                $('.work_section .summary_box a.more').click();
                try {
                    let html = util_1.minifyHTML(dom.$('.summary_box .detail').html());
                    dom.$('.summary_box .detail').html(html);
                }
                catch (e) {
                }
                let novel_title = dom.$('.work_section .info_list .title').text();
                let novel_author = dom.$('.work_section .info_list .author a').text();
                let novel_desc;
                novel_desc = $('.work_section .summary_box .detail')
                    .text()
                    .replace(/^[ \xa0]+/gm, '')
                    .replace(/[ \t　\xa0]+$/gm, '')
                    .replace(/\s+$/g, '');
                let novel_publisher = self.IDKEY;
                let url_data = self.parseUrl(dom.url.href);
                let volume_list = [];
                const novelTree = optionsRuntime.novelTree;
                let currentVolume;
                let table = dom.$('.episode_box').find('.episode_list > li');
                let _cache_dates = [];
                let total_idx = 0;
                table
                    .each(function (index) {
                    // @ts-ignore
                    let tr = dom.$(this);
                    if (1) {
                        if (!currentVolume) {
                            /*
                            currentVolume = volume_list[volume_list.length] = {
                                volume_index: volume_list.length,
                                volume_title: 'null',
                                chapter_list: [],
                            };
                            */
                            let volume_title = 'null';
                            let volume_level = null;
                            currentVolume = novelTree.addVolume({
                                volume_title,
                                volume_level,
                                volume_index: novelTree.root().size(),
                                total_idx: total_idx++,
                            });
                        }
                        let a = tr.find('a:eq(0)');
                        let chapter_date;
                        let dd;
                        let da = a.find('.update');
                        if (da.length) {
                            dd = da.find('time').text();
                            da.remove();
                        }
                        if (dd) {
                            chapter_date = index_2.moment(dd, ['YYYY/MM/DD']).local();
                            _cache_dates.push(chapter_date.unix());
                        }
                        let chapter_title = util_1.trim(a.text(), true);
                        let href = a.prop('href');
                        let data = self.parseUrl(href);
                        if (!data.chapter_id) {
                            throw new Error();
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
                            chapter_date,
                            chapter_index: currentVolume.size(),
                            total_idx: total_idx++,
                        };
                        novelTree.addChapter(chapter, currentVolume);
                    }
                });
                _cache_dates.sort();
                let novel_date = index_2.moment.unix(_cache_dates[_cache_dates.length - 1]).local();
                let data_meta = {};
                {
                    data_meta.novel = {};
                    data_meta.novel.tags = [];
                    $('.work_section .keyword_list a')
                        .each(function () {
                        // @ts-ignore
                        let t = $(this).text().replace(/^\s+|\s+$/g, '');
                        if (t) {
                            data_meta.novel.tags.push(t);
                        }
                    });
                }
                return Object.assign(Object.assign({}, data_meta), { url: dom.url, url_data,
                    novel_title,
                    novel_author,
                    novel_desc,
                    novel_date,
                    novel_publisher,
                    //volume_list,
                    novelTree, checkdate: index_2.moment().local(), imgs: [] });
            });
        }
    };
    NovelSiteNovelba.IDKEY = 'novelba';
    NovelSiteNovelba = __decorate([
        index_1.staticImplements()
    ], NovelSiteNovelba);
    return NovelSiteNovelba;
})();
exports.NovelSiteNovelba = NovelSiteNovelba;
exports.default = NovelSiteNovelba;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7O0dBRUc7Ozs7Ozs7O0FBRUgscUNBQThDO0FBQzlDLHVDQUF3RjtBQU94Riw2Q0FBK0Q7QUFFL0Qsa0NBQWtDO0FBRWxDLG9DQUEwRjtBQUUxRixvQ0FBa0M7QUFDbEMsaUNBQWtEO0FBR2xEO0lBQUEsSUFBYSxnQkFBZ0IsR0FBN0IsTUFBYSxnQkFBaUIsU0FBUSxjQUFhO1FBSWxELE1BQU0sQ0FBQyxLQUFLLENBQUMsR0FBdUMsRUFBRSxHQUFHLElBQUk7WUFFNUQsT0FBTyxZQUFLLENBQUMsR0FBRyxFQUFFLEdBQUcsSUFBSSxDQUFDLENBQUM7UUFDNUIsQ0FBQztRQUVELE1BQU0sQ0FBQyxPQUFPLENBQUMsTUFBMkIsRUFBRSxJQUF1QixFQUFFLEdBQUcsSUFBSTtZQUUzRSxPQUFPLGNBQU8sQ0FBQyxNQUFNLEVBQUUsSUFBSSxFQUFFLEdBQUcsSUFBSSxDQUFDLENBQUE7UUFDdEMsQ0FBQztRQUVELE1BQU0sQ0FBQyxRQUFRLENBQUMsR0FBMEIsRUFBRSxHQUFHLElBQUk7WUFFbEQsT0FBTyxlQUFRLENBQUMsR0FBRyxFQUFFLEdBQUcsSUFBSSxDQUFDLENBQUM7UUFDL0IsQ0FBQztRQUVELE9BQU8sQ0FBQyxNQUEyQixFQUFFLElBQXVCLEVBQUUsR0FBRyxJQUFJO1lBRXBFLE9BQU8sY0FBTyxDQUFDLE1BQU0sRUFBRSxJQUFJLEVBQUUsR0FBRyxJQUFJLENBQUMsQ0FBQTtRQUN0QyxDQUFDO1FBRUQsUUFBUSxDQUFDLEdBQTBCLEVBQUUsR0FBRyxJQUFJO1lBRTNDLE9BQU8sZUFBUSxDQUFDLEdBQUcsRUFBRSxHQUFHLElBQUksQ0FBQyxDQUFDO1FBQy9CLENBQUM7UUFFUyxhQUFhLENBQUksR0FBRyxFQUFFLGNBQWMsRUFBRSxLQUFLO1lBRXBELElBQUksQ0FBQyxHQUFHLEVBQ1I7Z0JBQ0MsT0FBTyxFQUFFLENB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QkFDakQsSUFBSSxDQUFDLEVBQ0w7NEJBQ0MsU0FBUyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO3lCQUM3QjtvQkFDRixDQUFDLENBQUMsQ0FDRjtpQkFDRDtnQkFFRCxPQUFPLGdDQUVILFNBQVMsS0FFWixHQUFHLEVBQUUsR0FBRyxDQUFDLEdBQUcsRUFDWixRQUFRO29CQUVSLFdBQVc7b0JBQ1gsWUFBWTtvQkFFWixVQUFVO29CQUNWLFVBQVU7b0JBQ1YsZUFBZTtvQkFFZixjQUFjO29CQUNkLFNBQVMsRUFFVCxTQUFTLEVBQUUsY0FBTSxFQUFFLENBQUMsS0FBSyxFQUFFLEVBRTNCLElBQUksRUFBRSxFQUFjLEdBQ1YsQ0FBQztZQUNiLENBQUMsQ0FBQyxDQUNEO1FBQ0gsQ0FBQztLQUVELENBQUE7SUE3T3VCLHNCQUFLLEdBQUcsU0FBUyxDQUFDO0lBRjdCLGdCQUFnQjtRQUQ1Qix3QkFBZ0IsRUFBZ0Q7T0FDcEQsZ0JBQWdCLENBK081QjtJQUFELHVCQUFDO0tBQUE7QUEvT1ksNENBQWdCO0FBaVA3QixrQkFBZSxnQkFBZ0IsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ3JlYXRlZCBieSB1c2VyIG9uIDIwMTgvMy8xNy8wMTcuXG4gKi9cblxuaW1wb3J0IHsgbWluaWZ5SFRNTCwgdHJpbSB9IGZyb20gJy4uLy4uL3V0aWwnO1xuaW1wb3J0IE5vdmVsU2l0ZURlbW8sIHsgSURvd25sb2FkT3B0aW9ucywgSU5vdmVsLCBJT3B0aW9uc1J1bnRpbWUgfSBmcm9tICcuLi9kZW1vL3RyZWUnO1xuaW1wb3J0IHsgSVJvd1ZvbHVtZSwgVHJlZU5vZGUgfSBmcm9tICcuLi8uLi90cmVlL2luZGV4JztcblxuaW1wb3J0IGZzID0gcmVxdWlyZSgnZnMtZXh0cmEnKTtcbmltcG9ydCB7IHRyaW1GaWxlbmFtZSB9IGZyb20gJ2ZzLWljb252L3V0aWwnO1xuaW1wb3J0ICogYXMgcGF0aCBmcm9tICd1cGF0aDInO1xuaW1wb3J0IG5vdmVsSW5mbywgeyBJTWRjb25mTWV0YSB9IGZyb20gJ25vZGUtbm92ZWwtaW5mbyc7XG5pbXBvcnQgeyBmcm9tVVJMLCBJRnJvbVVybE9wdGlvbnMsIElKU0RPTSB9IGZyb20gJ2pzZG9tLWV4dHJhJztcblxuLy9pbXBvcnQgeyBVUkwgfSBmcm9tICdqc2RvbS11cmwnO1xuXG5pbXBvcnQgTm92ZWxTaXRlLCB7IHN0YXRpY0ltcGxlbWVudHMsIGRlZmF1bHRKU0RPTU9wdGlvbnMsIFNZTUJPTF9DQUNIRSB9IGZyb20gJy4uL2luZGV4JztcbmltcG9ydCB7IFByb21pc2VCbHVlYmlyZCwgYmx1ZWJpcmREZWNvcmF0b3IgfSBmcm9tICcuLi9pbmRleCc7XG5pbXBvcnQgeyBtb21lbnQgfSBmcm9tICcuLi9pbmRleCc7XG5pbXBvcnQgeyBwYXJzZVVybCwgbWFrZVVybCwgY2hlY2sgfSBmcm9tICcuL3V0aWwnO1xuXG5Ac3RhdGljSW1wbGVtZW50czxOb3ZlbFNpdGUuSU5vdmVsU2l0ZVN0YXRpYzxOb3ZlbFNpdGVOb3ZlbGJhPj4oKVxuZXhwb3J0IGNsYXNzIE5vdmVsU2l0ZU5vdmVsYmEgZXh0ZW5kcyBOb3ZlbFNpdGVEZW1vXG57XG5cdHB1YmxpYyBzdGF0aWMgcmVhZG9ubHkgSURLRVkgPSAnbm92ZWxiYSc7XG5cblx0c3RhdGljIGNoZWNrKHVybDogc3RyaW5nIHwgVVJMIHwgTm92ZWxTaXRlLklQYXJzZVVybCwgLi4uYXJndik6IGJvb2xlYW5cblx0e1xuXHRcdHJldHVybiBjaGVjayh1cmwsIC4uLmFyZ3YpO1xuXHR9XG5cblx0c3RhdGljIG1ha2VVcmwodXJsb2JqOiBOb3ZlbFNpdGUuSVBhcnNlVXJsLCBib29sPzogYm9vbGVhbiB8IG51bWJlciwgLi4uYXJndilcblx0e1xuXHRcdHJldHVybiBtYWtlVXJsKHVybG9iaiwgYm9vbCwgLi4uYXJndilcblx0fVxuXG5cdHN0YXRpYyBwYXJzZVVybCh1cmw6IHN0cmluZyB8IFVSTCB8IG51bWJlciwgLi4uYXJndilcblx0e1xuXHRcdHJldHVybiBwYXJzZVVybCh1cmwsIC4uLmFyZ3YpO1xuXHR9XG5cblx0bWFrZVVybCh1cmxvYmo6IE5vdmVsU2l0ZS5JUGFyc2VVcmwsIGJvb2w/OiBib29sZWFuIHwgbnVtYmVyLCAuLi5hcmd2KVxuXHR7XG5cdFx0cmV0dXJuIG1ha2VVcmwodXJsb2JqLCBib29sLCAuLi5hcmd2KVxuXHR9XG5cblx0cGFyc2VVcmwodXJsOiBzdHJpbmcgfCBVUkwgfCBudW1iZXIsIC4uLmFyZ3YpXG5cdHtcblx0XHRyZXR1cm4gcGFyc2VVcmwodXJsLCAuLi5hcmd2KTtcblx0fVxuXG5cdHByb3RlY3RlZCBfcGFyc2VDaGFwdGVyPFQ+KHJldCwgb3B0aW9uc1J1bnRpbWUsIGNhY2hlKTogc3RyaW5nXG5cdHtcblx0XHRpZiAoIXJldClcblx0XHR7XG5cdFx0XHRyZXR1cm4gJyc7XG5cdFx0fVxuXG5cdFx0dHJ5XG5cdFx0e1xuXHRcdFx0bGV0IGh0bWwgPSBtaW5pZnlIVE1MKHJldC5kb20uJCgnLmVwaXNvZGVfYm94JykuaHRtbCgpKTtcblxuXHRcdFx0cmV0LmRvbS4kKCcuZXBpc29kZV9ib3gnKS5odG1sKGh0bWwpO1xuXHRcdH1cblx0XHRjYXRjaCAoZSlcblx0XHR7XG5cblx0XHR9XG5cblx0XHRyZXR1cm4gcmV0LmRvbS4kKCcuZXBpc29kZV9zZWN0aW9uIC5lcGlzb2RlX2JveCAuZGV0YWlsJylcblx0XHRcdC5odG1sKGZ1bmN0aW9uIChpbmRleCwgb2xkKVxuXHRcdFx0e1xuXHRcdFx0XHRyZXR1cm4gb2xkLnJlcGxhY2UoLyg/PD1cXDxiclxcPilcXHI/XFxuPy9pZywgJ1xcbicpXG5cdFx0XHR9KVxuXHRcdFx0LnRleHQoKVxuXHRcdFx0LnJlcGxhY2UoL15cXHMrfFxccyskL2csICcnKVxuXHRcdFx0O1xuXHRcdDtcblx0fVxuXG5cdGFzeW5jIGdldF92b2x1bWVfbGlzdDxUIGV4dGVuZHMgSU9wdGlvbnNSdW50aW1lPih1cmw6IHN0cmluZyB8IFVSTCxcblx0XHRvcHRpb25zUnVudGltZTogUGFydGlhbDxUICYgSURvd25sb2FkT3B0aW9ucz4gPSB7fSxcblx0KTogUHJvbWlzZTxJTm92ZWw+XG5cdHtcblx0XHRjb25zdCBzZWxmID0gdGhpcztcblxuXHRcdHVybCA9IGF3YWl0IHRoaXMuY3JlYXRlTWFpblVybCh1cmwgYXMgYW55LCBvcHRpb25zUnVudGltZSk7XG5cblx0XHRyZXR1cm4gZnJvbVVSTCh1cmwsIG9wdGlvbnNSdW50aW1lLm9wdGlvbnNKU0RPTSlcblx0XHRcdC50aGVuKGFzeW5jIGZ1bmN0aW9uIChkb206IElKU0RPTSlcblx0XHRcdHtcblx0XHRcdFx0Y29uc3QgJCA9IGRvbS4kO1xuXG5cdFx0XHRcdCQoJy53b3JrX3NlY3Rpb24gLnN1bW1hcnlfYm94IGEubW9yZScpLmNsaWNrKCk7XG5cblx0XHRcdFx0dHJ5XG5cdFx0XHRcdHtcblx0XHRcdFx0XHRsZXQgaHRtbCA9IG1pbmlmeUhUTUwoZG9tLiQoJy5zdW1tYXJ5X2JveCAuZGV0YWlsJykuaHRtbCgpKTtcblxuXHRcdFx0XHRcdGRvbS4kKCcuc3VtbWFyeV9ib3ggLmRldGFpbCcpLmh0bWwoaHRtbCk7XG5cdFx0XHRcdH1cblx0XHRcdFx0Y2F0Y2ggKGUpXG5cdFx0XHRcdHtcblxuXHRcdFx0XHR9XG5cblx0XHRcdFx0bGV0IG5vdmVsX3RpdGxlID0gZG9tLiQoJy53b3JrX3NlY3Rpb24gLmluZm9fbGlzdCAudGl0bGUnKS50ZXh0KCk7XG5cdFx0XHRcdGxldCBub3ZlbF9hdXRob3IgPSBkb20uJCgnLndvcmtfc2VjdGlvbiAuaW5mb19saXN0IC5hdXRob3IgYScpLnRleHQoKTtcblxuXHRcdFx0XHRsZXQgbm92ZWxfZGVzYzogc3RyaW5nO1xuXG5cdFx0XHRcdG5vdmVsX2Rlc2MgPSAkKCcud29ya19zZWN0aW9uIC5zdW1tYXJ5X2JveCAuZGV0YWlsJylcblx0XHRcdFx0XHQudGV4dCgpXG5cdFx0XHRcdFx0LnJlcGxhY2UoL15bIFxceGEwXSsvZ20sICcnKVxuXHRcdFx0XHRcdC5yZXBsYWNlKC9bIFxcdOOAgFxceGEwXSskL2dtLCAnJylcblx0XHRcdFx0XHQucmVwbGFjZSgvXFxzKyQvZywgJycpXG5cdFx0XHRcdDtcblxuXHRcdFx0XHRsZXQgbm92ZWxfcHVibGlzaGVyID0gc2VsZi5JREtFWTtcblxuXHRcdFx0XHRsZXQgdXJsX2RhdGEgPSBzZWxmLnBhcnNlVXJsKGRvbS51cmwuaHJlZik7XG5cblx0XHRcdFx0bGV0IHZvbHVtZV9saXN0ID0gW10gYXMgTm92ZWxTaXRlLklWb2x1bWVbXTtcblxuXHRcdFx0XHRjb25zdCBub3ZlbFRyZWUgPSBvcHRpb25zUnVudGltZS5ub3ZlbFRyZWU7XG5cdFx0XHRcdGxldCBjdXJyZW50Vm9sdW1lOiBUcmVlTm9kZTxJUm93Vm9sdW1lPjtcblxuXHRcdFx0XHRsZXQgdGFibGUgPSBkb20uJCgnLmVwaXNvZGVfYm94JykuZmluZCgnLmVwaXNvZGVfbGlzdCA+IGxpJyk7XG5cblx0XHRcdFx0bGV0IF9jYWNoZV9kYXRlcyA9IFtdO1xuXG5cdFx0XHRcdGxldCB0b3RhbF9pZHggPSAwO1xuXG5cdFx0XHRcdHRhYmxlXG5cdFx0XHRcdFx0LmVhY2goZnVuY3Rpb24gKGluZGV4KVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdC8vIEB0cy1pZ25vcmVcblx0XHRcdFx0XHRcdGxldCB0ciA9IGRvbS4kKHRoaXMpO1xuXG5cdFx0XHRcdFx0XHRpZiAoMSlcblx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0aWYgKCFjdXJyZW50Vm9sdW1lKVxuXHRcdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdFx0Lypcblx0XHRcdFx0XHRcdFx0XHRjdXJyZW50Vm9sdW1lID0gdm9sdW1lX2xpc3Rbdm9sdW1lX2xpc3QubGVuZ3RoXSA9IHtcblx0XHRcdFx0XHRcdFx0XHRcdHZvbHVtZV9pbmRleDogdm9sdW1lX2xpc3QubGVuZ3RoLFxuXHRcdFx0XHRcdFx0XHRcdFx0dm9sdW1lX3RpdGxlOiAnbnVsbCcsXG5cdFx0XHRcdFx0XHRcdFx0XHRjaGFwdGVyX2xpc3Q6IFtdLFxuXHRcdFx0XHRcdFx0XHRcdH07XG5cdFx0XHRcdFx0XHRcdFx0Ki9cblxuXHRcdFx0XHRcdFx0XHRcdGxldCB2b2x1bWVfdGl0bGUgPSAnbnVsbCc7XG5cdFx0XHRcdFx0XHRcdFx0bGV0IHZvbHVtZV9sZXZlbCA9IG51bGw7XG5cblx0XHRcdFx0XHRcdFx0XHRjdXJyZW50Vm9sdW1lID0gbm92ZWxUcmVlLmFkZFZvbHVtZSh7XG5cdFx0XHRcdFx0XHRcdFx0XHR2b2x1bWVfdGl0bGUsXG5cdFx0XHRcdFx0XHRcdFx0XHR2b2x1bWVfbGV2ZWwsXG5cdFx0XHRcdFx0XHRcdFx0XHR2b2x1bWVfaW5kZXg6IG5vdmVsVHJlZS5yb290KCkuc2l6ZSgpLFxuXHRcdFx0XHRcdFx0XHRcdFx0dG90YWxfaWR4OiB0b3RhbF9pZHgrKyxcblx0XHRcdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHRcdGxldCBhID0gdHIuZmluZCgnYTplcSgwKScpO1xuXG5cdFx0XHRcdFx0XHRcdGxldCBjaGFwdGVyX2RhdGU7XG5cdFx0XHRcdFx0XHRcdGxldCBkZDtcblx0XHRcdFx0XHRcdFx0bGV0IGRhID0gYS5maW5kKCcudXBkYXRlJyk7XG5cblx0XHRcdFx0XHRcdFx0aWYgKGRhLmxlbmd0aClcblx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdGRkID0gZGEuZmluZCgndGltZScpLnRleHQoKTtcblxuXHRcdFx0XHRcdFx0XHRcdGRhLnJlbW92ZSgpO1xuXHRcdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdFx0aWYgKGRkKVxuXHRcdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdFx0Y2hhcHRlcl9kYXRlID0gbW9tZW50KGRkLCBbJ1lZWVkvTU0vREQnXSkubG9jYWwoKTtcblx0XHRcdFx0XHRcdFx0XHRfY2FjaGVfZGF0ZXMucHVzaChjaGFwdGVyX2RhdGUudW5peCgpKTtcblx0XHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHRcdGxldCBjaGFwdGVyX3RpdGxlID0gdHJpbShhLnRleHQoKSwgdHJ1ZSk7XG5cblx0XHRcdFx0XHRcdFx0bGV0IGhyZWYgPSBhLnByb3AoJ2hyZWYnKTtcblxuXHRcdFx0XHRcdFx0XHRsZXQgZGF0YSA9IHNlbGYucGFyc2VVcmwoaHJlZik7XG5cblx0XHRcdFx0XHRcdFx0aWYgKCFkYXRhLmNoYXB0ZXJfaWQpXG5cdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoKVxuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdGVsc2Vcblx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdGhyZWYgPSBzZWxmLm1ha2VVcmwoZGF0YSk7XG5cblx0XHRcdFx0XHRcdFx0XHRkYXRhLnVybCA9IGhyZWY7XG5cdFx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0XHRsZXQgY2hhcHRlciA9IHtcblx0XHRcdFx0XHRcdFx0XHRjaGFwdGVyX3RpdGxlLFxuXHRcdFx0XHRcdFx0XHRcdGNoYXB0ZXJfaWQ6IGRhdGEuY2hhcHRlcl9pZCxcblx0XHRcdFx0XHRcdFx0XHRjaGFwdGVyX3VybDogaHJlZixcblx0XHRcdFx0XHRcdFx0XHRjaGFwdGVyX3VybF9kYXRhOiBkYXRhLFxuXHRcdFx0XHRcdFx0XHRcdGNoYXB0ZXJfZGF0ZSxcblx0XHRcdFx0XHRcdFx0XHRjaGFwdGVyX2luZGV4OiBjdXJyZW50Vm9sdW1lLnNpemUoKSxcblx0XHRcdFx0XHRcdFx0XHR0b3RhbF9pZHg6IHRvdGFsX2lkeCsrLFxuXHRcdFx0XHRcdFx0XHR9O1xuXG5cdFx0XHRcdFx0XHRcdG5vdmVsVHJlZS5hZGRDaGFwdGVyKGNoYXB0ZXIsIGN1cnJlbnRWb2x1bWUpXG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fSlcblx0XHRcdFx0O1xuXG5cdFx0XHRcdF9jYWNoZV9kYXRlcy5zb3J0KCk7XG5cblx0XHRcdFx0bGV0IG5vdmVsX2RhdGUgPSBtb21lbnQudW5peChfY2FjaGVfZGF0ZXNbX2NhY2hlX2RhdGVzLmxlbmd0aCAtIDFdKS5sb2NhbCgpO1xuXG5cdFx0XHRcdGxldCBkYXRhX21ldGE6IElNZGNvbmZNZXRhID0ge307XG5cblx0XHRcdFx0e1xuXHRcdFx0XHRcdGRhdGFfbWV0YS5ub3ZlbCA9IHt9O1xuXHRcdFx0XHRcdGRhdGFfbWV0YS5ub3ZlbC50YWdzID0gW107XG5cblx0XHRcdFx0XHQkKCcud29ya19zZWN0aW9uIC5rZXl3b3JkX2xpc3QgYScpXG5cdFx0XHRcdFx0XHQuZWFjaChmdW5jdGlvbiAoKVxuXHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHQvLyBAdHMtaWdub3JlXG5cdFx0XHRcdFx0XHRcdGxldCB0ID0gJCh0aGlzKS50ZXh0KCkucmVwbGFjZSgvXlxccyt8XFxzKyQvZywgJycpO1xuXHRcdFx0XHRcdFx0XHRpZiAodClcblx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdGRhdGFfbWV0YS5ub3ZlbC50YWdzLnB1c2godCk7XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdH0pXG5cdFx0XHRcdFx0O1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0cmV0dXJuIHtcblxuXHRcdFx0XHRcdC4uLmRhdGFfbWV0YSxcblxuXHRcdFx0XHRcdHVybDogZG9tLnVybCxcblx0XHRcdFx0XHR1cmxfZGF0YSxcblxuXHRcdFx0XHRcdG5vdmVsX3RpdGxlLFxuXHRcdFx0XHRcdG5vdmVsX2F1dGhvcixcblxuXHRcdFx0XHRcdG5vdmVsX2Rlc2MsXG5cdFx0XHRcdFx0bm92ZWxfZGF0ZSxcblx0XHRcdFx0XHRub3ZlbF9wdWJsaXNoZXIsXG5cblx0XHRcdFx0XHQvL3ZvbHVtZV9saXN0LFxuXHRcdFx0XHRcdG5vdmVsVHJlZSxcblxuXHRcdFx0XHRcdGNoZWNrZGF0ZTogbW9tZW50KCkubG9jYWwoKSxcblxuXHRcdFx0XHRcdGltZ3M6IFtdIGFzIHN0cmluZ1tdLFxuXHRcdFx0XHR9IGFzIElOb3ZlbDtcblx0XHRcdH0pXG5cdFx0XHQ7XG5cdH1cblxufVxuXG5leHBvcnQgZGVmYXVsdCBOb3ZlbFNpdGVOb3ZlbGJhO1xuIl19