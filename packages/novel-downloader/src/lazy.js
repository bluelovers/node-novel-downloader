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
    let uo = new jsdom_url_1.URL(url);
    let href = uo.href;
    let ls = getEnumNovelSiteList();
    for (let siteID of ls) {
        let mod = all_1.requireNovelSiteClass(siteID);
        let bool = mod.check(href);
        if (bool) {
            return siteID;
        }
    }
}
exports.searchSiteID = searchSiteID;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGF6eS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImxhenkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOztHQUVHOztBQUVILCtCQUFpRTtBQUVqRSx5Q0FBZ0M7QUFFaEMsU0FBZ0Isb0JBQW9CO0lBRW5DLGFBQWE7SUFDYixPQUFPLE1BQU0sQ0FBQyxJQUFJLENBQUMsdUJBQWlCLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDdEUsQ0FBQztBQUpELG9EQUlDO0FBRUQsU0FBZ0IsWUFBWSxDQUFDLEdBQXVDO0lBRW5FLElBQUksRUFBRSxHQUFHLElBQUksZUFBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQ3RCLElBQUksSUFBSSxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUM7SUFFbkIsSUFBSSxFQUFFLEdBQUcsb0JBQW9CLEVBQUUsQ0FBQztJQUVoQyxLQUFLLElBQUksTUFBTSxJQUFJLEVBQUUsRUFDckI7UUFDQyxJQUFJLEdBQUcsR0FBRywyQkFBcUIsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUN4QyxJQUFJLElBQUksR0FBRyxHQUFHLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBRTNCLElBQUksSUFBSSxFQUNSO1lBQ0MsT0FBTyxNQUFNLENBQUM7U0FDZDtLQUNEO0FBQ0YsQ0FBQztBQWpCRCxvQ0FpQkMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENyZWF0ZWQgYnkgdXNlciBvbiAyMDE5LzEvNy8wMDcuXG4gKi9cblxuaW1wb3J0IHsgRW51bU5vdmVsU2l0ZUxpc3QsIHJlcXVpcmVOb3ZlbFNpdGVDbGFzcyB9IGZyb20gJy4vYWxsJztcbmltcG9ydCB7IE5vdmVsU2l0ZSB9IGZyb20gJy4vc2l0ZS9pbmRleCc7XG5pbXBvcnQgeyBVUkwgfSBmcm9tICdqc2RvbS11cmwnO1xuXG5leHBvcnQgZnVuY3Rpb24gZ2V0RW51bU5vdmVsU2l0ZUxpc3QoKTogRW51bU5vdmVsU2l0ZUxpc3RbXVxue1xuXHQvLyBAdHMtaWdub3JlXG5cdHJldHVybiBPYmplY3Qua2V5cyhFbnVtTm92ZWxTaXRlTGlzdCkuZmlsdGVyKHYgPT4gL15bYS16XS9pLnRlc3QodikpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc2VhcmNoU2l0ZUlEKHVybDogc3RyaW5nIHwgVVJMIHwgTm92ZWxTaXRlLklQYXJzZVVybClcbntcblx0bGV0IHVvID0gbmV3IFVSTCh1cmwpO1xuXHRsZXQgaHJlZiA9IHVvLmhyZWY7XG5cblx0bGV0IGxzID0gZ2V0RW51bU5vdmVsU2l0ZUxpc3QoKTtcblxuXHRmb3IgKGxldCBzaXRlSUQgb2YgbHMpXG5cdHtcblx0XHRsZXQgbW9kID0gcmVxdWlyZU5vdmVsU2l0ZUNsYXNzKHNpdGVJRCk7XG5cdFx0bGV0IGJvb2wgPSBtb2QuY2hlY2soaHJlZik7XG5cblx0XHRpZiAoYm9vbClcblx0XHR7XG5cdFx0XHRyZXR1cm4gc2l0ZUlEO1xuXHRcdH1cblx0fVxufVxuIl19