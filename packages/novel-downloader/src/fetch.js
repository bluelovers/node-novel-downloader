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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmV0Y2guanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJmZXRjaC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7O0dBRUc7O0FBRUgsMkNBQTRDO0FBQzVDLG9DQUFxQztBQUNyQyxvQ0FBcUM7QUFnQnJDLFNBQWdCLFlBQVksQ0FBQyxHQUFHLEVBQUUsVUFBb0IsRUFBRTtJQUV2RCxPQUFPLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQztRQUN2QixLQUFLLEVBQUUsQ0FBQztRQUNSLEtBQUssRUFBRSxJQUFJO0tBQ1gsRUFBRSxPQUFPLENBQUMsQ0FBQztJQUVaLElBQUksS0FBSyxHQUFHLE9BQU8sQ0FBQyxLQUFLLElBQUksQ0FBQyxDQUFDO0lBQy9CLElBQUksVUFBVSxHQUFHLE9BQU8sQ0FBQyxVQUFVLElBQUksT0FBTyxDQUFDO0lBRS9DLElBQUksS0FBSyxHQUFHLENBQUMsQ0FBQztJQUVkLElBQUksR0FBRyxDQUFDLElBQUksRUFDWjtRQUNDLEdBQUcsR0FBRyxHQUFHLENBQUMsSUFBSSxDQUFDO0tBQ2Y7SUFFRCxTQUFTLEVBQUU7UUFFVixLQUFLLEVBQUUsQ0FBQztRQUVSLGFBQWE7UUFDYixPQUFPLFVBQVUsQ0FBQyxHQUFHLENBQUMsUUFBUSxFQUFFLEVBQUUsT0FBTyxDQUFDO2FBQ3hDLEtBQUssQ0FBQyxVQUFVLEdBQUc7WUFFbkIsSUFBSSxLQUFLLEVBQUUsR0FBRyxDQUFDLEVBQ2Y7Z0JBQ0MsYUFBTyxDQUFDLElBQUksQ0FBQyxjQUFjLEtBQUssZ0JBQWdCLE9BQU8sQ0FBQyxLQUFLLHNCQUFzQixHQUFHLEVBQUUsQ0FBQyxDQUFDO2dCQUUxRixPQUFPLE9BQU8sQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQzthQUM3QztZQUVELEdBQUcsQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDO1lBRWxCLE9BQU8sT0FBTyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUM1QixDQUFDLENBQUMsQ0FDRDtJQUNILENBQUM7SUFFRCxPQUFPLE9BQU8sQ0FBQyxPQUFPLEVBQUUsQ0FBQyxJQUFJLENBQUM7UUFFN0IsT0FBTyxFQUFFLEVBQUUsQ0FBQztJQUNiLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxVQUFVLEdBQUc7UUFFeEIsYUFBTyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUNwQixDQUFDLENBQUMsQ0FBQztBQUNKLENBQUM7QUE5Q0Qsb0NBOENDO0FBRUQsU0FBZ0IsV0FBVyxDQUFDLE9BQWMsRUFBRSxVQUFvQixFQUFFO0lBRWpFLE9BQU8sR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDO1FBQ3ZCLEtBQUssRUFBRSxDQUFDO1FBQ1IsS0FBSyxFQUFFLElBQUk7S0FDWCxFQUFFLE9BQU8sQ0FBQyxDQUFDO0lBRVosSUFBSSxVQUFVLEdBQUcsT0FBTyxDQUFDLFVBQVUsSUFBSSxPQUFPLENBQUM7SUFFL0MsT0FBTyxPQUFPO1NBQ1osU0FBUyxDQUFDLE9BQU8sRUFBRSxVQUFVLEdBQUc7UUFFaEMsSUFBSSxHQUFHLENBQUMsSUFBSSxFQUNaO1lBQ0MsR0FBRyxHQUFHLEdBQUcsQ0FBQyxJQUFJLENBQUM7U0FDZjtRQUVELGFBQWE7UUFDYixPQUFPLFVBQVUsQ0FBQyxHQUFHLENBQUMsUUFBUSxFQUFFLEVBQUUsT0FBTyxDQUFDLENBQUM7SUFDNUMsQ0FBQyxDQUFDO1NBQ0QsUUFBUSxDQUFDLFVBQVUsR0FBRztRQUV0QixhQUFPLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQ3BCLENBQUMsQ0FBQyxDQUNEO0FBQ0gsQ0FBQztBQXpCRCxrQ0F5QkMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENyZWF0ZWQgYnkgdXNlciBvbiAyMDE4LzIvOS8wMDkuXG4gKi9cblxuaW1wb3J0IHJlcXVlc3QgPSByZXF1aXJlKCdyZXF1ZXN0LXByb21pc2UnKTtcbmltcG9ydCBQcm9taXNlID0gcmVxdWlyZSgnYmx1ZWJpcmQnKTtcbmltcG9ydCB7IGNvbnNvbGUgfSBmcm9tICcuL3V0aWwvbG9nJztcbmltcG9ydCB7IElSZXF1ZXN0UHJvbWlzZSB9IGZyb20gJy4vdXRpbC9yZXF1ZXN0L2NyZWF0ZSc7XG5cbi8vaW1wb3J0IGZldGNoIGZyb20gJ2xldHMtZmV0Y2gnO1xuLy9mZXRjaC5yZXRyeSgodHJpZXMpID0+IHRyaWVzIDw9IDMpO1xuXG5leHBvcnQgaW50ZXJmYWNlIElPcHRpb25zIGV4dGVuZHMgcmVxdWVzdC5SZXF1ZXN0UHJvbWlzZU9wdGlvbnNcbntcblx0cmV0cnk/OiBudW1iZXIsXG5cdGRlbGF5PzogbnVtYmVyLFxuXG5cdGphcj8sXG5cblx0bGliUmVxdWVzdD86ICgodXJsOiBzdHJpbmcsIG9wdGlvbnM/OiBJT3B0aW9ucykgPT4gcmVxdWVzdC5SZXF1ZXN0UHJvbWlzZSkgfCBJUmVxdWVzdFByb21pc2UsXG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZXRyeVJlcXVlc3QodXJsLCBvcHRpb25zOiBJT3B0aW9ucyA9IHt9KVxue1xuXHRvcHRpb25zID0gT2JqZWN0LmFzc2lnbih7XG5cdFx0cmV0cnk6IDMsXG5cdFx0ZGVsYXk6IDEwMDAsXG5cdH0sIG9wdGlvbnMpO1xuXG5cdGxldCByZXRyeSA9IG9wdGlvbnMucmV0cnkgfHwgMztcblx0bGV0IGxpYlJlcXVlc3QgPSBvcHRpb25zLmxpYlJlcXVlc3QgfHwgcmVxdWVzdDtcblxuXHRsZXQgdHJpZXMgPSAwO1xuXG5cdGlmICh1cmwuaHJlZilcblx0e1xuXHRcdHVybCA9IHVybC5ocmVmO1xuXHR9XG5cblx0ZnVuY3Rpb24gZm4oKVxuXHR7XG5cdFx0dHJpZXMrKztcblxuXHRcdC8vIEB0cy1pZ25vcmVcblx0XHRyZXR1cm4gbGliUmVxdWVzdCh1cmwudG9TdHJpbmcoKSwgb3B0aW9ucylcblx0XHRcdC5jYXRjaChmdW5jdGlvbiAoZXJyKVxuXHRcdFx0e1xuXHRcdFx0XHRpZiAocmV0cnktLSA+IDApXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRjb25zb2xlLndhcm4oYGZldGNoIGZhaWwoJHt0cmllc30pLCB3aWxsIHdhaXQgJHtvcHRpb25zLmRlbGF5fW1zLCBmb3IgdHJ5IGFnYWluXFxuJHt1cmx9YCk7XG5cblx0XHRcdFx0XHRyZXR1cm4gUHJvbWlzZS5kZWxheShvcHRpb25zLmRlbGF5KS50aGVuKGZuKTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGVyci50cmllcyA9IHRyaWVzO1xuXG5cdFx0XHRcdHJldHVybiBQcm9taXNlLnJlamVjdChlcnIpO1xuXHRcdFx0fSlcblx0XHRcdDtcblx0fVxuXG5cdHJldHVybiBQcm9taXNlLnJlc29sdmUoKS50aGVuKGZ1bmN0aW9uICgpXG5cdHtcblx0XHRyZXR1cm4gZm4oKTtcblx0fSkudGFwQ2F0Y2goZnVuY3Rpb24gKGVycilcblx0e1xuXHRcdGNvbnNvbGUuZXJyb3IoZXJyKTtcblx0fSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBtYW55UmVxdWVzdCh1cmxfYXJyOiBhbnlbXSwgb3B0aW9uczogSU9wdGlvbnMgPSB7fSlcbntcblx0b3B0aW9ucyA9IE9iamVjdC5hc3NpZ24oe1xuXHRcdHJldHJ5OiAzLFxuXHRcdGRlbGF5OiAxMDAwLFxuXHR9LCBvcHRpb25zKTtcblxuXHRsZXQgbGliUmVxdWVzdCA9IG9wdGlvbnMubGliUmVxdWVzdCB8fCByZXF1ZXN0O1xuXG5cdHJldHVybiBQcm9taXNlXG5cdFx0Lm1hcFNlcmllcyh1cmxfYXJyLCBmdW5jdGlvbiAodXJsKVxuXHRcdHtcblx0XHRcdGlmICh1cmwuaHJlZilcblx0XHRcdHtcblx0XHRcdFx0dXJsID0gdXJsLmhyZWY7XG5cdFx0XHR9XG5cblx0XHRcdC8vIEB0cy1pZ25vcmVcblx0XHRcdHJldHVybiBsaWJSZXF1ZXN0KHVybC50b1N0cmluZygpLCBvcHRpb25zKTtcblx0XHR9KVxuXHRcdC50YXBDYXRjaChmdW5jdGlvbiAoZXJyKVxuXHRcdHtcblx0XHRcdGNvbnNvbGUuZXJyb3IoZXJyKTtcblx0XHR9KVxuXHRcdDtcbn1cbiJdfQ==