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
                    log_1.consoleDebug.debug('載入並且合併已存在的設定', conf.options.downloadOptions);
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
        log_1.consoleDebug.debug(`save README.md`);
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
            if (optionsRuntime.debugLog) {
                let file2 = path.relative(optionsRuntime.outputDir, file);
                log_1.consoleDebug.log(`save`, file2);
            }
            return fs.outputFile(file, context);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7O0dBRUc7O0FBRUgsb0RBQXNEO0FBbUM3Qyw0QkFuQ0Ysa0JBQWlCLENBbUNFO0FBbEMxQixxREFBcUQ7QUFFckQsNENBQTZDO0FBZ0NqQiwwQ0FBZTtBQS9CM0MseUNBQWdDO0FBQ2hDLCtCQUFnQztBQUVoQyx1Q0FBbUM7QUFHbkMsb0NBQXVIO0FBRTlHLDhCQUZBLDJCQUFtQixDQUVBO0FBQWtDLDZCQUZBLDBCQUFrQixDQUVBO0FBQ2hGLHFEQUFrRjtBQUtsRiwrQkFBZ0M7QUFDaEMsd0NBQTZDO0FBQzdDLG1EQUFvRDtBQUNwRCxvQ0FBcUM7QUFDckMscURBQTREO0FBRTVELG1DQUFtQztBQUNuQywwQ0FBMkM7QUFRbEMsd0JBQU07QUFQZixrQ0FBeUQ7QUFLekQsTUFBTSxDQUFDLEVBQUUsQ0FBQyxNQUFNLEdBQUcsY0FBYyxPQUFPLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQU01QyxRQUFBLFlBQVksR0FBRyxNQUFNLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0FBRWhELE1BQWEsU0FBUztJQU9yQixZQUFZLE9BQTJCLEVBQUUsR0FBRyxJQUFJO1FBRS9DLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUNmO1lBQ0MsTUFBTSxJQUFJLGNBQWMsQ0FBQyxlQUFlLENBQUMsQ0FBQztTQUMxQztRQUVELElBQUksQ0FBQyxXQUFXLEdBQUcsT0FBTyxDQUFDO1FBQzNCLElBQUksQ0FBQyxXQUFXLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsR0FBRyxJQUFJLE9BQU8sQ0FBQyxHQUFHLEVBQUUsQ0FBQztRQUU3RCxDQUFDLElBQUksQ0FBQyxlQUFlLEVBQUUsSUFBSSxDQUFDLFdBQVcsQ0FBQyxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLFdB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QyxXQUFpQixTQUFTO0lBK0R6QixJQUFrQixrQkFJakI7SUFKRCxXQUFrQixrQkFBa0I7UUFFbkMsaUVBQVcsQ0FBQTtRQUNYLGlFQUFXLENBQUE7SUFDWixDQUFDLEVBSmlCLGtCQUFrQixHQUFsQiw0QkFBa0IsS0FBbEIsNEJBQWtCLFFBSW5DO0FBK0ZGLENBQUMsRUFsS2dCLFNBQVMsR0FBVCxpQkFBUyxLQUFULGlCQUFTLFFBa0t6QjtBQU9ELFNBQWdCLGdCQUFnQjtJQUUvQixPQUFPLENBQUMsV0FBYyxFQUFFLEVBQUUsR0FBRSxDQUFDLENBQUE7QUFDOUIsQ0FBQztBQUhELDRDQUdDO0FBRUQsa0JBQWUsU0FBUyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDcmVhdGVkIGJ5IHVzZXIgb24gMjAxOC8yLzEwLzAxMC5cbiAqL1xuXG5pbXBvcnQgYmx1ZWJpcmREZWNvcmF0b3IgZnJvbSAnLi4vZGVjb3JhdG9yL2JsdWViaXJkJztcbi8vaW1wb3J0IGJsdWViaXJkRGVjb3JhdG9yIGZyb20gJ2JsdWViaXJkLWRlY29yYXRvcic7XG5cbmltcG9ydCBQcm9taXNlQmx1ZWJpcmQgPSByZXF1aXJlKCdibHVlYmlyZCcpO1xuaW1wb3J0IHsgVVJMIH0gZnJvbSAnanNkb20tdXJsJztcbmltcG9ydCBwYXRoID0gcmVxdWlyZSgndXBhdGgyJyk7XG5cbmltcG9ydCByb290UGF0aCBmcm9tIFwiLi4vLi4vX3Jvb3RcIjtcbmltcG9ydCB7IHJldHJ5UmVxdWVzdCB9IGZyb20gJy4uL2ZldGNoJztcblxuaW1wb3J0IHsgZGVmYXVsdEpTRE9NT3B0aW9ucywgSUZyb21VcmxPcHRpb25zLCBJT3B0aW9uc0pTRE9NLCBjcmVhdGVPcHRpb25zSlNET00sIElOb3ZlbE9wdGlvbnNKU0RPTSB9IGZyb20gJy4uL2pzZG9tJztcblxuZXhwb3J0IHsgZGVmYXVsdEpTRE9NT3B0aW9ucywgSUZyb21VcmxPcHRpb25zLCBJT3B0aW9uc0pTRE9NLCBjcmVhdGVPcHRpb25zSlNET00gfVxuaW1wb3J0IG5vdmVsSW5mbywgeyBJTWRjb25mTWV0YSwgX2hhbmRsZURhdGFGb3JTdHJpbmdpZnkgfSBmcm9tICdub2RlLW5vdmVsLWluZm8nO1xuXG5leHBvcnQgeyBJTWRjb25mTWV0YSB9XG5pbXBvcnQgeyBMYXp5Q29va2llLCBMYXp5Q29va2llSmFyIH0gZnJvbSAnanNkb20tZXh0cmEnO1xuXG5pbXBvcnQgZnMgPSByZXF1aXJlKCdmcy1leHRyYScpO1xuaW1wb3J0IHsgdHJpbUZpbGVuYW1lIH0gZnJvbSAnZnMtaWNvbnYvdXRpbCc7XG5pbXBvcnQgeyBjcmxmLCBDUkxGLCBSX0NSTEYgfSBmcm9tICdjcmxmLW5vcm1hbGl6ZSc7XG5pbXBvcnQgU3RyVXRpbCA9IHJlcXVpcmUoJ3N0ci11dGlsJyk7XG5pbXBvcnQgeyBFbnVtTm92ZWxTdGF0dXMgfSBmcm9tICdub2RlLW5vdmVsLWluZm8vbGliL2NvbnN0JztcblxuLy9pbXBvcnQgKiBhcyBtb21lbnQgZnJvbSAnbW9tZW50JztcbmltcG9ydCBtb21lbnQgPSByZXF1aXJlKCdtb21lbnQtdGltZXpvbmUnKTtcbmltcG9ydCB7IF9maXhWb2x1bWVDaGFwdGVyTmFtZSwgaXNVbmRlZiB9IGZyb20gJy4uL3V0aWwnO1xuXG5pbXBvcnQgRXZlbnRFbWl0dGVyID0gcmVxdWlyZSgnZXZlbnRzJyk7XG5pbXBvcnQgeyBJRG93bmxvYWRPcHRpb25zIH0gZnJvbSAnLi9kZW1vL2Jhc2UnO1xuXG5tb21lbnQuZm4udG9KU09OID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gdGhpcy5mb3JtYXQoKTsgfTtcblxuZXhwb3J0IHsgbW9tZW50IH07XG5cbmV4cG9ydCB7IGJsdWViaXJkRGVjb3JhdG9yLCBQcm9taXNlQmx1ZWJpcmQgfVxuXG5leHBvcnQgY29uc3QgU1lNQk9MX0NBQ0hFID0gU3ltYm9sLmZvcignY2FjaGUnKTtcblxuZXhwb3J0IGNsYXNzIE5vdmVsU2l0ZSBpbXBsZW1lbnRzIE5vdmVsU2l0ZS5JTm92ZWxTaXRlXG57XG5cdHB1YmxpYyBzdGF0aWMgcmVhZG9ubHkgSURLRVk6IHN0cmluZyA9IG51bGw7XG5cblx0cHVibGljIFBBVEhfTk9WRUxfTUFJTjogc3RyaW5nO1xuXHRwdWJsaWMgb3B0aW9uc0luaXQ/OiBOb3ZlbFNpdGUuSU9wdGlvbnM7XG5cblx0Y29uc3RydWN0b3Iob3B0aW9uczogTm92ZWxTaXRlLklPcHRpb25zLCAuLi5hcmd2KVxuXHR7XG5cdFx0aWYgKCF0aGlzLklES0VZKVxuXHRcdHtcblx0XHRcdHRocm93IG5ldyBSZWZlcmVuY2VFcnJvcihgSURLRVkgaXMgbnVsbGApO1xuXHRcdH1cblxuXHRcdHRoaXMub3B0aW9uc0luaXQgPSBvcHRpb25zO1xuXHRcdHRoaXMub3B0aW9uc0luaXQuY3dkID0gdGhpcy5vcHRpb25zSW5pdC5jd2QgfHwgcHJvY2Vzcy5jd2QoKTtcblxuXHRcdFt0aGlzLlBBVEhfTk9WRUxfTUFJTiwgdGhpcy5vcHRpb25zSW5pdF0gPSB0aGlzLmdldE91dHB1dERpcih0aGlzLm9wdGlvbnNJbml0KTtcblxuXHRcdGlmICh0aGlzLm9wdGlvbnNJbml0LmRlYnVnTG9nKVxuXHRcdHtcblx0XHRcdGNvbnNvbGVEZWJ1Zy5lbmFibGVkID0gdHJ1ZTtcblx0XHR9XG5cdH1cblxuXHRzdGF0aWMgY3JlYXRlKG9wdGlvbnM6IE5vdmVsU2l0ZS5JT3B0aW9ucywgLi4uYXJndilcblx0e1xuXHRcdHJldHVybiBuZXcgdGhpcyhvcHRpb25zLCAuLi5hcmd2KTtcblx0fVxuXG5cdHN0YXRpYyBjaGVjayh1cmw6IHN0cmluZyB8IFVSTCB8IE5vdmVsU2l0ZS5JUGFyc2VVcmwsIG9wdGlvbnM/KTogYm9vbGVhblxuXHR7XG5cdFx0cmV0dXJuIGZhbHNlO1xuXHR9XG5cblx0c2Vzc2lvbjxUID0gTm92ZWxTaXRlLklPcHRpb25zUnVudGltZT4ob3B0aW9uc1J1bnRpbWU6IFQgJiBOb3ZlbFNpdGUuSU9wdGlvbnNSdW50aW1lLCB1cmw/OiBVUkwpXG5cdHtcblx0XHRvcHRpb25zUnVudGltZS5vcHRpb25zSlNET00gPSBjcmVhdGVPcHRpb25zSlNET00ob3B0aW9uc1J1bnRpbWUub3B0aW9uc0pTRE9NKTtcblxuXHRcdGlmICh1cmwpXG5cdFx0e1xuXHRcdFx0b3B0aW9uc1J1bnRpbWVbU1lNQk9MX0NBQ0hFXS51cmwgPSB1cmw7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblxuXHRkb3dubG9hZCh1cmw6IHN0cmluZyB8IFVSTCwgb3B0aW9ucz86IE5vdmVsU2l0ZS5JRG93bmxvYWRPcHRpb25zKTogUHJvbWlzZUJsdWViaXJkPE5vdmVsU2l0ZS5JTm92ZWw+XG5cdHtcblx0XHR0aHJvdyBuZXcgU3ludGF4RXJyb3IoYEZ1bmN0aW9uIG5vdCBpbXBsZW1lbnRlZGApO1xuXHR9XG5cblx0Z2V0X3ZvbHVtZV9saXN0PFQgPSBOb3ZlbFNpdGUuSU9wdGlvbnNSdW50aW1lPih1cmw6IHN0cmluZyB8IFVSTCxcblx0XHRvcHRpb25zUnVudGltZTogUGFydGlhbDxUICYgTm92ZWxTaXRlLklEb3dubG9hZE9wdGlvbnM+ID0ge30sXG5cdCk6IFByb21pc2U8Tm92ZWxTaXRlLklOb3ZlbD5cblx0e1xuXHRcdHRocm93IG5ldyBTeW50YXhFcnJvcihgRnVuY3Rpb24gbm90IGltcGxlbWVudGVkYCk7XG5cdH1cblxuXHRtYWtlVXJsKHVybG9iajogTm92ZWxTaXRlLklQYXJzZVVybCwgb3B0aW9ucz8pOiBVUkxcblx0e1xuXHRcdHRocm93IG5ldyBTeW50YXhFcnJvcihgRnVuY3Rpb24gbm90IGltcGxlbWVudGVkYCk7XG5cdH1cblxuXHRwYXJzZVVybCh1cmw6IFVSTCB8IHN0cmluZywgb3B0aW9ucz8pOiBOb3ZlbFNpdGUuSVBhcnNlVXJsXG5cdHtcblx0XHR0aHJvdyBuZXcgU3ludGF4RXJyb3IoYEZ1bmN0aW9uIG5vdCBpbXBsZW1lbnRlZGApO1xuXHR9XG5cblx0Z2V0U3RhdGljPFQgPSB0eXBlb2YgTm92ZWxTaXRlPigpOiBUXG5cdHtcblx0XHQvLyBAdHMtaWdub3JlXG5cdFx0cmV0dXJuIHRoaXMuX19wcm90b19fLmNvbnN0cnVjdG9yO1xuXHR9XG5cblx0Z2V0IElES0VZKCk6IHN0cmluZ1xuXHR7XG5cdFx0bGV0IGtleSA9IHRoaXMuZ2V0U3RhdGljKCkuSURLRVk7XG5cblx0XHRpZiAodHlwZW9mIGtleSAhPSAnc3RyaW5nJyB8fCAha2V5KVxuXHRcdHtcblx0XHRcdHRocm93IG5ldyBTeW50YXhFcnJvcihgSURLRVkgbm90IGltcGxlbWVudGVkYCk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIGtleTtcblx0fVxuXG5cdHByb3RlY3RlZCBfcGF0aE5vdmVsSUQ8TiBleHRlbmRzIE5vdmVsU2l0ZS5JTm92ZWwsIFQgZXh0ZW5kcyBOb3ZlbFNpdGUuSU9wdGlvbnNSdW50aW1lPihub3ZlbDogTiwgb3B0aW9uc1J1bnRpbWU6IFQpXG5cdHtcblx0XHRyZXR1cm4gbm92ZWwudXJsX2RhdGEubm92ZWxfaWQ7XG5cdH1cblxuXHRnZXRQYXRoTm92ZWw8TiBleHRlbmRzIE5vdmVsU2l0ZS5JTm92ZWwsIFQgZXh0ZW5kcyBOb3ZlbFNpdGUuSU9wdGlvbnNSdW50aW1lPihQQVRIX05PVkVMX01BSU46IHN0cmluZyxcblx0XHRub3ZlbDogTixcblx0XHRvcHRpb25zUnVudGltZTogVCxcblx0KVxuXHR7XG5cdFx0bGV0IG5hbWU6IHN0cmluZztcblxuXHRcdGxldCBub3ZlbF9pZCA9IHRoaXMuX3BhdGhOb3ZlbElEKG5vdmVsLCBvcHRpb25zUnVudGltZSk7XG5cblx0XHRpZiAob3B0aW9uc1J1bnRpbWUucGF0aE5vdmVsU3R5bGUpXG5cdFx0e1xuXHRcdFx0aWYgKG9wdGlvbnNSdW50aW1lLnBhdGhOb3ZlbFN0eWxlID09IE5vdmVsU2l0ZS5FbnVtUGF0aE5vdmVsU3R5bGUuTk9WRUxJRClcblx0XHRcdHtcblx0XHRcdFx0bmFtZSA9IG5vdmVsX2lkO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdGlmIChuYW1lID09IG51bGwpXG5cdFx0e1xuXHRcdFx0bmFtZSA9IGAke3RoaXMudHJpbUZpbGVuYW1lTm92ZWwobm92ZWwubm92ZWxfdGl0bGUpfV8oJHtub3ZlbF9pZH0pYFxuXHRcdH1cblxuXHRcdHJldHVybiBwYXRoLmpvaW4oUEFUSF9OT1ZFTF9NQUlOLCBuYW1lKTtcblx0fVxuXG5cdC8qKlxuXHQgKiDlpoLmnpzlt7LntpPkuIvovInpgY4g5YmH6Kmm5ZyW5b6eIFJFQURNRS5tZCDlhaforoDlj5bnvLrmvI/nmoTkuIvovInoqK3lrppcblx0ICpcblx0ICogQHByaXZhdGVcblx0ICovXG5cdF9sb2FkRXhpc3RzQ29uZjxULCBOIGV4dGVuZHMgTm92ZWxTaXRlLklOb3ZlbD4oaW5wdXRVcmwsIG9wdGlvbnNSdW50aW1lOiBULCBub3ZlbDogTiwgcGF0aF9ub3ZlbDogc3RyaW5nKVxuXHR7XG5cdFx0bGV0IGZpbGUgPSBwYXRoLnJlc29sdmUocGF0aF9ub3ZlbCwgJ1JFQURNRS5tZCcpO1xuXG5cdFx0aWYgKGZzLnBhdGhFeGlzdHNTeW5jKGZpbGUpKVxuXHRcdHtcblx0XHRcdGxldCBtZCA9IGZzLnJlYWRGaWxlU3luYyhmaWxlKS50b1N0cmluZygpO1xuXG5cdFx0XHRsZXQgY29uZiA9IG5vdmVsSW5mby5wYXJzZShtZCwge1xuXHRcdFx0XHRsb3dDaGVja0xldmVsOiB0cnVlLFxuXHRcdFx0XHR0aHJvdzogZmFsc2UsXG5cdFx0XHR9KTtcblxuXHRcdFx0Y29uc29sZURlYnVnLmRlYnVnKCfmqqLmn6UgUkVBRE1FLm1kIOaYr+WQpuWtmOWcqOS4i+i8ieioreWumicpO1xuXG5cdFx0XHRpZiAoY29uZiAmJiBjb25mLm9wdGlvbnMpXG5cdFx0XHR7XG5cdFx0XHRcdGlmIChjb25mLm9wdGlvbnMuZG93bmxvYWRPcHRpb25zIHx8IGNvbmYub3B0aW9ucy5kb3dubG9hZG9wdGlvbnMpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRjb25zb2xlRGVidWcuZGVidWcoJ+i8ieWFpeS4puS4lOWQiOS9teW3suWtmOWcqOeahOioreWumicsIGNvbmYub3B0aW9ucy5kb3dubG9hZE9wdGlvbnMpO1xuXG5cdFx0XHRcdFx0T2JqZWN0LmVudHJpZXMoY29uZi5vcHRpb25zLmRvd25sb2FkT3B0aW9ucyB8fCBjb25mLm9wdGlvbnMuZG93bmxvYWRvcHRpb25zKVxuXHRcdFx0XHRcdFx0LmZvckVhY2goZnVuY3Rpb24gKFtrLCB2XSlcblx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0aWYgKG9wdGlvbnNSdW50aW1lW2tdID09IG51bGwpXG5cdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHRvcHRpb25zUnVudGltZVtrXSA9IHY7XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdH0pXG5cdFx0XHRcdFx0O1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0Z2V0T3V0cHV0RGlyPFQ+KG9wdGlvbnM/OiBUICYgTm92ZWxTaXRlLklPcHRpb25zLCBub3ZlbE5hbWU/OiBzdHJpbmcpOiBbc3RyaW5nLCBUICYgTm92ZWxTaXRlLklPcHRpb25zXVxuXHR7XG5cdFx0b3B0aW9ucyA9IE9iamVjdC5hc3NpZ24oe30sIHRoaXMub3B0aW9uc0luaXQsIG9wdGlvbnMpO1xuXG5cdFx0aWYgKCFvcHRpb25zLm91dHB1dERpcilcblx0XHR7XG5cdFx0XHR0aHJvdyBuZXcgUmVmZXJlbmNlRXJyb3IoYG9wdGlvbnM6IG91dHB1dERpciBpcyBub3Qgc2V0YCk7XG5cdFx0fVxuXG5cdFx0bGV0IHAgPSBwYXRoLmpvaW4ob3B0aW9ucy5vdXRwdXREaXIsIG9wdGlvbnMuZGlzYWJsZU91dHB1dERpclByZWZpeCA/ICcnIDogdGhpcy5JREtFWSk7XG5cblx0XHRpZiAoIXBhdGguaXNBYnNvbHV0ZShwKSlcblx0XHR7XG5cdFx0XHRwID0gcGF0aC5qb2luKG9wdGlvbnMuY3dkLCBwKTtcblx0XHR9XG5cblx0XHRyb290UGF0aC5kaXNhYmxlUGF0aHMuY29uY2F0KF9fZGlybmFtZSkuZm9yRWFjaChmdW5jdGlvbiAoZGlyKVxuXHRcdHtcblx0XHRcdGlmIChwLmluZGV4T2YoX19kaXJuYW1lKSA9PSAwKVxuXHRcdFx0e1xuXHRcdFx0XHR0aHJvdyBuZXcgUmVmZXJlbmNlRXJyb3IoYHBhdGggbm90IGFsbG93IFwiJHtwfVwiYClcblx0XHRcdH1cblx0XHR9KTtcblxuXHRcdGlmICh0eXBlb2Ygbm92ZWxOYW1lID09ICdzdHJpbmcnIHx8IG5vdmVsTmFtZSlcblx0XHR7XG5cdFx0XHRpZiAoIW5vdmVsTmFtZSlcblx0XHRcdHtcblx0XHRcdFx0dGhyb3cgbmV3IFJlZmVyZW5jZUVycm9yKCk7XG5cdFx0XHR9XG5cblx0XHRcdHAgPSBwYXRoLmpvaW4ocCwgbm92ZWxOYW1lKTtcblx0XHR9XG5cblx0XHRvcHRpb25zID0gdGhpcy5fZml4T3B0aW9uc1J1bnRpbWUob3B0aW9ucyk7XG5cblx0XHRyZXR1cm4gW3AsIG9wdGlvbnNdO1xuXHR9XG5cblx0cHJvdGVjdGVkIF9maXhPcHRpb25zUnVudGltZTxUID0gTm92ZWxTaXRlLklPcHRpb25zUnVudGltZT4ob3B0aW9uc1J1bnRpbWU6IFQgJiBOb3ZlbFNpdGUuSU9wdGlvbnNSdW50aW1lKTogVCAmIE5vdmVsU2l0ZS5JT3B0aW9uc1J1bnRpbWVcblx0e1xuXHRcdG9wdGlvbnNSdW50aW1lW1NZTUJPTF9DQUNIRV0gPSAob3B0aW9uc1J1bnRpbWVbU1lNQk9MX0NBQ0hFXSB8fCB7fSkgYXMge1xuXHRcdFx0dXJsPzogVVJMLFxuXHRcdFx0cGF0aF9ub3ZlbD86IHN0cmluZyxcblx0XHRcdG5vdmVsPzogTm92ZWxTaXRlLklOb3ZlbCxcblx0XHR9O1xuXG5cdFx0b3B0aW9uc1J1bnRpbWUuc3RhcnRJbmRleCA9IG9wdGlvbnNSdW50aW1lLnN0YXJ0SW5kZXggfHwgMDtcblxuXHRcdC8vIEB0cy1pZ25vcmVcblx0XHRvcHRpb25zUnVudGltZS5vcHRpb25zSlNET00gPSBjcmVhdGVPcHRpb25zSlNET00ob3B0aW9uc1J1bnRpbWUub3B0aW9uc0pTRE9NKTtcblxuXG5cdFx0aWYgKG9wdGlvbnNSdW50aW1lLmRlYnVnTG9nICE9IG51bGwpXG5cdFx0e1xuXHRcdFx0b3B0aW9uc1J1bnRpbWUuZGVidWdMb2cgPSAhIW9wdGlvbnNSdW50aW1lLmRlYnVnTG9nO1xuXHRcdH1cblxuXHRcdHJldHVybiBvcHRpb25zUnVudGltZTtcblx0fVxuXG5cdHRyaW1GaWxlbmFtZUNoYXB0ZXIobmFtZSk6IHN0cmluZ1xuXHR7XG5cdFx0cmV0dXJuIHRoaXMudHJpbUZpbGVuYW1lKG5hbWUpO1xuXHR9XG5cblx0dHJpbUZpbGVuYW1lVm9sdW1lKG5hbWUpOiBzdHJpbmdcblx0e1xuXHRcdHJldHVybiB0aGlzLnRyaW1GaWxlbmFtZShuYW1lKTtcblx0fVxuXG5cdHRyaW1GaWxlbmFtZU5vdmVsKG5hbWUpOiBzdHJpbmdcblx0e1xuXHRcdHJldHVybiB0aGlzLnRyaW1GaWxlbmFtZShuYW1lKTtcblx0fVxuXG5cdHRyaW1GaWxlbmFtZShuYW1lKTogc3RyaW5nXG5cdHtcblx0XHRyZXR1cm4gdHJpbUZpbGVuYW1lKF9maXhWb2x1bWVDaGFwdGVyTmFtZShuYW1lKSk7XG5cdH1cblxuXHR0cmltVGFnKHRhZyk6IHN0cmluZ1xuXHR7XG5cdFx0cmV0dXJuICh0YWcgYXMgc3RyaW5nKVxuXHRcdFx0LnJlcGxhY2UoL1tcXFtcXF1cXC9cXFxcXS9nLCAocykgPT5cblx0XHRcdHtcblx0XHRcdFx0cmV0dXJuIFN0clV0aWwudG9GdWxsV2lkdGgocylcblx0XHRcdH0pXG5cdFx0XHQ7XG5cdH1cblxuXHRwcm90ZWN0ZWQgX2V4cG9ydERvd25sb2FkT3B0aW9ucyhvcHRpb25zUnVudGltZT86IElPcHRpb25zUnVudGltZSk6IHVua25vd25cblx0e1xuXHRcdHJldHVybiB2b2lkICgwKTtcblx0fVxuXG5cdHByb3RlY3RlZCBfaGFuZGxlRGF0YUZvclN0cmluZ2lmeSguLi5hcmd2KTogSU1kY29uZk1ldGFcblx0e1xuXHRcdC8vIEB0cy1pZ25vcmVcblx0XHRsZXQgbWRjb25mOiBJTWRjb25mTWV0YSA9IF9oYW5kbGVEYXRhRm9yU3RyaW5naWZ5KC4uLmFyZ3YpO1xuXG5cdFx0aWYgKG1kY29uZi5ub3ZlbClcblx0XHR7XG5cdFx0XHRpZiAobWRjb25mLm5vdmVsLnRhZ3MgJiYgQXJyYXkuaXNBcnJheShtZGNvbmYubm92ZWwudGFncykpXG5cdFx0XHR7XG5cdFx0XHRcdGxldCBib29sOiBib29sZWFuO1xuXG5cdFx0XHRcdGJvb2wgPSBbXG5cdFx0XHRcdFx0J+abuOexjeWMlicsXG5cdFx0XHRcdFx0J+S5puexjeWMlicsXG5cdFx0XHRcdFx0J+aWh+W6q+WMlicsXG5cdFx0XHRcdFx0J+aWh+W6k+WMlicsXG5cdFx0XHRcdF0uc29tZSh2ID0+XG5cdFx0XHRcdHtcblx0XHRcdFx0XHRyZXR1cm4gbWRjb25mLm5vdmVsLnRhZ3MuaW5jbHVkZXModilcblx0XHRcdFx0fSk7XG5cblx0XHRcdFx0aWYgKGJvb2wpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRtZGNvbmYubm92ZWwubm92ZWxfc3RhdHVzID0gKG1kY29uZi5ub3ZlbC5ub3ZlbF9zdGF0dXMgfCAwKSB8IEVudW1Ob3ZlbFN0YXR1cy5QX0JPT0s7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cblx0XHRyZXR1cm4gbWRjb25mO1xuXHR9XG5cblx0cHJvdGVjdGVkIF9zYXZlUmVhZG1lKG9wdGlvbnNSdW50aW1lPzogSU9wdGlvbnNSdW50aW1lLCBvcHRpb25zID0ge30sIC4uLm9wdHMpXG5cdHtcblx0XHRjb25zdCBzZWxmID0gdGhpcztcblxuXHRcdGlmIChpc1VuZGVmKG9wdGlvbnNSdW50aW1lKVxuXHRcdFx0fHwgaXNVbmRlZihvcHRpb25zUnVudGltZVtTWU1CT0xfQ0FDSEVdLCB7fSlcblxuXHRcdFx0fHwgaXNVbmRlZihvcHRpb25zUnVudGltZVtTWU1CT0xfQ0FDSEVdLm5vdmVsLCB7fSlcblx0XHRcdHx8IGlzVW5kZWYob3B0aW9uc1J1bnRpbWVbU1lNQk9MX0NBQ0hFXS5wYXRoX25vdmVsLCAnJylcblx0XHQpXG5cdFx0e1xuXHRcdFx0dGhyb3cgbmV3IFJlZmVyZW5jZUVycm9yKGBzYXZlUmVhZG1lYCk7XG5cdFx0fVxuXG5cdFx0Y29uc3Qgbm92ZWwgPSBvcHRpb25zUnVudGltZVtTWU1CT0xfQ0FDSEVdLm5vdmVsO1xuXHRcdGNvbnN0IHBhdGhfbm92ZWwgPSBvcHRpb25zUnVudGltZVtTWU1CT0xfQ0FDSEVdLnBhdGhfbm92ZWw7XG5cblx0XHRsZXQgbWRjb25maWcgPSB0aGlzLl9oYW5kbGVEYXRhRm9yU3RyaW5naWZ5KHtcblx0XHRcdG5vdmVsOiB7XG5cdFx0XHRcdGlsbHVzdDogJycsXG5cdFx0XHRcdHRpdGxlX3poMTogJycsXG5cdFx0XHRcdGlsbHVzdHM6IFtdLFxuXHRcdFx0XHRwdWJsaXNoZXJzOiBbXG5cdFx0XHRcdFx0c2VsZi5JREtFWSxcblx0XHRcdFx0XSxcblx0XHRcdFx0dGFnczogW1xuXHRcdFx0XHRcdHNlbGYuSURLRVksXG5cdFx0XHRcdF0sXG5cdFx0XHRcdHNlcmllczoge1xuXHRcdFx0XHRcdG5hbWU6IG5vdmVsLm5vdmVsX3Nlcmllc190aXRsZSB8fCBub3ZlbC5ub3ZlbF90aXRsZSB8fCAnJyxcblx0XHRcdFx0fSxcblx0XHRcdFx0bm92ZWxfc3RhdHVzOiAwLFxuXHRcdFx0fSxcblx0XHRcdG9wdGlvbnMsXG5cblx0XHRcdGxpbms6IG5vdmVsLmxpbmsgfHwgW10sXG5cdFx0fSwgbm92ZWwsIC4uLm9wdHMpO1xuXG5cdFx0bGV0IG1kID0gbm92ZWxJbmZvLnN0cmluZ2lmeShtZGNvbmZpZyk7XG5cblx0XHRsZXQgZmlsZSA9IHBhdGguam9pbihwYXRoX25vdmVsLCBgUkVBRE1FLm1kYCk7XG5cblx0XHRjb25zb2xlRGVidWcuZGVidWcoYHNhdmUgUkVBRE1FLm1kYCk7XG5cblx0XHRyZXR1cm4gZnMub3V0cHV0RmlsZShmaWxlLCBtZClcblx0XHRcdC50aGVuKGZ1bmN0aW9uICgpXG5cdFx0XHR7XG5cdFx0XHRcdHJldHVybiB7XG5cdFx0XHRcdFx0ZmlsZSxcblx0XHRcdFx0XHRtZCxcblx0XHRcdFx0fTtcblx0XHRcdH0pXG5cdFx0XHQ7XG5cdH1cblxuXHRjcmVhdGVNYWluVXJsKHVybDogc3RyaW5nKTogVVJMXG5cdGNyZWF0ZU1haW5VcmwodXJsOiBVUkwpOiBVUkxcblx0Y3JlYXRlTWFpblVybCh1cmwpXG5cdHtcblx0XHRsZXQgZGF0YSA9IHRoaXMucGFyc2VVcmwodXJsKTtcblxuXHRcdGlmICghZGF0YSB8fCAhZGF0YS5ub3ZlbF9pZClcblx0XHR7XG5cdFx0XHQvL2NvbnNvbGUubG9nKGRhdGEpO1xuXG5cdFx0XHR0aHJvdyBuZXcgUmVmZXJlbmNlRXJyb3IoKTtcblx0XHR9XG5cblx0XHRyZXR1cm4gdGhpcy5tYWtlVXJsKGRhdGEsIHRydWUpO1xuXHR9XG5cblx0cHJvdGVjdGVkIF9jcmVhdGVDaGFwdGVyVXJsPFQgPSBJT3B0aW9uc1J1bnRpbWU+KHtcblx0XHRub3ZlbCxcblx0XHR2b2x1bWUsXG5cdFx0Y2hhcHRlcixcblx0fToge1xuXHRcdG5vdmVsOiBOb3ZlbFNpdGUuSU5vdmVsLFxuXHRcdHZvbHVtZTogTm92ZWxTaXRlLklWb2x1bWUsXG5cdFx0Y2hhcHRlcjogTm92ZWxTaXRlLklDaGFwdGVyLFxuXHR9LCBvcHRpb25zUnVudGltZT86IFQgJiBJT3B0aW9uc1J1bnRpbWUpOiBVUkxcblx0e1xuXHRcdC8vIEB0cy1pZ25vcmVcblx0XHRyZXR1cm4gbmV3IFVSTChjaGFwdGVyLmNoYXB0ZXJfdXJsKTtcblx0fVxuXG5cdHByb3RlY3RlZCBfZmV0Y2hDaGFwdGVyPFQ+KHVybDogVVJMLCBvcHRpb25zUnVudGltZTogVCAmIElPcHRpb25zUnVudGltZSlcblx0e1xuXHRcdHRocm93IG5ldyBTeW50YXhFcnJvcihgRnVuY3Rpb24gbm90IGltcGxlbWVudGVkYCk7XG5cdH1cblxuXHRwcm90ZWN0ZWQgX3BhcnNlQ2hhcHRlcjxUPihkb20sIG9wdGlvbnNSdW50aW1lOiBUICYgSU9wdGlvbnNSdW50aW1lLCBjYWNoZToge1xuXHRcdGZpbGU6IHN0cmluZyxcblx0XHRub3ZlbDogTm92ZWxTaXRlLklOb3ZlbCxcblx0XHR2b2x1bWU6IE5vdmVsU2l0ZS5JVm9sdW1lLFxuXHRcdGNoYXB0ZXI6IE5vdmVsU2l0ZS5JQ2hhcHRlcixcblx0fSlcblx0e1xuXHRcdHRocm93IG5ldyBTeW50YXhFcnJvcihgRnVuY3Rpb24gbm90IGltcGxlbWVudGVkYCk7XG5cdH1cblxuXHRnZXRFeHRyYUluZm88VCwgTSBleHRlbmRzIFBhcnRpYWw8SU5vdmVsICYgSU1kY29uZk1ldGE+LCBDIGV4dGVuZHMgdW5rbm93bj4odXJsb2JqOiBOb3ZlbFNpdGUuSVBhcnNlVXJsLFxuXHRcdG9wdGlvbnNSdW50aW1lOiBUICYgSU9wdGlvbnNSdW50aW1lLFxuXHRcdGRhdGFfbWV0YT86IE0sXG5cdFx0Y2FjaGU/OiBDLFxuXHQpOiBQcm9taXNlQmx1ZWJpcmQ8TT5cblx0e1xuXHRcdHRocm93IG5ldyBTeW50YXhFcnJvcihgRnVuY3Rpb24gbm90IGltcGxlbWVudGVkYCk7XG5cdH1cblxuXHRwcm90ZWN0ZWQgX2NoZWNrRXhpc3RzKG9wdGlvbnNSdW50aW1lOiBJT3B0aW9uc1J1bnRpbWUsIGZpbGU6IHN0cmluZyk6IGJvb2xlYW5cblx0e1xuXHRcdGlmICghb3B0aW9uc1J1bnRpbWUuZGlzYWJsZUNoZWNrRXhpc3RzICYmIGZzLmV4aXN0c1N5bmMoZmlsZSkpXG5cdFx0e1xuXHRcdFx0bGV0IHR4dCA9IGZzLnJlYWRGaWxlU3luYyhmaWxlKTtcblxuXHRcdFx0aWYgKHR4dC50b1N0cmluZygpLnJlcGxhY2UoL15cXHMrfFxccyskL2csICcnKSlcblx0XHRcdHtcblx0XHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0cmV0dXJuIGZhbHNlXG5cdH1cblxuXHRwcm90ZWN0ZWQgZW1pdChldmVudDogRXZlbnRFbWl0dGVyLCBldmVudE5hbWU6IHN0cmluZywgLi4uYXJndilcblx0e1xuXHRcdGxldCBib29sID0gZXZlbnQuZW1pdChldmVudE5hbWUsIHRoaXMsIC4uLmFyZ3YpO1xuXHRcdHJldHVybiBbZXZlbnQsIGJvb2xdO1xuXHR9XG5cblx0X3NhdmVGaWxlPFQgPSBOb3ZlbFNpdGUuSU9wdGlvbnNSdW50aW1lPihvcHRzOiB7XG5cdFx0ZmlsZTogc3RyaW5nLFxuXHRcdGNvbnRleHQ6IHN0cmluZyB8IEJ1ZmZlcixcblx0XHRvcHRpb25zUnVudGltZTogVCAmIE5vdmVsU2l0ZS5JT3B0aW9uc1J1bnRpbWUsXG5cdH0pXG5cdHtcblx0XHRyZXR1cm4gUHJvbWlzZUJsdWViaXJkLnJlc29sdmUoKVxuXHRcdFx0LmJpbmQodGhpcylcblx0XHRcdC50aGVuKCgpID0+IHtcblx0XHRcdFx0bGV0IHsgZmlsZSwgY29udGV4dCwgb3B0aW9uc1J1bnRpbWUgfSA9IG9wdHM7XG5cblx0XHRcdFx0aWYgKG9wdGlvbnNSdW50aW1lLmxpbmVCcmVha0NybGYpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRsZXQgdHh0MSA9IGNvbnRleHQudG9TdHJpbmcoKTtcblxuXHRcdFx0XHRcdGlmIChSX0NSTEYudGVzdCh0eHQxKSlcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRsZXQgdHh0MiA9IGNybGYodHh0MSwgQ1JMRik7XG5cblx0XHRcdFx0XHRcdGlmICh0eHQxICE9PSB0eHQyKVxuXHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRjb250ZXh0ID0gdHh0Mjtcblx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0dHh0MSA9IG51bGw7XG5cdFx0XHRcdFx0XHR0eHQyID0gbnVsbDtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRpZiAob3B0aW9uc1J1bnRpbWUuZGVidWdMb2cpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRsZXQgZmlsZTIgPSBwYXRoLnJlbGF0aXZlKG9wdGlvbnNSdW50aW1lLm91dHB1dERpciwgZmlsZSlcblxuXHRcdFx0XHRcdGNvbnNvbGVEZWJ1Zy5sb2coYHNhdmVgLCBmaWxlMik7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRyZXR1cm4gZnMub3V0cHV0RmlsZShmaWxlLCBjb250ZXh0KVxuXHRcdFx0fSlcblx0XHQ7XG5cdH1cblxufVxuXG5leHBvcnQgaW1wb3J0IElPcHRpb25zUnVudGltZSA9IE5vdmVsU2l0ZS5JT3B0aW9uc1J1bnRpbWU7XG5leHBvcnQgaW1wb3J0IElWb2x1bWUgPSBOb3ZlbFNpdGUuSVZvbHVtZTtcbmV4cG9ydCBpbXBvcnQgSUNoYXB0ZXIgPSBOb3ZlbFNpdGUuSUNoYXB0ZXI7XG5leHBvcnQgaW1wb3J0IEVudW1QYXRoTm92ZWxTdHlsZSA9IE5vdmVsU2l0ZS5FbnVtUGF0aE5vdmVsU3R5bGU7XG5pbXBvcnQgeyBJTm92ZWwgfSBmcm9tICcuL3N5b3NldHUnO1xuaW1wb3J0IHsgY29uc29sZURlYnVnIH0gZnJvbSAnLi4vdXRpbC9sb2cnO1xuXG5leHBvcnQgbmFtZXNwYWNlIE5vdmVsU2l0ZVxue1xuXG5cdGV4cG9ydCB0eXBlIElGaWxlUHJlZml4TW9kZSA9IDAgfCAxIHwgMiB8IDMgfCA0IHwgNTtcblxuXHRleHBvcnQgdHlwZSBJT3B0aW9uc1BsdXMgPSB7XG5cblx0XHRkaXNhYmxlT3V0cHV0RGlyUHJlZml4PzogYm9vbGVhbixcblxuXHRcdG5vRGlyUHJlZml4PzogYm9vbGVhbixcblx0XHRub0RpclBhZGVuZD86IGJvb2xlYW4sXG5cblx0XHRub0ZpcmVQcmVmaXg/OiBib29sZWFuLFxuXHRcdG5vRmlsZVBhZGVuZD86IGJvb2xlYW4sXG5cblx0XHRyZXRyeURlbGF5PzogbnVtYmVyLFxuXHRcdHN0YXJ0SW5kZXg/OiBudW1iZXIsXG5cblx0XHRmaWxlUHJlZml4TW9kZT86IG51bWJlciB8IElGaWxlUHJlZml4TW9kZSxcblxuXHRcdGFsbG93RW1wdHlWb2x1bWVUaXRsZT86IGJvb2xlYW4sXG5cblx0XHRldmVudD86IEV2ZW50RW1pdHRlcixcblxuXHRcdC8qKlxuXHRcdCAqIOeUqOS+hueZu+WFpeermem7nueahCBjb29raWVzIHNlc3Npb25cblx0XHQgKi9cblx0XHRzZXNzaW9uRGF0YT86IHtcblx0XHRcdFtrZXk6IHN0cmluZ106IGFueSxcblx0XHR9LFxuXG5cdFx0LyoqXG5cdFx0ICog5Y+q5oqT5Y+W5bCP6Kqq55qEIE1FVEEg6LOH5paZXG5cdFx0ICovXG5cdFx0ZmV0Y2hNZXRhRGF0YU9ubHk/OiBib29sZWFuLFxuXG5cdFx0ZGVidWdMb2c/OiBib29sZWFuLFxuXG5cdFx0bGluZUJyZWFrQ3JsZj86IGJvb2xlYW4sXG5cblx0XHQvKipcblx0XHQgKiDkv53nlZnms6jpn7PmoLzlvI9cblx0XHQgKi9cblx0XHRrZWVwUnVieT86IGJvb2xlYW47XG5cdFx0LyoqXG5cdFx0ICog5L+d55WZ5YW25LuW5qC85byPXG5cdFx0ICovXG5cdFx0a2VlcEZvcm1hdD86IGJvb2xlYW47XG5cblx0XHQvKipcblx0XHQgKiDlnKjlhafmlofljp/lp4vkvY3nva7kuIrkv53nlZnlnJbniYdcblx0XHQgKi9cblx0XHRrZWVwSW1hZ2U/OiBib29sZWFuO1xuXG5cdH1cblxuXHRleHBvcnQgdHlwZSBJT3B0aW9ucyA9IHtcblxuXHRcdG91dHB1dERpcj86IHN0cmluZyxcblx0XHRjd2Q/OiBzdHJpbmcsXG5cblx0fSAmIElPcHRpb25zUGx1cztcblxuXHRleHBvcnQgY29uc3QgZW51bSBFbnVtUGF0aE5vdmVsU3R5bGVcblx0e1xuXHRcdERFRkFVTFQgPSAwLFxuXHRcdE5PVkVMSUQgPSAxLFxuXHR9XG5cblx0ZXhwb3J0IHR5cGUgSURvd25sb2FkT3B0aW9ucyA9IHtcblxuXHRcdC8qKlxuXHRcdCAqIOWPqueUoueUn+ebrumMhOe1kOaniyDkuI3kuIvovInlhaflrrlcblx0XHQgKi9cblx0XHRkaXNhYmxlRG93bmxvYWQ/OiBib29sZWFuLFxuXHRcdGRpc2FibGVDaGVja0V4aXN0cz86IGJvb2xlYW4sXG5cblx0XHRvcHRpb25zSlNET00/OiBJRnJvbVVybE9wdGlvbnMgJiBJT3B0aW9uc0pTRE9NICYge1xuXHRcdFx0Y29va2llSmFyPzogUGFydGlhbDxMYXp5Q29va2llSmFyPixcblx0XHR9LFxuXG5cdFx0LyoqXG5cdFx0ICog6Kit5a6a5bCP6Kqq6LOH5paZ5aS+5qij5byPXG5cdFx0ICovXG5cdFx0cGF0aE5vdmVsU3R5bGU/OiBFbnVtUGF0aE5vdmVsU3R5bGUsXG5cblx0fSAmIElPcHRpb25zUGx1cztcblxuXHRleHBvcnQgdHlwZSBJT3B0aW9uc1J1bnRpbWUgPSBJT3B0aW9ucyAmIElEb3dubG9hZE9wdGlvbnMgJiBJT3B0aW9uc1BsdXM7XG5cblx0ZXhwb3J0IGludGVyZmFjZSBJUGFyc2VVcmxcblx0e1xuXHRcdHVybD86IFVSTCB8IHN0cmluZyxcblxuXHRcdG5vdmVsX3BpZD8sXG5cdFx0bm92ZWxfaWQ/LFxuXHRcdGNoYXB0ZXJfaWQ/LFxuXG5cdFx0bm92ZWxfcjE4PyxcblxuXHRcdFtrZXk6IHN0cmluZ106IGFueSxcblx0fVxuXG5cdGV4cG9ydCBpbnRlcmZhY2UgSUNoYXB0ZXJcblx0e1xuXHRcdGNoYXB0ZXJfaW5kZXg/OiBudW1iZXIgfCBzdHJpbmcsXG5cdFx0Y2hhcHRlcl90aXRsZTogc3RyaW5nLFxuXHRcdGNoYXB0ZXJfaWQ/XG5cdFx0Y2hhcHRlcl91cmw/XG5cdFx0Y2hhcHRlcl91cmxfZGF0YT9cblx0XHRjaGFwdGVyX2RhdGU/OiBtb21lbnQuTW9tZW50LFxuXG5cdFx0aW1ncz86IHN0cmluZ1tdLFxuXG5cdFx0W2tleTogc3RyaW5nXTogYW55LFxuXHR9XG5cblx0ZXhwb3J0IGludGVyZmFjZSBJVm9sdW1lXG5cdHtcblx0XHR2b2x1bWVfaW5kZXg/XG5cdFx0dm9sdW1lX3RpdGxlOiBzdHJpbmcsXG5cdFx0Y2hhcHRlcl9saXN0PzogSUNoYXB0ZXJbXSxcblxuXHRcdFtrZXk6IHN0cmluZ106IGFueSxcblx0fVxuXG5cdGV4cG9ydCBpbnRlcmZhY2UgSU5vdmVsXG5cdHtcblx0XHR1cmw6IFVSTCB8IHN0cmluZyxcblx0XHR1cmxfZGF0YTogSVBhcnNlVXJsLFxuXG5cdFx0bm92ZWxfdGl0bGU6IHN0cmluZyxcblx0XHRub3ZlbF9hdXRob3I/OiBzdHJpbmcsXG5cblx0XHRub3ZlbF9kZXNjPzogc3RyaW5nLFxuXHRcdG5vdmVsX2RhdGU/OiBtb21lbnQuTW9tZW50LFxuXHRcdG5vdmVsX3B1Ymxpc2hlcj86IHN0cmluZyxcblxuXHRcdG5vdmVsX3Nlcmllc190aXRsZT86IHN0cmluZyxcblxuXHRcdHZvbHVtZV9saXN0OiBJVm9sdW1lW10sXG5cblx0XHRjaGVja2RhdGU/OiBtb21lbnQuTW9tZW50LFxuXG5cdFx0aW1ncz86IHN0cmluZ1tdLFxuXG5cdFx0W2tleTogc3RyaW5nXTogYW55LFxuXHR9XG5cblx0ZXhwb3J0IGludGVyZmFjZSBJTm92ZWxTaXRlU3RhdGljPFQ+IGV4dGVuZHMgVHlwZTxUICYgTm92ZWxTaXRlLklOb3ZlbFNpdGU+XG5cdHtcblx0XHRJREtFWTogc3RyaW5nLFxuXHR9XG5cblx0ZXhwb3J0IGludGVyZmFjZSBJTm92ZWxTaXRlXG5cdHtcblx0XHRkb3dubG9hZCh1cmw6IHN0cmluZyB8IFVSTCwgb3B0aW9ucz86IElEb3dubG9hZE9wdGlvbnMpOiBQcm9taXNlQmx1ZWJpcmQ8Tm92ZWxTaXRlLklOb3ZlbD47XG5cblx0XHRtYWtlVXJsKHVybG9iajogTm92ZWxTaXRlLklQYXJzZVVybCwgb3B0aW9ucz8pOiBVUkw7XG5cblx0XHRwYXJzZVVybCh1cmw6IFVSTCB8IHN0cmluZyk6IE5vdmVsU2l0ZS5JUGFyc2VVcmw7XG5cdH1cbn1cblxuZXhwb3J0IGludGVyZmFjZSBUeXBlPFQ+XG57XG5cdG5ldyhvcHRpb25zOiBOb3ZlbFNpdGUuSU9wdGlvbnMsIC4uLmFyZ3M6IGFueVtdKTogVDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHN0YXRpY0ltcGxlbWVudHM8VD4oKVxue1xuXHRyZXR1cm4gKGNvbnN0cnVjdG9yOiBUKSA9PiB7fVxufVxuXG5leHBvcnQgZGVmYXVsdCBOb3ZlbFNpdGU7XG4iXX0=