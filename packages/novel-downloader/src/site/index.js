"use strict";
/**
 * Created by user on 2018/2/10/010.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.staticImplements = exports.EnumPathNovelStyle = exports.NovelSite = exports.SYMBOL_CACHE = exports.PromiseBluebird = exports.bluebirdDecorator = exports.moment = exports.createOptionsJSDOM = exports.defaultJSDOMOptions = void 0;
const bluebird_1 = require("../decorator/bluebird");
exports.bluebirdDecorator = bluebird_1.default;
//import bluebirdDecorator from 'bluebird-decorator';
const PromiseBluebird = require("bluebird");
exports.PromiseBluebird = PromiseBluebird;
//import { URL } from 'jsdom-url';
const path = require("upath2");
const _root_1 = require("../../_root");
const jsdom_1 = require("../jsdom");
Object.defineProperty(exports, "defaultJSDOMOptions", { enumerable: true, get: function () { return jsdom_1.defaultJSDOMOptions; } });
Object.defineProperty(exports, "createOptionsJSDOM", { enumerable: true, get: function () { return jsdom_1.createOptionsJSDOM; } });
const node_novel_info_1 = require("node-novel-info");
const fs = require("fs-extra");
const util_1 = require("fs-iconv/util");
const crlf_normalize_1 = require("crlf-normalize");
const StrUtil = require("str-util");
const const_1 = require("node-novel-info/lib/const");
const log_1 = require("../util/log");
const url_1 = require("../util/url");
//import * as moment from 'moment';
const moment = require("moment-timezone");
exports.moment = moment;
const util_2 = require("../util");
moment.fn.toJSON = function () { return this.format(); };
exports.SYMBOL_CACHE = Symbol.for('cache');
let NovelSite = /** @class */ (() => {
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
            return url_1.default(chapter.chapter_url);
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
    NovelSite.IDKEY = null;
    return NovelSite;
})();
exports.NovelSite = NovelSite;
exports.EnumPathNovelStyle = NovelSite.EnumPathNovelStyle;
(function (NovelSite) {
    let EnumPathNovelStyle;
    (function (EnumPathNovelStyle) {
        EnumPathNovelStyle[EnumPathNovelStyle["DEFAULT"] = 0] = "DEFAULT";
        EnumPathNovelStyle[EnumPathNovelStyle["NOVELID"] = 1] = "NOVELID";
    })(EnumPathNovelStyle = NovelSite.EnumPathNovelStyle || (NovelSite.EnumPathNovelStyle = {}));
})(NovelSite = exports.NovelSite || (exports.NovelSite = {}));
exports.NovelSite = NovelSite;
function staticImplements() {
    return (constructor) => { };
}
exports.staticImplements = staticImplements;
exports.default = NovelSite;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7O0dBRUc7OztBQUVILG9EQUFzRDtBQXNDN0MsNEJBdENGLGtCQUFpQixDQXNDRTtBQXJDMUIscURBQXFEO0FBRXJELDRDQUE2QztBQW1DakIsMENBQWU7QUFsQzNDLGtDQUFrQztBQUNsQywrQkFBZ0M7QUFFaEMsdUNBQW1DO0FBR25DLG9DQUF1SDtBQUU5RyxvR0FGQSwyQkFBbUIsT0FFQTtBQUFrQyxtR0FGQSwwQkFBa0IsT0FFQTtBQUNoRixxREFBa0Y7QUFLbEYsK0JBQWdDO0FBQ2hDLHdDQUE2QztBQUM3QyxtREFBb0Q7QUFDcEQsb0NBQXFDO0FBQ3JDLHFEQUE0RDtBQUU1RCxxQ0FBMkM7QUFDM0MscUNBQW9DO0FBRXBDLG1DQUFtQztBQUNuQywwQ0FBMkM7QUFRbEMsd0JBQU07QUFQZixrQ0FBeUQ7QUFLekQsTUFBTSxDQUFDLEVBQUUsQ0FBQyxNQUFNLEdBQUcsY0FBYyxPQUFPLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQU01QyxRQUFBLFlBQVksR0FBRyxNQUFNLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0FBRWhEO0lBQUEsTUFBYSxTQUFTO1FBT3JCLFlBQVksT0FBMkIsRUFBRSxHQUFHLElBQUk7WUFFL0MsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQ2Y7Z0JBQ0MsTUFBTSxJQUFJLGNBQWMsQ0FBQyxlQUFlLENBQUMsQ0FBQzthQUMxQztZQUVELElBQUksQ0FBQyxXQUFXLEdBQUcsT0FBTyxDQUFDO1lBQzNCLElBQUksQ0FBQyxXQUFXLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsR0FBRyxJQUFJLE9BQU8sQ0FBQyxHQUFHLEVBQUUsQ0FBQztZQUU3RCxDQUFDLElBQUksQ0FBQyxlQUFlLEVBQUUsSUFBSSxDQUFDLFdBQVcsQ0FBQyxHQUFH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QkFBa0I7UUFFbkMsaUVBQVcsQ0FBQTtRQUNYLGlFQUFXLENBQUE7SUFDWixDQUFDLEVBSmlCLGtCQUFrQixHQUFsQiw0QkFBa0IsS0FBbEIsNEJBQWtCLFFBSW5DO0FBd0dGLENBQUMsRUEzS2dCLFNBQVMsR0FBVCxpQkFBUyxLQUFULGlCQUFTLFFBMkt6QjtBQWhxQlksOEJBQVM7QUF1cUJ0QixTQUFnQixnQkFBZ0I7SUFFL0IsT0FBTyxDQUFDLFdBQWMsRUFBRSxFQUFFLEdBQUUsQ0FBQyxDQUFBO0FBQzlCLENBQUM7QUFIRCw0Q0FHQztBQUVELGtCQUFlLFNBQVMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ3JlYXRlZCBieSB1c2VyIG9uIDIwMTgvMi8xMC8wMTAuXG4gKi9cblxuaW1wb3J0IGJsdWViaXJkRGVjb3JhdG9yIGZyb20gJy4uL2RlY29yYXRvci9ibHVlYmlyZCc7XG4vL2ltcG9ydCBibHVlYmlyZERlY29yYXRvciBmcm9tICdibHVlYmlyZC1kZWNvcmF0b3InO1xuXG5pbXBvcnQgUHJvbWlzZUJsdWViaXJkID0gcmVxdWlyZSgnYmx1ZWJpcmQnKTtcbi8vaW1wb3J0IHsgVVJMIH0gZnJvbSAnanNkb20tdXJsJztcbmltcG9ydCBwYXRoID0gcmVxdWlyZSgndXBhdGgyJyk7XG5cbmltcG9ydCByb290UGF0aCBmcm9tIFwiLi4vLi4vX3Jvb3RcIjtcbmltcG9ydCB7IHJldHJ5UmVxdWVzdCB9IGZyb20gJy4uL2ZldGNoJztcblxuaW1wb3J0IHsgZGVmYXVsdEpTRE9NT3B0aW9ucywgSUZyb21VcmxPcHRpb25zLCBJT3B0aW9uc0pTRE9NLCBjcmVhdGVPcHRpb25zSlNET00sIElOb3ZlbE9wdGlvbnNKU0RPTSB9IGZyb20gJy4uL2pzZG9tJztcblxuZXhwb3J0IHsgZGVmYXVsdEpTRE9NT3B0aW9ucywgSUZyb21VcmxPcHRpb25zLCBJT3B0aW9uc0pTRE9NLCBjcmVhdGVPcHRpb25zSlNET00gfVxuaW1wb3J0IG5vdmVsSW5mbywgeyBJTWRjb25mTWV0YSwgX2hhbmRsZURhdGFGb3JTdHJpbmdpZnkgfSBmcm9tICdub2RlLW5vdmVsLWluZm8nO1xuXG5leHBvcnQgeyBJTWRjb25mTWV0YSB9XG5pbXBvcnQgeyBMYXp5Q29va2llLCBMYXp5Q29va2llSmFyIH0gZnJvbSAnanNkb20tZXh0cmEnO1xuXG5pbXBvcnQgZnMgPSByZXF1aXJlKCdmcy1leHRyYScpO1xuaW1wb3J0IHsgdHJpbUZpbGVuYW1lIH0gZnJvbSAnZnMtaWNvbnYvdXRpbCc7XG5pbXBvcnQgeyBjcmxmLCBDUkxGLCBSX0NSTEYgfSBmcm9tICdjcmxmLW5vcm1hbGl6ZSc7XG5pbXBvcnQgU3RyVXRpbCA9IHJlcXVpcmUoJ3N0ci11dGlsJyk7XG5pbXBvcnQgeyBFbnVtTm92ZWxTdGF0dXMgfSBmcm9tICdub2RlLW5vdmVsLWluZm8vbGliL2NvbnN0JztcbmltcG9ydCB7IElOb3ZlbCB9IGZyb20gJy4vc3lvc2V0dSc7XG5pbXBvcnQgeyBjb25zb2xlRGVidWcgfSBmcm9tICcuLi91dGlsL2xvZyc7XG5pbXBvcnQgY3JlYXRlVVJMIGZyb20gJy4uL3V0aWwvdXJsJztcblxuLy9pbXBvcnQgKiBhcyBtb21lbnQgZnJvbSAnbW9tZW50JztcbmltcG9ydCBtb21lbnQgPSByZXF1aXJlKCdtb21lbnQtdGltZXpvbmUnKTtcbmltcG9ydCB7IF9maXhWb2x1bWVDaGFwdGVyTmFtZSwgaXNVbmRlZiB9IGZyb20gJy4uL3V0aWwnO1xuXG5pbXBvcnQgRXZlbnRFbWl0dGVyID0gcmVxdWlyZSgnZXZlbnRzJyk7XG5pbXBvcnQgeyBJRG93bmxvYWRPcHRpb25zIH0gZnJvbSAnLi9kZW1vL2Jhc2UnO1xuXG5tb21lbnQuZm4udG9KU09OID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gdGhpcy5mb3JtYXQoKTsgfTtcblxuZXhwb3J0IHsgbW9tZW50IH07XG5cbmV4cG9ydCB7IGJsdWViaXJkRGVjb3JhdG9yLCBQcm9taXNlQmx1ZWJpcmQgfVxuXG5leHBvcnQgY29uc3QgU1lNQk9MX0NBQ0hFID0gU3ltYm9sLmZvcignY2FjaGUnKTtcblxuZXhwb3J0IGNsYXNzIE5vdmVsU2l0ZSBpbXBsZW1lbnRzIE5vdmVsU2l0ZS5JTm92ZWxTaXRlXG57XG5cdHB1YmxpYyBzdGF0aWMgcmVhZG9ubHkgSURLRVk6IHN0cmluZyA9IG51bGw7XG5cblx0cHVibGljIFBBVEhfTk9WRUxfTUFJTjogc3RyaW5nO1xuXHRwdWJsaWMgb3B0aW9uc0luaXQ/OiBOb3ZlbFNpdGUuSU9wdGlvbnM7XG5cblx0Y29uc3RydWN0b3Iob3B0aW9uczogTm92ZWxTaXRlLklPcHRpb25zLCAuLi5hcmd2KVxuXHR7XG5cdFx0aWYgKCF0aGlzLklES0VZKVxuXHRcdHtcblx0XHRcdHRocm93IG5ldyBSZWZlcmVuY2VFcnJvcihgSURLRVkgaXMgbnVsbGApO1xuXHRcdH1cblxuXHRcdHRoaXMub3B0aW9uc0luaXQgPSBvcHRpb25zO1xuXHRcdHRoaXMub3B0aW9uc0luaXQuY3dkID0gdGhpcy5vcHRpb25zSW5pdC5jd2QgfHwgcHJvY2Vzcy5jd2QoKTtcblxuXHRcdFt0aGlzLlBBVEhfTk9WRUxfTUFJTiwgdGhpcy5vcHRpb25zSW5pdF0gPSB0aGlzLmdldE91dHB1dERpcih0aGlzLm9wdGlvbnNJbml0KTtcblxuXHRcdGlmICh0aGlzLm9wdGlvbnNJbml0LmRlYnVnTG9nKVxuXHRcdHtcblx0XHRcdGNvbnNvbGVEZWJ1Zy5lbmFibGVkID0gdHJ1ZTtcblx0XHR9XG5cblx0XHR0aGlzLl9jb25zdHJ1Y3RvcihvcHRpb25zLCAuLi5hcmd2KTtcblx0fVxuXG5cdF9jb25zdHJ1Y3RvcihvcHRpb25zOiBOb3ZlbFNpdGUuSU9wdGlvbnMsIC4uLmFyZ3YpXG5cdHtcblx0XHRjb25zb2xlRGVidWcuZGVidWcoJ3Jvb3QuX2NvbnN0cnVjdG9yJyk7XG5cdH1cblxuXHRzdGF0aWMgY3JlYXRlKG9wdGlvbnM6IE5vdmVsU2l0ZS5JT3B0aW9ucywgLi4uYXJndilcblx0e1xuXHRcdHJldHVybiBuZXcgdGhpcyhvcHRpb25zLCAuLi5hcmd2KTtcblx0fVxuXG5cdHN0YXRpYyBjaGVjayh1cmw6IHN0cmluZyB8IFVSTCB8IE5vdmVsU2l0ZS5JUGFyc2VVcmwsIG9wdGlvbnM/KTogYm9vbGVhblxuXHR7XG5cdFx0cmV0dXJuIGZhbHNlO1xuXHR9XG5cblx0c2Vzc2lvbjxUID0gTm92ZWxTaXRlLklPcHRpb25zUnVudGltZT4ob3B0aW9uc1J1bnRpbWU6IFQgJiBOb3ZlbFNpdGUuSU9wdGlvbnNSdW50aW1lLCB1cmw/OiBVUkwpXG5cdHtcblx0XHRvcHRpb25zUnVudGltZS5vcHRpb25zSlNET00gPSBjcmVhdGVPcHRpb25zSlNET00ob3B0aW9uc1J1bnRpbWUub3B0aW9uc0pTRE9NKTtcblxuXHRcdGlmICh1cmwpXG5cdFx0e1xuXHRcdFx0b3B0aW9uc1J1bnRpbWVbU1lNQk9MX0NBQ0hFXS51cmwgPSB1cmw7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblxuXHRkb3dubG9hZCh1cmw6IHN0cmluZyB8IFVSTCwgb3B0aW9ucz86IE5vdmVsU2l0ZS5JRG93bmxvYWRPcHRpb25zKTogUHJvbWlzZUJsdWViaXJkPE5vdmVsU2l0ZS5JTm92ZWw+XG5cdHtcblx0XHR0aHJvdyBuZXcgU3ludGF4RXJyb3IoYEZ1bmN0aW9uIG5vdCBpbXBsZW1lbnRlZGApO1xuXHR9XG5cblx0Z2V0X3ZvbHVtZV9saXN0PFQgPSBOb3ZlbFNpdGUuSU9wdGlvbnNSdW50aW1lPih1cmw6IHN0cmluZyB8IFVSTCxcblx0XHRvcHRpb25zUnVudGltZTogUGFydGlhbDxUICYgTm92ZWxTaXRlLklEb3dubG9hZE9wdGlvbnM+ID0ge30sXG5cdCk6IFByb21pc2U8Tm92ZWxTaXRlLklOb3ZlbD5cblx0e1xuXHRcdHRocm93IG5ldyBTeW50YXhFcnJvcihgRnVuY3Rpb24gbm90IGltcGxlbWVudGVkYCk7XG5cdH1cblxuXHRtYWtlVXJsPFQgZXh0ZW5kcyBOb3ZlbFNpdGUuSU9wdGlvbnNSdW50aW1lPih1cmxvYmo6IE5vdmVsU2l0ZS5JUGFyc2VVcmwsIG9wdGlvbnM/LCBvcHRpb25zUnVudGltZT86IFQpOiBVUkxcblx0e1xuXHRcdHRocm93IG5ldyBTeW50YXhFcnJvcihgRnVuY3Rpb24gbm90IGltcGxlbWVudGVkYCk7XG5cdH1cblxuXHRwYXJzZVVybCh1cmw6IFVSTCB8IHN0cmluZywgb3B0aW9ucz8pOiBOb3ZlbFNpdGUuSVBhcnNlVXJsXG5cdHtcblx0XHR0aHJvdyBuZXcgU3ludGF4RXJyb3IoYEZ1bmN0aW9uIG5vdCBpbXBsZW1lbnRlZGApO1xuXHR9XG5cblx0Z2V0U3RhdGljPFQgPSB0eXBlb2YgTm92ZWxTaXRlPigpOiBUXG5cdHtcblx0XHQvLyBAdHMtaWdub3JlXG5cdFx0cmV0dXJuIHRoaXMuX19wcm90b19fLmNvbnN0cnVjdG9yO1xuXHR9XG5cblx0Z2V0IElES0VZKCk6IHN0cmluZ1xuXHR7XG5cdFx0bGV0IGtleSA9IHRoaXMuZ2V0U3RhdGljKCkuSURLRVk7XG5cblx0XHRpZiAodHlwZW9mIGtleSAhPSAnc3RyaW5nJyB8fCAha2V5KVxuXHRcdHtcblx0XHRcdHRocm93IG5ldyBTeW50YXhFcnJvcihgSURLRVkgbm90IGltcGxlbWVudGVkYCk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIGtleTtcblx0fVxuXG5cdHByb3RlY3RlZCBfcGF0aE5vdmVsSUQ8TiBleHRlbmRzIE5vdmVsU2l0ZS5JTm92ZWwsIFQgZXh0ZW5kcyBOb3ZlbFNpdGUuSU9wdGlvbnNSdW50aW1lPihub3ZlbDogTiwgb3B0aW9uc1J1bnRpbWU6IFQpXG5cdHtcblx0XHRyZXR1cm4gbm92ZWwudXJsX2RhdGEubm92ZWxfaWQ7XG5cdH1cblxuXHRnZXRQYXRoTm92ZWw8TiBleHRlbmRzIE5vdmVsU2l0ZS5JTm92ZWwsIFQgZXh0ZW5kcyBOb3ZlbFNpdGUuSU9wdGlvbnNSdW50aW1lPihQQVRIX05PVkVMX01BSU46IHN0cmluZyxcblx0XHRub3ZlbDogTixcblx0XHRvcHRpb25zUnVudGltZTogVCxcblx0KVxuXHR7XG5cdFx0bGV0IG5hbWU6IHN0cmluZztcblxuXHRcdGxldCBub3ZlbF9pZCA9IHRoaXMuX3BhdGhOb3ZlbElEKG5vdmVsLCBvcHRpb25zUnVudGltZSk7XG5cblx0XHRpZiAob3B0aW9uc1J1bnRpbWUucGF0aE5vdmVsU3R5bGUpXG5cdFx0e1xuXHRcdFx0aWYgKG9wdGlvbnNSdW50aW1lLnBhdGhOb3ZlbFN0eWxlID09IE5vdmVsU2l0ZS5FbnVtUGF0aE5vdmVsU3R5bGUuTk9WRUxJRClcblx0XHRcdHtcblx0XHRcdFx0bmFtZSA9IG5vdmVsX2lkO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdGlmIChuYW1lID09IG51bGwpXG5cdFx0e1xuXHRcdFx0bmFtZSA9IGAke3RoaXMudHJpbUZpbGVuYW1lTm92ZWwobm92ZWwubm92ZWxfdGl0bGUpfV8oJHtub3ZlbF9pZH0pYFxuXHRcdH1cblxuXHRcdHJldHVybiBwYXRoLmpvaW4oUEFUSF9OT1ZFTF9NQUlOLCBuYW1lKTtcblx0fVxuXG5cdC8qKlxuXHQgKiDlpoLmnpzlt7LntpPkuIvovInpgY4g5YmH6Kmm5ZyW5b6eIFJFQURNRS5tZCDlhaforoDlj5bnvLrmvI/nmoTkuIvovInoqK3lrppcblx0ICpcblx0ICogQHByaXZhdGVcblx0ICovXG5cdF9sb2FkRXhpc3RzQ29uZjxULCBOIGV4dGVuZHMgTm92ZWxTaXRlLklOb3ZlbD4oaW5wdXRVcmwsIG9wdGlvbnNSdW50aW1lOiBULCBub3ZlbDogTiwgcGF0aF9ub3ZlbDogc3RyaW5nKVxuXHR7XG5cdFx0bGV0IGZpbGUgPSBwYXRoLnJlc29sdmUocGF0aF9ub3ZlbCwgJ1JFQURNRS5tZCcpO1xuXG5cdFx0aWYgKGZzLnBhdGhFeGlzdHNTeW5jKGZpbGUpKVxuXHRcdHtcblx0XHRcdGxldCBtZCA9IGZzLnJlYWRGaWxlU3luYyhmaWxlKS50b1N0cmluZygpO1xuXG5cdFx0XHRsZXQgY29uZiA9IG5vdmVsSW5mby5wYXJzZShtZCwge1xuXHRcdFx0XHRsb3dDaGVja0xldmVsOiB0cnVlLFxuXHRcdFx0XHR0aHJvdzogZmFsc2UsXG5cdFx0XHR9KTtcblxuXHRcdFx0Y29uc29sZURlYnVnLmRlYnVnKCfmqqLmn6UgUkVBRE1FLm1kIOaYr+WQpuWtmOWcqOS4i+i8ieioreWumicpO1xuXG5cdFx0XHRpZiAoY29uZiAmJiBjb25mLm9wdGlvbnMpXG5cdFx0XHR7XG5cdFx0XHRcdGlmIChjb25mLm9wdGlvbnMuZG93bmxvYWRPcHRpb25zIHx8IGNvbmYub3B0aW9ucy5kb3dubG9hZG9wdGlvbnMpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRjb25zb2xlRGVidWcuZGVidWcoJ+i8ieWFpeS4puS4lOWQiOS9teW3suWtmOWcqOeahOioreWumicpO1xuXG5cdFx0XHRcdFx0T2JqZWN0LmVudHJpZXMoY29uZi5vcHRpb25zLmRvd25sb2FkT3B0aW9ucyB8fCBjb25mLm9wdGlvbnMuZG93bmxvYWRvcHRpb25zKVxuXHRcdFx0XHRcdFx0LmZvckVhY2goZnVuY3Rpb24gKFtrLCB2XSlcblx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0aWYgKG9wdGlvbnNSdW50aW1lW2tdID09IG51bGwpXG5cdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHRvcHRpb25zUnVudGltZVtrXSA9IHY7XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdH0pXG5cdFx0XHRcdFx0O1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0Z2V0T3V0cHV0RGlyPFQ+KG9wdGlvbnM/OiBUICYgTm92ZWxTaXRlLklPcHRpb25zLCBub3ZlbE5hbWU/OiBzdHJpbmcpOiBbc3RyaW5nLCBUICYgTm92ZWxTaXRlLklPcHRpb25zXVxuXHR7XG5cdFx0b3B0aW9ucyA9IE9iamVjdC5hc3NpZ24oe30sIHRoaXMub3B0aW9uc0luaXQsIG9wdGlvbnMpO1xuXG5cdFx0aWYgKCFvcHRpb25zLm91dHB1dERpcilcblx0XHR7XG5cdFx0XHR0aHJvdyBuZXcgUmVmZXJlbmNlRXJyb3IoYG9wdGlvbnM6IG91dHB1dERpciBpcyBub3Qgc2V0YCk7XG5cdFx0fVxuXG5cdFx0bGV0IHAgPSBwYXRoLmpvaW4ob3B0aW9ucy5vdXRwdXREaXIsIG9wdGlvbnMuZGlzYWJsZU91dHB1dERpclByZWZpeCA/ICcnIDogdGhpcy5JREtFWSk7XG5cblx0XHRpZiAoIXBhdGguaXNBYnNvbHV0ZShwKSlcblx0XHR7XG5cdFx0XHRwID0gcGF0aC5qb2luKG9wdGlvbnMuY3dkLCBwKTtcblx0XHR9XG5cblx0XHRyb290UGF0aC5kaXNhYmxlUGF0aHMuY29uY2F0KF9fZGlybmFtZSkuZm9yRWFjaChmdW5jdGlvbiAoZGlyKVxuXHRcdHtcblx0XHRcdGlmIChwLmluZGV4T2YoX19kaXJuYW1lKSA9PSAwKVxuXHRcdFx0e1xuXHRcdFx0XHR0aHJvdyBuZXcgUmVmZXJlbmNlRXJyb3IoYHBhdGggbm90IGFsbG93IFwiJHtwfVwiYClcblx0XHRcdH1cblx0XHR9KTtcblxuXHRcdGlmICh0eXBlb2Ygbm92ZWxOYW1lID09ICdzdHJpbmcnIHx8IG5vdmVsTmFtZSlcblx0XHR7XG5cdFx0XHRpZiAoIW5vdmVsTmFtZSlcblx0XHRcdHtcblx0XHRcdFx0dGhyb3cgbmV3IFJlZmVyZW5jZUVycm9yKCk7XG5cdFx0XHR9XG5cblx0XHRcdHAgPSBwYXRoLmpvaW4ocCwgbm92ZWxOYW1lKTtcblx0XHR9XG5cblx0XHRvcHRpb25zID0gdGhpcy5fZml4T3B0aW9uc1J1bnRpbWUob3B0aW9ucyk7XG5cblx0XHRyZXR1cm4gW3AsIG9wdGlvbnNdO1xuXHR9XG5cblx0cHJvdGVjdGVkIF9maXhPcHRpb25zUnVudGltZTxUID0gTm92ZWxTaXRlLklPcHRpb25zUnVudGltZT4ob3B0aW9uc1J1bnRpbWU6IFQgJiBOb3ZlbFNpdGUuSU9wdGlvbnNSdW50aW1lKTogVCAmIE5vdmVsU2l0ZS5JT3B0aW9uc1J1bnRpbWVcblx0e1xuXHRcdG9wdGlvbnNSdW50aW1lW1NZTUJPTF9DQUNIRV0gPSAob3B0aW9uc1J1bnRpbWVbU1lNQk9MX0NBQ0hFXSB8fCB7fSkgYXMge1xuXHRcdFx0dXJsPzogVVJMLFxuXHRcdFx0cGF0aF9ub3ZlbD86IHN0cmluZyxcblx0XHRcdG5vdmVsPzogTm92ZWxTaXRlLklOb3ZlbCxcblx0XHR9O1xuXG5cdFx0b3B0aW9uc1J1bnRpbWUuc3RhcnRJbmRleCA9IG9wdGlvbnNSdW50aW1lLnN0YXJ0SW5kZXggfHwgMDtcblxuXHRcdC8vIEB0cy1pZ25vcmVcblx0XHRvcHRpb25zUnVudGltZS5vcHRpb25zSlNET00gPSBjcmVhdGVPcHRpb25zSlNET00ob3B0aW9uc1J1bnRpbWUub3B0aW9uc0pTRE9NKTtcblxuXG5cdFx0aWYgKG9wdGlvbnNSdW50aW1lLmRlYnVnTG9nICE9IG51bGwpXG5cdFx0e1xuXHRcdFx0b3B0aW9uc1J1bnRpbWUuZGVidWdMb2cgPSAhIW9wdGlvbnNSdW50aW1lLmRlYnVnTG9nO1xuXHRcdH1cblxuXHRcdGlmIChvcHRpb25zUnVudGltZS5rZWVwSW1hZ2UgPT0gbnVsbClcblx0XHR7XG5cdFx0XHRvcHRpb25zUnVudGltZS5rZWVwSW1hZ2UgPSB0cnVlO1xuXHRcdH1cblxuXHRcdGlmIChvcHRpb25zUnVudGltZS5rZWVwUnVieSA9PSBudWxsKVxuXHRcdHtcblx0XHRcdG9wdGlvbnNSdW50aW1lLmtlZXBSdWJ5ID0gdHJ1ZTtcblx0XHR9XG5cblx0XHRyZXR1cm4gb3B0aW9uc1J1bnRpbWU7XG5cdH1cblxuXHR0cmltRmlsZW5hbWVDaGFwdGVyKG5hbWUpOiBzdHJpbmdcblx0e1xuXHRcdHJldHVybiB0aGlzLnRyaW1GaWxlbmFtZShuYW1lKTtcblx0fVxuXG5cdHRyaW1GaWxlbmFtZVZvbHVtZShuYW1lKTogc3RyaW5nXG5cdHtcblx0XHRyZXR1cm4gdGhpcy50cmltRmlsZW5hbWUobmFtZSk7XG5cdH1cblxuXHR0cmltRmlsZW5hbWVOb3ZlbChuYW1lKTogc3RyaW5nXG5cdHtcblx0XHRyZXR1cm4gdGhpcy50cmltRmlsZW5hbWUobmFtZSk7XG5cdH1cblxuXHR0cmltRmlsZW5hbWUobmFtZSk6IHN0cmluZ1xuXHR7XG5cdFx0cmV0dXJuIHRyaW1GaWxlbmFtZShfZml4Vm9sdW1lQ2hhcHRlck5hbWUobmFtZSkpO1xuXHR9XG5cblx0dHJpbVRhZyh0YWcpOiBzdHJpbmdcblx0e1xuXHRcdHJldHVybiAodGFnIGFzIHN0cmluZylcblx0XHRcdC5yZXBsYWNlKC9bXFxbXFxdXFwvXFxcXF0vZywgKHMpID0+XG5cdFx0XHR7XG5cdFx0XHRcdHJldHVybiBTdHJVdGlsLnRvRnVsbFdpZHRoKHMpXG5cdFx0XHR9KVxuXHRcdFx0O1xuXHR9XG5cblx0cHJvdGVjdGVkIF9leHBvcnREb3dubG9hZE9wdGlvbnM8VCA9IElPcHRpb25zUnVudGltZT4ob3B0aW9uc1J1bnRpbWU/OiBUICYgSU9wdGlvbnNSdW50aW1lKTogdW5rbm93blxuXHR7XG5cdFx0cmV0dXJuIHZvaWQgKDApO1xuXHR9XG5cblx0cHJvdGVjdGVkIF9oYW5kbGVEYXRhRm9yU3RyaW5naWZ5KC4uLmFyZ3YpOiBJTWRjb25mTWV0YVxuXHR7XG5cdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdGxldCBtZGNvbmY6IElNZGNvbmZNZXRhID0gX2hhbmRsZURhdGFGb3JTdHJpbmdpZnkoLi4uYXJndik7XG5cblx0XHRpZiAobWRjb25mLm5vdmVsKVxuXHRcdHtcblx0XHRcdGxldCBib29sOiBib29sZWFuO1xuXG5cdFx0XHRpZiAobWRjb25mLm5vdmVsLnRhZ3MgJiYgQXJyYXkuaXNBcnJheShtZGNvbmYubm92ZWwudGFncykpXG5cdFx0XHR7XG5cdFx0XHRcdGJvb2wgPSBbXG5cdFx0XHRcdFx0J+abuOexjeWMlicsXG5cdFx0XHRcdFx0J+S5puexjeWMlicsXG5cdFx0XHRcdFx0J+aWh+W6q+WMlicsXG5cdFx0XHRcdFx0J+aWh+W6k+WMlicsXG5cdFx0XHRcdF0uc29tZSh2ID0+XG5cdFx0XHRcdHtcblx0XHRcdFx0XHRyZXR1cm4gbWRjb25mLm5vdmVsLnRhZ3MuaW5jbHVkZXModilcblx0XHRcdFx0fSk7XG5cblx0XHRcdFx0aWYgKGJvb2wpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRtZGNvbmYubm92ZWwubm92ZWxfc3RhdHVzID0gKG1kY29uZi5ub3ZlbC5ub3ZlbF9zdGF0dXMgfCAwKSB8IEVudW1Ob3ZlbFN0YXR1cy5QX0JPT0s7XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0aWYgKG1kY29uZi5ub3ZlbC5zdGF0dXMpXG5cdFx0XHR7XG5cdFx0XHRcdGJvb2wgPSBbXG5cdFx0XHRcdFx0J+WujOe1kOa4iCcsXG5cdFx0XHRcdFx0J+WujOe1kCcsXG5cdFx0XHRcdFx0J+W3suWujOe1kCcsXG5cdFx0XHRcdFx0J+W3suWujOaIkCcsXG5cdFx0XHRcdFx0J+WujOe7k+a4iCcsXG5cdFx0XHRcdFx0J+WujOe7kycsXG5cdFx0XHRcdFx0J+W3suWujOe7kycsXG5cdFx0XHRcdFx0J+W3suWujOaIkCcsXG5cdFx0XHRcdF0uaW5jbHVkZXMobWRjb25mLm5vdmVsLnN0YXR1cyk7XG5cblx0XHRcdFx0aWYgKGJvb2wpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRtZGNvbmYubm92ZWwubm92ZWxfc3RhdHVzID0gKG1kY29uZi5ub3ZlbC5ub3ZlbF9zdGF0dXMgfCAwKSB8IEVudW1Ob3ZlbFN0YXR1cy5BVVRIT1JfRE9ORTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHJldHVybiBtZGNvbmY7XG5cdH1cblxuXHRwcm90ZWN0ZWQgX3NhdmVSZWFkbWUob3B0aW9uc1J1bnRpbWU/OiBJT3B0aW9uc1J1bnRpbWUsIG9wdGlvbnMgPSB7fSwgLi4ub3B0cylcblx0e1xuXHRcdGNvbnN0IHNlbGYgPSB0aGlzO1xuXG5cdFx0aWYgKGlzVW5kZWYob3B0aW9uc1J1bnRpbWUpXG5cdFx0XHR8fCBpc1VuZGVmKG9wdGlvbnNSdW50aW1lW1NZTUJPTF9DQUNIRV0sIHt9KVxuXG5cdFx0XHR8fCBpc1VuZGVmKG9wdGlvbnNSdW50aW1lW1NZTUJPTF9DQUNIRV0ubm92ZWwsIHt9KVxuXHRcdFx0fHwgaXNVbmRlZihvcHRpb25zUnVudGltZVtTWU1CT0xfQ0FDSEVdLnBhdGhfbm92ZWwsICcnKVxuXHRcdClcblx0XHR7XG5cdFx0XHR0aHJvdyBuZXcgUmVmZXJlbmNlRXJyb3IoYHNhdmVSZWFkbWVgKTtcblx0XHR9XG5cblx0XHRjb25zdCBub3ZlbCA9IG9wdGlvbnNSdW50aW1lW1NZTUJPTF9DQUNIRV0ubm92ZWw7XG5cdFx0Y29uc3QgcGF0aF9ub3ZlbCA9IG9wdGlvbnNSdW50aW1lW1NZTUJPTF9DQUNIRV0ucGF0aF9ub3ZlbDtcblxuXHRcdGxldCBtZGNvbmZpZyA9IHRoaXMuX2hhbmRsZURhdGFGb3JTdHJpbmdpZnkoe1xuXHRcdFx0bm92ZWw6IHtcblx0XHRcdFx0aWxsdXN0OiAnJyxcblx0XHRcdFx0dGl0bGVfemgxOiAnJyxcblx0XHRcdFx0aWxsdXN0czogW10sXG5cdFx0XHRcdHB1Ymxpc2hlcnM6IFtcblx0XHRcdFx0XHRzZWxmLklES0VZLFxuXHRcdFx0XHRdLFxuXHRcdFx0XHR0YWdzOiBbXG5cdFx0XHRcdFx0c2VsZi5JREtFWSxcblx0XHRcdFx0XSxcblx0XHRcdFx0c2VyaWVzOiB7XG5cdFx0XHRcdFx0bmFtZTogbm92ZWwubm92ZWxfc2VyaWVzX3RpdGxlIHx8IG5vdmVsLm5vdmVsX3RpdGxlIHx8ICcnLFxuXHRcdFx0XHR9LFxuXHRcdFx0XHRub3ZlbF9zdGF0dXM6IDAsXG5cdFx0XHR9LFxuXHRcdFx0b3B0aW9ucyxcblxuXHRcdFx0bGluazogbm92ZWwubGluayB8fCBbXSxcblx0XHR9LCBub3ZlbCwgLi4ub3B0cyk7XG5cblx0XHRsZXQgbWQgPSBub3ZlbEluZm8uc3RyaW5naWZ5KG1kY29uZmlnKTtcblxuXHRcdGxldCBmaWxlID0gcGF0aC5qb2luKHBhdGhfbm92ZWwsIGBSRUFETUUubWRgKTtcblxuXHRcdGNvbnNvbGVEZWJ1Zy5pbmZvKGBbTUVUQV1gLCBgc2F2ZSBSRUFETUUubWRgKTtcblxuXHRcdHJldHVybiBmcy5vdXRwdXRGaWxlKGZpbGUsIG1kKVxuXHRcdFx0LnRoZW4oZnVuY3Rpb24gKClcblx0XHRcdHtcblx0XHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0XHRmaWxlLFxuXHRcdFx0XHRcdG1kLFxuXHRcdFx0XHR9O1xuXHRcdFx0fSlcblx0XHRcdDtcblx0fVxuXG5cdGNyZWF0ZU1haW5Vcmw8VCA9IElPcHRpb25zUnVudGltZT4odXJsOiBzdHJpbmcgfCBVUkwsIG9wdGlvbnNSdW50aW1lPzogVCAmIElPcHRpb25zUnVudGltZSk6IFVSTFxuXHR7XG5cdFx0bGV0IGRhdGEgPSB0aGlzLnBhcnNlVXJsKHVybCk7XG5cblx0XHRpZiAoIWRhdGEgfHwgIWRhdGEubm92ZWxfaWQpXG5cdFx0e1xuXHRcdFx0Ly9jb25zb2xlLmxvZyhkYXRhKTtcblxuXHRcdFx0dGhyb3cgbmV3IFJlZmVyZW5jZUVycm9yKEpTT04uc3RyaW5naWZ5KGRhdGEpKTtcblx0XHR9XG5cblx0XHRyZXR1cm4gdGhpcy5tYWtlVXJsKGRhdGEsIHRydWUsIG9wdGlvbnNSdW50aW1lKTtcblx0fVxuXG5cdHByb3RlY3RlZCBfY3JlYXRlQ2hhcHRlclVybDxUID0gSU9wdGlvbnNSdW50aW1lPih7XG5cdFx0bm92ZWwsXG5cdFx0dm9sdW1lLFxuXHRcdGNoYXB0ZXIsXG5cdH06IHtcblx0XHRub3ZlbDogTm92ZWxTaXRlLklOb3ZlbCxcblx0XHR2b2x1bWU6IE5vdmVsU2l0ZS5JVm9sdW1lLFxuXHRcdGNoYXB0ZXI6IE5vdmVsU2l0ZS5JQ2hhcHRlcixcblx0fSwgb3B0aW9uc1J1bnRpbWU/OiBUICYgSU9wdGlvbnNSdW50aW1lKVxuXHR7XG5cdFx0cmV0dXJuIGNyZWF0ZVVSTChjaGFwdGVyLmNoYXB0ZXJfdXJsKTtcblx0fVxuXG5cdHByb3RlY3RlZCBfZmV0Y2hDaGFwdGVyPFQ+KHVybDogVVJMLCBvcHRpb25zUnVudGltZTogVCAmIElPcHRpb25zUnVudGltZSwgX2NhY2hlXzoge1xuXHRcdG5vdmVsOiBJTm92ZWwsXG5cdH0pXG5cdHtcblx0XHR0aHJvdyBuZXcgU3ludGF4RXJyb3IoYEZ1bmN0aW9uIG5vdCBpbXBsZW1lbnRlZGApO1xuXHR9XG5cblx0cHJvdGVjdGVkIF9wYXJzZUNoYXB0ZXI8VD4oZG9tLCBvcHRpb25zUnVudGltZTogVCAmIElPcHRpb25zUnVudGltZSwgY2FjaGU6IHtcblx0XHRmaWxlOiBzdHJpbmcsXG5cdFx0bm92ZWw6IE5vdmVsU2l0ZS5JTm92ZWwsXG5cdFx0dm9sdW1lOiBOb3ZlbFNpdGUuSVZvbHVtZSxcblx0XHRjaGFwdGVyOiBOb3ZlbFNpdGUuSUNoYXB0ZXIsXG5cdH0pXG5cdHtcblx0XHR0aHJvdyBuZXcgU3ludGF4RXJyb3IoYEZ1bmN0aW9uIG5vdCBpbXBsZW1lbnRlZGApO1xuXHR9XG5cblx0Z2V0RXh0cmFJbmZvPFQsIE0gZXh0ZW5kcyBQYXJ0aWFsPElOb3ZlbCAmIElNZGNvbmZNZXRhPiwgQyBleHRlbmRzIHVua25vd24+KHVybG9iajogTm92ZWxTaXRlLklQYXJzZVVybCxcblx0XHRvcHRpb25zUnVudGltZTogVCAmIElPcHRpb25zUnVudGltZSxcblx0XHRkYXRhX21ldGE/OiBNLFxuXHRcdGNhY2hlPzogQyxcblx0KTogUHJvbWlzZUJsdWViaXJkPE0+XG5cdHtcblx0XHR0aHJvdyBuZXcgU3ludGF4RXJyb3IoYEZ1bmN0aW9uIG5vdCBpbXBsZW1lbnRlZGApO1xuXHR9XG5cblx0cHJvdGVjdGVkIF9jaGVja0V4aXN0cyhvcHRpb25zUnVudGltZTogSU9wdGlvbnNSdW50aW1lLCBmaWxlOiBzdHJpbmcpOiBib29sZWFuXG5cdHtcblx0XHRpZiAoIW9wdGlvbnNSdW50aW1lLmRpc2FibGVDaGVja0V4aXN0cyAmJiBmcy5leGlzdHNTeW5jKGZpbGUpKVxuXHRcdHtcblx0XHRcdGxldCB0eHQgPSBmcy5yZWFkRmlsZVN5bmMoZmlsZSk7XG5cblx0XHRcdGlmICh0eHQudG9TdHJpbmcoKS5yZXBsYWNlKC9eXFxzK3xcXHMrJC9nLCAnJykpXG5cdFx0XHR7XG5cdFx0XHRcdHJldHVybiB0cnVlO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHJldHVybiBmYWxzZVxuXHR9XG5cblx0cHJvdGVjdGVkIGVtaXQoZXZlbnQ6IEV2ZW50RW1pdHRlciwgZXZlbnROYW1lOiBzdHJpbmcsIC4uLmFyZ3YpXG5cdHtcblx0XHRsZXQgYm9vbCA9IGV2ZW50LmVtaXQoZXZlbnROYW1lLCB0aGlzLCAuLi5hcmd2KTtcblx0XHRyZXR1cm4gW2V2ZW50LCBib29sXTtcblx0fVxuXG5cdF9zYXZlRmlsZTxUID0gTm92ZWxTaXRlLklPcHRpb25zUnVudGltZT4ob3B0czoge1xuXHRcdGZpbGU6IHN0cmluZyxcblx0XHRjb250ZXh0OiBzdHJpbmcgfCBCdWZmZXIsXG5cdFx0b3B0aW9uc1J1bnRpbWU6IFQgJiBOb3ZlbFNpdGUuSU9wdGlvbnNSdW50aW1lLFxuXHR9KVxuXHR7XG5cdFx0cmV0dXJuIFByb21pc2VCbHVlYmlyZC5yZXNvbHZlKClcblx0XHRcdC5iaW5kKHRoaXMpXG5cdFx0XHQudGhlbigoKSA9PiB7XG5cdFx0XHRcdGxldCB7IGZpbGUsIGNvbnRleHQsIG9wdGlvbnNSdW50aW1lIH0gPSBvcHRzO1xuXG5cdFx0XHRcdGlmIChvcHRpb25zUnVudGltZS5saW5lQnJlYWtDcmxmKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0bGV0IHR4dDEgPSBjb250ZXh0LnRvU3RyaW5nKCk7XG5cblx0XHRcdFx0XHRpZiAoUl9DUkxGLnRlc3QodHh0MSkpXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0bGV0IHR4dDIgPSBjcmxmKHR4dDEsIENSTEYpO1xuXG5cdFx0XHRcdFx0XHRpZiAodHh0MSAhPT0gdHh0Milcblx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0Y29udGV4dCA9IHR4dDI7XG5cdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdHR4dDEgPSBudWxsO1xuXHRcdFx0XHRcdFx0dHh0MiA9IG51bGw7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cblx0XHRcdFx0cmV0dXJuIGZzLm91dHB1dEZpbGUoZmlsZSwgY29udGV4dClcblx0XHRcdFx0XHQudGhlbihyID0+IHtcblxuXHRcdFx0XHRcdFx0aWYgKG9wdGlvbnNSdW50aW1lLmRlYnVnTG9nKVxuXHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRsZXQgZmlsZTIgPSBwYXRoLnJlbGF0aXZlKG9wdGlvbnNSdW50aW1lLm91dHB1dERpciwgZmlsZSk7XG5cblx0XHRcdFx0XHRcdFx0Y29uc29sZURlYnVnLnN1Y2Nlc3MoYFtTQVZFXWAsIGZpbGUyKTtcblx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0cmV0dXJuIHI7XG5cdFx0XHRcdFx0fSlcblx0XHRcdH0pXG5cdFx0O1xuXHR9XG5cbn1cblxuZXhwb3J0IGltcG9ydCBJT3B0aW9uc1J1bnRpbWUgPSBOb3ZlbFNpdGUuSU9wdGlvbnNSdW50aW1lO1xuZXhwb3J0IGltcG9ydCBJVm9sdW1lID0gTm92ZWxTaXRlLklWb2x1bWU7XG5leHBvcnQgaW1wb3J0IElDaGFwdGVyID0gTm92ZWxTaXRlLklDaGFwdGVyO1xuZXhwb3J0IGltcG9ydCBFbnVtUGF0aE5vdmVsU3R5bGUgPSBOb3ZlbFNpdGUuRW51bVBhdGhOb3ZlbFN0eWxlO1xuXG5leHBvcnQgbmFtZXNwYWNlIE5vdmVsU2l0ZVxue1xuXG5cdGV4cG9ydCB0eXBlIElGaWxlUHJlZml4TW9kZSA9IDAgfCAxIHwgMiB8IDMgfCA0IHwgNTtcblxuXHRleHBvcnQgdHlwZSBJT3B0aW9uc1BsdXMgPSB7XG5cblx0XHRkaXNhYmxlT3V0cHV0RGlyUHJlZml4PzogYm9vbGVhbixcblxuXHRcdG5vRGlyUHJlZml4PzogYm9vbGVhbixcblx0XHRub0RpclBhZGVuZD86IGJvb2xlYW4sXG5cblx0XHRub0ZpcmVQcmVmaXg/OiBib29sZWFuLFxuXHRcdG5vRmlsZVBhZGVuZD86IGJvb2xlYW4sXG5cblx0XHRyZXRyeURlbGF5PzogbnVtYmVyLFxuXHRcdHN0YXJ0SW5kZXg/OiBudW1iZXIsXG5cblx0XHRmaWxlUHJlZml4TW9kZT86IG51bWJlciB8IElGaWxlUHJlZml4TW9kZSxcblxuXHRcdGFsbG93RW1wdHlWb2x1bWVUaXRsZT86IGJvb2xlYW4sXG5cblx0XHRldmVudD86IEV2ZW50RW1pdHRlcixcblxuXHRcdC8qKlxuXHRcdCAqIOeUqOS+hueZu+WFpeermem7nueahCBjb29raWVzIHNlc3Npb25cblx0XHQgKi9cblx0XHRzZXNzaW9uRGF0YT86IHtcblx0XHRcdFtrZXk6IHN0cmluZ106IGFueSxcblx0XHR9LFxuXG5cdFx0LyoqXG5cdFx0ICog5Y+q5oqT5Y+W5bCP6Kqq55qEIE1FVEEg6LOH5paZXG5cdFx0ICovXG5cdFx0ZmV0Y2hNZXRhRGF0YU9ubHk/OiBib29sZWFuLFxuXG5cdFx0ZGVidWdMb2c/OiBib29sZWFuLFxuXG5cdFx0bGluZUJyZWFrQ3JsZj86IGJvb2xlYW4sXG5cblx0XHQvKipcblx0XHQgKiDkv53nlZnms6jpn7PmoLzlvI9cblx0XHQgKi9cblx0XHRrZWVwUnVieT86IGJvb2xlYW47XG5cdFx0LyoqXG5cdFx0ICog5L+d55WZ5YW25LuW5qC85byPXG5cdFx0ICovXG5cdFx0a2VlcEZvcm1hdD86IGJvb2xlYW47XG5cblx0XHQvKipcblx0XHQgKiDlnKjlhafmlofljp/lp4vkvY3nva7kuIrkv53nlZnlnJbniYdcblx0XHQgKi9cblx0XHRrZWVwSW1hZ2U/OiBib29sZWFuO1xuXG5cdH1cblxuXHRleHBvcnQgdHlwZSBJT3B0aW9ucyA9IHtcblxuXHRcdG91dHB1dERpcj86IHN0cmluZyxcblx0XHRjd2Q/OiBzdHJpbmcsXG5cblx0fSAmIElPcHRpb25zUGx1cztcblxuXHRleHBvcnQgY29uc3QgZW51bSBFbnVtUGF0aE5vdmVsU3R5bGVcblx0e1xuXHRcdERFRkFVTFQgPSAwLFxuXHRcdE5PVkVMSUQgPSAxLFxuXHR9XG5cblx0ZXhwb3J0IHR5cGUgSURvd25sb2FkT3B0aW9ucyA9IHtcblxuXHRcdC8qKlxuXHRcdCAqIOWPqueUoueUn+ebrumMhOe1kOaniyDkuI3kuIvovInlhaflrrlcblx0XHQgKi9cblx0XHRkaXNhYmxlRG93bmxvYWQ/OiBib29sZWFuLFxuXHRcdGRpc2FibGVDaGVja0V4aXN0cz86IGJvb2xlYW4sXG5cblx0XHRvcHRpb25zSlNET00/OiBJRnJvbVVybE9wdGlvbnMgJiBJT3B0aW9uc0pTRE9NICYge1xuXHRcdFx0Y29va2llSmFyPzogUGFydGlhbDxMYXp5Q29va2llSmFyPixcblx0XHR9LFxuXG5cdFx0LyoqXG5cdFx0ICog6Kit5a6a5bCP6Kqq6LOH5paZ5aS+5qij5byPXG5cdFx0ICovXG5cdFx0cGF0aE5vdmVsU3R5bGU/OiBFbnVtUGF0aE5vdmVsU3R5bGUsXG5cblx0fSAmIElPcHRpb25zUGx1cztcblxuXHRleHBvcnQgdHlwZSBJT3B0aW9uc1J1bnRpbWUgPSBJT3B0aW9ucyAmIElEb3dubG9hZE9wdGlvbnMgJiBJT3B0aW9uc1BsdXM7XG5cblx0ZXhwb3J0IGludGVyZmFjZSBJUGFyc2VVcmxcblx0e1xuXHRcdHVybD86IFVSTCB8IHN0cmluZyxcblxuXHRcdG5vdmVsX3BpZD8sXG5cdFx0bm92ZWxfaWQ/LFxuXHRcdGNoYXB0ZXJfaWQ/LFxuXHRcdHZvbHVtZV9pZD8sXG5cblx0XHRub3ZlbF9yMTg/LFxuXG5cdFx0W2tleTogc3RyaW5nXTogYW55LFxuXHR9XG5cblx0ZXhwb3J0IGludGVyZmFjZSBJQ2hhcHRlclxuXHR7XG5cdFx0Y2hhcHRlcl9pbmRleD86IG51bWJlciB8IHN0cmluZyxcblx0XHRjaGFwdGVyX3RpdGxlOiBzdHJpbmcsXG5cdFx0Y2hhcHRlcl9pZD9cblx0XHRjaGFwdGVyX3VybD9cblx0XHRjaGFwdGVyX3VybF9kYXRhP1xuXHRcdGNoYXB0ZXJfZGF0ZT86IG1vbWVudC5Nb21lbnQsXG5cblx0XHRpbWdzPzogc3RyaW5nW10sXG5cblx0XHRba2V5OiBzdHJpbmddOiBhbnksXG5cdH1cblxuXHRleHBvcnQgaW50ZXJmYWNlIElWb2x1bWVcblx0e1xuXHRcdHZvbHVtZV9pbmRleD9cblx0XHR2b2x1bWVfdGl0bGU6IHN0cmluZyxcblx0XHRjaGFwdGVyX2xpc3Q/OiBJQ2hhcHRlcltdLFxuXG5cdFx0W2tleTogc3RyaW5nXTogYW55LFxuXHR9XG5cblx0ZXhwb3J0IGludGVyZmFjZSBJTm92ZWxcblx0e1xuXHRcdHVybDogVVJMIHwgc3RyaW5nLFxuXHRcdHVybF9kYXRhOiBJUGFyc2VVcmwsXG5cblx0XHRub3ZlbF90aXRsZTogc3RyaW5nLFxuXHRcdG5vdmVsX2F1dGhvcj86IHN0cmluZyxcblxuXHRcdG5vdmVsX2Rlc2M/OiBzdHJpbmcsXG5cdFx0bm92ZWxfZGF0ZT86IG1vbWVudC5Nb21lbnQsXG5cdFx0bm92ZWxfcHVibGlzaGVyPzogc3RyaW5nLFxuXG5cdFx0bm92ZWxfc2VyaWVzX3RpdGxlPzogc3RyaW5nLFxuXG5cdFx0dm9sdW1lX2xpc3Q6IElWb2x1bWVbXSxcblxuXHRcdGNoZWNrZGF0ZT86IG1vbWVudC5Nb21lbnQsXG5cblx0XHRpbWdzPzogc3RyaW5nW10sXG5cblx0XHRba2V5OiBzdHJpbmddOiBhbnksXG5cdH1cblxuXHRleHBvcnQgaW50ZXJmYWNlIElOb3ZlbFNpdGVTdGF0aWM8VD4gZXh0ZW5kcyBUeXBlPFQgJiBOb3ZlbFNpdGUuSU5vdmVsU2l0ZT5cblx0e1xuXHRcdHJlYWRvbmx5IElES0VZOiBzdHJpbmcsXG5cdFx0cmVhZG9ubHkgZGlzYWJsZWQ/OiBib29sZWFuLFxuXG5cdFx0Y2hlY2s/KHVybDogc3RyaW5nIHwgVVJMIHwgTm92ZWxTaXRlLklQYXJzZVVybCB8IG51bWJlciwgb3B0aW9ucz8sIC4uLmFyZ3YpOiBib29sZWFuO1xuXG5cdFx0bWFrZVVybD8odXJsb2JqOiBOb3ZlbFNpdGUuSVBhcnNlVXJsLCBvcHRpb25zPywgLi4uYXJndik6IFVSTDtcblxuXHRcdHBhcnNlVXJsPyh1cmw6IHN0cmluZyB8IFVSTCB8IG51bWJlciwgLi4uYXJndik6IE5vdmVsU2l0ZS5JUGFyc2VVcmw7XG5cblx0fVxuXG5cdGV4cG9ydCBpbnRlcmZhY2UgSU5vdmVsU2l0ZVxuXHR7XG5cdFx0ZG93bmxvYWQodXJsOiBzdHJpbmcgfCBVUkwsIG9wdGlvbnM/OiBJRG93bmxvYWRPcHRpb25zKTogUHJvbWlzZUJsdWViaXJkPE5vdmVsU2l0ZS5JTm92ZWw+O1xuXG5cdFx0bWFrZVVybCh1cmxvYmo6IE5vdmVsU2l0ZS5JUGFyc2VVcmwsIG9wdGlvbnM/LCAuLi5hcmd2KTogVVJMO1xuXG5cdFx0cGFyc2VVcmwodXJsOiBVUkwgfCBzdHJpbmcgfCBudW1iZXIsIC4uLmFyZ3YpOiBOb3ZlbFNpdGUuSVBhcnNlVXJsO1xuXHR9XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgVHlwZTxUPlxue1xuXHRuZXcob3B0aW9uczogTm92ZWxTaXRlLklPcHRpb25zLCAuLi5hcmdzOiBhbnlbXSk6IFQ7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzdGF0aWNJbXBsZW1lbnRzPFQ+KClcbntcblx0cmV0dXJuIChjb25zdHJ1Y3RvcjogVCkgPT4ge31cbn1cblxuZXhwb3J0IGRlZmF1bHQgTm92ZWxTaXRlO1xuIl19