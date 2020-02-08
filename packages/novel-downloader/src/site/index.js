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
//import { URL } from 'jsdom-url';
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
        if (optionsRuntime.keepImage == null) {
            optionsRuntime.keepImage = true;
        }
        if (optionsRuntime.keepRuby == null) {
            optionsRuntime.keepRuby = true;
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
        return new URL(chapter.chapter_url);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7O0dBRUc7O0FBRUgsb0RBQXNEO0FBbUM3Qyw0QkFuQ0Ysa0JBQWlCLENBbUNFO0FBbEMxQixxREFBcUQ7QUFFckQsNENBQTZDO0FBZ0NqQiwwQ0FBZTtBQS9CM0Msa0NBQWtDO0FBQ2xDLCtCQUFnQztBQUVoQyx1Q0FBbUM7QUFHbkMsb0NBQXVIO0FBRTlHLDhCQUZBLDJCQUFtQixDQUVBO0FBQWtDLDZCQUZBLDBCQUFrQixDQUVBO0FBQ2hGLHFEQUFrRjtBQUtsRiwrQkFBZ0M7QUFDaEMsd0NBQTZDO0FBQzdDLG1EQUFvRDtBQUNwRCxvQ0FBcUM7QUFDckMscURBQTREO0FBRTVELG1DQUFtQztBQUNuQywwQ0FBMkM7QUFRbEMsd0JBQU07QUFQZixrQ0FBeUQ7QUFLekQsTUFBTSxDQUFDLEVBQUUsQ0FBQyxNQUFNLEdBQUcsY0FBYyxPQUFPLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQU01QyxRQUFBLFlBQVksR0FBRyxNQUFNLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0FBRWhELE1BQWEsU0FBUztJQU9yQixZQUFZLE9BQTJCLEVBQUUsR0FBRyxJQUFJO1FBRS9DLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUNmO1lBQ0MsTUFBTSxJQUFJLGNBQWMsQ0FBQyxlQUFlLENBQUMsQ0FBQztTQUMxQztRQUVELElBQUksQ0FBQyxXQUFXLEdBQUcsT0FBTyxDQUFDO1FBQzNCLElBQUksQ0FBQyxXQUFXLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsR0FBRyxJQUFJLE9BQU8sQ0FBQyxHQUFHLEVBQUUsQ0FBQztRQUU3RCxDQUFDLElBQUksQ0FBQyxlQUFlLEVBQUUsSUFBSSxDQUFDLFdBQVcsQ0FBQyxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLFdB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QixLQUFsQiw0QkFBa0IsUUFJbkM7QUF3R0YsQ0FBQyxFQTNLZ0IsU0FBUyxHQUFULGlCQUFTLEtBQVQsaUJBQVMsUUEyS3pCO0FBT0QsU0FBZ0IsZ0JBQWdCO0lBRS9CLE9BQU8sQ0FBQyxXQUFjLEVBQUUsRUFBRSxHQUFFLENBQUMsQ0FBQTtBQUM5QixDQUFDO0FBSEQsNENBR0M7QUFFRCxrQkFBZSxTQUFTLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENyZWF0ZWQgYnkgdXNlciBvbiAyMDE4LzIvMTAvMDEwLlxuICovXG5cbmltcG9ydCBibHVlYmlyZERlY29yYXRvciBmcm9tICcuLi9kZWNvcmF0b3IvYmx1ZWJpcmQnO1xuLy9pbXBvcnQgYmx1ZWJpcmREZWNvcmF0b3IgZnJvbSAnYmx1ZWJpcmQtZGVjb3JhdG9yJztcblxuaW1wb3J0IFByb21pc2VCbHVlYmlyZCA9IHJlcXVpcmUoJ2JsdWViaXJkJyk7XG4vL2ltcG9ydCB7IFVSTCB9IGZyb20gJ2pzZG9tLXVybCc7XG5pbXBvcnQgcGF0aCA9IHJlcXVpcmUoJ3VwYXRoMicpO1xuXG5pbXBvcnQgcm9vdFBhdGggZnJvbSBcIi4uLy4uL19yb290XCI7XG5pbXBvcnQgeyByZXRyeVJlcXVlc3QgfSBmcm9tICcuLi9mZXRjaCc7XG5cbmltcG9ydCB7IGRlZmF1bHRKU0RPTU9wdGlvbnMsIElGcm9tVXJsT3B0aW9ucywgSU9wdGlvbnNKU0RPTSwgY3JlYXRlT3B0aW9uc0pTRE9NLCBJTm92ZWxPcHRpb25zSlNET00gfSBmcm9tICcuLi9qc2RvbSc7XG5cbmV4cG9ydCB7IGRlZmF1bHRKU0RPTU9wdGlvbnMsIElGcm9tVXJsT3B0aW9ucywgSU9wdGlvbnNKU0RPTSwgY3JlYXRlT3B0aW9uc0pTRE9NIH1cbmltcG9ydCBub3ZlbEluZm8sIHsgSU1kY29uZk1ldGEsIF9oYW5kbGVEYXRhRm9yU3RyaW5naWZ5IH0gZnJvbSAnbm9kZS1ub3ZlbC1pbmZvJztcblxuZXhwb3J0IHsgSU1kY29uZk1ldGEgfVxuaW1wb3J0IHsgTGF6eUNvb2tpZSwgTGF6eUNvb2tpZUphciB9IGZyb20gJ2pzZG9tLWV4dHJhJztcblxuaW1wb3J0IGZzID0gcmVxdWlyZSgnZnMtZXh0cmEnKTtcbmltcG9ydCB7IHRyaW1GaWxlbmFtZSB9IGZyb20gJ2ZzLWljb252L3V0aWwnO1xuaW1wb3J0IHsgY3JsZiwgQ1JMRiwgUl9DUkxGIH0gZnJvbSAnY3JsZi1ub3JtYWxpemUnO1xuaW1wb3J0IFN0clV0aWwgPSByZXF1aXJlKCdzdHItdXRpbCcpO1xuaW1wb3J0IHsgRW51bU5vdmVsU3RhdHVzIH0gZnJvbSAnbm9kZS1ub3ZlbC1pbmZvL2xpYi9jb25zdCc7XG5cbi8vaW1wb3J0ICogYXMgbW9tZW50IGZyb20gJ21vbWVudCc7XG5pbXBvcnQgbW9tZW50ID0gcmVxdWlyZSgnbW9tZW50LXRpbWV6b25lJyk7XG5pbXBvcnQgeyBfZml4Vm9sdW1lQ2hhcHRlck5hbWUsIGlzVW5kZWYgfSBmcm9tICcuLi91dGlsJztcblxuaW1wb3J0IEV2ZW50RW1pdHRlciA9IHJlcXVpcmUoJ2V2ZW50cycpO1xuaW1wb3J0IHsgSURvd25sb2FkT3B0aW9ucyB9IGZyb20gJy4vZGVtby9iYXNlJztcblxubW9tZW50LmZuLnRvSlNPTiA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuIHRoaXMuZm9ybWF0KCk7IH07XG5cbmV4cG9ydCB7IG1vbWVudCB9O1xuXG5leHBvcnQgeyBibHVlYmlyZERlY29yYXRvciwgUHJvbWlzZUJsdWViaXJkIH1cblxuZXhwb3J0IGNvbnN0IFNZTUJPTF9DQUNIRSA9IFN5bWJvbC5mb3IoJ2NhY2hlJyk7XG5cbmV4cG9ydCBjbGFzcyBOb3ZlbFNpdGUgaW1wbGVtZW50cyBOb3ZlbFNpdGUuSU5vdmVsU2l0ZVxue1xuXHRwdWJsaWMgc3RhdGljIHJlYWRvbmx5IElES0VZOiBzdHJpbmcgPSBudWxsO1xuXG5cdHB1YmxpYyBQQVRIX05PVkVMX01BSU46IHN0cmluZztcblx0cHVibGljIG9wdGlvbnNJbml0PzogTm92ZWxTaXRlLklPcHRpb25zO1xuXG5cdGNvbnN0cnVjdG9yKG9wdGlvbnM6IE5vdmVsU2l0ZS5JT3B0aW9ucywgLi4uYXJndilcblx0e1xuXHRcdGlmICghdGhpcy5JREtFWSlcblx0XHR7XG5cdFx0XHR0aHJvdyBuZXcgUmVmZXJlbmNlRXJyb3IoYElES0VZIGlzIG51bGxgKTtcblx0XHR9XG5cblx0XHR0aGlzLm9wdGlvbnNJbml0ID0gb3B0aW9ucztcblx0XHR0aGlzLm9wdGlvbnNJbml0LmN3ZCA9IHRoaXMub3B0aW9uc0luaXQuY3dkIHx8IHByb2Nlc3MuY3dkKCk7XG5cblx0XHRbdGhpcy5QQVRIX05PVkVMX01BSU4sIHRoaXMub3B0aW9uc0luaXRdID0gdGhpcy5nZXRPdXRwdXREaXIodGhpcy5vcHRpb25zSW5pdCk7XG5cblx0XHRpZiAodGhpcy5vcHRpb25zSW5pdC5kZWJ1Z0xvZylcblx0XHR7XG5cdFx0XHRjb25zb2xlRGVidWcuZW5hYmxlZCA9IHRydWU7XG5cdFx0fVxuXG5cdFx0dGhpcy5fY29uc3RydWN0b3Iob3B0aW9ucywgLi4uYXJndik7XG5cdH1cblxuXHRfY29uc3RydWN0b3Iob3B0aW9uczogTm92ZWxTaXRlLklPcHRpb25zLCAuLi5hcmd2KVxuXHR7XG5cdFx0Y29uc29sZURlYnVnLmRlYnVnKCdyb290Ll9jb25zdHJ1Y3RvcicpO1xuXHR9XG5cblx0c3RhdGljIGNyZWF0ZShvcHRpb25zOiBOb3ZlbFNpdGUuSU9wdGlvbnMsIC4uLmFyZ3YpXG5cdHtcblx0XHRyZXR1cm4gbmV3IHRoaXMob3B0aW9ucywgLi4uYXJndik7XG5cdH1cblxuXHRzdGF0aWMgY2hlY2sodXJsOiBzdHJpbmcgfCBVUkwgfCBOb3ZlbFNpdGUuSVBhcnNlVXJsLCBvcHRpb25zPyk6IGJvb2xlYW5cblx0e1xuXHRcdHJldHVybiBmYWxzZTtcblx0fVxuXG5cdHNlc3Npb248VCA9IE5vdmVsU2l0ZS5JT3B0aW9uc1J1bnRpbWU+KG9wdGlvbnNSdW50aW1lOiBUICYgTm92ZWxTaXRlLklPcHRpb25zUnVudGltZSwgdXJsPzogVVJMKVxuXHR7XG5cdFx0b3B0aW9uc1J1bnRpbWUub3B0aW9uc0pTRE9NID0gY3JlYXRlT3B0aW9uc0pTRE9NKG9wdGlvbnNSdW50aW1lLm9wdGlvbnNKU0RPTSk7XG5cblx0XHRpZiAodXJsKVxuXHRcdHtcblx0XHRcdG9wdGlvbnNSdW50aW1lW1NZTUJPTF9DQUNIRV0udXJsID0gdXJsO1xuXHRcdH1cblxuXHRcdHJldHVybiB0aGlzO1xuXHR9XG5cblx0ZG93bmxvYWQodXJsOiBzdHJpbmcgfCBVUkwsIG9wdGlvbnM/OiBOb3ZlbFNpdGUuSURvd25sb2FkT3B0aW9ucyk6IFByb21pc2VCbHVlYmlyZDxOb3ZlbFNpdGUuSU5vdmVsPlxuXHR7XG5cdFx0dGhyb3cgbmV3IFN5bnRheEVycm9yKGBGdW5jdGlvbiBub3QgaW1wbGVtZW50ZWRgKTtcblx0fVxuXG5cdGdldF92b2x1bWVfbGlzdDxUID0gTm92ZWxTaXRlLklPcHRpb25zUnVudGltZT4odXJsOiBzdHJpbmcgfCBVUkwsXG5cdFx0b3B0aW9uc1J1bnRpbWU6IFBhcnRpYWw8VCAmIE5vdmVsU2l0ZS5JRG93bmxvYWRPcHRpb25zPiA9IHt9LFxuXHQpOiBQcm9taXNlPE5vdmVsU2l0ZS5JTm92ZWw+XG5cdHtcblx0XHR0aHJvdyBuZXcgU3ludGF4RXJyb3IoYEZ1bmN0aW9uIG5vdCBpbXBsZW1lbnRlZGApO1xuXHR9XG5cblx0bWFrZVVybDxUIGV4dGVuZHMgTm92ZWxTaXRlLklPcHRpb25zUnVudGltZT4odXJsb2JqOiBOb3ZlbFNpdGUuSVBhcnNlVXJsLCBvcHRpb25zPywgb3B0aW9uc1J1bnRpbWU/OiBUKTogVVJMXG5cdHtcblx0XHR0aHJvdyBuZXcgU3ludGF4RXJyb3IoYEZ1bmN0aW9uIG5vdCBpbXBsZW1lbnRlZGApO1xuXHR9XG5cblx0cGFyc2VVcmwodXJsOiBVUkwgfCBzdHJpbmcsIG9wdGlvbnM/KTogTm92ZWxTaXRlLklQYXJzZVVybFxuXHR7XG5cdFx0dGhyb3cgbmV3IFN5bnRheEVycm9yKGBGdW5jdGlvbiBub3QgaW1wbGVtZW50ZWRgKTtcblx0fVxuXG5cdGdldFN0YXRpYzxUID0gdHlwZW9mIE5vdmVsU2l0ZT4oKTogVFxuXHR7XG5cdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdHJldHVybiB0aGlzLl9fcHJvdG9fXy5jb25zdHJ1Y3Rvcjtcblx0fVxuXG5cdGdldCBJREtFWSgpOiBzdHJpbmdcblx0e1xuXHRcdGxldCBrZXkgPSB0aGlzLmdldFN0YXRpYygpLklES0VZO1xuXG5cdFx0aWYgKHR5cGVvZiBrZXkgIT0gJ3N0cmluZycgfHwgIWtleSlcblx0XHR7XG5cdFx0XHR0aHJvdyBuZXcgU3ludGF4RXJyb3IoYElES0VZIG5vdCBpbXBsZW1lbnRlZGApO1xuXHRcdH1cblxuXHRcdHJldHVybiBrZXk7XG5cdH1cblxuXHRwcm90ZWN0ZWQgX3BhdGhOb3ZlbElEPE4gZXh0ZW5kcyBOb3ZlbFNpdGUuSU5vdmVsLCBUIGV4dGVuZHMgTm92ZWxTaXRlLklPcHRpb25zUnVudGltZT4obm92ZWw6IE4sIG9wdGlvbnNSdW50aW1lOiBUKVxuXHR7XG5cdFx0cmV0dXJuIG5vdmVsLnVybF9kYXRhLm5vdmVsX2lkO1xuXHR9XG5cblx0Z2V0UGF0aE5vdmVsPE4gZXh0ZW5kcyBOb3ZlbFNpdGUuSU5vdmVsLCBUIGV4dGVuZHMgTm92ZWxTaXRlLklPcHRpb25zUnVudGltZT4oUEFUSF9OT1ZFTF9NQUlOOiBzdHJpbmcsXG5cdFx0bm92ZWw6IE4sXG5cdFx0b3B0aW9uc1J1bnRpbWU6IFQsXG5cdClcblx0e1xuXHRcdGxldCBuYW1lOiBzdHJpbmc7XG5cblx0XHRsZXQgbm92ZWxfaWQgPSB0aGlzLl9wYXRoTm92ZWxJRChub3ZlbCwgb3B0aW9uc1J1bnRpbWUpO1xuXG5cdFx0aWYgKG9wdGlvbnNSdW50aW1lLnBhdGhOb3ZlbFN0eWxlKVxuXHRcdHtcblx0XHRcdGlmIChvcHRpb25zUnVudGltZS5wYXRoTm92ZWxTdHlsZSA9PSBOb3ZlbFNpdGUuRW51bVBhdGhOb3ZlbFN0eWxlLk5PVkVMSUQpXG5cdFx0XHR7XG5cdFx0XHRcdG5hbWUgPSBub3ZlbF9pZDtcblx0XHRcdH1cblx0XHR9XG5cblx0XHRpZiAobmFtZSA9PSBudWxsKVxuXHRcdHtcblx0XHRcdG5hbWUgPSBgJHt0aGlzLnRyaW1GaWxlbmFtZU5vdmVsKG5vdmVsLm5vdmVsX3RpdGxlKX1fKCR7bm92ZWxfaWR9KWBcblx0XHR9XG5cblx0XHRyZXR1cm4gcGF0aC5qb2luKFBBVEhfTk9WRUxfTUFJTiwgbmFtZSk7XG5cdH1cblxuXHQvKipcblx0ICog5aaC5p6c5bey57aT5LiL6LyJ6YGOIOWJh+ippuWcluW+niBSRUFETUUubWQg5YWn6K6A5Y+W57y65ryP55qE5LiL6LyJ6Kit5a6aXG5cdCAqXG5cdCAqIEBwcml2YXRlXG5cdCAqL1xuXHRfbG9hZEV4aXN0c0NvbmY8VCwgTiBleHRlbmRzIE5vdmVsU2l0ZS5JTm92ZWw+KGlucHV0VXJsLCBvcHRpb25zUnVudGltZTogVCwgbm92ZWw6IE4sIHBhdGhfbm92ZWw6IHN0cmluZylcblx0e1xuXHRcdGxldCBmaWxlID0gcGF0aC5yZXNvbHZlKHBhdGhfbm92ZWwsICdSRUFETUUubWQnKTtcblxuXHRcdGlmIChmcy5wYXRoRXhpc3RzU3luYyhmaWxlKSlcblx0XHR7XG5cdFx0XHRsZXQgbWQgPSBmcy5yZWFkRmlsZVN5bmMoZmlsZSkudG9TdHJpbmcoKTtcblxuXHRcdFx0bGV0IGNvbmYgPSBub3ZlbEluZm8ucGFyc2UobWQsIHtcblx0XHRcdFx0bG93Q2hlY2tMZXZlbDogdHJ1ZSxcblx0XHRcdFx0dGhyb3c6IGZhbHNlLFxuXHRcdFx0fSk7XG5cblx0XHRcdGNvbnNvbGVEZWJ1Zy5kZWJ1Zygn5qqi5p+lIFJFQURNRS5tZCDmmK/lkKblrZjlnKjkuIvovInoqK3lrponKTtcblxuXHRcdFx0aWYgKGNvbmYgJiYgY29uZi5vcHRpb25zKVxuXHRcdFx0e1xuXHRcdFx0XHRpZiAoY29uZi5vcHRpb25zLmRvd25sb2FkT3B0aW9ucyB8fCBjb25mLm9wdGlvbnMuZG93bmxvYWRvcHRpb25zKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0Y29uc29sZURlYnVnLmRlYnVnKCfovInlhaXkuKbkuJTlkIjkvbXlt7LlrZjlnKjnmoToqK3lrponKTtcblxuXHRcdFx0XHRcdE9iamVjdC5lbnRyaWVzKGNvbmYub3B0aW9ucy5kb3dubG9hZE9wdGlvbnMgfHwgY29uZi5vcHRpb25zLmRvd25sb2Fkb3B0aW9ucylcblx0XHRcdFx0XHRcdC5mb3JFYWNoKGZ1bmN0aW9uIChbaywgdl0pXG5cdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdGlmIChvcHRpb25zUnVudGltZVtrXSA9PSBudWxsKVxuXHRcdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdFx0b3B0aW9uc1J1bnRpbWVba10gPSB2O1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHR9KVxuXHRcdFx0XHRcdDtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdGdldE91dHB1dERpcjxUPihvcHRpb25zPzogVCAmIE5vdmVsU2l0ZS5JT3B0aW9ucywgbm92ZWxOYW1lPzogc3RyaW5nKTogW3N0cmluZywgVCAmIE5vdmVsU2l0ZS5JT3B0aW9uc11cblx0e1xuXHRcdG9wdGlvbnMgPSBPYmplY3QuYXNzaWduKHt9LCB0aGlzLm9wdGlvbnNJbml0LCBvcHRpb25zKTtcblxuXHRcdGlmICghb3B0aW9ucy5vdXRwdXREaXIpXG5cdFx0e1xuXHRcdFx0dGhyb3cgbmV3IFJlZmVyZW5jZUVycm9yKGBvcHRpb25zOiBvdXRwdXREaXIgaXMgbm90IHNldGApO1xuXHRcdH1cblxuXHRcdGxldCBwID0gcGF0aC5qb2luKG9wdGlvbnMub3V0cHV0RGlyLCBvcHRpb25zLmRpc2FibGVPdXRwdXREaXJQcmVmaXggPyAnJyA6IHRoaXMuSURLRVkpO1xuXG5cdFx0aWYgKCFwYXRoLmlzQWJzb2x1dGUocCkpXG5cdFx0e1xuXHRcdFx0cCA9IHBhdGguam9pbihvcHRpb25zLmN3ZCwgcCk7XG5cdFx0fVxuXG5cdFx0cm9vdFBhdGguZGlzYWJsZVBhdGhzLmNvbmNhdChfX2Rpcm5hbWUpLmZvckVhY2goZnVuY3Rpb24gKGRpcilcblx0XHR7XG5cdFx0XHRpZiAocC5pbmRleE9mKF9fZGlybmFtZSkgPT0gMClcblx0XHRcdHtcblx0XHRcdFx0dGhyb3cgbmV3IFJlZmVyZW5jZUVycm9yKGBwYXRoIG5vdCBhbGxvdyBcIiR7cH1cImApXG5cdFx0XHR9XG5cdFx0fSk7XG5cblx0XHRpZiAodHlwZW9mIG5vdmVsTmFtZSA9PSAnc3RyaW5nJyB8fCBub3ZlbE5hbWUpXG5cdFx0e1xuXHRcdFx0aWYgKCFub3ZlbE5hbWUpXG5cdFx0XHR7XG5cdFx0XHRcdHRocm93IG5ldyBSZWZlcmVuY2VFcnJvcigpO1xuXHRcdFx0fVxuXG5cdFx0XHRwID0gcGF0aC5qb2luKHAsIG5vdmVsTmFtZSk7XG5cdFx0fVxuXG5cdFx0b3B0aW9ucyA9IHRoaXMuX2ZpeE9wdGlvbnNSdW50aW1lKG9wdGlvbnMpO1xuXG5cdFx0cmV0dXJuIFtwLCBvcHRpb25zXTtcblx0fVxuXG5cdHByb3RlY3RlZCBfZml4T3B0aW9uc1J1bnRpbWU8VCA9IE5vdmVsU2l0ZS5JT3B0aW9uc1J1bnRpbWU+KG9wdGlvbnNSdW50aW1lOiBUICYgTm92ZWxTaXRlLklPcHRpb25zUnVudGltZSk6IFQgJiBOb3ZlbFNpdGUuSU9wdGlvbnNSdW50aW1lXG5cdHtcblx0XHRvcHRpb25zUnVudGltZVtTWU1CT0xfQ0FDSEVdID0gKG9wdGlvbnNSdW50aW1lW1NZTUJPTF9DQUNIRV0gfHwge30pIGFzIHtcblx0XHRcdHVybD86IFVSTCxcblx0XHRcdHBhdGhfbm92ZWw/OiBzdHJpbmcsXG5cdFx0XHRub3ZlbD86IE5vdmVsU2l0ZS5JTm92ZWwsXG5cdFx0fTtcblxuXHRcdG9wdGlvbnNSdW50aW1lLnN0YXJ0SW5kZXggPSBvcHRpb25zUnVudGltZS5zdGFydEluZGV4IHx8IDA7XG5cblx0XHQvLyBAdHMtaWdub3JlXG5cdFx0b3B0aW9uc1J1bnRpbWUub3B0aW9uc0pTRE9NID0gY3JlYXRlT3B0aW9uc0pTRE9NKG9wdGlvbnNSdW50aW1lLm9wdGlvbnNKU0RPTSk7XG5cblxuXHRcdGlmIChvcHRpb25zUnVudGltZS5kZWJ1Z0xvZyAhPSBudWxsKVxuXHRcdHtcblx0XHRcdG9wdGlvbnNSdW50aW1lLmRlYnVnTG9nID0gISFvcHRpb25zUnVudGltZS5kZWJ1Z0xvZztcblx0XHR9XG5cblx0XHRpZiAob3B0aW9uc1J1bnRpbWUua2VlcEltYWdlID09IG51bGwpXG5cdFx0e1xuXHRcdFx0b3B0aW9uc1J1bnRpbWUua2VlcEltYWdlID0gdHJ1ZTtcblx0XHR9XG5cblx0XHRpZiAob3B0aW9uc1J1bnRpbWUua2VlcFJ1YnkgPT0gbnVsbClcblx0XHR7XG5cdFx0XHRvcHRpb25zUnVudGltZS5rZWVwUnVieSA9IHRydWU7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIG9wdGlvbnNSdW50aW1lO1xuXHR9XG5cblx0dHJpbUZpbGVuYW1lQ2hhcHRlcihuYW1lKTogc3RyaW5nXG5cdHtcblx0XHRyZXR1cm4gdGhpcy50cmltRmlsZW5hbWUobmFtZSk7XG5cdH1cblxuXHR0cmltRmlsZW5hbWVWb2x1bWUobmFtZSk6IHN0cmluZ1xuXHR7XG5cdFx0cmV0dXJuIHRoaXMudHJpbUZpbGVuYW1lKG5hbWUpO1xuXHR9XG5cblx0dHJpbUZpbGVuYW1lTm92ZWwobmFtZSk6IHN0cmluZ1xuXHR7XG5cdFx0cmV0dXJuIHRoaXMudHJpbUZpbGVuYW1lKG5hbWUpO1xuXHR9XG5cblx0dHJpbUZpbGVuYW1lKG5hbWUpOiBzdHJpbmdcblx0e1xuXHRcdHJldHVybiB0cmltRmlsZW5hbWUoX2ZpeFZvbHVtZUNoYXB0ZXJOYW1lKG5hbWUpKTtcblx0fVxuXG5cdHRyaW1UYWcodGFnKTogc3RyaW5nXG5cdHtcblx0XHRyZXR1cm4gKHRhZyBhcyBzdHJpbmcpXG5cdFx0XHQucmVwbGFjZSgvW1xcW1xcXVxcL1xcXFxdL2csIChzKSA9PlxuXHRcdFx0e1xuXHRcdFx0XHRyZXR1cm4gU3RyVXRpbC50b0Z1bGxXaWR0aChzKVxuXHRcdFx0fSlcblx0XHRcdDtcblx0fVxuXG5cdHByb3RlY3RlZCBfZXhwb3J0RG93bmxvYWRPcHRpb25zPFQgPSBJT3B0aW9uc1J1bnRpbWU+KG9wdGlvbnNSdW50aW1lPzogVCAmIElPcHRpb25zUnVudGltZSk6IHVua25vd25cblx0e1xuXHRcdHJldHVybiB2b2lkICgwKTtcblx0fVxuXG5cdHByb3RlY3RlZCBfaGFuZGxlRGF0YUZvclN0cmluZ2lmeSguLi5hcmd2KTogSU1kY29uZk1ldGFcblx0e1xuXHRcdC8vIEB0cy1pZ25vcmVcblx0XHRsZXQgbWRjb25mOiBJTWRjb25mTWV0YSA9IF9oYW5kbGVEYXRhRm9yU3RyaW5naWZ5KC4uLmFyZ3YpO1xuXG5cdFx0aWYgKG1kY29uZi5ub3ZlbClcblx0XHR7XG5cdFx0XHRsZXQgYm9vbDogYm9vbGVhbjtcblxuXHRcdFx0aWYgKG1kY29uZi5ub3ZlbC50YWdzICYmIEFycmF5LmlzQXJyYXkobWRjb25mLm5vdmVsLnRhZ3MpKVxuXHRcdFx0e1xuXHRcdFx0XHRib29sID0gW1xuXHRcdFx0XHRcdCfmm7jnsY3ljJYnLFxuXHRcdFx0XHRcdCfkuabnsY3ljJYnLFxuXHRcdFx0XHRcdCfmlofluqvljJYnLFxuXHRcdFx0XHRcdCfmloflupPljJYnLFxuXHRcdFx0XHRdLnNvbWUodiA9PlxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0cmV0dXJuIG1kY29uZi5ub3ZlbC50YWdzLmluY2x1ZGVzKHYpXG5cdFx0XHRcdH0pO1xuXG5cdFx0XHRcdGlmIChib29sKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0bWRjb25mLm5vdmVsLm5vdmVsX3N0YXR1cyA9IChtZGNvbmYubm92ZWwubm92ZWxfc3RhdHVzIHwgMCkgfCBFbnVtTm92ZWxTdGF0dXMuUF9CT09LO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdGlmIChtZGNvbmYubm92ZWwuc3RhdHVzKVxuXHRcdFx0e1xuXHRcdFx0XHRib29sID0gW1xuXHRcdFx0XHRcdCflrozntZDmuIgnLFxuXHRcdFx0XHRcdCflrozntZAnLFxuXHRcdFx0XHRcdCflt7LlrozntZAnLFxuXHRcdFx0XHRcdCflt7LlrozmiJAnLFxuXHRcdFx0XHRcdCflroznu5PmuIgnLFxuXHRcdFx0XHRcdCflroznu5MnLFxuXHRcdFx0XHRcdCflt7Llroznu5MnLFxuXHRcdFx0XHRcdCflt7LlrozmiJAnLFxuXHRcdFx0XHRdLmluY2x1ZGVzKG1kY29uZi5ub3ZlbC5zdGF0dXMpO1xuXG5cdFx0XHRcdGlmIChib29sKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0bWRjb25mLm5vdmVsLm5vdmVsX3N0YXR1cyA9IChtZGNvbmYubm92ZWwubm92ZWxfc3RhdHVzIHwgMCkgfCBFbnVtTm92ZWxTdGF0dXMuQVVUSE9SX0RPTkU7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cblx0XHRyZXR1cm4gbWRjb25mO1xuXHR9XG5cblx0cHJvdGVjdGVkIF9zYXZlUmVhZG1lKG9wdGlvbnNSdW50aW1lPzogSU9wdGlvbnNSdW50aW1lLCBvcHRpb25zID0ge30sIC4uLm9wdHMpXG5cdHtcblx0XHRjb25zdCBzZWxmID0gdGhpcztcblxuXHRcdGlmIChpc1VuZGVmKG9wdGlvbnNSdW50aW1lKVxuXHRcdFx0fHwgaXNVbmRlZihvcHRpb25zUnVudGltZVtTWU1CT0xfQ0FDSEVdLCB7fSlcblxuXHRcdFx0fHwgaXNVbmRlZihvcHRpb25zUnVudGltZVtTWU1CT0xfQ0FDSEVdLm5vdmVsLCB7fSlcblx0XHRcdHx8IGlzVW5kZWYob3B0aW9uc1J1bnRpbWVbU1lNQk9MX0NBQ0hFXS5wYXRoX25vdmVsLCAnJylcblx0XHQpXG5cdFx0e1xuXHRcdFx0dGhyb3cgbmV3IFJlZmVyZW5jZUVycm9yKGBzYXZlUmVhZG1lYCk7XG5cdFx0fVxuXG5cdFx0Y29uc3Qgbm92ZWwgPSBvcHRpb25zUnVudGltZVtTWU1CT0xfQ0FDSEVdLm5vdmVsO1xuXHRcdGNvbnN0IHBhdGhfbm92ZWwgPSBvcHRpb25zUnVudGltZVtTWU1CT0xfQ0FDSEVdLnBhdGhfbm92ZWw7XG5cblx0XHRsZXQgbWRjb25maWcgPSB0aGlzLl9oYW5kbGVEYXRhRm9yU3RyaW5naWZ5KHtcblx0XHRcdG5vdmVsOiB7XG5cdFx0XHRcdGlsbHVzdDogJycsXG5cdFx0XHRcdHRpdGxlX3poMTogJycsXG5cdFx0XHRcdGlsbHVzdHM6IFtdLFxuXHRcdFx0XHRwdWJsaXNoZXJzOiBbXG5cdFx0XHRcdFx0c2VsZi5JREtFWSxcblx0XHRcdFx0XSxcblx0XHRcdFx0dGFnczogW1xuXHRcdFx0XHRcdHNlbGYuSURLRVksXG5cdFx0XHRcdF0sXG5cdFx0XHRcdHNlcmllczoge1xuXHRcdFx0XHRcdG5hbWU6IG5vdmVsLm5vdmVsX3Nlcmllc190aXRsZSB8fCBub3ZlbC5ub3ZlbF90aXRsZSB8fCAnJyxcblx0XHRcdFx0fSxcblx0XHRcdFx0bm92ZWxfc3RhdHVzOiAwLFxuXHRcdFx0fSxcblx0XHRcdG9wdGlvbnMsXG5cblx0XHRcdGxpbms6IG5vdmVsLmxpbmsgfHwgW10sXG5cdFx0fSwgbm92ZWwsIC4uLm9wdHMpO1xuXG5cdFx0bGV0IG1kID0gbm92ZWxJbmZvLnN0cmluZ2lmeShtZGNvbmZpZyk7XG5cblx0XHRsZXQgZmlsZSA9IHBhdGguam9pbihwYXRoX25vdmVsLCBgUkVBRE1FLm1kYCk7XG5cblx0XHRjb25zb2xlRGVidWcuaW5mbyhgW01FVEFdYCwgYHNhdmUgUkVBRE1FLm1kYCk7XG5cblx0XHRyZXR1cm4gZnMub3V0cHV0RmlsZShmaWxlLCBtZClcblx0XHRcdC50aGVuKGZ1bmN0aW9uICgpXG5cdFx0XHR7XG5cdFx0XHRcdHJldHVybiB7XG5cdFx0XHRcdFx0ZmlsZSxcblx0XHRcdFx0XHRtZCxcblx0XHRcdFx0fTtcblx0XHRcdH0pXG5cdFx0XHQ7XG5cdH1cblxuXHRjcmVhdGVNYWluVXJsPFQgPSBJT3B0aW9uc1J1bnRpbWU+KHVybDogc3RyaW5nIHwgVVJMLCBvcHRpb25zUnVudGltZT86IFQgJiBJT3B0aW9uc1J1bnRpbWUpOiBVUkxcblx0e1xuXHRcdGxldCBkYXRhID0gdGhpcy5wYXJzZVVybCh1cmwpO1xuXG5cdFx0aWYgKCFkYXRhIHx8ICFkYXRhLm5vdmVsX2lkKVxuXHRcdHtcblx0XHRcdC8vY29uc29sZS5sb2coZGF0YSk7XG5cblx0XHRcdHRocm93IG5ldyBSZWZlcmVuY2VFcnJvcihKU09OLnN0cmluZ2lmeShkYXRhKSk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHRoaXMubWFrZVVybChkYXRhLCB0cnVlLCBvcHRpb25zUnVudGltZSk7XG5cdH1cblxuXHRwcm90ZWN0ZWQgX2NyZWF0ZUNoYXB0ZXJVcmw8VCA9IElPcHRpb25zUnVudGltZT4oe1xuXHRcdG5vdmVsLFxuXHRcdHZvbHVtZSxcblx0XHRjaGFwdGVyLFxuXHR9OiB7XG5cdFx0bm92ZWw6IE5vdmVsU2l0ZS5JTm92ZWwsXG5cdFx0dm9sdW1lOiBOb3ZlbFNpdGUuSVZvbHVtZSxcblx0XHRjaGFwdGVyOiBOb3ZlbFNpdGUuSUNoYXB0ZXIsXG5cdH0sIG9wdGlvbnNSdW50aW1lPzogVCAmIElPcHRpb25zUnVudGltZSk6IFVSTFxuXHR7XG5cdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdHJldHVybiBuZXcgVVJMKGNoYXB0ZXIuY2hhcHRlcl91cmwpO1xuXHR9XG5cblx0cHJvdGVjdGVkIF9mZXRjaENoYXB0ZXI8VD4odXJsOiBVUkwsIG9wdGlvbnNSdW50aW1lOiBUICYgSU9wdGlvbnNSdW50aW1lLCBfY2FjaGVfOiB7XG5cdFx0bm92ZWw6IElOb3ZlbCxcblx0fSlcblx0e1xuXHRcdHRocm93IG5ldyBTeW50YXhFcnJvcihgRnVuY3Rpb24gbm90IGltcGxlbWVudGVkYCk7XG5cdH1cblxuXHRwcm90ZWN0ZWQgX3BhcnNlQ2hhcHRlcjxUPihkb20sIG9wdGlvbnNSdW50aW1lOiBUICYgSU9wdGlvbnNSdW50aW1lLCBjYWNoZToge1xuXHRcdGZpbGU6IHN0cmluZyxcblx0XHRub3ZlbDogTm92ZWxTaXRlLklOb3ZlbCxcblx0XHR2b2x1bWU6IE5vdmVsU2l0ZS5JVm9sdW1lLFxuXHRcdGNoYXB0ZXI6IE5vdmVsU2l0ZS5JQ2hhcHRlcixcblx0fSlcblx0e1xuXHRcdHRocm93IG5ldyBTeW50YXhFcnJvcihgRnVuY3Rpb24gbm90IGltcGxlbWVudGVkYCk7XG5cdH1cblxuXHRnZXRFeHRyYUluZm88VCwgTSBleHRlbmRzIFBhcnRpYWw8SU5vdmVsICYgSU1kY29uZk1ldGE+LCBDIGV4dGVuZHMgdW5rbm93bj4odXJsb2JqOiBOb3ZlbFNpdGUuSVBhcnNlVXJsLFxuXHRcdG9wdGlvbnNSdW50aW1lOiBUICYgSU9wdGlvbnNSdW50aW1lLFxuXHRcdGRhdGFfbWV0YT86IE0sXG5cdFx0Y2FjaGU/OiBDLFxuXHQpOiBQcm9taXNlQmx1ZWJpcmQ8TT5cblx0e1xuXHRcdHRocm93IG5ldyBTeW50YXhFcnJvcihgRnVuY3Rpb24gbm90IGltcGxlbWVudGVkYCk7XG5cdH1cblxuXHRwcm90ZWN0ZWQgX2NoZWNrRXhpc3RzKG9wdGlvbnNSdW50aW1lOiBJT3B0aW9uc1J1bnRpbWUsIGZpbGU6IHN0cmluZyk6IGJvb2xlYW5cblx0e1xuXHRcdGlmICghb3B0aW9uc1J1bnRpbWUuZGlzYWJsZUNoZWNrRXhpc3RzICYmIGZzLmV4aXN0c1N5bmMoZmlsZSkpXG5cdFx0e1xuXHRcdFx0bGV0IHR4dCA9IGZzLnJlYWRGaWxlU3luYyhmaWxlKTtcblxuXHRcdFx0aWYgKHR4dC50b1N0cmluZygpLnJlcGxhY2UoL15cXHMrfFxccyskL2csICcnKSlcblx0XHRcdHtcblx0XHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0cmV0dXJuIGZhbHNlXG5cdH1cblxuXHRwcm90ZWN0ZWQgZW1pdChldmVudDogRXZlbnRFbWl0dGVyLCBldmVudE5hbWU6IHN0cmluZywgLi4uYXJndilcblx0e1xuXHRcdGxldCBib29sID0gZXZlbnQuZW1pdChldmVudE5hbWUsIHRoaXMsIC4uLmFyZ3YpO1xuXHRcdHJldHVybiBbZXZlbnQsIGJvb2xdO1xuXHR9XG5cblx0X3NhdmVGaWxlPFQgPSBOb3ZlbFNpdGUuSU9wdGlvbnNSdW50aW1lPihvcHRzOiB7XG5cdFx0ZmlsZTogc3RyaW5nLFxuXHRcdGNvbnRleHQ6IHN0cmluZyB8IEJ1ZmZlcixcblx0XHRvcHRpb25zUnVudGltZTogVCAmIE5vdmVsU2l0ZS5JT3B0aW9uc1J1bnRpbWUsXG5cdH0pXG5cdHtcblx0XHRyZXR1cm4gUHJvbWlzZUJsdWViaXJkLnJlc29sdmUoKVxuXHRcdFx0LmJpbmQodGhpcylcblx0XHRcdC50aGVuKCgpID0+IHtcblx0XHRcdFx0bGV0IHsgZmlsZSwgY29udGV4dCwgb3B0aW9uc1J1bnRpbWUgfSA9IG9wdHM7XG5cblx0XHRcdFx0aWYgKG9wdGlvbnNSdW50aW1lLmxpbmVCcmVha0NybGYpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRsZXQgdHh0MSA9IGNvbnRleHQudG9TdHJpbmcoKTtcblxuXHRcdFx0XHRcdGlmIChSX0NSTEYudGVzdCh0eHQxKSlcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRsZXQgdHh0MiA9IGNybGYodHh0MSwgQ1JMRik7XG5cblx0XHRcdFx0XHRcdGlmICh0eHQxICE9PSB0eHQyKVxuXHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRjb250ZXh0ID0gdHh0Mjtcblx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0dHh0MSA9IG51bGw7XG5cdFx0XHRcdFx0XHR0eHQyID0gbnVsbDtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRyZXR1cm4gZnMub3V0cHV0RmlsZShmaWxlLCBjb250ZXh0KVxuXHRcdFx0XHRcdC50aGVuKHIgPT4ge1xuXG5cdFx0XHRcdFx0XHRpZiAob3B0aW9uc1J1bnRpbWUuZGVidWdMb2cpXG5cdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdGxldCBmaWxlMiA9IHBhdGgucmVsYXRpdmUob3B0aW9uc1J1bnRpbWUub3V0cHV0RGlyLCBmaWxlKTtcblxuXHRcdFx0XHRcdFx0XHRjb25zb2xlRGVidWcuc3VjY2VzcyhgW1NBVkVdYCwgZmlsZTIpO1xuXHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHRyZXR1cm4gcjtcblx0XHRcdFx0XHR9KVxuXHRcdFx0fSlcblx0XHQ7XG5cdH1cblxufVxuXG5leHBvcnQgaW1wb3J0IElPcHRpb25zUnVudGltZSA9IE5vdmVsU2l0ZS5JT3B0aW9uc1J1bnRpbWU7XG5leHBvcnQgaW1wb3J0IElWb2x1bWUgPSBOb3ZlbFNpdGUuSVZvbHVtZTtcbmV4cG9ydCBpbXBvcnQgSUNoYXB0ZXIgPSBOb3ZlbFNpdGUuSUNoYXB0ZXI7XG5leHBvcnQgaW1wb3J0IEVudW1QYXRoTm92ZWxTdHlsZSA9IE5vdmVsU2l0ZS5FbnVtUGF0aE5vdmVsU3R5bGU7XG5pbXBvcnQgeyBJTm92ZWwgfSBmcm9tICcuL3N5b3NldHUnO1xuaW1wb3J0IHsgY29uc29sZURlYnVnIH0gZnJvbSAnLi4vdXRpbC9sb2cnO1xuXG5leHBvcnQgbmFtZXNwYWNlIE5vdmVsU2l0ZVxue1xuXG5cdGV4cG9ydCB0eXBlIElGaWxlUHJlZml4TW9kZSA9IDAgfCAxIHwgMiB8IDMgfCA0IHwgNTtcblxuXHRleHBvcnQgdHlwZSBJT3B0aW9uc1BsdXMgPSB7XG5cblx0XHRkaXNhYmxlT3V0cHV0RGlyUHJlZml4PzogYm9vbGVhbixcblxuXHRcdG5vRGlyUHJlZml4PzogYm9vbGVhbixcblx0XHRub0RpclBhZGVuZD86IGJvb2xlYW4sXG5cblx0XHRub0ZpcmVQcmVmaXg/OiBib29sZWFuLFxuXHRcdG5vRmlsZVBhZGVuZD86IGJvb2xlYW4sXG5cblx0XHRyZXRyeURlbGF5PzogbnVtYmVyLFxuXHRcdHN0YXJ0SW5kZXg/OiBudW1iZXIsXG5cblx0XHRmaWxlUHJlZml4TW9kZT86IG51bWJlciB8IElGaWxlUHJlZml4TW9kZSxcblxuXHRcdGFsbG93RW1wdHlWb2x1bWVUaXRsZT86IGJvb2xlYW4sXG5cblx0XHRldmVudD86IEV2ZW50RW1pdHRlcixcblxuXHRcdC8qKlxuXHRcdCAqIOeUqOS+hueZu+WFpeermem7nueahCBjb29raWVzIHNlc3Npb25cblx0XHQgKi9cblx0XHRzZXNzaW9uRGF0YT86IHtcblx0XHRcdFtrZXk6IHN0cmluZ106IGFueSxcblx0XHR9LFxuXG5cdFx0LyoqXG5cdFx0ICog5Y+q5oqT5Y+W5bCP6Kqq55qEIE1FVEEg6LOH5paZXG5cdFx0ICovXG5cdFx0ZmV0Y2hNZXRhRGF0YU9ubHk/OiBib29sZWFuLFxuXG5cdFx0ZGVidWdMb2c/OiBib29sZWFuLFxuXG5cdFx0bGluZUJyZWFrQ3JsZj86IGJvb2xlYW4sXG5cblx0XHQvKipcblx0XHQgKiDkv53nlZnms6jpn7PmoLzlvI9cblx0XHQgKi9cblx0XHRrZWVwUnVieT86IGJvb2xlYW47XG5cdFx0LyoqXG5cdFx0ICog5L+d55WZ5YW25LuW5qC85byPXG5cdFx0ICovXG5cdFx0a2VlcEZvcm1hdD86IGJvb2xlYW47XG5cblx0XHQvKipcblx0XHQgKiDlnKjlhafmlofljp/lp4vkvY3nva7kuIrkv53nlZnlnJbniYdcblx0XHQgKi9cblx0XHRrZWVwSW1hZ2U/OiBib29sZWFuO1xuXG5cdH1cblxuXHRleHBvcnQgdHlwZSBJT3B0aW9ucyA9IHtcblxuXHRcdG91dHB1dERpcj86IHN0cmluZyxcblx0XHRjd2Q/OiBzdHJpbmcsXG5cblx0fSAmIElPcHRpb25zUGx1cztcblxuXHRleHBvcnQgY29uc3QgZW51bSBFbnVtUGF0aE5vdmVsU3R5bGVcblx0e1xuXHRcdERFRkFVTFQgPSAwLFxuXHRcdE5PVkVMSUQgPSAxLFxuXHR9XG5cblx0ZXhwb3J0IHR5cGUgSURvd25sb2FkT3B0aW9ucyA9IHtcblxuXHRcdC8qKlxuXHRcdCAqIOWPqueUoueUn+ebrumMhOe1kOaniyDkuI3kuIvovInlhaflrrlcblx0XHQgKi9cblx0XHRkaXNhYmxlRG93bmxvYWQ/OiBib29sZWFuLFxuXHRcdGRpc2FibGVDaGVja0V4aXN0cz86IGJvb2xlYW4sXG5cblx0XHRvcHRpb25zSlNET00/OiBJRnJvbVVybE9wdGlvbnMgJiBJT3B0aW9uc0pTRE9NICYge1xuXHRcdFx0Y29va2llSmFyPzogUGFydGlhbDxMYXp5Q29va2llSmFyPixcblx0XHR9LFxuXG5cdFx0LyoqXG5cdFx0ICog6Kit5a6a5bCP6Kqq6LOH5paZ5aS+5qij5byPXG5cdFx0ICovXG5cdFx0cGF0aE5vdmVsU3R5bGU/OiBFbnVtUGF0aE5vdmVsU3R5bGUsXG5cblx0fSAmIElPcHRpb25zUGx1cztcblxuXHRleHBvcnQgdHlwZSBJT3B0aW9uc1J1bnRpbWUgPSBJT3B0aW9ucyAmIElEb3dubG9hZE9wdGlvbnMgJiBJT3B0aW9uc1BsdXM7XG5cblx0ZXhwb3J0IGludGVyZmFjZSBJUGFyc2VVcmxcblx0e1xuXHRcdHVybD86IFVSTCB8IHN0cmluZyxcblxuXHRcdG5vdmVsX3BpZD8sXG5cdFx0bm92ZWxfaWQ/LFxuXHRcdGNoYXB0ZXJfaWQ/LFxuXHRcdHZvbHVtZV9pZD8sXG5cblx0XHRub3ZlbF9yMTg/LFxuXG5cdFx0W2tleTogc3RyaW5nXTogYW55LFxuXHR9XG5cblx0ZXhwb3J0IGludGVyZmFjZSBJQ2hhcHRlclxuXHR7XG5cdFx0Y2hhcHRlcl9pbmRleD86IG51bWJlciB8IHN0cmluZyxcblx0XHRjaGFwdGVyX3RpdGxlOiBzdHJpbmcsXG5cdFx0Y2hhcHRlcl9pZD9cblx0XHRjaGFwdGVyX3VybD9cblx0XHRjaGFwdGVyX3VybF9kYXRhP1xuXHRcdGNoYXB0ZXJfZGF0ZT86IG1vbWVudC5Nb21lbnQsXG5cblx0XHRpbWdzPzogc3RyaW5nW10sXG5cblx0XHRba2V5OiBzdHJpbmddOiBhbnksXG5cdH1cblxuXHRleHBvcnQgaW50ZXJmYWNlIElWb2x1bWVcblx0e1xuXHRcdHZvbHVtZV9pbmRleD9cblx0XHR2b2x1bWVfdGl0bGU6IHN0cmluZyxcblx0XHRjaGFwdGVyX2xpc3Q/OiBJQ2hhcHRlcltdLFxuXG5cdFx0W2tleTogc3RyaW5nXTogYW55LFxuXHR9XG5cblx0ZXhwb3J0IGludGVyZmFjZSBJTm92ZWxcblx0e1xuXHRcdHVybDogVVJMIHwgc3RyaW5nLFxuXHRcdHVybF9kYXRhOiBJUGFyc2VVcmwsXG5cblx0XHRub3ZlbF90aXRsZTogc3RyaW5nLFxuXHRcdG5vdmVsX2F1dGhvcj86IHN0cmluZyxcblxuXHRcdG5vdmVsX2Rlc2M/OiBzdHJpbmcsXG5cdFx0bm92ZWxfZGF0ZT86IG1vbWVudC5Nb21lbnQsXG5cdFx0bm92ZWxfcHVibGlzaGVyPzogc3RyaW5nLFxuXG5cdFx0bm92ZWxfc2VyaWVzX3RpdGxlPzogc3RyaW5nLFxuXG5cdFx0dm9sdW1lX2xpc3Q6IElWb2x1bWVbXSxcblxuXHRcdGNoZWNrZGF0ZT86IG1vbWVudC5Nb21lbnQsXG5cblx0XHRpbWdzPzogc3RyaW5nW10sXG5cblx0XHRba2V5OiBzdHJpbmddOiBhbnksXG5cdH1cblxuXHRleHBvcnQgaW50ZXJmYWNlIElOb3ZlbFNpdGVTdGF0aWM8VD4gZXh0ZW5kcyBUeXBlPFQgJiBOb3ZlbFNpdGUuSU5vdmVsU2l0ZT5cblx0e1xuXHRcdHJlYWRvbmx5IElES0VZOiBzdHJpbmcsXG5cdFx0cmVhZG9ubHkgZGlzYWJsZWQ/OiBib29sZWFuLFxuXG5cdFx0Y2hlY2s/KHVybDogc3RyaW5nIHwgVVJMIHwgTm92ZWxTaXRlLklQYXJzZVVybCB8IG51bWJlciwgb3B0aW9ucz8sIC4uLmFyZ3YpOiBib29sZWFuO1xuXG5cdFx0bWFrZVVybD8odXJsb2JqOiBOb3ZlbFNpdGUuSVBhcnNlVXJsLCBvcHRpb25zPywgLi4uYXJndik6IFVSTDtcblxuXHRcdHBhcnNlVXJsPyh1cmw6IHN0cmluZyB8IFVSTCB8IG51bWJlciwgLi4uYXJndik6IE5vdmVsU2l0ZS5JUGFyc2VVcmw7XG5cblx0fVxuXG5cdGV4cG9ydCBpbnRlcmZhY2UgSU5vdmVsU2l0ZVxuXHR7XG5cdFx0ZG93bmxvYWQodXJsOiBzdHJpbmcgfCBVUkwsIG9wdGlvbnM/OiBJRG93bmxvYWRPcHRpb25zKTogUHJvbWlzZUJsdWViaXJkPE5vdmVsU2l0ZS5JTm92ZWw+O1xuXG5cdFx0bWFrZVVybCh1cmxvYmo6IE5vdmVsU2l0ZS5JUGFyc2VVcmwsIG9wdGlvbnM/LCAuLi5hcmd2KTogVVJMO1xuXG5cdFx0cGFyc2VVcmwodXJsOiBVUkwgfCBzdHJpbmcgfCBudW1iZXIsIC4uLmFyZ3YpOiBOb3ZlbFNpdGUuSVBhcnNlVXJsO1xuXHR9XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgVHlwZTxUPlxue1xuXHRuZXcob3B0aW9uczogTm92ZWxTaXRlLklPcHRpb25zLCAuLi5hcmdzOiBhbnlbXSk6IFQ7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzdGF0aWNJbXBsZW1lbnRzPFQ+KClcbntcblx0cmV0dXJuIChjb25zdHJ1Y3RvcjogVCkgPT4ge31cbn1cblxuZXhwb3J0IGRlZmF1bHQgTm92ZWxTaXRlO1xuIl19