---
title: 疾病管理
date: 2019-10-02 16:52:42
updated: 2019-10-02 16:52:42
katex: true
tags:
  - 状态压缩
categories:
  - 题解
---

# [Disease Manangement 疾病管理](http://oj.ipoweru.cn/problem/24112)

## 题面如下

有 $N$ 头牛，它们可能患有 $D$ 种病，现在从这些牛中选出若干头来，但选出来的牛患病的集合中不过超过 $K$ 种病。

输入格式

从标准输入读入数据。

第一行输入三个正整数 $N(N \leq 1000)$、$D(D \leq 15)$和$ K(K \leq D)$。

接下来 $N$ 行，每行先输入一个整数 $a_i (a_i \leq D)$，然后输入 $D$ 个正整数 $b_{ij} (b_{ij} \leq D)$，代表第 $i$ 头牛患的 $a_i$ 种病。

输出格式

输出到标准输出。

输出一个整数，为最多能选出牛的数量。

样例输入

```cpp
6 3 2
0
1 1
1 2
1 3
2 2 1
2 2 1
```

样例输出

```cpp
5
```

```cpp
#include <iostream>
#include <cstdio>
#include <cstring>
#include <cmath>
#include <cstdlib>
#include <algorithm>
using namespace std;
int n, d, k, ds[1005], sum, ans;
bool check(int s)
{
	int cnt = 0;
	for(int i = s; i; i >>= 1) {
		cnt += i & 1;
	}
	return cnt <= k;
}
int main()
{
	cin >> n >> d >> k;
	for(int i = 1; i <= n; i++) {
		int a, x;
		cin >> a;
		for(int j = 1; j <= a; j++) {
			cin >> x;
			ds[i] += (1 << (x - 1));
		}
	}
	for(int i = 1 ;i < (1 << d); i++) {
		if(check(i)) {
			sum = 0;
			for(int j = 1; j <= n; j++) {
				if((ds[j] | i) == i) {
					sum++;
				}
			}
			ans = max(ans, sum);
		}
	}
	cout << ans;
return 0;
}

```