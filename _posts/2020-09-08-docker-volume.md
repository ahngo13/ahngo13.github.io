---
title: 도커 볼륨(Docker Volume)의 종류 및 명령어 정리
layout: post
date: 2020-09-08 17:55:00 +0300
description: 컨테이너의 데이터를 영속적으로 활용할 수 있는 방법
img:  # Add image post (optional)
fig-caption: # Add figcaption (optional)
tags: [도커, dockervolume, 도커볼륨, 도커볼륨명령어]
---

- 도커의 이미지로 컨테이너를 생성했을 경우 이미지는 읽기 전용이라서 쓰기가 불가능 함.
- 컨테이너 삭제시에는 그동안 저장된 운용데이터들도 함께 삭제되어 복구 불가.
- 컨테이너의 데이터를 영속적으로 활용할 수 있는 방법

# 호스트 볼륨 공유

- 호스트와 저장장소를 공유하는 방법
- 저장장소에 파일이 있을 경우 myql 실행이 안됨
- `-v` 옵션으로 `공유할 호스트 디렉토리:공유할 컨테이너 디렉토리` 설정

```bash
//-e MySQL 환경변수 설정
[root@localhost test]# docker run -d --name wordpressdb_hostvolume -e MYSQL_DATABASE=wordpress -e MYSQL_ROOT_PASSWORD=password -v /test:/var/lib/mysql mysql:5.7
284b8dba789a2d640a6fa7fe6847ba0a2dcb6911576c3dd0060b6d10ffd17914

//정상적으로 실행되었는지 확인
[root@localhost test]# docker ps
CONTAINER ID        IMAGE               COMMAND                  CREATED             STATUS              PORTS                 NAMES
284b8dba789a        mysql:5.7           "docker-entrypoint.s…"   2 seconds ago       Up 2 seconds        3306/tcp, 33060/tcp   wordpressdb_hostvolume

[root@localhost test]# docker run -d --name wordpress_hostvolume -e WORDPRESS_DB_PASSWORD=password --link wordpressdb_hostvolume:mysql -p 80 wordpress
b4e100040227bd36a0d0528026002d7d3e3803ac7c868da253daf36d0e7c3aed

//공유한 호스트 디렉토리에 파일이 생성되고 공유됨을 알 수 있다.
[root@localhost test]# ls
auto.cnf         client-key.pem  ibdata1             private_key.pem  sys
ca-key.pem       ib_buffer_pool  ibtmp1              public_key.pem   wordpress
ca.pem           ib_logfile0     mysql               server-cert.pem
client-cert.pem  ib_logfile1     performance_schema  server-key.pem

//호스트 /test 폴더에 test 파일 생성
[root@localhost test]# vi test
[root@localhost test]# ls
auto.cnf         client-key.pem  ibdata1             private_key.pem  sys
ca-key.pem       ib_buffer_pool  ibtmp1              public_key.pem   test
ca.pem           ib_logfile0     mysql               server-cert.pem  wordpress
client-cert.pem  ib_logfile1     performance_schema  server-key.pem

//컨테이너에 접속해서 volume으로 연결된 공유폴더에 test 파일이 있는지 확인
[root@localhost test]# docker exec -it wordpressdb_hostvolume bash
root@284b8dba789a:/# cd /var/lib/mysql
root@284b8dba789a:/var/lib/mysql# ls
auto.cnf         client-key.pem  ibdata1             private_key.pem  sys
ca-key.pem       ib_buffer_pool  ibtmp1              public_key.pem   test
ca.pem           ib_logfile0     mysql               server-cert.pem  wordpress
client-cert.pem  ib_logfile1     performance_schema  server-key.pem
```

- 기존 컨테이너를 멈춘 뒤 지우고 새로운 컨테이너로 볼륨을 생성하면 호스트 공유폴더가 컨테이너 공유폴더를 덮어버림

```bash
//같은 이름의 볼륨으로 새로운 컨테이너 생성
[root@localhost test]# docker run -it -d --name volume_override -e MYSQL_DATABASE=wordpress -e MYSQL_ROOT_PASSWORD=password -v /test:/home/test/sampleimage mysql:5.7
3ffaa29ed04437ae7abfe958b9d0ae3fd72c6e467750393093c6c695a2d2c481

//컨테이너 경로에서 공유폴더 확인
[root@localhost test]# docker exec -it volume_override bash
root@3ffaa29ed044:/# cd home
root@3ffaa29ed044:/home# ls
test
root@3ffaa29ed044:/home# cd test
root@3ffaa29ed044:/home/test# ls
sampleimage
root@3ffaa29ed044:/home/test# cd sampleimage/
//호스트의 공유폴더 내용이 컨테이너의 공유폴더 내용을 덮어버린 것을 알 수 있다.
root@3ffaa29ed044:/home/test/sampleimage# ls
auto.cnf    client-cert.pem  ib_logfile0  mysql               public_key.pem   sys
ca-key.pem  client-key.pem   ib_logfile1  performance_schema  server-cert.pem  test
ca.pem      ib_buffer_pool   ibdata1      private_key.pem     server-key.pem   wordpress
```

