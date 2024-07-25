---
title: 扩展欧几里得（exgcd模板）
date: 2019-11-08 21:54:00
update: 2019-11-08 21:54:00
katex: true
tags:
  - 数学
categories:
  - 题解
---

## [洛谷P1082](https://www.luogu.org/problem/P1082)
# Code
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