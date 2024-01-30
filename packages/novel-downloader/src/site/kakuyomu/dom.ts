
export function _classStartWith<T extends string, T2 extends string>(prefix: T, suffix?: T2)
{
	return `[class^="${prefix}"]${suffix ?? ''}` as const
}

export function _jQueryClassStartWith<T extends string>($: JQueryStatic, selector: string, prefix: string, suffix?: string, parent?: JQuery<any>)
{
	return $(`${selector}${_classStartWith(prefix, suffix)}`, parent)
}

export function _jQueryElemOuterHTML<T extends string>($: JQuery<any>): string
{
	return $.prop('outerHTML')
}
