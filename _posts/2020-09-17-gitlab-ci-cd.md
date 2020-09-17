---
title: GitLab CI/CD 개념 정리
layout: post
date: '2020-09-17 17:59:00 +0300'
description: GitLab에 내장 된 강력한 도구로, 타사 애플리케이션이나 통합이 필요없이 소프트웨어에 모든 지속적인 방법 (지속적 통합, 제공 및 배포)을 적용 가능
img: null
fig-caption: null
tags:
- gitlab
- 깃랩
- ci
- ci/cd
- cd
---

# CI/CD 방법론이란?

- 지속적인 통합 (Continuous Integration) : 푸시 할 때마다 스크립트 세트를 만들어 애플리케이션을 자동으로 빌드하고 테스트하여 앱에 오류가 발생할 가능성을 줄임
- 지속적인 전달 (Continuous Delivery) : 푸시되는 모든 코드 변경 사항에서 빌드 및 테스트 될뿐만 아니라 추가 단계로서 배포가 수동으로 트리거되지만 지속적으로 배포
- 지속적인 배포 (Continuous Deployment) : 애플리케이션을 수동으로 배포하는 대신 자동으로 배포되도록 설정

# GitLab CI / CD

- GitLab에 내장 된 강력한 도구로, 타사 애플리케이션이나 통합이 필요없이 소프트웨어에 모든 지속적인 방법 (지속적 통합, 제공 및 배포)을 적용 가능

# GitLab CI / CD 작동 방식

- Git 저장소에 호스팅 된 애플리케이션 코드베이스와 저장소 `.gitlab-ci.yml`의 루트 경로에있는 라는 파일에 빌드, 테스트 및 배포 스크립트를 지정 하기만하면 됨.
- 스크립트는 작업으로 그룹화되고 함께 파이프라인 을 구성

```bash
## 사전 작업
before_script:
  - apt-get install rubygems ruby-dev -y

## 실행할 작업
run-test:
  script:
    - ruby --version
```

- GitLab CI / CD는 사용자가 설정한 작업을 실행할뿐만 아니라 터미널에서 볼 수 있듯이 실행 중에 발생하는 상황을 보여줌
- 파이프 라인 상태는 GitLab에서도 표시
- 문제가 발생하면 모든 변경 사항을 쉽게 롤백 할 수 있음

# GitLab 기능

- 확인
    - 애플리케이션을 자동으로 빌드하고 테스트
    - 소스 코드 품질을 분석
    - 브라우저 성능에 미치는 영향을 확인
    - 서버 성능에 미치는 영향을 확인
    - 종속성 검색 및 단위 테스트
    - 앱 검토를 사용 하여 변경 사항을 배포
- 패키지
    - Docker 이미지를 저장
    - NPM 패키지를 저장
    - Maven 아티팩트를 저장
    - Conan 패키지를 저장
- 출시
    - 앱을 프로덕션에 자동으로 배포
    - 수동으로 클릭하여 앱을 프로덕션에 배치
    - 정적 웹 사이트를 배포
    - 임시로 배포
    - 기능 플래그 뒤에 기능을 배포
    - Git 태그에 릴리스 노트를 추가
    - Kubernetes에서 실행되는 각 CI 환경의 현재 상태 및 상태를 확인
    - Kubernetes 클러스터의 프로덕션 환경에 애플리케이션을 배포

# GitLab CI / CD 시작하기

- 저장소의 루트 디렉토리에 `.gitlab-ci.yml`파일을 추가
    - 파이프라인에는 build, test, deploy 단계가 있음
    - `.gitlab-ci.yml`파일은 CI가 프로젝트에서 수행하는 작업을 구성하는 곳
    - 리포지토리에 푸시 할 때 GitLab은 해당 커밋에 대해 파일 내용에 따라 `.gitlab-ci.yml` 파일 을 찾고 러너에서 작업을 시작

```bash
default:
  image: ruby:2.5
  ## 모든 작업 전에 before_script가 실행됨
  before_script:
    - apt-get update
    - apt-get install -y sqlite3 libsqlite3-dev nodejs
    - ruby -v
    - which ruby
    - gem install bundler --no-document
    - bundle install --jobs $(nproc) "${FLAGS[@]}"

## 임의의 작업 명령어 정의
rspec:
  script:
    - bundle exec rspec

## 임의의 작업 명령어 정의
rubocop:
  script:
    - bundle exec rubocop
```

- `.gitlab-ci.yml` GitLab에 푸시 (파이프 라인 페이지로 이동하면 파이프 라인이 보류 중임을 확인할 수 있음)

```bash
git add .gitlab-ci.yml
git commit -m "Add .gitlab-ci.yml"
git push origin master
```

- 프로젝트가 runner 를 사용하도록 구성되었는지 확인
    - 러너는 가상 머신, VPS, 베어 메탈 머신, Docker 컨테이너 또는 컨테이너 클러스터 일 수 있음
    - GitLab과 실행기는 API를 통해 통신하므로 실행기의 컴퓨터에 GitLab 서버에 대한 네트워크 액세스 권한이 있어야 함

### 용어 정리

- GitLab Runner : 작업을 실행하고 결과를 GitLab에 다시 보내는데 사용되는 오픈 소스 프로젝트
