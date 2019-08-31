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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFzZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImJhc2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFBQSx1Q0FBMkM7QUFDM0MsK0JBQWdDO0FBQ2hDLDZCQUE4QjtBQUU5Qiw2Q0FBMEY7QUFFMUYsOEJBQW9DO0FBRXBDLHVDQUF5QztBQUN6Qyx5REFBNkQ7QUFDN0QsMkNBQWtEO0FBQ2xELGlFQUEwSDtBQUMxSCwyREFBaUY7QUFHakYsb0NBQTJGO0FBQzNGLG9DQUEyQztBQUUzQyx3REFBeUQ7QUFDekQsMkNBQW1DO0FBSW5DLHFDQUF3RDtBQVd4RCx3Q0FBdUQ7QUFpQnZELElBQWEsYUFBYSxHQUExQixNQUFhLGFBQWMsU0FBUSxlQUFVO0lBSTVDLFlBQVksT0FBeUIsRUFBRSxHQUFHLElBQUk7UUFFN0MsS0FBSyxDQUFDLE9BQU8sRUFBRSxHQUFHLElBQUksQ0FBQyxDQUFDO0lBQ3pCLENBQUM7SUFFRDs7Ozs7OztPQU9HO0lBQ0gsZ0JBQWdCLENBQW1CLElBQU8sRUFBRSxpQkFBa0MsRUFBRTtRQUUvRSxPQUFPLElBQUksQ0FBQztJQUNiLENBQUM7SUFFRCxPQUFPLENBQXNCLGNBQTZDLEVBQUUsR0FBUSxFQUFFLE1BQWU7UUFFcEcsS0FBSyxDQUFDLE9BQU8sQ0FBQyxjQUFjLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFFbkMsSUFBSSxjQUFjLENBQUMsV0FBVyxJQUFJLE1BQU0sQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLFdBQVcsQ0FBQyxDQUFDLE1BQU0sRUFDaEY7WUFDQyxNQUFNLENBQUMsT0FBTyxDQUFDLGNBQWMsQ0FBQyxXQUFXLENBQUM7aUJBQ3hDLE9BQU8sQ0FBQyxVQUFVLElBQUk7Z0JBRXRCLElBQUksQ0FBd0IsQ0FBQztnQkFDN0IsSUFBSSxLQUFLLEdBQUcsT0FBTyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBRTNCLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLEtBQUssSUFB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QThDOztHQUNsRCxhQUFhLENBc2xCekI7QUF0bEJZLHNDQUFhO0FBd2xCYixRQUFBLFNBQVMsR0FBRyxhQUFxQyxDQUFDO0FBRS9ELGtCQUFlLGFBQWEsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IHJldHJ5UmVxdWVzdCB9IGZyb20gJy4uLy4uL2ZldGNoJztcbmltcG9ydCBmcyA9IHJlcXVpcmUoJ2ZzLWV4dHJhJyk7XG5pbXBvcnQgcGF0aCA9IHJlcXVpcmUoJ3BhdGgnKTtcbmltcG9ydCBub3ZlbEluZm8sIHsgSU1kY29uZk1ldGEgfSBmcm9tICdub2RlLW5vdmVsLWluZm8nO1xuaW1wb3J0IHsgZnJvbVVSTCwgSUZyb21VcmxPcHRpb25zLCBJSlNET00sIHJlcXVlc3RUb0pTRE9NLCBwYWNrSlNET00gfSBmcm9tICdqc2RvbS1leHRyYSc7XG5pbXBvcnQgeyBVUkwgfSBmcm9tICdqc2RvbS11cmwnO1xuaW1wb3J0IHsgZ2V0RmlsZVBhdGggfSBmcm9tICcuLi9mcyc7XG5cbmltcG9ydCB7IGdldE9wdGlvbnMgfSBmcm9tICcuLi8uLi9qc2RvbSc7XG5pbXBvcnQgeyBub3JtYWxpemVfdmFsIH0gZnJvbSAnbm9kZS1ub3ZlbC1nbG9iYnkvbGliL2hlbHBlcic7XG5pbXBvcnQgeyBnbG9iYnlBU3luYyB9IGZyb20gJ25vZGUtbm92ZWwtZ2xvYmJ5L2cnO1xuaW1wb3J0IHsgbGF6eUFuYWx5emVSZXBvcnRBbGwsIGxhenlBbmFseXplQWxsLCBkdW1teUNhY2hlLCBhbmFseXplSmEwMDIsIGhhbmRsZUphMDAyIH0gZnJvbSAnQG5vZGUtbm92ZWwvbGF5b3V0LXJlcG9ydGVyJztcbmltcG9ydCB7IG91dHB1dEJsb2NrMDAyLCBvdXRwdXRKYTAwMiB9IGZyb20gJ0Bub2RlLW5vdmVsL2xheW91dC1yZXBvcnRlci9saWIvbWQnO1xuXG5cbmltcG9ydCBfTm92ZWxTaXRlLCB7IHN0YXRpY0ltcGxlbWVudHMsIGRlZmF1bHRKU0RPTU9wdGlvbnMsIFNZTUJPTF9DQUNIRSB9IGZyb20gJy4uL2luZGV4JztcbmltcG9ydCB7IFByb21pc2VCbHVlYmlyZCB9IGZyb20gJy4uL2luZGV4JztcblxuaW1wb3J0IHBhcnNlQ29udGVudFR5cGUgPSByZXF1aXJlKCdjb250ZW50LXR5cGUtcGFyc2VyJyk7XG5pbXBvcnQgbm92ZWxUZXh0IGZyb20gJ25vdmVsLXRleHQnO1xuXG5pbXBvcnQgeyBMYXp5Q29va2llLCBMYXp5Q29va2llSmFyIH0gZnJvbSAnanNkb20tZXh0cmEnO1xuXG5pbXBvcnQgeyBzdHJpbmdpZnkgYXMgbWRjb25mX3N0cmluZ2lmeSB9IGZyb20gJ21kY29uZjInO1xuXG5leHBvcnQgdHlwZSBJT3B0aW9uc1BsdXMgPSB7fVxuXG5leHBvcnQgdHlwZSBJRG93bmxvYWRPcHRpb25zID0gX05vdmVsU2l0ZS5JRG93bmxvYWRPcHRpb25zICYgX05vdmVsU2l0ZS5JT3B0aW9ucyAmIElPcHRpb25zUGx1c1xuZXhwb3J0IHR5cGUgSU9wdGlvbnNSdW50aW1lID0gX05vdmVsU2l0ZS5JT3B0aW9uc1J1bnRpbWUgJiBJT3B0aW9uc1BsdXNcblxuZXhwb3J0IGltcG9ydCBJTm92ZWwgPSBfTm92ZWxTaXRlLklOb3ZlbDtcblxuaW1wb3J0IHsgUmVzcG9uc2VSZXF1ZXN0IH0gZnJvbSAncmVxdWVzdCc7XG5cbmltcG9ydCB7IGNvbnNvbGUsIGNvbnNvbGVEZWJ1ZyB9IGZyb20gJy4uLy4uL3V0aWwvbG9nJztcblxuZXhwb3J0IHR5cGUgSUZldGNoQ2hhcHRlciA9IHtcblx0Ym9keT86IGFueTtcblx0ZG9tPzogSUpTRE9NO1xuXHRyZXM/OiBSZXNwb25zZVJlcXVlc3Q7XG5cdGpzb24/LFxuXG5cdHVybD86IFVSTCxcblx0Y29udGVudFR5cGVQYXJzZWQ/OiBSZXR1cm5UeXBlPHBhcnNlQ29udGVudFR5cGU+LFxufTtcblxuZXhwb3J0IHR5cGUgSVNlc3Npb25EYXRhID0ge1xuXHRba2V5OiBzdHJpbmddOiBhbnksXG59XG5cbkBzdGF0aWNJbXBsZW1lbnRzPF9Ob3ZlbFNpdGUuSU5vdmVsU2l0ZVN0YXRpYzxOb3ZlbFNpdGVEZW1vPj4oKVxuZXhwb3J0IGNsYXNzIE5vdmVsU2l0ZURlbW8gZXh0ZW5kcyBfTm92ZWxTaXRlXG57XG5cdHB1YmxpYyBzdGF0aWMgcmVhZG9ubHkgSURLRVk6IHN0cmluZyA9IG51bGw7XG5cblx0Y29uc3RydWN0b3Iob3B0aW9uczogSURvd25sb2FkT3B0aW9ucywgLi4uYXJndilcblx0e1xuXHRcdHN1cGVyKG9wdGlvbnMsIC4uLmFyZ3YpO1xuXHR9XG5cblx0LyoqXG5cdCAqIEB0b2RvIOiuk+atpOaWueazleacieaEj+e+qVxuXHQgKlxuXHQgKiDnlKjkvoboqqrmmI7nm67liY3nq5npu57nmoTmiYDpnIAgc2Vzc2lvbiBjb29raWVzXG5cdCAqXG5cdCAqIEBwYXJhbSB7VH0gZGF0YVxuXHQgKiBAcmV0dXJucyB7VH1cblx0ICovXG5cdGNoZWNrU2Vzc2lvbkRhdGE8VCA9IElTZXNzaW9uRGF0YT4oZGF0YTogVCwgb3B0aW9uc1J1bnRpbWU6IElPcHRpb25zUnVudGltZSA9IHt9KVxuXHR7XG5cdFx0cmV0dXJuIGRhdGE7XG5cdH1cblxuXHRzZXNzaW9uPFQgPSBJT3B0aW9uc1J1bnRpbWU+KG9wdGlvbnNSdW50aW1lOiBQYXJ0aWFsPFQgJiBJRG93bmxvYWRPcHRpb25zPiwgdXJsOiBVUkwsIGRvbWFpbj86IHN0cmluZylcblx0e1xuXHRcdHN1cGVyLnNlc3Npb24ob3B0aW9uc1J1bnRpbWUsIHVybCk7XG5cblx0XHRpZiAob3B0aW9uc1J1bnRpbWUuc2Vzc2lvbkRhdGEgJiYgT2JqZWN0LmtleXMob3B0aW9uc1J1bnRpbWUuc2Vzc2lvbkRhdGEpLmxlbmd0aClcblx0XHR7XG5cdFx0XHRPYmplY3QuZW50cmllcyhvcHRpb25zUnVudGltZS5zZXNzaW9uRGF0YSlcblx0XHRcdFx0LmZvckVhY2goZnVuY3Rpb24gKGRhdGEpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRsZXQgYzogTGF6eUNvb2tpZS5Qcm9wZXJ0aWVzO1xuXHRcdFx0XHRcdGxldCB0eXBlYyA9IHR5cGVvZiBkYXRhWzFdO1xuXG5cdFx0XHRcdFx0aWYgKGRhdGFbMV0gJiYgdHlwZWMgPT0gJ29iamVjdCcpXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0YyA9IGRhdGFbMV07XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGVsc2UgaWYgKHR5cGVjID09PSBudWxsIHx8IHR5cGVjICE9ICdvYmplY3QnKVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdGxldCBba2V5LCB2YWx1ZV0gPSBkYXRhO1xuXG5cdFx0XHRcdFx0XHRjID0ge1xuXHRcdFx0XHRcdFx0XHRrZXksXG5cdFx0XHRcdFx0XHRcdHZhbHVlLFxuXHRcdFx0XHRcdFx0fTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0ZWxzZVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdGMgPSBkYXRhWzFdO1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdGlmIChjKVxuXHRcdFx0XHRcdHtcblxuXHRcdFx0XHRcdFx0aWYgKHR5cGVvZiBjID09ICdvYmplY3QnKVxuXHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRpZiAoIWMucGF0aClcblx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdGMucGF0aCA9ICcvJztcblx0XHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHRcdGlmIChjLmhvc3RPbmx5ID09IG51bGwpXG5cdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHRjLmhvc3RPbmx5ID0gZmFsc2U7XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0b3B0aW9uc1J1bnRpbWUub3B0aW9uc0pTRE9NLmNvb2tpZUphclxuXHRcdFx0XHRcdFx0XHQuc2V0Q29va2llU3luYyhjLCB1cmwuaHJlZilcblx0XHRcdFx0XHRcdDtcblxuXHRcdFx0XHRcdFx0aWYgKHR5cGVvZiBjID09ICdvYmplY3QnICYmICFjLmRvbWFpbilcblx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0aWYgKGRvbWFpbilcblx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdGMuZG9tYWluID0gZG9tYWluO1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdGVsc2UgaWYgKHVybCAmJiB1cmwuaG9zdClcblx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdGMuZG9tYWluID0gdXJsLmhvc3Q7XG5cdFx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0XHR0cnlcblx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdG9wdGlvbnNSdW50aW1lLm9wdGlvbnNKU0RPTS5jb29raWVKYXJcblx0XHRcdFx0XHRcdFx0XHRcdC5zZXRDb29raWVTeW5jKGMsIHVybC5ocmVmKVxuXHRcdFx0XHRcdFx0XHRcdDtcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRjYXRjaCAoZSlcblx0XHRcdFx0XHRcdFx0e1xuXG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0pXG5cdFx0XHQ7XG5cblx0XHRcdGNvbnNvbGUuZGlyKG9wdGlvbnNSdW50aW1lLm9wdGlvbnNKU0RPTS5jb29raWVKYXIpO1xuXHRcdH1cblxuXHRcdHJldHVybiB0aGlzO1xuXHR9XG5cblx0ZG93bmxvYWQoaW5wdXRVcmw6IHN0cmluZyB8IFVSTCwgZG93bmxvYWRPcHRpb25zOiBJRG93bmxvYWRPcHRpb25zID0ge30pXG5cdHtcblx0XHRjb25zdCBzZWxmID0gdGhpcztcblx0XHRsZXQgdXJsID0gaW5wdXRVcmwgYXMgVVJMO1xuXG5cdFx0Y29uc3QgW1BBVEhfTk9WRUxfTUFJTiwgb3B0aW9uc1J1bnRpbWVdID0gdGhpcy5nZXRPdXRwdXREaXI8SU9wdGlvbnNSdW50aW1lICYgSURvd25sb2FkT3B0aW9ucz4oZG93bmxvYWRPcHRpb25zKTtcblxuXHRcdGNvbnNvbGVEZWJ1Zy5lbmFibGVkID0gb3B0aW9uc1J1bnRpbWUuZGVidWdMb2c7XG5cblx0XHRyZXR1cm4gUHJvbWlzZUJsdWViaXJkXG5cdFx0XHQuYmluZChzZWxmKVxuXHRcdFx0LnRoZW4oYXN5bmMgKCkgPT5cblx0XHRcdHtcblx0XHRcdFx0dXJsID0gYXdhaXQgdGhpcy5jcmVhdGVNYWluVXJsKHVybCk7XG5cblx0XHRcdFx0c2VsZi5zZXNzaW9uKG9wdGlvbnNSdW50aW1lLCB1cmwpO1xuXG5cdFx0XHRcdGxldCBub3ZlbCA9IGF3YWl0IHNlbGYuZ2V0X3ZvbHVtZV9saXN0PElPcHRpb25zUnVudGltZSAmIElEb3dubG9hZE9wdGlvbnM+KHVybCwgb3B0aW9uc1J1bnRpbWUpO1xuXG5cdFx0XHRcdGxldCBwYXRoX25vdmVsID0gc2VsZi5nZXRQYXRoTm92ZWwoUEFUSF9OT1ZFTF9NQUlOLCBub3ZlbCwgb3B0aW9uc1J1bnRpbWUpO1xuXG5cdFx0XHRcdHNlbGYuX2xvYWRFeGlzdHNDb25mKHVybCwgb3B0aW9uc1J1bnRpbWUsIG5vdmVsLCBwYXRoX25vdmVsKTtcblxuXHRcdFx0XHRsZXQgaWR4ID0gb3B0aW9uc1J1bnRpbWUuc3RhcnRJbmRleCB8fCAwO1xuXG5cdFx0XHRcdG9wdGlvbnNSdW50aW1lW1NZTUJPTF9DQUNIRV0ubm92ZWwgPSBub3ZlbDtcblx0XHRcdFx0b3B0aW9uc1J1bnRpbWVbU1lNQk9MX0NBQ0hFXS5wYXRoX25vdmVsID0gcGF0aF9ub3ZlbDtcblxuXHRcdFx0XHRhd2FpdCBQcm9taXNlQmx1ZWJpcmRcblx0XHRcdFx0XHQucmVzb2x2ZShzZWxmLnByb2Nlc3NOb3ZlbChub3ZlbCwgb3B0aW9uc1J1bnRpbWUsIHtcblx0XHRcdFx0XHRcdHVybCxcblx0XHRcdFx0XHRcdHBhdGhfbm92ZWwsXG5cdFx0XHRcdFx0fSkpXG5cdFx0XHRcdFx0LnRhcChscyA9PlxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdHJldHVybiBzZWxmLl9vdXRwdXRBdHRhY2gobm92ZWwsIG9wdGlvbnNSdW50aW1lLCB7XG5cdFx0XHRcdFx0XHRcdHVybCxcblx0XHRcdFx0XHRcdFx0cGF0aF9ub3ZlbCxcblx0XHRcdFx0XHRcdH0pXG5cdFx0XHRcdFx0fSlcblx0XHRcdFx0XHQudGFwKGxzID0+XG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0bGV0IGZpbGUgPSBwYXRoLmpvaW4ocGF0aF9ub3ZlbCxcblx0XHRcdFx0XHRcdFx0YCR7c2VsZi50cmltRmlsZW5hbWVOb3ZlbChub3ZlbC5ub3ZlbF90aXRsZSl9LiR7bm92ZWwudXJsX2RhdGEubm92ZWxfaWR9Lmpzb25gLFxuXHRcdFx0XHRcdFx0XHQpXG5cdFx0XHRcdFx0XHQ7XG5cblx0XHRcdFx0XHRcdHJldHVybiBmcy5vdXRwdXRKU09OKGZpbGUsIG5vdmVsLCB7XG5cdFx0XHRcdFx0XHRcdHNwYWNlczogXCJcXHRcIixcblx0XHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdH0pXG5cdFx0XHRcdDtcblxuXHRcdFx0XHRhd2FpdCBzZWxmLl9zYXZlUmVhZG1lKG9wdGlvbnNSdW50aW1lKTtcblxuXHRcdFx0XHRsZXQgX2NhY2hlID0gZHVtbXlDYWNoZSgpO1xuXG5cdFx0XHRcdGF3YWl0IGdsb2JieUFTeW5jKFtcblx0XHRcdFx0XHQnKiovKi50eHQnLFxuXHRcdFx0XHRdLCB7XG5cdFx0XHRcdFx0Y3dkOiBwYXRoX25vdmVsLFxuXHRcdFx0XHR9KVxuXHRcdFx0XHRcdC5tYXBTZXJpZXMoYXN5bmMgKGZpbGUpID0+XG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0bGV0IF9wID0gcGF0aC5wYXJzZShmaWxlKTtcblx0XHRcdFx0XHRcdGNvbnN0IF9jYWNoZV9rZXlfID0gcGF0aC5qb2luKF9wLmRpciwgX3AubmFtZSk7XG5cblx0XHRcdFx0XHRcdGF3YWl0IGZzXG5cdFx0XHRcdFx0XHRcdC5yZWFkRmlsZShwYXRoLmpvaW4ocGF0aF9ub3ZlbCwgZmlsZSkpXG5cdFx0XHRcdFx0XHRcdC50aGVuKGJ1ZiA9PlxuXHRcdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdFx0YW5hbHl6ZUphMDAyKHtcblx0XHRcdFx0XHRcdFx0XHRcdGlucHV0OiBidWYudG9TdHJpbmcoKSxcblx0XHRcdFx0XHRcdFx0XHRcdF9jYWNoZV9rZXlfLFxuXHRcdFx0XHRcdFx0XHRcdFx0X2NhY2hlLFxuXHRcdFx0XHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdFx0XHR9KVxuXHRcdFx0XHRcdFx0O1xuXHRcdFx0XHRcdH0pXG5cdFx0XHRcdFx0LnRhcChhc3luYyAoKSA9PiB7XG5cblx0XHRcdFx0XHRcdGxldCBtZCA9IG91dHB1dEphMDAyKHtcblx0XHRcdFx0XHRcdFx0aW5wdXREYXRhOiBfY2FjaGUuamEyLFxuXHRcdFx0XHRcdFx0fSk7XG5cblx0XHRcdFx0XHRcdHJldHVybiBmcy5vdXRwdXRGaWxlKHBhdGguam9pbihwYXRoX25vdmVsLCAnamEyLm1kJyksIG1kKVxuXHRcdFx0XHRcdH0pXG5cdFx0XHRcdDtcblxuXHRcdFx0XHRyZXR1cm4gbm92ZWw7XG5cdFx0XHR9KVxuXHRcdFx0O1xuXHR9XG5cblx0cHJvdGVjdGVkIGFzeW5jIF9vdXRwdXRBdHRhY2g8VCA9IGFueT4obm92ZWw6IElOb3ZlbCwgb3B0aW9uc1J1bnRpbWU6IElPcHRpb25zUnVudGltZSwgX2NhY2hlXzoge1xuXHRcdHVybDogVVJMLFxuXHRcdHBhdGhfbm92ZWw6IHN0cmluZyxcblx0fSwgLi4uYXJndilcblx0e1xuXHRcdGNvbnN0IHNlbGYgPSB0aGlzO1xuXHRcdGNvbnN0IHsgdXJsLCBwYXRoX25vdmVsIH0gPSBfY2FjaGVfO1xuXG5cdFx0aWYgKG5vdmVsLnZvbHVtZV9saXN0KVxuXHRcdHtcblx0XHRcdHJldHVybiBQcm9taXNlQmx1ZWJpcmRcblx0XHRcdFx0LnJlc29sdmUobm92ZWwudm9sdW1lX2xpc3QpXG5cdFx0XHRcdC5lYWNoKCh2b2x1bWUsIHZpZCkgPT5cblx0XHRcdFx0e1xuXG5cdFx0XHRcdFx0bGV0IGRpcm5hbWU6IHN0cmluZztcblxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdGxldCBfdmlkID0gJyc7XG5cblx0XHRcdFx0XHRcdGlmICghb3B0aW9uc1J1bnRpbWUubm9EaXJQcmVmaXgpXG5cdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdF92aWQgPSB2aWQudG9TdHJpbmcoKS5wYWRTdGFydCg0LCAnMCcpICsgJzAnO1xuXHRcdFx0XHRcdFx0XHRfdmlkICs9ICdfJztcblx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0ZGlybmFtZSA9IHBhdGguam9pbihwYXRoX25vdmVsLFxuXHRcdFx0XHRcdFx0XHRgJHtfdmlkfSR7c2VsZi50cmltRmlsZW5hbWVWb2x1bWUodm9sdW1lLnZvbHVtZV90aXRsZSl9YCxcblx0XHRcdFx0XHRcdCk7XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0bGV0IGltZ3M6IHN0cmluZ1tdID0gW107XG5cblx0XHRcdFx0XHRyZXR1cm4gUHJvbWlzZUJsdWViaXJkXG5cdFx0XHRcdFx0XHQucmVzb2x2ZSh2b2x1bWUuY2hhcHRlcl9saXN0KVxuXHRcdFx0XHRcdFx0LmVhY2goY2hhcHRlciA9PlxuXHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRpZiAoY2hhcHRlci5pbWdzKVxuXHRcdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdFx0aW1ncy5wdXNoKC4uLmNoYXB0ZXIuaW1ncyk7XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdH0pXG5cdFx0XHRcdFx0XHQudGFwKCgpID0+XG5cdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdGltZ3MgPSBpbWdzLmZpbHRlcih2ID0+IHYpO1xuXG5cdFx0XHRcdFx0XHRcdGlmIChpbWdzLmxlbmd0aClcblx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdGxldCBmaWxlID0gcGF0aC5qb2luKGRpcm5hbWUsICdBVFRBQ0gubWQnKTtcblxuXHRcdFx0XHRcdFx0XHRcdGxldCBpbWFnZXMgPSBPYmplY3Rcblx0XHRcdFx0XHRcdFx0XHRcdC5lbnRyaWVzKGltZ3MgYXMgc3RyaW5nW10pXG5cdFx0XHRcdFx0XHRcdFx0XHQucmVkdWNlKChhLCBbaywgdl0pID0+XG5cdFx0XHRcdFx0XHRcdFx0XHR7XG5cblx0XHRcdFx0XHRcdFx0XHRcdFx0YVtrLnRvU3RyaW5nKCkucGFkU3RhcnQoMywgJzAnKV0gPSB2O1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRyZXR1cm4gYVxuXHRcdFx0XHRcdFx0XHRcdFx0fSwge30gYXMgUmVjb3JkPHN0cmluZywgc3RyaW5nPik7XG5cblx0XHRcdFx0XHRcdFx0XHRsZXQgbWQgPSBtZGNvbmZfc3RyaW5naWZ5KHtcblx0XHRcdFx0XHRcdFx0XHRcdGF0dGFjaDoge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRpbWFnZXMsXG5cdFx0XHRcdFx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdFx0XHRcdH0pO1xuXG5cdFx0XHRcdFx0XHRcdFx0cmV0dXJuIGZzLm91dHB1dEZpbGUoZmlsZSwgbWQpO1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHR9KVxuXHRcdFx0XHR9KVxuXHRcdFx0XHQ7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIFByb21pc2VCbHVlYmlyZC5yZXNvbHZlKClcblx0fVxuXG5cdHByb3RlY3RlZCBhc3luYyBfcHJvY2Vzc05vdmVsPFQgPSBhbnk+KG5vdmVsOiBJTm92ZWwsIG9wdGlvbnNSdW50aW1lOiBJT3B0aW9uc1J1bnRpbWUsIF9jYWNoZV86IHtcblx0XHR1cmw6IFVSTCxcblx0XHRwYXRoX25vdmVsOiBzdHJpbmcsXG5cdH0sIC4uLmFyZ3YpXG5cdHtcblx0XHRjb25zdCBzZWxmID0gdGhpcztcblx0XHRsZXQgaWR4ID0gb3B0aW9uc1J1bnRpbWUuc3RhcnRJbmRleCB8fCAwO1xuXG5cdFx0bGV0IHsgdXJsLCBwYXRoX25vdmVsIH0gPSBfY2FjaGVfO1xuXG5cdFx0cmV0dXJuIFByb21pc2VCbHVlYmlyZFxuXHRcdFx0Lm1hcFNlcmllcyhub3ZlbC52b2x1bWVfbGlzdCwgKHZvbHVtZSwgdmlkKSA9PlxuXHRcdFx0e1xuXHRcdFx0XHRsZXQgZGlybmFtZTogc3RyaW5nO1xuXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRsZXQgX3ZpZCA9ICcnO1xuXG5cdFx0XHRcdFx0aWYgKCFvcHRpb25zUnVudGltZS5ub0RpclByZWZpeClcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRfdmlkID0gdmlkLnRvU3RyaW5nKCkucGFkU3RhcnQoNCwgJzAnKSArICcwJztcblx0XHRcdFx0XHRcdF92aWQgKz0gJ18nO1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdGRpcm5hbWUgPSBwYXRoLmpvaW4ocGF0aF9ub3ZlbCxcblx0XHRcdFx0XHRcdGAke192aWR9JHtzZWxmLnRyaW1GaWxlbmFtZVZvbHVtZSh2b2x1bWUudm9sdW1lX3RpdGxlKX1gLFxuXHRcdFx0XHRcdCk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRpZiAoIW9wdGlvbnNSdW50aW1lLm5vRmlyZVByZWZpeCAmJiBvcHRpb25zUnVudGltZS5maWxlUHJlZml4TW9kZSA+PSAyKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0bGV0IGk6IG51bWJlcjtcblxuXHRcdFx0XHRcdGxldCBib29sID0gdm9sdW1lLmNoYXB0ZXJfbGlzdC5ldmVyeShmdW5jdGlvbiAoY2hhcHRlciwgailcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRsZXQgbSA9IChvcHRpb25zUnVudGltZS5maWxlUHJlZml4TW9kZSA+IDMgP1xuXHRcdFx0XHRcdFx0XHRcdGNoYXB0ZXIuY2hhcHRlcl90aXRsZSA6IG5vcm1hbGl6ZV92YWwoY2hhcHRlci5jaGFwdGVyX3RpdGxlKVxuXHRcdFx0XHRcdFx0XHQpXG5cdFx0XHRcdFx0XHRcdC5yZXBsYWNlKC9eXFxEKy8sICcnKVxuXHRcdFx0XHRcdFx0XHQvLy5yZXBsYWNlKC9eKFxcZCspLiskLywgJyQxJylcblx0XHRcdFx0XHRcdFx0LnJlcGxhY2UoL14oXFxkKylcXEQuKiQvLCAnJDEnKVxuXHRcdFx0XHRcdFx0O1xuXG5cdFx0XHRcdFx0XHQvL2NvbnNvbGUubG9nKG0sIGNoYXB0ZXIuY2hhcHRlcl90aXRsZSk7XG5cblx0XHRcdFx0XHRcdGlmICgvXlxcZCskLy50ZXN0KG0pKVxuXHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRsZXQgbTIgPSBwYXJzZUludChtKTtcblxuXHRcdFx0XHRcdFx0XHRpZiAoaiA9PSAwKVxuXHRcdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdFx0aSA9IG0yO1xuXG5cdFx0XHRcdFx0XHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0ZWxzZSBpZiAobTIgPT09ICsraSlcblx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdHJldHVybiB0cnVlO1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdFx0XHR9KTtcblxuXHRcdFx0XHRcdC8vY29uc29sZS5sb2coYm9vbCk7XG5cblx0XHRcdFx0XHRpZiAoYm9vbClcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHR2b2x1bWUuY2hhcHRlcl9saXN0LmZvckVhY2goZnVuY3Rpb24gKGNoYXB0ZXIpXG5cdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdGNoYXB0ZXIuY2hhcHRlcl9pbmRleCA9ICcnO1xuXHRcdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cblx0XHRcdFx0aWYgKG9wdGlvbnNSdW50aW1lLmV2ZW50KVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0c2VsZi5lbWl0KG9wdGlvbnNSdW50aW1lLmV2ZW50LCAndm9sdW1lJywgdm9sdW1lLCB7XG5cdFx0XHRcdFx0XHRvcHRpb25zUnVudGltZSxcblx0XHRcdFx0XHRcdGRpcm5hbWUsXG5cdFx0XHRcdFx0XHR2aWQsXG5cdFx0XHRcdFx0XHRub3ZlbCxcblx0XHRcdFx0XHRcdHVybCxcblx0XHRcdFx0XHR9KTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdHJldHVybiBQcm9taXNlQmx1ZWJpcmRcblx0XHRcdFx0XHQubWFwU2VyaWVzKHZvbHVtZS5jaGFwdGVyX2xpc3QsIGFzeW5jIChjaGFwdGVyLCBjaWQpID0+XG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0Ly9jaGFwdGVyLmNoYXB0ZXJfaW5kZXggPSAoaWR4KyspO1xuXG5cdFx0XHRcdFx0XHRjb25zdCBjdXJyZW50X2lkeCA9IGlkeCsrO1xuXG5cdFx0XHRcdFx0XHRsZXQgZmlsZSA9IGdldEZpbGVQYXRoKHNlbGYsIHtcblx0XHRcdFx0XHRcdFx0Y2hhcHRlciwgY2lkLFxuXHRcdFx0XHRcdFx0XHRleHQ6ICcudHh0JyxcblxuXHRcdFx0XHRcdFx0XHRpZHg6IGN1cnJlbnRfaWR4LFxuXG5cdFx0XHRcdFx0XHRcdGRpcm5hbWUsXG5cdFx0XHRcdFx0XHRcdHZvbHVtZSwgdmlkLFxuXHRcdFx0XHRcdFx0fSwgb3B0aW9uc1J1bnRpbWUpO1xuXG5cdFx0XHRcdFx0XHRpZiAoc2VsZi5fY2hlY2tFeGlzdHMob3B0aW9uc1J1bnRpbWUsIGZpbGUpKVxuXHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRyZXR1cm4gZmlsZTtcblx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0bGV0IHVybCA9IHNlbGYuX2NyZWF0ZUNoYXB0ZXJVcmwoe1xuXHRcdFx0XHRcdFx0XHRub3ZlbCxcblx0XHRcdFx0XHRcdFx0dm9sdW1lLFxuXHRcdFx0XHRcdFx0XHRjaGFwdGVyLFxuXHRcdFx0XHRcdFx0fSwgb3B0aW9uc1J1bnRpbWUpO1xuXG5cdFx0XHRcdFx0XHRhd2FpdCBzZWxmLl9mZXRjaENoYXB0ZXIodXJsLCBvcHRpb25zUnVudGltZSlcblx0XHRcdFx0XHRcdFx0LnRoZW4oZnVuY3Rpb24gKHJldClcblx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdHJldHVybiBzZWxmLl9wYXJzZUNoYXB0ZXIocmV0LCBvcHRpb25zUnVudGltZSwge1xuXHRcdFx0XHRcdFx0XHRcdFx0ZmlsZSxcblx0XHRcdFx0XHRcdFx0XHRcdG5vdmVsLFxuXHRcdFx0XHRcdFx0XHRcdFx0dm9sdW1lLFxuXHRcdFx0XHRcdFx0XHRcdFx0Y2hhcHRlcixcblx0XHRcdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHRcdFx0fSlcblx0XHRcdFx0XHRcdFx0LnRoZW4oZnVuY3Rpb24gKHRleHQpXG5cdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHRpZiAodHlwZW9mIHRleHQgPT0gJ3N0cmluZycpXG5cdFx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdFx0cmV0dXJuIG5vdmVsVGV4dC50b1N0cih0ZXh0KTtcblx0XHRcdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdFx0XHRyZXR1cm4gdGV4dDtcblx0XHRcdFx0XHRcdFx0fSlcblx0XHRcdFx0XHRcdFx0LnRoZW4oYXN5bmMgKHRleHQ6IHN0cmluZykgPT5cblx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdGF3YWl0IHRoaXMuX3NhdmVGaWxlKHtcblx0XHRcdFx0XHRcdFx0XHRcdGZpbGUsXG5cdFx0XHRcdFx0XHRcdFx0XHRjb250ZXh0OiB0ZXh0LFxuXHRcdFx0XHRcdFx0XHRcdFx0b3B0aW9uc1J1bnRpbWUsXG5cdFx0XHRcdFx0XHRcdFx0fSk7XG5cblx0XHRcdFx0XHRcdFx0XHRyZXR1cm4gdGV4dDtcblx0XHRcdFx0XHRcdFx0fSlcblx0XHRcdFx0XHRcdDtcblxuXHRcdFx0XHRcdFx0cmV0dXJuIGZpbGU7XG5cdFx0XHRcdFx0fSlcblx0XHRcdFx0XHQ7XG5cdFx0XHR9KVxuXHRcdFx0LnRoZW4oZnVuY3Rpb24gKHJldClcblx0XHRcdHtcblx0XHRcdFx0cmV0dXJuIHJldCBhcyBhbnkgYXMgVDtcblx0XHRcdH0pXG5cdFx0XHQ7XG5cdH1cblxuXHRwcm9jZXNzTm92ZWw8VD4obm92ZWw6IElOb3ZlbCwgb3B0aW9uc1J1bnRpbWU6IElPcHRpb25zUnVudGltZSwgX2NhY2hlXzoge1xuXHRcdHVybDogVVJMLFxuXHRcdHBhdGhfbm92ZWw6IHN0cmluZyxcblx0fSwgLi4uYXJndilcblx0e1xuXHRcdC8vIEB0cy1pZ25vcmVcblx0XHRsZXQgcHI6IGFueTtcblxuXHRcdHByID0gb3B0aW9uc1J1bnRpbWUuZmV0Y2hNZXRhRGF0YU9ubHkgPyBbXSA6IHRoaXMuX3Byb2Nlc3NOb3ZlbDxUPihub3ZlbCwgb3B0aW9uc1J1bnRpbWUsIF9jYWNoZV8sIC4uLmFyZ3YpO1xuXG5cdFx0cmV0dXJuIFByb21pc2VCbHVlYmlyZFxuXHRcdFx0LnJlc29sdmUocHIpXG5cdFx0XHQudGhlbihmdW5jdGlvbiAocmV0OiBUKVxuXHRcdFx0e1xuXHRcdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHRcdG5vdmVsLFxuXHRcdFx0XHRcdG9wdGlvbnNSdW50aW1lLFxuXHRcdFx0XHRcdF9jYWNoZV8sXG5cdFx0XHRcdFx0cmV0LFxuXHRcdFx0XHR9O1xuXHRcdFx0fSlcblx0XHRcdDtcblx0fVxuXG5cdHByb3RlY3RlZCBfc3RyaXBDb250ZW50KHRleHQ6IHN0cmluZylcblx0e1xuXHRcdHJldHVybiB0ZXh0O1xuXHR9XG5cblx0cHJvdGVjdGVkIF9wYXJzZUNoYXB0ZXI8VD4ocmV0OiBJRmV0Y2hDaGFwdGVyLCBvcHRpb25zUnVudGltZTogVCAmIElPcHRpb25zUnVudGltZSwgY2FjaGU6IHtcblx0XHRmaWxlOiBzdHJpbmcsXG5cdFx0bm92ZWw6IF9Ob3ZlbFNpdGUuSU5vdmVsLFxuXHRcdHZvbHVtZTogX05vdmVsU2l0ZS5JVm9sdW1lLFxuXHRcdGNoYXB0ZXI6IF9Ob3ZlbFNpdGUuSUNoYXB0ZXIsXG5cdH0pOiBzdHJpbmcgfCBQcm9taXNlPHN0cmluZz5cblx0e1xuXHRcdGlmICghcmV0KVxuXHRcdHtcblx0XHRcdHJldHVybiAnJztcblx0XHR9XG5cblx0XHR0aHJvdyBuZXcgU3ludGF4RXJyb3IoYEZ1bmN0aW9uIG5vdCBpbXBsZW1lbnRlZGApO1xuXHR9XG5cblx0cHJvdGVjdGVkIF9mZXRjaENoYXB0ZXI8VD4odXJsOiBVUkwsIG9wdGlvbnNSdW50aW1lOiBUICYgSU9wdGlvbnNSdW50aW1lKVxuXHR7XG5cdFx0cmV0dXJuIFByb21pc2VCbHVlYmlyZC5yZXNvbHZlKCkudGhlbihhc3luYyBmdW5jdGlvbiAoKVxuXHRcdHtcblx0XHRcdGNvbnNvbGVEZWJ1Zy5kZWJ1ZyhgZmV0Y2hDaGFwdGVyYCwgdXJsLnRvU3RyaW5nKCkpO1xuXG5cdFx0XHRsZXQgcmV0ID0ge30gYXMgSUZldGNoQ2hhcHRlcjtcblxuXHRcdFx0bGV0IG9wdHMgPSBnZXRPcHRpb25zKG9wdGlvbnNSdW50aW1lKTtcblxuXHRcdFx0aWYgKG9wdGlvbnNSdW50aW1lLmRpc2FibGVEb3dubG9hZClcblx0XHRcdHtcblx0XHRcdFx0cmV0dXJuIG51bGw7XG5cdFx0XHR9XG5cdFx0XHRlbHNlIGlmICh0cnVlKVxuXHRcdFx0e1xuXHRcdFx0XHRpZiAob3B0aW9uc1J1bnRpbWUucmV0cnlEZWxheSA+IDApXG5cdFx0XHRcdHtcblx0XHRcdFx0XHQvLyBAdHMtaWdub3JlXG5cdFx0XHRcdFx0b3B0cy5yZXF1ZXN0T3B0aW9ucy5kZWxheSA9IG9wdGlvbnNSdW50aW1lLnJldHJ5RGVsYXk7XG5cdFx0XHRcdH1cblx0XHRcdFx0ZWxzZVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdFx0XHRcdG9wdHMucmVxdWVzdE9wdGlvbnMucmV0cnkgPSAxO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0YXdhaXQgcmV0cnlSZXF1ZXN0KHVybCwgb3B0cy5yZXF1ZXN0T3B0aW9ucylcblx0XHRcdFx0XHQudGhlbihmdW5jdGlvbiAocmVzKVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdGNvbnN0IGNvbnRlbnRUeXBlUGFyc2VkID0gcGFyc2VDb250ZW50VHlwZShyZXMuaGVhZGVyc1tcImNvbnRlbnQtdHlwZVwiXSk7XG5cblx0XHRcdFx0XHRcdHJldC5jb250ZW50VHlwZVBhcnNlZCA9IGNvbnRlbnRUeXBlUGFyc2VkO1xuXG5cdFx0XHRcdFx0XHQvLyBAdHMtaWdub3JlXG5cdFx0XHRcdFx0XHRyZXQudXJsID0gdXJsO1xuXG5cdFx0XHRcdFx0XHRpZiAoY29udGVudFR5cGVQYXJzZWQuaXNIVE1MKCkgfHwgY29udGVudFR5cGVQYXJzZWQuaXNYTUwoKSlcblx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0cmV0LmRvbSA9IHJlcXVlc3RUb0pTRE9NKHJlcywgdXJsLCBvcHRpb25zUnVudGltZS5vcHRpb25zSlNET00pO1xuXHRcdFx0XHRcdFx0XHRyZXQuZG9tID0gcGFja0pTRE9NKHJldC5kb20pO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0ZWxzZSBpZiAoY29udGVudFR5cGVQYXJzZWQuc3VidHlwZSA9PSAnanNvbicpXG5cdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdHJldC5qc29uID0gSlNPTi5wYXJzZShyZXMuYm9keS50b1N0cmluZygpKTtcblx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0cmV0LnJlcyA9IHJlcztcblx0XHRcdFx0XHRcdHJldC5ib2R5ID0gcmVzLmJvZHk7XG5cdFx0XHRcdFx0fSlcblx0XHRcdFx0O1xuXHRcdFx0fVxuXHRcdFx0ZWxzZVxuXHRcdFx0e1xuXHRcdFx0XHQvLyBAdHMtaWdub3JlXG5cdFx0XHRcdHJldC5kb20gPSBhd2FpdCBmcm9tVVJMKHVybCwgb3B0aW9uc1J1bnRpbWUub3B0aW9uc0pTRE9NKTtcblxuXHRcdFx0XHRyZXQucmVzID0gcmV0LmRvbS5fb3B0aW9ucy5SZXNwb25zZTtcblx0XHRcdFx0cmV0LmJvZHkgPSByZXQuZG9tLl9vcHRpb25zLmJvZHk7XG5cdFx0XHR9XG5cblx0XHRcdHJldHVybiByZXQ7XG5cdFx0fSk7XG5cdH1cblxuXHRwcm90ZWN0ZWQgX2V4cG9ydERvd25sb2FkT3B0aW9ucyhvcHRpb25zUnVudGltZT86IElPcHRpb25zUnVudGltZSk6IGFueVxuXHR7XG5cdFx0bGV0IG9wdHMgPSB7fTtcblxuXHRcdGlmIChvcHRpb25zUnVudGltZSlcblx0XHR7XG5cdFx0XHRsZXQgYm9vbDogYm9vbGVhbjtcblxuXHRcdFx0Zm9yIChsZXQgayBvZiBbXG5cdFx0XHRcdCdub0ZpcmVQcmVmaXgnLFxuXHRcdFx0XHQnbm9GaWxlUGFkZW5kJyxcblx0XHRcdFx0J2ZpbGVQcmVmaXhNb2RlJyxcblx0XHRcdFx0J3N0YXJ0SW5kZXgnLFxuXHRcdFx0XSlcblx0XHRcdHtcblx0XHRcdFx0aWYgKChrIGluIG9wdGlvbnNSdW50aW1lKSAmJiB0eXBlb2Ygb3B0aW9uc1J1bnRpbWVba10gIT09ICd1bmRlZmluZWQnKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0Ym9vbCA9IHRydWU7XG5cdFx0XHRcdFx0b3B0c1trXSA9IG9wdGlvbnNSdW50aW1lW2tdO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0cmV0dXJuIG9wdHM7XG5cdH1cblxuXHRwcm90ZWN0ZWQgX3NhdmVSZWFkbWUob3B0aW9uc1J1bnRpbWU6IElPcHRpb25zUnVudGltZSwgb3B0aW9ucyA9IHt9LCAuLi5vcHRzKVxuXHR7XG5cdFx0aWYgKHRoaXMuSURLRVkpXG5cdFx0e1xuXHRcdFx0b3B0aW9uc1t0aGlzLklES0VZXSA9IG9wdGlvbnNbdGhpcy5JREtFWV0gfHwge307XG5cblx0XHRcdHRyeVxuXHRcdFx0e1xuXHRcdFx0XHRvcHRpb25zW3RoaXMuSURLRVldLm5vdmVsX2lkID0gb3B0aW9uc1t0aGlzLklES0VZXS5ub3ZlbF9pZCB8fCBvcHRpb25zUnVudGltZVtTWU1CT0xfQ0FDSEVdLm5vdmVsLnVybF9kYXRhLm5vdmVsX2lkO1xuXHRcdFx0fVxuXHRcdFx0Y2F0Y2ggKGUpXG5cdFx0XHR7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0bGV0IGRvd25sb2FkT3B0aW9ucyA9IHRoaXMuX2V4cG9ydERvd25sb2FkT3B0aW9ucyhvcHRpb25zUnVudGltZSk7XG5cblx0XHRyZXR1cm4gc3VwZXIuX3NhdmVSZWFkbWUob3B0aW9uc1J1bnRpbWUsIG9wdGlvbnMsIHtcblx0XHRcdG9wdGlvbnM6IHtcblx0XHRcdFx0dGV4dGxheW91dDoge1xuXHRcdFx0XHRcdGFsbG93X2xmMjogdHJ1ZSxcblx0XHRcdFx0fSxcblx0XHRcdFx0ZG93bmxvYWRPcHRpb25zOiBkb3dubG9hZE9wdGlvbnMgfHwge30sXG5cdFx0XHR9LFxuXHRcdH0sIC4uLm9wdHMpO1xuXHR9XG5cblx0cHJvdGVjdGVkIF9nZXRfbWV0YShpbnB1dFVybCwgb3B0aW9uc1J1bnRpbWUsIGNhY2hlPzoge1xuXHRcdGRvbT86IElKU0RPTSxcblx0fSlcblx0e1xuXHRcdHRocm93IG5ldyBTeW50YXhFcnJvcigpO1xuXHR9XG5cbn1cblxuZXhwb3J0IGNvbnN0IE5vdmVsU2l0ZSA9IE5vdmVsU2l0ZURlbW8gYXMgdHlwZW9mIE5vdmVsU2l0ZURlbW87XG5cbmV4cG9ydCBkZWZhdWx0IE5vdmVsU2l0ZURlbW87XG4iXX0=