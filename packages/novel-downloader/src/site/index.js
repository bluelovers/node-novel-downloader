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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7O0dBRUc7O0FBRUgsb0RBQXNEO0FBbUM3Qyw0QkFuQ0Ysa0JBQWlCLENBbUNFO0FBbEMxQixxREFBcUQ7QUFFckQsNENBQTZDO0FBZ0NqQiwwQ0FBZTtBQS9CM0MseUNBQWdDO0FBQ2hDLCtCQUFnQztBQUVoQyx1Q0FBbUM7QUFHbkMsb0NBQXVIO0FBRTlHLDhCQUZBLDJCQUFtQixDQUVBO0FBQWtDLDZCQUZBLDBCQUFrQixDQUVBO0FBQ2hGLHFEQUFrRjtBQUtsRiwrQkFBZ0M7QUFDaEMsd0NBQTZDO0FBQzdDLG1EQUFvRDtBQUNwRCxvQ0FBcUM7QUFDckMscURBQTREO0FBRTVELG1DQUFtQztBQUNuQywwQ0FBMkM7QUFRbEMsd0JBQU07QUFQZixrQ0FBeUQ7QUFLekQsTUFBTSxDQUFDLEVBQUUsQ0FBQyxNQUFNLEdBQUcsY0FBYyxPQUFPLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQU01QyxRQUFBLFlBQVksR0FBRyxNQUFNLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0FBRWhELE1BQWEsU0FBUztJQU9yQixZQUFZLE9BQTJCLEVBQUUsR0FBRyxJQUFJO1FBRS9DLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUNmO1lBQ0MsTUFBTSxJQUFJLGNBQWMsQ0FBQyxlQUFlLENBQUMsQ0FBQztTQUMxQztRQUVELElBQUksQ0FBQyxXQUFXLEdBQUcsT0FBTyxDQUFDO1FBQzNCLElBQUksQ0FBQyxXQUFXLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsR0FBRyxJQUFJLE9BQU8sQ0FBQyxHQUFHLEVBQUUsQ0FBQztRQUU3RCxDQUFDLElBQUksQ0FBQyxlQUFlLEVBQUUsSUFBSSxDQUFDLFdBQVcsQ0FBQyxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBRS9FLElBQUksSUFBSSxDQUFDLFdBQVcsQ0FBQyxRQUFRLEVBQzdCO1lBQ0Msa0JBQVksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDO1NBQzVCO1FBRUQsSUFBSSxDQUFDLFlBQVksQ0FBQyxPQUFPLEVBQUUsR0FBRyxJQUFJLENBQUMsQ0FBQztJQUNyQyxDQUFDO0lBRUQsWUFBWSxDQUFDLE9BQTJCLEVBQUUsR0FBRyxJQUFJO1FBRWhELGtCQUFZLENBQUMsS0FBSyxDQUFDLG1CQUFtQixDQUFDLENBQUM7SUFDekMsQ0FBQztJQUVELE1BQU0sQ0FBQyxNQUFNLENBQUMsT0FBMkIsRUFBRSxHQUFHLElBQUk7UUFFakQsT0FBTyxJQUFJLElBQUksQ0FBQyxPQUFPLEVBQUUsR0FBRyxJQUFJLENBQUMsQ0FBQztJQUNuQyxDQUFDO0lBRUQsTUFBTSxDQUFDLEtBQUssQ0FBQyxHQUF1QyxFQUFFLE9BQVE7UUFFN0QsT0FBTyxLQUFLLENBQUM7SUFDZCxDQUFDO0lBRUQsT0FBTyxDQUFnQyxjQUE2QyxFQUFFLEdBQVM7UUFFOUYsY0FBYyxDQUFDLFlBQVksR0FBRywwQkFBa0IsQ0FBQyxjQUFjLENBQUMsWUFBWSxDQUFDLENBQUM7UUFFOUUsSUFBSSxHQUFHLEVBQ1A7WUFDQyxjQUFjLENBQUMsb0JBQVksQ0FBQyxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUM7U0FDdkM7UUFFRCxPQUFPLElBQUksQ0FBQztJQUNiLENBQUM7SUFFRCxRQUFRLENBQUMsR0FBaUIsRUFBRSxPQUFvQztRQUUvRCxNQUFNLElBQUksV0FBVyxDQUFDLDBCQUEwQixDQUFDLENBQUM7SUFDbkQsQ0FBQztJQUVELGVBQWUsQ0FBZ0MsR0FBaUIsRUFDL0QsaUJBQTBELEVBQUU7UUFHNUQsTUFBTSxJQUFJLFdBQVcsQ0FBQywwQkFBMEIsQ0FBQyxDQUFDO0lBQ25ELENBQUM7SUFFRCxPQUFPLENBQXNDLE1BQTJCLEVBQUUsT0FBUSxFQUFFLGNBQWtCO1FBRXJHLE1BQU0sSUFBSSxXQUFXLENBQUMsMEJBQTBCLENBQUMsQ0FBQztJQUNuRCxDQUFDO0lBRUQsUUFBUSxDQUFDLEdBQWlCLEVBQUUsT0FBUTtRQUVuQyxNQUFNLElBQUksV0FBVyxDQUFDLDBCQUEwQixDQUFDLENBQUM7SUFDbkQsQ0FBQztJQUVELFNBQVM7UUFFUixhQUFhO1FBQ2IsT0FBTyxJQUFJLENBQUMsU0FBUyxDQUFDLFdBQVcsQ0FBQztJQUNuQyxDQUFDO0lBRUQsSUFBSSxLQUFLO1FBRVIsSUFBSSxHQUFHLEdBQUcsSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDLEtBQUssQ0FBQztRQUVqQyxJQUFJLE9BQU8sR0FBRyxJQUFJLFFBQVEsSUFBSSxDQUFDLEdBQUcsRUFDbEM7WUFDQyxNQUFNLElBQUksV0FBVyxDQUFDLHVCQUF1QixDQUFDLENBQUM7U0FDL0M7UUFFRCxPQUFPLEdBQUcsQ0FBQztJQUNaLENBQUM7SUFFUyxZQUFZLENBQWtFLEtBQVEsRUFBRSxjQUFpQjtRQUVsSCxPQUFPLEtBQUssQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDO0lBQ2hDLENBQUM7SUFFRCxZQUFZLENBQWtFLGVBQXVCLEVBQ3BHLEtBQVEsRUFDUixjQUFpQjtRQUdqQixJQUFJLElBQVksQ0FBQztRQUVqQixJQUFJLFFBQVEsR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLEtBQUssRUFBRSxjQUFjLENBQUMsQ0FBQztRQUV4RCxJQUFJLGNBQWMsQ0FBQyxjQUFjLEVBQ2pDO1lBQ0MsSUFBSSxjQUFjLENBQUMsY0FBYyxtQkFBd0MsRUFDekU7Z0JBQ0MsSUFBSSxHQUFHLFFBQVEsQ0FBQzthQUNoQjtTQUNEO1FBRUQsSUFBSSxJQUFJLElBQUksSUFBSSxFQUNoQjtZQUNDLElBQUksR0FBRyxHQUFHLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUFDLEtBQUssUUFBUSxHQUFHLENBQUE7U0FDbkU7UUFFRCxPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsZUFBZSxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQ3pDLENBQUM7SUFFRDs7OztPQUlHO0lBQ0gsZUFBZSxDQUFnQyxRQUFRLEVBQUUsY0FBaUIsRUFBRSxLQUFRLEVBQUUsVUFBa0I7UUFFdkcsSUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxVQUFVLEVBQUUsV0FBVyxDQUFDLENBQUM7UUFFakQsSUFBSSxFQUFFLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxFQUMzQjtZQUNDLElBQUksRUFBRSxHQUFHLEVBQUUsQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUM7WUFFMUMsSUFBSSxJQUFJLEdBQUcseUJBQVMsQ0FBQyxLQUFLLENBQUMsRUFBRSxFQUFFO2dCQUM5QixhQUFhLEVBQUUsSUFBSTtnQkFDbkIsS0FBSyxFQUFFLEtBQUs7YUFDWixDQUFDLENBQUM7WUFFSCxrQkFBWSxDQUFDLEtBQUssQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDO1lBRTVDLElBQUksSUFBSSxJQUFJLElBQUksQ0FBQyxPQUFPLEVBQ3hCO2dCQUNDLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxlQUFlLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxlQUFlLEVBQ2hFO29CQUNDLGtCQUFZLENBQUMsS0FBSyxDQUFDLGNBQWMsQ0FBQyxDQUFDO29CQUVuQyxNQUFNLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsZUFBZSxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsZUFBZSxDQUFDO3lCQUMxRSxPQUFPLENBQUMsVUFBVSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7d0JBRXhCLElBQUksY0FBYyxDQUFDLENBQUMsQ0FBQyxJQUFJLElBQUksRUFDN0I7NEJBQ0MsY0FBYyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQzt5QkFDdEI7b0JBQ0YsQ0FBQyxDQUFDLENBQ0Y7aUJBQ0Q7YUFDRDtTQUNEO0lBQ0YsQ0FBQztJQUVELFlBQVksQ0FBSSxPQUFnQyxFQUFFLFNBQWtCO1FBRW5FLE9BQU8sR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLEVBQUUsRUFBRSxJQUFJLENBQUMsV0FBVyxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBRXZELElBQUksQ0FBQyxPQUFPLENBQUMsU0FBUyxFQUN0QjtZQUNDLE1BQU0sSUFBSSxjQUFjLENBQUMsK0JBQStCLENBQUMsQ0FBQztTQUMxRDtRQUVELElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLFNBQVMsRUFBRSxPQUFPLENBQUMsc0JBQXNCLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBRXZGLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxFQUN2QjtZQUNDLENBQUMsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUM7U0FDOUI7UUFFRCxlQUFRLENBQUMsWUFBWSxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsQ0FBQyxPQUFPLENBQUMsVUFBVSxHQUFHO1lBRTVELElBQUksQ0FBQyxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLEVBQzdCO2dCQUNDLE1BQU0sSUFBSSxjQUFjLENBQUMsbUJBQW1CLENBQUMsR0FBRyxDQUFDLENBQUE7YUFDakQ7UUFDRixDQUFDLENBQUMsQ0FBQztRQUVILElBQUksT0FBTyxTQUFTLElBQUksUUFBUSxJQUFJLFNBQVMsRUFDN0M7WUFDQyxJQUFJLENBQUMsU0FBUyxFQUNkO2dCQUNDLE1BQU0sSUFBSSxjQUFjLEVBQUUsQ0FBQzthQUMzQjtZQUVELENBQUMsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBRSxTQUFTLENBQUMsQ0FBQztTQUM1QjtRQUVELE9BQU8sR0FBRyxJQUFJLENBQUMsa0JBQWtCLENBQUMsT0FBTyxDQUFDLENBQUM7UUFFM0MsT0FBTyxDQUFDLENBQUMsRUFBRSxPQUFPLENBQUMsQ0FBQztJQUNyQixDQUFDO0lBRVMsa0JBQWtCLENBQWdDLGNBQTZDO1FBRXhHLGNBQWMsQ0FBQyxvQkFBWSxDQUFDLEdBQUcsQ0FBQyxjQUFjLENBQUMsb0JBQVksQ0FBQyxJQUFJLEVBQUUsQ0FJakUsQ0FBQztRQUVGLGNBQWMsQ0FBQyxVQUFVLEdBQUcsY0FBYyxDQUFDLFVBQVUsSUFBSSxDQUFDLENBQUM7UUFFM0QsYUFBYTtRQUNiLGNBQWMsQ0FBQyxZQUFZLEdBQUcsMEJBQWtCLENBQUMsY0FBYyxDQUFDLFlBQVksQ0FBQyxDQUFDO1FBRzlFLElBQUksY0FBYyxDQUFDLFFBQVEsSUFBSSxJQUFJLEVBQ25DO1lBQ0MsY0FBYyxDQUFDLFFBQVEsR0FBRyxDQUFDLENBQUMsY0FBYyxDQUFDLFFBQVEsQ0FBQztTQUNwRDtRQUVELElBQUksY0FBYyxDQUFDLFNBQVMsSUFBSSxJQUFJLEVBQ3BDO1lBQ0MsY0FBYyxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUM7U0FDaEM7UUFFRCxJQUFJLGNBQWMsQ0FBQyxRQUFRLElBQUksSUFBSSxFQUNuQztZQUNDLGNBQWMsQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDO1NBQy9CO1FBRUQsT0FBTyxjQUFjLENBQUM7SUFDdkIsQ0FBQztJQUVELG1CQUFtQixDQUFDLElBQUk7UUFFdkIsT0FBTyxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ2hDLENBQUM7SUFFRCxrQkFBa0IsQ0FBQyxJQUFJO1FBRXRCLE9BQU8sSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUNoQyxDQUFDO0lBRUQsaUJBQWlCLENBQUMsSUFBSTtRQUVyQixPQUFPLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDaEMsQ0FBQztJQUVELFlBQVksQ0FBQyxJQUFJO1FBRWhCLE9BQU8sbUJBQVksQ0FBQyw0QkFBcUIsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO0lBQ2xELENBQUM7SUFFRCxPQUFPLENBQUMsR0FBRztRQUVWLE9BQVEsR0FBYzthQUNwQixPQUFPLENBQUMsYUFBYSxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUU7WUFFN0IsT0FBTyxPQUFPLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQzlCLENBQUMsQ0FBQyxDQUNEO0lBQ0gsQ0FBQztJQUVTLHNCQUFzQixDQUFzQixjQUFvQztRQUV6RixPQUFPLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNqQixDQUFDO0lBRVMsdUJBQXVCLENBQUMsR0FBRyxJQUFJO1FBRXhDLGFBQWE7UUFDYixJQUFJLE1BQU0sR0FBZ0IseUNBQXVCLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQztRQUUzRCxJQUFJLE1BQU0sQ0FBQyxLQUFLLEVBQ2hCO1lBQ0MsSUFBSSxJQUFhLENBQUM7WUFFbEIsSUFBSSxNQUFNLENBQUMsS0FBSyxDQUFDLElBQUksSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEVBQ3pEO2dCQUNDLElBQUksR0FBRztvQkFDTixLQUFLO29CQUNMLEtBQUs7b0JBQ0wsS0FBSztvQkFDTCxLQUFLO2lCQUNMLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFO29CQUVWLE9BQU8sTUFBTSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFBO2dCQUNyQyxDQUFDLENBQUMsQ0FBQztnQkFFSCxJQUFJLElBQUksRUFDUjtvQkFDQyxNQUFNLENBQUMsS0FBSyxDQUFDLFlBQVksR0FBRyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsWUFBWSxHQUFHLENBQUMsQ0FBQyxHQUFHLHVCQUFlLENBQUMsTUFBTSxDQUFDO2lCQUNyRjthQUNEO1lBRUQsSUFBSSxNQUFNLENBQUMsS0FBSyxDQUFDLE1BQU0sRUFDdkI7Z0JBQ0MsSUFBSSxHQUFHO29CQUNOLEtBQUs7b0JBQ0wsSUFBSTtvQkFDSixLQUFLO29CQUNMLEtBQUs7b0JBQ0wsS0FBSztvQkFDTCxJQUFJO29CQUNKLEtBQUs7b0JBQ0wsS0FBSztpQkFDTCxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDO2dCQUVoQyxJQUFJLElBQUksRUFDUjtvQkFDQyxNQUFNLENBQUMsS0FBSyxDQUFDLFlBQVksR0FBRyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsWUFBWSxHQUFHLENBQUMsQ0FBQyxHQUFHLHVCQUFlLENBQUMsV0FBVyxDQUFDO2lCQUMxRjthQUNEO1NBQ0Q7UUFFRCxPQUFPLE1BQU0sQ0FBQztJQUNmLENBQUM7SUFFUyxXQUFXLENBQUMsY0FBZ0MsRUFBRSxPQUFPLEdBQUcsRUFBRSxFQUFFLEdBQUcsSUFBSTtRQUU1RSxNQUFNLElBQUksR0FBRyxJQUFJLENBQUM7UUFFbEIsSUFBSSxjQUFPLENBQUMsY0FBYyxDQUFDO2VBQ3ZCLGNBQU8sQ0FBQyxjQUFjLENBQUMsb0JBQVksQ0FBQyxFQUFFLEVBQUUsQ0FBQztlQUV6QyxjQUFPLENBQUMsY0FBYyxDQUFDLG9CQUFZLENBQUMsQ0FBQyxLQUFLLEVBQUUsRUFBRSxDQUFDO2VBQy9DLGNBQU8sQ0FBQyxjQUFjLENBQUMsb0JBQVksQ0FBQyxDQUFDLFVBQVUsRUFBRSxFQUFFLENBQUMsRUFFeEQ7WUFDQyxNQUFNLElBQUksY0FBYyxDQUFDLFlBQVksQ0FBQyxDQUFDO1NBQ3ZDO1FBRUQsTUFBTSxLQUFLLEdBQUcsY0FBYyxDQUFDLG9CQUFZLENBQUMsQ0FBQyxLQUFLLENBQUM7UUFDakQsTUFBTSxVQUFVLEdBQUcsY0FBYyxDQUFDLG9CQUFZLENBQUMsQ0FBQyxVQUFVLENBQUM7UUFFM0QsSUFBSSxRQUFRLEdBQUcsSUFBSSxDQUFDLHVCQUF1QixDQUFDO1lBQzNDLEtBQUssRUFBRTtnQkFDTixNQUFNLEVBQUUsRUFBRTtnQkFDVixTQUFTLEVBQUUsRUFBRTtnQkFDYixPQUFPLEVBQUUsRUFBRTtnQkFDWCxVQUFVLEVBQUU7b0JBQ1gsSUFBSSxDQUFDLEtBQUs7aUJBQ1Y7Z0JBQ0QsSUFBSSxFQUFFO29CQUNMLElBQUksQ0FBQyxLQUFLO2lCQUNWO2dCQUNELE1BQU0sRUFBRTtvQkFDUCxJQUFJLEVBQUUsS0FBSyxDQUFDLGtCQUFrQixJQUFJLEtBQUssQ0FBQyxXQUFXLElBQUksRUFBRTtpQkFDekQ7Z0JBQ0QsWUFBWSxFQUFFLENBQUM7YUFDZjtZQUNELE9BQU87WUFFUCxJQUFJLEVBQUUsS0FBSyxDQUFDLElBQUksSUFBSSxFQUFFO1NBQ3RCLEVBQUUsS0FBSyxFQUFFLEdBQUcsSUFBSSxDQUFDLENBQUM7UUFFbkIsSUFBSSxFQUFFLEdBQUcseUJBQVMsQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLENBQUM7UUFFdkMsSUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsV0FBVyxDQUFDLENBQUM7UUFFOUMsa0JBQVksQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLGdCQUFnQixDQUFDLENBQUM7UUFFOUMsT0FBTyxFQUFFLENBQUMsVUFBVSxDQUFDLElBQUksRUFBRSxFQUFFLENBQUM7YUFDNUIsSUFBSSxDQUFDO1lBRUwsT0FBTztnQkFDTixJQUFJO2dCQUNKLEVBQUU7YUFDRixDQUFDO1FBQ0gsQ0FBQyxDQUFDLENBQ0Q7SUFDSCxDQUFDO0lBRUQsYUFBYSxDQUFzQixHQUFpQixFQUFFLGNBQW9DO1FBRXpGLElBQUksSUFBSSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUM7UUFFOUIsSUFBSSxDQUFDLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQzNCO1lBQ0Msb0JBQW9CO1lBRXBCLE1BQU0sSUFBSSxjQUFjLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1NBQy9DO1FBRUQsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsY0FBYyxDQUFDLENBQUM7SUFDakQsQ0FBQztJQUVTLGlCQUFpQixDQUFzQixFQUNoRCxLQUFLLEVBQ0wsTUFBTSxFQUNOLE9BQU8sR0FLUCxFQUFFLGNBQW9DO1FBRXRDLGFBQWE7UUFDYixPQUFPLElBQUksZUFBRyxDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUMsQ0FBQztJQUNyQyxDQUFDO0lBRVMsYUFBYSxDQUFJLEdBQVEsRUFBRSxjQUFtQyxFQUFFLE9BRXpFO1FBRUEsTUFBTSxJQUFJLFdBQVcsQ0FBQywwQkFBMEIsQ0FBQyxDQUFDO0lBQ25ELENBQUM7SUFFUyxhQUFhLENBQUksR0FBRyxFQUFFLGNBQW1DLEVBQUUsS0FLcEU7UUFFQSxNQUFNLElBQUksV0FBVyxDQUFDLDBCQUEwQixDQUFDLENBQUM7SUFDbkQsQ0FBQztJQUVELFlBQVksQ0FBZ0UsTUFBMkIsRUFDdEcsY0FBbUMsRUFDbkMsU0FBYSxFQUNiLEtBQVM7UUFHVCxNQUFNLElBQUksV0FBVyxDQUFDLDBCQUEwQixDQUFDLENBQUM7SUFDbkQsQ0FBQztJQUVTLFlBQVksQ0FBQyxjQUErQixFQUFFLElBQVk7UUFFbkUsSUFBSSxDQUFDLGNBQWMsQ0FBQyxrQkFBa0IsSUFBSSxFQUFFLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxFQUM3RDtZQUNDLElBQUksR0FBRyxHQUFHLEVBQUUsQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLENBQUM7WUFFaEMsSUFBSSxHQUFHLENBQUMsUUFBUSxFQUFFLENBQUMsT0FBTyxDQUFDLFlBQVksRUFBRSxFQUFFLENBQUMsRUFDNUM7Z0JBQ0MsT0FBTyxJQUFJLENBQUM7YUFDWjtTQUNEO1FBRUQsT0FBTyxLQUFLLENBQUE7SUFDYixDQUFDO0lBRVMsSUFBSSxDQUFDLEtBQW1CLEVBQUUsU0FBaUIsRUFBRSxHQUFHLElBQUk7UUFFN0QsSUFBSSxJQUFJLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsSUFBSSxFQUFFLEdBQUcsSUFBSSxDQUFDLENBQUM7UUFDaEQsT0FBTyxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsQ0FBQztJQUN0QixDQUFDO0lBRUQsU0FBUyxDQUFnQyxJQUl4QztRQUVBLE9BQU8sZUFBZSxDQUFDLE9BQU8sRUFBRTthQUM5QixJQUFJLENBQUMsSUFBSSxDQUFDO2FBQ1YsSUFBSSxDQUFDLEdBQUcsRUFBRTtZQUNWLElBQUksRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFFLGNBQWMsRUFBRSxHQUFHLElBQUksQ0FBQztZQUU3QyxJQUFJLGNBQWMsQ0FBQyxhQUFhLEVBQ2hDO2dCQUNDLElBQUksSUFBSSxHQUFHLE9BQU8sQ0FBQyxRQUFRLEVBQUUsQ0FBQztnQkFFOUIsSUFBSSx1QkFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFDckI7b0JBQ0MsSUFBSSxJQUFJLEdBQUcscUJBQUksQ0FBQyxJQUFJLEVBQUUscUJBQUksQ0FBQyxDQUFDO29CQUU1QixJQUFJLElBQUksS0FBSyxJQUFJLEVBQ2pCO3dCQUNDLE9BQU8sR0FBRyxJQUFJLENBQUM7cUJBQ2Y7b0JBRUQsSUFBSSxHQUFHLElBQUksQ0FBQztvQkFDWixJQUFJLEdBQUcsSUFBSSxDQUFDO2lCQUNaO2FBQ0Q7WUFFRCxPQUFPLEVBQUUsQ0FBQyxVQUFVLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQztpQkFDakMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFO2dCQUVULElBQUksY0FBYyxDQUFDLFFBQVEsRUFDM0I7b0JBQ0MsSUFBSSxLQUFLLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxjQUFjLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxDQUFDO29CQUUxRCxrQkFBWSxDQUFDLE9BQU8sQ0FBQyxRQUFRLEVBQUUsS0FBSyxDQUFDLENBQUM7aUJBQ3RDO2dCQUVELE9BQU8sQ0FBQyxDQUFDO1lBQ1YsQ0FBQyxDQUFDLENBQUE7UUFDSixDQUFDLENBQUMsQ0FDRjtJQUNGLENBQUM7O0FBN2VGLDhCQStlQztBQTdldUIsZUFBSyxHQUFXLElBQUksQ0FBQztBQWtmL0IsUUFBQSxrQkFBa0IsR0FBRyxTQUFTLENBQUMsa0JBQWtCLENBQUM7QUFFaEUscUNBQTJDO0FBRTNDLFdBQWlCLFNBQVM7SUErRHpCLElBQWtCLGtCQUlqQjtJQUpELFdBQWtCLGtCQUFrQjtRQUVuQyxpRUFBVyxDQUFBO1FBQ1gsaUVBQVcsQ0FBQTtJQUNaLENBQUMsRUFKaUIsa0JBQWtCLEdBQWxCLDRCQUFrQixLQUFsQiw0QkFBa0IsUUFJbkM7QUErRkYsQ0FBQyxFQWxLZ0IsU0FBUyxHQUFULGlCQUFTLEtBQVQsaUJBQVMsUUFrS3pCO0FBT0QsU0FBZ0IsZ0JBQWdCO0lBRS9CLE9BQU8sQ0FBQyxXQUFjLEVBQUUsRUFBRSxHQUFFLENBQUMsQ0FBQTtBQUM5QixDQUFDO0FBSEQsNENBR0M7QUFFRCxrQkFBZSxTQUFTLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENyZWF0ZWQgYnkgdXNlciBvbiAyMDE4LzIvMTAvMDEwLlxuICovXG5cbmltcG9ydCBibHVlYmlyZERlY29yYXRvciBmcm9tICcuLi9kZWNvcmF0b3IvYmx1ZWJpcmQnO1xuLy9pbXBvcnQgYmx1ZWJpcmREZWNvcmF0b3IgZnJvbSAnYmx1ZWJpcmQtZGVjb3JhdG9yJztcblxuaW1wb3J0IFByb21pc2VCbHVlYmlyZCA9IHJlcXVpcmUoJ2JsdWViaXJkJyk7XG5pbXBvcnQgeyBVUkwgfSBmcm9tICdqc2RvbS11cmwnO1xuaW1wb3J0IHBhdGggPSByZXF1aXJlKCd1cGF0aDInKTtcblxuaW1wb3J0IHJvb3RQYXRoIGZyb20gXCIuLi8uLi9fcm9vdFwiO1xuaW1wb3J0IHsgcmV0cnlSZXF1ZXN0IH0gZnJvbSAnLi4vZmV0Y2gnO1xuXG5pbXBvcnQgeyBkZWZhdWx0SlNET01PcHRpb25zLCBJRnJvbVVybE9wdGlvbnMsIElPcHRpb25zSlNET00sIGNyZWF0ZU9wdGlvbnNKU0RPTSwgSU5vdmVsT3B0aW9uc0pTRE9NIH0gZnJvbSAnLi4vanNkb20nO1xuXG5leHBvcnQgeyBkZWZhdWx0SlNET01PcHRpb25zLCBJRnJvbVVybE9wdGlvbnMsIElPcHRpb25zSlNET00sIGNyZWF0ZU9wdGlvbnNKU0RPTSB9XG5pbXBvcnQgbm92ZWxJbmZvLCB7IElNZGNvbmZNZXRhLCBfaGFuZGxlRGF0YUZvclN0cmluZ2lmeSB9IGZyb20gJ25vZGUtbm92ZWwtaW5mbyc7XG5cbmV4cG9ydCB7IElNZGNvbmZNZXRhIH1cbmltcG9ydCB7IExhenlDb29raWUsIExhenlDb29raWVKYXIgfSBmcm9tICdqc2RvbS1leHRyYSc7XG5cbmltcG9ydCBmcyA9IHJlcXVpcmUoJ2ZzLWV4dHJhJyk7XG5pbXBvcnQgeyB0cmltRmlsZW5hbWUgfSBmcm9tICdmcy1pY29udi91dGlsJztcbmltcG9ydCB7IGNybGYsIENSTEYsIFJfQ1JMRiB9IGZyb20gJ2NybGYtbm9ybWFsaXplJztcbmltcG9ydCBTdHJVdGlsID0gcmVxdWlyZSgnc3RyLXV0aWwnKTtcbmltcG9ydCB7IEVudW1Ob3ZlbFN0YXR1cyB9IGZyb20gJ25vZGUtbm92ZWwtaW5mby9saWIvY29uc3QnO1xuXG4vL2ltcG9ydCAqIGFzIG1vbWVudCBmcm9tICdtb21lbnQnO1xuaW1wb3J0IG1vbWVudCA9IHJlcXVpcmUoJ21vbWVudC10aW1lem9uZScpO1xuaW1wb3J0IHsgX2ZpeFZvbHVtZUNoYXB0ZXJOYW1lLCBpc1VuZGVmIH0gZnJvbSAnLi4vdXRpbCc7XG5cbmltcG9ydCBFdmVudEVtaXR0ZXIgPSByZXF1aXJlKCdldmVudHMnKTtcbmltcG9ydCB7IElEb3dubG9hZE9wdGlvbnMgfSBmcm9tICcuL2RlbW8vYmFzZSc7XG5cbm1vbWVudC5mbi50b0pTT04gPSBmdW5jdGlvbiAoKSB7IHJldHVybiB0aGlzLmZvcm1hdCgpOyB9O1xuXG5leHBvcnQgeyBtb21lbnQgfTtcblxuZXhwb3J0IHsgYmx1ZWJpcmREZWNvcmF0b3IsIFByb21pc2VCbHVlYmlyZCB9XG5cbmV4cG9ydCBjb25zdCBTWU1CT0xfQ0FDSEUgPSBTeW1ib2wuZm9yKCdjYWNoZScpO1xuXG5leHBvcnQgY2xhc3MgTm92ZWxTaXRlIGltcGxlbWVudHMgTm92ZWxTaXRlLklOb3ZlbFNpdGVcbntcblx0cHVibGljIHN0YXRpYyByZWFkb25seSBJREtFWTogc3RyaW5nID0gbnVsbDtcblxuXHRwdWJsaWMgUEFUSF9OT1ZFTF9NQUlOOiBzdHJpbmc7XG5cdHB1YmxpYyBvcHRpb25zSW5pdD86IE5vdmVsU2l0ZS5JT3B0aW9ucztcblxuXHRjb25zdHJ1Y3RvcihvcHRpb25zOiBOb3ZlbFNpdGUuSU9wdGlvbnMsIC4uLmFyZ3YpXG5cdHtcblx0XHRpZiAoIXRoaXMuSURLRVkpXG5cdFx0e1xuXHRcdFx0dGhyb3cgbmV3IFJlZmVyZW5jZUVycm9yKGBJREtFWSBpcyBudWxsYCk7XG5cdFx0fVxuXG5cdFx0dGhpcy5vcHRpb25zSW5pdCA9IG9wdGlvbnM7XG5cdFx0dGhpcy5vcHRpb25zSW5pdC5jd2QgPSB0aGlzLm9wdGlvbnNJbml0LmN3ZCB8fCBwcm9jZXNzLmN3ZCgpO1xuXG5cdFx0W3RoaXMuUEFUSF9OT1ZFTF9NQUlOLCB0aGlzLm9wdGlvbnNJbml0XSA9IHRoaXMuZ2V0T3V0cHV0RGlyKHRoaXMub3B0aW9uc0luaXQpO1xuXG5cdFx0aWYgKHRoaXMub3B0aW9uc0luaXQuZGVidWdMb2cpXG5cdFx0e1xuXHRcdFx0Y29uc29sZURlYnVnLmVuYWJsZWQgPSB0cnVlO1xuXHRcdH1cblxuXHRcdHRoaXMuX2NvbnN0cnVjdG9yKG9wdGlvbnMsIC4uLmFyZ3YpO1xuXHR9XG5cblx0X2NvbnN0cnVjdG9yKG9wdGlvbnM6IE5vdmVsU2l0ZS5JT3B0aW9ucywgLi4uYXJndilcblx0e1xuXHRcdGNvbnNvbGVEZWJ1Zy5kZWJ1Zygncm9vdC5fY29uc3RydWN0b3InKTtcblx0fVxuXG5cdHN0YXRpYyBjcmVhdGUob3B0aW9uczogTm92ZWxTaXRlLklPcHRpb25zLCAuLi5hcmd2KVxuXHR7XG5cdFx0cmV0dXJuIG5ldyB0aGlzKG9wdGlvbnMsIC4uLmFyZ3YpO1xuXHR9XG5cblx0c3RhdGljIGNoZWNrKHVybDogc3RyaW5nIHwgVVJMIHwgTm92ZWxTaXRlLklQYXJzZVVybCwgb3B0aW9ucz8pOiBib29sZWFuXG5cdHtcblx0XHRyZXR1cm4gZmFsc2U7XG5cdH1cblxuXHRzZXNzaW9uPFQgPSBOb3ZlbFNpdGUuSU9wdGlvbnNSdW50aW1lPihvcHRpb25zUnVudGltZTogVCAmIE5vdmVsU2l0ZS5JT3B0aW9uc1J1bnRpbWUsIHVybD86IFVSTClcblx0e1xuXHRcdG9wdGlvbnNSdW50aW1lLm9wdGlvbnNKU0RPTSA9IGNyZWF0ZU9wdGlvbnNKU0RPTShvcHRpb25zUnVudGltZS5vcHRpb25zSlNET00pO1xuXG5cdFx0aWYgKHVybClcblx0XHR7XG5cdFx0XHRvcHRpb25zUnVudGltZVtTWU1CT0xfQ0FDSEVdLnVybCA9IHVybDtcblx0XHR9XG5cblx0XHRyZXR1cm4gdGhpcztcblx0fVxuXG5cdGRvd25sb2FkKHVybDogc3RyaW5nIHwgVVJMLCBvcHRpb25zPzogTm92ZWxTaXRlLklEb3dubG9hZE9wdGlvbnMpOiBQcm9taXNlQmx1ZWJpcmQ8Tm92ZWxTaXRlLklOb3ZlbD5cblx0e1xuXHRcdHRocm93IG5ldyBTeW50YXhFcnJvcihgRnVuY3Rpb24gbm90IGltcGxlbWVudGVkYCk7XG5cdH1cblxuXHRnZXRfdm9sdW1lX2xpc3Q8VCA9IE5vdmVsU2l0ZS5JT3B0aW9uc1J1bnRpbWU+KHVybDogc3RyaW5nIHwgVVJMLFxuXHRcdG9wdGlvbnNSdW50aW1lOiBQYXJ0aWFsPFQgJiBOb3ZlbFNpdGUuSURvd25sb2FkT3B0aW9ucz4gPSB7fSxcblx0KTogUHJvbWlzZTxOb3ZlbFNpdGUuSU5vdmVsPlxuXHR7XG5cdFx0dGhyb3cgbmV3IFN5bnRheEVycm9yKGBGdW5jdGlvbiBub3QgaW1wbGVtZW50ZWRgKTtcblx0fVxuXG5cdG1ha2VVcmw8VCBleHRlbmRzIE5vdmVsU2l0ZS5JT3B0aW9uc1J1bnRpbWU+KHVybG9iajogTm92ZWxTaXRlLklQYXJzZVVybCwgb3B0aW9ucz8sIG9wdGlvbnNSdW50aW1lPzogVCk6IFVSTFxuXHR7XG5cdFx0dGhyb3cgbmV3IFN5bnRheEVycm9yKGBGdW5jdGlvbiBub3QgaW1wbGVtZW50ZWRgKTtcblx0fVxuXG5cdHBhcnNlVXJsKHVybDogVVJMIHwgc3RyaW5nLCBvcHRpb25zPyk6IE5vdmVsU2l0ZS5JUGFyc2VVcmxcblx0e1xuXHRcdHRocm93IG5ldyBTeW50YXhFcnJvcihgRnVuY3Rpb24gbm90IGltcGxlbWVudGVkYCk7XG5cdH1cblxuXHRnZXRTdGF0aWM8VCA9IHR5cGVvZiBOb3ZlbFNpdGU+KCk6IFRcblx0e1xuXHRcdC8vIEB0cy1pZ25vcmVcblx0XHRyZXR1cm4gdGhpcy5fX3Byb3RvX18uY29uc3RydWN0b3I7XG5cdH1cblxuXHRnZXQgSURLRVkoKTogc3RyaW5nXG5cdHtcblx0XHRsZXQga2V5ID0gdGhpcy5nZXRTdGF0aWMoKS5JREtFWTtcblxuXHRcdGlmICh0eXBlb2Yga2V5ICE9ICdzdHJpbmcnIHx8ICFrZXkpXG5cdFx0e1xuXHRcdFx0dGhyb3cgbmV3IFN5bnRheEVycm9yKGBJREtFWSBub3QgaW1wbGVtZW50ZWRgKTtcblx0XHR9XG5cblx0XHRyZXR1cm4ga2V5O1xuXHR9XG5cblx0cHJvdGVjdGVkIF9wYXRoTm92ZWxJRDxOIGV4dGVuZHMgTm92ZWxTaXRlLklOb3ZlbCwgVCBleHRlbmRzIE5vdmVsU2l0ZS5JT3B0aW9uc1J1bnRpbWU+KG5vdmVsOiBOLCBvcHRpb25zUnVudGltZTogVClcblx0e1xuXHRcdHJldHVybiBub3ZlbC51cmxfZGF0YS5ub3ZlbF9pZDtcblx0fVxuXG5cdGdldFBhdGhOb3ZlbDxOIGV4dGVuZHMgTm92ZWxTaXRlLklOb3ZlbCwgVCBleHRlbmRzIE5vdmVsU2l0ZS5JT3B0aW9uc1J1bnRpbWU+KFBBVEhfTk9WRUxfTUFJTjogc3RyaW5nLFxuXHRcdG5vdmVsOiBOLFxuXHRcdG9wdGlvbnNSdW50aW1lOiBULFxuXHQpXG5cdHtcblx0XHRsZXQgbmFtZTogc3RyaW5nO1xuXG5cdFx0bGV0IG5vdmVsX2lkID0gdGhpcy5fcGF0aE5vdmVsSUQobm92ZWwsIG9wdGlvbnNSdW50aW1lKTtcblxuXHRcdGlmIChvcHRpb25zUnVudGltZS5wYXRoTm92ZWxTdHlsZSlcblx0XHR7XG5cdFx0XHRpZiAob3B0aW9uc1J1bnRpbWUucGF0aE5vdmVsU3R5bGUgPT0gTm92ZWxTaXRlLkVudW1QYXRoTm92ZWxTdHlsZS5OT1ZFTElEKVxuXHRcdFx0e1xuXHRcdFx0XHRuYW1lID0gbm92ZWxfaWQ7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0aWYgKG5hbWUgPT0gbnVsbClcblx0XHR7XG5cdFx0XHRuYW1lID0gYCR7dGhpcy50cmltRmlsZW5hbWVOb3ZlbChub3ZlbC5ub3ZlbF90aXRsZSl9Xygke25vdmVsX2lkfSlgXG5cdFx0fVxuXG5cdFx0cmV0dXJuIHBhdGguam9pbihQQVRIX05PVkVMX01BSU4sIG5hbWUpO1xuXHR9XG5cblx0LyoqXG5cdCAqIOWmguaenOW3sue2k+S4i+i8iemBjiDliYfoqablnJblvp4gUkVBRE1FLm1kIOWFp+iugOWPlue8uua8j+eahOS4i+i8ieioreWumlxuXHQgKlxuXHQgKiBAcHJpdmF0ZVxuXHQgKi9cblx0X2xvYWRFeGlzdHNDb25mPFQsIE4gZXh0ZW5kcyBOb3ZlbFNpdGUuSU5vdmVsPihpbnB1dFVybCwgb3B0aW9uc1J1bnRpbWU6IFQsIG5vdmVsOiBOLCBwYXRoX25vdmVsOiBzdHJpbmcpXG5cdHtcblx0XHRsZXQgZmlsZSA9IHBhdGgucmVzb2x2ZShwYXRoX25vdmVsLCAnUkVBRE1FLm1kJyk7XG5cblx0XHRpZiAoZnMucGF0aEV4aXN0c1N5bmMoZmlsZSkpXG5cdFx0e1xuXHRcdFx0bGV0IG1kID0gZnMucmVhZEZpbGVTeW5jKGZpbGUpLnRvU3RyaW5nKCk7XG5cblx0XHRcdGxldCBjb25mID0gbm92ZWxJbmZvLnBhcnNlKG1kLCB7XG5cdFx0XHRcdGxvd0NoZWNrTGV2ZWw6IHRydWUsXG5cdFx0XHRcdHRocm93OiBmYWxzZSxcblx0XHRcdH0pO1xuXG5cdFx0XHRjb25zb2xlRGVidWcuZGVidWcoJ+aqouafpSBSRUFETUUubWQg5piv5ZCm5a2Y5Zyo5LiL6LyJ6Kit5a6aJyk7XG5cblx0XHRcdGlmIChjb25mICYmIGNvbmYub3B0aW9ucylcblx0XHRcdHtcblx0XHRcdFx0aWYgKGNvbmYub3B0aW9ucy5kb3dubG9hZE9wdGlvbnMgfHwgY29uZi5vcHRpb25zLmRvd25sb2Fkb3B0aW9ucylcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGNvbnNvbGVEZWJ1Zy5kZWJ1Zygn6LyJ5YWl5Lim5LiU5ZCI5L215bey5a2Y5Zyo55qE6Kit5a6aJyk7XG5cblx0XHRcdFx0XHRPYmplY3QuZW50cmllcyhjb25mLm9wdGlvbnMuZG93bmxvYWRPcHRpb25zIHx8IGNvbmYub3B0aW9ucy5kb3dubG9hZG9wdGlvbnMpXG5cdFx0XHRcdFx0XHQuZm9yRWFjaChmdW5jdGlvbiAoW2ssIHZdKVxuXHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRpZiAob3B0aW9uc1J1bnRpbWVba10gPT0gbnVsbClcblx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdG9wdGlvbnNSdW50aW1lW2tdID0gdjtcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0fSlcblx0XHRcdFx0XHQ7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdH1cblxuXHRnZXRPdXRwdXREaXI8VD4ob3B0aW9ucz86IFQgJiBOb3ZlbFNpdGUuSU9wdGlvbnMsIG5vdmVsTmFtZT86IHN0cmluZyk6IFtzdHJpbmcsIFQgJiBOb3ZlbFNpdGUuSU9wdGlvbnNdXG5cdHtcblx0XHRvcHRpb25zID0gT2JqZWN0LmFzc2lnbih7fSwgdGhpcy5vcHRpb25zSW5pdCwgb3B0aW9ucyk7XG5cblx0XHRpZiAoIW9wdGlvbnMub3V0cHV0RGlyKVxuXHRcdHtcblx0XHRcdHRocm93IG5ldyBSZWZlcmVuY2VFcnJvcihgb3B0aW9uczogb3V0cHV0RGlyIGlzIG5vdCBzZXRgKTtcblx0XHR9XG5cblx0XHRsZXQgcCA9IHBhdGguam9pbihvcHRpb25zLm91dHB1dERpciwgb3B0aW9ucy5kaXNhYmxlT3V0cHV0RGlyUHJlZml4ID8gJycgOiB0aGlzLklES0VZKTtcblxuXHRcdGlmICghcGF0aC5pc0Fic29sdXRlKHApKVxuXHRcdHtcblx0XHRcdHAgPSBwYXRoLmpvaW4ob3B0aW9ucy5jd2QsIHApO1xuXHRcdH1cblxuXHRcdHJvb3RQYXRoLmRpc2FibGVQYXRocy5jb25jYXQoX19kaXJuYW1lKS5mb3JFYWNoKGZ1bmN0aW9uIChkaXIpXG5cdFx0e1xuXHRcdFx0aWYgKHAuaW5kZXhPZihfX2Rpcm5hbWUpID09IDApXG5cdFx0XHR7XG5cdFx0XHRcdHRocm93IG5ldyBSZWZlcmVuY2VFcnJvcihgcGF0aCBub3QgYWxsb3cgXCIke3B9XCJgKVxuXHRcdFx0fVxuXHRcdH0pO1xuXG5cdFx0aWYgKHR5cGVvZiBub3ZlbE5hbWUgPT0gJ3N0cmluZycgfHwgbm92ZWxOYW1lKVxuXHRcdHtcblx0XHRcdGlmICghbm92ZWxOYW1lKVxuXHRcdFx0e1xuXHRcdFx0XHR0aHJvdyBuZXcgUmVmZXJlbmNlRXJyb3IoKTtcblx0XHRcdH1cblxuXHRcdFx0cCA9IHBhdGguam9pbihwLCBub3ZlbE5hbWUpO1xuXHRcdH1cblxuXHRcdG9wdGlvbnMgPSB0aGlzLl9maXhPcHRpb25zUnVudGltZShvcHRpb25zKTtcblxuXHRcdHJldHVybiBbcCwgb3B0aW9uc107XG5cdH1cblxuXHRwcm90ZWN0ZWQgX2ZpeE9wdGlvbnNSdW50aW1lPFQgPSBOb3ZlbFNpdGUuSU9wdGlvbnNSdW50aW1lPihvcHRpb25zUnVudGltZTogVCAmIE5vdmVsU2l0ZS5JT3B0aW9uc1J1bnRpbWUpOiBUICYgTm92ZWxTaXRlLklPcHRpb25zUnVudGltZVxuXHR7XG5cdFx0b3B0aW9uc1J1bnRpbWVbU1lNQk9MX0NBQ0hFXSA9IChvcHRpb25zUnVudGltZVtTWU1CT0xfQ0FDSEVdIHx8IHt9KSBhcyB7XG5cdFx0XHR1cmw/OiBVUkwsXG5cdFx0XHRwYXRoX25vdmVsPzogc3RyaW5nLFxuXHRcdFx0bm92ZWw/OiBOb3ZlbFNpdGUuSU5vdmVsLFxuXHRcdH07XG5cblx0XHRvcHRpb25zUnVudGltZS5zdGFydEluZGV4ID0gb3B0aW9uc1J1bnRpbWUuc3RhcnRJbmRleCB8fCAwO1xuXG5cdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdG9wdGlvbnNSdW50aW1lLm9wdGlvbnNKU0RPTSA9IGNyZWF0ZU9wdGlvbnNKU0RPTShvcHRpb25zUnVudGltZS5vcHRpb25zSlNET00pO1xuXG5cblx0XHRpZiAob3B0aW9uc1J1bnRpbWUuZGVidWdMb2cgIT0gbnVsbClcblx0XHR7XG5cdFx0XHRvcHRpb25zUnVudGltZS5kZWJ1Z0xvZyA9ICEhb3B0aW9uc1J1bnRpbWUuZGVidWdMb2c7XG5cdFx0fVxuXG5cdFx0aWYgKG9wdGlvbnNSdW50aW1lLmtlZXBJbWFnZSA9PSBudWxsKVxuXHRcdHtcblx0XHRcdG9wdGlvbnNSdW50aW1lLmtlZXBJbWFnZSA9IHRydWU7XG5cdFx0fVxuXG5cdFx0aWYgKG9wdGlvbnNSdW50aW1lLmtlZXBSdWJ5ID09IG51bGwpXG5cdFx0e1xuXHRcdFx0b3B0aW9uc1J1bnRpbWUua2VlcFJ1YnkgPSB0cnVlO1xuXHRcdH1cblxuXHRcdHJldHVybiBvcHRpb25zUnVudGltZTtcblx0fVxuXG5cdHRyaW1GaWxlbmFtZUNoYXB0ZXIobmFtZSk6IHN0cmluZ1xuXHR7XG5cdFx0cmV0dXJuIHRoaXMudHJpbUZpbGVuYW1lKG5hbWUpO1xuXHR9XG5cblx0dHJpbUZpbGVuYW1lVm9sdW1lKG5hbWUpOiBzdHJpbmdcblx0e1xuXHRcdHJldHVybiB0aGlzLnRyaW1GaWxlbmFtZShuYW1lKTtcblx0fVxuXG5cdHRyaW1GaWxlbmFtZU5vdmVsKG5hbWUpOiBzdHJpbmdcblx0e1xuXHRcdHJldHVybiB0aGlzLnRyaW1GaWxlbmFtZShuYW1lKTtcblx0fVxuXG5cdHRyaW1GaWxlbmFtZShuYW1lKTogc3RyaW5nXG5cdHtcblx0XHRyZXR1cm4gdHJpbUZpbGVuYW1lKF9maXhWb2x1bWVDaGFwdGVyTmFtZShuYW1lKSk7XG5cdH1cblxuXHR0cmltVGFnKHRhZyk6IHN0cmluZ1xuXHR7XG5cdFx0cmV0dXJuICh0YWcgYXMgc3RyaW5nKVxuXHRcdFx0LnJlcGxhY2UoL1tcXFtcXF1cXC9cXFxcXS9nLCAocykgPT5cblx0XHRcdHtcblx0XHRcdFx0cmV0dXJuIFN0clV0aWwudG9GdWxsV2lkdGgocylcblx0XHRcdH0pXG5cdFx0XHQ7XG5cdH1cblxuXHRwcm90ZWN0ZWQgX2V4cG9ydERvd25sb2FkT3B0aW9uczxUID0gSU9wdGlvbnNSdW50aW1lPihvcHRpb25zUnVudGltZT86IFQgJiBJT3B0aW9uc1J1bnRpbWUpOiB1bmtub3duXG5cdHtcblx0XHRyZXR1cm4gdm9pZCAoMCk7XG5cdH1cblxuXHRwcm90ZWN0ZWQgX2hhbmRsZURhdGFGb3JTdHJpbmdpZnkoLi4uYXJndik6IElNZGNvbmZNZXRhXG5cdHtcblx0XHQvLyBAdHMtaWdub3JlXG5cdFx0bGV0IG1kY29uZjogSU1kY29uZk1ldGEgPSBfaGFuZGxlRGF0YUZvclN0cmluZ2lmeSguLi5hcmd2KTtcblxuXHRcdGlmIChtZGNvbmYubm92ZWwpXG5cdFx0e1xuXHRcdFx0bGV0IGJvb2w6IGJvb2xlYW47XG5cblx0XHRcdGlmIChtZGNvbmYubm92ZWwudGFncyAmJiBBcnJheS5pc0FycmF5KG1kY29uZi5ub3ZlbC50YWdzKSlcblx0XHRcdHtcblx0XHRcdFx0Ym9vbCA9IFtcblx0XHRcdFx0XHQn5pu457GN5YyWJyxcblx0XHRcdFx0XHQn5Lmm57GN5YyWJyxcblx0XHRcdFx0XHQn5paH5bqr5YyWJyxcblx0XHRcdFx0XHQn5paH5bqT5YyWJyxcblx0XHRcdFx0XS5zb21lKHYgPT5cblx0XHRcdFx0e1xuXHRcdFx0XHRcdHJldHVybiBtZGNvbmYubm92ZWwudGFncy5pbmNsdWRlcyh2KVxuXHRcdFx0XHR9KTtcblxuXHRcdFx0XHRpZiAoYm9vbClcblx0XHRcdFx0e1xuXHRcdFx0XHRcdG1kY29uZi5ub3ZlbC5ub3ZlbF9zdGF0dXMgPSAobWRjb25mLm5vdmVsLm5vdmVsX3N0YXR1cyB8IDApIHwgRW51bU5vdmVsU3RhdHVzLlBfQk9PSztcblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHRpZiAobWRjb25mLm5vdmVsLnN0YXR1cylcblx0XHRcdHtcblx0XHRcdFx0Ym9vbCA9IFtcblx0XHRcdFx0XHQn5a6M57WQ5riIJyxcblx0XHRcdFx0XHQn5a6M57WQJyxcblx0XHRcdFx0XHQn5bey5a6M57WQJyxcblx0XHRcdFx0XHQn5bey5a6M5oiQJyxcblx0XHRcdFx0XHQn5a6M57uT5riIJyxcblx0XHRcdFx0XHQn5a6M57uTJyxcblx0XHRcdFx0XHQn5bey5a6M57uTJyxcblx0XHRcdFx0XHQn5bey5a6M5oiQJyxcblx0XHRcdFx0XS5pbmNsdWRlcyhtZGNvbmYubm92ZWwuc3RhdHVzKTtcblxuXHRcdFx0XHRpZiAoYm9vbClcblx0XHRcdFx0e1xuXHRcdFx0XHRcdG1kY29uZi5ub3ZlbC5ub3ZlbF9zdGF0dXMgPSAobWRjb25mLm5vdmVsLm5vdmVsX3N0YXR1cyB8IDApIHwgRW51bU5vdmVsU3RhdHVzLkFVVEhPUl9ET05FO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0cmV0dXJuIG1kY29uZjtcblx0fVxuXG5cdHByb3RlY3RlZCBfc2F2ZVJlYWRtZShvcHRpb25zUnVudGltZT86IElPcHRpb25zUnVudGltZSwgb3B0aW9ucyA9IHt9LCAuLi5vcHRzKVxuXHR7XG5cdFx0Y29uc3Qgc2VsZiA9IHRoaXM7XG5cblx0XHRpZiAoaXNVbmRlZihvcHRpb25zUnVudGltZSlcblx0XHRcdHx8IGlzVW5kZWYob3B0aW9uc1J1bnRpbWVbU1lNQk9MX0NBQ0hFXSwge30pXG5cblx0XHRcdHx8IGlzVW5kZWYob3B0aW9uc1J1bnRpbWVbU1lNQk9MX0NBQ0hFXS5ub3ZlbCwge30pXG5cdFx0XHR8fCBpc1VuZGVmKG9wdGlvbnNSdW50aW1lW1NZTUJPTF9DQUNIRV0ucGF0aF9ub3ZlbCwgJycpXG5cdFx0KVxuXHRcdHtcblx0XHRcdHRocm93IG5ldyBSZWZlcmVuY2VFcnJvcihgc2F2ZVJlYWRtZWApO1xuXHRcdH1cblxuXHRcdGNvbnN0IG5vdmVsID0gb3B0aW9uc1J1bnRpbWVbU1lNQk9MX0NBQ0hFXS5ub3ZlbDtcblx0XHRjb25zdCBwYXRoX25vdmVsID0gb3B0aW9uc1J1bnRpbWVbU1lNQk9MX0NBQ0hFXS5wYXRoX25vdmVsO1xuXG5cdFx0bGV0IG1kY29uZmlnID0gdGhpcy5faGFuZGxlRGF0YUZvclN0cmluZ2lmeSh7XG5cdFx0XHRub3ZlbDoge1xuXHRcdFx0XHRpbGx1c3Q6ICcnLFxuXHRcdFx0XHR0aXRsZV96aDE6ICcnLFxuXHRcdFx0XHRpbGx1c3RzOiBbXSxcblx0XHRcdFx0cHVibGlzaGVyczogW1xuXHRcdFx0XHRcdHNlbGYuSURLRVksXG5cdFx0XHRcdF0sXG5cdFx0XHRcdHRhZ3M6IFtcblx0XHRcdFx0XHRzZWxmLklES0VZLFxuXHRcdFx0XHRdLFxuXHRcdFx0XHRzZXJpZXM6IHtcblx0XHRcdFx0XHRuYW1lOiBub3ZlbC5ub3ZlbF9zZXJpZXNfdGl0bGUgfHwgbm92ZWwubm92ZWxfdGl0bGUgfHwgJycsXG5cdFx0XHRcdH0sXG5cdFx0XHRcdG5vdmVsX3N0YXR1czogMCxcblx0XHRcdH0sXG5cdFx0XHRvcHRpb25zLFxuXG5cdFx0XHRsaW5rOiBub3ZlbC5saW5rIHx8IFtdLFxuXHRcdH0sIG5vdmVsLCAuLi5vcHRzKTtcblxuXHRcdGxldCBtZCA9IG5vdmVsSW5mby5zdHJpbmdpZnkobWRjb25maWcpO1xuXG5cdFx0bGV0IGZpbGUgPSBwYXRoLmpvaW4ocGF0aF9ub3ZlbCwgYFJFQURNRS5tZGApO1xuXG5cdFx0Y29uc29sZURlYnVnLmluZm8oYFtNRVRBXWAsIGBzYXZlIFJFQURNRS5tZGApO1xuXG5cdFx0cmV0dXJuIGZzLm91dHB1dEZpbGUoZmlsZSwgbWQpXG5cdFx0XHQudGhlbihmdW5jdGlvbiAoKVxuXHRcdFx0e1xuXHRcdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHRcdGZpbGUsXG5cdFx0XHRcdFx0bWQsXG5cdFx0XHRcdH07XG5cdFx0XHR9KVxuXHRcdFx0O1xuXHR9XG5cblx0Y3JlYXRlTWFpblVybDxUID0gSU9wdGlvbnNSdW50aW1lPih1cmw6IHN0cmluZyB8IFVSTCwgb3B0aW9uc1J1bnRpbWU/OiBUICYgSU9wdGlvbnNSdW50aW1lKTogVVJMXG5cdHtcblx0XHRsZXQgZGF0YSA9IHRoaXMucGFyc2VVcmwodXJsKTtcblxuXHRcdGlmICghZGF0YSB8fCAhZGF0YS5ub3ZlbF9pZClcblx0XHR7XG5cdFx0XHQvL2NvbnNvbGUubG9nKGRhdGEpO1xuXG5cdFx0XHR0aHJvdyBuZXcgUmVmZXJlbmNlRXJyb3IoSlNPTi5zdHJpbmdpZnkoZGF0YSkpO1xuXHRcdH1cblxuXHRcdHJldHVybiB0aGlzLm1ha2VVcmwoZGF0YSwgdHJ1ZSwgb3B0aW9uc1J1bnRpbWUpO1xuXHR9XG5cblx0cHJvdGVjdGVkIF9jcmVhdGVDaGFwdGVyVXJsPFQgPSBJT3B0aW9uc1J1bnRpbWU+KHtcblx0XHRub3ZlbCxcblx0XHR2b2x1bWUsXG5cdFx0Y2hhcHRlcixcblx0fToge1xuXHRcdG5vdmVsOiBOb3ZlbFNpdGUuSU5vdmVsLFxuXHRcdHZvbHVtZTogTm92ZWxTaXRlLklWb2x1bWUsXG5cdFx0Y2hhcHRlcjogTm92ZWxTaXRlLklDaGFwdGVyLFxuXHR9LCBvcHRpb25zUnVudGltZT86IFQgJiBJT3B0aW9uc1J1bnRpbWUpOiBVUkxcblx0e1xuXHRcdC8vIEB0cy1pZ25vcmVcblx0XHRyZXR1cm4gbmV3IFVSTChjaGFwdGVyLmNoYXB0ZXJfdXJsKTtcblx0fVxuXG5cdHByb3RlY3RlZCBfZmV0Y2hDaGFwdGVyPFQ+KHVybDogVVJMLCBvcHRpb25zUnVudGltZTogVCAmIElPcHRpb25zUnVudGltZSwgX2NhY2hlXzoge1xuXHRcdG5vdmVsOiBJTm92ZWwsXG5cdH0pXG5cdHtcblx0XHR0aHJvdyBuZXcgU3ludGF4RXJyb3IoYEZ1bmN0aW9uIG5vdCBpbXBsZW1lbnRlZGApO1xuXHR9XG5cblx0cHJvdGVjdGVkIF9wYXJzZUNoYXB0ZXI8VD4oZG9tLCBvcHRpb25zUnVudGltZTogVCAmIElPcHRpb25zUnVudGltZSwgY2FjaGU6IHtcblx0XHRmaWxlOiBzdHJpbmcsXG5cdFx0bm92ZWw6IE5vdmVsU2l0ZS5JTm92ZWwsXG5cdFx0dm9sdW1lOiBOb3ZlbFNpdGUuSVZvbHVtZSxcblx0XHRjaGFwdGVyOiBOb3ZlbFNpdGUuSUNoYXB0ZXIsXG5cdH0pXG5cdHtcblx0XHR0aHJvdyBuZXcgU3ludGF4RXJyb3IoYEZ1bmN0aW9uIG5vdCBpbXBsZW1lbnRlZGApO1xuXHR9XG5cblx0Z2V0RXh0cmFJbmZvPFQsIE0gZXh0ZW5kcyBQYXJ0aWFsPElOb3ZlbCAmIElNZGNvbmZNZXRhPiwgQyBleHRlbmRzIHVua25vd24+KHVybG9iajogTm92ZWxTaXRlLklQYXJzZVVybCxcblx0XHRvcHRpb25zUnVudGltZTogVCAmIElPcHRpb25zUnVudGltZSxcblx0XHRkYXRhX21ldGE/OiBNLFxuXHRcdGNhY2hlPzogQyxcblx0KTogUHJvbWlzZUJsdWViaXJkPE0+XG5cdHtcblx0XHR0aHJvdyBuZXcgU3ludGF4RXJyb3IoYEZ1bmN0aW9uIG5vdCBpbXBsZW1lbnRlZGApO1xuXHR9XG5cblx0cHJvdGVjdGVkIF9jaGVja0V4aXN0cyhvcHRpb25zUnVudGltZTogSU9wdGlvbnNSdW50aW1lLCBmaWxlOiBzdHJpbmcpOiBib29sZWFuXG5cdHtcblx0XHRpZiAoIW9wdGlvbnNSdW50aW1lLmRpc2FibGVDaGVja0V4aXN0cyAmJiBmcy5leGlzdHNTeW5jKGZpbGUpKVxuXHRcdHtcblx0XHRcdGxldCB0eHQgPSBmcy5yZWFkRmlsZVN5bmMoZmlsZSk7XG5cblx0XHRcdGlmICh0eHQudG9TdHJpbmcoKS5yZXBsYWNlKC9eXFxzK3xcXHMrJC9nLCAnJykpXG5cdFx0XHR7XG5cdFx0XHRcdHJldHVybiB0cnVlO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHJldHVybiBmYWxzZVxuXHR9XG5cblx0cHJvdGVjdGVkIGVtaXQoZXZlbnQ6IEV2ZW50RW1pdHRlciwgZXZlbnROYW1lOiBzdHJpbmcsIC4uLmFyZ3YpXG5cdHtcblx0XHRsZXQgYm9vbCA9IGV2ZW50LmVtaXQoZXZlbnROYW1lLCB0aGlzLCAuLi5hcmd2KTtcblx0XHRyZXR1cm4gW2V2ZW50LCBib29sXTtcblx0fVxuXG5cdF9zYXZlRmlsZTxUID0gTm92ZWxTaXRlLklPcHRpb25zUnVudGltZT4ob3B0czoge1xuXHRcdGZpbGU6IHN0cmluZyxcblx0XHRjb250ZXh0OiBzdHJpbmcgfCBCdWZmZXIsXG5cdFx0b3B0aW9uc1J1bnRpbWU6IFQgJiBOb3ZlbFNpdGUuSU9wdGlvbnNSdW50aW1lLFxuXHR9KVxuXHR7XG5cdFx0cmV0dXJuIFByb21pc2VCbHVlYmlyZC5yZXNvbHZlKClcblx0XHRcdC5iaW5kKHRoaXMpXG5cdFx0XHQudGhlbigoKSA9PiB7XG5cdFx0XHRcdGxldCB7IGZpbGUsIGNvbnRleHQsIG9wdGlvbnNSdW50aW1lIH0gPSBvcHRzO1xuXG5cdFx0XHRcdGlmIChvcHRpb25zUnVudGltZS5saW5lQnJlYWtDcmxmKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0bGV0IHR4dDEgPSBjb250ZXh0LnRvU3RyaW5nKCk7XG5cblx0XHRcdFx0XHRpZiAoUl9DUkxGLnRlc3QodHh0MSkpXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0bGV0IHR4dDIgPSBjcmxmKHR4dDEsIENSTEYpO1xuXG5cdFx0XHRcdFx0XHRpZiAodHh0MSAhPT0gdHh0Milcblx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0Y29udGV4dCA9IHR4dDI7XG5cdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdHR4dDEgPSBudWxsO1xuXHRcdFx0XHRcdFx0dHh0MiA9IG51bGw7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cblx0XHRcdFx0cmV0dXJuIGZzLm91dHB1dEZpbGUoZmlsZSwgY29udGV4dClcblx0XHRcdFx0XHQudGhlbihyID0+IHtcblxuXHRcdFx0XHRcdFx0aWYgKG9wdGlvbnNSdW50aW1lLmRlYnVnTG9nKVxuXHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRsZXQgZmlsZTIgPSBwYXRoLnJlbGF0aXZlKG9wdGlvbnNSdW50aW1lLm91dHB1dERpciwgZmlsZSk7XG5cblx0XHRcdFx0XHRcdFx0Y29uc29sZURlYnVnLnN1Y2Nlc3MoYFtTQVZFXWAsIGZpbGUyKTtcblx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0cmV0dXJuIHI7XG5cdFx0XHRcdFx0fSlcblx0XHRcdH0pXG5cdFx0O1xuXHR9XG5cbn1cblxuZXhwb3J0IGltcG9ydCBJT3B0aW9uc1J1bnRpbWUgPSBOb3ZlbFNpdGUuSU9wdGlvbnNSdW50aW1lO1xuZXhwb3J0IGltcG9ydCBJVm9sdW1lID0gTm92ZWxTaXRlLklWb2x1bWU7XG5leHBvcnQgaW1wb3J0IElDaGFwdGVyID0gTm92ZWxTaXRlLklDaGFwdGVyO1xuZXhwb3J0IGltcG9ydCBFbnVtUGF0aE5vdmVsU3R5bGUgPSBOb3ZlbFNpdGUuRW51bVBhdGhOb3ZlbFN0eWxlO1xuaW1wb3J0IHsgSU5vdmVsIH0gZnJvbSAnLi9zeW9zZXR1JztcbmltcG9ydCB7IGNvbnNvbGVEZWJ1ZyB9IGZyb20gJy4uL3V0aWwvbG9nJztcblxuZXhwb3J0IG5hbWVzcGFjZSBOb3ZlbFNpdGVcbntcblxuXHRleHBvcnQgdHlwZSBJRmlsZVByZWZpeE1vZGUgPSAwIHwgMSB8IDIgfCAzIHwgNCB8IDU7XG5cblx0ZXhwb3J0IHR5cGUgSU9wdGlvbnNQbHVzID0ge1xuXG5cdFx0ZGlzYWJsZU91dHB1dERpclByZWZpeD86IGJvb2xlYW4sXG5cblx0XHRub0RpclByZWZpeD86IGJvb2xlYW4sXG5cdFx0bm9EaXJQYWRlbmQ/OiBib29sZWFuLFxuXG5cdFx0bm9GaXJlUHJlZml4PzogYm9vbGVhbixcblx0XHRub0ZpbGVQYWRlbmQ/OiBib29sZWFuLFxuXG5cdFx0cmV0cnlEZWxheT86IG51bWJlcixcblx0XHRzdGFydEluZGV4PzogbnVtYmVyLFxuXG5cdFx0ZmlsZVByZWZpeE1vZGU/OiBudW1iZXIgfCBJRmlsZVByZWZpeE1vZGUsXG5cblx0XHRhbGxvd0VtcHR5Vm9sdW1lVGl0bGU/OiBib29sZWFuLFxuXG5cdFx0ZXZlbnQ/OiBFdmVudEVtaXR0ZXIsXG5cblx0XHQvKipcblx0XHQgKiDnlKjkvobnmbvlhaXnq5npu57nmoQgY29va2llcyBzZXNzaW9uXG5cdFx0ICovXG5cdFx0c2Vzc2lvbkRhdGE/OiB7XG5cdFx0XHRba2V5OiBzdHJpbmddOiBhbnksXG5cdFx0fSxcblxuXHRcdC8qKlxuXHRcdCAqIOWPquaKk+WPluWwj+iqqueahCBNRVRBIOizh+aWmVxuXHRcdCAqL1xuXHRcdGZldGNoTWV0YURhdGFPbmx5PzogYm9vbGVhbixcblxuXHRcdGRlYnVnTG9nPzogYm9vbGVhbixcblxuXHRcdGxpbmVCcmVha0NybGY/OiBib29sZWFuLFxuXG5cdFx0LyoqXG5cdFx0ICog5L+d55WZ5rOo6Z+z5qC85byPXG5cdFx0ICovXG5cdFx0a2VlcFJ1Ynk/OiBib29sZWFuO1xuXHRcdC8qKlxuXHRcdCAqIOS/neeVmeWFtuS7luagvOW8j1xuXHRcdCAqL1xuXHRcdGtlZXBGb3JtYXQ/OiBib29sZWFuO1xuXG5cdFx0LyoqXG5cdFx0ICog5Zyo5YWn5paH5Y6f5aeL5L2N572u5LiK5L+d55WZ5ZyW54mHXG5cdFx0ICovXG5cdFx0a2VlcEltYWdlPzogYm9vbGVhbjtcblxuXHR9XG5cblx0ZXhwb3J0IHR5cGUgSU9wdGlvbnMgPSB7XG5cblx0XHRvdXRwdXREaXI/OiBzdHJpbmcsXG5cdFx0Y3dkPzogc3RyaW5nLFxuXG5cdH0gJiBJT3B0aW9uc1BsdXM7XG5cblx0ZXhwb3J0IGNvbnN0IGVudW0gRW51bVBhdGhOb3ZlbFN0eWxlXG5cdHtcblx0XHRERUZBVUxUID0gMCxcblx0XHROT1ZFTElEID0gMSxcblx0fVxuXG5cdGV4cG9ydCB0eXBlIElEb3dubG9hZE9wdGlvbnMgPSB7XG5cblx0XHQvKipcblx0XHQgKiDlj6rnlKLnlJ/nm67pjITntZDmp4sg5LiN5LiL6LyJ5YWn5a65XG5cdFx0ICovXG5cdFx0ZGlzYWJsZURvd25sb2FkPzogYm9vbGVhbixcblx0XHRkaXNhYmxlQ2hlY2tFeGlzdHM/OiBib29sZWFuLFxuXG5cdFx0b3B0aW9uc0pTRE9NPzogSUZyb21VcmxPcHRpb25zICYgSU9wdGlvbnNKU0RPTSAmIHtcblx0XHRcdGNvb2tpZUphcj86IFBhcnRpYWw8TGF6eUNvb2tpZUphcj4sXG5cdFx0fSxcblxuXHRcdC8qKlxuXHRcdCAqIOioreWumuWwj+iqquizh+aWmeWkvuaoo+W8j1xuXHRcdCAqL1xuXHRcdHBhdGhOb3ZlbFN0eWxlPzogRW51bVBhdGhOb3ZlbFN0eWxlLFxuXG5cdH0gJiBJT3B0aW9uc1BsdXM7XG5cblx0ZXhwb3J0IHR5cGUgSU9wdGlvbnNSdW50aW1lID0gSU9wdGlvbnMgJiBJRG93bmxvYWRPcHRpb25zICYgSU9wdGlvbnNQbHVzO1xuXG5cdGV4cG9ydCBpbnRlcmZhY2UgSVBhcnNlVXJsXG5cdHtcblx0XHR1cmw/OiBVUkwgfCBzdHJpbmcsXG5cblx0XHRub3ZlbF9waWQ/LFxuXHRcdG5vdmVsX2lkPyxcblx0XHRjaGFwdGVyX2lkPyxcblxuXHRcdG5vdmVsX3IxOD8sXG5cblx0XHRba2V5OiBzdHJpbmddOiBhbnksXG5cdH1cblxuXHRleHBvcnQgaW50ZXJmYWNlIElDaGFwdGVyXG5cdHtcblx0XHRjaGFwdGVyX2luZGV4PzogbnVtYmVyIHwgc3RyaW5nLFxuXHRcdGNoYXB0ZXJfdGl0bGU6IHN0cmluZyxcblx0XHRjaGFwdGVyX2lkP1xuXHRcdGNoYXB0ZXJfdXJsP1xuXHRcdGNoYXB0ZXJfdXJsX2RhdGE/XG5cdFx0Y2hhcHRlcl9kYXRlPzogbW9tZW50Lk1vbWVudCxcblxuXHRcdGltZ3M/OiBzdHJpbmdbXSxcblxuXHRcdFtrZXk6IHN0cmluZ106IGFueSxcblx0fVxuXG5cdGV4cG9ydCBpbnRlcmZhY2UgSVZvbHVtZVxuXHR7XG5cdFx0dm9sdW1lX2luZGV4P1xuXHRcdHZvbHVtZV90aXRsZTogc3RyaW5nLFxuXHRcdGNoYXB0ZXJfbGlzdD86IElDaGFwdGVyW10sXG5cblx0XHRba2V5OiBzdHJpbmddOiBhbnksXG5cdH1cblxuXHRleHBvcnQgaW50ZXJmYWNlIElOb3ZlbFxuXHR7XG5cdFx0dXJsOiBVUkwgfCBzdHJpbmcsXG5cdFx0dXJsX2RhdGE6IElQYXJzZVVybCxcblxuXHRcdG5vdmVsX3RpdGxlOiBzdHJpbmcsXG5cdFx0bm92ZWxfYXV0aG9yPzogc3RyaW5nLFxuXG5cdFx0bm92ZWxfZGVzYz86IHN0cmluZyxcblx0XHRub3ZlbF9kYXRlPzogbW9tZW50Lk1vbWVudCxcblx0XHRub3ZlbF9wdWJsaXNoZXI/OiBzdHJpbmcsXG5cblx0XHRub3ZlbF9zZXJpZXNfdGl0bGU/OiBzdHJpbmcsXG5cblx0XHR2b2x1bWVfbGlzdDogSVZvbHVtZVtdLFxuXG5cdFx0Y2hlY2tkYXRlPzogbW9tZW50Lk1vbWVudCxcblxuXHRcdGltZ3M/OiBzdHJpbmdbXSxcblxuXHRcdFtrZXk6IHN0cmluZ106IGFueSxcblx0fVxuXG5cdGV4cG9ydCBpbnRlcmZhY2UgSU5vdmVsU2l0ZVN0YXRpYzxUPiBleHRlbmRzIFR5cGU8VCAmIE5vdmVsU2l0ZS5JTm92ZWxTaXRlPlxuXHR7XG5cdFx0SURLRVk6IHN0cmluZyxcblx0fVxuXG5cdGV4cG9ydCBpbnRlcmZhY2UgSU5vdmVsU2l0ZVxuXHR7XG5cdFx0ZG93bmxvYWQodXJsOiBzdHJpbmcgfCBVUkwsIG9wdGlvbnM/OiBJRG93bmxvYWRPcHRpb25zKTogUHJvbWlzZUJsdWViaXJkPE5vdmVsU2l0ZS5JTm92ZWw+O1xuXG5cdFx0bWFrZVVybCh1cmxvYmo6IE5vdmVsU2l0ZS5JUGFyc2VVcmwsIG9wdGlvbnM/KTogVVJMO1xuXG5cdFx0cGFyc2VVcmwodXJsOiBVUkwgfCBzdHJpbmcpOiBOb3ZlbFNpdGUuSVBhcnNlVXJsO1xuXHR9XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgVHlwZTxUPlxue1xuXHRuZXcob3B0aW9uczogTm92ZWxTaXRlLklPcHRpb25zLCAuLi5hcmdzOiBhbnlbXSk6IFQ7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzdGF0aWNJbXBsZW1lbnRzPFQ+KClcbntcblx0cmV0dXJuIChjb25zdHJ1Y3RvcjogVCkgPT4ge31cbn1cblxuZXhwb3J0IGRlZmF1bHQgTm92ZWxTaXRlO1xuIl19