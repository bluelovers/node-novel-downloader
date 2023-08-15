"use strict";
/**
 * Created by user on 2018/3/25/025.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.NovelSiteDemo = void 0;
const tslib_1 = require("tslib");
const index_1 = require("../index");
const base_1 = tslib_1.__importDefault(require("./base"));
let NovelSiteDemo = class NovelSiteDemo extends base_1.default {
    makeUrl(urlobj, ...argv) {
        throw new SyntaxError(`Function not implemented`);
    }
    parseUrl(url, ...argv) {
        throw new SyntaxError(`Function not implemented`);
    }
    _parseChapter(ret, optionsRuntime, _cache_) {
        if (!ret) {
            return '';
        }
        throw new SyntaxError(`Function not implemented`);
    }
    async get_volume_list(url, optionsRuntime = {}) {
        throw new SyntaxError(`Function not implemented`);
    }
};
exports.NovelSiteDemo = NovelSiteDemo;
NovelSiteDemo.IDKEY = '';
exports.NovelSiteDemo = NovelSiteDemo = tslib_1.__decorate([
    (0, index_1.staticImplements)()
], NovelSiteDemo);
exports.default = NovelSiteDemo;
//# sourceMappingURL=demo.js.map