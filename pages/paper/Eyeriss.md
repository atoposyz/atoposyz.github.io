---
title: 'Eyeriss: A Spatial Architecture for Energy-Efficient Dataflow for Convolutional Neural Networks'
katex: true
tags:
  - Eyeriss
categories:
  - 论文
---

::: en
Abstract—Deep convolutional neural networks (CNNs) are widely used in modern AI systems for their superior accuracy but at the cost of high computational complexity. The complexity comes from the need to simultaneously process hundreds of filters and channels in the high-dimensional convolutions, which involve a significant amount of data movement. Although highly-parallel compute paradigms, such as SIMD/SIMT, effectively address the computation requirement to achieve high throughput, energy consumption still remains high as data movement can be more expensive than computation. Accordingly, finding a dataflow that supports parallel processing with minimal data movement cost is crucial to achieving energyefficient CNN processing without compromising accuracy.

In this paper, we present a novel dataflow, called rowstationary (RS), that minimizes data movement energy consumption on a spatial architecture. This is realized by exploiting local data reuse of filter weights and feature map pixels, i.e., activations, in the high-dimensional convolutions, and minimizing data movement of partial sum accumulations. Unlike dataflows used in existing designs, which only reduce certain types of data movement, the proposed RS dataflow can adapt to different CNN shape configurations and reduces all types of data movement through maximally utilizing the processing engine (PE) local storage, direct inter-PE communication and spatial parallelism. To evaluate the energy efficiency of the different dataflows, we propose an analysis framework that compares energy cost under the same hardware area and processing parallelism constraints. Experiments using the CNN configurations of AlexNet show that the proposed RS dataflow is more energy efficient than existing dataflows in both convolutional (1.4× to 2.5×) and fully-connected layers (at least 1.3× for batch size larger than 16). The RS dataflow has also been demonstrated on a fabricated chip, which verifies our energy analysis.
:::

::: zh-CN
摘要——深度卷积神经网络（CNN）因其卓越的准确性而广泛应用于现代人工智能系统，但其计算复杂度较高。复杂度源于在高维卷积中需要同时处理数百个滤波器和通道，这涉及大量的数据移动。尽管高度并行的计算范式（如SIMD/SIMT）有效满足了高吞吐量的计算需求，但能耗仍然较高，因为数据移动的成本可能超过计算成本。因此，找到一种支持并行处理并最小化数据移动成本的数据流，对于实现节能的CNN处理而不牺牲准确性至关重要。

在本文中，我们提出了一种新颖的数据流，称为行静态（RS），旨在最小化空间架构上的数据移动能耗。这通过利用滤波器权重和特征图像素（即激活值）在高维卷积中的局部数据重用来实现，并最小化部分和累加的数据信息移动。与现有设计中使用的数据流不同，后者仅减少某些类型的数据移动，所提出的RS数据流能够适应不同CNN形状配置，并通过最大限度地利用处理引擎（PE）本地存储、直接的PE间通信和空间并行性来减少所有类型的数据移动。为了评估不同数据流的能效，我们提出了一个分析框架，该框架在相同的硬件面积和处理并行性约束下比较能耗。使用AlexNet的CNN配置进行的实验表明，所提出的RS数据流在卷积层（节能效果为1.4倍至2.5倍）和全连接层（对于批大小大于16时至少节能1.3倍）上均比现有数据流更具能效。RS数据流还已在一款已制造的芯片上进行验证，证实了我们的能量分析。
:::

::: en
## I. INTRODUCTION {lang="en"}

The recent popularity of deep learning [1], specifically deep convolutional neural networks (CNNs), can be attributed to its ability to achieve unprecedented accuracy for tasks ranging from object recognition [2–5] and detection [6, 7] to scene understanding [8]. These state-of-the-art CNNs [2– 5] are orders of magnitude larger than those used in the 1990s [9], requiring up to hundreds of megabytes for filter weight storage and 30k-600k operations per input pixel.

The large size of such networks poses both throughput and energy efficiency challenges to the underlying processing hardware. Convolutions account for over 90% of the CNN operations and dominates runtime [10]. Although these operations can leverage highly-parallel compute paradigms, such as SIMD/SIMT, throughput may not scale accordingly due to the accompanying bandwidth requirement, and the energy consumption remains high as data movement can be more expensive than computation [11–13]. In order to achieve energy-efficient CNN processing without compromising throughput, we need to develop dataflows that support parallel processing with minimal data movement. The differences in data movement energy cost based on where the data is stored also needs to be accounted for. For instance, fetching data from off-chip DRAMs costs orders of magnitude more energy than from on-chip storage [11, 12].

Many previous papers have proposed specialized CNN dataflows on various platforms, including GPU [14], FPGA [15–21], and ASIC [22–26]. However, due to differences in technology, hardware resources and system setup, a direct comparison between different implementations does not provide much insight into the relative energy efficiency of different dataflows. In this paper, we evaluate the energy efficiency of various CNN dataflows on a spatial architecture under the same hardware resource constraints, i.e., area, processing parallelism and technology. Based on this evaluation, we will propose a novel dataflow that maximizes energy efficiency for CNN acceleration.

To evaluate energy consumption, we categorize the data movements in a spatial architecture into several levels of hierarchy according to their energy cost, and then analyze each dataflow to assess the data movement at each level. This analysis framework provides insights into how each dataflow exploits different types of data movement using various architecture resources. It also offers a quantifiable way to examine the differences in energy efficiency between different dataflows.

Previously proposed dataflows typically optimize a certain type of data movement, such as input data reuse or partial sum accumulation. Using our analysis framework, we show that a dataflow that exploits all types of data reuse, and takes into account the energy cost of data movement at different levels of the storage hierarchy, can deliver significant energy savings. In summary, the main contributions of this work include:

- A taxonomy that classifies existing CNN dataflows from previous research. (Section IV)
- A spatial architecture based on a new CNN dataflow, called row stationary, which is optimized for throughput and energy efficiency. It works on both convolutional and fully-connected layers, and optimizes all types of data movement in the storage hierarchy. This dataflow has also been demonstrated on a fabricated chip. (Section V)
- An analysis framework that can quantify the energy efficiency of different CNN dataflows under the same hardware constraints. It can also search for the most energy efficient mapping for each dataflow. The analytical model uses energy/area numbers from a commercial 65nm process and all R/W numbers are exact based on real CNN shape configurations, i.e., AlexNet. (Section VI-C)
- For a variety of CNN dataflows, we present a comparative analysis of the energy costs associated with data movement and the impact of different types of data reuse. (Section VII)

## II. SPATIAL ARCHITECTURE {lang="en"}

Spatial architectures (SAs) are a class of accelerators that can exploit high compute parallelism using direct communication between an array of relatively simple processing engines (PEs). They can be designed or programmed to support different algorithms, which are mapped onto the PEs using specialized dataflows. Compared with SIMD/SIMT architectures, SAs are particularly suitable for applications whose dataflow exhibits producer-consumer relationships or can leverage efficient data sharing among a region of PEs.

SAs come in two flavors: coarse-grained SAs that consist of tiled arrays of ALU-style PEs connected together via on-chip networks [27–29], and fine-grained SAs that are usually in the form of an FPGA. The expected performance advantage and large design space of coarse-grained SAs has inspired much research on the evaluation of its architectures, control schemes, operation scheduling and dataflow models [30–35].

Coarse-grained SAs are currently a very popular implementation choice for specialized CNN accelerators for two reasons. First, the operations in a CNN layer (e.g., convolutional, fully-connected, pooling, etc. Details are described in Section III-A) are uniform and exhibit high parallelism, which can be computed quite naturally with parallel ALUstyle PEs. Second, direct inter-PE communication can be used very effectively for (1) passing partial sums to achieve spatially distributed accumulation, or (2) sharing the same input data for parallel computation without incurring higher energy data transfers. ASIC implementations usually deploy dozens to hundreds of PEs and specialize the PE datapath only for CNN computation [22–26]. FPGAs are also used to build CNN accelerators, and these designs usually use integrated DSP slices to construct the PE datapaths [15–21]. However, the challenge in either type of design lies in the exact mapping of the CNN dataflow to the SA, since it has a strong implication on the resulting throughput and energy efficiency.

