---
title: 도커(Docker) 설치 및 컨테이너(Container) 기본 명령어 정리
layout: post
date: 2020-09-07 17:51:00 +0300
description: Docker 기본 설치
img:  # Add image post (optional)
fig-caption: # Add figcaption (optional)
tags: [도커, docker, container, docker명령어, dockercontainer]
---

## Docker 기본 설치

```bash
# yum 패키지 업데이트
yum -y update

# docker, docker registry 설치
yum -y install docker docker-registry
```

## Docker 버전 확인

```bash
docker --version
Docker version 19.03.12, build 48a66213fe

docker version
Client: Docker Engine - Community
 Version:           19.03.12
 API version:       1.40
 Go version:        go1.13.10
 Git commit:        48a66213fe
 Built:             Mon Jun 22 15:46:54 2020
 OS/Arch:           linux/amd64
 Experimental:      false

Server: Docker Engine - Community
 Engine:
  Version:          19.03.12
  API version:      1.40 (minimum version 1.12)
  Go version:       go1.13.10
  Git commit:       48a66213fe
  Built:            Mon Jun 22 15:45:28 2020
  OS/Arch:          linux/amd64
  Experimental:     false
 containerd:
  Version:          1.2.13
  GitCommit:        7ad184331fa3e55e52b890ea95e65ba581ae3429
 runc:
  Version:          1.0.0-rc10
  GitCommit:        dc9208a3303feef5b3839f4323d9beb36df0a9dd
 docker-init:
  Version:          0.18.0
  GitCommit:        fec3683
```

## Docker 실행 및 자동 실행 등록

```bash
# 부딩시에 실행하도록 등록
systemctl enable docker.service

# docker 실행
systemctl start docker.service

# docker status 확인
systemctl status docker.service
```

# Docker Container 기본 명령어 정리

## 컨테이너 생성

- docker container create [옵션] [이미지 이름] [명령] [매개변수]
- 생성만 되고 실행이 되지는 않음

```bash
[root@localhost ~]# docker container create --name web -p 8080:8080 nginx
Unable to find image 'nginx:latest' locally
latest: Pulling from library/nginx
bf5952930446: Pull complete
cb9a6de05e5a: Pull complete
9513ea0afb93: Pull complete
b49ea07d2e93: Pull complete
a5e4a503d449: Pull complete
Digest: sha256:b0ad43f7ee5edbc0effbc14645ae7055e21bc1973aee5150745632a24a752661
Status: Downloaded newer image for nginx:latest
22c2aa22948203a40971a86c3c380b162ad0f66f3b0b5a9bab47e5c9647ab54c
```

## 컨테이너 실행 및 시작

- docker container run [옵션] [이미지 이름] [명령] [매개변수]
- -d는 백그라운드 실행을 의미
- 없으면 pull 받고 실행

옵션

-d : detached mode 흔히 말하는 백그라운드 모드

-p : 호스트와 컨테이너의 포트를 연결 (포워딩)

-v : 호스트와 컨테이너의 디렉토리를 연결 (마운트)

-e : 컨테이너 내에서 사용할 환경변수 설정

–name : 컨테이너 이름 설정

–rm : 프로세스 종료시 컨테이너 자동 제거

-it : -i와 -t를 동시에 사용한 것으로 터미널 입력을 위한 옵션

–link : 컨테이너 연결 [컨테이너명:별칭]

```bash
[root@localhost ~]# docker container run --name web2 -d -p 8080:8080 nginx
7a268c7232e69181df35699a4b4a4cf3aa663da7ae1249c160b48088e85ab8cc
[root@localhost ~]# docker container ls -a
CONTAINER ID        IMAGE               COMMAND                  CREATED             STATUS                      PORTS                            NAMES
7a268c7232e6        nginx               "/docker-entrypoint.…"   13 seconds ago      Up 12 seconds               80/tcp, 0.0.0.0:8080->8080/tcp   web2
22c2aa229482        nginx               "/docker-entrypoint.…"   5 minutes ago       Created                                                      web
e3a8709c51b7        hello-world         "/hello"                 11 minutes ago      Exited (0) 11 minutes ago                                    silly_mclaren
```

## 컨테이너 조회

- 컨테이너를 조회하여 실행중인지 종료되었는지 확인가능
- -a 옵션을 사용하지 않을 경우 실행중이 컨테이너만 확인 가능

