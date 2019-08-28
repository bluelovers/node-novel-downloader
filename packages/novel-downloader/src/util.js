"use strict";
/**
 * Created by user on 2018/3/18/018.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const StrUtil = require("str-util");
const novel_text_1 = require("novel-text");
// @ts-ignore
const html_1 = require("jsdom-extra/lib/html");
exports.minifyHTML = html_1.minifyHTML;
function isUndef(v, opts = null, strict) {
    let bool = typeof v == 'undefined' || v === null;
    if (!bool && !isUndef(opts)) {
        opts = Array.isArray(opts) ? opts : [opts];
        for (let t of opts) {
            let bool = strict ? v === t : v == t;
            if (bool) {
                return bool;
            }
        }
    }
    return bool;
}
exports.isUndef = isUndef;
function trim(str, bool) {
    let t = novel_text_1.default.trim(str, {
        trim: '　',
    });
    if (bool) {
        t = t.replace(/^[　\s]+|[　\s]+$/g, '');
    }
    return t;
}
exports.trim = trim;
function array_unique(array) {
    return array.filter(function (el, index, arr) {
        return index == arr.indexOf(el);
    });
}
exports.array_unique = array_unique;
function escapeRegexp(str) {
    return str.replace(/[|\\{}()\[\]^$+*?.\/]/g, '\\$&');
}
exports.escapeRegexp = escapeRegexp;
function _fixVolumeChapterName(name) {
    return name.replace(/[?@!$#\\\/<>\[\]{}()*]+/g, s => StrUtil.toFullWidth(s));
}
exports._fixVolumeChapterName = _fixVolumeChapterName;
exports.default = exports;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInV0aWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOztHQUVHOztBQUVILG9DQUFxQztBQUNyQywyQ0FBbUM7QUFDbkMsYUFBYTtBQUNiLCtDQUFrRDtBQUV6QyxxQkFGQSxpQkFBVSxDQUVBO0FBRW5CLFNBQWdCLE9BQU8sQ0FBQyxDQUFDLEVBQUUsT0FBWSxJQUFJLEVBQUUsTUFBZ0I7SUFFNUQsSUFBSSxJQUFJLEdBQUcsT0FBTyxDQUFDLElBQUksV0FBVyxJQUFJLENBQUMsS0FBSyxJQUFJLENBQUM7SUFFakQsSUFBSSxDQUFDLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsRUFDM0I7UUFDQyxJQUFJLEdBQUcsS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBRTNDLEtBQUssSUFBSSxDQUFDLElBQUksSUFBSSxFQUNsQjtZQUNDLElBQUksSUFBSSxHQUFHLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUVyQyxJQUFJLElBQUksRUFDUjtnQkFDQyxPQUFPLElBQUksQ0FBQzthQUNaO1NBQ0Q7S0FDRDtJQUVELE9BQU8sSUFBSSxDQUFDO0FBQ2IsQ0FBQztBQXBCRCwwQkFvQkM7QUFFRCxTQUFnQixJQUFJLENBQUMsR0FBVyxFQUFFLElBQWM7SUFFL0MsSUFBSSxDQUFDLEdBQUcsb0JBQVMsQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFO1FBQzNCLElBQUksRUFBRSxHQUFHO0tBQ1QsQ0FBQyxDQUFDO0lBRUgsSUFBSSxJQUFJLEVBQ1I7UUFDQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxrQkFBa0IsRUFBRSxFQUFFLENBQUMsQ0FBQztLQUN0QztJQUVELE9BQU8sQ0FBQyxDQUFDO0FBQ1YsQ0FBQztBQVpELG9CQVlDO0FBRUQsU0FBZ0IsWUFBWSxDQUFJLEtBQVU7SUFFekMsT0FBTyxLQUFLLENBQUMsTUFBTSxDQUFDLFVBQVUsRUFBRSxFQUFFLEtBQUssRUFBRSxHQUFHO1FBRTNDLE9BQU8sS0FBSyxJQUFJLEdBQUcsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLENBQUM7SUFDakMsQ0FBQyxDQUFDLENBQUM7QUFDSixDQUFDO0FBTkQsb0NBTUM7QUFFRCxTQUFnQixZQUFZLENBQUMsR0FBVztJQUV2QyxPQUFPLEdBQUcsQ0FBQyxPQUFPLENBQUMsd0JBQXdCLEVBQUUsTUFBTSxDQUFDLENBQUM7QUFDdEQsQ0FBQztBQUhELG9DQUdDO0FBRUQsU0FBZ0IscUJBQXFCLENBQUMsSUFBWTtJQUVqRCxPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsMEJBQTBCLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7QUFDN0UsQ0FBQztBQUhELHNEQUdDO0FBRUQsa0JBQWUsT0FBa0MsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ3JlYXRlZCBieSB1c2VyIG9uIDIwMTgvMy8xOC8wMTguXG4gKi9cblxuaW1wb3J0IFN0clV0aWwgPSByZXF1aXJlKCdzdHItdXRpbCcpO1xuaW1wb3J0IG5vdmVsVGV4dCBmcm9tICdub3ZlbC10ZXh0Jztcbi8vIEB0cy1pZ25vcmVcbmltcG9ydCB7IG1pbmlmeUhUTUwgfSBmcm9tICdqc2RvbS1leHRyYS9saWIvaHRtbCc7XG5cbmV4cG9ydCB7IG1pbmlmeUhUTUwgfVxuXG5leHBvcnQgZnVuY3Rpb24gaXNVbmRlZih2LCBvcHRzOiBhbnkgPSBudWxsLCBzdHJpY3Q/OiBib29sZWFuKTogYm9vbGVhblxue1xuXHRsZXQgYm9vbCA9IHR5cGVvZiB2ID09ICd1bmRlZmluZWQnIHx8IHYgPT09IG51bGw7XG5cblx0aWYgKCFib29sICYmICFpc1VuZGVmKG9wdHMpKVxuXHR7XG5cdFx0b3B0cyA9IEFycmF5LmlzQXJyYXkob3B0cykgPyBvcHRzIDogW29wdHNdO1xuXG5cdFx0Zm9yIChsZXQgdCBvZiBvcHRzKVxuXHRcdHtcblx0XHRcdGxldCBib29sID0gc3RyaWN0ID8gdiA9PT0gdCA6IHYgPT0gdDtcblxuXHRcdFx0aWYgKGJvb2wpXG5cdFx0XHR7XG5cdFx0XHRcdHJldHVybiBib29sO1xuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdHJldHVybiBib29sO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gdHJpbShzdHI6IHN0cmluZywgYm9vbD86IGJvb2xlYW4pXG57XG5cdGxldCB0ID0gbm92ZWxUZXh0LnRyaW0oc3RyLCB7XG5cdFx0dHJpbTogJ+OAgCcsXG5cdH0pO1xuXG5cdGlmIChib29sKVxuXHR7XG5cdFx0dCA9IHQucmVwbGFjZSgvXlvjgIBcXHNdK3xb44CAXFxzXSskL2csICcnKTtcblx0fVxuXG5cdHJldHVybiB0O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gYXJyYXlfdW5pcXVlPFQ+KGFycmF5OiBUW10pOiBUW11cbntcblx0cmV0dXJuIGFycmF5LmZpbHRlcihmdW5jdGlvbiAoZWwsIGluZGV4LCBhcnIpXG5cdHtcblx0XHRyZXR1cm4gaW5kZXggPT0gYXJyLmluZGV4T2YoZWwpO1xuXHR9KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGVzY2FwZVJlZ2V4cChzdHI6IHN0cmluZylcbntcblx0cmV0dXJuIHN0ci5yZXBsYWNlKC9bfFxcXFx7fSgpXFxbXFxdXiQrKj8uXFwvXS9nLCAnXFxcXCQmJyk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBfZml4Vm9sdW1lQ2hhcHRlck5hbWUobmFtZTogc3RyaW5nKVxue1xuXHRyZXR1cm4gbmFtZS5yZXBsYWNlKC9bP0AhJCNcXFxcXFwvPD5cXFtcXF17fSgpKl0rL2csIHMgPT4gU3RyVXRpbC50b0Z1bGxXaWR0aChzKSlcbn1cblxuZXhwb3J0IGRlZmF1bHQgZXhwb3J0cyBhcyB0eXBlb2YgaW1wb3J0KCcuL3V0aWwnKTtcbiJdfQ==