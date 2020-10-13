---
title: ElasticSearch nori 플러그인(한글형태소 분석기)설치 및 사용법
layout: post
date: '2020-10-13 18:00:00 +0300'
description: ElasticSearch nori 플러그인 설치
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

- OS : CentOS 7
- docker-compose
- 3 node

# ElasticSearch nori 플러그인 설치

## docker-compose.yml 파일 작성

```yaml
version: '2.2'
services:
  es01:
    image: docker.elastic.co/elasticsearch/elasticsearch:7.9.2
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
    ports:
      - 9200:9200
    networks:
      - elastic

  es02:
    image: docker.elastic.co/elasticsearch/elasticsearch:7.9.2
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
    image: docker.elastic.co/elasticsearch/elasticsearch:7.9.2
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
    image: docker.elastic.co/kibana/kibana:7.9.2
    container_name: kib01
    ports:
      - 5601:5601
    environment:
      ELASTICSEARCH_URL: http://es01:9200
      ELASTICSEARCH_HOSTS: http://es01:9200
    networks:
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

## docker-compose 구동 후 각 노드별 nori plugin 설치

- 필자는 노드가 3개 있으므로 `docker-compose up -d` 명령어를 제외하고 3회 반복하여야 한다.
- 순서가 꼬일 경우 제대로 plugin 사용이 되지 않을 수 있음

```bash
## docker-compose 구동
docker-compose up -d

## 각 노드별로 접속해서 nori plugin
docker exec -it es01 bash
bin/elasticsearch-plugin install analysis-nori

## 실습을 위한 디렉토리 생성
mkdir /usr/share/elasticsearch/config/userdict_ko.txt

## userdict_ko.txt 내용입력
c++                 
C샤프
세종
세종시 세종 시

## docker-compose 중지 후 재시작
docker-compose stop
docker-compose start
```

# nori_tokenizer

- decompound_mode : 복합 토큰을 처리하는 방법을 결정
    - none : 분해가 없음
    - discard(default) : 분해하고 원래 형태를 버림
    - mixed : 분해하고 원래 형태 유지
- user_dictionary는 아래와 같은 방법으로도 사용 가능

```bash
<token> [<token 1> ... <token n>]
```

```bash
## 샘플 인덱스 생성
PUT nori_sample
{
  "settings": {
    "index": {
      "analysis": {
        "tokenizer": {
          "nori_user_dict": {
            "type": "nori_tokenizer",
            "decompound_mode": "mixed",
            "discard_punctuation": "false",
            "user_dictionary": "userdict_ko.txt"
          }
        },
        "analyzer": {
          "my_analyzer": {
            "type": "custom",
            "tokenizer": "nori_user_dict"
          }
        }
      }
    }
  }
}

## 등록된 analyzer를 사용해서 text 에 입력한 데이터를 분석한 데이터를 나타내는 api
## nori_sample 인덱스에서 my_analyzer라는 분석기를 사용하여 세종시라는 텍스트를 분석
GET nori_sample/_analyze
{
  "analyzer": "my_analyzer",
  "text": "세종시"  
}

## 결과 값
{
  "tokens" : [
    {
      "token" : "세종시",
      "start_offset" : 0,
      "end_offset" : 3,
      "type" : "word",
      "position" : 0,
      "positionLength" : 2
    },
    {
      "token" : "세종",
      "start_offset" : 0,
      "end_offset" : 2,
      "type" : "word",
      "position" : 0
    },
    {
      "token" : "시",
      "start_offset" : 2,
      "end_offset" : 3,
      "type" : "word",
      "position" : 1
    }
  ]
}

## attributes를 추가해 모든 속성값을 확인
## 뿌리가 깊은 나무는라는 텍스트를 노리 토크나이저 활용해서 안에 있는 속성값과 같이 표시
GET _analyze
{
  "tokenizer": "nori_tokenizer",
  "text": "뿌리가 깊은 나무는",   
  "attributes" : ["posType", "leftPOS", "rightPOS", "morphemes", "reading"],
  "explain": true
}

