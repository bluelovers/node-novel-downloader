"use strict";
/**
 * Created by user on 2019/1/7/007.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchSiteID = exports.getEnumNovelSiteList = void 0;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGF6eS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImxhenkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOztHQUVHOzs7QUFFSCx1Q0FBbUU7QUFDbkUsK0JBQThDO0FBRTlDLGtDQUFrQztBQUNsQyxvQ0FBbUM7QUFFbkMsU0FBZ0Isb0JBQW9CO0lBRW5DLE9BQU8sTUFBTSxDQUFDLE1BQU0sQ0FBQyx5QkFBaUIsQ0FBUSxDQUFDO0FBQ2hELENBQUM7QUFIRCxvREFHQztBQUVELFNBQWdCLFlBQVksQ0FBQyxHQUF1QztJQUVuRSxJQUFJLElBQVksQ0FBQztJQUNqQixJQUNBO1FBQ0MsSUFBSSxHQUFHLGFBQVMsQ0FBQyxHQUFVLENBQUMsQ0FBQyxJQUFJLENBQUE7S0FDakM7SUFDRCxPQUFPLENBQUMsRUFDUjtRQUNDLGFBQWE7UUFDYixJQUFJLEdBQUcsR0FBRyxDQUFDO0tBQ1g7SUFFRCxJQUFJLEVBQUUsR0FBRyxvQkFBb0IsRUFBRSxDQUFDO0lBRWhDLEtBQUssSUFBSSxNQUFNLElBQUksRUFBRSxFQUNyQjtRQUNDLElBQUksR0FBRyxHQUFHLDJCQUFxQixDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ3hDLElBQUksSUFBYSxDQUFDO1FBRWxCLElBQ0E7WUFDQyxJQUFJLEdBQUcsR0FBRyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUV2QixJQUFJLElBQUksRUFDUjtnQkFDQyxPQUFPLE1BQU0sQ0FBQzthQUNkO1NBQ0Q7UUFDRCxPQUFPLENBQUMsRUFDUjtTQUVDO0tBQ0Q7QUFDRixDQUFDO0FBbENELG9DQWtDQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ3JlYXRlZCBieSB1c2VyIG9uIDIwMTkvMS83LzAwNy5cbiAqL1xuXG5pbXBvcnQgeyBFbnVtTm92ZWxTaXRlTGlzdCwgRW51bUlES0VZVG9TaXRlSUQgfSBmcm9tICcuL2FsbC9jb25zdCc7XG5pbXBvcnQgeyByZXF1aXJlTm92ZWxTaXRlQ2xhc3MgfSBmcm9tICcuL2FsbCc7XG5pbXBvcnQgeyBOb3ZlbFNpdGUgfSBmcm9tICcuL3NpdGUvaW5kZXgnO1xuLy9pbXBvcnQgeyBVUkwgfSBmcm9tICdqc2RvbS11cmwnO1xuaW1wb3J0IGNyZWF0ZVVSTCBmcm9tICcuL3V0aWwvdXJsJztcblxuZXhwb3J0IGZ1bmN0aW9uIGdldEVudW1Ob3ZlbFNpdGVMaXN0KCk6IEVudW1Ob3ZlbFNpdGVMaXN0W11cbntcblx0cmV0dXJuIE9iamVjdC52YWx1ZXMoRW51bUlES0VZVG9TaXRlSUQpIGFzIGFueTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNlYXJjaFNpdGVJRCh1cmw6IHN0cmluZyB8IFVSTCB8IE5vdmVsU2l0ZS5JUGFyc2VVcmwpXG57XG5cdGxldCBocmVmOiBzdHJpbmc7XG5cdHRyeVxuXHR7XG5cdFx0aHJlZiA9IGNyZWF0ZVVSTCh1cmwgYXMgYW55KS5ocmVmXG5cdH1cblx0Y2F0Y2ggKGUpXG5cdHtcblx0XHQvLyBAdHMtaWdub3JlXG5cdFx0aHJlZiA9IHVybDtcblx0fVxuXG5cdGxldCBscyA9IGdldEVudW1Ob3ZlbFNpdGVMaXN0KCk7XG5cblx0Zm9yIChsZXQgc2l0ZUlEIG9mIGxzKVxuXHR7XG5cdFx0bGV0IG1vZCA9IHJlcXVpcmVOb3ZlbFNpdGVDbGFzcyhzaXRlSUQpO1xuXHRcdGxldCBib29sOiBib29sZWFuO1xuXG5cdFx0dHJ5XG5cdFx0e1xuXHRcdFx0Ym9vbCA9IG1vZC5jaGVjayhocmVmKTtcblxuXHRcdFx0aWYgKGJvb2wpXG5cdFx0XHR7XG5cdFx0XHRcdHJldHVybiBzaXRlSUQ7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdGNhdGNoIChlKVxuXHRcdHtcblxuXHRcdH1cblx0fVxufVxuIl19