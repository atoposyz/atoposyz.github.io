---
title: 分布计算系统笔记——第二章 进程通信
date: 2024-11-25 20:25:11
updated: 2024-11-25 20:25:11
katex: true
tags:
  - 课程笔记
categories:
  - 分布计算系统
---

## 同节点进程通信

信号、管道、命名管道、消息队列、信号灯、共享内存、内存映像

### 管道

#### 无名管道

无名管道只能在有亲缘关系的进程之间使用(例如父进程和子进程，子进程和子进程)，并且与创建无名管道的进程一起存在。 

```c++
int p[2], j;
if(pipe(p) == -1)
{
    perror(“pipe call failed”);
    exit(1);
}
switch(pid=fork())  {
    case –1:
        perror(“fork call failed”);
        exit(2);
    case 0:
        /* if child then write to  pipe*/
        write(p[1], msg1, MSGSIZE);
        write(p[1], msg2, MSGSIZE);
        write(p[1], msg3, MSGSIZE);
    default:
        /*if parent then read from pipe*/
        for(j=0; j<3; j++)
        {
            read(p[0], inbuf, MSGSIZE);
            printf(“%s\n”, inbuf);
        }
    wait(NULL);
    exit(0);
}
```

#### 命名管道（FIFO）

命名管道作为拥有文件访问权限的目录入口而存在，所以它们可以在彼此无关的进程之间使用。 

```c++
Mkfifo(“/tmp/fifo”, 0666);
fd=open(“/tmp/fifo”, O_WRONLY); 
```

### 消息队列
队列中的消息能够以随意的顺序进行检索，因为可以通过消息的类型把消息从队列中检索出来

凭空出现的qid, length, result变量就是新声明的
```c++
int open_queue(key_t key)
{
    if((qid=msgget(key,IPC_CREAT|0660))==-1)
    {
        return(-1);
    }
    return(qid);
}
int send_message(int qid, struct msgbuf *qbuf)
{
    length=sizeof(struct msgbuf)-size(long);
    if((result=msgsnd(qid,qbuf,length,0))==-1)
    {
        return(-1);
    }
    return(result);
} 
int peek_message(int qid, long type)
{
    if((result=msgrcv(qid,NULL,0,type,IPC_NOWAIT))==-1)
    {
        if(errno==E2BIG) return(TRUE);
    }
    return(FALSE);
 } 
int remove_queue(int qid)
{
    if(msgctl(qid, IPC_RMID, 0)==-1)
    {
        return(-1)
    }
    return(0);
} 

```

### 共享内存

使用共享内存技术，不同进程可以同时访问相同的内存区域。能够通过共享它们地址空间的若干部分，然后对存储在共享内存中的数据进行读和写，从而实现彼此直接通信。 

1. 由一个进程来创建／分配一个共享内存段，其大小和访问权限在其生成时设置。系统调用shmget建立一个新的共享内存区或者返回一个已经存在的共享内存区。 
2. 进程可挂接此存储段，同时将其映射到自己当前的数据空间中。每个进程通过其挂接的地址访问共享内存段。系统调用shmat将一个共享内存区附加到进程的虚拟地址空间上。 
3. 当一个进程对共享内存段的操作已经结束时，可以从虚拟地址空间中分离该共享内存段。系统调用shmdt从进程的虚拟地址空间分离一个共享内存区。 
4. 进程对该共享内存段进行操作。系统调用shmctl对与共享内存相关联的各种参数进行操作。 
5. 当所有进程完成对该共享内存段的操作时，通常由共享内存段的创建进程负责将其删除。 

```cpp
int shmget(key_t key, int size, int shmflg);
int shmctl(int shmid, int cmd, struct shmid_ds *buf);
void *shmat(int shmid, const void *shmaddr, int shmflg);
int shmdt(const void *shmaddr);
```

## 不同节点进程通信

### 中间件协议

1. 认证(Authentication)协议，有各种方法建立认证机制来确认身份。 
2. 许可协议能保证经过认证的用户和进程仅能访问那些它有访问权限的资源。 
3. 分布式提交协议，用于当一组合作的进程执行一个特定操作时，达成要么所有进程都完成了该操作，要么该操作根本没执行的效果。 
4. 分布封锁协议，用于防止分布在多个机器上的多个进程同时访问同一个资源。 
5. 中间件通信协议支持高层通信服务，例如，中间件协议可以支持一个进程以透明的方式调用另一个机器上的一个过程，或者支持一进程以透明的方式访问远程机器上的一个对象。 

