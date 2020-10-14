---
title: ElasticSearch 한글 형태소 분석기 아리랑(Arirang) 플러그인 설치 및 사용법
layout: post
date: '2020-10-14 18:00:00 +0300'
description: ElasticSearch 한글 형태소 분석기 아리랑(Arirang) 플러그인 설치 및 사용법
img: null
fig-caption: null
tags:
- es
- elasticsearch
- arirang
- arirang플러그인
- 아리랑플러그인
- 엘라스틱서치
- 엘라스틱서치한글형태소분석기
---

# 실습 환경

- OS : CentOS 7
- docker-compose
- 3 node

# 형태소 분석

- 한글 문장에서 의미가 있는 최소 단위를 분석하는 것

# Arirang 형태소 분석기 release 버전 확인 및 다운로드

[https://github.com/HowookJeong/elasticsearch-analysis-arirang/releases](https://github.com/HowookJeong/elasticsearch-analysis-arirang/releases)

# docker-compose.yml 파일 작성

- `logstash` 는 꼭 추가하지 않아도 됨.
- elasticsearch version을 arirang version과 꼭 일치시켜주어야 함. (일치하지 않을 경우 설치시 오류 발생)

```bash
version: '3.2'
services:
  es01:
    image: docker.elastic.co/elasticsearch/elasticsearch:7.9.1
    container_name: es01
    environment:
      - node.name=es01
      - cluster.name=es-docker-cluster
      - discovery.seed_hosts=es02,es03
      - cluster.initial_master_nodes=es01,es02,es03
      - bootstrap.memory_lock=true
      - "ES_JAVA_OPTS=-Xms512m -Xmx512m"
      - reindex.remote.whitelist=es1.danawa.io:9200
    ulimits:
      memlock:
        soft: -1
        hard: -1
    volumes:
      - data01:/usr/share/elasticsearch/data
    ports:
      - 9200:9200
    networks:
      - elastic

  es02:
    image: docker.elastic.co/elasticsearch/elasticsearch:7.9.1
    container_name: es02
    environment:
      - node.name=es02
      - cluster.name=es-docker-cluster
      - discovery.seed_hosts=es01,es03
      - cluster.initial_master_nodes=es01,es02,es03
      - bootstrap.memory_lock=true
      - "ES_JAVA_OPTS=-Xms512m -Xmx512m"
    ulimits:
      memlock:
        soft: -1
        hard: -1
    volumes:
      - data02:/usr/share/elasticsearch/data
    ports:
      - 9201:9200
    networks:
      - elastic

  es03:
    image: docker.elastic.co/elasticsearch/elasticsearch:7.9.1
    container_name: es03
    environment:
      - node.name=es03
      - cluster.name=es-docker-cluster
      - discovery.seed_hosts=es01,es02
      - cluster.initial_master_nodes=es01,es02,es03
      - bootstrap.memory_lock=true
      - "ES_JAVA_OPTS=-Xms512m -Xmx512m"
    ulimits:
      memlock:
        soft: -1
        hard: -1
    volumes:
      - data03:/usr/share/elasticsearch/data
    ports:
      - 9202:9200
    networks:
      - elastic

  kib01:
    image: docker.elastic.co/kibana/kibana:7.9.1
    container_name: kib01
    ports:
      - 5601:5601
    environment:
      ELASTICSEARCH_URL: http://es01:9200
      ELASTICSEARCH_HOSTS: http://es01:9200
    networks:
      - elastic

  logstash:
    image: docker.elastic.co/logstash/logstash:7.9.1
    volumes:
      - ./pipeline/:/usr/share/logstash/pipeline/
      - /var/log/httpd/:/usr/share/logstash/log/
    networks:
      - elastic

volumes:
  data01:
    driver: local
  data02:
    driver: local
  data03:
    driver: local

networks:
  elastic:
    driver: bridge
```

# docker-compose 구동 및 Arirang plugin설치

- 설치 명령어(각 elasticsearch node별 접속 후 실행, 버전은 elasticsearch version에 맞게 해주면 됨, 필자는 7.9.1 버전) : `bin/elasticsearch-plugin install https://github.com/HowookJeong/elasticsearch-analysis-arirang/releases/download/7.9.1/elasticsearch-analysis-arirang-7.9.1.zip`
- 제거 명령어 : `bin/elasticsearch-plugin remove analysis-arirang`

```bash
## docker-compose 백그라운드 구동
[root@node1 es]# docker-compose up -d

## es01 arirang 플러그인 설치
[root@node1 es]# docker exec -it es01 bash
[root@eecdc2606808 elasticsearch]# ls
LICENSE.txt  NOTICE.txt  README.asciidoc  bin  config  data  jdk  lib  logs  modules  plugins
[root@eecdc2606808 elasticsearch]# bin/elasticsearch-plugin install https://github.com/HowookJeong/elasticsearch-analysis-arirang/releases/download/7.9.1/elasticsearch-analysis-arirang-7.9.1.zip
-> Installing https://github.com/HowookJeong/elasticsearch-analysis-arirang/releases/download/7.9.1/elasticsearch-analysis-arirang-7.9.1.zip
-> Downloading https://github.com/HowookJeong/elasticsearch-analysis-arirang/releases/download/7.9.1/elasticsearch-analysis-arirang-7.9.1.zip
[=================================================] 100%??
-> Installed analysis-arirang
[root@eecdc2606808 elasticsearch]# cd bin
[root@eecdc2606808 bin]# ls
elasticsearch           elasticsearch-env-from-file  elasticsearch-setup-passwords    x-pack-env
elasticsearch-certgen   elasticsearch-keystore       elasticsearch-shard              x-pack-security-env
elasticsearch-certutil  elasticsearch-migrate        elasticsearch-sql-cli            x-pack-watcher-env
elasticsearch-cli       elasticsearch-node           elasticsearch-sql-cli-7.9.1.jar
elasticsearch-croneval  elasticsearch-plugin         elasticsearch-syskeygen
elasticsearch-env       elasticsearch-saml-metadata  elasticsearch-users

## arirang 플러그인 설치 확인
[root@eecdc2606808 bin]# elasticsearch-plugin list
analysis-arirang
[root@eecdc2606808 bin]# exit
exit

## es02 arirang 플러그인 설치
[root@node1 es]# docker exec -it es02 bash
[root@613bd70dcea1 elasticsearch]# bin/elasticsearch-plugin install https://github.com/HowookJeong/elasticsearch-analysis-arirang/releases/download/7.9.1/elasticsearch-analysis-arirang-7.9.1.zip
-> Installing https://github.com/HowookJeong/elasticsearch-analysis-arirang/releases/download/7.9.1/elasticsearch-analysis-arirang-7.9.1.zip
-> Downloading https://github.com/HowookJeong/elasticsearch-analysis-arirang/releases/download/7.9.1/elasticsearch-analysis-arirang-7.9.1.zip
[=================================================] 100%??
-> Installed analysis-arirang
[root@613bd70dcea1 elasticsearch]# exit
exit

## es03 arirang 플러그인 설치
[root@node1 es]# docker exec -it es03 bash
[root@df241e8a3d35 elasticsearch]# bin/elasticsearch-plugin install https://github.com/HowookJeong/elasticsearch-analysis-arirang/releases/download/7.9.1/elasticsearch-analysis-arirang-7.9.1.zip
-> Installing https://github.com/HowookJeong/elasticsearch-analysis-arirang/releases/download/7.9.1/elasticsearch-analysis-arirang-7.9.1.zip
-> Downloading https://github.com/HowookJeong/elasticsearch-analysis-arirang/releases/download/7.9.1/elasticsearch-analysis-arirang-7.9.1.zip
[=================================================] 100%??
-> Installed analysis-arirang
[root@df241e8a3d35 elasticsearch]# exit
exit
[root@node1 es]# docker-compose stop
Stopping es02          ... done
Stopping es01          ... done
Stopping es03          ... done
Stopping kib01         ... done
Stopping es_logstash_1 ... done
[root@node1 es]# docker-compose start
Starting es01     ... done
Starting es02     ... done
Starting es03     ... done
Starting kib01    ... done
Starting logstash ... done
```

# Arirang 플러그인 실습

[https://cafe.naver.com/korlucene](https://cafe.naver.com/korlucene) 다운로드에서 2018년에 업로드된 Arirang Analyzer Elastic Manaual을 참고 해보았는데 버전 차이가 커서 그런지 결과값이 다른 것을 확인할 수 있었다.

실습은 ElasticSearch kibana에서 하도록 하겠다.

## Configuration

- `queryMode (default false)` :  search time 여부 (search time은 1순위 키워드만 추출)
- `decompound (default true)` : 복합명사를 분해할지 여부
- `preserveVerb (default false)` : 용언을 검색어로 추출한 것인지 여부
- `exactMatch (default false)` : 복합명사를 분해할 때 사전에 존재해야 복합명사로 분해할지 여부
- `preserveCNoun (default true)` : 복합명사를 분해하기 전의 단어를 token으로 추출할 것인지 여부
- `preserveOrigin (default false)` : 형태소 분석이 안된 어절을 token으로 추출 여부
- `bigrammable (default false)` : 형태소 분석에 실패한 경우 Bigram을 token으로 추출할지 여부
- `wordSegment (default false)` : 형태소 분석에 실패한 경우 자동 띄어쓰기를 할 것인지 여부

```bash
## Arirang 플러그인 인덱스 설정
PUT arirang_analyzer
{
  "settings": {
    "index": {
      "analysis": {
        "analyzer": {
          "arirang_custom": {
            "type": "arirang_analyzer",
            "tokenizer": "arirang_tokenizer",
            "filter": [
              "lowercase",
              "trim",
              "arirang_filter"
            ]
          }
        }
      }
    }
  }
}

## text에 대한 형태소 분석 실행
POST arirang_analyzer/_analyze
{
  "analyzer": "arirang_analyzer",
  "text": "행복해지기 위해서는 몇가지를 버려야 할 필요가 있다. 그렇게 하고 나서야 나는 행복해질 수 있었다."
}

## 결과 값 (비교적 형태소 분석이 잘 되는 듯 하나 약간 미흡 해보인다)
{
  "tokens" : [
    {
      "token" : "행복",
      "start_offset" : 0,
      "end_offset" : 2,
      "type" : "korean",
      "position" : 0
    },
    {
      "token" : "몇가지",
      "start_offset" : 11,
      "end_offset" : 14,
      "type" : "korean",
      "position" : 1
    },
    {
      "token" : "몇가지를",
      "start_offset" : 11,
      "end_offset" : 15,
      "type" : "korean",
      "position" : 1
    },
    {
      "token" : "할",
      "start_offset" : 20,
      "end_offset" : 21,
      "type" : "korean",
      "position" : 2
    },
    {
      "token" : "필요",
      "start_offset" : 22,
      "end_offset" : 24,
      "type" : "korean",
      "position" : 3
    },
    {
      "token" : "나서",
      "start_offset" : 37,
      "end_offset" : 39,
      "type" : "korean",
      "position" : 4
    },
    {
      "token" : "나",
      "start_offset" : 41,
      "end_offset" : 42,
      "type" : "korean",
      "position" : 5
    },
    {
      "token" : "행복",
      "start_offset" : 44,
      "end_offset" : 46,
      "type" : "korean",
      "position" : 6
    },
    {
      "token" : "수",
      "start_offset" : 49,
      "end_offset" : 50,
      "type" : "korean",
      "position" : 7
    }
  ]
}

```
