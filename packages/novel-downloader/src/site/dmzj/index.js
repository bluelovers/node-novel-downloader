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
const jsdom_url_1 = require("jsdom-url");
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
        return new jsdom_url_1.URL(url);
    }
    parseUrl(url) {
        let urlobj = {
            // @ts-ignore
            url: new jsdom_url_1.URL(url),
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
NovelSiteDmzj.IDKEY = 'dmzj';
NovelSiteDmzj = __decorate([
    index_1.staticImplements()
], NovelSiteDmzj);
exports.NovelSiteDmzj = NovelSiteDmzj;
exports.default = NovelSiteDmzj;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7O0dBRUc7Ozs7Ozs7O0FBRUgsK0JBQWdDO0FBQ2hDLHdDQUE2QztBQUM3QywrQkFBK0I7QUFDL0IscURBQXlEO0FBQ3pELDZDQUErRDtBQUcvRCx5Q0FBZ0M7QUFHaEMsb0NBQTBGO0FBQzFGLG9DQUE4RDtBQUM5RCxvQ0FBa0M7QUFDbEMsbUNBQW1DO0FBQ25DLHVDQUEwQztBQUMxQyx1Q0FBaUQ7QUFFakQ7O0dBRUc7QUFDSCxhQUFhO0FBRWIsSUFBYSxhQUFhLEdBQTFCLE1BQWEsYUFBYyxTQUFRLGVBQVM7SUFJM0MsUUFBUSxDQUFDLE1BQTJCLEVBQUUsSUFBSztRQUUxQyxJQUFJLENBQUMsTUFBTSxDQUFDLFVBQVUsRUFDdEI7WUFDQyxJQUFJLENBQUMsTUFBTSxDQUFDLFNBQVMsRUFDckI7Z0JBQ0MsT0FBTyxxQkFBcUIsTUFBTSxDQUFDLFFBQVEsY0FBYyxDQUFDO2FBQzFEO1lBRUQsT0FBTyxxQkFBcUIsTUFBTSxDQUFDLFFBQVEsSUFBSSxNQUFNLENBQUMsU0FBUyxJQUFJLE1BQU0sQ0FBQyxTQUFTLE1BQU0sQ0FBQztTQUMxRjtRQUVELE9BQU8scUJBQXFCLE1BQU0sQ0FBQyxRQUFRLElBQUksTUFBTSxDQUFDLFNBQVMsSUFBSSxNQUFNLENBQUMsVUFBVSxHQUFHLElBQUk7WUFDMUYsQ0FBQyxDQUFDLEdBQUcsR0FBRyxJQUFJO1lBQ1osQ0FBQyxDQUFDLEVBQUUsUUFBUSxDQUFDO0lBQ2YsQ0FBQztJQUVELE9BQU8sQ0FBQyxNQUEyQixFQUFFLElBQWM7UUFFbEQsSUFBSSxHQUFHLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFFdEMsYUFBYTtRQUNiLE9BQU8sSUFBSSxlQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDckIsQ0FBQztJQUVELFFBQVEsQ0FBQyxH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QztpQkFDdkMsT0FBTyxDQUFDLGdCQUFnQixFQUFFLElBQUksQ0FBQztnQkFDaEMsZ0NBQWdDO2dCQUNoQyw4QkFBOEI7Z0JBQzlCLG1DQUFtQztpQkFDbEMsT0FBTyxDQUFDLDBCQUEwQixFQUFFLElBQUksQ0FBQztpQkFDekMsT0FBTyxDQUFDLGFBQWEsRUFBRSxJQUFJLENBQUM7aUJBQzVCLE9BQU8sQ0FBQyxRQUFRLEVBQUUsRUFBRSxDQUFDO2lCQUNyQixPQUFPLENBQUMsVUFBVSxFQUFFLE1BQU0sQ0FBQyxDQUMzQjtRQUNILENBQUMsQ0FBQzthQUNELElBQUksQ0FBQyxVQUFVLElBQUk7WUFFbkIsS0FBSyxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUM7WUFDbkIsS0FBSyxDQUFDLFNBQVMsR0FBRyxjQUFNLEVBQUUsQ0FBQyxFQUFFLENBQUMsY0FBTSxDQUFDLEVBQUUsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDO1lBRWpELE9BQU8sS0FBSyxDQUFDO1FBQ2QsQ0FBQyxDQUFDLENBQ0Q7SUFDSCxDQUFDO0NBRUQsQ0FBQTtBQWxoQk8sbUJBQUssR0FBRyxNQUFNLENBQUM7QUFGVixhQUFhO0lBRHpCLHdCQUFnQixFQUE2QztHQUNqRCxhQUFhLENBb2hCekI7QUFwaEJZLHNDQUFhO0FBc2hCMUIsa0JBQWUsYUFBYSxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDcmVhdGVkIGJ5IHVzZXIgb24gMjAxNy8xMi82LzAwNi5cbiAqL1xuXG5pbXBvcnQgZnMgPSByZXF1aXJlKCdmcy1leHRyYScpO1xuaW1wb3J0IHsgdHJpbUZpbGVuYW1lIH0gZnJvbSAnZnMtaWNvbnYvdXRpbCc7XG5pbXBvcnQgKiBhcyBwYXRoIGZyb20gJ3VwYXRoMic7XG5pbXBvcnQgbm92ZWxJbmZvLCB7IElNZGNvbmZNZXRhIH0gZnJvbSAnbm9kZS1ub3ZlbC1pbmZvJztcbmltcG9ydCB7IGZyb21VUkwsIElGcm9tVXJsT3B0aW9ucywgSUpTRE9NIH0gZnJvbSAnanNkb20tZXh0cmEnO1xuLy8gQHRzLWlnbm9yZVxuaW1wb3J0IHsgTGF6eUNvb2tpZSwgTGF6eUNvb2tpZUphciB9IGZyb20gJ2pzZG9tLWV4dHJhJztcbmltcG9ydCB7IFVSTCB9IGZyb20gJ2pzZG9tLXVybCc7XG5pbXBvcnQgeyBkb3dubG9hZF9pbWFnZSB9IGZyb20gJy4uL2ltYWdlJztcblxuaW1wb3J0IE5vdmVsU2l0ZSwgeyBzdGF0aWNJbXBsZW1lbnRzLCBkZWZhdWx0SlNET01PcHRpb25zLCBTWU1CT0xfQ0FDSEUgfSBmcm9tICcuLi9pbmRleCc7XG5pbXBvcnQgeyBQcm9taXNlQmx1ZWJpcmQsIGJsdWViaXJkRGVjb3JhdG9yIH0gZnJvbSAnLi4vaW5kZXgnO1xuaW1wb3J0IHsgbW9tZW50IH0gZnJvbSAnLi4vaW5kZXgnO1xuaW1wb3J0ICogYXMgc2hvcnRpZCBmcm9tICdzaG9ydGlkJztcbmltcG9ydCB7IG1hbnlSZXF1ZXN0IH0gZnJvbSAnLi4vLi4vZmV0Y2gnO1xuaW1wb3J0IHsgY3JlYXRlT3B0aW9uc0pTRE9NIH0gZnJvbSAnLi4vLi4vanNkb20nO1xuXG4vKipcbiAqIEBkZXByZWNhdGVkXG4gKi9cbi8vIEB0cy1pZ25vcmVcbkBzdGF0aWNJbXBsZW1lbnRzPE5vdmVsU2l0ZS5JTm92ZWxTaXRlU3RhdGljPE5vdmVsU2l0ZURtemo+PigpXG5leHBvcnQgY2xhc3MgTm92ZWxTaXRlRG16aiBleHRlbmRzIE5vdmVsU2l0ZVxue1xuXHRzdGF0aWMgSURLRVkgPSAnZG16aic7XG5cblx0X21ha2VVcmwodXJsb2JqOiBOb3ZlbFNpdGUuSVBhcnNlVXJsLCBwYWdlPylcblx0e1xuXHRcdGlmICghdXJsb2JqLmNoYXB0ZXJfaWQpXG5cdFx0e1xuXHRcdFx0aWYgKCF1cmxvYmoudm9sdW1lX2lkKVxuXHRcdFx0e1xuXHRcdFx0XHRyZXR1cm4gYGh0dHA6Ly9xLmRtemouY29tLyR7dXJsb2JqLm5vdmVsX2lkfS9pbmRleC5zaHRtbGA7XG5cdFx0XHR9XG5cblx0XHRcdHJldHVybiBgaHR0cDovL3EuZG16ai5jb20vJHt1cmxvYmoubm92ZWxfaWR9LyR7dXJsb2JqLnZvbHVtZV9pZH0vJHt1cmxvYmoudm9sdW1lX2lkfS50eHRgO1xuXHRcdH1cblxuXHRcdHJldHVybiBgaHR0cDovL3EuZG16ai5jb20vJHt1cmxvYmoubm92ZWxfaWR9LyR7dXJsb2JqLnZvbHVtZV9pZH0vJHt1cmxvYmouY2hhcHRlcl9pZH0ke3BhZ2Vcblx0XHRcdD8gJ18nICsgcGFnZVxuXHRcdFx0OiAnJ30uc2h0bWxgO1xuXHR9XG5cblx0bWFrZVVybCh1cmxvYmo6IE5vdmVsU2l0ZS5JUGFyc2VVcmwsIGJvb2wgPzogbnVtYmVyKTogVVJMXG5cdHtcblx0XHRsZXQgdXJsID0gdGhpcy5fbWFrZVVybCh1cmxvYmosIGJvb2wpO1xuXG5cdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdHJldHVybiBuZXcgVVJMKHVybCk7XG5cdH1cblxuXHRwYXJzZVVybCh1cmw6IHN0cmluZyB8IFVSTCk6IE5vdmVsU2l0ZS5JUGFyc2VVcmxcblx0e1xuXHRcdGxldCB1cmxvYmogPSB7XG5cdFx0XHQvLyBAdHMtaWdub3JlXG5cdFx0XHR1cmw6IG5ldyBVUkwodXJsKSxcblxuXHRcdFx0bm92ZWxfaWQ6IG51bGwsXG5cdFx0XHR2b2x1bWVfaWQ6IG51bGwsXG5cdFx0XHRjaGFwdGVyX2lkOiBudWxsLFxuXHRcdH07XG5cblx0XHR1cmwgPSB1cmxvYmoudXJsLmhyZWY7XG5cblx0XHRsZXQgciA9IC8oPzpxXFwuZG16alxcLmNvbVxcL3xeXFwvKSg/OihcXGQrKVxcLyg/OihcXGQrKVxcLyg/OihcXGQrKVtcXC5fXSk/KT8pLztcblxuXHRcdGxldCBtID0gci5leGVjKHVybC50b1N0cmluZygpKTtcblxuXHRcdGlmIChtKVxuXHRcdHtcblx0XHRcdHVybG9iai5ub3ZlbF9pZCA9IG1bMV07XG5cdFx0XHR1cmxvYmoudm9sdW1lX2lkID0gbVsyXTtcblx0XHRcdHVybG9iai5jaGFwdGVyX2lkID0gbVszXTtcblx0XHR9XG5cblx0XHQvLyBAdHMtaWdub3JlXG5cdFx0cmV0dXJuIHVybG9iajtcblx0fVxuXG5cdC8vIEB0cy1pZ25vcmVcblx0ZG93bmxvYWQodXJsOiBzdHJpbmcgfCBVUkwsIGRvd25sb2FkT3B0aW9uczogTm92ZWxTaXRlLklEb3dubG9hZE9wdGlvbnMgPSB7fSlcblx0e1xuXHRcdGNvbnN0IHNlbGYgPSB0aGlzO1xuXG5cdFx0Y29uc3QgW1BBVEhfTk9WRUxfTUFJTiwgb3B0aW9uc1J1bnRpbWVdID0gdGhpcy5nZXRPdXRwdXREaXI8Tm92ZWxTaXRlLklPcHRpb25zUnVudGltZT4oZG93bmxvYWRPcHRpb25zKTtcblxuXHRcdC8qXG5cdFx0b3B0aW9uc1J1bnRpbWUub3B0aW9uc0pTRE9NID0gT2JqZWN0LmFzc2lnbih7fSwgZGVmYXVsdEpTRE9NT3B0aW9ucywgb3B0aW9uc1J1bnRpbWUub3B0aW9uc0pTRE9NLCB7XG5cdFx0XHRydW5TY3JpcHRzOiAnZGFuZ2Vyb3VzbHknLFxuXHRcdH0pO1xuXHRcdCovXG5cblx0XHRvcHRpb25zUnVudGltZS5vcHRpb25zSlNET00gPSBjcmVhdGVPcHRpb25zSlNET00ob3B0aW9uc1J1bnRpbWUub3B0aW9uc0pTRE9NLCB7XG5cdFx0XHRydW5TY3JpcHRzOiAnZGFuZ2Vyb3VzbHknLFxuXHRcdH0pO1xuXG5cdFx0bGV0IHBhdGhfbWFpbjogc3RyaW5nO1xuXG5cdFx0cmV0dXJuIFByb21pc2VCbHVlYmlyZFxuXHRcdFx0LmJpbmQoc2VsZilcblx0XHRcdC50aGVuKGFzeW5jIGZ1bmN0aW9uICgpXG5cdFx0XHR7XG5cdFx0XHRcdGxldCBfZGF0YSA9IGF3YWl0IHNlbGYuX2Rvd25sb2FkX2luZm8odXJsIGFzIGFueSwgb3B0aW9uc1J1bnRpbWUpO1xuXG5cdFx0XHRcdHBhdGhfbWFpbiA9IHBhdGguam9pbihzZWxmLlBBVEhfTk9WRUxfTUFJTixcblx0XHRcdFx0XHR0cmltRmlsZW5hbWUoYCR7X2RhdGEuZGF0YS5nX2xub3ZlbF9uYW1lfV8oJHtfZGF0YS5kYXRhLmdfbG5vdmVsX2lkfSlgKSxcblx0XHRcdFx0KTtcblxuXHRcdFx0XHRsZXQgX2EgPSBfZGF0YS52YWx1ZS5yZWR1Y2UoZnVuY3Rpb24gKGEsIGIpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRyZXR1cm4gYS5jb25jYXQoYi5jaGFwdGVyKTtcblx0XHRcdFx0fSwgW10pO1xuXG5cdFx0XHRcdGxldCBfZiA9IGF3YWl0IFByb21pc2VCbHVlYmlyZFxuXHRcdFx0XHRcdC5tYXBTZXJpZXMoX2EsIGZ1bmN0aW9uIChhLCBpbmRleCwgbGVuKVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdGxldCBwYWRfbGVuID0gbGVuLnRvU3RyaW5nKCkubGVuZ3RoID4gNCA/IGxlbi50b1N0cmluZygpLmxlbmd0aCA6IDQ7XG5cdFx0XHRcdFx0XHQvLyBAdHMtaWdub3JlXG5cdFx0XHRcdFx0XHRsZXQgdm9sdW1lX25hbWUgPSBhLnZvbHVtZV9uYW1lO1xuXG5cdFx0XHRcdFx0XHQvLyBAdHMtaWdub3JlXG5cdFx0XHRcdFx0XHRjb25zb2xlLmxvZyhhLnVybCk7XG5cblx0XHRcdFx0XHRcdC8vIEB0cy1pZ25vcmVcblx0XHRcdFx0XHRcdHJldHVybiBzZWxmLl9kb3dubG9hZENoYXB0ZXIoYS51cmwsIG9wdGlvbnNSdW50aW1lKVxuXHRcdFx0XHRcdFx0XHQudGhlbihhc3luYyBmdW5jdGlvbiAoZGF0YSlcblx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdGxldCBfZmlsZSA9IHBhdGguam9pbihwYXRoX21haW4sXG5cdFx0XHRcdFx0XHRcdFx0XHQvLyBAdHMtaWdub3JlXG5cdFx0XHRcdFx0XHRcdFx0XHR0cmltRmlsZW5hbWUoYCR7YS5pbmRleF92b2x1bWUudG9TdHJpbmcoKVxuXHRcdFx0XHRcdFx0XHRcdFx0XHQucGFkU3RhcnQocGFkX2xlbiwgJzAnKX0gJHt2b2x1bWVfbmFtZX1fKCR7ZGF0YS5kYXRhLmdfdm9sdW1lX2lkfSlgKSxcblx0XHRcdFx0XHRcdFx0XHRcdC8vIEB0cy1pZ25vcmVcblx0XHRcdFx0XHRcdFx0XHRcdHRyaW1GaWxlbmFtZShgJHthLmluZGV4LnRvU3RyaW5nKClcblx0XHRcdFx0XHRcdFx0XHRcdFx0LnBhZFN0YXJ0KHBhZF9sZW4sICcwJyl9XyR7ZGF0YS5kYXRhLmNoYXB0ZXJfbmFtZX0uJHtkYXRhLmRhdGEuZ19jaGFwdGVyX2lkfWApXG5cdFx0XHRcdFx0XHRcdFx0KTtcblxuXHRcdFx0XHRcdFx0XHRcdGF3YWl0IGZzLm91dHB1dEpzb24oX2ZpbGUgKyAnLmpzb24nLCBkYXRhLCB7XG5cdFx0XHRcdFx0XHRcdFx0XHRzcGFjZXM6IFwiXFx0XCIsXG5cdFx0XHRcdFx0XHRcdFx0fSk7XG5cblx0XHRcdFx0XHRcdFx0XHRhd2FpdCBmcy5vdXRwdXRGaWxlKF9maWxlICsgJy50eHQnLCBkYXRhLnZhbHVlKTtcblxuXHRcdFx0XHRcdFx0XHRcdHJldHVybiBwYXRoLnJlbGF0aXZlKHNlbGYuUEFUSF9OT1ZFTF9NQUlOLCBfZmlsZSk7XG5cdFx0XHRcdFx0XHRcdH0pXG5cdFx0XHRcdFx0XHRcdC50aGVuKGZ1bmN0aW9uIChmaWxlKVxuXHRcdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdFx0Y29uc29sZS5sb2coJ2RvbmUnLCBmaWxlKTtcblxuXHRcdFx0XHRcdFx0XHRcdHJldHVybiBmaWxlO1xuXHRcdFx0XHRcdFx0XHR9KVxuXHRcdFx0XHRcdFx0XHQ7XG5cdFx0XHRcdFx0fSlcblx0XHRcdFx0XHQudGhlbihmdW5jdGlvbiAocmV0KVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdC8vY29uc29sZS5sb2coJ2RvbmUnLCByZXQpO1xuXG5cdFx0XHRcdFx0XHRyZXR1cm4gcmV0O1xuXHRcdFx0XHRcdH0pXG5cdFx0XHRcdDtcblxuXHRcdFx0XHQvLyBAdHMtaWdub3JlXG5cdFx0XHRcdF9kYXRhLmNoZWNrZGF0ZSA9IG1vbWVudCgpLnR6KG1vbWVudC50ei5ndWVzcygpKTtcblxuXHRcdFx0XHQvLyBAdHMtaWdub3JlXG5cdFx0XHRcdF9kYXRhLmZpbGVzID0gX2Y7XG5cblx0XHRcdFx0cmV0dXJuIF9kYXRhO1xuXHRcdFx0fSlcblx0XHRcdC50YXAoYXN5bmMgZnVuY3Rpb24gKG5vdmVsKVxuXHRcdFx0e1xuXG5cdFx0XHRcdGF3YWl0IGZzLm91dHB1dEpzb24ocGF0aC5qb2luKHBhdGhfbWFpbiwgdHJpbUZpbGVuYW1lKGAke25vdmVsLmRhdGEuZ19sbm92ZWxfbmFtZX0uJHtub3ZlbC5kYXRhLmdfbG5vdmVsX2lkfWApKSArICcuanNvbicsIG5vdmVsLCB7XG5cdFx0XHRcdFx0c3BhY2VzOiBcIlxcdFwiLFxuXHRcdFx0XHR9KTtcblxuXHRcdFx0XHRsZXQgb3B0aW9ucyA9IHt9O1xuXHRcdFx0XHRvcHRpb25zW3NlbGYuSURLRVldID0ge1xuXHRcdFx0XHRcdC8vdHh0ZG93bmxvYWRfaWQ6IG5vdmVsLm5vdmVsX3N5b3NldHVfaWQsXG5cdFx0XHRcdH07XG5cblx0XHRcdFx0bGV0IG1kID0gbm92ZWxJbmZvLnN0cmluZ2lmeSh7XG5cdFx0XHRcdFx0bm92ZWw6IHtcblx0XHRcdFx0XHRcdHRhZ3M6IFtcblx0XHRcdFx0XHRcdFx0c2VsZi5JREtFWSxcblx0XHRcdFx0XHRcdF0sXG5cdFx0XHRcdFx0XHRzZXJpZXM6IHtcblx0XHRcdFx0XHRcdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdFx0XHRcdFx0XHRuYW1lOiBub3ZlbC5ub3ZlbF9zZXJpZXNfdGl0bGUgfHwgJycsXG5cdFx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0b3B0aW9ucyxcblx0XHRcdFx0XHQvLyBAdHMtaWdub3JlXG5cdFx0XHRcdFx0bGluazogbm92ZWwubGluayB8fCBbXSxcblx0XHRcdFx0fSwgbm92ZWwsIHtcblx0XHRcdFx0XHRvcHRpb25zOiB7XG5cdFx0XHRcdFx0XHR0ZXh0bGF5b3V0OiB7XG5cdFx0XHRcdFx0XHRcdGFsbG93X2xmMjogdHJ1ZSxcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9LFxuXHRcdFx0XHR9KTtcblxuXHRcdFx0XHRsZXQgZmlsZSA9IHBhdGguam9pbihwYXRoX21haW4sIGBSRUFETUUubWRgKTtcblx0XHRcdFx0YXdhaXQgZnMub3V0cHV0RmlsZShmaWxlLCBtZCk7XG5cblx0XHRcdH0pXG5cdFx0XHQ7XG5cdH1cblxuXHRhc3luYyBfZG93bmxvYWRfaW5mbyh1cmw6IFVSTCxcblx0XHRvcHRpb25zUnVudGltZTogUGFydGlhbDxOb3ZlbFNpdGUuSU9wdGlvbnNSdW50aW1lPiA9IHt9XG5cdClcblx0e1xuXHRcdGNvbnN0IHNlbGYgPSB0aGlzO1xuXG5cdFx0e1xuXHRcdFx0bGV0IGRhdGEgPSBzZWxmLnBhcnNlVXJsKHVybCk7XG5cblx0XHRcdGlmICghZGF0YS5ub3ZlbF9pZClcblx0XHRcdHtcblx0XHRcdFx0dGhyb3cgbmV3IFJlZmVyZW5jZUVycm9yKCk7XG5cdFx0XHR9XG5cblx0XHRcdHVybCA9IHNlbGYubWFrZVVybCh7XG5cdFx0XHRcdG5vdmVsX2lkOiBkYXRhLm5vdmVsX2lkLFxuXHRcdFx0fSk7XG5cdFx0fVxuXG5cdFx0bGV0IF9kYXRhID0ge1xuXG5cdFx0XHR1cmw6IHVybCxcblxuXHRcdFx0ZGF0YToge30gYXMgYW55LFxuXG5cdFx0XHR2YWx1ZTogbnVsbCBhcyBhbnlbXSxcblxuXHRcdH07XG5cblx0XHRyZXR1cm4gYXdhaXQgZnJvbVVSTCh1cmwsIG9wdGlvbnNSdW50aW1lLm9wdGlvbnNKU0RPTSlcblx0XHRcdC50aGVuKGZ1bmN0aW9uIChkb20pXG5cdFx0XHR7XG5cdFx0XHRcdGNvbnN0ICQgPSBkb20uJDtcblx0XHRcdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdFx0XHRjb25zdCB3aW5kb3cgPSBkb20ud2luZG93IGFzIHtcblx0XHRcdFx0XHRnX2xub3ZlbF9pZCxcblx0XHRcdFx0XHRnX2xub3ZlbF9uYW1lLFxuXG5cdFx0XHRcdFx0dm9sdW1lX2xpc3Q6IGFueVtdLFxuXHRcdFx0XHRcdGNoYXB0ZXJfbGlzdDogYW55W10sXG5cdFx0XHRcdH07XG5cblx0XHRcdFx0Ly9jb25zb2xlLmxvZyhkb20uc2VyaWFsaXplKCkpO1xuXG5cdFx0XHRcdF9kYXRhLmRhdGEuZ19sbm92ZWxfaWQgPSB3aW5kb3cuZ19sbm92ZWxfaWQ7XG5cdFx0XHRcdF9kYXRhLmRhdGEuZ19sbm92ZWxfbmFtZSA9IHdpbmRvdy5nX2xub3ZlbF9uYW1lO1xuXG5cdFx0XHRcdF9kYXRhLmRhdGEuY292ZXJfcGljID0gJCgnI2NvdmVyX3BpYycpLmF0dHIoJ3NyYycpO1xuXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRsZXQgX3QgPSAkKCcubWFpbiAucGljIC5jb24nKS50ZXh0KCk7XG5cblx0XHRcdFx0XHRfZGF0YS5kYXRhLmNvbiA9IF90O1xuXG5cdFx0XHRcdFx0aWYgKF90Lm1hdGNoKC/kvZzogIXvvJooLispLykpXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0X2RhdGEuZGF0YS5hdXRob3IgPSBSZWdFeHAuJDE7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGlmIChfdC5tYXRjaCgv57G75Z6L77yaKC4rKS8pKVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdF9kYXRhLmRhdGEudHlwZSA9IChSZWdFeHAuJDEpLnRvU3RyaW5nKCkuc3BsaXQoJy8nKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0aWYgKF90Lm1hdGNoKC/nirbmgIHvvJooLispLykpXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0X2RhdGEuZGF0YS5zdGF0dXMgPSBSZWdFeHAuJDE7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGlmIChfdC5tYXRjaCgv5pu05paw77yaKC4rKS8pKVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdF9kYXRhLmRhdGEubGFzdHVwZGF0ZSA9IG1vbWVudC50eihSZWdFeHAuJDEsICdZWVlZLU1NLUREIEhIOm1tOnNzJywgJ0FzaWEvVGFpcGVpJyk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cblx0XHRcdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdFx0XHRfZGF0YS5kYXRhLmRlc2MgPSAkKCcjZGV0YWlsX2Jsb2NrID4gLmlsaXN0Omhhcyg+IGgzKSA+IHAnKS50ZXh0KCk7XG5cblx0XHRcdFx0d2luZG93LnZvbHVtZV9saXN0ID0gd2luZG93LnZvbHVtZV9saXN0LnJldmVyc2UoKTtcblx0XHRcdFx0d2luZG93LmNoYXB0ZXJfbGlzdCA9IHdpbmRvdy5jaGFwdGVyX2xpc3QucmV2ZXJzZSgpO1xuXG5cdFx0XHRcdGxldCBsaXN0ID0gW107XG5cblx0XHRcdFx0Zm9yIChsZXQgdiBpbiB3aW5kb3cuY2hhcHRlcl9saXN0KVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0bGV0IHZvbHVtZV9uYW1lID0gJCh3aW5kb3cudm9sdW1lX2xpc3Rbdl0pLmZpbmQoJy5jaGFwbmFtZXN1YicpLnRleHQoKTtcblxuXHRcdFx0XHRcdHdpbmRvdy5jaGFwdGVyX2xpc3Rbdl0gPSB3aW5kb3cuY2hhcHRlcl9saXN0W3ZdLnJldmVyc2UoKTtcblxuXHRcdFx0XHRcdC8vbGV0IGRhdGEgPSBwYXJzZVVybCgkKGRvbS53aW5kb3cuY2hhcHRlcl9saXN0W3ZdWzBdKS5hdHRyKCdocmVmJykpO1xuXG5cdFx0XHRcdFx0bGlzdFt2XSA9IHtcblx0XHRcdFx0XHRcdGluZGV4OiB2LFxuXG5cdFx0XHRcdFx0XHRub3ZlbF9pZDogbnVsbCxcblxuXHRcdFx0XHRcdFx0dm9sdW1lX25hbWU6IHZvbHVtZV9uYW1lLFxuXHRcdFx0XHRcdFx0dm9sdW1lX2lkOiBudWxsLFxuXG5cdFx0XHRcdFx0XHRjaGFwdGVyOiBbXSxcblx0XHRcdFx0XHR9O1xuXG5cdFx0XHRcdFx0Zm9yIChsZXQgY2kgaW4gd2luZG93LmNoYXB0ZXJfbGlzdFt2XSlcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRpZiAoIXdpbmRvdy5jaGFwdGVyX2xpc3Rbdl1bY2ldKVxuXHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRjb250aW51ZTtcblx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0bGV0IF9hID0gJCh3aW5kb3cuY2hhcHRlcl9saXN0W3ZdW2NpXSk7XG5cblx0XHRcdFx0XHRcdC8vY29uc29sZS5sb2coX2EpO1xuXG5cdFx0XHRcdFx0XHRsZXQgX2QgPSBzZWxmLnBhcnNlVXJsKF9hLnByb3AoJ2hyZWYnKSk7XG5cblx0XHRcdFx0XHRcdGlmICghbGlzdFt2XS52b2x1bWVfaWQpXG5cdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdGxpc3Rbdl0ubm92ZWxfaWQgPSBfZC5ub3ZlbF9pZDtcblx0XHRcdFx0XHRcdFx0bGlzdFt2XS52b2x1bWVfaWQgPSBfZC52b2x1bWVfaWQ7XG5cdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdGxpc3Rbdl0uY2hhcHRlci5wdXNoKHtcblx0XHRcdFx0XHRcdFx0aW5kZXg6IGNpLFxuXHRcdFx0XHRcdFx0XHRpbmRleF92b2x1bWU6IHYsXG5cblx0XHRcdFx0XHRcdFx0bm92ZWxfaWQ6IF9kLm5vdmVsX2lkLFxuXG5cdFx0XHRcdFx0XHRcdHZvbHVtZV9pZDogX2Qudm9sdW1lX2lkLFxuXHRcdFx0XHRcdFx0XHR2b2x1bWVfbmFtZTogdm9sdW1lX25hbWUsXG5cblx0XHRcdFx0XHRcdFx0Y2hhcHRlcl9uYW1lOiBfYS50ZXh0KCksXG5cdFx0XHRcdFx0XHRcdGNoYXB0ZXJfaWQ6IF9kLmNoYXB0ZXJfaWQsXG5cblx0XHRcdFx0XHRcdFx0dXJsOiBfYS5wcm9wKCdocmVmJyksXG5cdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRfZGF0YS52YWx1ZSA9IGxpc3Q7XG5cblx0XHRcdFx0cmV0dXJuIF9kYXRhO1xuXHRcdFx0fSlcblx0XHRcdC50aGVuKGZ1bmN0aW9uIChfZGF0YSlcblx0XHRcdHtcblx0XHRcdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdFx0XHRfZGF0YS5jaGVja2RhdGUgPSBtb21lbnQoKS50eihtb21lbnQudHouZ3Vlc3MoKSk7XG5cblx0XHRcdFx0cmV0dXJuIF9kYXRhO1xuXHRcdFx0fSlcblx0XHRcdDtcblx0fVxuXG5cdGFzeW5jIF9kb3dubG9hZENoYXB0ZXIoZGF0YSwgb3B0aW9uc1J1bnRpbWU6IE5vdmVsU2l0ZS5JT3B0aW9uc1J1bnRpbWUpXG5cdHtcblx0XHRjb25zdCBzZWxmID0gdGhpcztcblx0XHRsZXQgdXJsOiBVUkw7XG5cblx0XHR7XG5cdFx0XHRkYXRhID0gc2VsZi5wYXJzZVVybChkYXRhKTtcblxuXHRcdFx0aWYgKCFkYXRhLm5vdmVsX2lkKVxuXHRcdFx0e1xuXHRcdFx0XHR0aHJvdyBuZXcgUmVmZXJlbmNlRXJyb3IoKTtcblx0XHRcdH1cblxuXHRcdFx0dXJsID0gc2VsZi5tYWtlVXJsKGRhdGEpO1xuXHRcdH1cblxuXHRcdGxldCBfZGF0YSA9IHt9IGFzIGFueTtcblxuXHRcdGxldCAkO1xuXG5cdFx0cmV0dXJuIGZyb21VUkwodXJsLCBvcHRpb25zUnVudGltZS5vcHRpb25zSlNET00pXG5cdFx0XHQudGhlbihhc3luYyAoZG9tKSA9PlxuXHRcdFx0e1xuXHRcdFx0XHRsZXQgd2luZG93ID0gZG9tLndpbmRvdyBhcyB7XG5cdFx0XHRcdFx0W2tleTogc3RyaW5nXTogYW55O1xuXHRcdFx0XHR9O1xuXG5cdFx0XHRcdCQgPSBkb20uJDtcblxuXHRcdFx0XHRsZXQgY2hhcHRlcl9uYW1lID0gd2luZG93LmdfY2hhcHRlcl9uYW1lXG5cdFx0XHRcdFx0LnJlcGxhY2UoL1xcXFwvaWcsICcnKVxuXHRcdFx0XHRcdC5yZXBsYWNlKC9eW1xcc1xcdUZFRkZcXHhBMOOAgF0rfFtcXHNcXHVGRUZGXFx4QTDjgIBdKyQvZywgJycpXG5cdFx0XHRcdDtcblx0XHRcdFx0bGV0IHZvbHVtZV9uYW1lID0gd2luZG93LmRvY3VtZW50XG5cdFx0XHRcdFx0LnF1ZXJ5U2VsZWN0b3IoJyNwYWdlX2NvbnRlbnRzIC50aXQnKVxuXHRcdFx0XHRcdC5pbm5lckhUTUxcblx0XHRcdFx0XHQucmVwbGFjZSgvXFxcXC9pZywgJycpXG5cdFx0XHRcdFx0LnJlcGxhY2UoY2hhcHRlcl9uYW1lLCAnJylcblx0XHRcdFx0XHQucmVwbGFjZSgvXltcXHNcXHVGRUZGXFx4QTDjgIBdK3xbXFxzXFx1RkVGRlxceEEw44CAXSskL2csICcnKVxuXHRcdFx0XHQ7XG5cblx0XHRcdFx0X2RhdGEgPSB7XG5cblx0XHRcdFx0XHR1cmw6IHVybCxcblxuXHRcdFx0XHRcdGRhdGE6IHtcblx0XHRcdFx0XHRcdGdfbG5vdmVsX2lkOiB3aW5kb3cuZ19sbm92ZWxfaWQsXG5cdFx0XHRcdFx0XHRnX3ZvbHVtZV9pZDogd2luZG93Lmdfdm9sdW1lX2lkLFxuXHRcdFx0XHRcdFx0Z19jaGFwdGVyX2lkOiB3aW5kb3cuZ19jaGFwdGVyX2lkLFxuXG5cdFx0XHRcdFx0XHRnX2xub3ZlbF9uYW1lOiB3aW5kb3cuZ19sbm92ZWxfbmFtZSxcblx0XHRcdFx0XHRcdGdfdm9sdW1lX25hbWU6IHZvbHVtZV9uYW1lLFxuXHRcdFx0XHRcdFx0Z19jaGFwdGVyX25hbWU6IGNoYXB0ZXJfbmFtZSxcblxuXHRcdFx0XHRcdFx0Y2hhcHRlcl9uYW1lOiBjaGFwdGVyX25hbWUsXG5cdFx0XHRcdFx0XHR2b2x1bWVfbmFtZTogdm9sdW1lX25hbWUsXG5cdFx0XHRcdFx0fSxcblxuXHRcdFx0XHRcdHZhbHVlOiBudWxsLFxuXG5cdFx0XHRcdH07XG5cblx0XHRcdFx0bGV0IHBhID0gW107XG5cblx0XHRcdFx0cGFbMF0gPSB3aW5kb3cuZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNjaGFwdGVyX2NvbnRlbnRzX2ZpcnN0XCIpLmlubmVySFRNTDtcblxuXHRcdFx0XHRpZiAod2luZG93LmdfY2hhcHRlcl9wYWdlc19jb3VudCA+IDEpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRsZXQgdWEgPSAod2luZG93LmdfY2hhcHRlcl9wYWdlc191cmwgYXMgQXJyYXk8c3RyaW5nPilcblx0XHRcdFx0XHRcdC5maWx0ZXIoZnVuY3Rpb24gKHZhbHVlKVxuXHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRyZXR1cm4gdmFsdWU7XG5cdFx0XHRcdFx0XHR9KVxuXHRcdFx0XHRcdFx0Lm1hcChmdW5jdGlvbiAodmFsdWUsIGluZGV4LCBhcnJheSlcblx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0aWYgKHZhbHVlKVxuXHRcdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdFx0dmFsdWUgPSAnaHR0cDovL3EuZG16ai5jb20vJyArIHZhbHVlO1xuXHRcdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdFx0cmV0dXJuIHZhbHVlO1xuXHRcdFx0XHRcdFx0fSlcblx0XHRcdFx0XHQ7XG5cblx0XHRcdFx0XHRhd2FpdCBtYW55UmVxdWVzdCh1YSwge1xuXHRcdFx0XHRcdFx0ZW5jb2Rpbmc6IG51bGwsXG5cdFx0XHRcdFx0XHRyZXNvbHZlV2l0aEZ1bGxSZXNwb25zZTogdHJ1ZSxcblx0XHRcdFx0XHR9KVxuXHRcdFx0XHRcdFx0LnRoZW4oYXN5bmMgZnVuY3Rpb24gKHJldClcblx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0cGEgPSBwYS5jb25jYXQocmV0Lm1hcChmdW5jdGlvbiAodmFsdWUsIGluZGV4LCBhcnJheSlcblx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdC8vY29uc29sZS5sb2codmFsdWUuYm9keSk7XG5cblx0XHRcdFx0XHRcdFx0XHRyZXR1cm4gdmFsdWUuYm9keS50b1N0cmluZygpO1xuXHRcdFx0XHRcdFx0XHR9KSlcblx0XHRcdFx0XHRcdFx0O1xuXHRcdFx0XHRcdFx0fSlcblx0XHRcdFx0XHQ7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRyZXR1cm4gcGE7XG5cdFx0XHR9KVxuXHRcdFx0LnRoZW4oYXN5bmMgZnVuY3Rpb24gKHBhKVxuXHRcdFx0e1xuXHRcdFx0XHRfZGF0YS5pbWdzID0gW107XG5cblx0XHRcdFx0cGEgPSBhd2FpdCBQcm9taXNlQmx1ZWJpcmQubWFwU2VyaWVzKHBhLCBhc3luYyBmdW5jdGlvbiAodmFsdWUsIGlkeClcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGxldCBfYyA9IHt9O1xuXG5cdFx0XHRcdFx0Ly9sZXQgJCA9IGNoZWVyaW8ubG9hZCh2YWx1ZSk7XG5cblx0XHRcdFx0XHRsZXQgX2EgPSAkKHZhbHVlKTtcblxuXHRcdFx0XHRcdGxldCBfaW1nID0gX2EuZmluZCgnaW1nJyk7XG5cblx0XHRcdFx0XHQvL2NvbnNvbGUubG9nKF9pbWcubGVuZ3RoKTtcblxuXHRcdFx0XHRcdGlmIChfaW1nLmxlbmd0aClcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRfaW1nLmVhY2goZnVuY3Rpb24gKGluZGV4LCBlbGVtKVxuXHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHQvLyBAdHMtaWdub3JlXG5cdFx0XHRcdFx0XHRcdGxldCBfdGhpcyA9ICQodGhpcyk7XG5cblx0XHRcdFx0XHRcdFx0aWYgKF90aGlzLnByb3AoJ3NyYycpKVxuXHRcdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdFx0bGV0IGlkID0gc2hvcnRpZCgpO1xuXG5cdFx0XHRcdFx0XHRcdFx0X2NbaWRdID0gX3RoaXMucHJvcCgnc3JjJyk7XG5cdFx0XHRcdFx0XHRcdFx0X2RhdGEuaW1ncy5wdXNoKF9jW2lkXSk7XG5cblx0XHRcdFx0XHRcdFx0XHQvLyBAdHMtaWdub3JlXG5cdFx0XHRcdFx0XHRcdFx0JChgPHNwYW4+e3tAJHtpZH1AfX08L3NwYW4+YCkuaW5zZXJ0QWZ0ZXIodGhpcyk7XG5cblx0XHRcdFx0XHRcdFx0XHQvLyBAdHMtaWdub3JlXG5cdFx0XHRcdFx0XHRcdFx0JCh0aGlzKVxuXHRcdFx0XHRcdFx0XHRcdFx0LnJlbW92ZSgpXG5cdFx0XHRcdFx0XHRcdFx0O1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHR9KTtcblxuXHRcdFx0XHRcdFx0Ly9jb25zb2xlLmxvZygkLmh0bWwoKSk7XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0bGV0IF90ID0gX2EudGV4dCgpO1xuXG5cdFx0XHRcdFx0Zm9yIChsZXQgaWQgaW4gX2MpXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0Lypcblx0XHRcdFx0XHRcdGlmICghL14oPzpbYS16XVxcOnxcXDopP1xcL1xcLy9pLnRlc3QoX2NbaWRdKSlcblx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0X2NbaWRdID0gJ2h0dHA6Ly9xLmRtemouY29tLycgKyBfY1tpZF07XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHQqL1xuXG5cdFx0XHRcdFx0XHQvKlxuXHRcdFx0XHRcdFx0YXdhaXQgZG93bmxvYWRfaW1hZ2UoX2NbaWRdLCB7XG5cdFx0XHRcdFx0XHRcdGZyb21maWxlOiBmaWxlLFxuXHRcdFx0XHRcdFx0XHRwcmVmaXg6ICdpbWdfJyArIChfaWR4KyspLnRvU3RyaW5nKCkucGFkU3RhcnQoMywgJzAnKSArICdfJyxcblx0XHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdFx0Ki9cblxuXHRcdFx0XHRcdFx0X3QgPSBfdC5yZXBsYWNlKGB7e0Ake2lkfUB9fWAsIGBcXG5cXG48aW1nIHNyYz1cIiR7X2NbaWRdfVwiLz5cXG5cXG5gKTtcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRyZXR1cm4gX3Q7XG5cdFx0XHRcdH0pO1xuXG5cdFx0XHRcdHJldHVybiBwYS5qb2luKFwiXFxuXCIpO1xuXHRcdFx0fSlcblx0XHRcdC50aGVuKGZ1bmN0aW9uIChodG1sKVxuXHRcdFx0e1xuXHRcdFx0XHRyZXR1cm4gaHRtbFxuXHRcdFx0XHRcdC5yZXBsYWNlKC9eXFxzKig/OjxwPik/L2ksICcnKVxuXHRcdFx0XHRcdC5yZXBsYWNlKC9cXHMqPCg/OlxcLz9wfGJyXFwvPyk+XFxzKiQvaSwgJycpXG5cdFx0XHRcdFx0LnJlcGxhY2UoL1xcclxcbnxcXHIoPyFcXG4pL2csIFwiXFxuXCIpXG5cdFx0XHRcdFx0Ly8ucmVwbGFjZSgvPFxcL3A+PHA+XFxuL2lnLCBcIlxcblwiKVxuXHRcdFx0XHRcdC8vLnJlcGxhY2UoLzxwPjxcXC9wPi9pZywgXCJcXG5cIilcblx0XHRcdFx0XHQvLy5yZXBsYWNlKC8oPFxcL3A+fDxwPilcXG4vaWcsIFwiXFxuXCIpXG5cdFx0XHRcdFx0LnJlcGxhY2UoL1tcXHRcXHVGRUZGXFx4QTDjgIBdKyhcXG58JCkvaWcsIFwiJDFcIilcblx0XHRcdFx0XHQucmVwbGFjZSgvKFxcbilbXFx0XSsvaWcsIFwiJDFcIilcblx0XHRcdFx0XHQucmVwbGFjZSgvXFxzKyQvaWcsIFwiXCIpXG5cdFx0XHRcdFx0LnJlcGxhY2UoL1xcbnszLH0vaWcsIFwiXFxuXFxuXCIpXG5cdFx0XHRcdFx0O1xuXHRcdFx0fSlcblx0XHRcdC50aGVuKGZ1bmN0aW9uIChodG1sKVxuXHRcdFx0e1xuXHRcdFx0XHRfZGF0YS52YWx1ZSA9IGh0bWw7XG5cdFx0XHRcdF9kYXRhLmNoZWNrZGF0ZSA9IG1vbWVudCgpLnR6KG1vbWVudC50ei5ndWVzcygpKTtcblxuXHRcdFx0XHRyZXR1cm4gX2RhdGE7XG5cdFx0XHR9KVxuXHRcdFx0O1xuXHR9XG5cbn1cblxuZXhwb3J0IGRlZmF1bHQgTm92ZWxTaXRlRG16ajtcbiJdfQ==