"use strict";
/**
 * Created by user on 2018/3/25/025.
 */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../index");
const base_1 = require("./base");
let NovelSiteDemo = class NovelSiteDemo extends base_1.default {
    makeUrl(urlobj, options) {
        throw new SyntaxError(`Function not implemented`);
    }
    parseUrl(url, options) {
        throw new SyntaxError(`Function not implemented`);
    }
    _parseChapter(ret, optionsRuntime) {
        if (!ret) {
            return '';
        }
        throw new SyntaxError(`Function not implemented`);
    }
    async get_volume_list(url, optionsRuntime = {}) {
        throw new SyntaxError(`Function not implemented`);
    }
};
NovelSiteDemo.IDKEY = '';
NovelSiteDemo = __decorate([
    index_1.staticImplements()
], NovelSiteDemo);
exports.NovelSiteDemo = NovelSiteDemo;
exports.default = NovelSiteDemo;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVtby5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImRlbW8udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOztHQUVHOzs7Ozs7OztBQUVILG9DQUFzRTtBQUl0RSxpQ0FBbUM7QUFPbkMsSUFBYSxhQUFhLEdBQTFCLE1BQWEsYUFBYyxTQUFRLGNBQWE7SUFJL0MsT0FBTyxDQUFDLE1BQTRCLEVBQUUsT0FBUTtRQUU3QyxNQUFNLElBQUksV0FBVyxDQUFDLDBCQUEwQixDQUFDLENBQUM7SUFDbkQsQ0FBQztJQUVELFFBQVEsQ0FBQyxHQUFpQixFQUFFLE9BQVE7UUFFbkMsTUFBTSxJQUFJLFdBQVcsQ0FBQywwQkFBMEIsQ0FBQyxDQUFDO0lBQ25ELENBQUM7SUFFUyxhQUFhLENBQUksR0FBa0IsRUFBRSxjQUFtQztRQUVqRixJQUFJLENBQUMsR0FBRyxFQUNSO1lBQ0MsT0FBTyxFQUFFLENBQUM7U0FDVjtRQUVELE1BQU0sSUFBSSxXQUFXLENBQUMsMEJBQTBCLENBQUMsQ0FBQztJQUNuRCxDQUFDO0lBRUQsS0FBSyxDQUFDLGVBQWUsQ0FBc0IsR0FBaUIsRUFDM0QsaUJBQStDLEVBQUU7UUFHakQsTUFBTSxJQUFJLFdBQVcsQ0FBQywwQkFBMEIsQ0FBQyxDQUFDO0lBQ25ELENBQUM7Q0FDRCxDQUFBO0FBNUJ1QixtQkFBSyxHQUFHLEVBQUUsQ0FBQztBQUZ0QixhQUFhO0lBRHpCLHdCQUFnQixFQUE4QztHQUNsRCxhQUFhLENBOEJ6QjtBQTlCWSxzQ0FBYTtBQWdDMUIsa0JBQWUsYUFBYSxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDcmVhdGVkIGJ5IHVzZXIgb24gMjAxOC8zLzI1LzAyNS5cbiAqL1xuXG5pbXBvcnQgX05vdmVsU2l0ZSwgeyBzdGF0aWNJbXBsZW1lbnRzLCBTWU1CT0xfQ0FDSEUgfSBmcm9tICcuLi9pbmRleCc7XG5pbXBvcnQgeyBJRG93bmxvYWRPcHRpb25zLCBJTm92ZWwgfSBmcm9tICcuL2Jhc2UnO1xuaW1wb3J0IHsgSUZldGNoQ2hhcHRlciwgSU9wdGlvbnNSdW50aW1lIH0gZnJvbSAnLi9iYXNlJztcbmltcG9ydCAqIGFzIF9Ob3ZlbFNpdGVCYXNlIGZyb20gJy4vYmFzZSc7XG5pbXBvcnQgTm92ZWxTaXRlQmFzZSBmcm9tICcuL2Jhc2UnO1xuaW1wb3J0IHsgVVJMIH0gZnJvbSAnanNkb20tdXJsJztcbmltcG9ydCB7IGZyb21VUkwsIElGcm9tVXJsT3B0aW9ucywgSUpTRE9NIH0gZnJvbSAnanNkb20tZXh0cmEnO1xuaW1wb3J0IHsgUHJvbWlzZUJsdWViaXJkLCBibHVlYmlyZERlY29yYXRvciB9IGZyb20gJy4uL2luZGV4JztcbmltcG9ydCB7IG1vbWVudCB9IGZyb20gJy4uL2luZGV4JztcblxuQHN0YXRpY0ltcGxlbWVudHM8X05vdmVsU2l0ZS5JTm92ZWxTaXRlU3RhdGljPE5vdmVsU2l0ZURlbW8+PigpXG5leHBvcnQgY2xhc3MgTm92ZWxTaXRlRGVtbyBleHRlbmRzIE5vdmVsU2l0ZUJhc2Vcbntcblx0cHVibGljIHN0YXRpYyByZWFkb25seSBJREtFWSA9ICcnO1xuXG5cdG1ha2VVcmwodXJsb2JqOiBfTm92ZWxTaXRlLklQYXJzZVVybCwgb3B0aW9ucz8pOiBVUkxcblx0e1xuXHRcdHRocm93IG5ldyBTeW50YXhFcnJvcihgRnVuY3Rpb24gbm90IGltcGxlbWVudGVkYCk7XG5cdH1cblxuXHRwYXJzZVVybCh1cmw6IFVSTCB8IHN0cmluZywgb3B0aW9ucz8pOiBfTm92ZWxTaXRlLklQYXJzZVVybFxuXHR7XG5cdFx0dGhyb3cgbmV3IFN5bnRheEVycm9yKGBGdW5jdGlvbiBub3QgaW1wbGVtZW50ZWRgKTtcblx0fVxuXG5cdHByb3RlY3RlZCBfcGFyc2VDaGFwdGVyPFQ+KHJldDogSUZldGNoQ2hhcHRlciwgb3B0aW9uc1J1bnRpbWU6IFQgJiBJT3B0aW9uc1J1bnRpbWUpOiBzdHJpbmdcblx0e1xuXHRcdGlmICghcmV0KVxuXHRcdHtcblx0XHRcdHJldHVybiAnJztcblx0XHR9XG5cblx0XHR0aHJvdyBuZXcgU3ludGF4RXJyb3IoYEZ1bmN0aW9uIG5vdCBpbXBsZW1lbnRlZGApO1xuXHR9XG5cblx0YXN5bmMgZ2V0X3ZvbHVtZV9saXN0PFQgPSBJT3B0aW9uc1J1bnRpbWU+KHVybDogc3RyaW5nIHwgVVJMLFxuXHRcdG9wdGlvbnNSdW50aW1lOiBQYXJ0aWFsPFQgJiBJT3B0aW9uc1J1bnRpbWU+ID0ge31cblx0KTogUHJvbWlzZTxJTm92ZWw+XG5cdHtcblx0XHR0aHJvdyBuZXcgU3ludGF4RXJyb3IoYEZ1bmN0aW9uIG5vdCBpbXBsZW1lbnRlZGApO1xuXHR9XG59XG5cbmV4cG9ydCBkZWZhdWx0IE5vdmVsU2l0ZURlbW87XG4iXX0=