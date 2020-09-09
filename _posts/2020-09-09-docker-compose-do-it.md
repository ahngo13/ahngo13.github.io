---
title: 도커 컴포즈(Docker Compose) 컨테이너, 네트워크, 볼륨 실습
layout: post
date: 2020-09-08 17:55:00 +0300
description: Compose 설치 (CentOS 7 minimal 기준)
img:  # Add image post (optional)
fig-caption: # Add figcaption (optional)
tags: [도커, dockercompose, 도커컴포즈, docker-compose.yml]
---

# Compose 설치 (CentOS 7 minimal 기준)

```bash
yum install -y yum-utils device-mapper-persistent-data lvm2
yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo
yum install docker-ce
systemctl start docker

//도커 컴포즈 버전 확인
[root@localhost ~]# docker-compose --version
docker-compose version 1.27.0, build 980ec85b
```

# 도커 컴포즈 기본 사용법

## docker-compose.yml 파일 작성

```bash
vi docker-compose.yml

//docker-compose.yml 파일 내용
version: "3"
services:
  echo:
    image: centos:7
    ports:
      - 9000:8080
```

## docker-compose 실행

```bash
docker-compose up -d // -d 옵션 : 백그라운드 실행
```

## docker-compose 실행 상태 확인

```bash
[root@localhost dockertest]# docker-compose ps
      Name           Command    State    Ports
----------------------------------------------
dockertest_echo_1   /bin/bash   Exit 0
```

# CentOS, Apache, PHP, MySQL 환경 구성

## 파일 구조

```bash
dockertest/
   ├─ apache-php/
   │  └─ Dockerfile
   ├─ data/
   ├─ docker-compose.yml
   ├─ mysql/
   │   ├─ docker-entrypoint.sh
   │   └─ Dockerfile
   │   └─ healthcheck.sh
   └─ www/
      └─ html/
          └─ test.php
```

## CentOS Apache 웹서버(PHP) Dockerfile

```bash
FROM centos:7

# Install Apache
RUN yum -y update
RUN yum -y install httpd httpd-tools

# Install EPEL Repo
RUN rpm -Uvh https://dl.fedoraproject.org/pub/epel/epel-release-latest-7.noarch.rpm \
 && rpm -Uvh http://rpms.remirepo.net/enterprise/remi-release-7.rpm

# Install PHP
RUN yum --enablerepo=remi-php73 -y install php php-bcmath php-cli php-common php-gd php-intl php-ldap php-mbstring \
    php-mysqlnd php-pear php-soap php-xml php-xmlrpc php-zip

# Update Apache Configuration
RUN sed -E -i -e '/<Directory "\/var\/www\/html">/,/<\/Directory>/s/AllowOverride None/AllowOverride All/' /etc/httpd/conf/httpd.conf
RUN sed -E -i -e 's/DirectoryIndex (.*)$/DirectoryIndex index.php \1/g' /etc/httpd/conf/httpd.conf

EXPOSE 80

# Start Apache
CMD ["/usr/sbin/httpd","-D","FOREGROUND"]
```

## MySQL DB 서버 Dockerfile

```bash
FROM oraclelinux:7-slim

ARG MYSQL_SERVER_PACKAGE=mysql-community-server-minimal-8.0.19
ARG MYSQL_SHELL_PACKAGE=mysql-shell-8.0.19

# Install server
RUN yum install -y https://repo.mysql.com/mysql-community-minimal-release-el7.rpm \
        https://repo.mysql.com/mysql-community-release-el7.rpm \
    && yum-config-manager --enable mysql80-server-minimal \
    && yum install -y \
        $MYSQL_SERVER_PACKAGE \
        $MYSQL_SHELL_PACKAGE \
        libpwquality \
    && yum clean all \
    && mkdir /docker-entrypoint-initdb.d

VOLUME /var/lib/mysql

COPY docker-entrypoint.sh /entrypoint.sh
COPY healthcheck.sh /healthcheck.sh

RUN chmod +x /entrypoint.sh
RUN chmod +x /healthcheck.sh

ENTRYPOINT ["/entrypoint.sh"]
HEALTHCHECK CMD /healthcheck.sh
EXPOSE 3306 33060
CMD ["mysqld"]
```

