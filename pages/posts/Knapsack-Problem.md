---
title: 背包问题
date: 2019-08-27 19:16:24
updated: 2019-08-27 19:16:24
katex: true
tags:
  - 动态规划
categories:
  - 题解
---

## [多重背包](http://codevs.cn/problem/5429/)

**题目描述 Description**

你有一个容量为 $M$ 的背包，和 $N$ 种物品。

每种物品都有三个属性，$v_i,w_i,c_i$，分别表示这种物品的体积、价值和件数。

你的任务是，从这些所给物品中，选出若干件，其体积之和不能超过背包容量，并且使所选物品的权值的和最大。

**输入描述 Input Description**

第一行两个整数$N,M$

接下来 $N$ 行每行三个数$v_i,w_i,c_i$描述第 $i$ 件物品的属性

**输出描述 Output Description**

最大的权值和

**样例输入 Sample Input**

```
2 8
2 100 4
4 100 2
````

**样例输出 Sample Output**

````
400
````

**数据范围及提示 Data Size & Hint**

对于20%的数据，$c_i=1$

对于60%的数据，$N,M \leq 500,c_i \leq 100$

对于90%的数据，$N,M \leq 3000$

对于100%的数据 , $N,M \leq 7000,c_i \leq 5000$，保证答案不超过 $2147483647$

- **tip:**

- **有多重背包的题目，数组一定要开大！！！！！！**

- 不然会 WA 而不是 RE .

题解1：

```cpp
int n,m,tot;
int f[7010],p[100010],v[100010],w[100010];
int main()
{
	cin >> n >> m;
	for(int i=1; i<=n; i++)
		cin >> w[i] >> v[i] >> p[i];
	for(int i = 1; i <= n; i++) {
		int num = min(p[i], m / w[i]);
		for(int k = 1; num > 0; k <<= 1) {
			if (k > num) k = num;
			num -= k;
			for(int j = m; j >= w[i] * k; j--)
				f[j] = max(f[j], f[j - w[i] * k] + v[i] * k);
		}
	}
	cout << f[m];
```

题解2：

```cpp
int n,m,tot;
int f[7010],c[100010],v[100010];
int main() 
{
	cin >> n >> m;
	for(int i=1;i<=n;i++) {
		int x,y,z;
		cin >> x >> y >> z;
		int base=1;
		while(z>=base) {
			c[++tot]=x*base;
			v[tot]=y*base;
			z-=base;
			base<<=1;
		}
		if(z>0) {
			c[++tot]=z*x;
			v[tot]=z*y;
		}
	}
	for(int i=1;i<=tot;i++)
		for(int j=m;j>=c[i];j--)
			f[j]=max(f[j],f[j-c[i]]+v[i]);
	cout << f[m];
```


------------


## 混合背包

**题目描述**

有 $n$ 种物品和一个容量是 $m$ 的背包。

物品一共有三类：

- 第一类物品只能用 $1$ 次（$01$ 背包）；
- 第二类物品可以用无限次（完全背包）；
- 第三类物品最多只能用 $s_i$ 次（多重背包）。

每种物品体积是 $w_i$，价值是 $v_i$。求解将哪些物品装入背包，可使物品体积总和不超过背包容量，且价值总和最大。输出最大价值。

**输入格式**

从标准输入读入数据。

第一行两个整数 $n$ 和 $m$（$0 \leq v_i,w_i \leq 1000$），用空格隔开，分别表示物品种数和背包容积。

接下来有 $n$ 行，每行三个整数 $w_i,v_i$（$0 \leq w_i,v_i \leq 1000$）和 $s_i$（$-1 \leq s_i \leq 1000$），用空格隔开，分别表示第 $i$ 种物品的体积、价值和数量。

- $s_i = -1$ 表示第 $i$ 种物品只能用 $1$ 次；
- $s_i = 0$ 表示第 $i$ 种物品可以用无限次；
- $s_i > 0$ 表示第 $i$ 种物品可以使用 $s_i$ 次。
 
**输出格式**

输出到标准输出。

输出一个整数，表示最大价值。

**样例1输入**

```
4 5
1 2 -1
2 4 1
3 4 0
4 5 2
```

**样例1输出**

```
8
```

题解：

```cpp
int n,m,v[10000],w[10000],s[10000],a,b,c,f[10000];
int main()
{
	int num=1;
	cin >> n >> m;
	for(int i=1;i<=n;i++)
	{
		cin >> a >> b >> c;
		if(c>0)
		{
			int base = 1;
			while(c>=base)
			{
				w[num]=a*base;
				v[num]=b*base;
				s[num++]=-1;
				c-=base;
				base*=2;
			}
			if(c>0)
			{
				w[num]=a*c;
				v[num]=b*c;
				s[num++]=-1;
			}
		}
		else
		{
			w[num]=a;
			v[num]=b;
			s[num++]=c;
		}
	}
	for(int i=1;i<=num-1;i++)
	{
		if(s[i]==0)
		{
			for(int j=w[i];j<=m;j++)
				f[j]=max(f[j-w[i]]+v[i],f[j]);
		}
		else 
		{
			for(int j=m;j>=w[i];j--)
				f[j]=max(f[j-w[i]]+v[i],f[j]);
		}
	}
	cout << f[m];
```