Fig. 1 illustrates the high-level block diagram of the accelerator system that is used in this paper for CNN processing. It consists of a SA accelerator and off-chip DRAM. The inputs can be off-loaded from the CPU or GPU to DRAM and processed by the accelerator. The outputs are then written back to DRAM and further interpreted by the main processor.

The SA accelerator is primarily composed of a global buffer and an array of PEs. The DRAM, global buffer and PE array communicate with each other through the input and output FIFOs (iFIFO/oFIFO). The global buffer can be used to exploit input data reuse and hide DRAM access latency, or for the storage of intermediate data. Currently, the typical size of the global buffer used for CNN acceleration is around 100–300kB. The PEs in the array are connected via a network on chip (NoC), and the NoC design depends on the dataflow requirements. The PE includes an ALU datapath, which is capable of doing multiply-and-accumulate (MAC) and addition, a register file (RF) as a local scratchpad, and a PE FIFO (pFIFO) used to control the traffic going in and out of the ALU. Different dataflows require a wide range of RF sizes, ranging from zero to a few hundred bytes. Typical RF size is below 1kB per PE. Overall, the system provides four levels of storage hierarchy for data accesses, including DRAM, global buffer, array (inter-PE communication) and RF. Accessing data from a different level also implies a different energy cost, with the highest cost at DRAM and the lowest cost at RF.
 
## III. CNN BACKGROUND {lang="en"}

### A. The Basics {lang="en"}

A convolutional neural network (CNN) is constructed by stacking multiple computation layers as a directed acyclic graph [36]. Through the computation of each layer, a higherlevel abstraction of the input data, called a feature map (fmap), is extracted to preserve essential yet unique information. Modern CNNs are able to achieve superior performance by employing a very deep hierarchy of layers.

The primary computation of CNN is in the convolutional (CONV) layers, which perform high-dimensional convolutions. From five [2] to even several hundred [5] CONV layers are commonly used in recent CNN models. A CONV layer applies filters on the input fmaps (ifmaps) to extract embedded visual characteristics and generate the output fmaps (ofmaps). The dimensions of both filters and fmaps are 4D: each filter or fmap is a 3D structure consisting of multiple 2D planes, i.e., channels, and a batch of 3D ifmaps is processed by a group of 3D filters in a CONV layer. In addition, there is a 1D bias that is added to the filtering results. Given the shape parameters in Table I, the computation of a CONV layer is defined as

$$
O[z][u][x][y] = B[u] +  
C^{-1} \sum_{k=0}^{R-1} \sum_{i=0}^{R-1} \sum_{j=0}^{R-1} I[z][k][U_x + i][U_y + j] \times W[u][k][i][j], 
$$
$$
0 \leq z < N, \quad 0 \leq u < M, \quad 0 \leq x, y < E, \quad E = \frac{H - R + U}{U}.\quad (1)  
$$

O, I, W and B are the matrices of the ofmaps, ifmaps, filters and biases, respectively. U is a given stride size. Fig. 2 shows a visualization of this computation (ignoring biases).

A small number, e.g., 3, of fully-connected (FC) layers are typically stacked behind the CONV layers for classification purposes. A FC layer also applies filters on the ifmaps as in the CONV layers, but the filters are of the same size as the ifmaps. Therefore, it does not have the weight sharing property as in CONV layers. Eq. (1) still holds for the computation of FC layers with a few additional constraints on the shape parameters: H = R, E = 1, and U = 1. In between CONV and FC layers, additional layers can be added optionally, such as the pooling (POOL) and normalization (NORM) layers. Each of the CONV and FC layers is also immediately followed by an activation (ACT) layer, such as a rectified linear unit [37].

### B. Challenges in CNN Processing {lang="en"}

In most of the widely used CNNs, such as AlexNet [2] and VGG16 [3], CONV layers account for over 90% of the overall operations and generate a large amount of data movement. Therefore, they have a significant impact on the throughput and energy efficiency of CNNs. Even though FC layers use most of the filter weights, a recent study has demonstrated that these weights are largely compressible to 1–5% of their original size [38], which greatly reduces the impact of FC layers. Processing of POOL layers can share the same compute scheme used for CONV layers since its computation is a degenerate form of Eq. (1), where the MAC is replaced with a MAX operation. Computation of ACT layers is trivial, and we believe support for the NORM layer can be omitted due to its reduced usage in recent CNNs [3, 5].

Processing of the CONV and FC layers poses two challenges: data handling and adaptive processing. The detail of each is described below.

Data Handling: Although the MAC operations in Eq. (1) can run at high parallelism, which greatly benefits throughput, it also creates two issues. First, na¨ıvely reading inputs for all MACs directly from DRAM requires high bandwidth and incurs high energy consumption. Second, a significant amount of intermediate data, i.e., partial sums (psums), are generated by the parallel MACs simultaneously, which poses storage pressure and consumes additional memory R/W energy if not processed, i.e., accumulated, immediately.

Fortunately, the first issue can be alleviated by exploiting different types of input data reuse:

- convolutional reuse: Due to the weight sharing property in CONV layers, a small amount of unique input data can be shared across many operations. Each filter weight is reused E2 times in the same ifmap plane, and each ifmap pixel, i.e., activation, is usually reused R2 times in the same filter plane. FC layers, however, do not have this type of data reuse.
- filter reuse: Each filter weight is further reused across the batch of N ifmaps in both CONV and FC layers.
- ifmap reuse: Each ifmap pixel is further reused across M filters (to generate the M output channels) in both CONV and FC layers.

The second issue can be handled by proper operation scheduling so that the generated psums can be reduced as soon as possible to save both the storage space and memory R/W energy. CR2 psums are reduced into one ofmap pixel.

Unfortunately, maximum input data reuse cannot be achieved simultaneously with immediate psum reduction, since the psums generated by MACs using the same filter or ifmap value are not reducible. In order to achieve high throughput and energy efficiency, the underlying CNN dataflow needs to account for both input data reuse and psum accumulation scheduling at the same time.

Adaptive Processing: The many shape parameters shown in Table I gives rise to many possible CONV/FC layer shapes. Even within the same CNN model, each layer can have distinct shape configurations. Table II shows the shape configurations of AlexNet as an example. The hardware architecture, therefore, cannot be hardwired to process only certain shapes. Instead, the dataflow must be efficient for different shapes, and the hardware architecture must be programmable to dynamically map to an efficient dataflow.

### C. CNN vs. Image Processing {lang="en"}

Before CNNs became mainstream, there was already research on high-efficiency convolution due to its wide applicability in image signal processing (ISP) [40]. Many high-throughput ISP techniques have also been proposed for handling convolutions, including tiling strategies used in multiprocessors and SIMD instructions. However, they are not directly applicable for CNN processing for two reasons:

- The filter weights in CNNs are obtained through training instead of fixed in the processing system. Therefore, they can consume significant I/O bandwidth and onchip storage, sometimes comparable to that of ifmaps.
- The ISP techniques are developed mainly for 2D convolutions. They do not optimize processing resources for data reuse nor do they address the non-trivial psum accumulation in the 4D convolutions of CNN.

## IV. EXISTING CNN DATAFLOWS {lang="en"}

Numerous previous efforts [15–26] have proposed solutions for CNN acceleration, but it is difficult to compare their performance directly due to differences in implementation and design choices. In this section, we present a taxonomy of these existing CNN dataflows based on their data handling characteristics. Following are descriptions of these dataflows, which are summarized in Table III.

### A. Weight Stationary (WS) Dataflow {lang="en"}

Definition: Each filter weight remains stationary in the RF to maximize convolutional reuse and filter reuse. Once a weight is fetched from DRAM to the RF of a PE, the PE runs through all NE2 operations that use the same filter weight.

Processing: R × R weights from the same filter and channel are laid out to a region of R×R PEs and stay stationary. Each pixel in an ifmap plane from the same channel is broadcast to the same R×R PEs sequentially, and the psums generated by each PE are further accumulated spatially across these PEs. Multiple planes of R × R weights from different filters and/or channels can be deployed either across multiple R×R PEs in the array or onto the same R × R PEs.

Hardware Usage: The RF is used to store the stationary filter weights. Due to the operation scheduling that maximally reuses stationary weights, psums are not always immediately reducible, and will be temporarily stored to the global buffer. If the buffer is not large enough, the number of psums that are generated together has to be limited, and therefore limits the number of filters that can be loaded on-chip at a time.

