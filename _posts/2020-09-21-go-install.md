---
title: Go 설치 및 실행 테스트
layout: post
date: '2020-09-21 17:58:00 +0300'
description: Go 설치 및 실행 테스트
img: null
fig-caption: null
tags:
- go
- go설치
- goinstall
---

[https://golang.org/](https://golang.org/)

다운로드에 들어가서 본인의 운영체제에 맞는 것으로 설치한다.

(필자는 Windows 운영체제 기준으로 설치)

![/assets/img/2020-09-21_09h22_52.png](/assets/img/2020-09-21_09h22_52.png)

윈도우 버전 기준 msi 파일을 받아 설치하게 되는데 여기에서 기본적으로 `C:\go\bin` 기준으로 환경변수를 추가한다. (경로를 기본으로 설정하지 않을 경우 환경변수를 따로 변경해주어야할 수 있다고 함)

진짜 환경변수를 설정해주는게 맞는지 궁금해서 한번 들어가봤더니 아래와 같이 맨 끝에 설정 되어있는 것을 확인할 수 있었다.

![/assets/img/2020-09-21_09h31_04.png](/assets/img/2020-09-21_09h31_04.png)

그러면 go가 정상적으로 동작하는지 작업 폴더를 만들어 테스트 하도록 하겠다.

필자는 `C:\GoApp` 에 `bin, pkg, src` 3가지 폴더를 만들어주었다.

- bin : go에서 사용하는 명령어 저장
- pkg : go get으로 다운받은 패키지 저장
- src : go 파일 소스

작업 폴더를 만들어 주었다면 사용자 환경변수를 수정해주자. 기존에 `C:\Users\admin\go` 로 되어있으니 이것을 변경해서 사용하도록 하자. 필자는 물론 `C:\GoApp` 로 변경해주었다.

![/assets/img/2020-09-21_09h41_35.png](/assets/img/2020-09-21_09h41_35.png)

수정을 완료했다면 잘 세팅이 되었는지 확인해준다. 명령 프롬프트 창을 열어서 `go env` 명령어를 입력하면 GO 관련된 환경 변수 설정 리스트를 확인할 수 있다.

![/assets/img/2020-09-21_09h48_48.png](/assets/img/2020-09-21_09h48_48.png)

아래와 같이 시스템 환경변수에서 path에 `%GOPATH%` 처럼 하나 더 추가해준다.

![/assets/img/2020-09-21_10h47_11.png](/assets/img/2020-09-21_10h47_11.png)

필자는 IDE를 Microsoft Visual Studio Code를 사용하도록 하겠다. 편집기를 열어 해당 작업 폴더를 열어주고 src 폴더 안에 `hello.go` 파일을 만들어 주면 우측 하단에 뭔가 설치하라고 뜬다. 모두 설치해주자. (2번 정도 설치할거냐고 물어볼 것이다)

![/assets/img/2020-09-21_09h52_34.png](/assets/img/2020-09-21_09h52_34.png)

아래의 필요한 go tool과 코드들을 설치해준다. (물론 git이 설치되어있어야 설치가능하다)

```bash
go get -u -v github.com/nsf/gocode
go get -u -v github.com/rogpeppe/godef
go get -u -v github.com/zmb3/gogetdoc
go get -u -v github.com/golang/lint/golint
go get -u -v github.com/lukehoban/go-outline
go get -u -v sourcegraph.com/sqs/goreturns
go get -u -v golang.org/x/tools/cmd/gorename
go get -u -v github.com/tpng/gopkgs
go get -u -v github.com/newhook/go-symbols
go get -u -v golang.org/x/tools/cmd/guru
go get -u -v github.com/cweill/gotests/...
go get -u -v golang.org/x/tools/cmd/godoc
go get -u -v github.com/fatih/gomodifytags

## go debugger 설치
go get github.com/derekparker/delve/cmd/dlv
```

설치가 완료되었으면 `hello.go` 파일에 아래와 같이 작성해준다.

```go
package main

import "fmt"

func main() {
	fmt.Println("Hello, World!!!")
	fmt.Println("안녕! Go 언어야!!")
}
```

`go run hello.go` 로 실행한 후 결과를 확인한다.

```bash
S C:\GoApp\src\hello> go run .\hello.go
Hello, World!!!
안녕! Go 언어야!
```

![/assets/img/2020-09-21_11h05_20.png](/assets/img/2020-09-21_11h05_20.png)
