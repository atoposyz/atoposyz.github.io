---
title: 高斯消元
date: 2019-11-08 09:09:48
update: 2019-11-08 09:09:48
katex: true
tags:
  - 数学
categories:
  - 笔记
---

# 消元法及高斯消元法思想

## 消元法说明

消元法是将方程组中的一方程的未知数用含有另一未知数的代数式表示，并将其带入到另一方程中，这就消去了一未知数，得到一解；或将方程组中的一方程倍乘某个常数加到另外一方程中去，也可达到消去一未知数的母的。消元法主要用于二元一次方程组的求解。

例一：利用消元法求解二元一次线性方程组：

$$
\begin{aligned} 
4x+y & =100 \\
x-y&=100 \\
\end{aligned}
$$

解：将方程组中两方程相加，消元 $y$ 可得：

$5x = 200$

解得：

$x = 40$

将 $x = 40$ 代入方程组中第二个方程可得：

$y = -60$

## 消元法理论的核心

消元法理论的核心主要如下：

- 两方程互换，解不变；
- 一方程乘以非零数 $k$ ，解不变；
- 一方程乘以数 $k$ 加上另一方程，解不变。

## 高斯消元法思想概念

德国数学家高斯对消元法进行了思考分析，得出了如下结论：

- 在消元法中，参与计算和发生改变的是方程中各变量的系数；
- 各变量并未参与计算，且没有发生改变；
- 可以利用系数的位置表示变量，从而省略变量；
- 在计算中将变量简化省略，方程的解不变。

> 以上来自 $\Large\mathcal{OI-wiki}$


# 高斯消元的实现（二）


## 题目描述

令 $x = (x_1,x_2\cdots x_{m-1})$， $A_i=(a_{i,1},a_{i,2}\cdots a_{i,m-1})$（$1 \leq i \leq n$） 求线性方程组 $A_i\cdot x=a_{i,m}$（ $1\leq i\leq n$ ）在 $mod(10^9+7)$ 下的解。

## 输入格式

从标准输入读入数据。

输入共 $n+1$ 行。

第一行，两个正整数，表示 $n,m$（$1\leq n,m \leq 500$）。

剩下 行，每行 个整数，分别表示 $a_{i,1},a_{i,2}\cdots a_{i,m-1}$（$0\leq a_{i,j}\leq 2^{20}$） 。

## 输出格式

输出到标准输出。

第一行，输出解的个数信息，唯一解输出 `Unique solution.` ，无解输出 `No solution.` ，多于一组解输出 `Many Solutions.` 。

如果有唯一解，再输出 $m-1$ 行，每行一个整数，依次表示 $x_1,x_2\cdots x_{m-1}$（$0\leq x_i \leq 10^9+7$）。

## Code &  Explanation 


