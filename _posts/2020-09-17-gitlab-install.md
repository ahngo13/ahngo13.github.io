---
title: CentOS 7에 Gitlab CE 설치하기
layout: post
date: '2020-09-17 17:58:00 +0300'
description: 깃 저장소와 이슈 추적 기능을 가춘 유일한 단일 어플리케이션의 데브옵스 솔루션
img: null
fig-caption: null
tags:
- gitlab
- 깃랩
- centos
- gitlab설치
- 깃랩설치
---

- 깃 저장소와 이슈 추적 기능을 가춘 유일한 단일 어플리케이션의 데브옵스 솔루션
- 설치 공식문서
    - https://about.gitlab.com/install/#centos-7?version=ce

# 로컬에 설치

## openssh 설치

```bash
sudo yum install -y curl policycoreutils-python openssh-server openssh-clients
```

## 서버 부팅 시 openssh 자동 실행

```bash
## openssh 자동 실행 설정
sudo systemctl enable sshd
## openssh 실행
sudo systemctl start sshd
```

## 방화벽 해제 및 재실행

```bash
## http, https 방화벽 해제
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https

## 방화벽 재시작
sudo systemctl reload firewalld
```

## 메일서버 설치

```bash
sudo yum install postfix
```

## 서버 부팅시 메일서버 실행

```bash
sudo systemctl enable postfix
sudo systemctl start postfix
```

## gitlab 패키지 저장소 등록

```bash
curl -sS https://packages.gitlab.com/install/repositories/gitlab/gitlab-ce/script.rpm.sh| sudo bash
```

## 패키지 설치

- `sudo EXTERNAL_URL="[도메인이나 IP주소]:[포트 번호]" yum install -y gitlab-ce`

```bash
sudo EXTERNAL_URL="172.31.117.24:8989" yum install -y gitlab-ce
```

잘 설치가 되었다면 아래와 화면처럼 접속이 가능해야 한다.

[http://172.31.117.24:8989/users/password/edit?reset_password_token=SgQ9tzdWkrfRsyN7K1pf](http://172.31.117.24:8989/users/password/edit?reset_password_token=SgQ9tzdWkrfRsyN7K1pf)

![/assets/img/2020-09-17_13h22_33.png](/assets/img/2020-09-17_13h22_33.png)

# Docker 설치

```bash
## gitlab에서 제공하는 이미지로 설치
sudo docker run --detach \
  --publish 7979:80 \
  --name gitlab \
  --restart always \
  gitlab/gitlab-ce:latest

## 볼륨을 설정을 해주고 싶을 때는 하단 처럼 추가
sudo docker run --detach \
  --publish 7979:80 \
  --name gitlab \
  --restart always \
  --volume /srv/gitlab/config:/etc/gitlab \
  --volume /srv/gitlab/logs:/var/log/gitlab \
  --volume /srv/gitlab/data:/var/opt/gitlab \
  gitlab/gitlab-ce:latest
```

![/assets/img/fe5c2f7f-e88f-4453-aec3-f00cba1e73fa/2020-09-17_13h41_38.png](/assets/img/2020-09-17_13h41_38.png)

# Gitlab 터미널 명령어

## 설정 변경 후 재시작

```bash
## gitlab 설정 변경
sudo vi /etc/gitlab/gitlab.rb

## 설정 변경 후 반영
sudo gitlab-ctl reconfigure
```

## gitlab 시작

```bash
sudo gitlab-ctl start
```

## gitlab 종료

```bash
sudo gitlab-ctl stop
```

## gitlab 재시작

```bash
sudo gitlab-ctl restart
```

## gitlab 삭제

```bash
## 명령어로 삭제하기
sudo gitlab-ctl uninstall
sudo gitlab-ctl cleanse
sudo gitlab-ctl remove-accounts
sudo dpkg -P gitlab-ce || sudo yum -y remove gitlab-ce

## 수동으로 삭제하기
rm -rf /opt/gitlab
rm -rf /var/opt/gitlab
rm -rf /etc/gitlab
rm -rf /var/log/gitlab
```
