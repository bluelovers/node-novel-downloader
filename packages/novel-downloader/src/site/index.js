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
            if (conf && conf.options) {
                if (conf.options.downloadOptions || conf.options.downloadoptions) {
                    //console.log('載入已存在的設定', conf.options.downloadOptions);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7O0dBRUc7O0FBRUgsb0RBQXNEO0FBbUM3Qyw0QkFuQ0Ysa0JBQWlCLENBbUNFO0FBbEMxQixxREFBcUQ7QUFFckQsNENBQTZDO0FBZ0NqQiwwQ0FBZTtBQS9CM0MseUNBQWdDO0FBQ2hDLCtCQUFnQztBQUVoQyx1Q0FBbUM7QUFHbkMsb0NBQXVIO0FBRTlHLDhCQUZBLDJCQUFtQixDQUVBO0FBQWtDLDZCQUZBLDBCQUFrQixDQUVBO0FBQ2hGLHFEQUFrRjtBQUtsRiwrQkFBZ0M7QUFDaEMsd0NBQTZDO0FBQzdDLG1EQUFvRDtBQUNwRCxvQ0FBcUM7QUFDckMscURBQTREO0FBRTVELG1DQUFtQztBQUNuQywwQ0FBMkM7QUFRbEMsd0JBQU07QUFQZixrQ0FBeUQ7QUFLekQsTUFBTSxDQUFDLEVBQUUsQ0FBQyxNQUFNLEdBQUcsY0FBYyxPQUFPLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQU01QyxRQUFBLFlBQVksR0FBRyxNQUFNLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0FBRWhELE1BQWEsU0FBUztJQU9yQixZQUFZLE9BQTJCLEVBQUUsR0FBRyxJQUFJO1FBRS9DLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUNmO1lBQ0MsTUFBTSxJQUFJLGNBQWMsQ0FBQyxlQUFlLENBQUMsQ0FBQztTQUMxQztRQUVELElBQUksQ0FBQyxXQUFXLEdBQUcsT0FBTyxDQUFDO1FBQzNCLElBQUksQ0FBQyxXQUFXLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsR0FBRyxJQUFJLE9BQU8sQ0FBQyxHQUFHLEVBQUUsQ0FBQztRQUU3RCxDQUFDLElBQUksQ0FBQyxlQUFlLEVBQUUsSUFBSSxDQUFDLFdBQVcsQ0FBQyxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLFdB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QUMsRUFoSmdCLFNBQVMsR0FBVCxpQkFBUyxLQUFULGlCQUFTLFFBZ0p6QjtBQU9ELFNBQWdCLGdCQUFnQjtJQUUvQixPQUFPLENBQUMsV0FBYyxFQUFFLEVBQUUsR0FBRSxDQUFDLENBQUE7QUFDOUIsQ0FBQztBQUhELDRDQUdDO0FBRUQsa0JBQWUsU0FBUyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDcmVhdGVkIGJ5IHVzZXIgb24gMjAxOC8yLzEwLzAxMC5cbiAqL1xuXG5pbXBvcnQgYmx1ZWJpcmREZWNvcmF0b3IgZnJvbSAnLi4vZGVjb3JhdG9yL2JsdWViaXJkJztcbi8vaW1wb3J0IGJsdWViaXJkRGVjb3JhdG9yIGZyb20gJ2JsdWViaXJkLWRlY29yYXRvcic7XG5cbmltcG9ydCBQcm9taXNlQmx1ZWJpcmQgPSByZXF1aXJlKCdibHVlYmlyZCcpO1xuaW1wb3J0IHsgVVJMIH0gZnJvbSAnanNkb20tdXJsJztcbmltcG9ydCBwYXRoID0gcmVxdWlyZSgndXBhdGgyJyk7XG5cbmltcG9ydCByb290UGF0aCBmcm9tIFwiLi4vLi4vX3Jvb3RcIjtcbmltcG9ydCB7IHJldHJ5UmVxdWVzdCB9IGZyb20gJy4uL2ZldGNoJztcblxuaW1wb3J0IHsgZGVmYXVsdEpTRE9NT3B0aW9ucywgSUZyb21VcmxPcHRpb25zLCBJT3B0aW9uc0pTRE9NLCBjcmVhdGVPcHRpb25zSlNET00sIElOb3ZlbE9wdGlvbnNKU0RPTSB9IGZyb20gJy4uL2pzZG9tJztcblxuZXhwb3J0IHsgZGVmYXVsdEpTRE9NT3B0aW9ucywgSUZyb21VcmxPcHRpb25zLCBJT3B0aW9uc0pTRE9NLCBjcmVhdGVPcHRpb25zSlNET00gfVxuaW1wb3J0IG5vdmVsSW5mbywgeyBJTWRjb25mTWV0YSwgX2hhbmRsZURhdGFGb3JTdHJpbmdpZnkgfSBmcm9tICdub2RlLW5vdmVsLWluZm8nO1xuXG5leHBvcnQgeyBJTWRjb25mTWV0YSB9XG5pbXBvcnQgeyBMYXp5Q29va2llLCBMYXp5Q29va2llSmFyIH0gZnJvbSAnanNkb20tZXh0cmEnO1xuXG5pbXBvcnQgZnMgPSByZXF1aXJlKCdmcy1leHRyYScpO1xuaW1wb3J0IHsgdHJpbUZpbGVuYW1lIH0gZnJvbSAnZnMtaWNvbnYvdXRpbCc7XG5pbXBvcnQgeyBjcmxmLCBDUkxGLCBSX0NSTEYgfSBmcm9tICdjcmxmLW5vcm1hbGl6ZSc7XG5pbXBvcnQgU3RyVXRpbCA9IHJlcXVpcmUoJ3N0ci11dGlsJyk7XG5pbXBvcnQgeyBFbnVtTm92ZWxTdGF0dXMgfSBmcm9tICdub2RlLW5vdmVsLWluZm8vbGliL2NvbnN0JztcblxuLy9pbXBvcnQgKiBhcyBtb21lbnQgZnJvbSAnbW9tZW50JztcbmltcG9ydCBtb21lbnQgPSByZXF1aXJlKCdtb21lbnQtdGltZXpvbmUnKTtcbmltcG9ydCB7IF9maXhWb2x1bWVDaGFwdGVyTmFtZSwgaXNVbmRlZiB9IGZyb20gJy4uL3V0aWwnO1xuXG5pbXBvcnQgRXZlbnRFbWl0dGVyID0gcmVxdWlyZSgnZXZlbnRzJyk7XG5pbXBvcnQgeyBJRG93bmxvYWRPcHRpb25zIH0gZnJvbSAnLi9kZW1vL2Jhc2UnO1xuXG5tb21lbnQuZm4udG9KU09OID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gdGhpcy5mb3JtYXQoKTsgfTtcblxuZXhwb3J0IHsgbW9tZW50IH07XG5cbmV4cG9ydCB7IGJsdWViaXJkRGVjb3JhdG9yLCBQcm9taXNlQmx1ZWJpcmQgfVxuXG5leHBvcnQgY29uc3QgU1lNQk9MX0NBQ0hFID0gU3ltYm9sLmZvcignY2FjaGUnKTtcblxuZXhwb3J0IGNsYXNzIE5vdmVsU2l0ZSBpbXBsZW1lbnRzIE5vdmVsU2l0ZS5JTm92ZWxTaXRlXG57XG5cdHB1YmxpYyBzdGF0aWMgcmVhZG9ubHkgSURLRVk6IHN0cmluZyA9IG51bGw7XG5cblx0cHVibGljIFBBVEhfTk9WRUxfTUFJTjogc3RyaW5nO1xuXHRwdWJsaWMgb3B0aW9uc0luaXQ/OiBOb3ZlbFNpdGUuSU9wdGlvbnM7XG5cblx0Y29uc3RydWN0b3Iob3B0aW9uczogTm92ZWxTaXRlLklPcHRpb25zLCAuLi5hcmd2KVxuXHR7XG5cdFx0aWYgKCF0aGlzLklES0VZKVxuXHRcdHtcblx0XHRcdHRocm93IG5ldyBSZWZlcmVuY2VFcnJvcihgSURLRVkgaXMgbnVsbGApO1xuXHRcdH1cblxuXHRcdHRoaXMub3B0aW9uc0luaXQgPSBvcHRpb25zO1xuXHRcdHRoaXMub3B0aW9uc0luaXQuY3dkID0gdGhpcy5vcHRpb25zSW5pdC5jd2QgfHwgcHJvY2Vzcy5jd2QoKTtcblxuXHRcdFt0aGlzLlBBVEhfTk9WRUxfTUFJTiwgdGhpcy5vcHRpb25zSW5pdF0gPSB0aGlzLmdldE91dHB1dERpcih0aGlzLm9wdGlvbnNJbml0KTtcblxuXHRcdGlmICh0aGlzLm9wdGlvbnNJbml0LmRlYnVnTG9nKVxuXHRcdHtcblx0XHRcdGNvbnNvbGVEZWJ1Zy5lbmFibGVkID0gdHJ1ZTtcblx0XHR9XG5cdH1cblxuXHRzdGF0aWMgY3JlYXRlKG9wdGlvbnM6IE5vdmVsU2l0ZS5JT3B0aW9ucywgLi4uYXJndilcblx0e1xuXHRcdHJldHVybiBuZXcgdGhpcyhvcHRpb25zLCAuLi5hcmd2KTtcblx0fVxuXG5cdHN0YXRpYyBjaGVjayh1cmw6IHN0cmluZyB8IFVSTCB8IE5vdmVsU2l0ZS5JUGFyc2VVcmwsIG9wdGlvbnM/KTogYm9vbGVhblxuXHR7XG5cdFx0cmV0dXJuIGZhbHNlO1xuXHR9XG5cblx0c2Vzc2lvbjxUID0gTm92ZWxTaXRlLklPcHRpb25zUnVudGltZT4ob3B0aW9uc1J1bnRpbWU6IFQgJiBOb3ZlbFNpdGUuSU9wdGlvbnNSdW50aW1lLCB1cmw/OiBVUkwpXG5cdHtcblx0XHRvcHRpb25zUnVudGltZS5vcHRpb25zSlNET00gPSBjcmVhdGVPcHRpb25zSlNET00ob3B0aW9uc1J1bnRpbWUub3B0aW9uc0pTRE9NKTtcblxuXHRcdGlmICh1cmwpXG5cdFx0e1xuXHRcdFx0b3B0aW9uc1J1bnRpbWVbU1lNQk9MX0NBQ0hFXS51cmwgPSB1cmw7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblxuXHRkb3dubG9hZCh1cmw6IHN0cmluZyB8IFVSTCwgb3B0aW9ucz86IE5vdmVsU2l0ZS5JRG93bmxvYWRPcHRpb25zKTogUHJvbWlzZUJsdWViaXJkPE5vdmVsU2l0ZS5JTm92ZWw+XG5cdHtcblx0XHR0aHJvdyBuZXcgU3ludGF4RXJyb3IoYEZ1bmN0aW9uIG5vdCBpbXBsZW1lbnRlZGApO1xuXHR9XG5cblx0Z2V0X3ZvbHVtZV9saXN0PFQgPSBOb3ZlbFNpdGUuSU9wdGlvbnNSdW50aW1lPih1cmw6IHN0cmluZyB8IFVSTCxcblx0XHRvcHRpb25zUnVudGltZTogUGFydGlhbDxUICYgTm92ZWxTaXRlLklEb3dubG9hZE9wdGlvbnM+ID0ge30sXG5cdCk6IFByb21pc2U8Tm92ZWxTaXRlLklOb3ZlbD5cblx0e1xuXHRcdHRocm93IG5ldyBTeW50YXhFcnJvcihgRnVuY3Rpb24gbm90IGltcGxlbWVudGVkYCk7XG5cdH1cblxuXHRtYWtlVXJsKHVybG9iajogTm92ZWxTaXRlLklQYXJzZVVybCwgb3B0aW9ucz8pOiBVUkxcblx0e1xuXHRcdHRocm93IG5ldyBTeW50YXhFcnJvcihgRnVuY3Rpb24gbm90IGltcGxlbWVudGVkYCk7XG5cdH1cblxuXHRwYXJzZVVybCh1cmw6IFVSTCB8IHN0cmluZywgb3B0aW9ucz8pOiBOb3ZlbFNpdGUuSVBhcnNlVXJsXG5cdHtcblx0XHR0aHJvdyBuZXcgU3ludGF4RXJyb3IoYEZ1bmN0aW9uIG5vdCBpbXBsZW1lbnRlZGApO1xuXHR9XG5cblx0Z2V0U3RhdGljPFQgPSB0eXBlb2YgTm92ZWxTaXRlPigpOiBUXG5cdHtcblx0XHQvLyBAdHMtaWdub3JlXG5cdFx0cmV0dXJuIHRoaXMuX19wcm90b19fLmNvbnN0cnVjdG9yO1xuXHR9XG5cblx0Z2V0IElES0VZKCk6IHN0cmluZ1xuXHR7XG5cdFx0bGV0IGtleSA9IHRoaXMuZ2V0U3RhdGljKCkuSURLRVk7XG5cblx0XHRpZiAodHlwZW9mIGtleSAhPSAnc3RyaW5nJyB8fCAha2V5KVxuXHRcdHtcblx0XHRcdHRocm93IG5ldyBTeW50YXhFcnJvcihgSURLRVkgbm90IGltcGxlbWVudGVkYCk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIGtleTtcblx0fVxuXG5cdHByb3RlY3RlZCBfcGF0aE5vdmVsSUQ8TiBleHRlbmRzIE5vdmVsU2l0ZS5JTm92ZWwsIFQgZXh0ZW5kcyBOb3ZlbFNpdGUuSU9wdGlvbnNSdW50aW1lPihub3ZlbDogTiwgb3B0aW9uc1J1bnRpbWU6IFQpXG5cdHtcblx0XHRyZXR1cm4gbm92ZWwudXJsX2RhdGEubm92ZWxfaWQ7XG5cdH1cblxuXHRnZXRQYXRoTm92ZWw8TiBleHRlbmRzIE5vdmVsU2l0ZS5JTm92ZWwsIFQgZXh0ZW5kcyBOb3ZlbFNpdGUuSU9wdGlvbnNSdW50aW1lPihQQVRIX05PVkVMX01BSU46IHN0cmluZyxcblx0XHRub3ZlbDogTixcblx0XHRvcHRpb25zUnVudGltZTogVCxcblx0KVxuXHR7XG5cdFx0bGV0IG5hbWU6IHN0cmluZztcblxuXHRcdGxldCBub3ZlbF9pZCA9IHRoaXMuX3BhdGhOb3ZlbElEKG5vdmVsLCBvcHRpb25zUnVudGltZSk7XG5cblx0XHRpZiAob3B0aW9uc1J1bnRpbWUucGF0aE5vdmVsU3R5bGUpXG5cdFx0e1xuXHRcdFx0aWYgKG9wdGlvbnNSdW50aW1lLnBhdGhOb3ZlbFN0eWxlID09IE5vdmVsU2l0ZS5FbnVtUGF0aE5vdmVsU3R5bGUuTk9WRUxJRClcblx0XHRcdHtcblx0XHRcdFx0bmFtZSA9IG5vdmVsX2lkO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdGlmIChuYW1lID09IG51bGwpXG5cdFx0e1xuXHRcdFx0bmFtZSA9IGAke3RoaXMudHJpbUZpbGVuYW1lTm92ZWwobm92ZWwubm92ZWxfdGl0bGUpfV8oJHtub3ZlbF9pZH0pYFxuXHRcdH1cblxuXHRcdHJldHVybiBwYXRoLmpvaW4oUEFUSF9OT1ZFTF9NQUlOLCBuYW1lKTtcblx0fVxuXG5cdC8qKlxuXHQgKiDlpoLmnpzlt7LntpPkuIvovInpgY4g5YmH6Kmm5ZyW5b6eIFJFQURNRS5tZCDlhaforoDlj5bnvLrmvI/nmoTkuIvovInoqK3lrppcblx0ICpcblx0ICogQHByaXZhdGVcblx0ICovXG5cdF9sb2FkRXhpc3RzQ29uZjxULCBOIGV4dGVuZHMgTm92ZWxTaXRlLklOb3ZlbD4oaW5wdXRVcmwsIG9wdGlvbnNSdW50aW1lOiBULCBub3ZlbDogTiwgcGF0aF9ub3ZlbDogc3RyaW5nKVxuXHR7XG5cdFx0bGV0IGZpbGUgPSBwYXRoLnJlc29sdmUocGF0aF9ub3ZlbCwgJ1JFQURNRS5tZCcpO1xuXG5cdFx0aWYgKGZzLnBhdGhFeGlzdHNTeW5jKGZpbGUpKVxuXHRcdHtcblx0XHRcdGxldCBtZCA9IGZzLnJlYWRGaWxlU3luYyhmaWxlKS50b1N0cmluZygpO1xuXG5cdFx0XHRsZXQgY29uZiA9IG5vdmVsSW5mby5wYXJzZShtZCwge1xuXHRcdFx0XHRsb3dDaGVja0xldmVsOiB0cnVlLFxuXHRcdFx0XHR0aHJvdzogZmFsc2UsXG5cdFx0XHR9KTtcblxuXHRcdFx0aWYgKGNvbmYgJiYgY29uZi5vcHRpb25zKVxuXHRcdFx0e1xuXHRcdFx0XHRpZiAoY29uZi5vcHRpb25zLmRvd25sb2FkT3B0aW9ucyB8fCBjb25mLm9wdGlvbnMuZG93bmxvYWRvcHRpb25zKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0Ly9jb25zb2xlLmxvZygn6LyJ5YWl5bey5a2Y5Zyo55qE6Kit5a6aJywgY29uZi5vcHRpb25zLmRvd25sb2FkT3B0aW9ucyk7XG5cblx0XHRcdFx0XHRPYmplY3QuZW50cmllcyhjb25mLm9wdGlvbnMuZG93bmxvYWRPcHRpb25zIHx8IGNvbmYub3B0aW9ucy5kb3dubG9hZG9wdGlvbnMpXG5cdFx0XHRcdFx0XHQuZm9yRWFjaChmdW5jdGlvbiAoW2ssIHZdKVxuXHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRpZiAob3B0aW9uc1J1bnRpbWVba10gPT0gbnVsbClcblx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdG9wdGlvbnNSdW50aW1lW2tdID0gdjtcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0fSlcblx0XHRcdFx0XHQ7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdH1cblxuXHRnZXRPdXRwdXREaXI8VD4ob3B0aW9ucz86IFQgJiBOb3ZlbFNpdGUuSU9wdGlvbnMsIG5vdmVsTmFtZT86IHN0cmluZyk6IFtzdHJpbmcsIFQgJiBOb3ZlbFNpdGUuSU9wdGlvbnNdXG5cdHtcblx0XHRvcHRpb25zID0gT2JqZWN0LmFzc2lnbih7fSwgdGhpcy5vcHRpb25zSW5pdCwgb3B0aW9ucyk7XG5cblx0XHRpZiAoIW9wdGlvbnMub3V0cHV0RGlyKVxuXHRcdHtcblx0XHRcdHRocm93IG5ldyBSZWZlcmVuY2VFcnJvcihgb3B0aW9uczogb3V0cHV0RGlyIGlzIG5vdCBzZXRgKTtcblx0XHR9XG5cblx0XHRsZXQgcCA9IHBhdGguam9pbihvcHRpb25zLm91dHB1dERpciwgb3B0aW9ucy5kaXNhYmxlT3V0cHV0RGlyUHJlZml4ID8gJycgOiB0aGlzLklES0VZKTtcblxuXHRcdGlmICghcGF0aC5pc0Fic29sdXRlKHApKVxuXHRcdHtcblx0XHRcdHAgPSBwYXRoLmpvaW4ob3B0aW9ucy5jd2QsIHApO1xuXHRcdH1cblxuXHRcdHJvb3RQYXRoLmRpc2FibGVQYXRocy5jb25jYXQoX19kaXJuYW1lKS5mb3JFYWNoKGZ1bmN0aW9uIChkaXIpXG5cdFx0e1xuXHRcdFx0aWYgKHAuaW5kZXhPZihfX2Rpcm5hbWUpID09IDApXG5cdFx0XHR7XG5cdFx0XHRcdHRocm93IG5ldyBSZWZlcmVuY2VFcnJvcihgcGF0aCBub3QgYWxsb3cgXCIke3B9XCJgKVxuXHRcdFx0fVxuXHRcdH0pO1xuXG5cdFx0aWYgKHR5cGVvZiBub3ZlbE5hbWUgPT0gJ3N0cmluZycgfHwgbm92ZWxOYW1lKVxuXHRcdHtcblx0XHRcdGlmICghbm92ZWxOYW1lKVxuXHRcdFx0e1xuXHRcdFx0XHR0aHJvdyBuZXcgUmVmZXJlbmNlRXJyb3IoKTtcblx0XHRcdH1cblxuXHRcdFx0cCA9IHBhdGguam9pbihwLCBub3ZlbE5hbWUpO1xuXHRcdH1cblxuXHRcdG9wdGlvbnMgPSB0aGlzLl9maXhPcHRpb25zUnVudGltZShvcHRpb25zKTtcblxuXHRcdHJldHVybiBbcCwgb3B0aW9uc107XG5cdH1cblxuXHRwcm90ZWN0ZWQgX2ZpeE9wdGlvbnNSdW50aW1lPFQgPSBOb3ZlbFNpdGUuSU9wdGlvbnNSdW50aW1lPihvcHRpb25zUnVudGltZTogVCAmIE5vdmVsU2l0ZS5JT3B0aW9uc1J1bnRpbWUpOiBUICYgTm92ZWxTaXRlLklPcHRpb25zUnVudGltZVxuXHR7XG5cdFx0b3B0aW9uc1J1bnRpbWVbU1lNQk9MX0NBQ0hFXSA9IChvcHRpb25zUnVudGltZVtTWU1CT0xfQ0FDSEVdIHx8IHt9KSBhcyB7XG5cdFx0XHR1cmw/OiBVUkwsXG5cdFx0XHRwYXRoX25vdmVsPzogc3RyaW5nLFxuXHRcdFx0bm92ZWw/OiBOb3ZlbFNpdGUuSU5vdmVsLFxuXHRcdH07XG5cblx0XHRvcHRpb25zUnVudGltZS5zdGFydEluZGV4ID0gb3B0aW9uc1J1bnRpbWUuc3RhcnRJbmRleCB8fCAwO1xuXG5cdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdG9wdGlvbnNSdW50aW1lLm9wdGlvbnNKU0RPTSA9IGNyZWF0ZU9wdGlvbnNKU0RPTShvcHRpb25zUnVudGltZS5vcHRpb25zSlNET00pO1xuXG5cblx0XHRpZiAob3B0aW9uc1J1bnRpbWUuZGVidWdMb2cgIT0gbnVsbClcblx0XHR7XG5cdFx0XHRvcHRpb25zUnVudGltZS5kZWJ1Z0xvZyA9ICEhb3B0aW9uc1J1bnRpbWUuZGVidWdMb2c7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIG9wdGlvbnNSdW50aW1lO1xuXHR9XG5cblx0dHJpbUZpbGVuYW1lQ2hhcHRlcihuYW1lKTogc3RyaW5nXG5cdHtcblx0XHRyZXR1cm4gdGhpcy50cmltRmlsZW5hbWUobmFtZSk7XG5cdH1cblxuXHR0cmltRmlsZW5hbWVWb2x1bWUobmFtZSk6IHN0cmluZ1xuXHR7XG5cdFx0cmV0dXJuIHRoaXMudHJpbUZpbGVuYW1lKG5hbWUpO1xuXHR9XG5cblx0dHJpbUZpbGVuYW1lTm92ZWwobmFtZSk6IHN0cmluZ1xuXHR7XG5cdFx0cmV0dXJuIHRoaXMudHJpbUZpbGVuYW1lKG5hbWUpO1xuXHR9XG5cblx0dHJpbUZpbGVuYW1lKG5hbWUpOiBzdHJpbmdcblx0e1xuXHRcdHJldHVybiB0cmltRmlsZW5hbWUoX2ZpeFZvbHVtZUNoYXB0ZXJOYW1lKG5hbWUpKTtcblx0fVxuXG5cdHRyaW1UYWcodGFnKTogc3RyaW5nXG5cdHtcblx0XHRyZXR1cm4gKHRhZyBhcyBzdHJpbmcpXG5cdFx0XHQucmVwbGFjZSgvW1xcW1xcXVxcL1xcXFxdL2csIChzKSA9PlxuXHRcdFx0e1xuXHRcdFx0XHRyZXR1cm4gU3RyVXRpbC50b0Z1bGxXaWR0aChzKVxuXHRcdFx0fSlcblx0XHRcdDtcblx0fVxuXG5cdHByb3RlY3RlZCBfZXhwb3J0RG93bmxvYWRPcHRpb25zKG9wdGlvbnNSdW50aW1lPzogSU9wdGlvbnNSdW50aW1lKTogdW5rbm93blxuXHR7XG5cdFx0cmV0dXJuIHZvaWQgKDApO1xuXHR9XG5cblx0cHJvdGVjdGVkIF9oYW5kbGVEYXRhRm9yU3RyaW5naWZ5KC4uLmFyZ3YpOiBJTWRjb25mTWV0YVxuXHR7XG5cdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdGxldCBtZGNvbmY6IElNZGNvbmZNZXRhID0gX2hhbmRsZURhdGFGb3JTdHJpbmdpZnkoLi4uYXJndik7XG5cblx0XHRpZiAobWRjb25mLm5vdmVsKVxuXHRcdHtcblx0XHRcdGlmIChtZGNvbmYubm92ZWwudGFncyAmJiBBcnJheS5pc0FycmF5KG1kY29uZi5ub3ZlbC50YWdzKSlcblx0XHRcdHtcblx0XHRcdFx0bGV0IGJvb2w6IGJvb2xlYW47XG5cblx0XHRcdFx0Ym9vbCA9IFtcblx0XHRcdFx0XHQn5pu457GN5YyWJyxcblx0XHRcdFx0XHQn5Lmm57GN5YyWJyxcblx0XHRcdFx0XHQn5paH5bqr5YyWJyxcblx0XHRcdFx0XHQn5paH5bqT5YyWJyxcblx0XHRcdFx0XS5zb21lKHYgPT5cblx0XHRcdFx0e1xuXHRcdFx0XHRcdHJldHVybiBtZGNvbmYubm92ZWwudGFncy5pbmNsdWRlcyh2KVxuXHRcdFx0XHR9KTtcblxuXHRcdFx0XHRpZiAoYm9vbClcblx0XHRcdFx0e1xuXHRcdFx0XHRcdG1kY29uZi5ub3ZlbC5ub3ZlbF9zdGF0dXMgPSAobWRjb25mLm5vdmVsLm5vdmVsX3N0YXR1cyB8IDApIHwgRW51bU5vdmVsU3RhdHVzLlBfQk9PSztcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHJldHVybiBtZGNvbmY7XG5cdH1cblxuXHRwcm90ZWN0ZWQgX3NhdmVSZWFkbWUob3B0aW9uc1J1bnRpbWU/OiBJT3B0aW9uc1J1bnRpbWUsIG9wdGlvbnMgPSB7fSwgLi4ub3B0cylcblx0e1xuXHRcdGNvbnN0IHNlbGYgPSB0aGlzO1xuXG5cdFx0aWYgKGlzVW5kZWYob3B0aW9uc1J1bnRpbWUpXG5cdFx0XHR8fCBpc1VuZGVmKG9wdGlvbnNSdW50aW1lW1NZTUJPTF9DQUNIRV0sIHt9KVxuXG5cdFx0XHR8fCBpc1VuZGVmKG9wdGlvbnNSdW50aW1lW1NZTUJPTF9DQUNIRV0ubm92ZWwsIHt9KVxuXHRcdFx0fHwgaXNVbmRlZihvcHRpb25zUnVudGltZVtTWU1CT0xfQ0FDSEVdLnBhdGhfbm92ZWwsICcnKVxuXHRcdClcblx0XHR7XG5cdFx0XHR0aHJvdyBuZXcgUmVmZXJlbmNlRXJyb3IoYHNhdmVSZWFkbWVgKTtcblx0XHR9XG5cblx0XHRjb25zdCBub3ZlbCA9IG9wdGlvbnNSdW50aW1lW1NZTUJPTF9DQUNIRV0ubm92ZWw7XG5cdFx0Y29uc3QgcGF0aF9ub3ZlbCA9IG9wdGlvbnNSdW50aW1lW1NZTUJPTF9DQUNIRV0ucGF0aF9ub3ZlbDtcblxuXHRcdGxldCBtZGNvbmZpZyA9IHRoaXMuX2hhbmRsZURhdGFGb3JTdHJpbmdpZnkoe1xuXHRcdFx0bm92ZWw6IHtcblx0XHRcdFx0aWxsdXN0OiAnJyxcblx0XHRcdFx0dGl0bGVfemgxOiAnJyxcblx0XHRcdFx0aWxsdXN0czogW10sXG5cdFx0XHRcdHB1Ymxpc2hlcnM6IFtcblx0XHRcdFx0XHRzZWxmLklES0VZLFxuXHRcdFx0XHRdLFxuXHRcdFx0XHR0YWdzOiBbXG5cdFx0XHRcdFx0c2VsZi5JREtFWSxcblx0XHRcdFx0XSxcblx0XHRcdFx0c2VyaWVzOiB7XG5cdFx0XHRcdFx0bmFtZTogbm92ZWwubm92ZWxfc2VyaWVzX3RpdGxlIHx8IG5vdmVsLm5vdmVsX3RpdGxlIHx8ICcnLFxuXHRcdFx0XHR9LFxuXHRcdFx0XHRub3ZlbF9zdGF0dXM6IDAsXG5cdFx0XHR9LFxuXHRcdFx0b3B0aW9ucyxcblxuXHRcdFx0bGluazogbm92ZWwubGluayB8fCBbXSxcblx0XHR9LCBub3ZlbCwgLi4ub3B0cyk7XG5cblx0XHRsZXQgbWQgPSBub3ZlbEluZm8uc3RyaW5naWZ5KG1kY29uZmlnKTtcblxuXHRcdGxldCBmaWxlID0gcGF0aC5qb2luKHBhdGhfbm92ZWwsIGBSRUFETUUubWRgKTtcblxuXHRcdHJldHVybiBmcy5vdXRwdXRGaWxlKGZpbGUsIG1kKVxuXHRcdFx0LnRoZW4oZnVuY3Rpb24gKClcblx0XHRcdHtcblx0XHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0XHRmaWxlLFxuXHRcdFx0XHRcdG1kLFxuXHRcdFx0XHR9O1xuXHRcdFx0fSlcblx0XHRcdDtcblx0fVxuXG5cdGNyZWF0ZU1haW5VcmwodXJsOiBzdHJpbmcpOiBVUkxcblx0Y3JlYXRlTWFpblVybCh1cmw6IFVSTCk6IFVSTFxuXHRjcmVhdGVNYWluVXJsKHVybClcblx0e1xuXHRcdGxldCBkYXRhID0gdGhpcy5wYXJzZVVybCh1cmwpO1xuXG5cdFx0aWYgKCFkYXRhIHx8ICFkYXRhLm5vdmVsX2lkKVxuXHRcdHtcblx0XHRcdC8vY29uc29sZS5sb2coZGF0YSk7XG5cblx0XHRcdHRocm93IG5ldyBSZWZlcmVuY2VFcnJvcigpO1xuXHRcdH1cblxuXHRcdHJldHVybiB0aGlzLm1ha2VVcmwoZGF0YSwgdHJ1ZSk7XG5cdH1cblxuXHRwcm90ZWN0ZWQgX2NyZWF0ZUNoYXB0ZXJVcmw8VCA9IElPcHRpb25zUnVudGltZT4oe1xuXHRcdG5vdmVsLFxuXHRcdHZvbHVtZSxcblx0XHRjaGFwdGVyLFxuXHR9OiB7XG5cdFx0bm92ZWw6IE5vdmVsU2l0ZS5JTm92ZWwsXG5cdFx0dm9sdW1lOiBOb3ZlbFNpdGUuSVZvbHVtZSxcblx0XHRjaGFwdGVyOiBOb3ZlbFNpdGUuSUNoYXB0ZXIsXG5cdH0sIG9wdGlvbnNSdW50aW1lPzogVCAmIElPcHRpb25zUnVudGltZSk6IFVSTFxuXHR7XG5cdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdHJldHVybiBuZXcgVVJMKGNoYXB0ZXIuY2hhcHRlcl91cmwpO1xuXHR9XG5cblx0cHJvdGVjdGVkIF9mZXRjaENoYXB0ZXI8VD4odXJsOiBVUkwsIG9wdGlvbnNSdW50aW1lOiBUICYgSU9wdGlvbnNSdW50aW1lKVxuXHR7XG5cdFx0dGhyb3cgbmV3IFN5bnRheEVycm9yKGBGdW5jdGlvbiBub3QgaW1wbGVtZW50ZWRgKTtcblx0fVxuXG5cdHByb3RlY3RlZCBfcGFyc2VDaGFwdGVyPFQ+KGRvbSwgb3B0aW9uc1J1bnRpbWU6IFQgJiBJT3B0aW9uc1J1bnRpbWUsIGNhY2hlOiB7XG5cdFx0ZmlsZTogc3RyaW5nLFxuXHRcdG5vdmVsOiBOb3ZlbFNpdGUuSU5vdmVsLFxuXHRcdHZvbHVtZTogTm92ZWxTaXRlLklWb2x1bWUsXG5cdFx0Y2hhcHRlcjogTm92ZWxTaXRlLklDaGFwdGVyLFxuXHR9KVxuXHR7XG5cdFx0dGhyb3cgbmV3IFN5bnRheEVycm9yKGBGdW5jdGlvbiBub3QgaW1wbGVtZW50ZWRgKTtcblx0fVxuXG5cdGdldEV4dHJhSW5mbzxULCBNIGV4dGVuZHMgUGFydGlhbDxJTm92ZWwgJiBJTWRjb25mTWV0YT4sIEMgZXh0ZW5kcyB1bmtub3duPih1cmxvYmo6IE5vdmVsU2l0ZS5JUGFyc2VVcmwsXG5cdFx0b3B0aW9uc1J1bnRpbWU6IFQgJiBJT3B0aW9uc1J1bnRpbWUsXG5cdFx0ZGF0YV9tZXRhPzogTSxcblx0XHRjYWNoZT86IEMsXG5cdCk6IFByb21pc2VCbHVlYmlyZDxNPlxuXHR7XG5cdFx0dGhyb3cgbmV3IFN5bnRheEVycm9yKGBGdW5jdGlvbiBub3QgaW1wbGVtZW50ZWRgKTtcblx0fVxuXG5cdHByb3RlY3RlZCBfY2hlY2tFeGlzdHMob3B0aW9uc1J1bnRpbWU6IElPcHRpb25zUnVudGltZSwgZmlsZTogc3RyaW5nKTogYm9vbGVhblxuXHR7XG5cdFx0aWYgKCFvcHRpb25zUnVudGltZS5kaXNhYmxlQ2hlY2tFeGlzdHMgJiYgZnMuZXhpc3RzU3luYyhmaWxlKSlcblx0XHR7XG5cdFx0XHRsZXQgdHh0ID0gZnMucmVhZEZpbGVTeW5jKGZpbGUpO1xuXG5cdFx0XHRpZiAodHh0LnRvU3RyaW5nKCkucmVwbGFjZSgvXlxccyt8XFxzKyQvZywgJycpKVxuXHRcdFx0e1xuXHRcdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHRyZXR1cm4gZmFsc2Vcblx0fVxuXG5cdHByb3RlY3RlZCBlbWl0KGV2ZW50OiBFdmVudEVtaXR0ZXIsIGV2ZW50TmFtZTogc3RyaW5nLCAuLi5hcmd2KVxuXHR7XG5cdFx0bGV0IGJvb2wgPSBldmVudC5lbWl0KGV2ZW50TmFtZSwgdGhpcywgLi4uYXJndik7XG5cdFx0cmV0dXJuIFtldmVudCwgYm9vbF07XG5cdH1cblxuXHRfc2F2ZUZpbGU8VCA9IE5vdmVsU2l0ZS5JT3B0aW9uc1J1bnRpbWU+KG9wdHM6IHtcblx0XHRmaWxlOiBzdHJpbmcsXG5cdFx0Y29udGV4dDogc3RyaW5nIHwgQnVmZmVyLFxuXHRcdG9wdGlvbnNSdW50aW1lOiBUICYgTm92ZWxTaXRlLklPcHRpb25zUnVudGltZSxcblx0fSlcblx0e1xuXHRcdHJldHVybiBQcm9taXNlQmx1ZWJpcmQucmVzb2x2ZSgpXG5cdFx0XHQuYmluZCh0aGlzKVxuXHRcdFx0LnRoZW4oKCkgPT4ge1xuXHRcdFx0XHRsZXQgeyBmaWxlLCBjb250ZXh0LCBvcHRpb25zUnVudGltZSB9ID0gb3B0cztcblxuXHRcdFx0XHRpZiAob3B0aW9uc1J1bnRpbWUubGluZUJyZWFrQ3JsZilcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGxldCB0eHQxID0gY29udGV4dC50b1N0cmluZygpO1xuXG5cdFx0XHRcdFx0aWYgKFJfQ1JMRi50ZXN0KHR4dDEpKVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdGxldCB0eHQyID0gY3JsZih0eHQxLCBDUkxGKTtcblxuXHRcdFx0XHRcdFx0aWYgKHR4dDEgIT09IHR4dDIpXG5cdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdGNvbnRleHQgPSB0eHQyO1xuXHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHR0eHQxID0gbnVsbDtcblx0XHRcdFx0XHRcdHR4dDIgPSBudWxsO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXG5cdFx0XHRcdGlmIChvcHRpb25zUnVudGltZS5kZWJ1Z0xvZylcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGxldCBmaWxlMiA9IHBhdGgucmVsYXRpdmUob3B0aW9uc1J1bnRpbWUub3V0cHV0RGlyLCBmaWxlKVxuXG5cdFx0XHRcdFx0Y29uc29sZURlYnVnLmxvZyhgc2F2ZWAsIGZpbGUyKTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdHJldHVybiBmcy5vdXRwdXRGaWxlKGZpbGUsIGNvbnRleHQpXG5cdFx0XHR9KVxuXHRcdDtcblx0fVxuXG59XG5cbmV4cG9ydCBpbXBvcnQgSU9wdGlvbnNSdW50aW1lID0gTm92ZWxTaXRlLklPcHRpb25zUnVudGltZTtcbmV4cG9ydCBpbXBvcnQgSVZvbHVtZSA9IE5vdmVsU2l0ZS5JVm9sdW1lO1xuZXhwb3J0IGltcG9ydCBJQ2hhcHRlciA9IE5vdmVsU2l0ZS5JQ2hhcHRlcjtcbmV4cG9ydCBpbXBvcnQgRW51bVBhdGhOb3ZlbFN0eWxlID0gTm92ZWxTaXRlLkVudW1QYXRoTm92ZWxTdHlsZTtcbmltcG9ydCB7IElOb3ZlbCB9IGZyb20gJy4vc3lvc2V0dSc7XG5pbXBvcnQgeyBjb25zb2xlRGVidWcgfSBmcm9tICcuLi91dGlsL2xvZyc7XG5cbmV4cG9ydCBuYW1lc3BhY2UgTm92ZWxTaXRlXG57XG5cdGV4cG9ydCB0eXBlIElPcHRpb25zUGx1cyA9IHtcblxuXHRcdGRpc2FibGVPdXRwdXREaXJQcmVmaXg/OiBib29sZWFuLFxuXG5cdFx0bm9EaXJQcmVmaXg/OiBib29sZWFuLFxuXHRcdG5vRGlyUGFkZW5kPzogYm9vbGVhbixcblxuXHRcdG5vRmlyZVByZWZpeD86IGJvb2xlYW4sXG5cdFx0bm9GaWxlUGFkZW5kPzogYm9vbGVhbixcblxuXHRcdHJldHJ5RGVsYXk/OiBudW1iZXIsXG5cdFx0c3RhcnRJbmRleD86IG51bWJlcixcblxuXHRcdGZpbGVQcmVmaXhNb2RlPzogbnVtYmVyLFxuXG5cdFx0YWxsb3dFbXB0eVZvbHVtZVRpdGxlPzogYm9vbGVhbixcblxuXHRcdGV2ZW50PzogRXZlbnRFbWl0dGVyLFxuXG5cdFx0LyoqXG5cdFx0ICog55So5L6G55m75YWl56uZ6bue55qEIGNvb2tpZXMgc2Vzc2lvblxuXHRcdCAqL1xuXHRcdHNlc3Npb25EYXRhPzoge1xuXHRcdFx0W2tleTogc3RyaW5nXTogYW55LFxuXHRcdH0sXG5cblx0XHQvKipcblx0XHQgKiDlj6rmipPlj5blsI/oqqrnmoQgTUVUQSDos4fmlplcblx0XHQgKi9cblx0XHRmZXRjaE1ldGFEYXRhT25seT86IGJvb2xlYW4sXG5cblx0XHRkZWJ1Z0xvZz86IGJvb2xlYW4sXG5cblx0XHRsaW5lQnJlYWtDcmxmPzogYm9vbGVhbixcblx0fVxuXG5cdGV4cG9ydCB0eXBlIElPcHRpb25zID0ge1xuXG5cdFx0b3V0cHV0RGlyPzogc3RyaW5nLFxuXHRcdGN3ZD86IHN0cmluZyxcblxuXHR9ICYgSU9wdGlvbnNQbHVzO1xuXG5cdGV4cG9ydCBjb25zdCBlbnVtIEVudW1QYXRoTm92ZWxTdHlsZVxuXHR7XG5cdFx0REVGQVVMVCA9IDAsXG5cdFx0Tk9WRUxJRCA9IDEsXG5cdH1cblxuXHRleHBvcnQgdHlwZSBJRG93bmxvYWRPcHRpb25zID0ge1xuXG5cdFx0LyoqXG5cdFx0ICog5Y+q55Si55Sf55uu6YyE57WQ5qeLIOS4jeS4i+i8ieWFp+WuuVxuXHRcdCAqL1xuXHRcdGRpc2FibGVEb3dubG9hZD86IGJvb2xlYW4sXG5cdFx0ZGlzYWJsZUNoZWNrRXhpc3RzPzogYm9vbGVhbixcblxuXHRcdG9wdGlvbnNKU0RPTT86IElGcm9tVXJsT3B0aW9ucyAmIElPcHRpb25zSlNET00gJiB7XG5cdFx0XHRjb29raWVKYXI/OiBQYXJ0aWFsPExhenlDb29raWVKYXI+LFxuXHRcdH0sXG5cblx0XHQvKipcblx0XHQgKiDoqK3lrprlsI/oqqros4fmlpnlpL7mqKPlvI9cblx0XHQgKi9cblx0XHRwYXRoTm92ZWxTdHlsZT86IEVudW1QYXRoTm92ZWxTdHlsZSxcblxuXHR9ICYgSU9wdGlvbnNQbHVzO1xuXG5cdGV4cG9ydCB0eXBlIElPcHRpb25zUnVudGltZSA9IElPcHRpb25zICYgSURvd25sb2FkT3B0aW9ucyAmIElPcHRpb25zUGx1cztcblxuXHRleHBvcnQgaW50ZXJmYWNlIElQYXJzZVVybFxuXHR7XG5cdFx0dXJsPzogVVJMIHwgc3RyaW5nLFxuXG5cdFx0bm92ZWxfcGlkPyxcblx0XHRub3ZlbF9pZD8sXG5cdFx0Y2hhcHRlcl9pZD8sXG5cblx0XHRub3ZlbF9yMTg/LFxuXG5cdFx0W2tleTogc3RyaW5nXTogYW55LFxuXHR9XG5cblx0ZXhwb3J0IGludGVyZmFjZSBJQ2hhcHRlclxuXHR7XG5cdFx0Y2hhcHRlcl9pbmRleD86IG51bWJlciB8IHN0cmluZyxcblx0XHRjaGFwdGVyX3RpdGxlOiBzdHJpbmcsXG5cdFx0Y2hhcHRlcl9pZD9cblx0XHRjaGFwdGVyX3VybD9cblx0XHRjaGFwdGVyX3VybF9kYXRhP1xuXHRcdGNoYXB0ZXJfZGF0ZT86IG1vbWVudC5Nb21lbnQsXG5cblx0XHRpbWdzPzogc3RyaW5nW10sXG5cblx0XHRba2V5OiBzdHJpbmddOiBhbnksXG5cdH1cblxuXHRleHBvcnQgaW50ZXJmYWNlIElWb2x1bWVcblx0e1xuXHRcdHZvbHVtZV9pbmRleD9cblx0XHR2b2x1bWVfdGl0bGU6IHN0cmluZyxcblx0XHRjaGFwdGVyX2xpc3Q/OiBJQ2hhcHRlcltdLFxuXG5cdFx0W2tleTogc3RyaW5nXTogYW55LFxuXHR9XG5cblx0ZXhwb3J0IGludGVyZmFjZSBJTm92ZWxcblx0e1xuXHRcdHVybDogVVJMIHwgc3RyaW5nLFxuXHRcdHVybF9kYXRhOiBJUGFyc2VVcmwsXG5cblx0XHRub3ZlbF90aXRsZTogc3RyaW5nLFxuXHRcdG5vdmVsX2F1dGhvcj86IHN0cmluZyxcblxuXHRcdG5vdmVsX2Rlc2M/OiBzdHJpbmcsXG5cdFx0bm92ZWxfZGF0ZT86IG1vbWVudC5Nb21lbnQsXG5cdFx0bm92ZWxfcHVibGlzaGVyPzogc3RyaW5nLFxuXG5cdFx0bm92ZWxfc2VyaWVzX3RpdGxlPzogc3RyaW5nLFxuXG5cdFx0dm9sdW1lX2xpc3Q6IElWb2x1bWVbXSxcblxuXHRcdGNoZWNrZGF0ZT86IG1vbWVudC5Nb21lbnQsXG5cblx0XHRpbWdzPzogc3RyaW5nW10sXG5cblx0XHRba2V5OiBzdHJpbmddOiBhbnksXG5cdH1cblxuXHRleHBvcnQgaW50ZXJmYWNlIElOb3ZlbFNpdGVTdGF0aWM8VD4gZXh0ZW5kcyBUeXBlPFQgJiBOb3ZlbFNpdGUuSU5vdmVsU2l0ZT5cblx0e1xuXHRcdElES0VZOiBzdHJpbmcsXG5cdH1cblxuXHRleHBvcnQgaW50ZXJmYWNlIElOb3ZlbFNpdGVcblx0e1xuXHRcdGRvd25sb2FkKHVybDogc3RyaW5nIHwgVVJMLCBvcHRpb25zPzogSURvd25sb2FkT3B0aW9ucyk6IFByb21pc2VCbHVlYmlyZDxOb3ZlbFNpdGUuSU5vdmVsPjtcblxuXHRcdG1ha2VVcmwodXJsb2JqOiBOb3ZlbFNpdGUuSVBhcnNlVXJsLCBvcHRpb25zPyk6IFVSTDtcblxuXHRcdHBhcnNlVXJsKHVybDogVVJMIHwgc3RyaW5nKTogTm92ZWxTaXRlLklQYXJzZVVybDtcblx0fVxufVxuXG5leHBvcnQgaW50ZXJmYWNlIFR5cGU8VD5cbntcblx0bmV3KG9wdGlvbnM6IE5vdmVsU2l0ZS5JT3B0aW9ucywgLi4uYXJnczogYW55W10pOiBUO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc3RhdGljSW1wbGVtZW50czxUPigpXG57XG5cdHJldHVybiAoY29uc3RydWN0b3I6IFQpID0+IHt9XG59XG5cbmV4cG9ydCBkZWZhdWx0IE5vdmVsU2l0ZTtcbiJdfQ==