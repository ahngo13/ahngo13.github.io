---
title: SpringBoot REST API 서버 만들기 - (1) RestController
layout: post
date: '2020-10-23 17:33:00 +0300'
description: SpringBoot REST API 서버 만들기 - (1) RestController
img: null
fig-caption: null
tags:
- springboot
- 스프링부트
- 스프링부트RESTAPI
- springbootrestapi
- restapi
---

# REST API란?

- Representational State Transfer라는 용어의 약자
- 웹과 같은 분산 하이퍼미디어 시스템을 위한 소프트웨어 아키텍처의 한 형식

## REST 구성

- 자원 (Resource) - URI
- 행위 (Verb) - http method
- 표현 (representations)

## HTTP Method의 역할

- POST : 해당 URL을 요청하면 리소스를 생성 (Create)
- GET : 해당 리소스를 조회, Document의 정보를 가져옴 (Read)
- PUT : 해당 리소스를 수정 (Update)
- DELETE : 해당 리소스 삭제 (Delete)

## URL 설계시 주의점

1. 슬래시 (/) 구분자는 계층 관계를 나타냄, 리소스가 다르면 URI도 달라야 함
2. URI 마지막 문자로 슬래시를 포함하지 않음
3. 하이픈은 가독성을 높히는데 사용
4. 언더바(_)는 URI에 사용하지 않음
5. URI 경로는 소문자가 적합
6. URI에 파일 확장자 포함하지 않음 (Accept header 사용)

## 리소스 간 관계 표현

- has(소유의 관계를 표현할 때) 아래와 같이 표현

```
## /리소스명/리소스ID/관계가 있는 다른 리소스명
GET : /users/{userid}/device

## 관계명이 애매하거나 구체적일 필요가 있을 때
GET : /users/{userid}/likes/device 
```

## 자원을 표현하는 Collection과 Document

```
http:// restapi.example.com/sports/soccer/players/13
```

컬렉션과 도큐먼트는 모두 리소스라고 표현 가능하므로 URI에 표현 됨. 단수 복수도 지켜주면 좋음

## HTTP 응답 상태 코드

### 2XX

- 200 : 클라이언트의 요청을 정상적으로 수행
- 201 : 클라이언트가 리소스 생성을 요청하고 그것을 성공적으로 생성함 (POST를 통한 리소스 생성)

### 4XX

- 400 : 클라이언트의 요청이 부적절할 경우 사용
- 401 : 클라이언트가 인증되지 않은 상태에서 보호된 리소스를 요청했을 때 사용
- 403 : 유저 인증상태와 관계없이 응답하고 싶지 않은 리소스를 클라이언트가 요청했을 때 사용
    - 400이나 404를 사용하는 것을 권고
- 405 : 클라이언트가 요청한 리소스에서는 사용 불가능한 Method를 이용했을 경우 사용

### 3XX

- 301 : 클라이언트가 요청한 리소스에 대한 URI가 변경 되었을 때 사용 (응답시 Location header에 변경된 URI를 적어줘야 함)

### 5XX

- 500 : 서버에 문제가 있을 경우 사용

# SpringBoot로 REST API 서버 만들어 보기

REST API 서버라고 해서 엄청 거창한 것을 만드는 것은 아니다. 간단하게 서버를 돌려놓고 Postman(API를 테스트하는 툴)을 사용하여 서버가 잘 돌아가는지만 확인하도록 하겠다. 추후에는 이를 기반으로 다른 부분까지 연동하여 확장해 나갈 계획이다. 오늘 만들 REST API 서버는 게시판 글 목록 조회, 특정 글 조회, 글 삭제, 글 추가, 글 수정 기능을 가졌다고 보면 된다. (데이터베이스 연동이 되지 않아 느낌만 가져가는 REST API 서버라서 우리가 원하는 완벽한 정도의 느낌은 아닐 것이지만 첫술에 배부르랴!) 

### REST API 서버의 기능

