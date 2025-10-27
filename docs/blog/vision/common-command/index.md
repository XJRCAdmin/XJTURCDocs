---
title: 常用命令汇总
date: 2025-04-20
---
# 常用命令汇总
!!! note "前言"
    任何人都可以完善这一篇博文。

由于不想一直gpt询问或者搜索一些很基础的命令，所以这里总结一下。
## 基础编译套餐
```bash
sudo apt install -y build-essential clang cmake make git curl wget unzip zip
sudo apt install -y vim tree htop tmux
```
## 开启ssh service
```bash
sudo systemctl enable ssh
sudo systemctl start ssh
sudo systemctl status ssh #查看状态
```
## miniconda
以下命令不需要加上`sudo`，因为我们需要将conda安装在用户目录下。
```bash
x86_64：
wget https://repo.anaconda.com/miniconda/Miniconda3-latest-Linux-x86_64.sh
chmod +x Miniconda3-latest-Linux-x86_64.sh
./Miniconda3-latest-Linux-x86_64.sh  # not sudo
接着一路ENTER...
```

`arrch64`例如树莓派 Jetson系列：

```bash
arrch_64:
wget https://repo.anaconda.com/miniconda/Miniconda3-latest-Linux-aarch64.sh
chmod 776 Miniconda3-latest-Linux-aarch64.sh
./Miniconda3-latest-Linux-aarch64.sh
# 取消开机自启动
conda config --set auto_activate_base false
```

换源：
```bash
vim ~/.condarc
```

在里面粘贴中科大镜像源：
```bash
channels:
  - defaults
show_channel_urls: true
default_channels:
  - https://mirrors.ustc.edu.cn/anaconda/pkgs/main
  - https://mirrors.ustc.edu.cn/anaconda/pkgs/r
  - https://mirrors.ustc.edu.cn/anaconda/pkgs/msys2
custom_channels:
  conda-forge: https://mirrors.ustc.edu.cn/anaconda/cloud
  msys2: https://mirrors.ustc.edu.cn/anaconda/cloud
  bioconda: https://mirrors.ustc.edu.cn/anaconda/cloud
  menpo: https://mirrors.ustc.edu.cn/anaconda/cloud
  pytorch: https://mirrors.ustc.edu.cn/anaconda/cloud
  simpleitk: https://mirrors.ustc.edu.cn/anaconda/cloud
```

## zsh或者oh-my-zsh 
```bash
sudo apt update
sudo apt install zsh
sh -c "$(curl -fsSL https://raw.github.com/ohmyzsh/ohmyzsh/master/tools/install.sh)"
```
为了兼容主题，接下来安装字体:
```zsh
wget https://github.com/ryanoasis/nerd-fonts/releases/download/v3.3.0/JetBrainsMono.zip -O JetBrainsMono.zip
unzip JetBrainsMono.zip -d JetBrainsMono
mkdir -p ~/.local/share/fonts/JetBrainsMono
cp JetBrainsMono/*.ttf ~/.local/share/fonts/JetBrainsMono/
fc-cache -fv
```
安装完插件之后就可以修改命令行中的字体选项了，找到安装的字体并设定。
![](images/image.45hryie6yz.webp)
安装插件：
```zsh
git clone https://github.com/zsh-users/zsh-autosuggestions ${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/plugins/zsh-autosuggestions
git clone https://github.com/zsh-users/zsh-syntax-highlighting.git ${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/plugins/zsh-syntax-highlighting
git clone --depth=1 https://github.com/romkatv/powerlevel10k.git ${ZSH_CUSTOM:-$HOME/.oh-my-zsh/custom}/themes/powerlevel10k
```
修改配置文件：
```zsh 
ZSH_THEME="powerlevel10k/powerlevel10k"
plugins=(z git zsh-autosuggestions zsh-syntax-highlighting)
```
## git
要修改全局的Git用户名和邮箱，可以使用以下命令：
```bash
git config --global user.name "新的用户名"
git config --global user.email "新的邮箱地址"
```

## Neovim

[安装lazyvim](../lazyvim/index.md)

## docx阅读器
```bash
sudo apt update
sudo apt install libreoffice-writer
libreoffice yourfile.docx  # 打开文件
```
# 鱼香ros一键安装脚本
```bash
wget http://fishros.com/install -O fishros && . fishros
```