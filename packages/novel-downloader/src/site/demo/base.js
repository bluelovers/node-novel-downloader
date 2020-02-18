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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFzZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImJhc2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFBQSx1Q0FBMkM7QUFDM0MsK0JBQWdDO0FBQ2hDLCtCQUFnQztBQUVoQyw2Q0FBMEY7QUFDMUYsa0NBQWtDO0FBQ2xDLDhCQUFvQztBQUVwQyx1Q0FBeUM7QUFDekMseURBQTZEO0FBQzdELDJDQUFrRDtBQUNsRCxpRUFNcUM7QUFDckMsMkRBQWlGO0FBR2pGLG9DQUEyRjtBQUMzRixvQ0FBMkM7QUFFM0Msd0RBQXlEO0FBQ3pELDJDQUFtQztBQUVuQyw2Q0FBd0Q7QUFFeEQsNkNBQTBDO0FBRTFDLHFDQUErRTtBQVcvRSx3Q0FBdUU7QUFDdkUsMENBQTBDO0FBaUIxQztJQUFBLElBQWEsYUFBYSxHQUExQixNQUFhLGFBQWMsU0FBUSxlQUFVO1FBSTVDLFlBQVksT0FBeUIsRUFBRSxHQUFHLElBQUk7WUFFN0MsS0FBSyxDQUFDLE9BQU8sRUFBRSxHQUFHLElBQUksQ0FBQyxDQUFDO1FBQ3pCLENBQUM7UUFFRDs7Ozs7OztXQU9HO1FBQ0gsZ0JBQWdCLENBQW1CLElBQU8sRUFBRSxpQkFBa0MsRUFBRTtZQUUvRSxPQUFPLElBQUksQ0FBQztRQUNiLENBQUM7UUFFRCxPQUFPLENBQXNCLGNBQTZDLEVBQUUsR0FBUSxFQUFFLE1BQWU7WUFFcEcsS0FBSyxDQUFDLE9BQU8sQ0FBQyxjQUFjLEVBQUUsR0FBRyxDQUFDLENBQUM7WUFFbkMsSUFBSSxjQUFjLENBQUMsV0FBVyxJQUFJLE1BQU0sQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLFdBQVcsQ0FBQyxDQUFDLE1BQU0sRUFDaEY7Z0JBQ0MsTUFBTSxDQUFDLE9BQU8sQ0FBQyxjQUFjLENBQUMsV0FBVyxDQUFDO3FCQUN4QyxPQUFPLENBQUMsVUFBVSxJQUFJO29CQUV0QixJQUFJLENBQXdCLENBQUM7b0JBQzdCLElBQUksS0FBSyxHQUFHLE9BQU8sSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUUzQixJQUFJLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxLQUFLLElBQUksUUFBUSxFQUNoQzt3QkFDQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO3FCQUNaO3lCQUNJLElBQUksS0FBSyxLQUFLLElBQUksSUFBSSxLQUFLLElBQUksUUFBUSxFQUM1Qzt3QkFDQyxJQUFJLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHLElBQUksQ0FBQzt3QkFFeEIsQ0FBQyxHQUFHOzRCQUNILEdBQUc7NEJBQ0gsS0FBSzt5QkFDTCxDQUFDO3FCQUNGO3lCQUVEO3dCQUNDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7cUJBQ1o7b0JBRUQsSUFBSSxDQUFDLEVBQ0w7d0JBRUMsSUFBSSxPQUFPLENBQUMsSUFBSSxRQUFRLEVBQ3hCOzRCQUNDLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxFQUNYO2dDQUNDLENBQUMsQ0FBQyxJQUFJLEdBQUcsR0FBRyxDQUFDOzZCQUNiOzRCQUVELElBQUksQ0FBQyxDQUFDLFFBQVEsSUFBSSxJQUFJLEVBQ3RCO2dDQUNDLENBQUMsQ0FBQyxRQUFRLEdBQUcsS0FBSyxDQUFDOzZCQUNuQjt5QkFDRDt3QkFFRCxJQUFJLENBQUMsQ0FBQyxPQUFPLENBQUMsS0FBSyxRQUFRLElBQUksQ0FBQyxZQUFZLHdCQUFVLElBQUksQ0FBQyxZQUFZLHlCQUFXLENBQUMsTUFBTSxDQUFDLEVBQzFGOzRCQUNDLGFBQWE7NEJBQ2IsQ0FBQyxHQUFHLElBQUkseUJBQVcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUE7eUJBQzdCO3dCQUVELGNBQWMsQ0FBQyxZQUFZLENBQUMsU0FBUzs2QkFDbkMsYUFBYSxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsSUFBSSxDQUFDLENBQzNCO3dCQUVELElBQUksT0FBTyxDQUFDLElBQUksUUFBUSxJQUFJLENBQUMsQ0FBQyxDQUFDLE1BQU0sRUFDckM7NEJBQ0MsSUFBSSxNQUFNLEVBQ1Y7Z0NBQ0MsQ0FBQyxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUM7NkJBQ2xCO2lDQUNJLElBQUksR0FBRyxJQUFJLEdBQUcsQ0FBQyxJQUFJLEVBQ3hCO2dDQUNDLENBQUMsQ0FBQyxNQUFNLEdBQUcsR0FBRyxDQUFDLElBQUksQ0FBQzs2QkFDcEI7NEJBRUQsSUFDQTtnQ0FDQyxjQUFjLENBQUMsWUFBWSxDQUFDLFNBQVM7cUNBQ25DLGFBQWEsQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUMzQjs2QkFDRDs0QkFDRCxPQUFPLENBQUMsRUFDUjs2QkFFQzt5QkFDRDtxQkFDRDtnQkFDRixDQUFDLENBQUMsQ0FDRjtnQkFFRCxrQkFBWSxDQUFDLEtBQUssQ0FBQyxTQUFTLEVBQUUsY0FBYyxDQUFDLFlBQVksQ0FBQyxTQUFTLENBQUMsQ0FBQzthQUNyRTtZQUVELE9BQU8sSUFBSSxDQUFDO1FBQ2IsQ0FBQztRQUVELFFBQVEsQ0FBQyxRQUFzQixFQUFFLGtCQUFvQyxFQUFFO1lBRXRFLE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQztZQUNsQixJQUFJLEdBQUcsR0FBRyxRQUFlLENBQUM7WUFFMUIsTUFBTSxDQUFDLGVBQWUsRUFBRSxjQUFjLENBQUMsR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFxQyxlQUFlLENBQUMsQ0FBQztZQUVqSCxrQkFBWSxDQUFDLE9BQU8sR0FBRyxjQUFjLENBQUMsUUFBUSxDQUFDO1lBRS9DLE9BQU8sdUJBQWU7aUJBQ3BCLElBQUksQ0FBQyxJQUFJLENBQUM7aUJBQ1YsSUFBSSxDQUFDLEtBQUssSUFBSSxFQUFFO2dCQUVoQixHQUFHLEdBQUcsTUFBTSxJQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsRUFBRSxjQUFjLENBQUMsQ0FBQztnQkFFcEQsSUFBSSxDQUFDLE9BQU8sQ0FBQyxjQUFjLEVBQUUsR0FBRyxDQUFDLENBQUM7Z0JBRWxDLGtCQUFZLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxHQUFHLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQztnQkFFNUMsSUFBSSxLQUFLLEdBQUcsTUFBTSxJQUFJLENBQUMsZUFBZSxDQUFxQyxHQUFHLEVBQUUsY0FBYyxDQUFDLENBQUM7Z0JBRWhHLElBQUksVUFBVSxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsZUFBZSxFQUFFLEtBQUssRUFBRSxjQUFjLENBQUMsQ0FBQztnQkFFM0UsSUFBSSxDQUFDLGVBQWUsQ0FBQyxHQUFHLEVBQUUsY0FBYyxFQUFFLEtBQUssRUFBRSxVQUFVLENBQUMsQ0FBQztnQkFFN0QsSUFBSSxHQUFHLEdBQUcsY0FBYyxDQUFDLFVBQVUsSUFBSSxDQUFDLENBQUM7Z0JBRXpDLGNBQWMsQ0FBQyxvQkFBWSxDQUFDLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQztnQkFDM0MsY0FBYyxDQUFDLG9CQUFZLENBQUMsQ0FBQyxVQUFVLEdBQUcsVUFBVSxDQUFDO2dCQUVyRCxNQUFNLHVCQUFlO3FCQUNuQixPQUFPLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxLQUFLLEVBQUUsY0FBYyxFQUFFO29CQUNqRCxHQUFHO29CQUNILFVBQVU7aUJBQ1YsQ0FBQyxDQUFDO3FCQUNGLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRTtvQkFFVCxPQUFPLElBQUksQ0FBQyxhQUFhLENBQUMsS0FBSyxFQUFFLGNBQWMsRUFBRTt3QkFDaEQsR0FBRzt3QkFDSCxVQUFVO3FCQUNWLENBQUMsQ0FBQTtnQkFDSCxDQUFDLENBQUM7cUJBQ0QsR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFO29CQUVULElBQUksSUFBSSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUM5QixHQUFHLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUFDLElBQUksS0FBSyxDQUFDLFFBQVEsQ0FBQyxRQUFRLE9BQU8sQ0FDN0UsQ0FDRDtvQkFFRCxPQUFPLEVBQUUsQ0FBQyxVQUFVLENBQUMsSUFBSSxFQUFFLEtBQUssRUFBRTt3QkFDakMsTUFBTSxFQUFFLElBQUk7cUJBQ1osQ0FBQyxDQUFDO2dCQUNKLENBQUMsQ0FBQyxDQUNGO2dCQUVELE1BQU0sSUFBSSxDQUFDLFdBQVcsQ0FBQyxjQUFjLENBQUMsQ0FBQztnQkFFdkMsSUFBSSxNQUFNLEdBQUcsNEJBQVUsRUFBRSxDQUFDO2dCQUUxQixNQUFNLGVBQVcsQ0FBQztvQkFDakIsVUFBVTtpQkFDVixFQUFFO29CQUNGLEdBQUcsRUFBRSxVQUFVO2lCQUNmLENBQUM7cUJBQ0EsU0FBUyxDQUFDLEtBQUssRUFBRSxJQUFJLEVBQUUsRUFBRTtvQkFFekIsSUFBSSxFQUFFLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztvQkFDMUIsTUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQztvQkFFL0MsTUFBTSxFQUFFO3lCQUNOLFFBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxJQUFJLENBQUMsQ0FBQzt5QkFDckMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFO3dCQUVYLDhCQUFZLENBQUM7NEJBQ1osS0FBSyxFQUFFLEdBQUcsQ0FBQyxRQUFRLEVBQUU7NEJBQ3JCLFdBQVc7NEJBQ1gsTUFBTTt5QkFDTixDQUFDLENBQUM7b0JBQ0osQ0FBQyxDQUFDLENBQ0Y7Z0JBQ0YsQ0FBQyxDQUFDO3FCQUNELEdBQUcsQ0FBQyxLQUFLLElBQUksRUFBRTtvQkFHZixJQUFJLEVBQUUsR0FBRyxnQkFBVyxDQUFDO3dCQUNwQixTQUFTLEVBQUUsTUFBTSxDQUFDLEdBQUc7cUJBQ3JCLENBQUMsQ0FBQztvQkFFSCxPQUFPLEVBQUUsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsUUFBUSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUE7Z0JBQzFELENBQUMsQ0FBQyxDQUNGO2dCQUVELE9BQU8sS0FBSyxDQUFDO1lBQ2QsQ0FBQyxDQUFDLENBQ0Q7UUFDSCxDQUFDO1FBRVMsS0FBSyxDQUFDLGFBQWEsQ0FBVSxLQUFhLEVBQUUsY0FBK0IsRUFBRSxPQUd0RixFQUFFLEdBQUcsSUFBSTtZQUVULE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQztZQUNsQixNQUFNLEVBQUUsR0FBRyxFQUFFLFVBQVUsRUFBRSxHQUFHLE9BQU8sQ0FBQztZQUVwQyxJQUFJLEtBQUssQ0FBQyxXQUFXLEVBQ3JCO2dCQUNDLE1BQU0sRUFBRSxTQUFTLEdBQUcsS0FBSyxFQUFFLEdBQUcsY0FBYyxDQUFDO2dCQUU3QyxrQkFBWSxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQztnQkFFbEMsT0FBTyx1QkFBZTtxQkFDcEIsT0FBTyxDQUFDLEtBQUssQ0FBQyxXQUFXLENBQUM7cUJBQzFCLElBQUksQ0FBQyxDQUFDLE1BQU0sRUFBRSxHQUFHLEVBQUUsRUFBRTtvQkFHckIsSUFBSSxPQUFlLENBQUM7b0JBRXBCO3dCQUNDLElBQUksSUFBSSxHQUFHLEVBQUUsQ0FBQzt3QkFFZCxJQUFJLENBQUMsY0FBYyxDQUFDLFdBQVcsRUFDL0I7NEJBQ0MsSUFBSSxHQUFHLEdBQUcsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxRQUFRLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxHQUFHLEdBQUcsQ0FBQzs0QkFDN0MsSUFBSSxJQUFJLEdBQUcsQ0FBQzt5QkFDWjt3QkFFRCxPQUFPLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQzdCLEdBQUcsSUFBSSxHQUFHLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxNQUFNLENBQUMsWUFBWSxDQUFDLEVBQUUsQ0FDeEQsQ0FBQztxQkFDRjtvQkFFRCxJQUFJLElBQUksR0FBYSxFQUFFLENBQUM7b0JBRXhCLE9BQU8sdUJBQWU7eUJBQ3BCLE9BQU8sQ0FBQyxNQUFNLENBQUMsWUFBWSxDQUFDO3lCQUM1QixJQUFJLENBQUMsS0FBSyxFQUFFLE9BQU8sRUFBRSxFQUFFO3dCQUV2QixJQUFJLE9BQU8sQ0FBQyxJQUFJLEVBQ2hCOzRCQUNDLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7eUJBQzNCO29CQUNGLENBQUMsQ0FBQzt5QkFDRCxHQUFHLENBQUMsS0FBSyxJQUFJLEVBQUU7d0JBRWYsSUFBSSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQzt3QkFFM0Isa0JBQVksQ0FBQyxLQUFLLENBQUMsVUFBVSxFQUFFLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxVQUFVLEVBQUUsT0FBTyxDQUFDLEVBQUUsRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7d0JBRXJGLElBQUksSUFBSSxDQUFDLE1BQU0sRUFDZjs0QkFDQyxJQUFJLElBQUksR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxXQUFXLENBQUMsQ0FBQzs0QkFFM0MsSUFBSSxPQUFPLEdBQUc7Z0NBQ2IsTUFBTSxFQUFFO29DQUNQLE1BQU0sRUFBRSxFQUE0QjtpQ0FDcEM7NkJBQ0QsQ0FBQzs0QkFFRixJQUFJLFNBQVMsSUFBSSxDQUFDLEVBQ2xCO2dDQUNDLE1BQU0sRUFBRSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUM7cUNBQ3JCLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLGVBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQztvQ0FDM0IsYUFBYTtxQ0FDWixJQUFJLENBQUMsQ0FBQyxJQUFvQixFQUFFLEVBQUU7b0NBRTlCLElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLE1BQU0sSUFBSSxFQUFTLENBQUM7b0NBQ3ZDLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxJQUFJLEVBQUUsQ0FBQztvQ0FFOUMsT0FBTyxHQUFHLElBQUksQ0FBQztvQ0FFZixrQkFBWSxDQUFDLEtBQUssQ0FBQyxpQ0FBaUMsQ0FBQyxDQUFBO2dDQUN0RCxDQUFDLENBQUM7cUNBQ0QsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUE7NkJBQ2xCOzRCQUVELE9BQU8sQ0FBQyxNQUFNLENBQUMsTUFBTSxHQUFHLE1BQU07aUNBQzVCLE9BQU8sQ0FBQyxJQUFnQixDQUFDO2lDQUN6QixNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRTtnQ0FHckIsSUFBSSxTQUFTLEVBQ2I7b0NBQ0MsQ0FBQyxDQUFDLGNBQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztpQ0FDbEI7cUNBRUQ7b0NBQ0MsQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxRQUFRLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO2lDQUNyQztnQ0FFRCxPQUFPLENBQUMsQ0FBQTs0QkFDVCxDQUFDLEVBQUUsT0FBTyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQzs0QkFFM0IsSUFBSSxFQUFFLEdBQUcsbUJBQWdCLENBQUMsT0FBTyxDQUFDLENBQUM7NEJBRW5DLE9BQU8sRUFBRSxDQUFDLFVBQVUsQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUFDO2lDQUM1QixJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUU7Z0NBR1Qsa0JBQVksQ0FBQyxPQUFPLENBQUMsVUFBVSxFQUFFLFFBQVEsRUFBRSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztnQ0FFakYsT0FBTyxDQUFDLENBQUM7NEJBQ1YsQ0FBQyxDQUFDLENBQ0Q7eUJBQ0Y7b0JBQ0YsQ0FBQyxDQUFDLENBQUE7Z0JBQ0osQ0FBQyxDQUFDLENBQ0Q7YUFDRjtZQUVELE9BQU8sdUJBQWUsQ0FBQyxPQUFPLEVBQUUsQ0FBQTtRQUNqQyxDQUFDO1FBRVMsS0FBSyxDQUFDLGFBQWEsQ0FBVSxLQUFhLEVBQUUsY0FBK0IsRUFBRSxPQUd0RixFQUFFLEdBQUcsSUFBSTtZQUVULE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQztZQUNsQixJQUFJLEdBQUcsR0FBRyxjQUFjLENBQUMsVUFBVSxJQUFJLENBQUMsQ0FBQztZQUV6QyxJQUFJLEVBQUUsR0FBRyxFQUFFLFVBQVUsRUFBRSxHQUFHLE9BQU8sQ0FBQztZQUVsQyxPQUFPLHVCQUFlO2lCQUNwQixTQUFTLENBQUMsS0FBSyxDQUFDLFdBQVcsRUFBRSxDQUFDLE1BQU0sRUFBRSxHQUFHLEVBQUUsRUFBRTtnQkFFN0MsSUFBSSxPQUFlLENBQUM7Z0JBRXBCO29CQUNDLElBQUksSUFBSSxHQUFHLEVBQUUsQ0FBQztvQkFFZCxJQUFJLENBQUMsY0FBYyxDQUFDLFdBQVcsRUFDL0I7d0JBQ0MsSUFBSSxHQUFHLEdBQUcsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxRQUFRLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxHQUFHLEdBQUcsQ0FBQzt3QkFDN0MsSUFBSSxJQUFJLEdBQUcsQ0FBQztxQkFDWjtvQkFFRCxPQUFPLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQzdCLEdBQUcsSUFBSSxHQUFHLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxNQUFNLENBQUMsWUFBWSxDQUFDLEVBQUUsQ0FDeEQsQ0FBQztpQkFDRjtnQkFFRCxrQkFBWSxDQUFDLEtBQUssQ0FBQyxHQUFHLEVBQUUsTUFBTSxDQUFDLFlBQVksQ0FBQyxDQUFDO2dCQUU3QyxJQUFJLENBQUMsY0FBYyxDQUFDLFlBQVksSUFBSSxjQUFjLENBQUMsY0FBYyxJQUFJLENBQUMsRUFDdEU7b0JBQ0MsSUFBSSxDQUFTLENBQUM7b0JBRWQsSUFBSSxJQUFJLEdBQUcsTUFBTSxDQUFDLFlBQVksQ0FBQyxLQUFLLENBQUMsVUFBVSxPQUFPLEVBQUUsQ0FBQzt3QkFFeEQsSUFBSSxDQUFDLEdBQUcsQ0FBQyxjQUFjLENBQUMsY0FBYyxHQUFHLENBQUMsQ0FBQyxDQUFDOzRCQUMxQyxPQUFPLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQyxzQkFBYSxDQUFDLE9BQU8sQ0FBQyxhQUFhLENBQUMsQ0FDNUQ7NkJBQ0EsT0FBTyxDQUFDLE1BQU0sRUFBRSxFQUFFLENBQUM7NEJBQ3BCLDZCQUE2Qjs2QkFDNUIsT0FBTyxDQUFDLGFBQWEsRUFBRSxJQUFJLENBQUMsQ0FDN0I7d0JBRUQsd0NBQXdDO3dCQUV4QyxJQUFJLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQ25COzRCQUNDLElBQUksRUFBRSxHQUFHLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQzs0QkFFckIsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUNWO2dDQUNDLENBQUMsR0FBRyxFQUFFLENBQUM7Z0NBRVAsT0FBTyxJQUFJLENBQUM7NkJBQ1o7aUNBQ0ksSUFBSSxFQUFFLEtBQUssRUFBRSxDQUFDLEVBQ25CO2dDQUNDLE9BQU8sSUFBSSxDQUFDOzZCQUNaO3lCQUNEO3dCQUVELE9BQU8sS0FBSyxDQUFDO29CQUNkLENBQUMsQ0FBQyxDQUFDO29CQUVILG9CQUFvQjtvQkFFcEIsSUFBSSxJQUFJLEVBQ1I7d0JBQ0MsTUFBTSxDQUFDLFlBQVksQ0FBQyxPQUFPLENBQUMsVUFBVSxPQUFPOzRCQUU1QyxPQUFPLENBQUMsYUFBYSxHQUFHLEVBQUUsQ0FBQzt3QkFDNUIsQ0FBQyxDQUFDLENBQUM7cUJBQ0g7aUJBQ0Q7Z0JBRUQsSUFBSSxjQUFjLENBQUMsS0FBSyxFQUN4QjtvQkFDQyxJQUFJLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxLQUFLLEVBQUUsUUFBUSxFQUFFLE1BQU0sRUFBRTt3QkFDakQsY0FBYzt3QkFDZCxPQUFPO3dCQUNQLEdBQUc7d0JBQ0gsS0FBSzt3QkFDTCxHQUFHO3FCQUNILENBQUMsQ0FBQztpQkFDSDtnQkFFRCxPQUFPLHVCQUFlO3FCQUNwQixTQUFTLENBQUMsTUFBTSxDQUFDLFlBQVksRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLEdBQUcsRUFBRSxFQUFFO29CQUV0RCxrQ0FBa0M7b0JBRWxDLE1BQU0sV0FBVyxHQUFHLEdBQUcsRUFBRSxDQUFDO29CQUUxQixJQUFJLElBQUksR0FBRyxnQkFBVyxDQUFDLElBQUksRUFBRTt3QkFDNUIsT0FBTyxFQUFFLEdBQUc7d0JBQ1osR0FBRyxFQUFFLE1BQU07d0JBRVgsR0FBRyxFQUFFLFdBQVc7d0JBRWhCLE9BQU87d0JBQ1AsTUFBTSxFQUFFLEdBQUc7cUJBQ1gsRUFBRSxjQUFjLENBQUMsQ0FBQztvQkFFbkIsSUFBSSxJQUFJLENBQUMsWUFBWSxDQUFDLGNBQWMsRUFBRSxJQUFJLENBQUMsRUFDM0M7d0JBQ0Msa0JBQVksQ0FBQyxLQUFLLENBQUMsUUFBUSxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsT0FBTyxDQUFDLGFBQWEsQ0FBQyxDQUFDO3dCQUU5RCxPQUFPLElBQUksQ0FBQztxQkFDWjtvQkFFRCxJQUFJLEdBQUcsR0FBRyxJQUFJLENBQUMsaUJBQWlCLENBQUM7d0JBQ2hDLEtBQUs7d0JBQ0wsTUFBTTt3QkFDTixPQUFPO3FCQUNQLEVBQUUsY0FBYyxDQUFDLENBQUM7b0JBRW5CLGtCQUFZLENBQUMsS0FBSyxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsT0FBTyxDQUFDLGFBQWEsQ0FBQyxDQUFDO29CQUNwRCxxQ0FBcUM7b0JBRXJDLE1BQU0sSUFBSSxDQUFDLGlCQUFpQixDQUFDO3dCQUMzQixHQUFHO3dCQUNILElBQUk7d0JBQ0osTUFBTTt3QkFDTixPQUFPO3FCQUNQLEVBQUUsY0FBYyxFQUFFO3dCQUNsQixLQUFLO3FCQUNMLENBQUM7eUJBRUQsSUFBSSxDQUFDLEtBQUssRUFBRSxJQUFZLEVBQUUsRUFBRTt3QkFFNUIsTUFBTSxJQUFJLENBQUMsU0FBUyxDQUFDOzRCQUNwQixJQUFJOzRCQUNKLE9BQU8sRUFBRSxJQUFJOzRCQUNiLGNBQWM7eUJBQ2QsQ0FBQyxDQUFDO3dCQUVILE9BQU8sSUFBSSxDQUFDO29CQUNiLENBQUMsQ0FBQyxDQUNGO29CQUVELE9BQU8sSUFBSSxDQUFDO2dCQUNiLENBQUMsQ0FBQyxDQUNEO1lBQ0gsQ0FBQyxDQUFDO2lCQUNELElBQUksQ0FBQyxVQUFVLEdBQUc7Z0JBRWxCLE9BQU8sR0FBZSxDQUFDO1lBQ3hCLENBQUMsQ0FBQyxDQUNEO1FBQ0gsQ0FBQztRQUVELFlBQVksQ0FBSSxLQUFhLEVBQUUsY0FBK0IsRUFBRSxPQUcvRCxFQUFFLEdBQUcsSUFBSTtZQUVULGFBQWE7WUFDYixJQUFJLEVBQU8sQ0FBQztZQUVaLGtCQUFZLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBRTVCLEVBQUUsR0FBRyxjQUFjLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBSSxLQUFLLEVBQUUsY0FBYyxFQUFFLE9BQU8sRUFBRSxHQUFHLElBQUksQ0FBQyxDQUFDO1lBRTVHLE9BQU8sdUJBQWU7aUJBQ3BCLE9BQU8sQ0FBQyxFQUFFLENBQUM7aUJBQ1gsSUFBSSxDQUFDLFVBQVUsR0FBTTtnQkFFckIsT0FBTztvQkFDTixLQUFLO29CQUNMLGNBQWM7b0JBQ2QsT0FBTztvQkFDUCxHQUFHO2lCQUNILENBQUM7WUFDSCxDQUFDLENBQUMsQ0FDRDtRQUNILENBQUM7UUFFUyxhQUFhLENBQUMsSUFBWTtZQUVuQyxPQUFPLElBQUksQ0FBQztRQUNiLENBQUM7UUFFUyxhQUFhLENBQUksR0FBa0IsRUFBRSxjQUFtQyxFQUFFLEtBTW5GO1lBRUEsSUFBSSxDQUFDLEdBQUcsRUFDUjtnQkFDQyxPQUFPLEVBQUUsQ0FBQzthQUNWO1lBRUQsTUFBTSxJQUFJLFdBQVcsQ0FBQywwQkFBMEIsQ0FBQyxDQUFDO1FBQ25ELENBQUM7UUFFUyx1QkFBdUIsQ0FBSSxPQUFlLEVBQUUsR0FBa0IsRUFBRSxjQUFtQyxFQUFFLEtBTTlHO1lBSUEsSUFBSSxDQUFDLEdBRUQsSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFRLENBQUM7WUFFOUIsQ0FBQyxDQUFDLE9BQU8sR0FBRyxDQUFDLEtBQUssQ0FBQyxPQUFPLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBRXBDLE9BQU8sQ0FBQyxDQUFBO1FBQ1QsQ0FBQztRQUVTLGlCQUFpQixDQUFJLElBSzlCLEVBQUUsY0FBbUMsRUFBRSxPQUV2QztZQUVBLE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQztZQUVsQixJQUFJLEVBQUUsR0FBRyxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsT0FBTyxFQUFFLEdBQUcsSUFBSSxDQUFDO1lBQzFDLElBQUksRUFBRSxLQUFLLEVBQUUsR0FBRyxPQUFPLENBQUM7WUFFeEIsT0FBTyx1QkFBZSxDQUFDLE9BQU8sRUFBRTtpQkFDOUIsSUFBSSxDQUFDLEtBQUssSUFBSSxFQUFFO2dCQUVoQixJQUFJLEdBQUcsR0FBRyxLQUFLLENBQUM7Z0JBQ2hCLElBQUksT0FBTyxHQUFHLENBQUMsQ0FBQztnQkFDaEIsSUFBSSxLQUFhLENBQUM7Z0JBQ2xCLEdBQ0E7b0JBQ0MsR0FBRyxHQUFHLEtBQUssQ0FBQztvQkFFWixLQUFLLEdBQUcsTUFBTSxJQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsRUFBRSxjQUFjLEVBQUU7d0JBQ3BELEtBQUs7cUJBQ0wsQ0FBQzt5QkFDRCxJQUFJLENBQUMsS0FBSyxFQUFFLEdBQUcsRUFBRSxFQUFFO3dCQUVuQixPQUFPLElBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxFQUFFLGNBQWMsRUFBRTs0QkFDOUMsSUFBSTs0QkFDSixLQUFLOzRCQUNMLE1BQU07NEJBQ04sT0FBTzs0QkFDUCxPQUFPO3lCQUNQLENBQUMsQ0FBQztvQkFDSixDQUFDLENBQUM7eUJBQ0QsS0FBSyxDQUFDLEtBQUssRUFBRSxDQUViLEVBQUUsRUFBRTt3QkFFSixJQUFJLENBQUMsQ0FBQyxPQUFPLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxPQUFPLEdBQUcsQ0FBQyxFQUNsQzs0QkFDQyxHQUFHLEdBQUcsSUFBSSxDQUFDOzRCQUNYLE9BQU8sR0FBRyxDQUFDLENBQUMsT0FBTyxHQUFHLENBQUMsQ0FBQzs0QkFDeEIsSUFBSSxLQUFLLEdBQUcsSUFBSSxHQUFHLE9BQU8sR0FBRyxJQUFJLEdBQUcsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLFlBQXVCLEdBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxhQUF5QixJQUFHLEVBQUUsQ0FBQzs0QkFFeEgsYUFBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsT0FBTyxFQUFFLE9BQU8sRUFBRSxLQUFLLENBQUMsQ0FBQzs0QkFFeEMsTUFBTSx1QkFBZSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQzs0QkFFbkMsT0FBTTt5QkFDTjt3QkFFRCxPQUFPLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUE7b0JBQ3pCLENBQUMsQ0FBQyxDQUFBO2lCQUVILFFBQ00sR0FBRyxFQUFFO2dCQUVaLE9BQU8sS0FBSyxDQUFBO1lBQ2IsQ0FBQyxDQUFDO2lCQUNELElBQUksQ0FBQyxVQUFVLElBQUk7Z0JBRW5CLElBQUksT0FBTyxJQUFJLElBQUksUUFBUSxFQUMzQjtvQkFDQyxPQUFPLG9CQUFTLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO2lCQUM3QjtnQkFFRCxPQUFPLElBQUksQ0FBQztZQUNiLENBQUMsQ0FBQyxDQUNEO1FBQ0gsQ0FBQztRQUVTLGFBQWEsQ0FBSSxHQUFRLEVBQUUsY0FBbUMsRUFBRSxPQUV6RTtZQUVBLE9BQU8sdUJBQWUsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxJQUFJLENBQUMsS0FBSztnQkFFMUMsa0JBQVksQ0FBQyxLQUFLLENBQUMsY0FBYyxFQUFFLEdBQUcsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDO2dCQUVuRCxJQUFJLEdBQUcsR0FBRyxFQUFtQixDQUFDO2dCQUU5QixJQUFJLElBQUksR0FBRyxrQkFBVSxDQUFDLGNBQWMsQ0FBQyxDQUFDO2dCQUV0QyxJQUFJLGNBQWMsQ0FBQyxlQUFlLEVBQ2xDO29CQUNDLE9BQU8sSUFBSSxDQUFDO2lCQUNaO3FCQUNJLElBQUksSUFBSSxFQUNiO29CQUNDLElBQUksY0FBYyxDQUFDLFVBQVUsR0FBRyxDQUFDLEVBQ2pDO3dCQUNDLGFBQWE7d0JBQ2IsSUFBSSxDQUFDLGNBQWMsQ0FBQyxLQUFLLEdBQUcsY0FBYyxDQUFDLFVBQVUsQ0FBQztxQkFDdEQ7eUJBRUQ7d0JBQ0MsYUFBYTt3QkFDYixJQUFJLENBQUMsY0FBYyxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUM7cUJBQzlCO29CQUVELE1BQU0sb0JBQVksQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLGNBQWMsQ0FBQzt5QkFDMUMsSUFBSSxDQUFDLFVBQVUsR0FBRzt3QkFFbEIsTUFBTSxpQkFBaUIsR0FBRyxnQkFBZ0IsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUM7d0JBRXhFLEdBQUcsQ0FBQyxpQkFBaUIsR0FBRyxpQkFBaUIsQ0FBQzt3QkFFMUMsYUFBYTt3QkFDYixHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQzt3QkFFZCxJQUFJLGlCQUFpQixDQUFDLE1BQU0sRUFBRSxJQUFJLGlCQUFpQixDQUFDLEtBQUssRUFBRSxFQUMzRDs0QkFDQyxHQUFHLENBQUMsR0FBRyxHQUFHLDRCQUFjLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxjQUFjLENBQUMsWUFBWSxDQUFDLENBQUM7NEJBQ2hFLEdBQUcsQ0FBQyxHQUFHLEdBQUcsdUJBQVMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7eUJBQzdCOzZCQUNJLElBQUksaUJBQWlCLENBQUMsT0FBTyxJQUFJLE1BQU0sRUFDNUM7NEJBQ0MsR0FBRyxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQzt5QkFDM0M7d0JBRUQsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUM7d0JBQ2QsR0FBRyxDQUFDLElBQUksR0FBRyxHQUFHLENBQUMsSUFBSSxDQUFDO29CQUNyQixDQUFDLENBQUMsQ0FDRjtpQkFDRDtxQkFFRDtvQkFDQyxhQUFhO29CQUNiLEdBQUcsQ0FBQyxHQUFHLEdBQUcsTUFBTSxxQkFBTyxDQUFDLEdBQUcsRUFBRSxjQUFjLENBQUMsWUFBWSxDQUFDLENBQUM7b0JBRTFELEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDO29CQUNwQyxHQUFHLENBQUMsSUFBSSxHQUFHLEdBQUcsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQztpQkFDakM7Z0JBRUQsT0FBTyxHQUFHLENBQUM7WUFDWixDQUFDLENBQUMsQ0FBQztRQUNKLENBQUM7UUFFUyxzQkFBc0IsQ0FBc0IsY0FBb0M7WUFFekYsSUFBSSxJQUFJLEdBQWlDLEVBQUUsQ0FBQztZQUU1QyxJQUFJLGNBQWMsRUFDbEI7Z0JBQ0MsSUFBSSxJQUFhLENBQUM7Z0JBRWxCLEtBQUssSUFBSSxDQUFDLElBQUk7b0JBQ2IsY0FBYztvQkFDZCxjQUFjO29CQUNkLGdCQUFnQjtvQkFDaEIsWUFBWTtvQkFDWixVQUFVO29CQUNWLFlBQVk7b0JBQ1osV0FBVztvQkFDWCx1QkFBdUI7b0JBQ3ZCLHdCQUF3QjtpQkFDSyxFQUM5QjtvQkFDQyxJQUFJLENBQUMsQ0FBQyxJQUFJLGNBQWMsQ0FBQyxJQUFJLE9BQU8sY0FBYyxDQUFDLENBQUMsQ0FBQyxLQUFLLFdBQVcsRUFDckU7d0JBQ0MsSUFBSSxHQUFHLElBQUksQ0FBQzt3QkFDWixhQUFhO3dCQUNiLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxjQUFjLENBQUMsQ0FBQyxDQUFDLENBQUM7cUJBQzVCO2lCQUNEO2FBQ0Q7WUFFRCxPQUFPLElBQUksQ0FBQztRQUNiLENBQUM7UUFFUyxXQUFXLENBQUMsY0FBK0IsRUFBRSxPQUFPLEdBQUcsRUFBRSxFQUFFLEdBQUcsSUFBSTtZQUUzRSxJQUFJLElBQUksQ0FBQyxLQUFLLEVBQ2Q7Z0JBQ0MsT0FBTyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQztnQkFFaEQsSUFDQTtvQkFDQyxPQUFPLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLFFBQVEsR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLFFBQVEsSUFBSSxjQUFjLENBQUMsb0JBQVksQ0FBQyxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDO2lCQUNwSDtnQkFDRCxPQUFPLENBQUMsRUFDUjtpQkFDQzthQUNEO1lBRUQsSUFBSSxlQUFlLEdBQUcsSUFBSSxDQUFDLHNCQUFzQixDQUFDLGNBQWMsQ0FBQyxDQUFDO1lBRWxFLE9BQU8sS0FBSyxDQUFDLFdBQVcsQ0FBQyxjQUFjLEVBQUUsT0FBTyxFQUFFO2dCQUNqRCxPQUFPLEVBQUU7b0JBQ1IsVUFBVSxFQUFFO3dCQUNYLFNBQVMsRUFBRSxJQUFJO3FCQUNmO29CQUNELGVBQWUsRUFBRSxlQUFlLElBQUksRUFBRTtpQkFDdEM7YUFDRCxFQUFFLEdBQUcsSUFBSSxDQUFDLENBQUM7UUFDYixDQUFDO1FBRVMsU0FBUyxDQUFDLFFBQVEsRUFBRSxjQUFjLEVBQUUsS0FFN0M7WUFFQSxNQUFNLElBQUksV0FBVyxFQUFFLENBQUM7UUFDekIsQ0FBQztLQUVELENBQUE7SUEzdUJ1QixtQkFBSyxHQUFXLElBQUksQ0FBQztJQUZoQyxhQUFhO1FBRHpCLHdCQUFnQixFQUE4Qzs7T0FDbEQsYUFBYSxDQTZ1QnpCO0lBQUQsb0JBQUM7S0FBQTtBQTd1Qlksc0NBQWE7QUErdUJiLFFBQUEsU0FBUyxHQUFHLGFBQXFDLENBQUM7QUFFL0Qsa0JBQWUsYUFBYSxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgcmV0cnlSZXF1ZXN0IH0gZnJvbSAnLi4vLi4vZmV0Y2gnO1xuaW1wb3J0IGZzID0gcmVxdWlyZSgnZnMtZXh0cmEnKTtcbmltcG9ydCBwYXRoID0gcmVxdWlyZSgndXBhdGgyJyk7XG5pbXBvcnQgbm92ZWxJbmZvLCB7IElNZGNvbmZNZXRhIH0gZnJvbSAnbm9kZS1ub3ZlbC1pbmZvJztcbmltcG9ydCB7IGZyb21VUkwsIElGcm9tVXJsT3B0aW9ucywgSUpTRE9NLCByZXF1ZXN0VG9KU0RPTSwgcGFja0pTRE9NIH0gZnJvbSAnanNkb20tZXh0cmEnO1xuLy9pbXBvcnQgeyBVUkwgfSBmcm9tICdqc2RvbS11cmwnO1xuaW1wb3J0IHsgZ2V0RmlsZVBhdGggfSBmcm9tICcuLi9mcyc7XG5cbmltcG9ydCB7IGdldE9wdGlvbnMgfSBmcm9tICcuLi8uLi9qc2RvbSc7XG5pbXBvcnQgeyBub3JtYWxpemVfdmFsIH0gZnJvbSAnbm9kZS1ub3ZlbC1nbG9iYnkvbGliL2hlbHBlcic7XG5pbXBvcnQgeyBnbG9iYnlBU3luYyB9IGZyb20gJ25vZGUtbm92ZWwtZ2xvYmJ5L2cnO1xuaW1wb3J0IHtcblx0bGF6eUFuYWx5emVSZXBvcnRBbGwsXG5cdGxhenlBbmFseXplQWxsLFxuXHRkdW1teUNhY2hlLFxuXHRhbmFseXplSmEwMDIsXG5cdGhhbmRsZUphMDAyLFxufSBmcm9tICdAbm9kZS1ub3ZlbC9sYXlvdXQtcmVwb3J0ZXInO1xuaW1wb3J0IHsgb3V0cHV0QmxvY2swMDIsIG91dHB1dEphMDAyIH0gZnJvbSAnQG5vZGUtbm92ZWwvbGF5b3V0LXJlcG9ydGVyL2xpYi9tZCc7XG5pbXBvcnQgeyBJVFNQYXJ0aWFsUGljayB9IGZyb20gJ3RzLXR5cGUnO1xuXG5pbXBvcnQgX05vdmVsU2l0ZSwgeyBzdGF0aWNJbXBsZW1lbnRzLCBkZWZhdWx0SlNET01PcHRpb25zLCBTWU1CT0xfQ0FDSEUgfSBmcm9tICcuLi9pbmRleCc7XG5pbXBvcnQgeyBQcm9taXNlQmx1ZWJpcmQgfSBmcm9tICcuLi9pbmRleCc7XG5cbmltcG9ydCBwYXJzZUNvbnRlbnRUeXBlID0gcmVxdWlyZSgnY29udGVudC10eXBlLXBhcnNlcicpO1xuaW1wb3J0IG5vdmVsVGV4dCBmcm9tICdub3ZlbC10ZXh0JztcblxuaW1wb3J0IHsgTGF6eUNvb2tpZSwgTGF6eUNvb2tpZUphciB9IGZyb20gJ2pzZG9tLWV4dHJhJztcblxuaW1wb3J0IHsgdG91Z2hDb29raWUgfSBmcm9tICdqc2RvbS1leHRyYSc7XG5cbmltcG9ydCB7IHN0cmluZ2lmeSBhcyBtZGNvbmZfc3RyaW5naWZ5LCBwYXJzZSBhcyBtZGNvbmZfcGFyc2UgfSBmcm9tICdtZGNvbmYyJztcblxuZXhwb3J0IHR5cGUgSU9wdGlvbnNQbHVzID0ge31cblxuZXhwb3J0IHR5cGUgSURvd25sb2FkT3B0aW9ucyA9IF9Ob3ZlbFNpdGUuSURvd25sb2FkT3B0aW9ucyAmIF9Ob3ZlbFNpdGUuSU9wdGlvbnMgJiBJT3B0aW9uc1BsdXNcbmV4cG9ydCB0eXBlIElPcHRpb25zUnVudGltZSA9IF9Ob3ZlbFNpdGUuSU9wdGlvbnNSdW50aW1lICYgSU9wdGlvbnNQbHVzXG5cbmV4cG9ydCBpbXBvcnQgSU5vdmVsID0gX05vdmVsU2l0ZS5JTm92ZWw7XG5cbmltcG9ydCB7IFJlc3BvbnNlUmVxdWVzdCB9IGZyb20gJ3JlcXVlc3QnO1xuXG5pbXBvcnQgeyBjaGFsa0J5Q29uc29sZSwgY29uc29sZSwgY29uc29sZURlYnVnIH0gZnJvbSAnLi4vLi4vdXRpbC9sb2cnO1xuaW1wb3J0IHsgaGFzaFN1bSB9IGZyb20gJy4uLy4uL3V0aWwvaGFzaCc7XG5cbmV4cG9ydCB0eXBlIElGZXRjaENoYXB0ZXIgPSB7XG5cdGJvZHk/OiBhbnk7XG5cdGRvbT86IElKU0RPTTtcblx0cmVzPzogUmVzcG9uc2VSZXF1ZXN0O1xuXHRqc29uPyxcblxuXHR1cmw/OiBVUkwsXG5cdGNvbnRlbnRUeXBlUGFyc2VkPzogUmV0dXJuVHlwZTxwYXJzZUNvbnRlbnRUeXBlPixcbn07XG5cbmV4cG9ydCB0eXBlIElTZXNzaW9uRGF0YSA9IHtcblx0W2tleTogc3RyaW5nXTogYW55LFxufVxuXG5Ac3RhdGljSW1wbGVtZW50czxfTm92ZWxTaXRlLklOb3ZlbFNpdGVTdGF0aWM8Tm92ZWxTaXRlRGVtbz4+KClcbmV4cG9ydCBjbGFzcyBOb3ZlbFNpdGVEZW1vIGV4dGVuZHMgX05vdmVsU2l0ZVxue1xuXHRwdWJsaWMgc3RhdGljIHJlYWRvbmx5IElES0VZOiBzdHJpbmcgPSBudWxsO1xuXG5cdGNvbnN0cnVjdG9yKG9wdGlvbnM6IElEb3dubG9hZE9wdGlvbnMsIC4uLmFyZ3YpXG5cdHtcblx0XHRzdXBlcihvcHRpb25zLCAuLi5hcmd2KTtcblx0fVxuXG5cdC8qKlxuXHQgKiBAdG9kbyDorpPmraTmlrnms5XmnInmhI/nvqlcblx0ICpcblx0ICog55So5L6G6Kqq5piO55uu5YmN56uZ6bue55qE5omA6ZyAIHNlc3Npb24gY29va2llc1xuXHQgKlxuXHQgKiBAcGFyYW0ge1R9IGRhdGFcblx0ICogQHJldHVybnMge1R9XG5cdCAqL1xuXHRjaGVja1Nlc3Npb25EYXRhPFQgPSBJU2Vzc2lvbkRhdGE+KGRhdGE6IFQsIG9wdGlvbnNSdW50aW1lOiBJT3B0aW9uc1J1bnRpbWUgPSB7fSlcblx0e1xuXHRcdHJldHVybiBkYXRhO1xuXHR9XG5cblx0c2Vzc2lvbjxUID0gSU9wdGlvbnNSdW50aW1lPihvcHRpb25zUnVudGltZTogUGFydGlhbDxUICYgSURvd25sb2FkT3B0aW9ucz4sIHVybDogVVJMLCBkb21haW4/OiBzdHJpbmcpXG5cdHtcblx0XHRzdXBlci5zZXNzaW9uKG9wdGlvbnNSdW50aW1lLCB1cmwpO1xuXG5cdFx0aWYgKG9wdGlvbnNSdW50aW1lLnNlc3Npb25EYXRhICYmIE9iamVjdC5rZXlzKG9wdGlvbnNSdW50aW1lLnNlc3Npb25EYXRhKS5sZW5ndGgpXG5cdFx0e1xuXHRcdFx0T2JqZWN0LmVudHJpZXMob3B0aW9uc1J1bnRpbWUuc2Vzc2lvbkRhdGEpXG5cdFx0XHRcdC5mb3JFYWNoKGZ1bmN0aW9uIChkYXRhKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0bGV0IGM6IExhenlDb29raWUuUHJvcGVydGllcztcblx0XHRcdFx0XHRsZXQgdHlwZWMgPSB0eXBlb2YgZGF0YVsxXTtcblxuXHRcdFx0XHRcdGlmIChkYXRhWzFdICYmIHR5cGVjID09ICdvYmplY3QnKVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdGMgPSBkYXRhWzFdO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRlbHNlIGlmICh0eXBlYyA9PT0gbnVsbCB8fCB0eXBlYyAhPSAnb2JqZWN0Jylcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRsZXQgW2tleSwgdmFsdWVdID0gZGF0YTtcblxuXHRcdFx0XHRcdFx0YyA9IHtcblx0XHRcdFx0XHRcdFx0a2V5LFxuXHRcdFx0XHRcdFx0XHR2YWx1ZSxcblx0XHRcdFx0XHRcdH07XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGVsc2Vcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRjID0gZGF0YVsxXTtcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRpZiAoYylcblx0XHRcdFx0XHR7XG5cblx0XHRcdFx0XHRcdGlmICh0eXBlb2YgYyA9PSAnb2JqZWN0Jylcblx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0aWYgKCFjLnBhdGgpXG5cdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHRjLnBhdGggPSAnLyc7XG5cdFx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0XHRpZiAoYy5ob3N0T25seSA9PSBudWxsKVxuXHRcdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdFx0Yy5ob3N0T25seSA9IGZhbHNlO1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdGlmICghKHR5cGVvZiBjID09PSAnc3RyaW5nJyB8fCBjIGluc3RhbmNlb2YgTGF6eUNvb2tpZSB8fCBjIGluc3RhbmNlb2YgdG91Z2hDb29raWUuQ29va2llKSlcblx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdFx0XHRcdFx0XHRjID0gbmV3IHRvdWdoQ29va2llLkNvb2tpZShjKVxuXHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHRvcHRpb25zUnVudGltZS5vcHRpb25zSlNET00uY29va2llSmFyXG5cdFx0XHRcdFx0XHRcdC5zZXRDb29raWVTeW5jKGMsIHVybC5ocmVmKVxuXHRcdFx0XHRcdFx0O1xuXG5cdFx0XHRcdFx0XHRpZiAodHlwZW9mIGMgPT0gJ29iamVjdCcgJiYgIWMuZG9tYWluKVxuXHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRpZiAoZG9tYWluKVxuXHRcdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdFx0Yy5kb21haW4gPSBkb21haW47XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0ZWxzZSBpZiAodXJsICYmIHVybC5ob3N0KVxuXHRcdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdFx0Yy5kb21haW4gPSB1cmwuaG9zdDtcblx0XHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHRcdHRyeVxuXHRcdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdFx0b3B0aW9uc1J1bnRpbWUub3B0aW9uc0pTRE9NLmNvb2tpZUphclxuXHRcdFx0XHRcdFx0XHRcdFx0LnNldENvb2tpZVN5bmMoYywgdXJsLmhyZWYpXG5cdFx0XHRcdFx0XHRcdFx0O1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdGNhdGNoIChlKVxuXHRcdFx0XHRcdFx0XHR7XG5cblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSlcblx0XHRcdDtcblxuXHRcdFx0Y29uc29sZURlYnVnLmRlYnVnKGBzZXNzaW9uYCwgb3B0aW9uc1J1bnRpbWUub3B0aW9uc0pTRE9NLmNvb2tpZUphcik7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblxuXHRkb3dubG9hZChpbnB1dFVybDogc3RyaW5nIHwgVVJMLCBkb3dubG9hZE9wdGlvbnM6IElEb3dubG9hZE9wdGlvbnMgPSB7fSlcblx0e1xuXHRcdGNvbnN0IHNlbGYgPSB0aGlzO1xuXHRcdGxldCB1cmwgPSBpbnB1dFVybCBhcyBVUkw7XG5cblx0XHRjb25zdCBbUEFUSF9OT1ZFTF9NQUlOLCBvcHRpb25zUnVudGltZV0gPSB0aGlzLmdldE91dHB1dERpcjxJT3B0aW9uc1J1bnRpbWUgJiBJRG93bmxvYWRPcHRpb25zPihkb3dubG9hZE9wdGlvbnMpO1xuXG5cdFx0Y29uc29sZURlYnVnLmVuYWJsZWQgPSBvcHRpb25zUnVudGltZS5kZWJ1Z0xvZztcblxuXHRcdHJldHVybiBQcm9taXNlQmx1ZWJpcmRcblx0XHRcdC5iaW5kKHNlbGYpXG5cdFx0XHQudGhlbihhc3luYyAoKSA9PlxuXHRcdFx0e1xuXHRcdFx0XHR1cmwgPSBhd2FpdCB0aGlzLmNyZWF0ZU1haW5VcmwodXJsLCBvcHRpb25zUnVudGltZSk7XG5cblx0XHRcdFx0c2VsZi5zZXNzaW9uKG9wdGlvbnNSdW50aW1lLCB1cmwpO1xuXG5cdFx0XHRcdGNvbnNvbGVEZWJ1Zy5pbmZvKCfliIbmnpDnq6Dnr4DliJfooagnLCB1cmwudG9TdHJpbmcoKSk7XG5cblx0XHRcdFx0bGV0IG5vdmVsID0gYXdhaXQgc2VsZi5nZXRfdm9sdW1lX2xpc3Q8SU9wdGlvbnNSdW50aW1lICYgSURvd25sb2FkT3B0aW9ucz4odXJsLCBvcHRpb25zUnVudGltZSk7XG5cblx0XHRcdFx0bGV0IHBhdGhfbm92ZWwgPSBzZWxmLmdldFBhdGhOb3ZlbChQQVRIX05PVkVMX01BSU4sIG5vdmVsLCBvcHRpb25zUnVudGltZSk7XG5cblx0XHRcdFx0c2VsZi5fbG9hZEV4aXN0c0NvbmYodXJsLCBvcHRpb25zUnVudGltZSwgbm92ZWwsIHBhdGhfbm92ZWwpO1xuXG5cdFx0XHRcdGxldCBpZHggPSBvcHRpb25zUnVudGltZS5zdGFydEluZGV4IHx8IDA7XG5cblx0XHRcdFx0b3B0aW9uc1J1bnRpbWVbU1lNQk9MX0NBQ0hFXS5ub3ZlbCA9IG5vdmVsO1xuXHRcdFx0XHRvcHRpb25zUnVudGltZVtTWU1CT0xfQ0FDSEVdLnBhdGhfbm92ZWwgPSBwYXRoX25vdmVsO1xuXG5cdFx0XHRcdGF3YWl0IFByb21pc2VCbHVlYmlyZFxuXHRcdFx0XHRcdC5yZXNvbHZlKHNlbGYucHJvY2Vzc05vdmVsKG5vdmVsLCBvcHRpb25zUnVudGltZSwge1xuXHRcdFx0XHRcdFx0dXJsLFxuXHRcdFx0XHRcdFx0cGF0aF9ub3ZlbCxcblx0XHRcdFx0XHR9KSlcblx0XHRcdFx0XHQudGFwKGxzID0+XG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0cmV0dXJuIHNlbGYuX291dHB1dEF0dGFjaChub3ZlbCwgb3B0aW9uc1J1bnRpbWUsIHtcblx0XHRcdFx0XHRcdFx0dXJsLFxuXHRcdFx0XHRcdFx0XHRwYXRoX25vdmVsLFxuXHRcdFx0XHRcdFx0fSlcblx0XHRcdFx0XHR9KVxuXHRcdFx0XHRcdC50YXAobHMgPT5cblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRsZXQgZmlsZSA9IHBhdGguam9pbihwYXRoX25vdmVsLFxuXHRcdFx0XHRcdFx0XHRgJHtzZWxmLnRyaW1GaWxlbmFtZU5vdmVsKG5vdmVsLm5vdmVsX3RpdGxlKX0uJHtub3ZlbC51cmxfZGF0YS5ub3ZlbF9pZH0uanNvbmAsXG5cdFx0XHRcdFx0XHRcdClcblx0XHRcdFx0XHRcdDtcblxuXHRcdFx0XHRcdFx0cmV0dXJuIGZzLm91dHB1dEpTT04oZmlsZSwgbm92ZWwsIHtcblx0XHRcdFx0XHRcdFx0c3BhY2VzOiBcIlxcdFwiLFxuXHRcdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0fSlcblx0XHRcdFx0O1xuXG5cdFx0XHRcdGF3YWl0IHNlbGYuX3NhdmVSZWFkbWUob3B0aW9uc1J1bnRpbWUpO1xuXG5cdFx0XHRcdGxldCBfY2FjaGUgPSBkdW1teUNhY2hlKCk7XG5cblx0XHRcdFx0YXdhaXQgZ2xvYmJ5QVN5bmMoW1xuXHRcdFx0XHRcdCcqKi8qLnR4dCcsXG5cdFx0XHRcdF0sIHtcblx0XHRcdFx0XHRjd2Q6IHBhdGhfbm92ZWwsXG5cdFx0XHRcdH0pXG5cdFx0XHRcdFx0Lm1hcFNlcmllcyhhc3luYyAoZmlsZSkgPT5cblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRsZXQgX3AgPSBwYXRoLnBhcnNlKGZpbGUpO1xuXHRcdFx0XHRcdFx0Y29uc3QgX2NhY2hlX2tleV8gPSBwYXRoLmpvaW4oX3AuZGlyLCBfcC5uYW1lKTtcblxuXHRcdFx0XHRcdFx0YXdhaXQgZnNcblx0XHRcdFx0XHRcdFx0LnJlYWRGaWxlKHBhdGguam9pbihwYXRoX25vdmVsLCBmaWxlKSlcblx0XHRcdFx0XHRcdFx0LnRoZW4oYnVmID0+XG5cdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHRhbmFseXplSmEwMDIoe1xuXHRcdFx0XHRcdFx0XHRcdFx0aW5wdXQ6IGJ1Zi50b1N0cmluZygpLFxuXHRcdFx0XHRcdFx0XHRcdFx0X2NhY2hlX2tleV8sXG5cdFx0XHRcdFx0XHRcdFx0XHRfY2FjaGUsXG5cdFx0XHRcdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0XHRcdH0pXG5cdFx0XHRcdFx0XHQ7XG5cdFx0XHRcdFx0fSlcblx0XHRcdFx0XHQudGFwKGFzeW5jICgpID0+XG5cdFx0XHRcdFx0e1xuXG5cdFx0XHRcdFx0XHRsZXQgbWQgPSBvdXRwdXRKYTAwMih7XG5cdFx0XHRcdFx0XHRcdGlucHV0RGF0YTogX2NhY2hlLmphMixcblx0XHRcdFx0XHRcdH0pO1xuXG5cdFx0XHRcdFx0XHRyZXR1cm4gZnMub3V0cHV0RmlsZShwYXRoLmpvaW4ocGF0aF9ub3ZlbCwgJ2phMi5tZCcpLCBtZClcblx0XHRcdFx0XHR9KVxuXHRcdFx0XHQ7XG5cblx0XHRcdFx0cmV0dXJuIG5vdmVsO1xuXHRcdFx0fSlcblx0XHRcdDtcblx0fVxuXG5cdHByb3RlY3RlZCBhc3luYyBfb3V0cHV0QXR0YWNoPFQgPSBhbnk+KG5vdmVsOiBJTm92ZWwsIG9wdGlvbnNSdW50aW1lOiBJT3B0aW9uc1J1bnRpbWUsIF9jYWNoZV86IHtcblx0XHR1cmw6IFVSTCxcblx0XHRwYXRoX25vdmVsOiBzdHJpbmcsXG5cdH0sIC4uLmFyZ3YpXG5cdHtcblx0XHRjb25zdCBzZWxmID0gdGhpcztcblx0XHRjb25zdCB7IHVybCwgcGF0aF9ub3ZlbCB9ID0gX2NhY2hlXztcblxuXHRcdGlmIChub3ZlbC52b2x1bWVfbGlzdClcblx0XHR7XG5cdFx0XHRjb25zdCB7IGtlZXBJbWFnZSA9IGZhbHNlIH0gPSBvcHRpb25zUnVudGltZTtcblxuXHRcdFx0Y29uc29sZURlYnVnLmluZm8oYOaqouafpSBBVFRBQ0gg6LOH5paZYCk7XG5cblx0XHRcdHJldHVybiBQcm9taXNlQmx1ZWJpcmRcblx0XHRcdFx0LnJlc29sdmUobm92ZWwudm9sdW1lX2xpc3QpXG5cdFx0XHRcdC5lYWNoKCh2b2x1bWUsIHZpZCkgPT5cblx0XHRcdFx0e1xuXG5cdFx0XHRcdFx0bGV0IGRpcm5hbWU6IHN0cmluZztcblxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdGxldCBfdmlkID0gJyc7XG5cblx0XHRcdFx0XHRcdGlmICghb3B0aW9uc1J1bnRpbWUubm9EaXJQcmVmaXgpXG5cdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdF92aWQgPSB2aWQudG9TdHJpbmcoKS5wYWRTdGFydCg0LCAnMCcpICsgJzAnO1xuXHRcdFx0XHRcdFx0XHRfdmlkICs9ICdfJztcblx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0ZGlybmFtZSA9IHBhdGguam9pbihwYXRoX25vdmVsLFxuXHRcdFx0XHRcdFx0XHRgJHtfdmlkfSR7c2VsZi50cmltRmlsZW5hbWVWb2x1bWUodm9sdW1lLnZvbHVtZV90aXRsZSl9YCxcblx0XHRcdFx0XHRcdCk7XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0bGV0IGltZ3M6IHN0cmluZ1tdID0gW107XG5cblx0XHRcdFx0XHRyZXR1cm4gUHJvbWlzZUJsdWViaXJkXG5cdFx0XHRcdFx0XHQucmVzb2x2ZSh2b2x1bWUuY2hhcHRlcl9saXN0KVxuXHRcdFx0XHRcdFx0LmVhY2goYXN5bmMgKGNoYXB0ZXIpID0+XG5cdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdGlmIChjaGFwdGVyLmltZ3MpXG5cdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHRpbWdzLnB1c2goLi4uY2hhcHRlci5pbWdzKTtcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0fSlcblx0XHRcdFx0XHRcdC50YXAoYXN5bmMgKCkgPT5cblx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0aW1ncyA9IGltZ3MuZmlsdGVyKHYgPT4gdik7XG5cblx0XHRcdFx0XHRcdFx0Y29uc29sZURlYnVnLmRlYnVnKGBbQVRUQUNIXWAsIGAke3BhdGgucmVsYXRpdmUocGF0aF9ub3ZlbCwgZGlybmFtZSl9YCwgaW1ncy5sZW5ndGgpO1xuXG5cdFx0XHRcdFx0XHRcdGlmIChpbWdzLmxlbmd0aClcblx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdGxldCBmaWxlID0gcGF0aC5qb2luKGRpcm5hbWUsICdBVFRBQ0gubWQnKTtcblxuXHRcdFx0XHRcdFx0XHRcdGxldCBtZF9kYXRhID0ge1xuXHRcdFx0XHRcdFx0XHRcdFx0YXR0YWNoOiB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdGltYWdlczoge30gYXMgUmVjb3JkPHN0cmluZywgc3RyaW5nPixcblx0XHRcdFx0XHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0XHRcdFx0fTtcblxuXHRcdFx0XHRcdFx0XHRcdGlmIChrZWVwSW1hZ2UgfHwgMSlcblx0XHRcdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdFx0XHRhd2FpdCBmcy5yZWFkRmlsZShmaWxlKVxuXHRcdFx0XHRcdFx0XHRcdFx0XHQudGhlbih2ID0+IG1kY29uZl9wYXJzZSh2KSlcblx0XHRcdFx0XHRcdFx0XHRcdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdFx0XHRcdFx0XHRcdFx0XHQudGhlbigoZGF0YTogdHlwZW9mIG1kX2RhdGEpID0+XG5cdFx0XHRcdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRkYXRhLmF0dGFjaCA9IGRhdGEuYXR0YWNoIHx8IHt9IGFzIGFueTtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRkYXRhLmF0dGFjaC5pbWFnZXMgPSBkYXRhLmF0dGFjaC5pbWFnZXMgfHwge307XG5cblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRtZF9kYXRhID0gZGF0YTtcblxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdGNvbnNvbGVEZWJ1Zy5kZWJ1ZyhgTG9hZCBkYXRhIGZyb20gZXhpc3RzIEFUVEFDSC5tZGApXG5cdFx0XHRcdFx0XHRcdFx0XHRcdH0pXG5cdFx0XHRcdFx0XHRcdFx0XHRcdC5jYXRjaChlID0+IG51bGwpXG5cdFx0XHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHRcdFx0bWRfZGF0YS5hdHRhY2guaW1hZ2VzID0gT2JqZWN0XG5cdFx0XHRcdFx0XHRcdFx0XHQuZW50cmllcyhpbWdzIGFzIHN0cmluZ1tdKVxuXHRcdFx0XHRcdFx0XHRcdFx0LnJlZHVjZSgoYSwgW2ssIHZdKSA9PlxuXHRcdFx0XHRcdFx0XHRcdFx0e1xuXG5cdFx0XHRcdFx0XHRcdFx0XHRcdGlmIChrZWVwSW1hZ2UpXG5cdFx0XHRcdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRhW2hhc2hTdW0odildID0gdjtcblx0XHRcdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRcdFx0XHRlbHNlXG5cdFx0XHRcdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRhW2sudG9TdHJpbmcoKS5wYWRTdGFydCgzLCAnMCcpXSA9IHY7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0XHRcdFx0XHRyZXR1cm4gYVxuXHRcdFx0XHRcdFx0XHRcdFx0fSwgbWRfZGF0YS5hdHRhY2guaW1hZ2VzKTtcblxuXHRcdFx0XHRcdFx0XHRcdGxldCBtZCA9IG1kY29uZl9zdHJpbmdpZnkobWRfZGF0YSk7XG5cblx0XHRcdFx0XHRcdFx0XHRyZXR1cm4gZnMub3V0cHV0RmlsZShmaWxlLCBtZClcblx0XHRcdFx0XHRcdFx0XHRcdC50aGVuKHIgPT5cblx0XHRcdFx0XHRcdFx0XHRcdHtcblxuXHRcdFx0XHRcdFx0XHRcdFx0XHRjb25zb2xlRGVidWcuc3VjY2VzcyhgW0FUVEFDSF1gLCBgW1NBVkVdYCwgYCR7cGF0aC5yZWxhdGl2ZShwYXRoX25vdmVsLCBmaWxlKX1gKTtcblxuXHRcdFx0XHRcdFx0XHRcdFx0XHRyZXR1cm4gcjtcblx0XHRcdFx0XHRcdFx0XHRcdH0pXG5cdFx0XHRcdFx0XHRcdFx0XHQ7XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdH0pXG5cdFx0XHRcdH0pXG5cdFx0XHRcdDtcblx0XHR9XG5cblx0XHRyZXR1cm4gUHJvbWlzZUJsdWViaXJkLnJlc29sdmUoKVxuXHR9XG5cblx0cHJvdGVjdGVkIGFzeW5jIF9wcm9jZXNzTm92ZWw8VCA9IGFueT4obm92ZWw6IElOb3ZlbCwgb3B0aW9uc1J1bnRpbWU6IElPcHRpb25zUnVudGltZSwgX2NhY2hlXzoge1xuXHRcdHVybDogVVJMLFxuXHRcdHBhdGhfbm92ZWw6IHN0cmluZyxcblx0fSwgLi4uYXJndilcblx0e1xuXHRcdGNvbnN0IHNlbGYgPSB0aGlzO1xuXHRcdGxldCBpZHggPSBvcHRpb25zUnVudGltZS5zdGFydEluZGV4IHx8IDA7XG5cblx0XHRsZXQgeyB1cmwsIHBhdGhfbm92ZWwgfSA9IF9jYWNoZV87XG5cblx0XHRyZXR1cm4gUHJvbWlzZUJsdWViaXJkXG5cdFx0XHQubWFwU2VyaWVzKG5vdmVsLnZvbHVtZV9saXN0LCAodm9sdW1lLCB2aWQpID0+XG5cdFx0XHR7XG5cdFx0XHRcdGxldCBkaXJuYW1lOiBzdHJpbmc7XG5cblx0XHRcdFx0e1xuXHRcdFx0XHRcdGxldCBfdmlkID0gJyc7XG5cblx0XHRcdFx0XHRpZiAoIW9wdGlvbnNSdW50aW1lLm5vRGlyUHJlZml4KVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdF92aWQgPSB2aWQudG9TdHJpbmcoKS5wYWRTdGFydCg0LCAnMCcpICsgJzAnO1xuXHRcdFx0XHRcdFx0X3ZpZCArPSAnXyc7XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0ZGlybmFtZSA9IHBhdGguam9pbihwYXRoX25vdmVsLFxuXHRcdFx0XHRcdFx0YCR7X3ZpZH0ke3NlbGYudHJpbUZpbGVuYW1lVm9sdW1lKHZvbHVtZS52b2x1bWVfdGl0bGUpfWAsXG5cdFx0XHRcdFx0KTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGNvbnNvbGVEZWJ1Zy5kZWJ1Zyh2aWQsIHZvbHVtZS52b2x1bWVfdGl0bGUpO1xuXG5cdFx0XHRcdGlmICghb3B0aW9uc1J1bnRpbWUubm9GaXJlUHJlZml4ICYmIG9wdGlvbnNSdW50aW1lLmZpbGVQcmVmaXhNb2RlID49IDIpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRsZXQgaTogbnVtYmVyO1xuXG5cdFx0XHRcdFx0bGV0IGJvb2wgPSB2b2x1bWUuY2hhcHRlcl9saXN0LmV2ZXJ5KGZ1bmN0aW9uIChjaGFwdGVyLCBqKVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdGxldCBtID0gKG9wdGlvbnNSdW50aW1lLmZpbGVQcmVmaXhNb2RlID4gMyA/XG5cdFx0XHRcdFx0XHRcdFx0Y2hhcHRlci5jaGFwdGVyX3RpdGxlIDogbm9ybWFsaXplX3ZhbChjaGFwdGVyLmNoYXB0ZXJfdGl0bGUpXG5cdFx0XHRcdFx0XHRcdClcblx0XHRcdFx0XHRcdFx0LnJlcGxhY2UoL15cXEQrLywgJycpXG5cdFx0XHRcdFx0XHRcdC8vLnJlcGxhY2UoL14oXFxkKykuKyQvLCAnJDEnKVxuXHRcdFx0XHRcdFx0XHQucmVwbGFjZSgvXihcXGQrKVxcRC4qJC8sICckMScpXG5cdFx0XHRcdFx0XHQ7XG5cblx0XHRcdFx0XHRcdC8vY29uc29sZS5sb2cobSwgY2hhcHRlci5jaGFwdGVyX3RpdGxlKTtcblxuXHRcdFx0XHRcdFx0aWYgKC9eXFxkKyQvLnRlc3QobSkpXG5cdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdGxldCBtMiA9IHBhcnNlSW50KG0pO1xuXG5cdFx0XHRcdFx0XHRcdGlmIChqID09IDApXG5cdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHRpID0gbTI7XG5cblx0XHRcdFx0XHRcdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRlbHNlIGlmIChtMiA9PT0gKytpKVxuXHRcdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdFx0XHRcdH0pO1xuXG5cdFx0XHRcdFx0Ly9jb25zb2xlLmxvZyhib29sKTtcblxuXHRcdFx0XHRcdGlmIChib29sKVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdHZvbHVtZS5jaGFwdGVyX2xpc3QuZm9yRWFjaChmdW5jdGlvbiAoY2hhcHRlcilcblx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0Y2hhcHRlci5jaGFwdGVyX2luZGV4ID0gJyc7XG5cdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRpZiAob3B0aW9uc1J1bnRpbWUuZXZlbnQpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRzZWxmLmVtaXQob3B0aW9uc1J1bnRpbWUuZXZlbnQsICd2b2x1bWUnLCB2b2x1bWUsIHtcblx0XHRcdFx0XHRcdG9wdGlvbnNSdW50aW1lLFxuXHRcdFx0XHRcdFx0ZGlybmFtZSxcblx0XHRcdFx0XHRcdHZpZCxcblx0XHRcdFx0XHRcdG5vdmVsLFxuXHRcdFx0XHRcdFx0dXJsLFxuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0cmV0dXJuIFByb21pc2VCbHVlYmlyZFxuXHRcdFx0XHRcdC5tYXBTZXJpZXModm9sdW1lLmNoYXB0ZXJfbGlzdCwgYXN5bmMgKGNoYXB0ZXIsIGNpZCkgPT5cblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHQvL2NoYXB0ZXIuY2hhcHRlcl9pbmRleCA9IChpZHgrKyk7XG5cblx0XHRcdFx0XHRcdGNvbnN0IGN1cnJlbnRfaWR4ID0gaWR4Kys7XG5cblx0XHRcdFx0XHRcdGxldCBmaWxlID0gZ2V0RmlsZVBhdGgoc2VsZiwge1xuXHRcdFx0XHRcdFx0XHRjaGFwdGVyLCBjaWQsXG5cdFx0XHRcdFx0XHRcdGV4dDogJy50eHQnLFxuXG5cdFx0XHRcdFx0XHRcdGlkeDogY3VycmVudF9pZHgsXG5cblx0XHRcdFx0XHRcdFx0ZGlybmFtZSxcblx0XHRcdFx0XHRcdFx0dm9sdW1lLCB2aWQsXG5cdFx0XHRcdFx0XHR9LCBvcHRpb25zUnVudGltZSk7XG5cblx0XHRcdFx0XHRcdGlmIChzZWxmLl9jaGVja0V4aXN0cyhvcHRpb25zUnVudGltZSwgZmlsZSkpXG5cdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdGNvbnNvbGVEZWJ1Zy5kZWJ1ZyhgW1NLSVBdYCwgdmlkLCBjaWQsIGNoYXB0ZXIuY2hhcHRlcl90aXRsZSk7XG5cblx0XHRcdFx0XHRcdFx0cmV0dXJuIGZpbGU7XG5cdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdGxldCB1cmwgPSBzZWxmLl9jcmVhdGVDaGFwdGVyVXJsKHtcblx0XHRcdFx0XHRcdFx0bm92ZWwsXG5cdFx0XHRcdFx0XHRcdHZvbHVtZSxcblx0XHRcdFx0XHRcdFx0Y2hhcHRlcixcblx0XHRcdFx0XHRcdH0sIG9wdGlvbnNSdW50aW1lKTtcblxuXHRcdFx0XHRcdFx0Y29uc29sZURlYnVnLmRlYnVnKHZpZCwgY2lkLCBjaGFwdGVyLmNoYXB0ZXJfdGl0bGUpO1xuXHRcdFx0XHRcdFx0Ly9jb25zb2xlRGVidWcuZGVidWcodXJsLnRvU3RyaW5nKCkpO1xuXG5cdFx0XHRcdFx0XHRhd2FpdCBzZWxmLl9mZXRjaENoYXB0ZXJNYWluKHtcblx0XHRcdFx0XHRcdFx0XHR1cmwsXG5cdFx0XHRcdFx0XHRcdFx0ZmlsZSxcblx0XHRcdFx0XHRcdFx0XHR2b2x1bWUsXG5cdFx0XHRcdFx0XHRcdFx0Y2hhcHRlcixcblx0XHRcdFx0XHRcdFx0fSwgb3B0aW9uc1J1bnRpbWUsIHtcblx0XHRcdFx0XHRcdFx0XHRub3ZlbCxcblx0XHRcdFx0XHRcdFx0fSlcblxuXHRcdFx0XHRcdFx0XHQudGhlbihhc3luYyAodGV4dDogc3RyaW5nKSA9PlxuXHRcdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdFx0YXdhaXQgdGhpcy5fc2F2ZUZpbGUoe1xuXHRcdFx0XHRcdFx0XHRcdFx0ZmlsZSxcblx0XHRcdFx0XHRcdFx0XHRcdGNvbnRleHQ6IHRleHQsXG5cdFx0XHRcdFx0XHRcdFx0XHRvcHRpb25zUnVudGltZSxcblx0XHRcdFx0XHRcdFx0XHR9KTtcblxuXHRcdFx0XHRcdFx0XHRcdHJldHVybiB0ZXh0O1xuXHRcdFx0XHRcdFx0XHR9KVxuXHRcdFx0XHRcdFx0O1xuXG5cdFx0XHRcdFx0XHRyZXR1cm4gZmlsZTtcblx0XHRcdFx0XHR9KVxuXHRcdFx0XHRcdDtcblx0XHRcdH0pXG5cdFx0XHQudGhlbihmdW5jdGlvbiAocmV0KVxuXHRcdFx0e1xuXHRcdFx0XHRyZXR1cm4gcmV0IGFzIGFueSBhcyBUO1xuXHRcdFx0fSlcblx0XHRcdDtcblx0fVxuXG5cdHByb2Nlc3NOb3ZlbDxUPihub3ZlbDogSU5vdmVsLCBvcHRpb25zUnVudGltZTogSU9wdGlvbnNSdW50aW1lLCBfY2FjaGVfOiB7XG5cdFx0dXJsOiBVUkwsXG5cdFx0cGF0aF9ub3ZlbDogc3RyaW5nLFxuXHR9LCAuLi5hcmd2KVxuXHR7XG5cdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdGxldCBwcjogYW55O1xuXG5cdFx0Y29uc29sZURlYnVnLmluZm8oJ+mWi+Wni+iZleeQhuWwj+iqqicpO1xuXG5cdFx0cHIgPSBvcHRpb25zUnVudGltZS5mZXRjaE1ldGFEYXRhT25seSA/IFtdIDogdGhpcy5fcHJvY2Vzc05vdmVsPFQ+KG5vdmVsLCBvcHRpb25zUnVudGltZSwgX2NhY2hlXywgLi4uYXJndik7XG5cblx0XHRyZXR1cm4gUHJvbWlzZUJsdWViaXJkXG5cdFx0XHQucmVzb2x2ZShwcilcblx0XHRcdC50aGVuKGZ1bmN0aW9uIChyZXQ6IFQpXG5cdFx0XHR7XG5cdFx0XHRcdHJldHVybiB7XG5cdFx0XHRcdFx0bm92ZWwsXG5cdFx0XHRcdFx0b3B0aW9uc1J1bnRpbWUsXG5cdFx0XHRcdFx0X2NhY2hlXyxcblx0XHRcdFx0XHRyZXQsXG5cdFx0XHRcdH07XG5cdFx0XHR9KVxuXHRcdFx0O1xuXHR9XG5cblx0cHJvdGVjdGVkIF9zdHJpcENvbnRlbnQodGV4dDogc3RyaW5nKVxuXHR7XG5cdFx0cmV0dXJuIHRleHQ7XG5cdH1cblxuXHRwcm90ZWN0ZWQgX3BhcnNlQ2hhcHRlcjxUPihyZXQ6IElGZXRjaENoYXB0ZXIsIG9wdGlvbnNSdW50aW1lOiBUICYgSU9wdGlvbnNSdW50aW1lLCBjYWNoZToge1xuXHRcdGZpbGU6IHN0cmluZyxcblx0XHRub3ZlbDogX05vdmVsU2l0ZS5JTm92ZWwsXG5cdFx0dm9sdW1lOiBfTm92ZWxTaXRlLklWb2x1bWUsXG5cdFx0Y2hhcHRlcjogX05vdmVsU2l0ZS5JQ2hhcHRlcixcblx0XHRkb1JldHJ5OiBudW1iZXIsXG5cdH0pOiBzdHJpbmcgfCBQcm9taXNlPHN0cmluZz5cblx0e1xuXHRcdGlmICghcmV0KVxuXHRcdHtcblx0XHRcdHJldHVybiAnJztcblx0XHR9XG5cblx0XHR0aHJvdyBuZXcgU3ludGF4RXJyb3IoYEZ1bmN0aW9uIG5vdCBpbXBsZW1lbnRlZGApO1xuXHR9XG5cblx0cHJvdGVjdGVkIF9mZXRjaENoYXB0ZXJSZXRyeUVycm9yPFQ+KG1lc3NhZ2U6IHN0cmluZywgcmV0OiBJRmV0Y2hDaGFwdGVyLCBvcHRpb25zUnVudGltZTogVCAmIElPcHRpb25zUnVudGltZSwgY2FjaGU6IHtcblx0XHRmaWxlOiBzdHJpbmcsXG5cdFx0bm92ZWw6IF9Ob3ZlbFNpdGUuSU5vdmVsLFxuXHRcdHZvbHVtZTogX05vdmVsU2l0ZS5JVm9sdW1lLFxuXHRcdGNoYXB0ZXI6IF9Ob3ZlbFNpdGUuSUNoYXB0ZXIsXG5cdFx0ZG9SZXRyeTogbnVtYmVyLFxuXHR9KTogRXJyb3IgJiB7XG5cdFx0ZG9SZXRyeTogbnVtYmVyXG5cdH1cblx0e1xuXHRcdGxldCBlOiBFcnJvciAmIHtcblx0XHRcdGRvUmV0cnk6IG51bWJlclxuXHRcdH0gPSBuZXcgRXJyb3IobWVzc2FnZSkgYXMgYW55O1xuXG5cdFx0ZS5kb1JldHJ5ID0gKGNhY2hlLmRvUmV0cnkgfCAwKSArIDE7XG5cblx0XHRyZXR1cm4gZVxuXHR9XG5cblx0cHJvdGVjdGVkIF9mZXRjaENoYXB0ZXJNYWluPFQ+KGFyZ3Y6IHtcblx0XHR1cmw6IFVSTCxcblx0XHRmaWxlOiBzdHJpbmcsXG5cdFx0dm9sdW1lOiBfTm92ZWxTaXRlLklWb2x1bWUsXG5cdFx0Y2hhcHRlcjogX05vdmVsU2l0ZS5JQ2hhcHRlcixcblx0fSwgb3B0aW9uc1J1bnRpbWU6IFQgJiBJT3B0aW9uc1J1bnRpbWUsIF9jYWNoZV86IHtcblx0XHRub3ZlbDogSU5vdmVsLFxuXHR9KVxuXHR7XG5cdFx0Y29uc3Qgc2VsZiA9IHRoaXM7XG5cblx0XHRsZXQgeyB1cmwsIGZpbGUsIHZvbHVtZSwgY2hhcHRlciB9ID0gYXJndjtcblx0XHRsZXQgeyBub3ZlbCB9ID0gX2NhY2hlXztcblxuXHRcdHJldHVybiBQcm9taXNlQmx1ZWJpcmQucmVzb2x2ZSgpXG5cdFx0XHQudGhlbihhc3luYyAoKSA9PlxuXHRcdFx0e1xuXHRcdFx0XHRsZXQgX2RvID0gZmFsc2U7XG5cdFx0XHRcdGxldCBkb1JldHJ5ID0gMDtcblx0XHRcdFx0bGV0IHZhbHVlOiBzdHJpbmc7XG5cdFx0XHRcdGRvXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRfZG8gPSBmYWxzZTtcblxuXHRcdFx0XHRcdHZhbHVlID0gYXdhaXQgc2VsZi5fZmV0Y2hDaGFwdGVyKHVybCwgb3B0aW9uc1J1bnRpbWUsIHtcblx0XHRcdFx0XHRcdFx0bm92ZWwsXG5cdFx0XHRcdFx0XHR9KVxuXHRcdFx0XHRcdFx0LnRoZW4oYXN5bmMgKHJldCkgPT5cblx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0cmV0dXJuIHNlbGYuX3BhcnNlQ2hhcHRlcihyZXQsIG9wdGlvbnNSdW50aW1lLCB7XG5cdFx0XHRcdFx0XHRcdFx0ZmlsZSxcblx0XHRcdFx0XHRcdFx0XHRub3ZlbCxcblx0XHRcdFx0XHRcdFx0XHR2b2x1bWUsXG5cdFx0XHRcdFx0XHRcdFx0Y2hhcHRlcixcblx0XHRcdFx0XHRcdFx0XHRkb1JldHJ5LFxuXHRcdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHRcdH0pXG5cdFx0XHRcdFx0XHQuY2F0Y2goYXN5bmMgKGU6IEVycm9yICYge1xuXHRcdFx0XHRcdFx0XHRkb1JldHJ5OiBudW1iZXJcblx0XHRcdFx0XHRcdH0pID0+XG5cdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdGlmIChlLmRvUmV0cnkgPiAwICYmIGUuZG9SZXRyeSA8IDUpXG5cdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHRfZG8gPSB0cnVlO1xuXHRcdFx0XHRcdFx0XHRcdGRvUmV0cnkgPSBlLmRvUmV0cnkgfCAwO1xuXHRcdFx0XHRcdFx0XHRcdGxldCBkZWxheSA9IDUwMDAgKyBkb1JldHJ5ICogMTAwMCArIChhcmd2LnZvbHVtZS52b2x1bWVfaW5kZXggYXMgYW55IHwgMCArICBhcmd2LmNoYXB0ZXIuY2hhcHRlcl9pbmRleCBhcyBhbnkgfCAwKSAqIDEwO1xuXG5cdFx0XHRcdFx0XHRcdFx0Y29uc29sZS53YXJuKGUubWVzc2FnZSwgZG9SZXRyeSwgZGVsYXkpO1xuXG5cdFx0XHRcdFx0XHRcdFx0YXdhaXQgUHJvbWlzZUJsdWViaXJkLmRlbGF5KGRlbGF5KTtcblxuXHRcdFx0XHRcdFx0XHRcdHJldHVyblxuXHRcdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdFx0cmV0dXJuIFByb21pc2UucmVqZWN0KGUpXG5cdFx0XHRcdFx0XHR9KVxuXG5cdFx0XHRcdH1cblx0XHRcdFx0d2hpbGUgKF9kbyk7XG5cblx0XHRcdFx0cmV0dXJuIHZhbHVlXG5cdFx0XHR9KVxuXHRcdFx0LnRoZW4oZnVuY3Rpb24gKHRleHQpXG5cdFx0XHR7XG5cdFx0XHRcdGlmICh0eXBlb2YgdGV4dCA9PSAnc3RyaW5nJylcblx0XHRcdFx0e1xuXHRcdFx0XHRcdHJldHVybiBub3ZlbFRleHQudG9TdHIodGV4dCk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRyZXR1cm4gdGV4dDtcblx0XHRcdH0pXG5cdFx0XHQ7XG5cdH1cblxuXHRwcm90ZWN0ZWQgX2ZldGNoQ2hhcHRlcjxUPih1cmw6IFVSTCwgb3B0aW9uc1J1bnRpbWU6IFQgJiBJT3B0aW9uc1J1bnRpbWUsIF9jYWNoZV86IHtcblx0XHRub3ZlbDogSU5vdmVsLFxuXHR9KVxuXHR7XG5cdFx0cmV0dXJuIFByb21pc2VCbHVlYmlyZC5yZXNvbHZlKCkudGhlbihhc3luYyBmdW5jdGlvbiAoKVxuXHRcdHtcblx0XHRcdGNvbnNvbGVEZWJ1Zy5kZWJ1ZyhgZmV0Y2hDaGFwdGVyYCwgdXJsLnRvU3RyaW5nKCkpO1xuXG5cdFx0XHRsZXQgcmV0ID0ge30gYXMgSUZldGNoQ2hhcHRlcjtcblxuXHRcdFx0bGV0IG9wdHMgPSBnZXRPcHRpb25zKG9wdGlvbnNSdW50aW1lKTtcblxuXHRcdFx0aWYgKG9wdGlvbnNSdW50aW1lLmRpc2FibGVEb3dubG9hZClcblx0XHRcdHtcblx0XHRcdFx0cmV0dXJuIG51bGw7XG5cdFx0XHR9XG5cdFx0XHRlbHNlIGlmICh0cnVlKVxuXHRcdFx0e1xuXHRcdFx0XHRpZiAob3B0aW9uc1J1bnRpbWUucmV0cnlEZWxheSA+IDApXG5cdFx0XHRcdHtcblx0XHRcdFx0XHQvLyBAdHMtaWdub3JlXG5cdFx0XHRcdFx0b3B0cy5yZXF1ZXN0T3B0aW9ucy5kZWxheSA9IG9wdGlvbnNSdW50aW1lLnJldHJ5RGVsYXk7XG5cdFx0XHRcdH1cblx0XHRcdFx0ZWxzZVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdFx0XHRcdG9wdHMucmVxdWVzdE9wdGlvbnMucmV0cnkgPSAxO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0YXdhaXQgcmV0cnlSZXF1ZXN0KHVybCwgb3B0cy5yZXF1ZXN0T3B0aW9ucylcblx0XHRcdFx0XHQudGhlbihmdW5jdGlvbiAocmVzKVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdGNvbnN0IGNvbnRlbnRUeXBlUGFyc2VkID0gcGFyc2VDb250ZW50VHlwZShyZXMuaGVhZGVyc1tcImNvbnRlbnQtdHlwZVwiXSk7XG5cblx0XHRcdFx0XHRcdHJldC5jb250ZW50VHlwZVBhcnNlZCA9IGNvbnRlbnRUeXBlUGFyc2VkO1xuXG5cdFx0XHRcdFx0XHQvLyBAdHMtaWdub3JlXG5cdFx0XHRcdFx0XHRyZXQudXJsID0gdXJsO1xuXG5cdFx0XHRcdFx0XHRpZiAoY29udGVudFR5cGVQYXJzZWQuaXNIVE1MKCkgfHwgY29udGVudFR5cGVQYXJzZWQuaXNYTUwoKSlcblx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0cmV0LmRvbSA9IHJlcXVlc3RUb0pTRE9NKHJlcywgdXJsLCBvcHRpb25zUnVudGltZS5vcHRpb25zSlNET00pO1xuXHRcdFx0XHRcdFx0XHRyZXQuZG9tID0gcGFja0pTRE9NKHJldC5kb20pO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0ZWxzZSBpZiAoY29udGVudFR5cGVQYXJzZWQuc3VidHlwZSA9PSAnanNvbicpXG5cdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdHJldC5qc29uID0gSlNPTi5wYXJzZShyZXMuYm9keS50b1N0cmluZygpKTtcblx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0cmV0LnJlcyA9IHJlcztcblx0XHRcdFx0XHRcdHJldC5ib2R5ID0gcmVzLmJvZHk7XG5cdFx0XHRcdFx0fSlcblx0XHRcdFx0O1xuXHRcdFx0fVxuXHRcdFx0ZWxzZVxuXHRcdFx0e1xuXHRcdFx0XHQvLyBAdHMtaWdub3JlXG5cdFx0XHRcdHJldC5kb20gPSBhd2FpdCBmcm9tVVJMKHVybCwgb3B0aW9uc1J1bnRpbWUub3B0aW9uc0pTRE9NKTtcblxuXHRcdFx0XHRyZXQucmVzID0gcmV0LmRvbS5fb3B0aW9ucy5SZXNwb25zZTtcblx0XHRcdFx0cmV0LmJvZHkgPSByZXQuZG9tLl9vcHRpb25zLmJvZHk7XG5cdFx0XHR9XG5cblx0XHRcdHJldHVybiByZXQ7XG5cdFx0fSk7XG5cdH1cblxuXHRwcm90ZWN0ZWQgX2V4cG9ydERvd25sb2FkT3B0aW9uczxUID0gSU9wdGlvbnNSdW50aW1lPihvcHRpb25zUnVudGltZT86IFQgJiBJT3B0aW9uc1J1bnRpbWUpOiBQYXJ0aWFsPFQgJiBJT3B0aW9uc1J1bnRpbWU+XG5cdHtcblx0XHRsZXQgb3B0czogUGFydGlhbDxUICYgSU9wdGlvbnNSdW50aW1lPiA9IHt9O1xuXG5cdFx0aWYgKG9wdGlvbnNSdW50aW1lKVxuXHRcdHtcblx0XHRcdGxldCBib29sOiBib29sZWFuO1xuXG5cdFx0XHRmb3IgKGxldCBrIG9mIFtcblx0XHRcdFx0J25vRmlyZVByZWZpeCcsXG5cdFx0XHRcdCdub0ZpbGVQYWRlbmQnLFxuXHRcdFx0XHQnZmlsZVByZWZpeE1vZGUnLFxuXHRcdFx0XHQnc3RhcnRJbmRleCcsXG5cdFx0XHRcdCdrZWVwUnVieScsXG5cdFx0XHRcdCdrZWVwRm9ybWF0Jyxcblx0XHRcdFx0J2tlZXBJbWFnZScsXG5cdFx0XHRcdCdhbGxvd0VtcHR5Vm9sdW1lVGl0bGUnLFxuXHRcdFx0XHQnZGlzYWJsZU91dHB1dERpclByZWZpeCcsXG5cdFx0XHRdIGFzIChrZXlvZiBJT3B0aW9uc1J1bnRpbWUpW10pXG5cdFx0XHR7XG5cdFx0XHRcdGlmICgoayBpbiBvcHRpb25zUnVudGltZSkgJiYgdHlwZW9mIG9wdGlvbnNSdW50aW1lW2tdICE9PSAndW5kZWZpbmVkJylcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGJvb2wgPSB0cnVlO1xuXHRcdFx0XHRcdC8vIEB0cy1pZ25vcmVcblx0XHRcdFx0XHRvcHRzW2tdID0gb3B0aW9uc1J1bnRpbWVba107XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cblx0XHRyZXR1cm4gb3B0cztcblx0fVxuXG5cdHByb3RlY3RlZCBfc2F2ZVJlYWRtZShvcHRpb25zUnVudGltZTogSU9wdGlvbnNSdW50aW1lLCBvcHRpb25zID0ge30sIC4uLm9wdHMpXG5cdHtcblx0XHRpZiAodGhpcy5JREtFWSlcblx0XHR7XG5cdFx0XHRvcHRpb25zW3RoaXMuSURLRVldID0gb3B0aW9uc1t0aGlzLklES0VZXSB8fCB7fTtcblxuXHRcdFx0dHJ5XG5cdFx0XHR7XG5cdFx0XHRcdG9wdGlvbnNbdGhpcy5JREtFWV0ubm92ZWxfaWQgPSBvcHRpb25zW3RoaXMuSURLRVldLm5vdmVsX2lkIHx8IG9wdGlvbnNSdW50aW1lW1NZTUJPTF9DQUNIRV0ubm92ZWwudXJsX2RhdGEubm92ZWxfaWQ7XG5cdFx0XHR9XG5cdFx0XHRjYXRjaCAoZSlcblx0XHRcdHtcblx0XHRcdH1cblx0XHR9XG5cblx0XHRsZXQgZG93bmxvYWRPcHRpb25zID0gdGhpcy5fZXhwb3J0RG93bmxvYWRPcHRpb25zKG9wdGlvbnNSdW50aW1lKTtcblxuXHRcdHJldHVybiBzdXBlci5fc2F2ZVJlYWRtZShvcHRpb25zUnVudGltZSwgb3B0aW9ucywge1xuXHRcdFx0b3B0aW9uczoge1xuXHRcdFx0XHR0ZXh0bGF5b3V0OiB7XG5cdFx0XHRcdFx0YWxsb3dfbGYyOiB0cnVlLFxuXHRcdFx0XHR9LFxuXHRcdFx0XHRkb3dubG9hZE9wdGlvbnM6IGRvd25sb2FkT3B0aW9ucyB8fCB7fSxcblx0XHRcdH0sXG5cdFx0fSwgLi4ub3B0cyk7XG5cdH1cblxuXHRwcm90ZWN0ZWQgX2dldF9tZXRhKGlucHV0VXJsLCBvcHRpb25zUnVudGltZSwgY2FjaGU/OiB7XG5cdFx0ZG9tPzogSUpTRE9NLFxuXHR9KVxuXHR7XG5cdFx0dGhyb3cgbmV3IFN5bnRheEVycm9yKCk7XG5cdH1cblxufVxuXG5leHBvcnQgY29uc3QgTm92ZWxTaXRlID0gTm92ZWxTaXRlRGVtbyBhcyB0eXBlb2YgTm92ZWxTaXRlRGVtbztcblxuZXhwb3J0IGRlZmF1bHQgTm92ZWxTaXRlRGVtbztcbiJdfQ==