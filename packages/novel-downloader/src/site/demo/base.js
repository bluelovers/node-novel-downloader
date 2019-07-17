"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
const fetch_1 = require("../../fetch");
const fs = require("fs-extra");
const path = require("path");
const jsdom_extra_1 = require("jsdom-extra");
const fs_1 = require("../fs");
const jsdom_1 = require("../../jsdom");
const helper_1 = require("node-novel-globby/lib/helper");
const index_1 = require("../index");
const index_2 = require("../index");
const parseContentType = require("content-type-parser");
const novel_text_1 = require("novel-text");
const mdconf2_1 = require("mdconf2");
const log_1 = require("../../util/log");
let NovelSiteDemo = class NovelSiteDemo extends index_1.default {
    constructor(options, ...argv) {
        super(options, ...argv);
    }
    /**
     * @todo 讓此方法有意義
     *
     * 用來說明目前站點的所需 session cookies
     *
     * @param {T} data
     * @returns {T}
     */
    checkSessionData(data, optionsRuntime = {}) {
        return data;
    }
    session(optionsRuntime, url, domain) {
        super.session(optionsRuntime, url);
        if (optionsRuntime.sessionData && Object.keys(optionsRuntime.sessionData).length) {
            Object.entries(optionsRuntime.sessionData)
                .forEach(function (data) {
                let c;
                let typec = typeof data[1];
                if (data[1] && typec == 'object') {
                    c = data[1];
                }
                else if (typec === null || typec != 'object') {
                    let [key, value] = data;
                    c = {
                        key,
                        value,
                    };
                }
                else {
                    c = data[1];
                }
                if (c) {
                    if (typeof c == 'object') {
                        if (!c.path) {
                            c.path = '/';
                        }
                        if (c.hostOnly == null) {
                            c.hostOnly = false;
                        }
                    }
                    optionsRuntime.optionsJSDOM.cookieJar
                        .setCookieSync(c, url.href);
                    if (typeof c == 'object' && !c.domain) {
                        if (domain) {
                            c.domain = domain;
                        }
                        else if (url && url.host) {
                            c.domain = url.host;
                        }
                        try {
                            optionsRuntime.optionsJSDOM.cookieJar
                                .setCookieSync(c, url.href);
                        }
                        catch (e) {
                        }
                    }
                }
            });
            log_1.console.dir(optionsRuntime.optionsJSDOM.cookieJar);
        }
        return this;
    }
    download(inputUrl, downloadOptions = {}) {
        const self = this;
        let url = inputUrl;
        const [PATH_NOVEL_MAIN, optionsRuntime] = this.getOutputDir(downloadOptions);
        return index_2.PromiseBluebird
            .bind(self)
            .then(async () => {
            url = await this.createMainUrl(url);
            self.session(optionsRuntime, url);
            let novel = await self.get_volume_list(url, optionsRuntime);
            let path_novel = self.getPathNovel(PATH_NOVEL_MAIN, novel, optionsRuntime);
            self._loadExistsConf(url, optionsRuntime, novel, path_novel);
            let idx = optionsRuntime.startIndex || 0;
            optionsRuntime[index_1.SYMBOL_CACHE].novel = novel;
            optionsRuntime[index_1.SYMBOL_CACHE].path_novel = path_novel;
            await index_2.PromiseBluebird
                .resolve(self.processNovel(novel, optionsRuntime, {
                url,
                path_novel,
            }))
                .tap(ls => {
                return self._outputAttach(novel, optionsRuntime, {
                    url,
                    path_novel,
                });
            })
                .tap(ls => {
                let file = path.join(path_novel, `${self.trimFilenameNovel(novel.novel_title)}.${novel.url_data.novel_id}.json`);
                return fs.outputJSON(file, novel, {
                    spaces: "\t",
                });
            });
            await self._saveReadme(optionsRuntime);
            return novel;
        });
    }
    async _outputAttach(novel, optionsRuntime, _cache_, ...argv) {
        const self = this;
        const { url, path_novel } = _cache_;
        if (novel.volume_list) {
            return index_2.PromiseBluebird
                .resolve(novel.volume_list)
                .each((volume, vid) => {
                let dirname;
                {
                    let _vid = '';
                    if (!optionsRuntime.noDirPrefix) {
                        _vid = vid.toString().padStart(4, '0') + '0';
                        _vid += '_';
                    }
                    dirname = path.join(path_novel, `${_vid}${self.trimFilenameVolume(volume.volume_title)}`);
                }
                let imgs = [];
                return index_2.PromiseBluebird
                    .resolve(volume.chapter_list)
                    .each(chapter => {
                    if (chapter.imgs) {
                        imgs.push(...chapter.imgs);
                    }
                })
                    .tap(() => {
                    imgs = imgs.filter(v => v);
                    if (imgs.length) {
                        let file = path.join(dirname, 'ATTACH.md');
                        let images = Object
                            .entries(imgs)
                            .reduce((a, [k, v]) => {
                            a[k.toString().padStart(3, '0')] = v;
                            return a;
                        }, {});
                        let md = mdconf2_1.stringify({
                            attach: {
                                images,
                            },
                        });
                        return fs.outputFile(file, md);
                    }
                });
            });
        }
        return index_2.PromiseBluebird.resolve();
    }
    async _processNovel(novel, optionsRuntime, _cache_, ...argv) {
        const self = this;
        let idx = optionsRuntime.startIndex || 0;
        let { url, path_novel } = _cache_;
        return index_2.PromiseBluebird
            .mapSeries(novel.volume_list, function (volume, vid) {
            let dirname;
            {
                let _vid = '';
                if (!optionsRuntime.noDirPrefix) {
                    _vid = vid.toString().padStart(4, '0') + '0';
                    _vid += '_';
                }
                dirname = path.join(path_novel, `${_vid}${self.trimFilenameVolume(volume.volume_title)}`);
            }
            if (!optionsRuntime.noFirePrefix && optionsRuntime.filePrefixMode >= 2) {
                let i;
                let bool = volume.chapter_list.every(function (chapter, j) {
                    let m = (optionsRuntime.filePrefixMode > 3 ?
                        chapter.chapter_title : helper_1.normalize_val(chapter.chapter_title))
                        .replace(/^\D+/, '')
                        //.replace(/^(\d+).+$/, '$1')
                        .replace(/^(\d+)\D.*$/, '$1');
                    //console.log(m, chapter.chapter_title);
                    if (/^\d+$/.test(m)) {
                        let m2 = parseInt(m);
                        if (j == 0) {
                            i = m2;
                            return true;
                        }
                        else if (m2 === ++i) {
                            return true;
                        }
                    }
                    return false;
                });
                //console.log(bool);
                if (bool) {
                    volume.chapter_list.forEach(function (chapter) {
                        chapter.chapter_index = '';
                    });
                }
            }
            if (optionsRuntime.event) {
                self.emit(optionsRuntime.event, 'volume', volume, {
                    optionsRuntime,
                    dirname,
                    vid,
                    novel,
                    url,
                });
            }
            return index_2.PromiseBluebird
                .mapSeries(volume.chapter_list, async function (chapter, cid) {
                //chapter.chapter_index = (idx++);
                const current_idx = idx++;
                let file = fs_1.getFilePath(self, {
                    chapter, cid,
                    ext: '.txt',
                    idx: current_idx,
                    dirname,
                    volume, vid,
                }, optionsRuntime);
                if (self._checkExists(optionsRuntime, file)) {
                    return file;
                }
                let url = self._createChapterUrl({
                    novel,
                    volume,
                    chapter,
                }, optionsRuntime);
                await self._fetchChapter(url, optionsRuntime)
                    .then(function (ret) {
                    return self._parseChapter(ret, optionsRuntime, {
                        file,
                        novel,
                        volume,
                        chapter,
                    });
                })
                    .then(function (text) {
                    if (typeof text == 'string') {
                        return novel_text_1.default.toStr(text);
                    }
                    return text;
                })
                    .then(async function (text) {
                    await fs.outputFile(file, text);
                    return text;
                });
                return file;
            });
        })
            .then(function (ret) {
            return ret;
        });
    }
    processNovel(novel, optionsRuntime, _cache_, ...argv) {
        // @ts-ignore
        let pr;
        pr = optionsRuntime.fetchMetaDataOnly ? [] : this._processNovel(novel, optionsRuntime, _cache_, ...argv);
        return index_2.PromiseBluebird
            .resolve(pr)
            .then(function (ret) {
            return {
                novel,
                optionsRuntime,
                _cache_,
                ret,
            };
        });
    }
    _stripContent(text) {
        return text;
    }
    _parseChapter(ret, optionsRuntime, cache) {
        if (!ret) {
            return '';
        }
        throw new SyntaxError(`Function not implemented`);
    }
    _fetchChapter(url, optionsRuntime) {
        return index_2.PromiseBluebird.resolve().then(async function () {
            log_1.consoleDebug.debug(`fetchChapter`, url.toString());
            let ret = {};
            let opts = jsdom_1.getOptions(optionsRuntime);
            if (optionsRuntime.disableDownload) {
                return null;
            }
            else if (true) {
                if (optionsRuntime.retryDelay > 0) {
                    // @ts-ignore
                    opts.requestOptions.delay = optionsRuntime.retryDelay;
                }
                else {
                    // @ts-ignore
                    opts.requestOptions.retry = 1;
                }
                await fetch_1.retryRequest(url, opts.requestOptions)
                    .then(function (res) {
                    const contentTypeParsed = parseContentType(res.headers["content-type"]);
                    ret.contentTypeParsed = contentTypeParsed;
                    // @ts-ignore
                    ret.url = url;
                    if (contentTypeParsed.isHTML() || contentTypeParsed.isXML()) {
                        ret.dom = jsdom_extra_1.requestToJSDOM(res, url, optionsRuntime.optionsJSDOM);
                        ret.dom = jsdom_extra_1.packJSDOM(ret.dom);
                    }
                    else if (contentTypeParsed.subtype == 'json') {
                        ret.json = JSON.parse(res.body.toString());
                    }
                    ret.res = res;
                    ret.body = res.body;
                });
            }
            else {
                // @ts-ignore
                ret.dom = await jsdom_extra_1.fromURL(url, optionsRuntime.optionsJSDOM);
                ret.res = ret.dom._options.Response;
                ret.body = ret.dom._options.body;
            }
            return ret;
        });
    }
    _exportDownloadOptions(optionsRuntime) {
        let opts = {};
        if (optionsRuntime) {
            let bool;
            for (let k of [
                'noFirePrefix',
                'noFilePadend',
                'filePrefixMode',
                'startIndex',
            ]) {
                if ((k in optionsRuntime) && typeof optionsRuntime[k] !== 'undefined') {
                    bool = true;
                    opts[k] = optionsRuntime[k];
                }
            }
        }
        return opts;
    }
    _saveReadme(optionsRuntime, options = {}, ...opts) {
        if (this.IDKEY) {
            options[this.IDKEY] = options[this.IDKEY] || {};
            try {
                options[this.IDKEY].novel_id = options[this.IDKEY].novel_id || optionsRuntime[index_1.SYMBOL_CACHE].novel.url_data.novel_id;
            }
            catch (e) {
            }
        }
        let downloadOptions = this._exportDownloadOptions(optionsRuntime);
        return super._saveReadme(optionsRuntime, options, {
            options: {
                textlayout: {
                    allow_lf2: true,
                },
                downloadOptions: downloadOptions || {},
            },
        }, ...opts);
    }
    _get_meta(inputUrl, optionsRuntime, cache) {
        throw new SyntaxError();
    }
};
NovelSiteDemo.IDKEY = null;
NovelSiteDemo = __decorate([
    index_1.staticImplements(),
    __metadata("design:paramtypes", [Object, Object])
], NovelSiteDemo);
exports.NovelSiteDemo = NovelSiteDemo;
exports.NovelSite = NovelSiteDemo;
exports.default = NovelSiteDemo;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFzZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImJhc2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFBQSx1Q0FBMkM7QUFDM0MsK0JBQWdDO0FBQ2hDLDZCQUE4QjtBQUU5Qiw2Q0FBMEY7QUFFMUYsOEJBQW9DO0FBRXBDLHVDQUF5QztBQUN6Qyx5REFBNkQ7QUFFN0Qsb0NBQTJGO0FBQzNGLG9DQUEyQztBQUUzQyx3REFBeUQ7QUFDekQsMkNBQW1DO0FBSW5DLHFDQUF3RDtBQVd4RCx3Q0FBdUQ7QUFpQnZELElBQWEsYUFBYSxHQUExQixNQUFhLGFBQWMsU0FBUSxlQUFVO0lBSTVDLFlBQVksT0FBeUIsRUFBRSxHQUFHLElBQUk7UUFFN0MsS0FBSyxDQUFDLE9BQU8sRUFBRSxHQUFHLElBQUksQ0FBQyxDQUFDO0lBQ3pCLENBQUM7SUFFRDs7Ozs7OztPQU9HO0lBQ0gsZ0JBQWdCLENBQW1CLElBQU8sRUFBRSxpQkFBa0MsRUFBRTtRQUUvRSxPQUFPLElBQUksQ0FBQztJQUNiLENBQUM7SUFFRCxPQUFPLENBQXNCLGNBQTZDLEVBQUUsR0FBUSxFQUFFLE1BQWU7UUFFcEcsS0FBSyxDQUFDLE9BQU8sQ0FBQyxjQUFjLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFFbkMsSUFBSSxjQUFjLENBQUMsV0FBVyxJQUFJLE1BQU0sQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLFdBQVcsQ0FBQyxDQUFDLE1BQU0sRUFDaEY7WUFDQyxNQUFNLENBQUMsT0FBTyxDQUFDLGNBQWMsQ0FBQyxXQUFXLENBQUM7aUJBQ3hDLE9BQU8sQ0FBQyxVQUFVLElBQUk7Z0JBRXRCLElBQUksQ0FBd0IsQ0FBQztnQkFDN0IsSUFBSSxLQUFLLEdBQUcsT0FBTyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBRTNCLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLEtBQUssSUFBSSxRQUFRLEVBQ2hDO29CQUNDLENBQUMsR0FBRyxJQUFJLENBQUMs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Q2xELGFBQWEsQ0F5aUJ6QjtBQXppQlksc0NBQWE7QUEyaUJiLFFBQUEsU0FBUyxHQUFHLGFBQXFDLENBQUM7QUFFL0Qsa0JBQWUsYUFBYSxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgcmV0cnlSZXF1ZXN0IH0gZnJvbSAnLi4vLi4vZmV0Y2gnO1xuaW1wb3J0IGZzID0gcmVxdWlyZSgnZnMtZXh0cmEnKTtcbmltcG9ydCBwYXRoID0gcmVxdWlyZSgncGF0aCcpO1xuaW1wb3J0IG5vdmVsSW5mbywgeyBJTWRjb25mTWV0YSB9IGZyb20gJ25vZGUtbm92ZWwtaW5mbyc7XG5pbXBvcnQgeyBmcm9tVVJMLCBJRnJvbVVybE9wdGlvbnMsIElKU0RPTSwgcmVxdWVzdFRvSlNET00sIHBhY2tKU0RPTSB9IGZyb20gJ2pzZG9tLWV4dHJhJztcbmltcG9ydCB7IFVSTCB9IGZyb20gJ2pzZG9tLXVybCc7XG5pbXBvcnQgeyBnZXRGaWxlUGF0aCB9IGZyb20gJy4uL2ZzJztcblxuaW1wb3J0IHsgZ2V0T3B0aW9ucyB9IGZyb20gJy4uLy4uL2pzZG9tJztcbmltcG9ydCB7IG5vcm1hbGl6ZV92YWwgfSBmcm9tICdub2RlLW5vdmVsLWdsb2JieS9saWIvaGVscGVyJztcblxuaW1wb3J0IF9Ob3ZlbFNpdGUsIHsgc3RhdGljSW1wbGVtZW50cywgZGVmYXVsdEpTRE9NT3B0aW9ucywgU1lNQk9MX0NBQ0hFIH0gZnJvbSAnLi4vaW5kZXgnO1xuaW1wb3J0IHsgUHJvbWlzZUJsdWViaXJkIH0gZnJvbSAnLi4vaW5kZXgnO1xuXG5pbXBvcnQgcGFyc2VDb250ZW50VHlwZSA9IHJlcXVpcmUoJ2NvbnRlbnQtdHlwZS1wYXJzZXInKTtcbmltcG9ydCBub3ZlbFRleHQgZnJvbSAnbm92ZWwtdGV4dCc7XG5cbmltcG9ydCB7IExhenlDb29raWUsIExhenlDb29raWVKYXIgfSBmcm9tICdqc2RvbS1leHRyYSc7XG5cbmltcG9ydCB7IHN0cmluZ2lmeSBhcyBtZGNvbmZfc3RyaW5naWZ5IH0gZnJvbSAnbWRjb25mMic7XG5cbmV4cG9ydCB0eXBlIElPcHRpb25zUGx1cyA9IHt9XG5cbmV4cG9ydCB0eXBlIElEb3dubG9hZE9wdGlvbnMgPSBfTm92ZWxTaXRlLklEb3dubG9hZE9wdGlvbnMgJiBfTm92ZWxTaXRlLklPcHRpb25zICYgSU9wdGlvbnNQbHVzXG5leHBvcnQgdHlwZSBJT3B0aW9uc1J1bnRpbWUgPSBfTm92ZWxTaXRlLklPcHRpb25zUnVudGltZSAmIElPcHRpb25zUGx1c1xuXG5leHBvcnQgaW1wb3J0IElOb3ZlbCA9IF9Ob3ZlbFNpdGUuSU5vdmVsO1xuXG5pbXBvcnQgeyBSZXNwb25zZVJlcXVlc3QgfSBmcm9tICdyZXF1ZXN0JztcblxuaW1wb3J0IHsgY29uc29sZSwgY29uc29sZURlYnVnIH0gZnJvbSAnLi4vLi4vdXRpbC9sb2cnO1xuXG5leHBvcnQgdHlwZSBJRmV0Y2hDaGFwdGVyID0ge1xuXHRib2R5PzogYW55O1xuXHRkb20/OiBJSlNET007XG5cdHJlcz86IFJlc3BvbnNlUmVxdWVzdDtcblx0anNvbj8sXG5cblx0dXJsPzogVVJMLFxuXHRjb250ZW50VHlwZVBhcnNlZD86IFJldHVyblR5cGU8cGFyc2VDb250ZW50VHlwZT4sXG59O1xuXG5leHBvcnQgdHlwZSBJU2Vzc2lvbkRhdGEgPSB7XG5cdFtrZXk6IHN0cmluZ106IGFueSxcbn1cblxuQHN0YXRpY0ltcGxlbWVudHM8X05vdmVsU2l0ZS5JTm92ZWxTaXRlU3RhdGljPE5vdmVsU2l0ZURlbW8+PigpXG5leHBvcnQgY2xhc3MgTm92ZWxTaXRlRGVtbyBleHRlbmRzIF9Ob3ZlbFNpdGVcbntcblx0cHVibGljIHN0YXRpYyByZWFkb25seSBJREtFWTogc3RyaW5nID0gbnVsbDtcblxuXHRjb25zdHJ1Y3RvcihvcHRpb25zOiBJRG93bmxvYWRPcHRpb25zLCAuLi5hcmd2KVxuXHR7XG5cdFx0c3VwZXIob3B0aW9ucywgLi4uYXJndik7XG5cdH1cblxuXHQvKipcblx0ICogQHRvZG8g6K6T5q2k5pa55rOV5pyJ5oSP576pXG5cdCAqXG5cdCAqIOeUqOS+huiqquaYjuebruWJjeermem7nueahOaJgOmcgCBzZXNzaW9uIGNvb2tpZXNcblx0ICpcblx0ICogQHBhcmFtIHtUfSBkYXRhXG5cdCAqIEByZXR1cm5zIHtUfVxuXHQgKi9cblx0Y2hlY2tTZXNzaW9uRGF0YTxUID0gSVNlc3Npb25EYXRhPihkYXRhOiBULCBvcHRpb25zUnVudGltZTogSU9wdGlvbnNSdW50aW1lID0ge30pXG5cdHtcblx0XHRyZXR1cm4gZGF0YTtcblx0fVxuXG5cdHNlc3Npb248VCA9IElPcHRpb25zUnVudGltZT4ob3B0aW9uc1J1bnRpbWU6IFBhcnRpYWw8VCAmIElEb3dubG9hZE9wdGlvbnM+LCB1cmw6IFVSTCwgZG9tYWluPzogc3RyaW5nKVxuXHR7XG5cdFx0c3VwZXIuc2Vzc2lvbihvcHRpb25zUnVudGltZSwgdXJsKTtcblxuXHRcdGlmIChvcHRpb25zUnVudGltZS5zZXNzaW9uRGF0YSAmJiBPYmplY3Qua2V5cyhvcHRpb25zUnVudGltZS5zZXNzaW9uRGF0YSkubGVuZ3RoKVxuXHRcdHtcblx0XHRcdE9iamVjdC5lbnRyaWVzKG9wdGlvbnNSdW50aW1lLnNlc3Npb25EYXRhKVxuXHRcdFx0XHQuZm9yRWFjaChmdW5jdGlvbiAoZGF0YSlcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGxldCBjOiBMYXp5Q29va2llLlByb3BlcnRpZXM7XG5cdFx0XHRcdFx0bGV0IHR5cGVjID0gdHlwZW9mIGRhdGFbMV07XG5cblx0XHRcdFx0XHRpZiAoZGF0YVsxXSAmJiB0eXBlYyA9PSAnb2JqZWN0Jylcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRjID0gZGF0YVsxXTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0ZWxzZSBpZiAodHlwZWMgPT09IG51bGwgfHwgdHlwZWMgIT0gJ29iamVjdCcpXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0bGV0IFtrZXksIHZhbHVlXSA9IGRhdGE7XG5cblx0XHRcdFx0XHRcdGMgPSB7XG5cdFx0XHRcdFx0XHRcdGtleSxcblx0XHRcdFx0XHRcdFx0dmFsdWUsXG5cdFx0XHRcdFx0XHR9O1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRlbHNlXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0YyA9IGRhdGFbMV07XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0aWYgKGMpXG5cdFx0XHRcdFx0e1xuXG5cdFx0XHRcdFx0XHRpZiAodHlwZW9mIGMgPT0gJ29iamVjdCcpXG5cdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdGlmICghYy5wYXRoKVxuXHRcdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdFx0Yy5wYXRoID0gJy8nO1xuXHRcdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdFx0aWYgKGMuaG9zdE9ubHkgPT0gbnVsbClcblx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdGMuaG9zdE9ubHkgPSBmYWxzZTtcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHRvcHRpb25zUnVudGltZS5vcHRpb25zSlNET00uY29va2llSmFyXG5cdFx0XHRcdFx0XHRcdC5zZXRDb29raWVTeW5jKGMsIHVybC5ocmVmKVxuXHRcdFx0XHRcdFx0O1xuXG5cdFx0XHRcdFx0XHRpZiAodHlwZW9mIGMgPT0gJ29iamVjdCcgJiYgIWMuZG9tYWluKVxuXHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRpZiAoZG9tYWluKVxuXHRcdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdFx0Yy5kb21haW4gPSBkb21haW47XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0ZWxzZSBpZiAodXJsICYmIHVybC5ob3N0KVxuXHRcdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdFx0Yy5kb21haW4gPSB1cmwuaG9zdDtcblx0XHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHRcdHRyeVxuXHRcdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdFx0b3B0aW9uc1J1bnRpbWUub3B0aW9uc0pTRE9NLmNvb2tpZUphclxuXHRcdFx0XHRcdFx0XHRcdFx0LnNldENvb2tpZVN5bmMoYywgdXJsLmhyZWYpXG5cdFx0XHRcdFx0XHRcdFx0O1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdGNhdGNoIChlKVxuXHRcdFx0XHRcdFx0XHR7XG5cblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSlcblx0XHRcdDtcblxuXHRcdFx0Y29uc29sZS5kaXIob3B0aW9uc1J1bnRpbWUub3B0aW9uc0pTRE9NLmNvb2tpZUphcik7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblxuXHRkb3dubG9hZChpbnB1dFVybDogc3RyaW5nIHwgVVJMLCBkb3dubG9hZE9wdGlvbnM6IElEb3dubG9hZE9wdGlvbnMgPSB7fSlcblx0e1xuXHRcdGNvbnN0IHNlbGYgPSB0aGlzO1xuXHRcdGxldCB1cmwgPSBpbnB1dFVybCBhcyBVUkw7XG5cblx0XHRjb25zdCBbUEFUSF9OT1ZFTF9NQUlOLCBvcHRpb25zUnVudGltZV0gPSB0aGlzLmdldE91dHB1dERpcjxJT3B0aW9uc1J1bnRpbWUgJiBJRG93bmxvYWRPcHRpb25zPihkb3dubG9hZE9wdGlvbnMpO1xuXG5cdFx0cmV0dXJuIFByb21pc2VCbHVlYmlyZFxuXHRcdFx0LmJpbmQoc2VsZilcblx0XHRcdC50aGVuKGFzeW5jICgpID0+XG5cdFx0XHR7XG5cdFx0XHRcdHVybCA9IGF3YWl0IHRoaXMuY3JlYXRlTWFpblVybCh1cmwpO1xuXG5cdFx0XHRcdHNlbGYuc2Vzc2lvbihvcHRpb25zUnVudGltZSwgdXJsKTtcblxuXHRcdFx0XHRsZXQgbm92ZWwgPSBhd2FpdCBzZWxmLmdldF92b2x1bWVfbGlzdDxJT3B0aW9uc1J1bnRpbWUgJiBJRG93bmxvYWRPcHRpb25zPih1cmwsIG9wdGlvbnNSdW50aW1lKTtcblxuXHRcdFx0XHRsZXQgcGF0aF9ub3ZlbCA9IHNlbGYuZ2V0UGF0aE5vdmVsKFBBVEhfTk9WRUxfTUFJTiwgbm92ZWwsIG9wdGlvbnNSdW50aW1lKTtcblxuXHRcdFx0XHRzZWxmLl9sb2FkRXhpc3RzQ29uZih1cmwsIG9wdGlvbnNSdW50aW1lLCBub3ZlbCwgcGF0aF9ub3ZlbCk7XG5cblx0XHRcdFx0bGV0IGlkeCA9IG9wdGlvbnNSdW50aW1lLnN0YXJ0SW5kZXggfHwgMDtcblxuXHRcdFx0XHRvcHRpb25zUnVudGltZVtTWU1CT0xfQ0FDSEVdLm5vdmVsID0gbm92ZWw7XG5cdFx0XHRcdG9wdGlvbnNSdW50aW1lW1NZTUJPTF9DQUNIRV0ucGF0aF9ub3ZlbCA9IHBhdGhfbm92ZWw7XG5cblx0XHRcdFx0YXdhaXQgUHJvbWlzZUJsdWViaXJkXG5cdFx0XHRcdFx0LnJlc29sdmUoc2VsZi5wcm9jZXNzTm92ZWwobm92ZWwsIG9wdGlvbnNSdW50aW1lLCB7XG5cdFx0XHRcdFx0XHR1cmwsXG5cdFx0XHRcdFx0XHRwYXRoX25vdmVsLFxuXHRcdFx0XHRcdH0pKVxuXHRcdFx0XHRcdC50YXAobHMgPT4ge1xuXHRcdFx0XHRcdFx0cmV0dXJuIHNlbGYuX291dHB1dEF0dGFjaChub3ZlbCwgb3B0aW9uc1J1bnRpbWUsIHtcblx0XHRcdFx0XHRcdFx0dXJsLFxuXHRcdFx0XHRcdFx0XHRwYXRoX25vdmVsLFxuXHRcdFx0XHRcdFx0fSlcblx0XHRcdFx0XHR9KVxuXHRcdFx0XHRcdC50YXAobHMgPT5cblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRsZXQgZmlsZSA9IHBhdGguam9pbihwYXRoX25vdmVsLFxuXHRcdFx0XHRcdFx0XHRgJHtzZWxmLnRyaW1GaWxlbmFtZU5vdmVsKG5vdmVsLm5vdmVsX3RpdGxlKX0uJHtub3ZlbC51cmxfZGF0YS5ub3ZlbF9pZH0uanNvbmBcblx0XHRcdFx0XHRcdFx0KVxuXHRcdFx0XHRcdFx0O1xuXG5cdFx0XHRcdFx0XHRyZXR1cm4gZnMub3V0cHV0SlNPTihmaWxlLCBub3ZlbCwge1xuXHRcdFx0XHRcdFx0XHRzcGFjZXM6IFwiXFx0XCIsXG5cdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHR9KVxuXHRcdFx0XHQ7XG5cblx0XHRcdFx0YXdhaXQgc2VsZi5fc2F2ZVJlYWRtZShvcHRpb25zUnVudGltZSk7XG5cblx0XHRcdFx0cmV0dXJuIG5vdmVsO1xuXHRcdFx0fSlcblx0XHRcdDtcblx0fVxuXG5cdHByb3RlY3RlZCBhc3luYyBfb3V0cHV0QXR0YWNoPFQgPSBhbnk+KG5vdmVsOiBJTm92ZWwsIG9wdGlvbnNSdW50aW1lOiBJT3B0aW9uc1J1bnRpbWUsIF9jYWNoZV86IHtcblx0XHR1cmw6IFVSTCxcblx0XHRwYXRoX25vdmVsOiBzdHJpbmcsXG5cdH0sIC4uLmFyZ3YpXG5cdHtcblx0XHRjb25zdCBzZWxmID0gdGhpcztcblx0XHRjb25zdCB7IHVybCwgcGF0aF9ub3ZlbCB9ID0gX2NhY2hlXztcblxuXHRcdGlmIChub3ZlbC52b2x1bWVfbGlzdClcblx0XHR7XG5cdFx0XHRyZXR1cm4gUHJvbWlzZUJsdWViaXJkXG5cdFx0XHRcdC5yZXNvbHZlKG5vdmVsLnZvbHVtZV9saXN0KVxuXHRcdFx0XHQuZWFjaCgodm9sdW1lLCB2aWQpID0+IHtcblxuXHRcdFx0XHRcdGxldCBkaXJuYW1lOiBzdHJpbmc7XG5cblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRsZXQgX3ZpZCA9ICcnO1xuXG5cdFx0XHRcdFx0XHRpZiAoIW9wdGlvbnNSdW50aW1lLm5vRGlyUHJlZml4KVxuXHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRfdmlkID0gdmlkLnRvU3RyaW5nKCkucGFkU3RhcnQoNCwgJzAnKSArICcwJztcblx0XHRcdFx0XHRcdFx0X3ZpZCArPSAnXyc7XG5cdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdGRpcm5hbWUgPSBwYXRoLmpvaW4ocGF0aF9ub3ZlbCxcblx0XHRcdFx0XHRcdFx0YCR7X3ZpZH0ke3NlbGYudHJpbUZpbGVuYW1lVm9sdW1lKHZvbHVtZS52b2x1bWVfdGl0bGUpfWBcblx0XHRcdFx0XHRcdCk7XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0bGV0IGltZ3M6IHN0cmluZ1tdID0gW107XG5cblx0XHRcdFx0XHRyZXR1cm4gUHJvbWlzZUJsdWViaXJkXG5cdFx0XHRcdFx0XHQucmVzb2x2ZSh2b2x1bWUuY2hhcHRlcl9saXN0KVxuXHRcdFx0XHRcdFx0LmVhY2goY2hhcHRlciA9PiB7XG5cdFx0XHRcdFx0XHRcdGlmIChjaGFwdGVyLmltZ3MpXG5cdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHRpbWdzLnB1c2goLi4uY2hhcHRlci5pbWdzKTtcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0fSlcblx0XHRcdFx0XHRcdC50YXAoKCkgPT4ge1xuXHRcdFx0XHRcdFx0XHRpbWdzID0gaW1ncy5maWx0ZXIodiA9PiB2KTtcblxuXHRcdFx0XHRcdFx0XHRpZiAoaW1ncy5sZW5ndGgpXG5cdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHRsZXQgZmlsZSA9IHBhdGguam9pbihkaXJuYW1lLCAnQVRUQUNILm1kJyk7XG5cblx0XHRcdFx0XHRcdFx0XHRsZXQgaW1hZ2VzID0gT2JqZWN0XG5cdFx0XHRcdFx0XHRcdFx0XHQuZW50cmllcyhpbWdzIGFzIHN0cmluZ1tdKVxuXHRcdFx0XHRcdFx0XHRcdFx0LnJlZHVjZSgoYSwgW2ssIHZdKSA9PiB7XG5cblx0XHRcdFx0XHRcdFx0XHRcdFx0YVtrLnRvU3RyaW5nKCkucGFkU3RhcnQoMywgJzAnKV0gPSB2O1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRyZXR1cm4gYVxuXHRcdFx0XHRcdFx0XHRcdFx0fSwge30gYXMgUmVjb3JkPHN0cmluZywgc3RyaW5nPik7XG5cblx0XHRcdFx0XHRcdFx0XHRsZXQgbWQgPSBtZGNvbmZfc3RyaW5naWZ5KHtcblx0XHRcdFx0XHRcdFx0XHRcdGF0dGFjaDoge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRpbWFnZXMsXG5cdFx0XHRcdFx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdFx0XHRcdH0pO1xuXG5cdFx0XHRcdFx0XHRcdFx0cmV0dXJuIGZzLm91dHB1dEZpbGUoZmlsZSwgbWQpO1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHR9KVxuXHRcdFx0XHR9KVxuXHRcdFx0XHQ7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIFByb21pc2VCbHVlYmlyZC5yZXNvbHZlKClcblx0fVxuXG5cdHByb3RlY3RlZCBhc3luYyBfcHJvY2Vzc05vdmVsPFQgPSBhbnk+KG5vdmVsOiBJTm92ZWwsIG9wdGlvbnNSdW50aW1lOiBJT3B0aW9uc1J1bnRpbWUsIF9jYWNoZV86IHtcblx0XHR1cmw6IFVSTCxcblx0XHRwYXRoX25vdmVsOiBzdHJpbmcsXG5cdH0sIC4uLmFyZ3YpXG5cdHtcblx0XHRjb25zdCBzZWxmID0gdGhpcztcblx0XHRsZXQgaWR4ID0gb3B0aW9uc1J1bnRpbWUuc3RhcnRJbmRleCB8fCAwO1xuXG5cdFx0bGV0IHsgdXJsLCBwYXRoX25vdmVsIH0gPSBfY2FjaGVfO1xuXG5cdFx0cmV0dXJuIFByb21pc2VCbHVlYmlyZFxuXHRcdFx0Lm1hcFNlcmllcyhub3ZlbC52b2x1bWVfbGlzdCwgZnVuY3Rpb24gKHZvbHVtZSwgdmlkKVxuXHRcdFx0e1xuXHRcdFx0XHRsZXQgZGlybmFtZTogc3RyaW5nO1xuXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRsZXQgX3ZpZCA9ICcnO1xuXG5cdFx0XHRcdFx0aWYgKCFvcHRpb25zUnVudGltZS5ub0RpclByZWZpeClcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRfdmlkID0gdmlkLnRvU3RyaW5nKCkucGFkU3RhcnQoNCwgJzAnKSArICcwJztcblx0XHRcdFx0XHRcdF92aWQgKz0gJ18nO1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdGRpcm5hbWUgPSBwYXRoLmpvaW4ocGF0aF9ub3ZlbCxcblx0XHRcdFx0XHRcdGAke192aWR9JHtzZWxmLnRyaW1GaWxlbmFtZVZvbHVtZSh2b2x1bWUudm9sdW1lX3RpdGxlKX1gXG5cdFx0XHRcdFx0KTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGlmICghb3B0aW9uc1J1bnRpbWUubm9GaXJlUHJlZml4ICYmIG9wdGlvbnNSdW50aW1lLmZpbGVQcmVmaXhNb2RlID49IDIpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRsZXQgaTogbnVtYmVyO1xuXG5cdFx0XHRcdFx0bGV0IGJvb2wgPSB2b2x1bWUuY2hhcHRlcl9saXN0LmV2ZXJ5KGZ1bmN0aW9uIChjaGFwdGVyLCBqKVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdGxldCBtID0gKG9wdGlvbnNSdW50aW1lLmZpbGVQcmVmaXhNb2RlID4gMyA/XG5cdFx0XHRcdFx0XHRcdGNoYXB0ZXIuY2hhcHRlcl90aXRsZSA6IG5vcm1hbGl6ZV92YWwoY2hhcHRlci5jaGFwdGVyX3RpdGxlKVxuXHRcdFx0XHRcdFx0XHQpXG5cdFx0XHRcdFx0XHRcdC5yZXBsYWNlKC9eXFxEKy8sICcnKVxuXHRcdFx0XHRcdFx0XHQvLy5yZXBsYWNlKC9eKFxcZCspLiskLywgJyQxJylcblx0XHRcdFx0XHRcdFx0LnJlcGxhY2UoL14oXFxkKylcXEQuKiQvLCAnJDEnKVxuXHRcdFx0XHRcdFx0O1xuXG5cdFx0XHRcdFx0XHQvL2NvbnNvbGUubG9nKG0sIGNoYXB0ZXIuY2hhcHRlcl90aXRsZSk7XG5cblx0XHRcdFx0XHRcdGlmICgvXlxcZCskLy50ZXN0KG0pKVxuXHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRsZXQgbTIgPSBwYXJzZUludChtKTtcblxuXHRcdFx0XHRcdFx0XHRpZiAoaiA9PSAwKVxuXHRcdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdFx0aSA9IG0yO1xuXG5cdFx0XHRcdFx0XHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0ZWxzZSBpZiAobTIgPT09ICsraSlcblx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdHJldHVybiB0cnVlO1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdFx0XHR9KTtcblxuXHRcdFx0XHRcdC8vY29uc29sZS5sb2coYm9vbCk7XG5cblx0XHRcdFx0XHRpZiAoYm9vbClcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHR2b2x1bWUuY2hhcHRlcl9saXN0LmZvckVhY2goZnVuY3Rpb24gKGNoYXB0ZXIpXG5cdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdGNoYXB0ZXIuY2hhcHRlcl9pbmRleCA9ICcnO1xuXHRcdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cblx0XHRcdFx0aWYgKG9wdGlvbnNSdW50aW1lLmV2ZW50KVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0c2VsZi5lbWl0KG9wdGlvbnNSdW50aW1lLmV2ZW50LCAndm9sdW1lJywgdm9sdW1lLCB7XG5cdFx0XHRcdFx0XHRvcHRpb25zUnVudGltZSxcblx0XHRcdFx0XHRcdGRpcm5hbWUsXG5cdFx0XHRcdFx0XHR2aWQsXG5cdFx0XHRcdFx0XHRub3ZlbCxcblx0XHRcdFx0XHRcdHVybCxcblx0XHRcdFx0XHR9KTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdHJldHVybiBQcm9taXNlQmx1ZWJpcmRcblx0XHRcdFx0XHQubWFwU2VyaWVzKHZvbHVtZS5jaGFwdGVyX2xpc3QsIGFzeW5jIGZ1bmN0aW9uIChjaGFwdGVyLCBjaWQpXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0Ly9jaGFwdGVyLmNoYXB0ZXJfaW5kZXggPSAoaWR4KyspO1xuXG5cdFx0XHRcdFx0XHRjb25zdCBjdXJyZW50X2lkeCA9IGlkeCsrO1xuXG5cdFx0XHRcdFx0XHRsZXQgZmlsZSA9IGdldEZpbGVQYXRoKHNlbGYsIHtcblx0XHRcdFx0XHRcdFx0Y2hhcHRlciwgY2lkLFxuXHRcdFx0XHRcdFx0XHRleHQ6ICcudHh0JyxcblxuXHRcdFx0XHRcdFx0XHRpZHg6IGN1cnJlbnRfaWR4LFxuXG5cdFx0XHRcdFx0XHRcdGRpcm5hbWUsXG5cdFx0XHRcdFx0XHRcdHZvbHVtZSwgdmlkLFxuXHRcdFx0XHRcdFx0fSwgb3B0aW9uc1J1bnRpbWUpO1xuXG5cdFx0XHRcdFx0XHRpZiAoc2VsZi5fY2hlY2tFeGlzdHMob3B0aW9uc1J1bnRpbWUsIGZpbGUpKVxuXHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRyZXR1cm4gZmlsZTtcblx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0bGV0IHVybCA9IHNlbGYuX2NyZWF0ZUNoYXB0ZXJVcmwoe1xuXHRcdFx0XHRcdFx0XHRub3ZlbCxcblx0XHRcdFx0XHRcdFx0dm9sdW1lLFxuXHRcdFx0XHRcdFx0XHRjaGFwdGVyLFxuXHRcdFx0XHRcdFx0fSwgb3B0aW9uc1J1bnRpbWUpO1xuXG5cdFx0XHRcdFx0XHRhd2FpdCBzZWxmLl9mZXRjaENoYXB0ZXIodXJsLCBvcHRpb25zUnVudGltZSlcblx0XHRcdFx0XHRcdFx0LnRoZW4oZnVuY3Rpb24gKHJldClcblx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdHJldHVybiBzZWxmLl9wYXJzZUNoYXB0ZXIocmV0LCBvcHRpb25zUnVudGltZSwge1xuXHRcdFx0XHRcdFx0XHRcdFx0ZmlsZSxcblx0XHRcdFx0XHRcdFx0XHRcdG5vdmVsLFxuXHRcdFx0XHRcdFx0XHRcdFx0dm9sdW1lLFxuXHRcdFx0XHRcdFx0XHRcdFx0Y2hhcHRlcixcblx0XHRcdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHRcdFx0fSlcblx0XHRcdFx0XHRcdFx0LnRoZW4oZnVuY3Rpb24gKHRleHQpXG5cdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHRpZiAodHlwZW9mIHRleHQgPT0gJ3N0cmluZycpXG5cdFx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdFx0cmV0dXJuIG5vdmVsVGV4dC50b1N0cih0ZXh0KTtcblx0XHRcdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdFx0XHRyZXR1cm4gdGV4dDtcblx0XHRcdFx0XHRcdFx0fSlcblx0XHRcdFx0XHRcdFx0LnRoZW4oYXN5bmMgZnVuY3Rpb24gKHRleHQ6IHN0cmluZylcblx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdGF3YWl0IGZzLm91dHB1dEZpbGUoZmlsZSwgdGV4dCk7XG5cblx0XHRcdFx0XHRcdFx0XHRyZXR1cm4gdGV4dDtcblx0XHRcdFx0XHRcdFx0fSlcblx0XHRcdFx0XHRcdDtcblxuXHRcdFx0XHRcdFx0cmV0dXJuIGZpbGU7XG5cdFx0XHRcdFx0fSlcblx0XHRcdFx0XHQ7XG5cdFx0XHR9KVxuXHRcdFx0LnRoZW4oZnVuY3Rpb24gKHJldClcblx0XHRcdHtcblx0XHRcdFx0cmV0dXJuIHJldCBhcyBhbnkgYXMgVDtcblx0XHRcdH0pXG5cdFx0O1xuXHR9XG5cblx0cHJvY2Vzc05vdmVsPFQ+KG5vdmVsOiBJTm92ZWwsIG9wdGlvbnNSdW50aW1lOiBJT3B0aW9uc1J1bnRpbWUsIF9jYWNoZV86IHtcblx0XHR1cmw6IFVSTCxcblx0XHRwYXRoX25vdmVsOiBzdHJpbmcsXG5cdH0sIC4uLmFyZ3YpXG5cdHtcblx0XHQvLyBAdHMtaWdub3JlXG5cdFx0bGV0IHByOiBhbnk7XG5cblx0XHRwciA9IG9wdGlvbnNSdW50aW1lLmZldGNoTWV0YURhdGFPbmx5ID8gW10gOiB0aGlzLl9wcm9jZXNzTm92ZWw8VD4obm92ZWwsIG9wdGlvbnNSdW50aW1lLCBfY2FjaGVfLCAuLi5hcmd2KTtcblxuXHRcdHJldHVybiBQcm9taXNlQmx1ZWJpcmRcblx0XHRcdC5yZXNvbHZlKHByKVxuXHRcdFx0LnRoZW4oZnVuY3Rpb24gKHJldDogVClcblx0XHRcdHtcblx0XHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0XHRub3ZlbCxcblx0XHRcdFx0XHRvcHRpb25zUnVudGltZSxcblx0XHRcdFx0XHRfY2FjaGVfLFxuXHRcdFx0XHRcdHJldCxcblx0XHRcdFx0fTtcblx0XHRcdH0pXG5cdFx0O1xuXHR9XG5cblx0cHJvdGVjdGVkIF9zdHJpcENvbnRlbnQodGV4dDogc3RyaW5nKVxuXHR7XG5cdFx0cmV0dXJuIHRleHQ7XG5cdH1cblxuXHRwcm90ZWN0ZWQgX3BhcnNlQ2hhcHRlcjxUPihyZXQ6IElGZXRjaENoYXB0ZXIsIG9wdGlvbnNSdW50aW1lOiBUICYgSU9wdGlvbnNSdW50aW1lLCBjYWNoZToge1xuXHRcdGZpbGU6IHN0cmluZyxcblx0XHRub3ZlbDogX05vdmVsU2l0ZS5JTm92ZWwsXG5cdFx0dm9sdW1lOiBfTm92ZWxTaXRlLklWb2x1bWUsXG5cdFx0Y2hhcHRlcjogX05vdmVsU2l0ZS5JQ2hhcHRlcixcblx0fSk6IHN0cmluZyB8IFByb21pc2U8c3RyaW5nPlxuXHR7XG5cdFx0aWYgKCFyZXQpXG5cdFx0e1xuXHRcdFx0cmV0dXJuICcnO1xuXHRcdH1cblxuXHRcdHRocm93IG5ldyBTeW50YXhFcnJvcihgRnVuY3Rpb24gbm90IGltcGxlbWVudGVkYCk7XG5cdH1cblxuXHRwcm90ZWN0ZWQgX2ZldGNoQ2hhcHRlcjxUPih1cmw6IFVSTCwgb3B0aW9uc1J1bnRpbWU6IFQgJiBJT3B0aW9uc1J1bnRpbWUpXG5cdHtcblx0XHRyZXR1cm4gUHJvbWlzZUJsdWViaXJkLnJlc29sdmUoKS50aGVuKGFzeW5jIGZ1bmN0aW9uICgpXG5cdFx0e1xuXHRcdFx0Y29uc29sZURlYnVnLmRlYnVnKGBmZXRjaENoYXB0ZXJgLCB1cmwudG9TdHJpbmcoKSk7XG5cblx0XHRcdGxldCByZXQgPSB7fSBhcyBJRmV0Y2hDaGFwdGVyO1xuXG5cdFx0XHRsZXQgb3B0cyA9IGdldE9wdGlvbnMob3B0aW9uc1J1bnRpbWUpO1xuXG5cdFx0XHRpZiAob3B0aW9uc1J1bnRpbWUuZGlzYWJsZURvd25sb2FkKVxuXHRcdFx0e1xuXHRcdFx0XHRyZXR1cm4gbnVsbDtcblx0XHRcdH1cblx0XHRcdGVsc2UgaWYgKHRydWUpXG5cdFx0XHR7XG5cdFx0XHRcdGlmIChvcHRpb25zUnVudGltZS5yZXRyeURlbGF5ID4gMClcblx0XHRcdFx0e1xuXHRcdFx0XHRcdC8vIEB0cy1pZ25vcmVcblx0XHRcdFx0XHRvcHRzLnJlcXVlc3RPcHRpb25zLmRlbGF5ID0gb3B0aW9uc1J1bnRpbWUucmV0cnlEZWxheTtcblx0XHRcdFx0fVxuXHRcdFx0XHRlbHNlXG5cdFx0XHRcdHtcblx0XHRcdFx0XHQvLyBAdHMtaWdub3JlXG5cdFx0XHRcdFx0b3B0cy5yZXF1ZXN0T3B0aW9ucy5yZXRyeSA9IDE7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRhd2FpdCByZXRyeVJlcXVlc3QodXJsLCBvcHRzLnJlcXVlc3RPcHRpb25zKVxuXHRcdFx0XHRcdC50aGVuKGZ1bmN0aW9uIChyZXMpXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0Y29uc3QgY29udGVudFR5cGVQYXJzZWQgPSBwYXJzZUNvbnRlbnRUeXBlKHJlcy5oZWFkZXJzW1wiY29udGVudC10eXBlXCJdKTtcblxuXHRcdFx0XHRcdFx0cmV0LmNvbnRlbnRUeXBlUGFyc2VkID0gY29udGVudFR5cGVQYXJzZWQ7XG5cblx0XHRcdFx0XHRcdC8vIEB0cy1pZ25vcmVcblx0XHRcdFx0XHRcdHJldC51cmwgPSB1cmw7XG5cblx0XHRcdFx0XHRcdGlmIChjb250ZW50VHlwZVBhcnNlZC5pc0hUTUwoKSB8fCBjb250ZW50VHlwZVBhcnNlZC5pc1hNTCgpKVxuXHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRyZXQuZG9tID0gcmVxdWVzdFRvSlNET00ocmVzLCB1cmwsIG9wdGlvbnNSdW50aW1lLm9wdGlvbnNKU0RPTSk7XG5cdFx0XHRcdFx0XHRcdHJldC5kb20gPSBwYWNrSlNET00ocmV0LmRvbSk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRlbHNlIGlmIChjb250ZW50VHlwZVBhcnNlZC5zdWJ0eXBlID09ICdqc29uJylcblx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0cmV0Lmpzb24gPSBKU09OLnBhcnNlKHJlcy5ib2R5LnRvU3RyaW5nKCkpO1xuXHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHRyZXQucmVzID0gcmVzO1xuXHRcdFx0XHRcdFx0cmV0LmJvZHkgPSByZXMuYm9keTtcblx0XHRcdFx0XHR9KVxuXHRcdFx0XHQ7XG5cdFx0XHR9XG5cdFx0XHRlbHNlXG5cdFx0XHR7XG5cdFx0XHRcdC8vIEB0cy1pZ25vcmVcblx0XHRcdFx0cmV0LmRvbSA9IGF3YWl0IGZyb21VUkwodXJsLCBvcHRpb25zUnVudGltZS5vcHRpb25zSlNET00pO1xuXG5cdFx0XHRcdHJldC5yZXMgPSByZXQuZG9tLl9vcHRpb25zLlJlc3BvbnNlO1xuXHRcdFx0XHRyZXQuYm9keSA9IHJldC5kb20uX29wdGlvbnMuYm9keTtcblx0XHRcdH1cblxuXHRcdFx0cmV0dXJuIHJldDtcblx0XHR9KTtcblx0fVxuXG5cdHByb3RlY3RlZCBfZXhwb3J0RG93bmxvYWRPcHRpb25zKG9wdGlvbnNSdW50aW1lPzogSU9wdGlvbnNSdW50aW1lKTogYW55XG5cdHtcblx0XHRsZXQgb3B0cyA9IHt9O1xuXG5cdFx0aWYgKG9wdGlvbnNSdW50aW1lKVxuXHRcdHtcblx0XHRcdGxldCBib29sOiBib29sZWFuO1xuXG5cdFx0XHRmb3IgKGxldCBrIG9mIFtcblx0XHRcdFx0J25vRmlyZVByZWZpeCcsXG5cdFx0XHRcdCdub0ZpbGVQYWRlbmQnLFxuXHRcdFx0XHQnZmlsZVByZWZpeE1vZGUnLFxuXHRcdFx0XHQnc3RhcnRJbmRleCcsXG5cdFx0XHRdKVxuXHRcdFx0e1xuXHRcdFx0XHRpZiAoKGsgaW4gb3B0aW9uc1J1bnRpbWUpICYmIHR5cGVvZiBvcHRpb25zUnVudGltZVtrXSAhPT0gJ3VuZGVmaW5lZCcpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRib29sID0gdHJ1ZTtcblx0XHRcdFx0XHRvcHRzW2tdID0gb3B0aW9uc1J1bnRpbWVba107XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cblx0XHRyZXR1cm4gb3B0cztcblx0fVxuXG5cdHByb3RlY3RlZCBfc2F2ZVJlYWRtZShvcHRpb25zUnVudGltZTogSU9wdGlvbnNSdW50aW1lLCBvcHRpb25zID0ge30sIC4uLm9wdHMpXG5cdHtcblx0XHRpZiAodGhpcy5JREtFWSlcblx0XHR7XG5cdFx0XHRvcHRpb25zW3RoaXMuSURLRVldID0gb3B0aW9uc1t0aGlzLklES0VZXSB8fCB7fTtcblxuXHRcdFx0dHJ5XG5cdFx0XHR7XG5cdFx0XHRcdG9wdGlvbnNbdGhpcy5JREtFWV0ubm92ZWxfaWQgPSBvcHRpb25zW3RoaXMuSURLRVldLm5vdmVsX2lkIHx8IG9wdGlvbnNSdW50aW1lW1NZTUJPTF9DQUNIRV0ubm92ZWwudXJsX2RhdGEubm92ZWxfaWQ7XG5cdFx0XHR9XG5cdFx0XHRjYXRjaCAoZSlcblx0XHRcdHtcblx0XHRcdH1cblx0XHR9XG5cblx0XHRsZXQgZG93bmxvYWRPcHRpb25zID0gdGhpcy5fZXhwb3J0RG93bmxvYWRPcHRpb25zKG9wdGlvbnNSdW50aW1lKTtcblxuXHRcdHJldHVybiBzdXBlci5fc2F2ZVJlYWRtZShvcHRpb25zUnVudGltZSwgb3B0aW9ucywge1xuXHRcdFx0b3B0aW9uczoge1xuXHRcdFx0XHR0ZXh0bGF5b3V0OiB7XG5cdFx0XHRcdFx0YWxsb3dfbGYyOiB0cnVlLFxuXHRcdFx0XHR9LFxuXHRcdFx0XHRkb3dubG9hZE9wdGlvbnM6IGRvd25sb2FkT3B0aW9ucyB8fCB7fSxcblx0XHRcdH0sXG5cdFx0fSwgLi4ub3B0cyk7XG5cdH1cblxuXHRwcm90ZWN0ZWQgX2dldF9tZXRhKGlucHV0VXJsLCBvcHRpb25zUnVudGltZSwgY2FjaGU/OiB7XG5cdFx0ZG9tPzogSUpTRE9NLFxuXHR9KVxuXHR7XG5cdFx0dGhyb3cgbmV3IFN5bnRheEVycm9yKCk7XG5cdH1cblxufVxuXG5leHBvcnQgY29uc3QgTm92ZWxTaXRlID0gTm92ZWxTaXRlRGVtbyBhcyB0eXBlb2YgTm92ZWxTaXRlRGVtbztcblxuZXhwb3J0IGRlZmF1bHQgTm92ZWxTaXRlRGVtbztcbiJdfQ==