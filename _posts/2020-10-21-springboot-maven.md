---
title: 스프링부트(SpringBoot) Maven 사용법 정리
layout: post
date: '2020-10-21 17:35:00 +0300'
description: 스프링부트(SpringBoot) Maven 사용법 정리
img: null
fig-caption: null
tags:
- springboot
- 스프링부트
- springbootmaven
- maven
- 스프링부트maven
---

필자는 intelliJ 기반으로 Springboot Maven 사용법을 정리해보고자 한다. 다른 IDE의 경우에도 비슷한 방법으로 할 수 있을 것이라고 생각하고 학습하도록 하겠다. 개념적인 부분과 실제로 실습을 해보면서 어떨 때 쓰는지 의문점을 해결하는데 중점을 두고 흐름을 잡을 예정이다.

# Maven이란?

- Java 프로젝트의 빌드를 자동화 해주는 빌드 관리 도구 (springboot 프로젝트에서는 gradle라는 빌드 관리도구도 있음)

# Maven 실습용 프로젝트 생성 및 구동

Maven을 테스트함에 앞서서 간단한 SpringBoot 프로젝트를 생성하였다. 

[https://start.spring.io/](https://start.spring.io/) 사이트에서 아래와 같은 Dependency들을 추가하여서 만들었다. (처음에 Dependency 추가를 안해서 Hello world를 찍는데 몇시간을 소모했던 기억이 나므로 그냥 바로 생성하지 말고 꼭 추가해서 생성하기 바란다)

![/assets/img/2020-10-21_16h08_23.png](/assets/img/2020-10-21_16h08_23.png)

IntelliJ를 실행시켜 `File>Open` 을 통해 프로젝트를 열어준다. 이것저것 설치가 되어야하므로 약간의 시간을 기다려야 프로젝트가 온전히(?) 보일 것이다. 아래와 같은 화면이 나오면 `src/main/java/com.example.demo/DemoApplication.java` 파일에 들어가 아래와 같이 소스를 수정해준다.  RestController 어노테이션과 helloWorld 함수만 만들어주면 된다.

- `@RestController` : 전통전인 Controller에 `@ResponseBody`가 추가된 것이라고 한다. JSON 객체 형태로 데이터를 반환할 때 사용한다고 한다.
- `@Controller` : 전통적인 Controller로 View를 반환하기 위해 사용한다고 한다.

```java
package com.example.demo;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

//RestController 어노테이션 추가
@RestController
@SpringBootApplication
public class DemoApplication {

	public static void main(String[] args) {
		SpringApplication.run(DemoApplication.class, args);
	}

	//localhost:8080를 호출하면 helloWorld를 찍어주기 위한 함수
	@RequestMapping("/")
	public String helloWorld(){
		return "helloWorld";
	}

}
```

![/assets/img/2020-10-21_16h12_19.png](/assets/img/2020-10-21_16h12_19.png)

`Run>Edit Configuration` 에 들어가서 `+` 를 누른 뒤 아래와 같이 설정하고 실행을 해보자. 실행은 단축키 `shift + F10` 을 눌러도 된다.

![/assets/img/2020-10-21_16h18_43.png](/assets/img/2020-10-21_16h18_43.png)

브라우저를 하나 켜서 `[localhost:8080](http://localhost:8080)` 에 접속해보자. helloWorld가 나왔다면 정상적으로 동작한 것이다.

![/assets/img/2020-10-21_16h20_44.png](/assets/img/2020-10-21_16h20_44.png)

# Maven 명령어 정리

인텔리제이에서 Maven의 명령어를 직접 입력할 필요는 없다. 하지만 알아둔다면 다른 IDE나 개발 환경에서 도움이 될 수 있으니 참고하기 바란다. 아래의 화면과 같이 인텔리제이에서는 우측 상단에 maven이라는 탭이 있어서 누르면 메이븐 명령어들이 주르륵 나온다. 뭔지 알아야 실행을 시킬 수 있을 것이니 명령어를 정리하면서 어떨 때 써야될지 확인하자.

![/assets/img/2020-10-21_16h27_35.png](/assets/img/2020-10-21_16h27_35.png)

- `mvn package` : 컴파일 된 결과물을 패키지 파일로 생성 (war, jar), 기본 jar파일로 되어있고 변경을 희망할 경우 아래와 같이 `pom.xml`에서 `packageing` 태그를 사용하여 패키징 유형을 변경할 수 있다. `version`과 `artifactId` 를 변경하여서 산출물 이름을 변경할 수도 있다.

    ```xml
    <groupId>com.example</groupId>
    <artifactId>demomo</artifactId><!--demo -> demomo로 변경 -->
    <version>0.0.1-SNAPSHOTSHOT</version> <!-- SNAPSHOT -> SNAPSHOTSHOT으로 변경 -->
    <name>demo</name> 
    <packaging>war</packaging> <!-- packaging 유형을 war로 변경 (기본 jar) -->
    <description>Demo project for Spring Boot</description>
    ```

    우측의 maven 탭에서 package를 마우스 오른쪽 눌러서 실행시키고 왼쪽에 target 폴더를 확인해보자. 필자의 경우 war로 packaging 유형만 변경하고 한번 패키징하고 이름과 버전을 변경하고 또 한번 실행시켰다. 각각의 파일들이 생성됨을 확인할 수 있다.

    ![/assets/img/2020-10-21_16h39_18.png](/assets/img/2020-10-21_16h39_18.png)

    패키징을 했다면 콘솔창에서 한번 구동시켜보자. 이러려고 패키징 하는 것이다. 명령 프롬프트 창을 실행해서 JVM으로 war 파일을 실행시키자. 아래와 같은 화면이 나왔다면 잘 따라온 것이다. (혹시 인텔리제이에 서버를 켜놨다면 끄고 진행하도록 한다. 포트가 겹쳐서 에러가 뜰 수도 있다)

    ```bash
    ## war 혹은 jar 파일이 생성된 경로로 이동
    C:\Users\admin>cd c:\demo\target

    ## JVM으로 war 혹은 jar파일 실행 (war파일도 -jar를 붙여야 한다)
    c:\demo\target>java -jar demomo-0.0.1-SNAPSHOTSHOT.war
    ```

    ![/assets/img/2020-10-21_16h46_58.png](/assets/img/2020-10-21_16h46_58.png)

- `mvn clean` : maven build를 통해여 생성된 모든 파일을 삭제함.

    실습을 하다보니 jar나 war파일이 많이 생겼을 것이다. 중요한 파일들이라면 따로 보관을 하거나 하겠지만 그렇지 않다면 깨끗히 정리하고 싶을 것이다. 우측 maven 탭에서 mvn clean 마우스 우클릭을 통해 target폴더를 정리해주자. 아래의 이미지 처럼 target 폴더가 송투리째 사라진 것을 확인할 수 있다.

![/assets/img/2020-10-21_16h52_27.png](/assets/img/2020-10-21_16h52_27.png)

- `mvn test` : src/test에 있는 테스트 클래스 컴파일, 테스트 코드 실행, test 클래스들은 `target/test-classes` 디렉토리에 생성됨. 테스트 결과 리포트는 `target/surefire-reports` 에 생성됨

    `src/test/java/com.example.demo` 하위에 있는 `[DemoApplicationTests.java](http://demoapplicationtests.java)` 파일을 열어 간단하게 Hi test라는 log를 찍어주는 코드를 추가해주자. 그리고 메이븐 탭에서 `mvn test` 를 우클릭해서 실행시켜보자. 아래와 같이 Hi test라는 문구가 뜨는 것을 확인할 수 있다. 그리고 위에 설명했던 `target/test-classes` 폴더와 `target/surefire-reports` 도 프로젝트에 생성됨을 확인할 수 있다.

    ![/assets/img/2020-10-21_16h59_26.png](/assets/img/2020-10-21_16h59_26.png)

    ![/assets/img/2020-10-21_17h01_09.png](/assets/img/2020-10-21_17h01_09.png)

- `mvn compile` : 컴파일 수행, 컴파일된 결과는 `target/classes` 에 생성됨
- `mvn install` : 패키징한 파일을 로컬 저장소에 배포

    `pom.xml` dependency에 gson이라는 녀석을 예제로 추가해보겠다. mvnrepository 사이트에서 찾으면 편리하니 참고하기 바란다. 필자는 아래의 소스를 pom.xml에 추가했다. 빨갛게 찾을 수 없다고 에러가 뜨는 것을 확인할 수 있는데 mvn install로 설치가 되지 않는듯 하다. 이론적으로라면 그렇게 되야되는 것 같은데 아니다.

    ```xml
    <!-- https://mvnrepository.com/artifact/com.google.code.gson/gson -->
    <dependency>
        <groupId>com.google.code.gson</groupId>
        <artifactId>gson</artifactId>
        <version>2.8.5</version>
    </dependency>
    ```

    이 문제는 `pom.xml` 에 들어가서 수정을 하면 아래와 같이 새로고침(?) 아이콘이 나오는데 그것을 클릭하면 dependency가 설치 됨을 확인할 수 있다.

    ![/assets/img/2020-10-21_17h17_07.png](/assets/img/2020-10-21_17h17_07.png)

    ![/assets/img/2020-10-21_17h34_45.png](/assets/img/2020-10-21_17h34_45.png)

- `mvn deploy` : 패키징한 파일을 원격 저장소에 배포 (sonatype nexus나 maven central 저장소)
