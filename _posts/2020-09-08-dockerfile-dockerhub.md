---
title: 도커파일(Dockerfile) 생성부터 도커 허브(Docker Hub)에 푸시까지
layout: post
date: 2020-09-08 17:55:00 +0300
description: 일반적으로 도커는 컨테이너 상태를 그대로 이미지로 저장하는 방법을 사용함.
img:  # Add image post (optional)
fig-caption: # Add figcaption (optional)
tags: [도커, dockerhub, dockerfile, 도커파일, 도커허브]
---

# 도커 이미지 생성

- 일반적으로 도커는 컨테이너 상태를 그대로 이미지로 저장하는 방법을 사용함.

# Gemfile로 Sinatra 웹 애플리케이션 샘플 만들기

- test 폴더 생성 및 Gamfile 생성

```bash
//test 폴더 생성
[root@localhost /]# mkdir test
[root@localhost /]# ls
bin   dev  home  lib64  mnt  proc  run   srv  test  usr
boot  etc  lib   media  opt  root  sbin  sys  tmp   var
[root@localhost /]# cd test

//Gemfile 만들기
[root@localhost test]# vi Gemfile

//Gemfile 내용
source 'https://rubygems.org'
gem 'sinatra'
```

- app.rb 파일 생성

```bash
//app.rb 파일 생성
[root@localhost test]# vi app.rb

//app.rb 파일 내용
require 'sinatra'
require 'socket'

get '/' do
    Socket.gethostname
end
```

- Gemfile : 패키지 관리
- app.rb : 호스트명을 출력하는 웹서버

```bash
//rvm, ruby, gem 설치가 필요하다면 아래의 명령어 실행 (centos 7 minimal 버전으로 진행 기준)
yum install libyaml-devel glibc-headers autoconf gcc-c++ glibc-devel patch readline-devel zlib-devel libffi-devel openssl-devel automake libtool bison sqlite-devel
gpg --keyserver hkp://keys.gnupg.net --recv-keys 409B6B1796C275462A1703113804BB82D39DC0E3 7D2BAF1CF37B13E2069D6956105BD0E739499BDB
curl -sSL https://get.rvm.io | bash -s stable --ruby
curl -sSL https://rvm.io/mpapis.asc | gpg --import -
curl -sSL https://get.rvm.io | bash -s stable --ruby
source /usr/local/rvm/scripts/rvm
[root@localhost test]# rvm version
rvm 1.29.10 (latest) by Michal Papis, Piotr Kuczynski, Wayne E. Seguin [https://rvm.io]

//패키지 설치 후 웹서버 실행
[root@localhost test]# bundle install
[root@localhost test]# bundle exec ruby app.rb
```

- 도커에서 컨테이너로 실행

```bash
//컨테이너 생성 및 실행
[root@localhost test]# docker run -it -d -p 4567:4567 -v $PWD:/usr/src/app -w /usr/src/app ruby bash -c "bundle install && bundle exec ruby app.rb -o 0.0.0.0"
9a2cf3c3383f6fcdc49352076ca9b6bc189f6b6462ce47ce7419f659014e6264

//컨테이너 접속해서 볼륨 공유파일들 확인
[root@localhost test]# docker ps
CONTAINER ID        IMAGE               COMMAND                  CREATED             STATUS              PORTS                    NAMES
9a2cf3c3383f        ruby                "bash -c 'bundle ins…"   34 seconds ago      Up 33 seconds       0.0.0.0:4567->4567/tcp   vibrant_bardeen
f24b617440ff        ubuntu:14.04        "/bin/bash"              2 hours ago         Up 2 hours                                   another_myvolume
b36d00500da9        ubuntu:14.04        "/bin/bash"              2 hours ago         Up 2 hours                                   myvolume
f3ae1266b7e2        wordpress           "docker-entrypoint.s…"   2 hours ago         Up 2 hours          80/tcp                   volumes_from_container
3ffaa29ed044        mysql:5.7           "docker-entrypoint.s…"   3 hours ago         Up 3 hours          3306/tcp, 33060/tcp      volume_override
b4e100040227        wordpress           "docker-entrypoint.s…"   3 hours ago         Up 3 hours          0.0.0.0:32769->80/tcp    wordpress_hostvolume
[root@localhost test]# docker exec -it 9a2cf3c3383f bash
root@9a2cf3c3383f:/usr/src/app# ls
Gemfile  Gemfile.lock  app.rb
```

