---
title: Go Gin Framework 시작하기(설치 및 API 테스트)
layout: post
date: '2020-09-22 17:59:00 +0300'
description: Gin 설치, Gin API 테스트(Querystring, Path parameter...)
img: null
fig-caption: null
tags:
- go
- golang
- gin
- gin프레임워크
- ginapi
---

# 설치 환경

- OS : Window 10 Pro
- Go Version : 1.15.2 windows/amd64

# 공식문서

- [https://github.com/gin-gonic/gin#quick-start](https://github.com/gin-gonic/gin#quick-start)

(공식문서 예제들을 가져왔지만 전부는 아니기 때문에 다른 예제들은 직접 접속해서 참고하기 바란다)

# gin 설치

- 명령 프롬프트가 관리자 모드로 실행을 안해서 설치가 안되는 경우도 있음

```bash
go get -u github.com/gin-gonic/gin
```

# Quick start

- `main.go` 파일 내용

```go
package main

import "github.com/gin-gonic/gin"

func main() {
	r := gin.Default()
	r.GET("/ping", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"message": "pong",
		})
	})
	r.Run() // listen and serve on 0.0.0.0:8080 (for windows "localhost:8080")
}
```

- `go run main.go` 로 서버를 실행시켜 준다.

```bash
[GIN-debug] GET    /ping                     --> main.main.func1 (3 handlers)
[GIN-debug] Environment variable PORT is undefined. Using port :8080 by default
[GIN-debug] Listening and serving HTTP on :8080
[GIN] 2020/09/22 - 17:47:36 | 200 |            0s |             ::1 | GET      "/ping"
```

- Postman으로 `[localhost:8080/ping](http://localhost:8080/ping)` 를 요청해서 결과값 `message:"pong"` 확인

![/assets/img/2020-09-22_17h46_17.png](/assets/img/2020-09-22_17h46_17.png)

# HTTP 메서드 예제

- `GET, POST, PUT, DELETE, PATCH, HEAD, OPTIONS` 해당 HTTP 메서드를 아래와 같이 사용하면 된다는 것을 참고하면 된다. (종류만 확인하고 넘어가면 될 것 같다)

```go
func main() {
	// Creates a gin router with default middleware:
	// logger and recovery (crash-free) middleware
	router := gin.Default()

	router.GET("/someGet", getting)
	router.POST("/somePost", posting)
	router.PUT("/somePut", putting)
	router.DELETE("/someDelete", deleting)
	router.PATCH("/somePatch", patching)
	router.HEAD("/someHead", head)
	router.OPTIONS("/someOptions", options)

	// By default it serves on :8080 unless a
	// PORT environment variable was defined.
	router.Run()
	// router.Run(":3000") for a hard coded port
}
```

# Path 파라미터

- Path 파라미터란 URL 자체 경로에 들어있는 파라미터를 말함

```go
//main 함수 중간에 해당 내용 추가 (ping과 r.Run 사이에 추가하면 됨)
r.GET("/user/:name", func(c *gin.Context) {
	name := c.Param("name")
	c.String(http.StatusOK, "Hello %s", name)
})
```

- Postman으로 `[localhost:8080/user/hamletshu](http://localhost:8080/welcome?lastname=Hamlethsu)` 와 같이 요청을 보낸다. 
(아래와 같은 `Hello Hamlethsu` 결과값을 확인할 수 있다)

![/assets/img/2020-09-22_18h00_47.png](/assets/img/2020-09-22_18h00_47.png)

# Querystring 파라미터

- Querystring 파라미터란 URL 뒤에 물음표를 붙여서 `[http://localhost:8080?lastname=Hamletshu](http://localhost:8080?lastname=Hamletshu)` 이런식으로 넘오는 파라미터를 말함

```go
//main 함수 중간에 해당 내용 추가 (ping과 r.Run 사이에 추가하면 됨)
r.GET("/welcome", func(c *gin.Context) {
	firstname := c.DefaultQuery("firstname", "Guest")
	lastname := c.Query("lastname") // shortcut for c.Request.URL.Query().Get("lastname")

	c.String(http.StatusOK, "Hello %s %s", firstname, lastname)
})
```

- Postman으로 `[localhost:8080/welcome?lastname=Hamlethsu](http://localhost:8080/welcome?lastname=Hamlethsu)` 와 같이 요청을 보낸다. 
(아래와 같은 `Hello Guest Hamlethsu` 결과값을 확인할 수 있다)

![/assets/img/2020-09-22_17h57_15.png](/assets/img/2020-09-22_17h57_15.png)

# Multipart/Urlencoded Form

```go
//main 함수 중간에 해당 내용 추가 (ping과 r.Run 사이에 추가하면 됨)
r.POST("/form_post", func(c *gin.Context) {
	message := c.PostForm("message")
	nick := c.DefaultPostForm("nick", "anonymous")

	c.JSON(200, gin.H{
		"status":  "posted",
		"message": message,
		"nick":    nick,
	})
})
```

- Postman에서 `POST` 방식으로 `form-data` `message` 키 값에 `hellow Go Gin` 값을 파라미터를 보낸다.
(아래와 같은 값들이 넘어오는 것을 확인할 수 있다)

```json
{
    "message": "hellow Go Gin",
    "nick": "anonymous",
    "status": "posted"
}
```

![/assets/img/2020-09-22_18h53_02.png](/assets/img/2020-09-22_18h53_02.png)

# Query + Post Form

- Querystring과 form data를 둘다 보낼 때이다.
- `import "fmt"` 를 해주어야 Printf 함수를 사용할 수 있고 에러가 발생하지 않음

```go
//main 함수 중간에 해당 내용 추가 (ping과 r.Run 사이에 추가하면 됨)
r.POST("/post", func(c *gin.Context) {

	id := c.Query("id")
	page := c.DefaultQuery("page", "0")
	name := c.PostForm("name")
	message := c.PostForm("message")

	fmt.Printf("id: %s; page: %s; name: %s; message: %s", id, page, name, message)
})
```

- Postman에서는 요청을 보내도 별다른 것을 확인할 수 없지만 로그에서 아래와 같은 결과를 확인할 수 있다.

```bash
id: 1234; page: 1; name: manu; message: this_is_great[GIN] 2020/09/22 - 18:30:35 | 200 |            0s |             ::1 | POST     "/post?id=1234&page=1"
```

![/assets/img/2020-09-22_18h30_42.png](/assets/img/2020-09-22_18h30_42.png)

![/assets/img/2020-09-22_18h33_57.png](/assets/img/2020-09-22_18h33_57.png)

# Map as querystring or postform parameters

- `import "fmt"` 를 해주어야 Printf 함수를 사용할 수 있고 에러가 발생하지 않음

```go
r.POST("/post-map", func(c *gin.Context) {

	ids := c.QueryMap("ids")
	names := c.PostFormMap("names")

	fmt.Printf("ids: %v; names: %v", ids, names)
})
```

![/assets/img/2020-09-22_18h52_47.png](/assets/img/2020-09-22_18h52_47.png)

- Postman에서는 요청을 보내도 별다른 것을 확인할 수 없지만 로그에서 아래와 같은 결과를 확인할 수 있다.

```bash
ids: map[a:1234 b:hello]; names: map[][GIN] 2020/09/22 - 18:52:22 | 200 |            0s |             ::1 | POST     "/post-map?ids[a]=1234&ids[b]=hello"
```

![/assets/img/2020-09-22_18h53_01.png](/assets/img/2020-09-22_18h53_01.png)
