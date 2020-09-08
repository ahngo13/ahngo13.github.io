---
title: 도커 컴포즈(Docker Compose)의 정의 및 설치 방법
layout: post
date: 2020-09-08 17:56:00 +0300
description: 다중 컨테이너 Docker 애플리케이션을 정의하고 실행하기 위한 도구
img:  # Add image post (optional)
fig-caption: # Add figcaption (optional)
tags: [도커, docker-compose, 도커컴포즈, dockercompose]
---

# Docker Compose란?

- 다중 컨테이너 Docker 애플리케이션을 정의하고 실행하기 위한 도구
- YAML 파일을 사용하여 애플리케이션의 서비스를 구성
- 단일 명령으로 구성에서 모든 서비스를 만들고 시작

# Docker Compose의 3단계 프로세스

1. `Dockerfile` 정의
2. `docker-compose.yml` 로 격리된 환경에서 함께 실행할 수 있도록 정의
3. `docker-compose up` 로 전체 앱을 시작하고 실행

# Docker Compose의 기능

- 단일 호스트의 여러 격리된 환경
- 컨테이너가 생성될 때 볼륨 데이터 보존
- 변경된 컨테이너만 재생성
- 변수 및 환경 간 컴포지션 이동

# Docker Compose 설치 및 간단한 예제 실행

## Docker Compose 설치 (CentOS 7 minimal 버전 기준)

```bash
curl -L "https://github.com/docker/compose/releases/download/1.25.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose

# 바이너리 실행 권한 부여
chmod +x /usr/local/bin/docker-compose

# docker-compose 설치되었는지 확인
docker-compose --version
```

## 파이썬 개발환경 세팅 (requirements.txt 생성)

```bash
//파이썬 3 버전대가 설치되지 않을 때 강제로 다운받아서 압축풀고 설치
wget https://www.python.org/ftp/python/3.7.1/Python-3.7.1.tgz
tar xzf Python-3.7.1.tgz
cd Python-3.7.1 
./configure --enable-optimizations
make altinstall
python3.7 -V
vi /root/.bashrc
//.bashrc 파일에 내용 추가
alias python="/usr/local/bin/python3.7"
source /root/.bashrc
python -V

yum install epel-release
yum -y update
yum -y install python-pip
pip install --upgrade pip
pip freeze > requirements.txt
```

## Dockerfile 생성 (django build용)

```bash
FROM python:3

RUN apt-get update && apt-get -y install \
    libpq-dev

WORKDIR /app
ADD    ./requirements.txt   /app/
RUN    pip install -r requirements.txt
```

## docker-compose.yml 파일 정의

```bash
## 파일의 규격 버전 (3이라고 적으면 3으로 시작하는 최신버전 사용)
version: '3'

## 실행할 서비스들 정의
services:
  ## 서비스의 이름을 db라고 정의 (별명일뿐)
  db:
    ## DB 서비스에서 사용할 도커 이미지 정의
    image: postgres
    ## [호스트 공유폴더 경로]:[컨테이너 공유폴더 경로](상대경로 입력가능)
    volumes:
      - ./data:/var/lib/postgresql/data
    ## 환경변수 설정 (docker run 명령어의 -e에 있던 내용들)
    environment:
      - POSTGRES_DB=sampledb
      - POSTGRES_USER=sampleuser
      - POSTGRES_PASSWORD=samplesecret
      - POSTGRES_INITDB_ARGS=--encoding=UTF-8
  ## 앱의 서비스 이름(별명)을 django로 정함
  django:
    ## db서비스와 다르게 특정 이미지 대신 build 옵션을 추가
    build:
      context: .
      ## docker build 명령을 실행할 디렉터리 경로
      dockerfile: ./Dockerfile-dev
    ## 환경변수 설정 (docker run 명령어의 -e에 있던 내용들)
    environment:
      - DJANGO_DEBUG=True
      - DJANGO_DB_HOST=db
      - DJANGO_DB_PORT=5432
      - DJANGO_DB_NAME=sampledb
      - DJANGO_DB_USERNAME=sampleuser
      - DJANGO_DB_PASSWORD=samplesecret
      - DJANGO_SECRET_KEY=dev_secret_key
    ## 포트 지정(docker run -p 옵션과 같음)
    ports:
      - "8000:8000"
    ## (docker run 마지막 명령어 부분과 같음)
    command: 
      - python manage.py runserver 0:8000
    ## 프로젝트 루트 디렉토리와 컨테이너 안의 /app 디렉토리 연결
    volumes:
      - ./:/app/
```

## docker-compose 실행

```bash
docker-compose up -d

//다른 부분은 문제가 없었는데 장고를 실행하는데 있어서 오류가 발생했다.
ERROR: Service 'django' failed to build: The command '/bin/sh -c pip install -r requirements.txt' returned a non-zero code: 1
```
