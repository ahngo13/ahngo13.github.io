---
title: ElasticSearch 활용 - Index API
layout: post
date: '2020-10-05 17:59:00 +0300'
description: ElasticSearch 활용 - Index API
img: null
fig-caption: null
tags:
- es
- elasticsearch
- esindex
- esindexapi
- elasticsearchindexapi
---

# 기본 개념

## 클러스터

- 클러스터는 하나 이상의 노드(서버)가 모인 것

## 노드

- 노드는 클러스터에 포함된 단일 서버로서 데이터를 저장하고 클러스터의 색인화 및 검색 기능에 참여 (이름으로 식별)

## 인덱스

- 색인은 다소 비슷한 특성을 가진 문서의 모음

## 타입

- 하나의 색인에서 하나 이상의 유형을 정의할 수 있음

## 도큐먼트

- 문서는 색인화할 수 있는 기본 정보 단위

## 샤드

- 색인은 방대한 양의 데이터를 저장할 수 있는데, 이 데이터가 단일 노드의 하드웨어 한도를 초과할 수도 있으므로 이러한 문제를 해결하고자 색인을 이른바 샤드(shard)라는 조각으로 분할하는 기능을 제공

## 레플리카

- 복제본
- 샤드/노드 오류가 발생하더라도 고가용성을 제공
- 모든 리플리카에서 병렬 방식으로 검색을 실행할 수 있으므로 검색 볼륨/처리량을 확장할 수 있음

# 인덱스 관리(Index Management)

## 인덱스 생성(Create Index)

```bash
PUT /my-index-000001
```

```bash
{
  "acknowledged" : true,
  "shards_acknowledged" : true,
  "index" : "my-index-000001"
}
```

## 인덱스 세팅(Index Settings)

- 샤드와 레플리카 갯수 세팅
- 샤드 설정은 생성할 때 한번 지정하면 변경 불가
- 레플리카는 다이나믹하게 변경 가능

```bash
PUT /my-index-000001
{
  "settings": {
    "index": {
      "number_of_shards": 3,  
      "number_of_replicas": 2 
    }
  }
}

## 간단한 명령어
PUT /my-index-000001
{
  "settings": {
    "number_of_shards": 3,
    "number_of_replicas": 2
  }
}
```

## 인덱스 맵핑(Mappings)

- 데이터의 매핑이 자동으로 생성되기 전에 매핑을 정의해놓으면 매핑에 맞추어서 데이터 입력 가능

```bash
PUT /test
{
  "settings": {
    "number_of_shards": 1
  },
  "mappings": {
    "properties": {
      "field1": { "type": "text" }
    }
  }
}
```

## 인덱스 별명 (Aliases)

- index에 별명을 붙여주는 것

```bash
PUT /test
{
  "aliases": {
    "alias_1": {},
    "alias_2": {
      "filter": {
        "term": { "user.id": "kimchy" }
      },
      "routing": "shard-1"
    }
  }
}

GET /test
```

```bash
{
  "test" : {
    "aliases" : {
      "alias_1" : { },
      "alias_2" : {
        "filter" : {
          "term" : {
            "user.id" : "kimchy"
          }
        },
        "index_routing" : "shard-1",
        "search_routing" : "shard-1"
      }
    },
    "mappings" : { },
    "settings" : {
      "index" : {
        "creation_date" : "1601873312529",
        "number_of_shards" : "1",
        "number_of_replicas" : "1",
        "uuid" : "0SoRYG7ySPuin83QjgDbYQ",
        "version" : {
          "created" : "7090299"
        },
        "provided_name" : "test"
      }
    }
  }
}
```

## 인덱스 삭제(Delete Index)

```bash
DELETE /test
```

## 인덱스 별명 삭제(Delete Index alias)

```bash
DELETE /test/_alias/alias_2
GET /test
```

```bash
{
  "test" : {
    "aliases" : {
      "alias_1" : { }
    },
    "mappings" : { },
    "settings" : {
      "index" : {
        "creation_date" : "1601873897961",
        "number_of_shards" : "1",
        "number_of_replicas" : "1",
        "uuid" : "BIbcBFRVSBKDyly1SiIwjA",
        "version" : {
          "created" : "7090299"
        },
        "provided_name" : "test"
      }
    }
  }
}
```

## 인덱스 조회(Get Index)