```bash
[root@localhost ~]# docker container ls -a
CONTAINER ID        IMAGE               COMMAND                  CREATED             STATUS              PORTS                            NAMES
90ee057b8d84        nginx               "/docker-entrypoint.…"   40 seconds ago      Up 39 seconds       80/tcp, 0.0.0.0:8080->8080/tcp   web
```

## 컨테이너 실행/재실행

- 실행 : docker container start [컨테이너명]
- 재실행 : docker container restart [컨테이너명]

```bash
[root@localhost ~]# docker ps
CONTAINER ID        IMAGE               COMMAND             CREATED             STATUS              PORTS               NAMES
[root@localhost ~]# docker container start web3
web3
[root@localhost ~]# docker ps
CONTAINER ID        IMAGE               COMMAND                  CREATED              STATUS              PORTS               NAMES
259065fb5008        nginx               "/docker-entrypoint.…"   About a minute ago   Up 1 second         80/tcp              web3
[root@localhost ~]# docker container restart web3
web3
[root@localhost ~]# docker ps
CONTAINER ID        IMAGE               COMMAND                  CREATED              STATUS              PORTS               NAMES
259065fb5008        nginx               "/docker-entrypoint.…"   About a minute ago   Up 1 second         80/tcp              web3
```

## 컨테이너 종료

- docker container stop [컨테이너명]
- docker container stop $(docker ps -a -q) (모든 컨테이너 종료)

```bash
[root@localhost ~]# docker container stop $(docker ps -a -q)
7a268c7232e6
22c2aa229482
e3a8709c51b7
```

## 컨테이너 일시중지

- 일시중지 : docker container pause [컨테이너명]
- 일시중지 해제 : docker container unpause [컨테이너명]

```bash
[root@localhost ~]# docker container pause web3
web3
[root@localhost ~]# docker ps -a
CONTAINER ID        IMAGE               COMMAND                  CREATED             STATUS                       PORTS               NAMES
259065fb5008        nginx               "/docker-entrypoint.…"   2 minutes ago       Up About a minute (Paused)   80/tcp              web3
7a268c7232e6        nginx               "/docker-entrypoint.…"   21 minutes ago      Exited (0) 12 minutes ago                        web2
22c2aa229482        nginx               "/docker-entrypoint.…"   27 minutes ago      Created                                          web
e3a8709c51b7        hello-world         "/hello"                 32 minutes ago      Exited (0) 17 minutes ago                        silly_mclaren
[root@localhost ~]# docker container unpause web3
web3
[root@localhost ~]# docker ps -a
CONTAINER ID        IMAGE               COMMAND                  CREATED             STATUS                      PORTS               NAMES
259065fb5008        nginx               "/docker-entrypoint.…"   3 minutes ago       Up 2 minutes                80/tcp              web3
7a268c7232e6        nginx               "/docker-entrypoint.…"   22 minutes ago      Exited (0) 13 minutes ago                       web2
22c2aa229482        nginx               "/docker-entrypoint.…"   28 minutes ago      Created                                         web
e3a8709c51b7        hello-world         "/hello"                 33 minutes ago      Exited (0) 18 minutes ago                       silly_mclaren
```

## 컨테이너 삭제

- -v를 통해서 볼륨 삭제도 가능
- docker container rm [컨테이너명]
- docker container rm $(docker ps -a -q) (모든 컨테이너 삭제)

```bash
[root@localhost ~]# docker container ls -a
CONTAINER ID        IMAGE               COMMAND                  CREATED             STATUS                      PORTS               NAMES
259065fb5008        nginx               "/docker-entrypoint.…"   13 minutes ago      Up 11 minutes               80/tcp              web3
7a268c7232e6        nginx               "/docker-entrypoint.…"   32 minutes ago      Exited (0) 23 minutes ago                       web2
22c2aa229482        nginx               "/docker-entrypoint.…"   37 minutes ago      Created                                         web
e3a8709c51b7        hello-world         "/hello"                 43 minutes ago      Exited (0) 27 minutes ago                       silly_mclaren
[root@localhost ~]# docker container rm web3
Error response from daemon: You cannot remove a running container 259065fb50085110cb12bc85d8690e56f2a1cf022e6851772fb06a38f1bcdb12. Stop the container before attempting removal or force remove
[root@localhost ~]# docker container stop $(docker ps -a -q)
259065fb5008
7a268c7232e6
22c2aa229482
e3a8709c51b7
[root@localhost ~]# docker container rm web3
web3
[root@localhost ~]# docker container ls
CONTAINER ID        IMAGE               COMMAND             CREATED             STATUS              PORTS               NAMES
[root@localhost ~]# docker container ls -a
CONTAINER ID        IMAGE               COMMAND                  CREATED             STATUS                      PORTS               NAMES
7a268c7232e6        nginx               "/docker-entrypoint.…"   32 minutes ago      Exited (0) 23 minutes ago                       web2
22c2aa229482        nginx               "/docker-entrypoint.…"   38 minutes ago      Created                                         web
e3a8709c51b7        hello-world         "/hello"                 43 minutes ago      Exited (0) 28 minutes ago                       silly_mclaren
```

