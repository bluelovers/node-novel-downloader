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
    makeUrl(urlobj, options) {
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
    createMainUrl(url) {
        let data = this.parseUrl(url);
        if (!data || !data.novel_id) {
            //console.log(data);
            throw new ReferenceError();
        }
        return this.makeUrl(data, true);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7O0dBRUc7O0FBRUgsb0RBQXNEO0FBbUM3Qyw0QkFuQ0Ysa0JBQWlCLENBbUNFO0FBbEMxQixxREFBcUQ7QUFFckQsNENBQTZDO0FBZ0NqQiwwQ0FBZTtBQS9CM0MseUNBQWdDO0FBQ2hDLCtCQUFnQztBQUVoQyx1Q0FBbUM7QUFHbkMsb0NBQXVIO0FBRTlHLDhCQUZBLDJCQUFtQixDQUVBO0FBQWtDLDZCQUZBLDBCQUFrQixDQUVBO0FBQ2hGLHFEQUFrRjtBQUtsRiwrQkFBZ0M7QUFDaEMsd0NBQTZDO0FBQzdDLG1EQUFvRDtBQUNwRCxvQ0FBcUM7QUFDckMscURBQTREO0FBRTVELG1DQUFtQztBQUNuQywwQ0FBMkM7QUFRbEMsd0JBQU07QUFQZixrQ0FBeUQ7QUFLekQsTUFBTSxDQUFDLEVBQUUsQ0FBQyxNQUFNLEdBQUcsY0FBYyxPQUFPLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQU01QyxRQUFBLFlBQVksR0FBRyxNQUFNLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0FBRWhELE1BQWEsU0FBUztJQU9yQixZQUFZLE9BQTJCLEVBQUUsR0FBRyxJQUFJO1FBRS9DLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUNmO1lBQ0MsTUFBTSxJQUFJLGNBQWMsQ0FBQyxlQUFlLENBQUMsQ0FBQztTQUMxQztRQUVELElBQUksQ0FBQyxXQUFXLEdBQUcsT0FBTyxDQUFDO1FBQzNCLElBQUksQ0FBQyxXQUFXLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsR0FBRyxJQUFJLE9BQU8sQ0FBQyxHQUFHLEVBQUUsQ0FBQztRQUU3RCxDQUFDLElBQUksQ0FBQyxlQUFlLEVBQUUsSUFBSSxDQUFDLFdBQVcsQ0FBQyxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLFdB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QkFBa0IsR0FBRyxTQUFTLENBQUMsa0JBQWtCLENBQUM7QUFFaEUscUNBQTJDO0FBRTNDLFdBQWlCLFNBQVM7SUErRHpCLElBQWtCLGtCQUlqQjtJQUpELFdBQWtCLGtCQUFrQjtRQUVuQyxpRUFBVyxDQUFBO1FBQ1gsaUVBQVcsQ0FBQTtJQUNaLENBQUMsRUFKaUIsa0JBQWtCLEdBQWxCLDRCQUFrQixLQUFsQiw0QkFBa0IsUUFJbkM7QUErRkYsQ0FBQyxFQWxLZ0IsU0FBUyxHQUFULGlCQUFTLEtBQVQsaUJBQVMsUUFrS3pCO0FBT0QsU0FBZ0IsZ0JBQWdCO0lBRS9CLE9BQU8sQ0FBQyxXQUFjLEVBQUUsRUFBRSxHQUFFLENBQUMsQ0FBQTtBQUM5QixDQUFDO0FBSEQsNENBR0M7QUFFRCxrQkFBZSxTQUFTLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENyZWF0ZWQgYnkgdXNlciBvbiAyMDE4LzIvMTAvMDEwLlxuICovXG5cbmltcG9ydCBibHVlYmlyZERlY29yYXRvciBmcm9tICcuLi9kZWNvcmF0b3IvYmx1ZWJpcmQnO1xuLy9pbXBvcnQgYmx1ZWJpcmREZWNvcmF0b3IgZnJvbSAnYmx1ZWJpcmQtZGVjb3JhdG9yJztcblxuaW1wb3J0IFByb21pc2VCbHVlYmlyZCA9IHJlcXVpcmUoJ2JsdWViaXJkJyk7XG5pbXBvcnQgeyBVUkwgfSBmcm9tICdqc2RvbS11cmwnO1xuaW1wb3J0IHBhdGggPSByZXF1aXJlKCd1cGF0aDInKTtcblxuaW1wb3J0IHJvb3RQYXRoIGZyb20gXCIuLi8uLi9fcm9vdFwiO1xuaW1wb3J0IHsgcmV0cnlSZXF1ZXN0IH0gZnJvbSAnLi4vZmV0Y2gnO1xuXG5pbXBvcnQgeyBkZWZhdWx0SlNET01PcHRpb25zLCBJRnJvbVVybE9wdGlvbnMsIElPcHRpb25zSlNET00sIGNyZWF0ZU9wdGlvbnNKU0RPTSwgSU5vdmVsT3B0aW9uc0pTRE9NIH0gZnJvbSAnLi4vanNkb20nO1xuXG5leHBvcnQgeyBkZWZhdWx0SlNET01PcHRpb25zLCBJRnJvbVVybE9wdGlvbnMsIElPcHRpb25zSlNET00sIGNyZWF0ZU9wdGlvbnNKU0RPTSB9XG5pbXBvcnQgbm92ZWxJbmZvLCB7IElNZGNvbmZNZXRhLCBfaGFuZGxlRGF0YUZvclN0cmluZ2lmeSB9IGZyb20gJ25vZGUtbm92ZWwtaW5mbyc7XG5cbmV4cG9ydCB7IElNZGNvbmZNZXRhIH1cbmltcG9ydCB7IExhenlDb29raWUsIExhenlDb29raWVKYXIgfSBmcm9tICdqc2RvbS1leHRyYSc7XG5cbmltcG9ydCBmcyA9IHJlcXVpcmUoJ2ZzLWV4dHJhJyk7XG5pbXBvcnQgeyB0cmltRmlsZW5hbWUgfSBmcm9tICdmcy1pY29udi91dGlsJztcbmltcG9ydCB7IGNybGYsIENSTEYsIFJfQ1JMRiB9IGZyb20gJ2NybGYtbm9ybWFsaXplJztcbmltcG9ydCBTdHJVdGlsID0gcmVxdWlyZSgnc3RyLXV0aWwnKTtcbmltcG9ydCB7IEVudW1Ob3ZlbFN0YXR1cyB9IGZyb20gJ25vZGUtbm92ZWwtaW5mby9saWIvY29uc3QnO1xuXG4vL2ltcG9ydCAqIGFzIG1vbWVudCBmcm9tICdtb21lbnQnO1xuaW1wb3J0IG1vbWVudCA9IHJlcXVpcmUoJ21vbWVudC10aW1lem9uZScpO1xuaW1wb3J0IHsgX2ZpeFZvbHVtZUNoYXB0ZXJOYW1lLCBpc1VuZGVmIH0gZnJvbSAnLi4vdXRpbCc7XG5cbmltcG9ydCBFdmVudEVtaXR0ZXIgPSByZXF1aXJlKCdldmVudHMnKTtcbmltcG9ydCB7IElEb3dubG9hZE9wdGlvbnMgfSBmcm9tICcuL2RlbW8vYmFzZSc7XG5cbm1vbWVudC5mbi50b0pTT04gPSBmdW5jdGlvbiAoKSB7IHJldHVybiB0aGlzLmZvcm1hdCgpOyB9O1xuXG5leHBvcnQgeyBtb21lbnQgfTtcblxuZXhwb3J0IHsgYmx1ZWJpcmREZWNvcmF0b3IsIFByb21pc2VCbHVlYmlyZCB9XG5cbmV4cG9ydCBjb25zdCBTWU1CT0xfQ0FDSEUgPSBTeW1ib2wuZm9yKCdjYWNoZScpO1xuXG5leHBvcnQgY2xhc3MgTm92ZWxTaXRlIGltcGxlbWVudHMgTm92ZWxTaXRlLklOb3ZlbFNpdGVcbntcblx0cHVibGljIHN0YXRpYyByZWFkb25seSBJREtFWTogc3RyaW5nID0gbnVsbDtcblxuXHRwdWJsaWMgUEFUSF9OT1ZFTF9NQUlOOiBzdHJpbmc7XG5cdHB1YmxpYyBvcHRpb25zSW5pdD86IE5vdmVsU2l0ZS5JT3B0aW9ucztcblxuXHRjb25zdHJ1Y3RvcihvcHRpb25zOiBOb3ZlbFNpdGUuSU9wdGlvbnMsIC4uLmFyZ3YpXG5cdHtcblx0XHRpZiAoIXRoaXMuSURLRVkpXG5cdFx0e1xuXHRcdFx0dGhyb3cgbmV3IFJlZmVyZW5jZUVycm9yKGBJREtFWSBpcyBudWxsYCk7XG5cdFx0fVxuXG5cdFx0dGhpcy5vcHRpb25zSW5pdCA9IG9wdGlvbnM7XG5cdFx0dGhpcy5vcHRpb25zSW5pdC5jd2QgPSB0aGlzLm9wdGlvbnNJbml0LmN3ZCB8fCBwcm9jZXNzLmN3ZCgpO1xuXG5cdFx0W3RoaXMuUEFUSF9OT1ZFTF9NQUlOLCB0aGlzLm9wdGlvbnNJbml0XSA9IHRoaXMuZ2V0T3V0cHV0RGlyKHRoaXMub3B0aW9uc0luaXQpO1xuXG5cdFx0aWYgKHRoaXMub3B0aW9uc0luaXQuZGVidWdMb2cpXG5cdFx0e1xuXHRcdFx0Y29uc29sZURlYnVnLmVuYWJsZWQgPSB0cnVlO1xuXHRcdH1cblx0fVxuXG5cdHN0YXRpYyBjcmVhdGUob3B0aW9uczogTm92ZWxTaXRlLklPcHRpb25zLCAuLi5hcmd2KVxuXHR7XG5cdFx0cmV0dXJuIG5ldyB0aGlzKG9wdGlvbnMsIC4uLmFyZ3YpO1xuXHR9XG5cblx0c3RhdGljIGNoZWNrKHVybDogc3RyaW5nIHwgVVJMIHwgTm92ZWxTaXRlLklQYXJzZVVybCwgb3B0aW9ucz8pOiBib29sZWFuXG5cdHtcblx0XHRyZXR1cm4gZmFsc2U7XG5cdH1cblxuXHRzZXNzaW9uPFQgPSBOb3ZlbFNpdGUuSU9wdGlvbnNSdW50aW1lPihvcHRpb25zUnVudGltZTogVCAmIE5vdmVsU2l0ZS5JT3B0aW9uc1J1bnRpbWUsIHVybD86IFVSTClcblx0e1xuXHRcdG9wdGlvbnNSdW50aW1lLm9wdGlvbnNKU0RPTSA9IGNyZWF0ZU9wdGlvbnNKU0RPTShvcHRpb25zUnVudGltZS5vcHRpb25zSlNET00pO1xuXG5cdFx0aWYgKHVybClcblx0XHR7XG5cdFx0XHRvcHRpb25zUnVudGltZVtTWU1CT0xfQ0FDSEVdLnVybCA9IHVybDtcblx0XHR9XG5cblx0XHRyZXR1cm4gdGhpcztcblx0fVxuXG5cdGRvd25sb2FkKHVybDogc3RyaW5nIHwgVVJMLCBvcHRpb25zPzogTm92ZWxTaXRlLklEb3dubG9hZE9wdGlvbnMpOiBQcm9taXNlQmx1ZWJpcmQ8Tm92ZWxTaXRlLklOb3ZlbD5cblx0e1xuXHRcdHRocm93IG5ldyBTeW50YXhFcnJvcihgRnVuY3Rpb24gbm90IGltcGxlbWVudGVkYCk7XG5cdH1cblxuXHRnZXRfdm9sdW1lX2xpc3Q8VCA9IE5vdmVsU2l0ZS5JT3B0aW9uc1J1bnRpbWU+KHVybDogc3RyaW5nIHwgVVJMLFxuXHRcdG9wdGlvbnNSdW50aW1lOiBQYXJ0aWFsPFQgJiBOb3ZlbFNpdGUuSURvd25sb2FkT3B0aW9ucz4gPSB7fSxcblx0KTogUHJvbWlzZTxOb3ZlbFNpdGUuSU5vdmVsPlxuXHR7XG5cdFx0dGhyb3cgbmV3IFN5bnRheEVycm9yKGBGdW5jdGlvbiBub3QgaW1wbGVtZW50ZWRgKTtcblx0fVxuXG5cdG1ha2VVcmwodXJsb2JqOiBOb3ZlbFNpdGUuSVBhcnNlVXJsLCBvcHRpb25zPyk6IFVSTFxuXHR7XG5cdFx0dGhyb3cgbmV3IFN5bnRheEVycm9yKGBGdW5jdGlvbiBub3QgaW1wbGVtZW50ZWRgKTtcblx0fVxuXG5cdHBhcnNlVXJsKHVybDogVVJMIHwgc3RyaW5nLCBvcHRpb25zPyk6IE5vdmVsU2l0ZS5JUGFyc2VVcmxcblx0e1xuXHRcdHRocm93IG5ldyBTeW50YXhFcnJvcihgRnVuY3Rpb24gbm90IGltcGxlbWVudGVkYCk7XG5cdH1cblxuXHRnZXRTdGF0aWM8VCA9IHR5cGVvZiBOb3ZlbFNpdGU+KCk6IFRcblx0e1xuXHRcdC8vIEB0cy1pZ25vcmVcblx0XHRyZXR1cm4gdGhpcy5fX3Byb3RvX18uY29uc3RydWN0b3I7XG5cdH1cblxuXHRnZXQgSURLRVkoKTogc3RyaW5nXG5cdHtcblx0XHRsZXQga2V5ID0gdGhpcy5nZXRTdGF0aWMoKS5JREtFWTtcblxuXHRcdGlmICh0eXBlb2Yga2V5ICE9ICdzdHJpbmcnIHx8ICFrZXkpXG5cdFx0e1xuXHRcdFx0dGhyb3cgbmV3IFN5bnRheEVycm9yKGBJREtFWSBub3QgaW1wbGVtZW50ZWRgKTtcblx0XHR9XG5cblx0XHRyZXR1cm4ga2V5O1xuXHR9XG5cblx0cHJvdGVjdGVkIF9wYXRoTm92ZWxJRDxOIGV4dGVuZHMgTm92ZWxTaXRlLklOb3ZlbCwgVCBleHRlbmRzIE5vdmVsU2l0ZS5JT3B0aW9uc1J1bnRpbWU+KG5vdmVsOiBOLCBvcHRpb25zUnVudGltZTogVClcblx0e1xuXHRcdHJldHVybiBub3ZlbC51cmxfZGF0YS5ub3ZlbF9pZDtcblx0fVxuXG5cdGdldFBhdGhOb3ZlbDxOIGV4dGVuZHMgTm92ZWxTaXRlLklOb3ZlbCwgVCBleHRlbmRzIE5vdmVsU2l0ZS5JT3B0aW9uc1J1bnRpbWU+KFBBVEhfTk9WRUxfTUFJTjogc3RyaW5nLFxuXHRcdG5vdmVsOiBOLFxuXHRcdG9wdGlvbnNSdW50aW1lOiBULFxuXHQpXG5cdHtcblx0XHRsZXQgbmFtZTogc3RyaW5nO1xuXG5cdFx0bGV0IG5vdmVsX2lkID0gdGhpcy5fcGF0aE5vdmVsSUQobm92ZWwsIG9wdGlvbnNSdW50aW1lKTtcblxuXHRcdGlmIChvcHRpb25zUnVudGltZS5wYXRoTm92ZWxTdHlsZSlcblx0XHR7XG5cdFx0XHRpZiAob3B0aW9uc1J1bnRpbWUucGF0aE5vdmVsU3R5bGUgPT0gTm92ZWxTaXRlLkVudW1QYXRoTm92ZWxTdHlsZS5OT1ZFTElEKVxuXHRcdFx0e1xuXHRcdFx0XHRuYW1lID0gbm92ZWxfaWQ7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0aWYgKG5hbWUgPT0gbnVsbClcblx0XHR7XG5cdFx0XHRuYW1lID0gYCR7dGhpcy50cmltRmlsZW5hbWVOb3ZlbChub3ZlbC5ub3ZlbF90aXRsZSl9Xygke25vdmVsX2lkfSlgXG5cdFx0fVxuXG5cdFx0cmV0dXJuIHBhdGguam9pbihQQVRIX05PVkVMX01BSU4sIG5hbWUpO1xuXHR9XG5cblx0LyoqXG5cdCAqIOWmguaenOW3sue2k+S4i+i8iemBjiDliYfoqablnJblvp4gUkVBRE1FLm1kIOWFp+iugOWPlue8uua8j+eahOS4i+i8ieioreWumlxuXHQgKlxuXHQgKiBAcHJpdmF0ZVxuXHQgKi9cblx0X2xvYWRFeGlzdHNDb25mPFQsIE4gZXh0ZW5kcyBOb3ZlbFNpdGUuSU5vdmVsPihpbnB1dFVybCwgb3B0aW9uc1J1bnRpbWU6IFQsIG5vdmVsOiBOLCBwYXRoX25vdmVsOiBzdHJpbmcpXG5cdHtcblx0XHRsZXQgZmlsZSA9IHBhdGgucmVzb2x2ZShwYXRoX25vdmVsLCAnUkVBRE1FLm1kJyk7XG5cblx0XHRpZiAoZnMucGF0aEV4aXN0c1N5bmMoZmlsZSkpXG5cdFx0e1xuXHRcdFx0bGV0IG1kID0gZnMucmVhZEZpbGVTeW5jKGZpbGUpLnRvU3RyaW5nKCk7XG5cblx0XHRcdGxldCBjb25mID0gbm92ZWxJbmZvLnBhcnNlKG1kLCB7XG5cdFx0XHRcdGxvd0NoZWNrTGV2ZWw6IHRydWUsXG5cdFx0XHRcdHRocm93OiBmYWxzZSxcblx0XHRcdH0pO1xuXG5cdFx0XHRjb25zb2xlRGVidWcuZGVidWcoJ+aqouafpSBSRUFETUUubWQg5piv5ZCm5a2Y5Zyo5LiL6LyJ6Kit5a6aJyk7XG5cblx0XHRcdGlmIChjb25mICYmIGNvbmYub3B0aW9ucylcblx0XHRcdHtcblx0XHRcdFx0aWYgKGNvbmYub3B0aW9ucy5kb3dubG9hZE9wdGlvbnMgfHwgY29uZi5vcHRpb25zLmRvd25sb2Fkb3B0aW9ucylcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGNvbnNvbGVEZWJ1Zy5kZWJ1Zygn6LyJ5YWl5Lim5LiU5ZCI5L215bey5a2Y5Zyo55qE6Kit5a6aJyk7XG5cblx0XHRcdFx0XHRPYmplY3QuZW50cmllcyhjb25mLm9wdGlvbnMuZG93bmxvYWRPcHRpb25zIHx8IGNvbmYub3B0aW9ucy5kb3dubG9hZG9wdGlvbnMpXG5cdFx0XHRcdFx0XHQuZm9yRWFjaChmdW5jdGlvbiAoW2ssIHZdKVxuXHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRpZiAob3B0aW9uc1J1bnRpbWVba10gPT0gbnVsbClcblx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdG9wdGlvbnNSdW50aW1lW2tdID0gdjtcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0fSlcblx0XHRcdFx0XHQ7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdH1cblxuXHRnZXRPdXRwdXREaXI8VD4ob3B0aW9ucz86IFQgJiBOb3ZlbFNpdGUuSU9wdGlvbnMsIG5vdmVsTmFtZT86IHN0cmluZyk6IFtzdHJpbmcsIFQgJiBOb3ZlbFNpdGUuSU9wdGlvbnNdXG5cdHtcblx0XHRvcHRpb25zID0gT2JqZWN0LmFzc2lnbih7fSwgdGhpcy5vcHRpb25zSW5pdCwgb3B0aW9ucyk7XG5cblx0XHRpZiAoIW9wdGlvbnMub3V0cHV0RGlyKVxuXHRcdHtcblx0XHRcdHRocm93IG5ldyBSZWZlcmVuY2VFcnJvcihgb3B0aW9uczogb3V0cHV0RGlyIGlzIG5vdCBzZXRgKTtcblx0XHR9XG5cblx0XHRsZXQgcCA9IHBhdGguam9pbihvcHRpb25zLm91dHB1dERpciwgb3B0aW9ucy5kaXNhYmxlT3V0cHV0RGlyUHJlZml4ID8gJycgOiB0aGlzLklES0VZKTtcblxuXHRcdGlmICghcGF0aC5pc0Fic29sdXRlKHApKVxuXHRcdHtcblx0XHRcdHAgPSBwYXRoLmpvaW4ob3B0aW9ucy5jd2QsIHApO1xuXHRcdH1cblxuXHRcdHJvb3RQYXRoLmRpc2FibGVQYXRocy5jb25jYXQoX19kaXJuYW1lKS5mb3JFYWNoKGZ1bmN0aW9uIChkaXIpXG5cdFx0e1xuXHRcdFx0aWYgKHAuaW5kZXhPZihfX2Rpcm5hbWUpID09IDApXG5cdFx0XHR7XG5cdFx0XHRcdHRocm93IG5ldyBSZWZlcmVuY2VFcnJvcihgcGF0aCBub3QgYWxsb3cgXCIke3B9XCJgKVxuXHRcdFx0fVxuXHRcdH0pO1xuXG5cdFx0aWYgKHR5cGVvZiBub3ZlbE5hbWUgPT0gJ3N0cmluZycgfHwgbm92ZWxOYW1lKVxuXHRcdHtcblx0XHRcdGlmICghbm92ZWxOYW1lKVxuXHRcdFx0e1xuXHRcdFx0XHR0aHJvdyBuZXcgUmVmZXJlbmNlRXJyb3IoKTtcblx0XHRcdH1cblxuXHRcdFx0cCA9IHBhdGguam9pbihwLCBub3ZlbE5hbWUpO1xuXHRcdH1cblxuXHRcdG9wdGlvbnMgPSB0aGlzLl9maXhPcHRpb25zUnVudGltZShvcHRpb25zKTtcblxuXHRcdHJldHVybiBbcCwgb3B0aW9uc107XG5cdH1cblxuXHRwcm90ZWN0ZWQgX2ZpeE9wdGlvbnNSdW50aW1lPFQgPSBOb3ZlbFNpdGUuSU9wdGlvbnNSdW50aW1lPihvcHRpb25zUnVudGltZTogVCAmIE5vdmVsU2l0ZS5JT3B0aW9uc1J1bnRpbWUpOiBUICYgTm92ZWxTaXRlLklPcHRpb25zUnVudGltZVxuXHR7XG5cdFx0b3B0aW9uc1J1bnRpbWVbU1lNQk9MX0NBQ0hFXSA9IChvcHRpb25zUnVudGltZVtTWU1CT0xfQ0FDSEVdIHx8IHt9KSBhcyB7XG5cdFx0XHR1cmw/OiBVUkwsXG5cdFx0XHRwYXRoX25vdmVsPzogc3RyaW5nLFxuXHRcdFx0bm92ZWw/OiBOb3ZlbFNpdGUuSU5vdmVsLFxuXHRcdH07XG5cblx0XHRvcHRpb25zUnVudGltZS5zdGFydEluZGV4ID0gb3B0aW9uc1J1bnRpbWUuc3RhcnRJbmRleCB8fCAwO1xuXG5cdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdG9wdGlvbnNSdW50aW1lLm9wdGlvbnNKU0RPTSA9IGNyZWF0ZU9wdGlvbnNKU0RPTShvcHRpb25zUnVudGltZS5vcHRpb25zSlNET00pO1xuXG5cblx0XHRpZiAob3B0aW9uc1J1bnRpbWUuZGVidWdMb2cgIT0gbnVsbClcblx0XHR7XG5cdFx0XHRvcHRpb25zUnVudGltZS5kZWJ1Z0xvZyA9ICEhb3B0aW9uc1J1bnRpbWUuZGVidWdMb2c7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIG9wdGlvbnNSdW50aW1lO1xuXHR9XG5cblx0dHJpbUZpbGVuYW1lQ2hhcHRlcihuYW1lKTogc3RyaW5nXG5cdHtcblx0XHRyZXR1cm4gdGhpcy50cmltRmlsZW5hbWUobmFtZSk7XG5cdH1cblxuXHR0cmltRmlsZW5hbWVWb2x1bWUobmFtZSk6IHN0cmluZ1xuXHR7XG5cdFx0cmV0dXJuIHRoaXMudHJpbUZpbGVuYW1lKG5hbWUpO1xuXHR9XG5cblx0dHJpbUZpbGVuYW1lTm92ZWwobmFtZSk6IHN0cmluZ1xuXHR7XG5cdFx0cmV0dXJuIHRoaXMudHJpbUZpbGVuYW1lKG5hbWUpO1xuXHR9XG5cblx0dHJpbUZpbGVuYW1lKG5hbWUpOiBzdHJpbmdcblx0e1xuXHRcdHJldHVybiB0cmltRmlsZW5hbWUoX2ZpeFZvbHVtZUNoYXB0ZXJOYW1lKG5hbWUpKTtcblx0fVxuXG5cdHRyaW1UYWcodGFnKTogc3RyaW5nXG5cdHtcblx0XHRyZXR1cm4gKHRhZyBhcyBzdHJpbmcpXG5cdFx0XHQucmVwbGFjZSgvW1xcW1xcXVxcL1xcXFxdL2csIChzKSA9PlxuXHRcdFx0e1xuXHRcdFx0XHRyZXR1cm4gU3RyVXRpbC50b0Z1bGxXaWR0aChzKVxuXHRcdFx0fSlcblx0XHRcdDtcblx0fVxuXG5cdHByb3RlY3RlZCBfZXhwb3J0RG93bmxvYWRPcHRpb25zPFQgPSBJT3B0aW9uc1J1bnRpbWU+KG9wdGlvbnNSdW50aW1lPzogVCAmIElPcHRpb25zUnVudGltZSk6IHVua25vd25cblx0e1xuXHRcdHJldHVybiB2b2lkICgwKTtcblx0fVxuXG5cdHByb3RlY3RlZCBfaGFuZGxlRGF0YUZvclN0cmluZ2lmeSguLi5hcmd2KTogSU1kY29uZk1ldGFcblx0e1xuXHRcdC8vIEB0cy1pZ25vcmVcblx0XHRsZXQgbWRjb25mOiBJTWRjb25mTWV0YSA9IF9oYW5kbGVEYXRhRm9yU3RyaW5naWZ5KC4uLmFyZ3YpO1xuXG5cdFx0aWYgKG1kY29uZi5ub3ZlbClcblx0XHR7XG5cdFx0XHRpZiAobWRjb25mLm5vdmVsLnRhZ3MgJiYgQXJyYXkuaXNBcnJheShtZGNvbmYubm92ZWwudGFncykpXG5cdFx0XHR7XG5cdFx0XHRcdGxldCBib29sOiBib29sZWFuO1xuXG5cdFx0XHRcdGJvb2wgPSBbXG5cdFx0XHRcdFx0J+abuOexjeWMlicsXG5cdFx0XHRcdFx0J+S5puexjeWMlicsXG5cdFx0XHRcdFx0J+aWh+W6q+WMlicsXG5cdFx0XHRcdFx0J+aWh+W6k+WMlicsXG5cdFx0XHRcdF0uc29tZSh2ID0+XG5cdFx0XHRcdHtcblx0XHRcdFx0XHRyZXR1cm4gbWRjb25mLm5vdmVsLnRhZ3MuaW5jbHVkZXModilcblx0XHRcdFx0fSk7XG5cblx0XHRcdFx0aWYgKGJvb2wpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRtZGNvbmYubm92ZWwubm92ZWxfc3RhdHVzID0gKG1kY29uZi5ub3ZlbC5ub3ZlbF9zdGF0dXMgfCAwKSB8IEVudW1Ob3ZlbFN0YXR1cy5QX0JPT0s7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cblx0XHRyZXR1cm4gbWRjb25mO1xuXHR9XG5cblx0cHJvdGVjdGVkIF9zYXZlUmVhZG1lKG9wdGlvbnNSdW50aW1lPzogSU9wdGlvbnNSdW50aW1lLCBvcHRpb25zID0ge30sIC4uLm9wdHMpXG5cdHtcblx0XHRjb25zdCBzZWxmID0gdGhpcztcblxuXHRcdGlmIChpc1VuZGVmKG9wdGlvbnNSdW50aW1lKVxuXHRcdFx0fHwgaXNVbmRlZihvcHRpb25zUnVudGltZVtTWU1CT0xfQ0FDSEVdLCB7fSlcblxuXHRcdFx0fHwgaXNVbmRlZihvcHRpb25zUnVudGltZVtTWU1CT0xfQ0FDSEVdLm5vdmVsLCB7fSlcblx0XHRcdHx8IGlzVW5kZWYob3B0aW9uc1J1bnRpbWVbU1lNQk9MX0NBQ0hFXS5wYXRoX25vdmVsLCAnJylcblx0XHQpXG5cdFx0e1xuXHRcdFx0dGhyb3cgbmV3IFJlZmVyZW5jZUVycm9yKGBzYXZlUmVhZG1lYCk7XG5cdFx0fVxuXG5cdFx0Y29uc3Qgbm92ZWwgPSBvcHRpb25zUnVudGltZVtTWU1CT0xfQ0FDSEVdLm5vdmVsO1xuXHRcdGNvbnN0IHBhdGhfbm92ZWwgPSBvcHRpb25zUnVudGltZVtTWU1CT0xfQ0FDSEVdLnBhdGhfbm92ZWw7XG5cblx0XHRsZXQgbWRjb25maWcgPSB0aGlzLl9oYW5kbGVEYXRhRm9yU3RyaW5naWZ5KHtcblx0XHRcdG5vdmVsOiB7XG5cdFx0XHRcdGlsbHVzdDogJycsXG5cdFx0XHRcdHRpdGxlX3poMTogJycsXG5cdFx0XHRcdGlsbHVzdHM6IFtdLFxuXHRcdFx0XHRwdWJsaXNoZXJzOiBbXG5cdFx0XHRcdFx0c2VsZi5JREtFWSxcblx0XHRcdFx0XSxcblx0XHRcdFx0dGFnczogW1xuXHRcdFx0XHRcdHNlbGYuSURLRVksXG5cdFx0XHRcdF0sXG5cdFx0XHRcdHNlcmllczoge1xuXHRcdFx0XHRcdG5hbWU6IG5vdmVsLm5vdmVsX3Nlcmllc190aXRsZSB8fCBub3ZlbC5ub3ZlbF90aXRsZSB8fCAnJyxcblx0XHRcdFx0fSxcblx0XHRcdFx0bm92ZWxfc3RhdHVzOiAwLFxuXHRcdFx0fSxcblx0XHRcdG9wdGlvbnMsXG5cblx0XHRcdGxpbms6IG5vdmVsLmxpbmsgfHwgW10sXG5cdFx0fSwgbm92ZWwsIC4uLm9wdHMpO1xuXG5cdFx0bGV0IG1kID0gbm92ZWxJbmZvLnN0cmluZ2lmeShtZGNvbmZpZyk7XG5cblx0XHRsZXQgZmlsZSA9IHBhdGguam9pbihwYXRoX25vdmVsLCBgUkVBRE1FLm1kYCk7XG5cblx0XHRjb25zb2xlRGVidWcuaW5mbyhgW01FVEFdYCwgYHNhdmUgUkVBRE1FLm1kYCk7XG5cblx0XHRyZXR1cm4gZnMub3V0cHV0RmlsZShmaWxlLCBtZClcblx0XHRcdC50aGVuKGZ1bmN0aW9uICgpXG5cdFx0XHR7XG5cdFx0XHRcdHJldHVybiB7XG5cdFx0XHRcdFx0ZmlsZSxcblx0XHRcdFx0XHRtZCxcblx0XHRcdFx0fTtcblx0XHRcdH0pXG5cdFx0XHQ7XG5cdH1cblxuXHRjcmVhdGVNYWluVXJsKHVybDogc3RyaW5nKTogVVJMXG5cdGNyZWF0ZU1haW5VcmwodXJsOiBVUkwpOiBVUkxcblx0Y3JlYXRlTWFpblVybCh1cmwpXG5cdHtcblx0XHRsZXQgZGF0YSA9IHRoaXMucGFyc2VVcmwodXJsKTtcblxuXHRcdGlmICghZGF0YSB8fCAhZGF0YS5ub3ZlbF9pZClcblx0XHR7XG5cdFx0XHQvL2NvbnNvbGUubG9nKGRhdGEpO1xuXG5cdFx0XHR0aHJvdyBuZXcgUmVmZXJlbmNlRXJyb3IoKTtcblx0XHR9XG5cblx0XHRyZXR1cm4gdGhpcy5tYWtlVXJsKGRhdGEsIHRydWUpO1xuXHR9XG5cblx0cHJvdGVjdGVkIF9jcmVhdGVDaGFwdGVyVXJsPFQgPSBJT3B0aW9uc1J1bnRpbWU+KHtcblx0XHRub3ZlbCxcblx0XHR2b2x1bWUsXG5cdFx0Y2hhcHRlcixcblx0fToge1xuXHRcdG5vdmVsOiBOb3ZlbFNpdGUuSU5vdmVsLFxuXHRcdHZvbHVtZTogTm92ZWxTaXRlLklWb2x1bWUsXG5cdFx0Y2hhcHRlcjogTm92ZWxTaXRlLklDaGFwdGVyLFxuXHR9LCBvcHRpb25zUnVudGltZT86IFQgJiBJT3B0aW9uc1J1bnRpbWUpOiBVUkxcblx0e1xuXHRcdC8vIEB0cy1pZ25vcmVcblx0XHRyZXR1cm4gbmV3IFVSTChjaGFwdGVyLmNoYXB0ZXJfdXJsKTtcblx0fVxuXG5cdHByb3RlY3RlZCBfZmV0Y2hDaGFwdGVyPFQ+KHVybDogVVJMLCBvcHRpb25zUnVudGltZTogVCAmIElPcHRpb25zUnVudGltZSlcblx0e1xuXHRcdHRocm93IG5ldyBTeW50YXhFcnJvcihgRnVuY3Rpb24gbm90IGltcGxlbWVudGVkYCk7XG5cdH1cblxuXHRwcm90ZWN0ZWQgX3BhcnNlQ2hhcHRlcjxUPihkb20sIG9wdGlvbnNSdW50aW1lOiBUICYgSU9wdGlvbnNSdW50aW1lLCBjYWNoZToge1xuXHRcdGZpbGU6IHN0cmluZyxcblx0XHRub3ZlbDogTm92ZWxTaXRlLklOb3ZlbCxcblx0XHR2b2x1bWU6IE5vdmVsU2l0ZS5JVm9sdW1lLFxuXHRcdGNoYXB0ZXI6IE5vdmVsU2l0ZS5JQ2hhcHRlcixcblx0fSlcblx0e1xuXHRcdHRocm93IG5ldyBTeW50YXhFcnJvcihgRnVuY3Rpb24gbm90IGltcGxlbWVudGVkYCk7XG5cdH1cblxuXHRnZXRFeHRyYUluZm88VCwgTSBleHRlbmRzIFBhcnRpYWw8SU5vdmVsICYgSU1kY29uZk1ldGE+LCBDIGV4dGVuZHMgdW5rbm93bj4odXJsb2JqOiBOb3ZlbFNpdGUuSVBhcnNlVXJsLFxuXHRcdG9wdGlvbnNSdW50aW1lOiBUICYgSU9wdGlvbnNSdW50aW1lLFxuXHRcdGRhdGFfbWV0YT86IE0sXG5cdFx0Y2FjaGU/OiBDLFxuXHQpOiBQcm9taXNlQmx1ZWJpcmQ8TT5cblx0e1xuXHRcdHRocm93IG5ldyBTeW50YXhFcnJvcihgRnVuY3Rpb24gbm90IGltcGxlbWVudGVkYCk7XG5cdH1cblxuXHRwcm90ZWN0ZWQgX2NoZWNrRXhpc3RzKG9wdGlvbnNSdW50aW1lOiBJT3B0aW9uc1J1bnRpbWUsIGZpbGU6IHN0cmluZyk6IGJvb2xlYW5cblx0e1xuXHRcdGlmICghb3B0aW9uc1J1bnRpbWUuZGlzYWJsZUNoZWNrRXhpc3RzICYmIGZzLmV4aXN0c1N5bmMoZmlsZSkpXG5cdFx0e1xuXHRcdFx0bGV0IHR4dCA9IGZzLnJlYWRGaWxlU3luYyhmaWxlKTtcblxuXHRcdFx0aWYgKHR4dC50b1N0cmluZygpLnJlcGxhY2UoL15cXHMrfFxccyskL2csICcnKSlcblx0XHRcdHtcblx0XHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0cmV0dXJuIGZhbHNlXG5cdH1cblxuXHRwcm90ZWN0ZWQgZW1pdChldmVudDogRXZlbnRFbWl0dGVyLCBldmVudE5hbWU6IHN0cmluZywgLi4uYXJndilcblx0e1xuXHRcdGxldCBib29sID0gZXZlbnQuZW1pdChldmVudE5hbWUsIHRoaXMsIC4uLmFyZ3YpO1xuXHRcdHJldHVybiBbZXZlbnQsIGJvb2xdO1xuXHR9XG5cblx0X3NhdmVGaWxlPFQgPSBOb3ZlbFNpdGUuSU9wdGlvbnNSdW50aW1lPihvcHRzOiB7XG5cdFx0ZmlsZTogc3RyaW5nLFxuXHRcdGNvbnRleHQ6IHN0cmluZyB8IEJ1ZmZlcixcblx0XHRvcHRpb25zUnVudGltZTogVCAmIE5vdmVsU2l0ZS5JT3B0aW9uc1J1bnRpbWUsXG5cdH0pXG5cdHtcblx0XHRyZXR1cm4gUHJvbWlzZUJsdWViaXJkLnJlc29sdmUoKVxuXHRcdFx0LmJpbmQodGhpcylcblx0XHRcdC50aGVuKCgpID0+IHtcblx0XHRcdFx0bGV0IHsgZmlsZSwgY29udGV4dCwgb3B0aW9uc1J1bnRpbWUgfSA9IG9wdHM7XG5cblx0XHRcdFx0aWYgKG9wdGlvbnNSdW50aW1lLmxpbmVCcmVha0NybGYpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRsZXQgdHh0MSA9IGNvbnRleHQudG9TdHJpbmcoKTtcblxuXHRcdFx0XHRcdGlmIChSX0NSTEYudGVzdCh0eHQxKSlcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRsZXQgdHh0MiA9IGNybGYodHh0MSwgQ1JMRik7XG5cblx0XHRcdFx0XHRcdGlmICh0eHQxICE9PSB0eHQyKVxuXHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRjb250ZXh0ID0gdHh0Mjtcblx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0dHh0MSA9IG51bGw7XG5cdFx0XHRcdFx0XHR0eHQyID0gbnVsbDtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRyZXR1cm4gZnMub3V0cHV0RmlsZShmaWxlLCBjb250ZXh0KVxuXHRcdFx0XHRcdC50aGVuKHIgPT4ge1xuXG5cdFx0XHRcdFx0XHRpZiAob3B0aW9uc1J1bnRpbWUuZGVidWdMb2cpXG5cdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdGxldCBmaWxlMiA9IHBhdGgucmVsYXRpdmUob3B0aW9uc1J1bnRpbWUub3V0cHV0RGlyLCBmaWxlKTtcblxuXHRcdFx0XHRcdFx0XHRjb25zb2xlRGVidWcuc3VjY2VzcyhgW1NBVkVdYCwgZmlsZTIpO1xuXHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHRyZXR1cm4gcjtcblx0XHRcdFx0XHR9KVxuXHRcdFx0fSlcblx0XHQ7XG5cdH1cblxufVxuXG5leHBvcnQgaW1wb3J0IElPcHRpb25zUnVudGltZSA9IE5vdmVsU2l0ZS5JT3B0aW9uc1J1bnRpbWU7XG5leHBvcnQgaW1wb3J0IElWb2x1bWUgPSBOb3ZlbFNpdGUuSVZvbHVtZTtcbmV4cG9ydCBpbXBvcnQgSUNoYXB0ZXIgPSBOb3ZlbFNpdGUuSUNoYXB0ZXI7XG5leHBvcnQgaW1wb3J0IEVudW1QYXRoTm92ZWxTdHlsZSA9IE5vdmVsU2l0ZS5FbnVtUGF0aE5vdmVsU3R5bGU7XG5pbXBvcnQgeyBJTm92ZWwgfSBmcm9tICcuL3N5b3NldHUnO1xuaW1wb3J0IHsgY29uc29sZURlYnVnIH0gZnJvbSAnLi4vdXRpbC9sb2cnO1xuXG5leHBvcnQgbmFtZXNwYWNlIE5vdmVsU2l0ZVxue1xuXG5cdGV4cG9ydCB0eXBlIElGaWxlUHJlZml4TW9kZSA9IDAgfCAxIHwgMiB8IDMgfCA0IHwgNTtcblxuXHRleHBvcnQgdHlwZSBJT3B0aW9uc1BsdXMgPSB7XG5cblx0XHRkaXNhYmxlT3V0cHV0RGlyUHJlZml4PzogYm9vbGVhbixcblxuXHRcdG5vRGlyUHJlZml4PzogYm9vbGVhbixcblx0XHRub0RpclBhZGVuZD86IGJvb2xlYW4sXG5cblx0XHRub0ZpcmVQcmVmaXg/OiBib29sZWFuLFxuXHRcdG5vRmlsZVBhZGVuZD86IGJvb2xlYW4sXG5cblx0XHRyZXRyeURlbGF5PzogbnVtYmVyLFxuXHRcdHN0YXJ0SW5kZXg/OiBudW1iZXIsXG5cblx0XHRmaWxlUHJlZml4TW9kZT86IG51bWJlciB8IElGaWxlUHJlZml4TW9kZSxcblxuXHRcdGFsbG93RW1wdHlWb2x1bWVUaXRsZT86IGJvb2xlYW4sXG5cblx0XHRldmVudD86IEV2ZW50RW1pdHRlcixcblxuXHRcdC8qKlxuXHRcdCAqIOeUqOS+hueZu+WFpeermem7nueahCBjb29raWVzIHNlc3Npb25cblx0XHQgKi9cblx0XHRzZXNzaW9uRGF0YT86IHtcblx0XHRcdFtrZXk6IHN0cmluZ106IGFueSxcblx0XHR9LFxuXG5cdFx0LyoqXG5cdFx0ICog5Y+q5oqT5Y+W5bCP6Kqq55qEIE1FVEEg6LOH5paZXG5cdFx0ICovXG5cdFx0ZmV0Y2hNZXRhRGF0YU9ubHk/OiBib29sZWFuLFxuXG5cdFx0ZGVidWdMb2c/OiBib29sZWFuLFxuXG5cdFx0bGluZUJyZWFrQ3JsZj86IGJvb2xlYW4sXG5cblx0XHQvKipcblx0XHQgKiDkv53nlZnms6jpn7PmoLzlvI9cblx0XHQgKi9cblx0XHRrZWVwUnVieT86IGJvb2xlYW47XG5cdFx0LyoqXG5cdFx0ICog5L+d55WZ5YW25LuW5qC85byPXG5cdFx0ICovXG5cdFx0a2VlcEZvcm1hdD86IGJvb2xlYW47XG5cblx0XHQvKipcblx0XHQgKiDlnKjlhafmlofljp/lp4vkvY3nva7kuIrkv53nlZnlnJbniYdcblx0XHQgKi9cblx0XHRrZWVwSW1hZ2U/OiBib29sZWFuO1xuXG5cdH1cblxuXHRleHBvcnQgdHlwZSBJT3B0aW9ucyA9IHtcblxuXHRcdG91dHB1dERpcj86IHN0cmluZyxcblx0XHRjd2Q/OiBzdHJpbmcsXG5cblx0fSAmIElPcHRpb25zUGx1cztcblxuXHRleHBvcnQgY29uc3QgZW51bSBFbnVtUGF0aE5vdmVsU3R5bGVcblx0e1xuXHRcdERFRkFVTFQgPSAwLFxuXHRcdE5PVkVMSUQgPSAxLFxuXHR9XG5cblx0ZXhwb3J0IHR5cGUgSURvd25sb2FkT3B0aW9ucyA9IHtcblxuXHRcdC8qKlxuXHRcdCAqIOWPqueUoueUn+ebrumMhOe1kOaniyDkuI3kuIvovInlhaflrrlcblx0XHQgKi9cblx0XHRkaXNhYmxlRG93bmxvYWQ/OiBib29sZWFuLFxuXHRcdGRpc2FibGVDaGVja0V4aXN0cz86IGJvb2xlYW4sXG5cblx0XHRvcHRpb25zSlNET00/OiBJRnJvbVVybE9wdGlvbnMgJiBJT3B0aW9uc0pTRE9NICYge1xuXHRcdFx0Y29va2llSmFyPzogUGFydGlhbDxMYXp5Q29va2llSmFyPixcblx0XHR9LFxuXG5cdFx0LyoqXG5cdFx0ICog6Kit5a6a5bCP6Kqq6LOH5paZ5aS+5qij5byPXG5cdFx0ICovXG5cdFx0cGF0aE5vdmVsU3R5bGU/OiBFbnVtUGF0aE5vdmVsU3R5bGUsXG5cblx0fSAmIElPcHRpb25zUGx1cztcblxuXHRleHBvcnQgdHlwZSBJT3B0aW9uc1J1bnRpbWUgPSBJT3B0aW9ucyAmIElEb3dubG9hZE9wdGlvbnMgJiBJT3B0aW9uc1BsdXM7XG5cblx0ZXhwb3J0IGludGVyZmFjZSBJUGFyc2VVcmxcblx0e1xuXHRcdHVybD86IFVSTCB8IHN0cmluZyxcblxuXHRcdG5vdmVsX3BpZD8sXG5cdFx0bm92ZWxfaWQ/LFxuXHRcdGNoYXB0ZXJfaWQ/LFxuXG5cdFx0bm92ZWxfcjE4PyxcblxuXHRcdFtrZXk6IHN0cmluZ106IGFueSxcblx0fVxuXG5cdGV4cG9ydCBpbnRlcmZhY2UgSUNoYXB0ZXJcblx0e1xuXHRcdGNoYXB0ZXJfaW5kZXg/OiBudW1iZXIgfCBzdHJpbmcsXG5cdFx0Y2hhcHRlcl90aXRsZTogc3RyaW5nLFxuXHRcdGNoYXB0ZXJfaWQ/XG5cdFx0Y2hhcHRlcl91cmw/XG5cdFx0Y2hhcHRlcl91cmxfZGF0YT9cblx0XHRjaGFwdGVyX2RhdGU/OiBtb21lbnQuTW9tZW50LFxuXG5cdFx0aW1ncz86IHN0cmluZ1tdLFxuXG5cdFx0W2tleTogc3RyaW5nXTogYW55LFxuXHR9XG5cblx0ZXhwb3J0IGludGVyZmFjZSBJVm9sdW1lXG5cdHtcblx0XHR2b2x1bWVfaW5kZXg/XG5cdFx0dm9sdW1lX3RpdGxlOiBzdHJpbmcsXG5cdFx0Y2hhcHRlcl9saXN0PzogSUNoYXB0ZXJbXSxcblxuXHRcdFtrZXk6IHN0cmluZ106IGFueSxcblx0fVxuXG5cdGV4cG9ydCBpbnRlcmZhY2UgSU5vdmVsXG5cdHtcblx0XHR1cmw6IFVSTCB8IHN0cmluZyxcblx0XHR1cmxfZGF0YTogSVBhcnNlVXJsLFxuXG5cdFx0bm92ZWxfdGl0bGU6IHN0cmluZyxcblx0XHRub3ZlbF9hdXRob3I/OiBzdHJpbmcsXG5cblx0XHRub3ZlbF9kZXNjPzogc3RyaW5nLFxuXHRcdG5vdmVsX2RhdGU/OiBtb21lbnQuTW9tZW50LFxuXHRcdG5vdmVsX3B1Ymxpc2hlcj86IHN0cmluZyxcblxuXHRcdG5vdmVsX3Nlcmllc190aXRsZT86IHN0cmluZyxcblxuXHRcdHZvbHVtZV9saXN0OiBJVm9sdW1lW10sXG5cblx0XHRjaGVja2RhdGU/OiBtb21lbnQuTW9tZW50LFxuXG5cdFx0aW1ncz86IHN0cmluZ1tdLFxuXG5cdFx0W2tleTogc3RyaW5nXTogYW55LFxuXHR9XG5cblx0ZXhwb3J0IGludGVyZmFjZSBJTm92ZWxTaXRlU3RhdGljPFQ+IGV4dGVuZHMgVHlwZTxUICYgTm92ZWxTaXRlLklOb3ZlbFNpdGU+XG5cdHtcblx0XHRJREtFWTogc3RyaW5nLFxuXHR9XG5cblx0ZXhwb3J0IGludGVyZmFjZSBJTm92ZWxTaXRlXG5cdHtcblx0XHRkb3dubG9hZCh1cmw6IHN0cmluZyB8IFVSTCwgb3B0aW9ucz86IElEb3dubG9hZE9wdGlvbnMpOiBQcm9taXNlQmx1ZWJpcmQ8Tm92ZWxTaXRlLklOb3ZlbD47XG5cblx0XHRtYWtlVXJsKHVybG9iajogTm92ZWxTaXRlLklQYXJzZVVybCwgb3B0aW9ucz8pOiBVUkw7XG5cblx0XHRwYXJzZVVybCh1cmw6IFVSTCB8IHN0cmluZyk6IE5vdmVsU2l0ZS5JUGFyc2VVcmw7XG5cdH1cbn1cblxuZXhwb3J0IGludGVyZmFjZSBUeXBlPFQ+XG57XG5cdG5ldyhvcHRpb25zOiBOb3ZlbFNpdGUuSU9wdGlvbnMsIC4uLmFyZ3M6IGFueVtdKTogVDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHN0YXRpY0ltcGxlbWVudHM8VD4oKVxue1xuXHRyZXR1cm4gKGNvbnN0cnVjdG9yOiBUKSA9PiB7fVxufVxuXG5leHBvcnQgZGVmYXVsdCBOb3ZlbFNpdGU7XG4iXX0=