- 브라우저에서 해당 서버 `IP주소:포트번호` 로 서버가 잘 실행되어 있는지 확인

![/assets/img/dockerhub1.png](/assets/img/dockerhub1.png)

# Dockerfile로 Ruby 애플리케이션 이미지 만들기

## 작업 순서

1. ubuntu 설치
2. ruby 설치
3. 소스 복사
4. Gem 패키지 설치
5. Sinatra 서버 실행

- 필자의 가상머신 환경은 CentOS 7 minimal 버전이지만 docker에서 만들 환경은 ubuntu이므로 ubuntu 기준 셸 스크립트로 옮겨보자.

```bash
# 1. ubuntu 설치 (패키지 업데이트)
apt-get update

# 2. ruby 설치
apt-get install ruby
gem install bundler

# 3. 소스 복사
mkdir -p /usr/src/app
scp Gemfile app.rb root@ubuntu:/usr/src/app  # From host

# 4. Gem 패키지 설치
bundle install

# 5. Sinatra 서버 실행
bundle exec ruby app.rb
```

## Dockerfile 기본 명령어

### FROM

- 베이스 이미지 지정 (필수)
- tag는 되도록이면 구체적인 버전을 지정하는 것이 좋음

```bash
FROM <image>:<tag>
FROM ubuntu:16.04
```

### MAINTAINER

- Dockerfile을 관리하는 사람 이름이나 이메일 정보 입력
- 빌드에 영향 없음

```bash
MAINTAINER SiU Ahn
MAINTAINER ahngo13@naver.com
```

### COPY

- 파일이나 디렉토리를 이미지로 복사 (일반적으로 소스 복사용)
- 디렉토리가 없을 경우 자동 생성

```bash
COPY <src>... <dest>

//예제
COPY ./usr/src/app
```

### ADD

- COPY와 비슷하지만 url 입력 가능하고 압축 파일을 입력할 경우 자동으로 압축 해제하며 복사됨.

```bash
ADD <src>... <dest>

//예제
ADD ./usr/src/app
```

### RUN

- 명령어를 그대로 실행 (`/bin/sh -c` 뒤에 명령어를 실행하는 방식)

```bash
RUN <command>

//예제
RUN bundle install
```

### CMD

- 도커 컨테이너가 실행 되었을 때 실행될 명령어 설정
- 빌드할 때는 실행되지 않음
- 마지막 CMD만 실행되므로 `[run.sh](http://run.sh)` 파일을 작성하여 데몬으로 실행하거나 `supervisord`나 `forego` 와 같은 여러 개의 프로그램을 실행하는 프로그램을 사용

```bash
CMD command param1 param2

//예제
CMD bundle exec ruby app.rb
```

### WORKDIR

- RUN/CMD/ADD/COPY 등의 기본 디렉토리를 지정
- 각 명령어의 현재 디렉토리는 명령어 한줄마다 초기화 됨 (따라서 같은 디렉토리에서 작업하기 위해서는 `WORKDIR` 사용)

```bash
WORKDIR /path/to/workdir
```

### EXPOSE

- 컨테이너가 실행되었을 때의 포트 지정 (여러 개 포트 가능)

```bash
EXPOSE <port> [<port>...]

//예시
EXPOSE 4567
```

### VOLUME

- 컨테이너 외부에 파일시스템을 마운트 할 때 사용 (지정하는 것을 권장)

```bash
VOLUME ["/data"]
```

### ENV

- 컨테이너에서 사용할 환경변수 지정
- `-e` 옵션을 사용하면 기존 값 오버라이딩 가능

```bash
ENV <key> <value>
ENV <key>=<value> ...

//예시
ENV DB_URL mysql
```

## Dockerfile 명령어를 토대로 Dockerfile 작성

```bash
[root@localhost test]# vi Dockerfile

// Dockerfile 내용
# 1. 우분투 설치
FROM ubuntu:16.04
MAINTAINER ahngo13@naver.com #도커파일 관리자 정보
RUN apt-get -y update # 명령어 그대로 실행 (패키지 업데이트)

# 2. 루비 설치
RUN apt-get -y install ruby # 명령어 그대로 실행 (ruby 설치)
RUN gem install bundler # 명령어 그대로 실행 (bundler 설치)

# 3. 소스 복사
COPY . /usr/src/app

# 4. Gem 패키지 설치
WORKDIR /usr/src/app # 실행 디렉토리 지정
RUN bundle install # 명령어 그대로 실행 (bundler 설치)

# 5. Sinatra 서버 실행
EXPOSE 4567 # 포트 설정
CMD bundle exec ruby app.rb -o 0.0.0.0 # 도커가 실행되었을 때 실행할 명령어
```

