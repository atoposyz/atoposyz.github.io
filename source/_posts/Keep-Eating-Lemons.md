---
title: 我继续吃柠檬
date: 2019-08-27 17:42:41
update: 2019-08-27 17:42:41
katex: true
tags:
  - 二位偏序
  - 二分，分治
categories:
  - 题解
---

## [#22606. 我继续吃柠檬](http://oj.ipoweru.cn/problem/22606)

							                                         ————二维偏序

### 题目描述

柠檬树上有 n 颗柠檬，编号从 1 到 n，每一颗柠檬都具有美感 $a_i$ 和酸度 $b_i$ 两个属性。

现在我想从树上摘柠檬吃，设每颗柠檬能带给我的快乐值为 $e_i$，$e_i$ 等于除了柠檬 i 自身以外，美感和酸度均不大于柠檬 i 的柠檬数量，即：

$e_i=\sum_j1$，其中 $1\leq j \leq n$ 且 $i \neq j$ 且 $a_j \leq a_i$ 且 $b_j \leq b_i$。

请求出每颗柠檬能带给我的快乐值。

### 输入格式

从标准输入读入数据。

输入第一行是一个整数 n（$1 \leq n \leq 200000$），代表柠檬数量。

第二行是 n 个整数 $a_i$（$1 \leq a_i \leq 10^9$），代表每个柠檬的美感。

第三行是 n 个整数 $b_i$（$1 \leq b_i \leq 10^9$），代表每个柠檬的酸度。

### 输出格式

输出到标准输出。

输出 n 行，第 i 行为第 i 颗柠檬能带给我的快乐值。

### 样例1输入

```
12
9 10 6 1 3 11 2 7 8 4 12 5
12 4 1 3 6 11 7 2 5 10 8 9
```

### 样例1输出

```
8
3
0
0
1
9
1
1
3
3
7
3
```

解：

```cpp
#include <iostream>
#include <cstdio>
#include <cstring>
#include <cmath>
#include <cstdlib>
#include <algorithm>
using namespace std;
int n, ans[200005];
struct lemon {
    int by, sr, id, sm;
} ln[200005], t[200005];
int cmp(lemon a, lemon b) {
    if (a.by != b.by)
        return a.by < b.by;
    return a.sr < b.sr;
}
void mergesort(int l, int r) {
    int mid = l + (r - l) / 2;
    if (l == r)
        return;
    mergesort(l, mid);
    mergesort(mid + 1, r);
    int total = 0, cnt = 0;
    for (int i = l, j = mid + 1; i <= mid || j <= r;) {
        if (i <= mid && ln[i].sr <= ln[j].sr) {
            t[total++] = ln[i];
            cnt++;
            i++;
        } else {
            if (j > r && i <= mid) {
                t[total++] = ln[i];
                cnt++;
                i++;
            } else {
                ans[ln[j].id] += cnt;
                t[total++] = ln[j];
                j++;
            }
        }
    }
    for (int i = l; i <= r; i++) {
        ln[i] = t[i - l];
    }
}
int main() {
    cin >> n;
    for (int i = 1; i <= n; i++) cin >> ln[i].by;
    for (int i = 1; i <= n; i++) {
        cin >> ln[i].sr;
        ln[i].id = i;
    }
    sort(ln + 1, ln + 1 + n, cmp);
    for (int i = 1; i <= n; i++) {
        int num = 0;
        for (int j = i + 1; ln[j].by == ln[i].by && ln[j].sr == ln[i].sr; j++) {
            ln[i].sm++;
        }
        for (int j = i, mus = 0; j <= i + ln[i].sm, mus <= ln[i].sm; j++, mus++) {
            ans[ln[j].id] += ln[i].sm - mus;
        }

        i += ln[i].sm;
    }
    mergesort(1, n);
    for (int i = 1; i <= n; i++) cout << ans[i] << endl;
    return 0;
}
```