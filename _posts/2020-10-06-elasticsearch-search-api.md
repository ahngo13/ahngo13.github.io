---
title: ElasticSearch 활용 - Search API
layout: post
date: '2020-10-05 17:59:00 +0300'
description: ElasticSearch 활용 - Search API
img: null
fig-caption: null
tags:
- es
- elasticsearch
- essearch
- essearchapi
- elasticsearchsearchapi
---

# 검색 질의 표현 방식

- URI 검색 : 전통적인 방식 (복잡한 쿼리 작성 불가)
    - 사용하기 불편, 가독성 떨어짐
- Request Body 검색 : Request Body에 조건을 표기 (ES가 제공하는 검색 API를 모두 활용하기 위해서는 이 방식을 사용하여야 함)

# Query DSL 쿼리의 구조

## 요청 구조

```bash
{
	"size" : ## 리턴받는 결과의 개수, 기본값은 10
	"from" : ## 몇번째 문서부터 가져올지 지정
	"timeout" : ## 결과를 받는데 걸리는 시간
	"_source" : {} ## 필요한 필드만 출력하고 싶을 때 사용
	"query" : {} ## 검색 조건문
	"aggs" : {} ## 통계 및 집계 데이터 사용시 활용
	"sort" : {} ## 문서 결과를 어떻게 출력할지 조건 설정
}
```

## 응답 구조

```bash
{
	"took" : ## 쿼리를 실행한 시간
	"timed_out" : ## 쿼리 시간이 초과할 경우
	"_shards" : { 
		"total" : ## 쿼리를 요청한 전체 샤드의 갯수
		"successful" : ## 성공적으로 응답한 샤드의 갯수
		"failed" : ## 실패한 샤드의 갯수
	}
	"hits" : { 
		"total" :  ## 매칭된 문서의 전체 개수 
		"max_score" :  ## 문서의 스코어 값 중 가장 높은 값
		"hits" : [] ## 각 문서의 정보와 스코어 값
	}
}
```

## Query Context

- 전문 검색 시 사용

## Filter Context

- 조건 검색 시 사용

# Core Search

## Search

`GET /<target>/_search` : 특정 인덱스 검색

`GET /_search` : 전체 검색

`POST /<target>/_search` : 특정 인덱스 검색

`POST /_search` : 전체 검색

```bash
GET /test_index/_search
```

```bash
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
      "value" : 3,
      "relation" : "eq"
    },
    "max_score" : 1.0,
    "hits" : [
      {
        "_index" : "test_index",
        "_type" : "_doc",
        "_id" : "1",
        "_score" : 1.0,
        "_source" : {
          "name" : "SiWoo Ahn",
          "message" : "Hello Elasticsearch"
        }
      },
      {
        "_index" : "test_index",
        "_type" : "_doc",
        "_id" : "2",
        "_score" : 1.0,
        "_source" : {
          "name" : "Siu Ahn",
          "message" : "Hello Elasticsearch"
        }
      },
      {
        "_index" : "test_index",
        "_type" : "_doc",
        "_id" : "3",
        "_score" : 1.0,
        "_source" : {
          "name" : "Siu Ahn",
          "message" : "Hello Elasticsearch"
        }
      }
    ]
  }
}
```

## Multi Search

- 검색 요청시 `,` 를 사용해서 여러개의 인덱스에서 조회할 수 있음
- 와일드 카드 사용 가능 `*` , `?`
- `from` , `size` 로 쿼리 결과 페이징 처리 가능
- `sort` 로 쿼리 결과 정렬 가능
- 실제 데이터는 `_source` 항목 아래에 존재

`GET /<target>/_msearch`

```bash
GET /test_index/_msearch?pretty
{ }
{"query" : {"match" : { "message": "this is a test"}}}
{"index": "test_index"}
{"query" : {"match_all" : {}}}
```

```bash
{
  "took" : 1,
  "responses" : [
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
          "value" : 0,
          "relation" : "eq"
        },
        "max_score" : null,
        "hits" : [ ]
      },
      "status" : 200
    },
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
          "value" : 3,
          "relation" : "eq"
        },
        "max_score" : 1.0,
        "hits" : [
          {
            "_index" : "test_index",
            "_type" : "_doc",
            "_id" : "1",
            "_score" : 1.0,
            "_source" : {
              "name" : "SiWoo Ahn",
              "message" : "Hello Elasticsearch"
            }
          },
          {
            "_index" : "test_index",
            "_type" : "_doc",
            "_id" : "2",
            "_score" : 1.0,
            "_source" : {
              "name" : "Siu Ahn",
              "message" : "Hello Elasticsearch"
            }
          },
          {
            "_index" : "test_index",
            "_type" : "_doc",
            "_id" : "3",
            "_score" : 1.0,
            "_source" : {
              "name" : "Siu Ahn",
              "message" : "Hello Elasticsearch"
            }
          }
        ]
      },
      "status" : 200
    }
  ]
}
```

