"use strict";
/**
 * Created by user on 2019/1/7/007.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const const_1 = require("./all/const");
const all_1 = require("./all");
//import { URL } from 'jsdom-url';
const url_1 = require("./util/url");
function getEnumNovelSiteList() {
    return Object.values(const_1.EnumIDKEYToSiteID);
}
exports.getEnumNovelSiteList = getEnumNovelSiteList;
function searchSiteID(url) {
    let href;
    try {
        href = url_1.default(url).href;
    }
    catch (e) {
        // @ts-ignore
        href = url;
    }
    let ls = getEnumNovelSiteList();
    for (let siteID of ls) {
        let mod = all_1.requireNovelSiteClass(siteID);
        let bool;
        try {
            bool = mod.check(href);
            if (bool) {
                return siteID;
            }
        }
        catch (e) {
        }
    }
}
exports.searchSiteID = searchSiteID;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGF6eS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImxhenkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOztHQUVHOztBQUVILHVDQUFtRTtBQUNuRSwrQkFBOEM7QUFFOUMsa0NBQWtDO0FBQ2xDLG9DQUFtQztBQUVuQyxTQUFnQixvQkFBb0I7SUFFbkMsT0FBTyxNQUFNLENBQUMsTUFBTSxDQUFDLHlCQUFpQixDQUFRLENBQUM7QUFDaEQsQ0FBQztBQUhELG9EQUdDO0FBRUQsU0FBZ0IsWUFBWSxDQUFDLEdBQXVDO0lBRW5FLElBQUksSUFBWSxDQUFDO0lBQ2pCLElBQ0E7UUFDQyxJQUFJLEdBQUcsYUFBUyxDQUFDLEdBQVUsQ0FBQyxDQUFDLElBQUksQ0FBQTtLQUNqQztJQUNELE9BQU8sQ0FBQyxFQUNSO1FBQ0MsYUFBYTtRQUNiLElBQUksR0FBRyxHQUFHLENBQUM7S0FDWDtJQUVELElBQUksRUFBRSxHQUFHLG9CQUFvQixFQUFFLENBQUM7SUFFaEMsS0FBSyxJQUFJLE1BQU0sSUFBSSxFQUFFLEVBQ3JCO1FBQ0MsSUFBSSxHQUFHLEdBQUcsMkJBQXFCLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDeEMsSUFBSSxJQUFhLENBQUM7UUFFbEIsSUFDQTtZQUNDLElBQUksR0FBRyxHQUFHLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBRXZCLElBQUksSUFBSSxFQUNSO2dCQUNDLE9BQU8sTUFBTSxDQUFDO2FBQ2Q7U0FDRDtRQUNELE9BQU8sQ0FBQyxFQUNSO1NBRUM7S0FDRDtBQUNGLENBQUM7QUFsQ0Qsb0NBa0NDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDcmVhdGVkIGJ5IHVzZXIgb24gMjAxOS8xLzcvMDA3LlxuICovXG5cbmltcG9ydCB7IEVudW1Ob3ZlbFNpdGVMaXN0LCBFbnVtSURLRVlUb1NpdGVJRCB9IGZyb20gJy4vYWxsL2NvbnN0JztcbmltcG9ydCB7IHJlcXVpcmVOb3ZlbFNpdGVDbGFzcyB9IGZyb20gJy4vYWxsJztcbmltcG9ydCB7IE5vdmVsU2l0ZSB9IGZyb20gJy4vc2l0ZS9pbmRleCc7XG4vL2ltcG9ydCB7IFVSTCB9IGZyb20gJ2pzZG9tLXVybCc7XG5pbXBvcnQgY3JlYXRlVVJMIGZyb20gJy4vdXRpbC91cmwnO1xuXG5leHBvcnQgZnVuY3Rpb24gZ2V0RW51bU5vdmVsU2l0ZUxpc3QoKTogRW51bU5vdmVsU2l0ZUxpc3RbXVxue1xuXHRyZXR1cm4gT2JqZWN0LnZhbHVlcyhFbnVtSURLRVlUb1NpdGVJRCkgYXMgYW55O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc2VhcmNoU2l0ZUlEKHVybDogc3RyaW5nIHwgVVJMIHwgTm92ZWxTaXRlLklQYXJzZVVybClcbntcblx0bGV0IGhyZWY6IHN0cmluZztcblx0dHJ5XG5cdHtcblx0XHRocmVmID0gY3JlYXRlVVJMKHVybCBhcyBhbnkpLmhyZWZcblx0fVxuXHRjYXRjaCAoZSlcblx0e1xuXHRcdC8vIEB0cy1pZ25vcmVcblx0XHRocmVmID0gdXJsO1xuXHR9XG5cblx0bGV0IGxzID0gZ2V0RW51bU5vdmVsU2l0ZUxpc3QoKTtcblxuXHRmb3IgKGxldCBzaXRlSUQgb2YgbHMpXG5cdHtcblx0XHRsZXQgbW9kID0gcmVxdWlyZU5vdmVsU2l0ZUNsYXNzKHNpdGVJRCk7XG5cdFx0bGV0IGJvb2w6IGJvb2xlYW47XG5cblx0XHR0cnlcblx0XHR7XG5cdFx0XHRib29sID0gbW9kLmNoZWNrKGhyZWYpO1xuXG5cdFx0XHRpZiAoYm9vbClcblx0XHRcdHtcblx0XHRcdFx0cmV0dXJuIHNpdGVJRDtcblx0XHRcdH1cblx0XHR9XG5cdFx0Y2F0Y2ggKGUpXG5cdFx0e1xuXG5cdFx0fVxuXHR9XG59XG4iXX0=