```bash
GET /test
```

```bash
{
  "test" : {
    "aliases" : {
      "alias_1" : { }
    },
    "mappings" : { },
    "settings" : {
      "index" : {
        "creation_date" : "1601873897961",
        "number_of_shards" : "1",
        "number_of_replicas" : "1",
        "uuid" : "BIbcBFRVSBKDyly1SiIwjA",
        "version" : {
          "created" : "7090299"
        },
        "provided_name" : "test"
      }
    }
  }
}
```

## 인덱스 존재 유무 확인(Index exists)

- 200의 경우 존재, 404의 경우 존재하지 않음을 의미

```bash
HEAD /test
```

```bash
200 - OK
```

## 인덱스 닫기(Close Index)

- 읽기와 쓰기 블록 처리

```bash
POST /test/_close

POST /test/_doc/1
{
  "name" : "hamletshu"
}
```

```bash
{
  "error" : {
    "root_cause" : [
      {
        "type" : "index_closed_exception",
        "reason" : "closed",
        "index_uuid" : "BIbcBFRVSBKDyly1SiIwjA",
        "index" : "test"
      }
    ],
    "type" : "index_closed_exception",
    "reason" : "closed",
    "index_uuid" : "BIbcBFRVSBKDyly1SiIwjA",
    "index" : "test"
  },
  "status" : 400
}
```

## 인덱스 열기(Open Index)

- 닫힌 인덱스 열기

```bash
POST /test/_open

POST /test/_doc/1
{
  "name" : "hamletshu"
}
```

```bash
{
  "_index" : "test",
  "_type" : "_doc",
  "_id" : "1",
  "_version" : 1,
  "result" : "craeted",
  "_shards" : {
    "total" : 2,
    "successful" : 2,
    "failed" : 0
  },
  "_seq_no" : 6,
  "_primary_term" : 3
}
```

## 인덱스 복제(Clone Index)

- `index.blocks.write` 설정이 true로 되어있어야 복제 가능

```bash
PUT /test/_settings
{
  "settings":{
    "index.blocks.write":true
  }
}

POST /test/_clone/test2
```

## 인덱스 동결(Freeze Index)

- 동결할 경우 읽기만 가능

```bash
POST /test/_freeze

POST /test/_doc/2
{
  "name" : "hamletshu"
}
```

```bash
{
  "error" : {
    "root_cause" : [
      {
        "type" : "cluster_block_exception",
        "reason" : "index [test] blocked by: [FORBIDDEN/8/index write (api)];"
      }
    ],
    "type" : "cluster_block_exception",
    "reason" : "index [test] blocked by: [FORBIDDEN/8/index write (api)];"
  },
  "status" : 403
}
```

## 인덱스 동결 해제(Unfreeze Index)

```bash
{
  "_index" : "test",
  "_type" : "_doc",
  "_id" : "2",
  "_version" : 1,
  "result" : "created",
  "_shards" : {
    "total" : 2,
    "successful" : 2,
    "failed" : 0
  },
  "_seq_no" : 7,
  "_primary_term" : 7
}
```

```bash
POST /test/_unfreeze

POST /test/_doc/2
{
  "name" : "hamletshu"
}
```

## 여러 인덱스 조회(Resolve Index)

```bash
GET /_resolve/index/test*
```

```bash
{
  "indices" : [
    {
      "name" : "test",
      "aliases" : [
        "alias_1"
      ],
      "attributes" : [
        "open"
      ]
    },
    {
      "name" : "test2",
      "attributes" : [
        "open"
      ]
    }
  ],
  "aliases" : [ ],
  "data_streams" : [ ]
}
```

# 맵핑 관리(Mapping Management)

## Put mapping

- 맵핑 정의

```bash
PUT /test/_mapping
{
  "properties": {
    "email": {
      "type": "keyword"
    }
  }
}
```

## Get mapping

- 맵핑 정보 조회

```bash
GET /test/_mapping

## 아래의 명령어로 전체 조회도 가능
GET /*/_mapping

GET /_all/_mapping

GET /_mapping
```

```bash
{
  "test" : {
    "mappings" : {
      "properties" : {
        "email" : {
          "type" : "keyword"
        },
        "name" : {
          "type" : "text",
          "fields" : {
            "keyword" : {
              "type" : "keyword",
              "ignore_above" : 256
            }
          }
        }
      }
    }
  }
}
```

