---
title: 깃허브 패키지스(Github Packages)에 도커 이미지(Docker Image) push 하기
layout: post
date: 2020-09-08 17:58:00 +0300
description: 깃허브에 레파지토리를 생성, 이미지에 계정정보와 버전 정보 추가
img:  # Add image post (optional)
fig-caption: # Add figcaption (optional)
tags: [도커, githubpackages, dockerimagepush, docker, dockerimage]
---

# 깃허브에 레파지토리를 생성

- 필자는 `docker-image-push-test` 라는 레파지토리를 생성했다.

# 이미지에 계정정보와 버전 정보 추가

`docker tag [이미지 아이디] docker.pkg.github.com/[깃허브 아이디]/[레파지토리명]/[이미지명]:[버전]`

```bash
## 도커 이미지 확인
[root@localhost dockertest]# docker images
REPOSITORY                                                            TAG                 IMAGE ID            CREATED             SIZE
ahngo13/dockertest_web                                                1                   b4796b3407b5        6 hours ago         683MB
dockertest_web                                                        latest              b4796b3407b5        6 hours ago         683MB
ahngo13/dockertest_db                                                 1                   a18a6ab117c8        6 hours ago         396MB
dockertest_db                                                         latest              a18a6ab117c8        6 hours ago         396MB
centos                                                                7                   7e6257c9f8d8        4 weeks ago         203MB
centos                                                                latest              0d120b6ccaa8        4 weeks ago         215MB
oraclelinux                                                           7-slim              153f8d73287e        7 weeks ago         131MB
alpine                                                                latest              a24bb4013296        3 months ago        5.57MB
hello-world                                                           latest              bf756fb1ae65        8 months ago        13.3kB
## github packages에 올리기 위한 도커 이미지 복제 
[root@localhost dockertest]# docker tag b4796b3407b5  docker.pkg.github.com/ahngo13/pushtest/dockertest_web:1

## 정상적으로 복제된 것을 알 수 있음
[root@localhost dockertest]# docker images
REPOSITORY                                                            TAG                 IMAGE ID            CREATED             SIZE
ahngo13/dockertest_web                                                1                   b4796b3407b5        6 hours ago         683MB
dockertest_web                                                        latest              b4796b3407b5        6 hours ago         683MB
docker.pkg.github.com/ahngo13/docker-image-push-test/dockertest_web   1                   b4796b3407b5        6 hours ago         683MB
docker.pkg.github.com/ahngo13/pushtest/dockertest_web                 1                   b4796b3407b5        6 hours ago         683MB
ahngo13/dockertest_db                                                 1                   a18a6ab117c8        6 hours ago         396MB
dockertest_db                                                         latest              a18a6ab117c8        6 hours ago         396MB
centos                                                                7                   7e6257c9f8d8        4 weeks ago         203MB
centos                                                                latest              0d120b6ccaa8        4 weeks ago         215MB
oraclelinux                                                           7-slim              153f8d73287e        7 weeks ago         131MB
alpine                                                                latest              a24bb4013296        3 months ago        5.57MB
hello-world                                                           latest              bf756fb1ae65        8 months ago        13.3kB
```

# github에서 Personal access token 발급

- [https://github.com/settings/tokens](https://github.com/settings/tokens)
- packages를 사용할 것이기 때문에 아래와 같이 체크하고 키를 발급한다.

![/assets/img/githubpackages1.png](/assets/img/githubpackages1.png)

- 생성된 키를 복사하여 해당 경로에 TOKEN.txt 파일을 생성하여 붙여넣는다.

```bash
[root@localhost dockertest]# vi ~/TOKEN.txt
```

- 해당 명령어를 입력하여 로그인 한다.

```bash
[root@localhost dockertest]# cat ~/TOKEN.txt | docker login https://docker.pkg.github.com -u [깃허브 아이디] --password-stdin
WARNING! Your password will be stored unencrypted in /root/.docker/config.json.
Configure a credential helper to remove this warning. See
https://docs.docker.com/engine/reference/commandline/login/#credentials-store

Login Succeeded
```

# 깃허브 패키지스(github packages)에 push

- `docker push[docker.pkg.github.com/[깃허브 아이디]/[레파지토리명]/[이미지명]:[버전]](http://docker.pkg.github.com/ahngo13/docker-image-push-test/dockertest_web:1)`

```bash
[root@localhost dockertest]# docker push docker.pkg.github.com/ahngo13/docker-image-push-test/dockertest_web:1
The push refers to repository [docker.pkg.github.com/ahngo13/docker-image-push-test/dockertest_web]
47350b732cac: Pushed
64bbbb37a26d: Pushed
01cd95c1d11e: Pushed
e73aa561c1d1: Pushed
564db08562a6: Pushed
52fce1942142: Pushed
613be09ab3c0: Pushed
1: digest: sha256:fc1949e4ccfe22473bd52c693a97e471481c9dc06c06d3a7f5fdfa96bac7f5aa size: 1792
```

# 깃허브 패키지스(github packages)에 업로드 확인

![/assets/img/githubpackages2.png](/assets/img/githubpackages2.png)
