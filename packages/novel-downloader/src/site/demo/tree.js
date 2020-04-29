"use strict";
/**
 * Created by user on 2018/4/4/004.
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !exports.hasOwnProperty(p)) __createBinding(exports, m, p);
}
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NovelSite = exports.NovelSiteDemo = exports.NovelTree = void 0;
const base_1 = __importDefault(require("./base"));
const fs_1 = require("../fs");
const index_1 = require("../index");
const upath2_1 = __importDefault(require("upath2"));
const helper_1 = require("node-novel-globby/lib/helper");
const sort_1 = require("node-novel-globby/lib/sort");
//import { URL } from 'jsdom-url';
const utils_1 = require("js-tree-list2/src/utils");
const index_2 = require("../../tree/index");
Object.defineProperty(exports, "NovelTree", { enumerable: true, get: function () { return index_2.NovelTree; } });
let NovelSiteDemo = /** @class */ (() => {
    let NovelSiteDemo = class NovelSiteDemo extends base_1.default {
        getOutputDir(options, novelName) {
            const [PATH_NOVEL_MAIN, optionsRuntime] = super.getOutputDir(options, novelName);
            optionsRuntime.novelTree = new index_2.NovelTree();
            return [PATH_NOVEL_MAIN, optionsRuntime];
        }
        async _processNovelListName(novel, optionsRuntime, ...argv) {
            const self = this;
            let treeList = index_2.NovelTree.treeToList(novel.novelTree, true);
            //console.log(novel.novelTree.cache.depth);
            if (novel.novelTree.cache.depth > 2) {
                let bool = false;
                if (optionsRuntime.noDirPrefix && optionsRuntime.noFirePrefix) {
                    bool = true;
                }
                optionsRuntime.noDirPrefix = optionsRuntime.noFirePrefix = bool;
            }
            treeList
                .forEach(function (listRow) {
                let node = listRow[utils_1.SYMBOL_NODE];
                let value = node.value();
                if (typeof value.name == 'string') {
                    node.set('name', self.trimFilenameVolume(value.name));
                }
            });
            treeList
                .forEach(function (listRow) {
                let pnode = listRow[utils_1.SYMBOL_NODE];
                const ntype = pnode.get('type');
                const hasChild = pnode.size();
                const currentLevel = pnode.get('level');
                //console.log(currentLevel);
                //console.log(ntype);
                if (ntype != 'root') {
                    let name = pnode.get('name');
                    if (name === null) {
                        pnode.set('name', 'null');
                    }
                }
                if (hasChild && (0 && (currentLevel == 0 && !optionsRuntime.noDirPrefix)
                    || (currentLevel > 0 && !optionsRuntime.noFirePrefix)) && optionsRuntime.filePrefixMode >= 2) {
                    //console.log(777);
                    let bool;
                    let i = 0;
                    let last_val;
                    let ks = [];
                    for (let node of pnode.children) {
                        let name = node.get('name');
                        let name_val = helper_1.normalize_val(name);
                        node.set('name_val', name_val);
                        ks.push(name_val);
                        if (name === null || name == 'null') {
                            node.set('name', 'null');
                            node.set('name_val', 'null');
                            bool = true;
                            break;
                        }
                        if (i !== 0) {
                            let k = sort_1.defaultSortCallback(last_val, name_val);
                            if (typeof k != 'number' || k > -1) {
                                //console.log(k);
                                bool = true;
                                break;
                            }
                        }
                        i++;
                        last_val = name_val;
                    }
                    if (!bool) {
                        for (let node of pnode.children) {
                            if (index_2.NovelTree.isVolume(node)) {
                                node.value().volume_index = '';
                            }
                            else if (index_2.NovelTree.isChapter(node)) {
                                node.value().chapter_index = '';
                            }
                        }
                    }
                    else {
                    }
                }
                if (hasChild) {
                    pnode.children.forEach(function (node, idx) {
                        node.set('idx', idx);
                    });
                }
                if (hasChild) {
                    let dirname;
                    if (ntype == 'root') {
                        dirname = '';
                        pnode.set('dirname', dirname);
                    }
                    else {
                        let name = pnode.get('name');
                        let volume = pnode.value();
                        let vid = volume.idx;
                        let fake_chapter = {
                            chapter_index: volume.volume_index,
                            chapter_title: volume.volume_title,
                        };
                        /*
                        name = getVolumePath(self, {
                            volume,
                            vid,
                            path_novel: '',
                        }, optionsRuntime);
                        */
                        name = fs_1.getFilePath(self, {
                            chapter: fake_chapter, cid: vid,
                            ext: '',
                            idx: volume.total_idx + optionsRuntime.startIndex,
                            dirname: '~temp',
                            volume, vid,
                        }, optionsRuntime);
                        name = upath2_1.default.relative('~temp', name);
                        let ps = pnode.parent.get('dirname');
                        dirname = upath2_1.default.join(ps, name);
                        pnode.set('dirname', dirname);
                    }
                    //console.log(dirname);
                }
            });
            //process.exit();
            return treeList;
        }
        async _processNovel(novel, optionsRuntime, _cache_, ...argv) {
            const self = this;
            let { url, path_novel } = _cache_;
            let treeList = await self._processNovelListName(novel, optionsRuntime, _cache_, ...argv);
            //console.log(optionsRuntime);
            return index_1.PromiseBluebird
                .mapSeries(treeList.slice(1), async (listRow) => {
                let nodeChapter = listRow[utils_1.SYMBOL_NODE];
                let ntype = nodeChapter.get('type');
                if (ntype != 'chapter') {
                    if (ntype == 'volume') {
                        nodeChapter.set('name', self.trimFilenameVolume(nodeChapter.get('volume_title')));
                    }
                    return;
                }
                else {
                    nodeChapter.set('name', self.trimFilenameVolume(nodeChapter.get('chapter_title')));
                }
                let nodeVolume = nodeChapter.parent;
                let volume = nodeVolume.value();
                let chapter = nodeChapter.value();
                let dirname = volume.dirname;
                let cid = chapter.idx;
                let vid = volume.idx;
                const current_idx = chapter.total_idx + optionsRuntime.startIndex;
                let file = fs_1.getFilePath(self, {
                    chapter, cid,
                    ext: '.txt',
                    idx: current_idx,
                    dirname,
                    volume, vid,
                }, optionsRuntime);
                chapter.path = file;
                file = upath2_1.default.join(path_novel, file);
                if (self._checkExists(optionsRuntime, file)) {
                    return file;
                }
                let url = self._createChapterUrl({
                    novel,
                    volume,
                    chapter,
                }, optionsRuntime);
                await self._fetchChapterMain({
                    url,
                    file,
                    volume,
                    chapter,
                }, optionsRuntime, {
                    novel,
                })
                    .then(async (text) => {
                    await this._saveFile({
                        file,
                        context: text,
                        optionsRuntime,
                    });
                    return text;
                });
                return file;
            })
                .then(function (ret) {
                return ret;
            });
        }
        _saveReadme(optionsRuntime, options = {}, ...opts) {
            let novel = optionsRuntime[index_1.SYMBOL_CACHE].novel;
            if (novel.novelTree) {
                const novelTree = novel.novelTree;
                novel.novelTree = novelTree.toJSON();
            }
            return super._saveReadme(optionsRuntime, options, ...opts);
        }
    };
    NovelSiteDemo = __decorate([
        index_1.staticImplements()
    ], NovelSiteDemo);
    return NovelSiteDemo;
})();
exports.NovelSiteDemo = NovelSiteDemo;
exports.NovelSite = NovelSiteDemo;
exports.default = NovelSiteDemo;
__exportStar(require("./base"), exports);
//# sourceMappingURL=tree.js.map