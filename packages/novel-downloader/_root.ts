/**
 * Created by user on 2018/2/13/013.
 */

import { join } from "path";

export const rootModule = join(__dirname, '');

export const disablePaths = [
	join(rootModule, 'src'),
	join(rootModule, 'node_modules'),
	join(rootModule, '.idea'),
	join(rootModule, '.git'),
];

export const testPath = join(rootModule, 'test');
export const tempPath = join(testPath, 'temp');

export default {
	rootModule,
	disablePaths,
	testPath,
	tempPath,
}
