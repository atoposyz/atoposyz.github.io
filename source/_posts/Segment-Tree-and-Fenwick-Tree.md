---
title: 线段树与树状数组
date: 2019-10-06 22:08:50
update: 2019-10-06 22:08:50
katex: true
tags:
  - 区间数据结构
categories:
  - 笔记
---

# [【模板】线段树 1](https://www.luogu.org/problem/P3372)
## 区间加法+求和
```cpp
#include <iostream>
#include <cstdio>
#include <cstring>
#include <cmath>
#include <cstdlib>
#include <algorithm>
using namespace std;
typedef long long lld;
int n ,m;
const int N = 1e5 + 5;
lld sum[N << 2], tag[N << 2];
void pushup(int u)
{
	sum[u] = sum[u << 1] + sum[u << 1 | 1];
}
void build(int u, int l, int r)
{
	if(l == r) 
	{
		cin >> sum[u];
		return;
	}
	int mid = l + r >> 1;
	build(u << 1, l, mid);
	build(u << 1 | 1, mid + 1, r);
	pushup(u);
}
void update(int u, int l, int r, int x)
{
	tag[u] += x;
	sum[u] += (lld)x * (r - l + 1);
}
void pushdown(int u, int l, int r)
{
	if(tag[u]) {
		int mid = l + r >> 1;
		update(u << 1, l, mid, tag[u]);
		update(u << 1 | 1, mid + 1, r, tag[u]);
		tag[u] = 0;
	}
}
void modify(int u, int ul, int ur, int ml, int mr, int x)
{
	if(ml <= ul && mr >= ur) {
		update(u, ul, ur, x);
		return;
	}
	pushdown(u, ul, ur);
	int mid = ul + ur >> 1;
	if(ml <= mid)
		modify(u << 1, ul, mid, ml, mr, x);
	if(mid + 1 <= mr)
		modify(u << 1 | 1, mid + 1, ur, ml, mr, x);
	pushup(u);
}
lld query(int u, int ul, int ur, int ml, int mr)
{
	if(ml <= ul && mr >= ur) {
		return sum[u];
	}
	pushdown(u, ul, ur);
	int mid = ul + ur >> 1;
	lld s = 0;
	if(ml <= mid)  
		s += query(u << 1, ul, mid, ml, mr);
	if(mr >= mid + 1)
		s += query(u << 1 | 1, mid + 1, ur, ml, mr);
	return s;
}
int main()
{
	cin >> n >> m;
	build(1, 1, n);
	while(m--) {
		int ord, x, y, z;
		cin >> ord >> x >> y;
		if(ord == 1) {
			cin >> z;
			modify(1, 1, n, x, y, z);
		} else 
			cout << query(1, 1, n, x, y) << endl;
	}
return 0;
}

```

# [【模板】树状数组 1](https://www.luogu.org/problem/P3374)
## 单点加法+区间求和

```cpp
#include <iostream>
#include <cstdio>
#include <cstring>
#include <cmath>
#include <cstdlib>
#include <algorithm>
using namespace std;
const int N = 5e5 + 5;
int n, m, t[N];
typedef long long lld;
int lowbit(int x)
{
	return x & -x;
}
void modify(int i, lld x)
{
	while(i <= n) {
		t[i] += x;
		i += lowbit(i);
	}
}
lld query(int i) 
{
	lld sum = 0;
	while(i) {
		sum += t[i];
		i -= lowbit(i);
	}
	return sum;
}
int main()
{
	cin >> n >> m;
	for(int i = 1; i <= n; i++) {
		int x;
		cin >> x;
		modify(i, x);
	}
	for(int i = 1; i <= m; i++) {
		int ord, x, y;
		cin >> ord >> x >> y;
		if(ord == 1) {
			modify(x, y);
		} else {
			cout << query(y) - query(x - 1) << endl;
		}
	}
return 0;
}

```

# [【模板】线段树 2](https://www.luogu.org/problem/P3373)
## 区间加法乘法+取模求和

