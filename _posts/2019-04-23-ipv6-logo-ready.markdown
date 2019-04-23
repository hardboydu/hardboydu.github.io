---
layout: post
title:  "搭建IPv6 认证自测环境"
date:   2019-04-23 15:45:00 +0800
categories: IPv6 FreeBSD Linux networking protocol
---

## 准备环境

准备一个虚拟机环境，上边运行着两个虚拟机，虚拟机TN和虚拟机NUT，如图所示

![image](/assets/images/2019-04-23/001.png)

这两个虚拟机各通过一个PCI直通的网卡直连，TN 使用这个直连的通路对NUT进行IPv6 认证测试。这两个虚拟机的控制网口通过宿主机的网桥进行连接。

>* *虚拟机的搭建参考 [Setup qemu kvm kimchi on CentOS 7.5](https://hardboydu.github.io/centos/qemu/kvm/kimchi/2018/08/30/centos-qemu-kvm-kimchi.html)*

### TN 操作系统安装

操作系统一定要选择 **FreeBSD** 的 **32bit** 版本，官方推荐的版本号是 [FreeBSD-7.3-RELEASE-i386](http://freebsd.sin.openmirrors.asia/pub/FreeBSD/releases/i386/ISO-IMAGES/7.3/)。

操作系统安装时将 Developer、Kern-Developer、User：

![image](/assets/images/2019-04-23/002.png)

安装时禁用通信网卡的 IPv6 功能

![image](/assets/images/2019-04-23/003.png)

安装到最后可以选择额外安装的数据包，将 Perl 勾选：

![image](/assets/images/2019-04-23/004.PNG)

安装完后可以查看网卡信息：

```sh
IPv6-Ready-TN# ifconfig
em0: flags=8843<UP,BROADCAST,RUNNING,SIMPLEX,MULTICAST> metric 0 mtu 1500
        options=9b<RXCSUM,TXCSUM,VLAN_MTU,VLAN_HWTAGGING,VLAN_HWCSUM>
        ether 52:54:00:cc:99:34
        inet 192.168.110.165 netmask 0xffffff00 broadcast 192.168.110.255
        media: Ethernet autoselect (1000baseTX <full-duplex>)
        status: active
bce0: flags=8802<BROADCAST,SIMPLEX,MULTICAST> metric 0 mtu 1500
        options=1bb<RXCSUM,TXCSUM,VLAN_MTU,VLAN_HWTAGGING,JUMBO_MTU,VLAN_HWCSUM,TSO4>
        ether 00:24:e8:79:84:2a
        media: Ethernet autoselect (1000baseTX <full-duplex>)
        status: active
```

* `em0`: 通信网卡
* `bce0`: 与NUT直通的网卡

### TN 测试套件依赖库的安装

* [v6eval-3.3.4.tar.gz](https://www.ipv6ready.org.cn/home/views/default/resource/release/v6eval-3.3.4.tar.gz)
* [ct-2.1.1.tar.gz](https://www.ipv6ready.org.cn/home/views/default/resource/release/ct/ct-2.1.1.tar.gz)
* [Self_Test_5-0-1.tgz](https://www.ipv6ready.org.cn/home/views/default/resource/logo/release/Self_Test_5-0-1.tgz)

在安装测试套件之前，需要安装测试套件的依赖库，主要是 Perl5 模块

* `Expect`
* `IO-Stty`
* `IO-Tty`
* `Digest-MD5`
* `YAML`

```log
# cd /usr/ports/lang/p5-Expect && make install
# cd /usr/ports/security/p5-Digest-MD5 && make install
# cd /usr/ports/textproc/p5-YAML && make install
```

但由于操作系统太老，这个版本操作系统的源基本已经不可用，所以，只能去找到这些库的安装包，放到 `/usr/ports/distfiles/` 目录中，然后在执行上述命令。

* `Digest-MD5-2.39.tar.gz`
* `Expect-1.21.tar.gz`
* `IO-Tty-1.08.tar.gz`
* `YAML-0.71.tar.gz`

### TN 测试套件的安装

执行如下命令编译安装：

```sh
tar xzf v6eval-3.3.4.tar.gz
cd cd v6eval-3.3.4
make
make install
```

安装完成后，到目录 `/usr/local/v6eval/etc` 下编辑配置文件：

配置 TN

```sh
cp tn.def.sample tn.def
vim tn.def
```

修改 LINK0 如下：

```conf
Link0           bce0            00:24:e8:79:84:2a
```

`bce0` 就是 TN 与 NUT 直连的那个网卡名称，第三列是这个网卡的MAC 地址（是不是可以不用设置）

配置 NUT

假设 NUT 的网卡 ens8 是 与 TN 直连的那个网卡 :

```log
ens8: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500
        inet6 fe80::6eb3:11ff:fe32:777f  prefixlen 64  scopeid 0x20<link>
        ether 6c:b3:11:32:77:7f  txqueuelen 1000  (Ethernet)
        RX packets 0  bytes 0 (0.0 B)
        RX errors 0  dropped 0  overruns 0  frame 0
        TX packets 8  bytes 656 (656.0 B)
        TX errors 0  dropped 0 overruns 0  carrier 0  collisions 0
        device memory 0xfe860000-fe87ffff
```

```sh
cp nut.def.sample nut.def
vim nut.def
```

修改 LINK0 如下：

```conf
Link0           ens8            6c:b3:11:32:77:7f
```

ens8 为与 TN 直连的那个网卡，第三列是这个网卡的 MAC 地址。

然后安装 ct

```sh
tar xzf ct-2.1.1.tar.gz
cd ct-2.1.1
make install
```
