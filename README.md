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
