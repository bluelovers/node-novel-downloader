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
    label: true,
});
exports.consoleDebug.enabledColor = true;
exports.consoleDebug.enabled = false;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9nLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsibG9nLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7R0FFRzs7QUFFSCwrQ0FBdUM7QUFFMUIsUUFBQSxPQUFPLEdBQUcsSUFBSSxzQkFBTyxDQUFDLElBQUksRUFBRTtJQUN4QyxjQUFjLEVBQUU7UUFDZixNQUFNLEVBQUUsSUFBSTtLQUNaO0NBQ0QsQ0FBQyxDQUFDO0FBRUgsZUFBTyxDQUFDLFlBQVksR0FBRyxJQUFJLENBQUM7QUFFZixRQUFBLFlBQVksR0FBRyxJQUFJLHNCQUFPLENBQUMsSUFBSSxFQUFFO0lBQzdDLGNBQWMsRUFBRTtRQUNmLE1BQU0sRUFBRSxJQUFJO0tBQ1o7SUFDRCxJQUFJLEVBQUUsSUFBSTtJQUNWLEtBQUssRUFBRSxJQUFJO0NBQ1gsQ0FBQyxDQUFDO0FBRUgsb0JBQVksQ0FBQyxZQUFZLEdBQUcsSUFBSSxDQUFDO0FBRWpDLG9CQUFZLENBQUMsT0FBTyxHQUFHLEtBQUssQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ3JlYXRlZCBieSB1c2VyIG9uIDIwMTkvMi8zLzAwMy5cbiAqL1xuXG5pbXBvcnQgeyBDb25zb2xlIH0gZnJvbSAnZGVidWctY29sb3IyJztcblxuZXhwb3J0IGNvbnN0IGNvbnNvbGUgPSBuZXcgQ29uc29sZShudWxsLCB7XG5cdGluc3BlY3RPcHRpb25zOiB7XG5cdFx0Y29sb3JzOiB0cnVlLFxuXHR9LFxufSk7XG5cbmNvbnNvbGUuZW5hYmxlZENvbG9yID0gdHJ1ZTtcblxuZXhwb3J0IGNvbnN0IGNvbnNvbGVEZWJ1ZyA9IG5ldyBDb25zb2xlKG51bGwsIHtcblx0aW5zcGVjdE9wdGlvbnM6IHtcblx0XHRjb2xvcnM6IHRydWUsXG5cdH0sXG5cdHRpbWU6IHRydWUsXG5cdGxhYmVsOiB0cnVlLFxufSk7XG5cbmNvbnNvbGVEZWJ1Zy5lbmFibGVkQ29sb3IgPSB0cnVlO1xuXG5jb25zb2xlRGVidWcuZW5hYmxlZCA9IGZhbHNlO1xuIl19