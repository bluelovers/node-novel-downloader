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
            if (mdconf.novel.tags && Array.isArray(mdconf.novel.tags)) {
                let bool;
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
            throw new ReferenceError();
        }
        return this.makeUrl(data, true, optionsRuntime);
    }
    _createChapterUrl({ novel, volume, chapter, }, optionsRuntime) {
        // @ts-ignore
        return new jsdom_url_1.URL(chapter.chapter_url);
    }
    _fetchChapter(url, optionsRuntime) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7O0dBRUc7O0FBRUgsb0RBQXNEO0FBbUM3Qyw0QkFuQ0Ysa0JBQWlCLENBbUNFO0FBbEMxQixxREFBcUQ7QUFFckQsNENBQTZDO0FBZ0NqQiwwQ0FBZTtBQS9CM0MseUNBQWdDO0FBQ2hDLCtCQUFnQztBQUVoQyx1Q0FBbUM7QUFHbkMsb0NBQXVIO0FBRTlHLDhCQUZBLDJCQUFtQixDQUVBO0FBQWtDLDZCQUZBLDBCQUFrQixDQUVBO0FBQ2hGLHFEQUFrRjtBQUtsRiwrQkFBZ0M7QUFDaEMsd0NBQTZDO0FBQzdDLG1EQUFvRDtBQUNwRCxvQ0FBcUM7QUFDckMscURBQTREO0FBRTVELG1DQUFtQztBQUNuQywwQ0FBMkM7QUFRbEMsd0JBQU07QUFQZixrQ0FBeUQ7QUFLekQsTUFBTSxDQUFDLEVBQUUsQ0FBQyxNQUFNLEdBQUcsY0FBYyxPQUFPLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQU01QyxRQUFBLFlBQVksR0FBRyxNQUFNLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0FBRWhELE1BQWEsU0FBUztJQU9yQixZQUFZLE9BQTJCLEVBQUUsR0FBRyxJQUFJO1FBRS9DLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUNmO1lBQ0MsTUFBTSxJQUFJLGNBQWMsQ0FBQyxlQUFlLENBQUMsQ0FBQztTQUMxQztRQUVELElBQUksQ0FBQyxXQUFXLEdBQUcsT0FBTyxDQUFDO1FBQzNCLElBQUksQ0FBQyxXQUFXLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsR0FBRyxJQUFJLE9BQU8sQ0FBQyxHQUFHLEVBQUUsQ0FBQztRQUU3RCxDQUFDLElBQUksQ0FBQyxlQUFlLEVBQUUsSUFBSSxDQUFDLFdBQVcsQ0FBQyxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLFdB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QixlQUFLLEdBQVcsSUFBSSxDQUFDO0FBNGMvQixRQUFBLGtCQUFrQixHQUFHLFNBQVMsQ0FBQyxrQkFBa0IsQ0FBQztBQUVoRSxxQ0FBMkM7QUFFM0MsV0FBaUIsU0FBUztJQStEekIsSUFBa0Isa0JBSWpCO0lBSkQsV0FBa0Isa0JBQWtCO1FBRW5DLGlFQUFXLENBQUE7UUFDWCxpRUFBVyxDQUFBO0lBQ1osQ0FBQyxFQUppQixrQkFBa0IsR0FBbEIsNEJBQWtCLEtBQWxCLDRCQUFrQixRQUluQztBQStGRixDQUFDLEVBbEtnQixTQUFTLEdBQVQsaUJBQVMsS0FBVCxpQkFBUyxRQWtLekI7QUFPRCxTQUFnQixnQkFBZ0I7SUFFL0IsT0FBTyxDQUFDLFdBQWMsRUFBRSxFQUFFLEdBQUUsQ0FBQyxDQUFBO0FBQzlCLENBQUM7QUFIRCw0Q0FHQztBQUVELGtCQUFlLFNBQVMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ3JlYXRlZCBieSB1c2VyIG9uIDIwMTgvMi8xMC8wMTAuXG4gKi9cblxuaW1wb3J0IGJsdWViaXJkRGVjb3JhdG9yIGZyb20gJy4uL2RlY29yYXRvci9ibHVlYmlyZCc7XG4vL2ltcG9ydCBibHVlYmlyZERlY29yYXRvciBmcm9tICdibHVlYmlyZC1kZWNvcmF0b3InO1xuXG5pbXBvcnQgUHJvbWlzZUJsdWViaXJkID0gcmVxdWlyZSgnYmx1ZWJpcmQnKTtcbmltcG9ydCB7IFVSTCB9IGZyb20gJ2pzZG9tLXVybCc7XG5pbXBvcnQgcGF0aCA9IHJlcXVpcmUoJ3VwYXRoMicpO1xuXG5pbXBvcnQgcm9vdFBhdGggZnJvbSBcIi4uLy4uL19yb290XCI7XG5pbXBvcnQgeyByZXRyeVJlcXVlc3QgfSBmcm9tICcuLi9mZXRjaCc7XG5cbmltcG9ydCB7IGRlZmF1bHRKU0RPTU9wdGlvbnMsIElGcm9tVXJsT3B0aW9ucywgSU9wdGlvbnNKU0RPTSwgY3JlYXRlT3B0aW9uc0pTRE9NLCBJTm92ZWxPcHRpb25zSlNET00gfSBmcm9tICcuLi9qc2RvbSc7XG5cbmV4cG9ydCB7IGRlZmF1bHRKU0RPTU9wdGlvbnMsIElGcm9tVXJsT3B0aW9ucywgSU9wdGlvbnNKU0RPTSwgY3JlYXRlT3B0aW9uc0pTRE9NIH1cbmltcG9ydCBub3ZlbEluZm8sIHsgSU1kY29uZk1ldGEsIF9oYW5kbGVEYXRhRm9yU3RyaW5naWZ5IH0gZnJvbSAnbm9kZS1ub3ZlbC1pbmZvJztcblxuZXhwb3J0IHsgSU1kY29uZk1ldGEgfVxuaW1wb3J0IHsgTGF6eUNvb2tpZSwgTGF6eUNvb2tpZUphciB9IGZyb20gJ2pzZG9tLWV4dHJhJztcblxuaW1wb3J0IGZzID0gcmVxdWlyZSgnZnMtZXh0cmEnKTtcbmltcG9ydCB7IHRyaW1GaWxlbmFtZSB9IGZyb20gJ2ZzLWljb252L3V0aWwnO1xuaW1wb3J0IHsgY3JsZiwgQ1JMRiwgUl9DUkxGIH0gZnJvbSAnY3JsZi1ub3JtYWxpemUnO1xuaW1wb3J0IFN0clV0aWwgPSByZXF1aXJlKCdzdHItdXRpbCcpO1xuaW1wb3J0IHsgRW51bU5vdmVsU3RhdHVzIH0gZnJvbSAnbm9kZS1ub3ZlbC1pbmZvL2xpYi9jb25zdCc7XG5cbi8vaW1wb3J0ICogYXMgbW9tZW50IGZyb20gJ21vbWVudCc7XG5pbXBvcnQgbW9tZW50ID0gcmVxdWlyZSgnbW9tZW50LXRpbWV6b25lJyk7XG5pbXBvcnQgeyBfZml4Vm9sdW1lQ2hhcHRlck5hbWUsIGlzVW5kZWYgfSBmcm9tICcuLi91dGlsJztcblxuaW1wb3J0IEV2ZW50RW1pdHRlciA9IHJlcXVpcmUoJ2V2ZW50cycpO1xuaW1wb3J0IHsgSURvd25sb2FkT3B0aW9ucyB9IGZyb20gJy4vZGVtby9iYXNlJztcblxubW9tZW50LmZuLnRvSlNPTiA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuIHRoaXMuZm9ybWF0KCk7IH07XG5cbmV4cG9ydCB7IG1vbWVudCB9O1xuXG5leHBvcnQgeyBibHVlYmlyZERlY29yYXRvciwgUHJvbWlzZUJsdWViaXJkIH1cblxuZXhwb3J0IGNvbnN0IFNZTUJPTF9DQUNIRSA9IFN5bWJvbC5mb3IoJ2NhY2hlJyk7XG5cbmV4cG9ydCBjbGFzcyBOb3ZlbFNpdGUgaW1wbGVtZW50cyBOb3ZlbFNpdGUuSU5vdmVsU2l0ZVxue1xuXHRwdWJsaWMgc3RhdGljIHJlYWRvbmx5IElES0VZOiBzdHJpbmcgPSBudWxsO1xuXG5cdHB1YmxpYyBQQVRIX05PVkVMX01BSU46IHN0cmluZztcblx0cHVibGljIG9wdGlvbnNJbml0PzogTm92ZWxTaXRlLklPcHRpb25zO1xuXG5cdGNvbnN0cnVjdG9yKG9wdGlvbnM6IE5vdmVsU2l0ZS5JT3B0aW9ucywgLi4uYXJndilcblx0e1xuXHRcdGlmICghdGhpcy5JREtFWSlcblx0XHR7XG5cdFx0XHR0aHJvdyBuZXcgUmVmZXJlbmNlRXJyb3IoYElES0VZIGlzIG51bGxgKTtcblx0XHR9XG5cblx0XHR0aGlzLm9wdGlvbnNJbml0ID0gb3B0aW9ucztcblx0XHR0aGlzLm9wdGlvbnNJbml0LmN3ZCA9IHRoaXMub3B0aW9uc0luaXQuY3dkIHx8IHByb2Nlc3MuY3dkKCk7XG5cblx0XHRbdGhpcy5QQVRIX05PVkVMX01BSU4sIHRoaXMub3B0aW9uc0luaXRdID0gdGhpcy5nZXRPdXRwdXREaXIodGhpcy5vcHRpb25zSW5pdCk7XG5cblx0XHRpZiAodGhpcy5vcHRpb25zSW5pdC5kZWJ1Z0xvZylcblx0XHR7XG5cdFx0XHRjb25zb2xlRGVidWcuZW5hYmxlZCA9IHRydWU7XG5cdFx0fVxuXHR9XG5cblx0c3RhdGljIGNyZWF0ZShvcHRpb25zOiBOb3ZlbFNpdGUuSU9wdGlvbnMsIC4uLmFyZ3YpXG5cdHtcblx0XHRyZXR1cm4gbmV3IHRoaXMob3B0aW9ucywgLi4uYXJndik7XG5cdH1cblxuXHRzdGF0aWMgY2hlY2sodXJsOiBzdHJpbmcgfCBVUkwgfCBOb3ZlbFNpdGUuSVBhcnNlVXJsLCBvcHRpb25zPyk6IGJvb2xlYW5cblx0e1xuXHRcdHJldHVybiBmYWxzZTtcblx0fVxuXG5cdHNlc3Npb248VCA9IE5vdmVsU2l0ZS5JT3B0aW9uc1J1bnRpbWU+KG9wdGlvbnNSdW50aW1lOiBUICYgTm92ZWxTaXRlLklPcHRpb25zUnVudGltZSwgdXJsPzogVVJMKVxuXHR7XG5cdFx0b3B0aW9uc1J1bnRpbWUub3B0aW9uc0pTRE9NID0gY3JlYXRlT3B0aW9uc0pTRE9NKG9wdGlvbnNSdW50aW1lLm9wdGlvbnNKU0RPTSk7XG5cblx0XHRpZiAodXJsKVxuXHRcdHtcblx0XHRcdG9wdGlvbnNSdW50aW1lW1NZTUJPTF9DQUNIRV0udXJsID0gdXJsO1xuXHRcdH1cblxuXHRcdHJldHVybiB0aGlzO1xuXHR9XG5cblx0ZG93bmxvYWQodXJsOiBzdHJpbmcgfCBVUkwsIG9wdGlvbnM/OiBOb3ZlbFNpdGUuSURvd25sb2FkT3B0aW9ucyk6IFByb21pc2VCbHVlYmlyZDxOb3ZlbFNpdGUuSU5vdmVsPlxuXHR7XG5cdFx0dGhyb3cgbmV3IFN5bnRheEVycm9yKGBGdW5jdGlvbiBub3QgaW1wbGVtZW50ZWRgKTtcblx0fVxuXG5cdGdldF92b2x1bWVfbGlzdDxUID0gTm92ZWxTaXRlLklPcHRpb25zUnVudGltZT4odXJsOiBzdHJpbmcgfCBVUkwsXG5cdFx0b3B0aW9uc1J1bnRpbWU6IFBhcnRpYWw8VCAmIE5vdmVsU2l0ZS5JRG93bmxvYWRPcHRpb25zPiA9IHt9LFxuXHQpOiBQcm9taXNlPE5vdmVsU2l0ZS5JTm92ZWw+XG5cdHtcblx0XHR0aHJvdyBuZXcgU3ludGF4RXJyb3IoYEZ1bmN0aW9uIG5vdCBpbXBsZW1lbnRlZGApO1xuXHR9XG5cblx0bWFrZVVybDxUIGV4dGVuZHMgTm92ZWxTaXRlLklPcHRpb25zUnVudGltZT4odXJsb2JqOiBOb3ZlbFNpdGUuSVBhcnNlVXJsLCBvcHRpb25zPywgb3B0aW9uc1J1bnRpbWU/OiBUKTogVVJMXG5cdHtcblx0XHR0aHJvdyBuZXcgU3ludGF4RXJyb3IoYEZ1bmN0aW9uIG5vdCBpbXBsZW1lbnRlZGApO1xuXHR9XG5cblx0cGFyc2VVcmwodXJsOiBVUkwgfCBzdHJpbmcsIG9wdGlvbnM/KTogTm92ZWxTaXRlLklQYXJzZVVybFxuXHR7XG5cdFx0dGhyb3cgbmV3IFN5bnRheEVycm9yKGBGdW5jdGlvbiBub3QgaW1wbGVtZW50ZWRgKTtcblx0fVxuXG5cdGdldFN0YXRpYzxUID0gdHlwZW9mIE5vdmVsU2l0ZT4oKTogVFxuXHR7XG5cdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdHJldHVybiB0aGlzLl9fcHJvdG9fXy5jb25zdHJ1Y3Rvcjtcblx0fVxuXG5cdGdldCBJREtFWSgpOiBzdHJpbmdcblx0e1xuXHRcdGxldCBrZXkgPSB0aGlzLmdldFN0YXRpYygpLklES0VZO1xuXG5cdFx0aWYgKHR5cGVvZiBrZXkgIT0gJ3N0cmluZycgfHwgIWtleSlcblx0XHR7XG5cdFx0XHR0aHJvdyBuZXcgU3ludGF4RXJyb3IoYElES0VZIG5vdCBpbXBsZW1lbnRlZGApO1xuXHRcdH1cblxuXHRcdHJldHVybiBrZXk7XG5cdH1cblxuXHRwcm90ZWN0ZWQgX3BhdGhOb3ZlbElEPE4gZXh0ZW5kcyBOb3ZlbFNpdGUuSU5vdmVsLCBUIGV4dGVuZHMgTm92ZWxTaXRlLklPcHRpb25zUnVudGltZT4obm92ZWw6IE4sIG9wdGlvbnNSdW50aW1lOiBUKVxuXHR7XG5cdFx0cmV0dXJuIG5vdmVsLnVybF9kYXRhLm5vdmVsX2lkO1xuXHR9XG5cblx0Z2V0UGF0aE5vdmVsPE4gZXh0ZW5kcyBOb3ZlbFNpdGUuSU5vdmVsLCBUIGV4dGVuZHMgTm92ZWxTaXRlLklPcHRpb25zUnVudGltZT4oUEFUSF9OT1ZFTF9NQUlOOiBzdHJpbmcsXG5cdFx0bm92ZWw6IE4sXG5cdFx0b3B0aW9uc1J1bnRpbWU6IFQsXG5cdClcblx0e1xuXHRcdGxldCBuYW1lOiBzdHJpbmc7XG5cblx0XHRsZXQgbm92ZWxfaWQgPSB0aGlzLl9wYXRoTm92ZWxJRChub3ZlbCwgb3B0aW9uc1J1bnRpbWUpO1xuXG5cdFx0aWYgKG9wdGlvbnNSdW50aW1lLnBhdGhOb3ZlbFN0eWxlKVxuXHRcdHtcblx0XHRcdGlmIChvcHRpb25zUnVudGltZS5wYXRoTm92ZWxTdHlsZSA9PSBOb3ZlbFNpdGUuRW51bVBhdGhOb3ZlbFN0eWxlLk5PVkVMSUQpXG5cdFx0XHR7XG5cdFx0XHRcdG5hbWUgPSBub3ZlbF9pZDtcblx0XHRcdH1cblx0XHR9XG5cblx0XHRpZiAobmFtZSA9PSBudWxsKVxuXHRcdHtcblx0XHRcdG5hbWUgPSBgJHt0aGlzLnRyaW1GaWxlbmFtZU5vdmVsKG5vdmVsLm5vdmVsX3RpdGxlKX1fKCR7bm92ZWxfaWR9KWBcblx0XHR9XG5cblx0XHRyZXR1cm4gcGF0aC5qb2luKFBBVEhfTk9WRUxfTUFJTiwgbmFtZSk7XG5cdH1cblxuXHQvKipcblx0ICog5aaC5p6c5bey57aT5LiL6LyJ6YGOIOWJh+ippuWcluW+niBSRUFETUUubWQg5YWn6K6A5Y+W57y65ryP55qE5LiL6LyJ6Kit5a6aXG5cdCAqXG5cdCAqIEBwcml2YXRlXG5cdCAqL1xuXHRfbG9hZEV4aXN0c0NvbmY8VCwgTiBleHRlbmRzIE5vdmVsU2l0ZS5JTm92ZWw+KGlucHV0VXJsLCBvcHRpb25zUnVudGltZTogVCwgbm92ZWw6IE4sIHBhdGhfbm92ZWw6IHN0cmluZylcblx0e1xuXHRcdGxldCBmaWxlID0gcGF0aC5yZXNvbHZlKHBhdGhfbm92ZWwsICdSRUFETUUubWQnKTtcblxuXHRcdGlmIChmcy5wYXRoRXhpc3RzU3luYyhmaWxlKSlcblx0XHR7XG5cdFx0XHRsZXQgbWQgPSBmcy5yZWFkRmlsZVN5bmMoZmlsZSkudG9TdHJpbmcoKTtcblxuXHRcdFx0bGV0IGNvbmYgPSBub3ZlbEluZm8ucGFyc2UobWQsIHtcblx0XHRcdFx0bG93Q2hlY2tMZXZlbDogdHJ1ZSxcblx0XHRcdFx0dGhyb3c6IGZhbHNlLFxuXHRcdFx0fSk7XG5cblx0XHRcdGNvbnNvbGVEZWJ1Zy5kZWJ1Zygn5qqi5p+lIFJFQURNRS5tZCDmmK/lkKblrZjlnKjkuIvovInoqK3lrponKTtcblxuXHRcdFx0aWYgKGNvbmYgJiYgY29uZi5vcHRpb25zKVxuXHRcdFx0e1xuXHRcdFx0XHRpZiAoY29uZi5vcHRpb25zLmRvd25sb2FkT3B0aW9ucyB8fCBjb25mLm9wdGlvbnMuZG93bmxvYWRvcHRpb25zKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0Y29uc29sZURlYnVnLmRlYnVnKCfovInlhaXkuKbkuJTlkIjkvbXlt7LlrZjlnKjnmoToqK3lrponKTtcblxuXHRcdFx0XHRcdE9iamVjdC5lbnRyaWVzKGNvbmYub3B0aW9ucy5kb3dubG9hZE9wdGlvbnMgfHwgY29uZi5vcHRpb25zLmRvd25sb2Fkb3B0aW9ucylcblx0XHRcdFx0XHRcdC5mb3JFYWNoKGZ1bmN0aW9uIChbaywgdl0pXG5cdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdGlmIChvcHRpb25zUnVudGltZVtrXSA9PSBudWxsKVxuXHRcdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdFx0b3B0aW9uc1J1bnRpbWVba10gPSB2O1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHR9KVxuXHRcdFx0XHRcdDtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdGdldE91dHB1dERpcjxUPihvcHRpb25zPzogVCAmIE5vdmVsU2l0ZS5JT3B0aW9ucywgbm92ZWxOYW1lPzogc3RyaW5nKTogW3N0cmluZywgVCAmIE5vdmVsU2l0ZS5JT3B0aW9uc11cblx0e1xuXHRcdG9wdGlvbnMgPSBPYmplY3QuYXNzaWduKHt9LCB0aGlzLm9wdGlvbnNJbml0LCBvcHRpb25zKTtcblxuXHRcdGlmICghb3B0aW9ucy5vdXRwdXREaXIpXG5cdFx0e1xuXHRcdFx0dGhyb3cgbmV3IFJlZmVyZW5jZUVycm9yKGBvcHRpb25zOiBvdXRwdXREaXIgaXMgbm90IHNldGApO1xuXHRcdH1cblxuXHRcdGxldCBwID0gcGF0aC5qb2luKG9wdGlvbnMub3V0cHV0RGlyLCBvcHRpb25zLmRpc2FibGVPdXRwdXREaXJQcmVmaXggPyAnJyA6IHRoaXMuSURLRVkpO1xuXG5cdFx0aWYgKCFwYXRoLmlzQWJzb2x1dGUocCkpXG5cdFx0e1xuXHRcdFx0cCA9IHBhdGguam9pbihvcHRpb25zLmN3ZCwgcCk7XG5cdFx0fVxuXG5cdFx0cm9vdFBhdGguZGlzYWJsZVBhdGhzLmNvbmNhdChfX2Rpcm5hbWUpLmZvckVhY2goZnVuY3Rpb24gKGRpcilcblx0XHR7XG5cdFx0XHRpZiAocC5pbmRleE9mKF9fZGlybmFtZSkgPT0gMClcblx0XHRcdHtcblx0XHRcdFx0dGhyb3cgbmV3IFJlZmVyZW5jZUVycm9yKGBwYXRoIG5vdCBhbGxvdyBcIiR7cH1cImApXG5cdFx0XHR9XG5cdFx0fSk7XG5cblx0XHRpZiAodHlwZW9mIG5vdmVsTmFtZSA9PSAnc3RyaW5nJyB8fCBub3ZlbE5hbWUpXG5cdFx0e1xuXHRcdFx0aWYgKCFub3ZlbE5hbWUpXG5cdFx0XHR7XG5cdFx0XHRcdHRocm93IG5ldyBSZWZlcmVuY2VFcnJvcigpO1xuXHRcdFx0fVxuXG5cdFx0XHRwID0gcGF0aC5qb2luKHAsIG5vdmVsTmFtZSk7XG5cdFx0fVxuXG5cdFx0b3B0aW9ucyA9IHRoaXMuX2ZpeE9wdGlvbnNSdW50aW1lKG9wdGlvbnMpO1xuXG5cdFx0cmV0dXJuIFtwLCBvcHRpb25zXTtcblx0fVxuXG5cdHByb3RlY3RlZCBfZml4T3B0aW9uc1J1bnRpbWU8VCA9IE5vdmVsU2l0ZS5JT3B0aW9uc1J1bnRpbWU+KG9wdGlvbnNSdW50aW1lOiBUICYgTm92ZWxTaXRlLklPcHRpb25zUnVudGltZSk6IFQgJiBOb3ZlbFNpdGUuSU9wdGlvbnNSdW50aW1lXG5cdHtcblx0XHRvcHRpb25zUnVudGltZVtTWU1CT0xfQ0FDSEVdID0gKG9wdGlvbnNSdW50aW1lW1NZTUJPTF9DQUNIRV0gfHwge30pIGFzIHtcblx0XHRcdHVybD86IFVSTCxcblx0XHRcdHBhdGhfbm92ZWw/OiBzdHJpbmcsXG5cdFx0XHRub3ZlbD86IE5vdmVsU2l0ZS5JTm92ZWwsXG5cdFx0fTtcblxuXHRcdG9wdGlvbnNSdW50aW1lLnN0YXJ0SW5kZXggPSBvcHRpb25zUnVudGltZS5zdGFydEluZGV4IHx8IDA7XG5cblx0XHQvLyBAdHMtaWdub3JlXG5cdFx0b3B0aW9uc1J1bnRpbWUub3B0aW9uc0pTRE9NID0gY3JlYXRlT3B0aW9uc0pTRE9NKG9wdGlvbnNSdW50aW1lLm9wdGlvbnNKU0RPTSk7XG5cblxuXHRcdGlmIChvcHRpb25zUnVudGltZS5kZWJ1Z0xvZyAhPSBudWxsKVxuXHRcdHtcblx0XHRcdG9wdGlvbnNSdW50aW1lLmRlYnVnTG9nID0gISFvcHRpb25zUnVudGltZS5kZWJ1Z0xvZztcblx0XHR9XG5cblx0XHRyZXR1cm4gb3B0aW9uc1J1bnRpbWU7XG5cdH1cblxuXHR0cmltRmlsZW5hbWVDaGFwdGVyKG5hbWUpOiBzdHJpbmdcblx0e1xuXHRcdHJldHVybiB0aGlzLnRyaW1GaWxlbmFtZShuYW1lKTtcblx0fVxuXG5cdHRyaW1GaWxlbmFtZVZvbHVtZShuYW1lKTogc3RyaW5nXG5cdHtcblx0XHRyZXR1cm4gdGhpcy50cmltRmlsZW5hbWUobmFtZSk7XG5cdH1cblxuXHR0cmltRmlsZW5hbWVOb3ZlbChuYW1lKTogc3RyaW5nXG5cdHtcblx0XHRyZXR1cm4gdGhpcy50cmltRmlsZW5hbWUobmFtZSk7XG5cdH1cblxuXHR0cmltRmlsZW5hbWUobmFtZSk6IHN0cmluZ1xuXHR7XG5cdFx0cmV0dXJuIHRyaW1GaWxlbmFtZShfZml4Vm9sdW1lQ2hhcHRlck5hbWUobmFtZSkpO1xuXHR9XG5cblx0dHJpbVRhZyh0YWcpOiBzdHJpbmdcblx0e1xuXHRcdHJldHVybiAodGFnIGFzIHN0cmluZylcblx0XHRcdC5yZXBsYWNlKC9bXFxbXFxdXFwvXFxcXF0vZywgKHMpID0+XG5cdFx0XHR7XG5cdFx0XHRcdHJldHVybiBTdHJVdGlsLnRvRnVsbFdpZHRoKHMpXG5cdFx0XHR9KVxuXHRcdFx0O1xuXHR9XG5cblx0cHJvdGVjdGVkIF9leHBvcnREb3dubG9hZE9wdGlvbnM8VCA9IElPcHRpb25zUnVudGltZT4ob3B0aW9uc1J1bnRpbWU/OiBUICYgSU9wdGlvbnNSdW50aW1lKTogdW5rbm93blxuXHR7XG5cdFx0cmV0dXJuIHZvaWQgKDApO1xuXHR9XG5cblx0cHJvdGVjdGVkIF9oYW5kbGVEYXRhRm9yU3RyaW5naWZ5KC4uLmFyZ3YpOiBJTWRjb25mTWV0YVxuXHR7XG5cdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdGxldCBtZGNvbmY6IElNZGNvbmZNZXRhID0gX2hhbmRsZURhdGFGb3JTdHJpbmdpZnkoLi4uYXJndik7XG5cblx0XHRpZiAobWRjb25mLm5vdmVsKVxuXHRcdHtcblx0XHRcdGlmIChtZGNvbmYubm92ZWwudGFncyAmJiBBcnJheS5pc0FycmF5KG1kY29uZi5ub3ZlbC50YWdzKSlcblx0XHRcdHtcblx0XHRcdFx0bGV0IGJvb2w6IGJvb2xlYW47XG5cblx0XHRcdFx0Ym9vbCA9IFtcblx0XHRcdFx0XHQn5pu457GN5YyWJyxcblx0XHRcdFx0XHQn5Lmm57GN5YyWJyxcblx0XHRcdFx0XHQn5paH5bqr5YyWJyxcblx0XHRcdFx0XHQn5paH5bqT5YyWJyxcblx0XHRcdFx0XS5zb21lKHYgPT5cblx0XHRcdFx0e1xuXHRcdFx0XHRcdHJldHVybiBtZGNvbmYubm92ZWwudGFncy5pbmNsdWRlcyh2KVxuXHRcdFx0XHR9KTtcblxuXHRcdFx0XHRpZiAoYm9vbClcblx0XHRcdFx0e1xuXHRcdFx0XHRcdG1kY29uZi5ub3ZlbC5ub3ZlbF9zdGF0dXMgPSAobWRjb25mLm5vdmVsLm5vdmVsX3N0YXR1cyB8IDApIHwgRW51bU5vdmVsU3RhdHVzLlBfQk9PSztcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHJldHVybiBtZGNvbmY7XG5cdH1cblxuXHRwcm90ZWN0ZWQgX3NhdmVSZWFkbWUob3B0aW9uc1J1bnRpbWU/OiBJT3B0aW9uc1J1bnRpbWUsIG9wdGlvbnMgPSB7fSwgLi4ub3B0cylcblx0e1xuXHRcdGNvbnN0IHNlbGYgPSB0aGlzO1xuXG5cdFx0aWYgKGlzVW5kZWYob3B0aW9uc1J1bnRpbWUpXG5cdFx0XHR8fCBpc1VuZGVmKG9wdGlvbnNSdW50aW1lW1NZTUJPTF9DQUNIRV0sIHt9KVxuXG5cdFx0XHR8fCBpc1VuZGVmKG9wdGlvbnNSdW50aW1lW1NZTUJPTF9DQUNIRV0ubm92ZWwsIHt9KVxuXHRcdFx0fHwgaXNVbmRlZihvcHRpb25zUnVudGltZVtTWU1CT0xfQ0FDSEVdLnBhdGhfbm92ZWwsICcnKVxuXHRcdClcblx0XHR7XG5cdFx0XHR0aHJvdyBuZXcgUmVmZXJlbmNlRXJyb3IoYHNhdmVSZWFkbWVgKTtcblx0XHR9XG5cblx0XHRjb25zdCBub3ZlbCA9IG9wdGlvbnNSdW50aW1lW1NZTUJPTF9DQUNIRV0ubm92ZWw7XG5cdFx0Y29uc3QgcGF0aF9ub3ZlbCA9IG9wdGlvbnNSdW50aW1lW1NZTUJPTF9DQUNIRV0ucGF0aF9ub3ZlbDtcblxuXHRcdGxldCBtZGNvbmZpZyA9IHRoaXMuX2hhbmRsZURhdGFGb3JTdHJpbmdpZnkoe1xuXHRcdFx0bm92ZWw6IHtcblx0XHRcdFx0aWxsdXN0OiAnJyxcblx0XHRcdFx0dGl0bGVfemgxOiAnJyxcblx0XHRcdFx0aWxsdXN0czogW10sXG5cdFx0XHRcdHB1Ymxpc2hlcnM6IFtcblx0XHRcdFx0XHRzZWxmLklES0VZLFxuXHRcdFx0XHRdLFxuXHRcdFx0XHR0YWdzOiBbXG5cdFx0XHRcdFx0c2VsZi5JREtFWSxcblx0XHRcdFx0XSxcblx0XHRcdFx0c2VyaWVzOiB7XG5cdFx0XHRcdFx0bmFtZTogbm92ZWwubm92ZWxfc2VyaWVzX3RpdGxlIHx8IG5vdmVsLm5vdmVsX3RpdGxlIHx8ICcnLFxuXHRcdFx0XHR9LFxuXHRcdFx0XHRub3ZlbF9zdGF0dXM6IDAsXG5cdFx0XHR9LFxuXHRcdFx0b3B0aW9ucyxcblxuXHRcdFx0bGluazogbm92ZWwubGluayB8fCBbXSxcblx0XHR9LCBub3ZlbCwgLi4ub3B0cyk7XG5cblx0XHRsZXQgbWQgPSBub3ZlbEluZm8uc3RyaW5naWZ5KG1kY29uZmlnKTtcblxuXHRcdGxldCBmaWxlID0gcGF0aC5qb2luKHBhdGhfbm92ZWwsIGBSRUFETUUubWRgKTtcblxuXHRcdGNvbnNvbGVEZWJ1Zy5pbmZvKGBbTUVUQV1gLCBgc2F2ZSBSRUFETUUubWRgKTtcblxuXHRcdHJldHVybiBmcy5vdXRwdXRGaWxlKGZpbGUsIG1kKVxuXHRcdFx0LnRoZW4oZnVuY3Rpb24gKClcblx0XHRcdHtcblx0XHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0XHRmaWxlLFxuXHRcdFx0XHRcdG1kLFxuXHRcdFx0XHR9O1xuXHRcdFx0fSlcblx0XHRcdDtcblx0fVxuXG5cdGNyZWF0ZU1haW5Vcmw8VCA9IElPcHRpb25zUnVudGltZT4odXJsOiBzdHJpbmcgfCBVUkwsIG9wdGlvbnNSdW50aW1lPzogVCAmIElPcHRpb25zUnVudGltZSk6IFVSTFxuXHR7XG5cdFx0bGV0IGRhdGEgPSB0aGlzLnBhcnNlVXJsKHVybCk7XG5cblx0XHRpZiAoIWRhdGEgfHwgIWRhdGEubm92ZWxfaWQpXG5cdFx0e1xuXHRcdFx0Ly9jb25zb2xlLmxvZyhkYXRhKTtcblxuXHRcdFx0dGhyb3cgbmV3IFJlZmVyZW5jZUVycm9yKCk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHRoaXMubWFrZVVybChkYXRhLCB0cnVlLCBvcHRpb25zUnVudGltZSk7XG5cdH1cblxuXHRwcm90ZWN0ZWQgX2NyZWF0ZUNoYXB0ZXJVcmw8VCA9IElPcHRpb25zUnVudGltZT4oe1xuXHRcdG5vdmVsLFxuXHRcdHZvbHVtZSxcblx0XHRjaGFwdGVyLFxuXHR9OiB7XG5cdFx0bm92ZWw6IE5vdmVsU2l0ZS5JTm92ZWwsXG5cdFx0dm9sdW1lOiBOb3ZlbFNpdGUuSVZvbHVtZSxcblx0XHRjaGFwdGVyOiBOb3ZlbFNpdGUuSUNoYXB0ZXIsXG5cdH0sIG9wdGlvbnNSdW50aW1lPzogVCAmIElPcHRpb25zUnVudGltZSk6IFVSTFxuXHR7XG5cdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdHJldHVybiBuZXcgVVJMKGNoYXB0ZXIuY2hhcHRlcl91cmwpO1xuXHR9XG5cblx0cHJvdGVjdGVkIF9mZXRjaENoYXB0ZXI8VD4odXJsOiBVUkwsIG9wdGlvbnNSdW50aW1lOiBUICYgSU9wdGlvbnNSdW50aW1lKVxuXHR7XG5cdFx0dGhyb3cgbmV3IFN5bnRheEVycm9yKGBGdW5jdGlvbiBub3QgaW1wbGVtZW50ZWRgKTtcblx0fVxuXG5cdHByb3RlY3RlZCBfcGFyc2VDaGFwdGVyPFQ+KGRvbSwgb3B0aW9uc1J1bnRpbWU6IFQgJiBJT3B0aW9uc1J1bnRpbWUsIGNhY2hlOiB7XG5cdFx0ZmlsZTogc3RyaW5nLFxuXHRcdG5vdmVsOiBOb3ZlbFNpdGUuSU5vdmVsLFxuXHRcdHZvbHVtZTogTm92ZWxTaXRlLklWb2x1bWUsXG5cdFx0Y2hhcHRlcjogTm92ZWxTaXRlLklDaGFwdGVyLFxuXHR9KVxuXHR7XG5cdFx0dGhyb3cgbmV3IFN5bnRheEVycm9yKGBGdW5jdGlvbiBub3QgaW1wbGVtZW50ZWRgKTtcblx0fVxuXG5cdGdldEV4dHJhSW5mbzxULCBNIGV4dGVuZHMgUGFydGlhbDxJTm92ZWwgJiBJTWRjb25mTWV0YT4sIEMgZXh0ZW5kcyB1bmtub3duPih1cmxvYmo6IE5vdmVsU2l0ZS5JUGFyc2VVcmwsXG5cdFx0b3B0aW9uc1J1bnRpbWU6IFQgJiBJT3B0aW9uc1J1bnRpbWUsXG5cdFx0ZGF0YV9tZXRhPzogTSxcblx0XHRjYWNoZT86IEMsXG5cdCk6IFByb21pc2VCbHVlYmlyZDxNPlxuXHR7XG5cdFx0dGhyb3cgbmV3IFN5bnRheEVycm9yKGBGdW5jdGlvbiBub3QgaW1wbGVtZW50ZWRgKTtcblx0fVxuXG5cdHByb3RlY3RlZCBfY2hlY2tFeGlzdHMob3B0aW9uc1J1bnRpbWU6IElPcHRpb25zUnVudGltZSwgZmlsZTogc3RyaW5nKTogYm9vbGVhblxuXHR7XG5cdFx0aWYgKCFvcHRpb25zUnVudGltZS5kaXNhYmxlQ2hlY2tFeGlzdHMgJiYgZnMuZXhpc3RzU3luYyhmaWxlKSlcblx0XHR7XG5cdFx0XHRsZXQgdHh0ID0gZnMucmVhZEZpbGVTeW5jKGZpbGUpO1xuXG5cdFx0XHRpZiAodHh0LnRvU3RyaW5nKCkucmVwbGFjZSgvXlxccyt8XFxzKyQvZywgJycpKVxuXHRcdFx0e1xuXHRcdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHRyZXR1cm4gZmFsc2Vcblx0fVxuXG5cdHByb3RlY3RlZCBlbWl0KGV2ZW50OiBFdmVudEVtaXR0ZXIsIGV2ZW50TmFtZTogc3RyaW5nLCAuLi5hcmd2KVxuXHR7XG5cdFx0bGV0IGJvb2wgPSBldmVudC5lbWl0KGV2ZW50TmFtZSwgdGhpcywgLi4uYXJndik7XG5cdFx0cmV0dXJuIFtldmVudCwgYm9vbF07XG5cdH1cblxuXHRfc2F2ZUZpbGU8VCA9IE5vdmVsU2l0ZS5JT3B0aW9uc1J1bnRpbWU+KG9wdHM6IHtcblx0XHRmaWxlOiBzdHJpbmcsXG5cdFx0Y29udGV4dDogc3RyaW5nIHwgQnVmZmVyLFxuXHRcdG9wdGlvbnNSdW50aW1lOiBUICYgTm92ZWxTaXRlLklPcHRpb25zUnVudGltZSxcblx0fSlcblx0e1xuXHRcdHJldHVybiBQcm9taXNlQmx1ZWJpcmQucmVzb2x2ZSgpXG5cdFx0XHQuYmluZCh0aGlzKVxuXHRcdFx0LnRoZW4oKCkgPT4ge1xuXHRcdFx0XHRsZXQgeyBmaWxlLCBjb250ZXh0LCBvcHRpb25zUnVudGltZSB9ID0gb3B0cztcblxuXHRcdFx0XHRpZiAob3B0aW9uc1J1bnRpbWUubGluZUJyZWFrQ3JsZilcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGxldCB0eHQxID0gY29udGV4dC50b1N0cmluZygpO1xuXG5cdFx0XHRcdFx0aWYgKFJfQ1JMRi50ZXN0KHR4dDEpKVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdGxldCB0eHQyID0gY3JsZih0eHQxLCBDUkxGKTtcblxuXHRcdFx0XHRcdFx0aWYgKHR4dDEgIT09IHR4dDIpXG5cdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdGNvbnRleHQgPSB0eHQyO1xuXHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHR0eHQxID0gbnVsbDtcblx0XHRcdFx0XHRcdHR4dDIgPSBudWxsO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXG5cdFx0XHRcdHJldHVybiBmcy5vdXRwdXRGaWxlKGZpbGUsIGNvbnRleHQpXG5cdFx0XHRcdFx0LnRoZW4ociA9PiB7XG5cblx0XHRcdFx0XHRcdGlmIChvcHRpb25zUnVudGltZS5kZWJ1Z0xvZylcblx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0bGV0IGZpbGUyID0gcGF0aC5yZWxhdGl2ZShvcHRpb25zUnVudGltZS5vdXRwdXREaXIsIGZpbGUpO1xuXG5cdFx0XHRcdFx0XHRcdGNvbnNvbGVEZWJ1Zy5zdWNjZXNzKGBbU0FWRV1gLCBmaWxlMik7XG5cdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdHJldHVybiByO1xuXHRcdFx0XHRcdH0pXG5cdFx0XHR9KVxuXHRcdDtcblx0fVxuXG59XG5cbmV4cG9ydCBpbXBvcnQgSU9wdGlvbnNSdW50aW1lID0gTm92ZWxTaXRlLklPcHRpb25zUnVudGltZTtcbmV4cG9ydCBpbXBvcnQgSVZvbHVtZSA9IE5vdmVsU2l0ZS5JVm9sdW1lO1xuZXhwb3J0IGltcG9ydCBJQ2hhcHRlciA9IE5vdmVsU2l0ZS5JQ2hhcHRlcjtcbmV4cG9ydCBpbXBvcnQgRW51bVBhdGhOb3ZlbFN0eWxlID0gTm92ZWxTaXRlLkVudW1QYXRoTm92ZWxTdHlsZTtcbmltcG9ydCB7IElOb3ZlbCB9IGZyb20gJy4vc3lvc2V0dSc7XG5pbXBvcnQgeyBjb25zb2xlRGVidWcgfSBmcm9tICcuLi91dGlsL2xvZyc7XG5cbmV4cG9ydCBuYW1lc3BhY2UgTm92ZWxTaXRlXG57XG5cblx0ZXhwb3J0IHR5cGUgSUZpbGVQcmVmaXhNb2RlID0gMCB8IDEgfCAyIHwgMyB8IDQgfCA1O1xuXG5cdGV4cG9ydCB0eXBlIElPcHRpb25zUGx1cyA9IHtcblxuXHRcdGRpc2FibGVPdXRwdXREaXJQcmVmaXg/OiBib29sZWFuLFxuXG5cdFx0bm9EaXJQcmVmaXg/OiBib29sZWFuLFxuXHRcdG5vRGlyUGFkZW5kPzogYm9vbGVhbixcblxuXHRcdG5vRmlyZVByZWZpeD86IGJvb2xlYW4sXG5cdFx0bm9GaWxlUGFkZW5kPzogYm9vbGVhbixcblxuXHRcdHJldHJ5RGVsYXk/OiBudW1iZXIsXG5cdFx0c3RhcnRJbmRleD86IG51bWJlcixcblxuXHRcdGZpbGVQcmVmaXhNb2RlPzogbnVtYmVyIHwgSUZpbGVQcmVmaXhNb2RlLFxuXG5cdFx0YWxsb3dFbXB0eVZvbHVtZVRpdGxlPzogYm9vbGVhbixcblxuXHRcdGV2ZW50PzogRXZlbnRFbWl0dGVyLFxuXG5cdFx0LyoqXG5cdFx0ICog55So5L6G55m75YWl56uZ6bue55qEIGNvb2tpZXMgc2Vzc2lvblxuXHRcdCAqL1xuXHRcdHNlc3Npb25EYXRhPzoge1xuXHRcdFx0W2tleTogc3RyaW5nXTogYW55LFxuXHRcdH0sXG5cblx0XHQvKipcblx0XHQgKiDlj6rmipPlj5blsI/oqqrnmoQgTUVUQSDos4fmlplcblx0XHQgKi9cblx0XHRmZXRjaE1ldGFEYXRhT25seT86IGJvb2xlYW4sXG5cblx0XHRkZWJ1Z0xvZz86IGJvb2xlYW4sXG5cblx0XHRsaW5lQnJlYWtDcmxmPzogYm9vbGVhbixcblxuXHRcdC8qKlxuXHRcdCAqIOS/neeVmeazqOmfs+agvOW8j1xuXHRcdCAqL1xuXHRcdGtlZXBSdWJ5PzogYm9vbGVhbjtcblx0XHQvKipcblx0XHQgKiDkv53nlZnlhbbku5bmoLzlvI9cblx0XHQgKi9cblx0XHRrZWVwRm9ybWF0PzogYm9vbGVhbjtcblxuXHRcdC8qKlxuXHRcdCAqIOWcqOWFp+aWh+WOn+Wni+S9jee9ruS4iuS/neeVmeWclueJh1xuXHRcdCAqL1xuXHRcdGtlZXBJbWFnZT86IGJvb2xlYW47XG5cblx0fVxuXG5cdGV4cG9ydCB0eXBlIElPcHRpb25zID0ge1xuXG5cdFx0b3V0cHV0RGlyPzogc3RyaW5nLFxuXHRcdGN3ZD86IHN0cmluZyxcblxuXHR9ICYgSU9wdGlvbnNQbHVzO1xuXG5cdGV4cG9ydCBjb25zdCBlbnVtIEVudW1QYXRoTm92ZWxTdHlsZVxuXHR7XG5cdFx0REVGQVVMVCA9IDAsXG5cdFx0Tk9WRUxJRCA9IDEsXG5cdH1cblxuXHRleHBvcnQgdHlwZSBJRG93bmxvYWRPcHRpb25zID0ge1xuXG5cdFx0LyoqXG5cdFx0ICog5Y+q55Si55Sf55uu6YyE57WQ5qeLIOS4jeS4i+i8ieWFp+WuuVxuXHRcdCAqL1xuXHRcdGRpc2FibGVEb3dubG9hZD86IGJvb2xlYW4sXG5cdFx0ZGlzYWJsZUNoZWNrRXhpc3RzPzogYm9vbGVhbixcblxuXHRcdG9wdGlvbnNKU0RPTT86IElGcm9tVXJsT3B0aW9ucyAmIElPcHRpb25zSlNET00gJiB7XG5cdFx0XHRjb29raWVKYXI/OiBQYXJ0aWFsPExhenlDb29raWVKYXI+LFxuXHRcdH0sXG5cblx0XHQvKipcblx0XHQgKiDoqK3lrprlsI/oqqros4fmlpnlpL7mqKPlvI9cblx0XHQgKi9cblx0XHRwYXRoTm92ZWxTdHlsZT86IEVudW1QYXRoTm92ZWxTdHlsZSxcblxuXHR9ICYgSU9wdGlvbnNQbHVzO1xuXG5cdGV4cG9ydCB0eXBlIElPcHRpb25zUnVudGltZSA9IElPcHRpb25zICYgSURvd25sb2FkT3B0aW9ucyAmIElPcHRpb25zUGx1cztcblxuXHRleHBvcnQgaW50ZXJmYWNlIElQYXJzZVVybFxuXHR7XG5cdFx0dXJsPzogVVJMIHwgc3RyaW5nLFxuXG5cdFx0bm92ZWxfcGlkPyxcblx0XHRub3ZlbF9pZD8sXG5cdFx0Y2hhcHRlcl9pZD8sXG5cblx0XHRub3ZlbF9yMTg/LFxuXG5cdFx0W2tleTogc3RyaW5nXTogYW55LFxuXHR9XG5cblx0ZXhwb3J0IGludGVyZmFjZSBJQ2hhcHRlclxuXHR7XG5cdFx0Y2hhcHRlcl9pbmRleD86IG51bWJlciB8IHN0cmluZyxcblx0XHRjaGFwdGVyX3RpdGxlOiBzdHJpbmcsXG5cdFx0Y2hhcHRlcl9pZD9cblx0XHRjaGFwdGVyX3VybD9cblx0XHRjaGFwdGVyX3VybF9kYXRhP1xuXHRcdGNoYXB0ZXJfZGF0ZT86IG1vbWVudC5Nb21lbnQsXG5cblx0XHRpbWdzPzogc3RyaW5nW10sXG5cblx0XHRba2V5OiBzdHJpbmddOiBhbnksXG5cdH1cblxuXHRleHBvcnQgaW50ZXJmYWNlIElWb2x1bWVcblx0e1xuXHRcdHZvbHVtZV9pbmRleD9cblx0XHR2b2x1bWVfdGl0bGU6IHN0cmluZyxcblx0XHRjaGFwdGVyX2xpc3Q/OiBJQ2hhcHRlcltdLFxuXG5cdFx0W2tleTogc3RyaW5nXTogYW55LFxuXHR9XG5cblx0ZXhwb3J0IGludGVyZmFjZSBJTm92ZWxcblx0e1xuXHRcdHVybDogVVJMIHwgc3RyaW5nLFxuXHRcdHVybF9kYXRhOiBJUGFyc2VVcmwsXG5cblx0XHRub3ZlbF90aXRsZTogc3RyaW5nLFxuXHRcdG5vdmVsX2F1dGhvcj86IHN0cmluZyxcblxuXHRcdG5vdmVsX2Rlc2M/OiBzdHJpbmcsXG5cdFx0bm92ZWxfZGF0ZT86IG1vbWVudC5Nb21lbnQsXG5cdFx0bm92ZWxfcHVibGlzaGVyPzogc3RyaW5nLFxuXG5cdFx0bm92ZWxfc2VyaWVzX3RpdGxlPzogc3RyaW5nLFxuXG5cdFx0dm9sdW1lX2xpc3Q6IElWb2x1bWVbXSxcblxuXHRcdGNoZWNrZGF0ZT86IG1vbWVudC5Nb21lbnQsXG5cblx0XHRpbWdzPzogc3RyaW5nW10sXG5cblx0XHRba2V5OiBzdHJpbmddOiBhbnksXG5cdH1cblxuXHRleHBvcnQgaW50ZXJmYWNlIElOb3ZlbFNpdGVTdGF0aWM8VD4gZXh0ZW5kcyBUeXBlPFQgJiBOb3ZlbFNpdGUuSU5vdmVsU2l0ZT5cblx0e1xuXHRcdElES0VZOiBzdHJpbmcsXG5cdH1cblxuXHRleHBvcnQgaW50ZXJmYWNlIElOb3ZlbFNpdGVcblx0e1xuXHRcdGRvd25sb2FkKHVybDogc3RyaW5nIHwgVVJMLCBvcHRpb25zPzogSURvd25sb2FkT3B0aW9ucyk6IFByb21pc2VCbHVlYmlyZDxOb3ZlbFNpdGUuSU5vdmVsPjtcblxuXHRcdG1ha2VVcmwodXJsb2JqOiBOb3ZlbFNpdGUuSVBhcnNlVXJsLCBvcHRpb25zPyk6IFVSTDtcblxuXHRcdHBhcnNlVXJsKHVybDogVVJMIHwgc3RyaW5nKTogTm92ZWxTaXRlLklQYXJzZVVybDtcblx0fVxufVxuXG5leHBvcnQgaW50ZXJmYWNlIFR5cGU8VD5cbntcblx0bmV3KG9wdGlvbnM6IE5vdmVsU2l0ZS5JT3B0aW9ucywgLi4uYXJnczogYW55W10pOiBUO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc3RhdGljSW1wbGVtZW50czxUPigpXG57XG5cdHJldHVybiAoY29uc3RydWN0b3I6IFQpID0+IHt9XG59XG5cbmV4cG9ydCBkZWZhdWx0IE5vdmVsU2l0ZTtcbiJdfQ==