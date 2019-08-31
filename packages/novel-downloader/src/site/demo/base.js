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
const g_1 = require("node-novel-globby/g");
const layout_reporter_1 = require("@node-novel/layout-reporter");
const md_1 = require("@node-novel/layout-reporter/lib/md");
const index_1 = require("../index");
const index_2 = require("../index");
const parseContentType = require("content-type-parser");
const novel_text_1 = require("novel-text");
const mdconf2_1 = require("mdconf2");
const log_1 = require("../../util/log");
const hash_1 = require("../../util/hash");
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
        log_1.consoleDebug.enabled = optionsRuntime.debugLog;
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
            let _cache = layout_reporter_1.dummyCache();
            await g_1.globbyASync([
                '**/*.txt',
            ], {
                cwd: path_novel,
            })
                .mapSeries(async (file) => {
                let _p = path.parse(file);
                const _cache_key_ = path.join(_p.dir, _p.name);
                await fs
                    .readFile(path.join(path_novel, file))
                    .then(buf => {
                    layout_reporter_1.analyzeJa002({
                        input: buf.toString(),
                        _cache_key_,
                        _cache,
                    });
                });
            })
                .tap(async () => {
                let md = md_1.outputJa002({
                    inputData: _cache.ja2,
                });
                return fs.outputFile(path.join(path_novel, 'ja2.md'), md);
            });
            return novel;
        });
    }
    async _outputAttach(novel, optionsRuntime, _cache_, ...argv) {
        const self = this;
        const { url, path_novel } = _cache_;
        if (novel.volume_list) {
            const { keepImage = false } = optionsRuntime;
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
                    .each(async (chapter) => {
                    if (chapter.imgs) {
                        imgs.push(...chapter.imgs);
                    }
                })
                    .tap(async () => {
                    imgs = imgs.filter(v => v);
                    if (imgs.length) {
                        let file = path.join(dirname, 'ATTACH.md');
                        let md_data = {
                            attach: {
                                images: {},
                            },
                        };
                        if (keepImage) {
                            await fs.readFile(file)
                                .then(v => mdconf2_1.parse(v))
                                .then((data) => {
                                data.attach = data.attach || {};
                                data.attach.images = data.attach.images || {};
                                md_data = data;
                                log_1.consoleDebug.debug(`Load data from exists ATTACH.md`);
                            })
                                .catch(null);
                        }
                        md_data.attach.images = Object
                            .entries(imgs)
                            .reduce((a, [k, v]) => {
                            if (keepImage) {
                                a[hash_1.hashSum(v)] = v;
                            }
                            else {
                                a[k.toString().padStart(3, '0')] = v;
                            }
                            return a;
                        }, md_data.attach.images);
                        let md = mdconf2_1.stringify(md_data);
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
            .mapSeries(novel.volume_list, (volume, vid) => {
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
                .mapSeries(volume.chapter_list, async (chapter, cid) => {
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
                    .then(async (text) => {
                    await this._saveFile({
                        file,
                        context: text,
                        optionsRuntime,
                    });
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFzZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImJhc2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFBQSx1Q0FBMkM7QUFDM0MsK0JBQWdDO0FBQ2hDLDZCQUE4QjtBQUU5Qiw2Q0FBMEY7QUFFMUYsOEJBQW9DO0FBRXBDLHVDQUF5QztBQUN6Qyx5REFBNkQ7QUFDN0QsMkNBQWtEO0FBQ2xELGlFQUEwSDtBQUMxSCwyREFBaUY7QUFHakYsb0NBQTJGO0FBQzNGLG9DQUEyQztBQUUzQyx3REFBeUQ7QUFDekQsMkNBQW1DO0FBSW5DLHFDQUErRTtBQVcvRSx3Q0FBdUQ7QUFDdkQsMENBQTBDO0FBaUIxQyxJQUFhLGFBQWEsR0FBMUIsTUFBYSxhQUFjLFNBQVEsZUFBVTtJQUk1QyxZQUFZLE9BQXlCLEVBQUUsR0FBRyxJQUFJO1FBRTdDLEtBQUssQ0FBQyxPQUFPLEVBQUUsR0FBRyxJQUFJLENBQUMsQ0FBQztJQUN6QixDQUFDO0lBRUQ7Ozs7Ozs7T0FPRztJQUNILGdCQUFnQixDQUFtQixJQUFPLEVBQUUsaUJBQWtDLEVBQUU7UUFFL0UsT0FBTyxJQUFJLENBQUM7SUFDYixDQUFDO0lBRUQsT0FBTyxDQUFzQixjQUE2QyxFQUFFLEdBQVEsRUFBRSxNQUFlO1FBRXBHLEtBQUssQ0FBQyxPQUFPLENBQUMsY0FBYyxFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBRW5DLElBQUksY0FBYyxDQUFDLFdBQVcsSUFBSSxNQUFNLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxXQUFXLENBQUMsQ0FBQyxNQUFNLEVBQ2hGO1lBQ0MsTUFBTSxDQUFDLE9BQU8sQ0FBQyxjQUFjLENBQUMsV0FBVyxDQUFDO2lCQUN4QyxPQUFPLENBQUMsVUFBVSxJQUFJO2dCQUV0QixJQUFJLENBQXdCLENBQUM7Z0JBQzdCLElBQUksS0FBSyxHQUFHLE9BQU8sSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUUzQixJQUFJLElBQUksQ0FBQyxDQUFDLENBQUMs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QUNDLE9BQU8sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLENBQUM7WUFFaEQsSUFDQTtnQkFDQyxPQUFPLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLFFBQVEsR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLFFBQVEsSUFBSSxjQUFjLENBQUMsb0JBQVksQ0FBQyxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDO2FBQ3BIO1lBQ0QsT0FBTyxDQUFDLEVBQ1I7YUFDQztTQUNEO1FBRUQsSUFBSSxlQUFlLEdBQUcsSUFBSSxDQUFDLHNCQUFzQixDQUFDLGNBQWMsQ0FBQyxDQUFDO1FBRWxFLE9BQU8sS0FBSyxDQUFDLFdBQVcsQ0FBQyxjQUFjLEVBQUUsT0FBTyxFQUFFO1lBQ2pELE9BQU8sRUFBRTtnQkFDUixVQUFVLEVBQUU7b0JBQ1gsU0FBUyxFQUFFLElBQUk7aUJBQ2Y7Z0JBQ0QsZUFBZSxFQUFFLGVBQWUsSUFBSSxFQUFFO2FBQ3RDO1NBQ0QsRUFBRSxHQUFHLElBQUksQ0FBQyxDQUFDO0lBQ2IsQ0FBQztJQUVTLFNBQVMsQ0FBQyxRQUFRLEVBQUUsY0FBYyxFQUFFLEtBRTdDO1FBRUEsTUFBTSxJQUFJLFdBQVcsRUFBRSxDQUFDO0lBQ3pCLENBQUM7Q0FFRCxDQUFBO0FBL21CdUIsbUJBQUssR0FBVyxJQUFJLENBQUM7QUFGaEMsYUFBYTtJQUR6Qix3QkFBZ0IsRUFBOEM7O0dBQ2xELGFBQWEsQ0FpbkJ6QjtBQWpuQlksc0NBQWE7QUFtbkJiLFFBQUEsU0FBUyxHQUFHLGFBQXFDLENBQUM7QUFFL0Qsa0JBQWUsYUFBYSxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgcmV0cnlSZXF1ZXN0IH0gZnJvbSAnLi4vLi4vZmV0Y2gnO1xuaW1wb3J0IGZzID0gcmVxdWlyZSgnZnMtZXh0cmEnKTtcbmltcG9ydCBwYXRoID0gcmVxdWlyZSgncGF0aCcpO1xuaW1wb3J0IG5vdmVsSW5mbywgeyBJTWRjb25mTWV0YSB9IGZyb20gJ25vZGUtbm92ZWwtaW5mbyc7XG5pbXBvcnQgeyBmcm9tVVJMLCBJRnJvbVVybE9wdGlvbnMsIElKU0RPTSwgcmVxdWVzdFRvSlNET00sIHBhY2tKU0RPTSB9IGZyb20gJ2pzZG9tLWV4dHJhJztcbmltcG9ydCB7IFVSTCB9IGZyb20gJ2pzZG9tLXVybCc7XG5pbXBvcnQgeyBnZXRGaWxlUGF0aCB9IGZyb20gJy4uL2ZzJztcblxuaW1wb3J0IHsgZ2V0T3B0aW9ucyB9IGZyb20gJy4uLy4uL2pzZG9tJztcbmltcG9ydCB7IG5vcm1hbGl6ZV92YWwgfSBmcm9tICdub2RlLW5vdmVsLWdsb2JieS9saWIvaGVscGVyJztcbmltcG9ydCB7IGdsb2JieUFTeW5jIH0gZnJvbSAnbm9kZS1ub3ZlbC1nbG9iYnkvZyc7XG5pbXBvcnQgeyBsYXp5QW5hbHl6ZVJlcG9ydEFsbCwgbGF6eUFuYWx5emVBbGwsIGR1bW15Q2FjaGUsIGFuYWx5emVKYTAwMiwgaGFuZGxlSmEwMDIgfSBmcm9tICdAbm9kZS1ub3ZlbC9sYXlvdXQtcmVwb3J0ZXInO1xuaW1wb3J0IHsgb3V0cHV0QmxvY2swMDIsIG91dHB1dEphMDAyIH0gZnJvbSAnQG5vZGUtbm92ZWwvbGF5b3V0LXJlcG9ydGVyL2xpYi9tZCc7XG5cblxuaW1wb3J0IF9Ob3ZlbFNpdGUsIHsgc3RhdGljSW1wbGVtZW50cywgZGVmYXVsdEpTRE9NT3B0aW9ucywgU1lNQk9MX0NBQ0hFIH0gZnJvbSAnLi4vaW5kZXgnO1xuaW1wb3J0IHsgUHJvbWlzZUJsdWViaXJkIH0gZnJvbSAnLi4vaW5kZXgnO1xuXG5pbXBvcnQgcGFyc2VDb250ZW50VHlwZSA9IHJlcXVpcmUoJ2NvbnRlbnQtdHlwZS1wYXJzZXInKTtcbmltcG9ydCBub3ZlbFRleHQgZnJvbSAnbm92ZWwtdGV4dCc7XG5cbmltcG9ydCB7IExhenlDb29raWUsIExhenlDb29raWVKYXIgfSBmcm9tICdqc2RvbS1leHRyYSc7XG5cbmltcG9ydCB7IHN0cmluZ2lmeSBhcyBtZGNvbmZfc3RyaW5naWZ5LCBwYXJzZSBhcyBtZGNvbmZfcGFyc2UgfSBmcm9tICdtZGNvbmYyJztcblxuZXhwb3J0IHR5cGUgSU9wdGlvbnNQbHVzID0ge31cblxuZXhwb3J0IHR5cGUgSURvd25sb2FkT3B0aW9ucyA9IF9Ob3ZlbFNpdGUuSURvd25sb2FkT3B0aW9ucyAmIF9Ob3ZlbFNpdGUuSU9wdGlvbnMgJiBJT3B0aW9uc1BsdXNcbmV4cG9ydCB0eXBlIElPcHRpb25zUnVudGltZSA9IF9Ob3ZlbFNpdGUuSU9wdGlvbnNSdW50aW1lICYgSU9wdGlvbnNQbHVzXG5cbmV4cG9ydCBpbXBvcnQgSU5vdmVsID0gX05vdmVsU2l0ZS5JTm92ZWw7XG5cbmltcG9ydCB7IFJlc3BvbnNlUmVxdWVzdCB9IGZyb20gJ3JlcXVlc3QnO1xuXG5pbXBvcnQgeyBjb25zb2xlLCBjb25zb2xlRGVidWcgfSBmcm9tICcuLi8uLi91dGlsL2xvZyc7XG5pbXBvcnQgeyBoYXNoU3VtIH0gZnJvbSAnLi4vLi4vdXRpbC9oYXNoJztcblxuZXhwb3J0IHR5cGUgSUZldGNoQ2hhcHRlciA9IHtcblx0Ym9keT86IGFueTtcblx0ZG9tPzogSUpTRE9NO1xuXHRyZXM/OiBSZXNwb25zZVJlcXVlc3Q7XG5cdGpzb24/LFxuXG5cdHVybD86IFVSTCxcblx0Y29udGVudFR5cGVQYXJzZWQ/OiBSZXR1cm5UeXBlPHBhcnNlQ29udGVudFR5cGU+LFxufTtcblxuZXhwb3J0IHR5cGUgSVNlc3Npb25EYXRhID0ge1xuXHRba2V5OiBzdHJpbmddOiBhbnksXG59XG5cbkBzdGF0aWNJbXBsZW1lbnRzPF9Ob3ZlbFNpdGUuSU5vdmVsU2l0ZVN0YXRpYzxOb3ZlbFNpdGVEZW1vPj4oKVxuZXhwb3J0IGNsYXNzIE5vdmVsU2l0ZURlbW8gZXh0ZW5kcyBfTm92ZWxTaXRlXG57XG5cdHB1YmxpYyBzdGF0aWMgcmVhZG9ubHkgSURLRVk6IHN0cmluZyA9IG51bGw7XG5cblx0Y29uc3RydWN0b3Iob3B0aW9uczogSURvd25sb2FkT3B0aW9ucywgLi4uYXJndilcblx0e1xuXHRcdHN1cGVyKG9wdGlvbnMsIC4uLmFyZ3YpO1xuXHR9XG5cblx0LyoqXG5cdCAqIEB0b2RvIOiuk+atpOaWueazleacieaEj+e+qVxuXHQgKlxuXHQgKiDnlKjkvoboqqrmmI7nm67liY3nq5npu57nmoTmiYDpnIAgc2Vzc2lvbiBjb29raWVzXG5cdCAqXG5cdCAqIEBwYXJhbSB7VH0gZGF0YVxuXHQgKiBAcmV0dXJucyB7VH1cblx0ICovXG5cdGNoZWNrU2Vzc2lvbkRhdGE8VCA9IElTZXNzaW9uRGF0YT4oZGF0YTogVCwgb3B0aW9uc1J1bnRpbWU6IElPcHRpb25zUnVudGltZSA9IHt9KVxuXHR7XG5cdFx0cmV0dXJuIGRhdGE7XG5cdH1cblxuXHRzZXNzaW9uPFQgPSBJT3B0aW9uc1J1bnRpbWU+KG9wdGlvbnNSdW50aW1lOiBQYXJ0aWFsPFQgJiBJRG93bmxvYWRPcHRpb25zPiwgdXJsOiBVUkwsIGRvbWFpbj86IHN0cmluZylcblx0e1xuXHRcdHN1cGVyLnNlc3Npb24ob3B0aW9uc1J1bnRpbWUsIHVybCk7XG5cblx0XHRpZiAob3B0aW9uc1J1bnRpbWUuc2Vzc2lvbkRhdGEgJiYgT2JqZWN0LmtleXMob3B0aW9uc1J1bnRpbWUuc2Vzc2lvbkRhdGEpLmxlbmd0aClcblx0XHR7XG5cdFx0XHRPYmplY3QuZW50cmllcyhvcHRpb25zUnVudGltZS5zZXNzaW9uRGF0YSlcblx0XHRcdFx0LmZvckVhY2goZnVuY3Rpb24gKGRhdGEpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRsZXQgYzogTGF6eUNvb2tpZS5Qcm9wZXJ0aWVzO1xuXHRcdFx0XHRcdGxldCB0eXBlYyA9IHR5cGVvZiBkYXRhWzFdO1xuXG5cdFx0XHRcdFx0aWYgKGRhdGFbMV0gJiYgdHlwZWMgPT0gJ29iamVjdCcpXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0YyA9IGRhdGFbMV07XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGVsc2UgaWYgKHR5cGVjID09PSBudWxsIHx8IHR5cGVjICE9ICdvYmplY3QnKVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdGxldCBba2V5LCB2YWx1ZV0gPSBkYXRhO1xuXG5cdFx0XHRcdFx0XHRjID0ge1xuXHRcdFx0XHRcdFx0XHRrZXksXG5cdFx0XHRcdFx0XHRcdHZhbHVlLFxuXHRcdFx0XHRcdFx0fTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0ZWxzZVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdGMgPSBkYXRhWzFdO1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdGlmIChjKVxuXHRcdFx0XHRcdHtcblxuXHRcdFx0XHRcdFx0aWYgKHR5cGVvZiBjID09ICdvYmplY3QnKVxuXHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRpZiAoIWMucGF0aClcblx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdGMucGF0aCA9ICcvJztcblx0XHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHRcdGlmIChjLmhvc3RPbmx5ID09IG51bGwpXG5cdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHRjLmhvc3RPbmx5ID0gZmFsc2U7XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0b3B0aW9uc1J1bnRpbWUub3B0aW9uc0pTRE9NLmNvb2tpZUphclxuXHRcdFx0XHRcdFx0XHQuc2V0Q29va2llU3luYyhjLCB1cmwuaHJlZilcblx0XHRcdFx0XHRcdDtcblxuXHRcdFx0XHRcdFx0aWYgKHR5cGVvZiBjID09ICdvYmplY3QnICYmICFjLmRvbWFpbilcblx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0aWYgKGRvbWFpbilcblx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdGMuZG9tYWluID0gZG9tYWluO1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdGVsc2UgaWYgKHVybCAmJiB1cmwuaG9zdClcblx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdGMuZG9tYWluID0gdXJsLmhvc3Q7XG5cdFx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0XHR0cnlcblx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdG9wdGlvbnNSdW50aW1lLm9wdGlvbnNKU0RPTS5jb29raWVKYXJcblx0XHRcdFx0XHRcdFx0XHRcdC5zZXRDb29raWVTeW5jKGMsIHVybC5ocmVmKVxuXHRcdFx0XHRcdFx0XHRcdDtcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRjYXRjaCAoZSlcblx0XHRcdFx0XHRcdFx0e1xuXG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0pXG5cdFx0XHQ7XG5cblx0XHRcdGNvbnNvbGUuZGlyKG9wdGlvbnNSdW50aW1lLm9wdGlvbnNKU0RPTS5jb29raWVKYXIpO1xuXHRcdH1cblxuXHRcdHJldHVybiB0aGlzO1xuXHR9XG5cblx0ZG93bmxvYWQoaW5wdXRVcmw6IHN0cmluZyB8IFVSTCwgZG93bmxvYWRPcHRpb25zOiBJRG93bmxvYWRPcHRpb25zID0ge30pXG5cdHtcblx0XHRjb25zdCBzZWxmID0gdGhpcztcblx0XHRsZXQgdXJsID0gaW5wdXRVcmwgYXMgVVJMO1xuXG5cdFx0Y29uc3QgW1BBVEhfTk9WRUxfTUFJTiwgb3B0aW9uc1J1bnRpbWVdID0gdGhpcy5nZXRPdXRwdXREaXI8SU9wdGlvbnNSdW50aW1lICYgSURvd25sb2FkT3B0aW9ucz4oZG93bmxvYWRPcHRpb25zKTtcblxuXHRcdGNvbnNvbGVEZWJ1Zy5lbmFibGVkID0gb3B0aW9uc1J1bnRpbWUuZGVidWdMb2c7XG5cblx0XHRyZXR1cm4gUHJvbWlzZUJsdWViaXJkXG5cdFx0XHQuYmluZChzZWxmKVxuXHRcdFx0LnRoZW4oYXN5bmMgKCkgPT5cblx0XHRcdHtcblx0XHRcdFx0dXJsID0gYXdhaXQgdGhpcy5jcmVhdGVNYWluVXJsKHVybCk7XG5cblx0XHRcdFx0c2VsZi5zZXNzaW9uKG9wdGlvbnNSdW50aW1lLCB1cmwpO1xuXG5cdFx0XHRcdGxldCBub3ZlbCA9IGF3YWl0IHNlbGYuZ2V0X3ZvbHVtZV9saXN0PElPcHRpb25zUnVudGltZSAmIElEb3dubG9hZE9wdGlvbnM+KHVybCwgb3B0aW9uc1J1bnRpbWUpO1xuXG5cdFx0XHRcdGxldCBwYXRoX25vdmVsID0gc2VsZi5nZXRQYXRoTm92ZWwoUEFUSF9OT1ZFTF9NQUlOLCBub3ZlbCwgb3B0aW9uc1J1bnRpbWUpO1xuXG5cdFx0XHRcdHNlbGYuX2xvYWRFeGlzdHNDb25mKHVybCwgb3B0aW9uc1J1bnRpbWUsIG5vdmVsLCBwYXRoX25vdmVsKTtcblxuXHRcdFx0XHRsZXQgaWR4ID0gb3B0aW9uc1J1bnRpbWUuc3RhcnRJbmRleCB8fCAwO1xuXG5cdFx0XHRcdG9wdGlvbnNSdW50aW1lW1NZTUJPTF9DQUNIRV0ubm92ZWwgPSBub3ZlbDtcblx0XHRcdFx0b3B0aW9uc1J1bnRpbWVbU1lNQk9MX0NBQ0hFXS5wYXRoX25vdmVsID0gcGF0aF9ub3ZlbDtcblxuXHRcdFx0XHRhd2FpdCBQcm9taXNlQmx1ZWJpcmRcblx0XHRcdFx0XHQucmVzb2x2ZShzZWxmLnByb2Nlc3NOb3ZlbChub3ZlbCwgb3B0aW9uc1J1bnRpbWUsIHtcblx0XHRcdFx0XHRcdHVybCxcblx0XHRcdFx0XHRcdHBhdGhfbm92ZWwsXG5cdFx0XHRcdFx0fSkpXG5cdFx0XHRcdFx0LnRhcChscyA9PlxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdHJldHVybiBzZWxmLl9vdXRwdXRBdHRhY2gobm92ZWwsIG9wdGlvbnNSdW50aW1lLCB7XG5cdFx0XHRcdFx0XHRcdHVybCxcblx0XHRcdFx0XHRcdFx0cGF0aF9ub3ZlbCxcblx0XHRcdFx0XHRcdH0pXG5cdFx0XHRcdFx0fSlcblx0XHRcdFx0XHQudGFwKGxzID0+XG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0bGV0IGZpbGUgPSBwYXRoLmpvaW4ocGF0aF9ub3ZlbCxcblx0XHRcdFx0XHRcdFx0YCR7c2VsZi50cmltRmlsZW5hbWVOb3ZlbChub3ZlbC5ub3ZlbF90aXRsZSl9LiR7bm92ZWwudXJsX2RhdGEubm92ZWxfaWR9Lmpzb25gLFxuXHRcdFx0XHRcdFx0XHQpXG5cdFx0XHRcdFx0XHQ7XG5cblx0XHRcdFx0XHRcdHJldHVybiBmcy5vdXRwdXRKU09OKGZpbGUsIG5vdmVsLCB7XG5cdFx0XHRcdFx0XHRcdHNwYWNlczogXCJcXHRcIixcblx0XHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdH0pXG5cdFx0XHRcdDtcblxuXHRcdFx0XHRhd2FpdCBzZWxmLl9zYXZlUmVhZG1lKG9wdGlvbnNSdW50aW1lKTtcblxuXHRcdFx0XHRsZXQgX2NhY2hlID0gZHVtbXlDYWNoZSgpO1xuXG5cdFx0XHRcdGF3YWl0IGdsb2JieUFTeW5jKFtcblx0XHRcdFx0XHQnKiovKi50eHQnLFxuXHRcdFx0XHRdLCB7XG5cdFx0XHRcdFx0Y3dkOiBwYXRoX25vdmVsLFxuXHRcdFx0XHR9KVxuXHRcdFx0XHRcdC5tYXBTZXJpZXMoYXN5bmMgKGZpbGUpID0+XG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0bGV0IF9wID0gcGF0aC5wYXJzZShmaWxlKTtcblx0XHRcdFx0XHRcdGNvbnN0IF9jYWNoZV9rZXlfID0gcGF0aC5qb2luKF9wLmRpciwgX3AubmFtZSk7XG5cblx0XHRcdFx0XHRcdGF3YWl0IGZzXG5cdFx0XHRcdFx0XHRcdC5yZWFkRmlsZShwYXRoLmpvaW4ocGF0aF9ub3ZlbCwgZmlsZSkpXG5cdFx0XHRcdFx0XHRcdC50aGVuKGJ1ZiA9PlxuXHRcdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdFx0YW5hbHl6ZUphMDAyKHtcblx0XHRcdFx0XHRcdFx0XHRcdGlucHV0OiBidWYudG9TdHJpbmcoKSxcblx0XHRcdFx0XHRcdFx0XHRcdF9jYWNoZV9rZXlfLFxuXHRcdFx0XHRcdFx0XHRcdFx0X2NhY2hlLFxuXHRcdFx0XHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdFx0XHR9KVxuXHRcdFx0XHRcdFx0O1xuXHRcdFx0XHRcdH0pXG5cdFx0XHRcdFx0LnRhcChhc3luYyAoKSA9PiB7XG5cblx0XHRcdFx0XHRcdGxldCBtZCA9IG91dHB1dEphMDAyKHtcblx0XHRcdFx0XHRcdFx0aW5wdXREYXRhOiBfY2FjaGUuamEyLFxuXHRcdFx0XHRcdFx0fSk7XG5cblx0XHRcdFx0XHRcdHJldHVybiBmcy5vdXRwdXRGaWxlKHBhdGguam9pbihwYXRoX25vdmVsLCAnamEyLm1kJyksIG1kKVxuXHRcdFx0XHRcdH0pXG5cdFx0XHRcdDtcblxuXHRcdFx0XHRyZXR1cm4gbm92ZWw7XG5cdFx0XHR9KVxuXHRcdFx0O1xuXHR9XG5cblx0cHJvdGVjdGVkIGFzeW5jIF9vdXRwdXRBdHRhY2g8VCA9IGFueT4obm92ZWw6IElOb3ZlbCwgb3B0aW9uc1J1bnRpbWU6IElPcHRpb25zUnVudGltZSwgX2NhY2hlXzoge1xuXHRcdHVybDogVVJMLFxuXHRcdHBhdGhfbm92ZWw6IHN0cmluZyxcblx0fSwgLi4uYXJndilcblx0e1xuXHRcdGNvbnN0IHNlbGYgPSB0aGlzO1xuXHRcdGNvbnN0IHsgdXJsLCBwYXRoX25vdmVsIH0gPSBfY2FjaGVfO1xuXG5cdFx0aWYgKG5vdmVsLnZvbHVtZV9saXN0KVxuXHRcdHtcblx0XHRcdGNvbnN0IHsga2VlcEltYWdlID0gZmFsc2UgfSA9IG9wdGlvbnNSdW50aW1lO1xuXG5cdFx0XHRyZXR1cm4gUHJvbWlzZUJsdWViaXJkXG5cdFx0XHRcdC5yZXNvbHZlKG5vdmVsLnZvbHVtZV9saXN0KVxuXHRcdFx0XHQuZWFjaCgodm9sdW1lLCB2aWQpID0+XG5cdFx0XHRcdHtcblxuXHRcdFx0XHRcdGxldCBkaXJuYW1lOiBzdHJpbmc7XG5cblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRsZXQgX3ZpZCA9ICcnO1xuXG5cdFx0XHRcdFx0XHRpZiAoIW9wdGlvbnNSdW50aW1lLm5vRGlyUHJlZml4KVxuXHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRfdmlkID0gdmlkLnRvU3RyaW5nKCkucGFkU3RhcnQoNCwgJzAnKSArICcwJztcblx0XHRcdFx0XHRcdFx0X3ZpZCArPSAnXyc7XG5cdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdGRpcm5hbWUgPSBwYXRoLmpvaW4ocGF0aF9ub3ZlbCxcblx0XHRcdFx0XHRcdFx0YCR7X3ZpZH0ke3NlbGYudHJpbUZpbGVuYW1lVm9sdW1lKHZvbHVtZS52b2x1bWVfdGl0bGUpfWAsXG5cdFx0XHRcdFx0XHQpO1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdGxldCBpbWdzOiBzdHJpbmdbXSA9IFtdO1xuXG5cdFx0XHRcdFx0cmV0dXJuIFByb21pc2VCbHVlYmlyZFxuXHRcdFx0XHRcdFx0LnJlc29sdmUodm9sdW1lLmNoYXB0ZXJfbGlzdClcblx0XHRcdFx0XHRcdC5lYWNoKGFzeW5jIChjaGFwdGVyKSA9PlxuXHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRpZiAoY2hhcHRlci5pbWdzKVxuXHRcdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdFx0aW1ncy5wdXNoKC4uLmNoYXB0ZXIuaW1ncyk7XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdH0pXG5cdFx0XHRcdFx0XHQudGFwKGFzeW5jICgpID0+XG5cdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdGltZ3MgPSBpbWdzLmZpbHRlcih2ID0+IHYpO1xuXG5cdFx0XHRcdFx0XHRcdGlmIChpbWdzLmxlbmd0aClcblx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdGxldCBmaWxlID0gcGF0aC5qb2luKGRpcm5hbWUsICdBVFRBQ0gubWQnKTtcblxuXHRcdFx0XHRcdFx0XHRcdGxldCBtZF9kYXRhID0ge1xuXHRcdFx0XHRcdFx0XHRcdFx0YXR0YWNoOiB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdGltYWdlczoge30gYXMgUmVjb3JkPHN0cmluZywgc3RyaW5nPixcblx0XHRcdFx0XHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0XHRcdFx0fTtcblxuXHRcdFx0XHRcdFx0XHRcdGlmIChrZWVwSW1hZ2UpXG5cdFx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdFx0YXdhaXQgZnMucmVhZEZpbGUoZmlsZSlcblx0XHRcdFx0XHRcdFx0XHRcdFx0LnRoZW4odiA9PiBtZGNvbmZfcGFyc2UodikpXG5cdFx0XHRcdFx0XHRcdFx0XHRcdC50aGVuKChkYXRhOiB0eXBlb2YgbWRfZGF0YSkgPT4ge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdGRhdGEuYXR0YWNoID0gZGF0YS5hdHRhY2ggfHwge30gYXMgYW55O1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdGRhdGEuYXR0YWNoLmltYWdlcyA9IGRhdGEuYXR0YWNoLmltYWdlcyB8fCB7fTtcblxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdG1kX2RhdGEgPSBkYXRhO1xuXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0Y29uc29sZURlYnVnLmRlYnVnKGBMb2FkIGRhdGEgZnJvbSBleGlzdHMgQVRUQUNILm1kYClcblx0XHRcdFx0XHRcdFx0XHRcdFx0fSlcblx0XHRcdFx0XHRcdFx0XHRcdFx0LmNhdGNoKG51bGwpXG5cdFx0XHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHRcdFx0bWRfZGF0YS5hdHRhY2guaW1hZ2VzID0gT2JqZWN0XG5cdFx0XHRcdFx0XHRcdFx0XHQuZW50cmllcyhpbWdzIGFzIHN0cmluZ1tdKVxuXHRcdFx0XHRcdFx0XHRcdFx0LnJlZHVjZSgoYSwgW2ssIHZdKSA9PlxuXHRcdFx0XHRcdFx0XHRcdFx0e1xuXG5cdFx0XHRcdFx0XHRcdFx0XHRcdGlmIChrZWVwSW1hZ2UpXG5cdFx0XHRcdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRhW2hhc2hTdW0odildID0gdjtcblx0XHRcdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRcdFx0XHRlbHNlXG5cdFx0XHRcdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRhW2sudG9TdHJpbmcoKS5wYWRTdGFydCgzLCAnMCcpXSA9IHY7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0XHRcdFx0XHRyZXR1cm4gYVxuXHRcdFx0XHRcdFx0XHRcdFx0fSwgbWRfZGF0YS5hdHRhY2guaW1hZ2VzKTtcblxuXHRcdFx0XHRcdFx0XHRcdGxldCBtZCA9IG1kY29uZl9zdHJpbmdpZnkobWRfZGF0YSk7XG5cblx0XHRcdFx0XHRcdFx0XHRyZXR1cm4gZnMub3V0cHV0RmlsZShmaWxlLCBtZCk7XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdH0pXG5cdFx0XHRcdH0pXG5cdFx0XHRcdDtcblx0XHR9XG5cblx0XHRyZXR1cm4gUHJvbWlzZUJsdWViaXJkLnJlc29sdmUoKVxuXHR9XG5cblx0cHJvdGVjdGVkIGFzeW5jIF9wcm9jZXNzTm92ZWw8VCA9IGFueT4obm92ZWw6IElOb3ZlbCwgb3B0aW9uc1J1bnRpbWU6IElPcHRpb25zUnVudGltZSwgX2NhY2hlXzoge1xuXHRcdHVybDogVVJMLFxuXHRcdHBhdGhfbm92ZWw6IHN0cmluZyxcblx0fSwgLi4uYXJndilcblx0e1xuXHRcdGNvbnN0IHNlbGYgPSB0aGlzO1xuXHRcdGxldCBpZHggPSBvcHRpb25zUnVudGltZS5zdGFydEluZGV4IHx8IDA7XG5cblx0XHRsZXQgeyB1cmwsIHBhdGhfbm92ZWwgfSA9IF9jYWNoZV87XG5cblx0XHRyZXR1cm4gUHJvbWlzZUJsdWViaXJkXG5cdFx0XHQubWFwU2VyaWVzKG5vdmVsLnZvbHVtZV9saXN0LCAodm9sdW1lLCB2aWQpID0+XG5cdFx0XHR7XG5cdFx0XHRcdGxldCBkaXJuYW1lOiBzdHJpbmc7XG5cblx0XHRcdFx0e1xuXHRcdFx0XHRcdGxldCBfdmlkID0gJyc7XG5cblx0XHRcdFx0XHRpZiAoIW9wdGlvbnNSdW50aW1lLm5vRGlyUHJlZml4KVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdF92aWQgPSB2aWQudG9TdHJpbmcoKS5wYWRTdGFydCg0LCAnMCcpICsgJzAnO1xuXHRcdFx0XHRcdFx0X3ZpZCArPSAnXyc7XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0ZGlybmFtZSA9IHBhdGguam9pbihwYXRoX25vdmVsLFxuXHRcdFx0XHRcdFx0YCR7X3ZpZH0ke3NlbGYudHJpbUZpbGVuYW1lVm9sdW1lKHZvbHVtZS52b2x1bWVfdGl0bGUpfWAsXG5cdFx0XHRcdFx0KTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGlmICghb3B0aW9uc1J1bnRpbWUubm9GaXJlUHJlZml4ICYmIG9wdGlvbnNSdW50aW1lLmZpbGVQcmVmaXhNb2RlID49IDIpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRsZXQgaTogbnVtYmVyO1xuXG5cdFx0XHRcdFx0bGV0IGJvb2wgPSB2b2x1bWUuY2hhcHRlcl9saXN0LmV2ZXJ5KGZ1bmN0aW9uIChjaGFwdGVyLCBqKVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdGxldCBtID0gKG9wdGlvbnNSdW50aW1lLmZpbGVQcmVmaXhNb2RlID4gMyA/XG5cdFx0XHRcdFx0XHRcdFx0Y2hhcHRlci5jaGFwdGVyX3RpdGxlIDogbm9ybWFsaXplX3ZhbChjaGFwdGVyLmNoYXB0ZXJfdGl0bGUpXG5cdFx0XHRcdFx0XHRcdClcblx0XHRcdFx0XHRcdFx0LnJlcGxhY2UoL15cXEQrLywgJycpXG5cdFx0XHRcdFx0XHRcdC8vLnJlcGxhY2UoL14oXFxkKykuKyQvLCAnJDEnKVxuXHRcdFx0XHRcdFx0XHQucmVwbGFjZSgvXihcXGQrKVxcRC4qJC8sICckMScpXG5cdFx0XHRcdFx0XHQ7XG5cblx0XHRcdFx0XHRcdC8vY29uc29sZS5sb2cobSwgY2hhcHRlci5jaGFwdGVyX3RpdGxlKTtcblxuXHRcdFx0XHRcdFx0aWYgKC9eXFxkKyQvLnRlc3QobSkpXG5cdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdGxldCBtMiA9IHBhcnNlSW50KG0pO1xuXG5cdFx0XHRcdFx0XHRcdGlmIChqID09IDApXG5cdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHRpID0gbTI7XG5cblx0XHRcdFx0XHRcdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRlbHNlIGlmIChtMiA9PT0gKytpKVxuXHRcdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdFx0XHRcdH0pO1xuXG5cdFx0XHRcdFx0Ly9jb25zb2xlLmxvZyhib29sKTtcblxuXHRcdFx0XHRcdGlmIChib29sKVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdHZvbHVtZS5jaGFwdGVyX2xpc3QuZm9yRWFjaChmdW5jdGlvbiAoY2hhcHRlcilcblx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0Y2hhcHRlci5jaGFwdGVyX2luZGV4ID0gJyc7XG5cdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRpZiAob3B0aW9uc1J1bnRpbWUuZXZlbnQpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRzZWxmLmVtaXQob3B0aW9uc1J1bnRpbWUuZXZlbnQsICd2b2x1bWUnLCB2b2x1bWUsIHtcblx0XHRcdFx0XHRcdG9wdGlvbnNSdW50aW1lLFxuXHRcdFx0XHRcdFx0ZGlybmFtZSxcblx0XHRcdFx0XHRcdHZpZCxcblx0XHRcdFx0XHRcdG5vdmVsLFxuXHRcdFx0XHRcdFx0dXJsLFxuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0cmV0dXJuIFByb21pc2VCbHVlYmlyZFxuXHRcdFx0XHRcdC5tYXBTZXJpZXModm9sdW1lLmNoYXB0ZXJfbGlzdCwgYXN5bmMgKGNoYXB0ZXIsIGNpZCkgPT5cblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHQvL2NoYXB0ZXIuY2hhcHRlcl9pbmRleCA9IChpZHgrKyk7XG5cblx0XHRcdFx0XHRcdGNvbnN0IGN1cnJlbnRfaWR4ID0gaWR4Kys7XG5cblx0XHRcdFx0XHRcdGxldCBmaWxlID0gZ2V0RmlsZVBhdGgoc2VsZiwge1xuXHRcdFx0XHRcdFx0XHRjaGFwdGVyLCBjaWQsXG5cdFx0XHRcdFx0XHRcdGV4dDogJy50eHQnLFxuXG5cdFx0XHRcdFx0XHRcdGlkeDogY3VycmVudF9pZHgsXG5cblx0XHRcdFx0XHRcdFx0ZGlybmFtZSxcblx0XHRcdFx0XHRcdFx0dm9sdW1lLCB2aWQsXG5cdFx0XHRcdFx0XHR9LCBvcHRpb25zUnVudGltZSk7XG5cblx0XHRcdFx0XHRcdGlmIChzZWxmLl9jaGVja0V4aXN0cyhvcHRpb25zUnVudGltZSwgZmlsZSkpXG5cdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdHJldHVybiBmaWxlO1xuXHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHRsZXQgdXJsID0gc2VsZi5fY3JlYXRlQ2hhcHRlclVybCh7XG5cdFx0XHRcdFx0XHRcdG5vdmVsLFxuXHRcdFx0XHRcdFx0XHR2b2x1bWUsXG5cdFx0XHRcdFx0XHRcdGNoYXB0ZXIsXG5cdFx0XHRcdFx0XHR9LCBvcHRpb25zUnVudGltZSk7XG5cblx0XHRcdFx0XHRcdGF3YWl0IHNlbGYuX2ZldGNoQ2hhcHRlcih1cmwsIG9wdGlvbnNSdW50aW1lKVxuXHRcdFx0XHRcdFx0XHQudGhlbihmdW5jdGlvbiAocmV0KVxuXHRcdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdFx0cmV0dXJuIHNlbGYuX3BhcnNlQ2hhcHRlcihyZXQsIG9wdGlvbnNSdW50aW1lLCB7XG5cdFx0XHRcdFx0XHRcdFx0XHRmaWxlLFxuXHRcdFx0XHRcdFx0XHRcdFx0bm92ZWwsXG5cdFx0XHRcdFx0XHRcdFx0XHR2b2x1bWUsXG5cdFx0XHRcdFx0XHRcdFx0XHRjaGFwdGVyLFxuXHRcdFx0XHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdFx0XHR9KVxuXHRcdFx0XHRcdFx0XHQudGhlbihmdW5jdGlvbiAodGV4dClcblx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdGlmICh0eXBlb2YgdGV4dCA9PSAnc3RyaW5nJylcblx0XHRcdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdFx0XHRyZXR1cm4gbm92ZWxUZXh0LnRvU3RyKHRleHQpO1xuXHRcdFx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0XHRcdHJldHVybiB0ZXh0O1xuXHRcdFx0XHRcdFx0XHR9KVxuXHRcdFx0XHRcdFx0XHQudGhlbihhc3luYyAodGV4dDogc3RyaW5nKSA9PlxuXHRcdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdFx0YXdhaXQgdGhpcy5fc2F2ZUZpbGUoe1xuXHRcdFx0XHRcdFx0XHRcdFx0ZmlsZSxcblx0XHRcdFx0XHRcdFx0XHRcdGNvbnRleHQ6IHRleHQsXG5cdFx0XHRcdFx0XHRcdFx0XHRvcHRpb25zUnVudGltZSxcblx0XHRcdFx0XHRcdFx0XHR9KTtcblxuXHRcdFx0XHRcdFx0XHRcdHJldHVybiB0ZXh0O1xuXHRcdFx0XHRcdFx0XHR9KVxuXHRcdFx0XHRcdFx0O1xuXG5cdFx0XHRcdFx0XHRyZXR1cm4gZmlsZTtcblx0XHRcdFx0XHR9KVxuXHRcdFx0XHRcdDtcblx0XHRcdH0pXG5cdFx0XHQudGhlbihmdW5jdGlvbiAocmV0KVxuXHRcdFx0e1xuXHRcdFx0XHRyZXR1cm4gcmV0IGFzIGFueSBhcyBUO1xuXHRcdFx0fSlcblx0XHRcdDtcblx0fVxuXG5cdHByb2Nlc3NOb3ZlbDxUPihub3ZlbDogSU5vdmVsLCBvcHRpb25zUnVudGltZTogSU9wdGlvbnNSdW50aW1lLCBfY2FjaGVfOiB7XG5cdFx0dXJsOiBVUkwsXG5cdFx0cGF0aF9ub3ZlbDogc3RyaW5nLFxuXHR9LCAuLi5hcmd2KVxuXHR7XG5cdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdGxldCBwcjogYW55O1xuXG5cdFx0cHIgPSBvcHRpb25zUnVudGltZS5mZXRjaE1ldGFEYXRhT25seSA/IFtdIDogdGhpcy5fcHJvY2Vzc05vdmVsPFQ+KG5vdmVsLCBvcHRpb25zUnVudGltZSwgX2NhY2hlXywgLi4uYXJndik7XG5cblx0XHRyZXR1cm4gUHJvbWlzZUJsdWViaXJkXG5cdFx0XHQucmVzb2x2ZShwcilcblx0XHRcdC50aGVuKGZ1bmN0aW9uIChyZXQ6IFQpXG5cdFx0XHR7XG5cdFx0XHRcdHJldHVybiB7XG5cdFx0XHRcdFx0bm92ZWwsXG5cdFx0XHRcdFx0b3B0aW9uc1J1bnRpbWUsXG5cdFx0XHRcdFx0X2NhY2hlXyxcblx0XHRcdFx0XHRyZXQsXG5cdFx0XHRcdH07XG5cdFx0XHR9KVxuXHRcdFx0O1xuXHR9XG5cblx0cHJvdGVjdGVkIF9zdHJpcENvbnRlbnQodGV4dDogc3RyaW5nKVxuXHR7XG5cdFx0cmV0dXJuIHRleHQ7XG5cdH1cblxuXHRwcm90ZWN0ZWQgX3BhcnNlQ2hhcHRlcjxUPihyZXQ6IElGZXRjaENoYXB0ZXIsIG9wdGlvbnNSdW50aW1lOiBUICYgSU9wdGlvbnNSdW50aW1lLCBjYWNoZToge1xuXHRcdGZpbGU6IHN0cmluZyxcblx0XHRub3ZlbDogX05vdmVsU2l0ZS5JTm92ZWwsXG5cdFx0dm9sdW1lOiBfTm92ZWxTaXRlLklWb2x1bWUsXG5cdFx0Y2hhcHRlcjogX05vdmVsU2l0ZS5JQ2hhcHRlcixcblx0fSk6IHN0cmluZyB8IFByb21pc2U8c3RyaW5nPlxuXHR7XG5cdFx0aWYgKCFyZXQpXG5cdFx0e1xuXHRcdFx0cmV0dXJuICcnO1xuXHRcdH1cblxuXHRcdHRocm93IG5ldyBTeW50YXhFcnJvcihgRnVuY3Rpb24gbm90IGltcGxlbWVudGVkYCk7XG5cdH1cblxuXHRwcm90ZWN0ZWQgX2ZldGNoQ2hhcHRlcjxUPih1cmw6IFVSTCwgb3B0aW9uc1J1bnRpbWU6IFQgJiBJT3B0aW9uc1J1bnRpbWUpXG5cdHtcblx0XHRyZXR1cm4gUHJvbWlzZUJsdWViaXJkLnJlc29sdmUoKS50aGVuKGFzeW5jIGZ1bmN0aW9uICgpXG5cdFx0e1xuXHRcdFx0Y29uc29sZURlYnVnLmRlYnVnKGBmZXRjaENoYXB0ZXJgLCB1cmwudG9TdHJpbmcoKSk7XG5cblx0XHRcdGxldCByZXQgPSB7fSBhcyBJRmV0Y2hDaGFwdGVyO1xuXG5cdFx0XHRsZXQgb3B0cyA9IGdldE9wdGlvbnMob3B0aW9uc1J1bnRpbWUpO1xuXG5cdFx0XHRpZiAob3B0aW9uc1J1bnRpbWUuZGlzYWJsZURvd25sb2FkKVxuXHRcdFx0e1xuXHRcdFx0XHRyZXR1cm4gbnVsbDtcblx0XHRcdH1cblx0XHRcdGVsc2UgaWYgKHRydWUpXG5cdFx0XHR7XG5cdFx0XHRcdGlmIChvcHRpb25zUnVudGltZS5yZXRyeURlbGF5ID4gMClcblx0XHRcdFx0e1xuXHRcdFx0XHRcdC8vIEB0cy1pZ25vcmVcblx0XHRcdFx0XHRvcHRzLnJlcXVlc3RPcHRpb25zLmRlbGF5ID0gb3B0aW9uc1J1bnRpbWUucmV0cnlEZWxheTtcblx0XHRcdFx0fVxuXHRcdFx0XHRlbHNlXG5cdFx0XHRcdHtcblx0XHRcdFx0XHQvLyBAdHMtaWdub3JlXG5cdFx0XHRcdFx0b3B0cy5yZXF1ZXN0T3B0aW9ucy5yZXRyeSA9IDE7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRhd2FpdCByZXRyeVJlcXVlc3QodXJsLCBvcHRzLnJlcXVlc3RPcHRpb25zKVxuXHRcdFx0XHRcdC50aGVuKGZ1bmN0aW9uIChyZXMpXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0Y29uc3QgY29udGVudFR5cGVQYXJzZWQgPSBwYXJzZUNvbnRlbnRUeXBlKHJlcy5oZWFkZXJzW1wiY29udGVudC10eXBlXCJdKTtcblxuXHRcdFx0XHRcdFx0cmV0LmNvbnRlbnRUeXBlUGFyc2VkID0gY29udGVudFR5cGVQYXJzZWQ7XG5cblx0XHRcdFx0XHRcdC8vIEB0cy1pZ25vcmVcblx0XHRcdFx0XHRcdHJldC51cmwgPSB1cmw7XG5cblx0XHRcdFx0XHRcdGlmIChjb250ZW50VHlwZVBhcnNlZC5pc0hUTUwoKSB8fCBjb250ZW50VHlwZVBhcnNlZC5pc1hNTCgpKVxuXHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRyZXQuZG9tID0gcmVxdWVzdFRvSlNET00ocmVzLCB1cmwsIG9wdGlvbnNSdW50aW1lLm9wdGlvbnNKU0RPTSk7XG5cdFx0XHRcdFx0XHRcdHJldC5kb20gPSBwYWNrSlNET00ocmV0LmRvbSk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRlbHNlIGlmIChjb250ZW50VHlwZVBhcnNlZC5zdWJ0eXBlID09ICdqc29uJylcblx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0cmV0Lmpzb24gPSBKU09OLnBhcnNlKHJlcy5ib2R5LnRvU3RyaW5nKCkpO1xuXHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHRyZXQucmVzID0gcmVzO1xuXHRcdFx0XHRcdFx0cmV0LmJvZHkgPSByZXMuYm9keTtcblx0XHRcdFx0XHR9KVxuXHRcdFx0XHQ7XG5cdFx0XHR9XG5cdFx0XHRlbHNlXG5cdFx0XHR7XG5cdFx0XHRcdC8vIEB0cy1pZ25vcmVcblx0XHRcdFx0cmV0LmRvbSA9IGF3YWl0IGZyb21VUkwodXJsLCBvcHRpb25zUnVudGltZS5vcHRpb25zSlNET00pO1xuXG5cdFx0XHRcdHJldC5yZXMgPSByZXQuZG9tLl9vcHRpb25zLlJlc3BvbnNlO1xuXHRcdFx0XHRyZXQuYm9keSA9IHJldC5kb20uX29wdGlvbnMuYm9keTtcblx0XHRcdH1cblxuXHRcdFx0cmV0dXJuIHJldDtcblx0XHR9KTtcblx0fVxuXG5cdHByb3RlY3RlZCBfZXhwb3J0RG93bmxvYWRPcHRpb25zKG9wdGlvbnNSdW50aW1lPzogSU9wdGlvbnNSdW50aW1lKTogYW55XG5cdHtcblx0XHRsZXQgb3B0cyA9IHt9O1xuXG5cdFx0aWYgKG9wdGlvbnNSdW50aW1lKVxuXHRcdHtcblx0XHRcdGxldCBib29sOiBib29sZWFuO1xuXG5cdFx0XHRmb3IgKGxldCBrIG9mIFtcblx0XHRcdFx0J25vRmlyZVByZWZpeCcsXG5cdFx0XHRcdCdub0ZpbGVQYWRlbmQnLFxuXHRcdFx0XHQnZmlsZVByZWZpeE1vZGUnLFxuXHRcdFx0XHQnc3RhcnRJbmRleCcsXG5cdFx0XHRdKVxuXHRcdFx0e1xuXHRcdFx0XHRpZiAoKGsgaW4gb3B0aW9uc1J1bnRpbWUpICYmIHR5cGVvZiBvcHRpb25zUnVudGltZVtrXSAhPT0gJ3VuZGVmaW5lZCcpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRib29sID0gdHJ1ZTtcblx0XHRcdFx0XHRvcHRzW2tdID0gb3B0aW9uc1J1bnRpbWVba107XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cblx0XHRyZXR1cm4gb3B0cztcblx0fVxuXG5cdHByb3RlY3RlZCBfc2F2ZVJlYWRtZShvcHRpb25zUnVudGltZTogSU9wdGlvbnNSdW50aW1lLCBvcHRpb25zID0ge30sIC4uLm9wdHMpXG5cdHtcblx0XHRpZiAodGhpcy5JREtFWSlcblx0XHR7XG5cdFx0XHRvcHRpb25zW3RoaXMuSURLRVldID0gb3B0aW9uc1t0aGlzLklES0VZXSB8fCB7fTtcblxuXHRcdFx0dHJ5XG5cdFx0XHR7XG5cdFx0XHRcdG9wdGlvbnNbdGhpcy5JREtFWV0ubm92ZWxfaWQgPSBvcHRpb25zW3RoaXMuSURLRVldLm5vdmVsX2lkIHx8IG9wdGlvbnNSdW50aW1lW1NZTUJPTF9DQUNIRV0ubm92ZWwudXJsX2RhdGEubm92ZWxfaWQ7XG5cdFx0XHR9XG5cdFx0XHRjYXRjaCAoZSlcblx0XHRcdHtcblx0XHRcdH1cblx0XHR9XG5cblx0XHRsZXQgZG93bmxvYWRPcHRpb25zID0gdGhpcy5fZXhwb3J0RG93bmxvYWRPcHRpb25zKG9wdGlvbnNSdW50aW1lKTtcblxuXHRcdHJldHVybiBzdXBlci5fc2F2ZVJlYWRtZShvcHRpb25zUnVudGltZSwgb3B0aW9ucywge1xuXHRcdFx0b3B0aW9uczoge1xuXHRcdFx0XHR0ZXh0bGF5b3V0OiB7XG5cdFx0XHRcdFx0YWxsb3dfbGYyOiB0cnVlLFxuXHRcdFx0XHR9LFxuXHRcdFx0XHRkb3dubG9hZE9wdGlvbnM6IGRvd25sb2FkT3B0aW9ucyB8fCB7fSxcblx0XHRcdH0sXG5cdFx0fSwgLi4ub3B0cyk7XG5cdH1cblxuXHRwcm90ZWN0ZWQgX2dldF9tZXRhKGlucHV0VXJsLCBvcHRpb25zUnVudGltZSwgY2FjaGU/OiB7XG5cdFx0ZG9tPzogSUpTRE9NLFxuXHR9KVxuXHR7XG5cdFx0dGhyb3cgbmV3IFN5bnRheEVycm9yKCk7XG5cdH1cblxufVxuXG5leHBvcnQgY29uc3QgTm92ZWxTaXRlID0gTm92ZWxTaXRlRGVtbyBhcyB0eXBlb2YgTm92ZWxTaXRlRGVtbztcblxuZXhwb3J0IGRlZmF1bHQgTm92ZWxTaXRlRGVtbztcbiJdfQ==