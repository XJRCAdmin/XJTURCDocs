---
<<<<<<< HEAD
title: 串口使用
=======
title: 
>>>>>>> a4d3115be996eb9006e7e580ce1c06261d825122
date: 2024-10-19
description: >
resources:
  - src: "**.{png,jpg}"
---

<<<<<<< HEAD
## 逐飞无线串口

=======
## Linux 上硬件设备的调试

### 命令： dmesg

demsg 是用于显示linux内核日志的命令，由于在插入usb或者其他硬件设备时，linux内核会加载设备驱动，因此通过日志可以找到驱动加载的信息，换言之，如果没有相关日志，那么说明内核中没有对应的驱动，需要自己编译安装驱动。

具体使用

```bash

# 在最后20行查找usb
dmesg | tail -20 | grep -i usb

# 在最后20行查找can
dmesg | tail -20 | grep -i can

```

### 命令： lsusb

> https://zhuanlan.zhihu.com/p/142403866

lsusb 用于展示usb设备与属性，使用-v选项展示详细内容

```bash

lsusb # 简要展示当前连接的所有设备描述
lsusb -v | grep usb # 详细展现设备的日志记录

```

### 设备文件夹 /dev

/dev 目录下的所有文件都是代表设备的文件描述符，被系统识别的设备会以一定规则生成这样的描述符，比如连接usb-ttl或者usb-can时，会生成一个可读可写的管道描述符，命名会以 `ttyUSB` ， `ttyACM` 或者 `ttyCOM` 开头。 

在实际使用中，可以通过向该文件“读”“写”，来做到从硬件设备接受数据与发送数据的作用，比如`ttyUSB0`与`ttyUSB1`是一对连接好的usb-ttl，向其中一边发送数据，另一端会接受到数据。

```bash

echo "hello world" >> /dev/ttyUSB0
cat /dev/ttyUSB1

```

## 逐飞无线串口
>>>>>>> a4d3115be996eb9006e7e580ce1c06261d825122
