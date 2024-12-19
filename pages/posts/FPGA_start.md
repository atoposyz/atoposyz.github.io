---
title: FPGA快速实践
katex: true
tags:
  - FPGA
  - 脉动阵列
  - vivado
  - vitis
categories:
  - 笔记
---
## 快速启动一个可用的脉动阵列

以导入一个[开源的脉动阵列](https://github.com/Buck008/Transformer-Accelerator-Based-on-FPGA)为例

### vivado

新建项目，选板型如下图所示，family选zynq-7000，package选clg-400，speed选-2，然后选最后一个，也就是xc7z020clg400-2

<img src="https://github.com/atoposyz/picx-images-hosting/raw/master/image.8adbjbejwi.webp" alt="alt text" style="zoom:50%;" />

主界面中选择add sources

<img src="C:\Users\xuanf\AppData\Roaming\Typora\typora-user-images\image-20241217150543495.png" alt="image-20241217150543495" style="zoom:50%;" />

选择设计文件，导入src即可

<img src="https://github.com/atoposyz/picx-images-hosting/raw/master/image-20241217150726596.39l8rr6yqp.webp" alt="image-20241217150726596" style="zoom:80%;" />

这个地方搜索tcl

![image-20241217160130371](https://github.com/atoposyz/picx-images-hosting/raw/master/image-20241217160130371.3rbagc8cbm.webp)

run prj.tcl

tcl文件包含了若干指令，可以完成设置模块和连线等操作

完成后点击左边open block design，可以得到以下场面

![](https://github.com/atoposyz/picx-images-hosting/raw/master/image-20241217163223373.60uaztt2sl.webp)

双击ZYNQ的方框，按图片修改配置

<img src="https://github.com/atoposyz/picx-images-hosting/raw/master/image-20241218133131346.7p3nx0jczd.webp" alt="image-20241218133131346" style="zoom: 67%;" />

右键design1，选择生成output products，把模块设计转化为verilog文件

![image-20241217163001155](https://github.com/atoposyz/picx-images-hosting/raw/master/image-20241217163001155.8s3d7wf6ub.webp)

可以看到设计都被放到一个verilog文件下了，接下来生成hdl wrapper，封装起来

![image-20241217163619917](https://github.com/atoposyz/picx-images-hosting/raw/master/image-20241217163619917.73u0apowo6.webp)

封装完后将它设置为顶层文件。

<img src="https://github.com/atoposyz/picx-images-hosting/raw/master/image-20241217163734634.8l05cgt1eu.webp" alt="image-20241217163734634" style="zoom:67%;" />

此时，design_1_wrapper是项目的顶层文件，MM_ultra_top是脉动阵列的源文件。

可以点击生成比特流文件了（时间很长）（在右上角看进度）

<img src="https://github.com/atoposyz/picx-images-hosting/raw/master/image-20241217163954766.2obl5gcig8.webp" alt="image-20241217163954766" style="zoom:50%;" />

完成后就可以导出硬件了

<img src="https://github.com/atoposyz/picx-images-hosting/raw/master/image-20241217170557557.6t76hk9oix.webp" alt="image-20241217170557557" style="zoom:50%;" />

记得包括上比特流文件

<img src="https://github.com/atoposyz/picx-images-hosting/raw/master/image-20241217170630360.3uuwe21f1o.webp" alt="image-20241217170630360" style="zoom:50%;" />

### vitis

接下来就到了编写软件的部分了，vitis建议使用classic

![image-20241217170825051](https://github.com/atoposyz/picx-images-hosting/raw/master/image-20241217170825051.wimajt5kd.webp)

首先生成一个平台应用

<img src="https://github.com/atoposyz/picx-images-hosting/raw/master/image-20241217171301895.2obl5gcige.webp" alt="image-20241217171301895" style="zoom:67%;" />

在这里选择使用vivado最后导出的硬件

<img src="https://github.com/atoposyz/picx-images-hosting/raw/master/image-20241217171833362.5j49b8rp80.webp" alt="image-20241217171833362" style="zoom:50%;" />

完成后再添加一个application project

![image-20241217171747543](https://github.com/atoposyz/picx-images-hosting/raw/master/image-20241217171747543.9gwmrx2pv4.webp)

选用自己的平台

<img src="https://github.com/atoposyz/picx-images-hosting/raw/master/image-20241217172016103.175g3p8dpt.webp" alt="image-20241217172016103" style="zoom:50%;" />

选择一个空的c项目

<img src="https://github.com/atoposyz/picx-images-hosting/raw/master/image-20241217172154713.8vmz5m89ki.webp" alt="image-20241217172154713" style="zoom:50%;" />

得到以下工作目录，现在可以导入src文件了

<img src="https://github.com/atoposyz/picx-images-hosting/raw/master/image-20241217172312293.1ap21f1gfn.webp" alt="image-20241217172312293" style="zoom:67%;" />

例如，导入sdk中的文件

<img src="https://github.com/atoposyz/picx-images-hosting/raw/master/image-20241217172428585.41y49hnkhg.webp" alt="image-20241217172428585" style="zoom:50%;" />

这个程序用于比较软硬件矩阵乘法的时间

左下角，先build平台，再build程序

<img src="https://github.com/atoposyz/picx-images-hosting/raw/master/image-20241217172537278.2obl5gcigl.webp" alt="image-20241217172537278" style="zoom: 67%;" />

### FPGA板

插电，开机，连接JTAG、uart与电脑

<img src="https://github.com/atoposyz/picx-images-hosting/raw/master/image.8adbjbuorq.webp" alt="a81618b4603c6b91a5246c499fe8b522_720" style="zoom: 33%;" />

打开putty

putty是一个串口监听软件

<img src="https://github.com/atoposyz/picx-images-hosting/raw/master/image-20241217172909837.6pnkjuglti.webp" alt="image-20241217172909837" style="zoom:50%;" />

修改以下内容，然后open

<img src="https://github.com/atoposyz/picx-images-hosting/raw/master/image-20241217172958357.8ojra6m452.webp" alt="image-20241217172958357" style="zoom: 80%;" />

其中COM3来自设备管理器中的串口名字

<img src="https://github.com/atoposyz/picx-images-hosting/raw/master/image-20241217173034108.7zqhq5yl4n.webp" alt="image-20241217173034108" style="zoom: 67%;" />

点击vitis中左下角让程序launch起来，然后切换到putty，观察输出

<img src="https://github.com/atoposyz/picx-images-hosting/raw/master/image-20241217173212334.99tewhgkfs.webp" alt="image-20241217173212334" style="zoom: 67%;" />

我去，完美！

<img src="https://github.com/atoposyz/picx-images-hosting/raw/master/image-20241218132501160.4cky2n2smw.webp" alt="image-20241218132501160"  />