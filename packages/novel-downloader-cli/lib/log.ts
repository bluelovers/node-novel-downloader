/**
 * Created by user on 2019/1/3/003.
 */

import { Console } from 'debug-color2';

export const console = new Console();

console.inspectOptions = console.inspectOptions || {};
console.inspectOptions.colors = true;

console.enabledColor = true;

export default console;
