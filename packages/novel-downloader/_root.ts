/**
 * Created by user on 2018/2/13/013.
 */

import path = require("path");

export const rootModule = path.join(__dirname, '');

export const disablePaths = [
	path.join(rootModule, 'src'),
	path.join(rootModule, 'node_modules'),
	path.join(rootModule, '.idea'),
	path.join(rootModule, '.git'),
];

export const testPath = path.join(rootModule, 'test');
export const tempPath = path.join(testPath, 'temp');

export default exports as typeof import('./_root');;
