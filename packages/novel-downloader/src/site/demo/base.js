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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFzZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImJhc2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFBQSx1Q0FBMkM7QUFDM0MsK0JBQWdDO0FBQ2hDLCtCQUFnQztBQUVoQyw2Q0FBMEY7QUFFMUYsOEJBQW9DO0FBRXBDLHVDQUF5QztBQUN6Qyx5REFBNkQ7QUFDN0QsMkNBQWtEO0FBQ2xELGlFQU1xQztBQUNyQywyREFBaUY7QUFHakYsb0NBQTJGO0FBQzNGLG9DQUEyQztBQUUzQyx3REFBeUQ7QUFDekQsMkNBQW1DO0FBSW5DLHFDQUErRTtBQVcvRSx3Q0FBdUU7QUFDdkUsMENBQTBDO0FBaUIxQyxJQUFhLGFBQWEsR0FBMUIsTUFBYSxhQUFjLFNBQVEsZUFBVTtJQUk1QyxZQUFZLE9BQXlCLEVBQUUsR0FBRyxJQUFJO1FBRTdDLEtBQUssQ0FBQyxPQUFPLEVBQUUsR0FBRyxJQUFJLENBQUMsQ0FBQztJQUN6QixDQUFDO0lBRUQ7Ozs7Ozs7T0FPRztJQUNILGdCQUFnQixDQUFtQixJQUFPLEVBQUUsaUJBQWtDLEVBQUU7UUFFL0UsT0FBTyxJQUFJLENBQUM7SUFDYixDQUFDO0lBRUQsT0FBTyxDQUFzQixjQUE2QyxFQUFFLEdBQVEsRUFBRSxNQUFlO1FBRXBHLEtBQUssQ0FBQyxPQUFPLENBQUMsY0FBYyxFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBRW5DLElBQUksY0FBYyxDQUFDLFdBQVcsSUFBSSxNQUFNLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxXQUFXLENBQUMsQ0FBQyxNQUFNLEVBQ2hGO1lBQ0MsTUFBTSxDQUFDLE9BQU8sQ0FBQyxjQUFjLENBQUMsV0FBVyxDQUFDO2lCQUN4QyxPQUFPLENBQUMsVUFBVSxJQUFJO2dCQUV0QixJQUFJLENBQXdCLENBQUM7Z0JBQzdCLElBQUksS0FBSyxHQUFHLE9BQU8sSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUUzQixJQUFJLElBQUksQ0FBQyxDQUFDLENBQUMs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Q0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsUUFBUSxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsUUFBUSxJQUFJLGNBQWMsQ0FBQyxvQkFBWSxDQUFDLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUM7YUFDcEg7WUFDRCxPQUFPLENBQUMsRUFDUjthQUNDO1NBQ0Q7UUFFRCxJQUFJLGVBQWUsR0FBRyxJQUFJLENBQUMsc0JBQXNCLENBQUMsY0FBYyxDQUFDLENBQUM7UUFFbEUsT0FBTyxLQUFLLENBQUMsV0FBVyxDQUFDLGNBQWMsRUFBRSxPQUFPLEVBQUU7WUFDakQsT0FBTyxFQUFFO2dCQUNSLFVBQVUsRUFBRTtvQkFDWCxTQUFTLEVBQUUsSUFBSTtpQkFDZjtnQkFDRCxlQUFlLEVBQUUsZUFBZSxJQUFJLEVBQUU7YUFDdEM7U0FDRCxFQUFFLEdBQUcsSUFBSSxDQUFDLENBQUM7SUFDYixDQUFDO0lBRVMsU0FBUyxDQUFDLFFBQVEsRUFBRSxjQUFjLEVBQUUsS0FFN0M7UUFFQSxNQUFNLElBQUksV0FBVyxFQUFFLENBQUM7SUFDekIsQ0FBQztDQUVELENBQUE7QUE3b0J1QixtQkFBSyxHQUFXLElBQUksQ0FBQztBQUZoQyxhQUFhO0lBRHpCLHdCQUFnQixFQUE4Qzs7R0FDbEQsYUFBYSxDQStvQnpCO0FBL29CWSxzQ0FBYTtBQWlwQmIsUUFBQSxTQUFTLEdBQUcsYUFBcUMsQ0FBQztBQUUvRCxrQkFBZSxhQUFhLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyByZXRyeVJlcXVlc3QgfSBmcm9tICcuLi8uLi9mZXRjaCc7XG5pbXBvcnQgZnMgPSByZXF1aXJlKCdmcy1leHRyYScpO1xuaW1wb3J0IHBhdGggPSByZXF1aXJlKCd1cGF0aDInKTtcbmltcG9ydCBub3ZlbEluZm8sIHsgSU1kY29uZk1ldGEgfSBmcm9tICdub2RlLW5vdmVsLWluZm8nO1xuaW1wb3J0IHsgZnJvbVVSTCwgSUZyb21VcmxPcHRpb25zLCBJSlNET00sIHJlcXVlc3RUb0pTRE9NLCBwYWNrSlNET00gfSBmcm9tICdqc2RvbS1leHRyYSc7XG5pbXBvcnQgeyBVUkwgfSBmcm9tICdqc2RvbS11cmwnO1xuaW1wb3J0IHsgZ2V0RmlsZVBhdGggfSBmcm9tICcuLi9mcyc7XG5cbmltcG9ydCB7IGdldE9wdGlvbnMgfSBmcm9tICcuLi8uLi9qc2RvbSc7XG5pbXBvcnQgeyBub3JtYWxpemVfdmFsIH0gZnJvbSAnbm9kZS1ub3ZlbC1nbG9iYnkvbGliL2hlbHBlcic7XG5pbXBvcnQgeyBnbG9iYnlBU3luYyB9IGZyb20gJ25vZGUtbm92ZWwtZ2xvYmJ5L2cnO1xuaW1wb3J0IHtcblx0bGF6eUFuYWx5emVSZXBvcnRBbGwsXG5cdGxhenlBbmFseXplQWxsLFxuXHRkdW1teUNhY2hlLFxuXHRhbmFseXplSmEwMDIsXG5cdGhhbmRsZUphMDAyLFxufSBmcm9tICdAbm9kZS1ub3ZlbC9sYXlvdXQtcmVwb3J0ZXInO1xuaW1wb3J0IHsgb3V0cHV0QmxvY2swMDIsIG91dHB1dEphMDAyIH0gZnJvbSAnQG5vZGUtbm92ZWwvbGF5b3V0LXJlcG9ydGVyL2xpYi9tZCc7XG5pbXBvcnQgeyBJVFNQYXJ0aWFsUGljayB9IGZyb20gJ3RzLXR5cGUnO1xuXG5pbXBvcnQgX05vdmVsU2l0ZSwgeyBzdGF0aWNJbXBsZW1lbnRzLCBkZWZhdWx0SlNET01PcHRpb25zLCBTWU1CT0xfQ0FDSEUgfSBmcm9tICcuLi9pbmRleCc7XG5pbXBvcnQgeyBQcm9taXNlQmx1ZWJpcmQgfSBmcm9tICcuLi9pbmRleCc7XG5cbmltcG9ydCBwYXJzZUNvbnRlbnRUeXBlID0gcmVxdWlyZSgnY29udGVudC10eXBlLXBhcnNlcicpO1xuaW1wb3J0IG5vdmVsVGV4dCBmcm9tICdub3ZlbC10ZXh0JztcblxuaW1wb3J0IHsgTGF6eUNvb2tpZSwgTGF6eUNvb2tpZUphciB9IGZyb20gJ2pzZG9tLWV4dHJhJztcblxuaW1wb3J0IHsgc3RyaW5naWZ5IGFzIG1kY29uZl9zdHJpbmdpZnksIHBhcnNlIGFzIG1kY29uZl9wYXJzZSB9IGZyb20gJ21kY29uZjInO1xuXG5leHBvcnQgdHlwZSBJT3B0aW9uc1BsdXMgPSB7fVxuXG5leHBvcnQgdHlwZSBJRG93bmxvYWRPcHRpb25zID0gX05vdmVsU2l0ZS5JRG93bmxvYWRPcHRpb25zICYgX05vdmVsU2l0ZS5JT3B0aW9ucyAmIElPcHRpb25zUGx1c1xuZXhwb3J0IHR5cGUgSU9wdGlvbnNSdW50aW1lID0gX05vdmVsU2l0ZS5JT3B0aW9uc1J1bnRpbWUgJiBJT3B0aW9uc1BsdXNcblxuZXhwb3J0IGltcG9ydCBJTm92ZWwgPSBfTm92ZWxTaXRlLklOb3ZlbDtcblxuaW1wb3J0IHsgUmVzcG9uc2VSZXF1ZXN0IH0gZnJvbSAncmVxdWVzdCc7XG5cbmltcG9ydCB7IGNoYWxrQnlDb25zb2xlLCBjb25zb2xlLCBjb25zb2xlRGVidWcgfSBmcm9tICcuLi8uLi91dGlsL2xvZyc7XG5pbXBvcnQgeyBoYXNoU3VtIH0gZnJvbSAnLi4vLi4vdXRpbC9oYXNoJztcblxuZXhwb3J0IHR5cGUgSUZldGNoQ2hhcHRlciA9IHtcblx0Ym9keT86IGFueTtcblx0ZG9tPzogSUpTRE9NO1xuXHRyZXM/OiBSZXNwb25zZVJlcXVlc3Q7XG5cdGpzb24/LFxuXG5cdHVybD86IFVSTCxcblx0Y29udGVudFR5cGVQYXJzZWQ/OiBSZXR1cm5UeXBlPHBhcnNlQ29udGVudFR5cGU+LFxufTtcblxuZXhwb3J0IHR5cGUgSVNlc3Npb25EYXRhID0ge1xuXHRba2V5OiBzdHJpbmddOiBhbnksXG59XG5cbkBzdGF0aWNJbXBsZW1lbnRzPF9Ob3ZlbFNpdGUuSU5vdmVsU2l0ZVN0YXRpYzxOb3ZlbFNpdGVEZW1vPj4oKVxuZXhwb3J0IGNsYXNzIE5vdmVsU2l0ZURlbW8gZXh0ZW5kcyBfTm92ZWxTaXRlXG57XG5cdHB1YmxpYyBzdGF0aWMgcmVhZG9ubHkgSURLRVk6IHN0cmluZyA9IG51bGw7XG5cblx0Y29uc3RydWN0b3Iob3B0aW9uczogSURvd25sb2FkT3B0aW9ucywgLi4uYXJndilcblx0e1xuXHRcdHN1cGVyKG9wdGlvbnMsIC4uLmFyZ3YpO1xuXHR9XG5cblx0LyoqXG5cdCAqIEB0b2RvIOiuk+atpOaWueazleacieaEj+e+qVxuXHQgKlxuXHQgKiDnlKjkvoboqqrmmI7nm67liY3nq5npu57nmoTmiYDpnIAgc2Vzc2lvbiBjb29raWVzXG5cdCAqXG5cdCAqIEBwYXJhbSB7VH0gZGF0YVxuXHQgKiBAcmV0dXJucyB7VH1cblx0ICovXG5cdGNoZWNrU2Vzc2lvbkRhdGE8VCA9IElTZXNzaW9uRGF0YT4oZGF0YTogVCwgb3B0aW9uc1J1bnRpbWU6IElPcHRpb25zUnVudGltZSA9IHt9KVxuXHR7XG5cdFx0cmV0dXJuIGRhdGE7XG5cdH1cblxuXHRzZXNzaW9uPFQgPSBJT3B0aW9uc1J1bnRpbWU+KG9wdGlvbnNSdW50aW1lOiBQYXJ0aWFsPFQgJiBJRG93bmxvYWRPcHRpb25zPiwgdXJsOiBVUkwsIGRvbWFpbj86IHN0cmluZylcblx0e1xuXHRcdHN1cGVyLnNlc3Npb24ob3B0aW9uc1J1bnRpbWUsIHVybCk7XG5cblx0XHRpZiAob3B0aW9uc1J1bnRpbWUuc2Vzc2lvbkRhdGEgJiYgT2JqZWN0LmtleXMob3B0aW9uc1J1bnRpbWUuc2Vzc2lvbkRhdGEpLmxlbmd0aClcblx0XHR7XG5cdFx0XHRPYmplY3QuZW50cmllcyhvcHRpb25zUnVudGltZS5zZXNzaW9uRGF0YSlcblx0XHRcdFx0LmZvckVhY2goZnVuY3Rpb24gKGRhdGEpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRsZXQgYzogTGF6eUNvb2tpZS5Qcm9wZXJ0aWVzO1xuXHRcdFx0XHRcdGxldCB0eXBlYyA9IHR5cGVvZiBkYXRhWzFdO1xuXG5cdFx0XHRcdFx0aWYgKGRhdGFbMV0gJiYgdHlwZWMgPT0gJ29iamVjdCcpXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0YyA9IGRhdGFbMV07XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGVsc2UgaWYgKHR5cGVjID09PSBudWxsIHx8IHR5cGVjICE9ICdvYmplY3QnKVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdGxldCBba2V5LCB2YWx1ZV0gPSBkYXRhO1xuXG5cdFx0XHRcdFx0XHRjID0ge1xuXHRcdFx0XHRcdFx0XHRrZXksXG5cdFx0XHRcdFx0XHRcdHZhbHVlLFxuXHRcdFx0XHRcdFx0fTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0ZWxzZVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdGMgPSBkYXRhWzFdO1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdGlmIChjKVxuXHRcdFx0XHRcdHtcblxuXHRcdFx0XHRcdFx0aWYgKHR5cGVvZiBjID09ICdvYmplY3QnKVxuXHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRpZiAoIWMucGF0aClcblx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdGMucGF0aCA9ICcvJztcblx0XHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHRcdGlmIChjLmhvc3RPbmx5ID09IG51bGwpXG5cdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHRjLmhvc3RPbmx5ID0gZmFsc2U7XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0b3B0aW9uc1J1bnRpbWUub3B0aW9uc0pTRE9NLmNvb2tpZUphclxuXHRcdFx0XHRcdFx0XHQuc2V0Q29va2llU3luYyhjLCB1cmwuaHJlZilcblx0XHRcdFx0XHRcdDtcblxuXHRcdFx0XHRcdFx0aWYgKHR5cGVvZiBjID09ICdvYmplY3QnICYmICFjLmRvbWFpbilcblx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0aWYgKGRvbWFpbilcblx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdGMuZG9tYWluID0gZG9tYWluO1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdGVsc2UgaWYgKHVybCAmJiB1cmwuaG9zdClcblx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdGMuZG9tYWluID0gdXJsLmhvc3Q7XG5cdFx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0XHR0cnlcblx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdG9wdGlvbnNSdW50aW1lLm9wdGlvbnNKU0RPTS5jb29raWVKYXJcblx0XHRcdFx0XHRcdFx0XHRcdC5zZXRDb29raWVTeW5jKGMsIHVybC5ocmVmKVxuXHRcdFx0XHRcdFx0XHRcdDtcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRjYXRjaCAoZSlcblx0XHRcdFx0XHRcdFx0e1xuXG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0pXG5cdFx0XHQ7XG5cblx0XHRcdGNvbnNvbGUuZGlyKG9wdGlvbnNSdW50aW1lLm9wdGlvbnNKU0RPTS5jb29raWVKYXIpO1xuXHRcdH1cblxuXHRcdHJldHVybiB0aGlzO1xuXHR9XG5cblx0ZG93bmxvYWQoaW5wdXRVcmw6IHN0cmluZyB8IFVSTCwgZG93bmxvYWRPcHRpb25zOiBJRG93bmxvYWRPcHRpb25zID0ge30pXG5cdHtcblx0XHRjb25zdCBzZWxmID0gdGhpcztcblx0XHRsZXQgdXJsID0gaW5wdXRVcmwgYXMgVVJMO1xuXG5cdFx0Y29uc3QgW1BBVEhfTk9WRUxfTUFJTiwgb3B0aW9uc1J1bnRpbWVdID0gdGhpcy5nZXRPdXRwdXREaXI8SU9wdGlvbnNSdW50aW1lICYgSURvd25sb2FkT3B0aW9ucz4oZG93bmxvYWRPcHRpb25zKTtcblxuXHRcdGNvbnNvbGVEZWJ1Zy5lbmFibGVkID0gb3B0aW9uc1J1bnRpbWUuZGVidWdMb2c7XG5cblx0XHRyZXR1cm4gUHJvbWlzZUJsdWViaXJkXG5cdFx0XHQuYmluZChzZWxmKVxuXHRcdFx0LnRoZW4oYXN5bmMgKCkgPT5cblx0XHRcdHtcblx0XHRcdFx0dXJsID0gYXdhaXQgdGhpcy5jcmVhdGVNYWluVXJsKHVybCwgb3B0aW9uc1J1bnRpbWUpO1xuXG5cdFx0XHRcdHNlbGYuc2Vzc2lvbihvcHRpb25zUnVudGltZSwgdXJsKTtcblxuXHRcdFx0XHRjb25zb2xlRGVidWcuaW5mbygn5YiG5p6Q56ug56+A5YiX6KGoJywgdXJsLnRvU3RyaW5nKCkpO1xuXG5cdFx0XHRcdGxldCBub3ZlbCA9IGF3YWl0IHNlbGYuZ2V0X3ZvbHVtZV9saXN0PElPcHRpb25zUnVudGltZSAmIElEb3dubG9hZE9wdGlvbnM+KHVybCwgb3B0aW9uc1J1bnRpbWUpO1xuXG5cdFx0XHRcdGxldCBwYXRoX25vdmVsID0gc2VsZi5nZXRQYXRoTm92ZWwoUEFUSF9OT1ZFTF9NQUlOLCBub3ZlbCwgb3B0aW9uc1J1bnRpbWUpO1xuXG5cdFx0XHRcdHNlbGYuX2xvYWRFeGlzdHNDb25mKHVybCwgb3B0aW9uc1J1bnRpbWUsIG5vdmVsLCBwYXRoX25vdmVsKTtcblxuXHRcdFx0XHRsZXQgaWR4ID0gb3B0aW9uc1J1bnRpbWUuc3RhcnRJbmRleCB8fCAwO1xuXG5cdFx0XHRcdG9wdGlvbnNSdW50aW1lW1NZTUJPTF9DQUNIRV0ubm92ZWwgPSBub3ZlbDtcblx0XHRcdFx0b3B0aW9uc1J1bnRpbWVbU1lNQk9MX0NBQ0hFXS5wYXRoX25vdmVsID0gcGF0aF9ub3ZlbDtcblxuXHRcdFx0XHRhd2FpdCBQcm9taXNlQmx1ZWJpcmRcblx0XHRcdFx0XHQucmVzb2x2ZShzZWxmLnByb2Nlc3NOb3ZlbChub3ZlbCwgb3B0aW9uc1J1bnRpbWUsIHtcblx0XHRcdFx0XHRcdHVybCxcblx0XHRcdFx0XHRcdHBhdGhfbm92ZWwsXG5cdFx0XHRcdFx0fSkpXG5cdFx0XHRcdFx0LnRhcChscyA9PlxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdHJldHVybiBzZWxmLl9vdXRwdXRBdHRhY2gobm92ZWwsIG9wdGlvbnNSdW50aW1lLCB7XG5cdFx0XHRcdFx0XHRcdHVybCxcblx0XHRcdFx0XHRcdFx0cGF0aF9ub3ZlbCxcblx0XHRcdFx0XHRcdH0pXG5cdFx0XHRcdFx0fSlcblx0XHRcdFx0XHQudGFwKGxzID0+XG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0bGV0IGZpbGUgPSBwYXRoLmpvaW4ocGF0aF9ub3ZlbCxcblx0XHRcdFx0XHRcdFx0YCR7c2VsZi50cmltRmlsZW5hbWVOb3ZlbChub3ZlbC5ub3ZlbF90aXRsZSl9LiR7bm92ZWwudXJsX2RhdGEubm92ZWxfaWR9Lmpzb25gLFxuXHRcdFx0XHRcdFx0XHQpXG5cdFx0XHRcdFx0XHQ7XG5cblx0XHRcdFx0XHRcdHJldHVybiBmcy5vdXRwdXRKU09OKGZpbGUsIG5vdmVsLCB7XG5cdFx0XHRcdFx0XHRcdHNwYWNlczogXCJcXHRcIixcblx0XHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdH0pXG5cdFx0XHRcdDtcblxuXHRcdFx0XHRhd2FpdCBzZWxmLl9zYXZlUmVhZG1lKG9wdGlvbnNSdW50aW1lKTtcblxuXHRcdFx0XHRsZXQgX2NhY2hlID0gZHVtbXlDYWNoZSgpO1xuXG5cdFx0XHRcdGF3YWl0IGdsb2JieUFTeW5jKFtcblx0XHRcdFx0XHQnKiovKi50eHQnLFxuXHRcdFx0XHRdLCB7XG5cdFx0XHRcdFx0Y3dkOiBwYXRoX25vdmVsLFxuXHRcdFx0XHR9KVxuXHRcdFx0XHRcdC5tYXBTZXJpZXMoYXN5bmMgKGZpbGUpID0+XG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0bGV0IF9wID0gcGF0aC5wYXJzZShmaWxlKTtcblx0XHRcdFx0XHRcdGNvbnN0IF9jYWNoZV9rZXlfID0gcGF0aC5qb2luKF9wLmRpciwgX3AubmFtZSk7XG5cblx0XHRcdFx0XHRcdGF3YWl0IGZzXG5cdFx0XHRcdFx0XHRcdC5yZWFkRmlsZShwYXRoLmpvaW4ocGF0aF9ub3ZlbCwgZmlsZSkpXG5cdFx0XHRcdFx0XHRcdC50aGVuKGJ1ZiA9PlxuXHRcdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdFx0YW5hbHl6ZUphMDAyKHtcblx0XHRcdFx0XHRcdFx0XHRcdGlucHV0OiBidWYudG9TdHJpbmcoKSxcblx0XHRcdFx0XHRcdFx0XHRcdF9jYWNoZV9rZXlfLFxuXHRcdFx0XHRcdFx0XHRcdFx0X2NhY2hlLFxuXHRcdFx0XHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdFx0XHR9KVxuXHRcdFx0XHRcdFx0O1xuXHRcdFx0XHRcdH0pXG5cdFx0XHRcdFx0LnRhcChhc3luYyAoKSA9PlxuXHRcdFx0XHRcdHtcblxuXHRcdFx0XHRcdFx0bGV0IG1kID0gb3V0cHV0SmEwMDIoe1xuXHRcdFx0XHRcdFx0XHRpbnB1dERhdGE6IF9jYWNoZS5qYTIsXG5cdFx0XHRcdFx0XHR9KTtcblxuXHRcdFx0XHRcdFx0cmV0dXJuIGZzLm91dHB1dEZpbGUocGF0aC5qb2luKHBhdGhfbm92ZWwsICdqYTIubWQnKSwgbWQpXG5cdFx0XHRcdFx0fSlcblx0XHRcdFx0O1xuXG5cdFx0XHRcdHJldHVybiBub3ZlbDtcblx0XHRcdH0pXG5cdFx0XHQ7XG5cdH1cblxuXHRwcm90ZWN0ZWQgYXN5bmMgX291dHB1dEF0dGFjaDxUID0gYW55Pihub3ZlbDogSU5vdmVsLCBvcHRpb25zUnVudGltZTogSU9wdGlvbnNSdW50aW1lLCBfY2FjaGVfOiB7XG5cdFx0dXJsOiBVUkwsXG5cdFx0cGF0aF9ub3ZlbDogc3RyaW5nLFxuXHR9LCAuLi5hcmd2KVxuXHR7XG5cdFx0Y29uc3Qgc2VsZiA9IHRoaXM7XG5cdFx0Y29uc3QgeyB1cmwsIHBhdGhfbm92ZWwgfSA9IF9jYWNoZV87XG5cblx0XHRpZiAobm92ZWwudm9sdW1lX2xpc3QpXG5cdFx0e1xuXHRcdFx0Y29uc3QgeyBrZWVwSW1hZ2UgPSBmYWxzZSB9ID0gb3B0aW9uc1J1bnRpbWU7XG5cblx0XHRcdGNvbnNvbGVEZWJ1Zy5pbmZvKGDmqqLmn6UgQVRUQUNIIOizh+aWmWApO1xuXG5cdFx0XHRyZXR1cm4gUHJvbWlzZUJsdWViaXJkXG5cdFx0XHRcdC5yZXNvbHZlKG5vdmVsLnZvbHVtZV9saXN0KVxuXHRcdFx0XHQuZWFjaCgodm9sdW1lLCB2aWQpID0+XG5cdFx0XHRcdHtcblxuXHRcdFx0XHRcdGxldCBkaXJuYW1lOiBzdHJpbmc7XG5cblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRsZXQgX3ZpZCA9ICcnO1xuXG5cdFx0XHRcdFx0XHRpZiAoIW9wdGlvbnNSdW50aW1lLm5vRGlyUHJlZml4KVxuXHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRfdmlkID0gdmlkLnRvU3RyaW5nKCkucGFkU3RhcnQoNCwgJzAnKSArICcwJztcblx0XHRcdFx0XHRcdFx0X3ZpZCArPSAnXyc7XG5cdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdGRpcm5hbWUgPSBwYXRoLmpvaW4ocGF0aF9ub3ZlbCxcblx0XHRcdFx0XHRcdFx0YCR7X3ZpZH0ke3NlbGYudHJpbUZpbGVuYW1lVm9sdW1lKHZvbHVtZS52b2x1bWVfdGl0bGUpfWAsXG5cdFx0XHRcdFx0XHQpO1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdGxldCBpbWdzOiBzdHJpbmdbXSA9IFtdO1xuXG5cdFx0XHRcdFx0cmV0dXJuIFByb21pc2VCbHVlYmlyZFxuXHRcdFx0XHRcdFx0LnJlc29sdmUodm9sdW1lLmNoYXB0ZXJfbGlzdClcblx0XHRcdFx0XHRcdC5lYWNoKGFzeW5jIChjaGFwdGVyKSA9PlxuXHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRpZiAoY2hhcHRlci5pbWdzKVxuXHRcdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdFx0aW1ncy5wdXNoKC4uLmNoYXB0ZXIuaW1ncyk7XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdH0pXG5cdFx0XHRcdFx0XHQudGFwKGFzeW5jICgpID0+XG5cdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdGltZ3MgPSBpbWdzLmZpbHRlcih2ID0+IHYpO1xuXG5cdFx0XHRcdFx0XHRcdGNvbnNvbGVEZWJ1Zy5kZWJ1ZyhgW0FUVEFDSF1gLCBgJHtwYXRoLnJlbGF0aXZlKHBhdGhfbm92ZWwsIGRpcm5hbWUpfWAsIGltZ3MubGVuZ3RoKTtcblxuXHRcdFx0XHRcdFx0XHRpZiAoaW1ncy5sZW5ndGgpXG5cdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHRsZXQgZmlsZSA9IHBhdGguam9pbihkaXJuYW1lLCAnQVRUQUNILm1kJyk7XG5cblx0XHRcdFx0XHRcdFx0XHRsZXQgbWRfZGF0YSA9IHtcblx0XHRcdFx0XHRcdFx0XHRcdGF0dGFjaDoge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRpbWFnZXM6IHt9IGFzIFJlY29yZDxzdHJpbmcsIHN0cmluZz4sXG5cdFx0XHRcdFx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdFx0XHRcdH07XG5cblx0XHRcdFx0XHRcdFx0XHRpZiAoa2VlcEltYWdlIHx8IDEpXG5cdFx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdFx0YXdhaXQgZnMucmVhZEZpbGUoZmlsZSlcblx0XHRcdFx0XHRcdFx0XHRcdFx0LnRoZW4odiA9PiBtZGNvbmZfcGFyc2UodikpXG5cdFx0XHRcdFx0XHRcdFx0XHRcdC50aGVuKChkYXRhOiB0eXBlb2YgbWRfZGF0YSkgPT5cblx0XHRcdFx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdGRhdGEuYXR0YWNoID0gZGF0YS5hdHRhY2ggfHwge30gYXMgYW55O1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdGRhdGEuYXR0YWNoLmltYWdlcyA9IGRhdGEuYXR0YWNoLmltYWdlcyB8fCB7fTtcblxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdG1kX2RhdGEgPSBkYXRhO1xuXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0Y29uc29sZURlYnVnLmRlYnVnKGBMb2FkIGRhdGEgZnJvbSBleGlzdHMgQVRUQUNILm1kYClcblx0XHRcdFx0XHRcdFx0XHRcdFx0fSlcblx0XHRcdFx0XHRcdFx0XHRcdFx0LmNhdGNoKGUgPT4gbnVsbClcblx0XHRcdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdFx0XHRtZF9kYXRhLmF0dGFjaC5pbWFnZXMgPSBPYmplY3Rcblx0XHRcdFx0XHRcdFx0XHRcdC5lbnRyaWVzKGltZ3MgYXMgc3RyaW5nW10pXG5cdFx0XHRcdFx0XHRcdFx0XHQucmVkdWNlKChhLCBbaywgdl0pID0+XG5cdFx0XHRcdFx0XHRcdFx0XHR7XG5cblx0XHRcdFx0XHRcdFx0XHRcdFx0aWYgKGtlZXBJbWFnZSlcblx0XHRcdFx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdGFbaGFzaFN1bSh2KV0gPSB2O1xuXHRcdFx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdFx0XHRcdGVsc2Vcblx0XHRcdFx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdGFbay50b1N0cmluZygpLnBhZFN0YXJ0KDMsICcwJyldID0gdjtcblx0XHRcdFx0XHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHRcdFx0XHRcdHJldHVybiBhXG5cdFx0XHRcdFx0XHRcdFx0XHR9LCBtZF9kYXRhLmF0dGFjaC5pbWFnZXMpO1xuXG5cdFx0XHRcdFx0XHRcdFx0bGV0IG1kID0gbWRjb25mX3N0cmluZ2lmeShtZF9kYXRhKTtcblxuXHRcdFx0XHRcdFx0XHRcdHJldHVybiBmcy5vdXRwdXRGaWxlKGZpbGUsIG1kKVxuXHRcdFx0XHRcdFx0XHRcdFx0LnRoZW4ociA9PiB7XG5cblx0XHRcdFx0XHRcdFx0XHRcdFx0Y29uc29sZURlYnVnLnN1Y2Nlc3MoYFtBVFRBQ0hdYCwgYFtTQVZFXWAsIGAke3BhdGgucmVsYXRpdmUocGF0aF9ub3ZlbCwgZmlsZSl9YCk7XG5cblx0XHRcdFx0XHRcdFx0XHRcdFx0cmV0dXJuIHI7XG5cdFx0XHRcdFx0XHRcdFx0XHR9KVxuXHRcdFx0XHRcdFx0XHRcdFx0O1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHR9KVxuXHRcdFx0XHR9KVxuXHRcdFx0XHQ7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIFByb21pc2VCbHVlYmlyZC5yZXNvbHZlKClcblx0fVxuXG5cdHByb3RlY3RlZCBhc3luYyBfcHJvY2Vzc05vdmVsPFQgPSBhbnk+KG5vdmVsOiBJTm92ZWwsIG9wdGlvbnNSdW50aW1lOiBJT3B0aW9uc1J1bnRpbWUsIF9jYWNoZV86IHtcblx0XHR1cmw6IFVSTCxcblx0XHRwYXRoX25vdmVsOiBzdHJpbmcsXG5cdH0sIC4uLmFyZ3YpXG5cdHtcblx0XHRjb25zdCBzZWxmID0gdGhpcztcblx0XHRsZXQgaWR4ID0gb3B0aW9uc1J1bnRpbWUuc3RhcnRJbmRleCB8fCAwO1xuXG5cdFx0bGV0IHsgdXJsLCBwYXRoX25vdmVsIH0gPSBfY2FjaGVfO1xuXG5cdFx0cmV0dXJuIFByb21pc2VCbHVlYmlyZFxuXHRcdFx0Lm1hcFNlcmllcyhub3ZlbC52b2x1bWVfbGlzdCwgKHZvbHVtZSwgdmlkKSA9PlxuXHRcdFx0e1xuXHRcdFx0XHRsZXQgZGlybmFtZTogc3RyaW5nO1xuXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRsZXQgX3ZpZCA9ICcnO1xuXG5cdFx0XHRcdFx0aWYgKCFvcHRpb25zUnVudGltZS5ub0RpclByZWZpeClcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRfdmlkID0gdmlkLnRvU3RyaW5nKCkucGFkU3RhcnQoNCwgJzAnKSArICcwJztcblx0XHRcdFx0XHRcdF92aWQgKz0gJ18nO1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdGRpcm5hbWUgPSBwYXRoLmpvaW4ocGF0aF9ub3ZlbCxcblx0XHRcdFx0XHRcdGAke192aWR9JHtzZWxmLnRyaW1GaWxlbmFtZVZvbHVtZSh2b2x1bWUudm9sdW1lX3RpdGxlKX1gLFxuXHRcdFx0XHRcdCk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRjb25zb2xlRGVidWcuZGVidWcodmlkLCB2b2x1bWUudm9sdW1lX3RpdGxlKTtcblxuXHRcdFx0XHRpZiAoIW9wdGlvbnNSdW50aW1lLm5vRmlyZVByZWZpeCAmJiBvcHRpb25zUnVudGltZS5maWxlUHJlZml4TW9kZSA+PSAyKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0bGV0IGk6IG51bWJlcjtcblxuXHRcdFx0XHRcdGxldCBib29sID0gdm9sdW1lLmNoYXB0ZXJfbGlzdC5ldmVyeShmdW5jdGlvbiAoY2hhcHRlciwgailcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRsZXQgbSA9IChvcHRpb25zUnVudGltZS5maWxlUHJlZml4TW9kZSA+IDMgP1xuXHRcdFx0XHRcdFx0XHRcdGNoYXB0ZXIuY2hhcHRlcl90aXRsZSA6IG5vcm1hbGl6ZV92YWwoY2hhcHRlci5jaGFwdGVyX3RpdGxlKVxuXHRcdFx0XHRcdFx0XHQpXG5cdFx0XHRcdFx0XHRcdC5yZXBsYWNlKC9eXFxEKy8sICcnKVxuXHRcdFx0XHRcdFx0XHQvLy5yZXBsYWNlKC9eKFxcZCspLiskLywgJyQxJylcblx0XHRcdFx0XHRcdFx0LnJlcGxhY2UoL14oXFxkKylcXEQuKiQvLCAnJDEnKVxuXHRcdFx0XHRcdFx0O1xuXG5cdFx0XHRcdFx0XHQvL2NvbnNvbGUubG9nKG0sIGNoYXB0ZXIuY2hhcHRlcl90aXRsZSk7XG5cblx0XHRcdFx0XHRcdGlmICgvXlxcZCskLy50ZXN0KG0pKVxuXHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRsZXQgbTIgPSBwYXJzZUludChtKTtcblxuXHRcdFx0XHRcdFx0XHRpZiAoaiA9PSAwKVxuXHRcdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdFx0aSA9IG0yO1xuXG5cdFx0XHRcdFx0XHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0ZWxzZSBpZiAobTIgPT09ICsraSlcblx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdHJldHVybiB0cnVlO1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdFx0XHR9KTtcblxuXHRcdFx0XHRcdC8vY29uc29sZS5sb2coYm9vbCk7XG5cblx0XHRcdFx0XHRpZiAoYm9vbClcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHR2b2x1bWUuY2hhcHRlcl9saXN0LmZvckVhY2goZnVuY3Rpb24gKGNoYXB0ZXIpXG5cdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdGNoYXB0ZXIuY2hhcHRlcl9pbmRleCA9ICcnO1xuXHRcdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cblx0XHRcdFx0aWYgKG9wdGlvbnNSdW50aW1lLmV2ZW50KVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0c2VsZi5lbWl0KG9wdGlvbnNSdW50aW1lLmV2ZW50LCAndm9sdW1lJywgdm9sdW1lLCB7XG5cdFx0XHRcdFx0XHRvcHRpb25zUnVudGltZSxcblx0XHRcdFx0XHRcdGRpcm5hbWUsXG5cdFx0XHRcdFx0XHR2aWQsXG5cdFx0XHRcdFx0XHRub3ZlbCxcblx0XHRcdFx0XHRcdHVybCxcblx0XHRcdFx0XHR9KTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdHJldHVybiBQcm9taXNlQmx1ZWJpcmRcblx0XHRcdFx0XHQubWFwU2VyaWVzKHZvbHVtZS5jaGFwdGVyX2xpc3QsIGFzeW5jIChjaGFwdGVyLCBjaWQpID0+XG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0Ly9jaGFwdGVyLmNoYXB0ZXJfaW5kZXggPSAoaWR4KyspO1xuXG5cdFx0XHRcdFx0XHRjb25zdCBjdXJyZW50X2lkeCA9IGlkeCsrO1xuXG5cdFx0XHRcdFx0XHRsZXQgZmlsZSA9IGdldEZpbGVQYXRoKHNlbGYsIHtcblx0XHRcdFx0XHRcdFx0Y2hhcHRlciwgY2lkLFxuXHRcdFx0XHRcdFx0XHRleHQ6ICcudHh0JyxcblxuXHRcdFx0XHRcdFx0XHRpZHg6IGN1cnJlbnRfaWR4LFxuXG5cdFx0XHRcdFx0XHRcdGRpcm5hbWUsXG5cdFx0XHRcdFx0XHRcdHZvbHVtZSwgdmlkLFxuXHRcdFx0XHRcdFx0fSwgb3B0aW9uc1J1bnRpbWUpO1xuXG5cdFx0XHRcdFx0XHRpZiAoc2VsZi5fY2hlY2tFeGlzdHMob3B0aW9uc1J1bnRpbWUsIGZpbGUpKVxuXHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRjb25zb2xlRGVidWcuZGVidWcoYFtTS0lQXWAsIHZpZCwgY2lkLCBjaGFwdGVyLmNoYXB0ZXJfdGl0bGUpO1xuXG5cdFx0XHRcdFx0XHRcdHJldHVybiBmaWxlO1xuXHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHRsZXQgdXJsID0gc2VsZi5fY3JlYXRlQ2hhcHRlclVybCh7XG5cdFx0XHRcdFx0XHRcdG5vdmVsLFxuXHRcdFx0XHRcdFx0XHR2b2x1bWUsXG5cdFx0XHRcdFx0XHRcdGNoYXB0ZXIsXG5cdFx0XHRcdFx0XHR9LCBvcHRpb25zUnVudGltZSk7XG5cblx0XHRcdFx0XHRcdGNvbnNvbGVEZWJ1Zy5kZWJ1Zyh2aWQsIGNpZCwgY2hhcHRlci5jaGFwdGVyX3RpdGxlKTtcblx0XHRcdFx0XHRcdC8vY29uc29sZURlYnVnLmRlYnVnKHVybC50b1N0cmluZygpKTtcblxuXHRcdFx0XHRcdFx0YXdhaXQgc2VsZi5fZmV0Y2hDaGFwdGVyKHVybCwgb3B0aW9uc1J1bnRpbWUpXG5cdFx0XHRcdFx0XHRcdC50aGVuKGZ1bmN0aW9uIChyZXQpXG5cdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHRyZXR1cm4gc2VsZi5fcGFyc2VDaGFwdGVyKHJldCwgb3B0aW9uc1J1bnRpbWUsIHtcblx0XHRcdFx0XHRcdFx0XHRcdGZpbGUsXG5cdFx0XHRcdFx0XHRcdFx0XHRub3ZlbCxcblx0XHRcdFx0XHRcdFx0XHRcdHZvbHVtZSxcblx0XHRcdFx0XHRcdFx0XHRcdGNoYXB0ZXIsXG5cdFx0XHRcdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0XHRcdH0pXG5cdFx0XHRcdFx0XHRcdC50aGVuKGZ1bmN0aW9uICh0ZXh0KVxuXHRcdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdFx0aWYgKHR5cGVvZiB0ZXh0ID09ICdzdHJpbmcnKVxuXHRcdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHRcdHJldHVybiBub3ZlbFRleHQudG9TdHIodGV4dCk7XG5cdFx0XHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHRcdFx0cmV0dXJuIHRleHQ7XG5cdFx0XHRcdFx0XHRcdH0pXG5cdFx0XHRcdFx0XHRcdC50aGVuKGFzeW5jICh0ZXh0OiBzdHJpbmcpID0+XG5cdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHRhd2FpdCB0aGlzLl9zYXZlRmlsZSh7XG5cdFx0XHRcdFx0XHRcdFx0XHRmaWxlLFxuXHRcdFx0XHRcdFx0XHRcdFx0Y29udGV4dDogdGV4dCxcblx0XHRcdFx0XHRcdFx0XHRcdG9wdGlvbnNSdW50aW1lLFxuXHRcdFx0XHRcdFx0XHRcdH0pO1xuXG5cdFx0XHRcdFx0XHRcdFx0cmV0dXJuIHRleHQ7XG5cdFx0XHRcdFx0XHRcdH0pXG5cdFx0XHRcdFx0XHQ7XG5cblx0XHRcdFx0XHRcdHJldHVybiBmaWxlO1xuXHRcdFx0XHRcdH0pXG5cdFx0XHRcdFx0O1xuXHRcdFx0fSlcblx0XHRcdC50aGVuKGZ1bmN0aW9uIChyZXQpXG5cdFx0XHR7XG5cdFx0XHRcdHJldHVybiByZXQgYXMgYW55IGFzIFQ7XG5cdFx0XHR9KVxuXHRcdFx0O1xuXHR9XG5cblx0cHJvY2Vzc05vdmVsPFQ+KG5vdmVsOiBJTm92ZWwsIG9wdGlvbnNSdW50aW1lOiBJT3B0aW9uc1J1bnRpbWUsIF9jYWNoZV86IHtcblx0XHR1cmw6IFVSTCxcblx0XHRwYXRoX25vdmVsOiBzdHJpbmcsXG5cdH0sIC4uLmFyZ3YpXG5cdHtcblx0XHQvLyBAdHMtaWdub3JlXG5cdFx0bGV0IHByOiBhbnk7XG5cblx0XHRjb25zb2xlRGVidWcuaW5mbygn6ZaL5aeL6JmV55CG5bCP6KqqJyk7XG5cblx0XHRwciA9IG9wdGlvbnNSdW50aW1lLmZldGNoTWV0YURhdGFPbmx5ID8gW10gOiB0aGlzLl9wcm9jZXNzTm92ZWw8VD4obm92ZWwsIG9wdGlvbnNSdW50aW1lLCBfY2FjaGVfLCAuLi5hcmd2KTtcblxuXHRcdHJldHVybiBQcm9taXNlQmx1ZWJpcmRcblx0XHRcdC5yZXNvbHZlKHByKVxuXHRcdFx0LnRoZW4oZnVuY3Rpb24gKHJldDogVClcblx0XHRcdHtcblx0XHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0XHRub3ZlbCxcblx0XHRcdFx0XHRvcHRpb25zUnVudGltZSxcblx0XHRcdFx0XHRfY2FjaGVfLFxuXHRcdFx0XHRcdHJldCxcblx0XHRcdFx0fTtcblx0XHRcdH0pXG5cdFx0XHQ7XG5cdH1cblxuXHRwcm90ZWN0ZWQgX3N0cmlwQ29udGVudCh0ZXh0OiBzdHJpbmcpXG5cdHtcblx0XHRyZXR1cm4gdGV4dDtcblx0fVxuXG5cdHByb3RlY3RlZCBfcGFyc2VDaGFwdGVyPFQ+KHJldDogSUZldGNoQ2hhcHRlciwgb3B0aW9uc1J1bnRpbWU6IFQgJiBJT3B0aW9uc1J1bnRpbWUsIGNhY2hlOiB7XG5cdFx0ZmlsZTogc3RyaW5nLFxuXHRcdG5vdmVsOiBfTm92ZWxTaXRlLklOb3ZlbCxcblx0XHR2b2x1bWU6IF9Ob3ZlbFNpdGUuSVZvbHVtZSxcblx0XHRjaGFwdGVyOiBfTm92ZWxTaXRlLklDaGFwdGVyLFxuXHR9KTogc3RyaW5nIHwgUHJvbWlzZTxzdHJpbmc+XG5cdHtcblx0XHRpZiAoIXJldClcblx0XHR7XG5cdFx0XHRyZXR1cm4gJyc7XG5cdFx0fVxuXG5cdFx0dGhyb3cgbmV3IFN5bnRheEVycm9yKGBGdW5jdGlvbiBub3QgaW1wbGVtZW50ZWRgKTtcblx0fVxuXG5cdHByb3RlY3RlZCBfZmV0Y2hDaGFwdGVyPFQ+KHVybDogVVJMLCBvcHRpb25zUnVudGltZTogVCAmIElPcHRpb25zUnVudGltZSlcblx0e1xuXHRcdHJldHVybiBQcm9taXNlQmx1ZWJpcmQucmVzb2x2ZSgpLnRoZW4oYXN5bmMgZnVuY3Rpb24gKClcblx0XHR7XG5cdFx0XHRjb25zb2xlRGVidWcuZGVidWcoYGZldGNoQ2hhcHRlcmAsIHVybC50b1N0cmluZygpKTtcblxuXHRcdFx0bGV0IHJldCA9IHt9IGFzIElGZXRjaENoYXB0ZXI7XG5cblx0XHRcdGxldCBvcHRzID0gZ2V0T3B0aW9ucyhvcHRpb25zUnVudGltZSk7XG5cblx0XHRcdGlmIChvcHRpb25zUnVudGltZS5kaXNhYmxlRG93bmxvYWQpXG5cdFx0XHR7XG5cdFx0XHRcdHJldHVybiBudWxsO1xuXHRcdFx0fVxuXHRcdFx0ZWxzZSBpZiAodHJ1ZSlcblx0XHRcdHtcblx0XHRcdFx0aWYgKG9wdGlvbnNSdW50aW1lLnJldHJ5RGVsYXkgPiAwKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdFx0XHRcdG9wdHMucmVxdWVzdE9wdGlvbnMuZGVsYXkgPSBvcHRpb25zUnVudGltZS5yZXRyeURlbGF5O1xuXHRcdFx0XHR9XG5cdFx0XHRcdGVsc2Vcblx0XHRcdFx0e1xuXHRcdFx0XHRcdC8vIEB0cy1pZ25vcmVcblx0XHRcdFx0XHRvcHRzLnJlcXVlc3RPcHRpb25zLnJldHJ5ID0gMTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGF3YWl0IHJldHJ5UmVxdWVzdCh1cmwsIG9wdHMucmVxdWVzdE9wdGlvbnMpXG5cdFx0XHRcdFx0LnRoZW4oZnVuY3Rpb24gKHJlcylcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRjb25zdCBjb250ZW50VHlwZVBhcnNlZCA9IHBhcnNlQ29udGVudFR5cGUocmVzLmhlYWRlcnNbXCJjb250ZW50LXR5cGVcIl0pO1xuXG5cdFx0XHRcdFx0XHRyZXQuY29udGVudFR5cGVQYXJzZWQgPSBjb250ZW50VHlwZVBhcnNlZDtcblxuXHRcdFx0XHRcdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdFx0XHRcdFx0cmV0LnVybCA9IHVybDtcblxuXHRcdFx0XHRcdFx0aWYgKGNvbnRlbnRUeXBlUGFyc2VkLmlzSFRNTCgpIHx8IGNvbnRlbnRUeXBlUGFyc2VkLmlzWE1MKCkpXG5cdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdHJldC5kb20gPSByZXF1ZXN0VG9KU0RPTShyZXMsIHVybCwgb3B0aW9uc1J1bnRpbWUub3B0aW9uc0pTRE9NKTtcblx0XHRcdFx0XHRcdFx0cmV0LmRvbSA9IHBhY2tKU0RPTShyZXQuZG9tKTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdGVsc2UgaWYgKGNvbnRlbnRUeXBlUGFyc2VkLnN1YnR5cGUgPT0gJ2pzb24nKVxuXHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRyZXQuanNvbiA9IEpTT04ucGFyc2UocmVzLmJvZHkudG9TdHJpbmcoKSk7XG5cdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdHJldC5yZXMgPSByZXM7XG5cdFx0XHRcdFx0XHRyZXQuYm9keSA9IHJlcy5ib2R5O1xuXHRcdFx0XHRcdH0pXG5cdFx0XHRcdDtcblx0XHRcdH1cblx0XHRcdGVsc2Vcblx0XHRcdHtcblx0XHRcdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdFx0XHRyZXQuZG9tID0gYXdhaXQgZnJvbVVSTCh1cmwsIG9wdGlvbnNSdW50aW1lLm9wdGlvbnNKU0RPTSk7XG5cblx0XHRcdFx0cmV0LnJlcyA9IHJldC5kb20uX29wdGlvbnMuUmVzcG9uc2U7XG5cdFx0XHRcdHJldC5ib2R5ID0gcmV0LmRvbS5fb3B0aW9ucy5ib2R5O1xuXHRcdFx0fVxuXG5cdFx0XHRyZXR1cm4gcmV0O1xuXHRcdH0pO1xuXHR9XG5cblx0cHJvdGVjdGVkIF9leHBvcnREb3dubG9hZE9wdGlvbnM8VCA9IElPcHRpb25zUnVudGltZT4ob3B0aW9uc1J1bnRpbWU/OiBUICYgSU9wdGlvbnNSdW50aW1lKTogUGFydGlhbDxUICYgSU9wdGlvbnNSdW50aW1lPlxuXHR7XG5cdFx0bGV0IG9wdHM6IFBhcnRpYWw8VCAmIElPcHRpb25zUnVudGltZT4gPSB7fTtcblxuXHRcdGlmIChvcHRpb25zUnVudGltZSlcblx0XHR7XG5cdFx0XHRsZXQgYm9vbDogYm9vbGVhbjtcblxuXHRcdFx0Zm9yIChsZXQgayBvZiBbXG5cdFx0XHRcdCdub0ZpcmVQcmVmaXgnLFxuXHRcdFx0XHQnbm9GaWxlUGFkZW5kJyxcblx0XHRcdFx0J2ZpbGVQcmVmaXhNb2RlJyxcblx0XHRcdFx0J3N0YXJ0SW5kZXgnLFxuXHRcdFx0XHQna2VlcFJ1YnknLFxuXHRcdFx0XHQna2VlcEZvcm1hdCcsXG5cdFx0XHRcdCdrZWVwSW1hZ2UnLFxuXHRcdFx0XHQnYWxsb3dFbXB0eVZvbHVtZVRpdGxlJyxcblx0XHRcdFx0J2Rpc2FibGVPdXRwdXREaXJQcmVmaXgnLFxuXHRcdFx0XSBhcyAoa2V5b2YgSU9wdGlvbnNSdW50aW1lKVtdKVxuXHRcdFx0e1xuXHRcdFx0XHRpZiAoKGsgaW4gb3B0aW9uc1J1bnRpbWUpICYmIHR5cGVvZiBvcHRpb25zUnVudGltZVtrXSAhPT0gJ3VuZGVmaW5lZCcpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRib29sID0gdHJ1ZTtcblx0XHRcdFx0XHQvLyBAdHMtaWdub3JlXG5cdFx0XHRcdFx0b3B0c1trXSA9IG9wdGlvbnNSdW50aW1lW2tdO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0cmV0dXJuIG9wdHM7XG5cdH1cblxuXHRwcm90ZWN0ZWQgX3NhdmVSZWFkbWUob3B0aW9uc1J1bnRpbWU6IElPcHRpb25zUnVudGltZSwgb3B0aW9ucyA9IHt9LCAuLi5vcHRzKVxuXHR7XG5cdFx0aWYgKHRoaXMuSURLRVkpXG5cdFx0e1xuXHRcdFx0b3B0aW9uc1t0aGlzLklES0VZXSA9IG9wdGlvbnNbdGhpcy5JREtFWV0gfHwge307XG5cblx0XHRcdHRyeVxuXHRcdFx0e1xuXHRcdFx0XHRvcHRpb25zW3RoaXMuSURLRVldLm5vdmVsX2lkID0gb3B0aW9uc1t0aGlzLklES0VZXS5ub3ZlbF9pZCB8fCBvcHRpb25zUnVudGltZVtTWU1CT0xfQ0FDSEVdLm5vdmVsLnVybF9kYXRhLm5vdmVsX2lkO1xuXHRcdFx0fVxuXHRcdFx0Y2F0Y2ggKGUpXG5cdFx0XHR7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0bGV0IGRvd25sb2FkT3B0aW9ucyA9IHRoaXMuX2V4cG9ydERvd25sb2FkT3B0aW9ucyhvcHRpb25zUnVudGltZSk7XG5cblx0XHRyZXR1cm4gc3VwZXIuX3NhdmVSZWFkbWUob3B0aW9uc1J1bnRpbWUsIG9wdGlvbnMsIHtcblx0XHRcdG9wdGlvbnM6IHtcblx0XHRcdFx0dGV4dGxheW91dDoge1xuXHRcdFx0XHRcdGFsbG93X2xmMjogdHJ1ZSxcblx0XHRcdFx0fSxcblx0XHRcdFx0ZG93bmxvYWRPcHRpb25zOiBkb3dubG9hZE9wdGlvbnMgfHwge30sXG5cdFx0XHR9LFxuXHRcdH0sIC4uLm9wdHMpO1xuXHR9XG5cblx0cHJvdGVjdGVkIF9nZXRfbWV0YShpbnB1dFVybCwgb3B0aW9uc1J1bnRpbWUsIGNhY2hlPzoge1xuXHRcdGRvbT86IElKU0RPTSxcblx0fSlcblx0e1xuXHRcdHRocm93IG5ldyBTeW50YXhFcnJvcigpO1xuXHR9XG5cbn1cblxuZXhwb3J0IGNvbnN0IE5vdmVsU2l0ZSA9IE5vdmVsU2l0ZURlbW8gYXMgdHlwZW9mIE5vdmVsU2l0ZURlbW87XG5cbmV4cG9ydCBkZWZhdWx0IE5vdmVsU2l0ZURlbW87XG4iXX0=