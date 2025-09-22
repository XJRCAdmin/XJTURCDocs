# 动机/背景
本文的泛用性并不大，因而需要道明写作动机，以供后来人参考。

遇到的问题在尝试**只能**使用网线连接树莓派 4B时，即不使用ssh等远程连接手段时，在windows 11 的power shell中`arp -a`未显示树莓派的`ip4`地址，但是`ping raspberrypi.local`能够发现树莓派返回的ipv6地址。

树莓派使用的是Network-Manager网络服务。
# 问题描述
在此对问题进行详细描述。
```
PS C:\Users\xixiboliya> ping -4 raspberrypi.local
Ping 请求找不到主机 raspberrypi.local。请检查该名称，然后重试。
PS C:\Users\xixiboliya> ping raspberrypi.local
正在 Ping fe80::1234:abcd:5678:90ef%11 具有 32 字节的数据:
来自 fe80::1234:abcd:5678:90ef%11 的回复: 时间=2ms
来自 fe80::1234:abcd:5678:90ef%11 的回复: 时间=2ms
来自 fe80::1234:abcd:5678:90ef%11 的回复: 时间=3ms
来自 fe80::1234:abcd:5678:90ef%11 的回复: 时间=2ms
fe80::1234:abcd:5678:90ef%11 的 Ping 统计信息:
    数据包: 已发送 = 4，已接收 = 4，丢失 = 0 (0% 丢失)，
往返行程的估计时间(以毫秒为单位):
    最短 = 2ms，最长 = 3ms，平均 = 2ms
```

`windows`上查看链接树莓派的相应链接：
```bash
以太网适配器 以太网: 
连接特定的 DNS 后缀 . . . . . . . :
描述. . . . . . . . . . . . . . . :
Realtek PCIe GbE Family Controller 物理地址. . . . . . . . . . . . . :08-BF-B8-D8-A8-2C 
DHCP 已启用 . . . . . . . . . . . : 是 
自动配置已启用. . . . . . . . . . : 是 
本地链接 IPv6 地址. . . . . . . . : fe80::9ccd:272e:8e40:1844%11(首选)
自动配置 IPv4 地址 . . . . . . . : 169.254.12.21(首选) 
子网掩码 . . . . . . . . . . . . : 255.255.0.0
默认网关. . . . . . . . . . . . . : 
DHCPv6 IAID . . . . . . . . . . . : 201899960 DHCPv6 客户端 DUID . . . . . . . : 00-01-00-01-2C-28-88-A3-08-BF-B8-D8-A8-2C
DNS 服务器 . . . . . . . . . . . : 
fec0:0:0:ffff::1%1 
fec0:0:0:ffff::2%1 
fec0:0:0:ffff::3%1 
TCPIP 上的 NetBIOS . . . . . . . : 已启用
```
# 核心原因解释

- 首先，它们会向网络发送 DHCP (动态主机配置协议) 请求，试图从 DHCP 服务器获取一个 IP 地址。但由于没有路由器或交换机，这个请求会失败。这可能是树莓派的原因，也可能是windows的原因。
- Windows 默认不会给以太网直连设备分配 IP（除非开了网络共享或者手动设定）。
- 在 DHCP 失败后，两台设备会进入 APIPA 模式，自动从 169.254.0.0/16 网段中随机分配一个 IP 地址给自己。但如果 Windows和树莓派在分配 APIPA 地址的过程中存在兼容性或同步问题，或者任何一方的网络服务未及时启动，就可能导致它们之间无法建立有效的 IPv4 通信。

## 为什么windows能够通过ipv6查找树莓派？
现代操作系统，包括 Windows 11 和树莓派的 Raspbian OS，都默认支持 IPv6，并且启用了本地链路地址 (Link-Local Address)的自动配置。

本地链路地址：所有支持 IPv6 的设备都会自动为每个网络接口配置一个本地链路地址，该地址的格式为 fe80::/10。这些地址只在本地网络段内有效，无需任何配置或路由器就能直接通信。

多播 DNS (mDNS)：树莓派上的 raspberrypi.local 这个域名正是通过 mDNS 协议实现的。当你在 Windows 11 上 `ping raspberrypi.local` 时，系统会发送一个多播查询到本地网络。

自动发现：树莓派收到这个查询后，会用自己的 IPv6 本地链路地址作为响应。Windows 11 接收到这个响应，就会使用树莓派的 IPv6 地址进行通信。

因此，即使 IPv4 地址配置失败，IPv6 的自动配置和多播 DNS 机制依然能够让两台设备在本地网络上通过主机名互相发现并进行通信。
# 修改方法

树莓派使用的是Network-Manager网络服务，把 `eth0` 设置为静态 IPv4。需要手动设置静态 IP 地址，将树莓派与windows置于同一个子网下。

## 确认当前连接名与设备状态
### 在 Windows 上运行：

- 将以太网适配器的 IPv4 地址设置为例如 192.168.1.1。
- 将以太网适配器的子网掩码设置为 255.255.255.0。

### 在 Pi 上运行：
```bash
nmcli device status
nmcli connection show
```
记下 `DEVICE` 列中对应 `eth0` 的连接名（例如常见 `Wired connection 1`），后面命令里把 `<CON_NAME>` 替换为它；或直接用 `ifname eth0` 新建连接。
## 用 nmcli 把 eth0 设为静态 IP
Chat老师推荐地址是 `192.168.1.2/24`，网关 `192.168.1.1`，DNS 用 `192.168.1.1`（或 `8.8.8.8`）：

- 第一种：修改已有连接：
```bash
# 替换 <CON_NAME> 为实际连接名，比如 "Wired connection 1"
sudo nmcli connection modify "<CON_NAME>" \
  ipv4.addresses 192.168.1.2/24 \
  ipv4.gateway 192.168.1.1 \
  ipv4.dns "192.168.1.1 8.8.8.8" \
  ipv4.method manual

# 使修改生效
sudo nmcli connection up "<CON_NAME>" ifname eth0
```
- 第二种：直接新建一个只针对 eth0 的静态连接：
```bash
sudo nmcli connection add type ethernet ifname eth0 con-name static-eth0 \   
ipv4.addresses 192.168.1.2/24 ipv4.gateway 192.168.1.1 ipv4.dns "8.8.8.8" ipv4.method manual sudo nmcli connection up static-eth0
```

之后就可以`192.168.1.2`找到树莓派 4B。

