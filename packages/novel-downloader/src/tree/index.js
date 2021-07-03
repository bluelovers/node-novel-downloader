"use strict";
/**
 * Created by user on 2018/4/2/002.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.NovelTree = void 0;
const js_tree_list2_1 = require("js-tree-list2");
const util_1 = require("../util");
class NovelTree {
    constructor(initData = {}) {
        this.cache = {
            depth: 0,
        };
        initData.type = 'root';
        initData.level = 0;
        this.tree = new js_tree_list2_1.Tree(initData);
    }
    root() {
        return this.tree.root();
    }
    addVolume(value, root) {
        value.type = 'volume';
        let node;
        if (root) {
            node = this._getRoot(root).add(value);
        }
        else {
            node = this.tree.root().add(value);
        }
        this._fixRow(node);
        this.cache.lastVolume = node;
        return node;
    }
    addChapter(value, root) {
        value.type = 'chapter';
        let node;
        if (root) {
            node = this._getRoot(root).add(value);
        }
        else {
            node = this.tree.root().add(value);
        }
        this._fixRow(node);
        this.cache.lastChapter = node;
        return node;
    }
    static isVolume(node) {
        if (node instanceof js_tree_list2_1.Node) {
            return (node.get('type') == 'volume') ? node : null;
        }
        return (node.type == 'volume') ? node : null;
    }
    static isChapter(node) {
        if (node instanceof js_tree_list2_1.Node) {
            return (node.get('type') == 'chapter') ? node : null;
        }
        return (node.type == 'chapter') ? node : null;
    }
    _fixRow(node) {
        let level = node.parent.get('level') + 1;
        this.cache.depth = Math.max(this.cache.depth, level);
        node.set('level', level);
        let name;
        switch (node.get('type')) {
            case 'chapter':
                name = (0, util_1.trim)(node.get('chapter_title'), true);
                node.set('chapter_title', name);
                node.set('name', name);
                break;
            case 'volume':
                name = (0, util_1.trim)(node.get('volume_title'), true);
                node.set('volume_title', name);
                node.set('name', name);
                break;
        }
        return node;
    }
    _getRoot(root) {
        if (!(root instanceof js_tree_list2_1.Node)) {
            throw new TypeError();
        }
        if (root.get('type') == 'chapter') {
            throw new Error();
        }
        return root;
    }
    toJSON() {
        return this.tree.root().toJSON();
    }
    static treeToList(novelTree, linkNode) {
        let list = (0, js_tree_list2_1.TreeToList)(novelTree.tree, linkNode);
        return list;
    }
}
exports.NovelTree = NovelTree;
exports.default = NovelTree;
//# sourceMappingURL=index.js.map