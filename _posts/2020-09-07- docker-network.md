---
title: 도커 네트워크 (Docker Network) 명령어 정리
layout: post
date: 2020-09-07 17:52:00 +0300
description: You’ll find this post in your `_posts` directory. Go ahead and edit it and re-build the site to see your changes. # Add post description (optional)
img:  # Add image post (optional)
fig-caption: # Add figcaption (optional)
tags: [도커, docker, dockernetwork, dockerbridge, hostnetwork, nonenetwork, containernetwork]
---

- 컨테이너는 기본적으로 eth0과 lo 네트워크 인터페이스로 구성
- 내부 IP를 순차적으로 할당하기 때문에 재시작 할 때마다 변경될 수 있음
- 외부와 연결시에는 veth(virtual eth)라는 네트워크 인터페이스를 생성하고 컨테이너의 eth와 연결됨. (veth 인터페이스는 도커 엔진에서 자동 생성함)
- docker() 브리지라는 것도 있는데 veth 인터페이스와 바인딩되어 호스트의 eth 인터페이스와 연결

```bash
[root@36075ffb5c95 /]# ifconfig
eth0: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500
        inet 172.18.0.4  netmask 255.255.0.0  broadcast 172.18.255.255
        ether 02:42:ac:12:00:04  txqueuelen 0  (Ethernet)
        RX packets 1521  bytes 11865754 (11.3 MiB)
        RX errors 0  dropped 0  overruns 0  frame 0
        TX packets 1377  bytes 93549 (91.3 KiB)
        TX errors 0  dropped 0 overruns 0  carrier 0  collisions 0

lo: flags=73<UP,LOOPBACK,RUNNING>  mtu 65536
        inet 127.0.0.1  netmask 255.0.0.0
        loop  txqueuelen 1000  (Local Loopback)
        RX packets 0  bytes 0 (0.0 B)
        RX errors 0  dropped 0  overruns 0  frame 0
        TX packets 0  bytes 0 (0.0 B)
        TX errors 0  dropped 0 overruns 0  carrier 0  collisions 0
```

## 도커 네트워크 드라이버 종류

- 브리지 (bridge)
- 호스트 (host)
- 논 (none)
- 컨테이너 (container)
- 등등

### 브릿지 네트워크

- docker() 브리지와 비슷하지만 사용자가 브리지를 생성해 각 컨테이너에 연결하는 네트워크 구조
- docker network create —driver bridge [브리지 이름]

```bash
[root@localhost test]# docker network create --driver bridge ahngo13
ff3a3c35f36a9bdcb83a24453801d1550194be46cce3aa2a82762fbccc4742ea
```

- 위에서 생성한 브리지는 `docker run` 나  `docker create`  명령어에서 `--net` 옵션을 설정하면 커스텀 브리지를 사용할 수 있음

```bash
[root@localhost test]# docker run -it --name web4 --net ahngo13 centos:7
[root@19aa7f2263e2 /]#
```

### 호스트 네트워크

- 네트워크를 호스트로 설정하면 호스트 네트워크 환경을 그대로 사용 가능
- 컨테이너 내부의 어플리케이션을 별도의 포트 포워딩 없이 바로 서비스 가능

```bash
[root@localhost test]# docker run -it --name web5 --net host centos:7
[root@localhost /]#
```

### 논 네트워크

- 네트워크를 사용하지 않는 것을 의미
- 네트워크 인터페이스는 lo 인터페이스만 나타남
- 외부와 단절

```bash
root@3af348080363:/# ifconfig
lo        Link encap:Local Loopback
          inet addr:127.0.0.1  Mask:255.0.0.0
          UP LOOPBACK RUNNING  MTU:65536  Metric:1
          RX packets:0 errors:0 dropped:0 overruns:0 frame:0
          TX packets:0 errors:0 dropped:0 overruns:0 carrier:0
          collisions:0 txqueuelen:1000
          RX bytes:0 (0.0 B)  TX bytes:0 (0.0 B)
```

### 컨테이너 네트워크

- 다른 컨테이너의 환경을 공유할 수 있음
- — net container : [다른 컨테이너의 ID]
- 아래의 결과를 보면 container_network와 container_network1이 동일한 네트워크를 가지고 있는 것을 확인할 수 있음

