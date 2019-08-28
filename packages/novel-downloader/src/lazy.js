"use strict";
/**
 * Created by user on 2019/1/7/007.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const all_1 = require("./all");
const jsdom_url_1 = require("jsdom-url");
function getEnumNovelSiteList() {
    // @ts-ignore
    return Object.keys(all_1.EnumNovelSiteList).filter(v => /^[a-z]/i.test(v));
}
exports.getEnumNovelSiteList = getEnumNovelSiteList;
function searchSiteID(url) {
    let href;
    try {
        // @ts-ignore
        let uo = new jsdom_url_1.URL(url);
        href = uo.href;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGF6eS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImxhenkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOztHQUVHOztBQUVILCtCQUFpRTtBQUVqRSx5Q0FBZ0M7QUFFaEMsU0FBZ0Isb0JBQW9CO0lBRW5DLGFBQWE7SUFDYixPQUFPLE1BQU0sQ0FBQyxJQUFJLENBQUMsdUJBQWlCLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDdEUsQ0FBQztBQUpELG9EQUlDO0FBRUQsU0FBZ0IsWUFBWSxDQUFDLEdBQXVDO0lBRW5FLElBQUksSUFBWSxDQUFDO0lBQ2pCLElBQ0E7UUFDQyxhQUFhO1FBQ2IsSUFBSSxFQUFFLEdBQUcsSUFBSSxlQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDdEIsSUFBSSxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUM7S0FDZjtJQUNELE9BQU8sQ0FBQyxFQUNSO1FBQ0MsYUFBYTtRQUNiLElBQUksR0FBRyxHQUFHLENBQUM7S0FDWDtJQUVELElBQUksRUFBRSxHQUFHLG9CQUFvQixFQUFFLENBQUM7SUFFaEMsS0FBSyxJQUFJLE1BQU0sSUFBSSxFQUFFLEVBQ3JCO1FBQ0MsSUFBSSxHQUFHLEdBQUcsMkJBQXFCLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDeEMsSUFBSSxJQUFhLENBQUM7UUFFbEIsSUFDQTtZQUNDLElBQUksR0FBRyxHQUFHLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBRXZCLElBQUksSUFBSSxFQUNSO2dCQUNDLE9BQU8sTUFBTSxDQUFDO2FBQ2Q7U0FDRDtRQUNELE9BQU8sQ0FBQyxFQUNSO1NBRUM7S0FDRDtBQUNGLENBQUM7QUFwQ0Qsb0NBb0NDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDcmVhdGVkIGJ5IHVzZXIgb24gMjAxOS8xLzcvMDA3LlxuICovXG5cbmltcG9ydCB7IEVudW1Ob3ZlbFNpdGVMaXN0LCByZXF1aXJlTm92ZWxTaXRlQ2xhc3MgfSBmcm9tICcuL2FsbCc7XG5pbXBvcnQgeyBOb3ZlbFNpdGUgfSBmcm9tICcuL3NpdGUvaW5kZXgnO1xuaW1wb3J0IHsgVVJMIH0gZnJvbSAnanNkb20tdXJsJztcblxuZXhwb3J0IGZ1bmN0aW9uIGdldEVudW1Ob3ZlbFNpdGVMaXN0KCk6IEVudW1Ob3ZlbFNpdGVMaXN0W11cbntcblx0Ly8gQHRzLWlnbm9yZVxuXHRyZXR1cm4gT2JqZWN0LmtleXMoRW51bU5vdmVsU2l0ZUxpc3QpLmZpbHRlcih2ID0+IC9eW2Etel0vaS50ZXN0KHYpKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNlYXJjaFNpdGVJRCh1cmw6IHN0cmluZyB8IFVSTCB8IE5vdmVsU2l0ZS5JUGFyc2VVcmwpXG57XG5cdGxldCBocmVmOiBzdHJpbmc7XG5cdHRyeVxuXHR7XG5cdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdGxldCB1byA9IG5ldyBVUkwodXJsKTtcblx0XHRocmVmID0gdW8uaHJlZjtcblx0fVxuXHRjYXRjaCAoZSlcblx0e1xuXHRcdC8vIEB0cy1pZ25vcmVcblx0XHRocmVmID0gdXJsO1xuXHR9XG5cblx0bGV0IGxzID0gZ2V0RW51bU5vdmVsU2l0ZUxpc3QoKTtcblxuXHRmb3IgKGxldCBzaXRlSUQgb2YgbHMpXG5cdHtcblx0XHRsZXQgbW9kID0gcmVxdWlyZU5vdmVsU2l0ZUNsYXNzKHNpdGVJRCk7XG5cdFx0bGV0IGJvb2w6IGJvb2xlYW47XG5cblx0XHR0cnlcblx0XHR7XG5cdFx0XHRib29sID0gbW9kLmNoZWNrKGhyZWYpO1xuXG5cdFx0XHRpZiAoYm9vbClcblx0XHRcdHtcblx0XHRcdFx0cmV0dXJuIHNpdGVJRDtcblx0XHRcdH1cblx0XHR9XG5cdFx0Y2F0Y2ggKGUpXG5cdFx0e1xuXG5cdFx0fVxuXHR9XG59XG4iXX0=