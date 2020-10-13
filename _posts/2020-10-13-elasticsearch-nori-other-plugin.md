---
title: ElasticSearch nori 외부 플러그인(left-join) 설치 및 사용법
layout: post
date: '2020-10-13 18:01:00 +0300'
description: 호스트 컴퓨터 (Window 10) 사전 작업
img: null
fig-caption: null
tags:
- es
- elasticsearch
- nori
- nori플러그인
- 노리플러그인
- 엘라스틱서치
- 엘라스틱서치한글형태소분석기
---

# 실습환경

- Host OS : Window 10
    - git
    - gradle
- VM OS : CentOS 7
    - docker-compose
    - 3 node

# 호스트 컴퓨터 (Window 10) 사전 작업

## git clone

ElasticSearch에서 공식적으로 제공하는 플러그인이 아닌 외부 플러그인을 적용시켜 보도록 하겠다. 필자가 이 글에서 설치 및 사용해볼 플러그인은 danawa github에 올라와 있는 left-join 플러그인이다. 아래의 URL로 git 레파지토리를 clone 해주자. VM 환경에서 직접 진행할 수도 있겠지만 필자는 호스트 컴퓨터에서 gradle build를 하여 생성된 파일들을 VM에 넘겨주는 방식으로 진행하였다.

(필자의 경우 C 드라이브에 해당 프로젝트를 clone 하였다)

```bash
## 복제할 경로로 이동하여 clone
git clone https://github.com/danawalab/left-join-plugin
```

## gradle build

gradle 이라는 툴로 build를 하여 아래와 같은 파일들을 생성해낸다. (gradle이 설치되어 있지 않다면 설치하여야 한다)

```bash
c:\left-join-plugin>gradle build
Starting a Gradle Daemon, 1 incompatible Daemon could not be reused, use --status for details

> Task :compileJava
Note: Some input files use unchecked or unsafe operations.
Note: Recompile with -Xlint:unchecked for details.

Deprecated Gradle features were used in this build, making it incompatible with Gradle 7.0.
Use '--warning-mode all' to show the individual deprecation warnings.
See https://docs.gradle.org/6.6.1/userguide/command_line_interface.html#sec:command_line_warnings

BUILD SUCCESSFUL in 22s
5 actionable tasks: 5 executed
```

빌드가 성공적으로 완료되면 아래와 같이 `프로젝트 경로\build\libs` 라는 곳에 아래와 같은 파일들이 생성됨을 확인할 수 있다. 이 파일들을 VM으로 옮겨주자.

![/assets/img/2020-10-13_18h39_28.png](/assets/img/2020-10-13_18h39_28.png)

필자의 경우에는 `ES/join-plugin` 폴더를 생성하여 하위에 해당 파일들을 넣어주었다. 호스트 컴퓨터와 파일들을 주고받는 방법은 여러가지 일 것이지만 필자의 경우에는 MobaXTerm이라는 툴로 드래그해서 옮겨주었다.

![/assets/img/2020-10-13_18h41_10.png](/assets/img/2020-10-13_18h41_10.png)

# VM 환경에서의 nori 플러그인 및 외부 플러그인 설치

## docker-compose.yml 파일 작성

필자의 경우 docker-compose를 통해 3개의 elasticsearch 컨테이너를 띄울 예정이고 그곳에 볼륨 설정을 해주어서 VM 상의 호스트 컴퓨터의 파일들을 컨테이너 안에 전달해줄 것이다.

docker-compose.yml 파일을 통해 이와같이 설정해주자. (danawa/left-join 플러그인의 경우 엘라스틱 서치 버전을 7.6.2를 제공하기 때문에 버전을 맞춰주어야 사용이 가능하다)

볼륨의 경로를 잘못 설정할 경우에 제대로 플러그인이 설치되지 않을 수 있으니 참고하기 바란다.