Examples: Variants of the WS dataflow appear in [15–17, 19, 25, 26].

### B. Output Stationary (OS) Dataflow {lang="en"}

Definition: The accumulation of each ofmap pixel stays stationary in a PE. The psums are stored in the same RF for accumulation to minimize the psum accumulation cost.

Processing: This type of dataflow uses the space of the PE array to process a region of the 4D ofmap at a time. To select a region out of the high-dimensional space, there are two choices to make: (1) multiple ofmap channels (MOC) vs. single ofmap channels (SOC), and (2) multiple ofmap-plane pixels (MOP) vs. single ofmap-plane pixels (SOP). This creates three practical OS dataflow subcategories: SOC-MOP, MOC-MOP, and MOC-SOP.

- SOC-MOP is used mainly for CONV layers, and focuses on processing a single plane of ofmap at a time. It further maximizes convolutional reuse in addition to psum accumulation.
- MOC-MOP processes multiple ofmap planes with multiple pixels in the same plane at a time. By doing so, it tries to further exploit both convolutional reuse and ifmap reuse.
- MOC-SOP is used mainly for FC layers, since it processes multiple ofmap channels but with only one pixel in a channel at a time. It focuses on further exploiting ifmap reuse.

The difference between the three OS dataflows is illustrated in Fig. 3. All additional input data reuse is exploited at the array level, i.e., inter-PE communication. The RF level only handles psum accumulation.

Hardware Usage: All OS dataflows use the RF for psum storage to achieve stationary accumulation. In addition, SOCMOP and MOC-MOP require additional RF storage for ifmap buffering to exploit convolutional reuse within the PE array.

Examples: A variant of MOC-MOP dataflow appears in [20], and variants of SOC-MOP and MOC-SOP dataflows appear in [23] and [18]. Note that the MOC-MOP variant in [20] does not exploit convolutional data reuse since it simply treats the convolutions as a matrix multiplication.

### C. No Local Reuse (NLR) Dataflow {lang="en"}

Definition: The NLR dataflow has two major characteristics: (1) it does not exploit data reuse at the RF level, and (2) it uses inter-PE communication for ifmap reuse and psum accumulation.

Processing: NLR divides the PE array into groups of PEs. PEs within the same group read the same ifmap pixel but with different filter weights from the same input channel. Different PE groups read ifmap pixels and filter weights from different input channels. The generated psums are accumulated across PE groups in the whole array.

Hardware Usage: There is no RF storage required by the NLR dataflow. Since the PE array is simply composed of ALU datapaths, it leaves a large area for the global buffer, which is used to store psums as well as input data for reuse.

Examples: Variants of the NLR dataflow appear in [21, 22, 24]. In [22], special registers are implemented at the end of each PE array column to hold the psums, which reduces the number of global buffer R/W for psums.

## V. ENERGY-EFFICIENT DATAFLOW: ROW STATIONARY {lang="en"}

While existing dataflows attempt to maximize certain types of input data reuse or minimize the psum accumulation cost, they fail to take all of them into account at once. This results in inefficiency when the layer shape or hardware resources vary. Therefore, it would be desirable if the dataflow could adapt to different conditions and optimize for all types of data movement energy costs. In this section, we will introduce a novel dataflow, called row stationary (RS) that achieves this goal. The RS dataflow is a key feature of the Eyeriss architecture, which has been implemented in a fabricated chip [41] (Fig. 4), and whose functionality has been verified using AlexNet.

### A. 1D Convolution Primitives {lang="en"}

The implementation of the RS dataflow in Eyeriss is inspired by the idea of applying a strip mining technique in a spatial architecture [42]. It breaks the high-dimensional convolution down into 1D convolution primitives that can run in parallel; each primitive operates on one row of filter weights and one row of ifmap pixels, and generates one row of psums. Psums from different primitives are further accumulated together to generate the ofmap pixels. The inputs to the 1D convolution come from the storage hierarchy, e.g., the global buffer or DRAM.

Each primitive is mapped to one PE for processing; therefore, the computation of each row pair stays stationary in the PE, which creates convolutional reuse of filter weights and ifmap pixels at the RF level. An example of this sliding window processing is shown in Fig. 5. However, since the entire convolution usually contains hundreds of thousands of primitives, the exact mapping of all primitives to the PE array is non-trivial, and will greatly affect the energy efficiency.

### B. Two-Step Primitive Mapping {lang="en"}

To solve this problem, the primitive mapping is separated into two steps: logical mapping and physical mapping. The logical mapping first deploys the primitives into a logical PE array, which has the same size as the number of 1D convolution primitives and is usually much larger than the physical PE array in hardware. The physical mapping then folds the logical PE array so it fits into the physical PE array. Folding implies serializing the computation, and is determined by the amount of on-chip storage, including both the global buffer and local RF. The two mapping steps happen statically prior to runtime, so no on-line computation is required.

Logical Mapping: Each 1D primitive is first mapped to one logical PE in the logical PE array. Since there is considerable spatial locality between the PEs that compute a 2D convolution in the logical PE array, we group them together as a logical PE set. Fig. 6 shows a logical PE set, where each filter row and ifmap row are horizontally and diagonally reused, respectively, and each row of psums is vertically accumulated. The height and width of a logical PE set are determined by the filter height (R) and ofmap height (E), respectively. Since the number of 2D convolutions in a CONV layer is equal to the product of number of ifmap/filter channels (C), number of filters (M) and fmap batch size (N), the logical PE array requires N ×M ×C logical PE sets to complete the processing of an entire CONV layer.

Physical Mapping: Folding means mapping and then running multiple 1D convolution primitives from different logical PEs on the same physical PE. In the RS dataflow, folding is done at the granularity of logical PE sets for two reasons. First, it preserves intra-set convolutional reuse and psum accumulation at the array level (inter-PE communication) as shown in Fig. 6. Second, there exists more data reuse and psum accumulation opportunities across the N ×M ×C sets: the same filter weights can be shared across N sets (filter reuse), the same ifmap pixels can be shared across M sets (ifmap reuse), and the psums across each C sets can be accumulated together. Folding multiple logical PEs from the same position of different sets onto a single physical PE exploits input data reuse and psum accumulation at the RF level; the corresponding 1D convolution primitives run on the same physical PE in an interleaved fashion. Mapping multiple sets spatially across the physical PE array also exploits those opportunities at the array level. The exact amount of logical PE sets to fold and to map spatially at each of the three dimensions, i.e., N, M, and C, are determined by the RF size and physical PE array size, respectively. It then becomes an optimization problem to determine the best folding by using the framework in Section VI-C to evaluate the results.

After the first phase of folding as discussed above, the physical PE array can process a number of logical PE sets, called a processing pass. However, a processing pass still may not complete the processing of all sets in the CONV layer. Therefore, a second phase of folding, which is at the granularity of processing passes, is required. Different processing passes run sequentially on the entire physical PE array. The global buffer is used to further exploit input data reuse and store psums across passes. The optimal amount of second phase folding is determined by the global buffer size, and also requires an optimization using the analysis framework.

### C. Energy-Efficient Data Handling {lang="en"}

To maximize energy efficiency, the RS dataflow is built to optimize all types of data movement by maximizing the usage of the storage hierarchy, starting from the low-cost RF to the higher-cost array and global buffer. The way each level handles data is described as follows.

RF: By running multiple 1D convolution primitives in a PE after the first phase folding, the RF is used to exploit all types of data movements. Specifically, there are convolutional reuse within the computation of each primitive, filter reuse and ifmap reuse due to input data sharing between folded primitives, and psum accumulation within each primitive and across primitives.

Array (inter-PE communication): Convolutional reuse exists within each set and is completely exhausted up to this level. Filter reuse and ifmap reuse can be achieved by having multiple sets mapped spatially across the physical PE array. Psum accumulation is done within each set as well as across sets that are mapped spatially.

Global Buffer: Depending on its size, the global buffer is used to exploit the rest of filter reuse, ifmap reuse and psum accumulation that remain from the RF and array levels after the second phase folding.

### D. Support for Different Layer Types {lang="en"}

While the RS dataflow is designed for the processing of high-dimensional convolutions in the CONV layers, it can also support two other layer types naturally:

