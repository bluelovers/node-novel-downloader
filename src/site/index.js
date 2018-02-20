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
const path = require("path");
const _root_1 = require("../../_root");
const jsdom_extra_1 = require("jsdom-extra");
const fs_iconv_1 = require("fs-iconv");
//import * as moment from 'moment';
const moment = require("moment-timezone");
exports.moment = moment;
moment.fn.toJSON = function () { return this.format(); };
exports.SYMBOL_CACHE = Symbol.for('cache');
exports.defaultJSDOMOptions = {
    virtualConsole: new jsdom_extra_1.VirtualConsole,
    runScripts: 'dangerously',
    disableCheerio: true,
};
class NovelSite {
    constructor(options, ...argv) {
        this.optionsInit = options;
        this.optionsInit.cwd = this.optionsInit.cwd || process.cwd();
        [this.PATH_NOVEL_MAIN, this.optionsInit] = this.getOutputDir(this.optionsInit);
    }
    static create(options, ...argv) {
        return new this(options, ...argv);
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
        return [p, options];
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
        return fs_iconv_1.trimFilename(name);
    }
    static check(url, options) {
        return false;
    }
    download(url, options) {
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
        // @ts-ignore
        let key = this.getStatic().IDKEY;
        if (typeof key != 'string' || !key) {
            throw new SyntaxError(`IDKEY not implemented`);
        }
        return key;
    }
}
exports.NovelSite = NovelSite;
function staticImplements() {
    return (constructor) => { };
}
exports.staticImplements = staticImplements;
exports.default = NovelSite;