# 볼륨 컨테이너

- `-v` 옵션으로 볼륨을 사용하는 컨테이너를 다른 컨테이너와 공유하는 것
- 컨테이너 생성시 `--volumes-from` 옵션을 사용하면 `-v` 옵션이 적용된 컨테이너의 볼륨을 공유할 수 있다.

```bash
--volumes-from 옵션으로 이전에 생성한 volume_override 컨테이너의 볼륨을 공유
[root@localhost test]# docker run -d -it --name volumes_from_container --volumes-from volume_override wordpress
f3ae1266b7e22375d8504ae79dac528bdf2bb55e5b9639f30440036867d141a4

//동일하게 새로 생성한 컨테이너에 접속해서 볼륨의 공유폴더 상태를 확인한다.
[root@localhost test]# docker exec -it volumes_from_container bash
root@f3ae1266b7e2:/# cd home
root@f3ae1266b7e2:/home# cd test
root@f3ae1266b7e2:/home/test# ls
sampleimage
root@f3ae1266b7e2:/home/test# cd sampleimage/

//호스트에 있는 공유폴더 내용들이 덮어써진 것을 확인할 수 있다.
root@f3ae1266b7e2:/home/test/sampleimage# ls
auto.cnf    client-cert.pem  ib_logfile0  mysql               public_key.pem   sys
ca-key.pem  client-key.pem   ib_logfile1  performance_schema  server-cert.pem  test
ca.pem      ib_buffer_pool   ibdata1      private_key.pem     server-key.pem   wordpress
```

# 도커 볼륨

- `docker volume` 명령어 이용 (도커 자체에서 제공하는 볼륨 기능)
- 볼륨 생성시 여러 플러그인 이용 가능

```bash
//myvolume이라는 이름을 가진 도커 볼륨 생성
[root@localhost test]# docker volume create --name myvolume
myvolume

//생성된 볼륨 리스트 확인
[root@localhost test]# docker volume ls
DRIVER              VOLUME NAME
local               00fe3f88c33e40c3956c063cf3f68ebf8ca2dfda0aec81e58bd021602eeb108b
local               1c6eade1fa32e1e1ce86c8a9f53ab5189b293d8d4ee7b278063c3faa6613699c
local               9851e89499f07e08a6d4a190a8ff1780ccc76d4d488abd28056c1b02c44495d9
local               283332cec1448a4c792af63a3cd8be1920bc8150457a7b0118635c384ed72af6
local               4599430ee383b58e53f40b3d48347c45dee9adf58562f6b45713cba5a5fe3aa7
local               64533985eca8f1e734c57c4a4e77e21685c5b778466d4d890f4a09c3525a6c82
local               b651c34e09ae902b3609eb0f849347ed6a0d386363e79548fda0f4bfc260ea83
local               e09d72232f4c6a6e61fa995c6c8d307a09ca4ebad93000a5c511a7f9146817bf
local               myvolume

//생성된 볼륨으로 컨테이너 생성
[root@localhost test]# docker run -it -d --name myvolume -v myvolume:/root/ ubuntu:14.04
b36d00500da92d778f207c01b60320612e89e57ccf3069f931a4f63fb4472881

//생성한 컨테이너 접속
[root@localhost test]# docker exec -it myvolume bash

//root에 파일 생성
root@b36d00500da9:/# echo hello, volume! >> /root/volume

//myvolume을 연결한 또 다른 컨테이너 생성
[root@localhost test]# docker run -it -d --name another_myvolume -v myvolume:/root/ ubuntu:14.04
f24b617440ffbe541a4646d477b0901adcbd2aac6bc9787823398b58fb5501cb

//another_myvolume 컨테이너 접속 후 생성한 volume 파일 확인
[root@localhost test]# docker exec -it another_myvolume bash
root@f24b617440ff:/# cd ~
root@f24b617440ff:~# ls
volume
root@f24b617440ff:~# cat volume
hello, volume!
```
