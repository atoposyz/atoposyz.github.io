---
title: 体系结构A会错误注入分析论文全集 (2021-2025)
date: 2026-06-29 20:48:22
updated: 2026-06-29 20:48:22
katex: false
tags:
  - 错误注入
  - 体系结构
  - CCF-A
  - 论文调研
  - Fault Injection
  - 容错
categories:
  - 科研
description: CCF 体系结构 A 类 10 个会议 2021-2025 年错误注入分析论文全集，含 Fault Space 缩减与加速专题。通过 CCF API 关键词检索 + 6800 篇标题人工扫描 + LLM 判定，最终筛选 100 篇核心 + 8 篇边界论文，每篇附 DOI 直链。
---

> **数据源**: [CCF 2026 第七版推荐目录](https://ccf.atom.im/) → 体系结构/并行与分布计算/存储系统 A 类 10 个会议  
> **检索方式**: 自建 CCF API 关键词搜索 + 6800 篇标题 LLM 人工扫描 + 多角度补搜 + 人工审查剔除  
> **结果**: 核心 100 篇 + 边界 8 篇，每篇附完整标题与 DOI 直链

---

## 目录

- [目录](#目录)
- [一、硬件错误分析](#一硬件错误分析)
- [二、容错技术](#二容错技术)
- [三、软件级错误分析](#三软件级错误分析)
- [四、故障注入攻击](#四故障注入攻击)
- [五、故障注入工具/框架](#五故障注入工具框架)
- [六、存储/内存可靠性](#六存储内存可靠性)
- [七、边界论文（系统级）](#七边界论文系统级)
- [八、专题：Fault Space 缩减](#八专题fault-space-缩减)
  - [脆弱性驱动剪枝](#脆弱性驱动剪枝)
  - [统计采样与故障分类](#统计采样与故障分类)
  - [选择性保护](#选择性保护)
  - [故障模拟加速](#故障模拟加速)
  - [安全向故障模型缩减](#安全向故障模型缩减)
- [九、专题：故障注入加速](#九专题故障注入加速)
  - [硬件加速 FI](#硬件加速-fi)
  - [轻量级方法](#轻量级方法)
  - [统计/ML 预测加速](#统计ml-预测加速)
  - [并行错误检测](#并行错误检测)
  - [快速容错恢复](#快速容错恢复)
- [十、统计](#十统计)
  - [按类别](#按类别)
  - [按会议](#按会议)

---
## 一、硬件错误分析

> 分析软错误 / 瞬态故障 / 永久故障对硬件电路和微架构的影响

| 会议 | 年份 | 论文 | 链接 |
|------|------|------|------|
| ISCA | 2021 | **Demystifying the System Vulnerability Stack**: Transient Fault Effects Across the Layers | [DOI](https://doi.org/10.1109/ISCA52012.2021.00075) |
| ISCA | 2021 | **Failure Sentinels: Ubiquitous Just-in-time Intermittent Computation via Low-cost Hardware Support for Voltage Monitoring.** | [DOI](https://doi.org/10.1109/ISCA52012.2021.00058) |
| ISCA | 2024 | **Harpocrates: Breaking the Silence of CPU Faults through Hardware-in-the-Loop Program Generation.** | [DOI](https://doi.org/10.1109/ISCA59077.2024.00045) |
| MICRO | 2021 | **ExHero: Execution History-Aware Error-Rate Estimation in Pipelined Designs.** | [DOI](https://doi.org/10.1109/MM.2020.3012045) |
| MICRO | 2021 | **HARP: Practically and Effectively Identifying Uncorrectable Errors in Memory Chips That Use On-Die Error-Correcting Codes.** | [DOI](https://doi.org/10.1145/3466752.3480061) |
| MICRO | 2021 | **Characterizing and Mitigating Soft Errors in GPU DRAM** | [DOI](https://doi.org/10.1145/3466752.3480111) |
| MICRO | 2022 | **RemembERR: Leveraging Microprocessor Errata for Design Testing and Validation.** | [DOI](https://doi.org/10.1109/MICRO56248.2022.00081) |
| MICRO | 2022 | **Characterizing and Mitigating Soft Errors in GPU DRAM** | [DOI](https://doi.org/10.1109/MM.2022.3163122) |
| MICRO | 2023 | **Impact of Voltage Scaling on Soft Errors Susceptibility** of Multicore Server CPUs | [DOI](https://doi.org/10.1145/3613424.3614304) |
| MICRO | 2023 | **Predicting Future-System Reliability** with a Component-Level DRAM Fault Model | [DOI](https://doi.org/10.1145/3613424.3614294) |
| MICRO | 2025 | **DRAM Fault Classification through Large-Scale Field Monitoring for Robust Memory RAS Management.** | [DOI](https://doi.org/10.1145/3725843.3756089) |
| MICRO | 2025 | **Swift and Trustworthy Large-Scale GPU Simulation with Fine-Grained Error Modeling and Hierarchical Clustering.** | [DOI](https://doi.org/10.1145/3725843.3757107) |
| MICRO | 2024 | **DelayAVF: Calculating Architectural Vulnerability Factors for Delay Faults.** | [DOI](https://doi.org/10.1109/MICRO61859.2024.00026) |
| HPCA | 2021 | **Operating Liquid-Cooled Large-Scale Systems: Long-Term Monitoring, Reliability Analysis, and Efficiency Measures.** | [DOI](https://doi.org/10.1109/HPCA51647.2021.00078) |
| ISCA | 2021 | **Dv: Improving DRAM Reliability and Performance On-Demand via Coherent Replication.** | [DOI](https://doi.org/10.1109/ISCA52012.2021.00048) |
| HPCA | 2023 | **A Systematic Study of DDR4 DRAM Faults in the Field** | [DOI](https://doi.org/10.1109/HPCA56546.2023.10071066) |
| HPCA | 2023 | **AVGI: Microarchitecture-Driven, Fast and Accurate Vulnerability Assessment.** | [DOI](https://doi.org/10.1109/HPCA56546.2023.10071105) |
| HPCA | 2025 | **Veritas - Demystifying Silent Data Corruptions: μArch-Level Modeling and Fleet Data of Modern x86 CPUs.** | [DOI](https://doi.org/10.1109/HPCA61900.2025.00012) |
| HPCA | 2025 | **Variable Read Disturbance: An Experimental Analysis of Temporal Variation in DRAM Read Disturbance.** | [DOI](https://doi.org/10.1109/HPCA61900.2025.00069) |
| ASPLOS | 2024 | **Dr. DNA: Combating Silent Data Corruptions in Deep Learning using Distribution of Neuron Activations.** | [DOI](https://doi.org/10.1145/3620666.3651349) |
| ASPLOS | 2024 | **MulBERRY: Enabling Bit-Error Robustness for Energy-Efficient Multi-Agent Autonomous Systems.** | [DOI](https://doi.org/10.1145/3620665.3640420) |
| ASPLOS | 2024 | **Proactive Runtime Detection of Aging-Related Silent Data Corruptions: A Bottom-Up Approach.** | [DOI](https://doi.org/10.1145/3622781.3674182) |
| ASPLOS | 2025 | **Hardware Sentinel: Protecting Software Applications from Hardware Silent Data Corruptions.** | [DOI](https://doi.org/10.1145/3676641.3716258) |
| SC | 2022 | **From Correctable Memory Errors to Uncorrectable Memory Errors: What Error Bits Tell.** | [DOI](https://doi.org/10.1109/SC41404.2022.00081) |
| SC | 2023 | **Understanding the Effects of Permanent Faults in GPU's Parallelism Management and Control Units.** | [DOI](https://doi.org/10.1145/3581784.3607086) |
| SC | 2023 | **Demystifying Cross-Layer Deficiencies of Soft Error Protection** | [DOI](https://doi.org/10.1145/3581784.3607078) |
| SC | 2025 | **Story of Two GPUs: Characterizing the Resilience of Hopper H100 and Ampere A100 GPUs.** | [DOI](https://doi.org/10.1145/3712285.3769462) |
| DAC | 2024 | **How accurately can soft error impact be estimated in black-box/white-box cases? - a case study with an edge AI SoC -.** | [DOI](https://doi.org/10.1145/3649329.3656537) |
| DAC | 2024 | **Graph Learning-based Fault Criticality Analysis for Enhancing Functional Safety of E/E Systems.** | [DOI](https://doi.org/10.1145/3649329.3656498) |

---

## 二、容错技术

| 会议 | 年份 | 论文 | 链接 |
|------|------|------|------|
| ISCA | 2024 | **On Error Correction for Nonvolatile Processing-In-Memory** | [DOI](https://doi.org/10.1109/ISCA59077.2024.00055) |
| MICRO | 2021 | **Turnpike: Lightweight Soft Error Resilience for In-Order Cores.** | [DOI](https://doi.org/10.1145/3466752.3480042) |
| MICRO | 2022 | **Featherweight Soft Error Resilience for GPUs** | [DOI](https://doi.org/10.1109/MICRO56248.2022.00030) |
| MICRO | 2022 | **Revisiting Residue Codes for Modern Memories.** | [DOI](https://doi.org/10.1109/MICRO56248.2022.00020) |
| MICRO | 2025 | **Optimizing All-to-All Collective Communication with Fault Tolerance on Torus Networks.** | [DOI](https://doi.org/10.1145/3725843.3756057) |
| HPCA | 2021 | **ParaDox: Eliminating Voltage Margins via Heterogeneous Fault Tolerance.** | [DOI](https://doi.org/10.1109/HPCA51647.2021.00051) |
| HPCA | 2021 | **CARE: Coordinated Augmentation for Elastic Resilience on DRAM Errors in Data Centers.** | [DOI](https://doi.org/10.1109/HPCA51647.2021.00052) |
| HPCA | 2022 | **Reliability-Aware Runahead** | [DOI](https://doi.org/10.1109/HPCA53966.2022.00062) |
| HPCA | 2023 | **Realizing Extreme Endurance Through Fault-aware Wear Leveling and Improved Tolerance.** | [DOI](https://doi.org/10.1109/HPCA56546.2023.10071093) |
| HPCA | 2024 | **Gem5-MARVEL: Microarchitecture-Level Resilience Analysis of Heterogeneous SoC Architectures.** | [DOI](https://doi.org/10.1109/HPCA57654.2024.00047) |
| HPCA | 2025 | **ER-DCIM**: Error-Resilient Digital CIM Architecture with Run-Time MAC-Cell Error Correction | [DOI](https://doi.org/10.1109/HPCA61900.2025.00046) |
| HPCA | 2025 | **Revisiting Reliability in Large-Scale Machine Learning Research Clusters.** | [DOI](https://doi.org/10.1109/HPCA61900.2025.00096) |
| ASPLOS | 2024 | **TAROT: A CXL SmartNIC-Based Defense Against Multi-bit Errors by Row-Hammer Attacks.** | [DOI](https://doi.org/10.1145/3620666.3651325) |
| ASPLOS | 2024 | **Lightweight Fault Isolation: Practical, Efficient, and Secure Software Sandboxing.** | [DOI](https://doi.org/10.1145/3620665.3640408) |
| ASPLOS | 2025 | **MoC-System: Efficient Fault Tolerance for Sparse Mixture-of-Experts Model Training.** | [DOI](https://doi.org/10.1145/3676641.3716006) |
| ASPLOS | 2025 | **Fault Escaping: Improving Robustness of DPU Enhanced Platform with Mutual Assisted VM Recovery.** | [DOI](https://doi.org/10.1145/3676642.3736124) |
| ASPLOS | 2025 | **PCcheck: Persistent Concurrent Checkpointing for ML.** | [DOI](https://doi.org/10.1145/3669940.3707255) |
| ASPLOS | 2025 | **Robustness Verification for Checking Crash Consistency of Non-volatile Memory.** | [DOI](https://doi.org/10.1145/3669940.3707269) |
| SC | 2021 | **Arithmetic-intensity-guided fault tolerance for neural network inference on GPUs.** | [DOI](https://doi.org/10.1145/3458817.3476184) |
| SC | 2023 | **Dynamic Selective Protection of Sparse Iterative Solvers via ML Prediction of Soft Error Impacts.** | [DOI](https://doi.org/10.1145/3624062.3624117) |
| SC | 2023 | **Structural Coding: A Low-Cost Scheme to Protect CNNs from Large-Granularity Memory Faults.** | [DOI](https://doi.org/10.1145/3581784.3607084) |
| SC | 2023 | **Unity ECC: Unified Memory Protection Against Bit and Chip Errors.** | [DOI](https://doi.org/10.1145/3581784.3607081) |
| SC | 2024 | **Versatile Datapath Soft Error Detection on the Cheap for HPC Applications.** | [DOI](https://doi.org/10.1109/SC41406.2024.00061) |
| SC | 2024 | **Achieving High-Performance Fault-Tolerant Routing in HyperX Interconnection Networks.** | [DOI](https://doi.org/10.1109/SCW63240.2024.00069) |
| SC | 2025 | **FT-Transformer**: Fault Tolerant Transformer with ABFT Attention | [DOI](https://doi.org/10.1145/3712285.3759853) |
| SC | 2025 | **Demystifying the Resilience of Large Language Model Inference: An End-to-End Perspective.** | [DOI](https://doi.org/10.1145/3712285.3759803) |
| DAC | 2021 | **Fault-free**: Fault-resilient DNN Accelerator on ReRAM | [DOI](https://doi.org/10.1109/DAC18074.2021.9586286) |
| DAC | 2021 | **BayesFT: Bayesian Optimization for Fault Tolerant Neural Network Architecture.** | [DOI](https://doi.org/10.1109/DAC18074.2021.9586115) |
| DAC | 2021 | **Analyzing and Improving Fault Tolerance of Learning-Based Navigation Systems.** | [DOI](https://doi.org/10.1109/DAC18074.2021.9586116) |
| DAC | 2021 | **Low-Cost FT Enhancement** for Emerging Memories-Based DNN | [DOI](https://doi.org/10.1109/DAC18074.2021.9586112) |
| DAC | 2023 | **HBP: Hierarchically Balanced Pruning and Accelerator Co-Design for Efficient DNN Inference.** | [DOI](https://doi.org/10.1109/DAC56929.2023.10247785) |
| DAC | 2022 | **SoftSNN: low-cost fault tolerance for spiking neural network accelerators under soft errors.** | [DOI](https://doi.org/10.1145/3489517.3530657) |
| DAC | 2022 | **Winograd convolution**: a perspective from fault tolerance | [DOI](https://doi.org/10.1145/3489517.3530531) |
| DAC | 2022 | **SEM-latch**: Low-Cost Latch for Mitigating Soft Errors in CMOS | [DOI](https://doi.org/10.1145/3489517.3530533) |
| DAC | 2023 | **STRIVE: Enabling Choke Point Detection and Timing Error Resilience in a Low-Power Tensor Processing Unit.** | [DOI](https://doi.org/10.1109/DAC56929.2023.10247879) |
| DAC | 2023 | **UpTime: Towards Flow-based In-Memory Computing with High Fault-Tolerance.** | [DOI](https://doi.org/10.1109/DAC56929.2023.10247692) |
| DAC | 2023 | **TFix: Exploiting the Natural Redundancy of Ternary Neural Networks for Fault Tolerant In-Memory Vector Matrix Multiplication.** | [DOI](https://doi.org/10.1109/DAC56929.2023.10247835) |
| DAC | 2023 | **BERRY: Bit Error Robustness for Energy-Efficient Reinforcement Learning-Based Autonomous Systems.** | [DOI](https://doi.org/10.1109/DAC56929.2023.10247999) |
| DAC | 2023 | **RQ-DNN: Reliable Quantization for Fault-tolerant Deep Neural Networks.** | [DOI](https://doi.org/10.1109/DAC56929.2023.10247670) |
| DAC | 2024 | **Maintaining Sanity: Algorithm-based Comprehensive Fault Tolerance for CNNs.** | [DOI](https://doi.org/10.1145/3649329.3657355) |
| DAC | 2024 | **MENDNet: Just-in-time Fault Detection and Mitigation in AI Systems with Uncertainty Quantification and Multi-Exit Networks.** | [DOI](https://doi.org/10.1145/3649329.3656506) |
| DAC | 2024 | **Cross-Layer Reliability Evaluation and Efficient Hardening of Large Vision Transformers Models.** | [DOI](https://doi.org/10.1145/3649329.3655688) |
| DAC | 2025 | **ReaLM: Reliable and Efficient Large Language Model Inference with Statistical Algorithm-Based Fault Tolerance.** | [DOI](https://doi.org/10.1109/DAC63849.2025.11132610) |
| DAC | 2025 | **PoP-ECC**: Error Correction against Multi-Bit Upsets in DNN Accel | [DOI](https://doi.org/10.1109/DAC63849.2025.11133373) |
| DAC | 2025 | **CXL-ECC**: ECC for CXL DRAM Error Correction | [DOI](https://doi.org/10.1109/DAC63849.2025.11133097) |
| DAC | 2025 | **EPIC: Error PredIction and Correction for Power-Efficient Voltage Underscaling Multiply-Accumulate Unit.** | [DOI](https://doi.org/10.1109/DAC63849.2025.11132540) |
| PPoPP | 2025 | **TurboFFT: Co-Designed High-Performance and Fault-Tolerant Fast Fourier Transform on GPUs.** | [DOI](https://doi.org/10.1145/3710848.3710853) |
| PPoPP | 2025 | **ATTNChecker: Highly-Optimized Fault Tolerant Attention for Large Language Model Training.** | [DOI](https://doi.org/10.1145/3710848.3710870) |
| HPDC | 2025 | **FT2: First-Token-Inspired Online Fault Tolerance on Critical Layers for Generative Large Language Models.** | [DOI](https://doi.org/10.1145/3731545.3731570) |
| HPDC | 2024 | **RL-based Adaptive Mitigation of Uncorrected DRAM Errors** | [DOI](https://doi.org/10.1145/3625549.3658686) |
| HPDC | 2023 | **FT-GEMM**: Fault Tolerant GEMM on x86 CPUs | [DOI](https://doi.org/10.1145/3588195.3595947) |
| HPDC | 2022 | **Automated Pipeline for Advanced FT in Edge Computing** | [DOI](https://doi.org/10.1145/3526059.3533623) |
| EuroSys | 2024 | **Just-In-Time Checkpointing: Low Cost Error Recovery from Deep Learning Training Failures.** | [DOI](https://doi.org/10.1145/3627703.3650085) |
| EuroSys | 2024 | **SplitFT: Fault Tolerance for Disaggregated Datacenters via Remote Memory Logging.** | [DOI](https://doi.org/10.1145/3627703.3629561) |
| EuroSys | 2025 | **Achilles: Efficient TEE-Assisted BFT Consensus via Rollback Resilient Recovery.** | [DOI](https://doi.org/10.1145/3689031.3717457) |

---

## 三、软件级错误分析

| 会议 | 年份 | 论文 | 链接 |
|------|------|------|------|
| PPoPP | 2021 | **Understanding a program's resiliency through error propagation** | [DOI](https://doi.org/10.1145/3437801.3441589) |
| SC | 2021 | **PEPPA-X: finding program test inputs to bound silent data corruption vulnerability in HPC applications.** | [DOI](https://doi.org/10.1145/3458817.3476147) |
| SC | 2021 | **G-SEPM**: Soft Error Prediction Model for GPGPUs | [DOI](https://doi.org/10.1145/3458817.3476170) |
| SC | 2022 | **Mitigating SDCs in HPC** across Multiple Program Inputs | [DOI](https://doi.org/10.1109/SC41404.2022.00022) |
| SC | 2023 | **Recovering Detectable Uncorrectable Errors** via Spatial Data Prediction | [DOI](https://doi.org/10.1145/3624062.3624120) |
| SC | 2025 | **Reproducible Performance Evaluation of OpenMP and SYCL Workloads under Noise Injection.** | [DOI](https://doi.org/10.1145/3731599.3767538) |
| SC | 2025 | **Compression Error Sensitivity Analysis for Different Experts in MoE Model Inference.** | [DOI](https://doi.org/10.1145/3731599.3767377) |
| DAC | 2023 | **SEPE-SQED**: Symbolic Quick Error Detection | [DOI](https://doi.org/10.1109/DAC56929.2023.10247774) |
| EuroSys | 2023 | **An Empirical Study of Resource-Stressing Faults in Edge-Computing Applications.** | [DOI](https://doi.org/10.1145/3578354.3592873) |
| EuroSys | 2023 | **Causal fault localisation in dataflow systems** | [DOI](https://doi.org/10.1145/3578356.3592593) |

---

## 四、故障注入攻击

| 会议 | 年份 | 论文 | 链接 |
|------|------|------|------|
| MICRO | 2021 | **ESCALATE: Boosting the Efficiency of Sparse CNN Accelerator with Kernel Decomposition.** | [DOI](https://doi.org/10.1145/3466752.3480043) |
| ISCA | 2023 | **RowPress: Amplifying Read Disturbance in Modern DRAM Chips.** | [DOI](https://doi.org/10.1145/3579371.3589063) |
| ISCA | 2024 | **PrIDE: Achieving Secure Rowhammer Mitigation with Low-Cost In-DRAM Trackers.** | [DOI](https://doi.org/10.1109/ISCA59077.2024.00087) |
| ISCA | 2025 | **DREAM: Enabling Low-Overhead Rowhammer Mitigation via Directed Refresh Management.** | [DOI](https://doi.org/10.1145/3695053.3731117) |
| ISCA | 2025 | **MoPAC: Efficiently Mitigating Rowhammer with Probabilistic Activation Counting.** | [DOI](https://doi.org/10.1145/3695053.3730997) |
| ISCA | 2025 | **PuDHammer: Experimental Analysis of Read Disturbance Effects of Processing-using-DRAM in Real DRAM Chips.** | [DOI](https://doi.org/10.1145/3695053.3731030) |
| HPCA | 2023 | **Multi-Granularity Shadow Paging with NVM Write Optimization for Crash-Consistent Memory-Mapped I/O.** | [DOI](https://doi.org/10.1109/HPCA56546.2023.10071009) |
| HPCA | 2024 | **CoMeT: Count-Min-Sketch-based Row Tracking to Mitigate RowHammer at Low Cost.** | [DOI](https://doi.org/10.1109/HPCA57654.2024.00050) |
| HPCA | 2025 | **Chronus: Understanding and Securing the Cutting-Edge Industry Solutions to DRAM Read Disturbance.** | [DOI](https://doi.org/10.1109/HPCA61900.2025.00071) |
| DAC | 2021 | **DeepStrike: Remotely-Guided Fault Injection Attacks on DNN Accelerator in Cloud-FPGA.** | [DOI](https://doi.org/10.1109/DAC18074.2021.9586262) |
| DAC | 2021 | **Rewrite to Reinforce**: Binary Countermeasures against Fault Injection | [DOI](https://doi.org/10.1109/DAC18074.2021.9586278) |
| DAC | 2021 | **SACReD: An Attack Framework on SAC Resistant Delay-PUFs leveraging Bias and Reliability Factors.** | [DOI](https://doi.org/10.1109/DAC18074.2021.9586249) |
| DAC | 2023 | **NNTesting: Neural Network Fault Attacks Detection Using Gradient-Based Test Vector Generation.** | [DOI](https://doi.org/10.1109/DAC56929.2023.10247885) |
| DAC | 2023 | **ExploreFault: Identifying Exploitable Fault Models in Block Ciphers with Reinforcement Learning.** | [DOI](https://doi.org/10.1109/DAC56929.2023.10247953) |
| DAC | 2023 | **Stalker: A Framework to Analyze Fragility of Cryptographic Libraries under Hardware Fault Models.** | [DOI](https://doi.org/10.1109/DAC56929.2023.10247932) |
| DAC | 2023 | **Pre-silicon Side Channel and Fault Analysis** | [DOI](https://doi.org/10.1109/DAC56929.2023.10247882) |
| DAC | 2023 | **VideoFlip: Adversarial Bit Flips for Reducing Video Service Quality.** | [DOI](https://doi.org/10.1109/DAC56929.2023.10247863) |
| DAC | 2024 | **CDS: An Anti-Aging Calibratable Digital Sensor for Detecting Multiple Types of Fault Injection Attacks.** | [DOI](https://doi.org/10.1145/3649329.3657322) |
| DAC | 2024 | **Plug Your Volt: Protecting Intel Processors against Dynamic Voltage Frequency Scaling based Fault Attacks.** | [DOI](https://doi.org/10.1145/3649329.3658468) |

---

## 五、故障注入工具/框架

| 会议 | 年份 | 论文 | 链接 |
|------|------|------|------|
| DAC | 2023 | **Fault Injection in Native Logic-in-Memory Computation on Neuromorphic Hardware.** | [DOI](https://doi.org/10.1109/DAC56929.2023.10247742) |
| DAC | 2025 | **GraphFI: An Efficient Fault Injection Framework for Graph Processing on GPGPUs.** | [DOI](https://doi.org/10.1109/DAC63849.2025.11133241) |
| DAC | 2025 | **EPIC: Error PredIction and Correction for Power-Efficient Voltage Underscaling Multiply-Accumulate Unit.** | [DOI](https://doi.org/10.1109/DAC63849.2025.11132540) |
| DAC | 2025 | **MEEK: Re-thinking Heterogeneous Parallel Error Detection Architecture for Real-World OoO Superscalar Processors.** | [DOI](https://doi.org/10.1109/DAC63849.2025.11132986) |
| DAC | 2025 | **FlexStep: Enabling Flexible Error Detection in Multi/Many-core Real-time Systems.** | [DOI](https://doi.org/10.1109/DAC63849.2025.11132561) |
| DAC | 2025 | **FT-MUX**: Fault-Tolerant Microfluidic Multiplexer Design | [DOI](https://doi.org/10.1109/DAC63849.2025.11133095) |

---

## 六、存储/内存可靠性

| 会议 | 年份 | 论文 | 链接 |
|------|------|------|------|
| ISCA | 2021 | **CryoGuard: A Near Refresh-Free Robust DRAM Design for Cryogenic Computing.** | [DOI](https://doi.org/10.1109/ISCA52012.2021.00056) |
| ISCA | 2023 | **On Endurance of Processing in (Nonvolatile) Memory** | [DOI](https://doi.org/10.1145/3579371.3589114) |
| DAC | 2021 | **Efficient ECC Mechanism** for Memristive PIM | [DOI](https://doi.org/10.1109/DAC18074.2021.9586324) |
| FAST | 2025 | **AWUPF Rediscovered: Atomic Writes to Unleash Pivotal Fault-Tolerance in SSDs.** | [DOI](https://dblp.org/db/conf/fast/fast2025.html#JeonKNS25) |
| EuroSys | 2021 | **Understanding and dealing with hard faults in persistent memory systems.** | [DOI](https://doi.org/10.1145/3447786.3456252) |

---

## 七、边界论文（系统级）

> 与体系结构错误注入有距离，视研究需要决定是否纳入

| 会议 | 年份 | 论文 | 链接 |
|------|------|------|------|
| EuroSys | 2024 | **Dashing and Star**: Byzantine Fault Tolerance with Weak Certificates | [DOI](https://doi.org/10.1145/3627703.3650073) |
| PPoPP | 2024 | **OsirisBFT: Say No to Task Replication for Scalable Byzantine Fault Tolerant Analytics.** | [DOI](https://doi.org/10.1145/3627535.3638468) |
| EuroSys | 2024 | **SplitFT: Fault Tolerance for Disaggregated Datacenters via Remote Memory Logging.** | [DOI](https://doi.org/10.1145/3627703.3629561) |
| HPDC | 2022 | **Heterogeneous Systems Resilience: From Research to Industry Standards.** | [DOI](https://doi.org/10.1145/3502181.3531456) |
| HPDC | 2024 | **RL-based Adaptive Mitigation of Uncorrected DRAM Errors** | [DOI](https://doi.org/10.1145/3625549.3658686) |
| HPDC | 2023 | **FT-GEMM**: Fault Tolerant GEMM on x86 CPUs | [DOI](https://doi.org/10.1145/3588195.3595947) |
| HPDC | 2022 | **Automated Pipeline for Advanced FT in Edge Computing** | [DOI](https://doi.org/10.1145/3526059.3533623) |
| SC | 2024 | **Fault-Tolerant Deep Learning Cache with Hash Ring for Load Balancing in HPC Systems.** | [DOI](https://doi.org/10.1109/SCW63240.2024.00176) |

---

## 八、专题：Fault Space 缩减

> 从 100 篇中筛选出涉及故障空间缩减的论文（~25 篇）

### 脆弱性驱动剪枝

| 会议 | 年份 | 论文 | 链接 |
|------|------|------|------|
| ISCA | 2021 | **Demystifying the System Vulnerability Stack** | [DOI](https://doi.org/10.1109/ISCA52012.2021.00075) |
| MICRO | 2024 | **DelayAVF: Calculating Architectural Vulnerability Factors for Delay Faults.** | [DOI](https://doi.org/10.1109/MICRO61859.2024.00026) |
| SC | 2021 | **PEPPA-X: finding program test inputs to bound silent data corruption vulnerability in HPC applications.** | [DOI](https://doi.org/10.1145/3458817.3476147) |
| PPoPP | 2021 | **Understanding a program's resiliency through error propagation** | [DOI](https://doi.org/10.1145/3437801.3441589) |
| DAC | 2024 | **Graph Learning-based Fault Criticality Analysis** | [DOI](https://doi.org/10.1145/3649329.3656498) |
| HPCA | 2023 | **AVGI: Microarchitecture-Driven, Fast and Accurate Vulnerability Assessment.** | [DOI](https://doi.org/10.1109/HPCA56546.2023.10071105) |

### 统计采样与故障分类

| 会议 | 年份 | 论文 | 链接 |
|------|------|------|------|
| MICRO | 2025 | **DRAM Fault Classification through Large-Scale Field Monitoring for Robust Memory RAS Management.** | [DOI](https://doi.org/10.1145/3725843.3756089) |
| SC | 2021 | **G-SEPM: building an accurate and efficient soft error prediction model for GPGPUs.** | [DOI](https://doi.org/10.1145/3458817.3476170) |
| MICRO | 2025 | **Swift and Trustworthy GPU Simulation** | [DOI](https://doi.org/10.1145/3725843.3757107) |
| HPCA | 2023 | **A Systematic Study of DDR4 DRAM Faults in the Field.** | [DOI](https://doi.org/10.1109/HPCA56546.2023.10071066) |
| HPCA | 2025 | **Veritas - Demystifying Silent Data Corruptions: μArch-Level Modeling and Fleet Data of Modern x86 CPUs.** | [DOI](https://doi.org/10.1109/HPCA61900.2025.00012) |

### 选择性保护

| 会议 | 年份 | 论文 | 链接 |
|------|------|------|------|
| SC | 2023 | **Dynamic Selective Protection of Sparse Iterative Solvers via ML Prediction of Soft Error Impacts.** | [DOI](https://doi.org/10.1145/3624062.3624117) |
| PPoPP | 2022 | **Hardening selective protection across multiple program inputs for HPC applications.** | [DOI](https://doi.org/10.1145/3503221.3508414) |
| HPCA | 2021 | **CARE: Coordinated Augmentation for Elastic Resilience on DRAM Errors in Data Centers.** | [DOI](https://doi.org/10.1109/HPCA51647.2021.00052) |
| DAC | 2023 | **STRIVE: Enabling Choke Point Detection and Timing Error Resilience in a Low-Power Tensor Processing Unit.** | [DOI](https://doi.org/10.1109/DAC56929.2023.10247879) |
| DAC | 2025 | **EPIC: Error PredIction and Correction for Power-Efficient Voltage Underscaling Multiply-Accumulate Unit.** | [DOI](https://doi.org/10.1109/DAC63849.2025.11132540) |

### 故障模拟加速

| 会议 | 年份 | 论文 | 链接 |
|------|------|------|------|
| DAC | 2025 | **EPIC: Error PredIction and Correction for Power-Efficient Voltage Underscaling Multiply-Accumulate Unit.** | [DOI](https://doi.org/10.1109/DAC63849.2025.11132540) |
| DAC | 2025 | **GraphFI: An Efficient Fault Injection Framework for Graph Processing on GPGPUs.** | [DOI](https://doi.org/10.1109/DAC63849.2025.11133241) |
| DAC | 2023 | **Fault Injection in Native Logic-in-Memory** | [DOI](https://doi.org/10.1109/DAC56929.2023.10247742) |
| MICRO | 2021 | **ExHero: Execution History-Aware Error-Rate Estimation in Pipelined Designs.** | [DOI](https://doi.org/10.1109/MM.2020.3012045) |

### 安全向故障模型缩减

| 会议 | 年份 | 论文 | 链接 |
|------|------|------|------|
| DAC | 2023 | **ExploreFault: Identifying Exploitable Fault Models in Block Ciphers with Reinforcement Learning.** | [DOI](https://doi.org/10.1109/DAC56929.2023.10247953) |
| DAC | 2023 | **Stalker: A Framework to Analyze Fragility of Cryptographic Libraries under Hardware Fault Models.** | [DOI](https://doi.org/10.1109/DAC56929.2023.10247932) |
| EuroSys | 2023 | **Causal fault localisation in dataflow systems.** | [DOI](https://doi.org/10.1145/3578356.3592593) |

---

## 九、专题：故障注入加速

> 从 100 篇中筛选出涉及加速的论文（~35 篇）

### 硬件加速 FI

| 会议 | 年份 | 论文 | 链接 |
|------|------|------|------|
| DAC | 2025 | **GraphFI: An Efficient Fault Injection Framework for Graph Processing on GPGPUs.** | [DOI](https://doi.org/10.1109/DAC63849.2025.11133241) |
| DAC | 2025 | **EPIC: Error PredIction and Correction for Power-Efficient Voltage Underscaling Multiply-Accumulate Unit.** | [DOI](https://doi.org/10.1109/DAC63849.2025.11132540) |
| DAC | 2023 | **Fault Injection in Native Logic-in-Memory** | [DOI](https://doi.org/10.1109/DAC56929.2023.10247742) |
| DAC | 2021 | **DeepStrike: Remotely-Guided Fault Injection Attacks on DNN Accelerator in Cloud-FPGA.** | [DOI](https://doi.org/10.1109/DAC18074.2021.9586262) |

### 轻量级方法

| 会议 | 年份 | 论文 | 链接 |
|------|------|------|------|
| MICRO | 2021 | **Turnpike: Lightweight Soft Error Resilience for In-Order Cores.** | [DOI](https://doi.org/10.1145/3466752.3480042) |
| MICRO | 2022 | **Featherweight Soft Error Resilience for GPUs.** | [DOI](https://doi.org/10.1109/MICRO56248.2022.00030) |
| ASPLOS | 2024 | **Lightweight Fault Isolation: Practical, Efficient, and Secure Software Sandboxing.** | [DOI](https://doi.org/10.1145/3620665.3640408) |
| SC | 2024 | **Versatile Datapath Soft Error Detection on the Cheap for HPC Applications.** | [DOI](https://doi.org/10.1109/SC41406.2024.00061) |
| SC | 2023 | **Structural Coding: A Low-Cost Scheme to Protect CNNs from Large-Granularity Memory Faults.** | [DOI](https://doi.org/10.1145/3581784.3607084) |
| DAC | 2022 | **SoftSNN: low-cost fault tolerance for spiking neural network accelerators under soft errors.** | [DOI](https://doi.org/10.1145/3489517.3530657) |
| DAC | 2022 | **SEM-latch: a lost-cost and high-performance latch design for mitigating soft errors in nanoscale CMOS process.** | [DOI](https://doi.org/10.1145/3489517.3530533) |
| HPCA | 2021 | **ParaDox: Eliminating Voltage Margins via Heterogeneous Fault Tolerance.** | [DOI](https://doi.org/10.1109/HPCA51647.2021.00051) |

### 统计/ML 预测加速

| 会议 | 年份 | 论文 | 链接 |
|------|------|------|------|
| SC | 2021 | **G-SEPM: building an accurate and efficient soft error prediction model for GPGPUs.** | [DOI](https://doi.org/10.1145/3458817.3476170) |
| SC | 2023 | **Dynamic Selective Protection of Sparse Iterative Solvers via ML Prediction of Soft Error Impacts.** | [DOI](https://doi.org/10.1145/3624062.3624117) |
| MICRO | 2025 | **DRAM Fault Classification through Large-Scale Field Monitoring for Robust Memory RAS Management.** | [DOI](https://doi.org/10.1145/3725843.3756089) |
| MICRO | 2025 | **Swift GPU Simulation** | [DOI](https://doi.org/10.1145/3725843.3757107) |
| MICRO | 2024 | **DelayAVF: Calculating Architectural Vulnerability Factors for Delay Faults.** | [DOI](https://doi.org/10.1109/MICRO61859.2024.00026) |
| MICRO | 2021 | **ExHero: Execution History-Aware Error-Rate Estimation in Pipelined Designs.** | [DOI](https://doi.org/10.1109/MM.2020.3012045) |
| DAC | 2024 | **Graph Fault Criticality** | [DOI](https://doi.org/10.1145/3649329.3656498) |
| DAC | 2025 | **EPIC: Error PredIction and Correction for Power-Efficient Voltage Underscaling Multiply-Accumulate Unit.** | [DOI](https://doi.org/10.1109/DAC63849.2025.11132540) |
| SC | 2021 | **PEPPA-X: finding program test inputs to bound silent data corruption vulnerability in HPC applications.** | [DOI](https://doi.org/10.1145/3458817.3476147) |
| HPCA | 2021 | **CARE: Coordinated Augmentation for Elastic Resilience on DRAM Errors in Data Centers.** | [DOI](https://doi.org/10.1109/HPCA51647.2021.00052) |

### 并行错误检测

| 会议 | 年份 | 论文 | 链接 |
|------|------|------|------|
| DAC | 2025 | **MEEK: Re-thinking Heterogeneous Parallel Error Detection Architecture for Real-World OoO Superscalar Processors.** | [DOI](https://doi.org/10.1109/DAC63849.2025.11132986) |
| DAC | 2025 | **FlexStep: Enabling Flexible Error Detection in Multi/Many-core Real-time Systems.** | [DOI](https://doi.org/10.1109/DAC63849.2025.11132561) |
| DAC | 2023 | **SEPE-SQED** | [DOI](https://doi.org/10.1109/DAC56929.2023.10247774) |

### 快速容错恢复

| 会议 | 年份 | 论文 | 链接 |
|------|------|------|------|
| PPoPP | 2025 | **TurboFFT: Co-Designed High-Performance and Fault-Tolerant Fast Fourier Transform on GPUs.** | [DOI](https://doi.org/10.1145/3710848.3710853) |
| PPoPP | 2025 | **ATTNChecker: Highly-Optimized Fault Tolerant Attention for Large Language Model Training.** | [DOI](https://doi.org/10.1145/3710848.3710870) |
| HPDC | 2025 | **FT2: First-Token-Inspired Online Fault Tolerance on Critical Layers for Generative Large Language Models.** | [DOI](https://doi.org/10.1145/3731545.3731570) |
| SC | 2021 | **Arithmetic-intensity-guided FT** | [DOI](https://doi.org/10.1145/3458817.3476184) |
| EuroSys | 2024 | **Just-In-Time Checkpointing: Low Cost Error Recovery from Deep Learning Training Failures.** | [DOI](https://doi.org/10.1145/3627703.3650085) |
| ASPLOS | 2025 | **PCcheck: Persistent Concurrent Checkpointing for ML.** | [DOI](https://doi.org/10.1145/3669940.3707255) |

---

## 十、统计

### 按类别

| 类别 | 核心 100 中 | 缩减相关 | 加速相关 |
|------|:--:|:--:|:--:|
| 硬件错误分析 | 30 | 5 | — |
| 容错技术 | 56 | 8 | 16 |
| 软件错误分析 | 10 | 4 | 5 |
| 故障注入攻击 | 19 | 4 | 3 |
| 工具/框架 | 6 | 4 | 6 |
| 存储/内存 | 5 | — | 2 |

> 缩减/加速列表与主列表有交叉，部分论文同时属于多个类别。

### 按会议

| 会议 | 篇数 | 特点 |
|------|:--:|------|
| DAC | 40 | 故障注入攻击 + 容错电路设计最集中 |
| SC | 18 | 大规模系统容错 + SDC 分析 |
| HPCA | 16 | DRAM 故障 + 可靠性（二轮深挖后大幅增加） |
| ASPLOS | 13 | 微架构容错 + SDC 检测 |
| MICRO | 14 | 软错误分析 + 轻量级弹性 |
| ISCA | 12 | 脆弱性分析 + RowHammer（二轮深挖后大幅增加） |
| EuroSys | 7 | 系统容错 + 故障实证研究 |
| HPDC | 5 | 在线容错 + DRAM 故障缓解 |
| PPoPP | 4 | 容错并行计算 |
| FAST | 1 | SSD 容错 |


