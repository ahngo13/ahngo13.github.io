---
title: SpringBoot REST API 서버 만들기 - (2) MySQL 및 Spring Data JPA 연동
layout: post
date: '2020-10-26 17:33:00 +0300'
description: SpringBoot REST API 서버 만들기 - (2) MySQL 및 Spring Data JPA 연동
img: null
fig-caption: null
tags:
- springboot
- 스프링부트
- 스프링부트RESTAPI
- springbootrestapi
- restapi
- SpringDataJPA
- JPA
- springbootmysql
- mysql
---

REST API 서버에 데이터베이스를 연동하기에 앞서 알아야할 개념이 있다. JPA를 사용하는 것이 아직까지 일반화가 되어있다고 생각하지는 않지만 쓰는 곳도 있고 관계형 DB를 자바단에서 관리할 수 있다는 점이 간편해보여서 접목시켜보려고 한다. JPA에 대한 개념이 뒤죽박죽 될 수 있기 때문에 아래의 개념들을 한번씩 읽고 가는 것을 추천한다.

## JPA(기술 명세)란?

- Java Persistence API의 약자 (Persistence는 영속성이라는 뜻으로 의미한다고 한다)
- Java 플랫폼을 사용하는 응용프로그램에서 관계형 데이터베이스 관리를 표현하는 자바 API
- ORM(Object-Relation Mapping : 객체 지향 프로그래밍 언어 간의 호환되지 않는 데이터를 변환하는 프로그래밍 기법) 기술에 대한 명세

## Hibernate(구현체)란?

- `javax.persistence.EntitiyManager` 와 같은 인터페이스를 직접 구현한 라이브러리 (JPA가 인터페이스라면 하이버네이트는 구현한 Class와 같은 관계)

웹서핑을 하다보면  `EntityManager` 로 CRUD를 하는 예제 소스가 많이 나온다. 필자의 경우에도 이것 때문에 혼동이 왔었는데 Spring Data JPA를 사용할 경우 하이버네이트를 직접적으로 사용하지 않아도 된다고 한다.

## Spring Data JPA(모듈)란?

- Spring에서 제공하는 모듈 중 JPA를 더 쉽고 편하게 사용할 수 있도록 도와주는 역할
- `Repository` 라는 인터페이스를 제공함으로써 이루어짐

# Spring Data JPA를 적용하여 게시판 REST API 만들기

### Spring Data JPA dependency 추가

