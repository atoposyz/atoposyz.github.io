---
title: Huffman-Zip
date: 2021-07-25 22:37:41
updated: 2021-07-25 22:37:41
katex: true
tags:
  - 哈夫曼树
categories:
  - 笔记
---

```cpp
#include <cstdio>
#include <cstring>
#include <string>
#include <queue>
#include <vector>
#include <map>
#include <windows.h>
using namespace std;
const char SUFFIX[] = ".myz", TXT[] = ".txt";
const int N = 1e5 + 7, M = 5005;
FILE *fp, *fw;
char str[M], words[N];
struct Huff{
	char val;
	int cnt, left, right;
}huff[M];
struct cmp{
	bool operator()(int A, int B) {
		return huff[A].cnt > huff[B].cnt;
	}
};
priority_queue<int, vector<int>, cmp>q;
map<string, char>uzp;
map<char, string>zp;

void init()
{
	char ch = 0;
	int tot = 0;
	ch = getchar();
	while(ch == '\n')
		ch = getchar();
	while(ch != '\n') {
		str[tot++] = ch;
	ch = getchar();
	}
}

int judge()
{
	int len = strlen(str);
	char format[5] = {0};
	for(int i = len - 1; i >= len - 4; i--) {
		format[4 - len + i] = str[i];
	}
	if(strcmp(format, TXT) == 0) {
		return 0;
	} else if(strcmp(format, SUFFIX) == 0) {
		return 1;
	} else {
		return 2;
	}
}

bool huff_write(int root, string path)
{
	if(!huff[root].left && !huff[root].right) {
		fprintf(fw, "%c%s ", huff[root].val, path.c_str());
		
		zp[huff[root].val] = path;
		return 0;
	}
	if(huff[root].left) {
		huff_write(huff[root].left, path + '0');
	}
	if(huff[root].right) {
		huff_write(huff[root].right, path + '1');
	}
	return 0;
}

bool zip()
{
	strcat(str, SUFFIX);
	fw = fopen(str, "wb+");
	char ch;
	int tot = 0, cnt = 0, pd[M] = {0}, a, b;
	while((ch = fgetc(fp)) != EOF) {
		words[tot++] = ch;
		//printf("%c", ch);
		if((unsigned)ch > 127) {
			printf("Warning!含有非英文字符!\n");
			return 0;
		}
		pd[(unsigned)ch]++;
		if(tot > N) return 0;
	}
	//printf("%d", N * 5 - tot);
	fwrite(&tot, sizeof(int), 1, fw);
	for(int i = 0; i <= M; i++) {
		if(pd[i]) {
			huff[++cnt].cnt = pd[i];
			huff[cnt].val = (char)i;
			q.push(cnt);
		}
	}
	fwrite(&cnt, sizeof(int), 1, fw);
	//fprintf(fw, "%d ", cnt);
/*	while(!q.empty()) {
		a = q.top(), q.pop();
		printf("%2d:%c number:%d\n", a, huff[a].val, huff[a].cnt);
	}*/
	while(!q.empty()) {
		a = q.top(), q.pop();
		if(q.empty()) break;
		b = q.top(), q.pop();
		huff[++cnt].left = a;
		huff[cnt].right = b;
		huff[cnt].cnt = huff[a].cnt + huff[b].cnt;
		q.push(cnt);
//		if(!huff[a].val) huff[a].val = '0';
//		if(!huff[b].val) huff[b].val = '1';
	}
	char zerone[N * 5] = {0};
	if(huff_write(a, "")) return 0;
	for(int i = 0; i < tot; i++) {
		strcat(zerone, zp[words[i]].c_str());
	}
	//printf("%s", zerone);
	int len = strlen(zerone), j = 1, num = 0;
	for(unsigned int i = 0; i < len; i++) {
		if(j > 32) {
			//printf("%d\n", num);
			fwrite(&num, sizeof(int), 1, fw);
			j = 1;
		}
		if(j <= 32) {
			num = (num << 1) + zerone[i] - '0';
			//printf("%d\n", num);
			j++;
		} 
	}
	//printf("%d\n", num);
	/*while(num) {
		printf("%d", num % 2);
		num /= 2;
	}*/
	while(j <= 32) {
		num = (num << 1);
		j++;
	}
	//printf("%d", num);
	fwrite(&num, sizeof(int), 1, fw);
	fseek(fw, 0, SEEK_END);
	fseek(fp, 0, SEEK_END);
	double size1, size2;
	size1 = ftell(fp);
	size2 = ftell(fw);
	printf("压缩率为%.2lf%%\n", size2 / size1 * 100);
	fclose(fp);
	fclose(fw);
	return 1;
}

bool unzip()
{
	fclose(fp);
	fp = fopen(str, "rb");
	str[strlen(str) - 4] = 0;
	fw = fopen(str, "w+");
	int cnt = 0, tot = 0, a, wds = 0, atot = 0;
	char ch, path[25];
	string dic;
	fread(&wds, sizeof(int), 1, fp);
	fread(&cnt, sizeof(int), 1, fp);
	for(int i = 1; i <= cnt; i++) {
		//ch = fgetc(fp);
		//printf("111\n");
		fscanf(fp, "%c%s", &ch, path);
		fgetc(fp);
		dic = path;
		uzp[dic] = ch;
		//printf("%c %s\n", ch, dic.c_str());
		//printf("%c %s\n", uzp[dic], dic.c_str());
	}
	char zerone[N * 5] = {0};
	while(!feof(fp)) {
		//printf("111\n");
		fread(&a, sizeof(int), 1, fp);
		int bit = 31;
		while(bit >= 0) {
			zerone[tot++] = '0' + ((a >> bit) & 1);
		//	printf("%d:%c, %c\n", tot - 1, zerone[tot-1], '0' + ((a >> bit) & 1));
			bit--;
		}
	}
	//printf("%s", zerone);
	dic = "";
	for(int i = 0, j = 0; i < tot; i++) {
		dic += zerone[i];
		//printf("%s\n", dic.c_str());
		if(uzp[dic]) {
			fprintf(fw, "%c", uzp[dic]);
			dic = "";
			atot++;
			if(atot == wds) break;
		}
	}
	return 1;
}

int main()
{
MARK1:
	system("cls");
	printf("请将您要压缩/解压的文档(.txt/.myz)拖至窗口或输入文件目录(例如：c:\\files\\myzisverygood.txt)\n");
	memset(str, 0, sizeof str);
	init();
	fp = fopen(str, "r");
	while(fp == NULL) {
		printf("ERROR!请重新输入：\n");
		memset(str, 0, sizeof str);
		init();
		fp = fopen(str, "r");
	}
	system("cls");
	printf("请稍候...\n");
	Sleep(1000);
	if(judge() == 0) {
		if(zip() == 0) {
			printf("ERROR!压缩失败！\n");
		} else {
			printf("压缩成功！\n");
		}
	} else if(judge() == 1) {
		if(unzip() == 0) {
			printf("ERROR!解压缩失败！\n");
		} else {
			printf("解压成功！\n");
		}
	} else {
		printf("文件后缀名错误！请检查是否为txt文件或者%s文件！\n", SUFFIX);
		printf("按1重新输入，按2直接退出\n");
		int _a;
		scanf("%d", &_a);
		while(_a != 1 && _a != 2) {
			system("cls");
			printf("ERROR!\n");
			printf("按1重新输入，按2直接退出\n");
			scanf("%d\n", &_a);
		}
		if(_a == 1) {
			goto MARK1;
		} else {
			fclose(fp);
		}
	}
	system("pause");
	return 0;
}

```