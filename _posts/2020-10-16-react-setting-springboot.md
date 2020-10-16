---
title: 리액트(React) 개발환경 구성 및 Springboot와 연동하기
layout: post
date: '2020-10-16 17:31:00 +0300'
description: 리액트(React) 개발환경 구성 및 Springboot와 연동하기
img: null
fig-caption: null
tags:
- react
- 리액트
- react개발환경
- 리액트개발환경
- reactspringboot
---

# 리액트란?

- 자바스크립트 라이브러리의 하나로서 UI 만들기 위해 사용
- 페이스북에서 만듦

# 리액트 개발환경 세팅

## Node.js 설치

- 외부 패키지를 쉽게 설치하기 위해 NPM이 필요(Node.js 모듈을 패키지화 시켜놓은 것)
- 안정적인 LTS 버전으로 설치하도록 한다.

[https://nodejs.org/ko/](https://nodejs.org/ko/)

![/assets/img/2020-10-16_14h48_18.png](/assets/img/2020-10-16_14h48_18.png)

## Visual Studio Code 설치

[https://code.visualstudio.com/](https://code.visualstudio.com/)

![/assets/img/2020-10-16_15h01_23.png](/assets/img/2020-10-16_15h01_23.png)

## Project 생성 및 시작

- Visual Studio Code를 실행하고 프로젝트를 생성할 폴더를 열어준다. (필자의 경우에는 C 드라이브에 ReactStudy라는 폴더를 생성해주었다)
- `Ctrl+`` 를 눌러 터미널을 열어주고 아래와 같이 명령어를 입력해준다.
- 아래의 명령어 중에 `create-react-app` 이라는 명령어로 프로젝트를 생성해주는데 CDN을 통해서 생성해서 프로젝트를 직접 구축할 수도 있다. (CDN의 경우 연습용 정도로 활용한다고 볼 수 있을 것 같다)

```bash
## node 버전 확인
node -v
v12.18.3

## npm 버전 확인
npm -v
6.14.6

## my-app이라는 리액트 프로젝트 생성
create-react-app my-app

## my-app이라는 리액트 프로젝트 경로로 이동
cd my-app

## my-app 프로젝트 시작
npm start
```

아래와 같은 화면이 나온다면 성공적으로 세팅한 것이다.

![/assets/img/2020-10-16_15h06_26.png](/assets/img/2020-10-16_15h06_26.png)

# React 프로젝트를 Springboot와 연동하기

## Springboot 프로젝트 생성

[https://start.spring.io/](https://start.spring.io/)

아래와 같이 Dependencies를 추가하고 프로젝트를 생성한다.

![/assets/img/2020-10-16_15h40_09.png](/assets/img/2020-10-16_15h40_09.png)

## React 프로젝트를 build

- Visual Studio Code 터미널에서 해당 명령어를 입력하여 리액트 프로젝트를 빌드한다.

```bash
npm run build
```

- 빌드가 완료되면 build 폴더가 생성된다. 이 안에 있는 파일들을 모두 복사한다.

![/assets/img/2020-10-16_15h44_07.png](/assets/img/2020-10-16_15h44_07.png)

## Springboot demo 프로젝트에 넣는다.

- `src/main/resources/static` 폴더 안에 build 폴더안에 있는 파일들을 모두 넣으면 된다.

![/assets/img/2020-10-16_15h42_52.png](/assets/img/2020-10-16_15h42_52.png)

## [DemoApplication.java](http://demoapplication.java) 수정

- [localhost:8080](http://localhost:8080) 을 호출했을 때 `index.html`으로 페이지 이동처리 하는 로직 추가

```java
package com.example.demo;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.ModelAndView;

@SpringBootApplication
@Controller
public class DemoApplication {

	public static void main(String[] args) {
		SpringApplication.run(DemoApplication.class, args);
	}

	@GetMapping("/")
	public String index() {
		return "index.html";
	}
}
```

## SpringBoot 서버 실행

- 정상적으로 React 프로젝트를 실행했을 때와 같은 페이지가 나오는지 확인한다.
- React 프로젝트는 기본 포트번호가 3000번이었고 Spring 프로젝트는 기본 포트번호가 8080임

![/assets/img/2020-10-16_15h47_34.png](/assets/img/2020-10-16_15h47_34.png)
