"use strict";
/**
 * Created by user on 2018/2/10/010.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.staticImplements = exports.EnumPathNovelStyle = exports.NovelSite = exports.SYMBOL_CACHE = exports.PromiseBluebird = exports.bluebirdDecorator = exports.moment = exports.createOptionsJSDOM = exports.defaultJSDOMOptions = void 0;
const tslib_1 = require("tslib");
const bluebird_1 = (0, tslib_1.__importDefault)(require("../decorator/bluebird"));
exports.bluebirdDecorator = bluebird_1.default;
//import bluebirdDecorator from 'bluebird-decorator';
const bluebird_2 = (0, tslib_1.__importDefault)(require("bluebird"));
exports.PromiseBluebird = bluebird_2.default;
//import { URL } from 'jsdom-url';
const upath2_1 = (0, tslib_1.__importDefault)(require("upath2"));
const _root_1 = (0, tslib_1.__importDefault)(require("../../_root"));
const jsdom_1 = require("../jsdom");
Object.defineProperty(exports, "defaultJSDOMOptions", { enumerable: true, get: function () { return jsdom_1.defaultJSDOMOptions; } });
Object.defineProperty(exports, "createOptionsJSDOM", { enumerable: true, get: function () { return jsdom_1.createOptionsJSDOM; } });
const node_novel_info_1 = (0, tslib_1.__importStar)(require("node-novel-info"));
const fs_extra_1 = (0, tslib_1.__importDefault)(require("fs-extra"));
const util_1 = require("fs-iconv/util");
const crlf_normalize_1 = require("crlf-normalize");
const str_util_1 = (0, tslib_1.__importDefault)(require("str-util"));
const const_1 = require("node-novel-info/lib/const");
const log_1 = require("../util/log");
const url_1 = (0, tslib_1.__importDefault)(require("../util/url"));
//import moment from 'moment';
const moment_timezone_1 = (0, tslib_1.__importDefault)(require("moment-timezone"));
exports.moment = moment_timezone_1.default;
const util_2 = require("../util");
moment_timezone_1.default.fn.toJSON = function () { return this.format(); };
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
        optionsRuntime.optionsJSDOM = (0, jsdom_1.createOptionsJSDOM)(optionsRuntime.optionsJSDOM);
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
        return upath2_1.default.join(PATH_NOVEL_MAIN, name);
    }
    /**
     * 如果已經下載過 則試圖從 README.md 內讀取缺漏的下載設定
     *
     * @private
     */
    _loadExistsConf(inputUrl, optionsRuntime, novel, path_novel) {
        let file = upath2_1.default.resolve(path_novel, 'README.md');
        if (fs_extra_1.default.pathExistsSync(file)) {
            let md = fs_extra_1.default.readFileSync(file).toString();
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
        let p = upath2_1.default.join(options.outputDir, options.disableOutputDirPrefix ? '' : this.IDKEY);
        if (!upath2_1.default.isAbsolute(p)) {
            p = upath2_1.default.join(options.cwd, p);
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
            p = upath2_1.default.join(p, novelName);
        }
        options = this._fixOptionsRuntime(options);
        return [p, options];
    }
    _fixOptionsRuntime(optionsRuntime) {
        optionsRuntime[exports.SYMBOL_CACHE] = (optionsRuntime[exports.SYMBOL_CACHE] || {});
        optionsRuntime.startIndex = optionsRuntime.startIndex || 0;
        // @ts-ignore
        optionsRuntime.optionsJSDOM = (0, jsdom_1.createOptionsJSDOM)(optionsRuntime.optionsJSDOM);
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
        return (0, util_1.trimFilename)((0, util_2._fixVolumeChapterName)(name));
    }
    trimTag(tag) {
        return tag
            .replace(/[\[\]\/\\]/g, (s) => {
            return str_util_1.default.toFullWidth(s);
        });
    }
    _exportDownloadOptions(optionsRuntime) {
        return void (0);
    }
    _handleDataForStringify(...argv) {
        // @ts-ignore
        let mdconf = (0, node_novel_info_1._handleDataForStringify)(...argv);
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
        if ((0, util_2.isUndef)(optionsRuntime)
            || (0, util_2.isUndef)(optionsRuntime[exports.SYMBOL_CACHE], {})
            || (0, util_2.isUndef)(optionsRuntime[exports.SYMBOL_CACHE].novel, {})
            || (0, util_2.isUndef)(optionsRuntime[exports.SYMBOL_CACHE].path_novel, '')) {
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
        let file = upath2_1.default.join(path_novel, `README.md`);
        log_1.consoleDebug.info(`[META]`, `save README.md`);
        return fs_extra_1.default.outputFile(file, md)
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
        return (0, url_1.default)(chapter.chapter_url.toString());
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
        if (!optionsRuntime.disableCheckExists && fs_extra_1.default.existsSync(file)) {
            let txt = fs_extra_1.default.readFileSync(file);
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
        return bluebird_2.default.resolve()
            .bind(this)
            .then(() => {
            let { file, context, optionsRuntime } = opts;
            if (optionsRuntime.lineBreakCrlf) {
                let txt1 = context.toString();
                if (crlf_normalize_1.R_CRLF.test(txt1)) {
                    let txt2 = (0, crlf_normalize_1.crlf)(txt1, crlf_normalize_1.CRLF);
                    if (txt1 !== txt2) {
                        context = txt2;
                    }
                    txt1 = null;
                    txt2 = null;
                }
            }
            return fs_extra_1.default.outputFile(file, context)
                .then(r => {
                if (optionsRuntime.debugLog) {
                    let file2 = upath2_1.default.relative(optionsRuntime.outputDir, file);
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
//# sourceMappingURL=index.js.map