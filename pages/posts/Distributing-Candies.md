---
title: 发糖果（拓扑排序模板）
date: 2019-11-08 21:51:00
updated: 2019-11-08 21:51:00
katex: true
tags:
  - 拓扑排序
categories:
  - 题解
---

#[发糖果](http://oj.ipoweru.cn/problem/23300)

## Code

```cpp
#include <iostream>
#include <cstdio>
#include <cstring>
#include <cmath>
#include <cstdlib>
#include <algorithm>
#include <stack>
using namespace std;
const int N = 1e5 + 3;
int n, m, buy[N], in[N];
long long sum;
struct edge {
	int to, next;
}e[N << 1];
int head[N], cnt;
stack <int> s;
void add(int u,int v)
{
	e[++cnt].next = head[u];
	e[cnt].to = v;
	head[u] = cnt;
}
int main()
{
	cin >> n >> m;
	for(int i = 1; i <= m; i++) {
		int u, v;
		cin >> u >> v;
		add(v, u);
		in[u]++;
	}
	cnt = 0;
	for(int i = 1; i <= n; i++) {
		if(in[i] == 0) {
			s.push(i);
			buy[i] = 1;
		}
	}
	while(!s.empty()) {
		int u = s.top();
		s.pop();
		cnt++;
		for(int i = head[u]; i; i = e[i].next) {
			int v = e[i].to;
			in[v]--;
			if(in[v] == 0) {
				s.push(v);	
			}
			buy[v] = max(buy[v], buy[u] + 1);
		}
	}
	if(cnt != n) {
		cout << -1 << endl;
	} else {
		for(int i = 1; i <= n; i++) {
			sum += buy[i];
		}
		cout << sum << endl;
	}
	return 0;
}
```
## 问题注意

```cpp
e[++cnt].next = head[u];
e[cnt].to = v;
head[u] = cnt;
```

打成

```cpp
e[cnt++].next = head[u];
e[cnt].to = v;
head[u] = cnt;
```