## 컨테이너 로그 확인

- 로그 확인 : docker container logs -t [컨테이너명]
- 실시간 로그 확인 : docker container logs -t -f [컨테이너명]

```bash
[root@localhost ~]# docker container logs -t web
2020-09-07T04:18:23.950904474Z /docker-entrypoint.sh: /docker-entrypoint.d/ is not empty, will attempt to perform configuration
2020-09-07T04:18:23.950939574Z /docker-entrypoint.sh: Looking for shell scripts in /docker-entrypoint.d/
2020-09-07T04:18:23.953404956Z /docker-entrypoint.sh: Launching /docker-entrypoint.d/10-listen-on-ipv6-by-default.sh
2020-09-07T04:18:23.962159191Z 10-listen-on-ipv6-by-default.sh: Getting the checksum of /etc/nginx/conf.d/default.conf
2020-09-07T04:18:23.965702364Z 10-listen-on-ipv6-by-default.sh: Enabled listen on IPv6 in /etc/nginx/conf.d/default.conf
2020-09-07T04:18:23.966774156Z /docker-entrypoint.sh: Launching /docker-entrypoint.d/20-envsubst-on-templates.sh
2020-09-07T04:18:23.974240801Z /docker-entrypoint.sh: Configuration complete; ready for start up
[root@localhost ~]# docker container logs -t -f web
2020-09-07T04:18:23.950904474Z /docker-entrypoint.sh: /docker-entrypoint.d/ is not empty, will attempt to perform configuration
2020-09-07T04:18:23.950939574Z /docker-entrypoint.sh: Looking for shell scripts in /docker-entrypoint.d/
2020-09-07T04:18:23.953404956Z /docker-entrypoint.sh: Launching /docker-entrypoint.d/10-listen-on-ipv6-by-default.sh
2020-09-07T04:18:23.962159191Z 10-listen-on-ipv6-by-default.sh: Getting the checksum of /etc/nginx/conf.d/default.conf
2020-09-07T04:18:23.965702364Z 10-listen-on-ipv6-by-default.sh: Enabled listen on IPv6 in /etc/nginx/conf.d/default.conf
2020-09-07T04:18:23.966774156Z /docker-entrypoint.sh: Launching /docker-entrypoint.d/20-envsubst-on-templates.sh
2020-09-07T04:18:23.974240801Z /docker-entrypoint.sh: Configuration complete; ready for start up
```

## 컨테이너 설정 확인

- docker container inspect [컨테이너명]

```bash
[root@localhost ~]# docker container inspect web
[
    {
        "Id": "90ee057b8d8450c5907c416db7a94bc33ad344ba9850a6bc32d29db33b899a2e",
        "Created": "2020-09-07T04:18:23.655492674Z",
        "Path": "/docker-entrypoint.sh",
        "Args": [
            "nginx",
            "-g",
            "daemon off;"
        ],
        "State": {
            "Status": "running",
            "Running": true,
            "Paused": false,
            "Restarting": false,
            "OOMKilled": false,
            "Dead": false,
            "Pid": 15091,
            "ExitCode": 0,
            "Error": "",
            "StartedAt": "2020-09-07T04:18:23.948233194Z",
            "FinishedAt": "0001-01-01T00:00:00Z"
        },
		...
```

## 컨테이너 실행 확인

- docker container stats [컨테이너명]

```bash
CONTAINER ID        NAME                CPU %               MEM USAGE / LIMIT     MEM %               NET I/O             BLOCK I/O           PIDS
90ee057b8d84        web                 0.00%               1.387MiB / 1.732GiB   0.08%               656B / 0B           0B / 0B             2
```

## 리소스 제한 설정 후 컨테이너 생성 및 실행 (쿼터 설정)