## Get field mapping

- 해당 필드에 해당하는 매핑정보 확인

```bash
GET /test/_mapping/field/email
```

```bash
{
  "test" : {
    "mappings" : {
      "email" : {
        "full_name" : "email",
        "mapping" : {
          "email" : {
            "type" : "keyword"
          }
        }
      }
    }
  }
}
```

# 별명 관리(Alias Management)

## Add Index Alias

`PUT /<index>/_alias/<alias>`

`POST /<index>/_alias/<alias>`

`PUT /<index>/_aliases/<alias>`

`POST /<index>/_aliases/<alias>`

```bash
PUT /test/_alias/alias1

GET /test/_alias
GET /test/_alias/alias1
```

```bash
{
  "test" : {
    "aliases" : {
      "alias1" : { },
      "alias2" : { },
      "alias_1" : { }
    }
  }
}

{
  "test" : {
    "aliases" : {
      "alias1" : { }
    }
  }
}
```

## Delete Index Alias

```bash
DELETE /test/_alias/alias1

GET /test/_alias
```

```bash
{
  "test" : {
    "aliases" : {
      "alias2" : { },
      "alias_1" : { }
    }
  }
}
```

## Get Index Alias

`GET /_alias`

`GET /_alias/<alias>`

`GET /<index>/_alias/<alias>`

```bash
GET /test/_alias

GET /test/_alias/alias2
```

```bash
{
  "test" : {
    "aliases" : {
      "alias2" : { },
      "alias_1" : { }
    }
  }
}

{
  "test" : {
    "aliases" : {
      "alias2" : { }
    }
  }
}
```

## Index Alias Exists

- Alias 존재 여부 확인

`HEAD /_alias/<alias>`

`HEAD /<index>/_alias/<alias>`

```bash
HEAD /test/_alias

HEAD /test/_alias/alias2
```

```bash
200 - OK

200 - OK
```

## Update Index Alias

```bash
POST /_aliases
{
  "actions" : [
    { "add" : { "index" : "test", "alias" : "alias1" } }
  ]
}

GET /test/_alias/alias1
```

```bash
{
  "test" : {
    "aliases" : {
      "alias1" : { }
    }
  }
}
```

# Index Templates

- 새로운 인덱스를 생성할 때 자동으로 Settings, Mappings, Aliases을 하게해주는 기능을 가짐

## Put index template

- 인덱스 템플릿 생성

```bash
PUT /_index_template/template_1?pretty
{
  "index_patterns" : ["te*"],
  "priority" : 1,
  "template": {
    "settings" : {
      "number_of_shards" : 2
    }
  }
}
```

## Get index template

- 인덱스 템플릿 조회

```bash
GET /_index_template/template_1
```

```bash
{
  "index_templates" : [
    {
      "name" : "template_1",
      "index_template" : {
        "index_patterns" : [
          "te*"
        ],
        "template" : {
          "settings" : {
            "index" : {
              "number_of_shards" : "2"
            }
          }
        },
        "composed_of" : [ ],
        "priority" : 1
      }
    }
  ]
}
```

## Delete index template

- 인덱스 템플릿 삭제

```bash
DELETE /_index_template/template_1

GET /_index_template/template_1
```

```bash
{
  "error" : {
    "root_cause" : [
      {
        "type" : "resource_not_found_exception",
        "reason" : "index template matching [template_1] not found"
      }
    ],
    "type" : "resource_not_found_exception",
    "reason" : "index template matching [template_1] not found"
  },
  "status" : 404
}
```

## Put component template

- 컴포넌트 템플릿 생성

```bash
PUT /_component_template/template_1?pretty
{
  "template": {
    "settings": {
      "number_of_shards": 1
    },
    "mappings": {
      "_source": {
        "enabled": false
      },
      "properties": {
        "host_name": {
          "type": "keyword"
        },
        "created_at": {
          "type": "date",
          "format": "EEE MMM dd HH:mm:ss Z yyyy"
        }
      }
    }
  }
}
```

## Delete component template

- 컴포넌트 템플릿 삭제

```bash
DELETE /_component_template/template_1
```

## Index template exists

- 인덱스 템플릿 존재여부 확인

```bash
HEAD /_template/template_1
```