FC Layer: The computation of FC layers is the same as CONV layers, but without convolutional data reuse. Since the RS dataflow exploits all types of data movement, it can still adapt the hardware resources to cover filter reuse, ifmap reuse and psum accumulation at each level of the storage hierarchy. There is no need to switch between different dataflows as in the case between SOC-MOP and MOC-SOP OS dataflows.

POOL Layer: By swapping the MAC computation with a MAX comparison function in the ALU of each PE, the RS dataflow can also process POOL layers by assuming N = M = C = 1 and running each fmap plane separately.

### E. Other Architectural Features {lang="en"}

In the Eyeriss architecture, the dataflow in Fig. 6 is handled using separate NoCs for the three data types: global multicast NoCs for the ifmaps and filters, and a local PE-to-PE NoC for the psums. The architecture can also exploit sparsity by (1) only performing data reads and MACs on non-zero values and (2) compressing the data to reduce data movement. Details on these techniques are described in [41]. This brings additional energy savings on top of the efficient dataflow presented in this paper.

## VI. EXPERIMENTAL METHODOLOGY {lang="en"}

### A. Dataflow Implementation {lang="en"}

A simulation model of each dataflow is implemented for the energy efficiency analysis using our proposed framework (Section VI-C). For the RS dataflow, we have implemented the model as described in Section V and it is verified by the measurement results of the Eyeriss chip. For each of the existing dataflows, however, different variants are demonstrated in previous designs. Therefore, our implementations of existing dataflows try to find the common ground that represents their key characteristics, and is described as follows:

Weight Stationary: Each PE holds a single weight in the RF at a time. The psum generated in a PE at each cycle is either passed to its neighbor PE or stored back to the global buffer, and the PE array operates as a systolic array with little local control. This also leaves a large area for the global buffer, which is crucial to the operation of WS dataflow.

Output Stationary: Each PE runs the psum accumulation of a single ofmap pixel at a time. We also model the MOCMOP OS dataflow to capture convolutional reuse in the PE array, which exploits more reuse compared with the plain matrix multiplication implementation in [20]. Unlike SOCMOP, which dedicates the PE array for 2D convolutional reuse, the MOC-MOP model uses the PE array for both 1D convolutional reuse and ifmap reuse.

No Local Reuse: The PE array consists of only ALU datapaths with no local storage. All types of data, including ifmaps, filters and psums, are stored in the global buffer.

### B. Setup for Dataflow Comparison {lang="en"}

To compare the performance of different dataflows, the constraints of a fixed total hardware area and the same processing parallelism are imposed, i.e., all dataflows are given the same number of PEs with the same storage area, which includes the global buffer and RF. Based on the storage requirement of each dataflow, the storage area can be divided up differently between the global buffer and RF across dataflows. For example, RS can use a larger RF for better data reuse, but NLR does not require a RF at all.

In our simulations, a baseline storage area for a given number of PEs is calculated as

#PE×Area(512B RF) +Area((#PE×512B) global buffer). (2)

For instance, with 256 PEs, the baseline storage area for all dataflows is calculated from the setup with 512B RF/PE and an 128kB global buffer. This baseline storage area is then used to calculate the size of the global buffer and RF in bytes for each dataflow. The total on-chip storage size will then differ between dataflows because the area cost per byte depends on the size and type of memory used as shown in Fig. 7a. In general, the area cost per byte in the RF is higher than the global buffer due to its smaller size, and thus the dataflows requiring a larger RF will have a smaller overall on-chip storage size. Fig. 7b shows the on-chip storage sizes of all dataflows under a 256-PE SA. We fix the RF size in RS dataflow at 512B since it shows the lowest energy consumption using the analysis described in Section VI-C. The difference in total on-chip storage size can go up to 80kB. For the global buffer alone, the size difference is up to 2.6×. This difference in storage size will be considered when we discuss the results in Section VII.

The accelerator throughput is assumed to be proportional to the number of active PEs for a dataflow. Although throughput is also a function of data movement, since it adds latency when there is limited storage bandwidth, there are many existing techniques commonly used to compensate for the impact, such as prefetching, double buffering, caching and pipelining. For CNN acceleration, these techniques are quite effective at hiding latency. Therefore, data movement is not expected to impact overall throughput significantly.

### C. Framework for Energy Efficiency Analysis {lang="en"}

The way each MAC operation in Eq. (1) fetches inputs (filter weight and ifmap pixel) and accumulates psums introduces different energy costs due to two factors:

- how the dataflow exploits input data reuse and psum accumulation scheduling as described in Section III-B.
- fetching data from different storage elements in the architecture have different energy costs.

The goal of an energy-efficient CNN dataflow is then to perform most data accesses using the data movement paths with lower energy cost. This is an optimization process that takes all data accesses into account, and will be affected by the layer shape and available hardware resources.

In this section, we will describe a framework that can be used as a tool to optimize the dataflows for spatial architectures. Specifically, it defines the energy cost for each level of the storage hierarchy in the architecture. Then, it provides a simple methodology to incorporate any given dataflow into an analysis using this hierarchy to quantify the overall data movement energy cost. This allows for a search for the optimal mapping for a dataflow that results in the best energy efficiency for a given CNN layer shape. For example, it describes the folding of the logical PEs onto physical PEs. For all of the dataflows, this takes into account folding in each of the three dimensions, i.e., number of filters, images and/or channels. It optimizes to maximize reuse of data in the RF, array and global buffer.

Data Movement Hierarchy: As defined in Section II, the SA accelerator provides four levels of storage hierarchy. Sorting their energy cost for data accesses from high to low, it includes DRAM, global buffer, array (inter-PE communication) and RF. Fetching data from a higher-cost level to the ALU incurs higher energy consumption. Also, the energy cost of moving data between any of the two levels is dominated by the one with higher cost. Similar to the energy consumption quantification in previous experiments [11, 12, 43], Table IV shows the energy cost of accessing each level relative to a MAC operation under the listed conditions. The numbers are extracted from a commercial 65nm process. The DRAM and global buffer energy costs aggregate the energy of accessing the storage and the iFIFO/oFIFO; the array energy cost includes the energy of accessing the iFIFO/oFIFO/pFIFO on both sides of the path as well as the cost from wiring capacitance.

Analysis Methodology: Given a dataflow, the analysis is formulated in two parts: (1) the input data access energy cost, including filters and ifmaps, and (2) the psum accumulation energy cost. The energy costs are quantified through counting the number of accesses to each level of the previously defined hierarchy, and weighting the accesses at each level with a cost from Table IV. The overall data movement energy of a dataflow is obtained through combining the results from the two types of input data and the psums.

1. Input Data Access Energy Cost: If an input data value is reused for many operations, ideally the value is moved from DRAM to RF once, and the ALU reads it from the RF many times. However, due to limited storage and operation scheduling, the data is often kicked out of the RF before exhausting reuse. The ALU then needs to fetch the same data again from a higher-cost level to the RF. Following this pattern, data reuse can be split across the four levels. Reuse at each level is defined as the number of times each data value is read from this level to its lower-cost levels during its lifetime. Suppose the total number of reuses for a data value is a × b × c × d, it can be split into reuses at DRAM, global buffer, array and RF for a, b, c, and d times, respectively. An example is shown in Fig. 8, in which case the total number of reuse, 24, is split into a = 1, b = 2, c = 3 and d = 4. The energy cost estimation for this reuse pattern is:

a × EC(DRAM)+ab × EC(global buffer)+ abc × EC(array)+abcd × EC(RF), (3)

where EC(·) is the energy cost from Table IV. 1

2. Psum Accumulation Energy Cost: Psums travel between ALUs for accumulation through the 4-level hierarchy. In the ideal case, each generated psum is stored in a local RF for further accumulation. However, this is often not achievable due to the overall operation scheduling, in which case the psums have to be stored to a higher-cost level and read back again afterwards. Therefore, the total number of accumulations, a×b×c×d, can also be split across the four levels. The number of accumulation at each level is defined as the number of times each data goes in and out of its lower-cost levels during its lifetime. An example is shown in Fig. 9, in which case the total number of accumulations, 36, is split into a = 2, b = 3, c = 3 and d = 2. The energy cost can then be estimated as

(2a −1)× EC(DRAM)+2a(b −1)× EC(global buffer)+ ab(c −1)× EC(array)+2abc(d −1)× EC(RF). (4)

The factor of 2 accounts for both reads and writes. Note that in this calculation the accumulation of the bias term is ignored, as it has negligible impact on overall energy.