이전에 작업했던 부분에서는 jpa dependency를 추가하지 않았기 때문에 `pom.xml` 을 열어 추가하도록 한다. 필자는 [https://mvnrepository.com/](https://mvnrepository.com/) 에서 검색해서 아래와 같은 소스를 추가해준다. 추가하면 인텔리제이에서는 새로고침 할것인지 위에 조그마한 버튼이 나오는데 이것을 눌러주면 알아서 설치된다. (뒤에 JUnit으로 테스트 소스도 짜볼 것이기 때문에 JUnit과 AssertJ라는 것도 추가해주자)

```xml
<!-- https://mvnrepository.com/artifact/org.springframework.boot/spring-boot-starter-data-jpa -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-jpa</artifactId>
    <version>2.3.4.RELEASE</version>
</dependency>

<!-- https://mvnrepository.com/artifact/junit/junit -->
		<dependency>
			<groupId>junit</groupId>
			<artifactId>junit</artifactId>
			<version>4.13</version>
			<scope>test</scope>
		</dependency>

<!-- https://mvnrepository.com/artifact/org.assertj/assertj-core -->
		<dependency>
			<groupId>org.assertj</groupId>
			<artifactId>assertj-core</artifactId>
			<version>3.17.2</version>
			<scope>test</scope>
		</dependency>
```

### MySQL 설치 및 MySQL Connector/J dependency 추가

- MySQL Server 설치 (필자는 5.7.32 버전을 Window Installer 버전으로 설치했다. Workbench)

[https://dev.mysql.com/downloads/mysql/](https://dev.mysql.com/downloads/mysql/)

- MySQL Connector/J dependency를 `pom.xml` 추가한다. (필자는 8.0.21 버전을 추가했다) 역시나 우측 상단에 아래와 같은 버튼이 나오면 눌러서 업데이트 해준다. (IDE는 intelliJ 기준이다)

    ![/assets/img/2020-10-23_17h37_12.png](/assets/img/2020-10-23_17h37_12.png)

[https://mvnrepository.com/artifact/mysql/mysql-connector-java](https://mvnrepository.com/artifact/mysql/mysql-connector-java)

```xml
<!-- https://mvnrepository.com/artifact/mysql/mysql-connector-java -->
<dependency>
    <groupId>mysql</groupId>
    <artifactId>mysql-connector-java</artifactId>
    <version>8.0.21</version>
</dependency>
```

### [application.properties](http://application.properties) 파일 수정

데이터베이스를 jdbc 연동 하기위해서는 위에 데이터베이스 세팅 쪽만 추가하면 되는데 우리는 spring data jpa도 사용해볼 것이기 때문에 아래의 설정도 추가한다.

```
############# DATABASE SETTING
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver
spring.datasource.url=jdbc:mysql://localhost:3306/post?serverTimezone=UTC&characterEncoding=UTF-8
spring.datasource.username=root
spring.datasource.password=mysql

## SQL Script 사용
## always : 생성 (기본값), never : 생성 안함
spring.datasource.initialization-mode=never
spring.datasource.dbcp2.validation-query=SELECT 1
```

### 기존 소스 수정

기존의 소스들 중에 spring data jpa를 사용했을 때 에러가 발생할 부분이 있다. 그리고 이번에는 entity (VO, DTO 등 라고도 부름)를 lombok이라는 것을 사용해서 간단한게 entity를 작성할 수 있다는 것에 대해서도 알아볼 것이다.

`Post.java`

먼저 lombok 적용을 위해서 [Post.java](http://post.java) 파일을 수정할 것이다. lombok이란 Java에서 모델(VO, DTO, Domain)을 만들 때 반복적으로 만드는 코드를 어노테이션을 통해 줄여주는 라이브러리이다. 간단하게 말해서 `Getter, Setter, toString` 을 줄여준다고 생각하면 된다. 기존의 소스와 비교해보면서 얼마나 줄어들었는지 확인해보며 좋다.

```java
package com.hamletshu.restapi.entity;

import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Getter //클래스 내 모든 필드에 getter 메서드 생성
@NoArgsConstructor // 기본 생성자 자동 추가 public Post(){}과 동일
@AllArgsConstructor // 해당 클래스의 빌더 패턴 클래스 생성 (생성자 상단에 선언시 포함된 필드만 빌더에 포함)
public class Post {
    private Long postId;

    private String title;

    private String contents;

}
```

`PostController.java`

다음은 컨트롤러이다. 소스를 수정하는 것이 기능이 되게 수정한다기 보단 오류만 나지 않게하기 위해 수정하는 것이라고 생각하는게 좋다. 아직까지는 데이터베이스가 연동되지 않았으므로 builder를 통한 임시데이터로 특정게시글 조회와 게시글 목록 조회 정도만 Postman으로 그나마 확인할 수 있다고 생각하면 된다.

```java
package com.hamletshu.restapi.controller;

import com.hamletshu.restapi.entity.Post;
import org.springframework.beans.factory.annotation.Autowired;
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
    public List<Post> getPostList(@RequestParam(value = "postId", required = false) Long postId){
        //게시글 데이터가 조회가 되려면 데이터가 있어야 하는데 없으므로 임의로 10개만 생성해 줌
        //Post 객체로 ArrayList를 생성
        ArrayList<Post> posts= new ArrayList<>();
        for(int i=0; i<5; i++){
            Post post = Post.builder().postId(i+1L)
                                      .title("title"+i+1L)
                                      .contents("contents"+i+1L)
                                      .build();
            posts.add(post);
        }

        return posts;
    }

    //특정 게시글 조회
    //Get 요청이 들어왔을 때, value = "/{postId}"는 postId 게시글의 데이터를 조회하기 위해 설정
    //ex) localhost:8080/posts/1
    @GetMapping(value = "/{postId}")
    //PathVariable은 URI에 넘어온 postId 값을 가져오기 위해 사용
    public Post getPost(@PathVariable Long postId){
        // 데이터베이스 연동이 따로 되어있는 것이 없기 때문에 임시적으로 객체를 생성해서 넘겨줌
        Post post = Post.builder().postId(postId)
                                  .title("title"+postId)
                                  .contents("contents"+postId)
                                  .build();
        return post;
    }

    //Put 요청이 들어왔을 때, value = "/{postId}"는 postId 게시글의 데이터를 수정하기 위해 설정
    @PutMapping(value = "/{postId}")
    public ResponseEntity<Void> updatePost(
            //PathVariable은 URI에 넘어온 postId 값을 가져오기 위해 사용
            @PathVariable Long postId, @RequestBody Map<String, Object> requestBody
    ){
        //Postman으로 요청했을 때 딱히 뜨는 메시지가 없어서 확인차 로그를 찍어봄
        System.out.println("UpdatePost");
        //이 또한 데이터베이스가 연동되어 있지 않기 때문에 임시로 처리
        return new ResponseEntity<>(HttpStatus.OK);
    }

    //Delete 요청이 들어왔을 때, value = "/{postId}"는 postId 게시글의 데이터를 삭제하기 위해 설정
    @DeleteMapping("/{postId}")
    public ResponseEntity<Void> deletePost(
            @PathVariable Long postId
    ){
        //Postman으로 요청했을 때 딱히 뜨는 메시지가 없어서 확인차 로그를 찍어봄
        System.out.println("DeletePost");
        //이 또한 데이터베이스가 연동되어 있지 않기 때문에 임시로 처리
        return new ResponseEntity<>(HttpStatus.OK);
    }
}
```

- 특정 게시글 조회

![/assets/img/2020-10-26_14h17_30.png](/assets/img/2020-10-26_14h17_30.png)

- 게시글 목록 조회

![/assets/img/2020-10-26_14h18_12.png](/assets/img/2020-10-26_14h18_12.png)

## Spring Data JPA 연동

Spring Data JPA 연동을 하고 그를 통해서 JUnit으로 테스트 소스를 만들어 테스트 해보도록 하겠다. 중간에 sql로 서버가 시작할 때 스키마나 데이터를 넣는 sql을 파일로 삽입하는 방법도 적도록 할 것이다.

### [application.properties](http://application.properties) 환경설정 추가

Spring Data JPA를 사용한다고 하면 설정할 부분들이 꽤나 많은 것 같다. 자주 쓸만한 부분들과 시작했을 때 에러가 발생할 요인이 있는 부분들만 체크하고 넘어가도록 한다.

```
############# JPA SETTING
## 사용하는 데이터베이스를 지정
spring.jpa.database=mysql

## Dialect는 내부적으로 지정하는 DB에 맞게 SQL문을 생성
## https://docs.jboss.org/hibernate/orm/5.2/javadocs/org/hibernate/dialect/package-summary.html
spring.jpa.database-platform=org.hibernate.dialect.MySQL5InnoDBDialect

spring.jpa.open-in-view=false

## JPA나 hibernate를 통해 CRUD를 실행하면 해당 CRUD의 sql 로깅을 보여줌
spring.jpa.show-sql=true

## DDL 생성시 데이터베이스 고유의 기능을 사용하는지에 대한 유무
spring.jpa.generate-ddl=true

## create : 테이블이 없을 경우 생성
## create-drop : 테스트 실행시 적합, 종료 후 table drop
## validate : 변경된 스키마가 있다면 변경점을 출력하고 종료
## update : 변경된 스키마 적용
## none : 아무것도 하지 않음
spring.jpa.hibernate.ddl-auto=create
## 로깅에 표시되는 sql을 보기 좋게 표시
spring.jpa.properties.hibernate.format_sql=true

logging.level.web=DEBUG
## hibernate의 로깅 레벨 설정 (info 보다는 debug로 할 때 더 상세하게 나옴)
logging.level.org.hibernate.SQL=DEBUG
logging.level.org.hibernate.type.descriptor.BasicBinder=TRACE
```

### 기존 소스 수정

`Post.java`

Spring Data JPA와 연동하기 위해 entity 파일에 어노테이션을 추가해준다.

```java
package com.hamletshu.restapi.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import javax.persistence.*;

@Entity //테이블과 링크될 클래스임을 나타냄
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Post {
    @Id //해당 테이블의 PK필드를 나타냄
    @GeneratedValue(strategy = GenerationType.IDENTITY) //PK의 생성 규칙 (1씩 증가)
    private Long postId;

    //테이블의 칼럼임을 나타냄. 굳이 선언하지 않아도 됨. 변경할 옵션이 있을 때 주로 선언. 공백 불가
    //500자 이내
    @Column(length = 500, nullable = false) 
    private String title;
    
    //타입을 TEXT로 변경, 공백 불가
    @Column(columnDefinition = "TEXT", nullable = false)
    private String contents;

}
```

### Repository 파일 추가

아래와 같이 entity 패키지 안에 PostRepository라는 인터페이스를 추가한다. 같은 패키지일 경우에는 `@Repository` 라는 어노테이션을 붙이지 않아도 되지만 다른 패키지에 위치할경우 붙여야 한다. 대체적으로 대규모 프로젝트에서도 이렇게 같은 패키지에서 넣는다고 함.

![/assets/img/2020-10-26_14h56_36.png](/assets/img/2020-10-26_14h56_36.png)

`PostRepository.java`

```java
package com.hamletshu.restapi.entity;

import com.hamletshu.restapi.entity.Post;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PostRepository extends JpaRepository<Post, Long>{

}
```

### JUnit과 AssertJ를 활용한 단위 테스트

- JUnit : 자바 프로그래밍용 단위 테스트 프레임워크
- AssertJ : 에러메세지와 테스트 코드의 가독성을 높여주는 라이브러리

단위 테스트란 모듈이나 애플리케이션 안에 있는 개별적인 코드 단위가 예상대로 작동하는지 확인하는 반복적인 행위이다. 

`src/test/java` 안에 `com.hamletshu.restapi.entity` 패키지를 추가하고 `[PostRepositoryTest.java](http://postrepositorytest.java)` 파일을 생성하였다.

```java
package com.hamletshu.restapi.entity;

import org.junit.After;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.junit4.SpringRunner;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

//Junit에 내장된 기본 테스트 러너인 BlockJUnit4ClassRunner 대신에 지정된 클래스를 이용해 테스트 메소드들을 수행하도록 지정
@RunWith(SpringRunner.class)
//스프링부트 어플리케이션 테스트에 필요한 거의 모든 의존성을 제공
@SpringBootTest
public class PostRepositoryTest {
    //어노테이션을 선언한 클래스들을 스캐닝 하기위한 설정
    @Autowired
    PostRepository postRepository;

		//post 테이블 데이터 삭제
    @Test
    @After //단위테스트가 끝날때마다 수행되는 메서드 지정
//    @Ignore
    public void cleanup(){
        postRepository.deleteAll();
    }

		//post 테이블의 한개의 데이터 가져오기
    @Test
    public void getPostOne(){
        String title = "test title";
        String contents = "test contents";
        postRepository.save(Post.builder()
                .title(title)
                .contents(contents)
                .build());

        Optional<Post> post = postRepository.findById(1L);
        System.out.println(post.get().getPostId().toString());
        System.out.println(post.get().getTitle());
        System.out.println(post.get().getContents());
		
        assertThat(post.get().getTitle()).isEqualTo(title);
        assertThat(post.get().getContents()).isEqualTo(contents);
    }

		//post 테이블의 모든 데이터 가져오기
    @Test
    public void getPostAll(){

        String title = "test title";
        String contents = "test contents";
        postRepository.save(Post.builder()
                .title(title)
                .contents(contents)
                .build());

        List<Post> postsList =  postRepository.findAll();
        Post post = postsList.get(0);
        System.out.println(post.getPostId().toString());
        System.out.println(post.getTitle());
        System.out.println(post.getContents());

    }
}
```

JUnit으로 실행시켜서 아래와 같이 모두 성공했다면 정상적으로 진행된 것이다. 혹시나 에러가 발생한다면 MySQL에 post라는 Schema를 생성했는지 확인하기 바란다.

![/assets/img/2020-10-26_16h14_33.png](/assets/img/2020-10-26_16h14_33.png)

### 데이터베이스 기준으로 [PostController.java](http://postcontroller.java) 수정

JUnit 테스트를 함으로써 Spring Data JPA와 JDBC가 잘 연결되었음을 확인할 수 있었다. 그러면 이제 모양뿐이었던 REST API를 실제데이터인 데이터베이스 데이터 기준으로 CRUD를 수정하도록 하자.

`PostController.java`

```java
package com.hamletshu.restapi.controller;

import com.hamletshu.restapi.entity.Post;
import com.hamletshu.restapi.entity.PostRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping(value = "/posts", produces = MediaType.APPLICATION_JSON_VALUE)
public class PostController {

    @Autowired
    private PostRepository postRepository;

		//게시글 추가
    @PostMapping(value = "", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Void> createPost(@RequestBody Map<String, Object> requestBody){
        Post post = Post.builder().title(requestBody.get("title").toString())
                                  .contents(requestBody.get("contents").toString()).build();
        postRepository.save(post);

        return new ResponseEntity<>(HttpStatus.OK);
    }

    //게시글 목록 조회
    @GetMapping(value = "")
    public List<Post> getPostList(@RequestParam(value = "postId", required = false) Long postId){
        List<Post> posts= postRepository.findAll();
        return posts;
    }

    //특정 게시글 조회
    @GetMapping(value = "/{postId}")
    //PathVariable은 URI에 넘어온 postId 값을 가져오기 위해 사용
    public Optional<Post> getPost(@PathVariable Long postId){
        Optional<Post> post = postRepository.findById(postId);

        return post;
    }

    //게시글 수정
    @PutMapping(value = "/{postId}", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Void> updatePost(
            //PathVariable은 URI에 넘어온 postId 값을 가져오기 위해 사용
            @PathVariable Long postId, @RequestBody Map<String, Object> requestBody
            ){
        Post post = Post.builder().postId(postId).title(requestBody.get("title").toString()).contents(requestBody.get("contents").toString()).build();
        postRepository.save(post);
        return new ResponseEntity<>(HttpStatus.OK);
    }

    //게시글 삭제
    @DeleteMapping("/{postId}")
    public ResponseEntity<Void> deletePost(
            @PathVariable Long postId
    ){
        Post post = Post.builder().postId(postId).build();
        postRepository.delete(post);
        return new ResponseEntity<>(HttpStatus.OK);
    }
}
```

### Postman으로 테스트

JDBC를 이용한 데이터베이스 연동, JUnit을 이용한 테스트, Spring Data JPA 연동, 그에 맞는 소스 수정까지 모두 완료되었다. 그러면 포스트맨으로 잘 돌아가는지 확인해보자.

- 게시글 추가

POST [`http://localhost:8080/posts`](http://localhost:8080/posts)

```java
//Body raw
{
    "title" : "test",
    "contents" : "test"
}
```

![/assets/img/2020-10-26_17h07_40.png](/assets/img/2020-10-26_17h07_40.png)

![/assets/img/2020-10-26_17h08_06.png](/assets/img/2020-10-26_17h08_06.png)

- 게시글 목록 조회

GET [`http://localhost:8080/posts`](http://localhost:8080/posts)

![/assets/img/2020-10-26_17h10_20.png](/assets/img/2020-10-26_17h10_20.png)

- 특정 게시글 조회

GET [`http://localhost:8080/posts/1`](http://localhost:8080/posts/2)

![/assets/img/2020-10-26_17h15_51.png](/assets/img/2020-10-26_17h15_51.png)

- 게시글 수정

PUT [`http://localhost:8080/posts/2`](http://localhost:8080/posts/2)

```java
//Body raw
{
    "title" : "updateTest",
    "contents" : "updateTest"
}
```

![/assets/img/2020-10-26_17h20_49.png](/assets/img/2020-10-26_17h20_49.png)

- 게시글 삭제

DELETE [`http://localhost:8080/posts/2`](http://localhost:8080/posts/2)

![/assets/img/2020-10-26_17h22_38.png](/assets/img/2020-10-26_17h22_38.png)

![/assets/img/2020-10-26_17h22_55.png](/assets/img/2020-10-26_17h22_55.png)

## SQL을 통한 Table 생성 및 데이터 추가

`schema.sql` : table 생성

`data.sql` : data 추가

`resources` 폴더 안에 schema.sql or data.sql을 넣어주면 서버를 시작할 때 자동으로 실행하게 된다. 순서는 schema.sql이 먼저 실행되므로 순서에 맞춰서 sql문을 활용하면 될 것 같다. spring data jpa에서 테이블을 생성하는 것보다 미리 선행되어서 작업을 하므로 테이블은 생성된 채로 데이터를 삽입하는 게 좋을 듯 하다. 

 `[application.properties](http://application.properties)` 파일의 속성 중 아래의 속성이 create로 되어있을 경우 계속 새로 테이블을 생성하니 update로 변경하거나 해서 데이터를 삽입하는데에 문제가 발생하지 않도록 하자.

```
spring.jpa.hibernate.ddl-auto=update
```

![/assets/img/2020-10-26_17h30_28.png](/assets/img/2020-10-26_17h30_28.png)

### 참고 사이트

[https://velog.io/@adam2/JPA는-도데체-뭘까-orm-영속성-hibernate-spring-data-jpa](https://velog.io/@adam2/JPA%EB%8A%94-%EB%8F%84%EB%8D%B0%EC%B2%B4-%EB%AD%98%EA%B9%8C-orm-%EC%98%81%EC%86%8D%EC%84%B1-hibernate-spring-data-jpa)

[https://m.post.naver.com/viewer/postView.nhn?volumeNo=27845264&memberNo=2490752](https://m.post.naver.com/viewer/postView.nhn?volumeNo=27845264&memberNo=2490752)

[https://victorydntmd.tistory.com/321](https://victorydntmd.tistory.com/321)

[https://suhwan.dev/2019/02/24/jpa-vs-hibernate-vs-spring-data-jpa/](https://suhwan.dev/2019/02/24/jpa-vs-hibernate-vs-spring-data-jpa/)

[https://pravusid.kr/java/2018/10/10/spring-database-initialization.html](https://pravusid.kr/java/2018/10/10/spring-database-initialization.html)
