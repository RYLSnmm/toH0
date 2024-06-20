import { escape, split, br, splitArray, trimArray } from "./utils.js"
import main from "./main.js"

const R = x => main(x)
const H = x => br(escape(x))

const internals = {
	block: (text, tags, bodyFn) => {
		const parts = tags.split(" > ").map(part => {
			const [tag, attrs] = split(part.trim() || "div", " ", 2)
			return [`<${tag}${attrs ? ` ${attrs}` : ""}>`, `</${tag}>`]
		})
		return parts.map(p => p[0]).join("") + bodyFn(text) + parts.toReversed().map(p => p[1]).join("")
	},
	table: (text, separator) => {
		const lines = trimArray(text.split("\n"), x => x.trim() === "")
		const blocks = splitArray(lines, x => x.trim() === "")
		const tgroup = (block, block_tag) => {
			const rows = block.map(line => {
				const cells = line.split(separator).map(cell => {
					const tag = { "thead": "th", "tbody": "td" }[block_tag]
					return `<${tag}>${R(cell.trim())}</${tag}>`
				}).join("")
				return `<tr>${cells}</tr>`
			}).join("")
			return `<${block_tag}>${rows}</${block_tag}>`
		}
		return "<table>" + (
			blocks.length > 1
				? tgroup(blocks.shift(), "thead") + blocks.map(block => tgroup(block, "tbody")).join("")
				: blocks.map(block => tgroup(block, "tbody")).join("")
		) + "</table>"
	},
	link: (url, text) => {
		const href = escape(url)
		const body = text ? R(text) : href
		return `<a href="${href}" target="_blank">${body}</a>`
	},
}

const commands = {
	"": () => ``,
	"#": () => ``,
	1: (value) => `<h1>${R(value)}</h1>`,
	2: (value) => `<h2>${R(value)}</h2>`,
	3: (value) => `<h3>${R(value)}</h3>`,
	4: (value) => `<h4>${R(value)}</h4>`,
	5: (value) => `<h5>${R(value)}</h5>`,
	6: (value) => `<h6>${R(value)}</h6>`,
	hr: () => `<hr/>`,
	bold: (value) => `<b>${R(value)}</b>`,
	link: (value) => {
		const [url, text] = split(value, /\s+/, 2)
		return internals.link(url, text)
	},
	rawblock: (value, option) => internals.block(value, option ?? "", H),
	block: (value, option) => internals.block(value, option ?? "", R),
	quote: (value) => internals.block(value, "blockquote", R),
	code: (value) => internals.block(value, "pre > code", H),
	table: (value, option) => internals.table(value, option ?? /\s{3,}/),
}

const parseCommand = (text) => {
	if (text.includes("\n")) {
		const [head, value] = split(text, "\n", 2)
		const [name, option] = split(head.trim(), " ", 2).map(x => x.trim())
		return { name, option, value }
	} else {
		const [name, value = ""] = split(text.trim(), " ", 2).map(x => x.trim())
		return { name, value }
	}
}

export { commands, parseCommand }
