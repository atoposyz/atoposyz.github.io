# AnimeTireList

一个只有每年年末才有用的动画tierlist

[仓库地址](https://github.com/atoposyz/AnimeTierList)

## 灵感来源

- TierMaker
- 动画生涯个人喜好表

## 食用方法

1. 点击<a href="atoposyz.github.io/anime-rank/index.html">链接</a>即可使用
2. 当您发现网页在搜索动画和展示图片不尽人意时，可以等一下小水管的服务器，也可以选择手动构建来提高浏览体验

### 提高浏览体验

1. 将项目下载到本地
2. 打开项目，运行
```sh
npm i
npm run dev
```
即可在本地运行本项目，请注意命令行中的报错信息，正常情况下是不会报错的

3. 修改`src/components/SearchAnimeBox.vue`中的26~28行，其中26行负责搜索动画，获取动画id；28行用于获取动画海报；27行是运行的瓶颈，这一行向代理服务器请求图片，以通过浏览器CORS
4. ctrl+左键命令行的网址打开项目页面

## TODO

### 搜索功能有点菜了：
- [ ] 添加一个根据`bgm id`的精确搜索
- [ ] 添加一个直接根据网址传图片的功能，但是不保证能保存为图片


### settings添加功能：

- [x] 添加行
- [x] 换颜色
- [x] 删除行

### 美化

### 保存

- [x] 保存图片功能想办法把右边的setting去掉
- [ ] json只保存id

### 导入

- [ ] 自动爬取个人某年已看动画 https://github.com/Shell32-Natsu/bangumi_yearly_report

暂时先想这些
