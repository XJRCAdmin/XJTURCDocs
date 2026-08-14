---
title: Ubuntu 重装后的快速配置清单
date: 2026-08-14
description: 视觉组电脑重装 Ubuntu 后的环境恢复顺序、常用安装命令与检查清单。
---

# Ubuntu 重装后的快速配置清单

!!! info "这篇文档的用途"
    本页不是 Linux 入门教程，而是一份**系统重装后的环境恢复清单**。当视觉组的 Intel NUC、雷神主机或个人开发电脑需要重装 Ubuntu 时，可以按照这里的顺序快速恢复常用工具。

    如果你是第一次学习 Linux，请先阅读[视觉组文档导览与学习路径](../learning-path/index.md)，再回到本页操作。

本文主要面向 Ubuntu 22.04/24.04 LTS 与 x86_64（amd64）设备。不同项目可能固定使用不同的 Ubuntu、ROS 2、CUDA 或驱动版本，重装前应先确认项目要求。

## 0. 重装前先备份

如果旧系统仍能启动，至少检查以下内容：

- 已完成的代码是否已经提交并推送到远程仓库；
- `~/.ssh/`、`~/.gitconfig` 和需要保留的 `~/.config/` 配置；
- 浏览器书签、实验数据、标定文件、模型权重和数据集；
- VS Code 扩展列表；
- Conda/Python 环境及项目依赖；
- 设备驱动版本、CUDA 版本、ROS 2 发行版和项目分支。

可以先导出部分清单：

```bash
mkdir -p ~/reinstall-backup

git config --global --list > ~/reinstall-backup/git-config.txt
code --list-extensions > ~/reinstall-backup/vscode-extensions.txt
conda env list > ~/reinstall-backup/conda-env-list.txt 2>/dev/null || true
dpkg --get-selections > ~/reinstall-backup/apt-packages.txt
```

!!! danger "不要上传密钥"
    SSH 私钥、API Key、VPN 订阅地址和服务器密码只能保存到可信的离线介质或密码管理器，不要提交到 Git 仓库。

## 1. 更新系统

```bash
sudo apt update
sudo apt upgrade -y
```

如果升级了内核、显卡驱动或其他底层组件，建议先重启再继续：

```bash
sudo reboot
```

## 2. 安装基础工具

下面这组软件覆盖常见的 C/C++ 编译、调试、Git、网络诊断和终端操作：

```bash
sudo apt install -y \
  build-essential clang clangd cmake ninja-build gdb \
  git git-lfs curl wget ca-certificates gnupg \
  unzip zip vim tree htop tmux \
  iproute2 net-tools openssh-client openssh-server

git lfs install
```

快速检查：

```bash
gcc --version
clang --version
clangd --version
cmake --version
git --version
```

## 3. 配置 Git

将示例内容替换为自己的姓名和邮箱：

```bash
git config --global user.name "你的名字"
git config --global user.email "你的邮箱"
git config --global init.defaultBranch main
git config --global core.autocrlf input
```

检查配置：

```bash
git config --global --list
```

Git、分支、远程仓库和 SSH 密钥的解释见 [Git 入门](../GitIntro/index.md)。

## 4. 开启 SSH 服务（按需）

只有需要让其他电脑远程登录本机时，才需要开启 SSH 服务端：

```bash
sudo systemctl enable --now ssh
systemctl status ssh --no-pager
```

查看本机地址：

```bash
ip address
```

远程连接、密钥认证和 VS Code Remote SSH 的配置见 [SSH 与 Remote SSH](../ssh&remotessh/index.md)。

## 5. 安装 Miniconda（按需）

先确认处理器架构：

```bash
dpkg --print-architecture
```

Intel NUC 和雷神主机通常显示 `amd64`：

```bash
wget https://repo.anaconda.com/miniconda/Miniconda3-latest-Linux-x86_64.sh
bash Miniconda3-latest-Linux-x86_64.sh
```

ARM64 设备通常显示 `arm64`：

```bash
wget https://repo.anaconda.com/miniconda/Miniconda3-latest-Linux-aarch64.sh
bash Miniconda3-latest-Linux-aarch64.sh
```

安装完成后重新打开终端，然后关闭 base 环境的自动激活：

```bash
conda config --set auto_activate_base false
conda --version
```

恢复项目时应优先使用仓库提供的 `environment.yml`、`requirements.txt`、容器或其他锁定依赖的文件，不要仅凭旧电脑的全局环境猜测依赖。

## 6. 安装 VS Code 与常用扩展

如果系统已经启用 Snap，可以安装 VS Code：

```bash
sudo snap install code --classic
```

视觉组常用扩展可以按需安装：

```bash
code --install-extension llvm-vs-code-extensions.vscode-clangd
code --install-extension ms-vscode.cmake-tools
code --install-extension vadimcn.vscode-lldb
code --install-extension ms-vscode-remote.remote-ssh
code --install-extension ms-vscode-remote.remote-containers
code --install-extension ms-python.python
code --install-extension openai.chatgpt
```

如果重装前已经导出了扩展列表，可以批量恢复：

```bash
xargs -n 1 code --install-extension < ~/reinstall-backup/vscode-extensions.txt
```

## 7. 安装桌面常用软件（按需）

安装文档阅读工具：

```bash
sudo apt install -y libreoffice-writer
```

安装 Google Chrome：

```bash
wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb
sudo apt install -y ./google-chrome-stable_current_amd64.deb
```

Chrome 安装包只适用于 amd64。ARM64 设备应使用系统仓库中的 Chromium 或其他支持该架构的浏览器。

## 8. 配置 Zsh（可选）

Zsh、Oh My Zsh、主题和字体属于个人偏好，不是项目运行的必要条件。先安装 Zsh：

```bash
sudo apt install -y zsh fonts-powerline
chsh -s "$(command -v zsh)"
```

如果要安装第三方配置框架，应先阅读脚本内容，再决定是否执行远程安装脚本。安装完成后，可根据个人需要配置自动补全和语法高亮。

## 9. 恢复项目环境

恢复项目时建议遵循以下顺序：

1. 克隆仓库并切换到项目指定分支；
2. 执行 `git lfs pull` 获取大文件；
3. 阅读仓库的 `README`、`AGENTS.md`、Dockerfile 或 `.devcontainer/`；
4. 安装项目明确声明的依赖；
5. 编译并运行最小测试；
6. 最后再配置相机、雷达、串口、CUDA、ROS 2 等硬件相关环境。

```bash
git clone <仓库地址>
cd <仓库目录>
git lfs pull
```

Docker 与开发容器见 [Docker 与 Dev Container](../docker/index.md)，ROS 2 见 [ROS 2 编程基础](../ros2/index.md)。

!!! warning "不要盲目执行一键脚本"
    ROS 2、显卡驱动、CUDA 和设备 SDK 必须与项目版本匹配。远程脚本可能随时间变化，执行前应确认来源并阅读内容。

## 10. 重装完成检查

- [ ] 系统版本和架构符合项目要求；
- [ ] Git 姓名、邮箱、SSH 密钥和 Git LFS 正常；
- [ ] 编译器、CMake、调试器和 clangd 可用；
- [ ] VS Code 能打开项目并识别头文件；
- [ ] 项目能够完成一次干净编译和最小测试；
- [ ] ROS 2、CUDA、相机和雷达驱动版本已记录；
- [ ] 未把密码、API Key、VPN 订阅或私钥提交到仓库。

如果某一步失败，不要继续堆叠安装命令。先记录报错、系统版本和已经执行的命令，再根据对应专题文档排查。