## docker-entrypoint.sh

```php
#!/bin/bash
# Copyright (c) 2017, Oracle and/or its affiliates. All rights reserved.
#
# This program is free software; you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation; version 2 of the License.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License
# along with this program; if not, write to the Free Software
# Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA  02110-1301 USA
set -e

echo "[Entrypoint] MySQL Docker Image 8.0.19-1.1.15"
# Fetch value from server config
# We use mysqld --verbose --help instead of my_print_defaults because the
# latter only show values present in config files, and not server defaults
_get_config() {
	local conf="$1"; shift
	"$@" --verbose --help 2>/dev/null | grep "^$conf" | awk '$1 == "'"$conf"'" { print $2; exit }'
}

# If command starts with an option, prepend mysqld
# This allows users to add command-line options without
# needing to specify the "mysqld" command
if [ "${1:0:1}" = '-' ]; then
	set -- mysqld "$@"
fi

if [ "$1" = 'mysqld' ]; then
	# Test that the server can start. We redirect stdout to /dev/null so
	# only the error messages are left.
	result=0
	output=$("$@" --validate-config) || result=$?
	if [ ! "$result" = "0" ]; then
		echo >&2 '[Entrypoint] ERROR: Unable to start MySQL. Please check your configuration.'
		echo >&2 "[Entrypoint] $output"
		exit 1
	fi

	# Get config
	DATADIR="$(_get_config 'datadir' "$@")"
	SOCKET="$(_get_config 'socket' "$@")"

	if [ -n "$MYSQL_LOG_CONSOLE" ] || [ -n "console" ]; then
		# Don't touch bind-mounted config files
		if ! cat /proc/1/mounts | grep "etc/my.cnf"; then
			sed -i 's/^log-error=/#&/' /etc/my.cnf
		fi
	fi

	if [ ! -d "$DATADIR/mysql" ]; then
		# If the password variable is a filename we use the contents of the file. We
		# read this first to make sure that a proper error is generated for empty files.
		if [ -f "$MYSQL_ROOT_PASSWORD" ]; then
			MYSQL_ROOT_PASSWORD="$(cat $MYSQL_ROOT_PASSWORD)"
			if [ -z "$MYSQL_ROOT_PASSWORD" ]; then
				echo >&2 '[Entrypoint] Empty MYSQL_ROOT_PASSWORD file specified.'
				exit 1
			fi
		fi
		if [ -z "$MYSQL_ROOT_PASSWORD" -a -z "$MYSQL_ALLOW_EMPTY_PASSWORD" -a -z "$MYSQL_RANDOM_ROOT_PASSWORD" ]; then
			echo >&2 '[Entrypoint] No password option specified for new database.'
			echo >&2 '[Entrypoint]   A random onetime password will be generated.'
			MYSQL_RANDOM_ROOT_PASSWORD=true
			MYSQL_ONETIME_PASSWORD=true
		fi
		mkdir -p "$DATADIR"
		chown -R mysql:mysql "$DATADIR"

		echo '[Entrypoint] Initializing database'
		"$@" --initialize-insecure
		echo '[Entrypoint] Database initialized'

		"$@" --daemonize --skip-networking --socket="$SOCKET"

		# To avoid using password on commandline, put it in a temporary file.
		# The file is only populated when and if the root password is set.
		PASSFILE=$(mktemp -u /var/lib/mysql-files/XXXXXXXXXX)
		install /dev/null -m0600 -omysql -gmysql "$PASSFILE"
		# Define the client command used throughout the script
		# "SET @@SESSION.SQL_LOG_BIN=0;" is required for products like group replication to work properly
		mysql=( mysql --defaults-extra-file="$PASSFILE" --protocol=socket -uroot -hlocalhost --socket="$SOCKET" --init-command="SET @@SESSION.SQL_LOG_BIN=0;")

		if [ ! -z "" ];
		then
			for i in {30..0}; do
				if mysqladmin --socket="$SOCKET" ping &>/dev/null; then
					break
				fi
				echo '[Entrypoint] Waiting for server...'
				sleep 1
			done
			if [ "$i" = 0 ]; then
				echo >&2 '[Entrypoint] Timeout during MySQL init.'
				exit 1
			fi
		fi

		mysql_tzinfo_to_sql /usr/share/zoneinfo | "${mysql[@]}" mysql
		
		if [ ! -z "$MYSQL_RANDOM_ROOT_PASSWORD" ]; then
			MYSQL_ROOT_PASSWORD="$(pwmake 128)"
			echo "[Entrypoint] GENERATED ROOT PASSWORD: $MYSQL_ROOT_PASSWORD"
		fi
		if [ -z "$MYSQL_ROOT_HOST" ]; then
			ROOTCREATE="ALTER USER 'root'@'localhost' IDENTIFIED BY '${MYSQL_ROOT_PASSWORD}';"
		else
			ROOTCREATE="ALTER USER 'root'@'localhost' IDENTIFIED BY '${MYSQL_ROOT_PASSWORD}'; \
			CREATE USER 'root'@'${MYSQL_ROOT_HOST}' IDENTIFIED BY '${MYSQL_ROOT_PASSWORD}'; \
			GRANT ALL ON *.* TO 'root'@'${MYSQL_ROOT_HOST}' WITH GRANT OPTION ; \
			GRANT PROXY ON ''@'' TO 'root'@'${MYSQL_ROOT_HOST}' WITH GRANT OPTION ;"
		fi
		"${mysql[@]}" <<-EOSQL
			DELETE FROM mysql.user WHERE user NOT IN ('mysql.infoschema', 'mysql.session', 'mysql.sys', 'root') OR host NOT IN ('localhost');
			CREATE USER 'healthchecker'@'localhost' IDENTIFIED BY 'healthcheckpass';
			${ROOTCREATE}
			FLUSH PRIVILEGES ;
		EOSQL
		if [ ! -z "$MYSQL_ROOT_PASSWORD" ]; then
			# Put the password into the temporary config file
			cat >"$PASSFILE" <<EOF
[client]
password="${MYSQL_ROOT_PASSWORD}"
EOF
			#mysql+=( -p"${MYSQL_ROOT_PASSWORD}" )
		fi

		if [ "$MYSQL_DATABASE" ]; then
			echo "CREATE DATABASE IF NOT EXISTS \`$MYSQL_DATABASE\` ;" | "${mysql[@]}"
			mysql+=( "$MYSQL_DATABASE" )
		fi

		if [ "$MYSQL_USER" -a "$MYSQL_PASSWORD" ]; then
			echo "CREATE USER '"$MYSQL_USER"'@'%' IDENTIFIED BY '"$MYSQL_PASSWORD"' ;" | "${mysql[@]}"

			if [ "$MYSQL_DATABASE" ]; then
				echo "GRANT ALL ON \`"$MYSQL_DATABASE"\`.* TO '"$MYSQL_USER"'@'%' ;" | "${mysql[@]}"
			fi

		elif [ "$MYSQL_USER" -a ! "$MYSQL_PASSWORD" -o ! "$MYSQL_USER" -a "$MYSQL_PASSWORD" ]; then
			echo '[Entrypoint] Not creating mysql user. MYSQL_USER and MYSQL_PASSWORD must be specified to create a mysql user.'
		fi
		echo
		for f in /docker-entrypoint-initdb.d/*; do
			case "$f" in
				*.sh)  echo "[Entrypoint] running $f"; . "$f" ;;
				*.sql) echo "[Entrypoint] running $f"; "${mysql[@]}" < "$f" && echo ;;
				*)     echo "[Entrypoint] ignoring $f" ;;
			esac
			echo
		done

		# When using a local socket, mysqladmin shutdown will only complete when the server is actually down
		mysqladmin --defaults-extra-file="$PASSFILE" shutdown -uroot --socket="$SOCKET"
		rm -f "$PASSFILE"
		unset PASSFILE
		echo "[Entrypoint] Server shut down"

		# This needs to be done outside the normal init, since mysqladmin shutdown will not work after
		if [ ! -z "$MYSQL_ONETIME_PASSWORD" ]; then
			if [ -z "yes" ]; then
				echo "[Entrypoint] User expiration is only supported in MySQL 5.6+"
			else
				echo "[Entrypoint] Setting root user as expired. Password will need to be changed before database can be used."
				SQL=$(mktemp -u /var/lib/mysql-files/XXXXXXXXXX)
				install /dev/null -m0600 -omysql -gmysql "$SQL"
				if [ ! -z "$MYSQL_ROOT_HOST" ]; then
					cat << EOF > "$SQL"
ALTER USER 'root'@'${MYSQL_ROOT_HOST}' PASSWORD EXPIRE;
ALTER USER 'root'@'localhost' PASSWORD EXPIRE;
EOF
				else
					cat << EOF > "$SQL"
ALTER USER 'root'@'localhost' PASSWORD EXPIRE;
EOF
				fi
				set -- "$@" --init-file="$SQL"
				unset SQL
			fi
		fi

		echo
		echo '[Entrypoint] MySQL init process done. Ready for start up.'
		echo
	fi

	# Used by healthcheck to make sure it doesn't mistakenly report container
	# healthy during startup
	# Put the password into the temporary config file
	touch /healthcheck.cnf
	cat >"/healthcheck.cnf" <<EOF
[client]
user=healthchecker
socket=${SOCKET}
password=healthcheckpass
EOF
	touch /mysql-init-complete
	chown -R mysql:mysql "$DATADIR"
	echo "[Entrypoint] Starting MySQL 8.0.19-1.1.15"
fi

exec "$@"
```

