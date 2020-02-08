"use strict";
/**
 * Created by user on 2017/12/6/006.
 */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs-extra");
const util_1 = require("fs-iconv/util");
const path = require("upath2");
const node_novel_info_1 = require("node-novel-info");
const jsdom_extra_1 = require("jsdom-extra");
const index_1 = require("../index");
const index_2 = require("../index");
const index_3 = require("../index");
const shortid = require("shortid");
const fetch_1 = require("../../fetch");
const jsdom_1 = require("../../jsdom");
/**
 * @deprecated
 */
// @ts-ignore
let NovelSiteDmzj = class NovelSiteDmzj extends index_1.default {
    _makeUrl(urlobj, page) {
        if (!urlobj.chapter_id) {
            if (!urlobj.volume_id) {
                return `http://q.dmzj.com/${urlobj.novel_id}/index.shtml`;
            }
            return `http://q.dmzj.com/${urlobj.novel_id}/${urlobj.volume_id}/${urlobj.volume_id}.txt`;
        }
        return `http://q.dmzj.com/${urlobj.novel_id}/${urlobj.volume_id}/${urlobj.chapter_id}${page
            ? '_' + page
            : ''}.shtml`;
    }
    makeUrl(urlobj, bool) {
        let url = this._makeUrl(urlobj, bool);
        // @ts-ignore
        return new URL(url);
    }
    parseUrl(url) {
        let urlobj = {
            // @ts-ignore
            url: new URL(url),
            novel_id: null,
            volume_id: null,
            chapter_id: null,
        };
        url = urlobj.url.href;
        let r = /(?:q\.dmzj\.com\/|^\/)(?:(\d+)\/(?:(\d+)\/(?:(\d+)[\._])?)?)/;
        let m = r.exec(url.toString());
        if (m) {
            urlobj.novel_id = m[1];
            urlobj.volume_id = m[2];
            urlobj.chapter_id = m[3];
        }
        // @ts-ignore
        return urlobj;
    }
    // @ts-ignore
    download(url, downloadOptions = {}) {
        const self = this;
        const [PATH_NOVEL_MAIN, optionsRuntime] = this.getOutputDir(downloadOptions);
        /*
        optionsRuntime.optionsJSDOM = Object.assign({}, defaultJSDOMOptions, optionsRuntime.optionsJSDOM, {
            runScripts: 'dangerously',
        });
        */
        optionsRuntime.optionsJSDOM = jsdom_1.createOptionsJSDOM(optionsRuntime.optionsJSDOM, {
            runScripts: 'dangerously',
        });
        let path_main;
        return index_2.PromiseBluebird
            .bind(self)
            .then(async function () {
            let _data = await self._download_info(url, optionsRuntime);
            path_main = path.join(self.PATH_NOVEL_MAIN, util_1.trimFilename(`${_data.data.g_lnovel_name}_(${_data.data.g_lnovel_id})`));
            let _a = _data.value.reduce(function (a, b) {
                return a.concat(b.chapter);
            }, []);
            let _f = await index_2.PromiseBluebird
                .mapSeries(_a, function (a, index, len) {
                let pad_len = len.toString().length > 4 ? len.toString().length : 4;
                // @ts-ignore
                let volume_name = a.volume_name;
                // @ts-ignore
                console.log(a.url);
                // @ts-ignore
                return self._downloadChapter(a.url, optionsRuntime)
                    .then(async function (data) {
                    let _file = path.join(path_main, 
                    // @ts-ignore
                    util_1.trimFilename(`${a.index_volume.toString()
                        .padStart(pad_len, '0')} ${volume_name}_(${data.data.g_volume_id})`), 
                    // @ts-ignore
                    util_1.trimFilename(`${a.index.toString()
                        .padStart(pad_len, '0')}_${data.data.chapter_name}.${data.data.g_chapter_id}`));
                    await fs.outputJson(_file + '.json', data, {
                        spaces: "\t",
                    });
                    await fs.outputFile(_file + '.txt', data.value);
                    return path.relative(self.PATH_NOVEL_MAIN, _file);
                })
                    .then(function (file) {
                    console.log('done', file);
                    return file;
                });
            })
                .then(function (ret) {
                //console.log('done', ret);
                return ret;
            });
            // @ts-ignore
            _data.checkdate = index_3.moment().tz(index_3.moment.tz.guess());
            // @ts-ignore
            _data.files = _f;
            return _data;
        })
            .tap(async function (novel) {
            await fs.outputJson(path.join(path_main, util_1.trimFilename(`${novel.data.g_lnovel_name}.${novel.data.g_lnovel_id}`)) + '.json', novel, {
                spaces: "\t",
            });
            let options = {};
            options[self.IDKEY] = {
            //txtdownload_id: novel.novel_syosetu_id,
            };
            let md = node_novel_info_1.default.stringify({
                novel: {
                    tags: [
                        self.IDKEY,
                    ],
                    series: {
                        // @ts-ignore
                        name: novel.novel_series_title || '',
                    },
                },
                options,
                // @ts-ignore
                link: novel.link || [],
            }, novel, {
                options: {
                    textlayout: {
                        allow_lf2: true,
                    }
                },
            });
            let file = path.join(path_main, `README.md`);
            await fs.outputFile(file, md);
        });
    }
    async _download_info(url, optionsRuntime = {}) {
        const self = this;
        {
            let data = self.parseUrl(url);
            if (!data.novel_id) {
                throw new ReferenceError();
            }
            url = self.makeUrl({
                novel_id: data.novel_id,
            });
        }
        let _data = {
            url: url,
            data: {},
            value: null,
        };
        return await jsdom_extra_1.fromURL(url, optionsRuntime.optionsJSDOM)
            .then(function (dom) {
            const $ = dom.$;
            // @ts-ignore
            const window = dom.window;
            //console.log(dom.serialize());
            _data.data.g_lnovel_id = window.g_lnovel_id;
            _data.data.g_lnovel_name = window.g_lnovel_name;
            _data.data.cover_pic = $('#cover_pic').attr('src');
            {
                let _t = $('.main .pic .con').text();
                _data.data.con = _t;
                if (_t.match(/作者：(.+)/)) {
                    _data.data.author = RegExp.$1;
                }
                if (_t.match(/类型：(.+)/)) {
                    _data.data.type = (RegExp.$1).toString().split('/');
                }
                if (_t.match(/状态：(.+)/)) {
                    _data.data.status = RegExp.$1;
                }
                if (_t.match(/更新：(.+)/)) {
                    _data.data.lastupdate = index_3.moment.tz(RegExp.$1, 'YYYY-MM-DD HH:mm:ss', 'Asia/Taipei');
                }
            }
            // @ts-ignore
            _data.data.desc = $('#detail_block > .ilist:has(> h3) > p').text();
            window.volume_list = window.volume_list.reverse();
            window.chapter_list = window.chapter_list.reverse();
            let list = [];
            for (let v in window.chapter_list) {
                let volume_name = $(window.volume_list[v]).find('.chapnamesub').text();
                window.chapter_list[v] = window.chapter_list[v].reverse();
                //let data = parseUrl($(dom.window.chapter_list[v][0]).attr('href'));
                list[v] = {
                    index: v,
                    novel_id: null,
                    volume_name: volume_name,
                    volume_id: null,
                    chapter: [],
                };
                for (let ci in window.chapter_list[v]) {
                    if (!window.chapter_list[v][ci]) {
                        continue;
                    }
                    let _a = $(window.chapter_list[v][ci]);
                    //console.log(_a);
                    let _d = self.parseUrl(_a.prop('href'));
                    if (!list[v].volume_id) {
                        list[v].novel_id = _d.novel_id;
                        list[v].volume_id = _d.volume_id;
                    }
                    list[v].chapter.push({
                        index: ci,
                        index_volume: v,
                        novel_id: _d.novel_id,
                        volume_id: _d.volume_id,
                        volume_name: volume_name,
                        chapter_name: _a.text(),
                        chapter_id: _d.chapter_id,
                        url: _a.prop('href'),
                    });
                }
            }
            _data.value = list;
            return _data;
        })
            .then(function (_data) {
            // @ts-ignore
            _data.checkdate = index_3.moment().tz(index_3.moment.tz.guess());
            return _data;
        });
    }
    async _downloadChapter(data, optionsRuntime) {
        const self = this;
        let url;
        {
            data = self.parseUrl(data);
            if (!data.novel_id) {
                throw new ReferenceError();
            }
            url = self.makeUrl(data);
        }
        let _data = {};
        let $;
        return jsdom_extra_1.fromURL(url, optionsRuntime.optionsJSDOM)
            .then(async (dom) => {
            let window = dom.window;
            $ = dom.$;
            let chapter_name = window.g_chapter_name
                .replace(/\\/ig, '')
                .replace(/^[\s\uFEFF\xA0　]+|[\s\uFEFF\xA0　]+$/g, '');
            let volume_name = window.document
                .querySelector('#page_contents .tit')
                .innerHTML
                .replace(/\\/ig, '')
                .replace(chapter_name, '')
                .replace(/^[\s\uFEFF\xA0　]+|[\s\uFEFF\xA0　]+$/g, '');
            _data = {
                url: url,
                data: {
                    g_lnovel_id: window.g_lnovel_id,
                    g_volume_id: window.g_volume_id,
                    g_chapter_id: window.g_chapter_id,
                    g_lnovel_name: window.g_lnovel_name,
                    g_volume_name: volume_name,
                    g_chapter_name: chapter_name,
                    chapter_name: chapter_name,
                    volume_name: volume_name,
                },
                value: null,
            };
            let pa = [];
            pa[0] = window.document.querySelector("#chapter_contents_first").innerHTML;
            if (window.g_chapter_pages_count > 1) {
                let ua = window.g_chapter_pages_url
                    .filter(function (value) {
                    return value;
                })
                    .map(function (value, index, array) {
                    if (value) {
                        value = 'http://q.dmzj.com/' + value;
                    }
                    return value;
                });
                await fetch_1.manyRequest(ua, {
                    encoding: null,
                    resolveWithFullResponse: true,
                })
                    .then(async function (ret) {
                    pa = pa.concat(ret.map(function (value, index, array) {
                        //console.log(value.body);
                        return value.body.toString();
                    }));
                });
            }
            return pa;
        })
            .then(async function (pa) {
            _data.imgs = [];
            pa = await index_2.PromiseBluebird.mapSeries(pa, async function (value, idx) {
                let _c = {};
                //let $ = cheerio.load(value);
                let _a = $(value);
                let _img = _a.find('img');
                //console.log(_img.length);
                if (_img.length) {
                    _img.each(function (index, elem) {
                        // @ts-ignore
                        let _this = $(this);
                        if (_this.prop('src')) {
                            let id = shortid();
                            _c[id] = _this.prop('src');
                            _data.imgs.push(_c[id]);
                            // @ts-ignore
                            $(`<span>{{@${id}@}}</span>`).insertAfter(this);
                            // @ts-ignore
                            $(this)
                                .remove();
                        }
                    });
                    //console.log($.html());
                }
                let _t = _a.text();
                for (let id in _c) {
                    /*
                    if (!/^(?:[a-z]\:|\:)?\/\//i.test(_c[id]))
                    {
                        _c[id] = 'http://q.dmzj.com/' + _c[id];
                    }
                    */
                    /*
                    await download_image(_c[id], {
                        fromfile: file,
                        prefix: 'img_' + (_idx++).toString().padStart(3, '0') + '_',
                    });
                    */
                    _t = _t.replace(`{{@${id}@}}`, `\n\n<img src="${_c[id]}"/>\n\n`);
                }
                return _t;
            });
            return pa.join("\n");
        })
            .then(function (html) {
            return html
                .replace(/^\s*(?:<p>)?/i, '')
                .replace(/\s*<(?:\/?p|br\/?)>\s*$/i, '')
                .replace(/\r\n|\r(?!\n)/g, "\n")
                //.replace(/<\/p><p>\n/ig, "\n")
                //.replace(/<p><\/p>/ig, "\n")
                //.replace(/(<\/p>|<p>)\n/ig, "\n")
                .replace(/[\t\uFEFF\xA0　]+(\n|$)/ig, "$1")
                .replace(/(\n)[\t]+/ig, "$1")
                .replace(/\s+$/ig, "")
                .replace(/\n{3,}/ig, "\n\n");
        })
            .then(function (html) {
            _data.value = html;
            _data.checkdate = index_3.moment().tz(index_3.moment.tz.guess());
            return _data;
        });
    }
};
NovelSiteDmzj.disabled = true;
NovelSiteDmzj.IDKEY = 'dmzj';
NovelSiteDmzj = __decorate([
    index_1.staticImplements()
], NovelSiteDmzj);
exports.NovelSiteDmzj = NovelSiteDmzj;
exports.default = NovelSiteDmzj;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7O0dBRUc7Ozs7Ozs7O0FBRUgsK0JBQWdDO0FBQ2hDLHdDQUE2QztBQUM3QywrQkFBK0I7QUFDL0IscURBQXlEO0FBQ3pELDZDQUErRDtBQU0vRCxvQ0FBMEY7QUFDMUYsb0NBQThEO0FBQzlELG9DQUFrQztBQUNsQyxtQ0FBbUM7QUFDbkMsdUNBQTBDO0FBQzFDLHVDQUFpRDtBQUVqRDs7R0FFRztBQUNILGFBQWE7QUFFYixJQUFhLGFBQWEsR0FBMUIsTUFBYSxhQUFjLFNBQVEsZUFBUztJQU0zQyxRQUFRLENBQUMsTUFBMkIsRUFBRSxJQUFLO1FBRTFDLElBQUksQ0FBQyxNQUFNLENBQUMsVUFBVSxFQUN0QjtZQUNDLElBQUksQ0FBQyxNQUFNLENBQUMsU0FBUyxFQUNyQjtnQkFDQyxPQUFPLHFCQUFxQixNQUFNLENBQUMsUUFBUSxjQUFjLENBQUM7YUFDMUQ7WUFFRCxPQUFPLHFCQUFxQixNQUFNLENBQUMsUUFBUSxJQUFJLE1BQU0sQ0FBQyxTQUFTLElBQUksTUFBTSxDQUFDLFNBQVMsTUFBTSxDQUFDO1NBQzFGO1FBRUQsT0FBTyxxQkFBcUIsTUFBTSxDQUFDLFFBQVEsSUFBSSxNQUFNLENBQUMsU0FBUyxJQUFJLE1BQU0sQ0FBQyxVQUFVLEdBQUcsSUFBSTtZQUMxRixDQUFDLENBQUMsR0FBRyxHQUFHLElBQUk7WUFDWixDQUFDLENBQUMsRUFBRSxRQUFRLENBQUM7SUFDZixDQUFDO0lBRUQsT0FBTyxDQUFDLE1BQTJCLEVBQUUsSUFBYztRQUVsRCxJQUFJLEdBQUcsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsQ0FBQztRQUV0QyxhQUFhO1FBQ2IsT0FBTyxJQUFJLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUNyQixDQUFDO0lBRUQsUUFBUSxDQUFDLEdBQWlCO1FBRXpCLElB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LENBQUMsZ0JBQWdCLEVBQUUsSUFBSSxDQUFDO2dCQUNoQyxnQ0FBZ0M7Z0JBQ2hDLDhCQUE4QjtnQkFDOUIsbUNBQW1DO2lCQUNsQyxPQUFPLENBQUMsMEJBQTBCLEVBQUUsSUFBSSxDQUFDO2lCQUN6QyxPQUFPLENBQUMsYUFBYSxFQUFFLElBQUksQ0FBQztpQkFDNUIsT0FBTyxDQUFDLFFBQVEsRUFBRSxFQUFFLENBQUM7aUJBQ3JCLE9BQU8sQ0FBQyxVQUFVLEVBQUUsTUFBTSxDQUFDLENBQzNCO1FBQ0gsQ0FBQyxDQUFDO2FBQ0QsSUFBSSxDQUFDLFVBQVUsSUFBSTtZQUVuQixLQUFLLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQztZQUNuQixLQUFLLENBQUMsU0FBUyxHQUFHLGNBQU0sRUFBRSxDQUFDLEVBQUUsQ0FBQyxjQUFNLENBQUMsRUFBRSxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUM7WUFFakQsT0FBTyxLQUFLLENBQUM7UUFDZCxDQUFDLENBQUMsQ0FDRDtJQUNILENBQUM7Q0FFRCxDQUFBO0FBcGhCTyxzQkFBUSxHQUFHLElBQUksQ0FBQztBQUVoQixtQkFBSyxHQUFHLE1BQU0sQ0FBQztBQUpWLGFBQWE7SUFEekIsd0JBQWdCLEVBQTZDO0dBQ2pELGFBQWEsQ0FzaEJ6QjtBQXRoQlksc0NBQWE7QUF3aEIxQixrQkFBZSxhQUFhLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENyZWF0ZWQgYnkgdXNlciBvbiAyMDE3LzEyLzYvMDA2LlxuICovXG5cbmltcG9ydCBmcyA9IHJlcXVpcmUoJ2ZzLWV4dHJhJyk7XG5pbXBvcnQgeyB0cmltRmlsZW5hbWUgfSBmcm9tICdmcy1pY29udi91dGlsJztcbmltcG9ydCAqIGFzIHBhdGggZnJvbSAndXBhdGgyJztcbmltcG9ydCBub3ZlbEluZm8sIHsgSU1kY29uZk1ldGEgfSBmcm9tICdub2RlLW5vdmVsLWluZm8nO1xuaW1wb3J0IHsgZnJvbVVSTCwgSUZyb21VcmxPcHRpb25zLCBJSlNET00gfSBmcm9tICdqc2RvbS1leHRyYSc7XG4vLyBAdHMtaWdub3JlXG5pbXBvcnQgeyBMYXp5Q29va2llLCBMYXp5Q29va2llSmFyIH0gZnJvbSAnanNkb20tZXh0cmEnO1xuLy9pbXBvcnQgeyBVUkwgfSBmcm9tICdqc2RvbS11cmwnO1xuaW1wb3J0IHsgZG93bmxvYWRfaW1hZ2UgfSBmcm9tICcuLi9pbWFnZSc7XG5cbmltcG9ydCBOb3ZlbFNpdGUsIHsgc3RhdGljSW1wbGVtZW50cywgZGVmYXVsdEpTRE9NT3B0aW9ucywgU1lNQk9MX0NBQ0hFIH0gZnJvbSAnLi4vaW5kZXgnO1xuaW1wb3J0IHsgUHJvbWlzZUJsdWViaXJkLCBibHVlYmlyZERlY29yYXRvciB9IGZyb20gJy4uL2luZGV4JztcbmltcG9ydCB7IG1vbWVudCB9IGZyb20gJy4uL2luZGV4JztcbmltcG9ydCAqIGFzIHNob3J0aWQgZnJvbSAnc2hvcnRpZCc7XG5pbXBvcnQgeyBtYW55UmVxdWVzdCB9IGZyb20gJy4uLy4uL2ZldGNoJztcbmltcG9ydCB7IGNyZWF0ZU9wdGlvbnNKU0RPTSB9IGZyb20gJy4uLy4uL2pzZG9tJztcblxuLyoqXG4gKiBAZGVwcmVjYXRlZFxuICovXG4vLyBAdHMtaWdub3JlXG5Ac3RhdGljSW1wbGVtZW50czxOb3ZlbFNpdGUuSU5vdmVsU2l0ZVN0YXRpYzxOb3ZlbFNpdGVEbXpqPj4oKVxuZXhwb3J0IGNsYXNzIE5vdmVsU2l0ZURtemogZXh0ZW5kcyBOb3ZlbFNpdGVcbntcblx0c3RhdGljIGRpc2FibGVkID0gdHJ1ZTtcblxuXHRzdGF0aWMgSURLRVkgPSAnZG16aic7XG5cblx0X21ha2VVcmwodXJsb2JqOiBOb3ZlbFNpdGUuSVBhcnNlVXJsLCBwYWdlPylcblx0e1xuXHRcdGlmICghdXJsb2JqLmNoYXB0ZXJfaWQpXG5cdFx0e1xuXHRcdFx0aWYgKCF1cmxvYmoudm9sdW1lX2lkKVxuXHRcdFx0e1xuXHRcdFx0XHRyZXR1cm4gYGh0dHA6Ly9xLmRtemouY29tLyR7dXJsb2JqLm5vdmVsX2lkfS9pbmRleC5zaHRtbGA7XG5cdFx0XHR9XG5cblx0XHRcdHJldHVybiBgaHR0cDovL3EuZG16ai5jb20vJHt1cmxvYmoubm92ZWxfaWR9LyR7dXJsb2JqLnZvbHVtZV9pZH0vJHt1cmxvYmoudm9sdW1lX2lkfS50eHRgO1xuXHRcdH1cblxuXHRcdHJldHVybiBgaHR0cDovL3EuZG16ai5jb20vJHt1cmxvYmoubm92ZWxfaWR9LyR7dXJsb2JqLnZvbHVtZV9pZH0vJHt1cmxvYmouY2hhcHRlcl9pZH0ke3BhZ2Vcblx0XHRcdD8gJ18nICsgcGFnZVxuXHRcdFx0OiAnJ30uc2h0bWxgO1xuXHR9XG5cblx0bWFrZVVybCh1cmxvYmo6IE5vdmVsU2l0ZS5JUGFyc2VVcmwsIGJvb2wgPzogbnVtYmVyKTogVVJMXG5cdHtcblx0XHRsZXQgdXJsID0gdGhpcy5fbWFrZVVybCh1cmxvYmosIGJvb2wpO1xuXG5cdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdHJldHVybiBuZXcgVVJMKHVybCk7XG5cdH1cblxuXHRwYXJzZVVybCh1cmw6IHN0cmluZyB8IFVSTCk6IE5vdmVsU2l0ZS5JUGFyc2VVcmxcblx0e1xuXHRcdGxldCB1cmxvYmogPSB7XG5cdFx0XHQvLyBAdHMtaWdub3JlXG5cdFx0XHR1cmw6IG5ldyBVUkwodXJsKSxcblxuXHRcdFx0bm92ZWxfaWQ6IG51bGwsXG5cdFx0XHR2b2x1bWVfaWQ6IG51bGwsXG5cdFx0XHRjaGFwdGVyX2lkOiBudWxsLFxuXHRcdH07XG5cblx0XHR1cmwgPSB1cmxvYmoudXJsLmhyZWY7XG5cblx0XHRsZXQgciA9IC8oPzpxXFwuZG16alxcLmNvbVxcL3xeXFwvKSg/OihcXGQrKVxcLyg/OihcXGQrKVxcLyg/OihcXGQrKVtcXC5fXSk/KT8pLztcblxuXHRcdGxldCBtID0gci5leGVjKHVybC50b1N0cmluZygpKTtcblxuXHRcdGlmIChtKVxuXHRcdHtcblx0XHRcdHVybG9iai5ub3ZlbF9pZCA9IG1bMV07XG5cdFx0XHR1cmxvYmoudm9sdW1lX2lkID0gbVsyXTtcblx0XHRcdHVybG9iai5jaGFwdGVyX2lkID0gbVszXTtcblx0XHR9XG5cblx0XHQvLyBAdHMtaWdub3JlXG5cdFx0cmV0dXJuIHVybG9iajtcblx0fVxuXG5cdC8vIEB0cy1pZ25vcmVcblx0ZG93bmxvYWQodXJsOiBzdHJpbmcgfCBVUkwsIGRvd25sb2FkT3B0aW9uczogTm92ZWxTaXRlLklEb3dubG9hZE9wdGlvbnMgPSB7fSlcblx0e1xuXHRcdGNvbnN0IHNlbGYgPSB0aGlzO1xuXG5cdFx0Y29uc3QgW1BBVEhfTk9WRUxfTUFJTiwgb3B0aW9uc1J1bnRpbWVdID0gdGhpcy5nZXRPdXRwdXREaXI8Tm92ZWxTaXRlLklPcHRpb25zUnVudGltZT4oZG93bmxvYWRPcHRpb25zKTtcblxuXHRcdC8qXG5cdFx0b3B0aW9uc1J1bnRpbWUub3B0aW9uc0pTRE9NID0gT2JqZWN0LmFzc2lnbih7fSwgZGVmYXVsdEpTRE9NT3B0aW9ucywgb3B0aW9uc1J1bnRpbWUub3B0aW9uc0pTRE9NLCB7XG5cdFx0XHRydW5TY3JpcHRzOiAnZGFuZ2Vyb3VzbHknLFxuXHRcdH0pO1xuXHRcdCovXG5cblx0XHRvcHRpb25zUnVudGltZS5vcHRpb25zSlNET00gPSBjcmVhdGVPcHRpb25zSlNET00ob3B0aW9uc1J1bnRpbWUub3B0aW9uc0pTRE9NLCB7XG5cdFx0XHRydW5TY3JpcHRzOiAnZGFuZ2Vyb3VzbHknLFxuXHRcdH0pO1xuXG5cdFx0bGV0IHBhdGhfbWFpbjogc3RyaW5nO1xuXG5cdFx0cmV0dXJuIFByb21pc2VCbHVlYmlyZFxuXHRcdFx0LmJpbmQoc2VsZilcblx0XHRcdC50aGVuKGFzeW5jIGZ1bmN0aW9uICgpXG5cdFx0XHR7XG5cdFx0XHRcdGxldCBfZGF0YSA9IGF3YWl0IHNlbGYuX2Rvd25sb2FkX2luZm8odXJsIGFzIGFueSwgb3B0aW9uc1J1bnRpbWUpO1xuXG5cdFx0XHRcdHBhdGhfbWFpbiA9IHBhdGguam9pbihzZWxmLlBBVEhfTk9WRUxfTUFJTixcblx0XHRcdFx0XHR0cmltRmlsZW5hbWUoYCR7X2RhdGEuZGF0YS5nX2xub3ZlbF9uYW1lfV8oJHtfZGF0YS5kYXRhLmdfbG5vdmVsX2lkfSlgKSxcblx0XHRcdFx0KTtcblxuXHRcdFx0XHRsZXQgX2EgPSBfZGF0YS52YWx1ZS5yZWR1Y2UoZnVuY3Rpb24gKGEsIGIpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRyZXR1cm4gYS5jb25jYXQoYi5jaGFwdGVyKTtcblx0XHRcdFx0fSwgW10pO1xuXG5cdFx0XHRcdGxldCBfZiA9IGF3YWl0IFByb21pc2VCbHVlYmlyZFxuXHRcdFx0XHRcdC5tYXBTZXJpZXMoX2EsIGZ1bmN0aW9uIChhLCBpbmRleCwgbGVuKVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdGxldCBwYWRfbGVuID0gbGVuLnRvU3RyaW5nKCkubGVuZ3RoID4gNCA/IGxlbi50b1N0cmluZygpLmxlbmd0aCA6IDQ7XG5cdFx0XHRcdFx0XHQvLyBAdHMtaWdub3JlXG5cdFx0XHRcdFx0XHRsZXQgdm9sdW1lX25hbWUgPSBhLnZvbHVtZV9uYW1lO1xuXG5cdFx0XHRcdFx0XHQvLyBAdHMtaWdub3JlXG5cdFx0XHRcdFx0XHRjb25zb2xlLmxvZyhhLnVybCk7XG5cblx0XHRcdFx0XHRcdC8vIEB0cy1pZ25vcmVcblx0XHRcdFx0XHRcdHJldHVybiBzZWxmLl9kb3dubG9hZENoYXB0ZXIoYS51cmwsIG9wdGlvbnNSdW50aW1lKVxuXHRcdFx0XHRcdFx0XHQudGhlbihhc3luYyBmdW5jdGlvbiAoZGF0YSlcblx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdGxldCBfZmlsZSA9IHBhdGguam9pbihwYXRoX21haW4sXG5cdFx0XHRcdFx0XHRcdFx0XHQvLyBAdHMtaWdub3JlXG5cdFx0XHRcdFx0XHRcdFx0XHR0cmltRmlsZW5hbWUoYCR7YS5pbmRleF92b2x1bWUudG9TdHJpbmcoKVxuXHRcdFx0XHRcdFx0XHRcdFx0XHQucGFkU3RhcnQocGFkX2xlbiwgJzAnKX0gJHt2b2x1bWVfbmFtZX1fKCR7ZGF0YS5kYXRhLmdfdm9sdW1lX2lkfSlgKSxcblx0XHRcdFx0XHRcdFx0XHRcdC8vIEB0cy1pZ25vcmVcblx0XHRcdFx0XHRcdFx0XHRcdHRyaW1GaWxlbmFtZShgJHthLmluZGV4LnRvU3RyaW5nKClcblx0XHRcdFx0XHRcdFx0XHRcdFx0LnBhZFN0YXJ0KHBhZF9sZW4sICcwJyl9XyR7ZGF0YS5kYXRhLmNoYXB0ZXJfbmFtZX0uJHtkYXRhLmRhdGEuZ19jaGFwdGVyX2lkfWApXG5cdFx0XHRcdFx0XHRcdFx0KTtcblxuXHRcdFx0XHRcdFx0XHRcdGF3YWl0IGZzLm91dHB1dEpzb24oX2ZpbGUgKyAnLmpzb24nLCBkYXRhLCB7XG5cdFx0XHRcdFx0XHRcdFx0XHRzcGFjZXM6IFwiXFx0XCIsXG5cdFx0XHRcdFx0XHRcdFx0fSk7XG5cblx0XHRcdFx0XHRcdFx0XHRhd2FpdCBmcy5vdXRwdXRGaWxlKF9maWxlICsgJy50eHQnLCBkYXRhLnZhbHVlKTtcblxuXHRcdFx0XHRcdFx0XHRcdHJldHVybiBwYXRoLnJlbGF0aXZlKHNlbGYuUEFUSF9OT1ZFTF9NQUlOLCBfZmlsZSk7XG5cdFx0XHRcdFx0XHRcdH0pXG5cdFx0XHRcdFx0XHRcdC50aGVuKGZ1bmN0aW9uIChmaWxlKVxuXHRcdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdFx0Y29uc29sZS5sb2coJ2RvbmUnLCBmaWxlKTtcblxuXHRcdFx0XHRcdFx0XHRcdHJldHVybiBmaWxlO1xuXHRcdFx0XHRcdFx0XHR9KVxuXHRcdFx0XHRcdFx0XHQ7XG5cdFx0XHRcdFx0fSlcblx0XHRcdFx0XHQudGhlbihmdW5jdGlvbiAocmV0KVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdC8vY29uc29sZS5sb2coJ2RvbmUnLCByZXQpO1xuXG5cdFx0XHRcdFx0XHRyZXR1cm4gcmV0O1xuXHRcdFx0XHRcdH0pXG5cdFx0XHRcdDtcblxuXHRcdFx0XHQvLyBAdHMtaWdub3JlXG5cdFx0XHRcdF9kYXRhLmNoZWNrZGF0ZSA9IG1vbWVudCgpLnR6KG1vbWVudC50ei5ndWVzcygpKTtcblxuXHRcdFx0XHQvLyBAdHMtaWdub3JlXG5cdFx0XHRcdF9kYXRhLmZpbGVzID0gX2Y7XG5cblx0XHRcdFx0cmV0dXJuIF9kYXRhO1xuXHRcdFx0fSlcblx0XHRcdC50YXAoYXN5bmMgZnVuY3Rpb24gKG5vdmVsKVxuXHRcdFx0e1xuXG5cdFx0XHRcdGF3YWl0IGZzLm91dHB1dEpzb24ocGF0aC5qb2luKHBhdGhfbWFpbiwgdHJpbUZpbGVuYW1lKGAke25vdmVsLmRhdGEuZ19sbm92ZWxfbmFtZX0uJHtub3ZlbC5kYXRhLmdfbG5vdmVsX2lkfWApKSArICcuanNvbicsIG5vdmVsLCB7XG5cdFx0XHRcdFx0c3BhY2VzOiBcIlxcdFwiLFxuXHRcdFx0XHR9KTtcblxuXHRcdFx0XHRsZXQgb3B0aW9ucyA9IHt9O1xuXHRcdFx0XHRvcHRpb25zW3NlbGYuSURLRVldID0ge1xuXHRcdFx0XHRcdC8vdHh0ZG93bmxvYWRfaWQ6IG5vdmVsLm5vdmVsX3N5b3NldHVfaWQsXG5cdFx0XHRcdH07XG5cblx0XHRcdFx0bGV0IG1kID0gbm92ZWxJbmZvLnN0cmluZ2lmeSh7XG5cdFx0XHRcdFx0bm92ZWw6IHtcblx0XHRcdFx0XHRcdHRhZ3M6IFtcblx0XHRcdFx0XHRcdFx0c2VsZi5JREtFWSxcblx0XHRcdFx0XHRcdF0sXG5cdFx0XHRcdFx0XHRzZXJpZXM6IHtcblx0XHRcdFx0XHRcdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdFx0XHRcdFx0XHRuYW1lOiBub3ZlbC5ub3ZlbF9zZXJpZXNfdGl0bGUgfHwgJycsXG5cdFx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0b3B0aW9ucyxcblx0XHRcdFx0XHQvLyBAdHMtaWdub3JlXG5cdFx0XHRcdFx0bGluazogbm92ZWwubGluayB8fCBbXSxcblx0XHRcdFx0fSwgbm92ZWwsIHtcblx0XHRcdFx0XHRvcHRpb25zOiB7XG5cdFx0XHRcdFx0XHR0ZXh0bGF5b3V0OiB7XG5cdFx0XHRcdFx0XHRcdGFsbG93X2xmMjogdHJ1ZSxcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9LFxuXHRcdFx0XHR9KTtcblxuXHRcdFx0XHRsZXQgZmlsZSA9IHBhdGguam9pbihwYXRoX21haW4sIGBSRUFETUUubWRgKTtcblx0XHRcdFx0YXdhaXQgZnMub3V0cHV0RmlsZShmaWxlLCBtZCk7XG5cblx0XHRcdH0pXG5cdFx0XHQ7XG5cdH1cblxuXHRhc3luYyBfZG93bmxvYWRfaW5mbyh1cmw6IFVSTCxcblx0XHRvcHRpb25zUnVudGltZTogUGFydGlhbDxOb3ZlbFNpdGUuSU9wdGlvbnNSdW50aW1lPiA9IHt9XG5cdClcblx0e1xuXHRcdGNvbnN0IHNlbGYgPSB0aGlzO1xuXG5cdFx0e1xuXHRcdFx0bGV0IGRhdGEgPSBzZWxmLnBhcnNlVXJsKHVybCk7XG5cblx0XHRcdGlmICghZGF0YS5ub3ZlbF9pZClcblx0XHRcdHtcblx0XHRcdFx0dGhyb3cgbmV3IFJlZmVyZW5jZUVycm9yKCk7XG5cdFx0XHR9XG5cblx0XHRcdHVybCA9IHNlbGYubWFrZVVybCh7XG5cdFx0XHRcdG5vdmVsX2lkOiBkYXRhLm5vdmVsX2lkLFxuXHRcdFx0fSk7XG5cdFx0fVxuXG5cdFx0bGV0IF9kYXRhID0ge1xuXG5cdFx0XHR1cmw6IHVybCxcblxuXHRcdFx0ZGF0YToge30gYXMgYW55LFxuXG5cdFx0XHR2YWx1ZTogbnVsbCBhcyBhbnlbXSxcblxuXHRcdH07XG5cblx0XHRyZXR1cm4gYXdhaXQgZnJvbVVSTCh1cmwsIG9wdGlvbnNSdW50aW1lLm9wdGlvbnNKU0RPTSlcblx0XHRcdC50aGVuKGZ1bmN0aW9uIChkb20pXG5cdFx0XHR7XG5cdFx0XHRcdGNvbnN0ICQgPSBkb20uJDtcblx0XHRcdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdFx0XHRjb25zdCB3aW5kb3cgPSBkb20ud2luZG93IGFzIHtcblx0XHRcdFx0XHRnX2xub3ZlbF9pZCxcblx0XHRcdFx0XHRnX2xub3ZlbF9uYW1lLFxuXG5cdFx0XHRcdFx0dm9sdW1lX2xpc3Q6IGFueVtdLFxuXHRcdFx0XHRcdGNoYXB0ZXJfbGlzdDogYW55W10sXG5cdFx0XHRcdH07XG5cblx0XHRcdFx0Ly9jb25zb2xlLmxvZyhkb20uc2VyaWFsaXplKCkpO1xuXG5cdFx0XHRcdF9kYXRhLmRhdGEuZ19sbm92ZWxfaWQgPSB3aW5kb3cuZ19sbm92ZWxfaWQ7XG5cdFx0XHRcdF9kYXRhLmRhdGEuZ19sbm92ZWxfbmFtZSA9IHdpbmRvdy5nX2xub3ZlbF9uYW1lO1xuXG5cdFx0XHRcdF9kYXRhLmRhdGEuY292ZXJfcGljID0gJCgnI2NvdmVyX3BpYycpLmF0dHIoJ3NyYycpO1xuXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRsZXQgX3QgPSAkKCcubWFpbiAucGljIC5jb24nKS50ZXh0KCk7XG5cblx0XHRcdFx0XHRfZGF0YS5kYXRhLmNvbiA9IF90O1xuXG5cdFx0XHRcdFx0aWYgKF90Lm1hdGNoKC/kvZzogIXvvJooLispLykpXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0X2RhdGEuZGF0YS5hdXRob3IgPSBSZWdFeHAuJDE7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGlmIChfdC5tYXRjaCgv57G75Z6L77yaKC4rKS8pKVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdF9kYXRhLmRhdGEudHlwZSA9IChSZWdFeHAuJDEpLnRvU3RyaW5nKCkuc3BsaXQoJy8nKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0aWYgKF90Lm1hdGNoKC/nirbmgIHvvJooLispLykpXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0X2RhdGEuZGF0YS5zdGF0dXMgPSBSZWdFeHAuJDE7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGlmIChfdC5tYXRjaCgv5pu05paw77yaKC4rKS8pKVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdF9kYXRhLmRhdGEubGFzdHVwZGF0ZSA9IG1vbWVudC50eihSZWdFeHAuJDEsICdZWVlZLU1NLUREIEhIOm1tOnNzJywgJ0FzaWEvVGFpcGVpJyk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cblx0XHRcdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdFx0XHRfZGF0YS5kYXRhLmRlc2MgPSAkKCcjZGV0YWlsX2Jsb2NrID4gLmlsaXN0Omhhcyg+IGgzKSA+IHAnKS50ZXh0KCk7XG5cblx0XHRcdFx0d2luZG93LnZvbHVtZV9saXN0ID0gd2luZG93LnZvbHVtZV9saXN0LnJldmVyc2UoKTtcblx0XHRcdFx0d2luZG93LmNoYXB0ZXJfbGlzdCA9IHdpbmRvdy5jaGFwdGVyX2xpc3QucmV2ZXJzZSgpO1xuXG5cdFx0XHRcdGxldCBsaXN0ID0gW107XG5cblx0XHRcdFx0Zm9yIChsZXQgdiBpbiB3aW5kb3cuY2hhcHRlcl9saXN0KVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0bGV0IHZvbHVtZV9uYW1lID0gJCh3aW5kb3cudm9sdW1lX2xpc3Rbdl0pLmZpbmQoJy5jaGFwbmFtZXN1YicpLnRleHQoKTtcblxuXHRcdFx0XHRcdHdpbmRvdy5jaGFwdGVyX2xpc3Rbdl0gPSB3aW5kb3cuY2hhcHRlcl9saXN0W3ZdLnJldmVyc2UoKTtcblxuXHRcdFx0XHRcdC8vbGV0IGRhdGEgPSBwYXJzZVVybCgkKGRvbS53aW5kb3cuY2hhcHRlcl9saXN0W3ZdWzBdKS5hdHRyKCdocmVmJykpO1xuXG5cdFx0XHRcdFx0bGlzdFt2XSA9IHtcblx0XHRcdFx0XHRcdGluZGV4OiB2LFxuXG5cdFx0XHRcdFx0XHRub3ZlbF9pZDogbnVsbCxcblxuXHRcdFx0XHRcdFx0dm9sdW1lX25hbWU6IHZvbHVtZV9uYW1lLFxuXHRcdFx0XHRcdFx0dm9sdW1lX2lkOiBudWxsLFxuXG5cdFx0XHRcdFx0XHRjaGFwdGVyOiBbXSxcblx0XHRcdFx0XHR9O1xuXG5cdFx0XHRcdFx0Zm9yIChsZXQgY2kgaW4gd2luZG93LmNoYXB0ZXJfbGlzdFt2XSlcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRpZiAoIXdpbmRvdy5jaGFwdGVyX2xpc3Rbdl1bY2ldKVxuXHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRjb250aW51ZTtcblx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0bGV0IF9hID0gJCh3aW5kb3cuY2hhcHRlcl9saXN0W3ZdW2NpXSk7XG5cblx0XHRcdFx0XHRcdC8vY29uc29sZS5sb2coX2EpO1xuXG5cdFx0XHRcdFx0XHRsZXQgX2QgPSBzZWxmLnBhcnNlVXJsKF9hLnByb3AoJ2hyZWYnKSk7XG5cblx0XHRcdFx0XHRcdGlmICghbGlzdFt2XS52b2x1bWVfaWQpXG5cdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdGxpc3Rbdl0ubm92ZWxfaWQgPSBfZC5ub3ZlbF9pZDtcblx0XHRcdFx0XHRcdFx0bGlzdFt2XS52b2x1bWVfaWQgPSBfZC52b2x1bWVfaWQ7XG5cdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdGxpc3Rbdl0uY2hhcHRlci5wdXNoKHtcblx0XHRcdFx0XHRcdFx0aW5kZXg6IGNpLFxuXHRcdFx0XHRcdFx0XHRpbmRleF92b2x1bWU6IHYsXG5cblx0XHRcdFx0XHRcdFx0bm92ZWxfaWQ6IF9kLm5vdmVsX2lkLFxuXG5cdFx0XHRcdFx0XHRcdHZvbHVtZV9pZDogX2Qudm9sdW1lX2lkLFxuXHRcdFx0XHRcdFx0XHR2b2x1bWVfbmFtZTogdm9sdW1lX25hbWUsXG5cblx0XHRcdFx0XHRcdFx0Y2hhcHRlcl9uYW1lOiBfYS50ZXh0KCksXG5cdFx0XHRcdFx0XHRcdGNoYXB0ZXJfaWQ6IF9kLmNoYXB0ZXJfaWQsXG5cblx0XHRcdFx0XHRcdFx0dXJsOiBfYS5wcm9wKCdocmVmJyksXG5cdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRfZGF0YS52YWx1ZSA9IGxpc3Q7XG5cblx0XHRcdFx0cmV0dXJuIF9kYXRhO1xuXHRcdFx0fSlcblx0XHRcdC50aGVuKGZ1bmN0aW9uIChfZGF0YSlcblx0XHRcdHtcblx0XHRcdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdFx0XHRfZGF0YS5jaGVja2RhdGUgPSBtb21lbnQoKS50eihtb21lbnQudHouZ3Vlc3MoKSk7XG5cblx0XHRcdFx0cmV0dXJuIF9kYXRhO1xuXHRcdFx0fSlcblx0XHRcdDtcblx0fVxuXG5cdGFzeW5jIF9kb3dubG9hZENoYXB0ZXIoZGF0YSwgb3B0aW9uc1J1bnRpbWU6IE5vdmVsU2l0ZS5JT3B0aW9uc1J1bnRpbWUpXG5cdHtcblx0XHRjb25zdCBzZWxmID0gdGhpcztcblx0XHRsZXQgdXJsOiBVUkw7XG5cblx0XHR7XG5cdFx0XHRkYXRhID0gc2VsZi5wYXJzZVVybChkYXRhKTtcblxuXHRcdFx0aWYgKCFkYXRhLm5vdmVsX2lkKVxuXHRcdFx0e1xuXHRcdFx0XHR0aHJvdyBuZXcgUmVmZXJlbmNlRXJyb3IoKTtcblx0XHRcdH1cblxuXHRcdFx0dXJsID0gc2VsZi5tYWtlVXJsKGRhdGEpO1xuXHRcdH1cblxuXHRcdGxldCBfZGF0YSA9IHt9IGFzIGFueTtcblxuXHRcdGxldCAkO1xuXG5cdFx0cmV0dXJuIGZyb21VUkwodXJsLCBvcHRpb25zUnVudGltZS5vcHRpb25zSlNET00pXG5cdFx0XHQudGhlbihhc3luYyAoZG9tKSA9PlxuXHRcdFx0e1xuXHRcdFx0XHRsZXQgd2luZG93ID0gZG9tLndpbmRvdyBhcyB7XG5cdFx0XHRcdFx0W2tleTogc3RyaW5nXTogYW55O1xuXHRcdFx0XHR9O1xuXG5cdFx0XHRcdCQgPSBkb20uJDtcblxuXHRcdFx0XHRsZXQgY2hhcHRlcl9uYW1lID0gd2luZG93LmdfY2hhcHRlcl9uYW1lXG5cdFx0XHRcdFx0LnJlcGxhY2UoL1xcXFwvaWcsICcnKVxuXHRcdFx0XHRcdC5yZXBsYWNlKC9eW1xcc1xcdUZFRkZcXHhBMOOAgF0rfFtcXHNcXHVGRUZGXFx4QTDjgIBdKyQvZywgJycpXG5cdFx0XHRcdDtcblx0XHRcdFx0bGV0IHZvbHVtZV9uYW1lID0gd2luZG93LmRvY3VtZW50XG5cdFx0XHRcdFx0LnF1ZXJ5U2VsZWN0b3IoJyNwYWdlX2NvbnRlbnRzIC50aXQnKVxuXHRcdFx0XHRcdC5pbm5lckhUTUxcblx0XHRcdFx0XHQucmVwbGFjZSgvXFxcXC9pZywgJycpXG5cdFx0XHRcdFx0LnJlcGxhY2UoY2hhcHRlcl9uYW1lLCAnJylcblx0XHRcdFx0XHQucmVwbGFjZSgvXltcXHNcXHVGRUZGXFx4QTDjgIBdK3xbXFxzXFx1RkVGRlxceEEw44CAXSskL2csICcnKVxuXHRcdFx0XHQ7XG5cblx0XHRcdFx0X2RhdGEgPSB7XG5cblx0XHRcdFx0XHR1cmw6IHVybCxcblxuXHRcdFx0XHRcdGRhdGE6IHtcblx0XHRcdFx0XHRcdGdfbG5vdmVsX2lkOiB3aW5kb3cuZ19sbm92ZWxfaWQsXG5cdFx0XHRcdFx0XHRnX3ZvbHVtZV9pZDogd2luZG93Lmdfdm9sdW1lX2lkLFxuXHRcdFx0XHRcdFx0Z19jaGFwdGVyX2lkOiB3aW5kb3cuZ19jaGFwdGVyX2lkLFxuXG5cdFx0XHRcdFx0XHRnX2xub3ZlbF9uYW1lOiB3aW5kb3cuZ19sbm92ZWxfbmFtZSxcblx0XHRcdFx0XHRcdGdfdm9sdW1lX25hbWU6IHZvbHVtZV9uYW1lLFxuXHRcdFx0XHRcdFx0Z19jaGFwdGVyX25hbWU6IGNoYXB0ZXJfbmFtZSxcblxuXHRcdFx0XHRcdFx0Y2hhcHRlcl9uYW1lOiBjaGFwdGVyX25hbWUsXG5cdFx0XHRcdFx0XHR2b2x1bWVfbmFtZTogdm9sdW1lX25hbWUsXG5cdFx0XHRcdFx0fSxcblxuXHRcdFx0XHRcdHZhbHVlOiBudWxsLFxuXG5cdFx0XHRcdH07XG5cblx0XHRcdFx0bGV0IHBhID0gW107XG5cblx0XHRcdFx0cGFbMF0gPSB3aW5kb3cuZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNjaGFwdGVyX2NvbnRlbnRzX2ZpcnN0XCIpLmlubmVySFRNTDtcblxuXHRcdFx0XHRpZiAod2luZG93LmdfY2hhcHRlcl9wYWdlc19jb3VudCA+IDEpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRsZXQgdWEgPSAod2luZG93LmdfY2hhcHRlcl9wYWdlc191cmwgYXMgQXJyYXk8c3RyaW5nPilcblx0XHRcdFx0XHRcdC5maWx0ZXIoZnVuY3Rpb24gKHZhbHVlKVxuXHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRyZXR1cm4gdmFsdWU7XG5cdFx0XHRcdFx0XHR9KVxuXHRcdFx0XHRcdFx0Lm1hcChmdW5jdGlvbiAodmFsdWUsIGluZGV4LCBhcnJheSlcblx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0aWYgKHZhbHVlKVxuXHRcdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdFx0dmFsdWUgPSAnaHR0cDovL3EuZG16ai5jb20vJyArIHZhbHVlO1xuXHRcdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdFx0cmV0dXJuIHZhbHVlO1xuXHRcdFx0XHRcdFx0fSlcblx0XHRcdFx0XHQ7XG5cblx0XHRcdFx0XHRhd2FpdCBtYW55UmVxdWVzdCh1YSwge1xuXHRcdFx0XHRcdFx0ZW5jb2Rpbmc6IG51bGwsXG5cdFx0XHRcdFx0XHRyZXNvbHZlV2l0aEZ1bGxSZXNwb25zZTogdHJ1ZSxcblx0XHRcdFx0XHR9KVxuXHRcdFx0XHRcdFx0LnRoZW4oYXN5bmMgZnVuY3Rpb24gKHJldClcblx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0cGEgPSBwYS5jb25jYXQocmV0Lm1hcChmdW5jdGlvbiAodmFsdWUsIGluZGV4LCBhcnJheSlcblx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdC8vY29uc29sZS5sb2codmFsdWUuYm9keSk7XG5cblx0XHRcdFx0XHRcdFx0XHRyZXR1cm4gdmFsdWUuYm9keS50b1N0cmluZygpO1xuXHRcdFx0XHRcdFx0XHR9KSlcblx0XHRcdFx0XHRcdFx0O1xuXHRcdFx0XHRcdFx0fSlcblx0XHRcdFx0XHQ7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRyZXR1cm4gcGE7XG5cdFx0XHR9KVxuXHRcdFx0LnRoZW4oYXN5bmMgZnVuY3Rpb24gKHBhKVxuXHRcdFx0e1xuXHRcdFx0XHRfZGF0YS5pbWdzID0gW107XG5cblx0XHRcdFx0cGEgPSBhd2FpdCBQcm9taXNlQmx1ZWJpcmQubWFwU2VyaWVzKHBhLCBhc3luYyBmdW5jdGlvbiAodmFsdWUsIGlkeClcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGxldCBfYyA9IHt9O1xuXG5cdFx0XHRcdFx0Ly9sZXQgJCA9IGNoZWVyaW8ubG9hZCh2YWx1ZSk7XG5cblx0XHRcdFx0XHRsZXQgX2EgPSAkKHZhbHVlKTtcblxuXHRcdFx0XHRcdGxldCBfaW1nID0gX2EuZmluZCgnaW1nJyk7XG5cblx0XHRcdFx0XHQvL2NvbnNvbGUubG9nKF9pbWcubGVuZ3RoKTtcblxuXHRcdFx0XHRcdGlmIChfaW1nLmxlbmd0aClcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRfaW1nLmVhY2goZnVuY3Rpb24gKGluZGV4LCBlbGVtKVxuXHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHQvLyBAdHMtaWdub3JlXG5cdFx0XHRcdFx0XHRcdGxldCBfdGhpcyA9ICQodGhpcyk7XG5cblx0XHRcdFx0XHRcdFx0aWYgKF90aGlzLnByb3AoJ3NyYycpKVxuXHRcdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdFx0bGV0IGlkID0gc2hvcnRpZCgpO1xuXG5cdFx0XHRcdFx0XHRcdFx0X2NbaWRdID0gX3RoaXMucHJvcCgnc3JjJyk7XG5cdFx0XHRcdFx0XHRcdFx0X2RhdGEuaW1ncy5wdXNoKF9jW2lkXSk7XG5cblx0XHRcdFx0XHRcdFx0XHQvLyBAdHMtaWdub3JlXG5cdFx0XHRcdFx0XHRcdFx0JChgPHNwYW4+e3tAJHtpZH1AfX08L3NwYW4+YCkuaW5zZXJ0QWZ0ZXIodGhpcyk7XG5cblx0XHRcdFx0XHRcdFx0XHQvLyBAdHMtaWdub3JlXG5cdFx0XHRcdFx0XHRcdFx0JCh0aGlzKVxuXHRcdFx0XHRcdFx0XHRcdFx0LnJlbW92ZSgpXG5cdFx0XHRcdFx0XHRcdFx0O1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHR9KTtcblxuXHRcdFx0XHRcdFx0Ly9jb25zb2xlLmxvZygkLmh0bWwoKSk7XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0bGV0IF90ID0gX2EudGV4dCgpO1xuXG5cdFx0XHRcdFx0Zm9yIChsZXQgaWQgaW4gX2MpXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0Lypcblx0XHRcdFx0XHRcdGlmICghL14oPzpbYS16XVxcOnxcXDopP1xcL1xcLy9pLnRlc3QoX2NbaWRdKSlcblx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0X2NbaWRdID0gJ2h0dHA6Ly9xLmRtemouY29tLycgKyBfY1tpZF07XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHQqL1xuXG5cdFx0XHRcdFx0XHQvKlxuXHRcdFx0XHRcdFx0YXdhaXQgZG93bmxvYWRfaW1hZ2UoX2NbaWRdLCB7XG5cdFx0XHRcdFx0XHRcdGZyb21maWxlOiBmaWxlLFxuXHRcdFx0XHRcdFx0XHRwcmVmaXg6ICdpbWdfJyArIChfaWR4KyspLnRvU3RyaW5nKCkucGFkU3RhcnQoMywgJzAnKSArICdfJyxcblx0XHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdFx0Ki9cblxuXHRcdFx0XHRcdFx0X3QgPSBfdC5yZXBsYWNlKGB7e0Ake2lkfUB9fWAsIGBcXG5cXG48aW1nIHNyYz1cIiR7X2NbaWRdfVwiLz5cXG5cXG5gKTtcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRyZXR1cm4gX3Q7XG5cdFx0XHRcdH0pO1xuXG5cdFx0XHRcdHJldHVybiBwYS5qb2luKFwiXFxuXCIpO1xuXHRcdFx0fSlcblx0XHRcdC50aGVuKGZ1bmN0aW9uIChodG1sKVxuXHRcdFx0e1xuXHRcdFx0XHRyZXR1cm4gaHRtbFxuXHRcdFx0XHRcdC5yZXBsYWNlKC9eXFxzKig/OjxwPik/L2ksICcnKVxuXHRcdFx0XHRcdC5yZXBsYWNlKC9cXHMqPCg/OlxcLz9wfGJyXFwvPyk+XFxzKiQvaSwgJycpXG5cdFx0XHRcdFx0LnJlcGxhY2UoL1xcclxcbnxcXHIoPyFcXG4pL2csIFwiXFxuXCIpXG5cdFx0XHRcdFx0Ly8ucmVwbGFjZSgvPFxcL3A+PHA+XFxuL2lnLCBcIlxcblwiKVxuXHRcdFx0XHRcdC8vLnJlcGxhY2UoLzxwPjxcXC9wPi9pZywgXCJcXG5cIilcblx0XHRcdFx0XHQvLy5yZXBsYWNlKC8oPFxcL3A+fDxwPilcXG4vaWcsIFwiXFxuXCIpXG5cdFx0XHRcdFx0LnJlcGxhY2UoL1tcXHRcXHVGRUZGXFx4QTDjgIBdKyhcXG58JCkvaWcsIFwiJDFcIilcblx0XHRcdFx0XHQucmVwbGFjZSgvKFxcbilbXFx0XSsvaWcsIFwiJDFcIilcblx0XHRcdFx0XHQucmVwbGFjZSgvXFxzKyQvaWcsIFwiXCIpXG5cdFx0XHRcdFx0LnJlcGxhY2UoL1xcbnszLH0vaWcsIFwiXFxuXFxuXCIpXG5cdFx0XHRcdFx0O1xuXHRcdFx0fSlcblx0XHRcdC50aGVuKGZ1bmN0aW9uIChodG1sKVxuXHRcdFx0e1xuXHRcdFx0XHRfZGF0YS52YWx1ZSA9IGh0bWw7XG5cdFx0XHRcdF9kYXRhLmNoZWNrZGF0ZSA9IG1vbWVudCgpLnR6KG1vbWVudC50ei5ndWVzcygpKTtcblxuXHRcdFx0XHRyZXR1cm4gX2RhdGE7XG5cdFx0XHR9KVxuXHRcdFx0O1xuXHR9XG5cbn1cblxuZXhwb3J0IGRlZmF1bHQgTm92ZWxTaXRlRG16ajtcbiJdfQ==