3. Obtaining the Parameters: For each dataflow, there exists a set of parameters (a, b, c, d) for each of the three data types, i.e., ifmap, filter and psum, that describes the optimal mapping in terms of energy efficiency under a given CNN layer shape. It is obtained through an optimization process with objective functions defined in Eq. (3) and (4). The optimization is constrained by the hardware resources, including the size of the global buffer, RF and PE array.

### D. Dataflow Modeling Side Note {lang="en"}

While we charge the same energy cost at each level of the storage hierarchy across all dataflows, the real cost varies due to the actual implementation required by each dataflow. For example, a larger global buffer should be charged with a higher energy cost, which is the case for all dataflows other than RS. At array level, short-distance transfers, such as communicating with a neighbor PE, should be charged a lower energy cost than longer-distance transfers, such as broadcast or direct global buffer accesses from all PEs, due to smaller wiring capacitance and simpler NoC design. In this case, WS, OSA, OSC and NLR might see a bigger impact since they all have long-distance array transfers. At the RF level, a smaller RF should be charged with less energy cost. Except for RS and OSA, the other dataflows will see a reduction in RF access energy. Overall, however, we find our results to be conservative for RS compared to the other dataflows.
:::

::: zh-CN
## I. 介绍

深度学习[1]，尤其是深度卷积神经网络（CNN）的近期流行，可以归因于其在对象识别[2-5]、检测[6, 7]和场景理解[8]等任务中实现前所未有的准确性。这些最先进的CNN[2-5]比1990年代使用的网络大几个数量级，滤波器权重存储需要达到数百兆字节，并且每个输入像素需要进行30k-600k次操作。

这些网络的大规模给底层处理硬件带来了吞吐量和能效的挑战。卷积操作占CNN操作的90%以上，并主导运行时间[10]。尽管这些操作可以利用高度并行的计算范式（如SIMD/SIMT），但由于伴随的带宽需求，吞吐量可能无法相应提升，而能耗仍然较高，因为数据移动的成本可能超过计算成本[11-13]。为了在不影响吞吐量的情况下实现节能的CNN处理，我们需要开发支持并行处理并最小化数据移动的数据流。同时，还需要考虑数据存储位置对数据移动能耗的影响。例如，从外部DRAM提取数据的能耗比从片上存储器提取数据高几个数量级[11, 12]。

许多之前的论文在各种平台上提出了专门的CNN数据流，包括GPU[14]、FPGA[15-21]和ASIC[22-26]。然而，由于技术、硬件资源和系统设置的差异，不同实现之间的直接比较并不能提供关于不同数据流相对能效的太多见解。本文将评估在相同硬件资源约束下（即面积、处理并行性和技术）的各种CNN数据流的能效，并基于此评估提出一种新颖的数据流，以最大化CNN加速的能效。

为了评估能耗，我们将空间架构中的数据移动按其能耗分为几个层次，然后分析每个数据流，评估其在每个层次的数据移动情况。该分析框架提供了对每个数据流如何利用不同架构资源进行不同类型的数据移动的深入见解，也为比较不同数据流之间的能效差异提供了一种可量化的方法。

以往提出的数据流通常优化某一类型的数据移动，如输入数据重用或部分和累加。通过我们的分析框架，我们展示了一种利用所有类型的数据重用并考虑存储层次中不同层次数据移动能耗的数据流，可以带来显著的能量节省。总结而言，本工作的主要贡献包括：

- 一个分类法，用于将现有的CNN数据流分类（第四部分）。
- 基于一种新CNN数据流的空间架构，称为行静态（row stationary），其针对吞吐量和能效进行了优化。它适用于卷积层和全连接层，并优化了存储层次中的所有类型的数据移动。该数据流也已在一款制造的芯片上得到验证（第五部分）。
- 一个分析框架，可以在相同的硬件约束下量化不同CNN数据流的能效，并能够为每个数据流搜索最节能的映射。该分析模型使用来自商业65nm工艺的能耗/面积数据，所有的读/写数据均基于实际的CNN形状配置，如AlexNet，精确计算得出（第六部分C）。
- 针对各种CNN数据流，我们对与数据移动相关的能耗以及不同类型数据重用的影响进行了比较分析（第七部分）。

## II. 空间架构

空间架构（SAs）是一类加速器，能够通过在一组相对简单的处理引擎（PEs）之间进行直接通信来利用高度的计算并行性。它们可以被设计或编程以支持不同的算法，并通过专门的数据流将算法映射到PEs上。与SIMD/SIMT架构相比，SAs特别适用于数据流表现出生产者-消费者关系或能够在PE区域内高效共享数据的应用。

SAs有两种类型：粗粒度SAs，由通过片上网络连接在一起的ALU风格的PEs组成的平铺阵列[27-29]；细粒度SAs，通常以FPGA的形式存在。粗粒度SAs的预期性能优势和广泛的设计空间激发了大量关于其架构、控制方案、操作调度和数据流模型的研究。

粗粒度空间架构（SAs）目前是专用CNN加速器的热门实现选择，原因有两个。首先，CNN层中的操作（如卷积、全连接、池化等，详见第三部分A）是统一的，并表现出高度的并行性，使用并行的ALU风格PEs可以很自然地进行计算。其次，直接的PE间通信可以非常有效地用于（1）传递部分和以实现空间分布式累加，或（2）共享相同的输入数据以进行并行计算，而不会导致更高能耗的数据传输。ASIC实现通常部署数十到数百个PEs，并专门为CNN计算优化PE的数据路径[22-26]。FPGA也被用于构建CNN加速器，这些设计通常使用集成的DSP单元构建PE的数据路径[15-21]。然而，无论哪种设计类型，挑战在于将CNN的数据流准确映射到SA上，因为这对最终的吞吐量和能效有很大影响。

图1展示了本文用于CNN处理的加速器系统的高级框图。该系统由一个空间架构（SA）加速器和片外DRAM组成。输入数据可以从CPU或GPU卸载到DRAM，由加速器进行处理，然后输出结果写回DRAM，供主处理器进一步解释。

SA加速器主要由全局缓冲器和PE阵列组成。DRAM、全局缓冲器和PE阵列通过输入和输出FIFO（iFIFO/oFIFO）进行通信。全局缓冲器可以用于利用输入数据的重用并隐藏DRAM访问延迟，或者用于存储中间数据。目前，用于CNN加速的全局缓冲器的典型大小约为100–300kB。PE阵列中的PE通过片上网络（NoC）连接，NoC的设计取决于数据流的需求。每个PE包含一个ALU数据路径，能够进行乘加运算（MAC）和加法运算，另外还包括一个寄存器文件（RF）作为本地暂存器，以及一个PE FIFO（pFIFO）用于控制进出ALU的数据流量。不同的数据流需要不同大小的RF，范围从零到几百字节不等，典型的RF大小为每个PE小于1kB。整体而言，该系统为数据访问提供了四级存储层次，分别是DRAM、全局缓冲器、阵列（PE间通信）和RF。访问不同层次的数据意味着不同的能耗成本，其中DRAM的能耗最高，RF的能耗最低。
 
## III. CNN的背景

### A. 基础

卷积神经网络（CNN）是通过将多个计算层堆叠为一个有向无环图构建的[36]。通过每一层的计算，输入数据的高级抽象形式——称为特征图（feature map，fmap）——被提取出来，以保留重要但独特的信息。现代CNN通过使用非常深的层次结构来实现卓越的性能。

CNN的主要计算发生在卷积（CONV）层中，该层执行高维卷积运算。从五层[2]到数百层[5]的CONV层通常用于当前的CNN模型中。CONV层将滤波器应用于输入特征图（ifmaps），以提取嵌入的视觉特征并生成输出特征图（ofmaps）。滤波器和特征图的维度均为四维结构：每个滤波器或特征图是由多个二维平面（即通道）组成的三维结构，而一个卷积层中的一组三维滤波器将处理一批三维输入特征图。此外，还会有一个一维偏置（bias）加到卷积结果中。根据表I中的形状参数，卷积层的计算定义为：

$$
O[z][u][x][y] = B[u] +  
C^{-1} \sum_{k=0}^{R-1} \sum_{i=0}^{R-1} \sum_{j=0}^{R-1} I[z][k][U_x + i][U_y + j] \times W[u][k][i][j], 
$$
$$
0 \leq z < N, \quad 0 \leq u < M, \quad 0 \leq x, y < E, \quad E = \frac{H - R + U}{U}.\quad (1)  
$$