```bash
[root@localhost test]# docker run -it -d --name container_network1 ubuntu:14.04
7fc4148c57308db88a2e2989f30a6402fef4b97748ec1bf10dd5d4302c997a8b
[root@localhost test]# docker run -it -d --name container_network --net container:container_network1 ubuntu:14.04
0b8d2ddb296081fc19b6298f0b62fdc88e5b5e11bf4337baaf09ae43286a2b9a

[root@localhost test]# docker exec -it container_network1 /bin/bash
root@7fc4148c5730:/# ifconfig
eth0      Link encap:Ethernet  HWaddr 02:42:ac:12:00:05
          inet addr:172.18.0.5  Bcast:172.18.255.255  Mask:255.255.0.0
          UP BROADCAST RUNNING MULTICAST  MTU:1500  Metric:1
          RX packets:8 errors:0 dropped:0 overruns:0 frame:0
          TX packets:0 errors:0 dropped:0 overruns:0 carrier:0
          collisions:0 txqueuelen:0
          RX bytes:656 (656.0 B)  TX bytes:0 (0.0 B)

lo        Link encap:Local Loopback
          inet addr:127.0.0.1  Mask:255.0.0.0
          UP LOOPBACK RUNNING  MTU:65536  Metric:1
          RX packets:0 errors:0 dropped:0 overruns:0 frame:0
          TX packets:0 errors:0 dropped:0 overruns:0 carrier:0
          collisions:0 txqueuelen:1000
          RX bytes:0 (0.0 B)  TX bytes:0 (0.0 B)

[root@localhost test]# docker exec -it container_network /bin/bash
root@7fc4148c5730:/# ifconfig
eth0      Link encap:Ethernet  HWaddr 02:42:ac:12:00:05
          inet addr:172.18.0.5  Bcast:172.18.255.255  Mask:255.255.0.0
          UP BROADCAST RUNNING MULTICAST  MTU:1500  Metric:1
          RX packets:8 errors:0 dropped:0 overruns:0 frame:0
          TX packets:0 errors:0 dropped:0 overruns:0 carrier:0
          collisions:0 txqueuelen:0
          RX bytes:656 (656.0 B)  TX bytes:0 (0.0 B)

lo        Link encap:Local Loopback
          inet addr:127.0.0.1  Mask:255.0.0.0
          UP LOOPBACK RUNNING  MTU:65536  Metric:1
          RX packets:0 errors:0 dropped:0 overruns:0 frame:0
          TX packets:0 errors:0 dropped:0 overruns:0 carrier:0
          collisions:0 txqueuelen:1000
          RX bytes:0 (0.0 B)  TX bytes:0 (0.0 B)
```

### 브릿지 네트워크의 —net-alias 활용

- `—net-alias` 옵션을 같이 사용하면 네트워크 구성에 별칭을 줄 수 있음
- mybridge라는 브릿지 네트워크에 net-alias를 적용해서 ping으로 응답 테스트

