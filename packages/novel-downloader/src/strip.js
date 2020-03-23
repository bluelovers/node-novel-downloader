"use strict";
/**
 * Created by user on 2018/4/28/028.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.stripContent = exports.stripInit = void 0;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RyaXAuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJzdHJpcC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7O0dBRUc7OztBQUVILG9DQUFxQztBQUNyQywyQ0FBc0M7QUFDdEMsaUNBQXNDO0FBRXRDLElBQUksTUFBZ0IsQ0FBQztBQUVyQixTQUFnQixTQUFTO0lBRXhCLE9BQU87UUFDTixzREFBc0Q7UUFDdEQsbU9BQW1PO1FBRW5PLGlCQUFpQjtRQUNqQixhQUFhO1FBRWIsb0NBQW9DO1FBQ3BDLHNDQUFzQztRQUN0QyxZQUFZO1FBQ1osMkNBQTJDO1FBRTNDLGlCQUFpQjtRQUNqQixpQ0FBaUM7UUFFakMsNkJBQTZCO1FBRTdCLG9CQUFvQjtRQUVwQiwwQkFBMEI7UUFDMUIsU0FBUztRQUVULHdCQUF3QjtRQUV4Qix5RkFBeUY7UUFFekYsNEJBQTRCO0tBRTVCLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUM7UUFFdEIsSUFBSSxDQUFDLEdBQUcsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBRXZCLElBQUksQ0FBQyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQ3ZCO1lBQ0MsQ0FBQyxHQUFHLElBQUksR0FBRyxDQUFDLENBQUM7U0FDYjtRQUVELElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLElBQUksR0FBRyxFQUMxQjtZQUNDLENBQUMsR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDO1NBQ2I7UUFFRCxJQUFJLENBQUMsR0FBRyxJQUFJLHFCQUFRLENBQUMsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBRS9CLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFFVixPQUFPLENBQUMsQ0FBQztJQUNWLENBQUMsRUFBRSxFQUFjLENBQUMsQ0FBQztBQUNwQixDQUFDO0FBbERELDhCQWtEQztBQUVELFNBQWdCLFlBQVksQ0FBQyxJQUFZO0lBRXhDLElBQUksQ0FBQyxNQUFNLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUM3QjtRQUNDLE1BQU0sR0FBRyxTQUFTLEVBQUUsQ0FBQztLQUNyQjtJQUVELE1BQU0sQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDO1FBRXpCLElBQUksR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztJQUM1QixDQUFDLENBQUMsQ0FBQztJQUVILE9BQU8sSUFBSSxDQUFDO0FBQ2IsQ0FBQztBQWJELG9DQWFDO0FBRUQsU0FBUyxXQUFXLENBQUMsSUFBWTtJQUVoQyxPQUFPLElBQUk7U0FDVCxPQUFPLENBQUMsZ0JBQWdCLEVBQUUsVUFBVSxFQUFFLEVBQUUsQ0FBQztRQUV6QyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBRVQsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDLE1BQU0sQ0FBQztZQUNqQixDQUFDO1lBQ0QsQ0FBQyxDQUFDLFdBQVcsRUFBRTtZQUNmLENBQUMsQ0FBQyxXQUFXLEVBQUU7WUFDZixDQUFDLENBQUMsaUJBQWlCLEVBQUU7WUFDckIsQ0FBQyxDQUFDLGlCQUFpQixFQUFFO1NBQ3JCLENBQUMsQ0FBQztRQUVILENBQUMsQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDO1lBRXBCLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ2hDLENBQUMsQ0FBQyxDQUFDO1FBRUgsT0FBTyxHQUFHLEdBQUcsbUJBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDO0lBQzlDLENBQUMsQ0FBQyxDQUNEO0FBQ0gsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ3JlYXRlZCBieSB1c2VyIG9uIDIwMTgvNC8yOC8wMjguXG4gKi9cblxuaW1wb3J0IFN0clV0aWwgPSByZXF1aXJlKCdzdHItdXRpbCcpO1xuaW1wb3J0IHsgemhSZWdFeHAgfSBmcm9tICdyZWdleHAtY2prJztcbmltcG9ydCB7IGFycmF5X3VuaXF1ZSB9IGZyb20gJy4vdXRpbCc7XG5cbmxldCBpbml0ZWQ6IFJlZ0V4cFtdO1xuXG5leHBvcnQgZnVuY3Rpb24gc3RyaXBJbml0KClcbntcblx0cmV0dXJuIFtcblx0XHRgICooPzp1deeci+S5pi4/ICopKig/Omh0dHBzOlxcXFxcXC8qKSp3d3cudXVrYW5zaHUuP2M/b20/ICpgLFxuXHRcdGAoPzpcXFxcJj9uP2I/cz9wPzs/KSpbICZ+77yPXFxcXC/vvIg744CK77yd77yLKz0oXFxcXC1cXFxcW10q54yqLnswLDV9P+eMqi57MCw1fT/lspsuezAsNX0/5bCPLnswLDV9P+ivtC57MCw1fT93d3coPzouKD86aHVodXxodXp1fHp1aHV8aHV1b3x6aHUoPzp6dWQpP3x6aHpodWFtfHpodS57MCw1fXpodSk/KC4/Yz9vbT8pPyk/WyAmfu+8j1xcXFwvO++8ne+8iys9e31dKig/Oi4/XFxcXCY/bj9iP3M/cD87Pykqfj9bICZ+77yPXFxcXC8777yd77yLKz17fVxcXFwtKCldKlxcXFwuP2AsXG5cblx0XHRgXuWymy7lsI/or7R3d3cuenV6dWQ7YCxcblx0XHRg5bCP6K+0IHd3LnpodVxcLmAsXG5cblx0XHRgJm5icy57MCw1fT96aHV6aHUuezAsNX0/Li57MCw1fT9wO2AsXG5cdFx0YCZuYi57MCw1fT96aHUuezAsNX0/emh1LnswLDV9Py5vbXNwO2AsXG5cdFx0YEB6emhkby5vbTtgLFxuXHRcdGBcXFxcJC57MCw1fT96aHUuezAsNX0/emh1LnswLDV9Py4uezAsNX0/XFxcXClgLFxuXG5cdFx0YCZAenpoZG8ub21uYnNwO2AsXG5cdFx0YO+9nC57MCw1fT96aHUuezAsNX0/emh1LnswLDV9P1xcXFxdYCxcblxuXHRcdGBcXFxce3podXpodS57MCw1fT8uLnswLDV9P1xcXFx9YCxcblxuXHRcdGAmLnswLDV9P3podWRhbmJzcDtgLFxuXG5cdFx0YFxcXFxbemh1LnswLDV9Py4uezAsNX0/XFxcXF1gLFxuXHRcdGAmbnpode+8iztgLFxuXG5cdFx0YFxcXFxbemh1XFxcXF1cXFxcW1xcXFxdLlxcXFxbXFxcXF1gLFxuXG5cdFx0YCg/OjxhPik/VVXnnIvkuabmrKLov47lub/lpKfkuablj4vlhYnkuLTpmIXor7vvvIzmnIDmlrDjgIHmnIDlv6vjgIHmnIDngavnmoTov57ovb3kvZzlk4HlsL3lnKhVVeeci+S5pu+8gSg/OjxcXFxcL2E+KT87Pyg/Oig/OjxhPik/VVXnnIvkuabjgIIoPzo8XFxcXC9hPik/Oz8pP2AsXG5cblx0XHRgKD86PGE+KT9VVeeci+S5puOAgig/OjxcXFxcL2E+KT87P2AsXG5cblx0XS5yZWR1Y2UoZnVuY3Rpb24gKGEsIHYpXG5cdHtcblx0XHRsZXQgcyA9IGNoYXJfYXV0b0ZIKHYpO1xuXG5cdFx0aWYgKHMuaW5kZXhPZignXicpICE9IDApXG5cdFx0e1xuXHRcdFx0cyA9ICcgKicgKyBzO1xuXHRcdH1cblxuXHRcdGlmIChzW3MubGVuZ3RoIC0gMV0gIT0gJyQnKVxuXHRcdHtcblx0XHRcdHMgPSBzICsgJyAqJztcblx0XHR9XG5cblx0XHRsZXQgciA9IG5ldyB6aFJlZ0V4cChzLCAnaWdtJyk7XG5cblx0XHRhLnB1c2gocik7XG5cblx0XHRyZXR1cm4gYTtcblx0fSwgW10gYXMgUmVnRXhwW10pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc3RyaXBDb250ZW50KHRleHQ6IHN0cmluZylcbntcblx0aWYgKCFpbml0ZWQgfHwgIWluaXRlZC5sZW5ndGgpXG5cdHtcblx0XHRpbml0ZWQgPSBzdHJpcEluaXQoKTtcblx0fVxuXG5cdGluaXRlZC5mb3JFYWNoKGZ1bmN0aW9uIChyKVxuXHR7XG5cdFx0dGV4dCA9IHRleHQucmVwbGFjZShyLCAnJyk7XG5cdH0pO1xuXG5cdHJldHVybiB0ZXh0O1xufVxuXG5mdW5jdGlvbiBjaGFyX2F1dG9GSCh0ZXh0OiBzdHJpbmcpXG57XG5cdHJldHVybiB0ZXh0XG5cdFx0LnJlcGxhY2UoLyhbYS16XSkoXFwxKSovaWcsIGZ1bmN0aW9uIChzcywgcylcblx0XHR7XG5cdFx0XHRzID0gc1swXTtcblxuXHRcdFx0bGV0IGEgPSBbXS5jb25jYXQoW1xuXHRcdFx0XHRzLFxuXHRcdFx0XHRzLnRvTG93ZXJDYXNlKCksXG5cdFx0XHRcdHMudG9VcHBlckNhc2UoKSxcblx0XHRcdFx0cy50b0xvY2FsZUxvd2VyQ2FzZSgpLFxuXHRcdFx0XHRzLnRvTG9jYWxlVXBwZXJDYXNlKCksXG5cdFx0XHRdKTtcblxuXHRcdFx0YS5mb3JFYWNoKGZ1bmN0aW9uICh2KVxuXHRcdFx0e1xuXHRcdFx0XHRhLnB1c2goU3RyVXRpbC50b0Z1bGxXaWR0aCh2KSk7XG5cdFx0XHR9KTtcblxuXHRcdFx0cmV0dXJuICdbJyArIGFycmF5X3VuaXF1ZShhKS5qb2luKCcnKSArICddKyc7XG5cdFx0fSlcblx0XHQ7XG59XG4iXX0=