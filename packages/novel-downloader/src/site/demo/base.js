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
            let path_novel = self.getPathNovel(PATH_NOVEL_MAIN, novel);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFzZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImJhc2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFBQSx1Q0FBMkM7QUFDM0MsdUNBQThCO0FBQzlCLDZCQUE2QjtBQUU3Qiw2Q0FBMEY7QUFFMUYsOEJBQW9DO0FBRXBDLHVDQUF5QztBQUN6Qyx5REFBNkQ7QUFFN0Qsb0NBQTJGO0FBQzNGLG9DQUEyQztBQUUzQyx3REFBd0Q7QUFDeEQsMkNBQW1DO0FBYW5DLHdDQUF5QztBQWlCekMsSUFBYSxhQUFhLEdBQTFCLE1BQWEsYUFBYyxTQUFRLGVBQVU7SUFJNUMsWUFBWSxPQUF5QixFQUFFLEdBQUcsSUFBSTtRQUU3QyxLQUFLLENBQUMsT0FBTyxFQUFFLEdBQUcsSUFBSSxDQUFDLENBQUM7SUFDekIsQ0FBQztJQUVEOzs7Ozs7O09BT0c7SUFDSCxnQkFBZ0IsQ0FBbUIsSUFBTyxFQUFFLGlCQUFrQyxFQUFFO1FBRS9FLE9BQU8sSUFBSSxDQUFDO0lBQ2IsQ0FBQztJQUVELE9BQU8sQ0FBc0IsY0FBNkMsRUFBRSxHQUFRLEVBQUUsTUFBZTtRQUVwRyxLQUFLLENBQUMsT0FBTyxDQUFDLGNBQWMsRUFBRSxHQUFHLENBQUMsQ0FBQztRQUVuQyxJQUFJLGNBQWMsQ0FBQyxXQUFXLElBQUksTUFBTSxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsV0FBVyxDQUFDLENBQUMsTUFBTSxFQUNoRjtZQUNDLE1BQU0sQ0FBQyxPQUFPLENBQUMsY0FBYyxDQUFDLFdBQVcsQ0FBQztpQkFDeEMsT0FBTyxDQUFDLFVBQVUsSUFBSTtnQkFFdEIsSUFBSSxDQUF3QixDQUFDO2dCQUM3QixJQUFJLEtBQUssR0FBRyxPQUFPLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFFM0IsSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksS0FBSyxJQUFJLFFBQVEsRUFDaEM7b0JBQ0MsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FB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LEVBQThDOztHQUNsRCxhQUFhLENBMGR6QjtBQTFkWSxzQ0FBYTtBQTRkYixRQUFBLFNBQVMsR0FBRyxhQUFxQyxDQUFDO0FBRS9ELGtCQUFlLGFBQWEsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IHJldHJ5UmVxdWVzdCB9IGZyb20gJy4uLy4uL2ZldGNoJztcbmltcG9ydCBmcywge30gZnJvbSAnZnMtaWNvbnYnO1xuaW1wb3J0ICogYXMgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCBub3ZlbEluZm8sIHsgSU1kY29uZk1ldGEgfSBmcm9tICdub2RlLW5vdmVsLWluZm8nO1xuaW1wb3J0IHsgZnJvbVVSTCwgSUZyb21VcmxPcHRpb25zLCBJSlNET00sIHJlcXVlc3RUb0pTRE9NLCBwYWNrSlNET00gfSBmcm9tICdqc2RvbS1leHRyYSc7XG5pbXBvcnQgeyBVUkwgfSBmcm9tICdqc2RvbS11cmwnO1xuaW1wb3J0IHsgZ2V0RmlsZVBhdGggfSBmcm9tICcuLi9mcyc7XG5cbmltcG9ydCB7IGdldE9wdGlvbnMgfSBmcm9tICcuLi8uLi9qc2RvbSc7XG5pbXBvcnQgeyBub3JtYWxpemVfdmFsIH0gZnJvbSAnbm9kZS1ub3ZlbC1nbG9iYnkvbGliL2hlbHBlcic7XG5cbmltcG9ydCBfTm92ZWxTaXRlLCB7IHN0YXRpY0ltcGxlbWVudHMsIGRlZmF1bHRKU0RPTU9wdGlvbnMsIFNZTUJPTF9DQUNIRSB9IGZyb20gJy4uL2luZGV4JztcbmltcG9ydCB7IFByb21pc2VCbHVlYmlyZCB9IGZyb20gJy4uL2luZGV4JztcblxuaW1wb3J0ICogYXMgcGFyc2VDb250ZW50VHlwZSBmcm9tICdjb250ZW50LXR5cGUtcGFyc2VyJztcbmltcG9ydCBub3ZlbFRleHQgZnJvbSAnbm92ZWwtdGV4dCc7XG5cbmltcG9ydCB7IExhenlDb29raWUsIExhenlDb29raWVKYXIgfSBmcm9tICdqc2RvbS1leHRyYSc7XG5cbmV4cG9ydCB0eXBlIElPcHRpb25zUGx1cyA9IHt9XG5cbmV4cG9ydCB0eXBlIElEb3dubG9hZE9wdGlvbnMgPSBfTm92ZWxTaXRlLklEb3dubG9hZE9wdGlvbnMgJiBfTm92ZWxTaXRlLklPcHRpb25zICYgSU9wdGlvbnNQbHVzXG5leHBvcnQgdHlwZSBJT3B0aW9uc1J1bnRpbWUgPSBfTm92ZWxTaXRlLklPcHRpb25zUnVudGltZSAmIElPcHRpb25zUGx1c1xuXG5leHBvcnQgaW1wb3J0IElOb3ZlbCA9IF9Ob3ZlbFNpdGUuSU5vdmVsO1xuXG5pbXBvcnQgeyBSZXNwb25zZVJlcXVlc3QgfSBmcm9tICdyZXF1ZXN0JztcblxuaW1wb3J0IHsgY29uc29sZSB9IGZyb20gJy4uLy4uL3V0aWwvbG9nJztcblxuZXhwb3J0IHR5cGUgSUZldGNoQ2hhcHRlciA9IHtcblx0Ym9keT86IGFueTtcblx0ZG9tPzogSUpTRE9NO1xuXHRyZXM/OiBSZXNwb25zZVJlcXVlc3Q7XG5cdGpzb24/LFxuXG5cdHVybD86IFVSTCxcblx0Y29udGVudFR5cGVQYXJzZWQ/OiBSZXR1cm5UeXBlPHBhcnNlQ29udGVudFR5cGU+LFxufTtcblxuZXhwb3J0IHR5cGUgSVNlc3Npb25EYXRhID0ge1xuXHRba2V5OiBzdHJpbmddOiBhbnksXG59XG5cbkBzdGF0aWNJbXBsZW1lbnRzPF9Ob3ZlbFNpdGUuSU5vdmVsU2l0ZVN0YXRpYzxOb3ZlbFNpdGVEZW1vPj4oKVxuZXhwb3J0IGNsYXNzIE5vdmVsU2l0ZURlbW8gZXh0ZW5kcyBfTm92ZWxTaXRlXG57XG5cdHB1YmxpYyBzdGF0aWMgcmVhZG9ubHkgSURLRVk6IHN0cmluZyA9IG51bGw7XG5cblx0Y29uc3RydWN0b3Iob3B0aW9uczogSURvd25sb2FkT3B0aW9ucywgLi4uYXJndilcblx0e1xuXHRcdHN1cGVyKG9wdGlvbnMsIC4uLmFyZ3YpO1xuXHR9XG5cblx0LyoqXG5cdCAqIEB0b2RvIOiuk+atpOaWueazleacieaEj+e+qVxuXHQgKlxuXHQgKiDnlKjkvoboqqrmmI7nm67liY3nq5npu57nmoTmiYDpnIAgc2Vzc2lvbiBjb29raWVzXG5cdCAqXG5cdCAqIEBwYXJhbSB7VH0gZGF0YVxuXHQgKiBAcmV0dXJucyB7VH1cblx0ICovXG5cdGNoZWNrU2Vzc2lvbkRhdGE8VCA9IElTZXNzaW9uRGF0YT4oZGF0YTogVCwgb3B0aW9uc1J1bnRpbWU6IElPcHRpb25zUnVudGltZSA9IHt9KVxuXHR7XG5cdFx0cmV0dXJuIGRhdGE7XG5cdH1cblxuXHRzZXNzaW9uPFQgPSBJT3B0aW9uc1J1bnRpbWU+KG9wdGlvbnNSdW50aW1lOiBQYXJ0aWFsPFQgJiBJRG93bmxvYWRPcHRpb25zPiwgdXJsOiBVUkwsIGRvbWFpbj86IHN0cmluZylcblx0e1xuXHRcdHN1cGVyLnNlc3Npb24ob3B0aW9uc1J1bnRpbWUsIHVybCk7XG5cblx0XHRpZiAob3B0aW9uc1J1bnRpbWUuc2Vzc2lvbkRhdGEgJiYgT2JqZWN0LmtleXMob3B0aW9uc1J1bnRpbWUuc2Vzc2lvbkRhdGEpLmxlbmd0aClcblx0XHR7XG5cdFx0XHRPYmplY3QuZW50cmllcyhvcHRpb25zUnVudGltZS5zZXNzaW9uRGF0YSlcblx0XHRcdFx0LmZvckVhY2goZnVuY3Rpb24gKGRhdGEpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRsZXQgYzogTGF6eUNvb2tpZS5Qcm9wZXJ0aWVzO1xuXHRcdFx0XHRcdGxldCB0eXBlYyA9IHR5cGVvZiBkYXRhWzFdO1xuXG5cdFx0XHRcdFx0aWYgKGRhdGFbMV0gJiYgdHlwZWMgPT0gJ29iamVjdCcpXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0YyA9IGRhdGFbMV07XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGVsc2UgaWYgKHR5cGVjID09PSBudWxsIHx8IHR5cGVjICE9ICdvYmplY3QnKVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdGxldCBba2V5LCB2YWx1ZV0gPSBkYXRhO1xuXG5cdFx0XHRcdFx0XHRjID0ge1xuXHRcdFx0XHRcdFx0XHRrZXksXG5cdFx0XHRcdFx0XHRcdHZhbHVlLFxuXHRcdFx0XHRcdFx0fTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0ZWxzZVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdGMgPSBkYXRhWzFdO1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdGlmIChjKVxuXHRcdFx0XHRcdHtcblxuXHRcdFx0XHRcdFx0aWYgKHR5cGVvZiBjID09ICdvYmplY3QnKVxuXHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRpZiAoIWMucGF0aClcblx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdGMucGF0aCA9ICcvJztcblx0XHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHRcdGlmIChjLmhvc3RPbmx5ID09IG51bGwpXG5cdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHRjLmhvc3RPbmx5ID0gZmFsc2U7XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0b3B0aW9uc1J1bnRpbWUub3B0aW9uc0pTRE9NLmNvb2tpZUphclxuXHRcdFx0XHRcdFx0XHQuc2V0Q29va2llU3luYyhjLCB1cmwuaHJlZilcblx0XHRcdFx0XHRcdDtcblxuXHRcdFx0XHRcdFx0aWYgKHR5cGVvZiBjID09ICdvYmplY3QnICYmICFjLmRvbWFpbilcblx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0aWYgKGRvbWFpbilcblx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdGMuZG9tYWluID0gZG9tYWluO1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdGVsc2UgaWYgKHVybCAmJiB1cmwuaG9zdClcblx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdGMuZG9tYWluID0gdXJsLmhvc3Q7XG5cdFx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0XHR0cnlcblx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdG9wdGlvbnNSdW50aW1lLm9wdGlvbnNKU0RPTS5jb29raWVKYXJcblx0XHRcdFx0XHRcdFx0XHRcdC5zZXRDb29raWVTeW5jKGMsIHVybC5ocmVmKVxuXHRcdFx0XHRcdFx0XHRcdDtcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRjYXRjaCAoZSlcblx0XHRcdFx0XHRcdFx0e1xuXG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0pXG5cdFx0XHQ7XG5cblx0XHRcdGNvbnNvbGUuZGlyKG9wdGlvbnNSdW50aW1lLm9wdGlvbnNKU0RPTS5jb29raWVKYXIpO1xuXHRcdH1cblxuXHRcdHJldHVybiB0aGlzO1xuXHR9XG5cblx0ZG93bmxvYWQoaW5wdXRVcmw6IHN0cmluZyB8IFVSTCwgZG93bmxvYWRPcHRpb25zOiBJRG93bmxvYWRPcHRpb25zID0ge30pXG5cdHtcblx0XHRjb25zdCBzZWxmID0gdGhpcztcblx0XHRsZXQgdXJsID0gaW5wdXRVcmwgYXMgVVJMO1xuXG5cdFx0Y29uc3QgW1BBVEhfTk9WRUxfTUFJTiwgb3B0aW9uc1J1bnRpbWVdID0gdGhpcy5nZXRPdXRwdXREaXI8SU9wdGlvbnNSdW50aW1lICYgSURvd25sb2FkT3B0aW9ucz4oZG93bmxvYWRPcHRpb25zKTtcblxuXHRcdHJldHVybiBQcm9taXNlQmx1ZWJpcmRcblx0XHRcdC5iaW5kKHNlbGYpXG5cdFx0XHQudGhlbihhc3luYyBmdW5jdGlvbiAoKVxuXHRcdFx0e1xuXHRcdFx0XHR1cmwgPSBhd2FpdCB0aGlzLmNyZWF0ZU1haW5VcmwodXJsKTtcblxuXHRcdFx0XHRzZWxmLnNlc3Npb24ob3B0aW9uc1J1bnRpbWUsIHVybCk7XG5cblx0XHRcdFx0bGV0IG5vdmVsID0gYXdhaXQgc2VsZi5nZXRfdm9sdW1lX2xpc3Q8SU9wdGlvbnNSdW50aW1lICYgSURvd25sb2FkT3B0aW9ucz4odXJsLCBvcHRpb25zUnVudGltZSk7XG5cblx0XHRcdFx0bGV0IHBhdGhfbm92ZWwgPSBzZWxmLmdldFBhdGhOb3ZlbChQQVRIX05PVkVMX01BSU4sIG5vdmVsKTtcblxuXHRcdFx0XHRzZWxmLl9sb2FkRXhpc3RzQ29uZih1cmwsIG9wdGlvbnNSdW50aW1lLCBub3ZlbCwgcGF0aF9ub3ZlbCk7XG5cblx0XHRcdFx0bGV0IGlkeCA9IG9wdGlvbnNSdW50aW1lLnN0YXJ0SW5kZXggfHwgMDtcblxuXHRcdFx0XHRvcHRpb25zUnVudGltZVtTWU1CT0xfQ0FDSEVdLm5vdmVsID0gbm92ZWw7XG5cdFx0XHRcdG9wdGlvbnNSdW50aW1lW1NZTUJPTF9DQUNIRV0ucGF0aF9ub3ZlbCA9IHBhdGhfbm92ZWw7XG5cblx0XHRcdFx0YXdhaXQgUHJvbWlzZUJsdWViaXJkXG5cdFx0XHRcdFx0LnJlc29sdmUoc2VsZi5wcm9jZXNzTm92ZWwobm92ZWwsIG9wdGlvbnNSdW50aW1lLCB7XG5cdFx0XHRcdFx0XHR1cmwsXG5cdFx0XHRcdFx0XHRwYXRoX25vdmVsLFxuXHRcdFx0XHRcdH0pKVxuXHRcdFx0XHRcdC50YXAobHMgPT5cblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRsZXQgZmlsZSA9IHBhdGguam9pbihwYXRoX25vdmVsLFxuXHRcdFx0XHRcdFx0XHRgJHtzZWxmLnRyaW1GaWxlbmFtZU5vdmVsKG5vdmVsLm5vdmVsX3RpdGxlKX0uJHtub3ZlbC51cmxfZGF0YS5ub3ZlbF9pZH0uanNvbmBcblx0XHRcdFx0XHRcdFx0KVxuXHRcdFx0XHRcdFx0O1xuXG5cdFx0XHRcdFx0XHRyZXR1cm4gZnMub3V0cHV0SlNPTihmaWxlLCBub3ZlbCwge1xuXHRcdFx0XHRcdFx0XHRzcGFjZXM6IFwiXFx0XCIsXG5cdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHR9KVxuXHRcdFx0XHQ7XG5cblx0XHRcdFx0YXdhaXQgc2VsZi5fc2F2ZVJlYWRtZShvcHRpb25zUnVudGltZSk7XG5cblx0XHRcdFx0cmV0dXJuIG5vdmVsO1xuXHRcdFx0fSlcblx0XHRcdDtcblx0fVxuXG5cdHByb3RlY3RlZCBhc3luYyBfcHJvY2Vzc05vdmVsPFQgPSBhbnk+KG5vdmVsOiBJTm92ZWwsIG9wdGlvbnNSdW50aW1lOiBJT3B0aW9uc1J1bnRpbWUsIF9jYWNoZV86IHtcblx0XHR1cmw6IFVSTCxcblx0XHRwYXRoX25vdmVsOiBzdHJpbmcsXG5cdH0sIC4uLmFyZ3YpXG5cdHtcblx0XHRjb25zdCBzZWxmID0gdGhpcztcblx0XHRsZXQgaWR4ID0gb3B0aW9uc1J1bnRpbWUuc3RhcnRJbmRleCB8fCAwO1xuXG5cdFx0bGV0IHsgdXJsLCBwYXRoX25vdmVsIH0gPSBfY2FjaGVfO1xuXG5cdFx0cmV0dXJuIFByb21pc2VCbHVlYmlyZFxuXHRcdFx0Lm1hcFNlcmllcyhub3ZlbC52b2x1bWVfbGlzdCwgZnVuY3Rpb24gKHZvbHVtZSwgdmlkKVxuXHRcdFx0e1xuXHRcdFx0XHRsZXQgZGlybmFtZTogc3RyaW5nO1xuXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRsZXQgX3ZpZCA9ICcnO1xuXG5cdFx0XHRcdFx0aWYgKCFvcHRpb25zUnVudGltZS5ub0RpclByZWZpeClcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRfdmlkID0gdmlkLnRvU3RyaW5nKCkucGFkU3RhcnQoNCwgJzAnKSArICcwJztcblx0XHRcdFx0XHRcdF92aWQgKz0gJ18nO1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdGRpcm5hbWUgPSBwYXRoLmpvaW4ocGF0aF9ub3ZlbCxcblx0XHRcdFx0XHRcdGAke192aWR9JHtzZWxmLnRyaW1GaWxlbmFtZVZvbHVtZSh2b2x1bWUudm9sdW1lX3RpdGxlKX1gXG5cdFx0XHRcdFx0KTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGlmICghb3B0aW9uc1J1bnRpbWUubm9GaXJlUHJlZml4ICYmIG9wdGlvbnNSdW50aW1lLmZpbGVQcmVmaXhNb2RlID49IDIpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRsZXQgaTogbnVtYmVyO1xuXG5cdFx0XHRcdFx0bGV0IGJvb2wgPSB2b2x1bWUuY2hhcHRlcl9saXN0LmV2ZXJ5KGZ1bmN0aW9uIChjaGFwdGVyLCBqKVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdGxldCBtID0gKG9wdGlvbnNSdW50aW1lLmZpbGVQcmVmaXhNb2RlID4gMyA/XG5cdFx0XHRcdFx0XHRcdGNoYXB0ZXIuY2hhcHRlcl90aXRsZSA6IG5vcm1hbGl6ZV92YWwoY2hhcHRlci5jaGFwdGVyX3RpdGxlKVxuXHRcdFx0XHRcdFx0XHQpXG5cdFx0XHRcdFx0XHRcdC5yZXBsYWNlKC9eXFxEKy8sICcnKVxuXHRcdFx0XHRcdFx0XHQvLy5yZXBsYWNlKC9eKFxcZCspLiskLywgJyQxJylcblx0XHRcdFx0XHRcdFx0LnJlcGxhY2UoL14oXFxkKylcXEQuKiQvLCAnJDEnKVxuXHRcdFx0XHRcdFx0O1xuXG5cdFx0XHRcdFx0XHQvL2NvbnNvbGUubG9nKG0sIGNoYXB0ZXIuY2hhcHRlcl90aXRsZSk7XG5cblx0XHRcdFx0XHRcdGlmICgvXlxcZCskLy50ZXN0KG0pKVxuXHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRsZXQgbTIgPSBwYXJzZUludChtKTtcblxuXHRcdFx0XHRcdFx0XHRpZiAoaiA9PSAwKVxuXHRcdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdFx0aSA9IG0yO1xuXG5cdFx0XHRcdFx0XHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0ZWxzZSBpZiAobTIgPT09ICsraSlcblx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdHJldHVybiB0cnVlO1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdFx0XHR9KTtcblxuXHRcdFx0XHRcdC8vY29uc29sZS5sb2coYm9vbCk7XG5cblx0XHRcdFx0XHRpZiAoYm9vbClcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHR2b2x1bWUuY2hhcHRlcl9saXN0LmZvckVhY2goZnVuY3Rpb24gKGNoYXB0ZXIpXG5cdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdGNoYXB0ZXIuY2hhcHRlcl9pbmRleCA9ICcnO1xuXHRcdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cblx0XHRcdFx0aWYgKG9wdGlvbnNSdW50aW1lLmV2ZW50KVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0c2VsZi5lbWl0KG9wdGlvbnNSdW50aW1lLmV2ZW50LCAndm9sdW1lJywgdm9sdW1lLCB7XG5cdFx0XHRcdFx0XHRvcHRpb25zUnVudGltZSxcblx0XHRcdFx0XHRcdGRpcm5hbWUsXG5cdFx0XHRcdFx0XHR2aWQsXG5cdFx0XHRcdFx0XHRub3ZlbCxcblx0XHRcdFx0XHRcdHVybCxcblx0XHRcdFx0XHR9KTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdHJldHVybiBQcm9taXNlQmx1ZWJpcmRcblx0XHRcdFx0XHQubWFwU2VyaWVzKHZvbHVtZS5jaGFwdGVyX2xpc3QsIGFzeW5jIGZ1bmN0aW9uIChjaGFwdGVyLCBjaWQpXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0Ly9jaGFwdGVyLmNoYXB0ZXJfaW5kZXggPSAoaWR4KyspO1xuXG5cdFx0XHRcdFx0XHRjb25zdCBjdXJyZW50X2lkeCA9IGlkeCsrO1xuXG5cdFx0XHRcdFx0XHRsZXQgZmlsZSA9IGdldEZpbGVQYXRoKHNlbGYsIHtcblx0XHRcdFx0XHRcdFx0Y2hhcHRlciwgY2lkLFxuXHRcdFx0XHRcdFx0XHRleHQ6ICcudHh0JyxcblxuXHRcdFx0XHRcdFx0XHRpZHg6IGN1cnJlbnRfaWR4LFxuXG5cdFx0XHRcdFx0XHRcdGRpcm5hbWUsXG5cdFx0XHRcdFx0XHRcdHZvbHVtZSwgdmlkLFxuXHRcdFx0XHRcdFx0fSwgb3B0aW9uc1J1bnRpbWUpO1xuXG5cdFx0XHRcdFx0XHRpZiAoc2VsZi5fY2hlY2tFeGlzdHMob3B0aW9uc1J1bnRpbWUsIGZpbGUpKVxuXHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRyZXR1cm4gZmlsZTtcblx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0bGV0IHVybCA9IHNlbGYuX2NyZWF0ZUNoYXB0ZXJVcmwoe1xuXHRcdFx0XHRcdFx0XHRub3ZlbCxcblx0XHRcdFx0XHRcdFx0dm9sdW1lLFxuXHRcdFx0XHRcdFx0XHRjaGFwdGVyLFxuXHRcdFx0XHRcdFx0fSwgb3B0aW9uc1J1bnRpbWUpO1xuXG5cdFx0XHRcdFx0XHRhd2FpdCBzZWxmLl9mZXRjaENoYXB0ZXIodXJsLCBvcHRpb25zUnVudGltZSlcblx0XHRcdFx0XHRcdFx0LnRoZW4oZnVuY3Rpb24gKHJldClcblx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdHJldHVybiBzZWxmLl9wYXJzZUNoYXB0ZXIocmV0LCBvcHRpb25zUnVudGltZSwge1xuXHRcdFx0XHRcdFx0XHRcdFx0ZmlsZSxcblx0XHRcdFx0XHRcdFx0XHRcdG5vdmVsLFxuXHRcdFx0XHRcdFx0XHRcdFx0dm9sdW1lLFxuXHRcdFx0XHRcdFx0XHRcdFx0Y2hhcHRlcixcblx0XHRcdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHRcdFx0fSlcblx0XHRcdFx0XHRcdFx0LnRoZW4oZnVuY3Rpb24gKHRleHQpXG5cdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHRpZiAodHlwZW9mIHRleHQgPT0gJ3N0cmluZycpXG5cdFx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdFx0cmV0dXJuIG5vdmVsVGV4dC50b1N0cih0ZXh0KTtcblx0XHRcdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdFx0XHRyZXR1cm4gdGV4dDtcblx0XHRcdFx0XHRcdFx0fSlcblx0XHRcdFx0XHRcdFx0LnRoZW4oYXN5bmMgZnVuY3Rpb24gKHRleHQ6IHN0cmluZylcblx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdGF3YWl0IGZzLm91dHB1dEZpbGUoZmlsZSwgdGV4dCk7XG5cblx0XHRcdFx0XHRcdFx0XHRyZXR1cm4gdGV4dDtcblx0XHRcdFx0XHRcdFx0fSlcblx0XHRcdFx0XHRcdDtcblxuXHRcdFx0XHRcdFx0cmV0dXJuIGZpbGU7XG5cdFx0XHRcdFx0fSlcblx0XHRcdFx0XHQ7XG5cdFx0XHR9KVxuXHRcdFx0LnRoZW4oZnVuY3Rpb24gKHJldClcblx0XHRcdHtcblx0XHRcdFx0cmV0dXJuIHJldCBhcyBhbnkgYXMgVDtcblx0XHRcdH0pXG5cdFx0O1xuXHR9XG5cblx0cHJvY2Vzc05vdmVsPFQ+KG5vdmVsOiBJTm92ZWwsIG9wdGlvbnNSdW50aW1lOiBJT3B0aW9uc1J1bnRpbWUsIF9jYWNoZV86IHtcblx0XHR1cmw6IFVSTCxcblx0XHRwYXRoX25vdmVsOiBzdHJpbmcsXG5cdH0sIC4uLmFyZ3YpXG5cdHtcblx0XHQvLyBAdHMtaWdub3JlXG5cdFx0bGV0IHByOiBhbnk7XG5cblx0XHRwciA9IG9wdGlvbnNSdW50aW1lLmZldGNoTWV0YURhdGFPbmx5ID8gW10gOiB0aGlzLl9wcm9jZXNzTm92ZWw8VD4obm92ZWwsIG9wdGlvbnNSdW50aW1lLCBfY2FjaGVfLCAuLi5hcmd2KTtcblxuXHRcdHJldHVybiBQcm9taXNlQmx1ZWJpcmRcblx0XHRcdC5yZXNvbHZlKHByKVxuXHRcdFx0LnRoZW4oZnVuY3Rpb24gKHJldDogVClcblx0XHRcdHtcblx0XHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0XHRub3ZlbCxcblx0XHRcdFx0XHRvcHRpb25zUnVudGltZSxcblx0XHRcdFx0XHRfY2FjaGVfLFxuXHRcdFx0XHRcdHJldCxcblx0XHRcdFx0fTtcblx0XHRcdH0pXG5cdFx0O1xuXHR9XG5cblx0cHJvdGVjdGVkIF9zdHJpcENvbnRlbnQodGV4dDogc3RyaW5nKVxuXHR7XG5cdFx0cmV0dXJuIHRleHQ7XG5cdH1cblxuXHRwcm90ZWN0ZWQgX3BhcnNlQ2hhcHRlcjxUPihyZXQ6IElGZXRjaENoYXB0ZXIsIG9wdGlvbnNSdW50aW1lOiBUICYgSU9wdGlvbnNSdW50aW1lLCBjYWNoZToge1xuXHRcdGZpbGU6IHN0cmluZyxcblx0XHRub3ZlbDogX05vdmVsU2l0ZS5JTm92ZWwsXG5cdFx0dm9sdW1lOiBfTm92ZWxTaXRlLklWb2x1bWUsXG5cdFx0Y2hhcHRlcjogX05vdmVsU2l0ZS5JQ2hhcHRlcixcblx0fSk6IHN0cmluZyB8IFByb21pc2U8c3RyaW5nPlxuXHR7XG5cdFx0aWYgKCFyZXQpXG5cdFx0e1xuXHRcdFx0cmV0dXJuICcnO1xuXHRcdH1cblxuXHRcdHRocm93IG5ldyBTeW50YXhFcnJvcihgRnVuY3Rpb24gbm90IGltcGxlbWVudGVkYCk7XG5cdH1cblxuXHRwcm90ZWN0ZWQgX2ZldGNoQ2hhcHRlcjxUPih1cmw6IFVSTCwgb3B0aW9uc1J1bnRpbWU6IFQgJiBJT3B0aW9uc1J1bnRpbWUpXG5cdHtcblx0XHRyZXR1cm4gUHJvbWlzZUJsdWViaXJkLnJlc29sdmUoKS50aGVuKGFzeW5jIGZ1bmN0aW9uICgpXG5cdFx0e1xuXHRcdFx0bGV0IHJldCA9IHt9IGFzIElGZXRjaENoYXB0ZXI7XG5cblx0XHRcdGxldCBvcHRzID0gZ2V0T3B0aW9ucyhvcHRpb25zUnVudGltZSk7XG5cblx0XHRcdGlmIChvcHRpb25zUnVudGltZS5kaXNhYmxlRG93bmxvYWQpXG5cdFx0XHR7XG5cdFx0XHRcdHJldHVybiBudWxsO1xuXHRcdFx0fVxuXHRcdFx0ZWxzZSBpZiAodHJ1ZSlcblx0XHRcdHtcblx0XHRcdFx0aWYgKG9wdGlvbnNSdW50aW1lLnJldHJ5RGVsYXkgPiAwKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdFx0XHRcdG9wdHMucmVxdWVzdE9wdGlvbnMuZGVsYXkgPSBvcHRpb25zUnVudGltZS5yZXRyeURlbGF5O1xuXHRcdFx0XHR9XG5cdFx0XHRcdGVsc2Vcblx0XHRcdFx0e1xuXHRcdFx0XHRcdC8vIEB0cy1pZ25vcmVcblx0XHRcdFx0XHRvcHRzLnJlcXVlc3RPcHRpb25zLnJldHJ5ID0gMTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGF3YWl0IHJldHJ5UmVxdWVzdCh1cmwsIG9wdHMucmVxdWVzdE9wdGlvbnMpXG5cdFx0XHRcdFx0LnRoZW4oZnVuY3Rpb24gKHJlcylcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRjb25zdCBjb250ZW50VHlwZVBhcnNlZCA9IHBhcnNlQ29udGVudFR5cGUocmVzLmhlYWRlcnNbXCJjb250ZW50LXR5cGVcIl0pO1xuXG5cdFx0XHRcdFx0XHRyZXQuY29udGVudFR5cGVQYXJzZWQgPSBjb250ZW50VHlwZVBhcnNlZDtcblxuXHRcdFx0XHRcdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdFx0XHRcdFx0cmV0LnVybCA9IHVybDtcblxuXHRcdFx0XHRcdFx0aWYgKGNvbnRlbnRUeXBlUGFyc2VkLmlzSFRNTCgpIHx8IGNvbnRlbnRUeXBlUGFyc2VkLmlzWE1MKCkpXG5cdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdHJldC5kb20gPSByZXF1ZXN0VG9KU0RPTShyZXMsIHVybCwgb3B0aW9uc1J1bnRpbWUub3B0aW9uc0pTRE9NKTtcblx0XHRcdFx0XHRcdFx0cmV0LmRvbSA9IHBhY2tKU0RPTShyZXQuZG9tKTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdGVsc2UgaWYgKGNvbnRlbnRUeXBlUGFyc2VkLnN1YnR5cGUgPT0gJ2pzb24nKVxuXHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRyZXQuanNvbiA9IEpTT04ucGFyc2UocmVzLmJvZHkudG9TdHJpbmcoKSk7XG5cdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdHJldC5yZXMgPSByZXM7XG5cdFx0XHRcdFx0XHRyZXQuYm9keSA9IHJlcy5ib2R5O1xuXHRcdFx0XHRcdH0pXG5cdFx0XHRcdDtcblx0XHRcdH1cblx0XHRcdGVsc2Vcblx0XHRcdHtcblx0XHRcdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdFx0XHRyZXQuZG9tID0gYXdhaXQgZnJvbVVSTCh1cmwsIG9wdGlvbnNSdW50aW1lLm9wdGlvbnNKU0RPTSk7XG5cblx0XHRcdFx0cmV0LnJlcyA9IHJldC5kb20uX29wdGlvbnMuUmVzcG9uc2U7XG5cdFx0XHRcdHJldC5ib2R5ID0gcmV0LmRvbS5fb3B0aW9ucy5ib2R5O1xuXHRcdFx0fVxuXG5cdFx0XHRyZXR1cm4gcmV0O1xuXHRcdH0pO1xuXHR9XG5cblx0cHJvdGVjdGVkIF9leHBvcnREb3dubG9hZE9wdGlvbnMob3B0aW9uc1J1bnRpbWU/OiBJT3B0aW9uc1J1bnRpbWUpOiBhbnlcblx0e1xuXHRcdGxldCBvcHRzID0ge307XG5cblx0XHRpZiAob3B0aW9uc1J1bnRpbWUpXG5cdFx0e1xuXHRcdFx0bGV0IGJvb2w6IGJvb2xlYW47XG5cblx0XHRcdGZvciAobGV0IGsgb2YgW1xuXHRcdFx0XHQnbm9GaXJlUHJlZml4Jyxcblx0XHRcdFx0J25vRmlsZVBhZGVuZCcsXG5cdFx0XHRcdCdmaWxlUHJlZml4TW9kZScsXG5cdFx0XHRcdCdzdGFydEluZGV4Jyxcblx0XHRcdF0pXG5cdFx0XHR7XG5cdFx0XHRcdGlmICgoayBpbiBvcHRpb25zUnVudGltZSkgJiYgdHlwZW9mIG9wdGlvbnNSdW50aW1lW2tdICE9PSAndW5kZWZpbmVkJylcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGJvb2wgPSB0cnVlO1xuXHRcdFx0XHRcdG9wdHNba10gPSBvcHRpb25zUnVudGltZVtrXTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHJldHVybiBvcHRzO1xuXHR9XG5cblx0cHJvdGVjdGVkIF9zYXZlUmVhZG1lKG9wdGlvbnNSdW50aW1lOiBJT3B0aW9uc1J1bnRpbWUsIG9wdGlvbnMgPSB7fSwgLi4ub3B0cylcblx0e1xuXHRcdGlmICh0aGlzLklES0VZKVxuXHRcdHtcblx0XHRcdG9wdGlvbnNbdGhpcy5JREtFWV0gPSBvcHRpb25zW3RoaXMuSURLRVldIHx8IHt9O1xuXG5cdFx0XHR0cnlcblx0XHRcdHtcblx0XHRcdFx0b3B0aW9uc1t0aGlzLklES0VZXS5ub3ZlbF9pZCA9IG9wdGlvbnNbdGhpcy5JREtFWV0ubm92ZWxfaWQgfHwgb3B0aW9uc1J1bnRpbWVbU1lNQk9MX0NBQ0hFXS5ub3ZlbC51cmxfZGF0YS5ub3ZlbF9pZDtcblx0XHRcdH1cblx0XHRcdGNhdGNoIChlKVxuXHRcdFx0e1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdGxldCBkb3dubG9hZE9wdGlvbnMgPSB0aGlzLl9leHBvcnREb3dubG9hZE9wdGlvbnMob3B0aW9uc1J1bnRpbWUpO1xuXG5cdFx0cmV0dXJuIHN1cGVyLl9zYXZlUmVhZG1lKG9wdGlvbnNSdW50aW1lLCBvcHRpb25zLCB7XG5cdFx0XHRvcHRpb25zOiB7XG5cdFx0XHRcdHRleHRsYXlvdXQ6IHtcblx0XHRcdFx0XHRhbGxvd19sZjI6IHRydWUsXG5cdFx0XHRcdH0sXG5cdFx0XHRcdGRvd25sb2FkT3B0aW9uczogZG93bmxvYWRPcHRpb25zIHx8IHt9LFxuXHRcdFx0fSxcblx0XHR9LCAuLi5vcHRzKTtcblx0fVxuXG5cdHByb3RlY3RlZCBfZ2V0X21ldGEoaW5wdXRVcmwsIG9wdGlvbnNSdW50aW1lLCBjYWNoZT86IHtcblx0XHRkb20/OiBJSlNET00sXG5cdH0pXG5cdHtcblx0XHR0aHJvdyBuZXcgU3ludGF4RXJyb3IoKTtcblx0fVxuXG59XG5cbmV4cG9ydCBjb25zdCBOb3ZlbFNpdGUgPSBOb3ZlbFNpdGVEZW1vIGFzIHR5cGVvZiBOb3ZlbFNpdGVEZW1vO1xuXG5leHBvcnQgZGVmYXVsdCBOb3ZlbFNpdGVEZW1vO1xuIl19