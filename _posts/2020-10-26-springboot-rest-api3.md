---
title: SpringBoot REST API 서버 만들기 - (3) JUnit을 활용한 단위 테스트(assertThat 포함)
layout: post
date: '2020-10-26 17:34:00 +0300'
description: SpringBoot REST API 서버 만들기 - (3) JUnit을 활용한 단위 테스트(assertThat 포함)
img: null
fig-caption: null
tags:
- springboot
- 스프링부트
- 스프링부트RESTAPI
- springbootrestapi
- restapi
- 단위테스트
- javaunittest
- assertThat
- junit
---

JUnit이라는 것에 대해서 조금 자세히 공부하려다 보니 이전 글인 [SpringBoot REST API 서버 만들기 - (2) MySQL 및 Spring Data JPA](https://ahngo13.github.io/springboot-rest-api2/) 연동 글에서 단위테스트에 대해서 너무 소홀하게 작성한 것을 깨닫고 다시 이렇게 조금 더 자세하게 적어보려고 한다. 기존 프로젝트 내용도 조금은 수정해서 테스트 케이스를 추가할 듯 하니 '이런식으로 쓰는구나!' 정도 느낌만 받아가면 될 듯하다.

# JUnit이란?

- Java용 단위테스트 프레임워크

## 단위테스트(Unit Test)란?

- 소스 코드의 특정 모듈이 의도된 대로 잘 작동하는지 검증
- 모든 함수와 메소드에 대한 테스트 케이스 작성

(모든 함수와 메소드에 대한 테스트 케이스라고 되어있는 것을 보고 이 포스팅을 써야된다는 생각이 들었다)

# JUnit 및 assertJ 설치

필자의 경우 Springboot의 메이븐 프로젝트로 만들었기 때문에 pom.xml에 2개의 dependency를 추가하였다. 그래들 프로젝트인 분들은 [https://mvnrepository.com/](https://mvnrepository.com/) 에서 검색해서 build.gradle 파일에 추가하도록 하자.

`pom.xml`

```xml
<!-- https://mvnrepository.com/artifact/org.assertj/assertj-core -->
		<dependency>
			<groupId>org.assertj</groupId>
			<artifactId>assertj-core</artifactId>
			<version>3.17.2</version>
			<scope>test</scope>
		</dependency>
<!-- https://mvnrepository.com/artifact/junit/junit -->
		<dependency>
			<groupId>junit</groupId>
			<artifactId>junit</artifactId>
			<version>4.13</version>
			<scope>test</scope>
		</dependency>
```

# JUnit annotation 정리

`@Test` : 테스트 메소드 지정

`@Test(timeout=5000)` : 테스트 메소드 수행시간 제한 (시간단위는 밀리초)

`@Test(expected=RuntimeException.class)` : 테스트 메소드 예외처리 지정 (익셉션이 발생해야 성공)

`@BeforeClass, @AfterClass` : 해당 테스트 클래스에서 딱 한번씩만 수행되도록 설정

`@Before, @After` : 해당 테스트 클래스에서 메소드들이 테스트 되기 전과 후에 각각 실행되도록 설정

# assertThat 메소드 정리

기존의 assert 함수들이 있지만 가독성이 떨어지므로 assertThat을 쓰는 것이 좋다고 한다. 그 외에도 콤비네이션이 가능하고 조합을 이뤄서 사용이 가능하다는 장점이 있다고 하니 참고하기 바란다.

```java
assertThat(frodo)
  .isNotEqualTo(sauron)
  .isIn(fellowshipOfTheRing);
 
assertThat(frodo.getName())
  .startsWith("Fro")
  .endsWith("do")
  .isEqualToIgnoringCase("frodo");
 
assertThat(fellowshipOfTheRing)
  .hasSize(9)
  .contains(frodo, sam)
  .doesNotContain(sauron);
```

## Object 표명 (오브젝트 간 비교)

```java
assertThat(new Dog("Cogi")).isEqualTo(new Dog("Cogi"));  // fail
assertThat(new Dog("Cogi")).isEqualToComparingFieldByFieldRecursively(new Dog("Cogi"));  // success
```

## Boolean 표명 (참, 거짓일 경우)

`isTrue()`

`isFalse()`

## Iterable/Array 표명 (리스트나 배열 구조일 경우)

```java
List<String> list = Arrays.asList("1", "2", "3");
 
assertThat(list)
  .isNotEmpty()
  .contains("1")
  .doesNotContainNull()
  .containsSequence("2", "3");
```

## Exception (예외 처리)

```java
assertThatThrownBy(() -> {
    List<String> list = Arrays.asList("String one", "String two");
    list.get(2);
}).isInstanceOf(IndexOutOfBoundsException.class)
  .hasMessageContaining("Index: 2, Size: 2");
```

# JUnit과 assertJ를 활용한 단위테스트 하기

단위테스트 케이스를 처음 작성을 해보아서 어떻게 작성하는 것이 가장 효율적이고 당위성이 있는지는 잘 모르겠지만 각각의 단위테스트 케이스에 조금이나마 더 비중있게 배분하여 작성하려고 노력했다. 여러 케이스가 약간씩 겹치는 경우도 발생하는 경우가 있는 것 같은데 조금 더 사례를 찾아보면서 어떻게 작성하는게 가장 좋은 방향인지 검토 해야될 것 같다.

`PostRepositoryTest.java`

```java
package com.hamletshu.restapi.entity;

import org.junit.After;
import org.junit.Ignore;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.junit4.SpringRunner;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

//Junit이 없으면 pom.xml에 추가
@RunWith(SpringRunner.class)
@SpringBootTest
public class PostRepositoryTest {
    @Autowired
    PostRepository postRepository;

//    @Test
//    @After
//    @Ignore
    public void cleanup(){
        postRepository.deleteAll();
    }

    //게시글 추가
    @Test
    public void createPost(){
        String title = "createTestTitle";
        String contents = "cerateTestContents";
        Post post = postRepository.save(Post.builder()
                .title(title)
                .contents(contents)
                .build());

        assertThat(post.getTitle()).isEqualTo(title);
        assertThat(post.getContents()).isEqualTo(contents);
    }

    //게시글 목록 조회
    @Test
    public void getPostList(){
        String title = "test title";
        String contents = "test contents";
        for(int i=0; i<10; i++){
            postRepository.save(Post.builder()
                    .title(title)
                    .contents(contents)
                    .build());

        }

        List<Post> postsList =  postRepository.findAll();
        assertThat(postsList.size()>=10);
    }

    //특정 게시글 조회
   @Test
   public void getPost(){
        String title = "test title";
        String contents = "test contents";
        postRepository.save(Post.builder()
                .title(title)
                .contents(contents)
                .build());

        Optional<Post> post = postRepository.findById(1L);

        assertThat(post.get().getTitle()).isEqualTo(title);
        assertThat(post.get().getContents()).isEqualTo(contents);
    }

    //특정 게시글 수정
    @Test
    public void updatePost(){
        String title = "createTestTitle";
        String contents = "cerateTestContents";
        Post createPost = postRepository.save(Post.builder()
                .title(title)
                .contents(contents)
                .build());

        title = "updateTestTitle";
        contents = "updateTestContents";

        Post updatePost = postRepository.save(Post.builder()
                .postId(createPost.getPostId())
                .title(title)
                .contents(contents)
                .build());

        assertThat(updatePost.getTitle()).isEqualTo(title);
        assertThat(updatePost.getContents()).isEqualTo(contents);
    }

    //특정 게시글 삭제
    @Test
    public void deletePost(){
        String title = "createTestTitle";
        String contents = "cerateTestContents";
        Post createPost = postRepository.save(Post.builder()
                .title(title)
                .contents(contents)
                .build());

        Post post = Post.builder().postId(createPost.getPostId()).build();
        postRepository.delete(post);

        Optional<Post> findPost = postRepository.findById(createPost.getPostId());
        assertThat(findPost).isEmpty();
    }

}
```
