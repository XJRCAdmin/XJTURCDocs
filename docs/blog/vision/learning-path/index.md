---
title: 2027届视觉组文档导览与学习路径
date: 2026-08-14
description: 介绍2027届视觉组文档的内容、推荐阅读顺序与不同阶段的学习目标。
---

# 2027届视觉组文档导览与学习路径

视觉组的工作不仅包括图像算法，还涉及 Linux、C++、网络、构建系统、机器人通信、传感器和工程部署。本目录的目标是帮助新成员从“能够使用开发环境”逐步走到“能够独立开发和排查机器人视觉程序”。

!!! tip "如何使用这套文档"
    不需要从头到尾读完所有页面，大部分内容只需要理解即可，codex可以为你代劳很多。但是，你需要懂得他们的原理才能够更好的利用codex进行开发。

    [Ubuntu 重装后的快速配置清单](../common-command/index.md)是一份恢复电脑环境的操作清单，不是 Linux 入门教材。

## 文档内容概览

### 开发环境与基础工具

- [硬盘、分区与启动方式](../SSD-knowledge/index.md)：理解磁盘、GPT、UEFI 和安装系统时的关键选择。
- [Linux 入门](../linux/linux.md)：命令行、文件系统、权限、SSH 和常用工具。
- [Bash 自学](../bash/index.md)：Shell 命令与简单自动化。
- [进程、服务与例行任务](../ustc-linux101-ch4/index.md)：进程、信号、tmux、systemd 和定时任务。
- [Markdown 入门](../markdown/index.md)：编写项目说明和队内文档。

### Git 与远程开发

- [Git 入门](../GitIntro/index.md)：提交、分支、远程仓库、冲突与 Git LFS。
- [SSH 与 Remote SSH](../ssh&remotessh/index.md)：登录机器人、NUC 和服务器，在 VS Code 中远程开发。
- [队内服务器](../RCserver/index.md)：仅在需要使用相关内部服务时阅读。

### C++ 工程能力

- [CMake 入门](../CMake/index.md)：理解目标、头文件、库和构建过程。
- [程序的启动与调试](../Debug/index.md)：优先使用 `launch.json` 固化调试入口，再通过 Batch、Bash 和 CMake Presets 统一启动与构建流程。
- [第二次培训讲稿](../tutorial/class2/index.md)：编译、目标文件、静态库、动态库、Make 与 CMake。
- [第三次培训讲稿](../tutorial/class3/index.md)：SSH、网络以及 C++ 多线程基础。

### 容器与项目环境

- [Docker 与 Dev Container](../docker/index.md)：复现项目环境并减少“换一台电脑就不能运行”的问题。
- [常用命令恢复清单](../common-command/index.md)：重装 Ubuntu 后快速恢复开发工具。

### AI的使用

- [Codex 与 DeepSeek API](../Doxygen-commit/index.md)：在 VS Code 中使用 Codex，并按需接入 DeepSeek 模型。
- [提示词工程与日常 AI 使用](../prompt-engineering/index.md)：学习如何为 Codex、ChatGPT 和其他大语言模型提供上下文、约束与验收标准，并检查输出是否可靠。
- [Ubuntu VPN](../VPN教程/index.md)：仅在确有网络访问需求时参考，并注意保护个人订阅信息。

### 视觉设备与数据

- [视觉设备介绍](../visualDev/index.md)：了解队内主机、相机、雷达和通信设备。
- [Intel RealSense](../realsense/index.md)：深度相机基本使用与 API。
- [串口与 SocketCAN](../serialUse/index.md)：连接和排查硬件设备。
- [Roboflow 标注](../roboflow/Roboflow.md)：数据集标注与导出入口。
- [Blender 数据集生成](../blender/index.md)：合成数据、渲染和自动生成标签。
- [第四次培训讲稿](../tutorial/class4/index.md)：相机标定、卡尔曼滤波和 Docker 概念。

### ROS 2 与机器人软件

- [ROS 2 编程基础](../ros2/index.md)：节点、包、话题、消息和第一个 C++ 节点。
- [强化学习](../RL/index.md)：当前仍是待完善的拓展方向，不属于基础必修内容。

## 推荐学习路径

### 第一阶段：能独立使用 Ubuntu

目标：理解终端、文件路径、权限、软件安装、进程和网络，不再依赖复制不理解的命令。

建议顺序：

1. Linux 入门；
2. Bash 自学；
3. 进程、服务与例行任务；
4. SSH 与 Remote SSH；
5. Git 入门和 Markdown。

完成标准：能够通过 SSH 登录另一台主机，使用 Git 提交修改，并能根据报错找到日志和相关进程。

### 第二阶段：能编译和调试 C++ 项目

目标：理解源文件如何变成可执行程序，以及项目为什么需要 CMake。

建议顺序：

1. 第二次培训讲稿中的编译与链接；
2. CMake 入门；
3. 程序的启动与调试；
4. 使用 Codex 辅助解释、修改和审查代码；
5. 第三次培训讲稿中的多线程部分。

完成标准：能够从干净的构建目录配置、编译、运行和调试一个多文件 C++ 项目，并能解释常见的编译错误与链接错误。

### 第三阶段：实际开发

在以上的工程和知识基础上进行应用，并在应用中学习
