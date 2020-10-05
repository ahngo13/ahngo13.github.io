---
title: ElasticSearch 활용 - 기본 명령어 CRUD
layout: post
date: '2020-10-05 17:58:00 +0300'
description: ElasticSearch 활용 - 기본 명령어 CRUD
img: null
fig-caption: null
tags:
- es
- elasticsearch
- escrud
- es기본명령어
- elasticsearch기본명령어
---

- 참고 공식사이트 (한글 번역 되어있으나 버전이 5.4 버전인 관계로 명령어는 현재와 다를 수 있음)

[https://www.elastic.co/guide/kr/index.html](https://www.elastic.co/guide/kr/index.html)

초기에는 kibana 명령어를 사용할지 몰라 bash 창에서 명령어를 입력하여 활용하다가 키바나 명령어 사용법을 알게되어 편하게 쓰게 되었다. 혹시 독자분들도 아무것도 모르고 bash 창을 이용하여 명령어를 입력해서 테스트 하고 있다면 `[localhost:5601](http://localhost:5601)` 로 접속하여 `Dev Tools` 에서 활용해보자.

## 클러스터 상태 확인

- `GET /_cat/health?v`
- 녹색 : 모두 양호한 상태
- 노란색 : 모든 데이터가 사용 가능한 상태이지만 일부 리플리카가 아직 배정되지 않은 상태
- 빨간색 : 어떤 이유로 일부 데이터가 사용할 수 없는 상태를 의미

```bash
[root@node1 ~]# curl -GET 'localhost:9200/_cat/health?v'
epoch      timestamp cluster           status node.total node.data shards pri relo init unassign pending_tasks max_task_wait_time active_shards_percent
1601862088 01:41:28  es-docker-cluster green           3         3     22  11    0    0        0             0                  -                100.0%
```

## 노드의 목록 표시

- `GET /_cat/nodes?v`

```bash
[root@node1 ~]# curl -GET 'localhost:9200/_cat/nodes?v'
ip           heap.percent ram.percent cpu load_1m load_5m load_15m node.role master name
192.168.96.2           39          58  10    0.24    0.24     0.44 dilmrt    -      es03
192.168.96.4           18          58  10    0.24    0.24     0.44 dilmrt    -      es01
192.168.96.3           40          58  10    0.24    0.24     0.44 dilmrt    *      es02
```

## 모든 index 나열

```bash
[root@node1 ~]# curl -GET 'localhost:9200/_cat/indices?v'
health status index                          uuid                   pri rep docs.count docs.deleted store.size pri.store.size
green  open   .kibana-event-log-7.9.2-000001 fr2XopZHRzuJcm9pCvPqAA   1   1          3            0     32.5kb         16.2kb
green  open   .apm-custom-link               CzinLMWrRe-S-LDpILSc6w   1   1          0            0       416b           208b
green  open   .kibana_task_manager_2         DEn7MKdTQviDvaSZ56NBDA   1   1          6          263      1.2mb        684.2kb
green  open   .kibana_task_manager_1         f8ibyRa5Qc-msi2MA55Pqg   1   1          5            2     55.4kb         27.7kb
green  open   index_test                     np_2WyhCSTaBWlGiqBmHWw   1   1          1            0      9.7kb          4.8kb
green  open   .apm-agent-configuration       cTW1RYPFRG6cYP4Wg_Gwxw   1   1          0            0       416b           208b
green  open   customer2                      xmXw2qqdTnegGjBHNmH-BQ   1   1          2            0     14.9kb          7.4kb
green  open   .kibana_2                      ec72UHa5TQSyIWMT87PW8Q   1   1         17            0     20.8mb         10.4mb
green  open   .kibana_1                      YRg6LxJKQf6DEUebuGCtBg   1   1          4            0     65.4kb         32.7kb
```

## index 생성 및 조회

- `PUT /customer?pretty` (끝에 pretty를 추가할 경우 결과 값을 예쁘게 표현)
- `GET /_cat/indices?v`

```bash
## 색인 생성 후 조회 결과
[root@node1 ~]# curl -GET 'localhost:9200/_cat/indices?v'
health status index                          uuid                   pri rep docs.count docs.deleted store.size pri.store.size
green  open   .kibana-event-log-7.9.2-000001 fr2XopZHRzuJcm9pCvPqAA   1   1          3            0     32.5kb         16.2kb
green  open   .apm-custom-link               CzinLMWrRe-S-LDpILSc6w   1   1          0            0       416b           208b
green  open   .kibana_task_manager_2         DEn7MKdTQviDvaSZ56NBDA   1   1          6          272      1.3mb        653.3kb
green  open   .kibana_task_manager_1         f8ibyRa5Qc-msi2MA55Pqg   1   1          5            2     55.4kb         27.7kb
green  open   index_test                     np_2WyhCSTaBWlGiqBmHWw   1   1          1            0      9.7kb          4.8kb
green  open   .apm-agent-configuration       cTW1RYPFRG6cYP4Wg_Gwxw   1   1          0            0       416b           208b
green  open   customer2                      xmXw2qqdTnegGjBHNmH-BQ   1   1          2            0     14.9kb          7.4kb
green  open   .kibana_2                      ec72UHa5TQSyIWMT87PW8Q   1   1         17            0     20.8mb         10.4mb
green  open   .kibana_1                      YRg6LxJKQf6DEUebuGCtBg   1   1          4            0     65.4kb         32.7kb
green  open   customer                       _CovbT7iQ_mE_TAI-Exiiw   1   1          0            0       416b           208b
```

## 문서 index 및 데이터 삽입

- 한글 공식 문서를 보고 명령어를 입력하였더니 Deprecation이 발생한 것을 알 수 있었다. type은 현재 사용하지 않으므로 다른 방식의 명령어를 입력해주어야 한다.

```bash
PUT /customer/external/1?pretty
{
  "name": "John Doe"
}
```

```bash
#! Deprecation: [types removal] Specifying types in document index requests is deprecated, use the typeless endpoints instead (/{index}/_doc/{id}, /{index}/_doc, or /{index}/_create/{id}).
{
  "_index" : "customer",
  "_type" : "external",
  "_id" : "1",
  "_version" : 1,
  "result" : "created",
  "_shards" : {
    "total" : 2,
    "successful" : 2,
    "failed" : 0
  },
  "_seq_no" : 0,
  "_primary_term" : 1
}
```

- 아래와 같이 `PUT /customer/_doc/3?pretty` 로 명령어를 변경한다. type이 불필요하여 타입 대신 `_doc` 을 넣는 것으로 변경된 듯 하다.

```bash
PUT /customer/_doc/3?pretty
{
  "name": "John Doe"
}
```

```bash
{
  "_index" : "customer",
  "_type" : "_doc",
  "_id" : "3",
  "_version" : 1,
  "result" : "created",
  "_shards" : {
    "total" : 2,
    "successful" : 2,
    "failed" : 0
  },
  "_seq_no" : 3,
  "_primary_term" : 1
}
```

- 방금 색인화한 문서를 검색하는 것도 명령어가 달라져서 아래와 같이 입력하면 된다. (역시 중간에 _doc를 넣어서 type을 사용하지 않음을 알 수 있다)

```bash
GET /customer/_doc/1?pretty
```

```bash
{
  "_index" : "customer",
  "_type" : "_doc",
  "_id" : "1",
  "_version" : 2,
  "_seq_no" : 1,
  "_primary_term" : 1,
  "found" : true,
  "_source" : {
    "name" : "John Doe"
  }
}
```

## index 삭제

- 아래의 DELETE 명령어로 customer 색인을 삭제하고 다시 모든 색인을 조회하면 아래와 같이 customer 색인이 보이지 않는 것을 확인할 수 있다.

```bash
DELETE /customer?pretty
GET /_cat/indices?v
```

```bash
health status index                          uuid                   pri rep docs.count docs.deleted store.size pri.store.size
green  open   .kibana-event-log-7.9.2-000001 fr2XopZHRzuJcm9pCvPqAA   1   1          3            0     32.5kb         16.2kb
green  open   .apm-custom-link               CzinLMWrRe-S-LDpILSc6w   1   1          0            0       416b           208b
green  open   .kibana_task_manager_2         DEn7MKdTQviDvaSZ56NBDA   1   1          6          395      1.2mb        680.7kb
green  open   .kibana_task_manager_1         f8ibyRa5Qc-msi2MA55Pqg   1   1          5            2     55.4kb         27.7kb
green  open   index_test                     np_2WyhCSTaBWlGiqBmHWw   1   1          1            0      9.7kb          4.8kb
green  open   .apm-agent-configuration       cTW1RYPFRG6cYP4Wg_Gwxw   1   1          0            0       416b           208b
green  open   .kibana_2                      ec72UHa5TQSyIWMT87PW8Q   1   1         30           11     20.8mb         10.4mb
green  open   .kibana_1                      YRg6LxJKQf6DEUebuGCtBg   1   1          4            0     65.4kb         32.7kb
```

## index 데이터 대체

- 동일한 명령어로 내용만 바꿔서 실행했을 경우 기존 문서가 새 문서를 대체
- `John Doe`가 `Jane Doe` 로 변경된 것을 알 수 있음

```bash
PUT /customer/_doc/1?pretty
{
  "name": "Jane Doe"
}
GET /customer/_doc/1?pretty
```

```bash
{
  "_index" : "customer",
  "_type" : "_doc",
  "_id" : "1",
  "_version" : 3,
  "_seq_no" : 2,
  "_primary_term" : 1,
  "found" : true,
  "_source" : {
    "name" : "Jane Doe"
  }
}
```

## 문서 업데이트

- 이 명령어도 기존 명령어와 변경된 것을 확인할 수 있음
- 업데이트를 명령하면 기존 문서 삭제, 새 문서를 색인화, 업데이트 적용

```bash
# 기존 명령어
POST /customer/external/1/_update?pretty
{
  "doc": { "name": "Jane Doe" }
}

# 변경된 명령어
POST /customer/_update/1?pretty
{
  "doc": { "name": "John Doe" }
}
GET /customer/_doc/1?pretty
```

```bash
{
  "_index" : "customer",
  "_type" : "_doc",
  "_id" : "1",
  "_version" : 4,
  "_seq_no" : 3,
  "_primary_term" : 1,
  "found" : true,
  "_source" : {
    "name" : "John Doe"
  }
}
```

- 이름을 `Jane Doe` 로 변경하고 `age` 필드를 추가

```bash
# 기존 명령어
POST /customer/external/1/_update?pretty
{
  "doc": { "name": "Jane Doe", "age": 20 }
}

# 변경된 명령어
POST /customer/_update/1?pretty
{
  "doc": { "name": "Jane Doe", "age" : 20 }
}

GET /customer/_doc/1?pretty
```

```bash
{
  "_index" : "customer",
  "_type" : "_doc",
  "_id" : "1",
  "_version" : 6,
  "result" : "updated",
  "_shards" : {
    "total" : 2,
    "successful" : 2,
    "failed" : 0
  },
  "_seq_no" : 5,
  "_primary_term" : 1
}
```

- 스크립트를 사용하여 나이를 5만큼 늘리기

```bash
# 기존 명령어
POST /customer/external/1/_update?pretty
{
  "script" : "ctx._source.age += 5"
}

# 변경된 명령어
POST /customer/_update/1?pretty
{
  "script": "ctx._source.age += 5" 
}

GET /customer/_doc/1?pretty
```

```bash
{
  "_index" : "customer",
  "_type" : "_doc",
  "_id" : "1",
  "_version" : 7,
  "_seq_no" : 6,
  "_primary_term" : 1,
  "found" : true,
  "_source" : {
    "name" : "Jane Doe",
    "age" : 25
  }
}
```

## 문서 삭제

```bash
# 기존 명령어
DELETE /customer/external/2?pretty

# 변경된 명령어
DELETE /customer/_doc/1?pretty

GET /customer/_doc/1?pretty
```

```bash
{
  "_index" : "customer",
  "_type" : "_doc",
  "_id" : "1",
  "found" : false
}
```
