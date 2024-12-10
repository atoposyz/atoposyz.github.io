---
title: 信息安全原理复习重点
date: 2024-12-05 16:28:55
updated: 2024-12-05 16:28:55
katex: true
tags:
  - 课程笔记
  - 安全
  - 密码
categories:
  - 信息安全原理
---

## 老师强调的重点
### 密码学 Cryptography

#### 对称密钥 symmetric key encryption 

对称密钥加密即单密钥加密，在加密时有以下优点：

1. 速度快，易于加密
2. 算法简单，计算资源消耗少
3. 适用于大规模数据传输

当然，相对于非对称密钥加密，也有相应的缺点：

1. 对称加密需要发送和存储密钥，在传输中一旦密钥泄露，则安全性大幅下降
2. 密钥必须双方事先共享，否则需要依赖其他协议传输密钥
3. 无法实现数字签名

实际应用中常常两种加密混合使用，称为混合加密。

#### 加密模式（0929作业）

**ECB**

简单的块加密

![](https://github.com/atoposyz/picx-images-hosting/raw/master/image.41y3mrclf0.webp)

因为相同明文通过相同密钥可得到相同密文，存在一定漏洞，所以通过添加参数（IV）的方法修改每一次加密的明文或密钥，从而得到无规律的密文。

> 初始向量IV, Initialization Vector.<br>
> 需要保证以下特质<br>
> 1.以明文存储或传输<br>
> 2.不应重复使用<br>
> 3.不可预测

**CBC**

明文P与向量V异或后再加密得到密文C。

$$
\begin{align*}
V_0 & = IV \\
V_i & = C_{i-1} 
\end{align*}
$$

由于V需要由密文得到，因此加密不可并行，但解密可并行

**CFB**

向量V加密后与明文P异或得到密文C。

$$
\begin{align*}
V_0 & = IV \\
V_i & = C_{i-1} 
\end{align*}
$$

实际上变成了流加密，而且最后的数据块也不需要填充了，很适合加密实时数据

同样的，由于V需要由密文得到，因此加密不可并行，但解密可并行

**OFB**

向量V加密后与明文P异或得到密文C。

$$
\begin{align*}
V_0 & = IV \\
V_i & = E(V_{i-1})
\end{align*}
$$

与CFB相同，但加密的向量实际只依赖上个向量，最终都依赖于IV，所以加密解密都是可并行的

**CTR**

向量V加密后与明文P异或得到密文C。

$$
V_i=Nonce|Counter_i
$$

nonce和其他模式的IV一样，计数器counter从000...000累加

很明显，加密解密都可并行

#### 数字签名与数字证书

在传输密钥时容易遭到中间人攻击，从而无法确定对方用户身份和密钥的安全性。因此在传输密钥时常常使用证书将密钥与用户身份绑定。

##### 数字签名 Digital Signature

数字签名是一种能产生与真实签名相同效果的协议： 它是一种只有发送者才能做的标记，但其他人可以很容易地识别出它属于发送者。

A **digital signature** is a **protocol** that produces the same effect as a real signature: It is a mark that only the sender can make, but other people can **easily recognize** as belonging to the sender.

一般情况下使用自己的私钥签名，别人使用公钥验证。

##### 数字证书 digital certificate

证书颁发机构（CA）是权威的，有了CA的签名，大家就会认可你的数据是真的。

一份证书的构成：

自己的name, addr, public key, hash value, 上层的签名，上层的证书

**证书颁发机构**：受信任方，负责验证用户身份，然后将验证身份与公钥绑定。

**Certificate Authority** (CA): a trusted party, responsible for verifying the identity of users, and then bind the verified identity to a public keys.

**数字证书**：证明内含的公开密钥确实属于该文件所述身份的文件。

**Digital Certificates**: A document certifying that the public key included inside does belong to the identity described in the document.

**当用户想访问A网站，攻击者用B网站攻击的三种攻击方式**（1025作业）
1. 攻击者使用A网站的真实证书。由于证书中有CA机构的签名，攻击者的网站无法伪造完全一样的签名，从而被浏览器识破（网站和真证书对不上）
2. 攻击者创建一个假证书。由于浏览器无法识别该证书，一般会询问用户是否进入网站（众所周知，用户一般都是坚持访问的）
3. 攻击者使用自己网站的真实证书。由于证书是真的，和网站也对得上，浏览器会通过验证。这种情况一般是网址相似，用户通过对比网址可判断网站是假的

### 身份验证与访问控制 Authentication & Access Control

身份识别 Identification 指声明一个人是谁

身份验证 Authentication 指通过某种手段证明某人是他声明的身份。

#### 身份验证：salt（1101作业）

通常使用密码口令进行身份验证，然而，总有用户使用弱口令，给attacker可乘之机。

因此通常使用散列函数对口令处理，但是困难的口令各式各样，简单的口令千篇一律

当用户设置的口令过于简单时，攻击者提前将各种简单的口令和他们的散列值提前计算，保存得到彩虹表，从而进行攻击。即使使用SHA等加密方法，也可以通过多个散列值的对比找到较弱的口令来攻击。

因此可以通过在口令上加入各不相同的**salt**（类似加密模式中的IV），使加密后的散列值各不相同，从而加大攻击者攻击的难度。明文的salt比如用户名、时间戳，也可以用密文salt来增强口令。

多次散列化也能有效增大口令破解难度

#### 访问控制：Kerberos协议（1108作业）

主要使用密钥分发中心KDC（Key Distribution Center）实现访问控制

![](https://github.com/atoposyz/picx-images-hosting/raw/master/image.5q7gk25ye5.webp)

用户向KDC发送TGT请求（实际上就是登录服务器），KDC返回一个会话密钥 $K_{c, tgs}$ 和票据 $T_{c,tgs}$，用于和TGS通信。

KDC返回信息结构如下

$$
\{K_{c,tgs}||\{T_{c,tgs}\}K_{tgs}\}K_c
$$

用户得到票据后想要使用某服务时，向TGS发送请求，附带TGT和authenticator，TGS使用TGT解密出会话密钥，用这个密钥加密一个新的服务票据和会话密钥。

使用tgs的key加密的票据TGT(Ticket-Granting Ticket)结构如下

$$
\{tgs||c||addr||timestamp||lifetime||K_{c,tgs}\}K_{tgs}
$$

用户使用tgs发的票据使用对应服务。

访问服务时使用的authenticator结构如下

$$
\{c||addr||timestamp\}K_{c,s}
$$

authenticator能够保证： 
1. 客户端知道密钥 
2. 票据是新的、有效的

### 编程与程序安全 Programs & Programming

程序都有缺陷，由此可以被恶意利用，一个经典的缺陷是缓冲区溢出（Buffer Overflow）。

#### 缓冲区溢出（1115作业）

1. 程序在执行时会在栈空间分配一个固定大小的缓冲区用于存储数据。
2. 当用户或程序向缓冲区写入数据时，如果没有检查数据的长度，可能会写入超出预定大小的数据。超出缓冲区的数据将覆盖相邻的内存空间，可能会修改其他数据结构、变量，甚至控制流相关的关键内容，如返回地址、函数指针等。
3. 如果攻击者故意设计输入数据，使得缓冲区溢出的部分覆盖了程序的返回地址，从而使程序跳转到攻击者的恶意代码并执行。

#### 预防措施
##### 地址随机化 ASLR (Address Space Layout Randomization)

随机化堆栈的起始位置，即每次在内存中加载代码时，堆栈地址都会发生变化，从而难以猜测内存中的堆栈地址，进而难以猜测 %ebp 地址和恶意代码地址

##### 栈保护 Stack-Guard

使用一个保护值canary检测栈溢出是否发生，通常将canary放在缓冲区和返回地址之间，如果发生栈溢出，就会覆盖canary值，从而检测到栈溢出。

## 笔者认为的其他重点

### CIA（0913作业）

confidentiality 保密性

integrity 完整性

availability 可用性

### 信息传递的四种攻击手段

![](https://github.com/atoposyz/picx-images-hosting/raw/master/image.8vmyj1ui7h.webp)


### 流加密和块加密的比较（0927作业）

流加密：
1. 变换速度快。每个符号单独加密，无需等待其他符号
2. 低错误传播。错误只影响字符本身

块加密：
1. 高扩散。明文信息分散到整个加密块中。
2. 免疫符号插入。符号块长度固定，一旦插入可以立刻发现。
3. 相同明文得到相同密文。容易看出明文特征。

### 错误检测码 Error Detecting Code

一般使用**hash**算法，由原文易得哈希值，反过来十分困难，且原文发生改变时，哈希值也发生改变

散列函数的特点：单向性、抗碰撞性

常用的one-way hash functions
- MD series
- SHA series

### 信息验证码 Message Authentication Code（MAC）

使用key和hash可以达到信息验证的目的（1018作业）

### 重放攻击

在交易等场景，将信息进行重放也会造成破坏，一般使用添加时间戳的方法解决

### Needham-Schroeder Protocol 双向鉴别协议

$$
\begin{align}
A → S &: A||B||N_A\\
S → A &: \{N_A||B||K_{AB}||\{K_{AB}||A\}K_{BS} \}K_{AS}\\
A → B &: \{K_{AB}||A\}K_{BS}\\
B → A &: \{N_B\}K_{AB}\\
A → B &: \{N_B − 1\}K_{AB}\\
\end{align}
$$

其对应场景如下所示

![](https://github.com/atoposyz/picx-images-hosting/raw/master/image.4g4jdq8po1.webp)

### 程序运行时的栈变化

%ebp

（待补充）

## 并非重点（？）

凯撒密码Caesar Cipher

每个字母按字母表顺序移动

Vigenere密码

每个字母按key顺序移动，key可以是单词，也可以是一串神秘数字

各种其他密码（0920作业）

DES：数据加密标准，用密钥加密，因安全性不够，后来出现了double DES， triple DES，再后来使用了AES

公钥和私钥的历史沿革，早期选取key的数学方法

RSA的数学方法

密钥交换协议（1011作业）

hash的应用：检测文件是否完整，不泄露秘密情况下发布秘密，密码验证，salt，可信的时间戳

hash chain， Block chain

哈希碰撞攻击（很难）

Kerberos干的是认证Authentication的活，一般不干授权Authorization的活。也可以干，可以往ticket里放

除了文字密码还有图形密码，五花八门，还有指纹等各种玩意

## 免责声明

仅为个人笔记，不提供备考建议和指南