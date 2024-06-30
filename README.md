HTML の生成ツール

markdown 的なもの

基本は書いたままで改行を br タグに置き換える

`{_# #_}` が特殊な扱い

```
{_# <command> <value> #_}
```

でコマンドを書く

例

```
{_# link https://example.com/ リンク #_}
```

`#` で始まる行はコマンド行

```
# <command> <value>
```

例

```
#1 ここは h1 タグ
```

詳細は `example.js` の例を参照

---

### ブラウザで使う

`page.html` がブラウザ上で変換するためのページ  
左側のテキストエリアに入力すると右側のテキストエリアに HTML が出力される  

フォルダをサーブしてこの `page.html` を開くと使える  
サーバーを通さないとモジュールのインポートができないから直接開いてもダメ  
Github Pages のページで表示されるのがこれ  

### コマンドラインで使う

```sh
deno run --allow-read --allow-write cli.ts input.txt output.txt
```

出力ファイルを指定しなければコンソールに出力

```sh
deno run --allow-read cli.ts input.txt
```

### ローカルファイルをウォッチ

```sh
deno run --allow-net --allow-read server.ts
```

```sh
deno run --allow-net --allow-read server.ts file.txt
```

ブラウザで `localhost:3000` を開くと結果を表示  
コマンドライン引数で指定したファイルを監視してファイルに更新があればブラウザの表示も更新  
引数指定がない場合のデフォルトファイルは `source.txt`