위에 정리된 REST API 서버 메소드 역할대로 나누어 보자면 아래와 같이 될 것이다. 대충 HTTP 메소드를 어떤 걸 어떻게 써야되는구나 생각하고 넘어가면 된다.

- 게시글 추가 : POST (게시글에 대한 정보를 넘겨줘야 겠구나)
- 게시글 목록 조회 : GET (따로 뭔가를 안 넘겨줘도 볼 수 있겠구나)
- 특정 게시글 조회 : GET (특정 게시글이니까 게시글 번호같은 고유 값을 넘겨줘야 겠구나)
- 특정 게시글 수정 : PUT (특정 게시글을 수정하는 것이니까 게시글 번호같은 고유값과 변경될 데이터들을 보내줘야 겠구나)
- 특정 게시글 삭제 : DELETE (특정 게시글을 삭제하는 것이니까 게시글 번호같은 고유값을 넘겨줘야 겠구나)

### 프로젝트 생성

IDE를 인텔리제이를 사용하여 Maven 프로젝트로 생성하였고 `[localhost:8080](http://localhost:8080)` 서버 구동이 잘 되는지만 확인하고 진행하였다. 잘 모르겠다면 [https://start.spring.io/](https://start.spring.io/) 여기에서 적당히 디펜던시만 추가해서 생성해도 된다. (필자는 SpringBoot DevTools, Lombok, Spring Web, Thymeleaf 이정도는 추가하고 프로젝트를 생성하는 편이다) dependency만 잘 추가해서 프로젝트를 생성했다면 서버를 띄웠을 때 콘솔창에 에러가 뜨는 경우는 없을 것이고 localhost:8080 으로 서버를 띄워서 접속했을 때 404 페이지가 뜨는 것을 볼 수 있을 것이다.

[https://ahngo13.github.io/springboot-maven/](https://ahngo13.github.io/springboot-maven/) 앞부분만 조금 따라해서 Hello World를 찍어보는 것도 괜찮을 것 같다.

혹시나 환경 설정에서 애먹으실 분들이 있을까 해서 pom.xml을 공유한다.

`pom.xml`

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
	<groupId>com.hamletshu.www</groupId>
	<artifactId>restapi</artifactId>
	<version>0.0.1-SNAPSHOT</version>
	<name>restapi</name>
	<description>REST API project for Spring Boot</description>

	<properties>
		<java.version>11</java.version>
	</properties>

	<dependencies>
		<dependency>
			<groupId>org.springframework.boot</groupId>
			<artifactId>spring-boot-starter-thymeleaf</artifactId>
		</dependency>
		<dependency>
			<groupId>org.springframework.boot</groupId>
			<artifactId>spring-boot-starter-web</artifactId>
		</dependency>

		<dependency>
			<groupId>org.springframework.boot</groupId>
			<artifactId>spring-boot-devtools</artifactId>
			<scope>runtime</scope>
			<optional>true</optional>
		</dependency>
		<dependency>
			<groupId>org.projectlombok</groupId>
			<artifactId>lombok</artifactId>
			<optional>true</optional>
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

### 패키지 구조 잡기

패키지 구조를 잡는 것은 사람마다 다르겠지만 필자는 아래와 같이 패키지를 구성하였다.

![/assets/img/2020-10-23_15h52_20.png](/assets/img/2020-10-23_15h52_20.png)

최초에 생성된 프로젝트에서 `com.hamletshu.restapi.controller` 와  `com.hamletshu.restapi.entity`

가 추가한 것이고 controller들과 entity (vo, dto라고도 부르는 데이터 객체들을 관리하는 class)들을 관리하기 위해 나누어 놓았다. 솔직히 여기서 더 여러개의 컨트롤러나 엔티티를 만들어낼지는 모르겠지만 느낌 있어 보이게(?) 나누었다.

### [PostController.java](http://postcontroller.java) 파일 생성

이번에 예제로 REST API 서버를 만드는 핵심로직이 여기에 거의 다 있다고 보면된다.

저번에도 잠깐 말했었지만 어노테이션 중 RestController라는 것이 있다. 서버를 실행했을 때 해당 클래스를 컨트롤러로 인식시키기 위해서 사용하는 것으로 알고있다.

- `@RestController` : 전통적인 Controller에 `@ResponseBody`가 추가된 것이라고 한다. JSON 객체 형태로 데이터를 반환할 때 사용한다고 한다. (일반적으로 이걸 많이 쓰니깐 이런식으로 바꿔놓았겠지? 라고 생각한다.)
- `@Controller` : 전통적인 Controller로 View를 반환하기 위해 사용한다고 한다.

`PostController.java`

```java
package com.hamletshu.restapi.controller;

import com.hamletshu.restapi.entity.Post;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

//RestController 어노테이션 추가 (controller 인식)
@RestController
// value : localhost:8080/posts로 접근할 경우 이 controller에 접근한다.
// produces : 생산 가능한 미디어 타입을 지정해서 일치할 때만 요청을 매칭함. (매핑 제한용)
// comsumes : 소비 가능한 미디어 타입을 지정해서 때만 요청을 매칭함. (매핑 제한용)
@RequestMapping(value = "/posts", produces = MediaType.APPLICATION_JSON_VALUE)
public class PostController {

    //게시글 추가
		//Post 요청이 들어왔을 때, value=""는 localhost:8080/posts를 의미함
    @PostMapping(value = "", consumes = MediaType.APPLICATION_JSON_VALUE)
    //ResponseEntity 상태코드 제어
    public ResponseEntity<Void> createPost(@RequestBody Map<String, Object> requestBody){
        //Postman으로 요청했을 때 딱히 뜨는 메시지가 없어서 확인차 로그를 찍어봄
				System.out.println("createPost");
        //정상적으로 수행됐다고 상태 리턴 (200)
        return new ResponseEntity<>(HttpStatus.OK);
    }
    //게시글 목록 조회
    //Get 요청이 들어왔을 때, value=""는 localhost:8080/posts를 의미함
    @GetMapping(value = "")
    //RequestParam : 넘어온 파라미터 가지고 올때 사용 required = false를 사용하면 필수값 아님을 의미
    public List<Post> getPostList(@RequestParam(value = "postId", required = false) String postId){
        //게시글 데이터가 조회가 되려면 데이터가 있어야 하는데 없으므로 임의로 10개만 생성해 줌
        //Post 객체로 ArrayList를 생성
				ArrayList<Post> posts= new ArrayList<>();
        for(int i=1; i <= 10; i++){
            //Post 객체를 생성해서 데이터를 title과 contents에 postId만 붙여서 넣어줌 
            Post post = new Post();
            post.setPostId(Integer.toString(i));
            post.setTitle("title" + i);
            post.setContents("content" + i);
            //ArraryList에 Post 객체를 넣어줌
            posts.add(post);
        }

        return posts;
    }
    
    //특정 게시글 조회
    //Get 요청이 들어왔을 때, value = "/{postId}"는 postId 게시글의 데이터를 조회하기 위해 설정 
    //ex) localhost:8080/posts/1 
    @GetMapping(value = "/{postId}")
    //PathVariable은 URI에 넘어온 postId 값을 가져오기 위해 사용
    public Post getPost(@PathVariable String postId){
        // 데이터베이스 연동이 따로 되어있는 것이 없기 때문에 임시적으로 객체를 생성해서 넘겨줌
        return new Post(postId,"title"+postId,"contents"+postId);
    }
    
    //Put 요청이 들어왔을 때, value = "/{postId}"는 postId 게시글의 데이터를 수정하기 위해 설정 
    @PutMapping(value = "/{postId}")
    public ResponseEntity<Void> updatePost(
            //PathVariable은 URI에 넘어온 postId 값을 가져오기 위해 사용
            @PathVariable String postId
    ){
				//Postman으로 요청했을 때 딱히 뜨는 메시지가 없어서 확인차 로그를 찍어봄
        System.out.println("UpdatePost");
        //이 또한 데이터베이스가 연동되어 있지 않기 때문에 임시로 처리
        return new ResponseEntity<>(HttpStatus.OK);
    }

    //Delete 요청이 들어왔을 때, value = "/{postId}"는 postId 게시글의 데이터를 삭제하기 위해 설정 
    @DeleteMapping("/{postId}")
    public ResponseEntity<Void> deletePost(
            @PathVariable String postId
    ){
				//Postman으로 요청했을 때 딱히 뜨는 메시지가 없어서 확인차 로그를 찍어봄
        System.out.println("DeletePost");
        //이 또한 데이터베이스가 연동되어 있지 않기 때문에 임시로 처리
        return new ResponseEntity<>(HttpStatus.OK);
    }
}
```

`Post.java`

Post 객체를 생성하였다. 객체안에는 postId (게시글 번호), title (제목), contents(내용)으로 구성하였다. 데이터를 가져오거나 가공할 필요성도 있다고 생각해서 생성자, getter와 setter도 추가하였다.

```java
package com.hamletshu.restapi.entity;

public class Post {
    private String postId;
    private String title;
    private String contents;

    public Post(){}

    public Post(String postId, String title, String contents) {
        this.postId = postId;
        this.title = title;
        this.contents = contents;
    }

    public String getPostId() {
        return postId;
    }

    public void setPostId(String postId) {
        this.postId = postId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getContents() {
        return contents;
    }

    public void setContents(String contents) {
        this.contents = contents;
    }
}
```

### Postman으로 정상작동 하는지 테스트

- 게시글 추가

[`http://localhost:8080/posts`](http://localhost:8080/posts)

```json
//Post 객체에 맞게 JSON 데이터를 Body에 넣어서 요청
{
    "postId" : "1",
    "title" : "test1",
    "contents" : "contents1"
}
```

- 게시글 목록 조회

[`http://localhost:8080/posts`](http://localhost:8080/posts)

![/assets/img/2020-10-23_16h54_31.png](/assets/img/2020-10-23_16h54_31.png)

- 특정 게시글 조회

[`http://localhost:8080/posts/1`](http://localhost:8080/posts/1)

![/assets/img/2020-10-23_16h58_05.png](/assets/img/2020-10-23_16h58_05.png)

- 특정 게시글 수정

[`http://localhost:8080/posts/1`](http://localhost:8080/posts/1)

```java
//Post 객체에 맞게 JSON 데이터를 Body에 넣어서 요청
{
    "title" : "testUpdate",
    "contents" : "contentUpdate"
}
```

![/assets/img/2020-10-23_17h06_01.png](/assets/img/2020-10-23_17h06_01.png)

- 특정 게시글 삭제

[`http://localhost:8080/posts/1`](http://localhost:8080/posts/1)

![/assets/img/2020-10-23_17h07_36.png](/assets/img/2020-10-23_17h07_36.png)

REST API라고 만들긴 했는데 실질적으로 데이터 관리가 이루어지지 않다보니까 껍데기에 불과한 REST API 서버를 만든 것을 알 수 있었다. 다음번에는 데이터베이스를 연동해서 조금이나마 진짜 같은 REST API 서버를 구성해보도록 하겠다.

### 참고 사이트

[https://meetup.toast.com/posts/92](https://meetup.toast.com/posts/92)

[https://m.blog.naver.com/writer0713/221422059349](https://m.blog.naver.com/writer0713/221422059349)

[https://devfunny.tistory.com/321](https://devfunny.tistory.com/321)

[https://m.post.naver.com/viewer/postView.nhn?volumeNo=27835820&memberNo=2490752](https://m.post.naver.com/viewer/postView.nhn?volumeNo=27835820&memberNo=2490752)
