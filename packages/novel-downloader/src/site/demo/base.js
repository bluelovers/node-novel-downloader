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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFzZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImJhc2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFBQSx1Q0FBMkM7QUFDM0MsK0JBQWdDO0FBQ2hDLDZCQUE4QjtBQUU5Qiw2Q0FBMEY7QUFFMUYsOEJBQW9DO0FBRXBDLHVDQUF5QztBQUN6Qyx5REFBNkQ7QUFFN0Qsb0NBQTJGO0FBQzNGLG9DQUEyQztBQUUzQyx3REFBeUQ7QUFDekQsMkNBQW1DO0FBSW5DLHFDQUF3RDtBQVd4RCx3Q0FBdUQ7QUFpQnZELElBQWEsYUFBYSxHQUExQixNQUFhLGFBQWMsU0FBUSxlQUFVO0lBSTVDLFlBQVksT0FBeUIsRUFBRSxHQUFHLElBQUk7UUFFN0MsS0FBSyxDQUFDLE9BQU8sRUFBRSxHQUFHLElBQUksQ0FBQyxDQUFDO0lBQ3pCLENBQUM7SUFFRDs7Ozs7OztPQU9HO0lBQ0gsZ0JBQWdCLENBQW1CLElBQU8sRUFBRSxpQkFBa0MsRUFBRTtRQUUvRSxPQUFPLElBQUksQ0FBQztJQUNiLENBQUM7SUFFRCxPQUFPLENBQXNCLGNBQTZDLEVBQUUsR0FBUSxFQUFFLE1BQWU7UUFFcEcsS0FBSyxDQUFDLE9BQU8sQ0FBQyxjQUFjLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFFbkMsSUFBSSxjQUFjLENBQUMsV0FBVyxJQUFJLE1BQU0sQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLFdBQVcsQ0FBQyxDQUFDLE1BQU0sRUFDaEY7WUFDQyxNQUFNLENBQUMsT0FBTyxDQUFDLGNBQWMsQ0FBQyxXQUFXLENBQUM7aUJBQ3hDLE9BQU8sQ0FBQyxVQUFVLElBQUk7Z0JBRXRCLElBQUksQ0FBd0IsQ0FBQztnQkFDN0IsSUFBSSxLQUFLLEdBQUcsT0FBTyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBRTNCLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLEtBQUssSUFBSSxRQUFRLEVBQ2hDO29CQUNDLENBQUMsR0FBRyxJQUFJLENBQUMs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eWlCekI7QUF6aUJZLHNDQUFhO0FBMmlCYixRQUFBLFNBQVMsR0FBRyxhQUFxQyxDQUFDO0FBRS9ELGtCQUFlLGFBQWEsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IHJldHJ5UmVxdWVzdCB9IGZyb20gJy4uLy4uL2ZldGNoJztcbmltcG9ydCBmcyA9IHJlcXVpcmUoJ2ZzLWV4dHJhJyk7XG5pbXBvcnQgcGF0aCA9IHJlcXVpcmUoJ3BhdGgnKTtcbmltcG9ydCBub3ZlbEluZm8sIHsgSU1kY29uZk1ldGEgfSBmcm9tICdub2RlLW5vdmVsLWluZm8nO1xuaW1wb3J0IHsgZnJvbVVSTCwgSUZyb21VcmxPcHRpb25zLCBJSlNET00sIHJlcXVlc3RUb0pTRE9NLCBwYWNrSlNET00gfSBmcm9tICdqc2RvbS1leHRyYSc7XG5pbXBvcnQgeyBVUkwgfSBmcm9tICdqc2RvbS11cmwnO1xuaW1wb3J0IHsgZ2V0RmlsZVBhdGggfSBmcm9tICcuLi9mcyc7XG5cbmltcG9ydCB7IGdldE9wdGlvbnMgfSBmcm9tICcuLi8uLi9qc2RvbSc7XG5pbXBvcnQgeyBub3JtYWxpemVfdmFsIH0gZnJvbSAnbm9kZS1ub3ZlbC1nbG9iYnkvbGliL2hlbHBlcic7XG5cbmltcG9ydCBfTm92ZWxTaXRlLCB7IHN0YXRpY0ltcGxlbWVudHMsIGRlZmF1bHRKU0RPTU9wdGlvbnMsIFNZTUJPTF9DQUNIRSB9IGZyb20gJy4uL2luZGV4JztcbmltcG9ydCB7IFByb21pc2VCbHVlYmlyZCB9IGZyb20gJy4uL2luZGV4JztcblxuaW1wb3J0IHBhcnNlQ29udGVudFR5cGUgPSByZXF1aXJlKCdjb250ZW50LXR5cGUtcGFyc2VyJyk7XG5pbXBvcnQgbm92ZWxUZXh0IGZyb20gJ25vdmVsLXRleHQnO1xuXG5pbXBvcnQgeyBMYXp5Q29va2llLCBMYXp5Q29va2llSmFyIH0gZnJvbSAnanNkb20tZXh0cmEnO1xuXG5pbXBvcnQgeyBzdHJpbmdpZnkgYXMgbWRjb25mX3N0cmluZ2lmeSB9IGZyb20gJ21kY29uZjInO1xuXG5leHBvcnQgdHlwZSBJT3B0aW9uc1BsdXMgPSB7fVxuXG5leHBvcnQgdHlwZSBJRG93bmxvYWRPcHRpb25zID0gX05vdmVsU2l0ZS5JRG93bmxvYWRPcHRpb25zICYgX05vdmVsU2l0ZS5JT3B0aW9ucyAmIElPcHRpb25zUGx1c1xuZXhwb3J0IHR5cGUgSU9wdGlvbnNSdW50aW1lID0gX05vdmVsU2l0ZS5JT3B0aW9uc1J1bnRpbWUgJiBJT3B0aW9uc1BsdXNcblxuZXhwb3J0IGltcG9ydCBJTm92ZWwgPSBfTm92ZWxTaXRlLklOb3ZlbDtcblxuaW1wb3J0IHsgUmVzcG9uc2VSZXF1ZXN0IH0gZnJvbSAncmVxdWVzdCc7XG5cbmltcG9ydCB7IGNvbnNvbGUsIGNvbnNvbGVEZWJ1ZyB9IGZyb20gJy4uLy4uL3V0aWwvbG9nJztcblxuZXhwb3J0IHR5cGUgSUZldGNoQ2hhcHRlciA9IHtcblx0Ym9keT86IGFueTtcblx0ZG9tPzogSUpTRE9NO1xuXHRyZXM/OiBSZXNwb25zZVJlcXVlc3Q7XG5cdGpzb24/LFxuXG5cdHVybD86IFVSTCxcblx0Y29udGVudFR5cGVQYXJzZWQ/OiBSZXR1cm5UeXBlPHBhcnNlQ29udGVudFR5cGU+LFxufTtcblxuZXhwb3J0IHR5cGUgSVNlc3Npb25EYXRhID0ge1xuXHRba2V5OiBzdHJpbmddOiBhbnksXG59XG5cbkBzdGF0aWNJbXBsZW1lbnRzPF9Ob3ZlbFNpdGUuSU5vdmVsU2l0ZVN0YXRpYzxOb3ZlbFNpdGVEZW1vPj4oKVxuZXhwb3J0IGNsYXNzIE5vdmVsU2l0ZURlbW8gZXh0ZW5kcyBfTm92ZWxTaXRlXG57XG5cdHB1YmxpYyBzdGF0aWMgcmVhZG9ubHkgSURLRVk6IHN0cmluZyA9IG51bGw7XG5cblx0Y29uc3RydWN0b3Iob3B0aW9uczogSURvd25sb2FkT3B0aW9ucywgLi4uYXJndilcblx0e1xuXHRcdHN1cGVyKG9wdGlvbnMsIC4uLmFyZ3YpO1xuXHR9XG5cblx0LyoqXG5cdCAqIEB0b2RvIOiuk+atpOaWueazleacieaEj+e+qVxuXHQgKlxuXHQgKiDnlKjkvoboqqrmmI7nm67liY3nq5npu57nmoTmiYDpnIAgc2Vzc2lvbiBjb29raWVzXG5cdCAqXG5cdCAqIEBwYXJhbSB7VH0gZGF0YVxuXHQgKiBAcmV0dXJucyB7VH1cblx0ICovXG5cdGNoZWNrU2Vzc2lvbkRhdGE8VCA9IElTZXNzaW9uRGF0YT4oZGF0YTogVCwgb3B0aW9uc1J1bnRpbWU6IElPcHRpb25zUnVudGltZSA9IHt9KVxuXHR7XG5cdFx0cmV0dXJuIGRhdGE7XG5cdH1cblxuXHRzZXNzaW9uPFQgPSBJT3B0aW9uc1J1bnRpbWU+KG9wdGlvbnNSdW50aW1lOiBQYXJ0aWFsPFQgJiBJRG93bmxvYWRPcHRpb25zPiwgdXJsOiBVUkwsIGRvbWFpbj86IHN0cmluZylcblx0e1xuXHRcdHN1cGVyLnNlc3Npb24ob3B0aW9uc1J1bnRpbWUsIHVybCk7XG5cblx0XHRpZiAob3B0aW9uc1J1bnRpbWUuc2Vzc2lvbkRhdGEgJiYgT2JqZWN0LmtleXMob3B0aW9uc1J1bnRpbWUuc2Vzc2lvbkRhdGEpLmxlbmd0aClcblx0XHR7XG5cdFx0XHRPYmplY3QuZW50cmllcyhvcHRpb25zUnVudGltZS5zZXNzaW9uRGF0YSlcblx0XHRcdFx0LmZvckVhY2goZnVuY3Rpb24gKGRhdGEpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRsZXQgYzogTGF6eUNvb2tpZS5Qcm9wZXJ0aWVzO1xuXHRcdFx0XHRcdGxldCB0eXBlYyA9IHR5cGVvZiBkYXRhWzFdO1xuXG5cdFx0XHRcdFx0aWYgKGRhdGFbMV0gJiYgdHlwZWMgPT0gJ29iamVjdCcpXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0YyA9IGRhdGFbMV07XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGVsc2UgaWYgKHR5cGVjID09PSBudWxsIHx8IHR5cGVjICE9ICdvYmplY3QnKVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdGxldCBba2V5LCB2YWx1ZV0gPSBkYXRhO1xuXG5cdFx0XHRcdFx0XHRjID0ge1xuXHRcdFx0XHRcdFx0XHRrZXksXG5cdFx0XHRcdFx0XHRcdHZhbHVlLFxuXHRcdFx0XHRcdFx0fTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0ZWxzZVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdGMgPSBkYXRhWzFdO1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdGlmIChjKVxuXHRcdFx0XHRcdHtcblxuXHRcdFx0XHRcdFx0aWYgKHR5cGVvZiBjID09ICdvYmplY3QnKVxuXHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRpZiAoIWMucGF0aClcblx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdGMucGF0aCA9ICcvJztcblx0XHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHRcdGlmIChjLmhvc3RPbmx5ID09IG51bGwpXG5cdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHRjLmhvc3RPbmx5ID0gZmFsc2U7XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0b3B0aW9uc1J1bnRpbWUub3B0aW9uc0pTRE9NLmNvb2tpZUphclxuXHRcdFx0XHRcdFx0XHQuc2V0Q29va2llU3luYyhjLCB1cmwuaHJlZilcblx0XHRcdFx0XHRcdDtcblxuXHRcdFx0XHRcdFx0aWYgKHR5cGVvZiBjID09ICdvYmplY3QnICYmICFjLmRvbWFpbilcblx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0aWYgKGRvbWFpbilcblx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdGMuZG9tYWluID0gZG9tYWluO1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdGVsc2UgaWYgKHVybCAmJiB1cmwuaG9zdClcblx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdGMuZG9tYWluID0gdXJsLmhvc3Q7XG5cdFx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0XHR0cnlcblx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdG9wdGlvbnNSdW50aW1lLm9wdGlvbnNKU0RPTS5jb29raWVKYXJcblx0XHRcdFx0XHRcdFx0XHRcdC5zZXRDb29raWVTeW5jKGMsIHVybC5ocmVmKVxuXHRcdFx0XHRcdFx0XHRcdDtcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRjYXRjaCAoZSlcblx0XHRcdFx0XHRcdFx0e1xuXG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0pXG5cdFx0XHQ7XG5cblx0XHRcdGNvbnNvbGUuZGlyKG9wdGlvbnNSdW50aW1lLm9wdGlvbnNKU0RPTS5jb29raWVKYXIpO1xuXHRcdH1cblxuXHRcdHJldHVybiB0aGlzO1xuXHR9XG5cblx0ZG93bmxvYWQoaW5wdXRVcmw6IHN0cmluZyB8IFVSTCwgZG93bmxvYWRPcHRpb25zOiBJRG93bmxvYWRPcHRpb25zID0ge30pXG5cdHtcblx0XHRjb25zdCBzZWxmID0gdGhpcztcblx0XHRsZXQgdXJsID0gaW5wdXRVcmwgYXMgVVJMO1xuXG5cdFx0Y29uc3QgW1BBVEhfTk9WRUxfTUFJTiwgb3B0aW9uc1J1bnRpbWVdID0gdGhpcy5nZXRPdXRwdXREaXI8SU9wdGlvbnNSdW50aW1lICYgSURvd25sb2FkT3B0aW9ucz4oZG93bmxvYWRPcHRpb25zKTtcblxuXHRcdHJldHVybiBQcm9taXNlQmx1ZWJpcmRcblx0XHRcdC5iaW5kKHNlbGYpXG5cdFx0XHQudGhlbihhc3luYyBmdW5jdGlvbiAoKVxuXHRcdFx0e1xuXHRcdFx0XHR1cmwgPSBhd2FpdCB0aGlzLmNyZWF0ZU1haW5VcmwodXJsKTtcblxuXHRcdFx0XHRzZWxmLnNlc3Npb24ob3B0aW9uc1J1bnRpbWUsIHVybCk7XG5cblx0XHRcdFx0bGV0IG5vdmVsID0gYXdhaXQgc2VsZi5nZXRfdm9sdW1lX2xpc3Q8SU9wdGlvbnNSdW50aW1lICYgSURvd25sb2FkT3B0aW9ucz4odXJsLCBvcHRpb25zUnVudGltZSk7XG5cblx0XHRcdFx0bGV0IHBhdGhfbm92ZWwgPSBzZWxmLmdldFBhdGhOb3ZlbChQQVRIX05PVkVMX01BSU4sIG5vdmVsLCBvcHRpb25zUnVudGltZSk7XG5cblx0XHRcdFx0c2VsZi5fbG9hZEV4aXN0c0NvbmYodXJsLCBvcHRpb25zUnVudGltZSwgbm92ZWwsIHBhdGhfbm92ZWwpO1xuXG5cdFx0XHRcdGxldCBpZHggPSBvcHRpb25zUnVudGltZS5zdGFydEluZGV4IHx8IDA7XG5cblx0XHRcdFx0b3B0aW9uc1J1bnRpbWVbU1lNQk9MX0NBQ0hFXS5ub3ZlbCA9IG5vdmVsO1xuXHRcdFx0XHRvcHRpb25zUnVudGltZVtTWU1CT0xfQ0FDSEVdLnBhdGhfbm92ZWwgPSBwYXRoX25vdmVsO1xuXG5cdFx0XHRcdGF3YWl0IFByb21pc2VCbHVlYmlyZFxuXHRcdFx0XHRcdC5yZXNvbHZlKHNlbGYucHJvY2Vzc05vdmVsKG5vdmVsLCBvcHRpb25zUnVudGltZSwge1xuXHRcdFx0XHRcdFx0dXJsLFxuXHRcdFx0XHRcdFx0cGF0aF9ub3ZlbCxcblx0XHRcdFx0XHR9KSlcblx0XHRcdFx0XHQudGFwKGxzID0+IHtcblx0XHRcdFx0XHRcdHJldHVybiBzZWxmLl9vdXRwdXRBdHRhY2gobm92ZWwsIG9wdGlvbnNSdW50aW1lLCB7XG5cdFx0XHRcdFx0XHRcdHVybCxcblx0XHRcdFx0XHRcdFx0cGF0aF9ub3ZlbCxcblx0XHRcdFx0XHRcdH0pXG5cdFx0XHRcdFx0fSlcblx0XHRcdFx0XHQudGFwKGxzID0+XG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0bGV0IGZpbGUgPSBwYXRoLmpvaW4ocGF0aF9ub3ZlbCxcblx0XHRcdFx0XHRcdFx0YCR7c2VsZi50cmltRmlsZW5hbWVOb3ZlbChub3ZlbC5ub3ZlbF90aXRsZSl9LiR7bm92ZWwudXJsX2RhdGEubm92ZWxfaWR9Lmpzb25gXG5cdFx0XHRcdFx0XHRcdClcblx0XHRcdFx0XHRcdDtcblxuXHRcdFx0XHRcdFx0cmV0dXJuIGZzLm91dHB1dEpTT04oZmlsZSwgbm92ZWwsIHtcblx0XHRcdFx0XHRcdFx0c3BhY2VzOiBcIlxcdFwiLFxuXHRcdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0fSlcblx0XHRcdFx0O1xuXG5cdFx0XHRcdGF3YWl0IHNlbGYuX3NhdmVSZWFkbWUob3B0aW9uc1J1bnRpbWUpO1xuXG5cdFx0XHRcdHJldHVybiBub3ZlbDtcblx0XHRcdH0pXG5cdFx0XHQ7XG5cdH1cblxuXHRwcm90ZWN0ZWQgYXN5bmMgX291dHB1dEF0dGFjaDxUID0gYW55Pihub3ZlbDogSU5vdmVsLCBvcHRpb25zUnVudGltZTogSU9wdGlvbnNSdW50aW1lLCBfY2FjaGVfOiB7XG5cdFx0dXJsOiBVUkwsXG5cdFx0cGF0aF9ub3ZlbDogc3RyaW5nLFxuXHR9LCAuLi5hcmd2KVxuXHR7XG5cdFx0Y29uc3Qgc2VsZiA9IHRoaXM7XG5cdFx0Y29uc3QgeyB1cmwsIHBhdGhfbm92ZWwgfSA9IF9jYWNoZV87XG5cblx0XHRpZiAobm92ZWwudm9sdW1lX2xpc3QpXG5cdFx0e1xuXHRcdFx0cmV0dXJuIFByb21pc2VCbHVlYmlyZFxuXHRcdFx0XHQucmVzb2x2ZShub3ZlbC52b2x1bWVfbGlzdClcblx0XHRcdFx0LmVhY2goKHZvbHVtZSwgdmlkKSA9PiB7XG5cblx0XHRcdFx0XHRsZXQgZGlybmFtZTogc3RyaW5nO1xuXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0bGV0IF92aWQgPSAnJztcblxuXHRcdFx0XHRcdFx0aWYgKCFvcHRpb25zUnVudGltZS5ub0RpclByZWZpeClcblx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0X3ZpZCA9IHZpZC50b1N0cmluZygpLnBhZFN0YXJ0KDQsICcwJykgKyAnMCc7XG5cdFx0XHRcdFx0XHRcdF92aWQgKz0gJ18nO1xuXHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHRkaXJuYW1lID0gcGF0aC5qb2luKHBhdGhfbm92ZWwsXG5cdFx0XHRcdFx0XHRcdGAke192aWR9JHtzZWxmLnRyaW1GaWxlbmFtZVZvbHVtZSh2b2x1bWUudm9sdW1lX3RpdGxlKX1gXG5cdFx0XHRcdFx0XHQpO1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdGxldCBpbWdzOiBzdHJpbmdbXSA9IFtdO1xuXG5cdFx0XHRcdFx0cmV0dXJuIFByb21pc2VCbHVlYmlyZFxuXHRcdFx0XHRcdFx0LnJlc29sdmUodm9sdW1lLmNoYXB0ZXJfbGlzdClcblx0XHRcdFx0XHRcdC5lYWNoKGNoYXB0ZXIgPT4ge1xuXHRcdFx0XHRcdFx0XHRpZiAoY2hhcHRlci5pbWdzKVxuXHRcdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdFx0aW1ncy5wdXNoKC4uLmNoYXB0ZXIuaW1ncyk7XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdH0pXG5cdFx0XHRcdFx0XHQudGFwKCgpID0+IHtcblx0XHRcdFx0XHRcdFx0aW1ncyA9IGltZ3MuZmlsdGVyKHYgPT4gdik7XG5cblx0XHRcdFx0XHRcdFx0aWYgKGltZ3MubGVuZ3RoKVxuXHRcdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdFx0bGV0IGZpbGUgPSBwYXRoLmpvaW4oZGlybmFtZSwgJ0FUVEFDSC5tZCcpO1xuXG5cdFx0XHRcdFx0XHRcdFx0bGV0IGltYWdlcyA9IE9iamVjdFxuXHRcdFx0XHRcdFx0XHRcdFx0LmVudHJpZXMoaW1ncyBhcyBzdHJpbmdbXSlcblx0XHRcdFx0XHRcdFx0XHRcdC5yZWR1Y2UoKGEsIFtrLCB2XSkgPT4ge1xuXG5cdFx0XHRcdFx0XHRcdFx0XHRcdGFbay50b1N0cmluZygpLnBhZFN0YXJ0KDMsICcwJyldID0gdjtcblx0XHRcdFx0XHRcdFx0XHRcdFx0cmV0dXJuIGFcblx0XHRcdFx0XHRcdFx0XHRcdH0sIHt9IGFzIFJlY29yZDxzdHJpbmcsIHN0cmluZz4pO1xuXG5cdFx0XHRcdFx0XHRcdFx0bGV0IG1kID0gbWRjb25mX3N0cmluZ2lmeSh7XG5cdFx0XHRcdFx0XHRcdFx0XHRhdHRhY2g6IHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0aW1hZ2VzLFxuXHRcdFx0XHRcdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRcdFx0XHR9KTtcblxuXHRcdFx0XHRcdFx0XHRcdHJldHVybiBmcy5vdXRwdXRGaWxlKGZpbGUsIG1kKTtcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0fSlcblx0XHRcdFx0fSlcblx0XHRcdFx0O1xuXHRcdH1cblxuXHRcdHJldHVybiBQcm9taXNlQmx1ZWJpcmQucmVzb2x2ZSgpXG5cdH1cblxuXHRwcm90ZWN0ZWQgYXN5bmMgX3Byb2Nlc3NOb3ZlbDxUID0gYW55Pihub3ZlbDogSU5vdmVsLCBvcHRpb25zUnVudGltZTogSU9wdGlvbnNSdW50aW1lLCBfY2FjaGVfOiB7XG5cdFx0dXJsOiBVUkwsXG5cdFx0cGF0aF9ub3ZlbDogc3RyaW5nLFxuXHR9LCAuLi5hcmd2KVxuXHR7XG5cdFx0Y29uc3Qgc2VsZiA9IHRoaXM7XG5cdFx0bGV0IGlkeCA9IG9wdGlvbnNSdW50aW1lLnN0YXJ0SW5kZXggfHwgMDtcblxuXHRcdGxldCB7IHVybCwgcGF0aF9ub3ZlbCB9ID0gX2NhY2hlXztcblxuXHRcdHJldHVybiBQcm9taXNlQmx1ZWJpcmRcblx0XHRcdC5tYXBTZXJpZXMobm92ZWwudm9sdW1lX2xpc3QsIGZ1bmN0aW9uICh2b2x1bWUsIHZpZClcblx0XHRcdHtcblx0XHRcdFx0bGV0IGRpcm5hbWU6IHN0cmluZztcblxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0bGV0IF92aWQgPSAnJztcblxuXHRcdFx0XHRcdGlmICghb3B0aW9uc1J1bnRpbWUubm9EaXJQcmVmaXgpXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0X3ZpZCA9IHZpZC50b1N0cmluZygpLnBhZFN0YXJ0KDQsICcwJykgKyAnMCc7XG5cdFx0XHRcdFx0XHRfdmlkICs9ICdfJztcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRkaXJuYW1lID0gcGF0aC5qb2luKHBhdGhfbm92ZWwsXG5cdFx0XHRcdFx0XHRgJHtfdmlkfSR7c2VsZi50cmltRmlsZW5hbWVWb2x1bWUodm9sdW1lLnZvbHVtZV90aXRsZSl9YFxuXHRcdFx0XHRcdCk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRpZiAoIW9wdGlvbnNSdW50aW1lLm5vRmlyZVByZWZpeCAmJiBvcHRpb25zUnVudGltZS5maWxlUHJlZml4TW9kZSA+PSAyKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0bGV0IGk6IG51bWJlcjtcblxuXHRcdFx0XHRcdGxldCBib29sID0gdm9sdW1lLmNoYXB0ZXJfbGlzdC5ldmVyeShmdW5jdGlvbiAoY2hhcHRlciwgailcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRsZXQgbSA9IChvcHRpb25zUnVudGltZS5maWxlUHJlZml4TW9kZSA+IDMgP1xuXHRcdFx0XHRcdFx0XHRjaGFwdGVyLmNoYXB0ZXJfdGl0bGUgOiBub3JtYWxpemVfdmFsKGNoYXB0ZXIuY2hhcHRlcl90aXRsZSlcblx0XHRcdFx0XHRcdFx0KVxuXHRcdFx0XHRcdFx0XHQucmVwbGFjZSgvXlxcRCsvLCAnJylcblx0XHRcdFx0XHRcdFx0Ly8ucmVwbGFjZSgvXihcXGQrKS4rJC8sICckMScpXG5cdFx0XHRcdFx0XHRcdC5yZXBsYWNlKC9eKFxcZCspXFxELiokLywgJyQxJylcblx0XHRcdFx0XHRcdDtcblxuXHRcdFx0XHRcdFx0Ly9jb25zb2xlLmxvZyhtLCBjaGFwdGVyLmNoYXB0ZXJfdGl0bGUpO1xuXG5cdFx0XHRcdFx0XHRpZiAoL15cXGQrJC8udGVzdChtKSlcblx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0bGV0IG0yID0gcGFyc2VJbnQobSk7XG5cblx0XHRcdFx0XHRcdFx0aWYgKGogPT0gMClcblx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdGkgPSBtMjtcblxuXHRcdFx0XHRcdFx0XHRcdHJldHVybiB0cnVlO1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdGVsc2UgaWYgKG0yID09PSArK2kpXG5cdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0XHRcdFx0fSk7XG5cblx0XHRcdFx0XHQvL2NvbnNvbGUubG9nKGJvb2wpO1xuXG5cdFx0XHRcdFx0aWYgKGJvb2wpXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0dm9sdW1lLmNoYXB0ZXJfbGlzdC5mb3JFYWNoKGZ1bmN0aW9uIChjaGFwdGVyKVxuXHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRjaGFwdGVyLmNoYXB0ZXJfaW5kZXggPSAnJztcblx0XHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXG5cdFx0XHRcdGlmIChvcHRpb25zUnVudGltZS5ldmVudClcblx0XHRcdFx0e1xuXHRcdFx0XHRcdHNlbGYuZW1pdChvcHRpb25zUnVudGltZS5ldmVudCwgJ3ZvbHVtZScsIHZvbHVtZSwge1xuXHRcdFx0XHRcdFx0b3B0aW9uc1J1bnRpbWUsXG5cdFx0XHRcdFx0XHRkaXJuYW1lLFxuXHRcdFx0XHRcdFx0dmlkLFxuXHRcdFx0XHRcdFx0bm92ZWwsXG5cdFx0XHRcdFx0XHR1cmwsXG5cdFx0XHRcdFx0fSk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRyZXR1cm4gUHJvbWlzZUJsdWViaXJkXG5cdFx0XHRcdFx0Lm1hcFNlcmllcyh2b2x1bWUuY2hhcHRlcl9saXN0LCBhc3luYyBmdW5jdGlvbiAoY2hhcHRlciwgY2lkKVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdC8vY2hhcHRlci5jaGFwdGVyX2luZGV4ID0gKGlkeCsrKTtcblxuXHRcdFx0XHRcdFx0Y29uc3QgY3VycmVudF9pZHggPSBpZHgrKztcblxuXHRcdFx0XHRcdFx0bGV0IGZpbGUgPSBnZXRGaWxlUGF0aChzZWxmLCB7XG5cdFx0XHRcdFx0XHRcdGNoYXB0ZXIsIGNpZCxcblx0XHRcdFx0XHRcdFx0ZXh0OiAnLnR4dCcsXG5cblx0XHRcdFx0XHRcdFx0aWR4OiBjdXJyZW50X2lkeCxcblxuXHRcdFx0XHRcdFx0XHRkaXJuYW1lLFxuXHRcdFx0XHRcdFx0XHR2b2x1bWUsIHZpZCxcblx0XHRcdFx0XHRcdH0sIG9wdGlvbnNSdW50aW1lKTtcblxuXHRcdFx0XHRcdFx0aWYgKHNlbGYuX2NoZWNrRXhpc3RzKG9wdGlvbnNSdW50aW1lLCBmaWxlKSlcblx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0cmV0dXJuIGZpbGU7XG5cdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdGxldCB1cmwgPSBzZWxmLl9jcmVhdGVDaGFwdGVyVXJsKHtcblx0XHRcdFx0XHRcdFx0bm92ZWwsXG5cdFx0XHRcdFx0XHRcdHZvbHVtZSxcblx0XHRcdFx0XHRcdFx0Y2hhcHRlcixcblx0XHRcdFx0XHRcdH0sIG9wdGlvbnNSdW50aW1lKTtcblxuXHRcdFx0XHRcdFx0YXdhaXQgc2VsZi5fZmV0Y2hDaGFwdGVyKHVybCwgb3B0aW9uc1J1bnRpbWUpXG5cdFx0XHRcdFx0XHRcdC50aGVuKGZ1bmN0aW9uIChyZXQpXG5cdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHRyZXR1cm4gc2VsZi5fcGFyc2VDaGFwdGVyKHJldCwgb3B0aW9uc1J1bnRpbWUsIHtcblx0XHRcdFx0XHRcdFx0XHRcdGZpbGUsXG5cdFx0XHRcdFx0XHRcdFx0XHRub3ZlbCxcblx0XHRcdFx0XHRcdFx0XHRcdHZvbHVtZSxcblx0XHRcdFx0XHRcdFx0XHRcdGNoYXB0ZXIsXG5cdFx0XHRcdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0XHRcdH0pXG5cdFx0XHRcdFx0XHRcdC50aGVuKGZ1bmN0aW9uICh0ZXh0KVxuXHRcdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdFx0aWYgKHR5cGVvZiB0ZXh0ID09ICdzdHJpbmcnKVxuXHRcdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHRcdHJldHVybiBub3ZlbFRleHQudG9TdHIodGV4dCk7XG5cdFx0XHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHRcdFx0cmV0dXJuIHRleHQ7XG5cdFx0XHRcdFx0XHRcdH0pXG5cdFx0XHRcdFx0XHRcdC50aGVuKGFzeW5jIGZ1bmN0aW9uICh0ZXh0OiBzdHJpbmcpXG5cdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHRhd2FpdCBmcy5vdXRwdXRGaWxlKGZpbGUsIHRleHQpO1xuXG5cdFx0XHRcdFx0XHRcdFx0cmV0dXJuIHRleHQ7XG5cdFx0XHRcdFx0XHRcdH0pXG5cdFx0XHRcdFx0XHQ7XG5cblx0XHRcdFx0XHRcdHJldHVybiBmaWxlO1xuXHRcdFx0XHRcdH0pXG5cdFx0XHRcdFx0O1xuXHRcdFx0fSlcblx0XHRcdC50aGVuKGZ1bmN0aW9uIChyZXQpXG5cdFx0XHR7XG5cdFx0XHRcdHJldHVybiByZXQgYXMgYW55IGFzIFQ7XG5cdFx0XHR9KVxuXHRcdDtcblx0fVxuXG5cdHByb2Nlc3NOb3ZlbDxUPihub3ZlbDogSU5vdmVsLCBvcHRpb25zUnVudGltZTogSU9wdGlvbnNSdW50aW1lLCBfY2FjaGVfOiB7XG5cdFx0dXJsOiBVUkwsXG5cdFx0cGF0aF9ub3ZlbDogc3RyaW5nLFxuXHR9LCAuLi5hcmd2KVxuXHR7XG5cdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdGxldCBwcjogYW55O1xuXG5cdFx0cHIgPSBvcHRpb25zUnVudGltZS5mZXRjaE1ldGFEYXRhT25seSA/IFtdIDogdGhpcy5fcHJvY2Vzc05vdmVsPFQ+KG5vdmVsLCBvcHRpb25zUnVudGltZSwgX2NhY2hlXywgLi4uYXJndik7XG5cblx0XHRyZXR1cm4gUHJvbWlzZUJsdWViaXJkXG5cdFx0XHQucmVzb2x2ZShwcilcblx0XHRcdC50aGVuKGZ1bmN0aW9uIChyZXQ6IFQpXG5cdFx0XHR7XG5cdFx0XHRcdHJldHVybiB7XG5cdFx0XHRcdFx0bm92ZWwsXG5cdFx0XHRcdFx0b3B0aW9uc1J1bnRpbWUsXG5cdFx0XHRcdFx0X2NhY2hlXyxcblx0XHRcdFx0XHRyZXQsXG5cdFx0XHRcdH07XG5cdFx0XHR9KVxuXHRcdDtcblx0fVxuXG5cdHByb3RlY3RlZCBfc3RyaXBDb250ZW50KHRleHQ6IHN0cmluZylcblx0e1xuXHRcdHJldHVybiB0ZXh0O1xuXHR9XG5cblx0cHJvdGVjdGVkIF9wYXJzZUNoYXB0ZXI8VD4ocmV0OiBJRmV0Y2hDaGFwdGVyLCBvcHRpb25zUnVudGltZTogVCAmIElPcHRpb25zUnVudGltZSwgY2FjaGU6IHtcblx0XHRmaWxlOiBzdHJpbmcsXG5cdFx0bm92ZWw6IF9Ob3ZlbFNpdGUuSU5vdmVsLFxuXHRcdHZvbHVtZTogX05vdmVsU2l0ZS5JVm9sdW1lLFxuXHRcdGNoYXB0ZXI6IF9Ob3ZlbFNpdGUuSUNoYXB0ZXIsXG5cdH0pOiBzdHJpbmcgfCBQcm9taXNlPHN0cmluZz5cblx0e1xuXHRcdGlmICghcmV0KVxuXHRcdHtcblx0XHRcdHJldHVybiAnJztcblx0XHR9XG5cblx0XHR0aHJvdyBuZXcgU3ludGF4RXJyb3IoYEZ1bmN0aW9uIG5vdCBpbXBsZW1lbnRlZGApO1xuXHR9XG5cblx0cHJvdGVjdGVkIF9mZXRjaENoYXB0ZXI8VD4odXJsOiBVUkwsIG9wdGlvbnNSdW50aW1lOiBUICYgSU9wdGlvbnNSdW50aW1lKVxuXHR7XG5cdFx0cmV0dXJuIFByb21pc2VCbHVlYmlyZC5yZXNvbHZlKCkudGhlbihhc3luYyBmdW5jdGlvbiAoKVxuXHRcdHtcblx0XHRcdGNvbnNvbGVEZWJ1Zy5kZWJ1ZyhgZmV0Y2hDaGFwdGVyYCwgdXJsLnRvU3RyaW5nKCkpO1xuXG5cdFx0XHRsZXQgcmV0ID0ge30gYXMgSUZldGNoQ2hhcHRlcjtcblxuXHRcdFx0bGV0IG9wdHMgPSBnZXRPcHRpb25zKG9wdGlvbnNSdW50aW1lKTtcblxuXHRcdFx0aWYgKG9wdGlvbnNSdW50aW1lLmRpc2FibGVEb3dubG9hZClcblx0XHRcdHtcblx0XHRcdFx0cmV0dXJuIG51bGw7XG5cdFx0XHR9XG5cdFx0XHRlbHNlIGlmICh0cnVlKVxuXHRcdFx0e1xuXHRcdFx0XHRpZiAob3B0aW9uc1J1bnRpbWUucmV0cnlEZWxheSA+IDApXG5cdFx0XHRcdHtcblx0XHRcdFx0XHQvLyBAdHMtaWdub3JlXG5cdFx0XHRcdFx0b3B0cy5yZXF1ZXN0T3B0aW9ucy5kZWxheSA9IG9wdGlvbnNSdW50aW1lLnJldHJ5RGVsYXk7XG5cdFx0XHRcdH1cblx0XHRcdFx0ZWxzZVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdFx0XHRcdG9wdHMucmVxdWVzdE9wdGlvbnMucmV0cnkgPSAxO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0YXdhaXQgcmV0cnlSZXF1ZXN0KHVybCwgb3B0cy5yZXF1ZXN0T3B0aW9ucylcblx0XHRcdFx0XHQudGhlbihmdW5jdGlvbiAocmVzKVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdGNvbnN0IGNvbnRlbnRUeXBlUGFyc2VkID0gcGFyc2VDb250ZW50VHlwZShyZXMuaGVhZGVyc1tcImNvbnRlbnQtdHlwZVwiXSk7XG5cblx0XHRcdFx0XHRcdHJldC5jb250ZW50VHlwZVBhcnNlZCA9IGNvbnRlbnRUeXBlUGFyc2VkO1xuXG5cdFx0XHRcdFx0XHQvLyBAdHMtaWdub3JlXG5cdFx0XHRcdFx0XHRyZXQudXJsID0gdXJsO1xuXG5cdFx0XHRcdFx0XHRpZiAoY29udGVudFR5cGVQYXJzZWQuaXNIVE1MKCkgfHwgY29udGVudFR5cGVQYXJzZWQuaXNYTUwoKSlcblx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0cmV0LmRvbSA9IHJlcXVlc3RUb0pTRE9NKHJlcywgdXJsLCBvcHRpb25zUnVudGltZS5vcHRpb25zSlNET00pO1xuXHRcdFx0XHRcdFx0XHRyZXQuZG9tID0gcGFja0pTRE9NKHJldC5kb20pO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0ZWxzZSBpZiAoY29udGVudFR5cGVQYXJzZWQuc3VidHlwZSA9PSAnanNvbicpXG5cdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdHJldC5qc29uID0gSlNPTi5wYXJzZShyZXMuYm9keS50b1N0cmluZygpKTtcblx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0cmV0LnJlcyA9IHJlcztcblx0XHRcdFx0XHRcdHJldC5ib2R5ID0gcmVzLmJvZHk7XG5cdFx0XHRcdFx0fSlcblx0XHRcdFx0O1xuXHRcdFx0fVxuXHRcdFx0ZWxzZVxuXHRcdFx0e1xuXHRcdFx0XHQvLyBAdHMtaWdub3JlXG5cdFx0XHRcdHJldC5kb20gPSBhd2FpdCBmcm9tVVJMKHVybCwgb3B0aW9uc1J1bnRpbWUub3B0aW9uc0pTRE9NKTtcblxuXHRcdFx0XHRyZXQucmVzID0gcmV0LmRvbS5fb3B0aW9ucy5SZXNwb25zZTtcblx0XHRcdFx0cmV0LmJvZHkgPSByZXQuZG9tLl9vcHRpb25zLmJvZHk7XG5cdFx0XHR9XG5cblx0XHRcdHJldHVybiByZXQ7XG5cdFx0fSk7XG5cdH1cblxuXHRwcm90ZWN0ZWQgX2V4cG9ydERvd25sb2FkT3B0aW9ucyhvcHRpb25zUnVudGltZT86IElPcHRpb25zUnVudGltZSk6IGFueVxuXHR7XG5cdFx0bGV0IG9wdHMgPSB7fTtcblxuXHRcdGlmIChvcHRpb25zUnVudGltZSlcblx0XHR7XG5cdFx0XHRsZXQgYm9vbDogYm9vbGVhbjtcblxuXHRcdFx0Zm9yIChsZXQgayBvZiBbXG5cdFx0XHRcdCdub0ZpcmVQcmVmaXgnLFxuXHRcdFx0XHQnbm9GaWxlUGFkZW5kJyxcblx0XHRcdFx0J2ZpbGVQcmVmaXhNb2RlJyxcblx0XHRcdFx0J3N0YXJ0SW5kZXgnLFxuXHRcdFx0XSlcblx0XHRcdHtcblx0XHRcdFx0aWYgKChrIGluIG9wdGlvbnNSdW50aW1lKSAmJiB0eXBlb2Ygb3B0aW9uc1J1bnRpbWVba10gIT09ICd1bmRlZmluZWQnKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0Ym9vbCA9IHRydWU7XG5cdFx0XHRcdFx0b3B0c1trXSA9IG9wdGlvbnNSdW50aW1lW2tdO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0cmV0dXJuIG9wdHM7XG5cdH1cblxuXHRwcm90ZWN0ZWQgX3NhdmVSZWFkbWUob3B0aW9uc1J1bnRpbWU6IElPcHRpb25zUnVudGltZSwgb3B0aW9ucyA9IHt9LCAuLi5vcHRzKVxuXHR7XG5cdFx0aWYgKHRoaXMuSURLRVkpXG5cdFx0e1xuXHRcdFx0b3B0aW9uc1t0aGlzLklES0VZXSA9IG9wdGlvbnNbdGhpcy5JREtFWV0gfHwge307XG5cblx0XHRcdHRyeVxuXHRcdFx0e1xuXHRcdFx0XHRvcHRpb25zW3RoaXMuSURLRVldLm5vdmVsX2lkID0gb3B0aW9uc1t0aGlzLklES0VZXS5ub3ZlbF9pZCB8fCBvcHRpb25zUnVudGltZVtTWU1CT0xfQ0FDSEVdLm5vdmVsLnVybF9kYXRhLm5vdmVsX2lkO1xuXHRcdFx0fVxuXHRcdFx0Y2F0Y2ggKGUpXG5cdFx0XHR7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0bGV0IGRvd25sb2FkT3B0aW9ucyA9IHRoaXMuX2V4cG9ydERvd25sb2FkT3B0aW9ucyhvcHRpb25zUnVudGltZSk7XG5cblx0XHRyZXR1cm4gc3VwZXIuX3NhdmVSZWFkbWUob3B0aW9uc1J1bnRpbWUsIG9wdGlvbnMsIHtcblx0XHRcdG9wdGlvbnM6IHtcblx0XHRcdFx0dGV4dGxheW91dDoge1xuXHRcdFx0XHRcdGFsbG93X2xmMjogdHJ1ZSxcblx0XHRcdFx0fSxcblx0XHRcdFx0ZG93bmxvYWRPcHRpb25zOiBkb3dubG9hZE9wdGlvbnMgfHwge30sXG5cdFx0XHR9LFxuXHRcdH0sIC4uLm9wdHMpO1xuXHR9XG5cblx0cHJvdGVjdGVkIF9nZXRfbWV0YShpbnB1dFVybCwgb3B0aW9uc1J1bnRpbWUsIGNhY2hlPzoge1xuXHRcdGRvbT86IElKU0RPTSxcblx0fSlcblx0e1xuXHRcdHRocm93IG5ldyBTeW50YXhFcnJvcigpO1xuXHR9XG5cbn1cblxuZXhwb3J0IGNvbnN0IE5vdmVsU2l0ZSA9IE5vdmVsU2l0ZURlbW8gYXMgdHlwZW9mIE5vdmVsU2l0ZURlbW87XG5cbmV4cG9ydCBkZWZhdWx0IE5vdmVsU2l0ZURlbW87XG4iXX0=