## healthcheck.sh

```php
#!/bin/bash
# Copyright (c) 2017, Oracle and/or its affiliates. All rights reserved.
#
# This program is free software; you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation; version 2 of the License.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License
# along with this program; if not, write to the Free Software
# Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA  02110-1301 USA

# The mysql-init-complete file is touched by the entrypoint file before the
# main server process is started
if [ -f /mysql-init-complete ]; # The entrypoint script touches this file
then # Ping server to see if it is ready
  mysqladmin --defaults-extra-file=/healthcheck.cnf ping
else # Initialization still in progress
  exit 1
fi
```

## test.php

```php
<?php
$host = 'db';
$user = 'root';
$pass = 'root';

$mysqli = new mysqli($host, $user, $pass);

if (!$mysqli->connect_error) {
    echo 'Connection successful!';
}  else {
    echo 'Error (' . $mysqli->connect_errno . ') ' . $mysqli->connect_error;
}

$mysqli->close();
?>
```

## docker-compose.yml

```yaml
## docker-compose 문서의 규격 버전 (3이라고 적으면 3으로 시작하는 최신버전 사용)
version: "3.7"
## 실행할 서비스 정의
services:
  ## web이라는 서비스를 정의
  web:
    ## 특정 이미지 대신 Dockerfile을 활용한 이미지 빌드 옵션 추가
    build:
      context: ./apache-php
      dockerfile: Dockerfile
    ## 종속성 추가 db가 먼저 실행되어야 함
    depends_on:
      - db
    ## 호스트 4000 포트 : 컨테이너 80 포트
    ports:
      - "4000:80"
    ## 볼륨 설정 : [호스트 공유 경로]:[컨테이너 공유 경로]
    volumes:
      - ./www:/var/www
  ## db라는 서비스를 정의
  db:
    ## 특정 이미지 대신 Dockerfile을 활용한 이미지 빌드 옵션 추가
    build:
      context: ./mysql
      dockerfile: Dockerfile
    ## 환경변수 설정(docker run 명령어 -e에 있던 내용들)
    environment:
      - MYSQL_ROOT_PASSWORD=root
      - MYSQL_ROOT_HOST=%
    ## 호스트 3306 포트 : 컨테이너 3306 포트
    ports:
      - "3306:3306"
    ## 볼륨 설정 : [호스트 공유 경로]:[컨테이너 공유 경로]
    volumes:
      - ./data:/var/lib/mysql
    ## (docker run 마지막 명령어 부분과 같음)
    command: --default-authentication-plugin=mysql_native_password
```