## Async search

- 대용량의 데이터에 대해서 Query를 비동기적으로(Asyncronously) 실행시켜서 그 진행 상황을 모니터링해서 결과가 나오는 대로 리턴하는 형태의 동작을 지원

```bash
POST /sales*/_async_search?size=0
{
  "sort": [
    { "date": { "order": "asc" } }
  ],
  "aggs": {
    "sale_date": {
      "date_histogram": {
        "field": "date",
        "calendar_interval": "1d"
      }
    }
  }
}
```

```bash
{
  "id" : "FmRldE8zREVEUzA2ZVpUeGs2ejJFUFEaMkZ5QTVrSTZSaVN3WlNFVmtlWHJsdzoxMDc=", 
  "is_partial" : true, 
  "is_running" : true, 
  "start_time_in_millis" : 1583945890986,
  "expiration_time_in_millis" : 1584377890986,
  "response" : {
    "took" : 1122,
    "timed_out" : false,
    "num_reduce_phases" : 0,
    "_shards" : {
      "total" : 562, 
      "successful" : 3, 
      "skipped" : 0,
      "failed" : 0
    },
    "hits" : {
      "total" : {
        "value" : 157483, 
        "relation" : "gte"
      },
      "max_score" : null,
      "hits" : [ ]
    }
  }
}
```

```bash
GET /_async_search/FmRldE8zREVEUzA2ZVpUeGs2ejJFUFEaMkZ5QTVrSTZSaVN3WlNFVmtlWHJsdzoxMDc=
```

```bash
{
  "id" : "FmRldE8zREVEUzA2ZVpUeGs2ejJFUFEaMkZ5QTVrSTZSaVN3WlNFVmtlWHJsdzoxMDc=",
  "is_partial" : true, 
  "is_running" : true, 
  "start_time_in_millis" : 1583945890986,
  "expiration_time_in_millis" : 1584377890986, 
  "response" : {
    "took" : 12144,
    "timed_out" : false,
    "num_reduce_phases" : 46, 
    "_shards" : {
      "total" : 562, 
      "successful" : 188,
      "skipped" : 0,
      "failed" : 0
    },
    "hits" : {
      "total" : {
        "value" : 456433,
        "relation" : "eq"
      },
      "max_score" : null,
      "hits" : [ ]
    },
    "aggregations" : { 
      "sale_date" :  {
        "buckets" : []
      }
    }
  }
}
```

```bash
DELETE /_async_search/FmRldE8zREVEUzA2ZVpUeGs2ejJFUFEaMkZ5QTVrSTZSaVN3WlNFVmtlWHJsdzoxMDc=
```

# Search testing

## Explain

- 검색한 키워드와 검색 결과가 얼마나 유사한지 확인

`GET /<index>/_explain/<id>` 

`POST /<index>/_explain/<id>`

```bash
GET /test_index/_explain/2?pretty
{
  "query" : {
    "match" : { "rank" : 2 }
  }
}
```

```bash
{
  "_index" : "test_index",
  "_type" : "_doc",
  "_id" : "2",
  "matched" : false,
  "explanation" : {
    "value" : 0.0,
    "description" : "rank:[2 TO 2] doesn't match id 2",
    "details" : [ ]
  }
}
```

## Field capabilities

- 여러 인덱스 사이에서 필드의 기능을 검색

`GET /_field_caps?fields=<fields>`

`POST /_field_caps?fields=<fields>`

`GET /<target>/_field_caps?fields=<fields>`

`POST /<target>/_field_caps?fields=<fields>`

```bash
GET /_field_caps?fields=name
```

```bash
{
  "indices" : [
    ".apm-agent-configuration",
    ".apm-custom-link",
    ".kibana-event-log-7.9.2-000001",
    ".kibana_1",
    ".kibana_2",
    ".kibana_task_manager_1",
    ".kibana_task_manager_2",
    "customer",
    "index_test",
    "my-index-000001",
    "test",
    "test2",
    "test_index",
    "test_new_index"
  ],
  "fields" : {
    "name" : {
      "text" : {
        "type" : "text",
        "searchable" : true,
        "aggregatable" : false
      }
    }
  }
}
```

## Profile

