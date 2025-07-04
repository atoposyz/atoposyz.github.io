---
title: 树的遍历——DFS与BFS
date: 2019-08-28 16:45:21
updated: 2019-08-28 16:45:21
katex: true
tags:
  - 树
categories:
  - 题解
---

## A.树的遍历

### 题目描述

给定一棵 $n$ 个节点的无根树（节点编号 $0$ 至 $n-1$）和一个节点$x$，请以 $x$ 号节点为根，做一次 **DFS** 与一次 **BFS**。

### 输入格式

从标准输入读入数据。

第一行输入一个正整数 $n$（$1 \leq n \leq 200000$），代表这棵树的节点数目。

接下来 $ n-1 $ 行（行编号从 $ 1 $ 至 $ n-1 $），第 $i$ 行输入一个正整数 $ a_i $（$ 0 \leq a_i \leq i $），代表第 $i$ 个节点与第 $ a_i $ 个节点之间连有一条边。

最后一行输入 $ x $（$ 0 \leq x < n $），代表根节点编号。

### 输出格式

输出到标准输出。

输出 $ 2 $ 行，每行 $ n $ 个数，第 $ 1 $ 行代表 **DFS** 序，第 $ 2 $ 行代表 **BFS** 序。

**注意：如果一个节点有多个儿子，那么应按照儿子编号递减的顺序去遍历。**

### 样例1输入

```
7
0
1
0
0
1
4
1
```

### 样例1输出

```
1 5 2 0 4 6 3 
1 5 2 0 4 3 6 
```

解：

```cpp
#include <iostream>
#include <cstdio>
#include <cstring>
#include <cmath>
#include <cstdlib>
#include <algorithm>
#include <vector>
using namespace std;
vector<int> to[200005];
int n,a,vis[200005],q[200005],start;
int cmp(int b,int c)
{
	return b>c;
}
void ad(int u,int v)
{
	to[u].push_back(v);
}
void dfs(int k)
{
	cout << k << ' ';
	for(int i=0;i<to[k].size();i++)
	{
		if(vis[to[k][i]]==0)
		{
			vis[to[k][i]]=1;
			dfs(to[k][i]);
		}
			
	}
}
void bfs(int k)
{
	int head=1,tail=1;
	q[tail]=k;
	tail++;
	while(head<tail)
	{
		int now=q[head];
		cout << now << " ";
		head++;
		for(int i=0;i<to[now].size();i++)
		{
			if(vis[to[now][i]]==0)
			{
				vis[to[now][i]]=1;
				q[tail]=to[now][i];
				tail++;
			}
		}
	}
}
int main()
{
	cin >> n;
	for(int i=1;i<=n-1;i++)
	{
		cin >> a;
		ad(a,i);
		ad(i,a);
	}
	cin >> start;
	for(int i=0;i<n;i++)
		sort(to[i].begin(),to[i].end(),cmp);
	/*for(int i=0;i<n;i++)
	{
		for(int j=0;j<to[i].size();j++)
		cout << to[i][j] << " ";
		cout << endl;
	}*/
   //对于有根树，将start换成根节点即可
	vis[start]=1;
	dfs(start);
	memset(vis,0,sizeof(vis));
	cout << endl;
	vis[start]=1;
	bfs(start);
return 0;
}

```

------------


## B.树的直径和中心

### 题目描述

给定一棵 $n$ 个节点的无根树（节点编号 $0$ 至 $n-1$），所有边长均为 $1$，求出该树的直径长度。

定义树的**中心**为距离树上所有节点距离的最大值最小的节点（一棵树的中心可能不止一个），输出该树的中心。

### 输入格式

从标准输入读入数据。

第一行输入一个正整数 $n$（$1 \leq n \leq 200000$），代表这棵树的节点数目。

接下来 $n-1$ 行（行编号从 $1$ 至 $n-1$），第 $i$ 行输入一个正整数 $a_i$（$0 \leq a_i <i$），代表第 $i$ 个节点与第 $a_i$ 个节点之间连有一条边。

### 输出格式

输出到标准输出。

输出 $2$ 行，第 $1$ 行一个整数，代表树的直径；第 $2$ 行按照编号递增顺序输出若干个整数，代表树的中心节点编号。

### 样例1输入

```
6
0
1
0
0
1
```

### 样例1输出

```
3
0 1 
```

解：

```cpp
#include <iostream>
#include <cstdio>
#include <cstring>
#include <cmath>
#include <cstdlib>
#include <algorithm>
#include <vector>
using namespace std;
vector<int> to[200005];
int n, a, vis[200005], q[200005], step[200005][2], head = 1, tail = 1, cen[3];
int cmp(int b, int c) { return b > c; }
void ad(int u, int v) { to[u].push_back(v); }
void bfs(int k) {
    head = 1;
    tail = 1;
    q[tail] = k;
    tail++;
    while (head < tail) {
        int now = q[head];
        head++;
        for (int i = 0; i < to[now].size(); i++) {
            if (vis[to[now][i]] == 0) {
                vis[to[now][i]] = 1;
                q[tail] = to[now][i];
                step[tail][0] = step[head - 1][0] + 1;
                step[tail][1] = head - 1;
                tail++;
            }
        }
    }
}
int main() {
    cin >> n;
    for (int i = 1; i <= n - 1; i++) {
        cin >> a;
        ad(a, i);
        ad(i, a);
    }
    for (int i = 0; i < n; i++) sort(to[i].begin(), to[i].end(), cmp);
    vis[0] = 1;
    bfs(0);
    int point = q[head - 1];
    memset(vis, 0, sizeof(vis));
    memset(step, 0, sizeof(step));
    vis[point] = 1;
    bfs(point);
    int lenth = step[tail - 1][0];
    cout << lenth << endl;
    if (lenth % 2 == 0) {
        for (int i = tail - 1; i > 0; i = step[i][1]) {
            if (step[i][0] == lenth / 2) {
                cen[1] = q[i];
                cout << cen[1] << endl;
                return 0;
            }
        }
    } else {
        for (int i = tail - 1; i > 0; i = step[i][1]) {
            if (step[i][0] == (lenth + 1) / 2) {
                cen[1] = q[i];
            }
            if (step[i][0] == (lenth - 1) / 2) {
                cen[2] = q[i];
                if (cen[2] < cen[1])
                    swap(cen[2], cen[1]);
                cout << cen[1] << " " << cen[2] << endl;
                return 0;
            }
        }
    }
}
```