```bash
version: '2.2'
services:
  es01:
    image: docker.elastic.co/elasticsearch/elasticsearch:7.6.2
    container_name: es01
    environment:
      - node.name=es01
      - cluster.name=es-docker-cluster
      - discovery.seed_hosts=es02,es03
      - cluster.initial_master_nodes=es01,es02,es03
      - bootstrap.memory_lock=true
      - "ES_JAVA_OPTS=-Xms512m -Xmx512m"
    ulimits:
      memlock:
        soft: -1
        hard: -1
    volumes:
      - data01:/usr/share/elasticsearch/data
      - ./join-plugin/:/usr/share/elasticsearch/plugins/join-plugin/
      - ./analysis-product/:/usr/share/elasticsearch/plugins/analysis-product/
    ports:
      - 9200:9200
    networks:
      - elastic

  es02:
    image: docker.elastic.co/elasticsearch/elasticsearch:7.6.2
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
      - ./join-plugin/:/usr/share/elasticsearch/plugins/join-plugin/
      - ./analysis-product/:/usr/share/elasticsearch/plugins/analysis-product/
    ports:
      - 9201:9200
    networks:
      - elastic

  es03:
    image: docker.elastic.co/elasticsearch/elasticsearch:7.6.2
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
      - ./join-plugin/:/usr/share/elasticsearch/plugins/join-plugin/
      - ./analysis-product/:/usr/share/elasticsearch/plugins/analysis-product/
    ports:
      - 9202:9200
    networks:
      - elastic

kib01:
    image: docker.elastic.co/kibana/kibana:7.6.2
    container_name: kib01
    ports:
      - 5601:5601
    environment:
      ELASTICSEARCH_URL: http://es01:9200
      ELASTICSEARCH_HOSTS: http://es01:9200
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

## docker-compose 구동 및 nori 플러그인 설치

`docker-compose up -d` 명령어를 통해서 백그라운드에서 도커 컴포즈로 연결된 모든 컨테이너를 띄워준다. 구동이 완료가 되면 엘라스틱 서치 각 노드에 접속하여 nori 플러그인을 설치해준다.

```bash
## docker-compose 구동
docker-compose up -d

## 각 노드에 접속하여 nori 플러그인 설치
docker exec -it es01 bash
bin/elasticsearch-plugin install analysis-nori

docker exec -it es02 bash
bin/elasticsearch-plugin install analysis-nori

docker exec -it es03 bash
bin/elasticsearch-plugin install analysis-nori
```

## join-plugin 설치 확인

```bash
## 각 노드 접속
docker exec -it es01 bash

cd /usr/share/elasticsearch/bin/

## 해당 경로에서 아래와 같이 조회가 되면 잘 설치되었다고 볼 수 있다
[root@9ebe0f2832d4 bin]# elasticsearch-plugin list
join-plugin
```

# 외부 플러그인 실습 (left-join)

외부 플러그인 실습은 키바나에서 진행하도록 한다. 키바나 세팅이 되어있지 않다면 필자의 블로그 글 중 키바나 관련 글을 참고하여 세탕하기 바란다.

## 인덱스 생성 및 샘플 데이터 생성

```bash
PUT /parent
{
  "settings": {
    "number_of_replicas": 0
  },
  "mappings": {
    "properties": {
      "column1": {
        "type": "keyword"
      },
      "column2": {
        "type": "text"
      },
      "fk": {
        "type": "keyword"
      }
    }
  }
}

PUT /child
{
  "settings": {
    "number_of_replicas": 0
  },
  "mappings": {
    "properties": {
      "pk": {
        "type": "keyword"
      },
      "column3": {
        "type": "text"
      },
      "column4": {
        "type": "keyword"
      }
    }
  }
}
PUT /child2
{
  "mappings": {
    "properties": {
      "pk": {
        "type": "keyword"
      },
      "column5": {
        "type": "text"
      },
      "column6": {
        "type": "keyword"
      }
    }
  }
}
PUT /child3
{
  "mappings": {
    "properties": {
      "pk": {
        "type": "keyword"
      },
      "column7": {
        "type": "text"
      },
      "column8": {
        "type": "keyword"
      }
    }
  }
}

POST /parent/_doc
{
  "column1": "a",
  "column2": "a",
  "fk": "key1"
}

