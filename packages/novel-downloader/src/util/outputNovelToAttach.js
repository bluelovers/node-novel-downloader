"use strict";
/**
 * Created by user on 2020/3/30.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.outputNovelToAttach = outputNovelToAttach;
const array_hyper_unique_1 = require("array-hyper-unique");
const upath2_1 = require("upath2");
const log_1 = require("./log");
const hash_1 = require("./hash");
const fs_extra_1 = require("fs-extra");
const mdconf2_1 = require("mdconf2");
async function outputNovelToAttach({ imgs, dirname, keepImage, path_novel, }) {
    imgs = (0, array_hyper_unique_1.array_unique_overwrite)(imgs)
        .filter(v => v);
    const file = (0, upath2_1.join)(dirname, 'ATTACH.md');
    let md_data = {
        attach: {
            images: {},
        },
    };
    if (keepImage || 1) {
        await (0, fs_extra_1.readFile)(file)
            .then(v => (0, mdconf2_1.parse)(v))
            // @ts-ignore
            .then((data) => {
            data.attach = data.attach || {};
            data.attach.images = data.attach.images || {};
            md_data = data;
            log_1.consoleDebug.debug(`Load data from exists ATTACH.md`);
        })
            .catch(e => null);
    }
    md_data.attach.images = Object
        .entries(imgs)
        .reduce((a, [k, v]) => {
        if (keepImage) {
            a[(0, hash_1.hashSum)(v)] = v;
        }
        else {
            a[k.toString().padStart(3, '0')] = v;
        }
        return a;
    }, md_data.attach.images);
    const md = (0, mdconf2_1.stringify)(md_data);
    return (0, fs_extra_1.outputFile)(file, md)
        .then(r => {
        log_1.consoleDebug.success(`[ATTACH]`, `[SAVE]`, `${(0, upath2_1.relative)(path_novel, file)}`);
        return md_data;
    });
}
exports.default = outputNovelToAttach;
//# sourceMappingURL=outputNovelToAttach.js.map