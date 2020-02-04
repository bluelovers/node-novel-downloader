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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHJlZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInRyZWUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOztHQUVHOzs7Ozs7Ozs7OztBQUVILDRCQUF1QjtBQUN2QixpQ0FBa0g7QUFFbEgsOEJBQW1EO0FBQ25ELG9DQUFpRztBQUNqRywrQkFBK0I7QUFFL0IseURBQTZEO0FBQzdELHFEQUFpRTtBQU9qRSxtREFBc0Q7QUFFdEQsNENBQW9HO0FBRTNGLG9CQUZ5QixpQkFBUyxDQUV6QjtBQVdsQixJQUFhLGFBQWEsR0FBMUIsTUFBYSxhQUFjLFNBQVEsY0FBYztJQUVoRCxZQUFZLENBQStDLE9BQVUsRUFBRSxTQUFrQjtRQUV4RixNQUFNLENBQUMsZUFBZSxFQUFFLGNBQWMsQ0FBQyxHQUFHLEtBQUssQ0FBQyxZQUFZLENBQUksT0FBTyxFQUFFLFNBQVMsQ0FBQyxDQUFDO1FBRXBGLGNBQWMsQ0FBQyxTQUFTLEdBQUcsSUFBSSxpQkFBUyxFQUFFLENBQUM7UUFFM0MsT0FBTyxDQUFDLGVBQWUsRUFBRSxjQUFjLENBQUMsQ0FBQztJQUMxQyxDQUFDO0lBRVMsS0FBSyxDQUFDLHFCQUFxQixDQUFDLEtBQWEsRUFBRSxjQUErQixFQUFFLEdBQUcsSUFBSTtRQUU1RixNQUFNLElBQUksR0FBRyxJQUFJLENBQUM7UUFDbEIsSUFBSSxRQUFRLEdBQUcsaUJBQVMsQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLFNBQVMsRUFBRSxJQUFJLENBQUMsQ0FBQztRQUUzRCwyQ0FBMkM7UUFFM0MsSUFBSSxLQUFLLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxLQUFLLEdBQUcsQ0FBQyxFQUNuQztZQUNDLElBQUksSUFBSSxHQUFHLEtBQUssQ0FBQztZQUNqQixJQUFJLGNBQWMsQ0FBQyxXQUFXLElBQUksY0FBYyxDQUFDLFlBQVksRUFDN0Q7Z0JBQ0MsSUFBSSxHQUFHLElBQUksQ0FBQzthQUNaO1lBRUQsY0FBYyxDQUFDLFdBQVcsR0FBRyxjQUFjLENB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QUUsQ0FBQztTQUNyQztRQUVELE9BQU8sS0FBSyxDQUFDLFdBQVcsQ0FBQyxjQUFjLEVBQUUsT0FBTyxFQUFFLEdBQUcsSUFBSSxDQUFDLENBQUM7SUFDNUQsQ0FBQztDQUNELENBQUE7QUFuVFksYUFBYTtJQUR6Qix3QkFBZ0IsRUFBOEM7R0FDbEQsYUFBYSxDQW1UekI7QUFuVFksc0NBQWE7QUFxVGIsUUFBQSxTQUFTLEdBQUcsYUFBcUMsQ0FBQztBQUMvRCxrQkFBZSxhQUFhLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENyZWF0ZWQgYnkgdXNlciBvbiAyMDE4LzQvNC8wMDQuXG4gKi9cblxuZXhwb3J0ICogZnJvbSAnLi9iYXNlJztcbmltcG9ydCBfTm92ZWxTaXRlQmFzZSwgeyBJRG93bmxvYWRPcHRpb25zLCBJT3B0aW9uc1J1bnRpbWUgYXMgX0lPcHRpb25zUnVudGltZSwgSU5vdmVsIGFzIF9JTm92ZWwgfSBmcm9tICcuL2Jhc2UnO1xuXG5pbXBvcnQgeyBnZXRGaWxlUGF0aCwgZ2V0Vm9sdW1lUGF0aCB9IGZyb20gJy4uL2ZzJztcbmltcG9ydCBfTm92ZWxTaXRlLCB7IElDaGFwdGVyLCBQcm9taXNlQmx1ZWJpcmQsIHN0YXRpY0ltcGxlbWVudHMsIFNZTUJPTF9DQUNIRSB9IGZyb20gJy4uL2luZGV4JztcbmltcG9ydCAqIGFzIHBhdGggZnJvbSAndXBhdGgyJztcblxuaW1wb3J0IHsgbm9ybWFsaXplX3ZhbCB9IGZyb20gJ25vZGUtbm92ZWwtZ2xvYmJ5L2xpYi9oZWxwZXInO1xuaW1wb3J0IHsgZGVmYXVsdFNvcnRDYWxsYmFjayB9IGZyb20gJ25vZGUtbm92ZWwtZ2xvYmJ5L2xpYi9zb3J0JztcblxuaW1wb3J0IGZzID0gcmVxdWlyZSgnZnMtZXh0cmEnKTtcbmltcG9ydCB7IHRyaW1GaWxlbmFtZSB9IGZyb20gJ2ZzLWljb252L3V0aWwnO1xuaW1wb3J0IG5vdmVsVGV4dCBmcm9tICdub3ZlbC10ZXh0JztcbmltcG9ydCB7IFVSTCB9IGZyb20gJ2pzZG9tLXVybCc7XG5cbmltcG9ydCB7IFNZTUJPTF9OT0RFIH0gZnJvbSAnanMtdHJlZS1saXN0Mi9zcmMvdXRpbHMnO1xuXG5pbXBvcnQgeyBJUm93Q2hhcHRlciwgSVJvd1ZvbHVtZSwgTm92ZWxUcmVlLCBUcmVlTm9kZSwgSVRyZWUsIElUcmVlVG9MaXN0IH0gZnJvbSAnLi4vLi4vdHJlZS9pbmRleCc7XG5cbmV4cG9ydCB7IE5vdmVsVHJlZSB9XG5cbmV4cG9ydCB0eXBlIElPcHRpb25zUnVudGltZSA9IF9JT3B0aW9uc1J1bnRpbWUgJiB7XG5cdG5vdmVsVHJlZT86IE5vdmVsVHJlZSxcbn1cblxuZXhwb3J0IHR5cGUgSU5vdmVsID0gX0lOb3ZlbCAmIHtcblx0bm92ZWxUcmVlPzogTm92ZWxUcmVlLFxufVxuXG5Ac3RhdGljSW1wbGVtZW50czxfTm92ZWxTaXRlLklOb3ZlbFNpdGVTdGF0aWM8Tm92ZWxTaXRlRGVtbz4+KClcbmV4cG9ydCBjbGFzcyBOb3ZlbFNpdGVEZW1vIGV4dGVuZHMgX05vdmVsU2l0ZUJhc2Vcbntcblx0Z2V0T3V0cHV0RGlyPFQgZXh0ZW5kcyBJT3B0aW9uc1J1bnRpbWUgJiBJRG93bmxvYWRPcHRpb25zPihvcHRpb25zOiBULCBub3ZlbE5hbWU/OiBzdHJpbmcpOiBbc3RyaW5nLCBUXVxuXHR7XG5cdFx0Y29uc3QgW1BBVEhfTk9WRUxfTUFJTiwgb3B0aW9uc1J1bnRpbWVdID0gc3VwZXIuZ2V0T3V0cHV0RGlyPFQ+KG9wdGlvbnMsIG5vdmVsTmFtZSk7XG5cblx0XHRvcHRpb25zUnVudGltZS5ub3ZlbFRyZWUgPSBuZXcgTm92ZWxUcmVlKCk7XG5cblx0XHRyZXR1cm4gW1BBVEhfTk9WRUxfTUFJTiwgb3B0aW9uc1J1bnRpbWVdO1xuXHR9XG5cblx0cHJvdGVjdGVkIGFzeW5jIF9wcm9jZXNzTm92ZWxMaXN0TmFtZShub3ZlbDogSU5vdmVsLCBvcHRpb25zUnVudGltZTogSU9wdGlvbnNSdW50aW1lLCAuLi5hcmd2KVxuXHR7XG5cdFx0Y29uc3Qgc2VsZiA9IHRoaXM7XG5cdFx0bGV0IHRyZWVMaXN0ID0gTm92ZWxUcmVlLnRyZWVUb0xpc3Qobm92ZWwubm92ZWxUcmVlLCB0cnVlKTtcblxuXHRcdC8vY29uc29sZS5sb2cobm92ZWwubm92ZWxUcmVlLmNhY2hlLmRlcHRoKTtcblxuXHRcdGlmIChub3ZlbC5ub3ZlbFRyZWUuY2FjaGUuZGVwdGggPiAyKVxuXHRcdHtcblx0XHRcdGxldCBib29sID0gZmFsc2U7XG5cdFx0XHRpZiAob3B0aW9uc1J1bnRpbWUubm9EaXJQcmVmaXggJiYgb3B0aW9uc1J1bnRpbWUubm9GaXJlUHJlZml4KVxuXHRcdFx0e1xuXHRcdFx0XHRib29sID0gdHJ1ZTtcblx0XHRcdH1cblxuXHRcdFx0b3B0aW9uc1J1bnRpbWUubm9EaXJQcmVmaXggPSBvcHRpb25zUnVudGltZS5ub0ZpcmVQcmVmaXggPSBib29sO1xuXHRcdH1cblxuXHRcdHRyZWVMaXN0XG5cdFx0XHQuZm9yRWFjaChmdW5jdGlvbiAobGlzdFJvdylcblx0XHRcdHtcblx0XHRcdFx0bGV0IG5vZGUgPSBsaXN0Um93W1NZTUJPTF9OT0RFXSBhcyBUcmVlTm9kZTxJUm93Q2hhcHRlciB8IElSb3dWb2x1bWU+O1xuXG5cdFx0XHRcdGxldCB2YWx1ZSA9IG5vZGUudmFsdWUoKSBhcyBJUm93Q2hhcHRlciB8IElSb3dWb2x1bWU7XG5cblx0XHRcdFx0aWYgKHR5cGVvZiB2YWx1ZS5uYW1lID09ICdzdHJpbmcnKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0bm9kZS5zZXQoJ25hbWUnLCBzZWxmLnRyaW1GaWxlbmFtZVZvbHVtZSh2YWx1ZS5uYW1lKSk7XG5cdFx0XHRcdH1cblx0XHRcdH0pXG5cdFx0O1xuXG5cdFx0dHJlZUxpc3Rcblx0XHRcdC5mb3JFYWNoKGZ1bmN0aW9uIChsaXN0Um93KVxuXHRcdFx0e1xuXHRcdFx0XHRsZXQgcG5vZGUgPSBsaXN0Um93W1NZTUJPTF9OT0RFXSBhcyBUcmVlTm9kZTtcblx0XHRcdFx0Y29uc3QgbnR5cGUgPSBwbm9kZS5nZXQ8c3RyaW5nPigndHlwZScpO1xuXG5cdFx0XHRcdGNvbnN0IGhhc0NoaWxkID0gcG5vZGUuc2l6ZSgpO1xuXG5cdFx0XHRcdGNvbnN0IGN1cnJlbnRMZXZlbCA9IHBub2RlLmdldDxudW1iZXI+KCdsZXZlbCcpO1xuXG5cdFx0XHRcdC8vY29uc29sZS5sb2coY3VycmVudExldmVsKTtcblx0XHRcdFx0Ly9jb25zb2xlLmxvZyhudHlwZSk7XG5cblx0XHRcdFx0aWYgKG50eXBlICE9ICdyb290Jylcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGxldCBuYW1lID0gcG5vZGUuZ2V0PHN0cmluZz4oJ25hbWUnKTtcblx0XHRcdFx0XHRpZiAobmFtZSA9PT0gbnVsbClcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRwbm9kZS5zZXQoJ25hbWUnLCAnbnVsbCcpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXG5cdFx0XHRcdGlmIChoYXNDaGlsZCAmJiAoXG5cdFx0XHRcdFx0XHQwICYmIChjdXJyZW50TGV2ZWwgPT0gMCAmJiAhb3B0aW9uc1J1bnRpbWUubm9EaXJQcmVmaXgpXG5cdFx0XHRcdFx0XHR8fCAoY3VycmVudExldmVsID4gMCAmJiAhb3B0aW9uc1J1bnRpbWUubm9GaXJlUHJlZml4KVxuXHRcdFx0XHRcdCkgJiYgb3B0aW9uc1J1bnRpbWUuZmlsZVByZWZpeE1vZGUgPj0gMilcblx0XHRcdFx0e1xuXHRcdFx0XHRcdC8vY29uc29sZS5sb2coNzc3KTtcblxuXHRcdFx0XHRcdGxldCBib29sOiBib29sZWFuO1xuXHRcdFx0XHRcdGxldCBpOiBudW1iZXIgPSAwO1xuXHRcdFx0XHRcdGxldCBsYXN0X3ZhbDogc3RyaW5nO1xuXG5cdFx0XHRcdFx0bGV0IGtzOiBzdHJpbmdbXSA9IFtdO1xuXG5cdFx0XHRcdFx0Zm9yIChsZXQgbm9kZSBvZiBwbm9kZS5jaGlsZHJlbilcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRsZXQgbmFtZSA9IG5vZGUuZ2V0PHN0cmluZz4oJ25hbWUnKTtcblx0XHRcdFx0XHRcdGxldCBuYW1lX3ZhbCA9IG5vcm1hbGl6ZV92YWwobmFtZSk7XG5cblx0XHRcdFx0XHRcdG5vZGUuc2V0KCduYW1lX3ZhbCcsIG5hbWVfdmFsKTtcblxuXHRcdFx0XHRcdFx0a3MucHVzaChuYW1lX3ZhbCk7XG5cblx0XHRcdFx0XHRcdGlmIChuYW1lID09PSBudWxsIHx8IG5hbWUgPT0gJ251bGwnKVxuXHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRub2RlLnNldCgnbmFtZScsICdudWxsJyk7XG5cdFx0XHRcdFx0XHRcdG5vZGUuc2V0KCduYW1lX3ZhbCcsICdudWxsJyk7XG5cblx0XHRcdFx0XHRcdFx0Ym9vbCA9IHRydWU7XG5cdFx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHRpZiAoaSAhPT0gMClcblx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0bGV0IGsgPSBkZWZhdWx0U29ydENhbGxiYWNrKGxhc3RfdmFsLCBuYW1lX3ZhbCk7XG5cblx0XHRcdFx0XHRcdFx0aWYgKHR5cGVvZiBrICE9ICdudW1iZXInIHx8IGsgPiAtMSlcblx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdC8vY29uc29sZS5sb2coayk7XG5cblx0XHRcdFx0XHRcdFx0XHRib29sID0gdHJ1ZTtcblx0XHRcdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHRpKys7XG5cdFx0XHRcdFx0XHRsYXN0X3ZhbCA9IG5hbWVfdmFsO1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdGlmICghYm9vbClcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRmb3IgKGxldCBub2RlIG9mIHBub2RlLmNoaWxkcmVuKVxuXHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRpZiAoTm92ZWxUcmVlLmlzVm9sdW1lKG5vZGUpKVxuXHRcdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdFx0bm9kZS52YWx1ZSgpLnZvbHVtZV9pbmRleCA9ICcnO1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdGVsc2UgaWYgKE5vdmVsVHJlZS5pc0NoYXB0ZXIobm9kZSkpXG5cdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHRub2RlLnZhbHVlKCkuY2hhcHRlcl9pbmRleCA9ICcnO1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGVsc2Vcblx0XHRcdFx0XHR7XG5cblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRpZiAoaGFzQ2hpbGQpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRwbm9kZS5jaGlsZHJlbi5mb3JFYWNoKGZ1bmN0aW9uIChub2RlLCBpZHgpXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0bm9kZS5zZXQoJ2lkeCcsIGlkeCk7XG5cdFx0XHRcdFx0fSk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRpZiAoaGFzQ2hpbGQpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRsZXQgZGlybmFtZTogc3RyaW5nO1xuXG5cdFx0XHRcdFx0aWYgKG50eXBlID09ICdyb290Jylcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRkaXJuYW1lID0gJyc7XG5cdFx0XHRcdFx0XHRwbm9kZS5zZXQoJ2Rpcm5hbWUnLCBkaXJuYW1lKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0ZWxzZVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdGxldCBuYW1lID0gcG5vZGUuZ2V0KCduYW1lJyk7XG5cdFx0XHRcdFx0XHRsZXQgdm9sdW1lID0gcG5vZGUudmFsdWUoKSBhcyBJUm93Vm9sdW1lO1xuXHRcdFx0XHRcdFx0bGV0IHZpZCA9IHZvbHVtZS5pZHg7XG5cblx0XHRcdFx0XHRcdGxldCBmYWtlX2NoYXB0ZXI6IElSb3dDaGFwdGVyID0ge1xuXHRcdFx0XHRcdFx0XHRjaGFwdGVyX2luZGV4OiB2b2x1bWUudm9sdW1lX2luZGV4LFxuXHRcdFx0XHRcdFx0XHRjaGFwdGVyX3RpdGxlOiB2b2x1bWUudm9sdW1lX3RpdGxlLFxuXHRcdFx0XHRcdFx0fTtcblxuXHRcdFx0XHRcdFx0Lypcblx0XHRcdFx0XHRcdG5hbWUgPSBnZXRWb2x1bWVQYXRoKHNlbGYsIHtcblx0XHRcdFx0XHRcdFx0dm9sdW1lLFxuXHRcdFx0XHRcdFx0XHR2aWQsXG5cdFx0XHRcdFx0XHRcdHBhdGhfbm92ZWw6ICcnLFxuXHRcdFx0XHRcdFx0fSwgb3B0aW9uc1J1bnRpbWUpO1xuXHRcdFx0XHRcdFx0Ki9cblx0XHRcdFx0XHRcdG5hbWUgPSBnZXRGaWxlUGF0aChzZWxmLCB7XG5cdFx0XHRcdFx0XHRcdGNoYXB0ZXI6IGZha2VfY2hhcHRlciwgY2lkOiB2aWQsXG5cdFx0XHRcdFx0XHRcdGV4dDogJycsXG5cblx0XHRcdFx0XHRcdFx0aWR4OiB2b2x1bWUudG90YWxfaWR4ICsgb3B0aW9uc1J1bnRpbWUuc3RhcnRJbmRleCxcblxuXHRcdFx0XHRcdFx0XHRkaXJuYW1lOiAnfnRlbXAnLFxuXHRcdFx0XHRcdFx0XHR2b2x1bWUsIHZpZCxcblx0XHRcdFx0XHRcdH0sIG9wdGlvbnNSdW50aW1lKTtcblxuXHRcdFx0XHRcdFx0bmFtZSA9IHBhdGgucmVsYXRpdmUoJ350ZW1wJywgbmFtZSk7XG5cblx0XHRcdFx0XHRcdGxldCBwcyA9IHBub2RlLnBhcmVudC5nZXQoJ2Rpcm5hbWUnKTtcblx0XHRcdFx0XHRcdGRpcm5hbWUgPSBwYXRoLmpvaW4ocHMsIG5hbWUpO1xuXHRcdFx0XHRcdFx0cG5vZGUuc2V0KCdkaXJuYW1lJywgZGlybmFtZSk7XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0Ly9jb25zb2xlLmxvZyhkaXJuYW1lKTtcblx0XHRcdFx0fVxuXHRcdFx0fSlcblx0XHQ7XG5cblx0XHQvL3Byb2Nlc3MuZXhpdCgpO1xuXG5cdFx0cmV0dXJuIHRyZWVMaXN0O1xuXHR9XG5cblx0YXN5bmMgX3Byb2Nlc3NOb3ZlbDxUPihub3ZlbDogSU5vdmVsLCBvcHRpb25zUnVudGltZTogSU9wdGlvbnNSdW50aW1lLCBfY2FjaGVfOiB7XG5cdFx0dXJsOiBVUkwsXG5cdFx0cGF0aF9ub3ZlbDogc3RyaW5nLFxuXHR9LCAuLi5hcmd2KVxuXHR7XG5cdFx0Y29uc3Qgc2VsZiA9IHRoaXM7XG5cblx0XHRsZXQgeyB1cmwsIHBhdGhfbm92ZWwgfSA9IF9jYWNoZV87XG5cblx0XHRsZXQgdHJlZUxpc3QgPSBhd2FpdCBzZWxmLl9wcm9jZXNzTm92ZWxMaXN0TmFtZShub3ZlbCwgb3B0aW9uc1J1bnRpbWUsIF9jYWNoZV8sIC4uLmFyZ3YpO1xuXG5cdFx0Ly9jb25zb2xlLmxvZyhvcHRpb25zUnVudGltZSk7XG5cblx0XHRyZXR1cm4gUHJvbWlzZUJsdWViaXJkXG5cdFx0XHQubWFwU2VyaWVzKHRyZWVMaXN0LnNsaWNlKDEpLCBhc3luYyAobGlzdFJvdykgPT5cblx0XHRcdHtcblx0XHRcdFx0bGV0IG5vZGVDaGFwdGVyID0gbGlzdFJvd1tTWU1CT0xfTk9ERV0gYXMgVHJlZU5vZGU8SVJvd0NoYXB0ZXI+O1xuXHRcdFx0XHRsZXQgbnR5cGUgPSBub2RlQ2hhcHRlci5nZXQoJ3R5cGUnKTtcblxuXHRcdFx0XHRpZiAobnR5cGUgIT0gJ2NoYXB0ZXInKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0aWYgKG50eXBlID09ICd2b2x1bWUnKVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdG5vZGVDaGFwdGVyLnNldCgnbmFtZScsIHNlbGYudHJpbUZpbGVuYW1lVm9sdW1lKG5vZGVDaGFwdGVyLmdldCgndm9sdW1lX3RpdGxlJykpKTtcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRyZXR1cm47XG5cdFx0XHRcdH1cblx0XHRcdFx0ZWxzZVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0bm9kZUNoYXB0ZXIuc2V0KCduYW1lJywgc2VsZi50cmltRmlsZW5hbWVWb2x1bWUobm9kZUNoYXB0ZXIuZ2V0KCdjaGFwdGVyX3RpdGxlJykpKTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGxldCBub2RlVm9sdW1lID0gbm9kZUNoYXB0ZXIucGFyZW50IGFzIGFueSBhcyBUcmVlTm9kZTxJUm93Vm9sdW1lPjtcblxuXHRcdFx0XHRsZXQgdm9sdW1lID0gbm9kZVZvbHVtZS52YWx1ZSgpIGFzIElSb3dWb2x1bWU7XG5cdFx0XHRcdGxldCBjaGFwdGVyID0gbm9kZUNoYXB0ZXIudmFsdWUoKSBhcyBJUm93Q2hhcHRlcjtcblxuXHRcdFx0XHRsZXQgZGlybmFtZSA9IHZvbHVtZS5kaXJuYW1lO1xuXG5cdFx0XHRcdGxldCBjaWQgPSBjaGFwdGVyLmlkeDtcblx0XHRcdFx0bGV0IHZpZCA9IHZvbHVtZS5pZHg7XG5cblx0XHRcdFx0Y29uc3QgY3VycmVudF9pZHggPSBjaGFwdGVyLnRvdGFsX2lkeCArIG9wdGlvbnNSdW50aW1lLnN0YXJ0SW5kZXg7XG5cblx0XHRcdFx0bGV0IGZpbGUgPSBnZXRGaWxlUGF0aChzZWxmLCB7XG5cdFx0XHRcdFx0Y2hhcHRlciwgY2lkLFxuXHRcdFx0XHRcdGV4dDogJy50eHQnLFxuXG5cdFx0XHRcdFx0aWR4OiBjdXJyZW50X2lkeCxcblxuXHRcdFx0XHRcdGRpcm5hbWUsXG5cdFx0XHRcdFx0dm9sdW1lLCB2aWQsXG5cdFx0XHRcdH0sIG9wdGlvbnNSdW50aW1lKTtcblxuXHRcdFx0XHRjaGFwdGVyLnBhdGggPSBmaWxlO1xuXG5cdFx0XHRcdGZpbGUgPSBwYXRoLmpvaW4ocGF0aF9ub3ZlbCwgZmlsZSk7XG5cblx0XHRcdFx0aWYgKHNlbGYuX2NoZWNrRXhpc3RzKG9wdGlvbnNSdW50aW1lLCBmaWxlKSlcblx0XHRcdFx0e1xuXHRcdFx0XHRcdHJldHVybiBmaWxlO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0bGV0IHVybCA9IHNlbGYuX2NyZWF0ZUNoYXB0ZXJVcmwoe1xuXHRcdFx0XHRcdG5vdmVsLFxuXHRcdFx0XHRcdHZvbHVtZSxcblx0XHRcdFx0XHRjaGFwdGVyLFxuXHRcdFx0XHR9LCBvcHRpb25zUnVudGltZSk7XG5cblx0XHRcdFx0YXdhaXQgc2VsZi5fZmV0Y2hDaGFwdGVyTWFpbih7XG5cdFx0XHRcdFx0XHR1cmwsXG5cdFx0XHRcdFx0XHRmaWxlLFxuXHRcdFx0XHRcdFx0dm9sdW1lLFxuXHRcdFx0XHRcdFx0Y2hhcHRlcixcblx0XHRcdFx0XHR9LCBvcHRpb25zUnVudGltZSwge1xuXHRcdFx0XHRcdFx0bm92ZWwsXG5cdFx0XHRcdFx0fSlcblx0XHRcdFx0XHQudGhlbihhc3luYyAodGV4dDogc3RyaW5nKSA9PlxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdGF3YWl0IHRoaXMuX3NhdmVGaWxlKHtcblx0XHRcdFx0XHRcdFx0ZmlsZSxcblx0XHRcdFx0XHRcdFx0Y29udGV4dDogdGV4dCxcblx0XHRcdFx0XHRcdFx0b3B0aW9uc1J1bnRpbWUsXG5cdFx0XHRcdFx0XHR9KTtcblxuXHRcdFx0XHRcdFx0cmV0dXJuIHRleHQ7XG5cdFx0XHRcdFx0fSlcblx0XHRcdFx0O1xuXG5cdFx0XHRcdHJldHVybiBmaWxlO1xuXHRcdFx0fSlcblx0XHRcdC50aGVuKGZ1bmN0aW9uIChyZXQpXG5cdFx0XHR7XG5cdFx0XHRcdHJldHVybiByZXQgYXMgYW55IGFzIFQ7XG5cdFx0XHR9KVxuXHRcdFx0O1xuXHR9XG5cblx0cHJvdGVjdGVkIF9zYXZlUmVhZG1lKG9wdGlvbnNSdW50aW1lOiBJT3B0aW9uc1J1bnRpbWUsIG9wdGlvbnMgPSB7fSwgLi4ub3B0cylcblx0e1xuXHRcdGxldCBub3ZlbCA9IG9wdGlvbnNSdW50aW1lW1NZTUJPTF9DQUNIRV0ubm92ZWw7XG5cblx0XHRpZiAobm92ZWwubm92ZWxUcmVlKVxuXHRcdHtcblx0XHRcdGNvbnN0IG5vdmVsVHJlZSA9IG5vdmVsLm5vdmVsVHJlZTtcblxuXHRcdFx0bm92ZWwubm92ZWxUcmVlID0gbm92ZWxUcmVlLnRvSlNPTigpO1xuXHRcdH1cblxuXHRcdHJldHVybiBzdXBlci5fc2F2ZVJlYWRtZShvcHRpb25zUnVudGltZSwgb3B0aW9ucywgLi4ub3B0cyk7XG5cdH1cbn1cblxuZXhwb3J0IGNvbnN0IE5vdmVsU2l0ZSA9IE5vdmVsU2l0ZURlbW8gYXMgdHlwZW9mIE5vdmVsU2l0ZURlbW87XG5leHBvcnQgZGVmYXVsdCBOb3ZlbFNpdGVEZW1vO1xuIl19