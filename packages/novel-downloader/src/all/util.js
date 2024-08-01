"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.siteID2IDKEY = siteID2IDKEY;
exports.IDKEY2siteID = IDKEY2siteID;
exports.isSiteID = isSiteID;
exports.isIDKEY = isIDKEY;
/**
 * Created by user on 2020/2/3.
 */
const const_1 = require("./const");
function siteID2IDKEY(siteID) {
    if (isIDKEY(siteID)) {
        return const_1.EnumIDKEYList[siteID];
    }
}
function IDKEY2siteID(input) {
    if (!isIDKEY(input)) {
        input = siteID2IDKEY(input);
    }
    if (isIDKEY(input)) {
        return const_1.EnumIDKEYToSiteID[input];
    }
}
function isSiteID(siteID) {
    return (siteID in const_1.EnumNovelSiteList) && typeof const_1.EnumNovelSiteList[siteID] === 'string';
}
function isIDKEY(IDKEY) {
    return (IDKEY in const_1.EnumIDKEYList) && typeof const_1.EnumIDKEYList[IDKEY] === 'string';
}
//# sourceMappingURL=util.js.map