- 리소스 불균형이 일어나지 않도록 하기위해 설정
- 생성하면서 만들 때 container run, 기존 컨테이너 리소스 제한을 할 때는 container update
- 메모리를 제한할 때는 b, k, m, g (바이트, 킬로바이트, 메가바이트, 기가바이트)
- docker container run -d —name [컨테이너명] —memory=500m [이미지명]
- 설정 확인 : docker container inspect [컨테이너명] \| grep Memory

```bash
[root@localhost ~]# docker container run -d --name web2 --memory=500m nginx
0c141d6cadea1ac4a79b9f65719a427410ad48ae959e43a45e1c932c2f784111
[root@localhost ~]# docker container inspect web2 | grep Memory
            "Memory": 524288000,
            "KernelMemory": 0,
            "KernelMemoryTCP": 0,
            "MemoryReservation": 0,
            "MemorySwap": 1048576000,
            "MemorySwappiness": null,
```

- cpu의 상대비율 설정 : docker container update —cpu-shares=1024 [컨테이너명]
- 설정 확인 : docker container inspect [컨테이너명] \| grep Cpu

```bash
[root@localhost ~]# docker container update --cpu-shares=1024 web2
web2
[root@localhost ~]# docker container inspect web2 | grep Cpu
            "CpuShares": 1024,
            "NanoCpus": 0,
            "CpuPeriod": 0,
            "CpuQuota": 0,
            "CpuRealtimePeriod": 0,
            "CpuRealtimeRuntime": 0,
            "CpusetCpus": "",
            "CpusetMems": "",
            "CpuCount": 0,
            "CpuPercent": 0,
```

## container run을 사용하여 환경변수 지정

- /test 디렉토리에 vi를 이용하여 file이라는 파일 생성 (내용은 foo=bar)
- docker container run -it —env-file=[호스트OS의 파일경로] [이미지명]:[태그명] /bin/bash
- 확인 방법 : set \| grep foo=bar (컨테이너의 bash 상에서 입력)

```bash
[root@localhost test]# docker container run -it --env-file=/test/file centos:7 /bin/bash Unable to find image 'centos:7' locally
7: Pulling from library/centos
75f829a71a1c: Pull complete
Digest: sha256:19a79828ca2e505eaee0ff38c2f3fd9901f4826737295157cc5212b7a372cd2b
Status: Downloaded newer image for centos:7
[root@ba56f9c7a6a2 /]# set | grep foo=bar
foo=bar
```

## 도커 모든 이미지 삭제
```bash
[root@localhost test]# docker rmi $(docker images -q)
Untagged: nginx:latest
Untagged: nginx@sha256:b0ad43f7ee5edbc0effbc14645ae7055e21bc1973aee5150745632a24a752661
Deleted: sha256:4bb46517cac397bdb0bab6eba09b0e1f8e90ddd17cf99662997c3253531136f8
Deleted: sha256:80b21afd8140706d5fe3b7106ae6147e192e6490b402bf2dd2df5df6dac13db8
Deleted: sha256:0f04ae71e99f5ef9021b92f76bac3979e25c98d73a51d33ce76a78da6afa9f27
Deleted: sha256:9a14852344d88a1fdf8297914729834521ec1c77a27e7e7e394f9c1ef9b87f9d
Deleted: sha256:74299126f8099031c5bbd4774147f4ab6b0d0c3afcec774be65d4d07b956752e
Deleted: sha256:d0f104dc0a1f9c744b65b23b3fd4d4d3236b4656e67f776fe13f8ad8423b955c
Untagged: centos:7
Untagged: centos@sha256:19a79828ca2e505eaee0ff38c2f3fd9901f4826737295157cc5212b7a372cd2b
Deleted: sha256:7e6257c9f8d8d4cdff5e155f196d67150b871bbe8c02761026f803a704acb3e9
Deleted: sha256:613be09ab3c0860a5216936f412f09927947012f86bfa89b263dfa087a725f81
Untagged: hello-world:latest
Untagged: hello-world@sha256:7f0a9f93b4aa3022c3a4c147a449bf11e0941a1fd0bf4a8e6c9408b2600777c5
Deleted: sha256:bf756fb1ae65adf866bd8c456593cd24beb6a0a061dedf42b26a993176745f6b
Deleted: sha256:9c27e219663c25e0f28493790cc0b88bc973ba3b1686355f221c38a36978ac63
```