## docker-compose 실행

```bash
docker-compose up -d
```

## 정상 동작 확인

![/assets/img/2020-09-09_10h45_26.png](/assets/img/2020-09-09_10h45_26.png)

# docker-compose 네트워크

## 디폴트 네트워크

- Docker Compose는 하나의 디폴트 네트워크에 모든 컨테이너를 연결함
- 디폴트 네트워크의 이름은 위치한 디렉토리 이름 뒤에 `_default` 붙음
- `docker-compose up -d` , `docker-compose down` 해보면 쉽게 알 수 있음

```bash
[root@localhost dockertest]# docker-compose down
Stopping dockertest_web_1 ... done
Stopping dockertest_db_1  ... done
WARNING: Found orphan containers (dockertest_echo_1) for this project. If you removed or renamed this service in your compose file, you can run this command with the --remove-orphans flag to clean it up.
Removing dockertest_web_1 ... done
Removing dockertest_db_1  ... done
## 디렉토리명이 deckertest임. 따라서 dockertest_default가 디폴트 네트워크 이름이 됨.
Removing network dockertest_default
```

- 네트워크 목록 조회 : `docker network ls`

```bash
[root@localhost dockertest]# docker network ls
NETWORK ID          NAME                DRIVER              SCOPE
00745070e427        bridge              bridge              local
54246cd5feb1        host                host                local
c66f0618ca7e        none                null                local
```

