"use strict";
/**
 * Created by user on 2019/4/28.
 */
Object.defineProperty(exports, "__esModule", { value: true });
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3JlYXRlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiY3JlYXRlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7R0FFRzs7QUFHSCx1Q0FBNkM7QUFFN0MsdURBQXdEO0FBRXhELHFFQUFzRTtBQUN0RSxvREFBcUQ7QUFNckQsSUFBSSxRQUEwQixDQUFDO0FBRS9CLFNBQWdCLHFCQUFxQixDQUFxQixVQUF1QjtJQUVoRixJQUFJLFVBQVUsSUFBSSxJQUFJLEVBQ3RCO1FBQ0MsVUFBVSxHQUFHLFNBQVMsQ0FBQztLQUN2QjtJQUVELElBQUksT0FBTyxVQUFVLEtBQUssUUFBUSxFQUNsQztRQUNDLFVBQVUsR0FBRyxlQUFlLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRTtZQUUzQyxPQUFPLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUMzQixDQUFDLEVBQUU7WUFFRixPQUFPLENBQUMsY0FBYyxDQUFDLENBQUM7UUFDekIsQ0FBQyxFQUFFLE1BQU0sQ0FBTSxDQUNkO0tBQ0Q7SUFFRCxPQUFPLFVBQVUsQ0FBQztBQUNuQixDQUFDO0FBcEJELHNEQW9CQztBQUVELFNBQWdCLHFCQUFxQixDQUE2QixVQUF1QjtJQUV4RixJQUFJLFVBQVUsSUFBSSxJQUFJLEVBQ3RCO1FBQ0MsSUFBSSxRQUFRLElBQUksSUFBSSxFQUNwQjtZQUNDLFFBQVEsR0FBRyw0QkFBaUIsRUFBRSxDQUFDO1lBQy9CLFFBQVEsQ0FBQyxNQUFNLENBQUMsRUFBRSxZQUFZLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQztTQUN4QztRQUVELFVBQVUsR0FBRyxRQUFhLENBQUE7S0FDMUI7SUFFRCxJQUFJLE9BQU8sVUFBVSxLQUFLLFFBQVEsRUFDbEM7UUFDQyxVQUFVLEdBQUksT0FBTyxDQUFDLFVBQVUsQ0FBNEI7YUFDMUQsaUJBQWlCLEVBQU8sQ0FDekI7UUFFRCxVQUFVLENBQUMsTUFBTSxDQUFDLEVBQUUsWUFBWSxFQUFFLElBQUksRUFBRSxDQUFDLENBQUM7S0FDMUM7SUFFRCxPQUFPLFVBQVUsQ0FBQTtBQUNsQixDQUFDO0FBdkJELHNEQXVCQztBQUVELFNBQWdCLG1CQUFtQixDQUFxQixVQUF1QjtJQUU5RSxPQUFPLG9CQUFvQixDQUFDLHFCQUFxQixDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUE7QUFDL0QsQ0FBQztBQUhELGtEQUdDO0FBRUQsU0FBZ0Isb0JBQW9CLENBQWlELFVBSWpGLEVBQUU7SUFFTCxJQUFJLEVBQUUsVUFBVSxFQUFFLFVBQVUsRUFBRSxHQUFHLE9BQU8sQ0FBQztJQUV6QyxVQUFVLEdBQUcscUJBQXFCLENBQUMsVUFBVSxDQUFDLENBQUM7SUFDL0MsVUFBVSxHQUFHLHFCQUFxQixDQUFDLFVBQVUsQ0FBQyxDQUFDO0lBRS9DLFNBQVMsQ0FBQztRQUNULE9BQU8sRUFBRSxVQUFVO1FBQ25CLFdBQVcsRUFBRSxVQUFVO1FBQ3ZCLE1BQU0sRUFBRTtZQUNQLE1BQU07WUFDTixPQUFPO1lBQ1AsU0FBUztZQUNULFFBQVE7WUFDUixTQUFTO1NBQ1Q7UUFDRCxnQkFBZ0IsRUFBRSxVQUFVLE9BQU8sRUFBRSxNQUFNLEVBQUUsUUFBUTtZQUVwRCxNQUFNLElBQUksR0FBRyxJQUFJLENBQUM7WUFDbEIsUUFBUSxDQUFDO2dCQUVSLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQztZQUNkLENBQUMsQ0FBQyxDQUFDO1FBQ0osQ0FBQztLQUNELENBQUMsQ0FBQztJQUlILGFBQWE7SUFDYixVQUFVLENBQUMsT0FBTyxHQUFHLFNBQVMsVUFBVTtRQUN2QyxNQUFNLElBQUksS0FBSyxDQUFDLG1KQUFtSixDQUFDLENBQUM7SUFDdEssQ0FBQyxDQUFDO0lBRUYsT0FBTyxVQUFvQyxDQUFBO0FBQzVDLENBQUM7QUF2Q0Qsb0RBdUNDO0FBRUQsa0JBQWUsb0JBQW9CLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENyZWF0ZWQgYnkgdXNlciBvbiAyMDE5LzQvMjguXG4gKi9cblxuaW1wb3J0IF9yZXF1ZXN0ID0gcmVxdWlyZSgncmVxdWVzdCcpO1xuaW1wb3J0IHsgZ2V0TmV3TGlicmFyeUNvcHkgfSBmcm9tICdibHVlYmlyZCc7XG5pbXBvcnQgQmx1ZWJpcmRQcm9taXNlID0gcmVxdWlyZSgnYmx1ZWJpcmQnKTtcbmltcG9ydCBfY3JlYXRlQ2FjaGVkUmVxdWVzdCA9IHJlcXVpcmUoJ2NhY2hlZC1yZXF1ZXN0Jyk7XG5pbXBvcnQgUmVxdWVzdFByb21pc2UgPSByZXF1aXJlKCdyZXF1ZXN0LXByb21pc2UnKTtcbmltcG9ydCBjb25maWd1cmUgPSByZXF1aXJlKCdyZXF1ZXN0LXByb21pc2UtY29yZS9jb25maWd1cmUvcmVxdWVzdDInKTtcbmltcG9ydCBzdGVhbHRoeVJlcXVpcmUgPSByZXF1aXJlKCdzdGVhbHRoeS1yZXF1aXJlJyk7XG5cbmV4cG9ydCB0eXBlIElSZXF1ZXN0ID0gdHlwZW9mIF9yZXF1ZXN0O1xuZXhwb3J0IHR5cGUgSVJlcXVlc3RQcm9taXNlID0gdHlwZW9mIFJlcXVlc3RQcm9taXNlO1xuZXhwb3J0IHR5cGUgSUJsdWViaXJkUHJvbWlzZSA9IHR5cGVvZiBCbHVlYmlyZFByb21pc2U7XG5cbmxldCBCbHVlYmlyZDogSUJsdWViaXJkUHJvbWlzZTtcblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZVN0ZWFsdGh5UmVxdWVzdDxUIGV4dGVuZHMgSVJlcXVlc3Q+KGxpYlJlcXVlc3Q/OiBzdHJpbmcgfCBUKTogVFxue1xuXHRpZiAobGliUmVxdWVzdCA9PSBudWxsKVxuXHR7XG5cdFx0bGliUmVxdWVzdCA9ICdyZXF1ZXN0Jztcblx0fVxuXG5cdGlmICh0eXBlb2YgbGliUmVxdWVzdCA9PT0gJ3N0cmluZycpXG5cdHtcblx0XHRsaWJSZXF1ZXN0ID0gc3RlYWx0aHlSZXF1aXJlKHJlcXVpcmUuY2FjaGUsIGZ1bmN0aW9uICgpXG5cdFx0e1xuXHRcdFx0cmV0dXJuIHJlcXVpcmUoJ3JlcXVlc3QnKTtcblx0XHR9LCBmdW5jdGlvbiAoKVxuXHRcdHtcblx0XHRcdHJlcXVpcmUoJ3RvdWdoLWNvb2tpZScpO1xuXHRcdH0sIG1vZHVsZSkgYXMgVFxuXHRcdDtcblx0fVxuXG5cdHJldHVybiBsaWJSZXF1ZXN0O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlQmx1ZWJpcmRQcm9taXNlPFAgZXh0ZW5kcyBJQmx1ZWJpcmRQcm9taXNlPihsaWJQcm9taXNlPzogc3RyaW5nIHwgUCk6IFBcbntcblx0aWYgKGxpYlByb21pc2UgPT0gbnVsbClcblx0e1xuXHRcdGlmIChCbHVlYmlyZCA9PSBudWxsKVxuXHRcdHtcblx0XHRcdEJsdWViaXJkID0gZ2V0TmV3TGlicmFyeUNvcHkoKTtcblx0XHRcdEJsdWViaXJkLmNvbmZpZyh7IGNhbmNlbGxhdGlvbjogdHJ1ZSB9KTtcblx0XHR9XG5cblx0XHRsaWJQcm9taXNlID0gQmx1ZWJpcmQgYXMgUFxuXHR9XG5cblx0aWYgKHR5cGVvZiBsaWJQcm9taXNlID09PSAnc3RyaW5nJylcblx0e1xuXHRcdGxpYlByb21pc2UgPSAocmVxdWlyZShsaWJQcm9taXNlKSBhcyB0eXBlb2YgQmx1ZWJpcmRQcm9taXNlKVxuXHRcdFx0LmdldE5ld0xpYnJhcnlDb3B5KCkgYXMgUFxuXHRcdDtcblxuXHRcdGxpYlByb21pc2UuY29uZmlnKHsgY2FuY2VsbGF0aW9uOiB0cnVlIH0pO1xuXHR9XG5cblx0cmV0dXJuIGxpYlByb21pc2Vcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUNhY2hlZFJlcXVlc3Q8VCBleHRlbmRzIElSZXF1ZXN0PihsaWJSZXF1ZXN0Pzogc3RyaW5nIHwgVCk6IFRcbntcblx0cmV0dXJuIF9jcmVhdGVDYWNoZWRSZXF1ZXN0KGNyZWF0ZVN0ZWFsdGh5UmVxdWVzdChsaWJSZXF1ZXN0KSlcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZVJlcXVlc3RQcm9taXNlPFIgZXh0ZW5kcyBJUmVxdWVzdCwgUCBleHRlbmRzIElCbHVlYmlyZFByb21pc2U+KG9wdGlvbnM6IHtcblx0bGliUmVxdWVzdD86IHN0cmluZyB8IFIsXG5cdGxpYlByb21pc2U/OiBzdHJpbmcgfCBQLFxuXG59ID0ge30pOiBJUmVxdWVzdFByb21pc2Vcbntcblx0bGV0IHsgbGliUmVxdWVzdCwgbGliUHJvbWlzZSB9ID0gb3B0aW9ucztcblxuXHRsaWJQcm9taXNlID0gY3JlYXRlQmx1ZWJpcmRQcm9taXNlKGxpYlByb21pc2UpO1xuXHRsaWJSZXF1ZXN0ID0gY3JlYXRlU3RlYWx0aHlSZXF1ZXN0KGxpYlJlcXVlc3QpO1xuXG5cdGNvbmZpZ3VyZSh7XG5cdFx0cmVxdWVzdDogbGliUmVxdWVzdCxcblx0XHRQcm9taXNlSW1wbDogbGliUHJvbWlzZSxcblx0XHRleHBvc2U6IFtcblx0XHRcdCd0aGVuJyxcblx0XHRcdCdjYXRjaCcsXG5cdFx0XHQnZmluYWxseScsXG5cdFx0XHQnY2FuY2VsJyxcblx0XHRcdCdwcm9taXNlJyxcblx0XHRdLFxuXHRcdGNvbnN0cnVjdG9yTWl4aW46IGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QsIG9uQ2FuY2VsKVxuXHRcdHtcblx0XHRcdGNvbnN0IHNlbGYgPSB0aGlzO1xuXHRcdFx0b25DYW5jZWwoZnVuY3Rpb24gKClcblx0XHRcdHtcblx0XHRcdFx0c2VsZi5hYm9ydCgpO1xuXHRcdFx0fSk7XG5cdFx0fSxcblx0fSk7XG5cblxuXG5cdC8vIEB0cy1pZ25vcmVcblx0bGliUmVxdWVzdC5iaW5kQ0xTID0gZnVuY3Rpb24gUlAkYmluZENMUygpIHtcblx0XHR0aHJvdyBuZXcgRXJyb3IoJ0NMUyBzdXBwb3J0IHdhcyBkcm9wcGVkLiBUbyBnZXQgaXQgYmFjayByZWFkOiBodHRwczovL2dpdGh1Yi5jb20vcmVxdWVzdC9yZXF1ZXN0LXByb21pc2Uvd2lraS9HZXR0aW5nLUJhY2stU3VwcG9ydC1mb3ItQ29udGludWF0aW9uLUxvY2FsLVN0b3JhZ2UnKTtcblx0fTtcblxuXHRyZXR1cm4gbGliUmVxdWVzdCBhcyBhbnkgYXMgSVJlcXVlc3RQcm9taXNlXG59XG5cbmV4cG9ydCBkZWZhdWx0IGNyZWF0ZVJlcXVlc3RQcm9taXNlXG4iXX0=