其中，O、I、W 和 B 分别是输出特征图、输入特征图、滤波器和偏置的矩阵。U 是指定的步幅大小。图2展示了该计算的可视化（忽略偏置）。

在卷积层（CONV）之后，通常会堆叠少量（例如3个）全连接层（FC），用于分类目的。全连接层同样像卷积层一样对输入特征图（ifmaps）应用滤波器，但滤波器的大小与输入特征图相同。因此，它不像卷积层那样具有权重共享的特性。全连接层的计算仍遵循公式（1），但在形状参数上有一些额外的约束：H = R，E = 1，U = 1。

在卷积层和全连接层之间，还可以选择性地添加其他层，如池化层（POOL）和归一化层（NORM）。每个卷积层和全连接层之后，通常紧跟着一个激活层（ACT），例如整流线性单元（ReLU）。

### B. CNN处理中的挑战

在大多数广泛使用的CNN中，例如AlexNet [2] 和VGG16 [3]，卷积层（CONV）占据了整体操作的90%以上，并产生了大量的数据移动。因此，它们对CNN的吞吐量和能效有显著影响。尽管全连接层（FC）使用了大部分的滤波器权重，但最近的研究表明，这些权重可以压缩至原始大小的1%至5% [38]，极大地减少了全连接层的影响。池化层（POOL）的处理可以与卷积层使用相同的计算方案，因为其计算是公式（1）的简化形式，其中乘加运算（MAC）被最大值操作（MAX）替代。激活层（ACT）的计算非常简单，而归一化层（NORM）的支持由于其在最近CNN中的减少使用[3, 5]，我们认为可以省略。

处理卷积层和全连接层面临两个挑战：数据处理和自适应处理。以下是各个细节的描述。

**数据处理**：虽然公式（1）中的MAC操作可以在高度并行的情况下运行，这极大地提高了吞吐量，但也带来了两个问题。首先，直接从DRAM读取所有MAC的输入数据需要高带宽并导致高能耗。其次，平行的MAC操作同时生成了大量中间数据，即部分和（psums），这会带来存储压力，并且如果不立即处理（即累加），会消耗额外的内存读写能量。

幸运的是，第一个问题可以通过利用不同类型的输入数据重用来缓解：

- **卷积重用**：由于卷积层中的权重共享特性，一小部分独特的输入数据可以在许多操作中共享。每个滤波器权重在同一个输入特征图（ifmap）平面内会重复使用 $E^2$ 次，每个输入特征图像素（即激活值）通常在同一个滤波器平面内会重复使用 $R^2$ 次。然而，全连接层（FC）不具备这种数据重用特性。
- **滤波器重用**：在卷积层和全连接层中，每个滤波器权重还会在批处理的 $N$ 个输入特征图（ifmaps）中进一步重用。
- 输入特征图重用：在卷积层和全连接层中，每个输入特征图像素还会在 $M$ 个滤波器中进一步重用（以生成 $M$ 个输出通道）。

第二个问题可以通过适当的操作调度来处理，这样可以尽快将生成的部分和（psums）进行累加，从而节省存储空间和内存读写能量。$CR^2$ 个部分和最终被累加为一个输出特征图像素。

然而，最大化输入数据重用与立即进行部分和的累加无法同时实现，因为使用相同滤波器或输入特征图值的MAC操作生成的部分和不能被累加。为了实现高吞吐量和能效，底层的CNN数据流需要同时考虑输入数据重用和部分和累加的调度。

**自适应处理**：表I中展示的众多形状参数引发了卷积层（CONV）和全连接层（FC）可能出现的多种形状组合。即使在同一个CNN模型中，每层也可能具有不同的形状配置。表II展示了AlexNet的形状配置作为示例。因此，硬件架构不能被硬编码为只能处理特定的形状。相反，数据流必须对不同形状保持高效，并且硬件架构必须是可编程的，能够动态映射到高效的数据流上。

### C. CNN vs. 图像处理

在卷积神经网络（CNN）成为主流之前，已经有大量关于高效卷积的研究，这是因为卷积在图像信号处理（ISP）中有广泛的应用。为处理卷积，许多高吞吐量的ISP技术也被提出，包括在多处理器和SIMD指令中使用的分块策略。然而，这些技术无法直接应用于CNN处理，原因有两点：

- CNN中的滤波器权重是通过训练获得的，而不是在处理系统中固定的。因此，它们可能消耗大量的I/O带宽和片上存储，有时与输入特征图（ifmaps）相比不相上下。
- ISP技术主要是为2D卷积而开发的，它们没有优化数据重用的处理资源，也没有解决CNN中4D卷积的非平凡部分和（psum）累加问题。

## IV. 现有CNN数据流

之前有许多人 [15-26] 提出了 CNN 加速解决方案，但由于实现和设计选择上的差异，很难直接比较它们的性能。在本节中，我们将根据现有 CNN 数据流的数据处理特性对其进行分类。以下是对这些数据流的描述，表 III 汇总了这些数据流。

### A. 权重固定（WS）数据流

定义：每个滤波器权重保持静止在寄存器文件（RF）中，以最大化卷积重用和滤波器重用。一旦权重从DRAM获取到PE的RF中，该PE会执行所有使用相同滤波器权重的NE²操作。

处理过程：来自同一滤波器和通道的R×R权重被分布到R×R的PE区域，并保持静止。同一通道中的ifmap平面上的每个像素依次广播到R×R的PEs，PE生成的部分和（psums）在这些PEs中进一步进行空间积累。来自不同滤波器和/或通道的多个R×R权重平面可以分布在阵列中的多个R×R PEs上，或者部署到相同的R×R PEs上。

硬件使用：RF用于存储静止的滤波器权重。由于操作调度最大化重用了静止的权重，psums并不总是能立即被累加，而是会暂时存储在全局缓冲区。如果缓冲区不足够大，必须限制一起生成的psums数量，因此限制了可以一次加载到片上的滤波器数量。

示例：WS数据流的变种出现在文献[15–17, 19, 25, 26]中。

### B. 输出固定 (OS) 数据流

定义：每个输出特征图（ofmap）像素的累加保持在PE中。部分和（psums）存储在同一寄存器文件（RF）中进行累加，以最小化psums累加的成本。

处理过程：这种数据流使用PE阵列的空间一次处理4D输出特征图的一部分。为了从高维空间中选择一个区域，有两个选择：(1) 多个输出通道（MOC） vs. 单个输出通道（SOC），(2) 多个输出平面像素（MOP） vs. 单个输出平面像素（SOP）。这创造了三种实际的OS数据流子类别：SOC-MOP、MOC-MOP 和 MOC-SOP。

- SOC-MOP 主要用于卷积层（CONV layers），一次处理单个输出平面，除了psums累加外，还进一步最大化卷积重用。
- MOC-MOP 一次处理多个输出平面，并在同一平面中处理多个像素。这样可以进一步利用卷积重用和输入特征图（ifmap）重用。
- MOC-SOP 主要用于全连接层（FC layers），一次处理多个输出通道，但每个通道中只处理一个像素，主要侧重于进一步利用ifmap重用。

三种OS数据流的差异如图3所示。所有额外的输入数据重用都在阵列级别上进行，即PE之间的通信。RF级别仅处理psums的累加。

硬件使用：所有输出静态（OS）数据流使用寄存器文件（RF）来存储部分和（psums），以实现静态累加。此外，SOC-MOP 和 MOC-MOP 数据流需要额外的RF存储来缓冲输入特征图（ifmap），以在PE阵列内进一步利用卷积重用。

示例：MOC-MOP 数据流的变体出现在[20]中，而 SOC-MOP 和 MOC-SOP 数据流的变体分别出现在[23]和[18]中。需要注意的是，[20]中的 MOC-MOP 变体并没有利用卷积数据重用，因为它只是将卷积视为矩阵乘法。

### C. 无局部重用（NLR）数据流

定义：NLR 数据流具有两个主要特点：

1. 它不在寄存器文件（RF）级别利用数据重用。
2. 它通过PE之间的通信实现输入特征图（ifmap）重用和部分和（psum）累加。

