---
title: ElasticSearch 활용 - Document API
layout: post
date: '2020-10-05 18:00:00 +0300'
description: ElasticSearch 활용 - Document API
img: null
fig-caption: null
tags:
- es
- elasticsearch
- esdocument
- esdocumentapi
- elasticsearchdocumentapi
---

# Single document APIs

## Index

`PUT /<target>/_doc/<_id>`

`POST /<target>/_doc/`

`PUT /<target>/_create/<_id>` : 덮어쓰기 방지

`POST /<target>/_create/<_id>` : 덮어쓰기 방지

```bash
PUT test_index/_doc/1
{
  "name":"Siu Ahn",
  "message":"Hello Elasticsearch"
}

PUT test_index/_create/1
{
  "name":"Siu Ahn",
  "message":"Hello Elasticsearch"
}
```

## Get

`GET <index>/_doc/<_id>`

`HEAD <index>/_doc/<_id>`

`GET <index>/_source/<_id>`

`HEAD <index>/_source/<_id>`

```bash
GET test_index/_doc/1
HEAD test_index/_doc/1
GET test_index/_source/1
HEAD test_index/_source/1
```

```bash
{
  "_index" : "test_index",
  "_type" : "_doc",
  "_id" : "1",
  "_version" : 3,
  "_seq_no" : 2,
  "_primary_term" : 1,
  "found" : true,
  "_source" : {
    "name" : "Siu Ahn",
    "message" : "Hello Elasticsearch"
  }
}

200 - OK

{
  "name" : "Siu Ahn",
  "message" : "Hello Elasticsearch"
}

200 - OK
```

## Delete

`DELETE /<index>/_doc/<_id>`

```bash
DELETE /test_index/_doc/1
GET test_index/_source/1
```

```bash
{
  "error" : {
    "root_cause" : [
      {
        "type" : "resource_not_found_exception",
        "reason" : "Document not found [test_index]/[_doc]/[1]"
      }
    ],
    "type" : "resource_not_found_exception",
    "reason" : "Document not found [test_index]/[_doc]/[1]"
  },
  "status" : 404
}
```

## Delete by query

`POST /<target>/_delete_by_query`

```bash
PUT test_index/_doc/1
{
  "name":"Siu Ahn",
  "message":"Hello Elasticsearch"
}

POST /test_index/_delete_by_query
{
  "query": {
    "match": {
      "name": "Siu Ahn"
    }
  }
}

HEAD test_index/_source/1
```

```bash
{"statusCode":404,"error":"Not Found","message":"404 - Not Found"}
```

## Update

`POST /<index>/_update/<_id>`

```bash
PUT test_index/_doc/1
{
  "name":"Siu Ahn",
  "message":"Hello Elasticsearch"
}

POST /test_index/_update/1
{
  "doc":{
    "name" : "SiWoo Ahn"  
  }
}

GET test_index/_source/1
```

```bash
{
  "name" : "SiWoo Ahn",
  "message" : "Hello Elasticsearch"
}
```

# Multi-document APIs

## Multi get

`GET /<index>/_mget`

```bash
GET /test_index/_mget
{
  "docs": [
    {
      "_id": "1"
    },
    {
      "_id": "2"
    }
  ]
}
```

```bash
{
  "docs" : [
    {
      "_index" : "test_index",
      "_type" : "_doc",
      "_id" : "1",
      "_version" : 2,
      "_seq_no" : 9,
      "_primary_term" : 1,
      "found" : true,
      "_source" : {
        "name" : "SiWoo Ahn",
        "message" : "Hello Elasticsearch"
      }
    },
    {
      "_index" : "test_index",
      "_type" : "_doc",
      "_id" : "2",
      "found" : false
    }
  ]
}
```

## Bulk

`POST /_bulk`

`POST /<target>/_bulk`

```bash
POST /_bulk?pretty
{ "index" : { "_index" : "test", "_id" : "1" } }
{ "field1" : "value1" }
{ "delete" : { "_index" : "test", "_id" : "2" } }
{ "create" : { "_index" : "test", "_id" : "3" } }
{ "field1" : "value3" }
{ "update" : {"_id" : "1", "_index" : "test"} }
{ "doc" : {"field2" : "value2"} }
```

