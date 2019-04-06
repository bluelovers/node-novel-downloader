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
const fs_iconv_1 = require("fs-iconv");
const path = require("path");
const jsdom_extra_1 = require("jsdom-extra");
const fs_1 = require("../fs");
const jsdom_1 = require("../../jsdom");
const helper_1 = require("node-novel-globby/lib/helper");
const index_1 = require("../index");
const index_2 = require("../index");
const parseContentType = require("content-type-parser");
const novel_text_1 = require("novel-text");
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
            .then(async function () {
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
                let file = path.join(path_novel, `${self.trimFilenameNovel(novel.novel_title)}.${novel.url_data.novel_id}.json`);
                return fs_iconv_1.default.outputJSON(file, novel, {
                    spaces: "\t",
                });
            });
            await self._saveReadme(optionsRuntime);
            return novel;
        });
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
                    await fs_iconv_1.default.outputFile(file, text);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFzZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImJhc2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFBQSx1Q0FBMkM7QUFDM0MsdUNBQThCO0FBQzlCLDZCQUE2QjtBQUU3Qiw2Q0FBMEY7QUFFMUYsOEJBQW9DO0FBRXBDLHVDQUF5QztBQUN6Qyx5REFBNkQ7QUFFN0Qsb0NBQTJGO0FBQzNGLG9DQUEyQztBQUUzQyx3REFBd0Q7QUFDeEQsMkNBQW1DO0FBYW5DLHdDQUF5QztBQWlCekMsSUFBYSxhQUFhLEdBQTFCLE1BQWEsYUFBYyxTQUFRLGVBQVU7SUFJNUMsWUFBWSxPQUF5QixFQUFFLEdBQUcsSUFBSTtRQUU3QyxLQUFLLENBQUMsT0FBTyxFQUFFLEdBQUcsSUFBSSxDQUFDLENBQUM7SUFDekIsQ0FBQztJQUVEOzs7Ozs7O09BT0c7SUFDSCxnQkFBZ0IsQ0FBbUIsSUFBTyxFQUFFLGlCQUFrQyxFQUFFO1FBRS9FLE9BQU8sSUFBSSxDQUFDO0lBQ2IsQ0FBQztJQUVELE9BQU8sQ0FBc0IsY0FBNkMsRUFBRSxHQUFRLEVBQUUsTUFBZTtRQUVwRyxLQUFLLENBQUMsT0FBTyxDQUFDLGNBQWMsRUFBRSxHQUFHLENBQUMsQ0FBQztRQUVuQyxJQUFJLGNBQWMsQ0FBQyxXQUFXLElBQUksTUFBTSxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsV0FBVyxDQUFDLENBQUMsTUFBTSxFQUNoRjtZQUNDLE1BQU0sQ0FBQyxPQUFPLENBQUMsY0FBYyxDQUFDLFdBQVcsQ0FBQztpQkFDeEMsT0FBTyxDQUFDLFVBQVUsSUFBSTtnQkFFdEIsSUFBSSxDQUF3QixDQUFDO2dCQUM3QixJQUFJLEtBQUssR0FBRyxPQUFPLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFFM0IsSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksS0FBSyxJQUFJLFFBQVEsRUFDaEM7b0JBQ0MsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FB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RHpCLHdCQUFnQixFQUE4Qzs7R0FDbEQsYUFBYSxDQTBkekI7QUExZFksc0NBQWE7QUE0ZGIsUUFBQSxTQUFTLEdBQUcsYUFBcUMsQ0FBQztBQUUvRCxrQkFBZSxhQUFhLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyByZXRyeVJlcXVlc3QgfSBmcm9tICcuLi8uLi9mZXRjaCc7XG5pbXBvcnQgZnMsIHt9IGZyb20gJ2ZzLWljb252JztcbmltcG9ydCAqIGFzIHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQgbm92ZWxJbmZvLCB7IElNZGNvbmZNZXRhIH0gZnJvbSAnbm9kZS1ub3ZlbC1pbmZvJztcbmltcG9ydCB7IGZyb21VUkwsIElGcm9tVXJsT3B0aW9ucywgSUpTRE9NLCByZXF1ZXN0VG9KU0RPTSwgcGFja0pTRE9NIH0gZnJvbSAnanNkb20tZXh0cmEnO1xuaW1wb3J0IHsgVVJMIH0gZnJvbSAnanNkb20tdXJsJztcbmltcG9ydCB7IGdldEZpbGVQYXRoIH0gZnJvbSAnLi4vZnMnO1xuXG5pbXBvcnQgeyBnZXRPcHRpb25zIH0gZnJvbSAnLi4vLi4vanNkb20nO1xuaW1wb3J0IHsgbm9ybWFsaXplX3ZhbCB9IGZyb20gJ25vZGUtbm92ZWwtZ2xvYmJ5L2xpYi9oZWxwZXInO1xuXG5pbXBvcnQgX05vdmVsU2l0ZSwgeyBzdGF0aWNJbXBsZW1lbnRzLCBkZWZhdWx0SlNET01PcHRpb25zLCBTWU1CT0xfQ0FDSEUgfSBmcm9tICcuLi9pbmRleCc7XG5pbXBvcnQgeyBQcm9taXNlQmx1ZWJpcmQgfSBmcm9tICcuLi9pbmRleCc7XG5cbmltcG9ydCAqIGFzIHBhcnNlQ29udGVudFR5cGUgZnJvbSAnY29udGVudC10eXBlLXBhcnNlcic7XG5pbXBvcnQgbm92ZWxUZXh0IGZyb20gJ25vdmVsLXRleHQnO1xuXG5pbXBvcnQgeyBMYXp5Q29va2llLCBMYXp5Q29va2llSmFyIH0gZnJvbSAnanNkb20tZXh0cmEnO1xuXG5leHBvcnQgdHlwZSBJT3B0aW9uc1BsdXMgPSB7fVxuXG5leHBvcnQgdHlwZSBJRG93bmxvYWRPcHRpb25zID0gX05vdmVsU2l0ZS5JRG93bmxvYWRPcHRpb25zICYgX05vdmVsU2l0ZS5JT3B0aW9ucyAmIElPcHRpb25zUGx1c1xuZXhwb3J0IHR5cGUgSU9wdGlvbnNSdW50aW1lID0gX05vdmVsU2l0ZS5JT3B0aW9uc1J1bnRpbWUgJiBJT3B0aW9uc1BsdXNcblxuZXhwb3J0IGltcG9ydCBJTm92ZWwgPSBfTm92ZWxTaXRlLklOb3ZlbDtcblxuaW1wb3J0IHsgUmVzcG9uc2VSZXF1ZXN0IH0gZnJvbSAncmVxdWVzdCc7XG5cbmltcG9ydCB7IGNvbnNvbGUgfSBmcm9tICcuLi8uLi91dGlsL2xvZyc7XG5cbmV4cG9ydCB0eXBlIElGZXRjaENoYXB0ZXIgPSB7XG5cdGJvZHk/OiBhbnk7XG5cdGRvbT86IElKU0RPTTtcblx0cmVzPzogUmVzcG9uc2VSZXF1ZXN0O1xuXHRqc29uPyxcblxuXHR1cmw/OiBVUkwsXG5cdGNvbnRlbnRUeXBlUGFyc2VkPzogUmV0dXJuVHlwZTxwYXJzZUNvbnRlbnRUeXBlPixcbn07XG5cbmV4cG9ydCB0eXBlIElTZXNzaW9uRGF0YSA9IHtcblx0W2tleTogc3RyaW5nXTogYW55LFxufVxuXG5Ac3RhdGljSW1wbGVtZW50czxfTm92ZWxTaXRlLklOb3ZlbFNpdGVTdGF0aWM8Tm92ZWxTaXRlRGVtbz4+KClcbmV4cG9ydCBjbGFzcyBOb3ZlbFNpdGVEZW1vIGV4dGVuZHMgX05vdmVsU2l0ZVxue1xuXHRwdWJsaWMgc3RhdGljIHJlYWRvbmx5IElES0VZOiBzdHJpbmcgPSBudWxsO1xuXG5cdGNvbnN0cnVjdG9yKG9wdGlvbnM6IElEb3dubG9hZE9wdGlvbnMsIC4uLmFyZ3YpXG5cdHtcblx0XHRzdXBlcihvcHRpb25zLCAuLi5hcmd2KTtcblx0fVxuXG5cdC8qKlxuXHQgKiBAdG9kbyDorpPmraTmlrnms5XmnInmhI/nvqlcblx0ICpcblx0ICog55So5L6G6Kqq5piO55uu5YmN56uZ6bue55qE5omA6ZyAIHNlc3Npb24gY29va2llc1xuXHQgKlxuXHQgKiBAcGFyYW0ge1R9IGRhdGFcblx0ICogQHJldHVybnMge1R9XG5cdCAqL1xuXHRjaGVja1Nlc3Npb25EYXRhPFQgPSBJU2Vzc2lvbkRhdGE+KGRhdGE6IFQsIG9wdGlvbnNSdW50aW1lOiBJT3B0aW9uc1J1bnRpbWUgPSB7fSlcblx0e1xuXHRcdHJldHVybiBkYXRhO1xuXHR9XG5cblx0c2Vzc2lvbjxUID0gSU9wdGlvbnNSdW50aW1lPihvcHRpb25zUnVudGltZTogUGFydGlhbDxUICYgSURvd25sb2FkT3B0aW9ucz4sIHVybDogVVJMLCBkb21haW4/OiBzdHJpbmcpXG5cdHtcblx0XHRzdXBlci5zZXNzaW9uKG9wdGlvbnNSdW50aW1lLCB1cmwpO1xuXG5cdFx0aWYgKG9wdGlvbnNSdW50aW1lLnNlc3Npb25EYXRhICYmIE9iamVjdC5rZXlzKG9wdGlvbnNSdW50aW1lLnNlc3Npb25EYXRhKS5sZW5ndGgpXG5cdFx0e1xuXHRcdFx0T2JqZWN0LmVudHJpZXMob3B0aW9uc1J1bnRpbWUuc2Vzc2lvbkRhdGEpXG5cdFx0XHRcdC5mb3JFYWNoKGZ1bmN0aW9uIChkYXRhKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0bGV0IGM6IExhenlDb29raWUuUHJvcGVydGllcztcblx0XHRcdFx0XHRsZXQgdHlwZWMgPSB0eXBlb2YgZGF0YVsxXTtcblxuXHRcdFx0XHRcdGlmIChkYXRhWzFdICYmIHR5cGVjID09ICdvYmplY3QnKVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdGMgPSBkYXRhWzFdO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRlbHNlIGlmICh0eXBlYyA9PT0gbnVsbCB8fCB0eXBlYyAhPSAnb2JqZWN0Jylcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRsZXQgW2tleSwgdmFsdWVdID0gZGF0YTtcblxuXHRcdFx0XHRcdFx0YyA9IHtcblx0XHRcdFx0XHRcdFx0a2V5LFxuXHRcdFx0XHRcdFx0XHR2YWx1ZSxcblx0XHRcdFx0XHRcdH07XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGVsc2Vcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRjID0gZGF0YVsxXTtcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRpZiAoYylcblx0XHRcdFx0XHR7XG5cblx0XHRcdFx0XHRcdGlmICh0eXBlb2YgYyA9PSAnb2JqZWN0Jylcblx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0aWYgKCFjLnBhdGgpXG5cdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHRjLnBhdGggPSAnLyc7XG5cdFx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0XHRpZiAoYy5ob3N0T25seSA9PSBudWxsKVxuXHRcdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdFx0Yy5ob3N0T25seSA9IGZhbHNlO1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdG9wdGlvbnNSdW50aW1lLm9wdGlvbnNKU0RPTS5jb29raWVKYXJcblx0XHRcdFx0XHRcdFx0LnNldENvb2tpZVN5bmMoYywgdXJsLmhyZWYpXG5cdFx0XHRcdFx0XHQ7XG5cblx0XHRcdFx0XHRcdGlmICh0eXBlb2YgYyA9PSAnb2JqZWN0JyAmJiAhYy5kb21haW4pXG5cdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdGlmIChkb21haW4pXG5cdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHRjLmRvbWFpbiA9IGRvbWFpbjtcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRlbHNlIGlmICh1cmwgJiYgdXJsLmhvc3QpXG5cdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHRjLmRvbWFpbiA9IHVybC5ob3N0O1xuXHRcdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdFx0dHJ5XG5cdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHRvcHRpb25zUnVudGltZS5vcHRpb25zSlNET00uY29va2llSmFyXG5cdFx0XHRcdFx0XHRcdFx0XHQuc2V0Q29va2llU3luYyhjLCB1cmwuaHJlZilcblx0XHRcdFx0XHRcdFx0XHQ7XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0Y2F0Y2ggKGUpXG5cdFx0XHRcdFx0XHRcdHtcblxuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9KVxuXHRcdFx0O1xuXG5cdFx0XHRjb25zb2xlLmRpcihvcHRpb25zUnVudGltZS5vcHRpb25zSlNET00uY29va2llSmFyKTtcblx0XHR9XG5cblx0XHRyZXR1cm4gdGhpcztcblx0fVxuXG5cdGRvd25sb2FkKGlucHV0VXJsOiBzdHJpbmcgfCBVUkwsIGRvd25sb2FkT3B0aW9uczogSURvd25sb2FkT3B0aW9ucyA9IHt9KVxuXHR7XG5cdFx0Y29uc3Qgc2VsZiA9IHRoaXM7XG5cdFx0bGV0IHVybCA9IGlucHV0VXJsIGFzIFVSTDtcblxuXHRcdGNvbnN0IFtQQVRIX05PVkVMX01BSU4sIG9wdGlvbnNSdW50aW1lXSA9IHRoaXMuZ2V0T3V0cHV0RGlyPElPcHRpb25zUnVudGltZSAmIElEb3dubG9hZE9wdGlvbnM+KGRvd25sb2FkT3B0aW9ucyk7XG5cblx0XHRyZXR1cm4gUHJvbWlzZUJsdWViaXJkXG5cdFx0XHQuYmluZChzZWxmKVxuXHRcdFx0LnRoZW4oYXN5bmMgZnVuY3Rpb24gKClcblx0XHRcdHtcblx0XHRcdFx0dXJsID0gYXdhaXQgdGhpcy5jcmVhdGVNYWluVXJsKHVybCk7XG5cblx0XHRcdFx0c2VsZi5zZXNzaW9uKG9wdGlvbnNSdW50aW1lLCB1cmwpO1xuXG5cdFx0XHRcdGxldCBub3ZlbCA9IGF3YWl0IHNlbGYuZ2V0X3ZvbHVtZV9saXN0PElPcHRpb25zUnVudGltZSAmIElEb3dubG9hZE9wdGlvbnM+KHVybCwgb3B0aW9uc1J1bnRpbWUpO1xuXG5cdFx0XHRcdGxldCBwYXRoX25vdmVsID0gc2VsZi5nZXRQYXRoTm92ZWwoUEFUSF9OT1ZFTF9NQUlOLCBub3ZlbCwgb3B0aW9uc1J1bnRpbWUpO1xuXG5cdFx0XHRcdHNlbGYuX2xvYWRFeGlzdHNDb25mKHVybCwgb3B0aW9uc1J1bnRpbWUsIG5vdmVsLCBwYXRoX25vdmVsKTtcblxuXHRcdFx0XHRsZXQgaWR4ID0gb3B0aW9uc1J1bnRpbWUuc3RhcnRJbmRleCB8fCAwO1xuXG5cdFx0XHRcdG9wdGlvbnNSdW50aW1lW1NZTUJPTF9DQUNIRV0ubm92ZWwgPSBub3ZlbDtcblx0XHRcdFx0b3B0aW9uc1J1bnRpbWVbU1lNQk9MX0NBQ0hFXS5wYXRoX25vdmVsID0gcGF0aF9ub3ZlbDtcblxuXHRcdFx0XHRhd2FpdCBQcm9taXNlQmx1ZWJpcmRcblx0XHRcdFx0XHQucmVzb2x2ZShzZWxmLnByb2Nlc3NOb3ZlbChub3ZlbCwgb3B0aW9uc1J1bnRpbWUsIHtcblx0XHRcdFx0XHRcdHVybCxcblx0XHRcdFx0XHRcdHBhdGhfbm92ZWwsXG5cdFx0XHRcdFx0fSkpXG5cdFx0XHRcdFx0LnRhcChscyA9PlxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdGxldCBmaWxlID0gcGF0aC5qb2luKHBhdGhfbm92ZWwsXG5cdFx0XHRcdFx0XHRcdGAke3NlbGYudHJpbUZpbGVuYW1lTm92ZWwobm92ZWwubm92ZWxfdGl0bGUpfS4ke25vdmVsLnVybF9kYXRhLm5vdmVsX2lkfS5qc29uYFxuXHRcdFx0XHRcdFx0XHQpXG5cdFx0XHRcdFx0XHQ7XG5cblx0XHRcdFx0XHRcdHJldHVybiBmcy5vdXRwdXRKU09OKGZpbGUsIG5vdmVsLCB7XG5cdFx0XHRcdFx0XHRcdHNwYWNlczogXCJcXHRcIixcblx0XHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdH0pXG5cdFx0XHRcdDtcblxuXHRcdFx0XHRhd2FpdCBzZWxmLl9zYXZlUmVhZG1lKG9wdGlvbnNSdW50aW1lKTtcblxuXHRcdFx0XHRyZXR1cm4gbm92ZWw7XG5cdFx0XHR9KVxuXHRcdFx0O1xuXHR9XG5cblx0cHJvdGVjdGVkIGFzeW5jIF9wcm9jZXNzTm92ZWw8VCA9IGFueT4obm92ZWw6IElOb3ZlbCwgb3B0aW9uc1J1bnRpbWU6IElPcHRpb25zUnVudGltZSwgX2NhY2hlXzoge1xuXHRcdHVybDogVVJMLFxuXHRcdHBhdGhfbm92ZWw6IHN0cmluZyxcblx0fSwgLi4uYXJndilcblx0e1xuXHRcdGNvbnN0IHNlbGYgPSB0aGlzO1xuXHRcdGxldCBpZHggPSBvcHRpb25zUnVudGltZS5zdGFydEluZGV4IHx8IDA7XG5cblx0XHRsZXQgeyB1cmwsIHBhdGhfbm92ZWwgfSA9IF9jYWNoZV87XG5cblx0XHRyZXR1cm4gUHJvbWlzZUJsdWViaXJkXG5cdFx0XHQubWFwU2VyaWVzKG5vdmVsLnZvbHVtZV9saXN0LCBmdW5jdGlvbiAodm9sdW1lLCB2aWQpXG5cdFx0XHR7XG5cdFx0XHRcdGxldCBkaXJuYW1lOiBzdHJpbmc7XG5cblx0XHRcdFx0e1xuXHRcdFx0XHRcdGxldCBfdmlkID0gJyc7XG5cblx0XHRcdFx0XHRpZiAoIW9wdGlvbnNSdW50aW1lLm5vRGlyUHJlZml4KVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdF92aWQgPSB2aWQudG9TdHJpbmcoKS5wYWRTdGFydCg0LCAnMCcpICsgJzAnO1xuXHRcdFx0XHRcdFx0X3ZpZCArPSAnXyc7XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0ZGlybmFtZSA9IHBhdGguam9pbihwYXRoX25vdmVsLFxuXHRcdFx0XHRcdFx0YCR7X3ZpZH0ke3NlbGYudHJpbUZpbGVuYW1lVm9sdW1lKHZvbHVtZS52b2x1bWVfdGl0bGUpfWBcblx0XHRcdFx0XHQpO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0aWYgKCFvcHRpb25zUnVudGltZS5ub0ZpcmVQcmVmaXggJiYgb3B0aW9uc1J1bnRpbWUuZmlsZVByZWZpeE1vZGUgPj0gMilcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGxldCBpOiBudW1iZXI7XG5cblx0XHRcdFx0XHRsZXQgYm9vbCA9IHZvbHVtZS5jaGFwdGVyX2xpc3QuZXZlcnkoZnVuY3Rpb24gKGNoYXB0ZXIsIGopXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0bGV0IG0gPSAob3B0aW9uc1J1bnRpbWUuZmlsZVByZWZpeE1vZGUgPiAzID9cblx0XHRcdFx0XHRcdFx0Y2hhcHRlci5jaGFwdGVyX3RpdGxlIDogbm9ybWFsaXplX3ZhbChjaGFwdGVyLmNoYXB0ZXJfdGl0bGUpXG5cdFx0XHRcdFx0XHRcdClcblx0XHRcdFx0XHRcdFx0LnJlcGxhY2UoL15cXEQrLywgJycpXG5cdFx0XHRcdFx0XHRcdC8vLnJlcGxhY2UoL14oXFxkKykuKyQvLCAnJDEnKVxuXHRcdFx0XHRcdFx0XHQucmVwbGFjZSgvXihcXGQrKVxcRC4qJC8sICckMScpXG5cdFx0XHRcdFx0XHQ7XG5cblx0XHRcdFx0XHRcdC8vY29uc29sZS5sb2cobSwgY2hhcHRlci5jaGFwdGVyX3RpdGxlKTtcblxuXHRcdFx0XHRcdFx0aWYgKC9eXFxkKyQvLnRlc3QobSkpXG5cdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdGxldCBtMiA9IHBhcnNlSW50KG0pO1xuXG5cdFx0XHRcdFx0XHRcdGlmIChqID09IDApXG5cdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHRpID0gbTI7XG5cblx0XHRcdFx0XHRcdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRlbHNlIGlmIChtMiA9PT0gKytpKVxuXHRcdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdFx0XHRcdH0pO1xuXG5cdFx0XHRcdFx0Ly9jb25zb2xlLmxvZyhib29sKTtcblxuXHRcdFx0XHRcdGlmIChib29sKVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdHZvbHVtZS5jaGFwdGVyX2xpc3QuZm9yRWFjaChmdW5jdGlvbiAoY2hhcHRlcilcblx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0Y2hhcHRlci5jaGFwdGVyX2luZGV4ID0gJyc7XG5cdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRpZiAob3B0aW9uc1J1bnRpbWUuZXZlbnQpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRzZWxmLmVtaXQob3B0aW9uc1J1bnRpbWUuZXZlbnQsICd2b2x1bWUnLCB2b2x1bWUsIHtcblx0XHRcdFx0XHRcdG9wdGlvbnNSdW50aW1lLFxuXHRcdFx0XHRcdFx0ZGlybmFtZSxcblx0XHRcdFx0XHRcdHZpZCxcblx0XHRcdFx0XHRcdG5vdmVsLFxuXHRcdFx0XHRcdFx0dXJsLFxuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0cmV0dXJuIFByb21pc2VCbHVlYmlyZFxuXHRcdFx0XHRcdC5tYXBTZXJpZXModm9sdW1lLmNoYXB0ZXJfbGlzdCwgYXN5bmMgZnVuY3Rpb24gKGNoYXB0ZXIsIGNpZClcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHQvL2NoYXB0ZXIuY2hhcHRlcl9pbmRleCA9IChpZHgrKyk7XG5cblx0XHRcdFx0XHRcdGNvbnN0IGN1cnJlbnRfaWR4ID0gaWR4Kys7XG5cblx0XHRcdFx0XHRcdGxldCBmaWxlID0gZ2V0RmlsZVBhdGgoc2VsZiwge1xuXHRcdFx0XHRcdFx0XHRjaGFwdGVyLCBjaWQsXG5cdFx0XHRcdFx0XHRcdGV4dDogJy50eHQnLFxuXG5cdFx0XHRcdFx0XHRcdGlkeDogY3VycmVudF9pZHgsXG5cblx0XHRcdFx0XHRcdFx0ZGlybmFtZSxcblx0XHRcdFx0XHRcdFx0dm9sdW1lLCB2aWQsXG5cdFx0XHRcdFx0XHR9LCBvcHRpb25zUnVudGltZSk7XG5cblx0XHRcdFx0XHRcdGlmIChzZWxmLl9jaGVja0V4aXN0cyhvcHRpb25zUnVudGltZSwgZmlsZSkpXG5cdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdHJldHVybiBmaWxlO1xuXHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHRsZXQgdXJsID0gc2VsZi5fY3JlYXRlQ2hhcHRlclVybCh7XG5cdFx0XHRcdFx0XHRcdG5vdmVsLFxuXHRcdFx0XHRcdFx0XHR2b2x1bWUsXG5cdFx0XHRcdFx0XHRcdGNoYXB0ZXIsXG5cdFx0XHRcdFx0XHR9LCBvcHRpb25zUnVudGltZSk7XG5cblx0XHRcdFx0XHRcdGF3YWl0IHNlbGYuX2ZldGNoQ2hhcHRlcih1cmwsIG9wdGlvbnNSdW50aW1lKVxuXHRcdFx0XHRcdFx0XHQudGhlbihmdW5jdGlvbiAocmV0KVxuXHRcdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdFx0cmV0dXJuIHNlbGYuX3BhcnNlQ2hhcHRlcihyZXQsIG9wdGlvbnNSdW50aW1lLCB7XG5cdFx0XHRcdFx0XHRcdFx0XHRmaWxlLFxuXHRcdFx0XHRcdFx0XHRcdFx0bm92ZWwsXG5cdFx0XHRcdFx0XHRcdFx0XHR2b2x1bWUsXG5cdFx0XHRcdFx0XHRcdFx0XHRjaGFwdGVyLFxuXHRcdFx0XHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdFx0XHR9KVxuXHRcdFx0XHRcdFx0XHQudGhlbihmdW5jdGlvbiAodGV4dClcblx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdGlmICh0eXBlb2YgdGV4dCA9PSAnc3RyaW5nJylcblx0XHRcdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdFx0XHRyZXR1cm4gbm92ZWxUZXh0LnRvU3RyKHRleHQpO1xuXHRcdFx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0XHRcdHJldHVybiB0ZXh0O1xuXHRcdFx0XHRcdFx0XHR9KVxuXHRcdFx0XHRcdFx0XHQudGhlbihhc3luYyBmdW5jdGlvbiAodGV4dDogc3RyaW5nKVxuXHRcdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdFx0YXdhaXQgZnMub3V0cHV0RmlsZShmaWxlLCB0ZXh0KTtcblxuXHRcdFx0XHRcdFx0XHRcdHJldHVybiB0ZXh0O1xuXHRcdFx0XHRcdFx0XHR9KVxuXHRcdFx0XHRcdFx0O1xuXG5cdFx0XHRcdFx0XHRyZXR1cm4gZmlsZTtcblx0XHRcdFx0XHR9KVxuXHRcdFx0XHRcdDtcblx0XHRcdH0pXG5cdFx0XHQudGhlbihmdW5jdGlvbiAocmV0KVxuXHRcdFx0e1xuXHRcdFx0XHRyZXR1cm4gcmV0IGFzIGFueSBhcyBUO1xuXHRcdFx0fSlcblx0XHQ7XG5cdH1cblxuXHRwcm9jZXNzTm92ZWw8VD4obm92ZWw6IElOb3ZlbCwgb3B0aW9uc1J1bnRpbWU6IElPcHRpb25zUnVudGltZSwgX2NhY2hlXzoge1xuXHRcdHVybDogVVJMLFxuXHRcdHBhdGhfbm92ZWw6IHN0cmluZyxcblx0fSwgLi4uYXJndilcblx0e1xuXHRcdC8vIEB0cy1pZ25vcmVcblx0XHRsZXQgcHI6IGFueTtcblxuXHRcdHByID0gb3B0aW9uc1J1bnRpbWUuZmV0Y2hNZXRhRGF0YU9ubHkgPyBbXSA6IHRoaXMuX3Byb2Nlc3NOb3ZlbDxUPihub3ZlbCwgb3B0aW9uc1J1bnRpbWUsIF9jYWNoZV8sIC4uLmFyZ3YpO1xuXG5cdFx0cmV0dXJuIFByb21pc2VCbHVlYmlyZFxuXHRcdFx0LnJlc29sdmUocHIpXG5cdFx0XHQudGhlbihmdW5jdGlvbiAocmV0OiBUKVxuXHRcdFx0e1xuXHRcdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHRcdG5vdmVsLFxuXHRcdFx0XHRcdG9wdGlvbnNSdW50aW1lLFxuXHRcdFx0XHRcdF9jYWNoZV8sXG5cdFx0XHRcdFx0cmV0LFxuXHRcdFx0XHR9O1xuXHRcdFx0fSlcblx0XHQ7XG5cdH1cblxuXHRwcm90ZWN0ZWQgX3N0cmlwQ29udGVudCh0ZXh0OiBzdHJpbmcpXG5cdHtcblx0XHRyZXR1cm4gdGV4dDtcblx0fVxuXG5cdHByb3RlY3RlZCBfcGFyc2VDaGFwdGVyPFQ+KHJldDogSUZldGNoQ2hhcHRlciwgb3B0aW9uc1J1bnRpbWU6IFQgJiBJT3B0aW9uc1J1bnRpbWUsIGNhY2hlOiB7XG5cdFx0ZmlsZTogc3RyaW5nLFxuXHRcdG5vdmVsOiBfTm92ZWxTaXRlLklOb3ZlbCxcblx0XHR2b2x1bWU6IF9Ob3ZlbFNpdGUuSVZvbHVtZSxcblx0XHRjaGFwdGVyOiBfTm92ZWxTaXRlLklDaGFwdGVyLFxuXHR9KTogc3RyaW5nIHwgUHJvbWlzZTxzdHJpbmc+XG5cdHtcblx0XHRpZiAoIXJldClcblx0XHR7XG5cdFx0XHRyZXR1cm4gJyc7XG5cdFx0fVxuXG5cdFx0dGhyb3cgbmV3IFN5bnRheEVycm9yKGBGdW5jdGlvbiBub3QgaW1wbGVtZW50ZWRgKTtcblx0fVxuXG5cdHByb3RlY3RlZCBfZmV0Y2hDaGFwdGVyPFQ+KHVybDogVVJMLCBvcHRpb25zUnVudGltZTogVCAmIElPcHRpb25zUnVudGltZSlcblx0e1xuXHRcdHJldHVybiBQcm9taXNlQmx1ZWJpcmQucmVzb2x2ZSgpLnRoZW4oYXN5bmMgZnVuY3Rpb24gKClcblx0XHR7XG5cdFx0XHRsZXQgcmV0ID0ge30gYXMgSUZldGNoQ2hhcHRlcjtcblxuXHRcdFx0bGV0IG9wdHMgPSBnZXRPcHRpb25zKG9wdGlvbnNSdW50aW1lKTtcblxuXHRcdFx0aWYgKG9wdGlvbnNSdW50aW1lLmRpc2FibGVEb3dubG9hZClcblx0XHRcdHtcblx0XHRcdFx0cmV0dXJuIG51bGw7XG5cdFx0XHR9XG5cdFx0XHRlbHNlIGlmICh0cnVlKVxuXHRcdFx0e1xuXHRcdFx0XHRpZiAob3B0aW9uc1J1bnRpbWUucmV0cnlEZWxheSA+IDApXG5cdFx0XHRcdHtcblx0XHRcdFx0XHQvLyBAdHMtaWdub3JlXG5cdFx0XHRcdFx0b3B0cy5yZXF1ZXN0T3B0aW9ucy5kZWxheSA9IG9wdGlvbnNSdW50aW1lLnJldHJ5RGVsYXk7XG5cdFx0XHRcdH1cblx0XHRcdFx0ZWxzZVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdFx0XHRcdG9wdHMucmVxdWVzdE9wdGlvbnMucmV0cnkgPSAxO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0YXdhaXQgcmV0cnlSZXF1ZXN0KHVybCwgb3B0cy5yZXF1ZXN0T3B0aW9ucylcblx0XHRcdFx0XHQudGhlbihmdW5jdGlvbiAocmVzKVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdGNvbnN0IGNvbnRlbnRUeXBlUGFyc2VkID0gcGFyc2VDb250ZW50VHlwZShyZXMuaGVhZGVyc1tcImNvbnRlbnQtdHlwZVwiXSk7XG5cblx0XHRcdFx0XHRcdHJldC5jb250ZW50VHlwZVBhcnNlZCA9IGNvbnRlbnRUeXBlUGFyc2VkO1xuXG5cdFx0XHRcdFx0XHQvLyBAdHMtaWdub3JlXG5cdFx0XHRcdFx0XHRyZXQudXJsID0gdXJsO1xuXG5cdFx0XHRcdFx0XHRpZiAoY29udGVudFR5cGVQYXJzZWQuaXNIVE1MKCkgfHwgY29udGVudFR5cGVQYXJzZWQuaXNYTUwoKSlcblx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0cmV0LmRvbSA9IHJlcXVlc3RUb0pTRE9NKHJlcywgdXJsLCBvcHRpb25zUnVudGltZS5vcHRpb25zSlNET00pO1xuXHRcdFx0XHRcdFx0XHRyZXQuZG9tID0gcGFja0pTRE9NKHJldC5kb20pO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0ZWxzZSBpZiAoY29udGVudFR5cGVQYXJzZWQuc3VidHlwZSA9PSAnanNvbicpXG5cdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdHJldC5qc29uID0gSlNPTi5wYXJzZShyZXMuYm9keS50b1N0cmluZygpKTtcblx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0cmV0LnJlcyA9IHJlcztcblx0XHRcdFx0XHRcdHJldC5ib2R5ID0gcmVzLmJvZHk7XG5cdFx0XHRcdFx0fSlcblx0XHRcdFx0O1xuXHRcdFx0fVxuXHRcdFx0ZWxzZVxuXHRcdFx0e1xuXHRcdFx0XHQvLyBAdHMtaWdub3JlXG5cdFx0XHRcdHJldC5kb20gPSBhd2FpdCBmcm9tVVJMKHVybCwgb3B0aW9uc1J1bnRpbWUub3B0aW9uc0pTRE9NKTtcblxuXHRcdFx0XHRyZXQucmVzID0gcmV0LmRvbS5fb3B0aW9ucy5SZXNwb25zZTtcblx0XHRcdFx0cmV0LmJvZHkgPSByZXQuZG9tLl9vcHRpb25zLmJvZHk7XG5cdFx0XHR9XG5cblx0XHRcdHJldHVybiByZXQ7XG5cdFx0fSk7XG5cdH1cblxuXHRwcm90ZWN0ZWQgX2V4cG9ydERvd25sb2FkT3B0aW9ucyhvcHRpb25zUnVudGltZT86IElPcHRpb25zUnVudGltZSk6IGFueVxuXHR7XG5cdFx0bGV0IG9wdHMgPSB7fTtcblxuXHRcdGlmIChvcHRpb25zUnVudGltZSlcblx0XHR7XG5cdFx0XHRsZXQgYm9vbDogYm9vbGVhbjtcblxuXHRcdFx0Zm9yIChsZXQgayBvZiBbXG5cdFx0XHRcdCdub0ZpcmVQcmVmaXgnLFxuXHRcdFx0XHQnbm9GaWxlUGFkZW5kJyxcblx0XHRcdFx0J2ZpbGVQcmVmaXhNb2RlJyxcblx0XHRcdFx0J3N0YXJ0SW5kZXgnLFxuXHRcdFx0XSlcblx0XHRcdHtcblx0XHRcdFx0aWYgKChrIGluIG9wdGlvbnNSdW50aW1lKSAmJiB0eXBlb2Ygb3B0aW9uc1J1bnRpbWVba10gIT09ICd1bmRlZmluZWQnKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0Ym9vbCA9IHRydWU7XG5cdFx0XHRcdFx0b3B0c1trXSA9IG9wdGlvbnNSdW50aW1lW2tdO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0cmV0dXJuIG9wdHM7XG5cdH1cblxuXHRwcm90ZWN0ZWQgX3NhdmVSZWFkbWUob3B0aW9uc1J1bnRpbWU6IElPcHRpb25zUnVudGltZSwgb3B0aW9ucyA9IHt9LCAuLi5vcHRzKVxuXHR7XG5cdFx0aWYgKHRoaXMuSURLRVkpXG5cdFx0e1xuXHRcdFx0b3B0aW9uc1t0aGlzLklES0VZXSA9IG9wdGlvbnNbdGhpcy5JREtFWV0gfHwge307XG5cblx0XHRcdHRyeVxuXHRcdFx0e1xuXHRcdFx0XHRvcHRpb25zW3RoaXMuSURLRVldLm5vdmVsX2lkID0gb3B0aW9uc1t0aGlzLklES0VZXS5ub3ZlbF9pZCB8fCBvcHRpb25zUnVudGltZVtTWU1CT0xfQ0FDSEVdLm5vdmVsLnVybF9kYXRhLm5vdmVsX2lkO1xuXHRcdFx0fVxuXHRcdFx0Y2F0Y2ggKGUpXG5cdFx0XHR7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0bGV0IGRvd25sb2FkT3B0aW9ucyA9IHRoaXMuX2V4cG9ydERvd25sb2FkT3B0aW9ucyhvcHRpb25zUnVudGltZSk7XG5cblx0XHRyZXR1cm4gc3VwZXIuX3NhdmVSZWFkbWUob3B0aW9uc1J1bnRpbWUsIG9wdGlvbnMsIHtcblx0XHRcdG9wdGlvbnM6IHtcblx0XHRcdFx0dGV4dGxheW91dDoge1xuXHRcdFx0XHRcdGFsbG93X2xmMjogdHJ1ZSxcblx0XHRcdFx0fSxcblx0XHRcdFx0ZG93bmxvYWRPcHRpb25zOiBkb3dubG9hZE9wdGlvbnMgfHwge30sXG5cdFx0XHR9LFxuXHRcdH0sIC4uLm9wdHMpO1xuXHR9XG5cblx0cHJvdGVjdGVkIF9nZXRfbWV0YShpbnB1dFVybCwgb3B0aW9uc1J1bnRpbWUsIGNhY2hlPzoge1xuXHRcdGRvbT86IElKU0RPTSxcblx0fSlcblx0e1xuXHRcdHRocm93IG5ldyBTeW50YXhFcnJvcigpO1xuXHR9XG5cbn1cblxuZXhwb3J0IGNvbnN0IE5vdmVsU2l0ZSA9IE5vdmVsU2l0ZURlbW8gYXMgdHlwZW9mIE5vdmVsU2l0ZURlbW87XG5cbmV4cG9ydCBkZWZhdWx0IE5vdmVsU2l0ZURlbW87XG4iXX0=