```bash
//mybridge 브릿지 네트워크 생성
[root@localhost test]# docker network create --driver bridge mybridge
e38754cae9281f8325207315cee017204523abe29e25e7185002d325cd673066

//3개의 container에 net-alias net_team이라는 net-alias 적용
[root@localhost test]# docker run -it -d --name network_alias_con1 --net mybridge --net-alias net_team ubuntu:14.04
a31137b554a318a8a1c8dc768df22258c8d17d74236c3debbdb8ecfb621504c3
[root@localhost test]# docker run -it -d --name network_alias_con2 --net mybridge --net-alias net_team ubuntu:14.04
80f0fce079d349a8308c7b4517b727032d1411198364b65e40cfe1381e08d699
[root@localhost test]# docker run -it -d --name network_alias_con3 --net mybridge --net-alias net_team ubuntu:14.04
58ffab5637f74728896ad08cdfbdf6156087ccf3bd3fa7dbb6f3940a438f6396

//각각의 container의 ip 확인
[root@localhost test]# docker exec -it network_alias_con1 /bin/bash
root@a31137b554a3:/# ifconfig
eth0      Link encap:Ethernet  HWaddr 02:42:ac:14:00:02
          inet addr:172.20.0.2  Bcast:172.20.255.255  Mask:255.255.0.0
          UP BROADCAST RUNNING MULTICAST  MTU:1500  Metric:1
          RX packets:13 errors:0 dropped:0 overruns:0 frame:0
          TX packets:0 errors:0 dropped:0 overruns:0 carrier:0
          collisions:0 txqueuelen:0
          RX bytes:1102 (1.1 KB)  TX bytes:0 (0.0 B)

lo        Link encap:Local Loopback
          inet addr:127.0.0.1  Mask:255.0.0.0
          UP LOOPBACK RUNNING  MTU:65536  Metric:1
          RX packets:0 errors:0 dropped:0 overruns:0 frame:0
          TX packets:0 errors:0 dropped:0 overruns:0 carrier:0
          collisions:0 txqueuelen:1000
          RX bytes:0 (0.0 B)  TX bytes:0 (0.0 B)

root@a31137b554a3:/# exit
exit
[root@localhost test]# docker exec -it network_alias_con2 /bin/bash                      root@80f0fce079d3:/# ifconfig
eth0      Link encap:Ethernet  HWaddr 02:42:ac:14:00:03
          inet addr:172.20.0.3  Bcast:172.20.255.255  Mask:255.255.0.0
          UP BROADCAST RUNNING MULTICAST  MTU:1500  Metric:1
          RX packets:8 errors:0 dropped:0 overruns:0 frame:0
          TX packets:0 errors:0 dropped:0 overruns:0 carrier:0
          collisions:0 txqueuelen:0
          RX bytes:656 (656.0 B)  TX bytes:0 (0.0 B)

lo        Link encap:Local Loopback
          inet addr:127.0.0.1  Mask:255.0.0.0
          UP LOOPBACK RUNNING  MTU:65536  Metric:1
          RX packets:0 errors:0 dropped:0 overruns:0 frame:0
          TX packets:0 errors:0 dropped:0 overruns:0 carrier:0
          collisions:0 txqueuelen:1000
          RX bytes:0 (0.0 B)  TX bytes:0 (0.0 B)

root@80f0fce079d3:/# exit
exit
[root@localhost test]# docker exec -it network_alias_con3 /bin/bash
root@58ffab5637f7:/# ifconfig
eth0      Link encap:Ethernet  HWaddr 02:42:ac:14:00:04
          inet addr:172.20.0.4  Bcast:172.20.255.255  Mask:255.255.0.0
          UP BROADCAST RUNNING MULTICAST  MTU:1500  Metric:1
          RX packets:8 errors:0 dropped:0 overruns:0 frame:0
          TX packets:0 errors:0 dropped:0 overruns:0 carrier:0
          collisions:0 txqueuelen:0
          RX bytes:656 (656.0 B)  TX bytes:0 (0.0 B)

lo        Link encap:Local Loopback
          inet addr:127.0.0.1  Mask:255.0.0.0
          UP LOOPBACK RUNNING  MTU:65536  Metric:1
          RX packets:0 errors:0 dropped:0 overruns:0 frame:0
          TX packets:0 errors:0 dropped:0 overruns:0 carrier:0
          collisions:0 txqueuelen:1000
          RX bytes:0 (0.0 B)  TX bytes:0 (0.0 B)

//ping 테스트를 위한 컨테이너 생성
[root@localhost test]# docker run -it -d --name ping_test --net mybridge ubuntu:14.04
d214ed9902224f08ca0ed34a5584cfbe81da68146976c04bac5ba874bf149dba
[root@localhost test]# docker exec -it ping_test /bin/bash
root@d214ed990222:/# ping -c 1 net_team

//ping 테스트 (IP가 그때마다 다르다는 것을 알 수 있음)
--- net_team ping statistics ---
1 packets transmitted, 1 received, 0% packet loss, time 0ms
rtt min/avg/max/mdev = 0.044/0.044/0.044/0.000 ms
root@d214ed990222:/# ping -c 1 net_team
PING net_team (172.20.0.3) 56(84) bytes of data.
64 bytes from network_alias_con2.mybridge (172.20.0.3): icmp_seq=1 ttl=64 time=0.047 ms

--- net_team ping statistics ---
1 packets transmitted, 1 received, 0% packet loss, time 0ms
rtt min/avg/max/mdev = 0.047/0.047/0.047/0.000 ms
root@d214ed990222:/# ping -c 1 net_team
PING net_team (172.20.0.2) 56(84) bytes of data.
64 bytes from network_alias_con1.mybridge (172.20.0.2): icmp_seq=1 ttl=64 time=0.043 ms

--- net_team ping statistics ---
1 packets transmitted, 1 received, 0% packet loss, time 0ms
rtt min/avg/max/mdev = 0.043/0.043/0.043/0.000 ms
root@d214ed990222:/# ping -c 1 net_team
PING net_team (172.20.0.4) 56(84) bytes of data.
64 bytes from network_alias_con3.mybridge (172.20.0.4): icmp_seq=1 ttl=64 time=0.073 ms
```
