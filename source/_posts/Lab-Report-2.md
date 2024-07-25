---
title: 上机实验二解题报告
date: 2021-04-23 13:49:25
update: 2021-04-23 13:49:25
katex: true
tags:
  - 线性表
categories:
  - 题解
---

# 上机实验二解题报告

## T1数列查询

> 根据递推公式求 $f(n)$

本题需要多次查询数列项的值，因此不能每次从头开始查询，这会大大浪费时间

本题我在递归求解的过程中，将查询过的值存起来。当下一次需要这个值时可以直接调用，而不是递归求解。

```cpp
int num[1000005];
int f(int i)
{
	if(i <= 100004 && num[i]) return num[i];
	if(i <= 100004)
	return num[i] = f(i - 1) * 11 / 10;
	return f(i - 1) * 11 / 10;
}
```

> 此处因为查询的值在 $int$ 范围内，$num$ 数组存不下，所以我手动限制在了 $1e6$ 左右，不过很明显，数据并没有达到这么大，不然就会爆栈了

## T2稀疏矩阵之差

> 使用三元组计算两矩阵之差

三元组的存储不再赘述，按照课本来即可。

```cpp
typedef struct Node{
	int x, y, data;
}node;
node marx[100001];
```

本题关键是两个矩阵对应位置作差，有以下 $3$ 种情况

1. $A_{ij}!=0,B_{ij}!=0,A_{ij}-B_{ij}!=0$
2. $A_{ij}!=0,B_{ij}!=0,A_{ij}-B_{ij}==0$
3. $A_{ij}==0$

首先常规的读入

```cpp
scanf("%d%d%d", &h1, &l1, &tot1);
for(int i = 1; i <= tot1; i++) {
	scanf("%d%d%d", &marx[i].x, &marx[i].y, &marx[i].data);
	fnd[marx[i].x]++;
}
for(int i = 1; i <= h1; i++) {
	sum[i] = sum[i - 1] + fnd[i];
}
sort(marx + 1, marx + 1 + tot1, cmp);
```

> 为了查询方便，我计算每一行的非零元数量，并求出前 $n$ 行非零元总数，然后按照行优先进行排序

```cpp
bool cmp(node a, node b)
{
	//if(a.data == 0 && b.data != 0) return 1;
	if(a.x != b.x) return a.x < b.x;
	else return a.y < b.y;
}
```

> 在这里我本来想排序的时候如果有 $0$ 元时直接排到最前面/最后面，输出的时候可以直接跳过，但是这么写并不能把 $0$ 元素排出去，我上机时在这里浪费了大量时间

接下来进行简单的判断和读入第二个矩阵并进行减法，上述三种情况也在这里逐个解决

```cpp
scanf("%d%d%d", &h2, &l2, &tot2);
if(h1 != h2 || l1 != l2) {
	printf("Illegal!");
	return 0;
}
int x, y, z, flag;
for(int i = 1; i <= tot2; i++) {
	scanf("%d%d%d", &x, &y, &z);
	flag = 0;
	if(fnd[x] == 0) {
		tot1++;
		marx[tot1].x = x;
		marx[tot1].y = y;
		marx[tot1].data = 0 - z;
	} else {
		for(int j = sum[x - 1] + 1; j <= sum[x]; j++) {
			if(marx[j].y == y) {
				flag = 1;
				marx[j].data -= z;
				if(marx[j].data == 0) zero++;
				break;
			}
		}
		if(flag == 0) {
			tot1++;
			marx[tot1].x = x;
			marx[tot1].y = y;
			marx[tot1].data = -z;
		}
	}
}
```

> 如果 $fnd[x]$ 为 $0$ 的话，即对应第三种情况，那么直接将 $B_{ij}$ 取相反数加到 $marx$ 后面即可

> 如果第 $x$ 行有元素，那么遍历一遍，没有遍历到那依然是第三种情况；遍历到以后做减法，若答案为零，计数器 $zero$ 自加一次

最后一步，整理与输出

```cpp
sort(marx + 1, marx + 1 + tot1, cmp);
printf("%d %d %d\n", h1, l1, tot1 - zero);
for(int i = 1; i <= tot1; i++) {
	if(marx[i].data)
	printf("%d %d %d\n", marx[i].x, marx[i].y, marx[i].data);
}
```

