"use strict";
/**
 * Created by user on 2024/1/30.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports._parseWorkMeta = exports._pagePropData = exports._getDataRecord = exports._getWorkData = exports._get_volume_list = void 0;
const dom_1 = require("../dom");
const index_1 = require("../../index");
const util_1 = require("../../../util");
const util_2 = require("../util");
async function _get_volume_list(dom, optionsRuntime) {
    const $ = dom.$;
    const _main = (0, dom_1._jQueryClassStartWith)($, '#app main', '_workId__main__', ':eq(0)');
    let _div = (0, dom_1._jQueryClassStartWith)($, '> div', 'NewBox_box__', ':eq(0)', _main);
    let novel_author = _div.find('.partialGiftWidgetActivityName:eq(0)').text();
    const _propData = _pagePropData(dom);
    const { novel_id, _workData, } = _getWorkData(_propData);
    const { novelTree, } = _get_volume_list_loop(_propData, optionsRuntime);
    //console.yellow.log(_propData.props.pageProps.__APOLLO_STATE__);
    return {
        ..._parseWorkMeta(_workData),
        novel_id,
        novel_author,
        //volume_list,
        novelTree,
    };
}
exports._get_volume_list = _get_volume_list;
function _getWorkData(_propData) {
    const novel_id = _propData.query.workId;
    const _workData = _getDataRecord(`Work:${novel_id}`, _propData);
    return {
        novel_id,
        _workData,
    };
}
exports._getWorkData = _getWorkData;
function _getDataRecord(name, _propData) {
    return _propData.props.pageProps.__APOLLO_STATE__[name];
}
exports._getDataRecord = _getDataRecord;
function _get_volume_list_loop(_propData, optionsRuntime) {
    const { novel_id, _workData, } = _getWorkData(_propData);
    let volume_list = [];
    const novelTree = optionsRuntime.novelTree;
    let currentVolume;
    let total_idx = 0;
    _workData.tableOfContents.forEach(ref => {
        var _a, _b;
        const toc = _getDataRecord(ref.__ref, _propData);
        let chapter = _getDataRecord((_a = toc.chapter) === null || _a === void 0 ? void 0 : _a.__ref, _propData);
        let volume_title = 'null';
        let volume_level = null;
        if (chapter) {
            volume_title = chapter.title;
            volume_level = chapter.level;
        }
        currentVolume = novelTree.addVolume({
            volume_title,
            volume_level,
            volume_index: novelTree.root().size(),
            total_idx: total_idx++,
        });
        (_b = toc.episodeUnions) === null || _b === void 0 ? void 0 : _b.forEach(ref => {
            let episode = _getDataRecord(ref.__ref, _propData);
            let chapter_id = episode.id;
            let data = {
                chapter_id,
                novel_id,
            };
            let href = (0, util_2.makeUrl)(data);
            novelTree.addChapter({
                chapter_title: episode.title,
                chapter_id,
                chapter_url: href,
                chapter_url_data: data,
                chapter_date: (0, index_1.moment)(episode.publishedAt).local(),
                chapter_index: currentVolume.size(),
                total_idx: total_idx++,
            }, currentVolume);
        });
    });
    return {
        novelTree,
        total_idx,
    };
}
function _pagePropData(dom) {
    return JSON.parse(dom.$('script#__NEXT_DATA__:eq(0)').html());
}
exports._pagePropData = _pagePropData;
function _parseWorkMeta(_workData) {
    var _a, _b;
    let data_meta = {
        novel: {},
    };
    data_meta.novel.tags = [
        ..._workData.tagLabels,
        _workData.genre,
    ];
    if (_workData.isSexual || data_meta.novel.tags.includes('性描写有り')) {
        data_meta.novel.tags.push(`novel18`);
        data_meta.novel.tags.push(`性描写有り`);
    }
    if (_workData.isCruel) {
        data_meta.novel.tags.push('残酷描写有り');
    }
    if (_workData.isViolent) {
        data_meta.novel.tags.push('暴力描写有り');
    }
    data_meta.novel.title_other = (_a = _workData.alternateTitle) !== null && _a !== void 0 ? _a : void 0;
    let novel_date = (0, index_1.moment)(_workData.lastEpisodePublishedAt).local();
    if (_workData.hasPublication) {
    }
    return {
        novel_title: (0, util_1.trim)(_workData.title),
        novel_desc: _workData.introduction,
        novel_date,
        novel_cover: (_b = _workData.ogImageUrl) === null || _b === void 0 ? void 0 : _b.replace(/\?.+$/, ''),
        data_meta,
    };
}
exports._parseWorkMeta = _parseWorkMeta;
//# sourceMappingURL=get_volume_list.js.map