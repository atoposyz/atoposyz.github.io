---
title: 错误集锦
date: 2019-09-12 21:24:26
update: 2019-09-12 21:24:26
katex: true
categories:
  - 题解
---

# [发糖果](http://oj.ipoweru.cn/problem/23300)

```cpp
	while(hd < tail) {
		int u = q[hd++];
		for(int i = head[u]; i; i = e[i].next) {
			int v = e[i].to;
			in[v]--;
			if(in[v] == 0) {
				buy[v] = buy[u] + 1;
				q[tail] = v;
				tail++;
				sum++;
			}
		}
	}

```

误打成

```cpp
	while(hd < tail) {
		int u = q[hd++];
		for(int i = head[u]; i; i = e[i].next) {
			int v = e[u].to;
			in[v]--;
			if(in[v] == 0) {
				buy[v] = buy[u] + 1;
				q[tail] = v;
				tail++;
				sum++;
			}
		}
	}
```

****

# [商旅计划](http://oj.ipoweru.cn/problem/23313)

```cpp
struct edge {
	int to, next;
}e[2000005];
```

e[200005]少打了一个 0

****

# [P2047 [NOI2007]社交网络](https://www.luogu.org/problem/P2047)


对于 50% 的数据， $n \le 10 , m \le 45$。

对于 100% 的数据， $n \le 100 , m \le 4500$ ，任意一条边的权值 c 是正整数且 $1 \leqslant c \leqslant 1000$ 。

所有数据中保证给出的无向图连通，且任意两个结点之间的最短路径数目不超过 $10^{10}$。

$10^{10}$要用 `long long`。

应用

```cpp
long long sum[101][101];
```

# [AC Challenge](http://oj.ipoweru.cn/problem/24103)

误将 `|` 打成 `&`

```cpp
int sn = s | (1 << (i - 1));
```

hh真扎心

# [互不侵犯King](http://oj.ipoweru.cn/problem/24104)

```cpp
long long f(int i, int j, int k, int s)
{
	long long r = 0;
	if(vis[i][j][k][s])
		return ans[i][j][k][s];
   ...
```

应该`long long r = 0;`

因为每次都要用新的 r ，但是目前还不知道为什么不能定义全局变量 r ，只能重新定义。

# [Mondriaan's Dream](http://oj.ipoweru.cn/problem/24105)

```cpp
if(j < w && (((1 << j) & s) == 0) && i > 0)
```

不知道优先级一定要加括号！！！

特别是位运算！！！！！

# [旅行商问题2](http://oj.ipoweru.cn/problem/24102)

```cpp
for(int s = 1; s <= pow3[n] - 1; s++) {
		for(int i = 0; i < n; i++) {
			if((s / pow3[i]) % 3 == 2) continue;
			for(int j = 0; j < n; j++) {
				if(i == j) continue;
				f[i][s + pow3[i]] = min(f[i][s + pow3[i]], f[j][s] + map[j][i]);
			}
		}
	}
```

或者

```cpp
for(int s = 1; s <= pow3[n] - 1; s++) {
		for(int i = 0; i < n; i++) {
			for(int j = 0; j < n; j++) {
				if(i == j) continue;
				if(f[j][s] == 0x3f3f3f3f) continue;
				if((s / pow3[j]) % 3 < 2)
					f[j][s + pow3[j]] = min(f[j][s + pow3[j]], f[i][s] + map[i][j]);
			}
		}
	}
```

前者是填表法，后者是刷表法

判断的位置及状态转移方程自行体会

# [mixup2 混乱的奶牛](http://oj.ipoweru.cn/problem/24113)/[奶牛混合起来Mixed Up Cows](https://www.luogu.org/problem/P2915)

```cpp
long long f[(1 << 16) + 1][16], ans;
int main()
{
	cin >> n >> k;
	for(int i = 0; i < n; i++)
		cin >> a[i];
	for(int i = 0; i < n; i++)
		f[1 << i][i] = 1;
	for(int i = 1; i < (1 << n); i++) {
		for(int j = 0; j < n; j++) {
			if((i & (1 << j)) == 0) 
				continue;
			if(f[i][j]) 
				continue;
			int s = i & ~(1 << j);
			for(int u = 0; u < n; u++) {
				if((i & (1 << u)) == 0) 
					continue;
				if(abs(a[j] - a[u]) > k)
				f[i][j] += f[s][u];
			}
		}
	}
	for(int i = 0; i < n; i++)
		ans += f[(1 << n) - 1][i];
	cout << ans;
return 0;
}
```

`long long f[(1 << 16) - 1][16]` 正好小1

23333

中间判断`if(f[i][j])`打成`if(f[j][i])`

# [Apple Tree 2](http://oj.ipoweru.cn/problem/24209)

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

# [跳石头](http://oj.ipoweru.cn/problem/22603)

题目中这样一句话

$0 \leq M \leq N \leq 50000$

我的程序中


```cpp
const int N = 50000;
```

hh正好小1

以后一定要多开一点

`50005` 啊什么的

# [P2668 斗地主](https://www.luogu.org/problem/P2668)

打暴力都能错

多组数据你竟然不memset

# [食物链](https://www.luogu.org/problem/P2024)

- 使用并查集一定要初始化