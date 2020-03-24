"use strict";
/**
 * Created by user on 2018/3/25/025.
 */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NovelSiteDemo = void 0;
const index_1 = require("../index");
const base_1 = __importDefault(require("./base"));
let NovelSiteDemo = /** @class */ (() => {
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
    NovelSiteDemo.IDKEY = '';
    NovelSiteDemo = __decorate([
        index_1.staticImplements()
    ], NovelSiteDemo);
    return NovelSiteDemo;
})();
exports.NovelSiteDemo = NovelSiteDemo;
exports.default = NovelSiteDemo;
//# sourceMappingURL=demo.js.map