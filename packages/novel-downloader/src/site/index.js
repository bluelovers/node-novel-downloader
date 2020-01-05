"use strict";
/**
 * Created by user on 2018/2/10/010.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const bluebird_1 = require("../decorator/bluebird");
exports.bluebirdDecorator = bluebird_1.default;
//import bluebirdDecorator from 'bluebird-decorator';
const PromiseBluebird = require("bluebird");
exports.PromiseBluebird = PromiseBluebird;
const jsdom_url_1 = require("jsdom-url");
const path = require("upath2");
const _root_1 = require("../../_root");
const jsdom_1 = require("../jsdom");
exports.defaultJSDOMOptions = jsdom_1.defaultJSDOMOptions;
exports.createOptionsJSDOM = jsdom_1.createOptionsJSDOM;
const node_novel_info_1 = require("node-novel-info");
const fs = require("fs-extra");
const util_1 = require("fs-iconv/util");
const crlf_normalize_1 = require("crlf-normalize");
const StrUtil = require("str-util");
const const_1 = require("node-novel-info/lib/const");
//import * as moment from 'moment';
const moment = require("moment-timezone");
exports.moment = moment;
const util_2 = require("../util");
moment.fn.toJSON = function () { return this.format(); };
exports.SYMBOL_CACHE = Symbol.for('cache');
class NovelSite {
    constructor(options, ...argv) {
        if (!this.IDKEY) {
            throw new ReferenceError(`IDKEY is null`);
        }
        this.optionsInit = options;
        this.optionsInit.cwd = this.optionsInit.cwd || process.cwd();
        [this.PATH_NOVEL_MAIN, this.optionsInit] = this.getOutputDir(this.optionsInit);
        if (this.optionsInit.debugLog) {
            log_1.consoleDebug.enabled = true;
        }
        this._constructor(options, ...argv);
    }
    _constructor(options, ...argv) {
        log_1.consoleDebug.debug('root._constructor');
    }
    static create(options, ...argv) {
        return new this(options, ...argv);
    }
    static check(url, options) {
        return false;
    }
    session(optionsRuntime, url) {
        optionsRuntime.optionsJSDOM = jsdom_1.createOptionsJSDOM(optionsRuntime.optionsJSDOM);
        if (url) {
            optionsRuntime[exports.SYMBOL_CACHE].url = url;
        }
        return this;
    }
    download(url, options) {
        throw new SyntaxError(`Function not implemented`);
    }
    get_volume_list(url, optionsRuntime = {}) {
        throw new SyntaxError(`Function not implemented`);
    }
    makeUrl(urlobj, options, optionsRuntime) {
        throw new SyntaxError(`Function not implemented`);
    }
    parseUrl(url, options) {
        throw new SyntaxError(`Function not implemented`);
    }
    getStatic() {
        // @ts-ignore
        return this.__proto__.constructor;
    }
    get IDKEY() {
        let key = this.getStatic().IDKEY;
        if (typeof key != 'string' || !key) {
            throw new SyntaxError(`IDKEY not implemented`);
        }
        return key;
    }
    _pathNovelID(novel, optionsRuntime) {
        return novel.url_data.novel_id;
    }
    getPathNovel(PATH_NOVEL_MAIN, novel, optionsRuntime) {
        let name;
        let novel_id = this._pathNovelID(novel, optionsRuntime);
        if (optionsRuntime.pathNovelStyle) {
            if (optionsRuntime.pathNovelStyle == 1 /* NOVELID */) {
                name = novel_id;
            }
        }
        if (name == null) {
            name = `${this.trimFilenameNovel(novel.novel_title)}_(${novel_id})`;
        }
        return path.join(PATH_NOVEL_MAIN, name);
    }
    /**
     * 如果已經下載過 則試圖從 README.md 內讀取缺漏的下載設定
     *
     * @private
     */
    _loadExistsConf(inputUrl, optionsRuntime, novel, path_novel) {
        let file = path.resolve(path_novel, 'README.md');
        if (fs.pathExistsSync(file)) {
            let md = fs.readFileSync(file).toString();
            let conf = node_novel_info_1.default.parse(md, {
                lowCheckLevel: true,
                throw: false,
            });
            log_1.consoleDebug.debug('檢查 README.md 是否存在下載設定');
            if (conf && conf.options) {
                if (conf.options.downloadOptions || conf.options.downloadoptions) {
                    log_1.consoleDebug.debug('載入並且合併已存在的設定');
                    Object.entries(conf.options.downloadOptions || conf.options.downloadoptions)
                        .forEach(function ([k, v]) {
                        if (optionsRuntime[k] == null) {
                            optionsRuntime[k] = v;
                        }
                    });
                }
            }
        }
    }
    getOutputDir(options, novelName) {
        options = Object.assign({}, this.optionsInit, options);
        if (!options.outputDir) {
            throw new ReferenceError(`options: outputDir is not set`);
        }
        let p = path.join(options.outputDir, options.disableOutputDirPrefix ? '' : this.IDKEY);
        if (!path.isAbsolute(p)) {
            p = path.join(options.cwd, p);
        }
        _root_1.default.disablePaths.concat(__dirname).forEach(function (dir) {
            if (p.indexOf(__dirname) == 0) {
                throw new ReferenceError(`path not allow "${p}"`);
            }
        });
        if (typeof novelName == 'string' || novelName) {
            if (!novelName) {
                throw new ReferenceError();
            }
            p = path.join(p, novelName);
        }
        options = this._fixOptionsRuntime(options);
        return [p, options];
    }
    _fixOptionsRuntime(optionsRuntime) {
        optionsRuntime[exports.SYMBOL_CACHE] = (optionsRuntime[exports.SYMBOL_CACHE] || {});
        optionsRuntime.startIndex = optionsRuntime.startIndex || 0;
        // @ts-ignore
        optionsRuntime.optionsJSDOM = jsdom_1.createOptionsJSDOM(optionsRuntime.optionsJSDOM);
        if (optionsRuntime.debugLog != null) {
            optionsRuntime.debugLog = !!optionsRuntime.debugLog;
        }
        return optionsRuntime;
    }
    trimFilenameChapter(name) {
        return this.trimFilename(name);
    }
    trimFilenameVolume(name) {
        return this.trimFilename(name);
    }
    trimFilenameNovel(name) {
        return this.trimFilename(name);
    }
    trimFilename(name) {
        return util_1.trimFilename(util_2._fixVolumeChapterName(name));
    }
    trimTag(tag) {
        return tag
            .replace(/[\[\]\/\\]/g, (s) => {
            return StrUtil.toFullWidth(s);
        });
    }
    _exportDownloadOptions(optionsRuntime) {
        return void (0);
    }
    _handleDataForStringify(...argv) {
        // @ts-ignore
        let mdconf = node_novel_info_1._handleDataForStringify(...argv);
        if (mdconf.novel) {
            let bool;
            if (mdconf.novel.tags && Array.isArray(mdconf.novel.tags)) {
                bool = [
                    '書籍化',
                    '书籍化',
                    '文庫化',
                    '文库化',
                ].some(v => {
                    return mdconf.novel.tags.includes(v);
                });
                if (bool) {
                    mdconf.novel.novel_status = (mdconf.novel.novel_status | 0) | const_1.EnumNovelStatus.P_BOOK;
                }
            }
            if (mdconf.novel.status) {
                bool = [
                    '完結済',
                    '完結',
                    '已完結',
                    '已完成',
                    '完结済',
                    '完结',
                    '已完结',
                    '已完成',
                ].includes(mdconf.novel.status);
                if (bool) {
                    mdconf.novel.novel_status = (mdconf.novel.novel_status | 0) | const_1.EnumNovelStatus.AUTHOR_DONE;
                }
            }
        }
        return mdconf;
    }
    _saveReadme(optionsRuntime, options = {}, ...opts) {
        const self = this;
        if (util_2.isUndef(optionsRuntime)
            || util_2.isUndef(optionsRuntime[exports.SYMBOL_CACHE], {})
            || util_2.isUndef(optionsRuntime[exports.SYMBOL_CACHE].novel, {})
            || util_2.isUndef(optionsRuntime[exports.SYMBOL_CACHE].path_novel, '')) {
            throw new ReferenceError(`saveReadme`);
        }
        const novel = optionsRuntime[exports.SYMBOL_CACHE].novel;
        const path_novel = optionsRuntime[exports.SYMBOL_CACHE].path_novel;
        let mdconfig = this._handleDataForStringify({
            novel: {
                illust: '',
                title_zh1: '',
                illusts: [],
                publishers: [
                    self.IDKEY,
                ],
                tags: [
                    self.IDKEY,
                ],
                series: {
                    name: novel.novel_series_title || novel.novel_title || '',
                },
                novel_status: 0,
            },
            options,
            link: novel.link || [],
        }, novel, ...opts);
        let md = node_novel_info_1.default.stringify(mdconfig);
        let file = path.join(path_novel, `README.md`);
        log_1.consoleDebug.info(`[META]`, `save README.md`);
        return fs.outputFile(file, md)
            .then(function () {
            return {
                file,
                md,
            };
        });
    }
    createMainUrl(url, optionsRuntime) {
        let data = this.parseUrl(url);
        if (!data || !data.novel_id) {
            //console.log(data);
            throw new ReferenceError(JSON.stringify(data));
        }
        return this.makeUrl(data, true, optionsRuntime);
    }
    _createChapterUrl({ novel, volume, chapter, }, optionsRuntime) {
        // @ts-ignore
        return new jsdom_url_1.URL(chapter.chapter_url);
    }
    _fetchChapter(url, optionsRuntime, _cache_) {
        throw new SyntaxError(`Function not implemented`);
    }
    _parseChapter(dom, optionsRuntime, cache) {
        throw new SyntaxError(`Function not implemented`);
    }
    getExtraInfo(urlobj, optionsRuntime, data_meta, cache) {
        throw new SyntaxError(`Function not implemented`);
    }
    _checkExists(optionsRuntime, file) {
        if (!optionsRuntime.disableCheckExists && fs.existsSync(file)) {
            let txt = fs.readFileSync(file);
            if (txt.toString().replace(/^\s+|\s+$/g, '')) {
                return true;
            }
        }
        return false;
    }
    emit(event, eventName, ...argv) {
        let bool = event.emit(eventName, this, ...argv);
        return [event, bool];
    }
    _saveFile(opts) {
        return PromiseBluebird.resolve()
            .bind(this)
            .then(() => {
            let { file, context, optionsRuntime } = opts;
            if (optionsRuntime.lineBreakCrlf) {
                let txt1 = context.toString();
                if (crlf_normalize_1.R_CRLF.test(txt1)) {
                    let txt2 = crlf_normalize_1.crlf(txt1, crlf_normalize_1.CRLF);
                    if (txt1 !== txt2) {
                        context = txt2;
                    }
                    txt1 = null;
                    txt2 = null;
                }
            }
            return fs.outputFile(file, context)
                .then(r => {
                if (optionsRuntime.debugLog) {
                    let file2 = path.relative(optionsRuntime.outputDir, file);
                    log_1.consoleDebug.success(`[SAVE]`, file2);
                }
                return r;
            });
        });
    }
}
exports.NovelSite = NovelSite;
NovelSite.IDKEY = null;
exports.EnumPathNovelStyle = NovelSite.EnumPathNovelStyle;
const log_1 = require("../util/log");
(function (NovelSite) {
    let EnumPathNovelStyle;
    (function (EnumPathNovelStyle) {
        EnumPathNovelStyle[EnumPathNovelStyle["DEFAULT"] = 0] = "DEFAULT";
        EnumPathNovelStyle[EnumPathNovelStyle["NOVELID"] = 1] = "NOVELID";
    })(EnumPathNovelStyle = NovelSite.EnumPathNovelStyle || (NovelSite.EnumPathNovelStyle = {}));
})(NovelSite = exports.NovelSite || (exports.NovelSite = {}));
function staticImplements() {
    return (constructor) => { };
}
exports.staticImplements = staticImplements;
exports.default = NovelSite;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7O0dBRUc7O0FBRUgsb0RBQXNEO0FBbUM3Qyw0QkFuQ0Ysa0JBQWlCLENBbUNFO0FBbEMxQixxREFBcUQ7QUFFckQsNENBQTZDO0FBZ0NqQiwwQ0FBZTtBQS9CM0MseUNBQWdDO0FBQ2hDLCtCQUFnQztBQUVoQyx1Q0FBbUM7QUFHbkMsb0NBQXVIO0FBRTlHLDhCQUZBLDJCQUFtQixDQUVBO0FBQWtDLDZCQUZBLDBCQUFrQixDQUVBO0FBQ2hGLHFEQUFrRjtBQUtsRiwrQkFBZ0M7QUFDaEMsd0NBQTZDO0FBQzdDLG1EQUFvRDtBQUNwRCxvQ0FBcUM7QUFDckMscURBQTREO0FBRTVELG1DQUFtQztBQUNuQywwQ0FBMkM7QUFRbEMsd0JBQU07QUFQZixrQ0FBeUQ7QUFLekQsTUFBTSxDQUFDLEVBQUUsQ0FBQyxNQUFNLEdBQUcsY0FBYyxPQUFPLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQU01QyxRQUFBLFlBQVksR0FBRyxNQUFNLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0FBRWhELE1BQWEsU0FBUztJQU9yQixZQUFZLE9BQTJCLEVBQUUsR0FBRyxJQUFJO1FBRS9DLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUNmO1lBQ0MsTUFBTSxJQUFJLGNBQWMsQ0FBQyxlQUFlLENBQUMsQ0FBQztTQUMxQztRQUVELElBQUksQ0FBQyxXQUFXLEdBQUcsT0FBTyxDQUFDO1FBQzNCLElBQUksQ0FBQyxXQUFXLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsR0FBRyxJQUFJLE9BQU8sQ0FBQyxHQUFHLEVBQUUsQ0FBQztRQUU3RCxDQUFDLElBQUksQ0FBQyxlQUFlLEVBQUUsSUFBSSxDQUFDLFdBQVcsQ0FBQyxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLFdB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a0JBQWUsU0FBUyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDcmVhdGVkIGJ5IHVzZXIgb24gMjAxOC8yLzEwLzAxMC5cbiAqL1xuXG5pbXBvcnQgYmx1ZWJpcmREZWNvcmF0b3IgZnJvbSAnLi4vZGVjb3JhdG9yL2JsdWViaXJkJztcbi8vaW1wb3J0IGJsdWViaXJkRGVjb3JhdG9yIGZyb20gJ2JsdWViaXJkLWRlY29yYXRvcic7XG5cbmltcG9ydCBQcm9taXNlQmx1ZWJpcmQgPSByZXF1aXJlKCdibHVlYmlyZCcpO1xuaW1wb3J0IHsgVVJMIH0gZnJvbSAnanNkb20tdXJsJztcbmltcG9ydCBwYXRoID0gcmVxdWlyZSgndXBhdGgyJyk7XG5cbmltcG9ydCByb290UGF0aCBmcm9tIFwiLi4vLi4vX3Jvb3RcIjtcbmltcG9ydCB7IHJldHJ5UmVxdWVzdCB9IGZyb20gJy4uL2ZldGNoJztcblxuaW1wb3J0IHsgZGVmYXVsdEpTRE9NT3B0aW9ucywgSUZyb21VcmxPcHRpb25zLCBJT3B0aW9uc0pTRE9NLCBjcmVhdGVPcHRpb25zSlNET00sIElOb3ZlbE9wdGlvbnNKU0RPTSB9IGZyb20gJy4uL2pzZG9tJztcblxuZXhwb3J0IHsgZGVmYXVsdEpTRE9NT3B0aW9ucywgSUZyb21VcmxPcHRpb25zLCBJT3B0aW9uc0pTRE9NLCBjcmVhdGVPcHRpb25zSlNET00gfVxuaW1wb3J0IG5vdmVsSW5mbywgeyBJTWRjb25mTWV0YSwgX2hhbmRsZURhdGFGb3JTdHJpbmdpZnkgfSBmcm9tICdub2RlLW5vdmVsLWluZm8nO1xuXG5leHBvcnQgeyBJTWRjb25mTWV0YSB9XG5pbXBvcnQgeyBMYXp5Q29va2llLCBMYXp5Q29va2llSmFyIH0gZnJvbSAnanNkb20tZXh0cmEnO1xuXG5pbXBvcnQgZnMgPSByZXF1aXJlKCdmcy1leHRyYScpO1xuaW1wb3J0IHsgdHJpbUZpbGVuYW1lIH0gZnJvbSAnZnMtaWNvbnYvdXRpbCc7XG5pbXBvcnQgeyBjcmxmLCBDUkxGLCBSX0NSTEYgfSBmcm9tICdjcmxmLW5vcm1hbGl6ZSc7XG5pbXBvcnQgU3RyVXRpbCA9IHJlcXVpcmUoJ3N0ci11dGlsJyk7XG5pbXBvcnQgeyBFbnVtTm92ZWxTdGF0dXMgfSBmcm9tICdub2RlLW5vdmVsLWluZm8vbGliL2NvbnN0JztcblxuLy9pbXBvcnQgKiBhcyBtb21lbnQgZnJvbSAnbW9tZW50JztcbmltcG9ydCBtb21lbnQgPSByZXF1aXJlKCdtb21lbnQtdGltZXpvbmUnKTtcbmltcG9ydCB7IF9maXhWb2x1bWVDaGFwdGVyTmFtZSwgaXNVbmRlZiB9IGZyb20gJy4uL3V0aWwnO1xuXG5pbXBvcnQgRXZlbnRFbWl0dGVyID0gcmVxdWlyZSgnZXZlbnRzJyk7XG5pbXBvcnQgeyBJRG93bmxvYWRPcHRpb25zIH0gZnJvbSAnLi9kZW1vL2Jhc2UnO1xuXG5tb21lbnQuZm4udG9KU09OID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gdGhpcy5mb3JtYXQoKTsgfTtcblxuZXhwb3J0IHsgbW9tZW50IH07XG5cbmV4cG9ydCB7IGJsdWViaXJkRGVjb3JhdG9yLCBQcm9taXNlQmx1ZWJpcmQgfVxuXG5leHBvcnQgY29uc3QgU1lNQk9MX0NBQ0hFID0gU3ltYm9sLmZvcignY2FjaGUnKTtcblxuZXhwb3J0IGNsYXNzIE5vdmVsU2l0ZSBpbXBsZW1lbnRzIE5vdmVsU2l0ZS5JTm92ZWxTaXRlXG57XG5cdHB1YmxpYyBzdGF0aWMgcmVhZG9ubHkgSURLRVk6IHN0cmluZyA9IG51bGw7XG5cblx0cHVibGljIFBBVEhfTk9WRUxfTUFJTjogc3RyaW5nO1xuXHRwdWJsaWMgb3B0aW9uc0luaXQ/OiBOb3ZlbFNpdGUuSU9wdGlvbnM7XG5cblx0Y29uc3RydWN0b3Iob3B0aW9uczogTm92ZWxTaXRlLklPcHRpb25zLCAuLi5hcmd2KVxuXHR7XG5cdFx0aWYgKCF0aGlzLklES0VZKVxuXHRcdHtcblx0XHRcdHRocm93IG5ldyBSZWZlcmVuY2VFcnJvcihgSURLRVkgaXMgbnVsbGApO1xuXHRcdH1cblxuXHRcdHRoaXMub3B0aW9uc0luaXQgPSBvcHRpb25zO1xuXHRcdHRoaXMub3B0aW9uc0luaXQuY3dkID0gdGhpcy5vcHRpb25zSW5pdC5jd2QgfHwgcHJvY2Vzcy5jd2QoKTtcblxuXHRcdFt0aGlzLlBBVEhfTk9WRUxfTUFJTiwgdGhpcy5vcHRpb25zSW5pdF0gPSB0aGlzLmdldE91dHB1dERpcih0aGlzLm9wdGlvbnNJbml0KTtcblxuXHRcdGlmICh0aGlzLm9wdGlvbnNJbml0LmRlYnVnTG9nKVxuXHRcdHtcblx0XHRcdGNvbnNvbGVEZWJ1Zy5lbmFibGVkID0gdHJ1ZTtcblx0XHR9XG5cblx0XHR0aGlzLl9jb25zdHJ1Y3RvcihvcHRpb25zLCAuLi5hcmd2KTtcblx0fVxuXG5cdF9jb25zdHJ1Y3RvcihvcHRpb25zOiBOb3ZlbFNpdGUuSU9wdGlvbnMsIC4uLmFyZ3YpXG5cdHtcblx0XHRjb25zb2xlRGVidWcuZGVidWcoJ3Jvb3QuX2NvbnN0cnVjdG9yJyk7XG5cdH1cblxuXHRzdGF0aWMgY3JlYXRlKG9wdGlvbnM6IE5vdmVsU2l0ZS5JT3B0aW9ucywgLi4uYXJndilcblx0e1xuXHRcdHJldHVybiBuZXcgdGhpcyhvcHRpb25zLCAuLi5hcmd2KTtcblx0fVxuXG5cdHN0YXRpYyBjaGVjayh1cmw6IHN0cmluZyB8IFVSTCB8IE5vdmVsU2l0ZS5JUGFyc2VVcmwsIG9wdGlvbnM/KTogYm9vbGVhblxuXHR7XG5cdFx0cmV0dXJuIGZhbHNlO1xuXHR9XG5cblx0c2Vzc2lvbjxUID0gTm92ZWxTaXRlLklPcHRpb25zUnVudGltZT4ob3B0aW9uc1J1bnRpbWU6IFQgJiBOb3ZlbFNpdGUuSU9wdGlvbnNSdW50aW1lLCB1cmw/OiBVUkwpXG5cdHtcblx0XHRvcHRpb25zUnVudGltZS5vcHRpb25zSlNET00gPSBjcmVhdGVPcHRpb25zSlNET00ob3B0aW9uc1J1bnRpbWUub3B0aW9uc0pTRE9NKTtcblxuXHRcdGlmICh1cmwpXG5cdFx0e1xuXHRcdFx0b3B0aW9uc1J1bnRpbWVbU1lNQk9MX0NBQ0hFXS51cmwgPSB1cmw7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblxuXHRkb3dubG9hZCh1cmw6IHN0cmluZyB8IFVSTCwgb3B0aW9ucz86IE5vdmVsU2l0ZS5JRG93bmxvYWRPcHRpb25zKTogUHJvbWlzZUJsdWViaXJkPE5vdmVsU2l0ZS5JTm92ZWw+XG5cdHtcblx0XHR0aHJvdyBuZXcgU3ludGF4RXJyb3IoYEZ1bmN0aW9uIG5vdCBpbXBsZW1lbnRlZGApO1xuXHR9XG5cblx0Z2V0X3ZvbHVtZV9saXN0PFQgPSBOb3ZlbFNpdGUuSU9wdGlvbnNSdW50aW1lPih1cmw6IHN0cmluZyB8IFVSTCxcblx0XHRvcHRpb25zUnVudGltZTogUGFydGlhbDxUICYgTm92ZWxTaXRlLklEb3dubG9hZE9wdGlvbnM+ID0ge30sXG5cdCk6IFByb21pc2U8Tm92ZWxTaXRlLklOb3ZlbD5cblx0e1xuXHRcdHRocm93IG5ldyBTeW50YXhFcnJvcihgRnVuY3Rpb24gbm90IGltcGxlbWVudGVkYCk7XG5cdH1cblxuXHRtYWtlVXJsPFQgZXh0ZW5kcyBOb3ZlbFNpdGUuSU9wdGlvbnNSdW50aW1lPih1cmxvYmo6IE5vdmVsU2l0ZS5JUGFyc2VVcmwsIG9wdGlvbnM/LCBvcHRpb25zUnVudGltZT86IFQpOiBVUkxcblx0e1xuXHRcdHRocm93IG5ldyBTeW50YXhFcnJvcihgRnVuY3Rpb24gbm90IGltcGxlbWVudGVkYCk7XG5cdH1cblxuXHRwYXJzZVVybCh1cmw6IFVSTCB8IHN0cmluZywgb3B0aW9ucz8pOiBOb3ZlbFNpdGUuSVBhcnNlVXJsXG5cdHtcblx0XHR0aHJvdyBuZXcgU3ludGF4RXJyb3IoYEZ1bmN0aW9uIG5vdCBpbXBsZW1lbnRlZGApO1xuXHR9XG5cblx0Z2V0U3RhdGljPFQgPSB0eXBlb2YgTm92ZWxTaXRlPigpOiBUXG5cdHtcblx0XHQvLyBAdHMtaWdub3JlXG5cdFx0cmV0dXJuIHRoaXMuX19wcm90b19fLmNvbnN0cnVjdG9yO1xuXHR9XG5cblx0Z2V0IElES0VZKCk6IHN0cmluZ1xuXHR7XG5cdFx0bGV0IGtleSA9IHRoaXMuZ2V0U3RhdGljKCkuSURLRVk7XG5cblx0XHRpZiAodHlwZW9mIGtleSAhPSAnc3RyaW5nJyB8fCAha2V5KVxuXHRcdHtcblx0XHRcdHRocm93IG5ldyBTeW50YXhFcnJvcihgSURLRVkgbm90IGltcGxlbWVudGVkYCk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIGtleTtcblx0fVxuXG5cdHByb3RlY3RlZCBfcGF0aE5vdmVsSUQ8TiBleHRlbmRzIE5vdmVsU2l0ZS5JTm92ZWwsIFQgZXh0ZW5kcyBOb3ZlbFNpdGUuSU9wdGlvbnNSdW50aW1lPihub3ZlbDogTiwgb3B0aW9uc1J1bnRpbWU6IFQpXG5cdHtcblx0XHRyZXR1cm4gbm92ZWwudXJsX2RhdGEubm92ZWxfaWQ7XG5cdH1cblxuXHRnZXRQYXRoTm92ZWw8TiBleHRlbmRzIE5vdmVsU2l0ZS5JTm92ZWwsIFQgZXh0ZW5kcyBOb3ZlbFNpdGUuSU9wdGlvbnNSdW50aW1lPihQQVRIX05PVkVMX01BSU46IHN0cmluZyxcblx0XHRub3ZlbDogTixcblx0XHRvcHRpb25zUnVudGltZTogVCxcblx0KVxuXHR7XG5cdFx0bGV0IG5hbWU6IHN0cmluZztcblxuXHRcdGxldCBub3ZlbF9pZCA9IHRoaXMuX3BhdGhOb3ZlbElEKG5vdmVsLCBvcHRpb25zUnVudGltZSk7XG5cblx0XHRpZiAob3B0aW9uc1J1bnRpbWUucGF0aE5vdmVsU3R5bGUpXG5cdFx0e1xuXHRcdFx0aWYgKG9wdGlvbnNSdW50aW1lLnBhdGhOb3ZlbFN0eWxlID09IE5vdmVsU2l0ZS5FbnVtUGF0aE5vdmVsU3R5bGUuTk9WRUxJRClcblx0XHRcdHtcblx0XHRcdFx0bmFtZSA9IG5vdmVsX2lkO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdGlmIChuYW1lID09IG51bGwpXG5cdFx0e1xuXHRcdFx0bmFtZSA9IGAke3RoaXMudHJpbUZpbGVuYW1lTm92ZWwobm92ZWwubm92ZWxfdGl0bGUpfV8oJHtub3ZlbF9pZH0pYFxuXHRcdH1cblxuXHRcdHJldHVybiBwYXRoLmpvaW4oUEFUSF9OT1ZFTF9NQUlOLCBuYW1lKTtcblx0fVxuXG5cdC8qKlxuXHQgKiDlpoLmnpzlt7LntpPkuIvovInpgY4g5YmH6Kmm5ZyW5b6eIFJFQURNRS5tZCDlhaforoDlj5bnvLrmvI/nmoTkuIvovInoqK3lrppcblx0ICpcblx0ICogQHByaXZhdGVcblx0ICovXG5cdF9sb2FkRXhpc3RzQ29uZjxULCBOIGV4dGVuZHMgTm92ZWxTaXRlLklOb3ZlbD4oaW5wdXRVcmwsIG9wdGlvbnNSdW50aW1lOiBULCBub3ZlbDogTiwgcGF0aF9ub3ZlbDogc3RyaW5nKVxuXHR7XG5cdFx0bGV0IGZpbGUgPSBwYXRoLnJlc29sdmUocGF0aF9ub3ZlbCwgJ1JFQURNRS5tZCcpO1xuXG5cdFx0aWYgKGZzLnBhdGhFeGlzdHNTeW5jKGZpbGUpKVxuXHRcdHtcblx0XHRcdGxldCBtZCA9IGZzLnJlYWRGaWxlU3luYyhmaWxlKS50b1N0cmluZygpO1xuXG5cdFx0XHRsZXQgY29uZiA9IG5vdmVsSW5mby5wYXJzZShtZCwge1xuXHRcdFx0XHRsb3dDaGVja0xldmVsOiB0cnVlLFxuXHRcdFx0XHR0aHJvdzogZmFsc2UsXG5cdFx0XHR9KTtcblxuXHRcdFx0Y29uc29sZURlYnVnLmRlYnVnKCfmqqLmn6UgUkVBRE1FLm1kIOaYr+WQpuWtmOWcqOS4i+i8ieioreWumicpO1xuXG5cdFx0XHRpZiAoY29uZiAmJiBjb25mLm9wdGlvbnMpXG5cdFx0XHR7XG5cdFx0XHRcdGlmIChjb25mLm9wdGlvbnMuZG93bmxvYWRPcHRpb25zIHx8IGNvbmYub3B0aW9ucy5kb3dubG9hZG9wdGlvbnMpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRjb25zb2xlRGVidWcuZGVidWcoJ+i8ieWFpeS4puS4lOWQiOS9teW3suWtmOWcqOeahOioreWumicpO1xuXG5cdFx0XHRcdFx0T2JqZWN0LmVudHJpZXMoY29uZi5vcHRpb25zLmRvd25sb2FkT3B0aW9ucyB8fCBjb25mLm9wdGlvbnMuZG93bmxvYWRvcHRpb25zKVxuXHRcdFx0XHRcdFx0LmZvckVhY2goZnVuY3Rpb24gKFtrLCB2XSlcblx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0aWYgKG9wdGlvbnNSdW50aW1lW2tdID09IG51bGwpXG5cdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHRvcHRpb25zUnVudGltZVtrXSA9IHY7XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdH0pXG5cdFx0XHRcdFx0O1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0Z2V0T3V0cHV0RGlyPFQ+KG9wdGlvbnM/OiBUICYgTm92ZWxTaXRlLklPcHRpb25zLCBub3ZlbE5hbWU/OiBzdHJpbmcpOiBbc3RyaW5nLCBUICYgTm92ZWxTaXRlLklPcHRpb25zXVxuXHR7XG5cdFx0b3B0aW9ucyA9IE9iamVjdC5hc3NpZ24oe30sIHRoaXMub3B0aW9uc0luaXQsIG9wdGlvbnMpO1xuXG5cdFx0aWYgKCFvcHRpb25zLm91dHB1dERpcilcblx0XHR7XG5cdFx0XHR0aHJvdyBuZXcgUmVmZXJlbmNlRXJyb3IoYG9wdGlvbnM6IG91dHB1dERpciBpcyBub3Qgc2V0YCk7XG5cdFx0fVxuXG5cdFx0bGV0IHAgPSBwYXRoLmpvaW4ob3B0aW9ucy5vdXRwdXREaXIsIG9wdGlvbnMuZGlzYWJsZU91dHB1dERpclByZWZpeCA/ICcnIDogdGhpcy5JREtFWSk7XG5cblx0XHRpZiAoIXBhdGguaXNBYnNvbHV0ZShwKSlcblx0XHR7XG5cdFx0XHRwID0gcGF0aC5qb2luKG9wdGlvbnMuY3dkLCBwKTtcblx0XHR9XG5cblx0XHRyb290UGF0aC5kaXNhYmxlUGF0aHMuY29uY2F0KF9fZGlybmFtZSkuZm9yRWFjaChmdW5jdGlvbiAoZGlyKVxuXHRcdHtcblx0XHRcdGlmIChwLmluZGV4T2YoX19kaXJuYW1lKSA9PSAwKVxuXHRcdFx0e1xuXHRcdFx0XHR0aHJvdyBuZXcgUmVmZXJlbmNlRXJyb3IoYHBhdGggbm90IGFsbG93IFwiJHtwfVwiYClcblx0XHRcdH1cblx0XHR9KTtcblxuXHRcdGlmICh0eXBlb2Ygbm92ZWxOYW1lID09ICdzdHJpbmcnIHx8IG5vdmVsTmFtZSlcblx0XHR7XG5cdFx0XHRpZiAoIW5vdmVsTmFtZSlcblx0XHRcdHtcblx0XHRcdFx0dGhyb3cgbmV3IFJlZmVyZW5jZUVycm9yKCk7XG5cdFx0XHR9XG5cblx0XHRcdHAgPSBwYXRoLmpvaW4ocCwgbm92ZWxOYW1lKTtcblx0XHR9XG5cblx0XHRvcHRpb25zID0gdGhpcy5fZml4T3B0aW9uc1J1bnRpbWUob3B0aW9ucyk7XG5cblx0XHRyZXR1cm4gW3AsIG9wdGlvbnNdO1xuXHR9XG5cblx0cHJvdGVjdGVkIF9maXhPcHRpb25zUnVudGltZTxUID0gTm92ZWxTaXRlLklPcHRpb25zUnVudGltZT4ob3B0aW9uc1J1bnRpbWU6IFQgJiBOb3ZlbFNpdGUuSU9wdGlvbnNSdW50aW1lKTogVCAmIE5vdmVsU2l0ZS5JT3B0aW9uc1J1bnRpbWVcblx0e1xuXHRcdG9wdGlvbnNSdW50aW1lW1NZTUJPTF9DQUNIRV0gPSAob3B0aW9uc1J1bnRpbWVbU1lNQk9MX0NBQ0hFXSB8fCB7fSkgYXMge1xuXHRcdFx0dXJsPzogVVJMLFxuXHRcdFx0cGF0aF9ub3ZlbD86IHN0cmluZyxcblx0XHRcdG5vdmVsPzogTm92ZWxTaXRlLklOb3ZlbCxcblx0XHR9O1xuXG5cdFx0b3B0aW9uc1J1bnRpbWUuc3RhcnRJbmRleCA9IG9wdGlvbnNSdW50aW1lLnN0YXJ0SW5kZXggfHwgMDtcblxuXHRcdC8vIEB0cy1pZ25vcmVcblx0XHRvcHRpb25zUnVudGltZS5vcHRpb25zSlNET00gPSBjcmVhdGVPcHRpb25zSlNET00ob3B0aW9uc1J1bnRpbWUub3B0aW9uc0pTRE9NKTtcblxuXG5cdFx0aWYgKG9wdGlvbnNSdW50aW1lLmRlYnVnTG9nICE9IG51bGwpXG5cdFx0e1xuXHRcdFx0b3B0aW9uc1J1bnRpbWUuZGVidWdMb2cgPSAhIW9wdGlvbnNSdW50aW1lLmRlYnVnTG9nO1xuXHRcdH1cblxuXHRcdHJldHVybiBvcHRpb25zUnVudGltZTtcblx0fVxuXG5cdHRyaW1GaWxlbmFtZUNoYXB0ZXIobmFtZSk6IHN0cmluZ1xuXHR7XG5cdFx0cmV0dXJuIHRoaXMudHJpbUZpbGVuYW1lKG5hbWUpO1xuXHR9XG5cblx0dHJpbUZpbGVuYW1lVm9sdW1lKG5hbWUpOiBzdHJpbmdcblx0e1xuXHRcdHJldHVybiB0aGlzLnRyaW1GaWxlbmFtZShuYW1lKTtcblx0fVxuXG5cdHRyaW1GaWxlbmFtZU5vdmVsKG5hbWUpOiBzdHJpbmdcblx0e1xuXHRcdHJldHVybiB0aGlzLnRyaW1GaWxlbmFtZShuYW1lKTtcblx0fVxuXG5cdHRyaW1GaWxlbmFtZShuYW1lKTogc3RyaW5nXG5cdHtcblx0XHRyZXR1cm4gdHJpbUZpbGVuYW1lKF9maXhWb2x1bWVDaGFwdGVyTmFtZShuYW1lKSk7XG5cdH1cblxuXHR0cmltVGFnKHRhZyk6IHN0cmluZ1xuXHR7XG5cdFx0cmV0dXJuICh0YWcgYXMgc3RyaW5nKVxuXHRcdFx0LnJlcGxhY2UoL1tcXFtcXF1cXC9cXFxcXS9nLCAocykgPT5cblx0XHRcdHtcblx0XHRcdFx0cmV0dXJuIFN0clV0aWwudG9GdWxsV2lkdGgocylcblx0XHRcdH0pXG5cdFx0XHQ7XG5cdH1cblxuXHRwcm90ZWN0ZWQgX2V4cG9ydERvd25sb2FkT3B0aW9uczxUID0gSU9wdGlvbnNSdW50aW1lPihvcHRpb25zUnVudGltZT86IFQgJiBJT3B0aW9uc1J1bnRpbWUpOiB1bmtub3duXG5cdHtcblx0XHRyZXR1cm4gdm9pZCAoMCk7XG5cdH1cblxuXHRwcm90ZWN0ZWQgX2hhbmRsZURhdGFGb3JTdHJpbmdpZnkoLi4uYXJndik6IElNZGNvbmZNZXRhXG5cdHtcblx0XHQvLyBAdHMtaWdub3JlXG5cdFx0bGV0IG1kY29uZjogSU1kY29uZk1ldGEgPSBfaGFuZGxlRGF0YUZvclN0cmluZ2lmeSguLi5hcmd2KTtcblxuXHRcdGlmIChtZGNvbmYubm92ZWwpXG5cdFx0e1xuXHRcdFx0bGV0IGJvb2w6IGJvb2xlYW47XG5cblx0XHRcdGlmIChtZGNvbmYubm92ZWwudGFncyAmJiBBcnJheS5pc0FycmF5KG1kY29uZi5ub3ZlbC50YWdzKSlcblx0XHRcdHtcblx0XHRcdFx0Ym9vbCA9IFtcblx0XHRcdFx0XHQn5pu457GN5YyWJyxcblx0XHRcdFx0XHQn5Lmm57GN5YyWJyxcblx0XHRcdFx0XHQn5paH5bqr5YyWJyxcblx0XHRcdFx0XHQn5paH5bqT5YyWJyxcblx0XHRcdFx0XS5zb21lKHYgPT5cblx0XHRcdFx0e1xuXHRcdFx0XHRcdHJldHVybiBtZGNvbmYubm92ZWwudGFncy5pbmNsdWRlcyh2KVxuXHRcdFx0XHR9KTtcblxuXHRcdFx0XHRpZiAoYm9vbClcblx0XHRcdFx0e1xuXHRcdFx0XHRcdG1kY29uZi5ub3ZlbC5ub3ZlbF9zdGF0dXMgPSAobWRjb25mLm5vdmVsLm5vdmVsX3N0YXR1cyB8IDApIHwgRW51bU5vdmVsU3RhdHVzLlBfQk9PSztcblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHRpZiAobWRjb25mLm5vdmVsLnN0YXR1cylcblx0XHRcdHtcblx0XHRcdFx0Ym9vbCA9IFtcblx0XHRcdFx0XHQn5a6M57WQ5riIJyxcblx0XHRcdFx0XHQn5a6M57WQJyxcblx0XHRcdFx0XHQn5bey5a6M57WQJyxcblx0XHRcdFx0XHQn5bey5a6M5oiQJyxcblx0XHRcdFx0XHQn5a6M57uT5riIJyxcblx0XHRcdFx0XHQn5a6M57uTJyxcblx0XHRcdFx0XHQn5bey5a6M57uTJyxcblx0XHRcdFx0XHQn5bey5a6M5oiQJyxcblx0XHRcdFx0XS5pbmNsdWRlcyhtZGNvbmYubm92ZWwuc3RhdHVzKTtcblxuXHRcdFx0XHRpZiAoYm9vbClcblx0XHRcdFx0e1xuXHRcdFx0XHRcdG1kY29uZi5ub3ZlbC5ub3ZlbF9zdGF0dXMgPSAobWRjb25mLm5vdmVsLm5vdmVsX3N0YXR1cyB8IDApIHwgRW51bU5vdmVsU3RhdHVzLkFVVEhPUl9ET05FO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0cmV0dXJuIG1kY29uZjtcblx0fVxuXG5cdHByb3RlY3RlZCBfc2F2ZVJlYWRtZShvcHRpb25zUnVudGltZT86IElPcHRpb25zUnVudGltZSwgb3B0aW9ucyA9IHt9LCAuLi5vcHRzKVxuXHR7XG5cdFx0Y29uc3Qgc2VsZiA9IHRoaXM7XG5cblx0XHRpZiAoaXNVbmRlZihvcHRpb25zUnVudGltZSlcblx0XHRcdHx8IGlzVW5kZWYob3B0aW9uc1J1bnRpbWVbU1lNQk9MX0NBQ0hFXSwge30pXG5cblx0XHRcdHx8IGlzVW5kZWYob3B0aW9uc1J1bnRpbWVbU1lNQk9MX0NBQ0hFXS5ub3ZlbCwge30pXG5cdFx0XHR8fCBpc1VuZGVmKG9wdGlvbnNSdW50aW1lW1NZTUJPTF9DQUNIRV0ucGF0aF9ub3ZlbCwgJycpXG5cdFx0KVxuXHRcdHtcblx0XHRcdHRocm93IG5ldyBSZWZlcmVuY2VFcnJvcihgc2F2ZVJlYWRtZWApO1xuXHRcdH1cblxuXHRcdGNvbnN0IG5vdmVsID0gb3B0aW9uc1J1bnRpbWVbU1lNQk9MX0NBQ0hFXS5ub3ZlbDtcblx0XHRjb25zdCBwYXRoX25vdmVsID0gb3B0aW9uc1J1bnRpbWVbU1lNQk9MX0NBQ0hFXS5wYXRoX25vdmVsO1xuXG5cdFx0bGV0IG1kY29uZmlnID0gdGhpcy5faGFuZGxlRGF0YUZvclN0cmluZ2lmeSh7XG5cdFx0XHRub3ZlbDoge1xuXHRcdFx0XHRpbGx1c3Q6ICcnLFxuXHRcdFx0XHR0aXRsZV96aDE6ICcnLFxuXHRcdFx0XHRpbGx1c3RzOiBbXSxcblx0XHRcdFx0cHVibGlzaGVyczogW1xuXHRcdFx0XHRcdHNlbGYuSURLRVksXG5cdFx0XHRcdF0sXG5cdFx0XHRcdHRhZ3M6IFtcblx0XHRcdFx0XHRzZWxmLklES0VZLFxuXHRcdFx0XHRdLFxuXHRcdFx0XHRzZXJpZXM6IHtcblx0XHRcdFx0XHRuYW1lOiBub3ZlbC5ub3ZlbF9zZXJpZXNfdGl0bGUgfHwgbm92ZWwubm92ZWxfdGl0bGUgfHwgJycsXG5cdFx0XHRcdH0sXG5cdFx0XHRcdG5vdmVsX3N0YXR1czogMCxcblx0XHRcdH0sXG5cdFx0XHRvcHRpb25zLFxuXG5cdFx0XHRsaW5rOiBub3ZlbC5saW5rIHx8IFtdLFxuXHRcdH0sIG5vdmVsLCAuLi5vcHRzKTtcblxuXHRcdGxldCBtZCA9IG5vdmVsSW5mby5zdHJpbmdpZnkobWRjb25maWcpO1xuXG5cdFx0bGV0IGZpbGUgPSBwYXRoLmpvaW4ocGF0aF9ub3ZlbCwgYFJFQURNRS5tZGApO1xuXG5cdFx0Y29uc29sZURlYnVnLmluZm8oYFtNRVRBXWAsIGBzYXZlIFJFQURNRS5tZGApO1xuXG5cdFx0cmV0dXJuIGZzLm91dHB1dEZpbGUoZmlsZSwgbWQpXG5cdFx0XHQudGhlbihmdW5jdGlvbiAoKVxuXHRcdFx0e1xuXHRcdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHRcdGZpbGUsXG5cdFx0XHRcdFx0bWQsXG5cdFx0XHRcdH07XG5cdFx0XHR9KVxuXHRcdFx0O1xuXHR9XG5cblx0Y3JlYXRlTWFpblVybDxUID0gSU9wdGlvbnNSdW50aW1lPih1cmw6IHN0cmluZyB8IFVSTCwgb3B0aW9uc1J1bnRpbWU/OiBUICYgSU9wdGlvbnNSdW50aW1lKTogVVJMXG5cdHtcblx0XHRsZXQgZGF0YSA9IHRoaXMucGFyc2VVcmwodXJsKTtcblxuXHRcdGlmICghZGF0YSB8fCAhZGF0YS5ub3ZlbF9pZClcblx0XHR7XG5cdFx0XHQvL2NvbnNvbGUubG9nKGRhdGEpO1xuXG5cdFx0XHR0aHJvdyBuZXcgUmVmZXJlbmNlRXJyb3IoSlNPTi5zdHJpbmdpZnkoZGF0YSkpO1xuXHRcdH1cblxuXHRcdHJldHVybiB0aGlzLm1ha2VVcmwoZGF0YSwgdHJ1ZSwgb3B0aW9uc1J1bnRpbWUpO1xuXHR9XG5cblx0cHJvdGVjdGVkIF9jcmVhdGVDaGFwdGVyVXJsPFQgPSBJT3B0aW9uc1J1bnRpbWU+KHtcblx0XHRub3ZlbCxcblx0XHR2b2x1bWUsXG5cdFx0Y2hhcHRlcixcblx0fToge1xuXHRcdG5vdmVsOiBOb3ZlbFNpdGUuSU5vdmVsLFxuXHRcdHZvbHVtZTogTm92ZWxTaXRlLklWb2x1bWUsXG5cdFx0Y2hhcHRlcjogTm92ZWxTaXRlLklDaGFwdGVyLFxuXHR9LCBvcHRpb25zUnVudGltZT86IFQgJiBJT3B0aW9uc1J1bnRpbWUpOiBVUkxcblx0e1xuXHRcdC8vIEB0cy1pZ25vcmVcblx0XHRyZXR1cm4gbmV3IFVSTChjaGFwdGVyLmNoYXB0ZXJfdXJsKTtcblx0fVxuXG5cdHByb3RlY3RlZCBfZmV0Y2hDaGFwdGVyPFQ+KHVybDogVVJMLCBvcHRpb25zUnVudGltZTogVCAmIElPcHRpb25zUnVudGltZSwgX2NhY2hlXzoge1xuXHRcdG5vdmVsOiBJTm92ZWwsXG5cdH0pXG5cdHtcblx0XHR0aHJvdyBuZXcgU3ludGF4RXJyb3IoYEZ1bmN0aW9uIG5vdCBpbXBsZW1lbnRlZGApO1xuXHR9XG5cblx0cHJvdGVjdGVkIF9wYXJzZUNoYXB0ZXI8VD4oZG9tLCBvcHRpb25zUnVudGltZTogVCAmIElPcHRpb25zUnVudGltZSwgY2FjaGU6IHtcblx0XHRmaWxlOiBzdHJpbmcsXG5cdFx0bm92ZWw6IE5vdmVsU2l0ZS5JTm92ZWwsXG5cdFx0dm9sdW1lOiBOb3ZlbFNpdGUuSVZvbHVtZSxcblx0XHRjaGFwdGVyOiBOb3ZlbFNpdGUuSUNoYXB0ZXIsXG5cdH0pXG5cdHtcblx0XHR0aHJvdyBuZXcgU3ludGF4RXJyb3IoYEZ1bmN0aW9uIG5vdCBpbXBsZW1lbnRlZGApO1xuXHR9XG5cblx0Z2V0RXh0cmFJbmZvPFQsIE0gZXh0ZW5kcyBQYXJ0aWFsPElOb3ZlbCAmIElNZGNvbmZNZXRhPiwgQyBleHRlbmRzIHVua25vd24+KHVybG9iajogTm92ZWxTaXRlLklQYXJzZVVybCxcblx0XHRvcHRpb25zUnVudGltZTogVCAmIElPcHRpb25zUnVudGltZSxcblx0XHRkYXRhX21ldGE/OiBNLFxuXHRcdGNhY2hlPzogQyxcblx0KTogUHJvbWlzZUJsdWViaXJkPE0+XG5cdHtcblx0XHR0aHJvdyBuZXcgU3ludGF4RXJyb3IoYEZ1bmN0aW9uIG5vdCBpbXBsZW1lbnRlZGApO1xuXHR9XG5cblx0cHJvdGVjdGVkIF9jaGVja0V4aXN0cyhvcHRpb25zUnVudGltZTogSU9wdGlvbnNSdW50aW1lLCBmaWxlOiBzdHJpbmcpOiBib29sZWFuXG5cdHtcblx0XHRpZiAoIW9wdGlvbnNSdW50aW1lLmRpc2FibGVDaGVja0V4aXN0cyAmJiBmcy5leGlzdHNTeW5jKGZpbGUpKVxuXHRcdHtcblx0XHRcdGxldCB0eHQgPSBmcy5yZWFkRmlsZVN5bmMoZmlsZSk7XG5cblx0XHRcdGlmICh0eHQudG9TdHJpbmcoKS5yZXBsYWNlKC9eXFxzK3xcXHMrJC9nLCAnJykpXG5cdFx0XHR7XG5cdFx0XHRcdHJldHVybiB0cnVlO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHJldHVybiBmYWxzZVxuXHR9XG5cblx0cHJvdGVjdGVkIGVtaXQoZXZlbnQ6IEV2ZW50RW1pdHRlciwgZXZlbnROYW1lOiBzdHJpbmcsIC4uLmFyZ3YpXG5cdHtcblx0XHRsZXQgYm9vbCA9IGV2ZW50LmVtaXQoZXZlbnROYW1lLCB0aGlzLCAuLi5hcmd2KTtcblx0XHRyZXR1cm4gW2V2ZW50LCBib29sXTtcblx0fVxuXG5cdF9zYXZlRmlsZTxUID0gTm92ZWxTaXRlLklPcHRpb25zUnVudGltZT4ob3B0czoge1xuXHRcdGZpbGU6IHN0cmluZyxcblx0XHRjb250ZXh0OiBzdHJpbmcgfCBCdWZmZXIsXG5cdFx0b3B0aW9uc1J1bnRpbWU6IFQgJiBOb3ZlbFNpdGUuSU9wdGlvbnNSdW50aW1lLFxuXHR9KVxuXHR7XG5cdFx0cmV0dXJuIFByb21pc2VCbHVlYmlyZC5yZXNvbHZlKClcblx0XHRcdC5iaW5kKHRoaXMpXG5cdFx0XHQudGhlbigoKSA9PiB7XG5cdFx0XHRcdGxldCB7IGZpbGUsIGNvbnRleHQsIG9wdGlvbnNSdW50aW1lIH0gPSBvcHRzO1xuXG5cdFx0XHRcdGlmIChvcHRpb25zUnVudGltZS5saW5lQnJlYWtDcmxmKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0bGV0IHR4dDEgPSBjb250ZXh0LnRvU3RyaW5nKCk7XG5cblx0XHRcdFx0XHRpZiAoUl9DUkxGLnRlc3QodHh0MSkpXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0bGV0IHR4dDIgPSBjcmxmKHR4dDEsIENSTEYpO1xuXG5cdFx0XHRcdFx0XHRpZiAodHh0MSAhPT0gdHh0Milcblx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0Y29udGV4dCA9IHR4dDI7XG5cdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdHR4dDEgPSBudWxsO1xuXHRcdFx0XHRcdFx0dHh0MiA9IG51bGw7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cblx0XHRcdFx0cmV0dXJuIGZzLm91dHB1dEZpbGUoZmlsZSwgY29udGV4dClcblx0XHRcdFx0XHQudGhlbihyID0+IHtcblxuXHRcdFx0XHRcdFx0aWYgKG9wdGlvbnNSdW50aW1lLmRlYnVnTG9nKVxuXHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRsZXQgZmlsZTIgPSBwYXRoLnJlbGF0aXZlKG9wdGlvbnNSdW50aW1lLm91dHB1dERpciwgZmlsZSk7XG5cblx0XHRcdFx0XHRcdFx0Y29uc29sZURlYnVnLnN1Y2Nlc3MoYFtTQVZFXWAsIGZpbGUyKTtcblx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0cmV0dXJuIHI7XG5cdFx0XHRcdFx0fSlcblx0XHRcdH0pXG5cdFx0O1xuXHR9XG5cbn1cblxuZXhwb3J0IGltcG9ydCBJT3B0aW9uc1J1bnRpbWUgPSBOb3ZlbFNpdGUuSU9wdGlvbnNSdW50aW1lO1xuZXhwb3J0IGltcG9ydCBJVm9sdW1lID0gTm92ZWxTaXRlLklWb2x1bWU7XG5leHBvcnQgaW1wb3J0IElDaGFwdGVyID0gTm92ZWxTaXRlLklDaGFwdGVyO1xuZXhwb3J0IGltcG9ydCBFbnVtUGF0aE5vdmVsU3R5bGUgPSBOb3ZlbFNpdGUuRW51bVBhdGhOb3ZlbFN0eWxlO1xuaW1wb3J0IHsgSU5vdmVsIH0gZnJvbSAnLi9zeW9zZXR1JztcbmltcG9ydCB7IGNvbnNvbGVEZWJ1ZyB9IGZyb20gJy4uL3V0aWwvbG9nJztcblxuZXhwb3J0IG5hbWVzcGFjZSBOb3ZlbFNpdGVcbntcblxuXHRleHBvcnQgdHlwZSBJRmlsZVByZWZpeE1vZGUgPSAwIHwgMSB8IDIgfCAzIHwgNCB8IDU7XG5cblx0ZXhwb3J0IHR5cGUgSU9wdGlvbnNQbHVzID0ge1xuXG5cdFx0ZGlzYWJsZU91dHB1dERpclByZWZpeD86IGJvb2xlYW4sXG5cblx0XHRub0RpclByZWZpeD86IGJvb2xlYW4sXG5cdFx0bm9EaXJQYWRlbmQ/OiBib29sZWFuLFxuXG5cdFx0bm9GaXJlUHJlZml4PzogYm9vbGVhbixcblx0XHRub0ZpbGVQYWRlbmQ/OiBib29sZWFuLFxuXG5cdFx0cmV0cnlEZWxheT86IG51bWJlcixcblx0XHRzdGFydEluZGV4PzogbnVtYmVyLFxuXG5cdFx0ZmlsZVByZWZpeE1vZGU/OiBudW1iZXIgfCBJRmlsZVByZWZpeE1vZGUsXG5cblx0XHRhbGxvd0VtcHR5Vm9sdW1lVGl0bGU/OiBib29sZWFuLFxuXG5cdFx0ZXZlbnQ/OiBFdmVudEVtaXR0ZXIsXG5cblx0XHQvKipcblx0XHQgKiDnlKjkvobnmbvlhaXnq5npu57nmoQgY29va2llcyBzZXNzaW9uXG5cdFx0ICovXG5cdFx0c2Vzc2lvbkRhdGE/OiB7XG5cdFx0XHRba2V5OiBzdHJpbmddOiBhbnksXG5cdFx0fSxcblxuXHRcdC8qKlxuXHRcdCAqIOWPquaKk+WPluWwj+iqqueahCBNRVRBIOizh+aWmVxuXHRcdCAqL1xuXHRcdGZldGNoTWV0YURhdGFPbmx5PzogYm9vbGVhbixcblxuXHRcdGRlYnVnTG9nPzogYm9vbGVhbixcblxuXHRcdGxpbmVCcmVha0NybGY/OiBib29sZWFuLFxuXG5cdFx0LyoqXG5cdFx0ICog5L+d55WZ5rOo6Z+z5qC85byPXG5cdFx0ICovXG5cdFx0a2VlcFJ1Ynk/OiBib29sZWFuO1xuXHRcdC8qKlxuXHRcdCAqIOS/neeVmeWFtuS7luagvOW8j1xuXHRcdCAqL1xuXHRcdGtlZXBGb3JtYXQ/OiBib29sZWFuO1xuXG5cdFx0LyoqXG5cdFx0ICog5Zyo5YWn5paH5Y6f5aeL5L2N572u5LiK5L+d55WZ5ZyW54mHXG5cdFx0ICovXG5cdFx0a2VlcEltYWdlPzogYm9vbGVhbjtcblxuXHR9XG5cblx0ZXhwb3J0IHR5cGUgSU9wdGlvbnMgPSB7XG5cblx0XHRvdXRwdXREaXI/OiBzdHJpbmcsXG5cdFx0Y3dkPzogc3RyaW5nLFxuXG5cdH0gJiBJT3B0aW9uc1BsdXM7XG5cblx0ZXhwb3J0IGNvbnN0IGVudW0gRW51bVBhdGhOb3ZlbFN0eWxlXG5cdHtcblx0XHRERUZBVUxUID0gMCxcblx0XHROT1ZFTElEID0gMSxcblx0fVxuXG5cdGV4cG9ydCB0eXBlIElEb3dubG9hZE9wdGlvbnMgPSB7XG5cblx0XHQvKipcblx0XHQgKiDlj6rnlKLnlJ/nm67pjITntZDmp4sg5LiN5LiL6LyJ5YWn5a65XG5cdFx0ICovXG5cdFx0ZGlzYWJsZURvd25sb2FkPzogYm9vbGVhbixcblx0XHRkaXNhYmxlQ2hlY2tFeGlzdHM/OiBib29sZWFuLFxuXG5cdFx0b3B0aW9uc0pTRE9NPzogSUZyb21VcmxPcHRpb25zICYgSU9wdGlvbnNKU0RPTSAmIHtcblx0XHRcdGNvb2tpZUphcj86IFBhcnRpYWw8TGF6eUNvb2tpZUphcj4sXG5cdFx0fSxcblxuXHRcdC8qKlxuXHRcdCAqIOioreWumuWwj+iqquizh+aWmeWkvuaoo+W8j1xuXHRcdCAqL1xuXHRcdHBhdGhOb3ZlbFN0eWxlPzogRW51bVBhdGhOb3ZlbFN0eWxlLFxuXG5cdH0gJiBJT3B0aW9uc1BsdXM7XG5cblx0ZXhwb3J0IHR5cGUgSU9wdGlvbnNSdW50aW1lID0gSU9wdGlvbnMgJiBJRG93bmxvYWRPcHRpb25zICYgSU9wdGlvbnNQbHVzO1xuXG5cdGV4cG9ydCBpbnRlcmZhY2UgSVBhcnNlVXJsXG5cdHtcblx0XHR1cmw/OiBVUkwgfCBzdHJpbmcsXG5cblx0XHRub3ZlbF9waWQ/LFxuXHRcdG5vdmVsX2lkPyxcblx0XHRjaGFwdGVyX2lkPyxcblxuXHRcdG5vdmVsX3IxOD8sXG5cblx0XHRba2V5OiBzdHJpbmddOiBhbnksXG5cdH1cblxuXHRleHBvcnQgaW50ZXJmYWNlIElDaGFwdGVyXG5cdHtcblx0XHRjaGFwdGVyX2luZGV4PzogbnVtYmVyIHwgc3RyaW5nLFxuXHRcdGNoYXB0ZXJfdGl0bGU6IHN0cmluZyxcblx0XHRjaGFwdGVyX2lkP1xuXHRcdGNoYXB0ZXJfdXJsP1xuXHRcdGNoYXB0ZXJfdXJsX2RhdGE/XG5cdFx0Y2hhcHRlcl9kYXRlPzogbW9tZW50Lk1vbWVudCxcblxuXHRcdGltZ3M/OiBzdHJpbmdbXSxcblxuXHRcdFtrZXk6IHN0cmluZ106IGFueSxcblx0fVxuXG5cdGV4cG9ydCBpbnRlcmZhY2UgSVZvbHVtZVxuXHR7XG5cdFx0dm9sdW1lX2luZGV4P1xuXHRcdHZvbHVtZV90aXRsZTogc3RyaW5nLFxuXHRcdGNoYXB0ZXJfbGlzdD86IElDaGFwdGVyW10sXG5cblx0XHRba2V5OiBzdHJpbmddOiBhbnksXG5cdH1cblxuXHRleHBvcnQgaW50ZXJmYWNlIElOb3ZlbFxuXHR7XG5cdFx0dXJsOiBVUkwgfCBzdHJpbmcsXG5cdFx0dXJsX2RhdGE6IElQYXJzZVVybCxcblxuXHRcdG5vdmVsX3RpdGxlOiBzdHJpbmcsXG5cdFx0bm92ZWxfYXV0aG9yPzogc3RyaW5nLFxuXG5cdFx0bm92ZWxfZGVzYz86IHN0cmluZyxcblx0XHRub3ZlbF9kYXRlPzogbW9tZW50Lk1vbWVudCxcblx0XHRub3ZlbF9wdWJsaXNoZXI/OiBzdHJpbmcsXG5cblx0XHRub3ZlbF9zZXJpZXNfdGl0bGU/OiBzdHJpbmcsXG5cblx0XHR2b2x1bWVfbGlzdDogSVZvbHVtZVtdLFxuXG5cdFx0Y2hlY2tkYXRlPzogbW9tZW50Lk1vbWVudCxcblxuXHRcdGltZ3M/OiBzdHJpbmdbXSxcblxuXHRcdFtrZXk6IHN0cmluZ106IGFueSxcblx0fVxuXG5cdGV4cG9ydCBpbnRlcmZhY2UgSU5vdmVsU2l0ZVN0YXRpYzxUPiBleHRlbmRzIFR5cGU8VCAmIE5vdmVsU2l0ZS5JTm92ZWxTaXRlPlxuXHR7XG5cdFx0SURLRVk6IHN0cmluZyxcblx0fVxuXG5cdGV4cG9ydCBpbnRlcmZhY2UgSU5vdmVsU2l0ZVxuXHR7XG5cdFx0ZG93bmxvYWQodXJsOiBzdHJpbmcgfCBVUkwsIG9wdGlvbnM/OiBJRG93bmxvYWRPcHRpb25zKTogUHJvbWlzZUJsdWViaXJkPE5vdmVsU2l0ZS5JTm92ZWw+O1xuXG5cdFx0bWFrZVVybCh1cmxvYmo6IE5vdmVsU2l0ZS5JUGFyc2VVcmwsIG9wdGlvbnM/KTogVVJMO1xuXG5cdFx0cGFyc2VVcmwodXJsOiBVUkwgfCBzdHJpbmcpOiBOb3ZlbFNpdGUuSVBhcnNlVXJsO1xuXHR9XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgVHlwZTxUPlxue1xuXHRuZXcob3B0aW9uczogTm92ZWxTaXRlLklPcHRpb25zLCAuLi5hcmdzOiBhbnlbXSk6IFQ7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzdGF0aWNJbXBsZW1lbnRzPFQ+KClcbntcblx0cmV0dXJuIChjb25zdHJ1Y3RvcjogVCkgPT4ge31cbn1cblxuZXhwb3J0IGRlZmF1bHQgTm92ZWxTaXRlO1xuIl19