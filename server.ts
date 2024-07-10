import { fromFileUrl } from "https://deno.land/std@0.224.0/path/mod.ts"
import { debounce } from "https://deno.land/std@0.224.0/async/debounce.ts"
import toh0 from "./main.js"

const target = Deno.args[0] || fromFileUrl(import.meta.resolve("./source.txt"))
const et = new EventTarget()
let body = ""

const _server = Deno.serve(
	{ port: 3000, hostname: "0.0.0.0" },
	async (request) => {
		if (request.headers.get("upgrade") === "websocket") {
			const { socket, response } = Deno.upgradeWebSocket(request)

			const send = () => {
				socket.send(JSON.stringify({ type: "changed", body }))
			}

			socket.onopen = () => {
				console.log("ws conn")
				et.addEventListener("changed", send)
				send()
			}
			socket.onmessage = (event) => {
				const data = JSON.parse(event.data)
				console.log("ws recv:", data)
			}
			socket.onclose = () => {
				console.log("ws disconn")
				et.removeEventListener("changed", send)
			}
			socket.onerror = (error) => {
				console.error("ws err:", error)
			}

			return response
		} else {
			const file = await Deno.open("./preview.html", { read: true })
			return new Response(
				file.readable,
				{ status: 200, headers: { "content-type": "text/html" } }
			)
		}
	}
)

const update = async () => {
	const source = await Deno.readTextFile(target)
	try {
		body = toh0(source)
	} catch (err) {
		console.log(err)
		body = `<h1>〚エラー〛</h1><div>${err.message}</div>`
	}
	et.dispatchEvent(new Event("changed"))
	console.log("updated")
}

const debouncedUpdate = debounce(update, 500)

const watch = async () => {
	const watcher = Deno.watchFs(target)
	for await (const event of watcher) {
		if (event.kind === "modify") debouncedUpdate()
	}
}

watch()
update()
