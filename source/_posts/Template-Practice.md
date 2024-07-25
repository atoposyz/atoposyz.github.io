---
title: 模板练习
date: 2019-10-30 19:38:34
updated: 2019-10-30 19:38:34
katex: true
categories:
  - 笔记
---

![](https://cdn.luogu.com.cn/upload/image_hosting/v8msk1oq.png)

## 拓扑排序

### [发糖果](http://oj.ipoweru.cn/problem/23300)

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

## 数论

### [洛谷P1082](https://www.luogu.org/problem/P1082)

```cpp
#include <iostream>
#include <cstdio>
#include <cstring>
#include <cmath>
#include <cstdlib>
#include <algorithm>
using namespace std;
int exgcd(int a, int b, int &x, int &y)
{
	if(b == 0) {
		x = 1, y = 0;
		return a;
	}
	int ret = exgcd(b, a % b, x, y);
	int temp = x;
	x = y;
	y = temp - a / b * y;
	return ret;
}
int main()
{
	int a, b, x, y;
	cin >> a >> b;
	int ret = exgcd(a, b, x, y);
	x = (x % b + b) % b;
	cout << x;
return 0;
}

```

## [乘法逆元](https://www.luogu.org/problem/P3811)

