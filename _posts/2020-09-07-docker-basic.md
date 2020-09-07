---
title: 도커 기본 개념 및 용어 정리
layout: post
date: 2020-09-07 17:50:00 +0300
description: You’ll find this post in your `_posts` directory. Go ahead and edit it and re-build the site to see your changes. # Add post description (optional)
img:  # Add image post (optional)
fig-caption: # Add figcaption (optional)
tags: [도커, docker, container, dockercompose, dockerfile, dockerhub]
---

- 컨테이너 기반의 오픈소스 가상화 플랫폼
- 경량 컨테이너
- 개발환경 구축 뿐만 아니라 개발 후 운영 환경에 대한 배포나 애플리케이션 플랫폼으로 사용가능
- 다양한 프로그램, 실행환경을 컨테이너로 추상화하고 동일한 인터페이스를 제공하여 프로그램의 배포 및 관리를 단순하게 해줌
- 조립PC, AWS, Azure, Google cloud등 어디에서든 실행가능

## 의의

- 변화하지 않는 실행 환경으로 멱등성 확보
- 코드를 통한 실행 환경 구축 및 애플리케이션 구성
- 실행 환경과 애플리케이션의 일체화로 이식성 향상
- 시스템을 구성하는 애플리케이션 및 미들웨어의 관리 용이성

### ※ 도커가 적합하지 않은 경우

도커 컨테이너는 운영체제의 동작을 완벽히 재현하지는 못하기 때문에 엄밀한 리눅스 계열 운영체제의 동작이 요구되는 가상 환경을 구축해야 한다면 가상화 소프트웨어(Vmware, VisualBox)를 사용하는 것이 낫다.

## 도커 컴포즈(Docker Compose)

```yaml
version : "3"
services:
	web:
		image: gihyodocker 
		posts:
			- "3000:3000"
		environment:
			REDIS_TARGET: redis
			depends_on:
				- redis
		redis:
			images: "redis:alpine
```

- yaml 포맷으로 작성된 설정 파일로 컨테이너를 정의하거나 컨테이너 간의 의존 관계를 정의해 시작 순서를 제어할 수 있다.
- 여러 애플리케이션과 미들웨어의 의존관계를 간결한 코드로 관리할 수 있다.

### 도커와 관련된 오픈 소스 제품 (container orchestration)

- 도커 스웜 (DockerSwarm) : 여러 컨테이너를 클러스터로 만들어 관리해줌
- 쿠버네티스 (Kubernetes) : 컨테이너를 쉽고 빠르게 배포, 확장하고 관리를 자동화해주는 오픈소스 플랫폼
- 아파치 메소스 (Apache Mesos) : 분산된 시스템 커널, 프레임워크에 컴퓨터 자원을 공급하는 클러스터 플랫폼

## 컨테이너 (Container)

- 격리된 공간에서 프로세스가 동작하는 기술
- 기존의 가상화 방식은 OS를 가상화 하였음 (VMware, VisualBox 등)

## 이미지 (Image)

- 컨테이너 실행에 필요한 파일과 설정값 등을 포함하고 있는 것
- 의존성 파일을 컴파일하고 이것저것 설치할 필요가 없음
- 미리 만들어 놓은 이미지를 다운받고 컨테이너만 생성하면 됨 (Docker hub에 등록, Docker Registry)

## Dockerfile

```docker
FROM ubuntu:16.04 # 도커 이미지 운영체제

COPY helloworld /usr/local/bin # 작성한 셸 파일을 /usr/local/bin 경로로 복사
RUN chmod +x /usr/local/bin/helloworld # 작성한 셸 스크립트 파일에 권한 부여

CMD ["helloworld"] # 도커 컨테이너로 실행하기 전에 먼터 실행할 명령어
```

- DSL(Domain-specific language) 언어를 이용하여 이미지 생성 과정을 기술 (서버 구성을 코드로 관리할 수 있다)
- 서버에 어떤 프로그램을 설치하고 이것저것 의존성 패키지를 설치하고 설정파일을 만드는 것이 가능
- 소스와 함께 버전 관리되고 누구나 수정 가능

## Docker Hub

- 공개 이미지를 무료로 관리
