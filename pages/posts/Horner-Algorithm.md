---
title: 秦九韶算法
date: 2019-11-01 21:54:15
updated: 2019-11-01 21:54:15
katex: true
tags:
  - 数学
categories:
  - 笔记
---

```cpp
#include<bits/stdc++.h>
#define N 1001
using namespace std;
int n,x,a[N],mod;
int main()
{
  int ans;
  scanf("%d%d%d",&n,&x,&mod);//n表示函数f(x)中x的最高次项,mod表示取模数;
  for(int i=0;i<=n;i++)
    scanf("%d",&a[i]);//a[i]表示每一次项的系数;
  ans=a[n];
  for(int i=n-1;i>=0;i--)
    {
      ans=(ans*x+a[i])%mod;
      //秦九韶算法主体，数学式为f(x)=(...((a[n]*x+a[n-1])*x+a[n-2])*x+...a[1])*x+a[0];
    }
  printf("%d",ans);
  return 0;
}
```

实例：

[解方程](https://xuanfly.blog.luogu.org/Solving-Equations)