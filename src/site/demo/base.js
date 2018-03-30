"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const fetch_1 = require("../../fetch");
const fs_iconv_1 = require("fs-iconv");
const path = require("path");
const jsdom_extra_1 = require("jsdom-extra");
const fs_1 = require("../fs");
const index_1 = require("../index");
const index_2 = require("../index");
const parseContentType = require("content-type-parser");
let NovelSiteDemo = class NovelSiteDemo extends index_1.default {
    constructor(options, ...argv) {
        super(options, ...argv);
    }
    session(optionsRuntime, url) {
        super.session(optionsRuntime, url);
        return this;
    }
    download(inputUrl, downloadOptions = {}) {
        const self = this;
        const [PATH_NOVEL_MAIN, optionsRuntime] = this.getOutputDir(downloadOptions);
        let url = inputUrl;
        return index_2.PromiseBluebird
            .bind(self)
            .then(async function () {
            url = await this.createMainUrl(url);
            self.session(optionsRuntime, url);
            let novel = await self.get_volume_list(url, optionsRuntime);
            let idx = downloadOptions.startIndex || 0;
            let path_novel = path.join(self.PATH_NOVEL_MAIN, `${self.trimFilenameNovel(novel.novel_title)}_(${novel.url_data.novel_id})`);
            optionsRuntime[index_1.SYMBOL_CACHE].novel = novel;
            optionsRuntime[index_1.SYMBOL_CACHE].path_novel = path_novel;
            let ret = await index_2.PromiseBluebird
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
                if (!optionsRuntime.noFirePrefix && optionsRuntime.filePrefixMode == 2) {
                    let i;
                    let bool = volume.chapter_list.every(function (chapter, j) {
                        let m = chapter.chapter_title
                            .replace(/^\D+/, '')
                            .replace(/^(\d+).+$/, '$1');
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
                    let file = fs_1.getFilePath(self, {
                        chapter, cid,
                        ext: '.txt',
                        idx,
                        dirname,
                        volume, vid,
                    }, optionsRuntime);
                    idx++;
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
                        .then(async function (text) {
                        await fs_iconv_1.default.outputFile(file, text);
                        return text;
                    });
                    return file;
                });
            })
                .tap(ls => {
                let file = path.join(path_novel, `${self.trimFilenameNovel(novel.novel_title)}.${novel.url_data.novel_id}.json`);
                return fs_iconv_1.default.outputJSON(file, novel, {
                    spaces: "\t",
                });
            });
            await self._saveReadme(optionsRuntime);
            return novel;
        });
    }
    _parseChapter(ret, optionsRuntime, cache) {
        if (!ret) {
            return '';
        }
        throw new SyntaxError(`Function not implemented`);
    }
    _fetchChapter(url, optionsRuntime) {
        return index_2.PromiseBluebird.resolve().then(async function () {
            let ret = {};
            if (optionsRuntime.disableDownload) {
                return null;
            }
            else if (optionsRuntime.retryDelay > 0) {
                await fetch_1.retryRequest(url, {
                    delay: optionsRuntime.retryDelay,
                    jar: optionsRuntime.optionsJSDOM.cookieJar.wrapForRequest(),
                    resolveWithFullResponse: true,
                })
                    .then(function (res) {
                    const contentTypeParsed = parseContentType(res.headers["content-type"]);
                    if (contentTypeParsed.isHTML() || contentTypeParsed.isXML()) {
                        ret.dom = jsdom_extra_1.requestToJSDOM(res, url, optionsRuntime.optionsJSDOM);
                        ret.dom = jsdom_extra_1.packJSDOM(ret.dom);
                    }
                    ret.res = res;
                    ret.body = res.body;
                });
            }
            else {
                ret.dom = await jsdom_extra_1.fromURL(url, optionsRuntime.optionsJSDOM);
                ret.res = ret.dom._options.Response;
                ret.body = ret.dom._options.body;
            }
            return ret;
        });
    }
    _saveReadme(optionsRuntime, options = {}, ...opts) {
        return super._saveReadme(optionsRuntime, options, {
            options: {
                textlayout: {
                    allow_lf2: true,
                }
            },
        }, ...opts);
    }
};
NovelSiteDemo.IDKEY = null;
NovelSiteDemo = __decorate([
    index_1.staticImplements()
], NovelSiteDemo);
exports.NovelSiteDemo = NovelSiteDemo;
exports.NovelSite = NovelSiteDemo;
exports.default = NovelSiteDemo;
