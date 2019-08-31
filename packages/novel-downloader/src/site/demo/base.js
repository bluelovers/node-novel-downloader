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
                log_1.consoleDebug.debug(vid, cid, chapter.chapter_title);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFzZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImJhc2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFBQSx1Q0FBMkM7QUFDM0MsK0JBQWdDO0FBQ2hDLDZCQUE4QjtBQUU5Qiw2Q0FBMEY7QUFFMUYsOEJBQW9DO0FBRXBDLHVDQUF5QztBQUN6Qyx5REFBNkQ7QUFDN0QsMkNBQWtEO0FBQ2xELGlFQUEwSDtBQUMxSCwyREFBaUY7QUFHakYsb0NBQTJGO0FBQzNGLG9DQUEyQztBQUUzQyx3REFBeUQ7QUFDekQsMkNBQW1DO0FBSW5DLHFDQUErRTtBQVcvRSx3Q0FBdUQ7QUFDdkQsMENBQTBDO0FBaUIxQyxJQUFhLGFBQWEsR0FBMUIsTUFBYSxhQUFjLFNBQVEsZUFBVTtJQUk1QyxZQUFZLE9BQXlCLEVBQUUsR0FBRyxJQUFJO1FBRTdDLEtBQUssQ0FBQyxPQUFPLEVBQUUsR0FBRyxJQUFJLENBQUMsQ0FBQztJQUN6QixDQUFDO0lBRUQ7Ozs7Ozs7T0FPRztJQUNILGdCQUFnQixDQUFtQixJQUFPLEVBQUUsaUJBQWtDLEVBQUU7UUFFL0UsT0FBTyxJQUFJLENBQUM7SUFDYixDQUFDO0lBRUQsT0FBTyxDQUFzQixjQUE2QyxFQUFFLEdBQVEsRUFBRSxNQUFlO1FBRXBHLEtBQUssQ0FBQyxPQUFPLENBQUMsY0FBYyxFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBRW5DLElBQUksY0FBYyxDQUFDLFdBQVcsSUFBSSxNQUFNLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxXQUFXLENBQUMsQ0FBQyxNQUFNLEVBQ2hGO1lBQ0MsTUFBTSxDQUFDLE9BQU8sQ0FBQyxjQUFjLENBQUMsV0FBVyxDQUFDO2lCQUN4QyxPQUFPLENBQUMsVUFBVSxJQUFJO2dCQUV0QixJQUFJLENBQXdCLENBQUM7Z0JBQzdCLElBQUksS0FBSyxHQUFHLE9BQU8sSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUUzQixJQUFJLElBQUksQ0FBQyxDQUFDLENBQUMs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QixDQUFDO0NBRUQsQ0FBQTtBQTFuQnVCLG1CQUFLLEdBQVcsSUFBSSxDQUFDO0FBRmhDLGFBQWE7SUFEekIsd0JBQWdCLEVBQThDOztHQUNsRCxhQUFhLENBNG5CekI7QUE1bkJZLHNDQUFhO0FBOG5CYixRQUFBLFNBQVMsR0FBRyxhQUFxQyxDQUFDO0FBRS9ELGtCQUFlLGFBQWEsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IHJldHJ5UmVxdWVzdCB9IGZyb20gJy4uLy4uL2ZldGNoJztcbmltcG9ydCBmcyA9IHJlcXVpcmUoJ2ZzLWV4dHJhJyk7XG5pbXBvcnQgcGF0aCA9IHJlcXVpcmUoJ3BhdGgnKTtcbmltcG9ydCBub3ZlbEluZm8sIHsgSU1kY29uZk1ldGEgfSBmcm9tICdub2RlLW5vdmVsLWluZm8nO1xuaW1wb3J0IHsgZnJvbVVSTCwgSUZyb21VcmxPcHRpb25zLCBJSlNET00sIHJlcXVlc3RUb0pTRE9NLCBwYWNrSlNET00gfSBmcm9tICdqc2RvbS1leHRyYSc7XG5pbXBvcnQgeyBVUkwgfSBmcm9tICdqc2RvbS11cmwnO1xuaW1wb3J0IHsgZ2V0RmlsZVBhdGggfSBmcm9tICcuLi9mcyc7XG5cbmltcG9ydCB7IGdldE9wdGlvbnMgfSBmcm9tICcuLi8uLi9qc2RvbSc7XG5pbXBvcnQgeyBub3JtYWxpemVfdmFsIH0gZnJvbSAnbm9kZS1ub3ZlbC1nbG9iYnkvbGliL2hlbHBlcic7XG5pbXBvcnQgeyBnbG9iYnlBU3luYyB9IGZyb20gJ25vZGUtbm92ZWwtZ2xvYmJ5L2cnO1xuaW1wb3J0IHsgbGF6eUFuYWx5emVSZXBvcnRBbGwsIGxhenlBbmFseXplQWxsLCBkdW1teUNhY2hlLCBhbmFseXplSmEwMDIsIGhhbmRsZUphMDAyIH0gZnJvbSAnQG5vZGUtbm92ZWwvbGF5b3V0LXJlcG9ydGVyJztcbmltcG9ydCB7IG91dHB1dEJsb2NrMDAyLCBvdXRwdXRKYTAwMiB9IGZyb20gJ0Bub2RlLW5vdmVsL2xheW91dC1yZXBvcnRlci9saWIvbWQnO1xuXG5cbmltcG9ydCBfTm92ZWxTaXRlLCB7IHN0YXRpY0ltcGxlbWVudHMsIGRlZmF1bHRKU0RPTU9wdGlvbnMsIFNZTUJPTF9DQUNIRSB9IGZyb20gJy4uL2luZGV4JztcbmltcG9ydCB7IFByb21pc2VCbHVlYmlyZCB9IGZyb20gJy4uL2luZGV4JztcblxuaW1wb3J0IHBhcnNlQ29udGVudFR5cGUgPSByZXF1aXJlKCdjb250ZW50LXR5cGUtcGFyc2VyJyk7XG5pbXBvcnQgbm92ZWxUZXh0IGZyb20gJ25vdmVsLXRleHQnO1xuXG5pbXBvcnQgeyBMYXp5Q29va2llLCBMYXp5Q29va2llSmFyIH0gZnJvbSAnanNkb20tZXh0cmEnO1xuXG5pbXBvcnQgeyBzdHJpbmdpZnkgYXMgbWRjb25mX3N0cmluZ2lmeSwgcGFyc2UgYXMgbWRjb25mX3BhcnNlIH0gZnJvbSAnbWRjb25mMic7XG5cbmV4cG9ydCB0eXBlIElPcHRpb25zUGx1cyA9IHt9XG5cbmV4cG9ydCB0eXBlIElEb3dubG9hZE9wdGlvbnMgPSBfTm92ZWxTaXRlLklEb3dubG9hZE9wdGlvbnMgJiBfTm92ZWxTaXRlLklPcHRpb25zICYgSU9wdGlvbnNQbHVzXG5leHBvcnQgdHlwZSBJT3B0aW9uc1J1bnRpbWUgPSBfTm92ZWxTaXRlLklPcHRpb25zUnVudGltZSAmIElPcHRpb25zUGx1c1xuXG5leHBvcnQgaW1wb3J0IElOb3ZlbCA9IF9Ob3ZlbFNpdGUuSU5vdmVsO1xuXG5pbXBvcnQgeyBSZXNwb25zZVJlcXVlc3QgfSBmcm9tICdyZXF1ZXN0JztcblxuaW1wb3J0IHsgY29uc29sZSwgY29uc29sZURlYnVnIH0gZnJvbSAnLi4vLi4vdXRpbC9sb2cnO1xuaW1wb3J0IHsgaGFzaFN1bSB9IGZyb20gJy4uLy4uL3V0aWwvaGFzaCc7XG5cbmV4cG9ydCB0eXBlIElGZXRjaENoYXB0ZXIgPSB7XG5cdGJvZHk/OiBhbnk7XG5cdGRvbT86IElKU0RPTTtcblx0cmVzPzogUmVzcG9uc2VSZXF1ZXN0O1xuXHRqc29uPyxcblxuXHR1cmw/OiBVUkwsXG5cdGNvbnRlbnRUeXBlUGFyc2VkPzogUmV0dXJuVHlwZTxwYXJzZUNvbnRlbnRUeXBlPixcbn07XG5cbmV4cG9ydCB0eXBlIElTZXNzaW9uRGF0YSA9IHtcblx0W2tleTogc3RyaW5nXTogYW55LFxufVxuXG5Ac3RhdGljSW1wbGVtZW50czxfTm92ZWxTaXRlLklOb3ZlbFNpdGVTdGF0aWM8Tm92ZWxTaXRlRGVtbz4+KClcbmV4cG9ydCBjbGFzcyBOb3ZlbFNpdGVEZW1vIGV4dGVuZHMgX05vdmVsU2l0ZVxue1xuXHRwdWJsaWMgc3RhdGljIHJlYWRvbmx5IElES0VZOiBzdHJpbmcgPSBudWxsO1xuXG5cdGNvbnN0cnVjdG9yKG9wdGlvbnM6IElEb3dubG9hZE9wdGlvbnMsIC4uLmFyZ3YpXG5cdHtcblx0XHRzdXBlcihvcHRpb25zLCAuLi5hcmd2KTtcblx0fVxuXG5cdC8qKlxuXHQgKiBAdG9kbyDorpPmraTmlrnms5XmnInmhI/nvqlcblx0ICpcblx0ICog55So5L6G6Kqq5piO55uu5YmN56uZ6bue55qE5omA6ZyAIHNlc3Npb24gY29va2llc1xuXHQgKlxuXHQgKiBAcGFyYW0ge1R9IGRhdGFcblx0ICogQHJldHVybnMge1R9XG5cdCAqL1xuXHRjaGVja1Nlc3Npb25EYXRhPFQgPSBJU2Vzc2lvbkRhdGE+KGRhdGE6IFQsIG9wdGlvbnNSdW50aW1lOiBJT3B0aW9uc1J1bnRpbWUgPSB7fSlcblx0e1xuXHRcdHJldHVybiBkYXRhO1xuXHR9XG5cblx0c2Vzc2lvbjxUID0gSU9wdGlvbnNSdW50aW1lPihvcHRpb25zUnVudGltZTogUGFydGlhbDxUICYgSURvd25sb2FkT3B0aW9ucz4sIHVybDogVVJMLCBkb21haW4/OiBzdHJpbmcpXG5cdHtcblx0XHRzdXBlci5zZXNzaW9uKG9wdGlvbnNSdW50aW1lLCB1cmwpO1xuXG5cdFx0aWYgKG9wdGlvbnNSdW50aW1lLnNlc3Npb25EYXRhICYmIE9iamVjdC5rZXlzKG9wdGlvbnNSdW50aW1lLnNlc3Npb25EYXRhKS5sZW5ndGgpXG5cdFx0e1xuXHRcdFx0T2JqZWN0LmVudHJpZXMob3B0aW9uc1J1bnRpbWUuc2Vzc2lvbkRhdGEpXG5cdFx0XHRcdC5mb3JFYWNoKGZ1bmN0aW9uIChkYXRhKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0bGV0IGM6IExhenlDb29raWUuUHJvcGVydGllcztcblx0XHRcdFx0XHRsZXQgdHlwZWMgPSB0eXBlb2YgZGF0YVsxXTtcblxuXHRcdFx0XHRcdGlmIChkYXRhWzFdICYmIHR5cGVjID09ICdvYmplY3QnKVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdGMgPSBkYXRhWzFdO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRlbHNlIGlmICh0eXBlYyA9PT0gbnVsbCB8fCB0eXBlYyAhPSAnb2JqZWN0Jylcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRsZXQgW2tleSwgdmFsdWVdID0gZGF0YTtcblxuXHRcdFx0XHRcdFx0YyA9IHtcblx0XHRcdFx0XHRcdFx0a2V5LFxuXHRcdFx0XHRcdFx0XHR2YWx1ZSxcblx0XHRcdFx0XHRcdH07XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGVsc2Vcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRjID0gZGF0YVsxXTtcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRpZiAoYylcblx0XHRcdFx0XHR7XG5cblx0XHRcdFx0XHRcdGlmICh0eXBlb2YgYyA9PSAnb2JqZWN0Jylcblx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0aWYgKCFjLnBhdGgpXG5cdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHRjLnBhdGggPSAnLyc7XG5cdFx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0XHRpZiAoYy5ob3N0T25seSA9PSBudWxsKVxuXHRcdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdFx0Yy5ob3N0T25seSA9IGZhbHNlO1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdG9wdGlvbnNSdW50aW1lLm9wdGlvbnNKU0RPTS5jb29raWVKYXJcblx0XHRcdFx0XHRcdFx0LnNldENvb2tpZVN5bmMoYywgdXJsLmhyZWYpXG5cdFx0XHRcdFx0XHQ7XG5cblx0XHRcdFx0XHRcdGlmICh0eXBlb2YgYyA9PSAnb2JqZWN0JyAmJiAhYy5kb21haW4pXG5cdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdGlmIChkb21haW4pXG5cdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHRjLmRvbWFpbiA9IGRvbWFpbjtcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRlbHNlIGlmICh1cmwgJiYgdXJsLmhvc3QpXG5cdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHRjLmRvbWFpbiA9IHVybC5ob3N0O1xuXHRcdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdFx0dHJ5XG5cdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHRvcHRpb25zUnVudGltZS5vcHRpb25zSlNET00uY29va2llSmFyXG5cdFx0XHRcdFx0XHRcdFx0XHQuc2V0Q29va2llU3luYyhjLCB1cmwuaHJlZilcblx0XHRcdFx0XHRcdFx0XHQ7XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0Y2F0Y2ggKGUpXG5cdFx0XHRcdFx0XHRcdHtcblxuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9KVxuXHRcdFx0O1xuXG5cdFx0XHRjb25zb2xlLmRpcihvcHRpb25zUnVudGltZS5vcHRpb25zSlNET00uY29va2llSmFyKTtcblx0XHR9XG5cblx0XHRyZXR1cm4gdGhpcztcblx0fVxuXG5cdGRvd25sb2FkKGlucHV0VXJsOiBzdHJpbmcgfCBVUkwsIGRvd25sb2FkT3B0aW9uczogSURvd25sb2FkT3B0aW9ucyA9IHt9KVxuXHR7XG5cdFx0Y29uc3Qgc2VsZiA9IHRoaXM7XG5cdFx0bGV0IHVybCA9IGlucHV0VXJsIGFzIFVSTDtcblxuXHRcdGNvbnN0IFtQQVRIX05PVkVMX01BSU4sIG9wdGlvbnNSdW50aW1lXSA9IHRoaXMuZ2V0T3V0cHV0RGlyPElPcHRpb25zUnVudGltZSAmIElEb3dubG9hZE9wdGlvbnM+KGRvd25sb2FkT3B0aW9ucyk7XG5cblx0XHRjb25zb2xlRGVidWcuZW5hYmxlZCA9IG9wdGlvbnNSdW50aW1lLmRlYnVnTG9nO1xuXG5cdFx0cmV0dXJuIFByb21pc2VCbHVlYmlyZFxuXHRcdFx0LmJpbmQoc2VsZilcblx0XHRcdC50aGVuKGFzeW5jICgpID0+XG5cdFx0XHR7XG5cdFx0XHRcdHVybCA9IGF3YWl0IHRoaXMuY3JlYXRlTWFpblVybCh1cmwpO1xuXG5cdFx0XHRcdHNlbGYuc2Vzc2lvbihvcHRpb25zUnVudGltZSwgdXJsKTtcblxuXHRcdFx0XHRjb25zb2xlRGVidWcuaW5mbygn5YiG5p6Q56ug56+A5YiX6KGoJywgdXJsLnRvU3RyaW5nKCkpO1xuXG5cdFx0XHRcdGxldCBub3ZlbCA9IGF3YWl0IHNlbGYuZ2V0X3ZvbHVtZV9saXN0PElPcHRpb25zUnVudGltZSAmIElEb3dubG9hZE9wdGlvbnM+KHVybCwgb3B0aW9uc1J1bnRpbWUpO1xuXG5cdFx0XHRcdGxldCBwYXRoX25vdmVsID0gc2VsZi5nZXRQYXRoTm92ZWwoUEFUSF9OT1ZFTF9NQUlOLCBub3ZlbCwgb3B0aW9uc1J1bnRpbWUpO1xuXG5cdFx0XHRcdHNlbGYuX2xvYWRFeGlzdHNDb25mKHVybCwgb3B0aW9uc1J1bnRpbWUsIG5vdmVsLCBwYXRoX25vdmVsKTtcblxuXHRcdFx0XHRsZXQgaWR4ID0gb3B0aW9uc1J1bnRpbWUuc3RhcnRJbmRleCB8fCAwO1xuXG5cdFx0XHRcdG9wdGlvbnNSdW50aW1lW1NZTUJPTF9DQUNIRV0ubm92ZWwgPSBub3ZlbDtcblx0XHRcdFx0b3B0aW9uc1J1bnRpbWVbU1lNQk9MX0NBQ0hFXS5wYXRoX25vdmVsID0gcGF0aF9ub3ZlbDtcblxuXHRcdFx0XHRhd2FpdCBQcm9taXNlQmx1ZWJpcmRcblx0XHRcdFx0XHQucmVzb2x2ZShzZWxmLnByb2Nlc3NOb3ZlbChub3ZlbCwgb3B0aW9uc1J1bnRpbWUsIHtcblx0XHRcdFx0XHRcdHVybCxcblx0XHRcdFx0XHRcdHBhdGhfbm92ZWwsXG5cdFx0XHRcdFx0fSkpXG5cdFx0XHRcdFx0LnRhcChscyA9PlxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdHJldHVybiBzZWxmLl9vdXRwdXRBdHRhY2gobm92ZWwsIG9wdGlvbnNSdW50aW1lLCB7XG5cdFx0XHRcdFx0XHRcdHVybCxcblx0XHRcdFx0XHRcdFx0cGF0aF9ub3ZlbCxcblx0XHRcdFx0XHRcdH0pXG5cdFx0XHRcdFx0fSlcblx0XHRcdFx0XHQudGFwKGxzID0+XG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0bGV0IGZpbGUgPSBwYXRoLmpvaW4ocGF0aF9ub3ZlbCxcblx0XHRcdFx0XHRcdFx0YCR7c2VsZi50cmltRmlsZW5hbWVOb3ZlbChub3ZlbC5ub3ZlbF90aXRsZSl9LiR7bm92ZWwudXJsX2RhdGEubm92ZWxfaWR9Lmpzb25gLFxuXHRcdFx0XHRcdFx0XHQpXG5cdFx0XHRcdFx0XHQ7XG5cblx0XHRcdFx0XHRcdHJldHVybiBmcy5vdXRwdXRKU09OKGZpbGUsIG5vdmVsLCB7XG5cdFx0XHRcdFx0XHRcdHNwYWNlczogXCJcXHRcIixcblx0XHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdH0pXG5cdFx0XHRcdDtcblxuXHRcdFx0XHRhd2FpdCBzZWxmLl9zYXZlUmVhZG1lKG9wdGlvbnNSdW50aW1lKTtcblxuXHRcdFx0XHRsZXQgX2NhY2hlID0gZHVtbXlDYWNoZSgpO1xuXG5cdFx0XHRcdGF3YWl0IGdsb2JieUFTeW5jKFtcblx0XHRcdFx0XHQnKiovKi50eHQnLFxuXHRcdFx0XHRdLCB7XG5cdFx0XHRcdFx0Y3dkOiBwYXRoX25vdmVsLFxuXHRcdFx0XHR9KVxuXHRcdFx0XHRcdC5tYXBTZXJpZXMoYXN5bmMgKGZpbGUpID0+XG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0bGV0IF9wID0gcGF0aC5wYXJzZShmaWxlKTtcblx0XHRcdFx0XHRcdGNvbnN0IF9jYWNoZV9rZXlfID0gcGF0aC5qb2luKF9wLmRpciwgX3AubmFtZSk7XG5cblx0XHRcdFx0XHRcdGF3YWl0IGZzXG5cdFx0XHRcdFx0XHRcdC5yZWFkRmlsZShwYXRoLmpvaW4ocGF0aF9ub3ZlbCwgZmlsZSkpXG5cdFx0XHRcdFx0XHRcdC50aGVuKGJ1ZiA9PlxuXHRcdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdFx0YW5hbHl6ZUphMDAyKHtcblx0XHRcdFx0XHRcdFx0XHRcdGlucHV0OiBidWYudG9TdHJpbmcoKSxcblx0XHRcdFx0XHRcdFx0XHRcdF9jYWNoZV9rZXlfLFxuXHRcdFx0XHRcdFx0XHRcdFx0X2NhY2hlLFxuXHRcdFx0XHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdFx0XHR9KVxuXHRcdFx0XHRcdFx0O1xuXHRcdFx0XHRcdH0pXG5cdFx0XHRcdFx0LnRhcChhc3luYyAoKSA9PiB7XG5cblx0XHRcdFx0XHRcdGxldCBtZCA9IG91dHB1dEphMDAyKHtcblx0XHRcdFx0XHRcdFx0aW5wdXREYXRhOiBfY2FjaGUuamEyLFxuXHRcdFx0XHRcdFx0fSk7XG5cblx0XHRcdFx0XHRcdHJldHVybiBmcy5vdXRwdXRGaWxlKHBhdGguam9pbihwYXRoX25vdmVsLCAnamEyLm1kJyksIG1kKVxuXHRcdFx0XHRcdH0pXG5cdFx0XHRcdDtcblxuXHRcdFx0XHRyZXR1cm4gbm92ZWw7XG5cdFx0XHR9KVxuXHRcdFx0O1xuXHR9XG5cblx0cHJvdGVjdGVkIGFzeW5jIF9vdXRwdXRBdHRhY2g8VCA9IGFueT4obm92ZWw6IElOb3ZlbCwgb3B0aW9uc1J1bnRpbWU6IElPcHRpb25zUnVudGltZSwgX2NhY2hlXzoge1xuXHRcdHVybDogVVJMLFxuXHRcdHBhdGhfbm92ZWw6IHN0cmluZyxcblx0fSwgLi4uYXJndilcblx0e1xuXHRcdGNvbnN0IHNlbGYgPSB0aGlzO1xuXHRcdGNvbnN0IHsgdXJsLCBwYXRoX25vdmVsIH0gPSBfY2FjaGVfO1xuXG5cdFx0aWYgKG5vdmVsLnZvbHVtZV9saXN0KVxuXHRcdHtcblx0XHRcdGNvbnN0IHsga2VlcEltYWdlID0gZmFsc2UgfSA9IG9wdGlvbnNSdW50aW1lO1xuXG5cdFx0XHRyZXR1cm4gUHJvbWlzZUJsdWViaXJkXG5cdFx0XHRcdC5yZXNvbHZlKG5vdmVsLnZvbHVtZV9saXN0KVxuXHRcdFx0XHQuZWFjaCgodm9sdW1lLCB2aWQpID0+XG5cdFx0XHRcdHtcblxuXHRcdFx0XHRcdGxldCBkaXJuYW1lOiBzdHJpbmc7XG5cblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRsZXQgX3ZpZCA9ICcnO1xuXG5cdFx0XHRcdFx0XHRpZiAoIW9wdGlvbnNSdW50aW1lLm5vRGlyUHJlZml4KVxuXHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRfdmlkID0gdmlkLnRvU3RyaW5nKCkucGFkU3RhcnQoNCwgJzAnKSArICcwJztcblx0XHRcdFx0XHRcdFx0X3ZpZCArPSAnXyc7XG5cdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdGRpcm5hbWUgPSBwYXRoLmpvaW4ocGF0aF9ub3ZlbCxcblx0XHRcdFx0XHRcdFx0YCR7X3ZpZH0ke3NlbGYudHJpbUZpbGVuYW1lVm9sdW1lKHZvbHVtZS52b2x1bWVfdGl0bGUpfWAsXG5cdFx0XHRcdFx0XHQpO1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdGxldCBpbWdzOiBzdHJpbmdbXSA9IFtdO1xuXG5cdFx0XHRcdFx0cmV0dXJuIFByb21pc2VCbHVlYmlyZFxuXHRcdFx0XHRcdFx0LnJlc29sdmUodm9sdW1lLmNoYXB0ZXJfbGlzdClcblx0XHRcdFx0XHRcdC5lYWNoKGFzeW5jIChjaGFwdGVyKSA9PlxuXHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRpZiAoY2hhcHRlci5pbWdzKVxuXHRcdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdFx0aW1ncy5wdXNoKC4uLmNoYXB0ZXIuaW1ncyk7XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdH0pXG5cdFx0XHRcdFx0XHQudGFwKGFzeW5jICgpID0+XG5cdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdGltZ3MgPSBpbWdzLmZpbHRlcih2ID0+IHYpO1xuXG5cdFx0XHRcdFx0XHRcdGlmIChpbWdzLmxlbmd0aClcblx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdGxldCBmaWxlID0gcGF0aC5qb2luKGRpcm5hbWUsICdBVFRBQ0gubWQnKTtcblxuXHRcdFx0XHRcdFx0XHRcdGxldCBtZF9kYXRhID0ge1xuXHRcdFx0XHRcdFx0XHRcdFx0YXR0YWNoOiB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdGltYWdlczoge30gYXMgUmVjb3JkPHN0cmluZywgc3RyaW5nPixcblx0XHRcdFx0XHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0XHRcdFx0fTtcblxuXHRcdFx0XHRcdFx0XHRcdGlmIChrZWVwSW1hZ2UpXG5cdFx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdFx0YXdhaXQgZnMucmVhZEZpbGUoZmlsZSlcblx0XHRcdFx0XHRcdFx0XHRcdFx0LnRoZW4odiA9PiBtZGNvbmZfcGFyc2UodikpXG5cdFx0XHRcdFx0XHRcdFx0XHRcdC50aGVuKChkYXRhOiB0eXBlb2YgbWRfZGF0YSkgPT4ge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdGRhdGEuYXR0YWNoID0gZGF0YS5hdHRhY2ggfHwge30gYXMgYW55O1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdGRhdGEuYXR0YWNoLmltYWdlcyA9IGRhdGEuYXR0YWNoLmltYWdlcyB8fCB7fTtcblxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdG1kX2RhdGEgPSBkYXRhO1xuXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0Y29uc29sZURlYnVnLmRlYnVnKGBMb2FkIGRhdGEgZnJvbSBleGlzdHMgQVRUQUNILm1kYClcblx0XHRcdFx0XHRcdFx0XHRcdFx0fSlcblx0XHRcdFx0XHRcdFx0XHRcdFx0LmNhdGNoKGUgPT4gbnVsbClcblx0XHRcdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdFx0XHRtZF9kYXRhLmF0dGFjaC5pbWFnZXMgPSBPYmplY3Rcblx0XHRcdFx0XHRcdFx0XHRcdC5lbnRyaWVzKGltZ3MgYXMgc3RyaW5nW10pXG5cdFx0XHRcdFx0XHRcdFx0XHQucmVkdWNlKChhLCBbaywgdl0pID0+XG5cdFx0XHRcdFx0XHRcdFx0XHR7XG5cblx0XHRcdFx0XHRcdFx0XHRcdFx0aWYgKGtlZXBJbWFnZSlcblx0XHRcdFx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdGFbaGFzaFN1bSh2KV0gPSB2O1xuXHRcdFx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdFx0XHRcdGVsc2Vcblx0XHRcdFx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdGFbay50b1N0cmluZygpLnBhZFN0YXJ0KDMsICcwJyldID0gdjtcblx0XHRcdFx0XHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHRcdFx0XHRcdHJldHVybiBhXG5cdFx0XHRcdFx0XHRcdFx0XHR9LCBtZF9kYXRhLmF0dGFjaC5pbWFnZXMpO1xuXG5cdFx0XHRcdFx0XHRcdFx0bGV0IG1kID0gbWRjb25mX3N0cmluZ2lmeShtZF9kYXRhKTtcblxuXHRcdFx0XHRcdFx0XHRcdHJldHVybiBmcy5vdXRwdXRGaWxlKGZpbGUsIG1kKTtcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0fSlcblx0XHRcdFx0fSlcblx0XHRcdFx0O1xuXHRcdH1cblxuXHRcdHJldHVybiBQcm9taXNlQmx1ZWJpcmQucmVzb2x2ZSgpXG5cdH1cblxuXHRwcm90ZWN0ZWQgYXN5bmMgX3Byb2Nlc3NOb3ZlbDxUID0gYW55Pihub3ZlbDogSU5vdmVsLCBvcHRpb25zUnVudGltZTogSU9wdGlvbnNSdW50aW1lLCBfY2FjaGVfOiB7XG5cdFx0dXJsOiBVUkwsXG5cdFx0cGF0aF9ub3ZlbDogc3RyaW5nLFxuXHR9LCAuLi5hcmd2KVxuXHR7XG5cdFx0Y29uc3Qgc2VsZiA9IHRoaXM7XG5cdFx0bGV0IGlkeCA9IG9wdGlvbnNSdW50aW1lLnN0YXJ0SW5kZXggfHwgMDtcblxuXHRcdGxldCB7IHVybCwgcGF0aF9ub3ZlbCB9ID0gX2NhY2hlXztcblxuXHRcdHJldHVybiBQcm9taXNlQmx1ZWJpcmRcblx0XHRcdC5tYXBTZXJpZXMobm92ZWwudm9sdW1lX2xpc3QsICh2b2x1bWUsIHZpZCkgPT5cblx0XHRcdHtcblx0XHRcdFx0bGV0IGRpcm5hbWU6IHN0cmluZztcblxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0bGV0IF92aWQgPSAnJztcblxuXHRcdFx0XHRcdGlmICghb3B0aW9uc1J1bnRpbWUubm9EaXJQcmVmaXgpXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0X3ZpZCA9IHZpZC50b1N0cmluZygpLnBhZFN0YXJ0KDQsICcwJykgKyAnMCc7XG5cdFx0XHRcdFx0XHRfdmlkICs9ICdfJztcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRkaXJuYW1lID0gcGF0aC5qb2luKHBhdGhfbm92ZWwsXG5cdFx0XHRcdFx0XHRgJHtfdmlkfSR7c2VsZi50cmltRmlsZW5hbWVWb2x1bWUodm9sdW1lLnZvbHVtZV90aXRsZSl9YCxcblx0XHRcdFx0XHQpO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0Y29uc29sZURlYnVnLmRlYnVnKHZpZCwgdm9sdW1lLnZvbHVtZV90aXRsZSk7XG5cblx0XHRcdFx0aWYgKCFvcHRpb25zUnVudGltZS5ub0ZpcmVQcmVmaXggJiYgb3B0aW9uc1J1bnRpbWUuZmlsZVByZWZpeE1vZGUgPj0gMilcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGxldCBpOiBudW1iZXI7XG5cblx0XHRcdFx0XHRsZXQgYm9vbCA9IHZvbHVtZS5jaGFwdGVyX2xpc3QuZXZlcnkoZnVuY3Rpb24gKGNoYXB0ZXIsIGopXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0bGV0IG0gPSAob3B0aW9uc1J1bnRpbWUuZmlsZVByZWZpeE1vZGUgPiAzID9cblx0XHRcdFx0XHRcdFx0XHRjaGFwdGVyLmNoYXB0ZXJfdGl0bGUgOiBub3JtYWxpemVfdmFsKGNoYXB0ZXIuY2hhcHRlcl90aXRsZSlcblx0XHRcdFx0XHRcdFx0KVxuXHRcdFx0XHRcdFx0XHQucmVwbGFjZSgvXlxcRCsvLCAnJylcblx0XHRcdFx0XHRcdFx0Ly8ucmVwbGFjZSgvXihcXGQrKS4rJC8sICckMScpXG5cdFx0XHRcdFx0XHRcdC5yZXBsYWNlKC9eKFxcZCspXFxELiokLywgJyQxJylcblx0XHRcdFx0XHRcdDtcblxuXHRcdFx0XHRcdFx0Ly9jb25zb2xlLmxvZyhtLCBjaGFwdGVyLmNoYXB0ZXJfdGl0bGUpO1xuXG5cdFx0XHRcdFx0XHRpZiAoL15cXGQrJC8udGVzdChtKSlcblx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0bGV0IG0yID0gcGFyc2VJbnQobSk7XG5cblx0XHRcdFx0XHRcdFx0aWYgKGogPT0gMClcblx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdGkgPSBtMjtcblxuXHRcdFx0XHRcdFx0XHRcdHJldHVybiB0cnVlO1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdGVsc2UgaWYgKG0yID09PSArK2kpXG5cdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0XHRcdFx0fSk7XG5cblx0XHRcdFx0XHQvL2NvbnNvbGUubG9nKGJvb2wpO1xuXG5cdFx0XHRcdFx0aWYgKGJvb2wpXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0dm9sdW1lLmNoYXB0ZXJfbGlzdC5mb3JFYWNoKGZ1bmN0aW9uIChjaGFwdGVyKVxuXHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRjaGFwdGVyLmNoYXB0ZXJfaW5kZXggPSAnJztcblx0XHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXG5cdFx0XHRcdGlmIChvcHRpb25zUnVudGltZS5ldmVudClcblx0XHRcdFx0e1xuXHRcdFx0XHRcdHNlbGYuZW1pdChvcHRpb25zUnVudGltZS5ldmVudCwgJ3ZvbHVtZScsIHZvbHVtZSwge1xuXHRcdFx0XHRcdFx0b3B0aW9uc1J1bnRpbWUsXG5cdFx0XHRcdFx0XHRkaXJuYW1lLFxuXHRcdFx0XHRcdFx0dmlkLFxuXHRcdFx0XHRcdFx0bm92ZWwsXG5cdFx0XHRcdFx0XHR1cmwsXG5cdFx0XHRcdFx0fSk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRyZXR1cm4gUHJvbWlzZUJsdWViaXJkXG5cdFx0XHRcdFx0Lm1hcFNlcmllcyh2b2x1bWUuY2hhcHRlcl9saXN0LCBhc3luYyAoY2hhcHRlciwgY2lkKSA9PlxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdC8vY2hhcHRlci5jaGFwdGVyX2luZGV4ID0gKGlkeCsrKTtcblxuXHRcdFx0XHRcdFx0Y29uc3QgY3VycmVudF9pZHggPSBpZHgrKztcblxuXHRcdFx0XHRcdFx0bGV0IGZpbGUgPSBnZXRGaWxlUGF0aChzZWxmLCB7XG5cdFx0XHRcdFx0XHRcdGNoYXB0ZXIsIGNpZCxcblx0XHRcdFx0XHRcdFx0ZXh0OiAnLnR4dCcsXG5cblx0XHRcdFx0XHRcdFx0aWR4OiBjdXJyZW50X2lkeCxcblxuXHRcdFx0XHRcdFx0XHRkaXJuYW1lLFxuXHRcdFx0XHRcdFx0XHR2b2x1bWUsIHZpZCxcblx0XHRcdFx0XHRcdH0sIG9wdGlvbnNSdW50aW1lKTtcblxuXHRcdFx0XHRcdFx0Y29uc29sZURlYnVnLmRlYnVnKHZpZCwgY2lkLCBjaGFwdGVyLmNoYXB0ZXJfdGl0bGUpO1xuXG5cdFx0XHRcdFx0XHRpZiAoc2VsZi5fY2hlY2tFeGlzdHMob3B0aW9uc1J1bnRpbWUsIGZpbGUpKVxuXHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRyZXR1cm4gZmlsZTtcblx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0bGV0IHVybCA9IHNlbGYuX2NyZWF0ZUNoYXB0ZXJVcmwoe1xuXHRcdFx0XHRcdFx0XHRub3ZlbCxcblx0XHRcdFx0XHRcdFx0dm9sdW1lLFxuXHRcdFx0XHRcdFx0XHRjaGFwdGVyLFxuXHRcdFx0XHRcdFx0fSwgb3B0aW9uc1J1bnRpbWUpO1xuXG5cdFx0XHRcdFx0XHRhd2FpdCBzZWxmLl9mZXRjaENoYXB0ZXIodXJsLCBvcHRpb25zUnVudGltZSlcblx0XHRcdFx0XHRcdFx0LnRoZW4oZnVuY3Rpb24gKHJldClcblx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdHJldHVybiBzZWxmLl9wYXJzZUNoYXB0ZXIocmV0LCBvcHRpb25zUnVudGltZSwge1xuXHRcdFx0XHRcdFx0XHRcdFx0ZmlsZSxcblx0XHRcdFx0XHRcdFx0XHRcdG5vdmVsLFxuXHRcdFx0XHRcdFx0XHRcdFx0dm9sdW1lLFxuXHRcdFx0XHRcdFx0XHRcdFx0Y2hhcHRlcixcblx0XHRcdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHRcdFx0fSlcblx0XHRcdFx0XHRcdFx0LnRoZW4oZnVuY3Rpb24gKHRleHQpXG5cdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHRpZiAodHlwZW9mIHRleHQgPT0gJ3N0cmluZycpXG5cdFx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdFx0cmV0dXJuIG5vdmVsVGV4dC50b1N0cih0ZXh0KTtcblx0XHRcdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdFx0XHRyZXR1cm4gdGV4dDtcblx0XHRcdFx0XHRcdFx0fSlcblx0XHRcdFx0XHRcdFx0LnRoZW4oYXN5bmMgKHRleHQ6IHN0cmluZykgPT5cblx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdGF3YWl0IHRoaXMuX3NhdmVGaWxlKHtcblx0XHRcdFx0XHRcdFx0XHRcdGZpbGUsXG5cdFx0XHRcdFx0XHRcdFx0XHRjb250ZXh0OiB0ZXh0LFxuXHRcdFx0XHRcdFx0XHRcdFx0b3B0aW9uc1J1bnRpbWUsXG5cdFx0XHRcdFx0XHRcdFx0fSk7XG5cblx0XHRcdFx0XHRcdFx0XHRyZXR1cm4gdGV4dDtcblx0XHRcdFx0XHRcdFx0fSlcblx0XHRcdFx0XHRcdDtcblxuXHRcdFx0XHRcdFx0cmV0dXJuIGZpbGU7XG5cdFx0XHRcdFx0fSlcblx0XHRcdFx0XHQ7XG5cdFx0XHR9KVxuXHRcdFx0LnRoZW4oZnVuY3Rpb24gKHJldClcblx0XHRcdHtcblx0XHRcdFx0cmV0dXJuIHJldCBhcyBhbnkgYXMgVDtcblx0XHRcdH0pXG5cdFx0XHQ7XG5cdH1cblxuXHRwcm9jZXNzTm92ZWw8VD4obm92ZWw6IElOb3ZlbCwgb3B0aW9uc1J1bnRpbWU6IElPcHRpb25zUnVudGltZSwgX2NhY2hlXzoge1xuXHRcdHVybDogVVJMLFxuXHRcdHBhdGhfbm92ZWw6IHN0cmluZyxcblx0fSwgLi4uYXJndilcblx0e1xuXHRcdC8vIEB0cy1pZ25vcmVcblx0XHRsZXQgcHI6IGFueTtcblxuXHRcdGNvbnNvbGVEZWJ1Zy5pbmZvKCfplovlp4vomZXnkIblsI/oqqonKTtcblxuXHRcdHByID0gb3B0aW9uc1J1bnRpbWUuZmV0Y2hNZXRhRGF0YU9ubHkgPyBbXSA6IHRoaXMuX3Byb2Nlc3NOb3ZlbDxUPihub3ZlbCwgb3B0aW9uc1J1bnRpbWUsIF9jYWNoZV8sIC4uLmFyZ3YpO1xuXG5cdFx0cmV0dXJuIFByb21pc2VCbHVlYmlyZFxuXHRcdFx0LnJlc29sdmUocHIpXG5cdFx0XHQudGhlbihmdW5jdGlvbiAocmV0OiBUKVxuXHRcdFx0e1xuXHRcdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHRcdG5vdmVsLFxuXHRcdFx0XHRcdG9wdGlvbnNSdW50aW1lLFxuXHRcdFx0XHRcdF9jYWNoZV8sXG5cdFx0XHRcdFx0cmV0LFxuXHRcdFx0XHR9O1xuXHRcdFx0fSlcblx0XHRcdDtcblx0fVxuXG5cdHByb3RlY3RlZCBfc3RyaXBDb250ZW50KHRleHQ6IHN0cmluZylcblx0e1xuXHRcdHJldHVybiB0ZXh0O1xuXHR9XG5cblx0cHJvdGVjdGVkIF9wYXJzZUNoYXB0ZXI8VD4ocmV0OiBJRmV0Y2hDaGFwdGVyLCBvcHRpb25zUnVudGltZTogVCAmIElPcHRpb25zUnVudGltZSwgY2FjaGU6IHtcblx0XHRmaWxlOiBzdHJpbmcsXG5cdFx0bm92ZWw6IF9Ob3ZlbFNpdGUuSU5vdmVsLFxuXHRcdHZvbHVtZTogX05vdmVsU2l0ZS5JVm9sdW1lLFxuXHRcdGNoYXB0ZXI6IF9Ob3ZlbFNpdGUuSUNoYXB0ZXIsXG5cdH0pOiBzdHJpbmcgfCBQcm9taXNlPHN0cmluZz5cblx0e1xuXHRcdGlmICghcmV0KVxuXHRcdHtcblx0XHRcdHJldHVybiAnJztcblx0XHR9XG5cblx0XHR0aHJvdyBuZXcgU3ludGF4RXJyb3IoYEZ1bmN0aW9uIG5vdCBpbXBsZW1lbnRlZGApO1xuXHR9XG5cblx0cHJvdGVjdGVkIF9mZXRjaENoYXB0ZXI8VD4odXJsOiBVUkwsIG9wdGlvbnNSdW50aW1lOiBUICYgSU9wdGlvbnNSdW50aW1lKVxuXHR7XG5cdFx0cmV0dXJuIFByb21pc2VCbHVlYmlyZC5yZXNvbHZlKCkudGhlbihhc3luYyBmdW5jdGlvbiAoKVxuXHRcdHtcblx0XHRcdGNvbnNvbGVEZWJ1Zy5kZWJ1ZyhgZmV0Y2hDaGFwdGVyYCwgdXJsLnRvU3RyaW5nKCkpO1xuXG5cdFx0XHRsZXQgcmV0ID0ge30gYXMgSUZldGNoQ2hhcHRlcjtcblxuXHRcdFx0bGV0IG9wdHMgPSBnZXRPcHRpb25zKG9wdGlvbnNSdW50aW1lKTtcblxuXHRcdFx0aWYgKG9wdGlvbnNSdW50aW1lLmRpc2FibGVEb3dubG9hZClcblx0XHRcdHtcblx0XHRcdFx0cmV0dXJuIG51bGw7XG5cdFx0XHR9XG5cdFx0XHRlbHNlIGlmICh0cnVlKVxuXHRcdFx0e1xuXHRcdFx0XHRpZiAob3B0aW9uc1J1bnRpbWUucmV0cnlEZWxheSA+IDApXG5cdFx0XHRcdHtcblx0XHRcdFx0XHQvLyBAdHMtaWdub3JlXG5cdFx0XHRcdFx0b3B0cy5yZXF1ZXN0T3B0aW9ucy5kZWxheSA9IG9wdGlvbnNSdW50aW1lLnJldHJ5RGVsYXk7XG5cdFx0XHRcdH1cblx0XHRcdFx0ZWxzZVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdFx0XHRcdG9wdHMucmVxdWVzdE9wdGlvbnMucmV0cnkgPSAxO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0YXdhaXQgcmV0cnlSZXF1ZXN0KHVybCwgb3B0cy5yZXF1ZXN0T3B0aW9ucylcblx0XHRcdFx0XHQudGhlbihmdW5jdGlvbiAocmVzKVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdGNvbnN0IGNvbnRlbnRUeXBlUGFyc2VkID0gcGFyc2VDb250ZW50VHlwZShyZXMuaGVhZGVyc1tcImNvbnRlbnQtdHlwZVwiXSk7XG5cblx0XHRcdFx0XHRcdHJldC5jb250ZW50VHlwZVBhcnNlZCA9IGNvbnRlbnRUeXBlUGFyc2VkO1xuXG5cdFx0XHRcdFx0XHQvLyBAdHMtaWdub3JlXG5cdFx0XHRcdFx0XHRyZXQudXJsID0gdXJsO1xuXG5cdFx0XHRcdFx0XHRpZiAoY29udGVudFR5cGVQYXJzZWQuaXNIVE1MKCkgfHwgY29udGVudFR5cGVQYXJzZWQuaXNYTUwoKSlcblx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0cmV0LmRvbSA9IHJlcXVlc3RUb0pTRE9NKHJlcywgdXJsLCBvcHRpb25zUnVudGltZS5vcHRpb25zSlNET00pO1xuXHRcdFx0XHRcdFx0XHRyZXQuZG9tID0gcGFja0pTRE9NKHJldC5kb20pO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0ZWxzZSBpZiAoY29udGVudFR5cGVQYXJzZWQuc3VidHlwZSA9PSAnanNvbicpXG5cdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdHJldC5qc29uID0gSlNPTi5wYXJzZShyZXMuYm9keS50b1N0cmluZygpKTtcblx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0cmV0LnJlcyA9IHJlcztcblx0XHRcdFx0XHRcdHJldC5ib2R5ID0gcmVzLmJvZHk7XG5cdFx0XHRcdFx0fSlcblx0XHRcdFx0O1xuXHRcdFx0fVxuXHRcdFx0ZWxzZVxuXHRcdFx0e1xuXHRcdFx0XHQvLyBAdHMtaWdub3JlXG5cdFx0XHRcdHJldC5kb20gPSBhd2FpdCBmcm9tVVJMKHVybCwgb3B0aW9uc1J1bnRpbWUub3B0aW9uc0pTRE9NKTtcblxuXHRcdFx0XHRyZXQucmVzID0gcmV0LmRvbS5fb3B0aW9ucy5SZXNwb25zZTtcblx0XHRcdFx0cmV0LmJvZHkgPSByZXQuZG9tLl9vcHRpb25zLmJvZHk7XG5cdFx0XHR9XG5cblx0XHRcdHJldHVybiByZXQ7XG5cdFx0fSk7XG5cdH1cblxuXHRwcm90ZWN0ZWQgX2V4cG9ydERvd25sb2FkT3B0aW9ucyhvcHRpb25zUnVudGltZT86IElPcHRpb25zUnVudGltZSk6IGFueVxuXHR7XG5cdFx0bGV0IG9wdHMgPSB7fTtcblxuXHRcdGlmIChvcHRpb25zUnVudGltZSlcblx0XHR7XG5cdFx0XHRsZXQgYm9vbDogYm9vbGVhbjtcblxuXHRcdFx0Zm9yIChsZXQgayBvZiBbXG5cdFx0XHRcdCdub0ZpcmVQcmVmaXgnLFxuXHRcdFx0XHQnbm9GaWxlUGFkZW5kJyxcblx0XHRcdFx0J2ZpbGVQcmVmaXhNb2RlJyxcblx0XHRcdFx0J3N0YXJ0SW5kZXgnLFxuXHRcdFx0XHQna2VlcFJ1YnknLFxuXHRcdFx0XHQna2VlcEZvcm1hdCcsXG5cdFx0XHRcdCdrZWVwSW1hZ2UnLFxuXHRcdFx0XSlcblx0XHRcdHtcblx0XHRcdFx0aWYgKChrIGluIG9wdGlvbnNSdW50aW1lKSAmJiB0eXBlb2Ygb3B0aW9uc1J1bnRpbWVba10gIT09ICd1bmRlZmluZWQnKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0Ym9vbCA9IHRydWU7XG5cdFx0XHRcdFx0b3B0c1trXSA9IG9wdGlvbnNSdW50aW1lW2tdO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0cmV0dXJuIG9wdHM7XG5cdH1cblxuXHRwcm90ZWN0ZWQgX3NhdmVSZWFkbWUob3B0aW9uc1J1bnRpbWU6IElPcHRpb25zUnVudGltZSwgb3B0aW9ucyA9IHt9LCAuLi5vcHRzKVxuXHR7XG5cdFx0aWYgKHRoaXMuSURLRVkpXG5cdFx0e1xuXHRcdFx0b3B0aW9uc1t0aGlzLklES0VZXSA9IG9wdGlvbnNbdGhpcy5JREtFWV0gfHwge307XG5cblx0XHRcdHRyeVxuXHRcdFx0e1xuXHRcdFx0XHRvcHRpb25zW3RoaXMuSURLRVldLm5vdmVsX2lkID0gb3B0aW9uc1t0aGlzLklES0VZXS5ub3ZlbF9pZCB8fCBvcHRpb25zUnVudGltZVtTWU1CT0xfQ0FDSEVdLm5vdmVsLnVybF9kYXRhLm5vdmVsX2lkO1xuXHRcdFx0fVxuXHRcdFx0Y2F0Y2ggKGUpXG5cdFx0XHR7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0bGV0IGRvd25sb2FkT3B0aW9ucyA9IHRoaXMuX2V4cG9ydERvd25sb2FkT3B0aW9ucyhvcHRpb25zUnVudGltZSk7XG5cblx0XHRyZXR1cm4gc3VwZXIuX3NhdmVSZWFkbWUob3B0aW9uc1J1bnRpbWUsIG9wdGlvbnMsIHtcblx0XHRcdG9wdGlvbnM6IHtcblx0XHRcdFx0dGV4dGxheW91dDoge1xuXHRcdFx0XHRcdGFsbG93X2xmMjogdHJ1ZSxcblx0XHRcdFx0fSxcblx0XHRcdFx0ZG93bmxvYWRPcHRpb25zOiBkb3dubG9hZE9wdGlvbnMgfHwge30sXG5cdFx0XHR9LFxuXHRcdH0sIC4uLm9wdHMpO1xuXHR9XG5cblx0cHJvdGVjdGVkIF9nZXRfbWV0YShpbnB1dFVybCwgb3B0aW9uc1J1bnRpbWUsIGNhY2hlPzoge1xuXHRcdGRvbT86IElKU0RPTSxcblx0fSlcblx0e1xuXHRcdHRocm93IG5ldyBTeW50YXhFcnJvcigpO1xuXHR9XG5cbn1cblxuZXhwb3J0IGNvbnN0IE5vdmVsU2l0ZSA9IE5vdmVsU2l0ZURlbW8gYXMgdHlwZW9mIE5vdmVsU2l0ZURlbW87XG5cbmV4cG9ydCBkZWZhdWx0IE5vdmVsU2l0ZURlbW87XG4iXX0=