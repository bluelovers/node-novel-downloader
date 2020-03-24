"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isIDKEY = exports.isSiteID = exports.IDKEY2siteID = exports.siteID2IDKEY = void 0;
/**
 * Created by user on 2020/2/3.
 */
const const_1 = require("./const");
function siteID2IDKEY(siteID) {
    if (isIDKEY(siteID)) {
        return const_1.EnumIDKEYList[siteID];
    }
}
exports.siteID2IDKEY = siteID2IDKEY;
function IDKEY2siteID(input) {
    if (!isIDKEY(input)) {
        input = siteID2IDKEY(input);
    }
    if (isIDKEY(input)) {
        return const_1.EnumIDKEYToSiteID[input];
    }
}
exports.IDKEY2siteID = IDKEY2siteID;
function isSiteID(siteID) {
    return (siteID in const_1.EnumNovelSiteList) && typeof const_1.EnumNovelSiteList[siteID] === 'string';
}
exports.isSiteID = isSiteID;
function isIDKEY(IDKEY) {
    return (IDKEY in const_1.EnumIDKEYList) && typeof const_1.EnumIDKEYList[IDKEY] === 'string';
}
exports.isIDKEY = isIDKEY;
//# sourceMappingURL=util.js.map