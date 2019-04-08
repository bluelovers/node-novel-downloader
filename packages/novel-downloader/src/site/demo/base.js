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
                return fs.outputJSON(file, novel, {
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
                    await fs.outputFile(file, text);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFzZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImJhc2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFBQSx1Q0FBMkM7QUFDM0MsK0JBQWdDO0FBQ2hDLDZCQUE4QjtBQUU5Qiw2Q0FBMEY7QUFFMUYsOEJBQW9DO0FBRXBDLHVDQUF5QztBQUN6Qyx5REFBNkQ7QUFFN0Qsb0NBQTJGO0FBQzNGLG9DQUEyQztBQUUzQyx3REFBeUQ7QUFDekQsMkNBQW1DO0FBYW5DLHdDQUF5QztBQWlCekMsSUFBYSxhQUFhLEdBQTFCLE1BQWEsYUFBYyxTQUFRLGVBQVU7SUFJNUMsWUFBWSxPQUF5QixFQUFFLEdBQUcsSUFBSTtRQUU3QyxLQUFLLENBQUMsT0FBTyxFQUFFLEdBQUcsSUFBSSxDQUFDLENBQUM7SUFDekIsQ0FBQztJQUVEOzs7Ozs7O09BT0c7SUFDSCxnQkFBZ0IsQ0FBbUIsSUFBTyxFQUFFLGlCQUFrQyxFQUFFO1FBRS9FLE9BQU8sSUFBSSxDQUFDO0lBQ2IsQ0FBQztJQUVELE9BQU8sQ0FBc0IsY0FBNkMsRUFBRSxHQUFRLEVBQUUsTUFBZTtRQUVwRyxLQUFLLENBQUMsT0FBTyxDQUFDLGNBQWMsRUFBRSxHQUFHLENBQUMsQ0FBQztRQUVuQyxJQUFJLGNBQWMsQ0FBQyxXQUFXLElBQUksTUFBTSxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsV0FBVyxDQUFDLENBQUMsTUFBTSxFQUNoRjtZQUNDLE1BQU0sQ0FBQyxPQUFPLENBQUMsY0FBYyxDQUFDLFdBQVcsQ0FBQztpQkFDeEMsT0FBTyxDQUFDLFVBQVUsSUFBSTtnQkFFdEIsSUFBSSxDQUF3QixDQUFDO2dCQUM3QixJQUFJLEtBQUssR0FBRyxPQUFPLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFFM0IsSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksS0FBSyxJQUFJLFFBQVEsRUFDaEM7b0JBQ0MsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FB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Qix3QkFBZ0IsRUFBOEM7O0dBQ2xELGFBQWEsQ0EwZHpCO0FBMWRZLHNDQUFhO0FBNGRiLFFBQUEsU0FBUyxHQUFHLGFBQXFDLENBQUM7QUFFL0Qsa0JBQWUsYUFBYSxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgcmV0cnlSZXF1ZXN0IH0gZnJvbSAnLi4vLi4vZmV0Y2gnO1xuaW1wb3J0IGZzID0gcmVxdWlyZSgnZnMtZXh0cmEnKTtcbmltcG9ydCBwYXRoID0gcmVxdWlyZSgncGF0aCcpO1xuaW1wb3J0IG5vdmVsSW5mbywgeyBJTWRjb25mTWV0YSB9IGZyb20gJ25vZGUtbm92ZWwtaW5mbyc7XG5pbXBvcnQgeyBmcm9tVVJMLCBJRnJvbVVybE9wdGlvbnMsIElKU0RPTSwgcmVxdWVzdFRvSlNET00sIHBhY2tKU0RPTSB9IGZyb20gJ2pzZG9tLWV4dHJhJztcbmltcG9ydCB7IFVSTCB9IGZyb20gJ2pzZG9tLXVybCc7XG5pbXBvcnQgeyBnZXRGaWxlUGF0aCB9IGZyb20gJy4uL2ZzJztcblxuaW1wb3J0IHsgZ2V0T3B0aW9ucyB9IGZyb20gJy4uLy4uL2pzZG9tJztcbmltcG9ydCB7IG5vcm1hbGl6ZV92YWwgfSBmcm9tICdub2RlLW5vdmVsLWdsb2JieS9saWIvaGVscGVyJztcblxuaW1wb3J0IF9Ob3ZlbFNpdGUsIHsgc3RhdGljSW1wbGVtZW50cywgZGVmYXVsdEpTRE9NT3B0aW9ucywgU1lNQk9MX0NBQ0hFIH0gZnJvbSAnLi4vaW5kZXgnO1xuaW1wb3J0IHsgUHJvbWlzZUJsdWViaXJkIH0gZnJvbSAnLi4vaW5kZXgnO1xuXG5pbXBvcnQgcGFyc2VDb250ZW50VHlwZSA9IHJlcXVpcmUoJ2NvbnRlbnQtdHlwZS1wYXJzZXInKTtcbmltcG9ydCBub3ZlbFRleHQgZnJvbSAnbm92ZWwtdGV4dCc7XG5cbmltcG9ydCB7IExhenlDb29raWUsIExhenlDb29raWVKYXIgfSBmcm9tICdqc2RvbS1leHRyYSc7XG5cbmV4cG9ydCB0eXBlIElPcHRpb25zUGx1cyA9IHt9XG5cbmV4cG9ydCB0eXBlIElEb3dubG9hZE9wdGlvbnMgPSBfTm92ZWxTaXRlLklEb3dubG9hZE9wdGlvbnMgJiBfTm92ZWxTaXRlLklPcHRpb25zICYgSU9wdGlvbnNQbHVzXG5leHBvcnQgdHlwZSBJT3B0aW9uc1J1bnRpbWUgPSBfTm92ZWxTaXRlLklPcHRpb25zUnVudGltZSAmIElPcHRpb25zUGx1c1xuXG5leHBvcnQgaW1wb3J0IElOb3ZlbCA9IF9Ob3ZlbFNpdGUuSU5vdmVsO1xuXG5pbXBvcnQgeyBSZXNwb25zZVJlcXVlc3QgfSBmcm9tICdyZXF1ZXN0JztcblxuaW1wb3J0IHsgY29uc29sZSB9IGZyb20gJy4uLy4uL3V0aWwvbG9nJztcblxuZXhwb3J0IHR5cGUgSUZldGNoQ2hhcHRlciA9IHtcblx0Ym9keT86IGFueTtcblx0ZG9tPzogSUpTRE9NO1xuXHRyZXM/OiBSZXNwb25zZVJlcXVlc3Q7XG5cdGpzb24/LFxuXG5cdHVybD86IFVSTCxcblx0Y29udGVudFR5cGVQYXJzZWQ/OiBSZXR1cm5UeXBlPHBhcnNlQ29udGVudFR5cGU+LFxufTtcblxuZXhwb3J0IHR5cGUgSVNlc3Npb25EYXRhID0ge1xuXHRba2V5OiBzdHJpbmddOiBhbnksXG59XG5cbkBzdGF0aWNJbXBsZW1lbnRzPF9Ob3ZlbFNpdGUuSU5vdmVsU2l0ZVN0YXRpYzxOb3ZlbFNpdGVEZW1vPj4oKVxuZXhwb3J0IGNsYXNzIE5vdmVsU2l0ZURlbW8gZXh0ZW5kcyBfTm92ZWxTaXRlXG57XG5cdHB1YmxpYyBzdGF0aWMgcmVhZG9ubHkgSURLRVk6IHN0cmluZyA9IG51bGw7XG5cblx0Y29uc3RydWN0b3Iob3B0aW9uczogSURvd25sb2FkT3B0aW9ucywgLi4uYXJndilcblx0e1xuXHRcdHN1cGVyKG9wdGlvbnMsIC4uLmFyZ3YpO1xuXHR9XG5cblx0LyoqXG5cdCAqIEB0b2RvIOiuk+atpOaWueazleacieaEj+e+qVxuXHQgKlxuXHQgKiDnlKjkvoboqqrmmI7nm67liY3nq5npu57nmoTmiYDpnIAgc2Vzc2lvbiBjb29raWVzXG5cdCAqXG5cdCAqIEBwYXJhbSB7VH0gZGF0YVxuXHQgKiBAcmV0dXJucyB7VH1cblx0ICovXG5cdGNoZWNrU2Vzc2lvbkRhdGE8VCA9IElTZXNzaW9uRGF0YT4oZGF0YTogVCwgb3B0aW9uc1J1bnRpbWU6IElPcHRpb25zUnVudGltZSA9IHt9KVxuXHR7XG5cdFx0cmV0dXJuIGRhdGE7XG5cdH1cblxuXHRzZXNzaW9uPFQgPSBJT3B0aW9uc1J1bnRpbWU+KG9wdGlvbnNSdW50aW1lOiBQYXJ0aWFsPFQgJiBJRG93bmxvYWRPcHRpb25zPiwgdXJsOiBVUkwsIGRvbWFpbj86IHN0cmluZylcblx0e1xuXHRcdHN1cGVyLnNlc3Npb24ob3B0aW9uc1J1bnRpbWUsIHVybCk7XG5cblx0XHRpZiAob3B0aW9uc1J1bnRpbWUuc2Vzc2lvbkRhdGEgJiYgT2JqZWN0LmtleXMob3B0aW9uc1J1bnRpbWUuc2Vzc2lvbkRhdGEpLmxlbmd0aClcblx0XHR7XG5cdFx0XHRPYmplY3QuZW50cmllcyhvcHRpb25zUnVudGltZS5zZXNzaW9uRGF0YSlcblx0XHRcdFx0LmZvckVhY2goZnVuY3Rpb24gKGRhdGEpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRsZXQgYzogTGF6eUNvb2tpZS5Qcm9wZXJ0aWVzO1xuXHRcdFx0XHRcdGxldCB0eXBlYyA9IHR5cGVvZiBkYXRhWzFdO1xuXG5cdFx0XHRcdFx0aWYgKGRhdGFbMV0gJiYgdHlwZWMgPT0gJ29iamVjdCcpXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0YyA9IGRhdGFbMV07XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGVsc2UgaWYgKHR5cGVjID09PSBudWxsIHx8IHR5cGVjICE9ICdvYmplY3QnKVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdGxldCBba2V5LCB2YWx1ZV0gPSBkYXRhO1xuXG5cdFx0XHRcdFx0XHRjID0ge1xuXHRcdFx0XHRcdFx0XHRrZXksXG5cdFx0XHRcdFx0XHRcdHZhbHVlLFxuXHRcdFx0XHRcdFx0fTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0ZWxzZVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdGMgPSBkYXRhWzFdO1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdGlmIChjKVxuXHRcdFx0XHRcdHtcblxuXHRcdFx0XHRcdFx0aWYgKHR5cGVvZiBjID09ICdvYmplY3QnKVxuXHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRpZiAoIWMucGF0aClcblx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdGMucGF0aCA9ICcvJztcblx0XHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHRcdGlmIChjLmhvc3RPbmx5ID09IG51bGwpXG5cdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHRjLmhvc3RPbmx5ID0gZmFsc2U7XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0b3B0aW9uc1J1bnRpbWUub3B0aW9uc0pTRE9NLmNvb2tpZUphclxuXHRcdFx0XHRcdFx0XHQuc2V0Q29va2llU3luYyhjLCB1cmwuaHJlZilcblx0XHRcdFx0XHRcdDtcblxuXHRcdFx0XHRcdFx0aWYgKHR5cGVvZiBjID09ICdvYmplY3QnICYmICFjLmRvbWFpbilcblx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0aWYgKGRvbWFpbilcblx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdGMuZG9tYWluID0gZG9tYWluO1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdGVsc2UgaWYgKHVybCAmJiB1cmwuaG9zdClcblx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdGMuZG9tYWluID0gdXJsLmhvc3Q7XG5cdFx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0XHR0cnlcblx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdG9wdGlvbnNSdW50aW1lLm9wdGlvbnNKU0RPTS5jb29raWVKYXJcblx0XHRcdFx0XHRcdFx0XHRcdC5zZXRDb29raWVTeW5jKGMsIHVybC5ocmVmKVxuXHRcdFx0XHRcdFx0XHRcdDtcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRjYXRjaCAoZSlcblx0XHRcdFx0XHRcdFx0e1xuXG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0pXG5cdFx0XHQ7XG5cblx0XHRcdGNvbnNvbGUuZGlyKG9wdGlvbnNSdW50aW1lLm9wdGlvbnNKU0RPTS5jb29raWVKYXIpO1xuXHRcdH1cblxuXHRcdHJldHVybiB0aGlzO1xuXHR9XG5cblx0ZG93bmxvYWQoaW5wdXRVcmw6IHN0cmluZyB8IFVSTCwgZG93bmxvYWRPcHRpb25zOiBJRG93bmxvYWRPcHRpb25zID0ge30pXG5cdHtcblx0XHRjb25zdCBzZWxmID0gdGhpcztcblx0XHRsZXQgdXJsID0gaW5wdXRVcmwgYXMgVVJMO1xuXG5cdFx0Y29uc3QgW1BBVEhfTk9WRUxfTUFJTiwgb3B0aW9uc1J1bnRpbWVdID0gdGhpcy5nZXRPdXRwdXREaXI8SU9wdGlvbnNSdW50aW1lICYgSURvd25sb2FkT3B0aW9ucz4oZG93bmxvYWRPcHRpb25zKTtcblxuXHRcdHJldHVybiBQcm9taXNlQmx1ZWJpcmRcblx0XHRcdC5iaW5kKHNlbGYpXG5cdFx0XHQudGhlbihhc3luYyBmdW5jdGlvbiAoKVxuXHRcdFx0e1xuXHRcdFx0XHR1cmwgPSBhd2FpdCB0aGlzLmNyZWF0ZU1haW5VcmwodXJsKTtcblxuXHRcdFx0XHRzZWxmLnNlc3Npb24ob3B0aW9uc1J1bnRpbWUsIHVybCk7XG5cblx0XHRcdFx0bGV0IG5vdmVsID0gYXdhaXQgc2VsZi5nZXRfdm9sdW1lX2xpc3Q8SU9wdGlvbnNSdW50aW1lICYgSURvd25sb2FkT3B0aW9ucz4odXJsLCBvcHRpb25zUnVudGltZSk7XG5cblx0XHRcdFx0bGV0IHBhdGhfbm92ZWwgPSBzZWxmLmdldFBhdGhOb3ZlbChQQVRIX05PVkVMX01BSU4sIG5vdmVsLCBvcHRpb25zUnVudGltZSk7XG5cblx0XHRcdFx0c2VsZi5fbG9hZEV4aXN0c0NvbmYodXJsLCBvcHRpb25zUnVudGltZSwgbm92ZWwsIHBhdGhfbm92ZWwpO1xuXG5cdFx0XHRcdGxldCBpZHggPSBvcHRpb25zUnVudGltZS5zdGFydEluZGV4IHx8IDA7XG5cblx0XHRcdFx0b3B0aW9uc1J1bnRpbWVbU1lNQk9MX0NBQ0hFXS5ub3ZlbCA9IG5vdmVsO1xuXHRcdFx0XHRvcHRpb25zUnVudGltZVtTWU1CT0xfQ0FDSEVdLnBhdGhfbm92ZWwgPSBwYXRoX25vdmVsO1xuXG5cdFx0XHRcdGF3YWl0IFByb21pc2VCbHVlYmlyZFxuXHRcdFx0XHRcdC5yZXNvbHZlKHNlbGYucHJvY2Vzc05vdmVsKG5vdmVsLCBvcHRpb25zUnVudGltZSwge1xuXHRcdFx0XHRcdFx0dXJsLFxuXHRcdFx0XHRcdFx0cGF0aF9ub3ZlbCxcblx0XHRcdFx0XHR9KSlcblx0XHRcdFx0XHQudGFwKGxzID0+XG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0bGV0IGZpbGUgPSBwYXRoLmpvaW4ocGF0aF9ub3ZlbCxcblx0XHRcdFx0XHRcdFx0YCR7c2VsZi50cmltRmlsZW5hbWVOb3ZlbChub3ZlbC5ub3ZlbF90aXRsZSl9LiR7bm92ZWwudXJsX2RhdGEubm92ZWxfaWR9Lmpzb25gXG5cdFx0XHRcdFx0XHRcdClcblx0XHRcdFx0XHRcdDtcblxuXHRcdFx0XHRcdFx0cmV0dXJuIGZzLm91dHB1dEpTT04oZmlsZSwgbm92ZWwsIHtcblx0XHRcdFx0XHRcdFx0c3BhY2VzOiBcIlxcdFwiLFxuXHRcdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0fSlcblx0XHRcdFx0O1xuXG5cdFx0XHRcdGF3YWl0IHNlbGYuX3NhdmVSZWFkbWUob3B0aW9uc1J1bnRpbWUpO1xuXG5cdFx0XHRcdHJldHVybiBub3ZlbDtcblx0XHRcdH0pXG5cdFx0XHQ7XG5cdH1cblxuXHRwcm90ZWN0ZWQgYXN5bmMgX3Byb2Nlc3NOb3ZlbDxUID0gYW55Pihub3ZlbDogSU5vdmVsLCBvcHRpb25zUnVudGltZTogSU9wdGlvbnNSdW50aW1lLCBfY2FjaGVfOiB7XG5cdFx0dXJsOiBVUkwsXG5cdFx0cGF0aF9ub3ZlbDogc3RyaW5nLFxuXHR9LCAuLi5hcmd2KVxuXHR7XG5cdFx0Y29uc3Qgc2VsZiA9IHRoaXM7XG5cdFx0bGV0IGlkeCA9IG9wdGlvbnNSdW50aW1lLnN0YXJ0SW5kZXggfHwgMDtcblxuXHRcdGxldCB7IHVybCwgcGF0aF9ub3ZlbCB9ID0gX2NhY2hlXztcblxuXHRcdHJldHVybiBQcm9taXNlQmx1ZWJpcmRcblx0XHRcdC5tYXBTZXJpZXMobm92ZWwudm9sdW1lX2xpc3QsIGZ1bmN0aW9uICh2b2x1bWUsIHZpZClcblx0XHRcdHtcblx0XHRcdFx0bGV0IGRpcm5hbWU6IHN0cmluZztcblxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0bGV0IF92aWQgPSAnJztcblxuXHRcdFx0XHRcdGlmICghb3B0aW9uc1J1bnRpbWUubm9EaXJQcmVmaXgpXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0X3ZpZCA9IHZpZC50b1N0cmluZygpLnBhZFN0YXJ0KDQsICcwJykgKyAnMCc7XG5cdFx0XHRcdFx0XHRfdmlkICs9ICdfJztcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRkaXJuYW1lID0gcGF0aC5qb2luKHBhdGhfbm92ZWwsXG5cdFx0XHRcdFx0XHRgJHtfdmlkfSR7c2VsZi50cmltRmlsZW5hbWVWb2x1bWUodm9sdW1lLnZvbHVtZV90aXRsZSl9YFxuXHRcdFx0XHRcdCk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRpZiAoIW9wdGlvbnNSdW50aW1lLm5vRmlyZVByZWZpeCAmJiBvcHRpb25zUnVudGltZS5maWxlUHJlZml4TW9kZSA+PSAyKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0bGV0IGk6IG51bWJlcjtcblxuXHRcdFx0XHRcdGxldCBib29sID0gdm9sdW1lLmNoYXB0ZXJfbGlzdC5ldmVyeShmdW5jdGlvbiAoY2hhcHRlciwgailcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRsZXQgbSA9IChvcHRpb25zUnVudGltZS5maWxlUHJlZml4TW9kZSA+IDMgP1xuXHRcdFx0XHRcdFx0XHRjaGFwdGVyLmNoYXB0ZXJfdGl0bGUgOiBub3JtYWxpemVfdmFsKGNoYXB0ZXIuY2hhcHRlcl90aXRsZSlcblx0XHRcdFx0XHRcdFx0KVxuXHRcdFx0XHRcdFx0XHQucmVwbGFjZSgvXlxcRCsvLCAnJylcblx0XHRcdFx0XHRcdFx0Ly8ucmVwbGFjZSgvXihcXGQrKS4rJC8sICckMScpXG5cdFx0XHRcdFx0XHRcdC5yZXBsYWNlKC9eKFxcZCspXFxELiokLywgJyQxJylcblx0XHRcdFx0XHRcdDtcblxuXHRcdFx0XHRcdFx0Ly9jb25zb2xlLmxvZyhtLCBjaGFwdGVyLmNoYXB0ZXJfdGl0bGUpO1xuXG5cdFx0XHRcdFx0XHRpZiAoL15cXGQrJC8udGVzdChtKSlcblx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0bGV0IG0yID0gcGFyc2VJbnQobSk7XG5cblx0XHRcdFx0XHRcdFx0aWYgKGogPT0gMClcblx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdGkgPSBtMjtcblxuXHRcdFx0XHRcdFx0XHRcdHJldHVybiB0cnVlO1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdGVsc2UgaWYgKG0yID09PSArK2kpXG5cdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0XHRcdFx0fSk7XG5cblx0XHRcdFx0XHQvL2NvbnNvbGUubG9nKGJvb2wpO1xuXG5cdFx0XHRcdFx0aWYgKGJvb2wpXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0dm9sdW1lLmNoYXB0ZXJfbGlzdC5mb3JFYWNoKGZ1bmN0aW9uIChjaGFwdGVyKVxuXHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRjaGFwdGVyLmNoYXB0ZXJfaW5kZXggPSAnJztcblx0XHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXG5cdFx0XHRcdGlmIChvcHRpb25zUnVudGltZS5ldmVudClcblx0XHRcdFx0e1xuXHRcdFx0XHRcdHNlbGYuZW1pdChvcHRpb25zUnVudGltZS5ldmVudCwgJ3ZvbHVtZScsIHZvbHVtZSwge1xuXHRcdFx0XHRcdFx0b3B0aW9uc1J1bnRpbWUsXG5cdFx0XHRcdFx0XHRkaXJuYW1lLFxuXHRcdFx0XHRcdFx0dmlkLFxuXHRcdFx0XHRcdFx0bm92ZWwsXG5cdFx0XHRcdFx0XHR1cmwsXG5cdFx0XHRcdFx0fSk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRyZXR1cm4gUHJvbWlzZUJsdWViaXJkXG5cdFx0XHRcdFx0Lm1hcFNlcmllcyh2b2x1bWUuY2hhcHRlcl9saXN0LCBhc3luYyBmdW5jdGlvbiAoY2hhcHRlciwgY2lkKVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdC8vY2hhcHRlci5jaGFwdGVyX2luZGV4ID0gKGlkeCsrKTtcblxuXHRcdFx0XHRcdFx0Y29uc3QgY3VycmVudF9pZHggPSBpZHgrKztcblxuXHRcdFx0XHRcdFx0bGV0IGZpbGUgPSBnZXRGaWxlUGF0aChzZWxmLCB7XG5cdFx0XHRcdFx0XHRcdGNoYXB0ZXIsIGNpZCxcblx0XHRcdFx0XHRcdFx0ZXh0OiAnLnR4dCcsXG5cblx0XHRcdFx0XHRcdFx0aWR4OiBjdXJyZW50X2lkeCxcblxuXHRcdFx0XHRcdFx0XHRkaXJuYW1lLFxuXHRcdFx0XHRcdFx0XHR2b2x1bWUsIHZpZCxcblx0XHRcdFx0XHRcdH0sIG9wdGlvbnNSdW50aW1lKTtcblxuXHRcdFx0XHRcdFx0aWYgKHNlbGYuX2NoZWNrRXhpc3RzKG9wdGlvbnNSdW50aW1lLCBmaWxlKSlcblx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0cmV0dXJuIGZpbGU7XG5cdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdGxldCB1cmwgPSBzZWxmLl9jcmVhdGVDaGFwdGVyVXJsKHtcblx0XHRcdFx0XHRcdFx0bm92ZWwsXG5cdFx0XHRcdFx0XHRcdHZvbHVtZSxcblx0XHRcdFx0XHRcdFx0Y2hhcHRlcixcblx0XHRcdFx0XHRcdH0sIG9wdGlvbnNSdW50aW1lKTtcblxuXHRcdFx0XHRcdFx0YXdhaXQgc2VsZi5fZmV0Y2hDaGFwdGVyKHVybCwgb3B0aW9uc1J1bnRpbWUpXG5cdFx0XHRcdFx0XHRcdC50aGVuKGZ1bmN0aW9uIChyZXQpXG5cdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHRyZXR1cm4gc2VsZi5fcGFyc2VDaGFwdGVyKHJldCwgb3B0aW9uc1J1bnRpbWUsIHtcblx0XHRcdFx0XHRcdFx0XHRcdGZpbGUsXG5cdFx0XHRcdFx0XHRcdFx0XHRub3ZlbCxcblx0XHRcdFx0XHRcdFx0XHRcdHZvbHVtZSxcblx0XHRcdFx0XHRcdFx0XHRcdGNoYXB0ZXIsXG5cdFx0XHRcdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0XHRcdH0pXG5cdFx0XHRcdFx0XHRcdC50aGVuKGZ1bmN0aW9uICh0ZXh0KVxuXHRcdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdFx0aWYgKHR5cGVvZiB0ZXh0ID09ICdzdHJpbmcnKVxuXHRcdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHRcdHJldHVybiBub3ZlbFRleHQudG9TdHIodGV4dCk7XG5cdFx0XHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHRcdFx0cmV0dXJuIHRleHQ7XG5cdFx0XHRcdFx0XHRcdH0pXG5cdFx0XHRcdFx0XHRcdC50aGVuKGFzeW5jIGZ1bmN0aW9uICh0ZXh0OiBzdHJpbmcpXG5cdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHRhd2FpdCBmcy5vdXRwdXRGaWxlKGZpbGUsIHRleHQpO1xuXG5cdFx0XHRcdFx0XHRcdFx0cmV0dXJuIHRleHQ7XG5cdFx0XHRcdFx0XHRcdH0pXG5cdFx0XHRcdFx0XHQ7XG5cblx0XHRcdFx0XHRcdHJldHVybiBmaWxlO1xuXHRcdFx0XHRcdH0pXG5cdFx0XHRcdFx0O1xuXHRcdFx0fSlcblx0XHRcdC50aGVuKGZ1bmN0aW9uIChyZXQpXG5cdFx0XHR7XG5cdFx0XHRcdHJldHVybiByZXQgYXMgYW55IGFzIFQ7XG5cdFx0XHR9KVxuXHRcdDtcblx0fVxuXG5cdHByb2Nlc3NOb3ZlbDxUPihub3ZlbDogSU5vdmVsLCBvcHRpb25zUnVudGltZTogSU9wdGlvbnNSdW50aW1lLCBfY2FjaGVfOiB7XG5cdFx0dXJsOiBVUkwsXG5cdFx0cGF0aF9ub3ZlbDogc3RyaW5nLFxuXHR9LCAuLi5hcmd2KVxuXHR7XG5cdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdGxldCBwcjogYW55O1xuXG5cdFx0cHIgPSBvcHRpb25zUnVudGltZS5mZXRjaE1ldGFEYXRhT25seSA/IFtdIDogdGhpcy5fcHJvY2Vzc05vdmVsPFQ+KG5vdmVsLCBvcHRpb25zUnVudGltZSwgX2NhY2hlXywgLi4uYXJndik7XG5cblx0XHRyZXR1cm4gUHJvbWlzZUJsdWViaXJkXG5cdFx0XHQucmVzb2x2ZShwcilcblx0XHRcdC50aGVuKGZ1bmN0aW9uIChyZXQ6IFQpXG5cdFx0XHR7XG5cdFx0XHRcdHJldHVybiB7XG5cdFx0XHRcdFx0bm92ZWwsXG5cdFx0XHRcdFx0b3B0aW9uc1J1bnRpbWUsXG5cdFx0XHRcdFx0X2NhY2hlXyxcblx0XHRcdFx0XHRyZXQsXG5cdFx0XHRcdH07XG5cdFx0XHR9KVxuXHRcdDtcblx0fVxuXG5cdHByb3RlY3RlZCBfc3RyaXBDb250ZW50KHRleHQ6IHN0cmluZylcblx0e1xuXHRcdHJldHVybiB0ZXh0O1xuXHR9XG5cblx0cHJvdGVjdGVkIF9wYXJzZUNoYXB0ZXI8VD4ocmV0OiBJRmV0Y2hDaGFwdGVyLCBvcHRpb25zUnVudGltZTogVCAmIElPcHRpb25zUnVudGltZSwgY2FjaGU6IHtcblx0XHRmaWxlOiBzdHJpbmcsXG5cdFx0bm92ZWw6IF9Ob3ZlbFNpdGUuSU5vdmVsLFxuXHRcdHZvbHVtZTogX05vdmVsU2l0ZS5JVm9sdW1lLFxuXHRcdGNoYXB0ZXI6IF9Ob3ZlbFNpdGUuSUNoYXB0ZXIsXG5cdH0pOiBzdHJpbmcgfCBQcm9taXNlPHN0cmluZz5cblx0e1xuXHRcdGlmICghcmV0KVxuXHRcdHtcblx0XHRcdHJldHVybiAnJztcblx0XHR9XG5cblx0XHR0aHJvdyBuZXcgU3ludGF4RXJyb3IoYEZ1bmN0aW9uIG5vdCBpbXBsZW1lbnRlZGApO1xuXHR9XG5cblx0cHJvdGVjdGVkIF9mZXRjaENoYXB0ZXI8VD4odXJsOiBVUkwsIG9wdGlvbnNSdW50aW1lOiBUICYgSU9wdGlvbnNSdW50aW1lKVxuXHR7XG5cdFx0cmV0dXJuIFByb21pc2VCbHVlYmlyZC5yZXNvbHZlKCkudGhlbihhc3luYyBmdW5jdGlvbiAoKVxuXHRcdHtcblx0XHRcdGxldCByZXQgPSB7fSBhcyBJRmV0Y2hDaGFwdGVyO1xuXG5cdFx0XHRsZXQgb3B0cyA9IGdldE9wdGlvbnMob3B0aW9uc1J1bnRpbWUpO1xuXG5cdFx0XHRpZiAob3B0aW9uc1J1bnRpbWUuZGlzYWJsZURvd25sb2FkKVxuXHRcdFx0e1xuXHRcdFx0XHRyZXR1cm4gbnVsbDtcblx0XHRcdH1cblx0XHRcdGVsc2UgaWYgKHRydWUpXG5cdFx0XHR7XG5cdFx0XHRcdGlmIChvcHRpb25zUnVudGltZS5yZXRyeURlbGF5ID4gMClcblx0XHRcdFx0e1xuXHRcdFx0XHRcdC8vIEB0cy1pZ25vcmVcblx0XHRcdFx0XHRvcHRzLnJlcXVlc3RPcHRpb25zLmRlbGF5ID0gb3B0aW9uc1J1bnRpbWUucmV0cnlEZWxheTtcblx0XHRcdFx0fVxuXHRcdFx0XHRlbHNlXG5cdFx0XHRcdHtcblx0XHRcdFx0XHQvLyBAdHMtaWdub3JlXG5cdFx0XHRcdFx0b3B0cy5yZXF1ZXN0T3B0aW9ucy5yZXRyeSA9IDE7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRhd2FpdCByZXRyeVJlcXVlc3QodXJsLCBvcHRzLnJlcXVlc3RPcHRpb25zKVxuXHRcdFx0XHRcdC50aGVuKGZ1bmN0aW9uIChyZXMpXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0Y29uc3QgY29udGVudFR5cGVQYXJzZWQgPSBwYXJzZUNvbnRlbnRUeXBlKHJlcy5oZWFkZXJzW1wiY29udGVudC10eXBlXCJdKTtcblxuXHRcdFx0XHRcdFx0cmV0LmNvbnRlbnRUeXBlUGFyc2VkID0gY29udGVudFR5cGVQYXJzZWQ7XG5cblx0XHRcdFx0XHRcdC8vIEB0cy1pZ25vcmVcblx0XHRcdFx0XHRcdHJldC51cmwgPSB1cmw7XG5cblx0XHRcdFx0XHRcdGlmIChjb250ZW50VHlwZVBhcnNlZC5pc0hUTUwoKSB8fCBjb250ZW50VHlwZVBhcnNlZC5pc1hNTCgpKVxuXHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRyZXQuZG9tID0gcmVxdWVzdFRvSlNET00ocmVzLCB1cmwsIG9wdGlvbnNSdW50aW1lLm9wdGlvbnNKU0RPTSk7XG5cdFx0XHRcdFx0XHRcdHJldC5kb20gPSBwYWNrSlNET00ocmV0LmRvbSk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRlbHNlIGlmIChjb250ZW50VHlwZVBhcnNlZC5zdWJ0eXBlID09ICdqc29uJylcblx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0cmV0Lmpzb24gPSBKU09OLnBhcnNlKHJlcy5ib2R5LnRvU3RyaW5nKCkpO1xuXHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHRyZXQucmVzID0gcmVzO1xuXHRcdFx0XHRcdFx0cmV0LmJvZHkgPSByZXMuYm9keTtcblx0XHRcdFx0XHR9KVxuXHRcdFx0XHQ7XG5cdFx0XHR9XG5cdFx0XHRlbHNlXG5cdFx0XHR7XG5cdFx0XHRcdC8vIEB0cy1pZ25vcmVcblx0XHRcdFx0cmV0LmRvbSA9IGF3YWl0IGZyb21VUkwodXJsLCBvcHRpb25zUnVudGltZS5vcHRpb25zSlNET00pO1xuXG5cdFx0XHRcdHJldC5yZXMgPSByZXQuZG9tLl9vcHRpb25zLlJlc3BvbnNlO1xuXHRcdFx0XHRyZXQuYm9keSA9IHJldC5kb20uX29wdGlvbnMuYm9keTtcblx0XHRcdH1cblxuXHRcdFx0cmV0dXJuIHJldDtcblx0XHR9KTtcblx0fVxuXG5cdHByb3RlY3RlZCBfZXhwb3J0RG93bmxvYWRPcHRpb25zKG9wdGlvbnNSdW50aW1lPzogSU9wdGlvbnNSdW50aW1lKTogYW55XG5cdHtcblx0XHRsZXQgb3B0cyA9IHt9O1xuXG5cdFx0aWYgKG9wdGlvbnNSdW50aW1lKVxuXHRcdHtcblx0XHRcdGxldCBib29sOiBib29sZWFuO1xuXG5cdFx0XHRmb3IgKGxldCBrIG9mIFtcblx0XHRcdFx0J25vRmlyZVByZWZpeCcsXG5cdFx0XHRcdCdub0ZpbGVQYWRlbmQnLFxuXHRcdFx0XHQnZmlsZVByZWZpeE1vZGUnLFxuXHRcdFx0XHQnc3RhcnRJbmRleCcsXG5cdFx0XHRdKVxuXHRcdFx0e1xuXHRcdFx0XHRpZiAoKGsgaW4gb3B0aW9uc1J1bnRpbWUpICYmIHR5cGVvZiBvcHRpb25zUnVudGltZVtrXSAhPT0gJ3VuZGVmaW5lZCcpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRib29sID0gdHJ1ZTtcblx0XHRcdFx0XHRvcHRzW2tdID0gb3B0aW9uc1J1bnRpbWVba107XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cblx0XHRyZXR1cm4gb3B0cztcblx0fVxuXG5cdHByb3RlY3RlZCBfc2F2ZVJlYWRtZShvcHRpb25zUnVudGltZTogSU9wdGlvbnNSdW50aW1lLCBvcHRpb25zID0ge30sIC4uLm9wdHMpXG5cdHtcblx0XHRpZiAodGhpcy5JREtFWSlcblx0XHR7XG5cdFx0XHRvcHRpb25zW3RoaXMuSURLRVldID0gb3B0aW9uc1t0aGlzLklES0VZXSB8fCB7fTtcblxuXHRcdFx0dHJ5XG5cdFx0XHR7XG5cdFx0XHRcdG9wdGlvbnNbdGhpcy5JREtFWV0ubm92ZWxfaWQgPSBvcHRpb25zW3RoaXMuSURLRVldLm5vdmVsX2lkIHx8IG9wdGlvbnNSdW50aW1lW1NZTUJPTF9DQUNIRV0ubm92ZWwudXJsX2RhdGEubm92ZWxfaWQ7XG5cdFx0XHR9XG5cdFx0XHRjYXRjaCAoZSlcblx0XHRcdHtcblx0XHRcdH1cblx0XHR9XG5cblx0XHRsZXQgZG93bmxvYWRPcHRpb25zID0gdGhpcy5fZXhwb3J0RG93bmxvYWRPcHRpb25zKG9wdGlvbnNSdW50aW1lKTtcblxuXHRcdHJldHVybiBzdXBlci5fc2F2ZVJlYWRtZShvcHRpb25zUnVudGltZSwgb3B0aW9ucywge1xuXHRcdFx0b3B0aW9uczoge1xuXHRcdFx0XHR0ZXh0bGF5b3V0OiB7XG5cdFx0XHRcdFx0YWxsb3dfbGYyOiB0cnVlLFxuXHRcdFx0XHR9LFxuXHRcdFx0XHRkb3dubG9hZE9wdGlvbnM6IGRvd25sb2FkT3B0aW9ucyB8fCB7fSxcblx0XHRcdH0sXG5cdFx0fSwgLi4ub3B0cyk7XG5cdH1cblxuXHRwcm90ZWN0ZWQgX2dldF9tZXRhKGlucHV0VXJsLCBvcHRpb25zUnVudGltZSwgY2FjaGU/OiB7XG5cdFx0ZG9tPzogSUpTRE9NLFxuXHR9KVxuXHR7XG5cdFx0dGhyb3cgbmV3IFN5bnRheEVycm9yKCk7XG5cdH1cblxufVxuXG5leHBvcnQgY29uc3QgTm92ZWxTaXRlID0gTm92ZWxTaXRlRGVtbyBhcyB0eXBlb2YgTm92ZWxTaXRlRGVtbztcblxuZXhwb3J0IGRlZmF1bHQgTm92ZWxTaXRlRGVtbztcbiJdfQ==