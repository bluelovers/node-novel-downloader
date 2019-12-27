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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7O0dBRUc7O0FBRUgsb0RBQXNEO0FBbUM3Qyw0QkFuQ0Ysa0JBQWlCLENBbUNFO0FBbEMxQixxREFBcUQ7QUFFckQsNENBQTZDO0FBZ0NqQiwwQ0FBZTtBQS9CM0MseUNBQWdDO0FBQ2hDLCtCQUFnQztBQUVoQyx1Q0FBbUM7QUFHbkMsb0NBQXVIO0FBRTlHLDhCQUZBLDJCQUFtQixDQUVBO0FBQWtDLDZCQUZBLDBCQUFrQixDQUVBO0FBQ2hGLHFEQUFrRjtBQUtsRiwrQkFBZ0M7QUFDaEMsd0NBQTZDO0FBQzdDLG1EQUFvRDtBQUNwRCxvQ0FBcUM7QUFDckMscURBQTREO0FBRTVELG1DQUFtQztBQUNuQywwQ0FBMkM7QUFRbEMsd0JBQU07QUFQZixrQ0FBeUQ7QUFLekQsTUFBTSxDQUFDLEVBQUUsQ0FBQyxNQUFNLEdBQUcsY0FBYyxPQUFPLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQU01QyxRQUFBLFlBQVksR0FBRyxNQUFNLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0FBRWhELE1BQWEsU0FBUztJQU9yQixZQUFZLE9BQTJCLEVBQUUsR0FBRyxJQUFJO1FBRS9DLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUNmO1lBQ0MsTUFBTSxJQUFJLGNBQWMsQ0FBQyxlQUFlLENBQUMsQ0FBQztTQUMxQztRQUVELElBQUksQ0FBQyxXQUFXLEdBQUcsT0FBTyxDQUFDO1FBQzNCLElBQUksQ0FBQyxXQUFXLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsR0FBRyxJQUFJLE9BQU8sQ0FBQyxHQUFHLEVBQUUsQ0FBQztRQUU3RCxDQUFDLElBQUksQ0FBQyxlQUFlLEVBQUUsSUFBSSxDQUFDLFdBQVcsQ0FBQyxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLFdB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QkFDWixJQUFJLEdBQUcsSUFBSSxDQUFDO2lCQUNaO2FBQ0Q7WUFFRCxPQUFPLEVBQUUsQ0FBQyxVQUFVLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQztpQkFDakMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFO2dCQUVULElBQUksY0FBYyxDQUFDLFFBQVEsRUFDM0I7b0JBQ0MsSUFBSSxLQUFLLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxjQUFjLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxDQUFDO29CQUUxRCxrQkFBWSxDQUFDLE9BQU8sQ0FBQyxRQUFRLEVBQUUsS0FBSyxDQUFDLENBQUM7aUJBQ3RDO2dCQUVELE9BQU8sQ0FBQyxDQUFDO1lBQ1YsQ0FBQyxDQUFDLENBQUE7UUFDSixDQUFDLENBQUMsQ0FDRjtJQUNGLENBQUM7O0FBMWRGLDhCQTRkQztBQTFkdUIsZUFBSyxHQUFXLElBQUksQ0FBQztBQStkL0IsUUFBQSxrQkFBa0IsR0FBRyxTQUFTLENBQUMsa0JBQWtCLENBQUM7QUFFaEUscUNBQTJDO0FBRTNDLFdBQWlCLFNBQVM7SUErRHpCLElBQWtCLGtCQUlqQjtJQUpELFdBQWtCLGtCQUFrQjtRQUVuQyxpRUFBVyxDQUFBO1FBQ1gsaUVBQVcsQ0FBQTtJQUNaLENBQUMsRUFKaUIsa0JBQWtCLEdBQWxCLDRCQUFrQixLQUFsQiw0QkFBa0IsUUFJbkM7QUErRkYsQ0FBQyxFQWxLZ0IsU0FBUyxHQUFULGlCQUFTLEtBQVQsaUJBQVMsUUFrS3pCO0FBT0QsU0FBZ0IsZ0JBQWdCO0lBRS9CLE9BQU8sQ0FBQyxXQUFjLEVBQUUsRUFBRSxHQUFFLENBQUMsQ0FBQTtBQUM5QixDQUFDO0FBSEQsNENBR0M7QUFFRCxrQkFBZSxTQUFTLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENyZWF0ZWQgYnkgdXNlciBvbiAyMDE4LzIvMTAvMDEwLlxuICovXG5cbmltcG9ydCBibHVlYmlyZERlY29yYXRvciBmcm9tICcuLi9kZWNvcmF0b3IvYmx1ZWJpcmQnO1xuLy9pbXBvcnQgYmx1ZWJpcmREZWNvcmF0b3IgZnJvbSAnYmx1ZWJpcmQtZGVjb3JhdG9yJztcblxuaW1wb3J0IFByb21pc2VCbHVlYmlyZCA9IHJlcXVpcmUoJ2JsdWViaXJkJyk7XG5pbXBvcnQgeyBVUkwgfSBmcm9tICdqc2RvbS11cmwnO1xuaW1wb3J0IHBhdGggPSByZXF1aXJlKCd1cGF0aDInKTtcblxuaW1wb3J0IHJvb3RQYXRoIGZyb20gXCIuLi8uLi9fcm9vdFwiO1xuaW1wb3J0IHsgcmV0cnlSZXF1ZXN0IH0gZnJvbSAnLi4vZmV0Y2gnO1xuXG5pbXBvcnQgeyBkZWZhdWx0SlNET01PcHRpb25zLCBJRnJvbVVybE9wdGlvbnMsIElPcHRpb25zSlNET00sIGNyZWF0ZU9wdGlvbnNKU0RPTSwgSU5vdmVsT3B0aW9uc0pTRE9NIH0gZnJvbSAnLi4vanNkb20nO1xuXG5leHBvcnQgeyBkZWZhdWx0SlNET01PcHRpb25zLCBJRnJvbVVybE9wdGlvbnMsIElPcHRpb25zSlNET00sIGNyZWF0ZU9wdGlvbnNKU0RPTSB9XG5pbXBvcnQgbm92ZWxJbmZvLCB7IElNZGNvbmZNZXRhLCBfaGFuZGxlRGF0YUZvclN0cmluZ2lmeSB9IGZyb20gJ25vZGUtbm92ZWwtaW5mbyc7XG5cbmV4cG9ydCB7IElNZGNvbmZNZXRhIH1cbmltcG9ydCB7IExhenlDb29raWUsIExhenlDb29raWVKYXIgfSBmcm9tICdqc2RvbS1leHRyYSc7XG5cbmltcG9ydCBmcyA9IHJlcXVpcmUoJ2ZzLWV4dHJhJyk7XG5pbXBvcnQgeyB0cmltRmlsZW5hbWUgfSBmcm9tICdmcy1pY29udi91dGlsJztcbmltcG9ydCB7IGNybGYsIENSTEYsIFJfQ1JMRiB9IGZyb20gJ2NybGYtbm9ybWFsaXplJztcbmltcG9ydCBTdHJVdGlsID0gcmVxdWlyZSgnc3RyLXV0aWwnKTtcbmltcG9ydCB7IEVudW1Ob3ZlbFN0YXR1cyB9IGZyb20gJ25vZGUtbm92ZWwtaW5mby9saWIvY29uc3QnO1xuXG4vL2ltcG9ydCAqIGFzIG1vbWVudCBmcm9tICdtb21lbnQnO1xuaW1wb3J0IG1vbWVudCA9IHJlcXVpcmUoJ21vbWVudC10aW1lem9uZScpO1xuaW1wb3J0IHsgX2ZpeFZvbHVtZUNoYXB0ZXJOYW1lLCBpc1VuZGVmIH0gZnJvbSAnLi4vdXRpbCc7XG5cbmltcG9ydCBFdmVudEVtaXR0ZXIgPSByZXF1aXJlKCdldmVudHMnKTtcbmltcG9ydCB7IElEb3dubG9hZE9wdGlvbnMgfSBmcm9tICcuL2RlbW8vYmFzZSc7XG5cbm1vbWVudC5mbi50b0pTT04gPSBmdW5jdGlvbiAoKSB7IHJldHVybiB0aGlzLmZvcm1hdCgpOyB9O1xuXG5leHBvcnQgeyBtb21lbnQgfTtcblxuZXhwb3J0IHsgYmx1ZWJpcmREZWNvcmF0b3IsIFByb21pc2VCbHVlYmlyZCB9XG5cbmV4cG9ydCBjb25zdCBTWU1CT0xfQ0FDSEUgPSBTeW1ib2wuZm9yKCdjYWNoZScpO1xuXG5leHBvcnQgY2xhc3MgTm92ZWxTaXRlIGltcGxlbWVudHMgTm92ZWxTaXRlLklOb3ZlbFNpdGVcbntcblx0cHVibGljIHN0YXRpYyByZWFkb25seSBJREtFWTogc3RyaW5nID0gbnVsbDtcblxuXHRwdWJsaWMgUEFUSF9OT1ZFTF9NQUlOOiBzdHJpbmc7XG5cdHB1YmxpYyBvcHRpb25zSW5pdD86IE5vdmVsU2l0ZS5JT3B0aW9ucztcblxuXHRjb25zdHJ1Y3RvcihvcHRpb25zOiBOb3ZlbFNpdGUuSU9wdGlvbnMsIC4uLmFyZ3YpXG5cdHtcblx0XHRpZiAoIXRoaXMuSURLRVkpXG5cdFx0e1xuXHRcdFx0dGhyb3cgbmV3IFJlZmVyZW5jZUVycm9yKGBJREtFWSBpcyBudWxsYCk7XG5cdFx0fVxuXG5cdFx0dGhpcy5vcHRpb25zSW5pdCA9IG9wdGlvbnM7XG5cdFx0dGhpcy5vcHRpb25zSW5pdC5jd2QgPSB0aGlzLm9wdGlvbnNJbml0LmN3ZCB8fCBwcm9jZXNzLmN3ZCgpO1xuXG5cdFx0W3RoaXMuUEFUSF9OT1ZFTF9NQUlOLCB0aGlzLm9wdGlvbnNJbml0XSA9IHRoaXMuZ2V0T3V0cHV0RGlyKHRoaXMub3B0aW9uc0luaXQpO1xuXG5cdFx0aWYgKHRoaXMub3B0aW9uc0luaXQuZGVidWdMb2cpXG5cdFx0e1xuXHRcdFx0Y29uc29sZURlYnVnLmVuYWJsZWQgPSB0cnVlO1xuXHRcdH1cblx0fVxuXG5cdHN0YXRpYyBjcmVhdGUob3B0aW9uczogTm92ZWxTaXRlLklPcHRpb25zLCAuLi5hcmd2KVxuXHR7XG5cdFx0cmV0dXJuIG5ldyB0aGlzKG9wdGlvbnMsIC4uLmFyZ3YpO1xuXHR9XG5cblx0c3RhdGljIGNoZWNrKHVybDogc3RyaW5nIHwgVVJMIHwgTm92ZWxTaXRlLklQYXJzZVVybCwgb3B0aW9ucz8pOiBib29sZWFuXG5cdHtcblx0XHRyZXR1cm4gZmFsc2U7XG5cdH1cblxuXHRzZXNzaW9uPFQgPSBOb3ZlbFNpdGUuSU9wdGlvbnNSdW50aW1lPihvcHRpb25zUnVudGltZTogVCAmIE5vdmVsU2l0ZS5JT3B0aW9uc1J1bnRpbWUsIHVybD86IFVSTClcblx0e1xuXHRcdG9wdGlvbnNSdW50aW1lLm9wdGlvbnNKU0RPTSA9IGNyZWF0ZU9wdGlvbnNKU0RPTShvcHRpb25zUnVudGltZS5vcHRpb25zSlNET00pO1xuXG5cdFx0aWYgKHVybClcblx0XHR7XG5cdFx0XHRvcHRpb25zUnVudGltZVtTWU1CT0xfQ0FDSEVdLnVybCA9IHVybDtcblx0XHR9XG5cblx0XHRyZXR1cm4gdGhpcztcblx0fVxuXG5cdGRvd25sb2FkKHVybDogc3RyaW5nIHwgVVJMLCBvcHRpb25zPzogTm92ZWxTaXRlLklEb3dubG9hZE9wdGlvbnMpOiBQcm9taXNlQmx1ZWJpcmQ8Tm92ZWxTaXRlLklOb3ZlbD5cblx0e1xuXHRcdHRocm93IG5ldyBTeW50YXhFcnJvcihgRnVuY3Rpb24gbm90IGltcGxlbWVudGVkYCk7XG5cdH1cblxuXHRnZXRfdm9sdW1lX2xpc3Q8VCA9IE5vdmVsU2l0ZS5JT3B0aW9uc1J1bnRpbWU+KHVybDogc3RyaW5nIHwgVVJMLFxuXHRcdG9wdGlvbnNSdW50aW1lOiBQYXJ0aWFsPFQgJiBOb3ZlbFNpdGUuSURvd25sb2FkT3B0aW9ucz4gPSB7fSxcblx0KTogUHJvbWlzZTxOb3ZlbFNpdGUuSU5vdmVsPlxuXHR7XG5cdFx0dGhyb3cgbmV3IFN5bnRheEVycm9yKGBGdW5jdGlvbiBub3QgaW1wbGVtZW50ZWRgKTtcblx0fVxuXG5cdG1ha2VVcmw8VCBleHRlbmRzIE5vdmVsU2l0ZS5JT3B0aW9uc1J1bnRpbWU+KHVybG9iajogTm92ZWxTaXRlLklQYXJzZVVybCwgb3B0aW9ucz8sIG9wdGlvbnNSdW50aW1lPzogVCk6IFVSTFxuXHR7XG5cdFx0dGhyb3cgbmV3IFN5bnRheEVycm9yKGBGdW5jdGlvbiBub3QgaW1wbGVtZW50ZWRgKTtcblx0fVxuXG5cdHBhcnNlVXJsKHVybDogVVJMIHwgc3RyaW5nLCBvcHRpb25zPyk6IE5vdmVsU2l0ZS5JUGFyc2VVcmxcblx0e1xuXHRcdHRocm93IG5ldyBTeW50YXhFcnJvcihgRnVuY3Rpb24gbm90IGltcGxlbWVudGVkYCk7XG5cdH1cblxuXHRnZXRTdGF0aWM8VCA9IHR5cGVvZiBOb3ZlbFNpdGU+KCk6IFRcblx0e1xuXHRcdC8vIEB0cy1pZ25vcmVcblx0XHRyZXR1cm4gdGhpcy5fX3Byb3RvX18uY29uc3RydWN0b3I7XG5cdH1cblxuXHRnZXQgSURLRVkoKTogc3RyaW5nXG5cdHtcblx0XHRsZXQga2V5ID0gdGhpcy5nZXRTdGF0aWMoKS5JREtFWTtcblxuXHRcdGlmICh0eXBlb2Yga2V5ICE9ICdzdHJpbmcnIHx8ICFrZXkpXG5cdFx0e1xuXHRcdFx0dGhyb3cgbmV3IFN5bnRheEVycm9yKGBJREtFWSBub3QgaW1wbGVtZW50ZWRgKTtcblx0XHR9XG5cblx0XHRyZXR1cm4ga2V5O1xuXHR9XG5cblx0cHJvdGVjdGVkIF9wYXRoTm92ZWxJRDxOIGV4dGVuZHMgTm92ZWxTaXRlLklOb3ZlbCwgVCBleHRlbmRzIE5vdmVsU2l0ZS5JT3B0aW9uc1J1bnRpbWU+KG5vdmVsOiBOLCBvcHRpb25zUnVudGltZTogVClcblx0e1xuXHRcdHJldHVybiBub3ZlbC51cmxfZGF0YS5ub3ZlbF9pZDtcblx0fVxuXG5cdGdldFBhdGhOb3ZlbDxOIGV4dGVuZHMgTm92ZWxTaXRlLklOb3ZlbCwgVCBleHRlbmRzIE5vdmVsU2l0ZS5JT3B0aW9uc1J1bnRpbWU+KFBBVEhfTk9WRUxfTUFJTjogc3RyaW5nLFxuXHRcdG5vdmVsOiBOLFxuXHRcdG9wdGlvbnNSdW50aW1lOiBULFxuXHQpXG5cdHtcblx0XHRsZXQgbmFtZTogc3RyaW5nO1xuXG5cdFx0bGV0IG5vdmVsX2lkID0gdGhpcy5fcGF0aE5vdmVsSUQobm92ZWwsIG9wdGlvbnNSdW50aW1lKTtcblxuXHRcdGlmIChvcHRpb25zUnVudGltZS5wYXRoTm92ZWxTdHlsZSlcblx0XHR7XG5cdFx0XHRpZiAob3B0aW9uc1J1bnRpbWUucGF0aE5vdmVsU3R5bGUgPT0gTm92ZWxTaXRlLkVudW1QYXRoTm92ZWxTdHlsZS5OT1ZFTElEKVxuXHRcdFx0e1xuXHRcdFx0XHRuYW1lID0gbm92ZWxfaWQ7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0aWYgKG5hbWUgPT0gbnVsbClcblx0XHR7XG5cdFx0XHRuYW1lID0gYCR7dGhpcy50cmltRmlsZW5hbWVOb3ZlbChub3ZlbC5ub3ZlbF90aXRsZSl9Xygke25vdmVsX2lkfSlgXG5cdFx0fVxuXG5cdFx0cmV0dXJuIHBhdGguam9pbihQQVRIX05PVkVMX01BSU4sIG5hbWUpO1xuXHR9XG5cblx0LyoqXG5cdCAqIOWmguaenOW3sue2k+S4i+i8iemBjiDliYfoqablnJblvp4gUkVBRE1FLm1kIOWFp+iugOWPlue8uua8j+eahOS4i+i8ieioreWumlxuXHQgKlxuXHQgKiBAcHJpdmF0ZVxuXHQgKi9cblx0X2xvYWRFeGlzdHNDb25mPFQsIE4gZXh0ZW5kcyBOb3ZlbFNpdGUuSU5vdmVsPihpbnB1dFVybCwgb3B0aW9uc1J1bnRpbWU6IFQsIG5vdmVsOiBOLCBwYXRoX25vdmVsOiBzdHJpbmcpXG5cdHtcblx0XHRsZXQgZmlsZSA9IHBhdGgucmVzb2x2ZShwYXRoX25vdmVsLCAnUkVBRE1FLm1kJyk7XG5cblx0XHRpZiAoZnMucGF0aEV4aXN0c1N5bmMoZmlsZSkpXG5cdFx0e1xuXHRcdFx0bGV0IG1kID0gZnMucmVhZEZpbGVTeW5jKGZpbGUpLnRvU3RyaW5nKCk7XG5cblx0XHRcdGxldCBjb25mID0gbm92ZWxJbmZvLnBhcnNlKG1kLCB7XG5cdFx0XHRcdGxvd0NoZWNrTGV2ZWw6IHRydWUsXG5cdFx0XHRcdHRocm93OiBmYWxzZSxcblx0XHRcdH0pO1xuXG5cdFx0XHRjb25zb2xlRGVidWcuZGVidWcoJ+aqouafpSBSRUFETUUubWQg5piv5ZCm5a2Y5Zyo5LiL6LyJ6Kit5a6aJyk7XG5cblx0XHRcdGlmIChjb25mICYmIGNvbmYub3B0aW9ucylcblx0XHRcdHtcblx0XHRcdFx0aWYgKGNvbmYub3B0aW9ucy5kb3dubG9hZE9wdGlvbnMgfHwgY29uZi5vcHRpb25zLmRvd25sb2Fkb3B0aW9ucylcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGNvbnNvbGVEZWJ1Zy5kZWJ1Zygn6LyJ5YWl5Lim5LiU5ZCI5L215bey5a2Y5Zyo55qE6Kit5a6aJyk7XG5cblx0XHRcdFx0XHRPYmplY3QuZW50cmllcyhjb25mLm9wdGlvbnMuZG93bmxvYWRPcHRpb25zIHx8IGNvbmYub3B0aW9ucy5kb3dubG9hZG9wdGlvbnMpXG5cdFx0XHRcdFx0XHQuZm9yRWFjaChmdW5jdGlvbiAoW2ssIHZdKVxuXHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRpZiAob3B0aW9uc1J1bnRpbWVba10gPT0gbnVsbClcblx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdG9wdGlvbnNSdW50aW1lW2tdID0gdjtcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0fSlcblx0XHRcdFx0XHQ7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdH1cblxuXHRnZXRPdXRwdXREaXI8VD4ob3B0aW9ucz86IFQgJiBOb3ZlbFNpdGUuSU9wdGlvbnMsIG5vdmVsTmFtZT86IHN0cmluZyk6IFtzdHJpbmcsIFQgJiBOb3ZlbFNpdGUuSU9wdGlvbnNdXG5cdHtcblx0XHRvcHRpb25zID0gT2JqZWN0LmFzc2lnbih7fSwgdGhpcy5vcHRpb25zSW5pdCwgb3B0aW9ucyk7XG5cblx0XHRpZiAoIW9wdGlvbnMub3V0cHV0RGlyKVxuXHRcdHtcblx0XHRcdHRocm93IG5ldyBSZWZlcmVuY2VFcnJvcihgb3B0aW9uczogb3V0cHV0RGlyIGlzIG5vdCBzZXRgKTtcblx0XHR9XG5cblx0XHRsZXQgcCA9IHBhdGguam9pbihvcHRpb25zLm91dHB1dERpciwgb3B0aW9ucy5kaXNhYmxlT3V0cHV0RGlyUHJlZml4ID8gJycgOiB0aGlzLklES0VZKTtcblxuXHRcdGlmICghcGF0aC5pc0Fic29sdXRlKHApKVxuXHRcdHtcblx0XHRcdHAgPSBwYXRoLmpvaW4ob3B0aW9ucy5jd2QsIHApO1xuXHRcdH1cblxuXHRcdHJvb3RQYXRoLmRpc2FibGVQYXRocy5jb25jYXQoX19kaXJuYW1lKS5mb3JFYWNoKGZ1bmN0aW9uIChkaXIpXG5cdFx0e1xuXHRcdFx0aWYgKHAuaW5kZXhPZihfX2Rpcm5hbWUpID09IDApXG5cdFx0XHR7XG5cdFx0XHRcdHRocm93IG5ldyBSZWZlcmVuY2VFcnJvcihgcGF0aCBub3QgYWxsb3cgXCIke3B9XCJgKVxuXHRcdFx0fVxuXHRcdH0pO1xuXG5cdFx0aWYgKHR5cGVvZiBub3ZlbE5hbWUgPT0gJ3N0cmluZycgfHwgbm92ZWxOYW1lKVxuXHRcdHtcblx0XHRcdGlmICghbm92ZWxOYW1lKVxuXHRcdFx0e1xuXHRcdFx0XHR0aHJvdyBuZXcgUmVmZXJlbmNlRXJyb3IoKTtcblx0XHRcdH1cblxuXHRcdFx0cCA9IHBhdGguam9pbihwLCBub3ZlbE5hbWUpO1xuXHRcdH1cblxuXHRcdG9wdGlvbnMgPSB0aGlzLl9maXhPcHRpb25zUnVudGltZShvcHRpb25zKTtcblxuXHRcdHJldHVybiBbcCwgb3B0aW9uc107XG5cdH1cblxuXHRwcm90ZWN0ZWQgX2ZpeE9wdGlvbnNSdW50aW1lPFQgPSBOb3ZlbFNpdGUuSU9wdGlvbnNSdW50aW1lPihvcHRpb25zUnVudGltZTogVCAmIE5vdmVsU2l0ZS5JT3B0aW9uc1J1bnRpbWUpOiBUICYgTm92ZWxTaXRlLklPcHRpb25zUnVudGltZVxuXHR7XG5cdFx0b3B0aW9uc1J1bnRpbWVbU1lNQk9MX0NBQ0hFXSA9IChvcHRpb25zUnVudGltZVtTWU1CT0xfQ0FDSEVdIHx8IHt9KSBhcyB7XG5cdFx0XHR1cmw/OiBVUkwsXG5cdFx0XHRwYXRoX25vdmVsPzogc3RyaW5nLFxuXHRcdFx0bm92ZWw/OiBOb3ZlbFNpdGUuSU5vdmVsLFxuXHRcdH07XG5cblx0XHRvcHRpb25zUnVudGltZS5zdGFydEluZGV4ID0gb3B0aW9uc1J1bnRpbWUuc3RhcnRJbmRleCB8fCAwO1xuXG5cdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdG9wdGlvbnNSdW50aW1lLm9wdGlvbnNKU0RPTSA9IGNyZWF0ZU9wdGlvbnNKU0RPTShvcHRpb25zUnVudGltZS5vcHRpb25zSlNET00pO1xuXG5cblx0XHRpZiAob3B0aW9uc1J1bnRpbWUuZGVidWdMb2cgIT0gbnVsbClcblx0XHR7XG5cdFx0XHRvcHRpb25zUnVudGltZS5kZWJ1Z0xvZyA9ICEhb3B0aW9uc1J1bnRpbWUuZGVidWdMb2c7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIG9wdGlvbnNSdW50aW1lO1xuXHR9XG5cblx0dHJpbUZpbGVuYW1lQ2hhcHRlcihuYW1lKTogc3RyaW5nXG5cdHtcblx0XHRyZXR1cm4gdGhpcy50cmltRmlsZW5hbWUobmFtZSk7XG5cdH1cblxuXHR0cmltRmlsZW5hbWVWb2x1bWUobmFtZSk6IHN0cmluZ1xuXHR7XG5cdFx0cmV0dXJuIHRoaXMudHJpbUZpbGVuYW1lKG5hbWUpO1xuXHR9XG5cblx0dHJpbUZpbGVuYW1lTm92ZWwobmFtZSk6IHN0cmluZ1xuXHR7XG5cdFx0cmV0dXJuIHRoaXMudHJpbUZpbGVuYW1lKG5hbWUpO1xuXHR9XG5cblx0dHJpbUZpbGVuYW1lKG5hbWUpOiBzdHJpbmdcblx0e1xuXHRcdHJldHVybiB0cmltRmlsZW5hbWUoX2ZpeFZvbHVtZUNoYXB0ZXJOYW1lKG5hbWUpKTtcblx0fVxuXG5cdHRyaW1UYWcodGFnKTogc3RyaW5nXG5cdHtcblx0XHRyZXR1cm4gKHRhZyBhcyBzdHJpbmcpXG5cdFx0XHQucmVwbGFjZSgvW1xcW1xcXVxcL1xcXFxdL2csIChzKSA9PlxuXHRcdFx0e1xuXHRcdFx0XHRyZXR1cm4gU3RyVXRpbC50b0Z1bGxXaWR0aChzKVxuXHRcdFx0fSlcblx0XHRcdDtcblx0fVxuXG5cdHByb3RlY3RlZCBfZXhwb3J0RG93bmxvYWRPcHRpb25zPFQgPSBJT3B0aW9uc1J1bnRpbWU+KG9wdGlvbnNSdW50aW1lPzogVCAmIElPcHRpb25zUnVudGltZSk6IHVua25vd25cblx0e1xuXHRcdHJldHVybiB2b2lkICgwKTtcblx0fVxuXG5cdHByb3RlY3RlZCBfaGFuZGxlRGF0YUZvclN0cmluZ2lmeSguLi5hcmd2KTogSU1kY29uZk1ldGFcblx0e1xuXHRcdC8vIEB0cy1pZ25vcmVcblx0XHRsZXQgbWRjb25mOiBJTWRjb25mTWV0YSA9IF9oYW5kbGVEYXRhRm9yU3RyaW5naWZ5KC4uLmFyZ3YpO1xuXG5cdFx0aWYgKG1kY29uZi5ub3ZlbClcblx0XHR7XG5cdFx0XHRsZXQgYm9vbDogYm9vbGVhbjtcblxuXHRcdFx0aWYgKG1kY29uZi5ub3ZlbC50YWdzICYmIEFycmF5LmlzQXJyYXkobWRjb25mLm5vdmVsLnRhZ3MpKVxuXHRcdFx0e1xuXHRcdFx0XHRib29sID0gW1xuXHRcdFx0XHRcdCfmm7jnsY3ljJYnLFxuXHRcdFx0XHRcdCfkuabnsY3ljJYnLFxuXHRcdFx0XHRcdCfmlofluqvljJYnLFxuXHRcdFx0XHRcdCfmloflupPljJYnLFxuXHRcdFx0XHRdLnNvbWUodiA9PlxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0cmV0dXJuIG1kY29uZi5ub3ZlbC50YWdzLmluY2x1ZGVzKHYpXG5cdFx0XHRcdH0pO1xuXG5cdFx0XHRcdGlmIChib29sKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0bWRjb25mLm5vdmVsLm5vdmVsX3N0YXR1cyA9IChtZGNvbmYubm92ZWwubm92ZWxfc3RhdHVzIHwgMCkgfCBFbnVtTm92ZWxTdGF0dXMuUF9CT09LO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdGlmIChtZGNvbmYubm92ZWwuc3RhdHVzKVxuXHRcdFx0e1xuXHRcdFx0XHRib29sID0gW1xuXHRcdFx0XHRcdCflrozntZDmuIgnLFxuXHRcdFx0XHRcdCflrozntZAnLFxuXHRcdFx0XHRcdCflt7LlrozntZAnLFxuXHRcdFx0XHRcdCflt7LlrozmiJAnLFxuXHRcdFx0XHRcdCflroznu5PmuIgnLFxuXHRcdFx0XHRcdCflroznu5MnLFxuXHRcdFx0XHRcdCflt7Llroznu5MnLFxuXHRcdFx0XHRcdCflt7LlrozmiJAnLFxuXHRcdFx0XHRdLmluY2x1ZGVzKG1kY29uZi5ub3ZlbC5zdGF0dXMpO1xuXG5cdFx0XHRcdGlmIChib29sKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0bWRjb25mLm5vdmVsLm5vdmVsX3N0YXR1cyA9IChtZGNvbmYubm92ZWwubm92ZWxfc3RhdHVzIHwgMCkgfCBFbnVtTm92ZWxTdGF0dXMuQVVUSE9SX0RPTkU7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cblx0XHRyZXR1cm4gbWRjb25mO1xuXHR9XG5cblx0cHJvdGVjdGVkIF9zYXZlUmVhZG1lKG9wdGlvbnNSdW50aW1lPzogSU9wdGlvbnNSdW50aW1lLCBvcHRpb25zID0ge30sIC4uLm9wdHMpXG5cdHtcblx0XHRjb25zdCBzZWxmID0gdGhpcztcblxuXHRcdGlmIChpc1VuZGVmKG9wdGlvbnNSdW50aW1lKVxuXHRcdFx0fHwgaXNVbmRlZihvcHRpb25zUnVudGltZVtTWU1CT0xfQ0FDSEVdLCB7fSlcblxuXHRcdFx0fHwgaXNVbmRlZihvcHRpb25zUnVudGltZVtTWU1CT0xfQ0FDSEVdLm5vdmVsLCB7fSlcblx0XHRcdHx8IGlzVW5kZWYob3B0aW9uc1J1bnRpbWVbU1lNQk9MX0NBQ0hFXS5wYXRoX25vdmVsLCAnJylcblx0XHQpXG5cdFx0e1xuXHRcdFx0dGhyb3cgbmV3IFJlZmVyZW5jZUVycm9yKGBzYXZlUmVhZG1lYCk7XG5cdFx0fVxuXG5cdFx0Y29uc3Qgbm92ZWwgPSBvcHRpb25zUnVudGltZVtTWU1CT0xfQ0FDSEVdLm5vdmVsO1xuXHRcdGNvbnN0IHBhdGhfbm92ZWwgPSBvcHRpb25zUnVudGltZVtTWU1CT0xfQ0FDSEVdLnBhdGhfbm92ZWw7XG5cblx0XHRsZXQgbWRjb25maWcgPSB0aGlzLl9oYW5kbGVEYXRhRm9yU3RyaW5naWZ5KHtcblx0XHRcdG5vdmVsOiB7XG5cdFx0XHRcdGlsbHVzdDogJycsXG5cdFx0XHRcdHRpdGxlX3poMTogJycsXG5cdFx0XHRcdGlsbHVzdHM6IFtdLFxuXHRcdFx0XHRwdWJsaXNoZXJzOiBbXG5cdFx0XHRcdFx0c2VsZi5JREtFWSxcblx0XHRcdFx0XSxcblx0XHRcdFx0dGFnczogW1xuXHRcdFx0XHRcdHNlbGYuSURLRVksXG5cdFx0XHRcdF0sXG5cdFx0XHRcdHNlcmllczoge1xuXHRcdFx0XHRcdG5hbWU6IG5vdmVsLm5vdmVsX3Nlcmllc190aXRsZSB8fCBub3ZlbC5ub3ZlbF90aXRsZSB8fCAnJyxcblx0XHRcdFx0fSxcblx0XHRcdFx0bm92ZWxfc3RhdHVzOiAwLFxuXHRcdFx0fSxcblx0XHRcdG9wdGlvbnMsXG5cblx0XHRcdGxpbms6IG5vdmVsLmxpbmsgfHwgW10sXG5cdFx0fSwgbm92ZWwsIC4uLm9wdHMpO1xuXG5cdFx0bGV0IG1kID0gbm92ZWxJbmZvLnN0cmluZ2lmeShtZGNvbmZpZyk7XG5cblx0XHRsZXQgZmlsZSA9IHBhdGguam9pbihwYXRoX25vdmVsLCBgUkVBRE1FLm1kYCk7XG5cblx0XHRjb25zb2xlRGVidWcuaW5mbyhgW01FVEFdYCwgYHNhdmUgUkVBRE1FLm1kYCk7XG5cblx0XHRyZXR1cm4gZnMub3V0cHV0RmlsZShmaWxlLCBtZClcblx0XHRcdC50aGVuKGZ1bmN0aW9uICgpXG5cdFx0XHR7XG5cdFx0XHRcdHJldHVybiB7XG5cdFx0XHRcdFx0ZmlsZSxcblx0XHRcdFx0XHRtZCxcblx0XHRcdFx0fTtcblx0XHRcdH0pXG5cdFx0XHQ7XG5cdH1cblxuXHRjcmVhdGVNYWluVXJsPFQgPSBJT3B0aW9uc1J1bnRpbWU+KHVybDogc3RyaW5nIHwgVVJMLCBvcHRpb25zUnVudGltZT86IFQgJiBJT3B0aW9uc1J1bnRpbWUpOiBVUkxcblx0e1xuXHRcdGxldCBkYXRhID0gdGhpcy5wYXJzZVVybCh1cmwpO1xuXG5cdFx0aWYgKCFkYXRhIHx8ICFkYXRhLm5vdmVsX2lkKVxuXHRcdHtcblx0XHRcdC8vY29uc29sZS5sb2coZGF0YSk7XG5cblx0XHRcdHRocm93IG5ldyBSZWZlcmVuY2VFcnJvcihKU09OLnN0cmluZ2lmeShkYXRhKSk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHRoaXMubWFrZVVybChkYXRhLCB0cnVlLCBvcHRpb25zUnVudGltZSk7XG5cdH1cblxuXHRwcm90ZWN0ZWQgX2NyZWF0ZUNoYXB0ZXJVcmw8VCA9IElPcHRpb25zUnVudGltZT4oe1xuXHRcdG5vdmVsLFxuXHRcdHZvbHVtZSxcblx0XHRjaGFwdGVyLFxuXHR9OiB7XG5cdFx0bm92ZWw6IE5vdmVsU2l0ZS5JTm92ZWwsXG5cdFx0dm9sdW1lOiBOb3ZlbFNpdGUuSVZvbHVtZSxcblx0XHRjaGFwdGVyOiBOb3ZlbFNpdGUuSUNoYXB0ZXIsXG5cdH0sIG9wdGlvbnNSdW50aW1lPzogVCAmIElPcHRpb25zUnVudGltZSk6IFVSTFxuXHR7XG5cdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdHJldHVybiBuZXcgVVJMKGNoYXB0ZXIuY2hhcHRlcl91cmwpO1xuXHR9XG5cblx0cHJvdGVjdGVkIF9mZXRjaENoYXB0ZXI8VD4odXJsOiBVUkwsIG9wdGlvbnNSdW50aW1lOiBUICYgSU9wdGlvbnNSdW50aW1lKVxuXHR7XG5cdFx0dGhyb3cgbmV3IFN5bnRheEVycm9yKGBGdW5jdGlvbiBub3QgaW1wbGVtZW50ZWRgKTtcblx0fVxuXG5cdHByb3RlY3RlZCBfcGFyc2VDaGFwdGVyPFQ+KGRvbSwgb3B0aW9uc1J1bnRpbWU6IFQgJiBJT3B0aW9uc1J1bnRpbWUsIGNhY2hlOiB7XG5cdFx0ZmlsZTogc3RyaW5nLFxuXHRcdG5vdmVsOiBOb3ZlbFNpdGUuSU5vdmVsLFxuXHRcdHZvbHVtZTogTm92ZWxTaXRlLklWb2x1bWUsXG5cdFx0Y2hhcHRlcjogTm92ZWxTaXRlLklDaGFwdGVyLFxuXHR9KVxuXHR7XG5cdFx0dGhyb3cgbmV3IFN5bnRheEVycm9yKGBGdW5jdGlvbiBub3QgaW1wbGVtZW50ZWRgKTtcblx0fVxuXG5cdGdldEV4dHJhSW5mbzxULCBNIGV4dGVuZHMgUGFydGlhbDxJTm92ZWwgJiBJTWRjb25mTWV0YT4sIEMgZXh0ZW5kcyB1bmtub3duPih1cmxvYmo6IE5vdmVsU2l0ZS5JUGFyc2VVcmwsXG5cdFx0b3B0aW9uc1J1bnRpbWU6IFQgJiBJT3B0aW9uc1J1bnRpbWUsXG5cdFx0ZGF0YV9tZXRhPzogTSxcblx0XHRjYWNoZT86IEMsXG5cdCk6IFByb21pc2VCbHVlYmlyZDxNPlxuXHR7XG5cdFx0dGhyb3cgbmV3IFN5bnRheEVycm9yKGBGdW5jdGlvbiBub3QgaW1wbGVtZW50ZWRgKTtcblx0fVxuXG5cdHByb3RlY3RlZCBfY2hlY2tFeGlzdHMob3B0aW9uc1J1bnRpbWU6IElPcHRpb25zUnVudGltZSwgZmlsZTogc3RyaW5nKTogYm9vbGVhblxuXHR7XG5cdFx0aWYgKCFvcHRpb25zUnVudGltZS5kaXNhYmxlQ2hlY2tFeGlzdHMgJiYgZnMuZXhpc3RzU3luYyhmaWxlKSlcblx0XHR7XG5cdFx0XHRsZXQgdHh0ID0gZnMucmVhZEZpbGVTeW5jKGZpbGUpO1xuXG5cdFx0XHRpZiAodHh0LnRvU3RyaW5nKCkucmVwbGFjZSgvXlxccyt8XFxzKyQvZywgJycpKVxuXHRcdFx0e1xuXHRcdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHRyZXR1cm4gZmFsc2Vcblx0fVxuXG5cdHByb3RlY3RlZCBlbWl0KGV2ZW50OiBFdmVudEVtaXR0ZXIsIGV2ZW50TmFtZTogc3RyaW5nLCAuLi5hcmd2KVxuXHR7XG5cdFx0bGV0IGJvb2wgPSBldmVudC5lbWl0KGV2ZW50TmFtZSwgdGhpcywgLi4uYXJndik7XG5cdFx0cmV0dXJuIFtldmVudCwgYm9vbF07XG5cdH1cblxuXHRfc2F2ZUZpbGU8VCA9IE5vdmVsU2l0ZS5JT3B0aW9uc1J1bnRpbWU+KG9wdHM6IHtcblx0XHRmaWxlOiBzdHJpbmcsXG5cdFx0Y29udGV4dDogc3RyaW5nIHwgQnVmZmVyLFxuXHRcdG9wdGlvbnNSdW50aW1lOiBUICYgTm92ZWxTaXRlLklPcHRpb25zUnVudGltZSxcblx0fSlcblx0e1xuXHRcdHJldHVybiBQcm9taXNlQmx1ZWJpcmQucmVzb2x2ZSgpXG5cdFx0XHQuYmluZCh0aGlzKVxuXHRcdFx0LnRoZW4oKCkgPT4ge1xuXHRcdFx0XHRsZXQgeyBmaWxlLCBjb250ZXh0LCBvcHRpb25zUnVudGltZSB9ID0gb3B0cztcblxuXHRcdFx0XHRpZiAob3B0aW9uc1J1bnRpbWUubGluZUJyZWFrQ3JsZilcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGxldCB0eHQxID0gY29udGV4dC50b1N0cmluZygpO1xuXG5cdFx0XHRcdFx0aWYgKFJfQ1JMRi50ZXN0KHR4dDEpKVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdGxldCB0eHQyID0gY3JsZih0eHQxLCBDUkxGKTtcblxuXHRcdFx0XHRcdFx0aWYgKHR4dDEgIT09IHR4dDIpXG5cdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdGNvbnRleHQgPSB0eHQyO1xuXHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHR0eHQxID0gbnVsbDtcblx0XHRcdFx0XHRcdHR4dDIgPSBudWxsO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXG5cdFx0XHRcdHJldHVybiBmcy5vdXRwdXRGaWxlKGZpbGUsIGNvbnRleHQpXG5cdFx0XHRcdFx0LnRoZW4ociA9PiB7XG5cblx0XHRcdFx0XHRcdGlmIChvcHRpb25zUnVudGltZS5kZWJ1Z0xvZylcblx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0bGV0IGZpbGUyID0gcGF0aC5yZWxhdGl2ZShvcHRpb25zUnVudGltZS5vdXRwdXREaXIsIGZpbGUpO1xuXG5cdFx0XHRcdFx0XHRcdGNvbnNvbGVEZWJ1Zy5zdWNjZXNzKGBbU0FWRV1gLCBmaWxlMik7XG5cdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdHJldHVybiByO1xuXHRcdFx0XHRcdH0pXG5cdFx0XHR9KVxuXHRcdDtcblx0fVxuXG59XG5cbmV4cG9ydCBpbXBvcnQgSU9wdGlvbnNSdW50aW1lID0gTm92ZWxTaXRlLklPcHRpb25zUnVudGltZTtcbmV4cG9ydCBpbXBvcnQgSVZvbHVtZSA9IE5vdmVsU2l0ZS5JVm9sdW1lO1xuZXhwb3J0IGltcG9ydCBJQ2hhcHRlciA9IE5vdmVsU2l0ZS5JQ2hhcHRlcjtcbmV4cG9ydCBpbXBvcnQgRW51bVBhdGhOb3ZlbFN0eWxlID0gTm92ZWxTaXRlLkVudW1QYXRoTm92ZWxTdHlsZTtcbmltcG9ydCB7IElOb3ZlbCB9IGZyb20gJy4vc3lvc2V0dSc7XG5pbXBvcnQgeyBjb25zb2xlRGVidWcgfSBmcm9tICcuLi91dGlsL2xvZyc7XG5cbmV4cG9ydCBuYW1lc3BhY2UgTm92ZWxTaXRlXG57XG5cblx0ZXhwb3J0IHR5cGUgSUZpbGVQcmVmaXhNb2RlID0gMCB8IDEgfCAyIHwgMyB8IDQgfCA1O1xuXG5cdGV4cG9ydCB0eXBlIElPcHRpb25zUGx1cyA9IHtcblxuXHRcdGRpc2FibGVPdXRwdXREaXJQcmVmaXg/OiBib29sZWFuLFxuXG5cdFx0bm9EaXJQcmVmaXg/OiBib29sZWFuLFxuXHRcdG5vRGlyUGFkZW5kPzogYm9vbGVhbixcblxuXHRcdG5vRmlyZVByZWZpeD86IGJvb2xlYW4sXG5cdFx0bm9GaWxlUGFkZW5kPzogYm9vbGVhbixcblxuXHRcdHJldHJ5RGVsYXk/OiBudW1iZXIsXG5cdFx0c3RhcnRJbmRleD86IG51bWJlcixcblxuXHRcdGZpbGVQcmVmaXhNb2RlPzogbnVtYmVyIHwgSUZpbGVQcmVmaXhNb2RlLFxuXG5cdFx0YWxsb3dFbXB0eVZvbHVtZVRpdGxlPzogYm9vbGVhbixcblxuXHRcdGV2ZW50PzogRXZlbnRFbWl0dGVyLFxuXG5cdFx0LyoqXG5cdFx0ICog55So5L6G55m75YWl56uZ6bue55qEIGNvb2tpZXMgc2Vzc2lvblxuXHRcdCAqL1xuXHRcdHNlc3Npb25EYXRhPzoge1xuXHRcdFx0W2tleTogc3RyaW5nXTogYW55LFxuXHRcdH0sXG5cblx0XHQvKipcblx0XHQgKiDlj6rmipPlj5blsI/oqqrnmoQgTUVUQSDos4fmlplcblx0XHQgKi9cblx0XHRmZXRjaE1ldGFEYXRhT25seT86IGJvb2xlYW4sXG5cblx0XHRkZWJ1Z0xvZz86IGJvb2xlYW4sXG5cblx0XHRsaW5lQnJlYWtDcmxmPzogYm9vbGVhbixcblxuXHRcdC8qKlxuXHRcdCAqIOS/neeVmeazqOmfs+agvOW8j1xuXHRcdCAqL1xuXHRcdGtlZXBSdWJ5PzogYm9vbGVhbjtcblx0XHQvKipcblx0XHQgKiDkv53nlZnlhbbku5bmoLzlvI9cblx0XHQgKi9cblx0XHRrZWVwRm9ybWF0PzogYm9vbGVhbjtcblxuXHRcdC8qKlxuXHRcdCAqIOWcqOWFp+aWh+WOn+Wni+S9jee9ruS4iuS/neeVmeWclueJh1xuXHRcdCAqL1xuXHRcdGtlZXBJbWFnZT86IGJvb2xlYW47XG5cblx0fVxuXG5cdGV4cG9ydCB0eXBlIElPcHRpb25zID0ge1xuXG5cdFx0b3V0cHV0RGlyPzogc3RyaW5nLFxuXHRcdGN3ZD86IHN0cmluZyxcblxuXHR9ICYgSU9wdGlvbnNQbHVzO1xuXG5cdGV4cG9ydCBjb25zdCBlbnVtIEVudW1QYXRoTm92ZWxTdHlsZVxuXHR7XG5cdFx0REVGQVVMVCA9IDAsXG5cdFx0Tk9WRUxJRCA9IDEsXG5cdH1cblxuXHRleHBvcnQgdHlwZSBJRG93bmxvYWRPcHRpb25zID0ge1xuXG5cdFx0LyoqXG5cdFx0ICog5Y+q55Si55Sf55uu6YyE57WQ5qeLIOS4jeS4i+i8ieWFp+WuuVxuXHRcdCAqL1xuXHRcdGRpc2FibGVEb3dubG9hZD86IGJvb2xlYW4sXG5cdFx0ZGlzYWJsZUNoZWNrRXhpc3RzPzogYm9vbGVhbixcblxuXHRcdG9wdGlvbnNKU0RPTT86IElGcm9tVXJsT3B0aW9ucyAmIElPcHRpb25zSlNET00gJiB7XG5cdFx0XHRjb29raWVKYXI/OiBQYXJ0aWFsPExhenlDb29raWVKYXI+LFxuXHRcdH0sXG5cblx0XHQvKipcblx0XHQgKiDoqK3lrprlsI/oqqros4fmlpnlpL7mqKPlvI9cblx0XHQgKi9cblx0XHRwYXRoTm92ZWxTdHlsZT86IEVudW1QYXRoTm92ZWxTdHlsZSxcblxuXHR9ICYgSU9wdGlvbnNQbHVzO1xuXG5cdGV4cG9ydCB0eXBlIElPcHRpb25zUnVudGltZSA9IElPcHRpb25zICYgSURvd25sb2FkT3B0aW9ucyAmIElPcHRpb25zUGx1cztcblxuXHRleHBvcnQgaW50ZXJmYWNlIElQYXJzZVVybFxuXHR7XG5cdFx0dXJsPzogVVJMIHwgc3RyaW5nLFxuXG5cdFx0bm92ZWxfcGlkPyxcblx0XHRub3ZlbF9pZD8sXG5cdFx0Y2hhcHRlcl9pZD8sXG5cblx0XHRub3ZlbF9yMTg/LFxuXG5cdFx0W2tleTogc3RyaW5nXTogYW55LFxuXHR9XG5cblx0ZXhwb3J0IGludGVyZmFjZSBJQ2hhcHRlclxuXHR7XG5cdFx0Y2hhcHRlcl9pbmRleD86IG51bWJlciB8IHN0cmluZyxcblx0XHRjaGFwdGVyX3RpdGxlOiBzdHJpbmcsXG5cdFx0Y2hhcHRlcl9pZD9cblx0XHRjaGFwdGVyX3VybD9cblx0XHRjaGFwdGVyX3VybF9kYXRhP1xuXHRcdGNoYXB0ZXJfZGF0ZT86IG1vbWVudC5Nb21lbnQsXG5cblx0XHRpbWdzPzogc3RyaW5nW10sXG5cblx0XHRba2V5OiBzdHJpbmddOiBhbnksXG5cdH1cblxuXHRleHBvcnQgaW50ZXJmYWNlIElWb2x1bWVcblx0e1xuXHRcdHZvbHVtZV9pbmRleD9cblx0XHR2b2x1bWVfdGl0bGU6IHN0cmluZyxcblx0XHRjaGFwdGVyX2xpc3Q/OiBJQ2hhcHRlcltdLFxuXG5cdFx0W2tleTogc3RyaW5nXTogYW55LFxuXHR9XG5cblx0ZXhwb3J0IGludGVyZmFjZSBJTm92ZWxcblx0e1xuXHRcdHVybDogVVJMIHwgc3RyaW5nLFxuXHRcdHVybF9kYXRhOiBJUGFyc2VVcmwsXG5cblx0XHRub3ZlbF90aXRsZTogc3RyaW5nLFxuXHRcdG5vdmVsX2F1dGhvcj86IHN0cmluZyxcblxuXHRcdG5vdmVsX2Rlc2M/OiBzdHJpbmcsXG5cdFx0bm92ZWxfZGF0ZT86IG1vbWVudC5Nb21lbnQsXG5cdFx0bm92ZWxfcHVibGlzaGVyPzogc3RyaW5nLFxuXG5cdFx0bm92ZWxfc2VyaWVzX3RpdGxlPzogc3RyaW5nLFxuXG5cdFx0dm9sdW1lX2xpc3Q6IElWb2x1bWVbXSxcblxuXHRcdGNoZWNrZGF0ZT86IG1vbWVudC5Nb21lbnQsXG5cblx0XHRpbWdzPzogc3RyaW5nW10sXG5cblx0XHRba2V5OiBzdHJpbmddOiBhbnksXG5cdH1cblxuXHRleHBvcnQgaW50ZXJmYWNlIElOb3ZlbFNpdGVTdGF0aWM8VD4gZXh0ZW5kcyBUeXBlPFQgJiBOb3ZlbFNpdGUuSU5vdmVsU2l0ZT5cblx0e1xuXHRcdElES0VZOiBzdHJpbmcsXG5cdH1cblxuXHRleHBvcnQgaW50ZXJmYWNlIElOb3ZlbFNpdGVcblx0e1xuXHRcdGRvd25sb2FkKHVybDogc3RyaW5nIHwgVVJMLCBvcHRpb25zPzogSURvd25sb2FkT3B0aW9ucyk6IFByb21pc2VCbHVlYmlyZDxOb3ZlbFNpdGUuSU5vdmVsPjtcblxuXHRcdG1ha2VVcmwodXJsb2JqOiBOb3ZlbFNpdGUuSVBhcnNlVXJsLCBvcHRpb25zPyk6IFVSTDtcblxuXHRcdHBhcnNlVXJsKHVybDogVVJMIHwgc3RyaW5nKTogTm92ZWxTaXRlLklQYXJzZVVybDtcblx0fVxufVxuXG5leHBvcnQgaW50ZXJmYWNlIFR5cGU8VD5cbntcblx0bmV3KG9wdGlvbnM6IE5vdmVsU2l0ZS5JT3B0aW9ucywgLi4uYXJnczogYW55W10pOiBUO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc3RhdGljSW1wbGVtZW50czxUPigpXG57XG5cdHJldHVybiAoY29uc3RydWN0b3I6IFQpID0+IHt9XG59XG5cbmV4cG9ydCBkZWZhdWx0IE5vdmVsU2l0ZTtcbiJdfQ==