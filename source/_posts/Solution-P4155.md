---
title: 题解 P4155 【[SCOI2015]国旗计划】
date: 2019-08-30 11:38:08
updated: 2019-08-30 11:38:08
katex: true
tags:
  - 倍增
  - 二分
categories:
  - 题解
---

被老师布置作业的我（蒟蒻）无助地翻开题解，只见大佬们又是`template`又是`namespace`的，看得我一脸懵，被迫学习了一篇`CSDN`的题解，现说一说些微的体会来加深~~自己的~~印象

本文灵感来自于[CSDN @jerome_wei](https://blog.csdn.net/qq_35923186/article/details/83066690)

# ·
首先环上的问题我们一般改成链来做，其主要方法是输入完数据后再复制一遍加到原数组后面

![](https://cdn.luogu.com.cn/upload/pic/75739.png)

###### （背景颜色#66CCFF）

另外我们使用struct定义每个士兵的编号以及奔袭区间

```cpp
struct soldier {
	int id, l, r;
} s[400005];
```

```cpp
cin >> n >> m;
for(int i = 1; i <= n; i++) {
	cin >> s[i].l >> s[i].r;
	if(s[i].r < s[i].l)
		s[i].r += m;
	s[i].id = i;
}
sort(s + 1, s + 1 + n, cmp);
for(int i = 1; i <= n; i++) {//此处即复制过程
	s[i + n] = s[i];
	s[i + n].l = s[i].l + m;
	s[i + n].r = s[i].r + m;
}
```

关于上文中的**sort**

因为每个士兵的奔袭区间不会被完全包含，所以我们按照每位士兵的区间左端点由小到大排序，就可以得到单调递增的区间

# ·

接下来我们想要去寻找每个士兵能奔袭的最远的边防站使得最少的士兵需要奔袭

这句话可能比较难理解，我们使用样例做出解释

![](https://cdn.luogu.com.cn/upload/pic/75742.png)

图比较糙……假如我们的战士从4到7，另一名战士从7到3，那么那名从6到1的战士就不必参加，因此我们想到可以枚举每个区间内的战士，但是这样的复杂度是不能接受的，我们需要更快的时间，因此——

### 倍增！


# ·
我们预处理每名战士

从一名战士开始，一直到某一名战士的左端点大于这名战士的右端点，那么这名战士区间内奔袭过的最远的战士找到了

我们设$f(i, j)$表示第 $i$ 个战士奔袭 $2^j$ 步到达的边防站（表达不是很清楚，请读者自行感受）

方程为

## $f(i,j)=f[f(i,j-1),j-1]$

因为 $2^{20}=2^{10}\times2^{10}=1000\times1000=1000000$ 这大小应该够用了，所以我们从19开始遍历

```cpp
void pre()
{
	for(int i = 1, p = i; i <= 2 * n; i++) {
		while(p <= 2 * n && s[p].l <= s[i].r)
			p++;
		int pos = p - 1;
		go[i][0] = pos;
	}
	for(int i = 1; i < 20; i++) {//这两个for循环顺序一定不能换！！！！
		for(int j = 1; j <= 2 * n; j++) {
			go[j][i] = go[go[j][i - 1]][i - 1];
		}
	}
}
```

# ·
预处理完了后，我们就开始搜索（~~找不到合适的名字~~）了

lmt->limit 限制区间长度，ans 从 $2^0$ 开始，p 记录 k

i 从 19 开始向下遍历，如果符合条件，即使 ans+=$2^i$

然后更新k

最后记录答案（别忘了加上他自己）

```cpp
void search(int k)
{
	int lmt = s[k].l + m, ans = 1, p = k;
	for(int i = 19; i >= 0; i--) {
		if(go[k][i] != 0 && s[go[k][i]].r < lmt) {
			ans += (1 << i);
			k = go[k][i];
		}
	}
	res[s[p].id] = ans + 1;
}
```

# ·
完整代码如下，说实话后半部分我自己理解得也不是很透彻，可能有诸多错误，还请大佬指出

```cpp
#include <iostream>
#include <cstdio>
#include <cstring>
#include <cmath>
#include <cstdlib>
#include <algorithm>
using namespace std;
int n, m, res[200005];
struct soldier {
	int id, l, r;
} s[400005];
int cmp(soldier a, soldier b)
{
	return a.l < b.l; 
}

int go[400005][20];

void pre()
{
	for(int i = 1, p = i; i <= 2 * n; i++) {
		while(p <= 2 * n && s[p].l <= s[i].r)
			p++;
		int pos = p - 1;
		go[i][0] = pos;
	}
	for(int i = 1; i < 20; i++) {
		for(int j = 1; j <= 2 * n; j++) {
			go[j][i] = go[go[j][i - 1]][i - 1];
		}
	}
}
void search(int k)
{
	int lmt = s[k].l + m, ans = 1, p = k;
	for(int i = 19; i >= 0; i--) {
		if(go[k][i] != 0 && s[go[k][i]].r < lmt) {
			ans += (1 << i);
			k = go[k][i];
		}
	}
	res[s[p].id] = ans + 1;
}
int main()
{
	cin >> n >> m;
	for(int i = 1; i <= n; i++) {
		cin >> s[i].l >> s[i].r;
		if(s[i].r < s[i].l)
			s[i].r += m;
		s[i].id = i;
	}
	sort(s + 1, s + 1 + n, cmp);
	for(int i = 1; i <= n; i++) {
		s[i + n] = s[i];
		s[i + n].l = s[i].l + m;
		s[i + n].r = s[i].r + m;
	}
	pre();
	for(int i = 1; i <= n; i++)
		search(i);
	for(int i = 1; i <= n; i++)
		cout << res[i] << " ";
	return 0;
}

```