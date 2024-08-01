"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnumNovelSiteList = void 0;
exports.requireNovelSiteClass = requireNovelSiteClass;
const const_1 = require("./all/const");
Object.defineProperty(exports, "EnumNovelSiteList", { enumerable: true, get: function () { return const_1.EnumNovelSiteList; } });
function requireNovelSiteClass(siteID) {
    if (!(siteID in const_1.EnumNovelSiteList)) {
        throw new RangeError(`'${siteID}' not exists`);
    }
    return require(`./site/${const_1.EnumNovelSiteList[siteID]}`).default;
}
exports.default = requireNovelSiteClass;
//# sourceMappingURL=all.js.map