处理：NLR 数据流将 PE 阵列划分为多个 PE 组。同一组内的 PE 读取相同的 ifmap 像素，但使用来自相同输入通道的不同滤波权重。不同的 PE 组读取来自不同输入通道的 ifmap 像素和滤波权重。生成的 psum 在整个阵列中的 PE 组之间进行累加。

硬件使用：NLR 数据流不需要 RF 存储。由于 PE 阵列仅由 ALU 数据路径组成，这为全局缓冲区提供了较大的空间，该缓冲区用于存储 psum 以及用于重用的输入数据。

示例：NLR 数据流的变体出现在[21]、[22] 和 [24]中。在[22]中，每列 PE 阵列末端实现了专用寄存器来存储 psum，从而减少了 psum 的全局缓冲区读写次数。

## V. 高能效数据流： 行静态

尽管现有的数据流尝试最大化某些类型的输入数据重用或最小化部分和（psum）累加成本，但它们未能同时考虑所有因素。这导致了当层形状或硬件资源变化时效率低下。因此，如果数据流能够适应不同条件并优化所有类型的数据移动能量成本，将是理想的。在本节中，我们将介绍一种新颖的数据流，称为行驻留（RS），它可以实现这一目标。RS 数据流是 Eyeriss 架构的关键特性之一，该架构已被实现于一块制造的芯片中（图 4），并通过 AlexNet 进行了功能验证。

### A. 一维卷积基本操作

Eyeriss 中 RS 数据流的实现灵感来自于在空间架构中应用“条带挖掘”（strip mining）技术。它将高维卷积分解为可以并行运行的一维卷积基本操作；每个基本操作处理一行滤波器权重和一行输入特征图（ifmap）像素，生成一行部分和（psums）。来自不同基本操作的 psums 进一步累加在一起，生成输出特征图（ofmap）像素。1D 卷积的输入数据来自存储层次结构，例如全局缓冲区或 DRAM。

每个基本操作都映射到一个 PE 进行处理；因此，每对行的计算在 PE 中保持驻留，这在 RF 级别上实现了滤波器权重和 ifmap 像素的卷积重用。图 5 显示了这一滑动窗口处理的示例。然而，由于整个卷积通常包含数十万个基本操作，所有基本操作的确切映射到 PE 阵列的方式并不简单，这将极大地影响能量效率。

### B. 两步基本操作映射

为了解决这一问题，基本操作的映射分为两步：逻辑映射和物理映射。逻辑映射首先将基本操作部署到一个逻辑 PE 阵列中，该阵列的大小与一维卷积基本操作的数量相同，通常远大于硬件中的物理 PE 阵列。物理映射则将逻辑 PE 阵列折叠，使其适应物理 PE 阵列。折叠意味着对计算进行序列化，并由片上存储量（包括全局缓冲区和本地 RF）决定。这两个映射步骤在运行前静态完成，因此无需在线计算。

**逻辑映射**：

每个一维基本操作首先被映射到逻辑 PE 阵列中的一个逻辑 PE。由于计算二维卷积的逻辑 PE 阵列中的 PE 之间具有显著的空间局部性，我们将它们分组为一个逻辑 PE 集。图 6 显示了一个逻辑 PE 集，在该集内，每行滤波器和输入特征图行分别进行水平和对角线重用，而每行部分和（psums）则进行垂直累加。逻辑 PE 集的高度和宽度分别由滤波器高度 $R$ 和输出特征图高度 $E$ 决定。由于一个卷积层中的二维卷积数等于输入特征图/滤波器通道数 $C$ 、滤波器数 $M$ 和特征图批处理大小 $N$ 的乘积，逻辑 PE 阵列需要 $N\times M\times C$ 个逻辑 PE 集来完成整个卷积层的处理。

**物理映射**:

在RS 数据流中，折叠意味着将来自不同逻辑 PE 的多个一维卷积基本操作映射并运行在同一个物理 PE 上。折叠的粒度是在逻辑 PE 集上进行的，主要有两个原因：

它保留了集内卷积的重用和部分和 (psum) 在阵列级别上的累加机会（PE 之间的通信），如图 6 所示。
在  $N\times M\times C$ 个逻辑 PE 集之间存在更多的重用和部分和累加机会：相同的滤波器权重可以在  $N$ 个集之间共享（滤波器重用），相同的输入特征图像素可以在 $M$ 个集之间共享（输入特征图重用），并且每 $C$ 个集中的部分和可以一起累加。
将多个逻辑 PE 集中的同一位置映射到单个物理 PE 上，可以在寄存器文件 (RF) 级别利用输入数据的重用和部分和的累加；相应的一维卷积基本操作以交错的方式在同一个物理 PE 上运行。在物理 PE 阵列中空间映射多个逻辑 PE 集，也可以在阵列级别上利用这些机会。在每个维度 $N$ 、 $M$ 和 $C$ 上进行的逻辑 PE 集的折叠和空间映射的数量由 RF 大小和物理 PE 阵列的大小决定。此时，问题转化为通过使用第 VI-C 节的框架进行评估来确定最佳折叠方式的优化问题。经过上述第一阶段的折叠后，物理 PE 阵列可以处理若干逻辑 PE 集，这称为处理通道。然而，处理通道仍然可能无法完成卷积层中所有集的处理，因此需要第二阶段的折叠，粒度为处理通道。不同的处理通道在整个物理 PE 阵列上顺序运行。全局缓冲区用于在各通道之间进一步利用输入数据重用并存储部分和。第二阶段折叠的最佳数量由全局缓冲区的大小决定，且需要使用分析框架进行优化。

### C. 能源高效的数据处理

为了最大化能源效率，RS 数据流旨在优化所有类型的数据传输，充分利用存储层次结构，从低成本的寄存器文件 (RF) 开始，到更高成本的阵列和全局缓冲区。各级别处理数据的方式如下：

RF：在第一阶段折叠后，在一个 PE 中运行多个一维卷积基本操作，使 RF 能够利用所有类型的数据传输。具体来说，在每个基本操作的计算中存在卷积重用，由于折叠基本操作之间的输入数据共享，还实现了滤波器重用和输入特征图重用。此外，部分和 (psum) 的累加在每个基本操作内以及跨基本操作之间也得以实现。

阵列（PE 之间的通信）：在每个集内存在卷积重用，且在这一层级完全耗尽。通过在物理 PE 阵列中空间映射多个集，可以实现滤波器重用和输入特征图重用。部分和的累加在每个集内以及跨空间映射的集之间进行。

全局缓冲区：根据其大小，全局缓冲区用于利用在第二阶段折叠后，从 RF 和阵列级别剩余的滤波器重用、输入特征图重用和部分和累加。

### D. 对不同层类型的支持

虽然 RS 数据流是为处理 CONV 层中的高维卷积而设计的，但它也能自然支持另外两种层类型：

全连接层 (FC)：FC 层的计算与 CONV 层相同，但不涉及卷积数据重用。由于 RS 数据流利用所有类型的数据传输，它仍然可以调整硬件资源以覆盖每个存储层次中的滤波器重用、输入特征图重用和部分和累加，无需像 OS 数据流中的 SOC-MOP 和 MOC-SOP 之间那样切换。

池化层 (POOL)：通过将 ALU 中的 MAC 计算替换为 MAX 比较函数，RS 数据流也可以处理 POOL 层，假设 N = M = C = 1，并分别处理每个特征图平面。

### E. 其他架构特性

在 Eyeriss 架构中，如图 6 所示，数据流通过三种数据类型的独立网络互连 (NoCs) 处理：全局多播 NoC 用于输入特征图和滤波器，局部 PE 间 NoC 用于部分和。该架构还可以利用稀疏性，通过 (1) 仅对非零值执行数据读取和 MAC 运算，以及 (2) 压缩数据以减少数据移动。这些技术的详细信息在 [41] 中有所描述，为本文提出的高效数据流带来了额外的能量节省。

## VI. 实验方法

### A. 数据流实现

使用我们提出的框架（第 VI-C 节）对每种数据流进行了能效分析的仿真模型实现。对于 RS 数据流，我们已根据第 V 节描述的内容实现了模型，并通过 Eyeriss 芯片的测量结果进行了验证。然而，现有数据流的不同变体在之前的设计中有所体现。因此，我们对现有数据流的实现试图找到其关键特征的共同点，具体描述如下：

