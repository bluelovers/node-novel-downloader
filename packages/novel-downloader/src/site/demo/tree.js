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
const fs = require("fs-extra");
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
            .mapSeries(treeList.slice(1), async function (listRow) {
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
            await self._fetchChapter(url, optionsRuntime)
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
                .then(async function (text) {
                await fs.outputFile(file, text);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHJlZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInRyZWUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOztHQUVHOzs7Ozs7Ozs7OztBQUVILDRCQUF1QjtBQUN2QixpQ0FBa0g7QUFFbEgsOEJBQW1EO0FBQ25ELG9DQUFpRztBQUNqRywrQkFBK0I7QUFFL0IseURBQTZEO0FBQzdELHFEQUFpRTtBQUVqRSwrQkFBZ0M7QUFFaEMsMkNBQW1DO0FBR25DLG1EQUFzRDtBQUV0RCw0Q0FBb0c7QUFFM0Ysb0JBRnlCLGlCQUFTLENBRXpCO0FBV2xCLElBQWEsYUFBYSxHQUExQixNQUFhLGFBQWMsU0FBUSxjQUFjO0lBRWhELFlBQVksQ0FBK0MsT0FBVSxFQUFFLFNBQWtCO1FBRXhGLE1BQU0sQ0FBQyxlQUFlLEVBQUUsY0FBYyxDQUFDLEdBQUcsS0FBSyxDQUFDLFlBQVksQ0FBSSxPQUFPLEVBQUUsU0FBUyxDQUFDLENBQUM7UUFFcEYsY0FBYyxDQUFDLFNBQVMsR0FBRyxJQUFJLGlCQUFTLEVBQUUsQ0FBQztRQUUzQyxPQUFPLENBQUMsZUFBZSxFQUFFLGNBQWMsQ0FBQyxDQUFDO0lBQzFDLENBQUM7SUFFUyxLQUFLLENBQUMscUJBQXFCLENBQUMsS0FBYSxFQUFFLGNBQStCLEVBQUUsR0FBRyxJQUFJO1FBRTVGLE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQztRQUNsQixJQUFJLFFBQVEsR0FBRyxpQkFBUyxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxDQUFDO1FBRTNELDJDQUEyQztRQUUzQyxJQUFJLEtBQUssQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLEtBQUssR0FBRyxDQUFDLEVBQ25DO1lBQ0MsSUFBSSxJQUFJLEdBQUcsS0FBSyxDQUFDO1lBQ2pCLElBQUksY0FBYyxDQUFDLFdBQVcsSUFBSSxjQUFjLENBQUMsWUFBWSxFQUM3RDtnQkFDQyxJQUFJLEdBQUcsSUFBSSxDQUFDO2FBQ1o7WUFFRCxj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QUErQixFQUFFLE9BQU8sR0FBRyxFQUFFLEVBQUUsR0FBRyxJQUFJO1FBRTNFLElBQUksS0FBSyxHQUFHLGNBQWMsQ0FBQyxvQkFBWSxDQUFDLENBQUMsS0FBSyxDQUFDO1FBRS9DLElBQUksS0FBSyxDQUFDLFNBQVMsRUFDbkI7WUFDQyxNQUFNLFNBQVMsR0FBRyxLQUFLLENBQUMsU0FBUyxDQUFDO1lBRWxDLEtBQUssQ0FBQyxTQUFTLEdBQUcsU0FBUyxDQUFDLE1BQU0sRUFBRSxDQUFDO1NBQ3JDO1FBRUQsT0FBTyxLQUFLLENBQUMsV0FBVyxDQUFDLGNBQWMsRUFBRSxPQUFPLEVBQUUsR0FBRyxJQUFJLENBQUMsQ0FBQztJQUM1RCxDQUFDO0NBQ0QsQ0FBQTtBQTFUWSxhQUFhO0lBRHpCLHdCQUFnQixFQUE4QztHQUNsRCxhQUFhLENBMFR6QjtBQTFUWSxzQ0FBYTtBQTRUYixRQUFBLFNBQVMsR0FBRyxhQUFxQyxDQUFDO0FBQy9ELGtCQUFlLGFBQWEsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ3JlYXRlZCBieSB1c2VyIG9uIDIwMTgvNC80LzAwNC5cbiAqL1xuXG5leHBvcnQgKiBmcm9tICcuL2Jhc2UnO1xuaW1wb3J0IF9Ob3ZlbFNpdGVCYXNlLCB7IElEb3dubG9hZE9wdGlvbnMsIElPcHRpb25zUnVudGltZSBhcyBfSU9wdGlvbnNSdW50aW1lLCBJTm92ZWwgYXMgX0lOb3ZlbCB9IGZyb20gJy4vYmFzZSc7XG5cbmltcG9ydCB7IGdldEZpbGVQYXRoLCBnZXRWb2x1bWVQYXRoIH0gZnJvbSAnLi4vZnMnO1xuaW1wb3J0IF9Ob3ZlbFNpdGUsIHsgSUNoYXB0ZXIsIFByb21pc2VCbHVlYmlyZCwgc3RhdGljSW1wbGVtZW50cywgU1lNQk9MX0NBQ0hFIH0gZnJvbSAnLi4vaW5kZXgnO1xuaW1wb3J0ICogYXMgcGF0aCBmcm9tICd1cGF0aDInO1xuXG5pbXBvcnQgeyBub3JtYWxpemVfdmFsIH0gZnJvbSAnbm9kZS1ub3ZlbC1nbG9iYnkvbGliL2hlbHBlcic7XG5pbXBvcnQgeyBkZWZhdWx0U29ydENhbGxiYWNrIH0gZnJvbSAnbm9kZS1ub3ZlbC1nbG9iYnkvbGliL3NvcnQnO1xuXG5pbXBvcnQgZnMgPSByZXF1aXJlKCdmcy1leHRyYScpO1xuaW1wb3J0IHsgdHJpbUZpbGVuYW1lIH0gZnJvbSAnZnMtaWNvbnYvdXRpbCc7XG5pbXBvcnQgbm92ZWxUZXh0IGZyb20gJ25vdmVsLXRleHQnO1xuaW1wb3J0IHsgVVJMIH0gZnJvbSAnanNkb20tdXJsJztcblxuaW1wb3J0IHsgU1lNQk9MX05PREUgfSBmcm9tICdqcy10cmVlLWxpc3QyL3NyYy91dGlscyc7XG5cbmltcG9ydCB7IElSb3dDaGFwdGVyLCBJUm93Vm9sdW1lLCBOb3ZlbFRyZWUsIFRyZWVOb2RlLCBJVHJlZSwgSVRyZWVUb0xpc3QgfSBmcm9tICcuLi8uLi90cmVlL2luZGV4JztcblxuZXhwb3J0IHsgTm92ZWxUcmVlIH1cblxuZXhwb3J0IHR5cGUgSU9wdGlvbnNSdW50aW1lID0gX0lPcHRpb25zUnVudGltZSAmIHtcblx0bm92ZWxUcmVlPzogTm92ZWxUcmVlLFxufVxuXG5leHBvcnQgdHlwZSBJTm92ZWwgPSBfSU5vdmVsICYge1xuXHRub3ZlbFRyZWU/OiBOb3ZlbFRyZWUsXG59XG5cbkBzdGF0aWNJbXBsZW1lbnRzPF9Ob3ZlbFNpdGUuSU5vdmVsU2l0ZVN0YXRpYzxOb3ZlbFNpdGVEZW1vPj4oKVxuZXhwb3J0IGNsYXNzIE5vdmVsU2l0ZURlbW8gZXh0ZW5kcyBfTm92ZWxTaXRlQmFzZVxue1xuXHRnZXRPdXRwdXREaXI8VCBleHRlbmRzIElPcHRpb25zUnVudGltZSAmIElEb3dubG9hZE9wdGlvbnM+KG9wdGlvbnM6IFQsIG5vdmVsTmFtZT86IHN0cmluZyk6IFtzdHJpbmcsIFRdXG5cdHtcblx0XHRjb25zdCBbUEFUSF9OT1ZFTF9NQUlOLCBvcHRpb25zUnVudGltZV0gPSBzdXBlci5nZXRPdXRwdXREaXI8VD4ob3B0aW9ucywgbm92ZWxOYW1lKTtcblxuXHRcdG9wdGlvbnNSdW50aW1lLm5vdmVsVHJlZSA9IG5ldyBOb3ZlbFRyZWUoKTtcblxuXHRcdHJldHVybiBbUEFUSF9OT1ZFTF9NQUlOLCBvcHRpb25zUnVudGltZV07XG5cdH1cblxuXHRwcm90ZWN0ZWQgYXN5bmMgX3Byb2Nlc3NOb3ZlbExpc3ROYW1lKG5vdmVsOiBJTm92ZWwsIG9wdGlvbnNSdW50aW1lOiBJT3B0aW9uc1J1bnRpbWUsIC4uLmFyZ3YpXG5cdHtcblx0XHRjb25zdCBzZWxmID0gdGhpcztcblx0XHRsZXQgdHJlZUxpc3QgPSBOb3ZlbFRyZWUudHJlZVRvTGlzdChub3ZlbC5ub3ZlbFRyZWUsIHRydWUpO1xuXG5cdFx0Ly9jb25zb2xlLmxvZyhub3ZlbC5ub3ZlbFRyZWUuY2FjaGUuZGVwdGgpO1xuXG5cdFx0aWYgKG5vdmVsLm5vdmVsVHJlZS5jYWNoZS5kZXB0aCA+IDIpXG5cdFx0e1xuXHRcdFx0bGV0IGJvb2wgPSBmYWxzZTtcblx0XHRcdGlmIChvcHRpb25zUnVudGltZS5ub0RpclByZWZpeCAmJiBvcHRpb25zUnVudGltZS5ub0ZpcmVQcmVmaXgpXG5cdFx0XHR7XG5cdFx0XHRcdGJvb2wgPSB0cnVlO1xuXHRcdFx0fVxuXG5cdFx0XHRvcHRpb25zUnVudGltZS5ub0RpclByZWZpeCA9IG9wdGlvbnNSdW50aW1lLm5vRmlyZVByZWZpeCA9IGJvb2w7XG5cdFx0fVxuXG5cdFx0dHJlZUxpc3Rcblx0XHRcdC5mb3JFYWNoKGZ1bmN0aW9uIChsaXN0Um93KVxuXHRcdFx0e1xuXHRcdFx0XHRsZXQgbm9kZSA9IGxpc3RSb3dbU1lNQk9MX05PREVdIGFzIFRyZWVOb2RlPElSb3dDaGFwdGVyIHwgSVJvd1ZvbHVtZT47XG5cblx0XHRcdFx0bGV0IHZhbHVlID0gbm9kZS52YWx1ZSgpIGFzIElSb3dDaGFwdGVyIHwgSVJvd1ZvbHVtZTtcblxuXHRcdFx0XHRpZiAodHlwZW9mIHZhbHVlLm5hbWUgPT0gJ3N0cmluZycpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRub2RlLnNldCgnbmFtZScsIHNlbGYudHJpbUZpbGVuYW1lVm9sdW1lKHZhbHVlLm5hbWUpKTtcblx0XHRcdFx0fVxuXHRcdFx0fSlcblx0XHQ7XG5cblx0XHR0cmVlTGlzdFxuXHRcdFx0LmZvckVhY2goZnVuY3Rpb24gKGxpc3RSb3cpXG5cdFx0XHR7XG5cdFx0XHRcdGxldCBwbm9kZSA9IGxpc3RSb3dbU1lNQk9MX05PREVdIGFzIFRyZWVOb2RlO1xuXHRcdFx0XHRjb25zdCBudHlwZSA9IHBub2RlLmdldDxzdHJpbmc+KCd0eXBlJyk7XG5cblx0XHRcdFx0Y29uc3QgaGFzQ2hpbGQgPSBwbm9kZS5zaXplKCk7XG5cblx0XHRcdFx0Y29uc3QgY3VycmVudExldmVsID0gcG5vZGUuZ2V0PG51bWJlcj4oJ2xldmVsJyk7XG5cblx0XHRcdFx0Ly9jb25zb2xlLmxvZyhjdXJyZW50TGV2ZWwpO1xuXHRcdFx0XHQvL2NvbnNvbGUubG9nKG50eXBlKTtcblxuXHRcdFx0XHRpZiAobnR5cGUgIT0gJ3Jvb3QnKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0bGV0IG5hbWUgPSBwbm9kZS5nZXQ8c3RyaW5nPignbmFtZScpO1xuXHRcdFx0XHRcdGlmIChuYW1lID09PSBudWxsKVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdHBub2RlLnNldCgnbmFtZScsICdudWxsJyk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cblx0XHRcdFx0aWYgKGhhc0NoaWxkICYmIChcblx0XHRcdFx0XHRcdDAgJiYgKGN1cnJlbnRMZXZlbCA9PSAwICYmICFvcHRpb25zUnVudGltZS5ub0RpclByZWZpeClcblx0XHRcdFx0XHRcdHx8IChjdXJyZW50TGV2ZWwgPiAwICYmICFvcHRpb25zUnVudGltZS5ub0ZpcmVQcmVmaXgpXG5cdFx0XHRcdFx0KSAmJiBvcHRpb25zUnVudGltZS5maWxlUHJlZml4TW9kZSA+PSAyKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0Ly9jb25zb2xlLmxvZyg3NzcpO1xuXG5cdFx0XHRcdFx0bGV0IGJvb2w6IGJvb2xlYW47XG5cdFx0XHRcdFx0bGV0IGk6IG51bWJlciA9IDA7XG5cdFx0XHRcdFx0bGV0IGxhc3RfdmFsOiBzdHJpbmc7XG5cblx0XHRcdFx0XHRsZXQga3M6IHN0cmluZ1tdID0gW107XG5cblx0XHRcdFx0XHRmb3IgKGxldCBub2RlIG9mIHBub2RlLmNoaWxkcmVuKVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdGxldCBuYW1lID0gbm9kZS5nZXQ8c3RyaW5nPignbmFtZScpO1xuXHRcdFx0XHRcdFx0bGV0IG5hbWVfdmFsID0gbm9ybWFsaXplX3ZhbChuYW1lKTtcblxuXHRcdFx0XHRcdFx0bm9kZS5zZXQoJ25hbWVfdmFsJywgbmFtZV92YWwpO1xuXG5cdFx0XHRcdFx0XHRrcy5wdXNoKG5hbWVfdmFsKTtcblxuXHRcdFx0XHRcdFx0aWYgKG5hbWUgPT09IG51bGwgfHwgbmFtZSA9PSAnbnVsbCcpXG5cdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdG5vZGUuc2V0KCduYW1lJywgJ251bGwnKTtcblx0XHRcdFx0XHRcdFx0bm9kZS5zZXQoJ25hbWVfdmFsJywgJ251bGwnKTtcblxuXHRcdFx0XHRcdFx0XHRib29sID0gdHJ1ZTtcblx0XHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdGlmIChpICE9PSAwKVxuXHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRsZXQgayA9IGRlZmF1bHRTb3J0Q2FsbGJhY2sobGFzdF92YWwsIG5hbWVfdmFsKTtcblxuXHRcdFx0XHRcdFx0XHRpZiAodHlwZW9mIGsgIT0gJ251bWJlcicgfHwgayA+IC0xKVxuXHRcdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdFx0Ly9jb25zb2xlLmxvZyhrKTtcblxuXHRcdFx0XHRcdFx0XHRcdGJvb2wgPSB0cnVlO1xuXHRcdFx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdGkrKztcblx0XHRcdFx0XHRcdGxhc3RfdmFsID0gbmFtZV92YWw7XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0aWYgKCFib29sKVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdGZvciAobGV0IG5vZGUgb2YgcG5vZGUuY2hpbGRyZW4pXG5cdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdGlmIChOb3ZlbFRyZWUuaXNWb2x1bWUobm9kZSkpXG5cdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHRub2RlLnZhbHVlKCkudm9sdW1lX2luZGV4ID0gJyc7XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0ZWxzZSBpZiAoTm92ZWxUcmVlLmlzQ2hhcHRlcihub2RlKSlcblx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdG5vZGUudmFsdWUoKS5jaGFwdGVyX2luZGV4ID0gJyc7XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0ZWxzZVxuXHRcdFx0XHRcdHtcblxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXG5cdFx0XHRcdGlmIChoYXNDaGlsZClcblx0XHRcdFx0e1xuXHRcdFx0XHRcdHBub2RlLmNoaWxkcmVuLmZvckVhY2goZnVuY3Rpb24gKG5vZGUsIGlkeClcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRub2RlLnNldCgnaWR4JywgaWR4KTtcblx0XHRcdFx0XHR9KTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGlmIChoYXNDaGlsZClcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGxldCBkaXJuYW1lOiBzdHJpbmc7XG5cblx0XHRcdFx0XHRpZiAobnR5cGUgPT0gJ3Jvb3QnKVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdGRpcm5hbWUgPSAnJztcblx0XHRcdFx0XHRcdHBub2RlLnNldCgnZGlybmFtZScsIGRpcm5hbWUpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRlbHNlXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0bGV0IG5hbWUgPSBwbm9kZS5nZXQoJ25hbWUnKTtcblx0XHRcdFx0XHRcdGxldCB2b2x1bWUgPSBwbm9kZS52YWx1ZSgpIGFzIElSb3dWb2x1bWU7XG5cdFx0XHRcdFx0XHRsZXQgdmlkID0gdm9sdW1lLmlkeDtcblxuXHRcdFx0XHRcdFx0bGV0IGZha2VfY2hhcHRlcjogSVJvd0NoYXB0ZXIgPSB7XG5cdFx0XHRcdFx0XHRcdGNoYXB0ZXJfaW5kZXg6IHZvbHVtZS52b2x1bWVfaW5kZXgsXG5cdFx0XHRcdFx0XHRcdGNoYXB0ZXJfdGl0bGU6IHZvbHVtZS52b2x1bWVfdGl0bGUsXG5cdFx0XHRcdFx0XHR9O1xuXG5cdFx0XHRcdFx0XHQvKlxuXHRcdFx0XHRcdFx0bmFtZSA9IGdldFZvbHVtZVBhdGgoc2VsZiwge1xuXHRcdFx0XHRcdFx0XHR2b2x1bWUsXG5cdFx0XHRcdFx0XHRcdHZpZCxcblx0XHRcdFx0XHRcdFx0cGF0aF9ub3ZlbDogJycsXG5cdFx0XHRcdFx0XHR9LCBvcHRpb25zUnVudGltZSk7XG5cdFx0XHRcdFx0XHQqL1xuXHRcdFx0XHRcdFx0bmFtZSA9IGdldEZpbGVQYXRoKHNlbGYsIHtcblx0XHRcdFx0XHRcdFx0Y2hhcHRlcjogZmFrZV9jaGFwdGVyLCBjaWQ6IHZpZCxcblx0XHRcdFx0XHRcdFx0ZXh0OiAnJyxcblxuXHRcdFx0XHRcdFx0XHRpZHg6IHZvbHVtZS50b3RhbF9pZHggKyBvcHRpb25zUnVudGltZS5zdGFydEluZGV4LFxuXG5cdFx0XHRcdFx0XHRcdGRpcm5hbWU6ICd+dGVtcCcsXG5cdFx0XHRcdFx0XHRcdHZvbHVtZSwgdmlkLFxuXHRcdFx0XHRcdFx0fSwgb3B0aW9uc1J1bnRpbWUpO1xuXG5cdFx0XHRcdFx0XHRuYW1lID0gcGF0aC5yZWxhdGl2ZSgnfnRlbXAnLCBuYW1lKTtcblxuXHRcdFx0XHRcdFx0bGV0IHBzID0gcG5vZGUucGFyZW50LmdldCgnZGlybmFtZScpO1xuXHRcdFx0XHRcdFx0ZGlybmFtZSA9IHBhdGguam9pbihwcywgbmFtZSk7XG5cdFx0XHRcdFx0XHRwbm9kZS5zZXQoJ2Rpcm5hbWUnLCBkaXJuYW1lKTtcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHQvL2NvbnNvbGUubG9nKGRpcm5hbWUpO1xuXHRcdFx0XHR9XG5cdFx0XHR9KVxuXHRcdDtcblxuXHRcdC8vcHJvY2Vzcy5leGl0KCk7XG5cblx0XHRyZXR1cm4gdHJlZUxpc3Q7XG5cdH1cblxuXHRhc3luYyBfcHJvY2Vzc05vdmVsPFQ+KG5vdmVsOiBJTm92ZWwsIG9wdGlvbnNSdW50aW1lOiBJT3B0aW9uc1J1bnRpbWUsIF9jYWNoZV86IHtcblx0XHR1cmw6IFVSTCxcblx0XHRwYXRoX25vdmVsOiBzdHJpbmcsXG5cdH0sIC4uLmFyZ3YpXG5cdHtcblx0XHRjb25zdCBzZWxmID0gdGhpcztcblxuXHRcdGxldCB7IHVybCwgcGF0aF9ub3ZlbCB9ID0gX2NhY2hlXztcblxuXHRcdGxldCB0cmVlTGlzdCA9IGF3YWl0IHNlbGYuX3Byb2Nlc3NOb3ZlbExpc3ROYW1lKG5vdmVsLCBvcHRpb25zUnVudGltZSwgX2NhY2hlXywgLi4uYXJndik7XG5cblx0XHQvL2NvbnNvbGUubG9nKG9wdGlvbnNSdW50aW1lKTtcblxuXHRcdHJldHVybiBQcm9taXNlQmx1ZWJpcmRcblx0XHRcdC5tYXBTZXJpZXModHJlZUxpc3Quc2xpY2UoMSksIGFzeW5jIGZ1bmN0aW9uIChsaXN0Um93KVxuXHRcdFx0e1xuXHRcdFx0XHRsZXQgbm9kZUNoYXB0ZXIgPSBsaXN0Um93W1NZTUJPTF9OT0RFXSBhcyBUcmVlTm9kZTxJUm93Q2hhcHRlcj47XG5cdFx0XHRcdGxldCBudHlwZSA9IG5vZGVDaGFwdGVyLmdldCgndHlwZScpO1xuXG5cdFx0XHRcdGlmIChudHlwZSAhPSAnY2hhcHRlcicpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRpZiAobnR5cGUgPT0gJ3ZvbHVtZScpXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0bm9kZUNoYXB0ZXIuc2V0KCduYW1lJywgc2VsZi50cmltRmlsZW5hbWVWb2x1bWUobm9kZUNoYXB0ZXIuZ2V0KCd2b2x1bWVfdGl0bGUnKSkpO1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdHJldHVybjtcblx0XHRcdFx0fVxuXHRcdFx0XHRlbHNlXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRub2RlQ2hhcHRlci5zZXQoJ25hbWUnLCBzZWxmLnRyaW1GaWxlbmFtZVZvbHVtZShub2RlQ2hhcHRlci5nZXQoJ2NoYXB0ZXJfdGl0bGUnKSkpO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0bGV0IG5vZGVWb2x1bWUgPSBub2RlQ2hhcHRlci5wYXJlbnQgYXMgYW55IGFzIFRyZWVOb2RlPElSb3dWb2x1bWU+O1xuXG5cdFx0XHRcdGxldCB2b2x1bWUgPSBub2RlVm9sdW1lLnZhbHVlKCkgYXMgSVJvd1ZvbHVtZTtcblx0XHRcdFx0bGV0IGNoYXB0ZXIgPSBub2RlQ2hhcHRlci52YWx1ZSgpIGFzIElSb3dDaGFwdGVyO1xuXG5cdFx0XHRcdGxldCBkaXJuYW1lID0gdm9sdW1lLmRpcm5hbWU7XG5cblx0XHRcdFx0bGV0IGNpZCA9IGNoYXB0ZXIuaWR4O1xuXHRcdFx0XHRsZXQgdmlkID0gdm9sdW1lLmlkeDtcblxuXHRcdFx0XHRjb25zdCBjdXJyZW50X2lkeCA9IGNoYXB0ZXIudG90YWxfaWR4ICsgb3B0aW9uc1J1bnRpbWUuc3RhcnRJbmRleDtcblxuXHRcdFx0XHRsZXQgZmlsZSA9IGdldEZpbGVQYXRoKHNlbGYsIHtcblx0XHRcdFx0XHRjaGFwdGVyLCBjaWQsXG5cdFx0XHRcdFx0ZXh0OiAnLnR4dCcsXG5cblx0XHRcdFx0XHRpZHg6IGN1cnJlbnRfaWR4LFxuXG5cdFx0XHRcdFx0ZGlybmFtZSxcblx0XHRcdFx0XHR2b2x1bWUsIHZpZCxcblx0XHRcdFx0fSwgb3B0aW9uc1J1bnRpbWUpO1xuXG5cdFx0XHRcdGNoYXB0ZXIucGF0aCA9IGZpbGU7XG5cblx0XHRcdFx0ZmlsZSA9IHBhdGguam9pbihwYXRoX25vdmVsLCBmaWxlKTtcblxuXHRcdFx0XHRpZiAoc2VsZi5fY2hlY2tFeGlzdHMob3B0aW9uc1J1bnRpbWUsIGZpbGUpKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0cmV0dXJuIGZpbGU7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRsZXQgdXJsID0gc2VsZi5fY3JlYXRlQ2hhcHRlclVybCh7XG5cdFx0XHRcdFx0bm92ZWwsXG5cdFx0XHRcdFx0dm9sdW1lLFxuXHRcdFx0XHRcdGNoYXB0ZXIsXG5cdFx0XHRcdH0sIG9wdGlvbnNSdW50aW1lKTtcblxuXHRcdFx0XHRhd2FpdCBzZWxmLl9mZXRjaENoYXB0ZXIodXJsLCBvcHRpb25zUnVudGltZSlcblx0XHRcdFx0XHQudGhlbihmdW5jdGlvbiAocmV0KVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdHJldHVybiBzZWxmLl9wYXJzZUNoYXB0ZXIocmV0LCBvcHRpb25zUnVudGltZSwge1xuXHRcdFx0XHRcdFx0XHRmaWxlLFxuXHRcdFx0XHRcdFx0XHRub3ZlbCxcblx0XHRcdFx0XHRcdFx0dm9sdW1lLFxuXHRcdFx0XHRcdFx0XHRjaGFwdGVyLFxuXHRcdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0fSlcblx0XHRcdFx0XHQudGhlbihmdW5jdGlvbiAodGV4dClcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRpZiAodHlwZW9mIHRleHQgPT0gJ3N0cmluZycpXG5cdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdHJldHVybiBub3ZlbFRleHQudG9TdHIodGV4dCk7XG5cdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdHJldHVybiB0ZXh0O1xuXHRcdFx0XHRcdH0pXG5cdFx0XHRcdFx0LnRoZW4oYXN5bmMgZnVuY3Rpb24gKHRleHQ6IHN0cmluZylcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRhd2FpdCBmcy5vdXRwdXRGaWxlKGZpbGUsIHRleHQpO1xuXG5cdFx0XHRcdFx0XHRyZXR1cm4gdGV4dDtcblx0XHRcdFx0XHR9KVxuXHRcdFx0XHQ7XG5cblx0XHRcdFx0cmV0dXJuIGZpbGU7XG5cdFx0XHR9KVxuXHRcdFx0LnRoZW4oZnVuY3Rpb24gKHJldClcblx0XHRcdHtcblx0XHRcdFx0cmV0dXJuIHJldCBhcyBhbnkgYXMgVDtcblx0XHRcdH0pXG5cdFx0XHQ7XG5cdH1cblxuXHRwcm90ZWN0ZWQgX3NhdmVSZWFkbWUob3B0aW9uc1J1bnRpbWU6IElPcHRpb25zUnVudGltZSwgb3B0aW9ucyA9IHt9LCAuLi5vcHRzKVxuXHR7XG5cdFx0bGV0IG5vdmVsID0gb3B0aW9uc1J1bnRpbWVbU1lNQk9MX0NBQ0hFXS5ub3ZlbDtcblxuXHRcdGlmIChub3ZlbC5ub3ZlbFRyZWUpXG5cdFx0e1xuXHRcdFx0Y29uc3Qgbm92ZWxUcmVlID0gbm92ZWwubm92ZWxUcmVlO1xuXG5cdFx0XHRub3ZlbC5ub3ZlbFRyZWUgPSBub3ZlbFRyZWUudG9KU09OKCk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHN1cGVyLl9zYXZlUmVhZG1lKG9wdGlvbnNSdW50aW1lLCBvcHRpb25zLCAuLi5vcHRzKTtcblx0fVxufVxuXG5leHBvcnQgY29uc3QgTm92ZWxTaXRlID0gTm92ZWxTaXRlRGVtbyBhcyB0eXBlb2YgTm92ZWxTaXRlRGVtbztcbmV4cG9ydCBkZWZhdWx0IE5vdmVsU2l0ZURlbW87XG4iXX0=