## 결과 값
{
    "detail": {
        "custom_analyzer": true,
        "charfilters": [],
        "tokenizer": {
            "name": "nori_tokenizer",
            "tokens": [
                {
                    "token": "뿌리",
                    "start_offset": 0,
                    "end_offset": 2,
                    "type": "word",
                    "position": 0,
                    "leftPOS": "NNG(General Noun)",
                    "morphemes": null,
                    "posType": "MORPHEME",
                    "reading": null,
                    "rightPOS": "NNG(General Noun)"
                },
                {
                    "token": "가",
                    "start_offset": 2,
                    "end_offset": 3,
                    "type": "word",
                    "position": 1,
                    "leftPOS": "J(Ending Particle)",
                    "morphemes": null,
                    "posType": "MORPHEME",
                    "reading": null,
                    "rightPOS": "J(Ending Particle)"
                },
                {
                    "token": "깊",
                    "start_offset": 4,
                    "end_offset": 5,
                    "type": "word",
                    "position": 2,
                    "leftPOS": "VA(Adjective)",
                    "morphemes": null,
                    "posType": "MORPHEME",
                    "reading": null,
                    "rightPOS": "VA(Adjective)"
                },
                {
                    "token": "은",
                    "start_offset": 5,
                    "end_offset": 6,
                    "type": "word",
                    "position": 3,
                    "leftPOS": "E(Verbal endings)",
                    "morphemes": null,
                    "posType": "MORPHEME",
                    "reading": null,
                    "rightPOS": "E(Verbal endings)"
                },
                {
                    "token": "나무",
                    "start_offset": 7,
                    "end_offset": 9,
                    "type": "word",
                    "position": 4,
                    "leftPOS": "NNG(General Noun)",
                    "morphemes": null,
                    "posType": "MORPHEME",
                    "reading": null,
                    "rightPOS": "NNG(General Noun)"
                },
                {
                    "token": "는",
                    "start_offset": 9,
                    "end_offset": 10,
                    "type": "word",
                    "position": 5,
                    "leftPOS": "J(Ending Particle)",
                    "morphemes": null,
                    "posType": "MORPHEME",
                    "reading": null,
                    "rightPOS": "J(Ending Particle)"
                }
            ]
        },
        "tokenfilters": []
    }
}
```

# nori_part_of_speech token filter

- 품사 태그 세트와 일치하는 토큰을 제거
- `stoptags` : 제거해야 하는 품사 태그의 배열
- 지원되는 태그 목록과 의미
    - [https://lucene.apache.org/core/7_4_0/analyzers-nori/org/apache/lucene/analysis/ko/POS.Tag.html](https://lucene.apache.org/core/7_4_0/analyzers-nori/org/apache/lucene/analysis/ko/POS.Tag.html)

```bash
## 기본값
"stoptags": [
    "E",
    "IC",
    "J",
    "MAG", "MAJ", "MM",
    "SP", "SSC", "SSO", "SC", "SE",
    "XPN", "XSA", "XSN", "XSV",
    "UNA", "NA", "VSV"
]
```

- stoptags 실습

```bash
## 기존에 생성한 인덱스 삭제
DELETE nori_sample

## stoptags를 추가한 새로운 인덱스 생성
PUT nori_sample
{
  "settings": {
    "index": {
      "analysis": {
        "analyzer": {
          "my_analyzer": {
            "tokenizer": "nori_tokenizer",
            "filter": [
              "my_posfilter"
            ]
          }
        },
        "filter": {
          "my_posfilter": {
            "type": "nori_part_of_speech",
            "stoptags": [
              "NR"   
            ]
          }
        }
      }
    }
  }
}

## nori_sample 인덱스에서 "1 일 하나 용이 마흔셋"이라는 텍스트를 my_analyzer라는 분석기를 통해 분석
GET nori_sample/_analyze
{
  "analyzer": "my_analyzer",
  "text": "1 일 하나 용이 마흔셋"  
}

## 결과 값
## 일,이,삼,사 이렇게는 제거가 되지 않고 하나, 둘, 셋, 넷... 이렇게 제거 되는 듯 함
{
  "tokens" : [
    {
      "token" : "1",
      "start_offset" : 0,
      "end_offset" : 1,
      "type" : "word",
      "position" : 0
    },
    {
      "token" : "일",
      "start_offset" : 2,
      "end_offset" : 3,
      "type" : "word",
      "position" : 1
    },
    {
      "token" : "용",
      "start_offset" : 7,
      "end_offset" : 8,
      "type" : "word",
      "position" : 3
    },
    {
      "token" : "이",
      "start_offset" : 8,
      "end_offset" : 9,
      "type" : "word",
      "position" : 4
    }
  ]
}
```

# nori_readingform token filter

- 한자로 작성된 토큰을 한글로 변환

```bash
## 기존에 생성한 인덱스 삭제
DELETE nori_sample

## nori_readingform token filter 적용한 새로운 인덱스 생성
PUT nori_sample
{
    "settings": {
        "index":{
            "analysis":{
                "analyzer" : {
                    "my_analyzer" : {
                        "tokenizer" : "nori_tokenizer",
                        "filter" : ["nori_readingform"]
                    }
                }
            }
        }
    }
}

## nori_sample이라는 인덱스에서 my_analyzer 분석기를 활용해서 鄕歌라는 한자를 한글로 변환하여 토큰 작성
GET nori_sample/_analyze
{
  "analyzer": "my_analyzer",
  "text": "鄕歌"      
}

## 결과 값
{
  "tokens" : [
    {
      "token" : "향가",
      "start_offset" : 0,
      "end_offset" : 2,
      "type" : "word",
      "position" : 0
    }
  ]
}

## nori_sample이라는 인덱스에서 my_analyzer 분석기를 활용해서 午前이라는 한자를 한글로 변환하여 토큰 작성
GET nori_sample/_analyze
{
  "analyzer": "my_analyzer",
  "text": "午前"      
}

## 결과 값
{
  "tokens" : [
    {
      "token" : "오전",
      "start_offset" : 0,
      "end_offset" : 2,
      "type" : "word",
      "position" : 0
    }
  ]
}
```
