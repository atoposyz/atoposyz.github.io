---
title: ST表
date: 2019-10-03 10:14:22
updated: 2019-10-03 10:14:22
katex: true
tags:
  - ST表
categories:
  - 笔记
---

# 对数组操作

```cpp
#include <iostream>
#include <cstdio>
#include <cstring>
#include <cmath>
#include <cstdlib>
#include <algorithm>
using namespace std;
const int N = 100003;
int a[N], n, m, logn[N];
struct ST {
	int st[21][N];
	const int &(*f)(const int &, const int&);
	void init(int a[N], const int &g(const int&, const int&)) {
		for(int i = 1; i <= n; i++) {
			st[0][i] = a[i];
		}
		f = g;
		for(int i = 1; (1 << i) <= n; i++) {
			for(int j = 1; j + (1 << i) - 1 <= n; j++) {
				st[i][j] = f(st[i - 1][j], st[i - 1][j + (1 << (i - 1))]);
			}
		}
	}
	int query(int l, int r) {
		int t = logn[r - l + 1];
		return f(st[t][l], st[t][r - (1 << t) + 1]);
	}
} st[2];
int main()
{
	scanf("%d%d", &n, &m);
	for(int i = 1 ;i <= n; i++) {
		scanf("%d", &a[i]);
	}
	for(int i = 2; i <= n; i++) {
		logn[i] = logn[i >> 1] + 1;
	}
	//st[0].init(a, min<int>);
	st[1].init(a, max<int>);
	for(int i = 1; i <= m; i++) {
		int l, r;
		scanf("%d%d", &l, &r);
		printf("%d\n", st[1].query(l, r));
	}
	return 0;
}

```

# [RMQ问题1](http://oj.ipoweru.cn/problem/23401)

一开始你有一个空序列，和 $m$ 个操作，每个操作为以下三种之一：

1. I $x$, 在序列尾部插入一个数 $x$ （$0 < x \leq 10^6$）。

2. Q $l r$，询问区间 $[l , r]$ 的最小值，保证区间合法。

3. D ，删除序列尾部的数，保证删除时序列不为空。

输入共 $m + 1$ 行。

第一行，一个正整数 $m$（$m \leq 5× 10^5$）。

接下来 $m$ 行，每行一个操作，为题目描述中的一种。

输出若干行。

对于每个 Q 操作，输出一行，为询问的答案。

## 样例1输入

```
15
I 488615
I 54746
I 505647
I 797443
I 233558
D
D
I 77582
I 710629
I 417964
I 984993
I 880349
Q 2 2
Q 6 7
I 385247
```

## 样例1输出

```
54746
417964
```

## 标程

```cpp
#include <iostream>
#include <cstdio>
#include <cstring>
#include <cmath>
#include <cstdlib>
#include <algorithm>
using namespace std;
const int N = 500005;
int m, logn[N];
struct ST {
	int st[21][N], n;
	int query(int l, int r) {
		int t = logn[r - l + 1];
		return min(st[t][l], st[t][r - (1 << t) + 1]);
	}
	void push_back(int x) {
		st[0][++n] = x;
		for(int i = 1; ; i++) {
			int l = n - (1 << i) + 1;
			if(l >= 1) {
				st[i][l] = min(st[i - 1][l], st[i - 1][l + (1 << (i - 1))]);
			} else {
				break;
			}
		}
	}
	void pop_back() {
		n--;
	}
}st;
int main()
{
	cin >> m;
	for(int i = 2; i < N; i++) {
		logn[i] = logn[i >> 1] + 1;
	}
	while(m--) {
		char ord;
		cin >> ord;
		if(ord == 'I') {
			int x;
			cin >> x;
			st.push_back(x);
		} else if(ord == 'Q') {
			int l, r;
			cin >> l >> r;
			cout << st.query(l, r) << endl;
		} else {
			st.pop_back();
		}
	}
	return 0;
}

```

## 单调栈做法

```cpp
#include <iostream>
#include <cstdio>
#include <cstring>
#include <cmath>
#include <cstdlib>
#include <algorithm>
using namespace std;
const int N = 500001;
int fa[22][N], da[N], p[N], n, tot, logn = 20, top[N];
void add(int x) 
{
	int u = ++tot;
	da[u] = x;
	int v = top[n];
	p[u] = ++n;
	top[n] = u;
	if(!v || da[v] < da[u]) {
		fa[0][u] = v;
	} else {
		for(int i = logn; i >= 0; i--) {
			if(fa[i][v] && da[fa[i][v]] >= da[u]) {
				v = fa[i][v];
			}
		}
		fa[0][u] = fa[0][v];
	}
	for(int i = 1; i <= logn; i++) {
		fa[i][u] = fa[i - 1][fa[i - 1][u]];
	}
}
int query(int l, int r) 
{
	int u = top[r];
	for(int i = logn; i >= 0; i--) {
		if(fa[i][u] && p[fa[i][u]] >= l) {
			u = fa[i][u];
		}
	}
	return da[u];
}
int main()
{
	int m;
	scanf("%d", &m);
	while(m--) {
		char opt[9];
		scanf("%s", opt);
		if(opt[0] == 'I') {
			int x;
			scanf("%d", &x);
			add(x);
		} else if(opt[0] == 'Q') {
			int l, r;
			scanf("%d%d", &l, &r);
			printf("%d\n", query(l, r));
		} else {
			n--;
		}
	}
return 0;
}

```