"use strict";
/**
 * Created by user on 2018/4/28/028.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const StrUtil = require("str-util");
const regexp_cjk_1 = require("regexp-cjk");
const util_1 = require("./util");
let inited;
function stripInit() {
    return [
        ` *(?:uu看书.? *)*(?:https:\\\/*)*www.uukanshu.?c?om? *`,
        `(?:\\&?n?b?s?p?;?)*[ &~／\\/（;《＝＋+=(\\-\\[]*猪.{0,5}?猪.{0,5}?岛.{0,5}?小.{0,5}?说.{0,5}?www(?:.(?:huhu|huzu|zuhu|huuo|zhu(?:zud)?|zhzhuam|zhu.{0,5}zhu)?(.?c?om?)?)?[ &~／\\/;＝＋+={}]*(?:.?\\&?n?b?s?p?;?)*~?[ &~／\\/;＝＋+={}\\-()]*\\.?`,
        `^岛.小说www.zuzud;`,
        `小说 ww.zhu\.`,
        `&nbs.{0,5}?zhuzhu.{0,5}?..{0,5}?p;`,
        `&nb.{0,5}?zhu.{0,5}?zhu.{0,5}?.omsp;`,
        `@zzhdo.om;`,
        `\\$.{0,5}?zhu.{0,5}?zhu.{0,5}?..{0,5}?\\)`,
        `&@zzhdo.omnbsp;`,
        `｜.{0,5}?zhu.{0,5}?zhu.{0,5}?\\]`,
        `\\{zhuzhu.{0,5}?..{0,5}?\\}`,
        `&.{0,5}?zhudanbsp;`,
        `\\[zhu.{0,5}?..{0,5}?\\]`,
        `&nzhu＋;`,
        `\\[zhu\\]\\[\\].\\[\\]`,
        `(?:<a>)?UU看书欢迎广大书友光临阅读，最新、最快、最火的连载作品尽在UU看书！(?:<\\/a>)?;?(?:(?:<a>)?UU看书。(?:<\\/a>)?;?)?`,
        `(?:<a>)?UU看书。(?:<\\/a>)?;?`,
    ].reduce(function (a, v) {
        let s = char_autoFH(v);
        if (s.indexOf('^') != 0) {
            s = ' *' + s;
        }
        if (s[s.length - 1] != '$') {
            s = s + ' *';
        }
        let r = new regexp_cjk_1.zhRegExp(s, 'igm');
        a.push(r);
        return a;
    }, []);
}
exports.stripInit = stripInit;
function stripContent(text) {
    if (!inited || !inited.length) {
        inited = stripInit();
    }
    inited.forEach(function (r) {
        text = text.replace(r, '');
    });
    return text;
}
exports.stripContent = stripContent;
function char_autoFH(text) {
    return text
        .replace(/([a-z])(\1)*/ig, function (ss, s) {
        s = s[0];
        let a = [].concat([
            s,
            s.toLowerCase(),
            s.toUpperCase(),
            s.toLocaleLowerCase(),
            s.toLocaleUpperCase(),
        ]);
        a.forEach(function (v) {
            a.push(StrUtil.toFullWidth(v));
        });
        return '[' + util_1.array_unique(a).join('') + ']+';
    });
}
exports.default = exports;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RyaXAuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJzdHJpcC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7O0dBRUc7O0FBRUgsb0NBQW9DO0FBQ3BDLDJDQUFzQztBQUN0QyxpQ0FBc0M7QUFFdEMsSUFBSSxNQUFnQixDQUFDO0FBRXJCLFNBQWdCLFNBQVM7SUFFeEIsT0FBTztRQUNOLHNEQUFzRDtRQUN0RCxtT0FBbU87UUFFbk8saUJBQWlCO1FBQ2pCLGFBQWE7UUFFYixvQ0FBb0M7UUFDcEMsc0NBQXNDO1FBQ3RDLFlBQVk7UUFDWiwyQ0FBMkM7UUFFM0MsaUJBQWlCO1FBQ2pCLGlDQUFpQztRQUVqQyw2QkFBNkI7UUFFN0Isb0JBQW9CO1FBRXBCLDBCQUEwQjtRQUMxQixTQUFTO1FBRVQsd0JBQXdCO1FBRXhCLHlGQUF5RjtRQUV6Riw0QkFBNEI7S0FFNUIsQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQztRQUV0QixJQUFJLENBQUMsR0FBRyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFFdkIsSUFBSSxDQUFDLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFDdkI7WUFDQyxDQUFDLEdBQUcsSUFBSSxHQUFHLENBQUMsQ0FBQztTQUNiO1FBRUQsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsSUFBSSxHQUFHLEVBQzFCO1lBQ0MsQ0FBQyxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUM7U0FDYjtRQUVELElBQUksQ0FBQyxHQUFHLElBQUkscUJBQVEsQ0FBQyxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFFL0IsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUVWLE9BQU8sQ0FBQyxDQUFDO0lBQ1YsQ0FBQyxFQUFFLEVBQWMsQ0FBQyxDQUFDO0FBQ3BCLENBQUM7QUFsREQsOEJBa0RDO0FBRUQsU0FBZ0IsWUFBWSxDQUFDLElBQVk7SUFFeEMsSUFBSSxDQUFDLE1BQU0sSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLEVBQzdCO1FBQ0MsTUFBTSxHQUFHLFNBQVMsRUFBRSxDQUFDO0tBQ3JCO0lBRUQsTUFBTSxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUM7UUFFekIsSUFBSSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO0lBQzVCLENBQUMsQ0FBQyxDQUFDO0lBRUgsT0FBTyxJQUFJLENBQUM7QUFDYixDQUFDO0FBYkQsb0NBYUM7QUFFRCxTQUFTLFdBQVcsQ0FBQyxJQUFZO0lBRWhDLE9BQU8sSUFBSTtTQUNULE9BQU8sQ0FBQyxnQkFBZ0IsRUFBRSxVQUFVLEVBQUUsRUFBRSxDQUFDO1FBRXpDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFFVCxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUMsTUFBTSxDQUFDO1lBQ2pCLENBQUM7WUFDRCxDQUFDLENBQUMsV0FBVyxFQUFFO1lBQ2YsQ0FBQyxDQUFDLFdBQVcsRUFBRTtZQUNmLENBQUMsQ0FBQyxpQkFBaUIsRUFBRTtZQUNyQixDQUFDLENBQUMsaUJBQWlCLEVBQUU7U0FDckIsQ0FBQyxDQUFDO1FBRUgsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUM7WUFFcEIsQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDaEMsQ0FBQyxDQUFDLENBQUM7UUFFSCxPQUFPLEdBQUcsR0FBRyxtQkFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUM7SUFDOUMsQ0FBQyxDQUFDLENBQ0Q7QUFDSCxDQUFDO0FBRUQsa0JBQWUsT0FBbUMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ3JlYXRlZCBieSB1c2VyIG9uIDIwMTgvNC8yOC8wMjguXG4gKi9cblxuaW1wb3J0ICogYXMgU3RyVXRpbCBmcm9tICdzdHItdXRpbCc7XG5pbXBvcnQgeyB6aFJlZ0V4cCB9IGZyb20gJ3JlZ2V4cC1jamsnO1xuaW1wb3J0IHsgYXJyYXlfdW5pcXVlIH0gZnJvbSAnLi91dGlsJztcblxubGV0IGluaXRlZDogUmVnRXhwW107XG5cbmV4cG9ydCBmdW5jdGlvbiBzdHJpcEluaXQoKVxue1xuXHRyZXR1cm4gW1xuXHRcdGAgKig/OnV155yL5LmmLj8gKikqKD86aHR0cHM6XFxcXFxcLyopKnd3dy51dWthbnNodS4/Yz9vbT8gKmAsXG5cdFx0YCg/OlxcXFwmP24/Yj9zP3A/Oz8pKlsgJn7vvI9cXFxcL++8iDvjgIrvvJ3vvIsrPShcXFxcLVxcXFxbXSrnjKouezAsNX0/54yqLnswLDV9P+Wymy57MCw1fT/lsI8uezAsNX0/6K+0LnswLDV9P3d3dyg/Oi4oPzpodWh1fGh1enV8enVodXxodXVvfHpodSg/Onp1ZCk/fHpoemh1YW18emh1LnswLDV9emh1KT8oLj9jP29tPyk/KT9bICZ+77yPXFxcXC8777yd77yLKz17fV0qKD86Lj9cXFxcJj9uP2I/cz9wPzs/KSp+P1sgJn7vvI9cXFxcLzvvvJ3vvIsrPXt9XFxcXC0oKV0qXFxcXC4/YCxcblxuXHRcdGBe5bKbLuWwj+ivtHd3dy56dXp1ZDtgLFxuXHRcdGDlsI/or7Qgd3cuemh1XFwuYCxcblxuXHRcdGAmbmJzLnswLDV9P3podXpodS57MCw1fT8uLnswLDV9P3A7YCxcblx0XHRgJm5iLnswLDV9P3podS57MCw1fT96aHUuezAsNX0/Lm9tc3A7YCxcblx0XHRgQHp6aGRvLm9tO2AsXG5cdFx0YFxcXFwkLnswLDV9P3podS57MCw1fT96aHUuezAsNX0/Li57MCw1fT9cXFxcKWAsXG5cblx0XHRgJkB6emhkby5vbW5ic3A7YCxcblx0XHRg772cLnswLDV9P3podS57MCw1fT96aHUuezAsNX0/XFxcXF1gLFxuXG5cdFx0YFxcXFx7emh1emh1LnswLDV9Py4uezAsNX0/XFxcXH1gLFxuXG5cdFx0YCYuezAsNX0/emh1ZGFuYnNwO2AsXG5cblx0XHRgXFxcXFt6aHUuezAsNX0/Li57MCw1fT9cXFxcXWAsXG5cdFx0YCZuemh177yLO2AsXG5cblx0XHRgXFxcXFt6aHVcXFxcXVxcXFxbXFxcXF0uXFxcXFtcXFxcXWAsXG5cblx0XHRgKD86PGE+KT9VVeeci+S5puasoui/juW5v+Wkp+S5puWPi+WFieS4tOmYheivu++8jOacgOaWsOOAgeacgOW/q+OAgeacgOeBq+eahOi/nui9veS9nOWTgeWwveWcqFVV55yL5Lmm77yBKD86PFxcXFwvYT4pPzs/KD86KD86PGE+KT9VVeeci+S5puOAgig/OjxcXFxcL2E+KT87Pyk/YCxcblxuXHRcdGAoPzo8YT4pP1VV55yL5Lmm44CCKD86PFxcXFwvYT4pPzs/YCxcblxuXHRdLnJlZHVjZShmdW5jdGlvbiAoYSwgdilcblx0e1xuXHRcdGxldCBzID0gY2hhcl9hdXRvRkgodik7XG5cblx0XHRpZiAocy5pbmRleE9mKCdeJykgIT0gMClcblx0XHR7XG5cdFx0XHRzID0gJyAqJyArIHM7XG5cdFx0fVxuXG5cdFx0aWYgKHNbcy5sZW5ndGggLSAxXSAhPSAnJCcpXG5cdFx0e1xuXHRcdFx0cyA9IHMgKyAnIConO1xuXHRcdH1cblxuXHRcdGxldCByID0gbmV3IHpoUmVnRXhwKHMsICdpZ20nKTtcblxuXHRcdGEucHVzaChyKTtcblxuXHRcdHJldHVybiBhO1xuXHR9LCBbXSBhcyBSZWdFeHBbXSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzdHJpcENvbnRlbnQodGV4dDogc3RyaW5nKVxue1xuXHRpZiAoIWluaXRlZCB8fCAhaW5pdGVkLmxlbmd0aClcblx0e1xuXHRcdGluaXRlZCA9IHN0cmlwSW5pdCgpO1xuXHR9XG5cblx0aW5pdGVkLmZvckVhY2goZnVuY3Rpb24gKHIpXG5cdHtcblx0XHR0ZXh0ID0gdGV4dC5yZXBsYWNlKHIsICcnKTtcblx0fSk7XG5cblx0cmV0dXJuIHRleHQ7XG59XG5cbmZ1bmN0aW9uIGNoYXJfYXV0b0ZIKHRleHQ6IHN0cmluZylcbntcblx0cmV0dXJuIHRleHRcblx0XHQucmVwbGFjZSgvKFthLXpdKShcXDEpKi9pZywgZnVuY3Rpb24gKHNzLCBzKVxuXHRcdHtcblx0XHRcdHMgPSBzWzBdO1xuXG5cdFx0XHRsZXQgYSA9IFtdLmNvbmNhdChbXG5cdFx0XHRcdHMsXG5cdFx0XHRcdHMudG9Mb3dlckNhc2UoKSxcblx0XHRcdFx0cy50b1VwcGVyQ2FzZSgpLFxuXHRcdFx0XHRzLnRvTG9jYWxlTG93ZXJDYXNlKCksXG5cdFx0XHRcdHMudG9Mb2NhbGVVcHBlckNhc2UoKSxcblx0XHRcdF0pO1xuXG5cdFx0XHRhLmZvckVhY2goZnVuY3Rpb24gKHYpXG5cdFx0XHR7XG5cdFx0XHRcdGEucHVzaChTdHJVdGlsLnRvRnVsbFdpZHRoKHYpKTtcblx0XHRcdH0pO1xuXG5cdFx0XHRyZXR1cm4gJ1snICsgYXJyYXlfdW5pcXVlKGEpLmpvaW4oJycpICsgJ10rJztcblx0XHR9KVxuXHRcdDtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZXhwb3J0cyBhcyB0eXBlb2YgaW1wb3J0KCcuL3N0cmlwJyk7XG4iXX0=