POST /child/_doc
{
  "pk": "key1",
  "column3": "b",
  "column4": "b"
}
POST /child/_doc
{
  "pk": "key1",
  "column3": "c",
  "column4": "c"
}
POST /parent/_doc
{
  "column1": "aaaaaaa",
  "column2": "aaaaaaaaa",
  "fk": "key1000"
}
POST /child2/_doc
{
  "pk": "key1",
  "column3": "e",
  "column4": "f"
}
POST /child2/_doc
{
  "pk": "key55",
  "column3": "e",
  "column4": "f"
}
POST /child3/_doc
{
  "pk": "key55",
  "column3": "g",
  "column4": "h"
}

POST /parent/_doc
{
  "column1": "ggg",
  "column2": "ggrr",
  "fk": "key55"
}
```

## left join 쿼리 테스트

- Query1

```bash
## 요청
GET /parent/_left
{
  "query": {
    "bool": {
      "should": [
        {
          "match": {
            "column1": "a"
          }
        }
      ]
    }
  },
  "join": [  
    {
      "index": "child2",
      "parent": "fk",
      "child": "pk",
      "query": {
        "term": {
          "column3": {
            "value": "b"
          }
        }
      }
    }
  ]
}

## 응답
{
  "took" : 1,
  "timed_out" : false,
  "_shards" : {
    "total" : 1,
    "successful" : 1,
    "skipped" : 0,
    "failed" : 0
  },
  "hits" : {
    "total" : {
      "value" : 1,
      "relation" : "eq"
    },
    "max_score" : 0.9808291,
    "hits" : [
      {
        "_index" : "parent",
        "_type" : "_doc",
        "_id" : "pTwwIXUB_TPgn8ZdeRFz",
        "_score" : 0.9808291,
        "_source" : {
          "column1" : "a",
          "column2" : "a",
          "fk" : "key1"
        },
        "inner_hits" : {
          "_child" : {
            "hits" : {
              "total" : {
                "value" : 1,
                "relation" : "eq"
              },
              "max_score" : 1.1823215,
              "hits" : [
                {
                  "_index" : "child2",
                  "_type" : "_doc",
                  "_id" : "qTwwIXUB_TPgn8ZdlRFm",
                  "_score" : 1.1823215,
                  "_source" : {
                    "pk" : "key1",
                    "column3" : "e",
                    "column4" : "f"
                  }
                }
              ]
            }
          }
        }
      }
    ]
  }
}
```

- Query2

```bash
## 요청
GET /parent/_left
{
  "query": {
    "bool": {
      "should": [
        {
          "match": {
            "column1": "a"
          }
        }
      ]
    }
  },
  "join": [  
    {
      "index": "child",
      "parent": "fk",
      "child": "pk",
      "query": [
        {
          "bool": {
            "must": [
              {
                "term": {
                  "column3": {
                    "value": "b"
                  }
                }
              }
            ]
          }
        }        
      ]
    }
  ]
} 

## 응답
{
  "took" : 6,
  "timed_out" : false,
  "_shards" : {
    "total" : 1,
    "successful" : 1,
    "skipped" : 0,
    "failed" : 0
  },
  "hits" : {
    "total" : {
      "value" : 1,
      "relation" : "eq"
    },
    "max_score" : 0.9808291,
    "hits" : [
      {
        "_index" : "parent",
        "_type" : "_doc",
        "_id" : "pTwwIXUB_TPgn8ZdeRFz",
        "_score" : 0.9808291,
        "_source" : {
          "column1" : "a",
          "column2" : "a",
          "fk" : "key1"
        },
        "inner_hits" : {
          "_child" : {
            "hits" : {
              "total" : {
                "value" : 1,
                "relation" : "eq"
              },
              "max_score" : 1.6931472,
              "hits" : [
                {
                  "_index" : "child",
                  "_type" : "_doc",
                  "_id" : "pjwwIXUB_TPgn8ZdgRGz",
                  "_score" : 1.6931472,
                  "_source" : {
                    "pk" : "key1",
                    "column3" : "b",
                    "column4" : "b"
                  }
                }
              ]
            }
          }
        }
      }
    ]
  }
}
```