## 컨테이너 간 통신

- 디폴트 네트워크 안 컨테이너 간 통신에서는 서비스의 이름이 호스트명으로 사용
- docker-compose.yml 파일 참고

```yaml
services:
  ## web이라는 서비스를 정의
  web:
  ...
    ## 호스트 컴퓨터로 접속할 때는 4000 포트, 컨테이너로 접속할 때는 80 포트 
    ports:
      - "4000:80"
  ...
  ## db라는 서비스를 정의
  db :
  ...
    ## 호스트 컴퓨터로 접속할 떄는 3306 포트, 컨테이너로 접속할 때는 3306 포트
    ports:
      - "3306:3306"
  ...
```

```bash
## 도커 컴포즈가 내려가 있다면 다시 올리기
[root@localhost dockertest]# docker-compose up -d
Creating network "dockertest_default" with the default driver
WARNING: Found orphan containers (dockertest_echo_1) for this project. If you removed or renamed this service in your compose file, you can run this command with the --remove-orphans flag to clean it up.
Creating dockertest_db_1 ... done
Creating dockertest_web_1 ... done

## web이라는 이름의 서비스에서 db라는 이름의 서비스에 ping을 날린다.
## db 컨테이너의 IP가 172.20.0.2라는 것을 알 수 있음.
[root@localhost dockertest]# docker-compose exec web ping db
PING db (172.20.0.2) 56(84) bytes of data.
64 bytes from dockertest_db_1.dockertest_default (172.20.0.2): icmp_seq=1 ttl=64 time=0.044 ms
64 bytes from dockertest_db_1.dockertest_default (172.20.0.2): icmp_seq=2 ttl=64 time=0.130 ms
64 bytes from dockertest_db_1.dockertest_default (172.20.0.2): icmp_seq=3 ttl=64 time=0.046 ms
64 bytes from dockertest_db_1.dockertest_default (172.20.0.2): icmp_seq=4 ttl=64 time=0.048 ms
```

- 호스트 컴퓨터에서 web 서비스 컨테이너 접속

```yaml
[root@localhost dockertest]# curl -I localhost:4000/test.php
HTTP/1.1 200 OK
Date: Wed, 09 Sep 2020 04:52:14 GMT
Server: Apache/2.4.6 (CentOS) PHP/7.3.22
X-Powered-By: PHP/7.3.22
Content-Type: text/html; charset=UTF-8
```

- 다른 컨테이너에서 web 서비스 컨테이너 접속
    - docker-compose.yml 파일에 최하단에 해당 내용 추가

    ```yaml
    centos:
        image: centos:7
        ## 하단 내용을 안 쓰면 바로 종료되는 듯.
        stdin_open: true
        tty: true
    ```

    - docker-compose 내렸다 올린 후 컨테이너 접속

    ```yaml
    [root@localhost dockertest]# docker-compose down
    [root@localhost dockertest]# docker-compose up -d

    [root@localhost dockertest]# docker-compose exec centos curl -I web/test.php
    HTTP/1.1 200 OK
    Date: Wed, 09 Sep 2020 04:51:22 GMT
    Server: Apache/2.4.6 (CentOS) PHP/7.3.22
    X-Powered-By: PHP/7.3.22
    Content-Type: text/html; charset=UTF-8
    ```

