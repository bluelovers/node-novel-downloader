"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NovelSite = exports.NovelSiteDemo = void 0;
const fetch_1 = require("../../fetch");
const fs_extra_1 = __importDefault(require("fs-extra"));
const upath2_1 = __importDefault(require("upath2"));
const jsdom_extra_1 = require("jsdom-extra");
//import { URL } from 'jsdom-url';
const fs_1 = require("../fs");
const jsdom_1 = require("../../jsdom");
const helper_1 = require("node-novel-globby/lib/helper");
const g_1 = require("node-novel-globby/g");
const layout_reporter_1 = require("@node-novel/layout-reporter");
const md_1 = require("@node-novel/layout-reporter/lib/md");
const index_1 = __importStar(require("../index"));
const index_2 = require("../index");
const content_type_parser_1 = __importDefault(require("content-type-parser"));
const novel_text_1 = __importDefault(require("novel-text"));
const jsdom_extra_2 = require("jsdom-extra");
const jsdom_extra_3 = require("jsdom-extra");
const log_1 = require("../../util/log");
const tree_1 = require("../../tree");
const array_hyper_unique_1 = require("array-hyper-unique");
const outputNovelToAttach_1 = __importDefault(require("../../util/outputNovelToAttach"));
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
                    let file = upath2_1.default.join(path_novel, `${self.trimFilenameNovel(novel.novel_title)}.${novel.url_data.novel_id}.json`);
                    return fs_extra_1.default.outputJSON(file, novel, {
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
                    let _p = upath2_1.default.parse(file);
                    const _cache_key_ = upath2_1.default.join(_p.dir, _p.name);
                    await fs_extra_1.default
                        .readFile(upath2_1.default.join(path_novel, file))
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
                    return fs_extra_1.default.outputFile(upath2_1.default.join(path_novel, 'ja2.md'), md);
                });
                return novel;
            });
        }
        async _outputAttach(novel, optionsRuntime, _cache_, ...argv) {
            const self = this;
            const { url, path_novel } = _cache_;
            const { keepImage = false } = optionsRuntime;
            if (novel.novelTree) {
                let treeList = tree_1.NovelTree.treeToList(novel.novelTree, true);
                return index_2.PromiseBluebird
                    .each(treeList.slice(1), async (listRow) => {
                    var _a;
                    let volume = listRow.content;
                    if (volume.type !== 'volume' || !((_a = volume.imgs) === null || _a === void 0 ? void 0 : _a.length)) {
                        return;
                    }
                    const dirname = upath2_1.default.join(path_novel, volume.dirname);
                    const imgs = array_hyper_unique_1.array_unique_overwrite(volume.imgs).filter(v => v);
                    volume.imgs = imgs;
                    return outputNovelToAttach_1.default({
                        imgs,
                        dirname,
                        keepImage,
                        path_novel,
                    });
                });
            }
            else if (novel.volume_list) {
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
                        dirname = upath2_1.default.join(path_novel, `${_vid}${self.trimFilenameVolume(volume.volume_title)}`);
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
                        log_1.consoleDebug.debug(`[ATTACH]`, `${upath2_1.default.relative(path_novel, dirname)}`, imgs.length);
                        if (imgs.length) {
                            return outputNovelToAttach_1.default({
                                imgs,
                                dirname,
                                keepImage,
                                path_novel,
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
                    dirname = upath2_1.default.join(path_novel, `${_vid}${self.trimFilenameVolume(volume.volume_title)}`);
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
                        const contentTypeParsed = content_type_parser_1.default(res.headers["content-type"]);
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
//# sourceMappingURL=base.js.map