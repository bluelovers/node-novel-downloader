"use strict";
/**
 * Created by user on 2018/4/2/002.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const js_tree_list2_1 = require("js-tree-list2");
const util_1 = require("../util");
class NovelTree {
    constructor(initData = {}) {
        this.cache = {};
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
    _fixRow(node) {
        node.set('level', node.parent.get('level') + 1);
        switch (node.get('type')) {
            case 'chapter':
                node.set('chapter_title', util_1.trim(node.get('chapter_title'), true));
                break;
            case 'volume':
                node.set('volume_title', util_1.trim(node.get('volume_title'), true));
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
    static treeToList(novelTree) {
        let list = js_tree_list2_1.TreeToList(novelTree.tree);
        return list;
    }
}
exports.NovelTree = NovelTree;
exports.default = NovelTree;
