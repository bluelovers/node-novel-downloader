"use strict";
/**
 * Created by user on 2018/2/9/009.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const request = require("request-promise");
const Promise = require("bluebird");
const log_1 = require("./util/log");
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
    function fn() {
        tries++;
        // @ts-ignore
        return libRequest(url.toString(), options)
            .catch(function (err) {
            if (retry-- > 0) {
                log_1.console.warn(`fetch fail(${tries}), will wait ${options.delay}ms, for try again\n${url}`);
                return Promise.delay(options.delay).then(fn);
            }
            err.tries = tries;
            return Promise.reject(err);
        });
    }
    return Promise.resolve().then(function () {
        return fn();
    }).tapCatch(function (err) {
        log_1.console.error(err);
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
        log_1.console.error(err);
    });
}
exports.manyRequest = manyRequest;
exports.default = exports;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmV0Y2guanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJmZXRjaC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7O0dBRUc7O0FBRUgsMkNBQTRDO0FBQzVDLG9DQUFxQztBQUNyQyxvQ0FBcUM7QUFlckMsU0FBZ0IsWUFBWSxDQUFDLEdBQUcsRUFBRSxVQUFvQixFQUFFO0lBRXZELE9BQU8sR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDO1FBQ3ZCLEtBQUssRUFBRSxDQUFDO1FBQ1IsS0FBSyxFQUFFLElBQUk7S0FDWCxFQUFFLE9BQU8sQ0FBQyxDQUFDO0lBRVosSUFBSSxLQUFLLEdBQUcsT0FBTyxDQUFDLEtBQUssSUFBSSxDQUFDLENBQUM7SUFDL0IsSUFBSSxVQUFVLEdBQUcsT0FBTyxDQUFDLFVBQVUsSUFBSSxPQUFPLENBQUM7SUFFL0MsSUFBSSxLQUFLLEdBQUcsQ0FBQyxDQUFDO0lBRWQsSUFBSSxHQUFHLENBQUMsSUFBSSxFQUNaO1FBQ0MsR0FBRyxHQUFHLEdBQUcsQ0FBQyxJQUFJLENBQUM7S0FDZjtJQUVELFNBQVMsRUFBRTtRQUVWLEtBQUssRUFBRSxDQUFDO1FBRVIsYUFBYTtRQUNiLE9BQU8sVUFBVSxDQUFDLEdBQUcsQ0FBQyxRQUFRLEVBQUUsRUFBRSxPQUFPLENBQUM7YUFDeEMsS0FBSyxDQUFDLFVBQVUsR0FBRztZQUVuQixJQUFJLEtBQUssRUFBRSxHQUFHLENBQUMsRUFDZjtnQkFDQyxhQUFPLENBQUMsSUFBSSxDQUFDLGNBQWMsS0FBSyxnQkFBZ0IsT0FBTyxDQUFDLEtBQUssc0JBQXNCLEdBQUcsRUFBRSxDQUFDLENBQUM7Z0JBRTFGLE9BQU8sT0FBTyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO2FBQzdDO1lBRUQsR0FBRyxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7WUFFbEIsT0FBTyxPQUFPLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQzVCLENBQUMsQ0FBQyxDQUNEO0lBQ0gsQ0FBQztJQUVELE9BQU8sT0FBTyxDQUFDLE9BQU8sRUFBRSxDQUFDLElBQUksQ0FBQztRQUU3QixPQUFPLEVBQUUsRUFBRSxDQUFDO0lBQ2IsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLFVBQVUsR0FBRztRQUV4QixhQUFPLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQ3BCLENBQUMsQ0FBQyxDQUFDO0FBQ0osQ0FBQztBQTlDRCxvQ0E4Q0M7QUFFRCxTQUFnQixXQUFXLENBQUMsT0FBYyxFQUFFLFVBQW9CLEVBQUU7SUFFakUsT0FBTyxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUM7UUFDdkIsS0FBSyxFQUFFLENBQUM7UUFDUixLQUFLLEVBQUUsSUFBSTtLQUNYLEVBQUUsT0FBTyxDQUFDLENBQUM7SUFFWixJQUFJLFVBQVUsR0FBRyxPQUFPLENBQUMsVUFBVSxJQUFJLE9BQU8sQ0FBQztJQUUvQyxPQUFPLE9BQU87U0FDWixTQUFTLENBQUMsT0FBTyxFQUFFLFVBQVUsR0FBRztRQUVoQyxJQUFJLEdBQUcsQ0FBQyxJQUFJLEVBQ1o7WUFDQyxHQUFHLEdBQUcsR0FBRyxDQUFDLElBQUksQ0FBQztTQUNmO1FBRUQsYUFBYTtRQUNiLE9BQU8sVUFBVSxDQUFDLEdBQUcsQ0FBQyxRQUFRLEVBQUUsRUFBRSxPQUFPLENBQUMsQ0FBQztJQUM1QyxDQUFDLENBQUM7U0FDRCxRQUFRLENBQUMsVUFBVSxHQUFHO1FBRXRCLGFBQU8sQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDcEIsQ0FBQyxDQUFDLENBQ0Q7QUFDSCxDQUFDO0FBekJELGtDQXlCQztBQUVELGtCQUFlLE9BQW1DLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENyZWF0ZWQgYnkgdXNlciBvbiAyMDE4LzIvOS8wMDkuXG4gKi9cblxuaW1wb3J0IHJlcXVlc3QgPSByZXF1aXJlKCdyZXF1ZXN0LXByb21pc2UnKTtcbmltcG9ydCBQcm9taXNlID0gcmVxdWlyZSgnYmx1ZWJpcmQnKTtcbmltcG9ydCB7IGNvbnNvbGUgfSBmcm9tICcuL3V0aWwvbG9nJztcblxuLy9pbXBvcnQgZmV0Y2ggZnJvbSAnbGV0cy1mZXRjaCc7XG4vL2ZldGNoLnJldHJ5KCh0cmllcykgPT4gdHJpZXMgPD0gMyk7XG5cbmV4cG9ydCBpbnRlcmZhY2UgSU9wdGlvbnMgZXh0ZW5kcyByZXF1ZXN0LlJlcXVlc3RQcm9taXNlT3B0aW9uc1xue1xuXHRyZXRyeT86IG51bWJlcixcblx0ZGVsYXk/OiBudW1iZXIsXG5cblx0amFyPyxcblxuXHRsaWJSZXF1ZXN0PzogKHVybDogc3RyaW5nLCBvcHRpb25zPzogSU9wdGlvbnMpID0+IHJlcXVlc3QuUmVxdWVzdFByb21pc2UsXG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZXRyeVJlcXVlc3QodXJsLCBvcHRpb25zOiBJT3B0aW9ucyA9IHt9KVxue1xuXHRvcHRpb25zID0gT2JqZWN0LmFzc2lnbih7XG5cdFx0cmV0cnk6IDMsXG5cdFx0ZGVsYXk6IDEwMDAsXG5cdH0sIG9wdGlvbnMpO1xuXG5cdGxldCByZXRyeSA9IG9wdGlvbnMucmV0cnkgfHwgMztcblx0bGV0IGxpYlJlcXVlc3QgPSBvcHRpb25zLmxpYlJlcXVlc3QgfHwgcmVxdWVzdDtcblxuXHRsZXQgdHJpZXMgPSAwO1xuXG5cdGlmICh1cmwuaHJlZilcblx0e1xuXHRcdHVybCA9IHVybC5ocmVmO1xuXHR9XG5cblx0ZnVuY3Rpb24gZm4oKVxuXHR7XG5cdFx0dHJpZXMrKztcblxuXHRcdC8vIEB0cy1pZ25vcmVcblx0XHRyZXR1cm4gbGliUmVxdWVzdCh1cmwudG9TdHJpbmcoKSwgb3B0aW9ucylcblx0XHRcdC5jYXRjaChmdW5jdGlvbiAoZXJyKVxuXHRcdFx0e1xuXHRcdFx0XHRpZiAocmV0cnktLSA+IDApXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRjb25zb2xlLndhcm4oYGZldGNoIGZhaWwoJHt0cmllc30pLCB3aWxsIHdhaXQgJHtvcHRpb25zLmRlbGF5fW1zLCBmb3IgdHJ5IGFnYWluXFxuJHt1cmx9YCk7XG5cblx0XHRcdFx0XHRyZXR1cm4gUHJvbWlzZS5kZWxheShvcHRpb25zLmRlbGF5KS50aGVuKGZuKTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGVyci50cmllcyA9IHRyaWVzO1xuXG5cdFx0XHRcdHJldHVybiBQcm9taXNlLnJlamVjdChlcnIpO1xuXHRcdFx0fSlcblx0XHRcdDtcblx0fVxuXG5cdHJldHVybiBQcm9taXNlLnJlc29sdmUoKS50aGVuKGZ1bmN0aW9uICgpXG5cdHtcblx0XHRyZXR1cm4gZm4oKTtcblx0fSkudGFwQ2F0Y2goZnVuY3Rpb24gKGVycilcblx0e1xuXHRcdGNvbnNvbGUuZXJyb3IoZXJyKTtcblx0fSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBtYW55UmVxdWVzdCh1cmxfYXJyOiBhbnlbXSwgb3B0aW9uczogSU9wdGlvbnMgPSB7fSlcbntcblx0b3B0aW9ucyA9IE9iamVjdC5hc3NpZ24oe1xuXHRcdHJldHJ5OiAzLFxuXHRcdGRlbGF5OiAxMDAwLFxuXHR9LCBvcHRpb25zKTtcblxuXHRsZXQgbGliUmVxdWVzdCA9IG9wdGlvbnMubGliUmVxdWVzdCB8fCByZXF1ZXN0O1xuXG5cdHJldHVybiBQcm9taXNlXG5cdFx0Lm1hcFNlcmllcyh1cmxfYXJyLCBmdW5jdGlvbiAodXJsKVxuXHRcdHtcblx0XHRcdGlmICh1cmwuaHJlZilcblx0XHRcdHtcblx0XHRcdFx0dXJsID0gdXJsLmhyZWY7XG5cdFx0XHR9XG5cblx0XHRcdC8vIEB0cy1pZ25vcmVcblx0XHRcdHJldHVybiBsaWJSZXF1ZXN0KHVybC50b1N0cmluZygpLCBvcHRpb25zKTtcblx0XHR9KVxuXHRcdC50YXBDYXRjaChmdW5jdGlvbiAoZXJyKVxuXHRcdHtcblx0XHRcdGNvbnNvbGUuZXJyb3IoZXJyKTtcblx0XHR9KVxuXHRcdDtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZXhwb3J0cyBhcyB0eXBlb2YgaW1wb3J0KCcuL2ZldGNoJyk7XG5cbiJdfQ==