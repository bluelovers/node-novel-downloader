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
exports.NovelSite = exports.NovelSiteDemo = void 0;
const fetch_1 = require("../../fetch");
const fs = require("fs-extra");
const path = require("upath2");
const jsdom_extra_1 = require("jsdom-extra");
//import { URL } from 'jsdom-url';
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
const jsdom_extra_2 = require("jsdom-extra");
const jsdom_extra_3 = require("jsdom-extra");
const mdconf2_1 = require("mdconf2");
const log_1 = require("../../util/log");
const hash_1 = require("../../util/hash");
let NovelSiteDemo = /** @class */ (() => {
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
                        if (!(typeof c === 'string' || c instanceof jsdom_extra_2.LazyCookie || c instanceof jsdom_extra_3.toughCookie.Cookie)) {
                            // @ts-ignore
                            c = new jsdom_extra_3.toughCookie.Cookie(c);
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
                log_1.consoleDebug.debug(`session`, optionsRuntime.optionsJSDOM.cookieJar);
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
                url = await this.createMainUrl(url, optionsRuntime);
                self.session(optionsRuntime, url);
                log_1.consoleDebug.info('分析章節列表', url.toString());
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
                log_1.consoleDebug.info(`檢查 ATTACH 資料`);
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
                        log_1.consoleDebug.debug(`[ATTACH]`, `${path.relative(path_novel, dirname)}`, imgs.length);
                        if (imgs.length) {
                            let file = path.join(dirname, 'ATTACH.md');
                            let md_data = {
                                attach: {
                                    images: {},
                                },
                            };
                            if (keepImage || 1) {
                                await fs.readFile(file)
                                    .then(v => mdconf2_1.parse(v))
                                    // @ts-ignore
                                    .then((data) => {
                                    data.attach = data.attach || {};
                                    data.attach.images = data.attach.images || {};
                                    md_data = data;
                                    log_1.consoleDebug.debug(`Load data from exists ATTACH.md`);
                                })
                                    .catch(e => null);
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
                            return fs.outputFile(file, md)
                                .then(r => {
                                log_1.consoleDebug.success(`[ATTACH]`, `[SAVE]`, `${path.relative(path_novel, file)}`);
                                return r;
                            });
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
                log_1.consoleDebug.debug(vid, volume.volume_title);
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
                        log_1.consoleDebug.debug(`[SKIP]`, vid, cid, chapter.chapter_title);
                        return file;
                    }
                    let url = self._createChapterUrl({
                        novel,
                        volume,
                        chapter,
                    }, optionsRuntime);
                    log_1.consoleDebug.debug(vid, cid, chapter.chapter_title);
                    //consoleDebug.debug(url.toString());
                    await self._fetchChapterMain({
                        url,
                        file,
                        volume,
                        chapter,
                    }, optionsRuntime, {
                        novel,
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
            log_1.consoleDebug.info('開始處理小說');
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
        _fetchChapterRetryError(message, ret, optionsRuntime, cache) {
            let e = new Error(message);
            e.doRetry = (cache.doRetry | 0) + 1;
            return e;
        }
        _fetchChapterMain(argv, optionsRuntime, _cache_) {
            const self = this;
            let { url, file, volume, chapter } = argv;
            let { novel } = _cache_;
            return index_2.PromiseBluebird.resolve()
                .then(async () => {
                let _do = false;
                let doRetry = 0;
                let value;
                do {
                    _do = false;
                    value = await self._fetchChapter(url, optionsRuntime, {
                        novel,
                    })
                        .then(async (ret) => {
                        return self._parseChapter(ret, optionsRuntime, {
                            file,
                            novel,
                            volume,
                            chapter,
                            doRetry,
                        });
                    })
                        .catch(async (e) => {
                        if (e.doRetry > 0 && e.doRetry < 5) {
                            _do = true;
                            doRetry = e.doRetry | 0;
                            let delay = 5000 + doRetry * 1000 + (argv.volume.volume_index + argv.chapter.chapter_index) * 10;
                            log_1.console.warn(e.message, doRetry, delay);
                            await index_2.PromiseBluebird.delay(delay);
                            return;
                        }
                        return Promise.reject(e);
                    });
                } while (_do);
                return value;
            })
                .then(function (text) {
                if (typeof text == 'string') {
                    return novel_text_1.default.toStr(text);
                }
                return text;
            });
        }
        _fetchChapter(url, optionsRuntime, _cache_) {
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
                    'keepRuby',
                    'keepFormat',
                    'keepImage',
                    'allowEmptyVolumeTitle',
                    'disableOutputDirPrefix',
                ]) {
                    if ((k in optionsRuntime) && typeof optionsRuntime[k] !== 'undefined') {
                        bool = true;
                        // @ts-ignore
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
    return NovelSiteDemo;
})();
exports.NovelSiteDemo = NovelSiteDemo;
exports.NovelSite = NovelSiteDemo;
exports.default = NovelSiteDemo;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFzZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImJhc2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0FBQUEsdUNBQTJDO0FBQzNDLCtCQUFnQztBQUNoQywrQkFBZ0M7QUFFaEMsNkNBQTBGO0FBQzFGLGtDQUFrQztBQUNsQyw4QkFBb0M7QUFFcEMsdUNBQXlDO0FBQ3pDLHlEQUE2RDtBQUM3RCwyQ0FBa0Q7QUFDbEQsaUVBTXFDO0FBQ3JDLDJEQUFpRjtBQUdqRixvQ0FBMkY7QUFDM0Ysb0NBQTJDO0FBRTNDLHdEQUF5RDtBQUN6RCwyQ0FBbUM7QUFFbkMsNkNBQXdEO0FBRXhELDZDQUEwQztBQUUxQyxxQ0FBK0U7QUFXL0Usd0NBQXVFO0FBQ3ZFLDBDQUEwQztBQWlCMUM7SUFBQSxJQUFhLGFBQWEsR0FBMUIsTUFBYSxhQUFjLFNBQVEsZUFBVTtRQUk1QyxZQUFZLE9BQXlCLEVBQUUsR0FBRyxJQUFJO1lBRTdDLEtBQUssQ0FBQyxPQUFPLEVBQUUsR0FBRyxJQUFJLENBQUMsQ0FBQztRQUN6QixDQUFDO1FBRUQ7Ozs7Ozs7V0FPRztRQUNILGdCQUFnQixDQUFtQixJQUFPLEVBQUUsaUJBQWtDLEVBQUU7WUFFL0UsT0FBTyxJQUFJLENBQUM7UUFDYixDQUFDO1FBRUQsT0FBTyxDQUFzQixjQUE2QyxFQUFFLEdBQVEsRUFBRSxNQUFlO1lBRXBHLEtBQUssQ0FBQyxPQUFPLENBQUMsY0FBYyxFQUFFLEdBQUcsQ0FBQyxDQUFDO1lBRW5DLElBQUksY0FBYyxDQUFDLFdBQVcsSUFBSSxNQUFNLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxXQUFXLENBQUMsQ0FBQyxNQUFNLEVBQ2hGO2dCQUNDLE1BQU0sQ0FBQyxPQUFPLENBQUMsY0FBYyxDQUFDLFdBQVcsQ0FBQztxQkFDeEMsT0FBTyxDQUFDLFVBQVUsSUFBSTtvQkFFdEIsSUFBSSxDQUF3QixDQUFDO29CQUM3QixJQUFJLEtBQUssR0FBRyxPQUFPLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFFM0IsSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksS0FBSyxJQUFJLFFBQVEsRUFDaEM7d0JBQ0MsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztxQkFDWjt5QkFDSSxJQUFJLEtBQUssS0FBSyxJQUFJLElBQUksS0FBSyxJQUFJLFFBQVEsRUFDNUM7d0JBQ0MsSUFBSSxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsR0FBRyxJQUFJLENBQUM7d0JBRXhCLENBQUMsR0FBRzs0QkFDSCxHQUFHOzRCQUNILEtBQUs7eUJBQ0wsQ0FBQztxQkFDRjt5QkFFRDt3QkFDQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO3FCQUNaO29CQUVELElBQUksQ0FBQyxFQUNMO3dCQUVDLElBQUksT0FBTyxDQUFDLElBQUksUUFBUSxFQUN4Qjs0QkFDQyxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksRUFDWDtnQ0FDQyxDQUFDLENBQUMsSUFBSSxHQUFHLEdBQUcsQ0FBQzs2QkFDYjs0QkFFRCxJQUFJLENBQUMsQ0FBQyxRQUFRLElBQUksSUFBSSxFQUN0QjtnQ0FDQyxDQUFDLENBQUMsUUFBUSxHQUFHLEtBQUssQ0FBQzs2QkFDbkI7eUJBQ0Q7d0JBRUQsSUFBSSxDQUFDLENBQUMsT0FBTyxDQUFDLEtBQUssUUFBUSxJQUFJLENBQUMsWUFBWSx3QkFBVSxJQUFJLENBQUMsWUFBWSx5QkFBVyxDQUFDLE1BQU0sQ0FBQyxFQUMxRjs0QkFDQyxhQUFhOzRCQUNiLENBQUMsR0FBRyxJQUFJLHlCQUFXLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFBO3lCQUM3Qjt3QkFFRCxjQUFjLENBQUMsWUFBWSxDQUFDLFNBQVM7NkJBQ25DLGFBQWEsQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUMzQjt3QkFFRCxJQUFJLE9BQU8sQ0FBQyxJQUFJLFFBQVEsSUFBSSxDQUFDLENBQUMsQ0FBQyxNQUFNLEVBQ3JDOzRCQUNDLElBQUksTUFBTSxFQUNWO2dDQUNDLENBQUMsQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDOzZCQUNsQjtpQ0FDSSxJQUFJLEdBQUcsSUFBSSxHQUFHLENBQUMsSUFBSSxFQUN4QjtnQ0FDQyxDQUFDLENBQUMsTUFBTSxHQUFHLEdBQUcsQ0FBQyxJQUFJLENBQUM7NkJBQ3BCOzRCQUVELElBQ0E7Z0NBQ0MsY0FBYyxDQUFDLFlBQVksQ0FBQyxTQUFTO3FDQUNuQyxhQUFhLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FDM0I7NkJBQ0Q7NEJBQ0QsT0FBTyxDQUFDLEVBQ1I7NkJBRUM7eUJBQ0Q7cUJBQ0Q7Z0JBQ0YsQ0FBQyxDQUFDLENBQ0Y7Z0JBRUQsa0JBQVksQ0FBQyxLQUFLLENBQUMsU0FBUyxFQUFFLGNBQWMsQ0FBQyxZQUFZLENBQUMsU0FBUyxDQUFDLENBQUM7YUFDckU7WUFFRCxPQUFPLElBQUksQ0FBQztRQUNiLENBQUM7UUFFRCxRQUFRLENBQUMsUUFBc0IsRUFBRSxrQkFBb0MsRUFBRTtZQUV0RSxNQUFNLElBQUksR0FBRyxJQUFJLENBQUM7WUFDbEIsSUFBSSxHQUFHLEdBQUcsUUFBZSxDQUFDO1lBRTFCLE1BQU0sQ0FBQyxlQUFlLEVBQUUsY0FBYyxDQUFDLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBcUMsZUFBZSxDQUFDLENBQUM7WUFFakgsa0JBQVksQ0FBQyxPQUFPLEdBQUcsY0FBYyxDQUFDLFFBQVEsQ0FBQztZQUUvQyxPQUFPLHVCQUFlO2lCQUNwQixJQUFJLENBQUMsSUFBSSxDQUFDO2lCQUNWLElBQUksQ0FBQyxLQUFLLElBQUksRUFBRTtnQkFFaEIsR0FBRyxHQUFHLE1BQU0sSUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLEVBQUUsY0FBYyxDQUFDLENBQUM7Z0JBRXBELElBQUksQ0FBQyxPQUFPLENBQUMsY0FBYyxFQUFFLEdBQUcsQ0FBQyxDQUFDO2dCQUVsQyxrQkFBWSxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsR0FBRyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUM7Z0JBRTVDLElBQUksS0FBSyxHQUFHLE1BQU0sSUFBSSxDQUFDLGVBQWUsQ0FBcUMsR0FBRyxFQUFFLGNBQWMsQ0FBQyxDQUFDO2dCQUVoRyxJQUFJLFVBQVUsR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLGVBQWUsRUFBRSxLQUFLLEVBQUUsY0FBYyxDQUFDLENBQUM7Z0JBRTNFLElBQUksQ0FBQyxlQUFlLENBQUMsR0FBRyxFQUFFLGNBQWMsRUFBRSxLQUFLLEVBQUUsVUFBVSxDQUFDLENBQUM7Z0JBRTdELElBQUksR0FBRyxHQUFHLGNBQWMsQ0FBQyxVQUFVLElBQUksQ0FBQyxDQUFDO2dCQUV6QyxjQUFjLENBQUMsb0JBQVksQ0FBQyxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7Z0JBQzNDLGNBQWMsQ0FBQyxvQkFBWSxDQUFDLENBQUMsVUFBVSxHQUFHLFVBQVUsQ0FBQztnQkFFckQsTUFBTSx1QkFBZTtxQkFDbkIsT0FBTyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsS0FBSyxFQUFFLGNBQWMsRUFBRTtvQkFDakQsR0FBRztvQkFDSCxVQUFVO2lCQUNWLENBQUMsQ0FBQztxQkFDRixHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUU7b0JBRVQsT0FBTyxJQUFJLENBQUMsYUFBYSxDQUFDLEtBQUssRUFBRSxjQUFjLEVBQUU7d0JBQ2hELEdBQUc7d0JBQ0gsVUFBVTtxQkFDVixDQUFDLENBQUE7Z0JBQ0gsQ0FBQyxDQUFDO3FCQUNELEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRTtvQkFFVCxJQUFJLElBQUksR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFDOUIsR0FBRyxJQUFJLENBQUMsaUJBQWlCLENBQUMsS0FBSyxDQUFDLFdBQVcsQ0FBQyxJQUFJLEtBQUssQ0FBQyxRQUFRLENBQUMsUUFBUSxPQUFPLENBQzdFLENBQ0Q7b0JBRUQsT0FBTyxFQUFFLENBQUMsVUFBVSxDQUFDLElBQUksRUFBRSxLQUFLLEVBQUU7d0JBQ2pDLE1BQU0sRUFBRSxJQUFJO3FCQUNaLENBQUMsQ0FBQztnQkFDSixDQUFDLENBQUMsQ0FDRjtnQkFFRCxNQUFNLElBQUksQ0FBQyxXQUFXLENBQUMsY0FBYyxDQUFDLENBQUM7Z0JBRXZDLElBQUksTUFBTSxHQUFHLDRCQUFVLEVBQUUsQ0FBQztnQkFFMUIsTUFBTSxlQUFXLENBQUM7b0JBQ2pCLFVBQVU7aUJBQ1YsRUFBRTtvQkFDRixHQUFHLEVBQUUsVUFBVTtpQkFDZixDQUFDO3FCQUNBLFNBQVMsQ0FBQyxLQUFLLEVBQUUsSUFBSSxFQUFFLEVBQUU7b0JBRXpCLElBQUksRUFBRSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7b0JBQzFCLE1BQU0sV0FBVyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEdBQUcsRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUM7b0JBRS9DLE1BQU0sRUFBRTt5QkFDTixRQUFRLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsSUFBSSxDQUFDLENBQUM7eUJBQ3JDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRTt3QkFFWCw4QkFBWSxDQUFDOzRCQUNaLEtBQUssRUFBRSxHQUFHLENBQUMsUUFBUSxFQUFFOzRCQUNyQixXQUFXOzRCQUNYLE1BQU07eUJBQ04sQ0FBQyxDQUFDO29CQUNKLENBQUMsQ0FBQyxDQUNGO2dCQUNGLENBQUMsQ0FBQztxQkFDRCxHQUFHLENBQUMsS0FBSyxJQUFJLEVBQUU7b0JBR2YsSUFBSSxFQUFFLEdBQUcsZ0JBQVcsQ0FBQzt3QkFDcEIsU0FBUyxFQUFFLE1BQU0sQ0FBQyxHQUFHO3FCQUNyQixDQUFDLENBQUM7b0JBRUgsT0FBTyxFQUFFLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFLFFBQVEsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFBO2dCQUMxRCxDQUFDLENBQUMsQ0FDRjtnQkFFRCxPQUFPLEtBQUssQ0FBQztZQUNkLENBQUMsQ0FBQyxDQUNEO1FBQ0gsQ0FBQztRQUVTLEtBQUssQ0FBQyxhQUFhLENBQVUsS0FBYSxFQUFFLGNBQStCLEVBQUUsT0FHdEYsRUFBRSxHQUFHLElBQUk7WUFFVCxNQUFNLElBQUksR0FBRyxJQUFJLENBQUM7WUFDbEIsTUFBTSxFQUFFLEdBQUcsRUFBRSxVQUFVLEVBQUUsR0FBRyxPQUFPLENBQUM7WUFFcEMsSUFBSSxLQUFLLENBQUMsV0FBVyxFQUNyQjtnQkFDQyxNQUFNLEVBQUUsU0FBUyxHQUFHLEtBQUssRUFBRSxHQUFHLGNBQWMsQ0FBQztnQkFFN0Msa0JBQVksQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLENBQUM7Z0JBRWxDLE9BQU8sdUJBQWU7cUJBQ3BCLE9BQU8sQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUFDO3FCQUMxQixJQUFJLENBQUMsQ0FBQyxNQUFNLEVBQUUsR0FBRyxFQUFFLEVBQUU7b0JBR3JCLElBQUksT0FBZSxDQUFDO29CQUVwQjt3QkFDQyxJQUFJLElBQUksR0FBRyxFQUFFLENBQUM7d0JBRWQsSUFBSSxDQUFDLGNBQWMsQ0FBQyxXQUFXLEVBQy9COzRCQUNDLElBQUksR0FBRyxHQUFHLENBQUMsUUFBUSxFQUFFLENBQUMsUUFBUSxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsR0FBRyxHQUFHLENBQUM7NEJBQzdDLElBQUksSUFBSSxHQUFHLENBQUM7eUJBQ1o7d0JBRUQsT0FBTyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUM3QixHQUFHLElBQUksR0FBRyxJQUFJLENBQUMsa0JBQWtCLENBQUMsTUFBTSxDQUFDLFlBQVksQ0FBQyxFQUFFLENBQ3hELENBQUM7cUJBQ0Y7b0JBRUQsSUFBSSxJQUFJLEdBQWEsRUFBRSxDQUFDO29CQUV4QixPQUFPLHVCQUFlO3lCQUNwQixPQUFPLENBQUMsTUFBTSxDQUFDLFlBQVksQ0FBQzt5QkFDNUIsSUFBSSxDQUFDLEtBQUssRUFBRSxPQUFPLEVBQUUsRUFBRTt3QkFFdkIsSUFBSSxPQUFPLENBQUMsSUFBSSxFQUNoQjs0QkFDQyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO3lCQUMzQjtvQkFDRixDQUFDLENBQUM7eUJBQ0QsR0FBRyxDQUFDLEtBQUssSUFBSSxFQUFFO3dCQUVmLElBQUksR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7d0JBRTNCLGtCQUFZLENBQUMsS0FBSyxDQUFDLFVBQVUsRUFBRSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsVUFBVSxFQUFFLE9BQU8sQ0FBQyxFQUFFLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO3dCQUVyRixJQUFJLElBQUksQ0FBQyxNQUFNLEVBQ2Y7NEJBQ0MsSUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsV0FBVyxDQUFDLENBQUM7NEJBRTNDLElBQUksT0FBTyxHQUFHO2dDQUNiLE1BQU0sRUFBRTtvQ0FDUCxNQUFNLEVBQUUsRUFBNEI7aUNBQ3BDOzZCQUNELENBQUM7NEJBRUYsSUFBSSxTQUFTLElBQUksQ0FBQyxFQUNsQjtnQ0FDQyxNQUFNLEVBQUUsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDO3FDQUNyQixJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxlQUFZLENBQUMsQ0FBQyxDQUFDLENBQUM7b0NBQzNCLGFBQWE7cUNBQ1osSUFBSSxDQUFDLENBQUMsSUFBb0IsRUFBRSxFQUFFO29DQUU5QixJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxNQUFNLElBQUksRUFBUyxDQUFDO29DQUN2QyxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sSUFBSSxFQUFFLENBQUM7b0NBRTlDLE9BQU8sR0FBRyxJQUFJLENBQUM7b0NBRWYsa0JBQVksQ0FBQyxLQUFLLENBQUMsaUNBQWlDLENBQUMsQ0FBQTtnQ0FDdEQsQ0FBQyxDQUFDO3FDQUNELEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFBOzZCQUNsQjs0QkFFRCxPQUFPLENBQUMsTUFBTSxDQUFDLE1BQU0sR0FBRyxNQUFNO2lDQUM1QixPQUFPLENBQUMsSUFBZ0IsQ0FBQztpQ0FDekIsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUU7Z0NBR3JCLElBQUksU0FBUyxFQUNiO29DQUNDLENBQUMsQ0FBQyxjQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7aUNBQ2xCO3FDQUVEO29DQUNDLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsUUFBUSxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztpQ0FDckM7Z0NBRUQsT0FBTyxDQUFDLENBQUE7NEJBQ1QsQ0FBQyxFQUFFLE9BQU8sQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUM7NEJBRTNCLElBQUksRUFBRSxHQUFHLG1CQUFnQixDQUFDLE9BQU8sQ0FBQyxDQUFDOzRCQUVuQyxPQUFPLEVBQUUsQ0FBQyxVQUFVLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQztpQ0FDNUIsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFO2dDQUdULGtCQUFZLENBQUMsT0FBTyxDQUFDLFVBQVUsRUFBRSxRQUFRLEVBQUUsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLFVBQVUsRUFBRSxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7Z0NBRWpGLE9BQU8sQ0FBQyxDQUFDOzRCQUNWLENBQUMsQ0FBQyxDQUNEO3lCQUNGO29CQUNGLENBQUMsQ0FBQyxDQUFBO2dCQUNKLENBQUMsQ0FBQyxDQUNEO2FBQ0Y7WUFFRCxPQUFPLHVCQUFlLENBQUMsT0FBTyxFQUFFLENBQUE7UUFDakMsQ0FBQztRQUVTLEtBQUssQ0FBQyxhQUFhLENBQVUsS0FBYSxFQUFFLGNBQStCLEVBQUUsT0FHdEYsRUFBRSxHQUFHLElBQUk7WUFFVCxNQUFNLElBQUksR0FBRyxJQUFJLENBQUM7WUFDbEIsSUFBSSxHQUFHLEdBQUcsY0FBYyxDQUFDLFVBQVUsSUFBSSxDQUFDLENBQUM7WUFFekMsSUFBSSxFQUFFLEdBQUcsRUFBRSxVQUFVLEVBQUUsR0FBRyxPQUFPLENBQUM7WUFFbEMsT0FBTyx1QkFBZTtpQkFDcEIsU0FBUyxDQUFDLEtBQUssQ0FBQyxXQUFXLEVBQUUsQ0FBQyxNQUFNLEVBQUUsR0FBRyxFQUFFLEVBQUU7Z0JBRTdDLElBQUksT0FBZSxDQUFDO2dCQUVwQjtvQkFDQyxJQUFJLElBQUksR0FBRyxFQUFFLENBQUM7b0JBRWQsSUFBSSxDQUFDLGNBQWMsQ0FBQyxXQUFXLEVBQy9CO3dCQUNDLElBQUksR0FBRyxHQUFHLENBQUMsUUFBUSxFQUFFLENBQUMsUUFBUSxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsR0FBRyxHQUFHLENBQUM7d0JBQzdDLElBQUksSUFBSSxHQUFHLENBQUM7cUJBQ1o7b0JBRUQsT0FBTyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUM3QixHQUFHLElBQUksR0FBRyxJQUFJLENBQUMsa0JBQWtCLENBQUMsTUFBTSxDQUFDLFlBQVksQ0FBQyxFQUFFLENBQ3hELENBQUM7aUJBQ0Y7Z0JBRUQsa0JBQVksQ0FBQyxLQUFLLENBQUMsR0FBRyxFQUFFLE1BQU0sQ0FBQyxZQUFZLENBQUMsQ0FBQztnQkFFN0MsSUFBSSxDQUFDLGNBQWMsQ0FBQyxZQUFZLElBQUksY0FBYyxDQUFDLGNBQWMsSUFBSSxDQUFDLEVBQ3RFO29CQUNDLElBQUksQ0FBUyxDQUFDO29CQUVkLElBQUksSUFBSSxHQUFHLE1BQU0sQ0FBQyxZQUFZLENBQUMsS0FBSyxDQUFDLFVBQVUsT0FBTyxFQUFFLENBQUM7d0JBRXhELElBQUksQ0FBQyxHQUFHLENBQUMsY0FBYyxDQUFDLGNBQWMsR0FBRyxDQUFDLENBQUMsQ0FBQzs0QkFDMUMsT0FBTyxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUMsc0JBQWEsQ0FBQyxPQUFPLENBQUMsYUFBYSxDQUFDLENBQzVEOzZCQUNBLE9BQU8sQ0FBQyxNQUFNLEVBQUUsRUFBRSxDQUFDOzRCQUNwQiw2QkFBNkI7NkJBQzVCLE9BQU8sQ0FBQyxhQUFhLEVBQUUsSUFBSSxDQUFDLENBQzdCO3dCQUVELHdDQUF3Qzt3QkFFeEMsSUFBSSxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUNuQjs0QkFDQyxJQUFJLEVBQUUsR0FBRyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUM7NEJBRXJCLElBQUksQ0FBQyxJQUFJLENBQUMsRUFDVjtnQ0FDQyxDQUFDLEdBQUcsRUFBRSxDQUFDO2dDQUVQLE9BQU8sSUFBSSxDQUFDOzZCQUNaO2lDQUNJLElBQUksRUFBRSxLQUFLLEVBQUUsQ0FBQyxFQUNuQjtnQ0FDQyxPQUFPLElBQUksQ0FBQzs2QkFDWjt5QkFDRDt3QkFFRCxPQUFPLEtBQUssQ0FBQztvQkFDZCxDQUFDLENBQUMsQ0FBQztvQkFFSCxvQkFBb0I7b0JBRXBCLElBQUksSUFBSSxFQUNSO3dCQUNDLE1BQU0sQ0FBQyxZQUFZLENBQUMsT0FBTyxDQUFDLFVBQVUsT0FBTzs0QkFFNUMsT0FBTyxDQUFDLGFBQWEsR0FBRyxFQUFFLENBQUM7d0JBQzVCLENBQUMsQ0FBQyxDQUFDO3FCQUNIO2lCQUNEO2dCQUVELElBQUksY0FBYyxDQUFDLEtBQUssRUFDeEI7b0JBQ0MsSUFBSSxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsS0FBSyxFQUFFLFFBQVEsRUFBRSxNQUFNLEVBQUU7d0JBQ2pELGNBQWM7d0JBQ2QsT0FBTzt3QkFDUCxHQUFHO3dCQUNILEtBQUs7d0JBQ0wsR0FBRztxQkFDSCxDQUFDLENBQUM7aUJBQ0g7Z0JBRUQsT0FBTyx1QkFBZTtxQkFDcEIsU0FBUyxDQUFDLE1BQU0sQ0FBQyxZQUFZLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxHQUFHLEVBQUUsRUFBRTtvQkFFdEQsa0NBQWtDO29CQUVsQyxNQUFNLFdBQVcsR0FBRyxHQUFHLEVBQUUsQ0FBQztvQkFFMUIsSUFBSSxJQUFJLEdBQUcsZ0JBQVcsQ0FBQyxJQUFJLEVBQUU7d0JBQzVCLE9BQU8sRUFBRSxHQUFHO3dCQUNaLEdBQUcsRUFBRSxNQUFNO3dCQUVYLEdBQUcsRUFBRSxXQUFXO3dCQUVoQixPQUFPO3dCQUNQLE1BQU0sRUFBRSxHQUFHO3FCQUNYLEVBQUUsY0FBYyxDQUFDLENBQUM7b0JBRW5CLElBQUksSUFBSSxDQUFDLFlBQVksQ0FBQyxjQUFjLEVBQUUsSUFBSSxDQUFDLEVBQzNDO3dCQUNDLGtCQUFZLENBQUMsS0FBSyxDQUFDLFFBQVEsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLE9BQU8sQ0FBQyxhQUFhLENBQUMsQ0FBQzt3QkFFOUQsT0FBTyxJQUFJLENBQUM7cUJBQ1o7b0JBRUQsSUFBSSxHQUFHLEdBQUcsSUFBSSxDQUFDLGlCQUFpQixDQUFDO3dCQUNoQyxLQUFLO3dCQUNMLE1BQU07d0JBQ04sT0FBTztxQkFDUCxFQUFFLGNBQWMsQ0FBQyxDQUFDO29CQUVuQixrQkFBWSxDQUFDLEtBQUssQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLE9BQU8sQ0FBQyxhQUFhLENBQUMsQ0FBQztvQkFDcEQscUNBQXFDO29CQUVyQyxNQUFNLElBQUksQ0FBQyxpQkFBaUIsQ0FBQzt3QkFDM0IsR0FBRzt3QkFDSCxJQUFJO3dCQUNKLE1BQU07d0JBQ04sT0FBTztxQkFDUCxFQUFFLGNBQWMsRUFBRTt3QkFDbEIsS0FBSztxQkFDTCxDQUFDO3lCQUVELElBQUksQ0FBQyxLQUFLLEVBQUUsSUFBWSxFQUFFLEVBQUU7d0JBRTVCLE1BQU0sSUFBSSxDQUFDLFNBQVMsQ0FBQzs0QkFDcEIsSUFBSTs0QkFDSixPQUFPLEVBQUUsSUFBSTs0QkFDYixjQUFjO3lCQUNkLENBQUMsQ0FBQzt3QkFFSCxPQUFPLElBQUksQ0FBQztvQkFDYixDQUFDLENBQUMsQ0FDRjtvQkFFRCxPQUFPLElBQUksQ0FBQztnQkFDYixDQUFDLENBQUMsQ0FDRDtZQUNILENBQUMsQ0FBQztpQkFDRCxJQUFJLENBQUMsVUFBVSxHQUFHO2dCQUVsQixPQUFPLEdBQWUsQ0FBQztZQUN4QixDQUFDLENBQUMsQ0FDRDtRQUNILENBQUM7UUFFRCxZQUFZLENBQUksS0FBYSxFQUFFLGNBQStCLEVBQUUsT0FHL0QsRUFBRSxHQUFHLElBQUk7WUFFVCxhQUFhO1lBQ2IsSUFBSSxFQUFPLENBQUM7WUFFWixrQkFBWSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUU1QixFQUFFLEdBQUcsY0FBYyxDQUFDLGlCQUFpQixDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUksS0FBSyxFQUFFLGNBQWMsRUFBRSxPQUFPLEVBQUUsR0FBRyxJQUFJLENBQUMsQ0FBQztZQUU1RyxPQUFPLHVCQUFlO2lCQUNwQixPQUFPLENBQUMsRUFBRSxDQUFDO2lCQUNYLElBQUksQ0FBQyxVQUFVLEdBQU07Z0JBRXJCLE9BQU87b0JBQ04sS0FBSztvQkFDTCxjQUFjO29CQUNkLE9BQU87b0JBQ1AsR0FBRztpQkFDSCxDQUFDO1lBQ0gsQ0FBQyxDQUFDLENBQ0Q7UUFDSCxDQUFDO1FBRVMsYUFBYSxDQUFDLElBQVk7WUFFbkMsT0FBTyxJQUFJLENBQUM7UUFDYixDQUFDO1FBRVMsYUFBYSxDQUFJLEdBQWtCLEVBQUUsY0FBbUMsRUFBRSxLQU1uRjtZQUVBLElBQUksQ0FBQyxHQUFHLEVBQ1I7Z0JBQ0MsT0FBTyxFQUFFLENBQUM7YUFDVjtZQUVELE1BQU0sSUFBSSxXQUFXLENBQUMsMEJBQTBCLENBQUMsQ0FBQztRQUNuRCxDQUFDO1FBRVMsdUJBQXVCLENBQUksT0FBZSxFQUFFLEdBQWtCLEVBQUUsY0FBbUMsRUFBRSxLQU05RztZQUlBLElBQUksQ0FBQyxHQUVELElBQUksS0FBSyxDQUFDLE9BQU8sQ0FBUSxDQUFDO1lBRTlCLENBQUMsQ0FBQyxPQUFPLEdBQUcsQ0FBQyxLQUFLLENBQUMsT0FBTyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUVwQyxPQUFPLENBQUMsQ0FBQTtRQUNULENBQUM7UUFFUyxpQkFBaUIsQ0FBSSxJQUs5QixFQUFFLGNBQW1DLEVBQUUsT0FFdkM7WUFFQSxNQUFNLElBQUksR0FBRyxJQUFJLENBQUM7WUFFbEIsSUFBSSxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFFLE9BQU8sRUFBRSxHQUFHLElBQUksQ0FBQztZQUMxQyxJQUFJLEVBQUUsS0FBSyxFQUFFLEdBQUcsT0FBTyxDQUFDO1lBRXhCLE9BQU8sdUJBQWUsQ0FBQyxPQUFPLEVBQUU7aUJBQzlCLElBQUksQ0FBQyxLQUFLLElBQUksRUFBRTtnQkFFaEIsSUFBSSxHQUFHLEdBQUcsS0FBSyxDQUFDO2dCQUNoQixJQUFJLE9BQU8sR0FBRyxDQUFDLENBQUM7Z0JBQ2hCLElBQUksS0FBYSxDQUFDO2dCQUNsQixHQUNBO29CQUNDLEdBQUcsR0FBRyxLQUFLLENBQUM7b0JBRVosS0FBSyxHQUFHLE1BQU0sSUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLEVBQUUsY0FBYyxFQUFFO3dCQUNwRCxLQUFLO3FCQUNMLENBQUM7eUJBQ0QsSUFBSSxDQUFDLEtBQUssRUFBRSxHQUFHLEVBQUUsRUFBRTt3QkFFbkIsT0FBTyxJQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsRUFBRSxjQUFjLEVBQUU7NEJBQzlDLElBQUk7NEJBQ0osS0FBSzs0QkFDTCxNQUFNOzRCQUNOLE9BQU87NEJBQ1AsT0FBTzt5QkFDUCxDQUFDLENBQUM7b0JBQ0osQ0FBQyxDQUFDO3lCQUNELEtBQUssQ0FBQyxLQUFLLEVBQUUsQ0FFYixFQUFFLEVBQUU7d0JBRUosSUFBSSxDQUFDLENBQUMsT0FBTyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsT0FBTyxHQUFHLENBQUMsRUFDbEM7NEJBQ0MsR0FBRyxHQUFHLElBQUksQ0FBQzs0QkFDWCxPQUFPLEdBQUcsQ0FBQyxDQUFDLE9BQU8sR0FBRyxDQUFDLENBQUM7NEJBQ3hCLElBQUksS0FBSyxHQUFHLElBQUksR0FBRyxPQUFPLEdBQUcsSUFBSSxHQUFHLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxZQUF1QixHQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsYUFBeUIsSUFBRyxFQUFFLENBQUM7NEJBRXhILGFBQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLE9BQU8sRUFBRSxPQUFPLEVBQUUsS0FBSyxDQUFDLENBQUM7NEJBRXhDLE1BQU0sdUJBQWUsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUM7NEJBRW5DLE9BQU07eUJBQ047d0JBRUQsT0FBTyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFBO29CQUN6QixDQUFDLENBQUMsQ0FBQTtpQkFFSCxRQUNNLEdBQUcsRUFBRTtnQkFFWixPQUFPLEtBQUssQ0FBQTtZQUNiLENBQUMsQ0FBQztpQkFDRCxJQUFJLENBQUMsVUFBVSxJQUFJO2dCQUVuQixJQUFJLE9BQU8sSUFBSSxJQUFJLFFBQVEsRUFDM0I7b0JBQ0MsT0FBTyxvQkFBUyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztpQkFDN0I7Z0JBRUQsT0FBTyxJQUFJLENBQUM7WUFDYixDQUFDLENBQUMsQ0FDRDtRQUNILENBQUM7UUFFUyxhQUFhLENBQUksR0FBUSxFQUFFLGNBQW1DLEVBQUUsT0FFekU7WUFFQSxPQUFPLHVCQUFlLENBQUMsT0FBTyxFQUFFLENBQUMsSUFBSSxDQUFDLEtBQUs7Z0JBRTFDLGtCQUFZLENBQUMsS0FBSyxDQUFDLGNBQWMsRUFBRSxHQUFHLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQztnQkFFbkQsSUFBSSxHQUFHLEdBQUcsRUFBbUIsQ0FBQztnQkFFOUIsSUFBSSxJQUFJLEdBQUcsa0JBQVUsQ0FBQyxjQUFjLENBQUMsQ0FBQztnQkFFdEMsSUFBSSxjQUFjLENBQUMsZUFBZSxFQUNsQztvQkFDQyxPQUFPLElBQUksQ0FBQztpQkFDWjtxQkFDSSxJQUFJLElBQUksRUFDYjtvQkFDQyxJQUFJLGNBQWMsQ0FBQyxVQUFVLEdBQUcsQ0FBQyxFQUNqQzt3QkFDQyxhQUFhO3dCQUNiLElBQUksQ0FBQyxjQUFjLENBQUMsS0FBSyxHQUFHLGNBQWMsQ0FBQyxVQUFVLENBQUM7cUJBQ3REO3lCQUVEO3dCQUNDLGFBQWE7d0JBQ2IsSUFBSSxDQUFDLGNBQWMsQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDO3FCQUM5QjtvQkFFRCxNQUFNLG9CQUFZLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxjQUFjLENBQUM7eUJBQzFDLElBQUksQ0FBQyxVQUFVLEdBQUc7d0JBRWxCLE1BQU0saUJBQWlCLEdBQUcsZ0JBQWdCLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDO3dCQUV4RSxHQUFHLENBQUMsaUJBQWlCLEdBQUcsaUJBQWlCLENBQUM7d0JBRTFDLGFBQWE7d0JBQ2IsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUM7d0JBRWQsSUFBSSxpQkFBaUIsQ0FBQyxNQUFNLEVBQUUsSUFBSSxpQkFBaUIsQ0FBQyxLQUFLLEVBQUUsRUFDM0Q7NEJBQ0MsR0FBRyxDQUFDLEdBQUcsR0FBRyw0QkFBYyxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsY0FBYyxDQUFDLFlBQVksQ0FBQyxDQUFDOzRCQUNoRSxHQUFHLENBQUMsR0FBRyxHQUFHLHVCQUFTLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO3lCQUM3Qjs2QkFDSSxJQUFJLGlCQUFpQixDQUFDLE9BQU8sSUFBSSxNQUFNLEVBQzVDOzRCQUNDLEdBQUcsQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUM7eUJBQzNDO3dCQUVELEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDO3dCQUNkLEdBQUcsQ0FBQyxJQUFJLEdBQUcsR0FBRyxDQUFDLElBQUksQ0FBQztvQkFDckIsQ0FBQyxDQUFDLENBQ0Y7aUJBQ0Q7cUJBRUQ7b0JBQ0MsYUFBYTtvQkFDYixHQUFHLENBQUMsR0FBRyxHQUFHLE1BQU0scUJBQU8sQ0FBQyxHQUFHLEVBQUUsY0FBYyxDQUFDLFlBQVksQ0FBQyxDQUFDO29CQUUxRCxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQztvQkFDcEMsR0FBRyxDQUFDLElBQUksR0FBRyxHQUFHLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUM7aUJBQ2pDO2dCQUVELE9BQU8sR0FBRyxDQUFDO1lBQ1osQ0FBQyxDQUFDLENBQUM7UUFDSixDQUFDO1FBRVMsc0JBQXNCLENBQXNCLGNBQW9DO1lBRXpGLElBQUksSUFBSSxHQUFpQyxFQUFFLENBQUM7WUFFNUMsSUFBSSxjQUFjLEVBQ2xCO2dCQUNDLElBQUksSUFBYSxDQUFDO2dCQUVsQixLQUFLLElBQUksQ0FBQyxJQUFJO29CQUNiLGNBQWM7b0JBQ2QsY0FBYztvQkFDZCxnQkFBZ0I7b0JBQ2hCLFlBQVk7b0JBQ1osVUFBVTtvQkFDVixZQUFZO29CQUNaLFdBQVc7b0JBQ1gsdUJBQXVCO29CQUN2Qix3QkFBd0I7aUJBQ0ssRUFDOUI7b0JBQ0MsSUFBSSxDQUFDLENBQUMsSUFBSSxjQUFjLENBQUMsSUFBSSxPQUFPLGNBQWMsQ0FBQyxDQUFDLENBQUMsS0FBSyxXQUFXLEVBQ3JFO3dCQUNDLElBQUksR0FBRyxJQUFJLENBQUM7d0JBQ1osYUFBYTt3QkFDYixJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsY0FBYyxDQUFDLENBQUMsQ0FBQyxDQUFDO3FCQUM1QjtpQkFDRDthQUNEO1lBRUQsT0FBTyxJQUFJLENBQUM7UUFDYixDQUFDO1FBRVMsV0FBVyxDQUFDLGNBQStCLEVBQUUsT0FBTyxHQUFHLEVBQUUsRUFBRSxHQUFHLElBQUk7WUFFM0UsSUFBSSxJQUFJLENBQUMsS0FBSyxFQUNkO2dCQUNDLE9BQU8sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLENBQUM7Z0JBRWhELElBQ0E7b0JBQ0MsT0FBTyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxRQUFRLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxRQUFRLElBQUksY0FBYyxDQUFDLG9CQUFZLENBQUMsQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQztpQkFDcEg7Z0JBQ0QsT0FBTyxDQUFDLEVBQ1I7aUJBQ0M7YUFDRDtZQUVELElBQUksZUFBZSxHQUFHLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxjQUFjLENBQUMsQ0FBQztZQUVsRSxPQUFPLEtBQUssQ0FBQyxXQUFXLENBQUMsY0FBYyxFQUFFLE9BQU8sRUFBRTtnQkFDakQsT0FBTyxFQUFFO29CQUNSLFVBQVUsRUFBRTt3QkFDWCxTQUFTLEVBQUUsSUFBSTtxQkFDZjtvQkFDRCxlQUFlLEVBQUUsZUFBZSxJQUFJLEVBQUU7aUJBQ3RDO2FBQ0QsRUFBRSxHQUFHLElBQUksQ0FBQyxDQUFDO1FBQ2IsQ0FBQztRQUVTLFNBQVMsQ0FBQyxRQUFRLEVBQUUsY0FBYyxFQUFFLEtBRTdDO1lBRUEsTUFBTSxJQUFJLFdBQVcsRUFBRSxDQUFDO1FBQ3pCLENBQUM7S0FFRCxDQUFBO0lBM3VCdUIsbUJBQUssR0FBVyxJQUFJLENBQUM7SUFGaEMsYUFBYTtRQUR6Qix3QkFBZ0IsRUFBOEM7O09BQ2xELGFBQWEsQ0E2dUJ6QjtJQUFELG9CQUFDO0tBQUE7QUE3dUJZLHNDQUFhO0FBK3VCYixRQUFBLFNBQVMsR0FBRyxhQUFxQyxDQUFDO0FBRS9ELGtCQUFlLGFBQWEsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IHJldHJ5UmVxdWVzdCB9IGZyb20gJy4uLy4uL2ZldGNoJztcbmltcG9ydCBmcyA9IHJlcXVpcmUoJ2ZzLWV4dHJhJyk7XG5pbXBvcnQgcGF0aCA9IHJlcXVpcmUoJ3VwYXRoMicpO1xuaW1wb3J0IG5vdmVsSW5mbywgeyBJTWRjb25mTWV0YSB9IGZyb20gJ25vZGUtbm92ZWwtaW5mbyc7XG5pbXBvcnQgeyBmcm9tVVJMLCBJRnJvbVVybE9wdGlvbnMsIElKU0RPTSwgcmVxdWVzdFRvSlNET00sIHBhY2tKU0RPTSB9IGZyb20gJ2pzZG9tLWV4dHJhJztcbi8vaW1wb3J0IHsgVVJMIH0gZnJvbSAnanNkb20tdXJsJztcbmltcG9ydCB7IGdldEZpbGVQYXRoIH0gZnJvbSAnLi4vZnMnO1xuXG5pbXBvcnQgeyBnZXRPcHRpb25zIH0gZnJvbSAnLi4vLi4vanNkb20nO1xuaW1wb3J0IHsgbm9ybWFsaXplX3ZhbCB9IGZyb20gJ25vZGUtbm92ZWwtZ2xvYmJ5L2xpYi9oZWxwZXInO1xuaW1wb3J0IHsgZ2xvYmJ5QVN5bmMgfSBmcm9tICdub2RlLW5vdmVsLWdsb2JieS9nJztcbmltcG9ydCB7XG5cdGxhenlBbmFseXplUmVwb3J0QWxsLFxuXHRsYXp5QW5hbHl6ZUFsbCxcblx0ZHVtbXlDYWNoZSxcblx0YW5hbHl6ZUphMDAyLFxuXHRoYW5kbGVKYTAwMixcbn0gZnJvbSAnQG5vZGUtbm92ZWwvbGF5b3V0LXJlcG9ydGVyJztcbmltcG9ydCB7IG91dHB1dEJsb2NrMDAyLCBvdXRwdXRKYTAwMiB9IGZyb20gJ0Bub2RlLW5vdmVsL2xheW91dC1yZXBvcnRlci9saWIvbWQnO1xuaW1wb3J0IHsgSVRTUGFydGlhbFBpY2sgfSBmcm9tICd0cy10eXBlJztcblxuaW1wb3J0IF9Ob3ZlbFNpdGUsIHsgc3RhdGljSW1wbGVtZW50cywgZGVmYXVsdEpTRE9NT3B0aW9ucywgU1lNQk9MX0NBQ0hFIH0gZnJvbSAnLi4vaW5kZXgnO1xuaW1wb3J0IHsgUHJvbWlzZUJsdWViaXJkIH0gZnJvbSAnLi4vaW5kZXgnO1xuXG5pbXBvcnQgcGFyc2VDb250ZW50VHlwZSA9IHJlcXVpcmUoJ2NvbnRlbnQtdHlwZS1wYXJzZXInKTtcbmltcG9ydCBub3ZlbFRleHQgZnJvbSAnbm92ZWwtdGV4dCc7XG5cbmltcG9ydCB7IExhenlDb29raWUsIExhenlDb29raWVKYXIgfSBmcm9tICdqc2RvbS1leHRyYSc7XG5cbmltcG9ydCB7IHRvdWdoQ29va2llIH0gZnJvbSAnanNkb20tZXh0cmEnO1xuXG5pbXBvcnQgeyBzdHJpbmdpZnkgYXMgbWRjb25mX3N0cmluZ2lmeSwgcGFyc2UgYXMgbWRjb25mX3BhcnNlIH0gZnJvbSAnbWRjb25mMic7XG5cbmV4cG9ydCB0eXBlIElPcHRpb25zUGx1cyA9IHt9XG5cbmV4cG9ydCB0eXBlIElEb3dubG9hZE9wdGlvbnMgPSBfTm92ZWxTaXRlLklEb3dubG9hZE9wdGlvbnMgJiBfTm92ZWxTaXRlLklPcHRpb25zICYgSU9wdGlvbnNQbHVzXG5leHBvcnQgdHlwZSBJT3B0aW9uc1J1bnRpbWUgPSBfTm92ZWxTaXRlLklPcHRpb25zUnVudGltZSAmIElPcHRpb25zUGx1c1xuXG5leHBvcnQgaW1wb3J0IElOb3ZlbCA9IF9Ob3ZlbFNpdGUuSU5vdmVsO1xuXG5pbXBvcnQgeyBSZXNwb25zZVJlcXVlc3QgfSBmcm9tICdyZXF1ZXN0JztcblxuaW1wb3J0IHsgY2hhbGtCeUNvbnNvbGUsIGNvbnNvbGUsIGNvbnNvbGVEZWJ1ZyB9IGZyb20gJy4uLy4uL3V0aWwvbG9nJztcbmltcG9ydCB7IGhhc2hTdW0gfSBmcm9tICcuLi8uLi91dGlsL2hhc2gnO1xuXG5leHBvcnQgdHlwZSBJRmV0Y2hDaGFwdGVyID0ge1xuXHRib2R5PzogYW55O1xuXHRkb20/OiBJSlNET007XG5cdHJlcz86IFJlc3BvbnNlUmVxdWVzdDtcblx0anNvbj8sXG5cblx0dXJsPzogVVJMLFxuXHRjb250ZW50VHlwZVBhcnNlZD86IFJldHVyblR5cGU8cGFyc2VDb250ZW50VHlwZT4sXG59O1xuXG5leHBvcnQgdHlwZSBJU2Vzc2lvbkRhdGEgPSB7XG5cdFtrZXk6IHN0cmluZ106IGFueSxcbn1cblxuQHN0YXRpY0ltcGxlbWVudHM8X05vdmVsU2l0ZS5JTm92ZWxTaXRlU3RhdGljPE5vdmVsU2l0ZURlbW8+PigpXG5leHBvcnQgY2xhc3MgTm92ZWxTaXRlRGVtbyBleHRlbmRzIF9Ob3ZlbFNpdGVcbntcblx0cHVibGljIHN0YXRpYyByZWFkb25seSBJREtFWTogc3RyaW5nID0gbnVsbDtcblxuXHRjb25zdHJ1Y3RvcihvcHRpb25zOiBJRG93bmxvYWRPcHRpb25zLCAuLi5hcmd2KVxuXHR7XG5cdFx0c3VwZXIob3B0aW9ucywgLi4uYXJndik7XG5cdH1cblxuXHQvKipcblx0ICogQHRvZG8g6K6T5q2k5pa55rOV5pyJ5oSP576pXG5cdCAqXG5cdCAqIOeUqOS+huiqquaYjuebruWJjeermem7nueahOaJgOmcgCBzZXNzaW9uIGNvb2tpZXNcblx0ICpcblx0ICogQHBhcmFtIHtUfSBkYXRhXG5cdCAqIEByZXR1cm5zIHtUfVxuXHQgKi9cblx0Y2hlY2tTZXNzaW9uRGF0YTxUID0gSVNlc3Npb25EYXRhPihkYXRhOiBULCBvcHRpb25zUnVudGltZTogSU9wdGlvbnNSdW50aW1lID0ge30pXG5cdHtcblx0XHRyZXR1cm4gZGF0YTtcblx0fVxuXG5cdHNlc3Npb248VCA9IElPcHRpb25zUnVudGltZT4ob3B0aW9uc1J1bnRpbWU6IFBhcnRpYWw8VCAmIElEb3dubG9hZE9wdGlvbnM+LCB1cmw6IFVSTCwgZG9tYWluPzogc3RyaW5nKVxuXHR7XG5cdFx0c3VwZXIuc2Vzc2lvbihvcHRpb25zUnVudGltZSwgdXJsKTtcblxuXHRcdGlmIChvcHRpb25zUnVudGltZS5zZXNzaW9uRGF0YSAmJiBPYmplY3Qua2V5cyhvcHRpb25zUnVudGltZS5zZXNzaW9uRGF0YSkubGVuZ3RoKVxuXHRcdHtcblx0XHRcdE9iamVjdC5lbnRyaWVzKG9wdGlvbnNSdW50aW1lLnNlc3Npb25EYXRhKVxuXHRcdFx0XHQuZm9yRWFjaChmdW5jdGlvbiAoZGF0YSlcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGxldCBjOiBMYXp5Q29va2llLlByb3BlcnRpZXM7XG5cdFx0XHRcdFx0bGV0IHR5cGVjID0gdHlwZW9mIGRhdGFbMV07XG5cblx0XHRcdFx0XHRpZiAoZGF0YVsxXSAmJiB0eXBlYyA9PSAnb2JqZWN0Jylcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRjID0gZGF0YVsxXTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0ZWxzZSBpZiAodHlwZWMgPT09IG51bGwgfHwgdHlwZWMgIT0gJ29iamVjdCcpXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0bGV0IFtrZXksIHZhbHVlXSA9IGRhdGE7XG5cblx0XHRcdFx0XHRcdGMgPSB7XG5cdFx0XHRcdFx0XHRcdGtleSxcblx0XHRcdFx0XHRcdFx0dmFsdWUsXG5cdFx0XHRcdFx0XHR9O1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRlbHNlXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0YyA9IGRhdGFbMV07XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0aWYgKGMpXG5cdFx0XHRcdFx0e1xuXG5cdFx0XHRcdFx0XHRpZiAodHlwZW9mIGMgPT0gJ29iamVjdCcpXG5cdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdGlmICghYy5wYXRoKVxuXHRcdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdFx0Yy5wYXRoID0gJy8nO1xuXHRcdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdFx0aWYgKGMuaG9zdE9ubHkgPT0gbnVsbClcblx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdGMuaG9zdE9ubHkgPSBmYWxzZTtcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHRpZiAoISh0eXBlb2YgYyA9PT0gJ3N0cmluZycgfHwgYyBpbnN0YW5jZW9mIExhenlDb29raWUgfHwgYyBpbnN0YW5jZW9mIHRvdWdoQ29va2llLkNvb2tpZSkpXG5cdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdC8vIEB0cy1pZ25vcmVcblx0XHRcdFx0XHRcdFx0YyA9IG5ldyB0b3VnaENvb2tpZS5Db29raWUoYylcblx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0b3B0aW9uc1J1bnRpbWUub3B0aW9uc0pTRE9NLmNvb2tpZUphclxuXHRcdFx0XHRcdFx0XHQuc2V0Q29va2llU3luYyhjLCB1cmwuaHJlZilcblx0XHRcdFx0XHRcdDtcblxuXHRcdFx0XHRcdFx0aWYgKHR5cGVvZiBjID09ICdvYmplY3QnICYmICFjLmRvbWFpbilcblx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0aWYgKGRvbWFpbilcblx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdGMuZG9tYWluID0gZG9tYWluO1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdGVsc2UgaWYgKHVybCAmJiB1cmwuaG9zdClcblx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdGMuZG9tYWluID0gdXJsLmhvc3Q7XG5cdFx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0XHR0cnlcblx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdG9wdGlvbnNSdW50aW1lLm9wdGlvbnNKU0RPTS5jb29raWVKYXJcblx0XHRcdFx0XHRcdFx0XHRcdC5zZXRDb29raWVTeW5jKGMsIHVybC5ocmVmKVxuXHRcdFx0XHRcdFx0XHRcdDtcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRjYXRjaCAoZSlcblx0XHRcdFx0XHRcdFx0e1xuXG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0pXG5cdFx0XHQ7XG5cblx0XHRcdGNvbnNvbGVEZWJ1Zy5kZWJ1Zyhgc2Vzc2lvbmAsIG9wdGlvbnNSdW50aW1lLm9wdGlvbnNKU0RPTS5jb29raWVKYXIpO1xuXHRcdH1cblxuXHRcdHJldHVybiB0aGlzO1xuXHR9XG5cblx0ZG93bmxvYWQoaW5wdXRVcmw6IHN0cmluZyB8IFVSTCwgZG93bmxvYWRPcHRpb25zOiBJRG93bmxvYWRPcHRpb25zID0ge30pXG5cdHtcblx0XHRjb25zdCBzZWxmID0gdGhpcztcblx0XHRsZXQgdXJsID0gaW5wdXRVcmwgYXMgVVJMO1xuXG5cdFx0Y29uc3QgW1BBVEhfTk9WRUxfTUFJTiwgb3B0aW9uc1J1bnRpbWVdID0gdGhpcy5nZXRPdXRwdXREaXI8SU9wdGlvbnNSdW50aW1lICYgSURvd25sb2FkT3B0aW9ucz4oZG93bmxvYWRPcHRpb25zKTtcblxuXHRcdGNvbnNvbGVEZWJ1Zy5lbmFibGVkID0gb3B0aW9uc1J1bnRpbWUuZGVidWdMb2c7XG5cblx0XHRyZXR1cm4gUHJvbWlzZUJsdWViaXJkXG5cdFx0XHQuYmluZChzZWxmKVxuXHRcdFx0LnRoZW4oYXN5bmMgKCkgPT5cblx0XHRcdHtcblx0XHRcdFx0dXJsID0gYXdhaXQgdGhpcy5jcmVhdGVNYWluVXJsKHVybCwgb3B0aW9uc1J1bnRpbWUpO1xuXG5cdFx0XHRcdHNlbGYuc2Vzc2lvbihvcHRpb25zUnVudGltZSwgdXJsKTtcblxuXHRcdFx0XHRjb25zb2xlRGVidWcuaW5mbygn5YiG5p6Q56ug56+A5YiX6KGoJywgdXJsLnRvU3RyaW5nKCkpO1xuXG5cdFx0XHRcdGxldCBub3ZlbCA9IGF3YWl0IHNlbGYuZ2V0X3ZvbHVtZV9saXN0PElPcHRpb25zUnVudGltZSAmIElEb3dubG9hZE9wdGlvbnM+KHVybCwgb3B0aW9uc1J1bnRpbWUpO1xuXG5cdFx0XHRcdGxldCBwYXRoX25vdmVsID0gc2VsZi5nZXRQYXRoTm92ZWwoUEFUSF9OT1ZFTF9NQUlOLCBub3ZlbCwgb3B0aW9uc1J1bnRpbWUpO1xuXG5cdFx0XHRcdHNlbGYuX2xvYWRFeGlzdHNDb25mKHVybCwgb3B0aW9uc1J1bnRpbWUsIG5vdmVsLCBwYXRoX25vdmVsKTtcblxuXHRcdFx0XHRsZXQgaWR4ID0gb3B0aW9uc1J1bnRpbWUuc3RhcnRJbmRleCB8fCAwO1xuXG5cdFx0XHRcdG9wdGlvbnNSdW50aW1lW1NZTUJPTF9DQUNIRV0ubm92ZWwgPSBub3ZlbDtcblx0XHRcdFx0b3B0aW9uc1J1bnRpbWVbU1lNQk9MX0NBQ0hFXS5wYXRoX25vdmVsID0gcGF0aF9ub3ZlbDtcblxuXHRcdFx0XHRhd2FpdCBQcm9taXNlQmx1ZWJpcmRcblx0XHRcdFx0XHQucmVzb2x2ZShzZWxmLnByb2Nlc3NOb3ZlbChub3ZlbCwgb3B0aW9uc1J1bnRpbWUsIHtcblx0XHRcdFx0XHRcdHVybCxcblx0XHRcdFx0XHRcdHBhdGhfbm92ZWwsXG5cdFx0XHRcdFx0fSkpXG5cdFx0XHRcdFx0LnRhcChscyA9PlxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdHJldHVybiBzZWxmLl9vdXRwdXRBdHRhY2gobm92ZWwsIG9wdGlvbnNSdW50aW1lLCB7XG5cdFx0XHRcdFx0XHRcdHVybCxcblx0XHRcdFx0XHRcdFx0cGF0aF9ub3ZlbCxcblx0XHRcdFx0XHRcdH0pXG5cdFx0XHRcdFx0fSlcblx0XHRcdFx0XHQudGFwKGxzID0+XG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0bGV0IGZpbGUgPSBwYXRoLmpvaW4ocGF0aF9ub3ZlbCxcblx0XHRcdFx0XHRcdFx0YCR7c2VsZi50cmltRmlsZW5hbWVOb3ZlbChub3ZlbC5ub3ZlbF90aXRsZSl9LiR7bm92ZWwudXJsX2RhdGEubm92ZWxfaWR9Lmpzb25gLFxuXHRcdFx0XHRcdFx0XHQpXG5cdFx0XHRcdFx0XHQ7XG5cblx0XHRcdFx0XHRcdHJldHVybiBmcy5vdXRwdXRKU09OKGZpbGUsIG5vdmVsLCB7XG5cdFx0XHRcdFx0XHRcdHNwYWNlczogXCJcXHRcIixcblx0XHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdH0pXG5cdFx0XHRcdDtcblxuXHRcdFx0XHRhd2FpdCBzZWxmLl9zYXZlUmVhZG1lKG9wdGlvbnNSdW50aW1lKTtcblxuXHRcdFx0XHRsZXQgX2NhY2hlID0gZHVtbXlDYWNoZSgpO1xuXG5cdFx0XHRcdGF3YWl0IGdsb2JieUFTeW5jKFtcblx0XHRcdFx0XHQnKiovKi50eHQnLFxuXHRcdFx0XHRdLCB7XG5cdFx0XHRcdFx0Y3dkOiBwYXRoX25vdmVsLFxuXHRcdFx0XHR9KVxuXHRcdFx0XHRcdC5tYXBTZXJpZXMoYXN5bmMgKGZpbGUpID0+XG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0bGV0IF9wID0gcGF0aC5wYXJzZShmaWxlKTtcblx0XHRcdFx0XHRcdGNvbnN0IF9jYWNoZV9rZXlfID0gcGF0aC5qb2luKF9wLmRpciwgX3AubmFtZSk7XG5cblx0XHRcdFx0XHRcdGF3YWl0IGZzXG5cdFx0XHRcdFx0XHRcdC5yZWFkRmlsZShwYXRoLmpvaW4ocGF0aF9ub3ZlbCwgZmlsZSkpXG5cdFx0XHRcdFx0XHRcdC50aGVuKGJ1ZiA9PlxuXHRcdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdFx0YW5hbHl6ZUphMDAyKHtcblx0XHRcdFx0XHRcdFx0XHRcdGlucHV0OiBidWYudG9TdHJpbmcoKSxcblx0XHRcdFx0XHRcdFx0XHRcdF9jYWNoZV9rZXlfLFxuXHRcdFx0XHRcdFx0XHRcdFx0X2NhY2hlLFxuXHRcdFx0XHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdFx0XHR9KVxuXHRcdFx0XHRcdFx0O1xuXHRcdFx0XHRcdH0pXG5cdFx0XHRcdFx0LnRhcChhc3luYyAoKSA9PlxuXHRcdFx0XHRcdHtcblxuXHRcdFx0XHRcdFx0bGV0IG1kID0gb3V0cHV0SmEwMDIoe1xuXHRcdFx0XHRcdFx0XHRpbnB1dERhdGE6IF9jYWNoZS5qYTIsXG5cdFx0XHRcdFx0XHR9KTtcblxuXHRcdFx0XHRcdFx0cmV0dXJuIGZzLm91dHB1dEZpbGUocGF0aC5qb2luKHBhdGhfbm92ZWwsICdqYTIubWQnKSwgbWQpXG5cdFx0XHRcdFx0fSlcblx0XHRcdFx0O1xuXG5cdFx0XHRcdHJldHVybiBub3ZlbDtcblx0XHRcdH0pXG5cdFx0XHQ7XG5cdH1cblxuXHRwcm90ZWN0ZWQgYXN5bmMgX291dHB1dEF0dGFjaDxUID0gYW55Pihub3ZlbDogSU5vdmVsLCBvcHRpb25zUnVudGltZTogSU9wdGlvbnNSdW50aW1lLCBfY2FjaGVfOiB7XG5cdFx0dXJsOiBVUkwsXG5cdFx0cGF0aF9ub3ZlbDogc3RyaW5nLFxuXHR9LCAuLi5hcmd2KVxuXHR7XG5cdFx0Y29uc3Qgc2VsZiA9IHRoaXM7XG5cdFx0Y29uc3QgeyB1cmwsIHBhdGhfbm92ZWwgfSA9IF9jYWNoZV87XG5cblx0XHRpZiAobm92ZWwudm9sdW1lX2xpc3QpXG5cdFx0e1xuXHRcdFx0Y29uc3QgeyBrZWVwSW1hZ2UgPSBmYWxzZSB9ID0gb3B0aW9uc1J1bnRpbWU7XG5cblx0XHRcdGNvbnNvbGVEZWJ1Zy5pbmZvKGDmqqLmn6UgQVRUQUNIIOizh+aWmWApO1xuXG5cdFx0XHRyZXR1cm4gUHJvbWlzZUJsdWViaXJkXG5cdFx0XHRcdC5yZXNvbHZlKG5vdmVsLnZvbHVtZV9saXN0KVxuXHRcdFx0XHQuZWFjaCgodm9sdW1lLCB2aWQpID0+XG5cdFx0XHRcdHtcblxuXHRcdFx0XHRcdGxldCBkaXJuYW1lOiBzdHJpbmc7XG5cblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRsZXQgX3ZpZCA9ICcnO1xuXG5cdFx0XHRcdFx0XHRpZiAoIW9wdGlvbnNSdW50aW1lLm5vRGlyUHJlZml4KVxuXHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRfdmlkID0gdmlkLnRvU3RyaW5nKCkucGFkU3RhcnQoNCwgJzAnKSArICcwJztcblx0XHRcdFx0XHRcdFx0X3ZpZCArPSAnXyc7XG5cdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdGRpcm5hbWUgPSBwYXRoLmpvaW4ocGF0aF9ub3ZlbCxcblx0XHRcdFx0XHRcdFx0YCR7X3ZpZH0ke3NlbGYudHJpbUZpbGVuYW1lVm9sdW1lKHZvbHVtZS52b2x1bWVfdGl0bGUpfWAsXG5cdFx0XHRcdFx0XHQpO1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdGxldCBpbWdzOiBzdHJpbmdbXSA9IFtdO1xuXG5cdFx0XHRcdFx0cmV0dXJuIFByb21pc2VCbHVlYmlyZFxuXHRcdFx0XHRcdFx0LnJlc29sdmUodm9sdW1lLmNoYXB0ZXJfbGlzdClcblx0XHRcdFx0XHRcdC5lYWNoKGFzeW5jIChjaGFwdGVyKSA9PlxuXHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRpZiAoY2hhcHRlci5pbWdzKVxuXHRcdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdFx0aW1ncy5wdXNoKC4uLmNoYXB0ZXIuaW1ncyk7XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdH0pXG5cdFx0XHRcdFx0XHQudGFwKGFzeW5jICgpID0+XG5cdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdGltZ3MgPSBpbWdzLmZpbHRlcih2ID0+IHYpO1xuXG5cdFx0XHRcdFx0XHRcdGNvbnNvbGVEZWJ1Zy5kZWJ1ZyhgW0FUVEFDSF1gLCBgJHtwYXRoLnJlbGF0aXZlKHBhdGhfbm92ZWwsIGRpcm5hbWUpfWAsIGltZ3MubGVuZ3RoKTtcblxuXHRcdFx0XHRcdFx0XHRpZiAoaW1ncy5sZW5ndGgpXG5cdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHRsZXQgZmlsZSA9IHBhdGguam9pbihkaXJuYW1lLCAnQVRUQUNILm1kJyk7XG5cblx0XHRcdFx0XHRcdFx0XHRsZXQgbWRfZGF0YSA9IHtcblx0XHRcdFx0XHRcdFx0XHRcdGF0dGFjaDoge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRpbWFnZXM6IHt9IGFzIFJlY29yZDxzdHJpbmcsIHN0cmluZz4sXG5cdFx0XHRcdFx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdFx0XHRcdH07XG5cblx0XHRcdFx0XHRcdFx0XHRpZiAoa2VlcEltYWdlIHx8IDEpXG5cdFx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdFx0YXdhaXQgZnMucmVhZEZpbGUoZmlsZSlcblx0XHRcdFx0XHRcdFx0XHRcdFx0LnRoZW4odiA9PiBtZGNvbmZfcGFyc2UodikpXG5cdFx0XHRcdFx0XHRcdFx0XHRcdC8vIEB0cy1pZ25vcmVcblx0XHRcdFx0XHRcdFx0XHRcdFx0LnRoZW4oKGRhdGE6IHR5cGVvZiBtZF9kYXRhKSA9PlxuXHRcdFx0XHRcdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0ZGF0YS5hdHRhY2ggPSBkYXRhLmF0dGFjaCB8fCB7fSBhcyBhbnk7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0ZGF0YS5hdHRhY2guaW1hZ2VzID0gZGF0YS5hdHRhY2guaW1hZ2VzIHx8IHt9O1xuXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0bWRfZGF0YSA9IGRhdGE7XG5cblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRjb25zb2xlRGVidWcuZGVidWcoYExvYWQgZGF0YSBmcm9tIGV4aXN0cyBBVFRBQ0gubWRgKVxuXHRcdFx0XHRcdFx0XHRcdFx0XHR9KVxuXHRcdFx0XHRcdFx0XHRcdFx0XHQuY2F0Y2goZSA9PiBudWxsKVxuXHRcdFx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0XHRcdG1kX2RhdGEuYXR0YWNoLmltYWdlcyA9IE9iamVjdFxuXHRcdFx0XHRcdFx0XHRcdFx0LmVudHJpZXMoaW1ncyBhcyBzdHJpbmdbXSlcblx0XHRcdFx0XHRcdFx0XHRcdC5yZWR1Y2UoKGEsIFtrLCB2XSkgPT5cblx0XHRcdFx0XHRcdFx0XHRcdHtcblxuXHRcdFx0XHRcdFx0XHRcdFx0XHRpZiAoa2VlcEltYWdlKVxuXHRcdFx0XHRcdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0YVtoYXNoU3VtKHYpXSA9IHY7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0XHRcdFx0ZWxzZVxuXHRcdFx0XHRcdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0YVtrLnRvU3RyaW5nKCkucGFkU3RhcnQoMywgJzAnKV0gPSB2O1xuXHRcdFx0XHRcdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdFx0XHRcdFx0cmV0dXJuIGFcblx0XHRcdFx0XHRcdFx0XHRcdH0sIG1kX2RhdGEuYXR0YWNoLmltYWdlcyk7XG5cblx0XHRcdFx0XHRcdFx0XHRsZXQgbWQgPSBtZGNvbmZfc3RyaW5naWZ5KG1kX2RhdGEpO1xuXG5cdFx0XHRcdFx0XHRcdFx0cmV0dXJuIGZzLm91dHB1dEZpbGUoZmlsZSwgbWQpXG5cdFx0XHRcdFx0XHRcdFx0XHQudGhlbihyID0+XG5cdFx0XHRcdFx0XHRcdFx0XHR7XG5cblx0XHRcdFx0XHRcdFx0XHRcdFx0Y29uc29sZURlYnVnLnN1Y2Nlc3MoYFtBVFRBQ0hdYCwgYFtTQVZFXWAsIGAke3BhdGgucmVsYXRpdmUocGF0aF9ub3ZlbCwgZmlsZSl9YCk7XG5cblx0XHRcdFx0XHRcdFx0XHRcdFx0cmV0dXJuIHI7XG5cdFx0XHRcdFx0XHRcdFx0XHR9KVxuXHRcdFx0XHRcdFx0XHRcdFx0O1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHR9KVxuXHRcdFx0XHR9KVxuXHRcdFx0XHQ7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIFByb21pc2VCbHVlYmlyZC5yZXNvbHZlKClcblx0fVxuXG5cdHByb3RlY3RlZCBhc3luYyBfcHJvY2Vzc05vdmVsPFQgPSBhbnk+KG5vdmVsOiBJTm92ZWwsIG9wdGlvbnNSdW50aW1lOiBJT3B0aW9uc1J1bnRpbWUsIF9jYWNoZV86IHtcblx0XHR1cmw6IFVSTCxcblx0XHRwYXRoX25vdmVsOiBzdHJpbmcsXG5cdH0sIC4uLmFyZ3YpXG5cdHtcblx0XHRjb25zdCBzZWxmID0gdGhpcztcblx0XHRsZXQgaWR4ID0gb3B0aW9uc1J1bnRpbWUuc3RhcnRJbmRleCB8fCAwO1xuXG5cdFx0bGV0IHsgdXJsLCBwYXRoX25vdmVsIH0gPSBfY2FjaGVfO1xuXG5cdFx0cmV0dXJuIFByb21pc2VCbHVlYmlyZFxuXHRcdFx0Lm1hcFNlcmllcyhub3ZlbC52b2x1bWVfbGlzdCwgKHZvbHVtZSwgdmlkKSA9PlxuXHRcdFx0e1xuXHRcdFx0XHRsZXQgZGlybmFtZTogc3RyaW5nO1xuXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRsZXQgX3ZpZCA9ICcnO1xuXG5cdFx0XHRcdFx0aWYgKCFvcHRpb25zUnVudGltZS5ub0RpclByZWZpeClcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRfdmlkID0gdmlkLnRvU3RyaW5nKCkucGFkU3RhcnQoNCwgJzAnKSArICcwJztcblx0XHRcdFx0XHRcdF92aWQgKz0gJ18nO1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdGRpcm5hbWUgPSBwYXRoLmpvaW4ocGF0aF9ub3ZlbCxcblx0XHRcdFx0XHRcdGAke192aWR9JHtzZWxmLnRyaW1GaWxlbmFtZVZvbHVtZSh2b2x1bWUudm9sdW1lX3RpdGxlKX1gLFxuXHRcdFx0XHRcdCk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRjb25zb2xlRGVidWcuZGVidWcodmlkLCB2b2x1bWUudm9sdW1lX3RpdGxlKTtcblxuXHRcdFx0XHRpZiAoIW9wdGlvbnNSdW50aW1lLm5vRmlyZVByZWZpeCAmJiBvcHRpb25zUnVudGltZS5maWxlUHJlZml4TW9kZSA+PSAyKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0bGV0IGk6IG51bWJlcjtcblxuXHRcdFx0XHRcdGxldCBib29sID0gdm9sdW1lLmNoYXB0ZXJfbGlzdC5ldmVyeShmdW5jdGlvbiAoY2hhcHRlciwgailcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRsZXQgbSA9IChvcHRpb25zUnVudGltZS5maWxlUHJlZml4TW9kZSA+IDMgP1xuXHRcdFx0XHRcdFx0XHRcdGNoYXB0ZXIuY2hhcHRlcl90aXRsZSA6IG5vcm1hbGl6ZV92YWwoY2hhcHRlci5jaGFwdGVyX3RpdGxlKVxuXHRcdFx0XHRcdFx0XHQpXG5cdFx0XHRcdFx0XHRcdC5yZXBsYWNlKC9eXFxEKy8sICcnKVxuXHRcdFx0XHRcdFx0XHQvLy5yZXBsYWNlKC9eKFxcZCspLiskLywgJyQxJylcblx0XHRcdFx0XHRcdFx0LnJlcGxhY2UoL14oXFxkKylcXEQuKiQvLCAnJDEnKVxuXHRcdFx0XHRcdFx0O1xuXG5cdFx0XHRcdFx0XHQvL2NvbnNvbGUubG9nKG0sIGNoYXB0ZXIuY2hhcHRlcl90aXRsZSk7XG5cblx0XHRcdFx0XHRcdGlmICgvXlxcZCskLy50ZXN0KG0pKVxuXHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRsZXQgbTIgPSBwYXJzZUludChtKTtcblxuXHRcdFx0XHRcdFx0XHRpZiAoaiA9PSAwKVxuXHRcdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdFx0aSA9IG0yO1xuXG5cdFx0XHRcdFx0XHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0ZWxzZSBpZiAobTIgPT09ICsraSlcblx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdHJldHVybiB0cnVlO1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdFx0XHR9KTtcblxuXHRcdFx0XHRcdC8vY29uc29sZS5sb2coYm9vbCk7XG5cblx0XHRcdFx0XHRpZiAoYm9vbClcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHR2b2x1bWUuY2hhcHRlcl9saXN0LmZvckVhY2goZnVuY3Rpb24gKGNoYXB0ZXIpXG5cdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdGNoYXB0ZXIuY2hhcHRlcl9pbmRleCA9ICcnO1xuXHRcdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cblx0XHRcdFx0aWYgKG9wdGlvbnNSdW50aW1lLmV2ZW50KVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0c2VsZi5lbWl0KG9wdGlvbnNSdW50aW1lLmV2ZW50LCAndm9sdW1lJywgdm9sdW1lLCB7XG5cdFx0XHRcdFx0XHRvcHRpb25zUnVudGltZSxcblx0XHRcdFx0XHRcdGRpcm5hbWUsXG5cdFx0XHRcdFx0XHR2aWQsXG5cdFx0XHRcdFx0XHRub3ZlbCxcblx0XHRcdFx0XHRcdHVybCxcblx0XHRcdFx0XHR9KTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdHJldHVybiBQcm9taXNlQmx1ZWJpcmRcblx0XHRcdFx0XHQubWFwU2VyaWVzKHZvbHVtZS5jaGFwdGVyX2xpc3QsIGFzeW5jIChjaGFwdGVyLCBjaWQpID0+XG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0Ly9jaGFwdGVyLmNoYXB0ZXJfaW5kZXggPSAoaWR4KyspO1xuXG5cdFx0XHRcdFx0XHRjb25zdCBjdXJyZW50X2lkeCA9IGlkeCsrO1xuXG5cdFx0XHRcdFx0XHRsZXQgZmlsZSA9IGdldEZpbGVQYXRoKHNlbGYsIHtcblx0XHRcdFx0XHRcdFx0Y2hhcHRlciwgY2lkLFxuXHRcdFx0XHRcdFx0XHRleHQ6ICcudHh0JyxcblxuXHRcdFx0XHRcdFx0XHRpZHg6IGN1cnJlbnRfaWR4LFxuXG5cdFx0XHRcdFx0XHRcdGRpcm5hbWUsXG5cdFx0XHRcdFx0XHRcdHZvbHVtZSwgdmlkLFxuXHRcdFx0XHRcdFx0fSwgb3B0aW9uc1J1bnRpbWUpO1xuXG5cdFx0XHRcdFx0XHRpZiAoc2VsZi5fY2hlY2tFeGlzdHMob3B0aW9uc1J1bnRpbWUsIGZpbGUpKVxuXHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRjb25zb2xlRGVidWcuZGVidWcoYFtTS0lQXWAsIHZpZCwgY2lkLCBjaGFwdGVyLmNoYXB0ZXJfdGl0bGUpO1xuXG5cdFx0XHRcdFx0XHRcdHJldHVybiBmaWxlO1xuXHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHRsZXQgdXJsID0gc2VsZi5fY3JlYXRlQ2hhcHRlclVybCh7XG5cdFx0XHRcdFx0XHRcdG5vdmVsLFxuXHRcdFx0XHRcdFx0XHR2b2x1bWUsXG5cdFx0XHRcdFx0XHRcdGNoYXB0ZXIsXG5cdFx0XHRcdFx0XHR9LCBvcHRpb25zUnVudGltZSk7XG5cblx0XHRcdFx0XHRcdGNvbnNvbGVEZWJ1Zy5kZWJ1Zyh2aWQsIGNpZCwgY2hhcHRlci5jaGFwdGVyX3RpdGxlKTtcblx0XHRcdFx0XHRcdC8vY29uc29sZURlYnVnLmRlYnVnKHVybC50b1N0cmluZygpKTtcblxuXHRcdFx0XHRcdFx0YXdhaXQgc2VsZi5fZmV0Y2hDaGFwdGVyTWFpbih7XG5cdFx0XHRcdFx0XHRcdFx0dXJsLFxuXHRcdFx0XHRcdFx0XHRcdGZpbGUsXG5cdFx0XHRcdFx0XHRcdFx0dm9sdW1lLFxuXHRcdFx0XHRcdFx0XHRcdGNoYXB0ZXIsXG5cdFx0XHRcdFx0XHRcdH0sIG9wdGlvbnNSdW50aW1lLCB7XG5cdFx0XHRcdFx0XHRcdFx0bm92ZWwsXG5cdFx0XHRcdFx0XHRcdH0pXG5cblx0XHRcdFx0XHRcdFx0LnRoZW4oYXN5bmMgKHRleHQ6IHN0cmluZykgPT5cblx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdGF3YWl0IHRoaXMuX3NhdmVGaWxlKHtcblx0XHRcdFx0XHRcdFx0XHRcdGZpbGUsXG5cdFx0XHRcdFx0XHRcdFx0XHRjb250ZXh0OiB0ZXh0LFxuXHRcdFx0XHRcdFx0XHRcdFx0b3B0aW9uc1J1bnRpbWUsXG5cdFx0XHRcdFx0XHRcdFx0fSk7XG5cblx0XHRcdFx0XHRcdFx0XHRyZXR1cm4gdGV4dDtcblx0XHRcdFx0XHRcdFx0fSlcblx0XHRcdFx0XHRcdDtcblxuXHRcdFx0XHRcdFx0cmV0dXJuIGZpbGU7XG5cdFx0XHRcdFx0fSlcblx0XHRcdFx0XHQ7XG5cdFx0XHR9KVxuXHRcdFx0LnRoZW4oZnVuY3Rpb24gKHJldClcblx0XHRcdHtcblx0XHRcdFx0cmV0dXJuIHJldCBhcyBhbnkgYXMgVDtcblx0XHRcdH0pXG5cdFx0XHQ7XG5cdH1cblxuXHRwcm9jZXNzTm92ZWw8VD4obm92ZWw6IElOb3ZlbCwgb3B0aW9uc1J1bnRpbWU6IElPcHRpb25zUnVudGltZSwgX2NhY2hlXzoge1xuXHRcdHVybDogVVJMLFxuXHRcdHBhdGhfbm92ZWw6IHN0cmluZyxcblx0fSwgLi4uYXJndilcblx0e1xuXHRcdC8vIEB0cy1pZ25vcmVcblx0XHRsZXQgcHI6IGFueTtcblxuXHRcdGNvbnNvbGVEZWJ1Zy5pbmZvKCfplovlp4vomZXnkIblsI/oqqonKTtcblxuXHRcdHByID0gb3B0aW9uc1J1bnRpbWUuZmV0Y2hNZXRhRGF0YU9ubHkgPyBbXSA6IHRoaXMuX3Byb2Nlc3NOb3ZlbDxUPihub3ZlbCwgb3B0aW9uc1J1bnRpbWUsIF9jYWNoZV8sIC4uLmFyZ3YpO1xuXG5cdFx0cmV0dXJuIFByb21pc2VCbHVlYmlyZFxuXHRcdFx0LnJlc29sdmUocHIpXG5cdFx0XHQudGhlbihmdW5jdGlvbiAocmV0OiBUKVxuXHRcdFx0e1xuXHRcdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHRcdG5vdmVsLFxuXHRcdFx0XHRcdG9wdGlvbnNSdW50aW1lLFxuXHRcdFx0XHRcdF9jYWNoZV8sXG5cdFx0XHRcdFx0cmV0LFxuXHRcdFx0XHR9O1xuXHRcdFx0fSlcblx0XHRcdDtcblx0fVxuXG5cdHByb3RlY3RlZCBfc3RyaXBDb250ZW50KHRleHQ6IHN0cmluZylcblx0e1xuXHRcdHJldHVybiB0ZXh0O1xuXHR9XG5cblx0cHJvdGVjdGVkIF9wYXJzZUNoYXB0ZXI8VD4ocmV0OiBJRmV0Y2hDaGFwdGVyLCBvcHRpb25zUnVudGltZTogVCAmIElPcHRpb25zUnVudGltZSwgY2FjaGU6IHtcblx0XHRmaWxlOiBzdHJpbmcsXG5cdFx0bm92ZWw6IF9Ob3ZlbFNpdGUuSU5vdmVsLFxuXHRcdHZvbHVtZTogX05vdmVsU2l0ZS5JVm9sdW1lLFxuXHRcdGNoYXB0ZXI6IF9Ob3ZlbFNpdGUuSUNoYXB0ZXIsXG5cdFx0ZG9SZXRyeTogbnVtYmVyLFxuXHR9KTogc3RyaW5nIHwgUHJvbWlzZTxzdHJpbmc+XG5cdHtcblx0XHRpZiAoIXJldClcblx0XHR7XG5cdFx0XHRyZXR1cm4gJyc7XG5cdFx0fVxuXG5cdFx0dGhyb3cgbmV3IFN5bnRheEVycm9yKGBGdW5jdGlvbiBub3QgaW1wbGVtZW50ZWRgKTtcblx0fVxuXG5cdHByb3RlY3RlZCBfZmV0Y2hDaGFwdGVyUmV0cnlFcnJvcjxUPihtZXNzYWdlOiBzdHJpbmcsIHJldDogSUZldGNoQ2hhcHRlciwgb3B0aW9uc1J1bnRpbWU6IFQgJiBJT3B0aW9uc1J1bnRpbWUsIGNhY2hlOiB7XG5cdFx0ZmlsZTogc3RyaW5nLFxuXHRcdG5vdmVsOiBfTm92ZWxTaXRlLklOb3ZlbCxcblx0XHR2b2x1bWU6IF9Ob3ZlbFNpdGUuSVZvbHVtZSxcblx0XHRjaGFwdGVyOiBfTm92ZWxTaXRlLklDaGFwdGVyLFxuXHRcdGRvUmV0cnk6IG51bWJlcixcblx0fSk6IEVycm9yICYge1xuXHRcdGRvUmV0cnk6IG51bWJlclxuXHR9XG5cdHtcblx0XHRsZXQgZTogRXJyb3IgJiB7XG5cdFx0XHRkb1JldHJ5OiBudW1iZXJcblx0XHR9ID0gbmV3IEVycm9yKG1lc3NhZ2UpIGFzIGFueTtcblxuXHRcdGUuZG9SZXRyeSA9IChjYWNoZS5kb1JldHJ5IHwgMCkgKyAxO1xuXG5cdFx0cmV0dXJuIGVcblx0fVxuXG5cdHByb3RlY3RlZCBfZmV0Y2hDaGFwdGVyTWFpbjxUPihhcmd2OiB7XG5cdFx0dXJsOiBVUkwsXG5cdFx0ZmlsZTogc3RyaW5nLFxuXHRcdHZvbHVtZTogX05vdmVsU2l0ZS5JVm9sdW1lLFxuXHRcdGNoYXB0ZXI6IF9Ob3ZlbFNpdGUuSUNoYXB0ZXIsXG5cdH0sIG9wdGlvbnNSdW50aW1lOiBUICYgSU9wdGlvbnNSdW50aW1lLCBfY2FjaGVfOiB7XG5cdFx0bm92ZWw6IElOb3ZlbCxcblx0fSlcblx0e1xuXHRcdGNvbnN0IHNlbGYgPSB0aGlzO1xuXG5cdFx0bGV0IHsgdXJsLCBmaWxlLCB2b2x1bWUsIGNoYXB0ZXIgfSA9IGFyZ3Y7XG5cdFx0bGV0IHsgbm92ZWwgfSA9IF9jYWNoZV87XG5cblx0XHRyZXR1cm4gUHJvbWlzZUJsdWViaXJkLnJlc29sdmUoKVxuXHRcdFx0LnRoZW4oYXN5bmMgKCkgPT5cblx0XHRcdHtcblx0XHRcdFx0bGV0IF9kbyA9IGZhbHNlO1xuXHRcdFx0XHRsZXQgZG9SZXRyeSA9IDA7XG5cdFx0XHRcdGxldCB2YWx1ZTogc3RyaW5nO1xuXHRcdFx0XHRkb1xuXHRcdFx0XHR7XG5cdFx0XHRcdFx0X2RvID0gZmFsc2U7XG5cblx0XHRcdFx0XHR2YWx1ZSA9IGF3YWl0IHNlbGYuX2ZldGNoQ2hhcHRlcih1cmwsIG9wdGlvbnNSdW50aW1lLCB7XG5cdFx0XHRcdFx0XHRcdG5vdmVsLFxuXHRcdFx0XHRcdFx0fSlcblx0XHRcdFx0XHRcdC50aGVuKGFzeW5jIChyZXQpID0+XG5cdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdHJldHVybiBzZWxmLl9wYXJzZUNoYXB0ZXIocmV0LCBvcHRpb25zUnVudGltZSwge1xuXHRcdFx0XHRcdFx0XHRcdGZpbGUsXG5cdFx0XHRcdFx0XHRcdFx0bm92ZWwsXG5cdFx0XHRcdFx0XHRcdFx0dm9sdW1lLFxuXHRcdFx0XHRcdFx0XHRcdGNoYXB0ZXIsXG5cdFx0XHRcdFx0XHRcdFx0ZG9SZXRyeSxcblx0XHRcdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0XHR9KVxuXHRcdFx0XHRcdFx0LmNhdGNoKGFzeW5jIChlOiBFcnJvciAmIHtcblx0XHRcdFx0XHRcdFx0ZG9SZXRyeTogbnVtYmVyXG5cdFx0XHRcdFx0XHR9KSA9PlxuXHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRpZiAoZS5kb1JldHJ5ID4gMCAmJiBlLmRvUmV0cnkgPCA1KVxuXHRcdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdFx0X2RvID0gdHJ1ZTtcblx0XHRcdFx0XHRcdFx0XHRkb1JldHJ5ID0gZS5kb1JldHJ5IHwgMDtcblx0XHRcdFx0XHRcdFx0XHRsZXQgZGVsYXkgPSA1MDAwICsgZG9SZXRyeSAqIDEwMDAgKyAoYXJndi52b2x1bWUudm9sdW1lX2luZGV4IGFzIGFueSB8IDAgKyAgYXJndi5jaGFwdGVyLmNoYXB0ZXJfaW5kZXggYXMgYW55IHwgMCkgKiAxMDtcblxuXHRcdFx0XHRcdFx0XHRcdGNvbnNvbGUud2FybihlLm1lc3NhZ2UsIGRvUmV0cnksIGRlbGF5KTtcblxuXHRcdFx0XHRcdFx0XHRcdGF3YWl0IFByb21pc2VCbHVlYmlyZC5kZWxheShkZWxheSk7XG5cblx0XHRcdFx0XHRcdFx0XHRyZXR1cm5cblx0XHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHRcdHJldHVybiBQcm9taXNlLnJlamVjdChlKVxuXHRcdFx0XHRcdFx0fSlcblxuXHRcdFx0XHR9XG5cdFx0XHRcdHdoaWxlIChfZG8pO1xuXG5cdFx0XHRcdHJldHVybiB2YWx1ZVxuXHRcdFx0fSlcblx0XHRcdC50aGVuKGZ1bmN0aW9uICh0ZXh0KVxuXHRcdFx0e1xuXHRcdFx0XHRpZiAodHlwZW9mIHRleHQgPT0gJ3N0cmluZycpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRyZXR1cm4gbm92ZWxUZXh0LnRvU3RyKHRleHQpO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0cmV0dXJuIHRleHQ7XG5cdFx0XHR9KVxuXHRcdFx0O1xuXHR9XG5cblx0cHJvdGVjdGVkIF9mZXRjaENoYXB0ZXI8VD4odXJsOiBVUkwsIG9wdGlvbnNSdW50aW1lOiBUICYgSU9wdGlvbnNSdW50aW1lLCBfY2FjaGVfOiB7XG5cdFx0bm92ZWw6IElOb3ZlbCxcblx0fSlcblx0e1xuXHRcdHJldHVybiBQcm9taXNlQmx1ZWJpcmQucmVzb2x2ZSgpLnRoZW4oYXN5bmMgZnVuY3Rpb24gKClcblx0XHR7XG5cdFx0XHRjb25zb2xlRGVidWcuZGVidWcoYGZldGNoQ2hhcHRlcmAsIHVybC50b1N0cmluZygpKTtcblxuXHRcdFx0bGV0IHJldCA9IHt9IGFzIElGZXRjaENoYXB0ZXI7XG5cblx0XHRcdGxldCBvcHRzID0gZ2V0T3B0aW9ucyhvcHRpb25zUnVudGltZSk7XG5cblx0XHRcdGlmIChvcHRpb25zUnVudGltZS5kaXNhYmxlRG93bmxvYWQpXG5cdFx0XHR7XG5cdFx0XHRcdHJldHVybiBudWxsO1xuXHRcdFx0fVxuXHRcdFx0ZWxzZSBpZiAodHJ1ZSlcblx0XHRcdHtcblx0XHRcdFx0aWYgKG9wdGlvbnNSdW50aW1lLnJldHJ5RGVsYXkgPiAwKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdFx0XHRcdG9wdHMucmVxdWVzdE9wdGlvbnMuZGVsYXkgPSBvcHRpb25zUnVudGltZS5yZXRyeURlbGF5O1xuXHRcdFx0XHR9XG5cdFx0XHRcdGVsc2Vcblx0XHRcdFx0e1xuXHRcdFx0XHRcdC8vIEB0cy1pZ25vcmVcblx0XHRcdFx0XHRvcHRzLnJlcXVlc3RPcHRpb25zLnJldHJ5ID0gMTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGF3YWl0IHJldHJ5UmVxdWVzdCh1cmwsIG9wdHMucmVxdWVzdE9wdGlvbnMpXG5cdFx0XHRcdFx0LnRoZW4oZnVuY3Rpb24gKHJlcylcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRjb25zdCBjb250ZW50VHlwZVBhcnNlZCA9IHBhcnNlQ29udGVudFR5cGUocmVzLmhlYWRlcnNbXCJjb250ZW50LXR5cGVcIl0pO1xuXG5cdFx0XHRcdFx0XHRyZXQuY29udGVudFR5cGVQYXJzZWQgPSBjb250ZW50VHlwZVBhcnNlZDtcblxuXHRcdFx0XHRcdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdFx0XHRcdFx0cmV0LnVybCA9IHVybDtcblxuXHRcdFx0XHRcdFx0aWYgKGNvbnRlbnRUeXBlUGFyc2VkLmlzSFRNTCgpIHx8IGNvbnRlbnRUeXBlUGFyc2VkLmlzWE1MKCkpXG5cdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdHJldC5kb20gPSByZXF1ZXN0VG9KU0RPTShyZXMsIHVybCwgb3B0aW9uc1J1bnRpbWUub3B0aW9uc0pTRE9NKTtcblx0XHRcdFx0XHRcdFx0cmV0LmRvbSA9IHBhY2tKU0RPTShyZXQuZG9tKTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdGVsc2UgaWYgKGNvbnRlbnRUeXBlUGFyc2VkLnN1YnR5cGUgPT0gJ2pzb24nKVxuXHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRyZXQuanNvbiA9IEpTT04ucGFyc2UocmVzLmJvZHkudG9TdHJpbmcoKSk7XG5cdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdHJldC5yZXMgPSByZXM7XG5cdFx0XHRcdFx0XHRyZXQuYm9keSA9IHJlcy5ib2R5O1xuXHRcdFx0XHRcdH0pXG5cdFx0XHRcdDtcblx0XHRcdH1cblx0XHRcdGVsc2Vcblx0XHRcdHtcblx0XHRcdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdFx0XHRyZXQuZG9tID0gYXdhaXQgZnJvbVVSTCh1cmwsIG9wdGlvbnNSdW50aW1lLm9wdGlvbnNKU0RPTSk7XG5cblx0XHRcdFx0cmV0LnJlcyA9IHJldC5kb20uX29wdGlvbnMuUmVzcG9uc2U7XG5cdFx0XHRcdHJldC5ib2R5ID0gcmV0LmRvbS5fb3B0aW9ucy5ib2R5O1xuXHRcdFx0fVxuXG5cdFx0XHRyZXR1cm4gcmV0O1xuXHRcdH0pO1xuXHR9XG5cblx0cHJvdGVjdGVkIF9leHBvcnREb3dubG9hZE9wdGlvbnM8VCA9IElPcHRpb25zUnVudGltZT4ob3B0aW9uc1J1bnRpbWU/OiBUICYgSU9wdGlvbnNSdW50aW1lKTogUGFydGlhbDxUICYgSU9wdGlvbnNSdW50aW1lPlxuXHR7XG5cdFx0bGV0IG9wdHM6IFBhcnRpYWw8VCAmIElPcHRpb25zUnVudGltZT4gPSB7fTtcblxuXHRcdGlmIChvcHRpb25zUnVudGltZSlcblx0XHR7XG5cdFx0XHRsZXQgYm9vbDogYm9vbGVhbjtcblxuXHRcdFx0Zm9yIChsZXQgayBvZiBbXG5cdFx0XHRcdCdub0ZpcmVQcmVmaXgnLFxuXHRcdFx0XHQnbm9GaWxlUGFkZW5kJyxcblx0XHRcdFx0J2ZpbGVQcmVmaXhNb2RlJyxcblx0XHRcdFx0J3N0YXJ0SW5kZXgnLFxuXHRcdFx0XHQna2VlcFJ1YnknLFxuXHRcdFx0XHQna2VlcEZvcm1hdCcsXG5cdFx0XHRcdCdrZWVwSW1hZ2UnLFxuXHRcdFx0XHQnYWxsb3dFbXB0eVZvbHVtZVRpdGxlJyxcblx0XHRcdFx0J2Rpc2FibGVPdXRwdXREaXJQcmVmaXgnLFxuXHRcdFx0XSBhcyAoa2V5b2YgSU9wdGlvbnNSdW50aW1lKVtdKVxuXHRcdFx0e1xuXHRcdFx0XHRpZiAoKGsgaW4gb3B0aW9uc1J1bnRpbWUpICYmIHR5cGVvZiBvcHRpb25zUnVudGltZVtrXSAhPT0gJ3VuZGVmaW5lZCcpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRib29sID0gdHJ1ZTtcblx0XHRcdFx0XHQvLyBAdHMtaWdub3JlXG5cdFx0XHRcdFx0b3B0c1trXSA9IG9wdGlvbnNSdW50aW1lW2tdO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0cmV0dXJuIG9wdHM7XG5cdH1cblxuXHRwcm90ZWN0ZWQgX3NhdmVSZWFkbWUob3B0aW9uc1J1bnRpbWU6IElPcHRpb25zUnVudGltZSwgb3B0aW9ucyA9IHt9LCAuLi5vcHRzKVxuXHR7XG5cdFx0aWYgKHRoaXMuSURLRVkpXG5cdFx0e1xuXHRcdFx0b3B0aW9uc1t0aGlzLklES0VZXSA9IG9wdGlvbnNbdGhpcy5JREtFWV0gfHwge307XG5cblx0XHRcdHRyeVxuXHRcdFx0e1xuXHRcdFx0XHRvcHRpb25zW3RoaXMuSURLRVldLm5vdmVsX2lkID0gb3B0aW9uc1t0aGlzLklES0VZXS5ub3ZlbF9pZCB8fCBvcHRpb25zUnVudGltZVtTWU1CT0xfQ0FDSEVdLm5vdmVsLnVybF9kYXRhLm5vdmVsX2lkO1xuXHRcdFx0fVxuXHRcdFx0Y2F0Y2ggKGUpXG5cdFx0XHR7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0bGV0IGRvd25sb2FkT3B0aW9ucyA9IHRoaXMuX2V4cG9ydERvd25sb2FkT3B0aW9ucyhvcHRpb25zUnVudGltZSk7XG5cblx0XHRyZXR1cm4gc3VwZXIuX3NhdmVSZWFkbWUob3B0aW9uc1J1bnRpbWUsIG9wdGlvbnMsIHtcblx0XHRcdG9wdGlvbnM6IHtcblx0XHRcdFx0dGV4dGxheW91dDoge1xuXHRcdFx0XHRcdGFsbG93X2xmMjogdHJ1ZSxcblx0XHRcdFx0fSxcblx0XHRcdFx0ZG93bmxvYWRPcHRpb25zOiBkb3dubG9hZE9wdGlvbnMgfHwge30sXG5cdFx0XHR9LFxuXHRcdH0sIC4uLm9wdHMpO1xuXHR9XG5cblx0cHJvdGVjdGVkIF9nZXRfbWV0YShpbnB1dFVybCwgb3B0aW9uc1J1bnRpbWUsIGNhY2hlPzoge1xuXHRcdGRvbT86IElKU0RPTSxcblx0fSlcblx0e1xuXHRcdHRocm93IG5ldyBTeW50YXhFcnJvcigpO1xuXHR9XG5cbn1cblxuZXhwb3J0IGNvbnN0IE5vdmVsU2l0ZSA9IE5vdmVsU2l0ZURlbW8gYXMgdHlwZW9mIE5vdmVsU2l0ZURlbW87XG5cbmV4cG9ydCBkZWZhdWx0IE5vdmVsU2l0ZURlbW87XG4iXX0=