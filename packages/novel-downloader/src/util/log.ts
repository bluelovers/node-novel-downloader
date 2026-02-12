/**
 * Created by user on 2019/2/3/003.
 */

import { Console, chalkByConsole } from 'debug-color2';

/**
 * 帶有顏色的控制台輸出
 * Console output with colors
 */
export const console = new Console(null, {
	inspectOptions: {
		colors: true,
	},
});

console.enabledColor = true;

/**
 * 用於除錯的控制台輸出，包含時間和標籤
 * Console output for debugging, including time and label
 */
export const consoleDebug = new Console(null, {
	inspectOptions: {
		colors: true,
	},
	time: true,
	label: true,
});

consoleDebug.enabledColor = true;

consoleDebug.enabled = false;

export { chalkByConsole }