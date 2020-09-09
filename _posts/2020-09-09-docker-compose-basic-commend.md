---
title: 도커 컴포즈(Docker Compose) 기본 명령어 정리
layout: post
date: 2020-09-08 17:56:00 +0300
description: 버전 확인, 컨테이너 생성 및 실행, 컨테이너들의 상태 확인
img:  # Add image post (optional)
fig-caption: # Add figcaption (optional)
tags: [도커, dockercompose, 도커컴포즈, docker-compose, 도커컴포즈명령어, docker-compose명령어]
---

# 버전 확인

```bash
[root@localhost dockertest]# docker-compose --version
docker-compose version 1.27.0, build 980ec85b
```

# 컨테이너 생성 및 실행

- `docker-compose up [옵션] [서비스명]`
- `-d` : 백그라운드 실행
- `--no-deps` : 링크 서비스 실행하지 않음
- `--build` : 이미지 빌드
- `-t` : 타임아웃 지정 (default 10초)

```bash
[root@localhost dockertest]# docker-compose up -d
Creating dockertest_db_1     ... done
Creating dockertest_centos_1 ... done
Creating dockertest_web_1    ... done
```

# 컨테이너들의 상태 확인

```bash
[root@localhost dockertest]# docker-compose ps
       Name                      Command                  State                     Ports
-------------------------------------------------------------------------------------------------------
dockertest_centos_1   /bin/bash                        Up
dockertest_db_1       /entrypoint.sh --default-a ...   Up (healthy)   0.0.0.0:3306->3306/tcp, 33060/tcp
dockertest_web_1      /usr/sbin/httpd -D FOREGROUND    Up             0.0.0.0:4000->80/tcp
```

# 생성된 서비스 컨테이너 실행하기

- `docker-compose up` 명령어로 생성 및 실행된 컨테이너에 임의의 명령을 실행하기 위해 사용

```bash
## web이라는 서비스의 /bin/bash 실행
[root@localhost dockertest]# docker-compose run web /bin/bash
Starting dockertest_db_1 ... done
Creating dockertest_web_run ... done
[root@5fe9a5bd7bd2 /]# exit
exit

## db라는 서비스의 /bin/bash 실행
[root@localhost dockertest]# docker-compose run db /bin/bash
Creating dockertest_db_run ... done
[Entrypoint] MySQL Docker Image 8.0.19-1.1.15
bash-4.2#
```

# 서비스 시작/정지/일시정지/일시정지 해제/재시작

- `docker-compose start` : 서비스 시작
- `docker-compose pause` : 서비스 일시정지
- `docker-compose unpause` : 서비스 일시정지 해제
- `docker-compose restart` : 서비스 재시작
- `docker-compose stop` : 서비스 중지

```bash
## 서비스 시작
[root@localhost dockertest]# docker-compose start
Starting db     ... done
Starting web    ... done
Starting centos ... done

## 서비스 일시중지
[root@localhost dockertest]# docker-compose pause
Pausing dockertest_db_1     ... done
Pausing dockertest_centos_1 ... done
Pausing dockertest_web_1    ... done

## 서비스 일시중지 해제
[root@localhost dockertest]# docker-compose unpause
Unpausing dockertest_web_1    ... done
Unpausing dockertest_centos_1 ... done
Unpausing dockertest_db_1     ... done

## 서비스 재시작
[root@localhost dockertest]# docker-compose restart
Restarting dockertest_web_1    ... done
Restarting dockertest_centos_1 ... done
Restarting dockertest_db_1     ... done

## 서비스 중지
[root@localhost dockertest]# docker-compose stop
Stopping dockertest_web_1    ... done
Stopping dockertest_centos_1 ... done
Stopping dockertest_db_1     ... done
```

# 실행중인 컨테이너들 강제정지

- `docker-compose kill`

```bash
## 컨테이너들 강제 정지
[root@localhost dockertest]# docker-compose kill
Killing dockertest_web_1    ... done
Killing dockertest_centos_1 ... done
Killing dockertest_db_1     ... done

## 컨테이너들 상태 확인
[root@localhost dockertest]# docker-compose ps
               Name                             Command                   State               Ports
----------------------------------------------------------------------------------------------------------
dockertest_centos_1                  /bin/bash                        Exit 137
dockertest_centos_run_444b50259d8b   /bin/bash                        Up
dockertest_db_1                      /entrypoint.sh --default-a ...   Exit 137
dockertest_db_run_7be8af87b69d       /entrypoint.sh /bin/bash         Up (unhealthy)   3306/tcp, 33060/tcp
dockertest_db_run_d093e7ed46ea       /entrypoint.sh --default-a ...   Up (healthy)     3306/tcp, 33060/tcp
dockertest_web_1                     /usr/sbin/httpd -D FOREGROUND    Exit 137
dockertest_web_run_cdccf2c10ea2      /bin/bash                        Up               80/tcp
```

# 네트워크 정보, 볼륨, 컨테이너들 일괄정지/삭제

- `docker-compose down`

```bash
[root@localhost dockertest]# docker-compose down
Stopping dockertest_web_run_cdccf2c10ea2    ... done
Stopping dockertest_centos_run_444b50259d8b ... done
Stopping dockertest_db_run_7be8af87b69d     ... done
Stopping dockertest_db_run_d093e7ed46ea     ... done
Removing dockertest_web_1                   ... done
Removing dockertest_centos_1                ... done
Removing dockertest_db_run_9bcc586000a1     ... done
Removing dockertest_web_run_c1a19e5e884c    ... done
Removing dockertest_web_run_cdccf2c10ea2    ... done
Removing dockertest_db_1                    ... done
Removing dockertest_centos_run_444b50259d8b ... done
Removing dockertest_db_run_7be8af87b69d     ... done
Removing dockertest_db_run_e048466d0c45     ... done
Removing dockertest_db_run_d093e7ed46ea     ... done
Network our_net is external, skipping
[root@localhost dockertest]# docker-compose ps
Name   Command   State   Ports
------------------------------
```

# 서비스 private 포트번호 확인

- `docker-compose [서비스명] [프라이빗 포트 번호]`

```bash
[root@localhost dockertest]# docker-compose port web 80
0.0.0.0:4000
```

# docker-compose 구성파일 확인

- `docker-compose config`

```bash
[root@localhost dockertest]# docker-compose config
networks:
  default:
    external: true
    name: our_net
services:
  centos:
    image: centos:7
    stdin_open: true
    tty: true
  db:
    build:
      context: /dockertest/mysql
      dockerfile: Dockerfile
    command: --default-authentication-plugin=mysql_native_password
    environment:
      MYSQL_ROOT_HOST: '%'
      MYSQL_ROOT_PASSWORD: root
    ports:
    - published: 3306
      target: 3306
    volumes:
    - /dockertest/data:/var/lib/mysql:rw
  web:
    build:
      context: /dockertest/apache-php
      dockerfile: Dockerfile
    depends_on:
    - db
    ports:
    - published: 4000
      target: 80
    volumes:
    - /dockertest/www:/var/www:rw
version: '3'
```
