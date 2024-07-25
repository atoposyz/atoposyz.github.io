---
title: P2024 食物链
date: 2019-11-13 18:27:00
update: 2019-11-13 18:27:00
katex: true
tags:
  - 树
categories:
  - 题解
---

```cpp
#include <iostream>
#include <cstdio>
#include <cstring>
#include <cmath>
#include <cstdlib>
#include <algorithm>
using namespace std;
int n, m, order, a, b, ans, fa[100005], re[100005];
int find(int x) 
{
	int f = fa[x];
	if(x != f) {
		fa[x] = find(f);
		re[x] = (re[x] + re[f]) % 3;
		return fa[x];
	}
	else return f;
} 
int main()
{
	cin >> n >> m;
	for(int i = 1; i <= n; i++)
		fa[i] = i;
	for(int i = 1; i <= m; i++) {
		cin >> order >> a >> b;
		if(a > n || b > n || (a == b && order == 2)) {
			ans++;
			continue;
		}	
		int f1 = find(a), f2 = find(b);
		if(order == 1) {
			if(f1 == f2 && re[a] != re[b]) {
				ans++;
				continue;
			} /*else if(f1 == f2 && re[a] % 3 == re[b] % 3) {
				continue;
			}*/ else if(f1 != f2) {
				fa[f1] = f2;
				re[f1] = (re[b] - re[a] + 3) % 3;
				continue;
			} 
		} else if(order == 2) {
			if(f1 == f2 && (re[a] - re[b] + 3) % 3 != 1) {
				ans++;
				continue;
			} else if(f1 != f2) {
				fa[f1] = f2;
				re[f1] = (re[b] + 1 - re[a] + 3) % 3;
				continue;
			}
		}
	}
	cout << ans;
return 0;
}
```