## 커스텀 네트워크 추가

- docker-compose.yml 파일 수정 (`db` 서비스는 디폴트 네트워크에만 연결되지만 `web` 서비스는 `our_net` 네트워크에도 연결됨)

```yaml
version: "3.7"
services:
  web:
    build:
      context: ./apache-php
      dockerfile: Dockerfile
    depends_on:
      - db
    ports:
      - "4000:80"
    volumes:
      - ./www:/var/www
    networks: ## 네트워크 추가
      - default
      - our_net
  db:
    build:
      context: ./mysql
      dockerfile: Dockerfile
    environment:
      - MYSQL_ROOT_PASSWORD=root
      - MYSQL_ROOT_HOST=%
    ports:
      - "3306:3306"
    volumes:
      - ./data:/var/lib/mysql
    command: --default-authentication-plugin=mysql_native_password
  centos:
    image: centos:7
    stdin_open: true
    tty: true
networks: ## 네트워크 추가
  our_net:
    driver: bridge
```

- `docker-compose up -d` 후 네트워크 리스트 조회

```bash
[root@localhost dockertest]# docker-compose up -d

[root@localhost dockertest]# docker network ls
NETWORK ID          NAME                 DRIVER              SCOPE
30bc74ec733e        bridge               bridge              local
a79e77e15b90        dockertest_default   bridge              local
e07ee08147b6        dockertest_our_net   bridge              local
54246cd5feb1        host                 host                local
c66f0618ca7e        none                 null                local
```

## 외부 네트워크 사용

- Docker Compose가 제공하는 디폴트 네트워크 이외에 외부에 생성한 다른 네트워크도 사용가능

```bash
## our_net이라는 네트워크 생성
[root@localhost dockertest]# docker network create our_net
dbf31d28767d0280c85cc2fd3148af08dd04986aa290640a3a50c53ecbd361d0

## docker 네트워크 리스트 확인
[root@localhost dockertest]# docker network ls
NETWORK ID          NAME                 DRIVER              SCOPE
30bc74ec733e        bridge               bridge              local
a79e77e15b90        dockertest_default   bridge              local
e07ee08147b6        dockertest_our_net   bridge              local
54246cd5feb1        host                 host                local
c66f0618ca7e        none                 null                local
dbf31d28767d        our_net              bridge              local

## docker-compose.yml 파일 수정
[root@localhost dockertest]# vi docker-compose.yml

version: "3.7"
services:
  web:
    build:
      context: ./apache-php
      dockerfile: Dockerfile
    depends_on:
      - db
    ports:
      - "4000:80"
    volumes:
      - ./www:/var/www
    ## 아까 작업했던 부분은 삭제
  db:
    build:
      context: ./mysql
      dockerfile: Dockerfile
    environment:
      - MYSQL_ROOT_PASSWORD=root
      - MYSQL_ROOT_HOST=%
    ports:
      - "3306:3306"
    volumes:
      - ./data:/var/lib/mysql
    command: --default-authentication-plugin=mysql_native_password
  centos:
    image: centos:7
    stdin_open: true
    tty: true

## 이 부분 수정
networks:
  default:
    external:
      name: our_net

## Docker Compose 재실행
[root@localhost dockertest]# docker-compose up -d
Recreating dockertest_db_1     ... done
Recreating dockertest_centos_1 ... done
Recreating dockertest_web_1    ... done

## 3개의 컨테이너가 our_net에 연결된 것 확인 가능
[root@localhost dockertest]# docker network inspect our_net
[
    {
        "Name": "our_net",
        "Id": "dbf31d28767d0280c85cc2fd3148af08dd04986aa290640a3a50c53ecbd361d0",
        "Created": "2020-09-09T14:12:09.376220231+09:00",
        "Scope": "local",
        "Driver": "bridge",
        "EnableIPv6": false,
        "IPAM": {
            "Driver": "default",
            "Options": {},
            "Config": [
                {
                    "Subnet": "172.23.0.0/16",
                    "Gateway": "172.23.0.1"
                }
            ]
        },
        "Internal": false,
        "Attachable": false,
        "Ingress": false,
        "ConfigFrom": {
            "Network": ""
        },
        "ConfigOnly": false,
        "Containers": {
            "5f327ad099591176eeb72c04a440989404015e1e408ffc6a5fd847394632498a": {
                "Name": "dockertest_centos_1",
                "EndpointID": "491a974176ed082205bcbf16748524d1f5580e57e64cab8506036917df59ad79",
                "MacAddress": "02:42:ac:17:00:04",
                "IPv4Address": "172.23.0.4/16",
                "IPv6Address": ""
            },
            "8c1077320403cd744e1626072bbeabbdde103e204e6edb848de82c1faa304d48": {
                "Name": "dockertest_db_1",
                "EndpointID": "2ddc8678ffadfeae3aef6547be62fc66d74aaa5ba7a65407746f77c61b2e7173",
                "MacAddress": "02:42:ac:17:00:02",
                "IPv4Address": "172.23.0.2/16",
                "IPv6Address": ""
            },
            "c92d9fb055e97c66bafe8fbd92f00e5e981b7f123a3e6fb33123aeece6f803a6": {
                "Name": "dockertest_web_1",
                "EndpointID": "eeee377e9281b6b1ddf68f50b41e60981f94b7e7ed674d2c0d9e0f059b126cd8",
                "MacAddress": "02:42:ac:17:00:03",
                "IPv4Address": "172.23.0.3/16",
                "IPv6Address": ""
            }
        },
        "Options": {},
        "Labels": {}
    }
]
```

