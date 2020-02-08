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
//import { URL } from 'jsdom-url';
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
exports.NovelSiteDemo = NovelSiteDemo;
exports.NovelSite = NovelSiteDemo;
exports.default = NovelSiteDemo;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHJlZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInRyZWUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOztHQUVHOzs7Ozs7Ozs7OztBQUVILDRCQUF1QjtBQUN2QixpQ0FBa0g7QUFFbEgsOEJBQW1EO0FBQ25ELG9DQUFpRztBQUNqRywrQkFBK0I7QUFFL0IseURBQTZEO0FBQzdELHFEQUFpRTtBQUtqRSxrQ0FBa0M7QUFFbEMsbURBQXNEO0FBRXRELDRDQUFvRztBQUUzRixvQkFGeUIsaUJBQVMsQ0FFekI7QUFXbEIsSUFBYSxhQUFhLEdBQTFCLE1BQWEsYUFBYyxTQUFRLGNBQWM7SUFFaEQsWUFBWSxDQUErQyxPQUFVLEVBQUUsU0FBa0I7UUFFeEYsTUFBTSxDQUFDLGVBQWUsRUFBRSxjQUFjLENBQUMsR0FBRyxLQUFLLENBQUMsWUFBWSxDQUFJLE9BQU8sRUFBRSxTQUFTLENBQUMsQ0FBQztRQUVwRixjQUFjLENBQUMsU0FBUyxHQUFHLElBQUksaUJBQVMsRUFBRSxDQUFDO1FBRTNDLE9BQU8sQ0FBQyxlQUFlLEVBQUUsY0FBYyxDQUFDLENBQUM7SUFDMUMsQ0FBQztJQUVTLEtBQUssQ0FBQyxxQkFBcUIsQ0FBQyxLQUFhLEVBQUUsY0FBK0IsRUFBRSxHQUFHLElBQUk7UUFFNUYsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDO1FBQ2xCLElBQUksUUFBUSxHQUFHLGlCQUFTLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxTQUFTLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFFM0QsMkNBQTJDO1FBRTNDLElBQUksS0FBSyxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsS0FBSyxHQUFHLENBQUMsRUFDbkM7WUFDQyxJQUFJLElBQUksR0FBRyxLQUFLLENBQUM7WUFDakIsSUFBSSxjQUFjLENBQUMsV0FBVyxJQUFJLGNBQWMsQ0FBQyxZQUFZLEVBQzdEO2dCQUNDLElBQUksR0FBRyxJQUFJLENBQUM7YUFDWjtZQUVELGNBQWMsQ0FBQyxXQUFX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LENBQUMsTUFBTSxFQUFFLENBQUM7U0FDckM7UUFFRCxPQUFPLEtBQUssQ0FBQyxXQUFXLENBQUMsY0FBYyxFQUFFLE9BQU8sRUFBRSxHQUFHLElBQUksQ0FBQyxDQUFDO0lBQzVELENBQUM7Q0FDRCxDQUFBO0FBblRZLGFBQWE7SUFEekIsd0JBQWdCLEVBQThDO0dBQ2xELGFBQWEsQ0FtVHpCO0FBblRZLHNDQUFhO0FBcVRiLFFBQUEsU0FBUyxHQUFHLGFBQXFDLENBQUM7QUFDL0Qsa0JBQWUsYUFBYSxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDcmVhdGVkIGJ5IHVzZXIgb24gMjAxOC80LzQvMDA0LlxuICovXG5cbmV4cG9ydCAqIGZyb20gJy4vYmFzZSc7XG5pbXBvcnQgX05vdmVsU2l0ZUJhc2UsIHsgSURvd25sb2FkT3B0aW9ucywgSU9wdGlvbnNSdW50aW1lIGFzIF9JT3B0aW9uc1J1bnRpbWUsIElOb3ZlbCBhcyBfSU5vdmVsIH0gZnJvbSAnLi9iYXNlJztcblxuaW1wb3J0IHsgZ2V0RmlsZVBhdGgsIGdldFZvbHVtZVBhdGggfSBmcm9tICcuLi9mcyc7XG5pbXBvcnQgX05vdmVsU2l0ZSwgeyBJQ2hhcHRlciwgUHJvbWlzZUJsdWViaXJkLCBzdGF0aWNJbXBsZW1lbnRzLCBTWU1CT0xfQ0FDSEUgfSBmcm9tICcuLi9pbmRleCc7XG5pbXBvcnQgKiBhcyBwYXRoIGZyb20gJ3VwYXRoMic7XG5cbmltcG9ydCB7IG5vcm1hbGl6ZV92YWwgfSBmcm9tICdub2RlLW5vdmVsLWdsb2JieS9saWIvaGVscGVyJztcbmltcG9ydCB7IGRlZmF1bHRTb3J0Q2FsbGJhY2sgfSBmcm9tICdub2RlLW5vdmVsLWdsb2JieS9saWIvc29ydCc7XG5cbmltcG9ydCBmcyA9IHJlcXVpcmUoJ2ZzLWV4dHJhJyk7XG5pbXBvcnQgeyB0cmltRmlsZW5hbWUgfSBmcm9tICdmcy1pY29udi91dGlsJztcbmltcG9ydCBub3ZlbFRleHQgZnJvbSAnbm92ZWwtdGV4dCc7XG4vL2ltcG9ydCB7IFVSTCB9IGZyb20gJ2pzZG9tLXVybCc7XG5cbmltcG9ydCB7IFNZTUJPTF9OT0RFIH0gZnJvbSAnanMtdHJlZS1saXN0Mi9zcmMvdXRpbHMnO1xuXG5pbXBvcnQgeyBJUm93Q2hhcHRlciwgSVJvd1ZvbHVtZSwgTm92ZWxUcmVlLCBUcmVlTm9kZSwgSVRyZWUsIElUcmVlVG9MaXN0IH0gZnJvbSAnLi4vLi4vdHJlZS9pbmRleCc7XG5cbmV4cG9ydCB7IE5vdmVsVHJlZSB9XG5cbmV4cG9ydCB0eXBlIElPcHRpb25zUnVudGltZSA9IF9JT3B0aW9uc1J1bnRpbWUgJiB7XG5cdG5vdmVsVHJlZT86IE5vdmVsVHJlZSxcbn1cblxuZXhwb3J0IHR5cGUgSU5vdmVsID0gX0lOb3ZlbCAmIHtcblx0bm92ZWxUcmVlPzogTm92ZWxUcmVlLFxufVxuXG5Ac3RhdGljSW1wbGVtZW50czxfTm92ZWxTaXRlLklOb3ZlbFNpdGVTdGF0aWM8Tm92ZWxTaXRlRGVtbz4+KClcbmV4cG9ydCBjbGFzcyBOb3ZlbFNpdGVEZW1vIGV4dGVuZHMgX05vdmVsU2l0ZUJhc2Vcbntcblx0Z2V0T3V0cHV0RGlyPFQgZXh0ZW5kcyBJT3B0aW9uc1J1bnRpbWUgJiBJRG93bmxvYWRPcHRpb25zPihvcHRpb25zOiBULCBub3ZlbE5hbWU/OiBzdHJpbmcpOiBbc3RyaW5nLCBUXVxuXHR7XG5cdFx0Y29uc3QgW1BBVEhfTk9WRUxfTUFJTiwgb3B0aW9uc1J1bnRpbWVdID0gc3VwZXIuZ2V0T3V0cHV0RGlyPFQ+KG9wdGlvbnMsIG5vdmVsTmFtZSk7XG5cblx0XHRvcHRpb25zUnVudGltZS5ub3ZlbFRyZWUgPSBuZXcgTm92ZWxUcmVlKCk7XG5cblx0XHRyZXR1cm4gW1BBVEhfTk9WRUxfTUFJTiwgb3B0aW9uc1J1bnRpbWVdO1xuXHR9XG5cblx0cHJvdGVjdGVkIGFzeW5jIF9wcm9jZXNzTm92ZWxMaXN0TmFtZShub3ZlbDogSU5vdmVsLCBvcHRpb25zUnVudGltZTogSU9wdGlvbnNSdW50aW1lLCAuLi5hcmd2KVxuXHR7XG5cdFx0Y29uc3Qgc2VsZiA9IHRoaXM7XG5cdFx0bGV0IHRyZWVMaXN0ID0gTm92ZWxUcmVlLnRyZWVUb0xpc3Qobm92ZWwubm92ZWxUcmVlLCB0cnVlKTtcblxuXHRcdC8vY29uc29sZS5sb2cobm92ZWwubm92ZWxUcmVlLmNhY2hlLmRlcHRoKTtcblxuXHRcdGlmIChub3ZlbC5ub3ZlbFRyZWUuY2FjaGUuZGVwdGggPiAyKVxuXHRcdHtcblx0XHRcdGxldCBib29sID0gZmFsc2U7XG5cdFx0XHRpZiAob3B0aW9uc1J1bnRpbWUubm9EaXJQcmVmaXggJiYgb3B0aW9uc1J1bnRpbWUubm9GaXJlUHJlZml4KVxuXHRcdFx0e1xuXHRcdFx0XHRib29sID0gdHJ1ZTtcblx0XHRcdH1cblxuXHRcdFx0b3B0aW9uc1J1bnRpbWUubm9EaXJQcmVmaXggPSBvcHRpb25zUnVudGltZS5ub0ZpcmVQcmVmaXggPSBib29sO1xuXHRcdH1cblxuXHRcdHRyZWVMaXN0XG5cdFx0XHQuZm9yRWFjaChmdW5jdGlvbiAobGlzdFJvdylcblx0XHRcdHtcblx0XHRcdFx0bGV0IG5vZGUgPSBsaXN0Um93W1NZTUJPTF9OT0RFXSBhcyBUcmVlTm9kZTxJUm93Q2hhcHRlciB8IElSb3dWb2x1bWU+O1xuXG5cdFx0XHRcdGxldCB2YWx1ZSA9IG5vZGUudmFsdWUoKSBhcyBJUm93Q2hhcHRlciB8IElSb3dWb2x1bWU7XG5cblx0XHRcdFx0aWYgKHR5cGVvZiB2YWx1ZS5uYW1lID09ICdzdHJpbmcnKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0bm9kZS5zZXQoJ25hbWUnLCBzZWxmLnRyaW1GaWxlbmFtZVZvbHVtZSh2YWx1ZS5uYW1lKSk7XG5cdFx0XHRcdH1cblx0XHRcdH0pXG5cdFx0O1xuXG5cdFx0dHJlZUxpc3Rcblx0XHRcdC5mb3JFYWNoKGZ1bmN0aW9uIChsaXN0Um93KVxuXHRcdFx0e1xuXHRcdFx0XHRsZXQgcG5vZGUgPSBsaXN0Um93W1NZTUJPTF9OT0RFXSBhcyBUcmVlTm9kZTtcblx0XHRcdFx0Y29uc3QgbnR5cGUgPSBwbm9kZS5nZXQ8c3RyaW5nPigndHlwZScpO1xuXG5cdFx0XHRcdGNvbnN0IGhhc0NoaWxkID0gcG5vZGUuc2l6ZSgpO1xuXG5cdFx0XHRcdGNvbnN0IGN1cnJlbnRMZXZlbCA9IHBub2RlLmdldDxudW1iZXI+KCdsZXZlbCcpO1xuXG5cdFx0XHRcdC8vY29uc29sZS5sb2coY3VycmVudExldmVsKTtcblx0XHRcdFx0Ly9jb25zb2xlLmxvZyhudHlwZSk7XG5cblx0XHRcdFx0aWYgKG50eXBlICE9ICdyb290Jylcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGxldCBuYW1lID0gcG5vZGUuZ2V0PHN0cmluZz4oJ25hbWUnKTtcblx0XHRcdFx0XHRpZiAobmFtZSA9PT0gbnVsbClcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRwbm9kZS5zZXQoJ25hbWUnLCAnbnVsbCcpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXG5cdFx0XHRcdGlmIChoYXNDaGlsZCAmJiAoXG5cdFx0XHRcdFx0XHQwICYmIChjdXJyZW50TGV2ZWwgPT0gMCAmJiAhb3B0aW9uc1J1bnRpbWUubm9EaXJQcmVmaXgpXG5cdFx0XHRcdFx0XHR8fCAoY3VycmVudExldmVsID4gMCAmJiAhb3B0aW9uc1J1bnRpbWUubm9GaXJlUHJlZml4KVxuXHRcdFx0XHRcdCkgJiYgb3B0aW9uc1J1bnRpbWUuZmlsZVByZWZpeE1vZGUgPj0gMilcblx0XHRcdFx0e1xuXHRcdFx0XHRcdC8vY29uc29sZS5sb2coNzc3KTtcblxuXHRcdFx0XHRcdGxldCBib29sOiBib29sZWFuO1xuXHRcdFx0XHRcdGxldCBpOiBudW1iZXIgPSAwO1xuXHRcdFx0XHRcdGxldCBsYXN0X3ZhbDogc3RyaW5nO1xuXG5cdFx0XHRcdFx0bGV0IGtzOiBzdHJpbmdbXSA9IFtdO1xuXG5cdFx0XHRcdFx0Zm9yIChsZXQgbm9kZSBvZiBwbm9kZS5jaGlsZHJlbilcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRsZXQgbmFtZSA9IG5vZGUuZ2V0PHN0cmluZz4oJ25hbWUnKTtcblx0XHRcdFx0XHRcdGxldCBuYW1lX3ZhbCA9IG5vcm1hbGl6ZV92YWwobmFtZSk7XG5cblx0XHRcdFx0XHRcdG5vZGUuc2V0KCduYW1lX3ZhbCcsIG5hbWVfdmFsKTtcblxuXHRcdFx0XHRcdFx0a3MucHVzaChuYW1lX3ZhbCk7XG5cblx0XHRcdFx0XHRcdGlmIChuYW1lID09PSBudWxsIHx8IG5hbWUgPT0gJ251bGwnKVxuXHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRub2RlLnNldCgnbmFtZScsICdudWxsJyk7XG5cdFx0XHRcdFx0XHRcdG5vZGUuc2V0KCduYW1lX3ZhbCcsICdudWxsJyk7XG5cblx0XHRcdFx0XHRcdFx0Ym9vbCA9IHRydWU7XG5cdFx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHRpZiAoaSAhPT0gMClcblx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0bGV0IGsgPSBkZWZhdWx0U29ydENhbGxiYWNrKGxhc3RfdmFsLCBuYW1lX3ZhbCk7XG5cblx0XHRcdFx0XHRcdFx0aWYgKHR5cGVvZiBrICE9ICdudW1iZXInIHx8IGsgPiAtMSlcblx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdC8vY29uc29sZS5sb2coayk7XG5cblx0XHRcdFx0XHRcdFx0XHRib29sID0gdHJ1ZTtcblx0XHRcdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHRpKys7XG5cdFx0XHRcdFx0XHRsYXN0X3ZhbCA9IG5hbWVfdmFsO1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdGlmICghYm9vbClcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRmb3IgKGxldCBub2RlIG9mIHBub2RlLmNoaWxkcmVuKVxuXHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRpZiAoTm92ZWxUcmVlLmlzVm9sdW1lKG5vZGUpKVxuXHRcdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdFx0bm9kZS52YWx1ZSgpLnZvbHVtZV9pbmRleCA9ICcnO1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdGVsc2UgaWYgKE5vdmVsVHJlZS5pc0NoYXB0ZXIobm9kZSkpXG5cdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHRub2RlLnZhbHVlKCkuY2hhcHRlcl9pbmRleCA9ICcnO1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGVsc2Vcblx0XHRcdFx0XHR7XG5cblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRpZiAoaGFzQ2hpbGQpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRwbm9kZS5jaGlsZHJlbi5mb3JFYWNoKGZ1bmN0aW9uIChub2RlLCBpZHgpXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0bm9kZS5zZXQoJ2lkeCcsIGlkeCk7XG5cdFx0XHRcdFx0fSk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRpZiAoaGFzQ2hpbGQpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRsZXQgZGlybmFtZTogc3RyaW5nO1xuXG5cdFx0XHRcdFx0aWYgKG50eXBlID09ICdyb290Jylcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRkaXJuYW1lID0gJyc7XG5cdFx0XHRcdFx0XHRwbm9kZS5zZXQoJ2Rpcm5hbWUnLCBkaXJuYW1lKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0ZWxzZVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdGxldCBuYW1lID0gcG5vZGUuZ2V0KCduYW1lJyk7XG5cdFx0XHRcdFx0XHRsZXQgdm9sdW1lID0gcG5vZGUudmFsdWUoKSBhcyBJUm93Vm9sdW1lO1xuXHRcdFx0XHRcdFx0bGV0IHZpZCA9IHZvbHVtZS5pZHg7XG5cblx0XHRcdFx0XHRcdGxldCBmYWtlX2NoYXB0ZXI6IElSb3dDaGFwdGVyID0ge1xuXHRcdFx0XHRcdFx0XHRjaGFwdGVyX2luZGV4OiB2b2x1bWUudm9sdW1lX2luZGV4LFxuXHRcdFx0XHRcdFx0XHRjaGFwdGVyX3RpdGxlOiB2b2x1bWUudm9sdW1lX3RpdGxlLFxuXHRcdFx0XHRcdFx0fTtcblxuXHRcdFx0XHRcdFx0Lypcblx0XHRcdFx0XHRcdG5hbWUgPSBnZXRWb2x1bWVQYXRoKHNlbGYsIHtcblx0XHRcdFx0XHRcdFx0dm9sdW1lLFxuXHRcdFx0XHRcdFx0XHR2aWQsXG5cdFx0XHRcdFx0XHRcdHBhdGhfbm92ZWw6ICcnLFxuXHRcdFx0XHRcdFx0fSwgb3B0aW9uc1J1bnRpbWUpO1xuXHRcdFx0XHRcdFx0Ki9cblx0XHRcdFx0XHRcdG5hbWUgPSBnZXRGaWxlUGF0aChzZWxmLCB7XG5cdFx0XHRcdFx0XHRcdGNoYXB0ZXI6IGZha2VfY2hhcHRlciwgY2lkOiB2aWQsXG5cdFx0XHRcdFx0XHRcdGV4dDogJycsXG5cblx0XHRcdFx0XHRcdFx0aWR4OiB2b2x1bWUudG90YWxfaWR4ICsgb3B0aW9uc1J1bnRpbWUuc3RhcnRJbmRleCxcblxuXHRcdFx0XHRcdFx0XHRkaXJuYW1lOiAnfnRlbXAnLFxuXHRcdFx0XHRcdFx0XHR2b2x1bWUsIHZpZCxcblx0XHRcdFx0XHRcdH0sIG9wdGlvbnNSdW50aW1lKTtcblxuXHRcdFx0XHRcdFx0bmFtZSA9IHBhdGgucmVsYXRpdmUoJ350ZW1wJywgbmFtZSk7XG5cblx0XHRcdFx0XHRcdGxldCBwcyA9IHBub2RlLnBhcmVudC5nZXQoJ2Rpcm5hbWUnKTtcblx0XHRcdFx0XHRcdGRpcm5hbWUgPSBwYXRoLmpvaW4ocHMsIG5hbWUpO1xuXHRcdFx0XHRcdFx0cG5vZGUuc2V0KCdkaXJuYW1lJywgZGlybmFtZSk7XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0Ly9jb25zb2xlLmxvZyhkaXJuYW1lKTtcblx0XHRcdFx0fVxuXHRcdFx0fSlcblx0XHQ7XG5cblx0XHQvL3Byb2Nlc3MuZXhpdCgpO1xuXG5cdFx0cmV0dXJuIHRyZWVMaXN0O1xuXHR9XG5cblx0YXN5bmMgX3Byb2Nlc3NOb3ZlbDxUPihub3ZlbDogSU5vdmVsLCBvcHRpb25zUnVudGltZTogSU9wdGlvbnNSdW50aW1lLCBfY2FjaGVfOiB7XG5cdFx0dXJsOiBVUkwsXG5cdFx0cGF0aF9ub3ZlbDogc3RyaW5nLFxuXHR9LCAuLi5hcmd2KVxuXHR7XG5cdFx0Y29uc3Qgc2VsZiA9IHRoaXM7XG5cblx0XHRsZXQgeyB1cmwsIHBhdGhfbm92ZWwgfSA9IF9jYWNoZV87XG5cblx0XHRsZXQgdHJlZUxpc3QgPSBhd2FpdCBzZWxmLl9wcm9jZXNzTm92ZWxMaXN0TmFtZShub3ZlbCwgb3B0aW9uc1J1bnRpbWUsIF9jYWNoZV8sIC4uLmFyZ3YpO1xuXG5cdFx0Ly9jb25zb2xlLmxvZyhvcHRpb25zUnVudGltZSk7XG5cblx0XHRyZXR1cm4gUHJvbWlzZUJsdWViaXJkXG5cdFx0XHQubWFwU2VyaWVzKHRyZWVMaXN0LnNsaWNlKDEpLCBhc3luYyAobGlzdFJvdykgPT5cblx0XHRcdHtcblx0XHRcdFx0bGV0IG5vZGVDaGFwdGVyID0gbGlzdFJvd1tTWU1CT0xfTk9ERV0gYXMgVHJlZU5vZGU8SVJvd0NoYXB0ZXI+O1xuXHRcdFx0XHRsZXQgbnR5cGUgPSBub2RlQ2hhcHRlci5nZXQoJ3R5cGUnKTtcblxuXHRcdFx0XHRpZiAobnR5cGUgIT0gJ2NoYXB0ZXInKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0aWYgKG50eXBlID09ICd2b2x1bWUnKVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdG5vZGVDaGFwdGVyLnNldCgnbmFtZScsIHNlbGYudHJpbUZpbGVuYW1lVm9sdW1lKG5vZGVDaGFwdGVyLmdldCgndm9sdW1lX3RpdGxlJykpKTtcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRyZXR1cm47XG5cdFx0XHRcdH1cblx0XHRcdFx0ZWxzZVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0bm9kZUNoYXB0ZXIuc2V0KCduYW1lJywgc2VsZi50cmltRmlsZW5hbWVWb2x1bWUobm9kZUNoYXB0ZXIuZ2V0KCdjaGFwdGVyX3RpdGxlJykpKTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGxldCBub2RlVm9sdW1lID0gbm9kZUNoYXB0ZXIucGFyZW50IGFzIGFueSBhcyBUcmVlTm9kZTxJUm93Vm9sdW1lPjtcblxuXHRcdFx0XHRsZXQgdm9sdW1lID0gbm9kZVZvbHVtZS52YWx1ZSgpIGFzIElSb3dWb2x1bWU7XG5cdFx0XHRcdGxldCBjaGFwdGVyID0gbm9kZUNoYXB0ZXIudmFsdWUoKSBhcyBJUm93Q2hhcHRlcjtcblxuXHRcdFx0XHRsZXQgZGlybmFtZSA9IHZvbHVtZS5kaXJuYW1lO1xuXG5cdFx0XHRcdGxldCBjaWQgPSBjaGFwdGVyLmlkeDtcblx0XHRcdFx0bGV0IHZpZCA9IHZvbHVtZS5pZHg7XG5cblx0XHRcdFx0Y29uc3QgY3VycmVudF9pZHggPSBjaGFwdGVyLnRvdGFsX2lkeCArIG9wdGlvbnNSdW50aW1lLnN0YXJ0SW5kZXg7XG5cblx0XHRcdFx0bGV0IGZpbGUgPSBnZXRGaWxlUGF0aChzZWxmLCB7XG5cdFx0XHRcdFx0Y2hhcHRlciwgY2lkLFxuXHRcdFx0XHRcdGV4dDogJy50eHQnLFxuXG5cdFx0XHRcdFx0aWR4OiBjdXJyZW50X2lkeCxcblxuXHRcdFx0XHRcdGRpcm5hbWUsXG5cdFx0XHRcdFx0dm9sdW1lLCB2aWQsXG5cdFx0XHRcdH0sIG9wdGlvbnNSdW50aW1lKTtcblxuXHRcdFx0XHRjaGFwdGVyLnBhdGggPSBmaWxlO1xuXG5cdFx0XHRcdGZpbGUgPSBwYXRoLmpvaW4ocGF0aF9ub3ZlbCwgZmlsZSk7XG5cblx0XHRcdFx0aWYgKHNlbGYuX2NoZWNrRXhpc3RzKG9wdGlvbnNSdW50aW1lLCBmaWxlKSlcblx0XHRcdFx0e1xuXHRcdFx0XHRcdHJldHVybiBmaWxlO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0bGV0IHVybCA9IHNlbGYuX2NyZWF0ZUNoYXB0ZXJVcmwoe1xuXHRcdFx0XHRcdG5vdmVsLFxuXHRcdFx0XHRcdHZvbHVtZSxcblx0XHRcdFx0XHRjaGFwdGVyLFxuXHRcdFx0XHR9LCBvcHRpb25zUnVudGltZSk7XG5cblx0XHRcdFx0YXdhaXQgc2VsZi5fZmV0Y2hDaGFwdGVyTWFpbih7XG5cdFx0XHRcdFx0XHR1cmwsXG5cdFx0XHRcdFx0XHRmaWxlLFxuXHRcdFx0XHRcdFx0dm9sdW1lLFxuXHRcdFx0XHRcdFx0Y2hhcHRlcixcblx0XHRcdFx0XHR9LCBvcHRpb25zUnVudGltZSwge1xuXHRcdFx0XHRcdFx0bm92ZWwsXG5cdFx0XHRcdFx0fSlcblx0XHRcdFx0XHQudGhlbihhc3luYyAodGV4dDogc3RyaW5nKSA9PlxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdGF3YWl0IHRoaXMuX3NhdmVGaWxlKHtcblx0XHRcdFx0XHRcdFx0ZmlsZSxcblx0XHRcdFx0XHRcdFx0Y29udGV4dDogdGV4dCxcblx0XHRcdFx0XHRcdFx0b3B0aW9uc1J1bnRpbWUsXG5cdFx0XHRcdFx0XHR9KTtcblxuXHRcdFx0XHRcdFx0cmV0dXJuIHRleHQ7XG5cdFx0XHRcdFx0fSlcblx0XHRcdFx0O1xuXG5cdFx0XHRcdHJldHVybiBmaWxlO1xuXHRcdFx0fSlcblx0XHRcdC50aGVuKGZ1bmN0aW9uIChyZXQpXG5cdFx0XHR7XG5cdFx0XHRcdHJldHVybiByZXQgYXMgYW55IGFzIFQ7XG5cdFx0XHR9KVxuXHRcdFx0O1xuXHR9XG5cblx0cHJvdGVjdGVkIF9zYXZlUmVhZG1lKG9wdGlvbnNSdW50aW1lOiBJT3B0aW9uc1J1bnRpbWUsIG9wdGlvbnMgPSB7fSwgLi4ub3B0cylcblx0e1xuXHRcdGxldCBub3ZlbCA9IG9wdGlvbnNSdW50aW1lW1NZTUJPTF9DQUNIRV0ubm92ZWw7XG5cblx0XHRpZiAobm92ZWwubm92ZWxUcmVlKVxuXHRcdHtcblx0XHRcdGNvbnN0IG5vdmVsVHJlZSA9IG5vdmVsLm5vdmVsVHJlZTtcblxuXHRcdFx0bm92ZWwubm92ZWxUcmVlID0gbm92ZWxUcmVlLnRvSlNPTigpO1xuXHRcdH1cblxuXHRcdHJldHVybiBzdXBlci5fc2F2ZVJlYWRtZShvcHRpb25zUnVudGltZSwgb3B0aW9ucywgLi4ub3B0cyk7XG5cdH1cbn1cblxuZXhwb3J0IGNvbnN0IE5vdmVsU2l0ZSA9IE5vdmVsU2l0ZURlbW8gYXMgdHlwZW9mIE5vdmVsU2l0ZURlbW87XG5leHBvcnQgZGVmYXVsdCBOb3ZlbFNpdGVEZW1vO1xuIl19