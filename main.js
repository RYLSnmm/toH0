import { split, escape } from "./utils.js"
import { parseCommand, commands as default_commands } from "./commands.js"

const main = (source, commands) => {
	let html = ""
	const merged_commands = { ...default_commands, ...commands }
	for (const token of parse(source.replaceAll("\r\n", "\n").trimEnd())) {
		if ("command" in token) {
			const { name, option, value } = parseCommand(token.command)
			if (!merged_commands[name]) {
				throw new Error(`コマンドが存在しません: ${name}`)
			}
			html += merged_commands[name](value, option)
		} else {
			html += escape(token.text)
			if (!token.inline) {
				html += "<br/>"
			}
		}
	}
	return html
}

const parse = function* (source) {
	const parseBlock = () => {
		/*
			#{_# foo bar #_}
			#{_KEY# foo bar #KEY_}
			#{_#foo
				bar
			#_}
			xx{_# foo bar #_}
			xx{_KEY# foo bar #KEY_}
			xx{_KEY#foo
				bar
				baz
			#KEY_}
			{_S_} -> {_
			{_E_} -> _}
			{_#_} -> #
		*/
		let inline = true
		if (source.startsWith("#{_")) {
			source = source.slice(1)
			inline = false
		} else if (source.startsWith("{_")) {
			{
				const start = "{_S_}"
				if (source.startsWith(start)) {
					source = source.slice(start.length)
					return { text: "{_", inline: true }
				}
			}
			{
				const end = "{_E_}"
				if (source.startsWith(end)) {
					source = source.slice(end.length)
					return { text: "_}", inline: true }
				}
			}
			{
				const sharp = "{_#_}"
				if (source.startsWith(sharp)) {
					source = source.slice(sharp.length)
					return { text: "#", inline: true }
				}
			}
		} else {
			throw new Error("実装エラー: parseInline の呼び出し時は {_ から始まる必要あり")
		}

		const matched = source.match(/^\{_(.*?)#/)
		if (!matched) {
			throw new Error("構文エラー: parseInline {_KEY# で始まる必要があります", { cause: { text: source } })
		}
		source = source.slice(matched[0].length)
		const end = `#${matched[1]}_}`
		const parts = split(source, end, 2)
		if (parts.length === 1) {
			throw new Error("構文エラー: parseInline 閉じる #_} が見つかりませんでした", { cause: { end, text: source } })
		}
		source = parts[1]
		return { command: parts[0], inline }
	}

	const states = {
		LINESTART: Symbol("LINESTART"),
		INLINE: Symbol("INLINE"),
		END: Symbol("END"),
	}
	let state = states.LINESTART
	while (source) {
		if (state === states.LINESTART && source.startsWith("#")) {
			if (source.startsWith("#{_")) {
				// #行ブロック
				yield parseBlock()
				const parts = split(source, "\n", 2)
				if (parts[0].trim()) {
					throw new Error("構文エラー: #行ブロックの終了は行末の必要があります", { cause: { text: source } })
				}
				source = parts[1] ?? ""
				state = source === "" ? states.END : states.LINESTART
			} else {
				// #行コマンド
				const parts = split(source, "\n", 2)
				const token = {
					command: parts[0].slice(1),
					inline: false,
				}
				source = parts[1] ?? ""
				yield token
				state = source === "" ? states.END : states.LINESTART
			}
		} else {
			const matched = source.match(/\n|\{_/)
			if (!matched) {
				// 行中ブロックなしの最終
				const token = {
					text: source,
					inline: true,
				}
				source = ""
				yield token
				state = states.END
			} else if (matched[0] === "\n") {
				// 行中から行末まで
				const token = {
					text: source.slice(0, matched.index),
					inline: false,
				}
				source = source.slice(matched.index + 1)
				yield token
				state = states.LINESTART
			} else {
				// 行中からブロックまで
				const token = {
					text: source.slice(0, matched.index),
					inline: true,
				}
				source = source.slice(matched.index)
				if (token.text) {
					yield token
				}
				yield parseBlock()
				state = states.INLINE
			}
		}
	}
}

export default main
