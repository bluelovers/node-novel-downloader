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
exports.NovelSiteKakuyomu = void 0;
const util_1 = require("../../util");
const tree_1 = require("../demo/tree");
const jsdom_extra_1 = require("jsdom-extra");
//import { URL } from 'jsdom-url';
const index_1 = require("../index");
const index_2 = require("../index");
const util_2 = require("./util");
let NovelSiteKakuyomu = /** @class */ (() => {
    let NovelSiteKakuyomu = class NovelSiteKakuyomu extends tree_1.default {
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
            return ret.dom.$('#contentMain .widget-episodeBody').text();
        }
        /**
         * @todo 需要改良支援三級目錄
         */
        async get_volume_list(url, optionsRuntime = {}) {
            const self = this;
            url = await this.createMainUrl(url, optionsRuntime);
            return jsdom_extra_1.fromURL(url, optionsRuntime.optionsJSDOM)
                .then(async function (dom) {
                const $ = dom.$;
                let novel_title = dom.$('#workTitle').text();
                let novel_author = dom.$('#workAuthor-activityName').text();
                let novel_desc;
                dom.$('#description').each(function () {
                    $('#introduction').addClass('isExpanded');
                    $('.ui-truncateText-expandButton').remove();
                    $('.test-introduction-rest-text').show();
                    let d = [];
                    // @ts-ignore
                    $(this)
                        .find('#catchphrase-body, #catchphrase-authorLabel')
                        .each(function () {
                        // @ts-ignore
                        d.push($(this).text().replace(/\s+$/g, ''));
                    });
                    if (d.length) {
                        d.push(' ');
                    }
                    d.push($('#introduction').text().replace(/\s+$/g, ''));
                    novel_desc = d
                        .filter(v => v)
                        .join("\n")
                        .replace(/[ \t　]+$/gm, '');
                });
                let novel_publisher = self.IDKEY;
                let url_data = self.parseUrl(dom.url.href);
                let volume_list = [];
                const novelTree = optionsRuntime.novelTree;
                let currentVolume;
                let table = dom.$('#table-of-contents').find('.widget-toc-chapter, .widget-toc-episode');
                let _cache_dates = [];
                let total_idx = 0;
                table
                    .each(function (index) {
                    // @ts-ignore
                    let tr = dom.$(this);
                    if (tr.is('.widget-toc-chapter')) {
                        /*
                        currentVolume = volume_list[volume_list.length] = {
                            volume_index: volume_list.length,
                            volume_title: tr.text().replace(/^\s+|\s+$/g, ''),
                            chapter_list: [],
                        };
                        */
                        let volume_level = null;
                        let m = tr.attr('class').match(/\bwidget-toc-level(\d+)\b/);
                        if (m) {
                            volume_level = parseInt(m[1]);
                            //console.log(m);
                        }
                        else {
                            volume_level = 1;
                            throw Error;
                        }
                        let volume_title = util_1.trim(tr.text(), true);
                        let nowVolume;
                        if (currentVolume) {
                            let lastLevel = currentVolume.get('level');
                            let parentVolume;
                            if (volume_level > 1) {
                                if (lastLevel == volume_level) {
                                    parentVolume = currentVolume.parent;
                                }
                                else if (lastLevel = (volume_level + 1)) {
                                    parentVolume = currentVolume;
                                }
                                else {
                                    throw Error;
                                }
                                if (volume_title == '') {
                                    let n = tr.nextUntil('.widget-toc-chapter')
                                        .eq(-1)
                                        .next('.widget-toc-chapter');
                                    //console.log(n, n.attr('class'));
                                    if (!n.length || n.hasClass(`widget-toc-level${volume_level - 1}`)) {
                                        nowVolume = parentVolume;
                                    }
                                }
                                if (!nowVolume) {
                                    nowVolume = novelTree.addVolume({
                                        volume_title,
                                        volume_level,
                                        volume_index: parentVolume.size(),
                                        total_idx: total_idx++,
                                    }, parentVolume);
                                }
                            }
                        }
                        if (!nowVolume) {
                            nowVolume = novelTree.addVolume({
                                volume_title,
                                volume_level,
                                volume_index: novelTree.root().size(),
                                total_idx: total_idx++,
                            });
                        }
                        currentVolume = nowVolume;
                    }
                    else if (1) {
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
                        let chapter_title = util_1.trim(a.find('.widget-toc-episode-titleLabel').text(), true);
                        let chapter_date;
                        let dd;
                        let da = a.find('.widget-toc-episode-datePublished');
                        if (!dd) {
                            dd = da.attr('datetime').replace(/^\s+|\s+$/g, '');
                        }
                        if (dd) {
                            chapter_date = index_2.moment(dd).local();
                            _cache_dates.push(chapter_date.unix());
                        }
                        let href = a.prop('href');
                        let data = self.parseUrl(href);
                        if (!data.chapter_id) {
                            /*
                            console.log(a);
                            console.log(data);
                            console.log(href);
                            console.log(a.attr('href'));
                            console.log(new URL(href, dom.url));

                            console.log(dom._options);
                            */
                            throw new Error();
                        }
                        else {
                            href = self.makeUrl(data);
                            data.url = href;
                        }
                        /*
                        currentVolume
                            .chapter_list
                            .push({
                                chapter_index: currentVolume.chapter_list.length,
                                chapter_title: chapter_title.replace(/^\s+|\s+$/g, ''),
                                chapter_id: data.chapter_id,
                                chapter_url: href,
                                chapter_url_data: data,
                                chapter_date,
                            })
                        ;
                        */
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
                    $('#workMeta-flags')
                        .find('#workGenre a, #workMeta-attentionsAndTags [itemprop="keywords"] a')
                        .each(function () {
                        // @ts-ignore
                        let t = $(this).text().replace(/^\s+|\s+$/g, '');
                        if (t) {
                            data_meta.novel.tags.push(t);
                        }
                    });
                    $('#workMeta-flags')
                        .find('#workMeta-attention li, #workGenre > a:eq(0)')
                        .each(function () {
                        // @ts-ignore
                        let t = $(this).text().replace(/^\s+|\s+$/g, '');
                        if (t) {
                            data_meta.novel.tags.push(t);
                            if (t == '性描写有り') {
                                data_meta.novel.tags.push(`novel18`);
                            }
                        }
                    });
                    $('#table-of-contents .widget-toc-workStatus span:eq(0)')
                        .each(function () {
                        // @ts-ignore
                        data_meta.novel.status = $(this).text().replace(/^\s+|\s+$/g, '');
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
    NovelSiteKakuyomu.IDKEY = 'kakuyomu';
    NovelSiteKakuyomu = __decorate([
        index_1.staticImplements()
    ], NovelSiteKakuyomu);
    return NovelSiteKakuyomu;
})();
exports.NovelSiteKakuyomu = NovelSiteKakuyomu;
exports.default = NovelSiteKakuyomu;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7O0dBRUc7Ozs7Ozs7OztBQUVILHFDQUFrQztBQUNsQyx1Q0FBd0Y7QUFPeEYsNkNBQStEO0FBRS9ELGtDQUFrQztBQUVsQyxvQ0FBMEY7QUFFMUYsb0NBQWtDO0FBQ2xDLGlDQUFrRDtBQUdsRDtJQUFBLElBQWEsaUJBQWlCLEdBQTlCLE1BQWEsaUJBQWtCLFNBQVEsY0FBYTtRQUluRCxNQUFNLENBQUMsS0FBSyxDQUFDLEdBQXVDLEVBQUUsR0FBRyxJQUFJO1lBRTVELE9BQU8sWUFBSyxDQUFDLEdBQUcsRUFBRSxHQUFHLElBQUksQ0FBQyxDQUFDO1FBQzVCLENBQUM7UUFFRCxNQUFNLENBQUMsT0FBTyxDQUFDLE1BQTJCLEVBQUUsSUFBdUIsRUFBRSxHQUFHLElBQUk7WUFFM0UsT0FBTyxjQUFPLENBQUMsTUFBTSxFQUFFLElBQUksRUFBRSxHQUFHLElBQUksQ0FBQyxDQUFBO1FBQ3RDLENBQUM7UUFFRCxNQUFNLENBQUMsUUFBUSxDQUFDLEdBQTBCLEVBQUUsR0FBRyxJQUFJO1lBRWxELE9BQU8sZUFBUSxDQUFDLEdBQUcsRUFBRSxHQUFHLElBQUksQ0FBQyxDQUFDO1FBQy9CLENBQUM7UUFFRCxPQUFPLENBQUMsTUFBMkIsRUFBRSxJQUF1QixFQUFFLEdBQUcsSUFBSTtZQUVwRSxPQUFPLGNBQU8sQ0FBQyxNQUFNLEVBQUUsSUFBSSxFQUFFLEdBQUcsSUFBSSxDQUFDLENBQUE7UUFDdEMsQ0FBQztRQUVELFFBQVEsQ0FBQyxHQUEwQixFQUFFLEdBQUcsSUFBSTtZQUUzQyxPQUFPLGVBQVEsQ0FBQyxHQUFHLEVBQUUsR0FBRyxJQUFJLENBQUMsQ0FBQztRQUMvQixDQUFDO1FBRVMsYUFBYSxDQUFJLEdBQUcsRUFBRSxjQUFjLEVBQUUsS0FBSztZQUVwRCxJQUFJLENBQUMsR0FBRyxFQUNSO2dCQUNDLE9BQU8sRUFBRSxD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bmltcG9ydCB7IHRyaW0gfSBmcm9tICcuLi8uLi91dGlsJztcbmltcG9ydCBOb3ZlbFNpdGVEZW1vLCB7IElEb3dubG9hZE9wdGlvbnMsIElOb3ZlbCwgSU9wdGlvbnNSdW50aW1lIH0gZnJvbSAnLi4vZGVtby90cmVlJztcbmltcG9ydCB7IElSb3dWb2x1bWUsIFRyZWVOb2RlIH0gZnJvbSAnLi4vLi4vdHJlZS9pbmRleCc7XG5cbmltcG9ydCBmcyA9IHJlcXVpcmUoJ2ZzLWV4dHJhJyk7XG5pbXBvcnQgeyB0cmltRmlsZW5hbWUgfSBmcm9tICdmcy1pY29udi91dGlsJztcbmltcG9ydCAqIGFzIHBhdGggZnJvbSAndXBhdGgyJztcbmltcG9ydCBub3ZlbEluZm8sIHsgSU1kY29uZk1ldGEgfSBmcm9tICdub2RlLW5vdmVsLWluZm8nO1xuaW1wb3J0IHsgZnJvbVVSTCwgSUZyb21VcmxPcHRpb25zLCBJSlNET00gfSBmcm9tICdqc2RvbS1leHRyYSc7XG5cbi8vaW1wb3J0IHsgVVJMIH0gZnJvbSAnanNkb20tdXJsJztcblxuaW1wb3J0IE5vdmVsU2l0ZSwgeyBzdGF0aWNJbXBsZW1lbnRzLCBkZWZhdWx0SlNET01PcHRpb25zLCBTWU1CT0xfQ0FDSEUgfSBmcm9tICcuLi9pbmRleCc7XG5pbXBvcnQgeyBQcm9taXNlQmx1ZWJpcmQsIGJsdWViaXJkRGVjb3JhdG9yIH0gZnJvbSAnLi4vaW5kZXgnO1xuaW1wb3J0IHsgbW9tZW50IH0gZnJvbSAnLi4vaW5kZXgnO1xuaW1wb3J0IHsgcGFyc2VVcmwsIG1ha2VVcmwsIGNoZWNrIH0gZnJvbSAnLi91dGlsJztcblxuQHN0YXRpY0ltcGxlbWVudHM8Tm92ZWxTaXRlLklOb3ZlbFNpdGVTdGF0aWM8Tm92ZWxTaXRlS2FrdXlvbXU+PigpXG5leHBvcnQgY2xhc3MgTm92ZWxTaXRlS2FrdXlvbXUgZXh0ZW5kcyBOb3ZlbFNpdGVEZW1vXG57XG5cdHB1YmxpYyBzdGF0aWMgcmVhZG9ubHkgSURLRVkgPSAna2FrdXlvbXUnO1xuXG5cdHN0YXRpYyBjaGVjayh1cmw6IHN0cmluZyB8IFVSTCB8IE5vdmVsU2l0ZS5JUGFyc2VVcmwsIC4uLmFyZ3YpOiBib29sZWFuXG5cdHtcblx0XHRyZXR1cm4gY2hlY2sodXJsLCAuLi5hcmd2KTtcblx0fVxuXG5cdHN0YXRpYyBtYWtlVXJsKHVybG9iajogTm92ZWxTaXRlLklQYXJzZVVybCwgYm9vbD86IGJvb2xlYW4gfCBudW1iZXIsIC4uLmFyZ3YpXG5cdHtcblx0XHRyZXR1cm4gbWFrZVVybCh1cmxvYmosIGJvb2wsIC4uLmFyZ3YpXG5cdH1cblxuXHRzdGF0aWMgcGFyc2VVcmwodXJsOiBzdHJpbmcgfCBVUkwgfCBudW1iZXIsIC4uLmFyZ3YpXG5cdHtcblx0XHRyZXR1cm4gcGFyc2VVcmwodXJsLCAuLi5hcmd2KTtcblx0fVxuXG5cdG1ha2VVcmwodXJsb2JqOiBOb3ZlbFNpdGUuSVBhcnNlVXJsLCBib29sPzogYm9vbGVhbiB8IG51bWJlciwgLi4uYXJndilcblx0e1xuXHRcdHJldHVybiBtYWtlVXJsKHVybG9iaiwgYm9vbCwgLi4uYXJndilcblx0fVxuXG5cdHBhcnNlVXJsKHVybDogc3RyaW5nIHwgVVJMIHwgbnVtYmVyLCAuLi5hcmd2KVxuXHR7XG5cdFx0cmV0dXJuIHBhcnNlVXJsKHVybCwgLi4uYXJndik7XG5cdH1cblxuXHRwcm90ZWN0ZWQgX3BhcnNlQ2hhcHRlcjxUPihyZXQsIG9wdGlvbnNSdW50aW1lLCBjYWNoZSk6IHN0cmluZ1xuXHR7XG5cdFx0aWYgKCFyZXQpXG5cdFx0e1xuXHRcdFx0cmV0dXJuICcnO1xuXHRcdH1cblxuXHRcdHJldHVybiByZXQuZG9tLiQoJyNjb250ZW50TWFpbiAud2lkZ2V0LWVwaXNvZGVCb2R5JykudGV4dCgpO1xuXHR9XG5cblx0LyoqXG5cdCAqIEB0b2RvIOmcgOimgeaUueiJr+aUr+aPtOS4iee0muebrumMhFxuXHQgKi9cblx0YXN5bmMgZ2V0X3ZvbHVtZV9saXN0PFQgZXh0ZW5kcyBJT3B0aW9uc1J1bnRpbWU+KHVybDogc3RyaW5nIHwgVVJMLFxuXHRcdG9wdGlvbnNSdW50aW1lOiBQYXJ0aWFsPFQgJiBJRG93bmxvYWRPcHRpb25zPiA9IHt9XG5cdCk6IFByb21pc2U8SU5vdmVsPlxuXHR7XG5cdFx0Y29uc3Qgc2VsZiA9IHRoaXM7XG5cblx0XHR1cmwgPSBhd2FpdCB0aGlzLmNyZWF0ZU1haW5VcmwodXJsIGFzIGFueSwgb3B0aW9uc1J1bnRpbWUpO1xuXG5cdFx0cmV0dXJuIGZyb21VUkwodXJsLCBvcHRpb25zUnVudGltZS5vcHRpb25zSlNET00pXG5cdFx0XHQudGhlbihhc3luYyBmdW5jdGlvbiAoZG9tOiBJSlNET00pXG5cdFx0XHR7XG5cdFx0XHRcdGNvbnN0ICQgPSBkb20uJDtcblxuXHRcdFx0XHRsZXQgbm92ZWxfdGl0bGUgPSBkb20uJCgnI3dvcmtUaXRsZScpLnRleHQoKTtcblx0XHRcdFx0bGV0IG5vdmVsX2F1dGhvciA9IGRvbS4kKCcjd29ya0F1dGhvci1hY3Rpdml0eU5hbWUnKS50ZXh0KCk7XG5cblx0XHRcdFx0bGV0IG5vdmVsX2Rlc2M6IHN0cmluZztcblxuXHRcdFx0XHRkb20uJCgnI2Rlc2NyaXB0aW9uJykuZWFjaChmdW5jdGlvbiAoKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0JCgnI2ludHJvZHVjdGlvbicpLmFkZENsYXNzKCdpc0V4cGFuZGVkJyk7XG5cdFx0XHRcdFx0JCgnLnVpLXRydW5jYXRlVGV4dC1leHBhbmRCdXR0b24nKS5yZW1vdmUoKTtcblx0XHRcdFx0XHQkKCcudGVzdC1pbnRyb2R1Y3Rpb24tcmVzdC10ZXh0Jykuc2hvdygpO1xuXG5cdFx0XHRcdFx0bGV0IGQgPSBbXTtcblxuXHRcdFx0XHRcdC8vIEB0cy1pZ25vcmVcblx0XHRcdFx0XHQkKHRoaXMpXG5cdFx0XHRcdFx0XHQuZmluZCgnI2NhdGNocGhyYXNlLWJvZHksICNjYXRjaHBocmFzZS1hdXRob3JMYWJlbCcpXG5cdFx0XHRcdFx0XHQuZWFjaChmdW5jdGlvbiAoKVxuXHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHQvLyBAdHMtaWdub3JlXG5cdFx0XHRcdFx0XHRcdGQucHVzaCgkKHRoaXMpLnRleHQoKS5yZXBsYWNlKC9cXHMrJC9nLCAnJykpO1xuXHRcdFx0XHRcdFx0fSlcblx0XHRcdFx0XHQ7XG5cblx0XHRcdFx0XHRpZiAoZC5sZW5ndGgpXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0ZC5wdXNoKCcgJyk7XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0ZC5wdXNoKCQoJyNpbnRyb2R1Y3Rpb24nKS50ZXh0KCkucmVwbGFjZSgvXFxzKyQvZywgJycpKTtcblxuXHRcdFx0XHRcdG5vdmVsX2Rlc2MgPSBkXG5cdFx0XHRcdFx0XHQuZmlsdGVyKHYgPT4gdilcblx0XHRcdFx0XHRcdC5qb2luKFwiXFxuXCIpXG5cdFx0XHRcdFx0XHQucmVwbGFjZSgvWyBcXHTjgIBdKyQvZ20sICcnKVxuXHRcdFx0XHRcdDtcblxuXHRcdFx0XHR9KTtcblxuXHRcdFx0XHRsZXQgbm92ZWxfcHVibGlzaGVyID0gc2VsZi5JREtFWTtcblxuXHRcdFx0XHRsZXQgdXJsX2RhdGEgPSBzZWxmLnBhcnNlVXJsKGRvbS51cmwuaHJlZik7XG5cblx0XHRcdFx0bGV0IHZvbHVtZV9saXN0ID0gW10gYXMgTm92ZWxTaXRlLklWb2x1bWVbXTtcblxuXHRcdFx0XHRjb25zdCBub3ZlbFRyZWUgPSBvcHRpb25zUnVudGltZS5ub3ZlbFRyZWU7XG5cdFx0XHRcdGxldCBjdXJyZW50Vm9sdW1lOiBUcmVlTm9kZTxJUm93Vm9sdW1lPjtcblxuXHRcdFx0XHRsZXQgdGFibGUgPSBkb20uJCgnI3RhYmxlLW9mLWNvbnRlbnRzJykuZmluZCgnLndpZGdldC10b2MtY2hhcHRlciwgLndpZGdldC10b2MtZXBpc29kZScpO1xuXG5cdFx0XHRcdGxldCBfY2FjaGVfZGF0ZXMgPSBbXTtcblxuXHRcdFx0XHRsZXQgdG90YWxfaWR4ID0gMDtcblxuXHRcdFx0XHR0YWJsZVxuXHRcdFx0XHRcdC5lYWNoKGZ1bmN0aW9uIChpbmRleClcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHQvLyBAdHMtaWdub3JlXG5cdFx0XHRcdFx0XHRsZXQgdHIgPSBkb20uJCh0aGlzKTtcblxuXHRcdFx0XHRcdFx0aWYgKHRyLmlzKCcud2lkZ2V0LXRvYy1jaGFwdGVyJykpXG5cdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdC8qXG5cdFx0XHRcdFx0XHRcdGN1cnJlbnRWb2x1bWUgPSB2b2x1bWVfbGlzdFt2b2x1bWVfbGlzdC5sZW5ndGhdID0ge1xuXHRcdFx0XHRcdFx0XHRcdHZvbHVtZV9pbmRleDogdm9sdW1lX2xpc3QubGVuZ3RoLFxuXHRcdFx0XHRcdFx0XHRcdHZvbHVtZV90aXRsZTogdHIudGV4dCgpLnJlcGxhY2UoL15cXHMrfFxccyskL2csICcnKSxcblx0XHRcdFx0XHRcdFx0XHRjaGFwdGVyX2xpc3Q6IFtdLFxuXHRcdFx0XHRcdFx0XHR9O1xuXHRcdFx0XHRcdFx0XHQqL1xuXG5cdFx0XHRcdFx0XHRcdGxldCB2b2x1bWVfbGV2ZWw6IG51bWJlciA9IG51bGw7XG5cblx0XHRcdFx0XHRcdFx0bGV0IG0gPSB0ci5hdHRyKCdjbGFzcycpLm1hdGNoKC9cXGJ3aWRnZXQtdG9jLWxldmVsKFxcZCspXFxiLyk7XG5cdFx0XHRcdFx0XHRcdGlmIChtKVxuXHRcdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdFx0dm9sdW1lX2xldmVsID0gcGFyc2VJbnQobVsxXSk7XG5cdFx0XHRcdFx0XHRcdFx0Ly9jb25zb2xlLmxvZyhtKTtcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRlbHNlXG5cdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHR2b2x1bWVfbGV2ZWwgPSAxO1xuXHRcdFx0XHRcdFx0XHRcdHRocm93IEVycm9yXG5cdFx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0XHRsZXQgdm9sdW1lX3RpdGxlID0gdHJpbSh0ci50ZXh0KCksIHRydWUpO1xuXG5cdFx0XHRcdFx0XHRcdGxldCBub3dWb2x1bWU6IFRyZWVOb2RlPElSb3dWb2x1bWU+O1xuXG5cdFx0XHRcdFx0XHRcdGlmIChjdXJyZW50Vm9sdW1lKVxuXHRcdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdFx0bGV0IGxhc3RMZXZlbCA9IGN1cnJlbnRWb2x1bWUuZ2V0PG51bWJlcj4oJ2xldmVsJykgYXMgbnVtYmVyO1xuXHRcdFx0XHRcdFx0XHRcdGxldCBwYXJlbnRWb2x1bWU6IFRyZWVOb2RlPElSb3dWb2x1bWU+O1xuXG5cdFx0XHRcdFx0XHRcdFx0aWYgKHZvbHVtZV9sZXZlbCA+IDEpXG5cdFx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdFx0aWYgKGxhc3RMZXZlbCA9PSB2b2x1bWVfbGV2ZWwpXG5cdFx0XHRcdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdHBhcmVudFZvbHVtZSA9IGN1cnJlbnRWb2x1bWUucGFyZW50O1xuXHRcdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRcdFx0ZWxzZSBpZiAobGFzdExldmVsID0gKHZvbHVtZV9sZXZlbCArIDEpKVxuXHRcdFx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRwYXJlbnRWb2x1bWUgPSBjdXJyZW50Vm9sdW1lO1xuXHRcdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRcdFx0ZWxzZVxuXHRcdFx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdFx0XHR0aHJvdyBFcnJvclxuXHRcdFx0XHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHRcdFx0XHRpZiAodm9sdW1lX3RpdGxlID09ICcnKVxuXHRcdFx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRsZXQgbiA9IHRyLm5leHRVbnRpbCgnLndpZGdldC10b2MtY2hhcHRlcicpXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0LmVxKC0xKVxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdC5uZXh0KCcud2lkZ2V0LXRvYy1jaGFwdGVyJylcblx0XHRcdFx0XHRcdFx0XHRcdFx0O1xuXG5cdFx0XHRcdFx0XHRcdFx0XHRcdC8vY29uc29sZS5sb2cobiwgbi5hdHRyKCdjbGFzcycpKTtcblxuXHRcdFx0XHRcdFx0XHRcdFx0XHRpZiAoIW4ubGVuZ3RoIHx8IG4uaGFzQ2xhc3MoYHdpZGdldC10b2MtbGV2ZWwke3ZvbHVtZV9sZXZlbCAtIDF9YCkpXG5cdFx0XHRcdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRub3dWb2x1bWUgPSBwYXJlbnRWb2x1bWU7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0XHRcdFx0aWYgKCFub3dWb2x1bWUpXG5cdFx0XHRcdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdG5vd1ZvbHVtZSA9IG5vdmVsVHJlZS5hZGRWb2x1bWUoe1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdHZvbHVtZV90aXRsZSxcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHR2b2x1bWVfbGV2ZWwsXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0dm9sdW1lX2luZGV4OiBwYXJlbnRWb2x1bWUuc2l6ZSgpLFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdHRvdGFsX2lkeDogdG90YWxfaWR4KyssXG5cdFx0XHRcdFx0XHRcdFx0XHRcdH0sIHBhcmVudFZvbHVtZSk7XG5cdFx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdFx0aWYgKCFub3dWb2x1bWUpXG5cdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHRub3dWb2x1bWUgPSBub3ZlbFRyZWUuYWRkVm9sdW1lKHtcblx0XHRcdFx0XHRcdFx0XHRcdHZvbHVtZV90aXRsZSxcblx0XHRcdFx0XHRcdFx0XHRcdHZvbHVtZV9sZXZlbCxcblx0XHRcdFx0XHRcdFx0XHRcdHZvbHVtZV9pbmRleDogbm92ZWxUcmVlLnJvb3QoKS5zaXplKCksXG5cdFx0XHRcdFx0XHRcdFx0XHR0b3RhbF9pZHg6IHRvdGFsX2lkeCsrLFxuXHRcdFx0XHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdFx0Y3VycmVudFZvbHVtZSA9IG5vd1ZvbHVtZTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdGVsc2UgaWYgKDEpXG5cdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdGlmICghY3VycmVudFZvbHVtZSlcblx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdC8qXG5cdFx0XHRcdFx0XHRcdFx0Y3VycmVudFZvbHVtZSA9IHZvbHVtZV9saXN0W3ZvbHVtZV9saXN0Lmxlbmd0aF0gPSB7XG5cdFx0XHRcdFx0XHRcdFx0XHR2b2x1bWVfaW5kZXg6IHZvbHVtZV9saXN0Lmxlbmd0aCxcblx0XHRcdFx0XHRcdFx0XHRcdHZvbHVtZV90aXRsZTogJ251bGwnLFxuXHRcdFx0XHRcdFx0XHRcdFx0Y2hhcHRlcl9saXN0OiBbXSxcblx0XHRcdFx0XHRcdFx0XHR9O1xuXHRcdFx0XHRcdFx0XHRcdCovXG5cblx0XHRcdFx0XHRcdFx0XHRsZXQgdm9sdW1lX3RpdGxlID0gJ251bGwnO1xuXHRcdFx0XHRcdFx0XHRcdGxldCB2b2x1bWVfbGV2ZWwgPSBudWxsO1xuXG5cdFx0XHRcdFx0XHRcdFx0Y3VycmVudFZvbHVtZSA9IG5vdmVsVHJlZS5hZGRWb2x1bWUoe1xuXHRcdFx0XHRcdFx0XHRcdFx0dm9sdW1lX3RpdGxlLFxuXHRcdFx0XHRcdFx0XHRcdFx0dm9sdW1lX2xldmVsLFxuXHRcdFx0XHRcdFx0XHRcdFx0dm9sdW1lX2luZGV4OiBub3ZlbFRyZWUucm9vdCgpLnNpemUoKSxcblx0XHRcdFx0XHRcdFx0XHRcdHRvdGFsX2lkeDogdG90YWxfaWR4KyssXG5cdFx0XHRcdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0XHRsZXQgYSA9IHRyLmZpbmQoJ2E6ZXEoMCknKTtcblxuXHRcdFx0XHRcdFx0XHRsZXQgY2hhcHRlcl90aXRsZSA9IHRyaW0oYS5maW5kKCcud2lkZ2V0LXRvYy1lcGlzb2RlLXRpdGxlTGFiZWwnKS50ZXh0KCksIHRydWUpO1xuXG5cdFx0XHRcdFx0XHRcdGxldCBjaGFwdGVyX2RhdGU7XG5cdFx0XHRcdFx0XHRcdGxldCBkZDtcblx0XHRcdFx0XHRcdFx0bGV0IGRhID0gYS5maW5kKCcud2lkZ2V0LXRvYy1lcGlzb2RlLWRhdGVQdWJsaXNoZWQnKTtcblxuXHRcdFx0XHRcdFx0XHRpZiAoIWRkKVxuXHRcdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdFx0ZGQgPSBkYS5hdHRyKCdkYXRldGltZScpLnJlcGxhY2UoL15cXHMrfFxccyskL2csICcnKTtcblx0XHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHRcdGlmIChkZClcblx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdGNoYXB0ZXJfZGF0ZSA9IG1vbWVudChkZCkubG9jYWwoKTtcblx0XHRcdFx0XHRcdFx0XHRfY2FjaGVfZGF0ZXMucHVzaChjaGFwdGVyX2RhdGUudW5peCgpKTtcblx0XHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHRcdGxldCBocmVmID0gYS5wcm9wKCdocmVmJyk7XG5cblx0XHRcdFx0XHRcdFx0bGV0IGRhdGEgPSBzZWxmLnBhcnNlVXJsKGhyZWYpO1xuXG5cdFx0XHRcdFx0XHRcdGlmICghZGF0YS5jaGFwdGVyX2lkKVxuXHRcdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdFx0Lypcblx0XHRcdFx0XHRcdFx0XHRjb25zb2xlLmxvZyhhKTtcblx0XHRcdFx0XHRcdFx0XHRjb25zb2xlLmxvZyhkYXRhKTtcblx0XHRcdFx0XHRcdFx0XHRjb25zb2xlLmxvZyhocmVmKTtcblx0XHRcdFx0XHRcdFx0XHRjb25zb2xlLmxvZyhhLmF0dHIoJ2hyZWYnKSk7XG5cdFx0XHRcdFx0XHRcdFx0Y29uc29sZS5sb2cobmV3IFVSTChocmVmLCBkb20udXJsKSk7XG5cblx0XHRcdFx0XHRcdFx0XHRjb25zb2xlLmxvZyhkb20uX29wdGlvbnMpO1xuXHRcdFx0XHRcdFx0XHRcdCovXG5cblx0XHRcdFx0XHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoKVxuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdGVsc2Vcblx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdGhyZWYgPSBzZWxmLm1ha2VVcmwoZGF0YSk7XG5cblx0XHRcdFx0XHRcdFx0XHRkYXRhLnVybCA9IGhyZWY7XG5cdFx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0XHQvKlxuXHRcdFx0XHRcdFx0XHRjdXJyZW50Vm9sdW1lXG5cdFx0XHRcdFx0XHRcdFx0LmNoYXB0ZXJfbGlzdFxuXHRcdFx0XHRcdFx0XHRcdC5wdXNoKHtcblx0XHRcdFx0XHRcdFx0XHRcdGNoYXB0ZXJfaW5kZXg6IGN1cnJlbnRWb2x1bWUuY2hhcHRlcl9saXN0Lmxlbmd0aCxcblx0XHRcdFx0XHRcdFx0XHRcdGNoYXB0ZXJfdGl0bGU6IGNoYXB0ZXJfdGl0bGUucmVwbGFjZSgvXlxccyt8XFxzKyQvZywgJycpLFxuXHRcdFx0XHRcdFx0XHRcdFx0Y2hhcHRlcl9pZDogZGF0YS5jaGFwdGVyX2lkLFxuXHRcdFx0XHRcdFx0XHRcdFx0Y2hhcHRlcl91cmw6IGhyZWYsXG5cdFx0XHRcdFx0XHRcdFx0XHRjaGFwdGVyX3VybF9kYXRhOiBkYXRhLFxuXHRcdFx0XHRcdFx0XHRcdFx0Y2hhcHRlcl9kYXRlLFxuXHRcdFx0XHRcdFx0XHRcdH0pXG5cdFx0XHRcdFx0XHRcdDtcblx0XHRcdFx0XHRcdFx0Ki9cblxuXHRcdFx0XHRcdFx0XHRsZXQgY2hhcHRlciA9IHtcblx0XHRcdFx0XHRcdFx0XHRjaGFwdGVyX3RpdGxlLFxuXHRcdFx0XHRcdFx0XHRcdGNoYXB0ZXJfaWQ6IGRhdGEuY2hhcHRlcl9pZCxcblx0XHRcdFx0XHRcdFx0XHRjaGFwdGVyX3VybDogaHJlZixcblx0XHRcdFx0XHRcdFx0XHRjaGFwdGVyX3VybF9kYXRhOiBkYXRhLFxuXHRcdFx0XHRcdFx0XHRcdGNoYXB0ZXJfZGF0ZSxcblx0XHRcdFx0XHRcdFx0XHRjaGFwdGVyX2luZGV4OiBjdXJyZW50Vm9sdW1lLnNpemUoKSxcblx0XHRcdFx0XHRcdFx0XHR0b3RhbF9pZHg6IHRvdGFsX2lkeCsrLFxuXHRcdFx0XHRcdFx0XHR9O1xuXG5cdFx0XHRcdFx0XHRcdG5vdmVsVHJlZS5hZGRDaGFwdGVyKGNoYXB0ZXIsIGN1cnJlbnRWb2x1bWUpXG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fSlcblx0XHRcdFx0O1xuXG5cdFx0XHRcdF9jYWNoZV9kYXRlcy5zb3J0KCk7XG5cblx0XHRcdFx0bGV0IG5vdmVsX2RhdGUgPSBtb21lbnQudW5peChfY2FjaGVfZGF0ZXNbX2NhY2hlX2RhdGVzLmxlbmd0aCAtIDFdKS5sb2NhbCgpO1xuXG5cdFx0XHRcdGxldCBkYXRhX21ldGE6IElNZGNvbmZNZXRhID0ge307XG5cblx0XHRcdFx0e1xuXHRcdFx0XHRcdGRhdGFfbWV0YS5ub3ZlbCA9IHt9O1xuXHRcdFx0XHRcdGRhdGFfbWV0YS5ub3ZlbC50YWdzID0gW107XG5cblx0XHRcdFx0XHQkKCcjd29ya01ldGEtZmxhZ3MnKVxuXHRcdFx0XHRcdFx0LmZpbmQoJyN3b3JrR2VucmUgYSwgI3dvcmtNZXRhLWF0dGVudGlvbnNBbmRUYWdzIFtpdGVtcHJvcD1cImtleXdvcmRzXCJdIGEnKVxuXHRcdFx0XHRcdFx0LmVhY2goZnVuY3Rpb24gKClcblx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdFx0XHRcdFx0XHRsZXQgdCA9ICQodGhpcykudGV4dCgpLnJlcGxhY2UoL15cXHMrfFxccyskL2csICcnKTtcblx0XHRcdFx0XHRcdFx0aWYgKHQpXG5cdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHRkYXRhX21ldGEubm92ZWwudGFncy5wdXNoKHQpO1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHR9KVxuXHRcdFx0XHRcdDtcblxuXHRcdFx0XHRcdCQoJyN3b3JrTWV0YS1mbGFncycpXG5cdFx0XHRcdFx0XHQuZmluZCgnI3dvcmtNZXRhLWF0dGVudGlvbiBsaSwgI3dvcmtHZW5yZSA+IGE6ZXEoMCknKVxuXHRcdFx0XHRcdFx0LmVhY2goZnVuY3Rpb24gKClcblx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdFx0XHRcdFx0XHRsZXQgdCA9ICQodGhpcykudGV4dCgpLnJlcGxhY2UoL15cXHMrfFxccyskL2csICcnKTtcblx0XHRcdFx0XHRcdFx0aWYgKHQpXG5cdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHRkYXRhX21ldGEubm92ZWwudGFncy5wdXNoKHQpO1xuXG5cdFx0XHRcdFx0XHRcdFx0aWYgKHQgPT0gJ+aAp+aPj+WGmeacieOCiicpXG5cdFx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdFx0ZGF0YV9tZXRhLm5vdmVsLnRhZ3MucHVzaChgbm92ZWwxOGApO1xuXHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0fSlcblx0XHRcdFx0XHQ7XG5cblx0XHRcdFx0XHQkKCcjdGFibGUtb2YtY29udGVudHMgLndpZGdldC10b2Mtd29ya1N0YXR1cyBzcGFuOmVxKDApJylcblx0XHRcdFx0XHRcdC5lYWNoKGZ1bmN0aW9uICgpXG5cdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdC8vIEB0cy1pZ25vcmVcblx0XHRcdFx0XHRcdFx0ZGF0YV9tZXRhLm5vdmVsLnN0YXR1cyA9ICQodGhpcykudGV4dCgpLnJlcGxhY2UoL15cXHMrfFxccyskL2csICcnKTtcblx0XHRcdFx0XHRcdH0pXG5cdFx0XHRcdFx0O1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0cmV0dXJuIHtcblxuXHRcdFx0XHRcdC4uLmRhdGFfbWV0YSxcblxuXHRcdFx0XHRcdHVybDogZG9tLnVybCxcblx0XHRcdFx0XHR1cmxfZGF0YSxcblxuXHRcdFx0XHRcdG5vdmVsX3RpdGxlLFxuXHRcdFx0XHRcdG5vdmVsX2F1dGhvcixcblxuXHRcdFx0XHRcdG5vdmVsX2Rlc2MsXG5cdFx0XHRcdFx0bm92ZWxfZGF0ZSxcblx0XHRcdFx0XHRub3ZlbF9wdWJsaXNoZXIsXG5cblx0XHRcdFx0XHQvL3ZvbHVtZV9saXN0LFxuXHRcdFx0XHRcdG5vdmVsVHJlZSxcblxuXHRcdFx0XHRcdGNoZWNrZGF0ZTogbW9tZW50KCkubG9jYWwoKSxcblxuXHRcdFx0XHRcdGltZ3M6IFtdIGFzIHN0cmluZ1tdLFxuXHRcdFx0XHR9IGFzIElOb3ZlbDtcblx0XHRcdH0pXG5cdFx0XHQ7XG5cdH1cblxufVxuXG5leHBvcnQgZGVmYXVsdCBOb3ZlbFNpdGVLYWt1eW9tdTtcbiJdfQ==