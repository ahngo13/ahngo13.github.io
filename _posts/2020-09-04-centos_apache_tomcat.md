---
title: CentOS에서 Apache, Tomcat 설치 및 서버 구동하기
layout: post
date: 2020-09-04 17:30:00 +0300
description: Apache 설치 및 서버 구동
img: 202009041.png # Add image post (optional)
fig-caption: # Add figcaption (optional)
tags: [centos, apache, tomcat]
---

## Apache 설치 및 서버 구동

Apache가 설치되어 있는지 확인

```bash
yum list installed | grep httpd
```

설치되어 있지 않다면 해당 명령어로 설치

```bash
yum install -y httpd
```

설치가 완료되면 방화벽 설정

```bash
[root@localhost ~]# firewall-cmd --permanent --add-service=http
success
[root@localhost ~]# firewall-cmd --permanent --add-service=https
success
[root@localhost ~]# firewall-cmd --reload
success
```

아파치 서비스를 활성화 시키고 부팅시 실행되도록 설정

```bash
[root@localhost ~]# systemctl enable httpd
Created symlink from /etc/systemd/system/multi-user.target.wants/httpd.service to /usr/lib/systemd/system/httpd.service.
```

아파치 서비스 시작

```bash
[root@localhost ~]# systemctl start httpd
```

/var/www/html에 index.html 파일을 생성

```bash
vi /var/www/html
<html>
<head><title>test</title></head>
<body>
        <h1>test</h1>
</body>
</html>
```

해당 서버의 IP 주소를 입력하여 아래와 같은 페이지가 표시되는지 확인

![/assets/img/202009041.png](/assets/img/202009041.png)

## Tomcat 설치 및 서버 구동

Tomcat이 설치되어 있는지 확인

```bash
[root@localhost html]# yum list installed | grep tomcat
```

설치가 되어있지 않다면 해당 명령어로 설치

```bash
[root@localhost html]# yum -y install tomcat*
```

Tomcat의 경우 자바를 설치해주어야 하므로 oracle 사이트에서 rpm 확장자의 자바 경로를 복사해준다.

[https://www.oracle.com/java/technologies/javase-jdk11-downloads.html](https://www.oracle.com/java/technologies/javase-jdk11-downloads.html)

![/assets/img/202009043.png](/assets/img/202009043.png)

 아래의 명령어를 입력해서 설치해준다.

```bash
wget -c [java rpm 파일 설치 URL]
```

파일명에 파라미터까지 따라붙기 때문에 파일명을 간편하게 변경해주고 rpm 파일을 실행해서 설치한다.

```bash
//파일명을 간편하게 변경
[root@localhost html]# mv jdk-11.0.8_linux-x64_bin.rpm?AuthParam=1599197896_eef9f525fd8c466a136075ad6364ec6d jdk-11.0.8_linux-x64_bin.rpm
[root@localhost html]# ls
index.html  jdk-11.0.8_linux-x64_bin.rpm

//rpm 파일 실행
[root@localhost html]# rpm -ivh jdk-11.0.8_linux-x64_bin.rpm
```

설치가 완료되면 방화벽 설정

```bash
[root@localhost html]# firewall-cmd --permanent --add-port=8080/tcp
success
[root@localhost html]# firewall-cmd --reload
success
```

톰캣 서비스 활성화 시키기

```bash
[root@localhost html]# systemctl enable tomcat
Created symlink from /etc/systemd/system/multi-user.target.wants/tomcat.service to /usr/lib/systemd/system/tomcat.service.
```

톰캣 서비스 실행

```bash
[root@localhost html]# systemctl start tomcat
```

정상적으로 실행됨을 확인할 수 있다.

![/assets/img/202009042.png](/assets/img/202009042.png)
