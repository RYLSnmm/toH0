import main from "./main.js"

const assertEq = (a, b) => {
	if (a !== b) {
		console.error(a, b)
		throw new Error("Assert error", { cause: [a, b] })
	}
}

////////////////////////////////////////////////////////////

// 改行が br タグになる
// その他はエスケープされてそのまま HTML
{
	const source = `foo
bar<div></div>`
	const expected = `foo<br/>bar&lt;div&gt;&lt;/div&gt;`
	assertEq(main(source), expected)
}

// 行が # で始まると行コマンド
// #[name] [value]
// #1 は h1、 #2 は h2、・・・
{
	const source = `#1 ここはh1タグ
text
#1 ここもh1タグ
#2 ここはh2タグ

#3 ここはh3タグ`
	const expected = `<h1>ここはh1タグ</h1>text<br/><h1>ここもh1タグ</h1><h2>ここはh2タグ</h2><br/><h3>ここはh3タグ</h3>`
	assertEq(main(source), expected)
}

// {_# #_} がブロックコマンド
// {_# [name] [value] #_}
// {_# bold text #_} で <b> タグで囲む
{
	const source = `text{_# bold B #_}text`
	const expected = `text<b>B</b>text`
	assertEq(main(source), expected)
}

// ブロックは終了文字までの間に改行を含められる
// 改行を含める場合、1行目の name 以降は option になって、2行目以降が value になる
// {_# [name] [option]
// [value]
// #_}
// 改行なしだと共通構文として option をつけられない
// コマンドが value をどう扱うか次第
{
	const source = `{_#bold
B
#_}
a`
	const expected = `<b>B</b><br/>a`
	assertEq(main(source), expected)
}

// ブロックコマンドはインライン扱い
// 行末に来ると末尾に空文字＋改行がある扱いで <br/> が出力される
{
	const source = `{_#1 H#_}
a`
	const expected = `<h1>H</h1><br/>a`
	assertEq(main(source), expected)
}

// 末尾改行がいらない場合は行ブロックにする
// 行ブロックは行頭に # から始まってブロックの {_# #_} が続く
{
	const source = `#{_#1 H#_}
a`
	const expected = `<h1>H</h1>a`
	assertEq(main(source), expected)
}

// ブロックには KEY をつけれる
// KEY は任意の文字
// 終了は開始と同じ KEY が必要
{
	const source = `{_KEY# bold B #KEY_}`
	const expected = `<b>B</b>`
	assertEq(main(source), expected)
}

// コマンドの処理は追加定義可能
{
	const source = `{_KEY# foo bar #KEY_}`
	const commands = {
		foo: (value) => `【${value}】`
	}
	const expected = `【bar】`
	assertEq(main(source, commands), expected)
}

// 特殊パターン
// {_S_} -> {_
// {_E_} -> _}
// {_#_} -> #
// {_##_} -> (空文字) 
//           コマンドとして認識されて
//           空文字のコマンドは何も出力しないのでこうなる
{
	const source = `{_S_}{_E_}{_#_}({_##_})`
	const expected = `{__}#()`
	assertEq(main(source), expected)
}

// コマンド： #
// 何も出力しないのでコメント扱い
{
	const source = `## 出力されない
{_# # これも出力されない #_}
A`
	const expected = `<br/>A`
	assertEq(main(source), expected)
}

// コマンド： link
// a タグを作る
{
	const source = `{_# link http://example.com リンク #_}
{_# link http://www.example.com #_}
`
	const expected = `<a href="http://example.com" target="_blank">リンク</a><br/>` +
		`<a href="http://www.example.com" target="_blank">http://www.example.com</a>`
	assertEq(main(source), expected)
}

// コマンド： block
// div で囲む、option でタグと属性を指定
// > で区切ると多重タグにできる
{
	const source = `#{_#block
block1
#_}
#{_#block p class="text"
block2#_}
#{_#block pre id="p" > code id="c"
block3
#_}
#block block4
`
	const expected = `<div>block1</div><p class="text">block2</p><pre id="p"><code id="c">block3</code></pre><div>block4</div>`
	assertEq(main(source), expected)
}

// コマンド： table
// option で区切り文字を指定、指定なしは 3 つ以上の空白文字
// value の各行が表の行になる
// 空行で thead/tbody を分ける
{
	const source = `#{_#table
1   2   3
#_}
#{_#table ,
1,2

3,4
5,6
#_}
`
	const expected = `<table><tbody><tr><td>1</td><td>2</td><td>3</td></tr></tbody></table>` + 
		`<table><thead><tr><th>1</th><th>2</th></tr></thead><tbody><tr><td>3</td><td>4</td></tr><tr><td>5</td><td>6</td></tr></tbody></table>`
	assertEq(main(source), expected)
}

console.log("OK")