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
    for (var p in m) if (!exports.hasOwnProperty(p)) __createBinding(exports, m, p);
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.NovelSite = exports.NovelSiteDemo = exports.NovelTree = void 0;
const base_1 = require("./base");
const fs_1 = require("../fs");
const index_1 = require("../index");
const path = require("upath2");
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
                        name = path.relative('~temp', name);
                        let ps = pnode.parent.get('dirname');
                        dirname = path.join(ps, name);
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
                file = path.join(path_novel, file);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHJlZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInRyZWUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOztHQUVHOzs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBRUgsaUNBQWtIO0FBRWxILDhCQUFtRDtBQUNuRCxvQ0FBaUc7QUFDakcsK0JBQStCO0FBRS9CLHlEQUE2RDtBQUM3RCxxREFBaUU7QUFLakUsa0NBQWtDO0FBRWxDLG1EQUFzRDtBQUV0RCw0Q0FBb0c7QUFFM0YsMEZBRnlCLGlCQUFTLE9BRXpCO0FBV2xCO0lBQUEsSUFBYSxhQUFhLEdBQTFCLE1BQWEsYUFBYyxTQUFRLGNBQWM7UUFFaEQsWUFBWSxDQUErQyxPQUFVLEVBQUUsU0FBa0I7WUFFeEYsTUFBTSxDQUFDLGVBQWUsRUFBRSxjQUFjLENBQUMsR0FBRyxLQUFLLENBQUMsWUFBWSxDQUFJLE9BQU8sRUFBRSxTQUFTLENBQUMsQ0FBQztZQUVwRixjQUFjLENBQUMsU0FBUyxHQUFHLElBQUksaUJBQVMsRUFBRSxDQUFDO1lBRTNDLE9BQU8sQ0FBQyxlQUFlLEVBQUUsY0FBYyxDQUFDLENBQUM7UUFDMUMsQ0FBQztRQUVTLEtBQUssQ0FBQyxxQkFBcUIsQ0FBQyxLQUFhLEVBQUUsY0FBK0IsRUFBRSxHQUFHLElBQUk7WUFFNUYsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDO1lBQ2xCLElBQUksUUFBUSxHQUFHLGlCQUFTLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxTQUFTLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFFM0QsMkNBQTJDO1lBRTNDLElBQUksS0FBSyxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsS0FBSyxHQUFHLENBQUMsRUFDbkM7Z0JBQ0MsSUFBSSxJQUFJLEdBQUcsS0FBSyxDQUFDO2dCQUNqQixJQUFJLGNBQWMsQ0FBQyxXQUFXLElBQUksY0FBYyxDQUFDLFlBQVksRUFDN0Q7b0JBQ0MsSUFBSSxHQUFHLElBQUksQ0FBQztpQkFDWjtnQkFFRCxjQUFjLENBQUMs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QUcsS0FBSyxDQUFDLFNBQVMsQ0FBQztnQkFFbEMsS0FBSyxDQUFDLFNBQVMsR0FBRyxTQUFTLENBQUMsTUFBTSxFQUFFLENBQUM7YUFDckM7WUFFRCxPQUFPLEtBQUssQ0FBQyxXQUFXLENBQUMsY0FBYyxFQUFFLE9BQU8sRUFBRSxHQUFHLElBQUksQ0FBQyxDQUFDO1FBQzVELENBQUM7S0FDRCxDQUFBO0lBblRZLGFBQWE7UUFEekIsd0JBQWdCLEVBQThDO09BQ2xELGFBQWEsQ0FtVHpCO0lBQUQsb0JBQUM7S0FBQTtBQW5UWSxzQ0FBYTtBQXFUYixRQUFBLFNBQVMsR0FBRyxhQUFxQyxDQUFDO0FBQy9ELGtCQUFlLGFBQWEsQ0FBQztBQUM3Qix5Q0FBdUIiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENyZWF0ZWQgYnkgdXNlciBvbiAyMDE4LzQvNC8wMDQuXG4gKi9cblxuaW1wb3J0IF9Ob3ZlbFNpdGVCYXNlLCB7IElEb3dubG9hZE9wdGlvbnMsIElPcHRpb25zUnVudGltZSBhcyBfSU9wdGlvbnNSdW50aW1lLCBJTm92ZWwgYXMgX0lOb3ZlbCB9IGZyb20gJy4vYmFzZSc7XG5cbmltcG9ydCB7IGdldEZpbGVQYXRoLCBnZXRWb2x1bWVQYXRoIH0gZnJvbSAnLi4vZnMnO1xuaW1wb3J0IF9Ob3ZlbFNpdGUsIHsgSUNoYXB0ZXIsIFByb21pc2VCbHVlYmlyZCwgc3RhdGljSW1wbGVtZW50cywgU1lNQk9MX0NBQ0hFIH0gZnJvbSAnLi4vaW5kZXgnO1xuaW1wb3J0ICogYXMgcGF0aCBmcm9tICd1cGF0aDInO1xuXG5pbXBvcnQgeyBub3JtYWxpemVfdmFsIH0gZnJvbSAnbm9kZS1ub3ZlbC1nbG9iYnkvbGliL2hlbHBlcic7XG5pbXBvcnQgeyBkZWZhdWx0U29ydENhbGxiYWNrIH0gZnJvbSAnbm9kZS1ub3ZlbC1nbG9iYnkvbGliL3NvcnQnO1xuXG5pbXBvcnQgZnMgPSByZXF1aXJlKCdmcy1leHRyYScpO1xuaW1wb3J0IHsgdHJpbUZpbGVuYW1lIH0gZnJvbSAnZnMtaWNvbnYvdXRpbCc7XG5pbXBvcnQgbm92ZWxUZXh0IGZyb20gJ25vdmVsLXRleHQnO1xuLy9pbXBvcnQgeyBVUkwgfSBmcm9tICdqc2RvbS11cmwnO1xuXG5pbXBvcnQgeyBTWU1CT0xfTk9ERSB9IGZyb20gJ2pzLXRyZWUtbGlzdDIvc3JjL3V0aWxzJztcblxuaW1wb3J0IHsgSVJvd0NoYXB0ZXIsIElSb3dWb2x1bWUsIE5vdmVsVHJlZSwgVHJlZU5vZGUsIElUcmVlLCBJVHJlZVRvTGlzdCB9IGZyb20gJy4uLy4uL3RyZWUvaW5kZXgnO1xuXG5leHBvcnQgeyBOb3ZlbFRyZWUgfVxuXG5leHBvcnQgdHlwZSBJT3B0aW9uc1J1bnRpbWUgPSBfSU9wdGlvbnNSdW50aW1lICYge1xuXHRub3ZlbFRyZWU/OiBOb3ZlbFRyZWUsXG59XG5cbmV4cG9ydCB0eXBlIElOb3ZlbCA9IF9JTm92ZWwgJiB7XG5cdG5vdmVsVHJlZT86IE5vdmVsVHJlZSxcbn1cblxuQHN0YXRpY0ltcGxlbWVudHM8X05vdmVsU2l0ZS5JTm92ZWxTaXRlU3RhdGljPE5vdmVsU2l0ZURlbW8+PigpXG5leHBvcnQgY2xhc3MgTm92ZWxTaXRlRGVtbyBleHRlbmRzIF9Ob3ZlbFNpdGVCYXNlXG57XG5cdGdldE91dHB1dERpcjxUIGV4dGVuZHMgSU9wdGlvbnNSdW50aW1lICYgSURvd25sb2FkT3B0aW9ucz4ob3B0aW9uczogVCwgbm92ZWxOYW1lPzogc3RyaW5nKTogW3N0cmluZywgVF1cblx0e1xuXHRcdGNvbnN0IFtQQVRIX05PVkVMX01BSU4sIG9wdGlvbnNSdW50aW1lXSA9IHN1cGVyLmdldE91dHB1dERpcjxUPihvcHRpb25zLCBub3ZlbE5hbWUpO1xuXG5cdFx0b3B0aW9uc1J1bnRpbWUubm92ZWxUcmVlID0gbmV3IE5vdmVsVHJlZSgpO1xuXG5cdFx0cmV0dXJuIFtQQVRIX05PVkVMX01BSU4sIG9wdGlvbnNSdW50aW1lXTtcblx0fVxuXG5cdHByb3RlY3RlZCBhc3luYyBfcHJvY2Vzc05vdmVsTGlzdE5hbWUobm92ZWw6IElOb3ZlbCwgb3B0aW9uc1J1bnRpbWU6IElPcHRpb25zUnVudGltZSwgLi4uYXJndilcblx0e1xuXHRcdGNvbnN0IHNlbGYgPSB0aGlzO1xuXHRcdGxldCB0cmVlTGlzdCA9IE5vdmVsVHJlZS50cmVlVG9MaXN0KG5vdmVsLm5vdmVsVHJlZSwgdHJ1ZSk7XG5cblx0XHQvL2NvbnNvbGUubG9nKG5vdmVsLm5vdmVsVHJlZS5jYWNoZS5kZXB0aCk7XG5cblx0XHRpZiAobm92ZWwubm92ZWxUcmVlLmNhY2hlLmRlcHRoID4gMilcblx0XHR7XG5cdFx0XHRsZXQgYm9vbCA9IGZhbHNlO1xuXHRcdFx0aWYgKG9wdGlvbnNSdW50aW1lLm5vRGlyUHJlZml4ICYmIG9wdGlvbnNSdW50aW1lLm5vRmlyZVByZWZpeClcblx0XHRcdHtcblx0XHRcdFx0Ym9vbCA9IHRydWU7XG5cdFx0XHR9XG5cblx0XHRcdG9wdGlvbnNSdW50aW1lLm5vRGlyUHJlZml4ID0gb3B0aW9uc1J1bnRpbWUubm9GaXJlUHJlZml4ID0gYm9vbDtcblx0XHR9XG5cblx0XHR0cmVlTGlzdFxuXHRcdFx0LmZvckVhY2goZnVuY3Rpb24gKGxpc3RSb3cpXG5cdFx0XHR7XG5cdFx0XHRcdGxldCBub2RlID0gbGlzdFJvd1tTWU1CT0xfTk9ERV0gYXMgVHJlZU5vZGU8SVJvd0NoYXB0ZXIgfCBJUm93Vm9sdW1lPjtcblxuXHRcdFx0XHRsZXQgdmFsdWUgPSBub2RlLnZhbHVlKCkgYXMgSVJvd0NoYXB0ZXIgfCBJUm93Vm9sdW1lO1xuXG5cdFx0XHRcdGlmICh0eXBlb2YgdmFsdWUubmFtZSA9PSAnc3RyaW5nJylcblx0XHRcdFx0e1xuXHRcdFx0XHRcdG5vZGUuc2V0KCduYW1lJywgc2VsZi50cmltRmlsZW5hbWVWb2x1bWUodmFsdWUubmFtZSkpO1xuXHRcdFx0XHR9XG5cdFx0XHR9KVxuXHRcdDtcblxuXHRcdHRyZWVMaXN0XG5cdFx0XHQuZm9yRWFjaChmdW5jdGlvbiAobGlzdFJvdylcblx0XHRcdHtcblx0XHRcdFx0bGV0IHBub2RlID0gbGlzdFJvd1tTWU1CT0xfTk9ERV0gYXMgVHJlZU5vZGU7XG5cdFx0XHRcdGNvbnN0IG50eXBlID0gcG5vZGUuZ2V0PHN0cmluZz4oJ3R5cGUnKTtcblxuXHRcdFx0XHRjb25zdCBoYXNDaGlsZCA9IHBub2RlLnNpemUoKTtcblxuXHRcdFx0XHRjb25zdCBjdXJyZW50TGV2ZWwgPSBwbm9kZS5nZXQ8bnVtYmVyPignbGV2ZWwnKTtcblxuXHRcdFx0XHQvL2NvbnNvbGUubG9nKGN1cnJlbnRMZXZlbCk7XG5cdFx0XHRcdC8vY29uc29sZS5sb2cobnR5cGUpO1xuXG5cdFx0XHRcdGlmIChudHlwZSAhPSAncm9vdCcpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRsZXQgbmFtZSA9IHBub2RlLmdldDxzdHJpbmc+KCduYW1lJyk7XG5cdFx0XHRcdFx0aWYgKG5hbWUgPT09IG51bGwpXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0cG5vZGUuc2V0KCduYW1lJywgJ251bGwnKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRpZiAoaGFzQ2hpbGQgJiYgKFxuXHRcdFx0XHRcdFx0MCAmJiAoY3VycmVudExldmVsID09IDAgJiYgIW9wdGlvbnNSdW50aW1lLm5vRGlyUHJlZml4KVxuXHRcdFx0XHRcdFx0fHwgKGN1cnJlbnRMZXZlbCA+IDAgJiYgIW9wdGlvbnNSdW50aW1lLm5vRmlyZVByZWZpeClcblx0XHRcdFx0XHQpICYmIG9wdGlvbnNSdW50aW1lLmZpbGVQcmVmaXhNb2RlID49IDIpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHQvL2NvbnNvbGUubG9nKDc3Nyk7XG5cblx0XHRcdFx0XHRsZXQgYm9vbDogYm9vbGVhbjtcblx0XHRcdFx0XHRsZXQgaTogbnVtYmVyID0gMDtcblx0XHRcdFx0XHRsZXQgbGFzdF92YWw6IHN0cmluZztcblxuXHRcdFx0XHRcdGxldCBrczogc3RyaW5nW10gPSBbXTtcblxuXHRcdFx0XHRcdGZvciAobGV0IG5vZGUgb2YgcG5vZGUuY2hpbGRyZW4pXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0bGV0IG5hbWUgPSBub2RlLmdldDxzdHJpbmc+KCduYW1lJyk7XG5cdFx0XHRcdFx0XHRsZXQgbmFtZV92YWwgPSBub3JtYWxpemVfdmFsKG5hbWUpO1xuXG5cdFx0XHRcdFx0XHRub2RlLnNldCgnbmFtZV92YWwnLCBuYW1lX3ZhbCk7XG5cblx0XHRcdFx0XHRcdGtzLnB1c2gobmFtZV92YWwpO1xuXG5cdFx0XHRcdFx0XHRpZiAobmFtZSA9PT0gbnVsbCB8fCBuYW1lID09ICdudWxsJylcblx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0bm9kZS5zZXQoJ25hbWUnLCAnbnVsbCcpO1xuXHRcdFx0XHRcdFx0XHRub2RlLnNldCgnbmFtZV92YWwnLCAnbnVsbCcpO1xuXG5cdFx0XHRcdFx0XHRcdGJvb2wgPSB0cnVlO1xuXHRcdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0aWYgKGkgIT09IDApXG5cdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdGxldCBrID0gZGVmYXVsdFNvcnRDYWxsYmFjayhsYXN0X3ZhbCwgbmFtZV92YWwpO1xuXG5cdFx0XHRcdFx0XHRcdGlmICh0eXBlb2YgayAhPSAnbnVtYmVyJyB8fCBrID4gLTEpXG5cdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHQvL2NvbnNvbGUubG9nKGspO1xuXG5cdFx0XHRcdFx0XHRcdFx0Ym9vbCA9IHRydWU7XG5cdFx0XHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0aSsrO1xuXHRcdFx0XHRcdFx0bGFzdF92YWwgPSBuYW1lX3ZhbDtcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRpZiAoIWJvb2wpXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0Zm9yIChsZXQgbm9kZSBvZiBwbm9kZS5jaGlsZHJlbilcblx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0aWYgKE5vdmVsVHJlZS5pc1ZvbHVtZShub2RlKSlcblx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdG5vZGUudmFsdWUoKS52b2x1bWVfaW5kZXggPSAnJztcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRlbHNlIGlmIChOb3ZlbFRyZWUuaXNDaGFwdGVyKG5vZGUpKVxuXHRcdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdFx0bm9kZS52YWx1ZSgpLmNoYXB0ZXJfaW5kZXggPSAnJztcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRlbHNlXG5cdFx0XHRcdFx0e1xuXG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cblx0XHRcdFx0aWYgKGhhc0NoaWxkKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0cG5vZGUuY2hpbGRyZW4uZm9yRWFjaChmdW5jdGlvbiAobm9kZSwgaWR4KVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdG5vZGUuc2V0KCdpZHgnLCBpZHgpO1xuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0aWYgKGhhc0NoaWxkKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0bGV0IGRpcm5hbWU6IHN0cmluZztcblxuXHRcdFx0XHRcdGlmIChudHlwZSA9PSAncm9vdCcpXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0ZGlybmFtZSA9ICcnO1xuXHRcdFx0XHRcdFx0cG5vZGUuc2V0KCdkaXJuYW1lJywgZGlybmFtZSk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGVsc2Vcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRsZXQgbmFtZSA9IHBub2RlLmdldCgnbmFtZScpO1xuXHRcdFx0XHRcdFx0bGV0IHZvbHVtZSA9IHBub2RlLnZhbHVlKCkgYXMgSVJvd1ZvbHVtZTtcblx0XHRcdFx0XHRcdGxldCB2aWQgPSB2b2x1bWUuaWR4O1xuXG5cdFx0XHRcdFx0XHRsZXQgZmFrZV9jaGFwdGVyOiBJUm93Q2hhcHRlciA9IHtcblx0XHRcdFx0XHRcdFx0Y2hhcHRlcl9pbmRleDogdm9sdW1lLnZvbHVtZV9pbmRleCxcblx0XHRcdFx0XHRcdFx0Y2hhcHRlcl90aXRsZTogdm9sdW1lLnZvbHVtZV90aXRsZSxcblx0XHRcdFx0XHRcdH07XG5cblx0XHRcdFx0XHRcdC8qXG5cdFx0XHRcdFx0XHRuYW1lID0gZ2V0Vm9sdW1lUGF0aChzZWxmLCB7XG5cdFx0XHRcdFx0XHRcdHZvbHVtZSxcblx0XHRcdFx0XHRcdFx0dmlkLFxuXHRcdFx0XHRcdFx0XHRwYXRoX25vdmVsOiAnJyxcblx0XHRcdFx0XHRcdH0sIG9wdGlvbnNSdW50aW1lKTtcblx0XHRcdFx0XHRcdCovXG5cdFx0XHRcdFx0XHRuYW1lID0gZ2V0RmlsZVBhdGgoc2VsZiwge1xuXHRcdFx0XHRcdFx0XHRjaGFwdGVyOiBmYWtlX2NoYXB0ZXIsIGNpZDogdmlkLFxuXHRcdFx0XHRcdFx0XHRleHQ6ICcnLFxuXG5cdFx0XHRcdFx0XHRcdGlkeDogdm9sdW1lLnRvdGFsX2lkeCArIG9wdGlvbnNSdW50aW1lLnN0YXJ0SW5kZXgsXG5cblx0XHRcdFx0XHRcdFx0ZGlybmFtZTogJ350ZW1wJyxcblx0XHRcdFx0XHRcdFx0dm9sdW1lLCB2aWQsXG5cdFx0XHRcdFx0XHR9LCBvcHRpb25zUnVudGltZSk7XG5cblx0XHRcdFx0XHRcdG5hbWUgPSBwYXRoLnJlbGF0aXZlKCd+dGVtcCcsIG5hbWUpO1xuXG5cdFx0XHRcdFx0XHRsZXQgcHMgPSBwbm9kZS5wYXJlbnQuZ2V0KCdkaXJuYW1lJyk7XG5cdFx0XHRcdFx0XHRkaXJuYW1lID0gcGF0aC5qb2luKHBzLCBuYW1lKTtcblx0XHRcdFx0XHRcdHBub2RlLnNldCgnZGlybmFtZScsIGRpcm5hbWUpO1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdC8vY29uc29sZS5sb2coZGlybmFtZSk7XG5cdFx0XHRcdH1cblx0XHRcdH0pXG5cdFx0O1xuXG5cdFx0Ly9wcm9jZXNzLmV4aXQoKTtcblxuXHRcdHJldHVybiB0cmVlTGlzdDtcblx0fVxuXG5cdGFzeW5jIF9wcm9jZXNzTm92ZWw8VD4obm92ZWw6IElOb3ZlbCwgb3B0aW9uc1J1bnRpbWU6IElPcHRpb25zUnVudGltZSwgX2NhY2hlXzoge1xuXHRcdHVybDogVVJMLFxuXHRcdHBhdGhfbm92ZWw6IHN0cmluZyxcblx0fSwgLi4uYXJndilcblx0e1xuXHRcdGNvbnN0IHNlbGYgPSB0aGlzO1xuXG5cdFx0bGV0IHsgdXJsLCBwYXRoX25vdmVsIH0gPSBfY2FjaGVfO1xuXG5cdFx0bGV0IHRyZWVMaXN0ID0gYXdhaXQgc2VsZi5fcHJvY2Vzc05vdmVsTGlzdE5hbWUobm92ZWwsIG9wdGlvbnNSdW50aW1lLCBfY2FjaGVfLCAuLi5hcmd2KTtcblxuXHRcdC8vY29uc29sZS5sb2cob3B0aW9uc1J1bnRpbWUpO1xuXG5cdFx0cmV0dXJuIFByb21pc2VCbHVlYmlyZFxuXHRcdFx0Lm1hcFNlcmllcyh0cmVlTGlzdC5zbGljZSgxKSwgYXN5bmMgKGxpc3RSb3cpID0+XG5cdFx0XHR7XG5cdFx0XHRcdGxldCBub2RlQ2hhcHRlciA9IGxpc3RSb3dbU1lNQk9MX05PREVdIGFzIFRyZWVOb2RlPElSb3dDaGFwdGVyPjtcblx0XHRcdFx0bGV0IG50eXBlID0gbm9kZUNoYXB0ZXIuZ2V0KCd0eXBlJyk7XG5cblx0XHRcdFx0aWYgKG50eXBlICE9ICdjaGFwdGVyJylcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGlmIChudHlwZSA9PSAndm9sdW1lJylcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRub2RlQ2hhcHRlci5zZXQoJ25hbWUnLCBzZWxmLnRyaW1GaWxlbmFtZVZvbHVtZShub2RlQ2hhcHRlci5nZXQoJ3ZvbHVtZV90aXRsZScpKSk7XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGVsc2Vcblx0XHRcdFx0e1xuXHRcdFx0XHRcdG5vZGVDaGFwdGVyLnNldCgnbmFtZScsIHNlbGYudHJpbUZpbGVuYW1lVm9sdW1lKG5vZGVDaGFwdGVyLmdldCgnY2hhcHRlcl90aXRsZScpKSk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRsZXQgbm9kZVZvbHVtZSA9IG5vZGVDaGFwdGVyLnBhcmVudCBhcyBhbnkgYXMgVHJlZU5vZGU8SVJvd1ZvbHVtZT47XG5cblx0XHRcdFx0bGV0IHZvbHVtZSA9IG5vZGVWb2x1bWUudmFsdWUoKSBhcyBJUm93Vm9sdW1lO1xuXHRcdFx0XHRsZXQgY2hhcHRlciA9IG5vZGVDaGFwdGVyLnZhbHVlKCkgYXMgSVJvd0NoYXB0ZXI7XG5cblx0XHRcdFx0bGV0IGRpcm5hbWUgPSB2b2x1bWUuZGlybmFtZTtcblxuXHRcdFx0XHRsZXQgY2lkID0gY2hhcHRlci5pZHg7XG5cdFx0XHRcdGxldCB2aWQgPSB2b2x1bWUuaWR4O1xuXG5cdFx0XHRcdGNvbnN0IGN1cnJlbnRfaWR4ID0gY2hhcHRlci50b3RhbF9pZHggKyBvcHRpb25zUnVudGltZS5zdGFydEluZGV4O1xuXG5cdFx0XHRcdGxldCBmaWxlID0gZ2V0RmlsZVBhdGgoc2VsZiwge1xuXHRcdFx0XHRcdGNoYXB0ZXIsIGNpZCxcblx0XHRcdFx0XHRleHQ6ICcudHh0JyxcblxuXHRcdFx0XHRcdGlkeDogY3VycmVudF9pZHgsXG5cblx0XHRcdFx0XHRkaXJuYW1lLFxuXHRcdFx0XHRcdHZvbHVtZSwgdmlkLFxuXHRcdFx0XHR9LCBvcHRpb25zUnVudGltZSk7XG5cblx0XHRcdFx0Y2hhcHRlci5wYXRoID0gZmlsZTtcblxuXHRcdFx0XHRmaWxlID0gcGF0aC5qb2luKHBhdGhfbm92ZWwsIGZpbGUpO1xuXG5cdFx0XHRcdGlmIChzZWxmLl9jaGVja0V4aXN0cyhvcHRpb25zUnVudGltZSwgZmlsZSkpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRyZXR1cm4gZmlsZTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGxldCB1cmwgPSBzZWxmLl9jcmVhdGVDaGFwdGVyVXJsKHtcblx0XHRcdFx0XHRub3ZlbCxcblx0XHRcdFx0XHR2b2x1bWUsXG5cdFx0XHRcdFx0Y2hhcHRlcixcblx0XHRcdFx0fSwgb3B0aW9uc1J1bnRpbWUpO1xuXG5cdFx0XHRcdGF3YWl0IHNlbGYuX2ZldGNoQ2hhcHRlck1haW4oe1xuXHRcdFx0XHRcdFx0dXJsLFxuXHRcdFx0XHRcdFx0ZmlsZSxcblx0XHRcdFx0XHRcdHZvbHVtZSxcblx0XHRcdFx0XHRcdGNoYXB0ZXIsXG5cdFx0XHRcdFx0fSwgb3B0aW9uc1J1bnRpbWUsIHtcblx0XHRcdFx0XHRcdG5vdmVsLFxuXHRcdFx0XHRcdH0pXG5cdFx0XHRcdFx0LnRoZW4oYXN5bmMgKHRleHQ6IHN0cmluZykgPT5cblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRhd2FpdCB0aGlzLl9zYXZlRmlsZSh7XG5cdFx0XHRcdFx0XHRcdGZpbGUsXG5cdFx0XHRcdFx0XHRcdGNvbnRleHQ6IHRleHQsXG5cdFx0XHRcdFx0XHRcdG9wdGlvbnNSdW50aW1lLFxuXHRcdFx0XHRcdFx0fSk7XG5cblx0XHRcdFx0XHRcdHJldHVybiB0ZXh0O1xuXHRcdFx0XHRcdH0pXG5cdFx0XHRcdDtcblxuXHRcdFx0XHRyZXR1cm4gZmlsZTtcblx0XHRcdH0pXG5cdFx0XHQudGhlbihmdW5jdGlvbiAocmV0KVxuXHRcdFx0e1xuXHRcdFx0XHRyZXR1cm4gcmV0IGFzIGFueSBhcyBUO1xuXHRcdFx0fSlcblx0XHRcdDtcblx0fVxuXG5cdHByb3RlY3RlZCBfc2F2ZVJlYWRtZShvcHRpb25zUnVudGltZTogSU9wdGlvbnNSdW50aW1lLCBvcHRpb25zID0ge30sIC4uLm9wdHMpXG5cdHtcblx0XHRsZXQgbm92ZWwgPSBvcHRpb25zUnVudGltZVtTWU1CT0xfQ0FDSEVdLm5vdmVsO1xuXG5cdFx0aWYgKG5vdmVsLm5vdmVsVHJlZSlcblx0XHR7XG5cdFx0XHRjb25zdCBub3ZlbFRyZWUgPSBub3ZlbC5ub3ZlbFRyZWU7XG5cblx0XHRcdG5vdmVsLm5vdmVsVHJlZSA9IG5vdmVsVHJlZS50b0pTT04oKTtcblx0XHR9XG5cblx0XHRyZXR1cm4gc3VwZXIuX3NhdmVSZWFkbWUob3B0aW9uc1J1bnRpbWUsIG9wdGlvbnMsIC4uLm9wdHMpO1xuXHR9XG59XG5cbmV4cG9ydCBjb25zdCBOb3ZlbFNpdGUgPSBOb3ZlbFNpdGVEZW1vIGFzIHR5cGVvZiBOb3ZlbFNpdGVEZW1vO1xuZXhwb3J0IGRlZmF1bHQgTm92ZWxTaXRlRGVtbztcbmV4cG9ydCAqIGZyb20gJy4vYmFzZSc7XG4iXX0=