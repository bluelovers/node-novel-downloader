/**
 * Created by user on 2019/2/3/003.
 */

import { Console } from 'debug-color2';

export const console = new Console(null, {
	inspectOptions: {
		colors: true,
	},
});

console.enabledColor = true;