- 특정 요청에 대한 느린 이유를 이해하고 개선하기 위한 정보 제공

```bash
GET /test_index/_search
{
  "profile": true,
  "query" : {
    "match" : { "rank" : 2}
  }
}
```

```bash
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
    "max_score" : 1.0,
    "hits" : [
      {
        "_index" : "test_index",
        "_type" : "_doc",
        "_id" : "1",
        "_score" : 1.0,
        "_source" : {
          "name" : "Siu Adhna",
          "message" : "Hello Elasticsearch",
          "rank" : 2
        }
      }
    ]
  },
  "profile" : {
    "shards" : [
      {
        "id" : "[DlP7xzBnTmqYsd7ZopEhhQ][test_index][0]",
        "searches" : [
          {
            "query" : [
              {
                "type" : "PointRangeQuery",
                "description" : "rank:[2 TO 2]",
                "time_in_nanos" : 20000,
                "breakdown" : {
                  "set_min_competitive_score_count" : 0,
                  "match_count" : 0,
                  "shallow_advance_count" : 0,
                  "set_min_competitive_score" : 0,
                  "next_doc" : 1200,
                  "match" : 0,
                  "next_doc_count" : 1,
                  "score_count" : 1,
                  "compute_max_score_count" : 0,
                  "compute_max_score" : 0,
                  "advance" : 1200,
                  "advance_count" : 1,
                  "score" : 2500,
                  "build_scorer_count" : 2,
                  "create_weight" : 900,
                  "shallow_advance" : 0,
                  "create_weight_count" : 1,
                  "build_scorer" : 14200
                }
              }
            ],
            "rewrite_time" : 1700,
            "collector" : [
              {
                "name" : "SimpleTopScoreDocCollector",
                "reason" : "search_top_hits",
                "time_in_nanos" : 21200
              }
            ]
          }
        ],
        "aggregations" : [ ]
      }
    ]
  }
}
```

## Ranking evaluation

- 검색 결과의 품질 평가 가능

`GET /<target>/_rank_eval`

`POST /<target>/_rank_eval`

```bash
GET /my-index-000001/_rank_eval
{
  "requests": [ ... ], ## 검색 요청 리스트                           
  "metric": { ## 계산할 항목                                   
    "mean_reciprocal_rank": { ... } ## 특정 항목 및 매개 변수              
  }
}
```

## Search Shards

- 검색 요청이 수행되는 노드 및 샤드에 대한 정보 확인

`GET /<index>/_search_shards`

```bash
GET /test_index/_search_shards
```

```bash
{
  "nodes" : {
    "DlP7xzBnTmqYsd7ZopEhhQ" : {
      "name" : "es02",
      "ephemeral_id" : "Op7yVs67ShGrskPyl2oVFQ",
      "transport_address" : "192.168.96.3:9300",
      "attributes" : {
        "ml.machine_memory" : "15805542400",
        "ml.max_open_jobs" : "20",
        "xpack.installed" : "true",
        "transform.node" : "true"
      }
    },
    "HaPUbWUNTEG_iJ8MMjPmWQ" : {
      "name" : "es01",
      "ephemeral_id" : "6am5xny6Scmlqhihnxx80Q",
      "transport_address" : "192.168.96.4:9300",
      "attributes" : {
        "ml.machine_memory" : "15805542400",
        "ml.max_open_jobs" : "20",
        "xpack.installed" : "true",
        "transform.node" : "true"
      }
    }
  },
  "indices" : {
    "test_index" : { }
  },
  "shards" : [
    [
      {
        "state" : "STARTED",
        "primary" : true,
        "node" : "DlP7xzBnTmqYsd7ZopEhhQ",
        "relocating_node" : null,
        "shard" : 0,
        "index" : "test_index",
        "allocation_id" : {
          "id" : "6AjzAIt0T1qkjXXeN5Z-yQ"
        }
      },
      {
        "state" : "STARTED",
        "primary" : false,
        "node" : "HaPUbWUNTEG_iJ8MMjPmWQ",
        "relocating_node" : null,
        "shard" : 0,
        "index" : "test_index",
        "allocation_id" : {
          "id" : "dwJE69SsRgq7aUvXwc_GGw"
        }
      }
    ]
  ]
}
```

## Validate

- 쿼리를 실행하기 전에 쿼리가 유효하게 작성됐는지 확인

`GET /<target>/_validate/<query>`

```bash
GET /test_index/_validate/query?q="SiU"
```

```bash
{
  "_shards" : {
    "total" : 1,
    "successful" : 1,
    "failed" : 0
  },
  "valid" : true
}
```
