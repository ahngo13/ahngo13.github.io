---
title: 도커(Docker) + 엘라스틱 서치(Elastic Search) ELK 스택 디플로이 하기
layout: post
date: 2020-09-07 17:55:00 +0300
description: Elasticsearch, Logstash, Kibana 를 통칭
img:  # Add image post (optional)
fig-caption: # Add figcaption (optional)
tags: [도커, 엘라스틱서치, ELK, docker, elasticsearch]
---

## ELK 스택이란?

- Elasticsearch, Logstash, Kibana 를 통칭

### ElasticSearch : JSON 기반의 분산형 오픈 소스 검색 및 분석 엔진, 주로 REST API로 처리

### Logstash : 여러 소스에서 동시에 데이터를 수집하여 변환한 후 `stash`(엘라스틱 서치와 같은)로 전송하는 서버 사이드 데이터 처리 파이프 라인

### Kibana : 사용자가 엘라스틱 서치에서 차트와 그래프를 이용해 데이터를 시각화 할 수 있게 함

## elastic search, kibana, logstash 이미지 pull 받기

```bash
[root@localhost test]# docker pull docker.elastic.co/elasticsearch/elasticsearch:7.3.1
[root@localhost test]# docker pull docker.elastic.co/kibana/kibana:7.3.1
[root@localhost test]# docker pull docker.elastic.co/logstash/logstash:7.3.1
```

## 엘라스틱 서치 커스텀 빌드

- 한국어 분석기 플러그인인 `nori` 를 함께 설치하기 위해 DockerFile로 커스텀 빌드함

```bash
//Dockerfile 생성
vi Dockerfile

//Dockerfile 내용
FROM elasticsearch:7.3.1

RUN /usr/share/elasticsearch/bin/elasticsearch-plugin install --batch analysis-nori

//elasticsearch-custom이라는 태그로 커스텀 빌드 (default는 elasticsearch)
[root@localhost elk]# docker build --tag elasticsearch-custom .
```

## 컨테이너 실행

- 엘리스틱 서치 : 커스텀 빌드하였으므로 elasticsearch-custom의 이름으로 지정하여 컨테이너를 올려줌. (JVM의 Heap 메모리를 설정할 수 있는 -e ES_JAVA_OPTS="-Xms16g -Xmx16g"는 기억)
- 키바나 : pull 받은 이미지에 5601 포트를 지정하여 컨테이너를 올려줌.
- 로그스태시 : pull 받은 이미지에 5044 포트를 지정하여 컨테이너를 올려줌.
- 커맨드 뒤에 로그가 출력되는 것이 불편하다면 `/dev/null 2>&1` 를 붙여줌.

```bash
[root@localhost elk]# docker run -p 9200:9200 -p 9300:9300 elk-e "discovery.type=single-node" elasticsearch-custom
[root@localhost elk]# docker run -d --link elk-e:elasticsearch-custom --name elk-k -p 5601:5601 docker.elastic.co/kibana/kibana:7.3.1
[root@localhost elk]# docker run -d --link elk-e:elasticsearch-custom --name elk-l -p 5044:5044 docker.elastic.co/logstash/logstash:7.3.1
```

## 컨테이너 프로세스 확인

```bash
[root@localhost elk]# docker container ps
CONTAINER ID        IMAGE                                       COMMAND                  CREATED             STATUS              PORTS                                            NAMES
c07c91e993f6        docker.elastic.co/logstash/logstash:7.3.1   "/usr/local/bin/dock…"   5 minutes ago       Up 5 minutes        0.0.0.0:5044->5044/tcp, 9600/tcp                 elk-l
f2e06e2e88e6        docker.elastic.co/kibana/kibana:7.3.1       "/usr/local/bin/dumb…"   6 minutes ago       Up 6 minutes        0.0.0.0:5601->5601/tcp                           elk-k
79ec3b09b257        elasticsearch-custom                        "/usr/local/bin/dock…"   10 minutes ago      Up 10 minutes       0.0.0.0:9200->9200/tcp, 0.0.0.0:9300->9300/tcp   elk-e
```

## elk-k config 수정

- elasticsearch-custom으로 빌드했기 때문에 설정 변경 필요

```bash
[root@localhost elk]# docker container exec -it elk-k bash
bash-4.2$ vi config/kibana.yml

# ** THIS IS AN AUTO-GENERATED FILE **
#

# Default Kibana configuration for docker target
server.name: kibana
server.host: "0"
elasticsearch.hosts: [ "http://elasticsearch-custom:9200" ] //변경할 부분
xpack.monitoring.ui.container.elasticsearch.enabled: true

//수정을 완료했다면 쉘에서 빠져나온다.
bash-4.2$ exit

//elk-k 재시작
[root@localhost elk]# docker container restart elk-k
elk-k
```

## logstash config 수정

- logstash도 위와 동일하게 config를 수정해준다.

```bash
[root@localhost elk]# docker exec -it elk-l bash
bash-4.2$ vi config/logstash.yml

http.host: "0.0.0.0"
xpack.monitoring.elasticsearch.hosts: [ "http://elasticsearch-custom:9200" ] //수정할 부분

//수정을 완료했다면 쉘에서 빠져나온다.
bash-4.2$ exit

//elk-l 재시작
[root@localhost elk]# docker container restart elk-l
elk-l
```

## 각 컨테이너의 포트 접속

![/assets/img/elk1.png](/assets/img/elk1.png)

![/assets/img/elk2.png](/assets/img/elk2.png)

## 컨테이너 쉘 실행 명령어

- 엘라스틱 서치 : `docker exec -it elk-e bash`
- 로그 스태시 : `docker exec -it elk-l bash`
- 키바나 : `docker exec -it elk-k bash`

```bash
[root@localhost elk]# docker exec -it elk-e bash
[root@79ec3b09b257 elasticsearch]# exit
exit
[root@localhost elk]# docker exec -it elk-l bash
bash-4.2$ exit
exit
[root@localhost elk]# docker exec -it elk-k bash
bash-4.2$ exit
exit
```

## 컨테이너 로그 확인

- 엘라스틱 서치 : `docker container logs elk-e`
- 로그 스태시 : `docker container logs elk-l`
- 키바나 : `docker container logs elk-k`

```bash
[root@localhost elk]# docker container logs elk-e
[root@localhost elk]# docker container logs elk-l
[root@localhost elk]# docker container logs elk-k
```

## 컨테이너 중지, 삭제

- 엘라스틱 서치 중지 : `docker container stop elk-e`
- 로그 스태시 중지 : `docker container stop elk-l`
- 키바나 중지 : `docker container stop elk-k`
- 엘라스틱 서치 삭제 : `docker container rm elk-e`
- 로그 스태시 삭제 : `docker container rm elk-e`
- 키바나 삭제 : `docker container rm elk-e`

```bash
[root@localhost elk]# docker container stop elk-e
[root@localhost elk]# docker container stop elk-l
[root@localhost elk]# docker container stop elk-k

[root@localhost elk]# docker container rm elk-e
[root@localhost elk]# docker container rm elk-l
[root@localhost elk]# docker container rm elk-k
```

## 컨테이너 프로세스 체크

```bash
docker container ps
```
