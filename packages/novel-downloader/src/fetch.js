"use strict";
/**
 * Created by user on 2018/2/9/009.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const request = require("request-promise");
const Promise = require("bluebird");
function retryRequest(url, options = {}) {
    options = Object.assign({
        retry: 3,
        delay: 1000,
    }, options);
    let retry = options.retry || 3;
    let libRequest = options.libRequest || request;
    let tries = 0;
    if (url.href) {
        url = url.href;
    }
    //console.log(url, options);
    function fn() {
        tries++;
        // @ts-ignore
        return libRequest(url.toString(), options)
            .catch(function (err) {
            if (retry-- > 0) {
                console.warn(`fetch fail(${tries}), will wait ${options.delay}ms, for try again\n${url}`);
                return Promise.delay(options.delay).then(fn);
            }
            err.tries = tries;
            return Promise.reject(err);
        });
    }
    return Promise.resolve().then(function () {
        return fn();
    }).tapCatch(function (err) {
        console.error(err);
    });
}
exports.retryRequest = retryRequest;
function manyRequest(url_arr, options = {}) {
    options = Object.assign({
        retry: 3,
        delay: 1000,
    }, options);
    let libRequest = options.libRequest || request;
    return Promise
        .mapSeries(url_arr, function (url) {
        if (url.href) {
            url = url.href;
        }
        // @ts-ignore
        return libRequest(url.toString(), options);
    })
        .tapCatch(function (err) {
        console.error(err);
    });
}
exports.manyRequest = manyRequest;
const self = require("./fetch");
exports.default = self;
//export default exports;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmV0Y2guanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJmZXRjaC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7O0dBRUc7O0FBRUgsMkNBQTJDO0FBQzNDLG9DQUFvQztBQWVwQyxTQUFnQixZQUFZLENBQUMsR0FBRyxFQUFFLFVBQW9CLEVBQUU7SUFFdkQsT0FBTyxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUM7UUFDdkIsS0FBSyxFQUFFLENBQUM7UUFDUixLQUFLLEVBQUUsSUFBSTtLQUNYLEVBQUUsT0FBTyxDQUFDLENBQUM7SUFFWixJQUFJLEtBQUssR0FBRyxPQUFPLENBQUMsS0FBSyxJQUFJLENBQUMsQ0FBQztJQUMvQixJQUFJLFVBQVUsR0FBRyxPQUFPLENBQUMsVUFBVSxJQUFJLE9BQU8sQ0FBQztJQUUvQyxJQUFJLEtBQUssR0FBRyxDQUFDLENBQUM7SUFFZCxJQUFJLEdBQUcsQ0FBQyxJQUFJLEVBQ1o7UUFDQyxHQUFHLEdBQUcsR0FBRyxDQUFDLElBQUksQ0FBQztLQUNmO0lBRUQsNEJBQTRCO0lBRTVCLFNBQVMsRUFBRTtRQUVWLEtBQUssRUFBRSxDQUFDO1FBRVIsYUFBYTtRQUNiLE9BQU8sVUFBVSxDQUFDLEdBQUcsQ0FBQyxRQUFRLEVBQUUsRUFBRSxPQUFPLENBQUM7YUFDeEMsS0FBSyxDQUFDLFVBQVUsR0FBRztZQUVuQixJQUFJLEtBQUssRUFBRSxHQUFHLENBQUMsRUFDZjtnQkFDQyxPQUFPLENBQUMsSUFBSSxDQUFDLGNBQWMsS0FBSyxnQkFBZ0IsT0FBTyxDQUFDLEtBQUssc0JBQXNCLEdBQUcsRUFBRSxDQUFDLENBQUM7Z0JBRTFGLE9BQU8sT0FBTyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO2FBQzdDO1lBRUQsR0FBRyxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7WUFFbEIsT0FBTyxPQUFPLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQzVCLENBQUMsQ0FBQyxDQUNEO0lBQ0gsQ0FBQztJQUVELE9BQU8sT0FBTyxDQUFDLE9BQU8sRUFBRSxDQUFDLElBQUksQ0FBQztRQUU3QixPQUFPLEVBQUUsRUFBRSxDQUFDO0lBQ2IsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLFVBQVUsR0FBRztRQUV4QixPQUFPLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQ3BCLENBQUMsQ0FBQyxDQUFDO0FBQ0osQ0FBQztBQWhERCxvQ0FnREM7QUFFRCxTQUFnQixXQUFXLENBQUMsT0FBYyxFQUFFLFVBQW9CLEVBQUU7SUFFakUsT0FBTyxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUM7UUFDdkIsS0FBSyxFQUFFLENBQUM7UUFDUixLQUFLLEVBQUUsSUFBSTtLQUNYLEVBQUUsT0FBTyxDQUFDLENBQUM7SUFFWixJQUFJLFVBQVUsR0FBRyxPQUFPLENBQUMsVUFBVSxJQUFJLE9BQU8sQ0FBQztJQUUvQyxPQUFPLE9BQU87U0FDWixTQUFTLENBQUMsT0FBTyxFQUFFLFVBQVUsR0FBRztRQUVoQyxJQUFJLEdBQUcsQ0FBQyxJQUFJLEVBQ1o7WUFDQyxHQUFHLEdBQUcsR0FBRyxDQUFDLElBQUksQ0FBQztTQUNmO1FBRUQsYUFBYTtRQUNiLE9BQU8sVUFBVSxDQUFDLEdBQUcsQ0FBQyxRQUFRLEVBQUUsRUFBRSxPQUFPLENBQUMsQ0FBQztJQUM1QyxDQUFDLENBQUM7U0FDRCxRQUFRLENBQUMsVUFBVSxHQUFHO1FBRXRCLE9BQU8sQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDcEIsQ0FBQyxDQUFDLENBQ0Q7QUFDSCxDQUFDO0FBekJELGtDQXlCQztBQUVELGdDQUFnQztBQUVoQyxrQkFBZSxJQUFJLENBQUM7QUFDcEIseUJBQXlCIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDcmVhdGVkIGJ5IHVzZXIgb24gMjAxOC8yLzkvMDA5LlxuICovXG5cbmltcG9ydCAqIGFzIHJlcXVlc3QgZnJvbSAncmVxdWVzdC1wcm9taXNlJztcbmltcG9ydCAqIGFzIFByb21pc2UgZnJvbSAnYmx1ZWJpcmQnO1xuXG4vL2ltcG9ydCBmZXRjaCBmcm9tICdsZXRzLWZldGNoJztcbi8vZmV0Y2gucmV0cnkoKHRyaWVzKSA9PiB0cmllcyA8PSAzKTtcblxuZXhwb3J0IGludGVyZmFjZSBJT3B0aW9ucyBleHRlbmRzIHJlcXVlc3QuUmVxdWVzdFByb21pc2VPcHRpb25zXG57XG5cdHJldHJ5PzogbnVtYmVyLFxuXHRkZWxheT86IG51bWJlcixcblxuXHRqYXI/LFxuXG5cdGxpYlJlcXVlc3Q/OiAodXJsOiBzdHJpbmcsIG9wdGlvbnM/OiBJT3B0aW9ucykgPT4gcmVxdWVzdC5SZXF1ZXN0UHJvbWlzZSxcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJldHJ5UmVxdWVzdCh1cmwsIG9wdGlvbnM6IElPcHRpb25zID0ge30pXG57XG5cdG9wdGlvbnMgPSBPYmplY3QuYXNzaWduKHtcblx0XHRyZXRyeTogMyxcblx0XHRkZWxheTogMTAwMCxcblx0fSwgb3B0aW9ucyk7XG5cblx0bGV0IHJldHJ5ID0gb3B0aW9ucy5yZXRyeSB8fCAzO1xuXHRsZXQgbGliUmVxdWVzdCA9IG9wdGlvbnMubGliUmVxdWVzdCB8fCByZXF1ZXN0O1xuXG5cdGxldCB0cmllcyA9IDA7XG5cblx0aWYgKHVybC5ocmVmKVxuXHR7XG5cdFx0dXJsID0gdXJsLmhyZWY7XG5cdH1cblxuXHQvL2NvbnNvbGUubG9nKHVybCwgb3B0aW9ucyk7XG5cblx0ZnVuY3Rpb24gZm4oKVxuXHR7XG5cdFx0dHJpZXMrKztcblxuXHRcdC8vIEB0cy1pZ25vcmVcblx0XHRyZXR1cm4gbGliUmVxdWVzdCh1cmwudG9TdHJpbmcoKSwgb3B0aW9ucylcblx0XHRcdC5jYXRjaChmdW5jdGlvbiAoZXJyKVxuXHRcdFx0e1xuXHRcdFx0XHRpZiAocmV0cnktLSA+IDApXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRjb25zb2xlLndhcm4oYGZldGNoIGZhaWwoJHt0cmllc30pLCB3aWxsIHdhaXQgJHtvcHRpb25zLmRlbGF5fW1zLCBmb3IgdHJ5IGFnYWluXFxuJHt1cmx9YCk7XG5cblx0XHRcdFx0XHRyZXR1cm4gUHJvbWlzZS5kZWxheShvcHRpb25zLmRlbGF5KS50aGVuKGZuKTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGVyci50cmllcyA9IHRyaWVzO1xuXG5cdFx0XHRcdHJldHVybiBQcm9taXNlLnJlamVjdChlcnIpO1xuXHRcdFx0fSlcblx0XHRcdDtcblx0fVxuXG5cdHJldHVybiBQcm9taXNlLnJlc29sdmUoKS50aGVuKGZ1bmN0aW9uICgpXG5cdHtcblx0XHRyZXR1cm4gZm4oKTtcblx0fSkudGFwQ2F0Y2goZnVuY3Rpb24gKGVycilcblx0e1xuXHRcdGNvbnNvbGUuZXJyb3IoZXJyKTtcblx0fSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBtYW55UmVxdWVzdCh1cmxfYXJyOiBhbnlbXSwgb3B0aW9uczogSU9wdGlvbnMgPSB7fSlcbntcblx0b3B0aW9ucyA9IE9iamVjdC5hc3NpZ24oe1xuXHRcdHJldHJ5OiAzLFxuXHRcdGRlbGF5OiAxMDAwLFxuXHR9LCBvcHRpb25zKTtcblxuXHRsZXQgbGliUmVxdWVzdCA9IG9wdGlvbnMubGliUmVxdWVzdCB8fCByZXF1ZXN0O1xuXG5cdHJldHVybiBQcm9taXNlXG5cdFx0Lm1hcFNlcmllcyh1cmxfYXJyLCBmdW5jdGlvbiAodXJsKVxuXHRcdHtcblx0XHRcdGlmICh1cmwuaHJlZilcblx0XHRcdHtcblx0XHRcdFx0dXJsID0gdXJsLmhyZWY7XG5cdFx0XHR9XG5cblx0XHRcdC8vIEB0cy1pZ25vcmVcblx0XHRcdHJldHVybiBsaWJSZXF1ZXN0KHVybC50b1N0cmluZygpLCBvcHRpb25zKTtcblx0XHR9KVxuXHRcdC50YXBDYXRjaChmdW5jdGlvbiAoZXJyKVxuXHRcdHtcblx0XHRcdGNvbnNvbGUuZXJyb3IoZXJyKTtcblx0XHR9KVxuXHRcdDtcbn1cblxuaW1wb3J0ICogYXMgc2VsZiBmcm9tICcuL2ZldGNoJztcblxuZXhwb3J0IGRlZmF1bHQgc2VsZjtcbi8vZXhwb3J0IGRlZmF1bHQgZXhwb3J0cztcbiJdfQ==