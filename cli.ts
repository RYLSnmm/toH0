import toh0 from "./main.js"

const input = Deno.args[0]
const output = Deno.args[1]

if (!input) {
	console.error("ソースファイルを選択してください")
	Deno.exit(1)
}

const source = Deno.readTextFileSync(input)
const transformed = toh0(source)

if (!output) {
	Deno.stdout.write(new TextEncoder().encode(transformed))
} else {
	Deno.writeTextFileSync(output, transformed)
}