```cpp
#include <iostream>
#include <cstdio>
#include <cstring>
#include <cmath>
#include <cstdlib>
#include <algorithm>
using namespace std;
const int N = 1e5 + 1;
typedef long long lld;
int n, p, m;
lld sum[N << 2], plutag[N << 2], multag[N << 2];
void pushup(int u)
{
	sum[u] = sum[u << 1] + sum[u << 1 | 1];
	sum[u] %= p;
}
void build(int u, int l, int r) {
	multag[u] = 1;
	if(l == r) {
		cin >> sum[u];
		sum[u] %= p;
		return;
	}
	int mid = l + r >> 1;
	build(u << 1, l, mid);
	build(u << 1 | 1, mid + 1, r);
	pushup(u);
}
void pushdown(int u, int m) 
{
	if(multag[u] == 1 && plutag[u] == 0)
		return;
	sum[u << 1] = (sum[u << 1] * multag[u] + (m - (m >> 1)) * plutag[u]) % p;
	sum[u << 1 | 1] = (sum[u << 1 | 1] * multag[u] + (m >> 1) * plutag[u]) % p;
	multag[u << 1] = (multag[u << 1] * multag[u]) % p;
	multag[u << 1 | 1] = (multag[u << 1 | 1] * multag[u]) % p;
	plutag[u << 1] = (plutag[u << 1] * multag[u] + plutag[u]) % p;
	plutag[u << 1 | 1] = (plutag[u << 1 | 1] * multag[u] + plutag[u]) % p;
	multag[u] = 1;
	plutag[u] = 0;
}
void pludate(int u, int l, int r, lld x)
{
	plutag[u] = (plutag[u] + x) % p;
	sum[u] = (sum[u] + x * (r - l + 1)) % p;
}
void muldate(int u, int l, int r, lld x)
{
	sum[u] = (sum[u] * x) % p;
	multag[u] = (multag[u] * x) % p;
	plutag[u] = (plutag[u] * x) % p;
}
void plu(int u, int ul, int ur, int ml ,int mr, int x) 
{
	if(ml <= ul && mr >= ur) {
		pludate(u, ul, ur, x);
		return;
	}
	pushdown(u, ur - ul + 1);
	int mid = ul + ur >> 1;
	if(ml <= mid) 
		plu(u << 1, ul, mid, ml, mr, x);
	if(mid + 1 <= mr) 
		plu(u << 1 | 1, mid + 1, ur, ml, mr, x);
	pushup(u);
}
void mul(int u, int ul, int ur, int ml, int mr, int x)
{
	if(ml <= ul && mr >= ur) {
		muldate(u, ul, ur, x);
		return;
	}
	pushdown(u, ur - ul + 1);
	int mid = ul + ur >> 1;
	if(ml <= mid)
		mul(u << 1, ul, mid, ml, mr, x);
	if(mid + 1 <= mr)
		mul(u << 1 | 1, mid + 1, ur, ml, mr, x);
	pushup(u);
}
lld query(int u, int ul, int ur, int ml, int mr)
{
	if(ml <= ul && mr >= ur) {
		return sum[u];
	}
	pushdown(u, ur - ul + 1);
	int mid = ul + ur >> 1;
	lld s = 0;
	if(ml <= mid) {
		s += query(u << 1, ul, mid, ml, mr);
		s %= p;
	}	
	if(mr >= mid + 1) {
		s += query(u << 1 | 1, mid + 1, ur, ml, mr);
		s %= p;
	}
	return s;
}
int main()
{
	cin >> n >> m >> p;
	build(1, 1, n);
	while(m--) {
		int ord, a, b;
		lld c;
		cin >> ord >> a >> b;
		if(ord == 1) {
			cin >> c;
			mul(1, 1, n, a, b, c);
		} else if(ord == 2) {
			cin >> c;
			plu(1, 1, n, a, b, c);
		} else {
			cout << (lld) query(1, 1, n, a, b) << endl;
		}
	}
return 0;
}

```

# [【模板】树状数组 2](https://www.luogu.org/problem/P3368)
## 区间加法+单点求和

```cpp
#include <iostream>
#include <cstdio>
#include <cstring>
#include <cmath>
#include <cstdlib>
#include <algorithm>
using namespace std;
typedef long long lld;
const int N = 5e5 + 9;
int n, m;
lld a[N], d[N], id[N];
int lowbit(int x)
{
	return x & (-x);
}
void modify(lld *t, int i, lld x)
{
	while(i <= n) {
		t[i] += x;
		i += lowbit(i);
	}
}
lld query(lld *t, int i)
{
	lld sum = 0;
	while(i) {
		sum += t[i];
		i -= lowbit(i);
	}
	return sum;
}
lld q(int r)
{
	return (lld)query(d, r) * (r + 1) - query(id, r);
}
int main()
{
	cin >> n >> m;
	for(int i = 1;i <= n; i ++) {
		cin >> a[i];
		modify(d, i, a[i] - a[i - 1]);
		modify(id, i, i * (a[i] - a[i - 1]));
	}
	while(m--) {
		lld opt, x, y, z;
		cin >> opt >> x;
		if(opt == 1) {
			cin >> y >> z;
			modify(d, x, z);
			modify(id, x, x * z);
			modify(d, y + 1, -z);
			modify(id, y + 1, (y + 1) *(-z));
		} else {
			cout << (lld)q(x) - q(x - 1) << endl;
		}
	}
return 0;
}
```