---
title: Xuan_Fly Loves Math
date: 2019-11-05 18:47:11
update: 2019-11-05 18:47:11
katex: true
tags:
  - 分支程序结构
categories:
  - 题解
---

标程如下：
```cpp
#include<bits/stdc++.h>
#define ll long long
using namespace std;
ll a,b;
double a1,b1,c1;
double deal(double a,double b,char ch){
	if(ch=='*') return a*b;
	if(ch=='/') return a/b;
	if(ch=='+') return a+b;
	return a-b;
}
int main()
{
	int n;
	//freopen("cal1.in","r",stdin);
	//freopen("out.txt","w",stdout);
	scanf("%d",&n);
		char ch,ch1,ch2;
		for(int i=1;i<=n;i++)	
		{
			ll ans;
			scanf("%lld%c%lld",&a,&ch,&b);
			if(ch=='+') ans=a+b;
			else if(ch=='-') ans=a-b;
			else if(ch=='*') ans=a*b;
			else if(ch=='/') 
			ans=a/b;	
			
			else if(ch=='%') ans=a%b;
			else if(ch=='^') ans=pow(a,b);
			if(ch=='*'||ch=='^') ans=(ans%1000000007+1000000007)%1000000007;
			printf("%lld\n",ans);
		}
		for(int i=1;i<=n;i++){
			double ans;
			scanf("%lf %c %lf %c %lf",&a1,&ch1,&b1,&ch2,&c1);
			if((ch1=='+'||ch1=='-')&&(ch2=='*'||ch2=='/')) {
				ans=deal(b1,c1,ch2);
				ans=deal(a1,ans,ch1);
			}
			else {
				ans=deal(a1,b1,ch1);
				ans=deal(ans,c1,ch2);
			}
			if(fabs(ans)<0.005) ans=0;
			if(ans)
			printf("%.2lf\n",ans);
			else printf("0.00\n");
		}
}
```

来自：$\mathcal{FYQ}$

另有本人的程序：
```cpp
#include <iostream>
#include <cstdio>
#include <cstring>
#include <iomanip>
#include <algorithm>
#include <cmath>
using namespace std;
int n;
int main()
{
//	freopen("cal10.in", "r", stdin);
//	freopen("cal10.out", "w", stdout);
	cin >> n;
	for(int i = 1; i <= n; i++) {
		long long a, b, e;
		char d;
		double c;
		cin >> a >> d >> b;
		if(d == '/') 
			printf("%lld\n", a / b);
		if(d == '+')
			printf("%lld\n", a + b);
		if(d == '-')
			printf("%lld\n", a - b);
		if(d == '*') {
			e = a * b;
			e = (e % 1000000007 + 1000000007) % 1000000007;
			printf("%lld\n", e);
		}
		if(d == '%')
			printf("%lld\n", a % b);
		if(d == '^') {
			c = pow(a, b);
			e = (long long)c;
			e %= 1000000007;
			printf("%lld\n", e);
		}
	}
	for(int i = 1; i <= n; i++) {
		double a, b, c, ans;
		char d, e;
		cin >> a >> d >> b >> e >> c;
		if(d=='+'&&e=='+')
			ans = a + b + c;
		else if(d=='+'&&e=='-')
			ans = a + b - c;
		else if(d=='+'&&e=='*')
			ans = a + b * c;
		else if(d=='+'&&e=='/')
			ans = a + b / c;
		else if(d=='-'&&e=='+')
			ans = a - b + c;
		else if(d=='-'&&e=='-')
			ans = a - b - c;
		else if(d=='-'&&e=='*')
			ans = a - b * c;
		else if(d=='-'&&e=='/')
			ans = a - b / c;
		else if(d=='*'&&e=='+')
			ans = a * b + c;
		else if(d=='*'&&e=='-')
			ans = a * b - c;
		else if(d=='*'&&e=='*')
			ans = a * b * c;
		else if(d=='*'&&e=='/')
			ans = a * b / c;
		else if(d=='/'&&e=='+')
			ans = a / b + c;
		else if(d=='/'&&e=='-')
			ans = a / b - c;
		else if(d=='/'&&e=='*')
			ans = a / b * c;
		else if(d=='/'&&e=='/')
			ans = a / b / c;
		if(ans >= -0.005 && ans < 0.00)
			ans = -1 * ans;
		if(ans == -0.00)
			ans = 0.00;
		printf("%.2f\n", ans);
	}
	return 0;
}
```

请自主选择好理解的程序阅读