```bash
{
  "took" : 287,
  "errors" : false,
  "items" : [
    {
      "index" : {
        "_index" : "test",
        "_type" : "_doc",
        "_id" : "1",
        "_version" : 7,
        "result" : "updated",
        "_shards" : {
          "total" : 2,
          "successful" : 2,
          "failed" : 0
        },
        "_seq_no" : 8,
        "_primary_term" : 7,
        "status" : 200
      }
    },
    {
      "delete" : {
        "_index" : "test",
        "_type" : "_doc",
        "_id" : "2",
        "_version" : 2,
        "result" : "deleted",
        "_shards" : {
          "total" : 2,
          "successful" : 2,
          "failed" : 0
        },
        "_seq_no" : 9,
        "_primary_term" : 7,
        "status" : 200
      }
    },
    {
      "create" : {
        "_index" : "test",
        "_type" : "_doc",
        "_id" : "3",
        "_version" : 1,
        "result" : "created",
        "_shards" : {
          "total" : 2,
          "successful" : 2,
          "failed" : 0
        },
        "_seq_no" : 10,
        "_primary_term" : 7,
        "status" : 201
      }
    },
    {
      "update" : {
        "_index" : "test",
        "_type" : "_doc",
        "_id" : "1",
        "_version" : 8,
        "result" : "updated",
        "_shards" : {
          "total" : 2,
          "successful" : 2,
          "failed" : 0
        },
        "_seq_no" : 11,
        "_primary_term" : 7,
        "status" : 200
      }
    }
  ]
}
```

## Reindex

- 존재하는 인덱스의 문서 복사

```bash
POST _reindex
{
  "source": {
    "index": "test_index"
  },
  "dest": {
    "index": "test_new_index"
  }
}

GET /test_new_index/_doc/1
```

```bash
{
  "_index" : "test_new_index",
  "_type" : "_doc",
  "_id" : "1",
  "_version" : 1,
  "_seq_no" : 0,
  "_primary_term" : 1,
  "found" : true,
  "_source" : {
    "name" : "SiWoo Ahn",
    "message" : "Hello Elasticsearch"
  }
}
```

## Term vectors

`GET /<index>/_termvectors/<_id>`

```bash
GET /test_index/_termvectors/1?fields=name
```

```bash
{
  "_index" : "test_index",
  "_type" : "_doc",
  "_id" : "1",
  "_version" : 2,
  "found" : true,
  "took" : 13,
  "term_vectors" : {
    "name" : {
      "field_statistics" : {
        "sum_doc_freq" : 4,
        "doc_count" : 2,
        "sum_ttf" : 4
      },
      "terms" : {
        "ahn" : {
          "term_freq" : 1,
          "tokens" : [
            {
              "position" : 1,
              "start_offset" : 6,
              "end_offset" : 9
            }
          ]
        },
        "siwoo" : {
          "term_freq" : 1,
          "tokens" : [
            {
              "position" : 0,
              "start_offset" : 0,
              "end_offset" : 5
            }
          ]
        }
      }
    }
  }
}
```

## Multi term vectors

`POST /_mtermvectors`

`POST /<index>/_mtermvectors`

```bash
POST /_mtermvectors?pretty
{
   "docs": [
      {
         "_index": "test_index",
         "_id": "2",
         "term_statistics": true
      },
      {
         "_index": "test_index",
         "_id": "2",
         "fields": [
            "name"
         ]
      }
   ]
}
```

```bash
{
  "docs" : [
    {
      "_index" : "test_index",
      "_type" : "_doc",
      "_id" : "2",
      "_version" : 1,
      "found" : true,
      "took" : 0,
      "term_vectors" : { }
    },
    {
      "_index" : "test_index",
      "_type" : "_doc",
      "_id" : "2",
      "_version" : 1,
      "found" : true,
      "took" : 0,
      "term_vectors" : {
        "name" : {
          "field_statistics" : {
            "sum_doc_freq" : 8,
            "doc_count" : 4,
            "sum_ttf" : 8
          },
          "terms" : {
            "ahn" : {
              "term_freq" : 1,
              "tokens" : [
                {
                  "position" : 1,
                  "start_offset" : 4,
                  "end_offset" : 7
                }
              ]
            },
            "siu" : {
              "term_freq" : 1,
              "tokens" : [
                {
                  "position" : 0,
                  "start_offset" : 0,
                  "end_offset" : 3
                }
              ]
            }
          }
        }
      }
    }
  ]
}
```
