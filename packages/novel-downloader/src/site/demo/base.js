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
                        let delay = 5000 + doRetry * 1000;
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
exports.NovelSiteDemo = NovelSiteDemo;
exports.NovelSite = NovelSiteDemo;
exports.default = NovelSiteDemo;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFzZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImJhc2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFBQSx1Q0FBMkM7QUFDM0MsK0JBQWdDO0FBQ2hDLCtCQUFnQztBQUVoQyw2Q0FBMEY7QUFFMUYsOEJBQW9DO0FBRXBDLHVDQUF5QztBQUN6Qyx5REFBNkQ7QUFDN0QsMkNBQWtEO0FBQ2xELGlFQU1xQztBQUNyQywyREFBaUY7QUFHakYsb0NBQTJGO0FBQzNGLG9DQUEyQztBQUUzQyx3REFBeUQ7QUFDekQsMkNBQW1DO0FBRW5DLDZDQUF3RDtBQUV4RCw2Q0FBMEM7QUFFMUMscUNBQStFO0FBVy9FLHdDQUF1RTtBQUN2RSwwQ0FBMEM7QUFpQjFDLElBQWEsYUFBYSxHQUExQixNQUFhLGFBQWMsU0FBUSxlQUFVO0lBSTVDLFlBQVksT0FBeUIsRUFBRSxHQUFHLElBQUk7UUFFN0MsS0FBSyxDQUFDLE9BQU8sRUFBRSxHQUFHLElBQUksQ0FBQyxDQUFDO0lBQ3pCLENBQUM7SUFFRDs7Ozs7OztPQU9HO0lBQ0gsZ0JBQWdCLENBQW1CLElBQU8sRUFBRSxpQkFBa0MsRUFBRTtRQUUvRSxPQUFPLElBQUksQ0FBQztJQUNiLENBQUM7SUFFRCxPQUFPLENBQXNCLGNBQTZDLEVBQUUsR0FBUSxFQUFFLE1BQWU7UUFFcEcsS0FBSyxDQUFDLE9BQU8sQ0FBQyxjQUFjLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFFbkMsSUFBSSxjQUFjLENBQUMsV0FBVyxJQUFJLE1BQU0sQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLFdBQVcsQ0FBQyxDQUFDLE1BQU0sRUFDaEY7WUFDQyxNQUFNLENBQUMsT0FBTyxDQUFDLGNBQWMsQ0FBQyxXQUFXLENBQUM7aUJBQ3hDLE9BQU8sQ0FBQyxVQUFVLElBQUk7Z0JBRXRCLElBQUksQ0FBd0IsQ0FBQztnQkFDN0IsSUFBSSxLQUFLLEdBQUcsT0FBTyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBRTNC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QU8sRUFBRTtnQkFDUixVQUFVLEVBQUU7b0JBQ1gsU0FBUyxFQUFFLElBQUk7aUJBQ2Y7Z0JBQ0QsZUFBZSxFQUFFLGVBQWUsSUFBSSxFQUFFO2FBQ3RDO1NBQ0QsRUFBRSxHQUFHLElBQUksQ0FBQyxDQUFDO0lBQ2IsQ0FBQztJQUVTLFNBQVMsQ0FBQyxRQUFRLEVBQUUsY0FBYyxFQUFFLEtBRTdDO1FBRUEsTUFBTSxJQUFJLFdBQVcsRUFBRSxDQUFDO0lBQ3pCLENBQUM7Q0FFRCxDQUFBO0FBM3VCdUIsbUJBQUssR0FBVyxJQUFJLENBQUM7QUFGaEMsYUFBYTtJQUR6Qix3QkFBZ0IsRUFBOEM7O0dBQ2xELGFBQWEsQ0E2dUJ6QjtBQTd1Qlksc0NBQWE7QUErdUJiLFFBQUEsU0FBUyxHQUFHLGFBQXFDLENBQUM7QUFFL0Qsa0JBQWUsYUFBYSxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgcmV0cnlSZXF1ZXN0IH0gZnJvbSAnLi4vLi4vZmV0Y2gnO1xuaW1wb3J0IGZzID0gcmVxdWlyZSgnZnMtZXh0cmEnKTtcbmltcG9ydCBwYXRoID0gcmVxdWlyZSgndXBhdGgyJyk7XG5pbXBvcnQgbm92ZWxJbmZvLCB7IElNZGNvbmZNZXRhIH0gZnJvbSAnbm9kZS1ub3ZlbC1pbmZvJztcbmltcG9ydCB7IGZyb21VUkwsIElGcm9tVXJsT3B0aW9ucywgSUpTRE9NLCByZXF1ZXN0VG9KU0RPTSwgcGFja0pTRE9NIH0gZnJvbSAnanNkb20tZXh0cmEnO1xuaW1wb3J0IHsgVVJMIH0gZnJvbSAnanNkb20tdXJsJztcbmltcG9ydCB7IGdldEZpbGVQYXRoIH0gZnJvbSAnLi4vZnMnO1xuXG5pbXBvcnQgeyBnZXRPcHRpb25zIH0gZnJvbSAnLi4vLi4vanNkb20nO1xuaW1wb3J0IHsgbm9ybWFsaXplX3ZhbCB9IGZyb20gJ25vZGUtbm92ZWwtZ2xvYmJ5L2xpYi9oZWxwZXInO1xuaW1wb3J0IHsgZ2xvYmJ5QVN5bmMgfSBmcm9tICdub2RlLW5vdmVsLWdsb2JieS9nJztcbmltcG9ydCB7XG5cdGxhenlBbmFseXplUmVwb3J0QWxsLFxuXHRsYXp5QW5hbHl6ZUFsbCxcblx0ZHVtbXlDYWNoZSxcblx0YW5hbHl6ZUphMDAyLFxuXHRoYW5kbGVKYTAwMixcbn0gZnJvbSAnQG5vZGUtbm92ZWwvbGF5b3V0LXJlcG9ydGVyJztcbmltcG9ydCB7IG91dHB1dEJsb2NrMDAyLCBvdXRwdXRKYTAwMiB9IGZyb20gJ0Bub2RlLW5vdmVsL2xheW91dC1yZXBvcnRlci9saWIvbWQnO1xuaW1wb3J0IHsgSVRTUGFydGlhbFBpY2sgfSBmcm9tICd0cy10eXBlJztcblxuaW1wb3J0IF9Ob3ZlbFNpdGUsIHsgc3RhdGljSW1wbGVtZW50cywgZGVmYXVsdEpTRE9NT3B0aW9ucywgU1lNQk9MX0NBQ0hFIH0gZnJvbSAnLi4vaW5kZXgnO1xuaW1wb3J0IHsgUHJvbWlzZUJsdWViaXJkIH0gZnJvbSAnLi4vaW5kZXgnO1xuXG5pbXBvcnQgcGFyc2VDb250ZW50VHlwZSA9IHJlcXVpcmUoJ2NvbnRlbnQtdHlwZS1wYXJzZXInKTtcbmltcG9ydCBub3ZlbFRleHQgZnJvbSAnbm92ZWwtdGV4dCc7XG5cbmltcG9ydCB7IExhenlDb29raWUsIExhenlDb29raWVKYXIgfSBmcm9tICdqc2RvbS1leHRyYSc7XG5cbmltcG9ydCB7IHRvdWdoQ29va2llIH0gZnJvbSAnanNkb20tZXh0cmEnO1xuXG5pbXBvcnQgeyBzdHJpbmdpZnkgYXMgbWRjb25mX3N0cmluZ2lmeSwgcGFyc2UgYXMgbWRjb25mX3BhcnNlIH0gZnJvbSAnbWRjb25mMic7XG5cbmV4cG9ydCB0eXBlIElPcHRpb25zUGx1cyA9IHt9XG5cbmV4cG9ydCB0eXBlIElEb3dubG9hZE9wdGlvbnMgPSBfTm92ZWxTaXRlLklEb3dubG9hZE9wdGlvbnMgJiBfTm92ZWxTaXRlLklPcHRpb25zICYgSU9wdGlvbnNQbHVzXG5leHBvcnQgdHlwZSBJT3B0aW9uc1J1bnRpbWUgPSBfTm92ZWxTaXRlLklPcHRpb25zUnVudGltZSAmIElPcHRpb25zUGx1c1xuXG5leHBvcnQgaW1wb3J0IElOb3ZlbCA9IF9Ob3ZlbFNpdGUuSU5vdmVsO1xuXG5pbXBvcnQgeyBSZXNwb25zZVJlcXVlc3QgfSBmcm9tICdyZXF1ZXN0JztcblxuaW1wb3J0IHsgY2hhbGtCeUNvbnNvbGUsIGNvbnNvbGUsIGNvbnNvbGVEZWJ1ZyB9IGZyb20gJy4uLy4uL3V0aWwvbG9nJztcbmltcG9ydCB7IGhhc2hTdW0gfSBmcm9tICcuLi8uLi91dGlsL2hhc2gnO1xuXG5leHBvcnQgdHlwZSBJRmV0Y2hDaGFwdGVyID0ge1xuXHRib2R5PzogYW55O1xuXHRkb20/OiBJSlNET007XG5cdHJlcz86IFJlc3BvbnNlUmVxdWVzdDtcblx0anNvbj8sXG5cblx0dXJsPzogVVJMLFxuXHRjb250ZW50VHlwZVBhcnNlZD86IFJldHVyblR5cGU8cGFyc2VDb250ZW50VHlwZT4sXG59O1xuXG5leHBvcnQgdHlwZSBJU2Vzc2lvbkRhdGEgPSB7XG5cdFtrZXk6IHN0cmluZ106IGFueSxcbn1cblxuQHN0YXRpY0ltcGxlbWVudHM8X05vdmVsU2l0ZS5JTm92ZWxTaXRlU3RhdGljPE5vdmVsU2l0ZURlbW8+PigpXG5leHBvcnQgY2xhc3MgTm92ZWxTaXRlRGVtbyBleHRlbmRzIF9Ob3ZlbFNpdGVcbntcblx0cHVibGljIHN0YXRpYyByZWFkb25seSBJREtFWTogc3RyaW5nID0gbnVsbDtcblxuXHRjb25zdHJ1Y3RvcihvcHRpb25zOiBJRG93bmxvYWRPcHRpb25zLCAuLi5hcmd2KVxuXHR7XG5cdFx0c3VwZXIob3B0aW9ucywgLi4uYXJndik7XG5cdH1cblxuXHQvKipcblx0ICogQHRvZG8g6K6T5q2k5pa55rOV5pyJ5oSP576pXG5cdCAqXG5cdCAqIOeUqOS+huiqquaYjuebruWJjeermem7nueahOaJgOmcgCBzZXNzaW9uIGNvb2tpZXNcblx0ICpcblx0ICogQHBhcmFtIHtUfSBkYXRhXG5cdCAqIEByZXR1cm5zIHtUfVxuXHQgKi9cblx0Y2hlY2tTZXNzaW9uRGF0YTxUID0gSVNlc3Npb25EYXRhPihkYXRhOiBULCBvcHRpb25zUnVudGltZTogSU9wdGlvbnNSdW50aW1lID0ge30pXG5cdHtcblx0XHRyZXR1cm4gZGF0YTtcblx0fVxuXG5cdHNlc3Npb248VCA9IElPcHRpb25zUnVudGltZT4ob3B0aW9uc1J1bnRpbWU6IFBhcnRpYWw8VCAmIElEb3dubG9hZE9wdGlvbnM+LCB1cmw6IFVSTCwgZG9tYWluPzogc3RyaW5nKVxuXHR7XG5cdFx0c3VwZXIuc2Vzc2lvbihvcHRpb25zUnVudGltZSwgdXJsKTtcblxuXHRcdGlmIChvcHRpb25zUnVudGltZS5zZXNzaW9uRGF0YSAmJiBPYmplY3Qua2V5cyhvcHRpb25zUnVudGltZS5zZXNzaW9uRGF0YSkubGVuZ3RoKVxuXHRcdHtcblx0XHRcdE9iamVjdC5lbnRyaWVzKG9wdGlvbnNSdW50aW1lLnNlc3Npb25EYXRhKVxuXHRcdFx0XHQuZm9yRWFjaChmdW5jdGlvbiAoZGF0YSlcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGxldCBjOiBMYXp5Q29va2llLlByb3BlcnRpZXM7XG5cdFx0XHRcdFx0bGV0IHR5cGVjID0gdHlwZW9mIGRhdGFbMV07XG5cblx0XHRcdFx0XHRpZiAoZGF0YVsxXSAmJiB0eXBlYyA9PSAnb2JqZWN0Jylcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRjID0gZGF0YVsxXTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0ZWxzZSBpZiAodHlwZWMgPT09IG51bGwgfHwgdHlwZWMgIT0gJ29iamVjdCcpXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0bGV0IFtrZXksIHZhbHVlXSA9IGRhdGE7XG5cblx0XHRcdFx0XHRcdGMgPSB7XG5cdFx0XHRcdFx0XHRcdGtleSxcblx0XHRcdFx0XHRcdFx0dmFsdWUsXG5cdFx0XHRcdFx0XHR9O1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRlbHNlXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0YyA9IGRhdGFbMV07XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0aWYgKGMpXG5cdFx0XHRcdFx0e1xuXG5cdFx0XHRcdFx0XHRpZiAodHlwZW9mIGMgPT0gJ29iamVjdCcpXG5cdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdGlmICghYy5wYXRoKVxuXHRcdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdFx0Yy5wYXRoID0gJy8nO1xuXHRcdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdFx0aWYgKGMuaG9zdE9ubHkgPT0gbnVsbClcblx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdGMuaG9zdE9ubHkgPSBmYWxzZTtcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHRpZiAoISh0eXBlb2YgYyA9PT0gJ3N0cmluZycgfHwgYyBpbnN0YW5jZW9mIExhenlDb29raWUgfHwgYyBpbnN0YW5jZW9mIHRvdWdoQ29va2llLkNvb2tpZSkpXG5cdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdC8vIEB0cy1pZ25vcmVcblx0XHRcdFx0XHRcdFx0YyA9IG5ldyB0b3VnaENvb2tpZS5Db29raWUoYylcblx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0b3B0aW9uc1J1bnRpbWUub3B0aW9uc0pTRE9NLmNvb2tpZUphclxuXHRcdFx0XHRcdFx0XHQuc2V0Q29va2llU3luYyhjLCB1cmwuaHJlZilcblx0XHRcdFx0XHRcdDtcblxuXHRcdFx0XHRcdFx0aWYgKHR5cGVvZiBjID09ICdvYmplY3QnICYmICFjLmRvbWFpbilcblx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0aWYgKGRvbWFpbilcblx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdGMuZG9tYWluID0gZG9tYWluO1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdGVsc2UgaWYgKHVybCAmJiB1cmwuaG9zdClcblx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdGMuZG9tYWluID0gdXJsLmhvc3Q7XG5cdFx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0XHR0cnlcblx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdG9wdGlvbnNSdW50aW1lLm9wdGlvbnNKU0RPTS5jb29raWVKYXJcblx0XHRcdFx0XHRcdFx0XHRcdC5zZXRDb29raWVTeW5jKGMsIHVybC5ocmVmKVxuXHRcdFx0XHRcdFx0XHRcdDtcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRjYXRjaCAoZSlcblx0XHRcdFx0XHRcdFx0e1xuXG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0pXG5cdFx0XHQ7XG5cblx0XHRcdGNvbnNvbGVEZWJ1Zy5kZWJ1Zyhgc2Vzc2lvbmAsIG9wdGlvbnNSdW50aW1lLm9wdGlvbnNKU0RPTS5jb29raWVKYXIpO1xuXHRcdH1cblxuXHRcdHJldHVybiB0aGlzO1xuXHR9XG5cblx0ZG93bmxvYWQoaW5wdXRVcmw6IHN0cmluZyB8IFVSTCwgZG93bmxvYWRPcHRpb25zOiBJRG93bmxvYWRPcHRpb25zID0ge30pXG5cdHtcblx0XHRjb25zdCBzZWxmID0gdGhpcztcblx0XHRsZXQgdXJsID0gaW5wdXRVcmwgYXMgVVJMO1xuXG5cdFx0Y29uc3QgW1BBVEhfTk9WRUxfTUFJTiwgb3B0aW9uc1J1bnRpbWVdID0gdGhpcy5nZXRPdXRwdXREaXI8SU9wdGlvbnNSdW50aW1lICYgSURvd25sb2FkT3B0aW9ucz4oZG93bmxvYWRPcHRpb25zKTtcblxuXHRcdGNvbnNvbGVEZWJ1Zy5lbmFibGVkID0gb3B0aW9uc1J1bnRpbWUuZGVidWdMb2c7XG5cblx0XHRyZXR1cm4gUHJvbWlzZUJsdWViaXJkXG5cdFx0XHQuYmluZChzZWxmKVxuXHRcdFx0LnRoZW4oYXN5bmMgKCkgPT5cblx0XHRcdHtcblx0XHRcdFx0dXJsID0gYXdhaXQgdGhpcy5jcmVhdGVNYWluVXJsKHVybCwgb3B0aW9uc1J1bnRpbWUpO1xuXG5cdFx0XHRcdHNlbGYuc2Vzc2lvbihvcHRpb25zUnVudGltZSwgdXJsKTtcblxuXHRcdFx0XHRjb25zb2xlRGVidWcuaW5mbygn5YiG5p6Q56ug56+A5YiX6KGoJywgdXJsLnRvU3RyaW5nKCkpO1xuXG5cdFx0XHRcdGxldCBub3ZlbCA9IGF3YWl0IHNlbGYuZ2V0X3ZvbHVtZV9saXN0PElPcHRpb25zUnVudGltZSAmIElEb3dubG9hZE9wdGlvbnM+KHVybCwgb3B0aW9uc1J1bnRpbWUpO1xuXG5cdFx0XHRcdGxldCBwYXRoX25vdmVsID0gc2VsZi5nZXRQYXRoTm92ZWwoUEFUSF9OT1ZFTF9NQUlOLCBub3ZlbCwgb3B0aW9uc1J1bnRpbWUpO1xuXG5cdFx0XHRcdHNlbGYuX2xvYWRFeGlzdHNDb25mKHVybCwgb3B0aW9uc1J1bnRpbWUsIG5vdmVsLCBwYXRoX25vdmVsKTtcblxuXHRcdFx0XHRsZXQgaWR4ID0gb3B0aW9uc1J1bnRpbWUuc3RhcnRJbmRleCB8fCAwO1xuXG5cdFx0XHRcdG9wdGlvbnNSdW50aW1lW1NZTUJPTF9DQUNIRV0ubm92ZWwgPSBub3ZlbDtcblx0XHRcdFx0b3B0aW9uc1J1bnRpbWVbU1lNQk9MX0NBQ0hFXS5wYXRoX25vdmVsID0gcGF0aF9ub3ZlbDtcblxuXHRcdFx0XHRhd2FpdCBQcm9taXNlQmx1ZWJpcmRcblx0XHRcdFx0XHQucmVzb2x2ZShzZWxmLnByb2Nlc3NOb3ZlbChub3ZlbCwgb3B0aW9uc1J1bnRpbWUsIHtcblx0XHRcdFx0XHRcdHVybCxcblx0XHRcdFx0XHRcdHBhdGhfbm92ZWwsXG5cdFx0XHRcdFx0fSkpXG5cdFx0XHRcdFx0LnRhcChscyA9PlxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdHJldHVybiBzZWxmLl9vdXRwdXRBdHRhY2gobm92ZWwsIG9wdGlvbnNSdW50aW1lLCB7XG5cdFx0XHRcdFx0XHRcdHVybCxcblx0XHRcdFx0XHRcdFx0cGF0aF9ub3ZlbCxcblx0XHRcdFx0XHRcdH0pXG5cdFx0XHRcdFx0fSlcblx0XHRcdFx0XHQudGFwKGxzID0+XG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0bGV0IGZpbGUgPSBwYXRoLmpvaW4ocGF0aF9ub3ZlbCxcblx0XHRcdFx0XHRcdFx0YCR7c2VsZi50cmltRmlsZW5hbWVOb3ZlbChub3ZlbC5ub3ZlbF90aXRsZSl9LiR7bm92ZWwudXJsX2RhdGEubm92ZWxfaWR9Lmpzb25gLFxuXHRcdFx0XHRcdFx0XHQpXG5cdFx0XHRcdFx0XHQ7XG5cblx0XHRcdFx0XHRcdHJldHVybiBmcy5vdXRwdXRKU09OKGZpbGUsIG5vdmVsLCB7XG5cdFx0XHRcdFx0XHRcdHNwYWNlczogXCJcXHRcIixcblx0XHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdH0pXG5cdFx0XHRcdDtcblxuXHRcdFx0XHRhd2FpdCBzZWxmLl9zYXZlUmVhZG1lKG9wdGlvbnNSdW50aW1lKTtcblxuXHRcdFx0XHRsZXQgX2NhY2hlID0gZHVtbXlDYWNoZSgpO1xuXG5cdFx0XHRcdGF3YWl0IGdsb2JieUFTeW5jKFtcblx0XHRcdFx0XHQnKiovKi50eHQnLFxuXHRcdFx0XHRdLCB7XG5cdFx0XHRcdFx0Y3dkOiBwYXRoX25vdmVsLFxuXHRcdFx0XHR9KVxuXHRcdFx0XHRcdC5tYXBTZXJpZXMoYXN5bmMgKGZpbGUpID0+XG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0bGV0IF9wID0gcGF0aC5wYXJzZShmaWxlKTtcblx0XHRcdFx0XHRcdGNvbnN0IF9jYWNoZV9rZXlfID0gcGF0aC5qb2luKF9wLmRpciwgX3AubmFtZSk7XG5cblx0XHRcdFx0XHRcdGF3YWl0IGZzXG5cdFx0XHRcdFx0XHRcdC5yZWFkRmlsZShwYXRoLmpvaW4ocGF0aF9ub3ZlbCwgZmlsZSkpXG5cdFx0XHRcdFx0XHRcdC50aGVuKGJ1ZiA9PlxuXHRcdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdFx0YW5hbHl6ZUphMDAyKHtcblx0XHRcdFx0XHRcdFx0XHRcdGlucHV0OiBidWYudG9TdHJpbmcoKSxcblx0XHRcdFx0XHRcdFx0XHRcdF9jYWNoZV9rZXlfLFxuXHRcdFx0XHRcdFx0XHRcdFx0X2NhY2hlLFxuXHRcdFx0XHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdFx0XHR9KVxuXHRcdFx0XHRcdFx0O1xuXHRcdFx0XHRcdH0pXG5cdFx0XHRcdFx0LnRhcChhc3luYyAoKSA9PlxuXHRcdFx0XHRcdHtcblxuXHRcdFx0XHRcdFx0bGV0IG1kID0gb3V0cHV0SmEwMDIoe1xuXHRcdFx0XHRcdFx0XHRpbnB1dERhdGE6IF9jYWNoZS5qYTIsXG5cdFx0XHRcdFx0XHR9KTtcblxuXHRcdFx0XHRcdFx0cmV0dXJuIGZzLm91dHB1dEZpbGUocGF0aC5qb2luKHBhdGhfbm92ZWwsICdqYTIubWQnKSwgbWQpXG5cdFx0XHRcdFx0fSlcblx0XHRcdFx0O1xuXG5cdFx0XHRcdHJldHVybiBub3ZlbDtcblx0XHRcdH0pXG5cdFx0XHQ7XG5cdH1cblxuXHRwcm90ZWN0ZWQgYXN5bmMgX291dHB1dEF0dGFjaDxUID0gYW55Pihub3ZlbDogSU5vdmVsLCBvcHRpb25zUnVudGltZTogSU9wdGlvbnNSdW50aW1lLCBfY2FjaGVfOiB7XG5cdFx0dXJsOiBVUkwsXG5cdFx0cGF0aF9ub3ZlbDogc3RyaW5nLFxuXHR9LCAuLi5hcmd2KVxuXHR7XG5cdFx0Y29uc3Qgc2VsZiA9IHRoaXM7XG5cdFx0Y29uc3QgeyB1cmwsIHBhdGhfbm92ZWwgfSA9IF9jYWNoZV87XG5cblx0XHRpZiAobm92ZWwudm9sdW1lX2xpc3QpXG5cdFx0e1xuXHRcdFx0Y29uc3QgeyBrZWVwSW1hZ2UgPSBmYWxzZSB9ID0gb3B0aW9uc1J1bnRpbWU7XG5cblx0XHRcdGNvbnNvbGVEZWJ1Zy5pbmZvKGDmqqLmn6UgQVRUQUNIIOizh+aWmWApO1xuXG5cdFx0XHRyZXR1cm4gUHJvbWlzZUJsdWViaXJkXG5cdFx0XHRcdC5yZXNvbHZlKG5vdmVsLnZvbHVtZV9saXN0KVxuXHRcdFx0XHQuZWFjaCgodm9sdW1lLCB2aWQpID0+XG5cdFx0XHRcdHtcblxuXHRcdFx0XHRcdGxldCBkaXJuYW1lOiBzdHJpbmc7XG5cblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRsZXQgX3ZpZCA9ICcnO1xuXG5cdFx0XHRcdFx0XHRpZiAoIW9wdGlvbnNSdW50aW1lLm5vRGlyUHJlZml4KVxuXHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRfdmlkID0gdmlkLnRvU3RyaW5nKCkucGFkU3RhcnQoNCwgJzAnKSArICcwJztcblx0XHRcdFx0XHRcdFx0X3ZpZCArPSAnXyc7XG5cdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdGRpcm5hbWUgPSBwYXRoLmpvaW4ocGF0aF9ub3ZlbCxcblx0XHRcdFx0XHRcdFx0YCR7X3ZpZH0ke3NlbGYudHJpbUZpbGVuYW1lVm9sdW1lKHZvbHVtZS52b2x1bWVfdGl0bGUpfWAsXG5cdFx0XHRcdFx0XHQpO1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdGxldCBpbWdzOiBzdHJpbmdbXSA9IFtdO1xuXG5cdFx0XHRcdFx0cmV0dXJuIFByb21pc2VCbHVlYmlyZFxuXHRcdFx0XHRcdFx0LnJlc29sdmUodm9sdW1lLmNoYXB0ZXJfbGlzdClcblx0XHRcdFx0XHRcdC5lYWNoKGFzeW5jIChjaGFwdGVyKSA9PlxuXHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRpZiAoY2hhcHRlci5pbWdzKVxuXHRcdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdFx0aW1ncy5wdXNoKC4uLmNoYXB0ZXIuaW1ncyk7XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdH0pXG5cdFx0XHRcdFx0XHQudGFwKGFzeW5jICgpID0+XG5cdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdGltZ3MgPSBpbWdzLmZpbHRlcih2ID0+IHYpO1xuXG5cdFx0XHRcdFx0XHRcdGNvbnNvbGVEZWJ1Zy5kZWJ1ZyhgW0FUVEFDSF1gLCBgJHtwYXRoLnJlbGF0aXZlKHBhdGhfbm92ZWwsIGRpcm5hbWUpfWAsIGltZ3MubGVuZ3RoKTtcblxuXHRcdFx0XHRcdFx0XHRpZiAoaW1ncy5sZW5ndGgpXG5cdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHRsZXQgZmlsZSA9IHBhdGguam9pbihkaXJuYW1lLCAnQVRUQUNILm1kJyk7XG5cblx0XHRcdFx0XHRcdFx0XHRsZXQgbWRfZGF0YSA9IHtcblx0XHRcdFx0XHRcdFx0XHRcdGF0dGFjaDoge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRpbWFnZXM6IHt9IGFzIFJlY29yZDxzdHJpbmcsIHN0cmluZz4sXG5cdFx0XHRcdFx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdFx0XHRcdH07XG5cblx0XHRcdFx0XHRcdFx0XHRpZiAoa2VlcEltYWdlIHx8IDEpXG5cdFx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdFx0YXdhaXQgZnMucmVhZEZpbGUoZmlsZSlcblx0XHRcdFx0XHRcdFx0XHRcdFx0LnRoZW4odiA9PiBtZGNvbmZfcGFyc2UodikpXG5cdFx0XHRcdFx0XHRcdFx0XHRcdC8vIEB0cy1pZ25vcmVcblx0XHRcdFx0XHRcdFx0XHRcdFx0LnRoZW4oKGRhdGE6IHR5cGVvZiBtZF9kYXRhKSA9PlxuXHRcdFx0XHRcdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0ZGF0YS5hdHRhY2ggPSBkYXRhLmF0dGFjaCB8fCB7fSBhcyBhbnk7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0ZGF0YS5hdHRhY2guaW1hZ2VzID0gZGF0YS5hdHRhY2guaW1hZ2VzIHx8IHt9O1xuXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0bWRfZGF0YSA9IGRhdGE7XG5cblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRjb25zb2xlRGVidWcuZGVidWcoYExvYWQgZGF0YSBmcm9tIGV4aXN0cyBBVFRBQ0gubWRgKVxuXHRcdFx0XHRcdFx0XHRcdFx0XHR9KVxuXHRcdFx0XHRcdFx0XHRcdFx0XHQuY2F0Y2goZSA9PiBudWxsKVxuXHRcdFx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0XHRcdG1kX2RhdGEuYXR0YWNoLmltYWdlcyA9IE9iamVjdFxuXHRcdFx0XHRcdFx0XHRcdFx0LmVudHJpZXMoaW1ncyBhcyBzdHJpbmdbXSlcblx0XHRcdFx0XHRcdFx0XHRcdC5yZWR1Y2UoKGEsIFtrLCB2XSkgPT5cblx0XHRcdFx0XHRcdFx0XHRcdHtcblxuXHRcdFx0XHRcdFx0XHRcdFx0XHRpZiAoa2VlcEltYWdlKVxuXHRcdFx0XHRcdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0YVtoYXNoU3VtKHYpXSA9IHY7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0XHRcdFx0ZWxzZVxuXHRcdFx0XHRcdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0YVtrLnRvU3RyaW5nKCkucGFkU3RhcnQoMywgJzAnKV0gPSB2O1xuXHRcdFx0XHRcdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdFx0XHRcdFx0cmV0dXJuIGFcblx0XHRcdFx0XHRcdFx0XHRcdH0sIG1kX2RhdGEuYXR0YWNoLmltYWdlcyk7XG5cblx0XHRcdFx0XHRcdFx0XHRsZXQgbWQgPSBtZGNvbmZfc3RyaW5naWZ5KG1kX2RhdGEpO1xuXG5cdFx0XHRcdFx0XHRcdFx0cmV0dXJuIGZzLm91dHB1dEZpbGUoZmlsZSwgbWQpXG5cdFx0XHRcdFx0XHRcdFx0XHQudGhlbihyID0+XG5cdFx0XHRcdFx0XHRcdFx0XHR7XG5cblx0XHRcdFx0XHRcdFx0XHRcdFx0Y29uc29sZURlYnVnLnN1Y2Nlc3MoYFtBVFRBQ0hdYCwgYFtTQVZFXWAsIGAke3BhdGgucmVsYXRpdmUocGF0aF9ub3ZlbCwgZmlsZSl9YCk7XG5cblx0XHRcdFx0XHRcdFx0XHRcdFx0cmV0dXJuIHI7XG5cdFx0XHRcdFx0XHRcdFx0XHR9KVxuXHRcdFx0XHRcdFx0XHRcdFx0O1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHR9KVxuXHRcdFx0XHR9KVxuXHRcdFx0XHQ7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIFByb21pc2VCbHVlYmlyZC5yZXNvbHZlKClcblx0fVxuXG5cdHByb3RlY3RlZCBhc3luYyBfcHJvY2Vzc05vdmVsPFQgPSBhbnk+KG5vdmVsOiBJTm92ZWwsIG9wdGlvbnNSdW50aW1lOiBJT3B0aW9uc1J1bnRpbWUsIF9jYWNoZV86IHtcblx0XHR1cmw6IFVSTCxcblx0XHRwYXRoX25vdmVsOiBzdHJpbmcsXG5cdH0sIC4uLmFyZ3YpXG5cdHtcblx0XHRjb25zdCBzZWxmID0gdGhpcztcblx0XHRsZXQgaWR4ID0gb3B0aW9uc1J1bnRpbWUuc3RhcnRJbmRleCB8fCAwO1xuXG5cdFx0bGV0IHsgdXJsLCBwYXRoX25vdmVsIH0gPSBfY2FjaGVfO1xuXG5cdFx0cmV0dXJuIFByb21pc2VCbHVlYmlyZFxuXHRcdFx0Lm1hcFNlcmllcyhub3ZlbC52b2x1bWVfbGlzdCwgKHZvbHVtZSwgdmlkKSA9PlxuXHRcdFx0e1xuXHRcdFx0XHRsZXQgZGlybmFtZTogc3RyaW5nO1xuXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRsZXQgX3ZpZCA9ICcnO1xuXG5cdFx0XHRcdFx0aWYgKCFvcHRpb25zUnVudGltZS5ub0RpclByZWZpeClcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRfdmlkID0gdmlkLnRvU3RyaW5nKCkucGFkU3RhcnQoNCwgJzAnKSArICcwJztcblx0XHRcdFx0XHRcdF92aWQgKz0gJ18nO1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdGRpcm5hbWUgPSBwYXRoLmpvaW4ocGF0aF9ub3ZlbCxcblx0XHRcdFx0XHRcdGAke192aWR9JHtzZWxmLnRyaW1GaWxlbmFtZVZvbHVtZSh2b2x1bWUudm9sdW1lX3RpdGxlKX1gLFxuXHRcdFx0XHRcdCk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRjb25zb2xlRGVidWcuZGVidWcodmlkLCB2b2x1bWUudm9sdW1lX3RpdGxlKTtcblxuXHRcdFx0XHRpZiAoIW9wdGlvbnNSdW50aW1lLm5vRmlyZVByZWZpeCAmJiBvcHRpb25zUnVudGltZS5maWxlUHJlZml4TW9kZSA+PSAyKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0bGV0IGk6IG51bWJlcjtcblxuXHRcdFx0XHRcdGxldCBib29sID0gdm9sdW1lLmNoYXB0ZXJfbGlzdC5ldmVyeShmdW5jdGlvbiAoY2hhcHRlciwgailcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRsZXQgbSA9IChvcHRpb25zUnVudGltZS5maWxlUHJlZml4TW9kZSA+IDMgP1xuXHRcdFx0XHRcdFx0XHRcdGNoYXB0ZXIuY2hhcHRlcl90aXRsZSA6IG5vcm1hbGl6ZV92YWwoY2hhcHRlci5jaGFwdGVyX3RpdGxlKVxuXHRcdFx0XHRcdFx0XHQpXG5cdFx0XHRcdFx0XHRcdC5yZXBsYWNlKC9eXFxEKy8sICcnKVxuXHRcdFx0XHRcdFx0XHQvLy5yZXBsYWNlKC9eKFxcZCspLiskLywgJyQxJylcblx0XHRcdFx0XHRcdFx0LnJlcGxhY2UoL14oXFxkKylcXEQuKiQvLCAnJDEnKVxuXHRcdFx0XHRcdFx0O1xuXG5cdFx0XHRcdFx0XHQvL2NvbnNvbGUubG9nKG0sIGNoYXB0ZXIuY2hhcHRlcl90aXRsZSk7XG5cblx0XHRcdFx0XHRcdGlmICgvXlxcZCskLy50ZXN0KG0pKVxuXHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRsZXQgbTIgPSBwYXJzZUludChtKTtcblxuXHRcdFx0XHRcdFx0XHRpZiAoaiA9PSAwKVxuXHRcdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdFx0aSA9IG0yO1xuXG5cdFx0XHRcdFx0XHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0ZWxzZSBpZiAobTIgPT09ICsraSlcblx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdHJldHVybiB0cnVlO1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdFx0XHR9KTtcblxuXHRcdFx0XHRcdC8vY29uc29sZS5sb2coYm9vbCk7XG5cblx0XHRcdFx0XHRpZiAoYm9vbClcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHR2b2x1bWUuY2hhcHRlcl9saXN0LmZvckVhY2goZnVuY3Rpb24gKGNoYXB0ZXIpXG5cdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdGNoYXB0ZXIuY2hhcHRlcl9pbmRleCA9ICcnO1xuXHRcdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cblx0XHRcdFx0aWYgKG9wdGlvbnNSdW50aW1lLmV2ZW50KVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0c2VsZi5lbWl0KG9wdGlvbnNSdW50aW1lLmV2ZW50LCAndm9sdW1lJywgdm9sdW1lLCB7XG5cdFx0XHRcdFx0XHRvcHRpb25zUnVudGltZSxcblx0XHRcdFx0XHRcdGRpcm5hbWUsXG5cdFx0XHRcdFx0XHR2aWQsXG5cdFx0XHRcdFx0XHRub3ZlbCxcblx0XHRcdFx0XHRcdHVybCxcblx0XHRcdFx0XHR9KTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdHJldHVybiBQcm9taXNlQmx1ZWJpcmRcblx0XHRcdFx0XHQubWFwU2VyaWVzKHZvbHVtZS5jaGFwdGVyX2xpc3QsIGFzeW5jIChjaGFwdGVyLCBjaWQpID0+XG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0Ly9jaGFwdGVyLmNoYXB0ZXJfaW5kZXggPSAoaWR4KyspO1xuXG5cdFx0XHRcdFx0XHRjb25zdCBjdXJyZW50X2lkeCA9IGlkeCsrO1xuXG5cdFx0XHRcdFx0XHRsZXQgZmlsZSA9IGdldEZpbGVQYXRoKHNlbGYsIHtcblx0XHRcdFx0XHRcdFx0Y2hhcHRlciwgY2lkLFxuXHRcdFx0XHRcdFx0XHRleHQ6ICcudHh0JyxcblxuXHRcdFx0XHRcdFx0XHRpZHg6IGN1cnJlbnRfaWR4LFxuXG5cdFx0XHRcdFx0XHRcdGRpcm5hbWUsXG5cdFx0XHRcdFx0XHRcdHZvbHVtZSwgdmlkLFxuXHRcdFx0XHRcdFx0fSwgb3B0aW9uc1J1bnRpbWUpO1xuXG5cdFx0XHRcdFx0XHRpZiAoc2VsZi5fY2hlY2tFeGlzdHMob3B0aW9uc1J1bnRpbWUsIGZpbGUpKVxuXHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRjb25zb2xlRGVidWcuZGVidWcoYFtTS0lQXWAsIHZpZCwgY2lkLCBjaGFwdGVyLmNoYXB0ZXJfdGl0bGUpO1xuXG5cdFx0XHRcdFx0XHRcdHJldHVybiBmaWxlO1xuXHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHRsZXQgdXJsID0gc2VsZi5fY3JlYXRlQ2hhcHRlclVybCh7XG5cdFx0XHRcdFx0XHRcdG5vdmVsLFxuXHRcdFx0XHRcdFx0XHR2b2x1bWUsXG5cdFx0XHRcdFx0XHRcdGNoYXB0ZXIsXG5cdFx0XHRcdFx0XHR9LCBvcHRpb25zUnVudGltZSk7XG5cblx0XHRcdFx0XHRcdGNvbnNvbGVEZWJ1Zy5kZWJ1Zyh2aWQsIGNpZCwgY2hhcHRlci5jaGFwdGVyX3RpdGxlKTtcblx0XHRcdFx0XHRcdC8vY29uc29sZURlYnVnLmRlYnVnKHVybC50b1N0cmluZygpKTtcblxuXHRcdFx0XHRcdFx0YXdhaXQgc2VsZi5fZmV0Y2hDaGFwdGVyTWFpbih7XG5cdFx0XHRcdFx0XHRcdFx0dXJsLFxuXHRcdFx0XHRcdFx0XHRcdGZpbGUsXG5cdFx0XHRcdFx0XHRcdFx0dm9sdW1lLFxuXHRcdFx0XHRcdFx0XHRcdGNoYXB0ZXIsXG5cdFx0XHRcdFx0XHRcdH0sIG9wdGlvbnNSdW50aW1lLCB7XG5cdFx0XHRcdFx0XHRcdFx0bm92ZWwsXG5cdFx0XHRcdFx0XHRcdH0pXG5cblx0XHRcdFx0XHRcdFx0LnRoZW4oYXN5bmMgKHRleHQ6IHN0cmluZykgPT5cblx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdGF3YWl0IHRoaXMuX3NhdmVGaWxlKHtcblx0XHRcdFx0XHRcdFx0XHRcdGZpbGUsXG5cdFx0XHRcdFx0XHRcdFx0XHRjb250ZXh0OiB0ZXh0LFxuXHRcdFx0XHRcdFx0XHRcdFx0b3B0aW9uc1J1bnRpbWUsXG5cdFx0XHRcdFx0XHRcdFx0fSk7XG5cblx0XHRcdFx0XHRcdFx0XHRyZXR1cm4gdGV4dDtcblx0XHRcdFx0XHRcdFx0fSlcblx0XHRcdFx0XHRcdDtcblxuXHRcdFx0XHRcdFx0cmV0dXJuIGZpbGU7XG5cdFx0XHRcdFx0fSlcblx0XHRcdFx0XHQ7XG5cdFx0XHR9KVxuXHRcdFx0LnRoZW4oZnVuY3Rpb24gKHJldClcblx0XHRcdHtcblx0XHRcdFx0cmV0dXJuIHJldCBhcyBhbnkgYXMgVDtcblx0XHRcdH0pXG5cdFx0XHQ7XG5cdH1cblxuXHRwcm9jZXNzTm92ZWw8VD4obm92ZWw6IElOb3ZlbCwgb3B0aW9uc1J1bnRpbWU6IElPcHRpb25zUnVudGltZSwgX2NhY2hlXzoge1xuXHRcdHVybDogVVJMLFxuXHRcdHBhdGhfbm92ZWw6IHN0cmluZyxcblx0fSwgLi4uYXJndilcblx0e1xuXHRcdC8vIEB0cy1pZ25vcmVcblx0XHRsZXQgcHI6IGFueTtcblxuXHRcdGNvbnNvbGVEZWJ1Zy5pbmZvKCfplovlp4vomZXnkIblsI/oqqonKTtcblxuXHRcdHByID0gb3B0aW9uc1J1bnRpbWUuZmV0Y2hNZXRhRGF0YU9ubHkgPyBbXSA6IHRoaXMuX3Byb2Nlc3NOb3ZlbDxUPihub3ZlbCwgb3B0aW9uc1J1bnRpbWUsIF9jYWNoZV8sIC4uLmFyZ3YpO1xuXG5cdFx0cmV0dXJuIFByb21pc2VCbHVlYmlyZFxuXHRcdFx0LnJlc29sdmUocHIpXG5cdFx0XHQudGhlbihmdW5jdGlvbiAocmV0OiBUKVxuXHRcdFx0e1xuXHRcdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHRcdG5vdmVsLFxuXHRcdFx0XHRcdG9wdGlvbnNSdW50aW1lLFxuXHRcdFx0XHRcdF9jYWNoZV8sXG5cdFx0XHRcdFx0cmV0LFxuXHRcdFx0XHR9O1xuXHRcdFx0fSlcblx0XHRcdDtcblx0fVxuXG5cdHByb3RlY3RlZCBfc3RyaXBDb250ZW50KHRleHQ6IHN0cmluZylcblx0e1xuXHRcdHJldHVybiB0ZXh0O1xuXHR9XG5cblx0cHJvdGVjdGVkIF9wYXJzZUNoYXB0ZXI8VD4ocmV0OiBJRmV0Y2hDaGFwdGVyLCBvcHRpb25zUnVudGltZTogVCAmIElPcHRpb25zUnVudGltZSwgY2FjaGU6IHtcblx0XHRmaWxlOiBzdHJpbmcsXG5cdFx0bm92ZWw6IF9Ob3ZlbFNpdGUuSU5vdmVsLFxuXHRcdHZvbHVtZTogX05vdmVsU2l0ZS5JVm9sdW1lLFxuXHRcdGNoYXB0ZXI6IF9Ob3ZlbFNpdGUuSUNoYXB0ZXIsXG5cdFx0ZG9SZXRyeTogbnVtYmVyLFxuXHR9KTogc3RyaW5nIHwgUHJvbWlzZTxzdHJpbmc+XG5cdHtcblx0XHRpZiAoIXJldClcblx0XHR7XG5cdFx0XHRyZXR1cm4gJyc7XG5cdFx0fVxuXG5cdFx0dGhyb3cgbmV3IFN5bnRheEVycm9yKGBGdW5jdGlvbiBub3QgaW1wbGVtZW50ZWRgKTtcblx0fVxuXG5cdHByb3RlY3RlZCBfZmV0Y2hDaGFwdGVyUmV0cnlFcnJvcjxUPihtZXNzYWdlOiBzdHJpbmcsIHJldDogSUZldGNoQ2hhcHRlciwgb3B0aW9uc1J1bnRpbWU6IFQgJiBJT3B0aW9uc1J1bnRpbWUsIGNhY2hlOiB7XG5cdFx0ZmlsZTogc3RyaW5nLFxuXHRcdG5vdmVsOiBfTm92ZWxTaXRlLklOb3ZlbCxcblx0XHR2b2x1bWU6IF9Ob3ZlbFNpdGUuSVZvbHVtZSxcblx0XHRjaGFwdGVyOiBfTm92ZWxTaXRlLklDaGFwdGVyLFxuXHRcdGRvUmV0cnk6IG51bWJlcixcblx0fSk6IEVycm9yICYge1xuXHRcdGRvUmV0cnk6IG51bWJlclxuXHR9XG5cdHtcblx0XHRsZXQgZTogRXJyb3IgJiB7XG5cdFx0XHRkb1JldHJ5OiBudW1iZXJcblx0XHR9ID0gbmV3IEVycm9yKG1lc3NhZ2UpIGFzIGFueTtcblxuXHRcdGUuZG9SZXRyeSA9IChjYWNoZS5kb1JldHJ5IHwgMCkgKyAxO1xuXG5cdFx0cmV0dXJuIGVcblx0fVxuXG5cdHByb3RlY3RlZCBfZmV0Y2hDaGFwdGVyTWFpbjxUPihhcmd2OiB7XG5cdFx0dXJsOiBVUkwsXG5cdFx0ZmlsZTogc3RyaW5nLFxuXHRcdHZvbHVtZTogX05vdmVsU2l0ZS5JVm9sdW1lLFxuXHRcdGNoYXB0ZXI6IF9Ob3ZlbFNpdGUuSUNoYXB0ZXIsXG5cdH0sIG9wdGlvbnNSdW50aW1lOiBUICYgSU9wdGlvbnNSdW50aW1lLCBfY2FjaGVfOiB7XG5cdFx0bm92ZWw6IElOb3ZlbCxcblx0fSlcblx0e1xuXHRcdGNvbnN0IHNlbGYgPSB0aGlzO1xuXG5cdFx0bGV0IHsgdXJsLCBmaWxlLCB2b2x1bWUsIGNoYXB0ZXIgfSA9IGFyZ3Y7XG5cdFx0bGV0IHsgbm92ZWwgfSA9IF9jYWNoZV87XG5cblx0XHRyZXR1cm4gUHJvbWlzZUJsdWViaXJkLnJlc29sdmUoKVxuXHRcdFx0LnRoZW4oYXN5bmMgKCkgPT5cblx0XHRcdHtcblx0XHRcdFx0bGV0IF9kbyA9IGZhbHNlO1xuXHRcdFx0XHRsZXQgZG9SZXRyeSA9IDA7XG5cdFx0XHRcdGxldCB2YWx1ZTogc3RyaW5nO1xuXHRcdFx0XHRkb1xuXHRcdFx0XHR7XG5cdFx0XHRcdFx0X2RvID0gZmFsc2U7XG5cblx0XHRcdFx0XHR2YWx1ZSA9IGF3YWl0IHNlbGYuX2ZldGNoQ2hhcHRlcih1cmwsIG9wdGlvbnNSdW50aW1lLCB7XG5cdFx0XHRcdFx0XHRcdG5vdmVsLFxuXHRcdFx0XHRcdFx0fSlcblx0XHRcdFx0XHRcdC50aGVuKGFzeW5jIChyZXQpID0+XG5cdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdHJldHVybiBzZWxmLl9wYXJzZUNoYXB0ZXIocmV0LCBvcHRpb25zUnVudGltZSwge1xuXHRcdFx0XHRcdFx0XHRcdGZpbGUsXG5cdFx0XHRcdFx0XHRcdFx0bm92ZWwsXG5cdFx0XHRcdFx0XHRcdFx0dm9sdW1lLFxuXHRcdFx0XHRcdFx0XHRcdGNoYXB0ZXIsXG5cdFx0XHRcdFx0XHRcdFx0ZG9SZXRyeSxcblx0XHRcdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0XHR9KVxuXHRcdFx0XHRcdFx0LmNhdGNoKGFzeW5jIChlOiBFcnJvciAmIHtcblx0XHRcdFx0XHRcdFx0ZG9SZXRyeTogbnVtYmVyXG5cdFx0XHRcdFx0XHR9KSA9PlxuXHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRpZiAoZS5kb1JldHJ5ID4gMCAmJiBlLmRvUmV0cnkgPCA1KVxuXHRcdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdFx0X2RvID0gdHJ1ZTtcblx0XHRcdFx0XHRcdFx0XHRkb1JldHJ5ID0gZS5kb1JldHJ5IHwgMDtcblx0XHRcdFx0XHRcdFx0XHRsZXQgZGVsYXkgPSA1MDAwICsgZG9SZXRyeSAqIDEwMDA7XG5cblx0XHRcdFx0XHRcdFx0XHRjb25zb2xlLndhcm4oZS5tZXNzYWdlLCBkb1JldHJ5LCBkZWxheSk7XG5cblx0XHRcdFx0XHRcdFx0XHRhd2FpdCBQcm9taXNlQmx1ZWJpcmQuZGVsYXkoZGVsYXkpO1xuXG5cdFx0XHRcdFx0XHRcdFx0cmV0dXJuXG5cdFx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0XHRyZXR1cm4gUHJvbWlzZS5yZWplY3QoZSlcblx0XHRcdFx0XHRcdH0pXG5cblx0XHRcdFx0fVxuXHRcdFx0XHR3aGlsZSAoX2RvKTtcblxuXHRcdFx0XHRyZXR1cm4gdmFsdWVcblx0XHRcdH0pXG5cdFx0XHQudGhlbihmdW5jdGlvbiAodGV4dClcblx0XHRcdHtcblx0XHRcdFx0aWYgKHR5cGVvZiB0ZXh0ID09ICdzdHJpbmcnKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0cmV0dXJuIG5vdmVsVGV4dC50b1N0cih0ZXh0KTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdHJldHVybiB0ZXh0O1xuXHRcdFx0fSlcblx0XHRcdDtcblx0fVxuXG5cdHByb3RlY3RlZCBfZmV0Y2hDaGFwdGVyPFQ+KHVybDogVVJMLCBvcHRpb25zUnVudGltZTogVCAmIElPcHRpb25zUnVudGltZSwgX2NhY2hlXzoge1xuXHRcdG5vdmVsOiBJTm92ZWwsXG5cdH0pXG5cdHtcblx0XHRyZXR1cm4gUHJvbWlzZUJsdWViaXJkLnJlc29sdmUoKS50aGVuKGFzeW5jIGZ1bmN0aW9uICgpXG5cdFx0e1xuXHRcdFx0Y29uc29sZURlYnVnLmRlYnVnKGBmZXRjaENoYXB0ZXJgLCB1cmwudG9TdHJpbmcoKSk7XG5cblx0XHRcdGxldCByZXQgPSB7fSBhcyBJRmV0Y2hDaGFwdGVyO1xuXG5cdFx0XHRsZXQgb3B0cyA9IGdldE9wdGlvbnMob3B0aW9uc1J1bnRpbWUpO1xuXG5cdFx0XHRpZiAob3B0aW9uc1J1bnRpbWUuZGlzYWJsZURvd25sb2FkKVxuXHRcdFx0e1xuXHRcdFx0XHRyZXR1cm4gbnVsbDtcblx0XHRcdH1cblx0XHRcdGVsc2UgaWYgKHRydWUpXG5cdFx0XHR7XG5cdFx0XHRcdGlmIChvcHRpb25zUnVudGltZS5yZXRyeURlbGF5ID4gMClcblx0XHRcdFx0e1xuXHRcdFx0XHRcdC8vIEB0cy1pZ25vcmVcblx0XHRcdFx0XHRvcHRzLnJlcXVlc3RPcHRpb25zLmRlbGF5ID0gb3B0aW9uc1J1bnRpbWUucmV0cnlEZWxheTtcblx0XHRcdFx0fVxuXHRcdFx0XHRlbHNlXG5cdFx0XHRcdHtcblx0XHRcdFx0XHQvLyBAdHMtaWdub3JlXG5cdFx0XHRcdFx0b3B0cy5yZXF1ZXN0T3B0aW9ucy5yZXRyeSA9IDE7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRhd2FpdCByZXRyeVJlcXVlc3QodXJsLCBvcHRzLnJlcXVlc3RPcHRpb25zKVxuXHRcdFx0XHRcdC50aGVuKGZ1bmN0aW9uIChyZXMpXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0Y29uc3QgY29udGVudFR5cGVQYXJzZWQgPSBwYXJzZUNvbnRlbnRUeXBlKHJlcy5oZWFkZXJzW1wiY29udGVudC10eXBlXCJdKTtcblxuXHRcdFx0XHRcdFx0cmV0LmNvbnRlbnRUeXBlUGFyc2VkID0gY29udGVudFR5cGVQYXJzZWQ7XG5cblx0XHRcdFx0XHRcdC8vIEB0cy1pZ25vcmVcblx0XHRcdFx0XHRcdHJldC51cmwgPSB1cmw7XG5cblx0XHRcdFx0XHRcdGlmIChjb250ZW50VHlwZVBhcnNlZC5pc0hUTUwoKSB8fCBjb250ZW50VHlwZVBhcnNlZC5pc1hNTCgpKVxuXHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRyZXQuZG9tID0gcmVxdWVzdFRvSlNET00ocmVzLCB1cmwsIG9wdGlvbnNSdW50aW1lLm9wdGlvbnNKU0RPTSk7XG5cdFx0XHRcdFx0XHRcdHJldC5kb20gPSBwYWNrSlNET00ocmV0LmRvbSk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRlbHNlIGlmIChjb250ZW50VHlwZVBhcnNlZC5zdWJ0eXBlID09ICdqc29uJylcblx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0cmV0Lmpzb24gPSBKU09OLnBhcnNlKHJlcy5ib2R5LnRvU3RyaW5nKCkpO1xuXHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHRyZXQucmVzID0gcmVzO1xuXHRcdFx0XHRcdFx0cmV0LmJvZHkgPSByZXMuYm9keTtcblx0XHRcdFx0XHR9KVxuXHRcdFx0XHQ7XG5cdFx0XHR9XG5cdFx0XHRlbHNlXG5cdFx0XHR7XG5cdFx0XHRcdC8vIEB0cy1pZ25vcmVcblx0XHRcdFx0cmV0LmRvbSA9IGF3YWl0IGZyb21VUkwodXJsLCBvcHRpb25zUnVudGltZS5vcHRpb25zSlNET00pO1xuXG5cdFx0XHRcdHJldC5yZXMgPSByZXQuZG9tLl9vcHRpb25zLlJlc3BvbnNlO1xuXHRcdFx0XHRyZXQuYm9keSA9IHJldC5kb20uX29wdGlvbnMuYm9keTtcblx0XHRcdH1cblxuXHRcdFx0cmV0dXJuIHJldDtcblx0XHR9KTtcblx0fVxuXG5cdHByb3RlY3RlZCBfZXhwb3J0RG93bmxvYWRPcHRpb25zPFQgPSBJT3B0aW9uc1J1bnRpbWU+KG9wdGlvbnNSdW50aW1lPzogVCAmIElPcHRpb25zUnVudGltZSk6IFBhcnRpYWw8VCAmIElPcHRpb25zUnVudGltZT5cblx0e1xuXHRcdGxldCBvcHRzOiBQYXJ0aWFsPFQgJiBJT3B0aW9uc1J1bnRpbWU+ID0ge307XG5cblx0XHRpZiAob3B0aW9uc1J1bnRpbWUpXG5cdFx0e1xuXHRcdFx0bGV0IGJvb2w6IGJvb2xlYW47XG5cblx0XHRcdGZvciAobGV0IGsgb2YgW1xuXHRcdFx0XHQnbm9GaXJlUHJlZml4Jyxcblx0XHRcdFx0J25vRmlsZVBhZGVuZCcsXG5cdFx0XHRcdCdmaWxlUHJlZml4TW9kZScsXG5cdFx0XHRcdCdzdGFydEluZGV4Jyxcblx0XHRcdFx0J2tlZXBSdWJ5Jyxcblx0XHRcdFx0J2tlZXBGb3JtYXQnLFxuXHRcdFx0XHQna2VlcEltYWdlJyxcblx0XHRcdFx0J2FsbG93RW1wdHlWb2x1bWVUaXRsZScsXG5cdFx0XHRcdCdkaXNhYmxlT3V0cHV0RGlyUHJlZml4Jyxcblx0XHRcdF0gYXMgKGtleW9mIElPcHRpb25zUnVudGltZSlbXSlcblx0XHRcdHtcblx0XHRcdFx0aWYgKChrIGluIG9wdGlvbnNSdW50aW1lKSAmJiB0eXBlb2Ygb3B0aW9uc1J1bnRpbWVba10gIT09ICd1bmRlZmluZWQnKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0Ym9vbCA9IHRydWU7XG5cdFx0XHRcdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdFx0XHRcdG9wdHNba10gPSBvcHRpb25zUnVudGltZVtrXTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHJldHVybiBvcHRzO1xuXHR9XG5cblx0cHJvdGVjdGVkIF9zYXZlUmVhZG1lKG9wdGlvbnNSdW50aW1lOiBJT3B0aW9uc1J1bnRpbWUsIG9wdGlvbnMgPSB7fSwgLi4ub3B0cylcblx0e1xuXHRcdGlmICh0aGlzLklES0VZKVxuXHRcdHtcblx0XHRcdG9wdGlvbnNbdGhpcy5JREtFWV0gPSBvcHRpb25zW3RoaXMuSURLRVldIHx8IHt9O1xuXG5cdFx0XHR0cnlcblx0XHRcdHtcblx0XHRcdFx0b3B0aW9uc1t0aGlzLklES0VZXS5ub3ZlbF9pZCA9IG9wdGlvbnNbdGhpcy5JREtFWV0ubm92ZWxfaWQgfHwgb3B0aW9uc1J1bnRpbWVbU1lNQk9MX0NBQ0hFXS5ub3ZlbC51cmxfZGF0YS5ub3ZlbF9pZDtcblx0XHRcdH1cblx0XHRcdGNhdGNoIChlKVxuXHRcdFx0e1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdGxldCBkb3dubG9hZE9wdGlvbnMgPSB0aGlzLl9leHBvcnREb3dubG9hZE9wdGlvbnMob3B0aW9uc1J1bnRpbWUpO1xuXG5cdFx0cmV0dXJuIHN1cGVyLl9zYXZlUmVhZG1lKG9wdGlvbnNSdW50aW1lLCBvcHRpb25zLCB7XG5cdFx0XHRvcHRpb25zOiB7XG5cdFx0XHRcdHRleHRsYXlvdXQ6IHtcblx0XHRcdFx0XHRhbGxvd19sZjI6IHRydWUsXG5cdFx0XHRcdH0sXG5cdFx0XHRcdGRvd25sb2FkT3B0aW9uczogZG93bmxvYWRPcHRpb25zIHx8IHt9LFxuXHRcdFx0fSxcblx0XHR9LCAuLi5vcHRzKTtcblx0fVxuXG5cdHByb3RlY3RlZCBfZ2V0X21ldGEoaW5wdXRVcmwsIG9wdGlvbnNSdW50aW1lLCBjYWNoZT86IHtcblx0XHRkb20/OiBJSlNET00sXG5cdH0pXG5cdHtcblx0XHR0aHJvdyBuZXcgU3ludGF4RXJyb3IoKTtcblx0fVxuXG59XG5cbmV4cG9ydCBjb25zdCBOb3ZlbFNpdGUgPSBOb3ZlbFNpdGVEZW1vIGFzIHR5cGVvZiBOb3ZlbFNpdGVEZW1vO1xuXG5leHBvcnQgZGVmYXVsdCBOb3ZlbFNpdGVEZW1vO1xuIl19