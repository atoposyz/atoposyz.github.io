---
title: Apple Tree 2
date: 2019-11-03 06:25:45
updated: 2019-11-03 06:25:45
katex: true
tags:
  - 数据结构
  - 区间数据结构
categories:
  - 题解
---

## 题目描述
有一颗 $n$ 个节点的苹果树，最初每个节点上都有 $1$ 个苹果，并且每个节点在操作的过程中只会处在有 $1$ 个苹果和没有苹果两种状态之一。

有 $m$ 个操作，操作分为三种：

- 发动丰收魔法：令节点 $u$ 为根的子树中所有没有苹果的节点全部长出  个苹果。

- 摘下苹果吃：令节点 $u$ 为根的子树中所有有苹果的节点的苹果全部消失。

- 统计苹果个数：统计节点 $u$ 为根的子树中苹果的个数。

## 输入格式
从标准输入读入数据。

第一行输入三个正整数 $n(n \leq 10^5), m(m \leq 10^5)$ 和 $root(root \leq n)$，其中 $root$ 代表根节点编号。

接下来 $n - 1$ 行，每行输入两个整数 $x$ 和 $y(1 \leq x, y \leq n)$，代表 $x$ 和 $y$ 之间连有边。

接下来 $m$ 行，每行输入两个整数 $opt$（取值 $0$ 或 $1$ 或 $2$）和 $u(1 \leq u \leq n)$，其中$opt = 0$  表示这是一次丰收魔法、$opt = 1$ 表示这是一次摘苹果、$opt = 2$ 表示这是一次统计。

## 输出格式
输出到标准输出。

对于每个统计操作，输出一行一个整数代表所求答案。

## 样例输入
```cpp
5 9 1
2 1
3 2
4 1
5 2
1 1
0 2
2 3
2 2
0 4
2 1
0 1
1 2
2 1
```
## 样例输出
```cpp
1
3
4
2
```

-----

很好的一个线段树与$DFS$序结合的题目

因为一棵树的子树的$DFS$序是连续的，因此直接按$DFS$序建线段树，子树修改与查询都变为了区间修改与查询

代码如下

```cpp
#include <iostream>
#include <cstdio>
#include <cstring>
#include <cmath>
#include <cstdlib>
#include <algorithm>
using namespace std;
const int N = 1e5 + 3;
int n, m, rt;
struct edge {
	int to, next;
} e[N << 1];
int head[N], cnt, a[N], vis[N], size[N], pos[N], sum[N << 2], tag[N << 2];
void add(int u, int v)
{
	e[++cnt].to = v;
	e[cnt].next = head[u];
	head[u] = cnt;
}
void dfs(int k)
{
	size[k] = 1;
	vis[k] = 1;
	for(int i = head[k]; i; i = e[i].next) {
		int v = e[i].to;
		if(!vis[v]) {
			a[++cnt] = v;
			pos[v] = cnt;
			dfs(v);
			size[k] += size[v];
		}
	}
}

//int dfn[N][2], tm;
//void dfs(int u) {
//    vis[u] = 1;
//    dfn[u][0] = ++tm;
//    for(int i = head[u]; i; i = e[i].next) {
//		int v = e[i].to;
//		if(!vis[v])
//            dfs(v);
//    }
//    dfn[u][1] = tm;
//}
void pushup(int u)
{
	sum[u] = sum[u << 1] + sum[u << 1 | 1];
}
void build(int u, int ul, int ur)
{
	tag[u] = -1;
	if(ul == ur) {
		sum[u] = 1;
		return;
	}
	int mid = ul + ur >> 1;
	build(u << 1, ul, mid);
	build(u << 1 | 1, mid + 1, ur);
	pushup(u);
}
void update(int u, int ul, int ur, int x)
{
	if(x == 0)
		sum[u] = ur - ul + 1;
	else
		sum[u] = 0;
	tag[u] = x;
}
void pushdown(int u, int ul, int ur)
{
	if(tag[u] != -1) {
		int mid = ul + ur >> 1;
		update(u << 1, ul, mid, tag[u]);
		update(u << 1 | 1, mid + 1, ur, tag[u]);
		tag[u] = -1;
	}
}
void modify(int u, int ul, int ur, int ml, int mr, int mx)
{
	if(ul >= ml && ur <= mr) {
		update(u, ul, ur, mx);
		return;
	}
	pushdown(u, ul, ur);
	int mid = ul + ur >> 1;
	if(mid >= ml)
		modify(u << 1, ul, mid, ml, mr, mx);
	if(mid + 1 <= mr)
		modify(u << 1 | 1, mid + 1, ur, ml, mr, mx);
	pushup(u);
}
int query(int u, int ul, int ur, int ml, int mr)
{
	if(ml <= ul && mr >= ur) {
		return sum[u];
	}
	pushdown(u, ul, ur);
	int mid = ul + ur >> 1;
	int s = 0;
	if(mid >= ml) {
		s += query(u << 1, ul, mid, ml, mr);
	}
	if(mid + 1 <= mr) {
		s += query(u << 1 | 1, mid + 1, ur, ml, mr);
	}
	return s;
}
int main()
{
	cin >> n >> m >> rt;
	for(int i = 1; i < n; i++) {
		int x, y;
		cin >> x >> y;
		add(x, y);
		add(y, x);
	}
	cnt = 1;
	a[1] = rt;
	pos[rt] = 1;
	dfs(rt);
//	for(int i = 1; i <= n; i++) {
//		cout << size[i] << endl;
//	}
	build(1, 1, n);
	while(m--) {
		int opt, u;
		cin >> opt >> u;
		if(opt == 0 || opt == 1) {
			modify(1, 1, n, pos[u], pos[u] + size[u] - 1, opt);
//			cout << query(1, 1, n, pos[u], pos[u] + size[u] - 1) << endl;
		} else {
			cout << query(1, 1, n, pos[u], pos[u] + size[u] - 1) << endl;
		}
	}
	return 0;
}

```

1. 数组一定要开**四倍**大小

2. tag标记的是啥一定要想清楚

```cpp
void update(int u, int ul, int ur, int x)
{
	if(x == 0)
		sum[u] = ur - ul + 1;
	else
		sum[u] = 0;
	tag[u] = x;
}
void pushdown(int u, int ul, int ur)
{
	if(tag[u] != -1) {
		int mid = ul + ur >> 1;
		update(u << 1, ul, mid, tag[u]);
		update(u << 1 | 1, mid + 1, ur, tag[u]);
		tag[u] = -1;
	}
}
```

特别是这两处tag的更新