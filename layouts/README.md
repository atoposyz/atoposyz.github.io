# layouts

You can override valaxy/theme layouts here.

## 文章 AI 生成披露

在文章的 frontmatter 中选择 `post-ai` 版式，再开启 `aiDisclosure.enabled`。披露会显示在文章标题信息与正文之间。

```yaml
---
title: 示例文章
layout: post-ai
aiDisclosure:
  enabled: true
  details: |
    本文使用 ChatGPT 协助梳理提纲和润色部分段落。
    正文由作者审阅，引用和事实由作者核对。
---
```

`details` 可填写工具、参与环节和人工审阅情况。留空时显示通用披露。将 `enabled` 设为 `false` 或省略 `aiDisclosure` 即可隐藏披露。
