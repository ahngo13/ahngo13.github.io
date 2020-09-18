---
title: Gitlab CI/CD로 자동 배포 세팅하기
layout: post
date: '2020-09-18 17:58:00 +0300'
description: Gitlab CI/CD로 자동 배포 세팅하기
img: null
fig-caption: null
tags:
- gitlab
- ci/cd
- ci
- cd
- gitlab자동배포
---

# 테스트 환경

- OS : Window 10 Pro
- VM (가상 머신)
    - OS : CentOS 7 minimal
    - RAM : 8G
    - HDD : 20G

# Runner 설치

## Repository 추가

```bash
# For Debian/Ubuntu/Mint
curl -L https://packages.gitlab.com/install/repositories/runner/gitlab-runner/script.deb.sh | sudo bash

# For RHEL/CentOS/Fedora
curl -L https://packages.gitlab.com/install/repositories/runner/gitlab-runner/script.rpm.sh | sudo bash
```

## Github Runner 설치

```bash
## 최신 버전 설치
# For Debian/Ubuntu/Mint
sudo apt-get install gitlab-runner

# For RHEL/CentOS/Fedora
sudo yum install gitlab-runner

## 특정 버전 설치
# for DEB based systems
apt-cache madison gitlab-runner
sudo apt-get install gitlab-runner=10.0.0

# for RPM based systems
yum list gitlab-runner --showduplicates | sort -r
sudo yum install gitlab-runner-10.0.0-1
```

# Runner 등록 및 테스트

## 다른 계정에서 실행할 경우

- 필자의 경우에는 Root 계정에서 진행하였으므로 참고용으로 보기 바란다.

```bash
## 계정 생성
sudo useradd --comment 'GitLab Runner' --create-home gitlab-runner --shell /bin/bash

## 설치 및 실행
sudo gitlab-runner install --user=gitlab-runner --working-directory=/home/gitlab-runner

sudo gitlab-runner start
```

## Root 계정에서 실행

```bash
[root@node1 ~]# gitlab-runner register
Runtime platform                                    arch=amd64 os=linux pid=27454 revision=738bbe5a version=13.3.1
Running in system-mode.

Please enter the gitlab-ci coordinator URL (e.g. https://gitlab.com/):
## Gitlab 서버 주소 입력
http://172.31.116.150:8989
Please enter the gitlab-ci token for this runner:
## Gitlab에서 발급된 토큰 값 입력 (하단 이미지 참조)
5-HxNdB14m4GFq-B-jZb
Please enter the gitlab-ci description for this runner:
## Runner의 설명 추가
[node1]: Deploy Runner
Please enter the gitlab-ci tags for this runner (comma separated):
## Runner의 태그 설정
deploy
Registering runner... succeeded                     runner=5-HxNdB1
Please enter the executor: virtualbox, docker+machine, docker-ssh+machine, custom, docker-ssh, parallels, ssh, docker, shell, kubernetes:
## Runner가 어떤 작업으로 동작할지 결정
shell
Runner registered successfully. Feel free to start it, but if it's running already the config should be automatically reloaded!
```

- `생성한 프로젝트 > Setting > CI/CD > Runners > Expend`에서 토큰 확인이 가능하다.

![/assets/img/2020-09-18_09h36_10.png](/assets/img/2020-09-18_09h36_10.png)

- Runner 생성이 완료되면 하단의 이미지 처럼 Runner 목록을 확인할 수 있다.

![/assets/img/2020-09-18_09h41_57.png](/assets/img/2020-09-18_09h41_57.png)

## .gitlab-ci.yml 파일 작성

```bash
## .gitlab-ci.yml 파일 작성
git vi .gitlab-ci.yml

### .gitlab-ci.yml 파일 내용
## 임의의 Job 이름
deploy-to-server:
  ## 단계 지정 (build, test, deploy)
  stage: deploy
  ## only는 master 브랜치에 이벤트가 발생했을 경우 활성화
  only:
    - master
  ## runner에 의해 수행될 쉘 스크립트 작성
  script:
    - echo 'hello world!'
  ## 특정 태그가 달린 unner에 명령을 낼리 수 있음
  tags:
    - deploy

## Runner 테스트를 위해 java 파일 수정(필자의 경우 springboot)
[root@node1 java]# vi Hamletshu.java
[root@node1 java]# git status
# On branch master
# Changes not staged for commit:
#   (use "git add <file>..." to update what will be committed)
#   (use "git checkout -- <file>..." to discard changes in working directory)
#
#       modified:   Hamletshu.java
#
no changes added to commit (use "git add" and/or "git commit -a")
[root@node1 java]# git add .
[root@node1 java]# git commit -m "runner test"
[master dc51ee5] runner test
 1 file changed, 1 insertion(+), 1 deletion(-)
[root@node1 java]# git push root master
Username for 'http://172.31.116.150:8989': root
Password for 'http://root@172.31.116.150:8989':
Counting objects: 11, done.
Delta compression using up to 4 threads.
Compressing objects: 100% (4/4), done.
Writing objects: 100% (6/6), 477 bytes | 0 bytes/s, done.
Total 6 (delta 2), reused 0 (delta 0)
To http://172.31.116.150:8989/root/testproject.git
   acbb697..dc51ee5  master -> master
```

## 테스트

- `.gitlab-ci` 파일 gitlab에 push 한 이후 `프로젝트 > CD/CI > Jobs` 에서 정상 동작했는지 확인

![/assets/img/2020-09-18_13h51_36.png](/assets/img/2020-09-18_13h51_36.png)
