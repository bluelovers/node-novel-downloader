"use strict";
/**
 * Created by user on 2018/4/4/004.
 */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
__export(require("./base"));
const base_1 = require("./base");
const fs_1 = require("../fs");
const index_1 = require("../index");
const path = require("upath2");
const helper_1 = require("node-novel-globby/lib/helper");
const sort_1 = require("node-novel-globby/lib/sort");
const novel_text_1 = require("novel-text");
const utils_1 = require("js-tree-list2/src/utils");
const index_2 = require("../../tree/index");
exports.NovelTree = index_2.NovelTree;
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
            await self._fetchChapter(url, optionsRuntime, {
                novel,
            })
                .then(function (ret) {
                return self._parseChapter(ret, optionsRuntime, {
                    file,
                    novel,
                    volume,
                    chapter,
                });
            })
                .then(function (text) {
                if (typeof text == 'string') {
                    return novel_text_1.default.toStr(text);
                }
                return text;
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
exports.NovelSiteDemo = NovelSiteDemo;
exports.NovelSite = NovelSiteDemo;
exports.default = NovelSiteDemo;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHJlZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInRyZWUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOztHQUVHOzs7Ozs7Ozs7OztBQUVILDRCQUF1QjtBQUN2QixpQ0FBa0g7QUFFbEgsOEJBQW1EO0FBQ25ELG9DQUFpRztBQUNqRywrQkFBK0I7QUFFL0IseURBQTZEO0FBQzdELHFEQUFpRTtBQUlqRSwyQ0FBbUM7QUFHbkMsbURBQXNEO0FBRXRELDRDQUFvRztBQUUzRixvQkFGeUIsaUJBQVMsQ0FFekI7QUFXbEIsSUFBYSxhQUFhLEdBQTFCLE1BQWEsYUFBYyxTQUFRLGNBQWM7SUFFaEQsWUFBWSxDQUErQyxPQUFVLEVBQUUsU0FBa0I7UUFFeEYsTUFBTSxDQUFDLGVBQWUsRUFBRSxjQUFjLENBQUMsR0FBRyxLQUFLLENBQUMsWUFBWSxDQUFJLE9BQU8sRUFBRSxTQUFTLENBQUMsQ0FBQztRQUVwRixjQUFjLENBQUMsU0FBUyxHQUFHLElBQUksaUJBQVMsRUFBRSxDQUFDO1FBRTNDLE9BQU8sQ0FBQyxlQUFlLEVBQUUsY0FBYyxDQUFDLENBQUM7SUFDMUMsQ0FBQztJQUVTLEtBQUssQ0FBQyxxQkFBcUIsQ0FBQyxLQUFhLEVBQUUsY0FBK0IsRUFBRSxHQUFHLElBQUk7UUFFNUYsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDO1FBQ2xCLElBQUksUUFBUSxHQUFHLGlCQUFTLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxTQUFTLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFFM0QsMkNBQTJDO1FBRTNDLElBQUksS0FBSyxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsS0FBSyxHQUFHLENBQUMsRUFDbkM7WUFDQyxJQUFJLElBQUksR0FBRyxLQUFLLENBQUM7WUFDakIsSUFBSSxjQUFjLENBQUMsV0FBVyxJQUFJLGNBQWMsQ0FBQyxZQUFZLEVBQzdEO2dCQUNDLElBQUksR0FBRyxJQUFJLENBQUM7YUFDWjtZQUVELGNBQWMsQ0FBQyxXQUFX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T0FBTyxHQUFlLENBQUM7UUFDeEIsQ0FBQyxDQUFDLENBQ0Q7SUFDSCxDQUFDO0lBRVMsV0FBVyxDQUFDLGNBQStCLEVBQUUsT0FBTyxHQUFHLEVBQUUsRUFBRSxHQUFHLElBQUk7UUFFM0UsSUFBSSxLQUFLLEdBQUcsY0FBYyxDQUFDLG9CQUFZLENBQUMsQ0FBQyxLQUFLLENBQUM7UUFFL0MsSUFBSSxLQUFLLENBQUMsU0FBUyxFQUNuQjtZQUNDLE1BQU0sU0FBUyxHQUFHLEtBQUssQ0FBQyxTQUFTLENBQUM7WUFFbEMsS0FBSyxDQUFDLFNBQVMsR0FBRyxTQUFTLENBQUMsTUFBTSxFQUFFLENBQUM7U0FDckM7UUFFRCxPQUFPLEtBQUssQ0FBQyxXQUFXLENBQUMsY0FBYyxFQUFFLE9BQU8sRUFBRSxHQUFHLElBQUksQ0FBQyxDQUFDO0lBQzVELENBQUM7Q0FDRCxDQUFBO0FBaFVZLGFBQWE7SUFEekIsd0JBQWdCLEVBQThDO0dBQ2xELGFBQWEsQ0FnVXpCO0FBaFVZLHNDQUFhO0FBa1ViLFFBQUEsU0FBUyxHQUFHLGFBQXFDLENBQUM7QUFDL0Qsa0JBQWUsYUFBYSxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDcmVhdGVkIGJ5IHVzZXIgb24gMjAxOC80LzQvMDA0LlxuICovXG5cbmV4cG9ydCAqIGZyb20gJy4vYmFzZSc7XG5pbXBvcnQgX05vdmVsU2l0ZUJhc2UsIHsgSURvd25sb2FkT3B0aW9ucywgSU9wdGlvbnNSdW50aW1lIGFzIF9JT3B0aW9uc1J1bnRpbWUsIElOb3ZlbCBhcyBfSU5vdmVsIH0gZnJvbSAnLi9iYXNlJztcblxuaW1wb3J0IHsgZ2V0RmlsZVBhdGgsIGdldFZvbHVtZVBhdGggfSBmcm9tICcuLi9mcyc7XG5pbXBvcnQgX05vdmVsU2l0ZSwgeyBJQ2hhcHRlciwgUHJvbWlzZUJsdWViaXJkLCBzdGF0aWNJbXBsZW1lbnRzLCBTWU1CT0xfQ0FDSEUgfSBmcm9tICcuLi9pbmRleCc7XG5pbXBvcnQgKiBhcyBwYXRoIGZyb20gJ3VwYXRoMic7XG5cbmltcG9ydCB7IG5vcm1hbGl6ZV92YWwgfSBmcm9tICdub2RlLW5vdmVsLWdsb2JieS9saWIvaGVscGVyJztcbmltcG9ydCB7IGRlZmF1bHRTb3J0Q2FsbGJhY2sgfSBmcm9tICdub2RlLW5vdmVsLWdsb2JieS9saWIvc29ydCc7XG5cbmltcG9ydCBmcyA9IHJlcXVpcmUoJ2ZzLWV4dHJhJyk7XG5pbXBvcnQgeyB0cmltRmlsZW5hbWUgfSBmcm9tICdmcy1pY29udi91dGlsJztcbmltcG9ydCBub3ZlbFRleHQgZnJvbSAnbm92ZWwtdGV4dCc7XG5pbXBvcnQgeyBVUkwgfSBmcm9tICdqc2RvbS11cmwnO1xuXG5pbXBvcnQgeyBTWU1CT0xfTk9ERSB9IGZyb20gJ2pzLXRyZWUtbGlzdDIvc3JjL3V0aWxzJztcblxuaW1wb3J0IHsgSVJvd0NoYXB0ZXIsIElSb3dWb2x1bWUsIE5vdmVsVHJlZSwgVHJlZU5vZGUsIElUcmVlLCBJVHJlZVRvTGlzdCB9IGZyb20gJy4uLy4uL3RyZWUvaW5kZXgnO1xuXG5leHBvcnQgeyBOb3ZlbFRyZWUgfVxuXG5leHBvcnQgdHlwZSBJT3B0aW9uc1J1bnRpbWUgPSBfSU9wdGlvbnNSdW50aW1lICYge1xuXHRub3ZlbFRyZWU/OiBOb3ZlbFRyZWUsXG59XG5cbmV4cG9ydCB0eXBlIElOb3ZlbCA9IF9JTm92ZWwgJiB7XG5cdG5vdmVsVHJlZT86IE5vdmVsVHJlZSxcbn1cblxuQHN0YXRpY0ltcGxlbWVudHM8X05vdmVsU2l0ZS5JTm92ZWxTaXRlU3RhdGljPE5vdmVsU2l0ZURlbW8+PigpXG5leHBvcnQgY2xhc3MgTm92ZWxTaXRlRGVtbyBleHRlbmRzIF9Ob3ZlbFNpdGVCYXNlXG57XG5cdGdldE91dHB1dERpcjxUIGV4dGVuZHMgSU9wdGlvbnNSdW50aW1lICYgSURvd25sb2FkT3B0aW9ucz4ob3B0aW9uczogVCwgbm92ZWxOYW1lPzogc3RyaW5nKTogW3N0cmluZywgVF1cblx0e1xuXHRcdGNvbnN0IFtQQVRIX05PVkVMX01BSU4sIG9wdGlvbnNSdW50aW1lXSA9IHN1cGVyLmdldE91dHB1dERpcjxUPihvcHRpb25zLCBub3ZlbE5hbWUpO1xuXG5cdFx0b3B0aW9uc1J1bnRpbWUubm92ZWxUcmVlID0gbmV3IE5vdmVsVHJlZSgpO1xuXG5cdFx0cmV0dXJuIFtQQVRIX05PVkVMX01BSU4sIG9wdGlvbnNSdW50aW1lXTtcblx0fVxuXG5cdHByb3RlY3RlZCBhc3luYyBfcHJvY2Vzc05vdmVsTGlzdE5hbWUobm92ZWw6IElOb3ZlbCwgb3B0aW9uc1J1bnRpbWU6IElPcHRpb25zUnVudGltZSwgLi4uYXJndilcblx0e1xuXHRcdGNvbnN0IHNlbGYgPSB0aGlzO1xuXHRcdGxldCB0cmVlTGlzdCA9IE5vdmVsVHJlZS50cmVlVG9MaXN0KG5vdmVsLm5vdmVsVHJlZSwgdHJ1ZSk7XG5cblx0XHQvL2NvbnNvbGUubG9nKG5vdmVsLm5vdmVsVHJlZS5jYWNoZS5kZXB0aCk7XG5cblx0XHRpZiAobm92ZWwubm92ZWxUcmVlLmNhY2hlLmRlcHRoID4gMilcblx0XHR7XG5cdFx0XHRsZXQgYm9vbCA9IGZhbHNlO1xuXHRcdFx0aWYgKG9wdGlvbnNSdW50aW1lLm5vRGlyUHJlZml4ICYmIG9wdGlvbnNSdW50aW1lLm5vRmlyZVByZWZpeClcblx0XHRcdHtcblx0XHRcdFx0Ym9vbCA9IHRydWU7XG5cdFx0XHR9XG5cblx0XHRcdG9wdGlvbnNSdW50aW1lLm5vRGlyUHJlZml4ID0gb3B0aW9uc1J1bnRpbWUubm9GaXJlUHJlZml4ID0gYm9vbDtcblx0XHR9XG5cblx0XHR0cmVlTGlzdFxuXHRcdFx0LmZvckVhY2goZnVuY3Rpb24gKGxpc3RSb3cpXG5cdFx0XHR7XG5cdFx0XHRcdGxldCBub2RlID0gbGlzdFJvd1tTWU1CT0xfTk9ERV0gYXMgVHJlZU5vZGU8SVJvd0NoYXB0ZXIgfCBJUm93Vm9sdW1lPjtcblxuXHRcdFx0XHRsZXQgdmFsdWUgPSBub2RlLnZhbHVlKCkgYXMgSVJvd0NoYXB0ZXIgfCBJUm93Vm9sdW1lO1xuXG5cdFx0XHRcdGlmICh0eXBlb2YgdmFsdWUubmFtZSA9PSAnc3RyaW5nJylcblx0XHRcdFx0e1xuXHRcdFx0XHRcdG5vZGUuc2V0KCduYW1lJywgc2VsZi50cmltRmlsZW5hbWVWb2x1bWUodmFsdWUubmFtZSkpO1xuXHRcdFx0XHR9XG5cdFx0XHR9KVxuXHRcdDtcblxuXHRcdHRyZWVMaXN0XG5cdFx0XHQuZm9yRWFjaChmdW5jdGlvbiAobGlzdFJvdylcblx0XHRcdHtcblx0XHRcdFx0bGV0IHBub2RlID0gbGlzdFJvd1tTWU1CT0xfTk9ERV0gYXMgVHJlZU5vZGU7XG5cdFx0XHRcdGNvbnN0IG50eXBlID0gcG5vZGUuZ2V0PHN0cmluZz4oJ3R5cGUnKTtcblxuXHRcdFx0XHRjb25zdCBoYXNDaGlsZCA9IHBub2RlLnNpemUoKTtcblxuXHRcdFx0XHRjb25zdCBjdXJyZW50TGV2ZWwgPSBwbm9kZS5nZXQ8bnVtYmVyPignbGV2ZWwnKTtcblxuXHRcdFx0XHQvL2NvbnNvbGUubG9nKGN1cnJlbnRMZXZlbCk7XG5cdFx0XHRcdC8vY29uc29sZS5sb2cobnR5cGUpO1xuXG5cdFx0XHRcdGlmIChudHlwZSAhPSAncm9vdCcpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRsZXQgbmFtZSA9IHBub2RlLmdldDxzdHJpbmc+KCduYW1lJyk7XG5cdFx0XHRcdFx0aWYgKG5hbWUgPT09IG51bGwpXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0cG5vZGUuc2V0KCduYW1lJywgJ251bGwnKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRpZiAoaGFzQ2hpbGQgJiYgKFxuXHRcdFx0XHRcdFx0MCAmJiAoY3VycmVudExldmVsID09IDAgJiYgIW9wdGlvbnNSdW50aW1lLm5vRGlyUHJlZml4KVxuXHRcdFx0XHRcdFx0fHwgKGN1cnJlbnRMZXZlbCA+IDAgJiYgIW9wdGlvbnNSdW50aW1lLm5vRmlyZVByZWZpeClcblx0XHRcdFx0XHQpICYmIG9wdGlvbnNSdW50aW1lLmZpbGVQcmVmaXhNb2RlID49IDIpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHQvL2NvbnNvbGUubG9nKDc3Nyk7XG5cblx0XHRcdFx0XHRsZXQgYm9vbDogYm9vbGVhbjtcblx0XHRcdFx0XHRsZXQgaTogbnVtYmVyID0gMDtcblx0XHRcdFx0XHRsZXQgbGFzdF92YWw6IHN0cmluZztcblxuXHRcdFx0XHRcdGxldCBrczogc3RyaW5nW10gPSBbXTtcblxuXHRcdFx0XHRcdGZvciAobGV0IG5vZGUgb2YgcG5vZGUuY2hpbGRyZW4pXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0bGV0IG5hbWUgPSBub2RlLmdldDxzdHJpbmc+KCduYW1lJyk7XG5cdFx0XHRcdFx0XHRsZXQgbmFtZV92YWwgPSBub3JtYWxpemVfdmFsKG5hbWUpO1xuXG5cdFx0XHRcdFx0XHRub2RlLnNldCgnbmFtZV92YWwnLCBuYW1lX3ZhbCk7XG5cblx0XHRcdFx0XHRcdGtzLnB1c2gobmFtZV92YWwpO1xuXG5cdFx0XHRcdFx0XHRpZiAobmFtZSA9PT0gbnVsbCB8fCBuYW1lID09ICdudWxsJylcblx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0bm9kZS5zZXQoJ25hbWUnLCAnbnVsbCcpO1xuXHRcdFx0XHRcdFx0XHRub2RlLnNldCgnbmFtZV92YWwnLCAnbnVsbCcpO1xuXG5cdFx0XHRcdFx0XHRcdGJvb2wgPSB0cnVlO1xuXHRcdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0aWYgKGkgIT09IDApXG5cdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdGxldCBrID0gZGVmYXVsdFNvcnRDYWxsYmFjayhsYXN0X3ZhbCwgbmFtZV92YWwpO1xuXG5cdFx0XHRcdFx0XHRcdGlmICh0eXBlb2YgayAhPSAnbnVtYmVyJyB8fCBrID4gLTEpXG5cdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHQvL2NvbnNvbGUubG9nKGspO1xuXG5cdFx0XHRcdFx0XHRcdFx0Ym9vbCA9IHRydWU7XG5cdFx0XHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0aSsrO1xuXHRcdFx0XHRcdFx0bGFzdF92YWwgPSBuYW1lX3ZhbDtcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRpZiAoIWJvb2wpXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0Zm9yIChsZXQgbm9kZSBvZiBwbm9kZS5jaGlsZHJlbilcblx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0aWYgKE5vdmVsVHJlZS5pc1ZvbHVtZShub2RlKSlcblx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdG5vZGUudmFsdWUoKS52b2x1bWVfaW5kZXggPSAnJztcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRlbHNlIGlmIChOb3ZlbFRyZWUuaXNDaGFwdGVyKG5vZGUpKVxuXHRcdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdFx0bm9kZS52YWx1ZSgpLmNoYXB0ZXJfaW5kZXggPSAnJztcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRlbHNlXG5cdFx0XHRcdFx0e1xuXG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cblx0XHRcdFx0aWYgKGhhc0NoaWxkKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0cG5vZGUuY2hpbGRyZW4uZm9yRWFjaChmdW5jdGlvbiAobm9kZSwgaWR4KVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdG5vZGUuc2V0KCdpZHgnLCBpZHgpO1xuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0aWYgKGhhc0NoaWxkKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0bGV0IGRpcm5hbWU6IHN0cmluZztcblxuXHRcdFx0XHRcdGlmIChudHlwZSA9PSAncm9vdCcpXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0ZGlybmFtZSA9ICcnO1xuXHRcdFx0XHRcdFx0cG5vZGUuc2V0KCdkaXJuYW1lJywgZGlybmFtZSk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGVsc2Vcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRsZXQgbmFtZSA9IHBub2RlLmdldCgnbmFtZScpO1xuXHRcdFx0XHRcdFx0bGV0IHZvbHVtZSA9IHBub2RlLnZhbHVlKCkgYXMgSVJvd1ZvbHVtZTtcblx0XHRcdFx0XHRcdGxldCB2aWQgPSB2b2x1bWUuaWR4O1xuXG5cdFx0XHRcdFx0XHRsZXQgZmFrZV9jaGFwdGVyOiBJUm93Q2hhcHRlciA9IHtcblx0XHRcdFx0XHRcdFx0Y2hhcHRlcl9pbmRleDogdm9sdW1lLnZvbHVtZV9pbmRleCxcblx0XHRcdFx0XHRcdFx0Y2hhcHRlcl90aXRsZTogdm9sdW1lLnZvbHVtZV90aXRsZSxcblx0XHRcdFx0XHRcdH07XG5cblx0XHRcdFx0XHRcdC8qXG5cdFx0XHRcdFx0XHRuYW1lID0gZ2V0Vm9sdW1lUGF0aChzZWxmLCB7XG5cdFx0XHRcdFx0XHRcdHZvbHVtZSxcblx0XHRcdFx0XHRcdFx0dmlkLFxuXHRcdFx0XHRcdFx0XHRwYXRoX25vdmVsOiAnJyxcblx0XHRcdFx0XHRcdH0sIG9wdGlvbnNSdW50aW1lKTtcblx0XHRcdFx0XHRcdCovXG5cdFx0XHRcdFx0XHRuYW1lID0gZ2V0RmlsZVBhdGgoc2VsZiwge1xuXHRcdFx0XHRcdFx0XHRjaGFwdGVyOiBmYWtlX2NoYXB0ZXIsIGNpZDogdmlkLFxuXHRcdFx0XHRcdFx0XHRleHQ6ICcnLFxuXG5cdFx0XHRcdFx0XHRcdGlkeDogdm9sdW1lLnRvdGFsX2lkeCArIG9wdGlvbnNSdW50aW1lLnN0YXJ0SW5kZXgsXG5cblx0XHRcdFx0XHRcdFx0ZGlybmFtZTogJ350ZW1wJyxcblx0XHRcdFx0XHRcdFx0dm9sdW1lLCB2aWQsXG5cdFx0XHRcdFx0XHR9LCBvcHRpb25zUnVudGltZSk7XG5cblx0XHRcdFx0XHRcdG5hbWUgPSBwYXRoLnJlbGF0aXZlKCd+dGVtcCcsIG5hbWUpO1xuXG5cdFx0XHRcdFx0XHRsZXQgcHMgPSBwbm9kZS5wYXJlbnQuZ2V0KCdkaXJuYW1lJyk7XG5cdFx0XHRcdFx0XHRkaXJuYW1lID0gcGF0aC5qb2luKHBzLCBuYW1lKTtcblx0XHRcdFx0XHRcdHBub2RlLnNldCgnZGlybmFtZScsIGRpcm5hbWUpO1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdC8vY29uc29sZS5sb2coZGlybmFtZSk7XG5cdFx0XHRcdH1cblx0XHRcdH0pXG5cdFx0O1xuXG5cdFx0Ly9wcm9jZXNzLmV4aXQoKTtcblxuXHRcdHJldHVybiB0cmVlTGlzdDtcblx0fVxuXG5cdGFzeW5jIF9wcm9jZXNzTm92ZWw8VD4obm92ZWw6IElOb3ZlbCwgb3B0aW9uc1J1bnRpbWU6IElPcHRpb25zUnVudGltZSwgX2NhY2hlXzoge1xuXHRcdHVybDogVVJMLFxuXHRcdHBhdGhfbm92ZWw6IHN0cmluZyxcblx0fSwgLi4uYXJndilcblx0e1xuXHRcdGNvbnN0IHNlbGYgPSB0aGlzO1xuXG5cdFx0bGV0IHsgdXJsLCBwYXRoX25vdmVsIH0gPSBfY2FjaGVfO1xuXG5cdFx0bGV0IHRyZWVMaXN0ID0gYXdhaXQgc2VsZi5fcHJvY2Vzc05vdmVsTGlzdE5hbWUobm92ZWwsIG9wdGlvbnNSdW50aW1lLCBfY2FjaGVfLCAuLi5hcmd2KTtcblxuXHRcdC8vY29uc29sZS5sb2cob3B0aW9uc1J1bnRpbWUpO1xuXG5cdFx0cmV0dXJuIFByb21pc2VCbHVlYmlyZFxuXHRcdFx0Lm1hcFNlcmllcyh0cmVlTGlzdC5zbGljZSgxKSwgYXN5bmMgKGxpc3RSb3cpID0+XG5cdFx0XHR7XG5cdFx0XHRcdGxldCBub2RlQ2hhcHRlciA9IGxpc3RSb3dbU1lNQk9MX05PREVdIGFzIFRyZWVOb2RlPElSb3dDaGFwdGVyPjtcblx0XHRcdFx0bGV0IG50eXBlID0gbm9kZUNoYXB0ZXIuZ2V0KCd0eXBlJyk7XG5cblx0XHRcdFx0aWYgKG50eXBlICE9ICdjaGFwdGVyJylcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGlmIChudHlwZSA9PSAndm9sdW1lJylcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRub2RlQ2hhcHRlci5zZXQoJ25hbWUnLCBzZWxmLnRyaW1GaWxlbmFtZVZvbHVtZShub2RlQ2hhcHRlci5nZXQoJ3ZvbHVtZV90aXRsZScpKSk7XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGVsc2Vcblx0XHRcdFx0e1xuXHRcdFx0XHRcdG5vZGVDaGFwdGVyLnNldCgnbmFtZScsIHNlbGYudHJpbUZpbGVuYW1lVm9sdW1lKG5vZGVDaGFwdGVyLmdldCgnY2hhcHRlcl90aXRsZScpKSk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRsZXQgbm9kZVZvbHVtZSA9IG5vZGVDaGFwdGVyLnBhcmVudCBhcyBhbnkgYXMgVHJlZU5vZGU8SVJvd1ZvbHVtZT47XG5cblx0XHRcdFx0bGV0IHZvbHVtZSA9IG5vZGVWb2x1bWUudmFsdWUoKSBhcyBJUm93Vm9sdW1lO1xuXHRcdFx0XHRsZXQgY2hhcHRlciA9IG5vZGVDaGFwdGVyLnZhbHVlKCkgYXMgSVJvd0NoYXB0ZXI7XG5cblx0XHRcdFx0bGV0IGRpcm5hbWUgPSB2b2x1bWUuZGlybmFtZTtcblxuXHRcdFx0XHRsZXQgY2lkID0gY2hhcHRlci5pZHg7XG5cdFx0XHRcdGxldCB2aWQgPSB2b2x1bWUuaWR4O1xuXG5cdFx0XHRcdGNvbnN0IGN1cnJlbnRfaWR4ID0gY2hhcHRlci50b3RhbF9pZHggKyBvcHRpb25zUnVudGltZS5zdGFydEluZGV4O1xuXG5cdFx0XHRcdGxldCBmaWxlID0gZ2V0RmlsZVBhdGgoc2VsZiwge1xuXHRcdFx0XHRcdGNoYXB0ZXIsIGNpZCxcblx0XHRcdFx0XHRleHQ6ICcudHh0JyxcblxuXHRcdFx0XHRcdGlkeDogY3VycmVudF9pZHgsXG5cblx0XHRcdFx0XHRkaXJuYW1lLFxuXHRcdFx0XHRcdHZvbHVtZSwgdmlkLFxuXHRcdFx0XHR9LCBvcHRpb25zUnVudGltZSk7XG5cblx0XHRcdFx0Y2hhcHRlci5wYXRoID0gZmlsZTtcblxuXHRcdFx0XHRmaWxlID0gcGF0aC5qb2luKHBhdGhfbm92ZWwsIGZpbGUpO1xuXG5cdFx0XHRcdGlmIChzZWxmLl9jaGVja0V4aXN0cyhvcHRpb25zUnVudGltZSwgZmlsZSkpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRyZXR1cm4gZmlsZTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGxldCB1cmwgPSBzZWxmLl9jcmVhdGVDaGFwdGVyVXJsKHtcblx0XHRcdFx0XHRub3ZlbCxcblx0XHRcdFx0XHR2b2x1bWUsXG5cdFx0XHRcdFx0Y2hhcHRlcixcblx0XHRcdFx0fSwgb3B0aW9uc1J1bnRpbWUpO1xuXG5cdFx0XHRcdGF3YWl0IHNlbGYuX2ZldGNoQ2hhcHRlcih1cmwsIG9wdGlvbnNSdW50aW1lLCB7XG5cdFx0XHRcdFx0XHRub3ZlbCxcblx0XHRcdFx0XHR9KVxuXHRcdFx0XHRcdC50aGVuKGZ1bmN0aW9uIChyZXQpXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0cmV0dXJuIHNlbGYuX3BhcnNlQ2hhcHRlcihyZXQsIG9wdGlvbnNSdW50aW1lLCB7XG5cdFx0XHRcdFx0XHRcdGZpbGUsXG5cdFx0XHRcdFx0XHRcdG5vdmVsLFxuXHRcdFx0XHRcdFx0XHR2b2x1bWUsXG5cdFx0XHRcdFx0XHRcdGNoYXB0ZXIsXG5cdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHR9KVxuXHRcdFx0XHRcdC50aGVuKGZ1bmN0aW9uICh0ZXh0KVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdGlmICh0eXBlb2YgdGV4dCA9PSAnc3RyaW5nJylcblx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0cmV0dXJuIG5vdmVsVGV4dC50b1N0cih0ZXh0KTtcblx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0cmV0dXJuIHRleHQ7XG5cdFx0XHRcdFx0fSlcblx0XHRcdFx0XHQudGhlbihhc3luYyAodGV4dDogc3RyaW5nKSA9PlxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdGF3YWl0IHRoaXMuX3NhdmVGaWxlKHtcblx0XHRcdFx0XHRcdFx0ZmlsZSxcblx0XHRcdFx0XHRcdFx0Y29udGV4dDogdGV4dCxcblx0XHRcdFx0XHRcdFx0b3B0aW9uc1J1bnRpbWUsXG5cdFx0XHRcdFx0XHR9KTtcblxuXHRcdFx0XHRcdFx0cmV0dXJuIHRleHQ7XG5cdFx0XHRcdFx0fSlcblx0XHRcdFx0O1xuXG5cdFx0XHRcdHJldHVybiBmaWxlO1xuXHRcdFx0fSlcblx0XHRcdC50aGVuKGZ1bmN0aW9uIChyZXQpXG5cdFx0XHR7XG5cdFx0XHRcdHJldHVybiByZXQgYXMgYW55IGFzIFQ7XG5cdFx0XHR9KVxuXHRcdFx0O1xuXHR9XG5cblx0cHJvdGVjdGVkIF9zYXZlUmVhZG1lKG9wdGlvbnNSdW50aW1lOiBJT3B0aW9uc1J1bnRpbWUsIG9wdGlvbnMgPSB7fSwgLi4ub3B0cylcblx0e1xuXHRcdGxldCBub3ZlbCA9IG9wdGlvbnNSdW50aW1lW1NZTUJPTF9DQUNIRV0ubm92ZWw7XG5cblx0XHRpZiAobm92ZWwubm92ZWxUcmVlKVxuXHRcdHtcblx0XHRcdGNvbnN0IG5vdmVsVHJlZSA9IG5vdmVsLm5vdmVsVHJlZTtcblxuXHRcdFx0bm92ZWwubm92ZWxUcmVlID0gbm92ZWxUcmVlLnRvSlNPTigpO1xuXHRcdH1cblxuXHRcdHJldHVybiBzdXBlci5fc2F2ZVJlYWRtZShvcHRpb25zUnVudGltZSwgb3B0aW9ucywgLi4ub3B0cyk7XG5cdH1cbn1cblxuZXhwb3J0IGNvbnN0IE5vdmVsU2l0ZSA9IE5vdmVsU2l0ZURlbW8gYXMgdHlwZW9mIE5vdmVsU2l0ZURlbW87XG5leHBvcnQgZGVmYXVsdCBOb3ZlbFNpdGVEZW1vO1xuIl19