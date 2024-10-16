---
title: 本网站的建站故事
date: 2023-07-08 22:21:00
updated: 2023-07-08 22:21:00
katex: true
hidden: true
tags:
  - Hexo
categories:
  - 网站
description: 本网站的前生今世。
---

## 前身

2023年在分布式软件开发（DSD）课中，我负责我组**全部**的小组网站建设，使用`Github Pages`几乎完全手写了一个静态博客网站，包括主页、文章列表页、文章详情页，以及markdown和页内动态目录支持等。其中我的设计完全遵从能看、简洁的原则，并没有使用太过花里胡哨的东西。中间经历过很多困难，但也一一克服了，最终展现出一个简洁大方的小组网站：[PIrates](https://dsd-pirates.github.io/)，其原代码在[DSD-PIrates](https://github.com/DSD-PIrates/DSD-PIrates.github.io)。

只要将网站名字和内容修改，多余的页面删去，可以说当做一个简陋的个人博客完全够用了。

## 主题

参照上述我的设计经验，本次我依然选择了简洁大方的主题：[hexo-theme-yun](https://github.com/YunYouJun/hexo-theme-yun)。

这个主题背景简洁，可以隐藏侧边栏，强调了文章的中心，同时具有归档、标签功能，这是我之前没办法实现的。

## 展示

1. 进入网站后首先是封面，可以在这一部分做网站信息的展示。

<img src="../about/profile.png" alt="profile" style="zoom:50%;" />

2. 下滑，即可见到文章列表。每一篇文章有标签、分类和简介。

<img src="../about/card.png" alt="card" style="zoom:50%;" />

3. 在文章详情页有文章的具体展示。支持 $markdown$ 和 $mathjax$ ，代码支持高亮和复制，左侧显示目录，可以进行便捷的浏览和跳转。

<img src="../about/article1.png" alt="article1" style="zoom:50%;" />

<img src="../about/article2.png" alt="article2" style="zoom:50%;" />

4. 页面侧边栏为个人信息，点击头像可以跳转到博客的“关于”页面，头像下边从左至右依次为“首页”，“归档”，“分类”，“标签”，“关于”。

<img src="../about/personal.png" alt="personal" style="zoom:50%;" />

## 搭建

得益于 $Hexo$ 框架，只要跟着步骤走，博客的搭建就格外顺利，不到一小时就可以搭建出很美观的页面，大量的工作由框架自动完成，而我们只需要修改一下配置，就能得到属于自己的静态网站了。

在基本的操作完成后，如果想发表一篇新的博客，只需要在 $markdown$ 文件前加上 $Frontmatter$ ，然后移动到博客文件夹下，修改图片路径，然后部署即可。

其中部署可以利用  $Github$ $Actions$ 进行自动化处理，每一次发布新文章，只需要 $push$ 到 $Github$ 然后等几分钟，就可以看到部署好的新网站了。

## 思考

虽然这一套流程相当便捷，但是当我们完成一篇博客之后，还要根据博客网站文件夹对博客中插入的图片进行针对性改动，而修改之后在本地反而无法直接看到插入的图片，这是一件相当反逻辑的事。

其实有两种解决方法。

如果能够在云端实时把上传的相对路径，修改为博客系统的相对路径，那么就对本地的查看没有影响。

或者插入图片采用图床的插入方式，那么也能统一图片路径。