```cpp
#include <iostream>
#include <cstdio>
#include <cstring>
#include <cmath>
#include <cstdlib>
#include <algorithm>
using namespace std;

const int N = 505, M = 1e9 + 7;
typedef long long lld;
lld a[N][N], x[N];//a矩阵，x方程的解
int n, m;

lld qpow(lld a, lld b, lld q)//快速幂求逆元
{
	lld ans = 1;
	while(b)
	{
		if(b % 2)
		{
			ans = ans * a % q;
		}
		a = a * a % q;
		b /= 2;
	}
	return ans % q;
}

bool check()
{
	for(int i = n; i >= 1; i--) {
		for(int j = 1; j < m; j++) {
			if(a[i][j] != 0)
				return 1;//只要有系数，就一定有解 注2
		}
		if(a[i][m] != 0) 
			return 0;//如果没有一次项，但是有常数项，那一定无解
	}
}

int main()
{
	cin >> n >> m;
	for(int i = 1; i <= n; i++) 
		for(int j = 1; j <= m; j++) 
			scanf("%lld", &a[i][j]);//输入
    //-------------------------------------
	for(int i = 1; i <= m; i++) {
		lld num = 0;//找主元
		for(int j = i; j <= n; j++) {
            //找第i个主元只用从第i行开始找，因为上面的一定被处理好了
			if(a[j][i] != 0) {
				num = j;//找到一个就标下来
				break;
			}
		}
		if(num == 0)
			continue;//如果找不到，就到下一个主元去，并且将第i行入三角阵（别的行也行）
        //--------------------------------
		swap(a[i], a[num]);//将要入阵的行与当前第i行交换
		for(int j = i + 1; j <= n; j++) {
			lld r = (a[j][i] * qpow(a[i][i], M - 2, M)) % M;
            //r=a[j][i]/a[i][i],算出每一行对应主元系数的比值 注1
			for(int k = 1; k <= m; k++) 
				a[j][k] = ((a[j][k] - r * a[i][k]) % M + M) % M;
            //消去对应主元，更改系数
		}
	}
	if(check() == 0) {
		cout << "No solution.\n";
	} else {
		for(int i = 1; i < m; i++) {
			if(a[i][i] == 0) {
                //只要有一个三角阵的斜边上没有值，说明有自由元，即无穷解
				cout << "Many Solutions.\n";
				return 0;
			}
		}
		cout << "Unique solution.\n";
		for(int i = m - 1; i >= 1; i--) {
			x[i] = a[i][m];//先设解为常数项的相反数
			for(int j = i + 1; j <= m - 1; j++)
				x[i] = (x[i] - a[i][j] * x[j]) % M;//每次减去1，2...次项
			x[i] = (x[i] * qpow(a[i][i], M - 2, M)) % M;//系数化为一
			x[i] = (x[i] + M) % M;//模意义下最小正整数解
		}
		for(int i = 1; i < m; i++)
			cout << x[i] << "\n";//输出
	}
return 0;
}

```

### 注1

我们假设有如下方程$(\mod 5)$

$$
\begin{cases}
&3x_1+4x_2+5x_3=6\;\;\;\;\;\;(1)\\
&4x_1+1x_2+3x_3=7\;\;\;\;\;\;(2)\\
&2x_1+0x_2+1x_3=4\;\;\;\;\;\;(3)\\
&\;\;\;\;\;\;\;\;\;\;7x_2+6x_3=2\;\;\;\;\;\;(4)\\
\end{cases}
$$
用(1)消去其它方程

3的乘法逆元是2，相当于$\Large\frac{1}{3} \normalsize= 2\mod 5$ 

$3\times 2\equiv 1\mod 5$ 

(2)中 $x_1$ 系数是 $4$ ,即 (1) 中$x_1$ 系数的 $\Large\frac{4}{3}$ 倍

我们用 (2) $- \Large\frac{4}{3}$ (1)  来消去(2)的主元项，同理消(3)，(4)没有对应主元项，故保留

得到

$$
\left \{ 
\begin{array}{r}
3x_1+4x_2+5x_3&=6 &(1)\\ 
-x_2 +3x_3&=4 &(2)\\ 
-x_2+1x_3&=0&(3)\\
7x_2+6x_3&=2&(4)
\end{array}
\right.
$$

之后逐步消元

### 注2

#### (1)

我们考虑这样一个矩阵
$$
\begin{bmatrix}
  1&  1&  5&  6& 7\\
  0&  2&  4&  0& 4\\
  0&  0&  3&  1& 1\\
  0&  0&  0&  4& 4\\
  0&  0&  0&  0& 0
\end{bmatrix}
$$
十分标准的有一解情况

#### (2)

$$
\begin{bmatrix}
1&1&5&6&7\\
0&2&4&0&4\\
0&0&3&1&1\\
0&0&0&4&4\\
0&0&0&0&2\\
\end{bmatrix}
$$

遍历最后一行时，前 $m-1$ 个系数为 $0$，但是第 $m$ 个为 $2$ ，即一个方程只有一个常数项 $2$ 等于 $0$， 这是无解的