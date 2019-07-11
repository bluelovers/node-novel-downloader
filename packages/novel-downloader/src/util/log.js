"use strict";
/**
 * Created by user on 2019/2/3/003.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const debug_color2_1 = require("debug-color2");
exports.console = new debug_color2_1.Console(null, {
    inspectOptions: {
        colors: true,
    },
});
exports.console.enabledColor = true;
exports.consoleDebug = new debug_color2_1.Console(null, {
    inspectOptions: {
        colors: true,
    },
    time: true,
});
exports.consoleDebug.enabledColor = true;
exports.consoleDebug.enabled = false;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9nLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsibG9nLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7R0FFRzs7QUFFSCwrQ0FBdUM7QUFFMUIsUUFBQSxPQUFPLEdBQUcsSUFBSSxzQkFBTyxDQUFDLElBQUksRUFBRTtJQUN4QyxjQUFjLEVBQUU7UUFDZixNQUFNLEVBQUUsSUFBSTtLQUNaO0NBQ0QsQ0FBQyxDQUFDO0FBRUgsZUFBTyxDQUFDLFlBQVksR0FBRyxJQUFJLENBQUM7QUFFZixRQUFBLFlBQVksR0FBRyxJQUFJLHNCQUFPLENBQUMsSUFBSSxFQUFFO0lBQzdDLGNBQWMsRUFBRTtRQUNmLE1BQU0sRUFBRSxJQUFJO0tBQ1o7SUFDRCxJQUFJLEVBQUUsSUFBSTtDQUNWLENBQUMsQ0FBQztBQUVILG9CQUFZLENBQUMsWUFBWSxHQUFHLElBQUksQ0FBQztBQUVqQyxvQkFBWSxDQUFDLE9BQU8sR0FBRyxLQUFLLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENyZWF0ZWQgYnkgdXNlciBvbiAyMDE5LzIvMy8wMDMuXG4gKi9cblxuaW1wb3J0IHsgQ29uc29sZSB9IGZyb20gJ2RlYnVnLWNvbG9yMic7XG5cbmV4cG9ydCBjb25zdCBjb25zb2xlID0gbmV3IENvbnNvbGUobnVsbCwge1xuXHRpbnNwZWN0T3B0aW9uczoge1xuXHRcdGNvbG9yczogdHJ1ZSxcblx0fSxcbn0pO1xuXG5jb25zb2xlLmVuYWJsZWRDb2xvciA9IHRydWU7XG5cbmV4cG9ydCBjb25zdCBjb25zb2xlRGVidWcgPSBuZXcgQ29uc29sZShudWxsLCB7XG5cdGluc3BlY3RPcHRpb25zOiB7XG5cdFx0Y29sb3JzOiB0cnVlLFxuXHR9LFxuXHR0aW1lOiB0cnVlLFxufSk7XG5cbmNvbnNvbGVEZWJ1Zy5lbmFibGVkQ29sb3IgPSB0cnVlO1xuXG5jb25zb2xlRGVidWcuZW5hYmxlZCA9IGZhbHNlO1xuIl19