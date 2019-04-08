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
const path = require("path");
const node_novel_info_1 = require("node-novel-info");
const jsdom_extra_1 = require("jsdom-extra");
const jsdom_url_1 = require("jsdom-url");
const index_1 = require("../index");
const index_2 = require("../index");
const index_3 = require("../index");
const shortid = require("shortid");
const fetch_1 = require("../../fetch");
const jsdom_1 = require("../../jsdom");
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
                let volume_name = a.volume_name;
                console.log(a.url);
                return self._downloadChapter(a.url, optionsRuntime)
                    .then(async function (data) {
                    let _file = path.join(path_main, util_1.trimFilename(`${a.index_volume.toString()
                        .padStart(pad_len, '0')} ${volume_name}_(${data.data.g_volume_id})`), util_1.trimFilename(`${a.index.toString()
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
            _data.checkdate = index_3.moment().tz(index_3.moment.tz.guess());
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
        return await jsdom_extra_1.fromURL(url, optionsRuntime.optionsJSDOM)
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
                        let _this = $(this);
                        if (_this.prop('src')) {
                            let id = shortid();
                            _c[id] = _this.prop('src');
                            _data.imgs.push(_c[id]);
                            $(`<span>{{@${id}@}}</span>`).insertAfter(this);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7O0dBRUc7Ozs7Ozs7O0FBRUgsK0JBQWdDO0FBQ2hDLHdDQUE2QztBQUM3Qyw2QkFBNkI7QUFDN0IscURBQXlEO0FBQ3pELDZDQUErRDtBQUcvRCx5Q0FBZ0M7QUFHaEMsb0NBQTBGO0FBQzFGLG9DQUE4RDtBQUM5RCxvQ0FBa0M7QUFDbEMsbUNBQW1DO0FBQ25DLHVDQUEwQztBQUMxQyx1Q0FBaUQ7QUFHakQsSUFBYSxhQUFhLEdBQTFCLE1BQWEsYUFBYyxTQUFRLGVBQVM7SUFJM0MsUUFBUSxDQUFDLE1BQTJCLEVBQUUsSUFBSztRQUUxQyxJQUFJLENBQUMsTUFBTSxDQUFDLFVBQVUsRUFDdEI7WUFDQyxJQUFJLENBQUMsTUFBTSxDQUFDLFNBQVMsRUFDckI7Z0JBQ0MsT0FBTyxxQkFBcUIsTUFBTSxDQUFDLFFBQVEsY0FBYyxDQUFDO2FBQzFEO1lBRUQsT0FBTyxxQkFBcUIsTUFBTSxDQUFDLFFBQVEsSUFBSSxNQUFNLENBQUMsU0FBUyxJQUFJLE1BQU0sQ0FBQyxTQUFTLE1BQU0sQ0FBQztTQUMxRjtRQUVELE9BQU8scUJBQXFCLE1BQU0sQ0FBQyxRQUFRLElBQUksTUFBTSxDQUFDLFNBQVMsSUFBSSxNQUFNLENBQUMsVUFBVSxHQUFHLElBQUk7WUFDMUYsQ0FBQyxDQUFDLEdBQUcsR0FBRyxJQUFJO1lBQ1osQ0FBQyxDQUFDLEVBQUUsUUFBUSxDQUFDO0lBQ2YsQ0FBQztJQUVELE9BQU8sQ0FBQyxNQUEyQixFQUFFLElBQWM7UUFFbEQsSUFBSSxHQUFHLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFFdEMsYUFBYTtRQUNiLE9BQU8sSUFBSSxlQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDckIsQ0FBQztJQUVELFFBQVEsQ0FBQyxHQUFpQjtRQUV6QixJQUFJLE1BQU0s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QztpQkFDNUIsT0FBTyxDQUFDLFFBQVEsRUFBRSxFQUFFLENBQUM7aUJBQ3JCLE9BQU8sQ0FBQyxVQUFVLEVBQUUsTUFBTSxDQUFDLENBQzNCO1FBQ0gsQ0FBQyxDQUFDO2FBQ0QsSUFBSSxDQUFDLFVBQVUsSUFBSTtZQUVuQixLQUFLLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQztZQUNuQixLQUFLLENBQUMsU0FBUyxHQUFHLGNBQU0sRUFBRSxDQUFDLEVBQUUsQ0FBQyxjQUFNLENBQUMsRUFBRSxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUM7WUFFakQsT0FBTyxLQUFLLENBQUM7UUFDZCxDQUFDLENBQUMsQ0FDRDtJQUNILENBQUM7Q0FFRCxDQUFBO0FBcmdCTyxtQkFBSyxHQUFHLE1BQU0sQ0FBQztBQUZWLGFBQWE7SUFEekIsd0JBQWdCLEVBQTZDO0dBQ2pELGFBQWEsQ0F1Z0J6QjtBQXZnQlksc0NBQWE7QUF5Z0IxQixrQkFBZSxhQUFhLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENyZWF0ZWQgYnkgdXNlciBvbiAyMDE3LzEyLzYvMDA2LlxuICovXG5cbmltcG9ydCBmcyA9IHJlcXVpcmUoJ2ZzLWV4dHJhJyk7XG5pbXBvcnQgeyB0cmltRmlsZW5hbWUgfSBmcm9tICdmcy1pY29udi91dGlsJztcbmltcG9ydCAqIGFzIHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQgbm92ZWxJbmZvLCB7IElNZGNvbmZNZXRhIH0gZnJvbSAnbm9kZS1ub3ZlbC1pbmZvJztcbmltcG9ydCB7IGZyb21VUkwsIElGcm9tVXJsT3B0aW9ucywgSUpTRE9NIH0gZnJvbSAnanNkb20tZXh0cmEnO1xuLy8gQHRzLWlnbm9yZVxuaW1wb3J0IHsgTGF6eUNvb2tpZSwgTGF6eUNvb2tpZUphciB9IGZyb20gJ2pzZG9tLWV4dHJhJztcbmltcG9ydCB7IFVSTCB9IGZyb20gJ2pzZG9tLXVybCc7XG5pbXBvcnQgeyBkb3dubG9hZF9pbWFnZSB9IGZyb20gJy4uL2ltYWdlJztcblxuaW1wb3J0IE5vdmVsU2l0ZSwgeyBzdGF0aWNJbXBsZW1lbnRzLCBkZWZhdWx0SlNET01PcHRpb25zLCBTWU1CT0xfQ0FDSEUgfSBmcm9tICcuLi9pbmRleCc7XG5pbXBvcnQgeyBQcm9taXNlQmx1ZWJpcmQsIGJsdWViaXJkRGVjb3JhdG9yIH0gZnJvbSAnLi4vaW5kZXgnO1xuaW1wb3J0IHsgbW9tZW50IH0gZnJvbSAnLi4vaW5kZXgnO1xuaW1wb3J0ICogYXMgc2hvcnRpZCBmcm9tICdzaG9ydGlkJztcbmltcG9ydCB7IG1hbnlSZXF1ZXN0IH0gZnJvbSAnLi4vLi4vZmV0Y2gnO1xuaW1wb3J0IHsgY3JlYXRlT3B0aW9uc0pTRE9NIH0gZnJvbSAnLi4vLi4vanNkb20nO1xuXG5Ac3RhdGljSW1wbGVtZW50czxOb3ZlbFNpdGUuSU5vdmVsU2l0ZVN0YXRpYzxOb3ZlbFNpdGVEbXpqPj4oKVxuZXhwb3J0IGNsYXNzIE5vdmVsU2l0ZURtemogZXh0ZW5kcyBOb3ZlbFNpdGVcbntcblx0c3RhdGljIElES0VZID0gJ2RtemonO1xuXG5cdF9tYWtlVXJsKHVybG9iajogTm92ZWxTaXRlLklQYXJzZVVybCwgcGFnZT8pXG5cdHtcblx0XHRpZiAoIXVybG9iai5jaGFwdGVyX2lkKVxuXHRcdHtcblx0XHRcdGlmICghdXJsb2JqLnZvbHVtZV9pZClcblx0XHRcdHtcblx0XHRcdFx0cmV0dXJuIGBodHRwOi8vcS5kbXpqLmNvbS8ke3VybG9iai5ub3ZlbF9pZH0vaW5kZXguc2h0bWxgO1xuXHRcdFx0fVxuXG5cdFx0XHRyZXR1cm4gYGh0dHA6Ly9xLmRtemouY29tLyR7dXJsb2JqLm5vdmVsX2lkfS8ke3VybG9iai52b2x1bWVfaWR9LyR7dXJsb2JqLnZvbHVtZV9pZH0udHh0YDtcblx0XHR9XG5cblx0XHRyZXR1cm4gYGh0dHA6Ly9xLmRtemouY29tLyR7dXJsb2JqLm5vdmVsX2lkfS8ke3VybG9iai52b2x1bWVfaWR9LyR7dXJsb2JqLmNoYXB0ZXJfaWR9JHtwYWdlXG5cdFx0XHQ/ICdfJyArIHBhZ2Vcblx0XHRcdDogJyd9LnNodG1sYDtcblx0fVxuXG5cdG1ha2VVcmwodXJsb2JqOiBOb3ZlbFNpdGUuSVBhcnNlVXJsLCBib29sID86IG51bWJlcik6IFVSTFxuXHR7XG5cdFx0bGV0IHVybCA9IHRoaXMuX21ha2VVcmwodXJsb2JqLCBib29sKTtcblxuXHRcdC8vIEB0cy1pZ25vcmVcblx0XHRyZXR1cm4gbmV3IFVSTCh1cmwpO1xuXHR9XG5cblx0cGFyc2VVcmwodXJsOiBzdHJpbmcgfCBVUkwpOiBOb3ZlbFNpdGUuSVBhcnNlVXJsXG5cdHtcblx0XHRsZXQgdXJsb2JqID0ge1xuXHRcdFx0dXJsOiBuZXcgVVJMKHVybCksXG5cblx0XHRcdG5vdmVsX2lkOiBudWxsLFxuXHRcdFx0dm9sdW1lX2lkOiBudWxsLFxuXHRcdFx0Y2hhcHRlcl9pZDogbnVsbCxcblx0XHR9O1xuXG5cdFx0dXJsID0gdXJsb2JqLnVybC5ocmVmO1xuXG5cdFx0bGV0IHIgPSAvKD86cVxcLmRtempcXC5jb21cXC98XlxcLykoPzooXFxkKylcXC8oPzooXFxkKylcXC8oPzooXFxkKylbXFwuX10pPyk/KS87XG5cblx0XHRsZXQgbSA9IHIuZXhlYyh1cmwudG9TdHJpbmcoKSk7XG5cblx0XHRpZiAobSlcblx0XHR7XG5cdFx0XHR1cmxvYmoubm92ZWxfaWQgPSBtWzFdO1xuXHRcdFx0dXJsb2JqLnZvbHVtZV9pZCA9IG1bMl07XG5cdFx0XHR1cmxvYmouY2hhcHRlcl9pZCA9IG1bM107XG5cdFx0fVxuXG5cdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdHJldHVybiB1cmxvYmo7XG5cdH1cblxuXHRkb3dubG9hZCh1cmw6IHN0cmluZyB8IFVSTCwgZG93bmxvYWRPcHRpb25zOiBOb3ZlbFNpdGUuSURvd25sb2FkT3B0aW9ucyA9IHt9KVxuXHR7XG5cdFx0Y29uc3Qgc2VsZiA9IHRoaXM7XG5cblx0XHRjb25zdCBbUEFUSF9OT1ZFTF9NQUlOLCBvcHRpb25zUnVudGltZV0gPSB0aGlzLmdldE91dHB1dERpcjxOb3ZlbFNpdGUuSU9wdGlvbnNSdW50aW1lPihkb3dubG9hZE9wdGlvbnMpO1xuXG5cdFx0Lypcblx0XHRvcHRpb25zUnVudGltZS5vcHRpb25zSlNET00gPSBPYmplY3QuYXNzaWduKHt9LCBkZWZhdWx0SlNET01PcHRpb25zLCBvcHRpb25zUnVudGltZS5vcHRpb25zSlNET00sIHtcblx0XHRcdHJ1blNjcmlwdHM6ICdkYW5nZXJvdXNseScsXG5cdFx0fSk7XG5cdFx0Ki9cblxuXHRcdG9wdGlvbnNSdW50aW1lLm9wdGlvbnNKU0RPTSA9IGNyZWF0ZU9wdGlvbnNKU0RPTShvcHRpb25zUnVudGltZS5vcHRpb25zSlNET00sIHtcblx0XHRcdHJ1blNjcmlwdHM6ICdkYW5nZXJvdXNseScsXG5cdFx0fSk7XG5cblx0XHRsZXQgcGF0aF9tYWluOiBzdHJpbmc7XG5cblx0XHRyZXR1cm4gUHJvbWlzZUJsdWViaXJkXG5cdFx0XHQuYmluZChzZWxmKVxuXHRcdFx0LnRoZW4oYXN5bmMgZnVuY3Rpb24gKClcblx0XHRcdHtcblx0XHRcdFx0bGV0IF9kYXRhID0gYXdhaXQgc2VsZi5fZG93bmxvYWRfaW5mbyh1cmwsIG9wdGlvbnNSdW50aW1lKTtcblxuXHRcdFx0XHRwYXRoX21haW4gPSBwYXRoLmpvaW4oc2VsZi5QQVRIX05PVkVMX01BSU4sXG5cdFx0XHRcdFx0dHJpbUZpbGVuYW1lKGAke19kYXRhLmRhdGEuZ19sbm92ZWxfbmFtZX1fKCR7X2RhdGEuZGF0YS5nX2xub3ZlbF9pZH0pYCksXG5cdFx0XHRcdCk7XG5cblx0XHRcdFx0bGV0IF9hID0gX2RhdGEudmFsdWUucmVkdWNlKGZ1bmN0aW9uIChhLCBiKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0cmV0dXJuIGEuY29uY2F0KGIuY2hhcHRlcik7XG5cdFx0XHRcdH0sIFtdKTtcblxuXHRcdFx0XHRsZXQgX2YgPSBhd2FpdCBQcm9taXNlQmx1ZWJpcmRcblx0XHRcdFx0XHQubWFwU2VyaWVzKF9hLCBmdW5jdGlvbiAoYSwgaW5kZXgsIGxlbilcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRsZXQgcGFkX2xlbiA9IGxlbi50b1N0cmluZygpLmxlbmd0aCA+IDQgPyBsZW4udG9TdHJpbmcoKS5sZW5ndGggOiA0O1xuXHRcdFx0XHRcdFx0bGV0IHZvbHVtZV9uYW1lID0gYS52b2x1bWVfbmFtZTtcblxuXHRcdFx0XHRcdFx0Y29uc29sZS5sb2coYS51cmwpO1xuXG5cdFx0XHRcdFx0XHRyZXR1cm4gc2VsZi5fZG93bmxvYWRDaGFwdGVyKGEudXJsLCBvcHRpb25zUnVudGltZSlcblx0XHRcdFx0XHRcdFx0LnRoZW4oYXN5bmMgZnVuY3Rpb24gKGRhdGEpXG5cdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHRsZXQgX2ZpbGUgPSBwYXRoLmpvaW4ocGF0aF9tYWluLFxuXHRcdFx0XHRcdFx0XHRcdFx0dHJpbUZpbGVuYW1lKGAke2EuaW5kZXhfdm9sdW1lLnRvU3RyaW5nKClcblx0XHRcdFx0XHRcdFx0XHRcdFx0LnBhZFN0YXJ0KHBhZF9sZW4sICcwJyl9ICR7dm9sdW1lX25hbWV9Xygke2RhdGEuZGF0YS5nX3ZvbHVtZV9pZH0pYCksXG5cdFx0XHRcdFx0XHRcdFx0XHR0cmltRmlsZW5hbWUoYCR7YS5pbmRleC50b1N0cmluZygpXG5cdFx0XHRcdFx0XHRcdFx0XHRcdC5wYWRTdGFydChwYWRfbGVuLCAnMCcpfV8ke2RhdGEuZGF0YS5jaGFwdGVyX25hbWV9LiR7ZGF0YS5kYXRhLmdfY2hhcHRlcl9pZH1gKVxuXHRcdFx0XHRcdFx0XHRcdCk7XG5cblx0XHRcdFx0XHRcdFx0XHRhd2FpdCBmcy5vdXRwdXRKc29uKF9maWxlICsgJy5qc29uJywgZGF0YSwge1xuXHRcdFx0XHRcdFx0XHRcdFx0c3BhY2VzOiBcIlxcdFwiLFxuXHRcdFx0XHRcdFx0XHRcdH0pO1xuXG5cdFx0XHRcdFx0XHRcdFx0YXdhaXQgZnMub3V0cHV0RmlsZShfZmlsZSArICcudHh0JywgZGF0YS52YWx1ZSk7XG5cblx0XHRcdFx0XHRcdFx0XHRyZXR1cm4gcGF0aC5yZWxhdGl2ZShzZWxmLlBBVEhfTk9WRUxfTUFJTiwgX2ZpbGUpO1xuXHRcdFx0XHRcdFx0XHR9KVxuXHRcdFx0XHRcdFx0XHQudGhlbihmdW5jdGlvbiAoZmlsZSlcblx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdGNvbnNvbGUubG9nKCdkb25lJywgZmlsZSk7XG5cblx0XHRcdFx0XHRcdFx0XHRyZXR1cm4gZmlsZTtcblx0XHRcdFx0XHRcdFx0fSlcblx0XHRcdFx0XHRcdFx0O1xuXHRcdFx0XHRcdH0pXG5cdFx0XHRcdFx0LnRoZW4oZnVuY3Rpb24gKHJldClcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHQvL2NvbnNvbGUubG9nKCdkb25lJywgcmV0KTtcblxuXHRcdFx0XHRcdFx0cmV0dXJuIHJldDtcblx0XHRcdFx0XHR9KVxuXHRcdFx0XHQ7XG5cblx0XHRcdFx0X2RhdGEuY2hlY2tkYXRlID0gbW9tZW50KCkudHoobW9tZW50LnR6Lmd1ZXNzKCkpO1xuXG5cdFx0XHRcdF9kYXRhLmZpbGVzID0gX2Y7XG5cblx0XHRcdFx0cmV0dXJuIF9kYXRhO1xuXHRcdFx0fSlcblx0XHRcdC50YXAoYXN5bmMgZnVuY3Rpb24gKG5vdmVsKVxuXHRcdFx0e1xuXG5cdFx0XHRcdGF3YWl0IGZzLm91dHB1dEpzb24ocGF0aC5qb2luKHBhdGhfbWFpbiwgdHJpbUZpbGVuYW1lKGAke25vdmVsLmRhdGEuZ19sbm92ZWxfbmFtZX0uJHtub3ZlbC5kYXRhLmdfbG5vdmVsX2lkfWApKSArICcuanNvbicsIG5vdmVsLCB7XG5cdFx0XHRcdFx0c3BhY2VzOiBcIlxcdFwiLFxuXHRcdFx0XHR9KTtcblxuXHRcdFx0XHRsZXQgb3B0aW9ucyA9IHt9O1xuXHRcdFx0XHRvcHRpb25zW3NlbGYuSURLRVldID0ge1xuXHRcdFx0XHRcdC8vdHh0ZG93bmxvYWRfaWQ6IG5vdmVsLm5vdmVsX3N5b3NldHVfaWQsXG5cdFx0XHRcdH07XG5cblx0XHRcdFx0bGV0IG1kID0gbm92ZWxJbmZvLnN0cmluZ2lmeSh7XG5cdFx0XHRcdFx0bm92ZWw6IHtcblx0XHRcdFx0XHRcdHRhZ3M6IFtcblx0XHRcdFx0XHRcdFx0c2VsZi5JREtFWSxcblx0XHRcdFx0XHRcdF0sXG5cdFx0XHRcdFx0XHRzZXJpZXM6IHtcblx0XHRcdFx0XHRcdFx0bmFtZTogbm92ZWwubm92ZWxfc2VyaWVzX3RpdGxlIHx8ICcnLFxuXHRcdFx0XHRcdFx0fSxcblx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdG9wdGlvbnMsXG5cdFx0XHRcdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdFx0XHRcdGxpbms6IG5vdmVsLmxpbmsgfHwgW10sXG5cdFx0XHRcdH0sIG5vdmVsLCB7XG5cdFx0XHRcdFx0b3B0aW9uczoge1xuXHRcdFx0XHRcdFx0dGV4dGxheW91dDoge1xuXHRcdFx0XHRcdFx0XHRhbGxvd19sZjI6IHRydWUsXG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fSxcblx0XHRcdFx0fSk7XG5cblx0XHRcdFx0bGV0IGZpbGUgPSBwYXRoLmpvaW4ocGF0aF9tYWluLCBgUkVBRE1FLm1kYCk7XG5cdFx0XHRcdGF3YWl0IGZzLm91dHB1dEZpbGUoZmlsZSwgbWQpO1xuXG5cdFx0XHR9KVxuXHRcdFx0O1xuXHR9XG5cblx0YXN5bmMgX2Rvd25sb2FkX2luZm8odXJsOiBVUkwsXG5cdFx0b3B0aW9uc1J1bnRpbWU6IFBhcnRpYWw8Tm92ZWxTaXRlLklPcHRpb25zUnVudGltZT4gPSB7fVxuXHQpXG5cdHtcblx0XHRjb25zdCBzZWxmID0gdGhpcztcblxuXHRcdHtcblx0XHRcdGxldCBkYXRhID0gc2VsZi5wYXJzZVVybCh1cmwpO1xuXG5cdFx0XHRpZiAoIWRhdGEubm92ZWxfaWQpXG5cdFx0XHR7XG5cdFx0XHRcdHRocm93IG5ldyBSZWZlcmVuY2VFcnJvcigpO1xuXHRcdFx0fVxuXG5cdFx0XHR1cmwgPSBzZWxmLm1ha2VVcmwoe1xuXHRcdFx0XHRub3ZlbF9pZDogZGF0YS5ub3ZlbF9pZCxcblx0XHRcdH0pO1xuXHRcdH1cblxuXHRcdGxldCBfZGF0YSA9IHtcblxuXHRcdFx0dXJsOiB1cmwsXG5cblx0XHRcdGRhdGE6IHt9IGFzIGFueSxcblxuXHRcdFx0dmFsdWU6IG51bGwgYXMgYW55W10sXG5cblx0XHR9O1xuXG5cdFx0cmV0dXJuIGF3YWl0IGZyb21VUkwodXJsLCBvcHRpb25zUnVudGltZS5vcHRpb25zSlNET00pXG5cdFx0XHQudGhlbihmdW5jdGlvbiAoZG9tKVxuXHRcdFx0e1xuXHRcdFx0XHRjb25zdCAkID0gZG9tLiQ7XG5cdFx0XHRcdC8vIEB0cy1pZ25vcmVcblx0XHRcdFx0Y29uc3Qgd2luZG93ID0gZG9tLndpbmRvdyBhcyB7XG5cdFx0XHRcdFx0Z19sbm92ZWxfaWQsXG5cdFx0XHRcdFx0Z19sbm92ZWxfbmFtZSxcblxuXHRcdFx0XHRcdHZvbHVtZV9saXN0OiBhbnlbXSxcblx0XHRcdFx0XHRjaGFwdGVyX2xpc3Q6IGFueVtdLFxuXHRcdFx0XHR9O1xuXG5cdFx0XHRcdC8vY29uc29sZS5sb2coZG9tLnNlcmlhbGl6ZSgpKTtcblxuXHRcdFx0XHRfZGF0YS5kYXRhLmdfbG5vdmVsX2lkID0gd2luZG93LmdfbG5vdmVsX2lkO1xuXHRcdFx0XHRfZGF0YS5kYXRhLmdfbG5vdmVsX25hbWUgPSB3aW5kb3cuZ19sbm92ZWxfbmFtZTtcblxuXHRcdFx0XHRfZGF0YS5kYXRhLmNvdmVyX3BpYyA9ICQoJyNjb3Zlcl9waWMnKS5hdHRyKCdzcmMnKTtcblxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0bGV0IF90ID0gJCgnLm1haW4gLnBpYyAuY29uJykudGV4dCgpO1xuXG5cdFx0XHRcdFx0X2RhdGEuZGF0YS5jb24gPSBfdDtcblxuXHRcdFx0XHRcdGlmIChfdC5tYXRjaCgv5L2c6ICF77yaKC4rKS8pKVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdF9kYXRhLmRhdGEuYXV0aG9yID0gUmVnRXhwLiQxO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRpZiAoX3QubWF0Y2goL+exu+Wei++8miguKykvKSlcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRfZGF0YS5kYXRhLnR5cGUgPSAoUmVnRXhwLiQxKS50b1N0cmluZygpLnNwbGl0KCcvJyk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGlmIChfdC5tYXRjaCgv54q25oCB77yaKC4rKS8pKVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdF9kYXRhLmRhdGEuc3RhdHVzID0gUmVnRXhwLiQxO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRpZiAoX3QubWF0Y2goL+abtOaWsO+8miguKykvKSlcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRfZGF0YS5kYXRhLmxhc3R1cGRhdGUgPSBtb21lbnQudHooUmVnRXhwLiQxLCAnWVlZWS1NTS1ERCBISDptbTpzcycsICdBc2lhL1RhaXBlaScpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXG5cdFx0XHRcdC8vIEB0cy1pZ25vcmVcblx0XHRcdFx0X2RhdGEuZGF0YS5kZXNjID0gJCgnI2RldGFpbF9ibG9jayA+IC5pbGlzdDpoYXMoPiBoMykgPiBwJykudGV4dCgpO1xuXG5cdFx0XHRcdHdpbmRvdy52b2x1bWVfbGlzdCA9IHdpbmRvdy52b2x1bWVfbGlzdC5yZXZlcnNlKCk7XG5cdFx0XHRcdHdpbmRvdy5jaGFwdGVyX2xpc3QgPSB3aW5kb3cuY2hhcHRlcl9saXN0LnJldmVyc2UoKTtcblxuXHRcdFx0XHRsZXQgbGlzdCA9IFtdO1xuXG5cdFx0XHRcdGZvciAobGV0IHYgaW4gd2luZG93LmNoYXB0ZXJfbGlzdClcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGxldCB2b2x1bWVfbmFtZSA9ICQod2luZG93LnZvbHVtZV9saXN0W3ZdKS5maW5kKCcuY2hhcG5hbWVzdWInKS50ZXh0KCk7XG5cblx0XHRcdFx0XHR3aW5kb3cuY2hhcHRlcl9saXN0W3ZdID0gd2luZG93LmNoYXB0ZXJfbGlzdFt2XS5yZXZlcnNlKCk7XG5cblx0XHRcdFx0XHQvL2xldCBkYXRhID0gcGFyc2VVcmwoJChkb20ud2luZG93LmNoYXB0ZXJfbGlzdFt2XVswXSkuYXR0cignaHJlZicpKTtcblxuXHRcdFx0XHRcdGxpc3Rbdl0gPSB7XG5cdFx0XHRcdFx0XHRpbmRleDogdixcblxuXHRcdFx0XHRcdFx0bm92ZWxfaWQ6IG51bGwsXG5cblx0XHRcdFx0XHRcdHZvbHVtZV9uYW1lOiB2b2x1bWVfbmFtZSxcblx0XHRcdFx0XHRcdHZvbHVtZV9pZDogbnVsbCxcblxuXHRcdFx0XHRcdFx0Y2hhcHRlcjogW10sXG5cdFx0XHRcdFx0fTtcblxuXHRcdFx0XHRcdGZvciAobGV0IGNpIGluIHdpbmRvdy5jaGFwdGVyX2xpc3Rbdl0pXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0aWYgKCF3aW5kb3cuY2hhcHRlcl9saXN0W3ZdW2NpXSlcblx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0Y29udGludWU7XG5cdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdGxldCBfYSA9ICQod2luZG93LmNoYXB0ZXJfbGlzdFt2XVtjaV0pO1xuXG5cdFx0XHRcdFx0XHQvL2NvbnNvbGUubG9nKF9hKTtcblxuXHRcdFx0XHRcdFx0bGV0IF9kID0gc2VsZi5wYXJzZVVybChfYS5wcm9wKCdocmVmJykpO1xuXG5cdFx0XHRcdFx0XHRpZiAoIWxpc3Rbdl0udm9sdW1lX2lkKVxuXHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRsaXN0W3ZdLm5vdmVsX2lkID0gX2Qubm92ZWxfaWQ7XG5cdFx0XHRcdFx0XHRcdGxpc3Rbdl0udm9sdW1lX2lkID0gX2Qudm9sdW1lX2lkO1xuXHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHRsaXN0W3ZdLmNoYXB0ZXIucHVzaCh7XG5cdFx0XHRcdFx0XHRcdGluZGV4OiBjaSxcblx0XHRcdFx0XHRcdFx0aW5kZXhfdm9sdW1lOiB2LFxuXG5cdFx0XHRcdFx0XHRcdG5vdmVsX2lkOiBfZC5ub3ZlbF9pZCxcblxuXHRcdFx0XHRcdFx0XHR2b2x1bWVfaWQ6IF9kLnZvbHVtZV9pZCxcblx0XHRcdFx0XHRcdFx0dm9sdW1lX25hbWU6IHZvbHVtZV9uYW1lLFxuXG5cdFx0XHRcdFx0XHRcdGNoYXB0ZXJfbmFtZTogX2EudGV4dCgpLFxuXHRcdFx0XHRcdFx0XHRjaGFwdGVyX2lkOiBfZC5jaGFwdGVyX2lkLFxuXG5cdFx0XHRcdFx0XHRcdHVybDogX2EucHJvcCgnaHJlZicpLFxuXHRcdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cblx0XHRcdFx0X2RhdGEudmFsdWUgPSBsaXN0O1xuXG5cdFx0XHRcdHJldHVybiBfZGF0YTtcblx0XHRcdH0pXG5cdFx0XHQudGhlbihmdW5jdGlvbiAoX2RhdGEpXG5cdFx0XHR7XG5cdFx0XHRcdC8vIEB0cy1pZ25vcmVcblx0XHRcdFx0X2RhdGEuY2hlY2tkYXRlID0gbW9tZW50KCkudHoobW9tZW50LnR6Lmd1ZXNzKCkpO1xuXG5cdFx0XHRcdHJldHVybiBfZGF0YTtcblx0XHRcdH0pXG5cdFx0XHQ7XG5cdH1cblxuXHRhc3luYyBfZG93bmxvYWRDaGFwdGVyKGRhdGEsIG9wdGlvbnNSdW50aW1lOiBOb3ZlbFNpdGUuSU9wdGlvbnNSdW50aW1lKVxuXHR7XG5cdFx0Y29uc3Qgc2VsZiA9IHRoaXM7XG5cdFx0bGV0IHVybDogVVJMO1xuXG5cdFx0e1xuXHRcdFx0ZGF0YSA9IHNlbGYucGFyc2VVcmwoZGF0YSk7XG5cblx0XHRcdGlmICghZGF0YS5ub3ZlbF9pZClcblx0XHRcdHtcblx0XHRcdFx0dGhyb3cgbmV3IFJlZmVyZW5jZUVycm9yKCk7XG5cdFx0XHR9XG5cblx0XHRcdHVybCA9IHNlbGYubWFrZVVybChkYXRhKTtcblx0XHR9XG5cblx0XHRsZXQgX2RhdGEgPSB7fSBhcyBhbnk7XG5cblx0XHRsZXQgJDtcblxuXHRcdHJldHVybiBhd2FpdCBmcm9tVVJMKHVybCwgb3B0aW9uc1J1bnRpbWUub3B0aW9uc0pTRE9NKVxuXHRcdFx0LnRoZW4oYXN5bmMgKGRvbSkgPT5cblx0XHRcdHtcblx0XHRcdFx0bGV0IHdpbmRvdyA9IGRvbS53aW5kb3cgYXMge1xuXHRcdFx0XHRcdFtrZXk6IHN0cmluZ106IGFueTtcblx0XHRcdFx0fTtcblxuXHRcdFx0XHQkID0gZG9tLiQ7XG5cblx0XHRcdFx0bGV0IGNoYXB0ZXJfbmFtZSA9IHdpbmRvdy5nX2NoYXB0ZXJfbmFtZVxuXHRcdFx0XHRcdC5yZXBsYWNlKC9cXFxcL2lnLCAnJylcblx0XHRcdFx0XHQucmVwbGFjZSgvXltcXHNcXHVGRUZGXFx4QTDjgIBdK3xbXFxzXFx1RkVGRlxceEEw44CAXSskL2csICcnKVxuXHRcdFx0XHQ7XG5cdFx0XHRcdGxldCB2b2x1bWVfbmFtZSA9IHdpbmRvdy5kb2N1bWVudFxuXHRcdFx0XHRcdC5xdWVyeVNlbGVjdG9yKCcjcGFnZV9jb250ZW50cyAudGl0Jylcblx0XHRcdFx0XHQuaW5uZXJIVE1MXG5cdFx0XHRcdFx0LnJlcGxhY2UoL1xcXFwvaWcsICcnKVxuXHRcdFx0XHRcdC5yZXBsYWNlKGNoYXB0ZXJfbmFtZSwgJycpXG5cdFx0XHRcdFx0LnJlcGxhY2UoL15bXFxzXFx1RkVGRlxceEEw44CAXSt8W1xcc1xcdUZFRkZcXHhBMOOAgF0rJC9nLCAnJylcblx0XHRcdFx0O1xuXG5cdFx0XHRcdF9kYXRhID0ge1xuXG5cdFx0XHRcdFx0dXJsOiB1cmwsXG5cblx0XHRcdFx0XHRkYXRhOiB7XG5cdFx0XHRcdFx0XHRnX2xub3ZlbF9pZDogd2luZG93LmdfbG5vdmVsX2lkLFxuXHRcdFx0XHRcdFx0Z192b2x1bWVfaWQ6IHdpbmRvdy5nX3ZvbHVtZV9pZCxcblx0XHRcdFx0XHRcdGdfY2hhcHRlcl9pZDogd2luZG93LmdfY2hhcHRlcl9pZCxcblxuXHRcdFx0XHRcdFx0Z19sbm92ZWxfbmFtZTogd2luZG93LmdfbG5vdmVsX25hbWUsXG5cdFx0XHRcdFx0XHRnX3ZvbHVtZV9uYW1lOiB2b2x1bWVfbmFtZSxcblx0XHRcdFx0XHRcdGdfY2hhcHRlcl9uYW1lOiBjaGFwdGVyX25hbWUsXG5cblx0XHRcdFx0XHRcdGNoYXB0ZXJfbmFtZTogY2hhcHRlcl9uYW1lLFxuXHRcdFx0XHRcdFx0dm9sdW1lX25hbWU6IHZvbHVtZV9uYW1lLFxuXHRcdFx0XHRcdH0sXG5cblx0XHRcdFx0XHR2YWx1ZTogbnVsbCxcblxuXHRcdFx0XHR9O1xuXG5cdFx0XHRcdGxldCBwYSA9IFtdO1xuXG5cdFx0XHRcdHBhWzBdID0gd2luZG93LmRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjY2hhcHRlcl9jb250ZW50c19maXJzdFwiKS5pbm5lckhUTUw7XG5cblx0XHRcdFx0aWYgKHdpbmRvdy5nX2NoYXB0ZXJfcGFnZXNfY291bnQgPiAxKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0bGV0IHVhID0gKHdpbmRvdy5nX2NoYXB0ZXJfcGFnZXNfdXJsIGFzIEFycmF5PHN0cmluZz4pXG5cdFx0XHRcdFx0XHQuZmlsdGVyKGZ1bmN0aW9uICh2YWx1ZSlcblx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0cmV0dXJuIHZhbHVlO1xuXHRcdFx0XHRcdFx0fSlcblx0XHRcdFx0XHRcdC5tYXAoZnVuY3Rpb24gKHZhbHVlLCBpbmRleCwgYXJyYXkpXG5cdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdGlmICh2YWx1ZSlcblx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdHZhbHVlID0gJ2h0dHA6Ly9xLmRtemouY29tLycgKyB2YWx1ZTtcblx0XHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHRcdHJldHVybiB2YWx1ZTtcblx0XHRcdFx0XHRcdH0pXG5cdFx0XHRcdFx0O1xuXG5cdFx0XHRcdFx0YXdhaXQgbWFueVJlcXVlc3QodWEsIHtcblx0XHRcdFx0XHRcdGVuY29kaW5nOiBudWxsLFxuXHRcdFx0XHRcdFx0cmVzb2x2ZVdpdGhGdWxsUmVzcG9uc2U6IHRydWUsXG5cdFx0XHRcdFx0fSlcblx0XHRcdFx0XHRcdC50aGVuKGFzeW5jIGZ1bmN0aW9uIChyZXQpXG5cdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdHBhID0gcGEuY29uY2F0KHJldC5tYXAoZnVuY3Rpb24gKHZhbHVlLCBpbmRleCwgYXJyYXkpXG5cdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHQvL2NvbnNvbGUubG9nKHZhbHVlLmJvZHkpO1xuXG5cdFx0XHRcdFx0XHRcdFx0cmV0dXJuIHZhbHVlLmJvZHkudG9TdHJpbmcoKTtcblx0XHRcdFx0XHRcdFx0fSkpXG5cdFx0XHRcdFx0XHRcdDtcblx0XHRcdFx0XHRcdH0pXG5cdFx0XHRcdFx0O1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0cmV0dXJuIHBhO1xuXHRcdFx0fSlcblx0XHRcdC50aGVuKGFzeW5jIGZ1bmN0aW9uIChwYSlcblx0XHRcdHtcblx0XHRcdFx0X2RhdGEuaW1ncyA9IFtdO1xuXG5cdFx0XHRcdHBhID0gYXdhaXQgUHJvbWlzZUJsdWViaXJkLm1hcFNlcmllcyhwYSwgYXN5bmMgZnVuY3Rpb24gKHZhbHVlLCBpZHgpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRsZXQgX2MgPSB7fTtcblxuXHRcdFx0XHRcdC8vbGV0ICQgPSBjaGVlcmlvLmxvYWQodmFsdWUpO1xuXG5cdFx0XHRcdFx0bGV0IF9hID0gJCh2YWx1ZSk7XG5cblx0XHRcdFx0XHRsZXQgX2ltZyA9IF9hLmZpbmQoJ2ltZycpO1xuXG5cdFx0XHRcdFx0Ly9jb25zb2xlLmxvZyhfaW1nLmxlbmd0aCk7XG5cblx0XHRcdFx0XHRpZiAoX2ltZy5sZW5ndGgpXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0X2ltZy5lYWNoKGZ1bmN0aW9uIChpbmRleCwgZWxlbSlcblx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0bGV0IF90aGlzID0gJCh0aGlzKTtcblxuXHRcdFx0XHRcdFx0XHRpZiAoX3RoaXMucHJvcCgnc3JjJykpXG5cdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHRsZXQgaWQgPSBzaG9ydGlkKCk7XG5cblx0XHRcdFx0XHRcdFx0XHRfY1tpZF0gPSBfdGhpcy5wcm9wKCdzcmMnKTtcblx0XHRcdFx0XHRcdFx0XHRfZGF0YS5pbWdzLnB1c2goX2NbaWRdKTtcblxuXHRcdFx0XHRcdFx0XHRcdCQoYDxzcGFuPnt7QCR7aWR9QH19PC9zcGFuPmApLmluc2VydEFmdGVyKHRoaXMpO1xuXG5cdFx0XHRcdFx0XHRcdFx0JCh0aGlzKVxuXHRcdFx0XHRcdFx0XHRcdFx0LnJlbW92ZSgpXG5cdFx0XHRcdFx0XHRcdFx0O1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHR9KTtcblxuXHRcdFx0XHRcdFx0Ly9jb25zb2xlLmxvZygkLmh0bWwoKSk7XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0bGV0IF90ID0gX2EudGV4dCgpO1xuXG5cdFx0XHRcdFx0Zm9yIChsZXQgaWQgaW4gX2MpXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0Lypcblx0XHRcdFx0XHRcdGlmICghL14oPzpbYS16XVxcOnxcXDopP1xcL1xcLy9pLnRlc3QoX2NbaWRdKSlcblx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0X2NbaWRdID0gJ2h0dHA6Ly9xLmRtemouY29tLycgKyBfY1tpZF07XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHQqL1xuXG5cdFx0XHRcdFx0XHQvKlxuXHRcdFx0XHRcdFx0YXdhaXQgZG93bmxvYWRfaW1hZ2UoX2NbaWRdLCB7XG5cdFx0XHRcdFx0XHRcdGZyb21maWxlOiBmaWxlLFxuXHRcdFx0XHRcdFx0XHRwcmVmaXg6ICdpbWdfJyArIChfaWR4KyspLnRvU3RyaW5nKCkucGFkU3RhcnQoMywgJzAnKSArICdfJyxcblx0XHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdFx0Ki9cblxuXHRcdFx0XHRcdFx0X3QgPSBfdC5yZXBsYWNlKGB7e0Ake2lkfUB9fWAsIGBcXG5cXG48aW1nIHNyYz1cIiR7X2NbaWRdfVwiLz5cXG5cXG5gKTtcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRyZXR1cm4gX3Q7XG5cdFx0XHRcdH0pO1xuXG5cdFx0XHRcdHJldHVybiBwYS5qb2luKFwiXFxuXCIpO1xuXHRcdFx0fSlcblx0XHRcdC50aGVuKGZ1bmN0aW9uIChodG1sKVxuXHRcdFx0e1xuXHRcdFx0XHRyZXR1cm4gaHRtbFxuXHRcdFx0XHRcdC5yZXBsYWNlKC9eXFxzKig/OjxwPik/L2ksICcnKVxuXHRcdFx0XHRcdC5yZXBsYWNlKC9cXHMqPCg/OlxcLz9wfGJyXFwvPyk+XFxzKiQvaSwgJycpXG5cdFx0XHRcdFx0LnJlcGxhY2UoL1xcclxcbnxcXHIoPyFcXG4pL2csIFwiXFxuXCIpXG5cdFx0XHRcdFx0Ly8ucmVwbGFjZSgvPFxcL3A+PHA+XFxuL2lnLCBcIlxcblwiKVxuXHRcdFx0XHRcdC8vLnJlcGxhY2UoLzxwPjxcXC9wPi9pZywgXCJcXG5cIilcblx0XHRcdFx0XHQvLy5yZXBsYWNlKC8oPFxcL3A+fDxwPilcXG4vaWcsIFwiXFxuXCIpXG5cdFx0XHRcdFx0LnJlcGxhY2UoL1tcXHRcXHVGRUZGXFx4QTDjgIBdKyhcXG58JCkvaWcsIFwiJDFcIilcblx0XHRcdFx0XHQucmVwbGFjZSgvKFxcbilbXFx0XSsvaWcsIFwiJDFcIilcblx0XHRcdFx0XHQucmVwbGFjZSgvXFxzKyQvaWcsIFwiXCIpXG5cdFx0XHRcdFx0LnJlcGxhY2UoL1xcbnszLH0vaWcsIFwiXFxuXFxuXCIpXG5cdFx0XHRcdFx0O1xuXHRcdFx0fSlcblx0XHRcdC50aGVuKGZ1bmN0aW9uIChodG1sKVxuXHRcdFx0e1xuXHRcdFx0XHRfZGF0YS52YWx1ZSA9IGh0bWw7XG5cdFx0XHRcdF9kYXRhLmNoZWNrZGF0ZSA9IG1vbWVudCgpLnR6KG1vbWVudC50ei5ndWVzcygpKTtcblxuXHRcdFx0XHRyZXR1cm4gX2RhdGE7XG5cdFx0XHR9KVxuXHRcdFx0O1xuXHR9XG5cbn1cblxuZXhwb3J0IGRlZmF1bHQgTm92ZWxTaXRlRG16ajtcbiJdfQ==