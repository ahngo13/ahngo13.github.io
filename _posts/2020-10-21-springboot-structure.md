---
title: 스프링부트(Spring boot) 프로젝트 구조, 의존성 관리, MVC 패턴
layout: post
date: '2020-10-21 17:33:00 +0300'
description: 스프링부트(Spring boot) 프로젝트 구조, 의존성 관리, MVC 패턴
img: null
fig-caption: null
tags:
- springboot
- 스프링부트
- 스프링부트프로젝트구조
- springbootprojectstructure
- springbootmvc
---

# 스프링부트 프로젝트 구조

![/assets/img/2020-10-21_14h04_50.png](/assets/img/2020-10-21_14h04_50.png)

- `src/main/java` : Java Class 파일 위치
- `src/main/resources`
    - `static` : 정적 리소스 파일 위치 (html, css, js, fonts, images, plugin 등)
    - `template` : thymeleaf 템플릿 파일 저장 (springboot에서 권장, dependency 추가 필요)
    - `[application.properties](http://application.properties)` : 스프링부트 프로젝트 설정을 저장하는 곳 (java 파일에 설정되어 있어도 이 파일을 최우선으로 바라봄)
- `src/test/java` : Junit 등 테스트 케이스 Java Class 파일 위치
- `pom.xml, build.gradle` : 라이브러리의 의존성 파일 경로 저장 (maven 프로젝트이냐 gradle 프로젝트이냐에 따라 결정됨)

빌드 관리 도구에 따라서 Maven 프로젝트이냐 Gradle 프로젝트이냐로 갈리는데 그래서 그 부분에서도 정리해보았다.

# Springboot 의존성 관리

## 빌드 관리 도구

- 프로젝트 내에 필요한 xml, properties, jar 파일들을 JVM이나 WAS가 인식할 수 있도록 패키징 도구
- 프로젝트 생성, 빌드, 배포를 위한 프로그램
- 라이브러리의 종류와 버전, 종속성 정보를 입력하여 자동으로 다운로드하고 관리해줌

## Maven vs Gradle

[https://start.spring.io/](https://start.spring.io/) 사이트에 들어가서 springboot 프로젝트를 만들려고 하면 Maven Project와 Gradle Project 이렇게 2종류가 있는 것을 확인할 수 있다. 아무 생각없이 다운받아서 프로젝트를 생성하고 진행할 수도 있지만 조금 더 알고 쓰도록 하자.

### Maven

- 2004년 출시
- Ant의 불편함을 해소하고 부가기능 추가
- `pom.xml` 을 통한 정형화된 빌드 시스템

### Gradle

- 2012년 출시
- Ant와 Maven의 장점을 모음
- 원격 저장소, pom.xml, ivy.xml 파일 없이 의존성 관리 지원
- Android의 OS 빌드 도구로 채택
- groovy 문법 사용

### Gradle이 Maven보다 좋은 이유

Gradle이 최근에 나왔기 때문에 당연 Gradle이 Maven에 비해 가진 장점이 많다. 하지만 일반적으로 쓰던 것을 바꾸기에 어려움이 있어서 그런지 구글 트랜드 지수에서도 Gradle이 밀리는 것을 확인할 수 있다.

- Maven은 설정 내용이 길고 가독성이 떨어짐
- Maven은 의존관계가 복잡한 프로젝트 설정하기에 어려움
- Maven보다 빌드속도가 최대 100배 빠름

Gradle이 Maven에 비해 우수하다는 것을 어필하는 공식 문서

[https://gradle.org/gradle-vs-maven-performance/](https://gradle.org/gradle-vs-maven-performance/)

![/assets/img/2020-10-21_13h40_08.png](/assets/img/2020-10-21_13h40_08.png)

`Maven pom.xml`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>2.3.4.RELEASE</version>
        <relativePath/> <!-- lookup parent from repository -->
    </parent>
    <groupId>com.example</groupId>
    <artifactId>demo</artifactId>
    <version>0.0.1-SNAPSHOT</version>
    <name>demo</name>
    <description>Demo project for Spring Boot</description>

    <properties>
        <java.version>11</java.version>
    </properties>

    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>

        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>
            <exclusions>
                <exclusion>
                    <groupId>org.junit.vintage</groupId>
                    <artifactId>junit-vintage-engine</artifactId>
                </exclusion>
            </exclusions>
        </dependency>
    </dependencies>

    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
            </plugin>
        </plugins>
    </build>

</project>
```

- `spring-boot-stater-parent` 라는 부모에 의존성 정보가 등록되어 있고 그래서 dependencys 안에 있는 springboot 관련 버전을 따로 명시하지 않아도 됨 (아래의 이미지를 보면 하위 의존성이 자동으로 추가 되어있음을 확인할 수 있음)

![/assets/img/2020-10-21_14h37_36.png](/assets/img/2020-10-21_14h37_36.png)

- 자동으로 버전 관리 해주지 않는 의존성 추가 방법

[https://mvnrepository.com/](https://mvnrepository.com/) 사이트에서 검색해서 추가할 수 있다. 만약 gson이라는 의존성을 추가하고 싶다면 아래와 같이 gson이라고 검색해서 해당 소스를 복사해서 `pom.xml` 에 붙여넣으면 된다. Maven이 아닌 다른 빌드 관리도구용도 있으므로 참고하기 바란다.

![/assets/img/2020-10-21_14h40_39.png](/assets/img/2020-10-21_14h40_39.png)

`Gradle build.gradle`

```groovy
plugins {
	id 'org.springframework.boot' version '2.3.4.RELEASE'
	id 'io.spring.dependency-management' version '1.0.10.RELEASE'
	id 'java'
}

group = 'com.example'
version = '0.0.1-SNAPSHOT'
sourceCompatibility = '11'

repositories {
	mavenCentral()
}

dependencies {
	implementation 'org.springframework.boot:spring-boot-starter'
	testImplementation('org.springframework.boot:spring-boot-starter-test') {
		exclude group: 'org.junit.vintage', module: 'junit-vintage-engine'
	}
}

test {
	useJUnitPlatform()
}
```

아무튼 마이그레이션하는 것이 어렵다면 그대로 쓸 수도 있겠지만 새로 뭔가를 만들 때는 gradle 프로젝트로 생성하는게 나은 듯 해보인다.

# MVC (Model, View, Controller) 패턴

Springboot도 기본 Spring Legacy와 같이 MVC 패턴으로 개발을 진행하게 된다.

MVC 패턴에 대해서 알아보자.

## Model

- 데이터를 처리하는 영역 (비즈니스 로직)
- 데이터베이스와 통신하고 데이터를 가공하는 역할

## View

- 사용자가 보는 화면
- HTML이나 Thymeleaf를 통해 화면을 처리

## Controller

- Model과 View를 이어주는 중간다리 역할
