"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.volNovelTree = void 0;
const site_1 = require("esjzone-api/lib/util/site");
const log_1 = require("../../../util/log");
function volNovelTree($, optionsRuntime, self) {
    const data = (0, site_1._getBookChapters)($, $('.container'), {
        chapters: [],
    });
    const novelTree = optionsRuntime.novelTree;
    let currentVolume;
    let total_idx = 0;
    data
        .chapters
        .forEach(volume => {
        let bool = true;
        volume
            .chapters
            .forEach(_chapter => {
            if (_chapter.chapter_id) {
                if (bool) {
                    currentVolume = novelTree.addVolume({
                        volume_title: String(volume.volume_name),
                        volume_index: novelTree.root().size(),
                        total_idx: total_idx++,
                    });
                    bool = false;
                }
                let chapter_url_data = self.parseUrl(_chapter.chapter_link);
                let chapter_url = self.makeUrl(chapter_url_data);
                let chapter = {
                    chapter_title: _chapter.chapter_name,
                    chapter_id: _chapter.chapter_id,
                    chapter_url,
                    chapter_url_data,
                    chapter_index: currentVolume.size(),
                    total_idx: total_idx++,
                };
                novelTree.addChapter(chapter, currentVolume);
            }
            else {
                log_1.consoleDebug.warn(`[不支援下載站外連結]`, _chapter.chapter_name, "\n" + _chapter.chapter_link);
            }
        });
    });
    return {
        novelTree,
    };
}
exports.volNovelTree = volNovelTree;
exports.default = volNovelTree;
//# sourceMappingURL=volNovelTree.js.map