# docker-compose 볼륨 실습

- docker-compose.yml 파일에 볼륨 설정을 걸어놓은 것이 있으므로 그것을 토대로 실습

```yaml
## [호스트 공유 경로]:[컨테이너 공유 경로]    
volumes:
      - ./www:/var/www
```

- 호스트에 있는 /www/html/test.php 파일을 동일 경로에 복사 후, 컨테이너에서 정상적으로 공유되는지 확인
- 반대로 컨테이너에 있는 /var/www/html/test.php 파일을 동일 경로에 복사 후, 호스트에서 정상적으로 공유되는지 확인

```bash
## /www/html 경로 이동후 test.php 파일 복사
[root@localhost html]# cd /www/html
[root@localhost html]# cp test.php test2.php

## 실행된 도커 컨테이너 확인 후 접속
[root@localhost html]# docker ps
CONTAINER ID        IMAGE               COMMAND                  CREATED       ORTS                               NAMES
c4aa2a9c4304        dockertest_web      "/usr/sbin/httpd -D …"   25 minutes ago.0.0.0:4000->80/tcp                dockertest_web_1
d15ff45b6a12        dockertest_db       "/entrypoint.sh --de…"   25 minutes ago.0.0.0:3306->3306/tcp, 33060/tcp   dockertest_db_1
[root@localhost html]# docker exec -it c4aa2a9c4304 bash

## 볼륨이 공유된 /var/www안의 html 폴더로 이동
[root@c4aa2a9c4304 www]# cd /var/www/html

## 파일이 하나 늘어남을 확인할 수 있음
[root@c4aa2a9c4304 html]# ls
test.php  test2.php

## 컨테이너에서 test.php을 복제하여 하나 더 생성
[root@c4aa2a9c4304 html]# cp test.php test3.php
[root@c4aa2a9c4304 html]# exit

## 호스트에 해당 파일이 생성되었는지 확인
[root@localhost html]# ls
test.php  test2.php  test3.php
```

※ 참고 사이트

[https://hello-bryan.tistory.com/166](https://hello-bryan.tistory.com/166)

[https://nirsa.tistory.com/80](https://nirsa.tistory.com/80)

[https://www.daleseo.com/docker-compose-networks/](https://www.daleseo.com/docker-compose-networks/)