![](https://github.com/atoposyz/picx-images-hosting/raw/master/image.8ojqc23yxp.webp)

> 分布计算系统的通信模型

### 进程通信方法

#### 报文传递 send(b, msg), receive(a, msg)

##### 阻塞原语

阻塞性报文通信原语也称为同步(Synchronous)原语。阻塞原语不立即将控制权返回给调用该原语的进程，也就是说send一直被阻塞直到发送的信息被接收方收到并得到接收方的应答。同样地，receive一直被阻塞，直到要接受的信息到达并被接收。 

包括无缓冲和有缓冲的方式，有缓冲的只是中间多了一个缓冲区

#### 远程过程调用（RPC）

远程过程的调用者发出远程过程调用后被阻塞等待返回值,而不象阻塞的报文传递那样等待的仅仅是一个应答。

![](https://github.com/atoposyz/picx-images-hosting/raw/master/image.64dvzfgr5e.webp)

顾客和服务员的结合(Binding)。一个顾客向一个服务员发送一个远程过程调用前，服务员必须是存在的，并进行了注册，注册时向系统内核的端口管理员(port mapper)申请一个通信端口。服务员将监听这个端口和顾客进行通信。顾客通过访问端口管理员而得到用于访问这个服务员的“句柄” (handle)，这个句柄用于指引和低层的socket结合。这整个过程对程序员来说是透明的。

![](https://github.com/atoposyz/picx-images-hosting/raw/master/image.m3wzfqjs.webp)

![](https://github.com/atoposyz/picx-images-hosting/raw/master/image.7p3mywgol3.webp)

![](https://github.com/atoposyz/picx-images-hosting/raw/master/image.7p3mywgol3.webp)

##### 编写一个socket程序 

略

##### RPC实例2 DCE RPC

略

## 组通信

### 组通信的接收语义

1. 捎带顺序语义。这种语义保证了如果报文捎带了标识这些报文之间关联的一些信息，那么报文就能够以一种正确的顺序接收 。  
2. 一致顺序语义。所有接收者按完全相同的顺序接受报文，但是，一组报文的发送顺序和被接收的顺序可能是不同的。
3. 全局顺序语义。这种语义要求所有的接收者严格地按照报文的发送顺序接收。这就需要一个全局时钟，也就是说不同系统中进程的时钟是必需经过同步或使用全局时间戳 。

### 组通信的设计问题

原子性

略

### 同步形式

![](https://github.com/atoposyz/picx-images-hosting/raw/master/image.8hgign5ler.webp)

### 通信原语

3种广播语义：ABCAST、CBCAST、GBCAST

ABCAST提供松弛的同步通信，用于向进程组成员传输数据；CBCAST提供虚同步通信，也用于发送数据；GBCAST的语义和ABCAST一样，只是它用于组成员的管理，而不是用于发送一般的数据。

#### ABCAST

ABCAST使用两阶段提交协议(two-phase commit protocol)的形式进行工作。首先，发送者A向进程组中的所有成员申请一个时间戳(timestamp)，并将报文发送到进程组的所有成员。进程组的所有成员向发送者分配一个时间戳，该时间戳要大于所有该成员所发送的和所接收的报文的时间戳。A接收到所有成员分配的时间戳之后，从中选择一个最大的时间戳作为要发送报文的时间戳，然后向所有组成员发送一个带有该时间戳的提交报文。提交报文按照时间戳的顺序传递给应用程序。使用该协议能够保证所有报文按照同样的顺序传递到所有进程。

#### CBCAST

使用CBCAST原语，只能保证因果相关的报文被所有的进程按同样的顺序接收。利用一个向量来调整具有因果关系的报文的接收顺序。 如果一个进程组有n个成员，则每个成员保持一个有n个元素的向量，向量中的第i个元素是该成员从进程i那里收到的最后一个报文的号码。当一个进程需要发送一个报文时，它首先将向量中对应自己的元素增1，对于发送者来说，因为自己是该组的成员，发向该组的报文也意味着发向自己。发送者将修改后的向量随报文一起发送。  

![](https://github.com/atoposyz/picx-images-hosting/raw/master/image.8dwwixgbdg.webp)

完