"use strict";
/**
 * Created by user on 2019/2/3/003.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.chalkByConsole = exports.consoleDebug = exports.console = void 0;
const debug_color2_1 = require("debug-color2");
Object.defineProperty(exports, "chalkByConsole", { enumerable: true, get: function () { return debug_color2_1.chalkByConsole; } });
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9nLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsibG9nLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7R0FFRzs7O0FBRUgsK0NBQXVEO0FBc0I5QywrRkF0QlMsNkJBQWMsT0FzQlQ7QUFwQlYsUUFBQSxPQUFPLEdBQUcsSUFBSSxzQkFBTyxDQUFDLElBQUksRUFBRTtJQUN4QyxjQUFjLEVBQUU7UUFDZixNQUFNLEVBQUUsSUFBSTtLQUNaO0NBQ0QsQ0FBQyxDQUFDO0FBRUgsZUFBTyxDQUFDLFlBQVksR0FBRyxJQUFJLENBQUM7QUFFZixRQUFBLFlBQVksR0FBRyxJQUFJLHNCQUFPLENBQUMsSUFBSSxFQUFFO0lBQzdDLGNBQWMsRUFBRTtRQUNmLE1BQU0sRUFBRSxJQUFJO0tBQ1o7SUFDRCxJQUFJLEVBQUUsSUFBSTtJQUNWLEtBQUssRUFBRSxJQUFJO0NBQ1gsQ0FBQyxDQUFDO0FBRUgsb0JBQVksQ0FBQyxZQUFZLEdBQUcsSUFBSSxDQUFDO0FBRWpDLG9CQUFZLENBQUMsT0FBTyxHQUFHLEtBQUssQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ3JlYXRlZCBieSB1c2VyIG9uIDIwMTkvMi8zLzAwMy5cbiAqL1xuXG5pbXBvcnQgeyBDb25zb2xlLCBjaGFsa0J5Q29uc29sZSB9IGZyb20gJ2RlYnVnLWNvbG9yMic7XG5cbmV4cG9ydCBjb25zdCBjb25zb2xlID0gbmV3IENvbnNvbGUobnVsbCwge1xuXHRpbnNwZWN0T3B0aW9uczoge1xuXHRcdGNvbG9yczogdHJ1ZSxcblx0fSxcbn0pO1xuXG5jb25zb2xlLmVuYWJsZWRDb2xvciA9IHRydWU7XG5cbmV4cG9ydCBjb25zdCBjb25zb2xlRGVidWcgPSBuZXcgQ29uc29sZShudWxsLCB7XG5cdGluc3BlY3RPcHRpb25zOiB7XG5cdFx0Y29sb3JzOiB0cnVlLFxuXHR9LFxuXHR0aW1lOiB0cnVlLFxuXHRsYWJlbDogdHJ1ZSxcbn0pO1xuXG5jb25zb2xlRGVidWcuZW5hYmxlZENvbG9yID0gdHJ1ZTtcblxuY29uc29sZURlYnVnLmVuYWJsZWQgPSBmYWxzZTtcblxuZXhwb3J0IHsgY2hhbGtCeUNvbnNvbGUgfSJdfQ==