"use strict";
/**
 * Created by user on 2018/2/13/013.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
exports.rootModule = path.join(__dirname, '');
exports.disablePaths = [
    path.join(exports.rootModule, 'src'),
    path.join(exports.rootModule, 'node_modules'),
    path.join(exports.rootModule, '.idea'),
    path.join(exports.rootModule, '.git'),
];
exports.testPath = path.join(exports.rootModule, 'test');
exports.tempPath = path.join(exports.testPath, 'temp');
exports.default = exports;
;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiX3Jvb3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJfcm9vdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7O0dBRUc7O0FBRUgsNkJBQThCO0FBRWpCLFFBQUEsVUFBVSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLEVBQUUsQ0FBQyxDQUFDO0FBRXRDLFFBQUEsWUFBWSxHQUFHO0lBQzNCLElBQUksQ0FBQyxJQUFJLENBQUMsa0JBQVUsRUFBRSxLQUFLLENBQUM7SUFDNUIsSUFBSSxDQUFDLElBQUksQ0FBQyxrQkFBVSxFQUFFLGNBQWMsQ0FBQztJQUNyQyxJQUFJLENBQUMsSUFBSSxDQUFDLGtCQUFVLEVBQUUsT0FBTyxDQUFDO0lBQzlCLElBQUksQ0FBQyxJQUFJLENBQUMsa0JBQVUsRUFBRSxNQUFNLENBQUM7Q0FDN0IsQ0FBQztBQUVXLFFBQUEsUUFBUSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsa0JBQVUsRUFBRSxNQUFNLENBQUMsQ0FBQztBQUN6QyxRQUFBLFFBQVEsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLGdCQUFRLEVBQUUsTUFBTSxDQUFDLENBQUM7QUFFcEQsa0JBQWUsT0FBbUMsQ0FBQztBQUFBLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENyZWF0ZWQgYnkgdXNlciBvbiAyMDE4LzIvMTMvMDEzLlxuICovXG5cbmltcG9ydCBwYXRoID0gcmVxdWlyZShcInBhdGhcIik7XG5cbmV4cG9ydCBjb25zdCByb290TW9kdWxlID0gcGF0aC5qb2luKF9fZGlybmFtZSwgJycpO1xuXG5leHBvcnQgY29uc3QgZGlzYWJsZVBhdGhzID0gW1xuXHRwYXRoLmpvaW4ocm9vdE1vZHVsZSwgJ3NyYycpLFxuXHRwYXRoLmpvaW4ocm9vdE1vZHVsZSwgJ25vZGVfbW9kdWxlcycpLFxuXHRwYXRoLmpvaW4ocm9vdE1vZHVsZSwgJy5pZGVhJyksXG5cdHBhdGguam9pbihyb290TW9kdWxlLCAnLmdpdCcpLFxuXTtcblxuZXhwb3J0IGNvbnN0IHRlc3RQYXRoID0gcGF0aC5qb2luKHJvb3RNb2R1bGUsICd0ZXN0Jyk7XG5leHBvcnQgY29uc3QgdGVtcFBhdGggPSBwYXRoLmpvaW4odGVzdFBhdGgsICd0ZW1wJyk7XG5cbmV4cG9ydCBkZWZhdWx0IGV4cG9ydHMgYXMgdHlwZW9mIGltcG9ydCgnLi9fcm9vdCcpOztcbiJdfQ==