"use strict";
/**
 * Created by user on 2019/4/28.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRequestPromise = exports.createCachedRequest = exports.createBluebirdPromise = exports.createStealthyRequest = void 0;
const bluebird_1 = require("bluebird");
const _createCachedRequest = require("cached-request");
const configure = require("request-promise-core/configure/request2");
const stealthyRequire = require("stealthy-require");
let Bluebird;
function createStealthyRequest(libRequest) {
    if (libRequest == null) {
        libRequest = 'request';
    }
    if (typeof libRequest === 'string') {
        libRequest = stealthyRequire(require.cache, function () {
            return require('request');
        }, function () {
            require('tough-cookie');
        }, module);
    }
    return libRequest;
}
exports.createStealthyRequest = createStealthyRequest;
function createBluebirdPromise(libPromise) {
    if (libPromise == null) {
        if (Bluebird == null) {
            Bluebird = bluebird_1.getNewLibraryCopy();
            Bluebird.config({ cancellation: true });
        }
        libPromise = Bluebird;
    }
    if (typeof libPromise === 'string') {
        libPromise = require(libPromise)
            .getNewLibraryCopy();
        libPromise.config({ cancellation: true });
    }
    return libPromise;
}
exports.createBluebirdPromise = createBluebirdPromise;
function createCachedRequest(libRequest) {
    return _createCachedRequest(createStealthyRequest(libRequest));
}
exports.createCachedRequest = createCachedRequest;
function createRequestPromise(options = {}) {
    let { libRequest, libPromise } = options;
    libPromise = createBluebirdPromise(libPromise);
    libRequest = createStealthyRequest(libRequest);
    configure({
        request: libRequest,
        PromiseImpl: libPromise,
        expose: [
            'then',
            'catch',
            'finally',
            'cancel',
            'promise',
        ],
        constructorMixin: function (resolve, reject, onCancel) {
            const self = this;
            onCancel(function () {
                self.abort();
            });
        },
    });
    // @ts-ignore
    libRequest.bindCLS = function RP$bindCLS() {
        throw new Error('CLS support was dropped. To get it back read: https://github.com/request/request-promise/wiki/Getting-Back-Support-for-Continuation-Local-Storage');
    };
    return libRequest;
}
exports.createRequestPromise = createRequestPromise;
exports.default = createRequestPromise;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3JlYXRlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiY3JlYXRlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7R0FFRzs7O0FBR0gsdUNBQTZDO0FBRTdDLHVEQUF3RDtBQUV4RCxxRUFBc0U7QUFDdEUsb0RBQXFEO0FBTXJELElBQUksUUFBMEIsQ0FBQztBQUUvQixTQUFnQixxQkFBcUIsQ0FBcUIsVUFBdUI7SUFFaEYsSUFBSSxVQUFVLElBQUksSUFBSSxFQUN0QjtRQUNDLFVBQVUsR0FBRyxTQUFTLENBQUM7S0FDdkI7SUFFRCxJQUFJLE9BQU8sVUFBVSxLQUFLLFFBQVEsRUFDbEM7UUFDQyxVQUFVLEdBQUcsZUFBZSxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUU7WUFFM0MsT0FBTyxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDM0IsQ0FBQyxFQUFFO1lBRUYsT0FBTyxDQUFDLGNBQWMsQ0FBQyxDQUFDO1FBQ3pCLENBQUMsRUFBRSxNQUFNLENBQU0sQ0FDZDtLQUNEO0lBRUQsT0FBTyxVQUFVLENBQUM7QUFDbkIsQ0FBQztBQXBCRCxzREFvQkM7QUFFRCxTQUFnQixxQkFBcUIsQ0FBNkIsVUFBdUI7SUFFeEYsSUFBSSxVQUFVLElBQUksSUFBSSxFQUN0QjtRQUNDLElBQUksUUFBUSxJQUFJLElBQUksRUFDcEI7WUFDQyxRQUFRLEdBQUcsNEJBQWlCLEVBQUUsQ0FBQztZQUMvQixRQUFRLENBQUMsTUFBTSxDQUFDLEVBQUUsWUFBWSxFQUFFLElBQUksRUFBRSxDQUFDLENBQUM7U0FDeEM7UUFFRCxVQUFVLEdBQUcsUUFBYSxDQUFBO0tBQzFCO0lBRUQsSUFBSSxPQUFPLFVBQVUsS0FBSyxRQUFRLEVBQ2xDO1FBQ0MsVUFBVSxHQUFJLE9BQU8sQ0FBQyxVQUFVLENBQTRCO2FBQzFELGlCQUFpQixFQUFPLENBQ3pCO1FBRUQsVUFBVSxDQUFDLE1BQU0sQ0FBQyxFQUFFLFlBQVksRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDO0tBQzFDO0lBRUQsT0FBTyxVQUFVLENBQUE7QUFDbEIsQ0FBQztBQXZCRCxzREF1QkM7QUFFRCxTQUFnQixtQkFBbUIsQ0FBcUIsVUFBdUI7SUFFOUUsT0FBTyxvQkFBb0IsQ0FBQyxxQkFBcUIsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFBO0FBQy9ELENBQUM7QUFIRCxrREFHQztBQUVELFNBQWdCLG9CQUFvQixDQUFpRCxVQUlqRixFQUFFO0lBRUwsSUFBSSxFQUFFLFVBQVUsRUFBRSxVQUFVLEVBQUUsR0FBRyxPQUFPLENBQUM7SUFFekMsVUFBVSxHQUFHLHFCQUFxQixDQUFDLFVBQVUsQ0FBQyxDQUFDO0lBQy9DLFVBQVUsR0FBRyxxQkFBcUIsQ0FBQyxVQUFVLENBQUMsQ0FBQztJQUUvQyxTQUFTLENBQUM7UUFDVCxPQUFPLEVBQUUsVUFBVTtRQUNuQixXQUFXLEVBQUUsVUFBVTtRQUN2QixNQUFNLEVBQUU7WUFDUCxNQUFNO1lBQ04sT0FBTztZQUNQLFNBQVM7WUFDVCxRQUFRO1lBQ1IsU0FBUztTQUNUO1FBQ0QsZ0JBQWdCLEVBQUUsVUFBVSxPQUFPLEVBQUUsTUFBTSxFQUFFLFFBQVE7WUFFcEQsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDO1lBQ2xCLFFBQVEsQ0FBQztnQkFFUixJQUFJLENBQUMsS0FBSyxFQUFFLENBQUM7WUFDZCxDQUFDLENBQUMsQ0FBQztRQUNKLENBQUM7S0FDRCxDQUFDLENBQUM7SUFJSCxhQUFhO0lBQ2IsVUFBVSxDQUFDLE9BQU8sR0FBRyxTQUFTLFVBQVU7UUFDdkMsTUFBTSxJQUFJLEtBQUssQ0FBQyxtSkFBbUosQ0FBQyxDQUFDO0lBQ3RLLENBQUMsQ0FBQztJQUVGLE9BQU8sVUFBb0MsQ0FBQTtBQUM1QyxDQUFDO0FBdkNELG9EQXVDQztBQUVELGtCQUFlLG9CQUFvQixDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDcmVhdGVkIGJ5IHVzZXIgb24gMjAxOS80LzI4LlxuICovXG5cbmltcG9ydCBfcmVxdWVzdCA9IHJlcXVpcmUoJ3JlcXVlc3QnKTtcbmltcG9ydCB7IGdldE5ld0xpYnJhcnlDb3B5IH0gZnJvbSAnYmx1ZWJpcmQnO1xuaW1wb3J0IEJsdWViaXJkUHJvbWlzZSA9IHJlcXVpcmUoJ2JsdWViaXJkJyk7XG5pbXBvcnQgX2NyZWF0ZUNhY2hlZFJlcXVlc3QgPSByZXF1aXJlKCdjYWNoZWQtcmVxdWVzdCcpO1xuaW1wb3J0IFJlcXVlc3RQcm9taXNlID0gcmVxdWlyZSgncmVxdWVzdC1wcm9taXNlJyk7XG5pbXBvcnQgY29uZmlndXJlID0gcmVxdWlyZSgncmVxdWVzdC1wcm9taXNlLWNvcmUvY29uZmlndXJlL3JlcXVlc3QyJyk7XG5pbXBvcnQgc3RlYWx0aHlSZXF1aXJlID0gcmVxdWlyZSgnc3RlYWx0aHktcmVxdWlyZScpO1xuXG5leHBvcnQgdHlwZSBJUmVxdWVzdCA9IHR5cGVvZiBfcmVxdWVzdDtcbmV4cG9ydCB0eXBlIElSZXF1ZXN0UHJvbWlzZSA9IHR5cGVvZiBSZXF1ZXN0UHJvbWlzZTtcbmV4cG9ydCB0eXBlIElCbHVlYmlyZFByb21pc2UgPSB0eXBlb2YgQmx1ZWJpcmRQcm9taXNlO1xuXG5sZXQgQmx1ZWJpcmQ6IElCbHVlYmlyZFByb21pc2U7XG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVTdGVhbHRoeVJlcXVlc3Q8VCBleHRlbmRzIElSZXF1ZXN0PihsaWJSZXF1ZXN0Pzogc3RyaW5nIHwgVCk6IFRcbntcblx0aWYgKGxpYlJlcXVlc3QgPT0gbnVsbClcblx0e1xuXHRcdGxpYlJlcXVlc3QgPSAncmVxdWVzdCc7XG5cdH1cblxuXHRpZiAodHlwZW9mIGxpYlJlcXVlc3QgPT09ICdzdHJpbmcnKVxuXHR7XG5cdFx0bGliUmVxdWVzdCA9IHN0ZWFsdGh5UmVxdWlyZShyZXF1aXJlLmNhY2hlLCBmdW5jdGlvbiAoKVxuXHRcdHtcblx0XHRcdHJldHVybiByZXF1aXJlKCdyZXF1ZXN0Jyk7XG5cdFx0fSwgZnVuY3Rpb24gKClcblx0XHR7XG5cdFx0XHRyZXF1aXJlKCd0b3VnaC1jb29raWUnKTtcblx0XHR9LCBtb2R1bGUpIGFzIFRcblx0XHQ7XG5cdH1cblxuXHRyZXR1cm4gbGliUmVxdWVzdDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUJsdWViaXJkUHJvbWlzZTxQIGV4dGVuZHMgSUJsdWViaXJkUHJvbWlzZT4obGliUHJvbWlzZT86IHN0cmluZyB8IFApOiBQXG57XG5cdGlmIChsaWJQcm9taXNlID09IG51bGwpXG5cdHtcblx0XHRpZiAoQmx1ZWJpcmQgPT0gbnVsbClcblx0XHR7XG5cdFx0XHRCbHVlYmlyZCA9IGdldE5ld0xpYnJhcnlDb3B5KCk7XG5cdFx0XHRCbHVlYmlyZC5jb25maWcoeyBjYW5jZWxsYXRpb246IHRydWUgfSk7XG5cdFx0fVxuXG5cdFx0bGliUHJvbWlzZSA9IEJsdWViaXJkIGFzIFBcblx0fVxuXG5cdGlmICh0eXBlb2YgbGliUHJvbWlzZSA9PT0gJ3N0cmluZycpXG5cdHtcblx0XHRsaWJQcm9taXNlID0gKHJlcXVpcmUobGliUHJvbWlzZSkgYXMgdHlwZW9mIEJsdWViaXJkUHJvbWlzZSlcblx0XHRcdC5nZXROZXdMaWJyYXJ5Q29weSgpIGFzIFBcblx0XHQ7XG5cblx0XHRsaWJQcm9taXNlLmNvbmZpZyh7IGNhbmNlbGxhdGlvbjogdHJ1ZSB9KTtcblx0fVxuXG5cdHJldHVybiBsaWJQcm9taXNlXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVDYWNoZWRSZXF1ZXN0PFQgZXh0ZW5kcyBJUmVxdWVzdD4obGliUmVxdWVzdD86IHN0cmluZyB8IFQpOiBUXG57XG5cdHJldHVybiBfY3JlYXRlQ2FjaGVkUmVxdWVzdChjcmVhdGVTdGVhbHRoeVJlcXVlc3QobGliUmVxdWVzdCkpXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVSZXF1ZXN0UHJvbWlzZTxSIGV4dGVuZHMgSVJlcXVlc3QsIFAgZXh0ZW5kcyBJQmx1ZWJpcmRQcm9taXNlPihvcHRpb25zOiB7XG5cdGxpYlJlcXVlc3Q/OiBzdHJpbmcgfCBSLFxuXHRsaWJQcm9taXNlPzogc3RyaW5nIHwgUCxcblxufSA9IHt9KTogSVJlcXVlc3RQcm9taXNlXG57XG5cdGxldCB7IGxpYlJlcXVlc3QsIGxpYlByb21pc2UgfSA9IG9wdGlvbnM7XG5cblx0bGliUHJvbWlzZSA9IGNyZWF0ZUJsdWViaXJkUHJvbWlzZShsaWJQcm9taXNlKTtcblx0bGliUmVxdWVzdCA9IGNyZWF0ZVN0ZWFsdGh5UmVxdWVzdChsaWJSZXF1ZXN0KTtcblxuXHRjb25maWd1cmUoe1xuXHRcdHJlcXVlc3Q6IGxpYlJlcXVlc3QsXG5cdFx0UHJvbWlzZUltcGw6IGxpYlByb21pc2UsXG5cdFx0ZXhwb3NlOiBbXG5cdFx0XHQndGhlbicsXG5cdFx0XHQnY2F0Y2gnLFxuXHRcdFx0J2ZpbmFsbHknLFxuXHRcdFx0J2NhbmNlbCcsXG5cdFx0XHQncHJvbWlzZScsXG5cdFx0XSxcblx0XHRjb25zdHJ1Y3Rvck1peGluOiBmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0LCBvbkNhbmNlbClcblx0XHR7XG5cdFx0XHRjb25zdCBzZWxmID0gdGhpcztcblx0XHRcdG9uQ2FuY2VsKGZ1bmN0aW9uICgpXG5cdFx0XHR7XG5cdFx0XHRcdHNlbGYuYWJvcnQoKTtcblx0XHRcdH0pO1xuXHRcdH0sXG5cdH0pO1xuXG5cblxuXHQvLyBAdHMtaWdub3JlXG5cdGxpYlJlcXVlc3QuYmluZENMUyA9IGZ1bmN0aW9uIFJQJGJpbmRDTFMoKSB7XG5cdFx0dGhyb3cgbmV3IEVycm9yKCdDTFMgc3VwcG9ydCB3YXMgZHJvcHBlZC4gVG8gZ2V0IGl0IGJhY2sgcmVhZDogaHR0cHM6Ly9naXRodWIuY29tL3JlcXVlc3QvcmVxdWVzdC1wcm9taXNlL3dpa2kvR2V0dGluZy1CYWNrLVN1cHBvcnQtZm9yLUNvbnRpbnVhdGlvbi1Mb2NhbC1TdG9yYWdlJyk7XG5cdH07XG5cblx0cmV0dXJuIGxpYlJlcXVlc3QgYXMgYW55IGFzIElSZXF1ZXN0UHJvbWlzZVxufVxuXG5leHBvcnQgZGVmYXVsdCBjcmVhdGVSZXF1ZXN0UHJvbWlzZVxuIl19