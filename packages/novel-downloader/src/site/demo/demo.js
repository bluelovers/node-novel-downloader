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
let NovelSiteDemo = /** @class */ (() => {
    let NovelSiteDemo = class NovelSiteDemo extends base_1.default {
        makeUrl(urlobj, ...argv) {
            throw new SyntaxError(`Function not implemented`);
        }
        parseUrl(url, ...argv) {
            throw new SyntaxError(`Function not implemented`);
        }
        _parseChapter(ret, optionsRuntime, _cache_) {
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
    return NovelSiteDemo;
})();
exports.NovelSiteDemo = NovelSiteDemo;
exports.default = NovelSiteDemo;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVtby5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImRlbW8udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOztHQUVHOzs7Ozs7OztBQUVILG9DQUFzRTtBQUl0RSxpQ0FBbUM7QUFPbkM7SUFBQSxJQUFhLGFBQWEsR0FBMUIsTUFBYSxhQUFjLFNBQVEsY0FBYTtRQUkvQyxPQUFPLENBQUMsTUFBNEIsRUFBRSxHQUFHLElBQUk7WUFFNUMsTUFBTSxJQUFJLFdBQVcsQ0FBQywwQkFBMEIsQ0FBQyxDQUFDO1FBQ25ELENBQUM7UUFFRCxRQUFRLENBQUMsR0FBMEIsRUFBRSxHQUFHLElBQUk7WUFFM0MsTUFBTSxJQUFJLFdBQVcsQ0FBQywwQkFBMEIsQ0FBQyxDQUFDO1FBQ25ELENBQUM7UUFFUyxhQUFhLENBQUksR0FBa0IsRUFBRSxjQUFtQyxFQUFFLE9BRW5GO1lBRUEsSUFBSSxDQUFDLEdBQUcsRUFDUjtnQkFDQyxPQUFPLEVBQUUsQ0FBQzthQUNWO1lBRUQsTUFBTSxJQUFJLFdBQVcsQ0FBQywwQkFBMEIsQ0FBQyxDQUFDO1FBQ25ELENBQUM7UUFFRCxLQUFLLENBQUMsZUFBZSxDQUFzQixHQUFpQixFQUMzRCxpQkFBK0MsRUFBRTtZQUdqRCxNQUFNLElBQUksV0FBVyxDQUFDLDBCQUEwQixDQUFDLENBQUM7UUFDbkQsQ0FBQztLQUNELENBQUE7SUE5QnVCLG1CQUFLLEdBQUcsRUFBRSxDQUFDO0lBRnRCLGFBQWE7UUFEekIsd0JBQWdCLEVBQThDO09BQ2xELGFBQWEsQ0FnQ3pCO0lBQUQsb0JBQUM7S0FBQTtBQWhDWSxzQ0FBYTtBQWtDMUIsa0JBQWUsYUFBYSxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDcmVhdGVkIGJ5IHVzZXIgb24gMjAxOC8zLzI1LzAyNS5cbiAqL1xuXG5pbXBvcnQgX05vdmVsU2l0ZSwgeyBzdGF0aWNJbXBsZW1lbnRzLCBTWU1CT0xfQ0FDSEUgfSBmcm9tICcuLi9pbmRleCc7XG5pbXBvcnQgeyBJRG93bmxvYWRPcHRpb25zLCBJTm92ZWwgfSBmcm9tICcuL2Jhc2UnO1xuaW1wb3J0IHsgSUZldGNoQ2hhcHRlciwgSU9wdGlvbnNSdW50aW1lIH0gZnJvbSAnLi9iYXNlJztcbmltcG9ydCAqIGFzIF9Ob3ZlbFNpdGVCYXNlIGZyb20gJy4vYmFzZSc7XG5pbXBvcnQgTm92ZWxTaXRlQmFzZSBmcm9tICcuL2Jhc2UnO1xuLy9pbXBvcnQgeyBVUkwgfSBmcm9tICdqc2RvbS11cmwnO1xuaW1wb3J0IHsgZnJvbVVSTCwgSUZyb21VcmxPcHRpb25zLCBJSlNET00gfSBmcm9tICdqc2RvbS1leHRyYSc7XG5pbXBvcnQgeyBQcm9taXNlQmx1ZWJpcmQsIGJsdWViaXJkRGVjb3JhdG9yIH0gZnJvbSAnLi4vaW5kZXgnO1xuaW1wb3J0IHsgbW9tZW50IH0gZnJvbSAnLi4vaW5kZXgnO1xuXG5Ac3RhdGljSW1wbGVtZW50czxfTm92ZWxTaXRlLklOb3ZlbFNpdGVTdGF0aWM8Tm92ZWxTaXRlRGVtbz4+KClcbmV4cG9ydCBjbGFzcyBOb3ZlbFNpdGVEZW1vIGV4dGVuZHMgTm92ZWxTaXRlQmFzZVxue1xuXHRwdWJsaWMgc3RhdGljIHJlYWRvbmx5IElES0VZID0gJyc7XG5cblx0bWFrZVVybCh1cmxvYmo6IF9Ob3ZlbFNpdGUuSVBhcnNlVXJsLCAuLi5hcmd2KTogVVJMXG5cdHtcblx0XHR0aHJvdyBuZXcgU3ludGF4RXJyb3IoYEZ1bmN0aW9uIG5vdCBpbXBsZW1lbnRlZGApO1xuXHR9XG5cblx0cGFyc2VVcmwodXJsOiBVUkwgfCBzdHJpbmcgfCBudW1iZXIsIC4uLmFyZ3YpOiBfTm92ZWxTaXRlLklQYXJzZVVybFxuXHR7XG5cdFx0dGhyb3cgbmV3IFN5bnRheEVycm9yKGBGdW5jdGlvbiBub3QgaW1wbGVtZW50ZWRgKTtcblx0fVxuXG5cdHByb3RlY3RlZCBfcGFyc2VDaGFwdGVyPFQ+KHJldDogSUZldGNoQ2hhcHRlciwgb3B0aW9uc1J1bnRpbWU6IFQgJiBJT3B0aW9uc1J1bnRpbWUsIF9jYWNoZV86IHtcblx0XHRub3ZlbDogSU5vdmVsLFxuXHR9KTogc3RyaW5nXG5cdHtcblx0XHRpZiAoIXJldClcblx0XHR7XG5cdFx0XHRyZXR1cm4gJyc7XG5cdFx0fVxuXG5cdFx0dGhyb3cgbmV3IFN5bnRheEVycm9yKGBGdW5jdGlvbiBub3QgaW1wbGVtZW50ZWRgKTtcblx0fVxuXG5cdGFzeW5jIGdldF92b2x1bWVfbGlzdDxUID0gSU9wdGlvbnNSdW50aW1lPih1cmw6IHN0cmluZyB8IFVSTCxcblx0XHRvcHRpb25zUnVudGltZTogUGFydGlhbDxUICYgSU9wdGlvbnNSdW50aW1lPiA9IHt9XG5cdCk6IFByb21pc2U8SU5vdmVsPlxuXHR7XG5cdFx0dGhyb3cgbmV3IFN5bnRheEVycm9yKGBGdW5jdGlvbiBub3QgaW1wbGVtZW50ZWRgKTtcblx0fVxufVxuXG5leHBvcnQgZGVmYXVsdCBOb3ZlbFNpdGVEZW1vO1xuIl19