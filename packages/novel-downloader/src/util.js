"use strict";
/**
 * Created by user on 2018/3/18/018.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports._fixVolumeChapterName = exports.escapeRegexp = exports.trim = exports.isUndef = exports.array_unique = exports.minifyHTML = void 0;
const StrUtil = require("str-util");
const novel_text_1 = require("novel-text");
// @ts-ignore
const html_1 = require("jsdom-extra/lib/html");
Object.defineProperty(exports, "minifyHTML", { enumerable: true, get: function () { return html_1.minifyHTML; } });
const array_hyper_unique_1 = require("array-hyper-unique");
Object.defineProperty(exports, "array_unique", { enumerable: true, get: function () { return array_hyper_unique_1.array_unique; } });
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
function escapeRegexp(str) {
    return str.replace(/[|\\{}()\[\]^$+*?.\/]/g, '\\$&');
}
exports.escapeRegexp = escapeRegexp;
function _fixVolumeChapterName(name) {
    return name.replace(/[?@!$#\\\/<>\[\]{}()*]+/g, s => StrUtil.toFullWidth(s));
}
exports._fixVolumeChapterName = _fixVolumeChapterName;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInV0aWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOztHQUVHOzs7QUFFSCxvQ0FBcUM7QUFDckMsMkNBQW1DO0FBQ25DLGFBQWE7QUFDYiwrQ0FBa0Q7QUFHekMsMkZBSEEsaUJBQVUsT0FHQTtBQUZuQiwyREFBa0Q7QUFFN0IsNkZBRlosaUNBQVksT0FFWTtBQUVqQyxTQUFnQixPQUFPLENBQUMsQ0FBQyxFQUFFLE9BQVksSUFBSSxFQUFFLE1BQWdCO0lBRTVELElBQUksSUFBSSxHQUFHLE9BQU8sQ0FBQyxJQUFJLFdBQVcsSUFBSSxDQUFDLEtBQUssSUFBSSxDQUFDO0lBRWpELElBQUksQ0FBQyxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEVBQzNCO1FBQ0MsSUFBSSxHQUFHLEtBQUssQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUUzQyxLQUFLLElBQUksQ0FBQyxJQUFJLElBQUksRUFDbEI7WUFDQyxJQUFJLElBQUksR0FBRyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUM7WUFFckMsSUFBSSxJQUFJLEVBQ1I7Z0JBQ0MsT0FBTyxJQUFJLENBQUM7YUFDWjtTQUNEO0tBQ0Q7SUFFRCxPQUFPLElBQUksQ0FBQztBQUNiLENBQUM7QUFwQkQsMEJBb0JDO0FBRUQsU0FBZ0IsSUFBSSxDQUFDLEdBQVcsRUFBRSxJQUFjO0lBRS9DLElBQUksQ0FBQyxHQUFHLG9CQUFTLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRTtRQUMzQixJQUFJLEVBQUUsR0FBRztLQUNULENBQUMsQ0FBQztJQUVILElBQUksSUFBSSxFQUNSO1FBQ0MsQ0FBQyxHQUFHLENBQUMsQ0FBQyxPQUFPLENBQUMsa0JBQWtCLEVBQUUsRUFBRSxDQUFDLENBQUM7S0FDdEM7SUFFRCxPQUFPLENBQUMsQ0FBQztBQUNWLENBQUM7QUFaRCxvQkFZQztBQUVELFNBQWdCLFlBQVksQ0FBQyxHQUFXO0lBRXZDLE9BQU8sR0FBRyxDQUFDLE9BQU8sQ0FBQyx3QkFBd0IsRUFBRSxNQUFNLENBQUMsQ0FBQztBQUN0RCxDQUFDO0FBSEQsb0NBR0M7QUFFRCxTQUFnQixxQkFBcUIsQ0FBQyxJQUFZO0lBRWpELE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQywwQkFBMEIsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtBQUM3RSxDQUFDO0FBSEQsc0RBR0MiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENyZWF0ZWQgYnkgdXNlciBvbiAyMDE4LzMvMTgvMDE4LlxuICovXG5cbmltcG9ydCBTdHJVdGlsID0gcmVxdWlyZSgnc3RyLXV0aWwnKTtcbmltcG9ydCBub3ZlbFRleHQgZnJvbSAnbm92ZWwtdGV4dCc7XG4vLyBAdHMtaWdub3JlXG5pbXBvcnQgeyBtaW5pZnlIVE1MIH0gZnJvbSAnanNkb20tZXh0cmEvbGliL2h0bWwnO1xuaW1wb3J0IHsgYXJyYXlfdW5pcXVlIH0gZnJvbSAnYXJyYXktaHlwZXItdW5pcXVlJztcblxuZXhwb3J0IHsgbWluaWZ5SFRNTCwgYXJyYXlfdW5pcXVlIH1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzVW5kZWYodiwgb3B0czogYW55ID0gbnVsbCwgc3RyaWN0PzogYm9vbGVhbik6IGJvb2xlYW5cbntcblx0bGV0IGJvb2wgPSB0eXBlb2YgdiA9PSAndW5kZWZpbmVkJyB8fCB2ID09PSBudWxsO1xuXG5cdGlmICghYm9vbCAmJiAhaXNVbmRlZihvcHRzKSlcblx0e1xuXHRcdG9wdHMgPSBBcnJheS5pc0FycmF5KG9wdHMpID8gb3B0cyA6IFtvcHRzXTtcblxuXHRcdGZvciAobGV0IHQgb2Ygb3B0cylcblx0XHR7XG5cdFx0XHRsZXQgYm9vbCA9IHN0cmljdCA/IHYgPT09IHQgOiB2ID09IHQ7XG5cblx0XHRcdGlmIChib29sKVxuXHRcdFx0e1xuXHRcdFx0XHRyZXR1cm4gYm9vbDtcblx0XHRcdH1cblx0XHR9XG5cdH1cblxuXHRyZXR1cm4gYm9vbDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHRyaW0oc3RyOiBzdHJpbmcsIGJvb2w/OiBib29sZWFuKVxue1xuXHRsZXQgdCA9IG5vdmVsVGV4dC50cmltKHN0ciwge1xuXHRcdHRyaW06ICfjgIAnLFxuXHR9KTtcblxuXHRpZiAoYm9vbClcblx0e1xuXHRcdHQgPSB0LnJlcGxhY2UoL15b44CAXFxzXSt8W+OAgFxcc10rJC9nLCAnJyk7XG5cdH1cblxuXHRyZXR1cm4gdDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGVzY2FwZVJlZ2V4cChzdHI6IHN0cmluZylcbntcblx0cmV0dXJuIHN0ci5yZXBsYWNlKC9bfFxcXFx7fSgpXFxbXFxdXiQrKj8uXFwvXS9nLCAnXFxcXCQmJyk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBfZml4Vm9sdW1lQ2hhcHRlck5hbWUobmFtZTogc3RyaW5nKVxue1xuXHRyZXR1cm4gbmFtZS5yZXBsYWNlKC9bP0AhJCNcXFxcXFwvPD5cXFtcXF17fSgpKl0rL2csIHMgPT4gU3RyVXRpbC50b0Z1bGxXaWR0aChzKSlcbn1cbiJdfQ==