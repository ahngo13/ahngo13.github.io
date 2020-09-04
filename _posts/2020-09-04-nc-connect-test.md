---
title: nc(netcat)를 활용한 서버 간 통신 테스트 하기
layout: post
date: 2020-09-04 17:00:00 +0300
description: You’ll find this post in your `_posts` directory. Go ahead and edit it and re-build the site to see your changes. # Add post description (optional)
img: 2020-09-04_10h34_23.png # Add image post (optional)
fig-caption: # Add figcaption (optional)
tags: [nc, netcat, 서버통신, iptables]
---

- nc는 netcat의 약자로 TCP/UDP 프로토콜로 연결된 네트워크 상에서 데이터를 읽고 쓸 수 있는 유틸리티이다.

이번 포스팅의 내용은 nc를 활용해서 가상으로 띄운 서버 간 통신 테스트를 하는 방법인데 Window10에서 제공하는 Hyper-V라는 내장 가상머신을 사용해서 2개의 리눅스 서버(CentOS 7 minimal)를 띄우고 그 서버들 간의 통신 테스트를 해보려고 한다. 

CentOS 7 버전 설치하는 방법은 [이 링크](https://ahngo13.github.io/virtualbox/)를 클릭하면 확인할 수 있다. VirtualBox를 기준으로 설치하는 것으로 되어있지만 Hyper-V에서 설치하는 방법과 크게 다르지 않기 때문에 모험심(?)을 가지고 한번 도전해보기 바란다.

### 공통 영역 (Server, Client)

서버의 경우에는 Hyper-V 관리자를 열었을 때 아래와 같이 2개의 서버가 생성되어 있어야 하며, 필자는 'CentOS 7'과 'CentOS 7(client)' 이름을 가진 2개의 서버를 생성해서 CentOS 설치를 마쳐놓았다. 2개의 서버를 각각 더블 클릭해서 실행시켜주자.  

![/assets/img/2020-09-04_10h34_23.png](/assets/img/2020-09-04_10h34_23.png)

2개의 서버 모두다 아래와 같이 로그인을 하라고 화면이 뜰 것이다. CentOS 설치시에 지정 해두었던 계정으로 로그인하자.

![/assets/img/2020-09-04_10h36_57.png](/assets/img/2020-09-04_10h36_57.png)

1. 계정 아이디와 패스워드를 입력하고
2. root 계정을 사용하기 위해 su 명령어를 입력하고 
3. root 계정의 비밀번호도 입력해준다.

아래의 화면과 같이 root 권한을 사용할 준비가 될 것이다.

![/assets/img/Untitled3.png](/assets/img/Untitled3.png)

CentOS가 미니멀 버전으로 설치한 것이 맞다면 nc 모듈은 설치가 되어있지 않을 것이다. 아래의 명령어를 사용해 설치해주도록 하자. (물론 2개의 서버 모두 설치해야 한다)

```bash
yum install nc
```

설치가 완료되었다면 Server와 Client를 구분할 수 있는 IP 주소를 확인하도록 하겠다.

아래의 명령어를 이용해 IP주소를 확인하도록 하자.

```bash
ip a
```

![/assets/img/Untitled%201.png](/assets/img/Untitled%201.png)

필자의 Server의 IP 주소는 192.168.241.60이고 Client의 IP 주소는 192.168.251.230이다. 

역할은 이러하다.

Server (192.168.241.60) : 특정 포트(여기에선 30000으로 하겠다)를 열어주고 그 포트에 서버를 구성한다.

Client (192.168.251.230) : Server의 특정 포트에 접속해 메시지를 보낸다.

### Server 영역

먼저 아래의 명령어를 활용하여 방화벽 설정이 어떻게 되어있는지 확인하자.

이곳에서 사용하는 iptables는 리눅스 상에서 방화벽을 설정하는 도구이다.

결과 내용 중에 맨 윗 부분에 보면 Chain INPUT이라는 곳이 있는데 기본적으로 이와같이 설정이 되어있다. INPUT이라 함은 들어오는 패킷을 의미하므로 이 부분에 설정이 추가되어야 함을 알 수 있다.

(추후에 iptables 명령어에 대한 부분은 따로 정리하도록 하겠다)

```bash
//적용 상태 확인
iptables -nvL

//결과 내용 중 맨 윗 부분
Chain INPUT (policy ACCEPT 0 packets, 0 bytes)
 pkts bytes target     prot opt in     out     source               destination 
  389 34092 ACCEPT     all  --  *      *       0.0.0.0/0            0.0.0.0/0            ctstate RELATED,ESTABLISHED
    0     0 ACCEPT     all  --  lo     *       0.0.0.0/0            0.0.0.0/0   
   41  3146 INPUT_direct  all  --  *      *       0.0.0.0/0            0.0.0.0/0
   41  3146 INPUT_ZONES  all  --  *      *       0.0.0.0/0            0.0.0.0/0 
    0     0 DROP       all  --  *      *       0.0.0.0/0            0.0.0.0/0            ctstate INVALID
   39  3042 REJECT     all  --  *      *       0.0.0.0/0            0.0.0.0/0            reject-with icmp-host-prohibited
```

아래와 같은 명령어를 통해 첫번째 줄에 30000번 포트를 열어주는 설정을 추가해주어야 한다.

```bash
iptables -I INPUT 1 -p tcp --dport 30000 -j ACCEPT
```

-I : 새로운 규칙을 삽입 (Insert)

INPUT 1 : 이 컴퓨터를 향해 들어오는 모든 패킷에 대한 설정을 1번째 라인에 삽입하겠다.

-p : 특정 프로토콜과 매칭 (tcp, udp...)

—dport : 특정 포트

-j : 규칙에 맞는 패킷을 어떻게 처리할 것인가 명시 (ACCEPT, REJECT, DROP)

위와 같이 설정하고 다시 iptables -nvL 명령어로 적용된 내용을 확인하면

첫번째 줄에 30000번 포트를 허용하는 설정이 추가됨을 확인할 수 있다.

```bash
Chain INPUT (policy ACCEPT 0 packets, 0 bytes)
 pkts bytes target     prot opt in     out     source               destination 
    5   271 ACCEPT     tcp  --  *      *       0.0.0.0/0            0.0.0.0/0            tcp dpt:30000
  389 34092 ACCEPT     all  --  *      *       0.0.0.0/0            0.0.0.0/0            ctstate RELATED,ESTABLISHED
    0     0 ACCEPT     all  --  lo     *       0.0.0.0/0            0.0.0.0/0   
   41  3146 INPUT_direct  all  --  *      *       0.0.0.0/0            0.0.0.0/0
   41  3146 INPUT_ZONES  all  --  *      *       0.0.0.0/0            0.0.0.0/0 
    0     0 DROP       all  --  *      *       0.0.0.0/0            0.0.0.0/0            ctstate INVALID
   39  3042 REJECT     all  --  *      *       0.0.0.0/0            0.0.0.0/0            reject-with icmp-host-prohibited
```

그러면 서버 컴퓨터는 설정이 거의 다 되었다. 서버를 구성해주기만 하면된다. nc 명령어를 활용하여 서버를 구성해준다. 

```bash
nc -l 30000
```

### Client 영역

그러면 이제 클라이언트에서 서버 쪽 컴퓨터에 접속할 차례이다.

아래의 명령어를 입력해서 서버 쪽 컴퓨터에 접속한다. 접속이 잘 되었다면 메시지 없이 아래 쪽에 커서가 위치한 것을 알 수 있다. 여기에서 간단하게 hi를 입력하고 엔터를 친다. 

(hi 말고 다른 걸 입력해도 된다)

```bash
//nc [Server IP주소] [server 포트번호]
nc 192.168.241.60 30000
//접속이 잘 되었다면 아무런 메시지가 뜨지 않고 커서만 아래쪽에 위치한다.
hi
```

그러면 서버 쪽 컴퓨터에서 이와같은 반응이 나온다면 성공이다.

![/assets/img/2020-09-04_12h38_40.png](/assets/img/2020-09-04_12h38_40.png)

여기까지 성공했다면 client 컴퓨터에서 서버를 구성하고 server 컴퓨터에서 clent 컴퓨터로 접속해서 메시지를 날리는 것을 해보자.