> $sort$ 之后遍历一遍，遇到 $0$ 元素直接跳过

### 复杂度分析

在数据随机的情况下，本做法的平均时间复杂度为 $O(nlogn)$ ，当然，如果一个稀疏矩阵的元素都在同一行，那么时间复杂度会被卡成 $O(n^2)$ 

但是在实现上，本做法比其他同学的做法要简洁易懂许多

## T3 文字编辑

> 跳舞链的简单应用

~~这题可把我坑惨了，找遍整个程序怎么看怎么对，就是过不了...~~

本题可用链表做也可用静态链表做，静态链表更加简单

用两个数组分别存每一个字的前驱和后继，需要调换的时候先把原来的字拆下来，再安到新链上即可以下仅展示操作 $A$ ，操作 $B$ 同理

```cpp
if(ch == 'A') {
	ri[le[i]] = ri[i];
	le[ri[i]] = le[i];
	ri[le[j]] = i;
	ri[i] = j;
	le[i] = le[j];
	le[j] = i;
}
//ri,right.
//le,left.
```

## T4 幸福指数

$Inspired\;by$ $GGN\_2015$

> 单调栈的应用

> ~~当我会上周的单调队列时，发现还是不会这周的~~

> ~~这说明我会，但不完全会（逃~~

对于我来说，这道题的难度在于如何理解题意，即如何从题目出发找到正确的做法

> 对于一个位置 $i$ ，寻找该位置左边的第一个比他小的值和右边第一个比他小的值。

由于 $GGN\_2015$ 的分析及其复杂，我选择由结论倒推回去。

结论是左右第一个比他小的值，于是可以定义位置 $i$ 的值为 $x$ ，向左看，如果左边的值 $y\geq x$，那么 $y$ 一定在区间里，继续往左找，假如碰到一个 $y<x$ 了，那么就不能放进去了，因为一旦放进去，那么这个区间的最小值就不是 $x$ 而是 $y$ 了，右边同理。

于是这道题就顺利转化为求左边和右边第一个比 $x$ 小的值了，也就是维护两个单调递增的单调栈，找到最大的区间，相乘然后进行比较即可

完整代码如下，由于我是学习的 $GGN\_2015$ 的做法，因此实现过程与他大同小异

>  代码中的 `head` 与 `tail` 是我误把单调栈写成了单调队列，但是 `head` 并没有变化，因此还是可以认为是单调栈

```cpp
#include <cstdio>
#include <iostream>
using namespace std;
typedef long long lld;
int n, m, lans, rans;
lld day[100005], sum[100005], tmp, ans;
int le[100005], ri[100005];
int s[100005], head, tail;
int main() {
	scanf("%d", &n);
	for(int i = 1; i <= n; i++) {
		scanf("%lld", day + i);
		sum[i] = sum[i - 1] + day[i];
	}
	day[0] = day[n + 1] = -1e9-7;
	ans = day[1];
	lans = rans = 1;
    /******以下找左边******/
	s[1] = 0;	//可不写，主要为便于理解
	head = 1, tail = 2;
	for(int i = 1; i <= n; i++) {
		while(tail > head && day[s[tail - 1]] >= day[i]) tail--;
		le[i] = s[tail - 1];
		s[tail++] = i;
	}
    /******以下找右边******/
	s[1] = n + 1;
	head = 1, tail = 2;
	for(int i = n; i >= 1; i--) {
		while(tail > head && day[s[tail - 1]] >= day[i]) tail--;
		ri[i] = s[tail - 1];
		s[tail++] = i;
	}
    /******寻找最大的ans******/
	for(int i = 1; i <= n; i++) {
		tmp = sum[ri[i] - 1] - sum[le[i]];
		tmp *= day[i];
		if(tmp > ans) {
			ans = tmp;
			lans = le[i] + 1;
			rans = ri[i] - 1;
		} else if(tmp == ans) {
			if(rans - lans < ri[i] - le[i] - 2) {
				ans = tmp;
				lans = le[i] + 1;
				rans = ri[i] - 1;
			} else if(rans - lans == ri[i] - le[i] - 2 && le[i] + 1 < lans) {
				lans = le[i] + 1;
				rans = ri[i] - 1;
			}
		}
	}
	printf("%lld\n%d %d", ans, lans, rans);
	return 0;
}

```

