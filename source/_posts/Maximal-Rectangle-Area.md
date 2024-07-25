---
title: 最大矩形面积
date: 2019-08-26 14:44:50
update: 2019-08-26 14:44:50
katex: true
tags:
  - 单调栈
categories:
  - 题解
---

## [最大矩形面积](http://oj.ipoweru.cn/problem/22510)

题目描述
给出一个柱形统计图，图中有n个项目，它的每个项目的宽度是1， 高度为$h_i$。 求这个柱形图中的最大面积的长方形。

![sample.png](https://i.loli.net/2019/08/26/8OcebgIFEK3nJtu.png)

输入格式

从标准输入读入数据。

输入共两行。

第一行一个正整数 $n(\leq 10^6)$。

第二行 $n$ 个正整数，第 $i$ 个数为 $h_i$（$\leq10^6$） ，两个数之间用空格隔开。

输出格式

输出到标准输出。

输出一行，一个数，表示答案。

样例输入

7

2 1 4 5 1 3 3

样例输出

8

------------

### 标程如下
```cpp
#include <iostream>
#include <cmath>
using namespace std;
int n;
struct node {//搞个结构体储存h高度l长度
    int h, l;
} s[1000005];
int h, ans, top, sum;
//top栈顶元素，ans矩形面积，sum长度累加，h输入当前矩形高度
int main() {
    cin >> n;
    for (int i = 1; i <= n; i++) {
        cin >> h;
        sum = 0;//更新当前长度为0
        while (top && s[top].h > h) {
            ans = max(s[top].h * (s[top].l + sum), ans);
            sum += s[top].l;
            top--;
        }
/*如果加入的h不如栈顶h大的话，从栈顶开始往左算最大面积，

*/
        top++;
        s[top].h = h;
        s[top].l = sum + 1;
    }
    sum = 0;
    while (top) {
        ans = max(ans, s[top].h * (s[top].l + sum));
        top--;
    }
    cout << ans;
    return 0;
}
```