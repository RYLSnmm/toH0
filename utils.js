export const split = (str, divider, max) => {
	max = ~~max
	if (max === 0) return []
	if (max === 1) return [str]
	if (str === "") return [str]

	const result = []
	while (str) {
		const matched = str.match(divider)
		if (!matched) {
			result.push(str)
			break
		} else {
			result.push(str.slice(0, matched.index))
			str = str.slice(matched.index + matched[0].length)
		}
		if (result.length === max - 1) {
			result.push(str)
			break
		}
	}
	return result
}

export const trimArrayStart = (arr, trim) => {
	const index = arr.findIndex(item => {
		return !trim(item)
	})
	if (index < 0) return []
	return arr.slice(index)
}

export const trimArrayEnd = (arr, trim) => {
	const index = arr.findLastIndex(item => {
		return !trim(item)
	})
	if (index < 0) return []
	return arr.slice(0, index + 1)
}

export const trimArray = (arr, trim) => {
	return trimArrayEnd(trimArrayStart(arr, trim), trim)
}

export const splitArray = (array, split, keep) => {
	const result = [[]]
	let current = result[0]
	for (const item of array) {
		if (split(item)) {
			current = keep ? [item] : []
			result.push(current)
		} else {
			current.push(item)
		}
	}
	return result
}

export const escape = (str) => {
	return str.replace(/[<>&"']/g, ch => {
		return {
			"<": "&lt;",
			">": "&gt;",
			"&": "&amp;",
			'"': "&quot;",
			"'": "&apos;",
		}[ch]
	})
}

export const br = (str) => {
	return str.replaceAll("\n", "<br/>")
}