## Docker build

- 이미지를 빌드하는 명령어
- `docker build [OPTION] PATH | URL | -`
- `-t` : 생성할 이미지 이름 지정

```bash
docker build -t app .
```

## Docker Images

- 생성된 이미지 확인

```bash
[root@localhost test]# docker images
REPOSITORY                                      TAG                 IMAGE ID            CREATED              SIZE
app                                             latest              d6401465165f        About a minute ago   209MB
```

## 생성된 이미지 파일로 여러 컨테이너 실행 테스트

```bash
[root@localhost test]# docker run -d -p 8080:4567 app
2c5de08267ae1b9070b4090aa62061df839b8e056400642a5161e4b0dcb98fe5
[root@localhost test]# docker run -d -p 8081:4567 app
76bf3923e409ac03c274e6990cbe9435caef4a79199b4d3a1ade5ecb101a83cd
[root@localhost test]# docker run -d -p 8082:4567 app
de52d3ca3437f5b64313e18eabde98099190926ec572e528dd6e356c3b5601d0
```

- 8080, 8081, 8082 3개의 포트에서 모두 아래과 비슷한 페이지가 잘 나온다면 성공

![/assets/img/dockerhub2.png](/assets/img/dockerhub2.png)

## 이미지 최적화 하기

- Base Image 변경 : `ubuntu` 보다 가벼운 `ruby`로 이미지 변경 (python, java, go, nodejs 등)
- Build Cache : 도커는 빌드할 때 Dockerfile의 명령어가 수정되었거나 추가하는 파일이 변경 되었을 때 캐시가 깨지고 그 이후 작업은 새로 이미지를 만들게 되므로 Gemfile을 먼저 복사
- 명령어 최적화 : `RUN apt-get -y -qq update` : -qq를 통해 불필요한 로그 줄임
- 적용 후 Dockerfile

```bash
//Dockerfile 내용
FROM ruby:2.3
MAINTAINER ahngo13@naver.com
COPY Gemfile* /usr/src/app/
WORKDIR /usr/src/app
RUN bundle install --no-rdoc --no-ri
COPY . /usr/src/app
EXPOSE 4567
CMD bundle exec ruby app.rb -o 0.0.0.0
```

# Docker Hub

- 도커에서 제공하는 이미지 저장소
- 무료로 저장할 수 있고 다운로드 트래픽 무료 (비공개로 사용하려면 유료 서비스 이용필요)

## 로그인

```bash
docker login

Login with your Docker ID to push and pull images from Docker Hub. If you don't have a Docker ID, head over to https://hub.docker.com to create one.
Username: ahngo13
Password:
Login Succeeded
```

## 이미지 태그

`[Registry URL]/[사용자 ID]/[이미지명]:[tag]`

## 이미지에 계정정보와 버전 정보 추가

```bash
docker tag app ahngo13/sinatra-app:1

[root@localhost test]# docker tag app ahngo13/sinatra-app:1
[root@localhost test]# docker images
REPOSITORY                                      TAG                 IMAGE ID            CREATED             SIZE
<none>                                          <none>              7416ee6746c6        33 minutes ago      946MB
<none>                                          <none>              c2ef72273bdc        41 minutes ago      946MB
app                                             latest              d6401465165f        56 minutes ago      209MB
ahngo13/sinatra-app                             1                   d6401465165f        56 minutes ago      209MB
```

## 도커 허브(Docker Hub)에 푸시하기

```bash
[root@localhost test]# docker push ahngo13/sinatra-app:1
The push refers to repository [docker.io/ahngo13/sinatra-app]
f99db444f8e6: Pushed
a7921e78dec1: Pushed
3ab843bf79ed: Pushed
c931372ad2a2: Pushed
44ac61e5bdb9: Pushed
dcc0cc99372e: Mounted from library/ubuntu
87c128261339: Mounted from library/ubuntu
41a253a417e6: Mounted from library/ubuntu
e06660e80cf4: Mounted from library/ubuntu
1: digest: sha256:89475983142340762be762d4efa3af6d34c4d40e3750ed797b95a07615f64e56 size: 2203
```
