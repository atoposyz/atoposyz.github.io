---
title: 解方程
date: 2019-11-03 06:25:45
updated: 2019-11-03 06:25:45
katex: true
tags:
  - 数学
categories:
  - 题解
---

# [P2312 解方程]( https://www.luogu.org/problem/P2312 )

- ## 前置知识

1.  对于一个 $x$ 和模数 $p$，我们设 $x=kp+b$，则 $x≡b\,(\mod p)$，同时 $f(x)≡f(b)\,(\mod p)$ .

因此，我们得出如下结论： **在模p的情况下，$f(x)=0$ 的必要条件是 $f(x \mod p)=0$**. 在模数足够大或者对多个数取模的情况下，若 $f(x \mod p)=0$， 则 $f(x)=0$ 很大可能是成立的（类似于哈希表）

2. 秦九韶算法：

一般地，一元n次[多项式](https://baike.baidu.com/item/多项式)的求值需要经过 $(n+1)\times n \div 2$次[乘法](https://baike.baidu.com/item/乘法)和 $n$ 次[加法](https://baike.baidu.com/item/加法)，而秦九韶算法只需要 $n$次乘法和 $n$ 次加法。在人工计算时，一次大大简化了运算过程。 ——百度百科

把一个 $n$ 次多项式

<div>
$$
f(x) = a_0 + a_1x^1+…+a_{n-1}x^{n-1}+a_nx^n
$$
</div>

改写成下列形式
<div>
$$
\begin{aligned}
f(x) & = a_0 + a_1x+...+a_{n-1}x^{n-1}+a_nx^n \\
    & = a_nx^n+a_{n-1}x^{n-1}+...+ a_1x+a_0\\
    & = (a_nx^{n-1}+a_{n-1}x^{n-2}+...+a_2x+a_1)x+a_0\\
    & = ((a_nx^{n-2}+a_{n-1}x^{n-3}+...+a_3x+a_2)x+a_1)x+a_0\\
    & \vdots\\
    & = (...((a_nx+a_{n-1})x+a_{n-2})x+...+a_1)x+a_0
\end{aligned}
$$
</div>

```cpp
#include<bits/stdc++.h>
#define N 1001
using namespace std;
int n,x,a[N],mod;
int main()
{
int ans;
scanf("%d%d%d",&n,&x,&mod);
//n表示函数f(x)中x的最高次项,mod表示取模数;
for(int i=0;i<=n;i++)
    scanf("%d",&a[i]);
    //a[i]表示每一次项的系数;
ans=a[n];
for(int i=n-1;i>=0;i--) {
    ans=(ans*x+a[i])%mod;
//秦九韶算法主体，数学式为f(x)=(...((a[n]*x+a[n-1])*x+a[n-2])*x+...a[1])*x+a[0];
}
printf("%d",ans);
return 0;
}
```

- ## $\mathcal{Show\\;Time}$ 

先放代码

```cpp
#include <iostream>
#include <cstdio>
#include <cstring>
#include <cmath>
#include <cstdlib>
#include <algorithm>
using namespace std;
const int p1 = 1e9 + 7, p2 = 997, p3 = 9857933;
int a[101], b[101], c[101];
inline void read(int i)
{
    long long x = 0, f = 1, y = 0, z = 0;
    char ch = getchar();
    while(ch < '0' || ch > '9') {
        if(ch == '-') f = -1;
        ch = getchar();
    }
    while(ch >= '0' && ch <= '9') {
        x = (x * 10 + ch - '0') % p1;
    //对于取到的每一位都进行同一种操作，最后的结果很大概率是唯一的
    //		y = (y * 10 + ch - '0') % p2;
    //		z = (z * 10 + ch - '0') % p3;
        ch = getchar();
}
a[i] = x * f/*, b[i] = y * f, c[i] = z * f*/;
}
/*
本来应该多取几个模数的，但是取了三个结果WA了
很奇怪，然后这样只取一个模数才能对
*/
int n, m, sum, ans[101];
int main()
{
    cin >> n >> m;
    for(int i = 0; i <= n; i++) {
        read(i);
    }
    for(int i = 1; i <= m; i++) {
        long long ans1 = a[n] % p1, ans2 = b[n] % p2, ans3 = c[n] % p3;
        for(int j = n - 1; j >= 0; j--) {
            ans1 = (ans1 * i + a[j]) % p1;
                //秦九韶公式
    //			ans2 = (ans2 * i + a[j]) % p2;
    //			ans3 = (ans3 * i + a[j]) % p3;
        }
        if(ans1 == 0 /*&& ans2 == 0 && ans3 == 0*/) {
            sum++;
            ans[sum] = i;
        }
    }
    cout << sum << endl;
    for(int i = 1; i <= sum; i++) {
        cout << ans[i] << endl;
    }
    return 0;
}

```
