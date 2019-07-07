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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmV0Y2guanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJmZXRjaC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7O0dBRUc7O0FBRUgsMkNBQTRDO0FBQzVDLG9DQUFxQztBQUNyQyxvQ0FBcUM7QUFnQnJDLFNBQWdCLFlBQVksQ0FBQyxHQUFHLEVBQUUsVUFBb0IsRUFBRTtJQUV2RCxPQUFPLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQztRQUN2QixLQUFLLEVBQUUsQ0FBQztRQUNSLEtBQUssRUFBRSxJQUFJO0tBQ1gsRUFBRSxPQUFPLENBQUMsQ0FBQztJQUVaLElBQUksS0FBSyxHQUFHLE9BQU8sQ0FBQyxLQUFLLElBQUksQ0FBQyxDQUFDO0lBQy9CLElBQUksVUFBVSxHQUFHLE9BQU8sQ0FBQyxVQUFVLElBQUksT0FBTyxDQUFDO0lBRS9DLElBQUksS0FBSyxHQUFHLENBQUMsQ0FBQztJQUVkLElBQUksR0FBRyxDQUFDLElBQUksRUFDWjtRQUNDLEdBQUcsR0FBRyxHQUFHLENBQUMsSUFBSSxDQUFDO0tBQ2Y7SUFFRCxTQUFTLEVBQUU7UUFFVixLQUFLLEVBQUUsQ0FBQztRQUVSLGFBQWE7UUFDYixPQUFPLFVBQVUsQ0FBQyxHQUFHLENBQUMsUUFBUSxFQUFFLEVBQUUsT0FBTyxDQUFDO2FBQ3hDLEtBQUssQ0FBQyxVQUFVLEdBQUc7WUFFbkIsSUFBSSxLQUFLLEVBQUUsR0FBRyxDQUFDLEVBQ2Y7Z0JBQ0MsYUFBTyxDQUFDLElBQUksQ0FBQyxjQUFjLEtBQUssZ0JBQWdCLE9BQU8sQ0FBQyxLQUFLLHNCQUFzQixHQUFHLEVBQUUsQ0FBQyxDQUFDO2dCQUUxRixPQUFPLE9BQU8sQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQzthQUM3QztZQUVELEdBQUcsQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDO1lBRWxCLE9BQU8sT0FBTyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUM1QixDQUFDLENBQUMsQ0FDRDtJQUNILENBQUM7SUFFRCxPQUFPLE9BQU8sQ0FBQyxPQUFPLEVBQUUsQ0FBQyxJQUFJLENBQUM7UUFFN0IsT0FBTyxFQUFFLEVBQUUsQ0FBQztJQUNiLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxVQUFVLEdBQUc7UUFFeEIsYUFBTyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUNwQixDQUFDLENBQUMsQ0FBQztBQUNKLENBQUM7QUE5Q0Qsb0NBOENDO0FBRUQsU0FBZ0IsV0FBVyxDQUFDLE9BQWMsRUFBRSxVQUFvQixFQUFFO0lBRWpFLE9BQU8sR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDO1FBQ3ZCLEtBQUssRUFBRSxDQUFDO1FBQ1IsS0FBSyxFQUFFLElBQUk7S0FDWCxFQUFFLE9BQU8sQ0FBQyxDQUFDO0lBRVosSUFBSSxVQUFVLEdBQUcsT0FBTyxDQUFDLFVBQVUsSUFBSSxPQUFPLENBQUM7SUFFL0MsT0FBTyxPQUFPO1NBQ1osU0FBUyxDQUFDLE9BQU8sRUFBRSxVQUFVLEdBQUc7UUFFaEMsSUFBSSxHQUFHLENBQUMsSUFBSSxFQUNaO1lBQ0MsR0FBRyxHQUFHLEdBQUcsQ0FBQyxJQUFJLENBQUM7U0FDZjtRQUVELGFBQWE7UUFDYixPQUFPLFVBQVUsQ0FBQyxHQUFHLENBQUMsUUFBUSxFQUFFLEVBQUUsT0FBTyxDQUFDLENBQUM7SUFDNUMsQ0FBQyxDQUFDO1NBQ0QsUUFBUSxDQUFDLFVBQVUsR0FBRztRQUV0QixhQUFPLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQ3BCLENBQUMsQ0FBQyxDQUNEO0FBQ0gsQ0FBQztBQXpCRCxrQ0F5QkM7QUFFRCxrQkFBZSxPQUFtQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDcmVhdGVkIGJ5IHVzZXIgb24gMjAxOC8yLzkvMDA5LlxuICovXG5cbmltcG9ydCByZXF1ZXN0ID0gcmVxdWlyZSgncmVxdWVzdC1wcm9taXNlJyk7XG5pbXBvcnQgUHJvbWlzZSA9IHJlcXVpcmUoJ2JsdWViaXJkJyk7XG5pbXBvcnQgeyBjb25zb2xlIH0gZnJvbSAnLi91dGlsL2xvZyc7XG5pbXBvcnQgeyBJUmVxdWVzdFByb21pc2UgfSBmcm9tICcuL3V0aWwvcmVxdWVzdC9jcmVhdGUnO1xuXG4vL2ltcG9ydCBmZXRjaCBmcm9tICdsZXRzLWZldGNoJztcbi8vZmV0Y2gucmV0cnkoKHRyaWVzKSA9PiB0cmllcyA8PSAzKTtcblxuZXhwb3J0IGludGVyZmFjZSBJT3B0aW9ucyBleHRlbmRzIHJlcXVlc3QuUmVxdWVzdFByb21pc2VPcHRpb25zXG57XG5cdHJldHJ5PzogbnVtYmVyLFxuXHRkZWxheT86IG51bWJlcixcblxuXHRqYXI/LFxuXG5cdGxpYlJlcXVlc3Q/OiAoKHVybDogc3RyaW5nLCBvcHRpb25zPzogSU9wdGlvbnMpID0+IHJlcXVlc3QuUmVxdWVzdFByb21pc2UpIHwgSVJlcXVlc3RQcm9taXNlLFxufVxuXG5leHBvcnQgZnVuY3Rpb24gcmV0cnlSZXF1ZXN0KHVybCwgb3B0aW9uczogSU9wdGlvbnMgPSB7fSlcbntcblx0b3B0aW9ucyA9IE9iamVjdC5hc3NpZ24oe1xuXHRcdHJldHJ5OiAzLFxuXHRcdGRlbGF5OiAxMDAwLFxuXHR9LCBvcHRpb25zKTtcblxuXHRsZXQgcmV0cnkgPSBvcHRpb25zLnJldHJ5IHx8IDM7XG5cdGxldCBsaWJSZXF1ZXN0ID0gb3B0aW9ucy5saWJSZXF1ZXN0IHx8IHJlcXVlc3Q7XG5cblx0bGV0IHRyaWVzID0gMDtcblxuXHRpZiAodXJsLmhyZWYpXG5cdHtcblx0XHR1cmwgPSB1cmwuaHJlZjtcblx0fVxuXG5cdGZ1bmN0aW9uIGZuKClcblx0e1xuXHRcdHRyaWVzKys7XG5cblx0XHQvLyBAdHMtaWdub3JlXG5cdFx0cmV0dXJuIGxpYlJlcXVlc3QodXJsLnRvU3RyaW5nKCksIG9wdGlvbnMpXG5cdFx0XHQuY2F0Y2goZnVuY3Rpb24gKGVycilcblx0XHRcdHtcblx0XHRcdFx0aWYgKHJldHJ5LS0gPiAwKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0Y29uc29sZS53YXJuKGBmZXRjaCBmYWlsKCR7dHJpZXN9KSwgd2lsbCB3YWl0ICR7b3B0aW9ucy5kZWxheX1tcywgZm9yIHRyeSBhZ2FpblxcbiR7dXJsfWApO1xuXG5cdFx0XHRcdFx0cmV0dXJuIFByb21pc2UuZGVsYXkob3B0aW9ucy5kZWxheSkudGhlbihmbik7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRlcnIudHJpZXMgPSB0cmllcztcblxuXHRcdFx0XHRyZXR1cm4gUHJvbWlzZS5yZWplY3QoZXJyKTtcblx0XHRcdH0pXG5cdFx0XHQ7XG5cdH1cblxuXHRyZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCkudGhlbihmdW5jdGlvbiAoKVxuXHR7XG5cdFx0cmV0dXJuIGZuKCk7XG5cdH0pLnRhcENhdGNoKGZ1bmN0aW9uIChlcnIpXG5cdHtcblx0XHRjb25zb2xlLmVycm9yKGVycik7XG5cdH0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbWFueVJlcXVlc3QodXJsX2FycjogYW55W10sIG9wdGlvbnM6IElPcHRpb25zID0ge30pXG57XG5cdG9wdGlvbnMgPSBPYmplY3QuYXNzaWduKHtcblx0XHRyZXRyeTogMyxcblx0XHRkZWxheTogMTAwMCxcblx0fSwgb3B0aW9ucyk7XG5cblx0bGV0IGxpYlJlcXVlc3QgPSBvcHRpb25zLmxpYlJlcXVlc3QgfHwgcmVxdWVzdDtcblxuXHRyZXR1cm4gUHJvbWlzZVxuXHRcdC5tYXBTZXJpZXModXJsX2FyciwgZnVuY3Rpb24gKHVybClcblx0XHR7XG5cdFx0XHRpZiAodXJsLmhyZWYpXG5cdFx0XHR7XG5cdFx0XHRcdHVybCA9IHVybC5ocmVmO1xuXHRcdFx0fVxuXG5cdFx0XHQvLyBAdHMtaWdub3JlXG5cdFx0XHRyZXR1cm4gbGliUmVxdWVzdCh1cmwudG9TdHJpbmcoKSwgb3B0aW9ucyk7XG5cdFx0fSlcblx0XHQudGFwQ2F0Y2goZnVuY3Rpb24gKGVycilcblx0XHR7XG5cdFx0XHRjb25zb2xlLmVycm9yKGVycik7XG5cdFx0fSlcblx0XHQ7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGV4cG9ydHMgYXMgdHlwZW9mIGltcG9ydCgnLi9mZXRjaCcpO1xuXG4iXX0=