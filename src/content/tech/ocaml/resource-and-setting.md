---
title: "OCaml 相關資源設定"
description: "OCaml 相關資源及設定"
tags: 
  - OCaml
permalink: "/tech/ocaml/resource-and-setting/index.html"
---

## Language

- [Standard Lib API 5.3](https://ocaml.org/manual/5.3/api/index.html)
- [OCaml Manual 5.3](https://ocaml.org/manual/5.3/index.html)

## Learning

- [Unix System programming in OCaml](https://ocaml.github.io/ocamlunix/index.html)
- [cs3110](https://cs3110.github.io/textbook/cover.html)

## Books

- [Learn Programming with OCaml](https://usr.lmf.cnrs.fr/lpo/)


## Tools

### ocamlformat

預設 janestreet 但部份會參考[官方](https://ocaml.org/docs/guidelines#formatting-guidelines)建議作調整，由於 ocamlformat 說明相對簡陋，因此需要反覆對照調整確定參數，所以在此紀錄目前理想的設定。

```plaintext title=".ocamlformat"
profile=janestreet
break-separators=after
let-binding-indent=4
line-endings=lf
exp-grouping=preserve
margin=80
module-item-spacing=preserve
sequence-blank-line=preserve-one
if-then-else=k-r
indicate-multiline-delimiters=space
parens-tuple=always
parens-tuple-patterns=always
```

[測試網址](https://ocamlformat-online-editor.pages.dev/)