权重静态 (Weight Stationary)：每个 PE 在 RF 中同时持有单个权重。每个周期在 PE 中生成的部分和 (psum) 要么传递给其邻近的 PE，要么存储回全局缓冲区，PE 数组作为一个脉动阵列运行，几乎没有本地控制。这也为全局缓冲区留出了较大的区域，这对 WS 数据流的运行至关重要。

输出静态 (Output Stationary)：每个 PE 一次处理一个输出特征图 (ofmap) 像素的部分和累积。我们还对 MOC-MOP OS 数据流进行了建模，以捕获 PE 数组中的卷积重用，相比于 [20] 中的简单矩阵乘法实现，它利用了更多的重用。与 SOC-MOP 不同，后者将 PE 数组专用于 2D 卷积重用，MOC-MOP 模型同时利用 PE 数组进行 1D 卷积重用和输入特征图 (ifmap) 重用。

无本地重用 (No Local Reuse)：PE 数组仅由 ALU 数据通路组成，没有本地存储。所有类型的数据，包括输入特征图、滤波器和部分和，都存储在全局缓冲区中。

### B. 数据流比较设置

在比较不同数据流的性能时，我们施加了固定总硬件面积和相同处理并行度的约束，即所有数据流都拥有相同数量的处理单元（PE）和相同的存储区域，这包括全局缓冲区和寄存器文件（RF）。根据每种数据流的存储需求，可以在不同的数据流之间以不同方式划分存储区域。例如，行静态（RS）数据流可以使用更大的寄存器文件以实现更好的数据重用，而无本地重用（NLR）数据流则根本不需要寄存器文件。

在我们的仿真中，为给定数量的处理单元计算基准存储区域如下：

$$
PE×Area(512B RF) +Area((PE×512B) global buffer). (2)
$$

例如，对于256个处理单元（PE），所有数据流的基准存储区域是根据每个PE 512B的寄存器文件（RF）和128kB的全局缓冲区设置计算得出的。然后，这个基准存储区域用于计算每种数据流的全局缓冲区和寄存器文件的字节大小。由于每种数据流的面积成本每字节取决于所使用的内存类型和大小，因此芯片上的总存储大小在不同数据流之间会有所不同。如图7a所示，通常情况下，寄存器文件每字节的面积成本高于全局缓冲区，这是因为寄存器文件的大小较小，因此需要更大寄存器文件的数据流整体芯片存储大小会较小。图7b显示了在256-PE体系结构下所有数据流的芯片存储大小。我们在RS数据流中将RF大小固定为512B，因为根据第VI-C节中的分析，它显示出最低的能耗。总芯片存储大小的差异可以高达80kB。仅对于全局缓冲区，大小差异高达2.6倍。在讨论第VII节的结果时，将考虑这一存储大小的差异。

假设加速器的吞吐量与数据流的活动PE数量成正比。虽然吞吐量也是数据移动的函数，但当存储带宽有限时，这会增加延迟，因此通常使用许多现有技术来弥补影响，例如预取、双缓冲、缓存和流水线。这些技术在CNN加速中非常有效，可以隐藏延迟。因此，预计数据移动不会对整体吞吐量产生显著影响。

### C. 能效分析框架

每个MAC操作在Eq. (1)中获取输入（滤波器权重和ifmap像素）并累积部分和（psum）的方式引入了不同的能量成本，这主要受到两个因素的影响：

- 数据流如何利用输入数据重用和psum累积调度（详见第III-B节）。
- 从不同存储元素获取数据的能量成本不同。
- 
因此，能效高的CNN数据流的目标是尽可能使用低能量成本的数据传输路径进行数据访问。这是一个优化过程，需要考虑所有数据访问，并受到层形状和可用硬件资源的影响。

在这一节中，我们将描述一个可用于优化空间架构数据流的框架。具体来说，它定义了架构中每个存储层级的能量成本。然后，它提供了一种简单的方法，将任何给定的数据流纳入分析，使用这一层级来量化整体数据移动能量成本。这允许搜索一个数据流的最佳映射，从而为给定的CNN层形状实现最佳的能效。例如，它描述了如何将逻辑PE折叠到物理PE上。对于所有数据流，这都考虑了在三个维度（即滤波器数量、图像数量和/或通道数量）中的折叠。它的优化目标是最大化在RF、阵列和全局缓冲区中的数据重用。

数据移动层级：如第二节所定义，SA加速器提供四个存储层级。根据数据访问的能量成本从高到低排序，包括DRAM、全局缓冲区、阵列（PE间通信）和RF。从成本较高的层级提取数据到ALU会消耗更多的能量。此外，在任意两个层级之间移动数据的能量成本由成本更高的一方主导。与之前的实验中的能耗量化类似，表IV显示了在列出的条件下，访问每个层级相对于MAC操作的能量成本。这些数字提取自商业65nm工艺。DRAM和全局缓冲区的能量成本包括访问存储和iFIFO/oFIFO的能量；而阵列的能量成本则包括在路径两侧访问iFIFO/oFIFO/pFIFO的能量以及来自布线电容的成本。

分析方法：给定一个数据流，分析分为两部分：（1）输入数据访问能量成本，包括滤波器和ifmap；（2）psum累积能量成本。通过计算对每个层级的访问次数并使用表IV中的成本加权每个层级的访问，量化能量成本。数据流的整体数据移动能量通过组合两种输入数据和psum的结果获得。

1. 输入数据访问能量成本：如果一个输入数据值被多个操作重用，理想情况下该值只需从DRAM移动到RF一次，然后ALU可以多次从RF读取。然而，由于存储限制和操作调度，数据常常在未充分重用前就被踢出RF。这时，ALU需要再次从更高成本的层级获取相同数据。根据这种模式，数据重用可以在四个层级之间进行分割。每个层级的重用被定义为在其生命周期内从该层级读取数据值到其下层级的次数。假设某个数据值的总重用次数为 $a\times b\times c\times d$，则其在DRAM、全局缓冲区、阵列和RF的重用次数分别为 $a, b, c$ 和 $d$。图8中的示例展示了这种情况，其中总重用次数为24，分割为$a = 1, b = 2, c = 3, d = 4$。该重用模式的能量成本估算为：

$$
a × EC(DRAM)+ab × EC(global buffer)+ abc × EC(array)+abcd × EC(RF), (3)
$$

其中 EC(⋅) 是表IV中的能量成本。

2. 和累积能量成本：和（psum）在ALU之间传递以进行累积，穿越四层存储层次结构。在理想情况下，每个生成的和会存储在本地RF中以进行进一步的累积。然而，由于整体操作调度，这一情况往往难以实现，此时和必须存储到更高成本的层级，并在之后再读取。因此，总的累积次数 $a\times b\times c\times d$ 也可以在四个层级之间分割。每个层级的累积次数被定义为每个数据在其生命周期内进出其下层级的次数。图9中展示了这种情况，其中总累积次数为36，分割为 a=2、b=3、c=3 和 d=2。能量成本可以估算为：

$$
(2a −1)× EC(DRAM)+2a(b −1)× EC(global buffer)+ ab(c −1)× EC(array)+2abc(d −1)× EC(RF). (4)
$$

这个2的系数考虑了读取和写入的次数。在此计算中，偏置项的累积被忽略，因为它对整体能量的影响微乎其微。

3. 每种数据流都有一组参数（a, b, c, d），用于描述在给定CNN层形状下的能量效率最优映射。这些参数通过优化过程获得，目标函数由公式（3）和（4）定义，优化过程受到硬件资源的约束，包括全局缓冲区、RF和PE阵列的大小。

### D. 数据流建模附记

尽管我们对所有数据流在存储层次结构的每个级别收取相同的能量成本，但由于每个数据流所需的实际实现，真实成本会有所不同。例如，较大的全局缓冲区应收取更高的能量成本，这适用于所有数据流，除了RS。在阵列级别，短距离传输（例如与邻近PE的通信）应收取较低的能量成本，而长距离传输（如广播或从所有PE直接访问全局缓冲区）则成本较高，因为后者的布线电容更大，NoC设计更复杂。在这种情况下，WS、OSA、OSC和NLR可能会受到更大影响，因为它们都涉及长距离阵列传输。在RF级别，较小的RF应收取较低的能量成本。除了RS和OSA，其他数据流在RF访问能量上都会看到减少。然而，总体而言，我们发现与其他数据流相比，RS的数据能耗结果仍然比较保守。
:::